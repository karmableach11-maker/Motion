import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const CYCLE_FRAMES = 225;
const TAU = Math.PI * 2;

// The source resolves to roughly 34 visible columns by 15 visible rows.
// Two overflow rows/columns keep the field full-bleed at every edge.
const COLS = 36;
const ROWS = 17;
const CELL_W = 58;
const CELL_H = 74;
const FONT_SIZE = 47;
const GRID_X = -84;
const GRID_Y = -72;

type Cell = {
  readonly id: number;
  readonly col: number;
  readonly row: number;
  readonly phaseOffset: number;
  readonly changes: number;
  readonly baseOpacity: number;
  readonly hotBias: number;
  readonly lightPhase: number;
  readonly lightRate: number;
};

type ShadowBand = {
  readonly x: number;
  readonly width: number;
  readonly opacity: number;
  readonly phase: number;
  readonly rate: number;
};

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const fract = (value: number): number => value - Math.floor(value);

const mod = (value: number, divisor: number): number =>
  ((value % divisor) + divisor) % divisor;

const hash01 = (input: number): number => {
  let value = input | 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
};

const bitForState = (cellId: number, state: number): "0" | "1" =>
  hash01(cellId * 92821 + state * 68917 + 2207) > 0.5 ? "1" : "0";

const CELLS: readonly Cell[] = Array.from(
  {length: COLS * ROWS},
  (_, id) => {
    const col = id % COLS;
    const row = Math.floor(id / COLS);

    return {
      id,
      col,
      row,
      phaseOffset: hash01(id * 104729 + 71),
      changes: 3 + Math.floor(hash01(id * 8191 + 131) * 3),
      baseOpacity: 0.46 + hash01(id * 31337 + 409) * 0.5,
      hotBias: hash01(id * 49999 + 907),
      lightPhase: hash01(id * 19391 + 17) * TAU,
      lightRate: 1 + Math.floor(hash01(id * 65537 + 401) * 3),
    };
  },
);

const SHADOW_BANDS: readonly ShadowBand[] = Array.from(
  {length: 7},
  (_, index) => ({
    x: -180 + index * 340 + hash01(index * 8837 + 29) * 120,
    width: 190 + hash01(index * 40507 + 53) * 250,
    opacity: 0.1 + hash01(index * 22343 + 97) * 0.12,
    phase: hash01(index * 49999 + 151) * TAU,
    rate: 1 + Math.floor(hash01(index * 27127 + 211) * 2),
  }),
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const cycleFrame = mod(frame, CYCLE_FRAMES);
  const cycleT = cycleFrame / CYCLE_FRAMES;
  const phase = cycleT * TAU;

  const cellStates = CELLS.map((cell) => {
    const localCycle = fract(cycleT + cell.phaseOffset);
    const stateFloat = localCycle * cell.changes;
    const state = Math.floor(stateFloat);
    const stateT = fract(stateFloat);

    // The glyph fades to near-black around each state boundary. Its value
    // changes only there, so a 0-to-1 switch never resembles a morph.
    const boundaryDistance = Math.min(stateT, 1 - stateT);
    const glyphReveal = smoothstep(0.025, 0.19, boundaryDistance);
    const bit = bitForState(cell.id, state);

    const personalLight =
      0.5 +
      0.5 *
        Math.sin(phase * cell.lightRate + cell.lightPhase + cell.row * 0.07);
    const regionA =
      0.5 +
      0.5 *
        Math.sin(
          cell.col * 0.47 +
            cell.row * 0.82 +
            phase * 2 +
            Math.sin(cell.row * 0.41) * 0.55,
        );
    const regionB =
      0.5 +
      0.5 *
        Math.sin(
          cell.col * 0.19 -
            cell.row * 0.56 -
            phase * 3 +
            Math.sin(cell.col * 0.23) * 0.7,
        );

    const regionalEnergy =
      regionA * 0.48 + regionB * 0.27 + personalLight * 0.25;
    const tileEnergy = clamp(
      (regionalEnergy + cell.hotBias * 0.27 - 0.45) / 0.55,
    );
    const tile = Math.pow(tileEnergy, 1.65);
    const hot = Math.pow(tileEnergy, 2.8);
    const glyphOpacity = clamp(
      cell.baseOpacity *
        (0.1 + glyphReveal * 0.9) *
        (0.72 + personalLight * 0.2) +
        tile * 0.25,
      0.025,
      0.98,
    );

    const red = Math.round(4 + tile * 50);
    const green = Math.round(98 + tile * 148);
    const blue = Math.round(6 + tile * 63);

    return {
      ...cell,
      bit,
      glyphOpacity,
      tile,
      hot,
      fill: `rgb(${red}, ${green}, ${blue})`,
      x: GRID_X + cell.col * CELL_W,
      y: GRID_Y + cell.row * CELL_H,
      cx: GRID_X + cell.col * CELL_W + CELL_W * 0.5,
      baseline:
        GRID_Y +
        cell.row * CELL_H +
        CELL_H * 0.5 +
        FONT_SIZE * 0.34,
    };
  });

  const hazeX1 = 29 + Math.sin(phase) * 7;
  const hazeY1 = 38 + Math.cos(phase * 2) * 6;
  const hazeX2 = 73 + Math.cos(phase + 0.8) * 8;
  const hazeY2 = 67 + Math.sin(phase * 3 - 0.5) * 5;
  const scanOpacity = 0.09 + (0.5 + 0.5 * Math.sin(phase * 4)) * 0.035;

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#000402",
        filter: "brightness(1.3) saturate(1.08)",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(ellipse 48% 43% at ${hazeX1}% ${hazeY1}%, rgba(8, 92, 14, 0.48) 0%, rgba(2, 38, 7, 0.28) 48%, transparent 78%), radial-gradient(ellipse 43% 38% at ${hazeX2}% ${hazeY2}%, rgba(8, 76, 13, 0.4) 0%, rgba(1, 29, 5, 0.21) 55%, transparent 82%), linear-gradient(180deg, #001609 0%, #031309 47%, #001207 100%)`,
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0, display: "block"}}
      >
        <defs>
          <filter
            id="m22-tile-bloom"
            x="-30%"
            y="-45%"
            width="160%"
            height="190%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="13" />
          </filter>
          <filter
            id="m22-glyph-bloom"
            x="-20%"
            y="-30%"
            width="140%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="5.2" />
          </filter>
          <linearGradient
            id="m22-soft-green"
            x1="0"
            y1="0"
            x2={WIDTH}
            y2={HEIGHT}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#00a710" />
            <stop offset="0.46" stopColor="#20e82c" />
            <stop offset="0.72" stopColor="#0fbd1a" />
            <stop offset="1" stopColor="#05720b" />
          </linearGradient>
        </defs>

        <g
          filter="url(#m22-tile-bloom)"
          fill="url(#m22-soft-green)"
          style={{mixBlendMode: "screen"}}
        >
          {cellStates.map((cell) =>
            cell.tile > 0.025 ? (
              <rect
                key={`tile-bloom-${cell.id}`}
                x={cell.x - 1}
                y={cell.y + 8}
                width={CELL_W + 2}
                height={CELL_H - 16}
                rx={5}
                opacity={cell.tile * 0.68}
              />
            ) : null,
          )}
        </g>

        <g fill="#12c81c" style={{mixBlendMode: "screen"}}>
          {cellStates.map((cell) =>
            cell.tile > 0.02 ? (
              <rect
                key={`tile-${cell.id}`}
                x={cell.x}
                y={cell.y + 8}
                width={CELL_W + 0.8}
                height={CELL_H - 16}
                rx={2.5}
                fillOpacity={cell.tile * 0.32}
                stroke="#45f14e"
                strokeOpacity={cell.hot * 0.22}
                strokeWidth={0.8}
              />
            ) : null,
          )}
        </g>

        <g
          filter="url(#m22-glyph-bloom)"
          fill="#32f642"
          fontFamily='"DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace'
          fontSize={FONT_SIZE}
          fontWeight={500}
          textAnchor="middle"
          style={{mixBlendMode: "screen"}}
        >
          {cellStates.map((cell) => (
            <text
              key={`glyph-bloom-${cell.id}`}
              x={cell.cx}
              y={cell.baseline}
              opacity={cell.glyphOpacity * (0.16 + cell.tile * 0.44)}
            >
              {cell.bit}
            </text>
          ))}
        </g>

        <g
          fontFamily='"DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace'
          fontSize={FONT_SIZE}
          fontWeight={400}
          textAnchor="middle"
          style={{mixBlendMode: "screen"}}
        >
          {cellStates.map((cell) => (
            <text
              key={`glyph-${cell.id}`}
              x={cell.cx}
              y={cell.baseline}
              fill={cell.fill}
              opacity={cell.glyphOpacity}
            >
              {cell.bit}
            </text>
          ))}
        </g>
      </svg>

      {SHADOW_BANDS.map((band, index) => {
        const offset =
          Math.sin(phase * band.rate + band.phase) * (30 + index * 3);
        return (
          <div
            key={`shadow-band-${index}`}
            style={{
              position: "absolute",
              left: band.x + offset,
              top: -130,
              width: band.width,
              height: HEIGHT + 260,
              borderRadius: "50%",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(0, 3, 1, 0.88) 42%, rgba(0, 2, 1, 0.92) 58%, transparent 100%)",
              filter: "blur(62px)",
              opacity: band.opacity,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: scanOpacity,
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(0, 0, 0, 0.42) 4px, transparent 5px)",
        }}
      />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.08,
          mixBlendMode: "screen",
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 57px, rgba(29, 255, 45, 0.12) 58px, transparent 59px)",
        }}
      />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(ellipse 74% 72% at 50% 49%, transparent 34%, rgba(0, 7, 2, 0.17) 66%, rgba(0, 2, 1, 0.76) 100%), linear-gradient(90deg, rgba(0, 3, 1, 0.55) 0%, transparent 12%, transparent 86%, rgba(0, 2, 1, 0.62) 100%), linear-gradient(180deg, rgba(0, 2, 1, 0.58) 0%, transparent 14%, transparent 82%, rgba(0, 2, 1, 0.66) 100%)",
          boxShadow:
            "inset 90px 0 150px rgba(0, 0, 0, 0.42), inset -110px 0 170px rgba(0, 0, 0, 0.5), inset 0 85px 150px rgba(0, 0, 0, 0.32), inset 0 -100px 180px rgba(0, 0, 0, 0.46)",
        }}
      />
    </AbsoluteFill>
  );
};
s
