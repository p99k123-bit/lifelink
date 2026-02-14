import { Card } from "../ui/card";

export function SimpleBarChart({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-5 space-y-3">
        {data.map((item) => (
          <div key={item.label} className="grid grid-cols-[70px_1fr_45px] items-center gap-3 text-sm">
            <span className="font-medium text-slate-600">{item.label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
                style={{ width: `${Math.max((item.value / max) * 100, 6)}%` }}
              />
            </div>
            <span className="text-right font-semibold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
