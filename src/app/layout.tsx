import type { Metadata, Viewport } from "next";
import HCHeader from "@/components/layout/HCHeader";
import StatusBar from "@/components/layout/StatusBar";
import CookieConsent from "@/components/CookieConsent";
import JsonLd from "@/components/seo/JsonLd";
import type { JsonLdObject } from "@/lib/structured-data";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";
const LOGO_URL = `${SITE_URL}/images/logo.png`;

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
    images: [
      {
        url: `${SITE_URL}/images/og-default.png`,
        width: 1200,
        height: 630,
        alt: "HOJYO CAME — 防犯カメラ導入×補助金活用ポータル",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@HOJYOCAME",
    title: "HOJYO CAME | 防犯カメラ補助金を業種から検索",
    description: "設備導入に使える補助金を業種から無料で検索。マルチック対応6都県に特化。",
    images: [`${SITE_URL}/images/og-default.png`],
  },
  alternates: { canonical: SITE_URL },
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
        <StatusBar />
        <CookieConsent />
      </body>
    </html>
  );
}
