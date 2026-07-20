import Link from "next/link";
import { INDUSTRY_LPS } from "@/data/industry-lp";

/**
 * 業種別LP（6業種）への導線セクション。
 * 施工対応6都県のFullLPで使用（既存の業種LPデータ INDUSTRY_LPS を再利用・重複定義しない）。
 */
export default function IndustryLinksSection() {
  return (
    <section className="py-10 bg-bg border-t border-border">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2 className="text-base font-bold text-navy mb-3 hc-heading-sora">
          業種別の防犯カメラ・補助金ガイド
        </h2>
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-[14px]">
          {INDUSTRY_LPS.map((lp) => (
            <li key={lp.slug}>
              <Link
                href={`/industries/${lp.slug}`}
                className="text-primary hover:underline"
              >
                {lp.industry}向けガイド →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
