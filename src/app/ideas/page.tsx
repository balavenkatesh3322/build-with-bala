import type { Metadata } from "next";
import IdeasBoard from "@/components/IdeasBoard";
import { getApps, getIdeas } from "@/lib/data";

export const revalidate = 30;
export const metadata: Metadata = { title: "Ideas & roadmap", description: "Share a pain point, suggest an app or request a feature. Vote on what gets built next.", alternates: { canonical: "/ideas" } };

export default async function IdeasPage() {
  const [{ ideas, live }, apps] = await Promise.all([getIdeas(), getApps()]);
  return <IdeasBoard initial={ideas} live={live} apps={apps.map((a) => ({ slug: a.slug, name: a.name }))} />;
}
