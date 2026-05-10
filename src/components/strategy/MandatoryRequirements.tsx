"use client";

import { useEffect, useState } from "react";
import {
  fetchMandatoryRequirements,
  type MandatoryRequirementsResponse,
} from "@/lib/api";

interface Props {
  subsidyId: string;
  title?: string;
}

const SEVERITY_FG: Record<string, string> = {
  critical: "var(--hc-error)",
  high: "var(--hc-accent)",
  medium: "var(--hc-text)",
  low: "var(--hc-success)",
};

export default function MandatoryRequirements({ subsidyId, title }: Props) {
  const [data, setData] = useState<MandatoryRequirementsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMandatoryRequirements(subsidyId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "取得に失敗しました");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subsidyId]);

  return (
    <div
      style={{
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        padding: 14,
      }}
    >
      <h3
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--hc-navy)",
          margin: "0 0 10px",
        }}
      >
        ✅ {title ?? "必須要件チェックリスト"}
      </h3>

      {loading && (
        <div style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>
          読み込み中...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 8,
            fontSize: 11,
            color: "var(--hc-error)",
            background: "var(--hc-error-subtle)",
            border: "1px solid var(--hc-error)",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>
          この補助金の必須要件は登録されていません。
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.items.map((it) => (
              <div
                key={it.id}
                style={{
                  padding: 10,
                  fontSize: 12,
                  border: "1px solid var(--hc-border)",
                  borderRadius: 6,
                  background: "var(--hc-card-bg)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "var(--hc-navy)" }}>
                    {it.id}：{it.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: SEVERITY_FG[it.severity] ?? "var(--hc-text)",
                    }}
                  >
                    {it.severity}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--hc-text-muted)",
                    margin: "4px 0",
                  }}
                >
                  取得目安：約{it.acquisition_days}日　・　{it.note}
                </div>
                {it.url && (
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    style={{
                      fontSize: 11,
                      color: "var(--hc-primary)",
                      textDecoration: "underline",
                    }}
                  >
                    公式ページを開く →
                  </a>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: "var(--hc-text-subtle)", marginTop: 6 }}>
            last_verified: {data.last_verified}
          </p>
        </>
      )}
    </div>
  );
}
