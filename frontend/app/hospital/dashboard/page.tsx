"use client";
import React from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function HospitalDashboard() {
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

  return (
    <ProtectedRoute role={"hospital"}>
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Apollo Hospital</h1>
            <p className="text-sm text-gray-600">
              {user?.email ?? "Hospital account"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 border rounded">
              Create Emergency Request
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 border rounded"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Active Requests</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">O+ — 2 units</div>
                <div className="text-sm text-gray-500">
                  Critical — 12 donors notified
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-green-600 text-white rounded">
                  Mark fulfilled
                </button>
                <button className="px-2 py-1 border rounded">Cancel</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Donor Responses</h3>
          <div className="p-3 border rounded">
            <ul>
              <li>
                Ramesh (O+) – ETA: 30 mins –{" "}
                <button className="ml-2 px-2 py-1 border rounded">
                  Approve
                </button>
              </li>
              <li>
                Sita (O+) – ETA: 45 mins –{" "}
                <button className="ml-2 px-2 py-1 border rounded">
                  Approve
                </button>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
