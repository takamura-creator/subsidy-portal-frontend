"use client";

import { useEffect, useState } from "react";
import { Users, FileText, HardHat, Link2, Activity } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import SkeletonCard from "@/components/shared/SkeletonCard";
import { fetchAdminDashboard, type AdminDashboard, ApiError } from "@/lib/api";

const ACTIVITY_ICON: Record<string, string> = {
  user_register: "👤",
  application_submit: "📄",
  contractor_approve: "✅",
  match_created: "🔗",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="管理ダッシュボード" />

      {/* StatsCard x4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard variant="stats" />
            <SkeletonCard variant="stats" />
            <SkeletonCard variant="stats" />
            <SkeletonCard variant="stats" />
          </>
        ) : error ? (
          <div className="sm:col-span-2 lg:col-span-4 rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : data && (
          <>
            <StatsCard label="総ユーザー数" value={data.total_users} icon={Users} href="/admin/users" />
            <StatsCard label="総申請数" value={data.total_applications} icon={FileText} href="/admin/applications" />
            <StatsCard label="承認待ち業者" value={data.pending_contractors} icon={HardHat} href="/admin/contractors?status=pending" />
            <StatsCard label="総マッチング数" value={data.total_matches} icon={Link2} />
          </>
        )}
      </div>

      {/* 最近のアクティビティ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-text2" />
          <h2 className="text-lg font-medium text-text">最近のアクティビティ</h2>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} variant="row" />)}
          </div>
        ) : data && data.recent_activities.length > 0 ? (
          <div className="rounded-[10px] border border-border bg-bg-card shadow-[var(--portal-shadow)] divide-y divide-border">
            {data.recent_activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg" aria-hidden="true">
                  {ACTIVITY_ICON[a.type] ?? "📌"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text">{a.detail}</span>
                </div>
                <span className="text-xs text-text2 whitespace-nowrap tabular-nums">
                  {new Date(a.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text2">アクティビティはありません。</p>
        )}
      </section>
    </>
  );
}
