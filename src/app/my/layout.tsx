"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Search, Settings } from "lucide-react";
import { isAuthenticated, getUser, requireAuth } from "@/lib/auth";
import SidebarLayout from "@/components/shared/SidebarLayout";
import type { SidebarEntry } from "@/components/shared/Sidebar";

const SIDEBAR_ITEMS: SidebarEntry[] = [
  { href: "/my", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/my/applications", label: "申請一覧", icon: FileText },
  { href: "/my/matches", label: "マッチング履歴", icon: Search },
  { separator: true },
  { href: "/my/settings", label: "アカウント設定", icon: Settings },
];

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = `/auth/login?returnUrl=${encodeURIComponent(pathname)}`;
      return;
    }
    const user = getUser();
    if (user && user.role !== "owner" && user.role !== "admin") {
      window.location.href = "/biz";
      return;
    }
    setReady(true);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text2 text-sm">認証確認中...</div>
      </div>
    );
  }

  return (
    <SidebarLayout sidebarItems={SIDEBAR_ITEMS}>
      {children}
    </SidebarLayout>
  );
}
