import type React from "react";
import Link from "next/link";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import PublicSectionHeader from "@/components/layout/PublicSectionHeader";
import { getAllSubsidies } from "@/lib/subsidies-server";
import { INDUSTRIES } from "@/lib/constants";
import { filterCameraOnly } from "@/lib/subsidyFilters";
import MatchGrid from "./MatchGrid";

const INDUSTRY_META: Record<string, { icon: string; desc: string }> = {
  // 主ターゲット業種
  "工場・製造業":       { icon: "🏭", desc: "工場・生産ライン・屋外ヤード" },
  "産廃ヤード":         { icon: "♻️", desc: "産廃処理施設・野積みヤード" },
  "老人福祉施設":       { icon: "🏥", desc: "特養・デイサービス・居住棟" },
  "自治体・街頭防犯":   { icon: "🏘️", desc: "街頭・公道・通学路・防犯灯" },
  // 一般業種
  "建設業":             { icon: "🔨", desc: "工事現場・資材置場" },
  "医療・介護":         { icon: "🩺", desc: "病院・クリニック・老人ホーム" },
  "運輸業":             { icon: "🚛", desc: "倉庫・配送センター・駐車場" },
  "サービス業":         { icon: "🔧", desc: "事務所・各種サービス拠点" },
  "宿泊業":             { icon: "🏨", desc: "ホテル・旅館・民宿" },
  "農業・林業・水産業": { icon: "🌾", desc: "農場・漁港・ハウス施設" },
  "不動産業":           { icon: "🏢", desc: "賃貸マンション・アパート" },
  "自治会・町会":       { icon: "📌", desc: "街頭・公道・通学路" },
  // 後方
  "小売業":             { icon: "🏪", desc: "店舗・スーパー・コンビニ" },
  "飲食業":             { icon: "🍽️", desc: "レストラン・カフェ・厨房" },
  "その他":             { icon: "📋", desc: "上記以外の業種" },
};

export const metadata = {
  title: "業種からさがす | HOJYO CAME",
  description: "あなたの業種に合った防犯カメラ補助金を探せます。登録不要で閲覧可能。",
};

export default function MatchPage() {
  const allSubsidies = getAllSubsidies();

  function countForIndustry(ind: string): number {
    return filterCameraOnly(allSubsidies, ind).length;
  }

  return (
    <PublicPageLayout>
      <PublicSectionHeader
        overline="Subsidy Match"
        title="業種を選んで診断"
        sub="業種を選ぶと、対象補助金と上限額が分かります。登録不要・約30秒。"
        as="h1"
        titleClass="hc-headline"
      />

      <MatchGrid
        items={INDUSTRIES.map((ind) => {
          const meta = INDUSTRY_META[ind] ?? { icon: "📋", desc: "" };
          return { industry: ind, icon: meta.icon, desc: meta.desc, count: countForIndustry(ind) };
        })}
      />

      <p
        style={{
          marginTop: 32,
          fontSize: 12,
          color: "var(--hc-text-muted)",
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        申請書の自動生成は{" "}
        <Link
          href="/auth/register"
          style={{ color: "var(--hc-primary)", textDecoration: "none", fontWeight: 600 }}
        >
          無料登録後
        </Link>{" "}
        にご利用いただけます。補助金情報は参考情報です。最終的な申請要件は公式サイトをご確認ください。
      </p>
    </PublicPageLayout>
  );
}
