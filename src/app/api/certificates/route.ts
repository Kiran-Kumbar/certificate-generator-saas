import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate, CertificateSetup, Template, Counter, User, CertificateBatch } from "@/models";
import { generateCertificateEngine, formatCertificateDate, getAppBaseUrl } from "@/services/certificate-engine";
import { uploadToCloudinary } from "@/services/storage";
import { verifyAuthToken } from "@/lib/auth";
import { CertificateElement } from "@/types/template";

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
    if (!auth) return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });

    let user = await User.findById(auth.userId).populate("institutionId");
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email }).populate("institutionId");
    }
    if (!user) {
      user = await User.findOne().populate("institutionId");
    }
    if (!user || !user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user.institutionId as any)?._id || user.institutionId;

    const body = await req.json();
    const { setupId, recipientData, batchId, rowNumber } = body;

    if (!setupId || !recipientData) {
      return NextResponse.json({ error: "setupId and recipientData are required" }, { status: 400 });
    }

    // Idempotency check: Return existing certificate if already generated for this batch & row
    if (batchId && rowNumber) {
      const existingCert = await Certificate.findOne({ batchId, rowNumber });
      if (existingCert) {
        return NextResponse.json({
          success: true,
          certificateId: existingCert._id,
          certificateNumber: existingCert.certificateNumber,
          status: existingCert.status,
          pdfUrl: existingCert.pdfUrl,
          pngUrl: existingCert.pngUrl,
          reused: true,
        });
      }
    }

    const setup = await CertificateSetup.findById(setupId);
    if (!setup) return NextResponse.json({ error: "Certificate setup not found" }, { status: 404 });

    let template = await Template.findById(setup.templateId);
    if (!template) {
      template = await Template.findOne({ institutionId }).sort({ createdAt: -1 });
      if (template) {
        await CertificateSetup.updateOne({ _id: setup._id }, { $set: { templateId: template._id } });
      }
    }
    if (!template) return NextResponse.json({ error: "Certificate template not found" }, { status: 404 });

    // 1. Increment Atomic Counter
    const year = new Date().getFullYear();
    const prefix = (user.institutionId as unknown as { certificatePrefix?: string }).certificatePrefix || "CERT";
    
    const counter = await Counter.findOneAndUpdate(
      { institutionId, year, prefix },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    const sequenceFormatted = String(counter.sequence).padStart(6, "0");
    const certificateNumber = `${prefix}-${year}-${sequenceFormatted}`;

    // Normalize incoming Excel recipient data
    const normalizedData = normalizeRecipientData(recipientData);

    // 2. Execute Core Engine with normalized element positions
    const elements = ((template.elements || []) as CertificateElement[]).map((el) => {
      if (el.id === "el_student_name" && el.position && el.position.y >= 290) {
        return {
          ...el,
          position: { ...el.position, y: 280, height: 42 },
        };
      }
      return el;
    });

    const renderResult = await generateCertificateEngine({
      backgroundUrl: template.backgroundUrl,
      elements,
      data: {
        ...normalizedData,
        program_text: setup.programText,
      },
      certificateNumber,
      width: template.width,
      height: template.height,
      baseUrl: getAppBaseUrl(req),
    });

    // 3. Upload Generated PDF & PNG to Storage
    const folder = `institutions/${institutionId}/certificates/${year}`;
    const pdfUpload = await uploadToCloudinary(renderResult.pdfBuffer, {
      folder,
      filename: `${certificateNumber}`,
      resourceType: "raw",
    });

    const pngUpload = await uploadToCloudinary(renderResult.pngBuffer, {
      folder,
      filename: `${certificateNumber}`,
      resourceType: "image",
    });

    // 4. Save Certificate Document to MongoDB
    const studentName = String(normalizedData.student_name || normalizedData.name || "Recipient");

    const certificate = await Certificate.create({
      institutionId,
      setupId: setup._id,
      templateId: template._id,
      batchId: batchId || undefined,
      rowNumber: batchId ? rowNumber : undefined,
      certificateNumber,
      verificationToken: renderResult.verificationToken,
      verificationCodeHash: renderResult.verificationCodeHash,
      studentName,
      recipientData: normalizedData,
      pdfUrl: pdfUpload.url,
      pngUrl: pngUpload.url,
      status: "issued",
    });

    // Update batch counter if part of a bulk batch
    if (batchId) {
      await CertificateBatch.findByIdAndUpdate(batchId, {
        $inc: { processed: 1, successful: 1 },
      });
    }

    // 5. Lightweight JSON Response
    return NextResponse.json({
      success: true,
      certificateId: certificate._id,
      certificateNumber: certificate.certificateNumber,
      studentName: certificate.studentName,
      status: certificate.status,
      pdfUrl: certificate.pdfUrl,
      pngUrl: certificate.pngUrl,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Certificate issuance error";
    console.error("Certificate generation error:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
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

    const certificates = await Certificate.find({ institutionId })
      .populate("setupId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, certificates });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch certificates error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
