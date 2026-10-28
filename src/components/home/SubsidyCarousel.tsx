"use client";

/**
 * SubsidyCarousel — トップページの「最新補助金情報」横流れカルーセル。
 *
 * 2026-09-15 注文書（frontend API切替）: 静的JSON直読みを廃止し `fetchSubsidies()`
 * （lib/api.ts・バックエンド `/api/subsidies`）を優先ソースにする。API不達時のみ
 * 同梱データ（ビルド時スナップショット）にフォールバックし、その間は
 * StaleDataNotice（compact）で「古い可能性」を明示する（黙って古いデータを出さない）。
 *
 * ⚠ 2026-10-28（審査[4]）: このカルーセルは現在どのページにも出ていない（読み込むのは
 *   _deprecatedHeroStage.tsx だけで、それをどこも読み込んでいない）。filterCameraOnly も
 *   CameraEligibilityNote・IndirectApplicantNote・都道府県ごとの受付終了も通していないため、
 *   再びページに置くときは、一覧のカード（SubsidiesCardGrid）と同じ絞り込みと注記を先に入れること。
 */

import { useEffect, useState } from "react";
import { fetchSubsidies, type Subsidy } from "@/lib/api";
import { formatSubsidyAmount, hasAmountCap } from "@/lib/subsidyFormatters";
import { subsidyStatusLabel } from "@/lib/subsidyStatus";
import StaleDataNotice from "@/components/subsidies/StaleDataNotice";
import subsidiesJson from "@/data/subsidies.json";

// 最終フォールバック用の同梱データ（API不達時のみ使用）
const BUNDLED_SUBSIDIES: Subsidy[] = (subsidiesJson as { subsidies: Subsidy[] }).subsidies ?? [];

const VISIBLE_COUNT = 5;
const TOTAL_CARDS = 20;

/**
 * 受付中（open）を先に、足りなければ公募予定（upcoming）で埋める。受付終了（closed）は出さない。
 * それぞれの中は API の返却順を保つ。公募予定のカードには状態を添える（受付中に見せない）。
 */
function pickOpenCards(list: Subsidy[]): Subsidy[] {
  const open = list.filter((s) => s.status === "open");
  const upcoming = list.filter((s) => s.status === "upcoming");
  return [...open, ...upcoming].slice(0, TOTAL_CARDS);
}

export default function SubsidyCarousel() {
  const [cards, setCards] = useState<Subsidy[]>(() => pickOpenCards(BUNDLED_SUBSIDIES));
  // 「最新情報を取得できず」は API が実際に失敗したとき（catch）だけ出す（2026-10-27 審査[5]）。
  // 初期値を true にすると読み込み中とサーバー描画の HTML（クローラーが読む本文）にも警告が入り、
  // API が正常なときにも毎回誤った警告を出していた。読み込み中は同梱データを黙って先に見せ、API 応答で差し替える。
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSubsidies()
      .then((res) => {
        if (cancelled) return;
        setCards(pickOpenCards(res.subsidies ?? []));
        setStale(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCards(pickOpenCards(BUNDLED_SUBSIDIES));
        setStale(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (cards.length === 0) return null;

  const track = [...cards, ...cards];

  return (
    <div className="subsidy-carousel" aria-label="最新補助金情報">
      {stale && <StaleDataNotice compact />}
      <div
        className="subsidy-carousel-track"
        style={
          {
            "--card-count": cards.length,
            "--visible": VISIBLE_COUNT,
          } as React.CSSProperties
        }
      >
        {track.map((s, i) => (
          <div className="subsidy-card" key={`${s.id}-${i}`}>
            <span className="subsidy-card-pref">
              {s.prefecture}
              {s.status !== "open" && `・${subsidyStatusLabel(s.status)}`}
            </span>
            <p className="subsidy-card-name">{s.name}</p>
            <span className="subsidy-card-amount">
              {hasAmountCap(s.max_amount)
                ? `最大 ${formatSubsidyAmount(s)}`
                : `上限は${formatSubsidyAmount(s)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
