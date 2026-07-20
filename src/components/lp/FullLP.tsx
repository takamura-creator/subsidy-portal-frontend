import Link from "next/link";
import type { Subsidy } from "@/lib/api";
import TrustBlock from "@/components/home/TrustBlock";
import IndustryLinksSection from "@/components/lp/IndustryLinksSection";
import { SubsidyList } from "@/components/lp/SubsidyList";

/* ---------------- 6都県：フルLP ---------------- */
// C2（2026-07-20・Phase6差戻し）: src/app/lp/[prefecture]/page.tsx から純粋切り出し。
// 挙動・props型は変更なし。

export function FullLP({ prefecture, subsidies }: { prefecture: string; subsidies: Subsidy[] }) {
  const anchor = `${prefecture}で防犯カメラの補助金申請と施工をまとめて相談する`;
  return (
    <main>
      <section className="bg-navy text-white">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <p className="text-[12px] font-medium tracking-widest text-white/60 mb-3">
            {prefecture} ／ 施工対応エリア
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 hc-heading-sora-tight">
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
          <h2 className="text-xl font-bold text-navy mb-6 hc-heading-sora">
            {prefecture}での導入フロー
          </h2>
          <ol className="grid md:grid-cols-3 gap-4">
            {[
              { step: "STEP 1", title: "業種から補助金を探す", desc: "業種を選んで対象補助金を一覧表示。条件にあう制度を比較できます。" },
              { step: "STEP 2", title: "AVTECH製品で見積もり", desc: "ウィザードで構成と台数を選び、見積書PDFを出力できます。" },
              { step: "STEP 3", title: "マルチック施工", desc: `${prefecture}の現場へ直接お伺いし、施工・初期設定までワンストップ対応。` },
            ].map((f) => (
              <li key={f.step} className="bg-bg border border-border rounded-[10px] p-5">
                <p className="text-[11px] font-semibold tracking-widest text-[color:var(--hc-accent)]">
                  {f.step}
                </p>
                <p className="font-bold text-navy mt-1 mb-1 hc-heading-sora">
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
            <h2 className="text-xl font-bold text-navy mb-2 hc-heading-sora">
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

      <section className="py-10 bg-white border-t border-border">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-base font-bold text-navy mb-3 hc-heading-sora">
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
        </div>
      </section>

      {/* 業種別LPへの導線（余力対応・既存 INDUSTRY_LPS の再利用） */}
      <IndustryLinksSection />

      {/* 信頼ブロック（CTA直前。情報LP側と同一コンポーネントを金看板6県LPにも配置） */}
      <section className="py-8 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <TrustBlock />
        </div>
      </section>

      <section className="bg-navy text-white py-14">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-3 hc-heading-sora-tight">
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

export default FullLP;
