// F1: カメラ関連補助金フィルタ共通モジュール（介護除外 ID リスト方式）
import type { Subsidy } from "./api";
import { SERVICE_PREFECTURES } from "./constants";

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
  return items.filter((s) => {
    if (NG_SUBSIDY_IDS.has(s.id)) return false;
    if (!isServiceArea(s)) return false;
    // B5: 業種フィルタ — target_industries が設定されていてユーザー業種を含まない場合は除外
    if (industry && s.target_industries?.length > 0 && !s.target_industries.includes(industry)) {
      return false;
    }
    return CAMERA_KEYWORDS.some(
      (kw) =>
        s.name.includes(kw) ||
        s.category.includes(kw) ||
        (s.description?.includes(kw) ?? false)
    );
  });
}
