import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI補助金診断",
  description: "防犯カメラ導入に使える補助金をAIが診断。業種・地域・導入目的から最適な補助金を約30秒で提案します。",
};

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
