import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate } from "@/models";
import jwt from "jsonwebtoken";
import { PDFDocument } from "pdf-lib";
import * as archiver from "archiver";
import { Readable } from "stream";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { institutionId: string };
    const { certificateIds, mode } = await req.json(); // mode: "zip" | "combined_pdf"

    if (!certificateIds || !Array.isArray(certificateIds) || certificateIds.length === 0) {
      return NextResponse.json({ error: "No certificates selected" }, { status: 400 });
    }

    const certificates = await Certificate.find({
      _id: { $in: certificateIds },
      institutionId: decoded.institutionId,
    });

    if (certificates.length === 0) {
      return NextResponse.json({ error: "No matching certificates found" }, { status: 404 });
    }

    if (mode === "combined_pdf") {
      const mergedPdf = await PDFDocument.create();

      for (const cert of certificates) {
        try {
          const pdfBytes = await fetch(cert.pdfUrl).then((res) => res.arrayBuffer());
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (e) {
          console.warn(`Failed merging PDF for certificate ${cert.certificateNumber}:`, e);
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      return new NextResponse(Buffer.from(mergedPdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Combined_Certificates_${Date.now()}.pdf"`,
        },
      });
    }

    if (mode === "zip") {
      const archive = (archiver as unknown as (format: string, options: Record<string, unknown>) => archiver.Archiver)("zip", { zlib: { level: 9 } });
      const stream = new Readable({ read() {} });

      archive.on("data", (chunk: Buffer) => stream.push(chunk));
      archive.on("end", () => stream.push(null));

      (async () => {
        for (const cert of certificates) {
          try {
            const pdfBytes = await fetch(cert.pdfUrl).then((res) => res.arrayBuffer());
            const filename = `${cert.certificateNumber}_${cert.studentName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
            archive.append(Buffer.from(pdfBytes), { name: filename });
          } catch (e) {
            console.warn(`Failed zipping certificate ${cert.certificateNumber}:`, e);
          }
        }
        await archive.finalize();
      })();

      return new NextResponse(stream as unknown as ReadableStream, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="Certificates_Bundle_${Date.now()}.zip"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid mode. Use 'zip' or 'combined_pdf'" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Export error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
