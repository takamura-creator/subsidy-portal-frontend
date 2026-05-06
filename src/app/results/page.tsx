"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function ResultsPage() {
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
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: "var(--hc-bg)" }}>
        <div className="animate-pulse text-text-muted">データを読み込んでいます...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen p-6" style={{ background: "var(--hc-bg)" }}>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-error">{error || "データの取得に失敗しました"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: "var(--hc-bg)" }}>
      {/* Hero */}
      <section className="px-6 pt-12 pb-8 text-center max-w-4xl mx-auto">
        <h1
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.5px" }}
        >
          補助金交付実績データベース
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--hc-text-muted)" }}>
          官公庁が公表した補助金交付実績データを都道府県別・補助金種別に閲覧���きます。
          公表データに基づく透明性の確保と適正利用の監視に資することを目的としています。
        </p>
      </section>

      {/* Stats Summary */}
      <section className="px-6 pb-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="総登録件数" value={stats.total_records.toLocaleString()} unit="件" />
          <StatCard label="交付総額" value={formatAmount(stats.total_amount)} />
          <StatCard label="掲載都道府県" value={String(stats.by_prefecture.length)} unit="都道府県" />
        </div>
      </section>

      {/* Prefecture Grid */}
      <section className="px-6 pb-8 max-w-4xl mx-auto">
        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}
        >
          都道府県別
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stats.by_prefecture.map((pref) => (
            <PrefectureCard key={pref.prefecture} data={pref} />
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-8 max-w-4xl mx-auto">
        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}
        >
          カテゴリ別
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.by_category.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-4 rounded-[10px] border transition-all"
              style={{
                background: "var(--hc-white)",
                borderColor: "var(--hc-border)",
                boxShadow: "var(--hc-shadow)",
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--hc-text)" }}>{cat.category}</p>
                <p className="text-xs mt-1" style={{ color: "var(--hc-text-muted)" }}>
                  {cat.count}件 ・ {formatAmount(cat.total_amount)}
                </p>
              </div>
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: "var(--hc-primary-soft)", color: "var(--hc-primary)" }}
              >
                {cat.count}件
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Fiscal Year */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}
        >
          年度別推移
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.by_fiscal_year.map((fy) => (
            <div
              key={fy.fiscal_year}
              className="p-4 rounded-[10px] border text-center"
              style={{
                background: "var(--hc-white)",
                borderColor: "var(--hc-border)",
                boxShadow: "var(--hc-shadow)",
              }}
            >
              <p className="text-xs" style={{ color: "var(--hc-text-muted)" }}>{fy.fiscal_year}年度</p>
              <p className="text-lg font-bold mt-1" style={{ color: "var(--hc-navy)", fontFamily: "'Sora', sans-serif" }}>
                {fy.count}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--hc-text-muted)" }}>
                {formatAmount(fy.total_amount)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Source note */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <p className="text-xs leading-relaxed" style={{ color: "var(--hc-text-muted)" }}>
          ※ 本データは各省庁・自治体が公表した交付決定情報に基づいています。
          最新の情報は各機関の公式サイトをご確認ください。
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div
      className="p-5 rounded-[10px] border text-center"
      style={{
        background: "var(--hc-white)",
        borderColor: "var(--hc-border)",
        boxShadow: "var(--hc-shadow)",
      }}
    >
      <p className="text-xs mb-2" style={{ color: "var(--hc-text-muted)" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: "var(--hc-primary)", fontFamily: "'Sora', sans-serif" }}>
        {value}
      </p>
      {unit && <p className="text-xs mt-1" style={{ color: "var(--hc-text-muted)" }}>{unit}</p>}
    </div>
  );
}

function PrefectureCard({ data }: { data: PrefectureSummary }) {
  return (
    <Link
      href={`/results/${encodeURIComponent(data.prefecture)}`}
      className="p-4 rounded-[10px] border no-underline transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{
        background: "var(--hc-white)",
        borderColor: "var(--hc-border)",
        boxShadow: "var(--hc-shadow)",
      }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--hc-text)" }}>{data.prefecture}</p>
      <p className="text-xs mt-1" style={{ color: "var(--hc-text-muted)" }}>
        {data.count}件
      </p>
      <p className="text-xs" style={{ color: "var(--hc-primary)" }}>
        {formatAmount(data.total_amount)}
      </p>
    </Link>
  );
}
