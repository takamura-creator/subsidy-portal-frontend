"use client";

import { useState } from "react";
import {
  ALL_TEMPLATE_IDS,
  DIRECTION_OPTIONS,
  DISCLOSURE_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  MANAGER_OPTIONS,
  PRIVACY_MEASURE_OPTIONS,
  PURPOSE_OPTIONS,
  RANGE_OPTIONS,
  RECORDING_DAYS_OPTIONS,
  RISK_OPTIONS,
  generateTemplate,
  type TemplateId,
  type TemplateInput,
  type TemplateOutput,
} from "@/lib/jichikai-templates";
import { downloadOutput } from "@/lib/jichikai-template-download";
import {
  ContactCTA,
  MultiSelect,
  SingleSelect,
  pillButtonStyle,
} from "./template-form-controls";

interface Props {
  subsidyId: string;
  subsidyName: string;
  prefecture: string;
}

const TAB_LABELS: Record<TemplateId, string> = {
  purpose: "設置目的書",
  management: "管理運用規程",
  privacy: "個人情報保護方針",
  coverage: "撮影範囲説明書",
};

const TAB_ICONS: Record<TemplateId, string> = {
  purpose: "📋",
  management: "📜",
  privacy: "🔒",
  coverage: "📐",
};

const S = {
  card: {
    background: "var(--hc-white)",
    border: "1px solid var(--hc-border)",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    boxShadow: "var(--hc-shadow)",
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--hc-navy)",
    letterSpacing: "-0.3px",
    margin: "0 0 12px",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--hc-navy)",
    margin: "0 0 6px",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid var(--hc-border)",
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "inherit",
    background: "var(--hc-white)",
    color: "var(--hc-text)",
  } as React.CSSProperties,
  select: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid var(--hc-border)",
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "inherit",
    background: "var(--hc-white)",
    color: "var(--hc-text)",
  } as React.CSSProperties,
  primaryBtn: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--hc-white)",
    background: "var(--hc-primary)",
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  } as React.CSSProperties,
  secondaryBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--hc-text)",
    background: "var(--hc-white)",
    padding: "10px 18px",
    borderRadius: 8,
    border: "1px solid var(--hc-border)",
    cursor: "pointer",
    fontFamily: "inherit",
  } as React.CSSProperties,
};

export default function TemplateGenerator({ subsidyId, subsidyName, prefecture }: Props) {
  const [input, setInput] = useState<TemplateInput>({
    associationName: "",
    representativeName: "",
    installationAddress: "",
    cameraCount: 1,
    subsidyName,
    prefecture,
    purposes: [],
    expectedRisks: [],
    privacyMeasures: [],
  });
  const [activeTab, setActiveTab] = useState<TemplateId>("purpose");
  const [outputs, setOutputs] = useState<Partial<Record<TemplateId, TemplateOutput>>>({});
  const [generating, setGenerating] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  function updateInput<K extends keyof TemplateInput>(key: K, value: TemplateInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const commonReady =
    input.associationName.trim() !== "" &&
    input.representativeName.trim() !== "" &&
    input.installationAddress.trim() !== "" &&
    input.cameraCount > 0;

  async function handleGenerate() {
    if (!commonReady) {
      setCopyMessage("共通情報（自治会名・代表者名・設置住所・台数）を入力してください");
      return;
    }
    setGenerating(true);
    setCopyMessage("");
    try {
      const next: Partial<Record<TemplateId, TemplateOutput>> = {};
      for (const id of ALL_TEMPLATE_IDS) {
        next[id] = await generateTemplate(id, input);
      }
      setOutputs(next);
    } catch {
      setCopyMessage("生成に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("クリップボードにコピーしました");
      setTimeout(() => setCopyMessage(""), 3000);
    } catch {
      setCopyMessage("コピーに失敗しました");
    }
  }

  const currentOutput = outputs[activeTab];

  return (
    <div>
      {/* 上部の参考資料注意 */}
      <section
        style={{
          background: "var(--hc-accent-light)",
          border: "1px solid var(--hc-accent-line)",
          borderRadius: 10,
          padding: 14,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "var(--hc-accent-hover)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          <strong>参考資料として提供します。</strong>
          実際の申請には、各自治体の公式様式・最新の交付要綱を必ずご確認ください。
          記載内容の追記・修正が必要な箇所が含まれます。マルチックがサポートいたします。
        </p>
      </section>

      {/* 共通入力フォーム */}
      <section style={S.card}>
        <h2 style={S.sectionTitle}>共通情報の入力</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div>
            <label htmlFor="assocName" style={S.label}>
              自治会名 <span style={{ color: "var(--hc-error)" }}>*</span>
            </label>
            <input
              id="assocName"
              type="text"
              style={S.input}
              placeholder="例: 横浜市青葉区美しが丘自治会"
              value={input.associationName}
              onChange={(e) => updateInput("associationName", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="repName" style={S.label}>
              代表者氏名（自治会長） <span style={{ color: "var(--hc-error)" }}>*</span>
            </label>
            <input
              id="repName"
              type="text"
              style={S.input}
              placeholder="例: 鈴木 一郎"
              value={input.representativeName}
              onChange={(e) => updateInput("representativeName", e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div>
            <label htmlFor="address" style={S.label}>
              設置住所 <span style={{ color: "var(--hc-error)" }}>*</span>
            </label>
            <input
              id="address"
              type="text"
              style={S.input}
              placeholder="例: 横浜市青葉区美しが丘1-1-1"
              value={input.installationAddress}
              onChange={(e) => updateInput("installationAddress", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="camCount" style={S.label}>
              設置台数 <span style={{ color: "var(--hc-error)" }}>*</span>
            </label>
            <input
              id="camCount"
              type="number"
              min={1}
              max={50}
              style={S.input}
              value={input.cameraCount}
              onChange={(e) => updateInput("cameraCount", Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </div>
        </div>
      </section>

      {/* 書類タブ */}
      <section style={S.card}>
        <h2 style={S.sectionTitle}>書類別の選択項目</h2>

        <div
          role="tablist"
          aria-label="書類種別の選択"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, borderBottom: "1px solid var(--hc-border)", paddingBottom: 12 }}
        >
          {ALL_TEMPLATE_IDS.map((id) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${id}`}
                id={`tab-${id}`}
                onClick={() => setActiveTab(id)}
                style={pillButtonStyle(isActive)}
              >
                <span style={{ marginRight: 6 }}>{TAB_ICONS[id]}</span>
                {TAB_LABELS[id]}
              </button>
            );
          })}
        </div>

        {activeTab === "purpose" && (
          <div role="tabpanel" id="tabpanel-purpose" aria-labelledby="tab-purpose" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div role="group" aria-labelledby="lbl-purpose-purposes">
              <p id="lbl-purpose-purposes" style={S.label}>設置目的（複数選択可）</p>
              <MultiSelect
                options={PURPOSE_OPTIONS}
                values={input.purposes ?? []}
                onChange={(v) => updateInput("purposes", v)}
              />
            </div>
            <div role="group" aria-labelledby="lbl-purpose-loctype">
              <p id="lbl-purpose-loctype" style={S.label}>設置場所種別</p>
              <SingleSelect
                options={LOCATION_TYPE_OPTIONS}
                value={input.locationType}
                onChange={(v) => updateInput("locationType", v)}
              />
            </div>
            <div role="group" aria-labelledby="lbl-purpose-risks">
              <p id="lbl-purpose-risks" style={S.label}>想定する地域リスク（複数選択可）</p>
              <MultiSelect
                options={RISK_OPTIONS}
                values={input.expectedRisks ?? []}
                onChange={(v) => updateInput("expectedRisks", v)}
              />
            </div>
          </div>
        )}

        {activeTab === "management" && (
          <div role="tabpanel" id="tabpanel-management" aria-labelledby="tab-management" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div role="group" aria-labelledby="lbl-mgmt-days">
              <p id="lbl-mgmt-days" style={S.label}>録画データ保存期間（日）</p>
              <SingleSelect
                options={RECORDING_DAYS_OPTIONS}
                value={input.recordingDays}
                onChange={(v) => updateInput("recordingDays", v)}
                formatLabel={(v) => `${v}日間`}
              />
            </div>
            <div role="group" aria-labelledby="lbl-mgmt-manager">
              <p id="lbl-mgmt-manager" style={S.label}>管理責任者</p>
              <SingleSelect
                options={MANAGER_OPTIONS}
                value={input.manager}
                onChange={(v) => updateInput("manager", v)}
              />
            </div>
            <div role="group" aria-labelledby="lbl-mgmt-disclosure">
              <p id="lbl-mgmt-disclosure" style={S.label}>映像開示への対応方針</p>
              <SingleSelect
                options={DISCLOSURE_OPTIONS}
                value={input.disclosurePolicy}
                onChange={(v) => updateInput("disclosurePolicy", v)}
              />
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div role="tabpanel" id="tabpanel-privacy" aria-labelledby="tab-privacy">
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)", lineHeight: 1.6, margin: 0 }}>
              個人情報保護方針は、共通情報の自治会名・代表者名・所在地の情報のみを差し込んで生成します。
              追加の選択項目はありません。
            </p>
          </div>
        )}

        {activeTab === "coverage" && (
          <div role="tabpanel" id="tabpanel-coverage" aria-labelledby="tab-coverage" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div role="group" aria-labelledby="lbl-cov-dir">
              <p id="lbl-cov-dir" style={S.label}>撮影方向</p>
              <SingleSelect
                options={DIRECTION_OPTIONS}
                value={input.coverageDirection}
                onChange={(v) => updateInput("coverageDirection", v)}
              />
            </div>
            <div role="group" aria-labelledby="lbl-cov-range">
              <p id="lbl-cov-range" style={S.label}>撮影距離</p>
              <SingleSelect
                options={RANGE_OPTIONS}
                value={input.coverageRange}
                onChange={(v) => updateInput("coverageRange", v)}
                formatLabel={(v) => `${v}m`}
              />
            </div>
            <div role="group" aria-labelledby="lbl-cov-privacy">
              <p id="lbl-cov-privacy" style={S.label}>プライバシー配慮策（複数選択可）</p>
              <MultiSelect
                options={PRIVACY_MEASURE_OPTIONS}
                values={input.privacyMeasures ?? []}
                onChange={(v) => updateInput("privacyMeasures", v)}
              />
            </div>
          </div>
        )}
      </section>

      {/* 生成ボタン */}
      <section style={{ ...S.card, textAlign: "center" }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !commonReady}
          style={{
            ...S.primaryBtn,
            opacity: generating || !commonReady ? 0.5 : 1,
            cursor: generating || !commonReady ? "not-allowed" : "pointer",
          }}
        >
          {generating ? "生成中..." : "4種類の参考書類を生成する"}
        </button>
        {copyMessage && (
          <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "10px 0 0" }}>
            {copyMessage}
          </p>
        )}
      </section>

      {/* 出力エリア */}
      {currentOutput && (
        <section style={S.card}>
          <header style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <h2 style={{ ...S.sectionTitle, margin: 0 }}>{currentOutput.title}</h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--hc-error)",
                  border: "1.5px solid var(--hc-error)",
                  padding: "2px 10px",
                  borderRadius: 9999,
                }}
              >
                参考資料
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleCopy(currentOutput.body)}
                style={S.secondaryBtn}
              >
                📋 本文をコピー
              </button>
              <button
                type="button"
                onClick={() => downloadOutput(currentOutput, "doc")}
                style={S.secondaryBtn}
              >
                📄 Word（.doc）でダウンロード
              </button>
              <button
                type="button"
                onClick={() => downloadOutput(currentOutput, "txt")}
                style={S.secondaryBtn}
              >
                📝 テキスト（.txt）でダウンロード
              </button>
            </div>
          </header>

          <pre
            style={{
              background: "var(--hc-bg)",
              border: "1px solid var(--hc-border)",
              borderRadius: 8,
              padding: 16,
              fontSize: 12,
              lineHeight: 1.7,
              fontFamily: "'Noto Sans JP', sans-serif",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 480,
              overflowY: "auto",
              color: "var(--hc-text)",
              margin: 0,
            }}
          >
            {currentOutput.body}
          </pre>
        </section>
      )}

      <ContactCTA subsidyName={subsidyName} />
    </div>
  );
}
