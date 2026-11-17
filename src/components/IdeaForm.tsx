"use client";
import { useState } from "react";
import type { IdeaKind, IdeaRow } from "@/lib/data";
import { useVotes } from "./VotesProvider";
import { useProgress } from "@/lib/progress";

const roles = ["Developer", "Founder", "Student", "Product manager", "Data scientist", "Teacher"];
const copy: Record<IdeaKind, { title: string; label: string; placeholder: string }> = {
  pain: { title: "Share a pain point", label: "…and I struggle with", placeholder: "e.g. Our docs chatbot answers confidently and wrongly, and we can't tell why." },
  idea: { title: "Suggest a new app", label: "I wish there was an app that…", placeholder: "e.g. Explains diffusion models step by step in 3D." },
  feature: { title: "Request a feature", label: "I wish I could…", placeholder: "e.g. Paste my own prompt and watch it run." },
};

export default function IdeaForm({ kind, appSlug, apps, compact = false, onCreated }: {
  kind: IdeaKind; appSlug?: string; apps?: { slug: string; name: string }[]; compact?: boolean; onCreated: (i: IdeaRow) => void;
}) {
  const { notify } = useVotes();
  const { award, update } = useProgress();
  const [role, setRole] = useState(roles[0]);
  const [text, setText] = useState("");
  const [freq, setFreq] = useState("Every week");
  const [pay, setPay] = useState<"yes" | "maybe" | "no">("maybe");
  const [email, setEmail] = useState("");
  const [app, setApp] = useState(appSlug ?? apps?.[0]?.slug ?? "");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const c = copy[kind];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 3) { notify("Please add a few more words."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind, title: text.trim(), appSlug: kind === "feature" ? app : undefined, role: compact ? undefined : role,
          frequency: kind === "pain" ? freq : undefined, wouldPay: kind === "pain" ? pay : undefined, email, website: trap,
        }),
      });
      const d = await res.json();
      if (d.demo) { notify(d.error || "This feature is a work in progress. It opens very soon!"); return; }
      if (!res.ok || !d.ok) throw new Error(d.error || "Could not save right now.");
      if (d.idea) onCreated(d.idea as IdeaRow);
      setText(""); setEmail("");
      award("idea", 20); update((p) => ({ ...p, ideas: p.ideas + 1 }));
      notify("Thank you! Your idea is in. +20 XP");
    } catch (err) { notify(err instanceof Error ? err.message : "Could not save right now."); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className={compact ? "stack" : "card stack"} style={{ padding: compact ? 0 : 26, gap: 16 }}>
      {!compact && <div><span className="mono" style={{ fontSize: 11, color: "var(--accent-text)" }}>+20 XP</span><h2 className="display" style={{ fontSize: 26, marginTop: 4 }}>{c.title}</h2></div>}
      {!compact && (
        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>I am a…</legend>
          <div className="row" style={{ gap: 6 }}>
            {roles.map((r) => (<button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)} style={{ height: 36, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 500, border: `1px solid ${role === r ? "var(--ink)" : "var(--line)"}`, background: role === r ? "var(--ink)" : "transparent", color: role === r ? "var(--bg)" : "var(--ink2)" }}>{r}</button>))}
          </div>
        </fieldset>
      )}
      {kind === "feature" && apps && !appSlug && (
        <label className="lbl">For which app?<select className="field" value={app} onChange={(e) => setApp(e.target.value)}>{apps.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}</select></label>
      )}
      <label className="lbl">{c.label}
        <textarea className="field" rows={compact ? 2 : 3} maxLength={200} value={text} onChange={(e) => setText(e.target.value)} placeholder={c.placeholder} required />
        <span className="faint" style={{ fontSize: 12, fontWeight: 400, alignSelf: "flex-end" }}>{text.length}/200</span>
      </label>
      {kind === "pain" && !compact && (
        <div className="g2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <label className="lbl">How often?<select className="field" value={freq} onChange={(e) => setFreq(e.target.value)}><option>Every day</option><option>Every week</option><option>Every month</option></select></label>
          <label className="lbl">Would you pay for a fix?<select className="field" value={pay} onChange={(e) => setPay(e.target.value as "yes" | "maybe" | "no")}><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No, free only</option></select></label>
        </div>
      )}
      {!compact && <label className="lbl">Email, so you hear when it ships (optional)<input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" /></label>}
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr" value={trap} onChange={(e) => setTrap(e.target.value)} name="website" />
      <button type="submit" className="btn btn-accent btn-lg" disabled={busy}>{busy ? "Sending…" : compact ? "Request" : "Submit"}</button>
    </form>
  );
}
