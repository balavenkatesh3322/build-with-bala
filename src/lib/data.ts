import "server-only";
import { appsData } from "./apps-data";
import { publicDb } from "./supabase";
import { appDetails, type AppStory } from "./app-details";

export type AppRow = {
  slug: string;
  name: string;
  tagline: string;
  hook: string;
  problem: string;
  solution: string;
  value: string;
  audience: string[];
  stack: string[];
  category: string;
  status: "live" | "open-source" | "coming" | "lab";
  liveUrl: string | null;
  repoUrl: string | null;
  video: string | null;
  videoVertical: string | null;
  poster: string | null;
  accent: string;
  featured: boolean;
  sortOrder: number;
  upvotes: number;
  story: AppStory | null;
};

export type IdeaKind = "idea" | "pain" | "feature";
export type IdeaStatus = "open" | "under-review" | "planned" | "building" | "shipped";

export type IdeaRow = {
  id: string;
  kind: IdeaKind;
  title: string;
  description: string | null;
  appSlug: string | null;
  role: string | null;
  status: IdeaStatus;
  votes: number;
  createdAt: string;
};

const split = (v: unknown) =>
  typeof v === "string" ? v.split(",").map((x) => x.trim()).filter(Boolean) : [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToApp(r: any, upvotes: number): AppRow {
  return {
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    hook: r.hook,
    problem: r.problem,
    solution: r.solution,
    value: r.value,
    audience: split(r.audience),
    stack: split(r.stack),
    category: r.category,
    status: r.status,
    liveUrl: r.live_url ?? null,
    repoUrl: r.repo_url ?? null,
    video: r.video ?? null,
    videoVertical: r.video_vertical ?? null,
    poster: r.poster ?? null,
    accent: r.accent ?? "#D81B60",
    featured: Boolean(r.featured),
    sortOrder: Number(r.sort_order ?? 100),
    upvotes,
    story: appDetails[r.slug] ?? null,
  };
}

const staticBySlug = new Map(appsData.map((a) => [a.slug, a]));
/** Fill media from the bundled catalogue when the DB row predates it. */
function withStaticMedia(app: AppRow): AppRow {
  const s = staticBySlug.get(app.slug);
  if (!s) return app;
  return { ...app, poster: app.poster ?? s.poster ?? null, video: app.video ?? s.video ?? null, videoVertical: app.videoVertical ?? s.videoVertical ?? null };
}

const fallbackApps = (): AppRow[] =>
  appsData
    .map((a) => ({
      ...a,
      liveUrl: a.liveUrl ?? null,
      repoUrl: a.repoUrl ?? null,
      video: a.video ?? null,
      videoVertical: a.videoVertical ?? null,
      poster: a.poster ?? null,
      accent: a.accent ?? "#D81B60",
      featured: Boolean(a.featured),
      sortOrder: a.sortOrder ?? 100,
      upvotes: 0,
      story: appDetails[a.slug] ?? null,
    }))
    .sort((x, y) => x.sortOrder - y.sortOrder);

/** Apps with live upvote counts. Falls back to the bundled catalogue if the DB isn't reachable. */
export async function getApps(): Promise<AppRow[]> {
  const db = publicDb();
  if (!db) return fallbackApps();
  try {
    const [apps, stats] = await Promise.all([
      db.from("apps").select("*").order("sort_order", { ascending: true }),
      db.from("app_stats").select("slug, upvotes"),
    ]);
    if (apps.error || !apps.data?.length) return fallbackApps();
    const counts = new Map<string, number>((stats.data ?? []).map((s) => [s.slug as string, s.upvotes as number]));
    return apps.data.map((r) => withStaticMedia(rowToApp(r, counts.get(r.slug) ?? 0)));
  } catch {
    return fallbackApps();
  }
}

export async function getApp(slug: string): Promise<AppRow | null> {
  return (await getApps()).find((a) => a.slug === slug) ?? null;
}

const starterIdeas: IdeaRow[] = [
  { id: "starter-1", kind: "idea", title: "Diffusion models explained in 3D", description: "Watch noise turn into an image, step by step.", appSlug: null, role: null, status: "planned", votes: 0, createdAt: "" },
  { id: "starter-2", kind: "idea", title: "Fine-tuning playground in the browser", description: "Upload a few examples, fine-tune a small model, compare outputs.", appSlug: null, role: null, status: "open", votes: 0, createdAt: "" },
  { id: "starter-3", kind: "pain", title: "Our docs chatbot answers confidently and wrongly, and we can't tell why.", description: null, appSlug: null, role: "Developer", status: "shipped", votes: 0, createdAt: "" },
  { id: "starter-4", kind: "feature", title: "Multi-agent hand-off module", description: null, appSlug: "agentdecode-3d", role: null, status: "building", votes: 0, createdAt: "" },
  { id: "starter-5", kind: "feature", title: "Paste my own prompt and watch it run", description: null, appSlug: "agentdecode-3d", role: null, status: "open", votes: 0, createdAt: "" },
];

/** Approved ideas, pain points and feature requests with vote counts. */
export async function getIdeas(): Promise<{ ideas: IdeaRow[]; live: boolean }> {
  const db = publicDb();
  if (!db) return { ideas: starterIdeas, live: false };
  try {
    const { data, error } = await db
      .from("idea_stats")
      .select("id, kind, title, description, app_slug, role, status, created_at, votes")
      .order("votes", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { ideas: starterIdeas, live: false };
    return {
      live: true,
      ideas: (data ?? []).map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        description: r.description,
        appSlug: r.app_slug,
        role: r.role,
        status: r.status,
        votes: r.votes,
        createdAt: r.created_at,
      })),
    };
  } catch {
    return { ideas: starterIdeas, live: false };
  }
}
