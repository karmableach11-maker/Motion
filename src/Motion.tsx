import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  random,
} from 'remotion';

/**
 * SAVINGS WALLET — GOLD COINS DROP-IN (PREMIUM)
 * A realistic leather bifold wallet (edge stitching, leather grain, sheen, snap,
 * open cash slot — no card) receives glossy gold "$" coins that fall, wobble,
 * bounce at the slot and slip inside. Each deposit fires a sparkle burst + gold
 * glow, the wallet squashes, a green "+$" floats up and a savings counter ticks
 * higher. Warm bokeh, soft floor reflection, embossed coins with a specular
 * streak. Clear spacing so nothing overlaps. Deterministic. IP-safe / generic.
 * 1920x1080 · 60fps · 15s.
 */

const INK = '#f3f8fb';
const SUB = '#8fc9c0';
const GOLD = '#f5b423';
const GOLD_HI = '#ffe9a8';
const GREEN = '#37d99a';
const clampO = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const EO = Easing.out(Easing.cubic);
const EI = Easing.in(Easing.quad);
const smooth = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clampO, easing: Easing.inOut(Easing.cubic) });

/* wallet frame */
const CX = 960;
const WX = 670;
const WW = 580;
const BACK_Y = 545;
const MOUTH_Y = 590;
const FRONT_Y = 592;
const WBOT = 882;

const COINS = [
  { s: 34, amt: 150 },
  { s: 158, amt: 300 },
  { s: 286, amt: 250 },
  { s: 410, amt: 500 },
  { s: 532, amt: 200 },
  { s: 652, amt: 400 },
  { s: 772, amt: 300 },
];
const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

/* ---------- coin ---------- */
const Coin: React.FC<{ cx: number; cy: number; r: number; sx: number; rot: number; op: number; shine: number }> = ({ cx, cy, r, sx, rot, op, shine }) => (
  <g transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(3)} 1)`} opacity={op} filter="url(#coinGlow)">
    <circle r={r} fill="url(#coinEdge)" />
    <circle r={r - 5} fill="url(#coinFace)" />
    <circle r={r - 5} fill="none" stroke="#d98a12" strokeWidth="1.5" opacity="0.7" />
    <circle r={r - 12} fill="none" stroke="#fff2c2" strokeWidth="2" opacity="0.55" strokeDasharray="3 5" />
    <text x="0" y={r * 0.34 + 2} fontSize={r * 1.05} fontWeight="800" fill="#c9780a" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif">$</text>
    <text x="0" y={r * 0.34} fontSize={r * 1.05} fontWeight="800" fill="url(#coinText)" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif">$</text>
    <ellipse cx={-r * 0.32} cy={-r * 0.42} rx={r * 0.4} ry={r * 0.22} fill="#fff" opacity={0.35 * shine} transform="rotate(-32)" />
  </g>
);

const spark = (cx: number, cy: number, s: number): string =>
  `M ${cx} ${cy - s} C ${cx + s * 0.18} ${cy - s * 0.18} ${cx + s * 0.18} ${cy - s * 0.18} ${cx + s} ${cy} C ${cx + s * 0.18} ${cy + s * 0.18} ${cx + s * 0.18} ${cy + s * 0.18} ${cx} ${cy + s} C ${cx - s * 0.18} ${cy + s * 0.18} ${cx - s * 0.18} ${cy + s * 0.18} ${cx - s} ${cy} C ${cx - s * 0.18} ${cy - s * 0.18} ${cx - s * 0.18} ${cy - s * 0.18} ${cx} ${cy - s} Z`;

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const introS = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90, mass: 1 } });
  const introScale = interpolate(introS, [0, 1], [0.82, 1]);
  const bob = 4 * Math.sin(frame * 0.045);

  const coinState = COINS.map((c) => {
    const l = frame - c.s;
    const e = c.s + 46;
    const vis = l >= 0 && l <= 78;
    const yFall = interpolate(l, [0, 40], [356, 585], { ...clampO, easing: EI });
    const yEnter = interpolate(l, [40, 47, 54, 78], [585, 570, 585, 720], { ...clampO, easing: EO });
    const yy = l <= 40 ? yFall : yEnter;
    const sx = 0.82 + 0.18 * Math.cos(l * 0.5);
    const rot = 5 * Math.sin(l * 0.3);
    const op = interpolate(l, [0, 4], [0, 1], clampO);
    const shine = 0.5 + 0.5 * Math.sin(l * 0.5);
    return { c, l, e, vis, y: yy, sx: Math.max(0.6, sx), rot, op, shine };
  });

  let squash = 0;
  coinState.forEach((st) => {
    const x = frame - st.e;
    if (x >= 0 && x <= 34) squash += Math.exp(-x / 9) * Math.cos(x * 0.5);
  });
  const wScaleY = 1 - 0.055 * squash;
  const wScaleX = 1 + 0.045 * squash;

  let total = 0;
  COINS.forEach((c) => {
    total += c.amt * smooth(frame, c.s + 46, c.s + 68);
  });
  let pop = 0;
  coinState.forEach((st) => {
    const x = frame - st.e;
    if (x >= 0 && x <= 26) pop += Math.exp(-x / 7) * Math.cos(x * 0.55);
  });
  const savedCount = COINS.filter((c) => frame >= c.s + 50).length;
  const glowGrow = interpolate(savedCount, [0, 7], [0.22, 0.7], clampO);

  const bokeh = [];
  for (let i = 0; i < 14; i++) {
    const bx = random(`bx${i}`) * 1920;
    const rise = ((frame * (0.3 + random(`bs${i}`) * 0.5) + random(`bp${i}`) * 1200) % 1240) - 60;
    const by = 1140 - rise;
    const rr = 8 + random(`br${i}`) * 26;
    const gold = random(`bc${i}`) > 0.5;
    bokeh.push(<circle key={i} cx={bx} cy={by} r={rr} fill={gold ? GOLD : GREEN} opacity={0.05 + random(`bo${i}`) * 0.06} filter="url(#soft)" />);
  }
  const amb = [];
  for (let i = 0; i < 10; i++) {
    const ax = 160 + random(`ax${i}`) * 1600;
    const ay = 300 + random(`ay${i}`) * 660;
    const tw = 0.5 + 0.5 * Math.sin(frame * (0.06 + random(`at${i}`) * 0.06) + i);
    amb.push(<path key={i} d={spark(ax, ay, 6 + random(`as${i}`) * 5)} fill="#fff" opacity={0.1 + tw * 0.26} />);
  }

  const walletT = `translate(${CX} ${WBOT}) scale(${(introScale * wScaleX).toFixed(3)} ${(introScale * wScaleY).toFixed(3)}) translate(${-CX} ${(-WBOT + bob).toFixed(1)})`;

  return (
    <AbsoluteFill style={{ backgroundColor: '#061a1e' }}>
      <svg width={width} height={height} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="bg" cx="50%" cy="54%" r="72%">
            <stop offset="0" stopColor="#123f47" />
            <stop offset="0.5" stopColor="#0b2a30" />
            <stop offset="1" stopColor="#05161a" />
          </radialGradient>
          <linearGradient id="wBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f5f50" />
            <stop offset="1" stopColor="#073028" />
          </linearGradient>
          <linearGradient id="wLining" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#25b394" />
            <stop offset="1" stopColor="#127a63" />
          </linearGradient>
          <linearGradient id="wFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f9a7d" />
            <stop offset="0.5" stopColor="#157a63" />
            <stop offset="1" stopColor="#0b4c3f" />
          </linearGradient>
          <linearGradient id="innerTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.5" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="botShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.32" />
          </linearGradient>
          <radialGradient id="coinFace" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset="0.45" stopColor="#ffd24d" />
            <stop offset="1" stopColor="#f0a51c" />
          </radialGradient>
          <linearGradient id="coinEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7c24a" />
            <stop offset="1" stopColor="#c9780a" />
          </linearGradient>
          <linearGradient id="coinText" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6d8" />
            <stop offset="1" stopColor="#ffca57" />
          </linearGradient>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={GOLD} stopOpacity="0.7" />
            <stop offset="1" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="coinGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <filter id="wShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="20" stdDeviation="28" floodColor="#000" floodOpacity="0.42" />
          </filter>
          <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="leather" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="8" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0" />
          </filter>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" /></filter>
          <radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
          <clipPath id="floorClip"><rect x="0" y={WBOT + 2} width="1920" height="170" /></clipPath>
          <clipPath id="frontClip"><rect x={WX} y={FRONT_Y} width={WW} height={WBOT - FRONT_Y} rx="40" /></clipPath>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#bg)" />
        {bokeh}
        <circle cx={CX} cy="720" r={320} fill="url(#goldGlow)" opacity={glowGrow} filter="url(#soft)" />

        {/* floor reflection */}
        <g clipPath="url(#floorClip)" opacity="0.14" transform={`translate(0 ${(2 * WBOT).toFixed(0)}) scale(1 -1)`}>
          <rect x={WX} y={FRONT_Y} width={WW} height={WBOT - FRONT_Y} rx="40" fill="url(#wFront)" />
        </g>
        <ellipse cx={CX} cy={WBOT + 6} rx={252 * wScaleX} ry="24" fill="#000" opacity="0.4" filter="url(#soft)" />

        {/* WALLET */}
        <g transform={walletT}>
          {/* back panel */}
          <rect x={WX} y={BACK_Y} width={WW} height={WBOT - BACK_Y} rx="44" fill="url(#wBack)" filter="url(#wShadow)" />
          {/* inner lining peeking */}
          <rect x={WX + 20} y={BACK_Y + 6} width={WW - 40} height="70" rx="30" fill="url(#wLining)" />
          {/* opening slot shadow */}
          <rect x={WX + 34} y={MOUTH_Y - 26} width={WW - 68} height="34" rx="16" fill="#052019" opacity="0.9" />

          {/* falling coins (behind front) */}
          {coinState.map((st, i) => (st.vis ? <Coin key={i} cx={CX + (random(`cx${i}`) - 0.5) * 22} cy={st.y} r={56} sx={st.sx} rot={st.rot} op={st.op} shine={st.shine} /> : null))}

          {/* front pocket */}
          <g>
            <rect x={WX} y={FRONT_Y} width={WW} height={WBOT - FRONT_Y} rx="40" fill="url(#wFront)" />
            {/* leather grain */}
            <g clipPath="url(#frontClip)">
              <rect x={WX} y={FRONT_Y} width={WW} height={WBOT - FRONT_Y} filter="url(#leather)" opacity="0.06" style={{ mixBlendMode: 'overlay' }} />
              {/* diagonal sheen */}
              <path d={`M ${WX} ${FRONT_Y + 40} L ${WX + 230} ${FRONT_Y} L ${WX + 360} ${FRONT_Y} L ${WX + 120} ${WBOT} L ${WX} ${WBOT} Z`} fill="#ffffff" opacity="0.05" />
              {/* inner-top opening shadow */}
              <rect x={WX} y={FRONT_Y} width={WW} height="46" fill="url(#innerTop)" />
              {/* bottom volume shade */}
              <rect x={WX} y={WBOT - 90} width={WW} height="90" fill="url(#botShade)" />
            </g>
            {/* top edge highlight */}
            <path d={`M ${WX + 40} ${FRONT_Y + 3} Q ${CX} ${FRONT_Y - 4} ${WX + WW - 40} ${FRONT_Y + 3}`} fill="none" stroke="#bff6e4" strokeWidth="3" opacity="0.4" />
            {/* edge stitching */}
            <rect x={WX + 20} y={FRONT_Y + 22} width={WW - 40} height={WBOT - FRONT_Y - 44} rx="26" fill="none" stroke="#9df3d8" strokeWidth="2.6" strokeDasharray="10 9" opacity="0.5" />
            {/* front coin-pocket flap line + snap */}
            <path d={`M ${WX + 74} ${WBOT - 92} Q ${CX} ${WBOT - 110} ${WX + WW - 74} ${WBOT - 92}`} fill="none" stroke="#0a3f34" strokeWidth="3" opacity="0.6" />
            <circle cx={CX} cy={WBOT - 96} r="13" fill="url(#coinFace)" stroke="#c9780a" strokeWidth="2" />
            <circle cx={CX} cy={WBOT - 96} r="4.5" fill="#c9780a" />
          </g>
        </g>

        {/* entry sparkle + ring */}
        {coinState.map((st, i) => {
          const x = frame - st.e;
          if (x < 0 || x > 40) return null;
          const p = x / 32;
          const ringR = interpolate(p, [0, 1], [12, 96], clampO);
          const ringOp = interpolate(p, [0, 1], [0.6, 0], clampO);
          const sparks = [];
          for (let k = 0; k < 8; k++) {
            const ang = (k / 8) * Math.PI * 2 + i;
            const d = p * (64 + random(`sd${i}${k}`) * 40);
            const sxp = CX + Math.cos(ang) * d;
            const syp = MOUTH_Y + Math.sin(ang) * d * 0.7;
            const ss = (1 - p) * (7 + random(`ss${i}${k}`) * 6);
            sparks.push(<path key={k} d={spark(sxp, syp, ss)} fill={k % 2 ? GOLD_HI : '#fff'} opacity={(1 - p) * 0.9} />);
          }
          return (
            <g key={i} filter="url(#glow)">
              <circle cx={CX} cy={MOUTH_Y} r={ringR} fill="none" stroke={GOLD_HI} strokeWidth={3 * (1 - p) + 0.5} opacity={ringOp} />
              {sparks}
            </g>
          );
        })}

        {/* "+$" floats */}
        {COINS.map((c, i) => {
          const x = frame - (c.s + 48);
          if (x < 0 || x > 66) return null;
          const yy = interpolate(x, [0, 66], [560, 452], { ...clampO, easing: EO });
          const op = interpolate(x, [0, 10, 46, 66], [0, 1, 1, 0], clampO);
          return (
            <text key={i} x={CX + 190} y={yy} fontSize="42" fontWeight="800" fill={GREEN} textAnchor="middle" opacity={op} fontFamily="Inter, 'Segoe UI', Arial, sans-serif" filter="url(#glow)" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {'+' + fmt(c.amt)}
            </text>
          );
        })}

        {/* counter (fixed, top) */}
        <text x={CX} y="150" fontSize="21" fontWeight="700" fill={SUB} textAnchor="middle" letterSpacing="7" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">TOTAL SAVED</text>
        <g transform={`translate(${CX} 224) scale(${(1 + 0.08 * pop).toFixed(3)}) translate(${-CX} -224)`}>
          <text x={CX} y="224" fontSize="78" fontWeight="800" fill={INK} textAnchor="middle" fontFamily="Inter, 'Segoe UI', Arial, sans-serif" filter="url(#glow)" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmt(total)}
          </text>
        </g>

        {amb}
        <rect x="0" y="0" width="1920" height="1080" filter="url(#grain)" opacity="0.035" style={{ mixBlendMode: 'overlay' }} />
        <rect x="0" y="0" width="1920" height="1080" fill="url(#vig)" />
      </svg>
    </AbsoluteFill>
  );
};
