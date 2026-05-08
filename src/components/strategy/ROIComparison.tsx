"use client";

/**
 * ROIComparison — Before/After 2列ROI比較ツール
 * - 数値計算は決定論API
 * - AIDraftBlock は「導入後の物語」のみ（数値表示なし）
 */

import { useState } from "react";
import {
  postRoiSimulate,
  type RoiSimulateRequest,
  type RoiSimulateResponse,
  type StrategyIndustry,
  type RoiSideInput,
} from "@/lib/api";
import AIDraftBlock from "./AIDraftBlock";

const INDUSTRIES: { value: StrategyIndustry; label: string }[] = [
  { value: "retail", label: "小売" },
  { value: "restaurant", label: "飲食" },
  { value: "hotel", label: "宿泊" },
  { value: "manufacturing", label: "製造" },
  { value: "construction", label: "建設" },
  { value: "transport", label: "運輸" },
  { value: "medical", label: "医療" },
  { value: "care", label: "介護" },
  { value: "education", label: "教育" },
  { value: "other_service", label: "その他サービス" },
];

const DEFAULT_SIDE: RoiSideInput = {
  monitoring_hours_per_week: 10,
  hourly_wage_yen: 1100,
  theft_loss_man: 0,
  dispute_resolution_hours: 0,
  staff_for_monitoring: 0,
};

function logEvent(name: string, payload?: Record<string, unknown>) {
  if (typeof window !== "undefined") console.debug("[analytics]", name, payload ?? {});
}

export default function ROIComparison() {
  const [industry, setIndustry] = useState<StrategyIndustry | "">("");
  const [before, setBefore] = useState<RoiSideInput>({ ...DEFAULT_SIDE });
  const [after, setAfter] = useState<RoiSideInput>({ ...DEFAULT_SIDE, monitoring_hours_per_week: 2, theft_loss_man: 0 });
  const [result, setResult] = useState<RoiSimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCalc = !!industry && !loading;

  // ⚠ 計算は明示onClickから（自動呼出禁止）
  async function handleCalc() {
    if (!canCalc || !industry) return;
    setLoading(true);
    setError(null);
    logEvent("roi_simulate_submit", { industry });
    try {
      const body: RoiSimulateRequest = { industry, before, after };
      const res = await postRoiSimulate(body);
      setResult(res);
      logEvent("roi_simulate_success", { industry, saving: res.saving_yen });
    } catch (e) {
      setError(e instanceof Error ? e.message : "計算に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={card}>
        <h2 style={h2}>ROIシミュレータ</h2>
        <div style={{ display: "flex", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={lbl}>業種 *</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as StrategyIndustry)}
              style={input}
              aria-label="業種"
            >
              <option value="">選択してください</option>
              {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 16,
          }}
        >
          <SidePanel title="Before（導入前）" tone="gray" data={before} onChange={setBefore} />
          <SidePanel title="After（導入後）" tone="blue" data={after} onChange={setAfter} />
        </div>

        <button
          type="button"
          onClick={handleCalc}
          disabled={!canCalc}
          style={{
            ...btnPrimary,
            opacity: canCalc ? 1 : 0.4,
            cursor: canCalc ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "計算中..." : "計算する"}
        </button>
        {error && <div role="alert" style={errBox}>{error}</div>}
      </div>

      {result && (
        <div style={{ ...card, marginTop: 16 }} aria-live="polite">
          <h2 style={h2}>📐 ROI 比較結果（決定論）</h2>

          {result.warnings.length > 0 && (
            <div style={warnBox}>
              {result.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
            </div>
          )}

          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th style={th}>項目</th>
                <th style={{ ...th, textAlign: "right" }}>Before</th>
                <th style={{ ...th, textAlign: "right" }}>After</th>
                <th style={{ ...th, textAlign: "right" }}>削減</th>
              </tr>
            </thead>
            <tbody>
              <CmpRow label="労務コスト" b={result.before_total.labor_cost_yen} a={result.after_total.labor_cost_yen} />
              <CmpRow label="盗難損失" b={result.before_total.theft_cost_yen} a={result.after_total.theft_cost_yen} />
              <CmpRow label="紛争対応" b={result.before_total.dispute_cost_yen} a={result.after_total.dispute_cost_yen} />
              <tr style={{ borderTop: "2px solid #111827", fontWeight: 700 }}>
                <td style={{ padding: 6 }}>合計</td>
                <td style={{ padding: 6, textAlign: "right" }}>¥{result.before_total.total_yen.toLocaleString()}</td>
                <td style={{ padding: 6, textAlign: "right" }}>¥{result.after_total.total_yen.toLocaleString()}</td>
                <td style={{ padding: 6, textAlign: "right", color: "#059669" }}>¥{result.saving_yen.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: 24, fontWeight: 800, marginTop: 12, color: "#059669" }}>
            年間 ¥{result.saving_yen.toLocaleString()} 削減
          </p>
          <p style={{ fontSize: 12, color: "#374151", margin: "4px 0" }}>
            改善率 {(result.saving_ratio * 100).toFixed(1)}% / 年間 {result.productivity_hours_year} 時間の捻出
          </p>
          <p style={{ fontSize: 10, color: "#9CA3AF" }}>
            計算根拠: 業種別テンプレ {result.template_version} / 検証 {result.last_verified}
          </p>

          {/* ⚠ AIDraftBlock：数値・採択率・%は絶対に表示しない（紫枠で視覚区別） */}
          <AIDraftBlock
            sectionType="roi_narrative"
            analyticsKey="roi_simulator"
            triggerLabel="✨ AIで導入後の物語を生成"
            structuredData={{
              industry: result.industry,
              saving_label: "年間コスト削減あり",
              productivity_label: "監視時間の削減あり",
              note_to_ai: "金額・%・採択率・数値は記載しないでください",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ====== Side Panel ======

function SidePanel({
  title, tone, data, onChange,
}: {
  title: string;
  tone: "gray" | "blue";
  data: RoiSideInput;
  onChange: (next: RoiSideInput) => void;
}) {
  const bg = tone === "gray" ? "#F9FAFB" : "#EFF6FF";
  const border = tone === "gray" ? "#D1D5DB" : "#93C5FD";
  function update<K extends keyof RoiSideInput>(key: K, val: RoiSideInput[K]) {
    onChange({ ...data, [key]: val });
  }
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>{title}</h3>
      <Mini label="監視・巡回時間（h/週）">
        <input type="number" min={0} max={168} value={data.monitoring_hours_per_week}
          onChange={(e) => update("monitoring_hours_per_week", Number(e.target.value))} style={input} />
      </Mini>
      <Mini label="時給（円）">
        <input type="number" min={800} max={10000} value={data.hourly_wage_yen}
          onChange={(e) => update("hourly_wage_yen", Number(e.target.value))} style={input} />
      </Mini>
      <Mini label="盗難損失（万円/年）">
        <input type="number" min={0} max={100000} value={data.theft_loss_man}
          onChange={(e) => update("theft_loss_man", Number(e.target.value))} style={input} />
      </Mini>
      <Mini label="クレーム対応（h/月）">
        <input type="number" min={0} max={1000} value={data.dispute_resolution_hours ?? 0}
          onChange={(e) => update("dispute_resolution_hours", Number(e.target.value))} style={input} />
      </Mini>
      <Mini label="監視専任人数">
        <input type="number" min={0} max={1000} value={data.staff_for_monitoring ?? 0}
          onChange={(e) => update("staff_for_monitoring", Number(e.target.value))} style={input} />
      </Mini>
    </div>
  );
}

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{ ...lbl, fontSize: 10 }}>{label}</label>
      {children}
    </div>
  );
}

function CmpRow({ label, b, a }: { label: string; b: number; a: number }) {
  return (
    <tr style={{ borderTop: "1px solid #E5E7EB" }}>
      <td style={{ padding: 6 }}>{label}</td>
      <td style={{ padding: 6, textAlign: "right" }}>¥{b.toLocaleString()}</td>
      <td style={{ padding: 6, textAlign: "right" }}>¥{a.toLocaleString()}</td>
      <td style={{ padding: 6, textAlign: "right", color: "#059669" }}>
        ¥{(b - a).toLocaleString()}
      </td>
    </tr>
  );
}

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: 16,
};
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, margin: "0 0 12px" };
const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 };
const input: React.CSSProperties = {
  width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #D1D5DB", borderRadius: 6, background: "#fff",
};
const th: React.CSSProperties = { padding: 6, fontSize: 11, textAlign: "left", fontWeight: 600 };
const btnPrimary: React.CSSProperties = {
  marginTop: 12, padding: "10px 16px", background: "#2563EB", color: "#fff",
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, width: "100%",
};
const errBox: React.CSSProperties = {
  marginTop: 8, padding: 8, fontSize: 12, color: "#B91C1C",
  background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 6,
};
const warnBox: React.CSSProperties = {
  padding: 8, marginBottom: 8, background: "#FEF3C7", border: "1px solid #F59E0B",
  borderRadius: 6, fontSize: 12, color: "#92400E",
};
