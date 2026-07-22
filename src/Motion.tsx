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
 * PAYMENT SUCCESSFUL — GREEN CHECK ALERT (PREMIUM)
 * The success twin of the "Payment Declined" card: a glassmorphic dark card pops
 * in, its green border "charges", a green success icon pops as its ring draws and
 * the checkmark strokes on with a glow flash, a confetti burst celebrates, green
 * pulse rings radiate, the paid amount counts up, and a "Done" button shines.
 * Premium UI motion for checkout / payment-success / order-confirmed content.
 * Deterministic. IP-safe / generic. 1920x1080 · 60fps · 15s.
 */

const INK = '#f4f9f6';
const SUB = '#98b4a8';
const GREEN = '#22d97e';
const GREEN2 = '#6bffab';
const GREENDK = '#0fa85c';
const clampO = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const EO = Easing.out(Easing.cubic);

const MX = 590, MY = 246, MW = 740, MH = 560, MR = 32;
const CX = 960;
const IY = 388;
const IR = 74;
const AMOUNT = 249;

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 28], [0, 1], clampO);
  const intro = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 100, mass: 1 } });
  const mScale = interpolate(intro, [0, 1], [0.82, 1]);
  const mOp = interpolate(frame, [8, 26], [0, 1], clampO);
  const floatY = Math.sin(frame * 0.04) * 3;

  const borderDraw = interpolate(frame, [14, 44], [0, 1], { ...clampO, easing: EO });
  const ringDraw = interpolate(frame, [34, 60], [0, 1], { ...clampO, easing: EO });
  const iconPop = spring({ frame: frame - 40, fps, config: { damping: 10, stiffness: 130, mass: 0.8 } });
  const checkDraw = interpolate(frame, [54, 78], [0, 1], { ...clampO, easing: EO });
  const flash = interpolate(frame, [56, 66, 84], [0, 0.9, 0], clampO);
  const iconBreath = 1 + 0.035 * Math.sin(frame * 0.12);
  const glowBreath = 0.4 + 0.28 * (0.5 + 0.5 * Math.sin(frame * 0.09));

  const titleOp = interpolate(frame, [64, 86], [0, 1], clampO);
  const titleY = interpolate(frame, [64, 86], [16, 0], { ...clampO, easing: EO });
  const amount = AMOUNT * interpolate(frame, [70, 104], [0, 1], { ...clampO, easing: EO });
  const amtOp = interpolate(frame, [70, 92], [0, 1], clampO);
  const subOp = interpolate(frame, [86, 106], [0, 1], clampO);
  const btnOp = interpolate(frame, [98, 120], [0, 1], clampO);
  const btnY = interpolate(frame, [98, 120], [14, 0], { ...clampO, easing: EO });
  const linkOp = interpolate(frame, [110, 130], [0, 1], clampO);

  /* pulse rings */
  const rings = [];
  if (frame > 60) {
    for (let k = 0; k < 3; k++) {
      const local = frame - 60 - k * 18;
      if (local <= 0) continue;
      const p = (local % 60) / 60;
      rings.push(<circle key={k} cx={CX} cy={IY} r={IR + p * 150} fill="none" stroke={GREEN} strokeWidth={(1 - p) * 4 + 0.5} opacity={(1 - p) * 0.45} />);
    }
  }

  /* confetti burst + slow drizzle */
  const confetti = [];
  const cols = [GREEN, GREEN2, '#ffd24d', '#ffffff', '#22e6ff'];
  const bt = frame - 66;
  if (bt > 0) {
    for (let i = 0; i < 64; i++) {
      const ang = -Math.PI / 2 + (random(`a${i}`) - 0.5) * 2.7;
      const sp = 7 + random(`s${i}`) * 13;
      const x = CX + Math.cos(ang) * sp * bt * 0.9;
      const y = IY + Math.sin(ang) * sp * bt * 0.9 + 0.13 * bt * bt;
      const life = 1 - bt / 150;
      if (life <= 0) continue;
      const w = 6 + random(`w${i}`) * 7, h = 10 + random(`h${i}`) * 8;
      confetti.push(<rect key={i} x={x} y={y} width={w} height={h} rx="2" fill={cols[i % 5]} opacity={life * 0.95} transform={`rotate(${(random(`r${i}`) * 360 + bt * (4 + random(`rs${i}`) * 6)).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})`} />);
    }
  }
  const drizzle = [];
  for (let i = 0; i < 16; i++) {
    const dx = random(`dx${i}`) * 1920;
    const dy = ((frame * (0.7 + random(`ds${i}`) * 0.7) + random(`dp${i}`) * 1200) % 1240) - 60;
    const w = 5 + random(`dw${i}`) * 6, h = 9 + random(`dh${i}`) * 7;
    drizzle.push(<rect key={i} x={dx} y={dy} width={w} height={h} rx="2" fill={cols[i % 5]} opacity="0.16" transform={`rotate(${(frame * 3 + i * 40) % 360} ${dx.toFixed(0)} ${dy.toFixed(0)})`} />);
  }

  const shineX = -160 + ((frame * 7) % 560);

  return (
    <AbsoluteFill style={{ backgroundColor: '#06090b' }}>
      <svg width={width} height={height} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="sbg" cx="50%" cy="42%" r="70%">
            <stop offset="0" stopColor="#0c1f16" />
            <stop offset="0.5" stopColor="#081410" />
            <stop offset="1" stopColor="#05080a" />
          </radialGradient>
          <linearGradient id="smodal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16221d" />
            <stop offset="1" stopColor="#101815" />
          </linearGradient>
          <linearGradient id="sborder" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7dffbf" />
            <stop offset="0.5" stopColor={GREEN} />
            <stop offset="1" stopColor="#0c7d47" />
          </linearGradient>
          <radialGradient id="sIcon" cx="42%" cy="36%" r="70%">
            <stop offset="0" stopColor="#8affc0" />
            <stop offset="0.55" stopColor={GREEN} />
            <stop offset="1" stopColor={GREENDK} />
          </radialGradient>
          <radialGradient id="grnGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={GREEN} stopOpacity="0.6" />
            <stop offset="1" stopColor={GREEN} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sbtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#33e58c" />
            <stop offset="1" stopColor="#12b060" />
          </linearGradient>
          <filter id="ssoft" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="12" /></filter>
          <filter id="sglow" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="sshadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="26" stdDeviation="40" floodColor="#000" floodOpacity="0.55" /></filter>
          <filter id="sgrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" /></filter>
          <radialGradient id="svig" cx="50%" cy="50%" r="72%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
          <clipPath id="sbtnClip"><rect x={CX - 150} y="694" width="300" height="66" rx="33" /></clipPath>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#sbg)" />
        <g opacity={bgOp}>
          <circle cx={CX} cy={456} r={430} fill="url(#grnGlow)" opacity={glowBreath} filter="url(#ssoft)" />
          {drizzle}
        </g>

        {/* MODAL */}
        <g opacity={mOp} transform={`translate(0 ${floatY.toFixed(2)}) translate(${CX} ${MY + MH / 2}) scale(${mScale.toFixed(3)}) translate(${-CX} ${-(MY + MH / 2)})`}>
          <rect x={MX} y={MY} width={MW} height={MH} rx={MR} fill="url(#smodal)" filter="url(#sshadow)" />
          <rect x={MX} y={MY} width={MW} height={MH} rx={MR} fill="none" stroke={GREEN} strokeWidth="6" opacity="0.16" filter="url(#sglow)" />
          <rect x={MX} y={MY} width={MW} height={MH} rx={MR} fill="none" stroke="url(#sborder)" strokeWidth="2.6" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - borderDraw} filter="url(#sglow)" />
          <rect x={MX + 1} y={MY + 1} width={MW - 2} height="2" rx="1" fill="#ffffff" opacity="0.12" />

          {rings}
          <circle cx={CX} cy={IY} r={140} fill="url(#grnGlow)" opacity={0.5 + 0.3 * flash + 0.15 * Math.sin(frame * 0.12)} />
          <g transform={`translate(${CX} ${IY}) scale(${(iconPop * iconBreath).toFixed(3)}) translate(${-CX} ${-IY})`}>
            <circle cx={CX} cy={IY} r={IR} fill="url(#sIcon)" opacity="0.16" />
            <circle cx={CX} cy={IY} r={IR} fill="none" stroke={GREEN} strokeWidth="6" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ringDraw} filter="url(#sglow)" />
            <path d={`M ${CX - 32} ${IY + 2} L ${CX - 9} ${IY + 26} L ${CX + 34} ${IY - 24}`} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - checkDraw} filter="url(#sglow)" />
            <circle cx={CX} cy={IY} r={IR} fill="#fff" opacity={flash * 0.5} />
          </g>

          {/* title + amount + subtitle */}
          <text x={CX} y={546 + titleY} fontSize="52" fontWeight="800" fill={INK} textAnchor="middle" opacity={titleOp} fontFamily="Inter, 'Segoe UI', Arial, sans-serif" letterSpacing="0.5">Payment Successful</text>
          <text x={CX} y="602" fontSize="36" fontWeight="800" fill={GREEN} textAnchor="middle" opacity={amtOp} fontFamily="Inter, 'Segoe UI', Arial, sans-serif" filter="url(#sglow)" style={{ fontVariantNumeric: 'tabular-nums' }}>{'$' + amount.toFixed(2)}</text>
          <text x={CX} y="642" fontSize="22" fontWeight="500" fill={SUB} textAnchor="middle" opacity={subOp} fontFamily="Inter, 'Segoe UI', Arial, sans-serif">Your transaction has been completed successfully.</text>

          {/* button */}
          <g opacity={btnOp} transform={`translate(0 ${btnY.toFixed(2)})`}>
            <rect x={CX - 150} y="694" width="300" height="66" rx="33" fill="url(#sbtn)" filter="url(#sglow)" />
            <g clipPath="url(#sbtnClip)"><rect x={CX - 150 + shineX} y="690" width="70" height="74" fill="#fff" opacity="0.18" transform="skewX(-18)" /></g>
            <text x={CX} y="736" fontSize="26" fontWeight="700" fill="#06251a" textAnchor="middle" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">Done</text>
          </g>
          <text x={CX} y="792" fontSize="20" fontWeight="600" fill={SUB} textAnchor="middle" opacity={linkOp} letterSpacing="0.5" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">View receipt</text>
        </g>

        {confetti}
        <rect x="0" y="0" width="1920" height="1080" filter="url(#sgrain)" opacity="0.035" style={{ mixBlendMode: 'overlay' }} />
        <rect x="0" y="0" width="1920" height="1080" fill="url(#svig)" />
      </svg>
    </AbsoluteFill>
  );
};
