"use client";

/**
 * 締切タイムラインコンポーネント。
 * 日付解釈可能な制度を時系列昇順で表示する縦線レイアウト。
 * 日付不明は別リスト。0件時はフォールバック文言を表示。
 */

import { getDaysUntil } from "@/lib/deadlineUtils";
import type { MatchedSubsidy } from "@/lib/api";

interface Props {
  matches: MatchedSubsidy[];
}

interface ParsedDeadline {
  id: string;
  name: string;
  deadline: string;
  days: number;
  matchScore: string;
}

/** deadlineから最小残日数を返す（過去は負値、不明はnull） */
function extractDays(deadline: string): number | null {
  return getDaysUntil(deadline);
}

export default function DeadlineTimeline({ matches }: Props) {
  const parseable: ParsedDeadline[] = [];
  const unparseable: { name: string; deadline: string }[] = [];

  for (const m of matches) {
    const d = m.subsidy.deadline;
    if (!d) continue;
    const days = extractDays(d);
    if (days !== null) {
      parseable.push({ id: m.subsidy.id ?? m.subsidy.name, name: m.subsidy.name, deadline: d, days, matchScore: m.match_score });
    } else {
      unparseable.push({ name: m.subsidy.name, deadline: d });
    }
  }

  // 残日数昇順（締切が近い順）
  parseable.sort((a, b) => a.days - b.days);

  if (parseable.length === 0 && unparseable.length === 0) {
    return (
      <div
        style={{
          padding: "16px",
          background: "var(--hc-card-bg)",
          border: "1px solid var(--hc-border)",
          borderRadius: 10,
          fontSize: 13,
          color: "var(--hc-text-muted)",
        }}
      >
        締切は各制度ページでご確認ください
      </div>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 14,
        }}
      >
        締切タイムライン
      </h2>

      {/* 日付解釈可能な制度 */}
      {parseable.length > 0 && (
        <div style={{ position: "relative", paddingLeft: 20 }}>
          {/* 縦線 */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 7,
              top: 8,
              bottom: 8,
              width: 2,
              background: "var(--hc-border)",
            }}
          />
          {parseable.map((item) => {
            const isPast = item.days <= 0;
            const isUrgent = item.days > 0 && item.days <= 31;
            const dotColor = isPast
              ? "var(--hc-text-muted)"
              : isUrgent
                ? "var(--hc-accent)"
                : "var(--hc-primary)";

            return (
              <div
                key={item.id}
                style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}
              >
                {/* ドット */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: dotColor,
                    flexShrink: 0,
                    marginTop: 2,
                    zIndex: 1,
                    position: "relative",
                    boxShadow: "0 0 0 3px var(--hc-card-bg)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--hc-navy)",
                      marginBottom: 2,
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: dotColor,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {isPast ? "締切済みの可能性" : `あと ${item.days} 日`}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>
                      {item.deadline}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 日付不明な制度 */}
      {unparseable.length > 0 && (
        <div style={{ marginTop: parseable.length > 0 ? 12 : 0 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--hc-text-muted)",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            締切日が特定できない制度
          </div>
          {unparseable.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                fontSize: 11,
                color: "var(--hc-text-muted)",
                padding: "4px 0",
                borderBottom: "1px solid var(--hc-border)",
              }}
            >
              <span style={{ fontWeight: 500, color: "var(--hc-navy)", flex: 1 }}>{item.name}</span>
              <span style={{ flexShrink: 0 }}>締切: {item.deadline || "未定"}</span>
            </div>
          ))}
        </div>
      )}

      {parseable.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: "var(--hc-text-muted)",
            marginTop: 8,
          }}
        >
          締切は各制度ページでご確認ください
        </div>
      )}
    </div>
  );
}
