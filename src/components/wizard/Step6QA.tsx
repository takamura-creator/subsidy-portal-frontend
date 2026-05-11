"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CompanyInfo, SubsidySelection } from "./types";

/* ─── Props ─── */
interface Props {
  initialAnswers?: Record<string, string>;
  hpExtracted?: Record<string, string>;
  company?: CompanyInfo;
  subsidy?: SubsidySelection;
  onBack: () => void;
  onNext: (answers: Record<string, string>) => void;
}

/* ─── 質問定義 ─── */
interface QuestionDef {
  key: string;
  /** インタビュー時の質問文 */
  question: string;
  /** 選択肢を生成する関数（company から動的に） */
  choices?: (ctx: QAContext) => string[];
  /** HP抽出データから自動回答を生成（あれば） */
  autoFill?: (ctx: QAContext) => string | undefined;
  /** 自由記載のみ（選択肢なし） */
  freeFormOnly?: boolean;
  required: boolean;
}

interface QAContext {
  company?: CompanyInfo;
  subsidy?: SubsidySelection;
  hp?: Record<string, string>;
  answers: Record<string, string>;
}

/* ─── 6質問定義（重複を排除し1問1テーマ） ─── */
const QUESTIONS: QuestionDef[] = [
  {
    key: "business_content",
    question: "御社の主な事業内容を教えてください。",
    required: true,
    autoFill: (ctx) => {
      const parts = [ctx.hp?.business_description, ctx.hp?.company_overview].filter(Boolean);
      return parts.length > 0 ? parts.join("。") : undefined;
    },
    choices: (ctx) => [
      ctx.company?.industry
        ? `${ctx.company.industry}を中心に事業を展開しています`
        : "各種事業を営んでいます",
      "防犯カメラ・監視カメラの販売・施工・保守",
      "セキュリティシステムの設計・導入コンサルティング",
      "施設運営および顧客対応サービスの提供",
    ],
  },
  {
    key: "current_challenge",
    question: "現在、防犯・安全管理で一番困っていることは何ですか？",
    required: true,
    choices: () => [
      "人手不足で現場の安全管理・夜間監視が追いつかない",
      "万引き・盗難・不正行為による損失が発生している",
      "既存カメラが老朽化し映像品質・録画が不十分",
      "高齢者・子どもの見守り、転倒検知など安全確認が必要",
      "事故・トラブル発生時に証拠映像が残らず対応が後手",
      "敷地が広く死角が多くて目視確認に限界がある",
    ],
  },
  {
    key: "expected_solution",
    question: "この補助金で、どのようなシステム・機器を導入したいですか？",
    required: true,
    choices: () => [
      "AI搭載カメラで異常検知・自動通知できる体制を構築したい",
      "高画質カメラとNVRで証拠映像を確実に残したい",
      "クラウド録画で遠隔から映像確認・データ保全したい",
      "見守りセンサーやカメラで利用者の安全を24時間見守りたい",
      "既存アナログカメラをデジタル/IPカメラへ更新したい",
      "まず最低限の構成で導入し、段階的に拡張したい",
    ],
  },
  {
    key: "expected_effect",
    question: "導入後、どのような効果を期待していますか？",
    required: true,
    choices: () => [
      "事故・インシデントの早期発見と対応時間の大幅短縮",
      "犯罪・盗難の抑止と被害金額の削減",
      "人件費・警備コストの削減と業務効率化",
      "24時間365日の監視体制を少人数で実現",
      "従業員・利用者の安心感向上と離職率改善",
      "映像データを活用した運用改善・経営判断",
    ],
  },
  {
    key: "quantitative_target",
    question: "効果の数値目標を教えてください。（採択率向上に重要）",
    required: true,
    choices: () => [
      "事故対応時間を 30分 → 3分以内 に短縮",
      "盗難・損失額を 年間 30〜50% 削減",
      "夜間警備コストを 月 5〜10万円 削減",
      "見回り工数を 月 20〜30 時間削減",
      "離職率を 前年比 20% 改善",
      "数値は専門家と相談して決めたい",
    ],
  },
  {
    key: "additional_notes",
    question: "その他、申請に含めたい情報があれば自由にご記入ください（任意）。",
    required: false,
    freeFormOnly: true,
  },
];

/** 丸数字 ①②③… */
const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

/* ─── メインコンポーネント ─── */
export default function Step6QA({
  initialAnswers,
  hpExtracted,
  company,
  subsidy,
  onBack,
  onNext,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers ?? {});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [mode, setMode] = useState<"interview" | "review">("interview");

  const ctx: QAContext = useMemo(
    () => ({ company, subsidy, hp: hpExtracted, answers }),
    [company, subsidy, hpExtracted, answers],
  );

  // 初回マウント: HP自動入力を「下書き提案」として保持するが、currentIdx は 0 から始める
  // → 質問1がスキップされる問題を解消
  useEffect(() => {
    const base = initialAnswers ?? {};
    const autoFilled: Record<string, string> = {};
    const mountCtx: QAContext = { company, subsidy, hp: hpExtracted, answers: base };
    for (const q of QUESTIONS) {
      if (q.autoFill && !(base[q.key] ?? "").trim()) {
        const val = q.autoFill(mountCtx);
        if (val) autoFilled[q.key] = val;
      }
    }
    if (Object.keys(autoFilled).length > 0) {
      setAnswers({ ...base, ...autoFilled });
    }
    // 復元時は必須が全回答済みならレビューへ
    if (initialAnswers) {
      const requiredKeys = QUESTIONS.filter((q) => q.required).map((q) => q.key);
      const allFilled = requiredKeys.every((k) => (initialAnswers[k] ?? "").trim());
      if (allFilled) {
        setMode("review");
        return;
      }
    }
    setCurrentIdx(0); // 常に質問1から開始
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQ = QUESTIONS[currentIdx];
  const choices = currentQ?.choices ? currentQ.choices(ctx) : [];
  const filledCount = QUESTIONS.filter((q) => (answers[q.key] ?? "").trim()).length;
  const requiredFilled = QUESTIONS.filter((q) => q.required).every(
    (q) => (answers[q.key] ?? "").trim(),
  );

  /** 選択 or 自由入力で回答を確定し次へ */
  const commitAnswer = useCallback(
    (value: string) => {
      const updated = { ...answers, [currentQ.key]: value };
      setAnswers(updated);
      setCustomInput("");
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setMode("review");
      }
    },
    [currentQ, currentIdx, answers],
  );

  /** 自由記載のみの質問（最終質問）でスキップ */
  const skipOptional = useCallback(() => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setMode("review");
    }
  }, [currentIdx]);

  const submitCustom = useCallback(() => {
    if (!customInput.trim()) return;
    commitAnswer(customInput.trim());
  }, [customInput, commitAnswer]);

  const editAnswer = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setMode("interview");
    setCustomInput("");
  }, []);

  const handleSubmit = useCallback(() => {
    const out: Record<string, string> = {};
    for (const q of QUESTIONS) {
      const v = (answers[q.key] ?? "").trim();
      if (v) out[q.key] = v;
    }
    onNext(out);
  }, [answers, onNext]);

  /* ─── インタビューモード ─── */
  if (mode === "interview" && currentQ) {
    const currentAnswer = answers[currentQ.key] ?? "";
    const isAutoFilled = !!currentAnswer && !initialAnswers?.[currentQ.key];

    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-1">
          {QUESTIONS.map((q, i) => (
            <div
              key={q.key}
              className={`h-2 flex-1 rounded-full transition-colors ${
                (answers[q.key] ?? "").trim()
                  ? "bg-primary"
                  : i === currentIdx
                    ? "bg-primary/40"
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Question — 大きめ見出し */}
        <div
          style={{
            background: "var(--hc-card-bg)",
            border: "1px solid var(--hc-card-border)",
            borderRadius: 12,
            padding: 28,
          }}
        >
          <p
            style={{
              fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--hc-primary)",
              letterSpacing: "0.02em",
              marginBottom: 8,
            }}
          >
            質問 {currentIdx + 1} <span style={{ fontSize: 14, color: "var(--hc-text-muted)", fontWeight: 500 }}>/ {QUESTIONS.length}{!currentQ.required && "（任意）"}</span>
          </p>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--hc-navy)",
              lineHeight: 1.55,
              marginBottom: 20,
            }}
          >
            {currentQ.question}
          </h3>

          {/* HP自動入力済み */}
          {isAutoFilled && !currentQ.freeFormOnly && (
            <div className="mb-4 rounded-[8px] border border-green-200 bg-green-50 p-3">
              <p className="text-[12px] font-semibold text-green-700 mb-1">
                ✓ ホームページから自動入力しました
              </p>
              <p className="text-[13px] text-green-800 leading-relaxed">{currentAnswer}</p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => commitAnswer(currentAnswer)}
                  className="px-4 py-2 rounded-[8px] bg-primary text-white text-[13px] font-semibold hover:bg-[var(--hc-primary-hover)] transition"
                >
                  この内容でOK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [currentQ.key]: "" }));
                  }}
                  className="px-4 py-2 rounded-[8px] border border-border bg-white text-text text-[13px] hover:bg-gray-50 transition"
                >
                  変更する
                </button>
              </div>
            </div>
          )}

          {/* 選択肢（番号付き） */}
          {!isAutoFilled && !currentQ.freeFormOnly && (
            <>
              <div className="space-y-2 mb-4" role="radiogroup" aria-label={`質問${currentIdx + 1}`}>
                {choices.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={answers[currentQ.key] === c}
                    onClick={() => commitAnswer(c)}
                    className={`w-full text-left px-4 py-3 rounded-[8px] border text-[13px] leading-relaxed transition hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      answers[currentQ.key] === c
                        ? "border-primary bg-primary/10 text-navy font-medium"
                        : "border-border bg-white text-text"
                    }`}
                  >
                    <span style={{ fontWeight: 700, color: "var(--hc-primary)", marginRight: 8 }}>
                      {CIRCLED[i] ?? `(${i + 1})`}
                    </span>
                    {c}
                  </button>
                ))}
              </div>

              {/* 自由入力 */}
              <div className="border-t border-border pt-3">
                <p className="text-[11px] text-text-muted mb-2">
                  上記に当てはまらない場合は自由に入力できます
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitCustom()}
                    placeholder="自由入力..."
                    aria-label="その他（自由入力）"
                    className="flex-1 px-3 py-2 border border-border rounded-[8px] text-[13px] outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={submitCustom}
                    disabled={!customInput.trim()}
                    className="px-4 py-2 rounded-[8px] bg-primary text-white text-[13px] font-semibold disabled:opacity-50 transition"
                  >
                    決定
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 自由記載のみ（最終質問） */}
          {currentQ.freeFormOnly && (
            <>
              <textarea
                value={customInput || currentAnswer}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="例: 過去に発生した事故内容、特に強調したいアピールポイント、補助金審査員に伝えたい情報など..."
                rows={6}
                className="w-full px-3 py-3 border border-border rounded-[8px] text-[13px] outline-none focus:border-primary resize-y leading-relaxed"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => commitAnswer(customInput.trim() || currentAnswer.trim() || "（特になし）")}
                  className="px-5 py-2.5 rounded-[8px] bg-primary text-white text-[13px] font-semibold hover:bg-[var(--hc-primary-hover)] transition"
                >
                  入力して次へ
                </button>
                <button
                  type="button"
                  onClick={skipOptional}
                  className="px-5 py-2.5 rounded-[8px] border border-border bg-white text-text-muted text-[13px] hover:bg-gray-50 transition"
                >
                  スキップ
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (currentIdx > 0) {
                setCurrentIdx(currentIdx - 1);
              } else {
                onBack();
              }
            }}
            className="px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:bg-gray-50 transition"
          >
            {currentIdx > 0 ? "前の質問" : "戻る"}
          </button>
        </div>
      </div>
    );
  }

  /* ─── レビューモード ─── */
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy">回答の確認</h2>
        <p className="text-[13px] text-text-muted mt-1">
          以下の内容で事業計画書を生成します。変更する場合はクリックしてください。
        </p>
      </div>

      <div className="space-y-3">
        {QUESTIONS.map((q, i) => {
          const v = answers[q.key] ?? "";
          return (
            <button
              key={q.key}
              type="button"
              onClick={() => editAnswer(i)}
              aria-label={`質問${i + 1}を変更`}
              className="w-full text-left border border-border rounded-[10px] p-4 hover:border-primary/50 hover:bg-primary/5 transition group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-text-muted mb-1">
                    <span style={{ fontWeight: 700, color: "var(--hc-primary)", marginRight: 6 }}>
                      質問 {i + 1}
                    </span>
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  <p className="text-[13px] text-navy mb-1" style={{ fontWeight: 500 }}>
                    {q.question}
                  </p>
                  {v ? (
                    <p className="text-[13px] text-text leading-relaxed mt-1">{v}</p>
                  ) : (
                    <p className="text-[13px] text-text-muted italic mt-1">
                      {q.required ? "未入力（必須）" : "未入力（任意）"}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-text-muted group-hover:text-primary transition flex-shrink-0 mt-1">
                  変更 →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-3">
        <p className="text-[12px] text-blue-700">
          💡 審査員が読む書類です。具体的な数値（売上○%向上、時間○分短縮など）があると採択率が上がります。
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:bg-gray-50 transition"
        >
          戻る
        </button>
        <span className="text-[12px] text-text-muted">
          {filledCount}/{QUESTIONS.length} 入力済み
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!requiredFilled}
          className="ml-auto px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          事業計画書を生成する
        </button>
      </div>
    </div>
  );
}
