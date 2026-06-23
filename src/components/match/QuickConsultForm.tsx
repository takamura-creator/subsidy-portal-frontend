"use client";

/**
 * 軽量相談フォーム（F5）。
 * 結果画面内インラインで使用。メール＋コメント（任意）＋同意のみ。
 * 既存 submitContact（POST /api/contact）を流用。
 */

import { useState } from "react";
import { track } from "@vercel/analytics";
import { submitContact, ApiError } from "@/lib/api";

interface Props {
  /** 対象制度名（messageに自動付与） */
  subsidyName?: string;
}

const MAX_COMMENT_LEN = 200;

export default function QuickConsultForm({ subsidyName }: Props) {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!consent) {
      setError("プライバシーポリシーへの同意が必要です");
      return;
    }
    setError("");
    setSubmitting(true);

    const nameLabel = subsidyName ? `制度名: ${subsidyName}／` : "";
    const messageBody = `${nameLabel}結果画面からの軽量相談${comment ? `\n\n${comment}` : ""}`;

    try {
      track("contact_start", { metadata: JSON.stringify({ from: "match_results_quick" }) });
      await submitContact({
        company_name: "（結果画面からの相談・未記入）",
        name: "（未記入）",
        email,
        inquiry_type: "軽量相談（診断結果画面）",
        message: messageBody,
        consent,
      });
      track("contact_submit", { metadata: JSON.stringify({ from: "match_results_quick" }) });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "送信に失敗しました。しばらくしてから再度お試しください。",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          background: "var(--hc-card-bg)",
          border: "1px solid var(--hc-border)",
          borderRadius: 10,
          padding: "20px 18px",
        }}
      >
        <div
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--hc-navy)",
            marginBottom: 6,
          }}
        >
          ご相談を受け付けました
        </div>
        <p style={{ fontSize: 12, color: "var(--hc-text-muted)", lineHeight: 1.6, margin: 0 }}>
          担当者より折り返しご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="軽量相談フォーム"
      style={{
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        padding: "18px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 4,
        }}
      >
        この制度、うちで使えますか?
      </div>
      <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
        メールアドレスだけで相談できます。担当者が要件を確認してご回答します。
      </p>

      {/* メールアドレス */}
      <div style={{ marginBottom: 10 }}>
        <label
          htmlFor="qcf-email"
          style={{ display: "block", fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 4 }}
        >
          メールアドレス <span style={{ color: "var(--hc-accent)" }}>*</span>
        </label>
        <input
          id="qcf-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mail@example.com"
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid var(--hc-border)",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 13,
            background: "var(--hc-card-bg)",
            color: "var(--hc-navy)",
            outline: "none",
          }}
        />
      </div>

      {/* 一言コメント（任意） */}
      <div style={{ marginBottom: 10 }}>
        <label
          htmlFor="qcf-comment"
          style={{ display: "block", fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 4 }}
        >
          一言コメント（任意・{MAX_COMMENT_LEN}字以内）
        </label>
        <textarea
          id="qcf-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LEN))}
          rows={3}
          placeholder="気になっている点、検討状況など"
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid var(--hc-border)",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 12,
            background: "var(--hc-card-bg)",
            color: "var(--hc-navy)",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
        <div style={{ fontSize: 10, color: "var(--hc-text-muted)", textAlign: "right" }}>
          {comment.length}/{MAX_COMMENT_LEN}
        </div>
      </div>

      {/* 同意チェック */}
      <label
        htmlFor="qcf-consent"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          fontSize: 11,
          color: "var(--hc-text-muted)",
          lineHeight: 1.5,
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        <input
          id="qcf-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: 2, accentColor: "var(--hc-primary)" }}
        />
        <span>
          <a
            href="https://multik.jp/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--hc-primary)" }}
          >
            プライバシーポリシー
          </a>
          に同意して相談内容を送信します。
        </span>
      </label>

      {error && (
        <p style={{ fontSize: 11, color: "var(--hc-error)", marginBottom: 8 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          background: submitting ? "var(--hc-text-subtle)" : "var(--hc-primary)",
          color: "var(--hc-white)",
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {submitting ? "送信中..." : "無料で相談する"}
      </button>
    </form>
  );
}
