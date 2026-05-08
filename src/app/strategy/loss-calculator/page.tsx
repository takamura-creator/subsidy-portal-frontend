import Link from "next/link";
import LossCalculator from "@/components/strategy/LossCalculator";

/**
 * /strategy/loss-calculator
 * - 業種別 年間損失算出ツール
 * - 完全決定論（AI使用なし）
 */

export const metadata = {
  title: "損失算出ツール | HOJYO CAME",
  description: "業種別に年間損失額を試算。補助金申請の費用対効果根拠として活用できます。",
};

export default function LossCalculatorPage() {
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 16px" }}>
      <nav style={{ marginBottom: 16, fontSize: 12, color: "#6B7280" }}>
        <Link href="/strategy" style={{ color: "#2563EB" }}>← 戦略支援</Link>
      </nav>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>
          📉 損失算出ツール
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
          業種別の損失パターンから年間損失額を試算します。すべて決定論計算です。
        </p>
      </header>
      <LossCalculator />
      <footer style={{ marginTop: 24, padding: 12, background: "#F3F4F6", borderRadius: 8, fontSize: 12 }}>
        <Link href="/match" style={{ color: "#2563EB", fontWeight: 600 }}>
          /match で適用可能な補助金を探す →
        </Link>
      </footer>
    </main>
  );
}
