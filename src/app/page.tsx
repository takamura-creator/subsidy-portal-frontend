"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { INDUSTRIES, EMPLOYEE_RANGES, PREFECTURES, PURPOSES } from "@/lib/constants";
import { useAutosave } from "@/lib/useAutosave";

/* ============================================
   Types
   ============================================ */

type FormData = {
  industry: string;
  employees: number | null;
  prefecture: string;
  purposes: string[];
  step: number;
};

const INITIAL: FormData = {
  industry: "",
  employees: null,
  prefecture: "",
  purposes: [],
  step: 1,
};

/* ============================================
   Left Column — 入力ガイド
   ============================================ */

function LeftGuide({ step }: { step: number }) {
  const guides: Record<number, { title: string; items: string[] }> = {
    1: {
      title: "Step 1: 基本情報",
      items: [
        "業種によって使える補助金が異なります",
        "従業員数は正社員＋パート（週20h以上）で計算",
        "本社所在地の都道府県を選択してください",
      ],
    },
    2: {
      title: "Step 2: 導入目的",
      items: [
        "複数選択できます",
        "目的に応じて最適な補助金を提案します",
        "「その他」を選択した場合、詳細入力欄が表示されます",
      ],
    },
    3: {
      title: "Step 3: 診断結果",
      items: [
        "マッチ度の高い順に最大3件を表示",
        "各補助金の詳細ページで申請要件を確認できます",
        "「申請書を作成する」で申請手続きに進めます",
      ],
    },
  };

  const guide = guides[step] || guides[1];

  return (
    <div className="space-y-6">
      <div>
        <h3
          className="text-sm font-bold mb-3"
          style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
        >
          {guide.title}
        </h3>
        <ul className="space-y-2">
          {guide.items.map((item, i) => (
            <li
              key={i}
              className="text-xs flex gap-2"
              style={{ color: "var(--hc-text-muted)" }}
            >
              <span style={{ color: "var(--hc-primary)" }}>•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--hc-border)" }}>
        <h3
          className="text-xs font-bold mb-2"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          よくある質問
        </h3>
        <details className="text-xs mb-2" style={{ color: "var(--hc-text-muted)" }}>
          <summary className="cursor-pointer font-medium" style={{ color: "var(--hc-text)" }}>
            診断は本当に無料ですか？
          </summary>
          <p className="mt-1 pl-2">
            はい、完全無料です。登録不要で今すぐ診断できます。
          </p>
        </details>
        <details className="text-xs" style={{ color: "var(--hc-text-muted)" }}>
          <summary className="cursor-pointer font-medium" style={{ color: "var(--hc-text)" }}>
            個人情報は必要ですか？
          </summary>
          <p className="mt-1 pl-2">
            診断時は個人情報不要です。申請書作成時にのみ会社情報が必要になります。
          </p>
        </details>
      </div>
    </div>
  );
}

/* ============================================
   Right Column — ツールパネル
   ============================================ */

function RightTools() {
  return (
    <div className="space-y-4">
      <h3
        className="text-sm font-bold"
        style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
      >
        ツール
      </h3>

      <a href="/subsidies" className="btn-secondary block text-center text-xs py-2">
        補助金を検索する
      </a>
      <a href="/contractors" className="btn-secondary block text-center text-xs py-2">
        工事業者を探す
      </a>

      <div className="pt-4 border-t" style={{ borderColor: "var(--hc-border)" }}>
        <h3
          className="text-xs font-bold mb-3"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          最近のアクティビティ
        </h3>
        <div className="space-y-2">
          {[
            { text: "IT導入補助金の申請受付開始", time: "2日前" },
            { text: "ものづくり補助金の締切が延長", time: "5日前" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-2 items-start text-xs"
              style={{ color: "var(--hc-text-muted)" }}
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "var(--hc-accent)" }}
              />
              <div>
                <p style={{ color: "var(--hc-text)" }}>{item.text}</p>
                <p className="text-[10px]">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Center Column — AI診断フォーム
   ============================================ */

export default function HomePage() {
  const router = useRouter();
  const { data, setData, save, hasDraft, restore, discard, savedAt } =
    useAutosave<FormData>("hojyo_came_top_draft", INITIAL);

  const step = data.step;

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };
        return next;
      });
    },
    [setData],
  );

  const handleBlur = useCallback(() => {
    save(data);
  }, [save, data]);

  const goStep = useCallback(
    (s: number) => {
      const next = { ...data, step: s };
      setData(next);
      save(next);
    },
    [data, setData, save],
  );

  const togglePurpose = useCallback(
    (p: string) => {
      const current = data.purposes;
      const next = current.includes(p)
        ? current.filter((x) => x !== p)
        : [...current, p];
      updateField("purposes", next);
    },
    [data.purposes, updateField],
  );

  const handleDiagnose = useCallback(() => {
    if (!data.industry || data.employees === null || !data.prefecture || data.purposes.length === 0) return;
    // Save form data to sessionStorage for match page
    sessionStorage.setItem("hojyo_came_match_params", JSON.stringify({
      industry: data.industry,
      employees: data.employees,
      prefecture: data.prefecture,
      purpose: data.purposes[0],
    }));
    discard(); // Clear draft after submission
    router.push("/match");
  }, [data, discard, router]);

  const step1Valid = data.industry && data.employees !== null && data.prefecture;
  const step2Valid = data.purposes.length > 0;

  return (
    <ThreeColumnLayout
      left={<LeftGuide step={step} />}
      right={<RightTools />}
      center={
        <div className="max-w-[520px] mx-auto">
          {/* Restore banner */}
          {hasDraft && (
            <div
              className="mb-4 p-3 rounded-lg flex items-center justify-between text-xs animate-fade-slide-in"
              style={{
                background: "var(--hc-accent-light)",
                border: "1px solid rgba(202,138,4,0.2)",
              }}
            >
              <span>前回の入力途中のデータがあります</span>
              <div className="flex gap-2">
                <button
                  onClick={() => restore()}
                  className="font-semibold px-3 py-1 rounded"
                  style={{ color: "var(--hc-accent)" }}
                >
                  復元する
                </button>
                <button
                  onClick={discard}
                  className="px-3 py-1 rounded"
                  style={{ color: "var(--hc-text-muted)" }}
                >
                  最初から
                </button>
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`step-dot ${s === step ? "active" : ""} ${s < step ? "done" : ""}`}
                  onClick={() => s < step && goStep(s)}
                  style={{ cursor: s < step ? "pointer" : "default" }}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className="w-8 h-0.5"
                    style={{
                      background: s < step ? "var(--hc-primary)" : "var(--hc-border)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Autosave indicator */}
          {savedAt && (
            <div className="autosave justify-end mb-2">
              <span className="autosave-dot" />
              <span>保存済み</span>
            </div>
          )}

          {/* Step 1: 基本情報 */}
          {step === 1 && (
            <div className="card animate-fade-slide-in">
              <h2
                className="text-base font-bold mb-5"
                style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
              >
                基本情報を入力してください
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1.5">業種</label>
                <select
                  className="form-select"
                  value={data.industry}
                  onChange={(e) => updateField("industry", e.target.value)}
                  onBlur={handleBlur}
                >
                  <option value="">選択してください</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1.5">従業員数</label>
                <select
                  className="form-select"
                  value={data.employees ?? ""}
                  onChange={(e) =>
                    updateField("employees", e.target.value ? Number(e.target.value) : null)
                  }
                  onBlur={handleBlur}
                >
                  <option value="">選択してください</option>
                  {EMPLOYEE_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold mb-1.5">都道府県</label>
                <select
                  className="form-select"
                  value={data.prefecture}
                  onChange={(e) => updateField("prefecture", e.target.value)}
                  onBlur={handleBlur}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <button
                className="btn-primary w-full"
                disabled={!step1Valid}
                onClick={() => goStep(2)}
                style={{ opacity: step1Valid ? 1 : 0.5 }}
              >
                次へ →
              </button>
            </div>
          )}

          {/* Step 2: 導入目的 */}
          {step === 2 && (
            <div className="card animate-fade-slide-in">
              <h2
                className="text-base font-bold mb-5"
                style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
              >
                導入目的を選択してください（複数可）
              </h2>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {PURPOSES.map((p) => (
                  <div
                    key={p}
                    className={`cb ${data.purposes.includes(p) ? "selected" : ""}`}
                    onClick={() => togglePurpose(p)}
                  >
                    <span
                      className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: data.purposes.includes(p)
                          ? "var(--hc-primary)"
                          : "var(--hc-border)",
                        background: data.purposes.includes(p)
                          ? "var(--hc-primary)"
                          : "transparent",
                        color: "white",
                      }}
                    >
                      {data.purposes.includes(p) && "✓"}
                    </span>
                    {p}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => goStep(1)}
                >
                  ← 戻る
                </button>
                <button
                  className="btn-primary flex-1"
                  disabled={!step2Valid}
                  onClick={handleDiagnose}
                  style={{ opacity: step2Valid ? 1 : 0.5 }}
                >
                  診断する
                </button>
              </div>
            </div>
          )}

          {/* Turtle mascot — empty state */}
          {step === 1 && !data.industry && !data.employees && !data.prefecture && (
            <div className="text-center mt-8 opacity-50">
              <Image
                src="/images/turtle_search.png"
                alt=""
                width={40}
                height={40}
                className="mx-auto"
              />
              <p className="text-[10px] mt-2" style={{ color: "var(--hc-text-muted)" }}>
                3つの質問に答えるだけで最適な補助金が見つかります
              </p>
            </div>
          )}
        </div>
      }
    />
  );
}
