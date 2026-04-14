import { fetchSubsidy } from "@/lib/api";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

export default async function SubsidyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let s;
  try {
    s = await fetchSubsidy(id);
  } catch {
    // Fallback mock for development
    s = {
      id,
      name: "IT導入補助金（セキュリティ対策推進枠）",
      category: "国",
      ministry: "中小企業庁",
      pref_code: "",
      prefecture: "全国",
      max_amount: 1000000,
      rate_min: 0.5,
      rate_max: 0.75,
      target_industries: ["製造業", "小売業", "飲食業", "サービス業"],
      max_employees: 300,
      deadline: "2026/4/30",
      status: "open",
      description:
        "中小企業・小規模事業者等が自社の課題やニーズに合ったITツールを導入する経費の一部を補助することで、業務効率化・売上アップをサポートする制度です。セキュリティ対策推進枠では、サイバーセキュリティ対策のためのITツール導入を支援します。防犯カメラ・監視カメラシステムのうち、IoT連携型・クラウド録画型のシステムは本枠の対象になりやすい傾向があります。",
      application_tips:
        "IT導入支援事業者（ベンダー）と事前に連携し、gBizIDプライムを早めに取得しておきましょう。採択率を上げるには「セキュリティ強化による業務改善」の観点で事業計画を記載することが重要です。",
      source_url: "https://www.it-hojo.jp/",
    };
  }

  function formatAmount(amount: number): string {
    if (amount >= 10000000) return `${Math.round(amount / 10000000) * 1000}万円`;
    if (amount >= 10000) return `${Math.round(amount / 10000)}万円`;
    return `${amount.toLocaleString("ja-JP")}円`;
  }

  const left = (
    <div>
      <Link
        href="/subsidies"
        className="flex items-center gap-1 text-xs mb-4 transition-colors"
        style={{ color: "var(--hc-text-muted)" }}
      >
        ← 補助金一覧
      </Link>

      <p
        className="text-xs font-bold uppercase mb-2"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        目次
      </p>
      {[
        { href: "#overview", label: "概要" },
        { href: "#requirements", label: "対象要件" },
        { href: "#amount", label: "補助額・補助率" },
        { href: "#deadline", label: "締切・スケジュール" },
        { href: "#howto", label: "申請方法" },
        { href: "#industries", label: "対象業種" },
        { href: "#tips", label: "申請のヒント" },
      ].map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="block px-2.5 py-2 mb-0.5 rounded text-xs transition-colors"
          style={{ color: "var(--hc-text-muted)" }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );

  const center = (
    <div>
      <nav className="text-xs mb-4" style={{ color: "var(--hc-text-muted)" }}>
        <Link href="/subsidies" style={{ color: "var(--hc-primary)" }} className="hover:underline">補助金一覧</Link>
        {" > "}
        {s.name}
      </nav>

      <h1
        className="text-xl font-bold mb-3"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        {s.name}
      </h1>

      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#FEF9C3", color: "var(--hc-accent)" }}>
          締切: {s.deadline}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(21,128,61,0.08)", color: "var(--hc-primary)" }}>
          最大 {formatAmount(s.max_amount)}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(0,0,0,0.04)", color: "var(--hc-text-muted)" }}>
          出典: {s.ministry}
        </span>
      </div>

      {/* 概要 */}
      <section id="overview" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          概要
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--hc-text-muted)" }}>
          {s.description || "詳細情報は公式サイトをご確認ください。"}
        </p>
      </section>

      {/* 対象要件 */}
      <section id="requirements" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          対象要件
        </h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {[
              ["対象者", `中小企業・小規模事業者${s.max_employees ? `（従業員${s.max_employees}人以下）` : ""}`],
              ["対象都道府県", s.prefecture || "全国"],
              ["補助率", `${Math.round(s.rate_min * 100)}〜${Math.round(s.rate_max * 100)}%`],
              ["補助上限", formatAmount(s.max_amount)],
            ].map(([label, value]) => (
              <tr key={label}>
                <th
                  className="text-left px-3 py-2 text-xs font-semibold w-1/3"
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
      </section>

      {/* 補助額・補助率 */}
      <section id="amount" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          補助額・補助率
        </h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {[
              ["補助率", `${Math.round(s.rate_min * 100)}〜${Math.round(s.rate_max * 100)}%`],
              ["補助上限", formatAmount(s.max_amount)],
            ].map(([label, value]) => (
              <tr key={label}>
                <th
                  className="text-left px-3 py-2 text-xs font-semibold w-1/3"
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
      </section>

      {/* 締切 */}
      <section id="deadline" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          締切・スケジュール
        </h2>
        <ul className="text-sm space-y-1 pl-4 list-disc" style={{ color: "var(--hc-text-muted)" }}>
          <li>申請締切: <strong style={{ color: "var(--hc-accent)" }}>{s.deadline}</strong></li>
          <li>採択通知: 締切後約2ヶ月（予定）</li>
        </ul>
      </section>

      {/* 申請方法 */}
      <section id="howto" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          申請方法
        </h2>
        <ol className="text-sm space-y-1 pl-4 list-decimal" style={{ color: "var(--hc-text-muted)" }}>
          <li>対象要件を確認する</li>
          <li>必要書類を準備する</li>
          <li>公式申請フォームから電子申請</li>
          <li>採択後、補助金を受給</li>
        </ol>
      </section>

      {/* 対象業種 */}
      <section id="industries" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          対象業種
        </h2>
        <p className="text-sm" style={{ color: "var(--hc-text-muted)" }}>
          {s.target_industries.length > 0
            ? s.target_industries.join("、")
            : "すべての業種（中小企業基本法に定める中小企業に該当する全業種）"}
        </p>
      </section>

      {/* 申請のヒント */}
      {s.application_tips && (
        <section id="tips" className="mb-6">
          <h2
            className="text-base font-bold mb-2 pb-1.5 border-b"
            style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
          >
            申請のヒント
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--hc-text-muted)" }}>
            {s.application_tips}
          </p>
        </section>
      )}
    </div>
  );

  const right = (
    <div>
      <p
        className="text-xs font-bold uppercase mb-3"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        アクション
      </p>

      {/* P0: この補助金で申請書を作成 */}
      <Link
        href={`/auth/login?redirect=/my/applications/new?subsidy_id=${s.id}`}
        className="block w-full text-center font-bold px-3 py-3 rounded-lg mb-3 border-2 transition-all text-sm"
        style={{ background: "var(--hc-primary)", color: "#fff", borderColor: "var(--hc-primary)" }}
      >
        この補助金で申請書を作成
      </Link>

      <Link
        href="/contractors"
        className="block w-full text-center font-bold px-3 py-3 rounded-lg mb-3 border-2 transition-all text-sm"
        style={{ background: "#fff", color: "var(--hc-primary)", borderColor: "var(--hc-primary)" }}
      >
        マッチする業者を探す
      </Link>

      {s.source_url && (
        <a
          href={s.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-xs font-medium px-3 py-2 rounded border mb-3 transition-colors"
          style={{ borderColor: "var(--hc-border)", color: "var(--hc-text-muted)", background: "#fff" }}
        >
          公式サイトを確認する ↗
        </a>
      )}

      <div
        className="rounded-lg border p-3 mt-3"
        style={{ borderColor: "var(--hc-border)", background: "#fff" }}
      >
        <p
          className="text-xs font-bold mb-2"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}
        >
          補助金情報
        </p>
        {[
          ["管轄", s.ministry],
          ["カテゴリ", s.category],
          ["対象地域", s.prefecture || "全国"],
          ["最終更新", "2026/4/8"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between py-1.5 border-b last:border-0 text-xs"
            style={{ borderColor: "var(--hc-border)" }}
          >
            <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
            <span className="font-medium" style={{ color: "var(--hc-navy)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
