import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate, Institution } from "@/models";
import crypto from "crypto";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    await dbConnect();
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: "Verification code required" }, { status: 400 });
    }

    const verificationCodeHash = crypto.createHash("sha256").update(code).digest("hex");
    const certificate = await Certificate.findOne({
      $or: [
        { verificationCodeHash },
        { verificationToken: code },
        { certificateNumber: code },
      ],
    })
      .populate("institutionId")
      .populate("setupId");

    if (!certificate) {
      return NextResponse.json({ verified: false, message: "Certificate not found or invalid code" }, { status: 404 });
    }

    const inst = certificate.institutionId as unknown as typeof Institution.prototype;

    return NextResponse.json({
      verified: true,
      status: certificate.status,
      certificateNumber: certificate.certificateNumber,
      studentName: certificate.studentName,
      issuedAt: certificate.issuedAt,
      pdfUrl: certificate.pdfUrl?.startsWith("data:") ? `/api/certificates/${certificate._id}/pdf` : certificate.pdfUrl,
      pngUrl: certificate.pngUrl?.startsWith("data:") ? `/api/certificates/${certificate._id}/png` : certificate.pngUrl,
      recipientData: certificate.recipientData,
      institution: {
        name: inst.name,
        code: inst.code,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Verification error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
