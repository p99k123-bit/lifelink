import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { SectionHeader } from "../../../components/dashboard/section-header";
import { EmergencyRequestForm } from "../../../components/forms/emergency-request-form";
import { RequestStatusActions } from "../../../components/forms/request-status-actions";
import { Badge } from "../../../components/ui/badge";
import { EmptyState } from "../../../components/ui/empty-state";
import { Table, TD, TH, THead, TR } from "../../../components/ui/table";
import { requireRole } from "../../../lib/auth-server";
import { formatDateTime } from "../../../lib/format";
import { getHospitalRequests } from "../../../lib/services/hospital";

const hospitalNav = [
  { href: "/hospital/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/hospital/requests", label: "Requests", icon: "requests" as const },
  { href: "/hospital/donors", label: "Donors", icon: "donors" as const },
];

export default async function HospitalRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase, user } = await requireRole("hospital");
  const params = await searchParams;
  const statusFilter = typeof params.status === "string" ? params.status : "all";
  const urgencyFilter = typeof params.urgency === "string" ? params.urgency : "all";

  const requests = await getHospitalRequests(supabase, user.id);
  const filtered = requests.filter((request) => {
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false;
    }

    if (urgencyFilter !== "all" && request.urgency_level !== urgencyFilter) {
      return false;
    }

    return true;
  });

  return (
    <DashboardShell
      title="Emergency Requests"
      subtitle="Filter, monitor, and close emergency requests."
      roleLabel="Hospital"
      email={user.email ?? "hospital@bloodline"}
      navItems={hospitalNav}
    >
      <div className="space-y-4">
        <SectionHeader title="Request queue" description="Filter by status and urgency to focus response teams." action={<EmergencyRequestForm />} />

        <form className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-3" method="GET">
          <label className="text-sm text-slate-600">
            Status
            <select name="status" defaultValue={statusFilter} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="text-sm text-slate-600">
            Urgency
            <select name="urgency" defaultValue={urgencyFilter} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Apply filters
            </button>
          </div>
        </form>

        {!filtered.length ? (
          <EmptyState title="No matching requests" description="Adjust filters or create a new emergency request." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Created</TH>
                <TH>Blood group</TH>
                <TH>Units</TH>
                <TH>City</TH>
                <TH>Urgency</TH>
                <TH>Status</TH>
                <TH>Actions</TH>
              </tr>
            </THead>
            <tbody>
              {filtered.map((request) => (
                <TR key={request.id}>
                  <TD>{formatDateTime(request.created_at)}</TD>
                  <TD>{request.blood_group}</TD>
                  <TD>{request.units}</TD>
                  <TD>{request.city}</TD>
                  <TD>
                    <Badge tone={request.urgency_level === "critical" ? "danger" : request.urgency_level === "medium" ? "warning" : "info"}>
                      {request.urgency_level}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone={request.status === "active" ? "success" : request.status === "fulfilled" ? "info" : "neutral"}>
                      {request.status}
                    </Badge>
                  </TD>
                  <TD>
                    <RequestStatusActions requestId={request.id} status={request.status} />
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

