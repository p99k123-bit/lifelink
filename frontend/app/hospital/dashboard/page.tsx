"use client";
import React from "react";
import ProtectedRoute from "../../../../frontend/components/ProtectedRoute";

export default function HospitalDashboard() {
  return (
    <ProtectedRoute allowedRoles={["hospital"]}>
      <div>
        <h1>Hospital Dashboard</h1>
        <p>Welcome, hospital user.</p>
      </div>
    </ProtectedRoute>
  );
}
