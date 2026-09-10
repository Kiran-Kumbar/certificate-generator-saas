import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Load .env.local manually
try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env.local", e);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

import { dbConnect } from "../src/lib/mongodb";
import { Template, CertificateSetup, Institution, User } from "../src/models";
import { OFFICIAL_TEMPLATES_CONFIG } from "../src/app/api/templates/route";
import { generateCertificateEngine } from "../src/services/certificate-engine";

async function runTest() {
  console.log("Connecting to MongoDB...");
  await dbConnect();

  let user = await User.findOne().populate("institutionId");
  if (!user) {
    console.error("No user found in DB!");
    process.exit(1);
  }

  const institutionId = (user.institutionId as any)?._id || user.institutionId;
  console.log("Using institutionId:", institutionId.toString());

  // 1. Seed or Upgrade Templates
  console.log("\n--- Checking Official Templates ---");
  for (const official of OFFICIAL_TEMPLATES_CONFIG) {
    let tmpl = await Template.findOne({
      institutionId,
      $or: [
        { name: official.name },
        ...(official.name.includes("Internship Certificate")
          ? [{ name: "Softmusk Internship Certificate (Portrait A4)" }]
          : []),
      ],
    });

    if (!tmpl) {
      tmpl = await Template.create({
        institutionId,
        name: official.name,
        backgroundUrl: official.backgroundUrl,
        backgroundPublicId: official.backgroundPublicId,
        width: official.width,
        height: official.height,
        elements: official.getElements(),
        createdBy: user._id,
      });
      console.log(`Created template: ${official.name}`);
    } else {
      await Template.updateOne(
        { _id: tmpl._id },
        {
          $set: {
            name: official.name,
            backgroundUrl: official.backgroundUrl,
            backgroundPublicId: official.backgroundPublicId,
            elements: official.getElements(),
          },
        }
      );
      console.log(`Updated template to latest clean version: ${official.name}`);
    }
  }

  const allTemplates = await Template.find({ institutionId });
  console.log(`Total templates for institution: ${allTemplates.length}`);
  allTemplates.forEach((t) => console.log(`  - [${t.name}] (bg: ${t.backgroundUrl})`));

  // 2. Seed or Upgrade Setups
  console.log("\n--- Checking Setups ---");
  const DEFAULT_SETUPS_CONFIG = [
    {
      name: "Softmusk Internship Program (Official)",
      templateMatch: "Internship Certificate",
      programText:
        "A student of {{college_name}}, {{dept}} has successfully completed his/her internship from {{start_date}} to {{end_date}} at “Softmusk Info Pvt. Ltd Belagavi, Karnataka.”\n\nWas able to successfully participate in and accomplish all the tasks required for the project entitled “{{domain}}” through which he/she was able to showcase his/her great work and team player skills.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern and we wish him/her all the best in his/her future endeavors.",
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
        "A student of {{college_name}}, {{dept}} has successfully completed the joint industry internship program from {{start_date}} to {{end_date}} in collaboration with “Softmusk Info Pvt. Ltd Belagavi, Karnataka.”\n\nWas able to successfully participate in and accomplish all the tasks required for the collaborative project entitled “{{domain}}” through which he/she showcased exemplary technical capability and team leadership.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed collaborating with the student and wish him/her all the best in his/her future endeavors.",
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
        "A student of {{college_name}}, {{dept}} has successfully attended and completed the intensive technical workshop on “{{domain}}” conducted by “Softmusk Info Pvt. Ltd Belagavi, Karnataka” from {{start_date}} to {{end_date}}.\n\nDemonstrated commendable dedication, active participation, and accomplished all practical lab modules, hands-on tasks, and project benchmarks.\n\nWe congratulate him/her on successfully completing this program and wish him/her continued success in all academic and professional pursuits.",
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

  for (const sCfg of DEFAULT_SETUPS_CONFIG) {
    const matchingTmpl =
      allTemplates.find((t) => t.name.includes(sCfg.templateMatch)) || allTemplates[0];

    let s = await CertificateSetup.findOne({
      institutionId,
      $or: [
        { name: sCfg.name },
        ...(sCfg.name.includes("Internship Program")
          ? [{ name: "Softmusk Internship Program" }]
          : []),
      ],
    });

    if (!s) {
      s = await CertificateSetup.create({
        institutionId,
        name: sCfg.name,
        templateId: matchingTmpl._id,
        programText: sCfg.programText,
        variables: sCfg.variables,
        folderRule: "/{{year}}/{{program}}",
        createdBy: user._id,
      });
      console.log(`Created setup: ${sCfg.name} -> template [${matchingTmpl.name}]`);
    } else {
      await CertificateSetup.updateOne(
        { _id: s._id },
        {
          $set: {
            name: sCfg.name,
            templateId: matchingTmpl._id,
            programText: sCfg.programText,
            variables: sCfg.variables,
          },
        }
      );
      console.log(`Updated setup: ${sCfg.name} -> template [${matchingTmpl.name}]`);
    }
  }

  // 3. Render Test Certificates for each template
  console.log("\n--- Testing Render for Each Template ---");
  const testOutputDir = path.join(process.cwd(), "scripts", "test_output");
  if (!fs.existsSync(testOutputDir)) fs.mkdirSync(testOutputDir, { recursive: true });

  const testCases = [
    {
      templateName: "Softmusk Internship Certificate (Official)",
      data: {
        student_name: "Ruchita Lavar",
        college_name: "KLS Gogte Institute of Technology",
        dept: "Computer Science & Engineering",
        domain: "AI Powered Full Stack Development",
        start_date: "25-May-2026",
        end_date: "14-Aug-2026",
      },
      filePrefix: "official_internship",
    },
    {
      templateName: "Softmusk College Internship Collaboration",
      data: {
        student_name: "Siddharth Raghavendra Kulkarni",
        college_name: "Visvesvaraya Technological University",
        dept: "Information Science & Engineering",
        domain: "Cloud Native Microservices Architecture",
        start_date: "15-Jan-2026",
        end_date: "15-Jun-2026",
      },
      filePrefix: "official_collaboration",
    },
    {
      templateName: "Softmusk Technical Workshop Certificate",
      data: {
        student_name: "Rahul Sharma",
        college_name: "B T Patil & Sons Polytechnic",
        dept: "CSE Dept",
        domain: "Hands-on Full Stack React & Node.js",
        start_date: "01-Aug-2026",
        end_date: "07-Aug-2026",
      },
      filePrefix: "official_workshop",
    },
  ];

  for (const tc of testCases) {
    const tmpl = allTemplates.find((t) => t.name === tc.templateName);
    if (!tmpl) {
      console.error(`Template not found: ${tc.templateName}`);
      continue;
    }

    console.log(`\nRendering certificate for "${tc.templateName}"...`);
    const renderResult = await generateCertificateEngine({
      backgroundUrl: tmpl.backgroundUrl,
      elements: tmpl.elements as any,
      data: tc.data,
      certificateNumber: `SM-2026-TEST-${tc.filePrefix.toUpperCase()}`,
      width: tmpl.width,
      height: tmpl.height,
      baseUrl: "https://smc.onqeva.in",
    });

    const pngPath = path.join(testOutputDir, `${tc.filePrefix}.png`);
    const pdfPath = path.join(testOutputDir, `${tc.filePrefix}.pdf`);
    fs.writeFileSync(pngPath, renderResult.pngBuffer);
    fs.writeFileSync(pdfPath, renderResult.pdfBuffer);

    console.log(`Success! PNG (${renderResult.pngBuffer.length} bytes), PDF (${renderResult.pdfBuffer.length} bytes)`);
    console.log(`Saved to ${pngPath} and ${pdfPath}`);
  }

  console.log("\nALL TESTS COMPLETED SUCCESSFULLY!");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
