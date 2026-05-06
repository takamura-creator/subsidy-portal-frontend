import Link from "next/link";
import type { Metadata } from "next";
import { fetchSubsidies, type Subsidy } from "@/lib/api";
import {
  PREFECTURES,
  SERVICE_PREFECTURES,
  isServicePrefecture,
} from "@/lib/constants";
import EmailCaptureForm from "@/components/leads/EmailCaptureForm";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateFaqJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/structured-data";
import { getPrefectureContent } from "@/data/prefecture-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojokin-portal.jp";

type Props = {
  params: Promise<{ prefecture: string }>;
};

export function generateStaticParams() {
  // Next.js 16 は内部で URL エンコードするため、generateStaticParams では**生の文字列**を返す。
  // 旧 `encodeURIComponent(p)` を返すと二重エンコードされ、page 内の `decodeURIComponent(prefecture)`
  // でも復号が1層しか進まず `name = "%E6%9D%..."` になる（FAQPage 差込失敗の原因）。
  return PREFECTURES.map((p) => ({ prefecture: p }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture } = await params;
  const name = decodeURIComponent(prefecture);
  const inService = isServicePrefecture(name);

  if (inService) {
    return {
      title: `${name}の防犯カメラ補助金＋見積もり | HOJYO CAME`,
      description: `${name}で使える防犯カメラ導入の補助金・助成金を一覧で確認。AVTECH日本正規代理店マルチック株式会社による直接施工対応エリア。AI診断・見積書自動生成まで無料で利用可能。`,
      alternates: { canonical: `/lp/${prefecture}` },
      openGraph: { type: "website" },
    };
  }

  return {
    title: `${name}の防犯カメラ補助金まとめ | HOJYO CAME`,
    description: `${name}で利用できる防犯カメラ設置の補助金・助成金情報。制度名・上限額・締切・公式制度リンクを事実ベースでまとめています。`,
    alternates: { canonical: `/lp/${prefecture}` },
    robots: { index: true, follow: true },
    openGraph: { type: "article" },
  };
}

export default async function PrefectureLPPage({ params }: Props) {
  const { prefecture } = await params;
  const name = decodeURIComponent(prefecture);
  const inService = isServicePrefecture(name);

  let subsidies: Subsidy[] = [];
  try {
    const subsidyData = await fetchSubsidies({ prefecture: name });
    subsidies = subsidyData.subsidies ?? [];
  } catch {
    // ビルド時にバックエンド不在の場合は空配列でフォールバック
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
        <FullLP prefecture={name} subsidies={subsidies} />
      ) : (
        <InformationLP prefecture={name} subsidies={subsidies} />
      )}
    </>
  );
}

/* ---------------- 6都県：フルLP ---------------- */

function FullLP({ prefecture, subsidies }: { prefecture: string; subsidies: Subsidy[] }) {
  const anchor = `${prefecture}で防犯カメラの補助金申請と施工をまとめて相談する`;
  return (
    <main>
      <section className="bg-navy text-white">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <p className="text-[12px] font-medium tracking-widest text-white/60 mb-3">
            {prefecture} ／ 施工対応エリア
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
          >
            {prefecture}の防犯カメラ補助金と見積もりをワンストップで
          </h1>
          <p className="text-white/80 text-[15px] md:text-base leading-relaxed max-w-[720px] mb-6">
            {prefecture}はマルチック株式会社（AVTECH日本正規代理店）の直接施工対応エリアです。
            補助金の絞り込み・AVTECH製品の構成・見積書PDFまで一連のウィザードで進められます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
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

      <SubsidyList
        heading={`${prefecture}で利用できる補助金・助成金`}
        subsidies={subsidies}
        emptyText={`${prefecture}で利用できる補助金は現在取得中です。全国制度も含めて`}
      />

      <section className="py-14 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2
            className="text-xl font-bold text-navy mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {prefecture}での導入フロー
          </h2>
          <ol className="grid md:grid-cols-3 gap-4">
            {[
              { step: "STEP 1", title: "AI補助金診断", desc: "業種・規模・導入目的を入力して候補を絞り込みます。" },
              { step: "STEP 2", title: "AVTECH製品で見積もり", desc: "ウィザードで構成と台数を選び、見積書PDFを出力できます。" },
              { step: "STEP 3", title: "マルチック施工", desc: `${prefecture}の現場へ直接お伺いし、施工・初期設定までワンストップ対応。` },
            ].map((f) => (
              <li key={f.step} className="bg-bg border border-border rounded-[10px] p-5">
                <p className="text-[11px] font-semibold tracking-widest text-[color:var(--hc-accent)]">
                  {f.step}
                </p>
                <p className="font-bold text-navy mt-1 mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {f.title}
                </p>
                <p className="text-[13px] text-text-muted leading-relaxed">{f.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14 bg-bg">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="bg-white border border-border rounded-[10px] p-6 md:p-8">
            <h2
              className="text-xl font-bold text-navy mb-2"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              施工パートナー：マルチック株式会社
            </h2>
            <p className="text-[14px] text-text-muted leading-relaxed mb-4">
              {prefecture}を含む6都県（東京・神奈川・静岡・埼玉・千葉・山梨）で直接施工対応。
              AVTECH Technology Corporation 日本正規代理店として、販売から現場施工までを一社で担当します。
            </p>
            <Link
              href="/partners/multik"
              className="inline-flex items-center text-[14px] text-primary font-semibold hover:underline"
            >
              {anchor} →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-navy text-white py-14">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
          >
            まずは{prefecture}で使える補助金を診断
          </h2>
          <p className="text-white/70 text-[14px] mb-6 leading-relaxed">
            ウィザードは無料です。営業電話は行いません（メール対応のみ）。
          </p>
          <Link
            href="/match"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
          >
            無料で診断する
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ---------------- 41道府県：情報LP ---------------- */

function InformationLP({ prefecture, subsidies }: { prefecture: string; subsidies: Subsidy[] }) {
  return (
    <main>
      <section className="bg-white border-b border-border">
        <div className="max-w-[900px] mx-auto px-6 py-14">
          <p className="text-[12px] font-medium tracking-widest text-text-muted mb-3">
            {prefecture} ／ 補助金情報
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold text-navy mb-4"
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
          >
            {prefecture}の防犯カメラ補助金まとめ
          </h1>
          <p className="text-[14px] text-text-muted leading-relaxed">
            {prefecture}で利用できる防犯カメラ設置に関する補助金・助成金の情報を、
            制度名・上限額・締切・公式制度リンクの事実ベースでまとめています。
            HOJYO CAMEの直接施工は現在6都県（東京・神奈川・静岡・埼玉・千葉・山梨）のみですが、
            補助金情報と制度解説は47都道府県の制度情報を掲載しています。
          </p>
        </div>
      </section>

      <SubsidyList
        heading={`${prefecture}で利用できる補助金・助成金`}
        subsidies={subsidies}
        emptyText={`${prefecture}で実在を確認できた制度は現在取得中です。近隣県の最新制度は`}
        hideRecipeCTA
      />

      <section className="py-14 bg-bg">
        <div className="max-w-[720px] mx-auto px-6">
          <h2
            className="text-lg font-bold text-navy mb-3"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {prefecture}の制度更新をメールで受け取る
          </h2>
          <p className="text-[13px] text-text-muted leading-relaxed mb-4">
            新制度のリリースや締切変更を月1回まとめてお届けします。配信停止はいつでも可能です。
          </p>
          <EmailCaptureForm
            defaultPrefecture={prefecture}
            variant="b"
            source={`lp_info_${encodeURIComponent(prefecture)}`}
          />
        </div>
      </section>

      <section className="py-10 bg-white border-t border-border">
        <div className="max-w-[900px] mx-auto px-6">
          <h2
            className="text-base font-bold text-navy mb-3"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            関連する情報ページ
          </h2>
          <ul className="text-[14px] space-y-1.5">
            <li>
              <Link href="/subsidies" className="text-primary hover:underline">
                全国の補助金一覧を見る
              </Link>
            </li>
            <li>
              <Link
                href={`/results/${encodeURIComponent(prefecture)}`}
                className="text-primary hover:underline"
              >
                {prefecture}の補助金交付実績を見る
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-primary hover:underline">
                運営者情報（マルチック株式会社）
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-[12px] text-text-muted leading-relaxed">
            ※ 施工対応エリア（{SERVICE_PREFECTURES.join("・")}）以外のお客様には、
            当ポータル経由の見積もり・施工はご案内していません。情報提供のみの掲載です。
          </p>
        </div>
      </section>
    </main>
  );
}

/* ---------------- 補助金リスト（両LP共通） ---------------- */

function SubsidyList({
  heading,
  subsidies,
  emptyText,
  hideRecipeCTA,
}: {
  heading: string;
  subsidies: Subsidy[];
  emptyText: string;
  hideRecipeCTA?: boolean;
}) {
  return (
    <section className="py-14">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2
          className="text-xl font-bold text-navy mb-6"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {heading}
        </h2>
        {subsidies.length === 0 ? (
          <p className="text-[14px] text-text-muted leading-relaxed">
            {emptyText}
            <Link href="/subsidies" className="text-primary hover:underline mx-1">
              補助金一覧
            </Link>
            をご確認ください。
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {subsidies.map((s) => (
              <article
                key={s.id}
                className="bg-white border border-border rounded-[10px] p-5"
              >
                <h3 className="font-bold text-navy text-[15px] mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {s.name}
                </h3>
                <dl className="text-[13px] text-text-muted space-y-1">
                  <div className="flex justify-between">
                    <dt>補助率上限</dt>
                    <dd className="text-navy font-semibold">
                      {Math.round(s.rate_max * 100)}%
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>上限額</dt>
                    <dd className="text-navy font-semibold">
                      {s.max_amount.toLocaleString("ja-JP")}円
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>締切</dt>
                    <dd>{s.deadline || "要確認"}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/subsidies/${s.id}`}
                    className="text-[13px] text-primary hover:underline"
                  >
                    制度詳細を見る →
                  </Link>
                  {!hideRecipeCTA && (
                    <Link
                      href="/my/wizard"
                      className="text-[13px] text-[color:var(--hc-accent)] hover:underline"
                    >
                      見積もりを作る
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
