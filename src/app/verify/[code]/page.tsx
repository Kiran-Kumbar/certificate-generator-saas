"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, ShieldCheck, AlertTriangle } from "lucide-react";
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

export default function VerificationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/verification/${code}`);
        const result = await res.json();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col justify-center items-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mb-4" />
        <p className="text-xs text-slate-500 font-mono">Verifying Certificate Authenticity Token...</p>
      </div>
    );
  }

  const isRevoked = data?.status === "revoked";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 py-10">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-2 mb-3.5 shadow-xs">
            <Image
              src="/image.png"
              alt="Softmusk Logo"
              width={46}
              height={46}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Certificate Verification Portal</h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-sky-600" />
            <span>Multi-Tenant Cryptographic Authenticity Registry</span>
          </p>
        </div>

        {!data || !data.verified ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
            <XCircle className="text-red-500 mx-auto" size={40} />
            <h2 className="text-lg font-bold text-red-700">Certificate Not Found or Invalid</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The verification token provided does not match any authentic credential record. The certificate may be invalid, expired, or the QR code may have been altered.
            </p>
            <p className="text-[10px] text-slate-400 font-mono pt-2">Token: {code.substring(0, 16)}...</p>
          </div>
        ) : isRevoked ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-300 rounded-xl p-5 text-center space-y-2">
              <AlertTriangle className="text-red-600 mx-auto" size={36} />
              <h2 className="text-base font-bold text-red-800 uppercase tracking-wide">Certificate Revoked</h2>
              <p className="text-xs text-red-600 leading-relaxed">
                This certificate has been officially revoked by the issuing institution ({data.institution?.name || "Softmusk Info Pvt. Ltd."}) and is no longer valid.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Certificate No</span>
                <span className="font-mono font-bold text-slate-700">{data.certificateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name</span>
                <span className="font-semibold text-slate-800">{data.studentName}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Official Security Stamp & Authenticity Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-600 shrink-0" size={28} />
                <div>
                  <h3 className="font-bold text-emerald-800 text-sm tracking-wide flex items-center gap-2">
                    AUTHENTICATED CREDENTIAL
                    <span className="bg-emerald-100 text-emerald-800 font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                      {data.status || "ISSUED"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issued &amp; Cryptographically Signed by <strong>{data.institution?.name || "Softmusk Info Pvt. Ltd."}</strong>
                  </p>
                </div>
              </div>
              <div className="shrink-0 scale-90 sm:scale-100">
                <OfficialStamp
                  companyName={data.institution?.name || "SOFTMUSK INFO PVT. LTD."}
                  city="BELAGAVI, KARNATAKA"
                  color="#059669"
                  size={95}
                />
              </div>
            </div>

            {/* Credential Data Record */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Certificate No</span>
                <span className="font-mono font-bold text-sky-600 text-sm">{data.certificateNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Student Name</span>
                <span className="font-bold text-slate-900 text-sm">{data.studentName}</span>
              </div>

              {Boolean(data.recipientData?.reg_no) && (
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500">Registration Number</span>
                  <span className="font-mono font-semibold text-slate-800">{String(data.recipientData?.reg_no)}</span>
                </div>
              )}

              {Boolean(data.recipientData?.college_name) && (
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500">College / Institution</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[60%]">{String(data.recipientData?.college_name)}</span>
                </div>
              )}

              {Boolean(data.recipientData?.dept) && (
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500">Academic Department</span>
                  <span className="font-medium text-slate-700">{String(data.recipientData?.dept)}</span>
                </div>
              )}

              {Boolean(data.recipientData?.domain) && (
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500">Project / Domain</span>
                  <span className="font-bold text-sky-700">{String(data.recipientData?.domain)}</span>
                </div>
              )}

              {Boolean(data.recipientData?.start_date && data.recipientData?.end_date) && (
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500">Internship Period</span>
                  <span className="font-medium text-slate-700">
                    {String(data.recipientData?.start_date)} to {String(data.recipientData?.end_date)}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Issuance Date</span>
                <span className="text-slate-700 font-medium">
                  {data.issuedAt ? new Date(data.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Issuing Institution</span>
                <span className="text-slate-800 font-semibold">{data.institution?.name || "Softmusk Info Pvt. Ltd."}</span>
              </div>
            </div>

            {/* Cryptographic Verification Footer */}
            <div className="pt-1 text-center space-y-1">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>SHA-256 Cryptographically Verified Credential</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Token: {code.length > 20 ? `${code.substring(0, 10)}...${code.substring(code.length - 8)}` : code}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* External Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        <p>Softmusk Info Pvt. Ltd. • Belagavi, Karnataka</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          <a href="https://softmusk.com" target="_blank" rel="noreferrer" className="hover:text-sky-600 transition-colors">
            softmusk.com
          </a>
        </p>
      </footer>
    </div>
  );
}
