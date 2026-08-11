import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TAU = Math.PI * 2;
const REFERENCE_SECONDS = 30;

const COLORS = {
  ink: "#010914",
  cyan: "#67f5ff",
  cyanSoft: "#c3fdff",
  teal: "#25d8e7",
  blue: "#3989ff",
  violet: "#8d67ff",
  magenta: "#e65cff",
  coral: "#ff807d",
  yellow: "#edee69",
  lime: "#9df294",
  white: "#f4feff",
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const mix = (a: number, b: number, amount: number) =>
  a + (b - a) * amount;

const fract = (value: number) => value - Math.floor(value);

const hash = (value: number) =>
  fract(Math.sin(value * 127.1 + 311.7) * 43758.5453123);

const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

const cycleFade = (depth: number) =>
  smoothstep(0.015, 0.11, depth) * (1 - smoothstep(0.86, 0.995, depth));

const perspectiveScale = (depth: number) =>
  0.11 + Math.pow(depth, 2.22) * 2.34;

const depthBlur = (depth: number, maximum = 7) => {
  const farBlur = (1 - smoothstep(0.04, 0.23, depth)) * maximum * 0.34;
  const nearBlur = smoothstep(0.76, 0.98, depth) * maximum;
  return farBlur + nearBlur;
};

const eventProgress = (time: number, start: number, end: number) =>
  clamp((time - start) / (end - start));

const eventOpacity = (progress: number, fadeOut = 0.82) =>
  smoothstep(0, 0.13, progress) * (1 - smoothstep(fadeOut, 1, progress));

type ViewState = {
  width: number;
  height: number;
  refTime: number;
  vanishingX: number;
  vanishingY: number;
  cameraX: number;
  cameraY: number;
};

type CircuitSpec = {
  id: number;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  shape: number;
  color: string;
  accent: boolean;
};

type GlyphSpec = {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  rows: number;
  binary: boolean;
  opacity: number;
};

type PacketSpec = {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  phase: number;
  blur: number;
};

type SparkSpec = {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  radius: number;
  phase: number;
  color: string;
};

const CIRCUIT_COLORS = [
  COLORS.cyanSoft,
  COLORS.cyan,
  COLORS.cyan,
  COLORS.teal,
  COLORS.blue,
  COLORS.violet,
  COLORS.yellow,
];

const PACKET_COLORS = [
  COLORS.cyan,
  COLORS.blue,
  COLORS.cyanSoft,
  COLORS.magenta,
  COLORS.violet,
  COLORS.coral,
  COLORS.yellow,
  COLORS.lime,
];

const makeCircuitSpecs = (
  count: number,
  seedOffset: number,
  speedMin: number,
  speedMax: number,
  sizeMultiplier: number,
  opacityMultiplier: number,
): CircuitSpec[] =>
  Array.from({length: count}, (_, index) => {
    const id = seedOffset + index;
    const region = Math.floor(hash(id + 1.3) * 5);
    let x = mix(-0.63, 0.63, hash(id + 3.1));
    let y = mix(-0.47, 0.52, hash(id + 5.7));

    if (region === 0) {
      x = -mix(0.2, 0.68, hash(id + 7.4));
    } else if (region === 1) {
      x = mix(0.2, 0.68, hash(id + 7.4));
    } else if (region === 2) {
      y = mix(0.17, 0.55, hash(id + 9.6));
    } else if (region === 3) {
      y = -mix(0.16, 0.49, hash(id + 9.6));
    }

    const accent = hash(id + 12.8) > 0.87;
    const colorIndex = accent
      ? 3 + Math.floor(hash(id + 15.2) * (CIRCUIT_COLORS.length - 3))
      : Math.floor(hash(id + 15.2) * 4);

    return {
      id,
      x,
      y,
      z: hash(id + 18.1),
      width: mix(0.014, 0.082, hash(id + 20.4)) * sizeMultiplier,
      height: mix(0.008, 0.058, hash(id + 22.7)) * sizeMultiplier,
      speed: mix(speedMin, speedMax, hash(id + 25.9)),
      opacity: mix(0.28, 0.88, hash(id + 27.6)) * opacityMultiplier,
      shape: Math.floor(hash(id + 31.4) * 7),
      color: CIRCUIT_COLORS[colorIndex],
      accent,
    };
  });

const FAR_CIRCUITS = makeCircuitSpecs(108, 100, 0.014, 0.022, 0.72, 0.86);
const MID_CIRCUITS = makeCircuitSpecs(178, 400, 0.026, 0.041, 1, 1.12);
const NEAR_CIRCUITS = makeCircuitSpecs(62, 800, 0.044, 0.067, 1.42, 0.96);
const DETAIL_CIRCUITS = makeCircuitSpecs(490, 920, 0.019, 0.047, 0.39, 0.92);

const GLYPHS: GlyphSpec[] = Array.from({length: 46}, (_, index) => {
  const id = 1200 + index;
  const side = hash(id + 1) > 0.5 ? 1 : -1;
  const binary = index % 3 === 0;
  return {
    id,
    x: side * mix(binary ? 0.18 : 0.25, 0.73, hash(id + 3.2)),
    y: mix(-0.43, 0.49, hash(id + 5.6)),
    z: hash(id + 7.9),
    speed: mix(0.019, 0.042, hash(id + 11.4)),
    rows: binary ? 1 : 3 + Math.floor(hash(id + 13.8) * 5),
    binary,
    opacity: mix(0.34, 0.75, hash(id + 16.2)),
  };
});

const PACKETS: PacketSpec[] = Array.from({length: 92}, (_, index) => {
  const id = 1600 + index;
  const colorRoll = hash(id + 1.7);
  const colorIndex =
    colorRoll < 0.55
      ? Math.floor(colorRoll * 5.45)
      : 2 + Math.floor(hash(id + 3.4) * (PACKET_COLORS.length - 2));
  return {
    id,
    x: mix(-0.78, 0.78, hash(id + 5.8)),
    y: mix(-0.49, 0.53, hash(id + 8.1)),
    z: hash(id + 10.5),
    speed: mix(0.029, 0.071, hash(id + 12.9)),
    width: mix(0.005, 0.027, hash(id + 15.2)),
    height: mix(0.002, 0.008, hash(id + 17.6)),
    color: PACKET_COLORS[colorIndex],
    opacity: mix(0.48, 0.96, hash(id + 20.2)),
    phase: hash(id + 22.5) * TAU,
    blur: hash(id + 24.8) > 0.78 ? mix(1.2, 3.2, hash(id + 27.1)) : 0,
  };
});

const SPARKS: SparkSpec[] = Array.from({length: 620}, (_, index) => {
  const id = 2100 + index;
  return {
    id,
    x: mix(-0.82, 0.82, hash(id + 1.1)),
    y: mix(-0.54, 0.58, hash(id + 3.7)),
    z: hash(id + 6.2),
    speed: mix(0.021, 0.06, hash(id + 8.8)),
    radius: mix(0.82, 3.15, hash(id + 11.5)),
    phase: hash(id + 14.1) * TAU,
    color: hash(id + 16.7) > 0.9 ? PACKET_COLORS[3 + (index % 5)] : COLORS.cyan,
  };
});

const BOKEH: PacketSpec[] = Array.from({length: 52}, (_, index) => {
  const id = 2600 + index;
  return {
    id,
    x: mix(-0.72, 0.72, hash(id + 1.9)),
    y: mix(-0.48, 0.52, hash(id + 4.5)),
    z: hash(id + 7.2),
    speed: mix(0.035, 0.074, hash(id + 9.8)),
    width: mix(0.01, 0.052, hash(id + 12.4)),
    height: mix(0.003, 0.015, hash(id + 15.1)),
    color: PACKET_COLORS[Math.floor(hash(id + 17.7) * PACKET_COLORS.length)],
    opacity: mix(0.24, 0.66, hash(id + 20.3)),
    phase: hash(id + 22.9) * TAU,
    blur: mix(7, 24, hash(id + 25.6)),
  };
});

const PSEUDO_CODE = [
  "FLOW.NODE // 0x7A",
  "NET:LINK + 001101",
  "VECTOR.SYNC [24]",
  "DATA/PULSE :: 08",
  "CACHE.NODE <A3>",
  "SIGNAL_ROUTE 1101",
  "LAYER.MAP / 64",
  "STREAM :: ACTIVE",
];

const BINARY_ROWS = [
  "1\n0\n1\n1\n0\n0\n1",
  "0\n1\n0\n1\n0\n1\n1",
  "1\n1\n0\n0\n1\n0\n1",
  "0\n0\n1\n1\n0\n1\n0",
];

const projectedPoint = (
  spec: {x: number; y: number; z: number; speed: number},
  view: ViewState,
) => {
  const depth = mod(spec.z + view.refTime * spec.speed, 1);
  const scale = perspectiveScale(depth);
  const parallax = 0.35 + depth * 0.85;
  const x =
    view.vanishingX +
    (spec.x - view.cameraX * parallax) * view.width * scale;
  const y =
    view.vanishingY +
    (spec.y - view.cameraY * parallax) * view.height * scale;
  return {depth, scale, x, y, opacity: cycleFade(depth)};
};

const Atmosphere: React.FC<{view: ViewState}> = ({view}) => {
  const breathe = 0.93 + Math.sin(view.refTime * 0.72) * 0.045;
  const shaftShift = Math.sin(view.refTime * 0.18) * view.width * 0.006;
  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: COLORS.ink}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 49%, rgba(39,216,227,.50) 0%, rgba(9,84,105,.33) 29%, rgba(3,16,29,0) 67%), linear-gradient(180deg, #082b45 0%, #051a2d 48%, #02101d 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "36.5%",
          top: "-15%",
          width: "27%",
          height: "79%",
          opacity: 0.61 * breathe,
          transform: `translateX(${shaftShift}px) scaleX(${breathe})`,
          transformOrigin: "50% 0%",
          background:
            "linear-gradient(180deg, rgba(195,255,255,.9), rgba(50,237,245,.30) 28%, rgba(19,174,198,.10) 63%, transparent 100%)",
          borderRadius: "48% 48% 64% 64%",
          filter: "blur(68px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "48.25%",
          top: "-6%",
          width: "3.5%",
          height: "67%",
          opacity: 0.34 + Math.sin(view.refTime * 0.8 + 0.4) * 0.035,
          background:
            "linear-gradient(180deg, rgba(236,255,255,.95), rgba(96,249,250,.44) 28%, rgba(36,214,230,.14) 70%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(19px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "37.5%",
          top: "-10%",
          width: "25%",
          height: "47%",
          opacity: 0.55 + Math.sin(view.refTime * 0.9 + 1.2) * 0.05,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(221,255,255,.92), rgba(68,242,244,.25) 34%, transparent 74%)",
          filter: "blur(42px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "9%",
          right: "9%",
          bottom: "-19%",
          height: "49%",
          opacity: 0.42,
          background:
            "radial-gradient(ellipse at 52% 0%, rgba(36,228,239,.46), rgba(7,69,92,.16) 42%, transparent 74%)",
          filter: "blur(20px)",
        }}
      />
    </AbsoluteFill>
  );
};

const PerspectiveGrid: React.FC<{view: ViewState}> = ({view}) => {
  const {width, height, vanishingX, vanishingY, refTime} = view;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        opacity: 0.62,
        filter: "blur(.45px) drop-shadow(0 0 6px rgba(64,224,239,.34))",
      }}
    >
      {Array.from({length: 15}, (_, index) => {
        const edgeX = mix(-0.13 * width, 1.13 * width, index / 14);
        return (
          <path
            key={`floor-ray-${index}`}
            d={`M ${vanishingX} ${vanishingY + height * 0.02} L ${edgeX} ${height * 1.08}`}
            stroke={index % 5 === 0 ? COLORS.cyanSoft : COLORS.teal}
            strokeWidth={index % 5 === 0 ? 1.25 : 0.72}
            opacity={index % 5 === 0 ? 0.18 : 0.08}
          />
        );
      })}
      {Array.from({length: 9}, (_, index) => {
        const edgeX = mix(0.02 * width, 0.98 * width, index / 8);
        return (
          <path
            key={`ceiling-ray-${index}`}
            d={`M ${vanishingX} ${vanishingY - height * 0.02} L ${edgeX} ${-0.08 * height}`}
            stroke={COLORS.cyan}
            strokeWidth={0.65}
            opacity={0.055}
          />
        );
      })}
      {Array.from({length: 20}, (_, index) => {
        const depth = mod(index / 20 + refTime * 0.034, 1);
        const shaped = Math.pow(depth, 2.05);
        const y = vanishingY + height * (0.025 + shaped * 0.61);
        const halfWidth = width * (0.025 + shaped * 0.69);
        return (
          <path
            key={`cross-${index}`}
            d={`M ${vanishingX - halfWidth} ${y} H ${vanishingX + halfWidth}`}
            stroke={index % 6 === 0 ? COLORS.cyanSoft : COLORS.teal}
            strokeWidth={mix(0.5, 1.8, depth)}
            opacity={cycleFade(depth) * mix(0.035, 0.18, depth)}
          />
        );
      })}
    </svg>
  );
};

const circuitPath = (
  shape: number,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  switch (shape) {
    case 0:
      return `M ${x - width / 2} ${y} H ${x + width / 2} V ${y + height / 2}`;
    case 1:
      return `M ${x - width / 2} ${y + height / 2} V ${y - height / 2} H ${x + width / 2}`;
    case 2:
      return `M ${x - width / 2} ${y - height / 2} V ${y + height / 2} H ${x + width / 2} V ${y}`;
    case 3:
      return `M ${x - width / 2} ${y} H ${x - width * 0.08} V ${y + height / 2} H ${x + width / 2}`;
    case 4:
      return `M ${x - width / 2} ${y - height / 2} H ${x + width / 2}`;
    case 5:
      return `M ${x} ${y - height / 2} V ${y + height / 2}`;
    default:
      return `M ${x - width / 2} ${y + height / 2} H ${x} V ${y - height / 2} H ${x + width / 2}`;
  }
};

const CircuitLayer: React.FC<{
  specs: CircuitSpec[];
  view: ViewState;
  glow?: boolean;
  layerOpacity?: number;
}> = ({specs, view, glow = false, layerOpacity = 1}) => (
  <svg
    viewBox={`0 0 ${view.width} ${view.height}`}
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      overflow: "visible",
      opacity: layerOpacity,
      mixBlendMode: glow ? "screen" : "normal",
      filter: glow
        ? "blur(6px) drop-shadow(0 0 14px rgba(80,243,255,.62))"
        : "drop-shadow(0 0 5px rgba(94,246,255,.54))",
    }}
  >
    {specs.map((spec) => {
      const projected = projectedPoint(spec, view);
      const width = spec.width * view.width * projected.scale;
      const height = spec.height * view.height * projected.scale;
      const opacity =
        projected.opacity *
        spec.opacity *
        (0.65 + Math.sin(view.refTime * 2 + spec.id) * 0.3);
      if (opacity < 0.012) return null;
      const strokeWidth = mix(0.82, spec.accent ? 4.25 : 3.2, projected.depth ** 1.8);
      const blur = depthBlur(projected.depth, spec.accent ? 5 : 7.5);
      return (
        <g
          key={spec.id}
          opacity={opacity}
          style={
            glow || blur < 0.08
              ? undefined
              : {filter: `blur(${blur.toFixed(2)}px)`}
          }
        >
          <path
            d={circuitPath(
              spec.shape,
              projected.x,
              projected.y,
              width,
              height,
            )}
            fill="none"
            stroke={spec.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {spec.id % 2 === 0 ? (
            <path
              d={`M ${projected.x - width * 0.33} ${projected.y - height * 0.3} H ${projected.x + width * 0.19}`}
              fill="none"
              stroke={spec.color}
              strokeWidth={Math.max(0.5, strokeWidth * 0.62)}
              strokeLinecap="round"
              opacity={0.58}
            />
          ) : null}
          {spec.id % 5 === 0 ? (
            <path
              d={`M ${projected.x + width * 0.08} ${projected.y - height * 0.16} V ${projected.y + height * 0.24}`}
              fill="none"
              stroke={spec.color}
              strokeWidth={Math.max(0.45, strokeWidth * 0.52)}
              strokeLinecap="round"
              opacity={0.46}
            />
          ) : null}
          {spec.id % 3 === 0 ? (
            <circle
              cx={projected.x + width / 2}
              cy={projected.y + (spec.shape % 2 ? height / 2 : 0)}
              r={0.7 + projected.depth * 2.2}
              fill={spec.color}
            />
          ) : null}
        </g>
      );
    })}
  </svg>
);

const GlyphField: React.FC<{view: ViewState}> = ({view}) => (
  <svg
    viewBox={`0 0 ${view.width} ${view.height}`}
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      overflow: "visible",
      filter: "drop-shadow(0 0 4px rgba(81,231,245,.48))",
    }}
  >
    {GLYPHS.map((spec) => {
      const projected = projectedPoint(spec, view);
      const flicker = 0.64 + Math.sin(view.refTime * 3.2 + spec.id * 0.71) * 0.34;
      const opacity = projected.opacity * spec.opacity * flicker;
      if (opacity < 0.025) return null;
      const fontSize = mix(5, 14.5, projected.depth ** 1.75);
      const color = spec.id % 9 === 0 ? COLORS.cyanSoft : COLORS.cyan;
      if (spec.binary) {
        return (
          <text
            key={spec.id}
            x={projected.x}
            y={projected.y}
            fill={color}
            opacity={opacity * 0.88}
            fontSize={fontSize}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            textAnchor="middle"
            style={{
              whiteSpace: "pre",
              filter: `blur(${depthBlur(projected.depth, 6).toFixed(2)}px)`,
            }}
          >
            {BINARY_ROWS[spec.id % BINARY_ROWS.length]
              .split("\n")
              .map((line, row) => (
                <tspan key={row} x={projected.x} dy={row === 0 ? 0 : fontSize * 1.25}>
                  {line}
                </tspan>
              ))}
          </text>
        );
      }
      return (
        <text
          key={spec.id}
          x={projected.x}
          y={projected.y}
          fill={color}
          opacity={opacity * 0.72}
          fontSize={fontSize}
          fontWeight={500}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
          letterSpacing={fontSize * 0.02}
          style={{
            filter: `blur(${depthBlur(projected.depth, 6).toFixed(2)}px)`,
          }}
        >
          {Array.from({length: spec.rows}, (_, row) => (
            <tspan
              key={row}
              x={projected.x}
              dy={row === 0 ? 0 : fontSize * 1.23}
            >
              {PSEUDO_CODE[(spec.id + row) % PSEUDO_CODE.length]}
            </tspan>
          ))}
        </text>
      );
    })}
  </svg>
);

const PacketField: React.FC<{view: ViewState}> = ({view}) => (
  <svg
    viewBox={`0 0 ${view.width} ${view.height}`}
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      overflow: "visible",
      filter: "drop-shadow(0 0 6px rgba(98,238,255,.58))",
    }}
  >
    {SPARKS.map((spec) => {
      const projected = projectedPoint(spec, view);
      const flicker =
        0.02 +
        0.98 *
          Math.pow((Math.sin(view.refTime * 4.8 + spec.phase) + 1) / 2, 3.4);
      const opacity = projected.opacity * flicker * mix(0.5, 1, projected.depth);
      if (opacity < 0.025) return null;
      const radius = spec.radius * mix(0.55, 2.5, projected.depth ** 1.8);
      const blur = depthBlur(projected.depth, 4.5);
      return (
        <g
          key={spec.id}
          opacity={opacity}
          style={blur < 0.08 ? undefined : {filter: `blur(${blur.toFixed(2)}px)`}}
        >
          <circle cx={projected.x} cy={projected.y} r={radius} fill={spec.color} />
          {spec.id % 9 === 0 ? (
            <>
              <path
                d={`M ${projected.x - radius * 5} ${projected.y} H ${projected.x + radius * 5}`}
                stroke={spec.color}
                strokeWidth={Math.max(0.5, radius * 0.38)}
              />
              <path
                d={`M ${projected.x} ${projected.y - radius * 4} V ${projected.y + radius * 4}`}
                stroke={spec.color}
                strokeWidth={Math.max(0.5, radius * 0.32)}
              />
            </>
          ) : null}
        </g>
      );
    })}
    {PACKETS.map((spec) => {
      const projected = projectedPoint(spec, view);
      const pulse = 0.56 + Math.sin(view.refTime * 3.35 + spec.phase) * 0.42;
      const opacity = projected.opacity * spec.opacity * pulse;
      if (opacity < 0.025) return null;
      const width = spec.width * view.width * mix(0.62, 2.1, projected.depth ** 1.75);
      const height = spec.height * view.height * mix(0.72, 2.35, projected.depth ** 1.75);
      return (
        <rect
          key={spec.id}
          x={projected.x - width / 2}
          y={projected.y - height / 2}
          width={width}
          height={height}
          rx={height / 2}
          fill={spec.color}
          opacity={opacity}
          style={{
            filter: `blur(${(
              spec.blur * projected.depth +
              depthBlur(projected.depth, 5.5)
            ).toFixed(2)}px)`,
          }}
        />
      );
    })}
  </svg>
);

const BokehField: React.FC<{view: ViewState}> = ({view}) => (
  <svg
    viewBox={`0 0 ${view.width} ${view.height}`}
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      overflow: "visible",
      mixBlendMode: "screen",
    }}
  >
    {BOKEH.map((spec) => {
      const projected = projectedPoint(spec, view);
      const pulse = 0.62 + Math.sin(view.refTime * 2.2 + spec.phase) * 0.32;
      const opacity = projected.opacity * spec.opacity * pulse;
      if (opacity < 0.018) return null;
      const width =
        spec.width * view.width * mix(0.7, 4.5, projected.depth ** 2.05);
      const height =
        spec.height * view.height * mix(0.75, 4.1, projected.depth ** 1.95);
      return (
        <rect
          key={spec.id}
          x={projected.x - width / 2}
          y={projected.y - height / 2}
          width={width}
          height={height}
          rx={height / 2}
          fill={spec.color}
          opacity={opacity}
          style={{
            filter: `blur(${spec.blur * mix(0.35, 1, projected.depth)}px)`,
          }}
        />
      );
    })}
  </svg>
);

const NearPasses: React.FC<{view: ViewState}> = ({view}) => {
  const {width, height, refTime, vanishingX, vanishingY} = view;

  const blueP = eventProgress(refTime, 5.2, 5.75);
  const blueA = eventOpacity(blueP, 0.76);
  const blueScale = 0.35 + Math.pow(blueP, 2.1) * 2.4;
  const blueX = vanishingX - width * 0.3 * blueScale;
  const blueY = vanishingY + height * 0.22 * blueScale;

  const cyanP = eventProgress(refTime, 9.95, 10.5);
  const cyanA = eventOpacity(cyanP, 0.74);
  const cyanScale = 0.32 + Math.pow(cyanP, 2.05) * 2.6;
  const cyanX = vanishingX + width * 0.31 * cyanScale;
  const cyanY = vanishingY + height * 0.28 * cyanScale;

  const rightP = eventProgress(refTime, 17.7, 18.6);
  const rightA = eventOpacity(rightP, 0.83);
  const rightScale = 0.52 + Math.pow(rightP, 0.82) * 2.2;
  const rightX = vanishingX + width * 0.21 * rightScale;
  const rightY = vanishingY - height * 0.06 * rightScale;

  const warmP = eventProgress(refTime, 22.2, 23.6);
  const warmA = eventOpacity(warmP, 0.86);
  const warmScale = 0.34 + Math.pow(warmP, 2.15) * 2.75;
  const warmX = vanishingX - width * 0.08 * warmScale;
  const warmY =
    vanishingY + height * (0.14 + 0.26 * warmScale);

  const coralP = eventProgress(refTime, 24.2, 25.0);
  const coralA = eventOpacity(coralP, 0.84);
  const coralScale = 0.4 + Math.pow(coralP, 2.05) * 2.45;
  const coralCapsuleX = vanishingX - width * 0.022 * coralScale;
  const coralCapsuleY = vanishingY + height * 0.082 * coralScale;
  const coralLineX = vanishingX + width * 0.39 * coralScale;
  const coralCodeX = vanishingX + width * 0.11 * coralScale;
  const coralCodeY = vanishingY + height * 0.3 * coralScale;

  const flareP = eventProgress(refTime, 26.2, 27.35);
  const flareDistance =
    -1.223 + 34.228 / Math.max(27.286 - refTime, 0.04);
  const visualFlareDistance = Math.min(flareDistance, 430);
  const flareScale = clamp(visualFlareDistance / 66, 0.45, 6);
  const flareX = width * (0.5 - visualFlareDistance / 700);
  const flareY = height * 0.51;
  const flareA =
    smoothstep(26.2, 26.55, refTime) *
    (1 - smoothstep(27.24, 27.34, refTime));
  const stemDistance =
    refTime <= 27.23
      ? visualFlareDistance
      : Math.min(1300, 91.9 + 329 / Math.max(28.2 - refTime, 0.035));
  const stemX = width * (0.5 - stemDistance / 1850);
  const stemHeight =
    height * clamp(0.12 + stemDistance / 520, 0.18, 0.86);
  const stemA =
    smoothstep(26.2, 26.55, refTime) *
    (1 - smoothstep(27.78, 27.92, refTime));

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          filter: "drop-shadow(0 0 12px rgba(119,247,255,.72))",
        }}
      >
        <path
          d={`M ${blueX - width * 0.16 * blueScale} ${blueY} H ${blueX + width * 0.15 * blueScale} V ${blueY - height * 0.08 * blueScale}`}
          fill="none"
          stroke={COLORS.blue}
          strokeWidth={mix(3, 13, blueP)}
          strokeLinecap="round"
          opacity={blueA * 0.92}
        />
        <path
          d={`M ${cyanX - width * 0.12 * cyanScale} ${cyanY} H ${cyanX + width * 0.11 * cyanScale} V ${cyanY - height * 0.1 * cyanScale}`}
          fill="none"
          stroke={COLORS.cyan}
          strokeWidth={mix(2.5, 11, cyanP)}
          strokeLinecap="round"
          opacity={cyanA * 0.9}
        />
        <path
          d={`M ${rightX - width * 0.09 * rightScale} ${rightY + height * 0.13 * rightScale} H ${rightX + width * 0.04 * rightScale} V ${rightY - height * 0.31 * rightScale}`}
          fill="none"
          stroke={COLORS.cyanSoft}
          strokeWidth={mix(2.5, 10.5, rightP)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={rightA * 0.92}
        />
        <circle
          cx={rightX - width * 0.09 * rightScale}
          cy={rightY + height * 0.13 * rightScale}
          r={mix(2, 8, rightP)}
          fill={COLORS.white}
          opacity={rightA}
        />
        <path
          d={`M ${warmX - width * 0.2 * warmScale} ${warmY + height * 0.18 * warmScale} V ${warmY} H ${warmX + width * 0.44 * warmScale}`}
          fill="none"
          stroke={COLORS.coral}
          strokeWidth={mix(2.5, 9, warmP)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={warmA * 0.86}
        />
        <rect
          x={coralCapsuleX - width * 0.042 * coralScale}
          y={coralCapsuleY - height * 0.0145 * coralScale}
          width={width * 0.084 * coralScale}
          height={height * 0.029 * coralScale}
          rx={height * 0.0145 * coralScale}
          fill={COLORS.magenta}
          opacity={coralA * 0.94}
          style={{filter: `blur(${mix(0.4, 2.8, coralP)}px)`}}
        />
        <path
          d={`M ${coralLineX} ${vanishingY - height * 0.43 * coralScale} V ${vanishingY + height * 0.43 * coralScale}`}
          stroke={COLORS.coral}
          strokeWidth={mix(1.6, 7.5, coralP)}
          strokeLinecap="round"
          opacity={coralA * 0.68}
          style={{filter: `blur(${mix(0.3, 2.2, coralP)}px)`}}
        />
        <text
          x={coralCodeX}
          y={coralCodeY}
          fill={COLORS.cyanSoft}
          fontSize={mix(8, 24, coralP)}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
          fontWeight={600}
          opacity={coralA * 0.74}
          style={{
            filter: `blur(${mix(0.6, 4.8, coralP)}px)`,
          }}
        >
          {[
            "STRUCT GROUP INFO / NODE_08",
            "VECTOR ROUTE :: ACTIVE 0011",
            "CACHE STREAM [64] / LINK",
            "DATA LAYER + SIGNAL MAP",
          ].map((line, index) => (
            <tspan
              key={line}
              x={coralCodeX}
              dy={index === 0 ? 0 : mix(12, 31, coralP)}
            >
              {line}
            </tspan>
          ))}
        </text>
        <path
          d={`M ${stemX} ${flareY - stemHeight / 2} V ${flareY + stemHeight / 2}`}
          stroke={COLORS.lime}
          strokeWidth={mix(2, 9, flareP)}
          strokeLinecap="round"
          opacity={stemA * 0.82}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: flareX,
          top: flareY,
          width: width * 0.105 * flareScale,
          height: height * 0.055 * flareScale,
          borderRadius: 9999,
          opacity: flareA * 0.96,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse at 62% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,.98) 42%, rgba(255,175,238,.92) 72%, rgba(111,224,255,.18) 100%)",
          boxShadow:
            "0 0 46px rgba(255,255,255,1), 0 0 104px rgba(255,139,232,.86), 0 0 180px rgba(80,231,255,.48)",
          filter: `blur(${mix(4, 22, clamp((flareScale - 0.45) / 5.55))}px)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: flareX,
          top: flareY,
          width: width * 0.098 * flareScale,
          height: height * 0.036 * flareScale,
          borderRadius: 9999,
          opacity: flareA,
          transform: "translate(-50%, -50%)",
          background:
            "linear-gradient(90deg, #ffffff 0%, #ffffff 68%, #fff2fd 86%, #ffd4f3 100%)",
          boxShadow:
            "inset 0 0 22px rgba(255,255,255,1), 0 0 18px rgba(255,255,255,1), 0 0 42px rgba(255,225,250,.96)",
          filter: `blur(${mix(0.7, 3.2, clamp((flareScale - 0.45) / 5.55))}px)`,
          mixBlendMode: "screen",
        }}
      />
    </>
  );
};

const Finish: React.FC<{view: ViewState}> = ({view}) => {
  const scanOffset = mod(view.refTime * 9, 12);
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.16,
          transform: `translateY(${scanOffset}px)`,
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(191,250,255,.13) 0px, rgba(191,250,255,.13) 1px, transparent 1px, transparent 12px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 51% 47%, transparent 25%, rgba(0,5,15,.08) 53%, rgba(0,3,10,.66) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          background:
            "linear-gradient(90deg, rgba(0,0,0,.72), transparent 13%, transparent 87%, rgba(0,0,0,.72)), linear-gradient(180deg, rgba(0,0,0,.28), transparent 17%, transparent 82%, rgba(0,0,0,.42))",
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const timelineProgress = interpolate(
    frame,
    [0, Math.max(1, durationInFrames - 1)],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const refTime = timelineProgress * REFERENCE_SECONDS;

  const vanishingX =
    width *
    (0.5 +
      Math.sin(refTime * 0.19) * 0.0012 +
      Math.sin(refTime * 0.071 + 1.8) * 0.0007);
  const vanishingY =
    height *
    (0.498 +
      Math.sin(refTime * 0.145 + 0.7) * 0.001 +
      Math.sin(refTime * 0.047) * 0.0005);
  const cameraX =
    Math.sin(refTime * 0.18 + 0.4) * 0.0022 +
    Math.sin(refTime * 0.063 + 2.1) * 0.001;
  const cameraY =
    Math.sin(refTime * 0.13 + 1.1) * 0.0016 +
    Math.sin(refTime * 0.052) * 0.0008;

  const view: ViewState = {
    width,
    height,
    refTime,
    vanishingX,
    vanishingY,
    cameraX,
    cameraY,
  };

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: COLORS.ink,
        fontSynthesis: "none",
      }}
    >
      <Atmosphere view={view} />
      <PerspectiveGrid view={view} />

      <CircuitLayer
        specs={FAR_CIRCUITS}
        view={view}
        glow
        layerOpacity={0.5}
      />
      <CircuitLayer specs={FAR_CIRCUITS} view={view} layerOpacity={0.86} />
      <CircuitLayer specs={DETAIL_CIRCUITS} view={view} layerOpacity={0.9} />
      <CircuitLayer specs={MID_CIRCUITS} view={view} glow layerOpacity={0.38} />
      <CircuitLayer specs={MID_CIRCUITS} view={view} />
      <GlyphField view={view} />
      <PacketField view={view} />
      <CircuitLayer specs={NEAR_CIRCUITS} view={view} glow layerOpacity={0.3} />
      <CircuitLayer specs={NEAR_CIRCUITS} view={view} layerOpacity={0.96} />
      <BokehField view={view} />
      <Finish view={view} />
      <NearPasses view={view} />
    </AbsoluteFill>
  );
};
