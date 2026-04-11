"use client";

import Link from "next/link";
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
    { href: "/match", label: "補助金診断" },
    { href: "/subsidies", label: "補助金一覧" },
    { href: "/contractors", label: "工事業者" },
    { href: "/about", label: "運営者情報" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 header-portal ${
        scrolled ? "shadow-[var(--portal-shadow-md)]" : ""
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo — 左寄せ */}
        <Link href="/" className="text-xl font-medium tracking-tight text-secondary">
          <span className="text-primary">補助金</span>ポータル
        </Link>

        {/* Desktop Nav — 中央 */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium px-3 py-2 rounded-[10px] transition ${
                isActive(l.href)
                  ? "text-primary bg-primary/5"
                  : "text-text2 hover:text-text hover:bg-bg-surface"
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
            className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded-[10px] transition"
          >
            無料診断
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-[10px] hover:bg-bg-surface transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
          aria-expanded={menuOpen}
        >
          <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="bg-bg border-t border-border px-4 pb-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-3 text-sm font-medium transition border-b border-border/50 ${
                isActive(l.href) ? "text-primary" : "text-text2 hover:text-text"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/match"
            className="block mt-3 bg-primary text-white text-center text-sm font-medium px-4 py-3 rounded-[10px] hover:bg-primary/90 transition"
          >
            無料診断する
          </Link>
        </div>
      </div>
    </header>
  );
}
