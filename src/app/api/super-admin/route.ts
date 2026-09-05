import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Institution, User, Certificate, Asset } from "@/models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded: { role: string; email?: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { role: string; email?: string };
    } catch {
      return NextResponse.json({ error: "Session expired or invalid token. Please log in again." }, { status: 401 });
    }

    if (decoded.role !== "super_admin" && decoded.email !== "admin@example.com") {
      return NextResponse.json({ error: "Super Admin permission required" }, { status: 403 });
    }

    const [institutionsCount, activeInstitutions, totalCertificates, totalAssets] = await Promise.all([
      Institution.countDocuments(),
      Institution.countDocuments({ status: "active" }),
      Certificate.countDocuments(),
      Asset.countDocuments(),
    ]);

    const institutions = await Institution.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      stats: {
        totalInstitutions: institutionsCount,
        activeInstitutions,
        totalCertificates,
        totalAssets,
      },
      institutions,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Super admin fetch error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded: { role: string; email?: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { role: string; email?: string };
    } catch {
      return NextResponse.json({ error: "Session expired or invalid token. Please log in again." }, { status: 401 });
    }

    const { name, code, email, adminName, adminPassword } = await req.json();

    if (!name || !code || !email || !adminName || !adminPassword) {
      return NextResponse.json({ error: "All tenant fields are required" }, { status: 400 });
    }

    const institution = await Institution.create({
      name,
      code: code.toUpperCase(),
      email,
      certificatePrefix: code.toUpperCase(),
    });

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const user = await User.create({
      institutionId: institution._id,
      name: adminName,
      email,
      passwordHash,
      role: "admin",
    });

    return NextResponse.json({ success: true, institution, user });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Tenant creation error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
