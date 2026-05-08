"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Search, Settings } from "lucide-react";
import { isAuthenticated, getUser } from "@/lib/auth";
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
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      // router.replace でクライアント側遷移 → 画面フラッシュなし
      router.replace(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    const user = getUser();
    if (user && user.role !== "owner" && user.role !== "admin") {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    // null を返すことで一瞬の「認証確認中...」テキストフラッシュも防止
    return null;
  }

  return (
    <SidebarLayout sidebarItems={SIDEBAR_ITEMS}>
      {children}
    </SidebarLayout>
  );
}
