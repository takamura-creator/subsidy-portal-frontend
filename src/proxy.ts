import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 1) 旧 Vercel デフォルトドメイン → 正規ドメイン (hojyocame.jp) への 308 リダイレクト。
 *
 * 例:
 *   frontend-two-beryl-71.vercel.app/match?x=1
 *     → https://hojyocame.jp/match?x=1
 *
 * 2) 存在しない補助金詳細 `/subsidies/{id}` を HTTP 404 で返す（2026-10-27）。
 *    この Next.js（16.2.2）は loading.tsx の Suspense 境界でストリーミングを始めると、
 *    ページ内の notFound() では状態コードを変えられず 200（本文は not-found・noindex）になる
 *    （node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md「Status Codes」）。
 *    公式の推奨どおり、描画前の proxy で存在を確かめ、backend が明確に 404 を返した id だけ
 *    未定義ルートへ rewrite して本物の 404 にする。
 *    - API 不達・タイムアウト・5xx は判定不能として素通し（ページ側の既存の扱いに任せる＝誤って404にしない）
 *    - 確認済みの id は数分キャッシュし、同じ id の2回目以降は API を呼ばない
 *    - クライアント遷移（RSC）・プリフェッチ・GET/HEAD 以外は対象外（ページ側 notFound() の画面で十分）
 *
 * Next.js 16 から Middleware は Proxy に名称変更されている。
 */
const CANONICAL_HOST = "hojyocame.jp";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
/** /subsidies/{id} と配下の /subsidies/{id}/templates（id が無ければどちらも存在しないページ） */
const SUBSIDY_DETAIL_PATH = /^\/subsidies\/([^/]+)(?:\/templates)?\/?$/;
/** 未定義ルート。rewrite 先にすると Next.js が not-found 画面を 404 で返す。 */
const NOT_FOUND_PATH = "/_hojyocame-not-found";
const CHECK_TIMEOUT_MS = 2500;
const EXISTS_TTL_MS = 5 * 60 * 1000;
const EXISTS_CACHE_MAX = 1000;
const existsUntil = new Map<string, number>();

/** true=存在 / false=backend が 404 と明言 / null=判定不能（素通し） */
async function subsidyExists(id: string): Promise<boolean | null> {
  const now = Date.now();
  const until = existsUntil.get(id);
  if (until !== undefined && until > now) return true;
  try {
    const res = await fetch(`${API_URL}/api/subsidies/${encodeURIComponent(id)}`, {
      method: "GET",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      cache: "no-store",
    });
    if (res.status === 404) return false;
    if (!res.ok) return null;
    if (existsUntil.size >= EXISTS_CACHE_MAX) existsUntil.clear();
    existsUntil.set(id, now + EXISTS_TTL_MS);
    return true;
  } catch {
    return null;
  }
}

function isDocumentRequest(request: NextRequest): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  if (request.headers.get("rsc") !== null) return false;
  if (request.headers.get("next-router-prefetch") !== null) return false;
  if (request.nextUrl.searchParams.has("_rsc")) return false;
  return true;
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // *.vercel.app からのアクセスは正規ドメインへ恒久リダイレクト
  if (host.endsWith(".vercel.app")) {
    const url = new URL(request.url);
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const m = SUBSIDY_DETAIL_PATH.exec(request.nextUrl.pathname);
  if (m && API_URL && isDocumentRequest(request)) {
    let id: string | null = null;
    try {
      id = decodeURIComponent(m[1]);
    } catch {
      id = null; // 不正なエンコード → 判定せず素通し
    }
    if (id && (await subsidyExists(id)) === false) {
      return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // _next 静的アセット・favicon・Next.js データ要求は除外（リダイレクトループ防止 + 速度）
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)"],
};
