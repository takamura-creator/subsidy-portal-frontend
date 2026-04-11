"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  { q: "補助金診断は本当に無料ですか？", a: "はい、完全無料です。業種・従業員数・都道府県を入力するだけで、AIが最適な補助金を自動マッチングします。診断後の申請書作成まで無料でご利用いただけます。" },
  { q: "どの補助金が使えるか分からないのですが？", a: "ご安心ください。全国の補助金データベースからAIが自動で最適な補助金を提案します。IT導入補助金、ものづくり補助金、各自治体の独自補助金など幅広く対応しています。" },
  { q: "申請書の作成にはどのくらいかかりますか？", a: "必要情報を入力いただければ、AIが申請書のドラフトを即座に生成します。従来数日かかっていた作業が数分で完了します。" },
  { q: "補助金の審査期間はどのくらいですか？", a: "補助金の種類によりますが、一般的にIT導入補助金は申請から約1〜2ヶ月、自治体の補助金は2週間〜1ヶ月程度です。公募期間内にお早めにお申し込みください。" },
  { q: "従業員が少ない個人事業主でも申請できますか？", a: "はい、個人事業主の方も多くの補助金に申請可能です。小規模事業者持続化補助金やIT導入補助金など、小規模事業者向けの枠が用意されています。" },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl md:text-2xl font-medium text-center mb-10">よくある質問</h2>
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="card border border-border !p-0 overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-medium text-sm hover:bg-bg-surface/50 transition"
                aria-expanded={openIdx === i}
                aria-controls={`faq-${i}`}
              >
                <span>{item.q}</span>
                <svg
                  className={`w-5 h-5 shrink-0 text-primary transition-transform duration-300 ${openIdx === i ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id={`faq-${i}`}
                role="region"
                className={`accordion-content ${openIdx === i ? "open" : ""}`}
              >
                <div className="accordion-inner">
                  <p className="px-6 pb-4 text-sm text-text2 leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
