/**
 * Step 1（会社情報）のフォーム定義と、HP自動取得結果の反映ロジック。
 *
 * Step1Company.tsx から切り出した非JSX部分（1ファイル500行規約）。
 * 反映ルール（都道府県の照合・業種の柔軟一致・数値の正規化）は移設のみで挙動を変えない。
 */
import { z } from "zod";
import type { UseFormSetValue } from "react-hook-form";
import { INDUSTRIES, SERVICE_PREFECTURES } from "@/lib/constants";
import type { CompanyInfo } from "./types";

export const companySchema = z.object({
  companyName: z.string().min(1, "会社名を入力してください").max(120),
  representativeName: z.string().min(1, "代表者名を入力してください").max(60),
  address: z.string().min(1, "住所を入力してください").max(200),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  industry: z.string().min(1, "業種を選択してください"),
  employees: z
    .string()
    .min(1, "入力してください")
    .regex(/^[0-9]+$/, "半角数字で入力してください")
    .refine((v) => Number(v) >= 1 && Number(v) <= 100000, "1〜100000の範囲で入力してください"),
  annualRevenue: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9]+$/.test(v), "半角数字で入力してください"),
  websiteUrl: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^https?:\/\/.+/.test(v),
      "URLは http:// または https:// から始めてください",
    ),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

/** 抽出結果 → フォームフィールドのマッピング */
export const FIELD_MAP: Record<string, keyof CompanyFormValues> = {
  company_name: "companyName",
  representative_name: "representativeName",
  address: "address",
  prefecture: "prefecture",
  employees: "employees",
  annual_revenue: "annualRevenue",
  industry: "industry",
};

/** 抽出フィールドのラベル（結果表示用） */
export const FIELD_LABELS: Record<string, string> = {
  company_name: "会社名",
  representative_name: "代表者名",
  address: "住所",
  prefecture: "都道府県",
  industry: "業種",
  employees: "従業員数",
  annual_revenue: "年商",
  company_overview: "事業概要",
  capital: "資本金",
  established_date: "設立年月日",
  business_description: "主要事業",
};

export function toCompanyForm(d: Partial<CompanyInfo>): CompanyFormValues {
  return {
    companyName: d.companyName ?? "",
    representativeName: d.representativeName ?? "",
    address: d.address ?? "",
    prefecture: d.prefecture ?? "",
    industry: d.industry ?? "",
    employees: d.employees ? String(d.employees) : "",
    annualRevenue: d.annualRevenue ? String(d.annualRevenue) : "",
    websiteUrl: d.websiteUrl ?? "",
  };
}

/** 抽出値から都道府県を選ぶ（SERVICE_PREFECTURES と照合）。該当なしは null。 */
function matchPrefecture(value: string): string | null {
  return (SERVICE_PREFECTURES as readonly string[]).find((p) => value.includes(p)) ?? null;
}

/**
 * 抽出値から業種を選ぶ（INDUSTRIES と柔軟に照合）。
 * 例: 「廃棄物処理・資源リサイクル」→「廃棄物処理業」／「建設」→「建設業」
 * どれにも該当しなければ「その他」（未選択のままにしない）。
 */
function matchIndustry(value: string): string {
  const list = INDUSTRIES as readonly string[];
  return (
    // (1) 完全一致／抽出値が業種名を含む
    list.find((i) => value.includes(i)) ??
    // (2) 業種名から「業」を取った語幹が抽出値に含まれる
    list.find((i) => {
      const stem = i.replace(/業$/, "");
      return stem.length >= 2 && value.includes(stem);
    }) ??
    // (3) 抽出値の先頭ワードが業種名に含まれる
    list.find((i) => {
      const head = value.split(/[・、,\s/]/)[0];
      return head.length >= 2 && i.includes(head);
    }) ??
    "その他"
  );
}

/**
 * 抽出結果をフォームへ反映する。
 * @returns formFilled = フォームに反映できた件数 / extraFields = フォーム外の追加情報
 */
export function applyExtractedFields(
  fields: Record<string, unknown>,
  setValue: UseFormSetValue<CompanyFormValues>,
): { formFilled: number; extraFields: Record<string, string> } {
  let formFilled = 0;
  const extraFields: Record<string, string> = {};

  for (const [extractKey, value] of Object.entries(fields)) {
    if (!value) continue;
    const strValue = String(value);
    const formKey = FIELD_MAP[extractKey];

    if (!formKey) {
      // フォームに直接マッピングできないフィールドも保持（後続ステップ用）
      extraFields[extractKey] = strValue;
      continue;
    }

    if (formKey === "prefecture") {
      const matched = matchPrefecture(strValue);
      if (matched) {
        setValue("prefecture", matched, { shouldDirty: true });
        formFilled++;
      }
    } else if (formKey === "industry") {
      setValue("industry", matchIndustry(strValue), { shouldDirty: true });
      formFilled++;
    } else if (formKey === "employees" || formKey === "annualRevenue") {
      const numStr = strValue.replace(/[,、]/g, "");
      if (/^\d+$/.test(numStr)) {
        setValue(formKey, numStr, { shouldDirty: true });
        formFilled++;
      }
    } else {
      setValue(formKey, strValue, { shouldDirty: true });
      formFilled++;
    }
  }

  return { formFilled, extraFields };
}
