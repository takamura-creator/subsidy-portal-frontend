import { test, expect, type Page } from "@playwright/test";

/**
 * AI 診断の結果を同じ条件なら使い回す（2026-11-01 PR-B・設計書 docs/design/resilience.md D3）
 *
 * - 同じ条件で再読み込み・戻ってきたときは /api/subsidies/match を呼ばない（30分・sessionStorage）
 * - 条件が変われば呼ぶ／30分を過ぎた保存は使わない
 * - 失敗は保存しない（もう一度開けば呼び直す）。404（該当なし）は保存する
 *
 * backend はすべて page.route の偽応答。本番 backend・Claude API は呼ばない。
 * 実行: NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000 → npx playwright test match-cache
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

type Reply = { status: number; body?: unknown };

function subsidy(name: string) {
  return {
    id: `e2e-${encodeURIComponent(name)}`,
    name,
    category: "防犯",
    ministry: "E2E",
    pref_code: "13",
    prefecture: "東京都",
    max_amount: 1000000,
    rate_min: 0.5,
    rate_max: 0.5,
    target_industries: ["小売業"],
    max_employees: null,
    deadline: "2099-12-31",
    status: "open",
    description: "",
    application_tips: "",
    source_url: "https://example.com",
  };
}

function matched(name: string) {
  return { subsidy: subsidy(name), match_score: "高", estimated_cost: 500000, estimated_after_subsidy: 250000, application_advice: "E2E" };
}

const OK: Reply = { status: 200, body: { input_params: {}, matches: [matched("E2E テスト補助金")], overall_recommendation: "" } };

/** /api/subsidies/match へ順番に replies を返す（最後の1つを繰り返す）。呼ばれた回数を返す関数付き */
async function mockMatch(page: Page, replies: Reply[]): Promise<() => number> {
  let calls = 0;
  await page.route("**/api/subsidies/match", (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const reply = replies[Math.min(calls, replies.length - 1)];
    calls += 1;
    return route.fulfill({ status: reply.status, headers: CORS, contentType: "application/json", body: JSON.stringify(reply.body ?? { detail: "error" }) });
  });
  return () => calls;
}

const COND = { industry: "小売業", employees: "6〜20名", prefecture: "東京都", purpose: "防犯・万引き対策" };
const url = (c: typeof COND) => `/match/results?${new URLSearchParams(c).toString()}`;
/** 画面側の保存キー（page.tsx の queryKey と同じ並び） */
const cacheKey = (c: typeof COND) => `hc_match_cache_v1:${[c.industry, c.employees, c.prefecture, c.purpose].join("|")}`;

/** 初回の読み込みだけ sessionStorage に保存済みの結果を置く */
async function seedCache(page: Page, c: typeof COND, name: string, ageMs: number) {
  await page.addInitScript(
    ([key, value]) => {
      if (sessionStorage.getItem("e2e_seeded")) return;
      sessionStorage.setItem("e2e_seeded", "1");
      sessionStorage.setItem(key as string, value as string);
    },
    [cacheKey(c), JSON.stringify({ matches: [matched(name)], fallback: false, savedAt: Date.now() - ageMs })],
  );
}

const result = (page: Page, name: string) => page.getByText(name).first();

test.describe("AI 診断の結果の再利用", () => {
  test("同じ条件で再読み込みしても AI 診断を呼ばない", async ({ page }) => {
    const calls = await mockMatch(page, [OK]);
    await page.goto(url(COND));
    await expect(result(page, "E2E テスト補助金")).toBeVisible({ timeout: 20000 });
    expect(calls()).toBe(1);

    await page.reload();
    await expect(result(page, "E2E テスト補助金")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1000);
    expect(calls()).toBe(1);
  });

  test("「診断をやり直す」で戻ってから、ブラウザの「戻る」で結果に戻っても呼ばない", async ({ page }) => {
    const calls = await mockMatch(page, [OK]);
    await page.goto(url(COND));
    await expect(result(page, "E2E テスト補助金")).toBeVisible({ timeout: 20000 });

    await page.getByRole("link", { name: /診断をやり直す/ }).first().click();
    await page.waitForURL(/\/match$/);
    await page.goBack();
    await expect(result(page, "E2E テスト補助金")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1000);
    expect(calls()).toBe(1);
  });

  test("条件が変われば呼ぶ", async ({ page }) => {
    const calls = await mockMatch(page, [OK]);
    await page.goto(url(COND));
    await expect(result(page, "E2E テスト補助金")).toBeVisible({ timeout: 20000 });
    await page.goto(url({ ...COND, prefecture: "神奈川県" }));
    await expect(result(page, "E2E テスト補助金")).toBeVisible({ timeout: 20000 });
    expect(calls()).toBe(2);
  });

  test("30分以内の保存はそのまま使う", async ({ page }) => {
    await seedCache(page, COND, "保存済みの補助金", 5 * 60_000);
    const calls = await mockMatch(page, [OK]);
    await page.goto(url(COND));
    await expect(result(page, "保存済みの補助金")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1000);
    expect(calls()).toBe(0);
  });

  test("30分を過ぎた保存は使わず、呼び直す", async ({ page }) => {
    await seedCache(page, COND, "古い保存の補助金", 31 * 60_000);
    const calls = await mockMatch(page, [OK]);
    await page.goto(url(COND));
    await expect(result(page, "E2E テスト補助金")).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("古い保存の補助金")).toHaveCount(0);
    expect(calls()).toBe(1);
  });

  test("失敗は保存しない（再読み込みで呼び直し、成功すれば表示）", async ({ page }) => {
    const calls = await mockMatch(page, [{ status: 503 }, OK]);
    await page.goto(url(COND));
    await expect(page.getByTestId("ai-unavailable")).toBeVisible({ timeout: 20000 });
    await page.reload();
    await expect(result(page, "E2E テスト補助金")).toBeVisible({ timeout: 20000 });
    expect(calls()).toBe(2);
  });

  test("該当なし（404）は保存し、再読み込みでも空状態のまま呼ばない", async ({ page }) => {
    const calls = await mockMatch(page, [{ status: 404 }]);
    await page.goto(url(COND));
    await expect(page.getByText("条件に合う補助金が見つかりませんでした")).toBeVisible({ timeout: 20000 });
    await page.reload();
    await expect(page.getByText("条件に合う補助金が見つかりませんでした")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1000);
    expect(calls()).toBe(1);
  });
});
