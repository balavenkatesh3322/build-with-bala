"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { RingItem } from "./Hero3D";
import { useMotionPaused } from "@/lib/motion";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false, loading: () => <div className="skeleton" style={{ position: "absolute", inset: "8% 4%" }} aria-hidden="true" /> });

export default function RingBand({ items }: { items: RingItem[] }) {
  const paused = useMotionPaused();
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => {
    try { const c = document.createElement("canvas"); setWebgl(Boolean(c.getContext("webgl2") || c.getContext("webgl"))); } catch { setWebgl(false); }
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver((e) => setVisible(e.some((x) => x.isIntersecting)), { rootMargin: "200px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="ring-stage">
      <div aria-hidden="true" className="ring-glow" />
      {webgl && visible && <Hero3D items={items} paused={paused} />}
      <span className="mono faint ring-hint">Drag to spin · click a card to open</span>
    </div>
  );
}
