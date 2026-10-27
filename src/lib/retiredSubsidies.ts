/**
 * 正本（backend/data/subsidies.json の `retired`）から削除した制度の id（2026-10-27）。
 *
 * 一次ソースで実在を確認できず削除した制度を、どの経路でも画面に出さないための防御層。
 * 本番の backend が古い一覧を返している間や、古いキャッシュが残っている間でも、
 * 一覧・詳細・ウィザード・書類・sitemap・/match の結果から除く。
 * 一覧の出どころは `npm run sync-subsidies` が生成する src/data/retired-subsidy-ids.json（手で書かない）。
 */
import retiredJson from "@/data/retired-subsidy-ids.json";

export const RETIRED_SUBSIDY_IDS: ReadonlySet<string> = new Set(
  (retiredJson as { retired_ids: string[] }).retired_ids ?? [],
);

export function isRetiredSubsidyId(id: string): boolean {
  return RETIRED_SUBSIDY_IDS.has(id);
}

/** 削除済みの制度を除いた配列を返す（元の順序は保つ） */
export function withoutRetired<T extends { id: string }>(items: readonly T[]): T[] {
  return items.filter((s) => !RETIRED_SUBSIDY_IDS.has(s.id));
}
