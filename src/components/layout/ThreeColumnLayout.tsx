"use client";

import { useState, type ReactNode, type CSSProperties } from "react";

type Props = {
  left?: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  showLeft?: boolean;
  showRight?: boolean;
  /** CSS grid-template-columns value, e.g. "240px 1fr 240px" */
  gridCols?: string;
};

export default function ThreeColumnLayout({
  left,
  center,
  right,
  showLeft = true,
  showRight = true,
  gridCols,
}: Props) {
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(null);

  const hasLeft = showLeft && left;
  const hasRight = showRight && right;

  // Compute grid columns from props or defaults
  const columns =
    gridCols ??
    (hasLeft && hasRight
      ? "240px 1fr 240px"
      : !hasLeft && hasRight
        ? "1fr 240px"
        : hasLeft && !hasRight
          ? "240px 1fr"
          : "1fr");

  const gridStyle: CSSProperties = {
    gridTemplateColumns: columns,
  };

  return (
    <div className="hc-columns" style={gridStyle}>
      {/* Left column */}
      {hasLeft && (
        <>
          <aside className="hc-col-left hidden md:block">{left}</aside>
          {mobilePanel === "left" && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setMobilePanel(null)}
              />
              <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-white overflow-y-auto p-4 shadow-lg z-50">
                <button
                  onClick={() => setMobilePanel(null)}
                  className="mb-4 text-sm"
                  style={{ color: "var(--hc-text-muted)" }}
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
        <div className="flex gap-2 mb-4 md:hidden">
          {hasLeft && (
            <button
              onClick={() => setMobilePanel("left")}
              className="btn-secondary text-xs py-1 px-3"
            >
              ☰ メニュー
            </button>
          )}
          {hasRight && (
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

      {/* Right column */}
      {hasRight && (
        <>
          <aside className="hc-col-right hidden md:block">{right}</aside>
          {mobilePanel === "right" && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setMobilePanel(null)}
              />
              <aside className="absolute right-0 top-0 bottom-0 w-[300px] bg-white overflow-y-auto p-4 shadow-lg z-50">
                <button
                  onClick={() => setMobilePanel(null)}
                  className="mb-4 text-sm"
                  style={{ color: "var(--hc-text-muted)" }}
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
