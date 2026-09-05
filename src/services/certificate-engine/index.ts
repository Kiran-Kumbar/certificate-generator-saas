import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";
import crypto from "crypto";
import { CertificateElement, CertificateRenderResult, ElementLayoutResult } from "@/types/template";
import { calculateSmartFit } from "./smart-fit";

export interface GenerateEngineOptions {
  backgroundUrl: string;
  elements: CertificateElement[];
  data: Record<string, unknown>;
  certificateNumber: string;
  width?: number;  // Default: 841.89 pt
  height?: number; // Default: 595.28 pt
}

export async function generateCertificateEngine(
  options: GenerateEngineOptions
): Promise<CertificateRenderResult> {
  const docWidth = options.width || 841.89;
  const docHeight = options.height || 595.28;

  // 1. Generate Opaque Verification Secret & Token Hash
  const verificationToken = crypto.randomBytes(16).toString("hex");
  const verificationCodeHash = crypto.createHash("sha256").update(verificationToken).digest("hex");

  // 2. Render QR Code Buffer
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${verificationToken}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, { margin: 1, width: 200 });

  // 3. Prepare Canvas (for PNG raster rendering)
  const canvas = createCanvas(docWidth, docHeight);
  const ctx = canvas.getContext("2d");

  // Load Background Image
  if (options.backgroundUrl) {
    try {
      const bgImg = await loadImage(options.backgroundUrl);
      ctx.drawImage(bgImg, 0, 0, docWidth, docHeight);
    } catch (e) {
      console.warn("Failed to load background image for PNG rendering:", e);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, docWidth, docHeight);
    }
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, docWidth, docHeight);
  }

  // 4. Prepare pdf-lib (for vector PDF rendering)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([docWidth, docHeight]);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (options.backgroundUrl) {
    try {
      let embeddedBg;
      if (options.backgroundUrl.startsWith("data:")) {
        const base64Data = options.backgroundUrl.split(",")[1];
        const bgBytes = Buffer.from(base64Data, "base64");
        if (options.backgroundUrl.startsWith("data:image/png")) {
          embeddedBg = await pdfDoc.embedPng(bgBytes);
        } else {
          embeddedBg = await pdfDoc.embedJpg(bgBytes);
        }
      } else {
        const bgImageBytes = await fetch(options.backgroundUrl).then((res) => res.arrayBuffer());
        if (options.backgroundUrl.endsWith(".png")) {
          embeddedBg = await pdfDoc.embedPng(bgImageBytes);
        } else {
          embeddedBg = await pdfDoc.embedJpg(bgImageBytes);
        }
      }
      if (embeddedBg) {
        page.drawImage(embeddedBg, {
          x: 0,
          y: 0,
          width: docWidth,
          height: docHeight,
        });
      }
    } catch (e) {
      console.warn("Failed to embed PDF background image:", e);
    }
  }

  // Fallback: If template elements array is empty, inject default elements for student name, course, and QR token
  let renderElements = options.elements && options.elements.length > 0 ? options.elements : [];

  if (renderElements.length === 0) {
    renderElements = [
      {
        id: "default_student_name",
        type: "variable",
        variableKey: "student_name",
        position: { x: 120, y: 220, width: 601, height: 40 },
        style: { fontSize: 26, fontFamily: "Helvetica", fontWeight: 700, textAlign: "center", color: "#1e1b4b" },
        smartFit: { enabled: true, maxLines: 2, minFontSize: 16, wordWrap: true },
      },
      {
        id: "default_program_text",
        type: "variable",
        variableKey: "program_text",
        position: { x: 100, y: 270, width: 641, height: 160 },
        style: { fontSize: 13, fontFamily: "Helvetica", fontWeight: 400, textAlign: "center", color: "#334155" },
        smartFit: { enabled: true, maxLines: 8, minFontSize: 9, wordWrap: true },
      },
      {
        id: "default_qr",
        type: "qr",
        position: { x: 380, y: 440, width: 75, height: 75 },
      },
    ];
  }

  const elementLayouts: ElementLayoutResult[] = [];
  let hasOverflow = false;

  // 5. Process Elements Pipeline
  for (const el of renderElements) {
    const { position } = el;

    if (el.type === "text" || el.type === "variable") {
      let rawText = el.content || "";

      // If variableKey is program_text or content is empty, check options.data.program_text
      if (el.variableKey === "program_text" || (!rawText && options.data.program_text)) {
        rawText = String(options.data.program_text || rawText);
      } else if (el.type === "variable" && el.variableKey) {
        rawText = String(options.data[el.variableKey] ?? rawText);
      }

      // Replace all embedded mustache variables e.g. {{student_name}}, {{reg_no}}, {{college_name}}
      rawText = rawText.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
        return String(options.data[key] ?? `{{${key}}}`);
      });

      const fontSize = el.style?.fontSize || 24;
      const fontFamily = el.style?.fontFamily || "Helvetica";
      const fontWeight = el.style?.fontWeight || 400;

      const fitResult = calculateSmartFit(rawText, {
        fontSize,
        fontFamily,
        fontWeight,
        maxWidth: position.width,
        maxLines: el.smartFit?.maxLines || 2,
        minFontSize: el.smartFit?.minFontSize || 14,
        wordWrap: el.smartFit?.wordWrap ?? true,
      });

      if (fitResult.hasOverflow) hasOverflow = true;

      elementLayouts.push({
        id: el.id,
        resolvedContent: rawText,
        fontSize: fitResult.finalFontSize,
        lines: fitResult.lines,
        overflow: fitResult.hasOverflow,
        actionTaken: fitResult.actionTaken,
      });

      // Render to Canvas (PNG)
      ctx.font = `${fontWeight} ${fitResult.finalFontSize}px ${fontFamily}, sans-serif`;
      ctx.fillStyle = el.style?.color || "#000000";
      ctx.textAlign = (el.style?.textAlign as CanvasTextAlign) || "left";

      const lineHeight = fitResult.finalFontSize * 1.2;
      let startX = position.x;
      if (el.style?.textAlign === "center") startX = position.x + position.width / 2;
      if (el.style?.textAlign === "right") startX = position.x + position.width;

      fitResult.lines.forEach((line, index) => {
        ctx.fillText(line, startX, position.y + (index + 1) * lineHeight);
      });

      // Render to PDF
      const pdfFont = fontWeight > 500 ? helveticaBold : helveticaFont;
      fitResult.lines.forEach((line, index) => {
        const textWidth = pdfFont.widthOfTextAtSize(line, fitResult.finalFontSize);
        let pdfX = position.x;
        if (el.style?.textAlign === "center") pdfX = position.x + (position.width - textWidth) / 2;
        if (el.style?.textAlign === "right") pdfX = position.x + position.width - textWidth;

        // pdf-lib origin is bottom-left
        const pdfY = docHeight - (position.y + (index + 1) * lineHeight);

        page.drawText(line, {
          x: pdfX,
          y: pdfY,
          size: fitResult.finalFontSize,
          font: pdfFont,
          color: rgb(0, 0, 0),
        });
      });
    } else if (el.type === "qr") {
      // Draw QR on Canvas
      try {
        const qrImage = await loadImage(qrBuffer);
        ctx.drawImage(qrImage, position.x, position.y, position.width, position.height);
      } catch (e) {
        console.warn("Failed rendering QR to canvas:", e);
      }

      // Draw QR on PDF
      try {
        const pdfQr = await pdfDoc.embedPng(qrBuffer);
        page.drawImage(pdfQr, {
          x: position.x,
          y: docHeight - position.y - position.height,
          width: position.width,
          height: position.height,
        });
      } catch (e) {
        console.warn("Failed embedding QR to PDF:", e);
      }
    } else if (el.type === "signature" || el.type === "stamp" || el.type === "image") {
      if (el.cloudinaryUrl) {
        try {
          const img = await loadImage(el.cloudinaryUrl);
          ctx.drawImage(img, position.x, position.y, position.width, position.height);

          const imgBytes = await fetch(el.cloudinaryUrl).then((r) => r.arrayBuffer());
          let pdfImg;
          if (el.cloudinaryUrl.endsWith(".png")) {
            pdfImg = await pdfDoc.embedPng(imgBytes);
          } else {
            pdfImg = await pdfDoc.embedJpg(imgBytes);
          }
          page.drawImage(pdfImg, {
            x: position.x,
            y: docHeight - position.y - position.height,
            width: position.width,
            height: position.height,
          });
        } catch (e) {
          console.warn("Failed loading asset element:", e);
        }
      }
    }
  }

  const pngBuffer = canvas.toBuffer("image/png");
  const pdfBytes = await pdfDoc.save();

  return {
    pdfBuffer: Buffer.from(pdfBytes),
    pngBuffer,
    certificateNumber: options.certificateNumber,
    verificationToken,
    verificationCodeHash,
    layout: {
      elements: elementLayouts,
      hasOverflow,
    },
  };
}
