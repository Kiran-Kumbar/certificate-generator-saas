import fs from "fs";
import { createCanvas } from "canvas";
import { registerBundledFonts } from "../src/services/certificate-engine";

registerBundledFonts();

interface TextSegment {
  text: string;
  color: string;
  bold: boolean;
}

function parseFormattedSegments(raw: string, defaultColor: string, defaultBold: boolean): TextSegment[] {
  const segments: TextSegment[] = [];
  // Regex to match <blue>...</blue>, <b>...</b>, <blue><b>...</b></blue>, etc.
  const regex = /<(blue|b|gold)>(.*?)<\/\1>|([^<]+)/g;
  let match;

  while ((match = regex.exec(raw)) !== null) {
    if (match[3]) {
      // Plain text
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
        color = "#002b66";
        bold = true;
      } else if (tag === "gold") {
        color = "#c59b27";
        bold = true;
      } else if (tag === "b") {
        bold = true;
      }

      // Check if nested tags exist inside inner e.g. <b> inside <blue>
      if (inner.includes("<")) {
        const sub = parseFormattedSegments(inner, color, bold);
        segments.push(...sub);
      } else {
        segments.push({ text: inner, color, bold });
      }
    }
  }

  return segments;
}

const test1 = parseFormattedSegments(
  "from <blue>25-May-2026</blue> to <blue>14-Aug-2026</blue> at",
  "#1e293b",
  false
);
console.log("Segments 1:", test1);

const test2 = parseFormattedSegments(
  "A student of <b>KLS Gogte Institute of Technology</b> has successfully completed his/her internship",
  "#1e293b",
  false
);
console.log("Segments 2:", test2);

const test3 = parseFormattedSegments(
  "<blue>“Softmusk Info Pvt. Ltd Belagavi, Karnataka.”</blue>",
  "#1e293b",
  false
);
console.log("Segments 3:", test3);
