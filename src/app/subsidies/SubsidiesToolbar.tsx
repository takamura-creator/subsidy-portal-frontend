"use client";

/**
 * 補助金一覧 モバイル絞り込みバー + ボトムシート。
 * デスクトップは .subsidies-mobilebar で非表示。
 * ≤900px でレールが消えた時に検索+絞り込みボタンを表示する。
 */

import { useState } from "react";
import { SERVICE_PREFECTURES, INDUSTRIES } from "@/lib/constants";
import type { Subsidy } from "@/lib/api";
import { CATEGORIES, GOV_LEVELS, AMOUNT_OPTIONS, DEADLINE_OPTIONS } from "./constants";

interface SubsidiesToolbarProps {
  subsidies: Subsidy[];
  sort: string;
  prefecture: string;
  industry: string;
  category: string;
  govLevel: string;
  amountFilter: string;
  deadlineFilter: string;
  activeFilterCount: number;
  onSort: (v: string) => void;
  onPrefecture: (v: string) => void;
  onIndustry: (v: string) => void;
  onCategory: (v: string) => void;
  onGovLevel: (v: string) => void;
  onAmountFilter: (v: string) => void;
  onDeadlineFilter: (v: string) => void;
  onReset: () => void;
}

export default function SubsidiesToolbar({
  subsidies, sort, prefecture, industry, category, govLevel, amountFilter, deadlineFilter,
  activeFilterCount, onSearchInput, onSearch, onSort,
  onPrefecture, onIndustry, onCategory, onGovLevel, onAmountFilter, onDeadlineFilter, onReset,
}: SubsidiesToolbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="subsidies-mobilebar" style={{ flexDirection: "column", gap: 8, marginBottom: 16 }}>
      {/* 絞り込みボタン */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          style={{
            position: "relative",
            background: "var(--hc-card-bg)",
            border: "1px solid var(--hc-border)",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--hc-text)",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          絞り込み
          {activeFilterCount > 0 && (
            <span style={{
              position: "absolute", top: 2, right: 2,
              background: "var(--hc-primary)", color: "var(--hc-white)",
              fontSize: 10, fontWeight: 700,
              width: 16, height: 16, borderRadius: "50%",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* ボトムシート */}
      {sheetOpen && (
        <>
          <div
            onClick={() => setSheetOpen(false)}
            style={{ position: "fixed", inset: 0, background: "var(--hc-overlay)", zIndex: 40 }}
          />
          <div
            role="dialog"
            aria-label="絞り込み"
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
              background: "var(--hc-white)", borderRadius: "16px 16px 0 0",
              padding: "24px 20px 40px", boxShadow: "var(--hc-shadow-md)",
              maxHeight: "85vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", fontFamily: "'Sora','Noto Sans JP',sans-serif" }}>絞り込み</span>
              <button onClick={() => setSheetOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--hc-text-muted)", padding: 0 }} aria-label="閉じる">×</button>
            </div>

            {/* select群 */}
            {[
              { label: "都道府県", value: prefecture, onChange: onPrefecture,
                options: [{ label: "すべて", value: "" }, ...SERVICE_PREFECTURES.map((p) => ({ label: p, value: p }))] },
              { label: "業種", value: industry, onChange: onIndustry,
                options: [{ label: "すべて", value: "" }, ...INDUSTRIES.map((i) => ({ label: i, value: i }))] },
              { label: "補助上限額", value: amountFilter, onChange: onAmountFilter, options: AMOUNT_OPTIONS },
              { label: "締切", value: deadlineFilter, onChange: onDeadlineFilter, options: DEADLINE_OPTIONS },
              { label: "並び順", value: sort, onChange: onSort,
                options: [{ label: "締切が近い順", value: "deadline" }, { label: "金額が大きい順", value: "amount" }, { label: "新着順", value: "new" }] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>{label}</label>
                <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%" }}>
                  {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}

            {/* カテゴリ */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 8 }}>カテゴリ</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {CATEGORIES.map((c) => {
                  const isActive = category === c.value;
                  const count = c.value === "" ? subsidies.length : subsidies.filter((s) => s.category === c.value).length;
                  return (
                    <button key={c.value} onClick={() => onCategory(c.value)}
                      style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, border: "none", background: isActive ? "var(--hc-primary-muted)" : "transparent", color: isActive ? "var(--hc-primary)" : "var(--hc-text)", fontWeight: isActive ? 600 : 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      <span>{c.label}</span><span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 管轄 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 8 }}>管轄</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {GOV_LEVELS.map((g) => {
                  const isActive = govLevel === g.value;
                  const count = g.value === "" ? subsidies.length : g.value === "national" ? subsidies.filter((s) => s.pref_code === "00").length : subsidies.filter((s) => s.pref_code !== "00").length;
                  return (
                    <button key={g.value} onClick={() => onGovLevel(g.value)}
                      style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, border: "none", background: isActive ? "var(--hc-primary-muted)" : "transparent", color: isActive ? "var(--hc-primary)" : "var(--hc-text)", fontWeight: isActive ? 600 : 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      <span>{g.label}</span><span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { onReset(); setSheetOpen(false); }}
                style={{ flex: 1, padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 600, background: "var(--hc-bg)", border: "1px solid var(--hc-border)", color: "var(--hc-text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                リセット
              </button>
              <button onClick={() => setSheetOpen(false)}
                style={{ flex: 2, padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, background: "var(--hc-primary)", border: "none", color: "var(--hc-white)", cursor: "pointer", fontFamily: "inherit" }}>
                適用
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
