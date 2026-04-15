import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "診断結果",
  description: "AI補助金診断の結果一覧。マッチした補助金の詳細・締切・申請条件を確認できます。",
};

export default function MatchResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
