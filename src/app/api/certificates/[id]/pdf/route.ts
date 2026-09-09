import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate } from "@/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const cert = await Certificate.findById(id);

    if (!cert || !cert.pdfUrl) {
      return new NextResponse("Certificate PDF not found", { status: 404 });
    }

    let buffer: Buffer | null = null;
    if (cert.pdfUrl.startsWith("data:")) {
      const b64 = cert.pdfUrl.split(",")[1];
      buffer = Buffer.from(b64, "base64");
    } else {
      const res = await fetch(cert.pdfUrl);
      if (res.ok) {
        buffer = Buffer.from(await res.arrayBuffer());
      }
    }

    if (!buffer) {
      return new NextResponse("Unable to load PDF", { status: 500 });
    }

    const filename = `${cert.certificateNumber || "Certificate"}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    console.error("Error serving certificate PDF:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
