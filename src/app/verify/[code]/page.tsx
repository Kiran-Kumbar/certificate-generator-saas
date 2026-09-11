"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ExternalLink,
  Award,
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

export default function VerificationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = use(params);
  const code = (rawCode ? decodeURIComponent(rawCode) : "")
    .trim()
    .replace(/[\r\n\t\s]+/g, "")
    .replace(/^\/?verify\//, "");

  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!code) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/verification/${encodeURIComponent(code)}`);
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

  // Tenant distinction: Only show Softmusk specific seal & details for Softmusk tenant
  const isSoftmusk = Boolean(
    (data?.institution?.code && ["SM", "SOFTMUSK"].includes(data.institution.code.toUpperCase())) ||
    (data?.institution?.name && /softmusk/i.test(data.institution.name)) ||
    (!data?.institution && (code.toUpperCase().startsWith("SM-") || code.toUpperCase().startsWith("SMC-") || code.toUpperCase().startsWith("SM")))
  );

  const isRevoked = data?.status === "revoked";

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center items-center p-3 sm:p-6 py-6 sm:py-10 selection:bg-sky-100">
      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-7 shadow-xl space-y-5 sm:space-y-6">
        
        {/* Header - Softmusk Branding or Generic / Multi-tenant Branding */}
        {isSoftmusk ? (
          <div className="flex flex-col items-center text-center">
            {/* Dual Softmusk Circular Official Seals */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3.5">
              {/* Belgaum Seal */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-1 border-2 border-slate-200 shadow-md flex items-center justify-center group transition-transform hover:scale-105 overflow-hidden">
                <Image
                  src="/softmusk-seal-belgaum.png"
                  alt="Softmusk Official Seal"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>

              {/* Nipani Seal */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-1 border-2 border-slate-200 shadow-md flex items-center justify-center group transition-transform hover:scale-105 overflow-hidden">
                <Image
                  src="/softmusk-seal-nipani.png"
                  alt="Softmusk Official Seal"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              Softmusk Info Pvt. Ltd.
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-sky-700 mt-1">
              Official Credential Verification Portal
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2.5 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-medium">
                <ShieldCheck size={13} className="shrink-0 text-emerald-600" />
                Authorized Issuer Registry
              </span>
              <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full font-medium">
                <Award size={13} className="shrink-0 text-sky-600" />
                Cryptographically Secured
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="relative w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-2 mb-3.5 shadow-xs">
              <Image
                src="/onqeva-logo.png"
                alt="Onqeva Logo"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {data?.institution?.name ? `${data.institution.name} Verification Registry` : "Onqeva Verification Registry"}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-sky-600" />
              <span>Multi-Tenant Cryptographic Authenticity Network</span>
            </p>
          </div>
        )}

        {!data || !data.verified ? (
          <div className="bg-red-50/80 border border-red-200 rounded-xl p-5 sm:p-6 text-center space-y-3">
            <XCircle className="text-red-500 mx-auto" size={38} />
            <h2 className="text-base sm:text-lg font-bold text-red-700">Certificate Not Found or Invalid</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The verification token provided does not match any authentic credential record{isSoftmusk ? " issued by Softmusk Info Pvt. Ltd." : ""}. The certificate may be invalid, expired, or the QR code may have been altered.
            </p>
            <p className="text-[10px] text-slate-400 font-mono pt-1 break-all">
              Token: {code ? (code.length > 24 ? `${code.substring(0, 16)}...` : code) : "None provided"}
            </p>
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
          <div className="space-y-5 sm:space-y-6">
            {/* Authenticity Banner with Official Seal / Stamp */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                <CheckCircle className="text-emerald-600 shrink-0 mt-0.5 sm:mt-0" size={26} />
                <div>
                  <h3 className="font-bold text-emerald-800 text-xs sm:text-sm tracking-wide flex items-center gap-2 flex-wrap">
                    <span>AUTHENTICATED CREDENTIAL</span>
                    <span className="bg-emerald-100 text-emerald-800 font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                      {data.status || "ISSUED"}
                    </span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Cryptographically Issued by <strong>{data.institution?.name || (isSoftmusk ? "Softmusk Info Pvt. Ltd." : "Authorized Institution")}</strong>
                  </p>
                </div>
              </div>

              {/* Official Seals / Stamps */}
              <div className="shrink-0 flex items-center justify-center gap-2">
                {isSoftmusk ? (
                  <>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-emerald-600/30 bg-white p-0.5 shadow-xs flex items-center justify-center overflow-hidden">
                      <Image
                        src="/softmusk-seal-belgaum.png"
                        alt="Softmusk Official Seal"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-emerald-600/30 bg-white p-0.5 shadow-xs flex items-center justify-center overflow-hidden">
                      <Image
                        src="/softmusk-seal-nipani.png"
                        alt="Softmusk Official Seal"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                  </>
                ) : (
                  <div className="scale-90 sm:scale-100">
                    <OfficialStamp
                      companyName={data.institution?.name || "AUTHORIZED ISSUER"}
                      city="AUTHENTICATED"
                      color="#059669"
                      size={90}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Credential Data Record */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                <span className="text-slate-500 shrink-0 font-medium">Certificate No</span>
                <span className="font-mono font-bold text-sky-600 text-xs sm:text-sm">{data.certificateNumber}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                <span className="text-slate-500 shrink-0 font-medium">Candidate Name</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm text-right pl-2 break-words">{data.studentName}</span>
              </div>

              {Boolean(data.recipientData?.reg_no || data.recipientData?.["REG.NO"]) && (
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                  <span className="text-slate-500 shrink-0 font-medium">Registration No</span>
                  <span className="font-mono font-semibold text-slate-800 text-right">
                    {String(data.recipientData?.reg_no || data.recipientData?.["REG.NO"])}
                  </span>
                </div>
              )}

              {Boolean(data.recipientData?.college_name || data.recipientData?.["COLLEGE NAME"]) && (
                <div className="flex justify-between items-start border-b border-slate-200/80 pb-2.5">
                  <span className="text-slate-500 shrink-0 font-medium pt-0.5">College / Institution</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[65%] leading-snug break-words pl-2">
                    {String(data.recipientData?.college_name || data.recipientData?.["COLLEGE NAME"])}
                  </span>
                </div>
              )}

              {Boolean(data.recipientData?.dept || data.recipientData?.["DEPT"]) && (
                <div className="flex justify-between items-start border-b border-slate-200/80 pb-2.5">
                  <span className="text-slate-500 shrink-0 font-medium pt-0.5">Department</span>
                  <span className="font-medium text-slate-700 text-right max-w-[65%] leading-snug break-words pl-2">
                    {String(data.recipientData?.dept || data.recipientData?.["DEPT"])}
                  </span>
                </div>
              )}

              {Boolean(data.recipientData?.domain || data.recipientData?.["DOMAIN"]) && (
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                  <span className="text-slate-500 shrink-0 font-medium">Project / Domain</span>
                  <span className="font-bold text-sky-700 text-right pl-2">
                    {String(data.recipientData?.domain || data.recipientData?.["DOMAIN"])}
                  </span>
                </div>
              )}

              {Boolean(
                (data.recipientData?.start_date && data.recipientData?.end_date) ||
                (data.recipientData?.["START DATE"] && data.recipientData?.["END DATE"])
              ) && (
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                  <span className="text-slate-500 shrink-0 font-medium">Internship Period</span>
                  <span className="font-medium text-slate-700 text-right pl-2">
                    {String(data.recipientData?.start_date || data.recipientData?.["START DATE"])} to{" "}
                    {String(data.recipientData?.end_date || data.recipientData?.["END DATE"])}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                <span className="text-slate-500 shrink-0 font-medium">Issuance Date</span>
                <span className="text-slate-700 font-medium text-right">
                  {data.issuedAt
                    ? new Date(data.issuedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-500 shrink-0 font-medium">Issuing Institution</span>
                <span className="text-slate-800 font-semibold text-right pl-2">
                  {data.institution?.name || (isSoftmusk ? "Softmusk Info Pvt. Ltd." : "Authorized Institution")}
                </span>
              </div>
            </div>

            {/* View/Download Actions */}
            {(data.pdfUrl || data.pngUrl) && (
              <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                {data.pdfUrl && (
                  <a
                    href={data.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <FileText size={14} />
                    <span>View Official PDF</span>
                  </a>
                )}
                {data.pngUrl && (
                  <a
                    href={data.pngUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-xl text-xs transition-colors border border-slate-200"
                  >
                    <ExternalLink size={14} />
                    <span>Preview Certificate</span>
                  </a>
                )}
              </div>
            )}

            {/* Cryptographic Verification Footer inside Card */}
            <div className="pt-2 text-center space-y-1">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                <span>SHA-256 Cryptographically Verified Credential</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono break-all">
                Token: {code.length > 20 ? `${code.substring(0, 10)}...${code.substring(code.length - 8)}` : code}
              </p>
            </div>
          </div>
        )}

        {/* Dedicated "Powered by Onqeva" badge INSIDE the card so it is always visible */}
        <div className="pt-3 border-t border-slate-200/70 flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-gradient-to-r from-slate-50 via-sky-50/50 to-slate-50 border border-slate-200/90 rounded-xl shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium">Verified &amp; Powered by</span>
            <a
              href="https://smc.onqeva.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-sky-600 text-xs transition-colors group"
            >
              <div className="w-5 h-5 relative rounded-md bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-0.5 shrink-0 group-hover:border-sky-300 transition-colors">
                <Image
                  src="/onqeva-logo.png"
                  alt="Onqeva Logo"
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </div>
              <span className="tracking-tight text-slate-900 font-bold">Onqeva</span>
              <span className="text-[10px] text-sky-700 font-semibold bg-sky-100/90 px-1.5 py-0.5 rounded-md">Credential SaaS</span>
            </a>
          </div>
        </div>
      </div>

      {/* External Footer */}
      <footer className="mt-7 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5 px-4">
        <div className="inline-flex items-center gap-1.5 text-slate-600 text-[11px] sm:text-xs font-medium">
          <span>Powered by</span>
          <a
            href="https://smc.onqeva.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-800 hover:text-sky-600 transition-colors inline-flex items-center gap-1"
          >
            <Image
              src="/onqeva-logo.png"
              alt="Onqeva Logo"
              width={14}
              height={14}
              className="object-contain inline-block"
            />
            Onqeva Credential Network
          </a>
        </div>
        <p className="text-[10px] text-slate-400">
          Multi-Tenant Cryptographic Authenticity Network •{" "}
          <a href="https://smc.onqeva.in" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-500 font-medium">
            smc.onqeva.in
          </a>
        </p>
      </footer>
    </div>
  );
}
