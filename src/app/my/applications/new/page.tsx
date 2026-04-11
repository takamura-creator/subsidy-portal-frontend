"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import WizardStepper from "@/components/applications/WizardStepper";
import WizardStep1, { type Step1Data } from "@/components/applications/WizardStep1";
import WizardStep2, { type Step2Data } from "@/components/applications/WizardStep2";
import WizardStep3 from "@/components/applications/WizardStep3";
import {
  createApplication,
  updateApplication,
  fetchApplication,
  type ApplicationDetail,
  ApiError,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";

const WIZARD_STEPS = [
  { label: "会社情報" },
  { label: "書類確認" },
  { label: "確認・提出" },
];

const INITIAL_STEP1: Step1Data = {
  company_name: "",
  industry: "",
  employees: "",
  annual_revenue: "",
  prefecture: "",
  representative_name: "",
  phone: "",
  email: "",
};

const INITIAL_STEP2: Step2Data = {
  checkedDocs: {},
  plan_text: "",
};

export default function ApplicationNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [currentStep, setCurrentStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Step1Data>(INITIAL_STEP1);
  const [step2Data, setStep2Data] = useState<Step2Data>(INITIAL_STEP2);
  const [applicationId, setApplicationId] = useState<string | null>(editId);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!requireAuth(["owner", "admin"], "/my/applications/new")) return;

    if (editId) {
      fetchApplication(editId)
        .then((app: ApplicationDetail) => {
          if (app.status !== "draft") {
            router.replace(`/my/applications/${editId}`);
            return;
          }
          setStep1Data({
            company_name: app.company_name || "",
            industry: app.industry || "",
            employees: app.employees != null ? String(app.employees) : "",
            annual_revenue: app.annual_revenue != null ? String(app.annual_revenue) : "",
            prefecture: app.prefecture || "",
            representative_name: app.representative_name || "",
            phone: app.phone || "",
            email: app.email || "",
          });
          setStep2Data({
            checkedDocs: (app.documents || []).reduce(
              (acc, doc) => ({ ...acc, [doc.name]: doc.uploaded }),
              {} as Record<string, boolean>
            ),
            plan_text: app.plan_text || "",
          });
          setApplicationId(editId);
        })
        .catch((err) => {
          if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
            router.replace("/my/applications");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [editId, router]);

  function buildPayload() {
    return {
      company_name: step1Data.company_name,
      industry: step1Data.industry,
      employees: step1Data.employees ? Number(step1Data.employees) : undefined,
      annual_revenue: step1Data.annual_revenue ? Number(step1Data.annual_revenue) : undefined,
      prefecture: step1Data.prefecture,
      representative_name: step1Data.representative_name,
      phone: step1Data.phone,
      plan_text: step2Data.plan_text,
      status: "draft" as const,
    };
  }

  async function handleSaveDraft() {
    setSaving(true);
    try {
      if (applicationId) {
        await updateApplication(applicationId, buildPayload());
      } else {
        const created = await createApplication(buildPayload());
        setApplicationId(created.id);
      }
      router.push("/my/applications");
    } catch {
      alert("下書き保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleStepForward() {
    // Step1 → Step2: 下書きをサーバーに保存してIDを取得
    if (currentStep === 0 && !applicationId) {
      setSaving(true);
      try {
        const created = await createApplication(buildPayload());
        setApplicationId(created.id);
      } catch {
        alert("保存に失敗しました");
        setSaving(false);
        return;
      } finally {
        setSaving(false);
      }
    }
    // Step2 → Step3: 更新保存
    if (currentStep === 1 && applicationId) {
      setSaving(true);
      try {
        await updateApplication(applicationId, buildPayload());
      } catch {
        // 保存失敗でもステップ遷移は許可
      } finally {
        setSaving(false);
      }
    }
    setCurrentStep((s) => Math.min(s + 1, 2));
  }

  function handleSubmitted(id: string) {
    router.push(`/my/applications/${id}`);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-8 w-full max-w-md mx-auto" />
        <div className="skeleton h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-in">
      <PageHeader
        title={editId ? "申請書を編集" : "申請書を作成"}
        breadcrumbs={[
          { label: "ダッシュボード", href: "/my" },
          { label: "申請一覧", href: "/my/applications" },
          { label: editId ? "編集" : "新規作成" },
        ]}
      />

      <WizardStepper currentStep={currentStep} steps={WIZARD_STEPS} />

      <div className="max-w-2xl mx-auto">
        {currentStep === 0 && (
          <WizardStep1
            data={step1Data}
            onChange={setStep1Data}
            onNext={handleStepForward}
            onSaveDraft={handleSaveDraft}
            saving={saving}
          />
        )}
        {currentStep === 1 && (
          <WizardStep2
            data={step2Data}
            onChange={setStep2Data}
            onNext={handleStepForward}
            onBack={() => setCurrentStep(0)}
            onSaveDraft={handleSaveDraft}
            saving={saving}
          />
        )}
        {currentStep === 2 && (
          <WizardStep3
            applicationId={applicationId}
            step1Data={step1Data}
            step2Data={step2Data}
            onBack={() => setCurrentStep(1)}
            onSubmitted={handleSubmitted}
          />
        )}
      </div>
    </div>
  );
}
