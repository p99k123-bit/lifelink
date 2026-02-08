"use client";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

type RequestItem = {
  id: string;
  blood_group?: string;
  units?: number;
  hospital_name?: string;
  city?: string;
  urgency?: string;
  distance?: string;
  created_at?: string;
  status?: string;
};

export default function DonorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [respondedSet, setRespondedSet] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<string | null>(null);

  const mockRequests: RequestItem[] = [
    { id: "r1", blood_group: "AB+", units: 2, hospital_name: "Apollo Hospital", city: "Bangalore", distance: "5 km", urgency: "Critical", status: "active" },
    { id: "r2", blood_group: "O-", units: 1, hospital_name: "City Care", city: "Bangalore", distance: "12 km", urgency: "High", status: "active" },
  ];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      console.log("DonorDashboard: fetching active requests");
      const { data, error } = await supabase.from("requests").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (error) {
        console.warn("fetch requests error:", error);
        setRequests(mockRequests);
      } else {
        // normalize hospital name if joined columns exist
        const normalized = (data ?? []).map((r: any) => ({
          id: r.id,
          blood_group: r.blood_group,
          units: r.units,
          hospital_name: r.hospital_name ?? r.hospital?.name ?? r.created_by_name ?? "Hospital",
          city: r.city,
          urgency: r.urgency,
          distance: r.distance,
          created_at: r.created_at,
          status: r.status,
        }));
        setRequests(normalized);
      }

      // fetch donor's existing responses to disable duplicates
      if (user?.id) {
        const { data: respData, error: respErr } = await supabase.from("responses").select("request_id").eq("donor_id", user.id);
        if (respErr) {
          console.warn("fetch responses error:", respErr);
        } else {
          const map: Record<string, boolean> = {};
          (respData ?? []).forEach((r: any) => (map[r.request_id] = true));
          setRespondedSet(map);
        }
      }
    } catch (err) {
      console.error("Unexpected fetchRequests error:", err);
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRespond = async (requestId: string) => {
    setMsg(null);
    if (!user?.id) {
      setMsg("You must be logged in to respond.");
      return;
    }
    if (respondedSet[requestId]) {
      setMsg("You already responded to this request.");
      return;
    }
    try {
      console.log("Donor responding to request:", requestId, "by", user.id);
      const { data, error } = await supabase.from("responses").insert([{ request_id: requestId, donor_id: user.id, status: "pending" }]);
      if (error) {
        console.error("Respond API error:", error);
        setMsg(error.message || "Failed to respond. See console.");
        return;
      }
      setRespondedSet((s) => ({ ...s, [requestId]: true }));
      setMsg("Response submitted. Hospital will review your offer.");
      console.log("Response record created:", data);
    } catch (err) {
      console.error("Unexpected respond error:", err);
      setMsg("Unexpected error. See console.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      setMsg("Logout failed. See console.");
    }
  };

  return (
    <ProtectedRoute role={"donor"}>
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">BloodLine</h1>
            <p className="text-sm text-gray-600">Welcome, Donor{user?.email ? ` — ${user.email}` : ""}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700">D</div>
            <button onClick={handleLogout} className="px-3 py-1 border rounded text-sm">Logout</button>
          </div>
        </header>

        <section className="mb-6">
          <div className="p-4 border rounded shadow-sm">
            <h2 className="font-semibold mb-2">Quick Status</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500">Blood Group</div>
                <div className="text-lg font-bold">O+</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">City</div>
                <div className="text-lg font-bold">Bangalore</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Availability</div>
                <div className="text-lg font-bold text-green-600">Active</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Emergency Requests Near You</h3>
          {msg && <div className="mb-3 text-sm text-red-600">{msg}</div>}
          {loading ? (
            <div>Loading requests...</div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="p-3 border rounded flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center font-bold text-red-600">{r.blood_group}</div>
                    <div>
                      <div className="font-medium">{r.hospital_name}</div>
                      <div className="text-sm text-gray-500">{r.units} unit(s) — {r.distance ?? r.city} — {r.urgency}</div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleRespond(r.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      disabled={Boolean(respondedSet[r.id])}
                    >
                      {respondedSet[r.id] ? "Responded" : "Respond"}
                    </button>
                  </div>
                </div>
              ))}
              {requests.length === 0 && <div className="text-sm text-gray-500">No active requests nearby.</div>}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
