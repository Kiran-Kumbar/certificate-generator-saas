"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FileText,
  FolderKanban,
  Award,
  UploadCloud,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/toast";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
  { name: "Setups & Form", href: "/dashboard/setups", icon: FileText },
  { name: "Template Editor", href: "/dashboard/templates", icon: FolderKanban },
  { name: "Asset Library", href: "/dashboard/assets", icon: UploadCloud },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const SidebarContent = () => (
    <>
      <div>
        {/* Tenant Workspace Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3.5 mb-5 border-b border-slate-100">
          <div className="relative w-10 h-10 flex items-center justify-center p-1 bg-white border border-slate-200/80 rounded-xl shadow-xs shrink-0">
            <Image src="/image.png" alt="Softmusk Logo" width={32} height={32} className="object-contain" priority />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-slate-900 text-sm tracking-tight truncate">Softmusk</h2>
              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">TENANT</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">Powered by Onqeva</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-600/25 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">Softmusk Info Pvt. Ltd.</p>
            <p className="text-[10px] text-slate-500 truncate">Tenant Workspace Active</p>
          </div>
        </div>

        <button
          onClick={async () => {
            try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
        {/* ─── DESKTOP SIDEBAR ─── */}
        <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-4 shrink-0 select-none shadow-xs">
          <SidebarContent />
        </aside>

        {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar panel */}
            <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col justify-between p-4 shadow-2xl animate-in slide-in-from-left duration-200">
              <SidebarContent />
              <button
                className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </aside>
          </div>
        )}

        {/* ─── MAIN APP CANVAS ─── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          {/* Top Header Bar */}
          <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between shrink-0 shadow-xs sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="hidden sm:inline">Portal</span>
                <span className="text-slate-400 hidden sm:inline">/</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {navItems.find((n) => n.href === pathname)?.name || "Workspace"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 border border-sky-200 px-2 sm:px-2.5 py-1 rounded-full font-medium shadow-xs">
                <Sparkles size={12} className="text-sky-600" />
                <span className="hidden sm:inline">Verified Certificate SaaS</span>
                <span className="sm:hidden">CertSaaS</span>
              </span>
            </div>
          </header>

          {/* Page Content View */}
          <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
