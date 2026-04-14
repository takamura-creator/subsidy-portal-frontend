"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { fetchSubsidies, Subsidy } from "@/lib/api";
import { PREFECTURES, INDUSTRIES } from "@/lib/constants";

const CATEGORIES = [
  { label: "すべて", value: "" },
  { label: "国の補助金", value: "国" },
  { label: "都道府県", value: "都道府県" },
  { label: "市区町村", value: "市区町村" },
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

function getDaysUntil(dateStr: string): number {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 999;
  const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatAmount(amount: number): string {
  if (amount >= 10000000) return `${Math.round(amount / 10000000) * 1000}万円`;
  if (amount >= 1000000) return `${Math.round(amount / 10000)}万円`;
  if (amount >= 10000) return `${Math.round(amount / 10000)}万円`;
  return `${amount.toLocaleString("ja-JP")}円`;
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

  const left = (
    <div>
      <p
        className="text-xs font-bold uppercase mb-3"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        フィルター
      </p>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>都道府県</label>
        <select className="form-select text-xs w-full" value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
          <option value="">すべて</option>
          {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>業種</label>
        <select className="form-select text-xs w-full" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">すべて</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>補助上限額</label>
        <select className="form-select text-xs w-full" value={amountFilter} onChange={(e) => setAmountFilter(e.target.value)}>
          {AMOUNT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>締切</label>
        <select className="form-select text-xs w-full" value={deadlineFilter} onChange={(e) => setDeadlineFilter(e.target.value)}>
          {DEADLINE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <button
        onClick={handleReset}
        className="text-xs font-medium hover:underline mb-4"
        style={{ color: "var(--hc-primary)" }}
      >
        リセット
      </button>

      <hr style={{ borderColor: "var(--hc-border)", margin: "14px 0" }} />

      <p
        className="text-xs font-bold uppercase mb-2"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        カテゴリ
      </p>
      <ul>
        {CATEGORIES.map((c) => (
          <li key={c.value}>
            <button
              className="w-full text-left px-2 py-1.5 rounded text-xs flex justify-between items-center transition-colors"
              style={{
                color: category === c.value ? "var(--hc-primary)" : "var(--hc-text-muted)",
                background: category === c.value ? "rgba(21,128,61,0.06)" : "transparent",
                fontWeight: category === c.value ? 500 : 400,
              }}
              onClick={() => setCategory(c.value)}
            >
              <span>{c.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.04)" }}>
                {c.value === "" ? sorted.length : sorted.filter((s) => s.category.includes(c.value)).length}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const center = (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          className="form-input flex-1 text-sm"
          placeholder="補助金名、キーワードで検索..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setKeyword(searchInput)}
        />
        <button className="btn-primary text-sm px-4" onClick={() => setKeyword(searchInput)}>
          検索
        </button>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs" style={{ color: "var(--hc-text-muted)" }}>
          {loading ? "読み込み中..." : `${sorted.length}件の補助金`}
        </span>
        <select
          className="text-xs border rounded px-2 py-1"
          style={{ borderColor: "var(--hc-border)", color: "var(--hc-text-muted)" }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="deadline">締切が近い順</option>
          <option value="amount">金額が大きい順</option>
          <option value="new">新着順</option>
        </select>
      </div>

      <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--hc-border)", background: "#fff" }}>
        <div
          className="grid text-xs font-semibold uppercase px-3 py-2"
          style={{
            gridTemplateColumns: "2.5fr 1fr 1fr 90px",
            background: "rgba(21,128,61,0.03)",
            borderBottom: "1px solid var(--hc-border)",
            color: "var(--hc-text-muted)",
          }}
        >
          <span>補助金名</span>
          <span>上限額</span>
          <span>締切</span>
          <span />
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: "var(--hc-text-muted)" }}>
            条件に合う補助金が見つかりませんでした
          </div>
        )}

        {sorted.map((s) => {
          const days = getDaysUntil(s.deadline);
          const isUrgent = days <= 30;
          return (
            <div
              key={s.id}
              className="grid items-center px-3 py-2.5 text-sm border-b last:border-0 transition-colors"
              style={{
                gridTemplateColumns: "2.5fr 1fr 1fr 90px",
                borderColor: "var(--hc-border)",
              }}
            >
              <span className="font-semibold leading-snug pr-2" style={{ color: "var(--hc-navy)" }}>
                {s.name}
                {isUrgent && (
                  <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: "#FEF9C3", color: "var(--hc-accent)" }}>
                    あと{days}日
                  </span>
                )}
              </span>
              <span className="font-bold text-sm" style={{ color: "var(--hc-primary)" }}>
                {formatAmount(s.max_amount)}
              </span>
              <span
                className="text-xs"
                style={{ color: isUrgent ? "var(--hc-accent)" : "var(--hc-text-muted)", fontWeight: isUrgent ? 600 : 400 }}
              >
                {s.deadline}
              </span>
              <span>
                <Link
                  href={`/subsidies/${s.id}`}
                  className="text-xs font-semibold px-2.5 py-1 rounded border transition-colors"
                  style={{ color: "var(--hc-primary)", borderColor: "var(--hc-border)" }}
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

  const right = (
    <div>
      <p
        className="text-xs font-bold uppercase mb-3"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        クイックアクション
      </p>
      <Link
        href="/match"
        className="block w-full text-center text-xs font-bold px-3 py-2.5 rounded mb-2 transition-opacity hover:opacity-90"
        style={{ background: "var(--hc-primary)", color: "#fff" }}
      >
        ⚡ AI補助金診断
      </Link>
      <Link
        href="/auth/login?redirect=/my/applications/new"
        className="block w-full text-left text-xs font-medium px-3 py-2.5 rounded border mb-2 transition-colors"
        style={{ borderColor: "var(--hc-border)", color: "var(--hc-navy)", background: "#fff" }}
      >
        📄 申請書を作成する
      </Link>
      <Link
        href="/contractors"
        className="block w-full text-left text-xs font-medium px-3 py-2.5 rounded border mb-2 transition-colors"
        style={{ borderColor: "var(--hc-border)", color: "var(--hc-navy)", background: "#fff" }}
      >
        🔧 工事業者を探す
      </Link>

      <hr style={{ borderColor: "var(--hc-border)", margin: "14px 0" }} />

      <p
        className="text-xs font-bold uppercase mb-2"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        補助金情報について
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--hc-text-muted)" }}>
        掲載情報は各省庁・自治体の公式データに基づきます。最終更新日を必ずご確認ください。
      </p>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
