import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { AdminUserActions } from "../../../components/forms/admin-user-actions";
import { Badge } from "../../../components/ui/badge";
import { EmptyState } from "../../../components/ui/empty-state";
import { Table, TD, TH, THead, TR } from "../../../components/ui/table";
import { requireRole } from "../../../lib/auth-server";
import { formatDate } from "../../../lib/format";
import { getAdminUsers } from "../../../lib/services/admin";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/admin/users", label: "Users", icon: "users" as const },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" as const },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase, user } = await requireRole("admin");
  const params = await searchParams;
  const roleFilter = typeof params.role === "string" ? params.role : "all";
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";

  const users = await getAdminUsers(supabase);

  const filteredUsers = users.filter((item) => {
    if (roleFilter !== "all" && item.role !== roleFilter) {
      return false;
    }

    if (query && !item.email.toLowerCase().includes(query)) {
      return false;
    }

    return true;
  });

  return (
    <DashboardShell
      title="User Management"
      subtitle="Suspend and remove users with strict role governance."
      roleLabel="Admin"
      email={user.email ?? "admin@bloodline"}
      navItems={adminNav}
    >
      <div className="space-y-4">
        <form className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-3" method="GET">
          <label className="text-sm text-slate-600">
            Role
            <select name="role" defaultValue={roleFilter} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="all">All roles</option>
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="text-sm text-slate-600 sm:col-span-2">
            Search email
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="email@domain.com"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <button type="submit" className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 sm:col-span-3">
            Apply filters
          </button>
        </form>

        {!filteredUsers.length ? (
          <EmptyState title="No users found" description="Try changing role or email filters." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Location</TH>
                <TH>Joined</TH>
                <TH>Actions</TH>
              </tr>
            </THead>
            <tbody>
              {filteredUsers.map((item) => (
                <TR key={item.id}>
                  <TD>{item.email}</TD>
                  <TD className="capitalize">{item.role}</TD>
                  <TD>
                    <Badge tone={item.is_suspended ? "danger" : "success"}>{item.is_suspended ? "Suspended" : "Active"}</Badge>
                  </TD>
                  <TD>{item.donor_city || item.hospital_city || "-"}</TD>
                  <TD>{formatDate(item.created_at)}</TD>
                  <TD>
                    <AdminUserActions userId={item.id} email={item.email} isSuspended={Boolean(item.is_suspended)} />
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}

