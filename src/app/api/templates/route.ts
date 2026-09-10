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

    const files = [
      { name: "softmusk-internship-clean-bg.png", artifact: "media_1789021553205.png" },
      { name: "softmusk-collaboration-clean-bg.png", artifact: "media_1789021553205.png" },
      { name: "softmusk-workshop-clean-bg.png", artifact: "media_1789021553205.png" },
    ];

    for (const f of files) {
      const dest = path.join(publicTemplatesDir, f.name);
      if (!fs.existsSync(dest)) {
        const artPath = path.join(
          "C:/Users/kiran/.gemini/antigravity-ide/brain/045443dd-afcf-4648-b40d-f2300c0f5d55/.user_uploaded",
          f.artifact
        );
        if (fs.existsSync(artPath)) {
          fs.copyFileSync(artPath, dest);
        }
      }
    }
  } catch (e) {
    console.warn("Could not copy template assets:", e);
  }
}

export function getSoftmuskInternshipElements() {
  return [
    {
      id: "el_student_name",
      type: "variable",
      variableKey: "student_name",
      position: { x: 105, y: 295, width: 385, height: 40 },
      style: {
        fontSize: 26,
        fontFamily: "Times-Roman",
        fontWeight: 700,
        textAlign: "center",
        color: "#03046e",
      },
      smartFit: {
        enabled: true,
        maxLines: 1,
        minFontSize: 16,
        wordWrap: false,
      },
    },
    {
      id: "el_para_1",
      type: "text",
      content:
        "A student of <b>{{college_name}}</b> has successfully completed his/her internship\nfrom <blue>{{start_date}}</blue> to <blue>{{end_date}}</blue> at\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>",
      position: { x: 45, y: 350, width: 505, height: 68 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 4,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_para_2",
      type: "text",
      content:
        "Was able to successfully participate in and accomplish all the tasks required for\nthe project entitled <b>“{{domain}}”</b> through which\nhe/she was able to showcase his/her great work and team player skills.",
      position: { x: 45, y: 424, width: 505, height: 65 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 4,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_para_3",
      type: "text",
      content:
        "We at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern\nand we wish him/her all the best in his/her future endeavors.",
      position: { x: 45, y: 494, width: 505, height: 45 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 3,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_qr_token",
      type: "qr",
      position: { x: 468, y: 535, width: 72, height: 72 },
    },
    {
      id: "el_qr_label",
      type: "text",
      content: "Scan the QR code to verify this certificate",
      position: { x: 430, y: 610, width: 148, height: 20 },
      style: {
        fontSize: 7.5,
        fontFamily: "Helvetica",
        fontWeight: 400,
        textAlign: "center",
        color: "#475569",
      },
      smartFit: {
        enabled: true,
        maxLines: 2,
        minFontSize: 6,
        wordWrap: true,
      },
    },
  ];
}

export function getSoftmuskCollaborationElements() {
  return [
    {
      id: "el_student_name",
      type: "variable",
      variableKey: "student_name",
      position: { x: 105, y: 295, width: 385, height: 40 },
      style: {
        fontSize: 26,
        fontFamily: "Times-Roman",
        fontWeight: 700,
        textAlign: "center",
        color: "#03046e",
      },
      smartFit: {
        enabled: true,
        maxLines: 1,
        minFontSize: 16,
        wordWrap: false,
      },
    },
    {
      id: "el_para_1",
      type: "text",
      content:
        "A student of <b>{{college_name}}</b> has successfully completed the joint industry internship program\nfrom <blue>{{start_date}}</blue> to <blue>{{end_date}}</blue> in collaboration with\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>",
      position: { x: 45, y: 350, width: 505, height: 68 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 4,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_para_2",
      type: "text",
      content:
        "Was able to successfully participate in and accomplish all the tasks required for the\ncollaborative project entitled <b>“{{domain}}”</b> through which\nhe/she showcased exemplary technical capability and team leadership.",
      position: { x: 45, y: 424, width: 505, height: 65 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 4,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_para_3",
      type: "text",
      content:
        "We at Softmusk Info Pvt. Ltd have thoroughly enjoyed collaborating with the\nstudent and wish him/her all the best in his/her future endeavors.",
      position: { x: 45, y: 494, width: 505, height: 45 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 3,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_qr_token",
      type: "qr",
      position: { x: 468, y: 535, width: 72, height: 72 },
    },
    {
      id: "el_qr_label",
      type: "text",
      content: "Scan the QR code to verify this certificate",
      position: { x: 430, y: 610, width: 148, height: 20 },
      style: {
        fontSize: 7.5,
        fontFamily: "Helvetica",
        fontWeight: 400,
        textAlign: "center",
        color: "#475569",
      },
      smartFit: {
        enabled: true,
        maxLines: 2,
        minFontSize: 6,
        wordWrap: true,
      },
    },
  ];
}

export function getSoftmuskWorkshopElements() {
  return [
    {
      id: "el_student_name",
      type: "variable",
      variableKey: "student_name",
      position: { x: 105, y: 295, width: 385, height: 40 },
      style: {
        fontSize: 26,
        fontFamily: "Times-Roman",
        fontWeight: 700,
        textAlign: "center",
        color: "#03046e",
      },
      smartFit: {
        enabled: true,
        maxLines: 1,
        minFontSize: 16,
        wordWrap: false,
      },
    },
    {
      id: "el_para_1",
      type: "text",
      content:
        "A student of <b>{{college_name}}</b> has successfully completed the skill development workshop\non <blue>{{start_date}}</blue> conducted by\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>",
      position: { x: 45, y: 350, width: 505, height: 68 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 4,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_para_2",
      type: "text",
      content:
        "Was able to actively engage and master practical concepts in the domain of\n<b>“{{domain}}”</b> showcasing\nexceptional learning capability and dedication to practical excellence.",
      position: { x: 45, y: 424, width: 505, height: 65 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 4,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_para_3",
      type: "text",
      content:
        "We at Softmusk Info Pvt. Ltd congratulate the student on this accomplishment\nand wish him/her immense success in all future technical pursuits.",
      position: { x: 45, y: 494, width: 505, height: 45 },
      style: {
        fontSize: 12.5,
        fontFamily: "Times-Roman",
        fontWeight: 400,
        textAlign: "center",
        color: "#1e293b",
        lineHeight: 1.55,
      },
      smartFit: {
        enabled: true,
        maxLines: 3,
        minFontSize: 10,
        wordWrap: true,
      },
    },
    {
      id: "el_qr_token",
      type: "qr",
      position: { x: 468, y: 535, width: 72, height: 72 },
    },
    {
      id: "el_qr_label",
      type: "text",
      content: "Scan the QR code to verify this certificate",
      position: { x: 430, y: 610, width: 148, height: 20 },
      style: {
        fontSize: 7.5,
        fontFamily: "Helvetica",
        fontWeight: 400,
        textAlign: "center",
        color: "#475569",
      },
      smartFit: {
        enabled: true,
        maxLines: 2,
        minFontSize: 6,
        wordWrap: true,
      },
    },
  ];
}

export function getSoftmuskDefaultElements() {
  return getSoftmuskInternshipElements();
}

export const OFFICIAL_TEMPLATES_CONFIG = [
  {
    name: "Softmusk Internship Certificate (Official)",
    backgroundUrl:
      "https://res.cloudinary.com/dhbrorn46/image/upload/v1789030082/official_templates/softmusk_internship_clean_bg.png",
    localFallbackUrl: "/templates/softmusk-internship-clean-bg.png",
    backgroundPublicId: "official_templates/softmusk_internship_clean_bg",
    width: 595.28,
    height: 841.89,
    getElements: getSoftmuskInternshipElements,
  },
  {
    name: "Softmusk College Internship Collaboration",
    backgroundUrl:
      "https://res.cloudinary.com/dhbrorn46/image/upload/v1789030084/official_templates/softmusk_collaboration_clean_bg.png",
    localFallbackUrl: "/templates/softmusk-collaboration-clean-bg.png",
    backgroundPublicId: "official_templates/softmusk_collaboration_clean_bg",
    width: 595.28,
    height: 841.89,
    getElements: getSoftmuskCollaborationElements,
  },
  {
    name: "Softmusk Technical Workshop Certificate",
    backgroundUrl:
      "https://res.cloudinary.com/dhbrorn46/image/upload/v1789030086/official_templates/softmusk_workshop_clean_bg.png",
    localFallbackUrl: "/templates/softmusk-workshop-clean-bg.png",
    backgroundPublicId: "official_templates/softmusk_workshop_clean_bg",
    width: 595.28,
    height: 841.89,
    getElements: getSoftmuskWorkshopElements,
  },
];

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

    // Ensure all 3 official templates exist and are upgraded with clean backgrounds
    for (const official of OFFICIAL_TEMPLATES_CONFIG) {
      const existing = await Template.findOne({
        institutionId,
        $or: [
          { name: official.name },
          ...(official.name.includes("Internship Certificate")
            ? [{ name: "Softmusk Internship Certificate (Portrait A4)" }]
            : []),
        ],
      });

      if (!existing) {
        await Template.create({
          institutionId,
          name: official.name,
          backgroundUrl: official.backgroundUrl,
          backgroundPublicId: official.backgroundPublicId,
          width: official.width,
          height: official.height,
          elements: official.getElements(),
          createdBy: user?._id || auth.userId,
        });
      } else if (reset) {
        await Template.updateOne(
          { _id: existing._id },
          {
            $set: {
              name: official.name,
              backgroundUrl: official.backgroundUrl,
              backgroundPublicId: official.backgroundPublicId,
              width: official.width,
              height: official.height,
              elements: official.getElements(),
            },
          }
        );
      } else {
        const els = (existing.elements || []) as Array<Record<string, unknown>>;
        const hasOldLabel = els.some((e) => e.id === "el_certify_label");
        const hasOldBg =
          existing.backgroundUrl?.includes("softmusk-template.png") ||
          existing.backgroundUrl?.includes("media_1788889318565") ||
          existing.backgroundUrl !== official.backgroundUrl;
        const needsElementsUpdate =
          !existing.elements ||
          els.length === 0 ||
          els.some((e) => e.id === "el_para_1" && !String(e.content || "").includes("<blue>"));

        if (hasOldLabel || hasOldBg || needsElementsUpdate) {
          await Template.updateOne(
            { _id: existing._id },
            {
              $set: {
                name: official.name,
                backgroundUrl: official.backgroundUrl,
                backgroundPublicId: official.backgroundPublicId,
                width: official.width,
                height: official.height,
                elements: official.getElements(),
              },
            }
          );
        }
      }
    }

    templates = await Template.find({ institutionId }).sort({ createdAt: -1 });

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
