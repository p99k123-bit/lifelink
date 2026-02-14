import type { PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

export function Table({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_30px_-16px_rgba(15,23,42,0.4)]">
      <table className={cn("min-w-full divide-y divide-slate-100 text-left text-sm", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: PropsWithChildren) {
  return <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</thead>;
}

export function TH({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <th className={cn("px-4 py-3", className)}>{children}</th>;
}

export function TD({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <td className={cn("px-4 py-3 text-slate-700", className)}>{children}</td>;
}

export function TR({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <tr className={cn("border-t border-slate-100 first:border-t-0", className)}>{children}</tr>;
}
