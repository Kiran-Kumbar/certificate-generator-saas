import fs from "fs";
import { generateCertificateEngine } from "../src/services/certificate-engine";
import {
  getSoftmuskInternshipElements,
  getSoftmuskCollaborationElements,
  getSoftmuskWorkshopElements,
} from "../src/app/api/templates/route";

async function run() {
  const commonData = {
    student_name: "Rahul Sharma",
    college_name: "KLS Gogte Institute of Technology",
    start_date: "01-Jan-2026",
    end_date: "02-Feb-2026",
    domain: "IoT + React Full Stack Web Architecture",
  };

  console.log("Testing 1. Internship Template...");
  const res1 = await generateCertificateEngine({
    backgroundUrl: "/templates/softmusk-internship-clean-bg.png",
    elements: getSoftmuskInternshipElements(),
    data: commonData,
    certificateNumber: "SM-2026-000101",
    width: 595.28,
    height: 841.89,
    baseUrl: "https://smc.onqeva.in",
    verificationToken: "verify_token_internship_101",
  });
  fs.writeFileSync("official_internship_mr_ms.png", res1.pngBuffer);
  console.log("Official Internship rendered, size:", res1.pngBuffer.length);

  console.log("Testing 2. Collaboration Template...");
  const res2 = await generateCertificateEngine({
    backgroundUrl: "/templates/softmusk-collaboration-clean-bg.png",
    elements: getSoftmuskCollaborationElements(),
    data: commonData,
    certificateNumber: "SM-2026-COL-102",
    width: 595.28,
    height: 841.89,
    baseUrl: "https://smc.onqeva.in",
    verificationToken: "verify_token_collab_102",
  });
  fs.writeFileSync("official_collaboration_mr_ms.png", res2.pngBuffer);
  console.log("Official Collaboration rendered, size:", res2.pngBuffer.length);

  console.log("Testing 3. Workshop Template...");
  const res3 = await generateCertificateEngine({
    backgroundUrl: "/templates/softmusk-workshop-clean-bg.png",
    elements: getSoftmuskWorkshopElements(),
    data: commonData,
    certificateNumber: "SM-2026-WS-103",
    width: 595.28,
    height: 841.89,
    baseUrl: "https://smc.onqeva.in",
    verificationToken: "verify_token_ws_103",
  });
  fs.writeFileSync("official_workshop_mr_ms.png", res3.pngBuffer);
  console.log("Official Workshop rendered, size:", res3.pngBuffer.length);
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
