"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  Zap,
  Globe,
  Users,
  ChevronRight,
  Star,
  Menu,
  X,
} from "lucide-react";

const STATS = [
  { label: "Certificates Issued", value: "50,000+", icon: Award },
  { label: "Institutions Served", value: "120+", icon: Users },
  { label: "Countries Reached", value: "18+", icon: Globe },
  { label: "QR Verifications", value: "200K+", icon: ShieldCheck },
];

const FEATURES = [
  {
    icon: FileSpreadsheet,
    title: "Excel Bulk Import",
    desc: "Drop any StudentData.xlsx. Our engine auto-detects column headers, parses date serials, and maps every field to your certificate template instantly.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: FolderKanban,
    title: "Canva-Style Template Studio",
    desc: "Drag, drop, resize, and snap design elements on an infinite canvas. Add text, variables, shapes, dividers, badges, and stamps with pixel precision.",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 border-sky-200",
    iconBg: "bg-sky-100 text-sky-700",
  },
  {
    icon: Zap,
    title: "SmartFit Typography",
    desc: "No more overflow. Our engine dynamically adjusts font size and line wrapping so every student name, title, and paragraph fits perfectly every time.",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    icon: ShieldCheck,
    title: "SHA-256 QR Verification",
    desc: "Each certificate embeds a cryptographically unique token. Scan the QR with any phone to instantly verify authenticity from the tamper-proof portal.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 border-violet-200",
    iconBg: "bg-violet-100 text-violet-700",
  },
  {
    icon: Layers,
    title: "Multi-Tenant Architecture",
    desc: "Run multiple institutions from one platform. Each tenant gets isolated data, custom branding, and separate certificate numbering with full access control.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-100 text-rose-700",
  },
  {
    icon: Globe,
    title: "Cloudinary CDN Delivery",
    desc: "Every certificate PDF and PNG is stored on Cloudinary's global CDN. Recipients get blazing-fast downloads and the verification QR works worldwide.",
    color: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50 border-cyan-200",
    iconBg: "bg-cyan-100 text-cyan-700",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimIn(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 flex flex-col overflow-x-hidden selection:bg-sky-600 selection:text-white">
      {/* ─── NAVBAR ─── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[#020817]/95 backdrop-blur-md border-b border-white/10 shadow-2xl" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Softmusk" className="w-9 h-9 object-contain rounded-xl border border-white/10 p-1 bg-white/5" />
            <div>
              <span className="font-bold text-white text-sm tracking-tight block">Softmusk CertSaaS</span>
              <span className="text-[10px] text-sky-400 font-medium tracking-widest uppercase block -mt-0.5">Certificate Platform</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <Link href="/dashboard/templates" className="hover:text-white transition-colors">Template Studio</Link>
            <Link href="/dashboard/certificates" className="hover:text-white transition-colors">Generator</Link>
            <Link href="/dashboard/setups" className="hover:text-white transition-colors">Excel Setups</Link>
            <Link href="/verify/demo" className="hover:text-sky-400 transition-colors flex items-center gap-1">
              <QrCode size={13} /> Verify
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
              Sign In
            </Link>
            <Link href="/dashboard" className="group bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center gap-1.5">
              Launch Dashboard <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a1628] border-t border-white/10 p-4 space-y-3">
            <Link href="/dashboard/templates" className="block text-sm text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Template Studio</Link>
            <Link href="/dashboard/certificates" className="block text-sm text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Generator</Link>
            <Link href="/dashboard/setups" className="block text-sm text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Excel Setups</Link>
            <Link href="/login" className="block text-sm text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link href="/dashboard" className="block w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center" onClick={() => setMenuOpen(false)}>
              Launch Dashboard
            </Link>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <main className="flex-1">
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Animated grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)] opacity-40" />
          
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-800/10 rounded-full blur-[150px]" />

          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center transition-all duration-1000 ${animIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-6 shadow-lg shadow-sky-500/10 backdrop-blur-sm">
              <Sparkles size={13} className="text-sky-400 animate-pulse" />
              <span>Enterprise-Grade · ISO-Style Certificate Platform</span>
              <span className="flex items-center gap-1 text-amber-400 ml-1">
                <Star size={11} fill="currentColor" />★ Trusted by 120+ Institutions
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
              <span className="text-white">The Smartest Way to</span>
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
                Issue & Verify Certificates
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              From Excel sheet to tamper-proof PDF in seconds. Softmusk CertSaaS handles bulk generation, 
              Canva-style template design, cryptographic QR verification, and Cloudinary CDN delivery — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/dashboard/certificates" className="group w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-7 py-3.5 rounded-2xl shadow-2xl shadow-sky-500/30 transition-all flex items-center justify-center gap-2 text-sm">
                <Award size={18} />
                Start Generating Certificates
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/dashboard/templates" className="group w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-semibold px-7 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
                <FolderKanban size={18} className="text-sky-400" />
                Open Template Studio
              </Link>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {STATS.map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/8 transition-all group">
                  <Icon size={20} className="text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xl font-extrabold text-white">{value}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-400 to-transparent animate-pulse" />
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Scroll</span>
          </div>
        </section>

        {/* ─── CERTIFICATE SHOWCASE ─── */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817] via-[#060f1f] to-[#020817]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3">Live Preview</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Real Certificates, Real Impact
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every certificate issued through Softmusk CertSaaS carries a cryptographic QR code, official signatories, and an institutional stamp.
              </p>
            </div>

            {/* Certificate card mockup */}
            <div className="max-w-2xl mx-auto">
              <div className="relative p-1 rounded-3xl bg-gradient-to-br from-amber-500/30 via-sky-500/10 to-violet-500/30 shadow-2xl shadow-sky-500/10">
                <div className="bg-white rounded-[22px] p-6 sm:p-8 text-slate-900 font-serif relative overflow-hidden">
                  {/* Decorative border lines */}
                  <div className="absolute inset-2 border-2 border-amber-500/20 rounded-xl pointer-events-none" />
                  <div className="absolute inset-3 border border-amber-300/10 rounded-xl pointer-events-none" />
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-4 mb-5">
                    <div>
                      <p className="text-[11px] font-bold tracking-widest text-blue-900 uppercase">SOFTMUSK INFO PVT. LTD.</p>
                      <p className="text-[9px] text-slate-500 italic">Serving IT to serve you</p>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full font-bold tracking-wide">★ VERIFIED</span>
                  </div>

                  {/* Certificate title */}
                  <div className="text-center mb-5">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide uppercase">Internship Certificate</h3>
                    <p className="text-[9px] tracking-[0.3em] font-bold text-slate-400 uppercase mt-2">T H I S · I S · T O · C E R T I F Y · T H A T</p>
                    <div className="w-16 h-px bg-amber-400 mx-auto mt-3" />
                  </div>

                  {/* Student name */}
                  <div className="text-center mb-4">
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900" style={{ fontFamily: "serif" }}>Ruchita Lavar</p>
                  </div>

                  {/* Body text */}
                  <div className="text-[10.5px] text-slate-600 leading-relaxed text-center space-y-2 px-4 mb-5">
                    <p>A student of <strong>KLS Gogte Institute of Technology</strong> has successfully completed her internship from <strong>25-May-2026</strong> to <strong>14-Aug-2026</strong> at "Softmusk Info Pvt. Ltd, Belagavi, Karnataka."</p>
                    <p>Was able to successfully participate in and accomplish all tasks for the project entitled <strong>"AI Powered Full Stack Development"</strong> showcasing exceptional skills and dedication.</p>
                  </div>

                  {/* Signatories */}
                  <div className="flex items-end justify-between border-t border-amber-100 pt-4">
                    <div className="text-center">
                      <p className="text-blue-900 italic font-bold text-sm mb-1" style={{ fontFamily: "cursive" }}>Amrut S.</p>
                      <p className="text-[8px] font-semibold text-slate-800 uppercase tracking-wide">Amrut Sayanakar</p>
                      <p className="text-[7.5px] text-slate-500">Director</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border border-slate-200 bg-slate-50 rounded flex items-center justify-center shadow-inner">
                        <QrCode size={36} className="text-slate-800" />
                      </div>
                      <p className="text-[7px] text-slate-400 font-mono mt-0.5">Scan to Verify</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-900 italic font-bold text-sm mb-1" style={{ fontFamily: "cursive" }}>Rajshekhar P.</p>
                      <p className="text-[8px] font-semibold text-slate-800 uppercase tracking-wide">Rajshekhar Patil</p>
                      <p className="text-[7.5px] text-slate-500">CEO</p>
                    </div>
                  </div>

                  {/* Certificate No. watermark */}
                  <div className="absolute bottom-3 right-4 text-[7px] text-slate-300 font-mono">SM-2026-000001</div>
                </div>
              </div>

              {/* Action buttons below card */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
                <Link href="/dashboard/certificates" className="group flex-1 sm:flex-none bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25">
                  <Award size={16} /> Generate Now <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/verify/demo" className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                  <ShieldCheck size={16} className="text-emerald-400" /> Try Verification Portal
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES GRID ─── */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817] to-[#060f1f]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3">Capabilities</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Everything You Need for Professional Certificates
              </h2>
              <p className="text-slate-400 text-sm">Built for institutions that need speed, accuracy, and absolute trust.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc, bg, iconBg }) => (
                <div key={title} className={`group bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-white/10 text-white transition-transform group-hover:scale-110`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#060f1f] to-[#020817]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3">Workflow</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                3 Steps from Excel to Official Certificate
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

              {[
                {
                  step: "01",
                  title: "Design Your Template",
                  desc: "Use the Canva-style studio to place text elements, variables, shapes, lines, stamps, and signatures on a beautiful certificate canvas.",
                  link: "/dashboard/templates",
                  cta: "Open Template Studio",
                },
                {
                  step: "02",
                  title: "Configure Excel Setup",
                  desc: "Define which Excel columns map to which certificate fields — student name, college, dates, domain, registration number — in the Setup builder.",
                  link: "/dashboard/setups",
                  cta: "Create Setup",
                },
                {
                  step: "03",
                  title: "Generate & Distribute",
                  desc: "Upload your Excel file, preflight-check all rows, then generate tamper-proof PDFs with QR codes in one click. Download as ZIP or email directly.",
                  link: "/dashboard/certificates",
                  cta: "Go to Generator",
                },
              ].map(({ step, title, desc, link, cta }) => (
                <div key={step} className="relative bg-white/3 border border-white/8 rounded-2xl p-7 hover:border-sky-500/30 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/20 flex items-center justify-center mb-5 text-sky-400 font-extrabold text-xl">
                    {step}
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-5">{desc}</p>
                  <Link href={link} className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {cta} <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/40 via-blue-900/50 to-violet-900/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.15)_0%,_transparent_70%)]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sky-300 text-xs font-semibold mb-6">
              <Lock size={12} /> Secure · Private · Enterprise-Ready
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              Ready to Issue Your First<br className="hidden sm:block" /> Official Certificate?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-10">
              Your workspace is live. Log in with your institutional admin account, design a template, and generate your first batch certificate in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="group w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-sky-500/30 transition-all flex items-center justify-center gap-2">
                <Award size={18} /> Launch Dashboard <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold px-8 py-4 rounded-2xl transition-all text-sm">
                Sign In to Your Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/8 bg-[#020817] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/image.png" alt="Softmusk" className="w-8 h-8 object-contain opacity-80" />
              <div>
                <p className="text-sm font-bold text-white">Softmusk CertSaaS</p>
                <p className="text-[11px] text-slate-500">Enterprise Certificate Operations Platform · Softmusk Info Pvt. Ltd.</p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/dashboard/templates" className="hover:text-white transition-colors">Templates</Link>
              <Link href="/dashboard/certificates" className="hover:text-white transition-colors">Certificates</Link>
              <Link href="/dashboard/setups" className="hover:text-white transition-colors">Setups</Link>
              <Link href="/verify/demo" className="hover:text-sky-400 transition-colors flex items-center gap-1">
                <ShieldCheck size={12} /> Verify Portal
              </Link>
            </nav>
            <p className="text-[11px] text-slate-600">© {new Date().getFullYear()} Softmusk Info Pvt. Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
