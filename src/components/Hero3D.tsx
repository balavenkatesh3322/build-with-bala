"use client";
/**
 * AppCarousel3D: a 3D ring of app cards. The front card is large and lit while the rest
 * recede. It steps to the next app on a timer, snaps after a drag, and reports the
 * focused app so the page can show its details.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useRouter } from "next/navigation";

export type RingItem = { slug: string; name: string; poster: string | null; color: string; mono: string };
export type Ctl = { target: number; current: number; dragging: boolean; moved: boolean; lastInput: number };

const CARD_W = 3.6, CARD_H = CARD_W * 9 / 16, LABEL_H = 0.5, PAD = 0.08;

function drawTile(color: string, mono: string) {
  const c = document.createElement("canvas"); c.width = 640; c.height = 360;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 640, 360);
  grad.addColorStop(0, color); grad.addColorStop(1, "#7c3aed");
  g.fillStyle = grad; g.fillRect(0, 0, 640, 360);
  g.fillStyle = "#fff"; g.font = "800 150px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(mono, 320, 190);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function drawLabel(name: string) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 140;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1e1d26"; g.fillRect(0, 0, 1024, 140);
  g.fillStyle = "#fff"; g.font = "700 62px sans-serif"; g.textBaseline = "middle";
  g.fillText(name.length > 26 ? name.slice(0, 25) + "…" : name, 36, 74);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

const loader = typeof window !== "undefined" ? new THREE.TextureLoader() : null;

function Face({ item, dim }: { item: RingItem; dim: MutableRefObject<number> }) {
  const tile = useMemo(() => drawTile(item.color, item.mono), [item.color, item.mono]);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const { invalidate } = useThree();
  useEffect(() => {
    if (!item.poster || !loader) return;
    let alive = true;
    loader.load(item.poster, (t) => {
      if (!alive) { t.dispose(); return; }
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; setTex(t); invalidate();
    });
    return () => { alive = false; };
  }, [item.poster, invalidate]);
  useEffect(() => () => { tex?.dispose(); tile.dispose(); }, [tex, tile]);
  useFrame(() => { if (mat.current) mat.current.color.setScalar(dim.current); });
  return (
    <mesh position={[0, LABEL_H / 2, 0.012]}>
      <planeGeometry args={[CARD_W - PAD * 2, CARD_H - PAD]} />
      <meshBasicMaterial ref={mat} map={tex ?? tile} toneMapped={false} />
    </mesh>
  );
}

function Card({ item, index, count, radius, ctl, onPick }: { item: RingItem; index: number; count: number; radius: number; ctl: MutableRefObject<Ctl>; onPick: (i: number) => void }) {
  const g = useRef<THREE.Group>(null);
  const frame = useRef<THREE.MeshBasicMaterial>(null);
  const label = useMemo(() => drawLabel(item.name), [item.name]);
  const labelMat = useRef<THREE.MeshBasicMaterial>(null);
  const dim = useRef(1);
  const [hover, setHover] = useState(false);
  const angle = (index / count) * Math.PI * 2;
  const accent = useMemo(() => new THREE.Color(item.color), [item.color]);
  const base = useMemo(() => new THREE.Color("#2a2833"), []);

  useFrame(() => {
    if (!g.current) return;
    // how close this card is to facing the camera (1 = front)
    const rel = Math.atan2(Math.sin(angle + ctl.current.current), Math.cos(angle + ctl.current.current));
    const front = Math.max(0, 1 - Math.abs(rel) / (Math.PI / count) / 1.4);
    const target = 0.86 + 0.26 * front + (hover ? 0.05 : 0);
    g.current.scale.lerp(new THREE.Vector3(target, target, target), 0.14);
    dim.current = 0.32 + 0.68 * Math.max(front, hover ? 0.75 : 0);
    if (frame.current) frame.current.color.copy(base).lerp(accent, front);
    if (labelMat.current) labelMat.current.color.setScalar(0.45 + 0.55 * front);
  });

  return (
    <group ref={g} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      onClick={(e) => { e.stopPropagation(); if (!ctl.current.moved) onPick(index); }}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[CARD_W + 0.08, CARD_H + LABEL_H + 0.08]} />
        <meshBasicMaterial ref={frame} color="#2a2833" toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[CARD_W, CARD_H + LABEL_H]} />
        <meshBasicMaterial color="#1e1d26" toneMapped={false} />
      </mesh>
      <Face item={item} dim={dim} />
      <mesh position={[0, -CARD_H / 2 + 0.02, 0.012]}>
        <planeGeometry args={[CARD_W - PAD * 2, LABEL_H - 0.06]} />
        <meshBasicMaterial ref={labelMat} map={label} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Ring({ items, radius, ctl, onPick }: { items: RingItem[]; radius: number; ctl: MutableRefObject<Ctl>; onPick: (i: number) => void }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const c = ctl.current;
    if (!c.dragging) c.current += (c.target - c.current) * (1 - Math.exp(-6 * dt));
    if (g.current) g.current.rotation.y = c.current;
  });
  return <group ref={g}>{items.map((it, i) => <Card key={it.slug} item={it} index={i} count={items.length} radius={radius} ctl={ctl} onPick={onPick} />)}</group>;
}

function Rig({ radius }: { radius: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const dist = aspect < 0.9 ? 9.5 : aspect < 1.4 ? 7.4 : 6.2;
    camera.position.set(0, 0.55, radius + dist);
    camera.lookAt(0, 0.1, radius * 0.25);
  }, [camera, size, radius]);
  return null;
}

export default function Hero3D({ items, paused, focus, onFocus }: { items: RingItem[]; paused: boolean; focus: number; onFocus: (i: number) => void }) {
  const router = useRouter();
  const n = items.length;
  const step = (Math.PI * 2) / n;
  const radius = Math.max(4, (n * CARD_W * 1.12) / (Math.PI * 2));
  const ctl = useRef<Ctl>({ target: 0, current: 0, dragging: false, moved: false, lastInput: 0 });
  const down = useRef<{ x: number } | null>(null);
  const focusRef = useRef(focus);

  const indexOf = (rot: number) => ((Math.round(-rot / step) % n) + n) % n;
  const goTo = (i: number) => {
    const c = ctl.current;
    const cur = indexOf(c.target);
    let d = i - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
    c.target -= d * step;
    c.lastInput = performance.now();
    focusRef.current = i; onFocus(i);
  };

  // external focus (arrows, dots, keyboard)
  useEffect(() => { if (focus !== focusRef.current) goTo(focus); }); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-advance: one app every 4.5s, paused while interacting or when motion is paused
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (ctl.current.dragging || performance.now() - ctl.current.lastInput < 6000) return;
      goTo((focusRef.current + 1) % n);
    }, 4500);
    return () => window.clearInterval(id);
  }, [paused, n]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { document.body.style.cursor = ""; }, []);

  const onPick = (i: number) => {
    if (i === focusRef.current) router.push(`/apps/${items[i].slug}`);
    else goTo(i);
  };

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "pan-y", cursor: "grab" }}
      onPointerDown={(e) => { down.current = { x: e.clientX }; ctl.current.dragging = true; ctl.current.moved = false; }}
      onPointerMove={(e) => {
        if (!down.current) return;
        const dx = e.clientX - down.current.x;
        if (Math.abs(dx) > 3) ctl.current.moved = true;
        ctl.current.current += dx * 0.006; ctl.current.target = ctl.current.current;
        down.current.x = e.clientX;
      }}
      onPointerUp={() => {
        if (!down.current) return; down.current = null; ctl.current.dragging = false;
        if (ctl.current.moved) { const i = indexOf(ctl.current.current); ctl.current.target = -Math.round(-ctl.current.current / step) * step; ctl.current.lastInput = performance.now(); focusRef.current = i; onFocus(i); }
      }}
      onPointerLeave={() => { if (down.current) { down.current = null; ctl.current.dragging = false; ctl.current.target = -Math.round(-ctl.current.current / step) * step; } }}>
      <Canvas frameloop={paused ? "demand" : "always"} dpr={[1, 2]} camera={{ fov: 38, position: [0, 0.6, radius + 6.2] }} gl={{ alpha: true, antialias: true }} aria-label="3D carousel of apps. Drag or use the arrows; click the front card to open it.">
        <Rig radius={radius} />
        <Ring items={items} radius={radius} ctl={ctl} onPick={onPick} />
      </Canvas>
    </div>
  );
}
