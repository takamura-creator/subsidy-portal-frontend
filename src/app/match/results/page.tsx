"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import EmailCaptureForm from "@/components/leads/EmailCaptureForm";
import { isServicePrefecture, toApiIndustry } from "@/lib/constants";
import { FadeIn, StaggerChildren, StaggerItem, ScaleIn } from "@/components/motion";
import BonusChecklist from "@/components/strategy/BonusChecklist";
import AdoptionRateCard from "@/components/strategy/AdoptionRateCard";
import IndustryStrategy from "@/components/strategy/IndustryStrategy";
import type { BonusItem, IndustryContext, MatchedSubsidy } from "@/lib/api";
import { fetchBonusItems, fetchIndustryContext } from "@/lib/api";
import { loadMatchResults } from "./matchCache";
import { aiErrorCopy, logApiError, reportAiUnavailable } from "@/lib/errorCopy";
import AiUnavailableNotice from "@/components/shared/AiUnavailableNotice";
import { parseEmployees, EmptyState, FallbackNote, LoadingState } from "./states";
import ResultsFilters from "./ResultsFilters";
import MatchResultCard from "./MatchResultCard";
import DeadlineTimeline from "./DeadlineTimeline";
import { trackMicroCvDeadline } from "@/lib/analytics";
import { usableIndustryContext } from "@/lib/industryStrategy";

/**
 * 2カラムグリッド: 左(フィルタ+カード) / 右(CTA)。列の指定は globals.css の .match-results-grid
 * （900px 以下は1段組・2026-10-28 試験 [2-c]: 375px で 609px に広がっていた）。
 */
const GRID_STYLE: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  maxWidth: 1120,
  margin: "0 auto",
  padding: "80px 24px 120px",
};

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasParams = ["industry", "employees", "prefecture", "purpose"].some(
    (k) => searchParams.get(k),
  );
  const industry = searchParams.get("industry") || "小売業";
  const employees = searchParams.get("employees") || "6〜20名";
  const prefecture = searchParams.get("prefecture") || "東京都";
  const purpose = searchParams.get("purpose") || "防犯・万引き対策";

  const [matches, setMatches] = useState<MatchedSubsidy[]>([]);
  // backend が AI の代わりに簡易判定で返したとき（fallback: true）。返さない backend では常に false
  const [isFallback, setIsFallback] = useState(false);
  const [bonusItems, setBonusItems] = useState<BonusItem[]>([]);
  const [industryCtx, setIndustryCtx] = useState<IndustryContext | null>(null);
  // 読み込み中・エラーは「どの条件の結果か」で決める（2026-10-28 lint react-hooks/set-state-in-effect:
  // effect の中で同期的に setLoading(true)/setError(null) を呼ばない）。条件が変わると doneKey と食い違い、読み込み中になる。
  const queryKey = [industry, employees, prefecture, purpose].join("|");
  // 「同じ条件でもう一度試す」で増やす。条件＋試行回数を1回の取得の単位にする（2026-11-01 PR-A）
  const [attempt, setAttempt] = useState(0);
  const runKey = `${queryKey}#${attempt}`;
  const [doneKey, setDoneKey] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<{ key: string; error: unknown } | null>(null);
  const loading = doneKey !== runKey;
  const failure = errorState && errorState.key === runKey ? errorState.error : null;
  const error = failure !== null;

  useEffect(() => {
    if (!hasParams) {
      router.replace("/match");
      return;
    }
    let cancelled = false;
    const employeesNum = parseEmployees(employees);

    // 表示名（例: 工場・製造業）はバックエンドの業種語彙（例: 製造業）へ変換して送る。
    // 表示・計測は表示名のまま（条件チップ・採択戦略見出し・analytics）。
    const apiIndustry = toApiIndustry(industry);

    // 同じ条件の結果が30分以内に保存されていれば AI を呼ばずに使う（2026-11-01 PR-B・./matchCache.ts）。
    // backend の 404（候補0件）は「該当なし」として空の結果で返る（エラー表示ではなく空状態＝条件を変える導線）。
    // 画面を離れても通信は中断しない（応答は保存され、戻ってきたときに使われる）
    loadMatchResults(queryKey, { industry: apiIndustry, employees: employeesNum, prefecture, purpose })
      .then((res) => {
        if (cancelled) return;
        setMatches(res.matches);
        setIsFallback(res.fallback);
        track("diagnosis_result_view", {
          industry,
          prefecture,
          match_count: res.matches.length,
          cached: res.cached,
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // ステータス番号は画面に出さず console に残す。AI が使えなかった回数は計測する（設計書 D5）
        logApiError("match", e);
        reportAiUnavailable("match", e);
        setErrorState({ key: runKey, error: e });
      })
      .finally(() => {
        if (!cancelled) setDoneKey(runKey);
      });

    fetchBonusItems()
      .then((d) => { if (!cancelled) setBonusItems(d.items); })
      .catch(() => {});
    // 業種データが無い業種は {}、一部の業種は小売業のデータが返る。その業種のデータがそろっている時だけ出す（試験 [2-a][2-b]）
    fetchIndustryContext(apiIndustry)
      .then((ctx) => { if (!cancelled) setIndustryCtx(usableIndustryContext(ctx, apiIndustry)); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [hasParams, router, industry, employees, prefecture, purpose, queryKey, runKey]);

  if (!hasParams) {
    return <LoadingState />;
  }

  const inServiceArea = isServicePrefecture(prefecture);

  const conditions = [
    { label: "業種", value: industry },
    { label: "従業員数", value: employees },
    { label: "都道府県", value: prefecture },
    { label: "目的", value: purpose },
  ];

  /* ── 左カラム: フィルタ + カード一覧 ── */
  const leftCol = (
    <div>
      {/* エリア外通知 */}
      {!inServiceArea && (
        <div style={{ marginBottom: 24 }}>
          <EmailCaptureForm
            defaultPrefecture={prefecture}
            variant="b"
            source="match_results_out_of_area"
            compact
          />
        </div>
      )}

      {/* フィルタ条件 */}
      <div style={{ marginBottom: 24 }}>
        <ResultsFilters conditions={conditions} />
      </div>

      {/* h1「診断結果」— Headline 36px */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: "clamp(28px, 3.5vw, 36px)",
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          診断結果
        </h1>
        {!loading && !error && (
          <span style={{ fontSize: 13, color: "var(--hc-text-muted)", flexShrink: 0 }}>
            {matches.length}件マッチ
          </span>
        )}
      </div>

      {/* カード一覧 */}
      {loading && <LoadingState />}
      {!loading && error && (
        <AiUnavailableNotice
          title={aiErrorCopy(failure).title}
          body={aiErrorCopy(failure).body}
          industry={industry}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      )}
      {!loading && !error && matches.length > 0 && isFallback && <FallbackNote />}
      {!loading && !error && matches.length === 0 && <EmptyState />}
      {!loading && !error && matches.length > 0 && (
        <StaggerChildren stagger={0.1}>
          {matches.map((item, idx) => (
            <StaggerItem key={item.subsidy.id ?? idx}>
              <div style={{ marginBottom: 24 }}>
                <MatchResultCard item={item} prefecture={prefecture} />
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {/* DeadlineTimeline */}
      {!loading && !error && matches.length > 0 && (
        <FadeIn direction="up" delay={0.2} distance={10}>
          <div style={{ marginTop: 8 }}>
            <DeadlineTimeline matches={matches} />
          </div>
        </FadeIn>
      )}

      {/* 業種別採択戦略 */}
      {industryCtx && (
        <FadeIn direction="up" delay={0.3} distance={12}>
          <div style={{ marginTop: 32 }}>
            <h2
              style={{
                fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--hc-navy)",
                marginBottom: 12,
                letterSpacing: "-0.02em",
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

  /* ── 右カラム: CTA絞り込み（プライマリ1本＋リンクテキスト） ── */
  const rightCol = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "sticky",
        top: 24,
      }}
    >
      {/* 締切リマインド登録 */}
      <div style={{ marginBottom: 20 }}>
        <EmailCaptureForm
          defaultPrefecture={prefecture}
          variant="a"
          source="match_results_reminder"
          compact
          headlineOverride="締切が近づいたら教えます"
          onSuccess={() => trackMicroCvDeadline(prefecture, "match_results_reminder")}
        />
      </div>

      {/* プライマリCTA — 1本に絞る */}
      <Link
        href="/my/wizard"
        style={{
          display: "block",
          width: "100%",
          padding: "14px 16px",
          borderRadius: 8,
          background: "var(--hc-primary)",
          color: "var(--hc-white)",
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          textDecoration: "none",
          marginBottom: 16,
          boxShadow: "var(--hc-shadow-md)",
        }}
      >
        申請書を作成する
      </Link>

      {/* サブアクション — リンクテキスト化 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Link
          href="/partners/multik"
          style={{
            fontSize: 13,
            color: "var(--hc-text-muted)",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          施工パートナーを見る →
        </Link>
        <Link
          href="/match"
          style={{
            fontSize: 13,
            color: "var(--hc-text-muted)",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          診断をやり直す →
        </Link>
      </div>

      {/* Match count notice */}
      {!loading && !error && matches.length > 0 && (
        <ScaleIn delay={0.5}>
          <div
            style={{
              padding: "10px 14px",
              background: "var(--hc-primary-subtle)",
              borderRadius: 10,
              border: "1px solid var(--hc-primary-edge)",
              marginTop: 20,
            }}
          >
            <p style={{ fontSize: 11, color: "var(--hc-text-muted)", lineHeight: 1.4, margin: 0 }}>
              {matches.length}件の補助金がマッチしました。「詳しく見る」で要件を確認しましょう。
            </p>
          </div>
        </ScaleIn>
      )}

      {/* 採択率カード */}
      <FadeIn direction="up" delay={0.6} distance={8}>
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--hc-text-muted)",
              marginBottom: 8,
            }}
          >
            採択率を上げるには
          </p>
          <AdoptionRateCard />
        </div>
      </FadeIn>

      {/* 加点項目ガイド */}
      {bonusItems.length > 0 && (
        <FadeIn direction="up" delay={0.8} distance={8}>
          <div style={{ marginTop: 20 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--hc-text-muted)",
                marginBottom: 8,
              }}
            >
              加点項目ガイド
            </p>
            <BonusChecklist items={bonusItems} />
          </div>
        </FadeIn>
      )}
    </div>
  );

  return (
    <div className="match-results-grid" style={GRID_STYLE}>
      <div style={{ minWidth: 0 }}>{leftCol}</div>
      <div className="match-results-side">{rightCol}</div>
    </div>
  );
}

export default function MatchResultsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "80px 24px",
            color: "var(--hc-text-muted)",
            fontSize: 14,
          }}
        >
          診断結果を取得中です...
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
