import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新規登録",
  description: "HOJYO CAMEの新規登録。企業ユーザーまたは工事業者としてアカウントを作成できます。",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
