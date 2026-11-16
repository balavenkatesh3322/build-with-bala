"use client";
import { useState } from "react";
import type { IdeaRow } from "@/lib/data";
import IdeaForm from "./IdeaForm";
import { IdeaVoteButton } from "./UpvoteButton";

const label: Record<string, string> = { open: "Open", "under-review": "Under review", planned: "Planned", building: "Building", shipped: "Shipped" };

export default function FeatureRequests({ appSlug, appName, initial }: { appSlug: string; appName: string; initial: IdeaRow[] }) {
  const [items, setItems] = useState(initial);
  return (
    <div className="stack" style={{ gap: 16 }}>
      <IdeaForm compact kind="feature" appSlug={appSlug} onCreated={(i) => setItems((x) => [i, ...x])} />
      <div className="stack" style={{ gap: 10 }}>
        {items.length === 0 && <p className="faint" style={{ margin: 0, fontSize: 14 }}>No requests for {appName} yet. Be the first!</p>}
        {[...items].sort((a, b) => b.votes - a.votes).map((i) => (
          <div key={i.id} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px" }}>
            <IdeaVoteButton id={i.id} title={i.title} base={i.votes} cta={["vote", "voted"]} />
            <span style={{ flex: 1, fontWeight: 500 }}>{i.title}</span>
            <span className="chip">{label[i.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
