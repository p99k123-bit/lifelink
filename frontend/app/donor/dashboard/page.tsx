"use client";
import React from "react";
import ProtectedRoute from "../../../../frontend/components/ProtectedRoute";

export default function DonorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["donor"]}>
      <div>
        <h1>Donor Dashboard</h1>
        <p>Welcome, donor.</p>
      </div>
    </ProtectedRoute>
  );
}
