import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const looksReal = (v?: string) => Boolean(v && !v.includes("YOUR_"));

/** True when public (read) access to Supabase is configured. */
export const hasPublicDb = looksReal(url) && looksReal(anon);
/** True when server (write) access is configured. */
export const hasAdminDb = looksReal(url) && looksReal(service);

const opts = { auth: { persistSession: false, autoRefreshToken: false } } as const;

let pub: SupabaseClient | null = null;
let adm: SupabaseClient | null = null;

/** Read-only client (anon key, respects RLS). Used by pages. */
export function publicDb(): SupabaseClient | null {
  if (!hasPublicDb) return null;
  return (pub ??= createClient(url!, anon!, opts));
}

/** Privileged client (service role, bypasses RLS). Server routes only. */
export function adminDb(): SupabaseClient | null {
  if (!hasAdminDb) return null;
  return (adm ??= createClient(url!, service!, opts));
}
