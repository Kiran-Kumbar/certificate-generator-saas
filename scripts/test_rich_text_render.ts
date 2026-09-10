import fs from "fs";
import path from "path";
import { generateCertificateEngine } from "../src/services/certificate-engine";

async function testRichRender() {
  const commonData = {
    student_name: "Ruchita Lavar",
    college_name: "KLS Gogte Institute of Technology",
    dept: "Computer Science & Engineering",
    start_date: "25-May-2026",
    end_date: "14-Aug-2026",
    domain: "AI Powered Full Stack Development",
  };

  const elements = [
    {
      id: "el_student_name",
      type: "variable",
      variableKey: "student_name",
      position: { x: 45, y: 300, width: 505, height: 42 },
      style: {
        fontSize: 26,
        fontFamily: "Times-Roman",
        fontWeight: 700,
        textAlign: "center",
        color: "#002b66",
      },
      smartFit: { enabled: true, maxLines: 1, minFontSize: 16, wordWrap: false },
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
      smartFit: { enabled: true, maxLines: 4, minFontSize: 10, wordWrap: true },
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
      smartFit: { enabled: true, maxLines: 4, minFontSize: 10, wordWrap: true },
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
      smartFit: { enabled: true, maxLines: 3, minFontSize: 10, wordWrap: true },
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
      smartFit: { enabled: true, maxLines: 2, minFontSize: 6, wordWrap: true },
    },
  ];

  console.log("Testing generation with rich inline tags...");
  const res = await generateCertificateEngine({
    backgroundUrl: "/templates/softmusk-internship-clean-bg.png",
    elements: elements as any,
    data: commonData,
    certificateNumber: "SM-2026-RICH-001",
    width: 595.28,
    height: 841.89,
    baseUrl: "https://smc.onqeva.in",
  });

  fs.writeFileSync("test_rich.png", res.pngBuffer);
  fs.writeFileSync("test_rich.pdf", res.pdfBuffer);
  console.log("Success! Saved test_rich.png and test_rich.pdf");
}

testRichRender().catch(console.error);
