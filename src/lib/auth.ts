"use client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: "owner" | "contractor" | "admin";
  company_name?: string;
  representative_name?: string;
  industry?: string;
  pref_code?: string;
  employees?: number;
  exp: number;
  iat: number;
}

/**
 * JWT のクライアントサイド署名検証は意図的に**実施していません**。
 *
 * 理由:
 *   - クライアントに秘密鍵を配布できないため、true な署名検証は不可能
 *   - Asymmetric (RS256) なら公開鍵検証が可能だが、現在は HS256 運用
 *
 * セキュリティ前提:
 *   1. **権限判定の真の責任はサーバー側**にある。バックエンドは jwt.decode(..., SECRET_KEY)
 *      で署名検証してから処理する（routers/auth.py の require_role）。
 *   2. このフロント関数の戻り値は**「UI を出すかどうか」の最適化用途のみ**で利用する。
 *   3. 攻撃者が localStorage を改ざんしても、API 側で必ず弾かれる。
 *
 * 改ざんによる UI 露出が問題になる場合は、サーバーから /api/auth/me で都度確認すること
 * （`fetchMe()` を使う設計を推奨）。
 */
function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function getUser(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  return decodeJwt(token);
}

export function isAuthenticated(): boolean {
  const user = getUser();
  if (!user) return false;
  return user.exp * 1000 > Date.now();
}

export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  // ウィザードの状態もクリア（別アカウントのデータ残留を防止）
  localStorage.removeItem("hc_wizard_state_v2");
  window.location.href = "/auth/login";
}

/**
 * 認証チェック。未ログインなら /auth/login、ロール不一致ならリダイレクト。
 * クライアントサイド useEffect 内で呼び出す。
 * @returns true=アクセスOK, false=リダイレクト済み
 */
export function requireAuth(
  allowedRoles: ("owner" | "contractor" | "admin")[],
  currentPath: string
): boolean {
  if (!isAuthenticated()) {
    window.location.href = `/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
    return false;
  }

  const user = getUser();
  if (!user) {
    window.location.href = `/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
    return false;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "owner") {
      window.location.href = "/my";
    } else if (user.role === "contractor") {
      window.location.href = "/";
    } else {
      window.location.href = "/";
    }
    return false;
  }

  return true;
}
