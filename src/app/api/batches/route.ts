import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CertificateBatch, User } from "@/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; institutionId: string };
    const user = await User.findById(decoded.userId);
    if (!user || !user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { setupId, name, total } = await req.json();

    if (!setupId || !name || !total) {
      return NextResponse.json({ error: "setupId, name, and total are required" }, { status: 400 });
    }

    const batch = await CertificateBatch.create({
      institutionId: user.institutionId,
      setupId,
      name,
      total,
      processed: 0,
      successful: 0,
      failed: 0,
      status: "processing",
      createdBy: user._id,
    });

    return NextResponse.json({ success: true, batch });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Batch creation error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
