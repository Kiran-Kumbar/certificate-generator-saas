import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Load .env.local
try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env.local", e);
}

import {
  getSoftmuskInternshipElements,
  getSoftmuskCollaborationElements,
  getSoftmuskWorkshopElements,
} from "../src/app/api/templates/route";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found!");
    return;
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No db connection");

  const templatesCol = db.collection("templates");
  const setupsCol = db.collection("certificatesetups");

  const templatesToSync = [
    {
      name: "Softmusk Internship Certificate (Official)",
      query: { $or: [{ name: /Internship Certificate/i }, { name: /Softmusk Internship/i }] },
      bgUrl: "https://res.cloudinary.com/dhbrorn46/image/upload/v1789030082/official_templates/softmusk_internship_clean_bg.png",
      bgPublicId: "official_templates/softmusk_internship_clean_bg",
      elements: getSoftmuskInternshipElements(),
    },
    {
      name: "Softmusk College Internship Collaboration",
      query: { name: /Collaboration/i },
      bgUrl: "https://res.cloudinary.com/dhbrorn46/image/upload/v1789030084/official_templates/softmusk_collaboration_clean_bg.png",
      bgPublicId: "official_templates/softmusk_collaboration_clean_bg",
      elements: getSoftmuskCollaborationElements(),
    },
    {
      name: "Softmusk Technical Workshop Certificate",
      query: { name: /Workshop/i },
      bgUrl: "https://res.cloudinary.com/dhbrorn46/image/upload/v1789030086/official_templates/softmusk_workshop_clean_bg.png",
      bgPublicId: "official_templates/softmusk_workshop_clean_bg",
      elements: getSoftmuskWorkshopElements(),
    },
  ];

  for (const t of templatesToSync) {
    const updateRes = await templatesCol.updateMany(t.query, {
      $set: {
        backgroundUrl: t.bgUrl,
        backgroundPublicId: t.bgPublicId,
        elements: t.elements,
        width: 595.28,
        height: 841.89,
        updatedAt: new Date(),
      },
    });
    console.log(`Updated templates matching "${t.name}": matched ${updateRes.matchedCount}, modified ${updateRes.modifiedCount}`);
  }

  // Also update setups programText
  await setupsCol.updateMany(
    { $or: [{ name: /Internship/i }] },
    {
      $set: {
        programText:
          "A student of <b>{{college_name}}</b> has successfully completed his/her internship\nfrom <blue>{{start_date}}</blue> to <blue>{{end_date}}</blue> at\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>\n\nWas able to successfully participate in and accomplish all the tasks required for\nthe project entitled <b>“{{domain}}”</b> through which\nhe/she was able to showcase his/her great work and team player skills.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern\nand we wish him/her all the best in his/her future endeavors.",
        updatedAt: new Date(),
      },
    }
  );

  await setupsCol.updateMany(
    { name: /Collaboration/i },
    {
      $set: {
        programText:
          "A student of <b>{{college_name}}</b> has successfully completed the joint industry internship program\nfrom <blue>{{start_date}}</blue> to <blue>{{end_date}}</blue> in collaboration with\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>\n\nWas able to successfully participate in and accomplish all the tasks required for the\ncollaborative project entitled <b>“{{domain}}”</b> through which\nhe/she showcased exemplary technical capability and team leadership.\n\nWe at Softmusk Info Pvt. Ltd have thoroughly enjoyed collaborating with the\nstudent and wish him/her all the best in his/her future endeavors.",
        updatedAt: new Date(),
      },
    }
  );

  await setupsCol.updateMany(
    { name: /Workshop/i },
    {
      $set: {
        programText:
          "A student of <b>{{college_name}}</b> has successfully completed the skill development workshop\non <blue>{{start_date}}</blue> conducted by\n<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>\n\nWas able to actively engage and master practical concepts in the domain of\n<b>“{{domain}}”</b> showcasing\nexceptional learning capability and dedication to practical excellence.\n\nWe at Softmusk Info Pvt. Ltd congratulate the student on this accomplishment\nand wish him/her immense success in all future technical pursuits.",
        updatedAt: new Date(),
      },
    }
  );

  console.log("Successfully synchronized all templates and setups in MongoDB!");
  await mongoose.disconnect();
}

main().catch(console.error);
