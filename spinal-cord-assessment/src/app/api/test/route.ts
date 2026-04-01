import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return Response.json(
      {
        ok: false,
        where: "env",
        message: "Supabase is not configured.",
      },
      { status: 500 }
    );
  }

  const { error, count } = await supabase
    .from("Patient")
    .select("*", { count: "exact", head: true });

  if (error) {
    return Response.json(
      {
        ok: false,
        where: "supabase",
        message: error.message,
        hint:
          "If this is an RLS/permission error, either add a SELECT policy for anon/authenticated users, or test server-side with a service role key.",
      },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, table: "Patient", count });
}
