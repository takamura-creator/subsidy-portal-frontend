"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackDiagnosisStart } from "@/lib/analytics";
import type { PrefMaxSubsidy } from "@/data/prefecture-max-subsidy";

type Props = {
  prefectures: PrefMaxSubsidy[];
  ctaHref: string;
  ctaLabel: string;
};

/** CSS クラス名で亀うなずきを1回トリガするユーティリティ */
function triggerNod(el: HTMLElement | null): void {
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;
  el.classList.remove("hc-turtle-nod");
  // reflow を挟んで再付与（同一フレームのクラス付与が無視されるのを防ぐ）
  void el.offsetWidth;
  el.classList.add("hc-turtle-nod");
}

export default function PrefectureAnswerFinder({ prefectures, ctaHref, ctaLabel }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [displayValue, setDisplayValue] = useState<number>(0);
  const turtleRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // C1: アンマウント時に進行中の rAF をキャンセル
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const currentEntry = selected
    ? prefectures.find((p) => p.name === selected) ?? null
    : null;

  function runCountUp(target: number): void {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplayValue(target);
      return;
    }
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const duration = 800;

    function tick(now: number) {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // ease-out cubic: 1 - (1-p)^3
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayValue(Math.round(eased * target));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const name = e.target.value;
    if (!name) {
      setSelected(null);
      setDisplayValue(0);
      return;
    }
    setSelected(name);
    const entry = prefectures.find((p) => p.name === name);
    if (entry?.maxManYen != null) {
      runCountUp(entry.maxManYen);
    }
    trackDiagnosisStart(name);
    triggerNod(turtleRef.current);
  }

  const hasAmount = currentEntry?.maxManYen != null;

  return (
    <div className="paf-wrapper">
      {/* 亀（うなずき対象） */}
      <img
        ref={turtleRef}
        className="turtle paf-turtle"
        src="/images/turtle_wave.png"
        alt="HOJYO CAME キャラクター"
        width={96}
        height={96}
      />

      {/* セレクタ */}
      <div className="paf-select-group">
        <label htmlFor="paf-select" className="paf-select-label">
          お住まい・事業所の地域
        </label>
        <select
          id="paf-select"
          className="form-select paf-select"
          aria-label="お住まい・事業所の地域"
          defaultValue=""
          onChange={handleChange}
        >
          <option value="" disabled>
            地域を選択
          </option>
          {prefectures.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 金額表示ブロック */}
      <div className="paf-amount-block" aria-live="polite" aria-atomic="true">
        {selected && hasAmount ? (
          <>
            <p className="paf-amount-label">目安 最大</p>
            <p className="paf-amount-value">
              <span className="paf-amount-number">{displayValue.toLocaleString()}</span>
              <span className="paf-amount-unit">万円</span>
            </p>
            <p className="paf-amount-note">※制度・条件により異なります</p>
          </>
        ) : (
          <p className="paf-fallback">対応制度をすぐに無料診断できます</p>
        )}
      </div>

      {/* CTA */}
      <Link href={ctaHref} className="cta-primary" suppressHydrationWarning>
        {ctaLabel}
      </Link>

      {/* support chips */}
      <div className="support-items">
        <span className="support-chip">無料・登録不要</span>
        <span className="support-chip">約30秒</span>
        <span className="support-chip">主要な国・自治体の制度に対応</span>
      </div>
    </div>
  );
}
