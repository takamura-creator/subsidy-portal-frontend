"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getUser, logout } from "@/lib/auth";
import { fetchProfileDetail } from "@/lib/api";

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  separator?: false;
  /** 子項目（active 時に展開表示） */
  submenu?: { href: string; label: string }[];
}

export interface SidebarSeparator {
  separator: true;
}

export type SidebarEntry = SidebarItem | SidebarSeparator;

interface SidebarProps {
  items: SidebarEntry[];
}

const ROLE_LABEL: Record<string, string> = {
  owner: "企業ユーザー",
  contractor: "工事業者",
  admin: "管理者",
};

export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const user = getUser();
  const [dbCompanyName, setDbCompanyName] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileDetail()
      .then((p) => { if (p.company_name) setDbCompanyName(p.company_name); })
      .catch(() => {});
  }, []);

  const displayName = dbCompanyName ?? user?.company_name ?? user?.email ?? "ユーザー";

  const isActive = (href: string) => {
    if (href === "/my") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-bg-card border-r border-border">
      {/* ユーザー情報 */}
      <div className="p-4 border-b border-border">
        <div className="font-medium text-sm text-text truncate">
          {displayName}
        </div>
        <div className="text-xs text-text2 mt-0.5">
          {user?.role ? ROLE_LABEL[user.role] ?? user.role : ""}
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 p-2 space-y-0.5">
        {items.map((item, i) => {
          if (item.separator) {
            return <div key={i} className="my-2 border-t border-border" />;
          }
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-text2 hover:bg-bg-surface hover:text-text"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {item.label}
              </Link>
              {item.submenu && active && (
                <div className="ml-9 mt-0.5 mb-1 flex flex-col gap-0.5">
                  {item.submenu.map((sub) => {
                    const subActive = pathname === sub.href ||
                      pathname + (typeof window !== "undefined" ? window.location.search : "") === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`px-2 py-1.5 rounded-md text-[12px] transition-colors ${
                          subActive
                            ? "text-primary font-semibold bg-primary/5"
                            : "text-text2 hover:text-text hover:bg-bg-surface"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ログアウト */}
      <div className="p-2 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-sm font-medium text-text2 hover:bg-bg-surface hover:text-text transition-colors"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          ログアウト
        </button>
      </div>
    </div>
  );
}
