"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export interface WizardStepDef {
  id: number;
  label: string;
  shortLabel: string;
}

export const WIZARD_STEPS: WizardStepDef[] = [
  { id: 1, label: "会社情報", shortLabel: "会社" },
  { id: 2, label: "補助金選択", shortLabel: "補助金" },
  { id: 3, label: "製品・構成", shortLabel: "製品" },
  { id: 4, label: "見積もり", shortLabel: "見積" },
  { id: 5, label: "申請書類", shortLabel: "書類" },
  { id: 6, label: "プレビュー", shortLabel: "出力" },
];

export const JIZOKUKA_STEPS: WizardStepDef[] = [
  { id: 1, label: "会社情報", shortLabel: "会社" },
  { id: 2, label: "補助金選択", shortLabel: "補助金" },
  { id: 3, label: "製品・構成", shortLabel: "製品" },
  { id: 4, label: "見積もり", shortLabel: "見積" },
  { id: 5, label: "補足質問", shortLabel: "質問" },
  { id: 6, label: "下書き生成", shortLabel: "生成" },
  { id: 7, label: "編集・出力", shortLabel: "出力" },
];

export type WizardStepId = number;

interface Props {
  currentStep: WizardStepId;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  steps?: WizardStepDef[];
  /** O7: hydration 完了前は children を非表示にしてレイアウトシフトを防止 */
  hydrated?: boolean;
}

export default function WizardLayout({ currentStep, children, title, subtitle, steps, hydrated }: Props) {
  const stepDefs = steps ?? WIZARD_STEPS;
  return (
    <div style={{ width: "100%", padding: "16px 4px" }}>
      {/* ダッシュボードへの戻り口（パンくずは Step 表示と重複するため省略） */}
      <div style={{ marginBottom: 12 }}>
        <Link
          href="/my"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: "var(--hc-text-muted)",
            textDecoration: "none",
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--hc-border)",
            background: "var(--hc-card-bg)",
          }}
        >
          ← ダッシュボードに戻る
        </Link>
      </div>
      <ProgressBar currentStep={currentStep} steps={stepDefs} />
      {(title || subtitle) && (
        <div className="mt-6 mb-4">
          {title && (
            <h1
              className="text-[22px] font-bold text-navy"
              style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[13px] text-text-muted mt-1.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
      )}
      <div
        className="bg-white border border-border rounded-[10px] p-6 md:p-8"
        style={hydrated === false ? { visibility: "hidden" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ currentStep, steps }: { currentStep: WizardStepId; steps: WizardStepDef[] }) {
  return (
    <ol className="flex items-center justify-between gap-2 md:gap-3" aria-label="ウィザード進捗">
      {steps.map((step, idx) => {
        const isDone = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const stateClass = isCurrent
          ? "bg-primary border-primary text-white"
          : isDone
            ? "bg-primary border-primary text-white"
            : "bg-white border-border text-text-muted";
        return (
          <li key={step.id} className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-[12px] transition-colors ${stateClass}`}
                style={{ fontFamily: "'Sora', sans-serif" }}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? "✓" : step.id}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                  isCurrent ? "text-navy" : "text-text-muted"
                }`}
              >
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden">{step.shortLabel}</span>
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] ${
                  step.id < currentStep ? "bg-primary" : "bg-border"
                }`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
