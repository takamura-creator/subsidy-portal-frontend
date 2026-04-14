import type { Metadata } from "next";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "補助金ポータルの運営会社・サービスの趣旨についてご案内します。",
  alternates: { canonical: "/about" },
};

const center = (
  <div className="max-w-2xl">
    <h1
      className="text-xl font-bold mb-5"
      style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
    >
      運営者情報
    </h1>

    <h2
      className="text-base font-bold mb-2 mt-6"
      style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
    >
      HOJYO CAMEについて
    </h2>
    <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--hc-text-muted)" }}>
      HOJYO CAMEは、監視カメラ・防犯カメラの導入を検討している中小企業と、設置工事を行う業者をつなぐ補助金マッチングプラットフォームです。
    </p>
    <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--hc-text-muted)" }}>
      特定メーカーの製品を推奨するのではなく、中立的な立場で補助金情報と工事業者情報を提供し、中小企業の皆様がスムーズに補助金を活用できるようサポートします。
    </p>

    <h2
      className="text-base font-bold mb-2 mt-6"
      style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
    >
      運営会社
    </h2>
    <table className="w-full border-collapse mb-4 text-sm">
      <tbody>
        {[
          ["社名", "マルチック株式会社"],
          ["代表者", "高村 泰宏"],
          ["所在地", "東京都"],
          ["設立", "2020年"],
          ["事業内容", "監視カメラシステムの販売・導入支援、補助金申請支援"],
        ].map(([label, value]) => (
          <tr key={label}>
            <th
              className="text-left px-3 py-2 w-1/3 text-xs font-semibold"
              style={{ background: "rgba(21,128,61,0.03)", border: "1px solid var(--hc-border)", color: "var(--hc-navy)" }}
            >
              {label}
            </th>
            <td
              className="px-3 py-2 text-xs"
              style={{ border: "1px solid var(--hc-border)", color: "var(--hc-text-muted)" }}
            >
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <h2
      className="text-base font-bold mb-2 mt-6"
      style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
    >
      サービスの特徴
    </h2>
    <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--hc-text-muted)" }}>
      HOJYO CAMEは完全無料でご利用いただけます。補助金の診断、申請書の作成支援、工事業者のマッチングまで、すべて無料です。
    </p>
    <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--hc-text-muted)" }}>
      工事業者の皆様には、補助金活用の案件マッチングを通じた集客支援を行っています。
    </p>

    <h2
      className="text-base font-bold mb-2 mt-6"
      style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
    >
      お問い合わせ
    </h2>
    <p className="text-sm leading-relaxed" style={{ color: "var(--hc-text-muted)" }}>
      サービスに関するお問い合わせは、右のリンクよりご連絡ください。
    </p>

    <div className="mt-8 text-center">
      <p className="text-sm mb-4" style={{ color: "var(--hc-text-muted)" }}>補助金の活用をお考えですか？</p>
      <Link
        href="/match"
        className="inline-block px-8 py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-90"
        style={{ background: "var(--hc-primary)", color: "#fff" }}
      >
        無料で補助金診断する
      </Link>
    </div>
  </div>
);

const right = (
  <div>
    <p className="text-xs font-bold mb-3" style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}>
      リンク
    </p>
    <div className="flex flex-col gap-0.5">
      {[
        { label: "お問い合わせ", href: "#" },
        { label: "利用規約", href: "#" },
        { label: "プライバシーポリシー", href: "#" },
        { label: "特定商取引法に基づく表記", href: "#" },
      ].map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="block px-2 py-2 text-xs rounded transition-colors"
          style={{ color: "var(--hc-text-muted)" }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  </div>
);

export default function AboutPage() {
  return (
    <ThreeColumnLayout
      left={null}
      center={center}
      right={right}
      showLeft={false}
      showRight={true}
    />
  );
}
