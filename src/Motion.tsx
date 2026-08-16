import React, { useMemo } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

/* ══════════════════════════════════════════════════════════════════════════
   NEON BLUE PARTICLE DRIFT — abstract background loop
   1920×1080 · 60 fps · 1200 frames (20 s) · perfect loop
   Every cycle (drift, sway, wobble, twinkle, beam, clouds) has an INTEGER
   frequency per loop, so frame 1200 ≡ frame 0 by construction.
   ══════════════════════════════════════════════════════════════════════════ */

const W = 1920;
const H = 1080;
const DUR = 1200;

/* ── palette ──────────────────────────────────────────────────────────── */
const C = {
  bg: '#00030f',
  ice: '#c8e8ff',
  hot: '#ffffff',
};

const LAYER = [
  /* 0 far  */ {
    cols: ['#1546f0', '#2a7bff', '#4a5cff'],
    corridor: 430, wid: [1.3, 2.2], len: [10, 30], op: [0.26, 0.5], blur: 1.6,
  },
  /* 1 mid  */ {
    cols: ['#1f6cff', '#2f9dff', '#5f6cff'],
    corridor: 720, wid: [2.0, 3.2], len: [20, 62], op: [0.42, 0.78], blur: 0.95,
  },
  /* 2 near */ {
    cols: ['#4fc4ff', '#9fdcff', '#6f8cff'],
    corridor: 1180, wid: [2.9, 5.0], len: [40, 122], op: [0.6, 1.0], blur: 1.15,
  },
];
const COUNT = [340, 285, 155];

/* ── helpers ──────────────────────────────────────────────────────────── */
const TAU = Math.PI * 2;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rr = (seed: string, a: number, b: number) => lerp(a, b, random(seed));
const pick = <T,>(seed: string, arr: T[]) => arr[Math.floor(random(seed) * arr.length)];

/* 8-point sparkle: long cardinal spikes, short diagonals */
const starPath = (R: number, dR: number, r: number) => {
  let d = '';
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const rad = i % 2 === 1 ? r : i % 4 === 0 ? R : dR;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  return d + 'Z';
};

/* ── particle model ───────────────────────────────────────────────────── */
type Rod = {
  L: number;
  x0: number;
  y0: number;
  u0: number;
  k: number;
  len: number;
  w: number;
  op: number;
  ci: number;
  swA: number;
  swK: number;
  swP: number;
  wbA: number;
  wbK: number;
  wbP: number;
  twK: number;
  twP: number;
  tipUp: boolean;
};

const useRods = () =>
  useMemo(() => {
    const out: Rod[] = [];
    let n = 0;
    for (let L = 0; L < 3; L++) {
      const cfg = LAYER[L];
      for (let i = 0; i < COUNT[L]; i++, n++) {
        const s = `r${L}_${i}`;
        const acc = random(s + 'ac') > 0.84;
        out.push({
          L,
          x0: rr(s + 'x', -60, W + 60),
          y0: rr(s + 'y', -120, H + 120),
          u0: random(s + 'u'),
          k: random(s + 'k') > 0.72 ? 2 : 1,
          len: lerp(cfg.len[0], cfg.len[1], Math.pow(random(s + 'l'), 2.1)),
          w: rr(s + 'w', cfg.wid[0], cfg.wid[1]),
          op: rr(s + 'o', cfg.op[0], cfg.op[1]) * (acc ? 1.2 : 1),
          ci: acc ? 2 : Math.floor(random(s + 'ci') * 2),
          swA: rr(s + 'sa', 5, 8 + L * 11),
          swK: pick(s + 'sk', [1, 1, 2, 3]),
          swP: random(s + 'sp'),
          wbA: rr(s + 'wa', 3, 6 + L * 5),
          wbK: pick(s + 'wk', [1, 2, 2, 3]),
          wbP: random(s + 'wp'),
          twK: pick(s + 'tk', [2, 3, 3, 4, 5, 6]),
          twP: random(s + 'tp'),
          tipUp: random(s + 'tu') > 0.55,
        });
      }
    }
    return out;
  }, []);

/* envelope: fade in / plateau / fade out across one cycle */
const env = (u: number) => smooth(u / 0.15) * (1 - smooth((u - 0.85) / 0.15));

/* soft glow falloff: [widthMultiplier, alpha] — many gentle steps read as
   light, three hard steps read as an outlined capsule */
const FALLOFF: [number, number][] = [
  [6.4, 0.045],
  [4.0, 0.07],
  [2.5, 0.1],
  [1.6, 0.19],
  [1.05, 0.42],
  [0.62, 0.9],
];

const NLV = 8;   // opacity quantisation levels
const NWB = 3;   // width bins
const NCB = 3;   // colour bins

const Rods: React.FC<{ t: number; layer: number }> = ({ t, layer }) => {
  const rods = useRods();
  const cfg = LAYER[layer];

  const buckets = useMemo(() => {
    const N = NCB * NWB * NLV;
    const core: string[] = new Array(N).fill('');
    const tip: string[] = new Array(N).fill('');
    const wSpan = cfg.wid[1] - cfg.wid[0];
    for (const p of rods) {
      if (p.L !== layer) continue;
      const u = (p.u0 + t * p.k) % 1;
      const e = env(u);
      if (e <= 0.002) continue;
      const tw = 0.6 + 0.4 * Math.sin(TAU * (p.twK * t + p.twP));
      const o = p.op * e * tw;
      if (o <= 0.014) continue;
      const x = p.x0 + p.swA * Math.sin(TAU * (p.swK * t + p.swP));
      const y = p.y0 - u * cfg.corridor + p.wbA * Math.sin(TAU * (p.wbK * t + p.wbP));
      const lv = Math.min(NLV - 1, Math.floor(o * NLV));
      const wb = Math.min(NWB - 1, Math.floor(((p.w - cfg.wid[0]) / wSpan) * NWB));
      const b = (p.ci * NWB + wb) * NLV + lv;
      const xs = x.toFixed(1);
      const half = p.len / 2;
      core[b] += `M${xs} ${(y - half).toFixed(1)}V${(y + half).toFixed(1)}`;
      tip[b] += p.tipUp
        ? `M${xs} ${(y - half).toFixed(1)}V${(y - half * 0.3).toFixed(1)}`
        : `M${xs} ${(y + half * 0.3).toFixed(1)}V${(y + half).toFixed(1)}`;
    }
    return { core, tip };
  }, [rods, t, layer, cfg]);

  const wOf = (wb: number) => lerp(cfg.wid[0], cfg.wid[1], (wb + 0.5) / NWB);
  const colOf = (b: number) => cfg.cols[Math.floor(b / (NWB * NLV))];
  const wbOf = (b: number) => Math.floor(b / NLV) % NWB;
  const opOf = (b: number) => ((b % NLV) + 0.6) / NLV;

  return (
    <g style={cfg.blur ? { filter: `blur(${cfg.blur}px)` } : undefined}>
      {FALLOFF.map(([mul, alpha], si) =>
        buckets.core.map((d, b) =>
          d ? (
            <path
              key={`s${si}_${b}`}
              d={d}
              stroke={colOf(b)}
              strokeWidth={wOf(wbOf(b)) * mul}
              strokeLinecap="round"
              fill="none"
              opacity={opOf(b) * alpha}
            />
          ) : null
        )
      )}
      {buckets.tip.map((d, b) =>
        d ? (
          <path key={`t${b}`} d={d} stroke={C.ice} strokeWidth={wOf(wbOf(b)) * 0.7} strokeLinecap="round" fill="none" opacity={opOf(b) * 0.78} />
        ) : null
      )}
    </g>
  );
};

/* ── dust: tiny twinkling points ──────────────────────────────────────── */
type Dust = { x0: number; y0: number; u0: number; r: number; op: number; ci: number; swA: number; swK: number; swP: number; twK: number; twP: number };
const DUST_COLS = ['#2a7bff', '#5fc8ff', '#cfeaff'];
const useDust = () =>
  useMemo<Dust[]>(
    () =>
      Array.from({ length: 420 }, (_, i) => {
        const s = `du${i}`;
        return {
          x0: rr(s + 'x', -40, W + 40),
          y0: rr(s + 'y', -120, H + 120),
          u0: random(s + 'u'),
          r: rr(s + 'r', 0.9, 2.6),
          op: rr(s + 'o', 0.3, 0.95),
          ci: Math.floor(random(s + 'c') * 3),
          swA: rr(s + 'sa', 6, 26),
          swK: pick(s + 'sk', [1, 2, 3]),
          swP: random(s + 'sp'),
          twK: pick(s + 'tk', [2, 3, 4, 5, 6, 7]),
          twP: random(s + 'tp'),
        };
      }),
    []
  );

const DustField: React.FC<{ t: number }> = ({ t }) => {
  const dust = useDust();
  const buckets = useMemo(() => {
    const N = 3 * NLV;
    const out: string[] = new Array(N).fill('');
    for (const p of dust) {
      const u = (p.u0 + t) % 1;
      const e = env(u);
      if (e <= 0.004) continue;
      const tw = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(TAU * (p.twK * t + p.twP)), 1.6);
      const o = p.op * e * tw;
      if (o <= 0.02) continue;
      const x = p.x0 + p.swA * Math.sin(TAU * (p.swK * t + p.swP));
      const y = p.y0 - u * 560;
      const lv = Math.min(NLV - 1, Math.floor(o * NLV));
      out[p.ci * NLV + lv] += `M${x.toFixed(1)} ${y.toFixed(1)}h.01`;
    }
    return out;
  }, [dust, t]);

  return (
    <g>
      {buckets.map((d, b) =>
        d ? (
          <path
            key={b}
            d={d}
            stroke={DUST_COLS[Math.floor(b / NLV)]}
            strokeWidth={3.4}
            strokeLinecap="round"
            fill="none"
            opacity={(((b % NLV) + 0.6) / NLV) * 0.85}
          />
        ) : null
      )}
      {buckets.map((d, b) =>
        d ? (
          <path
            key={`g${b}`}
            d={d}
            stroke={DUST_COLS[Math.floor(b / NLV)]}
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
            opacity={(((b % NLV) + 0.6) / NLV) * 0.12}
          />
        ) : null
      )}
    </g>
  );
};

/* ── accent rods (bright, individually coloured) ──────────────────────── */
type Accent = { x0: number; y0: number; u0: number; k: number; len: number; w: number; col: string; op: number; swA: number; swK: number; swP: number; twK: number; twP: number };
const useAccents = () =>
  useMemo<Accent[]>(() => {
    const cols = ['#cfeaff', '#5fcaff', '#ffffff', '#7f9cff'];
    return Array.from({ length: 34 }, (_, i) => {
      const s = `a${i}`;
      return {
        x0: rr(s + 'x', -40, W + 40),
        y0: rr(s + 'y', -100, H + 100),
        u0: random(s + 'u'),
        k: 1,
        len: rr(s + 'l', 60, 190),
        w: rr(s + 'w', 2.6, 5.4),
        col: pick(s + 'c', cols),
        op: rr(s + 'o', 0.55, 1),
        swA: rr(s + 'sa', 8, 30),
        swK: pick(s + 'sk', [1, 2]),
        swP: random(s + 'sp'),
        twK: pick(s + 'tk', [2, 3, 4]),
        twP: random(s + 'tp'),
      };
    });
  }, []);

const Accents: React.FC<{ t: number }> = ({ t }) => {
  const acc = useAccents();
  return (
    <g>
      {acc.map((p, i) => {
        const u = (p.u0 + t * p.k) % 1;
        const e = env(u);
        if (e <= 0.004) return null;
        const tw = 0.6 + 0.4 * Math.sin(TAU * (p.twK * t + p.twP));
        const o = p.op * e * tw;
        const x = p.x0 + p.swA * Math.sin(TAU * (p.swK * t + p.swP));
        const y = p.y0 - u * 1180;
        return (
          <g key={i} opacity={o} style={{ filter: 'blur(0.9px)' }}>
            {FALLOFF.map(([mul, alpha], si) => (
              <line
                key={si}
                x1={x}
                y1={y - p.len / 2}
                x2={x}
                y2={y + p.len / 2}
                stroke={p.col}
                strokeWidth={p.w * mul}
                strokeLinecap="round"
                opacity={alpha}
              />
            ))}
            <line
              x1={x}
              y1={y + p.len * 0.16}
              x2={x}
              y2={y + p.len / 2}
              stroke={C.hot}
              strokeWidth={p.w * 0.55}
              strokeLinecap="round"
              opacity={0.75}
            />
          </g>
        );
      })}
    </g>
  );
};

/* ── sparkle glints ───────────────────────────────────────────────────── */
const STAR = starPath(100, 30, 8);
type Star = { x0: number; y0: number; u0: number; s: number; rot: number; twK: number; twP: number; swA: number; swK: number; swP: number };
const useStars = () =>
  useMemo<Star[]>(
    () =>
      Array.from({ length: 78 }, (_, i) => {
        const s = `s${i}`;
        return {
          x0: rr(s + 'x', 40, W - 40),
          y0: rr(s + 'y', -80, H + 80),
          u0: random(s + 'u'),
          s: lerp(0.11, 0.92, Math.pow(random(s + 's'), 2.3)),
          rot: rr(s + 'r', -14, 14),
          twK: pick(s + 'tk', [2, 3, 4, 5]),
          twP: random(s + 'tp'),
          swA: rr(s + 'sa', 8, 26),
          swK: pick(s + 'sk', [1, 2]),
          swP: random(s + 'sp'),
        };
      }),
    []
  );

const Stars: React.FC<{ t: number }> = ({ t }) => {
  const stars = useStars();
  return (
    <g>
      {stars.map((p, i) => {
        const u = (p.u0 + t) % 1;
        const e = env(u);
        if (e <= 0.004) return null;
        const tw = 0.46 + 0.54 * Math.pow(0.5 + 0.5 * Math.sin(TAU * (p.twK * t + p.twP)), 1.6);
        const x = p.x0 + p.swA * Math.sin(TAU * (p.swK * t + p.swP));
        const y = p.y0 - u * 1180;
        const sc = p.s * (0.78 + 0.22 * tw);
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${p.rot}) scale(${sc.toFixed(3)})`} opacity={e * tw}>
            <circle r={68} fill="url(#glintHalo)" />
            <path d={STAR} fill="url(#glintCore)" />
            <circle r={5.5} fill={C.hot} />
          </g>
        );
      })}
    </g>
  );
};

/* ── bokeh (out-of-focus depth) ───────────────────────────────────────── */
type Bok = { x0: number; y0: number; u0: number; r: number; op: number; swA: number; swK: number; swP: number; brK: number; brP: number };
const useBokeh = () =>
  useMemo<Bok[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const s = `b${i}`;
        return {
          x0: rr(s + 'x', -80, W + 80),
          y0: rr(s + 'y', -140, H + 140),
          u0: random(s + 'u'),
          r: rr(s + 'r', 16, 62),
          op: rr(s + 'o', 0.25, 0.7),
          swA: rr(s + 'sa', 10, 40),
          swK: pick(s + 'sk', [1, 2]),
          swP: random(s + 'sp'),
          brK: pick(s + 'bk', [1, 2, 3]),
          brP: random(s + 'bp'),
        };
      }),
    []
  );

const Bokeh: React.FC<{ t: number }> = ({ t }) => {
  const bok = useBokeh();
  return (
    <g>
      {bok.map((p, i) => {
        const u = (p.u0 + t) % 1;
        const e = env(u);
        if (e <= 0.004) return null;
        const br = 0.6 + 0.4 * Math.sin(TAU * (p.brK * t + p.brP));
        const x = p.x0 + p.swA * Math.sin(TAU * (p.swK * t + p.swP));
        const y = p.y0 - u * 620;
        const r = p.r * (0.92 + 0.08 * br);
        return (
          <g key={i} opacity={p.op * e * br}>
            <circle cx={x} cy={y} r={r} fill="url(#bokehFill)" />
            <circle cx={x} cy={y} r={r * 0.97} fill="url(#bokehRing)" opacity={0.45} />
          </g>
        );
      })}
    </g>
  );
};

/* ── nebula clouds ────────────────────────────────────────────────────── */
type Cloud = { x: number; y: number; rx: number; ry: number; op: number; dxA: number; dxK: number; dxP: number; dyA: number; dyK: number; dyP: number; bK: number; bP: number; g: string };
const useClouds = () =>
  useMemo<Cloud[]>(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const s = `c${i}`;
        return {
          x: rr(s + 'x', 180, W - 180),
          y: rr(s + 'y', 120, H - 60),
          rx: rr(s + 'rx', 320, 720),
          ry: rr(s + 'ry', 180, 380),
          op: rr(s + 'o', 0.3, 0.85),
          dxA: rr(s + 'dxa', 26, 90),
          dxK: pick(s + 'dxk', [1, 2]),
          dxP: random(s + 'dxp'),
          dyA: rr(s + 'dya', 18, 60),
          dyK: pick(s + 'dyk', [1, 2]),
          dyP: random(s + 'dyp'),
          bK: pick(s + 'bk', [1, 2]),
          bP: random(s + 'bp'),
          g: random(s + 'g') > 0.6 ? 'cloudB' : 'cloudA',
        };
      }),
    []
  );

const Clouds: React.FC<{ t: number }> = ({ t }) => {
  const cl = useClouds();
  return (
    <g>
      {cl.map((c, i) => {
        const x = c.x + c.dxA * Math.sin(TAU * (c.dxK * t + c.dxP));
        const y = c.y + c.dyA * Math.sin(TAU * (c.dyK * t + c.dyP));
        const b = 0.62 + 0.38 * Math.sin(TAU * (c.bK * t + c.bP));
        return <ellipse key={i} cx={x} cy={y} rx={c.rx} ry={c.ry} fill={`url(#${c.g})`} opacity={c.op * b} />;
      })}
    </g>
  );
};

/* ── anamorphic light beam ────────────────────────────────────────────── */
const BEAM_Y = 824;

const Beam: React.FC<{ t: number }> = ({ t }) => {
  const p1 = 0.5 + 0.5 * Math.sin(TAU * (2 * t + 0.12));
  const p2 = 0.5 + 0.5 * Math.sin(TAU * (3 * t + 0.61));
  const breathe = 0.72 + 0.28 * p1;
  const coreW = 330 + 110 * p2;
  const hotX = 960 + 120 * Math.sin(TAU * (1 * t + 0.3));

  return (
    <g>
      <ellipse cx={960} cy={BEAM_Y} rx={980} ry={118} fill="url(#beamHalo)" opacity={0.5 * breathe} />
      <ellipse cx={960} cy={BEAM_Y} rx={660} ry={22} fill="url(#beamMid)" opacity={0.72 * breathe} />
      <rect x={0} y={BEAM_Y - 1} width={W} height={2} fill="url(#beamLine)" opacity={0.2 * breathe} />
      <ellipse cx={hotX} cy={BEAM_Y} rx={coreW * 0.78} ry={4} fill="url(#beamCore)" opacity={0.88} />
      <ellipse cx={hotX} cy={BEAM_Y} rx={coreW * 0.3} ry={1.6} fill={C.hot} opacity={0.8 * breathe} />
      <ellipse cx={hotX} cy={BEAM_Y} rx={74} ry={30} fill="url(#beamSpot)" opacity={0.8 * breathe} />
      <ellipse cx={hotX} cy={BEAM_Y} rx={26} ry={3.2} fill={C.hot} opacity={0.55 + 0.35 * p2} />
    </g>
  );
};

/* ── SVG defs ─────────────────────────────────────────────────────────── */
const Defs: React.FC = () => (
  <defs>
    <radialGradient id="glintCore">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
      <stop offset="10%" stopColor="#eaf7ff" stopOpacity="0.95" />
      <stop offset="30%" stopColor="#7fd2ff" stopOpacity="0.6" />
      <stop offset="62%" stopColor="#2f86ff" stopOpacity="0.26" />
      <stop offset="100%" stopColor="#123ce0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="glintHalo">
      <stop offset="0%" stopColor="#7fd2ff" stopOpacity="0.44" />
      <stop offset="42%" stopColor="#2270ff" stopOpacity="0.18" />
      <stop offset="100%" stopColor="#0e2ec0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="bokehFill">
      <stop offset="0%" stopColor="#2a7bff" stopOpacity="0.075" />
      <stop offset="68%" stopColor="#1450e8" stopOpacity="0.035" />
      <stop offset="100%" stopColor="#0a2a9f" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="bokehRing">
      <stop offset="0%" stopColor="#7fd0ff" stopOpacity="0" />
      <stop offset="66%" stopColor="#3f9cff" stopOpacity="0.03" />
      <stop offset="91%" stopColor="#7fd2ff" stopOpacity="0.055" />
      <stop offset="100%" stopColor="#7fd2ff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="cloudA">
      <stop offset="0%" stopColor="#0f45e8" stopOpacity="0.34" />
      <stop offset="52%" stopColor="#0a2fb4" stopOpacity="0.16" />
      <stop offset="100%" stopColor="#04166e" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="cloudB">
      <stop offset="0%" stopColor="#2a8cff" stopOpacity="0.24" />
      <stop offset="46%" stopColor="#1050ee" stopOpacity="0.11" />
      <stop offset="100%" stopColor="#06197e" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="beamHalo">
      <stop offset="0%" stopColor="#63b0ff" stopOpacity="0.52" />
      <stop offset="34%" stopColor="#1f74ff" stopOpacity="0.26" />
      <stop offset="70%" stopColor="#0e40e0" stopOpacity="0.09" />
      <stop offset="100%" stopColor="#061c96" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="beamMid">
      <stop offset="0%" stopColor="#cfe6ff" stopOpacity="0.85" />
      <stop offset="30%" stopColor="#6aa8ff" stopOpacity="0.5" />
      <stop offset="72%" stopColor="#3160ee" stopOpacity="0.18" />
      <stop offset="100%" stopColor="#1a35a8" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="beamCore">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
      <stop offset="26%" stopColor="#dcefff" stopOpacity="0.85" />
      <stop offset="66%" stopColor="#7fb6ff" stopOpacity="0.35" />
      <stop offset="100%" stopColor="#4f8dff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="beamSpot">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
      <stop offset="24%" stopColor="#d6ecff" stopOpacity="0.5" />
      <stop offset="60%" stopColor="#69a6ff" stopOpacity="0.16" />
      <stop offset="100%" stopColor="#3f7dff" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="beamLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#3f8dff" stopOpacity="0" />
      <stop offset="18%" stopColor="#6aa8ff" stopOpacity="0.5" />
      <stop offset="50%" stopColor="#dcefff" stopOpacity="0.95" />
      <stop offset="82%" stopColor="#6aa8ff" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#3f8dff" stopOpacity="0" />
    </linearGradient>
  </defs>
);

/* ══════════════════════════════════════════════════════════════════════
   SCENE
   ══════════════════════════════════════════════════════════════════════ */
const Scene: React.FC<{ t: number; bloom?: boolean }> = ({ t, bloom }) => (
  <AbsoluteFill>
    {!bloom && (
      <>
        <AbsoluteFill style={{ background: C.bg }} />
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(86% 66% at 50% 78%, rgba(20,84,255,0.66) 0%, rgba(10,44,205,0.4) 34%, rgba(2,6,46,0) 76%)',
          }}
        />
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(80% 70% at 50% 42%, rgba(16,60,235,0.46) 0%, rgba(8,28,150,0.22) 48%, rgba(1,3,30,0) 82%)',
          }}
        />
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, rgba(0,1,10,0.34) 0%, rgba(0,1,10,0.08) 28%, rgba(0,1,10,0) 54%)',
          }}
        />
      </>
    )}

    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
      <Defs />
      {!bloom && <Clouds t={t} />}
      <Rods t={t} layer={0} />
      <DustField t={t} />
      <Bokeh t={t} />
      <Rods t={t} layer={1} />
      <Beam t={t} />
      <Rods t={t} layer={2} />
      <Accents t={t} />
      <Stars t={t} />
    </svg>
  </AbsoluteFill>
);

/* ── film grain + vignette ────────────────────────────────────────────── */
const Fx: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={W} height={H} style={{ position: 'absolute', opacity: 0.05, mixBlendMode: 'overlay' }}>
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 8} stitchTiles="stitch" />
      </filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(132% 108% at 50% 58%, rgba(0,0,0,0) 48%, rgba(0,1,10,0.26) 80%, rgba(0,0,6,0.62) 100%)',
      }}
    />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const f = ((frame % DUR) + DUR) % DUR;
  const t = f / DUR;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <Scene t={t} />
      <AbsoluteFill style={{ filter: 'blur(8px)', mixBlendMode: 'screen', opacity: 0.56, pointerEvents: 'none' }}>
        <Scene t={t} bloom />
      </AbsoluteFill>
      <AbsoluteFill style={{ filter: 'blur(38px)', mixBlendMode: 'screen', opacity: 0.4, pointerEvents: 'none' }}>
        <Scene t={t} bloom />
      </AbsoluteFill>
      <Fx f={f} />
    </AbsoluteFill>
  );
};
