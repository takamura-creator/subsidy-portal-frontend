"use client";

import { useState, useCallback } from "react";
import type { ScoreResponse } from "./api";
import { scoreApplication } from "./api";

export function useScore() {
  const [score, setScore] = useState<ScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (
    appId: string,
    subsidyId: string,
    fieldValues?: Record<string, string>,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await scoreApplication(appId, subsidyId, fieldValues);
      setScore(result);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "スコア取得に失敗しました";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { score, loading, error, evaluate };
}
