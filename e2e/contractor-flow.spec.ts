import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-contractor-${Date.now()}@example.com`;
const TEST_PASSWORD = "testpass123";

test.describe("工事業者フロー", () => {
  test("1. contractor登録 → /auth/login にリダイレクト", async ({ page }) => {
    await page.goto("/auth/register");

    // Step 1: ロール選択（工事業者）
    await page.getByText("工事業者").click();

    // Step 2: 基本情報入力
    await page.getByLabel("メールアドレス").fill(TEST_EMAIL);
    await page.getByLabel("パスワード").fill(TEST_PASSWORD);
    await page.getByLabel(/屋号/).fill("テスト設備工業");
    await page.getByLabel("都道府県").selectOption("大阪府");
    await page.getByRole("button", { name: "アカウントを作成" }).click();

    await page.waitForURL(/\/auth\/login/);
  });

  test("2. ログイン → /biz ダッシュボード表示", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("メールアドレス").fill(TEST_EMAIL);
    await page.getByLabel("パスワード").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "ログイン" }).click();

    await page.waitForURL(/\/biz/);

    // StatsCard 3枚確認
    await expect(page.getByText("新着案件")).toBeVisible();
    await expect(page.getByText("対応中")).toBeVisible();
    await expect(page.getByText("今月実績")).toBeVisible();
  });

  test("3. /biz/projects 案件一覧 — TabFilter動作", async ({ page }) => {
    await page.goto("/biz/projects");

    await expect(page.getByText("案件一覧")).toBeVisible();

    // タブフィルタ確認
    await expect(page.getByRole("tab", { name: "すべて" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "新着" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "対応中" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "完了" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "辞退" })).toBeVisible();

    // タブ切替
    await page.getByRole("tab", { name: "新着" }).click();
    await expect(page).toHaveURL(/status=new/);

    await page.getByRole("tab", { name: "完了" }).click();
    await expect(page).toHaveURL(/status=completed/);
  });

  test("4. /biz/profile プロフィール編集", async ({ page }) => {
    await page.goto("/biz/profile");

    // プロフィール編集フォーム表示
    await expect(page.getByText(/プロフィール/)).toBeVisible();

    // 対応エリア（AreaSelector）の存在確認
    await expect(page.getByText(/対応エリア/)).toBeVisible();

    // 資格（CertificationSelector）の存在確認
    await expect(page.getByText(/資格/)).toBeVisible();
  });

  test("5. /biz/settings 設定表示", async ({ page }) => {
    await page.goto("/biz/settings");

    // 設定ページ表示
    await expect(page.getByText(/アカウント設定/)).toBeVisible();

    // パスワード変更セクション
    await expect(page.getByText(/パスワード/)).toBeVisible();
  });

  test("6. ログアウト → /auth/login", async ({ page }) => {
    await page.goto("/biz");

    await page.getByRole("button", { name: "ログアウト" }).click();

    await page.waitForURL(/\/auth\/login/);
  });
});
