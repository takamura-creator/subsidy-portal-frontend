import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "診断結果",
  description: "あなたの条件にマッチした補助金の一覧。マッチ度・補助額・締切を比較できます。",
};

export default function MatchResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
