import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CertificateSetup, Template, User } from "@/models";
import { calculateSmartFit } from "@/services/certificate-engine/smart-fit";
import { formatCertificateDate } from "@/services/certificate-engine";
import { CertificateElement } from "@/types/template";
import { verifyAuthToken } from "@/lib/auth";

function normalizeRecipientData(raw: Record<string, unknown>): Record<string, unknown> {
  const norm: Record<string, unknown> = { ...raw };
  for (const [k, v] of Object.entries(raw)) {
    const cleanKey = k.toLowerCase().replace(/[\s\.\-]+/g, "_").trim();
    if (cleanKey.includes("date")) {
      norm[cleanKey] = formatCertificateDate(v);
    } else {
      norm[cleanKey] = v;
    }
    // Specific aliases
    if (cleanKey === "student_name" || cleanKey === "name") norm["student_name"] = v;
    if (cleanKey === "college_name" || cleanKey === "college") norm["college_name"] = v;
    if (cleanKey === "reg_no" || cleanKey === "registration_no") norm["reg_no"] = v;
    if (cleanKey === "start_date" || cleanKey === "from_date") norm["start_date"] = formatCertificateDate(v);
    if (cleanKey === "end_date" || cleanKey === "to_date") norm["end_date"] = formatCertificateDate(v);
    if (cleanKey === "domain" || cleanKey === "project_domain") norm["domain"] = v;
    if (cleanKey === "dept" || cleanKey === "department") norm["dept"] = v;
  }
  return norm;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await User.findById(auth.userId);
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }
    if (!user || !user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user.institutionId as any)?._id || user.institutionId;

    const { setupId, rows } = await req.json();
    if (!setupId || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "setupId and rows array required" }, { status: 400 });
    }

    const setup = await CertificateSetup.findById(setupId);
    if (!setup) return NextResponse.json({ error: "Setup not found" }, { status: 404 });

    let template = await Template.findById(setup.templateId);
    if (!template) {
      template = await Template.findOne({ institutionId }).sort({ createdAt: -1 });
      if (template) {
        await CertificateSetup.updateOne({ _id: setup._id }, { $set: { templateId: template._id } });
      }
    }
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const elements = template.elements as CertificateElement[];
    let readyCount = 0;
    let wrappedCount = 0;
    let fontReducedCount = 0;
    let errorCount = 0;

    const rowResults = rows.map((rawRow: Record<string, unknown>, index: number) => {
      let rowStatus: "ready" | "wrapped" | "font_reduced" | "overflow_error" = "ready";
      const data = normalizeRecipientData(rawRow);
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
    console.error("Preflight route error:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
