"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { matchSubsidies, MatchResponse } from "@/lib/api";
import { INDUSTRIES, EMPLOYEE_RANGES, PREFECTURES, PURPOSES } from "@/lib/constants";

const STEP_LABELS = ["基本情報", "導入目的", "AI診断"];

function ProgressBar({ step }: { step: number }) {
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
  return (
    <div className="max-w-xl mx-auto mb-8">
      <div className="flex justify-between mb-2">
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={`text-xs font-medium transition ${
              step > i + 1 ? "text-primary" : step === i + 1 ? "text-primary" : "text-text2"
            }`}
          >
            {step > i + 1 ? "✓ " : ""}
            {label}
          </div>
        ))}
      </div>
      <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out animate-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-right text-xs text-text2 mt-1">{step}/3</div>
    </div>
  );
}

const SCORE_STYLE: Record<string, { bg: string; text: string; bar: string; percent: number }> = {
  高: { bg: "bg-success/10 text-success border-success/20", text: "高", bar: "bg-success", percent: 90 },
  中: { bg: "bg-warning/10 text-warning border-warning/20", text: "中", bar: "bg-warning", percent: 60 },
  低: { bg: "bg-text2/10 text-text2 border-text2/20", text: "低", bar: "bg-text2", percent: 30 },
};

export default function MatchPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [employees, setEmployees] = useState<number | null>(null);
  const [prefecture, setPrefecture] = useState("");
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDiagnose() {
    if (!industry || employees === null || !prefecture || !purpose) return;
    setStep(3);
    setLoading(true);
    setError("");
    try {
      const res = await matchSubsidies({ industry, employees, prefecture, purpose });
      setResult(res);
    } catch {
      setError("診断中にエラーが発生しました。しばらく経ってから再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  function resetWizard() {
    setStep(1);
    setResult(null);
    setError("");
    setIndustry("");
    setEmployees(null);
    setPrefecture("");
    setPurpose("");
  }

  return (
    <section className="py-8 px-4 min-h-[70vh]">
      <div className="max-w-xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-medium text-text mb-2">
            AI<span className="text-primary">補助金</span>診断
          </h1>
          <p className="text-sm text-text2">
            業種・規模・所在地を入力するだけで、最適な補助金をAIが提案します
          </p>
        </div>

        <ProgressBar step={step} />

        <div className="pb-16">
          {/* Step 1: 基本情報 */}
          {step === 1 && (
            <div className="card border border-border animate-fade-slide-in">
              <h2 className="text-lg font-medium mb-6">基本情報を入力してください</h2>
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2 text-text">業種</label>
                <select
                  className="w-full border-[1.5px] border-border rounded-[10px] px-4 py-3 bg-bg-card text-[16px] focus:outline-none focus:border-primary transition"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2 text-text">従業員数</label>
                <div className="grid grid-cols-2 gap-3">
                  {EMPLOYEE_RANGES.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center gap-2 border-[1.5px] rounded-[10px] px-4 py-3 cursor-pointer transition ${
                        employees === r.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-text2"
                      }`}
                    >
                      <input
                        type="radio"
                        name="employees"
                        value={r.value}
                        checked={employees === r.value}
                        onChange={() => setEmployees(r.value)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-text">都道府県</label>
                <select
                  className="w-full border-[1.5px] border-border rounded-[10px] px-4 py-3 bg-bg-card text-[16px] focus:outline-none focus:border-primary transition"
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!industry || employees === null || !prefecture}
                onClick={() => setStep(2)}
              >
                次へ →
              </button>
            </div>
          )}

          {/* Step 2: 導入目的 */}
          {step === 2 && (
            <div className="card border border-border animate-fade-slide-in">
              <h2 className="text-lg font-medium mb-6">導入目的を選択してください</h2>
              <div className="flex flex-col gap-3 mb-6">
                {PURPOSES.map((p) => (
                  <label
                    key={p}
                    className={`flex items-center gap-3 border-[1.5px] rounded-[10px] px-4 py-4 cursor-pointer transition ${
                      purpose === p
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-text2"
                    }`}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={p}
                      checked={purpose === p}
                      onChange={() => setPurpose(p)}
                      className="accent-primary"
                    />
                    <span className="font-medium">{p}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="btn-secondary flex-1 py-3"
                  onClick={() => setStep(1)}
                >
                  ← 戻る
                </button>
                <button
                  className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!purpose}
                  onClick={handleDiagnose}
                >
                  AI診断を開始
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div className="animate-fade-slide-in" aria-live="polite">
              <h2 className="text-xl font-medium mb-6 text-center">診断結果</h2>

              {/* Loading */}
              {loading && (
                <div className="card flex flex-col items-center py-16 gap-6" role="status">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-text font-medium mb-1">AIが最適な補助金を分析中...</p>
                    <p className="text-sm text-text2 animate-pulse-accent">
                      多数の補助金データから最適プランを検索しています
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="card border border-error/20 bg-error/5 text-center py-8">
                  <svg className="w-10 h-10 text-error/60 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-error font-medium">{error}</p>
                  <button
                    onClick={() => { setStep(2); setError(""); }}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    もう一度試す
                  </button>
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <div className="flex flex-col gap-5">
                  {result.matches.slice(0, 3).map((m, i) => {
                    const score = SCORE_STYLE[m.match_score] ?? SCORE_STYLE["低"];
                    return (
                      <div key={i} className="card border border-border hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-3 gap-3">
                          <div className="min-w-0">
                            <span className="text-xs text-primary font-medium">おすすめ {i + 1}</span>
                            <h3 className="font-medium text-lg leading-tight">{m.subsidy.name}</h3>
                          </div>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full border shrink-0 ${score.bg}`}
                          >
                            適合度: {score.text}
                          </span>
                        </div>

                        {/* Score bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-text2 mb-1">
                            <span>マッチ度</span>
                            <span>{score.percent}%</span>
                          </div>
                          <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full animate-score-fill ${score.bar}`}
                              style={{ width: `${score.percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-bg-card rounded-[10px] p-3 text-center border border-border">
                            <div className="text-xs text-text2">補助率</div>
                            <div className="text-lg font-medium text-primary">
                              {Math.round(m.subsidy.rate_max * 100)}%
                            </div>
                          </div>
                          <div className="bg-bg-card rounded-[10px] p-3 text-center border border-border">
                            <div className="text-xs text-text2">上限額</div>
                            <div className="text-lg font-medium">
                              {m.subsidy.max_amount.toLocaleString("ja-JP")}円
                            </div>
                          </div>
                        </div>

                        {m.estimated_cost > 0 && (
                          <div className="bg-primary/5 rounded-[10px] p-3 mb-3 text-sm">
                            <span className="font-medium">概算:</span>{" "}
                            {m.estimated_cost.toLocaleString("ja-JP")}円 →{" "}
                            <span className="text-primary font-medium">
                              補助後 {m.estimated_after_subsidy.toLocaleString("ja-JP")}円
                            </span>
                          </div>
                        )}

                        {m.application_advice && (
                          <p className="text-sm text-text2 mb-4">{m.application_advice}</p>
                        )}

                        <Link
                          href={`/subsidies/${m.subsidy.id}`}
                          className="block btn-primary text-center py-3"
                        >
                          この補助金の詳細を見る
                        </Link>
                      </div>
                    );
                  })}

                  {result.overall_recommendation && (
                    <div className="card bg-secondary text-white text-center">
                      <p className="font-medium">{result.overall_recommendation}</p>
                    </div>
                  )}

                  <button
                    className="btn-secondary py-3"
                    onClick={resetWizard}
                  >
                    最初からやり直す
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
