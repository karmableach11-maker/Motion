import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const FPS = 60;
const BUILD_START = Math.round(0.78 * FPS);
const BUILD_END = Math.round(4.6 * FPS);
const BASELINE_START = Math.round(0.2 * FPS);
const BASELINE_END = Math.round(2.0 * FPS);

const PALETTE = {
  background: '#060A08',
  backgroundDeep: '#020403',
  forest: '#071810',
  grid: 'rgba(78, 139, 106, 0.13)',
  gridMajor: 'rgba(118, 169, 139, 0.10)',
  emerald: '#22E6A2',
  emeraldBright: '#8CFFD3',
  emeraldDeep: '#087C59',
  gold: '#FFD166',
  goldBright: '#FFF3C4',
  goldDeep: '#E49B2F',
};

const CHART = {
  baselineX: 225,
  baselineY: 944,
  baselineWidth: 1465,
  barX: 274,
  barWidth: 84,
  barGap: 33,
};

const BAR_HEIGHTS = [84, 102, 124, 153, 193, 241, 291, 344, 407, 475, 552, 652] as const;
const BAR_START_SECONDS = [
  0.78,
  1.04,
  1.3,
  1.57,
  1.84,
  2.12,
  2.4,
  2.68,
  2.96,
  3.24,
  3.52,
  3.8,
] as const;

type Point = {x: number; y: number};
type CubicSegment = readonly [Point, Point, Point, Point];

const ARROW_SEGMENT = [
  {x: 263, y: 918},
  {x: 673, y: 936},
  {x: 1260, y: 720},
  {x: 1725, y: 165},
] as const;
const ARROW_PATH =
  `M ${ARROW_SEGMENT[0].x} ${ARROW_SEGMENT[0].y} ` +
  `C ${ARROW_SEGMENT[1].x} ${ARROW_SEGMENT[1].y} ` +
  `${ARROW_SEGMENT[2].x} ${ARROW_SEGMENT[2].y} ` +
  `${ARROW_SEGMENT[3].x} ${ARROW_SEGMENT[3].y}`;

const cubicPoint = (
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point => {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
  };
};

const cubicTangent = (
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point => {
  const u = 1 - t;
  return {
    x:
      3 * u * u * (p1.x - p0.x) +
      6 * u * t * (p2.x - p1.x) +
      3 * t * t * (p3.x - p2.x),
    y:
      3 * u * u * (p1.y - p0.y) +
      6 * u * t * (p2.y - p1.y) +
      3 * t * t * (p3.y - p2.y),
  };
};

type ArcSample = {t: number; length: number};

const buildArcTable = (segment: CubicSegment): readonly ArcSample[] => {
  const samples: ArcSample[] = [{t: 0, length: 0}];
  let previous = segment[0];
  let total = 0;
  const divisions = 180;

  for (let index = 1; index <= divisions; index++) {
    const t = index / divisions;
    const point = cubicPoint(
      t,
      segment[0],
      segment[1],
      segment[2],
      segment[3],
    );
    total += Math.hypot(point.x - previous.x, point.y - previous.y);
    samples.push({t, length: total});
    previous = point;
  }

  return samples;
};

const tAtArcFraction = (
  table: readonly ArcSample[],
  fraction: number,
) => {
  const last = table[table.length - 1];
  const target = Math.max(0, Math.min(1, fraction)) * last.length;
  let low = 0;
  let high = table.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (table[middle].length < target) low = middle + 1;
    else high = middle;
  }

  const after = table[low];
  const before = table[Math.max(0, low - 1)];
  const span = Math.max(0.000001, after.length - before.length);
  const mix = (target - before.length) / span;
  return before.t + (after.t - before.t) * mix;
};

const ARROW_ARC = buildArcTable(ARROW_SEGMENT);

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      overflow: 'hidden',
      backgroundColor: PALETTE.background,
      backgroundImage: [
        'radial-gradient(ellipse 72% 85% at 91% 4%, rgba(27, 116, 78, 0.35) 0%, rgba(8, 35, 23, 0.17) 42%, transparent 76%)',
        'radial-gradient(ellipse 56% 44% at 61% 77%, rgba(196, 135, 43, 0.055) 0%, transparent 72%)',
        `linear-gradient(128deg, ${PALETTE.backgroundDeep} 0%, ${PALETTE.background} 45%, ${PALETTE.forest} 100%)`,
      ].join(','),
    }}
  >
    <AbsoluteFill
      style={{
        opacity: 0.92,
        backgroundImage: [
          `repeating-linear-gradient(0deg, transparent 0px, transparent 69px, ${PALETTE.grid} 70px, transparent 71px)`,
          `repeating-linear-gradient(90deg, transparent 0px, transparent 79px, ${PALETTE.grid} 80px, transparent 81px)`,
          `repeating-linear-gradient(0deg, transparent 0px, transparent 279px, ${PALETTE.gridMajor} 280px, transparent 282px)`,
          `repeating-linear-gradient(90deg, transparent 0px, transparent 319px, ${PALETTE.gridMajor} 320px, transparent 322px)`,
        ].join(','),
        maskImage:
          'radial-gradient(ellipse 92% 90% at 57% 48%, #000 12%, rgba(0,0,0,0.78) 62%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 92% 90% at 57% 48%, #000 12%, rgba(0,0,0,0.78) 62%, transparent 100%)',
      }}
    />

    <AbsoluteFill
      style={{
        backgroundImage: [
          'linear-gradient(90deg, rgba(0,0,0,0.58) 0%, transparent 28%, transparent 82%, rgba(0,0,0,0.12) 100%)',
          'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 54%, rgba(0,0,0,0.38) 100%)',
          'radial-gradient(ellipse 82% 72% at 50% 52%, transparent 44%, rgba(0,0,0,0.48) 100%)',
        ].join(','),
      }}
    />
  </AbsoluteFill>
);

const Baseline: React.FC<{frame: number}> = ({frame}) => {
  const widthProgress = interpolate(
    frame,
    [BASELINE_START, 42, 80, BASELINE_END],
    [0, 0.265, 0.744, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: CHART.baselineX,
        top: CHART.baselineY - 3,
        width: CHART.baselineWidth * widthProgress,
        height: 6,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${PALETTE.emeraldDeep} 0%, ${PALETTE.emeraldBright} 10%, ${PALETTE.emerald} 78%, ${PALETTE.gold} 100%)`,
        boxShadow:
          '0 0 5px rgba(110,255,205,0.96), 0 0 18px rgba(34,230,162,0.58), 0 0 42px rgba(34,230,162,0.22)',
        opacity: widthProgress > 0 ? 1 : 0,
      }}
    />
  );
};

const Bar: React.FC<{
  frame: number;
  index: number;
  finalHeight: number;
}> = ({frame, index, finalHeight}) => {
  const start = Math.round(BAR_START_SECONDS[index] * FPS);
  const end = start + Math.round(0.8 * FPS);
  const growth = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const currentHeight = finalHeight * growth;
  const active = growth > 0.015 && growth < 0.995;
  const frontierOpacity = active
    ? Math.sin(Math.min(1, Math.max(0, growth)) * Math.PI)
    : 0;
  const hueShift = index / (BAR_HEIGHTS.length - 1);

  if (growth <= 0.001) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: CHART.barX + index * (CHART.barWidth + CHART.barGap),
        top: CHART.baselineY - currentHeight,
        width: CHART.barWidth,
        height: currentHeight,
        border: `5px solid rgba(${Math.round(55 + hueShift * 35)}, ${Math.round(
          222 + hueShift * 17,
        )}, ${Math.round(164 - hueShift * 38)}, 0.96)`,
        borderBottom: 0,
        borderRadius: '5px 5px 0 0',
        boxSizing: 'border-box',
        overflow: 'visible',
        background: [
          'linear-gradient(180deg, rgba(255,209,102,0.12) 0%, rgba(34,230,162,0.10) 42%, rgba(5,98,69,0.24) 100%)',
          'linear-gradient(90deg, rgba(255,255,255,0.055) 0%, transparent 42%, rgba(255,209,102,0.035) 100%)',
        ].join(','),
        boxShadow:
          'inset 0 0 22px rgba(34,230,162,0.10), 0 0 11px rgba(34,230,162,0.16)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -9,
          right: -9,
          top: -7,
          height: 10,
          borderRadius: 999,
          opacity: frontierOpacity,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,243,196,0.92) 50%, transparent 100%)',
          filter: 'blur(2px)',
          boxShadow: '0 0 18px rgba(255,209,102,0.44)',
        }}
      />
    </div>
  );
};

const BarSeries: React.FC<{frame: number}> = ({frame}) => (
  <>
    {BAR_HEIGHTS.map((height, index) => (
      <Bar key={index} frame={frame} index={index} finalHeight={height} />
    ))}
  </>
);

const GrowthArrow: React.FC<{
  frame: number;
  progress: number;
}> = ({frame, progress}) => {
  const localT = tAtArcFraction(ARROW_ARC, progress);
  const tip = cubicPoint(
    localT,
    ARROW_SEGMENT[0],
    ARROW_SEGMENT[1],
    ARROW_SEGMENT[2],
    ARROW_SEGMENT[3],
  );
  const tangent = cubicTangent(
    Math.max(0.001, localT),
    ARROW_SEGMENT[0],
    ARROW_SEGMENT[1],
    ARROW_SEGMENT[2],
    ARROW_SEGMENT[3],
  );
  const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;
  const tangentLength = Math.max(0.0001, Math.hypot(tangent.x, tangent.y));
  const direction = {x: tangent.x / tangentLength, y: tangent.y / tangentLength};
  const normal = {x: -direction.y, y: direction.x};
  const shaftFrontier = {
    x: tip.x - direction.x * 62,
    y: tip.y - direction.y * 62,
  };
  const frontierClipPoints = [
    {
      x: shaftFrontier.x + normal.x * 2600,
      y: shaftFrontier.y + normal.y * 2600,
    },
    {
      x: shaftFrontier.x - normal.x * 2600,
      y: shaftFrontier.y - normal.y * 2600,
    },
    {
      x: shaftFrontier.x - direction.x * 4200 - normal.x * 2600,
      y: shaftFrontier.y - direction.y * 4200 - normal.y * 2600,
    },
    {
      x: shaftFrontier.x - direction.x * 4200 + normal.x * 2600,
      y: shaftFrontier.y - direction.y * 4200 + normal.y * 2600,
    },
  ]
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
  const movingPulse = frame < BUILD_END ? 0.91 + 0.09 * Math.sin(frame * 0.19) : 1;
  const visible = progress > 0.002;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
    >
      <defs>
        <linearGradient id="arrowGradient" x1="263" y1="918" x2="1725" y2="165" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={PALETTE.emerald} />
          <stop offset="0.46" stopColor={PALETTE.goldDeep} />
          <stop offset="0.78" stopColor={PALETTE.gold} />
          <stop offset="1" stopColor={PALETTE.goldBright} />
        </linearGradient>
        <filter id="arrowBloom" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="wide" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="tight" />
          <feMerge>
            <feMergeNode in="wide" />
            <feMergeNode in="tight" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="tipHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={PALETTE.goldBright} stopOpacity={0.92} />
          <stop offset="0.22" stopColor={PALETTE.gold} stopOpacity={0.42} />
          <stop offset="1" stopColor={PALETTE.gold} stopOpacity={0} />
        </radialGradient>
        <clipPath id="arrowFrontierClip" clipPathUnits="userSpaceOnUse">
          <polygon points={frontierClipPoints} />
        </clipPath>
      </defs>

      <g clipPath="url(#arrowFrontierClip)">
        <path
          d={ARROW_PATH}
          pathLength={1}
          fill="none"
          stroke={PALETTE.gold}
          strokeWidth={64}
          strokeLinecap="butt"
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          opacity={0.12}
          filter="url(#arrowBloom)"
        />
        <path
          d={ARROW_PATH}
          pathLength={1}
          fill="none"
          stroke="url(#arrowGradient)"
          strokeWidth={29}
          strokeLinecap="butt"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          filter="url(#arrowBloom)"
        />
        <path
          d={ARROW_PATH}
          pathLength={1}
          fill="none"
          stroke="rgba(255,255,255,0.38)"
          strokeWidth={6}
          strokeLinecap="butt"
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
        />
      </g>

      {visible ? (
        <g transform={`translate(${tip.x} ${tip.y}) rotate(${angle})`}>
          <circle
            cx={-56}
            cy={0}
            r={46 * movingPulse}
            fill="url(#tipHalo)"
            opacity={0.64}
          />
          <polygon
            points="0,0 -92,-44 -68,0 -92,44"
            fill="url(#arrowGradient)"
          />
          <path
            d="M -8 0 L -78 -34 L -61 -3 Z"
            fill="rgba(255,255,255,0.24)"
          />
        </g>
      ) : null}
    </svg>
  );
};

const ChartGlow: React.FC<{frame: number}> = ({frame}) => {
  const opacity = interpolate(frame, [BUILD_START, BUILD_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 185,
        top: 720,
        width: 1540,
        height: 300,
        opacity: opacity * 0.52,
        background:
          'radial-gradient(ellipse at 51% 74%, rgba(34,230,162,0.16) 0%, rgba(255,209,102,0.055) 42%, transparent 74%)',
        filter: 'blur(18px)',
      }}
    />
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const arrowProgress = interpolate(frame, [BUILD_START, BUILD_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.background}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1920,
          height: 1080,
          transform: `translate(-50%, -50%) scale(${Math.min(width / 1920, height / 1080)})`,
          transformOrigin: '50% 50%',
          overflow: 'hidden',
        }}
      >
        <Background />
        <ChartGlow frame={frame} />
        <Baseline frame={frame} />
        <BarSeries frame={frame} />
        <GrowthArrow frame={frame} progress={arrowProgress} />
      </div>
    </AbsoluteFill>
  );
};
