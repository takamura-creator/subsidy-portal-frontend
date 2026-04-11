"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import { generatePdf, updateApplication } from "@/lib/api";
import type { Step1Data } from "./WizardStep1";
import type { Step2Data } from "./WizardStep2";
import { Download, Send } from "lucide-react";

interface WizardStep3Props {
  applicationId: string | null;
  step1Data: Step1Data;
  step2Data: Step2Data;
  onBack: () => void;
  onSubmitted: (id: string) => void;
}

export default function WizardStep3({
  applicationId,
  step1Data,
  step2Data,
  onBack,
  onSubmitted,
}: WizardStep3Props) {
  const [submitting, setSubmitting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handlePdfDownload() {
    if (!applicationId) return;
    setPdfLoading(true);
    try {
      const blob = await generatePdf(applicationId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `申請書_${step1Data.company_name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF生成に失敗しました");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleSubmit() {
    if (!applicationId) return;
    setSubmitting(true);
    try {
      await updateApplication(applicationId, { status: "submitted" });
      onSubmitted(applicationId);
    } catch {
      alert("提出に失敗しました");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-text">入力内容の確認</h3>

      {/* 会社情報サマリー */}
      <div className="rounded-[10px] border border-border bg-bg-card p-4">
        <h4 className="text-sm font-medium text-text2 mb-3">会社情報</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-text2">会社名</dt>
            <dd className="text-text">{step1Data.company_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-text2">業種</dt>
            <dd className="text-text">{step1Data.industry || "—"}</dd>
          </div>
          <div>
            <dt className="text-text2">従業員数</dt>
            <dd className="text-text">{step1Data.employees ? `${step1Data.employees}名` : "—"}</dd>
          </div>
          <div>
            <dt className="text-text2">年商</dt>
            <dd className="text-text">
              {step1Data.annual_revenue ? `${Number(step1Data.annual_revenue).toLocaleString()}万円` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-text2">所在地</dt>
            <dd className="text-text">{step1Data.prefecture || "—"}</dd>
          </div>
          <div>
            <dt className="text-text2">代表者名</dt>
            <dd className="text-text">{step1Data.representative_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-text2">電話番号</dt>
            <dd className="text-text">{step1Data.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-text2">メール</dt>
            <dd className="text-text">{step1Data.email || "—"}</dd>
          </div>
        </dl>
      </div>

      {/* 導入計画サマリー */}
      <div className="rounded-[10px] border border-border bg-bg-card p-4">
        <h4 className="text-sm font-medium text-text2 mb-3">導入計画</h4>
        <p className="text-sm text-text whitespace-pre-wrap">
          {step2Data.plan_text || "—"}
        </p>
      </div>

      {/* アクション */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border">
        <Button variant="secondary" onClick={onBack}>
          ← 戻る
        </Button>
        <div className="flex-1" />
        <Button
          variant="secondary"
          onClick={handlePdfDownload}
          disabled={pdfLoading || !applicationId}
        >
          <Download className="w-4 h-4 mr-1.5" />
          {pdfLoading ? "生成中..." : "PDFダウンロード"}
        </Button>
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={submitting || !applicationId}
        >
          <Send className="w-4 h-4 mr-1.5" />
          申請を提出する
        </Button>
      </div>

      {/* 提出確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-bg-card rounded-[10px] p-6 max-w-md w-full mx-4 shadow-[var(--portal-shadow-md)]">
            <h3 className="text-lg font-medium text-text mb-3">申請を提出しますか？</h3>
            <p className="text-sm text-text2 mb-6">
              提出すると編集できなくなります。よろしいですか？
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
              >
                キャンセル
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "提出中..." : "提出する"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
