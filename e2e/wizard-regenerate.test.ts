import { test, expect, type Page } from "@playwright/test";

/**
 * 事業計画書の AI 生成中に再読み込みされたとき、黙って作り直さない（2026-11-01 PR-E・設計書 D4）
 *
 * - 生成を始めた時刻をウィザードの状態に残し、3分以内に開き直されたら自動では生成せず「生成する」ボタンを出す
 * - 3分を過ぎた印・印が無いときは従来どおり自動で生成する
 * - 生成中はページを離れる前に確認を出す（beforeunload）
 *
 * backend はすべて page.route の偽応答。本番 backend・Claude API は呼ばない。
 * 実行: NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000 → npx playwright test wizard-regenerate
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, OPTIONS",
};

const ESTIMATE_ID = "e2e-estimate";
const DRAFT = {
  draft_id: "e2e-draft-1",
  application_id: ESTIMATE_ID,
  subsidy_id: "jizokuka-e2e",
  status: "draft",
  created_at: "2026-11-01T00:00:00Z",
  chapters: [
    { chapter_id: "c1", title: "企業概要", content: "E2E の企業概要", version_num: 1, generated_by: "ai", has_ng_word: false, requires_info: false },
  ],
};

function forgedJwt(): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "e2e", email: "e2e@example.com", role: "owner", exp })}.invalid`;
}

/** 持続化補助金で、見積もりまで済んで Step6（AI 生成）にいるウィザードの状態 */
function wizardAtStep6(generationStartedAt?: number) {
  return {
    step: 6,
    state: {
      company: {
        companyName: "E2E 株式会社",
        representativeName: "E2E 太郎",
        address: "東京都千代田区1-1",
        prefecture: "東京都",
        industry: "小売業",
        employees: 10,
      },
      subsidy: { id: "jizokuka-e2e", name: "小規模事業者持続化補助金（E2E）", maxAmount: 500000, rateMax: 0.66, prefecture: "東京都" },
      products: [],
      estimate: {
        id: ESTIMATE_ID,
        totalBeforeSubsidy: 300000,
        subsidyAmount: 200000,
        selfPayment: 100000,
        installationCost: 0,
        networkSetupCost: 0,
        createdAt: "2026-11-01",
      },
      qaAnswers: {},
      ...(generationStartedAt !== undefined ? { draftGenerationStartedAt: generationStartedAt } : {}),
    },
  };
}

/** 初回の読み込みだけ状態を置く（再読み込みでは上書きしない）。生成 API の呼び出し回数を返す関数付き */
async function setup(page: Page, snapshot: object, generateDelayMs = 0): Promise<() => number> {
  await page.addInitScript(
    ([token, snap]) => {
      if (sessionStorage.getItem("e2e_wizard_set")) return;
      sessionStorage.setItem("e2e_wizard_set", "1");
      localStorage.setItem("access_token", token as string);
      localStorage.setItem("hc_wizard_state_v2", snap as string);
    },
    [forgedJwt(), JSON.stringify(snapshot)],
  );
  await page.route(
    (url) => url.pathname === "/api/auth/me",
    (route) =>
      route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: CORS })
        : route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify({ email: "e2e@example.com" }) }),
  );
  let generateCalls = 0;
  await page.route(
    (url) => url.pathname.startsWith(`/api/v1/applications/${ESTIMATE_ID}/draft`),
    async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      if (new URL(route.request().url()).pathname.endsWith("/draft/generate")) {
        generateCalls += 1;
        if (generateDelayMs) await new Promise((r) => setTimeout(r, generateDelayMs));
      }
      return route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify(DRAFT) }).catch(() => {});
    },
  );
  return () => generateCalls;
}

const notice = (page: Page) => page.getByTestId("draft-interrupted");

test.describe("事業計画書の AI 生成（ウィザード Step6）", () => {
  test("直前に生成を始めていた状態で開き直すと、自動では生成せずボタンを出す。押すと1回だけ生成する", async ({ page }) => {
    const calls = await setup(page, wizardAtStep6(Date.now() - 10_000));
    await page.goto("/my/wizard");

    await expect(notice(page)).toBeVisible({ timeout: 20000 });
    await expect(notice(page)).toContainText("前回の生成が途中で止まりました");
    await page.waitForTimeout(1500);
    expect(calls()).toBe(0);

    await notice(page).getByRole("button", { name: "生成する" }).click();
    await expect(page.getByText("E2E の企業概要")).toBeVisible({ timeout: 20000 });
    expect(calls()).toBe(1);
  });

  test("生成中に再読み込みしても、黙って作り直さない", async ({ page }) => {
    const calls = await setup(page, wizardAtStep6(), 8_000);
    await page.goto("/my/wizard");
    await expect(page.getByText("事業計画書を生成しています")).toBeVisible({ timeout: 20000 });
    await expect.poll(calls).toBe(1);

    // 生成中はページを離れる前の確認が有効
    const prevented = await page.evaluate(() => {
      const e = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(e);
      return e.defaultPrevented;
    });
    expect(prevented).toBe(true);

    await page.reload();
    await expect(notice(page)).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1500);
    expect(calls()).toBe(1);
  });

  test("3分以上前の印は無視して、従来どおり自動で生成する", async ({ page }) => {
    const calls = await setup(page, wizardAtStep6(Date.now() - 10 * 60_000));
    await page.goto("/my/wizard");
    await expect(page.getByText("E2E の企業概要")).toBeVisible({ timeout: 20000 });
    await expect(notice(page)).toHaveCount(0);
    expect(calls()).toBe(1);
  });

  test("印が無ければ従来どおり自動で生成し、生成後は印を消す", async ({ page }) => {
    const calls = await setup(page, wizardAtStep6());
    await page.goto("/my/wizard");
    await expect(page.getByText("E2E の企業概要")).toBeVisible({ timeout: 20000 });
    expect(calls()).toBe(1);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("hc_wizard_state_v2") ?? "{}"));
    expect(saved.state.draftId).toBe("e2e-draft-1");
    expect(saved.state.draftGenerationStartedAt).toBeUndefined();
  });
});
