"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import TabFilter from "@/components/shared/TabFilter";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import SkeletonCard from "@/components/shared/SkeletonCard";
import {
  fetchAdminContractors,
  approveContractor,
  suspendContractor,
  unsuspendContractor,
  type AdminContractor,
  ApiError,
} from "@/lib/api";

const TABS = [
  { key: "all", label: "すべて" },
  { key: "pending", label: "承認待ち" },
  { key: "approved", label: "承認済" },
  { key: "suspended", label: "停止中" },
];

const STATUS_LABEL: Record<string, string> = {
  pending: "承認待ち",
  approved: "承認済",
  suspended: "停止中",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  approved: "bg-success/10 text-success",
  suspended: "bg-error/10 text-error",
};

const PER_PAGE = 10;

export default function AdminContractorsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [contractors, setContractors] = useState<AdminContractor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState<AdminContractor | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminContractors({
        status: activeTab === "all" ? undefined : activeTab,
        page,
      });
      setContractors(res.contractors);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAction(id: string, action: "approve" | "suspend" | "unsuspend") {
    const labels = { approve: "承認", suspend: "停止", unsuspend: "解除" };
    if (!confirm(`この業者を${labels[action]}しますか？`)) return;
    try {
      if (action === "approve") await approveContractor(id);
      else if (action === "suspend") await suspendContractor(id);
      else await unsuspendContractor(id);
      fetchData();
    } catch {
      alert("操作に失敗しました");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const columns = [
    {
      key: "company_name",
      label: "会社名",
      render: (row: AdminContractor) => <span className="text-text font-medium">{row.company_name}</span>,
    },
    {
      key: "areas",
      label: "エリア",
      render: (row: AdminContractor) => (
        <span className="text-text2 text-xs">
          {row.areas.slice(0, 3).join("・")}{row.areas.length > 3 ? ` +${row.areas.length - 3}` : ""}
        </span>
      ),
    },
    {
      key: "qualifications",
      label: "資格数",
      render: (row: AdminContractor) => <span className="text-text2 text-xs tabular-nums">{row.qualifications.length}</span>,
    },
    {
      key: "project_count",
      label: "実績数",
      render: (row: AdminContractor) => <span className="text-text tabular-nums text-xs">{row.project_count}</span>,
    },
    {
      key: "rating",
      label: "評価",
      render: (row: AdminContractor) => <span className="text-accent text-xs tabular-nums">{row.rating.toFixed(1)}</span>,
    },
    {
      key: "status",
      label: "ステータス",
      render: (row: AdminContractor) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[row.status] ?? ""}`}>
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "操作",
      render: (row: AdminContractor) => (
        <div className="flex gap-1.5">
          {row.status === "pending" && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleAction(row.id, "approve"); }} className="text-xs font-medium text-success hover:underline">承認</button>
              <button onClick={(e) => { e.stopPropagation(); handleAction(row.id, "suspend"); }} className="text-xs font-medium text-error hover:underline">却下</button>
            </>
          )}
          {row.status === "approved" && (
            <button onClick={(e) => { e.stopPropagation(); handleAction(row.id, "suspend"); }} className="text-xs font-medium text-error hover:underline">停止</button>
          )}
          {row.status === "suspended" && (
            <button onClick={(e) => { e.stopPropagation(); handleAction(row.id, "unsuspend"); }} className="text-xs font-medium text-primary hover:underline">解除</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="業者管理"
        breadcrumbs={[{ label: "ダッシュボード", href: "/admin" }, { label: "業者管理" }]}
      />

      <TabFilter tabs={TABS} activeTab={activeTab} onChange={(key) => { setActiveTab(key); setPage(1); }} />

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} variant="row" />)}</div>
      ) : error ? (
        <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error} <button onClick={fetchData} className="ml-3 text-primary hover:underline">再試行</button>
        </div>
      ) : contractors.length === 0 ? (
        <EmptyState title="業者がいません" description="該当する業者が見つかりませんでした。" />
      ) : (
        <DataTable
          columns={columns}
          data={contractors}
          onRowClick={(row) => setDetailOpen(row)}
          pagination={{ currentPage: page, totalPages, onPageChange: setPage }}
        />
      )}

      {/* 業者詳細モーダル */}
      {detailOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setDetailOpen(null)} />
          <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-[10px] border border-border bg-bg-card p-6 shadow-[var(--portal-shadow-md)] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-text">{detailOpen.company_name}</h3>
              <button onClick={() => setDetailOpen(null)} className="text-text2 hover:text-text text-xl">&times;</button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-text2">ステータス</dt>
                <dd><span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[detailOpen.status]}`}>{STATUS_LABEL[detailOpen.status]}</span></dd>
              </div>
              <div>
                <dt className="text-text2">対応エリア</dt>
                <dd className="text-text">{detailOpen.areas.join("、") || "未設定"}</dd>
              </div>
              <div>
                <dt className="text-text2">保有資格</dt>
                <dd className="text-text">{detailOpen.qualifications.join("、") || "未設定"}</dd>
              </div>
              <div>
                <dt className="text-text2">実績数</dt>
                <dd className="text-text">{detailOpen.project_count}件</dd>
              </div>
              <div>
                <dt className="text-text2">評価</dt>
                <dd className="text-text">{detailOpen.rating.toFixed(1)}</dd>
              </div>
              <div>
                <dt className="text-text2">登録日</dt>
                <dd className="text-text">{new Date(detailOpen.created_at).toLocaleDateString("ja-JP")}</dd>
              </div>
            </dl>
            <div className="flex gap-2 mt-6">
              {detailOpen.status === "pending" && (
                <>
                  <button onClick={() => { handleAction(detailOpen.id, "approve"); setDetailOpen(null); }} className="btn-primary flex-1 text-sm py-2">承認</button>
                  <button onClick={() => { handleAction(detailOpen.id, "suspend"); setDetailOpen(null); }} className="btn-secondary flex-1 text-sm py-2 text-error">却下</button>
                </>
              )}
              {detailOpen.status === "approved" && (
                <button onClick={() => { handleAction(detailOpen.id, "suspend"); setDetailOpen(null); }} className="btn-secondary flex-1 text-sm py-2 text-error">停止</button>
              )}
              {detailOpen.status === "suspended" && (
                <button onClick={() => { handleAction(detailOpen.id, "unsuspend"); setDetailOpen(null); }} className="btn-primary flex-1 text-sm py-2">解除</button>
              )}
              <button onClick={() => setDetailOpen(null)} className="btn-secondary flex-1 text-sm py-2">閉じる</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
