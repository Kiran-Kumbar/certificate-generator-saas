import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Sparkles,
  FolderKanban,
  FileSpreadsheet,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  Printer,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/image.png" alt="Softmusk Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight block">
                Softmusk CertSaaS
              </span>
              <span className="text-[10px] text-sky-600 font-semibold tracking-wide uppercase block -mt-0.5">
                Enterprise Certificate Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link
              href="/dashboard/certificates"
              className="hover:text-slate-900 transition-colors"
            >
              Bulk Generator
            </Link>
            <Link
              href="/dashboard/templates"
              className="hover:text-slate-900 transition-colors"
            >
              Template Studio
            </Link>
            <Link
              href="/dashboard/setups"
              className="hover:text-slate-900 transition-colors"
            >
              Excel Setups
            </Link>
            <Link
              href="/verify/demo"
              className="hover:text-slate-900 transition-colors flex items-center gap-1 text-slate-500 hover:text-sky-600"
            >
              <QrCode size={14} /> Verification
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5 group cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-400/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold shadow-xs">
                <Sparkles size={14} className="text-sky-600" />
                <span>Production-Grade Bulk Issuance & Verification</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Generate Perfect Certificates from{" "}
                <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                  Excel Data in Seconds
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Issue tamper-proof academic and corporate certificates in bulk. Features 
                ready-to-use official templates, SmartFit vector typography, automatic Excel 
                mapping, and instant cryptographic QR verification.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/dashboard/certificates"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-3 rounded-xl shadow-sm shadow-sky-600/20 transition-all flex items-center gap-2 group text-sm"
                >
                  <Award size={18} />
                  <span>Start Generating Certificates</span>
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/dashboard/templates"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-sm shadow-xs"
                >
                  <FolderKanban size={18} className="text-sky-600" />
                  <span>Open Template Studio</span>
                </Link>
              </div>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Official Softmusk Template Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Zero Box Dragging Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Live Preview & Excel Auto-Map</span>
                </div>
              </div>
            </div>

            {/* Interactive Certificate Showcase Card */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="relative rounded-2xl p-1 bg-gradient-to-b from-sky-100 via-slate-200 to-slate-200/60 shadow-xl">
                <div className="bg-white rounded-[14px] p-4 sm:p-6 border border-slate-200 backdrop-blur-xl shadow-sm">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-xs text-slate-500 font-mono ml-2">
                        Official Template: Softmusk Internship Certificate (Portrait A4)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                        <CheckCircle2 size={12} /> Validated Layout
                      </span>
                    </div>
                  </div>

                  {/* Certificate Preview Mockup */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left: Certificate Representation */}
                    <div className="md:col-span-7 bg-white text-slate-900 rounded-xl p-6 shadow-md border-4 border-amber-600/30 relative overflow-hidden font-serif">
                      {/* Inner gold frame */}
                      <div className="border border-amber-500/60 p-4 rounded text-center space-y-3 relative">
                        {/* Logo header */}
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                          <div className="text-left">
                            <span className="text-[11px] font-sans font-black tracking-wider text-blue-900 block">
                              SOFTMUSK INFO PVT. LTD.
                            </span>
                            <span className="text-[8px] font-sans text-slate-500 block">
                              Serving IT to serve you
                            </span>
                          </div>
                          <span className="text-[9px] font-sans bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                            ★ VERIFIED
                          </span>
                        </div>

                        <div className="pt-1">
                          <h3 className="text-lg font-bold tracking-wide text-slate-900 uppercase">
                            Internship Certificate
                          </h3>
                          <p className="text-[8px] tracking-[0.2em] font-sans font-bold text-slate-500 uppercase mt-0.5">
                            T H I S   I S   T O   C E R T I F Y   T H A T
                          </p>
                        </div>

                        {/* Student Name */}
                        <div className="py-1">
                          <span className="text-xl font-bold text-[#002b66] tracking-tight block">
                            Ruchita Lavar
                          </span>
                        </div>

                        {/* Certificate Body Paragraphs */}
                        <div className="text-[9.5px] leading-relaxed text-slate-700 space-y-1.5 px-2">
                          <p>
                            A student of{" "}
                            <span className="font-semibold text-slate-900">
                              KLS Gogte Institute of Technology
                            </span>{" "}
                            has successfully completed his/her internship from{" "}
                            <span className="font-semibold text-slate-900">25-May-2026</span> to{" "}
                            <span className="font-semibold text-slate-900">14-Aug-2026</span> at{" "}
                            “Softmusk Info Pvt. Ltd Belagavi, Karnataka.”
                          </p>
                          <p>
                            Was able to successfully participate in and accomplish all the tasks required
                            for the project entitled{" "}
                            <span className="font-semibold text-slate-900">
                              “AI Powered Full Stack Development”
                            </span>.
                          </p>
                        </div>

                        {/* Signatures & QR Code */}
                        <div className="pt-3 flex items-end justify-between text-[8px] font-sans text-slate-600 border-t border-amber-100 mt-2">
                          <div className="text-center">
                            <div className="font-script text-indigo-900 italic font-bold">Amrut S.</div>
                            <span className="font-semibold block text-[7px] text-slate-800">Amrut Sayanakar</span>
                            <span className="text-[6.5px] text-slate-500">Director</span>
                          </div>

                          <div className="text-center">
                            <div className="font-script text-indigo-900 italic font-bold">Rajshekhar P.</div>
                            <span className="font-semibold block text-[7px] text-slate-800">Rajshekhar Patil</span>
                            <span className="text-[6.5px] text-slate-500">CEO</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border border-slate-300 bg-slate-50 rounded flex items-center justify-center p-0.5 shadow-xs">
                              <QrCode size={32} className="text-slate-900" />
                            </div>
                            <span className="text-[6px] text-slate-500 font-mono mt-0.5">Scan to Verify</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Feature Highlights & Fast Actions */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-sky-700 text-xs font-semibold">
                          <FileSpreadsheet size={16} />
                          <span>Excel Auto-Detection</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Drop in <code className="text-sky-700 font-mono text-[11px] bg-sky-50 px-1 py-0.5 rounded border border-sky-200">StudentData.xlsx</code>. 
                          Columns like Student Name, College, Dates, and Domain are automatically linked.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-sky-700 text-xs font-semibold">
                          <Sparkles size={16} />
                          <span>Times-Roman SmartFit Typography</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Dynamic font sizing and line wrapping ensure no student name or project title ever clips or overflows.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-sky-700 text-xs font-semibold">
                          <Lock size={16} />
                          <span>Cryptographic QR Verification</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Each certificate embeds a unique SHA-256 validation token with one-scan instant verification.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link
                          href="/dashboard/certificates"
                          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
                        >
                          <span>Generate from StudentData.xlsx Now</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Step Workflow Section */}
        <section className="py-20 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Simple 3-Step Production Workflow
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Designed for high efficiency without tedious manual coordinate positioning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative group hover:border-sky-300 hover:shadow-xs transition-all">
                <div className="w-12 h-12 bg-sky-50 border border-sky-200 text-sky-700 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  Select or Customize Template
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Choose the pre-built Softmusk Internship template or upload your custom background PDF. All typography and dynamic fields are pre-aligned.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Link
                    href="/dashboard/templates"
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <span>Open Template Editor</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative group hover:border-sky-300 hover:shadow-xs transition-all">
                <div className="w-12 h-12 bg-sky-50 border border-sky-200 text-sky-700 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  Upload Excel Spreadsheet
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Drop your Excel sheet with student records. Our preflight engine automatically parses serial date numbers, checks for missing data, and previews each row.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Link
                    href="/dashboard/setups"
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <span>View Setup Fields</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative group hover:border-sky-300 hover:shadow-xs transition-all">
                <div className="w-12 h-12 bg-sky-50 border border-sky-200 text-sky-700 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  1-Click Batch Generation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generate vector PDFs with live QR verification codes. Download as single high-definition files, a consolidated merged PDF, or a bulk ZIP archive.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Link
                    href="/dashboard/certificates"
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <span>Go to Certificate Generator</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section className="py-16 border-t border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-sky-50 border border-sky-200 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Ready to generate Softmusk certificates?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                  Your tenant workspace is live. Access all modules, test the preflight engine, and export high-resolution certificates directly.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/certificates"
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-sm shadow-sky-600/20 transition-all flex items-center gap-2"
                >
                  <Award size={16} />
                  <span>Open Generator</span>
                </Link>
                <Link
                  href="/login"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium px-5 py-3 rounded-xl transition-all shadow-xs"
                >
                  Sign In (admin@example.com)
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-sky-600" />
            <span className="font-semibold text-slate-800">Softmusk CertSaaS</span>
            <span>— Enterprise Multi-Tenant Certificate Generation Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/templates" className="hover:text-slate-900 transition-colors">
              Templates
            </Link>
            <Link href="/dashboard/certificates" className="hover:text-slate-900 transition-colors">
              Certificates
            </Link>
            <Link href="/verify/demo" className="hover:text-slate-900 transition-colors">
              Verification Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
