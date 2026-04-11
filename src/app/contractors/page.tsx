"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchContractors, type Contractor } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`評価 ${rating.toFixed(1)}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating) ? "text-accent" : "text-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
      <span className="text-xs text-text2 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefecture, setPrefecture] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchContractors({
      prefecture: prefecture || undefined,
      keyword: keyword || undefined,
    })
      .then((d) => setContractors(d.contractors))
      .catch(() => setContractors([]))
      .finally(() => setLoading(false));
  }, [prefecture, keyword]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
      {/* ページヘッダー */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-medium text-text mb-3">
          工事業者一覧
        </h1>
        <p className="text-text2 text-sm max-w-lg mx-auto">
          防犯カメラの導入工事に対応できる業者を探せます。エリアやキーワードで絞り込めます。
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* フィルターサイドバー */}
        <aside className="md:w-64 shrink-0">
          <button
            className="md:hidden w-full rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] flex items-center justify-between mb-3"
            onClick={() => setFilterOpen(!filterOpen)}
            aria-expanded={filterOpen}
            aria-controls="contractor-filter-panel"
          >
            <span className="font-medium text-sm text-text">フィルター</span>
            <svg
              className={`w-5 h-5 text-text2 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            id="contractor-filter-panel"
            role="region"
            aria-label="フィルター"
            className={`${filterOpen ? "block" : "hidden"} md:block space-y-4`}
          >
            {/* キーワード */}
            <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
              <label className="block text-xs font-medium text-text2 mb-2">キーワード</label>
              <input
                type="text"
                placeholder="会社名・資格で検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)]"
              />
            </div>

            {/* 都道府県 */}
            <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
              <label className="block text-xs font-medium text-text2 mb-2">対応エリア</label>
              <select
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)]"
              >
                <option value="">全て</option>
                {PREFECTURES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* 診断CTA */}
            <Link
              href="/match"
              className="btn-primary block w-full text-center"
            >
              AIで補助金診断
            </Link>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <div className="flex-1 min-w-0">
          {/* 件数 */}
          <div className="flex items-center justify-end mb-6">
            <span className="text-xs text-text2 bg-bg-card border border-border px-3 py-1 rounded-full">
              {contractors.length}件
            </span>
          </div>

          {/* ローディング */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-[10px] border border-border bg-bg-card p-4">
                  <div className="skeleton h-5 w-1/2 mb-3" />
                  <div className="skeleton h-4 w-full mb-2" />
                  <div className="skeleton h-4 w-3/4 mb-4" />
                  <div className="skeleton h-10 w-full rounded-[10px]" />
                </div>
              ))}
            </div>
          )}

          {/* カードグリッド */}
          {!loading && contractors.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {contractors.map((c) => (
                <Link
                  key={c.id}
                  href={`/contractors/${c.id}`}
                  className="block rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] transition-[box-shadow,transform] duration-200 hover:shadow-[var(--portal-shadow-md)] hover:-translate-y-0.5 group"
                >
                  {/* 会社名 */}
                  <h2 className="font-medium text-base text-text mb-2 group-hover:text-primary transition-colors">
                    {c.company_name}
                  </h2>

                  {/* 評価 + 実績 */}
                  <div className="flex items-center gap-3 mb-3">
                    <StarRating rating={c.rating} />
                    <span className="text-xs text-text2">
                      ({c.review_count}件)
                    </span>
                    <span className="text-xs text-text2 border-l border-border pl-3">
                      実績 {c.project_count}件
                    </span>
                  </div>

                  {/* 対応エリア */}
                  <div className="mb-3">
                    <span className="text-xs text-text2">対応エリア: </span>
                    <span className="text-xs text-text">
                      {c.areas.slice(0, 5).join("・")}
                      {c.areas.length > 5 && ` 他${c.areas.length - 5}件`}
                    </span>
                  </div>

                  {/* 資格バッジ */}
                  {c.qualifications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {c.qualifications.slice(0, 3).map((q) => (
                        <span
                          key={q}
                          className="text-[11px] font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full"
                        >
                          {q}
                        </span>
                      ))}
                      {c.qualifications.length > 3 && (
                        <span className="text-[11px] text-text2 px-2 py-0.5">
                          +{c.qualifications.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <span className="block text-center text-sm font-medium text-primary py-2 rounded-[10px] border border-primary/20 group-hover:bg-primary/5 transition-colors">
                    この業者に相談する
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && contractors.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-text2 mb-4">該当する工事業者がありません</p>
              <Link href="/contractors" className="text-primary hover:underline text-sm">
                条件をリセットする
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
