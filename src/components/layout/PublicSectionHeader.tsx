/**
 * PublicSectionHeader — 公開ページ共通セクション見出し
 *
 * overline(12px Sora・任意) → title(.hc-display or .hc-headline) → sub(Body 17px muted・任意)
 * Server Component（"use client" 不要）。
 */

interface PublicSectionHeaderProps {
  /** 上部12px上線ラベル（例: "ABOUT" "FEATURES"）。省略可 */
  overline?: string;
  /** メイン見出しテキスト */
  title: string;
  /** 本文直上のサブテキスト。省略可 */
  sub?: string;
  /** レンダリングするHTMLタグ（デフォルト h2） */
  as?: "h1" | "h2";
  /** title のタイポグラフィクラス（デフォルト hc-display） */
  titleClass?: "hc-display" | "hc-headline";
  /** テキスト揃え */
  align?: "left" | "center";
}

export default function PublicSectionHeader({
  overline,
  title,
  sub,
  as: Tag = "h2",
  titleClass = "hc-display",
  align = "center",
}: PublicSectionHeaderProps) {
  const textAlign = align === "center" ? "center" : "left";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        textAlign,
        marginBottom: 48,
      }}
    >
      {overline && (
        <span
          style={{
            fontSize: 12,
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--hc-primary)",
          }}
        >
          {overline}
        </span>
      )}

      <Tag
        className={titleClass}
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          margin: 0,
        }}
      >
        {title}
      </Tag>

      {sub && (
        <p
          style={{
            fontSize: 17,
            color: "var(--hc-text-muted)",
            lineHeight: 1.7,
            margin: 0,
            fontFamily: "'Noto Sans JP', sans-serif",
            maxWidth: 640,
            ...(align === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}),
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
