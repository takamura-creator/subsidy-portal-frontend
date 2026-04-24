"use client";

import type { ReactNode } from "react";

export const WIZARD_STEPS = [
  { id: 1, label: "会社情報", shortLabel: "会社" },
  { id: 2, label: "補助金選択", shortLabel: "補助金" },
  { id: 3, label: "製品・構成", shortLabel: "製品" },
  { id: 4, label: "見積もり", shortLabel: "見積" },
  { id: 5, label: "申請書類", shortLabel: "書類" },
  { id: 6, label: "プレビュー", shortLabel: "出力" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

interface Props {
  currentStep: WizardStepId;
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function WizardLayout({ currentStep, children, title, subtitle }: Props) {
  return (
    <div className="max-w-[960px] mx-auto px-4 md:px-6 py-8">
      <ProgressBar currentStep={currentStep} />
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
      <div className="bg-white border border-border rounded-[10px] p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ currentStep }: { currentStep: WizardStepId }) {
  return (
    <ol className="flex items-center justify-between gap-2 md:gap-3" aria-label="ウィザード進捗">
      {WIZARD_STEPS.map((step, idx) => {
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
            {idx < WIZARD_STEPS.length - 1 && (
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
