"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMotion, motionPaused } from "@/lib/motion";

/**
 * Site-wide micro-interactions, in the spirit of pixijs.com/3d:
 *  • [data-rise]  : content rises into view as you scroll
 *  • .btn / [data-magnetic] : buttons lean toward the pointer (magnetic)
 *  • [data-tilt]  : cards tilt in 3D toward the pointer with a moving glare
 */
export default function Effects() {
  const path = usePathname();

  useEffect(() => { initMotion(); document.documentElement.classList.add("js"); }, []);

  // Rise on scroll (re-scan on route change)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-rise]:not(.risen)"));
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("risen")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("risen"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -4% 0px", threshold: 0.01 });
    els.forEach((e, i) => { e.style.setProperty("--rise-delay", `${Math.min(i % 6, 5) * 60}ms`); io.observe(e); });
    return () => io.disconnect();
  }, [path]);

  // Magnetic buttons + pointer-tracked tilt (event delegation, no per-element listeners)
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    let mag: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;
    let raf = 0;
    let last: PointerEvent | null = null;

    const release = (el: HTMLElement | null, kind: "mag" | "tilt") => {
      if (!el) return;
      if (kind === "mag") { el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px"); el.classList.remove("mag-on"); }
      else { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); el.classList.remove("tilt-on"); }
    };
    const frame = () => {
      raf = 0;
      const e = last; if (!e) return;
      const target = e.target as Element | null;
      const paused = motionPaused();
      const m = paused ? null : (target?.closest?.(".btn, [data-magnetic]") as HTMLElement | null);
      if (m !== mag) { release(mag, "mag"); mag = m; }
      if (mag) {
        const r = mag.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        mag.classList.add("mag-on");
        mag.style.setProperty("--mx", `${(x * 6).toFixed(2)}px`);
        mag.style.setProperty("--my", `${(y * 4).toFixed(2)}px`);
      }
      const t = paused ? null : (target?.closest?.("[data-tilt]") as HTMLElement | null);
      if (t !== tilt) { release(tilt, "tilt"); tilt = t; }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        tilt.classList.add("tilt-on");
        tilt.style.setProperty("--ry", `${((px - 0.5) * 12).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${((0.5 - py) * 10).toFixed(2)}deg`);
        tilt.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        tilt.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      }
    };
    const onMove = (e: PointerEvent) => { last = e; if (!raf) raf = requestAnimationFrame(frame); };
    const onLeave = () => { release(mag, "mag"); release(tilt, "tilt"); mag = tilt = null; };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => { window.removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); cancelAnimationFrame(raf); };
  }, []);

  return null;
}
