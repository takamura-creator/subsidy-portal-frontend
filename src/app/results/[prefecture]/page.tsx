"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  fetchRecipients,
  RecipientListResponse,
} from "@/lib/api";

const CATEGORIES = ["IT導入", "ものづくり", "事業再構築", "防犯", "省エネ"];
const FISCAL_YEARS = [2025, 2024, 2023, 2022, 2021];
const PER_PAGE = 20;

type SortKey = "amount_desc" | "amount_asc" | "year_desc" | "name_asc";

function formatAmount(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}億円`;
  if (amount >= 10_000) return `${Math.round(amount / 10_000).toLocaleString()}万円`;
  return `${amount.toLocaleString()}円`;
}

export default function PrefecturePage() {
  const params = useParams();
  const prefecture = decodeURIComponent(params.prefecture as string);

  const [data, setData] = useState<RecipientListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [fiscalYear, setFiscalYear] = useState<number | undefined>();
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortKey>("amount_desc");
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRecipients({
        prefecture,
        category: category || undefined,
        fiscal_year: fiscalYear,
        keyword: keyword || undefined,
        sort,
        page,
        per_page: PER_PAGE,
      });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [prefecture, category, fiscalYear, keyword, sort, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0;
  const totalAmount = data?.recipients.reduce((sum, r) => sum + r.grant_amount, 0) ?? 0;

  const handleCSVDownload = () => {
    if (!data?.recipients.length) return;
    const headers = ["企業名", "補助金名", "交付額", "年度", "業種", "市区町村", "出典"];
    const rows = data.recipients.map((r) => [
      r.recipient_name,
      r.subsidy_name,
      String(r.grant_amount),
      String(r.fiscal_year),
      r.industry,
      r.recipient_city,
      r.source_url,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `交付実績_${prefecture}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: "var(--hc-bg)" }}>
      {/* Header */}
      <section className="px-6 pt-8 pb-4 max-w-5xl mx-auto">
        <Link
          href="/results"
          className="text-xs no-underline mb-3 inline-block"
          style={{ color: "var(--hc-primary)" }}
        >
          ← 交付実績トップに戻る
        </Link>
        <h1
          className="text-xl md:text-2xl font-bold"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.5px" }}
        >
          {prefecture} の補助金交付実績
        </h1>
        {data && (
          <p className="text-sm mt-2" style={{ color: "var(--hc-text-muted)" }}>
            {data.total}件 ・ 表示ページ交付額合計 {formatAmount(totalAmount)}
          </p>
        )}
      </section>

      {/* Filters */}
      <section className="px-6 pb-4 max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Category */}
          <div>
            <label className="text-xs block mb-1" style={{ color: "var(--hc-text-muted)" }}>カテゴリ</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="text-sm px-3 py-2 rounded-lg border"
              style={{ borderColor: "var(--hc-border)", background: "var(--hc-white)" }}
            >
              <option value="">すべて</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Fiscal Year */}
          <div>
            <label className="text-xs block mb-1" style={{ color: "var(--hc-text-muted)" }}>年度</label>
            <select
              value={fiscalYear ?? ""}
              onChange={(e) => { setFiscalYear(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
              className="text-sm px-3 py-2 rounded-lg border"
              style={{ borderColor: "var(--hc-border)", background: "var(--hc-white)" }}
            >
              <option value="">すべて</option>
              {FISCAL_YEARS.map((y) => <option key={y} value={y}>{y}年度</option>)}
            </select>
          </div>

          {/* Keyword */}
          <div>
            <label className="text-xs block mb-1" style={{ color: "var(--hc-text-muted)" }}>キーワード</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); loadData(); } }}
              placeholder="企業名・事業概要"
              className="text-sm px-3 py-2 rounded-lg border w-40"
              style={{ borderColor: "var(--hc-border)", background: "var(--hc-white)", fontSize: "16px" }}
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs block mb-1" style={{ color: "var(--hc-text-muted)" }}>並び順</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
              className="text-sm px-3 py-2 rounded-lg border"
              style={{ borderColor: "var(--hc-border)", background: "var(--hc-white)" }}
            >
              <option value="amount_desc">交付額（高い順）</option>
              <option value="amount_asc">交付額（低い順）</option>
              <option value="year_desc">年度（新しい順）</option>
              <option value="name_asc">企業名（あいうえお順）</option>
            </select>
          </div>

          {/* CSV Download */}
          <button
            onClick={handleCSVDownload}
            disabled={!data?.recipients.length}
            className="text-xs px-4 py-2 rounded-lg border font-medium transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--hc-border)", color: "var(--hc-primary)" }}
          >
            CSVダウンロード
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="px-6 pb-8 max-w-5xl mx-auto">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm animate-pulse" style={{ color: "var(--hc-text-muted)" }}>読み込み中...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-error">{error}</p>
          </div>
        ) : !data?.recipients.length ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: "var(--hc-text-muted)" }}>該当するデータがありません</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-[10px] border" style={{ borderColor: "var(--hc-border)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--hc-navy)" }}>
                    <th className="text-left px-4 py-3 text-white font-medium text-xs">企業名</th>
                    <th className="text-left px-4 py-3 text-white font-medium text-xs">補助金名</th>
                    <th className="text-right px-4 py-3 text-white font-medium text-xs">交付額</th>
                    <th className="text-center px-4 py-3 text-white font-medium text-xs">年度</th>
                    <th className="text-left px-4 py-3 text-white font-medium text-xs">業種</th>
                    <th className="text-center px-4 py-3 text-white font-medium text-xs">出典</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recipients.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b transition-colors"
                      style={{ borderColor: "var(--hc-border)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hc-primary-subtle)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td className="px-4 py-3" style={{ color: "var(--hc-text)" }}>
                        {r.recipient_name}
                        {r.recipient_city && (
                          <span className="text-xs ml-1" style={{ color: "var(--hc-text-muted)" }}>
                            ({r.recipient_city})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--hc-text-muted)" }}>{r.subsidy_name}</td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--hc-navy)", fontFamily: "'Sora', sans-serif" }}>
                        {formatAmount(r.grant_amount)}
                      </td>
                      <td className="px-4 py-3 text-center text-xs" style={{ color: "var(--hc-text-muted)" }}>{r.fiscal_year}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--hc-text-muted)" }}>{r.industry}</td>
                      <td className="px-4 py-3 text-center">
                        {r.source_url ? (
                          <a
                            href={r.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs no-underline"
                            style={{ color: "var(--hc-primary)" }}
                          >
                            出典
                          </a>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--hc-text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {data.recipients.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-[10px] border"
                  style={{ background: "var(--hc-white)", borderColor: "var(--hc-border)", boxShadow: "var(--hc-shadow)" }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium" style={{ color: "var(--hc-text)" }}>{r.recipient_name}</p>
                    <p className="text-sm font-bold" style={{ color: "var(--hc-primary)", fontFamily: "'Sora', sans-serif" }}>
                      {formatAmount(r.grant_amount)}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: "var(--hc-text-muted)" }}>
                    {r.subsidy_name} ・ {r.fiscal_year}年度
                  </p>
                  {r.industry && (
                    <p className="text-xs mt-1" style={{ color: "var(--hc-text-muted)" }}>{r.industry}</p>
                  )}
                  {r.source_url && (
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs no-underline mt-2 inline-block"
                      style={{ color: "var(--hc-primary)" }}
                    >
                      出典を確認 →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs px-3 py-2 rounded-lg border disabled:opacity-40"
                  style={{ borderColor: "var(--hc-border)", color: "var(--hc-text)" }}
                >
                  前へ
                </button>
                <span className="text-xs" style={{ color: "var(--hc-text-muted)" }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-xs px-3 py-2 rounded-lg border disabled:opacity-40"
                  style={{ borderColor: "var(--hc-border)", color: "var(--hc-text)" }}
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
