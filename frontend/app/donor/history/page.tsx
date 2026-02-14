import { Calendar, Droplets, Timer } from "lucide-react";
import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { StatCard } from "../../../components/dashboard/stat-card";
import { EmptyState } from "../../../components/ui/empty-state";
import { Table, TD, TH, THead, TR } from "../../../components/ui/table";
import { requireRole } from "../../../lib/auth-server";
import { formatDate } from "../../../lib/format";
import { getDonorHistory } from "../../../lib/services/donor";

const donorNav = [
  { href: "/donor/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/donor/profile", label: "Profile", icon: "profile" as const },
  { href: "/donor/history", label: "History", icon: "history" as const },
];

export default async function DonorHistoryPage() {
  const { supabase, user } = await requireRole("donor");
  const history = await getDonorHistory(supabase, user.id);

  const totalUnits = history.reduce((sum, donation) => sum + (donation.units || 0), 0);
  const lastDonation = history[0]?.donated_on ?? null;

  return (
    <DashboardShell
      title="Donation History"
      subtitle="Chronological log of your verified donations."
      roleLabel="Donor"
      email={user.email ?? "donor@bloodline"}
      navItems={donorNav}
    >
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Donation events" value={String(history.length)} hint="Total records" icon={Calendar} />
          <StatCard title="Total units donated" value={`${totalUnits} units`} hint="All-time contribution" icon={Droplets} />
          <StatCard title="Last donation" value={formatDate(lastDonation)} hint="Most recent event" icon={Timer} />
        </section>

        {!history.length ? (
          <EmptyState title="No history available" description="Donation records will appear here after your first completed donation." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Date</TH>
                <TH>Blood group</TH>
                <TH>Units</TH>
                <TH>City</TH>
                <TH>Hospital ID</TH>
                <TH>Request ID</TH>
              </tr>
            </THead>
            <tbody>
              {history.map((donation) => (
                <TR key={donation.id}>
                  <TD>{formatDate(donation.donated_on)}</TD>
                  <TD>{donation.blood_group}</TD>
                  <TD>{donation.units}</TD>
                  <TD>{donation.city || "-"}</TD>
                  <TD>{donation.hospital_id || "-"}</TD>
                  <TD>{donation.request_id || "Direct"}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}

