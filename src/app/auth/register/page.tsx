"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, ApiError } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

type Role = "owner" | "contractor";

const ROLES: { value: Role; label: string; desc: string; icon: string }[] = [
  {
    value: "owner",
    label: "企業ユーザー",
    desc: "補助金を活用して防犯カメラを導入したい中小企業の方",
    icon: "🏢",
  },
  {
    value: "contractor",
    label: "工事業者",
    desc: "補助金活用の導入・工事を請け負う設置業者の方",
    icon: "🔧",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [prefCode, setPrefCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRoleSelect(r: Role) {
    setRole(r);
    setStep(2);
    setError("");
  }

  function handleBack() {
    setStep(1);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
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
      router.push("/auth/login?registered=1");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 409
            ? "このメールアドレスは既に登録されています。"
            : err.status === 429
              ? "しばらく時間をおいてから再度お試しください。"
              : err.message
        );
      } else {
        setError("登録に失敗しました。しばらくしてから再度お試しください。");
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
        <h1 className="text-2xl font-medium text-text mt-4 mb-2">新規登録</h1>
        <p className="text-sm text-text2">
          {step === 1
            ? "ご利用の目的に合わせて登録タイプを選択してください。"
            : "基本情報を入力してアカウントを作成します。"}
        </p>
      </div>

      {/* ステップインジケーター */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= 1 ? "text-primary" : "text-text2"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${step >= 1 ? "bg-primary" : "bg-border"}`}>1</span>
          タイプ選択
        </div>
        <div className="w-8 h-px bg-border" />
        <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= 2 ? "text-primary" : "text-text2"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${step >= 2 ? "bg-primary" : "bg-border"}`}>2</span>
          基本情報
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error mb-6">
          {error}
        </div>
      )}

      {/* Step 1: ロール選択 */}
      {step === 1 && (
        <div className="space-y-4">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => handleRoleSelect(r.value)}
              className={`w-full text-left rounded-[10px] border-[1.5px] p-5 transition-all ${
                role === r.value
                  ? "border-primary bg-primary/5 shadow-[var(--portal-shadow-md)]"
                  : "border-border bg-bg-card shadow-[var(--portal-shadow)] hover:border-primary/40 hover:shadow-[var(--portal-shadow-md)] hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl" role="img" aria-hidden="true">{r.icon}</span>
                <div>
                  <div className="font-medium text-text mb-1">{r.label}</div>
                  <div className="text-sm text-text2 leading-relaxed">{r.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: 基本情報入力 */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 選択されたロール表示 + 戻るボタン */}
          <div className="flex items-center justify-between rounded-[10px] border border-border bg-bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span role="img" aria-hidden="true">
                {ROLES.find((r) => r.value === role)?.icon}
              </span>
              <span className="font-medium text-text">
                {ROLES.find((r) => r.value === role)?.label}
              </span>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-xs text-primary hover:underline"
            >
              変更
            </button>
          </div>

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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-text mb-1.5">
              {role === "owner" ? "会社名" : "屋号・事業者名"}
            </label>
            <input
              id="company"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={role === "owner" ? "株式会社〇〇" : "〇〇設備工業"}
              className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="prefecture" className="block text-sm font-medium text-text mb-1.5">
              都道府県
            </label>
            <select
              id="prefecture"
              required
              value={prefCode}
              onChange={(e) => setPrefCode(e.target.value)}
              className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors"
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full py-3 ${loading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {loading ? "登録中..." : "アカウントを作成"}
          </button>
        </form>
      )}

      {/* ログインリンク */}
      <p className="text-center text-sm text-text2 mt-8">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          ログイン
        </Link>
      </p>
    </div>
  );
}
