import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "補助金ポータルの運営会社・サービスの趣旨についてご案内します。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-[960px] mx-auto px-4 md:px-6 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-3xl font-medium text-text mb-3">
          運営者情報
        </h1>
        <p className="text-text2 text-sm max-w-lg mx-auto">
          補助金ポータルは、防犯カメラ導入に活用できる補助金情報を、中立的な立場で提供するサービスです。
        </p>
      </div>

      {/* ポータルの趣旨 */}
      <section className="card border border-border mb-8">
        <h2 className="text-lg font-medium mb-4 text-secondary">補助金ポータルについて</h2>
        <div className="space-y-4 text-sm text-text leading-relaxed">
          <p>
            補助金ポータルは、防犯カメラ・監視カメラの導入を検討する中小企業の皆さまが、自社に最適な補助金を見つけられるようサポートするAIマッチングサービスです。
          </p>
          <p>
            全47都道府県の補助金データを網羅し、業種・従業員数・所在地・導入目的に応じて、AIが最適な補助金候補をスコア付きでご提案します。申請書の作成支援も行っており、初めての補助金申請でも安心してご利用いただけます。
          </p>
          <p>
            特定のメーカーや製品に依存しない中立的なプラットフォームとして、企業と施工実績のある工事業者をつなぎ、双方にとって最適なマッチングを通じてスムーズな防犯カメラ導入を実現します。
          </p>
        </div>
      </section>

      {/* サービスの特長 */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-secondary">サービスの特長</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "AI補助金診断",
              desc: "業種・規模に応じた最適な補助金を、AIがスコア付きでご提案。全国の補助金データベースから自動マッチング。",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
            },
            {
              title: "申請書作成支援",
              desc: "必要情報の入力だけで、AIが申請書のドラフトをPDFで自動生成。初めての補助金申請でも安心。",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              title: "全国対応",
              desc: "全47都道府県の補助金情報を網羅。国の補助金から自治体独自の助成金まで幅広くカバー。",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div key={i} className="card border border-border text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-text2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 運営会社 */}
      <section className="card border border-border mb-8">
        <h2 className="text-lg font-medium mb-4 text-secondary">運営会社</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {[
                ["会社名", "マルチック株式会社"],
                ["所在地", "東京都"],
                ["事業内容", "防犯カメラ・セキュリティソリューションの導入支援"],
                ["ウェブサイト", "multik.jp"],
                ["お問い合わせ", "info@multik.jp"],
              ].map(([key, value]) => (
                <tr key={key} className="border-b border-border last:border-b-0">
                  <th className="py-3 pr-4 text-left font-medium text-text2 whitespace-nowrap w-32">{key}</th>
                  <td className="py-3 text-text">
                    {key === "ウェブサイト" ? (
                      <a href="https://multik.jp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {value}
                      </a>
                    ) : key === "お問い合わせ" ? (
                      <a href={`mailto:${value}`} className="text-primary hover:underline">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <p className="text-text2 text-sm mb-4">補助金の活用をお考えですか？</p>
        <Link href="/match" className="btn-primary inline-block px-8 py-3">
          無料で補助金診断する
        </Link>
      </div>
    </div>
  );
}
