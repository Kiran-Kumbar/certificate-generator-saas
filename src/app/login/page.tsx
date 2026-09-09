"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-3.5 p-2 shadow-xs">
            <Image
              src="/image.png"
              alt="Softmusk Logo"
              width={42}
              height={42}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            Softmusk <span className="text-sky-600">CertSaaS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Certificate Operations Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={17} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 transition-colors"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={17} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 transition-colors"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-sm shadow-sky-600/20 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Softmusk Info Pvt. Ltd. &copy; {new Date().getFullYear()} &middot; Multi-Tenant Workspace
          </p>
        </div>
      </div>
    </div>
  );
}
