import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  random,
} from 'remotion';

/* ------------------------------------------------------------------ *
 *  CLOUD UPLOAD & SYNC — premium neon loop                            *
 *  cyan dominant, restrained violet accent, deep navy void            *
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

/* arc path on a circle centred at origin (degrees, y-down SVG space) */
const arcD = (r: number, a0: number, a1: number): string => {
  const r0 = (a0 * Math.PI) / 180;
  const r1 = (a1 * Math.PI) / 180;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return (
    `M ${r * Math.cos(r0)} ${r * Math.sin(r0)} ` +
    `A ${r} ${r} 0 ${large} 1 ${r * Math.cos(r1)} ${r * Math.sin(r1)}`
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
 *  DATA CHIP — glowing packet that rises into the cloud               *
 *  variant 0: rounded square with an up-arrow                         *
 *  variant 1: small document with text lines                          *
 * ------------------------------------------------------------------ */
const CARD_FX: Fx = {xl: 'cGXL', l: 'cGL', m: 'cGM'};
const DataChip: React.FC<{
  x: number;
  y: number;
  s: number;
  rot: number;
  op: number;
  base: string;
  hot: string;
  variant: number;
  detail: boolean;
}> = ({x, y, s, rot, op, base, hot, variant, detail}) => {
  if (variant === 0) {
    const w = 104;
    const rect = roundedRect(w, w, 22);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
        <path d={rect} fill={base} opacity={0.07} />
        <Neon d={rect} base={base} hot={hot} core={1.9} glow={0.85} u={1} fx={CARD_FX} />
        {detail && (
          <g stroke={hot} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.9}>
            <path d={`M 0 ${w * 0.22} L 0 ${-w * 0.2}`} />
            <path d={`M ${-w * 0.14} ${-w * 0.04} L 0 ${-w * 0.2} L ${w * 0.14} ${-w * 0.04}`} />
          </g>
        )}
      </g>
    );
  }
  const w = 100;
  const h = 128;
  const rect = roundedRect(w, h, 14);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <path d={rect} fill={base} opacity={0.07} />
      <Neon d={rect} base={base} hot={hot} core={1.9} glow={0.85} u={1} fx={CARD_FX} />
      {detail && (
        <>
          <path d={`M ${w / 2 - 30} ${-h / 2} L ${w / 2} ${-h / 2 + 30}`} fill="none" stroke={base} strokeWidth={2.4} strokeLinecap="round" />
          {[0, 1, 2].map((i) => {
            const ly = -h / 2 + 42 + i * 24;
            const lw = i === 0 ? w * 0.44 : i % 2 ? w * 0.62 : w * 0.5;
            return (
              <line
                key={i}
                x1={-w / 2 + 18}
                y1={ly}
                x2={-w / 2 + 18 + lw}
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
  const CYy = height * 0.455; // cloud centre
  const intake: P = {x: FX, y: CYy + 94 * U}; // cloud base — packets enter here
  const R = Math.min(width, height) * 0.78; // spawn radius (below)
  const bob = Math.sin(p * TAU * 2) * 5 * U; // gentle cloud float

  /* ---- sync / progress cycles ---- */
  const CYCLES = 5; // uploads completed per loop
  const q = frac(p * CYCLES); // 0..1 within the current upload cycle
  const qe = easeIO(clamp(q / 0.9)); // progress fill, done slightly early
  const doneAge = q; // time since the "complete" moment (cycle start)
  const doneBoost = Math.exp(-Math.pow(doneAge / 0.055, 2)) + Math.exp(-Math.pow((doneAge - 1) / 0.03, 2));

  /* ---- lanes : curved neon beams rising into the intake ---- */
  const lanes = useMemo(() => {
    const deg = [148, 120, 90, 60, 32];
    return deg.map((dg, i) => {
      const a = (dg * Math.PI) / 180;
      const start: P = {x: intake.x + Math.cos(a) * R, y: intake.y + Math.sin(a) * R};
      const dx = intake.x - start.x;
      const dy = intake.y - start.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const bend = (i % 2 === 0 ? 1 : -1) * 0.15;
      const mid: P = {x: start.x + dx * 0.5, y: start.y + dy * 0.5};
      const control: P = {x: mid.x + -ny * len * bend, y: mid.y + nx * len * bend};
      return {start, control};
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  /* ---- emission schedule ---- */
  const E = 35;
  const LANE_N = lanes.length;
  const TRAVEL = 0.16;
  const emissions = useMemo(
    () =>
      Array.from({length: E}, (_, e) => ({
        e,
        lane: e % LANE_N,
        phase: e / E,
        isVio: random('vio' + e) > 0.8,
        variant: random('var' + e) > 0.45 ? 0 : 1,
      })),
    [LANE_N]
  );

  /* ---- cloud geometry (local px, U baked; base at y = 94) ---- */
  const cloudD = useMemo(() => {
    const s = U;
    return (
      `M ${-238 * s} ${94 * s} ` +
      `A ${76 * s} ${76 * s} 0 0 1 ${-206 * s} ${-46 * s} ` +
      `A ${104 * s} ${104 * s} 0 0 1 ${-4 * s} ${-118 * s} ` +
      `A ${92 * s} ${92 * s} 0 0 1 ${172 * s} ${-42 * s} ` +
      `A ${72 * s} ${72 * s} 0 0 1 ${204 * s} ${94 * s} ` +
      `Z`
    );
  }, [U]);
  const slotD = `M ${-104 * U} ${94 * U} L ${104 * U} ${94 * U}`;

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

  /* ---- reactive intake / cloud glow driven by landings ---- */
  let slotBoost = 0;
  emissions.forEach((em) => {
    const age = mod(p - (em.phase + TRAVEL), 1);
    const g = Math.exp(-Math.pow(age / 0.045, 2));
    if (g > slotBoost) slotBoost = g;
  });
  const slotGlow = 0.45 + 0.4 * slotBoost + 0.35 * doneBoost;
  const cloudGlow = 0.8 + 0.16 * Math.sin(p * TAU * 2) + 0.2 * slotBoost + 0.4 * doneBoost;

  /* ---- sync ring (two rotating circular arrows) ---- */
  const syncR = 308 * U;
  const arrowLen = 15 * U;
  const syncArrow = (a1: number) => {
    const r1 = (a1 * Math.PI) / 180;
    const tipX = syncR * Math.cos(r1);
    const tipY = syncR * Math.sin(r1);
    // tangent (direction of travel, sweep-positive)
    const tx = -Math.sin(r1);
    const ty = Math.cos(r1);
    const nx = Math.cos(r1);
    const ny = Math.sin(r1);
    return (
      `M ${tipX + tx * arrowLen} ${tipY + ty * arrowLen} ` +
      `L ${tipX - tx * arrowLen * 0.5 + nx * arrowLen * 0.9} ${tipY - ty * arrowLen * 0.5 + ny * arrowLen * 0.9} ` +
      `L ${tipX - tx * arrowLen * 0.5 - nx * arrowLen * 0.9} ${tipY - ty * arrowLen * 0.5 - ny * arrowLen * 0.9} Z`
    );
  };

  /* ---- progress arc ---- */
  const progR = 258 * U;
  const progCirc = TAU * progR;
  const progOp = fOut(q, 0.94, 1); // hide during the reset instant
  const headA = -90 + qe * 360;
  const headX = progR * Math.cos((headA * Math.PI) / 180);
  const headY = progR * Math.sin((headA * Math.PI) / 180);

  /* ---- completion sparks (same deterministic pattern each pulse) ---- */
  const sparks = useMemo(
    () =>
      Array.from({length: 12}, (_, i) => ({
        a: -Math.PI / 2 + (random('sa' + i) - 0.5) * 2.4,
        sp: 0.6 + random('sp' + i) * 0.4,
        sz: 2 + random('sz' + i) * 2.6,
        vio: random('sv' + i) > 0.75,
      })),
    []
  );

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
          {/* glow filters for chips (design space — scaled by the chip transform) */}
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
          <radialGradient id="bg" cx="50%" cy="52%" r="75%">
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
          <radialGradient id="interior" cx="50%" cy="78%" r="70%">
            <stop offset="0%" stopColor={CY_HOT} stopOpacity="0.95" />
            <stop offset="35%" stopColor={CY} stopOpacity="0.45" />
            <stop offset="100%" stopColor={CY} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c4258" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#072a3e" stopOpacity="0.9" />
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
          <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="58%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.62" />
          </radialGradient>
        </defs>

        {/* background */}
        <rect x="0" y="0" width={width} height={height} fill="url(#bg)" />

        {/* aura + under-cloud seat */}
        <g style={{mixBlendMode: 'screen'}}>
          <circle cx={FX - 150 * U} cy={CYy + 40 * U} r={210 * U} fill="url(#auraVio)" opacity={0.15} />
          <circle cx={FX} cy={CYy} r={400 * U} fill="url(#aura)" opacity={0.55 * (0.85 + 0.15 * Math.sin(p * TAU * 2))} />
          <circle cx={FX + 30 * U} cy={CYy - 16 * U} r={230 * U} fill="url(#auraHot)" opacity={0.42 + 0.2 * doneBoost} />
          <ellipse cx={FX} cy={intake.y + 190 * U} rx={280 * U} ry={52 * U} fill="url(#ground)" opacity={0.3} filter="url(#bMid)" />
        </g>

        {/* bokeh — far & mid (behind) */}
        <g filter="url(#bFar)" style={{mixBlendMode: 'screen'}}>{renderBok(far, 0.5, 0.7)}</g>
        <g filter="url(#bMid)" style={{mixBlendMode: 'screen'}}>{renderBok(mid, 0.42, 1)}</g>

        {/* streams (beams → packets → chips), riding the bob */}
        <g transform={`translate(0 ${bob})`}>
          {/* neon beams */}
          <g style={{mixBlendMode: 'screen'}}>
            {lanes.map((ln, i) => (
              <path
                key={i}
                d={`M ${ln.start.x} ${ln.start.y} Q ${ln.control.x} ${ln.control.y} ${intake.x} ${intake.y}`}
                fill="none"
                stroke={CY}
                strokeWidth={1.3 * U}
                opacity={0.1}
                filter="url(#gL)"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* flowing data dots */}
          {lanes.map((ln, li) => {
            const ND = 14;
            const dots = [];
            for (let d = 0; d < ND; d++) {
              const tt = frac(p * 2 + d / ND + li * 0.11);
              const pos = qbez(ln.start, ln.control, intake, tt);
              const op = fIn(tt, 0, 0.05) * fOut(tt, 0.82, 1) * 0.9;
              const col = li % 3 === 0 && d % 2 === 0 ? 'url(#pdotV)' : 'url(#pdotC)';
              const sz = (2.4 + 1.4 * Math.sin((tt * 6 + d) * 1.7)) * U;
              dots.push(<circle key={d} cx={pos.x} cy={pos.y} r={sz} fill={col} opacity={op} />);
            }
            return (
              <g key={li} filter="url(#gS)" style={{mixBlendMode: 'screen'}}>
                {dots}
              </g>
            );
          })}

          {/* rising up-chevrons on the central lane */}
          <g style={{mixBlendMode: 'screen'}}>
            {[0, 1, 2].map((k) => {
              const tt = frac(p * 2 + k / 3 + 0.07);
              const pos = qbez(lanes[2].start, lanes[2].control, intake, tt);
              const op = fIn(tt, 0, 0.08) * fOut(tt, 0.72, 0.94) * 0.55;
              const w = 26 * U;
              return (
                <path
                  key={k}
                  d={`M ${pos.x - w} ${pos.y + w * 0.62} L ${pos.x} ${pos.y - w * 0.38} L ${pos.x + w} ${pos.y + w * 0.62}`}
                  fill="none"
                  stroke={CY_HOT}
                  strokeWidth={4 * U}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={op}
                  filter="url(#gM)"
                />
              );
            })}
          </g>

          {/* rising data chips + motion-trail ghosts */}
          {emissions.map((em) => {
            const age = mod(p - em.phase, 1);
            if (age >= TRAVEL) return null;
            const t = age / TRAVEL;
            const te = easeIO(t);
            const ln = lanes[em.lane];
            const pos = qbez(ln.start, ln.control, intake, te);
            const base = em.isVio ? VIO : CY;
            const hot = em.isVio ? VIO_HOT : CY_HOT;
            const funnel = 0.2 + 0.48 * Math.sin(te * Math.PI);
            const sink = te > 0.82 ? lerp(1, 0.2, (te - 0.82) / 0.18) : 1;
            const s = funnel * sink * U;
            const op = fIn(t, 0, 0.09) * fOut(t, 0.84, 1);
            const rot = (random('rot' + em.e) * 26 - 13) * (1 - te);
            const ghosts = [1, 2].map((k) => {
              const tr = t - k * 0.05;
              if (tr <= 0) return null;
              const teg = easeIO(tr);
              const pg = qbez(ln.start, ln.control, intake, teg);
              const sg = (0.2 + 0.48 * Math.sin(teg * Math.PI)) * U * 0.96;
              return (
                <DataChip key={k} x={pg.x} y={pg.y} s={sg} rot={rot} op={(op * 0.26) / k} base={base} hot={hot} variant={em.variant} detail={false} />
              );
            });
            return (
              <g key={em.e}>
                {ghosts}
                <DataChip x={pos.x} y={pos.y} s={s} rot={rot} op={op} base={base} hot={hot} variant={em.variant} detail />
              </g>
            );
          })}

          {/* small ripple on each landing */}
          <g style={{mixBlendMode: 'screen'}}>
            {emissions.map((em) => {
              const age = mod(p - (em.phase + TRAVEL), 1);
              const dur = 0.1;
              if (age >= dur) return null;
              const k = age / dur;
              const rad = (26 + 150 * easeOut(k)) * U;
              const op = (1 - k) * 0.36;
              return (
                <circle key={em.e} cx={intake.x} cy={intake.y} r={rad} fill="none" stroke={CY} strokeWidth={2 * U} opacity={op} filter="url(#gM)" />
              );
            })}
          </g>
        </g>

        {/* cloud — body, interior light-well, neon outline (chips sink behind it) */}
        <g transform={`translate(${FX} ${CYy + bob})`}>
          <path d={cloudD} fill="url(#body)" />
          <ellipse cx={0} cy={60 * U} rx={210 * U} ry={120 * U} fill="url(#interior)" opacity={0.5 + 0.35 * slotGlow} />
          <Neon d={cloudD} base={CY} hot={CY_HOT} core={2.4} glow={cloudGlow} u={U} />
          {/* intake slot */}
          <g style={{mixBlendMode: 'screen'}} opacity={slotGlow}>
            <path d={slotD} fill="none" stroke={CY_HOT} strokeWidth={5 * U} strokeLinecap="round" filter="url(#gL)" />
            <path d={slotD} fill="none" stroke={CY_HOT} strokeWidth={2.6 * U} strokeLinecap="round" filter="url(#gM)" />
          </g>
          <path d={slotD} fill="none" stroke={CY_HOT} strokeWidth={1.6 * U} strokeLinecap="round" />
        </g>

        {/* progress arc + sync ring (centred on the cloud) */}
        <g transform={`translate(${FX} ${CYy + bob})`}>
          {/* track */}
          <circle r={progR} fill="none" stroke={CY} strokeWidth={2 * U} opacity={0.08} />
          {/* fill */}
          <g transform="rotate(-90)" style={{mixBlendMode: 'screen'}} opacity={progOp}>
            <circle
              r={progR}
              fill="none"
              stroke={CY}
              strokeWidth={3.2 * U}
              strokeDasharray={`${qe * progCirc} ${progCirc}`}
              strokeLinecap="round"
              opacity={0.65}
              filter="url(#gM)"
            />
            <circle
              r={progR}
              fill="none"
              stroke={CY_HOT}
              strokeWidth={2 * U}
              strokeDasharray={`${qe * progCirc} ${progCirc}`}
              strokeLinecap="round"
              opacity={0.9}
            />
          </g>
          {/* progress head comet */}
          <g style={{mixBlendMode: 'screen'}} opacity={progOp}>
            <circle cx={headX} cy={headY} r={5 * U} fill={CY_HOT} filter="url(#gM)" />
          </g>

          {/* sync ring — two rotating circular arrows, 3 revs per loop */}
          <g transform={`rotate(${p * 3 * 360})`}>
            <g style={{mixBlendMode: 'screen'}}>
              {[0, 180].map((off) => (
                <g key={off}>
                  <path d={arcD(syncR, off + 18, off + 128)} fill="none" stroke={CY} strokeWidth={4 * U} strokeLinecap="round" opacity={0.55} filter="url(#gM)" />
                  <path d={arcD(syncR, off + 18, off + 128)} fill="none" stroke={CY_HOT} strokeWidth={2.4 * U} strokeLinecap="round" opacity={0.85} />
                  <path d={syncArrow(off + 128)} fill={CY_HOT} filter="url(#gM)" opacity={0.95} />
                </g>
              ))}
            </g>
          </g>
          {/* counter-rotating violet whisper ring */}
          <g transform={`rotate(${-p * 2 * 360})`} style={{mixBlendMode: 'screen'}}>
            <circle
              r={syncR * 1.12}
              fill="none"
              stroke={VIO}
              strokeWidth={1.5 * U}
              strokeDasharray={`${0.16 * TAU * syncR * 1.12} ${0.84 * TAU * syncR * 1.12}`}
              strokeLinecap="round"
              opacity={0.3}
              filter="url(#gM)"
            />
          </g>

          {/* COMPLETE pulse — expanding rings + spark burst */}
          <g style={{mixBlendMode: 'screen'}}>
            {[0, 1].map((k) => {
              const dAge = doneAge - k * 0.03;
              const dur = 0.24;
              if (dAge < 0 || dAge >= dur) return null;
              const kk = dAge / dur;
              const rad = (140 + 420 * easeOut(kk)) * U;
              const op = (1 - kk) * (k === 0 ? 0.5 : 0.28);
              return (
                <circle key={k} r={rad} fill="none" stroke={k === 0 ? CY_HOT : CY} strokeWidth={(3 - k) * U} opacity={op} filter="url(#gM)" />
              );
            })}
            {sparks.map((sp, i) => {
              const dur = 0.16;
              if (doneAge >= dur) return null;
              const kk = easeOut(doneAge / dur);
              const dist = kk * sp.sp * 300 * U;
              const sx = Math.cos(sp.a) * dist;
              const sy = -110 * U + Math.sin(sp.a) * dist;
              const op = (1 - doneAge / dur) * 0.85;
              return (
                <circle key={i} cx={sx} cy={sy} r={sp.sz * U} fill={sp.vio ? 'url(#pdotV)' : 'url(#pdotC)'} opacity={op} />
              );
            })}
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
