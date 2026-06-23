import { PREFECTURE_MAX_SUBSIDY } from "@/data/prefecture-max-subsidy";
import { FadeIn } from "@/components/motion";
import PrefectureAnswerFinder from "@/components/home/PrefectureAnswerFinder";
import SubsidyCarousel from "@/components/home/SubsidyCarousel";

/**
 * HeroStage — FV刷新（案A・問いかけFV）
 *
 * SSR: h1・セレクタ・CTA・support-chip がJS無効でも即時表示。
 * Enhancement (#2): FadeIn(up, 8px, 250ms, delay 0.05s)。CTAには掛けない。
 * Enhancement (#3/#4): PrefectureAnswerFinder 内（亀うなずき＋カウントアップ）。
 * reduced-motion: globals.css の @media block で全アニメ無効化。
 */
export default function HeroStage() {
  // isAuthenticated はクライアント専用なので SSR では常に false → useEffect で上書き
  // CTA は suppressHydrationWarning で hydration mismatch を許容（既存設計踏襲）
  const ctaHref = "/match";
  const ctaLabel = "無料で補助金を診断する →";

  return (
    <div className="stage">
      {/* h1: 問いかけコピー。SSR確定表示・遅延禁止 */}
      <FadeIn direction="up" distance={8} duration={0.25} delay={0.05}>
        <h1 className="home-welcome-h1">
          あなたの地域、防犯カメラ補助金は
          <wbr />
          <span className="paf-h1-accent">いくら出る？</span>
        </h1>
        <p className="paf-sub">
          地域を選ぶと、使える制度をその場で無料診断できます。
        </p>
      </FadeIn>

      {/* PrefectureAnswerFinder: セレクタ＋金額カウントアップ＋CTA＋計測 */}
      <PrefectureAnswerFinder
        prefectures={PREFECTURE_MAX_SUBSIDY}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
      />

      {/* 対応エリアバナー */}
      <div className="hero-area-banner" role="note" aria-label="サービス対応エリア">
        <span className="hero-area-label">対応エリア</span>
        <span className="hero-area-list">
          東京都・神奈川県・静岡県・埼玉県・千葉県・山梨県
        </span>
      </div>

      {/* 補助金カルーセル（既存） */}
      <FadeIn direction="up" delay={0.2} distance={12}>
        <SubsidyCarousel />
      </FadeIn>
    </div>
  );
}
