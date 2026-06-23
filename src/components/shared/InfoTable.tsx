/**
 * InfoTable — 会社情報 dl（about/partners で重複の dl/dt/dd grid）を共通化
 *
 * grid 140px 1fr / 区切り線はトークンで定義。
 * Server Component（"use client" 不要）。
 */

import type { ReactNode } from "react";

export interface InfoTableRow {
  label: string;
  value: ReactNode;
}

interface InfoTableProps {
  rows: InfoTableRow[];
}

function InfoRow({ label, value }: InfoTableRow) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 16,
        padding: "16px 20px",
        borderBottom: "1px solid var(--hc-border)",
        fontSize: 14,
      }}
    >
      <dt
        style={{
          color: "var(--hc-text-muted)",
          fontWeight: 500,
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          color: "var(--hc-text)",
          margin: 0,
          fontFamily: "'Noto Sans JP', sans-serif",
          lineHeight: 1.6,
        }}
      >
        {value}
      </dd>
    </div>
  );
}

export default function InfoTable({ rows }: InfoTableProps) {
  return (
    <dl
      style={{
        background: "var(--hc-white)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        overflow: "hidden",
        margin: 0,
      }}
    >
      {rows.map((row, i) => (
        <InfoRow key={i} label={row.label} value={row.value} />
      ))}
    </dl>
  );
}
