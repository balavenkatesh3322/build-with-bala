"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { CORNERS } from "./ClayField";
import JumpText from "./JumpText";
import SubscribeForm from "./SubscribeForm";
import { useMotionPaused } from "@/lib/motion";
import { whatsappLink } from "@/lib/site";

const ClayField = dynamic(() => import("./ClayField"), { ssr: false });

export default function ClosingCTA() {
  const { resolvedTheme } = useTheme();
  const paused = useMotionPaused();
  const card = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <section id="subscribe" className="band tiled closing">
      {mounted && <ClayField theme={resolvedTheme === "light" ? "light" : "dark"} paused={paused} avoid={card} seeds={{ wide: CORNERS, narrow: CORNERS.slice(0, 4) }} insetTop={0} insetBottom={0} grid={false} />}
      <div ref={card} className="closing-card card" data-rise="">
        <span className="eyebrow">Stay in the loop</span>
        <JumpText as="h2" className="display h1" text="Bring AI into focus." style={{ lineHeight: 1.02 }} />
        <p className="lede" style={{ margin: 0 }}>One new app and one idea, every week. Free, and you can unsubscribe in one click.</p>
        <div style={{ width: "100%", maxWidth: 520 }}><SubscribeForm source="home" id="home-email" /></div>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="faint" style={{ fontSize: 15 }}>Prefer to chat? <span style={{ color: "var(--accent-text)", fontWeight: 500 }}>Say hi to Bala on WhatsApp →</span></a>
      </div>
    </section>
  );
}
