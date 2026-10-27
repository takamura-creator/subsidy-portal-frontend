/**
 * 正本だけが持つ「制度の性質」の項目（2026-10-27）。
 *
 *   max_amount_unit     "per_camera"（上限はカメラ1台あたり）/ "total"（総額）/ null（根拠なし＝総額として扱う）
 *   max_units           1申請者あたりの台数上限
 *   applicant / indirect 利用者が直接申請できない制度（市町村・都道府県を通じて使う）と、その申請者
 *   camera_eligibility  "unconfirmed" = カメラ機器が補助対象と公式資料で確認できていない
 *   regional_last_day   都道府県 → 最終受付日（ISO）。都道府県ごとに締切が違う制度だけ
 *
 * API（backend）が返す値を優先し、無い場合（API が古い・ウィザードの選択のように id しか持たない）は
 * 同梱の小さい表（npm run sync-subsidies が正本から書く src/data/subsidy-attributes.json）から引く。
 * 見積の補助額の上限は backend の routers/estimates.subsidy_cap_for と同じ規則（画面と保存値・PDF を揃える）。
 */

import attributesJson from "@/data/subsidy-attributes.json";

export type MaxAmountUnit = "per_camera" | "total";

export interface SubsidyAttributes {
  max_amount_unit: MaxAmountUnit | null;
  max_units: number | null;
  applicant: string | null;
  indirect: boolean;
  camera_eligibility: "confirmed" | "unconfirmed" | null;
  regional_last_day: Record<string, string> | null;
}

/** 項目を持ちうる入力（API の Subsidy・id だけのオブジェクトなど） */
export type WithAttributes = { id: string } & {
  [K in keyof SubsidyAttributes]?: SubsidyAttributes[K] | null;
};

const DEFAULTS: SubsidyAttributes = {
  max_amount_unit: null,
  max_units: null,
  applicant: null,
  indirect: false,
  camera_eligibility: null,
  regional_last_day: null,
};

const BUNDLED = (attributesJson as { attributes: Record<string, Partial<SubsidyAttributes>> })
  .attributes;

const KEYS = Object.keys(DEFAULTS) as (keyof SubsidyAttributes)[];

/** 制度の性質の項目を返す（渡された値 → 同梱の表 → 既定値の順） */
export function subsidyAttributes(s: WithAttributes): SubsidyAttributes {
  const bundled = BUNDLED[s.id] ?? {};
  const out: Record<string, unknown> = { ...DEFAULTS };
  for (const key of KEYS) {
    const given = s[key];
    const value = given !== undefined ? given : bundled[key];
    out[key] = value ?? DEFAULTS[key];
  }
  return out as unknown as SubsidyAttributes;
}

/** 案内文（一覧・/match・詳細・ウィザードで同じ言葉を使う） */
export const CAMERA_UNCONFIRMED_NOTE = "カメラ機器が補助対象かは公式資料で確認できていません";
export const INDIRECT_GUIDE = "お住まいの市区町村（または都道府県）の担当窓口へ";

export function isCameraUnconfirmed(s: WithAttributes): boolean {
  return subsidyAttributes(s).camera_eligibility === "unconfirmed";
}

export function isIndirect(s: WithAttributes): boolean {
  return subsidyAttributes(s).indirect;
}

/** 上限額が「カメラ1台あたり」か */
export function isPerCameraCap(s: WithAttributes): boolean {
  return subsidyAttributes(s).max_amount_unit === "per_camera";
}

/**
 * 見積の補助額の上限（円）。backend subsidy_cap_for と同じ規則:
 * カメラ対象が未確認・上限0 → 0／1台あたり → 上限×台数（台数上限で頭打ち）／それ以外 → 上限額（総額）
 */
export function subsidyCap(s: WithAttributes, maxAmount: number, cameraCount: number): number {
  const attrs = subsidyAttributes(s);
  if (attrs.camera_eligibility === "unconfirmed") return 0;
  if (!Number.isFinite(maxAmount) || maxAmount <= 0) return 0;
  if (attrs.max_amount_unit !== "per_camera") return maxAmount;
  let units = Math.max(1, cameraCount);
  if (attrs.max_units) units = Math.min(units, attrs.max_units);
  return maxAmount * units;
}

/** 都道府県ごとの受付終了日を「都道府県 → 表示用の日付」の並びで返す（日付の早い順） */
export function regionalLastDays(s: WithAttributes): { prefecture: string; date: string }[] {
  const table = subsidyAttributes(s).regional_last_day ?? {};
  return Object.entries(table)
    .map(([prefecture, iso]) => ({ prefecture, date: iso }))
    .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -1 : 1));
}
