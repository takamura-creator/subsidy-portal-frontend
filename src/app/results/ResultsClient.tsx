"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/shared/Card";
import {
  fetchRecipientStats,
  RecipientStatsResponse,
  PrefectureSummary,
} from "@/lib/api";

function formatAmount(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}億円`;
  if (amount >= 10_000) return `${(amount / 10_000).toLocaleString()}万円`;
  return `${amount.toLocaleString()}円`;
}

export default function ResultsClient() {
  const [stats, setStats] = useState<RecipientStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipientStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className="py-20 flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="animate-pulse text-text-muted">データを読み込んでいます...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-20 max-w-4xl mx-auto text-center">
        <p className="text-error" role="alert">{error || "データの取得に失敗しました"}</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats Summary */}
      <section className="pb-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="総登録件数" value={stats.total_records.toLocaleString()} unit="件" />
          <StatCard label="交付総額" value={formatAmount(stats.total_amount)} />
          <StatCard label="掲載都道府県" value={String(stats.by_prefecture.length)} unit="都道府県" />
        </div>
      </section>

      {/* Prefecture Grid */}
      <section className="pb-8 max-w-4xl mx-auto" aria-label="都道府県別一覧">
        <h2 className="text-lg font-bold mb-4 [font-family:'Sora',sans-serif] text-[var(--hc-navy)]">
          都道府県別
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stats.by_prefecture.map((pref) => (
            <PrefectureCard key={pref.prefecture} data={pref} />
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8 max-w-4xl mx-auto" aria-label="カテゴリ別一覧">
        <h2 className="text-lg font-bold mb-4 [font-family:'Sora',sans-serif] text-[var(--hc-navy)]">
          カテゴリ別
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.by_category.map((cat) => (
            <Card key={cat.category} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">{cat.category}</p>
                <p className="text-xs mt-1 text-text2">
                  {cat.count}件 ・ {formatAmount(cat.total_amount)}
                </p>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--hc-primary-soft)] text-[var(--hc-primary)]">
                {cat.count}件
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* Fiscal Year */}
      <section className="pb-12 max-w-4xl mx-auto" aria-label="年度別推移">
        <h2 className="text-lg font-bold mb-4 [font-family:'Sora',sans-serif] text-[var(--hc-navy)]">
          年度別推移
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.by_fiscal_year.map((fy) => (
            <Card key={fy.fiscal_year} className="text-center">
              <p className="text-xs text-text2">{fy.fiscal_year}年度</p>
              <p className="text-lg font-bold mt-1 [font-family:'Sora',sans-serif] text-[var(--hc-navy)]">
                {fy.count}
              </p>
              <p className="text-xs mt-1 text-text2">
                {formatAmount(fy.total_amount)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Source note */}
      <section className="pb-12 max-w-4xl mx-auto">
        <p className="text-xs leading-relaxed text-text2">
          ※ 本データは各省庁・自治体が公表した交付決定情報に基づいています。
          最新情報は各機関の公式サイトをご確認ください。
        </p>
      </section>
    </>
  );
}

/** 統計サマリーカード — Card コンポーネントを使用 */
function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Card className="text-center">
      <p className="text-xs mb-2 text-text2">{label}</p>
      <p className="text-2xl font-bold [font-family:'Sora',sans-serif] text-[var(--hc-primary)]">
        {value}
      </p>
      {unit && <p className="text-xs mt-1 text-text2">{unit}</p>}
    </Card>
  );
}

/** 都道府県カード — Card と同一トークンを Link に適用 */
function PrefectureCard({ data }: { data: PrefectureSummary }) {
  return (
    <Link
      href={`/results/${encodeURIComponent(data.prefecture)}`}
      className="block p-4 rounded-[10px] border border-border bg-bg-card no-underline transition-all shadow-[var(--portal-shadow)] hover:shadow-[var(--portal-shadow-md)] hover:-translate-y-0.5"
    >
      <p className="text-sm font-medium text-text">{data.prefecture}</p>
      <p className="text-xs mt-1 text-text2">
        {data.count}件
      </p>
      <p className="text-xs text-[var(--hc-primary)]">
        {formatAmount(data.total_amount)}
      </p>
    </Link>
  );
}
