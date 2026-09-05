"use client";

import { useEffect, useState, use } from "react";
import { ShieldCheck, CheckCircle, XCircle, FileText, ExternalLink, Building, Award } from "lucide-react";

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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4" />
        <p className="text-sm text-slate-400 font-mono">Verifying Certificate Authenticity Token...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Certificate Verification Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-Tenant Cryptographic Authenticity Check</p>
        </div>

        {!data || !data.verified ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center space-y-3">
            <XCircle className="text-red-400 mx-auto" size={40} />
            <h2 className="text-lg font-bold text-red-400">Certificate Not Found or Invalid</h2>
            <p className="text-xs text-slate-300">The verification token provided does not match any authentic certificate record.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-400" size={24} />
                <div>
                  <h3 className="font-bold text-emerald-400 text-sm">AUTHENTIC CERTIFICATE</h3>
                  <p className="text-xs text-slate-400">Verified by {data.institution?.name}</p>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 font-semibold uppercase text-[10px] px-2.5 py-1 rounded-full">
                {data.status}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Certificate Number</span>
                <span className="font-mono font-bold text-indigo-400">{data.certificateNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Student Name</span>
                <span className="font-bold text-white text-sm">{data.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Issuing Institution</span>
                <span className="font-semibold text-slate-200">{data.institution?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issued On</span>
                <span className="text-slate-300">{new Date(data.issuedAt!).toLocaleDateString()}</span>
              </div>
            </div>

            {data.pdfUrl && (
              <div className="flex gap-3">
                <a
                  href={data.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-xs text-center transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  View Official PDF <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
