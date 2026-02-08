"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
  role?: string; // single-role shorthand used in some pages
};

export default function ProtectedRoute({ children, allowedRoles, role }: Props) {
  const { user, role: userRole, loading } = useAuth();
  const router = useRouter();

  const normalizedAllowed = role ? [role] : allowedRoles ?? [];

  useEffect(() => {
    if (loading) return;
    if (!user) {
      console.log("ProtectedRoute: not logged in, redirecting to /auth/login");
      router.push("/auth/login");
      return;
    }
    if (normalizedAllowed.length && userRole && !normalizedAllowed.includes(userRole)) {
      console.log("ProtectedRoute: role mismatch", { required: normalizedAllowed, actual: userRole });
      router.push("/");
      return;
    }
  }, [user, userRole, loading, router, normalizedAllowed]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  if (normalizedAllowed.length && userRole && !normalizedAllowed.includes(userRole)) return null;
  return <>{children}</>;
}
