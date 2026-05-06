"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchDocumentTemplates,
  generateDocument,
  requestDraftGeneration,
  type DocumentTemplate,
  type DraftGenerateResponse,
  type DraftSection,
  ApiError,
} from "@/lib/api";
import {
  detectDocumentTier,
  type CompanyInfo,
  type DocumentsSnapshot,
  type DraftSnapshot,
  type DraftSubsidyType,
  type EstimateSnapshot,
  type SubsidySelection,
  type Tier1DocStatus,
} from "./types";

interface Props {
  company: CompanyInfo;
  subsidy: SubsidySelection;
  estimate: EstimateSnapshot;
  documents?: DocumentsSnapshot;
  onBack: () => void;
  onNext: () => void;
  onUpdateDocuments: (docs: DocumentsSnapshot) => void;
}

export default function Step5Documents({
  company,
  subsidy,
  estimate,
  documents,
  onBack,
  onNext,
  onUpdateDocuments,
}: Props) {
  const { tier, draftType } = useMemo(() => detectDocumentTier(subsidy), [subsidy]);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-bold text-navy mb-1"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Step 5：申請書類の生成
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          選択いただいた <span className="font-medium text-navy">{subsidy.name}</span> の
          申請に必要な書類を準備します。
        </p>
      </div>

      {tier === "tier1" && (
        <Tier1Panel
          subsidyName={subsidy.name}
          company={company}
          estimate={estimate}
          documents={documents}
          onUpdateDocuments={onUpdateDocuments}
        />
      )}

      {tier === "tier2" && draftType && (
        <Tier2DraftPanel
          company={company}
          estimate={estimate}
          subsidy={subsidy}
          draftType={draftType}
          documents={documents}
          onUpdateDocuments={onUpdateDocuments}
        />
      )}

      {tier === "unknown" && (
        <UnknownTypePanel subsidyName={subsidy.name} />
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:border-primary transition"
        >
          Step 4 に戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
        >
          次へ（プレビュー）
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 *  Tier 1 — 神奈川県デジタル化支援
 *  POST /api/documents/generate で Word/Excel を実生成してダウンロード。
 *  Sprint 2 Part1（Task 1）で実装、Part2 のディスパッチャと統合済み。
 * ============================================================ */

const AUTO_FILL_LABEL: Record<DocumentTemplate["auto_fill_level"], string> = {
  full: "自動入力",
  partial: "一部手動",
  manual: "手動入力",
};

function Tier1Panel({
  subsidyName,
  company,
  estimate,
  documents,
  onUpdateDocuments,
}: {
  subsidyName: string;
  company: CompanyInfo;
  estimate: EstimateSnapshot;
  documents?: DocumentsSnapshot;
  onUpdateDocuments: (d: DocumentsSnapshot) => void;
}) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string>("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [genError, setGenError] = useState<string>("");

  const statusMap = useMemo(() => {
    const map = new Map<string, Tier1DocStatus>();
    (documents?.tier1Generated ?? []).forEach((s) => map.set(s.templateId, s));
    return map;
  }, [documents?.tier1Generated]);

  useEffect(() => {
    let active = true;
    setLoadingList(true);
    fetchDocumentTemplates({ subsidy_type: "kanagawa_digital" })
      .then((list) => {
        if (active) setTemplates(list);
      })
      .catch((err) => {
        if (!active) return;
        setListError(
          err instanceof ApiError
            ? err.message
            : "テンプレート一覧の取得に失敗しました。",
        );
      })
      .finally(() => {
        if (active) setLoadingList(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleGenerate(template: DocumentTemplate | "all") {
    const id = template === "all" ? "all" : template.id;
    setGeneratingId(id);
    setGenError("");
    try {
      const { blob, filename } = await generateDocument({
        estimate_id: estimate.id,
        subsidy_type: "kanagawa_digital",
        template_id: id,
        company_info: {
          name: company.companyName,
          representative_name: company.representativeName,
          address: company.address,
          prefecture: company.prefecture,
          industry: company.industry,
          employees: company.employees,
        },
      });
      downloadBlob(blob, filename);

      const timestamp = new Date().toISOString();
      const current = new Map(statusMap);
      const targets = template === "all" ? templates : [template];
      targets.forEach((t) => {
        current.set(t.id, {
          templateId: t.id,
          name: t.name,
          generated: true,
          generatedAt: timestamp,
        });
      });
      onUpdateDocuments({
        tier: "tier1",
        draft: documents?.draft,
        tier1Generated: Array.from(current.values()),
      });
    } catch (err) {
      setGenError(
        err instanceof ApiError
          ? err.message
          : "書類生成でエラーが発生しました。",
      );
    } finally {
      setGeneratingId(null);
    }
  }

  const generatedCount = Array.from(statusMap.values()).filter((s) => s.generated).length;

  return (
    <section className="bg-white border border-border rounded-[10px] p-5 space-y-4">
      <header>
        <h3 className="text-[14px] font-bold text-navy mb-1">
          Tier 1：テンプレート差込（{subsidyName}）
        </h3>
        <p className="text-[12px] text-text-muted leading-relaxed">
          様式1〜1-7（Word / Excel）に会社情報・製品情報・見積もりを差し込んで生成します。
          ダウンロードした書類は公式申請書として、押印・提出にそのままご利用いただけます。
        </p>
      </header>

      <div className="bg-[var(--hc-primary-muted)] border border-[var(--hc-primary-border)] rounded-[10px] p-4 text-[12px] text-navy leading-relaxed">
        <strong>⚠ ご注意</strong>：R8年度の公式様式を入手次第、同名ファイルへ差し替えます。
        現時点ではプレースホルダーテンプレートに差し込みを行っています。
        様式1-6（県外調達理由書）は AVTECH 製品で必須となる定型文を自動入力します。
      </div>

      {listError && <p className="text-[13px] text-error">{listError}</p>}

      {loadingList ? (
        <p className="text-[12px] text-text-muted">テンプレート一覧を読み込み中...</p>
      ) : (
        <div>
          <p className="text-[12px] text-text-muted mb-2">
            テンプレート一覧（{templates.length}件 / 生成済み {generatedCount}件）
          </p>
          <ul className="divide-y divide-border border border-border rounded-[10px] overflow-hidden text-[13px] bg-white">
            {templates.map((t) => {
              const status = statusMap.get(t.id);
              const isGenerating = generatingId === t.id;
              return (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-navy">{t.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-text-muted border border-border rounded px-1.5 py-0.5">
                        {t.format}
                      </span>
                      <span
                        className={`text-[10px] rounded px-1.5 py-0.5 ${
                          t.auto_fill_level === "full"
                            ? "bg-[var(--hc-primary-subtle)] text-primary"
                            : t.auto_fill_level === "partial"
                              ? "bg-[var(--hc-accent-subtle)] text-[color:var(--hc-accent)]"
                              : "bg-[var(--hc-text-subtle)] text-text-muted"
                        }`}
                      >
                        {AUTO_FILL_LABEL[t.auto_fill_level]}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">{t.description}</p>
                    {status?.generated && (
                      <p className="text-[11px] text-primary mt-0.5">
                        生成済み（{formatDate(status.generatedAt ?? "")}）
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerate(t)}
                    disabled={isGenerating}
                    className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-[8px] border border-primary text-primary font-medium hover:bg-[var(--hc-primary-subtle)] transition disabled:opacity-60"
                  >
                    {isGenerating
                      ? "生成中..."
                      : status?.generated
                        ? "再生成"
                        : "生成 & ダウンロード"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {genError && <p className="text-[13px] text-error">{genError}</p>}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleGenerate("all")}
          disabled={loadingList || templates.length === 0 || generatingId !== null}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-60"
        >
          {generatingId === "all" ? "ZIP生成中..." : "全書類を一括ダウンロード（ZIP）"}
        </button>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-[11px] text-text-muted leading-relaxed">
          <strong className="text-navy">添付書類チェックリスト</strong>：
          様式1-7 が自動でチェック状態を反映します。
          役員等名簿（様式1-5）・収支予算書（様式1-3）の自己資金欄は、
          ダウンロード後に申請者ご自身で入力してください。
        </p>
      </div>
    </section>
  );
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ============================================================
 *  Tier 2 — 持続化 / IT導入 / ものづくり（本タスク担当）
 * ============================================================ */

const DRAFT_TYPE_LABEL: Record<DraftSubsidyType, string> = {
  jizokuka: "小規模事業者持続化補助金",
  it_dounyu: "IT導入補助金",
  monodzukuri: "ものづくり補助金",
};

function Tier2DraftPanel({
  company,
  estimate,
  subsidy,
  draftType,
  documents,
  onUpdateDocuments,
}: {
  company: CompanyInfo;
  estimate: EstimateSnapshot;
  subsidy: SubsidySelection;
  draftType: DraftSubsidyType;
  documents?: DocumentsSnapshot;
  onUpdateDocuments: (d: DocumentsSnapshot) => void;
}) {
  const existingDraft =
    documents?.draft && documents.draft.subsidy_type === draftType
      ? documents.draft
      : undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  async function handleGenerate() {
    setError("");
    setLoading(true);
    try {
      const res: DraftGenerateResponse = await requestDraftGeneration({
        estimate_id: estimate.id,
        subsidy_type: draftType,
        company_info: {
          name: company.companyName,
          representative_name: company.representativeName,
          industry: company.industry,
          employees: company.employees,
          prefecture: company.prefecture,
          address: company.address,
          annual_revenue: company.annualRevenue,
        },
        business_description: businessDescription.trim() || undefined,
      });
      const snap: DraftSnapshot = {
        subsidy_type: res.subsidy_type,
        sections: res.sections,
        generated_at: res.generated_at,
        disclaimer: res.disclaimer,
        fallback: res.fallback,
      };
      onUpdateDocuments({
        tier: "tier2",
        draft: snap,
        tier1Generated: documents?.tier1Generated,
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "下書き生成でエラーが発生しました。しばらくしてから再度お試しください。",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copySection(sec: DraftSection) {
    try {
      await navigator.clipboard.writeText(sec.content);
      setCopiedTitle(sec.title);
      window.setTimeout(() => setCopiedTitle(null), 2500);
    } catch {
      setError("クリップボードへのコピーに失敗しました。");
    }
  }

  async function copyAll() {
    if (!existingDraft) return;
    const text = existingDraft.sections
      .map((s) => `■ ${s.title}\n\n${s.content}\n`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTitle("__all__");
      window.setTimeout(() => setCopiedTitle(null), 2500);
    } catch {
      setError("クリップボードへのコピーに失敗しました。");
    }
  }

  return (
    <section className="bg-white border border-border rounded-[10px] p-5 space-y-4">
      <header>
        <h3 className="text-[14px] font-bold text-navy mb-1">
          Tier 2：電子申請の回答案（下書き）生成 — {DRAFT_TYPE_LABEL[draftType]}
        </h3>
        <p className="text-[12px] text-text-muted leading-relaxed">
          {subsidy.name} は電子申請（紙様式なし）のため、テンプレート差込ではなく
          回答案テキストを AI が生成します。生成結果はそのまま電子申請にコピー＆ペーストできるよう、
          セクション別に整形されます。
        </p>
      </header>

      <div className="bg-accent-light border border-[var(--hc-accent-border)] rounded-[10px] p-4 text-[12px] text-navy leading-relaxed">
        <strong>⚠ ご確認ください</strong>：この下書きは参考用です。電子申請時にご自身で内容を確認・編集してください。
        虚偽の記述を含めず、実際の事業計画・数値に合わせて修正のうえご使用ください。
      </div>

      <div>
        <label
          htmlFor="biz-desc"
          className="block text-[12px] text-text-muted mb-1"
        >
          事業内容・追加文脈（任意 / 2000字まで）
        </label>
        <textarea
          id="biz-desc"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="例: 3店舗を運営。繁華街で夜間の万引き被害が年間50件発生。AVTECH 4Kカメラで顔認証を行い、被害を半減したい。"
          className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-primary"
        />
        <p className="mt-1 text-[11px] text-text-muted">
          会社情報・見積もりはすでに送信します。ここには AIが反映しにくい定性情報（被害実績・現場状況）を自由記述してください。
        </p>
      </div>

      {error && <p className="text-[13px] text-error">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-60"
        >
          {loading ? "生成中..." : existingDraft ? "下書きを再生成する" : "下書きを生成する"}
        </button>
        {existingDraft && (
          <button
            type="button"
            onClick={copyAll}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[8px] border border-border bg-white text-text font-medium hover:border-primary transition"
          >
            {copiedTitle === "__all__" ? "全文コピーしました" : "全セクションを一括コピー"}
          </button>
        )}
      </div>

      {existingDraft && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
            <p className="text-[12px] text-text-muted">
              生成日時: {formatDate(existingDraft.generated_at)}
              {existingDraft.fallback && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--hc-accent-subtle)] text-[color:var(--hc-accent)] text-[11px] font-medium">
                  フォールバック応答
                </span>
              )}
            </p>
          </div>

          {existingDraft.sections.map((sec) => (
            <article
              key={sec.title}
              className="border border-border rounded-[10px] p-4 bg-bg"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-semibold text-navy text-[14px]">{sec.title}</h4>
                  {sec.notes && (
                    <p className="text-[11px] text-text-muted mt-0.5">{sec.notes}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => copySection(sec)}
                  className="shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-[8px] border border-border bg-white text-[12px] text-text hover:border-primary hover:text-primary transition"
                  aria-label={`${sec.title} の本文をコピー`}
                >
                  {copiedTitle === sec.title ? "コピーしました" : "コピー"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-text">
{sec.content}
              </pre>
              {sec.max_chars && (
                <p className="mt-2 text-[11px] text-text-muted text-right">
                  目安字数: {sec.max_chars}字 / 現在: {sec.content.length}字
                </p>
              )}
            </article>
          ))}

          <p className="text-[11px] text-text-muted leading-relaxed pt-2">
            {existingDraft.disclaimer}
          </p>
        </div>
      )}
    </section>
  );
}

/* ============================================================
 *  その他の補助金（Tier 未定義）
 * ============================================================ */

function UnknownTypePanel({ subsidyName }: { subsidyName: string }) {
  return (
    <section className="bg-white border border-border rounded-[10px] p-5 space-y-3">
      <h3 className="text-[14px] font-bold text-navy">
        書類自動生成には未対応の補助金です
      </h3>
      <p className="text-[13px] text-text-muted leading-relaxed">
        {subsidyName} は現時点で HOJYO CAME の書類自動生成対応補助金（神奈川県デジタル化支援 /
        小規模事業者持続化補助金 / IT導入補助金 / ものづくり補助金）に含まれていません。
        お手続きにご不明点がある場合は
        <a
          href="mailto:contact@multik.jp"
          className="text-primary hover:underline mx-1"
        >
          contact@multik.jp
        </a>
        までお問い合わせください。公式サイトの手続きに沿ってご自身で作成いただくこともできます。
      </p>
    </section>
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
