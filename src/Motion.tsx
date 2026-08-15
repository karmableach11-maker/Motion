/* =============================================================================
   MOTION29 — "QUARANTINE · INFECTED FILE ISOLATION"
   An endpoint agent sweeps the desktop, trips on one folder, and a containment
   front travels down through it — converting it into a locked, hatched,
   quarantined object instead of deleting it.
   1920 x 1080 · 60 fps · 900 frames (15 s) · ONE-SHOT (not a loop)

   Shader: the Canvas UI "FlameWrap" fragment shader, re-used as a crackling
   containment edge (height dialled right down, smoke off, red-orange). Three
   extensions over the stock component:
     · uSdf       — signed distance field baked from the folder silhouette
     · uBurnEdge  — a descending front instead of a fixed top edge
     · uContentB  — the front CONVERTS content A into content B rather than
                    dissolving it away
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

/* ---------------------------------------------------------------- constants */

const VW = 1920;
const VH = 1080;

/** durationInFrames — copy this into your <Composition/> */
export const MOTION_FRAMES = 900; // 15 s @ 60 fps

// ---- desktop icon grid -----------------------------------------------------
const ICON = 184;
const CELL_W = 280;
const CELL_H = 240;
const COLS = 5;
const GRID_X = (VW - COLS * CELL_W) / 2 + CELL_W / 2; // 400
const GRID_Y = 290;
const HERO = 7; // centre cell — the infected one

const cellCX = (i: number) => GRID_X + (i % COLS) * CELL_W;
const cellCY = (i: number) => GRID_Y + Math.floor(i / COLS) * CELL_H;

const LABELS = [
  'Assets', 'Brand Kit', 'Client Work', 'Contracts', 'Design Files',
  'Exports', 'Invoices', 'Project Files', 'Photos', 'Presentations',
  'Raw Footage', 'Reports', 'Shared Drive', 'Templates', 'Vendors',
];

// content box around the hero icon + label
const BOX_W = 400;
const BOX_H = 400;
const BOX_X = 960 - BOX_W / 2; // 760
const BOX_Y = 530 - 190; // 340

const FOLD_S = ICON / 544;
const FOLD_OX = 108;
const FOLD_OY = 82;

// containment front travel, level = (edge + H/2) / H
const LEVEL_TOP = 0.75;
const LEVEL_BOT = 0.27;

// WebGL region — the edge is thin, so the margin can be tight
const RGN_X = BOX_X - 70;
const RGN_Y = BOX_Y - 70;
const RGN_W = BOX_W + 140;
const RGN_H = BOX_H + 140;

const SDF_RANGE = 220;

const EDGE_RGB: [number, number, number] = [1, 0.24, 0.12]; // #FF3D1F

const C_SCAN = '#3FD3E8';
const C_THREAT = '#FF4A33';
const C_OK = '#37D6A0';

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
  const [handle] = useState(() => delayRender('motion29-fonts'));
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

/* ------------------------------------------------------------------- helpers */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeOutBack = (x: number) => {
  const c = 1.9;
  const u = clamp01(x) - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
};

const trapezoid = (u: number, a: number, b: number) => {
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

/* ---------------------------------------------------------------- shaders */

const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;   // A — healthy
uniform sampler2D uContentB;  // B — quarantined
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
uniform float uFire;
uniform float uConvert;
uniform float uInnerCut;
uniform float uOuterCut;
uniform float uCullD;
uniform float uBypass;
uniform float uBypassMix;
uniform float uBurnEdge;
uniform float uSdfRange;

#define S(a, b, t) smoothstep(a, b, t)

vec3 permute (vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise (vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;
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
  p = m * p * 2.03 + vec2(11.3, 7.1);
  v += 0.27 * snoise(p);
  p = m * p * 1.97 + vec2(3.7, 19.1);
  v += 0.15 * snoise(p);
  p = m * p * 2.01 + vec2(8.3, 2.9);
  v += 0.08 * snoise(p);
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
  vec3 q = vec3(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3)),
    dot(p, vec2(419.2, 371.9))
  );
  return fract(sin(q) * 43758.5453);
}

/** content A cross-faded into content B by m, returned premultiplied */
vec4 sampleMix (vec2 uv, float m) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  vec2 t = vec2(uv.x, 1.0 - uv.y);
  vec4 a = texture(uContent, t);
  vec4 b = texture(uContentB, t);
  vec4 c = mix(a, b, clamp(m, 0.0, 1.0));
  return vec4(c.rgb * c.a, c.a);
}

void main () {
  vec2 frag = vUv * uResolution;
  vec2 rel = frag - uRectCenter;
  float unit = max(uHeight, 24.0);
  float spreadPx = max(uSpread, 8.0);
  float t = uTime;
  float detail = clamp(uScale, 0.05, 1.0);

  vec2 cUv = (rel + uRectHalf) / (2.0 * uRectHalf);
  vec2 cUvC = clamp(cUv, vec2(0.0), vec2(1.0));

  float d0 = (texture(uSdf, vec2(cUvC.x, 1.0 - cUvC.y)).r * 2.0 - 1.0) * uSdfRange;
  float above = rel.y - uBurnEdge;

  /* ---- fast paths ------------------------------------------------------- */
  if (uBypass > 0.5) { outColor = sampleMix(cUv, uBypassMix); return; }
  if (d0 > uCullD) { outColor = vec4(0.0); return; }
  // fully past the front: content is already converted, no edge left to draw
  if (above > uOuterCut) { outColor = sampleMix(cUv, uConvert); return; }
  if (d0 < -uInnerCut && above < -uInnerCut) {
    outColor = sampleMix(cUv, 0.0);
    return;
  }

  float px = rel.x / unit;
  float py = rel.y / unit;

  float yA = max(above, 0.0) / unit;
  float sway = snoise(vec2(px * 1.1, t * 0.5)) * 0.55
    + snoise(vec2(px * 2.4, t * 0.9 + 41.0)) * 0.25;
  float sx = px + yA * sway;
  float env = fbm2(vec2(sx * 1.6 * detail + 3.7, t * 0.55 - yA * 0.4));
  float env2 = fbm2(vec2(sx * 3.6 * detail, t * 0.85 + 17.0 - yA * 0.6));
  float tongue = clamp(
    0.75 * S(0.3, 0.9, env) + 0.5 * S(0.4, 0.95, env2),
    0.0,
    1.0
  );

  float meltPx = max(uMelt, 1.0);
  float biteTop = (3.0 + meltPx * 1.4) * (0.35 + 0.65 * tongue)
    + 2.0 * snoise(vec2(px * 5.0 * detail, t * 1.1 + 5.0));
  float yF = uBurnEdge - biteTop;
  float frontTop = rel.y - yF;

  float perim = fbm2(rel * (1.9 / unit) * detail + vec2(0.0, t * 0.4) + 31.0);
  float biteSB = 3.0 + meltPx * (0.25 + 0.75 * perim);
  float frontSB = d0 + biteSB;

  float fv = clamp((uBurnEdge + uRectHalf.y) / (2.0 * uRectHalf.y), 0.0, 1.0);
  float colA = max(
    texture(uContent, vec2(cUvC.x, 1.0 - fv)).a,
    max(
      texture(uContent, vec2(cUvC.x, clamp(1.0 - fv + 0.014, 0.0, 1.0))).a,
      texture(uContent, vec2(cUvC.x, clamp(1.0 - fv + 0.032, 0.0, 1.0))).a
    )
  );
  float colMask = S(0.10, 0.55, colA);

  float wCut = S(-0.62 * unit, -0.1 * unit, above);
  float wTop = wCut * colMask;
  float front = max(frontSB, frontTop); // shape INTERSECT below-the-front
  float frontCut = front;

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
    + (1.0 - min(g, 1.0)) * 0.3
    - g * (0.9 + 0.25 * n);
  dens = clamp(dens * 2.4, 0.0, 1.0) * win;
  dens *= mix(1.0 - S(0.32, 1.05, q), 1.0 - S(0.9, 1.2, g), wTop);
  float body = dens * dens * (3.0 - 2.0 * dens);
  float emis = clamp(uIntensity, 0.0, 2.0);
  float e = body * (0.55 + 0.75 * root) * (0.45 + 0.55 * n)
    + win * root * (0.1 + 0.4 * n);
  e *= mix(0.45, 1.0, wTop) * max(emis, 0.001);

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
  halo *= 1.0 - S(0.15 * unit, 0.6 * unit, above);
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
      float r = (0.004 + 0.014 * rnd.y * rnd.y) * unit * sSize
        * mix(1.15, 0.55, life);
      float bmask = S(0.5, 0.32, max(abs(fr.x - 0.5), abs(fr.y - 0.5)));
      float sbody = exp(-dp * dp / (r * r));
      float sbloom = exp(-dp * dp / (r * r * 6.0)) * 0.3;
      spark += (sbody + sbloom) * tw * tw * on * bmask * (1.0 - 0.35 * L);
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

  float wisp = S(0.45, 0.9, fbm2(np * 0.55 + vec2(0.0, 17.0)));
  float rise = max(above, 0.0);
  float smokeFall = exp(-rise / (unit * 0.7))
    * (1.0 - S(uOuterCut * 0.5, uOuterCut * 0.96, rise));
  float smoke = S(1.55, 1.05, g) * S(0.85, 1.15, g)
    * (1.0 - body) * wCut * colMask * smokeFall
    * wisp * 0.055 * clamp(uSmoke, 0.0, 2.0) * fade * uFire;
  vec3 smokeCol = mix(vec3(0.5), uColor, 0.5);

  float inRect = step(abs(cUv.x - 0.5), 0.5) * step(abs(cUv.y - 0.5), 0.5);

  float heatBand = exp(-abs(frontCut) / max(uTurbReach, 4.0));
  vec2 wob = vec2(snoise(np * 1.7 + 9.0), snoise(np * 1.7 + 27.0));
  vec2 disp = wob * min(uDistortion, 32.0) * heatBand;
  vec2 cUvD = clamp(cUv + disp / (2.0 * uRectHalf), vec2(0.0015), vec2(0.9985));

  /* the front CONVERTS rather than removes: mask picks content B behind it */
  float dn = fbm2(rel * (3.2 / unit) * detail + vec2(0.0, t * 0.5) + 91.0);
  float dw = mix(2.0, 5.0, wCut);
  float conv = S(-dw, dw, frontCut + (dn - 0.5) * dw * 2.5) * uConvert;
  vec4 content = sampleMix(cUvD, conv);

  float burn = clamp(uIntensity, 0.0, 1.0);
  float nearFront = 1.0 - S(0.10 * unit, 0.45 * unit, max(-above, 0.0));
  float depth = abs(frontCut); // band around the front, not inside-only
  float emberW = mix(2.5, 5.5, wCut);
  float emberN = 0.3 + 0.7 * fbm2(np * 2.2 + 73.0);
  float emberK = clamp(uEmber, 0.0, 2.0);
  float ember = exp(-depth / emberW) * emberN * emberK * nearFront;
  float whiteHot = exp(-depth / (emberW * 0.4)) * emberN * emberN * emberK * nearFront;
  float ca = content.a;
  vec3 crgb = ca > 0.001 ? content.rgb / ca : content.rgb;
  crgb = mix(crgb, uColor * 1.2, clamp(ember, 0.0, 1.0) * burn);
  crgb = mix(
    crgb,
    mix(uColor, vec3(1.0), 0.3) * 1.2,
    clamp(whiteHot, 0.0, 1.0) * burn
  );

  float cA = ca * inRect;
  float smk = smoke * (1.0 - cA);
  float baseA = min(cA + smk, 1.0);
  vec3 base = crgb * cA + smokeCol * smk;
  vec3 col = fireCol * fireA + base * (1.0 - fireA) + glow;
  float alpha = clamp(fireA + baseA * (1.0 - fireA) + halo * 0.5, 0.0, 1.0);
  outColor = vec4(col, alpha);
}`;

/* ------------------------------------------------------------- folder artwork */

const FOLDER_BACK =
  'M16 98.5602V444.948C16 459.752 28.0016 471.754 42.8063 471.754H501.194C515.998 471.754 528 459.752 528 444.948V153.227C528 138.422 515.998 126.421 501.194 126.421H260.603C250.182 126.421 240.743 120.338 235.291 111.456C225.357 95.2712 207.444 71.7539 187.225 71.7539H42.7644C27.9597 71.7539 16 83.7555 16 98.5602Z';
const FOLDER_FRONT =
  'M528 163.561V435.948C528 450.752 515.998 462.754 501.194 462.754H42.8063C28.0016 462.754 16 450.752 16 435.948V190.699C16 175.895 27.962 163.893 42.7667 163.893H178.178C223.749 163.893 217.382 136.752 248.544 136.754C333.567 136.758 449.546 136.756 501.239 136.755C516.044 136.754 528 148.756 528 163.561Z';

const setFont = (
  c: CanvasRenderingContext2D,
  weight: 400 | 700,
  size: number,
  track = 0,
) => {
  c.font = `${weight} ${size}px MxSans, system-ui, sans-serif`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (c as any).letterSpacing = `${track}px`;
};

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
  c.arcTo(x + w, y, x + w, y + k, k);
  c.lineTo(x + w, y + h - k);
  c.arcTo(x + w, y + h, x + w - k, y + h, k);
  c.lineTo(x + k, y + h);
  c.arcTo(x, y + h, x, y + h - k, k);
  c.lineTo(x, y + k);
  c.arcTo(x, y, x + k, y, k);
  c.closePath();
};

const HERO_LABEL = LABELS[HERO];

/** A — the healthy folder */
const drawContentA = (c: CanvasRenderingContext2D) => {
  c.clearRect(0, 0, BOX_W, BOX_H);
  c.textBaseline = 'alphabetic';

  c.save();
  c.translate(FOLD_OX, FOLD_OY);
  c.scale(FOLD_S, FOLD_S);
  c.fillStyle = '#FFC531';
  c.fill(new Path2D(FOLDER_BACK));
  const g = c.createLinearGradient(528, 136.754, 27.1538, 479.073);
  g.addColorStop(0.234375, '#FCF68D');
  g.addColorStop(1, '#FFC531');
  c.fillStyle = g;
  c.fill(new Path2D(FOLDER_FRONT));
  c.restore();

  setFont(c, 400, 17, 0.15);
  const lw = c.measureText(HERO_LABEL).width;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.6)';
  c.shadowBlur = 5;
  c.shadowOffsetY = 1;
  c.fillStyle = '#FFFFFF';
  c.fillText(HERO_LABEL, BOX_W / 2 - lw / 2, 272);
  c.restore();
};

/** B — the same folder after containment: dark, hatched, padlocked */
const drawContentB = (c: CanvasRenderingContext2D) => {
  c.clearRect(0, 0, BOX_W, BOX_H);
  c.textBaseline = 'alphabetic';

  c.save();
  c.translate(FOLD_OX, FOLD_OY);
  c.scale(FOLD_S, FOLD_S);

  const back = new Path2D(FOLDER_BACK);
  const front = new Path2D(FOLDER_FRONT);
  c.fillStyle = '#343A43';
  c.fill(back);
  const g = c.createLinearGradient(528, 136.754, 27.1538, 479.073);
  g.addColorStop(0, '#4A515C');
  g.addColorStop(1, '#2A2F37');
  c.fillStyle = g;
  c.fill(front);

  // hazard hatch, clipped to the folder body
  c.save();
  c.clip(front);
  c.strokeStyle = 'rgba(255,74,51,0.26)';
  c.lineWidth = 30;
  for (let k = -700; k < 1400; k += 96) {
    c.beginPath();
    c.moveTo(k, 0);
    c.lineTo(k + 560, 560);
    c.stroke();
  }
  c.restore();

  c.strokeStyle = 'rgba(255,100,80,0.55)';
  c.lineWidth = 7;
  c.stroke(back);
  c.restore();

  // padlock, centred on the folder body
  const lx = 201;
  const ly = 190;
  c.save();
  c.translate(lx, ly);
  rr(c, -26, -4, 52, 40, 8);
  c.fillStyle = '#FF6A50';
  c.fill();
  c.strokeStyle = 'rgba(255,190,175,0.9)';
  c.lineWidth = 1.4;
  c.stroke();
  c.beginPath();
  c.arc(0, -6, 16, Math.PI, 0);
  c.strokeStyle = '#FF6A50';
  c.lineWidth = 6.5;
  c.lineCap = 'round';
  c.stroke();
  c.beginPath();
  c.arc(0, 12, 4.4, 0, Math.PI * 2);
  c.fillStyle = '#2A2F37';
  c.fill();
  c.fillRect(-2, 12, 4, 11);
  c.restore();

  setFont(c, 400, 17, 0.15);
  const lw = c.measureText(HERO_LABEL).width;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.6)';
  c.shadowBlur = 5;
  c.shadowOffsetY = 1;
  c.fillStyle = '#9AA3AE';
  c.fillText(HERO_LABEL, BOX_W / 2 - lw / 2, 272);
  c.restore();
};

/* --------------------------------------------------- signed distance field bake */

const buildSdfTexture = () => {
  const cv = document.createElement('canvas');
  cv.width = BOX_W;
  cv.height = BOX_H;
  const c = cv.getContext('2d', {willReadFrequently: true})!;
  drawContentA(c);
  const img = c.getImageData(0, 0, BOX_W, BOX_H).data;

  const W = BOX_W;
  const H = BOX_H;
  const N = W * H;
  const INF = 1e9;
  const dIn = new Float32Array(N);
  const dOut = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const inside = img[i * 4 + 3] > 110;
    dIn[i] = inside ? INF : 0;
    dOut[i] = inside ? 0 : INF;
  }
  const D = 1;
  const DD = 1.41421356;
  const pass = (d: Float32Array) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let v = d[i];
        if (x > 0) v = Math.min(v, d[i - 1] + D);
        if (y > 0) {
          v = Math.min(v, d[i - W] + D);
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
        if (x < W - 1) v = Math.min(v, d[i + 1] + D);
        if (y < H - 1) {
          v = Math.min(v, d[i + W] + D);
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
    const d = dOut[i] - dIn[i];
    const v = Math.round(clamp01(d / SDF_RANGE / 2 + 0.5) * 255);
    out[i * 4] = v;
    out[i * 4 + 1] = v;
    out[i * 4 + 2] = v;
    out[i * 4 + 3] = 255;
  }
  return out;
};

/* ---------------------------------------------------------------- timeline */

type Beat = {
  f: number;
  t: number;
  scanY: number;
  scanOn: number;
  alert: number;
  level: number;
  latch: number; // 0/1 — "this object has been converted", never falls back
  edge: number; // edge brightness envelope
  burst: number;
  cell: number; // containment cell border
  chip: number; // QUARANTINED chip
  toast: number;
  stage: 0 | 1 | 2; // detected / isolating / quarantined
  prog: number;
};

const HERO_CY = cellCY(HERO); // 530

/*   0- 50  idle desktop
    50-300  agent sweeps the whole desktop top to bottom
       169  the sweep reaches the centre row and trips on one folder
   300-350  threat toast slides in
   360-400  containment field arms
   380-640  the front travels down the folder, converting it
   630-700  containment cell + QUARANTINED chip land, toast turns green
   700-900  hold                                                             */
const timeline = (f: number, fps: number): Beat => {
  const t = f / fps;

  const scanU = clamp01((f - 50) / 250);
  const scanY = lerp(90, 1010, scanU);
  const scanOn = ss(46, 62, f) * (1 - ss(292, 312, f));

  const alert = ss(169, 182, f);

  /* latch must be a hard, monotone flag. Feeding a fading envelope into
     uConvert makes the quarantined folder revert to healthy once the
     containment field switches off. */
  const latch = f >= 372 ? 1 : 0;
  const convP = trapezoid(clamp01((f - 380) / 262), 0.12, 0.16);
  const level = lerp(LEVEL_TOP, LEVEL_BOT, convP);
  const edge = ss(362, 396, f) * (1 - ss(648, 700, f));
  const burst = f > 352 ? Math.exp(-Math.pow((f - 384) / 22, 2)) : 0;

  const cell = ss(628, 690, f);
  const chip = ss(668, 716, f);
  const toast = ss(300, 344, f);
  const stage: 0 | 1 | 2 = f < 358 ? 0 : f < 656 ? 1 : 2;
  const prog = stage === 0 ? 0 : stage === 2 ? 1 : clamp01((f - 380) / 262);

  return {
    f,
    t,
    scanY,
    scanOn,
    alert,
    level,
    latch,
    edge,
    burst,
    cell,
    chip,
    toast,
    stage,
    prog,
  };
};

/* ---------------------------------------------------------------- WebGL glue */

type GLKit = {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  texA: WebGLTexture;
  texB: WebGLTexture;
  sdf: WebGLTexture;
  buf: WebGLBuffer;
  u: Record<string, WebGLUniformLocation | null>;
};

const initGL = (canvas: HTMLCanvasElement, sdfData: Uint8Array): GLKit | null => {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      // eslint-disable-next-line no-console
      console.error('Motion29 shader:', gl.getShaderInfoLog(sh));
    }
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);

  const u: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(prog, i)!;
    u[info.name] = gl.getUniformLocation(prog, info.name);
  }

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
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
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    BOX_W,
    BOX_H,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    sdfData,
  );

  return {gl, prog, texA, texB, sdf, buf, u};
};

/* Containment edge: the supplied flame preset with height dialled right down
   and smoke off, so it reads as a crackling energy front rather than a plume.
   The dimensionless values (scale, turbulence, spark size/density, rim, ember)
   are untouched — they are all relative to `height` inside the shader. */
const P = {
  intensity: 0.9,
  height: 34, // preset 190
  spread: 10, // preset 13
  speed: 0.9, // preset 0.5 — a containment field crackles faster than fire
  scale: 0.94,
  turbulence: 0.63,
  turbScale: 0.65,
  turbReach: 7, // preset 16
  sparks: 1.0, // preset 1.5
  sparkSize: 0.8, // preset 1.05
  sparkDensity: 1.3,
  sparkSpeed: 1.2,
  rim: 1.7, // preset 2.25
  melt: 2.0, // preset 5
  distortion: 5, // preset 13
  smoke: 0, // preset 1.5 — no smoke in a containment field
  ember: 2,
};

type FireParams = {
  time: number;
  intensity: number;
  height: number;
  spread: number;
  melt: number;
  distortion: number;
  ember: number;
  sparks: number;
  rim: number;
  fire: number;
  convert: number;
  level: number;
};

const drawGL = (
  kit: GLKit,
  ca: HTMLCanvasElement,
  cb: HTMLCanvasElement,
  p: FireParams,
  w: number,
  h: number,
) => {
  const {gl, prog, texA, texB, sdf, u} = kit;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ca);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cb);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, sdf);

  gl.useProgram(prog);
  const set1 = (k: string, v: number) => gl.uniform1f(u[k]!, v);
  gl.uniform1i(u.uContent!, 0);
  gl.uniform1i(u.uContentB!, 1);
  gl.uniform1i(u.uSdf!, 2);
  gl.uniform2f(u.uResolution!, w, h);
  gl.uniform2f(
    u.uRectCenter!,
    BOX_X + BOX_W / 2 - RGN_X,
    h - (BOX_Y + BOX_H / 2 - RGN_Y),
  );
  gl.uniform2f(u.uRectHalf!, BOX_W / 2, BOX_H / 2);
  gl.uniform3f(u.uColor!, EDGE_RGB[0], EDGE_RGB[1], EDGE_RGB[2]);
  set1('uSdfRange', SDF_RANGE);
  set1('uTime', p.time);
  set1('uIntensity', p.intensity);
  set1('uHeight', p.height);
  set1('uSpread', p.spread);
  set1('uScale', P.scale);
  set1('uTurbulence', P.turbulence);
  set1('uTurbScale', P.turbScale);
  set1('uTurbReach', P.turbReach);
  set1('uSparks', p.sparks);
  set1('uSparkSize', P.sparkSize);
  set1('uSparkDensity', P.sparkDensity);
  set1('uSparkSpeed', P.sparkSpeed);
  set1('uRim', p.rim);
  set1('uMelt', p.melt);
  set1('uDistortion', p.distortion);
  set1('uSmoke', P.smoke);
  set1('uEmber', p.ember);
  set1('uFire', p.fire);
  set1('uConvert', p.convert);
  set1('uBurnEdge', BOX_H * (p.level - 0.5));

  const bypass = p.fire <= 0.0004 && p.intensity <= 0.0004;
  set1('uBypass', bypass ? 1 : 0);
  set1('uBypassMix', p.convert);

  const innerCut =
    40 +
    (p.distortion > 0.02 ? P.turbReach * 5 : 0) +
    (p.convert > 0.002 ? p.melt * 4 + 30 : 12) +
    (p.ember * p.intensity > 0.002 ? 45 : 0);
  set1('uInnerCut', innerCut);
  const outer = Math.max(p.height, 24) * 1.25 + p.spread * 5 + 24;
  set1('uOuterCut', outer);
  set1('uCullD', Math.min(outer, SDF_RANGE * 0.9));

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, w, h);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

/* ---------------------------------------------------------------- toast panel */

const TW = 470;
const TH = 184;
const TX = VW - TW - 60;
const TY = VH - 58 - TH - 40;

const drawToast = (c: CanvasRenderingContext2D, b: Beat) => {
  c.clearRect(0, 0, TW, TH);
  c.textBaseline = 'alphabetic';

  rr(c, 0.5, 0.5, TW - 1, TH - 1, 14);
  const g = c.createLinearGradient(0, 0, 0, TH);
  g.addColorStop(0, '#1B2029');
  g.addColorStop(1, '#141821');
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.12)';
  c.lineWidth = 1;
  c.stroke();

  const accent = b.stage === 2 ? C_OK : b.stage === 1 ? '#F0A038' : C_THREAT;

  // accent rail
  c.save();
  rr(c, 0.5, 0.5, TW - 1, TH - 1, 14);
  c.clip();
  c.fillStyle = accent;
  c.fillRect(0, 0, 4, TH);
  const wash = c.createLinearGradient(0, 0, 190, 0);
  wash.addColorStop(0, accent + '26');
  wash.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = wash;
  c.fillRect(0, 0, 190, TH);
  c.restore();

  // shield mark
  c.save();
  c.translate(28, 22);
  c.beginPath();
  c.moveTo(11, 0);
  c.lineTo(22, 4.4);
  c.lineTo(22, 13);
  c.bezierCurveTo(22, 20, 16.5, 24.6, 11, 26.4);
  c.bezierCurveTo(5.5, 24.6, 0, 20, 0, 13);
  c.lineTo(0, 4.4);
  c.closePath();
  c.strokeStyle = accent;
  c.lineWidth = 1.8;
  c.stroke();
  if (b.stage === 2) {
    c.beginPath();
    c.moveTo(6, 13);
    c.lineTo(9.8, 17);
    c.lineTo(16.4, 9);
    c.strokeStyle = accent;
    c.lineWidth = 2.2;
    c.lineCap = 'round';
    c.stroke();
  } else {
    c.beginPath();
    c.moveTo(11, 7.5);
    c.lineTo(11, 15.5);
    c.strokeStyle = accent;
    c.lineWidth = 2.2;
    c.lineCap = 'round';
    c.stroke();
    c.beginPath();
    c.arc(11, 19.6, 1.4, 0, Math.PI * 2);
    c.fillStyle = accent;
    c.fill();
  }
  c.restore();

  setFont(c, 700, 11, 2.2);
  c.fillStyle = '#8C97A6';
  c.fillText('ENDPOINT PROTECTION', 62, 32);

  const head =
    b.stage === 2 ? 'THREAT QUARANTINED' : b.stage === 1 ? 'ISOLATING FILE' : 'THREAT DETECTED';
  setFont(c, 700, 22, -0.1);
  c.fillStyle = b.stage === 2 ? '#DCF6EA' : '#F2F5F9';
  c.fillText(head, 28, 74);

  setFont(c, 400, 14, 0.2);
  c.fillStyle = '#9AA5B4';
  c.fillText('Trojan.Agent.7741', 28, 100);
  setFont(c, 400, 13, 0.2);
  c.fillStyle = '#6E7A8A';
  const pathTxt = 'Desktop  ›  ' + HERO_LABEL;
  c.fillText(pathTxt, 28, 124);

  // progress
  const px0 = 28;
  const pw = TW - 56;
  rr(c, px0, TH - 24, pw, 6, 3);
  c.fillStyle = 'rgba(255,255,255,0.08)';
  c.fill();
  const fw = pw * clamp01(b.prog);
  if (fw > 3) {
    rr(c, px0, TH - 24, Math.max(6, fw), 6, 3);
    c.fillStyle = accent;
    c.fill();
  }
  setFont(c, 700, 11, 1.6);
  c.fillStyle = accent;
  const st =
    b.stage === 2 ? 'SECURE VAULT · 1 ITEM' : b.stage === 1 ? 'CONTAINMENT ' + Math.round(b.prog * 100) + '%' : 'ACTION REQUIRED';
  c.fillText(st, px0, TH - 38);
  setFont(c, 400, 11, 0.8);
  c.fillStyle = '#5E6979';
  const rt = b.stage === 2 ? 'RESOLVED' : 'AUTO';
  const rw = c.measureText(rt).width;
  c.fillText(rt, TW - 28 - rw, TH - 38);
};

/* ---------------------------------------------------------------- scan HUD */

const HW = 400;
const HH = 56;

const drawHud = (c: CanvasRenderingContext2D, b: Beat) => {
  c.clearRect(0, 0, HW, HH);
  c.textBaseline = 'alphabetic';
  rr(c, 0.5, 0.5, HW - 1, HH - 1, 12);
  c.fillStyle = 'rgba(16,24,34,0.86)';
  c.fill();
  c.strokeStyle = 'rgba(63,211,232,0.28)';
  c.lineWidth = 1;
  c.stroke();

  const u = clamp01((b.scanY - 90) / 920);
  c.beginPath();
  c.arc(30, HH / 2, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u);
  c.strokeStyle = C_SCAN;
  c.lineWidth = 2.4;
  c.lineCap = 'round';
  c.stroke();

  setFont(c, 700, 11, 2);
  c.fillStyle = '#BFD9E2';
  c.fillText('REAL-TIME SCAN', 54, 25);
  setFont(c, 400, 12, 0.3);
  c.fillStyle = '#7B8C99';
  c.fillText(
    Math.round(u * 1284) + ' / 1,284 items',
    54,
    42,
  );

  const bx = 210;
  const bw = HW - bx - 20;
  rr(c, bx, HH / 2 - 3, bw, 6, 3);
  c.fillStyle = 'rgba(255,255,255,0.08)';
  c.fill();
  if (u > 0.01) {
    rr(c, bx, HH / 2 - 3, Math.max(6, bw * u), 6, 3);
    c.fillStyle = C_SCAN;
    c.fill();
  }
};

/* --------------------------------------------------------------- main scene */

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fontsReady = useEmbeddedFonts();
  const b = useMemo(() => timeline(frame, fps), [frame, fps]);
  const sdfData = useMemo(() => buildSdfTexture(), []);

  const outRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLCanvasElement>(null);
  const toastRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLCanvasElement>(null);
  const aRef = useRef<HTMLCanvasElement | null>(null);
  const bRef = useRef<HTMLCanvasElement | null>(null);
  const kitRef = useRef<GLKit | null>(null);

  const fire: FireParams = useMemo(() => {
    const e = b.edge;
    const kick = b.burst;
    const master = clamp01(e + kick * 0.9);
    return {
      time: b.t * P.speed,
      intensity: e * P.intensity + kick * 0.25,
      height: (16 + (P.height - 16) * e + kick * 22),
      spread: 8 + (P.spread - 8) * e + kick * 3,
      melt: P.melt * b.latch,
      distortion: P.distortion * master,
      ember: P.ember * master,
      sparks: P.sparks * e + kick * 1.2,
      rim: P.rim * e + kick * 0.8,
      fire: master,
      convert: b.latch,
      level: b.level,
    };
  }, [b]);


  useLayoutEffect(() => {
    return () => {
      const k = kitRef.current;
      if (k) {
        k.gl.deleteTexture(k.texA);
        k.gl.deleteTexture(k.texB);
        k.gl.deleteTexture(k.sdf);
        k.gl.deleteProgram(k.prog);
        k.gl.deleteBuffer(k.buf);
        kitRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    const out = outRef.current;
    if (!out) return;
    let kit = kitRef.current;
    if (!kit) {
      kit = initGL(out, sdfData);
      kitRef.current = kit;
    }
    if (!kit) return;

    if (!aRef.current) {
      const cv = document.createElement('canvas');
      cv.width = BOX_W;
      cv.height = BOX_H;
      drawContentA(cv.getContext('2d')!);
      aRef.current = cv;
    }
    if (!bRef.current) {
      const cv = document.createElement('canvas');
      cv.width = BOX_W;
      cv.height = BOX_H;
      drawContentB(cv.getContext('2d')!);
      bRef.current = cv;
    }

    drawGL(kit, aRef.current, bRef.current, fire, RGN_W, RGN_H);

    const bl = bloomRef.current;
    if (bl) {
      const bctx = bl.getContext('2d');
      if (bctx) {
        bctx.clearRect(0, 0, bl.width, bl.height);
        bctx.drawImage(out, 0, 0, bl.width, bl.height);
      }
    }

    const tc = toastRef.current;
    if (tc && b.toast > 0.001) {
      const ctx = tc.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        drawToast(ctx, b);
      }
    }
    const hc = hudRef.current;
    if (hc && b.scanOn > 0.001) {
      const ctx = hc.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        drawHud(ctx, b);
      }
    }
  });

  const heat = b.edge;
  const alarmPulse = 0.5 + 0.5 * Math.sin(2 * Math.PI * b.t * 1.5);

  return (
    <AbsoluteFill style={{background: '#060D18'}}>
      {/* ---------- wallpaper ---------- */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(125% 105% at 30% 18%, #1C3E4E 0%, #16304A 34%, #0D1D30 68%, #060D18 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(50% 44% at 78% 82%, rgba(46,132,152,0.22) 0%, rgba(0,0,0,0) 70%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(32% 48% at 14% 90%, rgba(30,74,130,0.26) 0%, rgba(0,0,0,0) 72%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(115deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 44%)',
        }}
      />

      {/* threat wash once detected */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 54% at 960px ${HERO_CY}px, rgba(255,60,40,${
            0.10 * b.alert + 0.16 * heat
          }) 0%, rgba(120,20,10,${0.04 * b.alert + 0.06 * heat}) 40%, rgba(0,0,0,0) 76%)`,
        }}
      />

      {/* ---------- desktop icon grid ---------- */}
      {LABELS.map((label, i) => {
        if (i === HERO) return null;
        const dy = b.scanY - cellCY(i);
        const ring = clamp01(dy / 34) * (1 - clamp01((dy - 52) / 60)) * b.scanOn;
        const tick = ss(56, 96, dy) * (1 - ss(300, 372, b.f));
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: cellCX(i) - CELL_W / 2,
              top: cellCY(i) - 108,
              width: CELL_W,
              textAlign: 'center',
              fontFamily: 'MxSans, system-ui, sans-serif',
            }}
          >
            <div style={{position: 'relative', width: ICON, margin: '0 auto'}}>
              <svg
                width={ICON}
                height={ICON}
                viewBox="0 0 544 544"
                style={{display: 'block'}}
              >
                <path d={FOLDER_BACK} fill="#FFC531" />
                <path d={FOLDER_FRONT} fill="url(#fgrad)" />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  left: 2,
                  top: 20,
                  width: ICON - 4,
                  height: ICON - 44,
                  borderRadius: 10,
                  border: `2px solid ${C_SCAN}`,
                  boxShadow: `0 0 18px rgba(63,211,232,0.55)`,
                  opacity: ring * 0.9,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 118,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: C_OK,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  opacity: tick,
                  transform: `scale(${0.6 + 0.4 * easeOutBack(clamp01(dy / 90))})`,
                }}
              >
                <svg width={26} height={26} viewBox="0 0 26 26">
                  <path
                    d="M7 13.4 L11 17.2 L19 8.6"
                    fill="none"
                    stroke="#0B2018"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div
              style={{
                marginTop: -11,
                fontSize: 17,
                letterSpacing: 0.15,
                color: '#FFFFFF',
                textShadow: '0 1px 4px rgba(0,0,0,0.75)',
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <linearGradient
            id="fgrad"
            x1="528"
            y1="136.754"
            x2="27.1538"
            y2="479.073"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.234375" stopColor="#FCF68D" />
            <stop offset="1" stopColor="#FFC531" />
          </linearGradient>
        </defs>
      </svg>

      {/* ---------- containment cell ---------- */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 118,
          top: 428,
          width: 236,
          height: 214,
          borderRadius: 12,
          border: `2px dashed rgba(255,74,51,${0.5 + 0.35 * alarmPulse})`,
          background: `repeating-linear-gradient(45deg, rgba(255,74,51,0.10) 0 10px, rgba(255,74,51,0) 10px 22px)`,
          opacity: b.cell,
          boxShadow: `0 0 26px rgba(255,60,40,${0.22 * b.cell})`,
        }}
      />

      {/* ---------- hero: the infected folder ---------- */}
      <canvas
        ref={outRef}
        width={RGN_W}
        height={RGN_H}
        style={{
          position: 'absolute',
          left: RGN_X,
          top: RGN_Y,
          width: RGN_W,
          height: RGN_H,
        }}
      />
      <canvas
        ref={bloomRef}
        width={Math.round(RGN_W / 4)}
        height={Math.round(RGN_H / 4)}
        style={{
          position: 'absolute',
          left: RGN_X,
          top: RGN_Y,
          width: RGN_W,
          height: RGN_H,
          filter: 'blur(18px)',
          mixBlendMode: 'screen',
          opacity: 0.5 * heat,
          pointerEvents: 'none',
        }}
      />

      {/* threat ring on the infected cell before containment */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 96,
          top: 442,
          width: 192,
          height: 148,
          borderRadius: 10,
          border: `2px solid rgba(255,74,51,${0.55 + 0.4 * alarmPulse})`,
          boxShadow: `0 0 22px rgba(255,60,40,${0.4 + 0.3 * alarmPulse})`,
          opacity: b.alert * (1 - b.cell),
        }}
      />
      {/* threat badge */}
      <div
        style={{
          position: 'absolute',
          left: 1040,
          top: 436,
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: C_THREAT,
          boxShadow: '0 3px 10px rgba(0,0,0,0.55)',
          opacity: b.alert * (1 - b.chip),
          transform: `scale(${0.5 + 0.5 * easeOutBack(clamp01((b.f - 169) / 26))})`,
          fontFamily: 'MxSans, system-ui, sans-serif',
          color: '#2A0A05',
          fontWeight: 700,
          fontSize: 22,
          lineHeight: '33px',
          textAlign: 'center',
        }}
      >
        !
      </div>

      {/* QUARANTINED chip */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 78,
          top: 648,
          width: 156,
          height: 28,
          borderRadius: 14,
          background: 'rgba(255,74,51,0.16)',
          border: '1px solid rgba(255,110,86,0.6)',
          fontFamily: 'MxSans, system-ui, sans-serif',
          color: '#FF9E88',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 2.2,
          lineHeight: '27px',
          textAlign: 'center',
          opacity: b.chip,
          transform: `scale(${0.7 + 0.3 * easeOutBack(b.chip)})`,
        }}
      >
        QUARANTINED
      </div>

      {/* ---------- scan sweep ---------- */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: b.scanY - 120,
          width: VW,
          height: 240,
          background:
            'linear-gradient(180deg, rgba(63,211,232,0) 0%, rgba(63,211,232,0.10) 42%, rgba(63,211,232,0.20) 50%, rgba(63,211,232,0.06) 58%, rgba(63,211,232,0) 100%)',
          mixBlendMode: 'screen',
          opacity: b.scanOn,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: b.scanY - 1,
          width: VW,
          height: 2,
          background:
            'linear-gradient(90deg, rgba(63,211,232,0) 0%, rgba(150,245,255,0.95) 18%, rgba(190,250,255,1) 50%, rgba(150,245,255,0.95) 82%, rgba(63,211,232,0) 100%)',
          boxShadow: '0 0 16px rgba(63,211,232,0.85)',
          opacity: b.scanOn,
          pointerEvents: 'none',
        }}
      />

      {/* ---------- scan HUD ---------- */}
      <canvas
        ref={hudRef}
        width={HW}
        height={HH}
        style={{
          position: 'absolute',
          left: VW / 2 - HW / 2,
          top: 74,
          width: HW,
          height: HH,
          opacity: b.scanOn,
          filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.5))',
        }}
      />

      {/* ---------- toast ---------- */}
      <canvas
        ref={toastRef}
        width={TW}
        height={TH}
        style={{
          position: 'absolute',
          left: TX,
          top: TY,
          width: TW,
          height: TH,
          opacity: b.toast,
          transform: `translateX(${(1 - easeOutCubic(b.toast)) * 60}px)`,
          filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.55))',
        }}
      />

      {/* ---------- taskbar ---------- */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: VH - 58,
          width: VW,
          height: 58,
          background: 'rgba(18,24,36,0.82)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: VW / 2 - 122 + i * 58,
            top: VH - 45,
            width: 32,
            height: 32,
            borderRadius: 8,
            background:
              i === 2
                ? 'linear-gradient(150deg, rgba(255,197,49,0.9), rgba(230,160,30,0.9))'
                : i === 4
                  ? `linear-gradient(150deg, ${
                      b.stage === 2 ? 'rgba(55,214,160,0.95)' : 'rgba(255,74,51,0.95)'
                    }, rgba(120,30,20,0.9))`
                  : 'rgba(255,255,255,0.16)',
            opacity: i === 4 && b.toast < 0.02 ? 0.4 : 1,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          right: 34,
          top: VH - 47,
          textAlign: 'right',
          fontFamily: 'MxSans, system-ui, sans-serif',
          color: 'rgba(255,255,255,0.72)',
          fontSize: 14,
          lineHeight: '17px',
        }}
      >
        <div>10:24</div>
        <div style={{opacity: 0.75}}>14/08/2026</div>
      </div>

      {/* ---------- vignette ---------- */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(78% 70% at 50% 46%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{position: 'absolute', opacity: 0, fontFamily: 'MxSans', fontWeight: 700}}
      >
        {fontsReady ? '.' : '.'}
      </div>
    </AbsoluteFill>
  );
};

export default Motion;
