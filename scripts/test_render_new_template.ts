import fs from "fs";
import { generateCertificateEngine } from "../src/services/certificate-engine";

async function testAll3Templates() {
  const commonData = {
    student_name: "Ruchita Lavar",
    college_name: "KLS Gogte Institute of Technology",
    dept: "Computer Science & Engineering",
    start_date: "25-May-2026",
    end_date: "14-Aug-2026",
    domain: "AI Powered Full Stack Development",
  };

  // 1. Standard Internship
  const res1 = await generateCertificateEngine({
    backgroundUrl: "/templates/softmusk-internship-clean-bg.png",
    elements: [
      {
        id: "el_student_name",
        type: "variable",
        variableKey: "student_name",
        position: { x: 45, y: 298, width: 505, height: 42 },
        style: { fontSize: 26, fontFamily: "Times-Roman", fontWeight: 700, textAlign: "center", color: "#002b66" },
        smartFit: { enabled: true, maxLines: 1, minFontSize: 16, wordWrap: false },
      },
      {
        id: "el_para_1",
        type: "text",
        content: "A student of {{college_name}} has successfully completed his/her internship from {{start_date}} to {{end_date}} at \u201cSoftmusk Info Pvt. Ltd Belagavi, Karnataka.\u201d",
        position: { x: 45, y: 350, width: 505, height: 62 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 3, minFontSize: 10, wordWrap: true },
      },
      {
        id: "el_para_2",
        type: "text",
        content: "Was able to successfully participate in and accomplish all the tasks required for the project entitled \u201c{{domain}}\u201d through which he/she was able to showcase his/her great work and team player skills.",
        position: { x: 45, y: 418, width: 505, height: 55 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 3, minFontSize: 10, wordWrap: true },
      },
      {
        id: "el_para_3",
        type: "text",
        content: "We at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern and we wish him/her all the best in his/her future endeavors.",
        position: { x: 45, y: 478, width: 505, height: 45 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 2, minFontSize: 10, wordWrap: true },
      },
      { id: "el_qr_token", type: "qr", position: { x: 468, y: 525, width: 72, height: 72 } },
      {
        id: "el_qr_label",
        type: "text",
        content: "Scan the QR code to verify this certificate",
        position: { x: 430, y: 600, width: 148, height: 22 },
        style: { fontSize: 7.5, fontFamily: "Helvetica", fontWeight: 400, textAlign: "center", color: "#475569" },
        smartFit: { enabled: true, maxLines: 2, minFontSize: 6, wordWrap: true },
      },
    ],
    data: commonData,
    certificateNumber: "SM-2026-000001",
    width: 595.28,
    height: 841.89,
    baseUrl: "https://smc.onqeva.in",
    verificationToken: "token_internship_001",
  });
  fs.writeFileSync("test_internship.png", res1.pngBuffer);
  console.log("Rendered 1. Standard Internship:", res1.pngBuffer.length, "bytes");

  // 2. College Collaboration
  const res2 = await generateCertificateEngine({
    backgroundUrl: "/templates/softmusk-collaboration-clean-bg.png",
    elements: [
      {
        id: "el_student_name",
        type: "variable",
        variableKey: "student_name",
        position: { x: 45, y: 298, width: 505, height: 42 },
        style: { fontSize: 26, fontFamily: "Times-Roman", fontWeight: 700, textAlign: "center", color: "#002b66" },
        smartFit: { enabled: true, maxLines: 1, minFontSize: 16, wordWrap: false },
      },
      {
        id: "el_para_1",
        type: "text",
        content: "A student of {{college_name}}, {{dept}} has successfully completed the joint industry internship program from {{start_date}} to {{end_date}} in collaboration with \u201cSoftmusk Info Pvt. Ltd Belagavi, Karnataka.\u201d",
        position: { x: 45, y: 350, width: 505, height: 62 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 3, minFontSize: 10, wordWrap: true },
      },
      {
        id: "el_para_2",
        type: "text",
        content: "Was able to successfully participate in and accomplish all the tasks required for the collaborative project entitled \u201c{{domain}}\u201d through which he/she showcased exemplary technical capability and team leadership.",
        position: { x: 45, y: 418, width: 505, height: 55 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 3, minFontSize: 10, wordWrap: true },
      },
      {
        id: "el_para_3",
        type: "text",
        content: "We at Softmusk Info Pvt. Ltd have thoroughly enjoyed collaborating with the student and wish him/her all the best in his/her future endeavors.",
        position: { x: 45, y: 478, width: 505, height: 45 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 2, minFontSize: 10, wordWrap: true },
      },
      { id: "el_qr_token", type: "qr", position: { x: 468, y: 525, width: 72, height: 72 } },
      {
        id: "el_qr_label",
        type: "text",
        content: "Scan the QR code to verify this certificate",
        position: { x: 430, y: 600, width: 148, height: 22 },
        style: { fontSize: 7.5, fontFamily: "Helvetica", fontWeight: 400, textAlign: "center", color: "#475569" },
        smartFit: { enabled: true, maxLines: 2, minFontSize: 6, wordWrap: true },
      },
    ],
    data: commonData,
    certificateNumber: "SM-2026-COL-001",
    width: 595.28,
    height: 841.89,
    baseUrl: "https://smc.onqeva.in",
    verificationToken: "token_collab_001",
  });
  fs.writeFileSync("test_collab.png", res2.pngBuffer);
  console.log("Rendered 2. College Collaboration:", res2.pngBuffer.length, "bytes");

  // 3. Workshop
  const res3 = await generateCertificateEngine({
    backgroundUrl: "/templates/softmusk-workshop-clean-bg.png",
    elements: [
      {
        id: "el_student_name",
        type: "variable",
        variableKey: "student_name",
        position: { x: 45, y: 298, width: 505, height: 42 },
        style: { fontSize: 26, fontFamily: "Times-Roman", fontWeight: 700, textAlign: "center", color: "#002b66" },
        smartFit: { enabled: true, maxLines: 1, minFontSize: 16, wordWrap: false },
      },
      {
        id: "el_para_1",
        type: "text",
        content: "A student of {{college_name}}, {{dept}} has successfully attended and completed the intensive technical workshop on \u201c{{domain}}\u201d conducted by \u201cSoftmusk Info Pvt. Ltd Belagavi, Karnataka\u201d from {{start_date}} to {{end_date}}.",
        position: { x: 45, y: 350, width: 505, height: 62 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 3, minFontSize: 10, wordWrap: true },
      },
      {
        id: "el_para_2",
        type: "text",
        content: "Demonstrated commendable dedication, active participation, and accomplished all practical lab modules, hands-on tasks, and project benchmarks.",
        position: { x: 45, y: 418, width: 505, height: 55 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 3, minFontSize: 10, wordWrap: true },
      },
      {
        id: "el_para_3",
        type: "text",
        content: "We congratulate him/her on successfully completing this program and wish him/her continued success in all academic and professional pursuits.",
        position: { x: 45, y: 478, width: 505, height: 45 },
        style: { fontSize: 13, fontFamily: "Times-Roman", fontWeight: 400, textAlign: "center", color: "#1e293b", lineHeight: 1.45 },
        smartFit: { enabled: true, maxLines: 2, minFontSize: 10, wordWrap: true },
      },
      { id: "el_qr_token", type: "qr", position: { x: 468, y: 525, width: 72, height: 72 } },
      {
        id: "el_qr_label",
        type: "text",
        content: "Scan the QR code to verify this certificate",
        position: { x: 430, y: 600, width: 148, height: 22 },
        style: { fontSize: 7.5, fontFamily: "Helvetica", fontWeight: 400, textAlign: "center", color: "#475569" },
        smartFit: { enabled: true, maxLines: 2, minFontSize: 6, wordWrap: true },
      },
    ],
    data: commonData,
    certificateNumber: "SM-2026-WS-001",
    width: 595.28,
    height: 841.89,
    baseUrl: "https://smc.onqeva.in",
    verificationToken: "token_workshop_001",
  });
  fs.writeFileSync("test_workshop.png", res3.pngBuffer);
  console.log("Rendered 3. Workshop Certificate:", res3.pngBuffer.length, "bytes");
}

testAll3Templates().catch(console.error);

