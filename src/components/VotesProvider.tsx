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
const STORE = "bwb-votes-v1";
const readLocal = (): string[] => { try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; } };
const writeLocal = (s: Set<string>) => { try { localStorage.setItem(STORE, JSON.stringify([...s])); } catch { /* ignore */ } };

/**
 * Upvotes for apps and ideas.
 * Live mode: votes are saved on the server (one per visitor).
 * Demo mode (live saving not switched on): votes still count up instantly and are
 * remembered in this browser, on top of a stable showcase number.
 */
export default function VotesProvider({ children }: { children: ReactNode }) {
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [local, setLocal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((m: string) => {
    setToast(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    fetch("/api/votes", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { configured?: boolean; apps?: string[]; ideas?: string[] }) => {
        if (d.configured === false) { setLocal(true); setMine(new Set(readLocal())); return; }
        const s = new Set<string>();
        d.apps?.forEach((a) => s.add(key("app", a)));
        d.ideas?.forEach((i) => s.add(key("idea", i)));
        setMine(s);
      })
      .catch(() => { setLocal(true); setMine(new Set(readLocal())); });
  }, []);

  const flipLocal = useCallback((k: string) => {
    setMine((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); writeLocal(n); return n; });
  }, []);

  const toggle = useCallback(async (kind: Kind, id: string, base: number) => {
    const k = key(kind, id);
    if (local) { flipLocal(k); return; }
    const was = mine.has(k);
    const prevCount = counts[k] ?? base;
    setMine((s) => { const n = new Set(s); if (was) n.delete(k); else n.add(k); return n; });
    setCounts((c) => ({ ...c, [k]: Math.max(0, prevCount + (was ? -1 : 1)) }));
    try {
      const url = kind === "app" ? `/api/apps/${id}/upvote` : `/api/ideas/${id}/vote`;
      const res = await fetch(url, { method: "POST" });
      const d = await res.json();
      if (d.demo) {
        // live saving is off: keep the optimistic vote and remember it here
        setLocal(true);
        setCounts((c) => { const n = { ...c }; delete n[k]; return n; });
        setMine((s) => { const n = new Set(readLocal()); s.forEach((x) => { if (x === k) n.add(x); }); if (was) n.delete(k); else n.add(k); writeLocal(n); return n; });
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Couldn't save your vote. Please try again.");
      setMine((s) => { const n = new Set(s); if (d.voted) n.add(k); else n.delete(k); return n; });
      setCounts((c) => ({ ...c, [k]: d.count }));
    } catch (e) {
      setMine((s) => { const n = new Set(s); if (was) n.add(k); else n.delete(k); return n; });
      setCounts((c) => ({ ...c, [k]: prevCount }));
      notify(e instanceof Error ? e.message : "Couldn't save your vote. Please try again.");
    }
  }, [local, mine, counts, notify, flipLocal]);

  const value = useMemo<Ctx>(() => ({
    has: (kind, id) => mine.has(key(kind, id)),
    count: (kind, id, base) => (local ? base + (mine.has(key(kind, id)) ? 1 : 0) : counts[key(kind, id)] ?? base),
    toggle, notify,
  }), [mine, counts, local, toggle, notify]);

  return (
    <VotesCtx.Provider value={value}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </VotesCtx.Provider>
  );
}
