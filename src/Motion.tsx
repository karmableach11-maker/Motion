import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const TAU = Math.PI * 2;
const VANISH_X = 0.506;
const VANISH_Y = 0.493;
const FOCAL = 920;
const DEPTH_PERIOD = 5200;
const NEAR_CLIP = 92;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const fract = (value: number) => value - Math.floor(value);

const hash = (value: number) =>
  fract(Math.sin(value * 127.1 + 311.7) * 43758.5453123);

const wrapDepth = (value: number) =>
  ((value - NEAR_CLIP) % DEPTH_PERIOD + DEPTH_PERIOD) % DEPTH_PERIOD +
  NEAR_CLIP;

const principalScaleBoost = (z: number) =>
  interpolate(z, [145, 330, 540, 820], [1.48, 1.38, 1.27, 0.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const principalAspect = (z: number) =>
  interpolate(z, [145, 300, 460, 540, 820], [0.96, 0.78, 0.72, 0.76, 0.72], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const principalScreenShift = (z: number) =>
  interpolate(z, [110, 300, 460, 540, 820], [0.455, 0.1, 0.04, 0.025, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

type LedPoint = {
  x: number;
  y: number;
  size?: number;
};

type NoteKind = 'single' | 'pair';

type NoteSpec = {
  id: number;
  kind: NoteKind;
  color: string;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  opacity: number;
  stretchX: number;
  flickerCycles: number;
  flickerPhase: number;
  activity?: 'rebuild';
  hero?: 'opening' | 'principal' | 'late' | 'seam';
};

type StarSpec = {
  id: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  radius: number;
  opacity: number;
  flickerCycles: number;
  flickerPhase: number;
  color: string;
};

type ShaftSpec = {
  id: number;
  baseX: number;
  baseZ: number;
  width: number;
  color: string;
  opacity: number;
};

const linePoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  spacing: number,
): LedPoint[] => {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const count = Math.max(2, Math.round(distance / spacing));
  return Array.from({length: count + 1}, (_, index) => {
    const amount = index / count;
    return {
      x: mix(x1, x2, amount),
      y: mix(y1, y2, amount),
    };
  });
};

const curvePoints = (
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  count: number,
): LedPoint[] =>
  Array.from({length: count + 1}, (_, index) => {
    const t = index / count;
    const one = 1 - t;
    return {
      x:
        one * one * one * p0[0] +
        3 * one * one * t * p1[0] +
        3 * one * t * t * p2[0] +
        t * t * t * p3[0],
      y:
        one * one * one * p0[1] +
        3 * one * one * t * p1[1] +
        3 * one * t * t * p2[1] +
        t * t * t * p3[1],
    };
  });

const ellipseDots = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  spacing: number,
): LedPoint[] => {
  const points: LedPoint[] = [];
  for (let y = -radiusY; y <= radiusY; y += spacing) {
    for (let x = -radiusX; x <= radiusX; x += spacing) {
      const distance =
        (x * x) / (radiusX * radiusX) + (y * y) / (radiusY * radiusY);
      if (distance <= 1) {
        points.push({x: centerX + x, y: centerY + y});
      }
    }
  }
  return points;
};

const dedupePoints = (points: LedPoint[]): LedPoint[] => {
  const seen = new Set<string>();
  return points.filter((point) => {
    const key = `${Math.round(point.x)}:${Math.round(point.y)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const SINGLE_POINTS = dedupePoints([
  ...linePoints(58, 18, 58, 111, 7),
  ...linePoints(62, 18, 62, 108, 7),
  ...curvePoints([60, 18], [91, 27], [101, 49], [84, 69], 11),
  ...curvePoints([84, 69], [92, 51], [83, 43], [68, 39], 6),
  ...ellipseDots(43, 116, 23, 15, 7),
]);

const PAIR_POINTS = dedupePoints([
  ...linePoints(30, 24, 30, 132, 7),
  ...linePoints(35, 24, 35, 128, 7),
  ...linePoints(126, 35, 126, 132, 7),
  ...linePoints(131, 35, 131, 128, 7),
  ...linePoints(32, 24, 128, 35, 7),
  ...linePoints(32, 30, 128, 41, 7),
  ...ellipseDots(15, 136, 24, 15, 7),
  ...ellipseDots(111, 136, 24, 15, 7),
]);

const NOTE_DIMENSIONS: Record<
  NoteKind,
  {width: number; height: number; centerX: number; centerY: number}
> = {
  single: {width: 104, height: 150, centerX: 52, centerY: 75},
  pair: {width: 160, height: 164, centerX: 80, centerY: 82},
};

const NOTE_COLORS = ['#63e9ff', '#88d8ff', '#ffc09d', '#ff9f86'];

const REGULAR_NOTES: NoteSpec[] = Array.from({length: 26}, (_, index) => {
  const id = index + 30;
  const zBand = (index + 0.78 + (hash(id * 2.1) - 0.5) * 0.3) / 26;
  const baseZ = NEAR_CLIP + fract(zBand) * DEPTH_PERIOD;
  const rayX = mix(-1.34, 1.34, hash(id * 3.3));
  const rayY = mix(-1.02, 1.02, hash(id * 4.7));
  return {
    id,
    kind: hash(id * 5.1) > 0.62 ? 'pair' : 'single',
    color: NOTE_COLORS[Math.floor(hash(id * 6.3) * NOTE_COLORS.length)],
    baseX: (rayX * 960 * baseZ) / FOCAL,
    baseY: (rayY * 540 * baseZ) / FOCAL,
    baseZ,
    size: mix(0.8, 1.55, hash(id * 7.7)),
    opacity: mix(0.72, 1, hash(id * 8.9)),
    stretchX: mix(0.84, 1.07, hash(id * 9.9)),
    flickerCycles: 3 + Math.floor(hash(id * 11.1) * 5),
    flickerPhase: hash(id * 12.3) * TAU,
  };
});

const HERO_NOTES: NoteSpec[] = [
  {
    id: 1,
    kind: 'single',
    color: '#71ecff',
    baseX: -160,
    baseY: 82,
    baseZ: 180,
    size: 0.42,
    opacity: 1,
    stretchX: 0.92,
    flickerCycles: 5,
    flickerPhase: 0.8,
    hero: 'seam',
  },
  {
    id: 2,
    kind: 'single',
    color: '#ffc09d',
    baseX: -270,
    baseY: -463,
    baseZ: 1462,
    size: 4.8,
    opacity: 1,
    stretchX: 0.76,
    flickerCycles: 4,
    flickerPhase: 2.1,
    hero: 'opening',
  },
  {
    id: 3,
    kind: 'pair',
    color: '#ffb29a',
    baseX: 140,
    baseY: 60,
    baseZ: 2280,
    size: 3.2,
    opacity: 1,
    stretchX: 1.05,
    flickerCycles: 6,
    flickerPhase: 1.4,
    hero: 'principal',
  },
  {
    id: 4,
    kind: 'pair',
    color: '#73e8ff',
    baseX: -108,
    baseY: -92,
    baseZ: 4910,
    size: 1.2,
    opacity: 1,
    stretchX: 0.9,
    flickerCycles: 7,
    flickerPhase: 3.2,
    hero: 'late',
  },
];

const REBUILD_NOTES: NoteSpec[] = [
  {id: 101, kind: 'pair', color: '#71ecff', baseX: -478, baseY: -294, baseZ: 3504, size: 1.3, opacity: 0.96, stretchX: 0.92, flickerCycles: 5, flickerPhase: 0.4, activity: 'rebuild'},
  {id: 102, kind: 'single', color: '#ffc09d', baseX: -276, baseY: -237, baseZ: 3754, size: 1.22, opacity: 0.94, stretchX: 0.88, flickerCycles: 6, flickerPhase: 1.1, activity: 'rebuild'},
  {id: 103, kind: 'single', color: '#63e9ff', baseX: 375, baseY: -399, baseZ: 3954, size: 1.16, opacity: 0.92, stretchX: 0.9, flickerCycles: 7, flickerPhase: 2.3, activity: 'rebuild'},
  {id: 104, kind: 'pair', color: '#ff9f86', baseX: 458, baseY: 113, baseZ: 3604, size: 1.0, opacity: 0.94, stretchX: 0.9, flickerCycles: 5, flickerPhase: 3.4, activity: 'rebuild'},
  {id: 105, kind: 'single', color: '#88d8ff', baseX: -646, baseY: 365, baseZ: 4204, size: 1.28, opacity: 0.9, stretchX: 0.86, flickerCycles: 8, flickerPhase: 4.2, activity: 'rebuild'},
  {id: 106, kind: 'single', color: '#ffc09d', baseX: 1220, baseY: -285, baseZ: 4404, size: 1.12, opacity: 0.88, stretchX: 0.84, flickerCycles: 6, flickerPhase: 5.1, activity: 'rebuild'},
];

const STAR_SPECS: StarSpec[] = Array.from({length: 620}, (_, index) => {
  const id = index + 900;
  const baseZ =
    NEAR_CLIP +
    fract((index + 0.37 + (hash(id * 1.7) - 0.5) * 0.8) / 620) *
      DEPTH_PERIOD;
  const rayX = mix(-1.18, 1.18, hash(id * 2.7));
  const rayY = mix(-0.92, 0.92, hash(id * 3.9));
  return {
    id,
    baseX: (rayX * 960 * baseZ) / FOCAL,
    baseY: (rayY * 540 * baseZ) / FOCAL,
    baseZ,
    radius: mix(0.55, 1.45, Math.pow(hash(id * 4.7), 2)),
    opacity: mix(0.28, 0.86, hash(id * 5.3)),
    flickerCycles: 7 + Math.floor(hash(id * 6.1) * 9),
    flickerPhase: hash(id * 7.3) * TAU,
    color: hash(id * 8.1) > 0.16 ? '#66b7ff' : '#bd87ff',
  };
});

const SHAFT_SPECS: ShaftSpec[] = Array.from({length: 14}, (_, index) => {
  const id = index + 1700;
  const baseZ =
    NEAR_CLIP +
    fract((index + 0.28 + hash(id * 2.2) * 0.46) / 14) * DEPTH_PERIOD;
  const rayX = mix(-0.95, 0.95, hash(id * 3.1));
  return {
    id,
    baseX: (rayX * 960 * baseZ) / FOCAL,
    baseZ,
    width: mix(2.5, 8.5, hash(id * 4.4)),
    color: hash(id * 5.6) > 0.76 ? '#ee8fc9' : '#49d9ff',
    opacity: mix(0.2, 0.56, hash(id * 6.8)),
  };
});

const getProjectedNote = (
  note: NoteSpec,
  travel: number,
  width: number,
  height: number,
) => {
  const z = wrapDepth(note.baseZ - travel);
  const perspective = FOCAL / z;
  const x =
    width * VANISH_X +
    note.baseX * perspective +
    (note.hero === 'principal' ? width * principalScreenShift(z) : 0);
  const y = height * VANISH_Y + note.baseY * perspective;
  return {z, perspective, x, y};
};

const Backdrop: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse at 50.6% 49.3%, #1979cf 0%, #0d438f 27%, #071d50 62%, #02091f 100%)',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="horizon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1e6fd8" stopOpacity="0" />
            <stop offset="0.3" stopColor="#55bfff" stopOpacity="0.2" />
            <stop offset="0.506" stopColor="#baf8ff" stopOpacity="0.82" />
            <stop offset="0.72" stopColor="#4d9eff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#1e6fd8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vertical-core" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4fdfff" stopOpacity="0" />
            <stop offset="0.37" stopColor="#66e8ff" stopOpacity="0.34" />
            <stop offset="0.493" stopColor="#dbffff" stopOpacity="0.94" />
            <stop offset="0.66" stopColor="#51caff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#2d63ff" stopOpacity="0" />
          </linearGradient>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {Array.from({length: 9}, (_, index) => {
          const x = 120 + index * 214;
          return (
            <line
              key={`grid-v-${index}`}
              x1={x}
              y1={118}
              x2={x}
              y2={968}
              stroke="#3c7fd0"
              strokeWidth={1}
              opacity={0.035 + (index % 3) * 0.008}
            />
          );
        })}
        {Array.from({length: 6}, (_, index) => {
          const y = 208 + index * 137;
          return (
            <line
              key={`grid-h-${index}`}
              x1={65}
              y1={y}
              x2={1855}
              y2={y}
              stroke="#55a0ed"
              strokeWidth={1}
              opacity={0.028 + (index % 2) * 0.008}
            />
          );
        })}

        <path
          d="M 1685 -120 C 1828 235 1838 790 1688 1200"
          fill="none"
          stroke="#1c8dff"
          strokeWidth={3}
          opacity={0.38}
          filter="url(#softGlow)"
        />
        <path
          d="M 1685 -120 C 1828 235 1838 790 1688 1200"
          fill="none"
          stroke="#2abaff"
          strokeWidth={1.2}
          opacity={0.82}
        />

        <rect
          x="558"
          y="-80"
          width="78"
          height="1240"
          fill="url(#vertical-core)"
          opacity={0.4}
          filter="url(#softGlow)"
        />
        <rect
          x="500"
          y="-40"
          width="3"
          height="1160"
          fill="url(#vertical-core)"
          opacity={0.84}
        />

        <rect x="0" y="530" width="1920" height="4" fill="url(#horizon)" />
        <rect
          x="0"
          y="517"
          width="1920"
          height="31"
          fill="url(#horizon)"
          opacity={0.46}
          filter="url(#softGlow)"
        />
        <rect
          x="958"
          y="0"
          width="27"
          height="1080"
          fill="url(#vertical-core)"
          opacity={0.22}
          filter="url(#softGlow)"
        />
        <rect
          x="970"
          y="0"
          width="2"
          height="1080"
          fill="url(#vertical-core)"
          opacity={0.64}
        />
      </svg>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50.6% 49.3%, transparent 0%, transparent 45%, rgba(0,2,18,0.42) 78%, rgba(0,1,10,0.84) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const StarField: React.FC<{travel: number; phase: number}> = ({
  travel,
  phase,
}) => {
  const {width, height} = useVideoConfig();
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}
    >
      {STAR_SPECS.map((star) => {
        const z = wrapDepth(star.baseZ - travel);
        const perspective = FOCAL / z;
        const x = width * VANISH_X + star.baseX * perspective;
        const y = height * VANISH_Y + star.baseY * perspective;
        if (x < -18 || x > width + 18 || y < -18 || y > height + 18) {
          return null;
        }
        const farFade = clamp((DEPTH_PERIOD + NEAR_CLIP - z) / 620);
        const nearFade = clamp((z - NEAR_CLIP) / 80);
        const shimmer =
          0.5 +
          0.5 *
            Math.sin(
              TAU * phase * star.flickerCycles + star.flickerPhase,
            );
        const opacity =
          star.opacity * farFade * nearFade * mix(0.16, 1, shimmer);
        const radius = clamp(
          star.radius * (0.65 + perspective * 0.85),
          0.45,
          3.7,
        );
        return (
          <circle
            key={star.id}
            cx={x}
            cy={y}
            r={radius}
            fill={star.color}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};

const LightShaftField: React.FC<{travel: number; phase: number}> = ({
  travel,
  phase,
}) => {
  const {width} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden', mixBlendMode: 'screen'}}>
      {SHAFT_SPECS.map((shaft) => {
        const z = wrapDepth(shaft.baseZ - travel);
        const perspective = FOCAL / z;
        const x = width * VANISH_X + shaft.baseX * perspective;
        if (x < -240 || x > width + 240) {
          return null;
        }
        const near = clamp((720 - z) / 600);
        const farFade = clamp((DEPTH_PERIOD + NEAR_CLIP - z) / 750);
        const nearFade = clamp((z - NEAR_CLIP) / 80);
        const pulse =
          0.68 +
          0.32 * Math.sin(TAU * phase * (3 + (shaft.id % 4)) + shaft.id);
        const opacity =
          shaft.opacity * farFade * nearFade * pulse * mix(0.44, 1.2, near);
        const columnWidth = shaft.width * (0.9 + perspective * 4.4);
        const warm = shaft.color === '#ee8fc9';
        return (
          <React.Fragment key={shaft.id}>
            <div
              style={{
                position: 'absolute',
                left: x - columnWidth / 2,
                top: '-9%',
                width: columnWidth,
                height: '118%',
                opacity,
                filter: `blur(${mix(1.2, 12, near)}px)`,
                background: `linear-gradient(180deg, transparent 0%, ${shaft.color} 31%, #eaffff 51%, ${shaft.color} 69%, transparent 100%)`,
                boxShadow: `0 0 ${mix(12, 70, near)}px ${shaft.color}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x - mix(80, 280, near),
                top: '49.15%',
                width: mix(160, 560, near),
                height: mix(1, 4, near),
                opacity: opacity * (warm ? 0.44 : 0.62),
                filter: 'blur(1px)',
                background: `linear-gradient(90deg, transparent, ${shaft.color}, white, ${shaft.color}, transparent)`,
              }}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const NoteGlyph: React.FC<{
  note: NoteSpec;
  scaleX: number;
  pointOpacity: number;
}> = ({note, scaleX, pointOpacity}) => {
  const points = note.kind === 'single' ? SINGLE_POINTS : PAIR_POINTS;
  const dimensions = NOTE_DIMENSIONS[note.kind];
  return (
    <g
      transform={`scale(${scaleX} 1) translate(${-dimensions.centerX} ${-dimensions.centerY})`}
    >
      {points.map((point, index) => {
        const whiteCore = hash(note.id * 93.1 + index * 7.7) > 0.91;
        const size = point.size ?? 5;
        return (
          <rect
            key={`${note.id}-${index}`}
            x={point.x - size / 2}
            y={point.y - size / 2}
            width={size}
            height={size}
            rx={0.7}
            fill={whiteCore ? '#f5ffff' : note.color}
            opacity={pointOpacity * (whiteCore ? 1 : 0.92)}
          />
        );
      })}
    </g>
  );
};

const ProjectedNote: React.FC<{
  note: NoteSpec;
  travel: number;
  phase: number;
}> = ({note, travel, phase}) => {
  const {width, height} = useVideoConfig();
  const projected = getProjectedNote(note, travel, width, height);
  const {z, perspective, x, y} = projected;
  const dimensions = NOTE_DIMENSIONS[note.kind];
  const scale =
    perspective *
    note.size *
    (note.hero === 'principal' ? principalScaleBoost(z) : 1);
  const projectedWidth = dimensions.width * scale * note.stretchX;
  const projectedHeight = dimensions.height * scale;

  if (
    (note.hero === 'principal' && z < 240) ||
    (!note.hero && z < 160)
  ) {
    return null;
  }

  if (
    x + projectedWidth < -220 ||
    x - projectedWidth > width + 220 ||
    y + projectedHeight < -220 ||
    y - projectedHeight > height + 220
  ) {
    return null;
  }

  const farFade = clamp((DEPTH_PERIOD + NEAR_CLIP - z) / 620);
  const nearFade = clamp(
    (z - NEAR_CLIP) / (note.hero === 'principal' ? 18 : 55),
  );
  const flicker =
    0.84 +
    0.16 *
      Math.sin(TAU * phase * note.flickerCycles + note.flickerPhase);
  const principalDetailFade =
    note.hero === 'principal' ? clamp((z - 240) / 60) : 1;
  const regularDetailFade = !note.hero ? clamp((z - 160) / 60) : 1;
  const activityOpacity =
    note.activity === 'rebuild'
      ? interpolate(phase, [0.56, 0.63, 0.83, 0.93], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;
  const opacity =
    note.opacity *
    farFade *
    nearFade *
    flicker *
    principalDetailFade *
    regularDetailFade *
    activityOpacity;
  const nearAmount = clamp((410 - z) / 290);
  const farAmount = clamp((z - 3900) / 1100);
  const filterId =
    nearAmount > 0.54
      ? note.hero
        ? 'url(#ledNear)'
        : 'url(#ledGlow)'
      : farAmount > 0.35
        ? 'url(#ledFar)'
        : 'url(#ledGlow)';

  const heroAspect =
    note.hero === 'principal'
      ? principalAspect(z)
      : 1;

  const smearOpacity = nearAmount * 0.2;
  return (
    <g>
      {nearAmount > 0.3 && note.hero ? (
        <>
          <g
            transform={`translate(${x} ${y - mix(7, 42, nearAmount)}) scale(${scale})`}
            opacity={opacity * smearOpacity}
            filter="url(#ledNear)"
          >
            <NoteGlyph
              note={note}
              scaleX={note.stretchX * heroAspect}
              pointOpacity={0.7}
            />
          </g>
          <g
            transform={`translate(${x} ${y + mix(9, 58, nearAmount)}) scale(${scale})`}
            opacity={opacity * smearOpacity * 0.72}
            filter="url(#ledNear)"
          >
            <NoteGlyph
              note={note}
              scaleX={note.stretchX * heroAspect}
              pointOpacity={0.56}
            />
          </g>
        </>
      ) : null}
      <g
        transform={`translate(${x} ${y}) scale(${scale})`}
        opacity={opacity}
        filter={filterId}
      >
        <NoteGlyph
          note={note}
          scaleX={note.stretchX * heroAspect}
          pointOpacity={mix(0.74, 1, clamp((3300 - z) / 2600))}
        />
      </g>
    </g>
  );
};

const NoteField: React.FC<{travel: number; phase: number}> = ({
  travel,
  phase,
}) => {
  const {width, height} = useVideoConfig();
  const notes = useMemo(
    () =>
      [...REGULAR_NOTES, ...REBUILD_NOTES, ...HERO_NOTES].sort((a, b) => {
        const aDepth = wrapDepth(a.baseZ - (a.hero ? travel : travel * 2));
        const bDepth = wrapDepth(b.baseZ - (b.hero ? travel : travel * 2));
        return bDepth - aDepth;
      }),
    [travel],
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        mixBlendMode: 'screen',
      }}
    >
      <defs>
        <filter id="ledFar" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ledGlow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="3.4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.55 0"
            result="boost"
          />
          <feMerge>
            <feMergeNode in="boost" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ledNear" x="-220%" y="-220%" width="540%" height="540%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1.15 0 0 0 0.08  0 1.08 0 0 0.04  0 0 1.08 0 0.04  0 0 0 1.4 0"
            result="boost"
          />
          <feMerge>
            <feMergeNode in="boost" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {notes.map((note) => (
        <ProjectedNote
          key={note.id}
          note={note}
          travel={note.hero ? travel : travel * 2}
          phase={phase}
        />
      ))}
    </svg>
  );
};

const NearLensBloom: React.FC<{travel: number}> = ({travel}) => {
  const {width, height} = useVideoConfig();
  const hero = HERO_NOTES.find((note) => note.hero === 'principal')!;
  const projected = getProjectedNote(hero, travel, width, height);
  const dimensions = NOTE_DIMENSIONS[hero.kind];
  const scale =
    projected.perspective * hero.size * principalScaleBoost(projected.z);
  const dynamicStretch = principalAspect(projected.z);
  const projectedWidth =
    dimensions.width * scale * hero.stretchX * dynamicStretch;
  const visibleStemX = projected.x - projectedWidth * 0.297;
  const intensity =
    clamp((430 - projected.z) / 300) *
    clamp((projected.z - NEAR_CLIP) / 18);

  if (intensity <= 0.01) {
    return null;
  }

  const x = clamp(visibleStemX, width * 0.42, width * 0.66);
  const broadWidth = mix(64, 520, intensity);
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: x - broadWidth / 2,
          top: -height * 0.14,
          width: broadWidth,
          height: height * 1.28,
          opacity: intensity * 0.95,
          filter: `blur(${mix(14, 35, intensity)}px)`,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,142,126,0.22) 20%, rgba(255,255,255,0.98) 50%, rgba(255,167,139,0.28) 80%, transparent 100%)',
          boxShadow: `0 0 ${mix(80, 220, intensity)}px rgba(255,185,170,${0.46 * intensity})`,
        }}
      />
      {[-1, 0, 1].map((offset) => (
        <div
          key={offset}
          style={{
            position: 'absolute',
            left: x + offset * mix(23, 54, intensity) - 5,
            top: '-7%',
            width: mix(3, 13, intensity),
            height: '114%',
            opacity: intensity * (offset === 0 ? 0.92 : 0.42),
            filter: `blur(${offset === 0 ? 2 : 7}px)`,
            background:
              'linear-gradient(180deg, transparent, #ffd8ca 20%, white 49%, #ffb29a 76%, transparent)',
          }}
        />
      ))}
      {Array.from({length: 10}, (_, index) => {
        const alternating = index % 2 === 0 ? -1 : 1;
        const cellSize = mix(28, 76, intensity) * (0.82 + (index % 3) * 0.1);
        return (
          <div
            key={`near-cell-${index}`}
            style={{
              position: 'absolute',
              left:
                x +
                alternating * mix(34, 92, intensity) -
                cellSize / 2,
              top: height * (0.03 + index * 0.105) - cellSize / 2,
              width: cellSize,
              height: cellSize,
              borderRadius: mix(4, 12, intensity),
              opacity: intensity * (0.16 + (index % 4) * 0.035),
              filter: `blur(${mix(5, 13, intensity)}px)`,
              background: index % 3 === 0 ? '#fff5ef' : '#ffb29a',
              boxShadow: `0 0 ${mix(25, 74, intensity)}px rgba(255,178,154,0.68)`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: x - mix(220, 690, intensity),
          top: height * VANISH_Y - 3,
          width: mix(440, 1380, intensity),
          height: mix(2, 8, intensity),
          opacity: intensity * 0.62,
          filter: 'blur(2px)',
          background:
            'linear-gradient(90deg, transparent, rgba(255,145,135,0.6), white, rgba(102,222,255,0.62), transparent)',
        }}
      />
    </AbsoluteFill>
  );
};

const FinishingLayer: React.FC<{phase: number}> = ({phase}) => {
  const pulse = 0.5 + 0.5 * Math.sin(TAU * phase * 4);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          opacity: 0.055 + pulse * 0.018,
          mixBlendMode: 'screen',
          background:
            'repeating-linear-gradient(180deg, rgba(140,210,255,0.22) 0px, rgba(140,210,255,0.22) 1px, transparent 1px, transparent 4px)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50.6% 49.3%, transparent 0%, transparent 58%, rgba(0,0,12,0.28) 79%, rgba(0,0,8,0.68) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const phase = frame / durationInFrames;
  const travel = phase * DEPTH_PERIOD;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#010516',
        overflow: 'hidden',
      }}
    >
      <Backdrop />
      <StarField travel={travel * 3} phase={phase} />
      <LightShaftField travel={travel * 2} phase={phase} />
      <NoteField travel={travel} phase={phase} />
      <NearLensBloom travel={travel} />
      <FinishingLayer phase={phase} />
    </AbsoluteFill>
  );
};
