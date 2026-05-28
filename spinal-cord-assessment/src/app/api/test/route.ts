import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const TABLES = [
  "Patient",
  "Assessment",
  "Staff",
  "Staff Credentials",
  "Staff Name",
] as const;

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const results = await Promise.all(
      TABLES.map(async (table) => {
        const { error, count } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        return {
          table,
          count: count ?? null,
          error: error?.message ?? null,
        };
      })
    );

    const counts = Object.fromEntries(
      results.map((result) => [result.table, result.count])
    );
    const errors = Object.fromEntries(
      results
        .filter((result) => result.error)
        .map((result) => [result.table, result.error])
    );
    const ok = Object.keys(errors).length === 0;

    return Response.json(
      {
        ok,
        client: "supabase-admin",
        counts,
        errors,
      },
      { status: ok ? 200 : 500 }
    );
  } catch (e) {
    return Response.json(
      {
        ok: false,
        where: "supabase-admin",
        message: e instanceof Error ? e.message : "Database test failed",
      },
      { status: 500 }
    );
  }
}
