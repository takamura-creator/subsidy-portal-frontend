"use client";

import { useCallback, useEffect, useState } from "react";
import WizardLayout, {
  WIZARD_STEPS,
  JIZOKUKA_STEPS,
  type WizardStepId,
} from "@/components/wizard/WizardLayout";
import Step1Company from "@/components/wizard/Step1Company";
import Step2Subsidy from "@/components/wizard/Step2Subsidy";
import Step3Products from "@/components/wizard/Step3Products";
import Step4Estimate from "@/components/wizard/Step4Estimate";
import Step5Documents from "@/components/wizard/Step5Documents";
import Step6Preview from "@/components/wizard/Step6Preview";
import Step6QA from "@/components/wizard/Step6QA";
import Step7Generate from "@/components/wizard/Step7Generate";
import Step8Draft from "@/components/wizard/Step8Draft";
import {
  detectDocumentTier,
  type CompanyInfo,
  type DocumentsSnapshot,
  type EstimateSnapshot,
  type ProductSelection,
  type SubsidySelection,
  type WizardState,
  EMPTY_WIZARD_STATE,
} from "@/components/wizard/types";

const STORAGE_KEY = "hc_wizard_state_v2";

export default function WizardPage() {
  const [step, setStep] = useState<WizardStepId>(1);
  const [state, setState] = useState<WizardState>(EMPTY_WIZARD_STATE);
  const [hydrated, setHydrated] = useState(false);

  const isJizokuka = detectDocumentTier(state.subsidy).draftType === "jizokuka";
  const maxStep = isJizokuka ? 7 : 6;
  const steps = isJizokuka ? JIZOKUKA_STEPS : WIZARD_STEPS;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { step?: WizardStepId; state?: WizardState };
        const restoredState = parsed.state ?? EMPTY_WIZARD_STATE;
        const restoredIsJizokuka = detectDocumentTier(restoredState.subsidy).draftType === "jizokuka";
        const restoredMaxStep = restoredIsJizokuka ? 7 : 6;
        setState(restoredState);
        if (parsed.step && parsed.step >= 1 && parsed.step <= restoredMaxStep) {
          setStep(parsed.step);
        }
      }
    } catch {
      // noop
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, state }));
    } catch {
      // noop
    }
  }, [step, state, hydrated]);

  const setCompany = useCallback((c: CompanyInfo) => {
    setState((prev) => ({ ...prev, company: c }));
    setStep(2);
    scrollTop();
  }, []);

  /** Step 1 の HP自動取得で得た追加情報を hpExtracted に保存 */
  const saveHpExtracted = useCallback((fields: Record<string, string>) => {
    setState((prev) => ({ ...prev, hpExtracted: { ...(prev.hpExtracted ?? {}), ...fields } }));
  }, []);

  const setSubsidy = useCallback((s: SubsidySelection) => {
    setState((prev) => ({ ...prev, subsidy: s }));
    setStep(3);
    scrollTop();
  }, []);

  const setProducts = useCallback((items: ProductSelection[]) => {
    setState((prev) => ({ ...prev, products: items }));
    setStep(4);
    scrollTop();
  }, []);

  const setEstimate = useCallback((e: EstimateSnapshot) => {
    setState((prev) => ({ ...prev, estimate: e }));
  }, []);

  const goToStep5 = useCallback(() => {
    setStep(5);
    scrollTop();
  }, []);

  const goToStep6 = useCallback(() => {
    setStep(6);
    scrollTop();
  }, []);

  const setDocuments = useCallback((d: DocumentsSnapshot) => {
    setState((prev) => ({ ...prev, documents: d }));
  }, []);

  const setReminderEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, reminderEmail: email }));
  }, []);

  // ─── 持続化補助金フロー（7ステップ）───
  // Step 5: 補足質問（旧 Step 6）
  const setQaAnswers = useCallback((answers: Record<string, string>) => {
    setState((prev) => ({ ...prev, qaAnswers: answers }));
    setStep(6); // → AI生成
    scrollTop();
  }, []);

  // Step 6: AI生成（旧 Step 7）
  const handleGenerated = useCallback((draftId: string) => {
    setState((prev) => ({ ...prev, draftId }));
    setStep(7); // → 編集・出力
    scrollTop();
  }, []);

  const subtitleByStep: Record<number, string> = {
    1: "まずは会社情報を入力してください。ホームページURLから自動取得もできます。",
    2: "対応する補助金を選択すると、エリア判定と製品構成へ進めます。",
    3: "AVTECH製品から構成を組み立てます。パッケージからの一括選択も可能です。",
    4: "見積もりを生成し、PDFをダウンロードできます。",
    ...(isJizokuka
      ? {
          5: "事業計画書の精度を高めるための補足質問です。",
          6: "AIが事業計画書を章ごとに自動生成しています。",
          7: "生成された事業計画書を確認・編集し、PDF/Wordで出力できます。",
        }
      : {
          5: "補助金種別に応じて、テンプレート差込または下書きテキストを生成します。",
          6: "生成物の確認とマルチックへの施工依頼を行います。",
        }),
  };

  return (
    <WizardLayout
      currentStep={step}
      steps={steps}
      title="見積もり・申請書類ウィザード"
      subtitle={subtitleByStep[step]}
    >
      {!hydrated ? (
        <p className="text-[13px] text-text-muted">読み込み中...</p>
      ) : step === 1 ? (
        <Step1Company defaults={state.company} onNext={setCompany} onHpExtracted={saveHpExtracted} />
      ) : step === 2 && isCompanyReady(state.company) ? (
        <Step2Subsidy
          company={state.company as CompanyInfo}
          selected={state.subsidy}
          onBack={() => setStep(1)}
          onNext={setSubsidy}
        />
      ) : step === 3 && isCompanyReady(state.company) && state.subsidy ? (
        <Step3Products
          selected={state.products}
          onBack={() => setStep(2)}
          onNext={setProducts}
        />
      ) : step === 4 && isCompanyReady(state.company) && state.subsidy && state.products.length > 0 ? (
        <Step4Estimate
          company={state.company as CompanyInfo}
          subsidy={state.subsidy}
          products={state.products}
          estimate={state.estimate}
          onBack={() => setStep(3)}
          onSaved={setEstimate}
          onNext={goToStep5}
        />
      ) : step === 5 && isJizokuka && isCompanyReady(state.company) && state.subsidy ? (
        /* 持続化: Step 5 = 補足質問（旧 Step 6） */
        <Step6QA
          initialAnswers={state.qaAnswers}
          hpExtracted={state.hpExtracted}
          company={state.company as CompanyInfo}
          subsidy={state.subsidy}
          onBack={() => setStep(4)}
          onNext={setQaAnswers}
        />
      ) : step === 5 &&
        !isJizokuka &&
        isCompanyReady(state.company) &&
        state.subsidy &&
        state.products.length > 0 &&
        state.estimate ? (
        /* 非持続化: Step 5 = 申請書類 */
        <Step5Documents
          company={state.company as CompanyInfo}
          subsidy={state.subsidy}
          estimate={state.estimate}
          documents={state.documents}
          onBack={() => setStep(4)}
          onNext={goToStep6}
          onUpdateDocuments={setDocuments}
        />
      ) : step === 6 && isJizokuka && isCompanyReady(state.company) && state.subsidy ? (
        /* 持続化: Step 6 = AI生成（旧 Step 7） */
        <Step7Generate
          company={state.company as CompanyInfo}
          subsidy={state.subsidy}
          applicationId={state.estimate?.id ?? "draft-preview"}
          hpExtracted={state.hpExtracted ?? {}}
          qaAnswers={state.qaAnswers ?? {}}
          existingDraftId={state.draftId}
          onGenerated={handleGenerated}
          onBack={() => setStep(5)}
        />
      ) : step === 6 &&
        !isJizokuka &&
        isCompanyReady(state.company) &&
        state.subsidy &&
        state.products.length > 0 &&
        state.estimate ? (
        /* 非持続化: Step 6 = プレビュー */
        <Step6Preview
          company={state.company as CompanyInfo}
          subsidy={state.subsidy}
          products={state.products}
          estimate={state.estimate}
          documents={state.documents}
          reminderEmail={state.reminderEmail}
          onBack={() => setStep(5)}
          onReminderSaved={setReminderEmail}
        />
      ) : step === 7 && isJizokuka && isCompanyReady(state.company) && state.subsidy ? (
        /* 持続化: Step 7 = 編集・出力（旧 Step 8） */
        <Step8Draft
          company={state.company as CompanyInfo}
          subsidy={state.subsidy}
          applicationId={state.estimate?.id}
          draftId={state.draftId}
          hpExtracted={state.hpExtracted}
          qaAnswers={state.qaAnswers}
          onBack={() => setStep(6)}
          onNext={() => {
            setStep(1);
            setState(EMPTY_WIZARD_STATE);
          }}
        />
      ) : (
        <MissingPrereq onReset={() => setStep(1)} currentStep={step} />
      )}
    </WizardLayout>
  );
}

function isCompanyReady(c: Partial<CompanyInfo>): c is CompanyInfo {
  return Boolean(
    c.companyName &&
      c.representativeName &&
      c.address &&
      c.prefecture &&
      c.industry &&
      c.employees,
  );
}

function scrollTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function MissingPrereq({
  onReset,
  currentStep,
}: {
  onReset: () => void;
  currentStep: number;
}) {
  return (
    <div className="text-center py-8">
      <p className="text-[13px] text-text-muted leading-relaxed mb-4">
        Step {currentStep} に進むための情報が揃っていません。
        前のステップを完了してからお進みください。
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center px-5 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
      >
        Step 1 から開始
      </button>
    </div>
  );
}
