/**
 * 「直接は申請できません。申請は市町村（または都道府県）を通じて行います」の注記（2026-10-28・審査[3]）。
 * indirect の制度でだけ出す。一覧のカード・/match の結果で同じ言葉（詳細・ウィザードは各画面の案内文）。
 * 上限額が自治体単位（例: 埼玉県わがまち防犯は1市町村あたり400万円）で、利用者が自分で受けられる額に読めないようにする。
 * 副作用・状態を持たないので Server / Client どちらのコンポーネントからも使える。
 */

import { indirectNoteText, isIndirect, type WithAttributes } from "@/lib/subsidyAttributes";

export default function IndirectApplicantNote({ subsidy }: { subsidy: WithAttributes }) {
  if (!isIndirect(subsidy)) return null;
  return (
    <p
      role="note"
      data-testid="indirect-applicant-note"
      style={{
        margin: "0 0 10px",
        padding: "4px 8px",
        fontSize: 11,
        lineHeight: 1.6,
        color: "var(--hc-navy)",
        background: "var(--hc-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 6,
      }}
    >
      {indirectNoteText(subsidy)}
    </p>
  );
}
