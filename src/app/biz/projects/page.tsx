"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { fetchBizProjects, type BizProject } from "@/lib/api";

// ステータス設定
const STATUS_LABEL: Record<string, string> = {
  new: "新着",
  estimating: "対応中",
  working: "対応中",
  completed: "完了",
  declined: "辞退",
};

// フィルター設定（モックアップ準拠）
const FILTERS = [
  { key: "all", label: "すべて" },
  { key: "new", label: "新着" },
  { key: "active", label: "対応中" },
  { key: "completed", label: "完了" },
  { key: "declined", label: "辞退" },
];

// モックデータ（モックアップ準拠 — 8件）
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

// モックアップ準拠メタ情報
const META_MAP: Record<string, { area: string; industry: string; cameras: string; date: string }> = {
  "1": { area: "新宿区", industry: "小売業", cameras: "カメラ8台", date: "4/12" },
  "2": { area: "品川区", industry: "飲食業", cameras: "カメラ4台", date: "4/11" },
  "3": { area: "川口市", industry: "製造業", cameras: "カメラ12台", date: "4/10" },
  "4": { area: "渋谷区", industry: "サービス業", cameras: "カメラ6台", date: "4/8" },
  "5": { area: "横浜市", industry: "小売業", cameras: "カメラ4台", date: "4/5" },
  "6": { area: "千代田区", industry: "医療", cameras: "カメラ10台", date: "3/28" },
  "7": { area: "大田区", industry: "製造業", cameras: "カメラ8台", date: "3/20" },
  "8": { area: "世田谷区", industry: "宿泊業", cameras: "カメラ6台", date: "3/15" },
};

function getStatusCounts(projects: BizProject[]) {
  return {
    all: projects.length,
    new: projects.filter((p) => p.status === "new").length,
    active: projects.filter((p) => p.status === "estimating" || p.status === "working").length,
    completed: projects.filter((p) => p.status === "completed").length,
    declined: projects.filter((p) => p.status === "declined").length,
  };
}

function getStatusBadgeStyle(status: string): { bg: string; color: string } {
  switch (status) {
    case "new": return { bg: "var(--hc-accent-light)", color: "var(--hc-accent)" };
    case "estimating":
    case "working": return { bg: "rgba(21,128,61,0.08)", color: "var(--hc-primary)" };
    case "completed": return { bg: "rgba(22,163,74,0.08)", color: "var(--hc-success)" };
    case "declined": return { bg: "rgba(220,38,38,0.08)", color: "var(--hc-error)" };
    default: return { bg: "rgba(0,0,0,0.04)", color: "var(--hc-text-muted)" };
  }
}

// 共有サイドバー
function BizSidebar({ active }: { active: string }) {
  const links = [
    { href: "/biz", label: "ダッシュボード", icon: "📋", badge: null },
    { href: "/biz/projects", label: "案件一覧", icon: "📁", badge: "8" },
    { href: "/biz/profile", label: "プロフィール", icon: "👤", badge: null },
    { href: "/biz/settings", label: "設定", icon: "⚙", badge: null },
  ];
  return (
    <div>
      <span className="section-title">業者ポータル</span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center justify-between px-[10px] py-2 rounded-md text-[13px] mb-[2px] no-underline transition-colors ${
            active === l.href ? "font-medium" : ""
          }`}
          style={{
            background: active === l.href ? "rgba(21,128,61,0.06)" : undefined,
            color: active === l.href ? "var(--hc-primary)" : "var(--hc-text-muted)",
          }}
        >
          <span>{l.icon} {l.label}</span>
          {l.badge && (
            <span
              className="text-[11px] px-1.5 py-[1px] rounded-full"
              style={{ background: "var(--hc-accent-light)", color: "var(--hc-accent)" }}
            >
              {l.badge}
            </span>
          )}
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

  const statusCounts = getStatusCounts(MOCK_PROJECTS);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchBizProjects({
        status: activeFilter === "all" ? undefined : activeFilter,
      });
      setProjects(res.projects);
      setSelectedProject(res.projects[0] ?? null);
    } catch {
      // モックフィルタ
      let filtered = MOCK_PROJECTS;
      if (activeFilter === "new") {
        filtered = MOCK_PROJECTS.filter((p) => p.status === "new");
      } else if (activeFilter === "active") {
        filtered = MOCK_PROJECTS.filter((p) => p.status === "estimating" || p.status === "working");
      } else if (activeFilter !== "all") {
        filtered = MOCK_PROJECTS.filter((p) => p.status === activeFilter);
      }
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

  // 左サイドバー
  const left = (
    <div>
      <BizSidebar active="/biz/projects" />
      <div className="divider" />
      <span className="section-title">ステータス</span>
      <div className="flex flex-col gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`w-full flex items-center justify-between px-[10px] py-1.5 rounded text-[12px] transition-colors cursor-pointer border-none ${
              activeFilter === f.key ? "font-medium" : ""
            }`}
            style={{
              background: activeFilter === f.key ? "rgba(21,128,61,0.06)" : "transparent",
              color: activeFilter === f.key ? "var(--hc-primary)" : "var(--hc-text-muted)",
            }}
          >
            <span>{f.label}</span>
            <span
              className="text-[11px] px-1.5 py-[1px] rounded-full"
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              {statusCounts[f.key as keyof typeof statusCounts] ?? 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // 中央: 案件カードリスト
  const center = (
    <div>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)", marginBottom: 16 }}>
        案件一覧
      </h1>

      {projects.length === 0 ? (
        <div className="card text-center py-10 text-[13px]" style={{ color: "var(--hc-text-muted)" }}>
          該当する案件が見つかりませんでした。
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {projects.map((p) => {
            const meta = META_MAP[p.id];
            const badge = getStatusBadgeStyle(p.status);
            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProject(p);
                }}
                className="grid items-center gap-3 cursor-pointer rounded-lg px-3.5 py-3.5 transition-all hover:shadow-md"
                style={{
                  gridTemplateColumns: "1fr auto",
                  background: "var(--hc-white)",
                  border: selectedProject?.id === p.id
                    ? "1px solid rgba(21,128,61,0.3)"
                    : "1px solid var(--hc-border)",
                }}
              >
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: "var(--hc-navy)" }}>
                    {p.company_name} — {p.subsidy_name}
                  </div>
                  <div className="flex gap-[10px] mt-1 flex-wrap text-[12px]" style={{ color: "var(--hc-text-muted)" }}>
                    {meta ? (
                      <>
                        <span>{meta.area}</span>
                        <span>{meta.industry}</span>
                        <span>{meta.cameras}</span>
                        <span>{meta.date}</span>
                      </>
                    ) : (
                      <span>期限: {p.deadline}</span>
                    )}
                  </div>
                </div>
                <span
                  className="text-[10px] font-semibold px-[10px] py-[3px] rounded-full"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 右パネル: プレビュー
  const right = (
    <div>
      <span className="section-title">選択した案件</span>
      {selectedProject ? (() => {
        const meta = META_MAP[selectedProject.id];
        const badge = getStatusBadgeStyle(selectedProject.status);
        return (
          <div
            className="rounded-lg"
            style={{
              background: "var(--hc-white)",
              border: "1px solid var(--hc-border)",
              padding: 16,
            }}
          >
            <h3
              style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10 }}
            >
              {selectedProject.company_name} — {selectedProject.subsidy_name}
            </h3>
            <div>
              {[
                { label: "ステータス", value: STATUS_LABEL[selectedProject.status], isStatus: true },
                { label: "エリア", value: meta?.area || "---" },
                { label: "業種", value: meta?.industry || "---" },
                { label: "台数", value: meta?.cameras.replace("カメラ", "") || "---" },
                { label: "受信日", value: meta?.date || selectedProject.created_at },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between py-1.5 text-[12px]"
                  style={{ borderBottom: "1px solid var(--hc-border)" }}
                >
                  <span style={{ color: "var(--hc-text-muted)" }}>{row.label}</span>
                  {row.isStatus ? (
                    <span style={{ color: badge.color, fontWeight: 500 }}>{row.value}</span>
                  ) : (
                    <span style={{ fontWeight: 500, color: "var(--hc-text)" }}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
            <Link
              href={`/biz/projects/${selectedProject.id}`}
              className="btn-primary mt-3"
              style={{ fontSize: 12, padding: "8px 12px" }}
            >
              見積もり作成
            </Link>
            <Link
              href={`/biz/projects/${selectedProject.id}`}
              className="btn-secondary block mt-2 w-full"
              style={{ fontSize: 12, padding: "8px 12px" }}
            >
              詳細を見る
            </Link>
          </div>
        );
      })() : (
        <div className="card text-[13px] text-center py-6" style={{ color: "var(--hc-text-muted)" }}>
          案件を選択してください
        </div>
      )}
    </div>
  );

  return (
    <ThreeColumnLayout
      left={left}
      center={center}
      right={right}
      gridCols="200px 1fr 260px"
    />
  );
}
