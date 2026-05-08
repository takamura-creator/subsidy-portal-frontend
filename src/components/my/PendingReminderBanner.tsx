"use client";

import { useEffect, useState } from "react";
import { fetchPendingReminders, type PendingReminder } from "@/lib/api";

/**
 * Sprint 7 Phase D: 締切30日以内リマインダーバナー
 * /my ダッシュボード上部に表示
 */
export default function PendingReminderBanner() {
  const [reminders, setReminders] = useState<PendingReminder[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingReminders()
      .then((data) => {
        // 締切30日以内のみ表示
        const urgent = data.filter((r) => r.days_remaining <= 30);
        setReminders(urgent);
      })
      .catch(() => setReminders([]));
  }, []);

  const visible = reminders.filter((r) => !dismissed.has(r.app_id + r.phase));

  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      {visible.map((r) => {
        const key = r.app_id + r.phase;
        const isUrgent = r.days_remaining <= 7;
        return (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              marginBottom: 6,
              borderRadius: 8,
              border: `1px solid ${isUrgent ? "var(--hc-error)" : "var(--hc-accent)"}`,
              background: isUrgent ? "#fff5f5" : "var(--hc-accent-light)",
              fontSize: 12,
            }}
          >
            <span>
              <span style={{ marginRight: 6 }}>{isUrgent ? "🔴" : "🟡"}</span>
              <strong>{r.subsidy_name}</strong>
              {" — "}
              {r.phase} の締切まで
              <strong style={{ marginLeft: 4 }}>{r.days_remaining}日</strong>
              （{r.deadline}）
            </span>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(key))}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--hc-text-muted)",
                fontSize: 14,
                lineHeight: 1,
                padding: "0 4px",
              }}
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
