import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "補助金詳細",
  description: "補助金の概要・対象要件・補助額・申請方法。HOJYO CAMEで最新情報を確認。",
};

export default function SubsidyDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
