export const INDUSTRIES = [
  // 主ターゲット業種（先頭固定）
  "工場・製造業",
  "産廃ヤード",
  "老人福祉施設",
  "自治体・街頭防犯",
  // 一般業種
  "建設業",
  "医療・介護",
  "運輸業",
  "サービス業",
  "宿泊業",
  "農業・林業・水産業",
  "不動産業",
  "自治会・町会",
  // 後方（本業外）
  "小売業",
  "飲食業",
  "その他",
] as const;

/**
 * バックエンド補助金データの業種語彙（data/subsidies.json の target_industries・
 * routers/public_diagnose.py の _CANONICAL_INDUSTRIES ＋ 自治会・町会）。
 * /api/subsidies/match は target_industries と完全一致で絞り込むため、送る業種はこの語彙でなければならない。
 */
export const API_INDUSTRIES = [
  "製造業", "建設業", "サービス業", "小売業", "飲食業", "医療・介護",
  "不動産業", "宿泊業", "運輸業", "農業・林業・水産業", "廃棄物処理業", "その他",
  "自治会・町会",
] as const;

/**
 * 表示用業種（INDUSTRIES）→ バックエンド語彙の対応。ここに無い表示名は API_INDUSTRIES と同じ文字列。
 * 2026-10-27 点検: 主ターゲット4業種を表示名のまま送ると候補0件で 404 になっていた（「工場・製造業」で実測）。
 * 「自治体・街頭防犯」は自治会・町内会向けの街頭防犯補助が実体のため「自治会・町会」へ寄せる
 * （backend は業種名に「自治会/町会」を含むと防犯カテゴリの制度だけに絞る）。
 */
const API_INDUSTRY_BY_LABEL: Readonly<Record<string, string>> = {
  "工場・製造業": "製造業",
  "産廃ヤード": "廃棄物処理業",
  "老人福祉施設": "医療・介護",
  "自治体・街頭防犯": "自治会・町会",
};

/** 表示用業種をバックエンド語彙へ変換する（語彙そのものはそのまま返す＝何度通しても同じ結果）。 */
export function toApiIndustry(label: string): string {
  return API_INDUSTRY_BY_LABEL[label] ?? label;
}

export const WEBSITE_EXEMPT_INDUSTRIES: readonly string[] = ["自治会・町会"];

export const EMPLOYEE_RANGES = [
  { label: "1〜5名", value: 3 },
  { label: "6〜20名", value: 13 },
  { label: "21〜50名", value: 35 },
  { label: "51名以上", value: 100 },
] as const;

export const PURPOSES = [
  "防犯・万引き対策",
  "夜間見守り・転倒検知（介護）",
  "入退場管理",
  "作業員安全管理",
  "駐車場・屋外監視",
  "不法投棄防止・ヤード監視",
  "その他",
] as const;

export const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
] as const;

export const LP_PREFECTURES = [
  "東京都","大阪府","神奈川県","愛知県","埼玉県",
  "兵庫県","北海道","福岡県","千葉県","京都府",
] as const;

/** マルチックが施工対応する6都県（フルLP対象） */
export const SERVICE_PREFECTURES = [
  "東京都","神奈川県","静岡県","埼玉県","千葉県","山梨県",
] as const;

export type ServicePrefecture = (typeof SERVICE_PREFECTURES)[number];

export function isServicePrefecture(name: string): boolean {
  return (SERVICE_PREFECTURES as readonly string[]).includes(name);
}

/** 会社概要（partners/multik 等で使用） */
export const MULTIK_COMPANY = {
  name: "マルチック株式会社",
  nameEn: "Multik Co., Ltd.",
  website: "https://multik.jp",
  email: "contact@multik.jp",
  /** 施工相談・詳細見積もりの問い合わせ先（補助金申請相談は受け付けていない） */
  contact_url: "https://multik.jp/contact",
  manufacturer: "AVTECH Technology Corporation",
  relationship: "AVTECH日本正規代理店（契約書ベース）",
  address: "東京都",
} as const;
