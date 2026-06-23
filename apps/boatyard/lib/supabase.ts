import { createClient } from "@supabase/supabase-js";
import type { Database } from "@digiform/db";

// Server-only: uses the service role key, bypasses RLS.
// Never import this in client components.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export const DEMO_TENANT = "00000000-0000-0000-0000-000000000001";
