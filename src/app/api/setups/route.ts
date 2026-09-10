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
          "A student of <b>{{college_name}}</b> has successfully completed his/her internship\nfrom <blue>{{start_date}}</blue> to <blue>{{end_date}}</blue> at\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>\n\nWas able to successfully participate in and accomplish all the tasks required for\nthe project entitled <b>“{{domain}}”</b> through which\nhe/she was able to showcase his/her great work and team player skills.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern\nand we wish him/her all the best in his/her future endeavors.",
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
          "A student of <b>{{college_name}}</b> has successfully completed the joint industry internship program\nfrom <blue>{{start_date}}</blue> to <blue>{{end_date}}</blue> in collaboration with\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>\n\nWas able to successfully participate in and accomplish all the tasks required for the\ncollaborative project entitled <b>“{{domain}}”</b> through which\nhe/she showcased exemplary technical capability and team leadership.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed collaborating with the\nstudent and wish him/her all the best in his/her future endeavors.",
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
          "A student of <b>{{college_name}}</b> has successfully completed the skill development workshop\non <blue>{{start_date}}</blue> conducted by\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>\n\nWas able to actively engage and master practical concepts in the domain of\n<b>“{{domain}}”</b> showcasing\nexceptional learning capability and dedication to practical excellence.\n\nWe at Softmusk Info Pvt. Ltd congratulate the student on this accomplishment\nand wish him/her immense success in all future technical pursuits.",
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
