import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "HOJYO CAME — 防犯カメラ導入×補助金活用ポータル",
  description:
    "HOJYO CAMEは診断から申請書類まで完結できる、防犯カメラの補助金ポータル。業種と都道府県を選ぶだけで、最適な補助金をご案内します。",
  openGraph: {
    title: "HOJYO CAME — 防犯カメラ導入×補助金活用ポータル",
    description:
      "HOJYO CAMEは診断から申請書類まで完結できる、防犯カメラの補助金ポータル。業種と都道府県を選ぶだけで、最適な補助金をご案内します。",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="home-welcome">
      <div className="stage">
        <Image
          className="turtle"
          src="/images/turtle_wave.png"
          alt="HOJYO CAME キャラクター"
          width={112}
          height={112}
          priority
        />
        <h1>
          HOJYO<span className="came">CAME</span>
        </h1>
        <p className="lede">
          診断から申請書類まで完結できる、防犯カメラの補助金ポータル。
        </p>
        <Link href="/match" className="cta-primary">
          無料で補助金を診断する →
        </Link>
        <p className="support-line">
          無料・登録不要 / 約30秒 / 全国の補助金を横断
        </p>
      </div>
    </main>
  );
}
