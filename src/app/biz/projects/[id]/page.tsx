"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import StatusTimeline from "@/components/shared/StatusTimeline";
import InfoSection from "@/components/shared/InfoSection";
import SkeletonCard from "@/components/shared/SkeletonCard";
import QuotationForm from "@/components/projects/QuotationForm";
import {
  fetchBizProject,
  acceptProject,
  declineProject,
  type BizProjectDetail,
  ApiError,
} from "@/lib/api";

const TIMELINE_STEPS = ["マッチング", "見積中", "施工中", "完了"];

function getStepIndex(status: string): number {
  switch (status) {
    case "new": return 0;
    case "estimating": return 1;
    case "working": return 2;
    case "completed": return 3;
    case "declined": return -1;
    default: return 0;
  }
}

export default function BizProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<BizProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetchBizProject(params.id)
      .then(setProject)
      .catch((err) => setError(err instanceof ApiError ? err.message : "データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleAccept() {
    if (!project || !confirm("この案件に対応可能として応答しますか？")) return;
    setActionLoading(true);
    try {
      await acceptProject(project.id);
      setProject({ ...project, status: "estimating" });
    } catch {
      alert("操作に失敗しました。");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDecline() {
    if (!project || !confirm("この案件を辞退しますか？")) return;
    setActionLoading(true);
    try {
      await declineProject(project.id);
      router.push("/biz/projects");
    } catch {
      alert("操作に失敗しました。");
    } finally {
      setActionLoading(false);
    }
  }

  function handleQuotationSubmit() {
    if (project) {
      setProject({ ...project, status: "working" });
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        {error || "案件が見つかりません。"}
      </div>
    );
  }

  const stepIndex = getStepIndex(project.status);
  const timelineSteps = TIMELINE_STEPS.map((label, i) => ({
    label,
    status: (i < stepIndex ? "completed" : i === stepIndex ? "current" : "upcoming") as "completed" | "current" | "upcoming",
  }));

  return (
    <>
      <PageHeader
        title="案件詳細"
        breadcrumbs={[
          { label: "ダッシュボード", href: "/biz" },
          { label: "案件一覧", href: "/biz/projects" },
          { label: project.company_name },
        ]}
        actions={
          project.status === "new" ? (
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className={`text-sm font-medium px-4 py-2 rounded-[10px] bg-accent text-white hover:bg-accent/90 transition-colors ${
                  actionLoading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                対応可能
              </button>
              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className={`btn-secondary text-sm px-4 py-2 ${
                  actionLoading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                辞退する
              </button>
            </div>
          ) : undefined
        }
      />

      {/* ステータスタイムライン */}
      {project.status !== "declined" && (
        <div className="mb-8 rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
          <StatusTimeline currentStep={stepIndex} steps={timelineSteps} />
        </div>
      )}

      {project.status === "declined" && (
        <div className="mb-8 rounded-[10px] border border-border/50 bg-bg-surface p-4 text-sm text-text2 text-center">
          この案件は辞退済みです
        </div>
      )}

      <div className="space-y-6">
        {/* 企業情報 */}
        <InfoSection title="企業情報">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><dt className="text-text2">企業名</dt><dd className="text-text font-medium">{project.company_name}</dd></div>
            {project.company_industry && <div><dt className="text-text2">業種</dt><dd className="text-text">{project.company_industry}</dd></div>}
            {project.company_address && <div><dt className="text-text2">所在地</dt><dd className="text-text">{project.company_address}</dd></div>}
            {project.contact_name && <div><dt className="text-text2">担当者</dt><dd className="text-text">{project.contact_name}</dd></div>}
            {project.contact_email && <div><dt className="text-text2">連絡先</dt><dd className="text-text">{project.contact_email}</dd></div>}
          </dl>
        </InfoSection>

        {/* 補助金情報 */}
        <InfoSection title="補助金情報">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><dt className="text-text2">補助金名</dt><dd className="text-text font-medium">{project.subsidy_name}</dd></div>
            {project.subsidy_rate && <div><dt className="text-text2">補助率</dt><dd className="text-text">{project.subsidy_rate}</dd></div>}
            {project.subsidy_max_amount && <div><dt className="text-text2">上限額</dt><dd className="text-text">{(project.subsidy_max_amount / 10000).toLocaleString("ja-JP")}万円</dd></div>}
            <div><dt className="text-text2">予算</dt><dd className="text-text">~{(project.budget / 10000).toLocaleString("ja-JP")}万円</dd></div>
            <div><dt className="text-text2">申請期限</dt><dd className="text-text">{project.deadline}</dd></div>
          </dl>
        </InfoSection>

        {/* 導入要件 */}
        <InfoSection title="導入要件">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {project.purpose && <div className="sm:col-span-2"><dt className="text-text2">導入目的</dt><dd className="text-text">{project.purpose}</dd></div>}
            {project.camera_count && <div><dt className="text-text2">導入予定台数</dt><dd className="text-text">{project.camera_count}台</dd></div>}
            {project.planned_date && <div><dt className="text-text2">導入予定時期</dt><dd className="text-text">{project.planned_date}</dd></div>}
          </dl>
          {project.documents && project.documents.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-text2 block mb-2">添付資料</span>
              <div className="space-y-1">
                {project.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-text">{doc.name}</span>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                        DL
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </InfoSection>

        {/* 見積もりセクション */}
        {project.status === "estimating" && (
          <InfoSection title="見積もり">
            <QuotationForm projectId={project.id} onSubmit={handleQuotationSubmit} />
          </InfoSection>
        )}

        {project.quotation && (
          <InfoSection title="見積もり（提出済み）">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><dt className="text-text2">見積金額</dt><dd className="text-text font-medium">{project.quotation.amount.toLocaleString("ja-JP")}円</dd></div>
              <div><dt className="text-text2">工期</dt><dd className="text-text">{project.quotation.duration_days}日間</dd></div>
              {project.quotation.note && <div className="sm:col-span-2"><dt className="text-text2">備考</dt><dd className="text-text">{project.quotation.note}</dd></div>}
              {project.quotation.submitted_at && <div><dt className="text-text2">提出日</dt><dd className="text-text">{new Date(project.quotation.submitted_at).toLocaleDateString("ja-JP")}</dd></div>}
            </dl>
          </InfoSection>
        )}
      </div>
    </>
  );
}
