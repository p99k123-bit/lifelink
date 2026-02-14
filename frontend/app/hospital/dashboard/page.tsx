import Link from "next/link";
import { Building2, Droplets, FileWarning, HandHeart } from "lucide-react";
import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { SectionHeader } from "../../../components/dashboard/section-header";
import { StatCard } from "../../../components/dashboard/stat-card";
import { EmergencyRequestForm } from "../../../components/forms/emergency-request-form";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { Table, TD, TH, THead, TR } from "../../../components/ui/table";
import { requireRole } from "../../../lib/auth-server";
import { formatDateTime } from "../../../lib/format";
import { getHospitalDashboardData, searchDonors } from "../../../lib/services/hospital";

const hospitalNav = [
  { href: "/hospital/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/hospital/requests", label: "Requests", icon: "requests" as const },
  { href: "/hospital/donors", label: "Donors", icon: "donors" as const },
];

export default async function HospitalDashboardPage() {
  const { supabase, user } = await requireRole("hospital");
  const data = await getHospitalDashboardData(supabase, user.id);
  const donorMatches = await searchDonors(supabase, {}, 6);

  return (
    <DashboardShell
      title="Hospital Dashboard"
      subtitle="Manage emergency requests, donor outreach, and stock visibility."
      roleLabel="Hospital"
      email={user.email ?? "hospital@bloodline"}
      navItems={hospitalNav}
    >
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Blood stock groups" value={String(data.inventory.length)} hint="Distinct groups tracked" icon={Droplets} />
          <StatCard title="Active requests" value={String(data.activeRequests.length)} hint="Pending emergency demand" icon={FileWarning} />
          <StatCard title="Donation logs" value={String(data.donationLogs.length)} hint="Most recent completed records" icon={HandHeart} />
          <StatCard title="Facility" value={data.hospital?.name || "Hospital"} hint={data.hospital?.city || "City not set"} icon={Building2} />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <SectionHeader
              title="Blood stock overview"
              description="Current hospital inventory by blood group."
              action={<EmergencyRequestForm />}
            />

            {!data.inventory.length ? (
              <EmptyState
                title="No inventory entries"
                description="Add blood stock rows in your Supabase inventory table to monitor stock in real time."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.inventory.map((row) => (
                  <div key={row.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <p className="text-lg font-semibold text-slate-900">{row.blood_group}</p>
                    <p className="text-sm text-slate-600">{row.units} units in stock</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader
              title="Active requests"
              description="Latest unresolved emergency demand from your hospital."
              action={
                <Link href="/hospital/requests" className="text-sm font-semibold text-rose-700 hover:text-rose-800">
                  View all
                </Link>
              }
            />

            {!data.activeRequests.length ? (
              <EmptyState title="No active requests" description="Create an emergency request when urgent stock is needed." />
            ) : (
              <div className="space-y-3">
                {data.activeRequests.slice(0, 5).map((request) => (
                  <article key={request.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800">
                        {request.blood_group} - {request.units} unit{request.units > 1 ? "s" : ""}
                      </p>
                      <Badge tone={request.urgency_level === "critical" ? "danger" : request.urgency_level === "medium" ? "warning" : "info"}>
                        {request.urgency_level}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{request.city}</p>
                    <p className="mt-1 text-xs text-slate-500">Created {formatDateTime(request.created_at)}</p>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <SectionHeader
              title="Potential donor matches"
              description="Quick snapshot of available donors."
              action={
                <Link href="/hospital/donors" className="text-sm font-semibold text-rose-700 hover:text-rose-800">
                  Search donors
                </Link>
              }
            />

            {!donorMatches.length ? (
              <EmptyState title="No donors found" description="Try broadening city and blood group filters." />
            ) : (
              <div className="space-y-2.5">
                {donorMatches.map((donor) => (
                  <div key={donor.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-800">{donor.full_name || "Unnamed donor"}</p>
                      <p className="text-slate-600">
                        {donor.blood_group || "N/A"} - {donor.city || "City unknown"}
                      </p>
                    </div>
                    {donor.phone ? (
                      <a href={`tel:${donor.phone}`} className="rounded-lg bg-sky-50 px-3 py-1.5 font-semibold text-sky-700 hover:bg-sky-100">
                        Contact donor
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No phone</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader title="Donation logs" description="Most recent donation records linked to your hospital." />
            {!data.donationLogs.length ? (
              <EmptyState title="No donation logs" description="Completed donations will appear here automatically." />
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Date</TH>
                    <TH>Blood</TH>
                    <TH>Units</TH>
                    <TH>City</TH>
                  </tr>
                </THead>
                <tbody>
                  {data.donationLogs.map((entry) => (
                    <TR key={entry.id}>
                      <TD>{formatDateTime(entry.donated_on)}</TD>
                      <TD>{entry.blood_group}</TD>
                      <TD>{entry.units}</TD>
                      <TD>{entry.city || "-"}</TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}

