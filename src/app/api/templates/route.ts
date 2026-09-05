import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Template, User } from "@/models";
import { uploadToCloudinary } from "@/services/storage";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    const user = await User.findById(auth.userId);
    if (!user || !user.institutionId) {
      return NextResponse.json({ error: "Institution user account not found" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const elementsJson = formData.get("elements") as string;

    if (!file || !name) {
      return NextResponse.json({ error: "Name and background template file required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folder = `institutions/${user.institutionId}/templates`;
    const uploadResult = await uploadToCloudinary(buffer, { folder, resourceType: "auto" });

    const elements = elementsJson ? JSON.parse(elementsJson) : [];

    const template = await Template.create({
      institutionId: user.institutionId,
      name,
      backgroundUrl: uploadResult.url,
      backgroundPublicId: uploadResult.storageKey,
      width: uploadResult.width || 841.89,
      height: uploadResult.height || 595.28,
      elements,
      createdBy: user._id,
    });

    return NextResponse.json({ success: true, template });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Template creation error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    const { id, name, elements } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const template = await Template.findOneAndUpdate(
      { _id: id, institutionId: auth.institutionId },
      { name, elements },
      { new: true }
    );

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Template update error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await Template.find({ institutionId: auth.institutionId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, templates });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch templates error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
