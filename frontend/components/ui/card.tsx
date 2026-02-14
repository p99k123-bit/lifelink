import type { PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.45)] backdrop-blur",
        className,
      )}
    >
      {children}
    </section>
  );
}
