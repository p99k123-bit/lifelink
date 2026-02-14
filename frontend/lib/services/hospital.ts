import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../supabaseClient";
import type { BloodGroup, Donation, Donor, EmergencyRequest, Hospital, RequestStatus, RequestUrgency } from "../types";

export interface BloodInventoryRow {
  id: string;
  hospital_id: string;
  blood_group: BloodGroup;
  units: number;
  created_at: string;
}

export interface HospitalDashboardData {
  hospital: Hospital | null;
  inventory: BloodInventoryRow[];
  activeRequests: EmergencyRequest[];
  donationLogs: Donation[];
}

export interface DonorSearchFilters {
  bloodGroup?: string;
  city?: string;
}

export async function getHospitalDashboardData(supabase: SupabaseClient, userId: string): Promise<HospitalDashboardData> {
  const [hospitalResult, inventoryResult, requestsResult, donationsResult] = await Promise.all([
    supabase
      .from("hospitals")
      .select("id,name,city,address,contact_phone,created_at")
      .eq("id", userId)
      .maybeSingle<Hospital>(),
    supabase
      .from("blood_inventory")
      .select("id,hospital_id,blood_group,units,created_at")
      .eq("hospital_id", userId)
      .order("blood_group", { ascending: true })
      .returns<BloodInventoryRow[]>(),
    supabase
      .from("emergency_requests")
      .select("id,hospital_id,blood_group,units,city,urgency_level,status,notes,created_at")
      .eq("hospital_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .returns<EmergencyRequest[]>(),
    supabase
      .from("donations")
      .select("id,donor_id,hospital_id,request_id,donated_on,units,blood_group,city,created_at")
      .eq("hospital_id", userId)
      .order("donated_on", { ascending: false })
      .limit(12)
      .returns<Donation[]>(),
  ]);

  if (hospitalResult.error) {
    throw new Error(hospitalResult.error.message);
  }

  if (inventoryResult.error) {
    throw new Error(inventoryResult.error.message);
  }

  if (requestsResult.error) {
    throw new Error(requestsResult.error.message);
  }

  if (donationsResult.error) {
    throw new Error(donationsResult.error.message);
  }

  return {
    hospital: hospitalResult.data,
    inventory: inventoryResult.data ?? [],
    activeRequests: requestsResult.data ?? [],
    donationLogs: donationsResult.data ?? [],
  };
}

export async function getHospitalRequests(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("emergency_requests")
    .select("id,hospital_id,blood_group,units,city,urgency_level,status,notes,created_at")
    .eq("hospital_id", userId)
    .order("created_at", { ascending: false })
    .returns<EmergencyRequest[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function searchDonors(
  supabase: SupabaseClient,
  filters: DonorSearchFilters,
  limit = 50,
) {
  let query = supabase
    .from("donors")
    .select("id,full_name,blood_group,city,phone,last_donated_at,next_eligible_at,is_available,created_at")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.bloodGroup) {
    query = query.eq("blood_group", filters.bloodGroup);
  }

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  const { data, error } = await query.returns<Donor[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export interface EmergencyRequestInput {
  blood_group: BloodGroup;
  units: number;
  city: string;
  urgency_level: RequestUrgency;
  notes?: string;
}

export async function createEmergencyRequest(input: EmergencyRequestInput) {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || "You must be logged in to create emergency requests.");
  }

  const { error } = await supabase.from("emergency_requests").insert({
    hospital_id: user.id,
    blood_group: input.blood_group,
    units: input.units,
    city: input.city,
    urgency_level: input.urgency_level,
    notes: input.notes ?? null,
    status: "active",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateEmergencyRequestStatus(requestId: string, status: RequestStatus) {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("emergency_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }
}
