"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  Calendar,
  Edit3,
  ExternalLink,
  Trash2,
  Plus,
  Search,
  Sparkles,
  RefreshCw,
  FolderKanban,
  Layout,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateItem {
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
  createdAt?: string;
  updatedAt?: string;
}

export default function SavedDesignsPage() {
  const { success, error, info } = useToast();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      error("Failed to load saved designs", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteTemplate = async (tmplId: string, tmplName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete template "${tmplName}"?\n\nThis will remove it from your workspace. Setups using this template should be updated.`
      )
    ) {
      return;
    }

    setDeletingId(tmplId);
    try {
      const res = await fetch(`/api/templates?id=${tmplId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success(`Template "${tmplName}" deleted successfully`, "Template Removed");
        setTemplates((prev) => prev.filter((t) => t._id !== tmplId));
      } else {
        error(data.error || "Failed to delete template", "Delete Error");
      }
    } catch (err) {
      console.error("Error deleting template:", err);
      error("Network error while deleting template", "Network Error");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Saved Certificate Designs
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              {templates.length} Templates
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse, inspect, and manage all visual certificate templates saved in your workspace
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh templates"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-sky-600" : "text-slate-500"} />
            <span>Refresh</span>
          </button>

          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-sky-600/20"
          >
            <Plus size={15} />
            <span>Create New Design</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search saved designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2 self-end sm:self-center">
          <Layers size={14} className="text-sky-600" />
          <span>
            Showing <strong className="text-slate-800">{filteredTemplates.length}</strong> of{" "}
            {templates.length} saved design(s)
          </span>
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-center mx-auto text-sky-600">
            <Layers size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Saved Designs Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Create your first visual certificate template using the Canva-style Template Editor.
            </p>
          </div>
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-sky-600/20"
          >
            <Plus size={15} />
            Open Template Editor
          </Link>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
          <Search size={32} className="mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">No Matching Designs Found</h3>
          <p className="text-xs text-slate-500">
            No templates match &quot;{searchQuery}&quot;. Clear your search to see all designs.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tmpl) => {
            const isLandscape = (tmpl.width || 595) > (tmpl.height || 842);
            const variableElements = (tmpl.elements || []).filter((el) => el.type === "variable");

            return (
              <div
                key={tmpl._id}
                className="bg-white border border-slate-200 hover:border-sky-300 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Preview Canvas Thumbnail */}
                <div className="relative h-48 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 overflow-hidden">
                  {tmpl.backgroundUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tmpl.backgroundUrl}
                      alt={tmpl.name}
                      className="w-full h-full object-contain rounded shadow-xs group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center gap-1.5">
                      <Layout size={32} />
                      <span className="text-xs">No Preview</span>
                    </div>
                  )}

                  {/* Badges Top Right */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="bg-white/95 backdrop-blur-xs text-sky-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      {tmpl.elements?.length || 0} Elements
                    </span>
                    <span className="bg-white/95 backdrop-blur-xs text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      {isLandscape ? "Landscape" : "Portrait"}
                    </span>
                  </div>
                </div>

                {/* Template Info Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate tracking-tight" title={tmpl.name}>
                      {tmpl.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <Calendar size={12} />
                      <span>
                        Saved {tmpl.createdAt ? new Date(tmpl.createdAt).toLocaleDateString() : "Recently"}
                      </span>
                    </div>
                  </div>

                  {/* Variables & Element Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {variableElements.length > 0 ? (
                      variableElements.slice(0, 4).map((el, i) => (
                        <span
                          key={i}
                          className="bg-sky-50 text-sky-700 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-sky-100 truncate max-w-[120px]"
                        >
                          {`{{${el.variableKey || "var"}}}`}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No variables bound</span>
                    )}
                    {variableElements.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        +{variableElements.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/templates?id=${tmpl._id}`}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit3 size={13} />
                        <span>Edit Canvas</span>
                      </Link>

                      <Link
                        href={`/dashboard/setups?templateId=${tmpl._id}`}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Use in Setup</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>

                    <button
                      onClick={() => handleDeleteTemplate(tmpl._id, tmpl.name)}
                      disabled={deletingId === tmpl._id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete design"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
