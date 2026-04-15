import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "業者詳細",
  description: "施工実績・対応エリア・評価。HOJYO CAMEで見積もり依頼。",
};

export default function ContractorDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
