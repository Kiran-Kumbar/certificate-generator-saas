import { createCanvas } from "canvas";

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
 * Measures text using Node Canvas context and calculates wrapping and dynamic font reduction
 */
export function calculateSmartFit(text: string, options: MeasureOptions): SmartFitResult {
  const canvas = createCanvas(1000, 200);
  const ctx = canvas.getContext("2d");

  let currentFontSize = options.fontSize;
  const minFontSize = options.minFontSize || 14;
  const maxLines = options.maxLines || 2;
  const maxWidth = options.maxWidth;

  let lines: string[] = [];
  let actionTaken: "none" | "wrapped" | "font_reduced" | "error" = "none";

  while (currentFontSize >= minFontSize) {
    ctx.font = `${options.fontWeight || 400} ${currentFontSize}px ${options.fontFamily || "Arial"}`;

    const textWidth = ctx.measureText(text).width;

    // Fits in single line
    if (textWidth <= maxWidth) {
      lines = [text];
      if (currentFontSize < options.fontSize) {
        actionTaken = "font_reduced";
      }
      return { lines, finalFontSize: currentFontSize, hasOverflow: false, actionTaken };
    }

    // Attempt Word Wrap
    if (options.wordWrap) {
      const words = text.split(" ");
      const tempLines: string[] = [];
      let currentLine = words[0];

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
      tempLines.push(currentLine);

      if (tempLines.length <= maxLines) {
        // Check if all lines fit within maxWidth
        const allFit = tempLines.every((l) => ctx.measureText(l).width <= maxWidth);
        if (allFit) {
          actionTaken = tempLines.length > 1 ? "wrapped" : currentFontSize < options.fontSize ? "font_reduced" : "none";
          if (currentFontSize < options.fontSize && tempLines.length > 1) {
            actionTaken = "font_reduced";
          }
          return { lines: tempLines, finalFontSize: currentFontSize, hasOverflow: false, actionTaken };
        }
      }
    }

    // Reduce font size and retry loop
    currentFontSize -= 2;
  }

  // Force wrap to max lines if minimum font size reached
  ctx.font = `${options.fontWeight || 400} ${minFontSize}px ${options.fontFamily || "Arial"}`;
  const words = text.split(" ");
  lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width <= maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  return {
    lines,
    finalFontSize: minFontSize,
    hasOverflow: lines.length > maxLines,
    actionTaken: "error",
  };
}
