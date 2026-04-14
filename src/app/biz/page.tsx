"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import {
  fetchBizProjects,
  fetchBizProjectsSummary,
  type BizProject,
  type BizStats,
} from "@/lib/api";

// ステータスラベル・バッジ
const STATUS_LABEL: Record<string, string> = {
  new: "新着",
  estimating: "見積中",
  working: "施工中",
  completed: "完了",
  declined: "辞退",
};

const STATUS_CLASS: Record<string, string> = {
  new: "bg-[var(--hc-accent)]/10 text-[var(--hc-accent)]",
  estimating: "bg-[var(--hc-primary)]/10 text-[var(--hc-primary)]",
  working: "bg-[var(--hc-primary)]/10 text-[var(--hc-primary)]",
  completed: "bg-gray-100 text-gray-500",
  declined: "bg-red-50 text-red-500",
};

// モックデータ（APIフォールバック用）
const MOCK_STATS: BizStats = {
  new_count: 3,
  active_count: 5,
  monthly_received: 5,
  monthly_completed: 12,
  month: "2026-04",
};

const MOCK_NEW: BizProject[] = [
  { id: "1", company_name: "株式会社A", subsidy_name: "IT導入補助金（新宿区）", budget: 1000000, deadline: "2026-04-30", status: "new", created_at: "2026-04-12", updated_at: "2026-04-12" },
  { id: "2", company_name: "有限会社B", subsidy_name: "持続化補助金（品川区）", budget: 500000, deadline: "2026-05-15", status: "new", created_at: "2026-04-11", updated_at: "2026-04-11" },
  { id: "3", company_name: "株式会社C", subsidy_name: "ものづくり補助金（川口市）", budget: 2000000, deadline: "2026-05-20", status: "new", created_at: "2026-04-10", updated_at: "2026-04-10" },
];

const MOCK_ACTIVE: BizProject[] = [
  { id: "4", company_name: "株式会社D", subsidy_name: "IT導入補助金（渋谷区）", budget: 800000, deadline: "2026-04-28", status: "estimating", created_at: "2026-04-08", updated_at: "2026-04-08" },
];

const MONTHLY_DATA = [
  { label: "1月", value: 2, pct: 30 },
  { label: "2月", value: 3, pct: 45 },
  { label: "3月", value: 4, pct: 60 },
  { label: "4月", value: 5, pct: 75 },
];

// 共有サイドバー
function BizSidebar({ active }: { active: string }) {
  const links = [
    { href: "/biz", label: "ダッシュボード", icon: "📊" },
    { href: "/biz/projects", label: "案件一覧", icon: "📋" },
    { href: "/biz/profile", label: "プロフィール", icon: "👤" },
    { href: "/biz/settings", label: "設定", icon: "⚙" },
  ];
  return (
    <div>
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        業者ポータル
      </p>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-[13px] mb-1 transition-colors ${
            active === l.href
              ? "bg-[var(--hc-primary)]/8 text-[var(--hc-primary)] font-medium"
              : "text-[var(--hc-text-muted)] hover:bg-[var(--hc-primary)]/5 hover:text-[var(--hc-primary)]"
          }`}
        >
          <span>{l.icon}</span>
          <span>{l.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function BizDashboardPage() {
  const [stats, setStats] = useState<BizStats>(MOCK_STATS);
  const [newProjects, setNewProjects] = useState<BizProject[]>(MOCK_NEW);
  const [activeProjects, setActiveProjects] = useState<BizProject[]>(MOCK_ACTIVE);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, newRes, activeRes] = await Promise.all([
          fetchBizProjectsSummary(),
          fetchBizProjects({ status: "new" }),
          fetchBizProjects({ status: "estimating" }),
        ]);
        setStats(summaryRes);
        setNewProjects(newRes.projects.slice(0, 5));
        setActiveProjects(activeRes.projects.slice(0, 5));
      } catch {
        // モックデータを使用
      }
    }
    load();
  }, []);

  const left = <BizSidebar active="/biz" />;

  const center = (
    <div>
      <h1
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[1.1rem] font-bold text-[var(--hc-navy)] tracking-tight mb-4"
      >
        セキュアテック株式会社
      </h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { num: stats.new_count, label: "新着案件", color: "var(--hc-accent)" },
          { num: stats.active_count, label: "対応中", color: "var(--hc-primary)" },
          { num: stats.monthly_completed, label: "完了", color: "#16a34a" },
          { num: "4.8", label: "評価", color: "var(--hc-navy)" },
        ].map((c) => (
          <div key={c.label} className="card text-center py-4">
            <div
              style={{ fontFamily: "'Sora', sans-serif", color: c.color }}
              className="text-2xl font-bold mb-1"
            >
              {c.num}
            </div>
            <div className="text-[11px] text-[var(--hc-text-muted)]">{c.label}</div>
          </div>
        ))}
      </div>

      {/* アラートバナー */}
      {stats.new_count > 0 && (
        <div className="flex items-center gap-3 bg-[#FEF9C3] border border-[var(--hc-accent)]/20 rounded-lg px-4 py-3 mb-5 text-[13px] text-[var(--hc-accent)]">
          <span>🔔</span>
          <span>
            <strong className="text-[var(--hc-navy)]">{stats.new_count}件</strong>
            の新着案件があります。24時間以内にご対応ください。
          </span>
        </div>
      )}

      {/* 新着案件 */}
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        新着案件
      </p>
      <div className="space-y-2 mb-5">
        {newProjects.map((p) => (
          <Link key={p.id} href={`/biz/projects/${p.id}`}>
            <div className="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer mb-2">
              <div>
                <div className="text-[13px] font-semibold text-[var(--hc-navy)]">
                  {p.company_name} — {p.subsidy_name}
                </div>
                <div className="text-[11px] text-[var(--hc-text-muted)] mt-0.5">
                  期限: {p.deadline}
                </div>
              </div>
              <span
                className={`text-[10px] font-semibold px-3 py-1 rounded-full ${STATUS_CLASS[p.status]}`}
              >
                {STATUS_LABEL[p.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 対応中 */}
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        対応中
      </p>
      <div className="space-y-2 mb-5">
        {activeProjects.length === 0 ? (
          <p className="text-[13px] text-[var(--hc-text-muted)]">対応中の案件はありません。</p>
        ) : (
          activeProjects.map((p) => (
            <Link key={p.id} href={`/biz/projects/${p.id}`}>
              <div className="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer mb-2">
                <div>
                  <div className="text-[13px] font-semibold text-[var(--hc-navy)]">
                    {p.company_name} — {p.subsidy_name}
                  </div>
                  <div className="text-[11px] text-[var(--hc-text-muted)] mt-0.5">
                    見積もり作成中
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-3 py-1 rounded-full ${STATUS_CLASS[p.status]}`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* 月次実績チャート */}
      <div className="card mt-4">
        <h3
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[12px] font-bold text-[var(--hc-navy)] mb-3"
        >
          月次実績（2026年）
        </h3>
        {MONTHLY_DATA.map((row) => (
          <div key={row.label} className="flex items-center gap-2 mb-2 text-[11px] text-[var(--hc-text-muted)]">
            <span className="w-8">{row.label}</span>
            <div className="flex-1 h-4 bg-black/5 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm"
                style={{ width: `${row.pct}%`, background: "var(--hc-primary)" }}
              />
            </div>
            <span className="w-6 text-right font-semibold text-[var(--hc-navy)]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const right = (
    <div>
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        クイックアクション
      </p>
      <Link
        href="/biz/profile"
        className="block w-full text-left px-3 py-2 mb-2 bg-white border border-[var(--hc-border)] rounded-md text-[12px] font-medium text-[var(--hc-navy)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors"
      >
        👤 プロフィール更新
      </Link>
      <Link
        href="/biz/profile"
        className="block w-full text-left px-3 py-2 mb-2 bg-white border border-[var(--hc-border)] rounded-md text-[12px] font-medium text-[var(--hc-navy)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors"
      >
        📍 対応エリア変更
      </Link>

      <div className="border-t border-[var(--hc-border)] my-3" />

      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        通知
      </p>
      <div className="space-y-0">
        {[
          { title: "株式会社A", body: "から見積もり依頼", date: "4/12" },
          { title: "株式会社D", body: "から追加質問", date: "4/11" },
          { title: "プロフィール", body: "の資格情報を更新してください", date: "4/8" },
        ].map((n, i) => (
          <div
            key={i}
            className="py-2 border-b border-[var(--hc-border)] last:border-none text-[11px] text-[var(--hc-text-muted)] leading-snug"
          >
            <strong className="text-[var(--hc-navy)]">{n.title}</strong>
            {n.body}
            <div className="text-[10px] mt-0.5">{n.date}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
