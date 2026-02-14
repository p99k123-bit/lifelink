import { CalendarClock, Droplets, HeartHandshake, ShieldCheck } from "lucide-react";
import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { SectionHeader } from "../../../components/dashboard/section-header";
import { StatCard } from "../../../components/dashboard/stat-card";
import { DonorProfileEditor } from "../../../components/forms/donor-profile-editor";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { Table, TD, TH, THead, TR } from "../../../components/ui/table";
import { requireRole } from "../../../lib/auth-server";
import { formatDate, formatDateTime, formatRelativeDay } from "../../../lib/format";
import { getDonorDashboardData } from "../../../lib/services/donor";

const donorNav = [
  { href: "/donor/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/donor/profile", label: "Profile", icon: "profile" as const },
  { href: "/donor/history", label: "History", icon: "history" as const },
];

export default async function DonorDashboardPage() {
  const { supabase, user } = await requireRole("donor");
  const data = await getDonorDashboardData(supabase, user.id);

  const donorName = data.donor?.full_name || user.email?.split("@")[0] || "Donor";
  const bloodGroup = data.donor?.blood_group || "Not set";
  const latestDonations = data.donations.slice(0, 6);

  return (
    <DashboardShell
      title="Donor Dashboard"
      subtitle="Track eligibility, response opportunities, and donation activity."
      roleLabel="Donor"
      email={user.email ?? "donor@bloodline"}
      navItems={donorNav}
    >
      <div className="space-y-5">
        <Card className="bg-gradient-to-r from-rose-600 to-rose-500 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose-100">Welcome back</p>
              <h2 className="mt-2 text-2xl font-semibold">{donorName}</h2>
              <p className="mt-1 text-sm text-rose-100">Keep your profile current to receive matching emergency requests quickly.</p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Badge tone={data.isEligible ? "success" : "warning"} className="bg-white/90">
                {data.isEligible ? "Eligible" : "Cooldown"}
              </Badge>
              <DonorProfileEditor donor={data.donor} />
            </div>
          </div>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total donations" value={String(data.totalDonations)} hint="Recorded donation events" icon={HeartHandshake} />
          <StatCard title="Total units" value={`${data.totalUnitsDonated} units`} hint="Across all donation visits" icon={Droplets} />
          <StatCard title="Blood group" value={bloodGroup} hint="Used for request matching" icon={ShieldCheck} />
          <StatCard
            title="Next eligible date"
            value={data.nextEligibleAt ? formatDate(data.nextEligibleAt) : "Now"}
            hint={formatRelativeDay(data.nextEligibleAt)}
            icon={CalendarClock}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <SectionHeader title="Recent activity" description="Latest donation records linked to your account." />
            {!latestDonations.length ? (
              <EmptyState title="No donations yet" description="Your first completed donation will appear here." />
            ) : (
              <div className="space-y-3">
                {latestDonations.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">
                        {entry.blood_group} - {entry.units} unit{entry.units > 1 ? "s" : ""}
                      </p>
                      <span className="text-xs text-slate-500">{formatDate(entry.donated_on)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{entry.city || "City not specified"}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader title="Nearby requests" description="Open emergency requests in your city." />
            {!data.nearbyRequests.length ? (
              <EmptyState title="No nearby requests" description="New emergency requests in your city will show up here." />
            ) : (
              <div className="space-y-3">
                {data.nearbyRequests.map((request) => (
                  <div key={request.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">
                        {request.blood_group} - {request.units} unit{request.units > 1 ? "s" : ""}
                      </p>
                      <Badge tone={request.urgency_level === "critical" ? "danger" : request.urgency_level === "medium" ? "warning" : "info"}>
                        {request.urgency_level}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{request.city}</p>
                    <p className="mt-1 text-xs text-slate-500">Created {formatDateTime(request.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section>
          <SectionHeader title="Donation history" description="Auditable log of all recorded donations." />
          {!data.donations.length ? (
            <EmptyState title="History is empty" description="Complete your first donation to start building your timeline." />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Blood group</TH>
                  <TH>Units</TH>
                  <TH>City</TH>
                  <TH>Request</TH>
                </tr>
              </THead>
              <tbody>
                {data.donations.map((entry) => (
                  <TR key={entry.id}>
                    <TD>{formatDate(entry.donated_on)}</TD>
                    <TD>{entry.blood_group}</TD>
                    <TD>{entry.units}</TD>
                    <TD>{entry.city || "-"}</TD>
                    <TD>{entry.request_id || "Direct"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

