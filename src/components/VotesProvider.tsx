"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Kind = "app" | "idea";
type Ctx = {
  has: (kind: Kind, id: string) => boolean;
  count: (kind: Kind, id: string, base: number) => number;
  toggle: (kind: Kind, id: string, base: number) => Promise<void>;
  notify: (message: string) => void;
};
const VotesCtx = createContext<Ctx | null>(null);

export function useVotes() {
  const c = useContext(VotesCtx);
  if (!c) throw new Error("useVotes must be used inside VotesProvider");
  return c;
}

const key = (k: Kind, id: string) => `${k}:${id}`;

export default function VotesProvider({ children }: { children: ReactNode }) {
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((m: string) => {
    setToast(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // Load what this visitor already voted for, so filled upvotes survive reloads.
  useEffect(() => {
    fetch("/api/votes", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { apps?: string[]; ideas?: string[] }) => {
        const s = new Set<string>();
        d.apps?.forEach((a) => s.add(key("app", a)));
        d.ideas?.forEach((i) => s.add(key("idea", i)));
        setMine(s);
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback(async (kind: Kind, id: string, base: number) => {
    const k = key(kind, id);
    const was = mine.has(k);
    const prevCount = counts[k] ?? base;
    // optimistic
    setMine((s) => { const n = new Set(s); if (was) n.delete(k); else n.add(k); return n; });
    setCounts((c) => ({ ...c, [k]: Math.max(0, prevCount + (was ? -1 : 1)) }));
    try {
      const url = kind === "app" ? `/api/apps/${id}/upvote` : `/api/ideas/${id}/vote`;
      const res = await fetch(url, { method: "POST" });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error || "Could not save your vote.");
      setMine((s) => { const n = new Set(s); if (d.voted) n.add(k); else n.delete(k); return n; });
      setCounts((c) => ({ ...c, [k]: d.count }));
    } catch (e) {
      setMine((s) => { const n = new Set(s); if (was) n.add(k); else n.delete(k); return n; });
      setCounts((c) => ({ ...c, [k]: prevCount }));
      notify(e instanceof Error ? e.message : "Could not save your vote.");
    }
  }, [mine, counts, notify]);

  const value = useMemo<Ctx>(() => ({
    has: (kind, id) => mine.has(key(kind, id)),
    count: (kind, id, base) => counts[key(kind, id)] ?? base,
    toggle, notify,
  }), [mine, counts, toggle, notify]);

  return (
    <VotesCtx.Provider value={value}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </VotesCtx.Provider>
  );
}
