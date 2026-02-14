import { LoginForm } from "../../../components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <section className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">BloodLine Access</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Secure sign-in for real-time donation operations.</h1>
          <p className="mt-3 text-sm text-slate-600">
            Access your role-based dashboard to coordinate emergency responses and donor workflows.
          </p>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
