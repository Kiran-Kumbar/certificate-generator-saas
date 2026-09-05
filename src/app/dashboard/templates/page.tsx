"use client";

import { useState, useEffect } from "react";
import { FolderKanban, Plus, Save, Type, Image as ImageIcon, QrCode, Sparkles } from "lucide-react";
import { CertificateElement } from "@/types/template";

interface Template {
  _id: string;
  name: string;
  backgroundUrl: string;
  elements: CertificateElement[];
  width: number;
  height: number;
}

interface Asset {
  _id: string;
  name: string;
  type: string;
  url: string;
}

export default function TemplateEditorPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  // Editor State
  const [name, setName] = useState("");
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (bgFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(bgFile);
    } else {
      setPreviewUrl("");
    }
  }, [bgFile]);
  const [elements, setElements] = useState<CertificateElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const fetchData = async () => {
    try {
      const [tmplRes, assetRes] = await Promise.all([fetch("/api/templates"), fetch("/api/assets")]);
      const tmplData = await tmplRes.json();
      const assetData = await assetRes.json();

      if (tmplData.templates) {
        setTemplates(tmplData.templates);
        if (tmplData.templates.length > 0 && !activeTemplate) {
          loadTemplateIntoEditor(tmplData.templates[0]);
        }
      }
      if (assetData.assets) setAssets(assetData.assets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadTemplateIntoEditor = (tmpl: Template) => {
    setActiveTemplate(tmpl);
    setName(tmpl.name);
    setElements(tmpl.elements || []);
  };

  const [error, setError] = useState("");

  const handleSaveExistingTemplate = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeTemplate._id,
          name: name || activeTemplate.name,
          elements,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save template");
      }

      setActiveTemplate(data.template);
      await fetchData();
      alert("Template elements and layout saved successfully!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error saving template");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgFile || !name) {
      setError("Please enter a Template Title and select a Background File.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", bgFile);
      formData.append("name", name);
      formData.append("elements", JSON.stringify(elements));

      const res = await fetch("/api/templates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create template");
      }

      setBgFile(null);
      setActiveTemplate(data.template);
      await fetchData();
      alert("Template created successfully!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating template");
    } finally {
      setSaving(false);
    }
  };

  const addElement = (type: CertificateElement["type"], variableKey?: string, cloudinaryUrl?: string) => {
    const defaultWidth = type === "text" ? 600 : 250;
    const defaultHeight = type === "text" ? 120 : 40;

    const newEl: CertificateElement = {
      id: "el_" + Date.now(),
      type,
      variableKey: variableKey || (type === "variable" ? "student_name" : undefined),
      content: type === "text" ? "Sample Text" : undefined,
      cloudinaryUrl,
      position: { x: 120, y: 220, width: defaultWidth, height: defaultHeight },
      style: {
        fontSize: 24,
        fontFamily: "Helvetica",
        fontWeight: 400,
        textAlign: "center",
        color: "#000000",
      },
      smartFit: {
        enabled: true,
        maxLines: 8,
        minFontSize: 12,
        wordWrap: true,
      },
    };

    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const updateSelectedElement = (updates: Partial<CertificateElement>) => {
    if (!selectedElementId) return;
    setElements(elements.map((el) => (el.id === selectedElementId ? { ...el, ...updates } : el)));
  };

  const selectedEl = elements.find((el) => el.id === selectedElementId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Visual Template Canvas Editor</h1>
          <p className="text-sm text-slate-400 mt-1">Design certificate layouts with dynamic variable positioning (in pt points)</p>
        </div>

        {activeTemplate && (
          <button
            onClick={handleSaveExistingTemplate}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Template"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Add Elements</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addElement("variable", "student_name")}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-lg text-xs font-medium text-white flex flex-col items-center gap-1 transition-all"
              >
                <Sparkles size={16} className="text-indigo-400" />
                Student Name
              </button>
              <button
                onClick={() => addElement("variable", "course")}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-lg text-xs font-medium text-white flex flex-col items-center gap-1 transition-all"
              >
                <Sparkles size={16} className="text-indigo-400" />
                Course Variable
              </button>
              <button
                onClick={() => addElement("text")}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-lg text-xs font-medium text-white flex flex-col items-center gap-1 transition-all"
              >
                <Type size={16} className="text-indigo-400" />
                Static Text
              </button>
              <button
                onClick={() => addElement("qr")}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-lg text-xs font-medium text-white flex flex-col items-center gap-1 transition-all"
              >
                <QrCode size={16} className="text-indigo-400" />
                QR Code Token
              </button>
            </div>
          </div>

          {/* Asset Stamp/Signature Insert */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Insert Brand Assets</h2>
            {assets.length === 0 ? (
              <p className="text-xs text-slate-500">No assets uploaded. Upload signatures or stamps in Asset Library first.</p>
            ) : (
              <div className="space-y-2">
                {assets.map((asset) => (
                  <button
                    key={asset._id}
                    onClick={() => addElement("signature", undefined, asset.url)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-2 rounded-lg text-xs font-medium text-white flex items-center gap-3 transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.name} className="w-6 h-6 object-contain" />
                    <span className="truncate">{asset.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upload Blank Background Template */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Upload Background Base</h2>

            {error && (
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateNewTemplate} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template Title"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              />
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setBgFile(e.target.files?.[0] || null)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-[10px] file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-xs font-medium transition-all"
              >
                {saving ? "Creating Template..." : "Create Template"}
              </button>
            </form>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[500px] overflow-auto">
          {!activeTemplate && !bgFile ? (
            <div className="text-center text-slate-500 space-y-2">
              <FolderKanban size={40} className="mx-auto text-slate-600" />
              <p className="text-sm">Upload a blank certificate background to open canvas editor.</p>
            </div>
          ) : (
            <div
              className="relative bg-slate-950 border border-slate-800 shadow-2xl rounded overflow-hidden flex items-center justify-center p-4"
              style={{
                width: "650px",
                height: "460px",
              }}
            >
              <div
                className="relative bg-white shadow-xl overflow-hidden cursor-crosshair"
                style={{
                  width: "600px",
                  height: "424px",
                  backgroundImage: activeTemplate?.backgroundUrl
                    ? `url("${activeTemplate.backgroundUrl}")`
                    : previewUrl
                    ? `url("${previewUrl}")`
                    : undefined,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
                onMouseMove={(e) => {
                  if (!isDragging || !selectedElementId) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const scale = 841.89 / 600; // convert canvas px back to pt points
                  const mouseX = (e.clientX - rect.left - dragOffset.x) * scale;
                  const mouseY = (e.clientY - rect.top - dragOffset.y) * scale;

                  const clampedX = Math.max(0, Math.min(800, Math.round(mouseX)));
                  const clampedY = Math.max(0, Math.min(580, Math.round(mouseY)));

                  updateSelectedElement({
                    position: {
                      ...elements.find((el) => el.id === selectedElementId)!.position,
                      x: clampedX,
                      y: clampedY,
                    },
                  });
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
              {elements.map((el) => {
                const isSelected = el.id === selectedElementId;
                // scale factor from 841.89 pt to 600px canvas preview
                const scale = 600 / 841.89;

                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(el.id);
                      setIsDragging(true);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDragOffset({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }}
                    className={`absolute cursor-grab active:cursor-grabbing border select-none flex items-center justify-center p-1 transition-shadow ${
                      isSelected ? "border-2 border-indigo-600 bg-indigo-500/20 shadow-xl ring-2 ring-indigo-400/50 z-10" : "border-dashed border-slate-400 hover:border-indigo-400 bg-slate-900/10"
                    }`}
                    style={{
                      left: `${el.position.x * scale}px`,
                      top: `${el.position.y * scale}px`,
                      width: `${el.position.width * scale}px`,
                      height: `${el.position.height * scale}px`,
                      color: el.style?.color || "#000000",
                      fontSize: `${(el.style?.fontSize || 24) * scale}px`,
                      fontFamily: el.style?.fontFamily || "Helvetica",
                      textAlign: el.style?.textAlign || "center",
                    }}
                  >
                    {el.type === "variable" && <span className="font-bold text-indigo-700">{"{{" + (el.variableKey || "variable") + "}}"}</span>}
                    {el.type === "text" && <span className="truncate">{el.content || "Sample Text"}</span>}
                    {el.type === "qr" && <div className="w-full h-full bg-slate-900/10 border border-slate-800 flex items-center justify-center font-mono text-[9px]">QR Token</div>}
                    {el.type === "signature" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={el.cloudinaryUrl} alt="signature" className="w-full h-full object-contain" />
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* Right Properties Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Element Properties</h2>

          {!selectedEl ? (
            <p className="text-xs text-slate-500">Click any element on canvas to drag & position or customize typography.</p>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Element Type</label>
                <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-semibold uppercase">{selectedEl.type}</span>
              </div>

              {selectedEl.type === "variable" && (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Variable Key</label>
                  <input
                    type="text"
                    value={selectedEl.variableKey || ""}
                    onChange={(e) => updateSelectedElement({ variableKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              )}

              {selectedEl.type === "text" && (
                <div className="space-y-2">
                  <label className="block text-slate-300 font-medium">Static Text Content & Embedded Variables</label>
                  <textarea
                    rows={4}
                    value={selectedEl.content || ""}
                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                    placeholder="This is to certify that {{student_name}}, bearing Registration Number {{reg_no}}..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded p-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block mb-1">Click to Insert Variables:</span>
                    <div className="flex gap-1 flex-wrap">
                      {["student_name", "reg_no", "college_name", "dept", "domain", "start_date", "end_date"].map((vKey) => (
                        <button
                          key={vKey}
                          type="button"
                          onClick={() => {
                            const cur = selectedEl.content || "";
                            updateSelectedElement({ content: cur + ` {{${vKey}}}` });
                          }}
                          className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors"
                        >
                          +{`{{${vKey}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">X Position (pt)</label>
                  <input
                    type="number"
                    value={selectedEl.position.x}
                    onChange={(e) => updateSelectedElement({ position: { ...selectedEl.position, x: Number(e.target.value) } })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Y Position (pt)</label>
                  <input
                    type="number"
                    value={selectedEl.position.y}
                    onChange={(e) => updateSelectedElement({ position: { ...selectedEl.position, y: Number(e.target.value) } })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Box Width (pt)</label>
                  <input
                    type="number"
                    value={selectedEl.position.width}
                    onChange={(e) => updateSelectedElement({ position: { ...selectedEl.position, width: Number(e.target.value) } })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-semibold text-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Box Height (pt)</label>
                  <input
                    type="number"
                    value={selectedEl.position.height}
                    onChange={(e) => updateSelectedElement({ position: { ...selectedEl.position, height: Number(e.target.value) } })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-semibold text-indigo-400"
                  />
                </div>
              </div>

              {(selectedEl.type === "text" || selectedEl.type === "variable") && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <h3 className="font-semibold text-white">Typography & Style</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Font Size (pt)</label>
                      <input
                        type="number"
                        value={selectedEl.style?.fontSize || 24}
                        onChange={(e) =>
                          updateSelectedElement({
                            style: {
                              fontFamily: selectedEl.style?.fontFamily || "Helvetica",
                              fontSize: Number(e.target.value),
                              fontWeight: selectedEl.style?.fontWeight || 400,
                              textAlign: selectedEl.style?.textAlign || "center",
                              color: selectedEl.style?.color || "#000000",
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Text Color</label>
                      <input
                        type="color"
                        value={selectedEl.style?.color || "#000000"}
                        onChange={(e) =>
                          updateSelectedElement({
                            style: {
                              fontFamily: selectedEl.style?.fontFamily || "Helvetica",
                              fontSize: selectedEl.style?.fontSize || 24,
                              fontWeight: selectedEl.style?.fontWeight || 400,
                              textAlign: selectedEl.style?.textAlign || "center",
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 h-7 rounded p-0.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Font Family</label>
                    <select
                      value={selectedEl.style?.fontFamily || "Helvetica"}
                      onChange={(e) =>
                        updateSelectedElement({
                          style: {
                            fontFamily: e.target.value,
                            fontSize: selectedEl.style?.fontSize || 24,
                            fontWeight: selectedEl.style?.fontWeight || 400,
                            textAlign: selectedEl.style?.textAlign || "center",
                            color: selectedEl.style?.color || "#000000",
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs"
                    >
                      <option value="Helvetica">Helvetica (Standard Clean)</option>
                      <option value="Times-Roman">Times Roman (Serif Formal)</option>
                      <option value="Courier">Courier (Monospace)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Text Alignment</label>
                    <select
                      value={selectedEl.style?.textAlign || "center"}
                      onChange={(e) =>
                        updateSelectedElement({
                          style: {
                            fontFamily: selectedEl.style?.fontFamily || "Helvetica",
                            fontSize: selectedEl.style?.fontSize || 24,
                            fontWeight: selectedEl.style?.fontWeight || 400,
                            textAlign: e.target.value as "left" | "center" | "right",
                            color: selectedEl.style?.color || "#000000",
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs"
                    >
                      <option value="left">Left Align</option>
                      <option value="center">Center Align</option>
                      <option value="right">Right Align</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800">
                <h3 className="font-semibold text-white mb-2">Smart Fit Settings</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Max Wrapping Lines</label>
                    <input
                      type="number"
                      value={selectedEl.smartFit?.maxLines || 2}
                      onChange={(e) =>
                        updateSelectedElement({
                          smartFit: { ...selectedEl.smartFit!, maxLines: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Min Font Size (pt)</label>
                    <input
                      type="number"
                      value={selectedEl.smartFit?.minFontSize || 14}
                      onChange={(e) =>
                        updateSelectedElement({
                          smartFit: { ...selectedEl.smartFit!, minFontSize: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setElements(elements.filter((el) => el.id !== selectedElementId));
                  setSelectedElementId(null);
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 rounded font-medium text-xs transition-colors mt-4"
              >
                Delete Element
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
