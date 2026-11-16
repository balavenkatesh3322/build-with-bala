"use client";
/**
 * ClayField: an interactive field of soft 3D "clay" shapes, rebuilt in three.js after the
 * pixijs.com/3d hero. Physics follow the original: shapes drift around a home position,
 * get shoved and dragged by the pointer (the "touch wave"), collide with each other,
 * bounce off the edges with a squash, stay clear of the text, and get kicked outward by a
 * shockwave that ripples across a dotted floor. Clicking a shape spins it, recolours it and
 * bursts particles. Tapping empty space sends a ripple from that point.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { forwardRef, useEffect, useImperativeHandle, useRef, type RefObject } from "react";

export type FieldHandle = { puff: (clientX: number, clientY: number) => void };
type Kind = "sphere" | "cube" | "torus" | "pyramid" | "capsule" | "cylinder" | "octa" | "ico";
type Tint = "pink" | "rose" | "violet" | "cyan" | "gold";
export type Seed = { kind: Kind; tint: Tint; x: number; y: number; s: number };

const PALETTE: Record<Tint, number> = { pink: 0xe91e63, rose: 0xf06695, violet: 0x8b5cf6, cyan: 0x38bdf8, gold: 0xf2a65a };
const CYCLE: Tint[] = ["pink", "violet", "cyan", "gold", "rose"];
const BURST = ["#e91e63", "#8b5cf6", "#38bdf8", "#f2a65a", "#f06695"];

// Layouts (x, y as 0..1 of the field; s = diameter in % of width), mirroring the reference.
export const HERO_WIDE: Seed[] = [
  { kind: "sphere", tint: "cyan", x: 0.05, y: 0.6, s: 10 },
  { kind: "sphere", tint: "violet", x: 0.81, y: 0.17, s: 8.6 },
  { kind: "torus", tint: "cyan", x: 0.8, y: 0.86, s: 8.6 },
  { kind: "ico", tint: "gold", x: 0.9, y: 0.66, s: 7.8 },
  { kind: "capsule", tint: "gold", x: 0.92, y: 0.3, s: 7 },
  { kind: "ico", tint: "gold", x: 0.12, y: 0.82, s: 7.4 },
  { kind: "cube", tint: "pink", x: 0.19, y: 0.2, s: 7.2 },
  { kind: "cube", tint: "violet", x: 0.72, y: 0.62, s: 6.2 },
  { kind: "pyramid", tint: "pink", x: 0.24, y: 0.66, s: 6.4 },
  { kind: "octa", tint: "violet", x: 0.3, y: 0.88, s: 5.8 },
  { kind: "capsule", tint: "rose", x: 0.68, y: 0.86, s: 5.6 },
  { kind: "cylinder", tint: "cyan", x: 0.42, y: 0.92, s: 5.2 },
  { kind: "sphere", tint: "pink", x: 0.58, y: 0.93, s: 4.8 },
  { kind: "sphere", tint: "violet", x: 0.05, y: 0.3, s: 5.2 },
  { kind: "torus", tint: "pink", x: 0.68, y: 0.12, s: 5.4 },
  { kind: "pyramid", tint: "cyan", x: 0.32, y: 0.12, s: 4.6 },
];
export const HERO_NARROW: Seed[] = [
  { kind: "sphere", tint: "cyan", x: 0.9, y: 0.12, s: 20 },
  { kind: "sphere", tint: "violet", x: 0.1, y: 0.13, s: 18 },
  { kind: "cube", tint: "violet", x: 0.6, y: 0.1, s: 13 },
  { kind: "torus", tint: "cyan", x: 0.42, y: 0.93, s: 17 },
  { kind: "ico", tint: "gold", x: 0.1, y: 0.9, s: 17 },
  { kind: "octa", tint: "violet", x: 0.66, y: 0.88, s: 12 },
  { kind: "capsule", tint: "rose", x: 0.88, y: 0.92, s: 12 },
  { kind: "pyramid", tint: "pink", x: 0.3, y: 0.08, s: 10 },
];
export const CORNERS: Seed[] = [
  { kind: "pyramid", tint: "cyan", x: 0.06, y: 0.18, s: 6 },
  { kind: "cube", tint: "pink", x: 0.94, y: 0.2, s: 6.4 },
  { kind: "torus", tint: "pink", x: 0.93, y: 0.82, s: 6.8 },
  { kind: "sphere", tint: "violet", x: 0.07, y: 0.8, s: 6.6 },
  { kind: "ico", tint: "gold", x: 0.2, y: 0.92, s: 4.2 },
  { kind: "capsule", tint: "rose", x: 0.8, y: 0.06, s: 4.2 },
];

type Body = {
  seed: Seed; tint: Tint; mesh: THREE.Mesh; shadow: THREE.Mesh;
  x: number; y: number; vx: number; vy: number; homeX: number; homeY: number; radius: number; depth: number;
  angle: number; spin: number; restAngle: number; pitch: number; yaw: number; pitchSpin: number; yawSpin: number; restPitch: number; restYaw: number;
  f1: number; f2: number; p1: number; p2: number; squash: number;
  pop: number; popV: number; hover: number; hoverV: number; hoverUntil: number; wave: number; kicked: boolean; delay: number;
};

const VERT = /* glsl */ `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uDpr;
uniform vec2 uPtr; uniform float uPtrOn;
uniform vec2 uRip; uniform float uRipR; uniform float uRipA;
uniform vec3 uDot; uniform float uDotA; uniform vec3 uAccent; uniform float uCell;
void main(){
  vec2 p = gl_FragCoord.xy / uDpr; p.y = uRes.y - p.y;
  vec2 d = p - uRip; float dist = length(d);
  float band = exp(-pow((dist - uRipR) / 46.0, 2.0)) * uRipA;
  vec2 dir = dist > 0.001 ? d / dist : vec2(0.0);
  vec2 dp = p - uPtr; float pd = length(dp);
  float touch = uPtrOn * exp(-(pd * pd) / (2.0 * 95.0 * 95.0));
  vec2 pdir = pd > 0.001 ? dp / pd : vec2(0.0);
  vec2 q = p - dir * band * 12.0 - pdir * touch * 9.0;
  vec2 g = mod(q, uCell) - uCell * 0.5;
  float r = length(g);
  float lit = clamp(band * 1.1 + touch, 0.0, 1.0);
  float size = 1.6 + lit * 1.4;
  float a = smoothstep(size + 0.9, size - 0.4, r);
  vec3 col = mix(uDot, uAccent, lit);
  gl_FragColor = vec4(col, a * (uDotA + lit * 0.75));
}`;

function geometryFor(kind: Kind): THREE.BufferGeometry {
  switch (kind) {
    case "cube": return new RoundedBoxGeometry(1.42, 1.42, 1.42, 6, 0.3);
    case "torus": return new THREE.TorusGeometry(0.7, 0.34, 32, 72);
    case "pyramid": return new THREE.ConeGeometry(1.05, 1.55, 4, 1);
    case "capsule": return new THREE.CapsuleGeometry(0.52, 0.9, 12, 28);
    case "cylinder": return new THREE.CylinderGeometry(0.76, 0.76, 1.3, 48);
    case "octa": return new THREE.OctahedronGeometry(1.08);
    case "ico": return new THREE.IcosahedronGeometry(1.02, 1);
    default: return new THREE.SphereGeometry(1, 48, 32);
  }
}
const flat = (k: Kind) => k === "octa" || k === "ico" || k === "pyramid";

function shadowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(0,0,0,0.9)"); grd.addColorStop(0.45, "rgba(0,0,0,0.45)"); grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const hex3 = (h: string) => { const c = new THREE.Color(h); return new THREE.Vector3(c.r, c.g, c.b); };

type Props = {
  theme: "dark" | "light";
  paused: boolean;
  avoid?: RefObject<HTMLElement | null>;
  seeds?: { wide: Seed[]; narrow: Seed[] };
  insetTop?: number; insetBottom?: number;
  grid?: boolean;
  onFail?: () => void;
};

const ClayField = forwardRef<FieldHandle, Props>(function ClayField({ theme, paused, avoid, seeds, insetTop = 64, insetBottom = 40, grid = true, onFail }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ puff: (x: number, y: number) => void; setTheme: (t: "dark" | "light") => void; setPaused: (p: boolean) => void } | null>(null);

  useImperativeHandle(ref, () => ({
    puff: (cx, cy) => {
      const el = host.current; if (!el || !api.current) return;
      const r = el.getBoundingClientRect(); api.current.puff(cx - r.left, cy - r.top);
    },
  }), []);

  useEffect(() => { api.current?.setTheme(theme); }, [theme]);
  useEffect(() => { api.current?.setPaused(paused); }, [paused]);

  useEffect(() => {
    const el = host.current; if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch { onFail?.(); return; }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.autoClear = false;
    const canvas = renderer.domElement;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x2a1d4a, 1.0));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(-0.45, 1, 0.9); scene.add(sun);
    const rim = new THREE.DirectionalLight(0xc4b5fd, 0.9); rim.position.set(0.8, -0.4, -0.6); scene.add(rim);
    const FOV = 28;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 8000);

    // Background: dotted floor that carries the ripple and lights up under the pointer.
    const bgScene = new THREE.Scene();
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) }, uDpr: { value: 1 },
      uPtr: { value: new THREE.Vector2(-9e3, -9e3) }, uPtrOn: { value: 0 },
      uRip: { value: new THREE.Vector2(0, 0) }, uRipR: { value: 0 }, uRipA: { value: 0 },
      uDot: { value: new THREE.Vector3(1, 1, 1) }, uDotA: { value: 0.06 }, uAccent: { value: hex3("#e91e63") }, uCell: { value: 46 },
    };
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, depthTest: false }));
    bgScene.add(bg);

    const geos = new Map<Kind, THREE.BufferGeometry>();
    const mats = new Map<string, THREE.MeshPhysicalMaterial>();
    const getMat = (tint: Tint, kind: Kind) => {
      const key = `${tint}:${flat(kind)}`;
      let m = mats.get(key);
      if (!m) {
        m = new THREE.MeshPhysicalMaterial({ color: PALETTE[tint], roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.32, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xffffff), envMapIntensity: 0.75, flatShading: flat(kind) });
        mats.set(key, m);
      }
      return m;
    };
    const shTex = shadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0.35 });
    const shadowGeo = new THREE.PlaneGeometry(1, 1);

    let W = 1, H = 1, t = 0, running = false, raf = 0, last = 0, onScreen = true, isPaused = paused;
    const bodies: Body[] = [];
    const ptr = { x: -9e3, y: -9e3, vx: 0, vy: 0, on: 0, at: 0 };
    const look = { x: 0, y: 0 };
    const puffState = { th: 1, x: 0, y: 0, reach: 1 };
    let rects: { x: number; y: number; hx: number; hy: number }[] = [];
    let introAt = 0;
    let scrollY = 0;

    const rnd = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };
    const layout = () => (W < 720 ? (seeds?.narrow ?? HERO_NARROW) : (seeds?.wide ?? HERO_WIDE));

    function build() {
      for (const b of bodies) { scene.remove(b.mesh); scene.remove(b.shadow); }
      bodies.length = 0;
      layout().forEach((s, i) => {
        if (!geos.has(s.kind)) geos.set(s.kind, geometryFor(s.kind));
        const mesh = new THREE.Mesh(geos.get(s.kind)!, getMat(s.tint, s.kind));
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.renderOrder = -1;
        scene.add(shadow); scene.add(mesh);
        const diam = W < 720 ? Math.min((s.s / 100) * W, s.s * 6.4) : Math.min((s.s / 100) * W, s.s * 15);
        const r1 = rnd(i + 1), r2 = rnd(i + 7), r3 = rnd(i + 13);
        bodies.push({
          seed: s, tint: s.tint, mesh, shadow,
          x: s.x * W, y: s.y * H, vx: 0, vy: 0, homeX: s.x * W, homeY: s.y * H, radius: diam / 2, depth: 0.25 + r1 * 0.75,
          angle: (r2 - 0.5) * 0.8, spin: 0, restAngle: (r2 - 0.5) * 0.8,
          pitch: (r3 - 0.5) * 1.1, yaw: (r1 - 0.5) * 1.1, pitchSpin: 0, yawSpin: 0, restPitch: (r3 - 0.5) * 1.1, restYaw: (r1 - 0.5) * 1.1,
          f1: 0.35 + r1 * 0.5, f2: 0.3 + r2 * 0.5, p1: r3 * 6.28, p2: r2 * 6.28, squash: 0,
          pop: 0, popV: 0, hover: 0, hoverV: 0, hoverUntil: 0, wave: 0, kicked: true, delay: 0,
        });
      });
      // move any resting spot that falls on the text to just outside it
      for (const b of bodies) {
        for (const r of rects) {
          const pad = b.radius + 24;
          const l = r.x - r.hx - pad, rr = r.x + r.hx + pad, t0 = r.y - r.hy - pad, bt = r.y + r.hy + pad;
          if (b.homeX > l && b.homeX < rr && b.homeY > t0 && b.homeY < bt) {
            const opts = [
              { d: b.homeX - l, x: l, y: b.homeY }, { d: rr - b.homeX, x: rr, y: b.homeY },
              { d: b.homeY - t0, x: b.homeX, y: t0 }, { d: bt - b.homeY, x: b.homeX, y: bt },
            ].filter((o) => o.x > b.radius && o.x < W - b.radius && o.y > insetTop + b.radius && o.y < H - insetBottom - b.radius)
              .sort((a, c) => a.d - c.d);
            const o = opts[0];
            if (o) { b.homeX = o.x; b.homeY = o.y; } else { b.homeX = b.homeX < r.x ? Math.max(b.radius, l) : Math.min(W - b.radius, rr); }
            b.x = b.homeX; b.y = b.homeY;
          }
        }
      }
      // intro: pop in as a wave from the centre
      const cx = W / 2, cy = H / 2;
      const reach = Math.max(...bodies.map((b) => Math.hypot(b.x - cx, b.y - cy)), 1);
      bodies.forEach((b) => { b.delay = 0.6 * (Math.hypot(b.x - cx, b.y - cy) / reach); if (isPaused) b.pop = 1; });
      introAt = t;
    }

    function measure() {
      const r = el!.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.position.set(0, 0, H / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2))));
      camera.updateProjectionMatrix();
      uniforms.uRes.value.set(W, H); uniforms.uDpr.value = dpr;
      const av = avoid?.current;
      if (av) {
        const a = av.getBoundingClientRect();
        rects = [{ x: a.left - r.left + a.width / 2, y: a.top - r.top + a.height / 2, hx: a.width / 2 + 6, hy: a.height / 2 + 6 }];
      } else rects = [];
    }

    const reachOf = (b: Body) => b.radius * (b.seed.kind === "torus" ? 1 : b.seed.kind === "capsule" ? 0.95 : 1);

    function step(dt: number) {
      const l = Math.exp(-1.6 * dt), h = Math.exp(-0.5 * dt), s = Math.exp(-dt), dsq = Math.exp(-7 * dt);
      const top = insetTop, bottom = H - insetBottom;
      for (const f of bodies) {
        f.vx += (26 * Math.sin(t * f.f1 + f.p1) + (f.homeX - f.x) * 1.8) * dt;
        f.vy += (26 * Math.cos(t * f.f2 + f.p2) + (f.homeY - f.y) * 1.8) * dt;
        // keep away from the text
        for (const r of rects) {
          const ex = f.x - Math.min(r.x + r.hx, Math.max(r.x - r.hx, f.x));
          const ey = f.y - Math.min(r.y + r.hy, Math.max(r.y - r.hy, f.y));
          const d = Math.hypot(ex, ey), o = f.radius + 20;
          if (d >= o) continue;
          const k = (1 - d / o) * 430 * dt;
          const nx = d > 0.001 ? ex / d : Math.sign(f.x - r.x) || 1, ny = d > 0.001 ? ey / d : 0;
          f.vx += nx * k; f.vy += ny * k;
        }
        // pointer shove + drag (the touch wave)
        const dx = f.x - ptr.x, dy = f.y - ptr.y, reach = f.radius + 110, c = Math.sqrt(dx * dx + dy * dy);
        if (c < reach && c > 0.001) {
          const a = 1 - c / reach;
          f.vx += (4.5 * ptr.vx * a + (dx / c) * 120 * a) * dt;
          f.vy += (4.5 * ptr.vy * a + (dy / c) * 120 * a) * dt;
        }
        f.vx *= l; f.vy *= l; f.x += f.vx * dt; f.y += f.vy * dt;
        f.angle += f.spin * dt; f.spin *= h; f.spin += (2.2 * Math.sin(f.restAngle - f.angle) + 0.16 * Math.sin(t * f.f1 + f.p2)) * dt;
        f.pitch += f.pitchSpin * dt; f.yaw += f.yawSpin * dt; f.pitchSpin *= s; f.yawSpin *= s;
        f.pitchSpin += ((f.restPitch - f.pitch) * 5 + 0.5 * Math.sin(t * f.f2 + f.p1)) * dt;
        f.yawSpin += ((f.restYaw - f.yaw) * 5 + 0.5 * Math.cos(t * f.f1 + f.p2)) * dt;
        // edges: bounce with a squash
        const g = reachOf(f);
        const minX = Math.min(g, f.homeX - 40), maxX = Math.max(W - g, f.homeX + 40);
        const minY = Math.min(top + g, f.homeY - 40), maxY = Math.max(bottom - g, f.homeY + 40);
        if (f.x < minX) { f.x = minX; if (f.vx < 0) { f.squash = Math.min(0.5, f.squash + -f.vx / 1600); f.spin += f.vy / 400; f.vx *= -0.6; } }
        if (f.x > maxX) { f.x = maxX; if (f.vx > 0) { f.squash = Math.min(0.5, f.squash + f.vx / 1600); f.spin -= f.vy / 400; f.vx *= -0.6; } }
        if (f.y < minY) { f.y = minY; if (f.vy < 0) { f.squash = Math.min(0.5, f.squash + -f.vy / 1600); f.spin -= f.vx / 400; f.vy *= -0.6; } }
        if (f.y > maxY) { f.y = maxY; if (f.vy > 0) { f.squash = Math.min(0.5, f.squash + f.vy / 1600); f.spin += f.vx / 400; f.vy *= -0.6; } }
        const sp = Math.hypot(f.vx, f.vy); if (sp > 2400) { f.vx *= 2400 / sp; f.vy *= 2400 / sp; }
        f.squash *= dsq;
      }
      // body-body collisions (only between shapes at a similar depth)
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const r = bodies[i], n = bodies[j];
        if (Math.abs(r.depth - n.depth) > 0.55) continue;
        const min = (reachOf(r) + reachOf(n)) * 0.98;
        let ox = n.x - r.x, oy = n.y - r.y; const d2 = ox * ox + oy * oy;
        if (d2 >= min * min) continue;
        let d = Math.sqrt(d2); if (d < 0.001) { d = 0.001; ox = 1; oy = 0; }
        const nx = ox / d, ny = oy / d, pen = min - d;
        const ir = 1 / (r.radius * r.radius), inn = 1 / (n.radius * n.radius), sum = ir + inn;
        r.x -= nx * pen * (ir / sum); r.y -= ny * pen * (ir / sum); n.x += nx * pen * (inn / sum); n.y += ny * pen * (inn / sum);
        const rel = (n.vx - r.vx) * nx + (n.vy - r.vy) * ny; if (rel >= 0) continue;
        const imp = (-1.55 * rel) / sum;
        r.vx -= imp * ir * nx; r.vy -= imp * ir * ny; n.vx += imp * inn * nx; n.vy += imp * inn * ny;
        const tan = -(n.vx - r.vx) * ny + (n.vy - r.vy) * nx;
        r.spin += tan / 500; n.spin -= tan / 500;
        r.squash = Math.min(0.5, r.squash + -rel / 2400); n.squash = Math.min(0.5, n.squash + -rel / 2400);
      }
      // pointer velocity decays; camera looks toward the pointer
      ptr.vx *= Math.exp(-6 * dt); ptr.vy *= Math.exp(-6 * dt);
      const on = ptr.x > -9e2;
      const k = 1 - Math.exp(-3.5 * dt);
      look.x += ((on ? Math.max(-1, Math.min(1, (ptr.x / W) * 2 - 1)) : 0) - look.x) * k;
      look.y += ((on ? Math.max(-1, Math.min(1, (ptr.y / H) * 2 - 1)) : 0) - look.y) * k;
      ptr.on += ((on ? 1 : 0) - ptr.on) * k;
      // hover pop + intro spring
      for (const b of bodies) {
        if (on && Math.hypot(ptr.x - b.x, ptr.y - b.y) < b.radius * 1.05) b.hoverUntil = t + 0.5;
        const active = t < b.hoverUntil;
        const [ks, kd] = active ? [300, 16] : [180, 14];
        b.hoverV += (ks * ((active ? 1 : 0) - b.hover) - kd * b.hoverV) * dt; b.hover += b.hoverV * dt;
        if (t >= introAt + b.delay) {
          if (b.pop === 0) b.popV = 1.2;
          b.popV += (95 * (1 - b.pop) - 9 * b.popV) * dt; b.pop += b.popV * dt;
        }
      }
      // shockwave
      if (puffState.th < 1) {
        puffState.th = Math.min(1, puffState.th + dt / 1.4);
        for (const b of bodies) {
          if (!b.kicked && puffState.th > 0.5 * b.wave) {
            b.kicked = true;
            const ex = b.x - puffState.x, ey = b.y - puffState.y, d = Math.hypot(ex, ey) || 1;
            b.vx += (ex / d) * 260; b.vy += (ey / d) * 260; b.spin += (Math.random() - 0.5) * 6;
          }
        }
      }
    }

    function draw() {
      const th = puffState.th, active = th > 0 && th < 1, o = th / 0.5;
      uniforms.uRip.value.set(puffState.x, puffState.y);
      uniforms.uRipR.value = o * puffState.reach;
      uniforms.uRipA.value = active ? Math.sin(Math.PI * Math.min(1, Math.max(0, o / 1.25))) : 0;
      uniforms.uPtr.value.set(ptr.x, ptr.y); uniforms.uPtrOn.value = ptr.on;
      for (const b of bodies) {
        const bump = active && th > 0.5 * b.wave ? Math.sin(Math.PI * Math.min(1, (th - 0.5 * b.wave) / 0.5)) : 0;
        const scale = Math.max(0, b.pop) * (1 + 0.16 * b.hover) * (1 + 0.3 * bump);
        b.mesh.visible = b.shadow.visible = scale > 0.001;
        const sx = b.x - look.x * b.depth * 22, sy = b.y - (22 * look.y + 0.14 * scrollY) * b.depth;
        const z = (0.55 - b.depth) * 140;
        b.mesh.position.set(sx - W / 2, H / 2 - sy, z);
        b.mesh.rotation.set(b.pitch, b.yaw, b.angle);
        const r = b.radius * scale;
        const sq = b.squash;
        b.mesh.scale.set(r * (1 + sq * 0.28), r * (1 - sq * 0.22), r * (1 + sq * 0.12));
        b.shadow.position.set(sx - W / 2, H / 2 - sy - b.radius * 1.12, z - b.radius);
        b.shadow.scale.set(r * 2.1, r * 0.62, 1);
      }
      renderer.clear();
      if (grid) renderer.render(bgScene, bgCam);
      renderer.render(scene, camera);
    }

    function loop(now: number) {
      raf = 0;
      if (!running) return;
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30); last = now; t += dt;
      step(dt); draw();
      raf = requestAnimationFrame(loop);
    }
    const shouldRun = () => onScreen && !isPaused && document.visibilityState === "visible";
    const sync = () => {
      const run = shouldRun();
      if (run && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
      else if (!run && running) { running = false; cancelAnimationFrame(raf); raf = 0; for (const b of bodies) if (b.pop < 1) b.pop = 1; draw(); }
    };

    // pointer (window-level, like the reference, so the field reacts even under the text)
    let rect = el.getBoundingClientRect();
    const onMove = (e: PointerEvent) => {
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (y < -160 || y > H + 160 || x < -160 || x > W + 160) { ptr.x = ptr.y = -9e3; ptr.vx = ptr.vy = 0; ptr.at = 0; return; }
      const now = performance.now();
      const dt = ptr.at ? Math.max((now - ptr.at) / 1000, 0.006) : 0;
      if (dt) { ptr.vx += ((x - ptr.x) / dt - ptr.vx) * 0.35; ptr.vy += ((y - ptr.y) / dt - ptr.vy) * 0.35; }
      ptr.x = x; ptr.y = y; ptr.at = now;
      if (!running) draw();
    };
    const puff = (x: number, y: number) => {
      const reach = Math.max(...bodies.map((b) => Math.hypot(b.x - x, b.y - y)), 1);
      Object.assign(puffState, { th: 0, x, y, reach });
      for (const b of bodies) { b.wave = Math.hypot(b.x - x, b.y - y) / reach; b.kicked = false; }
      if (!running) { puffState.th = 1; draw(); }
    };
    const burst = (x: number, y: number) => {
      for (let i = 0; i < 10; i++) {
        const p = document.createElement("span");
        p.style.cssText = `position:absolute;left:0;top:0;width:6px;height:6px;border-radius:50%;pointer-events:none;background:${BURST[i % BURST.length]};z-index:2`;
        el!.appendChild(p);
        const a = p.animate([{ transform: `translate(${x - 3}px,${y - 3}px) scale(1)`, opacity: 1 }, { transform: `translate(${x - 3 + (Math.random() - 0.5) * 160}px,${y - 3 + (Math.random() - 0.5) * 160}px) scale(.4)`, opacity: 0 }], { duration: 800, easing: "cubic-bezier(.22,1,.36,1)" });
        a.onfinish = () => p.remove();
      }
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.("a,button,input,textarea,select,label,[data-accent]")) return;
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > W || y > H) return;
      onMove(e);
      let hit: Body | null = null, best = Infinity;
      for (const b of bodies) { const d = Math.hypot(b.x - x, b.y - y); if (d < b.radius * 1.15 && d < best) { best = d; hit = b; } }
      if (hit) {
        hit.tint = CYCLE[(CYCLE.indexOf(hit.tint) + 1) % CYCLE.length];
        hit.mesh.material = getMat(hit.tint, hit.seed.kind);
        hit.squash = 0.45; hit.spin += 14; hit.yawSpin += 8; hit.hoverUntil = t + 0.6;
        burst(hit.x, hit.y);
        if (!running) draw();
      } else puff(x, y);
    };
    const onScroll = () => { rect = el.getBoundingClientRect(); scrollY = -Math.min(0, rect.top); };
    const ro = new ResizeObserver(() => { measure(); onScroll(); build(); draw(); });
    const io = new IntersectionObserver((en) => { onScreen = en.some((x) => x.isIntersecting); sync(); }, { threshold: 0 });
    const onVis = () => sync();

    measure(); build();
    ro.observe(el); if (avoid?.current) ro.observe(avoid.current);
    io.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    canvas.addEventListener("webglcontextlost", () => { running = false; cancelAnimationFrame(raf); onFail?.(); });

    const setTheme = (th: "dark" | "light") => {
      if (th === "dark") { uniforms.uDot.value.set(1, 1, 1); uniforms.uDotA.value = 0.07; shadowMat.opacity = 0.5; }
      else { const c = new THREE.Color("#a99fd0"); uniforms.uDot.value.set(c.r, c.g, c.b); uniforms.uDotA.value = 0.5; shadowMat.opacity = 0.18; }
      uniforms.uAccent.value.copy(hex3(th === "dark" ? "#f06695" : "#e91e63"));
      if (!running) draw();
    };
    setTheme(theme);
    api.current = {
      puff, setTheme,
      setPaused: (p) => { isPaused = p; sync(); },
    };
    sync(); draw();

    return () => {
      running = false; cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll); document.removeEventListener("visibilitychange", onVis);
      geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose());
      shadowGeo.dispose(); shadowMat.dispose(); shTex.dispose(); envTex.dispose(); pmrem.dispose();
      (bg.material as THREE.Material).dispose(); bg.geometry.dispose();
      renderer.dispose(); canvas.remove(); api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }} />;
});

export default ClayField;
