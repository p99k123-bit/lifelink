import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card } from "../ui/card";

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-rose-100/60 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <ArrowUpRight className="h-3.5 w-3.5" />
        Live snapshot
      </div>
    </Card>
  );
}
