import Link from "next/link";
import TaxTreatmentWizard from "@/components/strategy/TaxTreatmentWizard";

/**
 * /strategy/tax-guide
 * - 課税区分判定ウィザード（Sprint 4）
 * - 完全決定論：3問の決定木でのみ判定（AI不使用）
 * - 仕様: 製品責任者/出力/2026-05-05_subsidy_research_ui_spec/05_tax_wizard.md
 */

export const metadata = {
  title: "課税区分判定ウィザード | HOJYO CAME",
  description:
    "3問の決定木で消費税課税区分を判定。補助金交付申請における消費税除外・仕入税額控除重複防止の根拠資料として活用できます。AI不使用の決定論計算。",
};

export default function TaxGuidePage() {
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 16px" }}>
      <nav style={{ marginBottom: 16, fontSize: 12, color: "#6B7280" }}>
        <Link href="/strategy" style={{ color: "#2563EB" }}>← 戦略支援</Link>
      </nav>
      <header style={{ marginBottom: 24, maxWidth: 640, margin: "0 auto 24px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>
          📐 課税区分判定ウィザード
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          補助金交付申請における消費税除外・仕入税額控除重複防止の判定を、3問の決定木で完結させます。
          税務判定は法的責任に直結するため、本ウィザードは<strong>AIを使用しません</strong>（決定論計算のみ）。
        </p>
      </header>
      <TaxTreatmentWizard />
      <footer style={{ marginTop: 24, padding: 12, background: "#F3F4F6", borderRadius: 8, fontSize: 12, maxWidth: 640, margin: "24px auto 0" }}>
        <Link href="/match" style={{ color: "#2563EB", fontWeight: 600 }}>
          /match で適用可能な補助金を探す →
        </Link>
      </footer>
    </main>
  );
}
