import { test, expect, type Page } from "@playwright/test";

/**
 * 設定ページのアカウント削除（2026-11-01）
 *
 * 旧実装は /my/settings で削除に成功しても、ブラウザにトークン・ウィザードの状態を残したままトップへ移っていた。
 * 削除に成功したら消す（logout() と同じ clearSession()）。失敗したら何も消さない。
 *
 * backend はすべて page.route の偽応答。本番 backend は呼ばない（実際にアカウントは消えない）。
 * 実行: NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000 → npx playwright test account-delete
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, PUT, DELETE, OPTIONS",
};

const KEYS = ["access_token", "refresh_token", "hc_wizard_state_v2"] as const;

function forgedJwt(): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "e2e", email: "e2e@example.com", role: "owner", exp })}.invalid`;
}

/** 初回の読み込みだけトークンとウィザードの状態を置き、/api/auth/me を偽応答にする。DELETE の回数を返す */
async function setup(page: Page, deleteStatus: number): Promise<() => number> {
  await page.addInitScript((token) => {
    if (sessionStorage.getItem("e2e_seeded")) return;
    sessionStorage.setItem("e2e_seeded", "1");
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", "e2e-refresh");
    localStorage.setItem("hc_wizard_state_v2", JSON.stringify({ step: 1, state: { company: { companyName: "前のユーザー" } } }));
  }, forgedJwt());
  let deletes = 0;
  await page.route(
    (url) => url.pathname === "/api/auth/me",
    (route) => {
      const method = route.request().method();
      if (method === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      if (method === "DELETE") {
        deletes += 1;
        return route.fulfill({
          status: deleteStatus,
          headers: CORS,
          contentType: "application/json",
          body: JSON.stringify(deleteStatus < 300 ? { ok: true } : { detail: "パスワードが違います" }),
        });
      }
      return route.fulfill({
        status: 200,
        headers: CORS,
        contentType: "application/json",
        body: JSON.stringify({ email: "e2e@example.com", company_name: "E2E 株式会社" }),
      });
    },
  );
  // prompt（パスワード）・confirm（最終確認）は進め、alert は閉じる
  page.on("dialog", (dialog) => (dialog.type() === "prompt" ? dialog.accept("e2e-password") : dialog.accept()));
  return () => deletes;
}

const storedKeys = (page: Page) =>
  page.evaluate((keys) => keys.filter((k) => localStorage.getItem(k) !== null), [...KEYS]);

test.describe("設定ページのアカウント削除", () => {
  test("削除に成功したら、トークンとウィザードの状態を消してトップへ移る", async ({ page }) => {
    const deletes = await setup(page, 200);
    await page.goto("/my/settings?tab=security");
    await page.getByRole("button", { name: "アカウントを削除する" }).click();
    await page.waitForURL((url) => url.pathname === "/");
    expect(deletes()).toBe(1);
    expect(await storedKeys(page)).toEqual([]);
  });

  test("削除に失敗したら、何も消さずに設定ページに残る", async ({ page }) => {
    const deletes = await setup(page, 400);
    await page.goto("/my/settings?tab=security");
    const alertShown = page.waitForEvent("dialog", (d) => d.type() === "alert");
    await page.getByRole("button", { name: "アカウントを削除する" }).click();
    await alertShown;
    expect(deletes()).toBe(1);
    await expect(page).toHaveURL(/\/my\/settings/);
    expect(await storedKeys(page)).toEqual([...KEYS]);
  });
});
