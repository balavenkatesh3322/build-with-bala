import { ctx, json } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await ctx();
  if ("error" in c) return c.error;
  const { db, voter } = c;

  const { data: app } = await db.from("apps").select("id").eq("slug", slug).maybeSingle();
  if (!app) return json({ ok: false, error: "App not found" }, 404);

  const { data: existing } = await db.from("upvotes").select("id").eq("app_id", app.id).eq("voter_id", voter).maybeSingle();
  let voted: boolean;
  if (existing) {
    await db.from("upvotes").delete().eq("id", existing.id);
    voted = false;
  } else {
    const { error } = await db.from("upvotes").insert({ app_id: app.id, voter_id: voter });
    if (error && error.code !== "23505") return json({ ok: false, error: "Could not save your vote." }, 500);
    voted = true;
  }
  const { count } = await db.from("upvotes").select("id", { count: "exact", head: true }).eq("app_id", app.id);
  return json({ ok: true, voted, count: count ?? 0 });
}
