"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { INDUSTRIES, SERVICE_PREFECTURES } from "@/lib/constants";
import { authFetch, ApiError } from "@/lib/api";
import type { CompanyInfo } from "./types";
import { Field, Spinner } from "./FormField";
import {
  applyExtractedFields,
  companySchema,
  FIELD_LABELS,
  toCompanyForm,
  type CompanyFormValues,
} from "./step1CompanyForm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FormValues = CompanyFormValues;

interface ExtractionResponse {
  extracted_fields: Record<string, string>;
  fallback: boolean;
  errors?: string[];
}

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
    resolver: zodResolver(companySchema),
    defaultValues: toCompanyForm(defaults),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const websiteUrl = watch("websiteUrl");
  const watchedIndustry = watch("industry");
  const isJichikai = watchedIndustry === "自治会・町会";

  /**
   * トップ診断から引き継がれた URL（初回レンダー時に確定させる）。
   * 会社名が既に入っている下書きは「ユーザーが作業済み」とみなし自動取得しない。
   * 引き継ぎが無い／URL が壊れている場合は空 → 従来どおり手入力の画面になる。
   */
  const [handedOverUrl] = useState<string>(() => {
    const url = (defaults.websiteUrl ?? "").trim();
    if (defaults.companyName) return "";
    return /^https?:\/\/.+/.test(url) ? url : "";
  });

  // アカウント設定のプロフィール情報を初期入力に反映（websiteUrl だけでなく主要項目すべて）
  // ウィザード保存値（defaults）が空のフィールドのみ profile から補完
  useEffect(() => {
    let cancelled = false;
    import("@/lib/api").then(({ fetchProfileDetail }) => {
      fetchProfileDetail()
        .then((p) => {
          if (cancelled) return;
          // 各フィールド: 既存値がない場合のみプロフィールで埋める（ユーザー入力を上書きしない）
          const fill = (key: keyof FormValues, val?: string | number) => {
            if (val === undefined || val === null || val === "") return;
            const current = String((defaults as Record<string, unknown>)?.[key] ?? "").trim();
            if (current) return; // ユーザー入力済なら触らない
            setValue(key, String(val), { shouldDirty: false });
          };
          fill("companyName", p.company_name);
          fill("representativeName", p.representative ?? p.representative_name);
          fill("websiteUrl", p.website_url);
          // 住所・電話は表示中フォームに用意がある場合のみ
          // 都県は pref_code → 名称マッピング不要（profile.prefecture を採用）
          if (p.prefecture) fill("prefecture", p.prefecture);
          if (p.industry) fill("industry", p.industry);
          if (p.employees) fill("employees", p.employees);
          if (p.annual_revenue) fill("annualRevenue", p.annual_revenue);
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [defaults, setValue]);

  // HP extraction state
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  /** 自動実行（引き継ぎ）が失敗したときの控えめな案内。手入力へ静かに縮退させる */
  const [autoNotice, setAutoNotice] = useState("");
  const [extractResult, setExtractResult] = useState<{
    count: number;
    formFilled: number;
    extraFields: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    reset(toCompanyForm(defaults));
  }, [defaults, reset]);

  /**
   * ホームページから会社情報を自動取得 → フォームに反映。
   * @param auto true = 引き継ぎURLによる自動実行（失敗時は赤いエラーではなく控えめな案内）
   * @param urlOverride 自動実行時に使う URL（フォーム watch の反映待ちを避ける）
   */
  const runExtract = useCallback(
    async (auto: boolean, urlOverride?: string) => {
      const target = (urlOverride ?? websiteUrl ?? "").trim();
      if (!target || !/^https?:\/\/.+/.test(target)) return;
      setExtracting(true);
      setExtractError("");
      setAutoNotice("");
      setExtractResult(null);

      try {
        const res = await authFetch<ExtractionResponse>(
          `${API_BASE}/api/extractions/homepage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: target, subsidy_id: "" }),
          },
        );

        const fields = res.extracted_fields ?? {};
        const { formFilled, extraFields } = applyExtractedFields(fields, setValue);

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
        const message =
          err instanceof ApiError
            ? err.status === 401
              ? "ログインが必要です。ページを再読み込みしてログインし直してください。"
              : err.status === 403
                ? "アクセス権限がありません。"
                : err.status === 408 || err.message?.includes("タイムアウト")
                  ? "ホームページの取得がタイムアウトしました。URLを確認して再度お試しください。"
                  : `自動取得に失敗しました（${err.message}）`
            : "自動取得に失敗しました。しばらく待ってから再度お試しください。";
        if (auto) {
          // ユーザーが押していない処理の失敗で驚かせない。フォームはそのまま手入力できる
          setAutoNotice("自動取得できませんでした。下のフォームに直接ご入力ください。");
        } else {
          setExtractError(message);
        }
        // O6: 失敗時も空オブジェクトで通知（Step6QA の autoFill が undefined 安全に動作）
        if (onHpExtracted) {
          onHpExtracted({});
        }
      } finally {
        setExtracting(false);
      }
    },
    [websiteUrl, setValue],
  );

  /** 手動の「自動取得」ボタン */
  const handleExtract = useCallback(() => {
    void runExtract(false);
  }, [runExtract]);

  /**
   * 引き継がれた URL があれば、ユーザーの再入力・再クリックなしで 1 度だけ自動取得する。
   * 失敗しても手入力フォームは常に操作可能（行き止まりを作らない）。
   */
  const autoRanRef = useRef(false);
  useEffect(() => {
    if (autoRanRef.current || !handedOverUrl) return;
    autoRanRef.current = true;
    // effect 内での同期 setState を避けるため次のタスクで起動する
    setTimeout(() => {
      void runExtract(true, handedOverUrl);
    }, 0);
  }, [handedOverUrl, runExtract]);

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
          style={{ fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}
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
              style={{ fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}
            >
              ホームページから自動取得
            </h3>
            <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
              URLを入力して「自動取得」を押すと、AIが会社情報を読み取ってフォームに反映します。
            </p>
            {handedOverUrl && (
              <p className="text-[12px] text-primary mt-1 leading-relaxed" role="status">
                トップページの診断で入力したURLを引き継ぎました。内容はこの画面で修正できます。
              </p>
            )}
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

        {/* Error（ユーザーが「自動取得」を押した場合） */}
        {extractError && !extracting && (
          <div
            className="rounded-[8px] border border-red-200 bg-red-50 p-3 mt-3 text-[12px] text-red-700"
            role="alert"
            aria-live="assertive"
          >
            {extractError}
          </div>
        )}

        {/* 自動実行の失敗（引き継ぎURL）— 手入力へ静かに縮退させる案内 */}
        {autoNotice && !extracting && (
          <div
            className="rounded-[8px] border border-[var(--hc-border)] bg-[var(--hc-white)] p-3 mt-3 text-[12px] text-text-muted"
            role="status"
            aria-live="polite"
          >
            {autoNotice}（URLを直して「自動取得」をもう一度押すこともできます）
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
            {SERVICE_PREFECTURES.map((p) => (
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
        <Field label={isJichikai ? "世帯数" : "従業員数"} error={errors.employees?.message} required>
          <input
            {...register("employees")}
            className="wizard-input"
            inputMode="numeric"
            placeholder={isJichikai ? "例: 500" : "例: 20"}
          />
        </Field>
        <Field
          label={isJichikai ? "年間予算（円・任意）" : "年商（円・任意）"}
          error={errors.annualRevenue?.message}
        >
          <input
            {...register("annualRevenue")}
            className="wizard-input"
            inputMode="numeric"
            placeholder={isJichikai ? "例: 5000000" : "例: 100000000"}
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

