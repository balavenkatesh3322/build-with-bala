"use client";
import Link from "next/link";
import { useState } from "react";
import type { AppRow } from "@/lib/data";
import VideoPlayer from "./VideoPlayer";
import { UpvoteButton } from "./UpvoteButton";
import JumpText from "./JumpText";

export default function Tour({ apps }: { apps: AppRow[] }) {
  const [i, setI] = useState(0);
  const a = apps[i];
  if (!a) return null;
  const q = (s: string) => s.replace(/"/g, "'");
  return (
    <div>
      <div className="center stack" style={{ marginBottom: 36, gap: 12 }}>
        <span className="eyebrow">Take the tour</span>
        <JumpText as="h2" className="display h2" text="See it running." />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <div role="tablist" aria-label="Featured apps" className="tabs">
          {apps.map((x, n) => (<button key={x.slug} type="button" role="tab" aria-selected={n === i} className="tab" style={{ height: 40, padding: "0 18px", fontSize: 15 }} onClick={() => setI(n)}>{x.name.replace(" 3D", "")}</button>))}
        </div>
      </div>
      <div className="card" style={{ display: "flex", flexWrap: "wrap", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ flex: "1 1 620px", minWidth: 0 }}>
          {a.video ? <VideoPlayer key={a.slug} src={a.video} vertical={a.videoVertical} poster={a.poster} title={a.name} ratio="16 / 10" /> : null}
        </div>
        <div className="stack" style={{ flex: "1 1 380px", minWidth: 0, borderLeft: "1px solid var(--line)" }}>
          <div className="mono faint" style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", fontSize: 12 }}><span style={{ color: "var(--ink)", borderBottom: "2px solid var(--accent)", paddingBottom: 6 }}>{a.slug}.ts</span></div>
          <div className="code" style={{ border: 0, borderRadius: 0, padding: "18px 20px", flex: 1, fontSize: 13.5 }}>
            <div><span className="k">const</span> <span className="f">{a.slug.replace(/-(.)/g, (_, c) => c.toUpperCase())}</span> = {"{"}</div>
            <div style={{ paddingLeft: 18 }}>problem: <span className="s">&quot;{q(a.problem.split(". ")[0])}&quot;</span>,</div>
            <div style={{ paddingLeft: 18 }}>solution: <span className="s">&quot;{q(a.solution.split(". ")[0])}&quot;</span>,</div>
            <div style={{ paddingLeft: 18 }}>value: <span className="s">&quot;{q(a.value.split(". ")[0])}&quot;</span>,</div>
            <div style={{ paddingLeft: 18 }}>price: <span className="n">0</span>, signup: <span className="k">false</span></div>
            <div>{"}"}</div>
          </div>
          <div className="row" style={{ gap: 10, padding: "16px 20px", borderTop: "1px solid var(--line)" }}>
            {a.liveUrl && <a href={a.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent">Try it live ↗</a>}
            <Link href={`/apps/${a.slug}`} className="btn btn-ghost">How it&apos;s built</Link>
            <UpvoteButton slug={a.slug} name={a.name} base={a.upvotes} inline label />
          </div>
        </div>
      </div>
    </div>
  );
}
