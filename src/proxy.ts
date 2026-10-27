import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRetiredSubsidyId } from "@/lib/retiredSubsidies";
import { isJichikaiSubsidy } from "@/lib/jichikai";
import { isValidPrefectureName, romanSlugToLpPath } from "@/lib/prefectureLp";

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
 *    - 確認済みの id は数分、backend が 404 と答えた id は60秒キャッシュし、その間は同じ id で API を呼ばない
 *      （404 もキャッシュしないと、存在しない id を大量に叩かれたときに backend への負荷を増幅する・2026-10-27 審査[9]）。
 *      件数は上限（EXISTS_CACHE_MAX）で頭打ちにする。判定不能（不達・5xx）はキャッシュしない
 *    - /subsidies/{id}/templates は自治会・町会向けの制度にしかないページなので、id が存在しても
 *      自治会向けでない制度なら 404 にする（2026-10-27 審査[14]・ページ内 notFound() では 200 のソフト404になるため）
 *    - クライアント遷移（RSC）・プリフェッチ・GET/HEAD 以外は対象外（ページ側 notFound() の画面で十分）
 *
 * 3) 都道府県LP `/lp/{県名}`（2026-10-27）。上と同じ理由でページ内の permanentRedirect()/notFound() は
 *    200（meta refresh / not-found 本文）になっていたため、ドキュメント要求はここで決める。
 *    - ローマ字スラッグ（例: /lp/kanagawa）→ 日本語の正式 URL（/lp/神奈川県）へ本物の 308
 *    - 47都道府県に無い名前（例: /lp/foo）→ 本物の 404
 *
 * Next.js 16 から Middleware は Proxy に名称変更されている。
 */
const CANONICAL_HOST = "hojyocame.jp";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
/** /subsidies/{id} と配下の /subsidies/{id}/templates（id が無ければどちらも存在しないページ）。2番目のグループ=templates */
const SUBSIDY_DETAIL_PATH = /^\/subsidies\/([^/]+)(\/templates)?\/?$/;
/** /lp/{県名}（1階層のみ。opengraph-image など配下のパスは対象外） */
const PREFECTURE_LP_PATH = /^\/lp\/([^/]+)\/?$/;
/** 未定義ルート。rewrite 先にすると Next.js が not-found 画面を 404 で返す。 */
const NOT_FOUND_PATH = "/_hojyocame-not-found";
const CHECK_TIMEOUT_MS = 2500;
const EXISTS_TTL_MS = 5 * 60 * 1000;
const NOT_FOUND_TTL_MS = 60 * 1000;
const EXISTS_CACHE_MAX = 1000;

/**
 * 存在確認の結果。exists=false は backend が 404 と明言したもの。
 * jichikai は存在する制度が自治会・町会向けか（本文を読めなかったときは null＝判定しない）。
 */
type SubsidyCheck = { exists: true; jichikai: boolean | null } | { exists: false };
const checkCache = new Map<string, { until: number; check: SubsidyCheck }>();

function remember(id: string, check: SubsidyCheck, now: number): void {
  if (checkCache.size >= EXISTS_CACHE_MAX) checkCache.clear();
  checkCache.set(id, { until: now + (check.exists ? EXISTS_TTL_MS : NOT_FOUND_TTL_MS), check });
}

/** 存在確認（null=判定不能・素通し） */
async function checkSubsidy(id: string): Promise<SubsidyCheck | null> {
  const now = Date.now();
  const cached = checkCache.get(id);
  if (cached !== undefined && cached.until > now) return cached.check;
  try {
    const res = await fetch(`${API_URL}/api/subsidies/${encodeURIComponent(id)}`, {
      method: "GET",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      cache: "no-store",
    });
    if (res.status === 404) {
      const check: SubsidyCheck = { exists: false };
      remember(id, check, now);
      return check;
    }
    if (!res.ok) return null;
    let jichikai: boolean | null = null;
    try {
      const body = (await res.json()) as { target_industries?: unknown };
      if (Array.isArray(body.target_industries)) {
        jichikai = isJichikaiSubsidy(body.target_industries.filter((x): x is string => typeof x === "string"));
      }
    } catch {
      jichikai = null; // 本文を読めない → 自治会向けかは判定しない（templates を誤って404にしない）
    }
    const check: SubsidyCheck = { exists: true, jichikai };
    remember(id, check, now);
    return check;
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

  const lp = PREFECTURE_LP_PATH.exec(request.nextUrl.pathname);
  if (lp && isDocumentRequest(request)) {
    let name: string | null = null;
    try {
      name = decodeURIComponent(lp[1]);
    } catch {
      name = null; // 不正なエンコード → 存在しないページとして 404
    }
    const romanPath = name !== null ? romanSlugToLpPath(name) : null;
    if (romanPath) {
      const url = request.nextUrl.clone();
      url.pathname = romanPath;
      return NextResponse.redirect(url, 308);
    }
    if (name === null || !isValidPrefectureName(name)) {
      return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
    }
  }

  const m = SUBSIDY_DETAIL_PATH.exec(request.nextUrl.pathname);
  if (m && API_URL && isDocumentRequest(request)) {
    let id: string | null = null;
    try {
      id = decodeURIComponent(m[1]);
    } catch {
      id = null; // 不正なエンコード → 判定せず素通し
    }
    // 正本から削除した制度（retired）は backend に聞かずに 404（本番 backend が古くても出さない）
    if (id) {
      const isTemplates = m[2] !== undefined;
      let notFound = isRetiredSubsidyId(id);
      if (!notFound) {
        const check = await checkSubsidy(id);
        notFound =
          check !== null && (!check.exists || (isTemplates && check.jichikai === false));
      }
      if (notFound) return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // _next 静的アセット・favicon・Next.js データ要求は除外（リダイレクトループ防止 + 速度）
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)"],
};
