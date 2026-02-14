import type { PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

type BadgeTone = "success" | "warning" | "info" | "neutral" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-100 text-amber-900 ring-amber-200",
  info: "bg-sky-100 text-sky-900 ring-sky-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  danger: "bg-red-100 text-red-800 ring-red-200",
};

export function Badge({ children, tone = "neutral", className }: PropsWithChildren<{ tone?: BadgeTone; className?: string }>) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1", toneClasses[tone], className)}>
      {children}
    </span>
  );
}
