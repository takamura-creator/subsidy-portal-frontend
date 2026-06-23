"use client";

import { useState } from "react";
import Link from "next/link";
import { createEstimate, generateEstimatePdf, ApiError } from "@/lib/api";
import type {
  CompanyInfo,
  EstimateSnapshot,
  ProductSelection,
  SubsidySelection,
} from "./types";

interface Props {
  company: CompanyInfo;
  subsidy: SubsidySelection;
  products: ProductSelection[];
  estimate?: EstimateSnapshot;
  onBack: () => void;
  onSaved: (estimate: EstimateSnapshot) => void;
  onNext?: () => void;
}

export default function Step4Estimate({
  company,
  subsidy,
  products,
  estimate,
  onBack,
  onSaved,
  onNext,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 見積り前のローカル試算（バックエンド routers/estimates.py と同じロジック）
  // 設置費用の単価（バックエンドの _load_installation_costs() と一致させる）
  const INSTALL_UNIT_COST = { ipCamera: 30000, analogCamera: 30000, nvr: 50000, networkSetup: 50000 };
  const productSubtotal = products.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const ipCount = products
    .filter((p) => p.categoryId.startsWith("ip-camera"))
    .reduce((s, p) => s + p.quantity, 0);
  const analogCount = products
    .filter((p) => p.categoryId.startsWith("analog-camera"))
    .reduce((s, p) => s + p.quantity, 0);
  const nvrCount = products
    .filter((p) => p.categoryId.startsWith("nvr") || p.categoryId === "xvr")
    .reduce((s, p) => s + p.quantity, 0);
  const localInstallCost =
    ipCount * INSTALL_UNIT_COST.ipCamera +
    analogCount * INSTALL_UNIT_COST.analogCamera +
    nvrCount * INSTALL_UNIT_COST.nvr;
  const localNetworkSetup =
    ipCount + analogCount + nvrCount > 0 ? INSTALL_UNIT_COST.networkSetup : 0;
  const localTotalBeforeSubsidy = productSubtotal + localInstallCost + localNetworkSetup;

  // 自治会向け補助金は max_amount を「1台あたり上限」として扱い、台数を掛ける
  const totalCameraCount = ipCount + analogCount;
  const isJichikaiSubsidy = subsidy.draftSubsidyType === "jichitai_bouhan";
  const effectiveMaxAmount = isJichikaiSubsidy
    ? subsidy.maxAmount * Math.max(1, totalCameraCount)
    : subsidy.maxAmount;

  const estSubsidy = Math.round(localTotalBeforeSubsidy * (subsidy.rateMax ?? 0));
  const appliedSubsidy = Math.min(effectiveMaxAmount, estSubsidy);
  const localSelf = Math.max(0, localTotalBeforeSubsidy - appliedSubsidy);

  async function handleGenerate() {
    setError("");
    setGenerating(true);
    try {
      const ipCount = products
        .filter((p) => p.categoryId.startsWith("ip-camera"))
        .reduce((s, p) => s + p.quantity, 0);
      const analogCount = products
        .filter((p) => p.categoryId.startsWith("analog-camera"))
        .reduce((s, p) => s + p.quantity, 0);
      const nvrCount = products
        .filter((p) => p.categoryId.startsWith("nvr") || p.categoryId === "xvr")
        .reduce((s, p) => s + p.quantity, 0);

      const res = await createEstimate({
        subsidy_id: subsidy.id,
        items: products.map((p) => ({
          product_id: p.productId,
          quantity: p.quantity,
          product_name: p.name,
        })),
        ip_camera_count: ipCount,
        analog_camera_count: analogCount,
        nvr_count: nvrCount,
        subsidy_rate: subsidy.rateMax ?? undefined,
        subsidy_max: subsidy.maxAmount,
        company_name: company.companyName,
      });
      const snap: EstimateSnapshot = {
        id: res.id,
        totalBeforeSubsidy: res.total_before_subsidy,
        subsidyAmount: res.subsidy_amount,
        selfPayment: res.self_payment,
        installationCost: res.installation_cost,
        networkSetupCost: res.network_setup_cost,
        createdAt: res.created_at,
      };
      onSaved(snap);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "見積もりの生成に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!estimate) return;
    setPdfLoading(true);
    setError("");
    try {
      const { blob, extension } = await generateEstimatePdf(estimate.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `estimate_${estimate.id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (extension === "html") {
        setError("PDFエンジン未準備のため一時的にHTML版を出力しました。ブラウザで開いて印刷→PDF保存をご利用ください。");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "PDFの取得に失敗しました。");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-bold text-navy mb-1"
          style={{ fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}
        >
          Step 4：見積もり自動生成
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          選択いただいた内容で見積もりを生成します。補助金適用後の自己負担額も試算されます。
        </p>
      </div>

      {/* サマリー */}
      <section className="bg-white border border-border rounded-[10px] p-5 space-y-3">
        <SummaryRow label="申込会社" value={`${company.companyName}（${company.prefecture} / ${company.industry}）`} />
        <SummaryRow label="利用する補助金" value={`${subsidy.name}（上限 ${subsidy.rateMax != null ? `${Math.round(subsidy.rateMax * 100)}%` : "—"} / 最大 ${subsidy.maxAmount.toLocaleString("ja-JP")}円）`} />
        <div>
          <p className="text-[12px] text-text-muted mb-1">製品構成（{products.length}品目）</p>
          <ul className="text-[13px] text-text space-y-0.5">
            {products.map((p) => (
              <li key={p.productId} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-text-muted">
                  × {p.quantity}（{(p.unitPrice * p.quantity).toLocaleString("ja-JP")}円）
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 試算 or 確定見積 */}
      {estimate ? (
        <section className="bg-[var(--hc-primary-subtle)] border border-[var(--hc-primary-border)] rounded-[10px] p-5 space-y-2 text-[14px]">
          {/* 正式見積ではなく参考概算であることを明示 */}
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-[14px] font-bold text-navy">概算見積もり（参考値）</h3>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "var(--hc-accent)",
              background: "rgba(202,138,4,0.1)", border: "1px solid rgba(202,138,4,0.3)",
              borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap", alignSelf: "center",
            }}>参考値のみ・見積合わせ不可</span>
          </div>
          <PriceRow label="製品＋工事＋ネットワーク合計（税抜）" value={estimate.totalBeforeSubsidy} />
          <PriceRow label="うち工事費" value={estimate.installationCost} muted />
          <PriceRow label="うちネットワーク構築費" value={estimate.networkSetupCost} muted />
          <PriceRow label={`${subsidy.name} 補助金適用（試算）`} value={-estimate.subsidyAmount} accent />
          <div className="border-t border-border my-2" />
          <PriceRow label="自己負担額（試算）" value={estimate.selfPayment} bold />

          {/* 補助金適用範囲の注記 */}
          <div style={{
            marginTop: 12, padding: "10px 12px",
            background: "rgba(202,138,4,0.06)", border: "1px solid rgba(202,138,4,0.2)",
            borderRadius: 8, fontSize: 11, color: "var(--hc-text-muted)", lineHeight: 1.7,
          }}>
            <p style={{ fontWeight: 700, color: "var(--hc-accent)", marginBottom: 4 }}>
              ⚠️ 補助金適用額について
            </p>
            <ul style={{ margin: 0, paddingLeft: 14 }}>
              <li>上記は補助率上限を単純適用した<strong>試算値</strong>です。実際の補助金額は審査・採択結果により異なります。</li>
              <li>補助対象経費の範囲は補助金制度ごとに異なります。例えば <strong>業務改善助成金</strong> は機器・設備が主な対象で、<strong>工事費・ネットワーク構築費は対象外もしくは限定対応</strong> の制度です。<strong>本試算では総額に補助率上限を機械的に適用しており、実際の対象経費の按分計算は反映していません。</strong></li>
              <li>補助金の上限額・加点条件・申請時期によって受給額は変動します。</li>
              <li>正確な補助金額は申請前に<strong>所管機関または専門家</strong>にご確認ください。</li>
            </ul>
          </div>
        </section>
      ) : (
        <section className="bg-bg border border-border rounded-[10px] p-5 space-y-2 text-[14px]">
          <h3 className="text-[14px] font-bold text-navy mb-2">簡易試算（未確定）</h3>
          <PriceRow label="製品小計" value={productSubtotal} />
          <PriceRow label={`${subsidy.name} 適用（概算）`} value={-appliedSubsidy} accent />
          <div className="border-t border-border my-2" />
          <PriceRow label="自己負担額（概算）" value={localSelf} bold />
          <p className="text-[11px] text-text-muted leading-relaxed mt-2">
            ※ 工事費・ネットワーク費は「見積もりを生成」ボタンで確定値を算出します。
          </p>
        </section>
      )}

      {error && <p className="text-[13px] text-error">{error}</p>}

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:border-primary transition"
        >
          戻る
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-60"
          >
            {generating ? "生成中..." : estimate ? "再生成する" : "見積もりを生成する"}
          </button>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!estimate || pdfLoading}
              title={!estimate ? "まず「見積もりを生成する」を押してください" : undefined}
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-accent text-white font-semibold hover:bg-[var(--hc-accent-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pdfLoading ? "PDF準備中..." : "概算書PDFをダウンロード"}
            </button>
            {!estimate && (
              <span className="text-[11px] text-text-muted">
                先に「見積もりを生成する」を押してください
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 次のステップへ */}
      {estimate && onNext && (
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-[12px] text-text-muted leading-relaxed max-w-[520px]">
            見積もりが確定しました。次は Step 5 で申請書類（補助金種別に応じたテンプレート差込
            または電子申請の下書きテキスト）を生成します。
          </div>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
          >
            次へ（申請書類生成）
          </button>
        </div>
      )}
      <div className="pt-3">
        <Link
          href="/my/estimates"
          className="inline-block text-[12px] text-text-muted hover:text-primary"
        >
          見積もり一覧を見る →
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-text-muted">{label}</p>
      <p className="text-[14px] text-navy font-medium">{value}</p>
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted,
  accent,
  bold,
}: {
  label: string;
  value: number;
  muted?: boolean;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-text-muted text-[12px] pl-4" : "text-text"}>{label}</span>
      <span
        className={
          accent
            ? "text-[color:var(--hc-accent)] font-semibold"
            : bold
              ? "text-primary font-bold text-[16px]"
              : "text-navy font-semibold"
        }
      >
        {value.toLocaleString("ja-JP")}円
      </span>
    </div>
  );
}
