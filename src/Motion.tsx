import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  random,
} from 'remotion';

/* ------------------------------------------------------------------ *
 *  PALETTE — cyan dominant, restrained violet accent, deep navy void  *
 * ------------------------------------------------------------------ */
const CY = '#2ae9ff';
const CY_HOT = '#eaffff';
const VIO = '#8a6bff';
const VIO_HOT = '#cbbcff';

/* ------------------------------------------------------------------ *
 *  MATH HELPERS                                                       *
 * ------------------------------------------------------------------ */
const TAU = Math.PI * 2;
type P = {x: number; y: number};
const frac = (x: number) => x - Math.floor(x);
const mod = (n: number, m: number) => ((n % m) + m) % m;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fIn = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const fOut = (t: number, a: number, b: number) => clamp(1 - (t - a) / (b - a));
const easeIO = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

const qbez = (p0: P, p1: P, p2: P, t: number): P => {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
};

const roundedPoly = (pts: P[], r: number): string => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const v1 = {x: p0.x - p1.x, y: p0.y - p1.y};
    const v2 = {x: p2.x - p1.x, y: p2.y - p1.y};
    const l1 = Math.hypot(v1.x, v1.y) || 1;
    const l2 = Math.hypot(v2.x, v2.y) || 1;
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a = {x: p1.x + (v1.x / l1) * rr, y: p1.y + (v1.y / l1) * rr};
    const b = {x: p1.x + (v2.x / l2) * rr, y: p1.y + (v2.y / l2) * rr};
    d += (i === 0 ? `M ${a.x} ${a.y} ` : `L ${a.x} ${a.y} `);
    d += `Q ${p1.x} ${p1.y} ${b.x} ${b.y} `;
  }
  return d + 'Z';
};

const roundedRect = (w: number, h: number, r: number): string => {
  const x = -w / 2;
  const y = -h / 2;
  return (
    `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} ` +
    `L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} ` +
    `L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} ` +
    `L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`
  );
};

/* ------------------------------------------------------------------ *
 *  NEON — layered additive glow stroke (soft halo + bright core)      *
 * ------------------------------------------------------------------ */
type Fx = {xl: string; l: string; m: string};
const DEF_FX: Fx = {xl: 'gXL', l: 'gL', m: 'gM'};

const Neon: React.FC<{
  d: string;
  base?: string;
  hot?: string;
  core?: number;
  glow?: number;
  u?: number;
  fx?: Fx;
  fill?: string;
}> = ({d, base = CY, hot = CY_HOT, core = 2, glow = 1, u = 1, fx = DEF_FX, fill = 'none'}) => {
  const c = core * u;
  return (
    <>
      <g style={{mixBlendMode: 'screen'}} opacity={glow}>
        <path d={d} fill={fill} stroke={base} strokeWidth={c * 6} strokeLinejoin="round" strokeLinecap="round" filter={`url(#${fx.xl})`} opacity={0.32} />
        <path d={d} fill="none" stroke={base} strokeWidth={c * 3.3} strokeLinejoin="round" strokeLinecap="round" filter={`url(#${fx.l})`} opacity={0.55} />
        <path d={d} fill="none" stroke={hot} strokeWidth={c * 1.9} strokeLinejoin="round" strokeLinecap="round" filter={`url(#${fx.m})`} opacity={0.9} />
      </g>
      <path d={d} fill="none" stroke={base} strokeWidth={c * 1.7} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={hot} strokeWidth={c} strokeLinejoin="round" strokeLinecap="round" />
    </>
  );
};

/* ------------------------------------------------------------------ *
 *  FILE CARD — glowing document that streams into the folder          *
 * ------------------------------------------------------------------ */
const CARD_FX: Fx = {xl: 'cGXL', l: 'cGL', m: 'cGM'};
const FileCard: React.FC<{
  x: number;
  y: number;
  s: number;
  rot: number;
  op: number;
  base: string;
  hot: string;
  detail: boolean;
}> = ({x, y, s, rot, op, base, hot, detail}) => {
  const w = 116;
  const h = 148;
  const rect = roundedRect(w, h, 15);
  const lines = [0, 1, 2, 3];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <path d={rect} fill={base} opacity={0.07} />
      <Neon d={rect} base={base} hot={hot} core={1.9} glow={0.85} u={1} fx={CARD_FX} />
      {detail && (
        <>
          <path d={`M ${w / 2 - 34} ${-h / 2} L ${w / 2} ${-h / 2 + 34}`} fill="none" stroke={base} strokeWidth={2.4} strokeLinecap="round" />
          {lines.map((i) => {
            const ly = -h / 2 + 46 + i * 23;
            const lw = i === 0 ? w * 0.46 : i % 2 ? w * 0.6 : w * 0.72;
            return (
              <line
                key={i}
                x1={-w / 2 + 20}
                y1={ly}
                x2={-w / 2 + 20 + lw}
                y2={ly}
                stroke={i === 0 ? hot : base}
                strokeWidth={i === 0 ? 5 : 3.6}
                strokeLinecap="round"
                opacity={i === 0 ? 0.85 : 0.5}
              />
            );
          })}
        </>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ *
 *  MAIN COMPOSITION                                                   *
 * ------------------------------------------------------------------ */
export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();

  const U = height / 1080; // resolution unit (design authored at 1080p)
  const p = frame / durationInFrames; // 0..1, wraps seamlessly

  const FX = width / 2;
  const mouth: P = {x: FX, y: height * 0.585};
  const FYc = mouth.y + 6 * U; // folder centre so local mouth aligns to target
  const R = Math.min(width, height) * 0.72; // stream spawn radius
  const bob = Math.sin(p * TAU) * 4 * U; // gentle folder breathing bob

  /* ---- lanes : curved neon beams converging on the folder mouth ---- */
  const lanes = useMemo(() => {
    const deg = [-172, -140, -108, -72, -40, -8];
    return deg.map((dg) => {
      const a = (dg * Math.PI) / 180;
      const start: P = {x: mouth.x + Math.cos(a) * R, y: mouth.y + Math.sin(a) * R};
      const dx = mouth.x - start.x;
      const dy = mouth.y - start.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const mid: P = {x: start.x + dx * 0.5, y: start.y + dy * 0.5};
      const control: P = {x: mid.x + -ny * len * 0.16, y: mid.y + nx * len * 0.16};
      return {start, control};
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  /* ---- emission schedule : evenly phased, staggered across lanes ---- */
  const E = 42;
  const LANE_N = lanes.length;
  const TRAVEL = 0.19; // fraction of the loop a card spends in flight
  const emissions = useMemo(
    () =>
      Array.from({length: E}, (_, e) => ({
        e,
        lane: e % LANE_N,
        phase: e / E,
        isVio: random('vio' + e) > 0.78,
      })),
    [LANE_N]
  );

  /* ---- folder geometry (world px, U baked) ---- */
  const {backD, flapD, slotD} = useMemo(() => {
    const s = U;
    const back = roundedPoly(
      [
        {x: -172 * s, y: -96 * s},
        {x: -64 * s, y: -96 * s},
        {x: -40 * s, y: -58 * s},
        {x: 172 * s, y: -58 * s},
        {x: 172 * s, y: 110 * s},
        {x: -172 * s, y: 110 * s},
      ],
      15 * s
    );
    const flap =
      `M ${-172 * s} ${-20 * s} Q 0 ${8 * s} ${172 * s} ${-20 * s} ` +
      `L ${172 * s} ${96 * s} Q ${172 * s} ${110 * s} ${158 * s} ${110 * s} ` +
      `L ${-158 * s} ${110 * s} Q ${-172 * s} ${110 * s} ${-172 * s} ${96 * s} Z`;
    const slot = `M ${-172 * s} ${-20 * s} Q 0 ${8 * s} ${172 * s} ${-20 * s}`;
    return {backD: back, flapD: flap, slotD: slot};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  /* ---- bokeh field, split by depth tier ---- */
  const {far, mid, fg} = useMemo(() => {
    const F: any[] = [];
    const M: any[] = [];
    const G: any[] = [];
    for (let i = 0; i < 62; i++) {
      const rx = random('bx' + i);
      const ry = random('by' + i);
      const rs = random('bs' + i);
      const rh = random('bh' + i);
      const base = {
        x: rx * width,
        y: ry * height,
        hue: rh > 0.9 ? 'v' : rh > 0.8 ? 'w' : 'c',
        phase: random('bp' + i) * TAU,
        drift: random('bd' + i) * TAU,
        tw: 1 + Math.floor(random('tw' + i) * 3),
      };
      const tier = i % 3;
      if (tier === 0) F.push({...base, size: 3 + rs * 5});
      else if (tier === 1) M.push({...base, size: 9 + rs * 13});
      else if (rs > 0.62) G.push({...base, size: 26 + rs * 30});
      else M.push({...base, size: 14 + rs * 11});
    }
    return {far: F, mid: M, fg: G};
  }, [width, height]);

  const bokehGrad = (h: string) => (h === 'v' ? 'pdotV' : h === 'w' ? 'pdotW' : 'pdotC');
  const renderBok = (arr: any[], baseOp: number, ampMul: number) =>
    arr.map((b, i) => {
      const dx = Math.sin(p * TAU + b.drift) * 14 * ampMul * U;
      const dy = Math.cos(p * TAU + b.phase) * 10 * ampMul * U;
      const tw = 0.32 + 0.34 * Math.sin(p * TAU * b.tw + b.phase);
      return (
        <circle
          key={i}
          cx={b.x + dx}
          cy={b.y + dy}
          r={b.size * U}
          fill={`url(#${bokehGrad(b.hue)})`}
          opacity={baseOp * tw}
        />
      );
    });

  /* ---- reactive slot / folder glow driven by landings ---- */
  let slotBoost = 0;
  emissions.forEach((em) => {
    const age = mod(p - (em.phase + TRAVEL), 1);
    const g = Math.exp(-Math.pow(age / 0.045, 2));
    if (g > slotBoost) slotBoost = g;
  });
  const slotGlow = 0.5 + 0.5 * slotBoost;
  const folderGlow = 0.82 + 0.22 * Math.sin(p * TAU) + 0.22 * slotBoost;

  /* ---- loader ring ---- */
  const ringR = 252 * U;
  const circ = TAU * ringR;
  const arc = 0.26 * circ;
  const arcEnd = 0.26 * 360;

  return (
    <AbsoluteFill style={{backgroundColor: '#01030b'}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display: 'block'}}>
        <defs>
          {/* glow filters (world space, U baked) */}
          <filter id="gXL" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={22 * U} />
          </filter>
          <filter id="gL" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={10 * U} />
          </filter>
          <filter id="gM" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation={4.5 * U} />
          </filter>
          <filter id="gS" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={1.9 * U} />
          </filter>
          {/* glow filters for cards (design space — scaled by the card transform) */}
          <filter id="cGXL" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="cGL" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="cGM" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
          {/* bokeh depth blur */}
          <filter id="bFar" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={2.4 * U} />
          </filter>
          <filter id="bMid" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={8 * U} />
          </filter>
          <filter id="bNear" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={20 * U} />
          </filter>
          {/* film grain (anti-banding) */}
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" />
          </filter>

          {/* gradients */}
          <radialGradient id="bg" cx="50%" cy="56%" r="75%">
            <stop offset="0%" stopColor="#0a1d36" />
            <stop offset="45%" stopColor="#061225" />
            <stop offset="100%" stopColor="#01030b" />
          </radialGradient>
          <radialGradient id="aura">
            <stop offset="0%" stopColor={CY} stopOpacity="0.55" />
            <stop offset="45%" stopColor={CY} stopOpacity="0.16" />
            <stop offset="100%" stopColor={CY} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="auraHot">
            <stop offset="0%" stopColor={CY_HOT} stopOpacity="0.5" />
            <stop offset="60%" stopColor={CY} stopOpacity="0.1" />
            <stop offset="100%" stopColor={CY} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="auraVio">
            <stop offset="0%" stopColor={VIO} stopOpacity="0.42" />
            <stop offset="100%" stopColor={VIO} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ground">
            <stop offset="0%" stopColor={CY} stopOpacity="0.6" />
            <stop offset="100%" stopColor={CY} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="interior" cx="50%" cy="44%" r="62%">
            <stop offset="0%" stopColor={CY_HOT} stopOpacity="0.95" />
            <stop offset="35%" stopColor={CY} stopOpacity="0.5" />
            <stop offset="100%" stopColor={CY} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="flap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#072a3e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0c4258" stopOpacity="0.94" />
          </linearGradient>
          <radialGradient id="pdotC">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor={CY} stopOpacity="0.9" />
            <stop offset="100%" stopColor={CY} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pdotV">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor={VIO} stopOpacity="0.85" />
            <stop offset="100%" stopColor={VIO} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pdotW">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="52%" r="72%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="58%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.62" />
          </radialGradient>
        </defs>

        {/* background */}
        <rect x="0" y="0" width={width} height={height} fill="url(#bg)" />

        {/* aura + ground seat */}
        <g style={{mixBlendMode: 'screen'}}>
          <circle cx={mouth.x - 130 * U} cy={mouth.y + 26 * U} r={200 * U} fill="url(#auraVio)" opacity={0.16} />
          <circle cx={mouth.x} cy={mouth.y} r={380 * U} fill="url(#aura)" opacity={0.55 * (0.85 + 0.15 * Math.sin(p * TAU))} />
          <circle cx={mouth.x + 36 * U} cy={mouth.y - 12 * U} r={224 * U} fill="url(#auraHot)" opacity={0.48} />
          <ellipse cx={mouth.x} cy={FYc + 152 * U} rx={250 * U} ry={46 * U} fill="url(#ground)" opacity={0.34} filter="url(#bMid)" />
        </g>

        {/* bokeh — far & mid (behind) */}
        <g filter="url(#bFar)" style={{mixBlendMode: 'screen'}}>{renderBok(far, 0.5, 0.7)}</g>
        <g filter="url(#bMid)" style={{mixBlendMode: 'screen'}}>{renderBok(mid, 0.42, 1)}</g>

        {/* folder — interior light + back outline */}
        <g transform={`translate(${FX} ${FYc + bob})`}>
          <path d={backD} fill="url(#interior)" opacity={0.92} />
          <Neon d={backD} base={CY} hot={CY_HOT} core={2.4} glow={folderGlow} u={U} />
        </g>

        {/* streams (wires → packets → cards) + ripples, riding the bob */}
        <g transform={`translate(0 ${bob})`}>
          {/* neon beams */}
          <g style={{mixBlendMode: 'screen'}}>
            {lanes.map((ln, i) => (
              <path
                key={i}
                d={`M ${ln.start.x} ${ln.start.y} Q ${ln.control.x} ${ln.control.y} ${mouth.x} ${mouth.y}`}
                fill="none"
                stroke={CY}
                strokeWidth={1.3 * U}
                opacity={0.1}
                filter="url(#gL)"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* flowing data packets */}
          {lanes.map((ln, li) => {
            const ND = 16;
            const dots = [];
            for (let d = 0; d < ND; d++) {
              const tt = frac(p * 2 + d / ND + li * 0.13);
              const pos = qbez(ln.start, ln.control, mouth, tt);
              const op = fIn(tt, 0, 0.05) * fOut(tt, 0.82, 1) * 0.9;
              const col = li % 4 === 0 && d % 2 === 0 ? 'url(#pdotV)' : 'url(#pdotC)';
              const sz = (2.4 + 1.4 * Math.sin((tt * 6 + d) * 1.7)) * U;
              dots.push(<circle key={d} cx={pos.x} cy={pos.y} r={sz} fill={col} opacity={op} />);
            }
            return (
              <g key={li} filter="url(#gS)" style={{mixBlendMode: 'screen'}}>
                {dots}
              </g>
            );
          })}

          {/* streaming file cards + motion-trail ghosts */}
          {emissions.map((em) => {
            const age = mod(p - em.phase, 1);
            if (age >= TRAVEL) return null;
            const t = age / TRAVEL;
            const te = easeIO(t);
            const ln = lanes[em.lane];
            const pos = qbez(ln.start, ln.control, mouth, te);
            const base = em.isVio ? VIO : CY;
            const hot = em.isVio ? VIO_HOT : CY_HOT;
            const funnel = 0.22 + 0.5 * Math.sin(te * Math.PI);
            const sink = te > 0.82 ? lerp(1, 0.22, (te - 0.82) / 0.18) : 1;
            const s = funnel * sink * U;
            const op = fIn(t, 0, 0.09) * fOut(t, 0.82, 1);
            const rot = (random('rot' + em.e) * 30 - 15) * (1 - te);
            const ghosts = [1, 2].map((k) => {
              const tr = t - k * 0.05;
              if (tr <= 0) return null;
              const teg = easeIO(tr);
              const pg = qbez(ln.start, ln.control, mouth, teg);
              const sg = (0.22 + 0.5 * Math.sin(teg * Math.PI)) * U * 0.96;
              return (
                <FileCard key={k} x={pg.x} y={pg.y} s={sg} rot={rot} op={(op * 0.26) / k} base={base} hot={hot} detail={false} />
              );
            });
            return (
              <g key={em.e}>
                {ghosts}
                <FileCard x={pos.x} y={pos.y} s={s} rot={rot} op={op} base={base} hot={hot} detail />
              </g>
            );
          })}

          {/* ripple pulses on each landing */}
          <g style={{mixBlendMode: 'screen'}}>
            {emissions.map((em) => {
              const age = mod(p - (em.phase + TRAVEL), 1);
              const dur = 0.11;
              if (age >= dur) return null;
              const k = age / dur;
              const rad = (30 + 190 * easeOut(k)) * U;
              const op = (1 - k) * 0.42;
              return (
                <circle key={em.e} cx={mouth.x} cy={mouth.y} r={rad} fill="none" stroke={CY} strokeWidth={2 * U} opacity={op} filter="url(#gM)" />
              );
            })}
          </g>
        </g>

        {/* folder — front flap covers the pocket (cards sink behind it) */}
        <g transform={`translate(${FX} ${FYc + bob})`}>
          <path d={flapD} fill="url(#flap)" />
          <Neon d={flapD} base={CY} hot={CY_HOT} core={2.2} glow={folderGlow} u={U} />
          <g style={{mixBlendMode: 'screen'}} opacity={slotGlow}>
            <path d={slotD} fill="none" stroke={CY_HOT} strokeWidth={5 * U} strokeLinecap="round" filter="url(#gL)" />
            <path d={slotD} fill="none" stroke={CY_HOT} strokeWidth={2.6 * U} strokeLinecap="round" filter="url(#gM)" />
          </g>
          <path d={slotD} fill="none" stroke={CY_HOT} strokeWidth={1.6 * U} strokeLinecap="round" />
        </g>

        {/* loader ring around the folder */}
        <g transform={`translate(${FX} ${FYc + bob})`}>
          <circle r={ringR} fill="none" stroke={CY} strokeWidth={2 * U} opacity={0.1} />
          <g transform={`rotate(${p * 360})`}>
            <g style={{mixBlendMode: 'screen'}}>
              <circle r={ringR} fill="none" stroke={CY} strokeWidth={3 * U} strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" opacity={0.7} filter="url(#gM)" />
              <circle r={ringR} fill="none" stroke={CY_HOT} strokeWidth={2 * U} strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" opacity={0.9} />
              <circle cx={ringR * Math.cos((arcEnd * Math.PI) / 180)} cy={ringR * Math.sin((arcEnd * Math.PI) / 180)} r={4.5 * U} fill={CY_HOT} filter="url(#gM)" />
            </g>
          </g>
          <g transform={`rotate(${-p * 720})`} style={{mixBlendMode: 'screen'}}>
            <circle r={ringR * 0.82} fill="none" stroke={VIO} strokeWidth={1.6 * U} strokeDasharray={`${arc * 0.5} ${circ - arc * 0.5}`} strokeLinecap="round" opacity={0.34} filter="url(#gM)" />
          </g>
        </g>

        {/* bokeh — near (in front, soft) */}
        <g filter="url(#bNear)" style={{mixBlendMode: 'screen'}}>{renderBok(fg, 0.28, 1.35)}</g>

        {/* vignette + grain */}
        <rect x="0" y="0" width={width} height={height} fill="url(#vignette)" />
        <rect x="0" y="0" width={width} height={height} filter="url(#grain)" opacity={0.06} style={{mixBlendMode: 'overlay'}} />
      </svg>
    </AbsoluteFill>
  );
};

export default Motion;
