import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../supabaseClient";
import type { Profile } from "../types";

export interface AdminDashboardData {
  totalDonors: number;
  totalHospitals: number;
  activeRequests: number;
  bloodGroupDistribution: Array<{ blood_group: string; count: number }>;
  recentActivity: Array<{ id: string; type: string; summary: string; created_at: string }>;
}

export interface AdminUserRow extends Profile {
  donor_city?: string | null;
  hospital_city?: string | null;
}

export async function getAdminDashboardData(supabase: SupabaseClient): Promise<AdminDashboardData> {
  const [donorsCount, hospitalsCount, activeRequestsCount, distributionResult, activityResult] = await Promise.all([
    supabase.from("donors").select("id", { count: "exact", head: true }),
    supabase.from("hospitals").select("id", { count: "exact", head: true }),
    supabase.from("emergency_requests").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("donors")
      .select("blood_group")
      .not("blood_group", "is", null),
    supabase
      .from("activity_logs")
      .select("id,type,summary,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (donorsCount.error) {
    throw new Error(donorsCount.error.message);
  }

  if (hospitalsCount.error) {
    throw new Error(hospitalsCount.error.message);
  }

  if (activeRequestsCount.error) {
    throw new Error(activeRequestsCount.error.message);
  }

  if (distributionResult.error) {
    throw new Error(distributionResult.error.message);
  }

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  const groups = new Map<string, number>();
  (distributionResult.data ?? []).forEach((row) => {
    if (!row.blood_group) {
      return;
    }

    groups.set(row.blood_group, (groups.get(row.blood_group) ?? 0) + 1);
  });

  return {
    totalDonors: donorsCount.count ?? 0,
    totalHospitals: hospitalsCount.count ?? 0,
    activeRequests: activeRequestsCount.count ?? 0,
    bloodGroupDistribution: Array.from(groups.entries()).map(([blood_group, count]) => ({ blood_group, count })),
    recentActivity:
      activityResult.data?.map((row) => ({
        id: row.id,
        type: row.type,
        summary: row.summary,
        created_at: row.created_at,
      })) ?? [],
  };
}

export async function getAdminUsers(supabase: SupabaseClient) {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id,email,role,created_at,is_suspended")
    .order("created_at", { ascending: false })
    .returns<AdminUserRow[]>();

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const ids = (profiles ?? []).map((item) => item.id);
  if (!ids.length) {
    return [];
  }

  const [donorsResult, hospitalsResult] = await Promise.all([
    supabase.from("donors").select("id,city").in("id", ids),
    supabase.from("hospitals").select("id,city").in("id", ids),
  ]);

  if (donorsResult.error) {
    throw new Error(donorsResult.error.message);
  }

  if (hospitalsResult.error) {
    throw new Error(hospitalsResult.error.message);
  }

  const donorById = new Map((donorsResult.data ?? []).map((row) => [row.id, row.city]));
  const hospitalById = new Map((hospitalsResult.data ?? []).map((row) => [row.id, row.city]));

  return (profiles ?? []).map((profile) => ({
    ...profile,
    donor_city: donorById.get(profile.id) ?? null,
    hospital_city: hospitalById.get(profile.id) ?? null,
  }));
}

export async function setUserSuspension(userId: string, isSuspended: boolean) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: isSuspended })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteUserProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAdminAnalytics(supabase: SupabaseClient) {
  const [requestsResult, donationsResult, activityResult] = await Promise.all([
    supabase
      .from("emergency_requests")
      .select("id,created_at,status"),
    supabase
      .from("donations")
      .select("id,created_at,blood_group"),
    supabase
      .from("activity_logs")
      .select("id,type,summary,created_at")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  if (requestsResult.error) {
    throw new Error(requestsResult.error.message);
  }

  if (donationsResult.error) {
    throw new Error(donationsResult.error.message);
  }

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const byMonth = new Map<string, { requests: number; donations: number }>();

  const ensureMonth = (date: Date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth.has(key)) {
      byMonth.set(key, { requests: 0, donations: 0 });
    }
    return key;
  };

  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    ensureMonth(date);
  }

  (requestsResult.data ?? []).forEach((item) => {
    const date = new Date(item.created_at);
    const key = ensureMonth(date);
    byMonth.get(key)!.requests += 1;
  });

  (donationsResult.data ?? []).forEach((item) => {
    const date = new Date(item.created_at);
    const key = ensureMonth(date);
    byMonth.get(key)!.donations += 1;
  });

  const monthlyTimeline = Array.from(byMonth.entries()).map(([key, value]) => {
    const [year, month] = key.split("-");
    const label = monthFormatter.format(new Date(Number(year), Number(month) - 1, 1));
    return { label, ...value };
  });

  return {
    monthlyTimeline,
    recentActivity: activityResult.data ?? [],
  };
}
