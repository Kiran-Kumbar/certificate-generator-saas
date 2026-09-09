"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { ShieldCheck, CheckCircle, XCircle, FileText, ExternalLink } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
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
          <p className="text-xs text-slate-500 mt-1">Multi-Tenant Cryptographic Authenticity Registry</p>
        </div>

        {!data || !data.verified ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
            <XCircle className="text-red-500 mx-auto" size={40} />
            <h2 className="text-lg font-bold text-red-700">Certificate Not Found or Invalid</h2>
            <p className="text-xs text-slate-600">
              The verification token provided does not match any authentic credential record.
            </p>
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
                      {data.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issued & Cryptographically Signed by <strong>{data.institution?.name || "Softmusk Info Pvt. Ltd."}</strong>
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
                  <span className="font-semibold text-slate-800 text-right">{String(data.recipientData?.college_name)}</span>
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

              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Issuance Date</span>
                <span className="text-slate-700">{new Date(data.issuedAt!).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Download & Share Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {data.pdfUrl && (
                <a
                  href={data.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-lg text-xs text-center transition-all shadow-sm shadow-sky-600/20 flex items-center justify-center gap-2"
                >
                  <FileText size={14} /> Download Official PDF
                </a>
              )}
              {data.pngUrl && (
                <a
                  href={data.pngUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-4 py-2.5 rounded-lg text-xs text-center transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ExternalLink size={14} /> Open PNG
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
