"use client";
import { useEffect, useState } from "react";

// One global motion switch (like PixiJS's html[data-motion=paused]).
// Respects prefers-reduced-motion and the visitor's own "Pause motion" choice.
const KEY = "bwb-motion";
const EVT = "bwb-motion-change";

export function motionPaused(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.motion === "paused";
}

export function setMotionPaused(paused: boolean) {
  document.documentElement.dataset.motion = paused ? "paused" : "on";
  try { localStorage.setItem(KEY, paused ? "paused" : "on"); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVT));
}

export function initMotion() {
  let saved: string | null = null;
  try { saved = localStorage.getItem(KEY); } catch { /* ignore */ }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.dataset.motion = saved ? saved : reduced ? "paused" : "on";
}

export function useMotionPaused(): boolean {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const sync = () => setPaused(motionPaused());
    sync();
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);
  return paused;
}
