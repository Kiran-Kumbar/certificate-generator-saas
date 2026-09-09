"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: (options: { title?: string; message: string; type?: ToastType }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = "success" }: { title?: string; message: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => addToast({ message, title, type: "success" }),
    [addToast]
  );
  const error = useCallback(
    (message: string, title?: string) => addToast({ message, title, type: "error" }),
    [addToast]
  );
  const info = useCallback(
    (message: string, title?: string) => addToast({ message, title, type: "info" }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2",
              t.type === "success" && "bg-white/95 border-emerald-200 text-slate-900 shadow-emerald-500/10",
              t.type === "error" && "bg-white/95 border-rose-200 text-slate-900 shadow-rose-500/10",
              t.type === "info" && "bg-white/95 border-sky-200 text-slate-900 shadow-sky-500/10"
            )}
          >
            {t.type === "success" && <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info size={18} className="text-sky-600 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              {t.title && <p className="text-xs font-semibold text-slate-900 tracking-tight">{t.title}</p>}
              <p className="text-xs text-slate-600 leading-relaxed">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: () => {},
      success: (msg: string) => console.log("[Success Toast]:", msg),
      error: (msg: string) => console.error("[Error Toast]:", msg),
      info: (msg: string) => console.log("[Info Toast]:", msg),
    };
  }
  return context;
}
