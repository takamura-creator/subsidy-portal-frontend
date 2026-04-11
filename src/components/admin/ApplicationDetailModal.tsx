"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import StatusBadge from "@/components/shared/StatusBadge";
import InfoSection from "@/components/shared/InfoSection";
import {
  updateApplicationStatus,
  generatePdf,
  type AdminApplication,
  type AdminApplicationStatus,
  ApiError,
} from "@/lib/api";
import { X, Download, FileText } from "lucide-react";

interface ApplicationDetailModalProps {
  application: AdminApplication;
  onClose: () => void;
  onStatusChanged: () => void;
}

export default function ApplicationDetailModal({
  application: app,
  onClose,
  onStatusChanged,
}: ApplicationDetailModalProps) {
  const [updating, setUpdating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStatusChange(newStatus: AdminApplicationStatus) {
    setUpdating(true);
    setError("");
    try {
      await updateApplicationStatus(app.id, newStatus);
      onStatusChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ステータス更新に失敗しました");
    } finally {
      setUpdating(false);
    }
  }

  async function handlePdfDownload() {
    setPdfLoading(true);
    try {
      const blob = await generatePdf(app.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `申請書_${app.company_name}_${app.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("PDF生成に失敗しました");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg-card rounded-[10px] shadow-[var(--portal-shadow-md)] max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-bg-card rounded-t-[10px]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-text">申請詳細</h2>
            <StatusBadge status={app.status} />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-bg-surface flex items-center justify-center transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-text2" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-error bg-error/5 rounded-[10px] px-3 py-2">{error}</p>
          )}

          {/* 申請者情報 */}
          <InfoSection title="申請者情報">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-text2">メール</dt>
                <dd className="text-text">{app.user_email}</dd>
              </div>
              <div>
                <dt className="text-text2">会社名</dt>
                <dd className="text-text">{app.company_name}</dd>
              </div>
              {app.representative_name && (
                <div>
                  <dt className="text-text2">代表者名</dt>
                  <dd className="text-text">{app.representative_name}</dd>
                </div>
              )}
              {app.phone && (
                <div>
                  <dt className="text-text2">電話番号</dt>
                  <dd className="text-text">{app.phone}</dd>
                </div>
              )}
              {app.industry && (
                <div>
                  <dt className="text-text2">業種</dt>
                  <dd className="text-text">{app.industry}</dd>
                </div>
              )}
              {app.employees != null && (
                <div>
                  <dt className="text-text2">従業員数</dt>
                  <dd className="text-text">{app.employees}名</dd>
                </div>
              )}
              {app.annual_revenue != null && (
                <div>
                  <dt className="text-text2">年商</dt>
                  <dd className="text-text">{app.annual_revenue.toLocaleString()}万円</dd>
                </div>
              )}
              {app.prefecture && (
                <div>
                  <dt className="text-text2">所在地</dt>
                  <dd className="text-text">{app.prefecture}</dd>
                </div>
              )}
            </dl>
          </InfoSection>

          {/* 補助金情報 */}
          <InfoSection title="補助金情報">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-text2">補助金名</dt>
                <dd className="text-text">{app.subsidy_name ?? "—"}</dd>
              </div>
              {app.subsidy && (
                <>
                  <div>
                    <dt className="text-text2">補助率</dt>
                    <dd className="text-text">{app.subsidy.rate_min}〜{app.subsidy.rate_max}</dd>
                  </div>
                  <div>
                    <dt className="text-text2">上限額</dt>
                    <dd className="text-text">{app.subsidy.max_amount.toLocaleString()}万円</dd>
                  </div>
                  <div>
                    <dt className="text-text2">締切</dt>
                    <dd className="text-text">{app.subsidy.deadline}</dd>
                  </div>
                </>
              )}
            </dl>
          </InfoSection>

          {/* 添付書類 */}
          {app.documents && app.documents.length > 0 && (
            <InfoSection title="添付書類">
              <ul className="space-y-2">
                {app.documents.map((doc, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-text2" />
                    <span className={doc.uploaded ? "text-text" : "text-text2"}>{doc.name}</span>
                    {doc.uploaded && doc.url && (
                      <a href={doc.url} download className="text-primary text-xs hover:underline ml-auto">DL</a>
                    )}
                  </li>
                ))}
              </ul>
            </InfoSection>
          )}

          {/* 導入計画 */}
          {app.plan_text && (
            <InfoSection title="導入計画">
              <p className="text-sm text-text whitespace-pre-wrap">{app.plan_text}</p>
            </InfoSection>
          )}

          {/* 日時 */}
          <div className="text-xs text-text2 space-y-1">
            <p>作成日: {new Date(app.created_at).toLocaleDateString("ja-JP")}</p>
            {app.submitted_at && (
              <p>提出日: {new Date(app.submitted_at).toLocaleDateString("ja-JP")}</p>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg-surface/50 rounded-b-[10px]">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePdfDownload}
            disabled={pdfLoading}
          >
            <Download className="w-4 h-4 mr-1.5" />
            {pdfLoading ? "生成中..." : "PDF出力"}
          </Button>

          <div className="flex items-center gap-2">
            {app.status === "submitted" && (
              <Button size="sm" onClick={() => handleStatusChange("reviewing")} disabled={updating}>
                {updating ? "処理中..." : "審査開始"}
              </Button>
            )}
            {app.status === "reviewing" && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={updating}
                  className="rounded-[10px] border border-error px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                >
                  却下
                </button>
                <Button size="sm" onClick={() => handleStatusChange("approved")} disabled={updating}>
                  {updating ? "処理中..." : "承認"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
