export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function formatMissing(label: string, values: string[]) {
  return `${label}: ${values.join(", ")}. Open /auth/setup for setup instructions.`;
}

function resolveServerEnv() {
  const publicUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serverUrl = readEnv("SUPABASE_URL");
  const publicAnonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serverAnonKey = readEnv("SUPABASE_ANON_KEY");

  const url = publicUrl || serverUrl;
  const anonKey = publicAnonKey || serverAnonKey;

  return {
    url,
    anonKey,
    missing: [
      ...(url ? [] : ["NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)"]),
      ...(anonKey ? [] : ["NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)"]),
    ],
  };
}

function resolveBrowserEnv() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    url,
    anonKey,
    missing: [
      ...(url ? [] : ["NEXT_PUBLIC_SUPABASE_URL"]),
      ...(anonKey ? [] : ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]),
    ],
  };
}

export function getSupabaseServerConfig(): SupabaseConfig | null {
  const { url, anonKey } = resolveServerEnv();
  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseBrowserConfig(): SupabaseConfig | null {
  const { url, anonKey } = resolveBrowserEnv();
  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseServerConfigError() {
  const { missing } = resolveServerEnv();
  return formatMissing("Missing Supabase environment variables", missing);
}

export function getSupabaseBrowserConfigError() {
  const { missing } = resolveBrowserEnv();
  return formatMissing("Missing Supabase browser environment variables", missing);
}

export function isSupabaseServerConfigured() {
  return getSupabaseServerConfig() !== null;
}

export function isSupabaseBrowserConfigured() {
  return getSupabaseBrowserConfig() !== null;
}
