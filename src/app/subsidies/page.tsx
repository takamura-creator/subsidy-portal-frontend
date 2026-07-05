import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateItemListJsonLd } from "@/lib/structured-data";
import { getAllSubsidies } from "@/lib/subsidies-server";
import { filterCameraOnly } from "@/lib/subsidyFilters";
import SubsidiesBrowser from "./SubsidiesBrowser";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";

/**
 * subsidies/page.tsx — 補助金一覧（サーバーコンポーネント）
 *
 * SEO/AEO Phase 5: 従来 client only だった一覧を SSR 化し、クローラーに
 * 個別 metadata・ItemList JSON-LD・実データ埋め込み済み初期HTMLを配信する。
 * フィルタ/ソート/ライブfetch/フォールバックのインタラクションは
 * SubsidiesBrowser（client component）に完全移設・ロジック不変。
 *
 * `?industry=` はサーバー側の `searchParams` prop で受け取る（クライアント側
 * `useSearchParams` は Suspense 配下で SSR 出力をサスペンドさせ、クローラーに
 * 空HTMLを返してしまうため不使用。実装時の技術的補正・報告書に記載）。
 */
export const metadata: Metadata = {
  title: "補助金一覧",
  description:
    "防犯カメラ導入に使える補助金を、業種・地域・金額でしぼり込んで検索できます。マルチック対応6都県を中心に国・都道府県の補助金情報を掲載。",
  alternates: { canonical: "/subsidies" },
};

type Props = {
  searchParams: Promise<{ industry?: string }>;
};

export default async function SubsidiesPage({ searchParams }: Props) {
  const { industry: initialIndustry = "" } = await searchParams;

  const allSubsidies = getAllSubsidies();
  const allFiltered = filterCameraOnly(allSubsidies);
  const initialSubsidies = filterCameraOnly(allSubsidies, initialIndustry || undefined);

  const itemListJsonLd = generateItemListJsonLd(
    allFiltered.map((s) => ({
      name: s.name,
      url: `${SITE_URL}/subsidies/${s.id}`,
    })),
  );

  return (
    <>
      <JsonLd data={itemListJsonLd} id="jsonld-subsidies-list" />
      <SubsidiesBrowser initialSubsidies={initialSubsidies} initialIndustry={initialIndustry} />
    </>
  );
}
