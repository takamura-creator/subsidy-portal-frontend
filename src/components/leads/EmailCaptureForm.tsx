"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitLead, ApiError } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

const schema = z.object({
  email: z.string().min(1, "メールアドレスを入力してください").email("メールアドレスの形式が正しくありません"),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  consent: z.boolean().refine((v) => v === true, {
    message: "プライバシーポリシーへの同意が必要です",
  }),
});

type FormValues = z.infer<typeof schema>;

type Variant = "a" | "b" | "c";

interface Props {
  /** 初期値の都道府県（エリア外判定時などで渡す） */
  defaultPrefecture?: string;
  /** コピーのA/B/C分岐 */
  variant?: Variant;
  /** 設置位置の識別子（メール配信バックエンドに渡される） */
  source?: string;
  /** コンパクトな見た目（LP埋め込み用） */
  compact?: boolean;
}

const HEADLINES: Record<Variant, (pref?: string) => string> = {
  a: () => "対応エリア外です。お住まいの県の補助金情報を月1回お届けします",
  b: (pref) => `${pref ?? "お住まいの県"}は現在施工対応外です。制度更新・近隣県新着を無料配信`,
  c: () => "エリア拡大時に最優先でご案内します",
};

export default function EmailCaptureForm({
  defaultPrefecture,
  variant = "a",
  source = "lp_generic",
  compact = false,
}: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      prefecture: defaultPrefecture ?? "",
      consent: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setApiError("");
    try {
      await submitLead({
        email: values.email,
        prefecture: values.prefecture,
        consent: values.consent,
        source,
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("送信に失敗しました。時間をおいて再度お試しください。");
      }
    }
  }

  if (submitted) {
    return (
      <div
        className={`bg-white border border-border rounded-[10px] ${compact ? "p-5" : "p-7"}`}
      >
        <h3
          className="text-lg font-bold text-navy mb-2"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          ご登録ありがとうございます
        </h3>
        <p className="text-[14px] text-text-muted leading-relaxed mb-4">
          月1回、登録いただいた都道府県の補助金新着・制度更新情報をお届けします。
          配信停止はメール下部のリンクからいつでも行えます。
        </p>
        <p className="text-[13px] text-text-muted">
          最新情報はこちらでも発信しています:
        </p>
        <div className="flex gap-3 mt-2 text-[13px]">
          <a
            href="https://x.com/HOJYOCAME"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            X（旧Twitter）
          </a>
          <a
            href="https://note.com/hojyocame"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            note
          </a>
        </div>
      </div>
    );
  }

  const headline = HEADLINES[variant](defaultPrefecture);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={`bg-white border border-border rounded-[10px] ${compact ? "p-5" : "p-7"}`}
      aria-label="エリア外補助金情報メール登録フォーム"
    >
      <h3
        className="text-lg font-bold text-navy mb-2"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {headline}
      </h3>
      <p className="text-[13px] text-text-muted leading-relaxed mb-5">
        メールアドレスと都道府県をご登録いただくと、対象の補助金の新着・締切情報を
        月1回メールでお送りします。
      </p>

      <div className="space-y-3">
        <div>
          <label htmlFor="lead-email" className="block text-[12px] text-text-muted mb-1">
            メールアドレス
          </label>
          <input
            id="lead-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
            className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] bg-white focus:outline-none focus:border-primary"
            placeholder="mail@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-[12px] text-error">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lead-pref" className="block text-[12px] text-text-muted mb-1">
            都道府県
          </label>
          <select
            id="lead-pref"
            {...register("prefecture")}
            aria-invalid={errors.prefecture ? "true" : "false"}
            className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] bg-white focus:outline-none focus:border-primary"
          >
            <option value="">選択してください</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.prefecture && (
            <p className="mt-1 text-[12px] text-error">{errors.prefecture.message}</p>
          )}
        </div>

        <label className="flex items-start gap-2 text-[12px] text-text-muted leading-relaxed">
          <input
            type="checkbox"
            {...register("consent")}
            aria-invalid={errors.consent ? "true" : "false"}
            className="mt-0.5 accent-primary"
          />
          <span>
            <a href="/about" className="text-primary hover:underline">
              プライバシーポリシー
            </a>
            に同意し、補助金情報のメール配信を受け取ります。
          </span>
        </label>
        {errors.consent && (
          <p className="text-[12px] text-error">{errors.consent.message}</p>
        )}
      </div>

      {apiError && (
        <p className="mt-3 text-[12px] text-error">{apiError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full inline-flex items-center justify-center px-5 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "送信中..." : "補助金情報を受け取る"}
      </button>
      <p className="mt-2 text-[11px] text-text-muted text-center">
        登録は無料。配信停止はいつでも可能です。
      </p>
    </form>
  );
}
