import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/** Whether a Supabase Auth session exists (async; use in useEffect / handlers). */
export async function hasSupabaseAuthSession(): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return Boolean(session);
}

/** Sign out everywhere — clears Supabase Auth cookies / storage. */
export async function signOutSupabase(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
