import { z } from "zod";
import { ctx, json } from "@/lib/api";

const schema = z.object({
  kind: z.enum(["idea", "pain", "feature"]),
  title: z.string().trim().min(3, "Please add a few more words.").max(200),
  description: z.string().trim().max(1500).optional(),
  appSlug: z.string().max(80).optional(),
  role: z.string().max(40).optional(),
  frequency: z.string().max(40).optional(),
  wouldPay: z.enum(["yes", "maybe", "no"]).optional(),
  email: z.union([z.string().trim().email().max(200), z.literal("")]).optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  const c = await ctx();
  if ("error" in c) return c.error;
  const { db, voter } = c;
  let body: unknown;
  try { body = await req.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const p = schema.safeParse(body);
  if (!p.success) return json({ ok: false, error: p.error.issues[0]?.message ?? "Invalid input" }, 400);
  const d = p.data;
  if (d.website) return json({ ok: true });

  // light per-visitor throttle: max 5 submissions per hour
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await db.from("ideas").select("id", { count: "exact", head: true }).eq("voter_id", voter).gte("created_at", since);
  if ((count ?? 0) >= 5) return json({ ok: false, error: "You're going fast! Please try again in a little while." }, 429);

  const { data, error } = await db.from("ideas").insert({
    kind: d.kind,
    title: d.title,
    description: d.description || null,
    app_slug: d.appSlug || null,
    role: d.role || null,
    frequency: d.frequency || null,
    would_pay: d.wouldPay ?? null,
    contact_email: d.email || null,
    voter_id: voter,
  }).select("id, kind, title, description, app_slug, role, status, created_at").single();
  if (error || !data) return json({ ok: false, error: "Could not save right now. Please try again." }, 500);

  await db.from("idea_votes").insert({ idea_id: data.id, voter_id: voter }); // author counts as the first vote
  return json({ ok: true, idea: {
    id: data.id, kind: data.kind, title: data.title, description: data.description,
    appSlug: data.app_slug, role: data.role, status: data.status, votes: 1, createdAt: data.created_at,
  } });
}
