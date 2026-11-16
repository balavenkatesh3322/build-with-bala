import { NextRequest } from "next/server";
import { json } from "@/lib/api";
import { getApps } from "@/lib/data";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 80);
  if (q.length < 2) return json({ apps: [] });
  const words = q.split(/\s+/);
  const apps = (await getApps())
    .filter((a) => {
      const hay = [a.name, a.tagline, a.problem, a.stack.join(" "), a.category].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    })
    .slice(0, 8)
    .map((a) => ({ slug: a.slug, name: a.name, tagline: a.tagline, status: a.status, category: a.category }));
  return json({ apps });
}
