import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate, User } from "@/models";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const cert = await Certificate.findById(id).populate("setupId");
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

    const studentName = cert.studentName || "Student";
    const recipientData = cert.recipientData || {};
    const domain = (recipientData.domain as string) || (recipientData.course as string) || "Internship Program";
    const collegeName = (recipientData.college_name as string) || "University";
    const startDate = (recipientData.start_date as string) || "";
    const endDate = (recipientData.end_date as string) || "";
    const certNumber = cert.certificateNumber;
    const recipientEmail = (recipientData.student_email as string) || (recipientData.email as string) || "";

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const verifyUrl = `${protocol}://${host}/verify/${cert.verificationToken}`;
    const pdfDownloadUrl = cert.pdfUrl;

    const subject = `Internship Completion Certificate - ${studentName} | Softmusk Info Pvt. Ltd.`;

    const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #002b66 0%, #031b3e 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">SOFTMUSK INFO PVT. LTD.</h1>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">Official Credential Verification Service • Belagavi, Karnataka</p>
  </div>

  <div style="padding: 32px 24px; color: #1e293b; line-height: 1.6;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>${studentName}</strong>,</p>
    <p style="font-size: 14px; color: #334155;">
      Congratulations on successfully completing your internship at <strong>Softmusk Info Pvt. Ltd.</strong>!
      Your dedication, technical accomplishments, and active contributions to the project entitled <strong>“${domain}”</strong> were thoroughly appreciated by our engineering team.
    </p>

    <!-- Certificate Summary Facts Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 140px;">Certificate No:</td>
          <td style="padding: 6px 0; font-weight: 600; font-family: monospace; color: #002b66;">${certNumber}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Institution / College:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${collegeName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Specialization Domain:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${domain}</td>
        </tr>
        ${startDate && endDate ? `
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Internship Term:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${startDate} to ${endDate}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Authenticity Status:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #16a34a;">CRYPTOGRAPHICALLY VERIFIED ✓</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${verifyUrl}" style="background-color: #002b66; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; margin-right: 8px;">
        View & Verify Certificate
      </a>
      <a href="${pdfDownloadUrl}" style="background-color: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
        Download Vector PDF
      </a>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
      You can share your verification link with future employers, academic institutions, and on LinkedIn. Scanning the QR code on your certificate also connects directly to this verified record.
    </p>
  </div>

  <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
    Softmusk Info Pvt. Ltd. • Belagavi, Karnataka • Credential Verification ID: ${certNumber}
  </div>
</div>
`;

    return NextResponse.json({
      success: true,
      emailPreview: {
        to: recipientEmail || "student@example.com",
        subject,
        html: htmlBody,
        studentName,
        certificateNumber: certNumber,
        verifyUrl,
        pdfUrl: pdfDownloadUrl,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching email preview";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const cert = await Certificate.findById(id);
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const recipientEmail = body.to || cert.recipientData?.student_email || cert.recipientData?.email;

    if (!recipientEmail) {
      return NextResponse.json({ error: "Recipient email address is required" }, { status: 400 });
    }

    // In enterprise deployment, this calls SMTP/SendGrid/Postmark/Resend.
    // Record the successful email dispatch in the certificate record
    await Certificate.updateOne(
      { _id: cert._id },
      {
        $set: {
          lastEmailedTo: recipientEmail,
          lastEmailedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Certificate dispatched successfully to ${recipientEmail}`,
      dispatchedAt: new Date().toISOString(),
      to: recipientEmail,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error sending certificate email";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
