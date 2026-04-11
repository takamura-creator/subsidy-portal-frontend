"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import { deleteAccount, ApiError } from "@/lib/api";

export default function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFirstConfirm() {
    setShowConfirm(false);
    setShowPasswordInput(true);
    setPassword("");
    setError("");
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError("パスワードを入力してください");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await deleteAccount(password);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/auth/login";
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "アカウント削除に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[10px] border border-error/30 bg-error/5 p-4">
      <h3 className="font-medium text-error mb-2">アカウント削除</h3>
      <p className="text-sm text-text2 mb-4">
        この操作は取り消せません。すべてのデータが削除されます。
      </p>

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="rounded-[10px] border border-error bg-bg-card px-4 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10"
      >
        アカウントを削除する
      </button>

      {/* 一段階目：確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-bg-card rounded-[10px] p-6 max-w-md w-full mx-4 shadow-[var(--portal-shadow-md)]">
            <h3 className="text-lg font-medium text-text mb-3">本当に削除しますか？</h3>
            <p className="text-sm text-text2 mb-6">
              アカウントを削除すると、すべてのデータが失われます。この操作は取り消せません。
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                キャンセル
              </Button>
              <button
                type="button"
                onClick={handleFirstConfirm}
                className="rounded-[10px] bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error/90"
              >
                削除を続ける
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 二段階目：パスワード入力 */}
      {showPasswordInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-bg-card rounded-[10px] p-6 max-w-md w-full mx-4 shadow-[var(--portal-shadow-md)]">
            <h3 className="text-lg font-medium text-text mb-3">パスワードを入力</h3>
            <p className="text-sm text-text2 mb-4">
              確認のため、パスワードを入力してください。
            </p>
            <form onSubmit={handleDelete}>
              <input
                type="password"
                className="w-full rounded-[10px] border border-border bg-bg-card px-3.5 py-3 text-[16px] focus:border-primary focus:shadow-[var(--portal-focus-ring)] outline-none transition-colors mb-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                placeholder="パスワード"
              />
              {error && <p className="text-sm text-error mb-3">{error}</p>}
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowPasswordInput(false);
                    setPassword("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  キャンセル
                </Button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-[10px] bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error/90 disabled:opacity-50"
                >
                  {loading ? "削除中..." : "アカウントを削除"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
