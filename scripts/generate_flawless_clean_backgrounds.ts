import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import { v2 as cloudinary } from "cloudinary";

// Load .env.local
try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env.local", e);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

import { uploadToCloudinary } from "../src/services/storage";
import { registerBundledFonts } from "../src/services/certificate-engine";

async function main() {
  registerBundledFonts();

  const originalSrc =
    "C:/Users/kiran/.gemini/antigravity-ide/brain/045443dd-afcf-4648-b40d-f2300c0f5d55/.user_uploaded/media_1789021553205.png";
  const logoSrc = path.join(process.cwd(), "public", "image.png");

  if (!fs.existsSync(originalSrc)) {
    console.error("Original source template not found:", originalSrc);
    return;
  }

  const baseImg = await loadImage(originalSrc);
  const logoImg = await loadImage(logoSrc);
  const width = baseImg.width; // 724
  const height = baseImg.height; // 1024

  const templatesDir = path.join(process.cwd(), "public", "templates");
  if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });

  const variants = [
    {
      filename: "softmusk-internship-clean-bg.png",
      publicId: "softmusk_internship_clean_bg",
      customTitle: null, // Keep original "INTERNSHIP CERTIFICATE"
    },
    {
      filename: "softmusk-collaboration-clean-bg.png",
      publicId: "softmusk_collaboration_clean_bg",
      customTitle: "INTERNSHIP & COLLABORATION CERTIFICATE",
      fontSize: 21,
    },
    {
      filename: "softmusk-workshop-clean-bg.png",
      publicId: "softmusk_workshop_clean_bg",
      customTitle: "WORKSHOP CERTIFICATE",
      fontSize: 34,
    },
  ];

  for (const v of variants) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 1. Draw base certificate
    ctx.drawImage(baseImg, 0, 0, width, height);

    // 2. Clear content area completely (x: 35 to 689, y: 340 to 768)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(35, 340, 654, 428);

    // 3. Draw subtle Softmusk watermark in background
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.drawImage(logoImg, 202, 460, 320, 320);
    ctx.restore();

    // 4. Custom title if specified
    if (v.customTitle) {
      // Clear original title area completely between borders
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(40, 215, 644, 62);

      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${v.fontSize}px Times, "Playfair Display", serif`;
      ctx.fillText(v.customTitle, width / 2, 246);
    }

    const buf = canvas.toBuffer("image/png");
    const outPath = path.join(templatesDir, v.filename);
    fs.writeFileSync(outPath, buf);
    console.log(`Saved local template: ${outPath} (${buf.length} bytes)`);

    // Upload to Cloudinary
    console.log(`Uploading ${v.filename} to Cloudinary...`);
    const uploadRes = await uploadToCloudinary(buf, {
      folder: "official_templates",
      filename: v.publicId,
      resourceType: "image",
    });
    console.log(`Cloudinary URL: ${uploadRes.url}`);
  }

  console.log("\nAll flawless clean backgrounds successfully generated and uploaded!");
}

main().catch(console.error);
