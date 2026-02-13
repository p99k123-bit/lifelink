import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserConfig, getSupabaseBrowserConfigError } from "./supabase-env";

let browserClient: SupabaseClient | null = null;

function getSupabaseConfig() {
  const config = getSupabaseBrowserConfig();

  if (!config) {
    throw new Error(getSupabaseBrowserConfigError());
  }

  return config;
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseConfig();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}

// Backward-compatible export for legacy files still in the repo.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseBrowserClient() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
