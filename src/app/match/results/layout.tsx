import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "補助金一覧",
  description: "業種に合った補助金の一覧。詳細・締切・申請条件を確認できます。",
  robots: { index: false, follow: false },
};

export default function MatchResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
