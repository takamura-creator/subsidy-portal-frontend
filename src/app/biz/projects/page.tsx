"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { fetchBizProjects, type BizProject } from "@/lib/api";

// ステータス設定
const STATUS_LABEL: Record<string, string> = {
  new: "新着",
  estimating: "見積中",
  working: "施工中",
  completed: "完了",
  declined: "辞退",
};

const STATUS_CLASS: Record<string, string> = {
  new: "bg-[#FEF9C3] text-[var(--hc-accent)]",
  estimating: "bg-[var(--hc-primary)]/8 text-[var(--hc-primary)]",
  working: "bg-[var(--hc-primary)]/8 text-[var(--hc-primary)]",
  completed: "bg-gray-100 text-gray-500",
  declined: "bg-red-50 text-red-500",
};

// フィルター設定
const FILTERS = [
  { key: "all", label: "すべて" },
  { key: "new", label: "新着" },
  { key: "estimating", label: "見積中" },
  { key: "working", label: "施工中" },
  { key: "completed", label: "完了" },
  { key: "declined", label: "辞退" },
];

// モックデータ（APIフォールバック用）
const MOCK_PROJECTS: BizProject[] = [
  { id: "1", company_name: "株式会社A", subsidy_name: "IT導入補助金", budget: 1000000, deadline: "2026-04-30", status: "new", created_at: "2026-04-12", updated_at: "2026-04-12" },
  { id: "2", company_name: "有限会社B", subsidy_name: "持続化補助金", budget: 500000, deadline: "2026-05-15", status: "new", created_at: "2026-04-11", updated_at: "2026-04-11" },
  { id: "3", company_name: "株式会社C", subsidy_name: "ものづくり補助金", budget: 2000000, deadline: "2026-05-20", status: "new", created_at: "2026-04-10", updated_at: "2026-04-10" },
  { id: "4", company_name: "株式会社D", subsidy_name: "IT導入補助金", budget: 800000, deadline: "2026-04-28", status: "estimating", created_at: "2026-04-08", updated_at: "2026-04-08" },
  { id: "5", company_name: "株式会社E", subsidy_name: "持続化補助金", budget: 600000, deadline: "2026-05-10", status: "working", created_at: "2026-04-05", updated_at: "2026-04-05" },
  { id: "6", company_name: "株式会社F", subsidy_name: "IT導入補助金", budget: 1200000, deadline: "2026-03-31", status: "completed", created_at: "2026-03-28", updated_at: "2026-03-28" },
  { id: "7", company_name: "株式会社G", subsidy_name: "ものづくり補助金", budget: 1500000, deadline: "2026-03-25", status: "completed", created_at: "2026-03-20", updated_at: "2026-03-20" },
  { id: "8", company_name: "株式会社H", subsidy_name: "持続化補助金", budget: 400000, deadline: "2026-03-20", status: "declined", created_at: "2026-03-15", updated_at: "2026-03-15" },
];

const STATUS_COUNTS: Record<string, number> = {
  all: MOCK_PROJECTS.length,
  new: MOCK_PROJECTS.filter((p) => p.status === "new").length,
  estimating: MOCK_PROJECTS.filter((p) => p.status === "estimating").length,
  working: MOCK_PROJECTS.filter((p) => p.status === "working").length,
  completed: MOCK_PROJECTS.filter((p) => p.status === "completed").length,
  declined: MOCK_PROJECTS.filter((p) => p.status === "declined").length,
};

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

export default function BizProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [activeFilter, setActiveFilter] = useState(initialStatus);
  const [projects, setProjects] = useState<BizProject[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<BizProject | null>(MOCK_PROJECTS[0]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchBizProjects({
        status: activeFilter === "all" ? undefined : activeFilter,
      });
      setProjects(res.projects);
      setSelectedProject(res.projects[0] ?? null);
    } catch {
      // モックデータを使用
      const filtered = activeFilter === "all"
        ? MOCK_PROJECTS
        : MOCK_PROJECTS.filter((p) => p.status === activeFilter);
      setProjects(filtered);
      setSelectedProject(filtered[0] ?? null);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter !== "all") params.set("status", activeFilter);
    const query = params.toString();
    router.replace(`/biz/projects${query ? `?${query}` : ""}`, { scroll: false });
  }, [activeFilter, router]);

  // 左サイドバー: BizSidebar + ステータスフィルター
  const left = (
    <div>
      <BizSidebar active="/biz/projects" />
      <div className="border-t border-[var(--hc-border)] my-3" />
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-2"
      >
        ステータス
      </p>
      <div className="space-y-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-[12px] transition-colors ${
              activeFilter === f.key
                ? "bg-[var(--hc-primary)]/8 text-[var(--hc-primary)] font-medium"
                : "text-[var(--hc-text-muted)] hover:bg-[var(--hc-primary)]/5"
            }`}
          >
            <span>{f.label}</span>
            <span className="text-[11px] bg-black/5 px-1.5 py-0.5 rounded-full">
              {STATUS_COUNTS[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // 中央: 案件カードリスト
  const center = (
    <div>
      <h1
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[1.1rem] font-bold text-[var(--hc-navy)] tracking-tight mb-4"
      >
        案件一覧
      </h1>

      {projects.length === 0 ? (
        <div className="card text-center py-10 text-[13px] text-[var(--hc-text-muted)]">
          該当する案件が見つかりませんでした。
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedProject(p);
                router.push(`/biz/projects/${p.id}`);
              }}
              className={`card flex items-center justify-between cursor-pointer hover:shadow-md transition-all ${
                selectedProject?.id === p.id ? "border-[var(--hc-primary)]/40" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-[var(--hc-navy)] truncate">
                  {p.company_name} — {p.subsidy_name}
                </div>
                <div className="flex gap-3 mt-1 flex-wrap text-[12px] text-[var(--hc-text-muted)]">
                  <span>期限: {p.deadline}</span>
                  <span>予算: {(p.budget / 10000).toLocaleString()}万円</span>
                </div>
              </div>
              <span
                className={`ml-3 shrink-0 text-[10px] font-semibold px-3 py-1 rounded-full ${STATUS_CLASS[p.status]}`}
              >
                {STATUS_LABEL[p.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 右パネル: プレビュー
  const right = (
    <div>
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        選択した案件
      </p>
      {selectedProject ? (
        <div className="card">
          <h3
            style={{ fontFamily: "'Sora', sans-serif" }}
            className="text-[13px] font-bold text-[var(--hc-navy)] mb-3"
          >
            {selectedProject.company_name} — {selectedProject.subsidy_name}
          </h3>
          <div className="space-y-0">
            {[
              { label: "ステータス", value: STATUS_LABEL[selectedProject.status], color: STATUS_CLASS[selectedProject.status] },
              { label: "期限", value: selectedProject.deadline },
              { label: "予算", value: `${(selectedProject.budget / 10000).toLocaleString()}万円` },
              { label: "受信日", value: selectedProject.created_at },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between py-1.5 border-b border-[var(--hc-border)] last:border-none text-[12px]"
              >
                <span className="text-[var(--hc-text-muted)]">{row.label}</span>
                {row.label === "ステータス" ? (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${row.color}`}>
                    {row.value}
                  </span>
                ) : (
                  <span className="font-medium text-[var(--hc-navy)]">{row.value}</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <Link
              href={`/biz/projects/${selectedProject.id}`}
              className="btn-primary block text-center text-[12px] py-2 rounded-md"
            >
              見積もり作成
            </Link>
            <Link
              href={`/biz/projects/${selectedProject.id}`}
              className="btn-secondary block text-center text-[12px] py-2 rounded-md"
            >
              詳細を見る
            </Link>
          </div>
        </div>
      ) : (
        <div className="card text-[13px] text-[var(--hc-text-muted)] text-center py-6">
          案件を選択してください
        </div>
      )}
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
