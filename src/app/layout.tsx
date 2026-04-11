import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingUI from "@/components/FloatingUI";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojokin-portal.jp";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "補助金ポータル | 防犯カメラ導入の補助金をAIが無料診断",
    template: "%s | 補助金ポータル",
  },
  description:
    "防犯カメラ導入に使える補助金をAIが無料診断。全47都道府県・多数の補助金データ対応。業種・規模に合わせた最適な補助金をご提案します。",
  keywords: ["防犯カメラ", "補助金", "IT導入補助金", "監視カメラ", "助成金", "補助金診断"],
  openGraph: {
    title: "補助金ポータル | 防犯カメラ導入の補助金をAIが無料診断",
    description: "防犯カメラ導入に使える補助金をAIが無料診断。全47都道府県対応。",
    siteName: "補助金ポータル",
    locale: "ja_JP",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "補助金ポータル | 防犯カメラ導入の補助金をAIが無料診断",
    description: "防犯カメラ導入に使える補助金をAIが無料診断。全47都道府県対応。",
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingUI />
      </body>
    </html>
  );
}
