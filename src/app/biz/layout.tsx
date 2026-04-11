"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, User, Settings } from "lucide-react";
import { isAuthenticated, getUser } from "@/lib/auth";
import SidebarLayout from "@/components/shared/SidebarLayout";
import type { SidebarEntry } from "@/components/shared/Sidebar";

const SIDEBAR_ITEMS: SidebarEntry[] = [
  { href: "/biz", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/biz/projects", label: "案件一覧", icon: Briefcase },
  { href: "/biz/profile", label: "プロフィール", icon: User },
  { separator: true },
  { href: "/biz/settings", label: "アカウント設定", icon: Settings },
];

export default function BizLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = `/auth/login?returnUrl=${encodeURIComponent(pathname)}`;
      return;
    }
    const user = getUser();
    if (user && user.role !== "contractor" && user.role !== "admin") {
      window.location.href = "/my";
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
