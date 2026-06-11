import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "施工・見積もり相談",
  description:
    "防犯カメラの導入・補助金活用に関するご相談を承っています。東京・神奈川・静岡・埼玉・千葉・山梨の6都県に対応。マルチック株式会社が直接対応します。",
  openGraph: {
    title: "施工・見積もり相談 | HOJYO CAME",
    description:
      "防犯カメラの導入・補助金活用に関するご相談を承っています。6都県対応、マルチック株式会社が直接対応。",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
