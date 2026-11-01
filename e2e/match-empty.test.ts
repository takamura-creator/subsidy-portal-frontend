import { test, expect, type Page } from "@playwright/test";

/**
 * 候補0件（backend 404）の表示（2026-11-01 中小企業向けの改善）
 *
 * - 事業者: 「単独で使える制度は少ない」と、商店街・商店会での申請／補助金一覧／相談の案内を出す
 * - 自治会・町会: 従来どおり（条件を変えて再度お試しください）
 *
 * backend はすべて page.route の偽応答。本番 backend・Claude API は呼ばない。
 * 実行: NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000 → npx playwright test match-empty
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

async function mock404(page: Page) {
  await page.route("**/api/subsidies/match", (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: CORS })
      : route.fulfill({
          status: 404,
          headers: CORS,
          contentType: "application/json",
          body: JSON.stringify({ detail: "条件に合う補助金が見つかりません" }),
        }),
  );
}

function query(industry: string) {
  return new URLSearchParams({ industry, employees: "21〜50名", prefecture: "東京都", purpose: "防犯" }).toString();
}

test.describe("候補0件の表示", () => {
  test("事業者（工場・製造業）には次の手の案内と3つの導線を出す", async ({ page }) => {
    await mock404(page);
    await page.goto(`/match/results?${query("工場・製造業")}`);

    const empty = page.getByTestId("match-empty");
    await expect(empty).toBeVisible({ timeout: 20000 });
    const guide = empty.getByTestId("match-empty-business");
    await expect(guide).toContainText("事業者が単独で防犯カメラの購入に使える補助金は、いまは多くありません。");
    await expect(guide).toContainText("商店街・商店会で申請する");
    await expect(guide).toContainText("受付前・締切後の制度も見る");
    await expect(guide).toContainText("専門スタッフに相談する");

    await expect(empty.getByRole("link", { name: "診断をやり直す" })).toHaveAttribute("href", "/match");
    await expect(empty.getByRole("link", { name: "補助金一覧を見る" })).toHaveAttribute(
      "href",
      `/subsidies?industry=${encodeURIComponent("工場・製造業")}`,
    );
    await expect(empty.getByRole("link", { name: "専門スタッフに相談する" })).toHaveAttribute("href", "/contact");
  });

  test("自治会・町会には従来どおりの表示（事業者向けの案内は出さない）", async ({ page }) => {
    await mock404(page);
    await page.goto(`/match/results?${query("自治会・町会")}`);

    const empty = page.getByTestId("match-empty");
    await expect(empty).toBeVisible({ timeout: 20000 });
    await expect(empty).toContainText("入力条件を変えて再度お試しください。");
    await expect(empty.getByTestId("match-empty-business")).toHaveCount(0);
    await expect(empty.getByRole("link", { name: "専門スタッフに相談する" })).toHaveCount(0);
  });

  test("自治体・街頭防犯（自治会・町会として送る）も従来どおり", async ({ page }) => {
    await mock404(page);
    await page.goto(`/match/results?${query("自治体・街頭防犯")}`);
    await expect(page.getByTestId("match-empty")).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId("match-empty-business")).toHaveCount(0);
  });
});
