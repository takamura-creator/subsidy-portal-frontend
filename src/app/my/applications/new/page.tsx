"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { useAutosave } from "@/lib/useAutosave";
import { createApplication, fetchApplication, ApiError } from "@/lib/api";
import { INDUSTRIES, PREFECTURES } from "@/lib/constants";

// ————— ウィザードステップ定義 —————
const STEPS = [
  { label: "会社情報", icon: "🏢" },
  { label: "補助金選択", icon: "🎯" },
  { label: "書類アップロード", icon: "📎" },
  { label: "確認・提出", icon: "✅" },
];

// ————— モック補助金リスト —————
const MOCK_SUBSIDIES = [
  { id: "it-2026", name: "IT導入補助金 2026", amount: "最大100万円", deadline: "2026/4/30", match: 92 },
  { id: "shoukibo", name: "小規模事業者持続化補助金", amount: "最大200万円", deadline: "2026/5/15", match: 85 },
  { id: "monodukuri", name: "ものづくり補助金", amount: "最大750万円", deadline: "2026/6/20", match: 78 },
  { id: "jigyosaikouchiku", name: "事業再構築補助金", amount: "最大1億5000万円", deadline: "2026/7/31", match: 65 },
];

// ————— フォームデータ型 —————
interface DraftData {
  step: number;
  companyName: string;
  representative: string;
  phone: string;
  email: string;
  prefecture: string;
  industry: string;
  employees: string;
  selectedSubsidyId: string;
  purpose: string;
  businessContent: string;
  expectedEffect: string;
  plannedUnits: string;
  plannedDate: string;
  documents: string[];
}

const INITIAL_DRAFT: DraftData = {
  step: 0,
  companyName: "",
  representative: "",
  phone: "",
  email: "",
  prefecture: "",
  industry: "",
  employees: "",
  selectedSubsidyId: "",
  purpose: "",
  businessContent: "",
  expectedEffect: "",
  plannedUnits: "",
  plannedDate: "",
  documents: [],
};

// ————— 入力フィールドコンポーネント —————
function Field({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 4 }}>
        {label}
      </label>
      {help && <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 6 }}>{help}</p>}
      {children}
    </div>
  );
}

export default function ApplicationNewPage() {
  const router = useRouter();
  const { data, setData, save, hasDraft, restore, discard, savedAt } = useAutosave<DraftData>(
    "hojyo_came_application_new_draft",
    INITIAL_DRAFT,
  );

  const [submitting, setSubmitting] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);

  useEffect(() => {
    if (hasDraft) setShowRestoreBanner(true);
  }, [hasDraft]);

  function handleRestore() {
    const restored = restore();
    if (restored) setData(restored);
    setShowRestoreBanner(false);
  }

  function handleDiscard() {
    discard();
    setData(INITIAL_DRAFT);
    setShowRestoreBanner(false);
  }

  function updateField<K extends keyof DraftData>(key: K, value: DraftData[K]) {
    const next = { ...data, [key]: value };
    setData(next);
    save(next);
  }

  function goNext() {
    if (data.step < STEPS.length - 1) {
      const next = { ...data, step: data.step + 1 };
      setData(next);
      save(next);
    }
  }

  function goPrev() {
    if (data.step > 0) {
      const next = { ...data, step: data.step - 1 };
      setData(next);
      save(next);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const app = await createApplication({
        subsidy_id: data.selectedSubsidyId,
        company_name: data.companyName,
        representative_name: data.representative,
        phone: data.phone,
        email: data.email,
        prefecture: data.prefecture,
        industry: data.industry,
        employees: data.employees ? Number(data.employees) : undefined,
        plan_text: data.businessContent,
        status: "submitted",
      });
      discard();
      router.push(`/my/applications/${app.id}`);
    } catch {
      // フォールバック: ダッシュボードへ
      discard();
      router.push("/my/applications");
    } finally {
      setSubmitting(false);
    }
  }

  // ステップナビ左パネル
  const leftPanel = (
    <div>
      <Link href="/my" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--hc-text-muted)", textDecoration: "none", marginBottom: 16 }}>
        ← マイページ
      </Link>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        ステップ
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {STEPS.map((step, i) => {
          const done = i < data.step;
          const active = i === data.step;
          return (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 10px", marginBottom: 2, borderRadius: 6, background: active ? "rgba(21,128,61,0.06)" : "transparent", color: done ? "var(--hc-success)" : active ? "var(--hc-primary)" : "var(--hc-text-muted)", fontSize: 13, fontWeight: active ? 500 : 400 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${done ? "var(--hc-success)" : active ? "var(--hc-primary)" : "var(--hc-border)"}`, background: done ? "var(--hc-success)" : "transparent", color: done ? "#fff" : "inherit", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, boxShadow: active ? "0 0 0 3px rgba(21,128,61,0.12)" : "none" }}>
                {done ? "✓" : i + 1}
              </div>
              {step.label}
            </li>
          );
        })}
      </ul>
    </div>
  );

  // 右パネル: サマリー + PDF preview
  const selectedSubsidy = MOCK_SUBSIDIES.find((s) => s.id === data.selectedSubsidyId);
  const rightPanel = (
    <div>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        入力サマリー
      </p>

      {/* Step 1 サマリー */}
      {data.step >= 0 && (
        <div className="card" style={{ marginBottom: 8, padding: 14 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 8 }}>
            Step 1: 会社情報
          </h3>
          {[
            { label: "会社名", value: data.companyName },
            { label: "代表者", value: data.representative },
            { label: "都道府県", value: data.prefecture },
            { label: "業種", value: data.industry },
            { label: "従業員数", value: data.employees ? `${data.employees}名` : "" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 11 }}>
              <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
              <span style={{ fontWeight: value ? 500 : 300, color: value ? "var(--hc-text)" : "var(--hc-text-muted)", fontStyle: value ? "normal" : "italic", maxWidth: 120, textAlign: "right" }}>
                {value || "未入力"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step 2 サマリー */}
      {data.step >= 1 && (
        <div className="card" style={{ marginBottom: 8, padding: 14 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 8 }}>
            Step 2: 補助金選択
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11 }}>
            <span style={{ color: "var(--hc-text-muted)" }}>補助金</span>
            <span style={{ fontWeight: selectedSubsidy ? 500 : 300, color: selectedSubsidy ? "var(--hc-text)" : "var(--hc-text-muted)", fontStyle: selectedSubsidy ? "normal" : "italic", maxWidth: 140, textAlign: "right" }}>
              {selectedSubsidy?.name ?? "未選択"}
            </span>
          </div>
        </div>
      )}

      <div style={{ height: 1, background: "var(--hc-border)", margin: "12px 0" }} />

      {/* PDF プレビュー */}
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        PDFプレビュー
      </p>
      <div className="card" style={{ padding: 14 }}>
        <div style={{ width: "100%", aspectRatio: "210/297", background: "linear-gradient(180deg,rgba(21,128,61,0.03),rgba(21,128,61,0.01))", border: "1px solid var(--hc-border)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--hc-text-muted)", textAlign: "center" }}>
          <span style={{ fontSize: 24 }}>📄</span>
          <span>{selectedSubsidy?.name ?? "申請書"}</span>
          <span style={{ fontSize: 10 }}>作成中 {Math.round((data.step / STEPS.length) * 100)}%</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 6, textAlign: "center" }}>
          {data.step < 3 ? "確認ステップで完成します" : "提出可能です"}
        </p>
      </div>
    </div>
  );

  // ————— ステップコンテンツ —————
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid var(--hc-border)", borderRadius: 6, fontSize: 14, fontFamily: "inherit", color: "var(--hc-text)", background: "#fff", outline: "none" };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.6 };

  const stepContent = () => {
    switch (data.step) {
      case 0:
        return (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="会社名">
                <input className="form-input" value={data.companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder="株式会社サンプル" />
              </Field>
              <Field label="代表者名">
                <input className="form-input" value={data.representative} onChange={(e) => updateField("representative", e.target.value)} placeholder="山田 太郎" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="電話番号">
                <input className="form-input" type="tel" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="03-1234-5678" />
              </Field>
              <Field label="メールアドレス">
                <input className="form-input" type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} placeholder="info@example.co.jp" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="都道府県">
                <select className="form-select" value={data.prefecture} onChange={(e) => updateField("prefecture", e.target.value)}>
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="業種">
                <select className="form-select" value={data.industry} onChange={(e) => updateField("industry", e.target.value)}>
                  <option value="">選択してください</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </Field>
            </div>
            <Field label="従業員数">
              <input className="form-input" type="number" value={data.employees} onChange={(e) => updateField("employees", e.target.value)} placeholder="例: 12" style={{ maxWidth: 200 }} />
            </Field>
          </>
        );

      case 1:
        return (
          <>
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginBottom: 16 }}>
              AIマッチングに基づくおすすめ補助金から選択してください
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MOCK_SUBSIDIES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => updateField("selectedSubsidyId", s.id)}
                  style={{ padding: 14, border: `1px solid ${data.selectedSubsidyId === s.id ? "var(--hc-primary)" : "var(--hc-border)"}`, borderRadius: 8, cursor: "pointer", background: data.selectedSubsidyId === s.id ? "rgba(21,128,61,0.03)" : "#fff", transition: "all 0.15s" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 4 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>{s.amount} / 締切: {s.deadline}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--hc-primary)" }}>マッチ {s.match}%</div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${data.selectedSubsidyId === s.id ? "var(--hc-primary)" : "var(--hc-border)"}`, background: data.selectedSubsidyId === s.id ? "var(--hc-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, marginLeft: "auto", marginTop: 4 }}>
                        {data.selectedSubsidyId === s.id ? "✓" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 2:
        return (
          <>
            <Field label="事業内容" help="現在の事業内容を簡潔に記載してください">
              <textarea className="form-input" value={data.businessContent} onChange={(e) => updateField("businessContent", e.target.value)} placeholder="例: 東京都内で小売店舗を3店舗運営。アパレル・雑貨の販売を行っています。" style={textareaStyle} />
            </Field>
            <Field label="導入の背景・目的" help="なぜ申請したいのかを記載してください">
              <textarea className="form-input" value={data.purpose} onChange={(e) => updateField("purpose", e.target.value)} placeholder="例: 万引き被害が年間○万円に達しており、防犯カメラの導入により被害を抑止したい。" style={textareaStyle} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="導入予定数量">
                <input className="form-input" value={data.plannedUnits} onChange={(e) => updateField("plannedUnits", e.target.value)} placeholder="例: 8台" />
              </Field>
              <Field label="設置予定時期">
                <select className="form-select" value={data.plannedDate} onChange={(e) => updateField("plannedDate", e.target.value)}>
                  <option value="">選択してください</option>
                  <option value="2026-06">2026年6月</option>
                  <option value="2026-07">2026年7月</option>
                  <option value="2026-08">2026年8月</option>
                  <option value="2026-09">2026年9月以降</option>
                </select>
              </Field>
            </div>
            <Field label="期待する効果" help="導入によって期待される効果・改善を具体的に記載">
              <textarea className="form-input" value={data.expectedEffect} onChange={(e) => updateField("expectedEffect", e.target.value)} placeholder="例: 万引き被害を50%削減、店舗運営の安全性向上" style={textareaStyle} />
            </Field>

            {/* 書類アップロード */}
            <div style={{ height: 1, background: "var(--hc-border)", margin: "16px 0" }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 8 }}>必要書類</p>
            {["履歴事項全部証明書", "納税証明書", "見積書"].map((docName) => (
              <div key={docName} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid var(--hc-border)", borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                <span>{docName}</span>
                <label style={{ fontSize: 12, color: "var(--hc-primary)", cursor: "pointer", fontWeight: 500 }}>
                  アップロード
                  <input type="file" style={{ display: "none" }} onChange={() => updateField("documents", [...data.documents, docName])} />
                </label>
              </div>
            ))}
          </>
        );

      case 3:
        return (
          <>
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginBottom: 16 }}>
              以下の内容を確認し、問題がなければ提出してください。
            </p>
            {[
              { label: "会社名", value: data.companyName },
              { label: "代表者", value: data.representative },
              { label: "都道府県", value: data.prefecture },
              { label: "業種", value: data.industry },
              { label: "従業員数", value: data.employees ? `${data.employees}名` : "—" },
              { label: "補助金", value: MOCK_SUBSIDIES.find((s) => s.id === data.selectedSubsidyId)?.name ?? "未選択" },
              { label: "導入数量", value: data.plannedUnits || "—" },
              { label: "設置予定", value: data.plannedDate || "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 13 }}>
                <span style={{ color: "var(--hc-text-muted)", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "var(--hc-text)" }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: 14, background: "rgba(21,128,61,0.04)", borderRadius: 8, border: "1px solid rgba(21,128,61,0.1)", fontSize: 12, color: "var(--hc-text-muted)" }}>
              ✓ 提出後も書類のアップロードが可能です。審査開始前は修正できます。
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const centerContent = (
    <>
      {/* 復元バナー */}
      {showRestoreBanner && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--hc-accent-light)", border: "1px solid rgba(202,138,4,0.2)", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: "var(--hc-navy)" }}>⚠ 前回の下書きが見つかりました</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleRestore} className="btn-primary" style={{ fontSize: 11, padding: "4px 12px", cursor: "pointer" }}>復元する</button>
            <button onClick={handleDiscard} className="btn-secondary" style={{ fontSize: 11, padding: "4px 12px", cursor: "pointer" }}>破棄</button>
          </div>
        </div>
      )}

      {/* プログレスバー */}
      <div style={{ width: "100%", height: 6, background: "rgba(0,0,0,0.05)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${((data.step + 1) / STEPS.length) * 100}%`, background: "var(--hc-primary)", borderRadius: 3, transition: "width 0.3s" }} />
      </div>

      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)", marginBottom: 4 }}>
        Step {data.step + 1}: {STEPS[data.step].label}
      </h1>
      <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginBottom: 20 }}>
        {STEPS[data.step].icon} {
          data.step === 0 ? "法人情報を入力してください" :
          data.step === 1 ? "申請する補助金を選択してください" :
          data.step === 2 ? "事業計画と必要書類をアップロードしてください" :
          "入力内容を確認して提出してください"
        }
      </p>

      {/* フォームカード */}
      <div className="card" style={{ padding: 24 }}>
        {stepContent()}
        {/* 自動保存表示 */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--hc-primary)", marginTop: 14, justifyContent: "flex-end" }}>
          ✓ {savedAt ? `${savedAt.toLocaleTimeString("ja-JP")} 保存済み` : "自動保存: ON"}
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button
          onClick={goPrev}
          disabled={data.step === 0}
          className="btn-secondary"
          style={{ cursor: data.step === 0 ? "default" : "pointer", opacity: data.step === 0 ? 0.4 : 1 }}
        >
          ← 前のステップ
        </button>
        {data.step < STEPS.length - 1 ? (
          <button onClick={goNext} className="btn-primary" style={{ cursor: "pointer" }}>
            次のステップ →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "提出中..." : "✅ 提出する"}
          </button>
        )}
      </div>
    </>
  );

  return (
    <ThreeColumnLayout left={leftPanel} center={centerContent} right={rightPanel} />
  );
}
