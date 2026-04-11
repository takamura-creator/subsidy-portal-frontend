"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import { changePassword, ApiError } from "@/lib/api";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("新しいパスワードは8文字以上で入力してください");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("新しいパスワードと確認が一致しません");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "パスワード変更に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-[10px] border border-border bg-bg-card px-3.5 py-3 text-[16px] focus:border-primary focus:shadow-[var(--portal-focus-ring)] outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>現在のパスワード</label>
        <input
          type="password"
          className={inputClass}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <label className={labelClass}>新しいパスワード</label>
        <input
          type="password"
          className={inputClass}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-text2 mt-1">8文字以上</p>
      </div>
      <div>
        <label className={labelClass}>新しいパスワード（確認）</label>
        <input
          type="password"
          className={inputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "変更中..." : "パスワードを変更"}
      </Button>
    </form>
  );
}
