"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Upload, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TabFilter from "@/components/shared/TabFilter";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import SkeletonCard from "@/components/shared/SkeletonCard";
import {
  fetchAdminSubsidies,
  deleteSubsidy,
  importSubsidiesCSV,
  type AdminSubsidy,
  ApiError,
} from "@/lib/api";

const TABS = [
  { key: "all", label: "すべて" },
  { key: "active", label: "有効" },
  { key: "expired", label: "期限切れ" },
  { key: "draft", label: "下書き" },
];

const STATUS_LABEL: Record<string, string> = {
  active: "有効",
  expired: "期限切れ",
  draft: "下書き",
};

const STATUS_CLASS: Record<string, string> = {
  active: "bg-success/10 text-success",
  expired: "bg-border/30 text-text2",
  draft: "bg-accent/10 text-accent",
};

const PER_PAGE = 10;

export default function AdminSubsidiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialStatus = searchParams.get("status") || "all";
  const initialPage = Number(searchParams.get("page") || "1");

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);
  const [keyword, setKeyword] = useState("");
  const [subsidies, setSubsidies] = useState<AdminSubsidy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminSubsidies({
        status: activeTab === "all" ? undefined : activeTab,
        page,
        keyword: keyword || undefined,
      });
      setSubsidies(res.subsidies);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, keyword]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: string) {
    if (!confirm("この補助金を削除しますか？")) return;
    try {
      await deleteSubsidy(id);
      fetchData();
    } catch {
      alert("削除に失敗しました");
    }
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const result = await importSubsidiesCSV(file);
      setImportResult(result);
      fetchData();
    } catch (err) {
      setImportResult({ imported: 0, errors: [err instanceof ApiError ? err.message : "インポート失敗"] });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const columns = [
    {
      key: "name",
      label: "補助金名",
      render: (row: AdminSubsidy) => <span className="text-text font-medium">{row.name}</span>,
    },
    {
      key: "category",
      label: "カテゴリ",
      render: (row: AdminSubsidy) => <span className="text-text2 text-xs">{row.category}</span>,
    },
    {
      key: "prefecture",
      label: "都道府県",
      render: (row: AdminSubsidy) => <span className="text-text2 text-xs">{row.prefecture}</span>,
    },
    {
      key: "max_amount",
      label: "上限額",
      render: (row: AdminSubsidy) => (
        <span className="text-text tabular-nums text-xs">
          {row.max_amount >= 10000 ? `${(row.max_amount / 10000).toLocaleString("ja-JP")}万円` : `${row.max_amount.toLocaleString("ja-JP")}円`}
        </span>
      ),
    },
    {
      key: "deadline",
      label: "締切",
      render: (row: AdminSubsidy) => <span className="text-text2 tabular-nums text-xs">{row.deadline}</span>,
    },
    {
      key: "admin_status",
      label: "ステータス",
      render: (row: AdminSubsidy) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[row.admin_status] ?? STATUS_CLASS.draft}`}>
          {STATUS_LABEL[row.admin_status] ?? row.admin_status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "操作",
      render: (row: AdminSubsidy) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === row.id ? null : row.id); }}
            className="p-1.5 rounded-[10px] hover:bg-bg-surface transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-text2" />
          </button>
          {menuOpen === row.id && (
            <div className="absolute right-0 top-8 z-10 w-32 rounded-[10px] border border-border bg-bg-card shadow-[var(--portal-shadow-md)] py-1">
              <Link
                href={`/admin/subsidies/${row.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-bg-surface transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> 編集
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(null); handleDelete(row.id); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 削除
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
        title="補助金管理"
        breadcrumbs={[{ label: "ダッシュボード", href: "/admin" }, { label: "補助金管理" }]}
        actions={
          <div className="flex gap-2">
            <label className={`btn-secondary inline-flex items-center gap-1.5 text-sm cursor-pointer ${importing ? "opacity-50 pointer-events-none" : ""}`}>
              <Upload className="w-4 h-4" />
              {importing ? "インポート中..." : "CSVインポート"}
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            </label>
            <Link href="/admin/subsidies/new" className="btn-primary inline-flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4" /> 新規追加
            </Link>
          </div>
        }
      />

      {/* インポート結果 */}
      {importResult && (
        <div className={`rounded-[10px] border px-4 py-3 text-sm mb-4 ${importResult.errors.length > 0 ? "border-error/30 bg-error/5 text-error" : "border-success/30 bg-success/5 text-success"}`}>
          {importResult.imported > 0 && <p>{importResult.imported}件をインポートしました。</p>}
          {importResult.errors.map((e, i) => <p key={i}>{e}</p>)}
          <button onClick={() => setImportResult(null)} className="text-xs underline mt-1">閉じる</button>
        </div>
      )}

      {/* 検索バー */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="補助金名で検索"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          className="w-full max-w-sm rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-2.5 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)]"
        />
      </div>

      <TabFilter tabs={TABS} activeTab={activeTab} onChange={(key) => { setActiveTab(key); setPage(1); }} />

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} variant="row" />)}</div>
      ) : error ? (
        <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error} <button onClick={fetchData} className="ml-3 text-primary hover:underline">再試行</button>
        </div>
      ) : subsidies.length === 0 ? (
        <EmptyState title="補助金がありません" description="新規追加またはCSVインポートで補助金を登録してください。" actionLabel="新規追加" actionHref="/admin/subsidies/new" />
      ) : (
        <DataTable columns={columns} data={subsidies} pagination={{ currentPage: page, totalPages, onPageChange: setPage }} />
      )}
    </>
  );
}
