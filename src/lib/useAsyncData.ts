"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Settled<T> = {
  /** どの条件（requestKey）の結果か */
  key: string;
  /** 最後に成功したときのデータ（失敗しても前回の成功分を残す） */
  data: T | undefined;
  /** この条件で失敗したか */
  failed: boolean;
  /** 失敗したときの例外 */
  error: unknown;
};

/**
 * 条件（key）が変わるたびに load() を呼んでデータを取る（2026-11-01）。
 *
 * 旧実装は各画面で「effect の中で load() → load が同期で setLoading(true)」としていて、
 * eslint の react-hooks/set-state-in-effect（effect 内の同期 setState は描画を1回余計に起こす）に当たっていた。
 * ここでは「読み込み中」を state に持たず、「今の条件の結果がまだ届いていない」ことから計算する。
 * state を変えるのは応答が届いたとき（非同期）だけ。
 *
 * - key が null の間は取りに行かない（loading は true のまま）
 * - 条件が変わったら古い応答は捨てる（素早く切り替えても古い結果で上書きしない）
 * - reload() は同じ条件でもう一度取る（更新・削除のあとに使う）
 * - 失敗しても data は前回成功した分を返す（旧実装の挙動と同じ）。failed / error は今の条件で失敗したときだけ
 * - load は key と同じ条件から作ること（key が同じなら load を変えても取り直さない）
 */
export function useAsyncData<T>(key: string | null, load: () => Promise<T>) {
  const [reloadCount, setReloadCount] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const requestKey = key === null ? null : `${reloadCount}:${key}`;

  useEffect(() => {
    if (requestKey === null) return;
    let active = true;
    loadRef.current().then(
      (data) => {
        if (active) setSettled({ key: requestKey, data, failed: false, error: undefined });
      },
      (error: unknown) => {
        if (active) setSettled((prev) => ({ key: requestKey, data: prev?.data, failed: true, error }));
      },
    );
    return () => {
      active = false;
    };
  }, [requestKey]);

  const current = settled !== null && settled.key === requestKey;
  const reload = useCallback(() => setReloadCount((n) => n + 1), []);

  return {
    data: settled?.data,
    /** 今の条件で失敗したか（読み込み中は false） */
    failed: current && settled.failed,
    error: current && settled.failed ? settled.error : undefined,
    loading: !current,
    reload,
  };
}
