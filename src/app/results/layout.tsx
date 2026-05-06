import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "補助金交付実績データベース",
  description: "官公庁が公表した補助金交付実績を都道府県・カテゴリ・年度別に検索できる透明性確保のためのデータベース。IT導入・ものづくり・事業再構築・持続化・省エネ補助金を横断。",
  openGraph: {
    title: "補助金交付実績データベース | HOJYO CAME",
    description: "官公庁公表データに基づく補助金交付実績の一覧。公共的な透明性の確保を目的としています。",
    type: "website",
  },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
