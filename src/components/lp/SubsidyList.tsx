import Link from "next/link";
import type { Subsidy } from "@/lib/api";

/* ---------------- 補助金リスト（FullLP・InformationLP 共通） ---------------- */
// C2（2026-07-20・Phase6差戻し）: src/app/lp/[prefecture]/page.tsx から純粋切り出し。
// 挙動・props型は変更なし。

export function SubsidyList({
  heading,
  subsidies,
  emptyText,
  hideRecipeCTA,
}: {
  heading: string;
  subsidies: Subsidy[];
  emptyText: string;
  hideRecipeCTA?: boolean;
}) {
  return (
    <section className="py-14">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2 className="text-xl font-bold text-navy mb-6 hc-heading-sora">
          {heading}
        </h2>
        {subsidies.length === 0 ? (
          <p className="text-[14px] text-text-muted leading-relaxed">
            {emptyText}
            <Link href="/subsidies" className="text-primary hover:underline mx-1">
              補助金一覧
            </Link>
            をご確認ください。
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {subsidies.map((s) => (
              <article
                key={s.id}
                className="bg-white border border-border rounded-[10px] p-5"
              >
                <h3 className="font-bold text-navy text-[15px] mb-2 hc-heading-sora">
                  {s.name}
                </h3>
                <dl className="text-[13px] text-text-muted space-y-1">
                  <div className="flex justify-between">
                    <dt>補助率上限</dt>
                    <dd className="text-navy font-semibold">
                      {typeof s.rate_max === "number" && Number.isFinite(s.rate_max)
                        ? `${Math.round(s.rate_max * 100)}%`
                        : "要確認"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>上限額</dt>
                    <dd className="text-navy font-semibold">
                      {typeof s.max_amount === "number" && Number.isFinite(s.max_amount)
                        ? `${s.max_amount.toLocaleString("ja-JP")}円`
                        : "要確認"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>締切</dt>
                    <dd>{s.deadline || "要確認"}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/subsidies/${s.id}`}
                    className="text-[13px] text-primary hover:underline"
                  >
                    制度詳細を見る →
                  </Link>
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
      </div>
    </section>
  );
}

export default SubsidyList;
