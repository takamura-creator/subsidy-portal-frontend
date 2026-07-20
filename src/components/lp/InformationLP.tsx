import Link from "next/link";
import type { Subsidy } from "@/lib/api";
import { SERVICE_PREFECTURES } from "@/lib/constants";
import TrustBlock from "@/components/home/TrustBlock";
import RelatedNoteLink from "@/components/lp/RelatedNoteLink";
import EmailCaptureForm from "@/components/leads/EmailCaptureForm";
import { NOTE_ARTICLE_LINKS } from "@/data/note-article-links";
import { SubsidyList } from "@/components/lp/SubsidyList";

/* ---------------- 41道府県：情報LP ---------------- */
// C2（2026-07-20・Phase6差戻し）: src/app/lp/[prefecture]/page.tsx から純粋切り出し。
// 挙動・props型は変更なし。

export function InformationLP({ prefecture, subsidies }: { prefecture: string; subsidies: Subsidy[] }) {
  return (
    <main>
      <section className="bg-white border-b border-border">
        <div className="max-w-[900px] mx-auto px-6 py-14">
          <p className="text-[12px] font-medium tracking-widest text-text-muted mb-3">
            {prefecture} ／ 補助金情報
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-4 hc-heading-sora-tight">
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
          <h2 className="text-lg font-bold text-navy mb-3 hc-heading-sora">
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

      {/* 信頼ブロック（CTA直前） */}
      <section className="py-8 bg-bg">
        <div className="max-w-[900px] mx-auto px-6">
          <TrustBlock />
        </div>
      </section>

      {/* note根拠記事リンク（URL確定後に自動表示） */}
      <RelatedNoteLink prefecture={prefecture} links={NOTE_ARTICLE_LINKS} />

      <section className="py-12 bg-[color:var(--hc-primary)] text-white">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <h2 className="text-xl font-bold mb-3 hc-heading-sora-tight">
            全国対応の補助金を業種から診断する
          </h2>
          <p className="text-white/70 text-[14px] mb-6 leading-relaxed">
            業種と都道府県を選ぶだけで、対象補助金と上限額が分かります。登録不要・無料。
          </p>
          <Link
            href="/match"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-[8px] bg-white text-[color:var(--hc-primary)] font-semibold transition hover:opacity-90"
          >
            無料で診断する →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default InformationLP;
