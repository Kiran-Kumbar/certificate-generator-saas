"use client";

import { useState, useEffect } from "react";
import {
  Award,
  FileText,
  UploadCloud,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  XCircle,
  Archive,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";

interface SetupVariable {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
}

interface Setup {
  _id: string;
  name: string;
  programText?: string;
  variables?: SetupVariable[];
  templateId?: {
    _id: string;
    name: string;
    backgroundUrl?: string;
    elements?: Array<{ variableKey?: string; content?: string; position?: { x: number; y: number } }>;
  };
}

interface CertificateItem {
  _id: string;
  certificateNumber: string;
  studentName: string;
  pdfUrl: string;
  pngUrl: string;
  issuedAt: string;
  status: string;
}

interface PreflightSummary {
  total: number;
  ready: number;
  wrapped: number;
  fontReduced: number;
  errors: number;
}

interface PreflightRow {
  rowNumber: number;
  studentName: string;
  data: Record<string, unknown>;
  status: "ready" | "wrapped" | "font_reduced" | "overflow_error";
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "individual" | "excel">("library");

  // Selection & Export State
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  // Dynamic Single Entry Form State
  const [selectedSetupId, setSelectedSetupId] = useState("");
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, string>>({
    student_name: "Rahul Sharma",
    course: "Full Stack Development",
    duration: "6 Months",
  });
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<CertificateItem | null>(null);

  // Excel, Batch Persistence & Preflight State
  const [excelRows, setExcelRows] = useState<Record<string, unknown>[]>([]);
  const [preflightSummary, setPreflightSummary] = useState<PreflightSummary | null>(null);
  const [preflightRows, setPreflightRows] = useState<PreflightRow[]>([]);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [failedRows, setFailedRows] = useState<number[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [certsRes, setupsRes] = await Promise.all([fetch("/api/certificates"), fetch("/api/setups")]);
      const certsData = await certsRes.json();
      const setupsData = await setupsRes.json();

      if (certsData.certificates) setCertificates(certsData.certificates);
      if (setupsData.setups) {
        setSetups(setupsData.setups);
        if (setupsData.setups.length > 0 && !selectedSetupId) {
          setSelectedSetupId(setupsData.setups[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeSetup = setups.find((s) => s._id === selectedSetupId);

  const getSetupVariables = (setup?: Setup) => {
    if (!setup) return [];

    const keysSet = new Set<string>();

    // 1. Collect keys from explicit setup variables
    if (setup.variables && setup.variables.length > 0) {
      setup.variables.forEach((v) => keysSet.add(v.key));
    }

    // 2. Parse keys from programText
    if (setup.programText) {
      Array.from(setup.programText.matchAll(/\{\{\s*(\w+)\s*\}\}/g)).forEach((m) => keysSet.add(m[1]));
    }

    // 3. Parse keys from bound visual template elements (static text & variable elements)
    if (setup.templateId?.elements) {
      setup.templateId.elements.forEach((el) => {
        if (el.variableKey) keysSet.add(el.variableKey);
        if (el.content) {
          Array.from(el.content.matchAll(/\{\{\s*(\w+)\s*\}\}/g)).forEach((m) => keysSet.add(m[1]));
        }
      });
    }

    const allKeys = Array.from(keysSet);
    if (allKeys.length > 0) {
      return allKeys.map((key) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        type: key.includes("date") ? "date" : "text",
        required: true,
      }));
    }

    return [
      { key: "student_name", label: "Student Full Name", type: "text", required: true },
      { key: "course", label: "Course Title", type: "text", required: true },
      { key: "duration", label: "Duration", type: "text", required: false },
    ];
  };

  useEffect(() => {
    if (activeSetup) {
      const vars = getSetupVariables(activeSetup);
      const initialData: Record<string, string> = {};
      vars.forEach((v) => {
        if (v.key === "student_name") initialData[v.key] = "Rahul Sharma";
        else if (v.key === "course") initialData[v.key] = "Full Stack Development";
        else if (v.key === "duration") initialData[v.key] = "6 Months";
        else initialData[v.key] = dynamicFormData[v.key] || "";
      });
      setDynamicFormData(initialData);
    }
  }, [selectedSetupId, activeSetup]);

  const handleIndividualGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSetupId) return;
    setGenerating(true);
    setGeneratedResult(null);

    try {
      const recipientData = {
        ...dynamicFormData,
        completion_date: dynamicFormData.completion_date || new Date().toLocaleDateString(),
      };

      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupId: selectedSetupId, recipientData }),
      });

      const data = await res.json();
      if (res.ok && data.certificateId) {
        setGeneratedResult(data);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
      setExcelRows(data);
      setFailedRows([]);
      setBatchId(null);

      if (selectedSetupId && data.length > 0) {
        runPreflightCheck(selectedSetupId, data);
      }
    };
    reader.readAsBinaryString(file);
  };

  const runPreflightCheck = async (setupId: string, rows: Record<string, unknown>[]) => {
    try {
      const res = await fetch("/api/preflight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupId, rows }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setPreflightSummary(data.summary);
        setPreflightRows(data.rows);
      }
    } catch (e) {
      console.error("Preflight error:", e);
    }
  };

  const handleBulkGenerate = async (onlyFailed = false) => {
    if (!selectedSetupId || excelRows.length === 0) return;
    setBulkGenerating(true);

    let currentBatchId = batchId;

    // Create persistent CertificateBatch document if starting fresh
    if (!currentBatchId) {
      try {
        const batchRes = await fetch("/api/batches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            setupId: selectedSetupId,
            name: `Batch Execution ${new Date().toLocaleTimeString()}`,
            total: excelRows.length,
          }),
        });
        const batchData = await batchRes.json();
        if (batchData.batch) {
          currentBatchId = batchData.batch._id;
          setBatchId(currentBatchId);
        }
      } catch (e) {
        console.error("Batch init error:", e);
      }
    }

    const failedList: number[] = [];
    const rowsToProcess = onlyFailed ? failedRows : excelRows.map((_, idx) => idx);

    for (let i = 0; i < rowsToProcess.length; i++) {
      const rowIdx = rowsToProcess[i];
      const row = excelRows[rowIdx];
      const rowNum = rowIdx + 1;

      try {
        const res = await fetch("/api/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            setupId: selectedSetupId,
            recipientData: row,
            batchId: currentBatchId,
            rowNumber: rowNum,
          }),
        });

        if (!res.ok) {
          failedList.push(rowIdx);
        }
      } catch (err) {
        console.error(`Row ${rowNum} error:`, err);
        failedList.push(rowIdx);
      }

      setBulkProgress(Math.round(((i + 1) / rowsToProcess.length) * 100));
    }

    setFailedRows(failedList);
    setBulkGenerating(false);
    fetchData();
    if (failedList.length === 0) {
      setActiveTab("library");
    }
  };

  const handleRevoke = async (certId: string) => {
    if (!confirm("Are you sure you want to revoke this certificate? Public QR verification will display 'REVOKED'.")) return;
    try {
      const res = await fetch(`/api/certificates/${certId}/revoke`, { method: "POST" });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = async (mode: "zip" | "combined_pdf") => {
    if (selectedCertIds.length === 0) return;
    setExporting(true);

    try {
      const res = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateIds: selectedCertIds, mode }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = mode === "zip" ? "Certificates_Bundle.zip" : "Combined_Certificates.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCertIds.length === certificates.length) {
      setSelectedCertIds([]);
    } else {
      setSelectedCertIds(certificates.map((c) => c._id));
    }
  };

  const toggleSelectCert = (id: string) => {
    if (selectedCertIds.includes(id)) {
      setSelectedCertIds(selectedCertIds.filter((item) => item !== id));
    } else {
      setSelectedCertIds([...selectedCertIds, id]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Certificate Operations Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Issuance, Preflight Layout Analysis, Library & Export Engine</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "library" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Library Archive ({certificates.length})
          </button>
          <button
            onClick={() => setActiveTab("individual")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "individual" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Single Entry Form
          </button>
          <button
            onClick={() => setActiveTab("excel")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "excel" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Excel Bulk & Preflight
          </button>
        </div>
      </div>

      {/* Tab 1: Library Archive */}
      {activeTab === "library" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white">Issued Certificates Record</h2>

            {selectedCertIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  {selectedCertIds.length} Selected
                </span>
                <button
                  onClick={() => handleExport("zip")}
                  disabled={exporting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Archive size={14} /> ZIP Export
                </button>
                <button
                  onClick={() => handleExport("combined_pdf")}
                  disabled={exporting}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <Download size={14} /> Combined PDF
                </button>
              </div>
            )}
          </div>

          {certificates.length === 0 ? (
            <div className="text-center p-12 text-slate-500">No certificates generated yet. Issue certificates via Single Entry or Excel Bulk.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedCertIds.length === certificates.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0"
                      />
                    </th>
                    <th className="p-3">Certificate No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Issued Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {certificates.map((cert) => {
                    const isRevoked = cert.status === "revoked";
                    return (
                      <tr key={cert._id} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedCertIds.includes(cert._id)}
                            onChange={() => toggleSelectCert(cert._id)}
                            className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0"
                          />
                        </td>
                        <td className="p-3 font-mono text-indigo-400 font-medium">{cert.certificateNumber}</td>
                        <td className="p-3 font-semibold text-white">{cert.studentName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                              isRevoked ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {cert.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <a
                            href={cert.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-[11px] font-medium inline-flex items-center gap-1"
                          >
                            PDF <ExternalLink size={12} />
                          </a>
                          {!isRevoked && (
                            <button
                              onClick={() => handleRevoke(cert._id)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Single Entry Form */}
      {activeTab === "individual" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Single Certificate Entry Form</h2>
            <form onSubmit={handleIndividualGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Program Setup</label>
                <select
                  value={selectedSetupId}
                  onChange={(e) => setSelectedSetupId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    -- Select Program Setup --
                  </option>
                  {setups.map((s) => (
                    <option key={s._id} value={s._id} className="bg-slate-900 text-white py-1">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {getSetupVariables(activeSetup).map((v) => (
                <div key={v.key}>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    {v.label} {v.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={v.type === "date" ? "date" : "text"}
                    value={dynamicFormData[v.key] || ""}
                    onChange={(e) =>
                      setDynamicFormData({
                        ...dynamicFormData,
                        [v.key]: e.target.value,
                      })
                    }
                    placeholder={`Enter ${v.label}`}
                    required={v.required}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 mt-2"
              >
                {generating ? "Executing Engine & Uploading..." : "Generate PDF + PNG Certificate"}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-start items-center space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider w-full text-left">
              {generatedResult ? "Generated Certificate Output" : "Live Certificate Template Preview"}
            </h3>

            {!generatedResult ? (
              <div className="w-full space-y-4">
                <div
                  className="relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-4 aspect-video shadow-2xl"
                  style={{
                    backgroundImage: activeSetup?.templateId?.backgroundUrl
                      ? `url("${activeSetup.templateId.backgroundUrl}")`
                      : undefined,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  {!activeSetup?.templateId?.backgroundUrl && (
                    <div className="text-center text-slate-500 text-xs p-8">
                      Select a Program Setup to view certificate layout preview
                    </div>
                  )}

                  {activeSetup?.templateId?.backgroundUrl && (
                    <div className="absolute inset-0 pointer-events-none">
                      {activeSetup.templateId.elements && activeSetup.templateId.elements.length > 0 ? (
                        activeSetup.templateId.elements.map((el, i) => {
                          const scale = 100 / 841.89; // scale to container percentage
                          let text = el.content || "";
                          if (el.variableKey) text = dynamicFormData[el.variableKey] || `{{${el.variableKey}}}`;
                          text = text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => dynamicFormData[key] || `[${key}]`);

                          return (
                            <div
                              key={i}
                              className="absolute font-semibold text-slate-900 bg-white/90 p-1.5 rounded shadow text-[9px] leading-relaxed whitespace-pre-wrap break-words max-w-[85%]"
                              style={{
                                left: `${(el.position?.x || 100) * scale}%`,
                                top: `${(el.position?.y || 200) * scale}%`,
                              }}
                            >
                              {text}
                            </div>
                          );
                        })
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                          <div className="font-bold text-slate-900 text-sm bg-white/90 px-3 py-1 rounded shadow">
                            {dynamicFormData.student_name || "Student Name Placeholder"}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
                  <span className="font-semibold">Live Preview:</span> Form inputs above automatically format into the certificate text body. Click <strong>Generate PDF + PNG Certificate</strong> to build official files.
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-lg font-bold text-white">Certificate Generated!</h3>
                <p className="font-mono text-indigo-400 text-sm font-semibold">{generatedResult.certificateNumber}</p>

                <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedResult.pngUrl} alt="Generated preview" className="w-full h-full object-contain" />
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (!generatedResult.pdfUrl) return;
                      if (generatedResult.pdfUrl.startsWith("data:")) {
                        const arr = generatedResult.pdfUrl.split(",");
                        const mime = arr[0].match(/:(.*?);/)?.[1] || "application/pdf";
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) u8arr[n] = bstr.charCodeAt(n);
                        const blob = new Blob([u8arr], { type: mime });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, "_blank");
                      } else {
                        window.open(generatedResult.pdfUrl, "_blank");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md cursor-pointer"
                  >
                    Open PDF File
                  </button>
                  <button
                    onClick={() => {
                      if (!generatedResult.pngUrl) return;
                      if (generatedResult.pngUrl.startsWith("data:")) {
                        const arr = generatedResult.pngUrl.split(",");
                        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) u8arr[n] = bstr.charCodeAt(n);
                        const blob = new Blob([u8arr], { type: mime });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, "_blank");
                      } else {
                        window.open(generatedResult.pngUrl, "_blank");
                      }
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    Open PNG Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Excel Bulk Import, Preflight & Retry */}
      {activeTab === "excel" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Excel / CSV Preflight & Bulk Generator</h2>
            <p className="text-xs text-slate-400">Stepwise client-controlled generation with batch persistence & row retry support</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">1. Select Certificate Setup</label>
              <select
                value={selectedSetupId}
                onChange={(e) => {
                  setSelectedSetupId(e.target.value);
                  if (excelRows.length > 0) runPreflightCheck(e.target.value, excelRows);
                }}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                {setups.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">2. Upload Spreadsheet (.xlsx / .csv)</label>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelFileUpload}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
            </div>
          </div>

          {preflightSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-800">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Rows</span>
                <p className="text-xl font-bold text-white">{preflightSummary.total}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
                  <CheckCircle size={12} /> Ready (Fits)
                </span>
                <p className="text-xl font-bold text-emerald-400">{preflightSummary.ready}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                <span className="text-[10px] text-amber-400 font-semibold uppercase flex items-center gap-1">
                  <AlertTriangle size={12} /> Will Wrap
                </span>
                <p className="text-xl font-bold text-amber-400">{preflightSummary.wrapped}</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-lg">
                <span className="text-[10px] text-indigo-400 font-semibold uppercase">Font Reduced</span>
                <p className="text-xl font-bold text-indigo-400">{preflightSummary.fontReduced}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                <span className="text-[10px] text-red-400 font-semibold uppercase flex items-center gap-1">
                  <XCircle size={12} /> Overflow Errors
                </span>
                <p className="text-xl font-bold text-red-400">{preflightSummary.errors}</p>
              </div>
            </div>
          )}

          {excelRows.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-indigo-400" /> Preflight Analysis Results ({preflightRows.length} Rows)
                </span>

                <div className="flex gap-2">
                  {failedRows.length > 0 && (
                    <button
                      onClick={() => handleBulkGenerate(true)}
                      disabled={bulkGenerating}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} /> Retry {failedRows.length} Failed Rows
                    </button>
                  )}

                  <button
                    onClick={() => handleBulkGenerate(false)}
                    disabled={bulkGenerating || preflightSummary?.errors! > 0}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {bulkGenerating ? `Generating... (${bulkProgress}%)` : `Generate ${excelRows.length} Certificates`}
                  </button>
                </div>
              </div>

              {bulkGenerating && (
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                </div>
              )}

              <div className="max-h-72 overflow-y-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-2.5 w-12">Row</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Layout Preflight Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {preflightRows.map((row) => (
                      <tr key={row.rowNumber} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono text-slate-400">{row.rowNumber}</td>
                        <td className="p-2.5 font-semibold text-white">{row.studentName}</td>
                        <td className="p-2.5">
                          {row.status === "ready" && <span className="text-emerald-400 font-semibold">✅ Fits Normatively</span>}
                          {row.status === "wrapped" && <span className="text-amber-400 font-semibold">⚠ Wraps to 2 Lines</span>}
                          {row.status === "font_reduced" && <span className="text-indigo-400 font-semibold">ℹ Font Size Scaled Down</span>}
                          {row.status === "overflow_error" && <span className="text-red-400 font-semibold">❌ Cannot Fit within Bounds</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
