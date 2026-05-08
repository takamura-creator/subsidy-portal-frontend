import Link from "next/link";
import ROIComparison from "@/components/strategy/ROIComparison";

/**
 * /strategy/roi-simulator
 * - Before/After 2列の ROI 比較ツール
 * - 数値は決定論、AIは「導入後の物語」生成のみ（紫枠）
 */

export const metadata = {
  title: "ROI比較ツール | HOJYO CAME",
  description: "防犯機器導入の Before/After を2列で比較。補助金事業計画書の投資対効果節に転用可能。",
};

export default function ROISimulatorPage() {
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 16px" }}>
      <nav style={{ marginBottom: 16, fontSize: 12, color: "#6B7280" }}>
        <Link href="/strategy" style={{ color: "#2563EB" }}>← 戦略支援</Link>
      </nav>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>
          📈 ROI比較ツール
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
          導入前後の業務コストを2列で並べ、削減額・捻出時間を試算します。AIは「導入後の業務風景」物語化のみ担当します。
        </p>
      </header>
      <ROIComparison />
    </main>
  );
}
