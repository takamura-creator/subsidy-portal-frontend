import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "補助金一覧",
  description: "全国の防犯カメラ導入に使える補助金一覧。締切・金額・対象者でフィルタリング可能。",
};

export default function SubsidiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
