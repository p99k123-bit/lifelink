import Link from "next/link";
import { Activity, Building2, Droplets, Users } from "lucide-react";
import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { SimpleBarChart } from "../../../components/dashboard/simple-bar-chart";
import { StatCard } from "../../../components/dashboard/stat-card";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { requireRole } from "../../../lib/auth-server";
import { formatDateTime } from "../../../lib/format";
import { getAdminDashboardData, getAdminUsers } from "../../../lib/services/admin";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/admin/users", label: "Users", icon: "users" as const },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" as const },
];

export default async function AdminDashboardPage() {
  const { supabase, user } = await requireRole("admin");
  const [dashboardData, users] = await Promise.all([getAdminDashboardData(supabase), getAdminUsers(supabase)]);

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Platform-wide metrics, operational monitoring, and governance."
      roleLabel="Admin"
      email={user.email ?? "admin@bloodline"}
      navItems={adminNav}
    >
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total donors" value={String(dashboardData.totalDonors)} hint="Registered donor profiles" icon={Users} />
          <StatCard title="Total hospitals" value={String(dashboardData.totalHospitals)} hint="Registered hospital profiles" icon={Building2} />
          <StatCard title="Active requests" value={String(dashboardData.activeRequests)} hint="Unfulfilled emergency demand" icon={Activity} />
          <StatCard
            title="Tracked blood groups"
            value={String(dashboardData.bloodGroupDistribution.length)}
            hint="Donor pool distribution"
            icon={Droplets}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <SimpleBarChart
            title="Blood Group Distribution"
            data={dashboardData.bloodGroupDistribution.map((item) => ({ label: item.blood_group, value: item.count }))}
          />

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Recent system activity</h3>
              <Link href="/admin/analytics" className="text-sm font-semibold text-rose-700 hover:text-rose-800">
                View analytics
              </Link>
            </div>
            {!dashboardData.recentActivity.length ? (
              <EmptyState title="No activity logs" description="Insert activity rows in `activity_logs` to populate this feed." />
            ) : (
              <div className="space-y-2.5">
                {dashboardData.recentActivity.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="info">{item.type}</Badge>
                      <span className="text-xs text-slate-500">{formatDateTime(item.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">User management snapshot</h3>
            <Link href="/admin/users" className="text-sm font-semibold text-rose-700 hover:text-rose-800">
              Open full table
            </Link>
          </div>

          {!users.length ? (
            <EmptyState title="No users" description="User profiles will appear here after signup." />
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 8).map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="py-2 text-slate-700">{row.email}</td>
                      <td className="py-2 capitalize text-slate-700">{row.role}</td>
                      <td className="py-2">
                        <Badge tone={row.is_suspended ? "danger" : "success"}>{row.is_suspended ? "Suspended" : "Active"}</Badge>
                      </td>
                      <td className="py-2 text-slate-700">{row.donor_city || row.hospital_city || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}

