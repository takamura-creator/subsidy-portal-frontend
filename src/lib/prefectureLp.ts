/**
 * 都道府県LP（/lp/{県名}）の URL の扱い。ページ本体と proxy で共用する。
 *
 * - 正しい URL は日本語の県名（例: /lp/神奈川県）。
 * - ローマ字スラッグ（例: /lp/kanagawa）は日本語の正式 URL へ恒久リダイレクトする（全47都道府県・標準ヘボン式）。
 * - それ以外（47都道府県に無い名前）は 404。
 */
import { PREFECTURES } from "./constants";

const VALID_PREFECTURES: ReadonlySet<string> = new Set<string>(PREFECTURES);

export function isValidPrefectureName(name: string): boolean {
  return VALID_PREFECTURES.has(name);
}

/** ローマ字スラッグ → 日本語の県名 */
export const ROMAN_TO_JP: Readonly<Record<string, string>> = {
  tokyo:     "東京都",
  osaka:     "大阪府",
  kanagawa:  "神奈川県",
  aichi:     "愛知県",
  saitama:   "埼玉県",
  hyogo:     "兵庫県",
  hokkaido:  "北海道",
  fukuoka:   "福岡県",
  chiba:     "千葉県",
  kyoto:     "京都府",
  aomori:    "青森県",
  iwate:     "岩手県",
  miyagi:    "宮城県",
  akita:     "秋田県",
  yamagata:  "山形県",
  fukushima: "福島県",
  ibaraki:   "茨城県",
  tochigi:   "栃木県",
  gunma:     "群馬県",
  niigata:   "新潟県",
  toyama:    "富山県",
  ishikawa:  "石川県",
  fukui:     "福井県",
  yamanashi: "山梨県",
  nagano:    "長野県",
  gifu:      "岐阜県",
  shizuoka:  "静岡県",
  mie:       "三重県",
  shiga:     "滋賀県",
  nara:      "奈良県",
  wakayama:  "和歌山県",
  tottori:   "鳥取県",
  shimane:   "島根県",
  okayama:   "岡山県",
  hiroshima: "広島県",
  yamaguchi: "山口県",
  tokushima: "徳島県",
  kagawa:    "香川県",
  ehime:     "愛媛県",
  kochi:     "高知県",
  saga:      "佐賀県",
  nagasaki:  "長崎県",
  kumamoto:  "熊本県",
  oita:      "大分県",
  miyazaki:  "宮崎県",
  kagoshima: "鹿児島県",
  okinawa:   "沖縄県",
};

/** ローマ字スラッグなら日本語の正式 LP パス（エンコード済み）を返す。そうでなければ null。 */
export function romanSlugToLpPath(slug: string): string | null {
  const jp = Object.prototype.hasOwnProperty.call(ROMAN_TO_JP, slug) ? ROMAN_TO_JP[slug] : undefined;
  return jp ? `/lp/${encodeURIComponent(jp)}` : null;
}
