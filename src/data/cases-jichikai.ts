/**
 * 自治会向け施工事例（匿名化）。
 * 鵠沼地区 9 件をベースに 3 件公開（自治会名は伏せる、進行中案件への配慮）。
 */

export interface JichikaiCase {
  slug: string;
  area: string; // 例: "藤沢市鵠沼地区"
  district: string; // 例: "湘南エリア"
  cameraCount: number;
  subsidy: string; // 補助金名
  subsidyAmount: number;
  selfPayment: number;
  installedAt: string; // ISO8601
  description: string;
  effects: string[];
  bgIcon: string;
}

export const JICHIKAI_CASES: JichikaiCase[] = [
  {
    slug: "shonan-001",
    area: "藤沢市鵠沼地区",
    district: "湘南エリア",
    cameraCount: 4,
    subsidy: "藤沢市 防犯カメラ設置補助金",
    subsidyAmount: 1000000,
    selfPayment: 333000,
    installedAt: "2025-09",
    description:
      "通学路と児童公園の出入口を中心に4台設置。地域の見守り活動と連動した運用ガイドラインも整備し、保護者・地域住民の安心感が大きく向上。",
    effects: [
      "不法投棄の通報件数が前年比で減少",
      "子供の登下校見守り活動の効率化",
      "深夜の不審者通報に対する迅速な対応",
    ],
    bgIcon: "🚸",
  },
  {
    slug: "shonan-002",
    area: "藤沢市鵠沼地区",
    district: "湘南エリア",
    cameraCount: 6,
    subsidy: "藤沢市 防犯カメラ設置補助金",
    subsidyAmount: 1500000,
    selfPayment: 500000,
    installedAt: "2025-11",
    description:
      "夜間の不審者対策として、街区の主要通りと公園周辺の死角を解消する6台構成。AVTECH 5MP カメラと8ch NVR を採用し、保存期間30日で運用。",
    effects: [
      "夜間徘徊者通報の解決率向上",
      "車上荒らしの未然防止（前年比減）",
      "住民集会での治安懸念意見の減少",
    ],
    bgIcon: "🌙",
  },
  {
    slug: "shonan-003",
    area: "藤沢市鵠沼地区",
    district: "湘南エリア",
    cameraCount: 3,
    subsidy: "藤沢市 防犯カメラ設置補助金",
    subsidyAmount: 750000,
    selfPayment: 250000,
    installedAt: "2026-02",
    description:
      "海岸近くの新興住宅街での3台設置事例。地権者同意・警察事前協議・自治会総会承認の3点をセットで完了し、申請から約3ヶ月で交付決定。",
    effects: [
      "新興住宅街での治安体感の向上",
      "観光シーズンの不審者抑止",
      "近隣自治会から3件の紹介相談",
    ],
    bgIcon: "🌊",
  },
];
