"use client";
import { useState } from "react";

export default function SubscribeForm({ source, id, light = false, cta = "Subscribe" }: { source: string; id: string; light?: boolean; cta?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [trap, setTrap] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source, website: trap }) });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error || "Something went wrong.");
      setState("done"); setMsg(d.already ? "You're already subscribed. Thank you!" : "You're in! Check your inbox for a welcome note.");
    } catch (err) {
      setState("error"); setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") return <p role="status" className="display" style={{ fontSize: 20, color: "var(--ok)", margin: 0 }}>✓ {msg}</p>;
  return (
    <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, width: "100%" }} noValidate>
      <label htmlFor={id} className="sr">Email address</label>
      <input id={id} className="field" style={{ flex: "1 1 220px", height: 52, background: light ? "var(--surface)" : undefined }} type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="sr" name="website" />
      <button type="submit" className="btn btn-accent btn-lg" disabled={state === "busy"}>{state === "busy" ? "Joining…" : cta}</button>
      {state === "error" && <p role="alert" style={{ flexBasis: "100%", margin: 0, fontSize: 14, color: "var(--accent-text)" }}>{msg}</p>}
    </form>
  );
}
