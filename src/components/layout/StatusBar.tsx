import Link from "next/link";

export default function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-5"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--hc-status-h)",
        background: "rgba(240,253,244,0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(21,128,61,0.08)",
        fontSize: "11px",
        color: "var(--hc-text-muted)",
        zIndex: 99,
      }}
    >
      <span>&copy; 2026 HOJYO CAME — マルチック株式会社</span>
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/about"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          運営者情報
        </Link>
        {/* TODO: /privacy /terms ページ未作成。暫定的に /contact へリンク */}
        <Link
          href="/contact"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          プライバシーポリシー
        </Link>
        <Link
          href="/contact"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          利用規約
        </Link>
      </span>
    </div>
  );
}
