/**
 * 都道府県LPに載せる補助制度の確認台帳（2026-10-27 注文書: LPの誤り修正）。
 *
 * - ここに載せるのは「公式資料（一次ソース）で確認できた制度」だけ。確認できない制度は載せない。
 * - 数値・対象者・受付状況は確認日時点の公式資料の表現に合わせる。推測で埋めない（書かれていなければ「記載なし」）。
 * - 各行に確認日（checkedOn）と出典URL（sourceUrl）を必ず持たせ、LP に表示する。
 * - prefecture-content の seoDescription / faqs で制度名・数値を挙げるときは、本台帳にある内容だけを使う
 *   （旧LPは meta description で「川崎市の独自制度も解説」と書きながら表に川崎市が無かった）。
 * - 国の中小企業向け制度（デジタル化・AI導入補助金・小規模事業者持続化補助金・業務改善助成金など）は、
 *   防犯カメラが補助対象になることを公式資料で確認できていないため載せない（2026-10-27 点検
 *   技術責任者/報告書/2026-10-27_hojyocame総合点検_evidence/audit_all.txt）。
 * - subsidyId はサイト内の制度ページ（/subsidies/{id}）の id。API にその id があるときだけリンクする。
 *
 * 出典の確認: 2026-10-27 に各URLの本文を取得して照合（藤沢市・川口市・埼玉県はPDF本文）。
 */

import type { ServicePrefecture } from "@/lib/constants";

export const LP_CHECKED_ON = "2026-10-27";

export interface VerifiedLpSubsidy {
  prefecture: ServicePrefecture;
  /** 実施主体（市・県など） */
  owner: string;
  /** 公式資料上の制度名 */
  name: string;
  subsidyId?: string;
  /** 申請できる人・団体（公式資料の表現） */
  target: string;
  rate: string;
  maxAmount: string;
  /** 受付期間・締切（確認日時点の公式資料） */
  period: string;
  /** 確認日時点の受付状況（短いラベル） */
  statusOnCheck: string;
  sourceUrl: string;
  checkedOn: string;
}

const C = LP_CHECKED_ON;

export const VERIFIED_LP_SUBSIDIES: readonly VerifiedLpSubsidy[] = [
  // ── 神奈川県 ─────────────────────────────────────────────
  {
    prefecture: "神奈川県",
    owner: "横浜市",
    name: "地域防犯カメラ設置補助",
    subsidyId: "yokohama-jichikai-2026",
    target: "自治会町内会・地区連合町内会",
    rate: "10分の9",
    maxAmount: "1台28万円（予算台数の範囲内で補助・申請しても補助されない場合あり）",
    period: "令和8年度の申請は7月31日まで（交付決定は10月上旬頃）",
    statusOnCheck: "令和8年度分は受付終了",
    sourceUrl: "https://www.city.yokohama.lg.jp/bousai-kyukyu-bohan/bohan/camera/kamera2.html",
    checkedOn: C,
  },
  {
    prefecture: "神奈川県",
    owner: "相模原市",
    name: "防犯カメラ設置費補助",
    subsidyId: "sagamihara-bouhan-camera-2026",
    target: "自治会または地域住民で組織された防犯活動団体（商店街団体を含む）",
    rate: "補助対象経費の10分の9（12万円との低い方）",
    maxAmount: "1台12万円・1団体8台まで（8台すべて補助されるとは限らない）",
    period: "通常募集の事前協議（2026年5月1日〜7月10日）は終了。追加募集の事前協議は2026年11月2日〜11月24日",
    statusOnCheck: "追加募集の事前協議 11/2開始",
    sourceUrl:
      "https://www.city.sagamihara.kanagawa.jp/kurashi/1026529/1026549/1026551/1026554/1008473.html",
    checkedOn: C,
  },
  {
    prefecture: "神奈川県",
    owner: "藤沢市",
    name: "地縁団体による防犯カメラ設置等事業費補助金",
    subsidyId: "fujisawa-bouhan-camera-2026",
    target: "地縁による団体（自治会・町内会等）のみ",
    rate: "設置費の4分の3以内（千円未満切り捨て）",
    maxAmount: "1台27万円（ソーラー型カメラは30万円）",
    period:
      "令和8年度の交付申請は2026年6月12日必着（工事は2027年1月末まで）。予算超過時は優先順位を設け、同順位内は抽選",
    statusOnCheck: "令和8年度分は受付終了",
    sourceUrl: "https://www.city.fujisawa.kanagawa.jp/documents/9188/camera_manual2026.pdf",
    checkedOn: C,
  },
  // ── 東京都 ───────────────────────────────────────────────
  {
    prefecture: "東京都",
    owner: "八王子市",
    name: "地域における見守り活動事業補助金（防犯カメラ設置等）",
    subsidyId: "hachioji-mimamori-2026",
    target: "市に登録のある町会・自治会・管理組合",
    rate: "補助対象経費の24分の23（千円未満切り捨て）",
    maxAmount: "1台42万1千円（防犯カメラ専用ポールを設置する場合は57万5千円）",
    period:
      "令和8年度は令和7年7月までに希望調査票を提出した団体のみ申請可・1団体1台まで。令和9年度分の希望調査は6月中旬頃に案内予定",
    statusOnCheck: "新規の申請受付なし",
    sourceUrl: "https://www.city.hachioji.tokyo.jp/emergency/bousai/m7914685/010/p032985.html",
    checkedOn: C,
  },
  {
    prefecture: "東京都",
    owner: "港区",
    name: "共同住宅防犯対策助成事業",
    subsidyId: "minato-kyodo-bouhan-2026",
    target:
      "区内の分譲マンションの管理組合、公共住宅等の住民で構成する団体、区内の賃貸住宅所有者（個人・法人を問わない）",
    rate: "費用総額の2分の1（100円未満切り捨て）",
    maxAmount: "50万円",
    period: "申請期間の記載なし。設置工事の開始前に各総合支所へ相談・申請が必要（助成決定前の着工は対象外）",
    statusOnCheck: "工事前に事前相談",
    sourceUrl:
      "https://www.city.minato.tokyo.jp/seikatsuanzen/bosai-anzen/sekatsuanzen/jose/kyodojutaku.html",
    checkedOn: C,
  },
  {
    prefecture: "東京都",
    owner: "東京都",
    name: "防犯設備の整備に対する区市町村補助事業",
    subsidyId: "tokyo-bouhan-2026",
    target: "商店街等（区市町村とともに補助。申請方法はお住まいの区市町村へ）",
    rate: "都の補助は12分の7以内（負担割合は都7/12・区市町村1/3・地域団体1/12）",
    // 2026-10-27 正本との突き合わせ: 都の制度ページ本文には無いが、同ページからリンクされた
    // 「令和8年度東京都防犯設備の整備に対する区市町村補助事業 概要」（PDF）に記載あり（本文を取得して確認）
    maxAmount: "都補助限度額525万円（防犯カメラ1台あたり整備費用60万円を上限とする）",
    period: "区市町村から都への申請受付時期は9月（商店街等の申請期限は区市町村ごとに異なる）",
    statusOnCheck: "令和8年度の都への申請受付（9月）は終了",
    sourceUrl:
      "https://www.tomin-anzen.metro.tokyo.lg.jp/documents/d/tomin-anzen/r8kushichousonhojojigyounitsuite",
    checkedOn: C,
  },
  // ── 静岡県 ───────────────────────────────────────────────
  {
    prefecture: "静岡県",
    owner: "静岡市",
    name: "街頭防犯カメラ設置事業補助金",
    subsidyId: "shizuoka-jichikai-2026",
    target: "自治会・町内会・地区安全会議",
    rate: "1台あたり10分の9以内",
    maxAmount: "1台30万円（新規・更新とも）",
    period: "令和8年度の受付は2026年6月1日〜6月30日",
    statusOnCheck: "令和8年度分は受付終了",
    sourceUrl: "https://www.city.shizuoka.lg.jp/s9623/s000015.html",
    checkedOn: C,
  },
  {
    prefecture: "静岡県",
    owner: "浜松市",
    name: "防犯カメラ設置事業費の補助",
    subsidyId: "hamamatsu-jichikai-2026",
    target: "自治会（個人の設置は対象外）",
    rate: "補助対象経費の2分の1",
    maxAmount: "補助上限10万円・1自治会2台まで（過去の補助台数を含む）",
    period: "令和8年4月1日〜令和9年1月31日（予算の上限に達した場合は終了）",
    statusOnCheck: "受付中（予算上限で終了）",
    sourceUrl: "https://www.city.hamamatsu.shizuoka.jp/simink/bouhan/bouhankamera.html",
    checkedOn: C,
  },
  // ── 埼玉県 ───────────────────────────────────────────────
  {
    prefecture: "埼玉県",
    owner: "さいたま市",
    name: "地域防犯カメラ設置助成金",
    subsidyId: "saitama-city-bouhan-2026",
    target: "自治会（個人は対象外）",
    rate: "助成対象経費の4分の3",
    maxAmount: "1台25万円（100円未満切り捨て）",
    period:
      "相談は受付中。令和8年度は想定申請額が予算の上限に達する見込みで、要件を満たしても交付できない場合あり（2026年7月8日の市の案内）",
    statusOnCheck: "相談受付中（予算上限の見込み）",
    sourceUrl: "https://www.city.saitama.lg.jp/001/011/005/p054240.html",
    checkedOn: C,
  },
  {
    prefecture: "埼玉県",
    owner: "川口市",
    name: "防犯カメラ設置費補助金",
    subsidyId: "kawaguchi-bouhan-camera-2026",
    target: "町会・自治会（会長名で申請）",
    rate: "記載なし（1台あたりの限度額で補助）",
    maxAmount: "1台25万円・令和8年度は市全体で16台まで",
    period: "令和8年度は事前申込4〜5月末、交付申請8月末締切",
    statusOnCheck: "令和8年度分は受付終了",
    sourceUrl: "https://www.city.kawaguchi.lg.jp/material/files/group/15/R8chirashi.pdf",
    checkedOn: C,
  },
  {
    prefecture: "埼玉県",
    owner: "埼玉県",
    name: "わがまち防犯対策推進事業費補助金",
    subsidyId: "saitama-bouhan-2026",
    target: "市町村（申請者は市町村。自治会等は市町村の補助制度を通じて利用）",
    rate: "防犯カメラ整備は補助対象経費の3分の1以内（優遇措置は2分の1以内）",
    maxAmount: "1市町村あたり400万円",
    period: "市町村の申請期限は原則として毎年度1月末日",
    statusOnCheck: "市町村が申請",
    sourceUrl: "https://www.pref.saitama.lg.jp/documents/211763/youkoukousin.pdf",
    checkedOn: C,
  },
  // ── 千葉県 ───────────────────────────────────────────────
  {
    prefecture: "千葉県",
    owner: "千葉県",
    name: "市町村防犯カメラ等設置補助事業",
    subsidyId: "chiba-bouhan-2026",
    target: "市町村（県から個人・法人・自治会等へ直接は補助しない。千葉市は間接補助のみ）",
    rate: "2分の1以内",
    maxAmount: "1台あたり新規20万円・更新10万円",
    period:
      "令和8年度の実施・受付期間は県の公式ページで確認できません（県ページ更新日 2024年11月6日）。お住まいの市町村の防犯担当へご確認ください",
    statusOnCheck: "令和8年度の実施を確認できず",
    sourceUrl: "https://www.pref.chiba.lg.jp/seikouan/bouhan/anzen/kamerakaisei.html",
    checkedOn: C,
  },
  // ── 山梨県 ───────────────────────────────────────────────
  {
    prefecture: "山梨県",
    owner: "山梨県警察",
    name: "山梨県警察防犯カメラ設置促進事業補助金",
    subsidyId: "yamanashi-bouhan-2026",
    target: "県内で地域の防犯活動を行う自治組織等（市町村は対象外）",
    rate: "補助対象経費の2分の1以内",
    maxAmount: "1台30万円",
    period: "令和8年4月1日〜12月18日（本年度は先着順で受理）",
    statusOnCheck: "受付中（先着順）",
    sourceUrl: "https://www.pref.yamanashi.jp/police/p_anzen/anzenansin/boukame.html",
    checkedOn: C,
  },
];

export function getVerifiedLpSubsidies(prefecture: string): VerifiedLpSubsidy[] {
  return VERIFIED_LP_SUBSIDIES.filter((s) => s.prefecture === prefecture);
}
