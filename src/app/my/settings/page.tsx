"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchProfileDetail,
  updateProfile,
  changePassword,
  deleteAccount,
  type UserProfileDetail,
} from "@/lib/api";
import { getUser } from "@/lib/auth";
import { SERVICE_PREFECTURES } from "@/lib/constants";

const WIZARD_KEY = "hc_wizard_state_v2";
function loadWizardCompany(): Record<string, string | number> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WIZARD_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as { state?: { company?: Record<string, string | number> } };
    return snap?.state?.company ?? null;
  } catch {
    return null;
  }
}

type MenuKey = "profile" | "notifications" | "security";

function isMenuKey(v: string | null | undefined): v is MenuKey {
  return v === "profile" || v === "notifications" || v === "security";
}

/* ─────────────────────────────────────────────
 *  STYLE_GUIDE 準拠の共通スタイル
 * ───────────────────────────────────────────── */

const S = {
  pageTitle: {
    fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--hc-navy)",
    letterSpacing: "-0.3px",
    margin: "0 0 16px",
  } as React.CSSProperties,
  card: {
    background:
      "var(--hc-card-bg)",
    border: "1px solid color-mix(in srgb, var(--hc-primary) 10%, var(--hc-border))",
    borderBottomColor: "color-mix(in srgb, var(--hc-primary) 18%, var(--hc-border))",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    boxShadow: "var(--hc-shadow)",
  } as React.CSSProperties,
  cardTitle: {
    fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--hc-navy)",
    letterSpacing: "-0.3px",
    margin: "0 0 12px",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--hc-navy)",
    margin: "0 0 6px",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid var(--hc-border)",
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "inherit",
    background: "var(--hc-card-bg)",
    color: "var(--hc-text)",
  } as React.CSSProperties,
  primaryBtn: {
    fontSize: 14,
    fontWeight: 600,
    padding: "12px 24px",
    border: "2px solid var(--hc-primary)",
    background: "var(--hc-primary)",
    color: "var(--hc-white)",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  } as React.CSSProperties,
  dangerBtn: {
    fontSize: 13,
    fontWeight: 600,
    padding: "10px 20px",
    border: "1px solid var(--hc-error-border)",
    background: "transparent",
    color: "var(--hc-error)",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  } as React.CSSProperties,
  fieldHint: {
    fontSize: 11,
    color: "var(--hc-text-muted)",
    margin: "4px 0 0",
    lineHeight: 1.5,
  } as React.CSSProperties,
} as const;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-checked={on}
      role="switch"
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: on ? "var(--hc-primary)" : "var(--hc-border)",
        position: "relative",
        cursor: "pointer",
        border: "none",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--hc-card-bg)",
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          transition: "left 0.2s",
          display: "block",
        }}
      />
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      {children}
      {hint && <p style={S.fieldHint}>{hint}</p>}
    </div>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeMenu: MenuKey = isMenuKey(tabParam) ? tabParam : "profile";
  const [, setProfile] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);

  // プロフィールフォーム
  const [companyName, setCompanyName] = useState("");
  const [representative, setRepresentative] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // 通知設定
  const [notifNewSubsidy, setNotifNewSubsidy] = useState(true);
  const [notifDeadline, setNotifDeadline] = useState(true);
  const [notifQuotation, setNotifQuotation] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const jwtUser = getUser();
    const wiz = loadWizardCompany();
    const jwtCompany = jwtUser?.company_name ?? "";
    const wizCompany = String(wiz?.companyName ?? "");
    const wizRep = String(wiz?.representativeName ?? "");
    const wizPref = String(wiz?.prefecture ?? "");
    const wizUrl = String(wiz?.websiteUrl ?? "");

    fetchProfileDetail()
      .then((p) => {
        setProfile(p);
        const apiCompany = p.company_name || "";
        const apiRep = p.representative || "";
        const apiEmail = p.email || "";
        const apiPhone = p.phone || "";
        const apiPref = p.pref_code || "";
        const apiUrl = p.website_url || "";

        setCompanyName(apiCompany || wizCompany || jwtCompany);
        setEmail(apiEmail || jwtUser?.email || "");
        setPhone(apiPhone);
        setPrefecture(apiPref || wizPref);
        setWebsiteUrl(apiUrl || wizUrl);

        if (apiRep) {
          setRepresentative(apiRep);
        } else if (wizRep) {
          setRepresentative(wizRep);
          setAutoFilled(true);
        }
      })
      .catch(() => {
        setCompanyName(wizCompany || jwtCompany);
        setRepresentative(wizRep);
        setEmail(jwtUser?.email || "");
        setPrefecture(wizPref);
        setWebsiteUrl(wizUrl);
        if (wizRep || wizCompany || wizUrl) setAutoFilled(true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      await updateProfile({
        company_name: companyName,
        representative,
        phone,
        pref_code: prefecture,
        website_url: websiteUrl,
      });
      setAutoFilled(false);
      setSaveMsg("保存しました");
    } catch {
      setSaveMsg("保存に失敗しました");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg("新しいパスワードが一致しません");
      return;
    }
    setChangingPassword(true);
    setPasswordMsg("");
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordMsg("パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMsg("パスワードの変更に失敗しました。現在のパスワードを確認してください。");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    const pw = prompt("アカウントを削除します。パスワードを入力してください:");
    if (!pw) return;
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) return;
    try {
      await deleteAccount(pw);
      window.location.href = "/";
    } catch {
      alert("削除に失敗しました。パスワードを確認してください。");
    }
  }

  // メニュー切替はサイドバーのサブメニュー（?tab=...）が担うため、設定ページ内の左パネルは廃止
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={S.pageTitle}>アカウント設定</h1>

      {activeMenu === "profile" && (
        <section style={S.card}>
          <h2 style={S.cardTitle}>プロフィール</h2>
          {loading ? (
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0 }}>読み込み中...</p>
          ) : (
            <form onSubmit={handleSaveProfile}>
              {autoFilled && (
                <div
                  style={{
                    marginBottom: 14,
                    padding: "10px 14px",
                    background: "var(--hc-primary-faint)",
                    border: "1px solid var(--hc-primary-edge)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--hc-navy)",
                    lineHeight: 1.6,
                  }}
                >
                  ウィザードで入力した情報を自動補完しました。内容を確認して「保存する」を押してください。
                </div>
              )}
              <Field label="会社名">
                <input
                  style={S.input}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Field>
              <Field label="代表者名">
                <input
                  style={S.input}
                  value={representative}
                  onChange={(e) => setRepresentative(e.target.value)}
                />
              </Field>
              <Field label="メールアドレス">
                <input
                  style={S.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="電話番号">
                <input
                  style={S.input}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label="都道府県">
                <select
                  style={S.input}
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {SERVICE_PREFECTURES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="ホームページURL（任意）"
                hint="保存しておくと、申請ウィザードで自動入力されます。"
              >
                <input
                  style={S.input}
                  type="url"
                  placeholder="https://example.co.jp"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </Field>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...S.primaryBtn,
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "保存中..." : "保存する"}
                </button>
                {saveMsg && (
                  <span
                    style={{
                      fontSize: 13,
                      color: saveMsg.includes("失敗")
                        ? "var(--hc-error)"
                        : "var(--hc-success)",
                    }}
                  >
                    {saveMsg}
                  </span>
                )}
              </div>
            </form>
          )}
        </section>
      )}

      {activeMenu === "notifications" && (
        <section style={S.card}>
          <h2 style={S.cardTitle}>通知設定</h2>
          {[
            { label: "新着補助金の通知", value: notifNewSubsidy, onChange: setNotifNewSubsidy },
            { label: "締切アラート", value: notifDeadline, onChange: setNotifDeadline },
            { label: "業者からの見積もり回答", value: notifQuotation, onChange: setNotifQuotation },
            { label: "マーケティングメール", value: notifMarketing, onChange: setNotifMarketing },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--hc-border)" : "none",
                fontSize: 14,
                color: "var(--hc-text)",
              }}
            >
              <span>{item.label}</span>
              <Toggle on={item.value} onChange={item.onChange} />
            </div>
          ))}
        </section>
      )}

      {activeMenu === "security" && (
        <>
          <section style={S.card}>
            <h2 style={S.cardTitle}>パスワード変更</h2>
            <form onSubmit={handleChangePassword}>
              <Field label="現在のパスワード">
                <input
                  style={S.input}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Field>
              <Field label="新しいパスワード" hint="8文字以上で設定してください">
                <input
                  style={S.input}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="新しいパスワード（確認）">
                <input
                  style={S.input}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Field>
              {passwordMsg && (
                <p
                  style={{
                    fontSize: 13,
                    color:
                      passwordMsg.includes("失敗") || passwordMsg.includes("一致")
                        ? "var(--hc-error)"
                        : "var(--hc-success)",
                    margin: "0 0 12px",
                  }}
                >
                  {passwordMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  ...S.primaryBtn,
                  cursor: changingPassword ? "default" : "pointer",
                  opacity: changingPassword ? 0.7 : 1,
                }}
              >
                {changingPassword ? "変更中..." : "パスワードを変更"}
              </button>
            </form>
          </section>

          <section
            style={{
              ...S.card,
              border: "1px solid var(--hc-error-line)",
            }}
          >
            <h2 style={{ ...S.cardTitle, color: "var(--hc-error)" }}>アカウント削除</h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--hc-text-muted)",
                margin: "0 0 14px",
                lineHeight: 1.6,
              }}
            >
              アカウントを削除すると、すべての申請データが失われます。この操作は取り消せません。
            </p>
            <button type="button" onClick={handleDeleteAccount} style={S.dangerBtn}>
              アカウントを削除する
            </button>
          </section>
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <SettingsContent />
    </Suspense>
  );
}
