import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: any = null;

export function createClient() {
  if (supabaseInstance) return supabaseInstance;

  supabaseInstance = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
        storageKey: "saat-isolated-session",
      }
    }
  );

  return supabaseInstance;
}