import { NextResponse } from "next/server";
import { fetchSubsidy, ApiError } from "@/lib/api";
import subsidiesData from "@/data/subsidies.json";
import { DOCUMENT_REQUIREMENTS } from "@/lib/templates/template-data";

/**
 * 2026-09-15 注文書（frontend API切替）: 静的JSON直読みを廃止し、バックエンド
 * `/api/subsidies/{id}`（`fetchSubsidy`）を優先ソースにする。
 * - 404（該当補助金なし）はそのまま404として返す
 * - それ以外のAPI到達不能（ネットワーク・タイムアウト等）のみ同梱データにフォールバックし、
 *   レスポンスに `stale: true` を含める（呼び出し側で「古い可能性」表示に使える。
 *   黙って古いデータを返さないための明示フィールド）
 */
type BundledSubsidy = { id: string; name: string; category?: string };
const BUNDLED_SUBSIDIES: BundledSubsidy[] =
  (subsidiesData as { subsidies: BundledSubsidy[] }).subsidies ?? [];

function inferCategory(subsidy: { category?: string; name?: string }): string | null {
  const cat = subsidy.category?.toLowerCase() ?? "";
  const name = subsidy.name?.toLowerCase() ?? "";

  if (cat.includes("防犯") || name.includes("防犯")) return "CRIME_PREVENTION";
  if (cat.includes("dx") || cat.includes("it") || cat.includes("デジタル") || name.includes("dx") || name.includes("it") || name.includes("デジタル"))
    return "DX_IT";
  if (cat.includes("設備") || cat.includes("ものづくり") || name.includes("設備") || name.includes("ものづくり"))
    return "EQUIPMENT_INVESTMENT";

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let subsidy: BundledSubsidy | undefined;
  let stale = false;

  try {
    subsidy = await fetchSubsidy(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return NextResponse.json({ error: "Subsidy not found" }, { status: 404 });
    }
    // ネットワークエラー・タイムアウト等のみ同梱データにフォールバック
    subsidy = BUNDLED_SUBSIDIES.find((s) => s.id === id);
    stale = true;
  }

  if (!subsidy) {
    return NextResponse.json({ error: "Subsidy not found" }, { status: 404 });
  }

  const category = inferCategory(subsidy);
  const documents = category ? DOCUMENT_REQUIREMENTS[category] ?? [] : [];

  return NextResponse.json({
    subsidy_id: subsidy.id,
    subsidy_name: subsidy.name,
    category,
    documents,
    stale,
  });
}
