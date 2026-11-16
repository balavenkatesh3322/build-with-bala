"use client";
import { useEffect, useState } from "react";
import { useVotes } from "./VotesProvider";
import { IconCheck, IconShare } from "./Icons";

export default function ShareMenu({ path, title, text, large = false }: { path: string; title: string; text: string; large?: boolean }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const { notify } = useVotes();
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}${path}`;
  const enc = encodeURIComponent;
  const item = { role: "menuitem" as const, className: "btn btn-ghost btn-sm", style: { justifyContent: "flex-start" } as const, target: "_blank", rel: "noopener noreferrer" };

  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { notify("Could not copy. Select the link manually."); }
  }
  async function toggle() {
    if (typeof navigator !== "undefined" && navigator.share && window.matchMedia("(max-width: 700px)").matches) {
      try { await navigator.share({ title, text, url }); return; } catch { /* cancelled */ }
    }
    setOpen((o) => !o);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button type="button" className={`btn btn-ghost${large ? " btn-lg" : ""}`} onClick={toggle} aria-expanded={open}><IconShare size={16} /> Share</button>
      {open && (
        <div className="card" role="menu" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 20, padding: 12, display: "flex", flexDirection: "column", gap: 6, minWidth: 220, boxShadow: "var(--shadow-lg)" }}>
          <button type="button" role="menuitem" className="btn btn-ghost btn-sm" onClick={copy} style={{ justifyContent: "flex-start" }}>{copied ? <><IconCheck size={14} /> Link copied</> : "Copy link"}</button>
          <a {...item} href={`https://wa.me/?text=${enc(`${text} ${url}`)}`}>WhatsApp</a>
          <a {...item} href={`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`}>X (Twitter)</a>
          <a {...item} href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}>LinkedIn</a>
        </div>
      )}
    </div>
  );
}
