"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Search, Settings, FilePlus } from "lucide-react";
import { isAuthenticated, getUser } from "@/lib/auth";
import SidebarLayout from "@/components/shared/SidebarLayout";
import type { SidebarEntry } from "@/components/shared/Sidebar";

const SIDEBAR_ITEMS: SidebarEntry[] = [
  { href: "/my", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/my/wizard", label: "申請ウィザード", icon: FilePlus },
  { href: "/my/applications", label: "申請一覧", icon: FileText },
  { href: "/my/matches", label: "マッチング履歴", icon: Search },
  { separator: true },
  { href: "/my/settings", label: "アカウント設定", icon: Settings },
];

/** ログイン済み & ロール OK かをクライアントサイドで同期チェック */
function checkReady(): boolean {
  if (typeof window === "undefined") return false; // SSR は常に false
  if (!isAuthenticated()) return false;
  const user = getUser();
  if (!user) return false;
  return user.role === "owner" || user.role === "admin";
}

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // useState の lazy initializer で初回レンダリング時に同期チェック
  // → ログイン済みなら ready=true のまま描画 → フラッシュゼロ
  const [ready, setReady] = useState<boolean>(() => checkReady());

  useEffect(() => {
    if (!isAuthenticated()) {
      setReady(false);
      router.replace(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    const user = getUser();
    if (user && user.role !== "owner" && user.role !== "admin") {
      setReady(false);
      router.replace("/");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  // null ではなく空の div を返してレイアウトシフト（一瞬縦長になる現象）を防ぐ
  if (!ready) return <div style={{ minHeight: "100vh" }} />;

  return (
    <SidebarLayout sidebarItems={SIDEBAR_ITEMS}>
      {children}
    </SidebarLayout>
  );
}
