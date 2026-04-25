import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateGovernmentServiceJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/structured-data";
import {
  getAllSubsidyIds,
  getSubsidyById,
} from "@/lib/subsidies-server";
import SubsidyDetailClient from "./SubsidyDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojokin-portal.jp";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Sprint 4 Task 0: `/subsidies/[id]` を Server Component 化し、
 * ビルド時に `backend/data/subsidies.json` から全補助金を SSG。
 *
 * - ダミーデータ（旧 Client Component のフォールバック値）を廃止し、Googlebot が誤値で
 *   インデックスしていた問題を解消
 * - JSON-LD は正しい補助金データで出力される
 * - クライアントインタラクション（目次 active / チェックリスト state）は
 *   `SubsidyDetailClient.tsx` に分離
 */
export async function generateStaticParams() {
  return getAllSubsidyIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const subsidy = getSubsidyById(id);
  if (!subsidy) {
    return {
      title: "補助金が見つかりません",
      robots: { index: false, follow: false },
    };
  }
  const description =
    subsidy.description?.slice(0, 120) ??
    `${subsidy.name}の制度概要・対象要件・補助額・申請方法をまとめています。`;
  return {
    title: `${subsidy.name} | HOJYO CAME`,
    description,
    alternates: { canonical: `/subsidies/${subsidy.id}` },
    openGraph: {
      title: `${subsidy.name}`,
      description,
      type: "article",
    },
  };
}

export default async function SubsidyDetailPage({ params }: Props) {
  const { id } = await params;
  const subsidy = getSubsidyById(id);
  if (!subsidy) {
    notFound();
  }

  const jsonLdBlocks = [
    generateGovernmentServiceJsonLd({
      name: subsidy.name,
      description: subsidy.description || `${subsidy.name}の制度概要`,
      url: `${SITE_URL}/subsidies/${subsidy.id}`,
      ministry: subsidy.ministry || "公的機関",
      areaServed: subsidy.prefecture || "全国",
      termsOfService: subsidy.source_url || undefined,
    }),
    generateBreadcrumbJsonLd([
      { name: "HOJYO CAME", url: SITE_URL },
      { name: "補助金一覧", url: `${SITE_URL}/subsidies` },
      { name: subsidy.name, url: `${SITE_URL}/subsidies/${subsidy.id}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLdBlocks} id="jsonld-subsidy-detail" />
      <SubsidyDetailClient subsidy={subsidy} />
    </>
  );
}
