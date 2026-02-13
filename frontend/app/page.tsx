import Link from "next/link";
import { ArrowRight, Building2, HeartPulse, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getDashboardPath } from "../lib/auth";
import { getCurrentUserAndRole } from "../lib/auth-server";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default async function HomePage() {
  const { role, configurationError } = await getCurrentUserAndRole();

  if (role) {
    redirect(getDashboardPath(role));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {configurationError ? (
        <Card className="mb-6 border-amber-200 bg-amber-50/70">
          <h2 className="text-base font-semibold text-amber-900">Authentication setup is incomplete</h2>
          <p className="mt-1 text-sm text-amber-800">{configurationError}</p>
          <Link href="/auth/setup" className="mt-3 inline-flex text-sm font-semibold text-amber-900 underline underline-offset-2">
            Open setup instructions
          </Link>
        </Card>
      ) : null}

      <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/85 px-6 py-10 shadow-[0_35px_70px_-40px_rgba(15,23,42,0.55)] backdrop-blur sm:px-10">
        <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-rose-200/70 blur-3xl" />
        <div className="absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-sky-200/70 blur-3xl" />

        <div className="relative z-10 max-w-3xl animate-fade-slide">
          <p className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            Emergency Response Network
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            BloodLine orchestrates donor, hospital, and admin operations in one secure workflow.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            A production-grade blood logistics platform with verified role access, live request pipelines, and operational analytics.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/auth/signup">
              <Button>
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="animate-fade-slide">
          <HeartPulse className="h-5 w-5 text-rose-600" />
          <h2 className="mt-3 text-lg font-semibold">Donor Intelligence</h2>
          <p className="mt-2 text-sm text-slate-600">
            Eligibility tracking, donation timelines, and nearby emergency visibility.
          </p>
        </Card>

        <Card className="animate-fade-slide">
          <Building2 className="h-5 w-5 text-sky-600" />
          <h2 className="mt-3 text-lg font-semibold">Hospital Command</h2>
          <p className="mt-2 text-sm text-slate-600">
            Request creation, donor discovery, stock monitoring, and donation logs.
          </p>
        </Card>

        <Card className="animate-fade-slide">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="mt-3 text-lg font-semibold">Admin Controls</h2>
          <p className="mt-2 text-sm text-slate-600">
            User governance, suspension controls, and blood group analytics for scale.
          </p>
        </Card>
      </section>
    </main>
  );
}
