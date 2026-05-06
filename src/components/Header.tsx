"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: "/subsidies", label: "補助金を探す" },
    { href: "/partners/multik", label: "施工パートナー" },
    { href: "/cases", label: "導入事例" },
    { href: "/about", label: "運営者情報" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 bg-[var(--hc-white)] border-b border-[var(--hc-border)] ${
        scrolled ? "shadow-[var(--hc-shadow-md)]" : ""
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo — 亀キャラ + HOJYO CAME */}
        <Link
          href="/"
          aria-label="HOJYO CAME トップへ"
          className="flex items-center gap-3"
        >
          <Image
            src="/images/turtle_logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="shrink-0"
          />
          <span
            className="font-display text-[18px] font-bold leading-none"
            style={{ letterSpacing: "3px" }}
          >
            <span style={{ color: "var(--hc-brand-hojyo)" }}>HOJYO</span>
            <span style={{ color: "var(--hc-brand-came)" }}> CAME</span>
          </span>
        </Link>

        {/* Desktop Nav — 中央 */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium px-3 py-2 rounded-[8px] transition ${
                isActive(l.href)
                  ? "text-primary bg-primary/5"
                  : "text-[var(--hc-text-muted)] hover:text-[var(--hc-text)] hover:bg-[var(--hc-bg)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA — 右寄せ */}
        <div className="hidden md:block">
          <Link
            href="/match"
            className="bg-primary hover:bg-[var(--hc-primary-hover)] text-white text-sm font-medium px-5 py-2.5 rounded-[8px] transition"
          >
            無料で診断する
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-[8px] hover:bg-[var(--hc-bg)] transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
          aria-expanded={menuOpen}
        >
          <svg className="w-6 h-6 text-[var(--hc-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[var(--hc-white)] border-t border-[var(--hc-border)] px-4 pb-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-3 text-sm font-medium transition border-b border-[var(--hc-border)]/50 ${
                isActive(l.href)
                  ? "text-primary"
                  : "text-[var(--hc-text-muted)] hover:text-[var(--hc-text)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/match"
            className="block mt-3 bg-primary text-white text-center text-sm font-medium px-4 py-3 rounded-[8px] hover:bg-[var(--hc-primary-hover)] transition"
          >
            無料で診断する
          </Link>
        </div>
      </div>
    </header>
  );
}
