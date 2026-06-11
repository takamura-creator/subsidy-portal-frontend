"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { submitContact, ApiError, fetchProfileDetail } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { PREFECTURES } from "@/lib/constants";

const WIZARD_KEY = "hc_wizard_state_v2";

function getWizardDefaults(): {
  companyName: string;
  representativeName: string;
  email: string;
  estimateId: string;
} {
  if (typeof window === "undefined") return { companyName: "", representativeName: "", email: "", estimateId: "" };
  try {
    const raw = localStorage.getItem(WIZARD_KEY);
    if (!raw) return { companyName: "", representativeName: "", email: "", estimateId: "" };
    const snap = JSON.parse(raw) as {
      state?: {
        company?: { companyName?: string; representativeName?: string };
        estimate?: { id?: string };
        reminderEmail?: string;
      };
    };
    return {
      companyName: String(snap?.state?.company?.companyName ?? ""),
      representativeName: String(snap?.state?.company?.representativeName ?? ""),
      email: snap?.state?.reminderEmail ?? "",
      estimateId: snap?.state?.estimate?.id ?? "",
    };
  } catch {
    return { companyName: "", representativeName: "", email: "", estimateId: "" };
  }
}

const INQUIRY_TYPES = [
  "施工相談",
  "詳細見積もり依頼",
  "製品に関するご質問",
  "その他",
];

export default function ContactPage() {
  const [companyName, setCompanyName]     = useState("");
  const [contactName, setContactName]     = useState("");
  const [email, setEmail]                 = useState("");
  const [phone, setPhone]                 = useState("");
  const [inquiryType, setInquiryType]     = useState(INQUIRY_TYPES[0]);
  const [estimateId, setEstimateId]       = useState("");
  const [message, setMessage]             = useState("");
  const [consent, setConsent]             = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [inquiryId, setInquiryId]         = useState("");
  const [error, setError]                 = useState("");
  const contactStartFired                 = useRef(false);

  // contact_start イベント（フォーム表示時・1回のみ）
  useEffect(() => {
    if (!contactStartFired.current) {
      contactStartFired.current = true;
      track("contact_start");
    }
  }, []);

  // JWT + プロフィール + ウィザードデータから自動補完
  useEffect(() => {
    // 1) JWT から即座に補完（同期）
    const user = getUser();
    if (user?.email)        setEmail(user.email);
    if (user?.company_name) setCompanyName(user.company_name);

    // 2) ウィザードデータで上書き（より詳細）
    const d = getWizardDefaults();
    if (d.companyName)        setCompanyName(d.companyName);
    if (d.representativeName) setContactName(d.representativeName);
    if (d.email)              setEmail(d.email);
    if (d.estimateId)         setEstimateId(d.estimateId);

    // 3) DB プロフィールで最終確定（非同期）
    fetchProfileDetail()
      .then((p) => {
        if (p.company_name && !d.companyName) setCompanyName(p.company_name);
        const repName = p.representative_name || p.representative || "";
        if (repName && !d.representativeName) setContactName(repName);
        // メールも DB が最も信頼できる（JWT 失効後・ウィザード未保存時の救済）
        if (p.email && !d.email) setEmail(p.email);
        if (p.phone) setPhone(p.phone);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await submitContact({
        company_name: companyName,
        name: contactName,
        email,
        phone: phone || undefined,
        inquiry_type: inquiryType,
        estimate_id: estimateId || undefined,
        message,
        consent,
      });
      setInquiryId(res.inquiry_id);
      setSubmitted(true);
      track("contact_submit", { inquiry_type: inquiryType });
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
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div
          className="w-full max-w-[520px] text-center"
          style={{
            background: "var(--hc-card-bg)",
            border: "1px solid var(--hc-border)",
            borderRadius: 12,
            padding: "40px 32px",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--hc-navy)",
              marginBottom: 8,
            }}
          >
            お問い合わせを受け付けました
          </h1>
          <p style={{ fontSize: 13, color: "var(--hc-text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
            担当者より <strong>2営業日以内</strong> にメールにてご返信いたします。<br />
            お問い合わせID: <code style={{ fontSize: 12, background: "var(--hc-bg)", padding: "2px 6px", borderRadius: 4 }}>{inquiryId}</code>
          </p>
          <p style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
            ※ 補助金申請の代行・審査対応はサービス対象外です。<br />
            施工・機器導入に関するご相談のみ承ります。
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "var(--hc-primary)",
              color: "var(--hc-white)",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 48px" }}>
      {/* ページヘッダー */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--hc-navy)",
            marginBottom: 8,
          }}
        >
          施工・詳細見積もりのご相談
        </h1>
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", lineHeight: 1.7 }}>
          防犯カメラの施工依頼・詳細見積もりについてのご相談を承ります。<br />
          <strong style={{ color: "var(--hc-navy)" }}>補助金申請の代行・審査対応はサービス対象外</strong>です。
          フォームにご記入いただくと、担当者より2営業日以内にご返信いたします。
        </p>
      </div>

      {/* 注意バナー */}
      <div
        style={{
          marginBottom: 24,
          padding: "12px 16px",
          background: "var(--hc-accent-light)",
          border: "1px solid var(--hc-accent-border)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--hc-navy)",
          lineHeight: 1.7,
        }}
      >
        <strong>対応可能なご相談：</strong> 施工エリアのご確認（東京・神奈川・静岡・埼玉・千葉・山梨）、
        現地調査・詳細見積もり、製品選定のご相談、既存設備との連携<br />
        <strong>対応外：</strong> 補助金申請書類の作成代行、審査機関への手続き対応
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "var(--hc-card-bg)",
            border: "1px solid var(--hc-border)",
            borderRadius: 12,
            padding: "28px 28px",
          }}
        >
          {/* エラー */}
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                background: "var(--hc-error-subtle)",
                border: "1px solid color-mix(in srgb, var(--hc-error) 20%, transparent)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--hc-error)",
              }}
            >
              {error}
            </div>
          )}

          {/* 2カラムグリッド */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <Field label="会社名" required>
              <input
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="マルチック株式会社"
                required
                maxLength={100}
              />
            </Field>

            <Field label="ご担当者名" required>
              <input
                className="form-input"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="山田 太郎"
                required
                maxLength={50}
              />
            </Field>

            <Field label="メールアドレス" required>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.jp"
                required
              />
            </Field>

            <Field label="電話番号（任意）">
              <input
                className="form-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03-0000-0000"
                maxLength={20}
              />
            </Field>
          </div>

          <Field label="お問い合わせ種別" required>
            <select
              className="form-select"
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              required
            >
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="概算見積もりID（ウィザード利用済みの場合）">
            <input
              className="form-input"
              value={estimateId}
              onChange={(e) => setEstimateId(e.target.value)}
              placeholder="ウィザード完了後に自動入力されます"
              maxLength={100}
            />
            <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 4 }}>
              HOJYO CAME のウィザードで見積もりを作成済みの場合、IDを記載いただくとよりスムーズにご対応できます。
            </p>
          </Field>

          <Field label="お問い合わせ内容" required>
            <textarea
              className="form-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              minLength={10}
              maxLength={2000}
              placeholder={
                inquiryType === "施工相談"
                  ? "例: 神奈川県横浜市の倉庫（約300㎡）に防犯カメラ4台を設置したい。現地調査の日程調整をお願いしたい。"
                  : inquiryType === "詳細見積もり依頼"
                  ? "例: PTZカメラ2台、固定カメラ6台、NVR1台の構成で詳細見積もりをお願いしたい。補助金ありの場合となしの場合の両方を知りたい。"
                  : "お問い合わせ内容をご記入ください"
              }
              style={{ resize: "vertical" }}
            />
            <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 4, textAlign: "right" }}>
              {message.length} / 2000字
            </p>
          </Field>

          {/* 同意チェック */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                style={{ marginTop: 2, flexShrink: 0, width: 16, height: 16 }}
              />
              <span style={{ color: "var(--hc-text-muted)", lineHeight: 1.6 }}>
                <a
                  href="https://multik.jp/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--hc-primary)" }}
                >
                  プライバシーポリシー
                </a>
                に同意の上、送信します。入力いただいた個人情報は、ご相談への対応にのみ使用します。
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !consent}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: submitting || !consent ? "var(--hc-border)" : "var(--hc-primary)",
              color: submitting || !consent ? "var(--hc-text-muted)" : "var(--hc-white)",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: submitting || !consent ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {submitting ? "送信中..." : "送信する"}
          </button>

          <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>
            電話営業は行いません。お返事はメールにて行います（2営業日以内）。
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--hc-navy)",
          marginBottom: 4,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--hc-error)", marginLeft: 4, fontSize: 12 }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}
