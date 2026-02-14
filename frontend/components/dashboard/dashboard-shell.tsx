"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Users,
  X,
} from "lucide-react";
import { signOut } from "../../lib/services/auth";
import { cn } from "../../lib/cn";
import { Button } from "../ui/button";

export type DashboardNavIcon = "dashboard" | "profile" | "history" | "requests" | "donors" | "users" | "analytics";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: DashboardNavIcon;
}

const ICONS = {
  dashboard: LayoutDashboard,
  profile: User,
  history: Activity,
  requests: ClipboardList,
  donors: Users,
  users: Users,
  analytics: BarChart3,
} as const;

export function DashboardShell({
  title,
  subtitle,
  roleLabel,
  email,
  navItems,
  children,
}: {
  title: string;
  subtitle: string;
  roleLabel: string;
  email: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    try {
      setSigningOut(true);
      await signOut();
      router.replace("/auth/login");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-sky-50">
      <div className="mx-auto flex w-full max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur transition md:static md:z-auto md:w-72 md:translate-x-0 md:rounded-2xl md:border md:shadow-[0_20px_50px_-25px_rgba(2,6,23,0.4)]",
            menuOpen ? "translate-x-0" : "",
          )}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">BloodLine</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{roleLabel} Portal</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = ICONS[item.icon] ?? LayoutDashboard;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                      : "text-slate-700 hover:bg-rose-50 hover:text-rose-700",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="mb-4 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.45)] backdrop-blur sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="mt-0.5 rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                  <p className="text-sm text-slate-500">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Signed in</p>
                  <p className="text-sm font-medium text-slate-700">{email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={signingOut}>
                  <LogOut className="mr-1.5 h-4 w-4" />
                  {signingOut ? "Signing out..." : "Logout"}
                </Button>
              </div>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>

      {menuOpen ? (
        <button
          type="button"
          aria-label="Close overlay"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </div>
  );
}
