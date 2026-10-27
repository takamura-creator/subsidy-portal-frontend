import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSubsidies, getSubsidyById } from "@/lib/subsidies-server";
import TemplateGenerator from "@/components/subsidies/TemplateGenerator";
import StaleDataNotice from "@/components/subsidies/StaleDataNotice";
import { isJichikaiSubsidy } from "@/lib/jichikai";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * 自治会向け補助金専用：参考書類テンプレ生成ページ
 *
 * - 自治会・町会向け補助金（target_industries に「自治会・町会」を含む）のみアクセス可能
 * - 認証不要（リード獲得目的）
 * - SSG: 全自治会向け補助金IDで静的生成
 */

export async function generateStaticParams() {
  // 自治会向け補助金のみページを生成
  const { subsidies } = await getAllSubsidies();
  return subsidies
    .filter((s) => isJichikaiSubsidy(s.target_industries))
    .map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { subsidy } = await getSubsidyById(id);
  // 自治会向けでない制度にはこのページが無い（本文は notFound()）。proxy で 404 にできなかった場合
  // （API 不達など）でも検索エンジンに載せない（2026-10-27 審査[14]）
  if (!subsidy || !isJichikaiSubsidy(subsidy.target_industries)) {
    return {
      title: "ページが見つかりません",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${subsidy.name} 参考書類テンプレ | HOJYO CAME`,
    description: `${subsidy.name}の申請に使える参考書類（設置目的書・管理運用規程・個人情報保護方針・撮影範囲説明書）を選択式で生成できます。`,
    alternates: { canonical: `/subsidies/${id}/templates` },
    robots: { index: true, follow: true },
  };
}

export default async function TemplatesPage({ params }: Props) {
  const { id } = await params;
  // 追加指摘#9 (2026-09-15): getSubsidyById() の stale を握り潰さず表示する
  // （API不達時、テンプレ生成の元になる補助金名・都道府県が古い可能性がある）
  const { subsidy, stale } = await getSubsidyById(id);
  if (!subsidy) notFound();
  if (!isJichikaiSubsidy(subsidy.target_industries)) notFound();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 40px" }}>
      {/* パンくず */}
      <nav style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 12 }}>
        <Link href="/subsidies" style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}>
          補助金一覧
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <Link
          href={`/subsidies/${subsidy.id}`}
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          {subsidy.name}
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>参考書類テンプレ</span>
      </nav>

      {/* タイトル */}
      <header style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--hc-navy)",
            letterSpacing: "-0.5px",
            margin: "0 0 6px",
          }}
        >
          参考書類テンプレ生成
        </h1>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.6 }}>
          {subsidy.name} の申請に使える 4 種の参考書類を、選択式で生成できます。
        </p>
      </header>

      {stale && <StaleDataNotice />}

      <TemplateGenerator
        subsidyId={subsidy.id}
        subsidyName={subsidy.name}
        prefecture={subsidy.prefecture}
      />
    </main>
  );
}
