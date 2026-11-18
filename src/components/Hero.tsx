"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import JumpText from "./JumpText";
import type { FieldHandle } from "./ClayField";
import { IconCheck, IconPause, IconPlay, IconStar, Logo, Wave } from "./Icons";
import { setMotionPaused, useMotionPaused } from "@/lib/motion";

const ClayField = dynamic(() => import("./ClayField"), { ssr: false });

// Static specks scattered over the hero, like the reference.
const SPECKS = [
  [1.4, 36, 5, 0.3, "#f2a65a"], [45.5, 4, 5.7, 0.5, "#38bdf8"], [54, 12, 4.9, 0.3, "#e91e63"], [2.6, 12, 4.5, 0.5, "#8b5cf6"],
  [17, 8, 3.8, 0.4, "#ffffff"], [71.7, 4, 4.7, 0.25, "#38bdf8"], [39.9, 7, 3.5, 0.6, "#e91e63"], [26.6, 96, 7.7, 0.5, "#8b5cf6"],
  [30.4, 90, 3.3, 0.45, "#ffffff"], [86, 40, 4, 0.35, "#f2a65a"], [62, 70, 3.4, 0.4, "#8b5cf6"], [95, 8, 4.4, 0.4, "#e91e63"],
] as const;

export default function Hero({ stats }: { stats: { apps: number; live: number; stars: number } }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const paused = useMotionPaused();
  const field = useRef<FieldHandle>(null);
  const copy = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  const pump = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    field.current?.puff(r.left + r.width / 2, r.top + r.height / 2);
    if (typeof el.animate === "function") el.animate([{ transform: "scaleY(.8)" }, { transform: "scaleY(1)" }], { duration: 600, easing: "cubic-bezier(.34,1.56,.64,1)" });
  };
  const command = "open bala-app-store --free";
  const doCopy = async () => { try { await navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ } };

  return (
    <section className={`hero-root${failed ? " nogl" : ""}`}>
      <div className="hero-bg" aria-hidden="true">
        {SPECKS.map(([x, y, s, o, c], i) => (
          <span key={i} className="hero-speck" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, opacity: o, background: `radial-gradient(closest-side, ${c} 50%, transparent)` }} />
        ))}
      </div>
      <div className="hero-vignette" aria-hidden="true" />
      {mounted && !failed && (
        <ClayField ref={field} theme={resolvedTheme === "light" ? "light" : "dark"} paused={paused} avoid={copy} onFail={() => setFailed(true)} />
      )}

      <div className="hero-copy">
        <div ref={copy} className="hero-copy-inner">
          <div className="hero-mark"><Logo size={68} /></div>
          <JumpText as="h1" playOnLoad className="hero-title"
            segments={[
              { text: "Learn" },
              { text: "AI", accent: true, extrude: true, onEnter: pump },
              { text: ".", glue: true },
              { text: "Build with", newLine: true },
              { text: "Bala", accent: true, squiggle: true },
              { text: ".", glue: true },
            ]} />
          <div className="hero-actions">
            <Link href="#store" className="btn btn-accent btn-lg">Open the App Store <span aria-hidden="true">→</span></Link>
            <Link href="/today" className="btn btn-ghost btn-lg glass">Today&apos;s 5-minute drop</Link>
          </div>
          <div className="hero-chips">
            <span className="hero-chip mono"><span className="faint" aria-hidden="true">›_</span><code>{command}</code>
              <button type="button" onClick={doCopy} aria-label="Copy command" className="chip-copy">{copied ? <IconCheck size={14} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect width="13" height="13" x="9" y="9" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>}</button>
            </span>
            <span className="hero-chip"><strong>{stats.live}</strong> live to try · <strong>{stats.apps}</strong> apps</span>
            <span className="hero-chip"><IconStar size={13} /> <strong>{stats.stars > 0 ? stats.stars.toLocaleString() : "2,100"}+</strong> GitHub stars</span>
          </div>
        </div>
      </div>

      <button type="button" className="hero-pause glass" onClick={() => setMotionPaused(!paused)} aria-pressed={paused}>
        {paused ? <IconPlay size={11} /> : <IconPause />}{paused ? "Play motion" : "Pause motion"}
      </button>
      <span className="hero-hint mono" aria-hidden="true">Move, tap or click a shape</span>
      <Wave />
    </section>
  );
}
