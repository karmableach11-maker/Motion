import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const SCENE_SIGNATURE = 'GOLDEN_RADIAL_DATA_TUNNEL_350775393_V1';

const WIDTH = 1920;
const HEIGHT = 1080;
const CENTER_X = WIDTH * 0.49963;
const CENTER_Y = HEIGHT * 0.49941;
const TAU = Math.PI * 2;

const RAIL_COLORS = ['#fff0ae', '#ffda68', '#ffc245', '#f5a02d', '#cf6820'] as const;
const PACKET_COLORS = ['#fff4bd', '#ffe07a', '#ffc64d', '#ff9b32', '#dd6524'] as const;
const RAIL_GROUP_COLORS = [0, 1, 0, 2, 1, 0, 2, 1, 0, 3, 1, 2] as const;

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const fract = (value: number) => value - Math.floor(value);

const random01 = (seed: number) =>
  fract(Math.sin(seed * 12.9898 + 78.233) * 43758.5453123);

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const rayLength = (angle: number, overscan = 180) => {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const distances: number[] = [];

  if (dx > 0.00001) distances.push((WIDTH - CENTER_X + overscan) / dx);
  if (dx < -0.00001) distances.push((-CENTER_X - overscan) / dx);
  if (dy > 0.00001) distances.push((HEIGHT - CENTER_Y + overscan) / dy);
  if (dy < -0.00001) distances.push((-CENTER_Y - overscan) / dy);

  return Math.min(...distances.filter((distance) => distance > 0));
};

type RailSeed = {
  id: number;
  angle: number;
  cos: number;
  sin: number;
  length: number;
  innerRadius: number;
  group: number;
  brightnessTier: number;
  colorIndex: number;
  opacity: number;
  width: number;
  packetPhase: number;
  packetVariation: number;
  twinklePhase: number;
  twinkleCycles: number;
};

type BokehSeed = {
  id: number;
  angle: number;
  cos: number;
  sin: number;
  length: number;
  phase: number;
  radius: number;
  opacity: number;
  color: string;
  colorIndex: number;
  blurGroup: number;
  twinklePhase: number;
  twinkleCycles: number;
};

type RailStyle = {
  dash: string;
  dashLength: number;
  cycles: number;
  width: number;
  opacity: number;
  blur: number;
};

type DepthBand = {
  start: number;
  end: number;
  spacing: number;
  length: number;
  width: number;
  opacity: number;
  blur: number;
};

const RAIL_STYLES: RailStyle[] = [
  {dash: '1 8 3 13 1 18', dashLength: 44, cycles: 2, width: 0.8, opacity: 0.34, blur: 0.6},
  {dash: '2 9 1 8 5 18', dashLength: 43, cycles: 3, width: 1.0, opacity: 0.29, blur: 0.8},
  {dash: '1 6 2 14 2 11', dashLength: 36, cycles: 3, width: 0.7, opacity: 0.31, blur: 0.5},
  {dash: '3 11 1 9 7 21', dashLength: 52, cycles: 3, width: 1.15, opacity: 0.27, blur: 1.0},
  {dash: '1 10 1 14 4 15', dashLength: 45, cycles: 4, width: 0.85, opacity: 0.30, blur: 0.7},
  {dash: '4 12 2 10 8 23', dashLength: 59, cycles: 3, width: 1.3, opacity: 0.25, blur: 1.2},
  {dash: '1 7 3 15 1 12', dashLength: 39, cycles: 5, width: 0.75, opacity: 0.31, blur: 0.6},
  {dash: '2 8 5 19 2 15', dashLength: 51, cycles: 4, width: 1.0, opacity: 0.26, blur: 0.9},
  {dash: '1 12 2 9 6 20', dashLength: 50, cycles: 4, width: 1.2, opacity: 0.23, blur: 1.1},
  {dash: '2 7 1 16 3 13', dashLength: 42, cycles: 5, width: 0.9, opacity: 0.28, blur: 0.75},
  {dash: '1 9 4 22 2 18', dashLength: 56, cycles: 4, width: 1.35, opacity: 0.22, blur: 1.3},
  {dash: '3 10 1 12 5 17', dashLength: 48, cycles: 5, width: 1.05, opacity: 0.25, blur: 0.95},
];

const DEPTH_BANDS: DepthBand[] = [
  {start: 0.045, end: 0.25, spacing: 90, length: 2.7, width: 1.25, opacity: 0.52, blur: 0.45},
  {start: 0.20, end: 0.49, spacing: 120, length: 6.0, width: 1.85, opacity: 0.64, blur: 0.9},
  {start: 0.43, end: 0.75, spacing: 150, length: 13.5, width: 2.7, opacity: 0.74, blur: 1.8},
  {start: 0.68, end: 1.03, spacing: 180, length: 27, width: 4.2, opacity: 0.82, blur: 3.5},
];

const BUNDLE_COUNT = 92;
const STRANDS_PER_BUNDLE = 4;

const RAILS: RailSeed[] = Array.from(
  {length: BUNDLE_COUNT * STRANDS_PER_BUNDLE},
).flatMap((_, id): RailSeed[] => {
  const bundleIndex = Math.floor(id / STRANDS_PER_BUNDLE);
  const strandIndex = id % STRANDS_PER_BUNDLE;
  const strandCount = 2 + Math.floor(random01(bundleIndex * 21.17 + 2.8) * 3);
  if (strandIndex >= strandCount) return [];
  const angularStep = TAU / BUNDLE_COUNT;
  const bundleJitter =
    (random01(bundleIndex * 8.17 + 3.1) - 0.5) * angularStep * 0.82;
  const strandSpread =
    (strandIndex - (STRANDS_PER_BUNDLE - 1) / 2) * angularStep * 0.12;
  const angle =
    angularStep * (bundleIndex + 0.5) +
    bundleJitter +
    strandSpread +
    (random01(id * 17.83 + 4.6) - 0.5) * angularStep * 0.014;
  const group = Math.floor(random01(id * 5.31 + 8.2) * RAIL_STYLES.length);
  const colorSample = Math.pow(random01(id * 9.47 + 1.7), 2.45);
  const bundleEnergy = random01(bundleIndex * 27.71 + 9.4);
  const brightnessTier = bundleEnergy < 0.34 ? 0 : bundleEnergy < 0.76 ? 1 : 2;

  return [{
    id,
    angle,
    cos: Math.cos(angle),
    sin: Math.sin(angle),
    length: rayLength(angle),
    innerRadius: 28 + random01(id * 13.71 + 6.4) * 62,
    group,
    brightnessTier,
    colorIndex: Math.min(RAIL_COLORS.length - 1, Math.floor(colorSample * RAIL_COLORS.length)),
    opacity: 0.28 + Math.pow(bundleEnergy, 0.82) * 0.72,
    width: 0.9 + Math.pow(random01(id * 19.81 + 5.7), 1.7) * 1.1,
    packetPhase: random01(id * 23.47 + 1.4),
    packetVariation: 0.86 + random01(id * 29.21 + 9.3) * 0.28,
    twinklePhase: random01(id * 31.13 + 4.9),
    twinkleCycles: 23 + Math.floor(random01(id * 37.17 + 7.1) * 37),
  }];
});

const RAIL_PATHS = Array.from({length: RAIL_STYLES.length * 3}, (_, bucketIndex) =>
  RAILS.filter(
    (rail) => rail.group * 3 + rail.brightnessTier === bucketIndex,
  )
    .map((rail) => {
      const x1 = CENTER_X + rail.cos * rail.innerRadius;
      const y1 = CENTER_Y + rail.sin * rail.innerRadius;
      const x2 = CENTER_X + rail.cos * rail.length;
      const y2 = CENTER_Y + rail.sin * rail.length;
      return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    })
    .join(''),
);

const BOKEH: BokehSeed[] = Array.from({length: 84}, (_, index) => {
  const id = index + 4000;
  const angle = random01(id * 7.13 + 2.4) * TAU;
  const colorSample = Math.pow(random01(id * 12.79 + 6.2), 1.3);
  const radiusSample = random01(id * 17.91 + 4.7);
  const colorIndex = Math.min(
    PACKET_COLORS.length - 1,
    Math.floor(colorSample * PACKET_COLORS.length),
  );

  return {
    id,
    angle,
    cos: Math.cos(angle),
    sin: Math.sin(angle),
    length: rayLength(angle, 120),
    phase: random01(id * 19.31 + 5.8),
    radius: 3.2 + Math.pow(radiusSample, 2.05) * 19 + (radiusSample > 0.96 ? 15 : 0),
    opacity: 0.34 + random01(id * 23.17 + 1.1) * 0.48,
    color: PACKET_COLORS[colorIndex],
    colorIndex,
    blurGroup: Math.min(2, Math.floor(random01(id * 27.71 + 8.6) * 3)),
    twinklePhase: random01(id * 31.07 + 3.5),
    twinkleCycles: 3 + Math.floor(random01(id * 37.03 + 6.1) * 7),
  };
});

const packetBucketIndex = (band: number, color: number, intensity: number) =>
  band * 15 + color * 3 + intensity;

const fadeAtBandEdges = (radius: number, start: number, end: number) => {
  const span = end - start;
  const enter = smoothstep(start, start + span * 0.09, radius);
  const leave = 1 - smoothstep(end - span * 0.11, end, radius);
  return enter * leave;
};

const RadialRailBed: React.FC<{illumination: number}> = ({
  illumination,
}) => (
  <g style={{mixBlendMode: 'screen'}}>
    {RAIL_PATHS.map((path, bucketIndex) => {
      const styleIndex = Math.floor(bucketIndex / 3);
      const brightnessTier = bucketIndex % 3;
      const tierOpacity = [0.3, 0.72, 1][brightnessTier];
      const style = RAIL_STYLES[styleIndex];
      const color = RAIL_COLORS[RAIL_GROUP_COLORS[styleIndex]];
      const offset = -styleIndex * 7.83;
      return (
        <React.Fragment key={`rail-${bucketIndex}`}>
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={style.width * 11.5}
            strokeLinecap="round"
            strokeDasharray={style.dash}
            strokeDashoffset={offset}
            opacity={style.opacity * 0.18 * tierOpacity * illumination}
          />
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={style.width * 6.2}
            strokeLinecap="round"
            strokeDasharray={style.dash}
            strokeDashoffset={offset}
            opacity={style.opacity * 0.72 * tierOpacity * illumination}
          />
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={style.width * 1.72}
            strokeLinecap="round"
            strokeDasharray={style.dash}
            strokeDashoffset={offset}
            opacity={Math.min(
              0.92,
              style.opacity * 1.92 * tierOpacity * illumination,
            )}
          />
        </React.Fragment>
      );
    })}
  </g>
);

const DepthPacketField: React.FC<{progress: number; illumination: number}> = ({
  progress,
  illumination,
}) => {
  const buckets = Array.from({length: DEPTH_BANDS.length * 15}, () => [] as string[]);

  for (const rail of RAILS) {
    for (let bandIndex = 0; bandIndex < DEPTH_BANDS.length; bandIndex++) {
      const band = DEPTH_BANDS[bandIndex];
      const start = rail.length * band.start;
      const end = rail.length * band.end;
      const spacing = band.spacing * rail.packetVariation;
      const localPhase = fract(
        rail.packetPhase + bandIndex * 0.217 + progress * 4,
      );
      const offset = localPhase * spacing;
      const first = start + offset - spacing;

      for (let radius = first; radius < end + spacing; radius += spacing) {
        if (radius < start || radius > end) continue;

        const edgeFade = fadeAtBandEdges(radius, start, end);
        if (edgeFade <= 0.01) continue;

        const spatialCell = Math.round((radius - start) / spacing);
        const oscillation =
          0.5 +
          0.5 *
            Math.sin(
              TAU *
                (progress * rail.twinkleCycles +
                  rail.twinklePhase +
                  spatialCell * 0.319 +
                  bandIndex * 0.137),
            );
        const twinkle =
          (0.045 + Math.pow(oscillation, 4.2) * 0.955) *
          (0.42 + rail.opacity * 0.58);
        const intensity = Math.min(2, Math.floor(twinkle * 3));
        const colorChoice = random01(
          rail.id * 53.17 + spatialCell * 11.9 + bandIndex * 5.3,
        );
        const colorIndex =
          colorChoice < 0.76
            ? Math.min(2, rail.colorIndex)
            : colorChoice < 0.94
              ? 3
              : 4;
        const segmentLength =
          band.length *
          rail.packetVariation *
          (0.78 + twinkle * 0.46) *
          (0.88 + random01(rail.id * 41.17 + spatialCell * 7.3 + bandIndex) * 0.24);
        const x1 = CENTER_X + rail.cos * radius;
        const y1 = CENTER_Y + rail.sin * radius;
        const x2 = CENTER_X + rail.cos * (radius + segmentLength);
        const y2 = CENTER_Y + rail.sin * (radius + segmentLength);
        const path = `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;

        buckets[packetBucketIndex(bandIndex, colorIndex, intensity)].push(path);
      }
    }
  }

  return (
    <g style={{mixBlendMode: 'screen'}}>
      {buckets.map((segments, bucketIndex) => {
        if (segments.length === 0) return null;
        const bandIndex = Math.floor(bucketIndex / 15);
        const remainder = bucketIndex % 15;
        const colorIndex = Math.floor(remainder / 3);
        const intensity = remainder % 3;
        const band = DEPTH_BANDS[bandIndex];
        const intensityOpacity = [0.38, 0.68, 1][intensity];
        const path = segments.join('');

        return (
          <React.Fragment key={`packet-${bucketIndex}`}>
            <path
              d={path}
              fill="none"
              stroke={PACKET_COLORS[colorIndex]}
              strokeWidth={band.width * 11.2}
              strokeLinecap="round"
              opacity={band.opacity * intensityOpacity * illumination * 0.095}
            />
            <path
              d={path}
              fill="none"
              stroke={PACKET_COLORS[colorIndex]}
              strokeWidth={band.width * 5.6}
              strokeLinecap="round"
              opacity={band.opacity * intensityOpacity * illumination * 0.42}
            />
            <path
              d={path}
              fill="none"
              stroke={PACKET_COLORS[colorIndex]}
              strokeWidth={band.width * 1.22}
              strokeLinecap="round"
              opacity={band.opacity * intensityOpacity * illumination}
            />
          </React.Fragment>
        );
      })}
    </g>
  );
};

const PeripheralBokeh: React.FC<{progress: number; illumination: number}> = ({
  progress,
  illumination,
}) => (
  <g style={{mixBlendMode: 'screen'}}>
    {BOKEH.map((seed) => {
          const depth = fract(seed.phase + progress);
          const radialFraction = 0.72 + depth * 0.17;
          const radius = seed.length * radialFraction;
          const edgeFade =
            smoothstep(0.72, 0.75, radialFraction) *
            (1 - smoothstep(0.85, 0.89, radialFraction));
          const twinkle =
            0.58 +
            0.42 *
              Math.pow(
                0.5 +
                  0.5 *
                    Math.sin(
                      TAU * (progress * seed.twinkleCycles + seed.twinklePhase),
                    ),
                2,
              );
          const scale = 0.72 + depth * 0.75;
          const x = CENTER_X + seed.cos * radius;
          const y = CENTER_Y + seed.sin * radius;

          const renderedRadius = seed.radius * scale * (1 + seed.blurGroup * 0.12);
          const rotation = (seed.angle * 180) / Math.PI;

          return (
            <React.Fragment key={seed.id}>
              <ellipse
                cx={x}
                cy={y}
                rx={renderedRadius * (1.7 + seed.blurGroup * 0.52)}
                ry={renderedRadius * (1.1 + seed.blurGroup * 0.18)}
                fill={`url(#bokehGradient${seed.colorIndex})`}
                opacity={seed.opacity * edgeFade * twinkle * illumination * 0.55}
                transform={`rotate(${rotation.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`}
              />
              <circle
                cx={x}
                cy={y}
                r={renderedRadius * 0.32}
                fill={seed.color}
                opacity={seed.opacity * edgeFade * twinkle * illumination * 0.48}
              />
            </React.Fragment>
          );
        })}
  </g>
);

export const SceneSvg: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({frame, durationInFrames}) => {
  const progress = frame / durationInFrames;

  const trough =
    smoothstep(0.665, 0.705, progress) *
    (1 - smoothstep(0.805, 0.838, progress));
  const recovery =
    smoothstep(0.805, 0.835, progress) *
    (1 - smoothstep(0.865, 0.895, progress));
  const illumination = 1 - trough * 0.24 + recovery * 0.085;
  const atmospherePulse =
    0.96 + 0.04 * Math.sin(TAU * (progress * 2 + 0.17));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      data-scene={SCENE_SIGNATURE}
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{display: 'block', overflow: 'hidden'}}
    >
      <defs>
        <radialGradient
          id="backdrop"
          cx="49.963%"
          cy="49.941%"
          r="73%"
        >
          <stop offset="0%" stopColor="#4a210f" />
          <stop offset="14%" stopColor="#38170a" />
          <stop offset="42%" stopColor="#240d06" />
          <stop offset="72%" stopColor="#150604" />
          <stop offset="100%" stopColor="#0a0302" />
        </radialGradient>
        <radialGradient
          id="vignette"
          cx="49.963%"
          cy="49.941%"
          r="72%"
        >
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="58%" stopColor="#000000" stopOpacity="0" />
          <stop offset="79%" stopColor="#160601" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.68" />
        </radialGradient>
        <linearGradient id="warmWash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8d26" stopOpacity="0.045" />
          <stop offset="28%" stopColor="#ff8d26" stopOpacity="0" />
          <stop offset="72%" stopColor="#802a08" stopOpacity="0" />
          <stop offset="100%" stopColor="#802a08" stopOpacity="0.055" />
        </linearGradient>
        {PACKET_COLORS.map((color, index) => (
          <radialGradient key={`bokeh-gradient-${index}`} id={`bokehGradient${index}`}>
            <stop offset="0%" stopColor="#fff7d0" stopOpacity="0.88" />
            <stop offset="22%" stopColor={color} stopOpacity="0.66" />
            <stop offset="58%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter
          id="globalBloom"
          filterUnits="userSpaceOnUse"
          x="-120"
          y="-120"
          width={WIDTH + 240}
          height={HEIGHT + 240}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="8.4" />
        </filter>
        <radialGradient id="centerHaze" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.97" />
          <stop offset="38%" stopColor="#000000" stopOpacity="0.76" />
          <stop offset="70%" stopColor="#100501" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#6e2a08" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={WIDTH} height={HEIGHT} fill="#1a0a05" />
      <rect
        width={WIDTH}
        height={HEIGHT}
        fill="url(#backdrop)"
        opacity={atmospherePulse}
      />

      <g filter="url(#globalBloom)" opacity={0.48}>
        <RadialRailBed illumination={illumination} />
        <DepthPacketField progress={progress} illumination={illumination} />
        <PeripheralBokeh progress={progress} illumination={illumination} />
      </g>
      <RadialRailBed illumination={illumination} />
      <DepthPacketField progress={progress} illumination={illumination} />
      <PeripheralBokeh progress={progress} illumination={illumination} />

      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={238}
        fill="url(#centerHaze)"
        opacity={0.82}
      />
      <rect width={WIDTH} height={HEIGHT} fill="url(#vignette)" />
      <rect
        width={WIDTH}
        height={HEIGHT}
        fill="url(#warmWash)"
        opacity={illumination}
        style={{mixBlendMode: 'screen'}}
      />
    </svg>
  );
};

export const MotionFrame: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({frame, durationInFrames}) => (
  <AbsoluteFill style={{backgroundColor: '#1a0a05', overflow: 'hidden'}}>
    <SceneSvg frame={frame} durationInFrames={durationInFrames} />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <MotionFrame frame={frame} durationInFrames={durationInFrames} />;
};
