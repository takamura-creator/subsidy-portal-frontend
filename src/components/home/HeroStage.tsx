"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ScaleIn,
  FadeIn,
  FloatLoop,
  TextReveal,
  ButtonPulse,
  StaggerChildren,
  StaggerItem,
  TerminalTypewriter,
  GradientText,
} from "@/components/motion";
import SubsidyCarousel from "@/components/home/SubsidyCarousel";

const CATCHPHRASES = [
  "補助金診断からAI申請書類作成まで、無料で完結。",
  "防犯カメラ導入に使える補助金を一括検索。随時追加中。",
  "診断・検索・比較・申請書類まで、このサイトで完結。",
];

export default function HeroStage() {
  return (
    <div className="stage">
      <ScaleIn delay={0.1} duration={0.6}>
        <FloatLoop amplitude={6} duration={3.5}>
          <Image
            className="turtle"
            src="/images/turtle_wave.png"
            alt="HOJYO CAME キャラクター"
            width={112}
            height={112}
            priority
          />
        </FloatLoop>
      </ScaleIn>

      <h1>
        <TextReveal
          text="HOJYO "
          splitBy="char"
          stagger={0.05}
          delay={0.3}
          duration={0.4}
        />
        <GradientText>
          <TextReveal
            text="CAME"
            splitBy="char"
            stagger={0.05}
            delay={0.6}
            duration={0.4}
          />
        </GradientText>
      </h1>

      <FadeIn direction="up" delay={0.8} distance={16}>
        <TerminalTypewriter lines={CATCHPHRASES} />
      </FadeIn>

      <ButtonPulse delay={1.0} glowColor="rgba(21, 128, 61, 0.25)">
        <Link href="/match" className="cta-primary">
          無料で補助金を診断する →
        </Link>
      </ButtonPulse>

      <StaggerChildren stagger={0.12} className="support-items">
        <StaggerItem>
          <span className="support-chip">無料・登録不要</span>
        </StaggerItem>
        <StaggerItem>
          <span className="support-chip">約30秒</span>
        </StaggerItem>
        <StaggerItem>
          <span className="support-chip">主要補助金に対応</span>
        </StaggerItem>
      </StaggerChildren>

      <FadeIn direction="none" delay={1.4}>
        <div className="hero-area-banner" role="note" aria-label="サービス対応エリア">
          <span className="hero-area-label">対応エリア</span>
          <span className="hero-area-list">
            東京都・神奈川県・静岡県・埼玉県・千葉県・山梨県
          </span>
          <span className="hero-area-note">マルチック株式会社が直接施工対応</span>
        </div>
      </FadeIn>

      <FadeIn direction="up" delay={1.6} distance={12}>
        <SubsidyCarousel />
      </FadeIn>
    </div>
  );
}
