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
   BUSINESS ANALYTICS DASHBOARD — DATA REVEAL
   Premium microstock motion graphic. 1920x1080 @ 60fps, 900 frames (15s).
   Dark fintech / SaaS style. Self-contained: core Remotion + SVG + CSS.
   ========================================================================== */

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const NUM = {fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"'} as const;

// ---- palette -------------------------------------------------------------
const C = {
  bg0: '#070B16',
  bg1: '#0B1122',
  panel: 'rgba(255,255,255,0.045)',
  panelBorder: 'rgba(255,255,255,0.09)',
  text: '#EAF0FF',
  sub: '#8894B4',
  faint: '#5A6688',
  grid: 'rgba(255,255,255,0.06)',
  blue: '#3E86FF',
  cyan: '#22D3EE',
  green: '#34E0A1',
  red: '#FF6B8A',
  purple: '#8B7CFF',
  amber: '#FFB25E',
};

// ---- easings -------------------------------------------------------------
const eOut = Easing.out(Easing.cubic);
const eExpo = Easing.bezier(0.16, 1, 0.3, 1);
const eInOut = Easing.inOut(Easing.cubic);

// ---- helpers -------------------------------------------------------------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const fmt = (v: number, dec: number) => {
  const f = v.toFixed(dec);
  const parts = f.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const ease = (frame: number, a: number, b: number, easing = eExpo) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

// Catmull-Rom -> smooth bezier path
const smoothPath = (pts: {x: number; y: number}[]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

/* ============================================================================
   TIMELINE
   ========================================================================== */
const T = {
  shellIn: 4,
  topBar: 8,
  kpiCountStart: 54,
  kpiCountEnd: 250,
  sparkStart: 70,
  sparkEnd: 210,
  lineStart: 120,
  lineEnd: 336,
  barStart: 200,
  donutStart: 210,
  donutEnd: 430,
  chanStart: 250,
  chanEnd: 440,
  pushStart: 430,
  pushEnd: 690,
  refresh: 726,
  refreshEnd: 828,
};

/* ============================================================================
   LAYOUT (content 60..1860)
   ========================================================================== */
const L = {
  cx: 60,
  cw: 1800,
  kpiY: 148,
  kpiH: 168,
  kpiGap: 26.7,
  kpiW: 430,
  mainY: 344,
  mainH: 372,
  leftW: 1180,
  rightX: 1266,
  rightW: 594,
  botY: 740,
  botH: 272,
};

/* ============================================================================
   DATA
   ========================================================================== */
const KPIS = [
  {label: 'Total Revenue', prefix: '$', suffix: '', value: 2847392, dec: 0, delta: '+18.4%', up: true, color: C.blue, spark: [0.30, 0.44, 0.38, 0.55, 0.5, 0.66, 0.6, 0.8, 0.92]},
  {label: 'Active Users', prefix: '', suffix: '', value: 84120, dec: 0, delta: '+12.7%', up: true, color: C.cyan, spark: [0.4, 0.42, 0.5, 0.47, 0.6, 0.57, 0.7, 0.78, 0.86]},
  {label: 'Conversion Rate', prefix: '', suffix: '%', value: 4.82, dec: 2, delta: '+2.1%', up: true, color: C.green, spark: [0.35, 0.5, 0.44, 0.6, 0.72, 0.66, 0.8, 0.85, 0.95]},
  {label: 'Avg. Order Value', prefix: '$', suffix: '', value: 128.4, dec: 2, delta: '-1.3%', up: false, color: C.amber, spark: [0.7, 0.66, 0.72, 0.58, 0.62, 0.5, 0.54, 0.45, 0.4]},
];

const LINE = [0.30, 0.36, 0.32, 0.45, 0.5, 0.45, 0.58, 0.64, 0.6, 0.73, 0.8, 0.93];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BARS = [0.5, 0.62, 0.55, 0.72, 0.67, 0.82, 0.78, 0.94];
const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
const SEG = [
  {name: 'Organic', frac: 0.42, color: C.cyan},
  {name: 'Direct', frac: 0.28, color: C.blue},
  {name: 'Referral', frac: 0.18, color: C.purple},
  {name: 'Social', frac: 0.12, color: C.amber},
];
const CHAN = [
  {name: 'Organic Search', pct: 82, color: C.cyan},
  {name: 'Direct Traffic', pct: 64, color: C.blue},
  {name: 'Referral', pct: 47, color: C.purple},
  {name: 'Social Media', pct: 31, color: C.amber},
];

/* ============================================================================
   BACKGROUND
   ========================================================================== */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 25% 8%, #10203E 0%, ${C.bg1} 42%, ${C.bg0} 100%)`,
        }}
      />
      {[
        {c: '#1E5BFF', s: 1100, x: 260, y: 120, a: 0.28, sp: 1},
        {c: '#7C4DFF', s: 900, x: 1700, y: 260, a: 0.22, sp: 1.5},
        {c: '#12C8E0', s: 820, x: 1500, y: 1000, a: 0.16, sp: 1.1},
      ].map((b, i) => {
        const dx = Math.sin(frame / (170 * b.sp) + i) * 50;
        const dy = Math.cos(frame / (190 * b.sp) + i) * 40;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x - b.s / 2 + dx,
              top: b.y - b.s / 2 + dy,
              width: b.s,
              height: b.s,
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, rgba(0,0,0,0) 68%)`,
              opacity: b.a,
              filter: 'blur(20px)',
            }}
          />
        );
      })}
      <AbsoluteFill style={{opacity: 0.5}}>
        <svg width="1920" height="1080">
          <defs>
            <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
              <path d="M46 0 L0 0 0 46" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1920" height="1080" fill="url(#grid)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

/* ============================================================================
   PANEL
   ========================================================================== */
const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  children?: React.ReactNode;
}> = ({x, y, w, h, delay, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - T.shellIn - delay, fps, config: {damping: 20, mass: 0.8, stiffness: 110}});
  const op = interpolate(s, [0, 1], [0, 1]);
  const ty = interpolate(s, [0, 1], [26, 0]);
  const sc = interpolate(s, [0, 1], [0.985, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: op,
        transform: `translateY(${ty}px) scale(${sc})`,
        transformOrigin: 'center',
        borderRadius: 22,
        background: C.panel,
        border: `1px solid ${C.panelBorder}`,
        boxShadow: '0 30px 70px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </div>
  );
};

const PanelTitle: React.FC<{children: React.ReactNode; sub?: string}> = ({children, sub}) => (
  <div style={{position: 'absolute', top: 24, left: 28, right: 28, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
    <span style={{fontFamily: FONT, fontSize: 21, fontWeight: 600, color: C.text, letterSpacing: 0.2}}>{children}</span>
    {sub ? <span style={{fontFamily: FONT, fontSize: 15, fontWeight: 500, color: C.faint}}>{sub}</span> : null}
  </div>
);

/* ============================================================================
   TOP BAR
   ========================================================================== */
const TopBar: React.FC = () => {
  const frame = useCurrentFrame();
  const op = ease(frame, T.topBar, T.topBar + 24, eOut);
  const ty = interpolate(op, [0, 1], [-14, 0]);
  const ranges = ['24H', '7D', '30D', '12M'];
  const pulse = 0.5 + 0.5 * Math.sin(frame / 14);
  return (
    <div style={{position: 'absolute', left: 60, top: 50, width: 1800, height: 66, opacity: op, transform: `translateY(${ty}px)`, display: 'flex', alignItems: 'center'}}>
      <div style={{width: 42, height: 42, borderRadius: 12, background: `linear-gradient(145deg,${C.cyan},${C.blue})`, boxShadow: `0 8px 20px -6px ${C.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M4 15 L9 9 L13 13 L20 5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="5" r="2.4" fill="#fff" />
        </svg>
      </div>
      <span style={{fontFamily: FONT, fontSize: 23, fontWeight: 700, color: C.text, marginLeft: 14, letterSpacing: -0.2}}>Insightly</span>
      <div style={{width: 1, height: 26, background: 'rgba(255,255,255,0.12)', margin: '0 22px'}} />
      <span style={{fontFamily: FONT, fontSize: 19, fontWeight: 500, color: C.sub}}>Analytics Overview</span>

      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 20, background: 'rgba(52,224,161,0.12)', border: `1px solid rgba(52,224,161,0.3)`}}>
          <div style={{width: 8, height: 8, borderRadius: 4, background: C.green, opacity: 0.5 + pulse * 0.5, boxShadow: `0 0 ${6 + pulse * 8}px ${C.green}`}} />
          <span style={{fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.green, letterSpacing: 0.5}}>LIVE</span>
        </div>
        <div style={{display: 'flex', padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.panelBorder}`}}>
          {ranges.map((r) => {
            const active = r === '30D';
            return (
              <div key={r} style={{padding: '7px 15px', borderRadius: 10, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: active ? '#fff' : C.faint, background: active ? `linear-gradient(145deg,${C.blue},#2A5FD0)` : 'transparent'}}>{r}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   KPI TILE
   ========================================================================== */
const KpiTile: React.FC<{i: number; d: (typeof KPIS)[number]; x: number}> = ({i, d, x}) => {
  const frame = useCurrentFrame();
  const prog = ease(frame, T.kpiCountStart + i * 6, T.kpiCountEnd, eExpo);
  const val = d.value * prog;

  const sW = 120;
  const sH = 42;
  const spts = d.spark.map((v, k) => ({x: (k / (d.spark.length - 1)) * sW, y: sH - v * sH}));
  const sp = ease(frame, T.sparkStart + i * 8, T.sparkEnd, eOut);
  const deltaOp = ease(frame, T.kpiCountStart + i * 6 + 20, T.kpiCountStart + i * 6 + 44, eOut);

  return (
    <Panel x={x} y={L.kpiY} w={L.kpiW} h={L.kpiH} delay={6 + i * 5}>
      <div style={{position: 'absolute', inset: 0, padding: 26}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{width: 10, height: 10, borderRadius: 3, background: d.color, boxShadow: `0 0 10px ${d.color}`}} />
          <span style={{fontFamily: FONT, fontSize: 16, fontWeight: 500, color: C.sub}}>{d.label}</span>
        </div>
        <div style={{marginTop: 16}}>
          <span style={{fontFamily: FONT, fontSize: 40, fontWeight: 700, color: C.text, letterSpacing: -1, ...NUM}}>
            {d.prefix}
            {fmt(val, d.dec)}
            {d.suffix}
          </span>
        </div>
        <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, opacity: deltaOp}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 8, background: d.up ? 'rgba(52,224,161,0.14)' : 'rgba(255,107,138,0.14)'}}>
            <svg width="11" height="11" viewBox="0 0 12 12" style={{transform: d.up ? 'none' : 'rotate(180deg)'}}>
              <path d="M6 2 L10 8 L2 8 Z" fill={d.up ? C.green : C.red} />
            </svg>
            <span style={{fontFamily: FONT, fontSize: 13, fontWeight: 700, color: d.up ? C.green : C.red, ...NUM}}>{d.delta}</span>
          </div>
          <span style={{fontFamily: FONT, fontSize: 13, color: C.faint}}>vs last month</span>
        </div>

        {/* mini sparkline, top-right */}
        <svg width={sW} height={sH} style={{position: 'absolute', right: 26, top: 30, overflow: 'visible'}} viewBox={`0 0 ${sW} ${sH}`}>
          <defs>
            <linearGradient id={`sg${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={d.color} stopOpacity="0" />
            </linearGradient>
            <clipPath id={`sc${i}`}>
              <rect x="0" y="-6" width={sp * sW} height={sH + 12} />
            </clipPath>
          </defs>
          <g clipPath={`url(#sc${i})`}>
            <path d={`${smoothPath(spts)} L ${sW} ${sH} L 0 ${sH} Z`} fill={`url(#sg${i})`} />
            <path d={smoothPath(spts)} fill="none" stroke={d.color} strokeWidth={2.4} strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </Panel>
  );
};

/* ============================================================================
   LINE / AREA CHART
   ========================================================================== */
const LineChart: React.FC = () => {
  const frame = useCurrentFrame();
  const W = L.leftW;
  const PH = L.mainH;
  const svgTop = 62;
  const VBW = W;
  const VBH = 300;
  const plotL = 52;
  const plotR = W - 38;
  const plotW = plotR - plotL;
  const top = 18;
  const bot = 250;

  const pts = LINE.map((v, i) => ({x: plotL + (i / (LINE.length - 1)) * plotW, y: bot - v * (bot - top)}));
  const p = ease(frame, T.lineStart, T.lineEnd, eOut);
  const fi = p * (LINE.length - 1);
  const idx = Math.min(Math.floor(fi), LINE.length - 2);
  const tt = fi - idx;
  const dot = {x: lerp(pts[idx].x, pts[idx + 1].x, tt), y: lerp(pts[idx].y, pts[idx + 1].y, tt)};
  const curVal = lerp(LINE[idx], LINE[idx + 1], tt);
  const revealW = plotL + p * plotW;
  const gridVals = [0, 0.25, 0.5, 0.75, 1];
  const tipOp = interpolate(frame, [T.lineStart + 24, T.lineStart + 44, T.lineEnd + 26, T.lineEnd + 54], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tipTop = clamp(svgTop + dot.y - 82, 64, PH - 96);
  const tipLeft = clamp(dot.x - 80, 40, W - 200);

  return (
    <Panel x={L.cx} y={L.mainY} w={W} h={PH} delay={10}>
      <PanelTitle sub="Monthly · USD">Revenue Trend</PanelTitle>
      <svg width={VBW} height={VBH} viewBox={`0 0 ${VBW} ${VBH}`} style={{position: 'absolute', top: svgTop, left: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue} stopOpacity="0.42" />
            <stop offset="55%" stopColor={C.cyan} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.blue} />
            <stop offset="100%" stopColor={C.cyan} />
          </linearGradient>
          <clipPath id="lineReveal">
            <rect x={plotL} y={top - 18} width={Math.max(0, revealW - plotL)} height={bot - top + 40} />
          </clipPath>
        </defs>

        {gridVals.map((g, i) => {
          const y = bot - g * (bot - top);
          return (
            <g key={i}>
              <line x1={plotL} y1={y} x2={plotR} y2={y} stroke={C.grid} strokeWidth={1} strokeDasharray="2 6" />
              <text x={plotL - 12} y={y + 4} textAnchor="end" fontFamily={FONT} fontSize={13} fill={C.faint}>{Math.round(g * 3)}M</text>
            </g>
          );
        })}

        <g clipPath="url(#lineReveal)">
          <path d={`${smoothPath(pts)} L ${pts[pts.length - 1].x} ${bot} L ${pts[0].x} ${bot} Z`} fill="url(#lineArea)" />
          <path d={smoothPath(pts)} fill="none" stroke="url(#lineStroke)" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {MONTHS.map((m, i) => (
          <text key={m} x={pts[i].x} y={bot + 32} textAnchor="middle" fontFamily={FONT} fontSize={13} fill={C.faint}>{m}</text>
        ))}

        {p > 0.02 && p < 0.999 ? (
          <>
            <line x1={dot.x} y1={top - 6} x2={dot.x} y2={bot} stroke="rgba(62,134,255,0.4)" strokeWidth={1.5} />
            <circle cx={dot.x} cy={dot.y} r={13} fill={C.blue} opacity={0.22} />
            <circle cx={dot.x} cy={dot.y} r={6.5} fill="#fff" stroke={C.blue} strokeWidth={3} />
          </>
        ) : null}
        {p >= 0.999 ? (
          <>
            <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={7 + 2 * (0.5 + 0.5 * Math.sin(frame / 16))} fill={C.cyan} opacity={0.3} />
            <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={6.5} fill="#fff" stroke={C.cyan} strokeWidth={3} />
          </>
        ) : null}
      </svg>

      <div style={{position: 'absolute', left: tipLeft, top: tipTop, width: 160, opacity: tipOp, pointerEvents: 'none'}}>
        <div style={{background: 'rgba(14,22,44,0.94)', border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 16px 30px -12px rgba(0,0,0,0.6)'}}>
          <div style={{fontFamily: FONT, fontSize: 12, color: C.sub, fontWeight: 500}}>{MONTHS[clamp(Math.round(fi), 0, 11)]} 2026</div>
          <div style={{fontFamily: FONT, fontSize: 22, color: '#fff', fontWeight: 700, ...NUM}}>${fmt(curVal * 3, 2)}M</div>
        </div>
      </div>
    </Panel>
  );
};

/* ============================================================================
   DONUT
   ========================================================================== */
const Donut: React.FC = () => {
  const frame = useCurrentFrame();
  const W = L.rightW;
  const PH = L.mainH;
  const cx = 188;
  const cy = 158;
  const r = 92;
  const sw = 26;
  const Cc = 2 * Math.PI * r;
  const sweep = ease(frame, T.donutStart, T.donutEnd, eOut);
  const centerVal = 248910 * ease(frame, T.donutStart + 20, T.donutEnd, eExpo);

  let cum = 0;
  const segs = SEG.map((s) => {
    const start = cum;
    cum += s.frac;
    return {...s, start};
  });

  return (
    <Panel x={L.rightX} y={L.mainY} w={W} h={PH} delay={16}>
      <PanelTitle sub="This month">Traffic Sources</PanelTitle>
      <svg width={W} height={300} viewBox={`0 0 ${W} 300`} style={{position: 'absolute', top: 58, left: 0, overflow: 'visible'}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        {segs.map((s, i) => {
          const vis = clamp((sweep - s.start) / s.frac, 0, 1) * s.frac;
          const angle = s.start * 360 - 90;
          return (
            <g key={i} transform={`rotate(${angle} ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${vis * Cc} ${Cc}`} style={{filter: `drop-shadow(0 0 6px ${s.color}66)`}} />
            </g>
          );
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontFamily={FONT} fontSize={33} fontWeight={700} fill="#fff" style={NUM}>{fmt(centerVal, 0)}</text>
        <text x={cx} y={cy + 24} textAnchor="middle" fontFamily={FONT} fontSize={14} fontWeight={500} fill={C.sub}>Total Visits</text>
      </svg>

      <div style={{position: 'absolute', right: 34, top: 128, width: 190, display: 'flex', flexDirection: 'column', gap: 20}}>
        {segs.map((s, i) => {
          const op = ease(frame, T.donutStart + 30 + i * 12, T.donutStart + 60 + i * 12, eOut);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', opacity: op, transform: `translateX(${interpolate(op, [0, 1], [10, 0])}px)`}}>
              <div style={{width: 11, height: 11, borderRadius: 3, background: s.color, boxShadow: `0 0 8px ${s.color}`, marginRight: 12}} />
              <span style={{fontFamily: FONT, fontSize: 16, color: C.text, fontWeight: 500}}>{s.name}</span>
              <span style={{marginLeft: 'auto', fontFamily: FONT, fontSize: 16, color: C.sub, fontWeight: 600, ...NUM}}>{Math.round(s.frac * 100)}%</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

/* ============================================================================
   BAR CHART
   ========================================================================== */
const BarChart: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = L.leftW;
  const plotL = 56;
  const plotR = W - 40;
  const plotW = plotR - plotL;
  const base = 150;
  const maxH = 120;
  const n = BARS.length;
  const slot = plotW / n;
  const bw = 48;

  return (
    <Panel x={L.cx} y={L.botY} w={W} h={L.botH} delay={20}>
      <PanelTitle sub="Weekly">Active Users by Week</PanelTitle>
      <svg width={W} height={190} viewBox={`0 0 ${W} 190`} style={{position: 'absolute', top: 62, left: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.cyan} />
            <stop offset="100%" stopColor={C.blue} />
          </linearGradient>
        </defs>
        <line x1={plotL} y1={base} x2={plotR} y2={base} stroke={C.grid} strokeWidth={1} />
        {BARS.map((v, i) => {
          const g = spring({frame: frame - (T.barStart + i * 9), fps, config: {damping: 15, mass: 0.7, stiffness: 120}});
          const h = v * maxH * clamp(g, 0, 1);
          const x = plotL + i * slot + slot / 2 - bw / 2;
          return (
            <g key={i}>
              <rect x={x} y={base - h} width={bw} height={h} rx={9} fill="url(#barGrad)" style={{filter: 'drop-shadow(0 6px 14px rgba(34,211,238,0.25))'}} />
              <text x={x + bw / 2} y={base + 26} textAnchor="middle" fontFamily={FONT} fontSize={13} fill={C.faint}>{WEEKS[i]}</text>
            </g>
          );
        })}
      </svg>
    </Panel>
  );
};

/* ============================================================================
   CHANNEL PROGRESS BARS
   ========================================================================== */
const Channels: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Panel x={L.rightX} y={L.botY} w={L.rightW} h={L.botH} delay={24}>
      <PanelTitle sub="Share">Top Channels</PanelTitle>
      <div style={{position: 'absolute', top: 70, left: 30, right: 30, display: 'flex', flexDirection: 'column', gap: 12}}>
        {CHAN.map((c, i) => {
          const g = ease(frame, T.chanStart + i * 12, T.chanEnd + i * 8, eOut);
          const pctVal = c.pct * g;
          return (
            <div key={i}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 7}}>
                <span style={{fontFamily: FONT, fontSize: 16, color: C.text, fontWeight: 500}}>{c.name}</span>
                <span style={{fontFamily: FONT, fontSize: 16, color: C.sub, fontWeight: 700, ...NUM}}>{Math.round(pctVal)}%</span>
              </div>
              <div style={{height: 9, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${pctVal}%`, borderRadius: 6, background: `linear-gradient(90deg,${c.color},${c.color}cc)`, boxShadow: `0 0 12px ${c.color}88`}} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

/* ============================================================================
   REFRESH SWEEP
   ========================================================================== */
const RefreshSweep: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.refresh || frame > T.refreshEnd) return null;
  const p = interpolate(frame, [T.refresh, T.refreshEnd], [-20, 120]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: `${p}%`,
          width: '16%',
          height: '120%',
          transform: 'rotate(12deg)',
          background: 'linear-gradient(90deg,rgba(120,180,255,0) 0%,rgba(140,200,255,0.14) 50%,rgba(120,180,255,0) 100%)',
          filter: 'blur(8px)',
        }}
      />
    </AbsoluteFill>
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
    Promise.all([
      anyDoc.fonts.load('400 1em Inter'),
      anyDoc.fonts.load('500 1em Inter'),
      anyDoc.fonts.load('600 1em Inter'),
      anyDoc.fonts.load('700 1em Inter'),
    ])
      .then(() => anyDoc.fonts.ready)
      .then(finish)
      .catch(finish);
    const t = setTimeout(finish, 3000);
    return () => clearTimeout(t);
  }, [handle]);

  const push = interpolate(frame, [T.pushStart, T.pushEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: eInOut,
  });
  const scale = 1 + push * 0.038;
  const ty = push * -10;

  return (
    <AbsoluteFill style={{background: C.bg0, fontFamily: FONT}}>
      <Background />
      <AbsoluteFill style={{transform: `scale(${scale}) translateY(${ty}px)`, transformOrigin: '46% 52%'}}>
        <TopBar />
        {KPIS.map((d, i) => (
          <KpiTile key={i} i={i} d={d} x={L.cx + i * (L.kpiW + L.kpiGap)} />
        ))}
        <LineChart />
        <Donut />
        <BarChart />
        <Channels />
        <RefreshSweep />
      </AbsoluteFill>
      <AbsoluteFill style={{pointerEvents: 'none', boxShadow: 'inset 0 0 320px rgba(0,0,0,0.55)'}} />
    </AbsoluteFill>
  );
};
