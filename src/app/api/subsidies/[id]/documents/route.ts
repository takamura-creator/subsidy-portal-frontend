import { NextResponse } from "next/server";
import subsidiesData from "@/data/subsidies.json";
import { DOCUMENT_REQUIREMENTS } from "@/lib/templates/template-data";

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

  const subsidy = subsidiesData.subsidies.find((s) => s.id === id);
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
  });
}
