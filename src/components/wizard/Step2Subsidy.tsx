"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchSubsidies,
  checkArea,
  type Subsidy,
  type AreaCheckResponse,
  ApiError,
} from "@/lib/api";
import { isServicePrefecture } from "@/lib/constants";
import { filterCameraOnly } from "@/lib/subsidyFilters";   // F1: 共通モジュール（NG_SUBSIDY_IDS 除外済み）
import EmailCaptureForm from "@/components/leads/EmailCaptureForm";
import type { CompanyInfo, SubsidySelection } from "./types";
import subsidiesJson from "@/data/subsidies.json";

// バンドル同梱データ（バックエンドのデプロイ遅延による Step2 0件を防ぐ）
const BUNDLED_SUBSIDIES: Subsidy[] = (subsidiesJson as { subsidies: Subsidy[] }).subsidies ?? [];

function filterBundledForCompany(prefecture: string, industry: string): Subsidy[] {
  // backend 相当のフィルタ + filterCameraOnly を適用
  return filterCameraOnly(
    BUNDLED_SUBSIDIES.filter((s) => {
      const prefOk = !prefecture || s.prefecture === prefecture || s.prefecture === "全国" || s.pref_code === "00" || s.pref_code === "";
      return prefOk;
    }),
    industry,
  );
}

interface Props {
  company: CompanyInfo;
  selected?: SubsidySelection;
  onBack: () => void;
  onNext: (subsidy: SubsidySelection) => void;
}

export default function Step2Subsidy({ company, selected, onBack, onNext }: Props) {
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [area, setArea] = useState<AreaCheckResponse | null>(null);
  const [choice, setChoice] = useState<string>(selected?.id ?? "");

  useEffect(() => {
    let cancelled = false;
    // バンドルデータで即座に初期表示（API 待ち中も「0件」と表示しない）
    const bundled = filterBundledForCompany(company.prefecture, company.industry);
    setSubsidies(bundled);
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const [subRes, areaRes] = await Promise.allSettled([
          fetchSubsidies({ prefecture: company.prefecture }),
          checkArea(company.prefecture),
        ]);
        if (cancelled) return;
        if (subRes.status === "fulfilled") {
          const apiFiltered = filterCameraOnly(subRes.value.subsidies ?? [], company.industry);
          // API が古いデータを返した場合に備え、件数が多い方を採用
          setSubsidies(apiFiltered.length >= bundled.length ? apiFiltered : bundled);
        } else {
          // API 失敗時もバンドルデータで救う（loadError は表示しない）
          setSubsidies(bundled);
        }
        if (areaRes.status === "fulfilled") {
          setArea(areaRes.value);
        } else {
          // フォールバック: クライアント側判定
          setArea({
            in_service_area: isServicePrefecture(company.prefecture),
            prefecture: company.prefecture,
            service_prefectures: [
              "東京都","神奈川県","静岡県","埼玉県","千葉県","山梨県",
            ],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : "データの取得に失敗しました。",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [company.prefecture]);

  const inServiceArea = area?.in_service_area ?? isServicePrefecture(company.prefecture);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = subsidies.find((x) => x.id === choice);
    if (!s) return;
    onNext({
      id: s.id,
      name: s.name,
      category: s.category,
      maxAmount: s.max_amount,
      rateMax: s.rate_max,
      prefecture: s.prefecture,
      draftSubsidyType: s.draft_subsidy_type,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-bold text-navy mb-1"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Step 2：補助金選択
        </h2>
        <p className="text-[13px] text-text-muted leading-relaxed">
          {company.prefecture}で利用できる補助金から1つ選んでください。
          御社の業種・事業規模に該当するものが表示されています。
        </p>
      </div>

      {/* エリア判定バナー */}
      <AreaBanner
        prefecture={company.prefecture}
        inServiceArea={inServiceArea}
        servicePrefectures={area?.service_prefectures ?? []}
      />

      {loading ? (
        <p className="text-[13px] text-text-muted">読み込み中...</p>
      ) : loadError ? (
        <p className="text-[13px] text-error">{loadError}</p>
      ) : subsidies.length === 0 ? (
        <>
          <div className="hc-card-gradient rounded-[10px] p-5 text-[14px] text-text-muted">
            該当する補助金が見つかりませんでした。業種・都県の組み合わせに
            合致する補助金が現状未登録です。
            <Link href="/subsidies" className="text-primary hover:underline mx-1">
              補助金一覧
            </Link>
            から手動で確認するか、Step1 に戻って業種を変更してください。
          </div>
          <div className="flex justify-start pt-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:border-primary transition"
            >
              ← Step1 に戻る
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <ul className="space-y-2" role="radiogroup" aria-label="補助金選択">
            {subsidies.map((s) => (
              <li key={s.id}>
                <label
                  className={`block rounded-[10px] p-4 cursor-pointer transition hc-card-gradient ${
                    choice === s.id
                      ? "border-primary"
                      : "hover:border-primary/50"
                  }`}
                  style={
                    choice === s.id
                      ? { borderColor: "var(--hc-primary)", borderWidth: 2 }
                      : undefined
                  }
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="subsidy"
                      value={s.id}
                      checked={choice === s.id}
                      onChange={() => setChoice(s.id)}
                      className="mt-1 accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-[14px] text-navy">{s.name}</span>
                        <span className="text-[11px] bg-accent-light text-[color:var(--hc-accent)] px-2 py-0.5 rounded-full font-medium">
                          {s.category}
                        </span>
                      </div>
                      <div className="text-[12px] text-text-muted space-y-0.5">
                        <p>
                          補助率上限: {Math.round(s.rate_max * 100)}% ／ 上限額:{" "}
                          {s.max_amount.toLocaleString("ja-JP")}円
                        </p>
                        <p>締切: {s.deadline || "要確認"}</p>
                        {s.prefecture && <p>対象: {s.prefecture}</p>}
                      </div>
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:border-primary transition"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={!choice}
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ（製品選択）
            </button>
          </div>
        </form>
      )}

      {/* エリア外: メール獲得フォーム */}
      {!inServiceArea && (
        <div className="pt-6 border-t border-border">
          <h3
            className="text-[14px] font-bold text-navy mb-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            施工対応エリア外の方へ
          </h3>
          <p className="text-[13px] text-text-muted mb-3 leading-relaxed">
            マルチックの直接施工は6都県のみですが、{company.prefecture}の補助金情報は
            定期配信でお届けできます。見積もりウィザードは情報確認用として最後まで進められます。
          </p>
          <EmailCaptureForm
            defaultPrefecture={company.prefecture}
            variant="b"
            source="wizard_step2_out_of_area"
            compact
          />
        </div>
      )}
    </div>
  );
}

function AreaBanner({
  prefecture,
  inServiceArea,
  servicePrefectures,
}: {
  prefecture: string;
  inServiceArea: boolean;
  servicePrefectures: string[];
}) {
  if (inServiceArea) {
    return (
      <div
        role="status"
        className="bg-[var(--hc-primary-muted)] border border-[var(--hc-primary-border)] rounded-[10px] p-4 text-[13px] text-navy leading-relaxed"
      >
        <strong className="text-primary">施工対応エリア内</strong>：{prefecture}はマルチックの
        直接施工対応エリアです。補助金選定後にAVTECH製品の構成・見積もりまで進めます。
      </div>
    );
  }
  const list = servicePrefectures.length > 0 ? servicePrefectures.join("・") : "東京・神奈川・静岡・埼玉・千葉・山梨";
  return (
    <div
      role="status"
      className="bg-accent-light border border-[var(--hc-accent-border)] rounded-[10px] p-4 text-[13px] text-navy leading-relaxed"
    >
      <strong>施工対応エリア外</strong>：{prefecture}は現在、マルチックの直接施工対応外です。
      （対応エリア：{list}）見積もりウィザードは参考資料として最後まで進められますが、
      実際の施工は別の業者にご依頼いただく必要があります。
    </div>
  );
}
