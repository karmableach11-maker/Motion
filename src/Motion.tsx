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
 * PAYMENT DECLINED — ERROR ALERT (PREMIUM)
 * A glassmorphic dark alert card springs in with a subtle error shake, its red
 * border "charges", a red error icon pops as its ring draws and the X strokes on,
 * radiating alert pulse rings, a breathing red glow, drifting embers and a
 * "Try Again" button with a shine sweep. Premium UI motion for payment-failure /
 * transaction-error / security content. Deterministic. IP-safe. 1920x1080·60fps.
 */

const INK = '#f4f6fb';
const SUB = '#9aa6b8';
const RED = '#ff4256';
const RED2 = '#ff6f7d';
const REDDK = '#c31d31';
const clampO = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const EO = Easing.out(Easing.cubic);

const MX = 590, MY = 246, MW = 740, MH = 560, MR = 32;
const CX = 960;
const IY = 392;
const IR = 74;

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 28], [0, 1], clampO);
  const intro = spring({ frame: frame - 8, fps, config: { damping: 13, stiffness: 95, mass: 1 } });
  const mScale = interpolate(intro, [0, 1], [0.82, 1]);
  const mOp = interpolate(frame, [8, 26], [0, 1], clampO);
  const shake = frame >= 22 && frame < 58 ? Math.exp(-(frame - 22) / 11) * Math.sin((frame - 22) * 0.95) * 16 : 0;
  const floatY = Math.sin(frame * 0.04) * 3;

  const borderDraw = interpolate(frame, [14, 44], [0, 1], { ...clampO, easing: EO });
  const ringDraw = interpolate(frame, [34, 60], [0, 1], { ...clampO, easing: EO });
  const iconPop = spring({ frame: frame - 40, fps, config: { damping: 11, stiffness: 120, mass: 0.8 } });
  const xDraw = interpolate(frame, [52, 74], [0, 1], { ...clampO, easing: EO });
  const flash = interpolate(frame, [54, 62, 78], [0, 0.9, 0], clampO);
  const iconBreath = 1 + 0.035 * Math.sin(frame * 0.12);
  const glowBreath = 0.4 + 0.28 * (0.5 + 0.5 * Math.sin(frame * 0.09));

  const titleOp = interpolate(frame, [62, 84], [0, 1], clampO);
  const titleY = interpolate(frame, [62, 84], [16, 0], { ...clampO, easing: EO });
  const subOp = interpolate(frame, [76, 98], [0, 1], clampO);
  const btnOp = interpolate(frame, [90, 112], [0, 1], clampO);
  const btnY = interpolate(frame, [90, 112], [14, 0], { ...clampO, easing: EO });
  const linkOp = interpolate(frame, [102, 122], [0, 1], clampO);

  const C = 2 * Math.PI * IR;

  /* alert pulse rings */
  const rings = [];
  if (frame > 58) {
    for (let k = 0; k < 3; k++) {
      const local = frame - 58 - k * 18;
      if (local <= 0) continue;
      const p = (local % 60) / 60;
      rings.push(<circle key={k} cx={CX} cy={IY} r={IR + p * 150} fill="none" stroke={RED} strokeWidth={(1 - p) * 4 + 0.5} opacity={(1 - p) * 0.45} />);
    }
  }

  /* embers */
  const embers = [];
  for (let i = 0; i < 26; i++) {
    const ex = random(`ex${i}`) * 1920;
    const ey = 1120 - ((frame * (0.5 + random(`es${i}`) * 0.8) + random(`ep${i}`) * 1100) % 1160);
    const s = 1.4 + random(`er${i}`) * 3;
    embers.push(<circle key={i} cx={ex} cy={ey} r={s} fill={random(`ec${i}`) > 0.5 ? RED : '#ff8a5c'} opacity={0.06 + random(`eo${i}`) * 0.14} filter="url(#dsoft)" />);
  }

  const shineX = -160 + ((frame * 7) % 560);

  return (
    <AbsoluteFill style={{ backgroundColor: '#08070c' }}>
      <svg width={width} height={height} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="dbg" cx="50%" cy="42%" r="70%">
            <stop offset="0" stopColor="#1c0f16" />
            <stop offset="0.5" stopColor="#100a10" />
            <stop offset="1" stopColor="#06050a" />
          </radialGradient>
          <linearGradient id="modal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a1d29" />
            <stop offset="1" stopColor="#111219" />
          </linearGradient>
          <linearGradient id="mborder" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff6f7d" />
            <stop offset="0.5" stopColor={RED} />
            <stop offset="1" stopColor="#8f1524" />
          </linearGradient>
          <radialGradient id="iconFill" cx="42%" cy="36%" r="70%">
            <stop offset="0" stopColor="#ff7a86" />
            <stop offset="0.55" stopColor={RED} />
            <stop offset="1" stopColor={REDDK} />
          </radialGradient>
          <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={RED} stopOpacity="0.6" />
            <stop offset="1" stopColor={RED} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="btnG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff5b6a" />
            <stop offset="1" stopColor="#d8283b" />
          </linearGradient>
          <filter id="dsoft" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="12" /></filter>
          <filter id="dglow" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="mshadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="26" stdDeviation="40" floodColor="#000" floodOpacity="0.55" /></filter>
          <filter id="dgrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" /></filter>
          <radialGradient id="dvig" cx="50%" cy="50%" r="72%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
          <clipPath id="btnClip"><rect x={CX - 150} y="694" width="300" height="66" rx="33" /></clipPath>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#dbg)" />
        <g opacity={bgOp}>
          <circle cx={CX} cy={460} r={430} fill="url(#redGlow)" opacity={glowBreath} filter="url(#dsoft)" />
          {embers}
        </g>

        {/* MODAL */}
        <g opacity={mOp} transform={`translate(${(shake).toFixed(2)} ${floatY.toFixed(2)}) translate(${CX} ${MY + MH / 2}) scale(${mScale.toFixed(3)}) translate(${-CX} ${-(MY + MH / 2)})`}>
          <rect x={MX} y={MY} width={MW} height={MH} rx={MR} fill="url(#modal)" filter="url(#mshadow)" />
          <rect x={MX} y={MY} width={MW} height={MH} rx={MR} fill="none" stroke={RED} strokeWidth="6" opacity="0.16" filter="url(#dglow)" />
          {/* charging border */}
          <rect x={MX} y={MY} width={MW} height={MH} rx={MR} fill="none" stroke="url(#mborder)" strokeWidth="2.6" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - borderDraw} filter="url(#dglow)" />
          <rect x={MX + 1} y={MY + 1} width={MW - 2} height="2" rx="1" fill="#ffffff" opacity="0.12" />

          {/* alert rings + icon */}
          {rings}
          <circle cx={CX} cy={IY} r={140} fill="url(#redGlow)" opacity={0.5 + 0.3 * flash + 0.15 * Math.sin(frame * 0.12)} />
          <g transform={`translate(${CX} ${IY}) scale(${(iconPop * iconBreath).toFixed(3)}) translate(${-CX} ${-IY})`}>
            <circle cx={CX} cy={IY} r={IR} fill="url(#iconFill)" opacity="0.16" />
            <circle cx={CX} cy={IY} r={IR} fill="none" stroke={RED} strokeWidth="6" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ringDraw} filter="url(#dglow)" />
            <g filter="url(#dglow)" stroke="#fff" strokeWidth="8" strokeLinecap="round">
              <line x1={CX - 26} y1={IY - 26} x2={CX - 26 + 52 * xDraw} y2={IY - 26 + 52 * xDraw} />
              <line x1={CX + 26} y1={IY - 26} x2={CX + 26 - 52 * xDraw} y2={IY - 26 + 52 * xDraw} />
            </g>
            <circle cx={CX} cy={IY} r={IR} fill="#fff" opacity={flash * 0.5} />
          </g>

          {/* title + subtitle */}
          <text x={CX} y={548 + titleY} fontSize="52" fontWeight="800" fill={INK} textAnchor="middle" opacity={titleOp} fontFamily="Inter, 'Segoe UI', Arial, sans-serif" letterSpacing="0.5">Payment Declined</text>
          <text x={CX} y="596" fontSize="23" fontWeight="500" fill={SUB} textAnchor="middle" opacity={subOp} fontFamily="Inter, 'Segoe UI', Arial, sans-serif">Your transaction could not be processed.</text>
          <text x={CX} y="628" fontSize="23" fontWeight="500" fill={SUB} textAnchor="middle" opacity={subOp} fontFamily="Inter, 'Segoe UI', Arial, sans-serif">Please check your details or try another method.</text>

          {/* button */}
          <g opacity={btnOp} transform={`translate(0 ${btnY.toFixed(2)})`}>
            <rect x={CX - 150} y="694" width="300" height="66" rx="33" fill="url(#btnG)" filter="url(#dglow)" />
            <g clipPath="url(#btnClip)"><rect x={CX - 150 + shineX} y="690" width="70" height="74" fill="#fff" opacity="0.16" transform="skewX(-18)" /></g>
            <text x={CX} y="736" fontSize="26" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">Try Again</text>
          </g>
          <text x={CX} y="792" fontSize="20" fontWeight="600" fill={SUB} textAnchor="middle" opacity={linkOp} letterSpacing="0.5" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">Use a different payment method</text>
        </g>

        <rect x="0" y="0" width="1920" height="1080" filter="url(#dgrain)" opacity="0.035" style={{ mixBlendMode: 'overlay' }} />
        <rect x="0" y="0" width="1920" height="1080" fill="url(#dvig)" />
      </svg>
    </AbsoluteFill>
  );
};
