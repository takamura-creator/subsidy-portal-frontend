// F1: カメラ関連補助金フィルタ共通モジュール（介護除外 ID リスト方式）
import type { Subsidy } from "./api";
import { SERVICE_PREFECTURES, toApiIndustry } from "./constants";
import { subsidyAttributes } from "./subsidyAttributes";

export const CAMERA_KEYWORDS = ["防犯", "セキュリティ", "カメラ", "監視", "IT導入", "DX"];

// description に "カメラ" が含まれても主目的が介護・処遇改善の補助金は除外
export const NG_SUBSIDY_IDS = new Set([
  "kaigo-shoguu-kaizen-2026",  // 主目的: 処遇改善
  "kaigo-bcp-2026",             // 主目的: BCP策定
  "kaigo-chiiki-kikin-2026",    // 主目的: 介護環境整備
]);

// マルチック対応エリア外の補助金を除外（バックエンドAPIに非対応エリアが残存している場合の防御層）
const SERVICE_PREF_SET = new Set<string>(SERVICE_PREFECTURES);
function isServiceArea(s: Subsidy): boolean {
  // 国補助金（pref_code=00 / prefecture が空 or "全国"）は表示OK
  if (!s.prefecture || s.prefecture === "全国" || s.pref_code === "00" || s.pref_code === "") {
    return true;
  }
  return SERVICE_PREF_SET.has(s.prefecture);
}

export function filterCameraOnly(items: Subsidy[], industry?: string): Subsidy[] {
  // 表示用業種（例: 工場・製造業）は target_industries の語彙（例: 製造業）へ変換して照合する
  const apiIndustry = industry ? toApiIndustry(industry) : undefined;
  return items.filter((s) => {
    if (NG_SUBSIDY_IDS.has(s.id)) return false;
    if (!isServiceArea(s)) return false;
    // B5: 業種フィルタ — target_industries が設定されていてユーザー業種を含まない場合は除外
    if (apiIndustry && s.target_industries?.length > 0 && !s.target_industries.includes(apiIndustry)) {
      return false;
    }
    // 2026-10-28（審査 [7]）: 正本の制度（camera_eligibility を持つ行）は説明文の語ではなく
    // camera_eligibility で決める。confirmed / unconfirmed のどちらも出す（unconfirmed は
    // CameraEligibilityNote の注記が付く）。介護の制度のように説明文に「カメラ」等の語が無くても
    // カメラ対象が確認済みなら出す。camera_eligibility を持たない行（自動更新で入る行）だけ語で判定する。
    if (subsidyAttributes(s).camera_eligibility !== null) return true;
    return matchesCameraKeywords(s);
  });
}

function matchesCameraKeywords(s: Subsidy): boolean {
  return CAMERA_KEYWORDS.some(
    (kw) =>
      s.name.includes(kw) ||
      s.category.includes(kw) ||
      (s.description?.includes(kw) ?? false)
  );
}

// LP6ブラッシュアップ（2026-07-20）: 県固有制度（例: 静岡市の街頭防犯カメラ補助）が
// 全国制度（IT導入補助金等）に埋もれないよう、「県・市区町村固有 → 全国」の順に並べ替える。
// 判定は prefecture フィールドのみ（"全国"/空/pref_code "00" が全国制度）。件数は変えない（並べ替えのみ）。
// Array.prototype.sort は安定ソートのため、各グループ内の元の順序（API返却順）は保持される。
export function sortLocalFirst(items: Subsidy[]): Subsidy[] {
  const isNational = (s: Subsidy) =>
    !s.prefecture || s.prefecture === "全国" || s.pref_code === "00";
  return [...items].sort((a, b) => Number(isNational(a)) - Number(isNational(b)));
}
