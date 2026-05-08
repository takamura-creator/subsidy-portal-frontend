import { NextResponse } from "next/server";
import { TEMPLATES } from "@/lib/templates/template-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const key = category.toUpperCase();
  const template = TEMPLATES[key];

  if (!template) {
    return NextResponse.json(
      { error: "Template not found", available: Object.keys(TEMPLATES) },
      { status: 404 }
    );
  }

  return NextResponse.json(template);
}
