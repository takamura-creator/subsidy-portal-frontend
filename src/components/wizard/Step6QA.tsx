"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CompanyInfo, SubsidySelection } from "./types";
import {
  getIndustryChoices,
  type QAQuestionKey,
} from "@/data/qa-industry-choices";

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
  label: string;
  /** インタビュー時の質問文（話しかけるトーン） */
  question: string;
  /** 選択肢を生成する関数（company/subsidy/hpExtracted から動的に） */
  choices: (ctx: QAContext) => string[];
  /** HP抽出データから自動回答を生成（あれば） */
  autoFill?: (ctx: QAContext) => string | undefined;
  required: boolean;
}

interface QAContext {
  company?: CompanyInfo;
  subsidy?: SubsidySelection;
  hp?: Record<string, string>;
  answers: Record<string, string>;
}

/** 業種特化の選択肢があればそちらを優先し、汎用選択肢をフォールバックとして返す */
function industryOr(
  ctx: QAContext,
  key: QAQuestionKey,
  fallback: string[],
): string[] {
  const map = getIndustryChoices(ctx.company?.industry);
  return map?.[key] ?? fallback;
}

/* ─── 送信時の結合マッピング（内部_r1/r2/r3 → バックエンド用正規キー） ─── */
const CONCAT_TOPICS: { canonical: string; label: string; rounds: string[] }[] = [
  { canonical: "current_challenge", label: "経営課題", rounds: ["current_challenge_r1", "current_challenge_r2", "current_challenge_r3"] },
  { canonical: "expected_solution", label: "解決したいこと", rounds: ["expected_solution_r1", "expected_solution_r2", "expected_solution_r3"] },
  { canonical: "expected_effect", label: "期待される効果", rounds: ["expected_effect_r1", "expected_effect_r2", "expected_effect_r3"] },
];

/* ─── レビュー表示用グループ定義（CONCAT_TOPICSから派生で重複排除） ─── */
interface ReviewGroup {
  label: string;
  keys: string[];
  showSupplement?: boolean;
}

const REVIEW_GROUPS: ReviewGroup[] = [
  { label: "事業内容", keys: ["business_content"], showSupplement: true },
  ...CONCAT_TOPICS.map((t) => ({ label: t.label, keys: t.rounds })),
];

const QUESTIONS: QuestionDef[] = [
  {
    key: "business_content",
    label: "事業内容",
    question: "御社の主な事業内容を教えてください。",
    required: true,
    autoFill: (ctx) => {
      const parts = [
        ctx.hp?.business_description,
        ctx.hp?.company_overview,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join("。") : undefined;
    },
    choices: (ctx) =>
      industryOr(ctx, "business_content", [
        ctx.company?.industry
          ? `${ctx.company.industry}に関連するサービスを提供しています`
          : "各種事業を営んでいます",
        "防犯カメラ・監視カメラシステムの販売・施工・保守",
        "セキュリティシステムの設計・導入コンサルティング",
        "映像監視ソリューションの提供と運用支援",
      ]),
  },
  /* ── 経営課題 R1〜R3 ── */
  {
    key: "current_challenge_r1",
    label: "経営課題（1/3）",
    question: "今、一番困っていることは何ですか？",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "current_challenge_r1", [
        "人手不足で現場の安全管理が追いつかない",
        "万引き・盗難による損失が増加している",
        "夜間や休日の監視体制が不十分",
        "既存カメラが老朽化して映像品質が低下",
        "従業員の安全確認が目視頼りで事故発見が遅れる",
        "来客数や動線の把握ができていない",
      ]),
  },
  {
    key: "current_challenge_r2",
    label: "経営課題（2/3）",
    question: "その課題について、もう少し詳しく教えてください。いつ・どこで・どのくらいの頻度で起きていますか？",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "current_challenge_r2", [
        "毎日の業務の中で常に発生している",
        "週に数回、特定の時間帯に集中して発生する",
        "既存設備の老朽化で対処が追いつかない状況",
        "人的対応に限界があり、対応が後手に回っている",
        "特定のエリア・現場で集中して問題が発生している",
      ]),
  },
  {
    key: "current_challenge_r3",
    label: "経営課題（3/3）",
    question: "この課題による具体的な損失はどのくらいですか？金額・時間・件数など数値で教えてください。",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "current_challenge_r3", [
        "年間の損失額は推定50〜100万円程度",
        "月あたり10〜30時間の無駄な作業が発生している",
        "年間数件の事故やインシデントが発生している",
        "人件費として月20万円以上の追加コストがかかっている",
        "正確な数値は把握できていない（導入後に測定したい）",
      ]),
  },
  /* ── 解決したいこと R1〜R3 ── */
  {
    key: "expected_solution_r1",
    label: "解決したいこと（1/3）",
    question: "この補助金で、何を実現したいですか？",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "expected_solution_r1", [
        "AI搭載カメラで異常を自動検知し、即時対応できる体制を構築したい",
        "高画質カメラの導入で証拠映像の品質を向上させたい",
        "遠隔監視システムで人件費を削減しつつ安全性を高めたい",
        "来客分析で売上向上につながるデータを取得したい",
        "転倒検知・侵入検知で安全管理体制を強化したい",
        "カメラ映像のクラウド録画で災害時にもデータを保全したい",
      ]),
  },
  {
    key: "expected_solution_r2",
    label: "解決したいこと（2/3）",
    question: "具体的にどのような機器・システムの導入をお考えですか？",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "expected_solution_r2", [
        "AI検知機能付きカメラで異常時にスマホへ即時通知したい",
        "クラウド録画で映像を遠隔から確認できるようにしたい",
        "既存のアナログカメラを高画質デジタルカメラにリプレースしたい",
        "ネットワークカメラとNVRの組み合わせで構築したい",
        "まずは専門家のアドバイスを受けてから決めたい",
      ]),
  },
  {
    key: "expected_solution_r3",
    label: "解決したいこと（3/3）",
    question: "導入規模はどの程度をお考えですか？（台数・設置場所など）",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "expected_solution_r3", [
        "カメラ2〜3台の小規模導入で主要エリアをカバー",
        "カメラ4〜6台程度で主要エリア＋死角をカバー",
        "カメラ8台以上の大規模導入",
        "まず主要エリア2〜3台から始め、段階的に拡張したい",
        "台数は専門家のアドバイスを受けて決めたい",
      ]),
  },
  /* ── 期待される効果 R1〜R3 ── */
  {
    key: "expected_effect_r1",
    label: "期待される効果（1/3）",
    question: "導入後、どんな効果を期待していますか？",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "expected_effect_r1", [
        "事故・インシデントの早期発見と対応時間の短縮",
        "犯罪抑止効果による被害削減",
        "人件費削減と業務効率化",
        "24時間監視体制の確立",
        "従業員の安全意識向上と安心できる職場環境",
        "データ活用による経営改善",
      ]),
  },
  {
    key: "expected_effect_r2",
    label: "期待される効果（2/3）",
    question: "その効果について、現在の数値はどのくらいですか？（改善前の状態）",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "expected_effect_r2", [
        "事故対応に現在平均15〜30分かかっている",
        "被害額は年間50〜200万円と推定される",
        "夜間・休日の警備に月10〜30万円のコストがかかっている",
        "目視確認に1日あたり1〜2時間を費やしている",
        "具体的な現状数値は把握できていない（導入後に測定したい）",
      ]),
  },
  {
    key: "expected_effect_r3",
    label: "期待される効果（3/3）",
    question: "導入後の目標数値を教えてください。（改善後の目標）",
    required: true,
    choices: (ctx) =>
      industryOr(ctx, "expected_effect_r3", [
        "事故対応時間を3分以内に短縮したい",
        "被害額を年間30〜50%削減したい",
        "警備コストを月5〜10万円削減したい",
        "監視業務の工数を50%以上削減したい",
        "24時間365日の監視体制を0人追加で実現したい",
        "具体的な数値目標は専門家と相談して決めたい",
      ]),
  },
];

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
  const [supplement, setSupplement] = useState<string>(
    initialAnswers?.business_content_supplement ?? "",
  );

  const ctx: QAContext = useMemo(
    () => ({ company, subsidy, hp: hpExtracted, answers }),
    [company, subsidy, hpExtracted, answers],
  );

  // 初回マウント: HP自動入力 → 最初の未回答質問へジャンプ（単一Effectで race condition 防止）
  useEffect(() => {
    const base = initialAnswers ?? {};

    // 復元時: 必須が全回答済みならレビューモードへ直行
    if (initialAnswers) {
      const filled = QUESTIONS.filter((q) => (initialAnswers[q.key] ?? "").trim()).length;
      if (filled >= QUESTIONS.filter((q) => q.required).length) {
        setMode("review");
        return;
      }
    }

    // HP抽出データから自動入力（同期的に merged を構築）
    const autoFilled: Record<string, string> = {};
    const mountCtx: QAContext = { company, subsidy, hp: hpExtracted, answers: base };
    for (const q of QUESTIONS) {
      if (q.autoFill && !(base[q.key] ?? "").trim()) {
        const val = q.autoFill(mountCtx);
        if (val) autoFilled[q.key] = val;
      }
    }

    const merged = { ...base, ...autoFilled };
    if (Object.keys(autoFilled).length > 0) {
      setAnswers(merged);
    }

    // merged を使って最初の未回答へ（auto-filled 分はスキップされる）
    const firstUnanswered = QUESTIONS.findIndex((q) => !(merged[q.key] ?? "").trim());
    if (firstUnanswered >= 0) {
      setCurrentIdx(firstUnanswered);
    } else {
      setMode("review");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQ = QUESTIONS[currentIdx];
  const choices = currentQ ? currentQ.choices(ctx) : [];
  const filledCount = QUESTIONS.filter((q) => (answers[q.key] ?? "").trim()).length;
  const requiredFilled = QUESTIONS.filter((q) => q.required).every(
    (q) => (answers[q.key] ?? "").trim(),
  );

  /** 選択肢をクリックして回答 */
  const selectChoice = useCallback(
    (value: string) => {
      const updated = { ...answers, [currentQ.key]: value };
      setAnswers(updated);
      setCustomInput("");
      // 次の未回答へ（更新後の状態で判定）
      const nextUnanswered = QUESTIONS.findIndex(
        (q, i) => i > currentIdx && !(updated[q.key] ?? "").trim(),
      );
      if (nextUnanswered >= 0) {
        setCurrentIdx(nextUnanswered);
      } else {
        setMode("review");
      }
    },
    [currentQ, currentIdx, answers],
  );

  /** 自由入力で回答 */
  const submitCustom = useCallback(() => {
    if (!customInput.trim()) return;
    selectChoice(customInput.trim());
  }, [customInput, selectChoice]);

  /** レビューモードで回答を編集 */
  const editAnswer = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setMode("interview");
    setCustomInput("");
  }, []);

  /** ラウンドキーの回答を結合してプレビューテキストを返す */
  const concatPreview = useCallback(
    (keys: string[]) =>
      keys
        .map((k) => (answers[k] ?? "").trim())
        .filter(Boolean)
        .join("。"),
    [answers],
  );

  /** 送信: 3ラウンドの回答を結合してバックエンドの正規キーに変換 */
  const handleSubmit = useCallback(() => {
    const out: Record<string, string> = {};

    // business_content はそのまま
    if ((answers.business_content ?? "").trim()) {
      out.business_content = answers.business_content.trim();
    }
    if (supplement.trim()) {
      out.business_content_supplement = supplement.trim();
    }

    // 3ラウンドトピックを結合
    for (const topic of CONCAT_TOPICS) {
      const joined = topic.rounds
        .map((k) => (answers[k] ?? "").trim())
        .filter(Boolean)
        .join("。");
      if (joined) out[topic.canonical] = joined;
    }

    onNext(out);
  }, [answers, supplement, onNext]);

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

        {/* Question */}
        <div className="bg-white border border-border rounded-[12px] p-6">
          <div className="flex items-start gap-3 mb-5">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg">
              💬
            </span>
            <div>
              <p className="text-[11px] text-text-muted mb-1">
                質問 {currentIdx + 1}/{QUESTIONS.length}
                {!currentQ.required && "（任意）"}
              </p>
              <h3 className="text-[16px] font-bold text-navy leading-snug">
                {currentQ.question}
              </h3>
            </div>
          </div>

          {/* 自動入力済みの場合 */}
          {isAutoFilled && (
            <div className="mb-4 rounded-[8px] border border-green-200 bg-green-50 p-3">
              <p className="text-[12px] font-semibold text-green-700 mb-1">
                ✓ ホームページから自動入力しました
              </p>
              <p className="text-[13px] text-green-800 leading-relaxed">
                {currentAnswer}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => selectChoice(currentAnswer)}
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

          {/* 選択肢 */}
          {!isAutoFilled && (
            <>
              <div className="space-y-2 mb-4" role="radiogroup" aria-label={currentQ.label}>
                {choices.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={answers[currentQ.key] === c}
                    onClick={() => selectChoice(c)}
                    className={`w-full text-left px-4 py-3 rounded-[8px] border text-[13px] leading-relaxed transition hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      answers[currentQ.key] === c
                        ? "border-primary bg-primary/10 text-navy font-medium"
                        : "border-border bg-white text-text"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* 自由入力 */}
              <div className="border-t border-border pt-3">
                <p className="text-[11px] text-text-muted mb-2">
                  上記に当てはまらない場合は、自由に入力できます
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
          {!currentQ.required && (
            <button
              type="button"
              onClick={() => {
                const next = QUESTIONS.findIndex(
                  (q, i) => i > currentIdx && !(answers[q.key] ?? "").trim(),
                );
                if (next >= 0) setCurrentIdx(next);
                else setMode("review");
              }}
              className="text-[13px] text-text-muted underline hover:text-navy transition"
            >
              スキップ
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ─── レビューモード（グループ表示で全回答確認） ─── */
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy">回答の確認</h2>
        <p className="text-[13px] text-text-muted mt-1">
          以下の内容で事業計画書を生成します。変更する場合はクリックしてください。
        </p>
      </div>

      <div className="space-y-3">
        {REVIEW_GROUPS.map((group) => {
          const preview = concatPreview(group.keys);
          // グループ内の最初のキーのインデックスを取得（編集ジャンプ用）
          const firstIdx = QUESTIONS.findIndex((q) => q.key === group.keys[0]);

          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => editAnswer(firstIdx)}
                aria-label={`${group.label}を変更`}
                className="w-full text-left border border-border rounded-[10px] p-4 hover:border-primary/50 hover:bg-primary/5 transition group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-text-muted mb-0.5">
                      {group.label}
                      <span className="text-red-500 ml-1">*</span>
                    </p>
                    {preview ? (
                      <p className="text-[13px] text-navy leading-relaxed line-clamp-5">
                        {preview}
                      </p>
                    ) : (
                      <p className="text-[13px] text-text-muted italic">未入力</p>
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted group-hover:text-primary transition flex-shrink-0 mt-1">
                    変更 →
                  </span>
                </div>
              </button>
              {/* 事業内容の補足説明（任意） */}
              {group.showSupplement && (
                <div className="mt-2 ml-1">
                  <label
                    htmlFor="supplement"
                    className="text-[11px] text-text-muted cursor-pointer"
                  >
                    補足説明（任意）
                  </label>
                  <textarea
                    id="supplement"
                    value={supplement}
                    onChange={(e) => setSupplement(e.target.value)}
                    placeholder="事業内容について補足したいことがあれば入力してください"
                    rows={2}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-[8px] text-[13px] outline-none focus:border-primary resize-y leading-relaxed"
                  />
                </div>
              )}
            </div>
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
