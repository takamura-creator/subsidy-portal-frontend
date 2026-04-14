import Link from "next/link";
import { fetchContractor } from "@/lib/api";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

const MOCK_REVIEWS = [
  { stars: 5, text: "見積もりから施工まで丁寧に対応していただきました。補助金の申請サポートも助かりました。", author: "小売業 T様（東京都）" },
  { stars: 4, text: "工期の見積もりが正確で、予定通りに完了しました。アフターサポートも充実しています。", author: "製造業 M様（埼玉県）" },
];

export default async function ContractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let c;
  try {
    c = await fetchContractor(id);
  } catch {
    c = {
      id,
      company_name: "セキュアテック株式会社",
      description: "関東を中心に、監視カメラ・防犯カメラ設置の豊富な実績を持つ専門業者です。補助金申請のサポートも行っており、IT導入補助金やものづくり補助金の活用実績が多数あります。",
      areas: ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"],
      qualifications: ["電気工事士（第一種）", "防犯設備士", "HOJYO CAME 認定業者"],
      project_count: 142,
      rating: 4.8,
      review_count: 32,
    };
  }

  function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
    const sz = size === "md" ? "w-5 h-5" : "w-4 h-4";
    return (
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={sz}
            fill={i <= Math.round(rating) ? "var(--hc-accent)" : "var(--hc-border)"}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
      </span>
    );
  }

  const left = (
    <div>
      <Link
        href="/contractors"
        className="flex items-center gap-1 text-xs mb-4 transition-colors"
        style={{ color: "var(--hc-text-muted)" }}
      >
        ← 業者一覧
      </Link>

      <p
        className="text-xs font-bold uppercase mb-2"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        目次
      </p>
      {[
        { href: "#profile", label: "プロフィール" },
        { href: "#results", label: "施工実績" },
        { href: "#area", label: "対応エリア" },
        { href: "#reviews", label: "評価・レビュー" },
        { href: "#certs", label: "資格・認定" },
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
        <Link href="/contractors" style={{ color: "var(--hc-primary)" }} className="hover:underline">工事業者一覧</Link>
        {" > "}
        {c.company_name}
      </nav>

      <h1
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        {c.company_name}
      </h1>

      <div className="flex flex-wrap gap-2 mb-5">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: "rgba(21,128,61,0.08)", color: "var(--hc-primary)" }}
        >
          ★ {c.rating.toFixed(1)}（{c.review_count}件）
        </span>
        {c.rating >= 4.5 && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#FEF9C3", color: "var(--hc-accent)" }}>
            認定業者
          </span>
        )}
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(0,0,0,0.04)", color: "var(--hc-text-muted)" }}>
          {c.areas[0]}
        </span>
      </div>

      {/* プロフィール */}
      <section id="profile" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          会社概要
        </h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--hc-text-muted)" }}>
          {c.description}
        </p>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {[
              ["実績件数", `${c.project_count}件`],
              ["レビュー数", `${c.review_count}件`],
              ["評価", `★ ${c.rating.toFixed(1)}`],
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

      {/* 施工実績 */}
      <section id="results" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          施工実績
        </h2>
        <p className="text-sm mb-2" style={{ color: "var(--hc-text-muted)" }}>
          累計施工実績 <strong style={{ color: "var(--hc-primary)" }}>{c.project_count}件</strong>
        </p>
        <ul className="text-sm space-y-1 pl-4 list-disc" style={{ color: "var(--hc-text-muted)" }}>
          <li>小売店舗 防犯カメラシステム導入（IT導入補助金活用）</li>
          <li>製造工場 監視カメラ8台設置（ものづくり補助金活用）</li>
          <li>飲食チェーン 全5店舗一括導入</li>
        </ul>
      </section>

      {/* 対応エリア */}
      <section id="area" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          対応エリア
        </h2>
        <p className="text-sm" style={{ color: "var(--hc-text-muted)" }}>
          {c.areas.join("、")}
        </p>
      </section>

      {/* レビュー */}
      <section id="reviews" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          評価・レビュー
        </h2>
        <div className="space-y-3">
          {MOCK_REVIEWS.map((review, i) => (
            <div
              key={i}
              className="rounded-lg border p-3"
              style={{ borderColor: "var(--hc-border)", background: "#fff" }}
            >
              <StarRating rating={review.stars} />
              <p className="text-sm italic mt-1 leading-relaxed" style={{ color: "var(--hc-text-muted)" }}>
                「{review.text}」
              </p>
              <p className="text-xs mt-2" style={{ color: "var(--hc-text-muted)" }}>
                — {review.author}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 資格・認定 */}
      <section id="certs" className="mb-6">
        <h2
          className="text-base font-bold mb-2 pb-1.5 border-b"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px", borderColor: "var(--hc-border)" }}
        >
          資格・認定
        </h2>
        <ul className="text-sm space-y-1 pl-4 list-disc" style={{ color: "var(--hc-text-muted)" }}>
          {c.qualifications.map((q) => <li key={q}>{q}</li>)}
        </ul>
      </section>
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

      <Link
        href="/auth/login?redirect=/my/applications/new"
        className="block w-full text-center font-bold px-3 py-3 rounded-lg mb-3 border-2 transition-all text-sm"
        style={{ background: "var(--hc-primary)", color: "#fff", borderColor: "var(--hc-primary)" }}
      >
        見積もりを依頼する
      </Link>
      <button
        className="block w-full text-center font-bold px-3 py-3 rounded-lg mb-3 border-2 transition-all text-sm"
        style={{ background: "#fff", color: "var(--hc-primary)", borderColor: "var(--hc-primary)" }}
      >
        比較リストに追加
      </button>

      <div
        className="rounded-lg border p-3 mt-3"
        style={{ borderColor: "var(--hc-border)", background: "#fff" }}
      >
        <p
          className="text-xs font-bold mb-2"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}
        >
          基本情報
        </p>
        {[
          ["評価", `★ ${c.rating.toFixed(1)}`],
          ["実績", `${c.project_count}件`],
          ["エリア", c.areas[0]],
          ["認定", c.rating >= 4.5 ? "認定業者" : "—"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between py-1.5 border-b last:border-0 text-xs"
            style={{ borderColor: "var(--hc-border)" }}
          >
            <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
            <span
              className="font-medium"
              style={{ color: label === "評価" ? "var(--hc-accent)" : label === "認定" && c.rating >= 4.5 ? "var(--hc-primary)" : "var(--hc-navy)" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
