import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate, CertificateSetup, Template, User } from "@/models";
import { generateCertificateEngine, getAppBaseUrl, formatStudentNameWithSalutation } from "@/services/certificate-engine";
import { uploadToCloudinary, deleteFromCloudinary } from "@/services/storage";
import { verifyAuthToken } from "@/lib/auth";
import { CertificateElement } from "@/types/template";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const cert = await Certificate.findById(id).populate("institutionId").populate("setupId");
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

    return NextResponse.json({ success: true, certificate: cert });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error fetching certificate";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const cert = await Certificate.findById(id);
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

    const body = await req.json();
    const {
      studentName,
      status,
      recipientData,
    } = body;

    // Merge updated recipientData
    const updatedRecipientData: Record<string, unknown> = {
      ...(cert.recipientData || {}),
      ...(recipientData || {}),
    };

    if (studentName) {
      updatedRecipientData["student_name"] = formatStudentNameWithSalutation(studentName);
    }

    const finalStudentName = formatStudentNameWithSalutation(
      studentName || String(updatedRecipientData["student_name"] || cert.studentName)
    );

    // Update fields in DB
    cert.studentName = finalStudentName;
    cert.recipientData = updatedRecipientData;
    if (status && ["issued", "revoked", "draft"].includes(status)) {
      cert.status = status;
    }

    // Attempt to re-generate the certificate image and PDF with updated data
    try {
      const setup = await CertificateSetup.findById(cert.setupId);
      let template = setup ? await Template.findById(setup.templateId) : null;
      if (!template) {
        template = await Template.findOne({ institutionId: cert.institutionId }).sort({ createdAt: -1 });
      }

      if (template) {
        const baseUrl = getAppBaseUrl(req);
        const renderResult = await generateCertificateEngine({
          backgroundUrl: template.backgroundUrl,
          elements: template.elements as CertificateElement[],
          data: {
            ...updatedRecipientData,
            program_text: setup?.programText || "",
          },
          certificateNumber: cert.certificateNumber,
          width: template.width,
          height: template.height,
          baseUrl,
          verificationToken: cert.verificationToken || undefined,
        });

        const year = new Date(cert.issuedAt || Date.now()).getFullYear();
        const folder = `institutions/${cert.institutionId}/certificates/${year}`;

        const pdfUpload = await uploadToCloudinary(renderResult.pdfBuffer, {
          folder,
          filename: `${cert.certificateNumber}`,
          resourceType: "raw",
        });

        const pngUpload = await uploadToCloudinary(renderResult.pngBuffer, {
          folder,
          filename: `${cert.certificateNumber}`,
          resourceType: "image",
        });

        cert.pdfUrl = pdfUpload.url;
        cert.pngUrl = pngUpload.url;
        cert.verificationToken = renderResult.verificationToken;
        cert.verificationCodeHash = renderResult.verificationCodeHash;
      }
    } catch (reErr) {
      console.warn("Could not re-render PDF/PNG during certificate update:", reErr);
    }

    await cert.save();

    return NextResponse.json({
      success: true,
      message: "Certificate updated successfully",
      certificate: cert,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error updating certificate";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

function extractCloudinaryPublicId(url: string, resourceType: "image" | "raw"): string | null {
  try {
    if (!url || url.startsWith("data:")) return null;
    const match = url.match(/\/(?:image|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    if (match) return match[1];
    return null;
  } catch {
    return null;
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const cert = await Certificate.findOne({ _id: id, institutionId: auth.institutionId });
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

    // Delete from Cloudinary (PNG image)
    if (cert.pngUrl && !cert.pngUrl.startsWith("data:")) {
      const pngPublicId = extractCloudinaryPublicId(cert.pngUrl, "image");
      if (pngPublicId) {
        await deleteFromCloudinary(pngPublicId, "image");
      }
    }

    // Delete from Cloudinary (PDF raw file)
    if (cert.pdfUrl && !cert.pdfUrl.startsWith("data:")) {
      const pdfPublicId = extractCloudinaryPublicId(cert.pdfUrl, "raw");
      if (pdfPublicId) {
        await deleteFromCloudinary(pdfPublicId, "raw");
      }
    }

    // Delete from MongoDB
    await Certificate.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: "Certificate permanently deleted" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Delete error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
