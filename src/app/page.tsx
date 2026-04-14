import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

export const metadata: Metadata = {
  title: "HOJYO CAME — 防犯カメラ導入×補助金活用ポータル",
  description:
    "監視カメラ・防犯カメラの導入を補助金で実現。全国の補助金から最適なものを無料診断。認定設置業者を比較・選定できます。",
  openGraph: {
    title: "HOJYO CAME — 防犯カメラ導入×補助金活用ポータル",
    description:
      "監視カメラ・防犯カメラの導入を補助金で実現。全国の補助金から最適なものを無料診断。認定設置業者を比較・選定できます。",
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
      <span className="section-title">選ばれる3つの理由</span>

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

      <div className="divider" />
      <Link
        href="/about"
        className="text-xs font-medium no-underline transition-colors"
        style={{ color: "var(--hc-primary)" }}
      >
        運営者情報を見る →
      </Link>
    </div>
  );
}

/* ============================================
   Right Column — 3ステップ利用ガイド（CTAなし）
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
      <span className="section-title">補助金活用の流れ</span>

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
    </div>
  );
}

/* ============================================
   Center Column — ヒーロー（透過背景・モックアップ準拠）
   ============================================ */

function HomeCenterHero() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        minHeight: "calc(100vh - var(--hc-header-h) - var(--hc-status-h) - 64px)",
      }}
    >
      {/* 亀キャラ */}
      <Image
        src="/images/turtle_wave.png"
        alt="HOJYO CAME マスコット"
        width={240}
        height={240}
        className="mb-6"
        style={{ objectFit: "contain" }}
      />

      {/* ブランドロゴ H1 */}
      <h1
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          letterSpacing: "-1px",
          lineHeight: 1.1,
          marginBottom: 16,
          color: "var(--hc-navy)",
        }}
      >
        HOJYO <span style={{ color: "var(--hc-primary)" }}>CAME</span>
      </h1>

      {/* キャッチコピー（サブ見出し） */}
      <p
        style={{
          fontSize: "1rem",
          color: "var(--hc-text-muted)",
          maxWidth: 500,
          lineHeight: 1.8,
          marginBottom: 24,
        }}
      >
        監視カメラ導入を、補助金でもっと手軽に。
        <br />
        診断から業者選定まで、ワンストップで。
      </p>

      {/* メインCTA 1個のみ */}
      <Link
        href="/match"
        className="btn-primary inline-block no-underline"
        style={{
          width: "auto",
          padding: "16px 40px",
          fontSize: 16,
        }}
      >
        無料で補助金を診断する
      </Link>

      <p
        className="mt-3"
        style={{ fontSize: 13, color: "var(--hc-text-muted)" }}
      >
        登録不要・営業電話なし・全国対応
      </p>
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
