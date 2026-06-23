"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { EMPLOYEE_RANGES, PREFECTURES, PURPOSES } from "@/lib/constants";
import IndustryCard from "./IndustryCard";

export interface IndustryItem {
  industry: string;
  icon: string;
  desc: string;
  count: number;
}

const S = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "color-mix(in srgb, var(--hc-navy) 45%, transparent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  },
  dialog: {
    background: "var(--hc-white)",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    border: "1px solid var(--hc-border)",
  },
  title: {
    fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--hc-navy)",
    margin: "0 0 4px",
  },
  sub: { fontSize: 13, color: "var(--hc-text-muted)", margin: "0 0 16px" },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--hc-navy)",
    margin: "12px 0 4px",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid var(--hc-border)",
    background: "var(--hc-white)",
    color: "var(--hc-navy)",
  },
  primaryBtn: {
    display: "block",
    width: "100%",
    marginTop: 20,
    padding: "12px 16px",
    fontSize: 15,
    fontWeight: 700,
    borderRadius: 6,
    border: "none",
    background: "var(--hc-primary)",
    color: "var(--hc-white)",
    cursor: "pointer",
  },
  listLink: {
    display: "block",
    textAlign: "center" as const,
    marginTop: 10,
    fontSize: 13,
    color: "var(--hc-primary)",
    textDecoration: "none",
  },
  closeBtn: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    border: "none",
    background: "transparent",
    fontSize: 18,
    color: "var(--hc-text-muted)",
    cursor: "pointer",
    lineHeight: 1,
  },
} as const;

export default function MatchGrid({ items }: { items: IndustryItem[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [employees, setEmployees] = useState<string>(EMPLOYEE_RANGES[1].label);
  const [prefecture, setPrefecture] = useState<string>("東京都");
  const [purpose, setPurpose] = useState<string>(PURPOSES[0]);

  function openDialog(industry: string) {
    track("diagnosis_start", { industry });
    setSelected(industry);
  }

  function goResults() {
    if (!selected) return;
    const q = new URLSearchParams({
      industry: selected,
      employees,
      prefecture,
      purpose,
    });
    router.push(`/match/results?${q.toString()}`);
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 24,
        }}
      >
        {items.map((it) => (
          <IndustryCard
            key={it.industry}
            industry={it.industry}
            icon={it.icon}
            desc={it.desc}
            count={it.count}
            onSelect={openDialog}
          />
        ))}
      </div>

      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selected}の診断条件`}
            style={{ ...S.dialog, position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="閉じる"
              style={S.closeBtn}
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <h2 style={S.title}>{selected} の診断条件</h2>
            <p style={S.sub}>3つ選ぶと、対象補助金と上限額が分かります。</p>

            <label style={S.label} htmlFor="match-employees">従業員数</label>
            <select
              id="match-employees"
              style={S.select}
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
            >
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r.label} value={r.label}>{r.label}</option>
              ))}
            </select>

            <label style={S.label} htmlFor="match-prefecture">都道府県</label>
            <select
              id="match-prefecture"
              style={S.select}
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
            >
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <label style={S.label} htmlFor="match-purpose">導入目的</label>
            <select
              id="match-purpose"
              style={S.select}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <button type="button" style={S.primaryBtn} onClick={goResults}>
              診断結果を見る →
            </button>
            <Link
              href={`/subsidies?industry=${encodeURIComponent(selected)}`}
              style={S.listLink}
            >
              この業種の補助金一覧を見る
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
