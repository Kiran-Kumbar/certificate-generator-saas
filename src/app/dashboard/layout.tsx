"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderKanban,
  Award,
  UploadCloud,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Settings,
  Layers,
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm tracking-tight">CertSaaS Engine</h2>
              <p className="text-xs text-slate-400">Tenant Workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-1">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
