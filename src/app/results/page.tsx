import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateDatasetJsonLd, generateBreadcrumbJsonLd } from "@/lib/structured-data";
import { SERVICE_PREFECTURES } from "@/lib/constants";
import ResultsClient from "./ResultsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";

export const metadata: Metadata = {
  title: "補助金交付実績データベース",
  description:
    "官公庁が公表した防犯カメラ・監視カメラ向け補助金の交付実績を、都道府県・年度・カテゴリ別に閲覧できるデータベースです。",
  alternates: { canonical: "/results" },
};

/**
 * /results — サーバーコンポーネント
 *
 * SEO対策: h1・説明文をSSRで初期HTMLに埋め込み、
 * クライアントデータ取得は ResultsClient に委譲。
 * Google のソフト404判定を回避する。
 * レイアウト: ResultsSidebar（SidebarLayout）が外殻を担当。
 *
 * AEO Phase 5: Dataset JSON-LD（官公庁公表データの引用元）＋ BreadcrumbList を追加。
 */
export default function ResultsPage() {
  const jsonLdBlocks = [
    generateDatasetJsonLd({
      name: "補助金交付実績データベース",
      description:
        "官公庁が公表した防犯カメラ・監視カメラ向け補助金の交付実績データ。都道府県・年度・カテゴリ別に閲覧可能。",
      url: `${SITE_URL}/results`,
      creator: "マルチック株式会社",
      keywords: ["防犯カメラ補助金", "交付実績", ...SERVICE_PREFECTURES],
    }),
    generateBreadcrumbJsonLd([
      { name: "HOJYO CAME", url: SITE_URL },
      { name: "交付実績データベース", url: `${SITE_URL}/results` },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLdBlocks} id="jsonld-results" />
      {/* SEO header — サーバーサイドで確実に配信 */}
      <header className="pt-6 pb-8 text-center">
        <h1
          className="text-2xl md:text-3xl font-bold mb-3 [font-family:'Sora',sans-serif] text-[var(--hc-navy)] tracking-[-0.5px]"
        >
          補助金交付実績データベース
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl mx-auto mb-2 text-[var(--hc-text-muted)]">
          官公庁が公表した防犯カメラ・監視カメラ向け補助金の交付実績を、都道府県・年度・カテゴリ別に閲覧できるデータベースです。
          公的機関の公表情報に基づき、透明性の確保を目的としています。
        </p>
        <p className="text-xs text-[var(--hc-text-muted)]">
          対象補助金: IT導入補助金 / ものづくり補助金 / 事業再構築補助金 / 持続化補助金 / 省エネ補助金
        </p>
        <p className="text-xs mt-1 text-[var(--hc-text-muted)]">
          対象エリア: 全国（東京都・神奈川県・千葉県・埼玉県・静岡県・山梨県は詳細データあり）
        </p>
      </header>

      {/* クライアントコンポーネント — API取得・インタラクション */}
      <ResultsClient />
    </>
  );
}
