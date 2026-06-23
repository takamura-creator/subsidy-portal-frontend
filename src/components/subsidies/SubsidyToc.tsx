"use client";

/**
 * 補助金詳細ページ目次コンポーネント
 * SubsidyDetailClient から抽出。TOC_ITEMS + activeSection state を内包。
 */

import { useState } from "react";
import Link from "next/link";

const TOC_ITEMS = [
  { href: "#overview", label: "概要" },
  { href: "#requirements", label: "対象要件" },
  { href: "#amount", label: "補助額・補助率" },
  { href: "#deadline", label: "締切・スケジュール" },
  { href: "#howto", label: "申請方法" },
  { href: "#industries", label: "対象業種" },
  { href: "#documents", label: "必要書類一覧" },
];

interface SubsidyTocProps {
  activeSection?: string;
  onSectionChange?: (href: string) => void;
}

export default function SubsidyToc({ activeSection: initialSection = "#overview", onSectionChange }: SubsidyTocProps) {
  const [activeSection, setActiveSection] = useState(initialSection);

  const handleClick = (href: string) => {
    setActiveSection(href);
    onSectionChange?.(href);
  };

  return (
    <div>
      <Link
        href="/subsidies"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: "var(--hc-text-muted)",
          textDecoration: "none",
          marginBottom: 16,
          transition: "color 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--hc-primary)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--hc-text-muted)")}
      >
        &larr; 補助金一覧
      </Link>

      <span className="section-title">目次</span>

      <div className="link-list">
        {TOC_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => handleClick(item.href)}
            style={{
              display: "block",
              padding: "8px 10px",
              marginBottom: 2,
              borderRadius: 6,
              fontSize: 13,
              color: activeSection === item.href ? "var(--hc-primary)" : "var(--hc-text-muted)",
              textDecoration: "none",
              transition: "all 0.15s",
              background: activeSection === item.href ? "var(--hc-primary-muted)" : "transparent",
              fontWeight: activeSection === item.href ? 500 : 400,
              borderLeft: activeSection === item.href ? "3px solid var(--hc-primary)" : "3px solid transparent",
              paddingLeft: activeSection === item.href ? 7 : 10,
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
