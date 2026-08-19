/* =============================================================================
   MOTION39 — "BUSINESS OVERVIEW · GROWTH ACTIVATED"
   A business intelligence dashboard assembles module by module - KPI cards,
   revenue curve, product mix donut, regional bars, top products, customer
   growth - and runs live on a flat baseline. Then a cyan-blue energy front
   sweeps in from the left and rewrites every panel as it passes: revenue bends
   into a hockey stick, the deltas jump, the mix re-weights, every bar grows,
   and the whole board lights from steel grey into full neon. An ANNUAL TARGET
   EXCEEDED banner lands and the board keeps burning to the last frame.
   1920 x 1080 - 60 fps - 900 frames (15 s) - ONE-SHOT

   Every figure is a pure function of the frame: KPI counters that tick, a
   revenue curve with a tooltip walking vertex to vertex, regional bars that
   climb, and a customer-growth sparkline that genuinely scrolls. Nothing is a
   static label, so the board reads as instrumentation rather than a
   screenshot.

   Every one of those series is MONOTONE NON-DECREASING, and the whole data
   clock stops at F_FREEZE. A growth board whose figures tick back down reads
   as a glitch rather than as liveness, and a clip that drifts off its peak in
   the last two seconds wastes the frame a buyer scrubs to. This is a one-shot,
   not a loop: it ends held at the maximum.

   Two of those took a second pass, and both are worth knowing about before
   changing them back. The chart cursor scans the year ONCE and parks on DEC —
   walking it back and forth looked livelier but sent the figure inside the
   pill downhill, and that pill is the largest live number on the board. And
   the sparkline draws more of a FIXED curve rather than scrolling a window:
   however the increments are shaped, a scrolling window moves interior points
   down between frames.

   Three things worth knowing if you edit this:

   1. The front runs LEFT to RIGHT, which the engine cannot do directly - its
      x-axis front always travels right to left. The direction is bought by
      swapping A and B: `drawContent` is the FINAL board, `drawConverted` is
      the baseline, and `level` runs 0 -> 1. At level 0 the whole surface is
      "already passed" and therefore baseline; as the front moves right the
      unpassed - final - region grows behind it from the left.

   2. Because of that swap `convert` is latched ON from frame 0 and RELEASED at
      the end, the opposite of a normal convert clip. It is released at F_CLEAR
      while the front is already off the right edge, so the conversion mask is
      zero everywhere and the release cannot be seen. Release it later, once
      fire has reached 0 and the shader has dropped to its bypass blit, and the
      entire board snaps back to grey for a few frames.

   3. At F_SWITCH the level is snapped back off the LEFT edge and `frontOnly`
      is turned off, which converts the travelling front into a pure wrap. That
      only works parked on the left: the line-mask samples to the left of the
      front, finds no material out there and collapses wTop to 0. The snap is
      invisible because fire is 0 for the ~26 frames around it, and harmless
      because convert is already 0 - level no longer selects artwork, only
      where the fire sits.

   Shader adapted from the Canvas UI "FlameWrap" component
   (github.com/DavidHDev/canvas-ui) - MIT + Commons Clause.
   ========================================================================== */

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* -------------------------------------------------------------- embedded font */

const FONT_400_B64 = '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';
const FONT_700_B64 = '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';

const FONT_CSS = `
@font-face{font-family:'MxSans';font-style:normal;font-weight:400;font-display:block;
src:url(data:font/woff2;base64,${FONT_400_B64}) format('woff2');}
@font-face{font-family:'MxSans';font-style:normal;font-weight:700;font-display:block;
src:url(data:font/woff2;base64,${FONT_700_B64}) format('woff2');}
`;

let fontsPromise: Promise<unknown> | null = null;
const ensureFonts = () => {
  if (fontsPromise) return fontsPromise;
  const st = document.createElement('style');
  st.textContent = FONT_CSS;
  document.head.appendChild(st);
  fontsPromise = Promise.all([
    document.fonts.load("400 24px 'MxSans'"),
    document.fonts.load("700 24px 'MxSans'"),
  ]).catch(() => null);
  return fontsPromise;
};

const useEmbeddedFonts = () => {
  const [handle] = useState(() => delayRender('motion31-fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
      continueRender(handle);
    };
    const timer = setTimeout(finish, 2500);
    ensureFonts().then(finish, finish);
    return () => clearTimeout(timer);
  }, [handle]);
  return ready;
};


/* ------------------------------------------------------------------ types */

type FlameParams = {
  /** flame colour, linear 0..1 */
  color: [number, number, number];
  /** overall brightness, 0..2 */
  intensity: number;
  /** reach of the flames past the front, in px — the master scale of the effect */
  height: number;
  /** reach of the rim glow around the silhouette, in px */
  spread: number;
  /** animation speed multiplier */
  speed: number;
  /** flame detail, 0 (broad licks) .. 1 (fine licks) */
  scale: number;
  /** amplitude of the turbulence shaping the flames, 0..1 */
  turbulence: number;
  /** frequency multiplier of the turbulence, 0.2..3 */
  turbulenceScale: number;
  /** how far from the front the heat warps the artwork, in px */
  turbulenceReach: number;
  /** brightness of spark highlights, 0 disables */
  sparks: number;
  /** size multiplier for individual sparks */
  sparkSize: number;
  /** how many sparks fly at once */
  sparkDensity: number;
  /** how fast sparks rise */
  sparkSpeed: number;
  /** strength of the molten glow hugging the silhouette, 0..3 */
  rim: number;
  /** how far the flames bite into the silhouette, in px */
  melt: number;
  /** heat shimmer displacement of the artwork near the front, in px */
  distortion: number;
  /** smoke drifting off the flames, 0..2 */
  smoke: number;
  /** brightness of the glowing ember line at the front, 0..2 */
  ember: number;
  /** darkness of the charred band behind the front, 0..2 */
  scorch: number;
};

type FlameFrontProps = {
  /** where the GL canvas sits on screen, in composition px */
  region: {x: number; y: number; w: number; h: number};
  /** the artwork rect, in composition px. Pad it ~100px around your shape so
   *  the baked SDF has room to describe the space just outside the silhouette. */
  rect: {cx: number; cy: number; w: number; h: number};
  /** draws the artwork into a `rect.w` x `rect.h` canvas */
  drawContent: (c: CanvasRenderingContext2D, w: number, h: number) => void;
  /** optional second version the front converts the artwork INTO */
  drawConverted?: (c: CanvasRenderingContext2D, w: number, h: number) => void;
  /** bake the SDF from THIS instead of `drawContent`. Needed whenever the
   *  artwork animates: the silhouette has to come from the finished frame. */
  sdfDraw?: (c: CanvasRenderingContext2D, w: number, h: number) => void;
  /** re-rasterise the artwork only when this changes. Leave undefined for
   *  artwork that animates every frame (costs one Canvas2D redraw per frame). */
  contentKey?: string | number;

  params?: Partial<FlameParams>;

  /** front direction. 'y' = a horizontal line travelling down (default),
   *  'x' = a vertical line travelling right-to-left */
  axis?: 'y' | 'x';
  /** front position, 1 = at the far edge of the rect, 0 = past the near edge.
   *  Leave at 1 for the classic "flames on the top edge" wrap. */
  level?: number;

  /** master fire visibility, 0..1. At 0 the shader short-circuits to a plain
   *  blit of the artwork, which makes non-burning frames essentially free. */
  fire?: number;
  /** how much of the artwork the front REMOVES behind it, 0..1.
   *  This is a latched state flag, not a brightness envelope — see pitfalls. */
  eat?: number;
  /** how much of the artwork the front CONVERTS to `drawConverted`, 0..1.
   *  Also a latched flag. */
  convert?: number;
  /** keep the fire at the travelling front instead of wrapping the whole
   *  silhouette — the right choice for a scan sweeping a large object. */
  frontOnly?: boolean;

  /** cheap screen-blend bloom over the region, 0 disables */
  bloom?: number;
  style?: React.CSSProperties;
};

/* --------------------------------------------------------------- presets */

/** The stock Canvas UI FlameWrap playground preset — a real fire, tuned for an
 *  object roughly 300 px across. Length-based values (height, spread, melt,
 *  distortion, turbulenceReach) scale with your object; everything else is
 *  already relative to `height` inside the shader and can stay put. */
const FIRE_PRESET: FlameParams = {
  color: [1, 0.3098, 0], // #FF4F00
  intensity: 1,
  height: 190,
  spread: 13,
  speed: 0.5,
  scale: 0.94,
  turbulence: 0.63,
  turbulenceScale: 0.65,
  turbulenceReach: 16,
  sparks: 1.5,
  sparkSize: 1.05,
  sparkDensity: 1,
  sparkSpeed: 1,
  rim: 2.25,
  melt: 5,
  distortion: 13,
  smoke: 0.7,
  ember: 2,
  scorch: 0,
};

/** Cool, premium variant — reads as tech/fintech rather than literal fire. */
const BLUE_FIRE_PRESET: FlameParams = {
  ...FIRE_PRESET,
  color: [0.31, 0.54, 1], // #4F8AFF
  intensity: 0.6,
  scale: 0.72,
  turbulence: 0.52,
  turbulenceScale: 0.5,
  sparkSize: 0.34,
  scorch: 0.55,
};

/** Height dialled right down and smoke off: a crackling inspection / containment
 *  front rather than a plume. Pair with a `drawConverted` for scan effects. */
const FIELD_PRESET: FlameParams = {
  ...FIRE_PRESET,
  color: [0.16, 0.83, 0.94], // #29D4F0
  intensity: 0.9,
  height: 34,
  spread: 10,
  speed: 1.0,
  turbulenceReach: 7,
  sparks: 1.0,
  sparkSize: 0.8,
  sparkDensity: 1.3,
  sparkSpeed: 1.2,
  rim: 1.7,
  melt: 2,
  distortion: 5,
  smoke: 0,
};

/** Scale the length-based params of a preset to your object's size.
 *  `factor` = yourObjectWidth / 300. */
const scalePreset = (p: FlameParams, factor: number): FlameParams => ({
  ...p,
  height: p.height * factor,
  spread: Math.max(8, p.spread * factor),
  melt: p.melt * factor,
  distortion: p.distortion * factor,
  turbulenceReach: Math.max(4, p.turbulenceReach * factor),
});

/* -------------------------------------------------------------- SDF baker */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** smoothstep ramp between two frame numbers */
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** constant-speed traverse with soft ends — the right shape for a front,
 *  which does not accelerate. `a`/`b` are the ease-in/ease-out fractions. */
const trapezoid = (u: number, a = 0.12, b = 0.16) => {
  const x = clamp01(u);
  const area = 1 - a / 2 - b / 2;
  let s: number;
  if (x < a) s = (x * x) / (2 * a);
  else if (x < 1 - b) s = a / 2 + (x - a);
  else {
    const r = (1 - x) / b;
    s = area - (r * r * b) / 2;
  }
  return s / area;
};

const SDF_RANGE = 220;

/** Two-pass chamfer distance transform of the artwork's alpha. Negative inside
 *  the silhouette, positive outside, packed into an 8-bit RGBA texture.
 *  Run this once (useMemo) — it is the thing that makes the fire follow the
 *  shape's real outline instead of its bounding box. */
const bakeSdf = (
  draw: (c: CanvasRenderingContext2D, w: number, h: number) => void,
  W: number,
  H: number,
  range = SDF_RANGE,
): Uint8Array => {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d', {willReadFrequently: true})!;
  draw(c, W, H);
  const img = c.getImageData(0, 0, W, H).data;

  const N = W * H;
  const INF = 1e9;
  const dIn = new Float32Array(N);
  const dOut = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const inside = img[i * 4 + 3] > 110;
    dIn[i] = inside ? INF : 0;
    dOut[i] = inside ? 0 : INF;
  }
  const DD = 1.41421356;
  const pass = (d: Float32Array) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let v = d[i];
        if (x > 0) v = Math.min(v, d[i - 1] + 1);
        if (y > 0) {
          v = Math.min(v, d[i - W] + 1);
          if (x > 0) v = Math.min(v, d[i - W - 1] + DD);
          if (x < W - 1) v = Math.min(v, d[i - W + 1] + DD);
        }
        d[i] = v;
      }
    }
    for (let y = H - 1; y >= 0; y--) {
      for (let x = W - 1; x >= 0; x--) {
        const i = y * W + x;
        let v = d[i];
        if (x < W - 1) v = Math.min(v, d[i + 1] + 1);
        if (y < H - 1) {
          v = Math.min(v, d[i + W] + 1);
          if (x < W - 1) v = Math.min(v, d[i + W + 1] + DD);
          if (x > 0) v = Math.min(v, d[i + W - 1] + DD);
        }
        d[i] = v;
      }
    }
  };
  pass(dIn);
  pass(dOut);

  const out = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const v = Math.round(clamp01((dOut[i] - dIn[i]) / range / 2 + 0.5) * 255);
    out[i * 4] = v;
    out[i * 4 + 1] = v;
    out[i * 4 + 2] = v;
    out[i * 4 + 3] = 255;
  }
  return out;
};

/* --------------------------------------------------------------- shaders */

const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uContentB;
uniform sampler2D uSdf;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uRectCenter;
uniform vec2 uRectHalf;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uHeight;
uniform float uSpread;
uniform float uScale;
uniform float uTurbulence;
uniform float uTurbScale;
uniform float uTurbReach;
uniform float uSparks;
uniform float uSparkSize;
uniform float uSparkDensity;
uniform float uSparkSpeed;
uniform float uRim;
uniform float uMelt;
uniform float uDistortion;
uniform float uSmoke;
uniform float uEmber;
uniform float uScorch;
uniform float uFire;
uniform float uEat;
uniform float uConvert;
uniform float uInnerCut;
uniform float uOuterCut;
uniform float uCullD;
uniform float uBypass;
uniform float uFrontOnly;
uniform float uBurnEdge;
uniform float uSdfRange;
uniform float uAxis;      // 0 = front travels along Y, 1 = along X

#define S(a, b, t) smoothstep(a, b, t)

vec3 permute (vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise (vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm (vec2 p) {
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  float v = 0.5 * snoise(p);
  p = m * p * 2.03 + vec2(11.3, 7.1); v += 0.27 * snoise(p);
  p = m * p * 1.97 + vec2(3.7, 19.1); v += 0.15 * snoise(p);
  p = m * p * 2.01 + vec2(8.3, 2.9);  v += 0.08 * snoise(p);
  return v * 0.5 + 0.5;
}

float fbm2 (vec2 p) {
  float v = 0.62 * snoise(p);
  v += 0.31 * snoise(mat2(0.8, -0.6, 0.6, 0.8) * p * 2.13 + vec2(5.2, 1.3));
  return v * 0.54 + 0.5;
}

vec2 turbulence (vec2 p) {
  float freq = 12.0 * clamp(uScale, 0.05, 1.0) * clamp(uTurbScale, 0.2, 3.0);
  mat2 rot = mat2(0.6, -0.8, 0.8, 0.6);
  for (float i = 0.0; i < 7.0; i++) {
    float phase = freq * (p * rot).y + 6.0 * uTime + i;
    p += uTurbulence * rot[0] * sin(phase) / freq;
    rot *= mat2(0.6, -0.8, 0.8, 0.6);
    freq *= 1.2;
  }
  return p;
}

vec3 hash3 (vec2 p) {
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)),
    dot(p, vec2(419.2, 371.9)));
  return fract(sin(q) * 43758.5453);
}

vec4 sampleMix (vec2 uv, float m) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  vec2 t = vec2(uv.x, 1.0 - uv.y);
  vec4 c = mix(texture(uContent, t), texture(uContentB, t), clamp(m, 0.0, 1.0));
  return vec4(c.rgb * c.a, c.a);
}

void main () {
  vec2 frag = vUv * uResolution;
  vec2 rel = frag - uRectCenter;

  /* the whole front is rotated when uAxis = 1, so relF.y always runs along the
     direction of travel and the plume always licks back the way it came */
  vec2 relF = (uAxis > 0.5) ? vec2(-rel.y, rel.x) : rel;
  vec2 halfF = (uAxis > 0.5) ? vec2(uRectHalf.y, uRectHalf.x) : uRectHalf;

  float unit = max(uHeight, 24.0);
  float spreadPx = max(uSpread, 8.0);
  float t = uTime;
  float detail = clamp(uScale, 0.05, 1.0);

  vec2 cUv = (rel + uRectHalf) / (2.0 * uRectHalf);
  vec2 cUvC = clamp(cUv, vec2(0.0), vec2(1.0));

  float d0 = (texture(uSdf, vec2(cUvC.x, 1.0 - cUvC.y)).r * 2.0 - 1.0) * uSdfRange;
  float above = relF.y - uBurnEdge;   // > 0 : the front has already passed here
  float aheadG = mix(1.0,
    1.0 - S(0.22 * unit, 0.75 * unit, max(-above, 0.0)), uFrontOnly);

  /* ---- fast paths: these are what make idle frames nearly free ---------- */
  if (uBypass > 0.5) { outColor = sampleMix(cUv, uConvert); return; }
  if (d0 > uCullD) { outColor = vec4(0.0); return; }
  if (above > uOuterCut) {
    outColor = (uEat > 0.5) ? vec4(0.0) : sampleMix(cUv, uConvert);
    return;
  }
  if (d0 < -uInnerCut && above < -uInnerCut) { outColor = sampleMix(cUv, 0.0); return; }
  if (uFrontOnly > 0.5 && uEat < 0.001 && above < -uOuterCut) {
    outColor = sampleMix(cUv, 0.0); return;
  }

  float px = relF.x / unit;
  float py = relF.y / unit;

  float yA = max(above, 0.0) / unit;
  float sway = snoise(vec2(px * 1.1, t * 0.5)) * 0.55
    + snoise(vec2(px * 2.4, t * 0.9 + 41.0)) * 0.25;
  float sx = px + yA * sway;
  float env = fbm2(vec2(sx * 1.6 * detail + 3.7, t * 0.55 - yA * 0.4));
  float env2 = fbm2(vec2(sx * 3.6 * detail, t * 0.85 + 17.0 - yA * 0.6));
  float tongue = clamp(0.75 * S(0.3, 0.9, env) + 0.5 * S(0.4, 0.95, env2), 0.0, 1.0);

  float meltPx = max(uMelt, 1.0);
  float biteTop = (3.0 + meltPx * 1.4) * (0.35 + 0.65 * tongue)
    + 2.0 * snoise(vec2(px * 5.0 * detail, t * 1.1 + 5.0));
  float frontTop = relF.y - (uBurnEdge - biteTop);

  float perim = fbm2(relF * (1.9 / unit) * detail + vec2(0.0, t * 0.4) + 31.0);
  float frontSB = d0 + 3.0 + meltPx * (0.25 + 0.75 * perim);

  /* the flame may only exist where the artwork still HAS material at the
     front's own coordinate — otherwise the plume rises out of empty space */
  float fu = clamp((uBurnEdge + halfF.y) / (2.0 * halfF.y), 0.0, 1.0);
  vec2 sA, sB, sC;
  if (uAxis > 0.5) {
    sA = vec2(fu, 1.0 - cUvC.y);
    sB = vec2(clamp(fu - 0.014, 0.0, 1.0), 1.0 - cUvC.y);
    sC = vec2(clamp(fu - 0.032, 0.0, 1.0), 1.0 - cUvC.y);
  } else {
    sA = vec2(cUvC.x, 1.0 - fu);
    sB = vec2(cUvC.x, clamp(1.0 - fu + 0.014, 0.0, 1.0));
    sC = vec2(cUvC.x, clamp(1.0 - fu + 0.032, 0.0, 1.0));
  }
  float lineA = max(texture(uContent, sA).a,
    max(texture(uContent, sB).a, texture(uContent, sC).a));
  float lineMask = S(0.10, 0.55, lineA);

  float wCut = S(-0.62 * unit, -0.1 * unit, above);
  float wTop = wCut * lineMask;              // weight only, never geometry
  float front = max(frontSB, frontTop);      // SDF of shape INTERSECT behind-front

  float reach = mix(spreadPx * 0.9, unit * (0.2 + 0.45 * tongue), wTop);
  float q = front / reach;

  vec2 np = vec2(px * 2.3, py * 1.25 - t * 1.85) * detail;
  np = turbulence(np);
  float n = fbm(np);

  float win = S(-0.08, 0.02, q);
  float root = exp(-abs(q) * 5.0);
  float ridge = 1.0 - abs(2.0 * n - 1.0);
  float flameH = mix(1.0, 0.5 + 0.6 * tongue, wTop);
  float g = max(q, 0.0) / flameH;
  float shred = fbm2(np * 1.9 + 63.0);
  g *= 1.0 + 0.7 * (shred - 0.5) * S(0.2, 0.8, g);
  float dens = n * 0.95 + ridge * 0.45 - 0.18
    + (1.0 - min(g, 1.0)) * 0.3 - g * (0.9 + 0.25 * n);
  dens = clamp(dens * 2.4, 0.0, 1.0) * win;
  dens *= mix(1.0 - S(0.32, 1.05, q), 1.0 - S(0.9, 1.2, g), wTop);
  float body = dens * dens * (3.0 - 2.0 * dens);
  float emis = clamp(uIntensity, 0.0, 2.0);
  float e = body * (0.55 + 0.75 * root) * (0.45 + 0.55 * n)
    + win * root * (0.1 + 0.4 * n);
  e *= mix(0.45, 1.0, wTop) * max(emis, 0.001) * aheadG;

  vec3 hot = mix(uColor, vec3(1.0), 0.35);
  vec3 deep = mix(uColor, uColor * uColor, 0.5) * 0.9;
  float ramp = 1.0 - exp(-e * 2.4);
  vec3 fireCol = mix(deep, uColor, S(0.0, 0.55, ramp));
  float core = ramp * (0.45 + 0.55 * exp(-g * 2.2)) * (0.5 + 0.5 * n);
  fireCol = mix(fireCol, hot, S(0.7, 1.05, core));
  fireCol *= 0.8 + 0.4 * ramp;
  float fireA = clamp(1.0 - exp(-e * 3.4), 0.0, 1.0);

  float halo = exp(-max(front, 0.0) / (spreadPx * 1.2)) * S(0.0, 3.0, front)
    * (0.5 + 0.5 * n) * 0.3 * clamp(uRim, 0.0, 2.0) * mix(1.0, 0.45, wTop);
  halo *= 1.0 - S(0.15 * unit, 0.6 * unit, above);  // rim belongs to material
  halo *= aheadG;
  vec3 glow = uColor * halo * clamp(uIntensity, 0.0, 2.0);

  if (uSparks > 0.001) {
    float sSpeed = max(uSparkSpeed, 0.05);
    float sCells = 5.0 * clamp(uSparkDensity, 0.3, 2.5);
    float sSize = clamp(uSparkSize, 0.2, 3.0);
    float gate = S(-0.05, 0.1, q) * (1.0 - S(1.3, 2.2, q)) * wTop;
    float spark = 0.0;
    for (float L = 0.0; L < 2.0; L++) {
      float speed = 1.5 * sSpeed * (0.75 + 0.5 * L);
      vec2 ps = vec2(px, py - t * speed);
      ps.x += 0.08 * snoise(vec2(py * 0.9 + L * 5.0, t * 0.5));
      float cells = sCells * (1.0 + 0.6 * L);
      vec2 cl = floor(ps * cells) + L * 19.0;
      vec2 fr = fract(ps * cells);
      vec3 rnd = hash3(cl);
      vec3 rnd2 = hash3(cl + 7.3);
      float on = step(rnd2.x, 0.42);
      float life = fract(rnd.z + t * sSpeed * (0.3 + 0.5 * rnd2.x));
      vec2 ppos = vec2(0.5) + 0.56 * (rnd.xy - 0.5);
      ppos.x += 0.14 * sin(t * (0.7 + rnd.z * 2.8) + rnd.y * 6.2832)
        + 0.1 * snoise(vec2(t * 0.6 + rnd.x * 9.0, cl.y * 0.7))
        + (life - 0.5) * 0.5 * (rnd2.y - 0.5);
      ppos.y += (life - 0.5) * 0.3 * rnd2.y;
      float tw = S(0.02, 0.2, life) * S(1.0, 0.55, life);
      tw *= 0.75 + 0.25 * sin(t * (6.0 + rnd2.z * 9.0) + rnd.x * 6.2832);
      vec2 pd = (fr - ppos) / cells * unit;
      pd.y *= 0.55 + 0.3 * rnd2.z;
      float dp = length(pd);
      float r = (0.004 + 0.014 * rnd.y * rnd.y) * unit * sSize * mix(1.15, 0.55, life);
      float bmask = S(0.5, 0.32, max(abs(fr.x - 0.5), abs(fr.y - 0.5)));
      spark += (exp(-dp * dp / (r * r)) + exp(-dp * dp / (r * r * 6.0)) * 0.3)
        * tw * tw * on * bmask * (1.0 - 0.35 * L);
    }
    spark *= gate * uSparks;
    fireCol += mix(uColor, vec3(1.0), 0.55) * spark * 1.6;
    fireA = clamp(fireA + spark * 0.85, 0.0, 1.0);
  }

  vec2 edgePx = min(frag, uResolution - frag);
  float fadeW = max(24.0, spreadPx * 0.75);
  float fade = S(0.0, fadeW, edgePx.x) * S(0.0, fadeW, edgePx.y);
  fireA *= fade * uFire;
  glow *= fade * uFire;
  halo *= fade * uFire;

  float rise = max(above, 0.0);
  float smoke = S(1.55, 1.05, g) * S(0.85, 1.15, g) * (1.0 - body)
    * wCut * lineMask
    * exp(-rise / (unit * 0.7)) * (1.0 - S(uOuterCut * 0.5, uOuterCut * 0.96, rise))
    * S(0.45, 0.9, fbm2(np * 0.55 + vec2(0.0, 17.0)))
    * 0.055 * clamp(uSmoke, 0.0, 2.0) * fade * uFire;
  vec3 smokeCol = mix(vec3(0.5), uColor, 0.5);

  float inRect = step(abs(cUv.x - 0.5), 0.5) * step(abs(cUv.y - 0.5), 0.5);

  float nearBand = 1.0 - S(0.5 * unit, 1.6 * unit, abs(above));
  vec2 wob = vec2(snoise(np * 1.7 + 9.0), snoise(np * 1.7 + 27.0));
  vec2 disp = wob * min(uDistortion, 32.0)
    * exp(-abs(front) / max(uTurbReach, 4.0)) * nearBand;
  vec2 cUvD = clamp(cUv + disp / (2.0 * uRectHalf), vec2(0.0015), vec2(0.9985));

  float dn = fbm2(relF * (3.2 / unit) * detail + vec2(0.0, t * 0.5) + 91.0);
  float dw = mix(2.0, 5.0, wCut);
  float noff = (dn - 0.5) * dw * 2.5;
  float eatMask = S(-dw, dw, front + noff);       // outline melt included
  float convMask = S(-dw, dw, frontTop + noff);   // travelling front only
  vec4 content = sampleMix(cUvD, convMask * uConvert);

  /* gated by uFire as well as uIntensity: otherwise fading the fire out
     leaves a permanent ember line painted into the artwork */
  float burn = clamp(uIntensity, 0.0, 1.0) * uFire;
  float nearFront = 1.0 - S(0.10 * unit, 0.45 * unit, max(-above, 0.0));
  float depth = abs(front);   // a BAND around the front, not an inside-only depth
  float emberW = mix(2.5, 5.5, wCut);
  float emberN = 0.3 + 0.7 * fbm2(np * 2.2 + 73.0);
  float emberK = clamp(uEmber, 0.0, 2.0);
  float ember = exp(-depth / emberW) * emberN * emberK * nearFront;
  float whiteHot = exp(-depth / (emberW * 0.4)) * emberN * emberN * emberK * nearFront;

  float ca = content.a;
  vec3 crgb = ca > 0.001 ? content.rgb / ca : content.rgb;
  float charW = mix(4.0, 6.0 + meltPx * 1.6, wCut)
    * (0.5 + 0.5 * fbm2(relF * (2.6 / unit) * detail + 57.0));
  crgb = mix(crgb, crgb * vec3(0.22, 0.19, 0.17),
    clamp((1.0 - S(charW, charW * 2.4, max(-front, 0.0))) * nearFront
      * 0.85 * burn * clamp(uScorch, 0.0, 2.0), 0.0, 1.0));
  crgb = mix(crgb, uColor * 1.2, clamp(ember, 0.0, 1.0) * burn);
  crgb = mix(crgb, mix(uColor, vec3(1.0), 0.3) * 1.2, clamp(whiteHot, 0.0, 1.0) * burn);

  float cA = ca * (1.0 - eatMask * uEat) * inRect;
  float smk = smoke * (1.0 - cA);
  vec3 base = crgb * cA + smokeCol * smk;
  float alpha = clamp(fireA + min(cA + smk, 1.0) * (1.0 - fireA) + halo * 0.5, 0.0, 1.0);
  outColor = vec4(fireCol * fireA + base * (1.0 - fireA) + glow, alpha);
}`;

/* -------------------------------------------------------------- GL plumbing */

type Kit = {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  texA: WebGLTexture;
  texB: WebGLTexture;
  sdf: WebGLTexture;
  buf: WebGLBuffer;
  u: Record<string, WebGLUniformLocation | null>;
};

const initGL = (canvas: HTMLCanvasElement, sdfData: Uint8Array, w: number, h: number) => {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
    // Without this the headless screenshot can catch an empty buffer, and
    // drawImage(glCanvas, …) for the bloom pass fails outright.
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;
  const compile = (type: number, src: string): WebGLShader | null => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      // eslint-disable-next-line no-console
      console.error('FlameFront shader:', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const prog = gl.createProgram()!;
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    // eslint-disable-next-line no-console
    console.error('FlameFront link:', gl.getProgramInfoLog(prog));
    return null;
  }

  const u: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(prog, i)!;
    u[info.name] = gl.getUniformLocation(prog, info.name);
  }

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const mkTex = () => {
    const tx = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tx;
  };
  const texA = mkTex();
  const texB = mkTex();
  const sdf = mkTex();
  gl.bindTexture(gl.TEXTURE_2D, sdf);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, sdfData);

  return {gl, prog, texA, texB, sdf, buf, u} as Kit;
};

/* ------------------------------------------------------------- component */

const FlameFront: React.FC<FlameFrontProps> = ({
  region,
  rect,
  drawContent,
  drawConverted,
  sdfDraw,
  contentKey,
  params,
  axis = 'y',
  level = 1,
  fire = 1,
  eat = 0,
  convert = 0,
  frontOnly = false,
  bloom = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p: FlameParams = useMemo(() => ({...FIRE_PRESET, ...params}), [params]);

  const outRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLCanvasElement>(null);
  const kitRef = useRef<Kit | null>(null);
  const aRef = useRef<HTMLCanvasElement | null>(null);
  const bRef = useRef<HTMLCanvasElement | null>(null);
  const bakedRef = useRef<string | number | undefined>(undefined);
  const fbRef = useRef<HTMLCanvasElement>(null);
  const deadRef = useRef(false);

  // The SDF describes a static silhouette — bake it once.
  const sdfData = useMemo(
    () => bakeSdf(sdfDraw ?? drawContent, rect.w, rect.h),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rect.w, rect.h],
  );

  useLayoutEffect(() => () => {
    const k = kitRef.current;
    if (k) {
      k.gl.deleteTexture(k.texA);
      k.gl.deleteTexture(k.texB);
      k.gl.deleteTexture(k.sdf);
      k.gl.deleteProgram(k.prog);
      k.gl.deleteBuffer(k.buf);
      kitRef.current = null;
    }
  }, []);

  // useLayoutEffect (not useEffect) so the draw lands before the browser paints,
  // and no dependency array so it re-runs on every frame Remotion seeks to.
  useLayoutEffect(() => {
    const out = outRef.current;
    const fb = fbRef.current;
    if (!out) return;
    let kit = kitRef.current;
    if (!kit && !deadRef.current) {
      out.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        kitRef.current = null; // re-init on the next frame instead of going blank
      });
      kit = initGL(out, sdfData, rect.w, rect.h);
      kitRef.current = kit;
      if (!kit) deadRef.current = true;
    }
    if (!kit) {
      /* GL is unusable here. Blit the artwork so the object is still in the
         frame — a video missing its subject is far worse than one missing
         its fire. */
      out.style.display = 'none';
      if (fb) {
        fb.style.display = 'block';
        const c2 = fb.getContext('2d');
        if (c2) {
          c2.setTransform(1, 0, 0, 1, 0, 0);
          c2.clearRect(0, 0, fb.width, fb.height);
          c2.save();
          c2.translate(rect.cx - region.x - rect.w / 2, rect.cy - region.y - rect.h / 2);
          const drawer = convert > 0.5 && drawConverted ? drawConverted : drawContent;
          if (eat > 0.5) {
            const lv = clamp01(level);
            c2.beginPath();
            if (axis === 'x') c2.rect(0, 0, rect.w * lv, rect.h);
            else c2.rect(0, rect.h * (1 - lv), rect.w, rect.h * lv);
            c2.clip();
          }
          drawer(c2, rect.w, rect.h);
          c2.restore();
        }
      }
      return;
    }
    out.style.display = 'block';
    if (fb) fb.style.display = 'none';

    const need = contentKey === undefined || bakedRef.current !== contentKey;
    if (!aRef.current) {
      const cv = document.createElement('canvas');
      cv.width = rect.w;
      cv.height = rect.h;
      aRef.current = cv;
    }
    if (!bRef.current && drawConverted) {
      const cv = document.createElement('canvas');
      cv.width = rect.w;
      cv.height = rect.h;
      bRef.current = cv;
    }
    if (need) {
      const ca = aRef.current.getContext('2d')!;
      ca.setTransform(1, 0, 0, 1, 0, 0);
      drawContent(ca, rect.w, rect.h);
      if (drawConverted && bRef.current) {
        const cb = bRef.current.getContext('2d')!;
        cb.setTransform(1, 0, 0, 1, 0, 0);
        drawConverted(cb, rect.w, rect.h);
      }
      bakedRef.current = contentKey;
    }

    const {gl, prog, texA, texB, sdf, u} = kit;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    if (need) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, aRef.current);
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texB);
    if (need) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
        bRef.current ?? aRef.current);
    }
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, sdf);

    gl.useProgram(prog);
    const f1 = (k: string, v: number) => gl.uniform1f(u[k]!, v);
    gl.uniform1i(u.uContent!, 0);
    gl.uniform1i(u.uContentB!, 1);
    gl.uniform1i(u.uSdf!, 2);
    gl.uniform2f(u.uResolution!, region.w, region.h);
    gl.uniform2f(u.uRectCenter!, rect.cx - region.x, region.h - (rect.cy - region.y));
    gl.uniform2f(u.uRectHalf!, rect.w / 2, rect.h / 2);
    gl.uniform3f(u.uColor!, p.color[0], p.color[1], p.color[2]);
    f1('uSdfRange', SDF_RANGE);
    f1('uTime', (frame / fps) * p.speed);
    f1('uIntensity', p.intensity);
    f1('uHeight', p.height);
    f1('uSpread', p.spread);
    f1('uScale', p.scale);
    f1('uTurbulence', p.turbulence);
    f1('uTurbScale', p.turbulenceScale);
    f1('uTurbReach', p.turbulenceReach);
    f1('uSparks', p.sparks);
    f1('uSparkSize', p.sparkSize);
    f1('uSparkDensity', p.sparkDensity);
    f1('uSparkSpeed', p.sparkSpeed);
    f1('uRim', p.rim);
    f1('uMelt', p.melt);
    f1('uDistortion', p.distortion);
    f1('uSmoke', p.smoke);
    f1('uEmber', p.ember);
    f1('uScorch', p.scorch);
    f1('uFire', fire);
    f1('uEat', eat);
    f1('uConvert', convert);
    f1('uAxis', axis === 'x' ? 1 : 0);
    f1('uFrontOnly', frontOnly ? 1 : 0);
    f1('uBurnEdge', (axis === 'x' ? rect.w : rect.h) * (level - 0.5));

    // At zero fire there is nothing left to compute but the artwork itself.
    // `eat` has to be zero too: once material has been removed the fast path
    // can no longer reproduce the result, and the object would pop back.
    const bypass = fire <= 0.0004 && eat <= 0.0004;
    f1('uBypass', bypass ? 1 : 0);

    const innerCut =
      40 +
      (p.distortion > 0.02 ? p.turbulenceReach * 5 : 0) +
      (eat + convert > 0.002 ? p.melt * 4 + 30 : 12) +
      (p.scorch * p.intensity > 0.002 ? (6 + 1.6 * p.melt) * 2.4 : 0) +
      (p.ember * p.intensity > 0.002 ? 45 : 0);
    f1('uInnerCut', innerCut);
    const outer = Math.max(p.height, 24) * 1.25 + p.spread * 5 + 24;
    f1('uOuterCut', outer);
    f1('uCullD', Math.min(outer, SDF_RANGE * 0.9));

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, region.w, region.h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const bl = bloomRef.current;
    if (bl && bloom > 0) {
      const bc = bl.getContext('2d');
      if (bc) {
        bc.clearRect(0, 0, bl.width, bl.height);
        bc.drawImage(out, 0, 0, bl.width, bl.height);
      }
    }
  });

  return (
    <>
      <canvas
        ref={fbRef}
        width={region.w}
        height={region.h}
        style={{
          position: 'absolute',
          left: region.x,
          top: region.y,
          width: region.w,
          height: region.h,
          display: 'none',
          ...style,
        }}
      />
      <canvas
        ref={outRef}
        width={region.w}
        height={region.h}
        style={{
          position: 'absolute',
          left: region.x,
          top: region.y,
          width: region.w,
          height: region.h,
          ...style,
        }}
      />
      {bloom > 0 ? (
        <canvas
          ref={bloomRef}
          width={Math.max(1, Math.round(region.w / 4))}
          height={Math.max(1, Math.round(region.h / 4))}
          style={{
            position: 'absolute',
            left: region.x,
            top: region.y,
            width: region.w,
            height: region.h,
            filter: 'blur(20px)',
            mixBlendMode: 'screen',
            opacity: bloom,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </>
  );
};


/* ------------------------------------------------------------------- stage */

const VW = 1920;
const VH = 1080;

/** durationInFrames — copy this into your <Composition/> */
export const MOTION_FRAMES = 900; // 15 s @ 60 fps

/* --- the board, in texture space ------------------------------------------ */
const DW = 1700;
const DH = 860;
const DX = 60; // SDF headroom
const DY = 60;
const BOX_W = DW + 2 * DX;
const BOX_H = DH + 2 * DY;

const CX = 960;
const CY = 548;
const RECT = {cx: CX, cy: CY, w: BOX_W, h: BOX_H};
const RGN = {x: CX - BOX_W / 2, y: CY - BOX_H / 2, w: BOX_W, h: BOX_H};

/* --- the growth front ------------------------------------------------------
   See the file header: A/B are swapped so the front reads left-to-right, which
   means level climbs and `convert` is latched from frame 0 and released at the
   end rather than the other way round. */
const LEVEL_START = 0.02;
const LEVEL_END = 1.03;

const F_IGNITE = 188;
const F_GO = 198;
const F_END = 700;
const F_CLEAR = 704;
/** the front is spent; the fire stops travelling and wraps every panel instead,
 *  and keeps burning to the last frame */
const F_SWITCH = 728;
const F_STAMP = 792;

const MOD_START = [0, 12, 30, 48, 64, 78, 92];
const MOD_N = MOD_START.length;
const buildAt = (f: number, i: number) => ss(MOD_START[i], MOD_START[i] + 30, f);
const BUILT_AT = MOD_START[MOD_N - 1] + 34;

const levelAt = (f: number) =>
  lerp(LEVEL_START, LEVEL_END, trapezoid((f - F_GO) / (F_END - F_GO), 0.09, 0.13));
const frontXAt = (lv: number) => CX + BOX_W * (lv - 0.5);

const SURGE: FlameParams = {
  ...FIRE_PRESET,
  color: [0.2, 0.72, 1.0], // #33B8FF
  intensity: 0.95,
  height: 118,
  spread: 16,
  speed: 0.95,
  scale: 0.82,
  turbulence: 0.66,
  turbulenceScale: 0.58,
  turbulenceReach: 12,
  sparks: 1.4,
  sparkSize: 0.7,
  sparkDensity: 1.3,
  sparkSpeed: 1.2,
  rim: 2.1,
  melt: 4,
  distortion: 8,
  smoke: 0,
  ember: 1.8,
  scorch: 0,
};

const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const t = clamp01(x);
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/* ---------------------------------------------------------- canvas helpers */

const rr = (
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const k = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + k, y);
  c.lineTo(x + w - k, y);
  c.quadraticCurveTo(x + w, y, x + w, y + k);
  c.lineTo(x + w, y + h - k);
  c.quadraticCurveTo(x + w, y + h, x + w - k, y + h);
  c.lineTo(x + k, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - k);
  c.lineTo(x, y + k);
  c.quadraticCurveTo(x, y, x + k, y);
  c.closePath();
};

const bar = (
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string | CanvasGradient,
  r = 3,
) => {
  rr(c, x, y, w, h, r);
  c.fillStyle = col;
  c.fill();
};

const setFont = (c: CanvasRenderingContext2D, weight: number, size: number) => {
  c.font = `${weight} ${size}px MxSans, system-ui, sans-serif`;
};

const tt = (
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  ls: number,
  align: 'left' | 'right' | 'center',
) => {
  const g = text.split('');
  let w = -ls;
  for (let i = 0; i < g.length; i++) w += c.measureText(g[i]).width + ls;
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  for (let i = 0; i < g.length; i++) {
    c.fillText(g[i], cx, y);
    cx += c.measureText(g[i]).width + ls;
  }
};

const num = (v: number, dec: number) => {
  const neg = v < 0;
  const a = Math.abs(v).toFixed(dec);
  const dot = a.indexOf('.');
  const whole = dot < 0 ? a : a.slice(0, dot);
  const rest = dot < 0 ? '' : a.slice(dot);
  let outw = '';
  for (let i = 0; i < whole.length; i++) {
    if (i > 0 && (whole.length - i) % 3 === 0) outw += ',';
    outw += whole[i];
  }
  return (neg ? '-' : '') + outw + rest;
};

/* ------------------------------------------------------------- the layout */

const HEAD_H = 80;
const KPI_Y = 96;
const KPI_H = 118;
const KPI_GAP = 18;
const KPI_W = (DW - 3 * KPI_GAP) / 4;

const MAIN_Y = 236;
const MAIN_H = 356;
const REV_W = 1110;
const MIX_X = 1134;
const MIX_W = DW - MIX_X;

const BOT_Y = 614;
const BOT_H = 246;
const REG_W = 520;
const TOP_X = 544;
const TOP_W = 596;
const GRW_X = 1164;
const GRW_W = DW - GRW_X;

type Skin = {
  card: [string, string];
  edge: string;
  ink: string;
  dim: string;
  accent: string;
  accent2: string;
  good: string;
  grid: string;
  segs: [string, string, string, string];
  glowCard: string;
};

/** BASELINE — a competent board on a plateau. Steel and slate, deltas in a
 *  neutral blue-grey rather than green: nothing here is bad news, it is simply
 *  not growing, and that reads better than a red board would. */
const BASE: Skin = {
  card: ['#0D1520', '#080D16'],
  edge: 'rgba(112,142,178,0.16)',
  ink: '#B7C6D9',
  dim: '#61748C',
  accent: '#5E82AC',
  accent2: '#3B5877',
  good: '#7C99B6',
  grid: 'rgba(112,142,178,0.09)',
  segs: ['#8AA6C6', '#5E7FA6', '#42597A', '#2E3F58'],
  glowCard: 'rgba(94,130,172,0.30)',
};

/** ACCELERATED — the same board after the front, in full neon. */
const HOT: Skin = {
  card: ['#0E1C30', '#08111E'],
  edge: 'rgba(56,200,238,0.32)',
  ink: '#FFFFFF',
  dim: '#8AA4C4',
  accent: '#22D3EE',
  accent2: '#2563EB',
  good: '#35D18E',
  grid: 'rgba(56,200,238,0.12)',
  segs: ['#3BE8C0', '#2563EB', '#22C9F0', '#A78BFA'],
  glowCard: 'rgba(34,211,238,0.55)',
};

/* --------------------------------------------------------------- live data
   Everything below is a pure function of the frame, and every series is
   MONOTONE NON-DECREASING. On a growth board a figure that ticks back down is
   the one thing a viewer notices — it reads as a glitch rather than as
   liveness — so the movement is a ratchet of positive increments instead of a
   wobble around a mean.

   The data clock also STOPS at F_FREEZE. Once the programme has landed the
   closing seconds hold the peak rather than drifting off it: the clip ends on
   its best frame, which is the frame a buyer scrubs to. Nothing here loops. */

const F_FREEZE = 792;
const dclock = (f: number) => Math.min(f, F_FREEZE);

/** deterministic hash — no Math.random, the render has to be reproducible */
const hash = (a: number, b: number) => {
  let s = ((a * 73856093) ^ (b * 19349663) ^ 0x9e3779b9) >>> 0;
  s = (s ^ (s >>> 15)) * 2246822507;
  s = (s ^ (s >>> 13)) * 3266489909;
  return ((s ^ (s >>> 16)) >>> 0) / 4294967295;
};

/** a counter that can only go UP: every third frame it adds a small positive
 *  increment drawn from the hash, so the digits STEP like a feed instead of
 *  smearing — and never retrace. Returns the accumulated fraction. */
const ratchet = (f: number, k: number, perStep: number) => {
  const n = Math.max(0, Math.floor(dclock(f) / 3));
  let acc = 0;
  for (let i = 0; i < n; i++) acc += hash(i, k) * perStep;
  return acc;
};

/* --- KPI row -------------------------------------------------------------- */
const KPI_LABEL = ['TOTAL REVENUE', 'NET PROFIT', 'NEW ORDERS', 'CUSTOMERS'];
const KPI_BASE_C = [8420000, 968000, 24180, 14260];
const KPI_BASE_H = [15905592, 1964111, 52345, 28553];
const KPI_PRE = ['$', '$', '', ''];
const KPI_DLT_C = [1.2, 0.8, 1.9, 1.1];
const KPI_DLT_H = [7.2, 6.8, 4.1, 5.5];

/** the count-up on entry, then a slow one-way climb for the rest of the clip */
const kpiAt = (f: number, hot: boolean, i: number) => {
  const base = hot ? KPI_BASE_H[i] : KPI_BASE_C[i];
  const grow = easeOutCubic((f - (MOD_START[1] + i * 9)) / 96);
  return base * grow * (1 + ratchet(f, i, hot ? 0.000075 : 0.00005));
};

/* --- revenue over time ----------------------------------------------------- */
const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
/** millions */
/* rising with UNEVEN steps rather than a smooth ramp: the variation is what
   keeps it organic, and no step is allowed to be negative */
const REV_C = [0.52, 0.548, 0.562, 0.585, 0.596, 0.618, 0.629, 0.648, 0.657, 0.679, 0.694, 0.72];
const REV_H = [0.55, 0.62, 0.71, 0.78, 0.88, 1.0, 1.09, 1.22, 1.38, 1.52, 1.7, 1.88];
const revAt = (f: number, hot: boolean, i: number) =>
  (hot ? REV_H[i] : REV_C[i]) * (1 + ratchet(f, i + 20, 0.00006));

/** The cursor scans the year ONCE, left to right — a long hold on each month,
 *  then a short glide — and parks on DEC for the rest of the clip. It used to
 *  walk back and forth, which looked lively and was wrong: stepping LEFT down a
 *  rising curve makes the figure inside the pill fall, and that pill is the
 *  largest live number on the board. */
const TIP_START = 132;
const TIP_STEP = 51;
const tipAt = (f: number) => {
  const g = (dclock(f) - TIP_START) / TIP_STEP;
  if (g <= 0) return 0;
  const k = Math.floor(g);
  return Math.min(11, k + ss(0.62, 1.0, g - k));
};

/* --- product mix ----------------------------------------------------------
   Held steady in each world. A revenue mix does not jitter second to second,
   and four percentages that must keep summing to 100 cannot all ratchet up —
   one would have to fall, which is the very thing this board must not show. */
const PRODUCT = ['PRODUCT A', 'PRODUCT B', 'PRODUCT C', 'PRODUCT D'];
const MIX_C = [31, 27, 24, 18];
const MIX_H = [30, 25, 25, 20];
const mixAt = (hot: boolean) => (hot ? MIX_H : MIX_C);

/* --- sales by region ------------------------------------------------------- */
const REGION = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL'];
const REG_C = [3.1, 4.2, 2.6, 1.9, 3.0];
const REG_H = [4.4, 6.0, 3.5, 2.4, 4.1];
const regAt = (f: number, hot: boolean, i: number) =>
  (hot ? REG_H[i] : REG_C[i]) * (1 + ratchet(f, i + 3, 0.00022));

/* --- top products ---------------------------------------------------------- */
const TOP_C = [2.41, 0.98, 1.15, 0.86];
const TOP_H = [4.38, 1.26, 1.51, 1.25];
const topAt = (f: number, hot: boolean, i: number) =>
  (hot ? TOP_H[i] : TOP_C[i]) * (1 + ratchet(f, i + 11, 0.00016));

/* --- customer growth ------------------------------------------------------
   The curve is a FIXED monotone shape and the clip draws more of it as time
   passes, the head dot climbing towards the top right. A scrolling window was
   the obvious choice and it was wrong: however the increments are shaped,
   scrolling moves interior points down between frames, and on a growth board
   any downward motion reads as a fault rather than as data. */
const SPARK_N = 58;
const sparkShape = (hot: boolean) => {
  const raw: number[] = [];
  let v = 0;
  for (let i = 0; i < SPARK_N; i++) {
    v += (hot ? 0.3 : 0.6) + hash(i, hot ? 5 : 9) * (hot ? 1.5 : 0.7);
    raw.push(v);
  }
  const lo = raw[0];
  const hi = raw[SPARK_N - 1];
  const span = hot ? 0.84 : 0.42;
  const foot = hot ? 0.07 : 0.28;
  return raw.map((x) => ((x - lo) / (hi - lo)) * span + foot);
};
const SPARK_HOT = sparkShape(true);
const SPARK_COOL = sparkShape(false);
/** how much of the curve is drawn: most of the entrance during the build, then
 *  a slow crawl that reaches the end exactly at the freeze */
const sparkExt = (f: number) =>
  clamp01(
    0.42 * ss(MOD_START[6], MOD_START[6] + 34, f) +
      0.58 * clamp01((dclock(f) - 128) / (F_FREEZE - 128)),
  );

const GROW_C = 14260;
const GROW_H = 28553;
const growAt = (f: number, hot: boolean) => {
  const base = hot ? GROW_H : GROW_C;
  const grow = easeOutCubic((f - (MOD_START[6] + 4)) / 110);
  return Math.round(base * grow * (1 + ratchet(f, 7, 0.00008)));
};

/* --------------------------------------------------------------- modules */

const card = (
  c: CanvasRenderingContext2D,
  s: Skin,
  x: number,
  y: number,
  w: number,
  h: number,
  glow = false,
) => {
  rr(c, x, y, w, h, 16);
  const g = c.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, s.card[0]);
  g.addColorStop(1, s.card[1]);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = glow ? s.glowCard : s.edge;
  c.lineWidth = glow ? 2.4 : 2;
  c.stroke();
};

const panelTitle = (
  c: CanvasRenderingContext2D,
  s: Skin,
  x: number,
  y: number,
  t: string,
  sub?: string,
) => {
  c.fillStyle = s.ink;
  setFont(c, 700, 19);
  tt(c, t, x + 26, y + 38, 1.8, 'left');
  if (sub) {
    c.fillStyle = s.dim;
    setFont(c, 400, 12);
    tt(c, sub, x + 26, y + 58, 2.4, 'left');
  }
};

/** ▲ x.x% — the delta chip that sits under every headline figure */
const delta = (
  c: CanvasRenderingContext2D,
  s: Skin,
  v: number,
  x: number,
  y: number,
  size: number,
) => {
  c.fillStyle = s.good;
  setFont(c, 700, size);
  tt(c, '▲ ' + v.toFixed(1) + '%', x, y, 0.6, 'left');
};

const drawHeader = (c: CanvasRenderingContext2D, s: Skin, hot: boolean, f: number) => {
  c.fillStyle = s.ink;
  setFont(c, 700, 34);
  tt(c, 'BUSINESS OVERVIEW', 0, 36, 1.6, 'left');
  c.fillStyle = s.dim;
  setFont(c, 400, 14);
  tt(
    c,
    hot ? 'FY2026 · GROWTH PROGRAMME ACTIVE' : 'FY2026 · BASELINE PERFORMANCE',
    0,
    62,
    2.6,
    'left',
  );

  rr(c, DW - 268, 8, 152, 40, 20);
  c.fillStyle = hot ? 'rgba(53,209,142,0.16)' : 'rgba(112,142,178,0.12)';
  c.fill();
  c.strokeStyle = hot ? 'rgba(53,209,142,0.5)' : s.edge;
  c.lineWidth = 1.6;
  c.stroke();
  c.beginPath();
  c.arc(DW - 244, 28, 5.5, 0, Math.PI * 2);
  c.fillStyle = hot ? s.good : s.dim;
  c.fill();
  c.fillStyle = hot ? s.good : s.dim;
  setFont(c, 700, 13);
  tt(c, hot ? 'ACCELERATED' : 'LIVE', DW - 228, 33, 2.2, 'left');

  rr(c, DW - 100, 8, 100, 40, 20);
  c.fillStyle = 'rgba(120,150,190,0.08)';
  c.fill();
  c.strokeStyle = s.edge;
  c.stroke();
  c.fillStyle = s.dim;
  setFont(c, 700, 13);
  tt(c, hot ? 'Q4 · YTD' : 'Q3 · YTD', DW - 50, 33, 1.6, 'center');
};

const drawKpi = (c: CanvasRenderingContext2D, s: Skin, hot: boolean, f: number) => {
  for (let i = 0; i < 4; i++) {
    const x = i * (KPI_W + KPI_GAP);
    card(c, s, x, KPI_Y, KPI_W, KPI_H, hot && i === 0);

    c.fillStyle = s.dim;
    setFont(c, 700, 12);
    tt(c, KPI_LABEL[i], x + 26, KPI_Y + 30, 2.6, 'left');

    const v = kpiAt(f, hot, i);
    c.fillStyle = s.ink;
    setFont(c, 700, 38);
    tt(c, KPI_PRE[i] + num(v, 0), x + 26, KPI_Y + 74, 0.4, 'left');

    /* the period delta is a reported figure, not a live reading — jittering
       it to one decimal makes the card look unstable for no gain */
    delta(c, s, hot ? KPI_DLT_H[i] : KPI_DLT_C[i], x + 26, KPI_Y + 100, 14);
  }
};

const drawRevenue = (
  c: CanvasRenderingContext2D,
  s: Skin,
  hot: boolean,
  f: number,
  reveal: number,
) => {
  card(c, s, 0, MAIN_Y, REV_W, MAIN_H);
  panelTitle(c, s, 0, MAIN_Y, 'REVENUE OVER TIME', hot ? 'RUN RATE · REFORECAST' : 'RUN RATE · PLAN');

  const gx = 96;
  const gy = MAIN_Y + 94;
  const gw = REV_W - gx - 44;
  const gh = 196;
  const top = hot ? 2.0 : 1.0;

  c.strokeStyle = s.grid;
  c.lineWidth = 1.4;
  c.fillStyle = s.dim;
  setFont(c, 400, 11);
  for (let g = 0; g <= 4; g++) {
    const yy = gy + (gh * g) / 4;
    c.beginPath();
    c.moveTo(gx, yy);
    c.lineTo(gx + gw, yy);
    c.stroke();
    const val = top - (top * g) / 4;
    tt(c, '$' + (val === 0 ? '0' : val.toFixed(val < 1 ? 2 : 1) + 'M'), gx - 12, yy + 4, 0.4, 'right');
  }

  const X = (i: number) => gx + (gw * i) / 11;
  const Y = (v: number) => gy + gh - clamp01(v / top) * gh;

  setFont(c, 400, 11);
  c.fillStyle = s.dim;
  for (let i = 0; i < 12; i++) tt(c, MONTH[i], X(i), gy + gh + 24, 0.8, 'center');

  const pts = REV_C.map((_, i) => ({x: X(i), y: Y(revAt(f, hot, i))}));

  /* reveal is a left-to-right wipe of the plotted area — the same clip serves
     the fill, the stroke and the vertex dots so they cannot drift apart */
  const cut = gx + gw * clamp01(reveal) + 2;
  c.save();
  c.beginPath();
  c.rect(gx - 4, gy - 30, cut - gx + 4, gh + 40);
  c.clip();

  c.beginPath();
  c.moveTo(pts[0].x, gy + gh);
  for (let i = 0; i < 12; i++) c.lineTo(pts[i].x, pts[i].y);
  c.lineTo(pts[11].x, gy + gh);
  c.closePath();
  const fg = c.createLinearGradient(0, gy, 0, gy + gh);
  fg.addColorStop(0, hot ? 'rgba(59,232,192,0.30)' : 'rgba(94,130,172,0.20)');
  fg.addColorStop(1, hot ? 'rgba(37,99,235,0.02)' : 'rgba(59,88,119,0.01)');
  c.fillStyle = fg;
  c.fill();

  c.beginPath();
  for (let i = 0; i < 12; i++) (i === 0 ? c.moveTo : c.lineTo).call(c, pts[i].x, pts[i].y);
  const lg = c.createLinearGradient(gx, 0, gx + gw, 0);
  lg.addColorStop(0, hot ? '#22C9F0' : '#5E82AC');
  lg.addColorStop(1, hot ? '#3BE8C0' : '#6E8CAE');
  c.strokeStyle = lg;
  c.lineWidth = 3.2;
  c.lineJoin = 'round';
  c.stroke();

  for (let i = 0; i < 12; i++) {
    c.beginPath();
    c.arc(pts[i].x, pts[i].y, 4.4, 0, Math.PI * 2);
    c.fillStyle = hot ? '#EAFDFF' : '#93A9C2';
    c.fill();
  }
  c.restore();

  /* the tooltip only exists once the curve under it does */
  if (reveal > 0.99) {
    const pos = tipAt(f);
    const i0 = Math.min(10, Math.floor(pos));
    const u = pos - i0;
    const tx = lerp(X(i0), X(i0 + 1), u);
    const tv = lerp(revAt(f, hot, i0), revAt(f, hot, i0 + 1), u);
    const ty = Y(tv);

    c.strokeStyle = hot ? 'rgba(167,139,250,0.5)' : 'rgba(120,150,190,0.28)';
    c.lineWidth = 1.4;
    c.save();
    c.setLineDash([4, 5]);
    c.beginPath();
    c.moveTo(tx, ty);
    c.lineTo(tx, gy + gh);
    c.stroke();
    c.restore();

    c.beginPath();
    c.arc(tx, ty, 6.6, 0, Math.PI * 2);
    c.fillStyle = hot ? '#A78BFA' : '#7C93AE';
    c.fill();

    const label = '$' + num(tv * 1000000, 0);
    setFont(c, 700, 15);
    const tw = c.measureText(label).width + 34;
    bar(c, tx - tw / 2, ty - 50, tw, 30, hot ? '#7C5CF0' : '#3E5878', 8);
    c.beginPath();
    c.moveTo(tx - 6, ty - 20);
    c.lineTo(tx + 6, ty - 20);
    c.lineTo(tx, ty - 12);
    c.closePath();
    c.fillStyle = hot ? '#7C5CF0' : '#3E5878';
    c.fill();
    c.fillStyle = hot ? '#FFFFFF' : '#C6D5E6';
    tt(c, label, tx, ty - 30, 0.4, 'center');
  }
};

const drawMix = (
  c: CanvasRenderingContext2D,
  s: Skin,
  hot: boolean,
  f: number,
  reveal: number,
) => {
  card(c, s, MIX_X, MAIN_Y, MIX_W, MAIN_H);
  panelTitle(c, s, MIX_X, MAIN_Y, 'REVENUE BY PRODUCT', hot ? 'MIX · REBALANCED' : 'MIX · CURRENT');

  const cx = MIX_X + 158;
  const cy = MAIN_Y + 196;
  const rO = 92;
  const rI = 56;
  const pct = mixAt(hot);

  c.lineWidth = rO - rI;
  let a0 = -Math.PI / 2;
  const sweep = clamp01(reveal) * Math.PI * 2;
  for (let i = 0; i < 4; i++) {
    const span = (pct[i] / 100) * Math.PI * 2;
    const drawn = Math.min(span, Math.max(0, sweep - (a0 + Math.PI / 2)));
    if (drawn > 0.002) {
      c.beginPath();
      c.arc(cx, cy, (rO + rI) / 2, a0 + 0.012, a0 + drawn - 0.012);
      c.strokeStyle = s.segs[i];
      c.stroke();
    }
    a0 += span;
  }

  for (let i = 0; i < 4; i++) {
    const a = ss(i * 0.25, i * 0.25 + 0.25, clamp01(reveal));
    if (a <= 0.01) continue;
    c.globalAlpha = a;
    const ly = MAIN_Y + 132 + i * 44;
    bar(c, MIX_X + 296, ly - 9, 11, 11, s.segs[i], 3);
    c.fillStyle = s.ink;
    setFont(c, 700, 15);
    tt(c, PRODUCT[i], MIX_X + 320, ly, 1.4, 'left');
    c.fillStyle = s.dim;
    setFont(c, 700, 15);
    tt(c, pct[i].toFixed(0) + '%', MIX_X + MIX_W - 26, ly, 0.4, 'right');
    c.globalAlpha = 1;
  }
};

const drawRegion = (
  c: CanvasRenderingContext2D,
  s: Skin,
  hot: boolean,
  f: number,
  reveal: number,
) => {
  card(c, s, 0, BOT_Y, REG_W, BOT_H);
  panelTitle(c, s, 0, BOT_Y, 'SALES BY REGION');

  const gx = 78;
  const gy = BOT_Y + 78;
  const gw = REG_W - gx - 32;
  const gh = 116;
  const top = hot ? 6 : 5;

  c.strokeStyle = s.grid;
  c.lineWidth = 1.3;
  c.fillStyle = s.dim;
  setFont(c, 400, 10);
  for (let g = 0; g <= 3; g++) {
    const yy = gy + (gh * g) / 3;
    c.beginPath();
    c.moveTo(gx, yy);
    c.lineTo(gx + gw, yy);
    c.stroke();
    const v = top - (top * g) / 3;
    tt(c, '$' + v.toFixed(0) + 'M', gx - 10, yy + 4, 0.4, 'right');
  }

  const step = gw / 5;
  const bw = step * 0.46;
  for (let i = 0; i < 5; i++) {
    const a = ss(i * 0.16, i * 0.16 + 0.34, clamp01(reveal));
    const v = regAt(f, hot, i) * a;
    const bh = Math.max(1, (clamp01(v / top) * gh));
    const x = gx + step * i + (step - bw) / 2;
    const g = c.createLinearGradient(0, gy + gh - bh, 0, gy + gh);
    g.addColorStop(0, hot ? '#3BE0F5' : '#6E93BB');
    g.addColorStop(1, hot ? '#2563EB' : '#37516D');
    bar(c, x, gy + gh - bh, bw, bh, g, 5);
    c.fillStyle = s.dim;
    setFont(c, 700, 10);
    tt(c, REGION[i], x + bw / 2, gy + gh + 22, 1.2, 'center');
  }
};

const drawTop = (c: CanvasRenderingContext2D, s: Skin, hot: boolean, f: number, reveal: number) => {
  card(c, s, TOP_X, BOT_Y, TOP_W, BOT_H);
  panelTitle(c, s, TOP_X, BOT_Y, 'TOP PRODUCTS');

  const tx = TOP_X + 26;
  const bx = TOP_X + 150;
  const bw = 268;
  const maxv = hot ? 4.6 : 2.6;

  for (let i = 0; i < 4; i++) {
    const ry = BOT_Y + 92 + i * 40;
    const a = ss(i * 0.18, i * 0.18 + 0.36, clamp01(reveal));
    c.fillStyle = s.ink;
    setFont(c, 700, 14);
    tt(c, PRODUCT[i], tx, ry + 5, 1.4, 'left');

    bar(c, bx, ry - 6, bw, 15, hot ? 'rgba(90,130,180,0.16)' : 'rgba(96,126,160,0.12)', 8);
    const v = topAt(f, hot, i);
    const fw = Math.max(2, bw * clamp01(v / maxv) * a);
    const g = c.createLinearGradient(bx, 0, bx + fw, 0);
    g.addColorStop(0, hot ? '#22C9F0' : '#5A7EA8');
    g.addColorStop(1, hot ? '#2563EB' : '#3C5A7B');
    bar(c, bx, ry - 6, fw, 15, g, 8);

    c.fillStyle = s.dim;
    setFont(c, 700, 13);
    c.globalAlpha = a;
    tt(c, '$' + num(v * 1000000, 0), TOP_X + TOP_W - 26, ry + 5, 0.4, 'right');
    c.globalAlpha = 1;
  }
};

const drawGrowth = (
  c: CanvasRenderingContext2D,
  s: Skin,
  hot: boolean,
  f: number,
  reveal: number,
) => {
  card(c, s, GRW_X, BOT_Y, GRW_W, BOT_H);
  panelTitle(c, s, GRW_X, BOT_Y, 'CUSTOMER GROWTH');

  c.fillStyle = s.ink;
  setFont(c, 700, 46);
  tt(c, num(growAt(f, hot), 0), GRW_X + 26, BOT_Y + 104, 0.4, 'left');
  c.fillStyle = s.good;
  setFont(c, 700, 13);
  tt(
    c,
    '▲ ' + (hot ? 5.5 : 1.2).toFixed(1) + '% IN LAST MONTH',
    GRW_X + 26,
    BOT_Y + 128,
    1.6,
    'left',
  );

  const gx = GRW_X + 26;
  const gy = BOT_Y + 150;
  const gw = GRW_W - 52;
  const gh = 68;
  const data = hot ? SPARK_HOT : SPARK_COOL;
  const ext = sparkExt(f) * clamp01(reveal);

  /* the head walks a fixed curve, so every point it has already drawn stays
     exactly where it was — the line grows and never re-shapes under itself */
  const at = ext * (SPARK_N - 1);
  const last = Math.floor(at);
  const frac = at - last;
  const px = (i: number) => gx + (gw * i) / (SPARK_N - 1);
  const py = (v: number) => gy + gh - v * gh;
  const hx = lerp(px(last), px(Math.min(SPARK_N - 1, last + 1)), frac);
  const hy = py(lerp(data[last], data[Math.min(SPARK_N - 1, last + 1)], frac));

  c.beginPath();
  c.moveTo(px(0), py(data[0]));
  for (let i = 1; i <= last; i++) c.lineTo(px(i), py(data[i]));
  c.lineTo(hx, hy);
  c.strokeStyle = hot ? '#3BE8C0' : '#6B8CAE';
  c.lineWidth = 2.6;
  c.lineJoin = 'round';
  c.stroke();

  c.lineTo(hx, gy + gh);
  c.lineTo(px(0), gy + gh);
  c.closePath();
  const fg = c.createLinearGradient(0, gy, 0, gy + gh);
  fg.addColorStop(0, hot ? 'rgba(59,232,192,0.24)' : 'rgba(107,140,174,0.14)');
  fg.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = fg;
  c.fill();

  if (ext > 0.02) {
    c.beginPath();
    c.arc(hx, hy, 5, 0, Math.PI * 2);
    c.fillStyle = hot ? '#EAFFF9' : '#9DB3C9';
    c.fill();
  }
};

/* --------------------------------------------------------------- assembly */

const paint = (
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: Skin,
  hot: boolean,
  build: number[],
  f: number,
) => {
  c.clearRect(0, 0, w, h);
  c.save();
  c.translate(DX, DY);
  c.textBaseline = 'alphabetic';

  /** each module fades and lifts in, and hands its own progress to whatever it
   *  draws so the curve, the ring and the bars grow rather than pop */
  const mod = (i: number, fn: (reveal: number) => void) => {
    const a = build[i];
    if (a <= 0.001) return;
    c.save();
    c.globalAlpha = a;
    c.translate(0, (1 - easeOutCubic(a)) * 22);
    fn(a);
    c.restore();
  };

  mod(0, () => drawHeader(c, s, hot, f));
  mod(1, () => drawKpi(c, s, hot, f));
  mod(2, (r) => drawRevenue(c, s, hot, f, r));
  mod(3, (r) => drawMix(c, s, hot, f, r));
  mod(4, (r) => drawRegion(c, s, hot, f, r));
  mod(5, (r) => drawTop(c, s, hot, f, r));
  mod(6, (r) => drawGrowth(c, s, hot, f, r));

  c.restore();
};

const FULL = [1, 1, 1, 1, 1, 1, 1];

/** panels only — type and hairlines sit at d0 = 0, so a silhouette that
 *  includes them sets every figure alight the moment the fire wraps instead of
 *  travels. Panels never move, so the SDF stays valid while the numbers churn. */
const drawSdf = (c: CanvasRenderingContext2D, w: number, h: number) => {
  c.clearRect(0, 0, w, h);
  c.save();
  c.translate(DX, DY);
  c.fillStyle = '#101010';
  const panel = (x: number, y: number, pw: number, ph: number) => {
    rr(c, x, y, pw, ph, 16);
    c.fill();
  };
  for (let i = 0; i < 4; i++) panel(i * (KPI_W + KPI_GAP), KPI_Y, KPI_W, KPI_H);
  panel(0, MAIN_Y, REV_W, MAIN_H);
  panel(MIX_X, MAIN_Y, MIX_W, MAIN_H);
  panel(0, BOT_Y, REG_W, BOT_H);
  panel(TOP_X, BOT_Y, TOP_W, BOT_H);
  panel(GRW_X, BOT_Y, GRW_W, BOT_H);
  c.restore();
};

/* ------------------------------------------------------------------- scene */

export const Motion: React.FC = () => {
  const f = useCurrentFrame();
  const fontsReady = useEmbeddedFonts();

  const build = MOD_START.map((_, i) => buildAt(f, i));
  const built = f >= BUILT_AT;

  /* level climbs, and is snapped back off the left edge for the closing wrap —
     see note 3 in the file header */
  const level = f < F_SWITCH ? levelAt(f) : LEVEL_START;
  const progress = clamp01((levelAt(f) - LEVEL_START) / (LEVEL_END - LEVEL_START));

  const flare = 1 + 0.3 * (1 - ss(F_IGNITE, F_IGNITE + 50, f));
  const sweepFire = ss(F_IGNITE, F_IGNITE + 16, f) * (1 - ss(F_SWITCH - 26, F_SWITCH - 2, f));
  const blaze =
    ss(F_SWITCH + 2, F_SWITCH + 46, f) *
    (0.78 + 0.13 * Math.sin(f / 12) + 0.06 * Math.sin(f / 6.7));
  const fire = f < F_SWITCH ? sweepFire * flare : blaze;
  /* latched from frame 0, released once the front is off the right edge */
  const convert = f < F_CLEAR ? 1 : 0;

  const fx = frontXAt(level);
  const beamOn = ss(F_IGNITE, F_IGNITE + 24, f) * (1 - ss(F_END - 40, F_END + 10, f));

  const st = clamp01((f - F_STAMP) / 26);
  const bScale = 2.3 - 1.3 * easeOutBack(st);
  const bA = ss(F_STAMP, F_STAMP + 8, f);
  const flash = (1 - ss(F_STAMP + 2, F_STAMP + 26, f)) * ss(F_STAMP, F_STAMP + 3, f);
  const pulse = 0.5 + 0.5 * Math.sin(f / 8);

  const accent = `rgb(${Math.round(lerp(94, 34, progress))},${Math.round(
    lerp(130, 211, progress),
  )},${Math.round(lerp(172, 238, progress))})`;

  return (
    <AbsoluteFill
      style={{
        background: '#04070C',
        fontFamily: "'MxSans', system-ui, sans-serif",
        color: '#DEE9F6',
        opacity: fontsReady ? 1 : 0,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(1300px 900px at 26% 34%, rgba(46,74,104,0.30), rgba(0,0,0,0) 70%)',
          opacity: 1 - 0.7 * progress,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(1500px 1000px at 46% 52%, rgba(18,120,168,0.34), rgba(0,0,0,0) 68%)',
          opacity: 0.05 + 0.95 * progress,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(900px 700px at 82% 76%, rgba(104,68,214,0.26), rgba(0,0,0,0) 70%)',
          opacity: 0.02 + 0.98 * progress,
        }}
      />
      <svg width={VW} height={VH} style={{position: 'absolute', opacity: 0.75}}>
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8FA8D8" stopOpacity="0.10" />
            <stop offset="0.5" stopColor="#8FA8D8" stopOpacity="0.03" />
            <stop offset="1" stopColor="#8FA8D8" stopOpacity="0.10" />
          </linearGradient>
        </defs>
        <g stroke="url(#fade)" strokeWidth="1">
          {Array.from({length: 25}, (_, i) => (
            <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={VH} />
          ))}
          {Array.from({length: 14}, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 80} x2={VW} y2={i * 80} />
          ))}
        </g>
      </svg>

      {beamOn > 0.002 ? (
        <div
          style={{
            position: 'absolute',
            left: fx - 190,
            top: 0,
            width: 380,
            height: VH,
            background:
              'linear-gradient(90deg, rgba(40,190,255,0) 0%, rgba(60,210,255,0.22) 50%, rgba(40,190,255,0) 100%)',
            opacity: beamOn,
          }}
        />
      ) : null}

      {/* ------------------------------------------------------- the board */}
      <FlameFront
        region={RGN}
        rect={RECT}
        /* A and B are SWAPPED so the front reads left-to-right: `drawContent`
           is the destination, `drawConverted` the origin. */
        drawContent={(c, w, h) => paint(c, w, h, HOT, true, FULL, f)}
        drawConverted={(c, w, h) => paint(c, w, h, BASE, false, build, f)}
        sdfDraw={drawSdf}
        /* the board is alive, so the artwork is re-rasterised — every other
           frame after the build, which reads as a refresh rate and halves the
           upload cost. The SDF comes from the static panels, so none of this
           touches the silhouette. */
        contentKey={
          built ? `t${Math.floor(f / 2)}-${fontsReady ? 1 : 0}` : `b${f}-${fontsReady ? 1 : 0}`
        }
        params={SURGE}
        frontOnly={f < F_SWITCH}
        axis="x"
        level={level}
        fire={fire}
        convert={convert}
        bloom={0.26 * clamp01(fire)}
      />

      {/* ---------------------------------------------------------- banner */}
      {st > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: CX - 452,
            top: 26,
            width: 904,
            height: 76,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            border: `4px solid rgba(60,215,255,${0.92 * bA})`,
            borderRadius: 10,
            background: 'rgba(6,32,54,0.82)',
            transform: `scale(${bScale}) rotate(-1deg)`,
            opacity: bA,
            boxShadow: '0 0 58px rgba(50,200,255,0.5)',
          }}
        >
          <div
            style={{width: 15, height: 15, borderRadius: 8, background: '#35D18E', opacity: pulse}}
          />
          <span
            style={{
              fontSize: 29,
              fontWeight: 700,
              letterSpacing: 7,
              paddingLeft: 8,
              whiteSpace: 'nowrap',
              color: `rgba(226,250,255,${0.97 * bA})`,
            }}
          >
            ANNUAL TARGET EXCEEDED · 128%
          </span>
        </div>
      ) : null}

      {flash > 0.002 ? (
        <AbsoluteFill style={{background: 'rgba(70,200,255,0.12)', opacity: flash}} />
      ) : null}

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 1006,
          width: VW,
          textAlign: 'center',
          opacity: ss(110, 180, f),
        }}
      >
        <span style={{fontSize: 17, fontWeight: 700, letterSpacing: 11, color: accent}}>
          {f < F_GO
            ? 'BASELINE LOCKED · AWAITING UPLIFT'
            : f < F_END
              ? 'GROWTH PROGRAMME APPLIED · ' + Math.round(progress * 100) + '%'
              : f < F_STAMP
                ? 'ALL SEGMENTS REFORECAST · UPSIDE CONFIRMED'
                : 'FY2026 TARGET EXCEEDED · PLAN RESET'}
        </span>
      </div>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(1600px 1000px at 50% 50%, rgba(0,0,0,0) 46%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
