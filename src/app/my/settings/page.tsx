"use client";

import { useEffect, useState } from "react";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import MySidebar from "@/components/my/MySidebar";
import {
  fetchProfileDetail,
  updateProfile,
  changePassword,
  deleteAccount,
  type UserProfileDetail,
} from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

// --- トグルコンポーネント ---
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
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
      aria-checked={on}
      role="switch"
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
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

// --- 入力フィールド ---
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const SETTING_MENUS = [
  { key: "profile", label: "プロフィール" },
  { key: "notifications", label: "通知設定" },
  { key: "security", label: "セキュリティ" },
];

export default function SettingsPage() {
  const [activeMenu, setActiveMenu] = useState("profile");
  const [profile, setProfile] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // プロフィールフォーム
  const [companyName, setCompanyName] = useState("");
  const [representative, setRepresentative] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prefecture, setPrefecture] = useState("");

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
    fetchProfileDetail()
      .then((p) => {
        setProfile(p);
        setCompanyName(p.company_name || "");
        setRepresentative(p.representative_name || "");
        setEmail(p.email || "");
        setPhone(p.phone || "");
        setPrefecture(p.prefecture || "");
      })
      .catch(() => {
        setCompanyName("株式会社サンプル");
        setRepresentative("山田 太郎");
        setEmail("yamada@sample.co.jp");
        setPhone("03-1234-5678");
        setPrefecture("東京都");
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
        representative_name: representative,
        phone,
        prefecture,
      });
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

  // --- 左パネル ---
  const leftPanel = (
    <div>
      <MySidebar active="/my/settings" />
      <div className="divider" />
      <span className="section-title">設定メニュー</span>
      {SETTING_MENUS.map((m) => (
        <button
          key={m.key}
          onClick={() => setActiveMenu(m.key)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "8px 10px",
            marginBottom: 2,
            borderRadius: 6,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            background: activeMenu === m.key ? "rgba(21,128,61,0.06)" : "transparent",
            color: activeMenu === m.key ? "var(--hc-primary)" : "var(--hc-text-muted)",
            fontWeight: activeMenu === m.key ? 500 : 400,
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );

  // --- 中央コンテンツ ---
  const centerContent = (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)", letterSpacing: "-0.3px", marginBottom: 20 }}>
        アカウント設定
      </h1>

      {/* プロフィール */}
      {activeMenu === "profile" && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 14, marginTop: 0 }}>
            プロフィール
          </h2>
          {loading ? (
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)" }}>読み込み中...</p>
          ) : (
            <form onSubmit={handleSaveProfile}>
              <Field label="会社名">
                <input className="form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Field>
              <Field label="代表者名">
                <input className="form-input" value={representative} onChange={(e) => setRepresentative(e.target.value)} />
              </Field>
              <Field label="メールアドレス">
                <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="電話番号">
                <input className="form-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="都道府県">
                <select className="form-select" value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 24px",
                    background: "var(--hc-primary)",
                    color: "#fff",
                    border: "2px solid var(--hc-primary)",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    transition: "all 0.3s",
                  }}
                >
                  {saving ? "保存中..." : "保存する"}
                </button>
                {saveMsg && (
                  <span style={{ fontSize: 13, color: saveMsg.includes("失敗") ? "var(--hc-error)" : "var(--hc-success)" }}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* 通知設定 */}
      {activeMenu === "notifications" && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 14, marginTop: 0 }}>
            通知設定
          </h2>
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
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--hc-border)" : "none",
                fontSize: 13,
              }}
            >
              <span>{item.label}</span>
              <Toggle on={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      )}

      {/* セキュリティ */}
      {activeMenu === "security" && (
        <>
          <div className="form-card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 14, marginTop: 0 }}>
              パスワード変更
            </h2>
            <form onSubmit={handleChangePassword}>
              <Field label="現在のパスワード">
                <input className="form-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </Field>
              <Field label="新しいパスワード">
                <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
              </Field>
              <Field label="新しいパスワード（確認）">
                <input className="form-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </Field>
              {passwordMsg && (
                <p style={{ fontSize: 13, color: passwordMsg.includes("失敗") || passwordMsg.includes("一致") ? "var(--hc-error)" : "var(--hc-success)", marginBottom: 12 }}>
                  {passwordMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  padding: "10px 24px",
                  background: "var(--hc-primary)",
                  color: "#fff",
                  border: "2px solid var(--hc-primary)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: changingPassword ? "default" : "pointer",
                  opacity: changingPassword ? 0.7 : 1,
                  transition: "all 0.3s",
                }}
              >
                {changingPassword ? "変更中..." : "パスワードを変更"}
              </button>
            </form>
          </div>

          {/* 危険ゾーン */}
          <div className="form-card" style={{ border: "1px solid rgba(220,38,38,0.2)" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--hc-error)", marginBottom: 8, marginTop: 0 }}>
              アカウント削除
            </h2>
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginBottom: 14 }}>
              アカウントを削除すると、すべての申請データが失われます。この操作は取り消せません。
            </p>
            <button
              onClick={handleDeleteAccount}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "var(--hc-error)",
                border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              アカウントを削除する
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <ThreeColumnLayout
      left={leftPanel}
      center={centerContent}
      showRight={false}
      gridCols="200px 1fr"
    />
  );
}
