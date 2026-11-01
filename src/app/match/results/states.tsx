"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MATCH_TIMEOUT_MS } from "@/lib/api";
import { toApiIndustry } from "@/lib/constants";

export const SCORE_STYLES: Record<string, React.CSSProperties> = {
  高: {
    background: "var(--hc-primary-soft)",
    color: "var(--hc-success)",
    border: "2px solid var(--hc-success)",
  },
  中: {
    background: "var(--hc-text-subtle)",
    color: "var(--hc-text-muted)",
    border: "2px solid var(--hc-border)",
  },
  低: {
    background: "var(--hc-text-subtle)",
    color: "var(--hc-text-muted)",
    border: "2px solid var(--hc-border)",
  },
};

export function parseEmployees(raw: string): number {
  const m = raw.match(/\d+/);
  if (!m) return 10;
  const n = parseInt(m[0], 10);
  // "6〜20名" → 上限側を使用。"21〜50名" → 50。範囲不明なら数値そのまま
  // 2026-10-27: 旧正規表現 /\d+[^〜]*〜[^〜]*(\d+)/ は貪欲一致で上限の末尾1桁だけを拾い、
  // "6〜20名"→0・"21〜50名"→0 を送っていた（検証用モックで受信値0を確認）。「〜」直後の数字全体を取る。
  const m2 = raw.match(/〜\s*(\d+)/);
  if (m2) return parseInt(m2[1], 10);
  return n;
}

/** 事業者（自治会・町会・個人宅以外）か。backend の判定（routers/match.py _is_jichikai_industry）と同じ語で見る */
function isBusinessIndustry(industry: string): boolean {
  const api = toApiIndustry(industry);
  return !["自治会", "町会", "町内会", "地域団体", "マンション管理組合", "個人宅"].some((kw) => api.includes(kw));
}

/**
 * 候補0件（backend 404）の表示。
 * 事業者には「単独で使える制度は少ない」ことと、次の手（商店街・商店会での申請／補助金一覧／相談）を出す
 * （2026-11-01 調査: 6都県で、個々の事業者が単独で申請でき、カメラ機器が対象と公式資料で読める制度は見つからず、
 * 見つかったのは商店街・商工団体向けだけ。backend docs/data/2026-11-01_bouhan-camera_candidates.md §3〜4）。
 * 特定の制度が使えるとは言わない（「場合があります」）。
 */
export function EmptyState({ industry = "" }: { industry?: string }) {
  const business = isBusinessIndustry(industry);
  const listHref = industry ? `/subsidies?industry=${encodeURIComponent(industry)}` : "/subsidies";
  return (
    <div
      data-testid="match-empty"
      style={{
        padding: "40px 24px",
        textAlign: "center",
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
      }}
    >
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--hc-navy)",
          marginBottom: 8,
        }}
      >
        条件に合う補助金が見つかりませんでした
      </p>
      {business ? (
        <div data-testid="match-empty-business" style={{ textAlign: "left", maxWidth: 520, margin: "0 auto 20px" }}>
          <p style={{ fontSize: 13, color: "var(--hc-text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
            事業者が単独で防犯カメラの購入に使える補助金は、いまは多くありません。次の方法もご検討ください。
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            <li style={{ fontSize: 13, lineHeight: 1.7, color: "var(--hc-text)" }}>
              <strong>商店街・商店会で申請する</strong>
              <br />
              <span style={{ color: "var(--hc-text-muted)" }}>
                商店街や商店会が設置する防犯カメラには、区市町村や都県の補助がある場合があります。加盟している団体にご相談ください。
              </span>
            </li>
            <li style={{ fontSize: 13, lineHeight: 1.7, color: "var(--hc-text)" }}>
              <strong>受付前・締切後の制度も見る</strong>
              <br />
              <span style={{ color: "var(--hc-text-muted)" }}>
                受付期間の外にある制度は診断に出ません。補助金一覧では受付予定の制度も確認できます。
              </span>
            </li>
            <li style={{ fontSize: 13, lineHeight: 1.7, color: "var(--hc-text)" }}>
              <strong>専門スタッフに相談する</strong>
              <br />
              <span style={{ color: "var(--hc-text-muted)" }}>
                補助金を使わない場合の導入方法や費用も含めて、ご相談いただけます。
              </span>
            </li>
          </ul>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginBottom: 16 }}>
          入力条件を変えて再度お試しください。
        </p>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/match"
          className="btn-primary"
          style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, ...(business ? { width: "auto" } : {}) }}
        >
          診断をやり直す
        </Link>
        {business && (
          <>
            <Link
              href={listHref}
              className="btn-secondary"
              style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              補助金一覧を見る
            </Link>
            <Link
              href="/contact"
              className="btn-secondary"
              style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              専門スタッフに相談する
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * backend が AI の代わりに簡易判定で結果を返したとき（MatchResponse.fallback === true）の注記（2026-11-01 PR-A・設計書 §2-4）。
 * 失敗時の表示は components/shared/AiUnavailableNotice（旧 ErrorState は「ステータス番号」をそのまま出していたため置き換え）。
 */
export function FallbackNote() {
  return (
    <p
      role="status"
      data-testid="match-fallback-note"
      style={{
        fontSize: 12,
        color: "var(--hc-text-muted)",
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 8,
        padding: "8px 12px",
        margin: "0 0 16px",
      }}
    >
      ※ AIが混み合っているため、簡易的な判定で表示しています。
    </p>
  );
}

/** AI 診断の通常の所要（本番実測 26.8〜30.6 秒・2026-10-27）。進み具合の目安表示にだけ使う。 */
const TYPICAL_WAIT_SEC = 30;

/** 経過秒に応じた工程の文言（目安。実際の処理段階と同期しているわけではない） */
function waitingMessage(sec: number): string {
  if (sec < 5) return "条件に合う補助金を絞り込んでいます";
  if (sec < TYPICAL_WAIT_SEC - 5) return "AIが候補を比べて、おすすめ順を決めています";
  if (sec < TYPICAL_WAIT_SEC + 15) return "まもなく結果が出ます";
  return `混み合っています。もう少しお待ちください（最大${Math.round(MATCH_TIMEOUT_MS / 1000)}秒）`;
}

/**
 * 診断待ちの表示（2026-10-27）。AI 応答に約30秒かかるため、固定文言だけだと止まって見える。
 * 経過秒・工程の目安・目安バー（応答前は90%で止め、100%にはしない）で「進んでいる」ことを示す。
 */
export function LoadingState() {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => setSec(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const pct = Math.min(90, Math.round((sec / TYPICAL_WAIT_SEC) * 90));

  return (
    <div
      style={{ padding: "40px 24px", textAlign: "center", color: "var(--hc-text-muted)" }}
      aria-busy="true"
      data-testid="match-loading"
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 6 }} aria-live="polite">
        {waitingMessage(sec)}
      </div>
      <div style={{ fontSize: 12, marginBottom: 14 }}>
        経過 {sec}秒 ／ 通常{TYPICAL_WAIT_SEC}秒ほどかかります。この画面のままお待ちください。
      </div>
      <div
        role="progressbar"
        aria-label="診断の進み具合（目安）"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        style={{
          maxWidth: 320,
          height: 6,
          margin: "0 auto",
          borderRadius: 9999,
          background: "var(--hc-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--hc-primary)",
            transition: "width 0.9s linear",
          }}
        />
      </div>
    </div>
  );
}
