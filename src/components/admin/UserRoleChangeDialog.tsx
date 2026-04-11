"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import { updateUserRole, ApiError } from "@/lib/api";
import { X } from "lucide-react";

const ROLES = [
  { value: "owner" as const, label: "企業（owner）" },
  { value: "contractor" as const, label: "業者（contractor）" },
  { value: "admin" as const, label: "管理者（admin）" },
];

interface UserRoleChangeDialogProps {
  userId: string;
  email: string;
  currentRole: "owner" | "contractor" | "admin";
  onClose: () => void;
  onChanged: () => void;
}

export default function UserRoleChangeDialog({
  userId,
  email,
  currentRole,
  onClose,
  onChanged,
}: UserRoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit() {
    if (selectedRole === currentRole) {
      onClose();
      return;
    }
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await updateUserRole(userId, selectedRole);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ロール変更に失敗しました");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-bg-card rounded-[10px] p-6 max-w-md w-full mx-4 shadow-[var(--portal-shadow-md)]">
          <h3 className="text-lg font-medium text-text mb-3">ロールを変更しますか？</h3>
          <p className="text-sm text-text2 mb-4">
            <span className="font-medium text-text">{email}</span> のロールを
            <span className="font-medium text-text"> {ROLES.find((r) => r.value === currentRole)?.label}</span>
            {" → "}
            <span className="font-medium text-primary">{ROLES.find((r) => r.value === selectedRole)?.label}</span>
            {" "}に変更します。
          </p>
          {error && <p className="text-sm text-error mb-3">{error}</p>}
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)} disabled={loading}>
              キャンセル
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={loading}>
              {loading ? "変更中..." : "変更する"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg-card rounded-[10px] p-6 max-w-md w-full mx-4 shadow-[var(--portal-shadow-md)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-text">ロール変更</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-bg-surface flex items-center justify-center transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-text2" />
          </button>
        </div>

        <p className="text-sm text-text2 mb-4">{email}</p>

        <div className="space-y-2 mb-6">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className={`flex items-center gap-3 p-3 rounded-[10px] border cursor-pointer transition-colors ${
                selectedRole === role.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-bg-surface"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={() => setSelectedRole(role.value)}
                className="accent-[var(--portal-primary)]"
              />
              <span className="text-sm text-text">
                {role.label}
                {role.value === currentRole && (
                  <span className="text-text2 ml-1">（現在）</span>
                )}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            キャンセル
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            変更
          </Button>
        </div>
      </div>
    </div>
  );
}
