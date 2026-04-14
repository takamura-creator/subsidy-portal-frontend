import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

export const metadata: Metadata = {
  title: "防犯カメラの補助金診断 | 補助金ポータル",
  description:
    "業種と地域を入力するだけで、あなたの会社が使える防犯カメラの補助金をAIが無料で自動判定。全国47都道府県対応。",
  openGraph: {
    title: "防犯カメラの補助金診断 | 補助金ポータル",
    description:
      "業種と地域を入力するだけで、あなたの会社が使える防犯カメラの補助金をAIが無料で自動判定。全国47都道府県対応。",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

/* ============================================
   Left Column — HOJYO CAMEとは
   ============================================ */

function HomeLeftPanel() {
  const features = [
    {
      title: "完全無料",
      desc: "診断・マッチング・申請書の下書き作成まで、すべて無料。登録も不要です。",
    },
    {
      title: "AIが自動判定",
      desc: "業種・従業員数・地域の3項目を入力するだけ。数百件の補助金データからAIが最適なプランを選定します。",
    },
    {
      title: "中立なポータル",
      desc: "特定メーカーに偏らない中立的な立場で、補助金情報と設置業者の両方をご紹介します。",
    },
  ];

  return (
    <div className="space-y-5">
      <h2
        className="text-sm font-bold"
        style={{
          fontFamily: "'Sora', sans-serif",
          color: "var(--hc-navy)",
          letterSpacing: "-0.3px",
        }}
      >
        選ばれる3つの理由
      </h2>

      {features.map((f) => (
        <div key={f.title}>
          <h3
            className="text-xs font-bold mb-1"
            style={{ color: "var(--hc-navy)" }}
          >
            {f.title}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: "var(--hc-text-muted)" }}>
            {f.desc}
          </p>
        </div>
      ))}

      <div className="pt-4 border-t" style={{ borderColor: "var(--hc-border)" }}>
        <Link
          href="/about"
          className="text-xs font-medium transition-colors"
          style={{ color: "var(--hc-primary)" }}
        >
          運営者情報を見る →
        </Link>
      </div>
    </div>
  );
}

/* ============================================
   Right Column — 3ステップ利用ガイド
   ============================================ */

function HomeRightPanel() {
  const steps = [
    {
      num: 1,
      title: "無料補助金診断",
      desc: "業種・従業員数・都道府県を入力するだけ。AIが最適な補助金を自動マッチングします。",
    },
    {
      num: 2,
      title: "業者マッチング・見積もり",
      desc: "対応可能な設置業者を自動マッチング。複数社から見積もりを取得できます。",
    },
    {
      num: 3,
      title: "申請サポート",
      desc: "必要書類の下書きを自動生成。申請手続きをスムーズに進められます。",
    },
  ];

  return (
    <div className="space-y-4">
      <h2
        className="text-sm font-bold"
        style={{
          fontFamily: "'Sora', sans-serif",
          color: "var(--hc-navy)",
          letterSpacing: "-0.3px",
        }}
      >
        補助金活用の流れ
      </h2>

      {steps.map((s) => (
        <div key={s.num} className="flex gap-3">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
            style={{ background: "var(--hc-primary)", color: "#fff" }}
          >
            {s.num}
          </span>
          <div>
            <h3 className="text-xs font-bold" style={{ color: "var(--hc-navy)" }}>
              {s.title}
            </h3>
            <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "var(--hc-text-muted)" }}>
              {s.desc}
            </p>
          </div>
        </div>
      ))}

      <div className="pt-3">
        <Link
          href="/match"
          className="btn-primary block text-center text-xs py-3"
        >
          無料で補助金を診断する
        </Link>
      </div>
    </div>
  );
}

/* ============================================
   Center Column — ヒーロー（secondary系ダーク背景）
   ============================================ */

function HomeCenterHero() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center rounded-xl -mx-4 -mt-4 px-6 py-16"
      style={{
        background:
          "linear-gradient(160deg, var(--hc-navy) 0%, #1a2e1a 60%, var(--hc-navy) 100%)",
        minHeight: "calc(100vh - var(--hc-header-h) - var(--hc-status-h) - 64px)",
      }}
    >
      {/* 亀キャラ */}
      <Image
        src="/images/turtle_wave.png"
        alt="HOJYO CAME マスコット"
        width={80}
        height={80}
        className="mb-5 drop-shadow-lg"
      />

      {/* ロゴ */}
      <p
        className="text-lg font-bold mb-3"
        style={{
          fontFamily: "'Sora', sans-serif",
          letterSpacing: "-0.5px",
          color: "#fff",
        }}
      >
        <span className="opacity-80">HOJYO</span>
        <span style={{ color: "var(--hc-success)" }}>CAME</span>
      </p>

      {/* キャッチコピー H1 */}
      <h1
        className="text-xl font-bold mb-4 leading-snug"
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          color: "#fff",
          letterSpacing: "-0.3px",
          maxWidth: 420,
        }}
      >
        防犯カメラの補助金、
        <br />
        まだ見落としていませんか
      </h1>

      {/* サブコピー */}
      <p
        className="text-sm leading-relaxed mb-8"
        style={{ color: "rgba(255,255,255,0.7)", maxWidth: 380 }}
      >
        業種と地域を入力するだけで、あなたの会社が使える補助金をAIが自動判定。
        全国の補助金・助成金データベースから最適なプランを無料でご提案します。
      </p>

      {/* メインCTA */}
      <Link
        href="/match"
        className="inline-block px-8 py-4 rounded-lg font-bold text-base transition-opacity hover:opacity-90 mb-4"
        style={{ background: "var(--hc-primary)", color: "#fff" }}
      >
        無料で補助金を診断する
      </Link>

      {/* サブCTA */}
      <Link
        href="/subsidies"
        className="text-sm transition-opacity hover:opacity-70"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        補助金一覧を見る →
      </Link>
    </div>
  );
}

/* ============================================
   Page
   ============================================ */

export default function HomePage() {
  return (
    <ThreeColumnLayout
      showLeft={true}
      showRight={true}
      left={<HomeLeftPanel />}
      right={<HomeRightPanel />}
      center={<HomeCenterHero />}
    />
  );
}
