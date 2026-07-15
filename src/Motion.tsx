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
 * AGGREGATE — Holographic Operations Command Center
 * Direction: PREMIUM. A dark, glassmorphic analytics dashboard laid on a
 * floating perspective plane, flown over by a slow cinematic parallax camera.
 * Fully deterministic + seamless loop: every time value is periodic in t∈[0,1).
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

type Comp = {f: number; h: number; a: number; p: number};

// value of a loopable multi-sine field at normalized position fx∈[0,1]
const waveVal = (fx: number, comps: Comp[], base: number, t: number) => {
  let v = base;
  for (const c of comps) v += c.a * Math.sin(TAU * (c.f * fx + c.h * t + c.p));
  return clamp(v, 0.05, 0.95);
};

// sampled points mapped into [x0,x1]×[bottom(top small)..top]
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

// Catmull-Rom → cubic bezier for silky curves
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

// reusable layered glow filter
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

// ---------- charts ----------
const HERO_A: Comp[] = [
  {f: 1.2, h: 1, a: 0.16, p: 0.0},
  {f: 2.6, h: 2, a: 0.09, p: 0.6},
  {f: 4.1, h: 1, a: 0.05, p: 1.3},
  {f: 6.3, h: 3, a: 0.028, p: 2.1},
];
const HERO_B: Comp[] = [
  {f: 1.0, h: 1, a: 0.13, p: 1.4},
  {f: 2.2, h: 2, a: 0.075, p: 0.2},
  {f: 3.7, h: 1, a: 0.04, p: 2.4},
];

const HeroChart: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const gx0 = 6, gx1 = cw - 6, gTop = 64, gBot = ch - 30;
  const gw = gx1 - gx0;
  const p1 = wavePts(120, gx0, gx1, gTop, gBot, HERO_A, 0.54, t);
  const p2 = wavePts(120, gx0, gx1, gTop, gBot, HERO_B, 0.44, t);
  const area = `${smooth(p1)} L ${gx1} ${gBot} L ${gx0} ${gBot} Z`;
  const line1 = smooth(p1);
  const line2 = smooth(p2);
  // travelling readout dot + scan (loop-safe, fades at edges)
  const fx = t;
  const dv = waveVal(fx, HERO_A, 0.54, t);
  const dx = gx0 + fx * gw;
  const dy = gBot - dv * (gBot - gTop);
  const edge = interpolate(Math.min(fx, 1 - fx), [0, 0.06], [0, 1], {extrapolateRight: 'clamp'});
  const rows = [0, 0.25, 0.5, 0.75, 1];
  const val = 84.6 + 3.1 * Math.sin(TAU * t) + 0.9 * Math.sin(TAU * 3 * t + 1);
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="hero_area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.cyan} stopOpacity="0.42" />
            <stop offset="0.55" stopColor={C.blue} stopOpacity="0.14" />
            <stop offset="1" stopColor={C.blue} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero_line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.teal} />
            <stop offset="0.5" stopColor={C.cyan} />
            <stop offset="1" stopColor={C.violet} />
          </linearGradient>
          <Glow id="hero_glow" b1={2.6} b2={9} />
          <Glow id="hero_glow2" b1={1.6} b2={5} />
        </defs>
        {rows.map((r, i) => {
          const gy = gBot - r * (gBot - gTop);
          return <line key={i} x1={gx0} y1={gy} x2={gx1} y2={gy} stroke={C.grid} strokeWidth={1} />;
        })}
        <path d={area} fill="url(#hero_area)" />
        <path d={line2} fill="none" stroke={C.violet} strokeWidth={2} strokeLinecap="round" opacity={0.5} filter="url(#hero_glow2)" />
        <path d={line1} fill="none" stroke="url(#hero_line)" strokeWidth={3} strokeLinecap="round" filter="url(#hero_glow)" />
        {edge > 0.02 && (
          <>
            <line x1={dx} y1={gTop} x2={dx} y2={gBot} stroke={hexA(C.cyan, 0.28 * edge)} strokeWidth={1} />
            <circle cx={dx} cy={dy} r={9} fill={hexA(C.cyan, 0.18 * edge)} />
            <circle cx={dx} cy={dy} r={4} fill={C.ink} opacity={edge} filter="url(#hero_glow2)" />
            <circle cx={dx} cy={dy} r={4} fill="none" stroke={C.cyan} strokeWidth={1.4} opacity={edge} />
          </>
        )}
        {['00:00', '06:00', '12:00', '18:00', '24:00'].map((lab, i) => (
          <text key={lab} x={gx0 + (i / 4) * gw} y={ch - 8} fill={C.faint} fontFamily={MONO} fontSize={11} letterSpacing={1} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}>{lab}</text>
        ))}
        <text x={gx1} y={gTop - 42} fill={C.faint} fontFamily={MONO} fontSize={11} textAnchor="end">100</text>
        <text x={gx1} y={(gTop + gBot) / 2} fill={C.faint} fontFamily={MONO} fontSize={11} textAnchor="end">50</text>
      </svg>
      <div style={{position: 'absolute', left: 2, top: 2, display: 'flex', alignItems: 'baseline', gap: 12}}>
        <span style={{fontFamily: MONO, fontSize: 44, fontWeight: 600, color: C.ink, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 26px ${hexA(C.cyan, 0.45)}`}}>{nf(val, 1)}</span>
        <span style={{fontFamily: FONT, fontSize: 16, color: C.sub, letterSpacing: 1}}>Gb/s</span>
        <span style={{fontFamily: MONO, fontSize: 14, color: C.teal, letterSpacing: 0.5}}>▲ 2.4%</span>
      </div>
      <div style={{position: 'absolute', left: 3, top: 50, fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: C.faint, textTransform: 'uppercase'}}>24h · real-time</div>
    </div>
  );
};

const BarChart: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const n = 9, base = ch - 22, top = 14;
  const gap = 12, bw = (cw - gap * (n - 1)) / n;
  const vals: number[] = [];
  for (let i = 0; i < n; i++) {
    const b = 0.34 + random('bar' + i) * 0.52;
    vals.push(b * (0.82 + 0.18 * (0.5 + 0.5 * Math.sin(TAU * (t + i * 0.12)))));
  }
  let mx = 0;
  vals.forEach((v, i) => {if (v > vals[mx]) mx = i;});
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="bar_f" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={C.blue} stopOpacity="0.35" />
          <stop offset="1" stopColor={C.cyan} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="bar_hi" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={C.violet} stopOpacity="0.5" />
          <stop offset="1" stopColor={C.magenta} stopOpacity="1" />
        </linearGradient>
        <Glow id="bar_glow" b1={2} b2={6} />
      </defs>
      {[0.33, 0.66, 1].map((r) => (
        <line key={r} x1={0} y1={base - r * (base - top)} x2={cw} y2={base - r * (base - top)} stroke={C.grid} strokeWidth={1} />
      ))}
      <line x1={0} y1={base} x2={cw} y2={base} stroke={C.gridHi} strokeWidth={1} />
      {vals.map((v, i) => {
        const bh = v * (base - top);
        const x = i * (bw + gap);
        const hot = i === mx;
        return (
          <g key={i} filter={hot ? 'url(#bar_glow)' : undefined}>
            <rect x={x} y={base - bh} width={bw} height={bh} rx={4} fill={hot ? 'url(#bar_hi)' : 'url(#bar_f)'} opacity={hot ? 1 : 0.9} />
            <circle cx={x + bw / 2} cy={base + 10} r={1.6} fill={C.faint} />
          </g>
        );
      })}
    </svg>
  );
};

const Gauge: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const cx = cw / 2, cy = ch / 2 + 4, R = Math.min(cw, ch) / 2 - 26;
  const circ = TAU * R;
  const val = 0.62 + 0.10 * Math.sin(TAU * t) + 0.035 * Math.sin(TAU * 2 * t + 1);
  const ang = -90 + 360 * t;
  const rad = (ang * Math.PI) / 180;
  const cometX = cx + R * Math.cos(rad);
  const cometY = cy + R * Math.sin(rad);
  const ticks = 48;
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible', position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="g_arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.teal} />
            <stop offset="0.5" stopColor={C.cyan} />
            <stop offset="1" stopColor={C.violet} />
          </linearGradient>
          <Glow id="g_glow" b1={2.4} b2={8} />
        </defs>
        {Array.from({length: ticks}).map((_, i) => {
          const a = (i / ticks) * TAU - Math.PI / 2;
          const on = i / ticks < val;
          const r1 = R + 8, r2 = R + (on ? 16 : 13);
          return (
            <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke={on ? hexA(C.cyan, 0.8) : C.grid} strokeWidth={on ? 2 : 1.5} strokeLinecap="round" />
          );
        })}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(120,160,230,0.14)" strokeWidth={12} />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="url(#g_arc)" strokeWidth={12} strokeLinecap="round" strokeDasharray={`${(val * circ).toFixed(2)} ${circ.toFixed(2)}`} filter="url(#g_glow)" />
        </g>
        <circle cx={cometX} cy={cometY} r={7} fill={C.ink} filter="url(#g_glow)" />
        <circle cx={cometX} cy={cometY} r={7} fill="none" stroke={C.cyan} strokeWidth={1.5} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
        <span style={{fontFamily: MONO, fontSize: 52, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 30px ${hexA(C.cyan, 0.5)}`, marginTop: 4}}>{Math.round(val * 100)}<span style={{fontSize: 24, color: C.sub}}>%</span></span>
        <span style={{fontFamily: FONT, fontSize: 11, letterSpacing: 3, color: C.faint, textTransform: 'uppercase', marginTop: 2}}>utilization</span>
      </div>
    </div>
  );
};

const Radar: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const cx = cw / 2, cy = ch / 2, R = Math.min(cw, ch) / 2 - 14;
  const sweep = 360 * t;
  const blips = Array.from({length: 7}).map((_, i) => ({
    ang: random('ra' + i) * 360,
    rad: (0.32 + random('rr' + i) * 0.6) * R,
  }));
  const rings = [0.28, 0.52, 0.76, 1];
  const axes = [0, 45, 90, 135];
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="rad_sweep" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={hexA(C.cyan, 0.0)} />
          <stop offset="0.7" stopColor={hexA(C.cyan, 0.05)} />
          <stop offset="1" stopColor={hexA(C.cyan, 0.28)} />
        </radialGradient>
        <Glow id="rad_glow" b1={2} b2={6} />
      </defs>
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * r} fill="none" stroke={C.grid} strokeWidth={1} />
      ))}
      {axes.map((a) => {
        const rr = (a * Math.PI) / 180;
        return <line key={a} x1={cx - R * Math.cos(rr)} y1={cy - R * Math.sin(rr)} x2={cx + R * Math.cos(rr)} y2={cy + R * Math.sin(rr)} stroke={C.grid} strokeWidth={1} />;
      })}
      {/* sweep wedge */}
      <g transform={`rotate(${sweep} ${cx} ${cy})`}>
        <path d={`M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx + R * Math.cos(-0.8)} ${cy + R * Math.sin(-0.8)} Z`} fill="url(#rad_sweep)" />
        <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={hexA(C.cyan, 0.75)} strokeWidth={1.5} filter="url(#rad_glow)" />
      </g>
      {blips.map((b, i) => {
        let rel = (sweep - b.ang) % 360;
        if (rel < 0) rel += 360;
        const g = Math.max(0, 1 - rel / 72);
        const a = (b.ang * Math.PI) / 180;
        const px = cx + b.rad * Math.cos(a), py = cy + b.rad * Math.sin(a);
        const op = 0.2 + 0.8 * g;
        return (
          <g key={i}>
            {g > 0.25 && <circle cx={px} cy={py} r={4 + (1 - g) * 10} fill="none" stroke={hexA(C.teal, 0.5 * g)} strokeWidth={1.2} />}
            <circle cx={px} cy={py} r={3 + g * 1.6} fill={g > 0.4 ? C.teal : C.cyan} opacity={op} filter={g > 0.3 ? 'url(#rad_glow)' : undefined} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={2.5} fill={C.ink} />
    </svg>
  );
};

const Candles: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const n = 16, top = 12, bot = ch - 12;
  const gap = 8, bw = (cw - gap * (n - 1)) / n;
  const y = (v: number) => bot - v * (bot - top);
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <Glow id="cs_glow" b1={1.4} b2={4} />
      </defs>
      {[0.25, 0.5, 0.75].map((r) => (
        <line key={r} x1={0} y1={top + r * (bot - top)} x2={cw} y2={top + r * (bot - top)} stroke={C.grid} strokeWidth={1} />
      ))}
      {Array.from({length: n}).map((_, i) => {
        const mid = 0.5 + (random('cm' + i) - 0.5) * 0.42 + 0.06 * Math.sin(TAU * (t + i * 0.1));
        const o = mid + (random('co' + i) - 0.5) * 0.12;
        const c = mid + (random('cc' + i) - 0.5) * 0.12 + 0.05 * Math.sin(TAU * (t + i * 0.17));
        const hi = Math.max(o, c) + 0.02 + random('ch' + i) * 0.05;
        const lo = Math.min(o, c) - 0.02 - random('cl' + i) * 0.05;
        const up = c >= o;
        const col = up ? C.teal : C.magenta;
        const x = i * (bw + gap) + bw / 2;
        const yo = y(o), yc = y(c);
        return (
          <g key={i} opacity={0.95}>
            <line x1={x} y1={y(hi)} x2={x} y2={y(lo)} stroke={hexA(col, 0.6)} strokeWidth={1.2} />
            <rect x={x - bw / 2} y={Math.min(yo, yc)} width={bw} height={Math.max(2, Math.abs(yo - yc))} rx={1.5} fill={col} filter={up ? 'url(#cs_glow)' : undefined} opacity={up ? 0.95 : 0.8} />
          </g>
        );
      })}
    </svg>
  );
};

const Ops: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const rows = [
    {label: 'INGEST', sub: 'stream · shard-0', base: 0.74, accent: C.cyan},
    {label: 'COMPUTE', sub: 'kernel pool', base: 0.58, accent: C.teal},
    {label: 'STORAGE', sub: 'cold tier', base: 0.42, accent: C.violet},
    {label: 'EGRESS', sub: 'edge relay', base: 0.66, accent: C.blue},
  ];
  const rh = ch / rows.length;
  const trackX = 168;
  const trackW = cw - trackX - 74;
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <Glow id="op_glow" b1={1.6} b2={5} />
        {rows.map((r, i) => (
          <linearGradient key={i} id={`op_g${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={hexA(r.accent, 0.5)} />
            <stop offset="1" stopColor={r.accent} />
          </linearGradient>
        ))}
      </defs>
      {rows.map((r, i) => {
        const cy = i * rh + rh / 2;
        const val = clamp(r.base + 0.08 * Math.sin(TAU * (t + i * 0.2)), 0.05, 0.98);
        return (
          <g key={i}>
            {i > 0 && <line x1={0} y1={i * rh} x2={cw} y2={i * rh} stroke={C.grid} strokeWidth={1} />}
            <text x={0} y={cy - 3} fill={C.ink} fontFamily={FONT} fontSize={13.5} fontWeight={600} letterSpacing={1.4}>{r.label}</text>
            <text x={0} y={cy + 14} fill={C.faint} fontFamily={MONO} fontSize={10.5} letterSpacing={0.5}>{r.sub}</text>
            <rect x={trackX} y={cy - 5} width={trackW} height={10} rx={5} fill="rgba(120,160,230,0.12)" />
            <rect x={trackX} y={cy - 5} width={Math.max(10, val * trackW)} height={10} rx={5} fill={`url(#op_g${i})`} filter="url(#op_glow)" />
            <circle cx={trackX + Math.max(10, val * trackW)} cy={cy} r={4} fill={C.ink} filter="url(#op_glow)" />
            <text x={cw} y={cy + 5} fill={r.accent} fontFamily={MONO} fontSize={16} fontWeight={600} textAnchor="end" style={{fontVariantNumeric: 'tabular-nums'}}>{Math.round(val * 100)}%</text>
          </g>
        );
      })}
    </svg>
  );
};

type Kpi = {label: string; val: number; unit: string; dec: number; delta: string; accent: string; amp: number; seed: string};
const KPIS: Kpi[] = [
  {label: 'DATA THROUGHPUT', val: 84.6, unit: 'Gb/s', dec: 1, delta: '▲ 2.4%', accent: C.cyan, amp: 2.0, seed: 'k1'},
  {label: 'ACTIVE NODES', val: 12480, unit: '', dec: 0, delta: '▲ 1.1%', accent: C.teal, amp: 60, seed: 'k2'},
  {label: 'MESSAGES / SEC', val: 946, unit: '', dec: 0, delta: '▲ 0.8%', accent: C.violet, amp: 22, seed: 'k3'},
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
          <linearGradient id={`sp_${d.seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={d.accent} stopOpacity="0.4" />
            <stop offset="1" stopColor={d.accent} stopOpacity="0" />
          </linearGradient>
          <Glow id={`spg_${d.seed}`} b1={1.4} b2={4} />
        </defs>
        <path d={area} fill={`url(#sp_${d.seed})`} />
        <path d={smooth(pts)} fill="none" stroke={d.accent} strokeWidth={2} strokeLinecap="round" filter={`url(#spg_${d.seed})`} />
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
      {/* holographic floor grid, parallaxes behind the panels */}
      <div style={{position: 'absolute', left: '50%', top: '50%', width: GW, height: GH, transform: 'translate(-50%,-50%) translateZ(-175px)'}}>
        <svg width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`}>
          <defs>
            <radialGradient id="gp_fade" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="gp_mask"><rect width={GW} height={GH} fill="url(#gp_fade)" /></mask>
          </defs>
          <g mask="url(#gp_mask)">
            {Array.from({length: vlines + 1}).map((_, i) => (
              <line key={'v' + i} x1={i * gStep} y1={0} x2={i * gStep} y2={GH} stroke={i % 5 === 0 ? C.gridHi : C.grid} strokeWidth={i % 5 === 0 ? 1.4 : 1} />
            ))}
            {Array.from({length: hlines + 1}).map((_, i) => (
              <line key={'h' + i} x1={0} y1={i * gStep} x2={GW} y2={i * gStep} stroke={i % 5 === 0 ? C.gridHi : C.grid} strokeWidth={i % 5 === 0 ? 1.4 : 1} />
            ))}
          </g>
        </svg>
      </div>

      {/* dashboard header strip */}
      <div style={{position: 'absolute', left: 110, top: 128, width: 2400, height: 60, transform: 'translateZ(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backfaceVisibility: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{width: 16, height: 16, transform: 'rotate(45deg)', border: `2px solid ${C.cyan}`, boxShadow: `0 0 16px ${hexA(C.cyan, 0.7)}`, borderRadius: 3, display: 'inline-block'}} />
          <span style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, letterSpacing: 5, color: C.ink, textTransform: 'uppercase'}}>Operations Overview</span>
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2, color: C.faint, marginLeft: 6}}>/ REAL-TIME</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <PulseDot color={C.teal} t={t} size={8} />
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2.5, color: C.sub}}>SYSTEMS · NOMINAL</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 190, width: 2400, height: 1, transform: 'translateZ(12px)', background: 'linear-gradient(90deg, rgba(120,180,255,0.35), rgba(120,180,255,0.03))'}} />

      {/* panels */}
      <Frame x={110} y={250} w={1250} h={690} z={0} accent={C.cyan} title="Aggregate Throughput" tag="24H" t={t}>
        {(cw, ch) => <HeroChart cw={cw} ch={ch} t={t} />}
      </Frame>

      {KPIS.map((d, i) => (
        <Frame key={d.seed} x={1420 + i * 397} y={250} w={i === 2 ? 300 : 380} h={205} z={80 - i * 22} accent={d.accent} title={d.label} tag="LIVE" t={t}>
          {(cw, ch) => <KpiChart cw={cw} ch={ch} t={t} d={d} />}
        </Frame>
      ))}

      <Frame x={1420} y={485} w={455} h={455} z={120} accent={C.teal} title="System Load" tag="1M" t={t}>
        {(cw, ch) => <Gauge cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1905} y={485} w={460} h={455} z={35} accent={C.violet} title="Signal Matrix" tag="SCAN" t={t}>
        {(cw, ch) => <Radar cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={110} y={980} w={780} h={430} z={62} accent={C.cyan} title="Sector Volume" tag="LIVE" t={t}>
        {(cw, ch) => <BarChart cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={915} y={980} w={560} h={430} z={-32} accent={C.magenta} title="Growth Index" tag="1H" t={t}>
        {(cw, ch) => <Candles cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1500} y={980} w={1010} h={430} z={86} accent={C.blue} title="Live Operations" tag="STREAM" t={t}>
        {(cw, ch) => <Ops cw={cw} ch={ch} t={t} />}
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

  // ambient background glows (loop-safe drift)
  const g1x = 26 + 6 * Math.sin(TAU * t);
  const g1y = 22 + 5 * Math.cos(TAU * t + 1);
  const g2x = 74 + 6 * Math.sin(TAU * t + 2);
  const g2y = 78 + 5 * Math.cos(TAU * t);

  // subtle scan sweep down the frame
  const scanY = t;
  const scanEdge = interpolate(Math.min(scanY, 1 - scanY), [0, 0.08], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <AbsoluteFill style={{background: 'radial-gradient(130% 100% at 50% 28%, #0c1834 0%, #081124 42%, #050a17 72%, #03060f 100%)', fontFamily: FONT}}>
      {/* ambient accent glows */}
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>
        <div style={{position: 'absolute', left: `${g1x}%`, top: `${g1y}%`, width: 1100, height: 1100, marginLeft: -550, marginTop: -550, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(C.cyan, 0.16)} 0%, ${hexA(C.cyan, 0)} 66%)`}} />
        <div style={{position: 'absolute', left: `${g2x}%`, top: `${g2y}%`, width: 1200, height: 1200, marginLeft: -600, marginTop: -600, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(C.violet, 0.14)} 0%, ${hexA(C.violet, 0)} 66%)`}} />
        <div style={{position: 'absolute', left: '50%', top: '46%', width: 1500, height: 900, marginLeft: -750, marginTop: -450, borderRadius: '50%', background: `radial-gradient(ellipse, ${hexA(C.blue, 0.10)} 0%, ${hexA(C.blue, 0)} 70%)`}} />
      </AbsoluteFill>

      <Bokeh t={t} count={26} seedp="bg" />

      {/* 3D stage */}
      <AbsoluteFill style={{perspective: '1400px', perspectiveOrigin: '50% 42%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <World t={t} />
      </AbsoluteFill>

      <Bokeh t={t} count={7} seedp="fg" front />

      {/* scan sweep */}
      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.5 * scanEdge}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: `${scanY * 100}%`, height: 140, marginTop: -70, background: `linear-gradient(180deg, transparent, ${hexA(C.cyan, 0.10)} 50%, transparent)`}} />
      </AbsoluteFill>

      {/* vignette */}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(120% 120% at 50% 44%, transparent 52%, rgba(2,4,10,0.55) 82%, rgba(1,3,8,0.9) 100%)'}} />

      {/* dither/noise to kill banding on dark gradients */}
      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.05}}>
        <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none">
          <filter id="nz_n" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" />
          </filter>
          <rect width="960" height="540" filter="url(#nz_n)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Motion;
