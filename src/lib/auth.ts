"use client";

interface JwtPayload {
  sub: string;
  email: string;
  role: "owner" | "contractor" | "admin";
  company_name?: string;
  exp: number;
  iat: number;
}

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
      window.location.href = "/biz";
    } else {
      window.location.href = "/";
    }
    return false;
  }

  return true;
}
