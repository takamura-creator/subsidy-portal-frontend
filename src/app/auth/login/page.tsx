"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, ApiError } from "@/lib/api";

export default function LoginPage() {
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
      router.push("/my");
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
    <div className="max-w-[480px] mx-auto px-4 md:px-6 py-16">
      {/* サイト名 */}
      <div className="text-center mb-10">
        <Link href="/" className="text-xl font-medium text-primary">
          補助金ポータル
        </Link>
        <h1 className="text-2xl font-medium text-text mt-4 mb-2">ログイン</h1>
        <p className="text-sm text-text2">
          アカウントにログインして、補助金申請を管理しましょう。
        </p>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error mb-6">
          {error}
        </div>
      )}

      {/* ログインフォーム */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@example.com"
            className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn-primary w-full py-3 ${loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      {/* 登録リンク */}
      <p className="text-center text-sm text-text2 mt-8">
        アカウントをお持ちでない方は{" "}
        <Link href="/auth/register" className="text-primary hover:underline font-medium">
          新規登録
        </Link>
      </p>
    </div>
  );
}
