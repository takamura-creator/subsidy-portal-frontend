"use client";

/**
 * Cookie 同意バナー（個人情報保護法・GDPR想定）
 *
 * - 必須Cookie（認証・ウィザード状態）は常時許可
 * - 解析Cookie（GA等）はユーザー同意後に有効化
 * - 同意状態は localStorage に保存（hc_cookie_consent_v1）
 *
 * 解析ツール導入時の連携:
 *   - getCookieConsent() === "accepted" のときのみ初期化
 *   - 例: window.gtag や PostHog の load を遅延実行
 */

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "hc_cookie_consent_v1";

export function getCookieConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setConsent(getCookieConsent());
  }, []);

  if (!hydrated || consent !== null) return null;

  function decide(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage 利用不可時はメモリ内のみで保持
    }
    setConsent(value);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie 同意"
      style={{
        position: "fixed",
        bottom: 36,
        left: 16,
        right: 16,
        maxWidth: 720,
        margin: "0 auto",
        background: "var(--hc-white)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        boxShadow: "var(--hc-shadow-md)",
        padding: 16,
        zIndex: 200,
        fontSize: 13,
        color: "var(--hc-text)",
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: "0 0 12px" }}>
        当サイトでは、サービス改善とご利用体験の向上のため Cookie を使用します。
        詳しくは
        <Link href="/privacy" style={{ color: "var(--hc-primary)", margin: "0 4px" }}>
          プライバシーポリシー
        </Link>
        をご確認ください。
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => decide("rejected")}
          style={{
            fontSize: 12,
            padding: "10px 16px",
            border: "1px solid var(--hc-border)",
            background: "var(--hc-white)",
            color: "var(--hc-text-muted)",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          必須のみ許可
        </button>
        <button
          type="button"
          onClick={() => decide("accepted")}
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "10px 18px",
            border: "1px solid var(--hc-primary)",
            background: "var(--hc-primary)",
            color: "var(--hc-white)",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          すべて許可
        </button>
      </div>
    </div>
  );
}
