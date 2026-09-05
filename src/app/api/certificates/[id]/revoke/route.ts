import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Certificate } from "@/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { institutionId: string };
    const { id } = await params;

    const cert = await Certificate.findOne({ _id: id, institutionId: decoded.institutionId });
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

    cert.status = "revoked";
    await cert.save();

    return NextResponse.json({ success: true, message: "Certificate revoked", certificate: cert });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Revocation error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
