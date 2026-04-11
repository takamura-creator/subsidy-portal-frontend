import { fetchSubsidy } from "@/lib/api";
import Link from "next/link";
import Badge from "@/components/shared/Badge";

const STATUS_LABEL: Record<string, string> = {
  open: "受付中",
  upcoming: "公募予定",
  closed: "終了",
};

export default async function SubsidyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await fetchSubsidy(id);

  const statusVariant = (s.status === "open" || s.status === "closed" || s.status === "upcoming")
    ? s.status
    : "closed" as const;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
      {/* パンくずナビ */}
      <nav aria-label="パンくずリスト" className="text-sm mb-6 flex items-center gap-1.5 text-text2">
        <Link href="/" className="hover:text-primary transition-colors">ホーム</Link>
        <span>/</span>
        <Link href="/subsidies" className="hover:text-primary transition-colors">補助金一覧</Link>
        <span>/</span>
        <span className="text-text">{s.name}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {s.category}
          </span>
          <Badge variant={statusVariant}>
            {STATUS_LABEL[s.status] ?? "終了"}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-medium text-text">
          {s.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム: メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 概要 */}
          <section className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
            <h2 className="text-lg font-medium text-secondary mb-3">概要</h2>
            <p className="text-sm text-text leading-relaxed">{s.description}</p>
          </section>

          {/* 基本情報テーブル */}
          <section className="rounded-[10px] border border-border bg-bg-card shadow-[var(--portal-shadow)] overflow-hidden">
            <h2 className="text-lg font-medium text-secondary px-4 pt-4 pb-3">基本情報</h2>
            <table className="w-full text-sm">
              <tbody>
                {([
                  ["管轄省庁", s.ministry],
                  ["対象都道府県", s.prefecture],
                  ["補助率", `${Math.round(s.rate_min * 100)}〜${Math.round(s.rate_max * 100)}%`],
                  ["補助上限額", `${s.max_amount >= 10000 ? `${(s.max_amount / 10000).toLocaleString("ja-JP")}万円` : `${s.max_amount.toLocaleString("ja-JP")}円`}`],
                  ["対象業種", s.target_industries.join("、")],
                  ["最大従業員数", s.max_employees ? `${s.max_employees}名以下` : "制限なし"],
                  ["申請期限", s.deadline],
                ] as const).map(([label, value]) => (
                  <tr key={label} className="border-t border-border">
                    <th scope="row" className="text-left px-4 py-3 font-medium text-text2 whitespace-nowrap w-36">
                      {label}
                    </th>
                    <td className="px-4 py-3 text-text">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 申請のヒント */}
          {s.application_tips && (
            <section className="rounded-[10px] border border-primary/20 bg-primary/5 p-4">
              <h2 className="font-medium text-primary mb-2 flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                申請のヒント
              </h2>
              <p className="text-sm text-text leading-relaxed">{s.application_tips}</p>
            </section>
          )}
        </div>

        {/* 右カラム: サイドバー */}
        <div className="space-y-4">
          {/* KPIカード */}
          <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] space-y-4">
            <div className="text-center">
              <div className="text-xs text-text2 mb-1">補助率</div>
              <div className="text-2xl font-medium text-primary tabular-nums">
                {Math.round(s.rate_min * 100)}〜{Math.round(s.rate_max * 100)}%
              </div>
            </div>
            <div className="border-t border-border pt-4 text-center">
              <div className="text-xs text-text2 mb-1">上限額</div>
              <div className="text-xl font-medium text-text tabular-nums">
                {s.max_amount >= 10000
                  ? `${(s.max_amount / 10000).toLocaleString("ja-JP")}万円`
                  : `${s.max_amount.toLocaleString("ja-JP")}円`}
              </div>
            </div>
            {s.deadline && (
              <div className="border-t border-border pt-4 text-center">
                <div className="text-xs text-text2 mb-1">申請期限</div>
                <div className="text-base font-medium text-text">{s.deadline}</div>
              </div>
            )}
          </div>

          {/* CTAボタン */}
          <Link
            href={`/match?subsidy_id=${s.id}`}
            className="btn-primary block w-full text-center"
          >
            この補助金で診断する
          </Link>

          {s.source_url && (
            <a
              href={s.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary block w-full text-center"
            >
              申請元の公式ページ
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
