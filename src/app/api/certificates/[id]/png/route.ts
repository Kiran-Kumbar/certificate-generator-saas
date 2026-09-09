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

    if (!cert || !cert.pngUrl) {
      return new NextResponse("Certificate image not found", { status: 404 });
    }

    let buffer: Buffer | null = null;
    if (cert.pngUrl.startsWith("data:")) {
      const b64 = cert.pngUrl.split(",")[1];
      buffer = Buffer.from(b64, "base64");
    } else {
      const res = await fetch(cert.pngUrl);
      if (res.ok) {
        buffer = Buffer.from(await res.arrayBuffer());
      }
    }

    if (!buffer) {
      return new NextResponse("Unable to load PNG image", { status: 500 });
    }

    const filename = `${cert.certificateNumber || "Certificate"}.png`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    console.error("Error serving certificate PNG:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
