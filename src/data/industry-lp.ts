/**
 * 業種別LPページのコンテンツ定義。
 *
 * 各業種について「設置のメリット」「リスク」「対応補助金例」「導入事例」をパッケージ化。
 */

export interface IndustryLP {
  slug: string; // URL用（小売業 等の業種名は使えないため英字）
  industry: string; // 表示用業種名（INDUSTRIES の値）
  hero: { headline: string; lead: string };
  benefits: string[]; // 設置メリット
  risks: string[]; // 想定リスク
  recommendedSubsidies: string[]; // 補助金ID
  caseQuote?: string; // 事例コメント
}

export const INDUSTRY_LPS: IndustryLP[] = [
  {
    slug: "manufacturing",
    industry: "製造業",
    hero: {
      headline: "工場・生産ライン・ヤードの安全と防犯を、補助金で実現",
      lead:
        "製造業の現場では、作業員安全管理・盗難防止・労災原因究明など、防犯カメラの活用範囲は多岐にわたります。業務改善助成金等を活用し、工事費込みで最大数百万円の補助が可能です。",
    },
    benefits: [
      "作業員の労災発生時の状況確認",
      "資材・製品の盗難防止",
      "深夜・休日の不審者侵入抑止",
      "ライン稼働状況の遠隔監視",
    ],
    risks: ["生産機械の事故時の責任問題", "原材料・完成品の盗難", "敷地内への不法侵入・産廃投棄"],
    recommendedSubsidies: ["it-hojo-2026", "gyomu-kaizen-2026"],
  },
  {
    slug: "waste-management",
    industry: "廃棄物処理業",
    hero: {
      headline: "産廃ヤードの監視・不法投棄抑止を、補助金で完備",
      lead:
        "廃棄物処理ヤードでは、不法投棄・侵入・火災発生時の状況確認など、24時間監視が事業継続の鍵となります。広範囲をカバーする高解像度カメラと長期録画NVRの構成を提案します。",
    },
    benefits: [
      "不法投棄の発見・通報",
      "火災発生時の出火源確認",
      "夜間・休日の侵入抑止",
      "車両出入りの記録",
    ],
    risks: ["不法投棄ゴミの混入", "ヤード内発火事故", "金属窃盗・部品盗難"],
    recommendedSubsidies: ["it-hojo-2026", "gyomu-kaizen-2026"],
  },
  {
    slug: "real-estate",
    industry: "不動産業",
    hero: {
      headline: "賃貸マンション・アパートの共用部安全管理を補助金活用で",
      lead:
        "賃貸住宅オーナーは「居住サポート住宅改修事業」（国交省）等を活用し、共用部の防犯カメラ設置に1/3〜1/2の補助を受けられます。入居者満足度・退去抑止にも直結します。",
    },
    benefits: [
      "入居者の安心感向上による退去抑止",
      "共用部での事件・事故時の状況確認",
      "宅配ボックス・ゴミ置場の不正利用防止",
      "防犯設備による物件価値の向上",
    ],
    risks: ["共用部での盗難・破損", "不審者の徘徊", "ゴミ・粗大ごみの不法投棄"],
    recommendedSubsidies: ["kokudo-jutaku-kaihu-2026", "minato-kyodo-bouhan-2026"],
  },
  {
    slug: "jichikai",
    industry: "自治会・町会",
    hero: {
      headline: "街頭・公道の防犯カメラ設置を、補助金フル活用で",
      lead:
        "自治会・町内会向けの補助金は、自治体ごとに50%〜95%の高補助率が用意されています。マルチックは藤沢市鵠沼地区など湘南エリアで9件の施工実績があり、申請から施工まで一括サポートします。",
    },
    benefits: [
      "通学路・公園周辺の見守り強化",
      "地域犯罪の抑止・解決率向上",
      "住民の体感治安向上",
      "災害時の状況確認",
    ],
    risks: ["不法投棄", "車上荒らし", "深夜の不審者", "登下校児童の見守り課題"],
    recommendedSubsidies: ["yokohama-jichikai-2026", "fujisawa-bouhan-camera-2026", "sagamihara-bouhan-camera-2026"],
  },
  {
    slug: "elderly-care",
    industry: "医療・介護",
    hero: {
      headline: "老人福祉施設・クリニックの「安全」を、補助金で支援",
      lead:
        "夜間見守り・転倒検知・認知症患者の徘徊検知など、医療・介護現場での防犯カメラ活用は安全管理の中核です。ICT導入支援事業（介護分野）等の活用が可能です。",
    },
    benefits: [
      "夜間の入所者見守り",
      "転倒・徘徊事故の早期発見",
      "ご家族・スタッフの安心",
      "事故発生時の状況把握",
    ],
    risks: ["夜間の転倒事故", "認知症患者の徘徊", "外部からの不審者侵入"],
    recommendedSubsidies: ["it-hojo-2026", "gyomu-kaizen-2026"],
  },
  {
    slug: "retail",
    industry: "小売業",
    hero: {
      headline: "店舗の万引き・売上ロス対策を補助金で",
      lead:
        "小売業の万引き・盗難対策として、IT導入補助金やセキュリティ対策推進枠を活用し、AI付きカメラ・複数台NVRの構成を導入できます。",
    },
    benefits: [
      "万引き発生時の犯人特定",
      "深夜の侵入盗対策",
      "従業員の労働環境改善",
      "売上ロス削減によるROI",
    ],
    risks: ["万引き・内部不正", "侵入盗", "深夜営業時の従業員危害"],
    recommendedSubsidies: ["it-hojo-2026", "jizokuka-2026", "gyomu-kaizen-2026"],
  },
];
