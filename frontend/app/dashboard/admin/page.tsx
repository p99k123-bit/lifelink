"use client";
import React from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import AdminDashboard from "../../admin/dashboard/page";

export default function AdminDashboardAlias() {
  return <ProtectedRoute role={"admin"}><AdminDashboard /></ProtectedRoute>;
}
