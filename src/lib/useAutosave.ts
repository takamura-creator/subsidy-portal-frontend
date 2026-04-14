"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30日

type SavedDraft<T> = { data: T; savedAt: number };

/**
 * LocalStorage自動保存hook
 * - onBlurやステップ完了時に save() を呼ぶ
 * - hasDraft: 復元可能なデータがあるか
 * - restore(): データを復元
 * - discard(): 保存データを破棄
 */
export function useAutosave<T>(storageKey: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [hasDraft, setHasDraft] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const keyRef = useRef(storageKey);

  // 起動時: 保存データの存在確認
  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyRef.current);
      if (raw) {
        const parsed: SavedDraft<T> = JSON.parse(raw);
        if (Date.now() - parsed.savedAt < TTL_MS) {
          setHasDraft(true);
        } else {
          localStorage.removeItem(keyRef.current);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback(
    (current?: T) => {
      const toSave = current ?? data;
      try {
        const draft: SavedDraft<T> = { data: toSave, savedAt: Date.now() };
        localStorage.setItem(keyRef.current, JSON.stringify(draft));
        setSavedAt(new Date());
      } catch {
        // storage full — ignore
      }
    },
    [data],
  );

  const restore = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(keyRef.current);
      if (raw) {
        const parsed: SavedDraft<T> = JSON.parse(raw);
        if (Date.now() - parsed.savedAt < TTL_MS) {
          setData(parsed.data);
          setHasDraft(false);
          return parsed.data;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }, []);

  const discard = useCallback(() => {
    localStorage.removeItem(keyRef.current);
    setHasDraft(false);
  }, []);

  return { data, setData, save, hasDraft, restore, discard, savedAt };
}
