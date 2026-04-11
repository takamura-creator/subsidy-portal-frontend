import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-owner-${Date.now()}@example.com`;
const TEST_PASSWORD = "testpass123";

test.describe("企業ユーザーフロー", () => {
  test("1. owner登録 → /my にリダイレクト", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByRole("heading", { name: "新規登録" })).toBeVisible();

    // Step 1: ロール選択（企業ユーザー）
    await page.getByText("企業ユーザー").click();

    // Step 2: 基本情報入力
    await page.getByLabel("メールアドレス").fill(TEST_EMAIL);
    await page.getByLabel("パスワード").fill(TEST_PASSWORD);
    await page.getByLabel(/会社名/).fill("テスト株式会社");
    await page.getByLabel("都道府県").selectOption("東京都");
    await page.getByRole("button", { name: "アカウントを作成" }).click();

    // リダイレクト確認
    await page.waitForURL(/\/auth\/login/);
  });

  test("2. ログイン → /my ダッシュボード表示", async ({ page }) => {
    // ログイン
    await page.goto("/auth/login");
    await page.getByLabel("メールアドレス").fill(TEST_EMAIL);
    await page.getByLabel("パスワード").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "ログイン" }).click();

    await page.waitForURL(/\/my/);

    // StatsCard 3枚確認
    await expect(page.getByText("申請中")).toBeVisible();
    await expect(page.getByText("承認済み")).toBeVisible();
    await expect(page.getByText("期限間近")).toBeVisible();

    // CTA確認
    await expect(page.getByText("新しい申請を作成")).toBeVisible();
  });

  test("3. /my/applications 申請一覧 — 空の場合", async ({ page }) => {
    await page.goto("/my/applications");

    // EmptyState表示
    await expect(page.getByText("まだ申請がありません")).toBeVisible();
  });

  test("4. /my/applications/new 申請ウィザード遷移", async ({ page }) => {
    await page.goto("/my/applications/new");

    // Step 1 表示確認
    await expect(page.getByText("会社情報")).toBeVisible();

    // Step 1 → Step 2 遷移
    await page.getByRole("button", { name: /次へ/ }).click();
    await expect(page.getByText("書類確認")).toBeVisible();

    // Step 2 → Step 3 遷移
    await page.getByRole("button", { name: /次へ/ }).click();
    await expect(page.getByText("PDF出力")).toBeVisible();
  });

  test("5. 下書き保存 → 申請一覧に表示", async ({ page }) => {
    await page.goto("/my/applications/new");

    // 下書き保存
    await page.getByRole("button", { name: /下書き保存/ }).click();

    // /my/applications にリダイレクト
    await page.waitForURL(/\/my\/applications/);

    // テーブルに1件以上のデータが表示される
    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });

  test("6. 申請詳細 — PDF出力ボタン存在", async ({ page }) => {
    await page.goto("/my/applications");

    // 最初の申請をクリック
    await page.locator("table tbody tr").first().click();

    // PDF出力ボタンの存在確認
    await expect(page.getByText(/PDF/)).toBeVisible();
  });

  test("7. /my/settings プロフィール更新", async ({ page }) => {
    await page.goto("/my/settings");

    // プロフィールフォーム表示
    await expect(page.getByLabel("会社名")).toBeVisible();

    // 会社名を変更
    await page.getByLabel("会社名").clear();
    await page.getByLabel("会社名").fill("テスト株式会社（更新）");
    await page.getByRole("button", { name: /保存/ }).click();

    // 成功メッセージまたは更新完了確認
    await expect(page.getByText(/保存|更新/)).toBeVisible();
  });

  test("8. /my/settings パスワード変更", async ({ page }) => {
    await page.goto("/my/settings");

    // パスワード変更フォーム
    await page.getByLabel("現在のパスワード").fill(TEST_PASSWORD);
    await page.getByLabel("新しいパスワード").fill("newpass12345");
    await page.getByLabel(/確認/).fill("newpass12345");
    await page.getByRole("button", { name: /パスワードを変更/ }).click();

    await expect(page.getByText(/変更しました/)).toBeVisible();
  });

  test("9. ログアウト → /auth/login にリダイレクト", async ({ page }) => {
    await page.goto("/my");

    // サイドバーのログアウトボタン
    await page.getByRole("button", { name: "ログアウト" }).click();

    await page.waitForURL(/\/auth\/login/);
  });
});
