"use client";

interface Props {
  onRegister: () => void;
  onLogin: () => void;
  onSkip: () => void;
}

/**
 * U-1: 未ログインユーザーが Step 2 完了後に表示するソフトウォール。
 * 登録/ログインを促しつつ、スキップも許可する。
 */
export default function SoftWallModal({ onRegister, onLogin, onSkip }: Props) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onSkip}
    >
      <div
        className="bg-white rounded-[10px] p-6 max-w-[420px] w-full shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-[16px] font-bold text-navy mb-2"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          進捗を保存しませんか？
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed mb-5">
          アカウントを作成またはログインすると、ここまでの入力内容が自動保存され、
          いつでも途中から再開できます。
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onRegister}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-[8px] bg-primary text-white font-semibold text-[13px] hover:bg-[var(--hc-primary-hover)] transition"
          >
            登録して保存
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-primary text-primary font-semibold text-[13px] hover:bg-[var(--hc-primary-subtle)] transition"
          >
            ログインして保存
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-border bg-white text-text-muted font-medium text-[13px] hover:border-primary transition"
          >
            登録せずに続ける
          </button>
        </div>
      </div>
    </div>
  );
}
