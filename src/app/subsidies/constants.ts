/**
 * 補助金一覧ページ共通定数。
 * SubsidiesFilterRail / SubsidiesToolbar で重複定義していた定数を1箇所に集約。
 */

export const CATEGORIES = [
  { label: "すべて", value: "" },
  { label: "防犯カメラ", value: "防犯" },
  { label: "IT導入・DX", value: "IT導入" },
  { label: "設備投資", value: "設備投資" },
  { label: "介護・福祉", value: "介護" },
] as const;

export const GOV_LEVELS = [
  { label: "すべて", value: "" },
  { label: "国の補助金", value: "national" },
  { label: "都県", value: "prefectural" },
] as const;

export const AMOUNT_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "〜50万円", value: "50" },
  { label: "〜100万円", value: "100" },
  { label: "〜500万円", value: "500" },
  { label: "500万円以上", value: "500plus" },
] as const;

export const DEADLINE_OPTIONS = [
  { label: "すべて", value: "" },
  { label: "30日以内", value: "30" },
  { label: "60日以内", value: "60" },
  { label: "90日以内", value: "90" },
] as const;
