"use client";

/**
 * 補助金詳細ページ横並びスティッキーTOCナビ（SubsidyToc の置き換え）。
 * 高さ 48px / sticky top 0 / overflow-x: auto でスマホ対応。
 * アクティブ = inset bottom border in --hc-primary。
 */

import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "#overview",     label: "概要" },
  { href: "#requirements", label: "対象要件" },
  { href: "#amount",       label: "補助額・補助率" },
  { href: "#deadline",     label: "締切・スケジュール" },
  { href: "#howto",        label: "申請方法" },
  { href: "#industries",   label: "対象業種" },
  { href: "#documents",    label: "必要書類" },
];

const SECTION_IDS = NAV_ITEMS.map((item) => item.href.slice(1));

export default function AnchorNav() {
  const [active, setActive] = useState("#overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (href: string) => {
    setActive(href);
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: "var(--hc-header-h)",
        zIndex: 20,
        display: "flex",
        gap: 0,
        overflowX: "auto",
        height: 48,
        alignItems: "stretch",
        borderBottom: "1px solid var(--hc-border)",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      } as React.CSSProperties}
      aria-label="ページ内ナビゲーション"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={() => handleClick(item.href)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: isActive ? "inset 0 -2px 0 var(--hc-primary)" : "none",
              transition: "color 0.15s, box-shadow 0.15s",
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
