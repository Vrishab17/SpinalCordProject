import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  // Count rows without fetching data. Works even if empty.
  // If RLS blocks anon reads, you'll get an error — that's still useful info.
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