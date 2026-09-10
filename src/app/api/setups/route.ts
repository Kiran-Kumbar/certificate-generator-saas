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

    const allTemplates = await Template.find({ institutionId }).sort({ createdAt: -1 });

    const DEFAULT_SETUPS_CONFIG = [
      {
        name: "Softmusk Internship Program (Official)",
        templateMatch: "Internship Certificate",
        programText:
          "A student of {{college_name}}, {{dept}} has successfully completed his/her internship from {{start_date}} to {{end_date}} at \u201cSoftmusk Info Pvt. Ltd Belagavi, Karnataka.\u201d\n\nWas able to successfully participate in and accomplish all the tasks required for the project entitled \u201c{{domain}}\u201d through which he/she was able to showcase his/her great work and team player skills.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern and we wish him/her all the best in his/her future endeavors.",
        variables: [
          { key: "student_name", label: "Student Name", type: "text", required: true },
          { key: "reg_no", label: "Reg No", type: "text", required: false },
          { key: "college_name", label: "College Name", type: "text", required: true },
          { key: "dept", label: "Dept", type: "text", required: false },
          { key: "domain", label: "Domain", type: "text", required: true },
          { key: "start_date", label: "Start Date", type: "date", required: true },
          { key: "end_date", label: "End Date", type: "date", required: true },
        ],
      },
      {
        name: "Softmusk College Internship Collaboration",
        templateMatch: "Collaboration",
        programText:
          "A student of {{college_name}}, {{dept}} has successfully completed the joint industry internship program from {{start_date}} to {{end_date}} in collaboration with \u201cSoftmusk Info Pvt. Ltd Belagavi, Karnataka.\u201d\n\nWas able to successfully participate in and accomplish all the tasks required for the collaborative project entitled \u201c{{domain}}\u201d through which he/she showcased exemplary technical capability and team leadership.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed collaborating with the student and wish him/her all the best in his/her future endeavors.",
        variables: [
          { key: "student_name", label: "Student Name", type: "text", required: true },
          { key: "reg_no", label: "Reg No", type: "text", required: false },
          { key: "college_name", label: "College Name", type: "text", required: true },
          { key: "dept", label: "Dept", type: "text", required: false },
          { key: "domain", label: "Domain", type: "text", required: true },
          { key: "start_date", label: "Start Date", type: "date", required: true },
          { key: "end_date", label: "End Date", type: "date", required: true },
        ],
      },
      {
        name: "Softmusk Technical Workshop & Training",
        templateMatch: "Workshop",
        programText:
          "A student of {{college_name}}, {{dept}} has successfully attended and completed the intensive technical workshop on \u201c{{domain}}\u201d conducted by \u201cSoftmusk Info Pvt. Ltd Belagavi, Karnataka\u201d from {{start_date}} to {{end_date}}.\n\nDemonstrated commendable dedication, active participation, and accomplished all practical lab modules, hands-on tasks, and project benchmarks.\n\nWe congratulate him/her on successfully completing this program and wish him/her continued success in all academic and professional pursuits.",
        variables: [
          { key: "student_name", label: "Student Name", type: "text", required: true },
          { key: "reg_no", label: "Reg No", type: "text", required: false },
          { key: "college_name", label: "College Name", type: "text", required: true },
          { key: "dept", label: "Dept", type: "text", required: false },
          { key: "domain", label: "Domain", type: "text", required: true },
          { key: "start_date", label: "Start Date", type: "date", required: true },
          { key: "end_date", label: "End Date", type: "date", required: true },
        ],
      },
    ];

    for (const setupCfg of DEFAULT_SETUPS_CONFIG) {
      const matchingTmpl =
        allTemplates.find((t) => t.name.includes(setupCfg.templateMatch)) || allTemplates[0];

      if (matchingTmpl) {
        const existing = await CertificateSetup.findOne({
          institutionId,
          $or: [
            { name: setupCfg.name },
            ...(setupCfg.name.includes("Internship Program")
              ? [{ name: "Softmusk Internship Program" }]
              : []),
          ],
        });

        if (!existing) {
          await CertificateSetup.create({
            institutionId,
            name: setupCfg.name,
            templateId: matchingTmpl._id,
            programText: setupCfg.programText,
            variables: setupCfg.variables,
            folderRule: "/{{year}}/{{program}}",
            createdBy: user?._id || auth.userId,
          });
        } else {
          // Keep templateId mapped to the correct template and update program text
          const needsUpdate =
            !existing.templateId ||
            String(existing.templateId) !== String(matchingTmpl._id) ||
            existing.name !== setupCfg.name;
          if (needsUpdate) {
            await CertificateSetup.updateOne(
              { _id: existing._id },
              {
                $set: {
                  name: setupCfg.name,
                  templateId: matchingTmpl._id,
                  programText: setupCfg.programText,
                  variables: setupCfg.variables,
                },
              }
            );
          }
        }
      }
    }

    const setups = await CertificateSetup.find({ institutionId })
      .populate("templateId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, setups });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Fetch certificate setups error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
