"use client";
import { useCallback, useEffect, useState } from "react";

// Streak / XP live in this browser (localStorage). No login needed.
export type Progress = {
  xp: number; streak: number; best: number; last: string | null;
  days: string[]; quizCorrect: number; ideas: number; xpDays: string[];
  quiz?: { day: string; option: number; correct: boolean; answer: number; explain: string; app: string | null };
  poll?: { day: string; option: number };
};
const KEY = "bwb-progress-v1";
const empty: Progress = { xp: 0, streak: 0, best: 0, last: null, days: [], quizCorrect: 0, ideas: 0, xpDays: [] };

export const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

function read(): Progress {
  try { return { ...empty, ...(JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Progress>) }; } catch { return empty; }
}
function write(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ } }

export const LEVEL_AT = 500;
export const level = (xp: number) => (xp >= LEVEL_AT ? "Maker" : "Builder");

export function useProgress() {
  const [p, setP] = useState<Progress>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => { setP(read()); setReady(true); }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setP((cur) => { const next = fn(cur); write(next); return next; });
  }, []);

  /** Award XP at most once per action per day. */
  const award = useCallback((action: string, xp: number) => {
    update((cur) => {
      const tag = `${todayStr()}:${action}`;
      if (cur.xpDays.includes(tag)) return cur;
      return { ...cur, xp: cur.xp + xp, xpDays: [...cur.xpDays.slice(-60), tag] };
    });
  }, [update]);

  const checkIn = useCallback(() => {
    update((cur) => {
      const t = todayStr();
      if (cur.last === t) return cur;
      const streak = cur.last === addDays(t, -1) ? cur.streak + 1 : 1;
      return { ...cur, last: t, streak, best: Math.max(cur.best, streak), days: [...cur.days.slice(-30), t], xp: cur.xp + 5, xpDays: [...cur.xpDays.slice(-60), `${t}:checkin`] };
    });
  }, [update]);

  return { p, ready, update, award, checkIn };
}
