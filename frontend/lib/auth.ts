import type { AppRole } from "./types";

const DASHBOARD_BY_ROLE: Record<AppRole, string> = {
  donor: "/donor/dashboard",
  hospital: "/hospital/dashboard",
  admin: "/admin/dashboard",
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  return value === "donor" || value === "hospital" || value === "admin";
}

export function getDashboardPath(role: AppRole) {
  return DASHBOARD_BY_ROLE[role];
}

export function getRequiredRoleForPath(pathname: string): AppRole | null {
  if (pathname.startsWith("/donor")) {
    return "donor";
  }

  if (pathname.startsWith("/hospital")) {
    return "hospital";
  }

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  return null;
}
