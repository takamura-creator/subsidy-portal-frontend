"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import TabFilter from "@/components/shared/TabFilter";
import Button from "@/components/shared/Button";
import PasswordChangeForm from "@/components/settings/PasswordChangeForm";
import NotificationSettings from "@/components/settings/NotificationSettings";
import DangerZone from "@/components/settings/DangerZone";
import { fetchProfileDetail, updateProfile, type UserProfileDetail, ApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { INDUSTRIES, PREFECTURES } from "@/lib/constants";

const TABS = [
  { key: "profile", label: "プロフィール" },
  { key: "notifications", label: "通知設定" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // フォーム状態
  const [companyName, setCompanyName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [phone, setPhone] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [industry, setIndustry] = useState("");
  const [employees, setEmployees] = useState("");

  useEffect(() => {
    if (!requireAuth(["owner", "admin"], "/my/settings")) return;

    fetchProfileDetail()
      .then((p) => {
        setProfile(p);
        setCompanyName(p.company_name || "");
        setRepresentativeName(p.representative_name || "");
        setPhone(p.phone || "");
        setPrefecture(p.prefecture || "");
        setIndustry(p.industry || "");
        setEmployees(p.employees != null ? String(p.employees) : "");
      })
      .catch(() => {
        // エラー時はフォーム空のまま
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateProfile({
        company_name: companyName,
        representative_name: representativeName,
        phone,
        prefecture,
        industry,
        employees: employees ? Number(employees) : undefined,
      });
      setProfile(updated);
      setSaveMsg("変更を保存しました");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg(
        err instanceof ApiError ? err.message : "保存に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-[10px] border border-border bg-bg-card px-3.5 py-3 text-[16px] focus:border-primary focus:shadow-[var(--portal-focus-ring)] outline-none transition-colors";
  const selectClass = `${inputClass} appearance-none`;
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-8 w-full max-w-sm" />
        <div className="skeleton h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-in">
      <PageHeader
        title="アカウント設定"
        breadcrumbs={[
          { label: "ダッシュボード", href: "/my" },
          { label: "アカウント設定" },
        ]}
      />

      <TabFilter tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "profile" && (
        <div className="space-y-8 max-w-2xl">
          {/* プロフィール */}
          <section>
            <h2 className="text-lg font-medium text-text mb-4">プロフィール</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className={labelClass}>会社名</label>
                <input
                  type="text"
                  className={inputClass}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>代表者名</label>
                <input
                  type="text"
                  className={inputClass}
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>メールアドレス</label>
                <input
                  type="email"
                  className={`${inputClass} bg-bg-surface text-text2 cursor-not-allowed`}
                  value={profile?.email || ""}
                  disabled
                />
                <p className="text-xs text-text2 mt-1">変更不可</p>
              </div>
              <div>
                <label className={labelClass}>電話番号</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>所在地</label>
                <select
                  className={selectClass}
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((pref) => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>業種</label>
                <select
                  className={selectClass}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>従業員数</label>
                <input
                  type="number"
                  className={inputClass}
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                  min="1"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "保存中..." : "変更を保存"}
                </Button>
                {saveMsg && (
                  <span className={`text-sm ${saveMsg.includes("失敗") ? "text-error" : "text-success"}`}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </form>
          </section>

          {/* パスワード変更 */}
          <section>
            <h2 className="text-lg font-medium text-text mb-4">パスワード変更</h2>
            <PasswordChangeForm />
          </section>

          {/* アカウント削除 */}
          <section>
            <DangerZone />
          </section>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="max-w-2xl">
          <NotificationSettings />
        </div>
      )}
    </div>
  );
}
