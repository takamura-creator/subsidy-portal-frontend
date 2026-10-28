import { isIndirect, type WithAttributes } from "@/lib/subsidyAttributes";

/**
 * 自治会・町会向けの制度かどうか（target_industries に「自治会・町会」を含む）。
 * 参考書類テンプレ（/subsidies/{id}/templates）を出してよい制度の判定に、ページと proxy の両方で使う。
 */
export const JICHIKAI_INDUSTRY = "自治会・町会";

export function isJichikaiSubsidy(targetIndustries: readonly string[] | undefined | null): boolean {
  return Array.isArray(targetIndustries) && targetIndustries.includes(JICHIKAI_INDUSTRY);
}

/**
 * 参考書類テンプレ（/subsidies/{id}/templates）を出してよい制度か（2026-10-28 審査[6]）。
 * 自治会・町会向けでも、直接申請できない制度（申請者は市町村。例: 埼玉県わがまち防犯）は
 * 自治会が出す申請書類が無いため出さない。ページ・詳細の誘導・proxy の三か所で同じ判定を使う。
 */
export function hasTemplatesPage(
  s: WithAttributes & { target_industries?: readonly string[] | null },
): boolean {
  return isJichikaiSubsidy(s.target_industries) && !isIndirect(s);
}
