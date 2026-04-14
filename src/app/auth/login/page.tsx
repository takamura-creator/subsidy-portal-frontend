"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { login, ApiError } from "@/lib/api";

function decodeJwtRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);

      const role = decodeJwtRole(res.access_token);
      router.push(role === "contractor" ? "/biz" : "/my");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "メールアドレスまたはパスワードが正しくありません。"
            : err.status === 429
              ? "しばらく時間をおいてから再度お試しください。"
              : err.message
        );
      } else {
        setError("ログインに失敗しました。しばらくしてから再度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-full py-12">
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div className="card" style={{ padding: 32 }}>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--hc-navy)",
              letterSpacing: "-0.5px",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            ログイン
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--hc-text-muted)",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            アカウントにログインして申請を管理しましょう。
          </p>

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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--hc-navy)",
                  marginBottom: 4,
                }}
              >
                メールアドレス
              </label>
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

            <div style={{ marginBottom: 8 }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--hc-navy)",
                  marginBottom: 4,
                }}
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
              />
              <div style={{ textAlign: "right", marginTop: 4 }}>
                <Link
                  href="/auth/forgot-password"
                  style={{ fontSize: 12, color: "var(--hc-primary)", textDecoration: "none" }}
                >
                  パスワードを忘れた方
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                display: "block",
                width: "100%",
                marginTop: 20,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 16,
              fontSize: 13,
              color: "var(--hc-text-muted)",
            }}
          >
            アカウントをお持ちでない方は{" "}
            <Link
              href="/auth/register"
              style={{ color: "var(--hc-primary)", fontWeight: 500, textDecoration: "none" }}
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThreeColumnLayout
      showLeft={false}
      showRight={false}
      center={<LoginForm />}
    />
  );
}
