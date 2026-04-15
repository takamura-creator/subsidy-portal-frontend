import type { Metadata } from "next";
import { fetchContractor } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const contractor = await fetchContractor(id);
    return {
      title: contractor.company_name,
      description: `${contractor.company_name}の施工実績・対応エリア・評価。HOJYO CAMEで見積もり依頼。`,
    };
  } catch {
    return {
      title: "業者詳細",
      description: "施工実績・対応エリア・評価。HOJYO CAMEで見積もり依頼。",
    };
  }
}

export default function ContractorDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
