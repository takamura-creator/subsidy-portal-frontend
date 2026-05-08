export type TemplateCategory = "CRIME_PREVENTION" | "DX_IT" | "EQUIPMENT_INVESTMENT";
export type OutputFormat = "PDF" | "DOCX" | "XLSX";

export interface UserProfile {
  company_name: string;
  company_name_kana?: string;
  corporate_number?: string;
  address?: string;
  established_date?: string;
  capital?: number;
  industry_code?: string;
  business_description?: string;
  website_url?: string;
  representative_name?: string;
  representative_name_kana?: string;
  representative_title?: string;
  contact_name?: string;
  contact_title?: string;
  contact_phone?: string;
  contact_email?: string;
  employee_count_regular?: number;
  employee_count_part_time?: number;
  fiscal_month?: number;
  revenue_latest?: number;
  ordinary_profit_latest?: number;
}

export interface DxItExtra {
  tool_name?: string;
  vendor_name?: string;
  current_issues?: string;
  expected_effect_quantitative?: string;
  expected_effect_qualitative?: string;
  schedule_start?: string;
  schedule_end?: string;
  support_org_name?: string;
  security_action_number?: string;
}

export interface ExpenseItem {
  category: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface GenerateRequest {
  category: TemplateCategory;
  format: OutputFormat;
  profile: UserProfile;
  extras?: DxItExtra;
  expenses?: ExpenseItem[];
  subsidy_amount?: number;
}

export interface TemplateInfo {
  category: TemplateCategory;
  name: string;
  description: string;
  required_fields: string[];
  optional_fields: string[];
}

export interface DocumentRequirement {
  name: string;
  format: string;
  required: boolean;
  note?: string;
}
