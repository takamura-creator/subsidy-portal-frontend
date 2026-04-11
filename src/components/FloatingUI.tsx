"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingUI() {
  const [showTop, setShowTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // /match ページでは診断CTAバーを非表示
  const hideCtaBar = pathname.startsWith("/match");

  return (
    <>
      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        aria-label="ページの先頭に戻る"
        className={`fixed right-4 z-40 w-11 h-11 rounded-full bg-secondary text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-secondary/80 ${
          showTop
            ? "opacity-100 translate-y-0 bottom-20 md:bottom-6"
            : "opacity-0 translate-y-4 pointer-events-none bottom-20 md:bottom-6"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Mobile sticky CTA bar */}
      {!hideCtaBar && (
        <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-sm border-t border-border px-4 py-3 shadow-[var(--portal-shadow-md)]">
          <Link
            href="/match"
            className="block bg-primary hover:bg-primary/90 text-white text-center font-medium py-3 rounded-[10px] transition text-sm"
          >
            無料で補助金診断する
          </Link>
        </div>
      )}
    </>
  );
}
