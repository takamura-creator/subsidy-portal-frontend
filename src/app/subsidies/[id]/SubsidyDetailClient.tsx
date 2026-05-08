"use client";

/**
 * 補助金詳細ページのクライアントインタラクション層。
 *
 * - Sprint 4 Task 0 で Server Component 化（`page.tsx`）した際に、
 *   クライアント側の state（目次 active / 書類チェックリスト）を本ファイルに分離。
 * - propsで `subsidy` を受け取り、fetch は行わない（データは Server Component がビルド時に確定）。
 */

import { useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import type { Subsidy } from "@/lib/api";

/** deadlineテキストから次の日付を抽出し、残日数を返す。パース不能ならnullを返す */
function getDaysUntil(dateStr: string): number | null {
  // "2026年5月12日" or "2026/5/12" 形式を探す
  const patterns = [
    /(\d{4})年(\d{1,2})月(\d{1,2})日/g,
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/g,
  ];
  const now = new Date();
  let nearest: number | null = null;
  for (const re of patterns) {
    let m;
    while ((m = re.exec(dateStr)) !== null) {
      const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      // 未来の日付のうち最も近いものを採用。すべて過去なら最も近い過去を採用
      if (diff > 0 && (nearest === null || diff < nearest)) {
        nearest = diff;
      } else if (nearest === null || (nearest < 0 && diff > nearest)) {
        nearest = diff;
      }
    }
  }
  return nearest;
}

function formatAmount(amount: number): string {
  if (amount >= 10000000) return `${Math.round(amount / 10000000) * 1000}万円`;
  if (amount >= 10000) return `${Math.round(amount / 10000)}万円`;
  return `${amount.toLocaleString("ja-JP")}円`;
}

/** 補助率を人間用テキストに変換 */
function formatRate(rateMin: number, rateMax: number): string {
  const minPct = Math.round(rateMin * 100);
  const maxPct = Math.round(rateMax * 100);
  if (minPct === maxPct) return `${minPct}%（${formatFraction(rateMin)}）`;
  return `${formatFraction(rateMin)}〜${formatFraction(rateMax)}`;
}

function formatFraction(rate: number): string {
  if (rate === 0.5) return "1/2";
  if (rate === 0.67 || Math.abs(rate - 2/3) < 0.01) return "2/3";
  if (rate === 0.75) return "3/4";
  if (rate === 1) return "全額";
  if (rate === 0.25) return "1/4";
  if (rate === 0.33 || Math.abs(rate - 1/3) < 0.01) return "1/3";
  return `${Math.round(rate * 100)}%`;
}

const TOC_ITEMS = [
  { href: "#overview", label: "概要" },
  { href: "#requirements", label: "対象要件" },
  { href: "#amount", label: "補助額・補助率" },
  { href: "#deadline", label: "締切・スケジュール" },
  { href: "#howto", label: "申請方法" },
  { href: "#industries", label: "対象業種" },
  { href: "#documents", label: "必要書類一覧" },
];

export default function SubsidyDetailClient({ subsidy: s }: { subsidy: Subsidy }) {
  const [activeSection, setActiveSection] = useState("#overview");
  const docs = s.required_documents ?? [];

  const days = getDaysUntil(s.deadline);

  /* ── Left column: Back + TOC ── */
  const left = (
    <div>
      <Link
        href="/subsidies"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: "var(--hc-text-muted)",
          textDecoration: "none",
          marginBottom: 16,
          transition: "color 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--hc-primary)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--hc-text-muted)")}
      >
        &larr; 補助金一覧
      </Link>

      <span className="section-title">目次</span>

      <div className="link-list">
        {TOC_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setActiveSection(item.href)}
            style={{
              display: "block",
              padding: "8px 10px",
              marginBottom: 2,
              borderRadius: 6,
              fontSize: 13,
              color: activeSection === item.href ? "var(--hc-primary)" : "var(--hc-text-muted)",
              textDecoration: "none",
              transition: "all 0.15s",
              background: activeSection === item.href ? "var(--hc-primary-muted)" : "transparent",
              fontWeight: activeSection === item.href ? 500 : 400,
              borderLeft: activeSection === item.href ? "3px solid var(--hc-primary)" : "3px solid transparent",
              paddingLeft: activeSection === item.href ? 7 : 10,
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );

  /* ── Center column: Content ── */
  const center = (
    <div style={{ padding: 0 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 16 }}>
        <Link href="/subsidies" style={{ color: "var(--hc-primary)", textDecoration: "none" }}>
          補助金一覧
        </Link>
        {" > "}
        {s.name}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: "1.4rem",
        fontWeight: 700,
        color: "var(--hc-navy)",
        letterSpacing: "-0.5px",
        marginBottom: 8,
      }}>
        {s.name}
      </h1>

      {/* Meta tags */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <span style={{
          fontSize: 12,
          padding: "4px 10px",
          borderRadius: 9999,
          fontWeight: 600,
          background: "var(--hc-accent-light)",
          color: "var(--hc-accent)",
        }}>
          {days !== null && days > 0
            ? `締切まであと${days}日`
            : days !== null && days <= 0
              ? "締切済み（次回公募をお待ちください）"
              : `締切: ${s.deadline}`}
        </span>
        <span style={{
          fontSize: 12,
          padding: "4px 10px",
          borderRadius: 9999,
          fontWeight: 600,
          background: "var(--hc-primary-soft)",
          color: "var(--hc-primary)",
        }}>
          最大 {formatAmount(s.max_amount)}
        </span>
        <span style={{
          fontSize: 12,
          padding: "4px 10px",
          borderRadius: 9999,
          fontWeight: 600,
          background: "var(--hc-text-subtle)",
          color: "var(--hc-text-muted)",
        }}>
          出典: {s.ministry} ・ 4/10更新
        </span>
      </div>

      {/* 概要 */}
      <section id="overview" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid var(--hc-border)",
          letterSpacing: "-0.3px",
          marginTop: 0,
        }}>
          概要
        </h2>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7, marginBottom: 6 }}>
          {s.description || "詳細情報は公式サイトをご確認ください。"}
        </p>
      </section>

      {/* 対象要件 */}
      <section id="requirements" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid var(--hc-border)",
          letterSpacing: "-0.3px",
          marginTop: 0,
        }}>
          対象要件
        </h2>
        <table className="info-table">
          <tbody>
            <tr>
              <th>対象者</th>
              <td>中小企業・小規模事業者（資本金3億円以下 or 従業員{s.max_employees || 300}人以下）</td>
            </tr>
            <tr>
              <th>対象設備</th>
              <td>防犯カメラ・監視カメラ関連設備</td>
            </tr>
            <tr>
              <th>補助率</th>
              <td>{formatRate(s.rate_min, s.rate_max)}</td>
            </tr>
            <tr>
              <th>補助上限</th>
              <td>{formatAmount(s.max_amount)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 補助額・補助率 */}
      <section id="amount" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid var(--hc-border)",
          letterSpacing: "-0.3px",
          marginTop: 0,
        }}>
          補助額・補助率
        </h2>
        <table className="info-table">
          <tbody>
            <tr>
              <th>補助率</th>
              <td>{formatRate(s.rate_min, s.rate_max)}</td>
            </tr>
            <tr>
              <th>補助上限</th>
              <td>{formatAmount(s.max_amount)}</td>
            </tr>
            <tr>
              <th>自己負担</th>
              <td>{Math.round((1 - s.rate_max) * 100)}%{s.rate_min !== s.rate_max ? `〜${Math.round((1 - s.rate_min) * 100)}%` : ""}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 締切・スケジュール */}
      <section id="deadline" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid var(--hc-border)",
          letterSpacing: "-0.3px",
          marginTop: 0,
        }}>
          締切・スケジュール
        </h2>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7 }}>
          <li style={{ marginBottom: 6 }}>
            申請締切: <strong style={{ color: "var(--hc-accent)" }}>
              {s.deadline}
              {days !== null && days > 0 && `（あと${days}日）`}
              {days !== null && days <= 0 && "（締切済み）"}
            </strong>
          </li>
          <li style={{ marginBottom: 6 }}>ステータス: {s.status === "open" ? "公募中" : s.status === "upcoming" ? "公募予定" : "締切済み"}</li>
        </ul>
        {s.application_tips && (
          <div style={{
            marginTop: 8,
            padding: "10px 14px",
            background: "var(--hc-primary-muted, #f0f7f0)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--hc-text-muted)",
            lineHeight: 1.7,
          }}>
            <strong style={{ color: "var(--hc-navy)" }}>申請のポイント:</strong> {s.application_tips}
          </div>
        )}
      </section>

      {/* 申請方法 */}
      <section id="howto" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid var(--hc-border)",
          letterSpacing: "-0.3px",
          marginTop: 0,
        }}>
          申請方法
        </h2>
        <ol style={{ paddingLeft: 20, fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7 }}>
          <li style={{ marginBottom: 6 }}>gBizIDプライムを取得</li>
          <li style={{ marginBottom: 6 }}>必要書類を準備</li>
          <li style={{ marginBottom: 6 }}>電子申請システムから申請</li>
        </ol>
        {s.source_url && (
          <p style={{ fontSize: 13, marginTop: 8 }}>
            <a
              href={s.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--hc-primary)", textDecoration: "underline" }}
            >
              公式サイトで詳細を確認 →
            </a>
          </p>
        )}
      </section>

      {/* 対象業種 */}
      <section id="industries" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid var(--hc-border)",
          letterSpacing: "-0.3px",
          marginTop: 0,
        }}>
          対象業種
        </h2>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7, marginBottom: 6 }}>
          {s.target_industries.length > 0
            ? `${s.target_industries.join("、")} 等（中小企業基本法に定める中小企業に該当する全業種）`
            : "製造業、小売業、飲食業、サービス業、医療・介護、建設業、宿泊業、運輸業 等（中小企業基本法に定める中小企業に該当する全業種）"}
        </p>
      </section>

      {/* 必要書類一覧 */}
      <section id="documents" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid var(--hc-border)",
          letterSpacing: "-0.3px",
          marginTop: 0,
        }}>
          必要書類
        </h2>
        {docs.length > 0 ? (
          <table className="info-table">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>書類名</th>
                <th style={{ width: "15%", textAlign: "center" }}>必須</th>
                <th>備考</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.key}>
                  <td style={{ fontWeight: 500 }}>{doc.label}</td>
                  <td style={{ textAlign: "center" }}>
                    {doc.required
                      ? <span style={{ color: "var(--hc-accent)", fontWeight: 600 }}>必須</span>
                      : <span style={{ color: "var(--hc-text-muted)" }}>任意</span>}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>{doc.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: 14, color: "var(--hc-text-muted)" }}>
            必要書類の詳細は公式サイトをご確認ください。
          </p>
        )}
      </section>
    </div>
  );

  /* ── Right column: Actions + Info ── */
  const right = (
    <div>
      <span className="section-title">アクション</span>

      {/* Primary: 申請書作成 */}
      <Link
        href={`/my/wizard?subsidy_id=${s.id}`}
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "none",
          border: "2px solid var(--hc-primary)",
          background: "var(--hc-primary)",
          color: "#fff",
          transition: "all 0.3s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = "var(--hc-primary)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "var(--hc-primary)";
          e.currentTarget.style.color = "#fff";
        }}
      >
        この補助金で申請書を作成
      </Link>

      {/* Secondary: 施工パートナー */}
      <Link
        href="/partners/multik"
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "none",
          border: "2px solid var(--hc-primary)",
          background: "var(--hc-white)",
          color: "var(--hc-primary)",
          transition: "all 0.3s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "var(--hc-primary-subtle)")}
        onMouseOut={(e) => (e.currentTarget.style.background = "var(--hc-white)")}
      >
        施工パートナーを見る
      </Link>

      {/* Info box */}
      <div style={{
        background: "var(--hc-white)",
        border: "1px solid var(--hc-border)",
        borderRadius: 8,
        padding: 16,
        marginTop: 12,
      }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 8,
          fontFamily: "'Sora', sans-serif",
        }}>
          補助金情報
        </h3>
        {[
          ["管轄", s.ministry],
          ["カテゴリ", s.category],
          ["地域", s.prefecture],
          ["データID", s.id],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid var(--hc-border)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
            <span style={{ fontWeight: 600, color: "var(--hc-text)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ThreeColumnLayout
      left={left}
      center={center}
      right={right}
      gridCols="200px 1fr 260px"
    />
  );
}
