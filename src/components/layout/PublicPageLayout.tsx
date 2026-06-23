/**
 * PublicPageLayout — 公開ページ共通外枠
 *
 * maxWidth 1120px 中央寄せ / 上下 section 余白。
 * Server Component（"use client" 不要）。
 * 上下パディングは .hc-section クラス（globals.css 定義）を流用。
 */

import type { ReactNode } from "react";

interface PublicPageLayoutProps {
  children: ReactNode;
  /** 上下パディングを hc-section(96/128px) から hc-hero(120/140px) に変える */
  variant?: "section" | "hero";
  className?: string;
}

export default function PublicPageLayout({
  children,
  variant = "section",
  className,
}: PublicPageLayoutProps) {
  return (
    <main
      className={[variant === "hero" ? "hc-hero" : "hc-section", className].filter(Boolean).join(" ")}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 24px",
          width: "100%",
        }}
      >
        {children}
      </div>
    </main>
  );
}
