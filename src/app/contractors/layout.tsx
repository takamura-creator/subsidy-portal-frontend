import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "工事業者一覧",
  description: "全国の防犯カメラ設置工事業者一覧。対応エリア・補助金対応可否・レビューで比較できます。",
};

export default function ContractorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
