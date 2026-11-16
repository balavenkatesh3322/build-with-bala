import { ctx, isUuid, json } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return json({ ok: false, error: "This is a sample idea. It becomes votable once the database is connected." }, 400);
  const c = await ctx();
  if ("error" in c) return c.error;
  const { db, voter } = c;

  const { data: idea } = await db.from("ideas").select("id").eq("id", id).eq("approved", true).maybeSingle();
  if (!idea) return json({ ok: false, error: "Idea not found" }, 404);

  const { data: existing } = await db.from("idea_votes").select("id").eq("idea_id", id).eq("voter_id", voter).maybeSingle();
  let voted: boolean;
  if (existing) {
    await db.from("idea_votes").delete().eq("id", existing.id);
    voted = false;
  } else {
    const { error } = await db.from("idea_votes").insert({ idea_id: id, voter_id: voter });
    if (error && error.code !== "23505") return json({ ok: false, error: "Could not save your vote." }, 500);
    voted = true;
  }
  const { count } = await db.from("idea_votes").select("id", { count: "exact", head: true }).eq("idea_id", id);
  return json({ ok: true, voted, count: count ?? 0 });
}
