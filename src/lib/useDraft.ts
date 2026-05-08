"use client";

import { useState, useCallback } from "react";
import type { AIDraftRequest, AIDraftResponse, DraftChapter } from "./api";
import { generateAIDraft, fetchDraft, patchDraftChapter } from "./api";

const MOCK_CHAPTERS: DraftChapter[] = [
  { chapter_id: "ch_1", title: "事業概要", content: "当社は防犯カメラシステムの設計・施工・保守を手掛ける中小企業です。", version_num: 1, generated_by: "ai", has_ng_word: false, requires_info: false },
  { chapter_id: "ch_2", title: "現状の課題", content: "現場訪問による点検作業に年間==300==時間を費やしています。", version_num: 1, generated_by: "ai", has_ng_word: false, requires_info: true },
  { chapter_id: "ch_3", title: "導入するITツール・システム", content: "クラウド型遠隔監視プラットフォームを導入します。", version_num: 1, generated_by: "ai", has_ng_word: false, requires_info: false },
  { chapter_id: "ch_4", title: "導入効果（定量・定性）", content: "現場訪問回数: 年間==120==回 → ==60==回（50%削減）", version_num: 1, generated_by: "ai", has_ng_word: false, requires_info: true },
  { chapter_id: "ch_5", title: "実施スケジュール", content: "6ヶ月間で段階的に導入を進めます。", version_num: 1, generated_by: "ai", has_ng_word: false, requires_info: false },
  { chapter_id: "ch_6", title: "賃上げ計画", content: "賃上げ原資として年間約==50==万円を充当します。", version_num: 1, generated_by: "ai", has_ng_word: false, requires_info: true },
];

export function useDraft() {
  const [draft, setDraft] = useState<AIDraftResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (appId: string, params: AIDraftRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateAIDraft(appId, params);
      setDraft(result);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "ドラフト生成に失敗しました";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const load = useCallback(async (appId: string, draftId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDraft(appId, draftId);
      setDraft(result);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "ドラフト読み込みに失敗しました";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateChapter = useCallback((chapterId: string, content: string, appId?: string, draftId?: string) => {
    setDraft(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map(ch =>
          ch.chapter_id === chapterId
            ? { ...ch, content, generated_by: "human", requires_info: content.includes("==") }
            : ch
        ),
      };
    });

    if (appId && draftId) {
      patchDraftChapter(appId, draftId, chapterId, content).catch(() => {});
    }
  }, []);

  return { draft, loading, error, generate, load, updateChapter };
}
