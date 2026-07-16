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
 * HELIX — Genomics / Bioinformatics Sequencer
 * Direction: PREMIUM. A dark, glassmorphic sequencing console on a floating
 * perspective plane, flown over by a slow cinematic parallax camera. Centerpiece
 * is a rotating DNA double helix with a flowing base-pair sequence track,
 * supported by variant calling, a coverage-depth histogram, an alignment pileup,
 * a Phred-quality strip and a sequencing-rate panel.
 * Deterministic; loops seamlessly (all motion periodic in t∈[0,1)).
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
  rose: '#ff6f8b',
  grid: 'rgba(120,170,255,0.07)',
  gridHi: 'rgba(120,180,255,0.16)',
};

// nucleotide palette (A-T and G-C complementary pairs)
const BASES = ['A', 'T', 'G', 'C'];
const BASE_COL: Record<string, string> = {A: C.teal, T: C.magenta, G: C.cyan, C: C.violet};
const COMP: Record<string, string> = {A: 'T', T: 'A', G: 'C', C: 'G'};
const SEQ_PERIOD = 48;
const seqBase = (m: number) => BASES[Math.floor(random('seq' + (((m % SEQ_PERIOD) + SEQ_PERIOD) % SEQ_PERIOD)) * 4)];

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

const ramp = (v: number) => {
  const lo: [number, number, number] = [26, 52, 100];
  const mid: [number, number, number] = [55, 231, 255];
  const hi: [number, number, number] = [200, 236, 255];
  const mixc = (a: [number, number, number], b: [number, number, number], f: number) =>
    [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  const c = v < 0.5 ? mixc(lo, mid, v / 0.5) : mixc(mid, hi, (v - 0.5) / 0.5);
  return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
};

// phred-quality colour ramp (low = rose/amber, high = teal/cyan)
const qcol = (v: number) => {
  const a: [number, number, number] = [255, 111, 139];
  const b: [number, number, number] = [255, 207, 107];
  const c: [number, number, number] = [42, 240, 194];
  const mixc = (p: [number, number, number], q: [number, number, number], f: number) =>
    [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f];
  const r = v < 0.55 ? mixc(a, b, v / 0.55) : mixc(b, c, (v - 0.55) / 0.45);
  return `rgb(${r[0] | 0},${r[1] | 0},${r[2] | 0})`;
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

// ---------- HERO: DNA double helix + sequence track ----------
const DnaHelix: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const hcy = 236, amp = 88, lambda = 158;
  const k = TAU / lambda;
  const scrollWaves = 2;                 // integer → seamless
  const phase = TAU * t * scrollWaves;
  const scrollPx = t * scrollWaves * lambda;

  // strand polylines
  const N = 150;
  let sa = '', sb = '';
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * cw;
    const s = Math.sin(k * x - phase);
    sa += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (hcy + amp * s).toFixed(1) + ' ';
    sb += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (hcy - amp * s).toFixed(1) + ' ';
  }

  // base-pair rungs
  const rungStep = lambda / 7;
  const startR = Math.floor(scrollPx / rungStep) - 1;
  const nR = Math.ceil(cw / rungStep) + 3;
  const rungs: {x: number; yA: number; yB: number; mag: number; bc: string; cc: string}[] = [];
  for (let j = 0; j < nR; j++) {
    const r = startR + j;
    const x = r * rungStep - scrollPx;
    if (x < -4 || x > cw + 4) continue;
    const s = Math.sin(k * x - phase);
    const mag = Math.abs(s);
    if (mag < 0.06) continue;
    const base = BASES[Math.floor(random('rb' + (((r % 14) + 14) % 14)) * 4)];
    rungs.push({x, yA: hcy + amp * s, yB: hcy - amp * s, mag, bc: BASE_COL[base], cc: BASE_COL[COMP[base]]});
  }

  // sequence track (flowing base cells)
  const trackY = 470, cellW = 30, cellH = 44;
  const off = t * SEQ_PERIOD;
  const start = Math.floor(off) - 1;
  const nCells = Math.ceil(cw / cellW) + 3;
  const caretX = cw * 0.5;
  const cells = [];
  for (let s = 0; s < nCells; s++) {
    const m = start + s;
    const x = (m - off) * cellW;
    if (x < -cellW || x > cw) continue;
    const base = seqBase(m);
    const col = BASE_COL[base];
    const prox = Math.max(0, 1 - Math.abs(x + cellW / 2 - caretX) / (cellW * 1.2));
    cells.push(
      <g key={'c' + m}>
        <rect x={x + 2} y={trackY} width={cellW - 4} height={cellH} rx={6} fill={hexA(col, 0.12 + 0.22 * prox)} stroke={hexA(col, 0.4 + 0.4 * prox)} strokeWidth={1} />
        <text x={x + cellW / 2} y={trackY + cellH / 2 + 6} fill={prox > 0.4 ? C.ink : col} fontFamily={MONO} fontSize={18} fontWeight={700} textAnchor="middle">{base}</text>
      </g>
    );
  }

  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <Glow id="dh_glow" b1={2} b2={7} />
          <linearGradient id="dh_sa" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.cyan} />
            <stop offset="1" stopColor={C.teal} />
          </linearGradient>
          <linearGradient id="dh_sb" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.violet} />
            <stop offset="1" stopColor={C.blue} />
          </linearGradient>
        </defs>

        {/* base-pair rungs */}
        {rungs.map((rg, i) => {
          const op = 0.22 + rg.mag * 0.55;
          const w = 1.4 + rg.mag * 2.2;
          return (
            <g key={'rg' + i}>
              <line x1={rg.x} y1={rg.yA} x2={rg.x} y2={hcy} stroke={hexA(rg.bc, op)} strokeWidth={w} />
              <line x1={rg.x} y1={hcy} x2={rg.x} y2={rg.yB} stroke={hexA(rg.cc, op)} strokeWidth={w} />
              <circle cx={rg.x} cy={rg.yA} r={2.4 + rg.mag * 2.2} fill={rg.bc} filter={rg.mag > 0.7 ? 'url(#dh_glow)' : undefined} />
              <circle cx={rg.x} cy={rg.yB} r={2.4 + rg.mag * 2.2} fill={rg.cc} filter={rg.mag > 0.7 ? 'url(#dh_glow)' : undefined} />
            </g>
          );
        })}

        {/* backbones */}
        <path d={sa} fill="none" stroke="url(#dh_sa)" strokeWidth={3.4} strokeLinecap="round" filter="url(#dh_glow)" />
        <path d={sb} fill="none" stroke="url(#dh_sb)" strokeWidth={3.4} strokeLinecap="round" filter="url(#dh_glow)" />

        {/* sequence track */}
        {cells}
        <line x1={0} y1={trackY + cellH + 12} x2={cw} y2={trackY + cellH + 12} stroke="rgba(120,170,255,0.16)" strokeWidth={1} />
        {(() => {
          const tk = [];
          for (let s = 0; s < nCells; s++) {
            const m = start + s;
            if ((((m % 8) + 8) % 8) !== 0) continue;
            const x = (m - off) * cellW;
            if (x < 0 || x > cw) continue;
            tk.push(<line key={'tk' + m} x1={x} y1={trackY + cellH + 12} x2={x} y2={trackY + cellH + 18} stroke={C.faint} strokeWidth={1} />);
          }
          return tk;
        })()}
        {/* caret */}
        <line x1={caretX} y1={trackY - 8} x2={caretX} y2={trackY + cellH + 8} stroke={hexA(C.amber, 0.5)} strokeWidth={1.4} strokeDasharray="3 4" />
      </svg>

      {/* readouts (inside the on-screen safe band) */}
      <div style={{position: 'absolute', left: 500, top: -2}}>
        <div style={{fontFamily: MONO, fontSize: 12.5, letterSpacing: 1.4, color: C.sub, textShadow: '0 0 12px rgba(5,10,25,0.9)'}}>chr7 · GRCh38</div>
        <div style={{fontFamily: MONO, fontSize: 11, letterSpacing: 1, color: C.faint, marginTop: 3, textShadow: '0 0 12px rgba(5,10,25,0.9)'}}>double-strand · phred Q37</div>
      </div>
      <div style={{position: 'absolute', right: 0, top: -2, textAlign: 'right'}}>
        <div style={{fontFamily: MONO, fontSize: 26, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 22px ${hexA(C.cyan, 0.45)}, 0 0 12px rgba(5,10,25,0.9)`}}>5,432,101</div>
        <div style={{fontFamily: MONO, fontSize: 11, letterSpacing: 1.4, color: C.teal, marginTop: 2, textShadow: '0 0 12px rgba(5,10,25,0.9)'}}>LOCUS · READ DEPTH 38×</div>
      </div>
    </div>
  );
};

// ---------- variant calling (fully-safe panel) ----------
const VARIANTS = [
  {pos: 'chr7:5432101', ref: 'A', alt: 'G', type: 'SNV', q: 0.96, tc: C.cyan},
  {pos: 'chr7:5432140', ref: 'C', alt: 'T', type: 'SNV', q: 0.9, tc: C.cyan},
  {pos: 'chr7:5432188', ref: 'G', alt: '-', type: 'DEL', q: 0.82, tc: C.magenta},
  {pos: 'chr7:5432233', ref: '-', alt: 'AT', type: 'INS', q: 0.78, tc: C.teal},
  {pos: 'chr7:5432291', ref: 'T', alt: 'C', type: 'SNV', q: 0.88, tc: C.cyan},
  {pos: 'chr7:5432340', ref: 'A', alt: 'C', type: 'SNV', q: 0.72, tc: C.cyan},
];

const VariantCalling: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const n = VARIANTS.length;
  const rowH = ch / n;
  const scanY = t * ch;
  const scanOp = 0.12 * Math.sin(Math.PI * t);
  const barX = cw - 96, barW = 62;
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <Glow id="vc_glow" b1={1.6} b2={4} />
      </defs>
      <rect x={0} y={scanY - 18} width={cw} height={36} fill={hexA(C.teal, scanOp)} />
      {VARIANTS.map((v, i) => {
        const cy = i * rowH + rowH / 2;
        const q = clamp(v.q + 0.02 * Math.sin(TAU * (t + i * 0.24)), 0, 1);
        const hot = i === 0;
        return (
          <g key={i}>
            {i > 0 && <line x1={0} y1={i * rowH} x2={cw} y2={i * rowH} stroke={C.grid} strokeWidth={1} />}
            <text x={0} y={cy - 3} fill={hot ? C.ink : C.sub} fontFamily={MONO} fontSize={12.5} fontWeight={hot ? 600 : 400}>{v.pos}</text>
            <text x={0} y={cy + 14} fill={C.faint} fontFamily={MONO} fontSize={11}>
              <tspan fill={C.sub}>{v.ref}</tspan>
              <tspan fill={C.faint}> → </tspan>
              <tspan fill={v.tc}>{v.alt}</tspan>
            </text>
            <rect x={barX - 74} y={cy - 8} width={40} height={16} rx={4} fill={hexA(v.tc, 0.14)} stroke={hexA(v.tc, 0.5)} strokeWidth={1} />
            <text x={barX - 54} y={cy + 4} fill={v.tc} fontFamily={MONO} fontSize={10.5} fontWeight={600} textAnchor="middle">{v.type}</text>
            <rect x={barX} y={cy - 3} width={barW} height={6} rx={3} fill="rgba(120,160,230,0.12)" />
            <rect x={barX} y={cy - 3} width={Math.max(4, q * barW)} height={6} rx={3} fill={hot ? C.teal : C.cyan} filter={hot ? 'url(#vc_glow)' : undefined} />
            <text x={cw} y={cy - 5} fill={hot ? C.teal : C.sub} fontFamily={MONO} fontSize={11} fontWeight={600} textAnchor="end" style={{fontVariantNumeric: 'tabular-nums'}}>{'Q' + Math.round(q * 50)}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ---------- coverage depth histogram (fully-safe panel) ----------
const covDepth = (m: number) => {
  const mm = ((m % 52) + 52) % 52;
  return clamp(0.5 + 0.28 * Math.sin(mm * 0.6) + 0.16 * Math.sin(mm * 1.7 + 1) + 0.12 * (random('cov' + mm) - 0.5) * 2, 0.12, 0.98);
};

const CoverageDepth: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const P = 52;
  const bw = cw / 40;
  const gTop = 44, gBot = ch - 22;
  const off = t * P;
  const start = Math.floor(off) - 1;
  const nBars = Math.ceil(cw / bw) + 3;
  const meanY = gBot - 0.55 * (gBot - gTop);
  const threshY = gBot - 0.3 * (gBot - gTop);
  const bars = [];
  for (let s = 0; s < nBars; s++) {
    const m = start + s;
    const x = (m - off) * bw;
    if (x < -bw || x > cw) continue;
    const d = covDepth(m);
    const h = d * (gBot - gTop);
    bars.push(<rect key={m} x={x + 1} y={gBot - h} width={bw - 2} height={h} rx={1.5} fill={ramp(d)} opacity={0.55 + d * 0.4} />);
  }
  const cur = covDepth(Math.round(off + 20));
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {bars}
        <line x1={0} y1={threshY} x2={cw} y2={threshY} stroke={hexA(C.rose, 0.5)} strokeWidth={1} strokeDasharray="4 5" />
        <line x1={0} y1={meanY} x2={cw} y2={meanY} stroke={hexA(C.cyan, 0.6)} strokeWidth={1.2} />
        <text x={cw} y={meanY - 4} fill={C.cyan} fontFamily={MONO} fontSize={10} textAnchor="end">mean 38×</text>
        <text x={cw} y={threshY - 4} fill={C.rose} fontFamily={MONO} fontSize={10} textAnchor="end">min 10×</text>
      </svg>
      <div style={{position: 'absolute', left: 2, top: -2, display: 'flex', alignItems: 'baseline', gap: 8}}>
        <span style={{fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 20px ${hexA(C.cyan, 0.4)}`}}>{Math.round(cur * 64)}</span>
        <span style={{fontFamily: FONT, fontSize: 13, color: C.sub}}>× depth</span>
      </div>
    </div>
  );
};

// ---------- alignment / pileup map (anchored safe-left) ----------
type Read = {row: number; bx: number; w: number; fwd: boolean; mm: number[]};
const AlignmentMap: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const rows = 9;
  const refY = 4;
  const top = 22;
  const rowH = (ch - top) / rows;
  const wrap = cw + 420;
  const off = (t * wrap) % wrap;

  const reads: Read[] = [];
  for (let r = 0; r < rows; r++) {
    const cnt = 2 + Math.floor(random('rc' + r) * 2);
    for (let i = 0; i < cnt; i++) {
      const bx = random('bx' + r + '-' + i) * wrap;
      const w = 140 + random('rw' + r + '-' + i) * 150;
      const nmm = Math.floor(random('nm' + r + '-' + i) * 3);
      const mm: number[] = [];
      for (let m = 0; m < nmm; m++) mm.push(0.15 + random('mp' + r + '-' + i + '-' + m) * 0.7);
      reads.push({row: r, bx, w, fwd: random('fw' + r + '-' + i) > 0.5, mm});
    }
  }

  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'hidden'}}>
      <defs>
        <Glow id="am_glow" b1={1.2} b2={3.5} />
      </defs>
      {/* reference */}
      <rect x={0} y={refY} width={cw} height={5} rx={2.5} fill={hexA(C.cyan, 0.32)} />
      {Array.from({length: Math.ceil(cw / 46) + 1}).map((_, i) => (
        <line key={'rt' + i} x1={i * 46} y1={refY} x2={i * 46} y2={refY + 5} stroke="rgba(10,18,40,0.8)" strokeWidth={1} />
      ))}
      {/* reads */}
      {reads.map((rd, i) => {
        let x = rd.bx - off;
        if (x < -rd.w) x += wrap;
        if (x > cw) return null;
        const y = top + rd.row * rowH + rowH * 0.18;
        const bh = rowH * 0.6;
        const col = rd.fwd ? C.cyan : C.violet;
        return (
          <g key={'rd' + i}>
            <rect x={x} y={y} width={rd.w} height={bh} rx={bh / 2} fill={hexA(col, 0.26)} stroke={hexA(col, 0.5)} strokeWidth={0.8} />
            {rd.mm.map((mp, j) => {
              const mx = x + mp * rd.w;
              if (mx < 0 || mx > cw) return null;
              const bcol = BASE_COL[BASES[Math.floor(random('mb' + i + '-' + j) * 4)]];
              return <rect key={j} x={mx - 1.5} y={y} width={3} height={bh} rx={1} fill={bcol} filter="url(#am_glow)" />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

// ---------- phred quality strip (narrow safe-left) ----------
const BaseQuality: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const rows = 44;
  const colW = 86;
  const x0 = 8;
  const gap = 1.5;
  const cellH = (ch - 26 - gap * (rows - 1)) / rows;
  const scan = ((t * 2) % 1) * rows;
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <text x={x0} y={12} fill={C.faint} fontFamily={MONO} fontSize={10.5} letterSpacing={1}>PHRED Q</text>
      <text x={x0 + colW} y={12} fill={C.faint} fontFamily={MONO} fontSize={10} letterSpacing={0.5} textAnchor="end">Q37</text>
      {Array.from({length: rows}).map((_, i) => {
        let v = 0.82 + 0.14 * Math.sin(i * 0.5 + 1) - (random('q' + i) > 0.86 ? 0.4 : 0);
        v += 0.1 * Math.sin(TAU * (t * 3 + i * 0.06));
        const sd = Math.exp(-Math.pow(Math.min(Math.abs(i - scan), rows - Math.abs(i - scan)), 2) / 5);
        v = clamp(v + sd * 0.1, 0.05, 1);
        const y = 22 + i * (cellH + gap);
        const bw = colW * (0.3 + 0.7 * v);
        return <rect key={i} x={x0} y={y} width={bw} height={cellH} rx={1.5} fill={qcol(v)} opacity={0.45 + v * 0.5} />;
      })}
      <rect x={x0 - 2} y={20} width={colW + 4} height={ch - 24} rx={3} fill="none" stroke="rgba(120,170,255,0.16)" strokeWidth={1} />
    </svg>
  );
};

// ---------- sequencing rate (safe-right readout) ----------
const RATE: Comp[] = [
  {f: 1.1, h: 1, a: 0.15, p: 0.3},
  {f: 2.4, h: 2, a: 0.08, p: 1.1},
  {f: 3.9, h: 1, a: 0.04, p: 2.0},
];

const SeqRate: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const gx0 = 6, gx1 = cw - 6, gTop = 58, gBot = ch - 26;
  const gw = gx1 - gx0;
  const pts = wavePts(96, gx0, gx1, gTop, gBot, RATE, 0.5, t);
  const area = `${smooth(pts)} L ${gx1} ${gBot} L ${gx0} ${gBot} Z`;
  const fx = t;
  const dv = waveVal(fx, RATE, 0.5, t);
  const dx = gx0 + fx * gw;
  const dy = gBot - dv * (gBot - gTop);
  const edge = interpolate(Math.min(fx, 1 - fx), [0, 0.06], [0, 1], {extrapolateRight: 'clamp'});
  const val = 8420 + 460 * Math.sin(TAU * t) + 120 * Math.sin(TAU * 3 * t + 1);
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="sr_area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.teal} stopOpacity="0.4" />
            <stop offset="0.6" stopColor={C.cyan} stopOpacity="0.12" />
            <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sr_line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.teal} />
            <stop offset="1" stopColor={C.cyan} />
          </linearGradient>
          <Glow id="sr_glow" b1={2.2} b2={7} />
        </defs>
        {[0.33, 0.66, 1].map((r) => (
          <line key={r} x1={gx0} y1={gBot - r * (gBot - gTop)} x2={gx1} y2={gBot - r * (gBot - gTop)} stroke={C.grid} strokeWidth={1} />
        ))}
        <path d={area} fill="url(#sr_area)" />
        <path d={smooth(pts)} fill="none" stroke="url(#sr_line)" strokeWidth={2.6} strokeLinecap="round" filter="url(#sr_glow)" />
        {edge > 0.02 && (
          <>
            <circle cx={dx} cy={dy} r={8} fill={hexA(C.cyan, 0.16 * edge)} />
            <circle cx={dx} cy={dy} r={3.6} fill={C.ink} opacity={edge} filter="url(#sr_glow)" />
          </>
        )}
      </svg>
      <div style={{position: 'absolute', right: 2, top: 0, textAlign: 'right'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end'}}>
          <span style={{fontFamily: MONO, fontSize: 34, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 22px ${hexA(C.cyan, 0.4)}`}}>{nf(val, 0)}</span>
          <span style={{fontFamily: FONT, fontSize: 13, color: C.sub, letterSpacing: 0.5}}>reads/s</span>
        </div>
        <div style={{fontFamily: FONT, fontSize: 10.5, letterSpacing: 2, color: C.faint, textTransform: 'uppercase', marginTop: 2}}>throughput · 60s</div>
      </div>
    </div>
  );
};

// ---------- KPI cards ----------
type Kpi = {label: string; val: number; unit: string; dec: number; delta: string; accent: string; amp: number; seed: string};
const KPIS: Kpi[] = [
  {label: 'READS ALIGNED', val: 48.2, unit: 'M', dec: 1, delta: '▲ 1.2M', accent: C.cyan, amp: 0.2, seed: 'k1'},
  {label: 'MEAN DEPTH', val: 38, unit: '×', dec: 0, delta: '▲ 2×', accent: C.teal, amp: 1.2, seed: 'k2'},
  {label: 'Q30', val: 94.6, unit: '%', dec: 1, delta: '▲ 0.3%', accent: C.violet, amp: 0.3, seed: 'k3'},
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
          <span style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, letterSpacing: 5, color: C.ink, textTransform: 'uppercase'}}>Genomic Sequencer</span>
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2, color: C.faint, marginLeft: 6}}>/ ALIGNMENT</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <PulseDot color={C.teal} t={t} size={8} />
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2.5, color: C.sub}}>PIPELINE · RUNNING</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 190, width: 2400, height: 1, transform: 'translateZ(12px)', background: 'linear-gradient(90deg, rgba(120,180,255,0.35), rgba(120,180,255,0.03))'}} />

      {/* panels */}
      <Frame x={110} y={250} w={1250} h={690} z={0} accent={C.cyan} title="Sequence Track" tag="chr7" t={t}>
        {(cw, ch) => <DnaHelix cw={cw} ch={ch} t={t} />}
      </Frame>

      {KPIS.map((d, i) => (
        <Frame key={d.seed} x={1420 + i * 397} y={250} w={i === 2 ? 300 : 380} h={205} z={80 - i * 22} accent={d.accent} title={d.label} tag="LIVE" t={t}>
          {(cw, ch) => <KpiChart cw={cw} ch={ch} t={t} d={d} />}
        </Frame>
      ))}

      <Frame x={1420} y={485} w={455} h={455} z={120} accent={C.teal} title="Variant Calling" tag="VCF" t={t}>
        {(cw, ch) => <VariantCalling cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1905} y={485} w={460} h={455} z={35} accent={C.violet} title="Base Quality" tag="PHRED" t={t}>
        {(cw, ch) => <BaseQuality cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={110} y={980} w={780} h={430} z={62} accent={C.teal} title="Seq Rate" tag="reads/s" t={t}>
        {(cw, ch) => <SeqRate cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={915} y={980} w={560} h={430} z={-32} accent={C.cyan} title="Coverage Depth" tag="×" t={t}>
        {(cw, ch) => <CoverageDepth cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1500} y={980} w={1010} h={430} z={86} accent={C.blue} title="Alignment Map" tag="PILEUP" t={t}>
        {(cw, ch) => <AlignmentMap cw={cw} ch={ch} t={t} />}
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
