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

/** Live saving isn't switched on yet: the client keeps working in demo mode. */
export const WIP = "This feature is a work in progress. It opens very soon, thanks for your patience!";
export const demoMode = () => json({ ok: false, demo: true, error: WIP }, 200);

/** Resolve the DB + voter or return a ready-made error response. */
export async function ctx(): Promise<
  { db: NonNullable<ReturnType<typeof adminDb>>; voter: string } | { error: NextResponse }
> {
  const db = adminDb();
  if (!db) return { error: demoMode() };
  const voter = await voterId();
  if (!voter) return { error: json({ ok: false, error: "Please refresh the page and try again." }, 401) };
  return { db, voter };
}
