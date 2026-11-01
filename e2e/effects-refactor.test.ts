import { test, expect, type Page, type Route } from "@playwright/test";

/**
 * eslint の新しいルールに合わせて書き直した画面の回帰テスト（2026-11-01）
 *
 * - react-hooks/set-state-in-effect: 「effect の中で同期 setState」をやめ、読み込み中を
 *   「今の条件の結果がまだ届いていない」から計算する形（src/lib/useAsyncData.ts）などに書き直した
 * - @next/next/no-location-assign-relative-destination: 全画面の読み込みでの移動を hardNavigate にまとめた
 *
 * 書き直す前と同じに動くこと（と、古い応答で上書きしないこと）を確かめる。
 * backend はすべて page.route の偽応答。本番 backend・Claude API は呼ばない。
 * 実行: NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000 → npx playwright test effects-refactor
 */
test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

/** 署名が不正なだけの JWT（画面側は中身を読むだけ） */
function forgedJwt(role: "owner" | "admin", extra: Record<string, unknown> = {}): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "e2e", email: "e2e@example.com", role, exp, ...extra })}.invalid`;
}

/** 初回の読み込みだけ localStorage を置く（転送後の読み込みでは上書きしない） */
async function seedStorage(page: Page, items: Record<string, string>) {
  await page.addInitScript((entries) => {
    if (sessionStorage.getItem("e2e_seeded")) return;
    sessionStorage.setItem("e2e_seeded", "1");
    for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
  }, items);
}

type Handler = (url: URL, route: Route) => Promise<{ status: number; body: unknown; delayMs?: number }>;

/** pathname が一致する呼び出しに handler の応答を返す。呼ばれた URL の一覧を返す */
async function mockApi(page: Page, pathname: string | ((p: string) => boolean), handler: Handler): Promise<URL[]> {
  const calls: URL[] = [];
  const match = typeof pathname === "string" ? (p: string) => p === pathname : pathname;
  await page.route(
    (url) => match(url.pathname),
    async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      const url = new URL(route.request().url());
      calls.push(url);
      const reply = await handler(url, route);
      if (reply.delayMs) await new Promise((r) => setTimeout(r, reply.delayMs));
      return route
        .fulfill({ status: reply.status, headers: CORS, contentType: "application/json", body: JSON.stringify(reply.body) })
        .catch(() => {}); // テスト終了後に届いた応答は捨てる
    },
  );
  return calls;
}

function adminApp(id: string, company: string, status: string) {
  return { id, user_email: `${id}@example.com`, company_name: company, subsidy_id: "s-1", subsidy_name: "E2E 補助金", status, created_at: "2026-11-01T00:00:00Z" };
}

test.describe("管理画面の一覧（useAsyncData）", () => {
  test("申請一覧: 開くと読み込み、タブを替えると取り直す", async ({ page }) => {
    await seedStorage(page, { access_token: forgedJwt("admin") });
    const calls = await mockApi(page, "/api/admin/applications", async (url) => {
      const status = url.searchParams.get("status");
      return {
        status: 200,
        body: status === "submitted"
          ? { total: 1, applications: [adminApp("app-sub", "提出済み株式会社", "submitted")] }
          : { total: 1, applications: [adminApp("app-all", "全件株式会社", "draft")] },
      };
    });
    await page.goto("/admin/applications");
    await expect(page.getByText("全件株式会社")).toBeVisible();
    await page.getByRole("tab", { name: "提出済み" }).click();
    await expect(page.getByText("提出済み株式会社")).toBeVisible();
    await expect(page.getByText("全件株式会社")).toHaveCount(0);
    expect(calls.some((u) => u.searchParams.get("status") === "submitted")).toBe(true);
  });

  test("申請一覧: 前のタブの遅い応答で、今のタブの一覧を上書きしない", async ({ page }) => {
    await seedStorage(page, { access_token: forgedJwt("admin") });
    await mockApi(page, "/api/admin/applications", async (url) => {
      const status = url.searchParams.get("status");
      if (status === "submitted") {
        return { status: 200, body: { total: 1, applications: [adminApp("app-sub", "提出済み株式会社", "submitted")] } };
      }
      if (status === "approved") {
        // 「承認」タブは遅く返す。その間に「提出済み」へ切り替える
        return { status: 200, delayMs: 1500, body: { total: 1, applications: [adminApp("app-ok", "承認株式会社", "approved")] } };
      }
      return { status: 200, body: { total: 1, applications: [adminApp("app-all", "全件株式会社", "draft")] } };
    });
    await page.goto("/admin/applications");
    await expect(page.getByText("全件株式会社")).toBeVisible();
    await page.getByRole("tab", { name: "承認" }).click();
    await page.getByRole("tab", { name: "提出済み" }).click();
    await expect(page.getByText("提出済み株式会社")).toBeVisible();
    await page.waitForTimeout(2000); // 遅い「承認」の応答が届くまで待つ
    await expect(page.getByText("提出済み株式会社")).toBeVisible();
    await expect(page.getByText("承認株式会社")).toHaveCount(0);
  });

  test("申請一覧: ステータスを変えたら取り直す", async ({ page }) => {
    await seedStorage(page, { access_token: forgedJwt("admin") });
    let changed = false;
    const calls = await mockApi(page, "/api/admin/applications", async () => ({
      status: 200,
      body: { total: 1, applications: [adminApp("app-1", "審査待ち株式会社", changed ? "reviewing" : "submitted")] },
    }));
    await mockApi(page, (p) => p.startsWith("/api/admin/applications/") && p.endsWith("/status"), async () => {
      changed = true;
      return { status: 200, body: adminApp("app-1", "審査待ち株式会社", "reviewing") };
    });
    await page.goto("/admin/applications");
    await page.getByRole("button", { name: "審査開始" }).click();
    await expect(page.getByRole("button", { name: "審査開始" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "承認", exact: true }).last()).toBeVisible();
    expect(calls.length).toBeGreaterThanOrEqual(2);
  });

  test("補助金管理: 取得に失敗したらエラーを出し、再試行で一覧を出す", async ({ page }) => {
    await seedStorage(page, { access_token: forgedJwt("admin") });
    let fail = true;
    await mockApi(page, "/api/admin/subsidies", async () =>
      fail
        ? { status: 500, body: { detail: "E2E 取得失敗" } }
        : {
            status: 200,
            body: {
              total: 1,
              subsidies: [{ id: "e2e-s", name: "E2E 防犯カメラ補助金", ministry: "E2E", prefecture: "東京都", category: "防犯", max_amount: 1000000, deadline: "2099-12-31", status: "open", updated_at: "2026-11-01" }],
            },
          },
    );
    await page.goto("/admin/subsidies");
    await expect(page.getByRole("button", { name: "再試行" })).toBeVisible();
    fail = false;
    await page.getByRole("button", { name: "再試行" }).click();
    await expect(page.getByText("E2E 防犯カメラ補助金")).toBeVisible();
    await expect(page.getByRole("button", { name: "再試行" })).toHaveCount(0);
  });

  test("ユーザー管理: タブを替えると条件を変えて取り直す", async ({ page }) => {
    await seedStorage(page, { access_token: forgedJwt("admin") });
    const calls = await mockApi(page, "/api/admin/users", async (url) => ({
      status: 200,
      body: {
        total: 1,
        users: [{ id: "u-1", email: url.searchParams.get("role") === "contractor" ? "contractor@example.com" : "all@example.com", role: "owner", status: "active", created_at: "2026-11-01T00:00:00Z" }],
      },
    }));
    await page.goto("/admin/users");
    await expect(page.getByText("all@example.com")).toBeVisible();
    await page.getByRole("tab", { name: "業者" }).click();
    await expect(page.getByText("contractor@example.com")).toBeVisible();
    expect(calls.some((u) => u.searchParams.get("role") === "contractor")).toBe(true);
  });
});

test.describe("全画面の読み込みでの移動（hardNavigate）", () => {
  test("未ログインで管理画面を開くと、戻り先付きでログイン画面へ", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/auth\/login\?returnUrl=%2Fadmin%2Fusers/);
  });

  test("管理者でないユーザーが管理画面を開くと、トップへ", async ({ page }) => {
    await seedStorage(page, { access_token: forgedJwt("owner") });
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("採択事例の都道府県ページ /results/{県}（useAsyncData）", () => {
  const recipient = (name: string) => ({
    id: name, subsidy_name: "E2E 補助金", subsidy_category: "防犯", fiscal_year: 2025, recipient_name: name,
    recipient_prefecture: "東京都", recipient_city: "千代田区", industry: "小売業", grant_amount: 1000000,
    project_summary: "", source_url: "https://example.com", source_ministry: "E2E",
  });

  test("並び順を替えると取り直し、失敗したらエラーを出す", async ({ page }) => {
    const calls = await mockApi(page, "/api/recipients", async (url) =>
      url.searchParams.get("sort") === "name_asc"
        ? { status: 500, body: { detail: "E2E 取得失敗" } }
        : { status: 200, body: { total: 1, recipients: [recipient("E2E 採択株式会社")] } },
    );
    await page.goto(`/results/${encodeURIComponent("東京都")}`);
    await expect(page.getByText("E2E 採択株式会社").first()).toBeVisible();
    await page.locator("select").filter({ has: page.locator('option[value="name_asc"]') }).selectOption("name_asc");
    await expect(page.locator("p.text-error")).toBeVisible();
    expect(calls.some((u) => u.searchParams.get("sort") === "name_asc")).toBe(true);
  });
});

test.describe("問い合わせの自動補完（useBrowserValue）", () => {
  test("ウィザードの保存内容と JWT から補完し、後から届いたプロフィールで入力中の値を上書きしない", async ({ page }) => {
    await seedStorage(page, {
      access_token: forgedJwt("owner", { email: "jwt@example.com" }),
      hc_wizard_state_v2: JSON.stringify({ state: { company: { representativeName: "E2E 太郎" }, estimate: { id: "est-123" } } }),
    });
    await mockApi(page, "/api/auth/me", async () => ({
      status: 200,
      delayMs: 1500,
      body: { email: "db@example.com", company_name: "DB 株式会社", phone: "03-0000-0000" },
    }));
    await page.goto("/contact");
    await expect(page.locator('input[value="E2E 太郎"]')).toBeVisible();
    await expect(page.locator('input[value="est-123"]')).toBeVisible();
    // プロフィールが届く前に会社名を入力する
    const company = page.locator('input[value="E2E 太郎"]').locator("xpath=ancestor::form").locator("input").first();
    await company.fill("入力した会社");
    // プロフィールが届くと、未入力の電話番号とメールは埋まるが、会社名は入力したまま
    await expect(page.locator('input[value="03-0000-0000"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[value="db@example.com"]')).toBeVisible();
    await expect(company).toHaveValue("入力した会社");
  });
});

test.describe("申請書の新規作成: 下書きの復元（派生 state）", () => {
  test("保存済みの下書きがあれば復元を勧め、復元したら閉じる", async ({ page }) => {
    await seedStorage(page, {
      access_token: forgedJwt("owner"),
      hojyo_came_application_new_draft: JSON.stringify({ data: { companyName: "下書き株式会社" }, savedAt: Date.now() }),
    });
    await mockApi(page, "/api/auth/me", async () => ({ status: 200, body: { email: "e2e@example.com" } }));
    await page.goto("/my/applications/new");
    const restore = page.getByRole("button", { name: /復元/ });
    await expect(restore).toBeVisible();
    await restore.click();
    await expect(restore).toHaveCount(0);
  });
});

test.describe("ウィザード: 対応エリア外の案内（描画時に判定）", () => {
  const ESTIMATE_ID = "e2e-estimate";
  function wizardAt(step: number, prefecture: string) {
    return JSON.stringify({
      step,
      state: {
        company: { companyName: "E2E 株式会社", representativeName: "E2E 太郎", address: "大阪府大阪市1-1", prefecture, industry: "小売業", employees: 10 },
        subsidy: { id: "jizokuka-e2e", name: "小規模事業者持続化補助金（E2E）", maxAmount: 500000, rateMax: 0.66, prefecture: "全国" },
        products: [],
        estimate: { id: ESTIMATE_ID, totalBeforeSubsidy: 300000, subsidyAmount: 200000, selfPayment: 100000, installationCost: 0, networkSetupCost: 0, createdAt: "2026-11-01" },
        qaAnswers: {},
      },
    });
  }

  for (const [step, label] of [[6, "AI 生成（Step7Generate）"], [7, "下書き（Step8Draft）"]] as const) {
    test(`${label}: 対応エリア外なら案内を出し、生成しない`, async ({ page }) => {
      await seedStorage(page, { access_token: forgedJwt("owner"), hc_wizard_state_v2: wizardAt(step, "大阪府") });
      await mockApi(page, "/api/auth/me", async () => ({ status: 200, body: { email: "e2e@example.com" } }));
      const drafts = await mockApi(page, (p) => p.startsWith(`/api/v1/applications/${ESTIMATE_ID}/draft`), async () => ({
        status: 500,
        body: { detail: "呼ばれてはいけない" },
      }));
      await page.goto("/my/wizard");
      await expect(page.getByText("現在は対応エリアではありません。").first()).toBeVisible();
      await page.waitForTimeout(500);
      expect(drafts.filter((u) => u.pathname.endsWith("/generate"))).toHaveLength(0);
    });
  }
});

test.describe("ウィザード Step2: 補助金の一覧（useAsyncData）", () => {
  function wizardAtStep2() {
    return JSON.stringify({
      step: 2,
      state: {
        company: { companyName: "E2E 株式会社", representativeName: "E2E 太郎", address: "東京都千代田区1-1", prefecture: "東京都", industry: "小売業", employees: 10 },
        products: [],
        qaAnswers: {},
      },
    });
  }
  const apiSubsidy = {
    id: "e2e-api-camera", name: "E2E API 防犯カメラ補助金", category: "防犯", ministry: "E2E", pref_code: "13", prefecture: "東京都",
    max_amount: 1000000, rate_min: 0.5, rate_max: 0.5, target_industries: [], max_employees: null, deadline: "2099-12-31",
    status: "open", description: "", application_tips: "", source_url: "https://example.com",
  };

  test("API が成功したら API の一覧を出し、古いデータの注意は出さない", async ({ page }) => {
    await seedStorage(page, { access_token: forgedJwt("owner"), hc_wizard_state_v2: wizardAtStep2() });
    await mockApi(page, "/api/auth/me", async () => ({ status: 200, body: { email: "e2e@example.com" } }));
    await mockApi(page, "/api/subsidies", async () => ({ status: 200, body: { total: 1, subsidies: [apiSubsidy] } }));
    await mockApi(page, "/api/area/check", async () => ({
      status: 200,
      body: { in_service_area: true, prefecture: "東京都", service_prefectures: ["東京都"] },
    }));
    await page.goto("/my/wizard");
    await expect(page.getByText("E2E API 防犯カメラ補助金")).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "補助金選択" }).getByRole("radio")).toHaveCount(1);
  });

  test("API が失敗したら同梱データを出す（0件にしない）", async ({ page }) => {
    await seedStorage(page, { access_token: forgedJwt("owner"), hc_wizard_state_v2: wizardAtStep2() });
    await mockApi(page, "/api/auth/me", async () => ({ status: 200, body: { email: "e2e@example.com" } }));
    await mockApi(page, "/api/subsidies", async () => ({ status: 500, body: { detail: "E2E 取得失敗" } }));
    await mockApi(page, "/api/area/check", async () => ({ status: 500, body: { detail: "E2E 取得失敗" } }));
    await page.goto("/my/wizard");
    const radios = page.getByRole("radiogroup", { name: "補助金選択" }).getByRole("radio");
    await expect(radios.first()).toBeVisible();
    expect(await radios.count()).toBeGreaterThan(0);
    await expect(page.getByText("E2E API 防犯カメラ補助金")).toHaveCount(0);
  });
});
