import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Asset, User } from "@/models";
import { uploadToCloudinary } from "@/services/storage";
import { verifyAuthToken } from "@/lib/auth";

type AssetType = "logo" | "signature" | "stamp" | "seal" | "watermark" | "other";

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
    if (!user || !user.institutionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = (formData.get("name") as string) || file?.name || "Asset";
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
    const auth = verifyAuthToken(req);

    let user = auth ? await User.findById(auth.userId) : null;
    if (!user && auth?.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }

    const institutionId = user?.institutionId;
    const query = institutionId ? { institutionId } : {};
    const assets = await Asset.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, assets });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch assets error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
