"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface Asset {
  _id: string;
  name: string;
  type: string;
  url: string;
  cloudinaryPublicId: string;
  createdAt: string;
}

export default function AssetLibraryPage() {
  const { success, error } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("signature");
  const [file, setFile] = useState<File | null>(null);

  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await fetch("/api/assets");
      const data = await res.json();
      if (data.assets) setAssets(data.assets);
    } catch (e) {
      console.error(e);
      error("Failed to load assets", "Error");
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("type", type);

      const res = await fetch("/api/assets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        success(`Asset "${name}" uploaded successfully!`, "Asset Uploaded");
        setName("");
        setFile(null);
        fetchAssets();
      } else {
        error(data.error || "Failed to upload asset", "Upload Failed");
      }
    } catch (e) {
      console.error(e);
      error("Network error during asset upload", "Upload Error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Library</h1>
        <p className="text-sm text-slate-500 mt-1">Upload brand signatures, logos, stamps, and seals to Cloudinary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UploadCloud className="text-sky-600" size={20} />
            Upload New Asset
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Asset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Director Signature"
                required
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Asset Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="signature">Signature</option>
                <option value="stamp">Stamp / Seal</option>
                <option value="logo">Institution Logo</option>
                <option value="watermark">Watermark</option>
                <option value="other">Other Image</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Select Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 rounded-lg text-sm transition-all shadow-sm shadow-sky-600/20 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {uploading ? "Uploading to Cloudinary..." : "Upload Asset"}
            </button>
          </form>
        </div>

        {/* Asset Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Stored Brand Assets ({assets.length})</h2>

          {loadingAssets ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Skeleton className="h-44 w-full bg-slate-200/80 rounded-xl" />
              <Skeleton className="h-44 w-full bg-slate-200/60 rounded-xl" />
              <Skeleton className="h-44 w-full bg-slate-200/60 rounded-xl" />
            </div>
          ) : assets.length === 0 ? (
            <EmptyState
              icon={UploadCloud}
              title="No brand assets uploaded yet"
              description="Upload director signatures, official stamps, logos, or seals to Cloudinary to embed them into certificates."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset._id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 shadow-xs transition-all">
                  <div className="aspect-video bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center p-2 mb-3 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{asset.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded">
                        {asset.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
