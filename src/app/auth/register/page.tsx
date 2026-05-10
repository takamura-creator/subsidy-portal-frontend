"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { register, updateProfile, ApiError } from "@/lib/api";
import { SERVICE_PREFECTURES } from "@/lib/constants";

const WIZARD_KEY = "hc_wizard_state_v2";
function getWizardCompany(): Record<string, string | number> | null {
  try {
    const raw = localStorage.getItem(WIZARD_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as { state?: { company?: Record<string, string | number> } };
    return snap?.state?.company ?? null;
  } catch { return null; }
}

/* ---- Left column: onboarding guide ---- */
function OwnerGuide() {
  return (
    <div>
      <h2
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 16,
        }}
      >
        HOJYO CAME で できること
      </h2>

      <div
        style={{
          marginBottom: 16,
          padding: 14,
          background: "linear-gradient(168deg, color-mix(in srgb, var(--hc-primary) 4%, var(--hc-white)) 0%, var(--hc-bg) 55%, color-mix(in srgb, var(--hc-accent) 6%, var(--hc-bg)) 100%)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--hc-navy)",
            marginBottom: 4,
          }}
        >
          1. 補助金を診断
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "var(--hc-text-muted)",
            lineHeight: 1.5,
            marginBottom: 0,
          }}
        >
          業種・規模・地域から、使える補助金を自動でマッチングします。
        </p>
      </div>

      <div
        style={{
          marginBottom: 16,
          padding: 14,
          background: "linear-gradient(168deg, color-mix(in srgb, var(--hc-primary) 4%, var(--hc-white)) 0%, var(--hc-bg) 55%, color-mix(in srgb, var(--hc-accent) 6%, var(--hc-bg)) 100%)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--hc-navy)",
            marginBottom: 4,
          }}
        >
          2. 見積もりを作成
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "var(--hc-text-muted)",
            lineHeight: 1.5,
            marginBottom: 0,
          }}
        >
          AVTECH製品から構成を選ぶと、工事費込みの見積書PDFを自動生成します。
        </p>
      </div>

      <div
        style={{
          marginBottom: 20,
          padding: 14,
          background: "linear-gradient(168deg, color-mix(in srgb, var(--hc-primary) 4%, var(--hc-white)) 0%, var(--hc-bg) 55%, color-mix(in srgb, var(--hc-accent) 6%, var(--hc-bg)) 100%)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--hc-navy)",
            marginBottom: 4,
          }}
        >
          3. 施工のご相談
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "var(--hc-text-muted)",
            lineHeight: 1.5,
            marginBottom: 0,
          }}
        >
          6都県（東京・神奈川・静岡・埼玉・千葉・山梨）はマルチックが直接施工します。
        </p>
      </div>
    </div>
  );
}

/* ---- Register form (center column) ---- */
function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [prefCode, setPrefCode] = useState("");
  const [representative, setRepresentative] = useState("");   // F5: 代表者名
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await register({
        email,
        password,
        role: "owner",
        company_name: companyName,
        pref_code: prefCode,
        representative,   // F5: 代表者名をAPI送信
      });

      // 登録と同時にトークンを保存 → 再ログイン不要
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);

      // 登録後: ウィザードのデータがあれば自動でプロフィールに反映
      try {
        const wiz = getWizardCompany();
        if (wiz) {
          await updateProfile({
            company_name: companyName || String(wiz.companyName ?? ""),
            pref_code: prefCode || String(wiz.prefecture ?? ""),
            // N7: フォーム入力値を優先し、空の場合のみウィザードデータで補完
            representative: representative || String(wiz.representativeName ?? ""),
          });
        }
      } catch {
        // プロフィール保存失敗は無視（登録自体は成功しているため）
      }

      router.push("/my");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 409
            ? "このメールアドレスは既に登録されています。"
            : err.status === 429
              ? "しばらく時間をおいてから再度お試しください。"
              : err.message,
        );
      } else {
        setError("登録に失敗しました。しばらくしてから再度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div className="form-card">
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--hc-navy)",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            新規登録
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--hc-text-muted)",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            企業ユーザーとしてアカウントを作成します。
          </p>

          {error && (
            <div
              style={{
                color: "var(--hc-error)",
                fontSize: 13,
                background: "color-mix(in srgb, var(--hc-error) 6%, transparent)",
                border: "1px solid color-mix(in srgb, var(--hc-error) 20%, transparent)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">メールアドレス</label>
              <input
                id="email"
                type="email"
                className="form-input"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@example.com"
              />
            </div>

            <div className="field">
              <label htmlFor="password">パスワード</label>
              <input
                id="password"
                type="password"
                className="form-input"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
              />
            </div>

            <div className="field">
              <label htmlFor="company">会社名</label>
              <input
                id="company"
                type="text"
                className="form-input"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="株式会社〇〇"
              />
            </div>

            {/* F5: 代表者名（任意） */}
            <div className="field">
              <label htmlFor="representative">代表者名（任意）</label>
              <input
                id="representative"
                type="text"
                className="form-input"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder="山田 太郎"
                maxLength={100}
              />
            </div>

            <div className="field">
              <label htmlFor="prefecture">都道府県</label>
              <select
                id="prefecture"
                className="form-select"
                required
                value={prefCode}
                onChange={(e) => setPrefCode(e.target.value)}
              >
                <option value="">選択してください</option>
                {SERVICE_PREFECTURES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                marginTop: 16,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "登録中..." : "アカウントを作成"}
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: 14,
                fontSize: 13,
                color: "var(--hc-text-muted)",
              }}
            >
              すでにアカウントをお持ちの方は{" "}
              <Link
                href="/auth/login"
                style={{
                  color: "var(--hc-primary)",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                ログイン
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ThreeColumnLayout
      gridCols="280px 1fr"
      showLeft={true}
      showRight={false}
      left={<OwnerGuide />}
      center={<RegisterForm />}
    />
  );
}
