"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/site";

export default function Cubes({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const [spun, setSpun] = useState<string | null>(null);
  const open = (id: string) => { setSpun(id); setTimeout(() => router.push(`/apps?category=${id}`), 550); };
  const faces = (color: string, n: number) => [
    { t: "translateZ(50px)", f: "none", c: n },
    { t: "rotateY(90deg) translateZ(50px)", f: "brightness(.7)" },
    { t: "rotateX(90deg) translateZ(50px)", f: "brightness(1.25)" },
    { t: "rotateY(180deg) translateZ(50px)", f: "none" },
    { t: "rotateY(-90deg) translateZ(50px)", f: "brightness(.7)" },
  ].map((x, i) => (
    <span key={i} className="face" style={{ transform: x.t, background: color, filter: x.f, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {i === 0 && <span className="display" style={{ color: "#fff", fontSize: 28 }}>{n}</span>}
    </span>
  ));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
      {categories.map((c) => (
        <button key={c.id} type="button" className="cube-btn" onClick={() => open(c.id)} aria-label={`${c.label}: ${counts[c.id] ?? 0} apps. Open category`}
          style={{ background: "transparent", border: 0, color: "var(--ink)", display: "flex", flexDirection: "column", alignItems: "center", gap: 34, padding: "48px 0 8px", perspective: 900 }}>
          <div className={`cube${spun === c.id ? " spun" : ""}`}>{faces(c.color, counts[c.id] ?? 0)}</div>
          <span className="stack center" style={{ gap: 4 }}>
            <span className="display" style={{ fontSize: 17, fontWeight: 600 }}>{c.label}</span>
            <span className="faint" style={{ fontSize: 13 }}>{c.blurb}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
