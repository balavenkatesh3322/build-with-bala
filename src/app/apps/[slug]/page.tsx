import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getApp, getApps, getIdeas } from "@/lib/data";
import { categoryById, site, statusLabel, whatsappLink } from "@/lib/site";
import { appsData } from "@/lib/apps-data";
import { appCta, initials } from "@/lib/ui";
import { UpvoteButton } from "@/components/UpvoteButton";
import ShareMenu from "@/components/ShareMenu";
import VideoPlayer from "@/components/VideoPlayer";
import FeatureRequests from "@/components/FeatureRequests";
import SubscribeForm from "@/components/SubscribeForm";
import { Wave } from "@/components/Icons";
import JumpText from "@/components/JumpText";
import ScreenshotGallery from "@/components/ScreenshotGallery";

export const revalidate = 60;
export function generateStaticParams() { return appsData.map((a) => ({ slug: a.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const app = await getApp((await params).slug);
  if (!app) return {};
  const url = `/apps/${app.slug}`;
  return {
    title: app.name,
    description: `${app.hook} ${app.tagline}`,
    keywords: [app.name, ...app.stack, ...app.audience, "Bala App Store", "Build with Bala"],
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: `${app.name} · ${site.name}`, description: app.hook },
    twitter: { card: "summary_large_image", title: `${app.name} · ${site.name}`, description: app.hook },
  };
}

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [app, all, ideas] = await Promise.all([getApp(slug), getApps(), getIdeas()]);
  if (!app) notFound();
  const cat = categoryById(app.category);
  const cta = appCta(app);
  const related = all.filter((a) => a.slug !== app.slug && a.category === app.category).slice(0, 3);
  const feats = ideas.ideas.filter((i) => i.kind === "feature" && i.appSlug === app.slug);
  const story = app.story;
  const camel = app.slug.replace(/-(.)/g, (_, c: string) => c.toUpperCase());
  const jsonLd = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: app.name, description: app.tagline, url: `${site.url}/apps/${app.slug}`, image: app.poster ? `${site.url}${app.poster}` : `${site.url}/apps/${app.slug}/opengraph-image`, ...(story ? { screenshot: story.shots.map((x) => `${site.url}${x.src}`) } : {}), applicationCategory: "EducationalApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: 0, priceCurrency: "USD" }, author: { "@type": "Person", name: site.owner, url: site.portfolio } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="band tiled" style={{ paddingTop: 40, paddingBottom: 112 }}>
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="mono faint" style={{ fontSize: 12, letterSpacing: ".1em", display: "flex", gap: 10, marginBottom: 36, textTransform: "uppercase", flexWrap: "wrap" }}>
            <Link href="/apps">Bala App Store</Link><span aria-hidden="true">/</span><Link href={`/apps?category=${cat.id}`}>{cat.label}</Link><span aria-hidden="true">/</span><span style={{ color: "var(--accent-text)" }}>{app.name}</span>
          </nav>
          <div className="row" style={{ gap: 40, alignItems: "center" }}>
            <div className="stack" style={{ flex: "1 1 460px", minWidth: 0, gap: 20 }}>
              <div className="row" style={{ gap: 8 }}>
                <span className="chip chip-accent">{statusLabel[app.status]}</span>
                <span className="chip">{app.status === "coming" ? "Waitlist open" : "Free · no sign-up"}</span>
              </div>
              <h1 className="display h1" style={{ fontSize: "clamp(2.2rem, 1.2rem + 3.6vw, 3.75rem)", lineHeight: 1 }}>{app.hook}</h1>
              <p className="lede" style={{ margin: 0 }}><strong style={{ color: "var(--ink)" }}>{app.name}.</strong> {app.tagline}</p>
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                {cta.external
                  ? <a href={cta.href} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg">{app.status === "live" ? "Try it live" : app.status === "coming" ? "Join waitlist" : "View the code"} ↗</a>
                  : <Link href={cta.href} className="btn btn-accent btn-lg">Join the waitlist</Link>}
                <UpvoteButton slug={app.slug} name={app.name} base={app.upvotes} inline label />
                <ShareMenu path={`/apps/${app.slug}`} title={app.name} text={`${app.name}: ${app.tagline}`} large />
              </div>
              {app.repoUrl && app.status !== "open-source" && <a href={app.repoUrl} target="_blank" rel="noopener noreferrer" className="faint" style={{ fontSize: 14 }}>Source on GitHub ↗</a>}
            </div>
            <div style={{ flex: "1 1 540px", minWidth: 0 }}>
              <div className="card browser-frame" style={{ overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                  <span className="mono faint" style={{ marginLeft: 10, fontSize: 12 }}>{app.liveUrl ? app.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : app.slug}</span>
                </div>
                {app.video ? <VideoPlayer src={app.video} vertical={app.videoVertical} poster={app.poster} title={app.name} ratio="16 / 10" />
                  : app.poster ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={app.poster} alt={`${app.name} preview`} style={{ display: "block", width: "100%", aspectRatio: "16 / 10", objectFit: "cover" }} />
                  : <div style={{ aspectRatio: "16 / 10", background: cat.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><span className="display" style={{ fontSize: 72 }}>{initials(app.name)}</span></div>}
              </div>
            </div>
          </div>
        </div>
        <Wave />
      </section>

      <section className="band alt" style={{ paddingTop: 64 }}>
        <div className="wrap">
          <span className="eyebrow">Why it exists</span>
          <JumpText as="h2" className="display h2" style={{ margin: "12px 0 28px" }} text="Problem. Solution. Value." />
          <div className="g2">
            {[{ n: "01", k: "PROBLEM", t: app.problem }, { n: "02", k: "SOLUTION", t: app.solution }, { n: "03", k: "VALUE", t: app.value }].map((b, i) => (
              <div key={b.k} className="card hov stack" style={{ padding: 24, gap: 12, ...(i === 2 ? { borderColor: "var(--accent-line)", background: "linear-gradient(160deg, var(--accent-soft), var(--surface) 60%)" } : {}) }}>
                <span className="display" style={{ fontSize: 36, color: i === 2 ? "var(--accent-text)" : "var(--ink3)" }}>{b.n}</span>
                <span className="mono" style={{ fontSize: 12, letterSpacing: ".12em", color: i === 2 ? "var(--accent-text)" : "var(--ink3)" }}>{b.k}</span>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>{b.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {story && story.shots.length > 0 && (
        <section className="band tiled" style={{ paddingTop: 88, paddingBottom: 104 }}>
          <div className="wrap">
            <div className="stack" style={{ gap: 12, marginBottom: 28 }} data-rise="">
              <span className="eyebrow">Screenshots</span>
              <JumpText as="h2" className="display h2" text="See it in action." />
            </div>
            <div data-rise=""><ScreenshotGallery shots={story.shots} name={app.name} /></div>
          </div>
          <Wave />
        </section>
      )}

      {story && (
        <section className="band alt" style={{ paddingTop: 72 }}>
          <div className="wrap">
            <div className="stack" style={{ gap: 12, marginBottom: 28 }} data-rise="">
              <span className="eyebrow">The story</span>
              <JumpText as="h2" className="display h2" text={`Inside ${app.name}.`} />
            </div>
            <div className="story">
              <div className="stack" style={{ gap: 14 }}>
                <div className="card story-block" data-rise="">
                  <h3><span className="story-ico" aria-hidden="true">▶</span>How to use it</h3>
                  <ol className="story-steps">{story.howToUse.map((h) => <li key={h}><span>{h}</span></li>)}</ol>
                </div>
                <div className="card story-block" data-rise="">
                  <h3><span className="story-ico" aria-hidden="true">{"</>"}</span>How it&apos;s built</h3>
                  <p>{story.built}</p>
                </div>
                <div className="card story-block" data-rise="">
                  <h3><span className="story-ico" aria-hidden="true">↗</span>Why it matters for businesses</h3>
                  <p>{story.business}</p>
                </div>
                <div className="card story-block" data-rise="">
                  <h3><span className="story-ico" aria-hidden="true">●</span>In real life</h3>
                  <p>{story.realLife}</p>
                </div>
              </div>
              <aside className="card why-card" data-rise="">
                <span className="eyebrow">Why I built it</span>
                <blockquote>{story.why}</blockquote>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/bala.jpg" alt="" width={44} height={44} style={{ borderRadius: "50%", objectFit: "cover" }} />
                  <span><strong className="display" style={{ display: "block", fontSize: 16 }}>Bala Venkatesh</strong><span className="faint" style={{ fontSize: 13 }}>Maker of {app.name}</span></span>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      <section className="band tiled" style={{ paddingTop: 88 }}>
        <div className="wrap row" style={{ gap: 32, alignItems: "flex-start" }}>
          <div className="stack" style={{ flex: "999 1 640px", minWidth: 0, gap: 48 }}>
            <div>
              <span className="eyebrow">Under the hood</span>
              <h2 className="display h3" style={{ margin: "12px 0 20px" }}>How it&apos;s built.</h2>
              <div className="code" style={{ padding: "20px 22px", overflowX: "auto" }}>
                <div><span className="c">{`// ${app.slug} · ${cat.label}`}</span></div>
                <div><span className="k">export const</span> <span className="f">{camel}</span> = {"{"}</div>
                <div style={{ paddingLeft: 18 }}>stack: [{app.stack.map((s, i) => <span key={s}><span className="s">&quot;{s}&quot;</span>{i < app.stack.length - 1 ? ", " : ""}</span>)}],</div>
                <div style={{ paddingLeft: 18 }}>audience: [{app.audience.map((s, i) => <span key={s}><span className="s">&quot;{s}&quot;</span>{i < app.audience.length - 1 ? ", " : ""}</span>)}],</div>
                <div style={{ paddingLeft: 18 }}>status: <span className="s">&quot;{app.status}&quot;</span>, price: <span className="n">0</span></div>
                <div>{"}"}</div>
              </div>
            </div>
            <div>
              <span className="eyebrow">Shape what&apos;s next</span>
              <h2 className="display h3" style={{ margin: "12px 0 18px" }}>Feature requests.</h2>
              <FeatureRequests appSlug={app.slug} appName={app.name} initial={feats} />
            </div>
          </div>
          <aside className="stack" style={{ flex: "1 1 320px", minWidth: 0, gap: 14 }}>
            <div className="card stack" style={{ padding: 22, gap: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/bala.jpg" alt="Bala Venkatesh" width={48} height={48} style={{ borderRadius: "50%", objectFit: "cover" }} />
                <div><p className="display" style={{ fontSize: 16, fontWeight: 600 }}>Made by Bala</p><p className="faint" style={{ margin: 0, fontSize: 13 }}>Builds in public, every week</p></div>
              </div>
              <a href={site.portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Know more about Bala ↗</a>
            </div>
            <div className="card stack" style={{ padding: 22, gap: 10, borderColor: "rgba(37,211,102,.35)" }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: "#25d366" }}>QUESTION ABOUT THIS APP?</span>
              <p className="display" style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.3 }}>Ask Bala directly on WhatsApp.</p>
              <a href={whatsappLink(`Hi Bala, I have a question about ${app.name}.`)} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: "#25d366", color: "#06250f", fontWeight: 700 }}>Chat on WhatsApp</a>
            </div>
            <div className="card stack" style={{ padding: 22, gap: 12 }}>
              <p className="display" style={{ fontSize: 18, fontWeight: 600 }}>Get the next app first</p>
              <SubscribeForm source={`app:${app.slug}`} id="app-email" cta="Subscribe" />
            </div>
          </aside>
        </div>
        <Wave />
      </section>

      {related.length > 0 && (
        <section className="band alt" style={{ paddingTop: 64 }}>
          <div className="wrap">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
              <div><span className="eyebrow">Keep exploring</span><h2 className="display h3" style={{ marginTop: 12 }}>Related apps.</h2></div>
              <Link href="/apps" style={{ color: "var(--accent-text)", fontWeight: 500 }}>All apps →</Link>
            </div>
            <div className="g3">
              {related.map((r) => (
                <Link key={r.slug} href={`/apps/${r.slug}`} className="card hov" style={{ overflow: "hidden" }}>
                  <div className="thumb">{r.poster ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.poster} alt="" loading="lazy" /> : <span className="tile" style={{ background: cat.grad }}><span className="display" style={{ fontSize: 44 }}>{initials(r.name)}</span></span>}</div>
                  <span style={{ display: "block", padding: "14px 16px" }}><span className="mono" style={{ display: "block", fontSize: 11, color: "var(--accent-text)", textTransform: "uppercase" }}>{cat.label}</span><span className="display" style={{ fontSize: 18, fontWeight: 600 }}>{r.name}</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
