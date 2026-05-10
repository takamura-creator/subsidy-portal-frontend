/**
 * 自治会向け「総会説明用パンフレット」生成。
 *
 * - A4 1ページ用 HTML を生成し、`.doc`（Word が開ける）として保存
 * - 補助金概要・設置概要・概算費用・お問い合わせ窓口を 1 枚にまとめる
 * - 自治会総会で印刷配布する用途
 */

import type { Subsidy } from "./api";

export interface PamphletInput {
  associationName: string;
  representativeName?: string;
  subsidy: Subsidy;
  cameraCount: number;
  totalCost: number;
  subsidyAmount: number;
  selfPayment: number;
  installationAddress?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmt(n: number): string {
  return n.toLocaleString("ja-JP") + "円";
}

export function buildPamphletHtml(input: PamphletInput): string {
  const today = new Date().toISOString().slice(0, 10);
  const title = `${input.associationName} 防犯カメラ設置のご提案`;
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
@page { size: A4; margin: 18mm; }
body { font-family: 'ＭＳ 明朝', 'MS Mincho', serif; font-size: 11pt; line-height: 1.65; color: #1A1A1A; }
h1 { font-size: 16pt; text-align: center; border-bottom: 2px solid #15803D; padding-bottom: 4px; margin: 0 0 8px; }
h2 { font-size: 12pt; color: #15803D; margin: 14px 0 4px; border-left: 4px solid #15803D; padding-left: 8px; }
.lead { text-align: center; font-size: 10pt; color: #666; margin: 0 0 12px; }
.box { border: 1px solid #ccc; padding: 10px 14px; margin: 10px 0; background: #fafaf5; }
table { width: 100%; border-collapse: collapse; margin: 6px 0 12px; font-size: 10pt; }
th, td { border: 1px solid #bbb; padding: 6px 10px; text-align: left; }
th { background: #f0fdf4; width: 38%; }
.note { font-size: 9pt; color: #666; }
.footer { margin-top: 14pt; border-top: 1px solid #ccc; padding-top: 6pt; font-size: 9pt; color: #444; }
.amount { font-size: 14pt; font-weight: bold; color: #15803D; }
</style>
</head>
<body>

<h1>${escapeHtml(title)}</h1>
<p class="lead">作成日: ${today}　／　${escapeHtml(input.associationName)}　代表 ${escapeHtml(input.representativeName ?? "")}</p>

<h2>1. 設置の目的</h2>
<p>地域住民の安全・安心の確保と、犯罪抑止を目的として、街頭防犯カメラの新規設置を計画いたします。
近隣自治会での先行事例においても、設置後の体感治安向上・不法投棄防止等の効果が確認されています。</p>

<h2>2. 活用する補助金</h2>
<table>
<tr><th>補助金名</th><td>${escapeHtml(input.subsidy.name)}</td></tr>
<tr><th>所管</th><td>${escapeHtml(input.subsidy.ministry)}</td></tr>
<tr><th>補助率（最大）</th><td>${Math.round((input.subsidy.rate_max ?? 0) * 100)}%</td></tr>
<tr><th>上限</th><td>${fmt(input.subsidy.max_amount)}</td></tr>
<tr><th>申請期限</th><td>${escapeHtml(input.subsidy.deadline)}</td></tr>
</table>

<h2>3. 設置の概要と概算費用</h2>
<table>
<tr><th>設置住所</th><td>${escapeHtml(input.installationAddress ?? "（自治会管轄エリア内）")}</td></tr>
<tr><th>設置台数</th><td>${input.cameraCount}台</td></tr>
<tr><th>事業費総額</th><td>${fmt(input.totalCost)}</td></tr>
<tr><th>補助金（試算）</th><td><span class="amount">${fmt(input.subsidyAmount)}</span></td></tr>
<tr><th>自治会の自己負担額（試算）</th><td><span class="amount">${fmt(input.selfPayment)}</span></td></tr>
</table>
<p class="note">※ 上記金額は参考試算値です。実際の補助金額は所管機関の審査により確定します。</p>

<h2>4. 申請の流れ</h2>
<ol>
<li>所轄警察署との事前協議（撮影範囲・運用ガイドラインの確認）</li>
<li>自治会総会での承認・議事録作成</li>
<li>周辺住民・地権者の同意取得</li>
<li>補助金申請書の作成・提出</li>
<li>交付決定後の工事着工</li>
<li>実績報告書の提出（工事完了後）</li>
</ol>

<h2>5. 施工パートナー</h2>
<div class="box">
<strong>マルチック株式会社</strong>（AVTECH 日本正規代理店）<br>
湘南エリア 9 件の自治会向け施工実績。藤沢市鵠沼地区での対応経験豊富。<br>
お問い合わせ: contact@multik.jp
</div>

<div class="footer">
本資料は ${escapeHtml(input.associationName)} 総会説明用に作成された参考資料です。<br>
最終的な申請内容は、各補助金の所管機関の公式情報をご確認ください。
</div>

</body>
</html>`;
}

export function downloadPamphlet(input: PamphletInput): void {
  const html = buildPamphletHtml(input);
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${input.associationName}_総会説明用パンフ.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
