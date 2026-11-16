"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import type { AppRow } from "@/lib/data";
import { categoryById, statusCta, statusLabel } from "@/lib/site";
import { appCta, initials } from "@/lib/ui";
import { UpvoteButton } from "./UpvoteButton";

const statusColor: Record<string, string> = { live: "#12b886", "open-source": "#c4b5fd", coming: "#f06695", lab: "#aab4c6" };

export default function AppCard({ app }: { app: AppRow }) {
  const cat = categoryById(app.category);
  const cta = appCta(app);
  const [hover, setHover] = useState(false);
  const vid = useRef<HTMLVideoElement>(null);
  const href = `/apps/${app.slug}`;

  return (
    <article className="card app-card" data-tilt="" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <Link href={href} className="thumb" aria-label={`${app.name}: open details`} tabIndex={-1}>
        {app.poster ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={app.poster} alt="" loading="lazy" />
        ) : (
          <span className="tile" style={{ background: cat.grad }}><span className="display" style={{ fontSize: 46 }}>{initials(app.name)}</span></span>
        )}
        {hover && app.video && (
          <video ref={vid} src={app.video} muted loop autoPlay playsInline preload="none" style={{ position: "absolute", inset: 0 }} aria-hidden="true" />
        )}
        <span className="pill-over" style={{ left: 10, top: 10, color: statusColor[app.status] }}>{statusLabel[app.status]}</span>
        {app.video && <span className="pill-over" style={{ right: 10, bottom: 10 }}>▶ demo</span>}
      </Link>
      <div className="stack" style={{ padding: "16px 18px 18px", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <span className="mono" style={{ display: "block", fontSize: 10.5, letterSpacing: ".1em", color: "var(--accent-text)", textTransform: "uppercase" }}>{cat.label}</span>
            <Link href={href} className="display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.01em" }}>{app.name}</Link>
          </div>
          <UpvoteButton slug={app.slug} name={app.name} base={app.upvotes} />
        </div>
        <p className="muted" style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}><strong style={{ color: "var(--ink)", fontWeight: 500 }}>Solves:</strong> {app.problem.split(". ")[0].replace(/\.$/, "")}.</p>
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 6 }}>
          {cta.external ? (
            <a href={cta.href} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm" style={{ flex: 1 }}>{statusCta[app.status]} ↗</a>
          ) : (
            <Link href={cta.href} className="btn btn-accent btn-sm" style={{ flex: 1 }}>{statusCta[app.status]}</Link>
          )}
          <Link href={href} className="btn btn-ghost btn-sm">How it&apos;s built</Link>
        </div>
      </div>
    </article>
  );
}
