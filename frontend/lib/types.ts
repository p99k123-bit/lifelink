export type AppRole = "donor" | "hospital" | "admin";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type RequestUrgency = "low" | "medium" | "critical";
export type RequestStatus = "active" | "fulfilled" | "cancelled";

export interface Profile {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
  is_suspended?: boolean;
}

export interface Donor {
  id: string;
  full_name: string | null;
  blood_group: BloodGroup | null;
  city: string | null;
  phone: string | null;
  last_donated_at: string | null;
  next_eligible_at: string | null;
  is_available: boolean;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string | null;
  city: string | null;
  address: string | null;
  contact_phone: string | null;
  created_at: string;
}

export interface EmergencyRequest {
  id: string;
  hospital_id: string;
  blood_group: BloodGroup;
  units: number;
  city: string;
  urgency_level: RequestUrgency;
  status: RequestStatus;
  notes: string | null;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  hospital_id: string | null;
  request_id: string | null;
  donated_on: string;
  units: number;
  blood_group: BloodGroup;
  city: string | null;
  created_at: string;
}
