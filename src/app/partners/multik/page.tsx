import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import PublicSectionHeader from "@/components/layout/PublicSectionHeader";
import InfoTable from "@/components/shared/InfoTable";
import { MULTIK_COMPANY, SERVICE_PREFECTURES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "施工パートナー マルチック株式会社 | HOJYO CAME",
  description:
    "HOJYO CAMEの施工実施主体、マルチック株式会社（AVTECH日本正規代理店）。東京・神奈川・静岡・埼玉・千葉・山梨の6都県で防犯カメラ設置工事に対応。",
  alternates: { canonical: "/partners/multik" },
  openGraph: {
    title: "施工パートナー マルチック株式会社 | HOJYO CAME",
    description: "AVTECH日本正規代理店のマルチック株式会社。6都県での防犯カメラ設置施工を担当。",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: MULTIK_COMPANY.name,
  alternateName: MULTIK_COMPANY.nameEn,
  url: MULTIK_COMPANY.website,
  email: MULTIK_COMPANY.email,
  description: "AVTECH Technology Corporation の日本正規代理店。防犯カメラの販売と施工を行う。",
  areaServed: SERVICE_PREFECTURES.map((p) => ({ "@type": "State", name: p })),
  address: { "@type": "PostalAddress", addressCountry: "JP", addressRegion: "東京都" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "防犯カメラ設置工事",
  provider: { "@type": "Organization", name: MULTIK_COMPANY.name, url: MULTIK_COMPANY.website },
  areaServed: SERVICE_PREFECTURES.map((p) => ({ "@type": "State", name: p })),
  description: "AVTECH製品（カメラ・NVR・XVR）の販売、配線・取付・初期設定を含む現場施工、アフター保守までワンストップで提供する。",
};

const COMPANY_ROWS = [
  { label: "社名", value: MULTIK_COMPANY.name },
  { label: "英文社名", value: MULTIK_COMPANY.nameEn },
  { label: "事業内容", value: "防犯カメラ（AVTECH製品）の販売および設置工事" },
  { label: "メーカー代理店契約", value: `${MULTIK_COMPANY.manufacturer} ／ ${MULTIK_COMPANY.relationship}` },
  { label: "対応エリア", value: "東京都 / 神奈川県 / 静岡県 / 埼玉県 / 千葉県 / 山梨県（6都県）" },
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

const SECTION_H2: React.CSSProperties = {
  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
  fontSize: 20,
  fontWeight: 700,
  color: "var(--hc-navy)",
  letterSpacing: "-0.02em",
  margin: "0 0 20px",
};

const BODY_TEXT: React.CSSProperties = {
  fontSize: 14,
  color: "var(--hc-text-muted)",
  lineHeight: 1.8,
  fontFamily: "'Noto Sans JP', sans-serif",
};

export default function PartnersMultikPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <PublicPageLayout>
        {/* Hero — navy ベタ塗り廃止。PublicSectionHeader で代替 */}
        <PublicSectionHeader
          overline="Service Partner"
          title="施工実施主体：マルチック株式会社"
          sub={`HOJYO CAMEで見積もり・施工をご依頼いただいた場合は、${MULTIK_COMPANY.name}（${MULTIK_COMPANY.relationship}）が工事を担当します。対応エリアは東京・神奈川・静岡・埼玉・千葉・山梨の6都県です。`}
          as="h1"
          titleClass="hc-headline"
          align="left"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
          {/* 会社概要 */}
          <section>
            <h2 style={SECTION_H2}>会社概要</h2>
            <InfoTable rows={COMPANY_ROWS} />
          </section>

          {/* 対応エリア */}
          <section>
            <h2 style={SECTION_H2}>対応エリア（施工）</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 32,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid var(--hc-border)",
                }}
              >
                <Image
                  src="/images/area-map.png"
                  alt="対応エリア6都県（東京・神奈川・静岡・埼玉・千葉・山梨）"
                  width={800}
                  height={500}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  priority
                />
              </div>
              <div>
                <p style={{ ...BODY_TEXT, marginBottom: 16 }}>
                  施工はマルチックが直接担当します。6都県のいずれかに拠点・物件を
                  お持ちのお客様は、HOJYO CAMEのウィザードから見積もり〜施工依頼まで
                  お進みいただけます。
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {SERVICE_PREFECTURES.map((p) => (
                    <li key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--hc-text)", fontFamily: "'Noto Sans JP', sans-serif" }}>
                      <span
                        aria-hidden
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--hc-primary)",
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      {p}
                    </li>
                  ))}
                </ul>
                <p style={{ ...BODY_TEXT, fontSize: 12 }}>
                  東京本社・支社体制のお客様は、系列支社への導入もご相談ください。
                  6都県以外の地域にある支社への導入可否は、個別に現場調査の上で判断します。
                </p>
              </div>
            </div>
          </section>

          {/* 施工実績 */}
          <section>
            <h2 style={SECTION_H2}>施工実績</h2>
            <div
              style={{
                border: "1px solid var(--hc-border)",
                borderRadius: 10,
                padding: 24,
                background: "var(--hc-primary-subtle)",
              }}
            >
              <p style={BODY_TEXT}>
                当ポータル経由の施工実績は、案件確定後に顧客同意を得た上で
                <Link
                  href="/cases"
                  style={{ color: "var(--hc-primary)", textDecoration: "none", margin: "0 4px" }}
                >
                  導入事例ページ
                </Link>
                に掲載予定です。件数・業種・導入台数・工期を事実列挙で記録します。
              </p>
            </div>
          </section>

          {/* CTA — プライマリ1本 + リンクテキスト */}
          <section
            style={{
              borderTop: "1px solid var(--hc-border)",
              paddingTop: 48,
              textAlign: "center",
            }}
          >
            <h2 style={{ ...SECTION_H2, textAlign: "center" }}>
              補助金と見積もりを一度に進めたい方へ
            </h2>
            <p style={{ ...BODY_TEXT, marginBottom: 28, maxWidth: 560, margin: "0 auto 28px" }}>
              HOJYO CAMEのウィザードで、会社情報の入力から補助金選定・製品構成・
              見積書PDF出力までを一連で進められます。
            </p>
            {/* プライマリCTA 1本 */}
            <Link
              href="/match"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 36px",
                borderRadius: 8,
                border: "1px solid var(--hc-primary)",
                background: "var(--hc-primary)",
                color: "var(--hc-white)",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                fontFamily: "'Noto Sans JP', sans-serif",
                marginBottom: 16,
              }}
            >
              補助金を診断する
            </Link>
            {/* サブリンク */}
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
              <Link
                href="/my/wizard"
                style={{ fontSize: 13, color: "var(--hc-text-muted)", textDecoration: "none" }}
              >
                見積もりウィザードへ進む →
              </Link>
              <Link
                href="/contact"
                style={{ fontSize: 13, color: "var(--hc-text-muted)", textDecoration: "none" }}
              >
                お問い合わせフォーム →
              </Link>
            </div>
            <p style={{ ...BODY_TEXT, fontSize: 12, marginTop: 12 }}>
              メール対応のみ（電話営業は行いません）。
            </p>
          </section>
        </div>
      </PublicPageLayout>
    </>
  );
}
