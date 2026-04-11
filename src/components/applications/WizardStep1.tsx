"use client";

import { useEffect } from "react";
import Button from "@/components/shared/Button";
import { fetchProfileDetail, type UserProfileDetail } from "@/lib/api";
import { INDUSTRIES, PREFECTURES } from "@/lib/constants";

export interface Step1Data {
  company_name: string;
  industry: string;
  employees: string;
  annual_revenue: string;
  prefecture: string;
  representative_name: string;
  phone: string;
  email: string;
}

interface WizardStep1Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  onNext: () => void;
  onSaveDraft: () => void;
  saving: boolean;
}

export default function WizardStep1({
  data,
  onChange,
  onNext,
  onSaveDraft,
  saving,
}: WizardStep1Props) {
  useEffect(() => {
    if (data.email) return; // 既にプリフィル済み
    fetchProfileDetail()
      .then((profile: UserProfileDetail) => {
        onChange({
          company_name: profile.company_name || "",
          industry: profile.industry || "",
          employees: profile.employees != null ? String(profile.employees) : "",
          annual_revenue: profile.annual_revenue != null ? String(profile.annual_revenue) : "",
          prefecture: profile.prefecture || "",
          representative_name: profile.representative_name || "",
          phone: profile.phone || "",
          email: profile.email || "",
        });
      })
      .catch(() => {
        // プロフィール取得失敗時は空のまま
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const errors: Partial<Record<keyof Step1Data, string>> = {};
  function validate(): boolean {
    let valid = true;
    if (!data.company_name.trim()) { errors.company_name = "必須"; valid = false; }
    if (!data.industry) { errors.industry = "必須"; valid = false; }
    if (!data.employees.trim()) { errors.employees = "必須"; valid = false; }
    if (!data.prefecture) { errors.prefecture = "必須"; valid = false; }
    if (!data.representative_name.trim()) { errors.representative_name = "必須"; valid = false; }
    if (!data.phone.trim()) { errors.phone = "必須"; valid = false; }
    return valid;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  function update(field: keyof Step1Data, value: string) {
    onChange({ ...data, [field]: value });
  }

  const inputClass =
    "w-full rounded-[10px] border border-border bg-bg-card px-3.5 py-3 text-[16px] focus:border-primary focus:shadow-[var(--portal-focus-ring)] outline-none transition-colors";
  const selectClass = `${inputClass} appearance-none`;
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>会社名 *</label>
        <input
          type="text"
          className={inputClass}
          value={data.company_name}
          onChange={(e) => update("company_name", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>業種 *</label>
        <select
          className={selectClass}
          value={data.industry}
          onChange={(e) => update("industry", e.target.value)}
        >
          <option value="">選択してください</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>従業員数 *</label>
          <div className="relative">
            <input
              type="number"
              className={inputClass}
              value={data.employees}
              onChange={(e) => update("employees", e.target.value)}
              min="1"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-text2">名</span>
          </div>
        </div>
        <div>
          <label className={labelClass}>年商（万円）</label>
          <input
            type="number"
            className={inputClass}
            value={data.annual_revenue}
            onChange={(e) => update("annual_revenue", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>所在地 *</label>
        <select
          className={selectClass}
          value={data.prefecture}
          onChange={(e) => update("prefecture", e.target.value)}
        >
          <option value="">選択してください</option>
          {PREFECTURES.map((pref) => (
            <option key={pref} value={pref}>{pref}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>代表者名 *</label>
        <input
          type="text"
          className={inputClass}
          value={data.representative_name}
          onChange={(e) => update("representative_name", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>電話番号 *</label>
        <input
          type="tel"
          className={inputClass}
          value={data.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>メールアドレス</label>
        <input
          type="email"
          className={`${inputClass} bg-bg-surface text-text2 cursor-not-allowed`}
          value={data.email}
          disabled
        />
        <p className="text-xs text-text2 mt-1">変更不可</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="secondary" onClick={onSaveDraft} disabled={saving}>
          {saving ? "保存中..." : "下書き保存"}
        </Button>
        <Button onClick={handleNext}>次へ →</Button>
      </div>
    </div>
  );
}
