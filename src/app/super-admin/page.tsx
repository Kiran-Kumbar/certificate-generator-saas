"use client";

import { useState, useEffect } from "react";
import { Building, Plus, Users, Award, ShieldCheck, CheckCircle } from "lucide-react";

interface Tenant {
  _id: string;
  name: string;
  code: string;
  email: string;
  certificatePrefix: string;
  status: string;
  createdAt: string;
}

interface Stats {
  totalInstitutions: number;
  activeInstitutions: number;
  totalCertificates: number;
  totalAssets: number;
}

export default function SuperAdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [institutions, setInstitutions] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Tenant Onboarding Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("password123");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchSuperAdminData = async () => {
    try {
      const res = await fetch("/api/super-admin");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setInstitutions(data.institutions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, email, adminName, adminPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create tenant");
      }

      setShowModal(false);
      setName("");
      setCode("");
      setEmail("");
      setAdminName("");
      fetchSuperAdminData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating tenant");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Portal</h1>
            <p className="text-xs text-slate-400">Platform-Wide Tenant Management & Telemetry</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
        >
          <Plus size={18} /> Onboard New Institution
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Institutions</span>
            <p className="text-3xl font-extrabold text-white mt-1">{stats.totalInstitutions}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs font-semibold uppercase text-slate-400">Active Tenants</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.activeInstitutions}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs font-semibold uppercase text-slate-400">Platform Certificates</span>
            <p className="text-3xl font-extrabold text-indigo-400 mt-1">{stats.totalCertificates}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs font-semibold uppercase text-slate-400">Uploaded Assets</span>
            <p className="text-3xl font-extrabold text-white mt-1">{stats.totalAssets}</p>
          </div>
        </div>
      )}

      {/* Institutions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Onboarded Tenant Institutions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Institution Name</th>
                <th className="p-3">Tenant Code</th>
                <th className="p-3">Admin Email</th>
                <th className="p-3">Prefix</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {institutions.map((inst) => (
                <tr key={inst._id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">{inst.name}</td>
                  <td className="p-3 font-mono text-indigo-400">{inst.code}</td>
                  <td className="p-3 text-slate-300">{inst.email}</td>
                  <td className="p-3 font-mono">{inst.certificatePrefix}</td>
                  <td className="p-3">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold text-[10px] uppercase">
                      {inst.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{new Date(inst.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Onboard New Institution Tenant</h3>

            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Institution Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oxford Institute"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Tenant Code / Prefix</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. OXFORD"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oxford.edu"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Admin Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Dr. John Doe"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Initial Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-medium"
                >
                  {creating ? "Creating Tenant..." : "Create Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
