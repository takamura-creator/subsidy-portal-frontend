"use client";

import type { IndustryContext } from "@/lib/api";

interface Props {
  context: IndustryContext;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "var(--hc-primary)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

export default function IndustryStrategy({ context }: Props) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--hc-navy)",
          margin: "0 0 14px",
        }}
      >
        {context.name} 業界戦略
      </h2>

      {/* Bottleneck → Solution → Ripple */}
      <Card>
        <SectionLabel>ボトルネック</SectionLabel>
        <p style={{ fontSize: 13, color: "var(--hc-text)", margin: "0 0 12px", lineHeight: 1.6 }}>
          {context.bottleneck}
        </p>

        <SectionLabel>解決策</SectionLabel>
        <p style={{ fontSize: 13, color: "var(--hc-text)", margin: "0 0 12px", lineHeight: 1.6 }}>
          {context.solution}
        </p>

        <SectionLabel>波及効果</SectionLabel>
        <p style={{ fontSize: 13, color: "var(--hc-text)", margin: 0, lineHeight: 1.6 }}>
          {context.ripple_effect}
        </p>
      </Card>

      {/* Loss Formula */}
      <Card>
        <SectionLabel>損失試算式</SectionLabel>
        <div
          style={{
            background: "var(--hc-bg)",
            borderRadius: 6,
            padding: "8px 12px",
            fontFamily: "monospace",
            fontSize: 12,
            color: "var(--hc-navy)",
            marginBottom: 8,
            lineHeight: 1.6,
          }}
        >
          {context.loss_formula.formula}
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--hc-text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          例）{context.loss_formula.example}
        </p>
      </Card>

      {/* Before / After */}
      {context.before_after.length > 0 && (
        <Card>
          <SectionLabel>Before / After 比較</SectionLabel>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
              marginTop: 6,
            }}
          >
            <thead>
              <tr>
                {["指標", "Before", "After", "改善"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "4px 8px",
                      textAlign: "left",
                      color: "var(--hc-text-muted)",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--hc-border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {context.before_after.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "transparent" : "var(--hc-bg)",
                  }}
                >
                  <td
                    style={{
                      padding: "6px 8px",
                      color: "var(--hc-text)",
                      fontWeight: 500,
                      borderBottom: "1px solid var(--hc-border)",
                    }}
                  >
                    {row.metric}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color: "var(--hc-text-muted)",
                      borderBottom: "1px solid var(--hc-border)",
                    }}
                  >
                    {row.before}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color: "var(--hc-success)",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--hc-border)",
                    }}
                  >
                    {row.after}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color: "var(--hc-primary)",
                      fontWeight: 700,
                      borderBottom: "1px solid var(--hc-border)",
                    }}
                  >
                    {row.improvement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* KPI Targets */}
      {context.kpi_targets.length > 0 && (
        <Card>
          <SectionLabel>KPI目標</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {context.kpi_targets.map((kpi, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--hc-white)",
                    background: "var(--hc-navy)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {kpi.category}
                </span>
                <span style={{ fontSize: 12, color: "var(--hc-text)" }}>{kpi.name}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--hc-success)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kpi.target}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
