"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getActionTimeline,
  type ActionTimelineResponse,
  type TimelinePhase,
  type TimelineTask,
  type TimelineTaskStatus,
  type TimelineTaskCategory,
} from "@/lib/api";

/**
 * Sprint 3: 申請カレンダー（縦軸タイムライン）
 * - JSON駆動（フェーズ・タスクのハードコード禁止）
 * - 完全決定論（AI使用なし）
 * - analytics 計測フック点を window.dataLayer 経由で発火
 */

interface Props {
  /** 補助金ID候補（select の選択肢）。tasks_by_subsidy のキーに対応。 */
  subsidyOptions: { id: string; label: string }[];
  /** 初期 subsidy_id（任意） */
  defaultSubsidyId?: string;
}

const STATUS_STYLE: Record<TimelineTaskStatus, { bg: string; border: string; color: string; label: string }> = {
  upcoming: { bg: "var(--hc-white)", border: "var(--hc-border)", color: "var(--hc-text-muted)", label: "未着手" },
  in_progress: { bg: "var(--hc-primary-soft)", border: "var(--hc-primary-border)", color: "var(--hc-primary)", label: "着手期間内" },
  at_risk: { bg: "var(--hc-accent-subtle)", border: "var(--hc-accent-border)", color: "var(--hc-accent)", label: "着手遅延" },
  missed: { bg: "var(--hc-error-subtle)", border: "var(--hc-error)", color: "var(--hc-error)", label: "期限超過" },
};

const CATEGORY_LABEL: Record<TimelineTaskCategory, string> = {
  mandatory: "必須",
  bonus: "加点",
  recommended: "推奨",
};

function trackEvent(name: string, payload: Record<string, unknown>) {
  // Analytics hook (実装は計測層に委譲)。SSR安全のため window 確認。
  if (typeof window === "undefined") return;
  type DLWindow = Window & { dataLayer?: Array<Record<string, unknown>> };
  const w = window as DLWindow;
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  w.dataLayer.push({ event: name, ...payload });
}

function fmt(d: string): string {
  // YYYY-MM-DD → M/D
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  return `${Number(m[2])}/${Number(m[3])}`;
}

function isoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function defaultDeadline(): string {
  // 4ヶ月後をデフォルトとして提示
  const d = new Date();
  d.setMonth(d.getMonth() + 4);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function TaskRow({ task }: { task: TimelineTask }) {
  const s = STATUS_STYLE[task.status];
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 8,
      }}
      data-testid={`timeline-task-${task.id}`}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--hc-white)",
            background:
              task.category === "mandatory"
                ? "var(--hc-error)"
                : task.category === "bonus"
                ? "var(--hc-primary)"
                : "var(--hc-text-muted)",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {CATEGORY_LABEL[task.category]}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--hc-navy)" }}>{task.name}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: s.color,
            border: `1px solid ${s.border}`,
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {s.label}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 4 }}>
        {fmt(task.start_date)} 〜 {fmt(task.end_date)}（推奨 {task.recommended_days} 日）
      </div>
      {task.note && (
        <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "4px 0 0", lineHeight: 1.5 }}>
          {task.note}
        </p>
      )}
      {task.required_docs.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 4 }}>
          必要書類: {task.required_docs.join(" / ")}
        </div>
      )}
    </div>
  );
}

function PhaseBlock({ phase }: { phase: TimelinePhase }) {
  return (
    <section
      style={{
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
      data-testid={`timeline-phase-${phase.id}`}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--hc-navy)" }}>
          {phase.label}
        </h3>
        <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>
          {fmt(phase.start_date)} 〜 {fmt(phase.end_date)}
        </span>
      </header>
      <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>
        {phase.description}
      </p>
      {phase.tasks.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>このフェーズに該当タスクはありません。</div>
      ) : (
        phase.tasks.map((t) => <TaskRow key={t.id + t.source} task={t} />)
      )}
    </section>
  );
}

export default function ActionTimeline({ subsidyOptions, defaultSubsidyId }: Props) {
  const [subsidyId, setSubsidyId] = useState<string>(defaultSubsidyId || subsidyOptions[0]?.id || "");
  const [deadline, setDeadline] = useState<string>(defaultDeadline());
  const [data, setData] = useState<ActionTimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => isoToday(), []);

  useEffect(() => {
    if (!subsidyId || !deadline) return;
    if (deadline <= today) {
      setError("申請締切は未来日を指定してください");
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    trackEvent("timeline_view", { subsidy_id: subsidyId, deadline_date: deadline });
    getActionTimeline({ subsidy_id: subsidyId, deadline_date: deadline })
      .then((res) => {
        setData(res);
        if (res.at_risk_count > 0 || res.missed_count > 0) {
          trackEvent("timeline_risk_detected", {
            subsidy_id: subsidyId,
            at_risk_count: res.at_risk_count,
            missed_count: res.missed_count,
          });
        }
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "タイムライン取得に失敗しました";
        setError(msg);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [subsidyId, deadline, today]);

  return (
    <div>
      {/* 入力 */}
      <div
        style={{
          background: "var(--hc-card-bg)",
          border: "1px solid var(--hc-border)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", fontSize: 12, fontWeight: 600, color: "var(--hc-navy)" }}>
          補助金
          <select
            value={subsidyId}
            onChange={(e) => setSubsidyId(e.target.value)}
            style={{ marginTop: 4, padding: "6px 8px", border: "1px solid var(--hc-border)", borderRadius: 6, fontSize: 13 }}
          >
            {subsidyOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", fontSize: 12, fontWeight: 600, color: "var(--hc-navy)" }}>
          申請締切
          <input
            type="date"
            value={deadline}
            min={today}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ marginTop: 4, padding: "6px 8px", border: "1px solid var(--hc-border)", borderRadius: 6, fontSize: 13 }}
          />
        </label>
      </div>

      {/* サマリー */}
      {data && (
        <div
          style={{
            background:
              data.at_risk_count + data.missed_count > 0
                ? "var(--hc-error-subtle)"
                : "var(--hc-primary-soft)",
            border: `1px solid ${
              data.at_risk_count + data.missed_count > 0 ? "var(--hc-error)" : "var(--hc-primary-border)"
            }`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
            color: "var(--hc-navy)",
          }}
        >
          残り <strong>{data.total_days_remaining}</strong> 日（締切 {fmt(data.deadline_date)}）。
          {data.missed_count > 0 && <> 期限超過 <strong>{data.missed_count}</strong> 件。</>}
          {data.at_risk_count > 0 && <> 着手遅延 <strong>{data.at_risk_count}</strong> 件。</>}
          {data.at_risk_count + data.missed_count === 0 && " 全タスク順調です。"}
        </div>
      )}

      {/* 状態 */}
      {loading && <div style={{ fontSize: 13, color: "var(--hc-text-muted)" }}>読み込み中…</div>}
      {error && (
        <div style={{ background: "var(--hc-error-subtle)", border: "1px solid var(--hc-error)", color: "var(--hc-error)", padding: 12, borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* 縦軸タイムライン */}
      {data && data.phases.map((p) => <PhaseBlock key={p.id} phase={p} />)}

      {/* 出典 */}
      {data && (
        <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 8 }}>
          出典: action_timeline.json / bonus_items.json（更新 {data.last_verified}）
        </p>
      )}
    </div>
  );
}
