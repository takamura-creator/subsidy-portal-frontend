"use client";

import { useState } from "react";
import HomepageExtractorPanel from "./HomepageExtractorPanel";
import type { CompanyInfo, SubsidySelection } from "./types";

interface Props {
  company: CompanyInfo;
  subsidy: SubsidySelection;
  initialExtracted?: Record<string, string>;
  onBack: () => void;
  onNext: (extracted: Record<string, string>) => void;
}

export default function Step5HPExtract({ company, subsidy, initialExtracted, onBack, onNext }: Props) {
  const [extracted, setExtracted] = useState<Record<string, string>>(initialExtracted ?? {});
  const [confirmed, setConfirmed] = useState(!!initialExtracted && Object.keys(initialExtracted).length > 0);

  function handleExtracted(fields: Record<string, string>, fallback: boolean) {
    setExtracted(fields);
    setConfirmed(!fallback && Object.keys(fields).length > 0);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy">ホームページ情報の自動取得</h2>
        <p className="text-[13px] text-text-muted mt-1">
          ホームページから企業情報を自動取得し、事業計画書に反映します。
        </p>
      </div>

      <HomepageExtractorPanel
        websiteUrl={company.websiteUrl}
        subsidyId={subsidy.id}
        onExtracted={handleExtracted}
      />

      {Object.keys(extracted).length > 0 && (
        <div className="border border-border rounded-[10px] p-5">
          <h3 className="text-[14px] font-bold text-navy mb-3">取得結果の確認</h3>
          <p className="text-[12px] text-text-muted mb-3">
            以下の情報が事業計画書に反映されます。内容を確認してください。
          </p>
          <div className="space-y-2">
            {Object.entries(extracted).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3 text-[13px]">
                <span className="font-medium text-navy min-w-[120px]">{key}</span>
                <span className="text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!company.websiteUrl && (
        <div className="border border-amber-200 bg-amber-50 rounded-[10px] p-4">
          <p className="text-[13px] text-amber-800">
            ホームページURLが設定されていません。Step 1で入力するか、次のステップで手動入力してください。
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:bg-gray-50 transition"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={() => onNext(extracted)}
          className="ml-auto px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
        >
          {confirmed ? "確認して次へ" : "スキップして次へ"}
        </button>
      </div>
    </div>
  );
}
