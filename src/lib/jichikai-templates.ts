/**
 * 自治会向け参考書類テンプレート
 *
 * 設計方針:
 * - 選択式入力 → 変数置換でテキスト生成
 * - すべて「参考資料」として明示（最終提出物ではない）
 * - 将来 AI 連携時は generateTemplate() の実装を差し替えるのみ
 *
 * AI連携拡張ポイント:
 * - 環境変数 NEXT_PUBLIC_USE_AI_TEMPLATES=true で API 経由生成に切替可能
 * - バックエンド側エンドポイント追加: POST /api/v1/jichikai/templates/generate
 *   → services/template_selector.py に "jichikai-camera-2026" キー追加
 *   → services/draft_generator.py の Anthropic クライアント流用
 */

export type TemplateId = "purpose" | "management" | "privacy" | "coverage";

/* ============================================================
 *  入出力の型定義（AI連携時もこのまま使用）
 * ============================================================ */

export interface TemplateInput {
  // 共通フィールド（全書類で必須）
  associationName: string;        // 自治会名（例: 横浜市青葉区美しが丘自治会）
  representativeName: string;     // 代表者名（自治会長）
  installationAddress: string;    // 設置住所
  cameraCount: number;            // 設置台数
  subsidyName: string;            // 申請補助金名（自動セット）
  prefecture: string;             // 都道府県（自動セット）

  // 設置目的書（purpose）用
  purposes?: string[];            // 設置目的（複数選択）
  locationType?: string;          // 設置場所種別
  expectedRisks?: string[];       // 想定リスク（複数選択）

  // 管理運用規程（management）用
  recordingDays?: number;         // 録画保存日数
  manager?: string;               // 管理責任者種別
  disclosurePolicy?: string;      // 開示請求対応方針

  // 撮影範囲説明書（coverage）用
  coverageDirection?: string;     // 撮影方向
  coverageRange?: number;         // 撮影距離(m)
  privacyMeasures?: string[];     // プライバシー配慮策（複数選択）
}

export interface TemplateOutput {
  templateId: TemplateId;
  title: string;
  body: string;             // プレーンテキスト（コピペ・表示用）
  bodyMarkdown: string;     // Markdown 構造化版（AI入力転用・将来用）
  generatedAt: string;      // ISO8601
  isReference: true;        // 参考資料フラグ（常にtrue）
}

import { TEMPLATES } from "./jichikai-template-defs";

/* ============================================================
 *  選択肢の定義データ（UI で利用）
 * ============================================================ */

export const PURPOSE_OPTIONS = [
  "犯罪抑止",
  "子供見守り",
  "不法投棄対策",
  "通学路の安全確保",
  "高齢者見守り",
  "災害時の状況確認",
] as const;

export const LOCATION_TYPE_OPTIONS = [
  "公園周辺",
  "通学路",
  "駅周辺",
  "商店街",
  "住宅街道路",
  "公共施設前",
] as const;

export const RISK_OPTIONS = [
  "空き巣・侵入盗",
  "不法侵入",
  "痴漢・つきまとい",
  "不法投棄",
  "落書き・器物損壊",
  "車両被害",
] as const;

export const RECORDING_DAYS_OPTIONS = [7, 14, 30, 60] as const;

export const MANAGER_OPTIONS = [
  "自治会長",
  "防犯部長",
  "専任の管理責任者",
] as const;

export const DISCLOSURE_OPTIONS = [
  "警察からの捜査関係事項照会のみ対応",
  "警察からの照会＋自治会長承認時のみ対応",
  "警察からの照会または裁判所命令時のみ対応",
] as const;

export const DIRECTION_OPTIONS = [
  "東",
  "西",
  "南",
  "北",
  "全方位",
] as const;

export const RANGE_OPTIONS = [5, 10, 15, 20] as const;

export const PRIVACY_MEASURE_OPTIONS = [
  "個人宅玄関のマスキング処理",
  "顔・ナンバープレート部のぼかし処理",
  "深夜時間帯の録画停止設定",
  "撮影範囲を公道のみに限定",
] as const;

/* ============================================================
 *  テンプレート定義（変数置換）
 * ============================================================ */


/* ============================================================
 *  公開API
 * ============================================================ */

export const ALL_TEMPLATE_IDS: TemplateId[] = ["purpose", "management", "privacy", "coverage"];

export function getTemplateTitle(id: TemplateId): string {
  return TEMPLATES[id].title;
}

/**
 * テンプレート生成のメイン関数。
 * AI連携時はここの実装を差し替える（API fetch に変更）。
 */
export async function generateTemplate(
  id: TemplateId,
  input: TemplateInput,
): Promise<TemplateOutput> {
  // 将来の AI 連携拡張ポイント
  if (process.env.NEXT_PUBLIC_USE_AI_TEMPLATES === "true") {
    return generateTemplateViaAI(id, input);
  }
  // 現状: 変数置換
  const def = TEMPLATES[id];
  const { body, bodyMarkdown } = def.build(input);
  return {
    templateId: id,
    title: def.title,
    body,
    bodyMarkdown,
    generatedAt: new Date().toISOString(),
    isReference: true,
  };
}

/**
 * 将来用: バックエンド AI 経由で生成。
 * バックエンド側に POST /api/v1/jichikai/templates/generate を追加した後に有効化。
 *
 * セキュリティ:
 * - NEXT_PUBLIC_API_URL が未設定 or 空文字なら例外（任意ホストへの送信防止）
 * - レスポンスの必須フィールドを検証してから返す（不正な shape を弾く）
 */
async function generateTemplateViaAI(
  id: TemplateId,
  input: TemplateInput,
): Promise<TemplateOutput> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL が設定されていません");

  const res = await fetch(`${apiUrl}/api/v1/jichikai/templates/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template_id: id, input }),
  });
  if (!res.ok) throw new Error(`AI生成エラー: ${res.status}`);

  const raw = await res.json();
  if (
    !raw ||
    typeof raw.body !== "string" ||
    typeof raw.bodyMarkdown !== "string" ||
    typeof raw.title !== "string" ||
    typeof raw.templateId !== "string"
  ) {
    throw new Error("AI生成レスポンスの形式が不正です");
  }
  return {
    templateId: raw.templateId as TemplateId,
    title: raw.title,
    body: raw.body,
    bodyMarkdown: raw.bodyMarkdown,
    generatedAt: typeof raw.generatedAt === "string" ? raw.generatedAt : new Date().toISOString(),
    isReference: true,
  };
}
