import Link from "next/link";

export default function StatusBar() {
  return (
    <div
      className="hc-status-bar"
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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <span className="hc-status-copy">&copy; 2026 HOJYO CAME — マルチック株式会社</span>
      <span className="hc-status-links" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/about"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          運営者情報
        </Link>
        <Link
          href="/privacy"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          プライバシーポリシー
        </Link>
        <Link
          href="/terms"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          利用規約
        </Link>
      </span>
    </div>
  );
}
