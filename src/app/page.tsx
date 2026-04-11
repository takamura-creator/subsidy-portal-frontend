import Link from "next/link";
import type { Metadata } from "next";
import { CountUp } from "@/components/home/CountUp";
import { FaqSection } from "@/components/home/FaqSection";

/* ============================================
   Metadata
   ============================================ */

export const metadata: Metadata = {
  title: "補助金ポータル | 防犯カメラ導入の補助金をAIが無料診断",
};

/* ============================================
   Data (static — SSR で埋め込み)
   ============================================ */

const STATS = [
  { value: 47, label: "対応都道府県", unit: "" },
  { value: 75, label: "最大補助率", unit: "%" },
  { value: 3, label: "診断ステップ", unit: "分" },
];

const TESTIMONIALS = [
  {
    quote: "IT導入補助金を活用してカメラ12台を導入。導入費用の65%が補助され、万引き被害が激減しました。申請から入金まで想像以上にスムーズでした。",
    company: "株式会社ミナミ商事",
    industry: "小売業",
    stars: 5,
    amount: "補助額: 120万円",
  },
  {
    quote: "夜間の入居者見守りに赤外線カメラが必要でしたが、補助金で全フロアに設置できました。スタッフの安心感が大きく上がっています。",
    company: "ケアホームあさひ",
    industry: "介護・福祉",
    stars: 5,
    amount: "補助額: 85万円",
  },
  {
    quote: "工事現場の遠隔監視カメラ導入に補助金を使えるとは知りませんでした。現場確認の移動コストが月に数十万円削減できています。",
    company: "東都建設株式会社",
    industry: "建設業",
    stars: 4,
    amount: "補助額: 150万円",
  },
];

/* ============================================
   FAQ Data (shared between JSON-LD and display)
   ============================================ */

const FAQ_DATA = [
  { q: "補助金診断は本当に無料ですか？", a: "はい、完全無料です。業種・従業員数・都道府県を入力するだけで、AIが最適な補助金を自動マッチングします。診断後の申請書作成まで無料でご利用いただけます。" },
  { q: "どの補助金が使えるか分からないのですが？", a: "ご安心ください。全国の補助金データベースからAIが自動で最適な補助金を提案します。IT導入補助金、ものづくり補助金、各自治体の独自補助金など幅広く対応しています。" },
  { q: "申請書の作成にはどのくらいかかりますか？", a: "必要情報を入力いただければ、AIが申請書のドラフトを即座に生成します。従来数日かかっていた作業が数分で完了します。" },
  { q: "補助金の審査期間はどのくらいですか？", a: "補助金の種類によりますが、一般的にIT導入補助金は申請から約1〜2ヶ月、自治体の補助金は2週間〜1ヶ月程度です。公募期間内にお早めにお申し込みください。" },
  { q: "従業員が少ない個人事業主でも申請できますか？", a: "はい、個人事業主の方も多くの補助金に申請可能です。小規模事業者持続化補助金やIT導入補助金など、小規模事業者向けの枠が用意されています。" },
];

/* ============================================
   JSON-LD Structured Data
   ============================================ */

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "防犯カメラ導入の補助金をAIで診断する方法",
  description: "業種・規模・所在地を入力するだけで、AIが最適な補助金を無料で診断します。",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "基本情報入力",
      text: "業種・従業員数・都道府県を選択します。",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "導入目的選択",
      text: "防犯・見守り・入退場管理など、カメラの導入目的を選択します。",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "AI診断結果",
      text: "AIが最適な補助金をスコア付きで提案します。申請書の作成支援も行います。",
    },
  ],
};

/* ============================================
   Page (Server Component — static HTML for SEO)
   ============================================ */

export default function Home() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      {/* ヒーロー */}
      <section className="bg-secondary text-white py-20 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-medium mb-4 leading-tight">
            補助金を使って
            <br />
            <span className="text-primary">防犯カメラ</span>を導入しよう
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 font-light">
            AIが最適な補助金を無料診断。導入費用を最大75%削減。
          </p>
          <Link
            href="/match"
            className="inline-block bg-primary hover:bg-primary/90 text-white text-lg font-medium px-10 py-4 rounded-[10px] transition shadow-lg"
          >
            今すぐ無料診断する
          </Link>
        </div>
      </section>

      {/* 実績数字 — CountUp は Client Component */}
      <section className="py-12 px-4 -mt-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="card text-center border border-border">
              <div className="text-3xl font-medium text-primary">
                <CountUp end={s.value} suffix={s.unit} />
              </div>
              <div className="text-sm text-text2 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 信頼バッジ */}
      <section className="pb-8 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-wrap justify-center gap-3">
          {[
            "全47都道府県対応",
            "日本語サポート",
            "申請書自動生成",
            "完全無料診断",
          ].map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 bg-primary/5 border border-primary/10 text-text text-sm font-medium px-4 py-2 rounded-full"
            >
              <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* 3ステップ紹介 */}
      <section className="py-16 px-4 bg-bg">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-xl md:text-2xl font-medium text-center mb-10">
            かんたん<span className="text-primary">3ステップ</span>で補助金診断
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "1", title: "基本情報入力", desc: "業種・従業員数・都道府県を選択" },
              { icon: "2", title: "導入目的選択", desc: "防犯・見守り・入退場管理など" },
              { icon: "3", title: "AI診断結果", desc: "最適な補助金をスコア付きで提案" },
            ].map((s, i) => (
              <div key={i} className="card text-center border border-border group hover:border-primary/30 transition">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-medium text-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition">
                  {s.icon}
                </div>
                <div className="text-xs text-primary font-medium mb-1">STEP {i + 1}</div>
                <h3 className="font-medium mb-2">{s.title}</h3>
                <p className="text-sm text-text2">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/match"
              className="btn-primary inline-block px-8 py-3"
            >
              無料診断を始める
            </Link>
          </div>
        </div>
      </section>

      {/* 導入企業の声 */}
      <section className="py-16 px-4 bg-bg-card">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-xl md:text-2xl font-medium text-center mb-10">
            導入企業の<span className="text-primary">声</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card border border-border relative flex flex-col gap-3 bg-bg">
                <span className="text-4xl text-primary/20 absolute top-4 left-4 font-serif leading-none select-none" aria-hidden="true">&ldquo;</span>
                <p className="text-sm text-text leading-relaxed pt-6">{t.quote}</p>
                <div className="flex gap-0.5 mt-1" aria-label={`${t.stars}つ星`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s} className={s < t.stars ? "text-warning" : "text-border"} aria-hidden="true">&#9733;</span>
                  ))}
                </div>
                <div className="mt-auto pt-3 border-t border-border">
                  <p className="font-medium text-sm">{t.company}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.industry}</span>
                    <span className="text-xs text-text2 font-medium">{t.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 都道府県LP リンク */}
      <section className="py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-xl md:text-2xl font-medium text-center mb-8">お住まいの地域から探す</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {["東京都","大阪府","神奈川県","愛知県","埼玉県","兵庫県","北海道","福岡県","千葉県","京都府"].map((p) => (
              <Link
                key={p}
                href={`/lp/${p}`}
                className="card text-center text-sm font-medium hover:border-primary hover:shadow-md transition border border-border py-3"
              >
                {p}
              </Link>
            ))}
          </div>
          <p className="text-center text-sm text-text2 mt-4">
            <Link href="/subsidies" className="text-primary hover:underline">
              全47都道府県の補助金一覧を見る →
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ — Client Component */}
      <FaqSection />

      {/* Final CTA */}
      <section className="py-16 px-4 bg-secondary text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-medium mb-4">
            補助金の活用で、防犯カメラ導入をもっと身近に
          </h2>
          <p className="text-white/70 mb-8 font-light">
            まずは無料診断で、あなたの会社に合う補助金を見つけましょう
          </p>
          <Link
            href="/match"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-medium px-10 py-4 rounded-[10px] transition shadow-lg text-lg"
          >
            無料で補助金診断する
          </Link>
        </div>
      </section>
    </>
  );
}
