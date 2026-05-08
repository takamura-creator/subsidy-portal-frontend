import Link from "next/link";
import ActionTimeline from "@/components/strategy/ActionTimeline";

/**
 * /strategy/timeline
 * - 申請カレンダー（縦軸タイムライン・完全決定論）
 * - Sprint 3
 */

export const metadata = {
  title: "申請カレンダー | HOJYO CAME",
  description:
    "補助金申請までの加点取得・書類準備・賃上げ表明等を、申請締切日からの逆算で可視化。完全決定論。",
};

// tasks_by_subsidy のキーに対応する選択肢
const SUBSIDY_OPTIONS = [
  { id: "monodukuri", label: "ものづくり補助金" },
  { id: "digital_ai_hojokin", label: "中小企業デジタル・AI補助金" },
  { id: "shoukibo_jizokuka", label: "小規模事業者持続化補助金" },
  { id: "it_hojokin", label: "IT導入補助金" },
  { id: "jigyou_saikouchiku", label: "事業再構築補助金" },
];

export default function ActionTimelinePage() {
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 16px" }}>
      <nav style={{ marginBottom: 16, fontSize: 12, color: "#6B7280" }}>
        <Link href="/strategy" style={{ color: "#2563EB" }}>
          ← 戦略支援
        </Link>
      </nav>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>
          🗓 申請カレンダー
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
          補助金申請締切から逆算して、加点取得・書類準備・賃上げ表明等の着手期限を可視化します。すべて決定論計算です。
        </p>
      </header>
      <ActionTimeline subsidyOptions={SUBSIDY_OPTIONS} />
      <footer
        style={{
          marginTop: 24,
          padding: 12,
          background: "#F3F4F6",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        <Link href="/match" style={{ color: "#2563EB", fontWeight: 600 }}>
          /match で適用可能な補助金を確認する →
        </Link>
      </footer>
    </main>
  );
}
