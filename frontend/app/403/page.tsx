import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <Card className="w-full text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">403 - Access denied</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your account role does not have permission to access this route.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button variant="ghost">Go to home</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
