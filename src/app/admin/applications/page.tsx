"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import TabFilter from "@/components/shared/TabFilter";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/shared/Button";
import ApplicationDetailModal from "@/components/admin/ApplicationDetailModal";
import {
  fetchAdminApplications,
  updateApplicationStatus,
  type AdminApplication,
  type AdminApplicationStatus,
  ApiError,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { Search } from "lucide-react";

const TABS = [
  { key: "all", label: "すべて" },
  { key: "draft", label: "下書き" },
  { key: "submitted", label: "提出済み" },
  { key: "reviewing", label: "審査中" },
  { key: "approved", label: "承認" },
  { key: "rejected", label: "却下" },
];

const PER_PAGE = 20;

export default function AdminApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminApplications({
        status: activeTab === "all" ? undefined : activeTab,
        search: search || undefined,
        page,
      });
      setApplications(res.applications);
      setTotal(res.total);
    } catch {
      // エラー時は空表示
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => {
    if (!requireAuth(["admin"], "/admin/applications")) return;
    load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setPage(1);
  }

  async function handleQuickStatusChange(id: string, newStatus: AdminApplicationStatus) {
    try {
      await updateApplicationStatus(id, newStatus);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "ステータス更新に失敗しました");
    }
  }

  const columns = [
    {
      key: "id",
      label: "#",
      render: (row: AdminApplication) => (
        <span className="text-text2 text-xs">{row.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "user_email",
      label: "申請者",
      sortable: true,
      render: (row: AdminApplication) => (
        <span className="text-xs">{row.user_email}</span>
      ),
    },
    {
      key: "company_name",
      label: "会社名",
      sortable: true,
    },
    {
      key: "subsidy_name",
      label: "補助金名",
      render: (row: AdminApplication) => row.subsidy_name ?? "—",
    },
    {
      key: "status",
      label: "ステータス",
      render: (row: AdminApplication) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      label: "作成日",
      sortable: true,
      render: (row: AdminApplication) =>
        new Date(row.created_at).toLocaleDateString("ja-JP"),
    },
    {
      key: "actions",
      label: "操作",
      render: (row: AdminApplication) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {row.status === "submitted" && (
            <Button
              size="sm"
              onClick={() => handleQuickStatusChange(row.id, "reviewing")}
            >
              審査開始
            </Button>
          )}
          {row.status === "reviewing" && (
            <>
              <Button
                size="sm"
                onClick={() => handleQuickStatusChange(row.id, "approved")}
              >
                承認
              </Button>
              <button
                type="button"
                onClick={() => handleQuickStatusChange(row.id, "rejected")}
                className="rounded-[10px] border border-error px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10 transition-colors"
              >
                却下
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-slide-in">
      <PageHeader
        title="申請管理"
        breadcrumbs={[
          { label: "管理画面", href: "/admin" },
          { label: "申請管理" },
        ]}
      />

      {/* 検索バー */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text2" />
          <input
            type="text"
            className="w-full rounded-[10px] border border-border bg-bg-card pl-10 pr-3.5 py-2.5 text-[16px] focus:border-primary focus:shadow-[var(--portal-focus-ring)] outline-none transition-colors"
            placeholder="メールアドレスまたは会社名で検索"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button size="sm" type="submit">
          検索
        </Button>
        {search && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
          >
            クリア
          </Button>
        )}
      </form>

      <TabFilter tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-text2">
          <p>該当する申請はありません</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={applications}
          onRowClick={(row) => setSelectedApp(row)}
          pagination={{
            currentPage: page,
            totalPages: Math.ceil(total / PER_PAGE),
            onPageChange: setPage,
          }}
        />
      )}

      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChanged={() => {
            setSelectedApp(null);
            load();
          }}
        />
      )}
    </div>
  );
}
