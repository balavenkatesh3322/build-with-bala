import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "./supabase";

export const VOTER_COOKIE = "awb_vid";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

/** Anonymous visitor id from the cookie set by middleware. */
export async function voterId(): Promise<string | null> {
  const v = (await cookies()).get(VOTER_COOKIE)?.value;
  return v && v.length >= 16 && v.length <= 64 ? v : null;
}

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

export const notConfigured = () =>
  json({ ok: false, error: "The database isn't connected yet. Add your Supabase keys to enable this." }, 503);

/** Resolve the DB + voter or return a ready-made error response. */
export async function ctx(): Promise<
  { db: NonNullable<ReturnType<typeof adminDb>>; voter: string } | { error: NextResponse }
> {
  const db = adminDb();
  if (!db) return { error: notConfigured() };
  const voter = await voterId();
  if (!voter) return { error: json({ ok: false, error: "Please reload the page and try again." }, 401) };
  return { db, voter };
}
