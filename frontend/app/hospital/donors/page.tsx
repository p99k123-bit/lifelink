import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { Badge } from "../../../components/ui/badge";
import { EmptyState } from "../../../components/ui/empty-state";
import { Table, TD, TH, THead, TR } from "../../../components/ui/table";
import { requireRole } from "../../../lib/auth-server";
import { formatDate } from "../../../lib/format";
import { searchDonors } from "../../../lib/services/hospital";

const hospitalNav = [
  { href: "/hospital/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/hospital/requests", label: "Requests", icon: "requests" as const },
  { href: "/hospital/donors", label: "Donors", icon: "donors" as const },
];

const bloodGroups = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export default async function HospitalDonorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase, user } = await requireRole("hospital");
  const params = await searchParams;

  const bloodGroup = typeof params.blood_group === "string" ? params.blood_group : "all";
  const city = typeof params.city === "string" ? params.city : "";

  const donors = await searchDonors(
    supabase,
    {
      bloodGroup: bloodGroup !== "all" ? bloodGroup : undefined,
      city: city || undefined,
    },
    100,
  );

  return (
    <DashboardShell
      title="Donor Discovery"
      subtitle="Search verified donors by blood group and city."
      roleLabel="Hospital"
      email={user.email ?? "hospital@bloodline"}
      navItems={hospitalNav}
    >
      <div className="space-y-4">
        <form className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-4" method="GET">
          <label className="text-sm text-slate-600">
            Blood group
            <select name="blood_group" defaultValue={bloodGroup} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group === "all" ? "All groups" : group}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-600 sm:col-span-2">
            City
            <input
              type="text"
              name="city"
              defaultValue={city}
              placeholder="Search by city"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Search donors
            </button>
          </div>
        </form>

        {!donors.length ? (
          <EmptyState title="No donors found" description="Try removing one of the filters to broaden the search." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Name</TH>
                <TH>Blood group</TH>
                <TH>City</TH>
                <TH>Availability</TH>
                <TH>Next eligible</TH>
                <TH>Contact</TH>
              </tr>
            </THead>
            <tbody>
              {donors.map((donor) => (
                <TR key={donor.id}>
                  <TD>{donor.full_name || "Unnamed donor"}</TD>
                  <TD>{donor.blood_group || "-"}</TD>
                  <TD>{donor.city || "-"}</TD>
                  <TD>
                    <Badge tone={donor.is_available ? "success" : "neutral"}>{donor.is_available ? "Available" : "Unavailable"}</Badge>
                  </TD>
                  <TD>{formatDate(donor.next_eligible_at)}</TD>
                  <TD>
                    {donor.phone ? (
                      <a href={`tel:${donor.phone}`} className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                        Contact donor
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No phone</span>
                    )}
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

