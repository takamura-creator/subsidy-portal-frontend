import type { Metadata } from "next";

type Props = { params: Promise<{ prefecture: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture } = await params;
  const decoded = decodeURIComponent(prefecture);
  return {
    title: `${decoded}の補助金交付実績`,
    description: `${decoded}における補助金交付実績一覧。企業名・補助金名・交付額・年度・業種を公表データに基づき掲載。`,
    openGraph: {
      title: `${decoded}の補助金交付実績 | HOJYO CAME`,
      description: `${decoded}の補助金交付先・交付額を公表データで透明化。`,
      type: "website",
    },
  };
}

export default function PrefectureResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
