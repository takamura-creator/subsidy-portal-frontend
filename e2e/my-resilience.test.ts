import { test, expect, type Page } from "@playwright/test";

/**
 * /my の失敗の見せ方とトークン更新（2026-11-01 PR-D・設計書 docs/design/resilience.md §3 PR-D）
 *
 * - 申請一覧の取得失敗を「0件（何も出ない）」にせず、読み込めなかったと出して再読み込みできる
 * - access token が期限切れでも refresh token があれば、先に1回だけ取り直してからログイン判定する
 * - 取り直した後の再送が 5xx 等で失敗しても、ログアウトしない（再送も 401 のときだけログアウト）
 *
 * backend はすべて page.route の偽応答。本番 backend は呼ばない。
 * 実行: NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000 → npx playwright test my-resilience
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
};

/** 署名が不正なだけの JWT。expOffsetSec が負なら期限切れ */
function forgedJwt(expOffsetSec: number): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expOffsetSec;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "e2e", email: "e2e@example.com", role: "owner", exp })}.invalid`;
}

type Reply = { status: number; body?: unknown };

/** pathname が一致する呼び出しへ順番に replies を返す（最後の1つを繰り返す）。呼ばれた回数を返す関数付き */
async function mockPath(page: Page, pathname: string, replies: Reply[]): Promise<() => number> {
  let calls = 0;
  await page.route(
    (url) => url.pathname === pathname,
    (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      const reply = replies[Math.min(calls, replies.length - 1)];
      calls += 1;
      return route.fulfill({
        status: reply.status,
        headers: CORS,
        contentType: "application/json",
        body: JSON.stringify(reply.body ?? { detail: "error" }),
      });
    },
  );
  return () => calls;
}

const APPS_OK: Reply = {
  status: 200,
  body: {
    total: 1,
    applications: [
      { id: "app-1", subsidy_id: "s-1", subsidy_name: "E2E 申請中の補助金", company_name: "E2E", status: "draft", created_at: "2026-11-01", updated_at: "2026-11-01" },
    ],
  },
};
const ME_OK: Reply = { status: 200, body: { email: "e2e@example.com", company_name: "E2E 株式会社" } };

async function setTokens(page: Page, access: string, refresh: string | null) {
  await page.addInitScript(
    ([a, r]) => {
      // 2回目以降の読み込み（ログイン画面への転送後など）で上書きしない
      if (sessionStorage.getItem("e2e_tokens_set")) return;
      sessionStorage.setItem("e2e_tokens_set", "1");
      localStorage.setItem("access_token", a as string);
      if (r) localStorage.setItem("refresh_token", r as string);
      else localStorage.removeItem("refresh_token");
    },
    [access, refresh],
  );
}

test.describe("/my の申請一覧", () => {
  test("取得に失敗したら「読み込めませんでした」を出し、もう一度読み込める", async ({ page }) => {
    await setTokens(page, forgedJwt(3600), null);
    await mockPath(page, "/api/auth/me", [ME_OK]);
    const apps = await mockPath(page, "/api/applications", [{ status: 503 }, APPS_OK]);

    await page.goto("/my");
    const error = page.getByTestId("my-apps-error");
    await expect(error).toBeVisible({ timeout: 20000 });
    await expect(error).toContainText("申請一覧を読み込めませんでした");
    await expect(page.getByText("ステータス", { exact: false })).toHaveCount(0);

    await error.getByRole("button", { name: "もう一度読み込む" }).click();
    await expect(page.getByText("E2E 申請中の補助金")).toBeVisible({ timeout: 10000 });
    await expect(error).toHaveCount(0);
    expect(apps()).toBe(2);
  });

  test("取得できたときは従来どおり一覧を出す（失敗表示は出ない）", async ({ page }) => {
    await setTokens(page, forgedJwt(3600), null);
    await mockPath(page, "/api/auth/me", [ME_OK]);
    await mockPath(page, "/api/applications", [APPS_OK]);
    await page.goto("/my");
    await expect(page.getByText("E2E 申請中の補助金")).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId("my-apps-error")).toHaveCount(0);
  });
});

test.describe("/my のトークン期限切れ", () => {
  test("access token が切れていても refresh token で取り直せれば、ログイン画面へ飛ばない", async ({ page }) => {
    await setTokens(page, forgedJwt(-60), "e2e-refresh");
    const refresh = await mockPath(page, "/api/auth/refresh", [
      { status: 200, body: { access_token: forgedJwt(3600), refresh_token: "e2e-refresh-2", token_type: "bearer" } },
    ]);
    await mockPath(page, "/api/auth/me", [ME_OK]);
    await mockPath(page, "/api/applications", [APPS_OK]);

    await page.goto("/my");
    await expect(page.getByText("E2E 申請中の補助金")).toBeVisible({ timeout: 20000 });
    expect(new URL(page.url()).pathname).toBe("/my");
    expect(refresh()).toBe(1);
    expect(await page.evaluate(() => localStorage.getItem("refresh_token"))).toBe("e2e-refresh-2");
  });

  test("取り直しに失敗したら、従来どおりログイン画面へ（戻り先付き）", async ({ page }) => {
    await setTokens(page, forgedJwt(-60), "e2e-refresh");
    await mockPath(page, "/api/auth/refresh", [{ status: 401 }]);
    await page.goto("/my");
    await page.waitForURL(/\/auth\/login\?returnUrl=%2Fmy/, { timeout: 20000 });
  });

  test("refresh token も無ければ、従来どおりすぐログイン画面へ", async ({ page }) => {
    await setTokens(page, forgedJwt(-60), null);
    const refresh = await mockPath(page, "/api/auth/refresh", [{ status: 200 }]);
    await page.goto("/my");
    await page.waitForURL(/\/auth\/login/, { timeout: 20000 });
    expect(refresh()).toBe(0);
  });
});

test.describe("authFetch の 401 → 取り直し → 再送", () => {
  test("再送が 5xx で失敗してもログアウトしない（旧: ログイン画面へ転送されていた）", async ({ page }) => {
    await setTokens(page, forgedJwt(3600), "e2e-refresh");
    await mockPath(page, "/api/auth/me", [ME_OK]);
    await mockPath(page, "/api/auth/refresh", [
      { status: 200, body: { access_token: forgedJwt(3600), refresh_token: "e2e-refresh-2", token_type: "bearer" } },
    ]);
    await mockPath(page, "/api/applications", [{ status: 401 }, { status: 503 }]);

    await page.goto("/my");
    await expect(page.getByTestId("my-apps-error")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).pathname).toBe("/my");
    expect(await page.evaluate(() => localStorage.getItem("access_token"))).not.toBeNull();
  });
});
