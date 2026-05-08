"use client";

import { useMemo } from "react";
import subsidiesData from "@/data/subsidies.json";

function formatAmount(amount: number): string {
  if (amount >= 10000000) return `${amount / 10000000}億円`;
  if (amount >= 10000) return `${(amount / 10000).toLocaleString()}万円`;
  return `${amount.toLocaleString()}円`;
}

const VISIBLE_COUNT = 5;
const TOTAL_CARDS = 20;

export default function SubsidyCarousel() {
  const cards = useMemo(() => {
    const open = subsidiesData.subsidies.filter((s) => s.status === "open");
    return open.slice(0, TOTAL_CARDS);
  }, []);

  if (cards.length === 0) return null;

  const track = [...cards, ...cards];

  return (
    <div className="subsidy-carousel" aria-label="最新補助金情報">
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
            <span className="subsidy-card-pref">{s.prefecture}</span>
            <p className="subsidy-card-name">{s.name}</p>
            <span className="subsidy-card-amount">
              最大 {formatAmount(s.max_amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
