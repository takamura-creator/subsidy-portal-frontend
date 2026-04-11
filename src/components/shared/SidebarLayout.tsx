"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import type { SidebarEntry } from "./Sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarEntry[];
}

export default function SidebarLayout({ children, sidebarItems }: SidebarLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* デスクトップサイドバー */}
      <aside className="hidden md:block w-60 shrink-0">
        <div className="sticky top-16 h-[calc(100vh-64px)]">
          <Sidebar items={sidebarItems} />
        </div>
      </aside>

      {/* モバイルハンバーガー */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-[var(--portal-shadow-md)] flex items-center justify-center"
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
          <aside className="md:hidden fixed left-0 top-16 bottom-0 z-40 w-60 bg-bg-card shadow-[var(--portal-shadow-md)]">
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
