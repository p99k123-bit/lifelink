import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";
import { isAppRole } from "./auth";
import {
  getSupabaseServerConfig,
  getSupabaseServerConfigError,
  isSupabaseServerConfigured,
} from "./supabase-env";
import type { AppRole, Profile } from "./types";

export function hasSupabaseServerConfig() {
  return isSupabaseServerConfigured();
}

export function getSupabaseServerSetupError() {
  return getSupabaseServerConfigError();
}

export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const cookieStore = await cookies();
  const config = getSupabaseServerConfig();

  if (!config) {
    return null;
  }

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: Record<string, unknown>) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

export function createSupabaseMiddlewareClient(req: NextRequest, res: NextResponse): SupabaseClient | null {
  const config = getSupabaseServerConfig();

  if (!config) {
    return null;
  }

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        req.cookies.set({ name, value, ...options });
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: Record<string, unknown>) {
        req.cookies.set({ name, value: "", ...options });
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });
}

export async function getRoleForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,created_at,is_suspended")
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !isAppRole(data.role) || data.is_suspended) {
    return null;
  }

  return data.role;
}

export async function getCurrentUserAndRole() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      supabase: null,
      user: null,
      role: null as AppRole | null,
      configurationError: getSupabaseServerConfigError(),
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
      role: null as AppRole | null,
      configurationError: null as string | null,
    };
  }

  const role = await getRoleForUser(supabase, user.id);

  return {
    supabase,
    user,
    role,
    configurationError: null as string | null,
  };
}

export async function requireRole(requiredRole: AppRole) {
  const { supabase, user, role } = await getCurrentUserAndRole();

  if (!supabase) {
    redirect("/auth/setup");
  }

  if (!user) {
    redirect("/auth/login");
  }

  if (!role || role !== requiredRole) {
    redirect("/403");
  }

  return { supabase, user: user as User, role };
}
