"use client";

import type { RequiredInfoField } from "./types";

interface Props {
  fields: RequiredInfoField[];
  extracted: Record<string, string>;
  manual: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function ManualInputPanel({
  fields,
  extracted,
  manual,
  onChange,
}: Props) {
  if (fields.length === 0) {
    return (
      <p className="text-[13px] text-text-muted py-4 text-center">
        この補助金では追加情報の手動入力は不要です。
      </p>
    );
  }

  return (
    <section aria-labelledby="manual-input-heading">
      <h3
        id="manual-input-heading"
        className="text-[14px] font-bold text-navy mb-4"
        style={{ fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}
      >
        補助情報の入力・確認
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const isAutoFilled =
            !!extracted[field.key] && !manual[field.key];
          const value = manual[field.key] ?? extracted[field.key] ?? "";

          return (
            <FieldWrapper
              key={field.key}
              label={field.label}
              required={field.required}
              isAutoFilled={isAutoFilled}
            >
              <DynamicInput
                field={field}
                value={value}
                onChange={(v) => onChange(field.key, v)}
                isAutoFilled={isAutoFilled}
              />
            </FieldWrapper>
          );
        })}
      </div>
    </section>
  );
}

// ── Sub-components ────────────────────────────────────────────

interface FieldWrapperProps {
  label: string;
  required: boolean;
  isAutoFilled: boolean;
  children: React.ReactNode;
}

function FieldWrapper({ label, required, isAutoFilled, children }: FieldWrapperProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-[12px] text-text-muted">
          {label}
          {required && <span className="text-error ml-1" aria-label="必須">*</span>}
        </label>
        {isAutoFilled && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700"
            title="ホームページから自動取得済み。内容を確認してください。"
          >
            自動取得
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface DynamicInputProps {
  field: RequiredInfoField;
  value: string;
  onChange: (v: string) => void;
  isAutoFilled: boolean;
}

function DynamicInput({ field, value, onChange, isAutoFilled }: DynamicInputProps) {
  const baseClass = [
    "wizard-input w-full border border-border rounded-[8px] px-3 py-2 text-[14px] bg-white",
    "outline-none transition-colors focus:border-primary focus:focus-ring-hc",
    isAutoFilled ? "border-blue-300 bg-blue-50" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onChange(e.target.value);

  if (field.type === "textarea") {
    return (
      <textarea
        id={`field-${field.key}`}
        value={value}
        onChange={handleChange}
        rows={3}
        required={field.required}
        aria-required={field.required}
        className={baseClass}
        placeholder={isAutoFilled ? "自動取得済み（修正可能）" : `${field.label}を入力してください`}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        id={`field-${field.key}`}
        type="number"
        value={value}
        onChange={handleChange}
        required={field.required}
        aria-required={field.required}
        inputMode="numeric"
        className={baseClass}
        placeholder={isAutoFilled ? "自動取得済み（修正可能）" : "数値を入力"}
      />
    );
  }

  if (field.type === "date") {
    return (
      <input
        id={`field-${field.key}`}
        type="date"
        value={value}
        onChange={handleChange}
        required={field.required}
        aria-required={field.required}
        className={baseClass}
      />
    );
  }

  // default: text
  return (
    <input
      id={`field-${field.key}`}
      type="text"
      value={value}
      onChange={handleChange}
      required={field.required}
      aria-required={field.required}
      className={baseClass}
      placeholder={isAutoFilled ? "自動取得済み（修正可能）" : `${field.label}を入力してください`}
    />
  );
}
