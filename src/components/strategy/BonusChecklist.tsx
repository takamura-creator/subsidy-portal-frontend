"use client";

import type { BonusItem } from "@/lib/api";

interface Props {
  items: BonusItem[];
}

const DIFFICULTY_STYLES: Record<string, React.CSSProperties> = {
  低: { background: "var(--hc-primary-soft)", color: "var(--hc-success)", border: "1px solid var(--hc-success)" },
  中: { background: "var(--hc-accent-subtle)", color: "var(--hc-accent)", border: "1px solid var(--hc-accent)" },
  高: { background: "var(--hc-error-subtle)", color: "var(--hc-error)", border: "1px solid var(--hc-error)" },
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const style = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES["中"];
  return (
    <span
      style={{
        ...style,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 6px",
        borderRadius: 4,
        whiteSpace: "nowrap",
      }}
    >
      難易度：{difficulty}
    </span>
  );
}

export default function BonusChecklist({ items }: Props) {
  const sorted = [...items].sort((a, b) => {
    const order: Record<string, number> = { 最優先: 0, 高: 1, 中: 2, 低: 3 };
    return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--hc-navy)",
            margin: 0,
          }}
        >
          加点チェックリスト
        </h2>
        <span
          style={{
            fontSize: 11,
            color: "var(--hc-text-muted)",
          }}
        >
          {items.length}項目
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((item) => {
          const isHighPriority = item.priority === "最優先" || item.priority === "高";
          return (
            <div
              key={item.id}
              style={{
                background: isHighPriority ? "var(--hc-primary-soft)" : "var(--hc-white)",
                border: isHighPriority
                  ? "1px solid var(--hc-primary-border)"
                  : "1px solid var(--hc-border)",
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {isHighPriority && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--hc-white)",
                        background: item.priority === "最優先" ? "var(--hc-success)" : "var(--hc-primary)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.priority}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--hc-navy)",
                    }}
                  >
                    {item.name}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <DifficultyBadge difficulty={item.difficulty} />
                  {item.warnings.length > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--hc-accent)",
                        background: "var(--hc-accent-subtle)",
                        border: "1px solid var(--hc-accent-border)",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      注意
                    </span>
                  )}
                </div>
              </div>

              {/* Strategic value */}
              <p
                style={{
                  fontSize: 12,
                  color: "var(--hc-text-muted)",
                  margin: "0 0 6px",
                  lineHeight: 1.5,
                }}
              >
                {item.strategic_value}
              </p>

              {/* Footer row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 11,
                  color: "var(--hc-text-muted)",
                }}
              >
                <span>取得目安：約{item.acquisition_days}日</span>
                {item.warnings.length > 0 && (
                  <span style={{ color: "var(--hc-accent)" }}>
                    ⚠ {item.warnings[0]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
