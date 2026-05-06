import type { JsonLdObject } from "@/lib/structured-data";

/**
 * JSON-LD 構造化データを `<script type="application/ld+json">` として出力するユーティリティ。
 *
 * - Server / Client コンポーネントどちらでも使用可
 * - 配列を渡すと**それぞれ別の `<script>`** として出力される（1つの script に複数JSONを詰めると
 *   Google構造化データテストで無効判定される）
 * - `dangerouslySetInnerHTML` 使用は JSON の中身をそのまま流すため（React が `<script>` 子要素を
 *   HTML エスケープすると構造が壊れる）
 * - HF-17: `JSON.stringify` は `<` をエスケープしないため、script breaker 型 XSS を避けるために
 *   `<` を `<` に置換する（Next.js / React 公式の推奨パターン）。将来データ源が動的化した際の
 *   予防保全として、ハードコード入力のみの現時点でも恒久化しておく。
 */
export default function JsonLd({
  data,
  id,
}: {
  data: JsonLdObject | JsonLdObject[];
  id?: string;
}) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          id={id ? `${id}-${idx}` : undefined}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD は innerHTML でのみ構造化が保たれる
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
