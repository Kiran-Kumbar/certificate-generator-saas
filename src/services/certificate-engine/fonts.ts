import { registerFont } from "canvas";
import fs from "fs";
import path from "path";
import os from "os";
import { PLAYFAIR_BOLD_BASE64, PLAYFAIR_REGULAR_BASE64 } from "./embedded-fonts";

let fontsRegistered = false;

export function registerBundledFonts() {
  if (fontsRegistered) return;
  try {
    const fontDir = path.join(process.cwd(), "public", "fonts");
    const tmpDir = path.join(os.tmpdir(), "cert_fonts");
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {
        // ignore
      }
    }

    const fontDefs = [
      { file: "Times-Regular.ttf", fallbackFile: "PlayfairDisplay-Regular.ttf", base64: PLAYFAIR_REGULAR_BASE64, family: "Times New Roman", weight: "normal", style: "normal" },
      { file: "Times-Bold.ttf", fallbackFile: "PlayfairDisplay-Bold.ttf", base64: PLAYFAIR_BOLD_BASE64, family: "Times New Roman", weight: "bold", style: "normal" },
      { file: "Times-Regular.ttf", fallbackFile: "PlayfairDisplay-Regular.ttf", base64: PLAYFAIR_REGULAR_BASE64, family: "Times-Roman", weight: "normal", style: "normal" },
      { file: "Times-Bold.ttf", fallbackFile: "PlayfairDisplay-Bold.ttf", base64: PLAYFAIR_BOLD_BASE64, family: "Times-Roman", weight: "bold", style: "normal" },
      { file: "Times-Regular.ttf", fallbackFile: "PlayfairDisplay-Regular.ttf", base64: PLAYFAIR_REGULAR_BASE64, family: "Times", weight: "normal", style: "normal" },
      { file: "Times-Bold.ttf", fallbackFile: "PlayfairDisplay-Bold.ttf", base64: PLAYFAIR_BOLD_BASE64, family: "Times", weight: "bold", style: "normal" },
      { file: "Times-Regular.ttf", fallbackFile: "PlayfairDisplay-Regular.ttf", base64: PLAYFAIR_REGULAR_BASE64, family: "Playfair Display", weight: "normal", style: "normal" },
      { file: "Times-Bold.ttf", fallbackFile: "PlayfairDisplay-Bold.ttf", base64: PLAYFAIR_BOLD_BASE64, family: "Playfair Display", weight: "bold", style: "normal" },
      { file: "Times-Regular.ttf", fallbackFile: "PlayfairDisplay-Regular.ttf", base64: PLAYFAIR_REGULAR_BASE64, family: "serif", weight: "normal", style: "normal" },
      { file: "Times-Bold.ttf", fallbackFile: "PlayfairDisplay-Bold.ttf", base64: PLAYFAIR_BOLD_BASE64, family: "serif", weight: "bold", style: "normal" },
    ];

    for (const f of fontDefs) {
      let resolvedPath = path.join(fontDir, f.file);
      if (!fs.existsSync(resolvedPath)) {
        resolvedPath = path.join(fontDir, f.fallbackFile);
      }
      if (!fs.existsSync(resolvedPath)) {
        const tmpPath = path.join(tmpDir, f.file);
        if (!fs.existsSync(tmpPath) && f.base64) {
          try {
            fs.writeFileSync(tmpPath, Buffer.from(f.base64, "base64"));
          } catch (wErr) {
            console.warn("Could not write font to tmp:", wErr);
          }
        }
        if (fs.existsSync(tmpPath)) {
          resolvedPath = tmpPath;
        }
      }

      if (fs.existsSync(resolvedPath)) {
        try {
          registerFont(resolvedPath, { family: f.family, weight: f.weight, style: f.style });
          // Also register numeric weight
          const numWeight = f.weight === "bold" ? "700" : "400";
          registerFont(resolvedPath, { family: f.family, weight: numWeight, style: f.style });
        } catch {
          // Ignore duplicate registration
        }
      }
    }
    fontsRegistered = true;
  } catch (err) {
    console.warn("Could not register bundled fonts:", err);
  }
}
