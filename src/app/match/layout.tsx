import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI診断",
  description: "業種と都道府県を入力するだけで、防犯カメラ導入に使える補助金をAIが診断します。",
};

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
