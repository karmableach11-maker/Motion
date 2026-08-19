import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';

/* ══════════════════════════════════════════════════════════════════════════
   SECURE FILE TRANSFER · ENCRYPT → TRANSIT → DECRYPT
   1920×1080 · 60 fps · 1200 frames (20 s) · ONE-SHOT (deliberately not looped)

   A transfer is a one-way story — the file leaves A and arrives at B — so a
   loop would have to un-deliver it. The clip ends on a living hold instead:
   the sender's copy keeps shimmering as cipher at rest, a verification sweep
   runs over the delivered page, and the badge breathes.

   The ASCII-cipher shader is ported from the Canvas UI "Decrypt Reveal"
   component (github.com/DavidHDev/canvas-ui, MIT + Commons Clause). On top
   of the changes made for the previous two clips (html-in-canvas replaced by
   Canvas2D rasterisation, rAF/observers removed, frame-driven fronts), this
   version extends the shader to TWO independent wavefronts:
   · front A CONCEALS the sender panel (plaintext → cipher);
   · front B REVEALS the receiver panel (cipher → plaintext);
   · pixels are assigned to a front by x position with a feathered split, so
     one shader pass renders both endpoints and the dark channel between.
   The receiver's content does not exist before the packet lands, so the clip
   bakes TWO content states and swaps textures on the arrival frame, masked
   by the landing flash.
   ══════════════════════════════════════════════════════════════════════════ */

const W = 1920;
const H = 1080;
const DUR = 1200;
const FPS = 60;

/* panel geometry */
const LPX = 130;
const LPY = 210;
const PW = 610;
const PH = 660;
const RPX = 1180;
/* wavefront origins = the lock badge in each panel header */
const AX = LPX + 47;
const AY = LPY + 53;
const BX = RPX + 47;
const BY = LPY + 53;
/* region split (feathered ±24 px in the shader) */
const SPLIT_L = 760;
const SPLIT_R = 1160;
/* the frame on which the packet lands and the receiver content appears */
const ARRIVE = 770;

/* ── embedded fonts (subset, OFL) ─────────────────────────────────────── */
const JM400 = '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';
const JM700 = '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';
const IN800 = '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';

const FONT_CSS = `
@font-face{font-family:'VxMono';font-style:normal;font-weight:400;font-display:block;src:url(data:font/woff2;base64,${JM400}) format('woff2');}
@font-face{font-family:'VxMono';font-style:normal;font-weight:700;font-display:block;src:url(data:font/woff2;base64,${JM700}) format('woff2');}
@font-face{font-family:'VxSans';font-style:normal;font-weight:800;font-display:block;src:url(data:font/woff2;base64,${IN800}) format('woff2');}
`;

let fontsLoaded = false;
let fontsPromise: Promise<unknown> | null = null;
const ensureFonts = () => {
  if (fontsPromise) return fontsPromise;
  const st = document.createElement('style');
  st.textContent = FONT_CSS;
  document.head.appendChild(st);
  fontsPromise = Promise.all([
    document.fonts.load("400 20px 'VxMono'"),
    document.fonts.load("700 20px 'VxMono'"),
    document.fonts.load("800 48px 'VxSans'"),
  ]).catch(() => null);
  return fontsPromise;
};

/* ── palette ──────────────────────────────────────────────────────────── */
const BG = '#04070c';
const C = {
  page: '#0b1219',
  line: '#1c2c39',
  lineSoft: '#14212b',
  txt: '#e9f1f6',
  body: '#b9ccd6',
  dim: '#7b94a2',
  faint: '#425c6a',
  cyan: '#38bdf8',
  ice: '#a5e4ff',
  amber: '#fbbf24',
  green: '#4ade80',
};

/* ══════════════════════════════════════════════════════════════════════
   THE TWO CONTENT STATES — plain Canvas2D, each drawn once.
   State A: document on the sender only. State B: document on both ends.
   ══════════════════════════════════════════════════════════════════════ */
const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};
const mono = (px: number, weight = 400) => `${weight} ${px}px VxMono, monospace`;
const sans = (px: number) => `800 ${px}px VxSans, sans-serif`;

const drawLockGlyph = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 24, s / 24);
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(7, 10.5);
  ctx.lineTo(7, 7.2);
  ctx.bezierCurveTo(7, 3.8, 9.1, 2, 12, 2);
  ctx.bezierCurveTo(14.9, 2, 17, 3.8, 17, 7.2);
  ctx.lineTo(17, 10.5);
  ctx.stroke();
  rr(ctx, 4.4, 10.5, 15.2, 11.6, 2.6);
  ctx.stroke();
  ctx.restore();
};

/* generic contract body — no real parties, safe for stock */
const SECTIONS: [string, string[]][] = [
  [
    '1.  SCOPE OF THE AGREEMENT',
    [
      'This agreement governs the exchange of technical, financial',
      'and commercial information between the parties for the sole',
      'purpose of evaluating a strategic partnership.',
    ],
  ],
  [
    '2.  CONFIDENTIAL MATERIAL',
    [
      "Each party shall protect the other's confidential material",
      'with no less than the degree of care applied to its own',
      'information, and never less than reasonable care.',
    ],
  ],
  [
    '3.  DATA HANDLING AND RETENTION',
    [
      'All records are encrypted at rest and in transit. Access is',
      'limited to named personnel holding an active clearance',
      'token; every retrieval is written to an immutable log.',
    ],
  ],
];

/** one document panel, drawn at the given x — used for both endpoints */
const drawDocPanel = (ctx: CanvasRenderingContext2D, PX: number) => {
  const PY = LPY;
  ctx.fillStyle = C.page;
  rr(ctx, PX, PY, PW, PH, 16);
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* header */
  drawLockGlyph(ctx, PX + 34, PY + 40, 26, C.cyan);
  ctx.fillStyle = C.txt;
  ctx.font = mono(17, 700);
  ctx.fillText('merger_agreement_v7.pdf', PX + 72, PY + 58);
  ctx.fillStyle = C.dim;
  ctx.font = mono(12, 400);
  ctx.fillText('2.41 MB  ·  12 pages  ·  AES-256-GCM', PX + 72, PY + 80);

  /* CONFIDENTIAL chip — width measured so the label can never overflow */
  const chipLabel = 'CONFIDENTIAL';
  ctx.font = mono(12, 700);
  const chipW = ctx.measureText(chipLabel).width + 28;
  const chipX = PX + PW - chipW - 34;
  ctx.fillStyle = 'rgba(251,191,36,0.11)';
  rr(ctx, chipX, PY + 36, chipW, 28, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(251,191,36,0.45)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = C.amber;
  ctx.fillText(chipLabel, chipX + 14, PY + 55);

  ctx.strokeStyle = C.lineSoft;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PX + 34, PY + 104);
  ctx.lineTo(PX + PW - 34, PY + 104);
  ctx.stroke();

  /* title */
  ctx.fillStyle = C.txt;
  ctx.font = sans(21);
  ctx.fillText('NON-DISCLOSURE AGREEMENT', PX + 34, PY + 148);
  ctx.fillStyle = C.faint;
  ctx.font = mono(12, 400);
  ctx.fillText('Ref. NDA-2026-0447  ·  Effective on last signature', PX + 34, PY + 174);

  /* body */
  let by = PY + 214;
  for (const [head, lines] of SECTIONS) {
    ctx.fillStyle = C.cyan;
    ctx.font = mono(13, 700);
    ctx.fillText(head, PX + 34, by);
    by += 22;
    ctx.fillStyle = C.body;
    ctx.font = mono(13, 400);
    for (const ln of lines) {
      ctx.fillText(ln, PX + 34, by);
      by += 20;
    }
    by += 18;
  }

  /* signature block — baselines pinned to the panel bottom */
  ctx.strokeStyle = C.lineSoft;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PX + 34, PY + PH - 122);
  ctx.lineTo(PX + PW - 34, PY + PH - 122);
  ctx.stroke();
  const colW = (PW - 68 - 32) / 2;
  ([
    ['AUTHORISED SIGNATORY', 'Corporate Development'],
    ['COUNTERSIGNED', 'General Counsel'],
  ] as [string, string][]).forEach((sig, i) => {
    const sx = PX + 34 + i * (colW + 32);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(sx, PY + PH - 84);
    ctx.lineTo(sx + colW, PY + PH - 84);
    ctx.stroke();
    ctx.fillStyle = C.faint;
    ctx.font = mono(11, 700);
    ctx.fillText(sig[0], sx, PY + PH - 64);
    ctx.fillStyle = C.dim;
    ctx.font = mono(12, 400);
    ctx.fillText(sig[1], sx, PY + PH - 46);
  });
  ctx.fillStyle = C.faint;
  ctx.font = mono(12, 400);
  ctx.fillText('Page 1 of 12  ·  Internal distribution only', PX + 34, PY + PH - 20);
};

const drawContent = (ctx: CanvasRenderingContext2D, withReceiver: boolean) => {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  drawDocPanel(ctx, LPX);
  if (withReceiver) drawDocPanel(ctx, RPX);
};

/* ══════════════════════════════════════════════════════════════════════
   CIPHER SHADERS — ported from Canvas UI DecryptReveal, two-front variant
   ══════════════════════════════════════════════════════════════════════ */
const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
void main () { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const CELL_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uShapes;
uniform vec2 uContentRes;
uniform vec2 uCellPx;
uniform int uGlyphCount;
uniform float uContrast;
uniform float uExposure;
uniform float uThreshold;
uniform vec3 uBg;

const vec2 INNER[6] = vec2[6](
  vec2(0.28, 0.26), vec2(0.72, 0.14),
  vec2(0.28, 0.56), vec2(0.72, 0.44),
  vec2(0.28, 0.86), vec2(0.72, 0.74)
);
const vec2 OUTER[10] = vec2[10](
  vec2(0.28, -0.2), vec2(0.72, -0.2),
  vec2(-0.22, 0.25), vec2(1.22, 0.25),
  vec2(-0.22, 0.5), vec2(1.22, 0.5),
  vec2(-0.22, 0.75), vec2(1.22, 0.75),
  vec2(0.28, 1.2), vec2(0.72, 1.2)
);
const vec2 RING[6] = vec2[6](
  vec2(1.0, 0.0), vec2(0.5, 0.8660254), vec2(-0.5, 0.8660254),
  vec2(-1.0, 0.0), vec2(-0.5, -0.8660254), vec2(0.5, -0.8660254)
);

vec2 cellBase;

vec4 fetchTap (vec2 p) {
  vec2 uv = p / uContentRes;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(uContent, uv);
}
vec4 sampleCircle (vec2 c) {
  vec2 middle = cellBase + c * uCellPx;
  float r = uCellPx.y * 0.161;
  vec4 acc = fetchTap(middle);
  for (int k = 0; k < 6; k++) acc += fetchTap(middle + RING[k] * r);
  return acc / 7.0;
}
float tapLevel (vec4 t) {
  vec3 straight = t.rgb / max(t.a, 1e-4);
  return dot(abs(straight - uBg), vec3(0.299, 0.587, 0.114)) * t.a;
}
float circleSig (vec4 acc) { return clamp(tapLevel(acc) * uExposure, 0.0, 1.0); }
float dirContrast (float value, float ext) {
  float peak = max(value, ext);
  if (peak < 1e-4) return value;
  return pow(value / peak, uContrast) * peak;
}

void main () {
  cellBase = floor(gl_FragCoord.xy) * uCellPx;
  float v[6];
  vec3 colAcc = vec3(0.0);
  float alphaAcc = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 acc = sampleCircle(INNER[i]);
    v[i] = circleSig(acc);
    colAcc += acc.rgb;
    alphaAcc += acc.a;
  }
  float e[10];
  for (int i = 0; i < 10; i++) e[i] = circleSig(sampleCircle(OUTER[i]));
  v[0] = dirContrast(v[0], max(max(e[0], e[1]), max(e[2], e[4])));
  v[1] = dirContrast(v[1], max(max(e[0], e[1]), max(e[3], e[5])));
  v[2] = dirContrast(v[2], max(e[2], max(e[4], e[6])));
  v[3] = dirContrast(v[3], max(e[3], max(e[5], e[7])));
  v[4] = dirContrast(v[4], max(max(e[4], e[6]), max(e[8], e[9])));
  v[5] = dirContrast(v[5], max(max(e[5], e[7]), max(e[8], e[9])));
  float gm[6];
  for (int i = 0; i < 6; i++) gm[i] = 0.0;
  float levSum = 0.0;
  float inkLev = 0.0;
  vec3 inkCol = vec3(0.0);
  int nx = int(clamp(uCellPx.x, 6.0, 20.0));
  int ny = int(clamp(uCellPx.y, 8.0, 32.0));
  float fx = float(nx - 1);
  float fy = float(ny - 1);
  for (int gy = 0; gy < ny; gy++) {
    for (int gx = 0; gx < nx; gx++) {
      vec2 p = vec2(float(gx) / fx, float(gy) / fy);
      vec4 t = fetchTap(cellBase + p * uCellPx);
      float lev = tapLevel(t);
      int idx = (p.y < 0.41 ? 0 : (p.y < 0.71 ? 2 : 4)) + (p.x < 0.5 ? 0 : 1);
      gm[idx] = max(gm[idx], lev);
      levSum += lev;
      if (lev > inkLev) { inkLev = lev; inkCol = t.rgb / max(t.a, 1e-4); }
    }
  }
  inkLev *= uExposure;
  for (int i = 0; i < 6; i++) v[i] = max(v[i], clamp(gm[i] * uExposure, 0.0, 1.0));
  float peak = max(max(max(v[0], v[1]), max(v[2], v[3])), max(v[4], v[5]));
  vec3 avgCol = colAcc / max(alphaAcc, 1e-4);
  if (peak < uThreshold) { outColor = vec4(avgCol, 0.0); return; }
  float mean = levSum * uExposure / float(nx * ny);
  float sharp = inkLev / max(mean, 1e-4);
  float solid = smoothstep(uThreshold, uThreshold * 1.6, inkLev);
  float lift = smoothstep(1.5, 3.0, sharp) * solid;
  float lifted = mix(peak, 1.0, lift);
  for (int i = 0; i < 6; i++) v[i] = pow(min(v[i] / max(peak, 1e-4), 1.0), uContrast) * lifted;
  vec3 cellCol = mix(avgCol, inkCol, lift);
  int best = 0;
  float bestD = 1e9;
  for (int g = 0; g < uGlyphCount; g++) {
    float d = 0.0;
    for (int i = 0; i < 6; i++) {
      float diff = v[i] - texelFetch(uShapes, ivec2(i, g), 0).r;
      d += diff * diff;
    }
    if (d < bestD) { bestD = d; best = g; }
  }
  outColor = vec4(cellCol, float(best) / 255.0);
}`;

const MAIN_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uCells;
uniform sampler2D uAtlas;
uniform vec2 uRes;
uniform vec2 uCellPx;
uniform vec2 uGrid;
uniform vec2 uAtlasGrid;
uniform vec2 uAtlasPad;
uniform vec2 uAtlasInner;
uniform int uGlyphCount;
uniform vec2 uPointerA;
uniform float uActiveA;
uniform float uRadiusA;
uniform vec2 uPointerB;
uniform float uActiveB;
uniform float uRadiusB;
uniform float uSplitL;
uniform float uSplitR;
uniform float uSoftness;
uniform float uColored;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uLegibility;
uniform float uScramble;
uniform float uScrambleSpeed;
uniform float uEdgeWidth;
uniform float uEdgeFlicker;
uniform float uEdgeGlow;
uniform float uEdgeTint;
uniform float uAberration;
uniform float uPassthrough;
uniform vec3 uBg;
uniform float uTime;

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec4 samp (vec2 p) {
  vec2 uv = clamp(p / uRes, vec2(0.001), vec2(0.999));
  return texture(uContent, uv);
}

void main () {
  vec2 pc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);

  /* region weights: left endpoint, right endpoint, dark channel between */
  float wL = 1.0 - smoothstep(uSplitL - 24.0, uSplitL + 24.0, pc.x);
  float wR = smoothstep(uSplitR - 24.0, uSplitR + 24.0, pc.x);

  float soft = clamp(uSoftness, 0.02, 1.0);

  /* front A — CONCEALS the sender: inside the circle becomes cipher */
  float dA = length(pc - uPointerA);
  float rA = max(uRadiusA, 1.0);
  float inA = rA * (1.0 - soft);
  float concealA = (1.0 - smoothstep(inA, rA, dA)) * uActiveA;
  float eL = 1.0 - concealA;

  /* front B — REVEALS the receiver: inside the circle becomes plaintext */
  float dB = length(pc - uPointerB);
  float rB = max(uRadiusB, 1.0);
  float inB = rB * (1.0 - soft);
  float eR = (1.0 - smoothstep(inB, rB, dB)) * uActiveB;

  float e = wL * eL + wR * eR;

  float bwA = max(rA * clamp(uEdgeWidth, 0.0, 1.0) * 0.5, 6.0);
  float bdA = dA - mix(inA, rA, 0.5);
  float ringA = exp(-bdA * bdA / (2.0 * bwA * bwA)) * uActiveA * wL;
  float bwB = max(rB * clamp(uEdgeWidth, 0.0, 1.0) * 0.5, 6.0);
  float bdB = dB - mix(inB, rB, 0.5);
  float ringB = exp(-bdB * bdB / (2.0 * bwB * bwB)) * uActiveB * wR;
  float ring = max(ringA, ringB);

  vec2 dir = ringA >= ringB
    ? (pc - uPointerA) / max(dA, 1e-3)
    : (pc - uPointerB) / max(dB, 1e-3);
  float ca = uAberration * ring;
  vec4 rC = samp(pc);
  vec3 real = vec3(samp(pc + dir * ca).r, rC.g, samp(pc - dir * ca).b);

  vec2 cellPos = pc / uCellPx;
  vec2 cell = clamp(floor(cellPos), vec2(0.0), uGrid - 1.0);
  vec4 info = texelFetch(uCells, ivec2(cell), 0);
  float glyph = floor(info.a * 255.0 + 0.5);

  float rerollP = clamp(uScramble * 0.35 + ring * uEdgeFlicker, 0.0, 1.0);
  float speed = max(uScrambleSpeed, 0.001) * (1.0 + ring * 2.5);
  float ft = floor(uTime * speed);
  float swap = step(1.0 - rerollP, hash(cell * 3.3 + vec2(ft * 0.717, ft * 0.523)))
    * step(0.5, glyph);
  float pick = hash(cell + vec2(ft * 0.613, ft * 0.831));
  glyph = mix(glyph, floor(pick * float(uGlyphCount - 1)) + 1.0, swap);

  vec2 local = clamp(cellPos - cell, 0.0, 1.0);
  float gx = mod(glyph, uAtlasGrid.x);
  float gy = floor(glyph / uAtlasGrid.x);
  vec2 atlasUv = vec2(
    (gx + uAtlasPad.x + local.x * uAtlasInner.x) / uAtlasGrid.x,
    (gy + uAtlasPad.y + local.y * uAtlasInner.y) / uAtlasGrid.y
  );
  vec2 atlasStep = uAtlasInner / uAtlasGrid;
  float mask = textureGrad(uAtlas, atlasUv,
    dFdx(cellPos) * atlasStep, dFdy(cellPos) * atlasStep).a * step(0.5, glyph);

  vec3 cellCol = info.rgb;
  vec3 lw = vec3(0.299, 0.587, 0.114);
  vec3 dev = cellCol - uBg;
  float mag = dot(abs(dev), lw);
  float target = clamp(uLegibility, 0.0, 1.0) * 0.75;
  float boost = clamp(target / max(mag, 0.01), 1.0, 32.0);
  vec3 vivid = clamp(uBg + dev * boost, 0.0, 1.0);
  float vividMag = dot(abs(vivid - uBg), lw);
  vec3 ink = mix(vec3(1.0), vec3(0.06), step(0.5, dot(uBg, lw)));
  vivid = mix(vivid, ink, clamp((target - vividMag) / max(target, 1e-3), 0.0, 1.0));
  float cellSig = clamp(mag * 1.6, 0.0, 1.0);
  vec3 monoCol = uColor * mix(0.35, 1.2, cellSig);
  vec3 glyphColor = mix(monoCol, vivid, clamp(uColored, 0.0, 1.0));
  glyphColor = clamp(uBg + (glyphColor - uBg) * uBrightness, 0.0, 1.0);
  float cellLum = dot(vivid, lw);
  glyphColor = mix(glyphColor, uColor * max(uBrightness, 1.0) * (0.6 + cellLum),
    ring * clamp(uEdgeTint, 0.0, 1.0));
  glyphColor = clamp(uBg + (glyphColor - uBg) * (1.0 + ring * uEdgeGlow * 1.6), 0.0, 1.0);

  vec3 base = mix(uBg, real, clamp(uPassthrough, 0.0, 1.0));
  vec3 encrypted = mix(base, glyphColor, mask);
  vec3 col = mix(encrypted, real, e);
  outColor = vec4(col, 1.0);
}`;

/* ── glyph atlas ──────────────────────────────────────────────────────── */
const ATLAS_CELL = 64;
const ATLAS_PAD = 8;
const INNER_CIRCLES: Array<[number, number]> = [
  [0.28, 0.26], [0.72, 0.14], [0.28, 0.56],
  [0.72, 0.44], [0.28, 0.86], [0.72, 0.74],
];
const CHARSET =
  " .`'\",:;-_~^+=*!?/\\|()[]{}<>#%&$@0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnopqrstuvwxyz";

const buildGlyphList = (charset: string) => {
  const seen = new Set<string>([' ']);
  const glyphs = [' '];
  for (const ch of charset) {
    if (glyphs.length >= 255) break;
    if (ch === '\n' || ch === '\r' || ch === '\t' || seen.has(ch)) continue;
    seen.add(ch);
    glyphs.push(ch);
  }
  return glyphs;
};

const glyphShapes = (image: ImageData, cols: number, cellW: number, cellH: number, count: number) => {
  const vectors = new Float32Array(count * 6);
  const radius = cellH * 0.26;
  const padW = cellW + ATLAS_PAD * 2;
  const padH = cellH + ATLAS_PAD * 2;
  for (let g = 0; g < count; g++) {
    const originX = (g % cols) * padW + ATLAS_PAD;
    const originY = Math.floor(g / cols) * padH + ATLAS_PAD;
    for (let c = 0; c < 6; c++) {
      const cx = INNER_CIRCLES[c][0] * cellW;
      const cy = INNER_CIRCLES[c][1] * cellH;
      let sum = 0;
      let total = 0;
      for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;
          if (dx * dx + dy * dy > radius * radius) continue;
          total += 1;
          if (x < -ATLAS_PAD || y < -ATLAS_PAD || x >= cellW + ATLAS_PAD || y >= cellH + ATLAS_PAD) continue;
          sum += image.data[((originY + y) * image.width + originX + x) * 4 + 3];
        }
      }
      vectors[g * 6 + c] = total ? sum / (total * 255) : 0;
    }
  }
  for (let c = 0; c < 6; c++) {
    let peak = 0;
    for (let g = 0; g < count; g++) peak = Math.max(peak, vectors[g * 6 + c]);
    if (peak > 0) for (let g = 0; g < count; g++) vectors[g * 6 + c] /= peak;
  }
  return vectors;
};

/* ── cipher look ──────────────────────────────────────────────────────── */
const CELL = 10;
const ASPECT = 0.72;
const OPT = {
  softness: 0.3,
  colored: 0.3,
  color: [0.22, 0.74, 0.97] as [number, number, number], // #38bdf8
  brightness: 1.08,
  legibility: 0.92,
  contrast: 1.15,
  exposure: 1.12,
  scramble: 0.24,
  scrambleSpeed: 7,
  edgeWidth: 0.16,
  edgeFlicker: 1,
  edgeGlow: 3.0,
  edgeTint: 0.85,
  aberration: 14,
  passthrough: 0.12,
  threshold: 0.028,
  bg: [4 / 255, 7 / 255, 12 / 255] as [number, number, number],
};

/* ── timeline (one-shot) ──────────────────────────────────────────────── */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mixf = (a: number, b: number, t: number) => a + (b - a) * t;

/* far corner is 828 px from the lock origin and softness 0.3 means only
   0.7·R is fully cleared → R must exceed ~1240 for the wave to finish */
const FRONT_R = 1290;

const timeline = (f: number) => {
  const armA = ss(96, 150, f);        // sender cipher spins up
  const waveA = ss(150, 420, f);      // encryption sweeps the sender panel
  const launch = ss(432, 500, f);     // packet forms at the sender edge
  const transit = ss(500, 740, f);    // packet crosses the tunnel
  const absorb = ss(758, 792, f);     // packet lands, is absorbed
  const armB = ss(792, 828, f);       // receiver cipher engages
  const waveB = ss(828, 1104, f);     // decryption opens the receiver panel
  const seal = ss(1116, 1176, f);     // delivered badge

  const flash = Math.max(
    0.65 * Math.pow(1 - clamp01(Math.abs(f - 150) / 24), 2),
    0.5 * Math.pow(1 - clamp01(Math.abs(f - 500) / 22), 2),
    Math.pow(1 - clamp01(Math.abs(f - ARRIVE) / 30), 2),
    0.6 * Math.pow(1 - clamp01(Math.abs(f - 1104) / 30), 2)
  );

  return {
    armA,
    waveA,
    radiusA: 26 + FRONT_R * waveA,
    launch,
    transit,
    packetX: mixf(742, 1178, transit),
    absorb,
    armB,
    waveB,
    radiusB: 26 + FRONT_R * waveB,
    seal,
    flash,
    channel: ss(432, 470, f) * (1 - 0.55 * ss(1116, 1176, f)),
    pipeline: (waveA + transit + waveB) / 3,
  };
};

/* ══════════════════════════════════════════════════════════════════════
   GL PLUMBING — two content states, one shader
   ══════════════════════════════════════════════════════════════════════ */
type Kit = {
  gl: WebGL2RenderingContext;
  cellProg: WebGLProgram;
  mainProg: WebGLProgram;
  cellU: Record<string, WebGLUniformLocation | null>;
  mainU: Record<string, WebGLUniformLocation | null>;
  contentTexA: WebGLTexture;
  contentTexB: WebGLTexture;
  cellTexA: WebGLTexture;
  cellTexB: WebGLTexture;
  shapeTex: WebGLTexture;
  atlasTex: WebGLTexture;
  fboA: WebGLFramebuffer;
  fboB: WebGLFramebuffer;
  buf: WebGLBuffer;
  cols: number;
  rows: number;
  glyphCount: number;
  atlasCols: number;
  atlasRows: number;
  atlasPad: [number, number];
  atlasInner: [number, number];
  cellsDone: boolean;
};

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.error('cipher shader:', gl.getShaderInfoLog(sh));
  }
  return sh;
};

const link = (gl: WebGL2RenderingContext, frag: string) => {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  const u: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(prog, i)!;
    u[info.name] = gl.getUniformLocation(prog, info.name);
  }
  return { prog, u };
};

const initKit = (
  canvas: HTMLCanvasElement,
  contentA: HTMLCanvasElement,
  contentB: HTMLCanvasElement
): Kit | null => {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: false,
    /* without this the headless screenshot can catch an already-cleared buffer */
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;

  const cell = link(gl, CELL_FRAG);
  const main = link(gl, MAIN_FRAG);

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const mkTex = (filter: number) => {
    const tx = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tx;
  };

  const contentTexA = mkTex(gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, contentA);
  const contentTexB = mkTex(gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, contentB);

  const glyphs = buildGlyphList(CHARSET);
  const cellH = ATLAS_CELL;
  const cellW = Math.max(Math.round(cellH * ASPECT), 8);
  const padW = cellW + ATLAS_PAD * 2;
  const padH = cellH + ATLAS_PAD * 2;
  const acols = Math.ceil(Math.sqrt(glyphs.length));
  const arows = Math.ceil(glyphs.length / acols);
  const surface = document.createElement('canvas');
  surface.width = acols * padW;
  surface.height = arows * padH;
  const actx = surface.getContext('2d')!;
  actx.clearRect(0, 0, surface.width, surface.height);
  actx.fillStyle = '#ffffff';
  actx.textAlign = 'center';
  actx.textBaseline = 'middle';
  const fontPx = Math.floor(Math.min(cellH * 0.92, cellW / 0.58));
  actx.font = `700 ${fontPx}px VxMono, ui-monospace, monospace`;
  for (let g = 0; g < glyphs.length; g++) {
    actx.fillText(glyphs[g], (g % acols) * padW + padW / 2, Math.floor(g / acols) * padH + padH / 2);
  }
  const image = actx.getImageData(0, 0, surface.width, surface.height);
  const vectors = glyphShapes(image, acols, cellW, cellH, glyphs.length);

  const atlasTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, atlasTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, surface);
  gl.generateMipmap(gl.TEXTURE_2D);

  const shapeTex = mkTex(gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, 6, glyphs.length, 0, gl.RED, gl.FLOAT, vectors);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

  const cw = CELL * ASPECT;
  const ch = CELL;
  const cols = Math.ceil(W / cw);
  const rows = Math.ceil(H / ch);
  const mkCellTarget = () => {
    const tex = mkTex(gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fbo };
  };
  const A = mkCellTarget();
  const B = mkCellTarget();

  return {
    gl,
    cellProg: cell.prog,
    mainProg: main.prog,
    cellU: cell.u,
    mainU: main.u,
    contentTexA,
    contentTexB,
    cellTexA: A.tex,
    cellTexB: B.tex,
    shapeTex,
    atlasTex,
    fboA: A.fbo,
    fboB: B.fbo,
    buf,
    cols,
    rows,
    glyphCount: glyphs.length,
    atlasCols: acols,
    atlasRows: arows,
    atlasPad: [ATLAS_PAD / padW, ATLAS_PAD / padH],
    atlasInner: [cellW / padW, cellH / padH],
    cellsDone: false,
  };
};

/* ── crisp overlay icons ──────────────────────────────────────────────── */
const LockIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
    <path d="M7 10.5V7.2C7 3.8 9.1 2 12 2s5 1.8 5 5.2v3.3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <rect x={4.4} y={10.5} width={15.2} height={11.6} rx={2.6} stroke={color} strokeWidth={2} />
  </svg>
);

const CheckIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
    <circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
    <path d="M7.5 12.2l3.1 3.1 5.9-6.8" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const f = Math.max(0, Math.min(DUR, frame));

  const glRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLCanvasElement>(null);
  const kitRef = useRef<Kit | null>(null);
  const contentARef = useRef<HTMLCanvasElement | null>(null);
  const contentBRef = useRef<HTMLCanvasElement | null>(null);

  const [ready, setReady] = useState(() => fontsLoaded);
  const [handle] = useState(() => delayRender('transfer-fonts'));

  useEffect(() => {
    if (fontsLoaded) {
      continueRender(handle);
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      fontsLoaded = true;
      setReady(true);
      continueRender(handle);
    };
    const t = setTimeout(finish, 3000);
    ensureFonts().then(finish, finish);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(
    () => () => {
      const k = kitRef.current;
      if (k) {
        k.gl.deleteTexture(k.contentTexA);
        k.gl.deleteTexture(k.contentTexB);
        k.gl.deleteTexture(k.cellTexA);
        k.gl.deleteTexture(k.cellTexB);
        k.gl.deleteTexture(k.shapeTex);
        k.gl.deleteTexture(k.atlasTex);
        k.gl.deleteFramebuffer(k.fboA);
        k.gl.deleteFramebuffer(k.fboB);
        k.gl.deleteProgram(k.cellProg);
        k.gl.deleteProgram(k.mainProg);
        k.gl.deleteBuffer(k.buf);
        kitRef.current = null;
      }
    },
    []
  );

  const T = useMemo(() => timeline(f), [f]);

  /* useLayoutEffect, no dependency array: Remotion seeks by re-rendering, so
     the draw has to happen on every render and before paint. */
  useLayoutEffect(() => {
    if (!ready) return;
    const out = glRef.current;
    if (!out) return;

    if (!contentARef.current) {
      const a = document.createElement('canvas');
      a.width = W;
      a.height = H;
      drawContent(a.getContext('2d')!, false);
      contentARef.current = a;
      const b = document.createElement('canvas');
      b.width = W;
      b.height = H;
      drawContent(b.getContext('2d')!, true);
      contentBRef.current = b;
    }
    if (!kitRef.current) {
      out.width = W;
      out.height = H;
      kitRef.current = initKit(out, contentARef.current, contentBRef.current!);
    }
    const k = kitRef.current;
    if (!k) return;
    const { gl } = k;
    const cw = CELL * ASPECT;
    const ch = CELL;

    /* both pages are static — the expensive glyph-matching pass runs once per
       content state, then every frame is just the cheap main pass */
    if (!k.cellsDone) {
      k.cellsDone = true;
      const passes: [WebGLTexture, WebGLFramebuffer][] = [
        [k.contentTexA, k.fboA],
        [k.contentTexB, k.fboB],
      ];
      gl.useProgram(k.cellProg);
      for (const [tex, fbo] of passes) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(k.cellU.uContent, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, k.shapeTex);
        gl.uniform1i(k.cellU.uShapes, 1);
        gl.uniform2f(k.cellU.uContentRes, W, H);
        gl.uniform2f(k.cellU.uCellPx, cw, ch);
        gl.uniform1i(k.cellU.uGlyphCount, k.glyphCount);
        gl.uniform1f(k.cellU.uContrast, OPT.contrast);
        gl.uniform1f(k.cellU.uExposure, OPT.exposure);
        gl.uniform1f(k.cellU.uThreshold, OPT.threshold);
        gl.uniform3f(k.cellU.uBg, OPT.bg[0], OPT.bg[1], OPT.bg[2]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, k.cols, k.rows);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /* the receiver's document exists only after the packet has landed */
    const late = f >= ARRIVE;
    const contentTex = late ? k.contentTexB : k.contentTexA;
    const cellTex = late ? k.cellTexB : k.cellTexA;

    const u = k.mainU;
    gl.useProgram(k.mainProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, contentTex);
    gl.uniform1i(u.uContent, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cellTex);
    gl.uniform1i(u.uCells, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, k.atlasTex);
    gl.uniform1i(u.uAtlas, 2);
    gl.uniform2f(u.uRes, W, H);
    gl.uniform2f(u.uCellPx, cw, ch);
    gl.uniform2f(u.uGrid, k.cols, k.rows);
    gl.uniform2f(u.uAtlasGrid, k.atlasCols, k.atlasRows);
    gl.uniform2f(u.uAtlasPad, k.atlasPad[0], k.atlasPad[1]);
    gl.uniform2f(u.uAtlasInner, k.atlasInner[0], k.atlasInner[1]);
    gl.uniform1i(u.uGlyphCount, k.glyphCount);
    gl.uniform2f(u.uPointerA, AX, AY);
    gl.uniform1f(u.uActiveA, T.armA);
    gl.uniform1f(u.uRadiusA, T.radiusA);
    gl.uniform2f(u.uPointerB, BX, BY);
    gl.uniform1f(u.uActiveB, T.armB);
    gl.uniform1f(u.uRadiusB, T.radiusB);
    gl.uniform1f(u.uSplitL, SPLIT_L);
    gl.uniform1f(u.uSplitR, SPLIT_R);
    gl.uniform1f(u.uSoftness, OPT.softness);
    gl.uniform1f(u.uColored, OPT.colored);
    gl.uniform3f(u.uColor, OPT.color[0], OPT.color[1], OPT.color[2]);
    gl.uniform1f(u.uBrightness, OPT.brightness);
    gl.uniform1f(u.uLegibility, OPT.legibility);
    gl.uniform1f(u.uScramble, OPT.scramble);
    gl.uniform1f(u.uScrambleSpeed, OPT.scrambleSpeed);
    gl.uniform1f(u.uEdgeWidth, OPT.edgeWidth);
    gl.uniform1f(u.uEdgeFlicker, OPT.edgeFlicker);
    gl.uniform1f(u.uEdgeGlow, OPT.edgeGlow);
    gl.uniform1f(u.uEdgeTint, OPT.edgeTint);
    gl.uniform1f(u.uAberration, OPT.aberration);
    gl.uniform1f(u.uPassthrough, OPT.passthrough);
    gl.uniform3f(u.uBg, OPT.bg[0], OPT.bg[1], OPT.bg[2]);
    gl.uniform1f(u.uTime, f / FPS);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const bl = bloomRef.current;
    if (bl) {
      const bc = bl.getContext('2d');
      if (bc) {
        bc.clearRect(0, 0, bl.width, bl.height);
        bc.drawImage(out, 0, 0, bl.width, bl.height);
      }
    }
  });

  /* ---- HUD state ---- */
  const pct = Math.round(T.pipeline * 100);
  const status =
    f < 96
      ? 'READY  ·  AWAITING DISPATCH'
      : f < 150
      ? 'INITIALISING CIPHER'
      : f < 432
      ? 'ENCRYPTING PAYLOAD'
      : f < 500
      ? 'PACKAGING  ·  RSA-4096 KEY WRAP'
      : f < 758
      ? 'IN TRANSIT  ·  TLS 1.3 TUNNEL'
      : f < 828
      ? 'ARRIVED  ·  INTEGRITY CHECK'
      : f < 1104
      ? 'DECRYPTING AT RECEIVER'
      : 'DELIVERED  ·  SIGNATURE VERIFIED';
  const statusCol = f < 96 ? C.amber : f >= 1104 ? C.green : C.ice;
  const breathe = 0.74 + 0.26 * Math.sin((f / FPS) * Math.PI * 0.8);
  const blink = f % 60 < 34 ? 1 : 0.45;

  const hud: React.CSSProperties = {
    position: 'absolute',
    fontFamily: 'VxMono, monospace',
    letterSpacing: 2,
    whiteSpace: 'pre',
  };

  /* packet ghosts: positions a few frames back along the same path */
  const transitAt = (ff: number) => ss(500, 740, ff);
  const pktAlpha = T.launch * (1 - T.absorb);
  const chunk = Math.min(12, Math.floor(T.transit * 12) + 1);
  const midRing = ss(614, 668, f);

  const steps: [string, number][] = [
    ['01  ENCRYPT', T.waveA],
    ['02  TRANSIT', T.transit],
    ['03  DECRYPT', T.waveB],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <canvas ref={glRef} width={W} height={H} style={{ position: 'absolute', width: W, height: H }} />
      <canvas
        ref={bloomRef}
        width={W / 2}
        height={H / 2}
        style={{
          position: 'absolute',
          width: W,
          height: H,
          filter: 'blur(22px)',
          mixBlendMode: 'screen',
          opacity: 0.3 + 0.16 * T.channel + 0.45 * T.flash,
          pointerEvents: 'none',
        }}
      />

      {/* corner brackets + transfer channel */}
      <svg width={W} height={H} style={{ position: 'absolute', pointerEvents: 'none' }}>
        {([
          [56, 44, 1, 1],
          [W - 56, 44, -1, 1],
          [56, H - 44, 1, -1],
          [W - 56, H - 44, -1, -1],
        ] as [number, number, number, number][]).map(([x, y, sx, sy], i) => (
          <path
            key={i}
            d={`M${x + sx * 44} ${y}H${x}V${y + sy * 44}`}
            fill="none"
            stroke={C.cyan}
            strokeWidth={2}
            opacity={0.34}
          />
        ))}

        <g opacity={T.channel}>
          <line
            x1={760}
            y1={516}
            x2={1160}
            y2={516}
            stroke={C.cyan}
            strokeWidth={1.6}
            opacity={0.4}
            strokeDasharray="10 14"
            strokeDashoffset={-((f * 1.6) % 24)}
          />
          <line
            x1={760}
            y1={564}
            x2={1160}
            y2={564}
            stroke={C.cyan}
            strokeWidth={1.6}
            opacity={0.4}
            strokeDasharray="10 14"
            strokeDashoffset={-((f * 1.6) % 24)}
          />
          <line x1={760} y1={516} x2={760} y2={564} stroke={C.cyan} strokeWidth={1.6} opacity={0.5} />
          <line x1={1160} y1={516} x2={1160} y2={564} stroke={C.cyan} strokeWidth={1.6} opacity={0.5} />
          <rect
            x={952}
            y={532}
            width={16}
            height={16}
            transform="rotate(45 960 540)"
            fill="none"
            stroke={C.cyan}
            strokeWidth={1.8}
            opacity={0.7}
          />
          {midRing > 0 && midRing < 1 && (
            <circle
              cx={960}
              cy={540}
              r={12 + midRing * 58}
              fill="none"
              stroke={C.ice}
              strokeWidth={1.8 * (1 - midRing)}
              opacity={0.8 * (1 - midRing)}
            />
          )}
        </g>
      </svg>

      {/* endpoint labels */}
      <div style={{ ...hud, left: LPX, top: 176, fontSize: 13, color: C.faint }}>
        <span style={{ color: T.waveA >= 1 ? C.cyan : C.amber }}>■ </span>
        ENDPOINT A  ·  SENDER
      </div>
      <div style={{ ...hud, right: W - RPX - PW, top: 176, fontSize: 13, color: C.faint, textAlign: 'right' }}>
        ENDPOINT B  ·  RECEIVER
        <span style={{ color: T.seal > 0.5 ? C.green : C.faint }}> ■</span>
      </div>

      {/* panel tags */}
      <div
        style={{
          ...hud,
          left: LPX,
          top: LPY + PH + 16,
          width: PW,
          textAlign: 'center',
          fontSize: 12,
          letterSpacing: 3,
          color: C.cyan,
          opacity: 0.75 * ss(430, 480, f),
        }}
      >
        ▣  ENCRYPTED AT REST
      </div>
      <div
        style={{
          ...hud,
          left: RPX,
          top: LPY + PH + 16,
          width: PW,
          textAlign: 'center',
          fontSize: 12,
          letterSpacing: 3,
          color: C.green,
          opacity: 0.75 * T.seal,
        }}
      >
        ✓  PLAINTEXT RESTORED  ·  ACCESS LOGGED
      </div>

      {/* receiving slot — crisp, fades out as the packet lands */}
      <div
        style={{
          position: 'absolute',
          left: RPX,
          top: LPY,
          width: PW,
          height: PH,
          border: `2px dashed rgba(56,189,248,${0.16 + 0.1 * blink})`,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          opacity: 1 - ss(758, 800, f),
          pointerEvents: 'none',
        }}
      >
        <svg width={44} height={44} viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
          <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5" stroke={C.cyan} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M4 19h16" stroke={C.cyan} strokeWidth={1.8} strokeLinecap="round" />
        </svg>
        <span style={{ ...hud, position: 'static', fontSize: 14, letterSpacing: 4, color: C.faint }}>
          AWAITING SECURE TRANSFER
        </span>
      </div>

      {/* the packet + ghost trail */}
      {pktAlpha > 0.01 && (
        <>
          {[3, 2, 1].map((g) => {
            const gx = mixf(742, 1178, transitAt(f - g * 7));
            return (
              <div
                key={g}
                style={{
                  position: 'absolute',
                  left: gx - 78,
                  top: 512,
                  width: 156,
                  height: 56,
                  borderRadius: 13,
                  background: `rgba(56,189,248,${0.05 * pktAlpha * (1 - g * 0.26)})`,
                  border: `1px solid rgba(56,189,248,${0.16 * pktAlpha * (1 - g * 0.26)})`,
                  pointerEvents: 'none',
                }}
              />
            );
          })}
          <div
            style={{
              position: 'absolute',
              left: T.packetX - 78,
              top: 512 + 4 * Math.sin((f / FPS) * Math.PI * 2 * 0.9),
              width: 156,
              height: 56,
              borderRadius: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'rgba(56,189,248,0.13)',
              border: '1.5px solid rgba(120,214,255,0.75)',
              boxShadow: `0 0 ${26 + 14 * T.flash}px rgba(56,189,248,0.65)`,
              opacity: pktAlpha,
              transform: `scale(${0.6 + 0.4 * T.launch})`,
              pointerEvents: 'none',
            }}
          >
            <LockIcon size={18} color={C.ice} />
            <span style={{ ...hud, position: 'static', fontSize: 13, fontWeight: 700, color: C.ice }}>
              ENC · 2.41 MB
            </span>
          </div>
        </>
      )}

      {/* transit telemetry */}
      <div
        style={{
          ...hud,
          left: 760,
          top: 596,
          width: 400,
          textAlign: 'center',
          fontSize: 12.5,
          color: C.faint,
          opacity: T.channel * (T.transit > 0 && T.transit < 1 ? 1 : 0.55) * (1 - T.seal),
        }}
      >
        {`CHUNK ${String(chunk).padStart(2, '0')}/12  ·  84 MB/S  ·  PKT 0x1F44`}
      </div>

      {/* top bar */}
      <div style={{ ...hud, left: 76, top: 48, display: 'flex', alignItems: 'center', gap: 14 }}>
        <LockIcon size={22} color={statusCol} />
        <span style={{ color: C.txt, fontWeight: 700, fontSize: 19 }}>SECURE FILE TRANSFER</span>
        <span style={{ color: C.faint, fontSize: 15 }}>merger_agreement_v7.pdf · 2.41 MB</span>
      </div>
      <div style={{ ...hud, right: 76, top: 54, color: C.faint, fontSize: 16, textAlign: 'right' }}>
        AES-256-GCM
        <span style={{ color: '#22323d' }}>{'   |   '}</span>
        TLS 1.3 · E2E
        <span style={{ color: '#22323d' }}>{'   |   '}</span>
        HSM
      </div>

      {/* bottom stepper */}
      <div style={{ ...hud, left: 460, bottom: 44, width: 1000 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 12,
            fontSize: 16,
          }}
        >
          <span
            style={{
              color: statusCol,
              fontWeight: 700,
              opacity: f < 96 ? blink : f >= 1104 ? breathe : 1,
            }}
          >
            {status}
          </span>
          <span style={{ color: C.txt, fontWeight: 700, fontSize: 20 }}>{String(pct).padStart(3, ' ')}%</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {steps.map(([label, fill], i) => (
            <div key={i} style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 3,
                  marginBottom: 8,
                  color: fill >= 1 ? C.cyan : fill > 0 ? C.ice : C.faint,
                  fontWeight: fill > 0 ? 700 : 400,
                }}
              >
                {label}
                {fill >= 1 ? '  ✓' : ''}
              </div>
              <div style={{ position: 'relative', height: 4, background: 'rgba(56,189,248,0.14)' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: 4,
                    width: `${fill * 100}%`,
                    background: `linear-gradient(90deg, #0f4c75, ${C.cyan} 76%, #d8f4ff)`,
                    boxShadow: '0 0 14px rgba(56,189,248,0.8)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* verification sweep over the delivered page */}
      <div
        style={{
          position: 'absolute',
          left: RPX,
          top: LPY,
          width: PW,
          height: PH,
          overflow: 'hidden',
          opacity: T.seal * 0.9,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: (((f - 1100) / 180) % 1) * PH - 80,
            width: PW,
            height: 160,
            background:
              'linear-gradient(180deg, rgba(74,222,128,0) 0%, rgba(74,222,128,0.07) 46%, rgba(190,255,214,0.18) 50%, rgba(74,222,128,0.07) 54%, rgba(74,222,128,0) 100%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* delivered badge over the receiver panel */}
      <AbsoluteFill
        style={{
          opacity: T.seal,
          pointerEvents: 'none',
          background:
            'radial-gradient(17% 16% at 77.3% 50%, rgba(2,7,12,0.92) 0%, rgba(2,7,12,0.66) 48%, rgba(2,7,12,0) 100%)',
        }}
      />
      <div
        style={{
          ...hud,
          left: RPX - 60,
          top: 512,
          width: PW + 120,
          display: 'flex',
          justifyContent: 'center',
          opacity: T.seal,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '13px 28px',
            border: `1.5px solid rgba(74,222,128,${0.28 + 0.42 * breathe})`,
            background: 'linear-gradient(180deg, #030e09, #020a07)',
            borderRadius: 30,
            boxShadow: `0 0 ${16 + 26 * breathe}px rgba(74,222,128,0.4)`,
          }}
        >
          <CheckIcon size={24} color={C.green} />
          <span style={{ color: '#d9ffe8', fontWeight: 700, fontSize: 21, letterSpacing: 3.6 }}>
            FILE DELIVERED
          </span>
          <span style={{ color: '#1d4a30' }}>·</span>
          <span style={{ color: C.dim, fontSize: 15 }}>SIGNATURE VERIFIED</span>
        </div>
      </div>

      {/* flashes */}
      <AbsoluteFill
        style={{
          background: `rgba(150,225,255,${0.09 * T.flash})`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      {/* scanlines + vignette */}
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(122% 98% at 50% 50%, rgba(0,0,0,0) 46%, rgba(1,4,8,0.48) 80%, rgba(0,2,4,0.9) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
