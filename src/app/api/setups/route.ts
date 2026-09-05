import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CertificateSetup, User } from "@/models";
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

    const { name, templateId, programText, variables, folderRule } = await req.json();

    if (!name || !templateId || !programText) {
      return NextResponse.json({ error: "Name, templateId, and programText are required" }, { status: 400 });
    }

    const setup = await CertificateSetup.create({
      institutionId: user.institutionId,
      name,
      templateId,
      programText,
      variables: variables || [],
      folderRule: folderRule || "/{{year}}/{{program}}",
      createdBy: user._id,
    });

    return NextResponse.json({ success: true, setup });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Certificate Setup creation error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { institutionId: string };
    const { id, name, templateId, programText, variables } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Setup ID is required" }, { status: 400 });
    }

    const setup = await CertificateSetup.findOneAndUpdate(
      { _id: id, institutionId: decoded.institutionId },
      { name, templateId, programText, variables },
      { new: true }
    );

    if (!setup) {
      return NextResponse.json({ error: "Setup not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, setup });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Update setup error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { institutionId: string };
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Setup ID required" }, { status: 400 });
    }

    await CertificateSetup.deleteOne({ _id: id, institutionId: decoded.institutionId });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Delete setup error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { institutionId: string };
    const setups = await CertificateSetup.find({ institutionId: decoded.institutionId })
      .populate("templateId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, setups });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch certificate setups error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
