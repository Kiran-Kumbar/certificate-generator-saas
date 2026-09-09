import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CertificateSetup, Template, User } from "@/models";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await User.findById(auth.userId);
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }
    if (!user || !user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user.institutionId as any)?._id || user.institutionId;

    const { name, templateId, programText, variables, folderRule } = await req.json();

    if (!name || !templateId || !programText) {
      return NextResponse.json({ error: "Name, templateId, and programText are required" }, { status: 400 });
    }

    const setup = await CertificateSetup.create({
      institutionId,
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
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await User.findById(auth.userId);
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user?.institutionId as any)?._id || user?.institutionId || auth.institutionId;

    const { id, name, templateId, programText, variables } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Setup ID is required" }, { status: 400 });
    }

    const setup = await CertificateSetup.findOneAndUpdate(
      { _id: id, institutionId },
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
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await User.findById(auth.userId);
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user?.institutionId as any)?._id || user?.institutionId || auth.institutionId;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Setup ID required" }, { status: 400 });
    }

    await CertificateSetup.deleteOne({ _id: id, institutionId });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Delete setup error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const auth = verifyAuthToken(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await User.findById(auth.userId);
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email });
    }
    if (!user) {
      user = await User.findOne();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const institutionId = (user?.institutionId as any)?._id || user?.institutionId || auth.institutionId;

    let setups = await CertificateSetup.find({ institutionId })
      .populate("templateId")
      .sort({ createdAt: -1 });

    const activeTemplate = await Template.findOne({ institutionId }).sort({ createdAt: -1 });

    // Repair any setup with missing/stale templateId
    if (activeTemplate) {
      let neededRepair = false;
      for (const s of setups) {
        if (!s.templateId) {
          await CertificateSetup.updateOne({ _id: s._id }, { $set: { templateId: activeTemplate._id } });
          neededRepair = true;
        }
      }
      if (neededRepair) {
        setups = await CertificateSetup.find({ institutionId })
          .populate("templateId")
          .sort({ createdAt: -1 });
      }
    }

    // Auto-seed Softmusk setup if empty
    if (setups.length === 0 && activeTemplate) {
      const seededSetup = await CertificateSetup.create({
        institutionId,
        name: "Softmusk Internship Program (Official)",
        templateId: activeTemplate._id,
        programText:
          "A student of {{college_name}}, {{dept}} has successfully completed his/her internship from {{start_date}} to {{end_date}} at “Softmusk Info Pvt. Ltd, Belagavi, Karnataka.”\n\nWas able to successfully participate in and accomplish all the tasks required for the project entitled “{{domain}}” through which he/she was able to showcase his/her great work and team player skills.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern and we wish him/her all the best in his/her future endeavors.",
        variables: [
          { key: "student_name", label: "Student Name", type: "text", required: true },
          { key: "reg_no", label: "Reg No", type: "text", required: true },
          { key: "college_name", label: "College Name", type: "text", required: true },
          { key: "dept", label: "Dept", type: "text", required: true },
          { key: "domain", label: "Domain", type: "text", required: true },
          { key: "start_date", label: "Start Date", type: "date", required: true },
          { key: "end_date", label: "End Date", type: "date", required: true },
        ],
        createdBy: user?._id || auth.userId,
      });
      setups = [await seededSetup.populate("templateId")];
    } else {
      // Migrate existing setups: if any setup has the old variables without reg_no, update it
      for (const s of setups) {
        const hasRegNo = s.variables?.some((v: { key: string }) => v.key === "reg_no");
        const hasOfficialName =
          s.name === "Softmusk Internship Program" || s.name === "Softmusk Internship Program (Official)";
        if (hasOfficialName && !hasRegNo) {
          await CertificateSetup.updateOne(
            { _id: s._id },
            {
              $set: {
                name: "Softmusk Internship Program (Official)",
                programText:
                  "A student of {{college_name}}, {{dept}} has successfully completed his/her internship from {{start_date}} to {{end_date}} at “Softmusk Info Pvt. Ltd, Belagavi, Karnataka.”\n\nWas able to successfully participate in and accomplish all the tasks required for the project entitled “{{domain}}” through which he/she was able to showcase his/her great work and team player skills.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern and we wish him/her all the best in his/her future endeavors.",
                variables: [
                  { key: "student_name", label: "Student Name", type: "text", required: true },
                  { key: "reg_no", label: "Reg No", type: "text", required: true },
                  { key: "college_name", label: "College Name", type: "text", required: true },
                  { key: "dept", label: "Dept", type: "text", required: true },
                  { key: "domain", label: "Domain", type: "text", required: true },
                  { key: "start_date", label: "Start Date", type: "date", required: true },
                  { key: "end_date", label: "End Date", type: "date", required: true },
                ],
              },
            }
          );
        }
      }
      // Re-fetch after potential migration
      setups = await CertificateSetup.find({ institutionId })
        .populate("templateId")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, setups });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch certificate setups error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
