"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import type { SidebarEntry } from "./Sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarEntry[];
}

// ヘッダー 52px + StatusBar 28px = 80px
const HEADER_H = "52px";
const STATUSBAR_H = "28px";

export default function SidebarLayout({ children, sidebarItems }: SidebarLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: `calc(100vh - ${HEADER_H} - ${STATUSBAR_H})` }}>
      {/* デスクトップサイドバー */}
      <aside className="hidden md:block w-60 shrink-0">
        <div
          className="sticky"
          style={{
            top: HEADER_H,
            height: `calc(100vh - ${HEADER_H} - ${STATUSBAR_H})`,
          }}
        >
          <Sidebar items={sidebarItems} />
        </div>
      </aside>

      {/* モバイルハンバーガー */}
      <button
        className="md:hidden fixed right-4 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-[var(--portal-shadow-md)] flex items-center justify-center"
        style={{ bottom: `calc(${STATUSBAR_H} + 16px)` }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="メニュー"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* モバイルオーバーレイ */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="md:hidden fixed left-0 z-40 w-60 bg-bg-card shadow-[var(--portal-shadow-md)]"
            style={{ top: HEADER_H, bottom: STATUSBAR_H }}
          >
            <Sidebar items={sidebarItems} />
          </aside>
        </>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[960px] mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
