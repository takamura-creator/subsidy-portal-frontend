/**
 * 構造化データ（JSON-LD）ヘルパー
 *
 * Google検索のリッチリザルト対応
 * 参照: https://developers.google.com/search/docs/appearance/structured-data
 *
 * 使用方針:
 * - Schema.org の公式型を正しく使うこと
 * - `@context` は常に `https://schema.org`
 * - 値が空・不明の場合はそのキーを出さない（空文字列は入れない）
 * - 出力前に `JSON.stringify` で文字列化するのは呼び出し側（`JsonLd` コンポーネント）の責務
 */

const SCHEMA_CONTEXT = "https://schema.org";

const MULTIK_ORGANIZATION = {
  "@type": "Organization",
  name: "マルチック株式会社",
  url: "https://multik.jp",
  email: "contact@multik.jp",
} as const;

export interface JsonLdObject {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

/** FAQPage JSON-LD — Google FAQ リッチリザルト用 */
export function generateFaqJsonLd(
  faqs: { question: string; answer: string }[],
): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** LocalBusiness JSON-LD（partners/multik で使用） */
export function generateLocalBusinessJsonLd(data: {
  name: string;
  description: string;
  url: string;
  address?: { region: string; country: string };
}): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "LocalBusiness",
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.address && {
      address: {
        "@type": "PostalAddress",
        addressRegion: data.address.region,
        addressCountry: data.address.country,
      },
    }),
  };
}

/** WebApplication JSON-LD — トップページで使用 */
export function generateWebApplicationJsonLd(data: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebApplication",
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: data.applicationCategory ?? "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    provider: MULTIK_ORGANIZATION,
  };
}

/** GovernmentService JSON-LD — 補助金詳細で使用 */
export function generateGovernmentServiceJsonLd(data: {
  name: string;
  description: string;
  url: string;
  ministry: string;
  areaServed?: string;
  termsOfService?: string;
}): JsonLdObject {
  const provider: JsonLdObject["provider"] = {
    "@type": "GovernmentOrganization",
    name: data.ministry,
  };
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "GovernmentService",
    name: data.name,
    description: data.description,
    url: data.url,
    serviceType: "補助金",
    provider,
    ...(data.areaServed && { areaServed: data.areaServed }),
    ...(data.termsOfService && { termsOfService: data.termsOfService }),
  };
}

/** Article JSON-LD — 導入事例で使用 */
export function generateArticleJsonLd(data: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    url: data.url,
    author: MULTIK_ORGANIZATION,
    publisher: MULTIK_ORGANIZATION,
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
    ...(data.image && { image: data.image }),
  };
}

/** CollectionPage JSON-LD — /cases 一覧で使用 */
export function generateCollectionPageJsonLd(data: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string }[];
}): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "CollectionPage",
    name: data.name,
    description: data.description,
    url: data.url,
    hasPart: data.items.map((it) => ({
      "@type": "Article",
      name: it.name,
      url: it.url,
    })),
  };
}

/** BreadcrumbList JSON-LD — 導入事例詳細などで使用 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
