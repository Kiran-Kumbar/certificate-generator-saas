"use client";

import { useEffect, useState, use } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  Download,
  Calendar,
  User,
  Building2,
  Hash,
  Cpu,
  AlertTriangle,
  BadgeCheck,
  Scan,
} from "lucide-react";
import OfficialStamp from "@/components/OfficialStamp";

interface VerificationData {
  verified: boolean;
  status?: string;
  certificateNumber?: string;
  studentName?: string;
  issuedAt?: string;
  pdfUrl?: string;
  pngUrl?: string;
  recipientData?: Record<string, unknown>;
  institution?: {
    name: string;
    code: string;
  };
  message?: string;
}

function FieldRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={13} className="text-sky-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-900 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function VerificationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/verification/${code}`);
        const result = await res.json();
        setData(result);
      } catch (e) {
        console.error(e);
        setData({ verified: false, message: "Network error — could not connect to verification server." });
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [code]);

  const handleDownloadPdf = async () => {
    if (!data?.pdfUrl) return;
    setPdfLoading(true);
    try {
      // If it's already a Cloudinary or absolute URL, open directly
      if (data.pdfUrl.startsWith("http")) {
        window.open(data.pdfUrl, "_blank");
      } else {
        window.open(data.pdfUrl, "_blank");
      }
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-sky-200 animate-ping opacity-30" />
            <div className="absolute inset-0 rounded-full border-2 border-t-sky-600 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-sky-100 flex items-center justify-center">
              <Scan size={16} className="text-sky-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Verifying Certificate Authenticity</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Querying cryptographic registry...</p>
          </div>
        </div>
      </div>
    );
  }

  const isRevoked = data?.status === "revoked";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-indigo-50/30 flex flex-col">
      {/* Top brand bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Softmusk" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Softmusk CertSaaS</p>
              <p className="text-[10px] text-slate-400 leading-tight">Certificate Verification Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
            <ShieldCheck size={13} className="text-sky-600" />
            <span className="hidden sm:inline">Cryptographic Authenticity Registry</span>
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center py-8 px-4 pb-12">
        <div className="w-full max-w-2xl space-y-4">

          {/* ─── INVALID / NOT FOUND ─── */}
          {!data || !data.verified ? (
            <div className="bg-white border border-red-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 text-center border-b border-red-100">
                <XCircle size={48} className="text-red-500 mx-auto mb-3" />
                <h1 className="text-lg font-bold text-red-700 mb-1">Certificate Not Verified</h1>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  The verification token provided does not match any authentic credential in our registry.
                  This certificate may be invalid, expired, or the QR code may be damaged.
                </p>
              </div>
              <div className="p-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">What to do?</p>
                    <p className="text-xs text-amber-700 mt-0.5">Contact the issuing institution directly and request them to share the official verification link from the Softmusk CertSaaS platform.</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-4 font-mono">Token: {code.substring(0, 16)}...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ─── REVOKED BANNER ─── */}
              {isRevoked && (
                <div className="bg-red-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-red-500/20">
                  <XCircle size={24} className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Certificate Revoked</p>
                    <p className="text-xs text-red-100">This certificate has been officially revoked by the issuing institution. It is no longer valid.</p>
                  </div>
                </div>
              )}

              {/* ─── VERIFIED BANNER ─── */}
              {!isRevoked && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-xl shadow-emerald-500/20">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <BadgeCheck size={26} className="text-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-base">Authenticated Certificate</p>
                        <p className="text-emerald-100 text-xs mt-0.5">
                          Issued &amp; cryptographically signed by{" "}
                          <strong className="text-white">{data.institution?.name || "Softmusk Info Pvt. Ltd."}</strong>
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/30">
                            {data.status || "ISSUED"}
                          </span>
                          <span className="text-[10px] text-emerald-200">✓ SHA-256 Token Valid</span>
                        </div>
                      </div>
                    </div>
                    {/* Softmusk Official Stamp */}
                    <div className="shrink-0 hidden sm:block">
                      <OfficialStamp
                        companyName={data.institution?.name || "SOFTMUSK INFO PVT. LTD."}
                        city="BELAGAVI, KARNATAKA"
                        color="#ffffff"
                        size={90}
                        rotation={-6}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── CERTIFICATE DETAILS ─── */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-900 text-sm">Credential Record</h2>
                </div>
                <div className="px-5 py-2">
                  <FieldRow label="Certificate Number" value={data.certificateNumber || "—"} icon={Hash} />
                  <FieldRow label="Student / Recipient" value={data.studentName || "—"} icon={User} />

                  {Boolean(data.recipientData?.reg_no) && (
                    <FieldRow label="Registration Number" value={String(data.recipientData?.reg_no)} icon={Hash} />
                  )}
                  {Boolean(data.recipientData?.college_name) && (
                    <FieldRow label="College / Institution" value={String(data.recipientData?.college_name)} icon={Building2} />
                  )}
                  {Boolean(data.recipientData?.dept) && (
                    <FieldRow label="Academic Department" value={String(data.recipientData?.dept)} icon={Building2} />
                  )}
                  {Boolean(data.recipientData?.domain) && (
                    <FieldRow label="Project / Domain" value={String(data.recipientData?.domain)} icon={Cpu} />
                  )}
                  {Boolean(data.recipientData?.start_date && data.recipientData?.end_date) && (
                    <FieldRow
                      label="Internship Period"
                      value={`${String(data.recipientData?.start_date)}  →  ${String(data.recipientData?.end_date)}`}
                      icon={Calendar}
                    />
                  )}
                  <FieldRow
                    label="Issuance Date"
                    value={data.issuedAt ? new Date(data.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                    icon={Calendar}
                  />
                  <FieldRow label="Issuing Institution" value={data.institution?.name || "Softmusk Info Pvt. Ltd."} icon={Building2} />
                </div>
              </div>

              {/* ─── DOWNLOAD ACTIONS ─── */}
              {(data.pdfUrl || data.pngUrl) && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Download size={16} className="text-sky-600" />
                    <h2 className="font-bold text-slate-900 text-sm">Official Documents</h2>
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row gap-3">
                    {data.pdfUrl && (
                      <button
                        onClick={handleDownloadPdf}
                        disabled={pdfLoading}
                        className="flex-1 group bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-5 rounded-xl text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-60"
                      >
                        <FileText size={16} />
                        <span>Download Official PDF</span>
                        <ExternalLink size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                    {data.pngUrl && (
                      <a
                        href={data.pngUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 group bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 font-semibold py-3.5 px-5 rounded-xl text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95"
                      >
                        <Download size={16} className="text-slate-500" />
                        <span>Open Certificate Image</span>
                        <ExternalLink size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center pb-4 px-5">
                    Both PDF and PNG are stored securely on Cloudinary CDN and are always accessible via this link.
                  </p>
                </div>
              )}

              {/* ─── SECURITY FOOTER ─── */}
              <div className="bg-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="sm:hidden flex items-center justify-center">
                  <OfficialStamp
                    companyName={data.institution?.name || "SOFTMUSK INFO PVT. LTD."}
                    city="BELAGAVI, KARNATAKA"
                    color="#60a5fa"
                    size={80}
                    rotation={-4}
                  />
                </div>
                <ShieldCheck size={22} className="text-sky-400 shrink-0 hidden sm:block mt-0.5" />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-bold text-white mb-1">Cryptographically Secured Record</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This certificate&#39;s authenticity is guaranteed by a SHA-256 cryptographic hash anchored at issuance time. Any tampering with the certificate content will invalidate this verification. Powered by <strong className="text-sky-400">Softmusk CertSaaS</strong>.
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono mt-2">Token: {code.substring(0, 12)}...{code.substring(code.length - 6)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center">
        <p className="text-[11px] text-slate-400">
          Softmusk Info Pvt. Ltd. · Belagavi, Karnataka ·{" "}
          <a href="/" className="text-sky-600 hover:underline">softmusk.com</a>
        </p>
      </footer>
    </div>
  );
}
