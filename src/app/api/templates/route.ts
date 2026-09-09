import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Template, User } from "@/models";
import { uploadToCloudinary } from "@/services/storage";
import { verifyAuthToken } from "@/lib/auth";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

function ensureSoftmuskTemplateAssets() {
  try {
    const publicTemplatesDir = path.join(process.cwd(), "public", "templates");
    if (!fs.existsSync(publicTemplatesDir)) {
      fs.mkdirSync(publicTemplatesDir, { recursive: true });
    }

    const destPng = path.join(publicTemplatesDir, "softmusk-template.png");
    const artifactPng = "C:/Users/kiran/.gemini/antigravity-ide/brain/045443dd-afcf-4648-b40d-f2300c0f5d55/.tempmediaStorage/media_1788889318565.png";
    if (fs.existsSync(artifactPng)) {
      fs.copyFileSync(artifactPng, destPng);
    }

    const destPdf = path.join(publicTemplatesDir, "softmusk-template.pdf");
    if (!fs.existsSync(destPdf)) {
      const refPdf = path.join(process.cwd(), "refrence", "Softmusk Info  TEMPLATE (1).pdf");
      if (fs.existsSync(refPdf)) {
        fs.copyFileSync(refPdf, destPdf);
      }
    }
  } catch (e) {
    console.warn("Could not copy template assets:", e);
  }
}

export function getSoftmuskDefaultElements() {
  // Portrait A4: 595.28 pt wide × 841.89 pt tall
  // Background PNG has: logo+header ~0–200, "Internship Certificate" title ~200–300,
  // gold ornamental divider ~305–340, content area 345–620, 2nd divider ~625–665,
  // signatures ~665–730, QR area ~745–830, footer text ~830
  return [
    // "THIS IS TO CERTIFY THAT" — small label above student name
    {
      id: "el_certify_label",
      type: "text",
      content: "THIS IS TO CERTIFY THAT",
      position: { x: 60, y: 348, width: 475, height: 22 },
      style: {
        fontSize: 11,
        fontFamily: "Helvetica",
        fontWeight: 700,
        textAlign: "center",
        color: "#475569",
      },
      smartFit: {
        enabled: false,
        maxLines: 1,
        minFontSize: 10,
        wordWrap: false,
      },
    },

    // Student Name — large, bold, dark blue, centered
    {
      id: "el_student_name",
      type: "variable",
      variableKey: "student_name",
      position: { x: 60, y: 374, width: 475, height: 42 },
      style: {
        fontSize: 28,
        fontFamily: "Times-Roman",
        fontWeight: 700,
        textAlign: "center",
        color: "#003087",
      },
      smartFit: {
        enabled: true,
        maxLines: 1,
        minFontSize: 18,
        wordWrap: false,
      },
    },

    // Reg No — smaller, centered, underneath student name
    {
      id: "el_reg_no",
      type: "variable",
      variableKey: "reg_no",
      position: { x: 60, y: 420, width: 475, height: 22 },
      style: {
        fontSize: 11,
        fontFamily: "Helvetica",
        fontWeight: 400,
        textAlign: "center",
        color: "#475569",
      },
      smartFit: {
        enabled: false,
        maxLines: 1,
        minFontSize: 10,
        wordWrap: false,
      },
    },

    // Para 1 — college, dept, internship dates
    {
      id: "el_para_1",
      type: "text",
      content:
        "A student of {{college_name}}, {{dept}} has successfully completed his/her internship from {{start_date}} to {{end_date}} at \u201cSoftmusk Info Pvt. Ltd, Belagavi, Karnataka.\u201d",
      position: { x: 65, y: 450, width: 465, height: 60 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
      },
      smartFit: {
        enabled: true,
        maxLines: 3,
        minFontSize: 10,
        wordWrap: true,
      },
    },

    // Para 2 — domain / project title
    {
      id: "el_para_2",
      type: "text",
      content:
        "Was able to successfully participate in and accomplish all the tasks required for the project entitled \u201c{{domain}}\u201d through which he/she was able to showcase his/her great work and team player skills.",
      position: { x: 65, y: 520, width: 465, height: 60 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
      },
      smartFit: {
        enabled: true,
        maxLines: 3,
        minFontSize: 10,
        wordWrap: true,
      },
    },

    // Para 3 — closing statement
    {
      id: "el_para_3",
      type: "text",
      content:
        "We at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern and we wish him/her all the best in his/her future endeavors.",
      position: { x: 65, y: 588, width: 465, height: 40 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
      },
      smartFit: {
        enabled: true,
        maxLines: 2,
        minFontSize: 10,
        wordWrap: true,
      },
    },

    // QR Code — bottom center between 2nd divider and footer text
    {
      id: "el_qr_token",
      type: "qr",
      position: { x: 248, y: 752, width: 100, height: 100 },
    },
  ];
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    let user = await User.findById(auth.userId);
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }
    if (!user || !user.institutionId) {
      return NextResponse.json({ error: "Institution user account not found" }, { status: 401 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user.institutionId as any)?._id || user.institutionId;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string;
    const elementsJson = formData.get("elements") as string;
    const previewUrl = formData.get("previewUrl") as string | null;
    const widthParam = formData.get("width") ? Number(formData.get("width")) : undefined;
    const heightParam = formData.get("height") ? Number(formData.get("height")) : undefined;

    if (!name) {
      return NextResponse.json({ error: "Template Title is required" }, { status: 400 });
    }

    let backgroundUrl = previewUrl || "";
    let backgroundPublicId = `tmpl_${Date.now()}`;
    let templateWidth = widthParam || 595.28;
    let templateHeight = heightParam || 841.89;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        try {
          const pdfDoc = await PDFDocument.load(buffer);
          const page = pdfDoc.getPage(0);
          const size = page.getSize();
          templateWidth = size.width;
          templateHeight = size.height;
        } catch (e) {
          console.warn("Could not parse PDF dimensions:", e);
        }
      }

      const folder = `institutions/${institutionId}/templates`;
      const uploadResult = await uploadToCloudinary(buffer, {
        folder,
        resourceType: isPdf ? "raw" : "image",
      });

      backgroundPublicId = uploadResult.storageKey;
      backgroundUrl = previewUrl || uploadResult.url;
    }

    if (!backgroundUrl) {
      return NextResponse.json({ error: "Background template file or preview image is required" }, { status: 400 });
    }

    const elements = elementsJson ? JSON.parse(elementsJson) : [];

    const template = await Template.create({
      institutionId,
      name,
      backgroundUrl,
      backgroundPublicId,
      width: templateWidth,
      height: templateHeight,
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

    let user = await User.findById(auth.userId);
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user?.institutionId as any)?._id || user?.institutionId || auth.institutionId;

    const { id, name, elements, width, height, backgroundUrl } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (elements) updateData.elements = elements;
    if (width) updateData.width = width;
    if (height) updateData.height = height;
    if (backgroundUrl) updateData.backgroundUrl = backgroundUrl;

    const template = await Template.findOneAndUpdate(
      { _id: id, institutionId },
      updateData,
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

    let user = await User.findById(auth.userId);
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user?.institutionId as any)?._id || user?.institutionId || auth.institutionId;

    ensureSoftmuskTemplateAssets();

    const { searchParams } = new URL(req.url);
    const reset = searchParams.get("reset") === "true";

    // Clean up any stale template that had temporary junk test content
    await Template.deleteMany({
      institutionId,
      "elements.content": { $regex: /bhbbiiiiuuiioioij/ }
    });

    let templates = await Template.find({ institutionId }).sort({ createdAt: -1 });

    if (templates.length === 0 || reset) {
      if (templates.length > 0 && reset) {
        await Template.updateOne(
          { _id: templates[0]._id },
          {
            backgroundUrl: "/templates/softmusk-template.png",
            elements: getSoftmuskDefaultElements(),
            width: 595.28,
            height: 841.89,
          }
        );
        templates = await Template.find({ institutionId }).sort({ createdAt: -1 });
      } else {
        const seeded = await Template.create({
          institutionId,
          name: "Softmusk Internship Certificate (Portrait A4)",
          backgroundUrl: "/templates/softmusk-template.png",
          backgroundPublicId: "softmusk_portrait_a4",
          width: 595.28,
          height: 841.89,
          elements: getSoftmuskDefaultElements(),
          createdBy: user?._id || auth.userId,
        });
        templates = [seeded];
      }
    } else {
      // Migrate existing template: if it still has old element IDs (el_certify_title / missing el_reg_no), update elements
      for (const tmpl of templates) {
        const els = tmpl.elements as Array<Record<string, unknown>>;
        const hasOldId = els.some((e) => e.id === "el_certify_title");
        const hasRegNoEl = els.some((e) => e.id === "el_reg_no");
        if (hasOldId || !hasRegNoEl) {
          await Template.updateOne(
            { _id: tmpl._id },
            { $set: { elements: getSoftmuskDefaultElements() } }
          );
        }
      }
      templates = await Template.find({ institutionId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, templates });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch templates error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Template ID is required" }, { status: 400 });

    await Template.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Delete template error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
