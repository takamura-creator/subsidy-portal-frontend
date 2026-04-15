import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description: "HOJYO CAMEにログイン。補助金申請の管理・業者マッチング履歴の確認ができます。",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
