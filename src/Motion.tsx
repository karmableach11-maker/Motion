import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";

// MOTION22 — floating binary numbers with glowing square particles.
// Target composition: 1920×1080, 60 fps, 1200 frames (20 seconds).
// All positions are deterministic and frame-driven; no runtime asset fetches.

const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION = 1200;
const TAU = Math.PI * 2;
const VANISHING_POINT = {x: 958, y: 602};
const FAR_CLOUD_CENTER = {x: 958, y: 564};

const FONT =
  "Arial, Helvetica Neue, Helvetica, ui-sans-serif, system-ui, sans-serif";

type ProjectedSeed = {
  worldX: number;
  worldY: number;
  depthOffset: number;
  cycles: number;
  driftPhase: number;
};

type DigitSeed = ProjectedSeed & {
  value: "0" | "1";
  baseSize: number;
  color: string;
  opacity: number;
  rotation: number;
  glow: string;
};

type SquareSeed = ProjectedSeed & {
  baseSize: number;
  aspect: number;
  color: string;
  opacity: number;
  rotation: number;
  inset: boolean;
};

type BokehSeed = ProjectedSeed & {
  baseSize: number;
  color: string;
  opacity: number;
  pulsePhase: number;
};

type HeroDigitSeed = {
  value: "0" | "1";
  peakFrame: number;
  worldX: number;
  worldY: number;
  baseSize: number;
  color: string;
  glow: string;
  rotation: number;
  opacity: number;
};

type FarSquareSeed = {
  x: number;
  y: number;
  size: number;
  aspect: number;
  color: string;
  opacity: number;
};

type FarDigitSeed = {
  x: number;
  y: number;
  size: number;
  value: "0" | "1";
  color: string;
  opacity: number;
  rotation: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const wrap01 = (value: number) => value - Math.floor(value);

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / Math.max(0.00001, edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const createRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T,>(random: () => number, values: readonly T[]) =>
  values[Math.min(values.length - 1, Math.floor(random() * values.length))];

const makeWorldPosition = (random: () => number) => {
  const angle = random() * TAU;
  const radius = 0.1 + Math.pow(random(), 0.58) * 1.15;
  return {
    worldX: Math.cos(angle) * radius * 1.34,
    worldY: Math.sin(angle) * radius * 0.79,
  };
};

const digitColors = [
  "#eefcff",
  "#d7fbff",
  "#bffaff",
  "#71f1ef",
  "#86ffd3",
  "#ff8dd9",
  "#ffabc8",
  "#f5ef87",
] as const;

const digitGlows = [
  "#55eaff",
  "#2acfff",
  "#59efff",
  "#27e5dc",
  "#50ffbe",
  "#ff43ca",
  "#ff66b7",
  "#e9e65f",
] as const;

const squareColors = [
  "#18d8ee",
  "#21bde9",
  "#1699ef",
  "#176ce2",
  "#2253d4",
  "#43e4e7",
  "#45c8ff",
  "#0d82cf",
] as const;

const farRandom = createRandom(7062026);
const FAR_SQUARES: FarSquareSeed[] = Array.from({length: 164}, () => {
  const angle = farRandom() * TAU;
  const radius = 74 + Math.pow(farRandom(), 0.62) * 890;
  return {
    x: FAR_CLOUD_CENTER.x + Math.cos(angle) * radius * 1.16,
    y: FAR_CLOUD_CENTER.y + Math.sin(angle) * radius * 0.59,
    size: 3 + Math.pow(farRandom(), 1.5) * 34,
    aspect: 0.82 + farRandom() * 0.36,
    color: pick(farRandom, squareColors),
    opacity: 0.16 + farRandom() * 0.52,
  };
});

const FAR_DIGITS: FarDigitSeed[] = Array.from({length: 62}, () => {
  const angle = farRandom() * TAU;
  const radius = 45 + Math.pow(farRandom(), 0.68) * 810;
  const colorRoll = farRandom();
  return {
    x: FAR_CLOUD_CENTER.x + Math.cos(angle) * radius * 1.12,
    y: FAR_CLOUD_CENTER.y + Math.sin(angle) * radius * 0.61,
    size: 7 + farRandom() * 16,
    value: farRandom() > 0.5 ? "1" : "0",
    color:
      colorRoll < 0.7
        ? "#dffcff"
        : colorRoll < 0.86
          ? "#72f1ee"
          : colorRoll < 0.93
            ? "#a7ffd4"
            : colorRoll < 0.975
              ? "#ff9fdb"
              : "#f2ed86",
    opacity: 0.26 + farRandom() * 0.58,
    rotation: (farRandom() - 0.5) * 11,
  };
});

const digitRandom = createRandom(22112026);
const DIGITS: DigitSeed[] = Array.from({length: 152}, (_, index) => {
  const position = makeWorldPosition(digitRandom);
  const colorIndexRoll = digitRandom();
  const colorIndex =
    colorIndexRoll < 0.49
      ? 0
      : colorIndexRoll < 0.69
        ? 1
        : colorIndexRoll < 0.81
          ? 2
          : colorIndexRoll < 0.88
            ? 3
            : colorIndexRoll < 0.93
              ? 4
              : colorIndexRoll < 0.965
                ? 5
                : colorIndexRoll < 0.985
                  ? 6
                  : 7;

  return {
    ...position,
    value: digitRandom() > 0.5 ? "1" : "0",
    depthOffset: digitRandom(),
    cycles: index % 7 === 0 ? 9 : 8,
    driftPhase: digitRandom(),
    baseSize: 13 + digitRandom() * 12,
    color: digitColors[colorIndex],
    glow: digitGlows[colorIndex],
    opacity: 0.48 + digitRandom() * 0.5,
    rotation: (digitRandom() - 0.5) * 13,
  };
});

const squareRandom = createRandom(22042026);
const SQUARES: SquareSeed[] = Array.from({length: 214}, (_, index) => {
  const position = makeWorldPosition(squareRandom);
  return {
    ...position,
    depthOffset: squareRandom(),
    cycles: index % 9 === 0 ? 8 : 7,
    driftPhase: squareRandom(),
    baseSize: 4 + Math.pow(squareRandom(), 1.45) * 28,
    aspect: 0.82 + squareRandom() * 0.36,
    color: pick(squareRandom, squareColors),
    opacity: 0.16 + squareRandom() * 0.56,
    rotation: (squareRandom() - 0.5) * 7,
    inset: squareRandom() > 0.78,
  };
});

const bokehRandom = createRandom(27072026);
const BOKEH: BokehSeed[] = Array.from({length: 66}, () => {
  const position = makeWorldPosition(bokehRandom);
  return {
    ...position,
    depthOffset: bokehRandom(),
    cycles: 6,
    driftPhase: bokehRandom(),
    baseSize: 2 + Math.pow(bokehRandom(), 1.8) * 16,
    color: pick(bokehRandom, [
      "#8efaff",
      "#41dcff",
      "#d8ffff",
      "#87f5dc",
      "#ffd6ed",
    ] as const),
    opacity: 0.22 + bokehRandom() * 0.5,
    pulsePhase: bokehRandom(),
  };
});

const HERO_DIGITS: HeroDigitSeed[] = [
  {
    value: "0",
    peakFrame: 34,
    worldX: -0.92,
    worldY: -0.56,
    baseSize: 34,
    color: "#95fbff",
    glow: "#33dff5",
    rotation: -4,
    opacity: 0.78,
  },
  {
    value: "0",
    peakFrame: 252,
    worldX: 0.57,
    worldY: 0.22,
    baseSize: 42,
    color: "#ffd889",
    glow: "#ffa947",
    rotation: 5,
    opacity: 0.88,
  },
  {
    value: "1",
    peakFrame: 567,
    worldX: -0.72,
    worldY: 0.28,
    baseSize: 42,
    color: "#f5ffff",
    glow: "#bfefff",
    rotation: -2,
    opacity: 0.88,
  },
  {
    value: "0",
    peakFrame: 574,
    worldX: 0.6,
    worldY: -0.05,
    baseSize: 43,
    color: "#eaffff",
    glow: "#a5f1ff",
    rotation: 4,
    opacity: 0.84,
  },
  {
    value: "0",
    peakFrame: 819,
    worldX: -0.38,
    worldY: 0.53,
    baseSize: 37,
    color: "#ff9bd8",
    glow: "#ff45c1",
    rotation: 4,
    opacity: 0.83,
  },
  {
    value: "0",
    peakFrame: 1066,
    worldX: 0.68,
    worldY: 0.3,
    baseSize: 39,
    color: "#ffef9b",
    glow: "#ffe15b",
    rotation: 2,
    opacity: 0.86,
  },
  {
    value: "1",
    peakFrame: 1162,
    worldX: -0.48,
    worldY: 0.48,
    baseSize: 39,
    color: "#dcffff",
    glow: "#73eaff",
    rotation: -3,
    opacity: 0.78,
  },
];

const projectedState = (
  seed: ProjectedSeed,
  frame: number,
  spreadX: number,
  spreadY: number,
) => {
  const loopProgress = frame / DURATION;
  const depth = wrap01(seed.depthOffset + loopProgress * seed.cycles);
  const projectedDepth = Math.pow(depth, 1.58);
  const xSpread = 118 + projectedDepth * spreadX;
  const ySpread = 58 + projectedDepth * spreadY;
  const travelAngle =
    TAU * (loopProgress * Math.max(2, seed.cycles) + seed.driftPhase);
  const driftX =
    Math.sin(travelAngle) * (3.5 + projectedDepth * 16);
  const driftY =
    Math.cos(travelAngle * 2) * (2.2 + projectedDepth * 10);

  return {
    depth,
    projectedDepth,
    x:
      VANISHING_POINT.x +
      seed.worldX * xSpread +
      driftX * (0.65 + Math.abs(seed.worldY)),
    y:
      VANISHING_POINT.y +
      seed.worldY * ySpread +
      driftY,
  };
};

const Atmosphere: React.FC<{frame: number}> = ({frame}) => {
  const loopProgress = frame / DURATION;
  const breath = 0.5 + 0.5 * Math.sin(loopProgress * TAU);
  const counterBreath = 0.5 + 0.5 * Math.cos(loopProgress * TAU);

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #087ab8 0%, #075fb4 13%, #0640aa 30%, #062988 48%, #06237e 67%, #051c6a 84%, #04186a 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          opacity: 0.86 + breath * 0.08,
          transform: `scale(${1.015 + breath * 0.012})`,
          backgroundImage: [
            "radial-gradient(ellipse 76% 54% at 43% -3%, rgba(68,245,248,0.7) 0%, rgba(24,210,232,0.34) 27%, rgba(14,107,211,0.14) 53%, transparent 76%)",
            "radial-gradient(ellipse 46% 34% at 87% 18%, rgba(31,153,237,0.12) 0%, transparent 72%)",
            "radial-gradient(ellipse 45% 28% at 9% 40%, rgba(10,174,239,0.18) 0%, transparent 72%)",
          ].join(","),
        }}
      />

      <AbsoluteFill
        style={{
          opacity: 0.5 + counterBreath * 0.08,
          background:
            "radial-gradient(ellipse 54% 31% at 50% 52%, rgba(31,224,255,0.55) 0%, rgba(14,130,239,0.25) 29%, rgba(3,36,126,0.05) 63%, transparent 78%)",
          filter: "blur(20px)",
          transform: `scale(${1.03 + counterBreath * 0.012})`,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 42%, rgba(2,15,71,0.12) 57%, rgba(0,4,30,0.48) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,7,55,0.08) 0%, rgba(0,7,55,0.06) 55%, rgba(0,7,55,0.01) 85%, transparent 100%)",
        }}
      />
    </>
  );
};

const HorizonGlow: React.FC<{frame: number}> = ({frame}) => {
  const loopProgress = frame / DURATION;
  const glow = 0.33 + Math.sin(loopProgress * TAU * 2) * 0.055;
  const leftFlareX = 82 + Math.sin(loopProgress * TAU) * 18;
  const rightFlareX = 1540 + Math.cos(loopProgress * TAU) * 28;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 519,
          width: WIDTH,
          height: 2,
          opacity: glow,
          background:
            "linear-gradient(90deg, rgba(20,232,255,0.46) 0%, rgba(35,219,255,0.12) 17%, rgba(100,244,255,0.38) 44%, rgba(71,211,255,0.19) 68%, rgba(21,181,246,0.39) 100%)",
          boxShadow:
            "0 0 7px rgba(42,224,255,0.95), 0 0 22px rgba(22,150,255,0.52)",
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: leftFlareX - 160,
          top: 477,
          width: 320,
          height: 86,
          opacity: 0.44 + glow * 0.24,
          background:
            "radial-gradient(ellipse at center, rgba(139,255,251,0.82) 0%, rgba(37,227,248,0.42) 7%, rgba(10,130,240,0.14) 34%, transparent 72%)",
          filter: "blur(3px)",
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: rightFlareX - 210,
          top: 486,
          width: 420,
          height: 70,
          opacity: 0.2 + glow * 0.2,
          background:
            "radial-gradient(ellipse at center, rgba(124,245,255,0.7) 0%, rgba(38,185,255,0.23) 16%, transparent 70%)",
          filter: "blur(4px)",
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 927,
          width: WIDTH,
          height: 2,
          opacity: 0.12 + glow * 0.08,
          background:
            "linear-gradient(90deg, rgba(28,224,255,0.68), transparent 37%, transparent 74%, rgba(25,156,255,0.42))",
          boxShadow: "0 0 14px rgba(28,182,255,0.54)",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
};

const FarDataCloud: React.FC<{frame: number}> = ({frame}) => {
  const loopProgress = frame / DURATION;
  const translateX = Math.cos(loopProgress * TAU) * 7;
  const translateY = Math.sin(loopProgress * TAU) * 3;
  const pulse = 0.91 + Math.sin(loopProgress * TAU * 2) * 0.07;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        opacity: pulse,
        transformOrigin: `${FAR_CLOUD_CENTER.x}px ${FAR_CLOUD_CENTER.y}px`,
        transform: `translate(${translateX}px, ${translateY}px)`,
        filter: "drop-shadow(0 0 7px rgba(42,216,255,0.38))",
        mixBlendMode: "screen",
        zIndex: 12,
      }}
    >
      {[0, 1, 2].map((group) => {
        const flowPhase = wrap01(loopProgress * 5 + group / 3);
        const flowScale = 0.76 + flowPhase * 0.7;
        const groupFade =
          smoothstep(0.015, 0.12, flowPhase) *
          (1 - smoothstep(0.88, 0.997, flowPhase));
        const groupOpacity = 0.22 + groupFade * 0.78;

        return (
          <g
            key={`far-group-${group}`}
            opacity={groupOpacity}
            transform={`translate(${FAR_CLOUD_CENTER.x} ${FAR_CLOUD_CENTER.y}) scale(${flowScale}) translate(${-FAR_CLOUD_CENTER.x} ${-FAR_CLOUD_CENTER.y})`}
          >
            {FAR_SQUARES.map((square, index) =>
              index % 3 === group ? (
                <rect
                  key={`far-square-${index}`}
                  x={square.x - (square.size * square.aspect) / 2}
                  y={square.y - square.size / 2}
                  width={square.size * square.aspect}
                  height={square.size}
                  fill={square.color}
                  opacity={square.opacity}
                />
              ) : null,
            )}

            {FAR_DIGITS.map((digit, index) =>
              index % 3 === group ? (
                <text
                  key={`far-digit-${index}`}
                  x={digit.x}
                  y={digit.y}
                  fill={digit.color}
                  fillOpacity={digit.opacity}
                  fontFamily={FONT}
                  fontSize={digit.size}
                  fontWeight={400}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${digit.rotation} ${digit.x} ${digit.y})`}
                >
                  {digit.value}
                </text>
              ) : null,
            )}
          </g>
        );
      })}
    </svg>
  );
};

const ProjectedSquares: React.FC<{frame: number}> = ({frame}) => (
  <>
    {SQUARES.map((square, index) => {
      const state = projectedState(square, frame, 1115, 720);
      const scale = 0.38 + Math.pow(state.depth, 2.08) * 5.05;
      const size = square.baseSize * scale;
      const fadeIn = smoothstep(0.015, 0.075, state.depth);
      const fadeOut = 1 - smoothstep(0.94, 0.997, state.depth);
      const opacity =
        square.opacity *
        fadeIn *
        fadeOut *
        (0.72 + Math.sin(TAU * (frame / DURATION + square.driftPhase)) * 0.16);
      const blur =
        state.depth > 0.8
          ? Math.pow((state.depth - 0.8) / 0.2, 1.7) * 3.4
          : state.depth < 0.08
            ? 0.8
            : 0;

      if (
        state.x < -size * 1.3 ||
        state.x > WIDTH + size * 1.3 ||
        state.y < -size * 1.3 ||
        state.y > HEIGHT + size * 1.3
      ) {
        return null;
      }

      return (
        <div
          key={`square-${index}`}
          style={{
            position: "absolute",
            left: state.x,
            top: state.y,
            width: size * square.aspect,
            height: size,
            transform: `translate(-50%, -50%) rotate(${square.rotation + state.depth * 2}deg)`,
            opacity,
            border:
              state.depth > 0.42
                ? `1px solid ${square.color}66`
                : "1px solid transparent",
            background: `${square.color}${state.depth > 0.68 ? "72" : "96"}`,
            boxShadow:
              state.depth > 0.58
                ? `0 0 ${6 + state.depth * 12}px ${square.color}66`
                : `0 0 4px ${square.color}44`,
            filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
            mixBlendMode: "screen",
            zIndex: 20 + Math.round(state.depth * 160),
          }}
        >
          {square.inset && size > 14 ? (
            <div
              style={{
                position: "absolute",
                right: "16%",
                top: "15%",
                width: "29%",
                height: "29%",
                background: "rgba(178,255,255,0.42)",
                boxShadow: `0 0 5px ${square.color}`,
              }}
            />
          ) : null}
        </div>
      );
    })}
  </>
);

const ProjectedBokeh: React.FC<{frame: number}> = ({frame}) => (
  <>
    {BOKEH.map((particle, index) => {
      const state = projectedState(particle, frame, 1080, 690);
      const scale = 0.42 + Math.pow(state.depth, 2) * 4.7;
      const size = particle.baseSize * scale;
      const fadeIn = smoothstep(0.02, 0.09, state.depth);
      const fadeOut = 1 - smoothstep(0.91, 0.998, state.depth);
      const twinkle =
        0.68 +
        0.32 *
          Math.sin(
            TAU * (frame / 150 + particle.pulsePhase + index * 0.017),
          );
      const opacity = particle.opacity * fadeIn * fadeOut * twinkle;
      const blur = 1.5 + Math.pow(state.depth, 1.9) * 8;

      return (
        <div
          key={`bokeh-${index}`}
          style={{
            position: "absolute",
            left: state.x,
            top: state.y,
            width: size,
            height: size,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            opacity,
            background: particle.color,
            boxShadow: `0 0 ${size * 1.4 + 9}px ${particle.color}`,
            filter: `blur(${blur}px)`,
            mixBlendMode: "screen",
            zIndex: 24 + Math.round(state.depth * 170),
          }}
        />
      );
    })}
  </>
);

const ProjectedDigits: React.FC<{frame: number}> = ({frame}) => (
  <>
    {DIGITS.map((digit, index) => {
      const state = projectedState(digit, frame, 1125, 725);
      const scale = 0.34 + Math.pow(state.depth, 2.15) * 4.25;
      const fontSize = digit.baseSize * scale;
      const fadeIn = smoothstep(0.01, 0.07, state.depth);
      const fadeOut = 1 - smoothstep(0.955, 0.999, state.depth);
      const opacity =
        digit.opacity *
        fadeIn *
        fadeOut *
        (0.84 +
          Math.sin(TAU * (frame / DURATION + digit.driftPhase)) * 0.12);
      const blur =
        state.depth < 0.055
          ? 0.7
          : state.depth > 0.79
            ? Math.pow((state.depth - 0.79) / 0.21, 1.65) * 5.8
            : 0;

      if (
        state.x < -fontSize ||
        state.x > WIDTH + fontSize ||
        state.y < -fontSize ||
        state.y > HEIGHT + fontSize
      ) {
        return null;
      }

      return (
        <div
          key={`digit-${index}`}
          style={{
            position: "absolute",
            left: state.x,
            top: state.y,
            color: digit.color,
            fontFamily: FONT,
            fontSize,
            fontWeight: digit.value === "1" ? 500 : 400,
            lineHeight: 0.82,
            fontVariantNumeric: "tabular-nums",
            transform: `translate(-50%, -50%) rotate(${digit.rotation + state.projectedDepth * 2.2}deg)`,
            transformOrigin: "center center",
            opacity,
            textShadow: [
              `0 0 ${3 + state.depth * 5}px ${digit.glow}`,
              `0 0 ${9 + state.depth * 15}px ${digit.glow}aa`,
              `0 0 ${22 + state.depth * 28}px ${digit.glow}55`,
            ].join(","),
            filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
            mixBlendMode: "screen",
            zIndex: 50 + Math.round(state.depth * 220),
            whiteSpace: "nowrap",
          }}
        >
          {digit.value}
        </div>
      );
    })}
  </>
);

const HeroDigits: React.FC<{frame: number}> = ({frame}) => (
  <>
    {HERO_DIGITS.map((digit, index) => {
      const eventLength = 78;
      const eventStart = wrap01((digit.peakFrame - 62) / DURATION) * DURATION;
      const eventOffset = wrap01((frame - eventStart) / DURATION) * DURATION;

      if (eventOffset > eventLength) {
        return null;
      }

      const progress = eventOffset / eventLength;
      const nearAcceleration = Math.pow(progress, 6);
      const xSpread = 120 + progress * 185 + nearAcceleration * 1100;
      const ySpread = 64 + progress * 92 + nearAcceleration * 760;
      const heroScale =
        0.2 + progress * 1.4 + Math.pow(progress, 8) * 50;
      const fontSize = digit.baseSize * heroScale;
      const fadeIn = smoothstep(0.02, 0.22, progress);
      const fadeOut = 1 - smoothstep(0.9, 0.998, progress);
      const opacity = digit.opacity * fadeIn * fadeOut;
      const foreground = smoothstep(0.68, 0.97, progress);
      const blur = 1.2 + Math.pow(foreground, 1.3) * 15;
      const drift =
        Math.sin(TAU * (frame / DURATION + index * 0.173)) *
        (2 + progress * 9);
      const x =
        VANISHING_POINT.x +
        digit.worldX * xSpread +
        drift * (0.7 + Math.abs(digit.worldY));
      const y =
        VANISHING_POINT.y +
        digit.worldY * ySpread +
        Math.cos(TAU * (frame / DURATION + index * 0.173)) *
          (1.5 + progress * 5);
      const rotation = digit.rotation + nearAcceleration * 4;

      return (
        <React.Fragment key={`hero-${index}`}>
          <div
            style={{
              position: "absolute",
              left: x,
              top: y,
              color: digit.glow,
              fontFamily: FONT,
              fontSize,
              fontWeight: digit.value === "1" ? 500 : 400,
              lineHeight: 0.82,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              opacity: opacity * (0.28 + foreground * 0.26),
              filter: `blur(${10 + foreground * 19}px)`,
              textShadow: `0 0 ${28 + foreground * 54}px ${digit.glow}`,
              mixBlendMode: "screen",
              zIndex: 340 + Math.round(progress * 70),
            }}
          >
            {digit.value}
          </div>

          <div
            style={{
              position: "absolute",
              left: x,
              top: y,
              color: digit.color,
              fontFamily: FONT,
              fontSize,
              fontWeight: digit.value === "1" ? 500 : 400,
              lineHeight: 0.82,
              fontVariantNumeric: "tabular-nums",
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              opacity,
              filter: `blur(${blur}px)`,
              textShadow: [
                `0 0 6px ${digit.glow}`,
                `0 0 ${18 + foreground * 18}px ${digit.glow}`,
                `0 0 ${42 + foreground * 58}px ${digit.glow}aa`,
              ].join(","),
              mixBlendMode: "screen",
              zIndex: 360 + Math.round(progress * 80),
              whiteSpace: "nowrap",
            }}
          >
            {digit.value}
          </div>
        </React.Fragment>
      );
    })}
  </>
);

const Finish: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse 79% 73% at 50% 44%, transparent 38%, rgba(0,8,50,0.1) 67%, rgba(0,3,31,0.38) 100%)",
        zIndex: 900,
      }}
    />

    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.12,
        mixBlendMode: "soft-light",
        backgroundImage: [
          "repeating-linear-gradient(0deg, rgba(214,255,255,0.22) 0px, rgba(214,255,255,0.22) 1px, transparent 1px, transparent 3px)",
          "repeating-linear-gradient(90deg, rgba(152,226,255,0.12) 0px, rgba(152,226,255,0.12) 1px, transparent 1px, transparent 4px)",
        ].join(","),
        zIndex: 910,
      }}
    />

    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background:
          "linear-gradient(90deg, rgba(0,2,23,0.16) 0%, transparent 12%, transparent 66%, rgba(0,3,31,0.08) 79%, rgba(0,2,23,0.44) 100%)",
        zIndex: 920,
      }}
    />
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#01031a",
        isolation: "isolate",
      }}
    >
      <Atmosphere frame={frame} />
      <HorizonGlow frame={frame} />
      <FarDataCloud frame={frame} />
      <ProjectedSquares frame={frame} />
      <ProjectedBokeh frame={frame} />
      <ProjectedDigits frame={frame} />
      <HeroDigits frame={frame} />
      <Finish />
    </AbsoluteFill>
  );
};
