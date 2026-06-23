"use client";

import { useEffect, useState } from "react";
import {
  getApplicationStatus,
  patchApplicationStatus,
  type ApplicationStatusResponse,
} from "@/lib/api";

interface Props {
  appId: string;
}

const PHASE_ORDER = [
  "未着手",
  "申請受付",
  "審査中",
  "採択",
  "交付申請",
  "交付決定",
  "事業実施中",
  "実績報告",
  "補助金受領",
];

/**
 * Sprint 7 Phase D: ステータス遷移パネル
 * 現在フェーズをビジュアル表示し、クリックで次フェーズへ遷移
 */
export default function StatusTransitionPanel({ appId }: Props) {
  const [status, setStatus] = useState<ApplicationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    getApplicationStatus(appId)
      .then(setStatus)
      .catch(() => setError("ステータスを取得できませんでした"))
      .finally(() => setLoading(false));
  }, [appId]);

  const handleTransition = async (toPhase: string) => {
    if (!status) return;
    setTransitioning(true);
    setShowMenu(false);
    try {
      const result = await patchApplicationStatus(
        appId,
        status.current_phase,
        toPhase,
      );
      if (result.success && result.new_status) {
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                current_phase: result.new_status!,
                available_transitions: [],
              }
            : prev,
        );
        // 遷移後に最新ステータス再取得
        const updated = await getApplicationStatus(appId);
        setStatus(updated);
      } else {
        setError(result.message ?? "遷移に失敗しました");
      }
    } catch {
      setError("ステータス更新に失敗しました");
    } finally {
      setTransitioning(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    background: "var(--hc-card-bg)",
    border: "1px solid var(--hc-border)",
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 20,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--hc-navy)",
    marginBottom: 12,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>🔄 申請フェーズ</div>
        <div style={{ color: "var(--hc-text-muted)", fontSize: 12 }}>
          読み込み中...
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>🔄 申請フェーズ</div>
        <div style={{ color: "var(--hc-error)", fontSize: 12 }}>
          {error ?? "ステータスを取得できませんでした"}
        </div>
      </div>
    );
  }

  const currentIndex = PHASE_ORDER.indexOf(status.current_phase);

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>🔄 申請フェーズ</div>

      {/* フェーズ進行バー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginBottom: 12,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {PHASE_ORDER.map((phase, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={phase}
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: isDone
                    ? "var(--hc-success)"
                    : isCurrent
                      ? "var(--hc-primary)"
                      : "var(--hc-border)",
                  border: isCurrent
                    ? "2px solid var(--hc-primary)"
                    : "none",
                  flexShrink: 0,
                }}
              />
              {i < PHASE_ORDER.length - 1 && (
                <div
                  style={{
                    width: 16,
                    height: 2,
                    background: isDone
                      ? "var(--hc-success)"
                      : "var(--hc-border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 現在フェーズ表示 + 遷移ボタン */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() =>
            status.available_transitions.length > 0 &&
            setShowMenu((v) => !v)
          }
          disabled={
            transitioning || status.available_transitions.length === 0
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            borderRadius: 6,
            background: "var(--hc-primary-muted)",
            border: "1px solid var(--hc-primary)",
            color: "var(--hc-primary)",
            fontSize: 13,
            fontWeight: 600,
            cursor:
              status.available_transitions.length > 0
                ? "pointer"
                : "default",
            fontFamily: "inherit",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <span>{transitioning ? "更新中..." : status.current_phase}</span>
          {status.available_transitions.length > 0 && (
            <span style={{ fontSize: 10 }}>{showMenu ? "▲" : "▼"}</span>
          )}
        </button>

        {/* 遷移先メニュー */}
        {showMenu && status.available_transitions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "var(--hc-card-bg)",
              border: "1px solid var(--hc-border)",
              borderRadius: 6,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "6px 10px",
                fontSize: 10,
                color: "var(--hc-text-muted)",
                borderBottom: "1px solid var(--hc-border)",
              }}
            >
              次のフェーズへ進む
            </div>
            {status.available_transitions.map((phase) => (
              <button
                key={phase}
                onClick={() => handleTransition(phase)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--hc-border)",
                  textAlign: "left",
                  fontSize: 13,
                  color: "var(--hc-text)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                → {phase}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
