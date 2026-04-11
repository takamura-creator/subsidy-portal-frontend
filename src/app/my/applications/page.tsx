"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TabFilter from "@/components/shared/TabFilter";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import SkeletonCard from "@/components/shared/SkeletonCard";
import {
  fetchMyApplications,
  deleteApplication,
  type Application,
  ApiError,
} from "@/lib/api";

const TABS = [
  { key: "all", label: "すべて" },
  { key: "draft", label: "下書き" },
  { key: "submitted", label: "提出済み" },
  { key: "approved", label: "承認" },
  { key: "rejected", label: "却下" },
];

const PER_PAGE = 10;

export default function MyApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get("status") || "all";
  const initialPage = Number(searchParams.get("page") || "1");
  const initialSort = searchParams.get("sort") || "-updated_at";

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState(initialSort);
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMyApplications({
        status: activeTab === "all" ? undefined : activeTab,
        page,
        sort,
      });
      setApplications(res.applications);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // URLクエリパラメータを更新
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== "all") params.set("status", activeTab);
    if (page > 1) params.set("page", String(page));
    if (sort !== "-updated_at") params.set("sort", sort);
    const query = params.toString();
    router.replace(`/my/applications${query ? `?${query}` : ""}`, { scroll: false });
  }, [activeTab, page, sort, router]);

  function handleTabChange(key: string) {
    setActiveTab(key);
    setPage(1);
  }

  function handleSort(key: string) {
    setSort((prev) => {
      if (prev === key) return `-${key}`;
      if (prev === `-${key}`) return key;
      return `-${key}`;
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("この申請を削除しますか？")) return;
    try {
      await deleteApplication(id);
      fetchData();
    } catch {
      alert("削除に失敗しました");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const sortObj = sort.startsWith("-")
    ? { key: sort.slice(1), direction: "desc" as const }
    : { key: sort, direction: "asc" as const };

  const columns = [
    {
      key: "index",
      label: "#",
      render: (row: Application) => {
        const i = applications.indexOf(row);
        return <span className="text-text2 tabular-nums">{(page - 1) * PER_PAGE + i + 1}</span>;
      },
    },
    {
      key: "subsidy_name",
      label: "補助金名",
      sortable: true,
      render: (row: Application) => (
        <span className="text-text font-medium">{row.subsidy_name ?? row.subsidy_id}</span>
      ),
    },
    {
      key: "status",
      label: "ステータス",
      render: (row: Application) => <StatusBadge status={row.status} />,
    },
    {
      key: "updated_at",
      label: "更新日",
      sortable: true,
      render: (row: Application) => (
        <span className="text-text2 tabular-nums text-xs">
          {new Date(row.updated_at).toLocaleDateString("ja-JP")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "操作",
      render: (row: Application) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(menuOpen === row.id ? null : row.id);
            }}
            className="p-1.5 rounded-[10px] hover:bg-bg-surface transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-text2" />
          </button>
          {menuOpen === row.id && (
            <div className="absolute right-0 top-8 z-10 w-36 rounded-[10px] border border-border bg-bg-card shadow-[var(--portal-shadow-md)] py-1">
              <Link
                href={`/my/applications/${row.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-bg-surface transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                詳細
              </Link>
              {row.status === "draft" && (
                <Link
                  href={`/my/applications/new?edit=${row.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-bg-surface transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  編集
                </Link>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(null);
                  handleDelete(row.id);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                削除
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="申請一覧"
        breadcrumbs={[
          { label: "ダッシュボード", href: "/my" },
          { label: "申請一覧" },
        ]}
        actions={
          <Link href="/my/applications/new" className="btn-primary inline-flex items-center gap-1.5 text-sm">
            <Plus className="w-4 h-4" />
            新規申請
          </Link>
        }
      />

      <TabFilter tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} variant="row" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
          <button onClick={fetchData} className="ml-3 text-primary hover:underline">
            再試行
          </button>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="まだ申請がありません"
          description="補助金を探して申請を始めましょう。"
          actionLabel="補助金を探す"
          actionHref="/subsidies"
        />
      ) : (
        <DataTable
          columns={columns}
          data={applications}
          sort={sortObj}
          onSort={handleSort}
          onRowClick={(row) => router.push(`/my/applications/${row.id}`)}
          pagination={{
            currentPage: page,
            totalPages,
            onPageChange: setPage,
          }}
        />
      )}
    </>
  );
}
