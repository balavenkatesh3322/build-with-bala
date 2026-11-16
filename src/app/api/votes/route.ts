import { ctx, json } from "@/lib/api";

/** What the current visitor has already voted for (so the UI can show filled upvotes). */
export async function GET() {
  const c = await ctx();
  if ("error" in c) return json({ apps: [], ideas: [], configured: false });
  const [apps, ideas] = await Promise.all([
    c.db.from("upvotes").select("apps(slug)").eq("voter_id", c.voter),
    c.db.from("idea_votes").select("idea_id").eq("voter_id", c.voter),
  ]);
  return json({
    configured: true,
    apps: (apps.data ?? []).map((r: { apps: { slug: string } | { slug: string }[] | null }) =>
      Array.isArray(r.apps) ? r.apps[0]?.slug : r.apps?.slug).filter(Boolean),
    ideas: (ideas.data ?? []).map((r) => r.idea_id),
  });
}
