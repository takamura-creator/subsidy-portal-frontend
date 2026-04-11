"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import StatusTimeline from "@/components/shared/StatusTimeline";
import InfoSection from "@/components/shared/InfoSection";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/shared/Button";
import { fetchApplication, generatePdf, type ApplicationDetail, ApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { FileText, Download, ExternalLink } from "lucide-react";

const STATUS_STEPS = ["下書き", "提出済み", "審査中", "承認/却下"] as const;

function getTimelineSteps(status: string) {
  const statusIndex: Record<string, number> = {
    draft: 0,
    submitted: 1,
    reviewing: 2,
    approved: 3,
    rejected: 3,
  };
  const current = statusIndex[status] ?? 0;

  return STATUS_STEPS.map((label, i) => ({
    label,
    status: (i < current ? "completed" : i === current ? "current" : "upcoming") as
      "completed" | "current" | "upcoming",
  }));
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!requireAuth(["owner", "admin"], `/my/applications/${id}`)) return;

    fetchApplication(id)
      .then(setApp)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          setError("申請が見つかりません");
        } else {
          setError(err instanceof Error ? err.message : "読み込みに失敗しました");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePdfDownload() {
    setPdfLoading(true);
    try {
      const blob = await generatePdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `申請書_${app?.subsidy_name ?? id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF生成に失敗しました");
    } finally {
      setPdfLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="rounded-[10px] border border-error/30 bg-error/5 p-8 text-center">
        <p className="text-error font-medium mb-4">{error ?? "申請が見つかりません"}</p>
        <Button variant="secondary" onClick={() => router.push("/my/applications")}>
          申請一覧に戻る
        </Button>
      </div>
    );
  }

  const isDraft = app.status === "draft";

  return (
    <div className="space-y-6 animate-fade-slide-in">
      <PageHeader
        title="申請詳細"
        breadcrumbs={[
          { label: "ダッシュボード", href: "/my" },
          { label: "申請一覧", href: "/my/applications" },
          { label: app.subsidy_name ?? `申請 #${app.id}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/my/applications/new?edit=${id}`)}
              >
                編集
              </Button>
            )}
            <Button size="sm" onClick={handlePdfDownload} disabled={pdfLoading}>
              <Download className="w-4 h-4 mr-1.5" />
              {pdfLoading ? "生成中..." : "PDF出力"}
            </Button>
          </div>
        }
      />

      {/* ステータス */}
      <InfoSection title="ステータス">
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status={app.status} />
          {app.submitted_at && (
            <span className="text-sm text-text2">
              提出日: {new Date(app.submitted_at).toLocaleDateString("ja-JP")}
            </span>
          )}
        </div>
        <StatusTimeline currentStep={0} steps={getTimelineSteps(app.status)} />
      </InfoSection>

      {/* 補助金情報 */}
      <InfoSection title="補助金情報">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-text2">補助金名</dt>
            <dd className="text-text font-medium">{app.subsidy_name ?? "—"}</dd>
          </div>
          {app.subsidy && (
            <>
              <div>
                <dt className="text-text2">補助率</dt>
                <dd className="text-text">
                  {app.subsidy.rate_min}〜{app.subsidy.rate_max}
                </dd>
              </div>
              <div>
                <dt className="text-text2">上限額</dt>
                <dd className="text-text">
                  {app.subsidy.max_amount.toLocaleString()}万円
                </dd>
              </div>
              <div>
                <dt className="text-text2">締切</dt>
                <dd className="text-text">{app.subsidy.deadline}</dd>
              </div>
            </>
          )}
        </dl>
        {app.subsidy_id && (
          <Link
            href={`/subsidies/${app.subsidy_id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
          >
            補助金詳細を見る
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </InfoSection>

      {/* 会社情報 */}
      <InfoSection title="会社情報">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-text2">会社名</dt>
            <dd className="text-text">{app.company_name}</dd>
          </div>
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

      {/* 添付書類 */}
      <InfoSection title="添付書類">
        {app.documents && app.documents.length > 0 ? (
          <ul className="space-y-2">
            {app.documents.map((doc, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                    doc.uploaded
                      ? "bg-success/10 text-success"
                      : "bg-border/30 text-text2"
                  }`}
                >
                  {doc.uploaded ? "✓" : "—"}
                </span>
                <FileText className="w-4 h-4 text-text2" />
                <span className={doc.uploaded ? "text-text" : "text-text2"}>
                  {doc.name}
                </span>
                {doc.uploaded && doc.url && (
                  <a
                    href={doc.url}
                    download
                    className="text-primary text-xs hover:underline ml-auto"
                  >
                    DL
                  </a>
                )}
                {!doc.uploaded && (
                  <span className="text-text2 text-xs ml-auto">未アップロード</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text2">添付書類はありません</p>
        )}
      </InfoSection>

      {/* 導入計画 */}
      {app.plan_text && (
        <InfoSection title="導入計画">
          <p className="text-sm text-text whitespace-pre-wrap">{app.plan_text}</p>
        </InfoSection>
      )}
    </div>
  );
}
