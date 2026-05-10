import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "業種から補助金を探す",
  description: "あなたの業種に合った防犯カメラ補助金を一覧表示。登録不要で閲覧できます。マルチック対応6都県の補助金に対応。",
};

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
