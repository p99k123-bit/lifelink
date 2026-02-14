import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { SimpleBarChart } from "../../../components/dashboard/simple-bar-chart";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { requireRole } from "../../../lib/auth-server";
import { formatDateTime } from "../../../lib/format";
import { getAdminAnalytics } from "../../../lib/services/admin";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/admin/users", label: "Users", icon: "users" as const },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" as const },
];

export default async function AdminAnalyticsPage() {
  const { supabase, user } = await requireRole("admin");
  const analytics = await getAdminAnalytics(supabase);

  return (
    <DashboardShell
      title="Platform Analytics"
      subtitle="Track request and donation velocity month-over-month."
      roleLabel="Admin"
      email={user.email ?? "admin@bloodline"}
      navItems={adminNav}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <SimpleBarChart
          title="Monthly Emergency Requests"
          data={analytics.monthlyTimeline.map((item) => ({ label: item.label, value: item.requests }))}
        />

        <SimpleBarChart
          title="Monthly Donations"
          data={analytics.monthlyTimeline.map((item) => ({ label: item.label, value: item.donations }))}
        />

        <Card className="xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">Recent activity timeline</h3>
          <p className="mt-1 text-sm text-slate-500">System-level events for governance and audit reviews.</p>

          {!analytics.recentActivity.length ? (
            <div className="mt-4">
              <EmptyState title="No activity logs" description="Populate the `activity_logs` table to power this timeline." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {analytics.recentActivity.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone="info">{item.type}</Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(item.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.summary}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}

