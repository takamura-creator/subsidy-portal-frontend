"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { INDUSTRIES, PREFECTURES } from "@/lib/constants";
import type { CompanyInfo } from "./types";

const schema = z.object({
  companyName: z.string().min(1, "会社名を入力してください").max(120),
  representativeName: z.string().min(1, "代表者名を入力してください").max(60),
  address: z.string().min(1, "住所を入力してください").max(200),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  industry: z.string().min(1, "業種を選択してください"),
  employees: z
    .string()
    .min(1, "従業員数を入力してください")
    .regex(/^[0-9]+$/, "従業員数は半角数字で入力してください")
    .refine((v) => Number(v) >= 1 && Number(v) <= 100000, "1〜100000の範囲で入力してください"),
  annualRevenue: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9]+$/.test(v), "年商は半角数字で入力してください"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaults: Partial<CompanyInfo>;
  onNext: (values: CompanyInfo) => void;
}

export default function Step1Company({ defaults, onNext }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(defaults),
  });

  useEffect(() => {
    reset(toForm(defaults));
  }, [defaults, reset]);

  function submit(values: FormValues) {
    const info: CompanyInfo = {
      companyName: values.companyName,
      representativeName: values.representativeName,
      address: values.address,
      prefecture: values.prefecture,
      industry: values.industry,
      employees: Number(values.employees),
      annualRevenue: values.annualRevenue ? Number(values.annualRevenue) : undefined,
    };
    onNext(info);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="space-y-5"
      aria-labelledby="step1-heading"
    >
      <div>
        <h2
          id="step1-heading"
          className="text-lg font-bold text-navy mb-1"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Step 1：会社情報
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          見積書・申請書類に差し込む基本情報です。あとから編集できます。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="会社名" error={errors.companyName?.message} required>
          <input
            {...register("companyName")}
            className="wizard-input"
            placeholder="株式会社〇〇"
            autoComplete="organization"
          />
        </Field>
        <Field label="代表者名" error={errors.representativeName?.message} required>
          <input
            {...register("representativeName")}
            className="wizard-input"
            placeholder="山田 太郎"
          />
        </Field>
        <Field label="都道府県" error={errors.prefecture?.message} required>
          <select {...register("prefecture")} className="wizard-input" autoComplete="address-level1">
            <option value="">選択してください</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="住所（都道府県以降）" error={errors.address?.message} required>
          <input
            {...register("address")}
            className="wizard-input"
            placeholder="〇〇区〇〇1-2-3"
            autoComplete="street-address"
          />
        </Field>
        <Field label="業種" error={errors.industry?.message} required>
          <select {...register("industry")} className="wizard-input">
            <option value="">選択してください</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
        <Field label="従業員数" error={errors.employees?.message} required>
          <input
            {...register("employees")}
            className="wizard-input"
            inputMode="numeric"
            placeholder="例: 20"
          />
        </Field>
        <Field label="年商（円・任意）" error={errors.annualRevenue?.message}>
          <input
            {...register("annualRevenue")}
            className="wizard-input"
            inputMode="numeric"
            placeholder="例: 100000000"
          />
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-60"
        >
          次へ（補助金選択）
        </button>
      </div>

      <style jsx>{`
        :global(.wizard-input) {
          width: 100%;
          border: 1px solid var(--hc-border);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          background: var(--hc-white);
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.wizard-input:focus) {
          border-color: var(--hc-primary);
          box-shadow: var(--hc-focus-ring);
        }
      `}</style>
    </form>
  );
}

function toForm(d: Partial<CompanyInfo>): FormValues {
  return {
    companyName: d.companyName ?? "",
    representativeName: d.representativeName ?? "",
    address: d.address ?? "",
    prefecture: d.prefecture ?? "",
    industry: d.industry ?? "",
    employees: d.employees ? String(d.employees) : "",
    annualRevenue: d.annualRevenue ? String(d.annualRevenue) : "",
  };
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] text-text-muted mb-1">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[12px] text-error">{error}</p>}
    </div>
  );
}
