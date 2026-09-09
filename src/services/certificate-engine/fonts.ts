import { registerFont } from "canvas";
import fs from "fs";
import path from "path";

let fontsRegistered = false;

export function registerBundledFonts() {
  if (fontsRegistered) return;
  try {
    const fontDir = path.join(process.cwd(), "public", "fonts");
    const fontDefs = [
      { file: "OpenSans-Regular.ttf", family: "Open Sans", weight: "400", style: "normal" },
      { file: "OpenSans-Bold.ttf", family: "Open Sans", weight: "700", style: "normal" },
      { file: "OpenSans-Italic.ttf", family: "Open Sans", weight: "400", style: "italic" },
      { file: "OpenSans-BoldItalic.ttf", family: "Open Sans", weight: "700", style: "italic" },
      { file: "PlayfairDisplay-Regular.ttf", family: "Playfair Display", weight: "400", style: "normal" },
      { file: "PlayfairDisplay-Bold.ttf", family: "Playfair Display", weight: "700", style: "normal" },
      // Common web font aliases
      { file: "OpenSans-Regular.ttf", family: "Helvetica", weight: "400", style: "normal" },
      { file: "OpenSans-Bold.ttf", family: "Helvetica", weight: "700", style: "normal" },
      { file: "OpenSans-Italic.ttf", family: "Helvetica", weight: "400", style: "italic" },
      { file: "OpenSans-BoldItalic.ttf", family: "Helvetica", weight: "700", style: "italic" },
      { file: "PlayfairDisplay-Regular.ttf", family: "Times-Roman", weight: "400", style: "normal" },
      { file: "PlayfairDisplay-Bold.ttf", family: "Times-Roman", weight: "700", style: "normal" },
      { file: "PlayfairDisplay-Regular.ttf", family: "Times New Roman", weight: "400", style: "normal" },
      { file: "PlayfairDisplay-Bold.ttf", family: "Times New Roman", weight: "700", style: "normal" },
      { file: "PlayfairDisplay-Regular.ttf", family: "Georgia", weight: "400", style: "normal" },
      { file: "OpenSans-Regular.ttf", family: "Arial", weight: "400", style: "normal" },
      { file: "OpenSans-Bold.ttf", family: "Arial", weight: "700", style: "normal" },
    ];

    for (const f of fontDefs) {
      const fullPath = path.join(fontDir, f.file);
      if (fs.existsSync(fullPath)) {
        try {
          registerFont(fullPath, { family: f.family, weight: f.weight, style: f.style });
        } catch {
          // Ignore registration duplicates
        }
      }
    }
    fontsRegistered = true;
  } catch (err) {
    console.warn("Could not register bundled fonts:", err);
  }
}
