import { NextResponse } from "next/server";
import { isAppRole } from "../../../../lib/auth";
import { createSupabaseServerClient, getSupabaseServerSetupError } from "../../../../lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { role?: string; email?: string };

    if (!body.role || !isAppRole(body.role) || body.role === "admin") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ error: getSupabaseServerSetupError() }, { status: 503 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: body.email || user.email,
        role: body.role,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (body.role === "donor") {
      const { error } = await supabase.from("donors").upsert({ id: user.id, is_available: true }, { onConflict: "id" });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    if (body.role === "hospital") {
      const { error } = await supabase.from("hospitals").upsert({ id: user.id }, { onConflict: "id" });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 },
    );
  }
}
