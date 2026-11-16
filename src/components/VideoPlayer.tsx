"use client";
import { useState } from "react";
import { IconPlay } from "./Icons";

export default function VideoPlayer({ src, vertical, poster, title, ratio = "16 / 9" }: { src: string; vertical?: string | null; poster?: string | null; title: string; ratio?: string }) {
  const [playing, setPlaying] = useState(false);
  const [file, setFile] = useState(src);
  const start = () => {
    if (vertical && typeof window !== "undefined" && window.innerWidth < 640) setFile(vertical);
    setPlaying(true);
  };
  return (
    <div style={{ position: "relative", aspectRatio: ratio, background: "#0e0d13", overflow: "hidden" }}>
      {playing ? (
        <video src={file} poster={poster ?? undefined} controls autoPlay loop muted playsInline preload="metadata" aria-label={`${title} demo video`} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#0e0d13" }} />
      ) : (
        <>
          {poster && /* eslint-disable-next-line @next/next/no-img-element */ <img src={poster} alt={`${title} demo preview`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
          <button type="button" onClick={start} aria-label={`Play ${title} demo`} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 76, height: 76, borderRadius: "50%", border: 0, background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--glow-shadow)" }}>
            <IconPlay />
          </button>
        </>
      )}
    </div>
  );
}
