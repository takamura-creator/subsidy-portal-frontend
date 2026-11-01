import { test, expect, type Page } from "@playwright/test";

/**
 * 診断結果カードの要件チェック・根拠・出典（2026-11-01 AI 判定の作り直し PR-3）
 *
 * - backend（takamura-creator/subsidy-portal#2 以降）が返す checks を ○／要確認 で出す
 * - AI の理由と、公式の説明文からの引用を出す。出典（公式ページ）と最終確認日を出す
 * - 項目を返さない backend では従来どおり（何も足さない）
 * - 出典 URL が http(s) でなければリンクにしない
 *
 * backend はすべて page.route の偽応答。本番 backend・Claude API は呼ばない。
 * 実行: NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000 → npx playwright test match-evidence
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

const MATCH_QUERY = new URLSearchParams({
  industry: "自治会・町会",
  employees: "1〜5名",
  prefecture: "静岡県",
  purpose: "防犯",
}).toString();

const SUBSIDY = {
  id: "e2e-evidence",
  name: "E2E 根拠付きの補助金",
  category: "防犯",
  ministry: "E2E 市",
  pref_code: "22",
  prefecture: "静岡県",
  max_amount: 100000,
  rate_min: 0.5,
  rate_max: 0.5,
  target_industries: ["自治会・町会"],
  max_employees: null,
  deadline: "2099-12-31",
  status: "open",
  description: "市内の自治会が新たに購入・設置する防犯カメラを支援。",
  application_tips: "実績報告は年度末までに提出。",
  source_url: "https://example.com/official",
  camera_eligibility: "confirmed",
  indirect: false,
};

const CHECKS = [
  { key: "area", label: "対象地域", status: "met", detail: "静岡県の制度" },
  { key: "applicant", label: "申請できる人", status: "met", detail: "自治会・町会が対象" },
  { key: "status", label: "受付状況", status: "unknown", detail: "締切を確認できていません" },
  { key: "camera", label: "カメラが補助対象か", status: "met", detail: "公式資料で確認済み" },
  { key: "direct", label: "直接申請できるか", status: "met", detail: "利用者が申請します" },
];

async function mockMatch(page: Page, match: Record<string, unknown>) {
  await page.route("**/api/subsidies/match", (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    return route.fulfill({
      status: 200,
      headers: CORS,
      contentType: "application/json",
      body: JSON.stringify({
        input_params: {},
        overall_recommendation: "",
        fallback: false,
        matches: [
          {
            subsidy: SUBSIDY,
            match_score: "中",
            estimated_cost: 200000,
            estimated_after_subsidy: 100000,
            application_advice: "設置の前に市の窓口へ相談してください。",
            ...match,
          },
        ],
      }),
    });
  });
}

test.describe("診断結果カードの要件チェックと根拠", () => {
  test("要件チェック（○／要確認）・理由・引用・出典・最終確認日を出す", async ({ page }) => {
    await mockMatch(page, {
      checks: CHECKS,
      fit_reason: "自治会の防犯カメラ設置が対象で、目的に合います。",
      evidence_quote: "市内の自治会が新たに購入・設置する防犯カメラを支援。",
      checked_at: "2026-10-27",
    });
    await page.goto(`/match/results?${MATCH_QUERY}`);

    const evidence = page.getByTestId("match-evidence");
    await expect(evidence).toBeVisible({ timeout: 20000 });

    const checks = evidence.getByTestId("match-check");
    await expect(checks).toHaveCount(5);
    await expect(evidence.locator('[data-testid="match-check"][data-status="unknown"]')).toContainText(
      "受付状況（要確認） 締切を確認できていません",
    );
    await expect(evidence.locator('[data-testid="match-check"][data-status="met"]')).toHaveCount(4);

    await expect(evidence.getByTestId("match-fit-reason")).toHaveText("自治会の防犯カメラ設置が対象で、目的に合います。");
    await expect(evidence.getByTestId("match-evidence-quote")).toContainText(
      "公式の説明より：「市内の自治会が新たに購入・設置する防犯カメラを支援。」",
    );
    const link = evidence.getByRole("link", { name: /公式ページ/ });
    await expect(link).toHaveAttribute("href", "https://example.com/official");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(evidence.getByTestId("match-source")).toContainText("最終確認日 2026年10月27日");
    // 助言は従来の場所にそのまま
    await expect(page.getByText("設置の前に市の窓口へ相談してください。")).toBeVisible();
  });

  test("カメラ・直接申請の要確認は印だけ（詳しい説明は既存の注記が出す・同じ文を2回出さない）", async ({ page }) => {
    await mockMatch(page, {
      subsidy: { ...SUBSIDY, camera_eligibility: "unconfirmed" },
      checks: CHECKS.map((c) =>
        c.key === "camera" ? { ...c, status: "unknown", detail: "カメラ機器が補助対象か、公式資料で確認できていません" } : c,
      ),
    });
    await page.goto(`/match/results?${MATCH_QUERY}`);

    const camera = page.locator('[data-testid="match-check"][data-status="unknown"]', { hasText: "カメラが補助対象か" });
    await expect(camera).toBeVisible({ timeout: 20000 });
    await expect(camera).toHaveText(/カメラが補助対象か（要確認）$/);
    await expect(page.getByTestId("camera-eligibility-note")).toBeVisible();
  });

  test("項目を返さない backend では従来どおり（要件チェック・根拠を出さない）", async ({ page }) => {
    await mockMatch(page, {});
    await page.goto(`/match/results?${MATCH_QUERY}`);
    await expect(page.getByText("E2E 根拠付きの補助金").first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId("match-evidence")).toHaveCount(0);
  });

  test("AI の説明が無い（簡易判定）ときは要件チェックと出典だけ出す", async ({ page }) => {
    await mockMatch(page, { checks: CHECKS, fit_reason: null, evidence_quote: null, checked_at: "2026-10-27" });
    await page.goto(`/match/results?${MATCH_QUERY}`);
    const evidence = page.getByTestId("match-evidence");
    await expect(evidence).toBeVisible({ timeout: 20000 });
    await expect(evidence.getByTestId("match-check")).toHaveCount(5);
    await expect(evidence.getByTestId("match-fit-reason")).toHaveCount(0);
    await expect(evidence.getByTestId("match-evidence-quote")).toHaveCount(0);
    await expect(evidence.getByTestId("match-source")).toContainText("最終確認日");
  });

  test("出典 URL が http(s) でなければリンクにしない", async ({ page }) => {
    await mockMatch(page, {
      subsidy: { ...SUBSIDY, source_url: "javascript:alert(1)" },
      checks: CHECKS,
      checked_at: "2026-10-27",
    });
    await page.goto(`/match/results?${MATCH_QUERY}`);
    const evidence = page.getByTestId("match-evidence");
    await expect(evidence).toBeVisible({ timeout: 20000 });
    await expect(evidence.getByRole("link")).toHaveCount(0);
    await expect(evidence.getByTestId("match-source")).toHaveText("最終確認日 2026年10月27日");
  });
});

test.describe("受付前（来年度分）の制度（2026-11-01 決定 1-A）", () => {
  test("事前相談の締切と受付前の注記を出す", async ({ page }) => {
    await mockMatch(page, {
      subsidy: {
        ...SUBSIDY,
        status: "upcoming",
        deadline: "令和9年度分：事前相談は2099年8月31日まで",
        prior_consultation_until: "2099-08-31",
      },
      checks: CHECKS.map((c) =>
        c.key === "status" ? { ...c, status: "unknown", detail: "受付前。事前相談・申込は2099年8月31日まで" } : c,
      ),
    });
    await page.goto(`/match/results?${MATCH_QUERY}`);
    const note = page.getByTestId("upcoming-note");
    await expect(note).toBeVisible({ timeout: 20000 });
    await expect(note).toHaveText("受付前の制度です。2099年8月31日までに、制度の窓口へ事前相談・申込をしてください。");
    await expect(page.getByText("事前相談の締切")).toBeVisible();
  });

  test("受付中の制度には出さない", async ({ page }) => {
    await mockMatch(page, { subsidy: { ...SUBSIDY, prior_consultation_until: "2099-08-31" }, checks: CHECKS });
    await page.goto(`/match/results?${MATCH_QUERY}`);
    await expect(page.getByTestId("match-evidence")).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId("upcoming-note")).toHaveCount(0);
    await expect(page.getByText("事前相談の締切")).toHaveCount(0);
  });
});
