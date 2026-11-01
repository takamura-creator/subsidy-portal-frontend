import { test, expect, type Page } from "@playwright/test";

/**
 * HP 自動取得のタイムアウト（2026-11-01 PR-C・設計書 docs/design/resilience.md §3 PR-C・D2）
 *
 * 旧: 既定の10秒で打ち切っていたため、backend が HP 取得（最大20秒）＋AI 読み取り中でも
 * 「タイムアウトしました」になっていた。60秒まで待つ。
 *
 * backend はすべて page.route の偽応答。本番 backend・Claude API は呼ばない。
 * 実行（届かない宛先で起動しておくと、偽応答を付け忘れた通信もすぐ失敗する）:
 *   NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000
 *   npx playwright test timeouts
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

/** 署名が不正なだけで、期限は未来・ロールは owner の JWT（画面側の同期チェックは通る） */
function forgedJwt(): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "e2e", email: "e2e@example.com", role: "owner", exp })}.invalid`;
}

async function openWizardStep1(page: Page, extractDelayMs: number) {
  await page.addInitScript((token) => {
    localStorage.setItem("access_token", token);
    localStorage.removeItem("hc_wizard_state_v2");
  }, forgedJwt());
  await page.route("**/api/auth/me", (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    return route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify({ email: "e2e@example.com" }) });
  });
  await page.route("**/api/extractions/homepage", async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    await new Promise((r) => setTimeout(r, extractDelayMs));
    return route.fulfill({
      status: 200,
      headers: CORS,
      contentType: "application/json",
      body: JSON.stringify({ extracted_fields: { company_name: "E2E 株式会社" }, fallback: false }),
    });
  });
  await page.goto("/my/wizard");
  await page.getByPlaceholder("https://example.co.jp").fill("https://example.co.jp");
}

test.describe("ウィザード Step1 の HP 自動取得", () => {
  test("応答に15秒かかっても打ち切らず、結果をフォームに反映する（旧: 10秒でタイムアウト）", async ({ page }) => {
    test.setTimeout(60_000);
    await openWizardStep1(page, 15_000);
    await page.getByRole("button", { name: /自動取得/ }).click();

    await expect(page.getByText(/件の情報を取得し/)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("タイムアウト", { exact: false })).toHaveCount(0);
  });

  test("取得中は待ち時間の目安を出す", async ({ page }) => {
    await openWizardStep1(page, 3_000);
    await page.getByRole("button", { name: /自動取得/ }).click();
    await expect(page.getByText("ホームページを読み取っています。最大60秒ほどかかります。")).toBeVisible();
    await expect(page.getByText(/件の情報を取得し/)).toBeVisible({ timeout: 15_000 });
  });
});
