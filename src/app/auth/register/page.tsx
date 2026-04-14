"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { register, ApiError } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

type Role = "owner" | "contractor";

const ROLES: { value: Role; label: string; desc: string; icon: string }[] = [
  {
    value: "owner",
    label: "企業ユーザー",
    desc: "補助金を活用して導入",
    icon: "🏢",
  },
  {
    value: "contractor",
    label: "工事業者",
    desc: "案件を受注",
    icon: "🔧",
  },
];

/* ---- Left column: role guide cards ---- */
function RoleGuide() {
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
        登録タイプの選び方
      </h2>

      <div
        style={{
          marginBottom: 20,
          padding: 14,
          background: "var(--hc-white)",
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
          🏢 企業ユーザー
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "var(--hc-text-muted)",
            lineHeight: 1.5,
            marginBottom: 0,
          }}
        >
          補助金を活用して防犯カメラを導入したい中小企業の方。補助金診断・申請書作成・業者マッチングを利用できます。
        </p>
      </div>

      <div
        style={{
          marginBottom: 20,
          padding: 14,
          background: "var(--hc-white)",
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
          🔧 工事業者
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "var(--hc-text-muted)",
            lineHeight: 1.5,
            marginBottom: 0,
          }}
        >
          補助金活用の導入・工事を請け負う設置業者の方。案件マッチング・見積もり対応を利用できます。
        </p>
      </div>
    </div>
  );
}

/* ---- Step indicator ---- */
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 20,
      }}
    >
      <div className={`step-dot${step >= 1 ? " active" : ""}`}>1</div>
      <div
        style={{
          width: 24,
          height: 2,
          background: "var(--hc-border)",
          margin: "0 4px",
        }}
      />
      <div className={`step-dot${step >= 2 ? " active" : ""}`}>2</div>
    </div>
  );
}

/* ---- Register form (center column) ---- */
function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [prefCode, setPrefCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRoleSelect(r: Role) {
    setRole(r);
  }

  function handleNext() {
    setError("");
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        email,
        password,
        role,
        company_name: companyName,
        pref_code: prefCode,
      });
      router.push(role === "contractor" ? "/biz" : "/my");
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
            登録タイプを選択してアカウントを作成します。
          </p>

          <StepIndicator step={step} />

          {error && (
            <div
              style={{
                color: "var(--hc-error)",
                fontSize: 13,
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleRoleSelect(r.value)}
                    style={{
                      padding: 16,
                      border: `2px solid ${role === r.value ? "var(--hc-primary)" : "var(--hc-border)"}`,
                      borderRadius: 8,
                      textAlign: "center",
                      cursor: "pointer",
                      background:
                        role === r.value
                          ? "rgba(21,128,61,0.04)"
                          : "var(--hc-white)",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>
                      {r.icon}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--hc-navy)",
                      }}
                    >
                      {r.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--hc-text-muted)",
                        marginTop: 4,
                      }}
                    >
                      {r.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div className="field">
                <label htmlFor="email-s1">メールアドレス</label>
                <input
                  id="email-s1"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mail@example.com"
                />
              </div>

              <div className="field">
                <label htmlFor="password-s1">パスワード</label>
                <input
                  id="password-s1"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8文字以上"
                />
              </div>

              <div className="field">
                <label htmlFor="company-s1">会社名</label>
                <input
                  id="company-s1"
                  type="text"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="株式会社〇〇"
                />
              </div>

              <div className="field">
                <label htmlFor="prefecture-s1">都道府県</label>
                <select
                  id="prefecture-s1"
                  className="form-select"
                  value={prefCode}
                  onChange={(e) => setPrefCode(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                style={{ marginTop: 16 }}
              >
                アカウントを作成
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
            </div>
          )}

          {/* Step 2: Confirmation & submit */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              {/* Selected role badge + change button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid var(--hc-border)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 14,
                  background: "var(--hc-white)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                  }}
                >
                  <span>{ROLES.find((r) => r.value === role)?.icon}</span>
                  <span
                    style={{ fontWeight: 600, color: "var(--hc-navy)" }}
                  >
                    {ROLES.find((r) => r.value === role)?.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    fontSize: 12,
                    color: "var(--hc-primary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  変更
                </button>
              </div>

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
                <label htmlFor="company">
                  {role === "owner" ? "会社名" : "屋号・事業者名"}
                </label>
                <input
                  id="company"
                  type="text"
                  className="form-input"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={
                    role === "owner" ? "株式会社〇〇" : "〇〇設備工業"
                  }
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
                  {PREFECTURES.map((p) => (
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
          )}
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
      left={<RoleGuide />}
      center={<RegisterForm />}
    />
  );
}
