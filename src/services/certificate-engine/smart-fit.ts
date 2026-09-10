import { createCanvas } from "canvas";
import { registerBundledFonts } from "./fonts";

export interface MeasureOptions {
  fontSize: number;
  fontFamily: string;
  fontWeight?: number;
  maxWidth: number;
  maxLines: number;
  minFontSize: number;
  wordWrap: boolean;
}

export interface SmartFitResult {
  lines: string[];
  finalFontSize: number;
  hasOverflow: boolean;
  actionTaken: "none" | "wrapped" | "font_reduced" | "error";
}

/**
 * Measures text using Node Canvas context and calculates wrapping and dynamic font reduction.
 * Fully compatible between local Windows and Linux (Vercel) by pre-registering bundled TTF fonts.
 */
export function calculateSmartFit(text: string, options: MeasureOptions): SmartFitResult {
  registerBundledFonts();

  const canvas = createCanvas(1200, 400);
  const ctx = canvas.getContext("2d");

  // Normalize text: strip newlines and multiple whitespace
  const cleanText = (text || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleanText) {
    return { lines: [""], finalFontSize: options.fontSize, hasOverflow: false, actionTaken: "none" };
  }

  let currentFontSize = options.fontSize;
  const minFontSize = Math.min(options.minFontSize || 10, 12);
  const maxLines = Math.max(options.maxLines || 1, 1);
  const maxWidth = Math.max(options.maxWidth || 400, 100);

  let bestLines: string[] = [cleanText];

  const lowerFamily = (options.fontFamily || "").toLowerCase();
  let canvasFamily = '"Open Sans"';
  let genericFallback = "sans-serif";
  if (lowerFamily.includes("times") || lowerFamily.includes("serif")) {
    canvasFamily = "Times";
    genericFallback = "serif";
  } else if (lowerFamily.includes("courier") || lowerFamily.includes("mono")) {
    canvasFamily = "Courier";
    genericFallback = "monospace";
  } else if (lowerFamily.includes("playfair")) {
    canvasFamily = '"Playfair Display"';
    genericFallback = "serif";
  }

  while (currentFontSize >= minFontSize) {
    ctx.font = `${options.fontWeight || 400} ${currentFontSize}px ${canvasFamily}, ${genericFallback}`;

    const textWidth = ctx.measureText(cleanText).width;

    // Fits in a single line
    if (textWidth <= maxWidth) {
      return {
        lines: [cleanText],
        finalFontSize: currentFontSize,
        hasOverflow: false,
        actionTaken: currentFontSize < options.fontSize ? "font_reduced" : "none",
      };
    }

    // Word Wrap attempt
    if (options.wordWrap && maxLines > 1) {
      const words = cleanText.split(" ").filter(Boolean);
      const tempLines: string[] = [];
      let currentLine = words[0] || "";

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width <= maxWidth) {
          currentLine += " " + word;
        } else {
          tempLines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) {
        tempLines.push(currentLine);
      }

      bestLines = tempLines;

      if (tempLines.length <= maxLines) {
        const allFit = tempLines.every((l) => ctx.measureText(l).width <= maxWidth * 1.05);
        if (allFit) {
          return {
            lines: tempLines,
            finalFontSize: currentFontSize,
            hasOverflow: false,
            actionTaken: currentFontSize < options.fontSize ? "font_reduced" : "wrapped",
          };
        }
      }
    }

    // Decrease font size and retry
    currentFontSize -= 1.5;
  }

  // If text reached minFontSize and still exceeds single line without wrap
  if (options.wordWrap || maxLines > 1) {
    const words = cleanText.split(" ").filter(Boolean);
    const fallbackLines: string[] = [];
    let cur = words[0] || "";
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if (ctx.measureText(cur + " " + word).width <= maxWidth) {
        cur += " " + word;
      } else {
        fallbackLines.push(cur);
        cur = word;
      }
    }
    if (cur) fallbackLines.push(cur);

    return {
      lines: fallbackLines,
      finalFontSize: Math.round(minFontSize),
      hasOverflow: false,
      actionTaken: "wrapped",
    };
  }

  // Single line text that was reduced to minFontSize
  return {
    lines: [cleanText],
    finalFontSize: Math.round(minFontSize),
    hasOverflow: false,
    actionTaken: "font_reduced",
  };
}
