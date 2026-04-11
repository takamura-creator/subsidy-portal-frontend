/**
 * 構造化データ（JSON-LD）ヘルパー
 *
 * Google検索のリッチリザルト対応
 * 参照: https://developers.google.com/search/docs/appearance/structured-data
 */

/** FAQPage JSON-LD — Google FAQ リッチリザルト用 */
export function generateFaqJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
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

/** LocalBusiness JSON-LD（将来用） */
export function generateLocalBusinessJsonLd(data: {
  name: string;
  description: string;
  url: string;
  address?: { region: string; country: string };
}) {
  return {
    "@context": "https://schema.org",
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
