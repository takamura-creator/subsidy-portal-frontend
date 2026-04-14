"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/subsidies", label: "補助金を探す" },
  { href: "/contractors", label: "工事業者を探す" },
  { href: "/match", label: "AI診断" },
  { href: "/about", label: "使い方" },
];

export default function HCHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-5"
      style={{
        height: "var(--hc-header-h)",
        background: "rgba(250,250,245,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--hc-border)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/images/turtle_logo.png"
          alt="HOJYO CAME"
          width={22}
          height={22}
        />
        <span
          className="font-display font-bold text-base"
          style={{ letterSpacing: "-0.5px" }}
        >
          <span style={{ color: "var(--hc-navy)" }}>HOJYO</span>
          <span style={{ color: "var(--hc-primary)" }}>CAME</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-medium transition-colors"
            style={{ color: "var(--hc-text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--hc-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--hc-text-muted)")
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right: login + mobile hamburger */}
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="text-xs font-medium px-4 py-2 rounded-md border transition-colors"
          style={{
            borderColor: "var(--hc-border)",
            color: "var(--hc-text)",
          }}
        >
          ログイン
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
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
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          className="absolute top-full left-0 right-0 md:hidden border-b shadow-md p-4 flex flex-col gap-3"
          style={{
            background: "var(--hc-bg)",
            borderColor: "var(--hc-border)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-2"
              style={{ color: "var(--hc-text)" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
