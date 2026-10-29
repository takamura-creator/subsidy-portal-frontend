import { test, expect } from "@playwright/test";

/**
 * 公開ページ（/contact・/results）は未ログインでもログイン画面へ転送されない
 *
 * 背景: 会社名の自動補完のためのプロフィール取得（/api/auth/me）が 401 になると、
 * authFetch がログイン画面へ転送していた。公開ページでは転送せず、そのまま表示する。
 * 一方、ログイン必須の /my 系で 401 のときにログインへ転送する既存の動きは変えない。
 *
 * 実行: E2E_BASE_URL=http://localhost:3011 npx playwright test public-pages-no-login-redirect
 * （NEXT_PUBLIC_API_URL の先の backend を起動しておく）
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const PUBLIC_PATHS = [
  "/contact",
  "/results",
  `/results/${encodeURIComponent("神奈川県")}`,
];

/** 署名が不正なだけで、期限は未来・ロールは owner の JWT（画面側の同期チェックは通り、API は 401 を返す） */
function forgedJwt(): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
    sub: "e2e",
    email: "e2e@example.com",
    role: "owner",
    exp,
  })}.invalid-signature`;
}

test.describe("公開ページはログインへ転送されない", () => {
  for (const path of PUBLIC_PATHS) {
    test(`未ログインで ${decodeURIComponent(path)} を開く`, async ({ page }) => {
      await page.goto(path);
      // プロフィール取得の失敗（401）まで済むのを待ってから転送の有無を見る
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      expect(new URL(page.url()).pathname).toBe(path);
    });

    test(`期限切れ・不正なトークンが残っていても ${decodeURIComponent(path)} は転送されない`, async ({ page }) => {
      await page.addInitScript((token) => {
        localStorage.setItem("access_token", token);
      }, forgedJwt());
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      expect(new URL(page.url()).pathname).toBe(path);
    });
  }
});

test.describe("ログイン必須ページの 401 転送は従来どおり", () => {
  test("/my は未ログインならログインへ転送される", async ({ page }) => {
    await page.goto("/my");
    await page.waitForURL(/\/auth\/login/);
  });

  test("/my は不正なトークンで API が 401 を返すとログインへ転送される", async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem("access_token", token);
    }, forgedJwt());
    await page.goto("/my");
    await page.waitForURL(/\/auth\/login/, { timeout: 15_000 });
  });
});
