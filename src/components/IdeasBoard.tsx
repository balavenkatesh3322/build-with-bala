"use client";
import { Wave } from "./Icons";
import { useMemo, useState } from "react";
import type { IdeaKind, IdeaRow, IdeaStatus } from "@/lib/data";
import IdeaForm from "./IdeaForm";
import { IdeaVoteButton } from "./UpvoteButton";
import JumpText from "./JumpText";

const kinds: { id: IdeaKind; label: string }[] = [{ id: "pain", label: "Pain points" }, { id: "idea", label: "New app ideas" }, { id: "feature", label: "Feature requests" }];
const statusLabel: Record<IdeaStatus, string> = { open: "Open", "under-review": "Under review", planned: "Planned", building: "Building", shipped: "Shipped" };
const statusColor: Record<IdeaStatus, string> = { open: "var(--ink3)", "under-review": "var(--ink3)", planned: "var(--violet)", building: "var(--accent-text)", shipped: "var(--ok)" };
const columns: { id: IdeaStatus[]; name: string; dot: string }[] = [
  { id: ["open", "under-review"], name: "Under review", dot: "var(--ink3)" },
  { id: ["planned"], name: "Planned", dot: "var(--violet)" },
  { id: ["building"], name: "Building", dot: "var(--accent)" },
  { id: ["shipped"], name: "Shipped", dot: "var(--ok)" },
];

export default function IdeasBoard({ initial, apps, live }: { initial: IdeaRow[]; apps: { slug: string; name: string }[]; live: boolean }) {
  const [kind, setKind] = useState<IdeaKind>("pain");
  const [items, setItems] = useState<IdeaRow[]>(initial);
  const appName = useMemo(() => new Map(apps.map((a) => [a.slug, a.name])), [apps]);
  const list = items.filter((i) => i.kind === kind);

  return (
    <>
      <section className="band tiled violet" style={{ paddingTop: 64, paddingBottom: 104 }}>
        <div className="wrap center stack" style={{ gap: 14 }}>
          <span className="eyebrow">Ideas · pain points · roadmap</span>
          <JumpText as="h1" playOnLoad className="display h1" style={{ maxWidth: 900, lineHeight: 1.02 }} segments={[{ text: "Tell me what's" }, { text: "painful", accent: true, squiggle: true }, { text: ". I'll build the fix, in public.", glue: true }]} />
          <p className="lede" style={{ margin: 0, maxWidth: 660 }}>Pain points and ideas are voted on, and the top ones go on the roadmap. When something ships, everyone who asked gets an email and credit.</p>
          <div role="tablist" aria-label="Type" className="tabs" style={{ marginTop: 8 }}>
            {kinds.map((k) => (<button key={k.id} type="button" role="tab" aria-selected={kind === k.id} className="tab" onClick={() => setKind(k.id)}>{k.label}</button>))}
          </div>
        </div>
        <Wave />
      </section>

      <section className="band alt" style={{ paddingTop: 56 }}>
        <div className="wrap row" style={{ gap: 28, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 400px", minWidth: 0 }}>
            <IdeaForm key={kind} kind={kind} apps={apps} onCreated={(i) => setItems((x) => [i, ...x])} />
          </div>
          <div style={{ flex: "999 1 560px", minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
              <h2 className="display h3">Most wanted.</h2><span className="mono faint" style={{ fontSize: 12 }}>sorted by votes</span>
            </div>
            {list.length === 0 && <div className="card center stack" style={{ padding: 36 }}><p className="muted" style={{ margin: 0 }}>Nothing here yet. Be the first to share one.</p></div>}
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[...list].sort((a, b) => b.votes - a.votes).map((i) => (
                <li key={i.id} className="card" style={{ padding: "16px 18px", display: "flex", gap: 16, alignItems: "center" }}>
                  <IdeaVoteButton id={i.id} title={i.title} base={i.votes} cta={kind === "pain" ? ["me too", "you too"] : ["vote", "voted"]} />
                  <div className="stack" style={{ flex: 1, minWidth: 0, gap: 6 }}>
                    <div className="row" style={{ gap: 6 }}>
                      {i.appSlug && <span className="chip">{appName.get(i.appSlug) ?? i.appSlug}</span>}
                      <span className="chip" style={{ color: statusColor[i.status] }}>{statusLabel[i.status]}</span>
                    </div>
                    <span className="display" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, letterSpacing: "-.01em" }}>{i.title}</span>
                    {i.role && <span className="faint" style={{ fontSize: 13 }}>Shared by a {i.role.toLowerCase()}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="band tiled" style={{ paddingTop: 88 }}>
        <div className="wrap">
          <span className="eyebrow">Public roadmap</span>
          <h2 className="display h2" style={{ margin: "12px 0 28px" }}>From idea to shipped.</h2>
          <div className="g2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {columns.map((c) => {
              const col = items.filter((i) => c.id.includes(i.status));
              return (
                <div key={c.name} className="card stack" style={{ padding: 16, gap: 10, background: "var(--bg2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot }} />{c.name}</span>
                    <span className="mono faint" style={{ fontSize: 12 }}>{col.length}</span>
                  </div>
                  {col.length === 0 && <span className="faint" style={{ fontSize: 13 }}>Nothing here yet</span>}
                  {col.slice(0, 6).map((i) => (<div key={i.id} className="card stack" style={{ padding: 12, gap: 4 }}><span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.35 }}>{i.title}</span><span className="mono faint" style={{ fontSize: 11 }}>{i.votes} votes · {i.kind === "idea" ? "new app" : i.kind === "pain" ? "pain point" : "feature"}</span></div>))}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
