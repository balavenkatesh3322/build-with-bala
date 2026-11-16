"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { RingItem } from "./Hero3D";
import { UpvoteButton } from "./UpvoteButton";
import { useMotionPaused } from "@/lib/motion";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false, loading: () => <div className="skeleton" style={{ position: "absolute", inset: "6% 10%" }} aria-hidden="true" /> });

export type RingApp = RingItem & { tagline: string; category: string; status: string; liveUrl: string | null; upvotes: number };

export default function RingBand({ items }: { items: RingApp[] }) {
  const paused = useMotionPaused();
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [focus, setFocus] = useState(0);
  const n = items.length;

  useEffect(() => {
    try { const c = document.createElement("canvas"); setWebgl(Boolean(c.getContext("webgl2") || c.getContext("webgl"))); } catch { setWebgl(false); }
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver((e) => setVisible(e.some((x) => x.isIntersecting)), { rootMargin: "200px" });
    io.observe(el); return () => io.disconnect();
  }, []);

  const go = (d: number) => setFocus((f) => (f + d + n) % n);
  const app = items[focus];

  return (
    <div className="carousel" ref={box}
      onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } }}>
      <div className="carousel-stage" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Featured apps. Use the left and right arrow keys to browse.">
        <div aria-hidden="true" className="ring-glow" />
        <div aria-hidden="true" className="carousel-floor" />
        {webgl && visible && <Hero3D items={items} paused={paused} focus={focus} onFocus={setFocus} />}
        {webgl === false && app?.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.poster} alt="" className="carousel-fallback" />
        )}
        <button type="button" className="carousel-arrow prev" onClick={() => go(-1)} aria-label="Previous app">‹</button>
        <button type="button" className="carousel-arrow next" onClick={() => go(1)} aria-label="Next app">›</button>
      </div>

      {app && (
        <div className="carousel-info card" aria-live="polite">
          <div className="carousel-meta">
            <span className="mono faint" style={{ fontSize: 12 }}>{String(focus + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
            <span className="chip">{app.category}</span>
            {app.status === "live" && <span className="chip" style={{ color: "var(--ok)", borderColor: "color-mix(in srgb, var(--ok) 40%, transparent)" }}>Live</span>}
          </div>
          <div className="carousel-body">
            <div style={{ minWidth: 0 }}>
              <h3 className="display" style={{ fontSize: "clamp(1.5rem, 1.2rem + 1vw, 2.1rem)" }}>{app.name}</h3>
              <p className="muted" style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.5 }}>{app.tagline}</p>
            </div>
            <div className="carousel-actions">
              <UpvoteButton slug={app.slug} name={app.name} base={app.upvotes} />
              {app.liveUrl && <a href={app.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent">Try it live ↗</a>}
              <Link href={`/apps/${app.slug}`} className="btn btn-ghost">How it&apos;s built</Link>
            </div>
          </div>
          <div className="carousel-dots" role="tablist" aria-label="Choose an app">
            {items.map((it, i) => (
              <button key={it.slug} type="button" role="tab" aria-selected={i === focus} aria-label={it.name} className={`carousel-dot${i === focus ? " on" : ""}`} onClick={() => setFocus(i)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
