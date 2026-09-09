"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Check, Play, Trash2, Edit3, Eye } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface Template {
  _id: string;
  name: string;
}

interface CertificateSetup {
  _id: string;
  name: string;
  templateId: Template;
  programText: string;
  variables: Array<{ key: string; label: string }>;
}

export default function SetupsPage() {
  const { success, error, info } = useToast();
  const [setups, setSetups] = useState<CertificateSetup[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [programText, setProgramText] = useState("This is to certify that {{student_name}} has successfully completed {{course}}.");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [setupsRes, tmplRes] = await Promise.all([fetch("/api/setups"), fetch("/api/templates")]);
      const setupsData = await setupsRes.json();
      const tmplData = await tmplRes.json();

      if (setupsData.setups) setSetups(setupsData.setups);
      if (tmplData.templates) {
        setTemplates(tmplData.templates);
        if (tmplData.templates.length > 0 && !templateId) {
          setTemplateId(tmplData.templates[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
      error("Failed to load program setups", "Network Error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [editingSetupId, setEditingSetupId] = useState<string | null>(null);
  const [viewingSetup, setViewingSetup] = useState<CertificateSetup | null>(null);

  const handleCreateOrUpdateSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateId || !programText) return;
    setCreating(true);

    try {
      const extractedKeys = Array.from(
        new Set(Array.from(programText.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)).map((m) => m[1].trim()))
      );

      const variables = extractedKeys.map((key) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        type: key.includes("date") ? "date" : "text",
        required: true,
      }));

      if (variables.length === 0) {
        variables.push(
          { key: "student_name", label: "Student Full Name", type: "text", required: true },
          { key: "course", label: "Course Title", type: "text", required: true }
        );
      }

      const method = editingSetupId ? "PUT" : "POST";
      const bodyPayload = editingSetupId
        ? { id: editingSetupId, name, templateId, programText, variables }
        : { name, templateId, programText, variables };

      const res = await fetch("/api/setups", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        setName("");
        setEditingSetupId(null);
        success(editingSetupId ? "Program Setup updated!" : "Program Setup created!", "Setup Saved");
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        error(errData.error || "Failed to save setup", "Error");
      }
    } catch (e) {
      console.error(e);
      error("Error saving certificate setup", "System Error");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (setup: CertificateSetup) => {
    setEditingSetupId(setup._id);
    setName(setup.name);
    setTemplateId(setup.templateId?._id || "");
    setProgramText(setup.programText);
  };

  const cancelEdit = () => {
    setEditingSetupId(null);
    setName("");
    setProgramText("This is to certify that {{student_name}} has successfully completed {{course}}.");
  };

  const handleDeleteSetup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program setup?")) return;
    try {
      const res = await fetch(`/api/setups?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        info("Program setup deleted successfully", "Deleted");
        fetchData();
      } else {
        error("Failed to delete program setup", "Delete Failed");
      }
    } catch (e) {
      console.error(e);
      error("Network error deleting setup", "Error");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Certificate Setups</h1>
        <p className="text-sm text-slate-500 mt-1">Bind visual templates to program-specific text and dynamic variable definitions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Plus className="text-sky-600" size={20} />
              {editingSetupId ? "Edit Program Setup" : "Create Program Setup"}
            </span>
            {editingSetupId && (
              <button onClick={cancelEdit} className="text-xs text-slate-500 hover:text-slate-800">
                Cancel
              </button>
            )}
          </h2>

          <form onSubmit={handleCreateOrUpdateSetup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Setup Program Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BCA Internship 2026"
                required
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Select Visual Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                {templates.map((tmpl) => (
                  <option key={tmpl._id} value={tmpl._id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Program Certificate Text</label>
              <textarea
                value={programText}
                onChange={(e) => setProgramText(e.target.value)}
                rows={4}
                required
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">Include mustache placeholders e.g. {"{{student_name}}"}, {"{{course}}"}.</p>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 rounded-lg text-sm transition-all shadow-sm shadow-sky-600/20 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {creating ? "Saving..." : editingSetupId ? "Update Certificate Setup" : "Save Certificate Setup"}
            </button>
          </form>
        </div>

        {/* Setups List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Configured Program Setups ({setups.length})</h2>

          {loadingData ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full bg-slate-200/80 rounded-xl" />
              <Skeleton className="h-28 w-full bg-slate-200/60 rounded-xl" />
              <Skeleton className="h-28 w-full bg-slate-200/60 rounded-xl" />
            </div>
          ) : setups.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No program setups configured yet"
              description="Create your first program setup to bind a visual certificate template to student dynamic fields and program-specific copy."
            />
          ) : (
            <div className="space-y-3">
              {setups.map((setup) => (
                <div key={setup._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 shadow-xs transition-all flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-900 text-base">{setup.name}</h3>
                      <span className="bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                        Template: {setup.templateId?.name || "Assigned"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                      {setup.programText}
                    </p>

                    {setup.variables && setup.variables.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-3">
                        <span className="text-[10px] text-slate-500 font-medium">Detected Fields:</span>
                        {setup.variables.map((v) => (
                          <span
                            key={v.key}
                            className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-mono px-2 py-0.5 rounded"
                          >
                            {"{{" + v.key + "}}"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setViewingSetup(setup)}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => startEdit(setup)}
                      className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSetup(setup._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1.5 rounded text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewingSetup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{viewingSetup.name}</h3>
              <button onClick={() => setViewingSetup(null)} className="text-slate-400 hover:text-slate-700 text-sm">
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Visual Template</label>
              <div className="text-sm font-semibold text-sky-600">{viewingSetup.templateId?.name || "Assigned Template"}</div>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Full Certificate Text</label>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap">
                {viewingSetup.programText}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-2">Variables ({viewingSetup.variables?.length || 0})</label>
              <div className="grid grid-cols-2 gap-2">
                {viewingSetup.variables?.map((v) => (
                  <div key={v.key} className="bg-slate-50 border border-slate-200 p-2 rounded text-xs">
                    <div className="font-semibold text-slate-900">{v.label}</div>
                    <div className="font-mono text-[10px] text-sky-600">{"{{" + v.key + "}}"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  const s = viewingSetup;
                  setViewingSetup(null);
                  startEdit(s);
                }}
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all shadow-xs"
              >
                Edit Setup
              </button>
              <button
                onClick={() => setViewingSetup(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
