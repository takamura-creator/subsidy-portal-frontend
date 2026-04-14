"use client";

import { useState, type ReactNode } from "react";

type Props = {
  left?: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  showLeft?: boolean;
  showRight?: boolean;
};

export default function ThreeColumnLayout({
  left,
  center,
  right,
  showLeft = true,
  showRight = true,
}: Props) {
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(null);

  return (
    <div className="hc-columns">
      {/* Left column — desktop only (or mobile overlay) */}
      {showLeft && left && (
        <>
          {/* Desktop */}
          <aside className="hc-col-left hidden lg:block">{left}</aside>

          {/* Mobile overlay */}
          {mobilePanel === "left" && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setMobilePanel(null)}
              />
              <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--hc-bg)] overflow-y-auto p-4 shadow-lg z-50">
                <button
                  onClick={() => setMobilePanel(null)}
                  className="mb-4 text-sm text-[var(--hc-text-muted)] hover:text-[var(--hc-text)]"
                >
                  ✕ 閉じる
                </button>
                {left}
              </aside>
            </div>
          )}
        </>
      )}

      {/* Center column */}
      <main className="hc-col-center">
        {/* Mobile toggle buttons */}
        <div className="flex gap-2 mb-4 lg:hidden">
          {showLeft && left && (
            <button
              onClick={() => setMobilePanel("left")}
              className="btn-secondary text-xs py-1 px-3"
            >
              ☰ ガイド
            </button>
          )}
          {showRight && right && (
            <button
              onClick={() => setMobilePanel("right")}
              className="btn-secondary text-xs py-1 px-3"
            >
              ツール ▸
            </button>
          )}
        </div>
        {center}
      </main>

      {/* Right column — desktop only (or mobile overlay) */}
      {showRight && right && (
        <>
          <aside className="hc-col-right hidden lg:block">{right}</aside>

          {mobilePanel === "right" && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setMobilePanel(null)}
              />
              <aside className="absolute right-0 top-0 bottom-0 w-[300px] bg-[var(--hc-bg)] overflow-y-auto p-4 shadow-lg z-50">
                <button
                  onClick={() => setMobilePanel(null)}
                  className="mb-4 text-sm text-[var(--hc-text-muted)] hover:text-[var(--hc-text)]"
                >
                  ✕ 閉じる
                </button>
                {right}
              </aside>
            </div>
          )}
        </>
      )}
    </div>
  );
}
