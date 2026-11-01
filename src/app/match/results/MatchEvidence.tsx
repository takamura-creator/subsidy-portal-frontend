/**
 * 診断結果カードの「要件チェック」と「根拠」（2026-11-01 AI 判定の作り直し PR-3・
 * backend 設計書 takamura-creator/subsidy-portal docs/design/2026-11-01_ai-matching_redesign.md §2-4）。
 *
 * - 要件チェック: backend がコードで判定した ○／要確認。AI は使っていない
 * - 合い具合の理由・根拠の引用: AI が書き、backend が「引用が公式の説明文にそのまま有るか」を確かめたものだけ届く
 * - 出典（公式ページ）と最終確認日
 *
 * 項目を返さない backend（PR-1 より前）では何も出さない＝従来の表示のまま。
 * カメラが対象か・直接申請できるかの詳しい説明は、既存の CameraEligibilityNote / IndirectApplicantNote が出すので、
 * ここでは印（要確認）だけにして同じ文を2回出さない。
 */

import type { MatchCheck, MatchedSubsidy } from "@/lib/api";

/** 既存の注記コンポーネントが詳しい説明を出す項目 */
const DETAIL_SHOWN_ELSEWHERE = new Set(["camera", "direct"]);

function isHttpUrl(url: string | undefined | null): url is string {
  return !!url && /^https?:\/\//i.test(url);
}

/** "2026-10-27" → "2026年10月27日"。読めない値はそのまま */
function formatCheckedAt(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : value;
}

function CheckItem({ check }: { check: MatchCheck }) {
  const met = check.status === "met";
  const showDetail = !met && check.detail && !DETAIL_SHOWN_ELSEWHERE.has(check.key);
  return (
    <li
      data-testid="match-check"
      data-status={check.status}
      title={check.detail || undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "1px 8px",
        borderRadius: 12,
        fontSize: 11,
        lineHeight: 1.6,
        background: met ? "var(--hc-primary-soft)" : "var(--hc-warning-subtle)",
        color: met ? "var(--hc-success)" : "var(--hc-warning-text)",
        border: met ? "1px solid transparent" : "1px solid var(--hc-warning)",
      }}
    >
      <span aria-hidden="true">{met ? "○" : "△"}</span>
      <span>
        {check.label}
        {met ? <span className="sr-only">（条件を満たしています）</span> : "（要確認）"}
        {showDetail ? ` ${check.detail}` : ""}
      </span>
    </li>
  );
}

export default function MatchEvidence({ item }: { item: MatchedSubsidy }) {
  const checks = item.checks ?? [];
  const quote = item.evidence_quote?.trim();
  const reason = item.fit_reason?.trim();
  const sourceUrl = item.subsidy.source_url;
  const checkedAt = item.checked_at?.trim();

  if (checks.length === 0 && !quote && !reason && !checkedAt) return null;

  return (
    <div data-testid="match-evidence" style={{ margin: "0 0 8px" }}>
      {checks.length > 0 && (
        <>
          <p style={{ fontSize: 10, color: "var(--hc-text-muted)", margin: "0 0 4px" }}>要件チェック</p>
          <ul
            aria-label="要件チェック"
            style={{ display: "flex", flexWrap: "wrap", gap: 4, listStyle: "none", padding: 0, margin: "0 0 8px" }}
          >
            {checks.map((c) => (
              <CheckItem key={c.key} check={c} />
            ))}
          </ul>
        </>
      )}

      {reason && (
        <p data-testid="match-fit-reason" style={{ fontSize: 12, color: "var(--hc-navy)", lineHeight: 1.6, margin: "0 0 4px" }}>
          {reason}
        </p>
      )}

      {quote && (
        <blockquote
          data-testid="match-evidence-quote"
          cite={isHttpUrl(sourceUrl) ? sourceUrl : undefined}
          style={{
            margin: "0 0 4px",
            padding: "4px 10px",
            borderLeft: "3px solid var(--hc-border)",
            fontSize: 11,
            lineHeight: 1.6,
            color: "var(--hc-text-muted)",
          }}
        >
          公式の説明より：「{quote}」
        </blockquote>
      )}

      {(isHttpUrl(sourceUrl) || checkedAt) && (
        <p data-testid="match-source" style={{ fontSize: 10, color: "var(--hc-text-muted)", margin: 0 }}>
          {isHttpUrl(sourceUrl) && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
              公式ページ
              <span className="sr-only">（新しいタブで開きます）</span>
            </a>
          )}
          {isHttpUrl(sourceUrl) && checkedAt && "・"}
          {checkedAt && `最終確認日 ${formatCheckedAt(checkedAt)}`}
        </p>
      )}
    </div>
  );
}
