import Link from "next/link";
import { getVerifiedLpSubsidies, LP_CHECKED_ON } from "@/data/lp-verified-subsidies";

/* ---------------- 確認台帳の補助制度リスト（FullLP・InformationLP 共通） ---------------- */
// 2026-10-27: 旧 SubsidyList は API の全件（実在を確認できない制度・締切を過ぎた制度を含む）を
// 「【2026年最新】」の下にそのまま並べていた。公式資料で確認できた制度だけを、対象者・受付状況・
// 確認日・出典つきで出す（台帳: src/data/lp-verified-subsidies.ts）。

export function VerifiedSubsidyList({
  prefecture,
  heading,
  availableIds,
  hideRecipeCTA,
}: {
  prefecture: string;
  heading: string;
  /** API に存在する補助金 id（サイト内の制度ページへのリンク可否に使う） */
  availableIds: ReadonlySet<string>;
  hideRecipeCTA?: boolean;
}) {
  const items = getVerifiedLpSubsidies(prefecture);

  return (
    <section className="py-14" data-testid="lp-verified-subsidies">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2 className="text-xl font-bold text-navy mb-2 hc-heading-sora">{heading}</h2>
        <p className="text-[13px] text-text-muted leading-relaxed mb-6">
          公式資料で内容を確認できた制度だけを載せています（確認日 {LP_CHECKED_ON}）。
          受付状況は確認日時点のものです。申請前に必ず各制度の公式ページをご確認ください。
        </p>

        {items.length === 0 ? (
          <p className="text-[14px] text-text-muted leading-relaxed">
            {prefecture}で防犯カメラに使える制度のうち、公式資料で内容を確認できたものはまだ掲載していません。
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {items.map((s) => (
              <article
                key={`${s.owner}-${s.name}`}
                className="bg-white border border-border rounded-[10px] p-5"
                data-testid="lp-verified-subsidy"
              >
                <p className="text-[12px] text-text-muted mb-1">{s.owner}</p>
                <h3 className="font-bold text-navy text-[15px] mb-2 hc-heading-sora">{s.name}</h3>
                <p className="mb-3">
                  <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border border-border bg-bg text-text-muted">
                    {s.checkedOn}時点: {s.statusOnCheck}
                  </span>
                </p>
                <dl className="text-[13px] text-text-muted space-y-1.5">
                  {[
                    ["対象者", s.target],
                    ["補助率", s.rate],
                    ["上限", s.maxAmount],
                    ["受付", s.period],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[4.5em_1fr] gap-2">
                      <dt>{label}</dt>
                      <dd className="text-navy">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-[12px] text-text-muted">
                  確認日 {s.checkedOn} ／{" "}
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    出典（{s.owner}の公式資料）
                  </a>
                </p>
                <div className="mt-3 flex items-center justify-between">
                  {s.subsidyId && availableIds.has(s.subsidyId) ? (
                    <Link href={`/subsidies/${s.subsidyId}`} className="text-[13px] text-primary hover:underline">
                      サイト内の制度ページ →
                    </Link>
                  ) : (
                    <span />
                  )}
                  {!hideRecipeCTA && (
                    <Link
                      href="/my/wizard"
                      className="text-[13px] text-[color:var(--hc-accent)] hover:underline"
                    >
                      見積もりを作る
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-6 text-[12px] text-text-muted leading-relaxed">
          ※ 国の中小企業向け制度（デジタル化・AI導入補助金、小規模事業者持続化補助金、業務改善助成金など）は、
          防犯カメラが補助対象になることを公式資料で確認できていないため、このページには載せていません。
          全国の制度の受付状況は
          <Link href="/subsidies" className="text-primary hover:underline mx-1">
            補助金一覧
          </Link>
          で確認できます。
        </p>
      </div>
    </section>
  );
}

export default VerifiedSubsidyList;
