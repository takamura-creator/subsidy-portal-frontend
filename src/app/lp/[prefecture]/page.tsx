import Link from "next/link";
import type { Metadata } from "next";
import { fetchSubsidies, type Subsidy } from "@/lib/api";
import { LP_PREFECTURES } from "@/lib/constants";

type Props = {
  params: Promise<{ prefecture: string }>;
};

export async function generateStaticParams() {
  return LP_PREFECTURES.map((p) => ({
    prefecture: encodeURIComponent(p),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture } = await params;
  const name = decodeURIComponent(prefecture);
  return {
    title: `${name}の防犯カメラ補助金 | 補助金ポータル`,
    description: `${name}で使える防犯カメラ導入の補助金・助成金情報を一覧でご紹介。最大75%の補助金で初期費用を大幅削減できます。`,
    alternates: { canonical: `/lp/${prefecture}` },
  };
}

export default async function PrefectureLPPage({ params }: Props) {
  const { prefecture } = await params;
  const name = decodeURIComponent(prefecture);

  let subsidies: Subsidy[] = [];
  try {
    const subsidyData = await fetchSubsidies({ prefecture: name });
    subsidies = subsidyData.subsidies ?? [];
  } catch {
    // ビルド時にバックエンド不在の場合は空配列でフォールバック
  }

  const steps = [
    { icon: "🔍", title: "無料補助金診断", desc: "業種・従業員数・都道府県を入力するだけで最適な補助金を自動マッチング" },
    { icon: "📷", title: "業者マッチング・見積もり", desc: "対応可能な設置業者を自動マッチングし、見積もりを取得" },
    { icon: "📄", title: "申請書自動生成・提出", desc: "必要書類を自動生成し、申請手続きをスムーズに完了" },
  ];

  return (
    <main>
      {/* ヒーロー */}
      <section className="bg-secondary text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-medium mb-4">
            {name}で防犯カメラを導入するなら補助金を活用しよう
          </h1>
          <p className="text-xl mb-8 opacity-90">最大75%の補助金で初期費用を大幅削減</p>
          <Link
            href="/match"
            className="inline-block bg-bg text-primary font-medium px-8 py-4 rounded-[10px] hover:opacity-90 transition"
          >
            無料で補助金診断を受ける
          </Link>
        </div>
      </section>

      {/* 補助金一覧 */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl font-medium mb-8">{name}で使える補助金・助成金一覧</h2>
          {subsidies.length === 0 ? (
            <p className="text-text2">現在取得中です。しばらくお待ちください。</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {subsidies.map((s: Subsidy) => (
                <div key={s.id} className="card border border-border hover:border-accent/30 transition">
                  <h3 className="font-medium text-lg mb-2">{s.name}</h3>
                  <div className="text-sm text-text2 space-y-1">
                    <p>補助率: <span className="text-accent font-medium">{Math.round(s.rate_max * 100)}%</span></p>
                    <p>上限額: {s.max_amount.toLocaleString("ja-JP")}円</p>
                    <p>申請期限: {s.deadline}</p>
                    {s.prefecture && <p>対象: {s.prefecture}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 導入フロー */}
      <section className="py-16 bg-bg">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl font-medium mb-10 text-center">補助金を使った導入フロー</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="card text-center border border-border">
                <div className="text-4xl mb-4" role="img" aria-hidden="true">{step.icon}</div>
                <div className="text-sm text-accent font-medium mb-2">Step {i + 1}</div>
                <h3 className="font-medium text-lg mb-3">{step.title}</h3>
                <p className="text-sm text-text2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-2xl font-medium mb-4">{name}の補助金で防犯カメラを導入しませんか？</h2>
          <p className="mb-8 opacity-90">お問い合わせはこちら</p>
          <Link
            href="/match"
            className="inline-block bg-primary text-white font-medium px-8 py-4 rounded-[10px] hover:opacity-90 transition"
          >
            無料で補助金診断を受ける
          </Link>
        </div>
      </section>
    </main>
  );
}
