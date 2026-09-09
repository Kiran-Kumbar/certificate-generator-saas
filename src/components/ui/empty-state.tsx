import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60 mb-4 shadow-xs">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-sky-600/20"
          >
            {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
