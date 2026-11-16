"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AppRow } from "@/lib/data";
import { categories } from "@/lib/site";
import AppCard from "./AppCard";
import { IconSearch } from "./Icons";

export default function AppStore({ apps, limit, searchable = true, hideEmpty = false }: { apps: AppRow[]; limit?: number; searchable?: boolean; hideEmpty?: boolean }) {
  const params = useSearchParams();
  const initial = params.get("category");
  const [cat, setCat] = useState<string>(categories.some((c) => c.id === initial) ? (initial as string) : "all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: apps.length };
    for (const a of apps) m[a.category] = (m[a.category] ?? 0) + 1;
    return m;
  }, [apps]);

  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return apps.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (!words.length) return true;
      const hay = [a.name, a.tagline, a.problem, a.stack.join(" ")].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [apps, cat, q]);

  const shown = limit && cat === "all" && !q ? filtered.slice(0, limit) : filtered;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div role="tablist" aria-label="Store categories" className="tabs">
          {[{ id: "all", label: "All" }, ...categories].filter((c) => !hideEmpty || (counts[c.id] ?? 0) > 0).map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} className="tab" onClick={() => setCat(c.id)}>
              {c.label} <span className="mono" style={{ fontSize: 11, opacity: .7 }}>{counts[c.id] ?? 0}</span>
            </button>
          ))}
        </div>
        {searchable && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, height: 48, padding: "0 14px", borderRadius: 12, background: "var(--field)", border: "1px solid var(--line)", color: "var(--ink3)", flex: "0 1 320px", minWidth: 220 }}>
            <IconSearch size={16} /><span className="sr">Search the store</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps or problems" style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--ink)", font: "inherit", fontSize: 15, minWidth: 0 }} />
          </label>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="card center stack" style={{ padding: 40, gap: 10 }}>
          <p className="display" style={{ fontSize: 22 }}>Nothing matches yet.</p>
          <p className="muted" style={{ margin: 0 }}>Want an app that solves this? Tell me what&apos;s painful.</p>
          <Link href="/ideas" className="btn btn-accent" style={{ marginTop: 8 }}>Share an idea</Link>
        </div>
      ) : (
        <div className="store-grid">{shown.map((a) => <AppCard key={a.slug} app={a} />)}</div>
      )}
    </div>
  );
}
