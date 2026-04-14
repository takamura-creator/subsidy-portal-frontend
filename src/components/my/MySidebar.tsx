"use client";

import Link from "next/link";

const MENU_ITEMS = [
  { href: "/my", label: "ダッシュボード", icon: "📋" },
  { href: "/my/applications", label: "申請一覧", icon: "📄", countKey: "applications" },
  { href: "/my/matches", label: "マッチング履歴", icon: "🔍", countKey: "matches" },
  { href: "/my/settings", label: "アカウント設定", icon: "⚙" },
];

interface MySidebarProps {
  active: string;
  counts?: Record<string, number>;
}

export default function MySidebar({ active, counts }: MySidebarProps) {
  return (
    <nav>
      <span className="section-title">マイページ</span>
      {MENU_ITEMS.map((item) => {
        const isActive = active === item.href;
        const count = item.countKey ? counts?.[item.countKey] : undefined;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              marginBottom: 2,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)",
              background: isActive ? "rgba(21,128,61,0.06)" : "transparent",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            <span>
              <span style={{ marginRight: 6, fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </span>
            {count != null && (
              <span
                style={{
                  fontSize: 11,
                  background: item.countKey === "applications" ? "var(--hc-accent-light)" : "rgba(0,0,0,0.04)",
                  color: item.countKey === "applications" ? "var(--hc-accent)" : "inherit",
                  padding: "1px 6px",
                  borderRadius: 9999,
                }}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
