"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Wrench, BarChart3 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import SkeletonCard from "@/components/shared/SkeletonCard";
import EmptyState from "@/components/shared/EmptyState";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectRow from "@/components/projects/ProjectRow";
import MonthlySummary from "@/components/projects/MonthlySummary";
import {
  fetchBizProjects,
  fetchBizProjectsSummary,
  acceptProject,
  type BizProject,
  type BizStats,
  ApiError,
} from "@/lib/api";

export default function BizDashboardPage() {
  const [stats, setStats] = useState<BizStats | null>(null);
  const [newProjects, setNewProjects] = useState<BizProject[]>([]);
  const [activeProjects, setActiveProjects] = useState<BizProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAccept(id: string) {
    if (!confirm("この案件に対応可能として応答しますか？")) return;
    try {
      await acceptProject(id);
      // リロード
      setNewProjects((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => prev ? { ...prev, new_count: prev.new_count - 1, active_count: prev.active_count + 1 } : prev);
    } catch {
      alert("操作に失敗しました。");
    }
  }

  return (
    <>
      <PageHeader title="ダッシュボード" />

      {/* StatsCard x3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard variant="stats" />
            <SkeletonCard variant="stats" />
            <SkeletonCard variant="stats" />
          </>
        ) : error ? (
          <div className="sm:col-span-3 rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : stats && (
          <>
            <StatsCard
              label="新着案件"
              value={stats.new_count}
              icon={Bell}
              href="/biz/projects?status=new"
            />
            <StatsCard
              label="対応中"
              value={stats.active_count}
              icon={Wrench}
              href="/biz/projects?status=estimating"
            />
            <StatsCard
              label="今月実績"
              value={stats.monthly_completed}
              icon={BarChart3}
            />
          </>
        )}
      </div>

      {/* 新着案件 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-text">新着案件</h2>
          <Link href="/biz/projects?status=new" className="text-sm text-accent hover:underline">
            すべて見る
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : newProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onAccept={handleAccept} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="新着案件はありません"
            description="現在マッチングされた新着案件はありません。"
          />
        )}
      </section>

      {/* 対応中の案件 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-text">対応中の案件</h2>
          <Link href="/biz/projects?status=estimating" className="text-sm text-primary hover:underline">
            すべて見る
          </Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            <SkeletonCard variant="row" />
            <SkeletonCard variant="row" />
          </div>
        ) : activeProjects.length > 0 ? (
          <div className="rounded-[10px] border border-border bg-bg-card shadow-[var(--portal-shadow)] divide-y divide-border">
            {activeProjects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text2">対応中の案件はありません。</p>
        )}
      </section>

      {/* 月次実績サマリー */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-text mb-4">月次実績サマリー</h2>
        {stats ? (
          <MonthlySummary
            month={stats.month}
            received={stats.monthly_received}
            completed={stats.monthly_completed}
          />
        ) : (
          <SkeletonCard variant="stats" />
        )}
      </section>
    </>
  );
}
