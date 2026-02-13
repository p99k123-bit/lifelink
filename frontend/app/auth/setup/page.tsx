import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "../../../components/ui/card";
import { getSupabaseServerSetupError, hasSupabaseServerConfig } from "../../../lib/auth-server";

export default function AuthSetupPage() {
  if (hasSupabaseServerConfig()) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Configuration Required</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Supabase environment variables are missing</h1>
        <p className="mt-3 text-sm text-slate-600">{getSupabaseServerSetupError()}</p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Set these frontend variables in your hosting provider:</p>
          <ul className="mt-3 space-y-2">
            <li>
              <code>NEXT_PUBLIC_SUPABASE_URL</code>
            </li>
            <li>
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </li>
          </ul>
          <p className="mt-3">
            Optional server fallback: <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code>.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/auth/login" className="font-semibold text-rose-700 hover:text-rose-800">
            Retry login
          </Link>
          <Link href="/" className="font-semibold text-slate-700 hover:text-slate-900">
            Back to home
          </Link>
        </div>
      </Card>
    </main>
  );
}
