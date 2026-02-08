"use client";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

type RequestItem = {
  id: string;
  hospital_id?: string;
  hospital_name?: string;
  blood_group?: string;
  units?: number;
  city?: string;
  urgency?: string;
  distance?: string;
  status?: string;
  created_at?: string;
};

type DonationRecord = {
  id: string;
  hospital_name?: string;
  units?: number;
  date?: string;
};

export default function DonorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [respondedMap, setRespondedMap] = useState<Record<string, boolean>>({});
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [available, setAvailable] = useState<boolean>(true);
  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const mockRequests: RequestItem[] = [
    { id: "r-mock-1", blood_group: "A+", units: 2, hospital_name: "Apollo Hospital", city: "Bangalore", distance: "5 km", urgency: "Critical", status: "active" },
    { id: "r-mock-2", blood_group: "O-", units: 1, hospital_name: "City Care", city: "Bangalore", distance: "12 km", urgency: "High", status: "active" },
  ];

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const loadProfileAndHistory = async () => {
      setLoadingProfile(true);
      try {
        console.log("DonorDashboard: loading donor profile for", user.id);
        const { data: donorData, error: donorErr } = await supabase.from("donors").select("available,total_donations,last_donation_date,name,blood_group,city").eq("user_id", user.id).single();
        if (donorErr) {
          console.warn("Donor profile fetch warning:", donorErr.message || donorErr);
        } else if (mounted && donorData) {
          setAvailable(Boolean(donorData.available));
          // optionally use other profile fields in UI
          console.log("Donor profile:", donorData);
        }

        // donation history table (if exists)
        const { data: donations, error: donationsErr } = await supabase.from("donations").select("id,hospital_name,units,created_at").eq("donor_id", user.id).order("created_at", { ascending: false });
        if (donationsErr) {
          console.warn("Donation history fetch warning:", donationsErr.message || donationsErr);
          setHistory([]);
        } else {
          setHistory((donations ?? []).map((d: any) => ({ id: d.id, hospital_name: d.hospital_name, units: d.units, date: d.created_at })));
        }
      } catch (err) {
        console.error("Profile/history unexpected error:", err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    loadProfileAndHistory();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        console.log("DonorDashboard: fetching active emergency_requests");
        const { data, error } = await supabase.from("emergency_requests").select("id,hospital_id,hospital_name,blood_group,units,city,urgency,distance,status,created_at").eq("status", "active").order("created_at", { ascending: false });
        if (error) {
          console.warn("Fetch requests warning:", error.message || error);
          if (mounted) setRequests(mockRequests);
        } else {
          if (mounted) setRequests(data ?? []);
        }

        // fetch donor's previous responses to mark responded requests
        const { data: respData, error: respErr } = await supabase.from("responses").select("request_id").eq("donor_id", user.id);
        if (respErr) {
          console.warn("Fetch responses warning:", respErr.message || respErr);
        } else {
          const map: Record<string, boolean> = {};
          (respData ?? []).forEach((r: any) => (map[r.request_id] = true));
          if (mounted) setRespondedMap(map);
        }
      } catch (err) {
        console.error("fetchRequests unexpected error:", err);
        if (mounted) setRequests(mockRequests);
      } finally {
        if (mounted) setLoadingRequests(false);
      }
    };

    fetchRequests();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleRespond = async (requestId: string) => {
    setMessage(null);
    if (!user?.id) {
      setMessage("You must be logged in to respond.");
      return;
    }
    if (respondedMap[requestId]) {
      setMessage("You already responded to this request.");
      return;
    }
    try {
      console.log("Donor responding:", { requestId, donor: user.id });
      const { data, error } = await supabase.from("responses").insert([{ request_id: requestId, donor_id: user.id, status: "pending" }]);
      if (error) {
        console.error("respond insert error:", error);
        setMessage(error.message || "Failed to respond. Check logs.");
        return;
      }
      setRespondedMap((m) => ({ ...m, [requestId]: true }));
      setMessage("Response submitted. Hospital will review.");
      console.log("Response created:", data);
    } catch (err) {
      console.error("Unexpected respond error:", err);
      setMessage("Unexpected error. See console.");
    }
  };

  const toggleAvailability = async () => {
    if (!user?.id) {
      setMessage("You must be logged in to change availability.");
      return;
    }
    const newVal = !available;
    setAvailable(newVal);
    setMessage(null);
    try {
      console.log("Updating donor availability:", user.id, newVal);
      const { error } = await supabase.from("donors").update({ available: newVal }).eq("user_id", user.id);
      if (error) {
        console.error("Update availability error:", error);
        setMessage(error.message || "Failed to update availability.");
        setAvailable(!newVal); // revert
        return;
      }
      setMessage(newVal ? "Marked available." : "Marked not available.");
    } catch (err) {
      console.error("Unexpected update availability error:", err);
      setMessage("Unexpected error. See console.");
      setAvailable(!newVal); // revert
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      setMessage("Logout failed. See console.");
    }
  };

  return (
    <ProtectedRoute role={"donor"}>
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">BloodLine — Donor</h1>
            <p className="text-sm text-gray-600">Welcome{user?.email ? `, ${user.email}` : ""}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700">D</div>
            <button onClick={handleLogout} className="px-3 py-1 border rounded text-sm">Logout</button>
          </div>
        </header>

        <section className="mb-6">
          <div className="p-4 border rounded shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Quick Status</h2>
              <div className="text-sm text-gray-500">Availability: <span className={available ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{available ? "Available" : "Not Available"}</span></div>
            </div>
            <div>
              <button onClick={toggleAvailability} className="px-4 py-2 bg-red-600 text-white rounded">{available ? "Set Not Available" : "Set Available"}</button>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Emergency Requests Near You</h3>
          {message && <div className="mb-3 text-sm text-red-600">{message}</div>}
          {loadingRequests ? (
            <div>Loading requests...</div>
          ) : (
            <div className="space-y-3">
              {requests.length === 0 && <div className="text-sm text-gray-500">No active requests nearby.</div>}
              {requests.map((r) => (
                <div key={r.id} className="p-3 border rounded flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 text-center font-bold text-red-600">{r.blood_group}</div>
                    <div>
                      <div className="font-medium">{r.hospital_name ?? r.hospital_id ?? "Hospital"}</div>
                      <div className="text-sm text-gray-500">{r.units} unit(s) — {r.distance ?? r.city} — {r.urgency}</div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleRespond(r.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      disabled={Boolean(respondedMap[r.id])}
                    >
                      {respondedMap[r.id] ? "Responded" : "Respond"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Donation History</h3>
          {loadingProfile ? (
            <div>Loading history...</div>
          ) : (
            <div className="p-3 border rounded">
              {history.length === 0 ? (
                <div className="text-sm text-gray-500">No donations recorded.</div>
              ) : (
                <ul className="list-disc pl-5">
                  {history.map((h) => (
                    <li key={h.id}>{h.date ? new Date(h.date).toLocaleDateString() : "Date unknown"} — {h.hospital_name ?? "Hospital"} — {h.units ?? 1} unit(s)</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
