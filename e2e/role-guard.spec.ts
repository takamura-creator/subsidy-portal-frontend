import { test, expect } from "@playwright/test";

/**
 * ロールガードテスト
 *
 * 前提: テスト実行前に以下のテストユーザーがDBに存在すること
 * - owner@test.com (role=owner, password=testpass123)
 * - contractor@test.com (role=contractor, password=testpass123)
 */

async function loginAs(
  page: import("@playwright/test").Page,
  email: string,
  password: string
) {
  await page.goto("/auth/login");
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  // ダッシュボードに到達するまで待機
  await page.waitForURL(/\/(my|biz)/);
}

test.describe("ロールガード", () => {
  test("1. ownerで/bizにアクセス → /myにリダイレクト", async ({ page }) => {
    await loginAs(page, "owner@test.com", "testpass123");

    // /biz にアクセス
    await page.goto("/biz");

    // /my にリダイレクトされる
    await page.waitForURL(/\/my/);
    await expect(page.url()).not.toContain("/biz");
  });

  test("2. contractorで/myにアクセス → /bizにリダイレクト", async ({ page }) => {
    await loginAs(page, "contractor@test.com", "testpass123");

    // /my にアクセス
    await page.goto("/my");

    // /biz にリダイレクトされる
    await page.waitForURL(/\/biz/);
    await expect(page.url()).not.toContain("/my");
  });

  test("3. 未ログインで/myにアクセス → /auth/loginにリダイレクト", async ({ page }) => {
    // localStorageをクリアして未ログイン状態を確保
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    });

    await page.goto("/my");

    await page.waitForURL(/\/auth\/login/);
    await expect(page.url()).toContain("returnUrl");
  });

  test("4. 未ログインで/bizにアクセス → /auth/loginにリダイレクト", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    });

    await page.goto("/biz");

    await page.waitForURL(/\/auth\/login/);
    await expect(page.url()).toContain("returnUrl");
  });
});
