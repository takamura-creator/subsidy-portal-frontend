"use client";

import type React from "react";
import Link from "next/link";

/**
 * 自治会向け参考書類テンプレ生成のフォーム部品。
 * TemplateGenerator.tsx から分離（500行制限対応）。
 */

export function pillButtonStyle(selected: boolean): React.CSSProperties {
  return {
    fontSize: 12,
    fontWeight: selected ? 700 : 500,
    padding: "8px 14px",
    borderRadius: 8,
    border: selected ? "1.5px solid var(--hc-primary)" : "1px solid var(--hc-border)",
    background: selected ? "var(--hc-primary-light)" : "var(--hc-white)",
    color: selected ? "var(--hc-primary)" : "var(--hc-text)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  };
}

export function PillToggle({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} style={pillButtonStyle(selected)}>
      {children}
    </button>
  );
}

export function MultiSelect({
  options,
  values,
  onChange,
}: {
  options: readonly string[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <PillToggle
            key={opt}
            selected={selected}
            onClick={() => {
              if (selected) {
                onChange(values.filter((v) => v !== opt));
              } else {
                onChange([...values, opt]);
              }
            }}
          >
            {opt}
          </PillToggle>
        );
      })}
    </div>
  );
}

export function SingleSelect<T extends string | number>({
  options,
  value,
  onChange,
  formatLabel,
}: {
  options: readonly T[];
  value: T | undefined;
  onChange: (next: T) => void;
  formatLabel?: (v: T) => string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <PillToggle key={String(opt)} selected={selected} onClick={() => onChange(opt)}>
            {formatLabel ? formatLabel(opt) : String(opt)}
          </PillToggle>
        );
      })}
    </div>
  );
}

export function ContactCTA({ subsidyName }: { subsidyName: string }) {
  return (
    <section
      style={{
        padding: 20,
        borderRadius: 10,
        background: "var(--hc-primary-faint)",
        border: "1px solid var(--hc-primary-edge)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", margin: "0 0 6px", lineHeight: 1.5 }}>
        実際の申請書類作成・現地調査・施工はマルチックがサポートします
      </p>
      <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>
        藤沢市鵠沼地区 9件の施工実績／湘南エリアでの対応経験豊富
      </p>
      <Link
        href={`/contact?subject=${encodeURIComponent(`【${subsidyName}】参考書類作成済み・申請相談`)}`}
        style={{
          display: "inline-block",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--hc-white)",
          background: "var(--hc-primary)",
          padding: "12px 28px",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        マルチックに相談する →
      </Link>
    </section>
  );
}
