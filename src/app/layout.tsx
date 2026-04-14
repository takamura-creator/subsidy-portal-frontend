import type { Metadata } from "next";
import HCHeader from "@/components/layout/HCHeader";
import StatusBar from "@/components/layout/StatusBar";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyo-came.jp";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HOJYO CAME | 工事費補助金をAIが無料診断",
    template: "%s | HOJYO CAME",
  },
  description:
    "防犯カメラ・設備導入に使える補助金をAIが無料診断。全47都道府県対応。業種・規模に合わせた最適な補助金をご提案します。",
  keywords: ["防犯カメラ", "補助金", "IT導入補助金", "監視カメラ", "助成金", "補助金診断", "HOJYO CAME"],
  openGraph: {
    title: "HOJYO CAME | 工事費補助金をAIが無料診断",
    description: "設備導入に使える補助金をAIが無料診断。全47都道府県対応。",
    siteName: "HOJYO CAME",
    locale: "ja_JP",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "HOJYO CAME | 工事費補助金をAIが無料診断",
    description: "設備導入に使える補助金をAIが無料診断。全47都道府県対応。",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
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
      </body>
    </html>
  );
}
