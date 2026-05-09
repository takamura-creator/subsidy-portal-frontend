"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { INDUSTRIES, PREFECTURES } from "@/lib/constants";
import { authFetch, ApiError } from "@/lib/api";
import type { CompanyInfo } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const schema = z
  .object({
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
    websiteUrl: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^https?:\/\/.+/.test(v),
        "URLは http:// または https:// から始めてください",
      ),
  })

type FormValues = z.infer<typeof schema>;

interface ExtractionResponse {
  extracted_fields: Record<string, string>;
  fallback: boolean;
  errors?: string[];
}

/** 抽出結果 → フォームフィールドのマッピング */
const FIELD_MAP: Record<string, keyof FormValues> = {
  company_name: "companyName",
  representative_name: "representativeName",
  address: "address",
  prefecture: "prefecture",
  employees: "employees",
  annual_revenue: "annualRevenue",
  industry: "industry",
};

/** 抽出フィールドのラベル（結果表示用） */
const FIELD_LABELS: Record<string, string> = {
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

interface Props {
  defaults: Partial<CompanyInfo>;
  onNext: (values: CompanyInfo) => void;
  /** HP自動取得で得られた追加情報を保存（事業計画書に使用） */
  onHpExtracted?: (fields: Record<string, string>) => void;
}

export default function Step1Company({ defaults, onNext, onHpExtracted }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(defaults),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const websiteUrl = watch("websiteUrl");

  // HP extraction state
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractResult, setExtractResult] = useState<{
    count: number;
    formFilled: number;
    extraFields: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    reset(toForm(defaults));
  }, [defaults, reset]);

  /** ホームページから会社情報を自動取得 → フォームに反映 */
  const handleExtract = useCallback(async () => {
    if (!websiteUrl || !/^https?:\/\/.+/.test(websiteUrl)) return;
    setExtracting(true);
    setExtractError("");
    setExtractResult(null);

    try {
      const res = await authFetch<ExtractionResponse>(
        `${API_BASE}/api/extractions/homepage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: websiteUrl, subsidy_id: "" }),
        },
      );

      const fields = res.extracted_fields;
      let formFilled = 0;
      const extraFields: Record<string, string> = {};

      // 抽出結果をフォームフィールドにマッピング
      for (const [extractKey, value] of Object.entries(fields)) {
        if (!value) continue;
        const strValue = String(value);
        const formKey = FIELD_MAP[extractKey];

        if (formKey) {
          // 都道府県: PREFECTURES リストと照合
          if (formKey === "prefecture") {
            const matched = (PREFECTURES as readonly string[]).find(
              (p) => strValue.includes(p),
            );
            if (matched) {
              setValue("prefecture", matched, { shouldDirty: true });
              formFilled++;
            }
          }
          // 業種: INDUSTRIES リストと照合
          else if (formKey === "industry") {
            const matched = (INDUSTRIES as readonly string[]).find(
              (i) => strValue.includes(i),
            );
            if (matched) {
              setValue("industry", matched, { shouldDirty: true });
              formFilled++;
            }
          }
          // 数値フィールド
          else if (formKey === "employees" || formKey === "annualRevenue") {
            const numStr = String(value).replace(/[,、]/g, "");
            if (/^\d+$/.test(numStr)) {
              setValue(formKey, numStr, { shouldDirty: true });
              formFilled++;
            }
          }
          // テキストフィールド
          else {
            setValue(formKey, strValue, { shouldDirty: true });
            formFilled++;
          }
        }

        // フォームに直接マッピングできないフィールドも保持（後続ステップ用）
        if (!formKey) {
          extraFields[extractKey] = strValue;
        }
      }

      setExtractResult({
        count: Object.keys(fields).length,
        formFilled,
        extraFields,
      });

      // 全抽出結果を親に通知（事業計画書 Step 7/8 で使用）
      if (onHpExtracted) {
        const allFields: Record<string, string> = {};
        for (const [k, v] of Object.entries(fields)) {
          if (v) allFields[k] = String(v);
        }
        onHpExtracted(allFields);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setExtractError(
          err.status === 401
            ? "ログインが必要です。ページを再読み込みしてログインし直してください。"
            : err.status === 403
              ? "アクセス権限がありません。"
              : err.status === 408 || err.message?.includes("タイムアウト")
                ? "ホームページの取得がタイムアウトしました。URLを確認して再度お試しください。"
                : `自動取得に失敗しました（${err.message}）`,
        );
      } else {
        setExtractError("自動取得に失敗しました。しばらく待ってから再度お試しください。");
      }
      // O6: 失敗時も空オブジェクトで通知（Step6QA の autoFill が undefined 安全に動作）
      if (onHpExtracted) {
        onHpExtracted({});
      }
    } finally {
      setExtracting(false);
    }
  }, [websiteUrl, setValue]);

  function submit(values: FormValues) {
    const info: CompanyInfo = {
      companyName: values.companyName,
      representativeName: values.representativeName,
      address: values.address,
      prefecture: values.prefecture,
      industry: values.industry,
      employees: Number(values.employees),
      annualRevenue: values.annualRevenue ? Number(values.annualRevenue) : undefined,
      websiteUrl: values.websiteUrl || undefined,
    };
    onNext(info);
  }

  const canExtract = !!websiteUrl && /^https?:\/\/.+/.test(websiteUrl) && !extracting;

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
          見積書・申請書類に差し込む基本情報です。ホームページURLから自動取得もできます。
        </p>
      </div>

      {/* ─── HP自動取得セクション ─── */}
      <section
        className="border border-primary/30 rounded-[10px] p-5 bg-[var(--hc-bg,#f7f9fc)]"
        aria-labelledby="hp-extract-heading"
      >
        <div className="flex items-start gap-3 mb-3">
          <span
            className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm"
            aria-hidden="true"
          >
            🌐
          </span>
          <div>
            <h3
              id="hp-extract-heading"
              className="text-[14px] font-bold text-navy"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              ホームページから自動取得
            </h3>
            <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
              URLを入力して「自動取得」を押すと、AIが会社情報を読み取ってフォームに反映します。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <input
              {...register("websiteUrl")}
              className="wizard-input"
              placeholder="https://example.co.jp"
              autoComplete="url"
            />
            {errors.websiteUrl && (
              <p className="mt-1 text-[12px] text-error">{errors.websiteUrl.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleExtract}
            disabled={!canExtract}
            aria-busy={extracting}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-[10px] rounded-[8px] bg-primary text-white text-[13px] font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {extracting ? (
              <>
                <Spinner />
                取得中…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M7 1a6 6 0 1 1-4.243 1.757"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path d="M1 5V1h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                自動取得
              </>
            )}
          </button>
        </div>

        {/* Loading skeleton */}
        {extracting && (
          <div role="status" aria-label="情報を取得中です" className="space-y-2 mt-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-4 rounded bg-gray-200 animate-pulse"
                style={{ width: `${60 + i * 10}%` }}
              />
            ))}
          </div>
        )}

        {/* Success */}
        {extractResult && !extracting && (
          <div
            className="rounded-[8px] border border-green-200 bg-green-50 p-3 mt-3"
            role="status"
            aria-live="polite"
          >
            <p className="text-[12px] font-semibold text-green-700">
              ✓ {extractResult.count}件の情報を取得し、{extractResult.formFilled}件をフォームに反映しました
            </p>
            {Object.keys(extractResult.extraFields).length > 0 && (
              <details className="mt-2">
                <summary className="text-[11px] text-green-700 cursor-pointer hover:underline">
                  その他の取得情報（事業計画書に使用）
                </summary>
                <ul className="mt-1 space-y-0.5">
                  {Object.entries(extractResult.extraFields).map(([k, v]) => (
                    <li key={k} className="text-[11px] text-green-800 flex gap-2">
                      <span className="font-medium min-w-[80px]">{FIELD_LABELS[k] ?? k}:</span>
                      <span className="truncate text-green-700">{v}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Error */}
        {extractError && !extracting && (
          <div
            className="rounded-[8px] border border-red-200 bg-red-50 p-3 mt-3 text-[12px] text-red-700"
            role="alert"
            aria-live="assertive"
          >
            {extractError}
          </div>
        )}
      </section>

      {/* ─── 会社情報フォーム ─── */}
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
    websiteUrl: d.websiteUrl ?? "",
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

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="22 10" />
    </svg>
  );
}
