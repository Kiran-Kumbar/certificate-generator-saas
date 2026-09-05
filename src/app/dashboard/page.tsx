"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, FileText, UploadCloud, FolderKanban, Plus, CheckCircle } from "lucide-react";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Multi-tenant Certificate Generation & Management Engine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Issued Certificates</span>
            <Award className="text-indigo-400" size={20} />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.certificates}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Templates</span>
            <FolderKanban className="text-indigo-400" size={20} />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.templates}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Setups Configured</span>
            <FileText className="text-indigo-400" size={20} />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.setups}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Uploaded Assets</span>
            <UploadCloud className="text-indigo-400" size={20} />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.assets}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Quick Setup Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/dashboard/assets" className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl transition-all">
            <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold mb-3">1</div>
            <h3 className="font-semibold text-white text-sm">Upload Assets</h3>
            <p className="text-xs text-slate-400 mt-1">Upload signatures, logos, and stamps to Cloudinary.</p>
          </Link>

          <Link href="/dashboard/templates" className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl transition-all">
            <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold mb-3">2</div>
            <h3 className="font-semibold text-white text-sm">Design Template</h3>
            <p className="text-xs text-slate-400 mt-1">Upload blank design & position variables on Visual Canvas.</p>
          </Link>

          <Link href="/dashboard/setups" className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl transition-all">
            <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold mb-3">3</div>
            <h3 className="font-semibold text-white text-sm">Configure Setup</h3>
            <p className="text-xs text-slate-400 mt-1">Bind program text & define dynamic input variables.</p>
          </Link>

          <Link href="/dashboard/certificates" className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl transition-all">
            <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold mb-3">4</div>
            <h3 className="font-semibold text-white text-sm">Generate Certificates</h3>
            <p className="text-xs text-slate-400 mt-1">Run individual entry form or Excel bulk upload generator.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
