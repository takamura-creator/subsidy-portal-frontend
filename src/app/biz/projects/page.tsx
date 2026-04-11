"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import TabFilter from "@/components/shared/TabFilter";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import SkeletonCard from "@/components/shared/SkeletonCard";
import {
  fetchBizProjects,
  type BizProject,
  ApiError,
} from "@/lib/api";

const TABS = [
  { key: "all", label: "すべて" },
  { key: "new", label: "新着" },
  { key: "estimating", label: "対応中" },
  { key: "completed", label: "完了" },
  { key: "declined", label: "辞退" },
];

const STATUS_LABEL: Record<string, string> = {
  new: "新着",
  estimating: "見積中",
  working: "施工中",
  completed: "完了",
  declined: "辞退",
};

const STATUS_CLASS: Record<string, string> = {
  new: "bg-accent/10 text-accent",
  estimating: "bg-primary/10 text-primary",
  working: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  declined: "bg-border/30 text-text2",
};

const PER_PAGE = 10;

export default function BizProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get("status") || "all";
  const initialPage = Number(searchParams.get("page") || "1");

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);
  const [projects, setProjects] = useState<BizProject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchBizProjects({
        status: activeTab === "all" ? undefined : activeTab,
        page,
      });
      setProjects(res.projects);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== "all") params.set("status", activeTab);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.replace(`/biz/projects${query ? `?${query}` : ""}`, { scroll: false });
  }, [activeTab, page, router]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const columns = [
    {
      key: "index",
      label: "#",
      render: (row: BizProject) => {
        const i = projects.indexOf(row);
        return <span className="text-text2 tabular-nums">{(page - 1) * PER_PAGE + i + 1}</span>;
      },
    },
    {
      key: "company_name",
      label: "企業名",
      render: (row: BizProject) => (
        <span className="text-text font-medium">{row.company_name}</span>
      ),
    },
    {
      key: "status",
      label: "ステータス",
      render: (row: BizProject) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
            STATUS_CLASS[row.status] ?? STATUS_CLASS.declined
          }`}
        >
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      ),
    },
    {
      key: "subsidy_name",
      label: "補助金名",
      render: (row: BizProject) => (
        <span className="text-text2 text-xs">{row.subsidy_name}</span>
      ),
    },
    {
      key: "deadline",
      label: "期限",
      render: (row: BizProject) => (
        <span className="text-text2 tabular-nums text-xs">{row.deadline}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="案件一覧"
        breadcrumbs={[
          { label: "ダッシュボード", href: "/biz" },
          { label: "案件一覧" },
        ]}
      />

      <TabFilter
        tabs={TABS}
        activeTab={activeTab}
        onChange={(key) => { setActiveTab(key); setPage(1); }}
      />

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
      ) : projects.length === 0 ? (
        <EmptyState
          title="案件はありません"
          description="該当する案件が見つかりませんでした。"
        />
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={(row) => router.push(`/biz/projects/${row.id}`)}
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
