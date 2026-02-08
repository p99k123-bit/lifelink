"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      console.log("ProtectedRoute: not logged in, redirecting to /auth/login");
      router.push("/auth/login");
      return;
    }
    if (allowedRoles?.length && role && !allowedRoles.includes(role)) {
      console.log("ProtectedRoute: role mismatch", { required: allowedRoles, actual: role });
      router.push("/");
      return;
    }
  }, [user, role, loading, router, allowedRoles]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  if (allowedRoles?.length && role && !allowedRoles.includes(role)) return null;
  return <>{children}</>;
}
