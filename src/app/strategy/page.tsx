import Link from "next/link";

/**
 * /strategy — 戦略支援ハブページ
 * - 静的ナビゲーションのみ（AI・APIなし）
 */

export const metadata = {
  title: "戦略支援 | HOJYO CAME",
  description: "補助金採択率を上げる6つのツール。損失算出・ROI・賃上げ計画など。",
};

interface ToolCard {
  icon: string;
  title: string;
  desc: string;
  duration: string;
  href: string;
  available: boolean;
}

const TOOLS: ToolCard[] = [
  { icon: "📉", title: "損失算出ツール", desc: "業種別に年間損失額を試算", duration: "3分", href: "/strategy/loss-calculator", available: true },
  { icon: "📈", title: "ROI比較ツール", desc: "導入前後を2列で比較", duration: "5分", href: "/strategy/roi-simulator", available: true },
  { icon: "💰", title: "賃上げ計画ビルダー", desc: "必要な賃上げ率を逆算", duration: "3分", href: "/strategy/wage-planner", available: false },
  { icon: "🗓", title: "申請カレンダー", desc: "申請までの逆算スケジュール", duration: "2分", href: "/strategy/timeline", available: false },
  { icon: "🧾", title: "課税区分判定", desc: "3問で課税区分を判定", duration: "1分", href: "/strategy/tax-guide", available: false },
  { icon: "🏷", title: "TCO比較ツール", desc: "クラウドvsローカル5年比較", duration: "5分", href: "/strategy/tco-compare", available: false },
];

export default function StrategyHubPage() {
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 16px" }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
          採択率を上げる6つのツール
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
          補助金マッチングの先へ。申請準備〜採択率向上を伴走する戦略支援。
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
        aria-label="戦略支援ツール一覧"
      >
        {TOOLS.map((tool) => (
          <ToolCardItem key={tool.href} tool={tool} />
        ))}
      </section>

      <p style={{ marginTop: 24, fontSize: 12, color: "#6B7280" }}>
        ※ Sprint 2 では「損失算出」「ROI比較」のみ利用可能。残ツールは順次公開予定。
      </p>
    </main>
  );
}

function ToolCardItem({ tool }: { tool: ToolCard }) {
  const inner = (
    <article
      style={{
        padding: 20,
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        height: "100%",
        opacity: tool.available ? 1 : 0.5,
        cursor: tool.available ? "pointer" : "not-allowed",
        transition: "transform 0.15s ease",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{tool.icon}</div>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{tool.title}</h2>
      <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 12px", lineHeight: 1.6 }}>
        {tool.desc}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>所要 {tool.duration}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: tool.available ? "#2563EB" : "#9CA3AF",
          }}
        >
          {tool.available ? "使う →" : "近日公開"}
        </span>
      </div>
    </article>
  );

  if (!tool.available) return <div data-tool-href={tool.href}>{inner}</div>;
  return (
    <Link href={tool.href} style={{ textDecoration: "none", color: "inherit" }} data-analytics={`strategy_hub_card:${tool.href}`}>
      {inner}
    </Link>
  );
}
