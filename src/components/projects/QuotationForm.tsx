"use client";

import { useState } from "react";
import { submitQuotation, ApiError } from "@/lib/api";

interface QuotationFormProps {
  projectId: string;
  onSubmit: () => void;
}

export default function QuotationForm({ projectId, onSubmit }: QuotationFormProps) {
  const [amount, setAmount] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    const daysNum = Number(durationDays);

    if (amountNum <= 0) {
      setError("見積金額を正しく入力してください。");
      return;
    }
    if (daysNum <= 0) {
      setError("工期を正しく入力してください。");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await submitQuotation(projectId, {
        amount: amountNum,
        duration_days: daysNum,
        note: note || undefined,
      });
      onSubmit();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "見積もりの送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-[10px] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="q-amount" className="block text-sm font-medium text-text mb-1.5">
          見積金額（円）
        </label>
        <input
          id="q-amount"
          type="number"
          required
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="3000000"
          className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="q-duration" className="block text-sm font-medium text-text mb-1.5">
          工期（日間）
        </label>
        <input
          id="q-duration"
          type="number"
          required
          min={1}
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          placeholder="14"
          className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="q-note" className="block text-sm font-medium text-text mb-1.5">
          備考
        </label>
        <textarea
          id="q-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="特記事項があればご記入ください"
          className="w-full rounded-[10px] border-[1.5px] border-border bg-bg-card px-3.5 py-3 text-[16px] text-text placeholder:text-text2 focus:outline-none focus:border-primary focus:shadow-[var(--portal-focus-ring)] transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          見積書（ファイル）
        </label>
        <div className="rounded-[10px] border-[1.5px] border-dashed border-border bg-bg-surface px-4 py-6 text-center text-sm text-text2">
          ファイルアップロードは今後対応予定です
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full text-center text-sm font-medium py-3 rounded-[10px] bg-accent text-white hover:bg-accent/90 transition-colors ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {loading ? "送信中..." : "見積もりを送信"}
      </button>
    </form>
  );
}
