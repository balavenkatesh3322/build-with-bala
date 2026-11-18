import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import AppStore from "@/components/AppStore";
import Tour from "@/components/Tour";
import Cubes from "@/components/Cubes";
import RingBand from "@/components/RingBand";
import ClosingCTA from "@/components/ClosingCTA";
import JumpText from "@/components/JumpText";
import { UpvoteButton } from "@/components/UpvoteButton";
import { Wave, IconStar } from "@/components/Icons";
import { getApps } from "@/lib/data";
import { getCollections, getPosts } from "@/lib/external";
import { categoryById, site } from "@/lib/site";
import { initials } from "@/lib/ui";

export const revalidate = 60;
export const metadata: Metadata = { title: { absolute: `${site.name}: ${site.tagline}` } };

const steps = [
  { n: "01", title: "Try an app", body: "Every app runs in your browser. Free, with no sign-up.", code: "▲ upvote → ranks the store" },
  { n: "02", title: "Share a pain point", body: "Tell me what slows you down with AI. Others can say “me too”.", code: 'pain.add("my RAG bot hallucinates")' },
  { n: "03", title: "Vote on ideas", body: "The top ideas move to Building on the public roadmap.", code: "roadmap: open → planned → building" },
  { n: "04", title: "Get credit", body: "When your idea ships, you get an email and your name on the launch.", code: 'shipped("diffusion-3d", by: "@you")' },
];

export default async function Home() {
  const [apps, posts, collections] = await Promise.all([getApps(), getPosts(3), getCollections()]);
  // The landing page only shows apps that have a real image or video preview.
  const showcase = apps.filter((a) => a.poster || a.video);
  const live = apps.filter((a) => a.status === "live").length;
  const ring = [...showcase].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 10).map((a) => ({ slug: a.slug, name: a.name, poster: a.poster, color: categoryById(a.category).color, mono: initials(a.name), tagline: a.tagline, category: categoryById(a.category).label, status: a.status, liveUrl: a.liveUrl, upvotes: a.upvotes }));
  const tour = showcase.filter((a) => a.video).slice(0, 4);
  const top = [...showcase].sort((a, b) => b.upvotes - a.upvotes || a.sortOrder - b.sortOrder).slice(0, 6);
  const counts: Record<string, number> = {};
  for (const a of apps) counts[a.category] = (counts[a.category] ?? 0) + 1;

  return (
    <>
      <Hero stats={{ apps: apps.length, live, stars: collections.total }} />

      <section id="store" className="band alt" style={{ paddingTop: 72, paddingBottom: 110 }}>
        <div className="wrap">
          <div className="stack" style={{ gap: 12, marginBottom: 28 }} data-rise="">
            <span className="eyebrow">The Bala App Store</span>
            <JumpText as="h2" className="display h2" text="Every app. One store." />
            <p className="lede" style={{ margin: 0, maxWidth: 600 }}>Each app solves one real problem. Move over a card to tilt it and preview the demo, then open it to try it and upvote what you love.</p>
          </div>
          <div data-rise=""><Suspense fallback={<div className="skeleton" style={{ height: 480 }} />}><AppStore apps={showcase} limit={12} searchable={false} hideEmpty /></Suspense></div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }} data-rise=""><Link href="/apps" className="btn btn-ghost btn-lg">See all {apps.length} apps in the store →</Link></div>
        </div>
        <Wave />
      </section>

      <section className="band tiled violet" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div className="wrap">
          <div className="center stack" style={{ gap: 12 }} data-rise="">
            <span className="eyebrow">Spin the store</span>
            <JumpText as="h2" className="display h2" text="Pick one. Any one." />
            <p className="lede" style={{ margin: 0, maxWidth: 620 }}>Ten featured apps on one ring. Drag it, use the arrows, or let it play. Click the front card to open it.</p>
          </div>
          <RingBand items={ring} />
        </div>
        <Wave />
      </section>

      {tour.length > 0 && (
        <section className="band alt" style={{ paddingTop: 80, paddingBottom: 104 }}>
          <div className="wrap" data-rise=""><Tour apps={tour} /></div>
          <Wave to="var(--hero)" />
        </section>
      )}

      <section className="band tiled" style={{ paddingTop: 88 }}>
        <div className="wrap row" style={{ gap: 40, alignItems: "flex-start" }}>
          <div className="stack" style={{ flex: "1 1 320px", minWidth: 0, gap: 14 }} data-rise="">
            <span className="eyebrow">Community ranked</span>
            <JumpText as="h2" className="display h2" text="Top apps." />
            <p className="lede" style={{ margin: 0 }}>One vote per person. The most upvoted apps rise to the top, and the leader becomes App of the Week.</p>
          </div>
          <ol style={{ flex: "2 1 600px", minWidth: 0, listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }} data-rise="">
            {top.map((a, i) => (
              <li key={a.slug} className="card hov" style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px" }}>
                <span className="mono faint" style={{ width: 22, textAlign: "right" }}>{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.poster ?? ""} alt="" width={84} height={52} loading="lazy" style={{ width: 84, height: 52, flex: "none", borderRadius: 10, objectFit: "cover", border: "1px solid var(--line)" }} />
                <Link href={`/apps/${a.slug}`} style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>{a.name}</span>
                  <span className="faint" style={{ display: "block", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.tagline}</span>
                </Link>
                <span className="chip hide-sm">{categoryById(a.category).label}</span>
                <UpvoteButton slug={a.slug} name={a.name} base={a.upvotes} />
              </li>
            ))}
          </ol>
        </div>
        <Wave />
      </section>

      <section className="band alt" style={{ paddingTop: 80 }}>
        <div className="wrap">
          <div className="center stack" style={{ gap: 12, marginBottom: 20 }} data-rise="">
            <span className="eyebrow">Explore by category</span>
            <JumpText as="h2" className="display h2" text="Pick a cube." />
            <p className="lede" style={{ margin: 0 }}>Hover to lift. Click to spin it open.</p>
          </div>
          <Cubes counts={counts} />
        </div>
        <Wave to="var(--hero)" />
      </section>

      <section className="band tiled violet" style={{ paddingTop: 88 }}>
        <div className="wrap">
          <div className="stack" style={{ gap: 12, marginBottom: 36 }} data-rise=""><span className="eyebrow">Shape what gets built</span><JumpText as="h2" className="display h2" text="You decide what's next." /></div>
          <div className="g2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {steps.map((s) => (
              <div key={s.n} className="card hov stack" style={{ padding: 22, gap: 12 }} data-rise="">
                <span className="display" style={{ fontSize: 40, color: "var(--accent-text)", lineHeight: 1 }}>{s.n}</span>
                <span className="display" style={{ fontSize: 20, fontWeight: 600 }}>{s.title}</span>
                <span className="muted" style={{ fontSize: 15, lineHeight: 1.55 }}>{s.body}</span>
                <span className="code" style={{ padding: "8px 12px", fontSize: 12.5, marginTop: "auto" }}>{s.code}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }} data-rise=""><Link href="/ideas" className="btn btn-accent btn-lg">Share an idea or pain point</Link></div>
        </div>
        <Wave />
      </section>

      <section className="band alt" style={{ paddingTop: 80, paddingBottom: 96 }}>
        <div className="wrap row" style={{ gap: 40, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 500px", minWidth: 0 }} data-rise="">
            <span className="eyebrow">Open source</span>
            <JumpText as="h2" className="display h3" style={{ margin: "12px 0 22px" }} text={`${collections.total.toLocaleString()}+ stars and counting.`} />
            <div className="g2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {collections.items.slice(0, 4).map((r) => (
                <a key={r.repo} href={`https://github.com/balavenkatesh3322/${r.repo}`} target="_blank" rel="noopener noreferrer" className="card hov stack" style={{ padding: 16, gap: 6 }}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span className="display" style={{ fontSize: 16, fontWeight: 600 }}>{r.name}</span><span className="mono" style={{ color: "var(--c-num)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}><IconStar size={12} />{r.stars.toLocaleString()}</span></span>
                  <span className="faint" style={{ fontSize: 13 }}>{r.desc}</span>
                </a>
              ))}
            </div>
          </div>
          <div style={{ flex: "1 1 420px", minWidth: 0 }} data-rise="">
            <span className="eyebrow">From the blog</span>
            <JumpText as="h2" className="display h3" style={{ margin: "12px 0 22px" }} text="Read the thinking." />
            <div className="stack" style={{ gap: 10 }}>
              {posts.map((p) => (
                <a key={p.link} href={p.link} target="_blank" rel="noopener noreferrer" className="card hov stack" style={{ padding: "16px 18px", gap: 6 }}>
                  {p.tags[0] && <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--accent-text)", textTransform: "uppercase" }}>{p.tags[0]}</span>}
                  <span className="display" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{p.title}</span>
                </a>
              ))}
              <Link href="/blog" style={{ color: "var(--accent-text)", fontWeight: 500, marginTop: 4 }}>All posts →</Link>
            </div>
          </div>
        </div>
        <Wave to="var(--hero)" />
      </section>

      <section id="maker" className="band tiled violet" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="wrap card row" style={{ gap: 28, alignItems: "center", padding: 30, boxShadow: "var(--shadow-lg)" }} data-rise="">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bala.jpg" alt="Bala Venkatesh" width={112} height={112} style={{ borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 4px var(--accent-soft), 0 0 0 5px var(--accent-line)" }} />
          <div className="stack" style={{ flex: "1 1 420px", minWidth: 0, gap: 8 }}>
            <span className="eyebrow">The maker</span>
            <JumpText as="h2" className="display h3" text="Hi, I'm Bala. I make AI you can see." />
            <blockquote className="maker-quote">I love building things, experimenting with ideas, and turning curiosity into <span className="grad-text">real-world products.</span></blockquote>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <a href={site.portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Know more about Bala ↗</a>
            <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Follow @ai.with.bala</a>
          </div>
        </div>
      </section>

      <ClosingCTA />
    </>
  );
}
