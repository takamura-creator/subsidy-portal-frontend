"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, FilePlus } from "lucide-react";
import { isAuthenticated, getUser, getRefreshToken } from "@/lib/auth";
import { ensureFreshToken } from "@/lib/api";
import SidebarLayout from "@/components/shared/SidebarLayout";
import StatusBar from "@/components/layout/StatusBar";
import type { SidebarEntry } from "@/components/shared/Sidebar";

const SIDEBAR_ITEMS: SidebarEntry[] = [
  { href: "/my", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/my/wizard", label: "申請ウィザード", icon: FilePlus },
  { separator: true },
  {
    href: "/my/settings",
    label: "アカウント設定",
    icon: Settings,
    submenu: [
      { href: "/my/settings?tab=profile", label: "プロフィール" },
      { href: "/my/settings?tab=notifications", label: "通知設定" },
      { href: "/my/settings?tab=security", label: "セキュリティ" },
    ],
  },
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
    let cancelled = false;

    const toLogin = () => {
      // クエリ文字列(例: 診断結果から来た ?subsidy_id=)を戻り先に保持する。
      // pathname は Next.js が組み立てる同一オリジンのルートパスで必ず単一の "/" から
      // 始まるため、search をどう足してもここで "//" 始まりにはなり得ない
      // （オープンリダイレクト対策は auth/login/page.tsx 側の検証をそのまま維持・不変更）。
      // 既存規約 = lib/api.ts の authFetch 401 リダイレクトと同型
      // （window.location.pathname + window.location.search）。
      const search = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`/auth/login?returnUrl=${encodeURIComponent(pathname + search)}`);
    };

    /** ログイン済みと確認できた後のロール判定（従来どおり） */
    const admitByRole = () => {
      const user = getUser();
      if (user && user.role !== "owner" && user.role !== "admin") {
        setReady(false);
        router.replace("/");
        return;
      }
      setReady(true);
    };

    if (!isAuthenticated()) {
      setReady(false);
      // 2026-11-01 PR-D: access token の期限切れでも refresh token があれば先に1回だけ取り直す
      // （旧: 即ログイン画面へ。作業中の再読み込みで突然ログアウトされたように見えていた）。
      // 取り直せなければ従来どおりログイン画面へ。取り直している間は空の div のまま
      if (getRefreshToken()) {
        void ensureFreshToken().then((token) => {
          if (cancelled) return;
          if (token && isAuthenticated()) admitByRole();
          else toLogin();
        });
        return () => {
          cancelled = true;
        };
      }
      toLogin();
      return;
    }
    admitByRole();
  }, [pathname, router]);

  // null ではなく空の div を返してレイアウトシフト（一瞬縦長になる現象）を防ぐ
  if (!ready) return <div style={{ minHeight: "100vh" }} />;

  return (
    <>
      <SidebarLayout sidebarItems={SIDEBAR_ITEMS}>
        {children}
      </SidebarLayout>
      <StatusBar />
    </>
  );
}
