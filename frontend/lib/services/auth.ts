import { z } from "zod";
import { isAppRole } from "../auth";
import { getSupabaseBrowserClient } from "../supabaseClient";
import type { AppRole } from "../types";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["donor", "hospital"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export async function loginAndResolveRole(input: LoginInput) {
  const supabase = getSupabaseBrowserClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (signInError) {
    throw new Error(signInError.message);
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    throw new Error(sessionError?.message || "Unable to establish an authenticated session.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_suspended")
    .eq("id", session.user.id)
    .maybeSingle<{ role: string; is_suspended?: boolean }>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile || !isAppRole(profile.role)) {
    throw new Error("Profile role is missing. Complete onboarding first.");
  }

  if (profile.is_suspended) {
    throw new Error("Your account is suspended. Contact support.");
  }

  return profile.role;
}

export async function signupWithRole(input: SignupInput): Promise<AppRole> {
  const supabase = getSupabaseBrowserClient();

  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  if (!user) {
    throw new Error("Account created. Please verify your email and then sign in.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: input.email,
      role: input.role,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (input.role === "donor") {
    const { error: donorError } = await supabase.from("donors").upsert(
      {
        id: user.id,
        is_available: true,
      },
      { onConflict: "id" },
    );

    if (donorError) {
      throw new Error(donorError.message);
    }
  }

  if (input.role === "hospital") {
    const { error: hospitalError } = await supabase.from("hospitals").upsert(
      {
        id: user.id,
      },
      { onConflict: "id" },
    );

    if (hospitalError) {
      throw new Error(hospitalError.message);
    }
  }

  return input.role;
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
