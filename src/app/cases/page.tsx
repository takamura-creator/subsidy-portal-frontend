import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateCollectionPageJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/structured-data";
import {
  CASES_DISCLAIMER,
  listPublishedCases,
  type CaseStudy,
} from "@/data/cases";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojokin-portal.jp";
const PAGE_PATH = "/cases";

export const metadata: Metadata = {
  title: "防犯カメラ補助金の導入事例 | HOJYO CAME",
  description:
    "HOJYO CAMEで補助金を活用して防犯カメラを導入した企業の事例を、業種・補助金・台数・費用の事実ベースでご紹介します。",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "防犯カメラ補助金の導入事例 | HOJYO CAME",
    description:
      "業種・補助金・台数・費用を事実ベースで掲載。匿名化サンプルを含みます。",
    type: "website",
  },
};

const PACKAGE_LABEL: Record<CaseStudy["package"], string> = {
  economy: "エコノミー",
  standard: "スタンダード",
  premium: "プレミアム",
  large: "大規模",
};

export default function CasesListPage() {
  const cases = listPublishedCases();

  const listJsonLd = generateCollectionPageJsonLd({
    name: "HOJYO CAME 導入事例",
    description:
      "補助金を活用した防犯カメラ導入の事例一覧（匿名化サンプルを含む）",
    url: `${SITE_URL}${PAGE_PATH}`,
    items: cases.map((c) => ({
      name: c.title,
      url: `${SITE_URL}${PAGE_PATH}/${c.id}`,
    })),
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "HOJYO CAME", url: SITE_URL },
    { name: "導入事例", url: `${SITE_URL}${PAGE_PATH}` },
  ]);

  return (
    <main className="bg-bg min-h-screen">
      <JsonLd data={[listJsonLd, breadcrumbJsonLd]} id="jsonld-cases-list" />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-[1100px] mx-auto px-6 py-14 md:py-16">
          <p className="text-[12px] font-medium tracking-widest text-white/60 mb-3">
            CASES
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
          >
            防犯カメラ補助金の導入事例
          </h1>
          <p className="text-white/80 text-[14px] md:text-[15px] leading-relaxed max-w-[760px]">
            補助金を活用して防犯カメラを導入した企業の事例を、業種・補助金・台数・費用の事実ベースで掲載しています。
            数値は当該案件のもので、他案件の結果を保証するものではありません。
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white border-b border-border">
        <div className="max-w-[1100px] mx-auto px-6 py-5">
          <p className="text-[12px] text-text-muted leading-relaxed">
            {CASES_DISCLAIMER}
          </p>
        </div>
      </section>

      {/* 一覧 */}
      <section className="py-14">
        <div className="max-w-[1100px] mx-auto px-6">
          {cases.length === 0 ? (
            <p className="text-[14px] text-text-muted">
              公開済みの事例はまだありません。顧客同意後に順次掲載します。
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {cases.map((c) => (
                <CaseCard key={c.id} data={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-border py-12">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2
            className="text-xl font-bold text-navy mb-3"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            ご自身の条件で使える補助金を調べる
          </h2>
          <p className="text-[13px] text-text-muted mb-5 leading-relaxed">
            業種・所在地・導入目的を入力すると、候補となる補助金と参考見積もりをご案内します。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/match"
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
            >
              補助金を診断する
            </Link>
            <Link
              href="/partners/multik"
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] border-2 border-primary bg-white text-primary font-semibold hover:bg-[var(--hc-primary-subtle)] transition"
            >
              施工パートナーを見る
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CaseCard({ data }: { data: CaseStudy }) {
  return (
    <Link
      href={`${PAGE_PATH}/${data.id}`}
      className="block bg-white border border-border rounded-[10px] p-5 hover:border-primary transition-colors"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] bg-accent-light text-[color:var(--hc-accent)] px-2 py-0.5 rounded-full font-semibold">
          {data.prefecture}
        </span>
        <span className="text-[11px] bg-bg border border-border text-text-muted px-2 py-0.5 rounded-full">
          {data.industry}
        </span>
        <span className="text-[11px] bg-bg border border-border text-text-muted px-2 py-0.5 rounded-full">
          {PACKAGE_LABEL[data.package]} {data.cameraCount}台
        </span>
      </div>
      <h2
        className="font-bold text-navy text-[15px] mb-2 leading-snug"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {data.title}
      </h2>
      <p className="text-[13px] text-text-muted leading-relaxed mb-4 line-clamp-3">
        {data.summary}
      </p>
      <dl className="grid grid-cols-3 gap-2 text-[11px] text-text-muted border-t border-border pt-3">
        <div>
          <dt>補助金</dt>
          <dd className="text-navy font-medium text-[12px] mt-0.5 line-clamp-1">
            {data.subsidyName}
          </dd>
        </div>
        <div>
          <dt>総費用（税抜）</dt>
          <dd className="text-navy font-medium text-[12px] mt-0.5">
            {data.totalCost.toLocaleString("ja-JP")}円
          </dd>
        </div>
        <div>
          <dt>自己負担</dt>
          <dd className="text-primary font-bold text-[12px] mt-0.5">
            {data.selfPayment.toLocaleString("ja-JP")}円
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] text-text-muted text-right">
        完了: {data.completedAt}
      </p>
    </Link>
  );
}
