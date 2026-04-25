"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { fetchSubsidies, Subsidy } from "@/lib/api";
import { PREFECTURES, INDUSTRIES } from "@/lib/constants";

const CATEGORIES = [
  { label: "すべて", value: "", count: 123 },
  { label: "国の補助金", value: "国", count: 24 },
  { label: "都道府県", value: "都道府県", count: 47 },
  { label: "市区町村", value: "市区町村", count: 52 },
];

const AMOUNT_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "〜50万円", value: "50" },
  { label: "〜100万円", value: "100" },
  { label: "〜500万円", value: "500" },
  { label: "500万円以上", value: "500plus" },
];

const DEADLINE_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "30日以内", value: "30" },
  { label: "60日以内", value: "60" },
  { label: "90日以内", value: "90" },
];

const MOCK_SUBSIDIES: Subsidy[] = [
  { id: "1", name: "IT導入補助金（セキュリティ対策推進枠）", category: "国", ministry: "中小企業庁", pref_code: "", prefecture: "", max_amount: 1000000, rate_min: 0.5, rate_max: 0.75, target_industries: [], max_employees: 300, deadline: "2026/4/30", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "2", name: "ものづくり補助金（省力化枠）", category: "国", ministry: "中小企業庁", pref_code: "", prefecture: "", max_amount: 12500000, rate_min: 0.5, rate_max: 0.5, target_industries: [], max_employees: 300, deadline: "2026/6/15", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "3", name: "小規模事業者持続化補助金", category: "国", ministry: "商工会議所", pref_code: "", prefecture: "", max_amount: 500000, rate_min: 0.667, rate_max: 0.667, target_industries: [], max_employees: 20, deadline: "2026/5/31", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "4", name: "省エネルギー投資促進支援事業費補助金", category: "国", ministry: "経済産業省", pref_code: "", prefecture: "", max_amount: 5000000, rate_min: 0.333, rate_max: 0.5, target_industries: [], max_employees: null, deadline: "2026/7/31", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "5", name: "東京都 防犯設備設置費助成事業", category: "都道府県", ministry: "東京都", pref_code: "13", prefecture: "東京都", max_amount: 100000, rate_min: 0.5, rate_max: 0.5, target_industries: [], max_employees: null, deadline: "2026/12/31", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "6", name: "大阪市 防犯カメラ設置補助金", category: "市区町村", ministry: "大阪市", pref_code: "27", prefecture: "大阪府", max_amount: 150000, rate_min: 0.5, rate_max: 0.5, target_industries: [], max_employees: null, deadline: "2026/9/30", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "7", name: "札幌市 地域防犯カメラ設置促進事業", category: "市区町村", ministry: "札幌市", pref_code: "1", prefecture: "北海道", max_amount: 200000, rate_min: 0.5, rate_max: 0.667, target_industries: [], max_employees: null, deadline: "2026/11/30", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "8", name: "名古屋市 防犯カメラ設置費補助", category: "市区町村", ministry: "名古屋市", pref_code: "23", prefecture: "愛知県", max_amount: 100000, rate_min: 0.5, rate_max: 0.5, target_industries: [], max_employees: null, deadline: "2026/10/31", status: "open", description: "", application_tips: "", source_url: "" },
];

// 更新日のモックデータ
const UPDATED_MAP: Record<string, string> = {
  "1": "4/10更新",
  "2": "4/8更新",
  "3": "4/5更新",
  "4": "4/1更新",
  "5": "3/28更新",
  "6": "3/25更新",
  "7": "3/20更新",
  "8": "3/15更新",
};

function getDaysUntil(dateStr: string): number {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 999;
  const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatAmount(amount: number): string {
  if (amount >= 10000000) return `${Math.round(amount / 10000000) * 1000}万円`;
  if (amount >= 1000000) return `${Math.round(amount / 10000).toLocaleString("ja-JP")}万円`;
  if (amount >= 10000) return `${Math.round(amount / 10000)}万円`;
  return `${amount.toLocaleString("ja-JP")}円`;
}

function formatAmountDisplay(s: Subsidy): string {
  // 防犯カメラ系は「X万円/台」表示
  if (s.name.includes("防犯") || s.name.includes("助成")) {
    const man = Math.round(s.max_amount / 10000);
    return `${man}万円/台`;
  }
  return formatAmount(s.max_amount);
}

export default function SubsidiesPage() {
  const [subsidies, setSubsidies] = useState<Subsidy[]>(MOCK_SUBSIDIES);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [industry, setIndustry] = useState("");
  const [category, setCategory] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState("");
  const [sort, setSort] = useState("deadline");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSubsidies({ prefecture: prefecture || undefined, category: category || undefined, industry: industry || undefined })
      .then((res) => setSubsidies(res.subsidies))
      .catch(() => setSubsidies(MOCK_SUBSIDIES))
      .finally(() => setLoading(false));
  }, [prefecture, category, industry]);

  const filtered = subsidies.filter((s) => {
    if (keyword && !s.name.includes(keyword) && !s.ministry.includes(keyword)) return false;
    if (amountFilter === "50" && s.max_amount > 500000) return false;
    if (amountFilter === "100" && s.max_amount > 1000000) return false;
    if (amountFilter === "500" && s.max_amount > 5000000) return false;
    if (amountFilter === "500plus" && s.max_amount < 5000000) return false;
    if (deadlineFilter) {
      const days = getDaysUntil(s.deadline);
      if (days > parseInt(deadlineFilter)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "deadline") return getDaysUntil(a.deadline) - getDaysUntil(b.deadline);
    if (sort === "amount") return b.max_amount - a.max_amount;
    return 0;
  });

  const handleReset = () => {
    setPrefecture("");
    setCategory("");
    setAmountFilter("");
    setDeadlineFilter("");
    setIndustry("");
    setKeyword("");
    setSearchInput("");
  };

  /* ── Left column: Filters ── */
  const left = (
    <div>
      <span className="section-title">フィルター</span>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>
          都道府県
        </label>
        <select
          className="form-select"
          style={{ fontSize: 13, padding: "8px 10px" }}
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value)}
        >
          <option value="">すべて</option>
          {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>
          業種
        </label>
        <select
          className="form-select"
          style={{ fontSize: 13, padding: "8px 10px" }}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="">すべて</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>
          補助上限額
        </label>
        <select
          className="form-select"
          style={{ fontSize: 13, padding: "8px 10px" }}
          value={amountFilter}
          onChange={(e) => setAmountFilter(e.target.value)}
        >
          {AMOUNT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>
          締切
        </label>
        <select
          className="form-select"
          style={{ fontSize: 13, padding: "8px 10px" }}
          value={deadlineFilter}
          onChange={(e) => setDeadlineFilter(e.target.value)}
        >
          {DEADLINE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <button
        onClick={handleReset}
        style={{
          background: "none",
          border: "none",
          fontSize: 11,
          color: "var(--hc-primary)",
          fontWeight: 500,
          cursor: "pointer",
          padding: 0,
          marginTop: 6,
        }}
        onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        リセット
      </button>

      <div className="divider" />

      <span className="section-title">カテゴリ</span>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {CATEGORIES.map((c) => {
          const isActive = category === c.value;
          const count = c.value === ""
            ? sorted.length
            : sorted.filter((s) => s.category.includes(c.value)).length;
          return (
            <li key={c.value}>
              <button
                onClick={() => setCategory(c.value)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 8px",
                  fontSize: 12,
                  color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)",
                  background: isActive ? "var(--hc-primary-muted)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                <span>{c.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    background: "var(--hc-text-subtle)",
                    padding: "1px 6px",
                    borderRadius: 9999,
                  }}
                >
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  /* ── Center column: Search + Table ── */
  const center = (
    <div style={{ padding: "0" }}>
      {/* Search row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          className="form-input"
          placeholder="補助金名、キーワードで検索..."
          style={{ flex: 1, fontSize: 14, padding: "10px 14px" }}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setKeyword(searchInput)}
        />
        <button
          onClick={() => setKeyword(searchInput)}
          style={{
            background: "var(--hc-primary)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--hc-primary-hover)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "var(--hc-primary)")}
        >
          検索
        </button>
      </div>

      {/* List meta: count + sort */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12, color: "var(--hc-text-muted)" }}>
        <span>{loading ? "読み込み中..." : `${sorted.length}件の補助金`}</span>
        <select
          style={{
            padding: "4px 8px",
            border: "1px solid var(--hc-border)",
            borderRadius: 4,
            fontSize: 11,
            fontFamily: "inherit",
            color: "var(--hc-text-muted)",
            background: "var(--hc-white)",
          }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="deadline">締切が近い順</option>
          <option value="amount">金額が大きい順</option>
          <option value="new">新着順</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "var(--hc-shadow)",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 1fr 1fr 1fr 100px",
            padding: "8px 14px",
            background: "var(--hc-primary-faint)",
            borderBottom: "1px solid var(--hc-border)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--hc-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}
        >
          <span>補助金名</span>
          <span>上限額</span>
          <span>締切</span>
          <span>更新日</span>
          <span />
        </div>

        {sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: "var(--hc-text-muted)" }}>
            条件に合う補助金が見つかりませんでした
          </div>
        )}

        {/* Table rows */}
        {sorted.map((s, idx) => {
          const days = getDaysUntil(s.deadline);
          const isUrgent = days <= 30;
          const isNew = s.id === "2"; // ものづくり補助金にNEWバッジ
          return (
            <div
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 1fr 1fr 1fr 100px",
                padding: "10px 14px",
                borderBottom: idx < sorted.length - 1 ? "1px solid var(--hc-border)" : "none",
                fontSize: 13,
                alignItems: "center",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--hc-primary-faint)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontWeight: 600, color: "var(--hc-navy)" }}>
                {s.name}
                {isUrgent && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--hc-accent)",
                      background: "var(--hc-accent-light)",
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontWeight: 600,
                      marginLeft: 4,
                    }}
                  >
                    あと{days}日
                  </span>
                )}
                {isNew && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--hc-primary)",
                      background: "var(--hc-primary-soft)",
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontWeight: 600,
                      marginLeft: 4,
                    }}
                  >
                    NEW
                  </span>
                )}
              </span>
              <span style={{ color: "var(--hc-primary)", fontWeight: 700 }}>
                {formatAmountDisplay(s)}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: isUrgent ? "var(--hc-accent)" : undefined,
                  fontWeight: isUrgent ? 600 : undefined,
                }}
              >
                {s.deadline}
              </span>
              <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>
                {UPDATED_MAP[s.id] || ""}
              </span>
              <span>
                <Link
                  href={`/subsidies/${s.id}`}
                  style={{
                    padding: "4px 10px",
                    border: "1px solid var(--hc-border)",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--hc-primary)",
                    background: "none",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    display: "inline-block",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--hc-primary)";
                    e.currentTarget.style.background = "var(--hc-primary-subtle)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--hc-border)";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  詳しく見る
                </Link>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ── Right column: Quick actions ── */
  const right = (
    <div>
      <span className="section-title">クイックアクション</span>

      {/* CTA: AI補助金診断 */}
      <Link
        href="/match"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          background: "var(--hc-primary)",
          color: "#fff",
          border: "1px solid var(--hc-primary)",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          textAlign: "center",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "none",
          transition: "all 0.15s",
        }}
      >
        <span style={{ marginRight: 4 }}>&#9889;</span>AI補助金診断
      </Link>

      {/* 申請書作成 */}
      <Link
        href="#"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          color: "var(--hc-text)",
          textAlign: "left",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "none",
          transition: "all 0.15s",
        }}
      >
        <span style={{ marginRight: 4 }}>&#128196;</span>選択した補助金で申請書作成
      </Link>

      {/* 施工パートナー */}
      <Link
        href="/partners/multik"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          color: "var(--hc-text)",
          textAlign: "left",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "none",
          transition: "all 0.15s",
        }}
      >
        <span style={{ marginRight: 4 }}>&#128295;</span>施工パートナーを見る
      </Link>

      <div className="divider" />

      <span className="section-title">補助金情報について</span>
      <p style={{ fontSize: 11, color: "var(--hc-text-muted)", lineHeight: 1.5, marginBottom: 8 }}>
        掲載情報は各省庁・自治体の公式データに基づきます。最終更新日を必ずご確認ください。
      </p>

      {/* マスコット */}
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          padding: 12,
          background: "var(--hc-primary-faint)",
          borderRadius: 6,
        }}
      >
        <p style={{ fontSize: 10, color: "var(--hc-text-muted)", margin: 0 }}>
          キーワードで絞り込むと<br />条件に合う補助金が見つかります
        </p>
      </div>
    </div>
  );

  return (
    <ThreeColumnLayout
      left={left}
      center={center}
      right={right}
      gridCols="220px 1fr 240px"
    />
  );
}
