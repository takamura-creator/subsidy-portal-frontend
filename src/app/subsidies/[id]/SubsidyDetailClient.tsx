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

function getDaysUntil(dateStr: string): number {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 999;
  const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatAmount(amount: number): string {
  if (amount >= 10000000) return `${Math.round(amount / 10000000) * 1000}万円`;
  if (amount >= 10000) return `${Math.round(amount / 10000)}万円`;
  return `${amount.toLocaleString("ja-JP")}円`;
}

const DOCUMENTS = [
  { label: "gBizIDプライムアカウント", done: true },
  { label: "履歴事項全部証明書", done: true },
  { label: "法人税の納税証明書", done: false },
  { label: "事業計画書", done: false },
  { label: "ITツール見積書", done: false },
];

const TOC_ITEMS = [
  { href: "#overview", label: "概要" },
  { href: "#requirements", label: "対象要件" },
  { href: "#amount", label: "補助額・補助率" },
  { href: "#deadline", label: "締切・スケジュール" },
  { href: "#howto", label: "申請方法" },
  { href: "#industries", label: "対象業種" },
  { href: "#documents", label: "必要書類" },
];

export default function SubsidyDetailClient({ subsidy: s }: { subsidy: Subsidy }) {
  const [activeSection, setActiveSection] = useState("#overview");
  const [checkedDocs, setCheckedDocs] = useState<boolean[]>(DOCUMENTS.map((d) => d.done));

  const days = getDaysUntil(s.deadline);

  const toggleDoc = (idx: number) => {
    setCheckedDocs((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

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
          締切: {s.deadline}（あと{days}日）
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
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7, marginBottom: 6 }}>
          防犯カメラ・監視カメラシステムのうち、IoT連携型・クラウド録画型のシステムは本枠の対象になりやすい傾向があります。
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
              <td>セキュリティ対策を目的としたITツール（クラウド型監視カメラ含む）</td>
            </tr>
            <tr>
              <th>補助率</th>
              <td>{Math.round(s.rate_min * 100) === Math.round(s.rate_max * 100)
                ? `${Math.round(s.rate_min * 100)}%`
                : `1/${Math.round(1 / s.rate_min)} 〜 ${Math.round(1 / s.rate_max) === 1 ? "全額" : `${Math.round(1 / s.rate_max)}/${4}`}`
              }
              </td>
            </tr>
            <tr>
              <th>補助上限</th>
              <td>{formatAmount(s.max_amount)}</td>
            </tr>
            <tr>
              <th>申請方法</th>
              <td>IT導入支援事業者経由で電子申請</td>
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
              <td>1/2（通常）〜 3/4（小規模事業者）</td>
            </tr>
            <tr>
              <th>補助下限</th>
              <td>5万円</td>
            </tr>
            <tr>
              <th>補助上限</th>
              <td>{formatAmount(s.max_amount)}</td>
            </tr>
            <tr>
              <th>自己負担</th>
              <td>25% 〜 50%</td>
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
          <li style={{ marginBottom: 6 }}>公募開始: 2026年2月15日</li>
          <li style={{ marginBottom: 6 }}>
            申請締切: <strong style={{ color: "var(--hc-accent)" }}>{s.deadline}（あと{days}日）</strong>
          </li>
          <li style={{ marginBottom: 6 }}>採択通知: 2026年6月上旬（予定）</li>
          <li style={{ marginBottom: 6 }}>事業完了: 2026年12月31日</li>
        </ul>
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
          <li style={{ marginBottom: 6 }}>IT導入支援事業者を選定</li>
          <li style={{ marginBottom: 6 }}>ITツール（監視カメラシステム）を選定</li>
          <li style={{ marginBottom: 6 }}>gBizIDプライムを取得</li>
          <li style={{ marginBottom: 6 }}>申請マイページから電子申請</li>
        </ol>
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

      {/* 必要書類チェックリスト */}
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
          必要書類チェックリスト
        </h2>
        <div style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          padding: 16,
        }}>
          {DOCUMENTS.map((doc, idx) => {
            const isDone = checkedDocs[idx];
            return (
              <div
                key={doc.label}
                onClick={() => toggleDoc(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: idx < DOCUMENTS.length - 1 ? "1px solid var(--hc-border)" : "none",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: `2px solid ${isDone ? "var(--hc-primary)" : "var(--hc-border)"}`,
                    borderRadius: 4,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    background: isDone ? "var(--hc-primary)" : "transparent",
                    color: isDone ? "#fff" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {isDone ? "✓" : ""}
                </div>
                <span
                  style={{
                    color: isDone ? "var(--hc-text-muted)" : "var(--hc-text)",
                    textDecoration: isDone ? "line-through" : "none",
                  }}
                >
                  {doc.label}
                </span>
              </div>
            );
          })}
        </div>
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
          ["情報ソース", "公式サイト"],
          ["最終更新", "2026/4/10"],
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
