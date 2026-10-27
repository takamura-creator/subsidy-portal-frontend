/**
 * 自治会・町会向けの制度かどうか（target_industries に「自治会・町会」を含む）。
 * 参考書類テンプレ（/subsidies/{id}/templates）を出してよい制度の判定に、ページと proxy の両方で使う。
 */
export const JICHIKAI_INDUSTRY = "自治会・町会";

export function isJichikaiSubsidy(targetIndustries: readonly string[] | undefined | null): boolean {
  return Array.isArray(targetIndustries) && targetIndustries.includes(JICHIKAI_INDUSTRY);
}
