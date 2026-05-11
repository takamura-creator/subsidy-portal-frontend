import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { getAllSubsidies } from "@/lib/subsidies-server";
import { INDUSTRIES } from "@/lib/constants";
import { filterCameraOnly } from "@/lib/subsidyFilters";

const INDUSTRY_META: Record<string, { icon: string; desc: string }> = {
  "小売業":             { icon: "🏪", desc: "店舗・スーパー・コンビニ" },
  "飲食業":             { icon: "🍽️", desc: "レストラン・カフェ・厨房" },
  "医療・介護":         { icon: "🏥", desc: "病院・クリニック・老人ホーム" },
  "製造業":             { icon: "🏭", desc: "工場・生産ライン・ヤード" },
  "建設業":             { icon: "🔨", desc: "工事現場・資材置場" },
  "宿泊業":             { icon: "🏨", desc: "ホテル・旅館・民宿" },
  "サービス業":         { icon: "🔧", desc: "事務所・各種サービス拠点" },
  "運輸業":             { icon: "🚛", desc: "倉庫・配送センター・駐車場" },
  "廃棄物処理業":       { icon: "♻️", desc: "産廃ヤード・処理施設" },
  "農業・林業・水産業": { icon: "🌾", desc: "農場・漁港・ハウス施設" },
  "不動産業":           { icon: "🏢", desc: "賃貸マンション・アパート" },
  "自治会・町会":       { icon: "🏘️", desc: "街頭・公道・通学路" },
  "その他":             { icon: "📋", desc: "上記以外の業種" },
};

export const metadata = {
  title: "業種からさがす | HOJYO CAME",
  description: "あなたの業種に合った防犯カメラ補助金を探せます。登録不要で閲覧可能。",
};

const S = {
  sideLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "-0.3px",
    marginBottom: 12,
    fontFamily: "'Sora', sans-serif",
    color: "var(--hc-navy)",
  },
  stepRow: { display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  stepNum: {
    width: 20, height: 20, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
    background: "var(--hc-primary)", color: "#fff",
  },
  stepText: { fontSize: 12, color: "var(--hc-text-muted)", lineHeight: 1.5 },
  hr: { borderColor: "var(--hc-border)", margin: "12px 0" } as React.CSSProperties,
  note: { fontSize: 12, lineHeight: 1.6, color: "var(--hc-text-muted)" },
  navLink: {
    display: "block", width: "100%", textAlign: "left" as const,
    fontSize: 12, fontWeight: 500, padding: "8px 12px",
    borderRadius: 4, border: "1px solid var(--hc-border)",
    marginBottom: 8, color: "var(--hc-navy)", background: "#fff",
    textDecoration: "none",
  },
  navLinkPrimary: {
    display: "block", width: "100%", textAlign: "left" as const,
    fontSize: 12, fontWeight: 700, padding: "8px 12px",
    borderRadius: 4, border: "1px solid var(--hc-primary)",
    marginBottom: 8, color: "var(--hc-primary)", background: "#fff",
    textDecoration: "none",
  },
} as const;

import type React from "react";

export default function MatchPage() {
  const allSubsidies = getAllSubsidies();

  function countForIndustry(ind: string): number {
    // /subsidies?industry=X のリスト件数と同じロジックを適用（カメラ関連 & エリア & NG除外 & 業種）
    return filterCameraOnly(allSubsidies, ind).length;
  }

  const left = (
    <div>
      <p style={S.sideLabel}>使い方</p>
      {["業種を選ぶ", "使える補助金を確認する", "登録して申請書を自動生成"].map((step, i) => (
        <div key={i} style={S.stepRow}>
          <span style={S.stepNum}>{i + 1}</span>
          <span style={S.stepText}>{step}</span>
        </div>
      ))}
      <hr style={S.hr} />
      <p style={S.note}>
        補助金一覧は<strong>ログイン不要</strong>で閲覧できます
      </p>
    </div>
  );

  const right = (
    <div>
      <p style={S.sideLabel}>関連ページ</p>
      <Link href="/subsidies" style={S.navLink}>📋 補助金一覧を見る</Link>
      <Link href="/partners/multik" style={S.navLink}>🛠 施工パートナー</Link>
      <Link href="/auth/register" style={S.navLinkPrimary}>✍️ 無料登録して申請書を作る</Link>
      <hr style={S.hr} />
      <p style={S.note}>
        補助金情報は参考情報です。最終的な申請要件は公式サイトをご確認ください。
      </p>
    </div>
  );

  const center = (
    <main style={{ padding: "32px 16px", maxWidth: 900, margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: "var(--hc-navy)",
          letterSpacing: "-0.3px",
          textAlign: "center",
          margin: "0 0 28px",
        }}
      >
        業種選択
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: 16,
        }}
      >
        {INDUSTRIES.map((ind) => {
          const meta = INDUSTRY_META[ind] ?? { icon: "📋", desc: "" };
          const count = countForIndustry(ind);
          return (
            <Link
              key={ind}
              href={`/subsidies?industry=${encodeURIComponent(ind)}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <article
                className="hc-industry-card"
                style={{
                  borderRadius: 10,
                  padding: 16,
                  cursor: "pointer",
                  height: "100%",
                  minHeight: 156,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{
                  width: 40, height: 40, marginBottom: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, lineHeight: 1, flexShrink: 0,
                }}>
                  {meta.icon}
                </div>
                <h2 style={{
                  fontSize: 16, fontWeight: 700, margin: "0 0 4px",
                  color: "var(--hc-navy)",
                  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                  letterSpacing: "-0.3px",
                }}>
                  {ind}
                </h2>
                <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.6, flex: 1 }}>
                  {meta.desc}
                </p>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    marginTop: 8,
                    color: count > 0 ? "var(--hc-primary)" : "var(--hc-text-muted)",
                  }}
                >
                  {count > 0 ? `補助金 ${count}件 →` : "情報準備中"}
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: "var(--hc-text-muted)", textAlign: "center" }}>
        申請書の自動生成は{" "}
        <Link href="/auth/register" style={{ color: "var(--hc-primary)", textDecoration: "none", fontWeight: 600 }}>
          無料登録後
        </Link>{" "}
        にご利用いただけます
      </p>
    </main>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
