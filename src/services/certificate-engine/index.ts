import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createCanvas, loadImage, registerFont } from "canvas";
import QRCode from "qrcode";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { registerBundledFonts } from "./fonts";
export { registerBundledFonts };
import { CertificateElement, CertificateRenderResult, ElementLayoutResult } from "@/types/template";
import { calculateSmartFit } from "./smart-fit";

function parseColorToRgb(hexColor?: string) {
  if (!hexColor || !hexColor.startsWith("#")) return rgb(0, 0, 0);
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length !== 6) return rgb(0, 0, 0);
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

import { formatCertificateDate } from "@/lib/format-date";
export { formatCertificateDate };

export interface TextSegment {
  text: string;
  color: string;
  bold: boolean;
}

export function parseFormattedSegments(
  raw: string,
  defaultColor: string,
  defaultBold: boolean
): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /<(blue|b|gold)>(.*?)<\/\1>|([^<]+)/g;
  let match;

  while ((match = regex.exec(raw)) !== null) {
    if (match[3]) {
      segments.push({
        text: match[3],
        color: defaultColor,
        bold: defaultBold,
      });
    } else {
      const tag = match[1];
      const inner = match[2];
      let color = defaultColor;
      let bold = defaultBold;

      if (tag === "blue") {
        color = "#03046e"; // Reference deep royal blue
        bold = true;
      } else if (tag === "gold") {
        color = "#c59b27";
        bold = true;
      } else if (tag === "b") {
        bold = true;
      }

      if (inner.includes("<")) {
        segments.push(...parseFormattedSegments(inner, color, bold));
      } else {
        segments.push({ text: inner, color, bold });
      }
    }
  }

  if (segments.length === 0 && raw) {
    segments.push({ text: raw, color: defaultColor, bold: defaultBold });
  }

  return segments;
}

export interface GenerateEngineOptions {
  backgroundUrl: string;
  elements: CertificateElement[];
  data: Record<string, unknown>;
  certificateNumber: string;
  width?: number;  // Default: 841.89 pt
  height?: number; // Default: 595.28 pt
  baseUrl?: string; // App base URL for QR code verification link
  verificationToken?: string; // Existing token if regenerating or editing
}

export const OFFICIAL_APP_URL = "https://smc.onqeva.in";

export function getAppBaseUrl(req?: Request, customUrl?: string): string {
  if (customUrl && typeof customUrl === "string") {
    const clean = customUrl.replace(/[\r\n\t\s]+/g, "").replace(/\/+$/, "");
    if (
      clean &&
      !clean.includes("localhost") &&
      !clean.includes("127.0.0.1") &&
      !clean.includes("vercel.app")
    ) {
      return clean;
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/[\r\n\t\s]+/g, "").replace(/\/+$/, "");
  if (
    envUrl &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1") &&
    !envUrl.includes("vercel.app")
  ) {
    return envUrl;
  }

  if (req) {
    try {
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      if (
        host &&
        !host.includes("localhost") &&
        !host.includes("127.0.0.1") &&
        !host.includes("vercel.app")
      ) {
        const cleanHost = host.replace(/[\r\n\t\s]+/g, "");
        return `${proto}://${cleanHost}`.replace(/\/+$/, "");
      }
    } catch {
      // ignore
    }
  }

  return OFFICIAL_APP_URL;
}

export async function generateCertificateEngine(
  options: GenerateEngineOptions
): Promise<CertificateRenderResult> {
  const docWidth = options.width || 841.89;
  const docHeight = options.height || 595.28;

  // 1. Generate or reuse Opaque Verification Secret & Token Hash
  const verificationToken = (options.verificationToken || crypto.randomBytes(16).toString("hex"))
    .trim()
    .replace(/[\r\n\t\s]+/g, "");
  const verificationCodeHash = crypto.createHash("sha256").update(verificationToken).digest("hex");

  // 2. Render Clean, Single-Line QR Code Buffer (Guaranteed no embedded newlines or spaces)
  const cleanBaseUrl = getAppBaseUrl(undefined, options.baseUrl);
  const verifyUrl = `${cleanBaseUrl}/verify/${verificationToken}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    margin: 1,
    width: 260,
    errorCorrectionLevel: "M",
  });

  // Register bundled fonts (no-op after first call)
  registerBundledFonts();

  // 3. Prepare Canvas (for PNG raster rendering)
  const canvas = createCanvas(docWidth, docHeight);
  const ctx = canvas.getContext("2d");

  // Load Background Image
  if (options.backgroundUrl) {
    try {
      let bgSource: string | Buffer = options.backgroundUrl;
      if (options.backgroundUrl.startsWith("/")) {
        const local = path.join(process.cwd(), "public", options.backgroundUrl.replace(/^\//, ""));
        if (fs.existsSync(local)) {
          bgSource = local;
        } else {
          bgSource = `${cleanBaseUrl}${options.backgroundUrl}`;
        }
      }
      const bgImg = await loadImage(bgSource);
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
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  if (options.backgroundUrl) {
    try {
      let bgBytes: Buffer | Uint8Array | null = null;
      if (options.backgroundUrl.startsWith("data:")) {
        const base64Data = options.backgroundUrl.split(",")[1];
        bgBytes = Buffer.from(base64Data, "base64");
      } else if (options.backgroundUrl.startsWith("/")) {
        const localPath = path.join(process.cwd(), "public", options.backgroundUrl.replace(/^\//, ""));
        if (fs.existsSync(localPath)) {
          bgBytes = fs.readFileSync(localPath);
        } else {
          const remoteUrl = `${cleanBaseUrl}${options.backgroundUrl}`;
          const res = await fetch(remoteUrl);
          if (res.ok) {
            bgBytes = Buffer.from(await res.arrayBuffer());
          }
        }
      } else {
        const res = await fetch(options.backgroundUrl);
        if (res.ok) {
          bgBytes = Buffer.from(await res.arrayBuffer());
        }
      }

      if (bgBytes && bgBytes.length > 0) {
        // Detect PNG by magic bytes 0x89 0x50 ('%PNG')
        const isPng = bgBytes[0] === 0x89 && bgBytes[1] === 0x50;
        const embeddedBg = isPng ? await pdfDoc.embedPng(bgBytes) : await pdfDoc.embedJpg(bgBytes);
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
  // Pre-normalize incoming data: format date values and alias fallbacks
  const normalizedData: Record<string, unknown> = { ...options.data };
  for (const [k, v] of Object.entries(options.data || {})) {
    if (k.toLowerCase().includes("date")) {
      normalizedData[k] = formatCertificateDate(v);
    } else {
      normalizedData[k] = v;
    }
  }

  // Alias fallbacks for standard certificate fields
  if (!normalizedData.student_name && normalizedData.name) {
    normalizedData.student_name = normalizedData.name;
  }
  if (!normalizedData.college_name && normalizedData.college) {
    normalizedData.college_name = normalizedData.college;
  }
  if (!normalizedData.reg_no && normalizedData.registration_no) {
    normalizedData.reg_no = normalizedData.registration_no;
  }
  if (!normalizedData.domain && (normalizedData.project_domain || normalizedData.project)) {
    normalizedData.domain = normalizedData.project_domain || normalizedData.project;
  }
  if (!normalizedData.dept && normalizedData.department) {
    normalizedData.dept = normalizedData.department;
  }

  // Note: dept and college_name are kept separate — each resolves via its own {{}} placeholder

  for (const el of renderElements) {
    if (el.hidden) continue;
    const { position } = el;

    if (el.type === "text" || el.type === "variable") {
      let rawText = "";

      if (el.type === "variable" && el.variableKey) {
        if (el.variableKey === "program_text") {
          rawText = String(normalizedData.program_text || el.content || "");
        } else {
          const val = normalizedData[el.variableKey];
          const rawVal = val !== undefined && val !== null ? String(val).trim() : (el.content || "");
          rawText = rawVal;
        }
      } else {
        rawText = el.content || "";
        // Clean up legacy spaced ribbon title
        if (rawText.replace(/\s+/g, "") === "THISISTOCERTIFYTHAT") {
          rawText = "THIS IS TO CERTIFY THAT";
        }
      }

      // Replace mustache variables e.g. {{college_name}}, {{start_date}}, {{end_date}}, {{domain}}, {{dept}}
      rawText = rawText.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
        const val = normalizedData[key];
        return val !== undefined && val !== null && val !== "" ? String(val) : "";
      });

      rawText = rawText
        .replace(/[ \t]+/g, " ")
        .replace(/,\s*,/g, ",")
        .replace(/,\s*\./g, ".")
        .trim();

      const fontSize = el.style?.fontSize || 24;
      const fontFamily = el.style?.fontFamily || "Helvetica";
      const fontWeight = el.style?.fontWeight || 400;
      const isItalic = el.style?.fontStyle === "italic";
      const hasUnderline = el.style?.textDecoration === "underline";
      const isTimes = fontFamily.toLowerCase().includes("times") || fontFamily.toLowerCase().includes("serif") || fontFamily.toLowerCase().includes("georgia") || fontFamily.toLowerCase().includes("playfair");
      const isCourier = fontFamily.toLowerCase().includes("courier") || fontFamily.toLowerCase().includes("mono");
      const isBold = fontWeight > 500;

      const explicitLines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

      let finalFontSize = fontSize;
      let linesToRender: string[] = [];

      if (explicitLines.length > 1) {
        linesToRender = explicitLines;
        finalFontSize = fontSize;

        const fontPrefix = isItalic ? "italic " : "";
        let canvasFamily = '"Times New Roman", Times, "Playfair Display"';
        let genericFallback = "serif";
        if (!isTimes) {
          canvasFamily = isCourier ? "Courier" : '"Open Sans"';
          genericFallback = isCourier ? "monospace" : "sans-serif";
        }

        let maxLineWidth = 0;
        for (const line of linesToRender) {
          const segs = parseFormattedSegments(line, el.style?.color || "#000000", isBold);
          let w = 0;
          for (const s of segs) {
            const segWeight = s.bold ? "bold" : (isBold ? "bold" : "normal");
            ctx.font = `${fontPrefix}${segWeight} ${finalFontSize}px ${canvasFamily}, ${genericFallback}`;
            w += ctx.measureText(s.text).width;
          }
          if (w > maxLineWidth) maxLineWidth = w;
        }

        if (maxLineWidth > position.width && maxLineWidth > 0) {
          const scale = position.width / maxLineWidth;
          finalFontSize = Math.max(el.smartFit?.minFontSize || 9.5, Math.floor(finalFontSize * scale * 10) / 10);
        }
      } else {
        const cleanForFit = rawText.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        const fitResult = calculateSmartFit(cleanForFit, {
          fontSize,
          fontFamily,
          fontWeight,
          maxWidth: position.width,
          maxLines: el.smartFit?.maxLines || 2,
          minFontSize: el.smartFit?.minFontSize || 14,
          wordWrap: el.smartFit?.wordWrap ?? true,
        });

        if (fitResult.hasOverflow) hasOverflow = true;
        finalFontSize = fitResult.finalFontSize;
        linesToRender = fitResult.lines.length > 1 ? fitResult.lines : [rawText];
      }

      elementLayouts.push({
        id: el.id,
        resolvedContent: rawText.replace(/<[^>]+>/g, ""),
        fontSize: finalFontSize,
        lines: linesToRender.map((l) => l.replace(/<[^>]+>/g, "")),
        overflow: false,
        actionTaken: "none",
      });

      // Render to Canvas (PNG)
      const fontPrefix = isItalic ? "italic " : "";
      const lowerFamily = fontFamily.toLowerCase();
      let canvasFamily = '"Open Sans"';
      let genericFallback = "sans-serif";
      if (lowerFamily.includes("times") || lowerFamily.includes("serif") || lowerFamily.includes("playfair")) {
        canvasFamily = '"Times New Roman", Times, "Playfair Display"';
        genericFallback = "serif";
      } else if (lowerFamily.includes("courier") || lowerFamily.includes("mono")) {
        canvasFamily = "Courier";
        genericFallback = "monospace";
      }

      const defaultColor = el.style?.color || "#000000";
      const lineHeightMultiplier = typeof el.style?.lineHeight === "number" ? el.style.lineHeight : 1.45;
      const lineHeight = finalFontSize * lineHeightMultiplier;

      // Calculate baseline offset to align with bounding box and match CSS flex centering in preview
      let firstLineBaseline: number;
      if (linesToRender.length === 1 && position.height && position.height > finalFontSize) {
        // Single line vertically centered in bounding box (matches CSS flex justify-center)
        const boxCenterY = position.y + position.height / 2;
        firstLineBaseline = boxCenterY + finalFontSize * 0.35;
      } else if (linesToRender.length > 1 && position.height && position.height >= linesToRender.length * lineHeight) {
        // Multi-line vertically centered in bounding box
        const totalTextHeight = (linesToRender.length - 1) * lineHeight + finalFontSize;
        const boxTop = position.y + (position.height - totalTextHeight) / 2;
        firstLineBaseline = boxTop + finalFontSize * 0.78;
      } else {
        // Top-aligned within bounding box: baseline starts at position.y + fontAscent
        firstLineBaseline = position.y + finalFontSize * 0.82;
      }

      linesToRender.forEach((line, index) => {
        const lineY = firstLineBaseline + index * lineHeight;
        const segments = parseFormattedSegments(line, defaultColor, isBold);

        let totalLineWidth = 0;
        const measuredCanvasSegments = segments.map((seg) => {
          const segWeight = seg.bold ? "bold" : (isBold ? "bold" : "normal");
          const fontSpec = `${fontPrefix}${segWeight} ${finalFontSize}px ${canvasFamily}, ${genericFallback}`;
          ctx.font = fontSpec;
          const w = ctx.measureText(seg.text).width;
          totalLineWidth += w;
          return { ...seg, font: fontSpec, width: w };
        });

        let currX = position.x;
        if (el.style?.textAlign === "center") {
          currX = position.x + (position.width - totalLineWidth) / 2;
        } else if (el.style?.textAlign === "right") {
          currX = position.x + position.width - totalLineWidth;
        }

        for (const seg of measuredCanvasSegments) {
          ctx.font = seg.font;
          ctx.fillStyle = seg.color;
          ctx.fillText(seg.text, currX, lineY);
          currX += seg.width;
        }

        if (hasUnderline) {
          let uX = position.x;
          if (el.style?.textAlign === "center") uX = position.x + (position.width - totalLineWidth) / 2;
          if (el.style?.textAlign === "right") uX = position.x + position.width - totalLineWidth;
          ctx.beginPath();
          ctx.lineWidth = Math.max(1, finalFontSize * 0.07);
          ctx.strokeStyle = defaultColor;
          ctx.moveTo(uX, lineY + 2);
          ctx.lineTo(uX + totalLineWidth, lineY + 2);
          ctx.stroke();
        }
      });

      // Render to PDF
      let pdfFontRegular = helveticaFont;
      let pdfFontBold = helveticaBold;
      if (isTimes) {
        pdfFontRegular = isItalic ? timesItalic : timesRoman;
        pdfFontBold = isItalic ? timesBoldItalic : timesBold;
      } else if (isCourier) {
        pdfFontRegular = courierFont;
        pdfFontBold = courierBold;
      } else {
        pdfFontRegular = isItalic ? helveticaOblique : helveticaFont;
        pdfFontBold = isItalic ? helveticaBoldOblique : helveticaBold;
      }

      linesToRender.forEach((line, index) => {
        const segments = parseFormattedSegments(line, defaultColor, isBold);

        let totalPdfWidth = 0;
        const measuredPdfSegments = segments.map((seg) => {
          const isSegBold = seg.bold || isBold;
          const segFont = isSegBold ? pdfFontBold : pdfFontRegular;

          const cleanSegText = seg.text
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u2013\u2014]/g, "-");

          const w = segFont.widthOfTextAtSize(cleanSegText, finalFontSize);
          totalPdfWidth += w;
          return { ...seg, cleanText: cleanSegText, font: segFont, width: w };
        });

        let pdfX = position.x;
        if (el.style?.textAlign === "center") {
          pdfX = position.x + (position.width - totalPdfWidth) / 2;
        } else if (el.style?.textAlign === "right") {
          pdfX = position.x + position.width - totalPdfWidth;
        }

        const pdfY = docHeight - (firstLineBaseline + index * lineHeight);

        for (const seg of measuredPdfSegments) {
          page.drawText(seg.cleanText, {
            x: pdfX,
            y: pdfY,
            size: finalFontSize,
            font: seg.font,
            color: parseColorToRgb(seg.color),
          });
          pdfX += seg.width;
        }

        if (hasUnderline) {
          let uX = position.x;
          if (el.style?.textAlign === "center") uX = position.x + (position.width - totalPdfWidth) / 2;
          if (el.style?.textAlign === "right") uX = position.x + position.width - totalPdfWidth;
          page.drawLine({
            start: { x: uX, y: pdfY - 2 },
            end: { x: uX + totalPdfWidth, y: pdfY - 2 },
            thickness: Math.max(0.75, finalFontSize * 0.06),
            color: parseColorToRgb(defaultColor),
          });
        }
      });
    } else if (el.type === "line") {
      const shapeType = el.style?.shapeType || "line";
      const lineColor = el.style?.color || el.style?.borderColor || "#c59b27";
      const lineWidth = el.style?.borderWidth || 1.5;
      const rgbColor = parseColorToRgb(lineColor);
      const startX = position.x;
      const endX = position.x + position.width;
      const centerY = position.y + position.height / 2;

      // Canvas rendering
      ctx.save();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      if (shapeType === "dashed-line") ctx.setLineDash([6, 4]);
      else if (shapeType === "dotted-line") ctx.setLineDash([2, 3]);

      if (shapeType === "double-line") {
        ctx.beginPath();
        ctx.moveTo(startX, centerY - 2);
        ctx.lineTo(endX, centerY - 2);
        ctx.moveTo(startX, centerY + 2);
        ctx.lineTo(endX, centerY + 2);
        ctx.stroke();
      } else if (shapeType === "gold-divider") {
        // Line with center decorative diamond
        const midX = startX + position.width / 2;
        ctx.beginPath();
        ctx.moveTo(startX, centerY);
        ctx.lineTo(midX - 12, centerY);
        ctx.moveTo(midX + 12, centerY);
        ctx.lineTo(endX, centerY);
        ctx.stroke();

        // Draw diamond
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(midX, centerY - 4);
        ctx.lineTo(midX + 6, centerY);
        ctx.moveTo(midX + 6, centerY);
        ctx.lineTo(midX, centerY + 4);
        ctx.lineTo(midX - 6, centerY);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(startX, centerY);
        ctx.lineTo(endX, centerY);
        ctx.stroke();
      }
      ctx.restore();

      // PDF rendering
      const pdfY = docHeight - centerY;
      if (shapeType === "double-line") {
        page.drawLine({ start: { x: startX, y: pdfY + 2 }, end: { x: endX, y: pdfY + 2 }, thickness: lineWidth, color: rgbColor });
        page.drawLine({ start: { x: startX, y: pdfY - 2 }, end: { x: endX, y: pdfY - 2 }, thickness: lineWidth, color: rgbColor });
      } else if (shapeType === "gold-divider") {
        const midX = startX + position.width / 2;
        page.drawLine({ start: { x: startX, y: pdfY }, end: { x: midX - 12, y: pdfY }, thickness: lineWidth, color: rgbColor });
        page.drawLine({ start: { x: midX + 12, y: pdfY }, end: { x: endX, y: pdfY }, thickness: lineWidth, color: rgbColor });
        page.drawRectangle({ x: midX - 3, y: pdfY - 3, width: 6, height: 6, color: rgbColor });
      } else {
        page.drawLine({ start: { x: startX, y: pdfY }, end: { x: endX, y: pdfY }, thickness: lineWidth, color: rgbColor });
      }
    } else if (el.type === "shape") {
      const shapeType = el.style?.shapeType || "rectangle";
      const bgColor = el.style?.backgroundColor ? parseColorToRgb(el.style.backgroundColor) : undefined;
      const bColor = el.style?.borderColor ? parseColorToRgb(el.style.borderColor) : undefined;
      const bWidth = el.style?.borderWidth || 1;

      // Canvas rendering
      ctx.save();
      if (el.style?.backgroundColor) {
        ctx.fillStyle = el.style.backgroundColor;
        if (shapeType === "circle") {
          ctx.beginPath();
          ctx.arc(position.x + position.width / 2, position.y + position.height / 2, Math.min(position.width, position.height) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(position.x, position.y, position.width, position.height);
        }
      }
      if (el.style?.borderColor) {
        ctx.strokeStyle = el.style.borderColor;
        ctx.lineWidth = bWidth;
        if (shapeType === "circle") {
          ctx.beginPath();
          ctx.arc(position.x + position.width / 2, position.y + position.height / 2, Math.min(position.width, position.height) / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.strokeRect(position.x, position.y, position.width, position.height);
        }
      }
      ctx.restore();

      // PDF rendering
      const pdfY = docHeight - position.y - position.height;
      if (shapeType === "circle") {
        page.drawCircle({
          x: position.x + position.width / 2,
          y: pdfY + position.height / 2,
          size: Math.min(position.width, position.height) / 2,
          color: bgColor,
          borderColor: bColor,
          borderWidth: bColor ? bWidth : 0,
        });
      } else {
        page.drawRectangle({
          x: position.x,
          y: pdfY,
          width: position.width,
          height: position.height,
          color: bgColor,
          borderColor: bColor,
          borderWidth: bColor ? bWidth : 0,
        });
      }
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
    verifyUrl,
    layout: {
      elements: elementLayouts,
      hasOverflow,
    },
  };
}
