"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FolderKanban,
  Save,
  Type,
  QrCode,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Upload,
  RefreshCw,
  Eye,
  RotateCcw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Move,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Palette,
  Sliders,
  Square,
  Circle,
  Award,
  ShieldCheck,
  FileText,
  X,
  ExternalLink,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Wand2,
  Scissors,
  Check,
  EyeOff,
} from "lucide-react";
import {
  CertificateElement,
  CertificateElementType,
  CertificateShapeType,
} from "@/types/template";

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

// 5 Realistic Student Profiles for Testing Name Lengths & Layouts
const SAMPLE_STUDENTS = [
  {
    student_name: "Rahul Sharma",
    college_name: "KLS Gogte Institute of Technology",
    dept: "Computer Science & Engineering",
    reg_no: "2GI22CS045",
    domain: "IoT + React Full Stack Web Architecture",
    course: "Advanced Full Stack Internship",
    start_date: "01-Jan-2026",
    end_date: "02-Feb-2026",
    certificate_number: "SM-2026-00045",
  },
  {
    student_name: "Siddharth Raghavendra Prakash Kulkarni",
    college_name: "Visvesvaraya Technological University",
    dept: "Information Science & Engineering",
    reg_no: "2GI22IS089",
    domain: "AI-Powered Distributed Microservices & Cloud Architecture",
    course: "Cloud & AI Engineering",
    start_date: "15-Jan-2026",
    end_date: "15-Jun-2026",
    certificate_number: "SM-2026-00046",
  },
  {
    student_name: "Ashok Kumar",
    college_name: "BMS College of Engineering",
    dept: "AI & Machine Learning",
    reg_no: "1BM22AI012",
    domain: "Deep Learning & Neural Solutions",
    course: "Applied AI Internship",
    start_date: "01-Feb-2026",
    end_date: "01-May-2026",
    certificate_number: "SM-2026-00047",
  },
  {
    student_name: "Ruchita Lavar",
    college_name: "Jain College of Engineering & Technology",
    dept: "Computer Science & Engineering",
    reg_no: "2GI22CS001",
    domain: "Cloud Native SaaS Development",
    course: "Enterprise SaaS Engineering",
    start_date: "25-May-2026",
    end_date: "14-Aug-2026",
    certificate_number: "SM-2026-00048",
  },
  {
    student_name: "Pooja Kulkarni",
    college_name: "RV College of Engineering",
    dept: "Electronics & Communication",
    reg_no: "1RV22EC045",
    domain: "Embedded Systems & Edge Computing",
    course: "Hardware & IoT Systems",
    start_date: "10-Jan-2026",
    end_date: "10-Apr-2026",
    certificate_number: "SM-2026-00049",
  },
];

const PRESET_SOFTMUSK_ELEMENTS: CertificateElement[] = [
  {
    id: "el_student_name",
    type: "variable",
    variableKey: "student_name",
    content: "Mr./ Ms. Rahul Sharma",
    position: { x: 105, y: 280, width: 385, height: 42 },
    style: {
      fontSize: 26,
      fontFamily: "Times-Roman",
      fontWeight: 700,
      textAlign: "center",
      color: "#03046e",
    },
    smartFit: {
      enabled: true,
      maxLines: 1,
      minFontSize: 16,
      wordWrap: false,
    },
  },
  {
    id: "el_para_1",
    type: "text",
    content:
      "A student of {{college_name}}, {{dept}} has successfully completed his/her internship from {{start_date}} to {{end_date}} at \u201cSoftmusk Info Pvt. Ltd Belagavi, Karnataka.\u201d",
    position: { x: 45, y: 350, width: 505, height: 62 },
    style: {
      fontSize: 13,
      fontFamily: "Times-Roman",
      fontWeight: 400,
      textAlign: "center",
      color: "#1e293b",
      lineHeight: 1.45,
    },
    smartFit: {
      enabled: true,
      maxLines: 3,
      minFontSize: 10,
      wordWrap: true,
    },
  },
  {
    id: "el_para_2",
    type: "text",
    content:
      "Was able to successfully participate in and accomplish all the tasks required for the project entitled \u201c{{domain}}\u201d through which he/she was able to showcase his/her great work and team player skills.",
    position: { x: 45, y: 418, width: 505, height: 55 },
    style: {
      fontSize: 13,
      fontFamily: "Times-Roman",
      fontWeight: 400,
      textAlign: "center",
      color: "#1e293b",
      lineHeight: 1.45,
    },
    smartFit: {
      enabled: true,
      maxLines: 3,
      minFontSize: 10,
      wordWrap: true,
    },
  },
  {
    id: "el_para_3",
    type: "text",
    content:
      "We at Softmusk Info Pvt. Ltd have thoroughly enjoyed having him/her as an intern and we wish him/her all the best in his/her future endeavors.",
    position: { x: 45, y: 478, width: 505, height: 45 },
    style: {
      fontSize: 13,
      fontFamily: "Times-Roman",
      fontWeight: 400,
      textAlign: "center",
      color: "#1e293b",
      lineHeight: 1.45,
    },
    smartFit: {
      enabled: true,
      maxLines: 2,
      minFontSize: 10,
      wordWrap: true,
    },
  },
  {
    id: "el_qr_token",
    type: "qr",
    position: { x: 468, y: 525, width: 72, height: 72 },
  },
  {
    id: "el_qr_label",
    type: "text",
    content: "Scan the QR code to verify this certificate",
    position: { x: 430, y: 600, width: 148, height: 22 },
    style: {
      fontSize: 7.5,
      fontFamily: "Helvetica",
      fontWeight: 400,
      textAlign: "center",
      color: "#475569",
    },
    smartFit: {
      enabled: true,
      maxLines: 2,
      minFontSize: 6,
      wordWrap: true,
    },
  },
];

const CURATED_COLORS = [
  { name: "Softmusk Blue", value: "#002b66" },
  { name: "Luxury Gold", value: "#c59b27" },
  { name: "Dark Navy", value: "#0f172a" },
  { name: "Slate Gray", value: "#475569" },
  { name: "Deep Crimson", value: "#8b0000" },
  { name: "Royal Emerald", value: "#065f46" },
  { name: "Pure Black", value: "#000000" },
  { name: "Pure White", value: "#ffffff" },
];

const FONT_FAMILIES = [
  { label: "Times New Roman (Classic Serif)", value: "Times-Roman" },
  { label: "Helvetica (Clean Modern)", value: "Helvetica" },
  { label: "Georgia (Editorial Serif)", value: "Georgia" },
  { label: "Playfair (Luxury Display)", value: "Playfair" },
  { label: "Montserrat (Geometric Sans)", value: "Montserrat" },
  { label: "Courier (Monospace / Code)", value: "Courier" },
  { label: "Great Vibes (Script / Signature)", value: "Great Vibes" },
];

export default function TemplateEditorPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  // Editor Core State
  const [name, setName] = useState("");
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [renderingPdf, setRenderingPdf] = useState(false);
  const [elements, setElements] = useState<CertificateElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Studio Interactive Canvas State
  const [zoom, setZoom] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToCenter, setSnapToCenter] = useState(true);
  const [activeGuideX, setActiveGuideX] = useState<number | null>(null);
  const [activeGuideY, setActiveGuideY] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [sampleStudentIdx, setSampleStudentIdx] = useState(0);

  // Drag & Resize Engine State
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeInitBox, setResizeInitBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    mouseX: number;
    mouseY: number;
  }>({ x: 0, y: 0, width: 0, height: 0, mouseX: 0, mouseY: 0 });

  // Undo / Redo History Stack
  const [history, setHistory] = useState<CertificateElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Left Sidebar Tab
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "elements" | "lines" | "shapes" | "assets" | "layers"
  >("elements");

  // Template Dimensions
  const [tmplWidth, setTmplWidth] = useState<number>(595.28);
  const [tmplHeight, setTmplHeight] = useState<number>(841.89);

  const canvasRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Push to undo stack
  const pushHistory = useCallback(
    (newElements: CertificateElement[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, newElements].slice(-30); // keep last 30
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setElements(history[newIdx]);
      showToast("Undo applied");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setElements(history[newIdx]);
      showToast("Redo applied");
    }
  };

  // Helper to load PDF.js from CDN on demand
  const renderPdfToImage = async (file: File): Promise<{ dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const runRender = async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pdfjsLib = (window as any).pdfjsLib;
          if (!pdfjsLib) throw new Error("PDF renderer library not loaded");
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

          const arrayBuf = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuf });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL("image/png");
          resolve({ dataUrl, width: page.view[2], height: page.view[3] });
        } catch (e) {
          reject(e);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).pdfjsLib) {
        runRender();
      } else {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => runRender();
        script.onerror = () => reject(new Error("Failed to load PDF.js"));
        document.head.appendChild(script);
      }
    });
  };

  const handleFileSelect = async (file: File) => {
    setBgFile(file);
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setRenderingPdf(true);
      try {
        const { dataUrl, width, height } = await renderPdfToImage(file);
        setPreviewUrl(dataUrl);
        setTmplWidth(width);
        setTmplHeight(height);
        showToast(`Rendered PDF: ${Math.round(width)} × ${Math.round(height)} pt`);
      } catch (err) {
        console.warn("PDF.js render failed, falling back:", err);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
        setTmplWidth(595.28);
        setTmplHeight(841.89);
      } finally {
        setRenderingPdf(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
        const img = new Image();
        img.onload = () => {
          setTmplWidth(img.naturalWidth);
          setTmplHeight(img.naturalHeight);
          showToast(`Image loaded: ${img.naturalWidth} × ${img.naturalHeight} px`);
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTemplateIntoEditor = (tmpl: Template) => {
    setActiveTemplate(tmpl);
    setName(tmpl.name);
    const initialEls = tmpl.elements || [];
    setElements(initialEls);
    setHistory([initialEls]);
    setHistoryIndex(0);
    setTmplWidth(tmpl.width || 595.28);
    setTmplHeight(tmpl.height || 841.89);
    setPreviewUrl("");
    setBgFile(null);
    setSelectedElementId(null);
  };

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
          width: tmplWidth,
          height: tmplHeight,
          backgroundUrl: previewUrl || activeTemplate.backgroundUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save template");
      }

      setActiveTemplate(data.template);
      await fetchData();
      showToast("Template elements and layout saved successfully!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error saving template");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Please enter a Template Title.");
      return;
    }
    if (!bgFile && !previewUrl) {
      setError("Please select a Background PDF or Image file.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      if (bgFile) formData.append("file", bgFile);
      formData.append("name", name);
      formData.append("elements", JSON.stringify(elements));
      formData.append("width", String(tmplWidth));
      formData.append("height", String(tmplHeight));
      if (previewUrl) formData.append("previewUrl", previewUrl);

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
      setShowUploadModal(false);
      await fetchData();
      showToast("New Certificate Template created successfully!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating template");
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Auto Arrange Certificate
  const applyAutoArrange = () => {
    setElements(PRESET_SOFTMUSK_ELEMENTS);
    pushHistory(PRESET_SOFTMUSK_ELEMENTS);
    setSelectedElementId("el_student_name");
    showToast("Certificate elements automatically arranged & aligned!");
  };

  // Add Element with Undo Support
  const addElement = (
    type: CertificateElementType,
    variableKey?: string,
    cloudinaryUrl?: string,
    customText?: string,
    shapeType?: CertificateShapeType
  ) => {
    const isPortrait = tmplWidth < tmplHeight;
    let defaultWidth = isPortrait ? 460 : 550;
    let defaultHeight = 45;

    if (type === "line") {
      defaultWidth = isPortrait ? 420 : 500;
      defaultHeight = 12;
    } else if (type === "shape" || type === "badge") {
      defaultWidth = shapeType === "circle" || shapeType === "seal" ? 90 : 180;
      defaultHeight = shapeType === "circle" || shapeType === "seal" ? 90 : 60;
    } else if (type === "qr") {
      defaultWidth = 90;
      defaultHeight = 90;
    }

    const newEl: CertificateElement = {
      id: "el_" + Date.now(),
      type,
      variableKey: variableKey || (type === "variable" ? "student_name" : undefined),
      content: customText || (type === "text" ? "Sample Certificate Text" : undefined),
      cloudinaryUrl,
      position: {
        x: Math.round((tmplWidth - defaultWidth) / 2),
        y: Math.round(tmplHeight / 2) - Math.round(defaultHeight / 2),
        width: defaultWidth,
        height: defaultHeight,
      },
      style: {
        fontSize: type === "variable" ? 22 : 14,
        fontFamily: type === "variable" ? "Times-Roman" : "Helvetica",
        fontWeight: type === "variable" ? 700 : 400,
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "center",
        color: type === "variable" ? "#002b66" : (type === "line" ? "#c59b27" : "#1e293b"),
        borderColor: "#c59b27",
        borderWidth: type === "line" ? 2 : 1,
        shapeType: shapeType || (type === "line" ? "gold-divider" : undefined),
      },
      smartFit: {
        enabled: true,
        maxLines: type === "text" ? 3 : 1,
        minFontSize: 10,
        wordWrap: true,
      },
    };

    const updated = [...elements, newEl];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(newEl.id);
    showToast(`Added ${type} element`);
  };

  const updateSelectedElement = (updates: Partial<CertificateElement>) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, ...updates } : el))
    );
  };

  const duplicateSelectedElement = () => {
    if (!selectedEl) return;
    const clone: CertificateElement = {
      ...selectedEl,
      id: "el_" + Date.now(),
      position: {
        ...selectedEl.position,
        x: Math.min(tmplWidth - selectedEl.position.width, selectedEl.position.x + 15),
        y: Math.min(tmplHeight - selectedEl.position.height, selectedEl.position.y + 15),
      },
    };
    const updated = [...elements, clone];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(clone.id);
    showToast("Element duplicated");
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    const updated = elements.filter((el) => el.id !== selectedElementId);
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(null);
    showToast("Element removed");
  };

  // Alignment Helpers
  const alignSelectedCenterHorizontal = () => {
    if (!selectedEl) return;
    const newX = Math.round((tmplWidth - selectedEl.position.width) / 2);
    updateSelectedElement({
      position: { ...selectedEl.position, x: newX },
    });
    showToast("Aligned to horizontal center");
  };

  const alignSelectedCenterVertical = () => {
    if (!selectedEl) return;
    const newY = Math.round((tmplHeight - selectedEl.position.height) / 2);
    updateSelectedElement({
      position: { ...selectedEl.position, y: newY },
    });
    showToast("Aligned to vertical center");
  };

  // Layer Ordering
  const bringElementForward = () => {
    if (!selectedElementId) return;
    const idx = elements.findIndex((el) => el.id === selectedElementId);
    if (idx < elements.length - 1) {
      const copy = [...elements];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      setElements(copy);
      pushHistory(copy);
    }
  };

  const sendElementBackward = () => {
    if (!selectedElementId) return;
    const idx = elements.findIndex((el) => el.id === selectedElementId);
    if (idx > 0) {
      const copy = [...elements];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      setElements(copy);
      pushHistory(copy);
    }
  };

  const toggleElementLock = () => {
    if (!selectedEl) return;
    updateSelectedElement({ locked: !selectedEl.locked });
    showToast(selectedEl.locked ? "Element unlocked" : "Element locked");
  };

  const toggleElementHide = () => {
    if (!selectedEl) return;
    updateSelectedElement({ hidden: !selectedEl.hidden });
    showToast(selectedEl.hidden ? "Element visible" : "Element hidden");
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveExistingTemplate();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        duplicateSelectedElement();
        return;
      }

      if (!isInput && selectedEl && !selectedEl.locked) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          updateSelectedElement({
            position: { ...selectedEl.position, y: Math.max(0, selectedEl.position.y - step) },
          });
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          updateSelectedElement({
            position: {
              ...selectedEl.position,
              y: Math.min(tmplHeight - selectedEl.position.height, selectedEl.position.y + step),
            },
          });
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          updateSelectedElement({
            position: { ...selectedEl.position, x: Math.max(0, selectedEl.position.x - step) },
          });
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          updateSelectedElement({
            position: {
              ...selectedEl.position,
              x: Math.min(tmplWidth - selectedEl.position.width, selectedEl.position.x + step),
            },
          });
        } else if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          deleteSelectedElement();
        } else if (e.key === "Escape") {
          setSelectedElementId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const selectedEl = elements.find((el) => el.id === selectedElementId);

  // Proportional Display Calculation
  const isPortrait = tmplWidth < tmplHeight;
  const baseCanvasWidth = isPortrait ? 420 : 600;
  const canvasWidth = Math.round(baseCanvasWidth * zoom);
  const canvasHeight = Math.round(canvasWidth * (tmplHeight / tmplWidth));
  const scale = canvasWidth / tmplWidth;
  const invScale = tmplWidth / canvasWidth;

  const currentBgUrl = previewUrl || activeTemplate?.backgroundUrl;
  const currentStudent = SAMPLE_STUDENTS[sampleStudentIdx];

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Top Application Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-slate-200/90 px-5 py-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center text-xs font-black">
                SM
              </span>
              <span>Design Studio</span>
            </h1>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                isPortrait
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isPortrait ? "Portrait A4" : "Landscape A4"} ({Math.round(tmplWidth)} × {Math.round(tmplHeight)} pt)
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Template Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
            <Layers size={13} className="text-slate-500" />
            <select
              value={activeTemplate?._id || ""}
              onChange={(e) => {
                const found = templates.find((t) => t._id === e.target.value);
                if (found) loadTemplateIntoEditor(found);
              }}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
            >
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template Name Input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template Title..."
            className="text-xs font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none px-1 py-0.5 max-w-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-200/60 transition-colors"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-200/60 transition-colors"
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* Auto Arrange 1-Click Button */}
          <button
            onClick={applyAutoArrange}
            title="Auto-arrange certificate fields to official standard layout"
            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/90 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Wand2 size={13} className="text-amber-600" />
            <span>Auto Layout</span>
          </button>

          {/* Preview Mode with Student Switcher */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                previewMode
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/60"
              }`}
            >
              <Eye size={13} />
              <span>{previewMode ? "Preview Mode" : "Design Mode"}</span>
            </button>
            {previewMode && (
              <div className="flex items-center pl-1 border-l border-slate-200 gap-0.5">
                <button
                  onClick={() =>
                    setSampleStudentIdx((prev) =>
                      prev > 0 ? prev - 1 : SAMPLE_STUDENTS.length - 1
                    )
                  }
                  title="Previous Student"
                  className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="text-[11px] font-mono px-1 font-semibold text-slate-800 truncate max-w-[110px]">
                  {currentStudent.student_name.split(" ")[0]}
                </span>
                <button
                  onClick={() =>
                    setSampleStudentIdx((prev) =>
                      prev < SAMPLE_STUDENTS.length - 1 ? prev + 1 : 0
                    )
                  }
                  title="Next Student"
                  className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Upload size={13} className="text-sky-600" />
            <span>Upload Background</span>
          </button>

          {activeTemplate && (
            <button
              onClick={handleSaveExistingTemplate}
              disabled={saving}
              className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-sky-600/20 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save Template"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Canva-Style Contextual Toolbar (Dynamic based on selected element) */}
      <div className="bg-white border border-slate-200/90 px-4 py-2 rounded-xl shadow-xs flex items-center justify-between gap-3 overflow-x-auto min-h-[44px]">
        {selectedEl && !previewMode ? (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Label / Type Badge */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
              <span className="text-[10px] font-mono uppercase bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded font-bold">
                {selectedEl.type === "variable" ? `{{${selectedEl.variableKey}}}` : selectedEl.type}
              </span>
            </div>

            {/* Typography Controls (When Text or Variable) */}
            {(selectedEl.type === "text" || selectedEl.type === "variable") && (
              <>
                {/* Font Family Picker */}
                <select
                  value={selectedEl.style?.fontFamily || "Helvetica"}
                  onChange={(e) =>
                    updateSelectedElement({
                      style: { ...selectedEl.style!, fontFamily: e.target.value },
                    })
                  }
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>

                {/* Font Size (+ / - / input) */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() =>
                      updateSelectedElement({
                        style: {
                          ...selectedEl.style!,
                          fontSize: Math.max(8, (selectedEl.style?.fontSize || 14) - 1),
                        },
                      })
                    }
                    className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200/60"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    value={selectedEl.style?.fontSize || 14}
                    onChange={(e) =>
                      updateSelectedElement({
                        style: { ...selectedEl.style!, fontSize: Number(e.target.value) },
                      })
                    }
                    className="w-10 text-center bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      updateSelectedElement({
                        style: {
                          ...selectedEl.style!,
                          fontSize: (selectedEl.style?.fontSize || 14) + 1,
                        },
                      })
                    }
                    className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200/60"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Bold, Italic, Underline */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() =>
                      updateSelectedElement({
                        style: {
                          ...selectedEl.style!,
                          fontWeight: (selectedEl.style?.fontWeight || 400) > 500 ? 400 : 700,
                        },
                      })
                    }
                    className={`p-1.5 rounded transition-colors ${
                      (selectedEl.style?.fontWeight || 400) > 500
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                    title="Bold"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    onClick={() =>
                      updateSelectedElement({
                        style: {
                          ...selectedEl.style!,
                          fontStyle:
                            selectedEl.style?.fontStyle === "italic" ? "normal" : "italic",
                        },
                      })
                    }
                    className={`p-1.5 rounded transition-colors ${
                      selectedEl.style?.fontStyle === "italic"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                    title="Italic"
                  >
                    <Italic size={13} />
                  </button>
                  <button
                    onClick={() =>
                      updateSelectedElement({
                        style: {
                          ...selectedEl.style!,
                          textDecoration:
                            selectedEl.style?.textDecoration === "underline" ? "none" : "underline",
                        },
                      })
                    }
                    className={`p-1.5 rounded transition-colors ${
                      selectedEl.style?.textDecoration === "underline"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                    title="Underline"
                  >
                    <Underline size={13} />
                  </button>
                </div>

                {/* Color Swatch & Native Color Input */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <input
                    type="color"
                    value={selectedEl.style?.color || "#000000"}
                    onChange={(e) =>
                      updateSelectedElement({
                        style: { ...selectedEl.style!, color: e.target.value },
                      })
                    }
                    className="w-5 h-5 rounded border border-slate-300 p-0 cursor-pointer"
                    title="Custom Text Color"
                  />
                  <div className="flex items-center gap-0.5">
                    {CURATED_COLORS.slice(0, 5).map((c) => (
                      <button
                        key={c.value}
                        onClick={() =>
                          updateSelectedElement({
                            style: { ...selectedEl.style!, color: c.value },
                          })
                        }
                        style={{ backgroundColor: c.value }}
                        className="w-3.5 h-3.5 rounded-full border border-slate-300/80 hover:scale-110 transition-transform"
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Alignment */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        updateSelectedElement({
                          style: { ...selectedEl.style!, textAlign: align },
                        })
                      }
                      className={`p-1.5 rounded transition-colors ${
                        (selectedEl.style?.textAlign || "center") === align
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                      title={`Align ${align}`}
                    >
                      {align === "left" && <AlignLeft size={13} />}
                      {align === "center" && <AlignCenter size={13} />}
                      {align === "right" && <AlignRight size={13} />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Line / Divider Controls */}
            {selectedEl.type === "line" && (
              <>
                <select
                  value={selectedEl.style?.shapeType || "gold-divider"}
                  onChange={(e) =>
                    updateSelectedElement({
                      style: {
                        ...selectedEl.style!,
                        shapeType: e.target.value as CertificateShapeType,
                      },
                    })
                  }
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="gold-divider">Gold Diamond Divider</option>
                  <option value="double-line">Double Formal Line</option>
                  <option value="line">Single Solid Rule</option>
                  <option value="dashed-line">Dashed Rule</option>
                  <option value="dotted-line">Dotted Rule</option>
                </select>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <span className="text-[10px] text-slate-500 font-medium pl-1">Color:</span>
                  <input
                    type="color"
                    value={selectedEl.style?.color || selectedEl.style?.borderColor || "#c59b27"}
                    onChange={(e) =>
                      updateSelectedElement({
                        style: {
                          ...selectedEl.style!,
                          color: e.target.value,
                          borderColor: e.target.value,
                        },
                      })
                    }
                    className="w-5 h-5 rounded border border-slate-300 p-0 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Shape / Badge Controls */}
            {(selectedEl.type === "shape" || selectedEl.type === "badge") && (
              <>
                <select
                  value={selectedEl.style?.shapeType || "rectangle"}
                  onChange={(e) =>
                    updateSelectedElement({
                      style: {
                        ...selectedEl.style!,
                        shapeType: e.target.value as CertificateShapeType,
                      },
                    })
                  }
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="rectangle">Rectangle Frame</option>
                  <option value="rounded">Rounded Pill Card</option>
                  <option value="circle">Circle Seal</option>
                  <option value="seal">Gold Verified Seal</option>
                  <option value="medal">Excellence Medal</option>
                </select>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-slate-500">Fill:</span>
                  <input
                    type="color"
                    value={selectedEl.style?.backgroundColor || "#fef3c7"}
                    onChange={(e) =>
                      updateSelectedElement({
                        style: { ...selectedEl.style!, backgroundColor: e.target.value },
                      })
                    }
                    className="w-4 h-4 rounded border border-slate-300 p-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 pl-1">Border:</span>
                  <input
                    type="color"
                    value={selectedEl.style?.borderColor || "#c59b27"}
                    onChange={(e) =>
                      updateSelectedElement({
                        style: { ...selectedEl.style!, borderColor: e.target.value },
                      })
                    }
                    className="w-4 h-4 rounded border border-slate-300 p-0 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Canvas Alignments & Position Quick Buttons */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
              <button
                onClick={alignSelectedCenterHorizontal}
                title="Center Horizontally on Canvas"
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <AlignCenter size={12} />
                <span>Center X</span>
              </button>
              <button
                onClick={alignSelectedCenterVertical}
                title="Center Vertically on Canvas"
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Center Y</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <span>Select any element on the certificate canvas to format typography, colors, borders and alignment.</span>
          </div>
        )}

        {/* Global Toolbar Actions */}
        {selectedEl && !previewMode && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 shrink-0">
            <button
              onClick={bringElementForward}
              title="Bring Forward"
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
            >
              <ArrowUp size={13} />
            </button>
            <button
              onClick={sendElementBackward}
              title="Send Backward"
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
            >
              <ArrowDown size={13} />
            </button>
            <button
              onClick={toggleElementLock}
              title={selectedEl.locked ? "Unlock" : "Lock Position"}
              className={`p-1.5 rounded ${
                selectedEl.locked ? "text-amber-600 bg-amber-50" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {selectedEl.locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
            <button
              onClick={duplicateSelectedElement}
              title="Duplicate (Ctrl+D)"
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={deleteSelectedElement}
              title="Delete (Delete)"
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Main Studio 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Elements Sidebar (Tabs & Drawer) - 3 Columns */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-4">
          {/* Navigation Category Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSidebarTab("elements")}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                activeSidebarTab === "elements"
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Fields
            </button>
            <button
              onClick={() => setActiveSidebarTab("lines")}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                activeSidebarTab === "lines"
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lines
            </button>
            <button
              onClick={() => setActiveSidebarTab("shapes")}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                activeSidebarTab === "shapes"
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Badges
            </button>
            <button
              onClick={() => setActiveSidebarTab("assets")}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                activeSidebarTab === "assets"
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Signs
            </button>
            <button
              onClick={() => setActiveSidebarTab("layers")}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                activeSidebarTab === "layers"
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Layers
            </button>
          </div>

          {/* TAB 1: Certificate Fields & Dynamic Variables */}
          {activeSidebarTab === "elements" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Standard Certificate Variables
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => addElement("variable", "student_name")}
                    className="bg-slate-50 border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 p-2 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-sky-700">
                      Student Name
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{"{{student_name}}"}</div>
                  </button>
                  <button
                    onClick={() => addElement("variable", "reg_no")}
                    className="bg-slate-50 border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 p-2 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-sky-700">
                      Reg. Number
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{"{{reg_no}}"}</div>
                  </button>
                  <button
                    onClick={() => addElement("variable", "college_name")}
                    className="bg-slate-50 border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 p-2 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-sky-700">
                      College Name
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{"{{college_name}}"}</div>
                  </button>
                  <button
                    onClick={() => addElement("variable", "dept")}
                    className="bg-slate-50 border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 p-2 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-sky-700">
                      Department
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{"{{dept}}"}</div>
                  </button>
                  <button
                    onClick={() => addElement("variable", "domain")}
                    className="bg-slate-50 border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 p-2 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-sky-700">
                      Domain / Project
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{"{{domain}}"}</div>
                  </button>
                  <button
                    onClick={() => addElement("variable", "certificate_number")}
                    className="bg-slate-50 border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 p-2 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-sky-700">
                      Cert. Number
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{"{{certificate_number}}"}</div>
                  </button>
                  <button
                    onClick={() => addElement("variable", "start_date")}
                    className="bg-slate-50 border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 p-2 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-sky-700">
                      Start Date
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{"{{start_date}}"}</div>
                  </button>
                  <button
                    onClick={() => addElement("variable", "end_date")}
                    className="bg-slate-50 border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 p-2 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-sky-700">
                      End Date
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{"{{end_date}}"}</div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Typography Blocks
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() =>
                      addElement("text", undefined, undefined, "CERTIFICATE OF COMPLETION")
                    }
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800">Heading Title</span>
                    <span className="text-[10px] text-slate-500 font-mono">Formal Display</span>
                  </button>
                  <button
                    onClick={() =>
                      addElement("text", undefined, undefined, "THIS IS TO CERTIFY THAT")
                    }
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-slate-800">Subtitle Ribbon</span>
                    <span className="text-[10px] text-slate-500 font-mono">Spaced</span>
                  </button>
                  <button
                    onClick={() =>
                      addElement(
                        "text",
                        undefined,
                        undefined,
                        "Has successfully accomplished all academic requirements and training obligations."
                      )
                    }
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <span className="text-xs text-slate-700">Paragraph Body</span>
                    <span className="text-[10px] text-slate-500 font-mono">Multi-line</span>
                  </button>
                  <button
                    onClick={() => addElement("qr")}
                    className="w-full bg-sky-50 hover:bg-sky-100 border border-sky-200 p-2 rounded-xl text-left transition-colors flex items-center justify-between text-sky-800"
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <QrCode size={14} className="text-sky-600" />
                      Verification QR Code
                    </span>
                    <span className="text-[10px] font-mono">Dynamic QR</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Lines, Dividers & Rules */}
          {activeSidebarTab === "lines" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Ornamental Dividers & Lines
              </h3>
              <button
                onClick={() => addElement("line", undefined, undefined, undefined, "gold-divider")}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-amber-800">Gold Diamond Divider</div>
                <div className="h-4 flex items-center justify-center my-1.5">
                  <div className="w-16 h-0.5 bg-amber-500" />
                  <div className="w-2.5 h-2.5 bg-amber-500 rotate-45 mx-1" />
                  <div className="w-16 h-0.5 bg-amber-500" />
                </div>
                <div className="text-[10px] text-slate-500">Classic certificate divider rule</div>
              </button>
              <button
                onClick={() => addElement("line", undefined, undefined, undefined, "double-line")}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-800">Double Formal Line</div>
                <div className="my-2 space-y-1">
                  <div className="w-full h-0.5 bg-slate-700" />
                  <div className="w-full h-0.5 bg-slate-700" />
                </div>
                <div className="text-[10px] text-slate-500">Traditional diploma separator</div>
              </button>
              <button
                onClick={() => addElement("line", undefined, undefined, undefined, "line")}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-800">Solid Thin Rule</div>
                <div className="w-full h-0.5 bg-sky-700 my-2" />
                <div className="text-[10px] text-slate-500">Clean signature or name underline</div>
              </button>
              <button
                onClick={() => addElement("line", undefined, undefined, undefined, "dashed-line")}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-800">Dashed Line</div>
                <div className="w-full border-b-2 border-dashed border-slate-400 my-2" />
                <div className="text-[10px] text-slate-500">Modern technical divider</div>
              </button>
            </div>
          )}

          {/* TAB 3: Badges, Seals & Shapes */}
          {activeSidebarTab === "shapes" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Seals, Medals & Frames
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addElement("shape", undefined, undefined, undefined, "seal")}
                  className="bg-amber-50/70 border border-amber-200 hover:bg-amber-100 p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <Award size={24} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">Gold Seal</span>
                  <span className="text-[9px] text-amber-700">Official Crest</span>
                </button>
                <button
                  onClick={() => addElement("shape", undefined, undefined, undefined, "medal")}
                  className="bg-sky-50 border border-sky-200 hover:bg-sky-100 p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <ShieldCheck size={24} className="text-sky-600" />
                  <span className="text-xs font-bold text-sky-900">Verified Crest</span>
                  <span className="text-[9px] text-sky-700">Security Badge</span>
                </button>
                <button
                  onClick={() => addElement("shape", undefined, undefined, undefined, "rectangle")}
                  className="bg-slate-50 border border-slate-200 hover:bg-slate-100 p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <Square size={22} className="text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">Border Box</span>
                  <span className="text-[9px] text-slate-500">Outer Frame</span>
                </button>
                <button
                  onClick={() => addElement("shape", undefined, undefined, undefined, "rounded")}
                  className="bg-slate-50 border border-slate-200 hover:bg-slate-100 p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <div className="w-8 h-4 rounded-full border-2 border-sky-600 bg-sky-100" />
                  <span className="text-xs font-bold text-slate-800">Pill Badge</span>
                  <span className="text-[9px] text-slate-500">ID Container</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Signatures & Assets */}
          {activeSidebarTab === "assets" && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Signatures & Official Stamps
              </h3>
              {assets.length === 0 ? (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-500">No signature PNGs uploaded yet.</p>
                  <a
                    href="/dashboard/assets"
                    className="text-xs font-bold text-sky-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Upload in Asset Library</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {assets.map((asset) => (
                    <button
                      key={asset._id}
                      onClick={() => addElement("signature", undefined, asset.url)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-sky-400 p-2.5 rounded-xl text-left transition-all flex items-center gap-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.url} alt={asset.name} className="w-8 h-8 object-contain bg-white rounded border border-slate-200 p-0.5" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{asset.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{asset.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Layers Tree */}
          {activeSidebarTab === "layers" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span>Active Layers ({elements.length})</span>
                <span className="text-[10px] font-normal lowercase">z-index order</span>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {[...elements].reverse().map((el, revIdx) => {
                  const actualIdx = elements.length - 1 - revIdx;
                  const isSelected = el.id === selectedElementId;
                  let label = `Layer ${actualIdx + 1}: ${el.type}`;
                  if (el.variableKey) label = `Variable: {{${el.variableKey}}}`;
                  else if (el.content) label = el.content.slice(0, 20) + "...";

                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-xs"
                          : "bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate pr-2">{label}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSelectedElement({ locked: !el.locked });
                          }}
                          className="opacity-70 hover:opacity-100"
                        >
                          {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSelectedElement({ hidden: !el.hidden });
                          }}
                          className="opacity-70 hover:opacity-100"
                        >
                          {el.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center Canvas Viewport - 6 Columns */}
        <div className="lg:col-span-6 bg-slate-100/90 border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[660px] overflow-hidden shadow-inner relative">
          {!activeTemplate && !previewUrl ? (
            <div className="text-center text-slate-500 space-y-3 p-8">
              <FolderKanban size={48} className="mx-auto text-slate-400" />
              <p className="text-sm font-medium text-slate-700">No certificate template loaded</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
              >
                <Upload size={14} /> Upload Background File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Canvas Viewport Scroll Area */}
              <div className="w-full flex items-center justify-center overflow-auto p-2">
                <div
                  className="relative bg-slate-200/70 border border-slate-300 rounded-xl p-3 shadow-xl transition-all"
                  style={{
                    minWidth: `${canvasWidth + 24}px`,
                    minHeight: `${canvasHeight + 24}px`,
                  }}
                >
                  <div
                    ref={canvasRef}
                    className="relative bg-white shadow-2xl overflow-hidden rounded border border-slate-300 select-none"
                    style={{
                      width: `${canvasWidth}px`,
                      height: `${canvasHeight}px`,
                      backgroundImage: currentBgUrl ? `url("${currentBgUrl}")` : undefined,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                    onPointerMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const currentMouseX = (e.clientX - rect.left) * invScale;
                      const currentMouseY = (e.clientY - rect.top) * invScale;

                      // Smart Snapping to Center X & Y
                      const canvasMidX = tmplWidth / 2;
                      const canvasMidY = tmplHeight / 2;

                      if (isDragging && selectedElementId) {
                        const activeEl = elements.find((el) => el.id === selectedElementId);
                        if (!activeEl || activeEl.locked) return;

                        let newX = Math.round(currentMouseX - dragOffset.x);
                        let newY = Math.round(currentMouseY - dragOffset.y);

                        // Snap to center X
                        const elMidX = newX + activeEl.position.width / 2;
                        if (snapToCenter && Math.abs(elMidX - canvasMidX) < 6) {
                          newX = Math.round(canvasMidX - activeEl.position.width / 2);
                          setActiveGuideX(canvasMidX * scale);
                        } else {
                          setActiveGuideX(null);
                        }

                        // Snap to center Y
                        const elMidY = newY + activeEl.position.height / 2;
                        if (snapToCenter && Math.abs(elMidY - canvasMidY) < 6) {
                          newY = Math.round(canvasMidY - activeEl.position.height / 2);
                          setActiveGuideY(canvasMidY * scale);
                        } else {
                          setActiveGuideY(null);
                        }

                        const clampedX = Math.max(0, Math.min(tmplWidth - activeEl.position.width, newX));
                        const clampedY = Math.max(0, Math.min(tmplHeight - activeEl.position.height, newY));

                        updateSelectedElement({
                          position: {
                            ...activeEl.position,
                            x: clampedX,
                            y: clampedY,
                          },
                        });
                      } else if (isResizing && selectedElementId && resizeHandle) {
                        const activeEl = elements.find((el) => el.id === selectedElementId);
                        if (!activeEl || activeEl.locked) return;

                        const dx = (e.clientX - resizeInitBox.mouseX) * invScale;
                        const dy = (e.clientY - resizeInitBox.mouseY) * invScale;

                        let newX = resizeInitBox.x;
                        let newY = resizeInitBox.y;
                        let newW = resizeInitBox.width;
                        let newH = resizeInitBox.height;

                        if (resizeHandle.includes("e")) newW = Math.max(20, resizeInitBox.width + dx);
                        if (resizeHandle.includes("s")) newH = Math.max(10, resizeInitBox.height + dy);
                        if (resizeHandle.includes("w")) {
                          const potentialW = resizeInitBox.width - dx;
                          if (potentialW >= 20) {
                            newW = potentialW;
                            newX = resizeInitBox.x + dx;
                          }
                        }
                        if (resizeHandle.includes("n")) {
                          const potentialH = resizeInitBox.height - dy;
                          if (potentialH >= 10) {
                            newH = potentialH;
                            newY = resizeInitBox.y + dy;
                          }
                        }

                        updateSelectedElement({
                          position: {
                            x: Math.max(0, Math.round(newX)),
                            y: Math.max(0, Math.round(newY)),
                            width: Math.round(newW),
                            height: Math.round(newH),
                          },
                        });
                      }
                    }}
                    onPointerUp={() => {
                      if (isDragging || isResizing) {
                        pushHistory(elements);
                      }
                      setIsDragging(false);
                      setIsResizing(false);
                      setResizeHandle(null);
                      setActiveGuideX(null);
                      setActiveGuideY(null);
                    }}
                  >
                    {/* Center Alignment Guides */}
                    {activeGuideX !== null && (
                      <div
                        className="absolute top-0 bottom-0 border-l border-dashed border-sky-500 pointer-events-none z-30"
                        style={{ left: `${activeGuideX}px` }}
                      />
                    )}
                    {activeGuideY !== null && (
                      <div
                        className="absolute left-0 right-0 border-t border-dashed border-sky-500 pointer-events-none z-30"
                        style={{ top: `${activeGuideY}px` }}
                      />
                    )}

                    {/* Canvas Elements */}
                    {elements.map((el) => {
                      if (el.hidden && previewMode) return null;

                      const isSelected = el.id === selectedElementId;
                      const elLeft = el.position.x * scale;
                      const elTop = el.position.y * scale;
                      const elWidth = el.position.width * scale;
                      const elHeight = el.position.height * scale;
                      const elFontSize = (el.style?.fontSize || 14) * scale;

                      const isTimes = (el.style?.fontFamily || "Helvetica")
                        .toLowerCase()
                        .includes("times");
                      const elFontFamily = isTimes
                        ? '"Times New Roman", Times, Georgia, serif'
                        : el.style?.fontFamily || "Helvetica, sans-serif";

                      return (
                        <div
                          key={el.id}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setSelectedElementId(el.id);
                            if (!previewMode && !el.locked) {
                              setIsDragging(true);
                              const rect = canvasRef.current?.getBoundingClientRect();
                              if (rect) {
                                const mouseX = (e.clientX - rect.left) * invScale;
                                const mouseY = (e.clientY - rect.top) * invScale;
                                setDragOffset({
                                  x: mouseX - el.position.x,
                                  y: mouseY - el.position.y,
                                });
                              }
                            }
                          }}
                          className={`absolute select-none flex items-center justify-center transition-shadow ${
                            previewMode
                              ? "cursor-default"
                              : isSelected
                              ? "ring-2 ring-sky-500 bg-sky-500/10 shadow-lg z-20 cursor-grab active:cursor-grabbing"
                              : "border border-dashed border-slate-400/70 hover:border-sky-500 bg-white/30 rounded hover:bg-sky-50/20 z-10 cursor-grab"
                          }`}
                          style={{
                            left: `${elLeft}px`,
                            top: `${elTop}px`,
                            width: `${elWidth}px`,
                            height: `${elHeight}px`,
                            color: el.style?.color || "#0f172a",
                            fontSize: `${elFontSize}px`,
                            fontFamily: elFontFamily,
                            fontWeight: el.style?.fontWeight || 400,
                            fontStyle: el.style?.fontStyle || "normal",
                            textDecoration: el.style?.textDecoration || "none",
                            textAlign: el.style?.textAlign || "center",
                            opacity: el.style?.opacity ?? 1,
                            borderRadius: el.style?.borderRadius ? `${el.style.borderRadius * scale}px` : undefined,
                            backgroundColor: el.style?.backgroundColor,
                            borderWidth: el.style?.borderWidth ? `${el.style.borderWidth * scale}px` : undefined,
                            borderColor: el.style?.borderColor,
                            borderStyle: el.style?.borderStyle || (el.style?.borderWidth ? "solid" : undefined),
                            letterSpacing: el.style?.letterSpacing ? `${el.style.letterSpacing * scale}px` : undefined,
                            padding: "2px 4px",
                          }}
                        >
                          {/* VARIABLE TYPE */}
                          {el.type === "variable" && (
                            previewMode ? (
                              <span className="font-bold tracking-tight text-center leading-tight">
                                {el.variableKey === "student_name"
                                  ? formatStudentNameWithSalutation(currentStudent.student_name)
                                  : currentStudent[el.variableKey as keyof typeof currentStudent] ||
                                    `{{${el.variableKey}}}`}
                              </span>
                            ) : (
                              <span className="font-bold text-sky-900 bg-sky-50 border border-sky-200 px-1 py-0.5 rounded shadow-2xs text-center leading-tight font-sans">
                                {"{{" + (el.variableKey || "variable") + "}}"}
                              </span>
                            )
                          )}

                          {/* TEXT TYPE */}
                          {el.type === "text" && (
                            <div className="w-full h-full overflow-hidden leading-snug line-clamp-3 text-center">
                              {previewMode
                                ? (el.content || "").replace(
                                    /\{\{\s*(\w+)\s*\}\}/g,
                                    (_, key) =>
                                      currentStudent[key as keyof typeof currentStudent] || `{{${key}}}`
                                  )
                                : el.content || "Sample Text"}
                            </div>
                          )}

                          {/* LINE TYPE */}
                          {el.type === "line" && (
                            <div className="w-full h-full flex items-center justify-center pointer-events-none">
                              {el.style?.shapeType === "gold-divider" ? (
                                <div className="w-full flex items-center justify-center">
                                  <div
                                    className="flex-1 h-0.5"
                                    style={{ backgroundColor: el.style?.color || "#c59b27" }}
                                  />
                                  <div
                                    className="w-2.5 h-2.5 rotate-45 mx-1"
                                    style={{ backgroundColor: el.style?.color || "#c59b27" }}
                                  />
                                  <div
                                    className="flex-1 h-0.5"
                                    style={{ backgroundColor: el.style?.color || "#c59b27" }}
                                  />
                                </div>
                              ) : el.style?.shapeType === "double-line" ? (
                                <div className="w-full space-y-1">
                                  <div
                                    className="w-full h-0.5"
                                    style={{ backgroundColor: el.style?.color || "#475569" }}
                                  />
                                  <div
                                    className="w-full h-0.5"
                                    style={{ backgroundColor: el.style?.color || "#475569" }}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="w-full"
                                  style={{
                                    borderBottomWidth: `${Math.max(1, (el.style?.borderWidth || 2) * scale)}px`,
                                    borderBottomColor: el.style?.color || "#c59b27",
                                    borderBottomStyle:
                                      el.style?.shapeType === "dashed-line"
                                        ? "dashed"
                                        : el.style?.shapeType === "dotted-line"
                                        ? "dotted"
                                        : "solid",
                                  }}
                                />
                              )}
                            </div>
                          )}

                          {/* SHAPE & BADGE TYPE */}
                          {(el.type === "shape" || el.type === "badge") && (
                            <div className="w-full h-full flex items-center justify-center pointer-events-none">
                              {el.style?.shapeType === "seal" ? (
                                <div className="flex flex-col items-center justify-center text-amber-600">
                                  <Award size={Math.min(elWidth * 0.7, elHeight * 0.7)} />
                                </div>
                              ) : el.style?.shapeType === "medal" ? (
                                <div className="flex flex-col items-center justify-center text-sky-600">
                                  <ShieldCheck size={Math.min(elWidth * 0.7, elHeight * 0.7)} />
                                </div>
                              ) : null}
                            </div>
                          )}

                          {/* QR CODE TYPE */}
                          {el.type === "qr" && (
                            <div className="w-full h-full bg-white/95 border border-slate-300 flex flex-col items-center justify-center p-1 shadow-2xs rounded">
                              <QrCode size={Math.min(elWidth * 0.7, elHeight * 0.7)} className="text-slate-900" />
                              <span className="text-[8px] font-mono text-slate-600 leading-tight">QR Code</span>
                            </div>
                          )}

                          {/* SIGNATURE / IMAGE TYPE */}
                          {(el.type === "signature" || el.type === "stamp" || el.type === "image") && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={el.cloudinaryUrl}
                              alt="signature"
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          )}

                          {/* 8 INTERACTIVE RESIZE HANDLES (Canva Style) */}
                          {isSelected && !previewMode && !el.locked && (
                            <>
                              {/* Corner Handles */}
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                  setResizeHandle("nw");
                                  setResizeInitBox({
                                    x: el.position.x,
                                    y: el.position.y,
                                    width: el.position.width,
                                    height: el.position.height,
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                  });
                                }}
                                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-sky-600 rounded-full cursor-nwse-resize z-30 shadow-xs"
                              />
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                  setResizeHandle("ne");
                                  setResizeInitBox({
                                    x: el.position.x,
                                    y: el.position.y,
                                    width: el.position.width,
                                    height: el.position.height,
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                  });
                                }}
                                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-sky-600 rounded-full cursor-nesw-resize z-30 shadow-xs"
                              />
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                  setResizeHandle("se");
                                  setResizeInitBox({
                                    x: el.position.x,
                                    y: el.position.y,
                                    width: el.position.width,
                                    height: el.position.height,
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                  });
                                }}
                                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-sky-600 rounded-full cursor-nwse-resize z-30 shadow-xs"
                              />
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                  setResizeHandle("sw");
                                  setResizeInitBox({
                                    x: el.position.x,
                                    y: el.position.y,
                                    width: el.position.width,
                                    height: el.position.height,
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                  });
                                }}
                                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-sky-600 rounded-full cursor-nesw-resize z-30 shadow-xs"
                              />

                              {/* Edge Squeeze Handles */}
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                  setResizeHandle("n");
                                  setResizeInitBox({
                                    x: el.position.x,
                                    y: el.position.y,
                                    width: el.position.width,
                                    height: el.position.height,
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                  });
                                }}
                                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-sky-600 rounded-full cursor-ns-resize z-30 shadow-xs"
                              />
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                  setResizeHandle("s");
                                  setResizeInitBox({
                                    x: el.position.x,
                                    y: el.position.y,
                                    width: el.position.width,
                                    height: el.position.height,
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                  });
                                }}
                                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-sky-600 rounded-full cursor-ns-resize z-30 shadow-xs"
                              />
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                  setResizeHandle("w");
                                  setResizeInitBox({
                                    x: el.position.x,
                                    y: el.position.y,
                                    width: el.position.width,
                                    height: el.position.height,
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                  });
                                }}
                                className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-4 bg-sky-600 rounded-full cursor-ew-resize z-30 shadow-xs"
                              />
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  setIsResizing(true);
                                  setResizeHandle("e");
                                  setResizeInitBox({
                                    x: el.position.x,
                                    y: el.position.y,
                                    width: el.position.width,
                                    height: el.position.height,
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                  });
                                }}
                                className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-4 bg-sky-600 rounded-full cursor-ew-resize z-30 shadow-xs"
                              />

                              {/* Dimension Tooltip Pill */}
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-mono px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-40">
                                W: {Math.round(el.position.width)} × H: {Math.round(el.position.height)} pt
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Canvas Viewport Toolbar (Zoom & Guides) */}
              <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-xs text-xs">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                    title="Zoom Out"
                    className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-800 w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((prev) => Math.min(2.0, prev + 0.1))}
                    title="Zoom In"
                    className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    onClick={() => setZoom(1.0)}
                    title="Reset Zoom to 100%"
                    className="text-[10px] font-medium text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded border border-slate-200"
                  >
                    100%
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200" />

                {/* Snapping Toggle */}
                <button
                  onClick={() => setSnapToCenter(!snapToCenter)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                    snapToCenter
                      ? "bg-sky-50 text-sky-700 border border-sky-200"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  title="Toggle Snap to Center Horizontal & Vertical Guides"
                >
                  Snap Guides: {snapToCenter ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Properties Panel (Numerical Precision Control) - 3 Columns */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Element Properties
            </h2>
            {selectedEl && (
              <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-mono uppercase font-bold">
                {selectedEl.type}
              </span>
            )}
          </div>

          {!selectedEl ? (
            <div className="text-center text-slate-400 py-16 space-y-2">
              <Sliders size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No element selected</p>
              <p className="text-[11px] text-slate-400">
                Click any field, line or badge on the canvas to customize position, typography, borders and auto-fit rules.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Position & Size (pt) */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Position & Size (pt)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">X Position</span>
                    <input
                      type="number"
                      value={Math.round(selectedEl.position.x)}
                      disabled={selectedEl.locked}
                      onChange={(e) =>
                        updateSelectedElement({
                          position: { ...selectedEl.position, x: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1 text-xs focus:bg-white focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Y Position</span>
                    <input
                      type="number"
                      value={Math.round(selectedEl.position.y)}
                      disabled={selectedEl.locked}
                      onChange={(e) =>
                        updateSelectedElement({
                          position: { ...selectedEl.position, y: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1 text-xs focus:bg-white focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Width</span>
                    <input
                      type="number"
                      value={Math.round(selectedEl.position.width)}
                      disabled={selectedEl.locked}
                      onChange={(e) =>
                        updateSelectedElement({
                          position: { ...selectedEl.position, width: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-sky-700 font-bold rounded-lg px-2 py-1 text-xs focus:bg-white focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Height</span>
                    <input
                      type="number"
                      value={Math.round(selectedEl.position.height)}
                      disabled={selectedEl.locked}
                      onChange={(e) =>
                        updateSelectedElement({
                          position: { ...selectedEl.position, height: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-sky-700 font-bold rounded-lg px-2 py-1 text-xs focus:bg-white focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Variable Config */}
              {selectedEl.type === "variable" && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <label className="block text-slate-700 font-bold">Dynamic Variable Key</label>
                  <input
                    type="text"
                    value={selectedEl.variableKey || ""}
                    onChange={(e) => updateSelectedElement({ variableKey: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1 text-xs font-mono focus:bg-white focus:border-sky-500"
                  />
                </div>
              )}

              {/* Text Content */}
              {selectedEl.type === "text" && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <label className="block text-slate-700 font-bold">Text Content</label>
                  <textarea
                    rows={3}
                    value={selectedEl.content || ""}
                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 text-xs font-mono focus:bg-white focus:border-sky-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Typography */}
              {(selectedEl.type === "text" || selectedEl.type === "variable") && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="block text-slate-700 font-bold">Typography & Spacing</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Font Size</span>
                      <input
                        type="number"
                        value={selectedEl.style?.fontSize || 14}
                        onChange={(e) =>
                          updateSelectedElement({
                            style: { ...selectedEl.style!, fontSize: Number(e.target.value) },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Line Spacing</span>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedEl.style?.lineHeight || 1.3}
                        onChange={(e) =>
                          updateSelectedElement({
                            style: { ...selectedEl.style!, lineHeight: Number(e.target.value) },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SmartFit & Overflow Protection */}
              {(selectedEl.type === "text" || selectedEl.type === "variable") && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Text Overflow Protection</label>
                    <input
                      type="checkbox"
                      checked={selectedEl.smartFit?.enabled ?? true}
                      onChange={(e) =>
                        updateSelectedElement({
                          smartFit: {
                            enabled: e.target.checked,
                            maxLines: selectedEl.smartFit?.maxLines || 2,
                            minFontSize: selectedEl.smartFit?.minFontSize || 10,
                            wordWrap: selectedEl.smartFit?.wordWrap ?? true,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Min Font Size</span>
                      <input
                        type="number"
                        value={selectedEl.smartFit?.minFontSize || 10}
                        onChange={(e) =>
                          updateSelectedElement({
                            smartFit: {
                              ...selectedEl.smartFit!,
                              minFontSize: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Max Lines</span>
                      <input
                        type="number"
                        value={selectedEl.smartFit?.maxLines || 2}
                        onChange={(e) =>
                          updateSelectedElement({
                            smartFit: {
                              ...selectedEl.smartFit!,
                              maxLines: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={duplicateSelectedElement}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Copy size={13} />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedElement}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-200"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload size={18} className="text-sky-600" />
                Upload New Certificate Template
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium"
              >
                ✕ Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Upload a blank certificate background in <strong>PDF</strong> or <strong>Image (PNG/JPG)</strong> format.
            </p>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <form onSubmit={handleCreateNewTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Template Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Softmusk Internship Certificate 2026"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Background Base File (PDF or PNG/JPG)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-3 py-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-sky-600 file:text-white file:text-xs hover:file:bg-sky-500 cursor-pointer"
                />
                {renderingPdf && (
                  <p className="text-[11px] text-sky-600 mt-1.5 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" /> Rendering high-resolution PDF preview...
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || renderingPdf}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm shadow-sky-600/20"
                >
                  {saving ? "Creating..." : "Create & Open Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
