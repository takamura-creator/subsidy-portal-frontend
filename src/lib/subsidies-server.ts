/**
 * 補助金データのサーバー側ローダー。
 *
 * 2026-09-15 注文書（backend/routers/subsidies.py DB化・frontend API切替）対応:
 * - 優先: バックエンド公開API `/api/subsidies` `/api/subsidies/{id}`（`lib/api.ts` の
 *   `fetchSubsidies` / `fetchSubsidy`。ともに `next: { revalidate: 300 }` で ISR）
 * - フォールバック: API 到達不能時のみ `src/data/subsidies.json`（ビルド時スナップショット）
 *   を使う。フォールバック発生時は戻り値の `stale: true` で呼び出し側に明示する
 *   （「frontend が静的コピーを読み続けて表示が古いまま」を防ぐため、
 *   黙って古いデータを返さない）
 * - Server Component / `generateStaticParams` / `generateMetadata` からのみ使用可
 *   （クライアント側では `fetchSubsidy()` / `fetchSubsidies()` を直接使うこと）
 *
 * Sprint 4 Task 0: `/subsidies/[id]` を Server Component 化するために新設。
 * 2026-09-15: 静的JSON直読み → API優先+フォールバックに変更（frontend API切替 注文書）。
 */

import { fetchSubsidies, fetchSubsidy, ApiError } from "./api";
import type { Subsidy } from "./api";
import subsidiesJson from "@/data/subsidies.json";

type SubsidiesJson = { subsidies: Subsidy[] };

/** 最終フォールバック用の同梱データ（ビルド時点のスナップショット）。API不達時のみ使用。 */
const BUNDLED_SUBSIDIES: Subsidy[] = (subsidiesJson as unknown as SubsidiesJson).subsidies ?? [];

export interface SubsidiesResult {
  subsidies: Subsidy[];
  /** true: API取得に失敗し同梱データへフォールバック中（古い可能性あり） */
  stale: boolean;
}

export interface SubsidyResult {
  subsidy: Subsidy | undefined;
  /** true: API取得に失敗し同梱データへフォールバック中（古い可能性あり） */
  stale: boolean;
}

/** 全補助金を返す（sitemap / 一覧 SSG / llms.txt 用）。API優先、失敗時は同梱データ。 */
export async function getAllSubsidies(): Promise<SubsidiesResult> {
  try {
    const res = await fetchSubsidies();
    // 2026-09-15 差し戻し#2: API成功時は total:0（空配列）でも正とする。
    // 旧実装は「length > 0」でない成功レスポンスを失敗と同じに扱い同梱データへ差し替えていたが、
    // それだと backend が正しく0件を返した状況を古いデータで隠してしまう（黙って古いデータを出す）。
    return { subsidies: res.subsidies ?? [], stale: false };
  } catch {
    // 追加指摘#10 (2026-09-15): フォールバック発生をビルド/CIログにも残す（画面注記だけが
    // 唯一のシグナルだと本番のAPI到達不能に誰も気づけない）。個人情報は含めない。
    console.warn("[subsidies-server] getAllSubsidies: API到達不能のため同梱データにフォールバック（stale）");
    // fetch自体が失敗（ネットワーク到達不能等）した場合のみ同梱データ＋staleでフォールバック
    return { subsidies: BUNDLED_SUBSIDIES, stale: true };
  }
}

/** `generateStaticParams` 用: 全補助金 ID のリストを返す。 */
export async function getAllSubsidyIds(): Promise<string[]> {
  const { subsidies } = await getAllSubsidies();
  return subsidies.map((s) => s.id);
}

/** ID から補助金を取得。該当なしは `subsidy: undefined`（呼び出し側で `notFound()`）。 */
export async function getSubsidyById(id: string): Promise<SubsidyResult> {
  try {
    const subsidy = await fetchSubsidy(id);
    return { subsidy, stale: false };
  } catch (err) {
    // 2026-09-15 差し戻し#1: backend が明確に404を返した場合は「存在しない」が確定情報。
    // 同梱データへフォールバックすると削除済みIDが復活して表示されてしまうため、
    // undefined を返して呼び出し側の notFound() に委ねる（同梱データは探しに行かない）。
    if (err instanceof ApiError && err.status === 404) {
      // 追加指摘#10: 404で undefined を返す経路にもログを残す（削除済みIDへの流入把握用）。
      console.warn(`[subsidies-server] getSubsidyById: backend 404（該当なし） id=${id}`);
      return { subsidy: undefined, stale: false };
    }
    // ネットワーク到達不能・タイムアウト等、backendの判定そのものを得られない場合のみ
    // 同梱データ＋staleでフォールバックする。
    console.warn(`[subsidies-server] getSubsidyById: API到達不能のため同梱データにフォールバック（stale） id=${id}`);
    const subsidy = BUNDLED_SUBSIDIES.find((s) => s.id === id);
    return { subsidy, stale: true };
  }
}
