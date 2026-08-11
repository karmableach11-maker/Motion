import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const SCENE_SIGNATURE = 'GOLDEN_DEPTH_PASSAGE_304398360_V2';

const WIDTH = 1920;
const HEIGHT = 1080;
const CENTER_X = WIDTH * 0.5002;
const CENTER_Y = HEIGHT * 0.5003;
const FOCAL_LENGTH = 760;
const NEAR_Z = 4.3;
const FAR_Z = 12.5;
const DEPTH_RANGE = FAR_Z - NEAR_Z;
const TAU = Math.PI * 2;

const STAR_COLORS = [
  '#fff2b2',
  '#ffe071',
  '#ffc33f',
  '#ff9a25',
  '#ef6f17',
  '#b84512',
] as const;

const BOKEH_COLORS = [
  '#fff5c9',
  '#ffe58d',
  '#ffcb52',
  '#ffa126',
  '#dc5b14',
] as const;

type SpriteSeed = {
  id: number;
  worldX: number;
  worldY: number;
  depthPhase: number;
  worldRadius: number;
  opacity: number;
  color: string;
  twinklePhase: number;
  twinkleCycles: number;
  hexagonal: boolean;
  rotation: number;
  bloom: number;
  warmBias: number;
};

type ProjectedSprite = SpriteSeed & {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  z: number;
  normalizedDepth: number;
};

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const fract = (value: number) => value - Math.floor(value);

const random01 = (seed: number) =>
  fract(Math.sin(seed * 12.9898 + 78.233) * 43758.5453123);

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const makeStars = (count: number): SpriteSeed[] =>
  Array.from({length: count}, (_, id) => {
    const angle = random01(id * 13.17 + 4.2) * TAU;
    const innerShift = random01(id * 53.11 + 2.4) < 0.55;
    const shellParticle = random01(id * 2.91 + 6.8) > 0.75;
    const baseRadial = shellParticle
      ? 1.4 + Math.pow(random01(id * 19.31 + 7.7), 0.65) * 3.8
      : 0.95 + Math.pow(random01(id * 19.31 + 7.7), 0.78) * 4.0;
    const radial = innerShift
      ? 0.95 + Math.max(0, baseRadial - 0.95) * 0.42
      : baseRadial;
    const anisotropy = 0.88 + random01(id * 5.73 + 1.4) * 0.24;
    const baseWorldRadius = shellParticle
      ? 0.022 + Math.pow(random01(id * 8.91 + 5.1), 1.75) * 0.082
      : 0.0115 + Math.pow(random01(id * 8.91 + 5.1), 2.1) * 0.047;
    const worldRadius = baseWorldRadius * (innerShift ? 0.65 : 1);
    const colorIndex = Math.min(
      STAR_COLORS.length - 1,
      Math.floor(Math.pow(random01(id * 7.27 + 8.4), 1.55) * STAR_COLORS.length),
    );

    return {
      id,
      worldX: Math.cos(angle) * radial * anisotropy * 1.12,
      worldY: Math.sin(angle) * radial / anisotropy,
      depthPhase: random01(id * 17.41 + 2.8),
      worldRadius,
      opacity: 0.68 + random01(id * 11.53 + 0.9) * 0.32,
      color: STAR_COLORS[colorIndex],
      twinklePhase: random01(id * 23.11 + 3.3),
      twinkleCycles: 22 + Math.floor(random01(id * 3.37 + 9.1) * 43),
      hexagonal: random01(id * 29.17 + 6.6) > 0.88,
      rotation: random01(id * 31.03 + 1.1) * 60,
      bloom: random01(id * 37.31 + 8.2),
      warmBias: random01(id * 41.71 + 4.8),
    };
  });

const makeTunnelSparks = (count: number): SpriteSeed[] =>
  Array.from({length: count}, (_, index) => {
    const id = index + 8000;
    const angle = random01(id * 11.47 + 5.8) * TAU;
    const radial =
      1.9 + Math.pow(random01(id * 17.29 + 3.1), 0.9) * 3.1;
    const anisotropy = 0.9 + random01(id * 5.97 + 7.3) * 0.2;
    const colorIndex = Math.min(
      STAR_COLORS.length - 1,
      Math.floor(
        Math.pow(random01(id * 7.61 + 2.4), 1.7) * STAR_COLORS.length,
      ),
    );

    return {
      id,
      worldX: Math.cos(angle) * radial * anisotropy * 1.12,
      worldY: Math.sin(angle) * radial / anisotropy,
      depthPhase: random01(id * 19.31 + 8.2),
      worldRadius:
        0.025 + Math.pow(random01(id * 9.83 + 4.7), 1.6) * 0.03,
      opacity: 0.58 + random01(id * 13.07 + 1.6) * 0.32,
      color: STAR_COLORS[colorIndex],
      twinklePhase: random01(id * 22.37 + 6.1),
      twinkleCycles: 27 + Math.floor(random01(id * 4.31 + 3.8) * 30),
      hexagonal: random01(id * 28.73 + 9.4) > 0.9,
      rotation: random01(id * 34.19 + 2.7) * 60,
      bloom: 0.25 + random01(id * 40.13 + 5.2) * 0.42,
      warmBias: random01(id * 47.21 + 1.9),
    };
  });

const makeBokeh = (count: number): SpriteSeed[] =>
  Array.from({length: count}, (_, index) => {
    const id = index + 2000;
    const angle = random01(id * 7.71 + 1.7) * TAU;
    const radial = 1.7 + Math.pow(random01(id * 14.37 + 8.1), 0.58) * 5.3;
    const anisotropy = 0.9 + random01(id * 4.83 + 3.6) * 0.2;
    const worldRadius =
      0.065 + Math.pow(random01(id * 9.61 + 2.1), 1.35) * 0.145;
    const colorIndex = Math.min(
      BOKEH_COLORS.length - 1,
      Math.floor(random01(id * 6.31 + 4.4) * BOKEH_COLORS.length),
    );

    return {
      id,
      worldX: Math.cos(angle) * radial * anisotropy * 1.25,
      worldY: Math.sin(angle) * radial / anisotropy,
      depthPhase: random01(id * 18.91 + 0.6),
      worldRadius,
      opacity: 0.62 + random01(id * 12.19 + 5.2) * 0.38,
      color: BOKEH_COLORS[colorIndex],
      twinklePhase: random01(id * 20.53 + 7.9),
      twinkleCycles: 18 + Math.floor(random01(id * 3.93 + 2.7) * 35),
      hexagonal: random01(id * 28.13 + 1.5) > 0.46,
      rotation: random01(id * 32.77 + 9.5) * 60,
      bloom: 0.45 + random01(id * 39.41 + 5.7) * 0.55,
      warmBias: random01(id * 46.21 + 2.2),
    };
  });

const makeMidSparks = (count: number): SpriteSeed[] =>
  Array.from({length: count}, (_, index) => {
    const id = index + 3000;
    const angle = random01(id * 8.27 + 5.4) * TAU;
    const radial = 2.4 + Math.pow(random01(id * 15.91 + 2.8), 0.7) * 4.5;
    const anisotropy = 0.9 + random01(id * 5.21 + 8.7) * 0.2;
    const colorIndex = Math.min(
      BOKEH_COLORS.length - 1,
      Math.floor(Math.pow(random01(id * 7.13 + 3.1), 1.35) * BOKEH_COLORS.length),
    );

    return {
      id,
      worldX: Math.cos(angle) * radial * anisotropy * 1.2,
      worldY: Math.sin(angle) * radial / anisotropy,
      depthPhase: random01(id * 19.73 + 4.6),
      worldRadius:
        0.038 + Math.pow(random01(id * 9.37 + 1.9), 1.2) * 0.03,
      opacity: 0.32 + random01(id * 12.73 + 6.2) * 0.26,
      color: BOKEH_COLORS[colorIndex],
      twinklePhase: random01(id * 21.19 + 7.4),
      twinkleCycles: 24 + Math.floor(random01(id * 4.07 + 5.5) * 27),
      hexagonal: random01(id * 27.31 + 9.2) > 0.72,
      rotation: random01(id * 33.17 + 1.8) * 60,
      bloom: 0.2 + random01(id * 38.93 + 4.3) * 0.35,
      warmBias: random01(id * 45.11 + 3.7),
    };
  });

const makeFlares = (): SpriteSeed[] => {
  const generated = Array.from({length: 24}, (_, index) => {
    const id = index + 4000;
    const angle = random01(id * 10.71 + 4.7) * TAU;
    const radial = 2.5 + Math.pow(random01(id * 16.03 + 8.8), 0.58) * 5.0;

    return {
      id,
      worldX: Math.cos(angle) * radial * 1.25,
      worldY: Math.sin(angle) * radial,
      depthPhase: random01(id * 21.41 + 6.4),
      worldRadius: 0.12 + random01(id * 8.37 + 3.9) * 0.14,
      opacity: 0.62 + random01(id * 11.87 + 2.4) * 0.34,
      color: BOKEH_COLORS[Math.floor(random01(id * 6.83 + 9.6) * 4)],
      twinklePhase: random01(id * 24.17 + 1.6),
      twinkleCycles: 7 + Math.floor(random01(id * 4.49 + 7.2) * 16),
      hexagonal: random01(id * 30.11 + 4.1) > 0.52,
      rotation: random01(id * 35.71 + 5.8) * 60,
      bloom: 0.72 + random01(id * 44.23 + 3.1) * 0.28,
      warmBias: random01(id * 49.91 + 2.6),
    } satisfies SpriteSeed;
  });

  const heroFlares: SpriteSeed[] = [
    {
      id: 4991,
      worldX: 3.55,
      worldY: -0.75,
      depthPhase: 0.09,
      worldRadius: 0.29,
      opacity: 0.9,
      color: '#ffd45e',
      twinklePhase: 0.18,
      twinkleCycles: 11,
      hexagonal: false,
      rotation: 0,
      bloom: 1,
      warmBias: 0.26,
    },
    {
      id: 4992,
      worldX: 3.9,
      worldY: 0.75,
      depthPhase: 0.34,
      worldRadius: 0.32,
      opacity: 0.92,
      color: '#ffe98f',
      twinklePhase: 0.63,
      twinkleCycles: 9,
      hexagonal: false,
      rotation: 0,
      bloom: 1,
      warmBias: 0.12,
    },
    {
      id: 4993,
      worldX: -3.8,
      worldY: 0.8,
      depthPhase: 0.59,
      worldRadius: 0.27,
      opacity: 0.84,
      color: '#ffd15a',
      twinklePhase: 0.42,
      twinkleCycles: 13,
      hexagonal: true,
      rotation: 17,
      bloom: 0.96,
      warmBias: 0.32,
    },
    {
      id: 4994,
      worldX: -4.1,
      worldY: -0.7,
      depthPhase: 0.89,
      worldRadius: 0.34,
      opacity: 1,
      color: '#ffd562',
      twinklePhase: 0.31,
      twinkleCycles: 12,
      hexagonal: false,
      rotation: 0,
      bloom: 0.94,
      warmBias: 0.3,
    },
    {
      id: 4995,
      worldX: -3.4,
      worldY: 1.25,
      depthPhase: 0.12,
      worldRadius: 0.2,
      opacity: 0.78,
      color: '#ffbd3d',
      twinklePhase: 0.79,
      twinkleCycles: 15,
      hexagonal: true,
      rotation: 24,
      bloom: 0.91,
      warmBias: 0.42,
    },
  ];

  return [...generated, ...heroFlares];
};

const STARS = [...makeStars(770), ...makeTunnelSparks(130)];
const BOKEH = [...makeBokeh(280), ...makeMidSparks(300)];
const FLARES = makeFlares();

const projectSprite = (
  sprite: SpriteSeed,
  progress: number,
  kind: 'star' | 'bokeh' | 'flare',
): ProjectedSprite | null => {
  const depthPhase = fract(sprite.depthPhase - progress);
  const z = NEAR_Z + depthPhase * DEPTH_RANGE;
  const normalizedDepth = clamp((z - NEAR_Z) / DEPTH_RANGE);
  const perspective = FOCAL_LENGTH / z;
  const x = CENTER_X + sprite.worldX * perspective;
  const y = CENTER_Y + sprite.worldY * perspective;
  const ellipticalRadius = Math.hypot(
    (x - CENTER_X) / (WIDTH / 2),
    (y - CENTER_Y) / (HEIGHT / 2),
  );
  const starSizeScale =
    kind === 'star'
      ? 0.78 + 0.32 * smoothstep(0.12, 0.75, ellipticalRadius)
      : 1;
  const innerShiftStar =
    kind === 'star' && random01(sprite.id * 53.11 + 2.4) < 0.55;
  const nearStarScale =
    kind === 'star'
      ? 1 +
        (innerShiftStar ? 0.25 : 1.35) *
          Math.pow(1 - normalizedDepth, 2)
      : 1;
  const centerSizeScale =
    kind === 'star'
      ? 0.78 + 0.22 * smoothstep(0.08, 0.18, ellipticalRadius)
      : 1;
  const rawRadius =
    sprite.worldRadius *
    perspective *
    starSizeScale *
    nearStarScale *
    centerSizeScale;
  const radius = Math.min(
    rawRadius,
    kind === 'star' ? 12.5 : kind === 'bokeh' ? 48 : 42,
  );

  const nearWidth = kind === 'flare' ? 1.0 : kind === 'bokeh' ? 1.05 : 0.95;
  const farWidth = kind === 'star' ? 1.25 : kind === 'bokeh' ? 1.7 : 2.4;
  const nearFade = smoothstep(NEAR_Z, NEAR_Z + nearWidth, z);
  const farFade = 1 - smoothstep(FAR_Z - farWidth, FAR_Z, z);
  const approachBrightness = 0.72 + (1 - normalizedDepth) * 0.28;
  const pulseMean = kind === 'flare' ? 0.84 : kind === 'bokeh' ? 0.78 : 0.74;
  const pulseAmplitude = kind === 'flare' ? 0.34 : kind === 'bokeh' ? 0.48 : 0.52;
  const pulse =
    pulseMean +
    pulseAmplitude *
      Math.sin(TAU * (progress * sprite.twinkleCycles + sprite.twinklePhase));
  const depthVisibility =
    kind === 'flare'
      ? 1 - smoothstep(0.48, 0.76, normalizedDepth)
      : kind === 'bokeh'
        ? 0.28 + Math.pow(1 - normalizedDepth, 0.9) * 0.72
        : 1;
  const screenRadius = Math.hypot(x - CENTER_X, y - CENTER_Y);
  const centralStarFade = smoothstep(0.085, 0.19, ellipticalRadius);
  const hierarchyFade =
    kind === 'flare'
      ? smoothstep(0.55, 0.62, ellipticalRadius)
      : kind === 'bokeh'
        ? rawRadius > 14
          ? smoothstep(0.55, 0.62, ellipticalRadius)
          : smoothstep(0.12, 0.28, ellipticalRadius)
        : centralStarFade *
          (1 -
            smoothstep(2.1, 6.2, rawRadius) *
              (1 - smoothstep(68, 205, screenRadius)));
  const middleBand =
    smoothstep(0.32, 0.46, ellipticalRadius) *
    (1 - smoothstep(0.58, 0.72, ellipticalRadius));
  const middleBloomControl = kind === 'star' ? 1 : 1 - 0.28 * middleBand;
  const peripheralBrightness =
    middleBloomControl *
    (1 + 0.25 * smoothstep(0.78, 1.0, ellipticalRadius));
  const kindIntensity = kind === 'flare' ? 1.55 : kind === 'bokeh' ? 1.35 : 1.1;
  const alpha =
    sprite.opacity *
    kindIntensity *
    nearFade *
    farFade *
    approachBrightness *
    pulse *
    depthVisibility *
    hierarchyFade *
    peripheralBrightness;

  const margin = kind === 'flare' ? 520 : kind === 'bokeh' ? 180 : 50;
  if (
    alpha < 0.008 ||
    x < -margin ||
    x > WIDTH + margin ||
    y < -margin ||
    y > HEIGHT + margin
  ) {
    return null;
  }

  return {
    ...sprite,
    x,
    y,
    radius,
    alpha,
    z,
    normalizedDepth,
  };
};

const hexagonPoints = (
  x: number,
  y: number,
  radius: number,
  rotationDegrees: number,
) =>
  Array.from({length: 6}, (_, index) => {
    const angle = (rotationDegrees * Math.PI) / 180 + (index * TAU) / 6;
    return `${(x + Math.cos(angle) * radius).toFixed(2)},${(
      y +
      Math.sin(angle) * radius
    ).toFixed(2)}`;
  }).join(' ');

const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(ellipse 82% 96% at 50% 50%, #2a0a05 0%, #2f0b05 31%, #331006 64%, #351006 81%, #1a0402 100%)',
    }}
  >
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.07) 20%, rgba(0,0,0,0) 47%)',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(255,135,26,0.02) 0%, rgba(255,91,11,0.025) 49%, rgba(0,0,0,0.34) 100%)',
      }}
    />
  </AbsoluteFill>
);

const SpriteShape: React.FC<{
  sprite: ProjectedSprite;
  radius?: number;
  opacity?: number;
}> = ({sprite, radius = sprite.radius, opacity = sprite.alpha}) =>
  sprite.hexagonal && radius > 1.45 ? (
    <polygon
      points={hexagonPoints(
        sprite.x,
        sprite.y,
        radius,
        sprite.rotation,
      )}
      fill={sprite.color}
      opacity={opacity}
    />
  ) : (
    <circle
      cx={sprite.x}
      cy={sprite.y}
      r={Math.max(0.18, radius)}
      fill={sprite.color}
      opacity={opacity}
    />
  );

const ParticleField: React.FC<{progress: number}> = ({progress}) => {
  const stars = STARS.map((sprite) =>
    projectSprite(sprite, progress, 'star'),
  )
    .filter((sprite): sprite is ProjectedSprite => sprite !== null)
    .sort((a, b) => b.z - a.z);

  const bokeh = BOKEH.map((sprite) =>
    projectSprite(sprite, progress, 'bokeh'),
  )
    .filter((sprite): sprite is ProjectedSprite => sprite !== null)
    .sort((a, b) => b.z - a.z);

  const flares = FLARES.map((sprite) =>
    projectSprite(sprite, progress, 'flare'),
  )
    .filter((sprite): sprite is ProjectedSprite => sprite !== null)
    .sort((a, b) => b.z - a.z);

  const farBokeh = bokeh.filter((sprite) => sprite.z >= 10.5);
  const midBokeh = bokeh.filter(
    (sprite) => sprite.z < 10.5 && sprite.z >= 5.4,
  );
  const nearBokeh = bokeh.filter((sprite) => sprite.z < 5.4);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: 'absolute', inset: 0, overflow: 'hidden'}}
    >
      <defs>
        <filter id="pin-glow" x="-220%" y="-220%" width="540%" height="540%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id="soft-bokeh" x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="0.95" />
        </filter>
        <filter id="near-bokeh" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <filter id="flare-soft" x="-140%" y="-140%" width="380%" height="380%">
          <feGaussianBlur stdDeviation="5.8" />
        </filter>
        <radialGradient id="halo-gold">
          <stop offset="0%" stopColor="#fff8d2" stopOpacity="0.96" />
          <stop offset="13%" stopColor="#ffe070" stopOpacity="0.86" />
          <stop offset="42%" stopColor="#ff9e20" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ec5b12" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="halo-amber">
          <stop offset="0%" stopColor="#ffe994" stopOpacity="0.88" />
          <stop offset="21%" stopColor="#ffb42b" stopOpacity="0.56" />
          <stop offset="58%" stopColor="#c94912" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7c1907" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ambient-halo">
          <stop offset="0%" stopColor="#ffb52c" stopOpacity="0.28" />
          <stop offset="37%" stopColor="#d64e0c" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#541104" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g style={{mixBlendMode: 'screen'}}>
        {flares.map((sprite) => {
          const haloRadius = Math.max(34, sprite.radius * (7.2 + sprite.bloom * 3.2));
          return (
            <circle
              key={`ambient-${sprite.id}`}
              cx={sprite.x}
              cy={sprite.y}
              r={haloRadius}
              fill="url(#ambient-halo)"
              opacity={sprite.alpha * (0.58 + sprite.bloom * 0.3)}
            />
          );
        })}
      </g>

      <g style={{mixBlendMode: 'screen'}} filter="url(#pin-glow)">
        {stars
          .filter((sprite) => sprite.bloom > 0.93 && sprite.radius > 1.1)
          .map((sprite) => (
            <circle
              key={`star-halo-${sprite.id}`}
              cx={sprite.x}
              cy={sprite.y}
              r={sprite.radius * (2.1 + sprite.bloom * 1.7)}
              fill={sprite.color}
              opacity={sprite.alpha * 0.24}
            />
          ))}
      </g>

      <g style={{mixBlendMode: 'screen'}}>
        {stars.map((sprite) => (
          <SpriteShape key={`star-${sprite.id}`} sprite={sprite} />
        ))}
      </g>

      <g style={{mixBlendMode: 'screen'}} filter="url(#soft-bokeh)">
        {farBokeh.map((sprite) => (
          <SpriteShape
            key={`far-bokeh-${sprite.id}`}
            sprite={sprite}
            opacity={sprite.alpha * 0.75}
          />
        ))}
      </g>

      <g style={{mixBlendMode: 'screen'}} filter="url(#pin-glow)">
        {bokeh
          .filter((sprite) => sprite.bloom > 0.72 && sprite.radius > 1.5)
          .map((sprite) => (
            <circle
              key={`bokeh-halo-${sprite.id}`}
              cx={sprite.x}
              cy={sprite.y}
              r={sprite.radius * 1.9}
              fill={sprite.color}
              opacity={sprite.alpha * 0.24}
            />
          ))}
      </g>

      <g style={{mixBlendMode: 'screen'}}>
        {midBokeh.map((sprite) => (
          <React.Fragment key={`mid-bokeh-${sprite.id}`}>
            <circle
              cx={sprite.x}
              cy={sprite.y}
              r={sprite.radius * 2.55}
              fill={sprite.color}
              opacity={sprite.alpha * 0.1 * sprite.bloom}
              filter="url(#soft-bokeh)"
            />
            <SpriteShape sprite={sprite} opacity={sprite.alpha * 0.95} />
          </React.Fragment>
        ))}
      </g>

      <g style={{mixBlendMode: 'screen'}} filter="url(#near-bokeh)">
        {nearBokeh.map((sprite) => (
          <SpriteShape
            key={`near-bokeh-${sprite.id}`}
            sprite={sprite}
            radius={sprite.radius * 1.06}
            opacity={sprite.alpha * 0.88}
          />
        ))}
      </g>

      <g style={{mixBlendMode: 'screen'}}>
        {flares.map((sprite) => {
          const gradient = sprite.warmBias > 0.56 ? 'url(#halo-amber)' : 'url(#halo-gold)';
          const haloRadius = Math.max(22, sprite.radius * (3.8 + sprite.bloom * 1.4));
          const coreRadius = Math.max(1.4, sprite.radius * 0.48);
          return (
            <g key={`flare-${sprite.id}`}>
              <circle
                cx={sprite.x}
                cy={sprite.y}
                r={haloRadius}
                fill={gradient}
                opacity={sprite.alpha}
              />
              <g filter="url(#flare-soft)">
                <circle
                  cx={sprite.x}
                  cy={sprite.y}
                  r={sprite.radius * 1.25}
                  fill={sprite.color}
                  opacity={sprite.alpha * 0.88}
                />
              </g>
              <SpriteShape
                sprite={sprite}
                radius={Math.max(coreRadius, sprite.radius * 0.62)}
                opacity={sprite.alpha}
              />
              <circle
                cx={sprite.x}
                cy={sprite.y}
                r={Math.max(0.7, coreRadius * 0.33)}
                fill="#fffbe2"
                opacity={sprite.alpha * 0.96}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill
      data-scene={SCENE_SIGNATURE}
      style={{
        backgroundColor: '#080100',
        overflow: 'hidden',
      }}
    >
      <Backdrop />
      <ParticleField progress={progress} />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 71% 82% at 50% 50%, rgba(0,0,0,0) 50%, rgba(3,0,0,0.1) 78%, rgba(0,0,0,0.25) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
