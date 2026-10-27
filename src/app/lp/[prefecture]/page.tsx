import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchSubsidies } from "@/lib/api";
import { PREFECTURES, isServicePrefecture } from "@/lib/constants";
import { isValidPrefectureName, romanSlugToLpPath } from "@/lib/prefectureLp";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateFaqJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/structured-data";
import { getPrefectureContent } from "@/data/prefecture-content";
import { getVerifiedLpSubsidies } from "@/data/lp-verified-subsidies";
import FullLP from "@/components/lp/FullLP";
import InformationLP from "@/components/lp/InformationLP";

// C2（2026-07-20・Phase6差戻し）: FullLP/InformationLP/SubsidyList を
// src/components/lp/ 配下へ切り出し。本ファイルはルーティング＋metadata＋データ取得のみ（500行以内）。
// 挙動は変更していない（純粋リファクタ）。

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";

type Props = {
  params: Promise<{ prefecture: string }>;
};

export function generateStaticParams() {
  // 47都道府県すべてを SSG 対象に拡張（2026-05-26）。
  // Next.js 16 は内部で URL エンコードするため、generateStaticParams では**生の文字列**を返す。
  // 旧 `encodeURIComponent(p)` を返すと二重エンコードされ、page 内の `decodeURIComponent(prefecture)`
  // でも復号が1層しか進まず `name = "%E6%9D%..."` になる（FAQPage 差込失敗の原因）。
  return PREFECTURES.map((p) => ({ prefecture: p }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture } = await params;
  const name = decodeURIComponent(prefecture);
  // 47都道府県以外（例: /lp/kanagawa）はページ本体が 404 にするので、ここでも索引させない
  if (!isValidPrefectureName(name)) {
    return { title: "ページが見つかりません", robots: { index: false, follow: false } };
  }
  // 確認台帳に制度が1件も無い都道府県は、施工対応エリアでも本文が薄いので索引させない（2026-10-27 審査[10]）
  const inService = isServicePrefecture(name) && getVerifiedLpSubsidies(name).length > 0;
  // 県別コンテンツ（src/data/prefecture-content.ts）に SEO タイトル/説明文が定義済みの県は
  // それを優先利用（品質差解消・2026-07-20）。未定義県は従来のハードコード文言へフォールバック。
  const content = getPrefectureContent(name);

  if (inService) {
    return {
      // C1（2026-07-20・ペッパー裁定でスコープ入り）: title.absolute でroot layoutの
      // title.template（"%s — HOJYO CAME"）を無効化。seoTitle側に既に「| HOJYO CAME」が
      // 含まれるため、template適用による二重サフィックスを解消（layout.tsx自体は無変更）。
      title: {
        absolute:
          content?.seoTitle ?? `${name}の防犯カメラ補助金＋見積もり | HOJYO CAME`,
      },
      description:
        content?.seoDescription ??
        `${name}で使える防犯カメラ導入の補助金・助成金を一覧で確認。AVTECH日本正規代理店マルチック株式会社による直接施工対応エリア。業種別検索・見積書自動生成まで無料で利用可能。`,
      alternates: { canonical: `/lp/${prefecture}` },
      openGraph: { type: "website" },
    };
  }

  return {
    title: {
      absolute:
        content?.seoTitle ?? `${name}の防犯カメラ補助金まとめ | HOJYO CAME`,
    },
    description:
      content?.seoDescription ??
      `${name}で利用できる防犯カメラ設置の補助金・助成金情報。制度名・上限額・締切・公式制度リンクを事実ベースでまとめています。`,
    alternates: { canonical: `/lp/${prefecture}` },
    // 施工対応外41県は near-duplicate（本文が県間でほぼ同一）のためnoindex（followは維持=内部リンク evaluation継続）。
    // 施工対応6都県は上のinService分岐（robots未指定→layout.tsxの既定 index:true, follow:true を継承）のため、
    // ここを noindex にしても6都県には一切影響しない（可逆: エリア拡大時はここを削除すれば復元）。
    robots: { index: false, follow: true },
    openGraph: { type: "article" },
  };
}

export default async function PrefectureLPPage({ params }: Props) {
  const { prefecture } = await params;
  const name = decodeURIComponent(prefecture);

  // ローマ字スラッグ → 日本語正式URL へ 301 リダイレクト
  // （ドキュメント要求は proxy が本物の 308 で返す。ここはクライアント遷移などの保険）
  const romanPath = romanSlugToLpPath(name);
  if (romanPath) permanentRedirect(romanPath);

  // 47都道府県以外は 404（攻撃的なパスや誤入力を拒否）
  if (!isValidPrefectureName(name)) notFound();
  // 6都県は FullLP（施工対応）、それ以外41道府県は InformationLP（情報のみ）
  const inService = isServicePrefecture(name);

  // 2026-10-27: LP の制度リストは確認台帳（src/data/lp-verified-subsidies.ts）から出す。
  // API はサイト内の制度ページ（/subsidies/{id}）が実在するかの確認にだけ使う（無い id へはリンクしない）。
  let availableIds: ReadonlySet<string> = new Set();
  try {
    const subsidyData = await fetchSubsidies({ prefecture: name });
    availableIds = new Set((subsidyData.subsidies ?? []).map((s) => s.id));
  } catch {
    // バックエンド不在時はサイト内リンクを出さない（出典リンクと台帳の内容は表示する）
    availableIds = new Set();
  }

  const content = getPrefectureContent(name);
  const faqs = content?.faqs ?? [];
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "HOJYO CAME", url: SITE_URL },
    { name: "補助金LP", url: `${SITE_URL}/subsidies` },
    { name: `${name}の補助金`, url: `${SITE_URL}/lp/${encodeURIComponent(name)}` },
  ]);
  const faqLd = faqs.length > 0 ? generateFaqJsonLd(faqs) : null;

  return (
    <>
      <JsonLd data={breadcrumbLd} id={`jsonld-lp-breadcrumb-${encodeURIComponent(name)}`} />
      {faqLd && (
        <JsonLd data={faqLd} id={`jsonld-lp-faq-${encodeURIComponent(name)}`} />
      )}
      {inService ? (
        <FullLP prefecture={name} availableIds={availableIds} />
      ) : (
        <InformationLP prefecture={name} availableIds={availableIds} />
      )}
    </>
  );
}
