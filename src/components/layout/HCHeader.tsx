"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

type UserPayload = ReturnType<typeof getUser>;

const NAV_LINKS = [
  { href: "/subsidies", label: "補助金を探す" },
  { href: "/results", label: "交付実績" },
  { href: "/partners/multik", label: "施工パートナー" },
  { href: "/strategy", label: "活用戦略" },
  { href: "/match", label: "AI診断" },
  { href: "/contact", label: "お問い合わせ" },
];

export default function HCHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserPayload>(null);
  const pathname = usePathname();
  const router = useRouter();

  // hydration safe pattern: getUser() reads localStorage (window object), SSR で実行すると
  // ReferenceError になるため useEffect 内で呼び出す。
  // 規約「getUser() は同期呼び出し」は「DB 非同期 API を使うな」の趣旨であり、
  // Next.js App Router での localStorage アクセスは useEffect が正しいパターン。
  useEffect(() => {
    setUser(getUser());
  }, []);

  // ルート変更時にメニューを閉じる
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  function handleLogout() {
    logout();
  }

  return (
    <header
      className="flex items-center justify-between px-5 flex-shrink-0 relative"
      style={{
        position: "sticky",
        top: 0,
        height: "var(--hc-header-h)",
        background: "var(--hc-header-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--hc-primary-edge)",
        zIndex: 100,
      }}
    >
      {/* Logo — 亀アイコン + HOJYO CAME */}
      <Link
        href="/"
        aria-label="HOJYO CAME トップへ"
        className="flex items-center gap-2"
        style={{ textDecoration: "none", background: "none", border: "none", boxShadow: "none", outline: "none" }}
      >
        <Image
          src="/images/turtle_logo.png"
          alt=""
          width={22}
          height={22}
          priority
          style={{ objectFit: "contain" }}
        />
        <span
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "2px",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "var(--hc-brand-hojyo)" }}>HOJYO</span>
          <span style={{ color: "var(--hc-brand-came)" }}> CAME</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-medium no-underline transition-colors"
            style={{
              color: isActive(link.href) ? "var(--hc-primary)" : "var(--hc-text-muted)",
              fontWeight: isActive(link.href) ? 600 : 500,
              borderBottom: isActive(link.href) ? "2px solid var(--hc-primary)" : "2px solid transparent",
              paddingBottom: "2px",
            }}
            onMouseEnter={(e) => {
              if (!isActive(link.href)) {
                e.currentTarget.style.color = "var(--hc-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(link.href)) {
                e.currentTarget.style.color = "var(--hc-text-muted)";
              }
            }}
          >
            {link.label}
          </Link>
        ))}

        {/* ログイン後のみ表示: マイページ */}
        {user && (
          <Link
            href="/my"
            className="text-xs font-medium no-underline transition-colors"
            style={{
              color: isActive("/my") ? "var(--hc-teal)" : "var(--hc-text-muted)",
              fontWeight: isActive("/my") ? 600 : 500,
              borderBottom: isActive("/my") ? "2px solid var(--hc-teal)" : "2px solid transparent",
              paddingBottom: "2px",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/my")) {
                e.currentTarget.style.color = "var(--hc-teal)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive("/my")) {
                e.currentTarget.style.color = "var(--hc-text-muted)";
              }
            }}
          >
            マイページ
          </Link>
        )}
      </nav>

      {/* 右端: 認証UI */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <>
            <span
              style={{
                fontSize: "11px",
                color: "var(--hc-text-muted)",
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.company_name ?? user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                fontSize: "11px",
                color: "var(--hc-text-muted)",
                background: "none",
                border: "1px solid var(--hc-border)",
                borderRadius: 4,
                padding: "3px 8px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ログアウト
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            style={{
              fontSize: "11px",
              color: "var(--hc-teal)",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid var(--hc-teal)",
              borderRadius: 4,
              padding: "3px 10px",
            }}
          >
            ログイン
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-1"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="メニュー"
        aria-expanded={menuOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {menuOpen ? (
            <path d="M5 5L15 15M15 5L5 15" />
          ) : (
            <path d="M3 5h14M3 10h14M3 15h14" />
          )}
        </svg>
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          className="absolute top-full left-0 right-0 md:hidden border-b shadow-md p-4 flex flex-col gap-3"
          style={{
            background: "var(--hc-header-bg-mobile)",
            borderColor: "var(--hc-border)",
            zIndex: 99,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-2 no-underline"
              style={{
                color: isActive(link.href) ? "var(--hc-primary)" : "var(--hc-text)",
                fontWeight: isActive(link.href) ? 600 : 400,
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/my"
              className="text-sm font-medium py-2 no-underline"
              style={{
                color: isActive("/my") ? "var(--hc-teal)" : "var(--hc-text)",
                fontWeight: isActive("/my") ? 600 : 400,
              }}
              onClick={() => setMenuOpen(false)}
            >
              マイページ
            </Link>
          )}
          {user ? (
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="text-sm font-medium py-2 text-left"
              style={{
                background: "none",
                border: "none",
                color: "var(--hc-text-muted)",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "8px 0",
              }}
            >
              ログアウト
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium py-2 no-underline"
              style={{ color: "var(--hc-teal)" }}
              onClick={() => setMenuOpen(false)}
            >
              ログイン
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
