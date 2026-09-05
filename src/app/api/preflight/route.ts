import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CertificateSetup, Template } from "@/models";
import { calculateSmartFit } from "@/services/certificate-engine/smart-fit";
import { CertificateElement } from "@/types/template";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { setupId, rows } = await req.json();
    if (!setupId || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "setupId and rows array required" }, { status: 400 });
    }

    const setup = await CertificateSetup.findById(setupId);
    if (!setup) return NextResponse.json({ error: "Setup not found" }, { status: 404 });

    const template = await Template.findById(setup.templateId);
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const elements = template.elements as CertificateElement[];
    let readyCount = 0;
    let wrappedCount = 0;
    let fontReducedCount = 0;
    let errorCount = 0;

    const rowResults = rows.map((data: Record<string, unknown>, index: number) => {
      let rowStatus: "ready" | "wrapped" | "font_reduced" | "overflow_error" = "ready";
      const elementDiagnostics = [];

      for (const el of elements) {
        if (el.type === "text" || el.type === "variable") {
          let rawText = el.content || "";
          if (el.type === "variable" && el.variableKey) {
            rawText = String(data[el.variableKey] ?? rawText);
          }

          rawText = rawText.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => String(data[key] ?? `{{${key}}}`));

          const fit = calculateSmartFit(rawText, {
            fontSize: el.style?.fontSize || 24,
            fontFamily: el.style?.fontFamily || "Helvetica",
            fontWeight: el.style?.fontWeight || 400,
            maxWidth: el.position.width,
            maxLines: el.smartFit?.maxLines || 2,
            minFontSize: el.smartFit?.minFontSize || 14,
            wordWrap: el.smartFit?.wordWrap ?? true,
          });

          elementDiagnostics.push({
            id: el.id,
            variableKey: el.variableKey,
            text: rawText,
            fit,
          });

          if (fit.actionTaken === "error") rowStatus = "overflow_error";
          else if (fit.actionTaken === "font_reduced" && rowStatus !== "overflow_error") rowStatus = "font_reduced";
          else if (fit.actionTaken === "wrapped" && rowStatus === "ready") rowStatus = "wrapped";
        }
      }

      if (rowStatus === "ready") readyCount++;
      else if (rowStatus === "wrapped") wrappedCount++;
      else if (rowStatus === "font_reduced") fontReducedCount++;
      else if (rowStatus === "overflow_error") errorCount++;

      return {
        rowNumber: index + 1,
        studentName: String(data.student_name || data.name || `Row ${index + 1}`),
        data,
        status: rowStatus,
        diagnostics: elementDiagnostics,
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        total: rows.length,
        ready: readyCount,
        wrapped: wrappedCount,
        fontReduced: fontReducedCount,
        errors: errorCount,
      },
      rows: rowResults,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Preflight error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
