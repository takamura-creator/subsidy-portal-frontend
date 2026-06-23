"use client";

/**
 * 補助金一覧 左フィルターレール（Apple閲覧型・sticky）。
 * 検索 + select4 + カテゴリ/管轄縦リスト + リセット + 業種CTA。
 * デスクトップ248px sticky / モバイルは .subsidies-rail で非表示。
 */

import Link from "next/link";
import { SERVICE_PREFECTURES, INDUSTRIES } from "@/lib/constants";
import type { Subsidy } from "@/lib/api";
import { CATEGORIES, GOV_LEVELS, AMOUNT_OPTIONS, DEADLINE_OPTIONS } from "./constants";

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.04em",
  color: "var(--hc-text-muted)",
  textTransform: "uppercase",
  marginBottom: 10,
  display: "block",
};

const FIELD_LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--hc-text-muted)",
  marginBottom: 6,
};

interface SubsidiesFilterRailProps {
  subsidies: Subsidy[];
  prefecture: string;
  industry: string;
  category: string;
  govLevel: string;
  amountFilter: string;
  deadlineFilter: string;
  activeFilterCount: number;
  onPrefecture: (v: string) => void;
  onIndustry: (v: string) => void;
  onCategory: (v: string) => void;
  onGovLevel: (v: string) => void;
  onAmountFilter: (v: string) => void;
  onDeadlineFilter: (v: string) => void;
  onReset: () => void;
}

export default function SubsidiesFilterRail({
  subsidies, prefecture, industry, category, govLevel, amountFilter, deadlineFilter,
  activeFilterCount, onPrefecture, onIndustry, onCategory, onGovLevel,
  onAmountFilter, onDeadlineFilter, onReset,
}: SubsidiesFilterRailProps) {
  return (
    <aside
      className="subsidies-rail"
      style={{
        position: "sticky",
        top: 88,
        alignSelf: "start",
        width: 248,
      }}
    >
      {/* ② select群 縦積み */}
      <div style={{ marginBottom: 28 }}>
        <span style={SECTION_LABEL}>しぼり込む</span>

        {[
          { label: "都道府県", value: prefecture, onChange: onPrefecture,
            options: [{ label: "すべて", value: "" }, ...SERVICE_PREFECTURES.map((p) => ({ label: p, value: p }))] },
          { label: "業種", value: industry, onChange: onIndustry,
            options: [{ label: "すべて", value: "" }, ...INDUSTRIES.map((i) => ({ label: i, value: i }))] },
          { label: "上限額", value: amountFilter, onChange: onAmountFilter, options: AMOUNT_OPTIONS },
          { label: "締切", value: deadlineFilter, onChange: onDeadlineFilter, options: DEADLINE_OPTIONS },
        ].map(({ label, value, onChange, options }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <label style={FIELD_LABEL}>{label}</label>
            <select
              className="form-select"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{ width: "100%" }}
            >
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* ③ カテゴリ縦リスト */}
      <div style={{ marginBottom: 24 }}>
        <span style={SECTION_LABEL}>カテゴリ</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CATEGORIES.map((c) => {
            const isActive = category === c.value;
            const count = c.value === ""
              ? subsidies.length
              : subsidies.filter((s) => s.category === c.value).length;
            return (
              <button
                key={c.value}
                onClick={() => onCategory(c.value)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 10px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--hc-primary)" : "var(--hc-text)",
                  background: isActive ? "var(--hc-primary-muted)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "var(--hc-primary-faint)"; }}
                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span>{c.label}</span>
                <span style={{
                  fontSize: 11,
                  color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ④ 管轄縦リスト */}
      <div style={{ marginBottom: 24 }}>
        <span style={SECTION_LABEL}>管轄</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {GOV_LEVELS.map((g) => {
            const isActive = govLevel === g.value;
            const count = g.value === "" ? subsidies.length
              : g.value === "national"
                ? subsidies.filter((s) => s.pref_code === "00").length
                : subsidies.filter((s) => s.pref_code !== "00").length;
            return (
              <button
                key={g.value}
                onClick={() => onGovLevel(g.value)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 10px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--hc-primary)" : "var(--hc-text)",
                  background: isActive ? "var(--hc-primary-muted)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "var(--hc-primary-faint)"; }}
                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span>{g.label}</span>
                <span style={{
                  fontSize: 11,
                  color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ⑤ リセット */}
      {activeFilterCount > 0 && (
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={onReset}
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              color: "var(--hc-primary)",
              fontWeight: 500,
              cursor: "pointer",
              padding: "4px 0",
              fontFamily: "inherit",
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            リセット
          </button>
        </div>
      )}

      {/* ⑥ 業種から探すCTA */}
      <Link
        href="/match"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "10px 14px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--hc-primary)",
          border: "1px solid var(--hc-primary-border)",
          background: "none",
          textDecoration: "none",
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          transition: "background 0.15s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "var(--hc-primary-subtle)")}
        onMouseOut={(e) => (e.currentTarget.style.background = "none")}
      >
        業種から探す →
      </Link>
    </aside>
  );
}
