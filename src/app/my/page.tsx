"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonCard from "@/components/shared/SkeletonCard";
import {
  fetchMyDashboard,
  type Application,
  type ApplicationSummary,
  ApiError,
} from "@/lib/api";

// おすすめ補助金モックデータ（APIが未実装のため）
const MOCK_RECOMMENDATIONS = [
  { id: "it-2026", name: "IT導入補助金 2026", matchScore: 92, deadline: "2026-04-30" },
  { id: "shoukibo-2026", name: "小規模事業者持続化補助金", matchScore: 85, deadline: "2026-05-15" },
  { id: "setsubi-2026", name: "設備投資促進補助金", matchScore: 78, deadline: "2026-06-30" },
];

// 期限アラートモックデータ
const MOCK_DEADLINE_ALERTS = [
  { id: "it-2026", name: "IT導入補助金 2026", deadline: "2026-04-30" },
  { id: "shoukibo-2026", name: "小規模事業者持続化補助金", deadline: "2026-05-15" },
];

export default function MyDashboardPage() {
  const [summary, setSummary] = useState<ApplicationSummary | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyDashboard()
      .then((res) => {
        setSummary(res.summary ?? { submitted: 0, approved: 0, deadline_soon: 0 });
        setRecentApps(res.applications.slice(0, 5));
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("データの取得に失敗しました");
        }
      })
      .finally(() => setLoading(false));
  }, []);

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
        ) : summary && (
          <>
            <StatsCard
              label="申請中"
              value={summary.submitted}
              icon={FileText}
              href="/my/applications?status=submitted"
            />
            <StatsCard
              label="承認済み"
              value={summary.approved}
              icon={CheckCircle}
              href="/my/applications?status=approved"
            />
            <StatsCard
              label="期限間近"
              value={summary.deadline_soon}
              icon={Clock}
            />
          </>
        )}
      </div>

      {/* おすすめ補助金 */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-text mb-4">おすすめ補助金</h2>
        <div className="space-y-3">
          {MOCK_RECOMMENDATIONS.map((r) => (
            <Link
              key={r.id}
              href={`/subsidies/${r.id}`}
              className="flex items-center justify-between rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] hover:shadow-[var(--portal-shadow-md)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200"
            >
              <div>
                <div className="font-medium text-sm text-text">{r.name}</div>
                <div className="text-xs text-text2 mt-0.5">締切: {r.deadline}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary tabular-nums">
                  マッチ {r.matchScore}%
                </span>
                <span className="text-xs text-text2">詳細 &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 期限アラート */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-text mb-4">期限アラート</h2>
        <div className="space-y-2">
          {MOCK_DEADLINE_ALERTS.map((a) => (
            <Link
              key={a.id}
              href={`/subsidies/${a.id}`}
              className="flex items-center gap-3 rounded-[10px] border border-accent/30 bg-accent/5 px-4 py-3 hover:bg-accent/10 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm text-text">{a.name}</span>
              <span className="text-xs text-text2 ml-auto whitespace-nowrap">
                締切: {a.deadline}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 最近の申請 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-text">最近の申請</h2>
          <Link href="/my/applications" className="text-sm text-primary hover:underline">
            すべて見る
          </Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} variant="row" />)}
          </div>
        ) : recentApps.length > 0 ? (
          <div className="rounded-[10px] border border-border bg-bg-card shadow-[var(--portal-shadow)] divide-y divide-border">
            {recentApps.map((app) => (
              <Link
                key={app.id}
                href={`/my/applications/${app.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-bg-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text2 tabular-nums">
                    #{app.id.slice(0, 8)}
                  </span>
                  <span className="text-sm text-text">
                    {app.subsidy_name ?? app.subsidy_id}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <span className="text-xs text-text2 tabular-nums hidden sm:inline">
                    {new Date(app.updated_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text2">まだ申請がありません。</p>
        )}
      </section>

      {/* CTA */}
      <Link
        href="/my/applications/new"
        className="btn-primary inline-block"
      >
        新しい申請を作成
      </Link>
    </>
  );
}
