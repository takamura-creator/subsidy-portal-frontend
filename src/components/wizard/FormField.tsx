/**
 * ウィザード共通のフォーム部品（Step1Company.tsx から切り出し・1ファイル500行規約）。
 * 見た目・DOM 構造は移設前と同一。
 */
"use client";

export function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] text-text-muted mb-1">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[12px] text-error">{error}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="22 10" />
    </svg>
  );
}
