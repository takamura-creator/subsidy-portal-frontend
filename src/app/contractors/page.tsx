"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { fetchContractors, type Contractor } from "@/lib/api";

const MOCK_CONTRACTORS: Contractor[] = [
  { id: "1", company_name: "セキュアテック株式会社", description: "関東を中心に監視カメラ設置の豊富な実績を持ちます。", areas: ["東京都", "神奈川県", "埼玉県", "千葉県"], qualifications: ["IT導入補助金", "ものづくり補助金"], project_count: 142, rating: 4.8, review_count: 32 },
  { id: "2", company_name: "西日本カメラサービス", description: "大阪・関西エリアに特化した防犯カメラ専門業者です。", areas: ["大阪府", "兵庫県", "京都府", "奈良県"], qualifications: ["持続化補助金", "IT導入補助金"], project_count: 98, rating: 4.6, review_count: 24 },
  { id: "3", company_name: "全国セキュリティ工業", description: "全国対応の防犯システム専門業者。大規模案件も対応可。", areas: ["全国対応"], qualifications: ["ものづくり補助金"], project_count: 210, rating: 4.5, review_count: 48 },
  { id: "4", company_name: "北海道防犯カメラセンター", description: "北海道の防犯カメラ設置に特化した地域密着型業者です。", areas: ["北海道"], qualifications: ["持続化補助金"], project_count: 45, rating: 4.3, review_count: 12 },
  { id: "5", company_name: "九州セキュリティサポート", description: "九州・沖縄エリアの防犯カメラ設置・保守を担当します。", areas: ["福岡県", "佐賀県", "長崎県", "熊本県"], qualifications: ["IT導入補助金"], project_count: 67, rating: 4.2, review_count: 18 },
];

const AREA_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "北海道・東北", value: "北海道" },
  { label: "関東", value: "東京都" },
  { label: "中部", value: "愛知県" },
  { label: "関西", value: "大阪府" },
  { label: "中国・四国", value: "広島県" },
  { label: "九州・沖縄", value: "福岡県" },
];

const SUBSIDY_OPTIONS = ["すべて", "IT導入補助金", "ものづくり補助金", "持続化補助金"];
const RESULTS_OPTIONS = ["すべて", "10件以上", "50件以上", "100件以上"];
const RATING_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "★4以上", value: "4" },
  { label: "★3以上", value: "3" },
];

const AREA_LABELS: Record<string, string> = {
  "1": "東京・関東",
  "2": "大阪・関西",
  "3": "全国対応",
  "4": "北海道",
  "5": "福岡・九州",
};

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>(MOCK_CONTRACTORS);
  const [loading, setLoading] = useState(false);
  const [prefecture, setPrefecture] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [compareList, setCompareList] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState("rating");

  useEffect(() => {
    setLoading(true);
    fetchContractors({ prefecture: prefecture || undefined, keyword: keyword || undefined })
      .then((d) => setContractors(d.contractors))
      .catch(() => setContractors(MOCK_CONTRACTORS))
      .finally(() => setLoading(false));
  }, [prefecture, keyword]);

  const filtered = contractors
    .filter((c) => {
      if (ratingFilter && c.rating < parseFloat(ratingFilter)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "results") return b.project_count - a.project_count;
      return b.rating - a.rating;
    });

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareContractors = contractors.filter((c) => compareList.includes(c.id));

  const left = (
    <div>
      <span className="section-title">フィルター</span>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>
          エリア
        </label>
        <select
          className="form-select"
          style={{ fontSize: 13, padding: "8px 10px" }}
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value)}
        >
          {AREA_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>
          対応補助金
        </label>
        <select className="form-select" style={{ fontSize: 13, padding: "8px 10px" }}>
          {SUBSIDY_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>
          実績数
        </label>
        <select className="form-select" style={{ fontSize: 13, padding: "8px 10px" }}>
          {RESULTS_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--hc-text)", marginBottom: 4 }}>
          評価
        </label>
        <select
          className="form-select"
          style={{ fontSize: 13, padding: "8px 10px" }}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          {RATING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const center = (
    <div>
      {/* Search bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, padding: "10px 14px", fontSize: 14 }}
          placeholder="業者名、エリアで検索..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setKeyword(searchInput)}
        />
        <button
          className="btn-primary"
          style={{ width: "auto", padding: "10px 18px", fontSize: 13, borderRadius: 6 }}
          onClick={() => setKeyword(searchInput)}
        >
          検索
        </button>
      </div>

      {/* Sort row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12, color: "var(--hc-text-muted)" }}>
        <span>{loading ? "読み込み中..." : `${filtered.length}社の登録業者`}</span>
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
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="rating">評価が高い順</option>
          <option value="results">実績が多い順</option>
          <option value="new">新着順</option>
        </select>
      </div>

      {/* Contractor cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", fontSize: 14, color: "var(--hc-text-muted)" }}>
            条件に合う業者が見つかりませんでした
          </div>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            style={{
              background: "var(--hc-white)",
              border: "1px solid var(--hc-border)",
              borderRadius: 8,
              padding: 14,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "center",
              cursor: "pointer",
              transition: "box-shadow 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--hc-navy)" }}>
                {c.company_name}
                {c.rating >= 4.5 && (
                  <span
                    style={{
                      fontSize: 10,
                      background: "var(--hc-accent-light)",
                      color: "var(--hc-accent)",
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontWeight: 600,
                      marginLeft: 8,
                    }}
                  >
                    認定業者
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--hc-text-muted)", display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  ★ {c.rating.toFixed(1)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {AREA_LABELS[c.id] || c.areas.slice(0, 2).join("・")}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  実績 {c.project_count}件
                </span>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                {c.qualifications.slice(0, 3).map((q) => (
                  <span
                    key={q}
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(21,128,61,0.06)",
                      color: "var(--hc-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href={`/contractors/${c.id}`}
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
              }}
            >
              詳しく見る
            </Link>
          </div>
        ))}
      </div>
    </div>
  );

  const right = (
    <div>
      <span className="section-title">クイックアクション</span>
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
          textDecoration: "none",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
      >
        ⚡ AI補助金診断
      </Link>
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
          textDecoration: "none",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
      >
        📄 見積もり依頼
      </Link>

      <div className="divider" />

      {/* Compare panel */}
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          padding: 14,
        }}
      >
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>
          比較リスト（最大3社）
        </h3>
        {compareContractors.length === 0 ? (
          <div style={{ fontSize: 11, color: "var(--hc-text-muted)", textAlign: "center", padding: "16px 0" }}>
            業者を選択して比較できます
          </div>
        ) : (
          <div>
            {compareContractors.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--hc-border)",
                  fontSize: 12,
                }}
              >
                <span>{c.company_name}</span>
                <span
                  style={{ fontSize: 10, color: "var(--hc-text-muted)", cursor: "pointer" }}
                  onClick={() => toggleCompare(c.id)}
                >
                  削除
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hint illustration area */}
      <div style={{ textAlign: "center", marginTop: 20, padding: 12, background: "rgba(21,128,61,0.03)", borderRadius: 6 }}>
        <p style={{ fontSize: 10, color: "var(--hc-text-muted)", margin: 0 }}>
          エリアや実績で<br />絞り込めます
        </p>
      </div>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} gridCols="220px 1fr 260px" />;
}
