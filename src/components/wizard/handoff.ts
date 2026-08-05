/**
 * 診断 → ウィザードの引き継ぎ（URLのみ）
 *
 * 保存先は既存のウィザード状態とまったく同じ localStorage キー・同じスキーマ
 * （src/app/my/wizard/page.tsx が読み書きする `{ step, state }`）。
 * 引き継ぎ専用の保存方式は新設しない。
 *
 * 【法務・2026-08-03】引き継いでよいのは「ユーザー自身が入力したURL」までとする。
 * 代表者名・住所などの個人情報は引き継ぎ経路（特に URL クエリ）に載せない。
 * 本モジュールは websiteUrl 以外を一切書き込まない。
 */
import { EMPTY_WIZARD_STATE, type WizardState } from "./types";

/** ウィザード状態の localStorage キー（wizard/page.tsx と同一） */
export const WIZARD_STORAGE_KEY = "hc_wizard_state_v2";

/** localStorage に載せる URL の長さ上限（異常値の混入防止） */
const MAX_URL_LENGTH = 500;

interface WizardSnapshot {
  step?: number;
  state?: Partial<WizardState>;
}

/** 値が入力済みか（文字列は空白のみを未入力扱い） */
function isFilled(value: unknown): boolean {
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return Number.isFinite(value);
  return value !== undefined && value !== null;
}

/**
 * ユーザーが手で作りかけた下書きかどうか。
 *
 * 守るべきは「ユーザーが自分で入力した内容」であって、本モジュールが自動保存した
 * URL ではない。websiteUrl 以外が何も入っていない状態＝前回の引き継ぎ結果とみなし、
 * 新しい診断URLで更新できるようにする（別URLで診断し直したのに古いURLが残る問題の是正）。
 */
function hasUserDraft(snapshot: WizardSnapshot): boolean {
  const state = snapshot.state ?? {};
  const company = state.company ?? {};
  const companyEntered = Object.entries(company).some(
    ([key, value]) => key !== "websiteUrl" && isFilled(value),
  );
  const progressed =
    Boolean(state.subsidy) ||
    (state.products?.length ?? 0) > 0 ||
    Boolean(state.estimate) ||
    Boolean(state.draftId) ||
    (typeof snapshot.step === "number" && snapshot.step > 1);
  return companyEntered || progressed;
}

/**
 * トップ診断で入力された URL をウィザード状態へ引き継ぐ（診断成功時のみ呼ぶ）。
 *
 * - http/https 以外・空・過大長は保存しない（何もしない＝手入力へ縮退）
 * - 作りかけの下書き（会社情報の入力あり／Step2以降へ進行済み）は上書きしない
 * - 自動保存しただけの URL は新しい診断URLで置き換える
 * - 保存済みデータが壊れている／localStorage が使えない場合も例外を投げない
 */
export function saveDiagnosedUrl(rawUrl: string): void {
  if (typeof window === "undefined") return;

  const url = rawUrl.trim();
  if (!url || url.length > MAX_URL_LENGTH) return;
  if (!/^https?:\/\/.+/i.test(url)) return;

  try {
    let snapshot: WizardSnapshot = {};
    const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          snapshot = parsed as WizardSnapshot;
        }
      } catch {
        // 破損データ: ウィザード側も復元不能として扱うため、空から作り直す
        snapshot = {};
      }
    }

    // ユーザーが作りかけた下書きは尊重する（上書きしない）
    if (hasUserDraft(snapshot)) return;

    const state = snapshot.state ?? {};
    const company = state.company ?? {};
    // 同じURLなら書き込まない（無用な localStorage 書き換えを避ける）
    if (typeof company.websiteUrl === "string" && company.websiteUrl.trim() === url) return;

    const next = {
      step: typeof snapshot.step === "number" ? snapshot.step : 1,
      state: {
        ...EMPTY_WIZARD_STATE,
        ...state,
        company: { ...company, websiteUrl: url },
      },
    };
    window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage 不可（プライベートモード・容量超過）→ 引き継がず手入力へ縮退
  }
}
