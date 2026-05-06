"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { useAutosave } from "@/lib/useAutosave";
import { createApplication, fetchAiStatus, requestDraftAssist } from "@/lib/api";
import { INDUSTRIES, PREFECTURES } from "@/lib/constants";

// --- ウィザードステップ定義 ---
const STEPS = [
  { label: "会社情報", icon: "🏢" },
  { label: "事業計画", icon: "📋" },
  { label: "見積書", icon: "📎" },
  { label: "確認", icon: "✅" },
  { label: "PDF出力", icon: "📄" },
];

// --- フォームデータ型 ---
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
  step: 1,
  companyName: "株式会社サンプル",
  representative: "山田 太郎",
  phone: "03-1234-5678",
  email: "yamada@sample.co.jp",
  prefecture: "東京都新宿区",
  industry: "小売業",
  employees: "12",
  selectedSubsidyId: "it-2026",
  purpose: "",
  businessContent: "",
  expectedEffect: "",
  plannedUnits: "",
  plannedDate: "",
  documents: [],
};

// --- 入力フィールドコンポーネント ---
function Field({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 4 }}>
        {label}
      </label>
      {help && <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 6, fontWeight: 300 }}>{help}</p>}
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
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiTips, setAiTips] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchAiStatus().then((s) => setAiAvailable(s.available)).catch(() => {});
  }, []);

  async function handleAiAssist(field: "purpose" | "business_plan" | "expected_effect", dataField: keyof DraftData) {
    setAiLoading(field);
    setAiTips((prev) => ({ ...prev, [field]: [] }));
    try {
      const res = await requestDraftAssist({
        subsidy_id: data.selectedSubsidyId || "",
        company_info: {
          name: data.companyName || "",
          industry: data.industry || "",
          employees: Number(data.employees) || 0,
          prefecture: data.prefecture || "",
        },
        field,
        user_input: String((data as unknown as Record<string, unknown>)[dataField] ?? ""),
      });
      updateField(dataField, res.draft_text);
      setAiTips((prev) => ({ ...prev, [field]: res.tips }));
    } catch {
      setAiTips((prev) => ({ ...prev, [field]: ["現在AI機能が利用できません。しばらくしてから再度お試しください。"] }));
    } finally {
      setAiLoading(null);
    }
  }

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
      discard();
      router.push("/my/applications");
    } finally {
      setSubmitting(false);
    }
  }

  const progressPercent = Math.round(((data.step + 1) / STEPS.length) * 100);

  // --- 左パネル: ステップナビ ---
  const leftPanel = (
    <div>
      <Link
        href="/my"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: "var(--hc-text-muted)",
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        ← マイページ
      </Link>
      <span className="section-title">ステップ</span>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {STEPS.map((step, i) => {
          const done = i < data.step;
          const active = i === data.step;
          return (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 10px",
                marginBottom: 2,
                borderRadius: 6,
                background: active ? "var(--hc-primary-muted)" : "transparent",
                color: done ? "var(--hc-success)" : active ? "var(--hc-primary)" : "var(--hc-text-muted)",
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${done ? "var(--hc-success)" : active ? "var(--hc-primary)" : "var(--hc-border)"}`,
                  background: done ? "var(--hc-success)" : "transparent",
                  color: done ? "#fff" : "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  flexShrink: 0,
                  boxShadow: active ? "0 0 0 3px var(--hc-primary-light)" : "none",
                }}
              >
                {done ? "✓" : ""}
              </div>
              {step.label}
            </li>
          );
        })}
      </ul>
    </div>
  );

  // --- 右パネル: サマリー + PDFプレビュー ---
  const rightPanel = (
    <div>
      <span className="section-title">入力サマリー</span>

      {/* Step 1: 会社情報サマリー */}
      <div className="summary-card">
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 8 }}>
          Step 1: 会社情報
          {data.step > 0 && (
            <a href="#" style={{ fontSize: 11, color: "var(--hc-primary)", textDecoration: "none", float: "right" }}>修正</a>
          )}
        </h3>
        {[
          { label: "会社名", value: data.companyName },
          { label: "代表者", value: data.representative },
          { label: "所在地", value: data.prefecture },
          { label: "業種", value: data.industry },
          { label: "従業員数", value: data.employees ? `${data.employees}名` : "" },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 0",
              borderBottom: "1px solid var(--hc-border)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
            <span
              style={{
                fontWeight: value ? 500 : 300,
                color: value ? "var(--hc-text)" : "var(--hc-text-muted)",
                fontStyle: value ? "normal" : "italic",
                maxWidth: 140,
                textAlign: "right",
              }}
            >
              {value || "未入力"}
            </span>
          </div>
        ))}
      </div>

      {/* Step 2: 事業計画サマリー */}
      <div className="summary-card">
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 8 }}>
          Step 2: 事業計画
        </h3>
        {[
          { label: "事業内容", value: data.businessContent ? data.businessContent.slice(0, 20) + "..." : "" },
          { label: "導入目的", value: data.purpose ? data.purpose.slice(0, 20) + "..." : "" },
          { label: "台数", value: data.plannedUnits },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 0",
              borderBottom: "1px solid var(--hc-border)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
            <span
              style={{
                fontWeight: value ? 500 : 300,
                color: value ? "var(--hc-text)" : "var(--hc-text-muted)",
                fontStyle: value ? "normal" : "italic",
                maxWidth: 140,
                textAlign: "right",
              }}
            >
              {value || "入力中..."}
            </span>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* PDFプレビュー */}
      <span className="section-title">PDFプレビュー</span>
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          padding: 14,
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "210/297",
            background: "linear-gradient(180deg,var(--hc-primary-faint),transparent)",
            border: "1px solid var(--hc-border)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 4,
            fontSize: 11,
            color: "var(--hc-text-muted)",
            textAlign: "center",
          }}
        >
          📄<br />
          IT導入補助金<br />
          申請書<br /><br />
          <span style={{ fontSize: 10 }}>作成中 {progressPercent}%</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 6, textAlign: "center" }}>
          事業計画の入力が完了するとプレビュー可能
        </p>
      </div>
    </div>
  );

  // --- ステップコンテンツ ---
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
            <Field label="事業内容" help="現在の事業内容を簡潔に記載してください">
              <textarea
                className="form-input"
                value={data.businessContent}
                onChange={(e) => updateField("businessContent", e.target.value)}
                placeholder="例: 東京都内で小売店舗を3店舗運営。アパレル・雑貨の販売を行っている。"
                style={{ minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
              />
            </Field>
            <Field label="導入の背景・目的" help="なぜ監視カメラを導入したいのかを記載">
              <textarea
                className="form-input"
                value={data.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                placeholder="例: 万引き被害が年間○万円に達しており、防犯カメラの導入により被害を抑止したい。"
                style={{ minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
              />
              {aiAvailable && (
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleAiAssist("purpose", "purpose")}
                    disabled={aiLoading === "purpose"}
                    style={{
                      fontSize: 12, padding: "6px 14px", borderRadius: 6,
                      background: "var(--hc-primary-muted)", border: "1px solid var(--hc-primary-line)",
                      color: "var(--hc-primary)", cursor: "pointer", fontWeight: 500,
                      opacity: aiLoading === "purpose" ? 0.6 : 1,
                    }}
                  >
                    {aiLoading === "purpose" ? "生成中..." : "✨ AIに相談する"}
                  </button>
                  {aiTips.purpose?.map((tip, i) => (
                    <p key={i} style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 4 }}>💡 {tip}</p>
                  ))}
                </div>
              )}
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="導入予定台数">
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
            <Field label="期待する効果" help="導入によって期待される効果・改善を具体的に">
              <textarea
                className="form-input"
                value={data.expectedEffect}
                onChange={(e) => updateField("expectedEffect", e.target.value)}
                placeholder="例: 万引き被害を50%削減、店舗運営の安全性向上、従業員の安心感の確保"
                style={{ minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
              />
              {aiAvailable && (
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleAiAssist("expected_effect", "expectedEffect")}
                    disabled={aiLoading === "expected_effect"}
                    style={{
                      fontSize: 12, padding: "6px 14px", borderRadius: 6,
                      background: "var(--hc-primary-muted)", border: "1px solid var(--hc-primary-line)",
                      color: "var(--hc-primary)", cursor: "pointer", fontWeight: 500,
                      opacity: aiLoading === "expected_effect" ? 0.6 : 1,
                    }}
                  >
                    {aiLoading === "expected_effect" ? "生成中..." : "✨ AIに相談する"}
                  </button>
                  {aiTips.expected_effect?.map((tip, i) => (
                    <p key={i} style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 4 }}>💡 {tip}</p>
                  ))}
                </div>
              )}
            </Field>
          </>
        );

      case 2:
        return (
          <p style={{ fontSize: 13, color: "var(--hc-text-muted)", padding: 20, textAlign: "center", background: "var(--hc-text-faint)", borderRadius: 6 }}>
            事業計画の入力が完了すると見積書の作成に進めます
          </p>
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
              { label: "所在地", value: data.prefecture },
              { label: "業種", value: data.industry },
              { label: "従業員数", value: data.employees ? `${data.employees}名` : "—" },
              { label: "事業内容", value: data.businessContent || "—" },
              { label: "導入台数", value: data.plannedUnits || "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 13 }}>
                <span style={{ color: "var(--hc-text-muted)", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "var(--hc-text)" }}>{value}</span>
              </div>
            ))}
          </>
        );

      case 4:
        return (
          <div style={{ textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 8 }}>PDF出力準備完了</p>
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)" }}>申請書のPDFを生成して提出できます</p>
          </div>
        );

      default:
        return null;
    }
  };

  // --- 中央コンテンツ ---
  const centerContent = (
    <>
      {/* 復元バナー */}
      {showRestoreBanner && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--hc-accent-light)", border: "1px solid var(--hc-accent-line)", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: "var(--hc-navy)" }}>⚠ 前回の下書きが見つかりました</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleRestore} className="btn-primary" style={{ fontSize: 11, padding: "4px 12px", cursor: "pointer", width: "auto" }}>復元する</button>
            <button onClick={handleDiscard} className="btn-secondary" style={{ fontSize: 11, padding: "4px 12px", cursor: "pointer" }}>破棄</button>
          </div>
        </div>
      )}

      {/* プログレスバー */}
      <div style={{ width: "100%", height: 6, background: "var(--hc-text-divider)", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${progressPercent}%`, background: "var(--hc-primary)", borderRadius: 3, transition: "width 0.3s" }} />
      </div>

      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)", letterSpacing: "-0.3px", marginBottom: 4 }}>
        Step {data.step + 1}: {STEPS[data.step].label}
      </h1>
      <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginBottom: 20 }}>
        {data.step === 0
          ? "法人情報を入力してください"
          : data.step === 1
          ? "IT導入補助金（セキュリティ対策推進枠）の申請に必要な事業計画を入力します。"
          : data.step === 2
          ? "見積書を作成してください"
          : data.step === 3
          ? "入力内容を確認して提出してください"
          : "PDF出力の準備ができています"}
      </p>

      {/* フォームカード */}
      <div className="form-card">
        {stepContent()}
        {/* 自動保存表示 */}
        <div className="autosave">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {savedAt ? `${savedAt.toLocaleTimeString("ja-JP")} 保存済み` : "保存済み"}
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
          <button onClick={goNext} className="btn-primary" style={{ cursor: "pointer", width: "auto", padding: "12px 24px" }}>
            次のステップ →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1, width: "auto", padding: "12px 24px" }}>
            {submitting ? "提出中..." : "✅ 提出する"}
          </button>
        )}
      </div>
    </>
  );

  return (
    <ThreeColumnLayout
      left={leftPanel}
      center={centerContent}
      right={rightPanel}
      gridCols="200px 1fr 260px"
    />
  );
}
