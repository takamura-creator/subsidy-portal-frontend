"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import { FileText, CheckSquare, Square } from "lucide-react";

const REQUIRED_DOCUMENTS = [
  { key: "business_plan", label: "事業計画書" },
  { key: "estimate", label: "見積書" },
  { key: "financial_statement", label: "決算書" },
] as const;

export interface Step2Data {
  checkedDocs: Record<string, boolean>;
  plan_text: string;
}

interface WizardStep2Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  saving: boolean;
}

export default function WizardStep2({
  data,
  onChange,
  onNext,
  onBack,
  onSaveDraft,
  saving,
}: WizardStep2Props) {
  const [planError, setPlanError] = useState("");

  function toggleDoc(key: string) {
    onChange({
      ...data,
      checkedDocs: { ...data.checkedDocs, [key]: !data.checkedDocs[key] },
    });
  }

  function handlePlanChange(value: string) {
    if (value.length <= 1000) {
      onChange({ ...data, plan_text: value });
      setPlanError("");
    }
  }

  function handleNext() {
    if (!data.plan_text.trim()) {
      setPlanError("導入計画を入力してください");
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-6">
      {/* 必要書類チェックリスト */}
      <div>
        <h3 className="font-medium text-text mb-3">必要書類チェックリスト</h3>
        <div className="space-y-3">
          {REQUIRED_DOCUMENTS.map((doc) => {
            const checked = data.checkedDocs[doc.key] ?? false;
            return (
              <div
                key={doc.key}
                className="rounded-[10px] border border-border bg-bg-card p-3"
              >
                <button
                  type="button"
                  className="flex items-center gap-3 w-full text-left"
                  onClick={() => toggleDoc(doc.key)}
                >
                  {checked ? (
                    <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-text2 shrink-0" />
                  )}
                  <FileText className="w-4 h-4 text-text2 shrink-0" />
                  <span className="text-sm text-text">{doc.label}</span>
                </button>
                {!checked && (
                  <div className="mt-2 ml-12 rounded-[10px] border border-dashed border-border bg-bg-surface p-4 text-center">
                    <p className="text-xs text-text2">
                      ファイルアップロード機能は近日実装予定です
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 導入計画 */}
      <div>
        <h3 className="font-medium text-text mb-3">導入計画の概要</h3>
        <textarea
          className="w-full rounded-[10px] border border-border bg-bg-card px-3.5 py-3 text-[16px] focus:border-primary focus:shadow-[var(--portal-focus-ring)] outline-none transition-colors resize-y min-h-[160px]"
          value={data.plan_text}
          onChange={(e) => handlePlanChange(e.target.value)}
          placeholder="防犯カメラの導入目的、導入台数、設置場所、期待する効果などを記入してください"
          rows={6}
        />
        <div className="flex items-center justify-between mt-1">
          {planError ? (
            <span className="text-xs text-error">{planError}</span>
          ) : (
            <span />
          )}
          <span className="text-xs text-text2">
            {data.plan_text.length}/1000文字
          </span>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="secondary" onClick={onBack}>
          ← 戻る
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onSaveDraft} disabled={saving}>
            {saving ? "保存中..." : "下書き保存"}
          </Button>
          <Button onClick={handleNext}>次へ →</Button>
        </div>
      </div>
    </div>
  );
}
