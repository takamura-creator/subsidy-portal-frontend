/**
 * FV専用 都道府県別 目安最大額（万円）静的マップ
 *
 * maxManYen が number の県 → カウントアップ対象（現在該当なし）
 * maxManYen が null の県 → 固定文言フォールバック「対応制度をすぐに無料診断できます」
 *
 * 【全県 null の理由】
 * 県固有の実額（区・市の防犯カメラ補助上限等）に出典付きで紐づくまで全県 null＝誇大回避。
 * 国制度（ものづくり補助金等）は全県一律の制度であり地域差の根拠にならないため数値源に使わない。
 * 実制度の具体的上限額（例: ○○市 防犯カメラ補助 上限△万円）に出典を紐づけられた県から
 * 順次 number 値に更新する。
 */

export type PrefMaxSubsidy = { name: string; maxManYen: number | null };

// prettier-ignore
export const PREFECTURE_MAX_SUBSIDY: PrefMaxSubsidy[] = [
  { name: "北海道",   maxManYen: null },
  { name: "青森県",   maxManYen: null },
  { name: "岩手県",   maxManYen: null },
  { name: "宮城県",   maxManYen: null },
  { name: "秋田県",   maxManYen: null },
  { name: "山形県",   maxManYen: null },
  { name: "福島県",   maxManYen: null },
  { name: "茨城県",   maxManYen: null },
  { name: "栃木県",   maxManYen: null },
  { name: "群馬県",   maxManYen: null },
  { name: "埼玉県",   maxManYen: null },
  { name: "千葉県",   maxManYen: null },
  { name: "東京都",   maxManYen: null },
  { name: "神奈川県", maxManYen: null },
  { name: "新潟県",   maxManYen: null },
  { name: "富山県",   maxManYen: null },
  { name: "石川県",   maxManYen: null },
  { name: "福井県",   maxManYen: null },
  { name: "山梨県",   maxManYen: null },
  { name: "長野県",   maxManYen: null },
  { name: "岐阜県",   maxManYen: null },
  { name: "静岡県",   maxManYen: null },
  { name: "愛知県",   maxManYen: null },
  { name: "三重県",   maxManYen: null },
  { name: "滋賀県",   maxManYen: null },
  { name: "京都府",   maxManYen: null },
  { name: "大阪府",   maxManYen: null },
  { name: "兵庫県",   maxManYen: null },
  { name: "奈良県",   maxManYen: null },
  { name: "和歌山県", maxManYen: null },
  { name: "鳥取県",   maxManYen: null },
  { name: "島根県",   maxManYen: null },
  { name: "岡山県",   maxManYen: null },
  { name: "広島県",   maxManYen: null },
  { name: "山口県",   maxManYen: null },
  { name: "徳島県",   maxManYen: null },
  { name: "香川県",   maxManYen: null },
  { name: "愛媛県",   maxManYen: null },
  { name: "高知県",   maxManYen: null },
  { name: "福岡県",   maxManYen: null },
  { name: "佐賀県",   maxManYen: null },
  { name: "長崎県",   maxManYen: null },
  { name: "熊本県",   maxManYen: null },
  { name: "大分県",   maxManYen: null },
  { name: "宮崎県",   maxManYen: null },
  { name: "鹿児島県", maxManYen: null },
  { name: "沖縄県",   maxManYen: null },
];
