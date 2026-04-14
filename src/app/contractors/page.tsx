"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { fetchContractors, type Contractor } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

const MOCK_CONTRACTORS: Contractor[] = [
  { id: "1", company_name: "セキュアテック株式会社", description: "関東を中心に監視カメラ設置の豊富な実績を持ちます。", areas: ["東京都", "神奈川県", "埼玉県", "千葉県"], qualifications: ["IT導入支援事業者", "防犯設備士", "電気工事士（第一種）"], project_count: 142, rating: 4.8, review_count: 32 },
  { id: "2", company_name: "西日本カメラサービス", description: "大阪・関西エリアに特化した防犯カメラ専門業者です。", areas: ["大阪府", "兵庫県", "京都府", "奈良県"], qualifications: ["IT導入支援事業者", "防犯設備士"], project_count: 98, rating: 4.6, review_count: 24 },
  { id: "3", company_name: "全国セキュリティ工業", description: "全国対応の防犯システム専門業者。大規模案件も対応可。", areas: ["全国対応"], qualifications: ["電気工事士（第一種）", "防犯設備士"], project_count: 210, rating: 4.5, review_count: 48 },
  { id: "4", company_name: "北海道防犯カメラセンター", description: "北海道の防犯カメラ設置に特化した地域密着型業者です。", areas: ["北海道"], qualifications: ["防犯設備士"], project_count: 45, rating: 4.3, review_count: 12 },
  { id: "5", company_name: "九州セキュリティサポート", description: "九州・沖縄エリアの防犯カメラ設置・保守を担当します。", areas: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県"], qualifications: ["IT導入支援事業者"], project_count: 67, rating: 4.2, review_count: 18 },
];

const AREA_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "北海道・東北", value: "北海道" },
  { label: "関東", value: "東京都" },
  { label: "中部", value: "愛知県" },
  { label: "関西", value: "大阪府" },
  { label: "九州・沖縄", value: "福岡県" },
];

const RATING_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "★4以上", value: "4" },
  { label: "★3以上", value: "3" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`評価 ${rating.toFixed(1)}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className="w-3.5 h-3.5"
          fill={i <= Math.round(rating) ? "var(--hc-accent)" : "var(--hc-border)"}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
      <span className="text-xs ml-1 font-bold" style={{ color: "var(--hc-accent)" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>(MOCK_CONTRACTORS);
  const [loading, setLoading] = useState(false);
  const [prefecture, setPrefecture] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchContractors({ prefecture: prefecture || undefined, keyword: keyword || undefined })
      .then((d) => setContractors(d.contractors))
      .catch(() => setContractors(MOCK_CONTRACTORS))
      .finally(() => setLoading(false));
  }, [prefecture, keyword]);

  const filtered = contractors.filter((c) => {
    if (ratingFilter && c.rating < parseFloat(ratingFilter)) return false;
    return true;
  });

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
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
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>エリア</label>
        <select className="form-select text-xs w-full" value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
          {AREA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>都道府県（詳細）</label>
        <select className="form-select text-xs w-full" value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
          <option value="">すべて</option>
          {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>評価</label>
        <select className="form-select text-xs w-full" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          {RATING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );

  const center = (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          className="form-input flex-1 text-sm"
          placeholder="業者名、エリアで検索..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setKeyword(searchInput)}
        />
        <button className="btn-primary text-sm px-4" onClick={() => setKeyword(searchInput)}>
          検索
        </button>
      </div>

      <div className="flex justify-between items-center mb-3">
        <span className="text-xs" style={{ color: "var(--hc-text-muted)" }}>
          {loading ? "読み込み中..." : `${filtered.length}社の登録業者`}
        </span>
        <select
          className="text-xs border rounded px-2 py-1"
          style={{ borderColor: "var(--hc-border)", color: "var(--hc-text-muted)" }}
        >
          <option>評価が高い順</option>
          <option>実績が多い順</option>
          <option>新着順</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: "var(--hc-text-muted)" }}>
            条件に合う業者が見つかりませんでした
          </div>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border p-3 transition-shadow"
            style={{ borderColor: "var(--hc-border)", background: "#fff" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--hc-navy)" }}>
                  {c.company_name}
                  {c.rating >= 4.5 && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#FEF9C3", color: "var(--hc-accent)" }}>
                      認定業者
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3 mb-1.5">
                  <StarRating rating={c.rating} />
                  <span className="text-xs" style={{ color: "var(--hc-text-muted)" }}>
                    {c.areas.slice(0, 2).join("・")}
                  </span>
                  <span className="text-xs" style={{ color: "var(--hc-text-muted)" }}>
                    実績 {c.project_count}件
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.qualifications.slice(0, 3).map((q) => (
                    <span
                      key={q}
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{ background: "rgba(21,128,61,0.06)", color: "var(--hc-primary)" }}
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <Link
                  href={`/contractors/${c.id}`}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded border text-center transition-colors"
                  style={{ color: "var(--hc-primary)", borderColor: "var(--hc-border)" }}
                >
                  詳しく見る
                </Link>
                <button
                  onClick={() => toggleCompare(c.id)}
                  className="text-xs px-2.5 py-1.5 rounded border text-center transition-colors"
                  style={{
                    color: compareList.includes(c.id) ? "var(--hc-primary)" : "var(--hc-text-muted)",
                    borderColor: compareList.includes(c.id) ? "var(--hc-primary)" : "var(--hc-border)",
                    background: compareList.includes(c.id) ? "rgba(21,128,61,0.04)" : "#fff",
                  }}
                >
                  {compareList.includes(c.id) ? "✓ 比較中" : "+ 比較"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const compareContractors = contractors.filter((c) => compareList.includes(c.id));

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
        className="block w-full text-center text-xs font-bold px-3 py-2.5 rounded mb-2"
        style={{ background: "var(--hc-primary)", color: "#fff" }}
      >
        ⚡ AI補助金診断
      </Link>
      <Link
        href="/auth/login?redirect=/my/applications/new"
        className="block w-full text-left text-xs font-medium px-3 py-2.5 rounded border mb-2 transition-colors"
        style={{ borderColor: "var(--hc-border)", color: "var(--hc-navy)", background: "#fff" }}
      >
        📄 見積もり依頼
      </Link>

      <hr style={{ borderColor: "var(--hc-border)", margin: "14px 0" }} />

      <div className="rounded-lg border p-3" style={{ borderColor: "var(--hc-border)", background: "#fff" }}>
        <p className="text-xs font-bold mb-2" style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}>
          比較リスト（最大3社）
        </p>
        {compareContractors.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--hc-text-muted)" }}>
            業者を選択して比較できます
          </p>
        ) : (
          <div className="space-y-1.5">
            {compareContractors.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center py-1.5 border-b last:border-0 text-xs"
                style={{ borderColor: "var(--hc-border)" }}
              >
                <span style={{ color: "var(--hc-navy)" }}>{c.company_name}</span>
                <button
                  onClick={() => toggleCompare(c.id)}
                  className="text-xs hover:underline"
                  style={{ color: "var(--hc-text-muted)" }}
                >
                  削除
                </button>
              </div>
            ))}
            {compareContractors.length >= 2 && (
              <button
                className="block w-full text-xs font-medium text-center py-2 rounded mt-2 transition-colors"
                style={{ background: "rgba(21,128,61,0.06)", color: "var(--hc-primary)" }}
              >
                比較する
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
