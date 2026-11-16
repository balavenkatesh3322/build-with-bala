// Seeds the Supabase `apps` table (and a few starter ideas) from src/lib/apps-data.ts.
// Usage:  npm run db:seed        (reads .env)
import { createClient } from "@supabase/supabase-js";
import { appsData } from "../src/lib/apps-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || url.includes("YOUR_") || key.includes("YOUR_")) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const rows = appsData.map((a) => ({
    slug: a.slug, name: a.name, tagline: a.tagline, hook: a.hook,
    problem: a.problem, solution: a.solution, value: a.value,
    audience: a.audience.join(", "), stack: a.stack.join(", "),
    category: a.category, status: a.status,
    live_url: a.liveUrl ?? null, repo_url: a.repoUrl ?? null,
    video: a.video ?? null, video_vertical: a.videoVertical ?? null, poster: a.poster ?? null,
    accent: a.accent ?? "#D81B60", featured: a.featured ?? false, sort_order: Math.round((a.sortOrder ?? 100) * 10),
  }));
  const { error } = await db.from("apps").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✔ Upserted ${rows.length} apps`);

  const { count } = await db.from("ideas").select("id", { count: "exact", head: true });
  if (!count) {
    const { error: e2 } = await db.from("ideas").insert([
      { kind: "idea", title: "Diffusion models explained in 3D", description: "Watch noise turn into an image, step by step.", status: "planned" },
      { kind: "idea", title: "Fine-tuning playground in the browser", description: "Upload a few examples, fine-tune a small model, compare outputs." },
      { kind: "pain", title: "Our docs chatbot answers confidently and wrongly, and we can't tell why.", role: "Developer", frequency: "Every week", would_pay: "yes", status: "shipped" },
      { kind: "feature", app_slug: "agentdecode-3d", title: "Multi-agent hand-off module", status: "building" },
      { kind: "feature", app_slug: "agentdecode-3d", title: "Paste my own prompt and watch it run" },
    ]);
    if (e2) throw e2;
    console.log("✔ Added starter ideas");
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
