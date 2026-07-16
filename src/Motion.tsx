// ============================================================================
//  PREMIUM NEON — "AI NEURAL NETWORK PULSE"
//  Original, IP-safe abstract motion graphic for microstock.
//  1920x1080 · 60fps · 15s (900 frames) · perfectly seamless loop.
//
//  A layered neural network (input → hidden → hidden → output) rendered in
//  neon line-art. Every forward pass (180 frames, 5 per loop) sends a wave
//  of glowing signals sweeping layer by layer along the connections; nodes
//  ignite sequentially with a flash ring as the wave arrives, and each
//  connection's weight breathes thicker and thinner on its own phase.
//  A large blurred ghost copy of the network drifts slowly behind for
//  depth, over the same bokeh / dust / grain atmosphere as the series.
//
//  Fully deterministic: every pixel is a pure function of the frame and
//  Remotion's seeded random(). All motion periods divide 900 frames.
// ============================================================================

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  random,
} from 'remotion';

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------
const W = 1920;
const H = 1080;
const DUR = 900; // 15 s @ 60 fps

const CX = W / 2;
const CY = H / 2 + 8;

// Network topology: input -> hidden -> hidden -> output
const LAYERS = [4, 6, 6, 3];
const LAYER_X = [430, 812, 1124, 1500];
const SPACING = [168, 138, 138, 190];
const NODE_R = [17, 15, 15, 21];

// Loop-safe periods (every one divides 900)
const PASS = 180;        // one forward pass (5 per loop)
const LAYER_DELAY = 40;  // frames between layer activations
const FIRST_AT = 12;
const FLASH_LEN = 52;
const W_BREATHE = 300;   // weight-thickness breathing

// Palette (same family as the series)
const VIOLET = '#7b34ff';
const VIOLET_HI = '#c8a6ff';
const MAGENTA = '#e83be0';
const WHITE = '#f6eeff';

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const p2 = (n: number) => Math.round(n * 100) / 100;
const ss = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const rnd = (s: number) => random(`nnpulse-${s}`);

// ----------------------------------------------------------------------------
// Layout + edge list (static, derived from seeded random)
// ----------------------------------------------------------------------------
const nodeXY = (li: number, ni: number) => {
  const n = LAYERS[li];
  const y0 = CY - ((n - 1) * SPACING[li]) / 2;
  return {x: LAYER_X[li], y: y0 + ni * SPACING[li]};
};

type Edge = {li: number; a: number; b: number; wBase: number; ph: number; stag: number};
const EDGES: Edge[] = [];
for (let li = 0; li < LAYERS.length - 1; li++) {
  for (let a = 0; a < LAYERS[li]; a++) {
    for (let b = 0; b < LAYERS[li + 1]; b++) {
      const seed = li * 1000 + a * 50 + b;
      EDGES.push({
        li,
        a,
        b,
        wBase: 1.0 + rnd(seed) * 2.2,
        ph: rnd(seed + 1) * TAU,
        stag: rnd(seed + 2) * 6,
      });
    }
  }
}

const activationAt = (li: number) => FIRST_AT + li * LAYER_DELAY;
const sinceAct = (frame: number, li: number) =>
  ((frame % PASS) - activationAt(li) + PASS) % PASS;

// ----------------------------------------------------------------------------
// Defs (gradients, glow filters, grain)
// ----------------------------------------------------------------------------
const defs = (frame: number) => {
  const grainSeed = frame % 60;
  return `<defs>
    <radialGradient id="bgGlow" cx="0.5" cy="0.5" r="0.72">
      <stop offset="0" stop-color="#18092e"/>
      <stop offset="0.5" stop-color="#0b0518"/>
      <stop offset="1" stop-color="#04020b"/>
    </radialGradient>
    <radialGradient id="coreGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${MAGENTA}" stop-opacity="0.36"/>
      <stop offset="0.55" stop-color="${VIOLET}" stop-opacity="0.13"/>
      <stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nodeFill" cx="0.4" cy="0.35" r="0.9">
      <stop offset="0" stop-color="#2a1150"/>
      <stop offset="1" stop-color="#120728"/>
    </radialGradient>
    <filter id="gSm" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <filter id="gMd" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="gLg" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="gXl" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="34"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${grainSeed}" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.65  0 0 0 0.9 0"/></filter>
  </defs>`;
};

// ----------------------------------------------------------------------------
// Background: vignette + drifting bokeh + twinkling dust (loop-periodic)
// ----------------------------------------------------------------------------
const background = (frame: number) => {
  const L = (frame / DUR) * TAU; // integer multiples of L stay seamless
  let bokeh = '';
  for (let i = 0; i < 9; i++) {
    const ph = rnd(i + 11) * TAU;
    const nx = 1 + Math.floor(rnd(i + 12) * 2);
    const ny = 1 + Math.floor(rnd(i + 13) * 2);
    const on = 1 + Math.floor(rnd(i + 14) * 2);
    const bx = rnd(i) * W + Math.sin(L * nx + ph) * 26;
    const by = rnd(i + 1) * H + Math.cos(L * ny + ph) * 20;
    const br = 46 + rnd(i + 2) * 72;
    const op = 0.05 + 0.05 * (0.5 + 0.5 * Math.sin(L * on + i));
    const col = i % 2 ? MAGENTA : VIOLET;
    bokeh += `<circle cx="${p2(bx)}" cy="${p2(by)}" r="${p2(br)}" fill="${col}" opacity="${p2(op)}" filter="url(#gXl)"/>`;
  }
  let dust = '';
  for (let i = 0; i < 46; i++) {
    const ph = rnd(i + 30) * TAU;
    const twN = 4 + Math.floor(rnd(i + 15) * 7);
    const dx = rnd(i + 20) * W + Math.sin(L + ph) * 12;
    const dy = rnd(i + 40) * H + Math.cos(L + ph) * 10;
    const tw = 0.14 + 0.34 * (0.5 + 0.5 * Math.sin(L * twN + rnd(i + 9) * TAU));
    const dr = 0.8 + rnd(i + 5) * 1.4;
    const col = rnd(i + 7) > 0.6 ? MAGENTA : WHITE;
    dust += `<circle cx="${p2(dx)}" cy="${p2(dy)}" r="${p2(dr)}" fill="${col}" opacity="${p2(tw)}"/>`;
  }
  return `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#bgGlow)"/>
    ${bokeh}
    <ellipse cx="${CX}" cy="${CY}" rx="700" ry="360" fill="url(#coreGlow)" filter="url(#gLg)"/>
    ${dust}`;
};

// ----------------------------------------------------------------------------
// Edges: breathing weights + travelling signal wave
// ----------------------------------------------------------------------------
const edgesGroup = (frame: number, ghost: boolean) => {
  const c = frame % PASS;
  let base = '';
  let pulses = '';
  for (const e of EDGES) {
    const A = nodeXY(e.li, e.a);
    const B = nodeXY(e.li + 1, e.b);
    const wAnim =
      e.wBase * (0.72 + 0.28 * Math.sin((frame / W_BREATHE) * TAU + e.ph));
    const baseOp = ghost ? 0.5 : 0.13 + ((e.wBase - 1.0) / 2.2) * 0.24;
    base += `<line x1="${p2(A.x)}" y1="${p2(A.y)}" x2="${p2(B.x)}" y2="${p2(B.y)}" stroke="${VIOLET}" stroke-width="${p2(wAnim)}" opacity="${p2(baseOp)}"/>`;
    if (ghost) continue;

    // signal travelling A -> B inside this layer's window (staggered per edge)
    const t0 = activationAt(e.li) + e.stag;
    const p = clamp((c - t0) / LAYER_DELAY, 0, 1);
    if (p <= 0 || p >= 1) continue;
    const fadeIn = interpolate(p, [0, 0.12], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    });
    const fadeOut = interpolate(p, [0.88, 1], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    });
    const env = fadeIn * fadeOut;
    if (env < 0.02) continue;
    const px = A.x + (B.x - A.x) * p;
    const py = A.y + (B.y - A.y) * p;
    const tp = Math.max(0, p - 0.1);
    const tx = A.x + (B.x - A.x) * tp;
    const ty = A.y + (B.y - A.y) * tp;
    const rr = 2.4 + e.wBase * 1.1;
    pulses += `<line x1="${p2(tx)}" y1="${p2(ty)}" x2="${p2(px)}" y2="${p2(py)}" stroke="${MAGENTA}" stroke-width="${p2(wAnim + 1.2)}" opacity="${p2(env * 0.7)}" stroke-linecap="round" filter="url(#gSm)"/>`;
    pulses += `<circle cx="${p2(px)}" cy="${p2(py)}" r="${p2(rr + 2.4)}" fill="${MAGENTA}" opacity="${p2(env * 0.5)}" filter="url(#gMd)"/>`;
    pulses += `<circle cx="${p2(px)}" cy="${p2(py)}" r="${p2(rr)}" fill="${MAGENTA}" opacity="${p2(env * 0.95)}" filter="url(#gSm)"/>`;
    pulses += `<circle cx="${p2(px)}" cy="${p2(py)}" r="${p2(rr * 0.45)}" fill="${WHITE}" opacity="${p2(env)}"/>`;
  }
  return `<g fill="none">${base}</g><g>${pulses}</g>`;
};

// ----------------------------------------------------------------------------
// Nodes: sequential ignition with flash ring
// ----------------------------------------------------------------------------
const nodesGroup = (frame: number, ghost: boolean) => {
  let s = '';
  for (let li = 0; li < LAYERS.length; li++) {
    const el = sinceAct(frame, li);
    for (let ni = 0; ni < LAYERS[li]; ni++) {
      const {x, y} = nodeXY(li, ni);
      const r = NODE_R[li];
      if (ghost) {
        s += `<circle cx="${p2(x)}" cy="${p2(y)}" r="${r}" fill="none" stroke="${VIOLET}" stroke-width="2" opacity="0.6"/>`;
        continue;
      }
      const jit = rnd(li * 37 + ni) * 8; // organic per-node ignition offset
      const e2 = (el - jit + PASS) % PASS;
      const flash = Math.pow(Math.max(0, 1 - e2 / FLASH_LEN), 2.2);
      const isOut = li === LAYERS.length - 1;
      const edgeCol = isOut ? MAGENTA : VIOLET;
      const ringSc = 1 + flash * 0.9;
      const ringOp = flash * 0.55;
      s += `<g transform="translate(${p2(x)} ${p2(y)})">
        <circle r="${p2(r * 2.1)}" fill="${edgeCol}" opacity="${p2(0.06 + flash * 0.22)}" filter="url(#gLg)"/>
        <circle r="${p2(r * ringSc + 6)}" fill="none" stroke="${MAGENTA}" stroke-width="1.6" opacity="${p2(ringOp)}" filter="url(#gSm)"/>
        <circle r="${r}" fill="url(#nodeFill)"/>
        <circle r="${r}" fill="none" stroke="${edgeCol}" stroke-width="5" opacity="${p2(0.4 + flash * 0.4)}" filter="url(#gMd)"/>
        <circle r="${r}" fill="none" stroke="${isOut ? MAGENTA : VIOLET_HI}" stroke-width="2.2" opacity="${p2(0.85 + flash * 0.15)}"/>
        <circle r="${p2(r * 0.42 + flash * r * 0.2)}" fill="${WHITE}" opacity="${p2(0.28 + flash * 0.72)}" filter="url(#gSm)"/>
        <circle r="${p2(r * 0.2)}" fill="${WHITE}" opacity="${p2(0.5 + flash * 0.5)}"/>
      </g>`;
    }
  }
  return s;
};

// ----------------------------------------------------------------------------
// Scene assembly (ghost depth copy behind the live network)
// ----------------------------------------------------------------------------
const buildScene = (frame: number) => {
  const L = (frame / DUR) * TAU;
  const gx = Math.sin(L) * 14;
  const gy = Math.cos(L) * 10;
  return `<svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    ${defs(frame)}
    ${background(frame)}
    <g transform="translate(${p2(CX + gx)} ${p2(CY + gy)}) scale(1.22) translate(${-CX} ${-CY})" opacity="0.09" filter="url(#gMd)">
      ${edgesGroup(frame, true)}
      ${nodesGroup(frame, true)}
    </g>
    ${edgesGroup(frame, false)}
    ${nodesGroup(frame, false)}
    <rect x="0" y="0" width="${W}" height="${H}" filter="url(#grain)" opacity="0.05" style="mix-blend-mode:soft-light"/>
  </svg>`;
};

// ----------------------------------------------------------------------------
// Composition
// ----------------------------------------------------------------------------
export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const svg = buildScene(frame % DUR);

  return (
    <AbsoluteFill
      style={{backgroundColor: '#04020b'}}
      dangerouslySetInnerHTML={{__html: svg}}
    />
  );
};

export default Motion;
