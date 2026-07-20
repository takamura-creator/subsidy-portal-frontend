/**
 * 都道府県別LPコンテンツデータ — 集約バレルファイル
 *
 * 実データは prefecture-content-part1.ts（型定義・共通データ・高優先5県）と
 * prefecture-content-part2.ts（中〜低優先県 + 施工対応6都県のうち静岡県・山梨県）に分割。
 * 分割理由: 1ファイル500行ルール（元633行が新規2県追加で800行超になるため）。
 * 公開API（型・関数・default export）は分割前と完全互換 — 消費側（page.tsx等）の変更は不要。
 *
 * 作成: Ashitaka（マーケティング責任者）2026-04-08 / 分割: 2026-07-20 jarvis
 */

import type { PrefectureContent } from "./prefecture-content-part1";
import { PREFECTURE_CONTENTS_PART1 } from "./prefecture-content-part1";
import { PREFECTURE_CONTENTS_PART2 } from "./prefecture-content-part2";

export type { PrefectureContent };
export { SUBSIDY_DISCLAIMER } from "./prefecture-content-part1";

const PREFECTURE_CONTENTS: PrefectureContent[] = [
  ...PREFECTURE_CONTENTS_PART1,
  ...PREFECTURE_CONTENTS_PART2,
];

// --- ヘルパー関数 ---

/** URLパス（encodeURIComponentされた都道府県名）からコンテンツを取得 */
export function getPrefectureContent(
  prefectureName: string,
): PrefectureContent | undefined {
  return PREFECTURE_CONTENTS.find((p) => p.name === prefectureName);
}

/** 全コンテンツ一覧を取得 */
export function getAllPrefectureContents(): PrefectureContent[] {
  return PREFECTURE_CONTENTS;
}

/** コンテンツが存在する都道府県名の一覧 */
export function getContentPrefectureNames(): string[] {
  return PREFECTURE_CONTENTS.map((p) => p.name);
}

export default PREFECTURE_CONTENTS;
