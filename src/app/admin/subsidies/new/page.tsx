"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { createSubsidy, ApiError } from "@/lib/api";
import { PREFECTURES, INDUSTRIES } from "@/lib/constants";

const CATEGORIES = ["IT導入", "防犯", "設備投資", "介護", "省エネ", "その他"];

export default function AdminSubsidyNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

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

    if (!data.name || !data.category) {
      setError("補助金名とカテゴリは必須です。");
      setLoading(false);
      return;
    }

    try {
      await createSubsidy(data);
      router.push("/admin/subsidies");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors";
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  return (
    <>
      <PageHeader
        title="補助金を追加"
        breadcrumbs={[
          { label: "ダッシュボード", href: "/admin" },
          { label: "補助金管理", href: "/admin/subsidies" },
          { label: "新規追加" },
        ]}
      />

      {error && (
        <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div>
          <label className={labelClass}>補助金名 *</label>
          <input name="name" required className={inputClass} placeholder="IT導入補助金 2026" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>カテゴリ *</label>
            <select name="category" required className={inputClass}>
              <option value="">選択してください</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>管轄省庁</label>
            <input name="ministry" className={inputClass} placeholder="経済産業省" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>都道府県</label>
            <select name="prefecture" className={inputClass}>
              <option value="">全国</option>
              {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>上限額（円）</label>
            <input name="max_amount" type="number" className={inputClass} placeholder="4500000" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>補助率（最小）</label>
            <input name="rate_min" type="number" step="0.01" min="0" max="1" className={inputClass} placeholder="0.5" />
          </div>
          <div>
            <label className={labelClass}>補助率（最大）</label>
            <input name="rate_max" type="number" step="0.01" min="0" max="1" className={inputClass} placeholder="0.75" />
          </div>
        </div>

        <div>
          <label className={labelClass}>対象業種（カンマ区切り）</label>
          <input name="target_industries" className={inputClass} placeholder="製造業, 小売業, サービス業" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>従業員上限</label>
            <input name="max_employees" type="number" className={inputClass} placeholder="300" />
          </div>
          <div>
            <label className={labelClass}>申請期限</label>
            <input name="deadline" type="date" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>説明</label>
          <textarea name="description" rows={4} className={`${inputClass} resize-none`} placeholder="補助金の概要を入力" />
        </div>

        <div>
          <label className={labelClass}>申請ヒント</label>
          <textarea name="application_tips" rows={3} className={`${inputClass} resize-none`} placeholder="申請時のポイント" />
        </div>

        <div>
          <label className={labelClass}>ソースURL</label>
          <input name="source_url" type="url" className={inputClass} placeholder="https://..." />
        </div>

        <div>
          <label className={labelClass}>ステータス</label>
          <select name="status" className={inputClass} defaultValue="open">
            <option value="open">有効（open）</option>
            <option value="upcoming">公募予定</option>
            <option value="closed">終了</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className={`btn-primary px-6 py-3 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            {loading ? "作成中..." : "補助金を作成"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-6 py-3">
            キャンセル
          </button>
        </div>
      </form>
    </>
  );
}
