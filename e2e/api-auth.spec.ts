import { test, expect } from "@playwright/test";

const API_URL = "http://localhost:8000";

/**
 * API認可テスト
 *
 * 前提: バックエンド (localhost:8000) が起動していること
 * テストユーザー:
 * - owner@test.com (role=owner)
 * - contractor@test.com (role=contractor)
 */

async function getToken(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

test.describe("API認可テスト", () => {
  test("1. 未認証でGET /api/auth/me → 401", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/auth/me`);
    expect(res.status()).toBe(401);
  });

  test("2. 未認証でGET /api/applications → 401", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/applications`);
    expect(res.status()).toBe(401);
  });

  test("3. ownerでGET /api/biz/projects → 403", async ({ request }) => {
    const token = await getToken("owner@test.com", "testpass123");
    const res = await request.get(`${API_URL}/api/biz/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });

  test("4. contractorでGET /api/applications → ownerの申請は見えない", async ({
    request,
  }) => {
    const token = await getToken("contractor@test.com", "testpass123");
    const res = await request.get(`${API_URL}/api/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // contractorはapplicationsにアクセスできるが自分の申請のみ（0件のはず）
    const data = await res.json();
    expect(data.total).toBe(0);
  });

  test("5. 他人のapplication詳細にアクセス → 403", async ({ request }) => {
    const ownerToken = await getToken("owner@test.com", "testpass123");
    const contractorToken = await getToken(
      "contractor@test.com",
      "testpass123"
    );

    // ownerで申請作成
    const createRes = await request.post(`${API_URL}/api/applications`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "Content-Type": "application/json",
      },
      data: {
        subsidy_id: "test-subsidy",
        company_name: "テスト社",
      },
    });

    if (createRes.ok()) {
      const app = await createRes.json();

      // contractorでその申請にアクセス → 403
      const accessRes = await request.get(
        `${API_URL}/api/applications/${app.id}`,
        {
          headers: { Authorization: `Bearer ${contractorToken}` },
        }
      );
      expect(accessRes.status()).toBe(403);
    }
  });

  test("6. submitted申請のDELETE → 403 or 400", async ({ request }) => {
    const token = await getToken("owner@test.com", "testpass123");

    // 下書きを作成して提出
    const createRes = await request.post(`${API_URL}/api/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        subsidy_id: "test-subsidy",
        company_name: "テスト社",
      },
    });

    if (createRes.ok()) {
      const app = await createRes.json();

      // PDF生成でsubmittedにする
      await request.post(
        `${API_URL}/api/applications/${app.id}/generate-pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // submitted申請を削除しようとする → エラー期待
      const deleteRes = await request.delete(
        `${API_URL}/api/applications/${app.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // 削除不可（400 or 403）
      expect([400, 403]).toContain(deleteRes.status());
    }
  });
});
