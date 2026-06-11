"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { track } from "@vercel/analytics";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import EmailCaptureForm from "@/components/leads/EmailCaptureForm";
import QuickConsultForm from "@/components/match/QuickConsultForm";
import { isServicePrefecture } from "@/lib/constants";
import { FadeIn, StaggerChildren, StaggerItem, ScaleIn } from "@/components/motion";
import BonusChecklist from "@/components/strategy/BonusChecklist";
import AdoptionRateCard from "@/components/strategy/AdoptionRateCard";
import IndustryStrategy from "@/components/strategy/IndustryStrategy";
import type { BonusItem, IndustryContext, MatchedSubsidy } from "@/lib/api";
import { fetchBonusItems, fetchIndustryContext, matchSubsidies } from "@/lib/api";
import { parseEmployees, EmptyState, ErrorState, LoadingState } from "./states";
import ResultsFilters from "./ResultsFilters";
import MatchResultCard from "./MatchResultCard";
import DeadlineTimeline from "./DeadlineTimeline";
import { trackMicroCvDeadline } from "@/lib/analytics";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 直リンク（条件未指定）はデフォルト値でAPIを叩かず /match へ戻す
  const hasParams = ["industry", "employees", "prefecture", "purpose"].some(
    (k) => searchParams.get(k),
  );
  const industry = searchParams.get("industry") || "小売業";
  const employees = searchParams.get("employees") || "6〜20名";
  const prefecture = searchParams.get("prefecture") || "東京都";
  const purpose = searchParams.get("purpose") || "防犯・万引き対策";

  const [matches, setMatches] = useState<MatchedSubsidy[]>([]);
  const [bonusItems, setBonusItems] = useState<BonusItem[]>([]);
  const [industryCtx, setIndustryCtx] = useState<IndustryContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasParams) {
      router.replace("/match");
      return;
    }
    // パラメータ変更・アンマウント・StrictMode二重実行で古いfetch結果を破棄
    let cancelled = false;
    const employeesNum = parseEmployees(employees);

    setLoading(true);
    setError(null);

    matchSubsidies({ industry, employees: employeesNum, prefecture, purpose })
      .then((res) => {
        if (cancelled) return;
        setMatches(res.matches);
        track("diagnosis_result_view", {
          industry,
          prefecture,
          match_count: res.matches.length,
        });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message || "診断サービスに接続できませんでした。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetchBonusItems()
      .then((d) => {
        if (!cancelled) setBonusItems(d.items);
      })
      .catch(() => {});
    fetchIndustryContext(industry)
      .then((ctx) => {
        if (!cancelled) setIndustryCtx(ctx);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [hasParams, router, industry, employees, prefecture, purpose]);

  if (!hasParams) {
    return <LoadingState />;
  }

  const conditions = [
    { label: "業種", value: industry },
    { label: "従業員数", value: employees },
    { label: "都道府県", value: prefecture },
    { label: "目的", value: purpose },
  ];

  /* ── Left column: Filters + Conditions ── */
  const left = <ResultsFilters conditions={conditions} />;

  const inServiceArea = isServicePrefecture(prefecture);

  /* ── Center column: MatchResultCards + DeadlineTimeline ── */
  const center = (
    <div>
      {!inServiceArea && (
        <div style={{ marginBottom: 16 }}>
          <EmailCaptureForm
            defaultPrefecture={prefecture}
            variant="b"
            source="match_results_out_of_area"
            compact
          />
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.3px",
            margin: 0,
          }}
        >
          診断結果
        </h1>
        {!loading && !error && (
          <span style={{ fontSize: 13, color: "var(--hc-text-muted)" }}>
            {matches.length}件がマッチしました
          </span>
        )}
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && matches.length === 0 && <EmptyState />}
      {!loading && !error && matches.length > 0 && (
        <>
          <StaggerChildren stagger={0.1}>
            {matches.map((item, idx) => (
              <StaggerItem key={item.subsidy.id ?? idx}>
                <MatchResultCard item={item} prefecture={prefecture} />
              </StaggerItem>
            ))}
          </StaggerChildren>

          {/* DeadlineTimeline: 中央カラム末尾 */}
          <FadeIn direction="up" delay={0.2} distance={10}>
            <div style={{ marginTop: 24 }}>
              <DeadlineTimeline matches={matches} />
            </div>
          </FadeIn>
        </>
      )}

      {industryCtx && (
        <FadeIn direction="up" delay={0.3} distance={12}>
          <div style={{ marginTop: 24 }}>
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--hc-navy)",
                marginBottom: 12,
              }}
            >
              {industry}の採択戦略
            </h2>
            <IndustryStrategy context={industryCtx} />
          </div>
        </FadeIn>
      )}
    </div>
  );

  /* ── Right column: 段階CTA（リマインド登録→軽量相談→CTA群） ── */
  const right = (
    <div>
      {/* F3 NSM: 締切リマインド登録（最上部・最初から展開） */}
      <div style={{ marginBottom: 16 }}>
        <EmailCaptureForm
          defaultPrefecture={prefecture}
          variant="a"
          source="match_results_reminder"
          compact
          headlineOverride="締切が近づいたら教えます"
          onSuccess={() => trackMicroCvDeadline(prefecture, "match_results_reminder")}
        />
      </div>

      {/* F5: 軽量相談フォーム */}
      <FadeIn direction="up" delay={0.2} distance={8}>
        <div style={{ marginBottom: 16 }}>
          <QuickConsultForm />
        </div>
      </FadeIn>

      {/* 既存CTA群 */}
      <span className="section-title">次のステップ</span>

      <Link
        href="/my/wizard"
        className="btn-primary"
        style={{
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        申請書を作成する
      </Link>
      <Link
        href="/partners/multik"
        className="btn-secondary"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          background: "var(--hc-card-bg)",
        }}
      >
        施工パートナーを見る
      </Link>
      <button
        type="button"
        disabled
        className="btn-secondary"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          background: "var(--hc-card-bg)",
          opacity: 0.6,
          cursor: "not-allowed",
        }}
        aria-label="現在準備中です"
      >
        結果を保存する
      </button>
      <Link
        href="/match"
        className="btn-secondary"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          background: "var(--hc-card-bg)",
        }}
      >
        診断をやり直す
      </Link>

      {/* Celebration box */}
      {!loading && !error && matches.length > 0 && (
        <ScaleIn delay={0.5}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 12,
              background: "var(--hc-primary-subtle)",
              borderRadius: 10,
              border: "1px solid var(--hc-primary-edge)",
              marginTop: 12,
            }}
          >
            <Image
              src="/images/turtle_celebration.png"
              alt="お祝いマスコット"
              width={36}
              height={36}
              style={{ opacity: 0.6 }}
            />
            <p style={{ fontSize: 11, color: "var(--hc-text-muted)", lineHeight: 1.4, margin: 0 }}>
              {matches.length}件の補助金がマッチしました。「詳しく見る」で要件を確認しましょう。
            </p>
          </div>
        </ScaleIn>
      )}

      <FadeIn direction="up" delay={0.6} distance={8}>
        <div style={{ marginTop: 16 }}>
          <span className="section-title">採択率を上げるには</span>
          <AdoptionRateCard />
        </div>
      </FadeIn>

      {bonusItems.length > 0 && (
        <FadeIn direction="up" delay={0.8} distance={8}>
          <div style={{ marginTop: 16 }}>
            <span className="section-title">加点項目ガイド</span>
            <BonusChecklist items={bonusItems} />
          </div>
        </FadeIn>
      )}
    </div>
  );

  return (
    <ThreeColumnLayout
      gridCols="220px 1fr 240px"
      left={left}
      center={center}
      right={right}
    />
  );
}

export default function MatchResultsPage() {
  return (
    <Suspense
      fallback={
        <ThreeColumnLayout
          gridCols="220px 1fr 240px"
          left={
            <div style={{ color: "var(--hc-text-muted)", fontSize: 12 }}>
              読み込み中...
            </div>
          }
          center={
            <div style={{ color: "var(--hc-text-muted)", fontSize: 14 }}>
              診断結果を取得中です...
            </div>
          }
          right={null}
          showRight={false}
        />
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
