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

  const refSrc = path.join(process.cwd(), "refrence", "image.png");
  const logoSrc = path.join(process.cwd(), "public", "image.png");

  if (!fs.existsSync(refSrc)) {
    console.error("Reference image not found:", refSrc);
    return;
  }

  const baseImg = await loadImage(refSrc);
  const logoImg = await loadImage(logoSrc);
  const w = baseImg.width; // 1055
  const h = baseImg.height; // 1491

  console.log(`Processing high-res reference template: ${w}x${h}`);

  const templatesDir = path.join(process.cwd(), "public", "templates");
  if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });

  const variants = [
    {
      filename: "softmusk-internship-clean-bg.png",
      publicId: "softmusk_internship_clean_bg",
      customTitle: null,
    },
    {
      filename: "softmusk-collaboration-clean-bg.png",
      publicId: "softmusk_collaboration_clean_bg",
      customTitle: "INTERNSHIP & COLLABORATION CERTIFICATE",
      fontSize: 34,
    },
    {
      filename: "softmusk-workshop-clean-bg.png",
      publicId: "softmusk_workshop_clean_bg",
      customTitle: "WORKSHOP CERTIFICATE",
      fontSize: 46,
    },
  ];

  const results: Record<string, string> = {};

  for (const v of variants) {
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");

    // 1. Draw base reference certificate
    ctx.drawImage(baseImg, 0, 0, w, h);

    // 2. Clear student name placeholder ONLY (leaving gold line with flanking diamonds at y:574-588 completely intact!)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(205, 508, 650, 62);

    // 3. Clear body text placeholder area
    ctx.fillRect(80, 615, 895, 325);

    // 4. Clear placeholder QR code and scan text in bottom right
    ctx.fillRect(815, 940, 175, 185);

    // 5. Draw subtle Softmusk watermark in background
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.drawImage(logoImg, 295, 670, 465, 465);
    ctx.restore();

    // 6. Custom title if specified
    if (v.customTitle) {
      // Clear original "INTERNSHIP CERTIFICATE" title area
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(90, 315, 875, 80);

      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${v.fontSize}px Times, "Playfair Display", serif`;
      ctx.fillText(v.customTitle, w / 2, 355);
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
    results[v.publicId] = uploadRes.url;
  }

  console.log("\nUploaded Cloudinary URLs:");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
