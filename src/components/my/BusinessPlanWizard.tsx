"use client";

import { useState, useEffect } from "react";
import {
  fetchBPQuestions,
  previewBusinessPlan,
  generateAndSaveBusinessPlan,
  type BPQuestion,
  type BPAnswers,
  type BPGenerateResult,
  type BPRationale,
} from "@/lib/api";

interface Props {
  appId: string;
  onSaved: () => void;
  onCancel: () => void;
}

export default function BusinessPlanWizard({ appId, onSaved, onCancel }: Props) {
  const [questions, setQuestions] = useState<BPQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [preview, setPreview] = useState<BPGenerateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    fetchBPQuestions()
      .then((res) => setQuestions(res.questions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const current = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const showPreview = currentStep >= questions.length;

  function handleSelect(value: string) {
    if (!current) return;
    if (current.type === "single") {
      setAnswers((prev) => ({ ...prev, [current.id]: value }));
    } else {
      setAnswers((prev) => {
        const existing = (prev[current.id] as string[]) || [];
        const maxSelect = current.max_select ?? 99;
        if (existing.includes(value)) {
          return { ...prev, [current.id]: existing.filter((v) => v !== value) };
        }
        if (existing.length >= maxSelect) return prev;
        return { ...prev, [current.id]: [...existing, value] };
      });
    }
  }

  function isSelected(value: string): boolean {
    if (!current) return false;
    const val = answers[current.id];
    if (Array.isArray(val)) return val.includes(value);
    return val === value;
  }

  function canProceed(): boolean {
    if (!current) return false;
    const val = answers[current.id];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return val.trim() !== "";
  }

  async function handleNext() {
    if (isLastQuestion) {
      setPreviewing(true);
      try {
        const bpAnswers = buildAnswers();
        const result = await previewBusinessPlan(bpAnswers);
        setPreview(result);
        setCurrentStep(questions.length);
      } catch {
        alert("プレビュー生成に失敗しました");
      } finally {
        setPreviewing(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (showPreview) {
      setCurrentStep(questions.length - 1);
      setPreview(null);
    } else if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  function buildAnswers(): BPAnswers {
    return {
      facility_type: (answers["facility_type"] as string) || "",
      challenges: (answers["challenges"] as string[]) || [],
      existing_equipment: (answers["existing_equipment"] as string) || "",
      scale: (answers["scale"] as string) || "",
      expected_effects: (answers["expected_effects"] as string[]) || [],
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
      await generateAndSaveBusinessPlan(appId, buildAnswers());
      onSaved();
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ display: "inline-block", width: 24, height: 24, border: "3px solid var(--hc-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginTop: 8 }}>質問を読み込み中...</p>
      </div>
    );
  }

  if (showPreview && preview) {
    const r = preview.rationales || {};
    return (
      <div style={{ borderRadius: 12, border: "1px solid var(--hc-border)", background: "white", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "var(--hc-primary)", color: "white" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>事業計画プレビュー</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.9 }}>内容を確認して「保存」を押してください</p>
        </div>
        <div style={{ padding: 20 }}>
          <PlanRow label="事業内容" value={preview.business_content} rationale={r["business_content"]} />
          <PlanRow label="導入目的" value={preview.purpose} rationale={r["purpose"]} />
          <PlanRow
            label="導入台数"
            value={`${preview.num_units}台`}
            sub={preview.unit_breakdown.map((b) => `${b.location}: ${b.count}台`).join("、")}
            rationale={r["num_units"]}
          />
          <PlanRow label="期待効果" value={preview.expected_effects} rationale={r["expected_effects"]} />
          {preview.unit_rationale && (
            <PlanRow label="台数根拠" value={preview.unit_rationale} rationale={r["unit_rationale"]} />
          )}
          {preview.loss_calculation && (
            <PlanRow
              label="損失計算"
              value={typeof preview.loss_calculation === "string"
                ? preview.loss_calculation
                : `年間損失 ${preview.loss_calculation.annual_loss.toLocaleString()}円 / 利益率 ${(preview.loss_calculation.profit_rate * 100).toFixed(0)}% / 必要追加売上 ${preview.loss_calculation.required_additional_revenue.toLocaleString()}円`}
              rationale={r["loss_calculation"]}
            />
          )}
          {preview.schedule && (
            <PlanRow
              label="実施スケジュール"
              value={Array.isArray(preview.schedule)
                ? preview.schedule.map((s: { phase: string; duration: string; milestone: string }) => `【${s.phase}】${s.duration} — ${s.milestone}`).join("\n")
                : String(preview.schedule)}
              rationale={r["schedule"]}
            />
          )}
          {preview.before_after && (
            <PlanRow label="導入前後比較" value={preview.before_after} rationale={r["before_after"]} />
          )}
        </div>
        <div style={{ display: "flex", gap: 8, padding: "0 20px 20px", justifyContent: "space-between" }}>
          <button onClick={handleBack} style={btnSecondary}>質問に戻る</button>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>
            {saving ? "保存中..." : "この内容で保存する"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 12, border: "1px solid var(--hc-border)", background: "white", overflow: "hidden" }}>
      {/* ヘッダー */}
      <div style={{ padding: "16px 20px", background: "var(--hc-primary-faint)", borderBottom: "1px solid var(--hc-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}>
            事業計画を作成
          </h3>
          <span style={{ fontSize: 12, color: "var(--hc-text-muted)", background: "white", padding: "2px 10px", borderRadius: 20, border: "1px solid var(--hc-border)" }}>
            {currentStep + 1} / {questions.length}
          </span>
        </div>
        {/* プログレスバー */}
        <div style={{ marginTop: 10, height: 4, background: "var(--hc-text-divider)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((currentStep + 1) / questions.length) * 100}%`, background: "var(--hc-primary)", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* 質問 */}
      {current && (
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 4 }}>
            {current.question}
          </p>
          {current.type === "multi" && (
            <p style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 12 }}>
              {current.max_select ? `最大${current.max_select}つまで選択できます` : "複数選択可"}
            </p>
          )}
          {current.type === "single" && (
            <p style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 12 }}>1つ選んでください</p>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            {current.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: isSelected(opt.value)
                    ? "2px solid var(--hc-primary)"
                    : "1px solid var(--hc-border)",
                  background: isSelected(opt.value) ? "var(--hc-primary-faint)" : "white",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: isSelected(opt.value) ? 600 : 400, color: "var(--hc-navy)" }}>
                  {isSelected(opt.value) ? "✓ " : ""}{opt.label}
                </span>
                {opt.description && (
                  <span style={{ display: "block", fontSize: 12, color: "var(--hc-text-muted)", marginTop: 2 }}>
                    {opt.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px 20px", justifyContent: "space-between" }}>
        {currentStep > 0 ? (
          <button onClick={handleBack} style={btnSecondary}>戻る</button>
        ) : (
          <button onClick={onCancel} style={btnSecondary}>キャンセル</button>
        )}
        <button onClick={handleNext} disabled={!canProceed() || previewing} style={btnPrimary}>
          {previewing ? "生成中..." : isLastQuestion ? "プレビューを見る" : "次へ"}
        </button>
      </div>
    </div>
  );
}

function PlanRow({ label, value, sub, rationale }: { label: string; value: string; sub?: string; rationale?: BPRationale }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: rationale ? "1fr 280px" : "1fr", gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--hc-text-divider)" }}>
      <div>
        <dt style={{ fontSize: 12, fontWeight: 600, color: "var(--hc-primary)", marginBottom: 4 }}>{label}</dt>
        <dd style={{ fontSize: 13, color: "var(--hc-navy)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{value}</dd>
        {sub && <dd style={{ fontSize: 11, color: "var(--hc-text-muted)", margin: "4px 0 0" }}>内訳: {sub}</dd>}
      </div>
      {rationale && (
        <div style={{ background: "var(--hc-primary-faint)", borderRadius: 8, padding: "10px 12px", borderLeft: "3px solid var(--hc-primary)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--hc-primary)", margin: "0 0 4px" }}>{rationale.title}</p>
          <p style={{ fontSize: 11, color: "var(--hc-navy)", lineHeight: 1.6, margin: 0 }}>{rationale.rationale}</p>
          <p style={{ fontSize: 10, color: "var(--hc-text-muted)", margin: "6px 0 0", fontStyle: "italic" }}>出典: {rationale.source}</p>
        </div>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  background: "var(--hc-primary)",
  color: "white",
  border: "none",
  transition: "all 0.2s",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
  background: "white",
  color: "var(--hc-text-muted)",
  border: "1px solid var(--hc-border)",
  transition: "all 0.2s",
};
