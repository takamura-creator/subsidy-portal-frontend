import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateWebApplicationJsonLd } from "@/lib/structured-data";
import HeroStage from "@/components/home/HeroStage";
import TrustBlock from "@/components/home/TrustBlock";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";

export const metadata: Metadata = {
  title: "HOJYO CAME — 防犯カメラ導入×補助金活用ポータル",
  description:
    "HOJYO CAMEは診断から申請書類まで完結できる、防犯カメラ向けの補助金検索＆見積もりサービス。業種と都道府県を選ぶだけで、条件に合う補助金をご案内します。",
  openGraph: {
    title: "HOJYO CAME — 防犯カメラ導入×補助金活用ポータル",
    description:
      "HOJYO CAMEは診断から申請書類まで完結できる、防犯カメラ向けの補助金検索＆見積もりサービス。業種と都道府県を選ぶだけで、条件に合う補助金をご案内します。",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

const homeJsonLd = generateWebApplicationJsonLd({
  name: "HOJYO CAME",
  description:
    "診断から申請書類まで完結できる、防犯カメラ向けの補助金検索・見積もりサービス。",
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
});

export default function HomePage() {
  return (
    <main className="home-welcome">
      <JsonLd data={homeJsonLd} id="jsonld-home" />
      <HeroStage />
      <div className="home-trust-wrap">
        <TrustBlock />
      </div>
    </main>
  );
}
