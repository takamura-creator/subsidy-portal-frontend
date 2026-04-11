"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getUser, logout } from "@/lib/auth";

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  separator?: false;
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

  const isActive = (href: string) => {
    if (href === "/my" || href === "/biz") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-bg-card border-r border-border">
      {/* ユーザー情報 */}
      <div className="p-4 border-b border-border">
        <div className="font-medium text-sm text-text truncate">
          {user?.company_name ?? user?.email ?? "ユーザー"}
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
            <Link
              key={item.href}
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
