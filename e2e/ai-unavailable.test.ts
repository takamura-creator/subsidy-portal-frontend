import { test, expect, type Page, type Route } from "@playwright/test";

/**
 * AI・backend が失敗したときの表示（2026-11-01 PR-A・設計書 docs/design/resilience.md §2）
 *
 * - ステータス番号（「ステータス: 503」）を画面に出さない
 * - AI 診断が使えないときは「同じ条件でもう一度試す／一覧で見る／相談する」を出す
 * - 5xx・サーバーに届かないときに、利用者の回線のせいにする文言を出さない
 *
 * backend はすべて page.route の偽応答。本番 backend・Claude API は呼ばない。
 * 実行（届かない宛先で起動しておくと、偽応答を付け忘れた通信もすぐ失敗する）:
 *   NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000
 *   npx playwright test ai-unavailable
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
};

type Reply = { status: number; body?: unknown } | "network-error";

/** path に一致する呼び出しへ、順番に replies を返す（最後の1つは繰り返す）。呼ばれた回数を返す関数付き */
async function mockApi(page: Page, path: string, replies: Reply[]): Promise<() => number> {
  let calls = 0;
  await page.route(`**${path}`, (route: Route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const reply = replies[Math.min(calls, replies.length - 1)];
    calls += 1;
    if (reply === "network-error") return route.abort("failed");
    return route.fulfill({
      status: reply.status,
      headers: CORS,
      contentType: "application/json",
      body: JSON.stringify(reply.body ?? { detail: "error" }),
    });
  });
  return () => calls;
}

const MATCH_QUERY = new URLSearchParams({
  industry: "小売業",
  employees: "6〜20名",
  prefecture: "東京都",
  purpose: "防犯・万引き対策",
}).toString();

const SUBSIDY = {
  id: "e2e-subsidy",
  name: "E2E テスト補助金",
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

function matchBody(fallback?: boolean) {
  return {
    input_params: {},
    matches: [
      {
        subsidy: SUBSIDY,
        match_score: "高",
        estimated_cost: 500000,
        estimated_after_subsidy: 250000,
        application_advice: "E2E",
      },
    ],
    overall_recommendation: "",
    ...(fallback === undefined ? {} : { fallback }),
  };
}

const notice = (page: Page) => page.getByTestId("ai-unavailable");

test.describe("/match/results（AI 診断）が失敗したとき", () => {
  test("503: AI が使えない表示と3つの導線を出し、ステータス番号は出さない", async ({ page }) => {
    await mockApi(page, "/api/subsidies/match", [{ status: 503 }]);
    await page.goto(`/match/results?${MATCH_QUERY}`);

    await expect(notice(page)).toBeVisible({ timeout: 20000 });
    await expect(notice(page)).toContainText("ただいまAI診断を利用できません");
    await expect(notice(page)).toContainText("ただいまサービスが一時的に利用できません。");
    await expect(notice(page).getByRole("button", { name: "同じ条件でもう一度試す" })).toBeVisible();
    await expect(notice(page).getByRole("link", { name: "条件に近い補助金を一覧で見る" })).toHaveAttribute(
      "href",
      `/subsidies?industry=${encodeURIComponent("小売業")}`,
    );
    await expect(notice(page).getByRole("link", { name: "専門スタッフに相談する" })).toHaveAttribute("href", "/contact");
    await expect(page.getByText("ステータス", { exact: false })).toHaveCount(0);
    await expect(page.getByText("APIエラー", { exact: false })).toHaveCount(0);
  });

  test("429: 混み合っている表示", async ({ page }) => {
    await mockApi(page, "/api/subsidies/match", [{ status: 429 }]);
    await page.goto(`/match/results?${MATCH_QUERY}`);
    await expect(notice(page)).toContainText("ただいまAI診断が混み合っています", { timeout: 20000 });
    await expect(notice(page)).toContainText("1分ほどおいてから");
  });

  test("サーバーに届かない: 利用者の回線のせいにしない", async ({ page }) => {
    await mockApi(page, "/api/subsidies/match", ["network-error"]);
    await page.goto(`/match/results?${MATCH_QUERY}`);
    await expect(notice(page)).toContainText("サーバーに接続できませんでした", { timeout: 20000 });
    await expect(page.getByText("接続をご確認ください")).toHaveCount(0);
  });

  test("「同じ条件でもう一度試す」で1回だけ呼び直し、成功すれば結果を出す", async ({ page }) => {
    const calls = await mockApi(page, "/api/subsidies/match", [{ status: 503 }, { status: 200, body: matchBody() }]);
    await page.goto(`/match/results?${MATCH_QUERY}`);
    await expect(notice(page)).toBeVisible({ timeout: 20000 });
    expect(calls()).toBe(1);

    await notice(page).getByRole("button", { name: "同じ条件でもう一度試す" }).click();
    await expect(page.getByText("E2E テスト補助金").first()).toBeVisible({ timeout: 20000 });
    await expect(notice(page)).toHaveCount(0);
    expect(calls()).toBe(2);
  });

  test("404（該当なし）は今までどおり空状態", async ({ page }) => {
    await mockApi(page, "/api/subsidies/match", [{ status: 404 }]);
    await page.goto(`/match/results?${MATCH_QUERY}`);
    await expect(page.getByText("条件に合う補助金が見つかりませんでした")).toBeVisible({ timeout: 20000 });
    await expect(notice(page)).toHaveCount(0);
  });

  test("backend が fallback: true を返したら簡易判定の注記を出す", async ({ page }) => {
    await mockApi(page, "/api/subsidies/match", [{ status: 200, body: matchBody(true) }]);
    await page.goto(`/match/results?${MATCH_QUERY}`);
    await expect(page.getByTestId("match-fallback-note")).toBeVisible({ timeout: 20000 });
  });

  test("fallback を返さない backend では注記を出さない", async ({ page }) => {
    await mockApi(page, "/api/subsidies/match", [{ status: 200, body: matchBody() }]);
    await page.goto(`/match/results?${MATCH_QUERY}`);
    await expect(page.getByText("E2E テスト補助金").first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId("match-fallback-note")).toHaveCount(0);
  });
});

test.describe("トップの URL 診断が失敗したとき", () => {
  test("5xx で「接続をご確認ください」と出さない", async ({ page }) => {
    // 開発サーバーの起動直後はトップページの初回コンパイルに時間がかかるため長めに待つ（2026-11-01）
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const calls = await mockApi(page, "/api/public/diagnose", [{ status: 503 }]);
    await page.goto("/");
    const input = page.getByLabel("会社ホームページURL");
    // 画面の準備（hydration）前に入力すると入力が消えて送信されないことがあるため、
    // 診断の要求が実際に出るまで入力と送信をやり直す（並列実行で負荷が高いときに起きていた）
    await expect(async () => {
      await input.fill("example.co.jp");
      await input.press("Enter");
      await expect.poll(calls, { timeout: 3000 }).toBeGreaterThan(0);
    }).toPass({ timeout: 40000 });
    await expect(page.getByText("ただいま診断を利用できません。時間をおいて、もう一度お試しください。")).toBeVisible({
      timeout: 40000,
    });
    await expect(page.getByText("接続をご確認ください")).toHaveCount(0);
  });
});

/** 署名が不正なだけで、期限は未来・ロールは owner の JWT（画面側の同期チェックは通る） */
function forgedJwt(): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "e2e", email: "e2e@example.com", role: "owner", exp })}.invalid`;
}

test.describe("ウィザード Step1 の HP 自動取得が失敗したとき", () => {
  test("5xx でステータス番号を出さない", async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem("access_token", token);
      localStorage.removeItem("hc_wizard_state_v2");
    }, forgedJwt());
    await mockApi(page, "/api/auth/me", [{ status: 200, body: { email: "e2e@example.com" } }]);
    await mockApi(page, "/api/extractions/homepage", [{ status: 503 }]);

    await page.goto("/my/wizard");
    await page.getByPlaceholder("https://example.co.jp").fill("https://example.co.jp");
    await page.getByRole("button", { name: /自動取得/ }).click();

    const alert = page.getByRole("alert").filter({ hasText: "自動取得できませんでした" });
    await expect(alert).toBeVisible({ timeout: 20000 });
    await expect(alert).toContainText("ただいまサービスが一時的に利用できません。");
    await expect(page.getByText("ステータス", { exact: false })).toHaveCount(0);
  });
});
