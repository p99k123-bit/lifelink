import { SignupForm } from "../../../components/forms/signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <section className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">BloodLine Onboarding</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Launch your donor or hospital workspace.</h1>
          <p className="mt-3 text-sm text-slate-600">
            Sign up with strict role-based provisioning. Admin accounts are managed by platform administrators.
          </p>
        </section>
        <SignupForm />
      </div>
    </main>
  );
}
