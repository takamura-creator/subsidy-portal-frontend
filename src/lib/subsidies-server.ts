/**
 * 補助金データのサーバー側ローダー。
 *
 * - `frontend/src/data/subsidies.json` をビルド時に静的 JSON import で読み込む
 *   - Vercel は frontend リポジトリのみを clone するため、`backend/data/` を
 *     ビルドコンテキストから参照できない（ENOENT）。`backend/data/subsidies.json`
 *     のスナップショットを `src/data/` に同梱する方針を採用（Sprint 4.5+ 修正）
 *   - データ更新時は `cp ../backend/data/subsidies.json src/data/subsidies.json`
 *     でスナップショットを更新し、別 PR で frontend 側に取り込む
 * - Server Component / `generateStaticParams` / `generateMetadata` からのみ使用可
 *   （クライアント側では `fetchSubsidy()` を使うこと）
 *
 * Sprint 4 Task 0: `/subsidies/[id]` を Server Component 化するために新設。
 */

import subsidiesJson from "@/data/subsidies.json";
import type { Subsidy } from "./api";

type SubsidiesJson = { subsidies: Subsidy[] };

const SUBSIDIES: Subsidy[] = (subsidiesJson as SubsidiesJson).subsidies ?? [];

/** 全補助金を返す（sitemap / 一覧 SSG 用）。 */
export function getAllSubsidies(): Subsidy[] {
  return SUBSIDIES;
}

/** ID から補助金を取得。該当なしは `undefined`（Server Component で `notFound()` を呼ぶ）。 */
export function getSubsidyById(id: string): Subsidy | undefined {
  return SUBSIDIES.find((s) => s.id === id);
}

/** `generateStaticParams` 用: 全補助金 ID のリストを返す。 */
export function getAllSubsidyIds(): string[] {
  return SUBSIDIES.map((s) => s.id);
}
