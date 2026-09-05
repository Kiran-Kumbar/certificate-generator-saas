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

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<boolean> {
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return res.result === "ok";
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return false;
  }
}
