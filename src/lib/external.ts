import { collections } from "./apps-data";

export type Post = { title: string; link: string; date: string; tags: string[]; excerpt: string };

const FALLBACK_POSTS: Post[] = [
  { title: "How I Try to Avoid Building Products Nobody Wants", link: "https://balavenkatesh.medium.com/", date: "", tags: ["Product Thinking"], excerpt: 'Swap "What can I build?" for "What problem is worth solving?"' },
  { title: "Inside the Brain of an AI Agent: 10 Layers Nobody Explains Properly", link: "https://balavenkatesh.medium.com/", date: "", tags: ["Agents"], excerpt: "" },
  { title: "“Why” Your RAG Chatbot Fails and “How” Graph RAG Fixes It", link: "https://balavenkatesh.medium.com/", date: "", tags: ["RAG"], excerpt: "" },
];

const strip = (s: string) =>
  s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

/** Live Medium feed, cached for an hour. Falls back to known posts if Medium is unreachable. */
export async function getPosts(limit = 12): Promise<Post[]> {
  try {
    const res = await fetch("https://balavenkatesh.medium.com/feed", { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(String(res.status));
    const xml = await res.text();
    const items = xml.split("<item>").slice(1);
    const posts = items.map((it) => {
      const get = (tag: string) => it.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? "";
      const tags = [...it.matchAll(/<category><!\[CDATA\[([^\]]+)\]\]><\/category>/g)].map((m) => m[1]);
      const body = strip(get("content:encoded"));
      return {
        title: strip(get("title")),
        link: strip(get("link")).split("?")[0],
        date: get("pubDate") ? new Date(get("pubDate")).toISOString() : "",
        tags: tags.slice(0, 3),
        excerpt: body.slice(0, 180) + (body.length > 180 ? "…" : ""),
      };
    });
    return posts.length ? posts.slice(0, limit) : FALLBACK_POSTS;
  } catch {
    return FALLBACK_POSTS;
  }
}

/** Live GitHub stars for the open-source collections, cached for an hour. */
export async function getCollections() {
  try {
    const res = await fetch("https://api.github.com/users/balavenkatesh3322/repos?per_page=100", {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(String(res.status));
    const repos: { name: string; stargazers_count: number }[] = await res.json();
    const stars = new Map(repos.map((r) => [r.name, r.stargazers_count]));
    const total = repos.reduce((s, r) => s + r.stargazers_count, 0);
    return { total, items: collections.map((c) => ({ ...c, stars: stars.get(c.repo) ?? c.stars })) };
  } catch {
    return { total: 2100, items: collections };
  }
}
