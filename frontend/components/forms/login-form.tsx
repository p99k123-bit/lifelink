"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getDashboardPath } from "../../lib/auth";
import { getSupabaseBrowserConfigError, isSupabaseBrowserConfigured } from "../../lib/supabase-env";
import { loginAndResolveRole, type LoginInput, loginSchema } from "../../lib/services/auth";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { useToast } from "../ui/toast";

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const supabaseReady = isSupabaseBrowserConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (!supabaseReady) {
    return (
      <Card className="mx-auto w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{getSupabaseBrowserConfigError()}</p>
      </Card>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const role = await loginAndResolveRole(values);
      toast.success("Welcome back. Redirecting to your workspace.");
      router.replace(getDashboardPath(role));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      toast.error(message);
    }
  });

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Use your BloodLine account credentials.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        New to BloodLine?{" "}
        <Link href="/auth/signup" className="font-semibold text-rose-700 hover:text-rose-800">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
