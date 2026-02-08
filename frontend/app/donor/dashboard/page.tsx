"use client";
import React from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function DonorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const mockRequests = [
    { bg: "AB+", units: 2, hospital: "Apollo Hospital", dist: "5 km" },
    { bg: "O-", units: 1, hospital: "City Care", dist: "12 km" },
  ];

  return (
    <ProtectedRoute role={"donor"}>
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">BloodLine</h1>
            <p className="text-sm text-gray-600">
              Welcome, Donor
              {user?.email ? ` — ${user.email}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700">
              D
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 border rounded text-sm"
            >
              Logout
            </button>
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
            <div className="mt-3">
              <button className="px-3 py-1 bg-red-600 text-white rounded">
                Toggle Availability
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Emergency Requests Near You
          </h3>
          <div className="space-y-3">
            {mockRequests.map((r, i) => (
              <div
                key={i}
                className="p-3 border rounded flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center font-bold text-red-600">
                    {r.bg}
                  </div>
                  <div>
                    <div className="font-medium">{r.hospital}</div>
                    <div className="text-sm text-gray-500">
                      {r.units} unit(s) — {r.dist}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => console.log("Responding to request:", r)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Donation History</h3>
          <div className="p-3 border rounded">
            <ul className="list-disc pl-5">
              <li>Jan 12 – Apollo Hospital – 1 unit</li>
              <li>Nov 04 – City Care – 2 units</li>
            </ul>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
