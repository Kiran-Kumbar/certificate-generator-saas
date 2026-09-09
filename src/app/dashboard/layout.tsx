"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderKanban,
  Award,
  UploadCloud,
  LayoutDashboard,
  LogOut,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/toast";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
  { name: "Setups & Form", href: "/dashboard/setups", icon: FileText },
  { name: "Template Editor", href: "/dashboard/templates", icon: FolderKanban },
  { name: "Saved Designs", href: "/dashboard/designs", icon: Layers },
  { name: "Asset Library", href: "/dashboard/assets", icon: UploadCloud },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
        {/* Modern Eye-Soothing Light Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 select-none shadow-xs">
          <div>
            {/* Logo & Brand Header */}
            <div className="flex items-center gap-3 px-3 py-3.5 mb-5 border-b border-slate-100">
              <div className="relative w-10 h-10 flex items-center justify-center p-1 bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs shrink-0">
                <Image
                  src="/image.png"
                  alt="Softmusk Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-slate-900 text-sm tracking-tight truncate">Softmusk</h2>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">Certificate Engine</p>
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
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                } catch {
                  // ignore
                }
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main App Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          {/* Top Header Bar */}
          <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 md:px-8 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Portal</span>
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-900">
                {navItems.find((n) => n.href === pathname)?.name || "Workspace"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full font-medium shadow-xs">
                <Sparkles size={13} className="text-sky-600" />
                Verified Certificate SaaS
              </span>
            </div>
          </header>

          {/* Page Content View */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
