"use client";

import { useState, useMemo } from "react";
import HomepageExtractorPanel from "./HomepageExtractorPanel";
import ManualInputPanel from "./ManualInputPanel";
import FileUploadPanel from "./FileUploadPanel";
import type {
  CollectedInfo,
  CompanyInfo,
  EstimateSnapshot,
  SubsidySelection,
} from "./types";

// ── Minimal input mode: industry-specific defaults ─────────────
const INDUSTRY_DEFAULTS: Record<string, { challenges: string; kpi: string; schedule: string }> = {
  "小売業": {
    challenges: "店舗の防犯体制が不十分で、万引きや不審者対応に課題がある",
    kpi: "防犯カメラ導入による犯罪抑止効果の定量化（インシデント件数の削減）",
    schedule: "導入後3ヶ月以内に効果測定を実施",
  },
  "製造業": {
    challenges: "工場内の安全管理・品質管理における監視体制が不十分",
    kpi: "監視カメラによる品質不良の早期発見率向上",
    schedule: "導入後3ヶ月以内に効果測定を実施",
  },
  "サービス業": {
    challenges: "店舗・施設の安全管理と顧客対応品質の向上に課題がある",
    kpi: "セキュリティインシデント対応時間の短縮",
    schedule: "導入後3ヶ月以内に効果測定を実施",
  },
};
const DEFAULT_FALLBACK = {
  challenges: "業務効率化とセキュリティ強化に課題がある",
  kpi: "防犯カメラ導入による業務改善効果の定量化",
  schedule: "導入後3ヶ月以内に効果測定を実施",
};

interface Props {
  company: Partial<CompanyInfo>;
  subsidy?: SubsidySelection;
  estimate?: EstimateSnapshot;
  collectedInfo?: CollectedInfo;
  onBack: () => void;
  onNext: (info: CollectedInfo) => void;
}

export default function Step5Collect({
  company,
  subsidy,
  collectedInfo,
  onBack,
  onNext,
}: Props) {
  // ── State ──────────────────────────────────────────────────
  const [extracted, setExtracted] = useState<Record<string, string>>(
    collectedInfo?.extracted ?? {}
  );
  const [manual, setManual] = useState<Record<string, string>>(
    collectedInfo?.manual ?? {}
  );
  const [uploads, setUploads] = useState<CollectedInfo["uploads"]>(
    collectedInfo?.uploads ?? []
  );
  // Minimal input mode state
  const [minimalMode, setMinimalMode] = useState(false);
  const [minimalExtracted, setMinimalExtracted] = useState(false);

  // ── Derived from subsidy schema ────────────────────────────
  const infoFields = useMemo(() => subsidy?.required_info_fields ?? [], [subsidy]);
  const docFields = useMemo(() => subsidy?.required_documents ?? [], [subsidy]);
  const hasSubsidySchema = infoFields.length > 0 || docFields.length > 0;
  const showExtractor = infoFields.length > 0;

  const requiredInfoMet = useMemo(
    () =>
      infoFields
        .filter((f) => f.required)
        .every((f) => (manual[f.key] ?? extracted[f.key] ?? "").trim() !== ""),
    [infoFields, manual, extracted]
  );

  const requiredDocsMet = useMemo(
    () =>
      docFields
        .filter((d) => d.required)
        .every((d) => uploads.some((u) => u.document_key === d.key)),
    [docFields, uploads]
  );

  const fallbackFieldsMet = !!(
    manual["challenges"]?.trim() &&
    manual["kpi"]?.trim() &&
    manual["schedule"]?.trim()
  );
  const canProceed = hasSubsidySchema
    ? requiredInfoMet && requiredDocsMet
    : fallbackFieldsMet;

  // ── Handlers ───────────────────────────────────────────────
  function handleExtracted(fields: Record<string, string>) {
    setExtracted((prev) => ({ ...prev, ...fields }));
  }

  function handleManualChange(key: string, value: string) {
    setManual((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    onNext({ extracted, manual, uploads });
  }

  // Minimal mode: after HP extraction, fill remaining fields with industry defaults
  function handleMinimalExtracted(fields: Record<string, string>) {
    setExtracted((prev) => ({ ...prev, ...fields }));
    const industryKey = company.industry ?? "";
    const defaults = INDUSTRY_DEFAULTS[industryKey] ?? DEFAULT_FALLBACK;
    // Fill manual fields not already provided by extraction
    setManual((prev) => {
      const next = { ...prev };
      if (!fields["challenges"] && !next["challenges"]) next["challenges"] = defaults.challenges;
      if (!fields["kpi"] && !next["kpi"]) next["kpi"] = defaults.kpi;
      if (!fields["schedule"] && !next["schedule"]) next["schedule"] = defaults.schedule;
      return next;
    });
    setMinimalExtracted(true);
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2
          className="text-lg font-bold text-navy mb-1"
          style={{ fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}
        >
          Step 5：補助情報の収集
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          {subsidy ? (
            <>
              <span className="font-medium text-navy">{subsidy.name}</span>{" "}
              の申請に必要な補足情報とファイルを収集します。
            </>
          ) : (
            "補助金が選択されていません。Step 2 に戻って補助金を選択してください。"
          )}
        </p>
      </div>

      {/* Minimal input mode toggle (shown only when subsidy has info fields) */}
      {subsidy && infoFields.length > 0 && (
        <div className="rounded-[10px] border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-navy">
              {minimalMode ? "簡単入力モード中" : "入力を省略したいですか？"}
            </p>
            <p className="text-[12px] text-text-muted mt-0.5">
              {minimalMode
                ? "ホームページURLを入力して「抽出する」を押すと、残りの項目を自動入力します。"
                : "ホームページURLだけで申請情報を自動入力できます。"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setMinimalMode((v) => !v); setMinimalExtracted(false); }}
            className="whitespace-nowrap text-[13px] font-semibold px-4 py-2 rounded-[8px] border transition"
            style={minimalMode
              ? { borderColor: "var(--hc-border)", background: "white", color: "var(--hc-text-muted)" }
              : { borderColor: "var(--hc-primary)", background: "var(--hc-primary)", color: "white" }
            }
          >
            {minimalMode ? "詳細入力モードに切り替える" : "ホームページURLだけで入力を省略する"}
          </button>
        </div>
      )}

      {/* No subsidy selected */}
      {!subsidy ? (
        <EmptyState message="補助金を選択するとフォームが表示されます。" />
      ) : !hasSubsidySchema ? (
        /* Subsidy exists but has no extra schema — show fallback basic fields */
        <div className="space-y-4">
          <div className="rounded-[10px] border border-border p-5 bg-white">
            <p className="text-[13px] font-semibold text-navy mb-3">
              {subsidy.name} の申請に必要な基本情報を入力してください
            </p>
            {[
              { key: "challenges", label: "現在の課題・背景", placeholder: "例: 店舗の防犯体制が不十分で、盗難被害が年間○件発生している" },
              { key: "kpi", label: "導入後の目標（KPI）", placeholder: "例: 防犯カメラ導入により盗難件数を50%削減する" },
              { key: "schedule", label: "実施スケジュール", placeholder: "例: 導入後3ヶ月以内に全拠点への設置を完了し、効果測定を実施" },
            ].map((f) => (
              <div key={f.key} className="mb-3">
                <label className="block text-[12px] font-medium text-text-muted mb-1">
                  {f.label} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={manual[f.key] ?? ""}
                  onChange={(e) => handleManualChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full h-20 p-3 border border-border rounded-[8px] text-[13px] resize-y focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            ))}
          </div>
          {!(manual["challenges"]?.trim() && manual["kpi"]?.trim() && manual["schedule"]?.trim()) && (
            <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-3" role="alert">
              <p className="text-[12px] font-semibold text-amber-800">
                ⚠ 3項目すべて入力すると次へ進めます
              </p>
            </div>
          )}
        </div>
      ) : minimalMode ? (
        /* ── Minimal input mode ───────────────────────────────── */
        <div className="space-y-4">
          {/* HP extractor only */}
          <HomepageExtractorPanel
            websiteUrl={company.websiteUrl}
            subsidyId={subsidy.id}
            onExtracted={handleMinimalExtracted}
          />

          {/* Auto-fill summary shown after extraction */}
          {minimalExtracted && (
            <div className="rounded-[10px] border border-green-200 bg-green-50 p-5 space-y-3">
              <p className="text-[13px] font-semibold text-green-800">自動入力された項目を確認してください</p>
              <dl className="space-y-2">
                {[
                  { label: "課題・背景", value: extracted["challenges"] ?? manual["challenges"] },
                  { label: "KPI・効果指標", value: extracted["kpi"] ?? manual["kpi"] },
                  { label: "実施スケジュール", value: extracted["schedule"] ?? manual["schedule"] },
                ].map(({ label, value }) =>
                  value ? (
                    <div key={label}>
                      <dt className="text-[11px] font-semibold text-green-700">{label}</dt>
                      <dd className="text-[12px] text-green-900 mt-0.5">{value}</dd>
                    </div>
                  ) : null
                )}
              </dl>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                aria-disabled={!canProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-[8px] bg-primary text-white text-[14px] font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                確認して次へ（申請書類）
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Full / detail input mode ─────────────────────────── */
        <div className="space-y-6">
          {/* 1. Homepage auto-extractor */}
          {showExtractor && (
            <HomepageExtractorPanel
              websiteUrl={company.websiteUrl}
              subsidyId={subsidy.id}
              onExtracted={handleExtracted}
            />
          )}

          {/* 2. Dynamic manual input form */}
          {infoFields.length > 0 && (
            <div className="border border-border rounded-[10px] p-5 bg-white">
              <ManualInputPanel
                fields={infoFields}
                extracted={extracted}
                manual={manual}
                onChange={handleManualChange}
              />
            </div>
          )}

          {/* 3. Dynamic file upload panel */}
          {docFields.length > 0 && (
            <div className="border border-border rounded-[10px] p-5 bg-white">
              <FileUploadPanel
                documents={docFields}
                uploads={uploads}
                onUploadsChange={setUploads}
              />
            </div>
          )}

          {/* Validation summary (shows what's missing) */}
          {!canProceed && (
            <ValidationSummary
              infoFields={infoFields}
              docFields={docFields}
              manual={manual}
              extracted={extracted}
              uploads={uploads}
            />
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-[8px] border border-border bg-white text-[14px] font-medium text-text-muted hover:border-primary hover:text-navy transition"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Step 4 に戻る
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          aria-disabled={!canProceed}
          title={!canProceed ? "必須項目を入力・アップロードしてください" : undefined}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-[8px] bg-primary text-white text-[14px] font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次へ（申請書類）
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[10px] border border-border p-8 bg-white text-center">
      <div className="text-3xl mb-3" aria-hidden="true">📋</div>
      <p className="text-[13px] text-text-muted">{message}</p>
    </div>
  );
}

type InfoFields = NonNullable<SubsidySelection["required_info_fields"]>;
type DocFields = NonNullable<SubsidySelection["required_documents"]>;

interface ValidationSummaryProps {
  infoFields: InfoFields;
  docFields: DocFields;
  manual: Record<string, string>;
  extracted: Record<string, string>;
  uploads: CollectedInfo["uploads"];
}

function ValidationSummary({
  infoFields,
  docFields,
  manual,
  extracted,
  uploads,
}: ValidationSummaryProps) {
  const missingFields = infoFields.filter(
    (f) => f.required && (manual[f.key] ?? extracted[f.key] ?? "").trim() === ""
  );
  const missingDocs = docFields.filter(
    (d) => d.required && !uploads.some((u) => u.document_key === d.key)
  );

  if (missingFields.length === 0 && missingDocs.length === 0) return null;

  return (
    <div
      className="rounded-[8px] border border-amber-200 bg-amber-50 p-4"
      role="alert"
      aria-live="polite"
    >
      {missingFields.length > 0 && (
        <>
          <p className="text-[12px] font-semibold text-amber-800 mb-1.5">
            ⚠ 以下の必須項目が未入力です
          </p>
          <ul className="list-disc list-inside space-y-0.5 mb-2">
            {missingFields.map((f) => (
              <li key={f.key} className="text-[12px] text-amber-700">
                {f.label}
              </li>
            ))}
          </ul>
        </>
      )}
      {missingDocs.length > 0 && (
        <>
          <p className="text-[12px] font-semibold text-amber-800 mb-1.5">
            ⚠ 未アップロードの必須書類があります
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {missingDocs.map((d) => (
              <li key={d.key} className="text-[12px] text-amber-700">
                {d.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
