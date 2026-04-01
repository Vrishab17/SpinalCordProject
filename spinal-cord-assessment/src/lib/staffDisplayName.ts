import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * Resolve `Staff.staff_id` for the signed-in Auth user.
 * Prefer `Staff.auth_user_id` = `user.id`; fall back to `Staff.email` matching Auth email.
 */
export async function getStaffIdForAuthUser(
  supabase: SupabaseClient,
  user: User
): Promise<number | null> {
  const { data: byAuth } = await supabase
    .from("Staff")
    .select("staff_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (byAuth?.staff_id != null) {
    return Number(byAuth.staff_id);
  }

  const email = user.email?.trim();
  if (!email) return null;

  const { data: byEmail } = await supabase
    .from("Staff")
    .select("staff_id")
    .ilike("email", email)
    .maybeSingle();

  return byEmail?.staff_id != null ? Number(byEmail.staff_id) : null;
}

/**
 * Resolve a display name for the header from Auth user + Staff / Staff Name tables.
 */
export async function resolveStaffDisplayName(
  supabase: SupabaseClient,
  user: User
): Promise<string> {
  const meta = user.user_metadata as { full_name?: string } | undefined;
  if (meta?.full_name?.trim()) return meta.full_name.trim();

  const email = user.email?.trim();
  const localPart = email?.split("@")[0] ?? "User";

  const staffId = await getStaffIdForAuthUser(supabase, user);
  if (staffId == null) {
    return localPart;
  }

  const { data: nameRow } = await supabase
    .from("Staff Name")
    .select("prefix, given_name, preferred_name, family_name")
    .eq("STAFFstaff_id", staffId)
    .maybeSingle();

  if (!nameRow) return localPart;

  const first = nameRow.preferred_name || nameRow.given_name || "";
  const parts = [nameRow.prefix, first, nameRow.family_name].filter(Boolean);
  return parts.join(" ").trim() || localPart;
}
