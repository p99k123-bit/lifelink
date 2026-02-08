"use client";
import React from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
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
    <ProtectedRoute role={"admin"}>
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
            <p className="text-sm text-gray-600">
              {user?.email ?? "Administrator"}
            </p>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 border rounded"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Donors</div>
            <div className="text-2xl font-bold">1,240</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Hospitals</div>
            <div className="text-2xl font-bold">82</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Active Requests</div>
            <div className="text-2xl font-bold">14</div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <div className="p-3 border rounded">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>john@gmail.com</td>
                  <td>Donor</td>
                  <td>
                    <button className="px-2 py-1 border rounded">
                      Change role
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>apollo@hosp.com</td>
                  <td>Hospital</td>
                  <td>
                    <button className="px-2 py-1 border rounded">
                      Change role
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
