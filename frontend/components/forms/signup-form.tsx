"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getDashboardPath } from "../../lib/auth";
import { getSupabaseBrowserConfigError, isSupabaseBrowserConfigured } from "../../lib/supabase-env";
import {
  loginAndResolveRole,
  signupSchema,
  signupWithRole,
  type SignupInput,
} from "../../lib/services/auth";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { useToast } from "../ui/toast";

export function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const supabaseReady = isSupabaseBrowserConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "donor",
    },
  });

  if (!supabaseReady) {
    return (
      <Card className="mx-auto w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Sign up unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{getSupabaseBrowserConfigError()}</p>
      </Card>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const role = await signupWithRole(values);
      await loginAndResolveRole({ email: values.email, password: values.password });
      toast.success("Account created successfully.");
      router.replace(getDashboardPath(role));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create account.";
      toast.error(message);
    }
  });

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-500">Sign up as a donor or hospital. Admin accounts are provisioned manually.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Select label="Role" error={errors.role?.message} {...register("role")}> 
          <option value="donor">Donor</option>
          <option value="hospital">Hospital</option>
        </Select>

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-rose-700 hover:text-rose-800">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
