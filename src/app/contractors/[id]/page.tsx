import Link from "next/link";
import { fetchContractor } from "@/lib/api";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`評価 ${rating.toFixed(1)}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i <= Math.round(rating) ? "text-accent" : "text-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.383-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
      <span className="text-sm text-text2 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

export default async function ContractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await fetchContractor(id);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
      {/* パンくずナビ */}
      <nav aria-label="パンくずリスト" className="text-sm mb-6 flex items-center gap-1.5 text-text2">
        <Link href="/" className="hover:text-primary transition-colors">ホーム</Link>
        <span>/</span>
        <Link href="/contractors" className="hover:text-primary transition-colors">工事業者一覧</Link>
        <span>/</span>
        <span className="text-text">{c.company_name}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium text-text mb-3">
          {c.company_name}
        </h1>
        <div className="flex items-center gap-3">
          <StarRating rating={c.rating} />
          <span className="text-sm text-text2">({c.review_count}件のレビュー)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム: メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 会社概要 */}
          <section className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
            <h2 className="text-lg font-medium text-secondary mb-3">会社概要</h2>
            <p className="text-sm text-text leading-relaxed">{c.description}</p>
          </section>

          {/* 対応エリア */}
          <section className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
            <h2 className="text-lg font-medium text-secondary mb-3">対応エリア</h2>
            <div className="flex flex-wrap gap-2">
              {c.areas.map((area) => (
                <span
                  key={area}
                  className="text-sm text-text bg-bg-surface px-3 py-1.5 rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </section>

          {/* 保有資格 */}
          {c.qualifications.length > 0 && (
            <section className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)]">
              <h2 className="text-lg font-medium text-secondary mb-3">保有資格</h2>
              <div className="flex flex-wrap gap-2">
                {c.qualifications.map((q) => (
                  <span
                    key={q}
                    className="text-sm font-medium text-secondary bg-secondary/10 px-3 py-1.5 rounded-full"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 右カラム: サイドバー */}
        <div className="space-y-4">
          {/* KPIカード */}
          <div className="rounded-[10px] border border-border bg-bg-card p-4 shadow-[var(--portal-shadow)] space-y-4">
            <div className="text-center">
              <div className="text-xs text-text2 mb-1">評価</div>
              <div className="text-2xl font-medium text-primary tabular-nums">
                {c.rating.toFixed(1)}
              </div>
              <div className="text-xs text-text2">{c.review_count}件のレビュー</div>
            </div>
            <div className="border-t border-border pt-4 text-center">
              <div className="text-xs text-text2 mb-1">実績件数</div>
              <div className="text-xl font-medium text-text tabular-nums">
                {c.project_count}件
              </div>
            </div>
            <div className="border-t border-border pt-4 text-center">
              <div className="text-xs text-text2 mb-1">対応エリア</div>
              <div className="text-base font-medium text-text">
                {c.areas.length}都道府県
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <Link
            href="/auth/register"
            className="btn-primary block w-full text-center"
          >
            この業者に相談する
          </Link>

          <Link
            href="/contractors"
            className="btn-secondary block w-full text-center"
          >
            業者一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
