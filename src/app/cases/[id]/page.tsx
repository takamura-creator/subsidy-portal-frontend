import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/structured-data";
import {
  CASES_DISCLAIMER,
  CASE_STUDIES,
  getCaseById,
  listPublishedCases,
  type CaseStudy,
} from "@/data/cases";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojokin-portal.jp";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return CASE_STUDIES.filter((c) => c.status !== "draft").map((c) => ({
    id: c.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = getCaseById(id);
  if (!data) {
    return {
      title: "導入事例 | HOJYO CAME",
      robots: { index: false },
    };
  }
  return {
    title: `${data.title} | HOJYO CAME 導入事例`,
    description: data.summary,
    alternates: { canonical: `/cases/${data.id}` },
    openGraph: {
      title: data.title,
      description: data.summary,
      type: "article",
    },
  };
}

const PACKAGE_LABEL: Record<CaseStudy["package"], string> = {
  economy: "エコノミー",
  standard: "スタンダード",
  premium: "プレミアム",
  large: "大規模",
};

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const data = getCaseById(id);
  if (!data || data.status === "draft") {
    notFound();
  }

  const url = `${SITE_URL}/cases/${data.id}`;
  const articleJsonLd = generateArticleJsonLd({
    headline: data.title,
    description: data.summary,
    url,
    datePublished: toIsoMonth(data.completedAt),
    dateModified: data.updatedAt,
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "HOJYO CAME", url: SITE_URL },
    { name: "導入事例", url: `${SITE_URL}/cases` },
    { name: data.title, url },
  ]);

  const related = listPublishedCases()
    .filter((c) => c.id !== data.id)
    .slice(0, 3);

  return (
    <main className="bg-bg min-h-screen">
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} id="jsonld-case-detail" />

      {/* Breadcrumb */}
      <nav
        aria-label="パンくずリスト"
        className="bg-white border-b border-border"
      >
        <div className="max-w-[900px] mx-auto px-6 py-3 text-[12px] text-text-muted">
          <Link href="/" className="hover:text-primary">
            トップ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cases" className="hover:text-primary">
            導入事例
          </Link>
          <span className="mx-2">/</span>
          <span aria-current="page" className="text-text">
            {data.title}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-[900px] mx-auto px-6 py-12 md:py-14">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] bg-accent-light text-[color:var(--hc-accent)] px-2 py-0.5 rounded-full font-semibold">
              {data.prefecture}
            </span>
            <span className="text-[11px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
              {data.industry}
            </span>
            <span className="text-[11px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
              {PACKAGE_LABEL[data.package]} {data.cameraCount}台
            </span>
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: "'Sora', sans-serif",
              letterSpacing: "-0.3px",
            }}
          >
            {data.title}
          </h1>
          <p className="text-white/80 text-[14px] md:text-[15px] leading-relaxed">
            {data.summary}
          </p>
        </div>
      </section>

      {/* 費用サマリー */}
      <section className="bg-white border-b border-border">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          <h2
            className="text-[14px] font-bold text-navy mb-3"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            費用内訳
          </h2>
          <div className="grid grid-cols-3 gap-3 text-[13px]">
            <CostCell label="総費用（税抜）" value={data.totalCost} />
            <CostCell
              label="補助金適用"
              value={-data.subsidyAmount}
              accent
            />
            <CostCell label="自己負担（試算）" value={data.selfPayment} highlight />
          </div>
          <p className="mt-3 text-[11px] text-text-muted leading-relaxed">
            完了月: {data.completedAt} ／ 補助金: {data.subsidyName}
          </p>
        </div>
      </section>

      {/* 導入前 → 導入後 */}
      <section className="py-10 bg-bg">
        <div className="max-w-[900px] mx-auto px-6 grid md:grid-cols-2 gap-4">
          <article className="bg-white border border-border rounded-[10px] p-5">
            <h3
              className="text-[13px] font-bold text-text-muted mb-2 tracking-widest"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              BEFORE — 導入前の状況
            </h3>
            <p className="text-[14px] text-text leading-relaxed whitespace-pre-wrap">
              {data.beforeDescription}
            </p>
          </article>
          <article className="bg-white border border-primary/40 rounded-[10px] p-5">
            <h3
              className="text-[13px] font-bold text-primary mb-2 tracking-widest"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              AFTER — 導入後の状況
            </h3>
            <p className="text-[14px] text-text leading-relaxed whitespace-pre-wrap">
              {data.afterDescription}
            </p>
          </article>
        </div>
      </section>

      {/* お客様の声 */}
      {data.testimonial && (
        <section className="py-8 bg-white">
          <div className="max-w-[900px] mx-auto px-6">
            <blockquote className="border-l-4 border-primary pl-4 text-[14px] text-text leading-relaxed">
              「{data.testimonial}」
              <footer className="mt-2 text-[12px] text-text-muted">
                — {data.industry} {data.prefecture}（匿名）
              </footer>
            </blockquote>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="py-6 bg-bg border-t border-border">
        <div className="max-w-[900px] mx-auto px-6">
          <p className="text-[11px] text-text-muted leading-relaxed">
            {CASES_DISCLAIMER}
          </p>
        </div>
      </section>

      {/* 関連事例 */}
      {related.length > 0 && (
        <section className="py-10 bg-white border-t border-border">
          <div className="max-w-[1100px] mx-auto px-6">
            <h2
              className="text-[16px] font-bold text-navy mb-4"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              ほかの事例
            </h2>
            <ul className="grid md:grid-cols-3 gap-3 text-[13px]">
              {related.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/cases/${c.id}`}
                    className="block bg-bg border border-border rounded-[10px] p-4 hover:border-primary transition-colors"
                  >
                    <p className="text-[11px] text-text-muted mb-1">
                      {c.prefecture} / {c.industry}
                    </p>
                    <p className="font-semibold text-navy line-clamp-2">
                      {c.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-navy text-white py-12">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2
            className="text-xl font-bold mb-3"
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
          >
            ご自身の条件で補助金を調べてみる
          </h2>
          <p className="text-white/75 text-[13px] mb-6 leading-relaxed">
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
              href="/my/wizard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] border-2 border-white/70 bg-transparent text-white font-semibold hover:bg-white/10 transition"
            >
              見積もりウィザードへ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CostCell({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: number;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="bg-bg border border-border rounded-[10px] p-4">
      <p className="text-[11px] text-text-muted mb-1">{label}</p>
      <p
        className={`text-[16px] font-bold ${
          accent
            ? "text-[color:var(--hc-accent)]"
            : highlight
              ? "text-primary"
              : "text-navy"
        }`}
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {value < 0 ? "-" : ""}
        {Math.abs(value).toLocaleString("ja-JP")}円
      </p>
    </div>
  );
}

function toIsoMonth(yyyymm: string): string {
  // "2025-11" -> "2025-11-01"（Article.datePublished に必要な有効日付形式）
  if (/^\d{4}-\d{2}$/.test(yyyymm)) return `${yyyymm}-01`;
  return yyyymm;
}
