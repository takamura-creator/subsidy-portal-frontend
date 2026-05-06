"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateEstimatePdf, submitLead, ApiError } from "@/lib/api";
import {
  detectDocumentTier,
  type CompanyInfo,
  type DocumentsSnapshot,
  type EstimateSnapshot,
  type ProductSelection,
  type SubsidySelection,
} from "./types";

const MULTIK_CONTACT_EMAIL = "contact@multik.jp";

interface Props {
  company: CompanyInfo;
  subsidy: SubsidySelection;
  products: ProductSelection[];
  estimate: EstimateSnapshot;
  documents?: DocumentsSnapshot;
  reminderEmail?: string;
  onBack: () => void;
  onReminderSaved: (email: string) => void;
}

export default function Step6Preview({
  company,
  subsidy,
  products,
  estimate,
  documents,
  reminderEmail,
  onBack,
  onReminderSaved,
}: Props) {
  const { tier } = useMemo(() => detectDocumentTier(subsidy), [subsidy]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string>("");

  async function handleDownloadEstimatePdf() {
    setPdfError("");
    setPdfLoading(true);
    try {
      const blob = await generateEstimatePdf(estimate.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `estimate_${estimate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(
        err instanceof ApiError
          ? err.message
          : "見積書PDFの取得に失敗しました。",
      );
    } finally {
      setPdfLoading(false);
    }
  }

  const draft = documents?.draft;
  const tier1 = documents?.tier1Generated ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-bold text-navy mb-1"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Step 6：プレビュー・PDF出力
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          ここまで入力された内容・生成物の一覧です。マルチックへの施工依頼もこの画面から送信できます。
        </p>
      </div>

      {/* サマリー */}
      <section className="bg-white border border-border rounded-[10px] overflow-hidden">
        <header className="px-5 py-3 border-b border-border bg-bg">
          <h3 className="text-[14px] font-bold text-navy">入力サマリー</h3>
        </header>
        <dl className="divide-y divide-border text-[13px]">
          <Row label="会社">
            {company.companyName}（{company.industry} / {company.employees}名 / {company.prefecture}）
          </Row>
          <Row label="補助金">
            {subsidy.name}（上限 {Math.round(subsidy.rateMax * 100)}% / 最大{" "}
            {subsidy.maxAmount.toLocaleString("ja-JP")}円）
          </Row>
          <Row label="製品構成">
            <ul className="space-y-0.5">
              {products.map((p) => (
                <li key={p.productId} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-text-muted">× {p.quantity}</span>
                </li>
              ))}
            </ul>
          </Row>
          <Row label="見積もり">
            合計{" "}
            <span className="font-semibold">
              {estimate.totalBeforeSubsidy.toLocaleString("ja-JP")}円
            </span>{" "}
            / 補助金適用 -{estimate.subsidyAmount.toLocaleString("ja-JP")}円 /
            自己負担{" "}
            <span className="text-primary font-bold">
              {estimate.selfPayment.toLocaleString("ja-JP")}円
            </span>
          </Row>
        </dl>
      </section>

      {/* 生成物一覧 */}
      <section className="bg-white border border-border rounded-[10px] overflow-hidden">
        <header className="px-5 py-3 border-b border-border bg-bg flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-navy">生成済みファイル・下書き</h3>
          {pdfError && <span className="text-[12px] text-error">{pdfError}</span>}
        </header>
        <ul className="divide-y divide-border text-[13px]">
          <li className="px-5 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-navy">見積書PDF</p>
              <p className="text-[12px] text-text-muted">ID: {estimate.id}</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadEstimatePdf}
              disabled={pdfLoading}
              className="inline-flex items-center justify-center px-4 py-2 rounded-[8px] bg-accent text-white font-semibold text-[12px] hover:bg-[var(--hc-accent-hover)] transition disabled:opacity-60"
            >
              {pdfLoading ? "準備中..." : "ダウンロード"}
            </button>
          </li>

          {tier === "tier2" && (
            <li className="px-5 py-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy">Tier 2 下書きテキスト</p>
                {draft ? (
                  <p className="text-[12px] text-text-muted">
                    {draft.sections.length}セクション生成済（{formatDate(draft.generated_at)}）
                    {draft.fallback && "・フォールバック応答"}
                  </p>
                ) : (
                  <p className="text-[12px] text-text-muted">未生成（Step 5 で生成してください）</p>
                )}
              </div>
              <button
                type="button"
                onClick={onBack}
                className="shrink-0 text-[12px] text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer"
              >
                Step 5 に戻る
              </button>
            </li>
          )}

          {tier === "tier1" && (
            <li className="px-5 py-3">
              <p className="font-medium text-navy mb-1">Tier 1 テンプレート差込書類</p>
              {tier1.length === 0 ? (
                <p className="text-[12px] text-text-muted">
                  Task 1（神奈川県テンプレート差込）完成後、生成状況がここに一覧表示されます。
                </p>
              ) : (
                <ul className="text-[12px] text-text-muted space-y-0.5 mt-1">
                  {tier1.map((t) => (
                    <li key={t.templateId} className="flex justify-between">
                      <span>{t.name}</span>
                      <span>{t.generated ? "✓ 生成済" : "未生成"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}
        </ul>
      </section>

      {/* 申請期限リマインダー */}
      <ReminderCard
        defaultEmail={reminderEmail}
        prefecture={company.prefecture}
        subsidyName={subsidy.name}
        onSaved={onReminderSaved}
      />

      {/* 施工依頼CTA */}
      <ContactMultikCard
        company={company}
        subsidy={subsidy}
        estimate={estimate}
      />

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:border-primary transition"
        >
          Step 5 に戻る
        </button>
        <Link
          href="/match"
          className="inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:border-primary transition"
        >
          補助金診断に戻る
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 *  SummaryRow
 * ------------------------------------------------------------------ */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] md:grid-cols-[160px_1fr] gap-4 px-5 py-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text">{children}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------
 *  リマインダー登録
 * ------------------------------------------------------------------ */

const reminderSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("メールアドレスの形式が正しくありません"),
  consent: z.boolean().refine((v) => v === true, {
    message: "プライバシーポリシーへの同意が必要です",
  }),
});

type ReminderValues = z.infer<typeof reminderSchema>;

function ReminderCard({
  defaultEmail,
  prefecture,
  subsidyName,
  onSaved,
}: {
  defaultEmail?: string;
  prefecture: string;
  subsidyName: string;
  onSaved: (email: string) => void;
}) {
  const [submitted, setSubmitted] = useState(Boolean(defaultEmail));
  const [savedEmail, setSavedEmail] = useState<string>(defaultEmail ?? "");
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReminderValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      email: defaultEmail ?? "",
      consent: false,
    },
  });

  async function onSubmit(values: ReminderValues) {
    setApiError("");
    try {
      await submitLead({
        email: values.email,
        prefecture,
        consent: values.consent,
        source: `wizard_step6_reminder_${encodeURIComponent(subsidyName).slice(0, 40)}`,
      });
      setSavedEmail(values.email);
      setSubmitted(true);
      onSaved(values.email);
    } catch (err) {
      setApiError(
        err instanceof ApiError
          ? err.message
          : "リマインダー登録に失敗しました。時間をおいて再度お試しください。",
      );
    }
  }

  return (
    <section className="bg-white border border-border rounded-[10px] p-5 space-y-3">
      <h3 className="text-[14px] font-bold text-navy">
        申請期限リマインダーを受け取る
      </h3>
      <p className="text-[12px] text-text-muted leading-relaxed">
        メールアドレスをご登録いただくと、{subsidyName}の締切前や制度更新のタイミングで
        月1回程度お知らせを配信します。配信停止はいつでも可能です。
      </p>

      {submitted ? (
        <div className="bg-[var(--hc-primary-muted)] border border-[var(--hc-primary-border)] rounded-[10px] p-4 text-[13px] text-navy">
          <strong>✓ 登録完了</strong>：{savedEmail} 宛に、締切前リマインダーを送信します。
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
          <div>
            <label htmlFor="reminder-email" className="block text-[12px] text-text-muted mb-1">
              メールアドレス
            </label>
            <input
              id="reminder-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              {...register("email")}
              className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] bg-white focus:outline-none focus:border-primary"
              placeholder="mail@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-[12px] text-error">{errors.email.message}</p>
            )}
          </div>

          <label className="flex items-start gap-2 text-[12px] text-text-muted leading-relaxed">
            <input
              type="checkbox"
              {...register("consent")}
              className="mt-0.5 accent-primary"
            />
            <span>
              <a href="/about" className="text-primary hover:underline">プライバシーポリシー</a>
              に同意し、補助金のリマインダー配信を受け取ります。
            </span>
          </label>
          {errors.consent && (
            <p className="text-[12px] text-error">{errors.consent.message}</p>
          )}

          {apiError && <p className="text-[12px] text-error">{apiError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-60"
          >
            {isSubmitting ? "登録中..." : "リマインダーを登録"}
          </button>
        </form>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------
 *  施工依頼CTA
 * ------------------------------------------------------------------ */

function ContactMultikCard({
  company,
  subsidy,
  estimate,
}: {
  company: CompanyInfo;
  subsidy: SubsidySelection;
  estimate: EstimateSnapshot;
}) {
  const [sent, setSent] = useState(false);

  const mailtoHref = useMemo(
    () => buildMailto({ company, subsidy, estimate }),
    [company, subsidy, estimate],
  );

  function handleClick() {
    window.location.href = mailtoHref;
    // メールクライアント起動後にUIを切替（戻ってきた時用）
    window.setTimeout(() => setSent(true), 500);
  }

  async function handleCopyBody() {
    try {
      await navigator.clipboard.writeText(
        buildMailBody({ company, subsidy, estimate }),
      );
      setSent(true);
      window.setTimeout(() => setSent(false), 3000);
    } catch {
      // noop
    }
  }

  return (
    <section className="bg-navy text-white rounded-[10px] p-6 space-y-3">
      <h3
        className="text-[16px] font-bold"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        マルチックに施工を依頼する
      </h3>
      <p className="text-[13px] text-white/75 leading-relaxed">
        ここまでの入力内容と見積もりIDをまとめたメールを{" "}
        <span className="font-medium text-white">{MULTIK_CONTACT_EMAIL}</span> 宛に送信します。
        担当者より2営業日以内にメールでご返信します（電話営業は行いません）。
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
        >
          メールクライアントで送信する
        </button>
        <button
          type="button"
          onClick={handleCopyBody}
          className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] border border-white/40 bg-transparent text-white font-semibold hover:bg-white/10 transition"
        >
          {sent ? "本文をコピーしました" : "本文をクリップボードにコピー"}
        </button>
      </div>

      <p className="text-[11px] text-white/60 leading-relaxed pt-2 border-t border-white/10">
        送信先: {MULTIK_CONTACT_EMAIL} ／ 件名・本文は自動生成されます。送信前に内容をご確認ください。
      </p>
    </section>
  );
}

function buildMailto({
  company,
  subsidy,
  estimate,
}: {
  company: CompanyInfo;
  subsidy: SubsidySelection;
  estimate: EstimateSnapshot;
}): string {
  const subject = `【HOJYO CAME】施工依頼（${company.companyName} / ${subsidy.name}）`;
  const body = buildMailBody({ company, subsidy, estimate });
  return `mailto:${MULTIK_CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

function buildMailBody({
  company,
  subsidy,
  estimate,
}: {
  company: CompanyInfo;
  subsidy: SubsidySelection;
  estimate: EstimateSnapshot;
}): string {
  return [
    "マルチック株式会社 御中",
    "",
    "HOJYO CAME のウィザードから施工依頼を送信します。",
    "以下の内容をご確認のうえ、現場調査日程のご相談をお願いいたします。",
    "",
    "--- 申込会社 ---",
    `会社名: ${company.companyName}`,
    `代表者名: ${company.representativeName}`,
    `住所: ${company.prefecture} ${company.address}`,
    `業種: ${company.industry}`,
    `従業員数: ${company.employees}名`,
    company.annualRevenue ? `年商: ${company.annualRevenue.toLocaleString("ja-JP")}円` : "",
    "",
    "--- 申請予定の補助金 ---",
    `${subsidy.name}（上限 ${Math.round(subsidy.rateMax * 100)}% / 最大 ${subsidy.maxAmount.toLocaleString(
      "ja-JP",
    )}円）`,
    "",
    "--- 見積もり ---",
    `見積ID: ${estimate.id}`,
    `合計（税抜）: ${estimate.totalBeforeSubsidy.toLocaleString("ja-JP")}円`,
    `うち工事費: ${estimate.installationCost.toLocaleString("ja-JP")}円`,
    `うちネットワーク構築費: ${estimate.networkSetupCost.toLocaleString("ja-JP")}円`,
    `補助金適用: -${estimate.subsidyAmount.toLocaleString("ja-JP")}円`,
    `自己負担（試算）: ${estimate.selfPayment.toLocaleString("ja-JP")}円`,
    "",
    "ご返信お待ちしております。",
    "",
    "—— このメールは HOJYO CAME ウィザードから自動生成されました。",
  ]
    .filter((l) => l !== null)
    .join("\n");
}
