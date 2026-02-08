"use client";
import React from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import DonorDashboard from "../../donor/dashboard/page";

export default function DonorDashboardAlias() {
  return <ProtectedRoute role={"donor"}><DonorDashboard /></ProtectedRoute>;
}
