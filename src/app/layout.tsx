import type { Metadata, Viewport } from "next";
import { AnalyticsWrapper } from "@/components/analytics/AnalyticsWrapper";
import HCHeader from "@/components/layout/HCHeader";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import type { JsonLdObject } from "@/lib/structured-data";
import "./globals.css";
// StatusBar は admin/my/wizard の各 layout.tsx から呼び出す（公開ページ非表示）

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";
const LOGO_URL = `${SITE_URL}/images/turtle_logo.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HOJYO CAME — 防犯カメラ導入×補助金活用ポータル",
    template: "%s — HOJYO CAME",
  },
  description:
    "防犯カメラ・設備導入に使える補助金を業種から検索。マルチック対応6都県の補助金を一覧で比較できます。業種・規模に合わせて条件に合う補助金をご提案します。",
  keywords: ["防犯カメラ", "補助金", "IT導入補助金", "監視カメラ", "助成金", "HOJYO CAME"],
  openGraph: {
    title: "HOJYO CAME | 防犯カメラ補助金を業種から検索",
    description: "設備導入に使える補助金を業種から無料で検索。マルチック対応6都県に特化。",
    siteName: "HOJYO CAME",
    locale: "ja_JP",
    type: "website",
    url: SITE_URL,
    // OG画像は src/app/opengraph-image.tsx の自動生成を使用（og-default.png は不在のため削除）
  },
  twitter: {
    card: "summary_large_image",
    site: "@HOJYOCAME",
    title: "HOJYO CAME | 防犯カメラ補助金を業種から検索",
    description: "設備導入に使える補助金を業種から無料で検索。マルチック対応6都県に特化。",
    // Twitter OG画像は opengraph-image.tsx の自動生成を使用
  },
  robots: { index: true, follow: true },
};

// ① viewport を明示設定（Next.js 15必須）— 未設定だと初回レンダリングで幅が誤判定される
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// --- 構造化データ ---

const organizationSchema: JsonLdObject = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HOJYO CAME",
  url: SITE_URL,
  logo: LOGO_URL,
  description: "防犯カメラ導入×補助金活用ポータル。業種・都道府県から使える補助金を検索できます。",
  sameAs: ["https://x.com/HOJYOCAME"],
};

const serviceSchema: JsonLdObject = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "補助金マッチング",
  description: "防犯カメラ導入に使える補助金を業種・規模・都道府県から無料でマッチングするサービス。",
  provider: {
    "@type": "Organization",
    name: "HOJYO CAME",
    url: SITE_URL,
  },
  areaServed: {
    "@type": "Country",
    name: "日本",
  },
  serviceType: "補助金マッチング",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
};

const websiteSchema: JsonLdObject = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HOJYO CAME",
  url: SITE_URL,
  description: "防犯カメラ導入×補助金活用ポータル",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/subsidies?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const siteSchemas: JsonLdObject[] = [organizationSchema, serviceSchema, websiteSchema];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <JsonLd data={siteSchemas} id="jsonld-site" />
        <HCHeader />
        {children}
        <Footer />
        <CookieConsent />
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
