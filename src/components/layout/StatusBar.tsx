export default function StatusBar() {
  return (
    <footer
      className="flex items-center justify-between px-5 text-[10px]"
      style={{
        height: "var(--hc-status-h)",
        background: "var(--hc-bg)",
        borderTop: "1px solid var(--hc-border)",
        color: "var(--hc-text-muted)",
      }}
    >
      <span>&copy; 2026 マルチック株式会社</span>
      <span>HOJYO CAME v0.3</span>
    </footer>
  );
}
