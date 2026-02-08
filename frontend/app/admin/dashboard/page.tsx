"use client";
import React from "react";
import ProtectedRoute from "../../../../frontend/components/ProtectedRoute";

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome, admin.</p>
      </div>
    </ProtectedRoute>
  );
}
