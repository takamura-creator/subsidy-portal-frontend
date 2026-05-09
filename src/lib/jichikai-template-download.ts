/**
 * 自治会向けテンプレートのダウンロード補助。
 * jichikai-templates.ts から分離（500行制限対応）。
 */

import type { TemplateOutput } from "./jichikai-templates";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Word が開ける .doc 形式の Blob を生成。
 * MIME type を application/msword にして HTML を埋め込む方式。
 */
export function buildDocBlob(output: TemplateOutput): Blob {
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${escapeHtml(output.title)}</title>
<style>
@page { size: A4; margin: 20mm; }
body { font-family: 'ＭＳ 明朝', 'MS Mincho', serif; font-size: 11pt; line-height: 1.7; }
h1 { font-size: 14pt; text-align: center; margin-bottom: 1em; }
.reference-stamp { color: #B91C1C; border: 2px solid #B91C1C; padding: 4px 12px; display: inline-block; font-weight: bold; margin-bottom: 1em; }
pre { white-space: pre-wrap; font-family: inherit; font-size: 11pt; }
</style>
</head>
<body>
<div class="reference-stamp">参考資料（最終提出前に内容確認・追記が必要）</div>
<pre>${escapeHtml(output.body)}</pre>
</body>
</html>`;
  return new Blob([html], { type: "application/msword;charset=utf-8" });
}

export function downloadOutput(output: TemplateOutput, format: "doc" | "txt"): void {
  let blob: Blob;
  let filename: string;
  if (format === "doc") {
    blob = buildDocBlob(output);
    filename = `${output.title}_参考.doc`;
  } else {
    blob = new Blob([`【参考資料】\n\n${output.body}`], { type: "text/plain;charset=utf-8" });
    filename = `${output.title}_参考.txt`;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
