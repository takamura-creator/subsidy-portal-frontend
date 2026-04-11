"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import TabFilter from "@/components/shared/TabFilter";
import Button from "@/components/shared/Button";
import PasswordChangeForm from "@/components/settings/PasswordChangeForm";
import NotificationSettings from "@/components/settings/NotificationSettings";
import type { NotificationItem } from "@/components/settings/NotificationSettings";
import DangerZone from "@/components/settings/DangerZone";
import { fetchProfileDetail, updateProfile, type UserProfileDetail, ApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

const TABS = [
  { key: "account", label: "アカウント" },
  { key: "notifications", label: "通知設定" },
];

const BIZ_NOTIFICATION_ITEMS: NotificationItem[] = [
  { key: "new_project", label: "新着案件の通知", defaultOn: true },
  { key: "matching", label: "マッチング成立", defaultOn: true },
  { key: "message", label: "企業からのメッセージ", defaultOn: true },
  { key: "monthly_report", label: "月次レポート", defaultOn: false },
];

export default function BizSettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // フォーム状態
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!requireAuth(["contractor", "admin"], "/biz/settings")) return;

    fetchProfileDetail()
      .then((p) => {
        setProfile(p);
        setPhone(p.phone || "");
      })
      .catch(() => {
        // エラー時はフォーム空のまま
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateProfile({ phone });
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
          { label: "ダッシュボード", href: "/biz" },
          { label: "アカウント設定" },
        ]}
      />

      <TabFilter tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "account" && (
        <div className="space-y-8 max-w-2xl">
          {/* ログイン情報 */}
          <section>
            <h2 className="text-lg font-medium text-text mb-4">ログイン情報</h2>
            <form onSubmit={handleSaveAccount} className="space-y-4">
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
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "保存中..." : "変更を保存"}
                </Button>
                {saveMsg && (
                  <span
                    className={`text-sm ${saveMsg.includes("失敗") ? "text-error" : "text-success"}`}
                  >
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
          <NotificationSettings
            items={BIZ_NOTIFICATION_ITEMS}
            storageKey="biz_notification_settings"
          />
        </div>
      )}
    </div>
  );
}
