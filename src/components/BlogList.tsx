"use client";
import { useMemo, useState } from "react";

type Post = { title: string; link: string; date: string; tags: string[]; excerpt: string };

export default function BlogList({ posts }: { posts: Post[] }) {
  const tags = useMemo(() => ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags))).slice(0, 8)], [posts]);
  const [tag, setTag] = useState("All");
  const list = posts.filter((p) => tag === "All" || p.tags.includes(tag));
  const fmt = (d: string) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div role="tablist" aria-label="Topics" className="tabs">{tags.map((t) => (<button key={t} type="button" role="tab" aria-selected={tag === t} className="tab" onClick={() => setTag(t)}>{t}</button>))}</div>
      </div>
      <div className="g3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {list.map((p) => (
          <a key={p.link} href={p.link} target="_blank" rel="noopener noreferrer" className="card hov stack" style={{ padding: 22, gap: 10 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: "var(--accent-text)", textTransform: "uppercase" }}>{p.tags[0] ?? "Article"}{p.date ? ` · ${fmt(p.date)}` : ""}</span>
            <span className="display" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-.01em" }}>{p.title}</span>
            {p.excerpt && <span className="muted" style={{ fontSize: 14.5, lineHeight: 1.55 }}>{p.excerpt}</span>}
            <span className="faint" style={{ marginTop: "auto", paddingTop: 10, fontSize: 13 }}>Read on Medium ↗</span>
          </a>
        ))}
      </div>
    </>
  );
}
