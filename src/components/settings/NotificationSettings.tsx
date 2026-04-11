"use client";

import { useState } from "react";

export interface NotificationItem {
  key: string;
  label: string;
  defaultOn: boolean;
}

const DEFAULT_ITEMS: NotificationItem[] = [
  { key: "status_change", label: "申請ステータス変更", defaultOn: true },
  { key: "deadline_reminder", label: "補助金締切リマインダー", defaultOn: true },
  { key: "recommended", label: "おすすめ補助金の通知", defaultOn: true },
  { key: "matching_contractor", label: "マッチング業者からの連絡", defaultOn: false },
];

interface NotificationSettingsProps {
  items?: NotificationItem[];
  storageKey?: string;
}

export default function NotificationSettings({
  items = DEFAULT_ITEMS,
  storageKey = "notification_settings",
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") {
      return Object.fromEntries(items.map((item) => [item.key, item.defaultOn]));
    }
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return Object.fromEntries(items.map((item) => [item.key, item.defaultOn]));
  });

  const [saved, setSaved] = useState(false);

  function toggle(key: string) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-text">メール通知</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <span className="text-sm text-text">{item.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings[item.key] ?? false}
              onClick={() => toggle(item.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                settings[item.key] ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg shadow-[var(--portal-shadow)] transition-transform ${
                  settings[item.key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-[10px] bg-primary px-5 py-3 text-[15px] font-medium text-white transition-all hover:bg-primary/90"
        >
          変更を保存
        </button>
        {saved && (
          <span className="text-sm text-success">保存しました（近日バックエンド実装予定）</span>
        )}
      </div>
    </div>
  );
}
