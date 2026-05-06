/**
 * 過去成約事例データ（導入事例ページ用プレースホルダー）
 *
 * 方針:
 * - 掲載は顧客同意前提。本ファイルは匿名化したサンプル初期版
 * - 事実ベース。「○○%削減」「○倍」等の数値効果は実測値が確認できるまで記載しない
 * - 誇張表現は使用禁止。設計書 v2.0 §11 のガイドラインに従うこと
 * - 社名は「A社」「B施設」等の匿名表記で統一
 * - Ashitaka が確定版コンテンツを差し替える際は `updatedAt` と `status` を更新すること
 */

export type CasePackageTier = "economy" | "standard" | "premium" | "large";

export interface CaseStudy {
  id: string;
  /** 一覧・OGPで露出する見出し。組織名は匿名化すること */
  title: string;
  /** 事例の要約（2〜3文、SEO description にも利用） */
  summary: string;
  prefecture: string;
  industry: string;
  /** 申請対象とした補助金の正式名称 */
  subsidyName: string;
  /** 設置したカメラ台数 */
  cameraCount: number;
  /** Step 3 の参考パッケージと対応づけ */
  package: CasePackageTier;
  /** 導入前の状況（事実記述のみ） */
  beforeDescription: string;
  /** 導入後の状況（事実記述のみ。定量評価は実測値のみ許可） */
  afterDescription: string;
  /** 税抜合計費用（円） */
  totalCost: number;
  /** 適用された補助金額（円） */
  subsidyAmount: number;
  /** 自己負担額（円） — totalCost - subsidyAmount と一致しなくても可（端数処理等） */
  selfPayment: number;
  /** 完成月（YYYY-MM） */
  completedAt: string;
  /** 公開状態。placeholder=サンプル・published=顧客同意済み・draft=社内確認中 */
  status: "placeholder" | "draft" | "published";
  /** お客様の声（任意・匿名化済み） */
  testimonial?: string;
  /** 最終更新日（YYYY-MM-DD） */
  updatedAt: string;
}

export const CASES_DISCLAIMER =
  "本ページの事例は、個人・法人が特定できないよう匿名化したサンプルを含みます。実績公開は顧客同意を得たうえで順次差し替えます。数値は当該案件のもので、他案件の結果を保証するものではありません。";

/**
 * 初期プレースホルダー 3 件。
 * Economy / Standard / Premium の 3 パッケージをそれぞれ代表するケース。
 */
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "case-001-a-retail",
    title: "A社 小売店舗のバックヤード録画装置導入（8台）",
    summary:
      "都内の日用品販売 A社で、バックヤードとレジ後方に 8 台の IP カメラと録画装置を設置。在庫差異発生時の確認フローを整備。",
    prefecture: "東京都",
    industry: "小売業（日用品販売）",
    subsidyName: "東京都 防犯設備設置費助成事業",
    cameraCount: 8,
    package: "standard",
    beforeDescription:
      "夜間の無人時間帯と店舗バックヤードで在庫差異が継続的に発生。従業員の体感に頼った管理で、原因特定まで時間がかかっていた。",
    afterDescription:
      "バックヤード・レジ後方・搬入口の 3 エリアに IP カメラを設置し、NVR に録画。在庫差異が発生した際は対象時間帯の映像を確認する運用に変更。関係者との共有手順もあわせて整備した。",
    totalCost: 749000,
    subsidyAmount: 374500,
    selfPayment: 374500,
    completedAt: "2025-11",
    status: "placeholder",
    testimonial:
      "設置だけでなく、運用ルールの整備までサポートいただけたので社内で混乱がありませんでした。",
    updatedAt: "2026-04-24",
  },
  {
    id: "case-002-b-care",
    title: "B介護施設 夜勤帯の見守り補助カメラ導入（8台）",
    summary:
      "神奈川県の通所介護施設で、共用部と廊下に 4K カメラと録画装置を設置。職員室からの遠隔確認が可能な構成に。",
    prefecture: "神奈川県",
    industry: "医療・介護",
    subsidyName: "神奈川県 中小企業デジタル化支援補助金",
    cameraCount: 8,
    package: "premium",
    beforeDescription:
      "夜勤帯は居室周辺の安全確認を職員が都度巡回しており、呼び出し対応中は他の居室や共用部の状況を把握しづらい状態だった。",
    afterDescription:
      "共用部 4 台 + 廊下 4 台の合計 8 台を設置し、職員室の録画装置から遠隔確認できる構成に変更。呼び出し対応と見守り確認を並行して進められる運用に移行した。",
    totalCost: 958000,
    subsidyAmount: 479000,
    selfPayment: 479000,
    completedAt: "2025-12",
    status: "placeholder",
    testimonial:
      "様式1-6（県外調達理由書）の下書きをそのまま活用でき、申請書類の準備工数を短縮できました。",
    updatedAt: "2026-04-24",
  },
  {
    id: "case-003-c-restaurant",
    title: "C食堂 レジ周辺のカメラ更新（4台・第1期）",
    summary:
      "千葉県の飲食店 C食堂で、アナログ機器からの更新として IP カメラ 4 台と NVR を導入。録画確認の運用を再構築。",
    prefecture: "千葉県",
    industry: "飲食業",
    subsidyName: "小規模事業者持続化補助金",
    cameraCount: 4,
    package: "economy",
    beforeDescription:
      "既存のアナログカメラが経年劣化しており、録画映像の確認に時間がかかるため、接客トラブルやレジ締めの突合で十分に活用できていなかった。",
    afterDescription:
      "IP カメラ 4 台と NVR を導入。レジ周辺・ホール・出入口・バックヤードに分散配置し、録画映像を接客トラブル対応とレジ締めの突合作業で利用できる体制にした。",
    totalCost: 403000,
    subsidyAmount: 268000,
    selfPayment: 135000,
    completedAt: "2026-01",
    status: "placeholder",
    updatedAt: "2026-04-24",
  },
];

export function getCaseById(id: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.id === id);
}

export function listPublishedCases(): CaseStudy[] {
  return CASE_STUDIES.filter((c) => c.status !== "draft");
}
