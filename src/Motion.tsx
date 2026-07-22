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
 * BULL MARKET — CANDLESTICK RUN (PREMIUM)
 * Green candlesticks print left→right into a glowing uptrend with pullbacks, a
 * thick momentum trend arrow rises through the closes and lands a big arrowhead
 * at the top-right, the index value + "▲ +%" badge climb, volume bars grow and
 * bullish particles stream upward. Dark trading-terminal look with green glow.
 * Stocks / crypto / trading. Deterministic. IP-safe (fictional symbol). 1920x1080.
 */

const INK = '#eaf4ff';
const SUB = '#7f93b0';
const UP = '#1ce38f';
const DOWN = '#ff5470';
const TREND = '#37ffab';
const GRIDC = 'rgba(120,150,200,0.10)';
const clampO = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const EO = Easing.out(Easing.cubic);

/* plot */
const XL = 140, XR = 1636, YT = 300, YB = 838;
const VOLB = 942, VOLTOP = 860;
const NC = 28;
const slot = (XR - XL) / NC;
const bw = slot * 0.5;
const cxOf = (i: number) => XL + slot * (i + 0.5);
const yOf = (n: number) => YB - n * (YB - YT);

/* deterministic bullish candle series */
type C = { o: number; c: number; hi: number; lo: number; up: boolean };
const CANDLES: C[] = (() => {
  const out: C[] = [];
  let p = 0.14;
  for (let i = 0; i < NC; i++) {
    const drift = (random(`d${i}`) - 0.34) * 0.1 + 0.006;
    const o = p;
    const c = Math.min(0.95, Math.max(0.06, p + drift));
    const rng = random(`r${i}`) * 0.028 + 0.012;
    out.push({ o, c, hi: Math.min(0.99, Math.max(o, c) + rng), lo: Math.max(0.03, Math.min(o, c) - rng), up: c >= o });
    p = c;
  }
  return out;
})();
const CLOSES = CANDLES.map((c) => c.c);
const VALof = (n: number) => 6000 + n * 41000;
const START = (i: number) => 34 + i * 17;
const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

/* catmull smoothing for the trend arrow */
type Pt = number[];
const catmull = (pts: Pt[], seg: number): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const reveal = interpolate(frame, [34, 34 + (NC - 1) * 17], [0, NC - 1], clampO);
  const ri = Math.floor(reveal);
  const rf = reveal - ri;
  const leadClose = CLOSES[Math.min(NC - 1, ri)] + (CLOSES[Math.min(NC - 1, ri + 1)] - CLOSES[Math.min(NC - 1, ri)]) * rf;
  const value = VALof(leadClose);
  const pct = (value / VALof(CLOSES[0]) - 1) * 100;

  /* trend arrow path through revealed closes */
  const revClosePts: Pt[] = [];
  for (let i = 0; i <= Math.min(NC - 1, ri); i++) revClosePts.push([cxOf(i), yOf(CLOSES[i] * Math.min(1, (reveal - i + 1)))]);
  // leading (partial) point
  if (ri < NC - 1) revClosePts.push([cxOf(ri) + rf * slot, yOf(leadClose)]);
  const dense = revClosePts.length >= 2 ? catmull(revClosePts, 12) : revClosePts;
  const trendPath = dense.length ? 'M ' + dense.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ') : '';
  const areaPath = dense.length >= 2 ? trendPath + ` L ${dense[dense.length - 1][0].toFixed(1)} ${YB} L ${dense[0][0].toFixed(1)} ${YB} Z` : '';
  const lead = dense[dense.length - 1] || [XL, YB];
  const leadPrev = dense[Math.max(0, dense.length - 6)] || [XL, YB];
  const arrAng = Math.atan2(lead[1] - leadPrev[1], lead[0] - leadPrev[0]);
  const climax = interpolate(frame, [START(NC - 1) + 6, START(NC - 1) + 40], [0, 1], clampO);
  const arrowSize = 30 + 20 * climax + 4 * Math.sin(frame * 0.16);

  const liveFlick = ri >= NC - 1 ? Math.sin(frame * 0.28) * 6 : 0;

  /* rising particles */
  const parts = [];
  for (let i = 0; i < 34; i++) {
    const px = XL + random(`px${i}`) * (XR - XL);
    const py = YB - ((frame * (1.1 + random(`ps${i}`) * 1.6) + random(`pp${i}`) * 900) % 900);
    const s = 1.4 + random(`pr${i}`) * 3;
    parts.push(<circle key={i} cx={px} cy={py} r={s} fill={UP} opacity={0.1 + random(`po${i}`) * 0.22} filter="url(#bsoft)" />);
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#04070e' }}>
      <svg width={width} height={height} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="bbg" cx="42%" cy="30%" r="85%">
            <stop offset="0" stopColor="#0a1a26" />
            <stop offset="0.55" stopColor="#06101c" />
            <stop offset="1" stopColor="#03060d" />
          </radialGradient>
          <linearGradient id="cUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6bffc4" /><stop offset="1" stopColor="#0fbf78" /></linearGradient>
          <linearGradient id="cDn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8098" /><stop offset="1" stopColor="#e0223f" /></linearGradient>
          <linearGradient id="trendA" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#1ce38f" /><stop offset="1" stopColor="#7dffc8" /></linearGradient>
          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={UP} stopOpacity="0.3" /><stop offset="1" stopColor={UP} stopOpacity="0" /></linearGradient>
          <radialGradient id="gGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={UP} stopOpacity="0.5" /><stop offset="1" stopColor={UP} stopOpacity="0" /></radialGradient>
          <filter id="bsoft" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="bglow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="bglowS" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="bgrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" stitchTiles="stitch" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" /></filter>
          <radialGradient id="bvig" cx="50%" cy="50%" r="72%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
          <clipPath id="revClip"><rect x="0" y="0" width={lead[0] + 4} height="1080" /></clipPath>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#bbg)" />
        {parts}

        {/* grid + price axis */}
        {[0, 0.25, 0.5, 0.75, 1].map((n) => {
          const y = yOf(n);
          return (
            <g key={n} opacity={interpolate(frame, [8, 30], [0, 1], clampO)}>
              <line x1={XL} y1={y} x2={XR} y2={y} stroke={GRIDC} strokeWidth="1.2" strokeDasharray="2 10" />
              <text x={XR + 26} y={y + 6} fontSize="18" fill={SUB} textAnchor="start" fontFamily="'DejaVu Sans Mono', ui-monospace, monospace" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(VALof(n))}</text>
            </g>
          );
        })}
        <line x1={XL} y1={YB} x2={XR} y2={YB} stroke="rgba(150,175,220,0.28)" strokeWidth="2" />

        {/* volume bars */}
        {CANDLES.map((c, i) => {
          const g = interpolate(frame, [START(i), START(i) + 14], [0, 1], { ...clampO, easing: EO });
          if (g <= 0) return null;
          const h = (0.28 + random(`v${i}`) * 0.72) * (VOLB - VOLTOP) * g;
          return <rect key={i} x={cxOf(i) - bw / 2} y={VOLB - h} width={bw} height={h} rx="2" fill={c.up ? UP : DOWN} opacity="0.32" />;
        })}

        {/* trend area + arrow */}
        {dense.length >= 2 && (
          <>
            <path d={areaPath} fill="url(#areaG)" />
            <g filter="url(#bglowS)">
              <path d={trendPath} fill="none" stroke="url(#trendA)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </>
        )}

        {/* candlesticks */}
        {CANDLES.map((c, i) => {
          const g = interpolate(frame, [START(i), START(i) + 14], [0, 1], { ...clampO, easing: EO });
          if (g <= 0.001) return null;
          const cx = cxOf(i);
          const isLast = i === NC - 1;
          const flick = isLast ? liveFlick : 0;
          const yHi = yOf(c.hi), yLo = yOf(c.lo);
          const bt = yOf(Math.max(c.o, c.c)) + (isLast ? Math.min(0, flick) : 0);
          const bb = yOf(Math.min(c.o, c.c));
          const midY = (bt + bb) / 2;
          const bh = Math.max(bb - bt, 3);
          const col = c.up ? UP : DOWN;
          return (
            <g key={i} transform={`translate(${cx} ${midY}) scale(1 ${g.toFixed(3)}) translate(${-cx} ${-midY})`} opacity={interpolate(g, [0, 0.4], [0, 1], clampO)} filter="url(#bglow)">
              <line x1={cx} y1={yHi} x2={cx} y2={yLo} stroke={col} strokeWidth="2.4" />
              <rect x={cx - bw / 2} y={bt} width={bw} height={bh} rx="3" fill={c.up ? 'url(#cUp)' : 'url(#cDn)'} />
            </g>
          );
        })}

        {/* leading momentum arrowhead */}
        {dense.length >= 2 && (() => {
          const tipx = lead[0] + Math.cos(arrAng) * (10 + climax * 8);
          const tipy = lead[1] + Math.sin(arrAng) * (10 + climax * 8);
          return (
            <g filter="url(#bglowS)">
              <circle cx={lead[0]} cy={lead[1]} r={40 + 30 * climax} fill="url(#gGlow)" opacity={0.5 + 0.4 * climax} />
              <path d={`M ${tipx} ${tipy} L ${tipx + Math.cos(arrAng + 2.55) * arrowSize} ${tipy + Math.sin(arrAng + 2.55) * arrowSize} L ${tipx + Math.cos(arrAng - 2.55) * arrowSize} ${tipy + Math.sin(arrAng - 2.55) * arrowSize} Z`} fill={TREND} />
              <circle cx={lead[0]} cy={lead[1]} r="7" fill="#eafff6" />
            </g>
          );
        })()}

        {/* header index */}
        <text x="112" y="120" fontSize="22" fontWeight="700" fill={SUB} letterSpacing="4" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">AURUM  ·  MARKET INDEX</text>
        <text x="108" y="196" fontSize="78" fontWeight="800" fill={INK} fontFamily="Inter, 'Segoe UI', Arial, sans-serif" filter="url(#bglow)" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(value)}</text>
        <g transform="translate(118 236)" opacity={interpolate(frame, [40, 70], [0, 1], clampO)}>
          <rect x="0" y="-26" width="230" height="42" rx="21" fill="rgba(28,227,143,0.14)" stroke="rgba(28,227,143,0.5)" strokeWidth="1.4" />
          <path d="M 30 6 l 11 -15 l 11 15 z" fill={UP} />
          <text x="128" y="4" fontSize="25" fontWeight="800" fill={UP} textAnchor="middle" fontFamily="Inter, 'Segoe UI', Arial, sans-serif" style={{ fontVariantNumeric: 'tabular-nums' }}>{'+' + Math.round(pct) + '%'}</text>
        </g>

        {/* BULL MARKET tag (climax) */}
        <g transform="translate(1808 120)" opacity={climax} textAnchor="end">
          <text x="0" y="0" fontSize="40" fontWeight="900" fill={UP} textAnchor="end" letterSpacing="3" fontFamily="Inter, 'Segoe UI', Arial, sans-serif" filter="url(#bglowS)">BULL MARKET</text>
          <text x="0" y="30" fontSize="18" fontWeight="600" fill={SUB} textAnchor="end" letterSpacing="6" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">STRONG MOMENTUM</text>
        </g>

        <rect x="0" y="0" width="1920" height="1080" filter="url(#bgrain)" opacity="0.035" style={{ mixBlendMode: 'overlay' }} />
        <rect x="0" y="0" width="1920" height="1080" fill="url(#bvig)" />
      </svg>
    </AbsoluteFill>
  );
};
