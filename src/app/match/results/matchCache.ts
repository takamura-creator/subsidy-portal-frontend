import { ApiError, matchSubsidies, type MatchedSubsidy, type MatchRequest } from "@/lib/api";
import { isRetiredSubsidyId } from "@/lib/retiredSubsidies";

/**
 * AI 診断（/api/subsidies/match）の結果を同じ条件なら使い回す（2026-11-01 設計書 docs/design/resilience.md PR-B・D3）。
 *
 * 旧: /match/results を開くたびに AI を呼んでいた（再読み込み・戻る/進む・同じ URL の再訪でも毎回約30秒待ち、毎回課金）。
 * 新:
 * - 成功した結果と「該当なし（404）」を sessionStorage に30分保存し、同じ条件ならそれを表示して API を呼ばない。
 *   sessionStorage はタブを閉じると消える（同じ端末の別の人に診断条件が残らない）
 * - 失敗（429・5xx・タイムアウト等）は保存しない（「もう一度試す」で必ず呼び直せるように）
 * - 同じ条件の呼び出しが応答待ちの間にもう一度開かれたら（画面内の移動で戻ってきた等）、新しく呼ばずに待っている応答を共有する
 * - 設計書では「条件が変わったら古い通信を中断する」としていたが、中断してもブラウザ側の待ちが止まるだけで
 *   backend の処理と課金は続くため、中断せずに応答を保存して次に使う方を選んだ
 * - sessionStorage が使えない環境では保存せず、従来どおり毎回呼ぶ（例外は投げない）
 */

export const MATCH_CACHE_TTL_MS = 30 * 60 * 1000;
const KEY_PREFIX = "hc_match_cache_v1:";

export interface MatchResultEntry {
  matches: MatchedSubsidy[];
  fallback: boolean;
}

interface StoredEntry extends MatchResultEntry {
  savedAt: number;
}

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null; // 一部のブラウザ設定では参照しただけで例外になる
  }
}

export function readMatchCache(key: string, now = Date.now()): MatchResultEntry | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(KEY_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Partial<StoredEntry>;
    if (typeof entry.savedAt !== "number" || !Array.isArray(entry.matches)) return null;
    const age = now - entry.savedAt;
    if (age < 0 || age >= MATCH_CACHE_TTL_MS) {
      s.removeItem(KEY_PREFIX + key);
      return null;
    }
    return {
      // 保存後に掲載を終了した制度は出さない（matchSubsidies と同じ規則）
      matches: entry.matches.filter((m) => !isRetiredSubsidyId(m?.subsidy?.id ?? "")),
      fallback: entry.fallback === true,
    };
  } catch {
    return null;
  }
}

function writeMatchCache(key: string, entry: MatchResultEntry, now = Date.now()): void {
  const s = storage();
  if (!s) return;
  try {
    // 期限切れの古い条件を掃除してから書く（同じタブで条件を何度も変えたとき溜まらないように）
    for (let i = s.length - 1; i >= 0; i -= 1) {
      const k = s.key(i);
      if (!k || !k.startsWith(KEY_PREFIX)) continue;
      try {
        const old = JSON.parse(s.getItem(k) ?? "{}") as Partial<StoredEntry>;
        if (typeof old.savedAt !== "number" || now - old.savedAt >= MATCH_CACHE_TTL_MS) s.removeItem(k);
      } catch {
        s.removeItem(k);
      }
    }
    const stored: StoredEntry = { ...entry, savedAt: now };
    s.setItem(KEY_PREFIX + key, JSON.stringify(stored));
  } catch {
    // 容量超過など。保存できなくても診断結果の表示は続ける
  }
}

/** 応答待ちの呼び出し（同じタブ内の画面移動で同じ条件がもう一度開かれたときに共有する） */
const inflight = new Map<string, Promise<MatchResultEntry>>();

/**
 * 条件 key の診断結果を返す。保存があればそれを使い（cached: true）、無ければ AI 診断を呼んで保存する。
 * 404（該当なし）は空の結果として返す。それ以外の失敗はそのまま投げる（保存しない）。
 */
export async function loadMatchResults(
  key: string,
  req: MatchRequest,
): Promise<MatchResultEntry & { cached: boolean }> {
  const hit = readMatchCache(key);
  if (hit) return { ...hit, cached: true };

  let pending = inflight.get(key);
  if (!pending) {
    pending = matchSubsidies(req)
      .then((res) => ({ matches: res.matches, fallback: res.fallback === true }))
      .catch((e: unknown) => {
        // backend は候補0件を 404 で返す。故障ではなく「該当なし」なので空の結果として保存する
        if (e instanceof ApiError && e.status === 404) return { matches: [], fallback: false };
        throw e;
      })
      .then((entry) => {
        writeMatchCache(key, entry);
        return entry;
      })
      .finally(() => {
        inflight.delete(key);
      });
    inflight.set(key, pending);
  }
  const entry = await pending;
  return { ...entry, cached: false };
}
