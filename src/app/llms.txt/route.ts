/**
 * /llms.txt — AI回答エンジン向けサイトサマリー（AEO Phase 5）
 *
 * llmstxt.org 提案フォーマットに準拠したプレーンテキスト。
 * 各セクションは既存データ源から直接 import するため、データ更新に自動追随する。
 *
 * 景表法ガード（設計書必須要件）:
 * - 効果保証語（必ず/保証/採択率）を含みうるフィールド（description・application_tips・
 *   記事本文 body）は一切使用しない。補助金DBは name/ministry/max_amount/rate から機械的に
 *   算出できる値のみ出力する。
 * - 記事タイトルのみ「｜」区切りのサブタイトルに保証語が含まれる場合、メインタイトルの
 *   み採用してサニタイズする。
 * - 締切具体日（deadline フィールド）は出力しない。
 * - 41道府県 InformationLP・/my・/admin は掲載しない。
 */

import { getAllSubsidies } from "@/lib/subsidies-server";
import { filterCameraOnly } from "@/lib/subsidyFilters";
import { formatAmount, formatRate } from "@/lib/subsidyFormatters";
import { ARTICLES } from "@/data/articles";
import { INDUSTRY_LPS } from "@/data/industry-lp";
import { JICHIKAI_CASES } from "@/data/cases-jichikai";
import { SERVICE_PREFECTURES } from "@/lib/constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";

const NG_PATTERN = /必ず|保証|採択率/;

/** 記事タイトルの景表法サニタイズ: 保証語を含むサブタイトルを落とし、メインタイトルのみ採用 */
function sanitizeArticleTitle(title: string): string {
  if (!NG_PATTERN.test(title)) return title;
  const main = title.split("｜")[0];
  return NG_PATTERN.test(main) ? "" : main;
}

export async function GET() {
  const subsidies = filterCameraOnly(getAllSubsidies());

  const subsidyLines = subsidies
    .map((s) => {
      const pref = s.prefecture || "全国";
      return `- [${s.name}](/subsidies/${s.id}) — ${s.ministry || "所管不明"}/上限:${formatAmount(s.max_amount)}/補助率:${formatRate(s.rate_min, s.rate_max)}/対象:${pref}`;
    })
    .join("\n");

  const articleLines = ARTICLES
    .map((a) => {
      const title = sanitizeArticleTitle(a.title);
      return title ? `- [${title}](/articles/${a.slug})` : null;
    })
    .filter((l): l is string => l !== null)
    .join("\n");

  const industryLines = INDUSTRY_LPS
    .map((lp) => `- [${lp.industry}向け防犯カメラ補助金](/industries/${lp.slug})`)
    .join("\n");

  const jichikaiLines = JICHIKAI_CASES
    .map((c) => `- ${c.district}（${c.area}）: ${c.cameraCount}台設置・${c.subsidy}活用`)
    .join("\n");

  const body = `# HOJYO CAME

> 防犯カメラ導入に使える補助金を業種・地域・金額で検索できる補助金マッチングポータルです。
> マルチック株式会社が運営し、対応6都県（${SERVICE_PREFECTURES.join("・")}）では施工まで一貫対応します。

## 補助金一覧

${subsidyLines}

## 交付実績データベース

- [補助金交付実績データベース](${SITE_URL}/results) — 官公庁公表データに基づく交付実績を都道府県・年度・カテゴリ別に閲覧。対応6都県（${SERVICE_PREFECTURES.join("・")}）は詳細データあり。

## 自治会向け施工事例

${jichikaiLines}

## 業種別ガイド

${industryLines}

## お役立ち記事

${articleLines}

## 運営者情報

マルチック株式会社（AVTECH日本正規代理店）。防犯カメラの導入・施工・補助金申請サポートを、東京都・神奈川県・静岡県・埼玉県・千葉県・山梨県の6都県で直接対応しています。
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
