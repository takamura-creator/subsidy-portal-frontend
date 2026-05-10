import PDFDocument from "pdfkit";
import fs from "fs";
import type { GenerateRequest, ExpenseItem } from "./types";

const FONT_SIZE_TITLE = 16;
const FONT_SIZE_SECTION = 12;
const FONT_SIZE_BODY = 10;
const FONT_SIZE_SMALL = 8;
const MARGIN = 50;
const LINE_GAP = 6;

/**
 * 日本語フォント検索パス。
 * 1. HOJYOCAME_FONT_PATH 環境変数（最優先・本番設定用）
 * 2. Linux 標準 Noto CJK パス（CI/Docker/Vercelビルド済みパス）
 *
 * 開発者個人パスは含めない（チーム間で再現性を保つため）。
 * フォントが見つからない場合は console.warn を出して Helvetica にフォールバックし、
 * 日本語が文字化けする状態でPDF生成しないよう警告を残す。
 */
const FONT_CANDIDATES = [
  process.env.HOJYOCAME_FONT_PATH,
  "/usr/share/fonts/noto-cjk/NotoSansCJKjp-Regular.otf",
  "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
].filter(Boolean) as string[];

function findJapaneseFont(): string | null {
  for (const p of FONT_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const _jpFont = findJapaneseFont();
if (!_jpFont) {
  // eslint-disable-next-line no-console
  console.warn(
    "[pdf-generator] 日本語フォント未検出。HOJYOCAME_FONT_PATH を設定してください。" +
      "現状は Helvetica にフォールバックし、日本語は文字化けします。",
  );
}

function hasJapaneseFont(): boolean {
  return _jpFont !== null;
}

function formatYen(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "―";
  return `${amount.toLocaleString("ja-JP")}円`;
}

function formatDate(date: string | undefined): string {
  if (!date) return "―";
  return date;
}

export function generateDxItPdf(req: GenerateRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      info: {
        Title: "DX/IT推進補助金 交付申請書＋事業計画書",
        Author: "HOJYO CAME",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (hasJapaneseFont() && _jpFont) {
      doc.registerFont("jp", _jpFont);
      doc.font("jp");
    }

    const p = req.profile;
    const ex = req.extras ?? {};
    const pageWidth = 595.28 - MARGIN * 2;

    doc.fontSize(FONT_SIZE_SMALL).text(
      "※ 本テンプレートは参考用です。正式な申請には各自治体の公式様式をご確認ください。",
      MARGIN,
      MARGIN,
      { width: pageWidth, align: "left" }
    );
    doc.moveDown(0.5);

    doc
      .fontSize(FONT_SIZE_TITLE)
      .text("補助金交付申請書 + 事業計画書", { align: "center" });
    doc.moveDown(0.3);
    doc
      .fontSize(FONT_SIZE_SMALL)
      .text("【DX/IT推進補助金用】", { align: "center" });
    doc.moveDown(1);

    section(doc, "1. 申請者情報", pageWidth);
    field(doc, "企業名", p.company_name, pageWidth);
    field(doc, "代表者名", p.representative_name, pageWidth);
    field(doc, "所在地", p.address, pageWidth);
    field(doc, "法人番号", p.corporate_number, pageWidth);
    field(doc, "資本金", p.capital ? `${p.capital.toLocaleString("ja-JP")}万円` : undefined, pageWidth);
    field(doc, "従業員数", p.employee_count_regular !== undefined ? `${p.employee_count_regular}名` : undefined, pageWidth);
    field(doc, "業種", p.industry_code, pageWidth);
    field(doc, "設立年月日", formatDate(p.established_date), pageWidth);
    doc.moveDown(0.5);

    section(doc, "2. 導入するデジタルツール/システム", pageWidth);
    field(doc, "ツール名", ex.tool_name, pageWidth);
    field(doc, "提供ベンダー名", ex.vendor_name, pageWidth);
    doc.moveDown(0.5);

    section(doc, "3. 現状の業務課題", pageWidth);
    doc
      .fontSize(FONT_SIZE_BODY)
      .text(ex.current_issues || "（未入力）", { width: pageWidth, lineGap: LINE_GAP });
    doc.moveDown(0.5);

    section(doc, "4. 導入目的・期待効果", pageWidth);
    field(doc, "定量効果", ex.expected_effect_quantitative, pageWidth);
    field(doc, "定性効果", ex.expected_effect_qualitative, pageWidth);
    doc.moveDown(0.5);

    section(doc, "5. 実施スケジュール", pageWidth);
    field(doc, "導入開始予定", formatDate(ex.schedule_start), pageWidth);
    field(doc, "運用開始予定", formatDate(ex.schedule_end), pageWidth);
    doc.moveDown(0.5);

    section(doc, "6. 経費内訳", pageWidth);
    if (req.expenses && req.expenses.length > 0) {
      expenseTable(doc, req.expenses, pageWidth);
      const total = req.expenses.reduce((s, e) => s + e.total, 0);
      doc.moveDown(0.3);
      field(doc, "事業費合計", formatYen(total), pageWidth);
      field(doc, "補助申請額", formatYen(req.subsidy_amount), pageWidth);
    } else {
      doc.fontSize(FONT_SIZE_BODY).text("（未入力）", { width: pageWidth });
    }
    doc.moveDown(0.5);

    section(doc, "7. 添付書類チェックリスト", pageWidth);
    const checklist = [
      "登記簿謄本（法人）",
      "決算書（直近2期）",
      "導入ツールカタログ/概要資料",
      "見積書",
      "誓約書",
      "支援機関相談シート（該当県のみ）",
    ];
    for (const item of checklist) {
      doc.fontSize(FONT_SIZE_BODY).text(`☐ ${item}`, { width: pageWidth });
    }

    doc.moveDown(1);
    doc
      .fontSize(FONT_SIZE_SMALL)
      .fillColor("#888888")
      .text(`生成日: ${new Date().toISOString().slice(0, 10)}  |  HOJYO CAME テンプレートエンジン v1`, {
        width: pageWidth,
        align: "right",
      });

    doc.end();
  });
}

function section(doc: PDFKit.PDFDocument, title: string, width: number): void {
  if (hasJapaneseFont()) doc.font("jp");
  doc
    .fontSize(FONT_SIZE_SECTION)
    .fillColor("#1C1917")
    .text(title, { width, underline: true });
  doc.moveDown(0.3);
}

function field(doc: PDFKit.PDFDocument, label: string, value: string | undefined, width: number): void {
  doc
    .fontSize(FONT_SIZE_BODY)
    .fillColor("#1C1917")
    .text(`${label}: ${value || "―"}`, { width, lineGap: LINE_GAP });
}

function expenseTable(doc: PDFKit.PDFDocument, items: ExpenseItem[], width: number): void {
  const cols = [
    { label: "費目", w: width * 0.2 },
    { label: "品目", w: width * 0.3 },
    { label: "数量", w: width * 0.1 },
    { label: "単価", w: width * 0.2 },
    { label: "金額", w: width * 0.2 },
  ];

  const y = doc.y;
  let x = MARGIN;
  doc.fontSize(FONT_SIZE_SMALL).fillColor("#555555");
  for (const c of cols) {
    doc.text(c.label, x, y, { width: c.w });
    x += c.w;
  }
  doc.moveDown(0.5);

  doc.fillColor("#1C1917").fontSize(FONT_SIZE_BODY);
  for (const item of items) {
    const iy = doc.y;
    x = MARGIN;
    doc.text(item.category, x, iy, { width: cols[0].w });
    x += cols[0].w;
    doc.text(item.item_name, x, iy, { width: cols[1].w });
    x += cols[1].w;
    doc.text(String(item.quantity), x, iy, { width: cols[2].w });
    x += cols[2].w;
    doc.text(formatYen(item.unit_price), x, iy, { width: cols[3].w });
    x += cols[3].w;
    doc.text(formatYen(item.total), x, iy, { width: cols[4].w });
    doc.moveDown(0.3);
  }
}
