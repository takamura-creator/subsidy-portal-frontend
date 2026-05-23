import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 旧 Vercel デフォルトドメイン → 正規ドメイン (hojyocame.jp) への 308 リダイレクト。
 *
 * 例:
 *   frontend-two-beryl-71.vercel.app/match?x=1
 *     → https://hojyocame.jp/match?x=1
 *
 * Next.js 16 から Middleware は Proxy に名称変更されている。
 */
const CANONICAL_HOST = "hojyocame.jp";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // *.vercel.app からのアクセスは正規ドメインへ恒久リダイレクト
  if (host.endsWith(".vercel.app")) {
    const url = new URL(request.url);
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // _next 静的アセット・favicon・Next.js データ要求は除外（リダイレクトループ防止 + 速度）
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)"],
};
