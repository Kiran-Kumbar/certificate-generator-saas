import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate, User } from "@/models";
import { verifyAuthToken } from "@/lib/auth";
import { PDFDocument } from "pdf-lib";
import * as archiver from "archiver";
import { Readable } from "stream";

async function getPdfBuffer(url?: string): Promise<Buffer | null> {
  if (!url) return null;
  try {
    if (url.startsWith("data:")) {
      const b64 = url.split(",")[1];
      return Buffer.from(b64, "base64");
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    console.warn("Failed fetching PDF buffer from url:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);

    let user = auth ? await User.findById(auth.userId) : null;
    if (!user && auth?.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }

    const { certificateIds, mode } = await req.json(); // mode: "zip" | "combined_pdf"

    if (!certificateIds || !Array.isArray(certificateIds) || certificateIds.length === 0) {
      return NextResponse.json({ error: "No certificates selected" }, { status: 400 });
    }

    const query: Record<string, unknown> = { _id: { $in: certificateIds } };
    if (user?.institutionId) {
      query.institutionId = user.institutionId;
    }

    const certificates = await Certificate.find(query);

    if (certificates.length === 0) {
      return NextResponse.json({ error: "No matching certificates found" }, { status: 404 });
    }

    if (mode === "combined_pdf") {
      const mergedPdf = await PDFDocument.create();
      let pageCount = 0;

      for (const cert of certificates) {
        try {
          const pdfBuffer = await getPdfBuffer(cert.pdfUrl);
          if (!pdfBuffer) continue;
          const pdfDoc = await PDFDocument.load(pdfBuffer);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
            pageCount++;
          });
        } catch (e) {
          console.warn(`Failed merging PDF for certificate ${cert.certificateNumber}:`, e);
        }
      }

      if (pageCount === 0) {
        return NextResponse.json({ error: "Could not load any valid certificate PDFs to merge" }, { status: 400 });
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
      const archive = (archiver as unknown as (format: string, options: Record<string, unknown>) => archiver.Archiver)(
        "zip",
        { zlib: { level: 9 } }
      );
      const stream = new Readable({ read() {} });

      archive.on("data", (chunk: Buffer) => stream.push(chunk));
      archive.on("end", () => stream.push(null));
      archive.on("error", (err: Error) => {
        console.error("Archive stream error:", err);
        stream.destroy(err);
      });

      (async () => {
        for (const cert of certificates) {
          try {
            const pdfBuffer = await getPdfBuffer(cert.pdfUrl);
            if (!pdfBuffer) continue;
            const filename = `${cert.certificateNumber}_${cert.studentName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
            archive.append(pdfBuffer, { name: filename });
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
