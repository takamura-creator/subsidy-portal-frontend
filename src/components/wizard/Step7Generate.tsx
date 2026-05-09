"use client";

import { useEffect, useRef, useState } from "react";
import { useDraft } from "@/lib/useDraft";
import type { CompanyInfo, SubsidySelection } from "./types";

interface Props {
  company: CompanyInfo;
  subsidy: SubsidySelection;
  applicationId: string;
  hpExtracted: Record<string, string>;
  qaAnswers: Record<string, string>;
  existingDraftId?: string;
  onGenerated: (draftId: string) => void;
  onBack: () => void;
}

export default function Step7Generate({
  company,
  subsidy,
  applicationId,
  hpExtracted,
  qaAnswers,
  existingDraftId,
  onGenerated,
  onBack,
}: Props) {
  const { draft, loading, error, generate } = useDraft();
  const [retryCount, setRetryCount] = useState(0);
  const [forwarded, setForwarded] = useState(false);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (existingDraftId) {
      onGenerated(existingDraftId);
      return;
    }
    if (!draft && !loading && !generatingRef.current) {
      generatingRef.current = true;
      generate(applicationId, {
        subsidy_id: subsidy.id,
        subsidy_name: subsidy.name,
        company_name: company.companyName,
        industry: company.industry,
        // F2: business_description 未設定時のみ qaAnswers.business_content で補完
        // N6: ?? "" を削除。値が存在するときだけマージし、空文字でバックエンド判定を誤魔化さない
        company_info: {
          ...hpExtracted,
          ...(hpExtracted.business_description ? {} :
            qaAnswers.business_content ? { business_description: qaAnswers.business_content } : {}),
        },
        collected_answers: qaAnswers,
      }).finally(() => {
        generatingRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, existingDraftId]);

  useEffect(() => {
    if (draft && !loading && !forwarded) {
      setForwarded(true);
      onGenerated(draft.draft_id);
    }
  }, [draft, loading, forwarded, onGenerated]);

  function handleRetry() {
    setForwarded(false);
    setRetryCount(prev => prev + 1);
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        {loading && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <h2 className="text-lg font-bold text-navy mt-6">事業計画書を生成しています...</h2>
            <p className="text-[13px] text-text-muted mt-2">
              AIが各章を順番に作成しています。通常30秒〜1分ほどかかります。
            </p>
            <div className="mt-6 space-y-2 max-w-sm mx-auto">
              {["企業概要", "現状の課題", "導入内容", "期待される効果", "実施スケジュール", "賃上げ計画"].map((title, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px]">
                  <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
                  <span className="text-text-muted">第{i + 1}章: {title}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {error && !loading && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 max-w-md mx-auto">
              {error}
            </div>
            <button
              onClick={handleRetry}
              className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              再試行
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
