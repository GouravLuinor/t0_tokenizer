import type { SupabaseClient } from "@supabase/supabase-js";

// Next.js only inlines statically-referenced process.env.NEXT_PUBLIC_* reads,
// so these must stay literal property accesses rather than dynamic lookups.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let cachedPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Lazily constructs the Supabase client. The SDK is a ~45 kB gz dynamic import
 * so it never lands in First Load JS; it is only fetched when a sign-in flow
 * is actually invoked. Returns null when the project env is absent, which is
 * the expected local/preview state.
 */
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (!cachedPromise) {
    cachedPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    );
  }
  return cachedPromise;
}

/** Test seam — drops the memoized client. */
export function resetSupabaseClientCache() {
  cachedPromise = null;
}
