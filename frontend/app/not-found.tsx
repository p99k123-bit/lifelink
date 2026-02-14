import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <Card className="w-full text-center">
        <SearchX className="mx-auto h-10 w-10 text-slate-500" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The route you requested does not exist.</p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button variant="ghost">Back to home</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
