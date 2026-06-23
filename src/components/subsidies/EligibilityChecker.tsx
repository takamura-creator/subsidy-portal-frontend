"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Answer = "yes" | "partial" | "no" | null;

interface Question {
  key: string;
  text: string;
  options: { value: Exclude<Answer, null>; label: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    key: "public_space",
    text: "設置場所は公道や公園など、公共空間が中心ですか？",
    options: [
      { value: "yes", label: "はい", score: 2 },
      { value: "partial", label: "検討中", score: 1 },
      { value: "no", label: "いいえ・敷地内のみ", score: 0 },
    ],
  },
  {
    key: "police_consultation",
    text: "警察署への事前協議は実施または予定していますか？",
    options: [
      { value: "yes", label: "実施済み", score: 2 },
      { value: "partial", label: "予定あり", score: 1 },
      { value: "no", label: "未定", score: 0 },
    ],
  },
  {
    key: "assoc_approval",
    text: "自治会総会で防犯カメラ設置の承認は得られていますか？",
    options: [
      { value: "yes", label: "取得済み", score: 2 },
      { value: "partial", label: "次回総会で議題予定", score: 1 },
      { value: "no", label: "まだ", score: 0 },
    ],
  },
  {
    key: "resident_consent",
    text: "周辺住民・地権者の同意取得を進めていますか？",
    options: [
      { value: "yes", label: "進行中・取得済み", score: 2 },
      { value: "partial", label: "これから", score: 1 },
      { value: "no", label: "課題あり", score: 0 },
    ],
  },
  {
    key: "multiple_quotes",
    text: "複数の業者から見積もりを取得する予定はありますか？",
    options: [
      { value: "yes", label: "はい", score: 2 },
      { value: "no", label: "いいえ", score: 0 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.score)),
  0,
);

type Level = "high" | "medium" | "low";

interface Result {
  score: number;
  level: Level;
  title: string;
  message: string;
  badgeBg: string;
  badgeColor: string;
  borderColor: string;
}

function calcResult(answers: Answer[]): Result {
  const score = answers.reduce((sum, ans, i) => {
    if (!ans) return sum;
    const opt = QUESTIONS[i].options.find((o) => o.value === ans);
    return sum + (opt?.score ?? 0);
  }, 0);

  if (score >= 8) {
    return {
      score,
      level: "high",
      title: "採択可能性：高",
      message: "申請要件をほぼ満たしています。マルチックの実績を活かしてスムーズな申請をサポートいたします。",
      badgeBg: "var(--hc-success-subtle)",
      badgeColor: "var(--hc-success)",
      borderColor: "var(--hc-success-edge)",
    };
  }
  if (score >= 5) {
    return {
      score,
      level: "medium",
      title: "採択可能性：中",
      message: "未対応の項目がありますが、相談いただければ多くは解消可能です。藤沢市鵠沼地区など湘南エリアでの対応経験を活かしてご提案いたします。",
      badgeBg: "var(--hc-warning-subtle)",
      badgeColor: "var(--hc-warning-text)",
      borderColor: "color-mix(in srgb, var(--hc-warning-text) 20%, transparent)",
    };
  }
  return {
    score,
    level: "low",
    title: "準備項目が複数あります",
    message: "現状では未対応項目が多めですが、警察協議・住民同意の進め方など、マルチックがゼロから伴走いたします。まずはお気軽にご相談ください。",
    badgeBg: "var(--hc-error-subtle)",
    badgeColor: "var(--hc-error)",
    borderColor: "var(--hc-error-line)",
  };
}

interface Props {
  subsidyId: string;
  subsidyName: string;
}

export default function EligibilityChecker({ subsidyId, subsidyName }: Props) {
  const storageKey = `hc_eligibility_${subsidyId}`;
  const [answers, setAnswers] = useState<Answer[]>(() =>
    QUESTIONS.map(() => null),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Answer[];
      if (Array.isArray(parsed) && parsed.length === QUESTIONS.length) {
        setAnswers(parsed);
      }
    } catch {
      // ignore corrupted localStorage
    }
  }, [storageKey]);

  function handleSelect(qIdx: number, value: Exclude<Answer, null>) {
    const next = [...answers];
    next[qIdx] = value;
    setAnswers(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }

  function handleReset() {
    const empty = QUESTIONS.map(() => null);
    setAnswers(empty);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  const allAnswered = answers.every((a) => a !== null);
  const result = allAnswered ? calcResult(answers) : null;
  const answeredCount = answers.filter((a) => a !== null).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 20,
        borderRadius: 10,
        background:
          "var(--hc-card-bg)",
        border: "1px solid color-mix(in srgb, var(--hc-primary) 10%, var(--hc-border))",
        borderBottomColor: "color-mix(in srgb, var(--hc-primary) 18%, var(--hc-border))",
        boxShadow: "var(--hc-shadow)",
      }}
      aria-label="採択適合チェッカー"
    >
      <header style={{ marginBottom: 12 }}>
        <h2
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.3px",
            margin: "0 0 4px",
          }}
        >
          採択適合チェッカー（5問・約1分）
        </h2>
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.6 }}>
          自治会向け補助金の主要な採択要件を満たしているかを5問で確認できます
        </p>
      </header>

      <div
        style={{
          height: 4,
          background: "var(--hc-text-divider)",
          borderRadius: 9999,
          marginBottom: 20,
          overflow: "hidden",
        }}
        aria-hidden
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "var(--hc-primary)",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {QUESTIONS.map((q, qIdx) => {
          const labelId = `eligibility-q-${q.key}`;
          return (
          <li key={q.key}>
            <p
              id={labelId}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--hc-navy)",
                margin: "0 0 8px",
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "var(--hc-primary)", marginRight: 6 }}>Q{qIdx + 1}.</span>
              {q.text}
            </p>
            <div role="radiogroup" aria-labelledby={labelId} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {q.options.map((opt) => {
                const selected = answers[qIdx] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handleSelect(qIdx, opt.value)}
                    style={{
                      fontSize: 13,
                      fontWeight: selected ? 700 : 500,
                      // タッチターゲット最小44x44px（WCAG 2.5.5）— minHeight で確保
                      padding: "12px 18px",
                      minHeight: 44,
                      borderRadius: 8,
                      border: selected
                        ? "1.5px solid var(--hc-primary)"
                        : "1px solid var(--hc-border)",
                      background: selected ? "var(--hc-primary-light)" : "var(--hc-white)",
                      color: selected ? "var(--hc-primary)" : "var(--hc-text)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit",
                    }}
                    suppressHydrationWarning
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </li>
          );
        })}
      </ol>

      {hydrated && result && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            background: result.badgeBg,
            border: `1px solid ${result.borderColor}`,
          }}
          role="status"
          aria-live="polite"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: result.badgeColor,
                fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
              }}
            >
              {result.title}
            </span>
            <span style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>
              （{result.score} / {MAX_SCORE} 点）
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--hc-text)", margin: "0 0 12px", lineHeight: 1.6 }}>
            {result.message}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href={`/contact?subject=${encodeURIComponent(`【自治会向け補助金 相談】${subsidyName}`)}`}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--hc-white)",
                background: "var(--hc-primary)",
                padding: "10px 18px",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              マルチックに相談する →
            </Link>
            <button
              type="button"
              onClick={handleReset}
              style={{
                fontSize: 12,
                color: "var(--hc-text-muted)",
                background: "none",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              やり直す
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--hc-text-muted)", margin: "10px 0 0", lineHeight: 1.5 }}>
            ※ 藤沢市鵠沼地区 9件の施工実績／湘南エリアでの対応経験豊富
          </p>
        </div>
      )}
    </section>
  );
}
