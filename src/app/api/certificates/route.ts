import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate, CertificateSetup, Template, Counter, User, CertificateBatch } from "@/models";
import { generateCertificateEngine } from "@/services/certificate-engine";
import { uploadToCloudinary } from "@/services/storage";
import jwt from "jsonwebtoken";
import { CertificateElement } from "@/types/template";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; institutionId: string };
    const user = await User.findById(decoded.userId).populate("institutionId");
    if (!user || !user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const template = await Template.findById(setup.templateId);
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    // 1. Increment Atomic Counter
    const year = new Date().getFullYear();
    const prefix = (user.institutionId as unknown as { certificatePrefix?: string }).certificatePrefix || "CERT";
    
    const counter = await Counter.findOneAndUpdate(
      { institutionId: user.institutionId, year, prefix },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    const sequenceFormatted = String(counter.sequence).padStart(6, "0");
    const certificateNumber = `${prefix}-${year}-${sequenceFormatted}`;

    // 2. Execute Core Engine (Single source of truth)
    const renderResult = await generateCertificateEngine({
      backgroundUrl: template.backgroundUrl,
      elements: template.elements as CertificateElement[],
      data: {
        ...recipientData,
        program_text: setup.programText,
      },
      certificateNumber,
      width: template.width,
      height: template.height,
    });

    // 3. Upload Generated PDF & PNG to Cloudinary
    const folder = `institutions/${user.institutionId}/certificates/${year}`;
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
    const studentName = String(recipientData.student_name || recipientData.name || "Recipient");

    const certificate = await Certificate.create({
      institutionId: user.institutionId,
      setupId: setup._id,
      templateId: template._id,
      batchId: batchId || undefined,
      rowNumber: rowNumber || undefined,
      certificateNumber,
      verificationCodeHash: renderResult.verificationCodeHash,
      studentName,
      recipientData,
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

    // 5. Lightweight JSON Response (No heavy buffers returned over network)
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
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { institutionId: string };
    const certificates = await Certificate.find({ institutionId: decoded.institutionId })
      .populate("setupId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, certificates });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch certificates error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
