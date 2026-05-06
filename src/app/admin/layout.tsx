"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  FileText,
  Users,
  ExternalLink,
} from "lucide-react";
import { isAuthenticated, getUser } from "@/lib/auth";
import SidebarLayout from "@/components/shared/SidebarLayout";
import type { SidebarEntry } from "@/components/shared/Sidebar";

const SIDEBAR_ITEMS: SidebarEntry[] = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/subsidies", label: "補助金管理", icon: Database },
  { href: "/admin/applications", label: "申請管理", icon: FileText },
  { href: "/admin/users", label: "ユーザー管理", icon: Users },
  { separator: true },
  { href: "/", label: "サイトを表示", icon: ExternalLink },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = `/auth/login?returnUrl=${encodeURIComponent(pathname)}`;
      return;
    }
    const user = getUser();
    if (user && user.role !== "admin") {
      window.location.href = "/";
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
