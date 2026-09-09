"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  FileText,
  UploadCloud,
  FolderKanban,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({ certificates: 0, templates: 0, setups: 0, assets: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [certsRes, tmplRes, setupsRes, assetsRes] = await Promise.all([
          fetch("/api/certificates"),
          fetch("/api/templates"),
          fetch("/api/setups"),
          fetch("/api/assets"),
        ]);

        const certsData = await certsRes.json();
        const tmplData = await tmplRes.json();
        const setupsData = await setupsRes.json();
        const assetsData = await assetsRes.json();

        setStats({
          certificates: certsData.certificates?.length || 0,
          templates: tmplData.templates?.length || 0,
          setups: setupsData.setups?.length || 0,
          assets: assetsData.assets?.length || 0,
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard Overview
            <span className="text-xs font-medium text-slate-600 px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-full">
              Softmusk Enterprise
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time issuance analytics, batch preflight status, and certificate pipeline
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/certificates"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-sky-600/20"
          >
            <Plus size={15} />
            Issue Certificate
          </Link>
          <Link
            href="/dashboard/certificates"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs"
          >
            <FileSpreadsheet size={15} className="text-sky-600" />
            Bulk Excel
          </Link>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-sky-500/40 hover:shadow-md transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Issued Certificates</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.certificates}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">100% Validated</span> in MongoDB & Cloud
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-sky-500/40 hover:shadow-md transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Templates</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <FolderKanban size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.templates}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-sky-600 font-medium">A4 Portrait & Landscape</span> engines
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-sky-500/40 hover:shadow-md transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Program Setups</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.setups}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-slate-700 font-medium">Dynamic variables</span> & folder rules
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-sky-500/40 hover:shadow-md transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Media Assets</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <UploadCloud size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.assets}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">Cloudinary CDN</span> stored
          </p>
        </div>
      </div>

      {/* Guided Setup Pipeline Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">System Workflow Pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">Step-by-step process for official certificate generation</p>
          </div>
          <span className="text-xs text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full font-medium">
            Standard Operating Procedure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/assets"
            className="group bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-sky-500/50 hover:shadow-md p-4 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 bg-sky-50 text-sky-600 border border-sky-200/70 rounded-lg flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                Upload Assets
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload company logos, official signature graphics, and seals to the CDN library.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-[11px] text-sky-600 font-semibold gap-1 group-hover:translate-x-0.5 transition-transform">
              Manage Assets <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            href="/dashboard/templates"
            className="group bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-sky-500/50 hover:shadow-md p-4 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 bg-sky-50 text-sky-600 border border-sky-200/70 rounded-lg flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                Visual Template
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Set canvas dimensions (A4 portrait), place QR tokens, and position dynamic typography.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-[11px] text-sky-600 font-semibold gap-1 group-hover:translate-x-0.5 transition-transform">
              Open Editor <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            href="/dashboard/setups"
            className="group bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-sky-500/50 hover:shadow-md p-4 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 bg-sky-50 text-sky-600 border border-sky-200/70 rounded-lg flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                Program Setup
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bind body paragraphs, map student/college/dates variables, and configure folder rules.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-[11px] text-sky-600 font-semibold gap-1 group-hover:translate-x-0.5 transition-transform">
              Configure Setups <ArrowRight size={12} />
            </div>
          </Link>

          <Link
            href="/dashboard/certificates"
            className="group bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-sky-500/50 hover:shadow-md p-4 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 bg-sky-50 text-sky-600 border border-sky-200/70 rounded-lg flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
                4
              </div>
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                Issue & Verify
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Issue certificates via Single Entry or preflight Excel bulk batches with instant QR verification.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-[11px] text-sky-600 font-semibold gap-1 group-hover:translate-x-0.5 transition-transform">
              Generate Now <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
