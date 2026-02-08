"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type AuthContextType = {
  user: any | null;
  role: string | null;
  loading: boolean;
  signup: (email: string, password: string, role?: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (id: string | null) => {
    if (!id) {
      setRole(null);
      return null;
    }
    console.log("Fetching profile for:", id);
    try {
      const { data, error } = await supabase.from("profiles").select("role,email").eq("id", id).single();
      if (error) {
        console.warn("Error fetching profile:", error.message || error);
        return null;
      }
      setRole(data?.role ?? null);
      return data?.role ?? null;
    } catch (err) {
      console.error("fetchProfile unexpected error:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();
          if (error) console.warn("getSession warning:", error);
          const currentUser = session?.user ?? null;
          if (mounted) setUser(currentUser);
          await fetchProfile(currentUser?.id ?? null);
        } catch (err) {
          // supabase client might be stubbed/missing — log and continue
          console.warn("Supabase getSession failed:", (err as Error).message || err);
          if (mounted) {
            setUser(null);
            setRole(null);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    let subscriptionUnsub: (() => void) | null = null;

    try {
      const ret = supabase.auth.onAuthStateChange((event: any, session: { user?: any } | null) => {
        console.log("Auth state changed:", event);
        const u = session?.user ?? null;
        setUser(u);
        fetchProfile(u?.id ?? null).catch((e) => console.error("fetchProfile error:", e));
      });
      // support both real and stub shapes
      subscriptionUnsub = (ret as any)?.data?.subscription?.unsubscribe ?? (ret as any)?.unsubscribe ?? null;
    } catch (err) {
      console.warn("onAuthStateChange not available:", (err as Error).message || err);
    }

    return () => {
      mounted = false;
      try {
        if (typeof subscriptionUnsub === "function") subscriptionUnsub();
      } catch (err) {
        console.warn("Failed to unsubscribe auth listener:", (err as Error).message || err);
      }
    };
  }, []);

  const signup = async (email: string, password: string, roleParam: string = "donor") => {
    setLoading(true);
    console.log("Signup attempt:", email, roleParam);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      const userId = data.user?.id ?? data?.session?.user?.id ?? null;
      if (!userId) {
        console.warn("Signup succeeded but no user id returned; profile may be created after confirmation.");
        setLoading(false);
        return roleParam;
      }
      // Try to set role on profile; tolerate failures but surface them
      try {
        const { error: upErr } = await supabase.from("profiles").upsert({ id: userId, email, role: roleParam });
        if (upErr) {
          console.error("Failed to set role on profile:", upErr);
          throw upErr;
        }
      } catch (err) {
        console.error("Upsert profile error:", err);
        throw err;
      }
      await fetchProfile(userId);
      console.log("Signup complete for:", userId);
      return roleParam;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    console.log("Login attempt:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      const userId = data.user?.id ?? data.session?.user?.id ?? null;
      if (!userId) {
        console.warn("Login succeeded but no user id found.");
        setUser(data.user ?? data.session?.user ?? null);
        setLoading(false);
        return null;
      }
      setUser(data.user ?? data.session?.user ?? null);
      const r = await fetchProfile(userId);
      setLoading(false);
      console.log("Login successful:", userId, "role:", r);
      return r;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    console.log("Signing out");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return <AuthContext.Provider value={{ user, role, loading, signup, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
