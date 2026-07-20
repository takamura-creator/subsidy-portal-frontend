import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchSubsidies, type Subsidy } from "@/lib/api";
import { PREFECTURES, isServicePrefecture } from "@/lib/constants";
import { sortLocalFirst } from "@/lib/subsidyFilters";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateFaqJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/structured-data";
import { getPrefectureContent } from "@/data/prefecture-content";
import FullLP from "@/components/lp/FullLP";
import InformationLP from "@/components/lp/InformationLP";

// C2（2026-07-20・Phase6差戻し）: FullLP/InformationLP/SubsidyList を
// src/components/lp/ 配下へ切り出し。本ファイルはルーティング＋metadata＋データ取得のみ（500行以内）。
// 挙動は変更していない（純粋リファクタ）。

const VALID_PREFECTURES = new Set<string>(PREFECTURES);

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
  const inService = isServicePrefecture(name);
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

/** ローマ字スラッグ → 日本語正式URL 301リダイレクトマップ（全47都道府県・標準ヘボン式） */
const ROMAN_TO_JP: Record<string, string> = {
  tokyo:     "東京都",
  osaka:     "大阪府",
  kanagawa:  "神奈川県",
  aichi:     "愛知県",
  saitama:   "埼玉県",
  hyogo:     "兵庫県",
  hokkaido:  "北海道",
  fukuoka:   "福岡県",
  chiba:     "千葉県",
  kyoto:     "京都府",
  aomori:    "青森県",
  iwate:     "岩手県",
  miyagi:    "宮城県",
  akita:     "秋田県",
  yamagata:  "山形県",
  fukushima: "福島県",
  ibaraki:   "茨城県",
  tochigi:   "栃木県",
  gunma:     "群馬県",
  niigata:   "新潟県",
  toyama:    "富山県",
  ishikawa:  "石川県",
  fukui:     "福井県",
  yamanashi: "山梨県",
  nagano:    "長野県",
  gifu:      "岐阜県",
  shizuoka:  "静岡県",
  mie:       "三重県",
  shiga:     "滋賀県",
  nara:      "奈良県",
  wakayama:  "和歌山県",
  tottori:   "鳥取県",
  shimane:   "島根県",
  okayama:   "岡山県",
  hiroshima: "広島県",
  yamaguchi: "山口県",
  tokushima: "徳島県",
  kagawa:    "香川県",
  ehime:     "愛媛県",
  kochi:     "高知県",
  saga:      "佐賀県",
  nagasaki:  "長崎県",
  kumamoto:  "熊本県",
  oita:      "大分県",
  miyazaki:  "宮崎県",
  kagoshima: "鹿児島県",
  okinawa:   "沖縄県",
};

export default async function PrefectureLPPage({ params }: Props) {
  const { prefecture } = await params;
  const name = decodeURIComponent(prefecture);

  // ローマ字スラッグ → 日本語正式URL へ 301 リダイレクト
  if (ROMAN_TO_JP[name]) {
    permanentRedirect(`/lp/${encodeURIComponent(ROMAN_TO_JP[name])}`);
  }

  // 47都道府県以外は 404（攻撃的なパスや誤入力を拒否）
  if (!VALID_PREFECTURES.has(name)) notFound();
  // 6都県は FullLP（施工対応）、それ以外41道府県は InformationLP（情報のみ）
  const inService = isServicePrefecture(name);

  let subsidies: Subsidy[] = [];
  try {
    const subsidyData = await fetchSubsidies({ prefecture: name });
    subsidies = subsidyData.subsidies ?? [];
  } catch {
    // C2: バックエンド不在時のみ空配列フォールバック。他のエラーは握り潰さない（ビルド時限定）。
    subsidies = [];
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
        // 6都県のみ「県・市区町村固有の制度→全国制度」に並べ替え（表示件数は不変）。
        // 41道府県のInformationLPは意図的に元の順序のまま（挙動を変えない・2026-07-20）。
        <FullLP prefecture={name} subsidies={sortLocalFirst(subsidies)} />
      ) : (
        <InformationLP prefecture={name} subsidies={subsidies} />
      )}
    </>
  );
}
