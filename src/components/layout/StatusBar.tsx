export default function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-5 flex-shrink-0 relative"
      style={{
        height: "var(--hc-status-h)",
        background: "rgba(240,253,244,0.85)",
        borderTop: "1px solid rgba(21,128,61,0.08)",
        fontSize: "11px",
        color: "var(--hc-text-muted)",
        zIndex: 1,
      }}
    >
      <span>&copy; 2026 HOJYO CAME — マルチック株式会社</span>
      <span></span>
    </div>
  );
}
