import { Activity, Mail, MapPin, Phone } from "lucide-react";
import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { DonorProfileEditor } from "../../../components/forms/donor-profile-editor";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { requireRole } from "../../../lib/auth-server";
import { formatDate } from "../../../lib/format";
import { getDonorDashboardData } from "../../../lib/services/donor";

const donorNav = [
  { href: "/donor/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/donor/profile", label: "Profile", icon: "profile" as const },
  { href: "/donor/history", label: "History", icon: "history" as const },
];

export default async function DonorProfilePage() {
  const { supabase, user } = await requireRole("donor");
  const data = await getDonorDashboardData(supabase, user.id);
  const donor = data.donor;

  return (
    <DashboardShell
      title="Donor Profile"
      subtitle="Keep details accurate so hospitals can reach you quickly."
      roleLabel="Donor"
      email={user.email ?? "donor@bloodline"}
      navItems={donorNav}
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{donor?.full_name || "Profile incomplete"}</h2>
              <p className="mt-1 text-sm text-slate-500">Update your information to improve emergency matching accuracy.</p>
            </div>
            <DonorProfileEditor donor={donor} />
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                <Mail className="h-4 w-4 text-slate-500" />
                {user.email}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Phone</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                <Phone className="h-4 w-4 text-slate-500" />
                {donor?.phone || "Not set"}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">City</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                <MapPin className="h-4 w-4 text-slate-500" />
                {donor?.city || "Not set"}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Last donation</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                <Activity className="h-4 w-4 text-slate-500" />
                {formatDate(donor?.last_donated_at)}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-slate-900">Availability</h3>
          <p className="mt-2 text-sm text-slate-600">Status used by hospitals when searching emergency-ready donors.</p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Donation eligibility</p>
              <div className="mt-2">
                <Badge tone={data.isEligible ? "success" : "warning"}>{data.isEligible ? "Eligible" : "Cooldown"}</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Request availability</p>
              <div className="mt-2">
                <Badge tone={donor?.is_available ? "success" : "neutral"}>{donor?.is_available ? "Visible to hospitals" : "Hidden"}</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

