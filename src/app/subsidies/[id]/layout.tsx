import type { Metadata } from "next";
import { fetchSubsidy } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const subsidy = await fetchSubsidy(id);
    return {
      title: subsidy.name,
      description: `${subsidy.name}の概要・対象要件・補助額・申請方法。HOJYO CAMEで最新情報を確認。`,
    };
  } catch {
    return {
      title: "補助金詳細",
      description: "補助金の概要・対象要件・補助額・申請方法。HOJYO CAMEで最新情報を確認。",
    };
  }
}

export default function SubsidyDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
