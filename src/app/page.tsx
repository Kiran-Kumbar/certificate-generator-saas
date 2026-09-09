"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Award,
  FolderKanban,
  FileSpreadsheet,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* ─── NAVBAR ─── */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-slate-200 rounded-lg sm:rounded-xl flex items-center justify-center p-1 sm:p-1.5 shadow-xs shrink-0 group-hover:border-sky-300 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/image.png" alt="Softmusk Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight block whitespace-nowrap truncate">
                Softmusk CertSaaS
              </span>
              <span className="text-[10px] text-sky-600 font-semibold tracking-wide uppercase hidden sm:block -mt-0.5 whitespace-nowrap">
                Certificate Platform
              </span>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-slate-100 transition-all whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1 sm:gap-1.5 group cursor-pointer whitespace-nowrap"
            >
              <span>
                <span className="hidden sm:inline">Launch </span>Dashboard
              </span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-sky-400/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold shadow-xs">
                <ShieldCheck size={14} className="text-sky-600" />
                <span>Enterprise Certificate Generation &amp; Verification</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Generate &amp; Verify Certificates{" "}
                <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 bg-clip-text text-transparent">
                  from Excel in Seconds
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Issue tamper-proof certificates in bulk with official templates, dynamic typography, 
                automatic Excel column mapping, and live cryptographic QR verification.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <Link
                  href="/dashboard"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md shadow-sky-600/25 transition-all flex items-center gap-2 group text-sm"
                >
                  <Award size={18} />
                  <span>Launch Dashboard</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/login"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-xs"
                >
                  <Lock size={16} className="text-slate-500" />
                  <span>Sign In</span>
                </Link>
              </div>

              {/* Key Features Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Bulk Excel Data Auto-Mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Canva-Style Template Studio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>SHA-256 Tamper-Proof QR Verification</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3 CORE CAPABILITIES ─── */}
        <section className="py-20 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-600">Platform Features</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Everything You Need for Certificate Issuance
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                High-performance architecture built for accuracy, speed, and trusted verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 relative group hover:border-sky-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center mb-5">
                  <FileSpreadsheet size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Excel Bulk Generation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Drop your student spreadsheet (.xlsx). Our engine automatically detects headers, parses dates, verifies data completeness, and creates batch certificates with one click.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 relative group hover:border-sky-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-5">
                  <FolderKanban size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Canva-Style Template Studio
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Position student variables, institutional stamps, authorized signatures, and custom graphics with precision on an interactive canvas editor.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 relative group hover:border-sky-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-5">
                  <QrCode size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Cryptographic QR Verification
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every certificate embeds a unique SHA-256 cryptographic verification token. Anyone can scan the QR code to instantly verify its authenticity online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3 STEP WORKFLOW ─── */}
        <section className="py-20 border-t border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-600">Simple Workflow</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                3 Steps to Issued Certificates
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                A streamlined process designed for efficiency and zero manual formatting hassle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="w-9 h-9 bg-sky-100 text-sky-700 rounded-lg flex items-center justify-center font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Configure Setup &amp; Template</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select your certificate template and map which Excel columns feed into student names, dates, domains, and certificate numbers.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="w-9 h-9 bg-sky-100 text-sky-700 rounded-lg flex items-center justify-center font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Upload Excel &amp; Preflight</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload your spreadsheet to run preflight validation, check student records, and preview data before generation.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="w-9 h-9 bg-sky-100 text-sky-700 rounded-lg flex items-center justify-center font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Generate &amp; Distribute</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generate vector PDFs and PNG images with live QR verification codes. Download individually or as a bulk ZIP.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CALL TO ACTION ─── */}
        <section className="py-16 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-sky-600/15">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Ready to start issuing certificates?
                </h3>
                <p className="text-xs sm:text-sm text-sky-100 max-w-xl leading-relaxed">
                  Sign in to your administrative dashboard to manage setups, upload Excel files, and issue authentic credentials.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <Link
                  href="/dashboard"
                  className="bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Award size={16} />
                  <span>Launch Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/login"
                  className="bg-sky-500/30 hover:bg-sky-500/40 text-white border border-white/20 font-semibold text-xs px-5 py-3 rounded-xl transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-sky-600 shrink-0" />
            <span className="font-semibold text-slate-800">Softmusk CertSaaS</span>
            <span>— Softmusk Info Pvt. Ltd., Belagavi, Karnataka</span>
          </div>

          <div className="flex items-center gap-5 text-slate-500">
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <a
              href="https://softmusk.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-600 transition-colors"
            >
              softmusk.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
