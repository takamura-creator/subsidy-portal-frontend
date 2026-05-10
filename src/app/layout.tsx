import type { Metadata, Viewport } from "next";
import HCHeader from "@/components/layout/HCHeader";
import StatusBar from "@/components/layout/StatusBar";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyo-came.jp";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "HOJYO CAME | 防犯カメラ補助金を業種から検索",
    description: "設備導入に使える補助金を業種から無料で検索。マルチック対応6都県に特化。",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

// ① viewport を明示設定（Next.js 15必須）— 未設定だと初回レンダリングで幅が誤判定される
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <HCHeader />
        {children}
        <StatusBar />
        <CookieConsent />
      </body>
    </html>
  );
}
