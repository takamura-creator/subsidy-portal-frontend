/**
 * 診断結果の「業種別採択戦略」を出してよいかの判定（2026-10-28 試験 [2-a][2-b]）。
 *
 * backend の /api/v1/strategy/industry/{業種} は、
 *   - 業種データが無い業種（製造業・廃棄物処理業・建設業・運輸業・農業・林業・水産業・飲食業）に 200 で {} を返す
 *   - 自治会・町会・不動産業・サービス業・その他を小売業のデータ（name=小売業）に寄せて返す
 * {} をそのまま描画すると loss_formula.formula を読んで画面全体が落ち、寄せたデータを出すと
 * 自治会の画面に「万引き・レジ過不足」が出る。そこで次の両方を満たす時だけ出す:
 *   1. 描画に要る項目がそろっている（形の検査）
 *   2. 返ってきた業種名が、送った業種そのもの（または同じ業種の別名）である
 */

import type { IndustryContext } from "@/lib/api";

/** 送った業種（backend 語彙）→ 同じ業種として扱う戦略データの業種名 */
const STRATEGY_NAME_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "医療・介護": ["介護・福祉"],
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 描画に要る項目がそろっているか（{} や一部欠けは false） */
export function isCompleteIndustryContext(v: unknown): v is IndustryContext {
  if (!isRecord(v)) return false;
  const lf = v.loss_formula;
  return (
    typeof v.name === "string" &&
    v.name.length > 0 &&
    typeof v.bottleneck === "string" &&
    typeof v.solution === "string" &&
    typeof v.ripple_effect === "string" &&
    isRecord(lf) &&
    typeof lf.formula === "string" &&
    typeof lf.example === "string" &&
    Array.isArray(v.kpi_targets) &&
    Array.isArray(v.before_after)
  );
}

/**
 * 戦略データを、その業種のものとして出してよいなら返す。出さない時は null。
 * @param apiIndustry backend へ送った業種（toApiIndustry 後の語彙）
 */
export function usableIndustryContext(v: unknown, apiIndustry: string): IndustryContext | null {
  if (!isCompleteIndustryContext(v)) return null;
  const allowed = [apiIndustry, ...(STRATEGY_NAME_ALIASES[apiIndustry] ?? [])];
  return allowed.includes(v.name) ? v : null;
}
