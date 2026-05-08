import type { Metadata } from "next";
import Link from "next/link";
import { MULTIK_COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "運営者情報 | HOJYO CAME",
  description:
    "HOJYO CAMEの運営会社情報。マルチック株式会社が中立的な立場で補助金情報と工事業者情報を提供します。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="bg-bg min-h-screen">
      <div className="max-w-[820px] mx-auto px-6 py-12 md:py-16">
        <h1
          className="text-2xl md:text-3xl font-bold text-navy mb-8"
          style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
        >
          運営者情報
        </h1>

        {/* HOJYO CAME について */}
        <section className="mb-10">
          <h2
            className="text-lg font-bold text-navy mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            HOJYO CAMEについて
          </h2>
          <div className="text-[14px] text-text leading-relaxed space-y-3">
            <p>
              HOJYO
              CAMEは、監視カメラ・防犯カメラの導入を検討している中小企業と、設置工事を行う業者をつなぐ補助金マッチングプラットフォームです。
            </p>
            <p>
              特定メーカーの製品を推奨するのではなく、中立的な立場で補助金情報と工事業者情報を提供し、中小企業の皆様がスムーズに補助金を活用できるようサポートします。
            </p>
          </div>
        </section>

        {/* 運営会社 */}
        <section className="mb-10">
          <h2
            className="text-lg font-bold text-navy mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            運営会社
          </h2>
          <div className="bg-white border border-border rounded-[10px] overflow-hidden">
            <dl className="divide-y divide-border">
              <InfoRow label="社名" value={MULTIK_COMPANY.name} />
              <InfoRow label="代表者" value="高村 泰宏" />
              <InfoRow label="所在地" value="神奈川県藤沢市辻堂西海岸2-10-3-11" />
              <InfoRow label="設立" value="2020年" />
              <InfoRow
                label="事業内容"
                value="監視カメラシステムの販売・導入支援、補助金申請支援"
              />
              <InfoRow
                label="ウェブサイト"
                value={
                  <a
                    href={MULTIK_COMPANY.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {MULTIK_COMPANY.website}
                  </a>
                }
              />
              <InfoRow
                label="連絡先"
                value={
                  <a
                    href={`mailto:${MULTIK_COMPANY.email}`}
                    className="text-primary hover:underline"
                  >
                    {MULTIK_COMPANY.email}
                  </a>
                }
              />
            </dl>
          </div>
        </section>

        {/* サービスの特徴 */}
        <section className="mb-10">
          <h2
            className="text-lg font-bold text-navy mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            サービスの特徴
          </h2>
          <div className="text-[14px] text-text leading-relaxed space-y-3">
            <p>
              HOJYO
              CAMEは完全無料でご利用いただけます。補助金の診断、申請書の作成支援、工事業者のマッチングまで、すべて無料です。
            </p>
            <p>
              工事業者の皆様には、補助金活用の案件マッチングを通じた集客支援を行っています。
            </p>
          </div>
        </section>

        {/* お問い合わせ */}
        <section className="mb-10">
          <h2
            className="text-lg font-bold text-navy mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            お問い合わせ
          </h2>
          <p className="text-[14px] text-text-muted leading-relaxed mb-4">
            サービスに関するお問い合わせは、下記リンクよりご連絡ください。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold text-[14px] hover:bg-[var(--hc-primary-hover)] transition"
          >
            お問い合わせフォームへ
          </Link>
        </section>

        {/* 法的リンク */}
        <section>
          <div className="border-t border-border pt-8 flex flex-wrap gap-6 text-[13px]">
            <a
              href="https://multik.jp/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              プライバシーポリシー
            </a>
            <a
              href="https://multik.jp/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              利用規約
            </a>
            <a
              href="https://multik.jp/tokushoho"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              特定商取引法に基づく表記
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 px-5 py-4 text-[14px]">
      <dt className="text-text-muted font-medium">{label}</dt>
      <dd className="text-text">{value}</dd>
    </div>
  );
}
