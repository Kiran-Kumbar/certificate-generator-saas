"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, CheckCircle, Trash2 } from "lucide-react";

interface Asset {
  _id: string;
  name: string;
  type: string;
  url: string;
  cloudinaryPublicId: string;
  createdAt: string;
}

export default function AssetLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("signature");
  const [file, setFile] = useState<File | null>(null);

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      const data = await res.json();
      if (data.assets) setAssets(data.assets);
    } catch (e) {
      console.error(e);
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

      if (res.ok) {
        setName("");
        setFile(null);
        fetchAssets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Asset Library</h1>
        <p className="text-sm text-slate-400 mt-1">Upload brand signatures, logos, stamps, and seals to Cloudinary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <UploadCloud className="text-indigo-400" size={20} />
            Upload New Asset
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Asset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Director Signature"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Asset Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="signature">Signature</option>
                <option value="stamp">Stamp / Seal</option>
                <option value="logo">Institution Logo</option>
                <option value="watermark">Watermark</option>
                <option value="other">Other Image</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 mt-2"
            >
              {uploading ? "Uploading to Cloudinary..." : "Upload Asset"}
            </button>
          </form>
        </div>

        {/* Asset Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white">Stored Brand Assets ({assets.length})</h2>

          {assets.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              No assets uploaded yet. Upload a signature or stamp to use in certificate templates.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-center p-2 mb-3 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm truncate">{asset.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">
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
