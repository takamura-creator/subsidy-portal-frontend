"use client";

import { useState, useCallback } from "react";
import type { AIDraftRequest, AIDraftResponse, DraftChapter } from "./api";
import { generateAIDraft, fetchDraft, patchDraftChapter } from "./api";
import { errorMessage, logApiError, reportAiUnavailable } from "./errorCopy";

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
      logApiError("draft", e);
      reportAiUnavailable("draft", e);
      const msg = errorMessage(e, "事業計画書の作成に失敗しました。もう一度お試しください。");
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
      logApiError("draft-load", e);
      const msg = errorMessage(e, "事業計画書の読み込みに失敗しました。もう一度お試しください。");
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
      patchDraftChapter(appId, draftId, chapterId, content).catch((err: unknown) => {
        // R8: 空 catch 解消 — エラーをログに残す（サイレント失敗は調査不能）
        console.error("[useDraft] patch failed", err);
      });
    }
  }, []);

  return { draft, loading, error, generate, load, updateChapter };
}
