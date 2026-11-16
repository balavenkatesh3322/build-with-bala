import { NextRequest } from "next/server";
import { ctx, json } from "@/lib/api";
import { adminDb } from "@/lib/supabase";
import { pollStoreKey, todaysPoll } from "@/lib/daily";

const resultsFor = async (key: string, n: number) => {
  const db = adminDb();
  const counts = Array<number>(n).fill(0);
  if (!db) return counts;
  const { data } = await db.from("poll_results").select("option, votes").eq("poll_key", key);
  for (const r of data ?? []) if (r.option < n) counts[r.option] = r.votes;
  return counts;
};

export async function GET() {
  const poll = todaysPoll();
  return json({ ok: true, counts: await resultsFor(pollStoreKey(poll), poll.options.length) });
}

export async function POST(req: NextRequest) {
  const c = await ctx();
  if ("error" in c) return c.error;
  const poll = todaysPoll();
  const key = pollStoreKey(poll);
  let option = -1; let sent = "";
  try { const b = await req.json(); option = Number(b.option); sent = String(b.key ?? ""); } catch { /* handled below */ }
  if (sent !== poll.key) return json({ ok: false, stale: true, error: "A new poll is live. Please refresh the page." }, 409);
  if (!Number.isInteger(option) || option < 0 || option >= poll.options.length) return json({ ok: false, error: "Invalid option" }, 400);

  const { error } = await c.db.from("poll_votes").insert({ poll_key: key, option, voter_id: c.voter });
  if (error && error.code !== "23505") return json({ ok: false, error: "Could not save your vote." }, 500);
  return json({ ok: true, already: error?.code === "23505", counts: await resultsFor(key, poll.options.length) });
}
