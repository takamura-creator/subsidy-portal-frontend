import Link from "next/link";
import { fetchContractor } from "@/lib/api";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

const MOCK_REVIEWS = [
  { stars: 5, text: "見積もりから施工まで丁寧に対応していただきました。補助金の申請サポートも助かりました。", author: "小売業 T様（東京都）" },
  { stars: 4, text: "工期の見積もりが正確で、予定通りに完了しました。アフターサポートも充実しています。", author: "製造業 M様（埼玉県）" },
];

function starsDisplay(count: number): string {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

export default async function ContractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let c;
  try {
    c = await fetchContractor(id);
  } catch {
    c = {
      id,
      company_name: "セキュアテック株式会社",
      description: "関東を中心に、監視カメラ・防犯カメラ設置の豊富な実績を持つ専門業者です。",
      areas: ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"],
      qualifications: ["電気工事士（第一種）", "防犯設備士", "HOJYO CAME 認定業者"],
      project_count: 142,
      rating: 4.8,
      review_count: 32,
    };
  }

  const tocItems = [
    { href: "#profile", label: "プロフィール" },
    { href: "#results", label: "施工実績" },
    { href: "#area", label: "対応エリア" },
    { href: "#reviews", label: "評価・レビュー" },
    { href: "#certs", label: "資格・認定" },
  ];

  const left = (
    <div>
      <Link
        href="/contractors"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: "var(--hc-text-muted)",
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        ← 業者一覧
      </Link>

      <span className="section-title">目次</span>

      <div className="link-list">
        {tocItems.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            style={
              i === 0
                ? {
                    background: "rgba(21,128,61,0.06)",
                    color: "var(--hc-primary)",
                    fontWeight: 500,
                    borderLeft: "3px solid var(--hc-primary)",
                    paddingLeft: 7,
                  }
                : undefined
            }
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );

  const center = (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 16 }}>
        <Link href="/contractors" style={{ color: "var(--hc-primary)", textDecoration: "none" }}>
          工事業者一覧
        </Link>
        {" > "}
        {c.company_name}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--hc-navy)", letterSpacing: "-0.5px", marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>
        {c.company_name}
      </h1>

      {/* Tags */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, fontWeight: 600, background: "rgba(21,128,61,0.08)", color: "var(--hc-primary)" }}>
          ★ {c.rating.toFixed(1)}（{c.review_count}件）
        </span>
        {c.rating >= 4.5 && (
          <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, fontWeight: 600, background: "var(--hc-accent-light)", color: "var(--hc-accent)" }}>
            認定業者
          </span>
        )}
        <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, fontWeight: 600, background: "rgba(0,0,0,0.04)", color: "var(--hc-text-muted)" }}>
          {c.areas[0] === "東京都" ? "東京・関東" : c.areas[0]}
        </span>
      </div>

      {/* Profile section */}
      <section id="profile" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)", fontFamily: "'Sora', sans-serif" }}>
          会社概要
        </h2>
        <table className="info-table">
          <tbody>
            <tr><th>設立</th><td>2015年</td></tr>
            <tr><th>代表者</th><td>鈴木 一郎</td></tr>
            <tr><th>従業員数</th><td>24名</td></tr>
            <tr><th>所在地</th><td>東京都品川区大崎2-1-1</td></tr>
            <tr><th>対応補助金</th><td>IT導入補助金、ものづくり補助金、持続化補助金</td></tr>
          </tbody>
        </table>
      </section>

      {/* Results section */}
      <section id="results" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)", fontFamily: "'Sora', sans-serif" }}>
          施工実績
        </h2>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7, marginBottom: 6 }}>
          累計施工実績 <strong style={{ color: "var(--hc-primary)" }}>{c.project_count}件</strong>（2023年〜2026年）
        </p>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7 }}>
          <li style={{ marginBottom: 6 }}>小売店舗 防犯カメラシステム導入（IT導入補助金活用）— 東京都新宿区</li>
          <li style={{ marginBottom: 6 }}>製造工場 監視カメラ8台設置（ものづくり補助金活用）— 埼玉県川口市</li>
          <li style={{ marginBottom: 6 }}>飲食チェーン 全5店舗一括導入 — 東京都・神奈川県</li>
        </ul>
      </section>

      {/* Area section */}
      <section id="area" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)", fontFamily: "'Sora', sans-serif" }}>
          対応エリア
        </h2>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7 }}>
          {c.areas.join("、")}
        </p>
      </section>

      {/* Reviews section */}
      <section id="reviews" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)", fontFamily: "'Sora', sans-serif" }}>
          評価・レビュー
        </h2>
        {MOCK_REVIEWS.map((review, i) => (
          <div
            key={i}
            style={{
              background: "var(--hc-white)",
              border: "1px solid var(--hc-border)",
              borderRadius: 8,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <div style={{ color: "var(--hc-accent)", fontSize: 13, marginBottom: 4 }}>
              {starsDisplay(review.stars)}
            </div>
            <div style={{ fontSize: 13, color: "var(--hc-text-muted)", lineHeight: 1.6, fontStyle: "italic" }}>
              「{review.text}」
            </div>
            <div style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 6 }}>
              — {review.author}
            </div>
          </div>
        ))}
      </section>

      {/* Certifications section */}
      <section id="certs" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)", fontFamily: "'Sora', sans-serif" }}>
          資格・認定
        </h2>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7 }}>
          {c.qualifications.map((q) => (
            <li key={q} style={{ marginBottom: 6 }}>{q}</li>
          ))}
        </ul>
      </section>
    </div>
  );

  const right = (
    <div>
      <span className="section-title">アクション</span>

      <Link
        href="#"
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          textDecoration: "none",
          fontFamily: "inherit",
          transition: "all 0.3s",
          background: "var(--hc-primary)",
          color: "#fff",
          border: "2px solid var(--hc-primary)",
        }}
      >
        見積もりを依頼する
      </Link>
      <Link
        href="#"
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          textDecoration: "none",
          fontFamily: "inherit",
          transition: "all 0.3s",
          background: "var(--hc-white)",
          color: "var(--hc-primary)",
          border: "2px solid var(--hc-primary)",
        }}
      >
        比較リストに追加
      </Link>

      {/* Info box */}
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          padding: 14,
          marginTop: 12,
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>
          基本情報
        </h3>
        {[
          { label: "評価", value: `★ ${c.rating.toFixed(1)}`, color: "var(--hc-accent)" },
          { label: "実績", value: `${c.project_count}件`, color: "var(--hc-text)" },
          { label: "エリア", value: c.areas[0] === "東京都" ? "東京・関東" : c.areas[0], color: "var(--hc-text)" },
          { label: "認定", value: c.rating >= 4.5 ? "認定業者" : "—", color: c.rating >= 4.5 ? "var(--hc-primary)" : "var(--hc-text)" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid var(--hc-border)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--hc-text-muted)" }}>{item.label}</span>
            <span style={{ fontWeight: 600, color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} gridCols="200px 1fr 260px" />;
}
