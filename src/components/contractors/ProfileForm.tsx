"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import { PREFECTURES } from "@/lib/constants";

export interface ProfileFormData {
  company_name: string;
  representative_name: string;
  prefecture: string;
  founded_year: string;
  employees: string;
  description: string;
}

interface ProfileFormProps {
  data: ProfileFormData;
  onChange: (data: ProfileFormData) => void;
  onSave: () => void;
  saving: boolean;
  saveMsg: string;
}

export default function ProfileForm({
  data,
  onChange,
  onSave,
  saving,
  saveMsg,
}: ProfileFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  function update(field: keyof ProfileFormData, value: string) {
    if (field === "description" && value.length > 500) return;
    onChange({ ...data, [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSave() {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    if (!data.company_name.trim()) newErrors.company_name = "会社名は必須です";
    if (data.description.length > 500) newErrors.description = "500文字以内で入力してください";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave();
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
        {errors.company_name && (
          <p className="text-xs text-error mt-1">{errors.company_name}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>代表者名</label>
        <input
          type="text"
          className={inputClass}
          value={data.representative_name}
          onChange={(e) => update("representative_name", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>所在地</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>設立年</label>
          <input
            type="number"
            className={inputClass}
            value={data.founded_year}
            onChange={(e) => update("founded_year", e.target.value)}
            placeholder="2010"
            min="1900"
            max="2100"
          />
        </div>
        <div>
          <label className={labelClass}>従業員数</label>
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
      </div>

      <div>
        <label className={labelClass}>紹介文</label>
        <textarea
          className={`${inputClass} resize-y min-h-[120px]`}
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="会社の紹介、得意分野、実績などを記入してください"
          rows={5}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.description ? (
            <span className="text-xs text-error">{errors.description}</span>
          ) : (
            <span />
          )}
          <span className="text-xs text-text2">{data.description.length}/500文字</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "変更を保存"}
        </Button>
        {saveMsg && (
          <span
            className={`text-sm ${saveMsg.includes("失敗") ? "text-error" : "text-success"}`}
          >
            {saveMsg}
          </span>
        )}
      </div>
    </div>
  );
}
