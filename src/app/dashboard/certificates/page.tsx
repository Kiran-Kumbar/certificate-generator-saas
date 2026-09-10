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
  Mail,
  Eye,
  Copy,
  Check,
  Send,
  X,
  ShieldCheck,
  QrCode,
  Search,
  Filter,
  Trash2,
  Edit3,
} from "lucide-react";
import * as XLSX from "xlsx";
import OfficialStamp from "@/components/OfficialStamp";
import { formatCertificateDate } from "@/lib/format-date";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DataToolbar } from "@/components/ui/data-toolbar";

import { CertificateElement } from "@/types/template";

interface SetupVariable {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
}

function formatStudentNameWithSalutation(name: unknown): string {
  if (!name) return "";
  let str = String(name).trim();
  if (!str) return "";

  // Normalize any variation of Mr./ Ms. or Mr./Ms. or Mr / Ms
  if (/^mr\.?\s*\/\s*ms\.?\s+/i.test(str)) {
    return str.replace(/^mr\.?\s*\/\s*ms\.?\s+/i, "Mr./ Ms. ");
  }

  // If starts with single prefix like Mr., Ms., Mrs., or Miss, replace with Mr./ Ms.
  if (/^(mr\.?|ms\.?|mrs\.?|miss)\s+/i.test(str)) {
    str = str.replace(/^(mr\.?|ms\.?|mrs\.?|miss)\s+/i, "");
  }

  return `Mr./ Ms. ${str}`;
}

function renderRichPreviewText(content: string, isStudentName: boolean) {
  if (isStudentName) {
    return <span style={{ color: "#03046e", fontWeight: 700 }}>{content}</span>;
  }
  // Split by <blue>...</blue>, <b>...</b>, <gold>...</gold>, and newlines
  const parts = content.split(/(<blue>[\s\S]*?<\/blue>|<b>[\s\S]*?<\/b>|<gold>[\s\S]*?<\/gold>|\n)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;
        if (part === "\n") return <br key={idx} />;
        if (part.startsWith("<blue>") && part.endsWith("</blue>")) {
          const inner = part.slice(6, -7);
          return (
            <span key={idx} style={{ color: "#03046e", fontWeight: 700 }}>
              {inner}
            </span>
          );
        }
        if (part.startsWith("<gold>") && part.endsWith("</gold>")) {
          const inner = part.slice(6, -7);
          return (
            <span key={idx} style={{ color: "#c59b27", fontWeight: 700 }}>
              {inner}
            </span>
          );
        }
        if (part.startsWith("<b>") && part.endsWith("</b>")) {
          const inner = part.slice(3, -4);
          return (
            <strong key={idx} className="font-bold text-slate-900">
              {inner}
            </strong>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
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
    width?: number;
    height?: number;
    elements?: CertificateElement[];
  };
}

interface CertificateItem {
  _id: string;
  certificateId?: string;
  certificateNumber: string;
  studentName: string;
  pdfUrl: string;
  pngUrl: string;
  issuedAt: string;
  status: string;
  verificationToken?: string;
  recipientData?: Record<string, unknown>;
  lastEmailedTo?: string;
  lastEmailedAt?: string;
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
  regNo?: string;
  collegeName?: string;
  dept?: string;
  domain?: string;
  startDate?: string;
  endDate?: string;
  data: Record<string, unknown>;
  status: "ready" | "wrapped" | "font_reduced" | "overflow_error";
}

export default function CertificatesPage() {
  const { success, error, info } = useToast();
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "individual" | "excel">("library");
  const [loadingData, setLoadingData] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">("all");

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
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [preflightError, setPreflightError] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [failedRows, setFailedRows] = useState<number[]>([]);
  const [bulkErrorMessage, setBulkErrorMessage] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  // Quick Inspect & Email Dispatch Modals (Enterprise features inspired by Daylink)
  const [inspectCert, setInspectCert] = useState<CertificateItem | null>(null);
  const [emailModalCert, setEmailModalCert] = useState<CertificateItem | null>(null);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  // Edit Certificate Modal State
  const [editCert, setEditCert] = useState<CertificateItem | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);

  // Edit Preflight Row Modal State
  const [editPreflightIndex, setEditPreflightIndex] = useState<number | null>(null);
  const [editPreflightRowData, setEditPreflightRowData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editCert) {
      setEditFormData({
        student_name: editCert.studentName || String(editCert.recipientData?.student_name || ""),
        reg_no: String(editCert.recipientData?.reg_no || ""),
        college_name: String(editCert.recipientData?.college_name || ""),
        dept: String(editCert.recipientData?.dept || ""),
        domain: String(editCert.recipientData?.domain || ""),
        start_date: String(editCert.recipientData?.start_date || ""),
        end_date: String(editCert.recipientData?.end_date || ""),
        status: editCert.status || "issued",
      });
    }
  }, [editCert]);

  const fetchData = async () => {
    setLoadingData(true);
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
      error("Failed to load certificates and setups", "Network Error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeSetup = setups.find((s) => s._id === selectedSetupId);

  const getSetupVariables = (setup?: Setup) => {
    if (!setup) return [];

    // Build a lookup map from stored variables for label/type/required
    const varMap = new Map<string, SetupVariable>();
    if (setup.variables && setup.variables.length > 0) {
      setup.variables.forEach((v) => varMap.set(v.key, v));
    }

    const keysSet = new Set<string>();

    // 1. Collect keys from explicit setup variables (preserves order)
    if (setup.variables && setup.variables.length > 0) {
      setup.variables.forEach((v) => keysSet.add(v.key));
    }

    // 2. Parse keys from programText (for any extra mustache keys)
    if (setup.programText) {
      Array.from(setup.programText.matchAll(/\{\{\s*(\w+)\s*\}\}/g)).forEach((m) => keysSet.add(m[1]));
    }

    // 3. Parse keys from bound visual template variable elements
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
      return allKeys.map((key) => {
        const stored = varMap.get(key);
        return {
          key,
          // Use stored label if available, else auto-generate from key
          label: stored?.label || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          // Use stored type if available, else infer from key name
          type: stored?.type || (key.includes("date") ? "date" : "text"),
          // Use stored required flag if available, else default true
          required: stored?.required !== undefined ? stored.required : true,
        };
      });
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
        success(`Certificate ${data.certificateNumber || ""} generated successfully!`, "Issuance Complete");
        fetchData();
      } else {
        error(data.error || "Failed to generate certificate", "Generation Failed");
      }
    } catch (e) {
      console.error(e);
      error(e instanceof Error ? e.message : "Error generating certificate", "Engine Error");
    } finally {
      setGenerating(false);
    }
  };

  const getVerificationUrl = (cert: CertificateItem) => {
    const origin =
      typeof window !== "undefined" &&
      !window.location.origin.includes("localhost") &&
      !window.location.origin.includes("127.0.0.1") &&
      !window.location.origin.includes("vercel.app")
        ? window.location.origin
        : "https://smc.onqeva.in";
    return `${origin}/verify/${cert.verificationToken || cert._id}`;
  };

  const copyVerificationLink = (cert: CertificateItem) => {
    if (typeof window === "undefined") return;
    const url = getVerificationUrl(cert);
    navigator.clipboard.writeText(url);
    setCopiedCertId(cert._id);
    success(`Verification URL copied to clipboard!`, "Link Copied");
    setTimeout(() => setCopiedCertId(null), 2500);
  };

  const openEmailModal = (cert: CertificateItem) => {
    setEmailModalCert(cert);
    const existingEmail =
      (cert.recipientData?.student_email as string) ||
      (cert.recipientData?.email as string) ||
      cert.lastEmailedTo ||
      "";
    setEmailRecipient(existingEmail);
    setEmailFeedback(null);
  };

  const handleSendEmail = async () => {
    if (!emailModalCert || !emailRecipient) return;
    setSendingEmail(true);
    setEmailFeedback(null);

    try {
      const res = await fetch(`/api/certificates/${emailModalCert._id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailRecipient }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailFeedback(`Certificate successfully dispatched to ${emailRecipient}!`);
        success(`Certificate dispatched to ${emailRecipient}!`, "Email Delivered");
        fetchData();
      } else {
        const msg = data.error || "Failed to dispatch email";
        setEmailFeedback(`Error: ${msg}`);
        error(msg, "Email Error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error dispatching email";
      setEmailFeedback(msg);
      error(msg, "Email Error");
    } finally {
      setSendingEmail(false);
    }
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        "STUDENT NAME": "Ruchita Lavar",
        "STUDENT EMAIL": "ruchita.lavar@example.com",
        "REG.NO": "2GI22CS001",
        "COLLEGE NAME": "KLS Gogte Institute of Technology",
        "DEPT": "Computer Science & Engineering",
        "DOMAIN": "AI Powered Full Stack Development",
        "START DATE": "25-May-2026",
        "END DATE": "14-Aug-2026",
      },
      {
        "STUDENT NAME": "Aditya Paranjape",
        "STUDENT EMAIL": "aditya.paranjape@example.com",
        "REG.NO": "528CS23303",
        "COLLEGE NAME": "Yashwantrao Bhonsale Institute of Technology",
        "DEPT": "Computer Engineering",
        "DOMAIN": "Web Development & Cloud Services",
        "START DATE": "25-May-2026",
        "END DATE": "14-Aug-2026",
      },
      {
        "STUDENT NAME": "Rahul Patil",
        "STUDENT EMAIL": "rahul.patil@example.com",
        "REG.NO": "2GI22CS045",
        "COLLEGE NAME": "KLS Gogte Institute of Technology",
        "DEPT": "Information Science & Engineering",
        "DOMAIN": "Cloud Architecture & DevOps",
        "START DATE": "25-May-2026",
        "END DATE": "14-Aug-2026",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Softmusk_Students_Template.xlsx");
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkErrorMessage(null);
    setPreflightError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
        
        if (data.length === 0) {
          setPreflightError("Spreadsheet contains 0 data rows. Please check file contents.");
          return;
        }

        setExcelRows(data);
        setFailedRows([]);
        setBatchId(null);

        if (selectedSetupId && data.length > 0) {
          runPreflightCheck(selectedSetupId, data);
        }
      } catch (err) {
        setPreflightError(err instanceof Error ? err.message : "Error reading spreadsheet file");
      }
    };
    reader.readAsBinaryString(file);
  };

  const runPreflightCheck = async (setupId: string, rows: Record<string, unknown>[]) => {
    setPreflightLoading(true);
    setPreflightError(null);
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
      } else {
        setPreflightError(data.error || "Preflight check failed on server");
      }
    } catch (e) {
      console.error("Preflight error:", e);
      setPreflightError(e instanceof Error ? e.message : "Preflight network error");
    } finally {
      setPreflightLoading(false);
    }
  };

  const handleBulkGenerate = async (onlyFailed = false) => {
    if (!selectedSetupId || excelRows.length === 0) return;
    setBulkGenerating(true);
    setBulkErrorMessage(null);

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
    let lastErrorReason = "";

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
          const errData = await res.json().catch(() => ({}));
          lastErrorReason = errData.error || `HTTP ${res.status}`;
          failedList.push(rowIdx);
        }
      } catch (err) {
        lastErrorReason = err instanceof Error ? err.message : "Network failure";
        console.error(`Row ${rowNum} error:`, err);
        failedList.push(rowIdx);
      }

      setBulkProgress(Math.round(((i + 1) / rowsToProcess.length) * 100));
    }

    setFailedRows(failedList);
    setBulkGenerating(false);
    await fetchData();
    if (failedList.length === 0) {
      success(`All ${rowsToProcess.length} certificates generated successfully!`, "Bulk Generation Complete");
      setActiveTab("library");
    } else {
      error(`Bulk generation finished with ${failedList.length} failed row(s)`, "Generation Notice");
      setBulkErrorMessage(`Generation completed with ${failedList.length} failed row(s): ${lastErrorReason}`);
    }
  };

  const handleRevoke = async (certId: string) => {
    if (!confirm("Are you sure you want to revoke this certificate? Public QR verification will display 'REVOKED'.")) return;
    try {
      const res = await fetch(`/api/certificates/${certId}/revoke`, { method: "POST" });
      if (res.ok) {
        info("Certificate revoked successfully", "Revocation Applied");
        fetchData();
      } else {
        error("Failed to revoke certificate", "Revocation Failed");
      }
    } catch (e) {
      console.error(e);
      error("Failed to revoke certificate", "Network Error");
    }
  };

  const handleDelete = async (certId: string, certNumber: string) => {
    if (!confirm(`Permanently delete certificate ${certNumber}?\n\nThis will remove it from the database AND delete the PDF and PNG from Cloudinary storage.\n\nThis action CANNOT be undone.`)) return;
    try {
      const res = await fetch(`/api/certificates/${certId}`, { method: "DELETE" });
      if (res.ok) {
        info(`Certificate ${certNumber} permanently deleted`, "Deleted");
        fetchData();
      } else {
        const data = await res.json();
        error(data.error || "Failed to delete certificate", "Delete Failed");
      }
    } catch (e) {
      console.error(e);
      error("Failed to delete certificate", "Network Error");
    }
  };

  const handleSaveEditCertificate = async () => {
    if (!editCert) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/certificates/${editCert._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: editFormData.student_name,
          status: editFormData.status,
          recipientData: editFormData,
        }),
      });
      const data = await res.json();
      if (res.ok && data.certificate) {
        setCertificates((prev) =>
          prev.map((c) => (c._id === editCert._id ? { ...c, ...data.certificate } : c))
        );
        success(`Certificate ${editCert.certificateNumber} updated successfully!`, "Updated");
        setEditCert(null);
      } else {
        error(data.error || "Failed to update certificate", "Update Failed");
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Error saving certificate", "Network Error");
    } finally {
      setEditSaving(false);
    }
  };

  const handleStartEditPreflightRow = (index: number) => {
    const row = preflightRows[index];
    if (!row) return;
    setEditPreflightIndex(index);
    setEditPreflightRowData({
      student_name: row.studentName,
      reg_no: row.regNo || "",
      college_name: row.collegeName || "",
      dept: row.dept || "",
      domain: row.domain || "",
      start_date: row.startDate || "",
      end_date: row.endDate || "",
    });
  };

  const handleSavePreflightRow = () => {
    if (editPreflightIndex === null) return;
    const updatedExcel = [...excelRows];
    updatedExcel[editPreflightIndex] = {
      ...updatedExcel[editPreflightIndex],
      ...editPreflightRowData,
      "STUDENT NAME": editPreflightRowData.student_name,
      "REG.NO": editPreflightRowData.reg_no,
      "COLLEGE NAME": editPreflightRowData.college_name,
      "DEPT": editPreflightRowData.dept,
      "DOMAIN": editPreflightRowData.domain,
      "START DATE": editPreflightRowData.start_date,
      "END DATE": editPreflightRowData.end_date,
    };
    setExcelRows(updatedExcel);

    const updatedPreflight = [...preflightRows];
    const target = updatedPreflight[editPreflightIndex];
    if (target) {
      target.studentName = editPreflightRowData.student_name || target.studentName;
      target.regNo = editPreflightRowData.reg_no;
      target.collegeName = editPreflightRowData.college_name;
      target.dept = editPreflightRowData.dept;
      target.domain = editPreflightRowData.domain;
      target.startDate = editPreflightRowData.start_date;
      target.endDate = editPreflightRowData.end_date;
      target.data = { ...target.data, ...editPreflightRowData };
      target.status = "ready";
    }
    setPreflightRows(updatedPreflight);
    setEditPreflightIndex(null);
    success(`Row #${editPreflightIndex + 1} updated!`, "Row Updated");
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
        success(`${mode === "zip" ? "ZIP Archive" : "Combined PDF"} downloaded successfully!`, "Export Complete");
      } else {
        const errData = await res.json().catch(() => ({}));
        error(errData.error || "Failed to export certificates", "Export Failed");
      }
    } catch (e) {
      console.error("Export error:", e);
      error("Network error during bundle export", "Export Error");
    } finally {
      setExporting(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      cert.studentName?.toLowerCase().includes(q) ||
      cert.certificateNumber?.toLowerCase().includes(q) ||
      Object.values(cert.recipientData || {}).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(q)
      );
    const matchesStatus =
      statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedCertIds.length === filteredCertificates.length && filteredCertificates.length > 0) {
      setSelectedCertIds([]);
    } else {
      setSelectedCertIds(filteredCertificates.map((c) => c._id));
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Certificate Operations Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Issuance, Preflight Layout Analysis, Library & Export Engine</p>
        </div>

        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "library" ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Library Archive ({certificates.length})
          </button>
          <button
            onClick={() => setActiveTab("individual")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "individual" ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Single Entry Form
          </button>
          <button
            onClick={() => setActiveTab("excel")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "excel" ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Excel Bulk & Preflight
          </button>
        </div>
      </div>

      {/* Tab 1: Library Archive */}
      {activeTab === "library" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Issued Certificates Record</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage, search, preview, email and export all credential records
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={loadingData}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                title="Refresh certificates list"
              >
                <RefreshCw size={13} className={loadingData ? "animate-spin text-sky-600" : "text-slate-500"} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Daily_CRM DataToolbar */}
          <DataToolbar
            search={
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student, cert no, college..."
                  className="w-full bg-white border border-slate-300 text-slate-900 pl-9 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                />
              </div>
            }
            filters={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "revoked")}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="all">All Statuses ({certificates.length})</option>
                    <option value="active">Active / Issued</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
              </div>
            }
            actions={
              selectedCertIds.length > 0 ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-lg">
                  <span className="text-xs font-semibold text-sky-700 px-2">
                    {selectedCertIds.length} Selected
                  </span>
                  <button
                    onClick={() => handleExport("zip")}
                    disabled={exporting}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Archive size={13} /> {exporting ? "Archiving..." : "ZIP Export"}
                  </button>
                  <button
                    onClick={() => handleExport("combined_pdf")}
                    disabled={exporting}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Download size={13} /> {exporting ? "Building..." : "Combined PDF"}
                  </button>
                </div>
              ) : null
            }
          />

          {loadingData ? (
            <div className="space-y-2 py-2">
              <Skeleton className="h-10 w-full bg-slate-200/80 rounded-lg" />
              <Skeleton className="h-12 w-full bg-slate-200/60 rounded-lg" />
              <Skeleton className="h-12 w-full bg-slate-200/60 rounded-lg" />
              <Skeleton className="h-12 w-full bg-slate-200/60 rounded-lg" />
              <Skeleton className="h-12 w-full bg-slate-200/60 rounded-lg" />
            </div>
          ) : certificates.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No certificates issued yet"
              description="Get started by issuing certificates individually through the Single Entry Form, or batch upload an Excel/CSV spreadsheet."
              action={{
                label: "Issue First Certificate",
                onClick: () => setActiveTab("individual"),
              }}
            />
          ) : filteredCertificates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No matching certificates"
              description={`No certificates found matching "${searchQuery}". Reset filters to show all certificates.`}
              action={{
                label: "Reset Filters",
                onClick: () => {
                  setSearchQuery("");
                  setStatusFilter("all");
                },
              }}
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedCertIds.length === filteredCertificates.length && filteredCertificates.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 bg-white text-sky-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Certificate No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Issued Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCertificates.map((cert) => {
                    const isRevoked = cert.status === "revoked";
                    return (
                      <tr key={cert._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedCertIds.includes(cert._id)}
                            onChange={() => toggleSelectCert(cert._id)}
                            className="rounded border-slate-300 bg-white text-sky-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-mono text-sky-600 font-semibold">{cert.certificateNumber}</td>
                        <td className="p-3 font-semibold text-slate-900">{cert.studentName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded font-semibold text-[10px] uppercase border ${
                              isRevoked
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            }`}
                          >
                            {cert.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {/* Inspect / Dossier */}
                          <button
                            onClick={() => setInspectCert(cert)}
                            title="Inspect Certificate Dossier"
                            className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 border border-slate-200 shadow-xs transition-colors"
                          >
                            <Eye size={12} className="text-sky-600" /> Inspect
                          </button>

                          {/* Edit Certificate Details */}
                          <button
                            onClick={() => setEditCert(cert)}
                            title="Edit Certificate Details"
                            className="bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-2.5 py-1 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 border border-slate-200 hover:border-sky-300 shadow-xs transition-colors"
                          >
                            <Edit3 size={12} className="text-sky-600" /> Edit
                          </button>

                          {/* Email Certificate - hidden */}

                          {/* Open PDF */}
                          <a
                            href={`/api/certificates/${cert._id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            PDF <ExternalLink size={12} />
                          </a>

                          {/* Revoke */}
                          {!isRevoked && (
                            <button
                              onClick={() => handleRevoke(cert._id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors"
                            >
                              Revoke
                            </button>
                          )}

                          {/* Delete permanently */}
                          <button
                            onClick={() => handleDelete(cert._id, cert.certificateNumber)}
                            title="Permanently delete certificate and all assets"
                            className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">Single Certificate Entry Form</h2>
            <form onSubmit={handleIndividualGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Program Setup</label>
                <select
                  value={selectedSetupId}
                  onChange={(e) => setSelectedSetupId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 cursor-pointer"
                >
                  <option value="" disabled className="text-slate-400">
                    -- Select Program Setup --
                  </option>
                  {setups.map((s) => (
                    <option key={s._id} value={s._id} className="text-slate-900 py-1">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {getSetupVariables(activeSetup).map((v) => (
                <div key={v.key}>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    {v.label} {v.required && <span className="text-red-500">*</span>}
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
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-sm shadow-sky-600/20 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {generating ? "Executing Engine & Uploading..." : "Generate PDF + PNG Certificate"}
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-start items-center space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider w-full text-left">
              {generatedResult ? "Generated Certificate Output" : "Live Certificate Template Preview"}
            </h3>

            {!generatedResult ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200/80 shadow-inner w-full flex justify-center">
                  <div
                    className="relative bg-white rounded-lg overflow-hidden border border-slate-300 shadow-md w-full max-w-[370px] aspect-[595.28/841.89]"
                    style={{
                      backgroundImage: activeSetup?.templateId?.backgroundUrl
                        ? `url("${activeSetup.templateId.backgroundUrl}")`
                        : undefined,
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  >
                    {!activeSetup?.templateId?.backgroundUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-center text-slate-500 text-xs p-8 bg-slate-50">
                        Select a Program Setup to view certificate layout preview
                      </div>
                    )}

                    {activeSetup?.templateId?.backgroundUrl && (
                      <div className="absolute inset-0 pointer-events-none">
                        {activeSetup.templateId.elements && activeSetup.templateId.elements.length > 0 ? (
                          activeSetup.templateId.elements.map((el, i) => {
                            const isStudentName = el.id === "el_student_name" || el.variableKey === "student_name";
                            const posNormY = isStudentName && (el.position?.y || 0) >= 290 ? 280 : (el.position?.y || 0);
                            const posNormH = isStudentName && (el.position?.y || 0) >= 290 ? 42 : (el.position?.height || 30);

                            const tWidth = activeSetup.templateId?.width || 595.28;
                            const tHeight = activeSetup.templateId?.height || 841.89;

                            const leftPct = ((el.position?.x || 0) / tWidth) * 100;
                            const topPct = (posNormY / tHeight) * 100;
                            const widthPct = ((el.position?.width || 100) / tWidth) * 100;
                            const heightPct = (posNormH / tHeight) * 100;

                            if (el.type === "qr") {
                              return (
                                <div
                                  key={i}
                                  className="absolute flex flex-col items-center justify-center border border-slate-300 bg-white/95 rounded shadow-xs"
                                  style={{
                                    left: `${leftPct}%`,
                                    top: `${topPct}%`,
                                    width: `${widthPct}%`,
                                    height: `${heightPct}%`,
                                  }}
                                >
                                  <QrCode size={20} className="text-slate-900" />
                                  <span className="text-[6px] text-slate-700 font-mono tracking-tighter mt-0.5">VERIFY</span>
                                </div>
                              );
                            }

                            // Resolve live text accurately
                            let text = "";
                            if (el.type === "variable" && el.variableKey) {
                              if (isStudentName) {
                                const val = dynamicFormData[el.variableKey] || dynamicFormData.name || "Rahul Sharma";
                                text = formatStudentNameWithSalutation(val);
                              } else {
                                text = dynamicFormData[el.variableKey] || `[${el.variableKey}]`;
                              }
                            } else {
                              text = el.content || "";
                              if (isStudentName && text) {
                                text = formatStudentNameWithSalutation(text);
                              }
                              if (text.replace(/\s+/g, "") === "THISISTOCERTIFYTHAT") {
                                text = "THIS IS TO CERTIFY THAT";
                              }
                              // Replace variables
                              text = text.replace(/\{\{\s*college_name\s*\}\}/g, dynamicFormData.college_name || "[College Name]");
                              text = text.replace(/\{\{\s*start_date\s*\}\}/g, formatCertificateDate(dynamicFormData.start_date) || "[Start Date]");
                              text = text.replace(/\{\{\s*end_date\s*\}\}/g, formatCertificateDate(dynamicFormData.end_date) || "[End Date]");
                              text = text.replace(/\{\{\s*domain\s*\}\}/g, dynamicFormData.domain || "[Domain / Project]");
                              text = text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => dynamicFormData[k] || `[${k}]`);
                            }

                            const isCertifyTitle = el.id === "el_certify_title";

                            // Scale font: preview max-w is ~370px vs 595.28 pt => 370 / 595.28 ≈ 0.62
                            const fontSizePx = Math.max(7, Math.round((el.style?.fontSize || 12) * 0.62));

                            return (
                              <div
                                key={i}
                                className="absolute pointer-events-none flex flex-col justify-center select-none"
                                style={{
                                  left: `${leftPct}%`,
                                  top: `${topPct}%`,
                                  width: `${widthPct}%`,
                                  height: `${heightPct}%`,
                                  textAlign: (el.style?.textAlign as React.CSSProperties["textAlign"]) || "center",
                                  fontFamily: el.style?.fontFamily?.toLowerCase().includes("times") ? "serif" : "sans-serif",
                                  fontWeight: isStudentName ? 700 : isCertifyTitle ? 700 : el.style?.fontWeight || 400,
                                  color: isStudentName ? "#03046e" : (el.style?.color || "#1e293b"),
                                  fontSize: `${fontSizePx}px`,
                                  lineHeight: 1.25,
                                }}
                              >
                                <div className="w-full text-center px-1">
                                  {renderRichPreviewText(text, isStudentName)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                            <div className="font-bold text-[#03046e] text-sm bg-white/90 px-3 py-1 rounded shadow">
                              {formatStudentNameWithSalutation(dynamicFormData.student_name || "Rahul Sharma")}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-800 w-full text-center">
                  <span className="font-semibold">Live Preview:</span> Inputs format in real-time into the certificate. Click <strong>Generate PDF + PNG Certificate</strong> to build official files.
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Certificate Generated!</h3>
                <p className="font-mono text-sky-600 text-sm font-semibold">{generatedResult.certificateNumber}</p>

                <div className="aspect-[595.28/841.89] max-w-[370px] mx-auto w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-300 p-1 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedResult.pngUrl} alt="Generated preview" className="w-full h-full object-contain bg-white rounded" />
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={(generatedResult._id || generatedResult.certificateId) ? `/api/certificates/${generatedResult._id || generatedResult.certificateId}/pdf` : (generatedResult.pdfUrl.startsWith("data:") ? "#" : generatedResult.pdfUrl)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      if (!(generatedResult._id || generatedResult.certificateId) && generatedResult.pdfUrl?.startsWith("data:")) {
                        e.preventDefault();
                        const arr = generatedResult.pdfUrl.split(",");
                        const mime = arr[0].match(/:(.*?);/)?.[1] || "application/pdf";
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) u8arr[n] = bstr.charCodeAt(n);
                        const blob = new Blob([u8arr], { type: mime });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, "_blank");
                      }
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FileText size={14} /> Open PDF File
                  </a>
                  <a
                    href={(generatedResult._id || generatedResult.certificateId) ? `/api/certificates/${generatedResult._id || generatedResult.certificateId}/png` : (generatedResult.pngUrl.startsWith("data:") ? "#" : generatedResult.pngUrl)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      if (!(generatedResult._id || generatedResult.certificateId) && generatedResult.pngUrl?.startsWith("data:")) {
                        e.preventDefault();
                        const arr = generatedResult.pngUrl.split(",");
                        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) u8arr[n] = bstr.charCodeAt(n);
                        const blob = new Blob([u8arr], { type: mime });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, "_blank");
                      }
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download size={14} /> Open PNG Image
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setGeneratedResult(null)}
                    className="text-xs text-sky-600 hover:text-sky-700 underline font-medium cursor-pointer"
                  >
                    Back to Live Template Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Excel Bulk Import, Preflight & Retry */}
      {activeTab === "excel" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Excel / CSV Preflight & Bulk Generator</h2>
              <p className="text-xs text-slate-500">Stepwise client-controlled generation with batch persistence & row retry support</p>
            </div>
            <button
              onClick={downloadSampleExcel}
              type="button"
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Download size={14} className="text-sky-600" /> Download Sample Excel
            </button>
          </div>

          {bulkErrorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-800">Generation Error</p>
                <p className="text-xs text-red-700 leading-relaxed">{bulkErrorMessage}</p>
              </div>
            </div>
          )}

          {preflightError && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-900">Preflight Notice</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{preflightError}</p>
                </div>
              </div>
              {excelRows.length > 0 && selectedSetupId && (
                <button
                  onClick={() => runPreflightCheck(selectedSetupId, excelRows)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                >
                  Retry Preflight
                </button>
              )}
            </div>
          )}

          {preflightLoading && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3">
              <RefreshCw className="animate-spin text-sky-600 shrink-0" size={18} />
              <p className="text-xs text-sky-800 font-medium">Analyzing spreadsheet rows against template text bounding boxes...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">1. Select Certificate Setup</label>
              <select
                value={selectedSetupId}
                onChange={(e) => {
                  setSelectedSetupId(e.target.value);
                  if (excelRows.length > 0) runPreflightCheck(e.target.value, excelRows);
                }}
                required
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                {setups.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">2. Upload Spreadsheet (.xlsx / .csv)</label>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelFileUpload}
                className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500"
              />
            </div>
          </div>

          {preflightSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-200">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Rows</span>
                <p className="text-xl font-bold text-slate-900">{preflightSummary.total}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                <span className="text-[10px] text-emerald-700 font-semibold uppercase flex items-center gap-1">
                  <CheckCircle size={12} /> Ready (Fits)
                </span>
                <p className="text-xl font-bold text-emerald-700">{preflightSummary.ready}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <span className="text-[10px] text-amber-700 font-semibold uppercase flex items-center gap-1">
                  <AlertTriangle size={12} /> Will Wrap
                </span>
                <p className="text-xl font-bold text-amber-700">{preflightSummary.wrapped}</p>
              </div>
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-lg">
                <span className="text-[10px] text-sky-700 font-semibold uppercase">Font Reduced</span>
                <p className="text-xl font-bold text-sky-700">{preflightSummary.fontReduced}</p>
              </div>
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <span className="text-[10px] text-red-700 font-semibold uppercase flex items-center gap-1">
                  <XCircle size={12} /> Overflow Errors
                </span>
                <p className="text-xl font-bold text-red-700">{preflightSummary.errors}</p>
              </div>
            </div>
          )}

          {excelRows.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-sky-600" /> Preflight Analysis Results ({preflightRows.length} Rows)
                </span>

                <div className="flex gap-2">
                  {failedRows.length > 0 && (
                    <button
                      onClick={() => handleBulkGenerate(true)}
                      disabled={bulkGenerating}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw size={14} /> Retry {failedRows.length} Failed Rows
                    </button>
                  )}

                  <button
                    onClick={() => handleBulkGenerate(false)}
                    disabled={bulkGenerating || excelRows.length === 0}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-sky-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {bulkGenerating ? `Generating... (${bulkProgress}%)` : `Generate ${excelRows.length} Certificates`}
                  </button>
                </div>
              </div>

              {bulkGenerating && (
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div className="bg-sky-600 h-full transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                </div>
              )}

              <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200 sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="p-3 w-12 text-center">Row</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Reg. No</th>
                      <th className="p-3">College</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Period</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {preflightRows.map((row, idx) => (
                      <tr key={row.rowNumber} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 text-center font-mono text-slate-400">{row.rowNumber}</td>
                        <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">{row.studentName}</td>
                        <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{row.regNo || "—"}</td>
                        <td className="p-3 text-slate-600 max-w-[170px] truncate" title={row.collegeName}>{row.collegeName || "—"}</td>
                        <td className="p-3 text-slate-600 max-w-[130px] truncate" title={row.dept}>{row.dept || "—"}</td>
                        <td className="p-3 text-slate-700 max-w-[150px] truncate" title={row.domain}>{row.domain || "—"}</td>
                        <td className="p-3 text-slate-500 whitespace-nowrap text-[11px]">
                          {row.startDate && row.endDate ? `${row.startDate} → ${row.endDate}` : (row.startDate || row.endDate || "—")}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {row.status === "ready" && <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">✅ Fits Perfectly</span>}
                          {row.status === "wrapped" && <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">⚠ Auto-Wrapped</span>}
                          {row.status === "font_reduced" && <span className="inline-flex items-center gap-1 text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[10px]">ℹ Scaled Font</span>}
                          {row.status === "overflow_error" && <span className="inline-flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">ℹ Auto-Fitted</span>}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleStartEditPreflightRow(idx)}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-[11px] font-medium inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Edit3 size={11} className="text-sky-600" /> Edit
                          </button>
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

      {/* Modal 1: Certificate Dossier & Inspection (Inspired by Daylink) */}
      {inspectCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Certificate Dossier</h3>
                  <p className="text-xs font-mono text-sky-600 font-medium">{inspectCert.certificateNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectCert(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Visual Certificate Preview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="aspect-[1/1.414] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative shadow-inner p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inspectCert.pngUrl}
                    alt={inspectCert.studentName}
                    className="w-full h-full object-contain rounded bg-white shadow-sm"
                  />
                  <div className="absolute bottom-4 right-4 scale-75 opacity-90 pointer-events-none">
                    <OfficialStamp size={90} color="#002b66" />
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata & Actions */}
              <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Status</span>
                    <span
                      className={`px-2.5 py-0.5 rounded font-semibold text-xs uppercase border ${
                        inspectCert.status === "revoked" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                    >
                      {inspectCert.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Student Full Name</span>
                      <span className="font-bold text-slate-900 text-sm">{inspectCert.studentName}</span>
                    </div>

                    {Boolean(inspectCert.recipientData?.reg_no) && (
                      <div>
                        <span className="text-slate-500 block text-[11px]">Registration No</span>
                        <span className="font-mono text-slate-700">{String(inspectCert.recipientData?.reg_no)}</span>
                      </div>
                    )}

                    {Boolean(inspectCert.recipientData?.college_name) && (
                      <div>
                        <span className="text-slate-500 block text-[11px]">College / Institute</span>
                        <span className="font-medium text-slate-800">{String(inspectCert.recipientData?.college_name)}</span>
                      </div>
                    )}

                    {Boolean(inspectCert.recipientData?.domain) && (
                      <div>
                        <span className="text-slate-500 block text-[11px]">Project Domain</span>
                        <span className="font-semibold text-sky-700">{String(inspectCert.recipientData?.domain)}</span>
                      </div>
                    )}

                    {Boolean(inspectCert.recipientData?.start_date && inspectCert.recipientData?.end_date) && (
                      <div>
                        <span className="text-slate-500 block text-[11px]">Term Period</span>
                        <span className="font-medium text-slate-700">
                          {String(inspectCert.recipientData?.start_date)} to {String(inspectCert.recipientData?.end_date)}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500 block text-[11px]">Issued On</span>
                      <span className="text-slate-700">{new Date(inspectCert.issuedAt).toLocaleDateString()}</span>
                    </div>

                    {inspectCert.lastEmailedTo && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-slate-500 block text-[11px]">Email Dispatch</span>
                        <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                          <Check size={12} /> Dispatched to {inspectCert.lastEmailedTo}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Public Verification Link Copy */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Public QR Verification Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== "undefined" ? getVerificationUrl(inspectCert) : ""}
                        className="flex-1 bg-white border border-slate-300 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono select-all focus:outline-none"
                      />
                      <button
                        onClick={() => copyVerificationLink(inspectCert)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
                          copiedCertId === inspectCert._id
                            ? "bg-emerald-600 text-white"
                            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs"
                        }`}
                      >
                        {copiedCertId === inspectCert._id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCertId === inspectCert._id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-2">

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`/api/certificates/${inspectCert._id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2 rounded-lg text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Download size={13} /> PDF Document
                    </a>
                    <a
                      href={typeof window !== "undefined" ? getVerificationUrl(inspectCert) : "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2 rounded-lg text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink size={13} /> Verify Page
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Student Email Dispatch Composer - hidden */}
      {emailModalCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Dispatch Certificate Email</h3>
                  <p className="text-xs text-slate-500">Official Softmusk Credential Notification</p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalCert(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {emailFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  emailFeedback.startsWith("Certificate")
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {emailFeedback.startsWith("Certificate") ? <Check size={14} /> : <XCircle size={14} />}
                <span>{emailFeedback}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Email Address
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Subject
                </label>
                <div className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-mono">
                  Internship Completion Certificate - {emailModalCert.studentName} | Softmusk Info Pvt. Ltd.
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs text-slate-600">
                <span className="font-semibold text-sky-700 block text-[11px] uppercase tracking-wider">Email Summary Contents</span>
                <p>• Formal congratulatory message to <strong>{emailModalCert.studentName}</strong></p>
                <p>• Verified certificate link with cryptographic token</p>
                <p>• Direct Vector PDF download attachment link</p>
                <p>• QR verification instructions for LinkedIn & employer validation</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEmailModalCert(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg text-xs transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={sendingEmail || !emailRecipient}
                onClick={handleSendEmail}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-all shadow-sm shadow-sky-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Dispatching...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Dispatch Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT CERTIFICATE (FROM ARCHIVE TABLE) ─── */}
      {editCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Certificate</h3>
                  <p className="text-xs font-mono text-sky-600 font-medium">{editCert.certificateNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setEditCert(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEditCertificate();
              }}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={editFormData.student_name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, student_name: e.target.value })}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={editFormData.reg_no || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, reg_no: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editFormData.dept || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, dept: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College / Institution</label>
                <input
                  type="text"
                  value={editFormData.college_name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, college_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project / Domain</label>
                <input
                  type="text"
                  value={editFormData.domain || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, domain: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 25-May-2026"
                    value={editFormData.start_date || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 14-Aug-2026"
                    value={editFormData.end_date || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Status</label>
                <select
                  value={editFormData.status || "issued"}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="issued">ISSUED (Active & Valid)</option>
                  <option value="revoked">REVOKED (Invalidated)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditCert(null)}
                  disabled={editSaving}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {editSaving ? "Saving & Re-rendering..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT PREFLIGHT ROW (BEFORE GENERATION) ─── */}
      {editPreflightIndex !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="text-sky-600" size={20} />
                <h3 className="font-bold text-slate-900 text-sm">Edit Excel Row #{editPreflightIndex + 1}</h3>
              </div>
              <button
                onClick={() => setEditPreflightIndex(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSavePreflightRow();
              }}
              className="p-6 space-y-3 overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  value={editPreflightRowData.student_name || ""}
                  onChange={(e) => setEditPreflightRowData({ ...editPreflightRowData, student_name: e.target.value })}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registration No</label>
                  <input
                    type="text"
                    value={editPreflightRowData.reg_no || ""}
                    onChange={(e) => setEditPreflightRowData({ ...editPreflightRowData, reg_no: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editPreflightRowData.dept || ""}
                    onChange={(e) => setEditPreflightRowData({ ...editPreflightRowData, dept: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Name</label>
                <input
                  type="text"
                  value={editPreflightRowData.college_name || ""}
                  onChange={(e) => setEditPreflightRowData({ ...editPreflightRowData, college_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project / Domain</label>
                <input
                  type="text"
                  value={editPreflightRowData.domain || ""}
                  onChange={(e) => setEditPreflightRowData({ ...editPreflightRowData, domain: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={editPreflightRowData.start_date || ""}
                    onChange={(e) => setEditPreflightRowData({ ...editPreflightRowData, start_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    value={editPreflightRowData.end_date || ""}
                    onChange={(e) => setEditPreflightRowData({ ...editPreflightRowData, end_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditPreflightIndex(null)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 text-xs font-semibold rounded-lg shadow-sm"
                >
                  Update Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
