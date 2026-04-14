import type { Metadata } from "next";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "HOJYO CAMEの運営会社情報。マルチック株式会社が中立的な立場で補助金情報と工事業者情報を提供します。",
  alternates: { canonical: "/about" },
};

const center = (
  <>
    <h1>運営者情報</h1>
    <h2>HOJYO CAMEについて</h2>
    <p>HOJYO CAMEは、監視カメラ・防犯カメラの導入を検討している中小企業と、設置工事を行う業者をつなぐ補助金マッチングプラットフォームです。</p>
    <p>特定メーカーの製品を推奨するのではなく、中立的な立場で補助金情報と工事業者情報を提供し、中小企業の皆様がスムーズに補助金を活用できるようサポートします。</p>
    <h2>運営会社</h2>
    <table className="info-table">
      <tbody>
        {[
          ["社名", "マルチック株式会社"],
          ["代表者", "高村 泰宏"],
          ["所在地", "東京都"],
          ["設立", "2020年"],
          ["事業内容", "監視カメラシステムの販売・導入支援、補助金申請支援"],
        ].map(([label, value]) => (
          <tr key={label}>
            <th>{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <h2>サービスの特徴</h2>
    <p>HOJYO CAMEは完全無料でご利用いただけます。補助金の診断、申請書の作成支援、工事業者のマッチングまで、すべて無料です。</p>
    <p>工事業者の皆様には、補助金活用の案件マッチングを通じた集客支援を行っています。</p>
    <h2>お問い合わせ</h2>
    <p>サービスに関するお問い合わせは、下記リンクよりご連絡ください。</p>
  </>
);

const right = (
  <div>
    <div
      className="section-title"
      style={{ marginBottom: 10 }}
    >
      リンク
    </div>
    <div className="link-list">
      <Link href="#">お問い合わせ</Link>
      <Link href="#">利用規約</Link>
      <Link href="#">プライバシーポリシー</Link>
      <Link href="#">特定商取引法に基づく表記</Link>
    </div>
  </div>
);

export default function AboutPage() {
  return (
    <ThreeColumnLayout
      left={<aside />}
      center={center}
      right={right}
      showLeft={true}
      showRight={true}
      gridCols="1fr 640px 240px"
    />
  );
}
