"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSubsidies, Subsidy } from "@/lib/api";
import { PREFECTURES, INDUSTRIES } from "@/lib/constants";
import Badge from "@/components/shared/Badge";

const CATEGORIES = ["全て", "IT導入", "防犯", "設備投資", "介護"] as const;

const STATUS_LABEL: Record<string, string> = {
  open: "受付中",
  upcoming: "公募予定",
  closed: "終了",
};

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toLocaleString("ja-JP")}万円`;
  }
  return `${amount.toLocaleString("ja-JP")}円`;
}

export default function SubsidiesPage() {
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefecture, setPrefecture] = useState("");
  const [industry, setIndustry] = useState("");
  const [category, setCategory] = useState("全て");
  const [keyword, setKeyword] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSubsidies({
      prefecture: prefecture || undefined,
      category: category === "全て" ? undefined : category,
      industry: industry || undefined,
    })
      .then((d) => setSubsidies(d.subsidies))
      .finally(() => setLoading(false));
  }, [prefecture, category, industry]);

  const filtered = keyword
    ? subsidies.filter(
        (s) =>
          s.name.includes(keyword) ||
          s.description.includes(keyword) ||
          s.ministry.includes(keyword)
      )
    : subsidies;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
      {/* ページヘッダー */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-medium text-text mb-3">
          補助金一覧
        </h1>
        <p className="text-text2 text-sm max-w-lg mx-auto">
          防犯カメラ導入に活用できる補助金を検索できます。都道府県・カテゴリ・業種で絞り込めます。
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* フィルターサイドバー */}
        <aside className="md:w-64 shrink-0">
          {/* モバイル: トグルボタン */}
          <button
            className="md:hidden w-full rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] flex items-center justify-between mb-3"
            onClick={() => setFilterOpen(!filterOpen)}
            aria-expanded={filterOpen}
            aria-controls="filter-panel"
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
            id="filter-panel"
            role="region"
            aria-label="フィルター"
            className={`${filterOpen ? "block" : "hidden"} md:block space-y-4`}
          >
            {/* キーワード */}
            <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
              <label className="block text-xs font-medium text-text2 mb-2">キーワード</label>
              <input
                type="text"
                placeholder="補助金名・説明で検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)]"
              />
            </div>

            {/* 都道府県 */}
            <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
              <label className="block text-xs font-medium text-text2 mb-2">都道府県</label>
              <select
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-sm text-text focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)]"
              >
                <option value="">全て</option>
                {PREFECTURES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* 業種 */}
            <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
              <label className="block text-xs font-medium text-text2 mb-2">業種</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-sm text-text focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)]"
              >
                <option value="">全て</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* AI診断CTA */}
            <Link
              href="/match"
              className="btn-primary block w-full text-center"
            >
              AIで診断する
            </Link>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <div className="flex-1 min-w-0">
          {/* カテゴリタブ + 件数 */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap" role="tablist" aria-label="カテゴリ">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={category === c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === c
                      ? "bg-primary text-white shadow-sm"
                      : "bg-bg-card border border-border text-text hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <span className="text-xs text-text2 bg-bg-card border border-border px-3 py-1 rounded-full">
              {filtered.length}件
            </span>
          </div>

          {/* ローディング */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-[10px] border border-border bg-bg-card p-4">
                  <div className="skeleton h-4 w-20 mb-3" />
                  <div className="skeleton h-5 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2 mb-4" />
                  <div className="flex gap-3">
                    <div className="skeleton h-14 flex-1 rounded-[10px]" />
                    <div className="skeleton h-14 flex-1 rounded-[10px]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* カードグリッド */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((s) => {
                const statusVariant = (s.status === "open" || s.status === "closed" || s.status === "upcoming")
                  ? s.status
                  : "closed" as const;

                return (
                  <Link
                    key={s.id}
                    href={`/subsidies/${s.id}`}
                    className="block rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] transition-[box-shadow,transform] duration-200 hover:shadow-[var(--portal-shadow-md)] hover:-translate-y-0.5 group"
                  >
                    {/* カテゴリ + ステータス */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {s.category}
                      </span>
                      <Badge variant={statusVariant}>
                        {STATUS_LABEL[s.status] ?? "終了"}
                      </Badge>
                    </div>

                    {/* 補助金名 */}
                    <h2 className="font-medium text-base text-text mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {s.name}
                    </h2>
                    <p className="text-xs text-text2 mb-3">{s.ministry} / {s.prefecture}</p>

                    {/* 補助率・上限額・締切 */}
                    <div className="flex gap-3 mb-3">
                      <div className="bg-bg-surface rounded-[10px] px-3 py-2 text-center flex-1">
                        <div className="text-xs text-text2">補助率</div>
                        <div className="text-lg font-medium text-primary tabular-nums">
                          {Math.round(s.rate_max * 100)}%
                        </div>
                      </div>
                      <div className="bg-bg-surface rounded-[10px] px-3 py-2 text-center flex-1">
                        <div className="text-xs text-text2">上限額</div>
                        <div className="text-base font-medium text-text tabular-nums">
                          {formatAmount(s.max_amount)}
                        </div>
                      </div>
                      {s.deadline && (
                        <div className="bg-bg-surface rounded-[10px] px-3 py-2 text-center flex-1 hidden sm:block">
                          <div className="text-xs text-text2">締切</div>
                          <div className="text-sm font-medium text-text">{s.deadline}</div>
                        </div>
                      )}
                    </div>

                    {/* 詳細を見る */}
                    <span className="block text-center text-sm font-medium text-primary py-2 rounded-[10px] border border-primary/20 group-hover:bg-primary/5 transition-colors">
                      詳細を見る
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-text2 mb-4">該当する補助金がありません</p>
              <Link href="/match" className="text-primary hover:underline text-sm">
                AI診断で最適な補助金を探す →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
