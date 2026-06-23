import type { Metadata } from "next";
import Link from "next/link";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import PublicSectionHeader from "@/components/layout/PublicSectionHeader";
import InfoTable from "@/components/shared/InfoTable";
import { MULTIK_COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "運営者情報 | HOJYO CAME",
  description:
    "HOJYO CAMEの運営会社情報。マルチック株式会社が中立的な立場で補助金情報と工事業者情報を提供します。",
  alternates: { canonical: "/about" },
};

const COMPANY_ROWS = [
  { label: "社名", value: MULTIK_COMPANY.name },
  { label: "代表者", value: "高村 泰宏" },
  { label: "所在地", value: "神奈川県藤沢市辻堂西海岸2-10-3-11" },
  { label: "設立", value: "2020年" },
  { label: "事業内容", value: "監視カメラシステムの販売・導入支援、補助金申請支援" },
  {
    label: "ウェブサイト",
    value: (
      <a
        href={MULTIK_COMPANY.website}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--hc-primary)", textDecoration: "none" }}
      >
        {MULTIK_COMPANY.website}
      </a>
    ),
  },
  {
    label: "連絡先",
    value: (
      <a
        href={`mailto:${MULTIK_COMPANY.email}`}
        style={{ color: "var(--hc-primary)", textDecoration: "none" }}
      >
        {MULTIK_COMPANY.email}
      </a>
    ),
  },
];

const BODY_TEXT: React.CSSProperties = {
  fontSize: 15,
  color: "var(--hc-text)",
  lineHeight: 1.8,
  fontFamily: "'Noto Sans JP', sans-serif",
};

const SECTION_H2: React.CSSProperties = {
  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
  fontSize: 20,
  fontWeight: 700,
  color: "var(--hc-navy)",
  letterSpacing: "-0.02em",
  margin: "0 0 16px",
};

export default function AboutPage() {
  return (
    <PublicPageLayout>
      <PublicSectionHeader
        overline="About"
        title="運営者情報"
        sub="HOJYO CAMEは、防犯カメラ導入を検討する中小企業と施工業者をつなぐ補助金マッチングプラットフォームです。"
        as="h1"
        titleClass="hc-headline"
        align="left"
      />

      <div
        style={{
          maxWidth: 760,
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        {/* サービス概要 */}
        <section>
          <h2 style={SECTION_H2}>HOJYO CAMEについて</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={BODY_TEXT}>
              HOJYO CAMEは、監視カメラ・防犯カメラの導入を検討している中小企業と、
              設置工事を行う業者をつなぐ補助金マッチングプラットフォームです。
            </p>
            <p style={BODY_TEXT}>
              特定メーカーの製品を推奨するのではなく、中立的な立場で補助金情報と
              工事業者情報を提供し、中小企業の皆様がスムーズに補助金を活用できるよう
              サポートします。
            </p>
          </div>
        </section>

        {/* 運営会社 */}
        <section>
          <h2 style={SECTION_H2}>運営会社</h2>
          <InfoTable rows={COMPANY_ROWS} />
        </section>

        {/* サービスの特徴 */}
        <section>
          <h2 style={SECTION_H2}>サービスの特徴</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={BODY_TEXT}>
              HOJYO CAMEは完全無料でご利用いただけます。補助金の診断、申請書の作成支援、
              工事業者のマッチングまで、すべて無料です。
            </p>
            <p style={BODY_TEXT}>
              工事業者の皆様には、補助金活用の案件マッチングを通じた集客支援を行っています。
            </p>
          </div>
        </section>

        {/* お問い合わせ */}
        <section>
          <h2 style={SECTION_H2}>お問い合わせ</h2>
          <p
            style={{
              ...BODY_TEXT,
              color: "var(--hc-text-muted)",
              marginBottom: 20,
            }}
          >
            サービスに関するお問い合わせは、下記リンクよりご連絡ください。
          </p>
          <Link
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 28px",
              borderRadius: 8,
              background: "var(--hc-primary)",
              color: "var(--hc-white)",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            お問い合わせフォームへ
          </Link>
        </section>

        {/* 法的リンク */}
        <section>
          <div
            style={{
              borderTop: "1px solid var(--hc-border)",
              paddingTop: 32,
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            {[
              { href: "https://multik.jp/privacy", label: "プライバシーポリシー" },
              { href: "https://multik.jp/terms", label: "利用規約" },
              { href: "https://multik.jp/tokushoho", label: "特定商取引法に基づく表記" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  color: "var(--hc-primary)",
                  textDecoration: "none",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
}
