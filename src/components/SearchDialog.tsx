"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch } from "./Icons";
import { statusLabel } from "@/lib/site";

type Hit = { slug: string; name: string; tagline: string; status: string };

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    setBusy(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((d) => { setHits(d.apps ?? []); setActive(0); }).catch(() => setHits([])).finally(() => setBusy(false));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const go = (slug: string) => { onClose(); router.push(`/apps/${slug}`); };

  return (
    <div className="dialog-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Search the Bala App Store"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === "Enter" && hits[active]) go(hits[active].slug);
        }}>
        <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px", height: 60, borderBottom: "1px solid var(--line)", color: "var(--ink3)" }}>
          <IconSearch size={18} /><span className="sr">Search apps</span>
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps, problems or tech, e.g. “RAG”" style={{ flex: 1, background: "transparent", border: 0, outline: 0, color: "var(--ink)", font: "inherit", fontSize: 16 }} />
          <kbd className="mono" style={{ fontSize: 11, border: "1px solid var(--line)", borderRadius: 6, padding: "2px 6px" }}>esc</kbd>
        </label>
        <div style={{ maxHeight: "50vh", overflowY: "auto", padding: 8 }}>
          {q.trim().length < 2 && <p className="faint" style={{ margin: 0, padding: 18, fontSize: 14 }}>Type at least 2 letters. Try “RAG”, “3D” or “agents”.</p>}
          {busy && <p className="faint" style={{ margin: 0, padding: 18, fontSize: 14 }}>Searching…</p>}
          {!busy && q.trim().length >= 2 && hits.length === 0 && <p className="faint" style={{ margin: 0, padding: 18, fontSize: 14 }}>No apps match “{q}”. <a href="/ideas" style={{ color: "var(--accent-text)" }} onClick={onClose}>Suggest one →</a></p>}
          {hits.map((h, i) => (
            <button key={h.slug} type="button" onClick={() => go(h.slug)} onMouseEnter={() => setActive(i)}
              style={{ width: "100%", textAlign: "left", display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 12, border: 0, background: i === active ? "var(--field)" : "transparent", color: "var(--ink)" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="display" style={{ display: "block", fontSize: 17 }}>{h.name}</span>
                <span className="faint" style={{ display: "block", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.tagline}</span>
              </span>
              <span className="chip">{statusLabel[h.status]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
