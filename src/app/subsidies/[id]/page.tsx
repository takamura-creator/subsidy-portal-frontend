import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateGovernmentServiceJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
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

  // 補助金共通FAQ（リッチリザルト対応）
  const isJichikai = subsidy.target_industries?.includes("自治会・町会");
  const faqItems = isJichikai
    ? [
        {
          question: `${subsidy.name}は誰が申請できますか？`,
          answer:
            "自治会・町内会・商店街等の地域団体が申請主体となります。個人・営利企業からの直接申請は対象外のケースが大半です。",
        },
        {
          question: "公道以外（私有地内）への設置でも対象になりますか？",
          answer:
            "多くの自治体では公道や公園など不特定多数が通行する公共空間の撮影が要件です。私有地のみの撮影は原則対象外です。",
        },
        {
          question: "申請までに何を準備すればよいですか？",
          answer:
            "①警察署との事前協議 ②自治会総会での承認決議 ③周辺住民・地権者の同意取得 ④複数業者からの見積もり が共通の必須要件です。",
        },
        {
          question: "施工はマルチックに依頼できますか？",
          answer:
            "はい。湘南エリアでの自治会向け施工実績が9件あります。事前協議〜申請〜施工までトータルでサポートいたします。",
        },
      ]
    : [
        {
          question: `${subsidy.name}の対象業種を教えてください`,
          answer:
            (subsidy.target_industries ?? []).length > 0
              ? `${subsidy.target_industries.join("、")}が対象です。詳細は所管機関の公式情報をご確認ください。`
              : "詳細は所管機関の公式情報をご確認ください。",
        },
        {
          question: "申請から交付までの期間はどれくらいですか？",
          answer:
            "おおむね申請から交付決定まで1〜2ヶ月、工事完了後の実績報告から支払いまでさらに1〜2ヶ月が目安です。",
        },
        {
          question: "施工はマルチックに依頼できますか？",
          answer:
            "東京都・神奈川県・静岡県・埼玉県・千葉県・山梨県の6都県でマルチックが直接施工対応します。それ以外の地域はご相談ください。",
        },
      ];

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
    generateFaqJsonLd(faqItems),
  ];

  return (
    <>
      <JsonLd data={jsonLdBlocks} id="jsonld-subsidy-detail" />
      <SubsidyDetailClient subsidy={subsidy} />
    </>
  );
}
