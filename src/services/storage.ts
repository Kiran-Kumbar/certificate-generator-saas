import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder: string;
  filename?: string;
  resourceType?: "image" | "raw" | "auto";
}

export interface StoredAsset {
  storageKey: string;
  url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: UploadOptions
): Promise<StoredAsset> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary credentials missing, using local data URL fallback.");
    const mimeType = options.resourceType === "raw" ? "application/pdf" : "image/png";
    const base64 = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;
    return {
      storageKey: `local_${Date.now()}_${options.filename || "file"}`,
      url: dataUrl,
      format: options.resourceType || "png",
      bytes: fileBuffer.length,
      width: 841,
      height: 595,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.filename,
        resource_type: options.resourceType || "auto",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Upload failed"));
        }
        resolve({
          storageKey: result.public_id,
          url: result.secure_url,
          format: result.format || options.resourceType || "unknown",
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export function extractCloudinaryPublicId(url: string, resourceType: "image" | "raw"): string | null {
  try {
    if (!url || url.startsWith("data:")) return null;
    if (resourceType === "raw") {
      const match = url.match(/\/raw\/upload\/(?:v\d+\/)?([^\?#]+)/);
      return match ? match[1] : null;
    } else {
      const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      return match ? match[1] : null;
    }
  } catch {
    return null;
  }
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<boolean> {
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (res.result === "ok") return true;

    // Fallback for raw files: try with or without .pdf extension
    if (resourceType === "raw") {
      const altId = publicId.endsWith(".pdf") ? publicId.slice(0, -4) : `${publicId}.pdf`;
      const retryRes = await cloudinary.uploader.destroy(altId, { resource_type: "raw" });
      return retryRes.result === "ok";
    }
    return false;
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return false;
  }
}
