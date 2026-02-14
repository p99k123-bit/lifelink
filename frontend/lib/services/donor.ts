import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../supabaseClient";
import type { Donation, Donor, EmergencyRequest, Profile } from "../types";

export interface DonorDashboardData {
  profile: Profile;
  donor: Donor | null;
  donations: Donation[];
  totalUnitsDonated: number;
  totalDonations: number;
  nextEligibleAt: string | null;
  isEligible: boolean;
  nearbyRequests: EmergencyRequest[];
}

const ELIGIBILITY_DAYS = 90;

function addDays(dateISO: string, days: number) {
  const date = new Date(dateISO);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function resolveEligibility(donor: Donor | null, donations: Donation[]) {
  const now = new Date();
  const newestDonation = donations[0]?.donated_on ?? donor?.last_donated_at ?? null;
  const nextEligibleAt = donor?.next_eligible_at ?? (newestDonation ? addDays(newestDonation, ELIGIBILITY_DAYS) : null);

  if (!nextEligibleAt) {
    return { isEligible: true, nextEligibleAt: null };
  }

  return {
    isEligible: new Date(nextEligibleAt) <= now,
    nextEligibleAt,
  };
}

async function loadDonorProfileData(supabase: SupabaseClient, userId: string) {
  const [profileResult, donorResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,role,created_at,is_suspended")
      .eq("id", userId)
      .single<Profile>(),
    supabase
      .from("donors")
      .select("id,full_name,blood_group,city,phone,last_donated_at,next_eligible_at,is_available,created_at")
      .eq("id", userId)
      .maybeSingle<Donor>(),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (donorResult.error) {
    throw new Error(donorResult.error.message);
  }

  return {
    profile: profileResult.data,
    donor: donorResult.data,
  };
}

export async function getDonorDashboardData(supabase: SupabaseClient, userId: string): Promise<DonorDashboardData> {
  const { profile, donor } = await loadDonorProfileData(supabase, userId);

  const { data: donations, error: donationsError } = await supabase
    .from("donations")
    .select("id,donor_id,hospital_id,request_id,donated_on,units,blood_group,city,created_at")
    .eq("donor_id", userId)
    .order("donated_on", { ascending: false })
    .limit(12)
    .returns<Donation[]>();

  if (donationsError) {
    throw new Error(donationsError.message);
  }

  const donorDonations = donations ?? [];
  const totalUnitsDonated = donorDonations.reduce((sum, item) => sum + (item.units || 0), 0);
  const totalDonations = donorDonations.length;
  const { isEligible, nextEligibleAt } = resolveEligibility(donor, donorDonations);

  let nearbyRequests: EmergencyRequest[] = [];
  if (donor?.city) {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select("id,hospital_id,blood_group,units,city,urgency_level,status,notes,created_at")
      .eq("city", donor.city)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<EmergencyRequest[]>();

    if (error) {
      throw new Error(error.message);
    }

    nearbyRequests = data ?? [];
  }

  return {
    profile,
    donor,
    donations: donorDonations,
    totalUnitsDonated,
    totalDonations,
    nextEligibleAt,
    isEligible,
    nearbyRequests,
  };
}

export async function getDonorHistory(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("donations")
    .select("id,donor_id,hospital_id,request_id,donated_on,units,blood_group,city,created_at")
    .eq("donor_id", userId)
    .order("donated_on", { ascending: false })
    .returns<Donation[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export interface DonorProfileUpdateInput {
  full_name: string;
  phone: string;
  city: string;
  blood_group: string;
  last_donated_at?: string | null;
  is_available: boolean;
}

export async function updateDonorProfile(input: DonorProfileUpdateInput) {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || "You must be logged in to update profile.");
  }

  const { error } = await supabase.from("donors").upsert(
    {
      id: user.id,
      ...input,
      next_eligible_at: input.last_donated_at ? addDays(input.last_donated_at, ELIGIBILITY_DAYS) : null,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}
