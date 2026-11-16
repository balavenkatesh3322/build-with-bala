"use client";
import { createElement, useEffect, useRef, type ReactNode } from "react";
import { motionPaused } from "@/lib/motion";

/**
 * Splits text into characters that jump in a staggered wave (PixiJS 3D hero effect):
 * each letter rises 14%, tilts, squash-stretches and settles. Plays when it scrolls into
 * view (or on load for the hero) and again whenever the pointer enters it.
 */
export type Segment = { text: string; accent?: boolean; extrude?: boolean; squiggle?: boolean; onEnter?: (el: HTMLElement) => void; newLine?: boolean; glue?: boolean };

const KEYFRAMES: Keyframe[] = [
  { transform: "translateY(0) rotate(0deg) scaleY(1)" },
  { offset: 0.35, transform: "translateY(-14%) rotate(-5deg) scaleY(1.06)", easing: "cubic-bezier(.33,1,.68,1)" },
  { offset: 0.65, transform: "translateY(3%) rotate(0deg) scaleY(.94)", easing: "cubic-bezier(.33,1,.68,1)" },
  { transform: "translateY(0) rotate(0deg) scaleY(1)" },
];
const STAGGER = 28;

export default function JumpText({ segments, text, as = "span", className, style, playOnLoad = false }: {
  segments?: Segment[]; text?: string; as?: "h1" | "h2" | "h3" | "span" | "p"; className?: string; style?: React.CSSProperties; playOnLoad?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const running = useRef(false);
  const segs: Segment[] = segments ?? [{ text: text ?? "" }];
  const label = segs.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-ch]"));
    const accents = Array.from(root.querySelectorAll<HTMLElement>("[data-accent]"));

    const play = (delay = 0) => {
      if (running.current || motionPaused() || !chars.length || typeof chars[0].animate !== "function") return;
      running.current = true;
      chars.forEach((c, i) => c.animate(KEYFRAMES, { duration: 700, delay: delay + i * STAGGER, easing: "linear" }));
      accents.forEach((a) => {
        const first = chars.indexOf(a.querySelector("[data-ch]") as HTMLElement);
        a.animate([{ transform: "scale(1)" }, { transform: "scale(1.14)", offset: 0.23 }, { transform: "scale(1)" }],
          { duration: 650, delay: delay + Math.max(first, 0) * STAGGER + 200, easing: "cubic-bezier(.34,1.56,.64,1)" });
      });
      window.setTimeout(() => { running.current = false; }, delay + chars.length * STAGGER + 720);
    };

    const onEnter = () => play(0);
    root.addEventListener("pointerenter", onEnter);

    let io: IntersectionObserver | null = null;
    if (playOnLoad) {
      let raf = 0;
      document.fonts?.ready.then(() => { raf = requestAnimationFrame(() => play(150)); });
      return () => { cancelAnimationFrame(raf); root.removeEventListener("pointerenter", onEnter); };
    }
    io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { play(80); io?.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(root);
    return () => { io?.disconnect(); root.removeEventListener("pointerenter", onEnter); };
  }, [playOnLoad]);

  let n = 0;
  const words = (s: Segment) => s.text.split(" ").filter(Boolean).map((w, wi, arr) => (
    <span key={wi} style={{ whiteSpace: "nowrap" }}>
      <span style={{ display: "inline-block" }}>
        {Array.from(w).map((ch) => <span key={n} data-ch="" data-i={n++} style={{ display: "inline-block", transformOrigin: "50% 100%", willChange: "transform" }}>{ch}</span>)}
      </span>
      {wi < arr.length - 1 ? " " : ""}
    </span>
  ));

  const children: ReactNode[] = [];
  segs.forEach((s, i) => {
    if (s.newLine) children.push(<br key={`br${i}`} className="jt-br" />);
    if (s.accent) {
      children.push(
        <span key={i} data-accent-group="" className="jt-group">
          <span data-accent="" className={s.extrude ? "jt-accent jt-extrude" : "jt-accent"} role="presentation"
            onPointerEnter={(e) => s.onEnter?.(e.currentTarget)} onClick={(e) => s.onEnter?.(e.currentTarget)}>
            {words(s)}
          </span>
          {s.squiggle && (
            <svg className="jt-squiggle" viewBox="0 0 160 18" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 12C22 3 38 3 54 10s34 8 52 0 34-8 52 2" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          )}
        </span>,
      );
    } else children.push(<span key={i}>{words(s)}</span>);
    if (i < segs.length - 1 && !segs[i + 1].newLine && !segs[i + 1].glue) children.push(" ");
  });

  return createElement(as, { ref, className, style, "aria-label": label },
    <span aria-hidden="true">{children}</span>);
}
