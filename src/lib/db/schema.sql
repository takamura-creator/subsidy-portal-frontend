-- HOJYO CAME Template Engine — Schema v1
-- Phase 1: UserProfile + SubsidyApplication + Templates

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  corporate_number TEXT,
  company_name TEXT NOT NULL,
  company_name_kana TEXT,
  address TEXT,
  established_date TEXT,
  capital INTEGER,
  industry_code TEXT,
  business_description TEXT,
  website_url TEXT,
  representative_name TEXT,
  representative_name_kana TEXT,
  representative_title TEXT,
  representative_dob_encrypted TEXT,
  contact_name TEXT,
  contact_title TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  employee_count_regular INTEGER,
  employee_count_part_time INTEGER,
  fiscal_month INTEGER,
  revenue_latest INTEGER,
  ordinary_profit_latest INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subsidy_applications (
  id TEXT PRIMARY KEY,
  user_profile_id TEXT NOT NULL REFERENCES user_profiles(id),
  subsidy_id TEXT,
  category TEXT NOT NULL CHECK(category IN ('CRIME_PREVENTION','DX_IT','EQUIPMENT_INVESTMENT','IT_INTRODUCTION','JIZOKUKA','MONODZUKURI')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','IN_PROGRESS','SUBMITTED','APPROVED','REJECTED')),
  deadline TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dx_it_extras (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL UNIQUE REFERENCES subsidy_applications(id),
  tool_name TEXT,
  vendor_name TEXT,
  current_issues TEXT,
  expected_effect_quantitative TEXT,
  expected_effect_qualitative TEXT,
  schedule_start TEXT,
  schedule_end TEXT,
  support_org_name TEXT,
  security_action_number TEXT
);

CREATE TABLE IF NOT EXISTS generated_documents (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES subsidy_applications(id),
  template_type TEXT NOT NULL,
  output_format TEXT NOT NULL CHECK(output_format IN ('PDF','DOCX','XLSX')),
  file_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expense_items (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES subsidy_applications(id),
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total INTEGER NOT NULL
);
