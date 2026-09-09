import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate } from "@/models";
import { verifyAuthToken } from "@/lib/auth";
import { deleteFromCloudinary } from "@/services/storage";

function extractCloudinaryPublicId(url: string, resourceType: "image" | "raw"): string | null {
  try {
    if (!url || url.startsWith("data:")) return null;
    // Cloudinary URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/filename.ext
    // or https://res.cloudinary.com/<cloud>/raw/upload/v123/folder/filename
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
