"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useRouter } from "next/navigation";

export type RingItem = { slug: string; name: string; poster: string | null; color: string; mono: string };
type Drag = { moved: boolean; spin: number };

function drawTile(color: string, mono: string) {
  const c = document.createElement("canvas"); c.width = 640; c.height = 360;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 640, 360);
  grad.addColorStop(0, color); grad.addColorStop(1, "#7c3aed");
  g.fillStyle = grad; g.fillRect(0, 0, 640, 360);
  g.fillStyle = "#fff"; g.font = "800 150px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(mono, 320, 190);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function drawLabel(name: string) {
  const c = document.createElement("canvas"); c.width = 640; c.height = 120;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1e1d26"; g.fillRect(0, 0, 640, 120);
  g.fillStyle = "#fff"; g.font = "600 46px sans-serif"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(name.length > 22 ? name.slice(0, 21) + "…" : name, 28, 62);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function PosterImage({ url }: { url: string }) {
  const map = useTexture(url);
  map.colorSpace = THREE.SRGBColorSpace;
  return <mesh position={[0, 0.2, 0.01]}><planeGeometry args={[2.2, 1.24]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>;
}
function TileImage({ color, mono }: { color: string; mono: string }) {
  const map = useMemo(() => drawTile(color, mono), [color, mono]);
  return <mesh position={[0, 0.2, 0.01]}><planeGeometry args={[2.2, 1.24]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>;
}

function Card({ item, angle, radius, drag }: { item: RingItem; angle: number; radius: number; drag: MutableRefObject<Drag> }) {
  const router = useRouter();
  const g = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const label = useMemo(() => drawLabel(item.name), [item.name]);
  useFrame(() => { if (g.current) g.current.scale.lerp(new THREE.Vector3(1, 1, 1).multiplyScalar(hover ? 1.07 : 1), 0.12); });
  return (
    <group ref={g} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      onClick={(e) => { e.stopPropagation(); if (!drag.current.moved) router.push(`/apps/${item.slug}`); }}>
      <mesh><planeGeometry args={[2.3, 1.9]} /><meshBasicMaterial color={hover ? "#2a2833" : "#1e1d26"} toneMapped={false} /></mesh>
      {item.poster ? <PosterImage url={item.poster} /> : <TileImage color={item.color} mono={item.mono} />}
      <mesh position={[0, -0.7, 0.01]}><planeGeometry args={[2.2, 0.41]} /><meshBasicMaterial map={label} toneMapped={false} /></mesh>
    </group>
  );
}

function Ring({ items, paused, drag, radius }: { items: RingItem[]; paused: boolean; drag: MutableRefObject<Drag>; radius: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.y += drag.current.spin + (paused ? 0 : dt * 0.16);
    drag.current.spin *= 0.92;
  });
  return (
    <group ref={g} rotation={[0.06, 0, 0]}>
      {items.map((it, i) => <Card key={it.slug} item={it} angle={(i / items.length) * Math.PI * 2} radius={radius} drag={drag} />)}
    </group>
  );
}

/** Pull the camera back on narrow screens so the whole ring stays in view. */
function Rig({ radius }: { radius: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const k = radius / 3.3;
    camera.position.set(0, 1.4 * k, (aspect < 1 ? 15.5 : aspect < 1.4 ? 12.5 : 10.8) * k);
    camera.lookAt(0, 0, 0);
  }, [camera, size, radius]);
  return null;
}

function Cube({ position, color, size = 0.6 }: { position: [number, number, number]; color: string; size?: number }) {
  const m = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (m.current) { m.current.rotation.y += dt * 0.5; m.current.rotation.x += dt * 0.25; } });
  return <Float speed={1.6} floatIntensity={1.2}><mesh ref={m} position={position}><boxGeometry args={[size, size, size]} /><meshStandardMaterial color={color} roughness={0.35} metalness={0.1} /></mesh></Float>;
}

export default function Hero3D({ items, paused }: { items: RingItem[]; paused: boolean }) {
  const drag = useRef<Drag>({ moved: false, spin: 0 });
  const radius = Math.max(3.3, (items.length * 2.55) / (2 * Math.PI));
  const down = useRef<{ x: number } | null>(null);
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "pan-y", cursor: "grab" }}
      onPointerDown={(e) => { down.current = { x: e.clientX }; drag.current.moved = false; }}
      onPointerMove={(e) => {
        if (!down.current) return;
        const dx = e.clientX - down.current.x;
        if (Math.abs(dx) > 4) drag.current.moved = true;
        drag.current.spin = THREE.MathUtils.clamp(dx * 0.0016, -0.08, 0.08);
        down.current.x = e.clientX;
      }}
      onPointerUp={() => { down.current = null; }} onPointerLeave={() => { down.current = null; }}>
      <Canvas frameloop={paused ? "demand" : "always"} dpr={[1, 2]} camera={{ position: [0, 1.4, 10.8], fov: 38 }} gl={{ alpha: true, antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)} aria-label="Interactive 3D ring of apps. Drag to spin, click a card to open it.">
        <Rig radius={radius} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <Ring items={items} paused={paused} drag={drag} radius={radius} />
        <Cube position={[-3.4, 2.1, 1]} color="#d81b60" size={0.6} />
        <Cube position={[3.5, -1.9, 2]} color="#8b7cf6" size={0.45} />
        <Cube position={[0.2, 2.9, -2]} color="#ff6fa0" size={0.38} />
      </Canvas>
    </div>
  );
}
