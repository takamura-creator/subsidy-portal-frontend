import type { Tier2SubsidyType } from "@/lib/api";

export interface CompanyInfo {
  companyName: string;
  representativeName: string;
  address: string;
  prefecture: string;
  industry: string;
  employees: number;
  annualRevenue?: number;
  websiteUrl?: string;
}

export interface SubsidySelection {
  id: string;
  name: string;
  category?: string;
  maxAmount: number;
  rateMax: number;
  prefecture?: string;
  /** "jichitai_bouhan" の場合、maxAmount は 1 台あたり上限として扱う */
  draftSubsidyType?: string;
}

export interface ProductSelection {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  categoryId: string;
}

export interface EstimateSnapshot {
  id: string;
  totalBeforeSubsidy: number;
  subsidyAmount: number;
  selfPayment: number;
  installationCost: number;
  networkSetupCost: number;
  createdAt: string;
}

export type DocumentTier = "tier1" | "tier2" | "jichikai" | "unknown";
/**
 * Sprint 3 Task 0: `api.ts::Tier2SubsidyType` の再エクスポート。
 * 重複定義を避けるため本ファイルでは独自に Literal を持たない。
 */
export type DraftSubsidyType = Tier2SubsidyType;

export interface DraftSectionSnapshot {
  title: string;
  content: string;
  notes?: string | null;
  max_chars?: number | null;
}

export interface DraftSnapshot {
  subsidy_type: DraftSubsidyType;
  sections: DraftSectionSnapshot[];
  generated_at: string;
  disclaimer: string;
  fallback: boolean;
}

export interface Tier1DocStatus {
  templateId: string;
  name: string;
  generated: boolean;
  generatedAt?: string;
}

export interface DocumentsSnapshot {
  tier: DocumentTier;
  /** Tier 2 下書きがあれば保持（Step 6 プレビューでも参照） */
  draft?: DraftSnapshot;
  /** Tier 1 テンプレート差込の生成状況（Task 1 側で書き込む） */
  tier1Generated?: Tier1DocStatus[];
}

export interface WizardState {
  company: Partial<CompanyInfo>;
  subsidy?: SubsidySelection;
  products: ProductSelection[];
  estimate?: EstimateSnapshot;
  documents?: DocumentsSnapshot;
  reminderEmail?: string;
  hpExtracted?: Record<string, string>;
  qaAnswers?: Record<string, string>;
  documentId?: string;
  draftId?: string;
}

export const EMPTY_WIZARD_STATE: WizardState = {
  company: {},
  products: [],
};

/**
 * 補助金名・カテゴリから書類生成 Tier とサブタイプを判定する。
 * 他担当への申し送り: 補助金マスタに `subsidy_type` 列を追加する計画があれば、
 * そちらを優先するように書き換えてください。
 */
export function detectDocumentTier(subsidy?: SubsidySelection): {
  tier: DocumentTier;
  draftType?: DraftSubsidyType;
} {
  if (!subsidy) return { tier: "unknown" };
  const hay = `${subsidy.name} ${subsidy.category ?? ""}`;
  if (hay.includes("神奈川") || hay.includes("デジタル化支援")) {
    return { tier: "tier1" };
  }
  if (hay.includes("持続化")) return { tier: "tier2", draftType: "jizokuka" };
  if (hay.includes("IT導入") || hay.includes("ITツール") || hay.includes("ＩＴ導入") || hay.includes("デジタル化・AI"))
    return { tier: "tier2", draftType: "it_dounyu" };
  if (hay.includes("ものづくり") || hay.includes("もの作り"))
    return { tier: "tier2", draftType: "monodzukuri" };
  if (hay.includes("業務改善") || hay.includes("業務改善助成金"))
    return { tier: "tier2", draftType: "gyomu_kaizen" };
  // 自治会向け補助金（防犯カメラ系）は別 tier として扱い、専用パネルで案内する
  if (hay.includes("防犯カメラ") || hay.includes("地域防犯") || hay.includes("街頭防犯") || hay.includes("見守り") || hay.includes("防犯設備") || hay.includes("地域安全") || hay.includes("安全・安心まち")) {
    return { tier: "jichikai" };
  }
  return { tier: "unknown" };
}
