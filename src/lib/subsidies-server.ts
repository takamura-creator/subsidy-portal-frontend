/**
 * 補助金データのサーバー側ローダー。
 *
 * - `backend/data/subsidies.json` をビルド時に `fs.readFileSync` で読み込む
 * - Turbopack は Next.js プロジェクトルート外の JSON import を拒否するため、
 *   `fs` + 絶対パス方式を採用（ビルド時・サーバーランタイム両方で動作）
 * - Server Component / `generateStaticParams` / `generateMetadata` からのみ使用可
 *   （クライアント側では `fetchSubsidy()` を使うこと）
 *
 * Sprint 4 Task 0: `/subsidies/[id]` を Server Component 化するために新設。
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Subsidy } from "./api";

type SubsidiesJson = { subsidies: Subsidy[] };

// process.cwd() は next build / next start の双方で frontend/ ディレクトリを指す。
// backend/data/subsidies.json は frontend/ の親 (subsidy_portal/) 配下にある。
const SUBSIDIES_PATH = join(process.cwd(), "..", "backend", "data", "subsidies.json");

let cache: Subsidy[] | null = null;

function loadSubsidies(): Subsidy[] {
  if (cache) return cache;
  const raw = readFileSync(SUBSIDIES_PATH, "utf8");
  const parsed = JSON.parse(raw) as SubsidiesJson;
  cache = parsed.subsidies ?? [];
  return cache;
}

/** 全補助金を返す（sitemap / 一覧 SSG 用）。 */
export function getAllSubsidies(): Subsidy[] {
  return loadSubsidies();
}

/** ID から補助金を取得。該当なしは `undefined`（Server Component で `notFound()` を呼ぶ）。 */
export function getSubsidyById(id: string): Subsidy | undefined {
  return loadSubsidies().find((s) => s.id === id);
}

/** `generateStaticParams` 用: 全補助金 ID のリストを返す。 */
export function getAllSubsidyIds(): string[] {
  return loadSubsidies().map((s) => s.id);
}
