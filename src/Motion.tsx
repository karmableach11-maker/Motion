import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;
const LAST_FRAME = 899;
const COMPLETE_FRAME = 825;
const REFERENCE_DURATION = 11.966667;
const CAMERA_SPEED = 0.0606244;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

type Point = {x: number; y: number};

/**
 * Projective plane fitted from the reference rail caps and fill edge.
 * The camera advances along local U; screen-space motion is the resulting
 * down-left perspective track, shared by every world-plane element.
 */
const project = (u: number, v: number, cameraU: number): Point | null => {
  const q = u - cameraU;
  const denominator = 1.2153094 * q - 0.02508123 * v + 1;

  if (denominator <= 0.08) {
    return null;
  }

  return {
    x:
      ((2.56544607 * q + 0.12461254 * v + 0.24724309) /
        denominator) *
      WIDTH,
    y:
      ((-0.46394746 * q + 0.28359207 * v + 0.50339183) /
        denominator) *
      HEIGHT,
  };
};

const pointsToString = (points: Array<Point | null>) => {
  if (points.some((point) => point === null)) {
    return null;
  }

  return (points as Point[])
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ');
};

const planePolygon = (
  cameraU: number,
  corners: Array<[number, number]>,
) => pointsToString(corners.map(([u, v]) => project(u, v, cameraU)));

const planeLine = (
  cameraU: number,
  start: [number, number],
  end: [number, number],
) => {
  const a = project(start[0], start[1], cameraU);
  const b = project(end[0], end[1], cameraU);
  return a && b ? `M ${a.x} ${a.y} L ${b.x} ${b.y}` : null;
};

const hash = (value: number) => {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Tile = {
  u: number;
  v: number;
  du: number;
  dv: number;
  opacity: number;
};

const TILE_ROWS = [
  -2.7,
  -2.45,
  -2.2,
  -1.82,
  -1.42,
  -1.05,
  -0.75,
  1.35,
  1.7,
  2.0,
  2.3,
  2.62,
  2.9,
];

const TILES: Tile[] = TILE_ROWS.flatMap((v, row) =>
  Array.from({length: 14}, (_, column) => {
    const seed = row * 97 + column * 17;
    return {
      u: -0.12 + column * 0.17 + (row % 2) * 0.036,
      v: v + (hash(seed + 1) - 0.5) * 0.065,
      du: 0.012 + hash(seed + 2) * 0.016,
      dv: 0.1 + hash(seed + 3) * 0.15,
      opacity: 0.18 + hash(seed + 4) * 0.28,
    };
  }).filter((_, column) => (column * 7 + row * 11) % 5 !== 0),
);

const tilePolygon = (tile: Tile, cameraU: number) => {
  const polygon = planePolygon(cameraU, [
    [tile.u, tile.v],
    [tile.u + tile.du, tile.v],
    [tile.u + tile.du, tile.v + tile.dv],
    [tile.u, tile.v + tile.dv],
  ]);

  if (!polygon) {
    return null;
  }

  const points = polygon.split(' ').map((pair) => pair.split(',').map(Number));
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  if (
    maxX < -80 ||
    minX > WIDTH + 80 ||
    maxY < -80 ||
    minY > HEIGHT + 80 ||
    maxX - minX > 180 ||
    maxY - minY > 180
  ) {
    return null;
  }

  return polygon;
};

const ProjectedGrid: React.FC<{cameraU: number}> = ({cameraU}) => {
  const laneValues = [-2.46, -2.05, -1.67, -1.33, -1.02, -0.73, 1.34, 1.64, 1.96, 2.32, 2.7];
  const columnValues = [0.04, 0.28, 0.53, 0.81, 1.09, 1.38, 1.67, 1.96];

  return (
    <g>
      <g opacity={0.68}>
        {TILES.map((tile, index) => {
          const polygon = tilePolygon(tile, cameraU);
          if (!polygon) {
            return null;
          }

          return (
            <polygon
              key={index}
              points={polygon}
              fill={index % 13 === 0 ? '#EAF7E8' : '#9FE7ED'}
              opacity={tile.opacity}
            />
          );
        })}
      </g>

      <g fill="none" stroke="#6FC9D4" strokeWidth={1.15} opacity={0.038}>
        {laneValues.map((v) => {
          const path = planeLine(cameraU, [-0.04, v], [2.14, v]);
          return path ? <path key={`lane-${v}`} d={path} /> : null;
        })}
        {columnValues.map((u, index) => {
          const upper = planeLine(cameraU, [u, -2.5], [u, -0.7]);
          const lower = planeLine(cameraU, [u, 1.33], [u, 2.72]);
          return (
            <React.Fragment key={`column-${index}`}>
              {upper ? <path d={upper} /> : null}
              {lower ? <path d={lower} /> : null}
            </React.Fragment>
          );
        })}
      </g>
    </g>
  );
};

const glyphMatrix = (u: number, v: number, cameraU: number) => {
  const origin = project(u, v, cameraU);
  const alongU = project(u + 0.001, v, cameraU);
  const alongV = project(u, v + 0.001, cameraU);

  if (!origin || !alongU || !alongV) {
    return null;
  }

  const du = {
    x: (alongU.x - origin.x) / 0.001,
    y: (alongU.y - origin.y) / 0.001,
  };
  const dv = {
    x: (alongV.x - origin.x) / 0.001,
    y: (alongV.y - origin.y) / 0.001,
  };

  const localXPerPixel = 0.0004;
  const localVPerPixel = 0.0054;

  return `matrix(${du.x * localXPerPixel} ${du.y * localXPerPixel} ${
    dv.x * localVPerPixel
  } ${dv.y * localVPerPixel} ${origin.x} ${origin.y})`;
};

const ProjectedLabel: React.FC<{
  cameraU: number;
  percentage: number;
}> = ({cameraU, percentage}) => {
  const content = `DOWNLOADING FILES ${percentage}%`;
  const startU = 0.2;
  const stepU = 0.025;

  return (
    <g opacity={0.96} fill="#EAF7F5" stroke="#89E8F0" strokeWidth={0.18}>
      {Array.from(content).map((character, index) => {
        if (character === ' ') {
          return null;
        }

        const transform = glyphMatrix(startU + index * stepU, -0.025, cameraU);
        if (!transform) {
          return null;
        }

        return (
          <text
            key={`${index}-${character}`}
            transform={transform}
            x={0}
            y={0}
            textAnchor="middle"
            fontFamily="Nimbus Sans Narrow, Arial Narrow, sans-serif"
            fontSize={100}
            fontWeight={400}
          >
            {character}
          </text>
        );
      })}
    </g>
  );
};

const ProgressInterface: React.FC<{
  cameraU: number;
  progress: number;
  percentage: number;
}> = ({cameraU, progress, percentage}) => {
  const outer = planePolygon(cameraU, [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]);
  const inner = planePolygon(cameraU, [
    [0.008, 0.042],
    [0.992, 0.042],
    [0.992, 0.958],
    [0.008, 0.958],
  ]);
  const lowerEcho = planeLine(cameraU, [0.004, 1.035], [0.996, 1.035]);
  const lowerEchoTwo = planeLine(cameraU, [0.01, 1.075], [0.985, 1.075]);

  const fillEnd = 0.012 + progress * 0.976;
  const fill =
    progress > 0
      ? planePolygon(cameraU, [
          [0.012, 0.075],
          [fillEnd, 0.075],
          [fillEnd, 0.925],
          [0.012, 0.925],
        ])
      : null;
  const fillHighlight =
    progress > 0
      ? planePolygon(cameraU, [
          [0.012, 0.075],
          [fillEnd, 0.075],
          [fillEnd, 0.23],
          [0.012, 0.23],
        ])
      : null;
  const fillTip =
    progress > 0
      ? planeLine(cameraU, [fillEnd, 0.085], [fillEnd, 0.915])
      : null;

  return (
    <g>
      <ProjectedLabel cameraU={cameraU} percentage={percentage} />

      {outer ? (
        <polygon
          points={outer}
          fill="rgba(4, 16, 21, 0.2)"
          stroke="#74E5F3"
          strokeWidth={9}
          opacity={0.08}
        />
      ) : null}

      {fill ? <polygon points={fill} fill="url(#fill-gradient)" /> : null}
      {fillHighlight ? (
        <polygon points={fillHighlight} fill="url(#fill-highlight)" opacity={0.52} />
      ) : null}
      {fillTip ? (
        <path d={fillTip} fill="none" stroke="#F9FFFF" strokeWidth={2.3} opacity={0.52} />
      ) : null}

      {outer ? (
        <polygon
          points={outer}
          fill="none"
          stroke="#A9F5FB"
          strokeWidth={2.7}
          opacity={0.92}
        />
      ) : null}
      {inner ? (
        <polygon
          points={inner}
          fill="none"
          stroke="#D9FCFF"
          strokeWidth={1.15}
          opacity={0.43}
        />
      ) : null}
      {lowerEcho ? (
        <path d={lowerEcho} fill="none" stroke="#85EAF3" strokeWidth={1.25} opacity={0.34} />
      ) : null}
      {lowerEchoTwo ? (
        <path d={lowerEchoTwo} fill="none" stroke="#83CBD2" strokeWidth={0.9} opacity={0.18} />
      ) : null}
    </g>
  );
};

/**
 * Lucide-inspired download glyph rebuilt in the projected world plane.
 * Keeping the geometry local avoids the pasted-on look of a screen-space icon
 * while the open tray stays legible at the most oblique camera checkpoint.
 */
const DownloadGlyph: React.FC<{cameraU: number}> = ({cameraU}) => {
  const stem = planeLine(cameraU, [1.048, 0.17], [1.048, 0.57]);
  const arrow = pointsToString([
    project(1.024, 0.43, cameraU),
    project(1.048, 0.63, cameraU),
    project(1.072, 0.43, cameraU),
  ]);
  const tray = pointsToString([
    project(1.018, 0.67, cameraU),
    project(1.018, 0.77, cameraU),
    project(1.026, 0.84, cameraU),
    project(1.07, 0.84, cameraU),
    project(1.078, 0.77, cameraU),
    project(1.078, 0.67, cameraU),
  ]);

  if (!stem || !arrow || !tray) {
    return null;
  }

  return (
    <g>
      <g
        fill="none"
        stroke="#4ADBE9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.18}
      >
        <path d={stem} strokeWidth={13} />
        <polyline points={arrow} strokeWidth={13} />
        <polyline points={tray} strokeWidth={13} />
      </g>
      <g
        fill="none"
        stroke="#C7FBFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.98}
      >
        <path d={stem} strokeWidth={4.2} />
        <polyline points={arrow} strokeWidth={4.2} />
        <polyline points={tray} strokeWidth={4.2} />
      </g>
    </g>
  );
};

const ScreenLighting: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        right: -420,
        top: -420,
        width: 1000,
        height: 900,
        borderRadius: '50%',
        background:
          'radial-gradient(ellipse at center, rgba(76, 235, 255, 0.54) 0%, rgba(26, 154, 190, 0.2) 25%, rgba(5, 45, 62, 0.04) 57%, transparent 74%)',
        mixBlendMode: 'screen',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: -310,
        bottom: -350,
        width: 1110,
        height: 980,
        borderRadius: '50%',
        background:
          'radial-gradient(ellipse at center, rgba(255, 132, 64, 0.23) 0%, rgba(126, 55, 27, 0.1) 30%, transparent 72%)',
        mixBlendMode: 'screen',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: -220,
        top: 150,
        width: 1180,
        height: 2,
        background:
          'linear-gradient(90deg, transparent, rgba(108, 236, 255, 0.08), rgba(184, 251, 255, 0.38), transparent)',
        transform: 'rotate(-16.5deg)',
        transformOrigin: 'right center',
      }}
    />
    <AbsoluteFill
      style={{
        boxShadow:
          'inset 0 0 180px rgba(0, 0, 0, 0.56), inset 0 0 520px rgba(0, 0, 0, 0.3)',
      }}
    />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const referenceTime = interpolate(
    frame,
    [0, LAST_FRAME],
    [0, REFERENCE_DURATION],
    clamp,
  );
  const cameraU = referenceTime * CAMERA_SPEED;
  const progress = interpolate(frame, [0, COMPLETE_FRAME], [0, 1], clamp);
  const percentage =
    frame >= COMPLETE_FRAME ? 100 : Math.floor(progress * 100);
  const seconds = frame / 60;
  const tileFlowX = -220 * seconds;
  const tileFlowY = 95 * seconds;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse 84% 94% at 72% 28%, #0B2830 0%, #07171D 29%, #040C10 61%, #020507 100%)',
      }}
    >
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="fill-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#FFF8E8" />
            <stop offset="0.46" stopColor="#EAF8F1" />
            <stop offset="1" stopColor="#AEEEF1" />
          </linearGradient>
          <linearGradient id="fill-highlight" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0.92} />
          </linearGradient>
          <pattern
            id="measured-tile-flow"
            width={340}
            height={230}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${tileFlowX} ${tileFlowY})`}
          >
            <rect
              x={42}
              y={46}
              width={20}
              height={9}
              rx={1.5}
              fill="#B3ECEF"
              opacity={0.22}
              transform="rotate(-16 52 50.5)"
            />
            <rect
              x={216}
              y={154}
              width={14}
              height={7}
              rx={1}
              fill="#91DDE4"
              opacity={0.15}
              transform="rotate(-16 223 157.5)"
            />
          </pattern>
        </defs>

        <rect
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          fill="url(#measured-tile-flow)"
          opacity={0.4}
        />
        <ProjectedGrid cameraU={cameraU} />
        <ProgressInterface
          cameraU={cameraU}
          progress={progress}
          percentage={percentage}
        />
        {frame >= COMPLETE_FRAME ? <DownloadGlyph cameraU={cameraU} /> : null}
      </svg>

      <ScreenLighting />
    </AbsoluteFill>
  );
};
