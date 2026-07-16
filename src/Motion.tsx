import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  random,
} from 'remotion';

/**
 * LATTICE — RAG Knowledge Pipeline
 * Direction: PREMIUM. A dark, glassmorphic retrieval-augmented-generation console
 * on a floating perspective plane, flown over by a slow cinematic parallax camera.
 * Centerpiece is a live vector index: a field of latent embeddings where a query
 * point retrieves its top-k nearest neighbours. Supported by an ingestion pipeline
 * (docs → chunk → embed → index), a retrieved-chunks / similarity panel, a grounded
 * answer stream, a query-embedding strip and ingest-throughput.
 * Deterministic; loops seamlessly except where a metric is intentionally monotonic.
 */

const TAU = Math.PI * 2;

const C = {
  ink: '#eaf2ff',
  sub: 'rgba(196,214,248,0.66)',
  faint: 'rgba(150,182,238,0.34)',
  cyan: '#37e7ff',
  teal: '#2af0c2',
  blue: '#4f8bff',
  violet: '#9a74ff',
  magenta: '#ff5fd0',
  amber: '#ffcf6b',
  grid: 'rgba(120,170,255,0.07)',
  gridHi: 'rgba(120,180,255,0.16)',
};

// ---------- helpers ----------
const hexA = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const s = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(s, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const nf = (v: number, d = 0) =>
  v.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});

// linear blend of two rgb triplets → css rgb()
const ramp = (v: number) => {
  const lo: [number, number, number] = [26, 52, 100];
  const mid: [number, number, number] = [55, 231, 255];
  const hi: [number, number, number] = [200, 236, 255];
  const mixc = (a: [number, number, number], b: [number, number, number], f: number) =>
    [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  const c = v < 0.5 ? mixc(lo, mid, v / 0.5) : mixc(mid, hi, (v - 0.5) / 0.5);
  return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
};

type Comp = {f: number; h: number; a: number; p: number};

const waveVal = (fx: number, comps: Comp[], base: number, t: number) => {
  let v = base;
  for (const c of comps) v += c.a * Math.sin(TAU * (c.f * fx + c.h * t + c.p));
  return clamp(v, 0.05, 0.95);
};

const wavePts = (
  n: number,
  x0: number,
  x1: number,
  yTop: number,
  yBot: number,
  comps: Comp[],
  base: number,
  t: number
): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const fx = i / (n - 1);
    const v = waveVal(fx, comps, base, t);
    pts.push([x0 + fx * (x1 - x0), yBot - v * (yBot - yTop)]);
  }
  return pts;
};

const smooth = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
};

const FONT =
  '"Inter","SF Pro Display","Helvetica Neue",Arial,system-ui,sans-serif';
const MONO =
  '"SF Mono","JetBrains Mono","Roboto Mono",ui-monospace,Menlo,monospace';

const Glow: React.FC<{id: string; b1?: number; b2?: number}> = ({id, b1 = 2.4, b2 = 7}) => (
  <filter id={id} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation={b2} result="g2" />
    <feGaussianBlur in="SourceGraphic" stdDeviation={b1} result="g1" />
    <feMerge>
      <feMergeNode in="g2" />
      <feMergeNode in="g1" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

const PulseDot: React.FC<{color: string; t: number; size?: number}> = ({color, t, size = 7}) => {
  const p = 0.5 + 0.5 * Math.sin(TAU * (2 * t));
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${6 + p * 8}px ${hexA(color, 0.7 + p * 0.3)}, 0 0 2px ${color}`,
        opacity: 0.65 + p * 0.35,
        display: 'inline-block',
      }}
    />
  );
};

const Brackets: React.FC<{accent: string}> = ({accent}) => {
  const col = hexA(accent, 0.55);
  const s: React.CSSProperties = {position: 'absolute', width: 15, height: 15, pointerEvents: 'none'};
  return (
    <>
      <span style={{...s, left: 12, top: 12, borderLeft: `1.5px solid ${col}`, borderTop: `1.5px solid ${col}`, borderTopLeftRadius: 4}} />
      <span style={{...s, right: 12, bottom: 12, borderRight: `1.5px solid ${col}`, borderBottom: `1.5px solid ${col}`, borderBottomRightRadius: 4}} />
    </>
  );
};

const cardStyle = (accent: string): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  borderRadius: 20,
  overflow: 'hidden',
  background:
    'linear-gradient(155deg, rgba(28,44,80,0.60) 0%, rgba(13,22,44,0.66) 52%, rgba(9,15,32,0.74) 100%)',
  boxShadow: `inset 0 1px 0 rgba(196,222,255,0.16), inset 0 0 70px rgba(24,46,92,0.30), 0 36px 74px -32px rgba(0,0,0,0.82), 0 0 0 1px rgba(122,170,255,0.16), 0 0 48px ${hexA(accent, 0.14)}`,
});

const Frame: React.FC<{
  x: number; y: number; w: number; h: number; z: number;
  accent: string; title: string; tag?: string; t: number;
  children: (cw: number, ch: number) => React.ReactNode;
}> = ({x, y, w, h, z, accent, title, tag = 'LIVE', t, children}) => {
  const PADX = 22, HEADER = 52, PADB = 20;
  const cw = w - PADX * 2, ch = h - HEADER - PADB;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateZ(${z}px)`, backfaceVisibility: 'hidden'}}>
      <div style={cardStyle(accent)}>
        <div style={{position: 'absolute', left: PADX, right: PADX, top: 0, height: HEADER, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{fontFamily: FONT, fontSize: 12.5, letterSpacing: 2.4, fontWeight: 600, color: C.ink, textTransform: 'uppercase', opacity: 0.92}}>{title}</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <PulseDot color={accent} t={t} />
            <span style={{fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.6, color: C.faint, fontWeight: 500}}>{tag}</span>
          </span>
        </div>
        <div style={{position: 'absolute', left: PADX, right: PADX, top: HEADER - 1, height: 1, background: `linear-gradient(90deg, ${hexA(accent, 0.42)}, rgba(120,170,255,0.05))`}} />
        <Brackets accent={accent} />
        <div style={{position: 'absolute', left: PADX, top: HEADER, width: cw, height: ch}}>
          {children(cw, ch)}
        </div>
      </div>
    </div>
  );
};

// ---------- HERO: vector index + top-k retrieval ----------
type Pt = {bx: number; by: number; hue: string; amp: number; phx: number; phy: number; tw: number};

const CLUSTERS: {cx: number; cy: number; sp: number; hue: string; n: number}[] = [
  {cx: 700, cy: 300, sp: 78, hue: C.cyan, n: 22},   // query cluster (centre, visible)
  {cx: 930, cy: 196, sp: 104, hue: C.teal, n: 26},
  {cx: 1000, cy: 470, sp: 116, hue: C.violet, n: 26},
  {cx: 520, cy: 396, sp: 122, hue: C.blue, n: 24},
  {cx: 820, cy: 520, sp: 96, hue: C.magenta, n: 20},
  {cx: 330, cy: 250, sp: 132, hue: C.cyan, n: 22},  // ambient (bleeds left)
  {cx: 1130, cy: 336, sp: 92, hue: C.teal, n: 18},
];

const VectorSpace: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const radius = 220; // retrieval neighbourhood radius
  // the query flies a seamless elliptical path through the embedding space,
  // continuously retrieving whichever neighbours are currently nearest
  const qx = 800 + 185 * Math.sin(TAU * t) + 40 * Math.sin(TAU * 2 * t + 0.6);
  const qy = 320 + 128 * Math.sin(TAU * t + 1.9) + 24 * Math.cos(TAU * 3 * t);
  const q = {x: qx, y: qy};
  const spin = 360 * t;

  // build point field (deterministic)
  const pts: Pt[] = [];
  CLUSTERS.forEach((cl, ci) => {
    for (let i = 0; i < cl.n; i++) {
      const ang = random(`a${ci}-${i}`) * TAU;
      const rad = cl.sp * Math.sqrt(random(`r${ci}-${i}`)) * 0.9;
      pts.push({
        bx: cl.cx + Math.cos(ang) * rad,
        by: cl.cy + Math.sin(ang) * rad,
        hue: cl.hue,
        amp: 7 + random(`m${ci}-${i}`) * 11,
        phx: random(`px${ci}-${i}`),
        phy: random(`py${ci}-${i}`),
        tw: random(`tw${ci}-${i}`),
      });
    }
  });

  // live positions + smooth proximity activation against the moving query
  const P = pts.map((p) => {
    const x = p.bx + p.amp * Math.sin(TAU * (t + p.phx)) + p.amp * 0.45 * Math.sin(TAU * (2 * t + p.phy));
    const y = p.by + p.amp * Math.cos(TAU * (t + p.phy)) + p.amp * 0.45 * Math.cos(TAU * (2 * t + p.phx));
    const d = Math.hypot(x - qx, y - qy);
    const a = clamp(1 - d / radius, 0, 1);
    return {x, y, d, a: a * a, hue: p.hue, tw: p.tw};
  });
  const nearest = P.reduce((m, p) => Math.min(m, p.d), 1e9);
  const nMatch = P.filter((p) => p.a > 0.5).length;
  const topSim = clamp(0.995 - nearest / 1200, 0.62, 0.995);

  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <Glow id="vs_pt" b1={1.6} b2={5} />
          <Glow id="vs_q" b1={2.6} b2={9} />
        </defs>

        {/* cluster density glows (gentle breathing) */}
        {CLUSTERS.map((cl, i) => {
          const br = 1.1 + 0.08 * Math.sin(TAU * (t + i * 0.2));
          return <circle key={'cg' + i} cx={cl.cx} cy={cl.cy} r={cl.sp * br} fill={hexA(cl.hue, 0.05)} />;
        })}

        {/* expanding search pulses from the moving query */}
        {[0, 1].map((j) => {
          const f = (t * 3 + j / 2) % 1;
          const op = 0.55 * Math.pow(1 - f, 1.4);
          return <circle key={'sr' + j} cx={q.x} cy={q.y} r={30 + f * (radius - 30)} fill="none" stroke={hexA(C.cyan, op)} strokeWidth={1.6} />;
        })}

        {/* retrieval links to the current nearest neighbours */}
        {P.map((p, i) => {
          if (p.a < 0.28) return null;
          const s = (t * 2.4 + p.tw) % 1;
          const env = Math.sin(Math.PI * s);
          const px = q.x + (p.x - q.x) * s;
          const py = q.y + (p.y - q.y) * s;
          return (
            <g key={'lk' + i}>
              <line x1={q.x} y1={q.y} x2={p.x} y2={p.y} stroke={hexA(C.cyan, 0.1 + 0.34 * p.a)} strokeWidth={0.8 + p.a} />
              <circle cx={px} cy={py} r={1.8 + env * 1.6} fill={C.ink} opacity={(0.4 + 0.6 * env) * p.a} filter="url(#vs_pt)" />
            </g>
          );
        })}

        {/* embedding points — brighten by proximity to the query */}
        {P.map((p, i) => {
          const tw = 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(TAU * (2 * t + p.tw)));
          const r = 2.4 + tw * 1.1 + p.a * 4.5;
          return (
            <g key={'pt' + i}>
              {p.a > 0.35 && <circle cx={p.x} cy={p.y} r={7 + p.a * 6} fill="none" stroke={hexA(p.hue, 0.4 * p.a)} strokeWidth={1.1} />}
              <circle cx={p.x} cy={p.y} r={r} fill={hexA(p.hue, 0.3 + tw * 0.35 + p.a * 0.35)} filter={p.a > 0.45 ? 'url(#vs_pt)' : undefined} />
              {p.a > 0.5 && <circle cx={p.x} cy={p.y} r={2 * p.a} fill="#ffffff" opacity={p.a} />}
            </g>
          );
        })}

        {/* query point (moving, spinning reticle) */}
        <g>
          <g transform={`rotate(${spin} ${q.x} ${q.y})`}>
            <circle cx={q.x} cy={q.y} r={18} fill="none" stroke={hexA(C.amber, 0.35)} strokeWidth={1.4} strokeDasharray="4 6" />
          </g>
          <circle cx={q.x} cy={q.y} r={9} fill={C.amber} filter="url(#vs_q)" />
          <circle cx={q.x} cy={q.y} r={3.6} fill="#fff" />
          <line x1={q.x - 24} y1={q.y} x2={q.x - 13} y2={q.y} stroke={hexA(C.amber, 0.75)} strokeWidth={1.4} />
          <line x1={q.x + 13} y1={q.y} x2={q.x + 24} y2={q.y} stroke={hexA(C.amber, 0.75)} strokeWidth={1.4} />
          <line x1={q.x} y1={q.y - 24} x2={q.x} y2={q.y - 13} stroke={hexA(C.amber, 0.75)} strokeWidth={1.4} />
          <line x1={q.x} y1={q.y + 13} x2={q.x} y2={q.y + 24} stroke={hexA(C.amber, 0.75)} strokeWidth={1.4} />
        </g>
      </svg>

      {/* readouts (kept inside the on-screen safe band) */}
      <div style={{position: 'absolute', left: 500, top: -2}}>
        <div style={{fontFamily: MONO, fontSize: 12.5, letterSpacing: 1.4, color: C.sub, textShadow: '0 0 12px rgba(5,10,25,0.9)'}}>VECTOR INDEX</div>
        <div style={{fontFamily: MONO, fontSize: 11, letterSpacing: 1, color: C.faint, marginTop: 3, textShadow: '0 0 12px rgba(5,10,25,0.9)'}}>768-D · 2.43M vectors</div>
      </div>
      <div style={{position: 'absolute', right: 0, top: -2, textAlign: 'right'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end'}}>
          <span style={{fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 24px ${hexA(C.cyan, 0.5)}, 0 0 12px rgba(5,10,25,0.9)`}}>{topSim.toFixed(3)}</span>
          <span style={{fontFamily: FONT, fontSize: 12, color: C.sub}}>cos sim</span>
        </div>
        <div style={{fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, color: C.amber, marginTop: 2, textShadow: '0 0 12px rgba(5,10,25,0.9)'}}>{nMatch} NEIGHBOURS · kNN</div>
      </div>
      <div style={{position: 'absolute', left: 500, bottom: -2, fontFamily: FONT, fontSize: 10.5, letterSpacing: 2, color: C.faint, textTransform: 'uppercase', textShadow: '0 0 12px rgba(5,10,25,0.9)'}}>nearest-neighbour semantic search · live query</div>
    </div>
  );
};

// ---------- retrieved chunks / similarity (fully-safe panel) ----------
const CHUNKS = [
  {id: 'chunk_04a1', src: 'doc_18 · p3', s: 0.94},
  {id: 'chunk_11c7', src: 'doc_02 · p7', s: 0.89},
  {id: 'chunk_0e33', src: 'doc_45 · p1', s: 0.85},
  {id: 'chunk_2b90', src: 'doc_18 · p4', s: 0.81},
  {id: 'chunk_7fa2', src: 'doc_31 · p2', s: 0.78},
  {id: 'chunk_1d58', src: 'doc_09 · p6', s: 0.74},
];

const RetrievedChunks: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const n = CHUNKS.length;
  const rowH = ch / n;
  const barX = 150, barW = cw - barX - 58;
  const scanY = t * ch;
  const scanOp = 0.12 * Math.sin(Math.PI * t);
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="rc_bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={hexA(C.blue, 0.5)} />
          <stop offset="1" stopColor={C.cyan} />
        </linearGradient>
        <linearGradient id="rc_hot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={hexA(C.violet, 0.55)} />
          <stop offset="1" stopColor={C.magenta} />
        </linearGradient>
        <Glow id="rc_glow" b1={1.8} b2={5} />
      </defs>
      <rect x={0} y={scanY - 18} width={cw} height={36} fill={hexA(C.cyan, scanOp)} />
      {CHUNKS.map((ck, i) => {
        const cy = i * rowH + rowH / 2;
        const val = clamp(ck.s + 0.03 * Math.sin(TAU * (t + i * 0.25)) + 0.012 * Math.sin(TAU * 2 * t + i), 0, 1);
        const hot = i === 0;
        const bw = Math.max(6, val * barW);
        return (
          <g key={i}>
            {i > 0 && <line x1={0} y1={i * rowH} x2={cw} y2={i * rowH} stroke={C.grid} strokeWidth={1} />}
            <text x={0} y={cy - 4} fill={hot ? C.magenta : C.faint} fontFamily={MONO} fontSize={12} fontWeight={600}>{String(i + 1).padStart(2, '0')}</text>
            <text x={26} y={cy - 4} fill={hot ? C.ink : C.sub} fontFamily={MONO} fontSize={13} fontWeight={hot ? 600 : 400}>{ck.id}</text>
            <text x={26} y={cy + 13} fill={C.faint} fontFamily={MONO} fontSize={10.5}>{ck.src}</text>
            <rect x={barX} y={cy - 4} width={barW} height={9} rx={4.5} fill="rgba(120,160,230,0.12)" />
            <rect x={barX} y={cy - 4} width={bw} height={9} rx={4.5} fill={hot ? 'url(#rc_hot)' : 'url(#rc_bar)'} filter={hot ? 'url(#rc_glow)' : undefined} />
            <text x={cw} y={cy + 2} fill={hot ? C.magenta : C.sub} fontFamily={MONO} fontSize={13} fontWeight={600} textAnchor="end" style={{fontVariantNumeric: 'tabular-nums'}}>{val.toFixed(2)}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ---------- ingestion pipeline (fully-safe panel) ----------
const IngestionPipeline: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const stages = [
    {label: 'DOCS', accent: C.blue},
    {label: 'CHUNK', accent: C.cyan},
    {label: 'EMBED', accent: C.teal},
    {label: 'INDEX', accent: C.violet},
  ];
  const bw = 96, bh = 54;
  const cy = ch * 0.42;
  const xs = stages.map((_, i) => 44 + (i / (stages.length - 1)) * (cw - 88));

  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <Glow id="ip_glow" b1={1.6} b2={5} />
        </defs>
        {/* connectors + flowing items */}
        {xs.slice(0, -1).map((x, i) => {
          const x0 = x + bw / 2, x1 = xs[i + 1] - bw / 2;
          const acc = stages[i + 1].accent;
          return (
            <g key={'cn' + i}>
              <line x1={x0} y1={cy} x2={x1} y2={cy} stroke={hexA(acc, 0.28)} strokeWidth={1.4} />
              {[0, 1, 2, 3, 4].map((j) => {
                const s = (t * 2.4 + j / 5 + i * 0.13) % 1;
                const ix = x0 + (x1 - x0) * s;
                const env = Math.sin(Math.PI * s);
                return <rect key={j} x={ix - 3} y={cy - 3} width={6} height={6} rx={1.4} fill={acc} opacity={0.3 + 0.7 * env} filter="url(#ip_glow)" />;
              })}
            </g>
          );
        })}
        {/* stage boxes */}
        {stages.map((st, i) => {
          const x = xs[i] - bw / 2, y = cy - bh / 2;
          const act = Math.pow(0.5 + 0.5 * Math.sin(TAU * (t - i * 0.22)), 2);
          return (
            <g key={'st' + i}>
              <rect x={x} y={y} width={bw} height={bh} rx={11} fill={hexA(st.accent, 0.1 + 0.1 * act)} stroke={hexA(st.accent, 0.45 + 0.35 * act)} strokeWidth={1.2} filter={act > 0.7 ? 'url(#ip_glow)' : undefined} />
              <circle cx={x + 14} cy={y + 15} r={3.4} fill={st.accent} />
              <text x={x + bw / 2} y={cy + 4} fill={C.ink} fontFamily={MONO} fontSize={12.5} fontWeight={600} letterSpacing={0.8} textAnchor="middle">{st.label}</text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 2, top: -2, fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, color: C.faint}}>2.43M chunks · 768-D</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 6, textAlign: 'center', fontFamily: FONT, fontSize: 10.5, letterSpacing: 2, color: C.faint, textTransform: 'uppercase'}}>parse → chunk → embed → upsert</div>
    </div>
  );
};

// ---------- grounded answer stream (anchored to safe-left) ----------
const ANSWER_TOKENS = 'Based on the retrieved context , the model grounds each statement [1] in ranked source passages [2] , weighting evidence by cosine similarity [3] before composing a cited , verifiable response [4] .'.split(' ');

const GroundedAnswer: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const total = ANSWER_TOKENS.length;
  const typeP = clamp((t - 0.05) / 0.8, 0, 1);
  const shown = Math.floor(total * typeP);
  const op = interpolate(t, [0, 0.05], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(t, [0.9, 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cursor = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(TAU * (t * 6)));
  const citeCol = [C.cyan, C.teal, C.violet, C.magenta];

  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <div style={{position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 8}}>
        <PulseDot color={C.teal} t={t} size={7} />
        <span style={{fontFamily: MONO, fontSize: 11, letterSpacing: 1.6, color: C.faint}}>STREAMING · GROUNDED</span>
      </div>
      <div style={{position: 'absolute', left: 4, top: 40, width: 400, opacity: op}}>
        <span style={{fontFamily: FONT, fontSize: 16.5, lineHeight: 1.66, color: C.ink}}>
          {ANSWER_TOKENS.slice(0, shown).map((w, i) => {
            const m = /^\[(\d)\]$/.exec(w);
            if (m) {
              const ci = (parseInt(m[1], 10) - 1) % citeCol.length;
              return (
                <span key={i} style={{display: 'inline-block', transform: 'translateY(-1px)', margin: '0 3px', padding: '1px 6px', borderRadius: 6, fontFamily: MONO, fontSize: 11.5, fontWeight: 600, color: citeCol[ci], background: hexA(citeCol[ci], 0.14), border: `1px solid ${hexA(citeCol[ci], 0.4)}`}}>{m[1]}</span>
              );
            }
            return <span key={i}>{w + ' '}</span>;
          })}
          {typeP < 1 && <span style={{display: 'inline-block', width: 8, height: 17, background: C.cyan, opacity: cursor, transform: 'translateY(2px)', boxShadow: `0 0 8px ${hexA(C.cyan, 0.8)}`}} />}
        </span>
      </div>
    </div>
  );
};

// ---------- query embedding strip (narrow safe-left) ----------
const QueryEmbedding: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const rows = 40;
  const colW = 84;
  const x0 = 8;
  const gap = 1.5;
  const cellH = (ch - 26 - gap * (rows - 1)) / rows;
  const scan = ((t * 2) % 1) * rows;
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <text x={x0} y={12} fill={C.faint} fontFamily={MONO} fontSize={10.5} letterSpacing={1}>QUERY VEC</text>
      <text x={x0 + colW} y={12} fill={C.faint} fontFamily={MONO} fontSize={10} letterSpacing={1} textAnchor="end">768-D</text>
      {Array.from({length: rows}).map((_, i) => {
        let v = 0.5 + 0.42 * Math.sin(i * 0.9 + 1.3 * random('qe' + i));
        v += 0.16 * Math.sin(TAU * (t * 3 + i * 0.05));
        const sd = Math.exp(-Math.pow(Math.min(Math.abs(i - scan), rows - Math.abs(i - scan)), 2) / 6);
        v = clamp(v + sd * 0.25, 0, 1);
        const y = 22 + i * (cellH + gap);
        return <rect key={i} x={x0} y={y} width={colW} height={cellH} rx={1.5} fill={ramp(v)} opacity={0.35 + v * 0.6} />;
      })}
      <rect x={x0 - 2} y={20} width={colW + 4} height={ch - 24} rx={3} fill="none" stroke="rgba(120,170,255,0.18)" strokeWidth={1} />
    </svg>
  );
};

// ---------- ingest throughput (safe-right readout) ----------
const ING: Comp[] = [
  {f: 1.1, h: 1, a: 0.15, p: 0.3},
  {f: 2.4, h: 2, a: 0.08, p: 1.1},
  {f: 3.9, h: 1, a: 0.04, p: 2.0},
];

const IngestThroughput: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const gx0 = 6, gx1 = cw - 6, gTop = 58, gBot = ch - 26;
  const gw = gx1 - gx0;
  const pts = wavePts(96, gx0, gx1, gTop, gBot, ING, 0.5, t);
  const area = `${smooth(pts)} L ${gx1} ${gBot} L ${gx0} ${gBot} Z`;
  const fx = t;
  const dv = waveVal(fx, ING, 0.5, t);
  const dx = gx0 + fx * gw;
  const dy = gBot - dv * (gBot - gTop);
  const edge = interpolate(Math.min(fx, 1 - fx), [0, 0.06], [0, 1], {extrapolateRight: 'clamp'});
  const val = 3120 + 180 * Math.sin(TAU * t) + 48 * Math.sin(TAU * 3 * t + 1);
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="it_area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.teal} stopOpacity="0.4" />
            <stop offset="0.6" stopColor={C.cyan} stopOpacity="0.12" />
            <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="it_line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.teal} />
            <stop offset="1" stopColor={C.cyan} />
          </linearGradient>
          <Glow id="it_glow" b1={2.2} b2={7} />
        </defs>
        {[0.33, 0.66, 1].map((r) => (
          <line key={r} x1={gx0} y1={gBot - r * (gBot - gTop)} x2={gx1} y2={gBot - r * (gBot - gTop)} stroke={C.grid} strokeWidth={1} />
        ))}
        <path d={area} fill="url(#it_area)" />
        <path d={smooth(pts)} fill="none" stroke="url(#it_line)" strokeWidth={2.6} strokeLinecap="round" filter="url(#it_glow)" />
        {edge > 0.02 && (
          <>
            <circle cx={dx} cy={dy} r={8} fill={hexA(C.cyan, 0.16 * edge)} />
            <circle cx={dx} cy={dy} r={3.6} fill={C.ink} opacity={edge} filter="url(#it_glow)" />
          </>
        )}
      </svg>
      {/* readout anchored right (safe side of this panel) */}
      <div style={{position: 'absolute', right: 2, top: 0, textAlign: 'right'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end'}}>
          <span style={{fontFamily: MONO, fontSize: 34, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 22px ${hexA(C.cyan, 0.4)}`}}>{nf(val, 0)}</span>
          <span style={{fontFamily: FONT, fontSize: 13, color: C.sub, letterSpacing: 0.5}}>chunks/s</span>
        </div>
        <div style={{fontFamily: FONT, fontSize: 10.5, letterSpacing: 2, color: C.faint, textTransform: 'uppercase', marginTop: 2}}>ingest rate · 60s</div>
      </div>
    </div>
  );
};

// ---------- KPI cards ----------
type Kpi = {label: string; val: number; unit: string; dec: number; delta: string; accent: string; amp: number; seed: string};
const KPIS: Kpi[] = [
  {label: 'CHUNKS INDEXED', val: 2.43, unit: 'M', dec: 2, delta: '▲ 12k', accent: C.cyan, amp: 0.01, seed: 'k1'},
  {label: 'QUERIES / SEC', val: 184, unit: '', dec: 0, delta: '▲ 3.6%', accent: C.teal, amp: 7, seed: 'k2'},
  {label: 'RECALL @8', val: 96.4, unit: '%', dec: 1, delta: '▲ 0.4%', accent: C.violet, amp: 0.3, seed: 'k3'},
];

const KpiChart: React.FC<{cw: number; ch: number; t: number; d: Kpi}> = ({cw, ch, t, d}) => {
  const ph = random(d.seed) * 3;
  const comps: Comp[] = [
    {f: 1.5, h: 1, a: 0.18, p: ph},
    {f: 3.0, h: 2, a: 0.09, p: ph * 1.7},
  ];
  const spTop = ch * 0.5, spBot = ch - 4;
  const pts = wavePts(30, 2, cw - 2, spTop, spBot, comps, 0.5, t);
  const area = `${smooth(pts)} L ${cw - 2} ${spBot} L 2 ${spBot} Z`;
  const val = d.val + d.amp * Math.sin(TAU * (t + ph * 0.1));
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
        <span style={{fontFamily: MONO, fontSize: 34, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 22px ${hexA(d.accent, 0.4)}`}}>{nf(val, d.dec)}</span>
        {d.unit && <span style={{fontFamily: FONT, fontSize: 13, color: C.sub}}>{d.unit}</span>}
      </div>
      <span style={{fontFamily: MONO, fontSize: 12.5, color: C.teal, letterSpacing: 0.5}}>{d.delta}</span>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', left: 0, bottom: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id={`ksp_${d.seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={d.accent} stopOpacity="0.4" />
            <stop offset="1" stopColor={d.accent} stopOpacity="0" />
          </linearGradient>
          <Glow id={`kspg_${d.seed}`} b1={1.4} b2={4} />
        </defs>
        <path d={area} fill={`url(#ksp_${d.seed})`} />
        <path d={smooth(pts)} fill="none" stroke={d.accent} strokeWidth={2} strokeLinecap="round" filter={`url(#kspg_${d.seed})`} />
      </svg>
    </div>
  );
};

// ---------- world plane ----------
const World: React.FC<{t: number}> = ({t}) => {
  const W = 2600, H = 1500;
  const rotX = 15 + 3 * Math.sin(TAU * t + 0.2);
  const rotY = 12 * Math.sin(TAU * t + 0.7);
  const rotZ = 1.0 * Math.sin(TAU * t + 1.9);
  const tx = 120 * Math.sin(TAU * t + 0.15);
  const ty = 26 * Math.sin(TAU * t + 1.25);
  const tz = 215 + 70 * Math.sin(TAU * t + 2.1);

  const GW = 3400, GH = 2100, gStep = 92;
  const vlines = Math.ceil(GW / gStep), hlines = Math.ceil(GH / gStep);

  return (
    <div style={{position: 'absolute', width: W, height: H, transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) translate3d(${tx}px,${ty}px,${tz}px)`, transformOrigin: '50% 50%', backfaceVisibility: 'hidden'}}>
      {/* holographic floor grid */}
      <div style={{position: 'absolute', left: '50%', top: '50%', width: GW, height: GH, transform: 'translate(-50%,-50%) translateZ(-175px)'}}>
        <svg width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`}>
          <defs>
            <radialGradient id="wg_fade" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="wg_mask"><rect width={GW} height={GH} fill="url(#wg_fade)" /></mask>
          </defs>
          <g mask="url(#wg_mask)">
            {Array.from({length: vlines + 1}).map((_, i) => (
              <line key={'v' + i} x1={i * gStep} y1={0} x2={i * gStep} y2={GH} stroke={i % 5 === 0 ? C.gridHi : C.grid} strokeWidth={i % 5 === 0 ? 1.4 : 1} />
            ))}
            {Array.from({length: hlines + 1}).map((_, i) => (
              <line key={'h' + i} x1={0} y1={i * gStep} x2={GW} y2={i * gStep} stroke={i % 5 === 0 ? C.gridHi : C.grid} strokeWidth={i % 5 === 0 ? 1.4 : 1} />
            ))}
          </g>
        </svg>
      </div>

      {/* header strip */}
      <div style={{position: 'absolute', left: 110, top: 128, width: 2400, height: 60, transform: 'translateZ(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backfaceVisibility: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{width: 16, height: 16, transform: 'rotate(45deg)', border: `2px solid ${C.cyan}`, boxShadow: `0 0 16px ${hexA(C.cyan, 0.7)}`, borderRadius: 3, display: 'inline-block'}} />
          <span style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, letterSpacing: 5, color: C.ink, textTransform: 'uppercase'}}>RAG Knowledge Pipeline</span>
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2, color: C.faint, marginLeft: 6}}>/ RETRIEVAL</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <PulseDot color={C.teal} t={t} size={8} />
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2.5, color: C.sub}}>INDEX · SYNCED</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 190, width: 2400, height: 1, transform: 'translateZ(12px)', background: 'linear-gradient(90deg, rgba(120,180,255,0.35), rgba(120,180,255,0.03))'}} />

      {/* panels */}
      <Frame x={110} y={250} w={1250} h={690} z={0} accent={C.cyan} title="Vector Index" tag="kNN" t={t}>
        {(cw, ch) => <VectorSpace cw={cw} ch={ch} t={t} />}
      </Frame>

      {KPIS.map((d, i) => (
        <Frame key={d.seed} x={1420 + i * 397} y={250} w={i === 2 ? 300 : 380} h={205} z={80 - i * 22} accent={d.accent} title={d.label} tag="LIVE" t={t}>
          {(cw, ch) => <KpiChart cw={cw} ch={ch} t={t} d={d} />}
        </Frame>
      ))}

      <Frame x={1420} y={485} w={455} h={455} z={120} accent={C.magenta} title="Retrieved Chunks" tag="TOP-6" t={t}>
        {(cw, ch) => <RetrievedChunks cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1905} y={485} w={460} h={455} z={35} accent={C.violet} title="Query Embedding" tag="768-D" t={t}>
        {(cw, ch) => <QueryEmbedding cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={110} y={980} w={780} h={430} z={62} accent={C.teal} title="Ingest Rate" tag="chunks/s" t={t}>
        {(cw, ch) => <IngestThroughput cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={915} y={980} w={560} h={430} z={-32} accent={C.blue} title="Ingestion Pipeline" tag="STREAM" t={t}>
        {(cw, ch) => <IngestionPipeline cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1500} y={980} w={1010} h={430} z={86} accent={C.cyan} title="Grounded Answer" tag="CITED" t={t}>
        {(cw, ch) => <GroundedAnswer cw={cw} ch={ch} t={t} />}
      </Frame>
    </div>
  );
};

// ---------- atmosphere ----------
const Bokeh: React.FC<{t: number; count: number; seedp: string; front?: boolean}> = ({t, count, seedp, front}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: count}).map((_, i) => {
      const s = seedp + i;
      const bx = random('bx' + s) * 100;
      const by = random('by' + s) * 100;
      const sz = (front ? 90 : 44) + random('bs' + s) * (front ? 200 : 150);
      const k = random('bk' + s) > 0.5 ? 1 : 2;
      const dx = (random('bdx' + s) - 0.5) * (front ? 3 : 6);
      const dy = (random('bdy' + s) - 0.5) * (front ? 3 : 6);
      const px = bx + dx * Math.sin(TAU * (k * t + random('bp' + s)));
      const py = by + dy * Math.cos(TAU * (k * t + random('bq' + s)));
      const pulse = 0.5 + 0.5 * Math.sin(TAU * (t + random('bo' + s)));
      const col = random('bc' + s) > 0.5 ? C.cyan : random('bc2' + s) > 0.5 ? C.violet : C.teal;
      const op = (front ? 0.05 : 0.12) + pulse * (front ? 0.05 : 0.1);
      return (
        <div key={i} style={{position: 'absolute', left: `${px}%`, top: `${py}%`, width: sz, height: sz, marginLeft: -sz / 2, marginTop: -sz / 2, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(col, 0.9)} 0%, ${hexA(col, 0)} 70%)`, opacity: op, filter: `blur(${front ? 14 : 8}px)`}} />
      );
    })}
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = (frame % durationInFrames) / durationInFrames;

  const g1x = 26 + 6 * Math.sin(TAU * t);
  const g1y = 22 + 5 * Math.cos(TAU * t + 1);
  const g2x = 74 + 6 * Math.sin(TAU * t + 2);
  const g2y = 78 + 5 * Math.cos(TAU * t);

  const scanY = t;
  const scanEdge = interpolate(Math.min(scanY, 1 - scanY), [0, 0.08], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <AbsoluteFill style={{background: 'radial-gradient(130% 100% at 50% 28%, #0c1834 0%, #081124 42%, #050a17 72%, #03060f 100%)', fontFamily: FONT}}>
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>
        <div style={{position: 'absolute', left: `${g1x}%`, top: `${g1y}%`, width: 1100, height: 1100, marginLeft: -550, marginTop: -550, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(C.cyan, 0.16)} 0%, ${hexA(C.cyan, 0)} 66%)`}} />
        <div style={{position: 'absolute', left: `${g2x}%`, top: `${g2y}%`, width: 1200, height: 1200, marginLeft: -600, marginTop: -600, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(C.violet, 0.14)} 0%, ${hexA(C.violet, 0)} 66%)`}} />
        <div style={{position: 'absolute', left: '50%', top: '46%', width: 1500, height: 900, marginLeft: -750, marginTop: -450, borderRadius: '50%', background: `radial-gradient(ellipse, ${hexA(C.blue, 0.10)} 0%, ${hexA(C.blue, 0)} 70%)`}} />
      </AbsoluteFill>

      <Bokeh t={t} count={26} seedp="bg" />

      <AbsoluteFill style={{perspective: '1400px', perspectiveOrigin: '50% 42%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <World t={t} />
      </AbsoluteFill>

      <Bokeh t={t} count={7} seedp="fg" front />

      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.5 * scanEdge}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: `${scanY * 100}%`, height: 140, marginTop: -70, background: `linear-gradient(180deg, transparent, ${hexA(C.cyan, 0.10)} 50%, transparent)`}} />
      </AbsoluteFill>

      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(120% 120% at 50% 44%, transparent 52%, rgba(2,4,10,0.55) 82%, rgba(1,3,8,0.9) 100%)'}} />

      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.05}}>
        <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none">
          <filter id="mn_noise" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" />
          </filter>
          <rect width="960" height="540" filter="url(#mn_noise)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Motion;
