"use client";

/**
 * 補助金詳細ページ中央カラムのセクション群（#overview 〜 #documents）
 * SubsidyDetailClient から抽出。
 */

import type { Subsidy } from "@/lib/api";
import { getDaysUntil } from "@/lib/deadlineUtils";
import { formatRate, formatSubsidyAmount } from "@/lib/subsidyFormatters";
import { subsidyStatusLabel } from "@/lib/subsidyStatus";

interface SubsidyInfoSectionsProps {
  subsidy: Subsidy;
}

const SECTION_H2_STYLE: React.CSSProperties = {
  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
  fontSize: "clamp(24px, 3vw, 32px)" as React.CSSProperties["fontSize"],
  fontWeight: 700,
  color: "var(--hc-navy)",
  marginBottom: 24,
  letterSpacing: "-0.4px",
  marginTop: 0,
  lineHeight: 1.3,
};

/**
 * 対象者の表記（2026-10-27）。旧実装は全制度に「中小企業・小規模事業者（従業員300人以下）」と出しており、
 * 個人宅向け・自治会向けの制度で誤りになっていた。正本の target_industries から作る。
 */
function targetText(s: Subsidy): string {
  const t = s.target_industries ?? [];
  if (t.includes("個人宅")) return "住宅に住む世帯（個人宅向け。法人・事業者は対象外）";
  if (t.length > 0 && t.every((x) => x === "自治会・町会")) return "自治会・町会などの地域団体";
  const size = s.max_employees ? `（従業員${s.max_employees}人以下などの規模要件あり）` : "";
  if (t.length > 0) return `${t.join("、")}${size}`;
  return size ? `中小企業・小規模事業者${size}` : "公式の要件をご確認ください";
}

/** 自己負担の割合（補助率が無い・0 の制度は「—」） */
function selfPayText(s: Subsidy): string {
  const mx = s.rate_max != null && s.rate_max > 0 ? s.rate_max : null;
  const mn = s.rate_min != null && s.rate_min > 0 ? s.rate_min : null;
  if (mx == null) return "—";
  const hi = `${Math.round((1 - mx) * 100)}%`;
  return mn != null && Math.abs(mn - mx) > 0.0005 ? `${hi}〜${Math.round((1 - mn) * 100)}%` : hi;
}

export default function SubsidyInfoSections({ subsidy: s }: SubsidyInfoSectionsProps) {
  const days = getDaysUntil(s.deadline);
  const docs = s.required_documents ?? [];

  return (
    <>
      {/* 概要 */}
      <section id="overview" style={{ marginBottom: 80 }}>
        <h2 style={SECTION_H2_STYLE}>概要</h2>
        <p style={{ fontSize: 16, color: "var(--hc-text-muted)", lineHeight: 1.8, marginBottom: 6 }}>
          {s.description || "詳細情報は公式サイトをご確認ください。"}
        </p>
      </section>

      {/* 対象要件 */}
      <section id="requirements" style={{ marginBottom: 80 }}>
        <h2 style={SECTION_H2_STYLE}>対象要件</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <th>対象者</th>
              <td>{targetText(s)}（詳細は公式の要件をご確認ください）</td>
            </tr>
            <tr>
              <th>対象設備</th>
              <td>防犯カメラ・監視カメラ関連（対象となる機器・経費は公式の要件をご確認ください）</td>
            </tr>
            <tr>
              <th>補助率</th>
              <td>{formatRate(s.rate_min, s.rate_max)}</td>
            </tr>
            <tr>
              <th>補助上限</th>
              <td>{formatSubsidyAmount(s)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 補助額・補助率 */}
      <section id="amount" style={{ marginBottom: 80 }}>
        <h2 style={SECTION_H2_STYLE}>補助額・補助率</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <th>補助率</th>
              <td>{formatRate(s.rate_min, s.rate_max)}</td>
            </tr>
            <tr>
              <th>補助上限</th>
              <td>{formatSubsidyAmount(s)}</td>
            </tr>
            <tr>
              <th>自己負担</th>
              <td>
                {selfPayText(s)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 締切・スケジュール */}
      <section id="deadline" style={{ marginBottom: 80 }}>
        <h2 style={SECTION_H2_STYLE}>締切・スケジュール</h2>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7 }}>
          <li style={{ marginBottom: 6 }}>
            申請締切:{" "}
            <strong style={{ color: "var(--hc-accent)" }}>
              {s.deadline}
              {/* 日付は「あとN日」の補足だけ。受付状態はステータス行（API の status）が唯一の正 */}
              {s.status === "open" && days !== null && days > 0 && `（あと${days}日）`}
            </strong>
          </li>
          <li style={{ marginBottom: 6 }} data-testid="subsidy-status-line">
            ステータス: {subsidyStatusLabel(s.status)}
          </li>
        </ul>
        {s.application_tips && (
          <div style={{
            marginTop: 8,
            padding: "10px 14px",
            background: "var(--hc-primary-muted)",
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
      <section id="howto" style={{ marginBottom: 80 }}>
        <h2 style={SECTION_H2_STYLE}>申請方法</h2>
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
      <section id="industries" style={{ marginBottom: 80 }}>
        <h2 style={SECTION_H2_STYLE}>対象業種</h2>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", lineHeight: 1.7, marginBottom: 6 }}>
          {s.target_industries.length > 0
            ? `${s.target_industries.join("、")} 等（中小企業基本法に定める中小企業に該当する全業種）`
            : "製造業、小売業、飲食業、サービス業、医療・介護、建設業、宿泊業、運輸業 等（中小企業基本法に定める中小企業に該当する全業種）"}
        </p>
      </section>

      {/* 必要書類一覧 */}
      <section id="documents" style={{ marginBottom: 80 }}>
        <h2 style={SECTION_H2_STYLE}>必要書類</h2>
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
    </>
  );
}
