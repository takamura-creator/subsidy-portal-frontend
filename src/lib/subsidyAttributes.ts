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

/* ── 2026-10-28（審査 [2][3][6][8]）: 申請の導線と都道府県ごとの受付終了 ── */

/** 個人宅向けの制度のカテゴリ（正本の category） */
export const HOME_CATEGORY = "個人宅防犯";

/** 個人宅向けの制度か（申請は住民が区市町村へ行う。ウィザードの業種に個人宅は無い） */
export function isHomeSubsidy(s: { category?: string | null }): boolean {
  return s.category === HOME_CATEGORY;
}

export const HOME_GUIDE = "お住まいの区市町村の窓口・公式ページから申請";

/** カード・診断結果に出す「直接は申請できない」注記（申請者が分かれば添える） */
export function indirectNoteText(s: WithAttributes): string {
  const { applicant } = subsidyAttributes(s);
  return `直接は申請できません。申請は市町村（または都道府県）を通じて行います${applicant ? `（申請者は${applicant}）` : ""}`;
}

/**
 * 見積もり作成・申請書類テンプレート・ウィザードの導線を出してよいか。
 * 直接申請できない制度（indirect）と個人宅向けの制度は出さない（申請先は自治体の窓口）。
 */
export function canUseApplicationTools(s: WithAttributes & { category?: string | null }): boolean {
  return !isIndirect(s) && !isHomeSubsidy(s);
}

/** 今日の日付（日本時間）を YYYY-MM-DD で返す */
export function todayJstIso(now: Date = new Date()): string {
  // sv-SE ロケールは YYYY-MM-DD 形式で出る
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(now);
}

/** 都道府県ごとに受付終了日がある制度か */
export function hasRegionalDeadlines(s: WithAttributes): boolean {
  const table = subsidyAttributes(s).regional_last_day;
  return !!table && Object.keys(table).length > 0;
}

/** その都道府県の最終受付日（ISO）。表に無ければ null */
export function regionalLastDay(s: WithAttributes, prefecture: string | null | undefined): string | null {
  if (!prefecture) return null;
  return subsidyAttributes(s).regional_last_day?.[prefecture] ?? null;
}

/** その都道府県では最終受付日を過ぎているか（最終受付日の当日は受付中として扱う） */
export function isRegionallyClosed(
  s: WithAttributes,
  prefecture: string | null | undefined,
  today: string = todayJstIso(),
): boolean {
  const last = regionalLastDay(s, prefecture);
  return last !== null && last < today;
}

/**
 * 診断結果に出す一致度（2026-10-28 試験 [1-f][2]）。カメラ機器が補助対象と確認できていない制度は
 * backend が「高」を返しても「中」までにする（防犯カメラ目的の利用者が「使える」と受け取らないように）。
 */
export function displayMatchScore(score: string, s: WithAttributes): string {
  return score === "高" && isCameraUnconfirmed(s) ? "中" : score;
}

/**
 * 湘南エリアの制度か（2026-10-28 試験 [4-a]）。「湘南エリア 9件の施工実績」は藤沢市鵠沼地区の実績なので、
 * 湘南エリアの市町の制度にだけ出す（浜松・埼玉・川口などには出さない）。正本に市町村の項目が無いため名前で見る。
 */
const SHONAN_MUNICIPALITIES = ["藤沢", "茅ヶ崎", "茅ケ崎", "鎌倉", "平塚", "逗子", "葉山", "寒川", "大磯", "二宮"] as const;

export function isShonanSubsidy(s: { name?: string | null; prefecture?: string | null }): boolean {
  if (s.prefecture !== "神奈川県" || !s.name) return false;
  const name = s.name;
  return SHONAN_MUNICIPALITIES.some((m) => name.includes(m));
}

/** 施工の相談先の案内（湘南以外の制度で使う。FAQ・詳細で同じ言葉） */
export const SERVICE_AREA_GUIDE =
  "東京都・神奈川県・静岡県・埼玉県・千葉県・山梨県の6都県でマルチックが直接施工対応します。それ以外の地域はご相談ください。";
