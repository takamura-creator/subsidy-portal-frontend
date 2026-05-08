import type { TemplateInfo, DocumentRequirement } from "./types";

export const TEMPLATES: Record<string, TemplateInfo> = {
  CRIME_PREVENTION: {
    category: "CRIME_PREVENTION",
    name: "防犯カメラ設置補助金用テンプレート",
    description: "自治会・商店街向け防犯カメラ設置補助金の交付申請書テンプレート",
    required_fields: [
      "company_name",
      "representative_name",
      "address",
      "contact_phone",
      "contact_email",
    ],
    optional_fields: [
      "capital",
      "employee_count_regular",
      "business_description",
    ],
  },
  DX_IT: {
    category: "DX_IT",
    name: "DX/IT推進補助金用テンプレート",
    description:
      "中小企業向けDX・IT推進補助金の交付申請書＋事業計画書テンプレート",
    required_fields: [
      "company_name",
      "representative_name",
      "address",
      "corporate_number",
      "capital",
      "employee_count_regular",
      "industry_code",
      "established_date",
      "revenue_latest",
      "ordinary_profit_latest",
    ],
    optional_fields: [
      "company_name_kana",
      "representative_name_kana",
      "website_url",
      "contact_name",
      "contact_phone",
      "contact_email",
    ],
  },
  EQUIPMENT_INVESTMENT: {
    category: "EQUIPMENT_INVESTMENT",
    name: "設備投資補助金用テンプレート",
    description: "中小企業向け設備投資補助金の交付申請書＋事業実施計画書テンプレート",
    required_fields: [
      "company_name",
      "representative_name",
      "address",
      "corporate_number",
      "capital",
      "employee_count_regular",
      "revenue_latest",
    ],
    optional_fields: [
      "industry_code",
      "established_date",
      "contact_name",
      "contact_phone",
    ],
  },
};

export const DOCUMENT_REQUIREMENTS: Record<string, DocumentRequirement[]> = {
  DX_IT: [
    { name: "交付申請書", format: "Word/Excel", required: true },
    { name: "事業計画書", format: "Word", required: true, note: "導入目的・効果" },
    { name: "経費内訳・予算書", format: "Excel", required: true, note: "費目別" },
    { name: "誓約書", format: "Word", required: true },
    { name: "登記簿謄本", format: "PDF", required: true, note: "法人のみ" },
    { name: "決算書（直近2期）", format: "PDF", required: true },
    { name: "導入ツール概要資料", format: "PDF", required: true },
    { name: "見積書", format: "任意", required: true },
  ],
  CRIME_PREVENTION: [
    { name: "補助金交付申請書", format: "Word", required: true },
    { name: "設置場所位置図・現況写真", format: "PDF/画像", required: true },
    { name: "警察との事前協議証明", format: "Word/任意", required: true },
    { name: "自治会総会合意書類", format: "Word/任意", required: true },
    { name: "見積書", format: "任意", required: true },
    { name: "管理運用規程", format: "Word", required: true },
    { name: "撮影範囲図面", format: "任意", required: true },
    { name: "土地使用承諾書", format: "Word", required: false, note: "私有地設置時" },
  ],
  EQUIPMENT_INVESTMENT: [
    { name: "交付申請書", format: "Word/Excel", required: true },
    { name: "事業実施計画書", format: "Word", required: true },
    { name: "収支計画書", format: "Excel", required: true },
    { name: "見積書（2社以上）", format: "任意", required: true },
    { name: "決算書（直近2〜3期）", format: "PDF", required: true },
    { name: "登記事項証明書", format: "PDF", required: true },
    { name: "誓約書", format: "Word", required: true },
    { name: "会社概要/定款", format: "任意", required: false },
  ],
};
