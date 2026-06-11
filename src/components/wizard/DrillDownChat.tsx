"use client";

import { useState, useEffect } from "react";
import type { DraftChapter } from "@/lib/api";
import { fetchDrillDownQuestions, type DrillDownQuestionItem } from "@/lib/api";

interface Props {
  chapters: DraftChapter[];
  applicationId: string;
  onComplete: (answers: Array<{ question: string; answer: string }>) => void;
  onSkip: () => void;
}

export default function DrillDownChat({ chapters, applicationId, onComplete, onSkip }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [round] = useState(1);
  const [questions, setQuestions] = useState<DrillDownQuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const targetChapters = chapters.filter(ch => ch.requires_info);

  useEffect(() => {
    const chapterIds = targetChapters.length > 0
      ? targetChapters.map(ch => ch.chapter_id)
      : chapters.slice(0, 1).map(ch => ch.chapter_id);

    if (chapterIds.length === 0) return;

    setLoadingQuestions(true);
    fetchDrillDownQuestions(applicationId, chapterIds)
      .then(items => setQuestions(items))
      .catch(() => {
        // 通信エラー時はモックを差し込まずエラー状態へ
        setQuestions([]);
      })
      .finally(() => setLoadingQuestions(false));
  // chapterIds は applicationId 確定時の初回スナップショットで固定する設計
  // （親の chapters 更新で再fetchすると回答中の入力が消えるため意図的に除外）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  function handleChange(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }

  function handleSubmit() {
    const result = questions.map(q => ({
      question: q.question_text,
      answer: answers[q.question_id] ?? "",
    }));
    onComplete(result);
  }

  const allAnswered = questions.length > 0 && questions.every(q => (answers[q.question_id] ?? "").trim() !== "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy">深掘り質問</h2>
        <span className="text-xs text-text-muted bg-[color:var(--hc-bg)] px-2 py-1 rounded">
          ラウンド {round}/3
        </span>
      </div>

      {targetChapters.length > 0 && (
        <p className="text-sm text-text-muted">
          以下の章に追加情報が必要です:{" "}
          {targetChapters.map(ch => ch.title).join("、")}
        </p>
      )}

      {loadingQuestions && (
        <div className="flex items-center gap-2 py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          <span className="text-sm text-text-muted">質問を生成中...</span>
        </div>
      )}

      {!loadingQuestions && questions.length === 0 && (
        <div className="py-4 text-center" role="alert">
          <p className="text-sm text-text-muted mb-3">
            質問の取得中に通信エラーが発生しました。
          </p>
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-[color:var(--hc-bg)]"
          >
            この手順をスキップして進む
          </button>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.question_id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">AI</span>
              </div>
              <p className="text-sm text-[color:var(--hc-text)] leading-relaxed pt-1">{q.question_text}</p>
            </div>
            <textarea
              value={answers[q.question_id] ?? ""}
              onChange={(e) => handleChange(q.question_id, e.target.value)}
              placeholder="ここに回答を入力..."
              className="w-full h-20 p-2 border border-border rounded text-sm resize-y focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-gray-50"
        >
          スキップ
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="ml-auto px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          送信して再生成
        </button>
      </div>
    </div>
  );
}
