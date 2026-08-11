import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;
const TAU = Math.PI * 2;

const PIVOT_X = 960;
const PIVOT_Y = 455;
const BEAM_HALF = 620;
const PAN_DROP = 164;
const FLOOR_Y = 860;

type Side = 'cyan' | 'amber';

type Batch = {
  side: Side;
  from: number;
  to: number;
  firstImpact: number;
  lastImpact: number;
  finale?: boolean;
};

type Token = {
  id: number;
  side: Side;
  impact: number;
  travel: number;
  finale: boolean;
  seed: number;
};

type Point = {x: number; y: number};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const fract = (value: number) => value - Math.floor(value);

const hash = (value: number) =>
  fract(Math.sin(value * 127.1 + 311.7) * 43758.5453123);

const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const easeInOut = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

const phase = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const BATCHES: Batch[] = [
  {side: 'cyan', from: 0, to: 6, firstImpact: 90, lastImpact: 108},
  {side: 'amber', from: 0, to: 7, firstImpact: 120, lastImpact: 165},
  {side: 'cyan', from: 6, to: 12, firstImpact: 180, lastImpact: 222},
  {side: 'amber', from: 7, to: 13, firstImpact: 246, lastImpact: 276},
  {side: 'cyan', from: 12, to: 19, firstImpact: 294, lastImpact: 333},
  {side: 'amber', from: 13, to: 21, firstImpact: 348, lastImpact: 390},
  {side: 'cyan', from: 19, to: 25, firstImpact: 402, lastImpact: 441},
  {side: 'amber', from: 21, to: 26, firstImpact: 456, lastImpact: 492},
  {
    side: 'cyan',
    from: 25,
    to: 53,
    firstImpact: 510,
    lastImpact: 588,
    finale: true,
  },
];

const FINAL_IMPACTS = [
  520, 526, 531, 534, 537, 539, 541, 543, 545, 547, 549, 551, 553, 555,
  557, 559, 561, 563, 564, 566, 567, 570, 573, 576, 579, 582, 585, 588,
];

const TOKENS: Token[] = BATCHES.flatMap((batch, batchIndex) => {
  const count = batch.to - batch.from;
  return Array.from({length: count}, (_, index) => {
    const impact = batch.finale
      ? FINAL_IMPACTS[index]
      : Math.round(
          mix(
            batch.firstImpact,
            batch.lastImpact,
            count === 1 ? 1 : index / (count - 1),
          ),
        );
    return {
      id: batchIndex * 100 + index,
      side: batch.side,
      impact,
      travel: batch.finale ? 17 : 23,
      finale: Boolean(batch.finale),
      seed: hash(batchIndex * 37 + index * 11 + 3),
    };
  });
});

const ANGLE_FRAMES = [
  0, 72, 90, 108, 120, 165, 180, 222, 246, 276, 294, 333, 348, 390,
  402, 441, 456, 492, 507, 540, 564, 582, 600, 899,
];

const ANGLE_VALUES = [
  0, 0, -1, -5.4, -5.1, 4, 3.2, -5.2, -4.2, 3.1, 2.2, -8.8, -7.8,
  5, 4.1, -5.2, -4.2, 2, 1.7, -6.2, -17.2, -18.2, -18.2, -18.2,
];

const angleAt = (frame: number) =>
  interpolate(frame, ANGLE_FRAMES, ANGLE_VALUES, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOut,
  });

const endpointAt = (angle: number, side: Side): Point => {
  const direction = side === 'cyan' ? -1 : 1;
  const radians = (angle * Math.PI) / 180;
  return {
    x: PIVOT_X + direction * BEAM_HALF * Math.cos(radians),
    y: PIVOT_Y + direction * BEAM_HALF * Math.sin(radians),
  };
};

const countAt = (frame: number, side: Side) =>
  TOKENS.reduce(
    (count, token) =>
      token.side === side && frame >= token.impact ? count + 1 : count,
    0,
  );

const impactEnergy = (frame: number, side: Side) =>
  clamp(
    TOKENS.reduce((sum, token) => {
      if (token.side !== side) return sum;
      const age = frame - token.impact;
      if (age < 0 || age > 28) return sum;
      return sum + Math.exp(-age / 8.5);
    }, 0),
  );

const panBounce = (frame: number, side: Side) =>
  clamp(
    TOKENS.reduce((sum, token) => {
      if (token.side !== side) return sum;
      const age = frame - token.impact;
      if (age < 0 || age > 34) return sum;
      return sum - Math.sin(age * 0.34) * Math.exp(-age / 13) * 3.6;
    }, 0),
    -7,
    7,
  );

const latestImpactAge = (frame: number, side: Side) => {
  let latest = Number.POSITIVE_INFINITY;
  for (const token of TOKENS) {
    if (token.side !== side || token.impact > frame) continue;
    latest = Math.min(latest, frame - token.impact);
  }
  return latest;
};

const panState = (frame: number, side: Side, angle: number) => {
  const anchor = endpointAt(angle, side);
  return {
    anchor,
    center: {
      x: anchor.x,
      y: anchor.y + PAN_DROP + panBounce(frame, side),
    },
  };
};

const EMITTER_X: Record<Side, number> = {cyan: 340, amber: 1580};
const COLOR: Record<Side, string> = {cyan: '#27ddfb', amber: '#ff8a3d'};
const HIGHLIGHT: Record<Side, string> = {
  cyan: '#a4fbff',
  amber: '#ffd078',
};

const DUST = Array.from({length: 15}, (_, index) => {
  const sizeMix = Math.pow(hash(index * 5.7 + 4), 2);
  return {
    id: index,
    x: mix(-80, WIDTH + 80, hash(index * 2.3 + 1)),
    y: mix(55, 810, hash(index * 3.9 + 2)),
    radius: mix(1.1, 4.8, sizeMix) * (index % 4 === 0 ? 0.75 : 1),
    opacity:
      mix(0.1, 0.43, hash(index * 4.7 + 7)) * (index % 4 === 0 ? 0.8 : 1),
    speed:
      index % 4 === 0
        ? 0
        : mix(12, 20, hash(index * 6.1 + 8)) * mix(0.9, 1.17, sizeMix),
    phase: hash(index * 7.3 + 5) * TAU,
    cycles: 2 + Math.floor(hash(index * 8.9 + 9) * 3),
    warm: hash(index * 9.7 + 12) > 0.82,
  };
});

const GLASS_FINS = Array.from({length: 11}, (_, index) => ({
  x: 70 + index * 178 + mix(-22, 22, hash(index * 3.1)),
  width: mix(58, 132, hash(index * 4.4 + 1)),
  height: mix(360, 780, hash(index * 5.8 + 2)),
  opacity: mix(0.025, 0.075, hash(index * 7.2 + 3)),
}));

const SvgDefs: React.FC = () => (
  <defs>
    <linearGradient id="backgroundPaint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#071422" />
      <stop offset="0.52" stopColor="#030914" />
      <stop offset="1" stopColor="#01050c" />
    </linearGradient>
    <radialGradient id="centerAtmosphere" cx="50%" cy="42%" r="68%">
      <stop offset="0" stopColor="#15334a" stopOpacity="0.38" />
      <stop offset="0.48" stopColor="#071522" stopOpacity="0.14" />
      <stop offset="1" stopColor="#01040a" stopOpacity="0" />
    </radialGradient>
    <linearGradient
      id="floorLine"
      x1="60"
      y1="0"
      x2="1860"
      y2="0"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stopColor="#27ddfb" />
      <stop offset="0.32" stopColor="#76efff" />
      <stop offset="0.5" stopColor="#eaf7ff" />
      <stop offset="0.68" stopColor="#ffd078" />
      <stop offset="1" stopColor="#ff8a3d" />
    </linearGradient>
    <linearGradient id="pedestalMetal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#526579" />
      <stop offset="0.18" stopColor="#b7c8d6" />
      <stop offset="0.46" stopColor="#f4fbff" />
      <stop offset="0.62" stopColor="#aebdca" />
      <stop offset="1" stopColor="#354558" />
    </linearGradient>
    <linearGradient id="pedestalCore" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
      <stop offset="0.45" stopColor="#7eefff" stopOpacity="0.54" />
      <stop offset="1" stopColor="#1a5b76" stopOpacity="0.1" />
    </linearGradient>
    <linearGradient
      id="beamMetal"
      x1="340"
      y1="0"
      x2="1580"
      y2="0"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stopColor="#37e8ff" />
      <stop offset="0.1" stopColor="#91f8ff" />
      <stop offset="0.33" stopColor="#a9bccd" />
      <stop offset="0.5" stopColor="#f6fbff" />
      <stop offset="0.67" stopColor="#bac4cf" />
      <stop offset="0.9" stopColor="#ffd078" />
      <stop offset="1" stopColor="#ff8a3d" />
    </linearGradient>
    <linearGradient id="beamTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.96" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
    </linearGradient>
    <radialGradient id="cyanPan" cx="50%" cy="38%" r="65%">
      <stop offset="0" stopColor="#a9fbff" stopOpacity="0.58" />
      <stop offset="0.42" stopColor="#27ddfb" stopOpacity="0.2" />
      <stop offset="1" stopColor="#071a25" stopOpacity="0.12" />
    </radialGradient>
    <radialGradient id="amberPan" cx="50%" cy="38%" r="65%">
      <stop offset="0" stopColor="#ffe3a6" stopOpacity="0.58" />
      <stop offset="0.42" stopColor="#ff8a3d" stopOpacity="0.2" />
      <stop offset="1" stopColor="#25130a" stopOpacity="0.12" />
    </radialGradient>
    <linearGradient id="columnCore" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#27ddfb" stopOpacity="0" />
      <stop offset="0.25" stopColor="#77f4ff" stopOpacity="0.5" />
      <stop offset="0.46" stopColor="#ffffff" stopOpacity="0.96" />
      <stop offset="0.54" stopColor="#ffffff" stopOpacity="1" />
      <stop offset="0.75" stopColor="#77f4ff" stopOpacity="0.5" />
      <stop offset="1" stopColor="#27ddfb" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="glassFin" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#68c8ef" stopOpacity="0" />
      <stop offset="0.5" stopColor="#68c8ef" stopOpacity="0.38" />
      <stop offset="1" stopColor="#68c8ef" stopOpacity="0" />
    </linearGradient>
    <filter id="softGlow" x="-80%" y="-180%" width="260%" height="460%">
      <feGaussianBlur stdDeviation="9" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="tightGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="4.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="wideGlow" x="-160%" y="-80%" width="420%" height="260%">
      <feGaussianBlur stdDeviation="30" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="floorBlur" x="-50%" y="-600%" width="200%" height="1300%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <filter id="shadowBlur" x="-50%" y="-300%" width="200%" height="700%">
      <feGaussianBlur stdDeviation="22" />
    </filter>
    <pattern id="scanLines" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="1" fill="#9adfff" opacity="0.04" />
    </pattern>
  </defs>
);

const Atmosphere: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({frame, fps, durationInFrames}) => (
  <>
    <rect width={WIDTH} height={HEIGHT} fill="url(#backgroundPaint)" />
    <rect width={WIDTH} height={HEIGHT} fill="url(#centerAtmosphere)" />

    <g>
      {GLASS_FINS.map((fin, index) => (
        <g key={index} opacity={fin.opacity}>
          <rect
            x={fin.x}
            y={0}
            width={fin.width}
            height={fin.height}
            fill="url(#glassFin)"
          />
          <line
            x1={fin.x + fin.width * 0.56}
            y1={0}
            x2={fin.x + fin.width * 0.44}
            y2={fin.height}
            stroke="#81dfff"
            strokeOpacity="0.24"
            strokeWidth="1"
          />
        </g>
      ))}
    </g>

    <g>
      {DUST.map((dust) => {
        const x = mod(
          dust.x + (frame / fps) * dust.speed + 120,
          WIDTH + 240,
        ) - 120;
        const shimmer =
          0.7 +
          0.3 *
            Math.sin(
              (frame / durationInFrames) * TAU * dust.cycles + dust.phase,
            );
        return (
          <circle
            key={dust.id}
            cx={x}
            cy={dust.y}
            r={dust.radius}
            fill={dust.warm ? '#ffd4a4' : '#8defff'}
            opacity={dust.opacity * shimmer}
          />
        );
      })}
    </g>

    <rect width={WIDTH} height={HEIGHT} fill="url(#scanLines)" opacity="0.22" />
  </>
);

const EdgeTelemetry: React.FC<{frame: number}> = ({frame}) => {
  const reveal = phase(frame, 27, 50, easeOut);
  const pulse = 0.55 + 0.16 * Math.sin(frame * 0.025);
  const marks = [
    {x: 78, y: 84, sx: 1, sy: 1},
    {x: WIDTH - 78, y: 84, sx: -1, sy: 1},
    {x: 78, y: HEIGHT - 92, sx: 1, sy: -1},
    {x: WIDTH - 78, y: HEIGHT - 92, sx: -1, sy: -1},
  ];
  return (
    <g opacity={reveal * pulse} stroke="#8fd7ed" strokeWidth="2">
      {marks.map((mark, index) => (
        <g
          key={index}
          transform={`translate(${mark.x} ${mark.y}) scale(${mark.sx} ${mark.sy})`}
        >
          <path d="M0 36 V0 H36" fill="none" />
          <line x1="50" y1="0" x2="68" y2="0" strokeOpacity="0.4" />
          <circle cx="0" cy="50" r="2.4" fill="#8fd7ed" stroke="none" />
        </g>
      ))}
    </g>
  );
};

const GroundSystem: React.FC<{frame: number}> = ({frame}) => {
  const reveal = phase(frame, 10, 32, easeOut);
  const gridReveal = phase(frame, 24, 52, easeOut);
  return (
    <g>
      <ellipse
        cx={PIVOT_X}
        cy={FLOOR_Y + 22}
        rx={520}
        ry={52}
        fill="#000000"
        opacity={0.5 * reveal}
        filter="url(#shadowBlur)"
      />

      <g opacity={gridReveal * 0.28} stroke="#6bcbe6" strokeWidth="1.2">
        {[0, 1, 2, 3, 4].map((index) => {
          const y = FLOOR_Y + 36 + index * 45;
          return (
            <line
              key={index}
              x1={110 + index * 95}
              y1={y}
              x2={1810 - index * 95}
              y2={y}
              strokeOpacity={0.16 - index * 0.022}
            />
          );
        })}
        {[0, 1, 2, 3, 4, 5, 6].map((index) => {
          const x = 200 + index * 253;
          return (
            <line
              key={index}
              x1={PIVOT_X + (x - PIVOT_X) * 0.22}
              y1={FLOOR_Y}
              x2={x}
              y2={HEIGHT}
              strokeOpacity="0.11"
            />
          );
        })}
      </g>

      <line
        x1={PIVOT_X}
        y1={FLOOR_Y}
        x2={60}
        y2={FLOOR_Y}
        stroke="#27ddfb"
        strokeWidth="16"
        opacity={reveal * 0.22}
        filter="url(#floorBlur)"
        strokeDasharray="900"
        strokeDashoffset={900 * (1 - reveal)}
      />
      <line
        x1={PIVOT_X}
        y1={FLOOR_Y}
        x2={1860}
        y2={FLOOR_Y}
        stroke="#ff8a3d"
        strokeWidth="16"
        opacity={reveal * 0.22}
        filter="url(#floorBlur)"
        strokeDasharray="900"
        strokeDashoffset={900 * (1 - reveal)}
      />
      <line
        x1={PIVOT_X}
        y1={FLOOR_Y}
        x2={60}
        y2={FLOOR_Y}
        stroke="url(#floorLine)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="900"
        strokeDashoffset={900 * (1 - reveal)}
      />
      <line
        x1={PIVOT_X}
        y1={FLOOR_Y}
        x2={1860}
        y2={FLOOR_Y}
        stroke="url(#floorLine)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="900"
        strokeDashoffset={900 * (1 - reveal)}
      />
      <line
        x1="70"
        y1={FLOOR_Y + 10}
        x2="1850"
        y2={FLOOR_Y + 10}
        stroke="#c6e9f4"
        strokeWidth="1"
        strokeOpacity={0.12 * reveal}
      />
    </g>
  );
};

const Fulcrum: React.FC<{frame: number; activity: number}> = ({
  frame,
  activity,
}) => {
  const reveal = phase(frame, 14, 38, easeOut);
  const shiftY = FLOOR_Y * (1 - reveal);
  const pivotPulse = 1 + activity * 0.08 + 0.015 * Math.sin(frame * 0.04);
  return (
    <g>
      <ellipse
        cx={PIVOT_X}
        cy={FLOOR_Y + 7}
        rx={125}
        ry={18}
        fill="#8bdff8"
        opacity={0.16 * reveal}
        filter="url(#floorBlur)"
      />
      <g transform={`translate(0 ${shiftY}) scale(1 ${reveal})`}>
        <path
          d={`M${PIVOT_X - 66} ${FLOOR_Y} L${PIVOT_X - 30} ${PIVOT_Y + 44} Q${PIVOT_X - 24} ${PIVOT_Y + 5} ${PIVOT_X} ${PIVOT_Y - 2} Q${PIVOT_X + 24} ${PIVOT_Y + 5} ${PIVOT_X + 30} ${PIVOT_Y + 44} L${PIVOT_X + 66} ${FLOOR_Y} Z`}
          fill="url(#pedestalMetal)"
          stroke="#d8e8f2"
          strokeOpacity="0.48"
          strokeWidth="2"
        />
        <path
          d={`M${PIVOT_X - 38} ${FLOOR_Y - 8} L${PIVOT_X - 12} ${PIVOT_Y + 62} Q${PIVOT_X} ${PIVOT_Y + 32} ${PIVOT_X + 12} ${PIVOT_Y + 62} L${PIVOT_X + 38} ${FLOOR_Y - 8} Z`}
          fill="url(#pedestalCore)"
          opacity="0.42"
        />
        <path
          d={`M${PIVOT_X - 66} ${FLOOR_Y} L${PIVOT_X - 30} ${PIVOT_Y + 44} L${PIVOT_X - 12} ${PIVOT_Y + 62} L${PIVOT_X - 38} ${FLOOR_Y - 8} Z`}
          fill="#172737"
          opacity="0.52"
        />
        <line
          x1={PIVOT_X}
          y1={PIVOT_Y + 52}
          x2={PIVOT_X}
          y2={FLOOR_Y - 22}
          stroke="#8bf3ff"
          strokeWidth="3"
          opacity="0.38"
        />
      </g>

      <g
        transform={`translate(${PIVOT_X} ${PIVOT_Y}) scale(${reveal * pivotPulse}) translate(${-PIVOT_X} ${-PIVOT_Y})`}
        opacity={reveal}
      >
        <circle
          cx={PIVOT_X}
          cy={PIVOT_Y}
          r="45"
          fill="#c8f8ff"
          opacity="0.2"
          filter="url(#softGlow)"
        />
        <circle
          cx={PIVOT_X}
          cy={PIVOT_Y}
          r="33"
          fill="#142532"
          stroke="#d9eef7"
          strokeWidth="5"
        />
        <circle
          cx={PIVOT_X}
          cy={PIVOT_Y}
          r="20"
          fill="#effcff"
          stroke="#7edff4"
          strokeWidth="3"
        />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r="7" fill="#ffffff" />
        <g
          transform={`rotate(${frame * 0.16} ${PIVOT_X} ${PIVOT_Y})`}
          stroke="#9eeeff"
          strokeWidth="2"
          opacity="0.7"
        >
          {[0, 90, 180, 270].map((rotation) => (
            <line
              key={rotation}
              x1={PIVOT_X}
              y1={PIVOT_Y - 42}
              x2={PIVOT_X}
              y2={PIVOT_Y - 53}
              transform={`rotate(${rotation} ${PIVOT_X} ${PIVOT_Y})`}
            />
          ))}
        </g>
      </g>
    </g>
  );
};

const BalanceBeam: React.FC<{frame: number; angle: number}> = ({
  frame,
  angle,
}) => {
  const reveal = phase(frame, 30, 50, easeOut);
  const beamWidth = BEAM_HALF * 2 * reveal;
  const beamX = PIVOT_X - beamWidth / 2;
  return (
    <g transform={`rotate(${angle} ${PIVOT_X} ${PIVOT_Y})`} opacity={reveal}>
      <rect
        x={beamX}
        y={PIVOT_Y - 18}
        width={beamWidth}
        height="36"
        rx="18"
        fill="url(#beamMetal)"
        opacity="0.38"
        filter="url(#softGlow)"
      />
      <rect
        x={beamX}
        y={PIVOT_Y - 17}
        width={beamWidth}
        height="34"
        rx="17"
        fill="#1c2a36"
        stroke="url(#beamMetal)"
        strokeWidth="5"
      />
      <rect
        x={beamX + 8}
        y={PIVOT_Y - 10}
        width={Math.max(0, beamWidth - 16)}
        height="10"
        rx="5"
        fill="url(#beamTop)"
        opacity="0.9"
      />
      <rect
        x={beamX + 14}
        y={PIVOT_Y + 4}
        width={Math.max(0, beamWidth - 28)}
        height="5"
        rx="2.5"
        fill="url(#beamMetal)"
        opacity="0.42"
      />
      {reveal > 0.92 ? (
        <>
          <circle
            cx={PIVOT_X - BEAM_HALF}
            cy={PIVOT_Y}
            r="17"
            fill="#27ddfb"
            opacity="0.52"
            filter="url(#softGlow)"
          />
          <circle
            cx={PIVOT_X - BEAM_HALF}
            cy={PIVOT_Y}
            r="10"
            fill="#a4fbff"
          />
          <circle
            cx={PIVOT_X + BEAM_HALF}
            cy={PIVOT_Y}
            r="17"
            fill="#ff8a3d"
            opacity="0.52"
            filter="url(#softGlow)"
          />
          <circle
            cx={PIVOT_X + BEAM_HALF}
            cy={PIVOT_Y}
            r="10"
            fill="#ffd078"
          />
        </>
      ) : null}
    </g>
  );
};

const Pan: React.FC<{
  frame: number;
  side: Side;
  anchor: Point;
  center: Point;
}> = ({frame, side, anchor, center}) => {
  const reveal = phase(frame, 49, 74, easeOut);
  const energy = impactEnergy(frame, side);
  const recentAge = latestImpactAge(frame, side);
  const color = COLOR[side];
  const highlight = HIGHLIGHT[side];
  const gradient = side === 'cyan' ? 'url(#cyanPan)' : 'url(#amberPan)';
  const sideSign = side === 'cyan' ? -1 : 1;
  const sway = Math.sin(frame * 0.025 + sideSign * 1.7) * energy * 3;
  const panScale = mix(0.84, 1, reveal);

  const rippleProgress = Number.isFinite(recentAge)
    ? clamp(recentAge / 24)
    : 1;
  const rippleOpacity = Number.isFinite(recentAge)
    ? (1 - rippleProgress) * 0.62
    : 0;

  return (
    <g opacity={reveal}>
      <g
        stroke={color}
        strokeLinecap="round"
        fill="none"
        opacity={0.66 + energy * 0.2}
      >
        <path
          d={`M${anchor.x} ${anchor.y + 4} L${center.x - 112 + sway} ${center.y - 15}`}
          strokeWidth="3"
          filter="url(#tightGlow)"
        />
        <path
          d={`M${anchor.x} ${anchor.y + 4} L${center.x + 112 + sway} ${center.y - 15}`}
          strokeWidth="3"
          filter="url(#tightGlow)"
        />
        <path
          d={`M${anchor.x} ${anchor.y + 5} L${center.x + sway * 0.25} ${center.y - 6}`}
          strokeWidth="1.4"
          strokeDasharray="6 10"
          strokeOpacity="0.46"
        />
      </g>

      <g
        transform={`translate(${center.x} ${center.y}) scale(${panScale}) translate(${-center.x} ${-center.y})`}
      >
        <ellipse
          cx={center.x}
          cy={center.y + 18}
          rx={186 + energy * 8}
          ry={48 + energy * 4}
          fill={color}
          opacity={0.17 + energy * 0.08}
          filter="url(#wideGlow)"
        />
        <path
          d={`M${center.x - 166} ${center.y} Q${center.x - 138} ${center.y + 72} ${center.x} ${center.y + 82} Q${center.x + 138} ${center.y + 72} ${center.x + 166} ${center.y} Q${center.x} ${center.y + 44} ${center.x - 166} ${center.y} Z`}
          fill={gradient}
          stroke={color}
          strokeOpacity="0.6"
          strokeWidth="2"
        />
        <ellipse
          cx={center.x}
          cy={center.y}
          rx="166"
          ry="40"
          fill="#06121b"
          fillOpacity="0.76"
          stroke={highlight}
          strokeWidth={4 + energy * 2}
          filter="url(#tightGlow)"
        />
        <ellipse
          cx={center.x}
          cy={center.y}
          rx="148"
          ry="31"
          fill={gradient}
          opacity={0.75 + energy * 0.2}
        />
        {[116, 86, 55].map((radius, index) => (
          <ellipse
            key={radius}
            cx={center.x}
            cy={center.y}
            rx={radius}
            ry={radius * 0.19}
            fill="none"
            stroke={highlight}
            strokeWidth={index === 2 ? 2.4 : 1.4}
            strokeDasharray={index === 1 ? '18 12' : undefined}
            opacity={0.18 + energy * (0.19 - index * 0.035)}
          />
        ))}
        <ellipse
          cx={center.x - 30}
          cy={center.y - 9}
          rx="78"
          ry="12"
          fill="#ffffff"
          opacity={0.06 + energy * 0.09}
        />
        <ellipse
          cx={center.x}
          cy={center.y + 4}
          rx={68 + rippleProgress * 102}
          ry={13 + rippleProgress * 25}
          fill="none"
          stroke={highlight}
          strokeWidth={5 - rippleProgress * 3}
          opacity={rippleOpacity}
        />
      </g>
    </g>
  );
};

const CounterNode: React.FC<{
  frame: number;
  side: Side;
  count: number;
}> = ({frame, side, count}) => {
  const reveal = phase(frame, 53, 75, easeOut);
  const color = COLOR[side];
  const highlight = HIGHLIGHT[side];
  const x = EMITTER_X[side];
  const y = 128;
  const energy = impactEnergy(frame, side);
  const scale = mix(0.72, 1, reveal) * (1 + energy * 0.035);
  const direction = side === 'cyan' ? 1 : -1;
  const active = BATCHES.some(
    (batch) =>
      batch.side === side &&
      frame >= batch.firstImpact - 24 &&
      frame <= batch.lastImpact + 4,
  );

  return (
    <g
      opacity={reveal}
      transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}
    >
      <circle
        cx={x}
        cy={y}
        r={65 + energy * 5}
        fill={color}
        opacity={0.16 + energy * 0.08}
        filter="url(#wideGlow)"
      />
      <circle
        cx={x}
        cy={y}
        r="54"
        fill="#07121c"
        fillOpacity="0.88"
        stroke="#dcebf3"
        strokeWidth="4"
      />
      <circle
        cx={x}
        cy={y}
        r="43"
        fill="none"
        stroke={color}
        strokeWidth={active ? 6 : 4}
        opacity={0.72 + energy * 0.2}
        filter="url(#tightGlow)"
      />
      <circle
        cx={x}
        cy={y}
        r="25"
        fill={color}
        opacity={0.86 + energy * 0.14}
      />
      <circle cx={x - 8} cy={y - 9} r="8" fill="#ffffff" opacity="0.44" />
      <g transform={`rotate(${frame * 0.17 * direction} ${x} ${y})`}>
        <circle
          cx={x}
          cy={y}
          r="65"
          fill="none"
          stroke={highlight}
          strokeWidth="2"
          strokeDasharray="32 22 8 18"
          opacity="0.66"
        />
      </g>
      <path
        d={`M${x - 12} ${y + 73} L${x} ${y + 86} L${x + 12} ${y + 73}`}
        fill="none"
        stroke={highlight}
        strokeWidth="3"
        opacity={active ? 0.9 : 0.42}
      />
      <text
        x={x}
        y={y + 132}
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        fontSize="58"
        fontWeight="700"
        letterSpacing="-2"
        fill={color}
        opacity="0.42"
        filter="url(#softGlow)"
      >
        {String(count).padStart(2, '0')}
      </text>
      <text
        x={x}
        y={y + 132}
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        fontSize="58"
        fontWeight="700"
        letterSpacing="-2"
        fill={highlight}
      >
        {String(count).padStart(2, '0')}
      </text>
      <line
        x1={x - 30}
        y1={y + 150}
        x2={x + 30}
        y2={y + 150}
        stroke={color}
        strokeWidth="3"
        opacity={0.28 + energy * 0.34}
      />
    </g>
  );
};

const DataToken: React.FC<{
  frame: number;
  token: Token;
  target: Point;
}> = ({frame, token, target}) => {
  const start = token.impact - token.travel;
  const age = frame - start;
  if (age < 0 || age > token.travel + 10) return null;

  const raw = clamp(age / token.travel);
  const fall = Easing.in(Easing.quad)(raw);
  const side = token.side;
  const startX = EMITTER_X[side];
  const startY = 286;
  const targetY = target.y - 25;
  const lateral =
    Math.sin(token.seed * TAU + raw * Math.PI * 1.4) *
    (8 + token.seed * 7) *
    (1 - raw);
  const x = mix(startX, target.x, fall) + lateral;
  const y = mix(startY, targetY, fall);
  const afterImpact = Math.max(0, age - token.travel);
  const opacity =
    phase(age, 0, 4, easeOut) * (1 - clamp(afterImpact / 10));
  const color = COLOR[side];
  const highlight = HIGHLIGHT[side];
  const size = token.finale ? 9 + token.seed * 4 : 12 + token.seed * 7;

  return (
    <g opacity={opacity} filter="url(#tightGlow)">
      {[1, 2, 3].map((trailIndex) => {
        const trailRaw = clamp(raw - trailIndex * 0.075);
        const trailFall = Easing.in(Easing.quad)(trailRaw);
        const trailX =
          mix(startX, target.x, trailFall) +
          Math.sin(token.seed * TAU + trailRaw * Math.PI * 1.4) *
            (8 + token.seed * 7) *
            (1 - trailRaw);
        const trailY = mix(startY, targetY, trailFall);
        return (
          <circle
            key={trailIndex}
            cx={trailX}
            cy={trailY}
            r={Math.max(1.6, size * (0.22 - trailIndex * 0.035))}
            fill={trailIndex === 1 ? highlight : color}
            opacity={0.48 - trailIndex * 0.1}
          />
        );
      })}
      <g transform={`translate(${x} ${y}) rotate(${45 + token.seed * 34})`}>
        <rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          rx={size * 0.18}
          fill="#07131d"
          stroke={highlight}
          strokeWidth={token.finale ? 2 : 2.6}
        />
        <rect
          x={-size * 0.23}
          y={-size * 0.23}
          width={size * 0.46}
          height={size * 0.46}
          rx={size * 0.12}
          fill={color}
        />
      </g>
    </g>
  );
};

const ThresholdEffects: React.FC<{
  frame: number;
  leftPan: Point;
}> = ({frame, leftPan}) => {
  const rise = phase(frame, 574, 590, easeOut);
  const columnOpacity = phase(frame, 572, 587, easeOut);
  const yTop = mix(leftPan.y, -50, rise);
  const basePulse = 0.9 + 0.08 * Math.sin((frame - 588) * 0.075);
  const floorPulse = phase(frame, 566, 578, easeOut) * (1 - phase(frame, 610, 648));
  const terminalRing = frame >= 588 ? 0.12 + 0.05 * Math.sin(frame * 0.045) : 0;

  return (
    <g pointerEvents="none">
      <g opacity={columnOpacity}>
        <rect
          x={leftPan.x - 92}
          y={yTop}
          width="184"
          height={Math.max(0, leftPan.y - yTop + 20)}
          fill="#27ddfb"
          opacity={0.22 * basePulse}
          filter="url(#wideGlow)"
        />
        <rect
          x={leftPan.x - 55}
          y={yTop}
          width="110"
          height={Math.max(0, leftPan.y - yTop + 20)}
          fill="url(#columnCore)"
          opacity={0.86 * basePulse}
        />
        <rect
          x={leftPan.x - 10}
          y={yTop}
          width="20"
          height={Math.max(0, leftPan.y - yTop + 20)}
          rx="10"
          fill="#ffffff"
          opacity={0.94 * basePulse}
          filter="url(#tightGlow)"
        />
        <line
          x1={leftPan.x}
          y1={yTop}
          x2={leftPan.x}
          y2={leftPan.y + 28}
          stroke="#ffffff"
          strokeWidth="4"
          opacity="0.92"
        />
      </g>

      {[0, 1, 2, 3].map((index) => {
        const rippleStart = 568 + index * 5;
        const ripple = phase(frame, rippleStart, 610 + index * 8, easeOut);
        const opacity =
          (frame >= rippleStart ? 1 : 0) *
          (1 - ripple) *
          (0.68 - index * 0.09);
        return (
          <ellipse
            key={index}
            cx={leftPan.x}
            cy={FLOOR_Y + 4}
            rx={90 + ripple * (470 + index * 70)}
            ry={18 + ripple * (100 + index * 10)}
            fill="none"
            stroke={index % 2 === 0 ? '#a4fbff' : '#27ddfb'}
            strokeWidth={6 - index * 0.8}
            opacity={opacity}
            filter={index < 2 ? 'url(#tightGlow)' : undefined}
          />
        );
      })}

      <ellipse
        cx={leftPan.x}
        cy={FLOOR_Y + 2}
        rx={170 + terminalRing * 90}
        ry={34 + terminalRing * 18}
        fill="none"
        stroke="#79efff"
        strokeWidth="3"
        opacity={terminalRing}
      />
      <ellipse
        cx={leftPan.x}
        cy={FLOOR_Y}
        rx={195 + floorPulse * 150}
        ry={45 + floorPulse * 42}
        fill="#b9fbff"
        opacity={floorPulse * 0.2}
        filter="url(#wideGlow)"
      />
    </g>
  );
};

const OpticalFinish: React.FC<{frame: number; leftPan: Point}> = ({
  frame,
  leftPan,
}) => {
  const flash = interpolate(frame, [566, 570, 579, 592], [0, 0.58, 0.2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  const localFlash = interpolate(
    frame,
    [563, 569, 582, 602],
    [0, 0.9, 0.34, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeOut,
    },
  );
  return (
    <>
      <ellipse
        cx={leftPan.x}
        cy={leftPan.y}
        rx={120 + localFlash * 330}
        ry={55 + localFlash * 170}
        fill="#eaffff"
        opacity={localFlash * 0.42}
        filter="url(#wideGlow)"
      />
      <rect width={WIDTH} height={HEIGHT} fill="#effcff" opacity={flash} />
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const angle = angleAt(frame);
  const cyanState = panState(frame, 'cyan', angle);
  const amberState = panState(frame, 'amber', angle);
  const cyanCount = countAt(frame, 'cyan');
  const amberCount = countAt(frame, 'amber');
  const totalActivity = Math.max(
    impactEnergy(frame, 'cyan'),
    impactEnergy(frame, 'amber'),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#020711',
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        style={{display: 'block'}}
      >
        <SvgDefs />
        <Atmosphere
          frame={frame}
          fps={fps}
          durationInFrames={durationInFrames}
        />
        <EdgeTelemetry frame={frame} />
        <GroundSystem frame={frame} />

        <ThresholdEffects frame={frame} leftPan={cyanState.center} />

        <Fulcrum frame={frame} activity={totalActivity} />
        <BalanceBeam frame={frame} angle={angle} />

        <Pan
          frame={frame}
          side="cyan"
          anchor={cyanState.anchor}
          center={cyanState.center}
        />
        <Pan
          frame={frame}
          side="amber"
          anchor={amberState.anchor}
          center={amberState.center}
        />

        <CounterNode frame={frame} side="cyan" count={cyanCount} />
        <CounterNode frame={frame} side="amber" count={amberCount} />

        <g>
          {TOKENS.map((token) => (
            <DataToken
              key={token.id}
              frame={frame}
              token={token}
              target={
                token.side === 'cyan'
                  ? cyanState.center
                  : amberState.center
              }
            />
          ))}
        </g>

        <OpticalFinish frame={frame} leftPan={cyanState.center} />
      </svg>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 43%, transparent 33%, rgba(0,4,11,0.16) 68%, rgba(0,2,8,0.72) 100%)',
          boxShadow:
            'inset 0 0 150px rgba(0,0,0,0.56), inset 0 -90px 120px rgba(0,0,0,0.38)',
        }}
      />
    </AbsoluteFill>
  );
};
