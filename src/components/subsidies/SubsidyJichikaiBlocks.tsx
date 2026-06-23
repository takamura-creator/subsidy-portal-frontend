"use client";

/**
 * 自治会向け補助金の3ブロック
 * SubsidyDetailClient から抽出（実績バナー・適合チェッカー・テンプレ誘導）。
 */

import Link from "next/link";
import EligibilityChecker from "@/components/subsidies/EligibilityChecker";

interface SubsidyJichikaiBlocksProps {
  subsidyId: string;
  subsidyName: string;
}

export default function SubsidyJichikaiBlocks({ subsidyId, subsidyName }: SubsidyJichikaiBlocksProps) {
  return (
    <>
      {/* 鵠沼地区実績バナー */}
      <section
        style={{
          marginBottom: 24,
          padding: "16px 18px",
          borderRadius: 10,
          background: "linear-gradient(135deg, var(--hc-primary-faint) 0%, transparent 100%)",
          border: "1px solid var(--hc-primary-edge)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "var(--hc-primary)",
            padding: "4px 10px", borderRadius: 9999, background: "var(--hc-white)", border: "1px solid var(--hc-primary-edge)",
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif", letterSpacing: "-0.3px", flexShrink: 0,
          }}>
            湘南エリア 9件の施工実績
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--hc-navy)", margin: "0 0 4px", lineHeight: 1.5 }}>
              藤沢市鵠沼地区での街頭防犯カメラ施工実績多数
            </p>
            <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.6 }}>
              自治会様の補助金申請から設置・運用まで、近隣自治会様の事例を踏まえてご提案いたします。
            </p>
          </div>
          <Link
            href="/contact"
            style={{
              fontSize: 12, fontWeight: 700, color: "var(--hc-white)",
              background: "var(--hc-primary)", padding: "8px 16px", borderRadius: 6,
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            まずは相談する →
          </Link>
        </div>
      </section>

      {/* 採択適合チェッカー */}
      <EligibilityChecker key={subsidyId} subsidyId={subsidyId} subsidyName={subsidyName} />

      {/* 参考書類テンプレ誘導 */}
      <section
        style={{
          marginBottom: 24,
          padding: 20,
          borderRadius: 10,
          background: "var(--hc-card-bg)",
          border: "1px solid var(--hc-primary-edge)",
          boxShadow: "var(--hc-shadow)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>📝</div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3
              style={{
                fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--hc-navy)",
                margin: "0 0 4px",
                letterSpacing: "-0.3px",
              }}
            >
              参考書類テンプレを作成する
            </h3>
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.6 }}>
              設置目的書・管理運用規程・個人情報保護方針・撮影範囲説明書の 4 種類を、選択式で5分で作成できます（参考資料）。
            </p>
          </div>
          <Link
            href={`/subsidies/${subsidyId}/templates`}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--hc-white)",
              background: "var(--hc-primary)",
              padding: "10px 18px",
              borderRadius: 8,
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            テンプレを作成する →
          </Link>
        </div>
      </section>
    </>
  );
}
