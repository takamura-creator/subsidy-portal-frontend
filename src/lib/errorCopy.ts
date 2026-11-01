import { track } from "@vercel/analytics";
import { ApiError } from "./api";

/**
 * 失敗時に利用者へ見せる文言を1箇所にまとめる（2026-11-01 設計書 docs/design/resilience.md §2-1・PR-A）。
 *
 * - ステータス番号は画面に出さない（調査用には logApiError で console に残す）
 * - `apiFetch` の message（lib/api.ts）は変えない。画面側がこのモジュール経由で文言を決める
 * - 通信失敗（status 0）は、利用者がオンラインなら「サーバーに接続できない」扱いにする。
 *   Railway が落ちて CORS ヘッダーの無い 502 を返すと、ブラウザからは通信失敗に見えるため、
 *   利用者の回線のせいにする文言は出さない
 */

export type ApiErrorKind =
  | "rate_limited"
  | "timeout"
  | "unavailable"
  | "offline"
  | "unreachable"
  | "not_found"
  | "auth"
  | "bad_request"
  | "aborted"
  | "unknown";

/** apiFetch が 4xx/5xx に付ける汎用の文言（画面に出すとステータス番号が見えてしまう） */
const GENERIC_API_MESSAGE_PREFIX = "APIエラーが発生しました";

export const ERROR_COPY = {
  rate_limited: "アクセスが集中しています。1分ほどおいてから、もう一度お試しください。",
  timeout: "時間内に処理が終わりませんでした。混み合っている可能性があります。",
  unavailable: "ただいまサービスが一時的に利用できません。時間をおいてもう一度お試しください。",
  offline: "インターネットに接続されていないようです。接続を確認してください。",
  unreachable: "サーバーに接続できませんでした。時間をおいてもう一度お試しください。",
  not_found: "お探しの情報が見つかりませんでした。",
  auth: "ログインの有効期限が切れました。もう一度ログインしてください。",
  bad_request: "入力内容を処理できませんでした。内容を確認してもう一度お試しください。",
  aborted: "処理を中止しました。",
  unknown: "問題が発生しました。時間をおいてもう一度お試しください。",
} as const satisfies Record<ApiErrorKind, string>;

/** 時間をおけば直る可能性が高い失敗（AI 機能では「AI が使えない」として扱う） */
const TRANSIENT_KINDS: ReadonlySet<ApiErrorKind> = new Set([
  "rate_limited",
  "timeout",
  "unavailable",
  "offline",
  "unreachable",
  "unknown",
]);

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** 失敗を種類に分ける */
export function errorKind(err: unknown): ApiErrorKind {
  if (!(err instanceof ApiError)) return "unknown";
  const { status } = err;
  if (status === 0) return isOffline() ? "offline" : "unreachable";
  if (status === 408) return "timeout";
  if (status === 429) return "rate_limited";
  if (status === 499) return "aborted";
  if (status === 401 || status === 403) return "auth";
  if (status === 404) return "not_found";
  if (status >= 500) return "unavailable";
  return "bad_request";
}

export function isTransientKind(kind: ApiErrorKind): boolean {
  return TRANSIENT_KINDS.has(kind);
}

/**
 * 画面に出す1文。
 * - 一時的な失敗（429/408/5xx/通信失敗）は決まった文言
 * - それ以外の ApiError は、呼び出し側が付けた具体的な文言（例:「セッションが期限切れです」「PDF生成に失敗しました」、
 *   backend の detail）があればそれを使い、汎用の「APIエラー（ステータス: N）」なら fallback（無ければ種類ごとの文言）
 * - ApiError 以外（JSON の読み取り失敗など）は fallback（無ければ unknown の文言）
 */
export function errorMessage(err: unknown, fallback?: string): string {
  const kind = errorKind(err);
  if (!(err instanceof ApiError)) return fallback ?? ERROR_COPY.unknown;
  if (isTransientKind(kind)) return ERROR_COPY[kind];
  const message = err.message?.trim();
  if (message && !message.startsWith(GENERIC_API_MESSAGE_PREFIX)) return message;
  return fallback ?? ERROR_COPY[kind];
}

/** AI 機能の画面で使う見出しと本文（label は「AI診断」「事業計画書のAI作成」など） */
export function aiErrorCopy(
  err: unknown,
  label = "AI診断",
): { kind: ApiErrorKind; title: string; body: string } {
  const kind = errorKind(err);
  const title =
    kind === "rate_limited"
      ? `ただいま${label}が混み合っています`
      : kind === "timeout"
        ? `${label}に時間がかかっています`
        : kind === "offline"
          ? "インターネットに接続されていません"
          : `ただいま${label}を利用できません`;
  return { kind, title, body: errorMessage(err) };
}

/** 調査用にステータスと文言を console に残す（画面には出さない） */
export function logApiError(context: string, err: unknown): void {
  if (err instanceof ApiError) {
    console.warn(`[${context}] status=${err.status} ${err.message}`);
  } else {
    console.warn(`[${context}]`, err);
  }
}

export type AiFeature = "match" | "diagnose" | "extract" | "draft" | "assist";

/**
 * AI 機能が使えなかったことを Vercel Analytics に送る（設計書 §2-5・D5）。
 * 入力値（業種・地域・URL など）は送らない。一時的な失敗のときだけ送る（404・入力エラーは数えない）。
 */
export function reportAiUnavailable(feature: AiFeature, err: unknown): void {
  const kind = errorKind(err);
  if (!isTransientKind(kind)) return;
  try {
    track("ai_unavailable", { feature, kind });
  } catch {
    // 計測の失敗で画面を壊さない
  }
}
