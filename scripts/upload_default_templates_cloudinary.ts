import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Load .env.local manually
try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
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

async function main() {
  const templatesDir = path.join(process.cwd(), "public", "templates");
  const files = [
    {
      name: "softmusk-internship-clean-bg.png",
      publicId: "softmusk_internship_clean_bg",
    },
    {
      name: "softmusk-collaboration-clean-bg.png",
      publicId: "softmusk_collaboration_clean_bg",
    },
    {
      name: "softmusk-workshop-clean-bg.png",
      publicId: "softmusk_workshop_clean_bg",
    },
  ];

  const results: Record<string, string> = {};

  for (const f of files) {
    const filePath = path.join(templatesDir, f.name);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    const buf = fs.readFileSync(filePath);
    console.log(`Uploading ${f.name} (${buf.length} bytes)...`);
    const res = await uploadToCloudinary(buf, {
      folder: "official_templates",
      filename: f.publicId,
      resourceType: "image",
    });
    console.log(`Uploaded ${f.name} -> ${res.url}`);
    results[f.publicId] = res.url;
  }

  console.log("\n--- Cloudinary URLs ---");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
