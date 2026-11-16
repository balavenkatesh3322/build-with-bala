import type { Metadata } from "next";
import BlogList from "@/components/BlogList";
import SubscribeForm from "@/components/SubscribeForm";
import { Wave } from "@/components/Icons";
import { getPosts } from "@/lib/external";
import { site } from "@/lib/site";
import JumpText from "@/components/JumpText";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Blog", description: "Agents, RAG, MCP and building products people actually want. Live from Medium.", alternates: { canonical: "/blog" } };

export default async function BlogPage() {
  const posts = await getPosts(24);
  const [latest] = posts;
  return (
    <>
      <section className="band tiled" style={{ paddingTop: 64, paddingBottom: 104 }}>
        <div className="wrap row" style={{ gap: 32, alignItems: "center" }}>
          <div className="stack" style={{ flex: "1 1 460px", minWidth: 0, gap: 14 }}>
            <span className="eyebrow">Blog · live from Medium</span>
            <JumpText as="h1" playOnLoad className="display h1" style={{ lineHeight: 1 }} text="Read the thinking." />
            <p className="lede" style={{ margin: 0 }}>Agents, RAG, MCP and building products people actually want. New posts appear here automatically.</p>
          </div>
          {latest && (
            <a href={latest.link} target="_blank" rel="noopener noreferrer" className="card hov stack" style={{ flex: "1 1 520px", minWidth: 0, padding: 30, gap: 14, boxShadow: "var(--shadow-lg)", background: "linear-gradient(160deg, var(--accent-soft), var(--surface) 55%)" }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: "var(--accent-text)" }}>LATEST{latest.tags[0] ? ` · ${latest.tags[0].toUpperCase()}` : ""}</span>
              <span className="display h3" style={{ lineHeight: 1.12 }}>{latest.title}</span>
              {latest.excerpt && <span className="muted" style={{ lineHeight: 1.6 }}>{latest.excerpt}</span>}
              <span className="faint" style={{ fontSize: 14 }}>{site.owner} · Read on Medium ↗</span>
            </a>
          )}
        </div>
        <Wave />
      </section>
      <section className="band alt" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <BlogList posts={posts} />
          <div className="card row" style={{ marginTop: 40, padding: 30, gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div><h2 className="display h3">Get new posts and apps weekly.</h2><p className="muted" style={{ margin: "6px 0 0" }}>Free. Unsubscribe in one click.</p></div>
            <div style={{ flex: "0 1 460px", minWidth: 260 }}><SubscribeForm source="blog" id="blog-email" /></div>
          </div>
        </div>
      </section>
    </>
  );
}
