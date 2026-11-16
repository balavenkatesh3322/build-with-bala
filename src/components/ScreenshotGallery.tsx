"use client";
import { useCallback, useEffect, useState } from "react";
import type { Shot } from "@/lib/app-details";
import { IconClose } from "./Icons";

export default function ScreenshotGallery({ shots, name }: { shots: Shot[]; name: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const n = shots.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, go]);

  if (!n) return null;
  const cur = shots[i];
  return (
    <div className="gallery">
      <div className="card gallery-main" data-tilt="">
        <button type="button" className="gallery-open" onClick={() => setOpen(true)} aria-label={`Enlarge screenshot: ${cur.caption}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={cur.src} src={cur.src} alt={`${name}: ${cur.caption}`} />
        </button>
        {n > 1 && (<>
          <button type="button" className="gallery-nav prev" onClick={() => go(-1)} aria-label="Previous screenshot">‹</button>
          <button type="button" className="gallery-nav next" onClick={() => go(1)} aria-label="Next screenshot">›</button>
        </>)}
        <div className="gallery-cap"><span className="mono faint">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span><span>{cur.caption}</span></div>
      </div>
      {n > 1 && (
        <div className="gallery-thumbs" role="tablist" aria-label="Screenshots">
          {shots.map((s, k) => (
            <button key={s.src} type="button" role="tab" aria-selected={k === i} className={`gallery-thumb${k === i ? " on" : ""}`} onClick={() => setI(k)} aria-label={s.caption}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${name} screenshots`} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <button type="button" className="icon-btn lightbox-close" onClick={() => setOpen(false)} aria-label="Close"><IconClose size={18} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.src} alt={`${name}: ${cur.caption}`} />
          <p className="lightbox-cap">{cur.caption} · {i + 1}/{n}</p>
          {n > 1 && (<>
            <button type="button" className="gallery-nav prev" onClick={() => go(-1)} aria-label="Previous screenshot">‹</button>
            <button type="button" className="gallery-nav next" onClick={() => go(1)} aria-label="Next screenshot">›</button>
          </>)}
        </div>
      )}
    </div>
  );
}
