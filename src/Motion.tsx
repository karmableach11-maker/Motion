import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  delayRender,
  continueRender,
} from 'remotion';

/* ============================================================================
   AI NEURAL NETWORK — THINKING CORE
   Premium microstock motion graphic. 1920x1080 @ 60fps, 900 frames (15s).
   Brain silhouette: Fluent Emoji (Microsoft) high-contrast "brain", MIT license.
   Self-contained: brain path inlined; core Remotion + SVG + CSS only.
   ========================================================================== */

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const NUM = {fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"'} as const;

// Fluent Emoji high-contrast "brain" (MIT) — viewBox 0 0 32 32
const BRAIN_PATHS = [
  'M20.505 7.286a1 1 0 0 1-1.414 0A2.94 2.94 0 0 0 17 6.421c-.82 0-1.553.329-2.091.865a.999.999 0 1 1-1.414-1.414A4.95 4.95 0 0 1 17 4.421a4.95 4.95 0 0 1 3.505 1.451a1 1 0 0 1 0 1.414M8.894 6.331a10 10 0 0 0-2.369 1.923l-.001.001a10 10 0 0 0-1.683 2.558a9.9 9.9 0 0 0-.835 3.028a1 1 0 1 0 1.988.22a8 8 0 0 1 .667-2.418a8 8 0 0 1 3.242-3.585a1 1 0 1 0-1.009-1.727M24 17.5a1 1 0 0 1 2 0a3.494 3.494 0 0 1-3.358 3.486c.223.459.358.969.358 1.514a1 1 0 0 1-2 0a1.5 1.5 0 0 0-1.5-1.5h-6.182a1 1 0 0 1 0-2H15.5a1.503 1.503 0 0 0 1.5-1.5a1 1 0 0 1 2 0c0 .539-.132 1.044-.35 1.5h3.85a1.503 1.503 0 0 0 1.5-1.5',
  'M32 16.711c0-.628-.045-1.236-.114-1.826C30.979 7.067 24.348 1.002 16.289 1h-1.232C6.74 1.001.001 7.74 0 16.057A5.943 5.943 0 0 0 5.943 22h1.241a6.494 6.494 0 0 0 6.316 5h7.104l3.116 3.116a.75.75 0 0 0 1.28-.53v-2.669a7.99 7.99 0 0 0 6.664-5.631c.143-.478.225-.982.277-1.495l.003-.008c.028-.092.056-.183.056-.283q-.001-.092-.008-.182l-.007-.115q.001-.048.007-.093Q32 19.055 32 19zm-2.252 4.004A6 6 0 0 1 24 25H13.5a4.5 4.5 0 0 1-4.479-4.09l-.006-.064A4.974 4.974 0 0 1 14 16a1 1 0 0 0 0-2a7 7 0 0 0-3.36.859a4 4 0 0 0-.812-1.188a.999.999 0 1 0-1.414 1.414c.284.285.477.65.55 1.059A7 7 0 0 0 7.08 20H5.943a3.93 3.93 0 0 1-2.789-1.155A3.93 3.93 0 0 1 2 16.057c0-3.609 1.46-6.867 3.824-9.233A13 13 0 0 1 15.057 3h1.232c6.69-.002 12.246 4.8 13.451 11.139a7.5 7.5 0 0 0-4.03-2.033c.503-.922.79-1.981.79-3.106a1 1 0 0 0-2 0a4.48 4.48 0 0 1-1.318 3.182A4.48 4.48 0 0 1 20 13.5a1 1 0 0 0 0 2a6.47 6.47 0 0 0 4.215-1.558l.016.005A1 1 0 0 0 24.5 14c1.522 0 2.891.614 3.889 1.611a5.48 5.48 0 0 1 1.596 3.592a6 6 0 0 1-.237 1.512',
];

// Solid outer silhouette (outer contour of the brain), used for clip + body fill
const SOLID_BRAIN = BRAIN_PATHS[1].split('z')[0] + 'z';

// Brain placement in 1920x1080
const BS = 20; // scale
const BTX = 640;
const BTY = 180;
const CX = 960;
const CY = 500;
const BRAIN_TRANSFORM = `translate(${BTX},${BTY}) scale(${BS})`;

const eOut = Easing.out(Easing.cubic);
const eExpo = Easing.bezier(0.16, 1, 0.3, 1);
const eInOut = Easing.inOut(Easing.cubic);

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (f: number, a: number, b: number, e = eExpo) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ---- node + edge generation (deterministic) ------------------------------ */
type Node = {x: number; y: number; z: number; d: number; seed: number};
const NODES: Node[] = (() => {
  const r = mulberry32(7133);
  const bx: [number, number] = [672, 1248];
  const by: [number, number] = [216, 812];
  const out: Node[] = [];
  for (let i = 0; i < 118; i++) {
    const x = bx[0] + r() * (bx[1] - bx[0]);
    const y = by[0] + r() * (by[1] - by[0]);
    out.push({x, y, z: r() * 2 - 1, d: Math.hypot(x - CX, y - CY), seed: r()});
  }
  return out;
})();
type Edge = {a: number; b: number; len: number; mid: number; phase: number};
const EDGES: Edge[] = (() => {
  const r = mulberry32(9021);
  const out: Edge[] = [];
  for (let i = 0; i < NODES.length; i++) {
    const near: [number, number][] = [];
    for (let j = 0; j < NODES.length; j++) {
      if (i === j) continue;
      const dd = Math.hypot(NODES[i].x - NODES[j].x, NODES[i].y - NODES[j].y);
      if (dd < 118) near.push([dd, j]);
    }
    near.sort((p, q) => p[0] - q[0]);
    near.slice(0, 3).forEach(([dd, j]) => {
      if (i < j) {
        const mid = (NODES[i].d + NODES[j].d) / 2;
        out.push({a: i, b: j, len: dd, mid, phase: r()});
      }
    });
  }
  return out;
})();
const MAXD = Math.max(...NODES.map((n) => n.d));

/* ---- particles streaming into the core ----------------------------------- */
const PARTS = (() => {
  const r = mulberry32(555);
  return Array.from({length: 30}, () => {
    const ang = r() * Math.PI * 2;
    const rad = 430 + r() * 260;
    return {sx: CX + Math.cos(ang) * rad, sy: CY + Math.sin(ang) * rad * 0.8, phase: r(), speed: 0.6 + r() * 0.7};
  });
})();

/* ---- starfield ----------------------------------------------------------- */
const STARS = (() => {
  const r = mulberry32(4242);
  return Array.from({length: 70}, () => ({x: r() * 1920, y: r() * 1080, s: 0.6 + r() * 1.8, ph: r() * 6.28, sp: 0.4 + r() * 0.8}));
})();

const LABELS = [
  {x: 812, y: 388, t: 'activation 0.94'},
  {x: 1096, y: 372, t: 'layer 07'},
  {x: 1150, y: 560, t: 'inference'},
  {x: 772, y: 556, t: 'synapse'},
  {x: 960, y: 300, t: 'processing'},
];

const T = {
  auraIn: 4,
  outlineDraw: 24,
  outlineEnd: 150,
  bodyIn: 92,
  nodesStart: 128,
  edgesStart: 168,
  edgesEnd: 336,
  coreIgnite: 250,
  signalsStart: 300,
  actStart: 360,
  actEnd: 520,
  settle: 742,
};

/* camera parallax angle */
const camAngle = (f: number) => Math.sin(f / 150) + Math.sin(f / 380) * 0.4;
const nodeDisp = (n: Node, f: number) => {
  const cam = camAngle(f);
  return {x: n.x + n.z * 30 * cam, y: n.y + n.z * 10 * Math.sin(f / 210)};
};
// activation wave: expands from core through the layers, repeats during activation
const waveBoost = (d: number, f: number) => {
  if (f < T.signalsStart) return 0;
  const t = (f - T.signalsStart) / 150;
  let boost = 0;
  for (let k = 0; k < 3; k++) {
    const wp = ((t + k * 0.4) % 1.35) * MAXD;
    const dist = Math.abs(d - wp);
    boost = Math.max(boost, Math.exp(-(dist * dist) / (2 * 60 * 60)));
  }
  const intensity = f >= T.actStart && f <= T.actEnd ? 1 : f < T.actStart ? 0.5 : 0.62;
  return boost * intensity;
};

/* ============================================================================
   BACKGROUND
   ========================================================================== */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const aura = ease(frame, T.auraIn, 80, eOut);
  const breathe = 0.5 + 0.5 * Math.sin(frame / 40);
  const actGlow = ease(frame, T.actStart, T.actStart + 60, eOut) * (1 - ease(frame, T.actEnd, T.actEnd + 120, eOut)) * 0.5;
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(130% 100% at 50% 46%, #0B1734 0%, #070C1E 46%, #04060F 100%)'}} />
      {/* nebula glows */}
      {[
        {c: '#1E5BFF', s: 1300, x: 640, y: 360, a: 0.22, sp: 1},
        {c: '#8B5CF6', s: 1100, x: 1320, y: 560, a: 0.2, sp: 1.5},
        {c: '#12C8E0', s: 900, x: 980, y: 860, a: 0.14, sp: 1.1},
      ].map((b, i) => {
        const dx = Math.sin(frame / (200 * b.sp) + i) * 40;
        return <div key={i} style={{position: 'absolute', left: b.x - b.s / 2 + dx, top: b.y - b.s / 2, width: b.s, height: b.s, borderRadius: '50%', background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, rgba(0,0,0,0) 70%)`, opacity: b.a}} />;
      })}
      {/* central aura behind brain */}
      <div style={{position: 'absolute', left: CX - 520, top: CY - 520, width: 1040, height: 1040, borderRadius: '50%', background: `radial-gradient(circle at 50% 50%, rgba(64,150,255,${0.16 + breathe * 0.08 + actGlow}) 0%, rgba(120,90,255,0.06) 38%, rgba(0,0,0,0) 66%)`, opacity: aura}} />
      {/* starfield */}
      <svg width="1920" height="1080" style={{position: 'absolute'}}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#BcD4FF" opacity={(0.15 + 0.5 * (0.5 + 0.5 * Math.sin(frame / 20 * s.sp + s.ph))) * aura} />
        ))}
      </svg>
    </>
  );
};

/* ============================================================================
   BRAIN + NETWORK
   ========================================================================== */
const BrainNetwork: React.FC = () => {
  const frame = useCurrentFrame();

  const outline = ease(frame, T.outlineDraw, T.outlineEnd, eInOut);
  const body = ease(frame, T.bodyIn, T.bodyIn + 80, eOut) * 0.5;

  // base edges path (all)
  let basePath = '';
  const hotSegs: string[] = [];
  const cam = camAngle(frame);
  EDGES.forEach((e) => {
    const na = nodeDisp(NODES[e.a], frame);
    const nb = nodeDisp(NODES[e.b], frame);
    const seg = `M${na.x.toFixed(1)} ${na.y.toFixed(1)}L${nb.x.toFixed(1)} ${nb.y.toFixed(1)}`;
    const rev = ease(frame, T.edgesStart + e.mid / MAXD * 90, T.edgesStart + e.mid / MAXD * 90 + 40, eOut);
    if (rev > 0.5) basePath += seg;
    const wb = waveBoost(e.mid, frame);
    if (wb > 0.28) hotSegs.push(seg);
  });

  const edgesOp = ease(frame, T.edgesStart, T.edgesEnd, eOut);

  // signals traveling along a subset of edges
  const signalOn = ease(frame, T.signalsStart, T.signalsStart + 40, eOut);
  const nSig = 46;

  return (
    <svg width="1920" height="1080" style={{position: 'absolute', overflow: 'visible'}}>
      <defs>
        <linearGradient id="brainStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5AC8FF" />
          <stop offset="55%" stopColor="#6E8CFF" />
          <stop offset="100%" stopColor="#B48CFF" />
        </linearGradient>
        <radialGradient id="brainFill" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#173A7A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0A1636" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="coreG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="26%" stopColor="#8FD6FF" />
          <stop offset="60%" stopColor="#3E86FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3E86FF" stopOpacity="0" />
        </radialGradient>
        <clipPath id="brainClip">
          <path d={SOLID_BRAIN} transform={BRAIN_TRANSFORM} />
        </clipPath>
      </defs>

      {/* brain body fill (solid silhouette) */}
      <path d={SOLID_BRAIN} transform={BRAIN_TRANSFORM} fill="url(#brainFill)" opacity={body} />
      <path d={SOLID_BRAIN} transform={BRAIN_TRANSFORM} fill="#0A1838" opacity={body * 0.7} />

      {/* network clipped to brain */}
      <g clipPath="url(#brainClip)">
        {/* base edges */}
        <path d={basePath} stroke="#4C8FE8" strokeWidth={1.4} opacity={0.5 * edgesOp} fill="none" />
        <path d={basePath} stroke="#9AC6FF" strokeWidth={0.7} opacity={0.7 * edgesOp} fill="none" />
        {/* hot edges (activation wave) */}
        <path d={hotSegs.join('')} stroke="#9BE8FF" strokeWidth={2} opacity={0.9} fill="none" style={{filter: 'drop-shadow(0 0 4px #6EC8FF)'}} />

        {/* nodes */}
        {NODES.map((n, i) => {
          const appear = ease(frame, T.nodesStart + (n.d / MAXD) * 120, T.nodesStart + (n.d / MAXD) * 120 + 26, eOut);
          if (appear <= 0.01) return null;
          const p = nodeDisp(n, frame);
          const tw = 0.6 + 0.4 * Math.sin(frame / 12 + n.seed * 20);
          const wb = waveBoost(n.d, frame);
          const r = (2.1 + n.seed * 1.9) * (1 + wb * 1.1) * appear;
          const bright = clamp(0.62 + tw * 0.28 + wb * 0.9, 0, 1);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={r * 3.4} fill="#5AA8FF" opacity={0.14 * bright * appear} />
              <circle cx={p.x} cy={p.y} r={r} fill={wb > 0.4 ? '#EAF6FF' : '#AEDBFF'} opacity={bright * appear} />
            </g>
          );
        })}

        {/* traveling signals */}
        {EDGES.slice(0, nSig).map((e, i) => {
          const na = nodeDisp(NODES[e.a], frame);
          const nb = nodeDisp(NODES[e.b], frame);
          const per = 42 + (i % 5) * 10;
          const fr = ((frame * 0.9 + e.phase * per * 3) % per) / per;
          const x = lerp(na.x, nb.x, fr);
          const y = lerp(na.y, nb.y, fr);
          const op = signalOn * (0.5 + waveBoost(e.mid, frame));
          return <circle key={i} cx={x} cy={y} r={2.4} fill="#EAF9FF" opacity={clamp(op, 0, 1)} style={{filter: 'drop-shadow(0 0 3px #7DD8FF)'}} />;
        })}
      </g>

      {/* brain outline stroke (draws in, then glows) */}
      <g transform={BRAIN_TRANSFORM}>
        {BRAIN_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="url(#brainStroke)"
            strokeWidth={0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - clamp(outline * 1.05 - i * 0.04, 0, 1)}
            style={{filter: 'drop-shadow(0 0 2px #6EA8FF)'}}
          />
        ))}
      </g>
    </svg>
  );
};

/* ============================================================================
   CORE + RINGS + PARTICLES
   ========================================================================== */
const Core: React.FC = () => {
  const frame = useCurrentFrame();
  const ignite = ease(frame, T.coreIgnite, T.coreIgnite + 40, eOut);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 15);
  const actBoost = (frame >= T.actStart && frame <= T.actEnd ? 1 : 0.55) * ignite;
  const coreR = (58 + pulse * 12) * (0.6 + 0.4 * ignite) * (1 + actBoost * 0.15);

  return (
    <svg width="1920" height="1080" style={{position: 'absolute', overflow: 'visible'}}>
      {/* particles streaming into core */}
      {PARTS.map((p, i) => {
        const per = 90;
        const fr = ((frame * p.speed + p.phase * per) % per) / per;
        const x = lerp(p.sx, CX, ease(fr, 0, 1, eInOut));
        const y = lerp(p.sy, CY, ease(fr, 0, 1, eInOut));
        const op = (1 - fr) * 0.8 * ease(frame, T.signalsStart, T.signalsStart + 40, eOut);
        const tx = lerp(p.sx, CX, ease(Math.max(0, fr - 0.03), 0, 1, eInOut));
        const ty = lerp(p.sy, CY, ease(Math.max(0, fr - 0.03), 0, 1, eInOut));
        return (
          <g key={i}>
            <line x1={tx} y1={ty} x2={x} y2={y} stroke="#7FD8FF" strokeWidth={1.4} opacity={op * 0.6} />
            <circle cx={x} cy={y} r={2} fill="#EAF9FF" opacity={op} />
          </g>
        );
      })}

      {/* expanding rings on ignite + periodic */}
      {[0, 1, 2].map((k) => {
        const t = ((frame - T.coreIgnite) / 70 - k * 0.5);
        if (t < 0) return null;
        const tt = t % 2.2;
        const rr = tt * 150 + 40;
        const op = clamp((1 - tt / 2.2) * 0.5 * ignite, 0, 1);
        return <circle key={k} cx={CX} cy={CY} r={rr} fill="none" stroke="#6EC4FF" strokeWidth={2} opacity={op} />;
      })}

      {/* core glow */}
      <circle cx={CX} cy={CY} r={coreR * 2.4} fill="url(#coreG)" opacity={0.5 * ignite} />
      <circle cx={CX} cy={CY} r={coreR} fill="url(#coreG)" opacity={ignite} />
      <circle cx={CX} cy={CY} r={coreR * 0.4} fill="#FFFFFF" opacity={(0.8 + actBoost * 0.2) * ignite} />
    </svg>
  );
};

/* ============================================================================
   LABELS
   ========================================================================== */
const Labels: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width="1920" height="1080" style={{position: 'absolute', overflow: 'visible'}}>
      {LABELS.map((l, i) => {
        const start = 400 + i * 44;
        const op = interpolate(frame, [start, start + 24, start + 200, start + 240], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * (frame < T.settle ? 1 : interpolate(frame, [T.settle, T.settle + 40], [1, 0.5], {extrapolateRight: 'clamp'}));
        if (op <= 0.01) return null;
        const dir = l.x > CX ? 1 : -1;
        return (
          <g key={i} opacity={op}>
            <circle cx={l.x} cy={l.y} r={3} fill="#EAF6FF" />
            <line x1={l.x} y1={l.y} x2={l.x + dir * 30} y2={l.y - 18} stroke="#6EA8FF" strokeWidth={1} opacity={0.6} />
            <line x1={l.x + dir * 30} y1={l.y - 18} x2={l.x + dir * 120} y2={l.y - 18} stroke="#6EA8FF" strokeWidth={1} opacity={0.6} />
            <text x={l.x + dir * 36} y={l.y - 24} textAnchor={dir > 0 ? 'start' : 'start'} fontFamily={FONT} fontSize={16} fontWeight={600} fill="#CFE4FF" style={NUM}>
              {l.t}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ============================================================================
   TITLE (lower third)
   ========================================================================== */
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [560, 600, 860, 892], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (op <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 902, textAlign: 'center', opacity: op}}>
      <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 800, letterSpacing: 2, color: '#EAF3FF'}}>ARTIFICIAL INTELLIGENCE</div>
      <div style={{fontFamily: FONT, fontSize: 20, fontWeight: 500, letterSpacing: 6, color: '#7FA8E0', marginTop: 8}}>NEURAL PROCESSING CORE</div>
    </div>
  );
};

/* ============================================================================
   MAIN
   ========================================================================== */
export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('Loading Inter font'));
  useEffect(() => {
    const id = 'motion-inter-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    const anyDoc = document as unknown as {fonts: {load: (s: string) => Promise<unknown>; ready: Promise<unknown>}};
    Promise.all([anyDoc.fonts.load('500 1em Inter'), anyDoc.fonts.load('600 1em Inter'), anyDoc.fonts.load('800 1em Inter')])
      .then(() => anyDoc.fonts.ready)
      .then(finish)
      .catch(finish);
    const t = setTimeout(finish, 3000);
    return () => clearTimeout(t);
  }, [handle]);

  // camera: push-in at activation, gentle pull-back, subtle breathing + tilt
  const push = interpolate(frame, [T.actStart, 470, 660, 782], [0, 1, 1, 0.15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eInOut});
  const breathe = 1 + 0.006 * Math.sin(frame / 70);
  const scale = (1 + push * 0.09) * breathe;
  const tilt = Math.sin(frame / 200) * 1.1;

  return (
    <AbsoluteFill style={{background: '#04060F', fontFamily: FONT}}>
      <Background />
      <AbsoluteFill style={{transform: `scale(${scale}) rotate(${tilt}deg)`, transformOrigin: `${CX}px ${CY}px`}}>
        <BrainNetwork />
        <Core />
        <Labels />
      </AbsoluteFill>
      <Title />
      <AbsoluteFill style={{pointerEvents: 'none', boxShadow: 'inset 0 0 340px rgba(0,0,0,0.6)'}} />
    </AbsoluteFill>
  );
};
