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
   BTC / USD LIVE TRADING TERMINAL
   Premium microstock motion graphic. 1920x1080 @ 60fps, 900 frames (15s).
   BTC-only (trademark-safe). Self-contained: core Remotion + SVG + CSS.
   ========================================================================== */

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const NUM = {fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"'} as const;

const C = {
  bg0: '#05070E',
  bg1: '#0A0F1C',
  panel: 'rgba(255,255,255,0.04)',
  panelBorder: 'rgba(255,255,255,0.09)',
  text: '#EAF0FF',
  sub: '#828FB2',
  faint: '#55628A',
  grid: 'rgba(255,255,255,0.05)',
  up: '#26D07C',
  down: '#FF5C72',
  btc: '#F7931A',
  blue: '#3E86FF',
  cyan: '#22D3EE',
};

const eOut = Easing.out(Easing.cubic);
const eExpo = Easing.bezier(0.16, 1, 0.3, 1);
const eInOut = Easing.inOut(Easing.cubic);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const fmt = (v: number, dec: number) => {
  const f = v.toFixed(dec);
  const parts = f.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};
const ease = (frame: number, a: number, b: number, easing = eExpo) =>
  interpolate(frame, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

// deterministic RNG
const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ---- candle data (module scope, deterministic) --------------------------- */
type Candle = {open: number; high: number; low: number; close: number; vol: number; up: boolean};
const N = 46;
const CANDLES: Candle[] = (() => {
  const r = mulberry32(778931);
  const out: Candle[] = [];
  let price = 61200;
  for (let i = 0; i < N; i++) {
    let bias;
    if (i < 17) bias = 95;
    else if (i < 29) bias = -28;
    else bias = 250;
    const open = price;
    const close = open + bias + (r() - 0.5) * 430;
    const high = Math.max(open, close) + r() * 240 + 40;
    const low = Math.min(open, close) - (r() * 240 + 40);
    const vol = 0.35 + r() * 0.8 + (i >= 29 ? 0.55 : 0);
    out.push({open, high, low, close, vol, up: close >= open});
    price = close;
  }
  return out;
})();
const P_MIN = Math.min(...CANDLES.map((c) => c.low)) - 200;
const P_MAX = Math.max(...CANDLES.map((c) => c.high)) + 200;
const VOL_MAX = Math.max(...CANDLES.map((c) => c.vol));
const LAST_CLOSE = CANDLES[N - 1].close;
const REF24 = 63180;

/* ---- order book base (module scope) -------------------------------------- */
const OB = 9;
const askBase = (() => {
  const r = mulberry32(1212);
  return Array.from({length: OB}, () => 0.25 + r() * 2.4);
})();
const bidBase = (() => {
  const r = mulberry32(9931);
  return Array.from({length: OB}, () => 0.25 + r() * 2.4);
})();

/* ============================================================================
   TIMELINE
   ========================================================================== */
const T = {
  shellIn: 4,
  topBar: 8,
  countStart: 52,
  countEnd: 240,
  candleStart: 100,
  candleEnd: 372,
  obStart: 150,
  depthStart: 250,
  depthEnd: 430,
  posStart: 240,
  posEnd: 430,
  pushStart: 440,
  pushEnd: 700,
};

const L = {
  cx: 60,
  kpiY: 162,
  kpiH: 146,
  kpiGap: 26.7,
  kpiW: 430,
  mainY: 330,
  mainH: 378,
  leftW: 1180,
  rightX: 1266,
  rightW: 594,
  botY: 732,
  botH: 280,
};

/* live price after build completes */
const useLivePrice = (frame: number) => {
  const prog = ease(frame, T.candleStart, T.candleEnd, Easing.linear);
  const vis = Math.max(1, Math.min(N, Math.floor(prog * N) + 1));
  if (prog < 1) return {price: CANDLES[vis - 1].close, vis, building: true};
  const osc = Math.sin(frame / 8) * 26 + Math.sin(frame / 21) * 18;
  return {price: LAST_CLOSE + osc, vis: N, building: false};
};

/* ============================================================================
   BACKGROUND
   ========================================================================== */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(120% 90% at 22% 4%, #0E1A33 0%, ${C.bg1} 44%, ${C.bg0} 100%)`}} />
      {[
        {c: '#1E5BFF', s: 1000, x: 220, y: 100, a: 0.22, sp: 1},
        {c: '#F7931A', s: 780, x: 1650, y: 220, a: 0.12, sp: 1.4},
        {c: '#12C8E0', s: 760, x: 1500, y: 1000, a: 0.12, sp: 1.1},
      ].map((b, i) => {
        const dx = Math.sin(frame / (170 * b.sp) + i) * 44;
        const dy = Math.cos(frame / (190 * b.sp) + i) * 36;
        return (
          <div key={i} style={{position: 'absolute', left: b.x - b.s / 2 + dx, top: b.y - b.s / 2 + dy, width: b.s, height: b.s, borderRadius: '50%', background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, rgba(0,0,0,0) 68%)`, opacity: b.a, filter: 'blur(22px)'}} />
        );
      })}
      <AbsoluteFill style={{opacity: 0.5}}>
        <svg width="1920" height="1080">
          <defs>
            <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
              <path d="M46 0 L0 0 0 46" fill="none" stroke="rgba(255,255,255,0.028)" strokeWidth="1" />
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
const Panel: React.FC<{x: number; y: number; w: number; h: number; delay: number; children?: React.ReactNode}> = ({x, y, w, h, delay, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - T.shellIn - delay, fps, config: {damping: 20, mass: 0.8, stiffness: 110}});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px) scale(${interpolate(s, [0, 1], [0.985, 1])})`, transformOrigin: 'center', borderRadius: 20, background: C.panel, border: `1px solid ${C.panelBorder}`, boxShadow: '0 30px 70px -30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)'}}>{children}</div>
  );
};
const PanelTitle: React.FC<{children: React.ReactNode; sub?: string; subColor?: string}> = ({children, sub, subColor}) => (
  <div style={{position: 'absolute', top: 22, left: 26, right: 26, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
    <span style={{fontFamily: FONT, fontSize: 19, fontWeight: 600, color: C.text, letterSpacing: 0.2}}>{children}</span>
    {sub ? <span style={{fontFamily: FONT, fontSize: 14, fontWeight: 600, color: subColor || C.faint}}>{sub}</span> : null}
  </div>
);

/* ============================================================================
   TOP BAR
   ========================================================================== */
const TopBar: React.FC = () => {
  const frame = useCurrentFrame();
  const op = ease(frame, T.topBar, T.topBar + 24, eOut);
  const {price} = useLivePrice(frame);
  const shown = price;
  const chg = ((price - REF24) / REF24) * 100;
  const chgShown = chg;
  const tfs = ['1m', '5m', '15m', '1H', '4H', '1D'];
  const pulse = 0.5 + 0.5 * Math.sin(frame / 14);
  return (
    <div style={{position: 'absolute', left: 60, top: 48, width: 1800, height: 96, opacity: op, transform: `translateY(${interpolate(op, [0, 1], [-14, 0])}px)`, display: 'flex', alignItems: 'center'}}>
      <div style={{width: 44, height: 44, borderRadius: 12, background: `linear-gradient(145deg,${C.btc},#C56A00)`, boxShadow: `0 8px 22px -6px ${C.btc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 700, color: '#fff'}}>₿</div>
      <span style={{fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.text, marginLeft: 14}}>Meridian</span>
      <div style={{width: 1, height: 30, background: 'rgba(255,255,255,0.12)', margin: '0 24px'}} />
      <span style={{fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.text}}>BTC<span style={{color: C.faint}}>/USD</span></span>
      <span style={{fontFamily: FONT, fontSize: 34, fontWeight: 800, color: C.text, marginLeft: 22, letterSpacing: -0.5, ...NUM}}>${fmt(shown, 2)}</span>
      <div style={{display: 'flex', alignItems: 'center', gap: 5, marginLeft: 16, padding: '6px 12px', borderRadius: 10, background: chg >= 0 ? 'rgba(38,208,124,0.14)' : 'rgba(255,92,114,0.14)'}}>
        <svg width="12" height="12" viewBox="0 0 12 12" style={{transform: chg >= 0 ? 'none' : 'rotate(180deg)'}}><path d="M6 2 L10 8 L2 8 Z" fill={chg >= 0 ? C.up : C.down} /></svg>
        <span style={{fontFamily: FONT, fontSize: 17, fontWeight: 700, color: chg >= 0 ? C.up : C.down, ...NUM}}>{chgShown >= 0 ? '+' : ''}{chgShown.toFixed(2)}%</span>
      </div>

      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{display: 'flex', padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.panelBorder}`}}>
          {tfs.map((r) => {
            const active = r === '1H';
            return <div key={r} style={{padding: '7px 14px', borderRadius: 9, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: active ? '#fff' : C.faint, background: active ? `linear-gradient(145deg,${C.blue},#2A5FD0)` : 'transparent'}}>{r}</div>;
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 20, background: 'rgba(38,208,124,0.12)', border: `1px solid rgba(38,208,124,0.3)`}}>
          <div style={{width: 8, height: 8, borderRadius: 4, background: C.up, opacity: 0.5 + pulse * 0.5, boxShadow: `0 0 ${6 + pulse * 8}px ${C.up}`}} />
          <span style={{fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.up, letterSpacing: 0.5}}>LIVE</span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   STAT TILES
   ========================================================================== */
const STATS = [
  {label: '24h High', prefix: '$', value: 68540, dec: 2, sub: '≈ 2h ago', subColor: C.sub},
  {label: '24h Low', prefix: '$', value: 61020, dec: 2, sub: '≈ 9h ago', subColor: C.sub},
  {label: '24h Volume', prefix: '$', value: 2.41, dec: 2, suffix: 'B', sub: '142,380 BTC', subColor: C.sub},
  {label: 'Market Cap', prefix: '$', value: 1.33, dec: 2, suffix: 'T', sub: 'Dominance 54.2%', subColor: C.btc},
];
const StatTile: React.FC<{i: number; d: (typeof STATS)[number]; x: number}> = ({i, d, x}) => {
  const frame = useCurrentFrame();
  const v = d.value * ease(frame, T.countStart + i * 6, T.countEnd, eExpo);
  const subOp = ease(frame, T.countStart + i * 6 + 24, T.countStart + i * 6 + 48, eOut);
  return (
    <Panel x={x} y={L.kpiY} w={L.kpiW} h={L.kpiH} delay={6 + i * 5}>
      <div style={{position: 'absolute', inset: 0, padding: '0 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <span style={{fontFamily: FONT, fontSize: 15, fontWeight: 500, color: C.sub}}>{d.label}</span>
        <span style={{marginTop: 11, fontFamily: FONT, fontSize: 33, fontWeight: 700, color: C.text, letterSpacing: -0.6, ...NUM}}>
          {d.prefix}{fmt(v, d.dec)}{(d as {suffix?: string}).suffix || ''}
        </span>
        <span style={{marginTop: 9, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: d.subColor, opacity: subOp}}>{d.sub}</span>
      </div>
    </Panel>
  );
};

/* ============================================================================
   CANDLESTICK CHART
   ========================================================================== */
const CandleChart: React.FC = () => {
  const frame = useCurrentFrame();
  const W = L.leftW;
  const PH = L.mainH;
  const svgTop = 60;
  const VBH = 306;
  const plotL = 16;
  const plotR = W - 96;
  const plotW = plotR - plotL;
  const pTop = 14;
  const pBot = 214;
  const volTop = 236;
  const volBot = 286;

  const {price: live, vis, building} = useLivePrice(frame);
  const y = (p: number) => pTop + (P_MAX - p) / (P_MAX - P_MIN) * (pBot - pTop);
  const slot = plotW / N;
  const cw = slot * 0.62;

  const lastY = y(live);
  const flash = interpolate(frame, [314, 326, 372, 392], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const gridP = [0, 0.25, 0.5, 0.75, 1].map((g) => P_MIN + g * (P_MAX - P_MIN));

  return (
    <Panel x={L.cx} y={L.mainY} w={W} h={PH} delay={10}>
      <PanelTitle sub="1H · Bitfeed" subColor={C.faint}>BTC / USD · Candles</PanelTitle>
      <svg width={W} height={VBH} viewBox={`0 0 ${W} ${VBH}`} style={{position: 'absolute', top: svgTop, left: 0, overflow: 'visible'}}>
        {/* gridlines + right price axis */}
        {gridP.map((p, i) => (
          <g key={i}>
            <line x1={plotL} y1={y(p)} x2={plotR} y2={y(p)} stroke={C.grid} strokeWidth={1} strokeDasharray="2 6" />
            <text x={plotR + 10} y={y(p) + 4} fontFamily={FONT} fontSize={12.5} fill={C.faint}>{fmt(p, 0)}</text>
          </g>
        ))}

        {/* candles */}
        {CANDLES.map((c, i) => {
          if (i >= vis) return null;
          const appear = ease(frame, T.candleStart + (i / N) * (T.candleEnd - T.candleStart), T.candleStart + (i / N) * (T.candleEnd - T.candleStart) + 6, eOut);
          const cx = plotL + i * slot + slot / 2;
          const isLast = i === vis - 1;
          const cl = isLast && !building ? live : c.close;
          const col = cl >= c.open ? C.up : C.down;
          const bodyTop = y(Math.max(c.open, cl));
          const bodyBot = y(Math.min(c.open, cl));
          const hi = isLast && !building ? Math.max(c.high, cl) : c.high;
          const lo = isLast && !building ? Math.min(c.low, cl) : c.low;
          const vh = (c.vol / VOL_MAX) * (volBot - volTop);
          return (
            <g key={i} opacity={appear}>
              <line x1={cx} y1={y(hi)} x2={cx} y2={y(lo)} stroke={col} strokeWidth={1.4} />
              <rect x={cx - cw / 2} y={bodyTop} width={cw} height={Math.max(1.5, bodyBot - bodyTop)} rx={1.5} fill={col} />
              <rect x={cx - cw / 2} y={volBot - vh} width={cw} height={vh} rx={1} fill={col} opacity={0.32} />
            </g>
          );
        })}

        {/* last price line + tag */}
        <line x1={plotL} y1={lastY} x2={plotR} y2={lastY} stroke={C.btc} strokeWidth={1.4} strokeDasharray="5 5" opacity={0.9} />
        <g>
          <rect x={plotR + 2} y={lastY - 15} width={92} height={30} rx={6} fill={C.btc} opacity={0.16 + flash * 0.5} />
          <rect x={plotR + 2} y={lastY - 15} width={92} height={30} rx={6} fill="none" stroke={C.btc} strokeWidth={1} opacity={0.8} />
          <text x={plotR + 48} y={lastY + 5} textAnchor="middle" fontFamily={FONT} fontSize={14} fontWeight={700} fill={C.btc} style={NUM}>{fmt(live, 0)}</text>
        </g>
      </svg>
    </Panel>
  );
};

/* ============================================================================
   ORDER BOOK
   ========================================================================== */
const OrderBook: React.FC = () => {
  const frame = useCurrentFrame();
  const {price: mid} = useLivePrice(frame);
  const W = L.rightW;
  const PH = L.mainH;
  const DISP = 6;
  const rowH = 18;
  const step = 6.5;
  const topY = 84;
  const spreadH = 40;

  const asks = askBase.map((b, i) => {
    const sz = b * (0.82 + 0.32 * (0.5 + 0.5 * Math.sin(frame / 6 + i * 1.3)));
    return {price: mid + 2.5 + (i + 1) * step, size: sz};
  });
  const bids = bidBase.map((b, i) => {
    const sz = b * (0.82 + 0.32 * (0.5 + 0.5 * Math.cos(frame / 6.5 + i * 1.1)));
    return {price: mid - 2.5 - (i + 1) * step, size: sz};
  });
  let ac = 0;
  const askCum = asks.map((a) => (ac += a.size));
  let bc = 0;
  const bidCum = bids.map((b) => (bc += b.size));
  const maxCum = Math.max(askCum[DISP - 1], bidCum[DISP - 1]);
  const rowsIn = (i: number) => ease(frame, T.obStart + i * 3, T.obStart + i * 3 + 16, eOut);

  const spread = asks[0].price - bids[0].price;

  return (
    <Panel x={L.rightX} y={L.mainY} w={W} h={PH} delay={16}>
      <PanelTitle sub="Size (BTC)" subColor={C.faint}>Order Book</PanelTitle>
      <div style={{position: 'absolute', top: topY - 24, left: 26, right: 26, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontSize: 12, color: C.faint, fontWeight: 600, letterSpacing: 0.4}}>
        <span>PRICE (USD)</span><span>SIZE</span><span>TOTAL</span>
      </div>
      {/* asks (reversed: best ask nearest spread) */}
      {asks.slice(0, DISP).reverse().map((a, ri) => {
        const i = DISP - 1 - ri;
        const yy = topY + ri * rowH;
        const w = (askCum[i] / maxCum) * (W - 52);
        return (
          <div key={'a' + i} style={{position: 'absolute', top: yy, left: 26, width: W - 52, height: rowH, opacity: rowsIn(i)}}>
            <div style={{position: 'absolute', right: 0, top: 2, width: w, height: rowH - 4, background: 'rgba(255,92,114,0.12)', borderRadius: 3}} />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, fontSize: 14, ...NUM}}>
              <span style={{color: C.down, fontWeight: 600}}>{fmt(a.price, 1)}</span>
              <span style={{color: C.sub}}>{a.size.toFixed(3)}</span>
              <span style={{color: C.faint}}>{askCum[i].toFixed(2)}</span>
            </div>
          </div>
        );
      })}
      {/* spread */}
      <div style={{position: 'absolute', top: topY + DISP * rowH + 6, left: 26, right: 26, height: spreadH, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${C.panelBorder}`, borderBottom: `1px solid ${C.panelBorder}`}}>
        <span style={{fontFamily: FONT, fontSize: 23, fontWeight: 700, color: mid >= REF24 ? C.up : C.down, ...NUM}}>{fmt(mid, 2)}</span>
        <span style={{fontFamily: FONT, fontSize: 13, color: C.faint, ...NUM}}>Spread {spread.toFixed(1)}</span>
      </div>
      {/* bids */}
      {bids.slice(0, DISP).map((b, i) => {
        const yy = topY + DISP * rowH + 6 + spreadH + 8 + i * rowH;
        const w = (bidCum[i] / maxCum) * (W - 52);
        return (
          <div key={'b' + i} style={{position: 'absolute', top: yy, left: 26, width: W - 52, height: rowH, opacity: rowsIn(i)}}>
            <div style={{position: 'absolute', right: 0, top: 2, width: w, height: rowH - 4, background: 'rgba(38,208,124,0.12)', borderRadius: 3}} />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, fontSize: 14, ...NUM}}>
              <span style={{color: C.up, fontWeight: 600}}>{fmt(b.price, 1)}</span>
              <span style={{color: C.sub}}>{b.size.toFixed(3)}</span>
              <span style={{color: C.faint}}>{bidCum[i].toFixed(2)}</span>
            </div>
          </div>
        );
      })}
    </Panel>
  );
};

/* ============================================================================
   MARKET DEPTH
   ========================================================================== */
const Depth: React.FC = () => {
  const frame = useCurrentFrame();
  const {price: mid} = useLivePrice(frame);
  const W = L.leftW;
  const svgTop = 58;
  const VBH = 196;
  const midX = W / 2;
  const step = 6.5;
  const spanX = (W / 2) - 60;
  const base = 168;
  const topPad = 16;

  const bidCumArr: number[] = [];
  let bc = 0;
  bidBase.forEach((b) => bidCumArr.push((bc += b)));
  const askCumArr: number[] = [];
  let ac = 0;
  askBase.forEach((a) => askCumArr.push((ac += a)));
  const maxCum = Math.max(bidCumArr[OB - 1], askCumArr[OB - 1]);

  const yv = (c: number) => base - (c / maxCum) * (base - topPad);
  // bids: from mid going left
  let bidPath = `M ${midX} ${base}`;
  bidCumArr.forEach((c, i) => {
    const x = midX - ((i + 1) / OB) * spanX;
    bidPath += ` L ${midX - (i / OB) * spanX} ${yv(c)} L ${x} ${yv(c)}`;
  });
  bidPath += ` L ${midX - spanX} ${base} Z`;
  let askPath = `M ${midX} ${base}`;
  askCumArr.forEach((c, i) => {
    const x = midX + ((i + 1) / OB) * spanX;
    askPath += ` L ${midX + (i / OB) * spanX} ${yv(c)} L ${x} ${yv(c)}`;
  });
  askPath += ` L ${midX + spanX} ${base} Z`;

  const rev = ease(frame, T.depthStart, T.depthEnd, eOut);

  return (
    <Panel x={L.cx} y={L.botY} w={W} h={L.botH} delay={20}>
      <PanelTitle sub="Cumulative bids / asks" subColor={C.faint}>Market Depth</PanelTitle>
      <svg width={W} height={VBH} viewBox={`0 0 ${W} ${VBH}`} style={{position: 'absolute', top: svgTop, left: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="bidG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.up} stopOpacity="0.5" /><stop offset="100%" stopColor={C.up} stopOpacity="0.04" /></linearGradient>
          <linearGradient id="askG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.down} stopOpacity="0.5" /><stop offset="100%" stopColor={C.down} stopOpacity="0.04" /></linearGradient>
          <clipPath id="depthClip"><rect x="0" y={base - rev * (base - topPad) - 4} width={W} height={rev * (base - topPad) + 8} /></clipPath>
        </defs>
        <g clipPath="url(#depthClip)">
          <path d={bidPath} fill="url(#bidG)" stroke={C.up} strokeWidth={2} />
          <path d={askPath} fill="url(#askG)" stroke={C.down} strokeWidth={2} />
        </g>
        <line x1={midX} y1={topPad - 8} x2={midX} y2={base} stroke="rgba(247,147,26,0.6)" strokeWidth={1.4} strokeDasharray="4 4" />
        <text x={midX} y={base + 22} textAnchor="middle" fontFamily={FONT} fontSize={13} fontWeight={600} fill={C.btc} style={NUM}>{fmt(mid, 0)}</text>
        <text x={midX - spanX} y={base + 22} textAnchor="middle" fontFamily={FONT} fontSize={12} fill={C.up}>Bids</text>
        <text x={midX + spanX} y={base + 22} textAnchor="middle" fontFamily={FONT} fontSize={12} fill={C.down}>Asks</text>
      </svg>
    </Panel>
  );
};

/* ============================================================================
   POSITION PANEL
   ========================================================================== */
const Position: React.FC = () => {
  const frame = useCurrentFrame();
  const g = ease(frame, T.posStart, T.posEnd, eExpo);
  const pv = 215480 * g;
  const pnl = 12840 * g;
  const pnlPct = 6.34 * g;
  const rows = [
    {k: 'BTC Holdings', v: `${(3.214).toFixed(4)} BTC`, c: C.text},
    {k: 'Avg. Entry', v: `$${fmt(58220, 2)}`, c: C.text},
    {k: "Today's PnL", v: `+$${fmt(pnl, 0)}`, c: C.up},
  ];
  return (
    <Panel x={L.rightX} y={L.botY} w={L.rightW} h={L.botH} delay={24}>
      <PanelTitle sub="Spot" subColor={C.faint}>Your Position</PanelTitle>
      <div style={{position: 'absolute', top: 66, left: 26, right: 26}}>
        <div style={{fontFamily: FONT, fontSize: 14, color: C.sub, fontWeight: 500}}>Portfolio Value</div>
        <div style={{marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 10}}>
          <span style={{fontFamily: FONT, fontSize: 38, fontWeight: 800, color: C.text, letterSpacing: -0.8, ...NUM}}>${fmt(pv, 2)}</span>
          <span style={{fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.up, ...NUM}}>▲ {pnlPct.toFixed(2)}%</span>
        </div>
        <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12}}>
          {rows.map((r, i) => (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', opacity: ease(frame, T.posStart + 20 + i * 10, T.posStart + 44 + i * 10, eOut)}}>
              <span style={{fontFamily: FONT, fontSize: 15, color: C.sub}}>{r.k}</span>
              <span style={{fontFamily: FONT, fontSize: 15, fontWeight: 600, color: r.c, ...NUM}}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop: 20, display: 'flex', gap: 12}}>
          <div style={{flex: 1, height: 44, borderRadius: 12, background: `linear-gradient(145deg,${C.up},#159A5B)`, boxShadow: `0 8px 18px -6px ${C.up}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#062015'}}>Buy</div>
          <div style={{flex: 1, height: 44, borderRadius: 12, background: 'rgba(255,92,114,0.14)', border: `1px solid rgba(255,92,114,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.down}}>Sell</div>
        </div>
      </div>
    </Panel>
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
    Promise.all([anyDoc.fonts.load('400 1em Inter'), anyDoc.fonts.load('500 1em Inter'), anyDoc.fonts.load('600 1em Inter'), anyDoc.fonts.load('700 1em Inter'), anyDoc.fonts.load('800 1em Inter')])
      .then(() => anyDoc.fonts.ready)
      .then(finish)
      .catch(finish);
    const t = setTimeout(finish, 3000);
    return () => clearTimeout(t);
  }, [handle]);

  const push = interpolate(frame, [T.pushStart, T.pushEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eInOut});
  const scale = 1 + push * 0.036;

  return (
    <AbsoluteFill style={{background: C.bg0, fontFamily: FONT}}>
      <Background />
      <AbsoluteFill style={{transform: `scale(${scale}) translateY(${push * -8}px)`, transformOrigin: '40% 50%'}}>
        <TopBar />
        {STATS.map((d, i) => (
          <StatTile key={i} i={i} d={d} x={L.cx + i * (L.kpiW + L.kpiGap)} />
        ))}
        <CandleChart />
        <OrderBook />
        <Depth />
        <Position />
      </AbsoluteFill>
      <AbsoluteFill style={{pointerEvents: 'none', boxShadow: 'inset 0 0 320px rgba(0,0,0,0.6)'}} />
    </AbsoluteFill>
  );
};
