"use client";

import { useState, useEffect } from "react";
import { Layout, Calendar, Layers, ExternalLink, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";

interface Template {
  _id: string;
  name: string;
  backgroundUrl: string;
  elements: Array<{
    id: string;
    type: string;
    variableKey?: string;
    content?: string;
  }>;
  width: number;
  height: number;
  createdAt: string;
}

export default function SavedDesignsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error("Error loading saved designs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Saved Certificate Designs</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and manage all template designs saved in your workspace
          </p>
        </div>
        <Link
          href="/dashboard/templates"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
        >
          <Layout size={18} />
          Create New Design
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400 text-sm">
          Loading saved designs...
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Layers size={48} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white">No Saved Designs Yet</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            Create your first visual certificate template in the Template Editor.
          </p>
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Go to Template Editor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => (
            <div
              key={tmpl._id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Preview Canvas Thumbnail */}
              <div className="relative h-48 bg-slate-950 border-b border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                {tmpl.backgroundUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tmpl.backgroundUrl}
                    alt={tmpl.name}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="text-slate-600 flex flex-col items-center gap-1">
                    <Layout size={32} />
                    <span className="text-xs">No Preview</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-slate-900/90 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 backdrop-blur-sm">
                  {tmpl.elements?.length || 0} Elements
                </div>
              </div>

              {/* Template Info Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white text-base truncate">{tmpl.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar size={13} />
                    <span>
                      Saved on {new Date(tmpl.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {tmpl.elements?.map((el, i) => (
                    <span
                      key={i}
                      className="bg-slate-800 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-700"
                    >
                      {el.type === "variable" ? `{{${el.variableKey || "var"}}}` : el.type}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href="/dashboard/templates"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit in Canvas
                  </Link>

                  <Link
                    href="/dashboard/setups"
                    className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
                  >
                    Use in Setup
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
