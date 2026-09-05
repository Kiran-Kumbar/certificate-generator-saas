import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Asset, User } from "@/models";
import { uploadToCloudinary } from "@/services/storage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "certificate-saas-super-secret-jwt-key";

type AssetType = "logo" | "signature" | "stamp" | "seal" | "watermark" | "other";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; institutionId: string };
    const user = await User.findById(decoded.userId);
    if (!user || !user.institutionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = (formData.get("name") as string) || file.name;
    const rawType = (formData.get("type") as string) || "logo";

    const allowedTypes: AssetType[] = ["logo", "signature", "stamp", "seal", "watermark", "other"];
    const type: AssetType = allowedTypes.includes(rawType as AssetType) ? (rawType as AssetType) : "logo";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folder = `institutions/${user.institutionId}/assets`;
    const uploadResult = await uploadToCloudinary(buffer, { folder, resourceType: "auto" });

    const asset = await Asset.create({
      institutionId: user.institutionId,
      name,
      type,
      cloudinaryPublicId: uploadResult.storageKey,
      url: uploadResult.url,
      mimeType: file.type,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      createdBy: user._id,
    });

    return NextResponse.json({ success: true, asset });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Asset upload error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { institutionId: string };
    const assets = await Asset.find({ institutionId: decoded.institutionId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, assets });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch assets error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
