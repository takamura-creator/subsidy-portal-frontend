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
      className="flex items-center justify-between px-5 flex-shrink-0 relative"
      style={{
        height: "var(--hc-header-h)",
        background: "rgba(228,238,228,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(21,128,61,0.08)",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-1.5"
        style={{ textDecoration: "none", background: "none", border: "none", boxShadow: "none", outline: "none" }}
      >
        <Image
          src="/images/turtle_logo.png"
          alt="HOJYO CAME"
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
        />
        <span
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: "var(--hc-navy)" }}>HOJYO</span>{" "}
          <span style={{ color: "var(--hc-primary)" }}>CAME</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-medium no-underline transition-colors"
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

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          className="absolute top-full left-0 right-0 md:hidden border-b shadow-md p-4 flex flex-col gap-3"
          style={{
            background: "rgba(240,253,244,0.95)",
            borderColor: "var(--hc-border)",
            zIndex: 99,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-2 no-underline"
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
