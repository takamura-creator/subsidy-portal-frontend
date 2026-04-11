"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import SkeletonCard from "@/components/shared/SkeletonCard";
import { fetchAdminSubsidy, updateSubsidy, type AdminSubsidy, ApiError } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

const CATEGORIES = ["IT導入", "防犯", "設備投資", "介護", "省エネ", "その他"];

export default function AdminSubsidyEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [subsidy, setSubsidy] = useState<AdminSubsidy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    fetchAdminSubsidy(params.id)
      .then(setSubsidy)
      .catch((err) => setError(err instanceof ApiError ? err.message : "データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subsidy) return;
    setError("");
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      ministry: fd.get("ministry") as string,
      prefecture: fd.get("prefecture") as string,
      pref_code: fd.get("prefecture") as string,
      max_amount: Number(fd.get("max_amount")) || 0,
      rate_min: Number(fd.get("rate_min")) || 0,
      rate_max: Number(fd.get("rate_max")) || 0,
      target_industries: (fd.get("target_industries") as string).split(",").map((s) => s.trim()).filter(Boolean),
      max_employees: Number(fd.get("max_employees")) || null,
      deadline: fd.get("deadline") as string,
      description: fd.get("description") as string,
      application_tips: fd.get("application_tips") as string,
      source_url: fd.get("source_url") as string,
      status: fd.get("status") as string,
    };

    try {
      await updateSubsidy(subsidy.id, data);
      router.push("/admin/subsidies");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  }

  if (!subsidy) {
    return <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error || "補助金が見つかりません。"}</div>;
  }

  const inputClass = "w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors";
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  return (
    <>
      <PageHeader
        title="補助金を編集"
        breadcrumbs={[
          { label: "ダッシュボード", href: "/admin" },
          { label: "補助金管理", href: "/admin/subsidies" },
          { label: subsidy.name },
        ]}
      />

      {error && (
        <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div>
          <label className={labelClass}>補助金名 *</label>
          <input name="name" required defaultValue={subsidy.name} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>カテゴリ *</label>
            <select name="category" required defaultValue={subsidy.category} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>管轄省庁</label>
            <input name="ministry" defaultValue={subsidy.ministry} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>都道府県</label>
            <select name="prefecture" defaultValue={subsidy.prefecture} className={inputClass}>
              <option value="">全国</option>
              {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>上限額（円）</label>
            <input name="max_amount" type="number" defaultValue={subsidy.max_amount} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>補助率（最小）</label>
            <input name="rate_min" type="number" step="0.01" min="0" max="1" defaultValue={subsidy.rate_min} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>補助率（最大）</label>
            <input name="rate_max" type="number" step="0.01" min="0" max="1" defaultValue={subsidy.rate_max} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>対象業種（カンマ区切り）</label>
          <input name="target_industries" defaultValue={subsidy.target_industries.join(", ")} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>従業員上限</label>
            <input name="max_employees" type="number" defaultValue={subsidy.max_employees ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>申請期限</label>
            <input name="deadline" type="date" defaultValue={subsidy.deadline} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>説明</label>
          <textarea name="description" rows={4} defaultValue={subsidy.description} className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className={labelClass}>申請ヒント</label>
          <textarea name="application_tips" rows={3} defaultValue={subsidy.application_tips} className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className={labelClass}>ソースURL</label>
          <input name="source_url" type="url" defaultValue={subsidy.source_url} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>ステータス</label>
          <select name="status" defaultValue={subsidy.status} className={inputClass}>
            <option value="open">有効（open）</option>
            <option value="upcoming">公募予定</option>
            <option value="closed">終了</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className={`btn-primary px-6 py-3 ${saving ? "opacity-50 pointer-events-none" : ""}`}>
            {saving ? "保存中..." : "変更を保存"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-6 py-3">
            キャンセル
          </button>
        </div>
      </form>
    </>
  );
}
