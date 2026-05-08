import { NextResponse } from "next/server";
import { generateDxItPdf } from "@/lib/templates/pdf-generator";
import type { GenerateRequest, TemplateCategory } from "@/lib/templates/types";

const SUPPORTED_CATEGORIES: TemplateCategory[] = ["DX_IT"];

export async function POST(request: Request) {
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.category || !body.profile?.company_name) {
    return NextResponse.json(
      { error: "category and profile.company_name are required" },
      { status: 400 }
    );
  }

  const cat = body.category.toUpperCase() as TemplateCategory;
  if (!SUPPORTED_CATEGORIES.includes(cat)) {
    return NextResponse.json(
      {
        error: `Category '${body.category}' is not yet supported for generation`,
        supported: SUPPORTED_CATEGORIES,
      },
      { status: 400 }
    );
  }

  const format = (body.format || "PDF").toUpperCase();
  if (format !== "PDF") {
    return NextResponse.json(
      { error: "Only PDF format is supported in Phase 1" },
      { status: 400 }
    );
  }

  try {
    const pdfBuffer = await generateDxItPdf({ ...body, category: cat });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="hojyocame_dx_it_application.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "PDF generation failed", detail: message },
      { status: 500 }
    );
  }
}
