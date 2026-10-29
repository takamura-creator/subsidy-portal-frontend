import { test, expect, type Page } from "@playwright/test";

/**
 * 未ログインの /results のサイドバーに、ユーザー欄（「ユーザー」）とログアウトを出さない
 *
 * 背景: サイドバーは /my・/admin・/results で共通。/results は公開ページなのに、
 * ログインの有無にかかわらず「ユーザー」の表示とログアウトボタンが出ていた
 * （/results がログインへ転送されていた間は見えなかった）。
 * 有効なトークンがあるログイン済みの人には、従来どおり名前とログアウトを出す。
 *
 * 実行: E2E_BASE_URL=http://localhost:3011 npx playwright test results-sidebar-guest
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

/** 署名は不正だが、画面側の判定（期限）だけを見る JWT。exp を秒で指定する */
function forgedJwt(expSecondsFromNow: number): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
    sub: "e2e",
    email: "e2e@example.com",
    role: "owner",
    company_name: "E2E-TEST 社",
    exp,
  })}.invalid-signature`;
}

/** サイドバー（ナビゲーションの「補助金実績一覧」を含む aside） */
function sidebar(page: Page) {
  return page.locator("aside", { has: page.getByRole("link", { name: "補助金実績一覧" }) });
}

async function openResults(page: Page) {
  await page.goto("/results");
  await page.waitForLoadState("networkidle");
  await expect(sidebar(page).getByRole("link", { name: "補助金実績一覧" })).toBeVisible();
}

/**
 * ログイン済みの状態を保つため、プロフィール取得（/api/auth/me）の応答を固定する。
 * 偽のトークンは本物の API に 401 で拒否され、その時点でセッションが終わってしまうため
 */
async function mockProfile(page: Page) {
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET, OPTIONS",
  };
  await page.route("**/api/auth/me", (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    return route.fulfill({
      status: 200,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify({ email: "e2e@example.com", company_name: "E2E-TEST 社" }),
    });
  });
}

test.describe("未ログインの /results のサイドバー", () => {
  test("トークンが無いとき、ユーザー欄とログアウトを出さずナビゲーションは出す", async ({ page }) => {
    await openResults(page);
    // 非同期のプロフィール取得が終わってから見る
    await page.waitForTimeout(2000);
    await expect(sidebar(page).getByText("ユーザー", { exact: true })).toHaveCount(0);
    await expect(sidebar(page).getByRole("button", { name: "ログアウト" })).toHaveCount(0);
    for (const name of ["東京都", "神奈川県", "補助金一覧", "補助金マッチング"]) {
      await expect(sidebar(page).getByRole("link", { name })).toBeVisible();
    }
  });

  test("期限切れのトークンが残っていても、ユーザー欄とログアウトを出さない", async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem("access_token", token);
    }, forgedJwt(-3600));
    await openResults(page);
    await page.waitForTimeout(2000);
    await expect(sidebar(page).getByText("ユーザー", { exact: true })).toHaveCount(0);
    await expect(sidebar(page).getByText("E2E-TEST 社")).toHaveCount(0);
    await expect(sidebar(page).getByRole("button", { name: "ログアウト" })).toHaveCount(0);
  });
});

test.describe("ログイン済み（有効期限内のトークン）のサイドバーは従来どおり", () => {
  test("名前とログアウトを出す", async ({ page }) => {
    await mockProfile(page);
    await page.addInitScript((token) => {
      localStorage.setItem("access_token", token);
    }, forgedJwt(3600));
    await openResults(page);
    await expect(sidebar(page).getByText("E2E-TEST 社")).toBeVisible();
    await expect(sidebar(page).getByRole("button", { name: "ログアウト" })).toBeVisible();
  });

  test("ログアウトを押すとトークンが消えてログイン画面へ移る", async ({ page }) => {
    await mockProfile(page);
    // addInitScript は遷移のたびにトークンを入れ直すので、ここでは使わず一度だけ書き込む
    await page.goto("/auth/login");
    await page.evaluate((token) => localStorage.setItem("access_token", token), forgedJwt(3600));
    await openResults(page);
    await sidebar(page).getByRole("button", { name: "ログアウト" }).click();
    await page.waitForURL(/\/auth\/login/);
    expect(await page.evaluate(() => localStorage.getItem("access_token"))).toBeNull();
  });
});
