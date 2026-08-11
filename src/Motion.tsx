import React, {useMemo} from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TAU = Math.PI * 2;
const SCENE_SEED = 503241310;
const SOURCE_CYCLES = 4;
const PARTICLE_CYCLES = 2;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const fract = (value: number) => value - Math.floor(value);

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const mulberry32 = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const hash01 = (index: number, salt: number) => {
  const value = Math.sin(index * 91.733 + salt * 47.117 + SCENE_SEED * 0.00001) *
    43758.5453;
  return fract(value);
};

const codeWords = [
  "vector",
  "packet",
  "signal",
  "kernel",
  "stream",
  "matrix",
  "node",
  "buffer",
  "sector",
  "mesh",
  "route",
  "cache",
  "index",
  "frame",
  "channel",
  "pulse",
];

const codeVerbs = [
  "sync",
  "scan",
  "map",
  "commit",
  "resolve",
  "encode",
  "merge",
  "trace",
  "verify",
  "dispatch",
  "sample",
  "connect",
];

const createCodeLine = (panelIndex: number, rowIndex: number) => {
  const a = Math.floor(hash01(panelIndex * 31 + rowIndex, 1) * codeWords.length);
  const b = Math.floor(hash01(panelIndex * 37 + rowIndex, 2) * codeWords.length);
  const v = Math.floor(hash01(panelIndex * 43 + rowIndex, 3) * codeVerbs.length);
  const value = Math.floor(hash01(panelIndex * 47 + rowIndex, 4) * 4095)
    .toString(16)
    .toUpperCase()
    .padStart(3, "0");
  const number = Math.floor(hash01(panelIndex * 53 + rowIndex, 5) * 99)
    .toString()
    .padStart(2, "0");

  const pattern = (panelIndex + rowIndex) % 5;
  if (pattern === 0) {
    return `const ${codeWords[a]}_${number} = ${codeWords[b]}.${codeVerbs[v]}();`;
  }
  if (pattern === 1) {
    return `0x${value}  ${codeWords[a]}/${codeWords[b]}  :: ${codeVerbs[v]}`;
  }
  if (pattern === 2) {
    return `${codeVerbs[v]}(${codeWords[a]}[${number}])  // ${value}`;
  }
  if (pattern === 3) {
    return `${codeWords[a]}.${codeVerbs[v]}({${codeWords[b]}: ${number}});`;
  }
  return `${number}:${value}  ${codeWords[a]} -> ${codeWords[b]}`;
};

type PanelConfig = {
  id: number;
  baseDepth: number;
  worldX: number;
  worldY: number;
  width: number;
  rowCount: number;
  fontSize: number;
  opacity: number;
  phase: number;
  flickerFrequency: number;
  tint: "ice" | "cyan" | "blue";
  compact: boolean;
  hero: boolean;
  lines: string[];
};

const createPanelConfigs = (): PanelConfig[] => {
  const random = mulberry32(SCENE_SEED);
  const panels: PanelConfig[] = [];

  for (let index = 0; index < 38; index++) {
    const sideValue = random() * 2 - 1;
    const signed = Math.sign(sideValue) || 1;
    const worldX = signed * (0.07 + Math.pow(Math.abs(sideValue), 0.82) * 0.82);
    const compact = index % 6 === 4 || index % 9 === 7;
    const rowCount = compact ? 2 + Math.floor(random() * 3) : 7 + Math.floor(random() * 14);

    panels.push({
      id: index,
      baseDepth: random(),
      worldX,
      worldY: compact && random() > 0.72
        ? 0.025 + random() * 0.09
        : -(0.075 + random() * 0.60),
      width: compact ? 180 + random() * 190 : 310 + random() * 300,
      rowCount,
      fontSize: compact ? 10 + random() * 3 : 11 + random() * 4,
      opacity: 0.72 + random() * 0.27,
      phase: random() * TAU,
      flickerFrequency: 6 + Math.floor(random() * 9),
      tint: random() > 0.76 ? "blue" : random() > 0.48 ? "cyan" : "ice",
      compact,
      hero: index < 3,
      lines: Array.from({length: rowCount}, (_, row) => createCodeLine(index, row)),
    });
  }

  // Timed near-field passes align with the reference's strongest local-motion phases.
  panels[0] = {
    ...panels[0],
    baseDepth: 0.395,
    worldX: 0.30,
    worldY: -0.63,
    width: 570,
    rowCount: 18,
    fontSize: 14,
    opacity: 0.98,
    hero: true,
    compact: false,
    lines: Array.from({length: 18}, (_, row) => createCodeLine(0, row)),
  };
  panels[1] = {
    ...panels[1],
    baseDepth: 0.02,
    worldX: -0.18,
    worldY: -0.42,
    width: 530,
    rowCount: 16,
    fontSize: 13,
    opacity: 0.96,
    hero: true,
    compact: false,
    lines: Array.from({length: 16}, (_, row) => createCodeLine(1, row)),
  };
  panels[2] = {
    ...panels[2],
    baseDepth: 0.565,
    worldX: 0.07,
    worldY: -0.34,
    width: 480,
    rowCount: 15,
    fontSize: 13,
    opacity: 0.94,
    hero: true,
    compact: false,
    lines: Array.from({length: 15}, (_, row) => createCodeLine(2, row)),
  };

  return panels;
};

type FragmentConfig = {
  id: number;
  baseDepth: number;
  worldX: number;
  worldY: number;
  width: number;
  phase: number;
  color: string;
};

const createFragmentConfigs = (): FragmentConfig[] => {
  const random = mulberry32(SCENE_SEED ^ 0x4f13bd);
  return Array.from({length: 68}, (_, id) => ({
    id,
    baseDepth: random(),
    worldX: (random() * 2 - 1) * 1.16,
    worldY: -(0.02 + random() * 0.78),
    width: 18 + random() * 118,
    phase: random() * TAU,
    color: random() > 0.88 ? "#89ecff" : random() > 0.42 ? "#6fb9ff" : "#d8f8ff",
  }));
};

type ParticleConfig = {
  id: number;
  baseDepth: number;
  endX: number;
  endY: number;
  phase: number;
  frequency: number;
  color: string;
  trail: boolean;
  intensity: number;
};

const createParticleConfigs = (): ParticleConfig[] => {
  const random = mulberry32(SCENE_SEED ^ 0x72a09e);
  return Array.from({length: 180}, (_, id) => {
    const accent = random();
    return {
      id,
      baseDepth: random(),
      endX: -0.16 + random() * 1.32,
      endY: id % 7 === 0 ? 0.98 + random() * 0.12 : 0.78 + random() * 0.17,
      phase: random() * TAU,
      frequency: 4 + Math.floor(random() * 9),
      color: accent > 0.978
        ? "#ff3c91"
        : accent > 0.68
          ? "#7fe9ff"
          : accent > 0.26
            ? "#289cff"
            : "#e6fbff",
      trail: random() > 0.62,
      intensity: 0.52 + random() * 0.48,
    };
  });
};

type BeamConfig = {
  id: number;
  topX: number;
  width: number;
  opacity: number;
  phase: number;
  frequency: number;
};

const createBeamConfigs = (): BeamConfig[] => {
  const random = mulberry32(SCENE_SEED ^ 0x194ac7);
  return Array.from({length: 18}, (_, id) => ({
    id,
    topX: -0.18 + random() * 1.36,
    width: 0.018 + random() * 0.075,
    opacity: 0.025 + random() * 0.065,
    phase: random() * TAU,
    frequency: 1 + Math.floor(random() * 4),
  }));
};

const PANEL_CONFIGS = createPanelConfigs();
const FRAGMENT_CONFIGS = createFragmentConfigs();
const PARTICLE_CONFIGS = createParticleConfigs();
const BEAM_CONFIGS = createBeamConfigs();

const tintToColor = (tint: PanelConfig["tint"]) => {
  if (tint === "blue") return "#9cc9ff";
  if (tint === "cyan") return "#a4f2ff";
  return "#effcff";
};

const panelProjection = (depth: number) => 0.016 + 0.72 * depth * depth;

const panelScale = (depth: number) => 0.15 + 1.10 * Math.pow(depth, 1.66);

const DataPanel: React.FC<{
  config: PanelConfig;
  progress: number;
  width: number;
  height: number;
  vanishingX: number;
  vanishingY: number;
}> = ({config, progress, width, height, vanishingX, vanishingY}) => {
  const rawDepth = config.baseDepth + progress * SOURCE_CYCLES;
  const lap = Math.floor(rawDepth);
  const variant = ((lap % SOURCE_CYCLES) + SOURCE_CYCLES) % SOURCE_CYCLES;
  const depth = fract(rawDepth);
  const variantSide = hash01(config.id * 19 + variant, 121) * 2 - 1;
  const variantSign = Math.sign(variantSide) || 1;
  const variantWorldX = variant === 0
    ? config.worldX
    : variantSign * (0.06 + Math.pow(Math.abs(variantSide), 0.82) * 0.84);
  const variantWorldY = variant === 0
    ? config.worldY
    : config.compact && hash01(config.id * 23 + variant, 122) > 0.78
      ? 0.02 + hash01(config.id * 29 + variant, 123) * 0.10
      : -(0.06 + hash01(config.id * 31 + variant, 124) * 0.63);
  const variantWidth = config.width * (
    variant === 0 ? 1 : 0.80 + hash01(config.id * 37 + variant, 125) * 0.38
  );
  const projection = panelProjection(depth);
  const scale = panelScale(depth);
  const x = vanishingX + variantWorldX * width * projection;
  const y = vanishingY + variantWorldY * height * projection;
  const lifecycle = interpolate(
    depth,
    [0, 0.07, 0.89, 0.995],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const farBlur = interpolate(depth, [0, 0.14], [2.1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nearBlur = interpolate(depth, [0.76, 0.98], [0, 6.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blur = farBlur + nearBlur;
  const color = tintToColor(config.tint);
  const panelPulse = 0.82 + 0.18 * Math.sin(
    TAU * (progress * config.flickerFrequency) + config.phase,
  );
  const nearGlow = clamp((depth - 0.56) / 0.34);
  const totalOpacity = clamp(lifecycle * config.opacity * clamp(panelPulse, 0.62, 1) * 1.08);
  const borderOpacity = config.compact ? 0.14 : 0.08 + nearGlow * 0.09;
  const rowHeight = config.compact ? 15 : 17;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: variantWidth,
        minHeight: 22 + config.rowCount * rowHeight,
        transform: `translate(-50%, -50%) scale(${scale}) rotateY(${(-variantWorldX * 2.2).toFixed(2)}deg)`,
        transformOrigin: "50% 50%",
        opacity: totalOpacity,
        zIndex: 100 + Math.floor(depth * 600),
        filter: `blur(${blur.toFixed(2)}px) drop-shadow(0 0 ${(
          5 + nearGlow * 14
        ).toFixed(1)}px rgba(66, 190, 255, ${(
          0.16 + nearGlow * 0.23
        ).toFixed(3)}))`,
        color,
        padding: config.compact ? "8px 12px" : "12px 16px 14px",
        borderLeft: `1px solid rgba(120, 229, 255, ${borderOpacity})`,
        borderTop: `1px solid rgba(130, 218, 255, ${borderOpacity * 0.72})`,
        background: config.compact
          ? "linear-gradient(90deg, rgba(23,91,126,.09), rgba(4,13,25,.018) 78%, transparent)"
          : "linear-gradient(108deg, rgba(10,51,82,.115), rgba(2,14,28,.032) 58%, transparent)",
        boxSizing: "border-box",
        overflow: "hidden",
        mixBlendMode: "screen",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, transparent 0%, rgba(99,221,255,${
            0.035 + nearGlow * 0.045
          }) 48%, transparent 60%)`,
          transform: `translateX(${(
            -80 + fract(progress * 5 + config.id * 0.173) * 210
          ).toFixed(1)}%)`,
          pointerEvents: "none",
        }}
      />

      {!config.compact && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            height: 14,
            marginBottom: 5,
            opacity: 0.48 + 0.18 * Math.sin(
              TAU * progress * (5 + (config.id % 3)) + config.phase,
            ),
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 8,
            letterSpacing: 1.5,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: config.id % 17 === 0 ? "#ff3d8d" : "#7fe9ff",
              boxShadow: `0 0 7px ${config.id % 17 === 0 ? "#ff3d8d" : "#57d8ff"}`,
            }}
          />
          <span>{`NODE-${String(config.id + 1).padStart(3, "0")}`}</span>
          <span style={{opacity: 0.58}}>{`0x${Math.floor(hash01(config.id, 22) * 65535)
            .toString(16)
            .toUpperCase()
            .padStart(4, "0")}`}</span>
        </div>
      )}

      {config.lines.map((line, row) => {
        const rowPhase = config.phase + row * 0.67;
        const rowPulse = 0.64 + 0.36 * Math.sin(
          TAU * progress * (3 + (row % 5)) + rowPhase,
        );
        const occasionalDrop = Math.sin(
          TAU * progress * (9 + (row % 4)) + rowPhase * 3.1 + config.id,
        ) > 0.91
          ? 0.28
          : 1;
        const rowShift = Math.sin(
          TAU * progress * (2 + (row % 3)) + rowPhase,
        ) * (1.5 + (row % 3));
        const widthCrop = 58 + hash01(config.id * 37 + row, 29) * 42;

        return (
          <div
            key={`${config.id}-${row}`}
            style={{
              position: "relative",
              height: rowHeight,
              width: `${widthCrop}%`,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transform: `translateX(${rowShift.toFixed(2)}px)`,
              opacity: clamp((0.38 + rowPulse * 0.54) * occasionalDrop, 0.12, 1),
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: config.fontSize,
              lineHeight: `${rowHeight}px`,
              letterSpacing: row % 4 === 0 ? 0.75 : 0.15,
              textShadow: `0 0 ${2 + nearGlow * 5}px ${color}`,
            }}
          >
            {line}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${fract(progress * 7 + config.id * 0.113) * 100}%`,
          height: 1,
          opacity: 0.22 + nearGlow * 0.24,
          background: "linear-gradient(90deg, transparent, #86edff 28%, rgba(90,188,255,.3) 72%, transparent)",
          boxShadow: "0 0 8px rgba(77,205,255,.45)",
        }}
      />
    </div>
  );
};

const MicroFragments: React.FC<{
  progress: number;
  width: number;
  height: number;
  vanishingX: number;
  vanishingY: number;
}> = ({progress, width, height, vanishingX, vanishingY}) => {
  return (
    <>
      {FRAGMENT_CONFIGS.map((fragment) => {
        const rawDepth = fragment.baseDepth + progress * SOURCE_CYCLES;
        const lap = Math.floor(rawDepth);
        const variant = ((lap % SOURCE_CYCLES) + SOURCE_CYCLES) % SOURCE_CYCLES;
        const depth = fract(rawDepth);
        const variantX = variant === 0
          ? fragment.worldX
          : (hash01(fragment.id * 11 + variant, 131) * 2 - 1) * 1.16;
        const variantY = variant === 0
          ? fragment.worldY
          : -(0.02 + hash01(fragment.id * 13 + variant, 132) * 0.78);
        const projection = 0.012 + 0.88 * depth * depth;
        const scale = 0.16 + 0.92 * Math.pow(depth, 1.62);
        const x = vanishingX + variantX * width * projection;
        const y = vanishingY + variantY * height * projection;
        const opacity = interpolate(
          depth,
          [0, 0.07, 0.87, 0.995],
          [0, 0.60, 0.76, 0],
          {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
        ) * (0.78 + 0.22 * Math.sin(
          TAU * progress * (3 + (fragment.id % 5)) + fragment.phase,
        ));

        return (
          <div
            key={fragment.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: fragment.width,
              height: fragment.id % 5 === 0 ? 6 : 2,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              zIndex: 45 + Math.floor(depth * 80),
              filter: `blur(${depth > 0.86 ? (depth - 0.86) * 13 : 0}px)`,
              background: fragment.id % 5 === 0
                ? `repeating-linear-gradient(90deg, ${fragment.color} 0 9px, transparent 9px 13px)`
                : `linear-gradient(90deg, transparent, ${fragment.color} 18%, ${fragment.color} 78%, transparent)`,
              boxShadow: `0 0 8px ${fragment.color}`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
};

const Atmosphere: React.FC<{
  progress: number;
  width: number;
  height: number;
  vanishingX: number;
  vanishingY: number;
}> = ({progress, width, height, vanishingX, vanishingY}) => {
  return (
    <AbsoluteFill style={{zIndex: 1, pointerEvents: "none"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            `radial-gradient(ellipse 44% 20% at 50% 55%, rgba(18,139,255,.19), transparent 68%)`,
            `radial-gradient(ellipse 88% 48% at 50% 56%, rgba(0,70,145,.095), transparent 72%)`,
            `linear-gradient(180deg, #01050c 0%, #020711 43%, #00030a 100%)`,
          ].join(","),
        }}
      />

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{position: "absolute", inset: 0, overflow: "visible"}}
      >
        <defs>
          <linearGradient id="atmospheric-beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#39c8ff" stopOpacity="0.34" />
            <stop offset="0.42" stopColor="#168cff" stopOpacity="0.10" />
            <stop offset="1" stopColor="#62d9ff" stopOpacity="0" />
          </linearGradient>
          <filter id="beam-soften" x="-30%" y="-20%" width="160%" height="150%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g filter="url(#beam-soften)" style={{mixBlendMode: "screen"}}>
          {BEAM_CONFIGS.map((beam) => {
            const topX = beam.topX * width;
            const halfWidth = beam.width * width;
            const pulse = 0.72 + 0.28 * Math.sin(
              TAU * (progress * beam.frequency) + beam.phase,
            );
            return (
              <polygon
                key={beam.id}
                points={`${vanishingX},${vanishingY} ${topX - halfWidth},0 ${topX + halfWidth},0`}
                fill="url(#atmospheric-beam)"
                opacity={beam.opacity * pulse}
              />
            );
          })}
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: vanishingY - height * 0.21,
          height: height * 0.34,
          opacity: 0.18,
          background: "repeating-linear-gradient(90deg, transparent 0 101px, rgba(56,147,211,.08) 102px, transparent 103px 177px)",
          filter: "blur(1px)",
          maskImage: "linear-gradient(90deg, transparent, black 20%, black 80%, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

const PerspectiveFloor: React.FC<{
  progress: number;
  width: number;
  height: number;
  vanishingX: number;
  vanishingY: number;
}> = ({progress, width, height, vanishingX, vanishingY}) => {
  const rays = useMemo(
    () => Array.from({length: 46}, (_, index) => ({
      index,
      endX: mix(-0.23 * width, 1.23 * width, index / 45),
      opacity: 0.13 + hash01(index, 71) * 0.24,
      phase: hash01(index, 72) * TAU,
    })),
    [width],
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{position: "absolute", inset: 0, zIndex: 10, overflow: "hidden"}}
    >
      <defs>
        <linearGradient id="floor-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#79eaff" stopOpacity="0.78" />
          <stop offset="0.22" stopColor="#168cff" stopOpacity="0.58" />
          <stop offset="0.78" stopColor="#1265d4" stopOpacity="0.24" />
          <stop offset="1" stopColor="#041c4d" stopOpacity="0" />
        </linearGradient>
        <filter id="floor-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      <g style={{mixBlendMode: "screen"}}>
        {rays.map((ray) => {
          const pulse = 0.85 + 0.15 * Math.sin(
            TAU * (progress * 2) + ray.phase,
          );
          return (
            <line
              key={ray.index}
              x1={vanishingX}
              y1={vanishingY}
              x2={ray.endX}
              y2={height * 1.08}
              stroke="url(#floor-ray)"
              strokeWidth={ray.index % 7 === 0 ? 1.8 : 0.92}
              opacity={ray.opacity * pulse}
            />
          );
        })}
      </g>

      <g fill="none" filter="url(#floor-glow)" style={{mixBlendMode: "screen"}}>
        {Array.from({length: 19}, (_, index) => {
          const depth = fract(index / 19 + progress * SOURCE_CYCLES);
          const radial = Math.pow(depth, 2.18);
          const y = vanishingY + (height * 1.04 - vanishingY) * radial;
          const halfWidth = width * (0.018 + radial * 0.68);
          const kink = 4 + radial * 22;
          const fade = interpolate(
            depth,
            [0, 0.10, 0.80, 1],
            [0, 0.15, 0.24, 0],
            {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
          );
          const path = [
            `M ${vanishingX - halfWidth} ${y}`,
            `L ${vanishingX - halfWidth * 0.28} ${y - kink * 0.18}`,
            `L ${vanishingX + halfWidth * 0.22} ${y + kink * 0.10}`,
            `L ${vanishingX + halfWidth} ${y}`,
          ].join(" ");
          return (
            <path
              key={index}
              d={path}
              stroke={index % 5 === 0 ? "#37d7ff" : "#157bdf"}
              strokeWidth={0.65 + radial * 0.8}
              opacity={fade}
            />
          );
        })}
      </g>

      <g style={{mixBlendMode: "screen"}}>
        {PARTICLE_CONFIGS.map((particle) => {
          const rawDepth = particle.baseDepth + progress * PARTICLE_CYCLES;
          const lap = Math.floor(rawDepth);
          const variant = ((lap % SOURCE_CYCLES) + SOURCE_CYCLES) % SOURCE_CYCLES;
          const depth = fract(rawDepth);
          const radial = Math.pow(depth, 1.55);
          const previousDepth = Math.max(0, depth - 0.032 - particle.intensity * 0.009);
          const previousRadial = Math.pow(previousDepth, 1.55);
          const variantEndX = variant === 0
            ? particle.endX
            : -0.16 + hash01(particle.id * 17 + variant, 141) * 1.32;
          const variantEndY = variant === 0
            ? particle.endY
            : particle.id % 7 === 0
              ? 0.98 + hash01(particle.id * 19 + variant, 142) * 0.12
              : 0.78 + hash01(particle.id * 19 + variant, 142) * 0.17;
          const endX = variantEndX * width;
          const endY = variantEndY * height;
          const x = vanishingX + (endX - vanishingX) * radial;
          const y = vanishingY + (endY - vanishingY) * radial;
          const previousX = vanishingX + (endX - vanishingX) * previousRadial;
          const previousY = vanishingY + (endY - vanishingY) * previousRadial;
          const lifecycle = interpolate(
            depth,
            [0, 0.03, 0.92, 0.998],
            [0, 0.72, 0.88, 0],
            {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
          );
          const flicker = 0.92 + 0.08 * Math.sin(
            TAU * (progress * particle.frequency) + particle.phase + variant * 0.79,
          );
          const opacity = lifecycle * particle.intensity * clamp(flicker, 0.80, 1) * 0.72;
          const largeTail = particle.id % 8 === 0 ? 1 + 2.4 * Math.pow(depth, 1.5) : 1;
          const radius = (0.37 + 2.45 * Math.pow(depth, 2.0)) * largeTail;

          return (
            <g key={particle.id} opacity={opacity}>
              {particle.trail && depth > 0.12 && (
                <line
                  x1={previousX}
                  y1={previousY}
                  x2={x}
                  y2={y}
                  stroke={particle.color}
                  strokeWidth={Math.max(0.55, radius * 0.36)}
                  opacity={0.34 + depth * 0.34}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={particle.color}
              />
              {depth > 0.66 && particle.id % 7 === 0 && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius * 2.4}
                  fill={particle.color}
                  opacity={0.10}
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const HorizonCore: React.FC<{
  progress: number;
  width: number;
  height: number;
  vanishingX: number;
  vanishingY: number;
}> = ({progress, width, height, vanishingX, vanishingY}) => {
  const pulse = 0.88 + 0.12 * Math.sin(TAU * progress * 4);
  const microPulse = 0.92 + 0.08 * Math.sin(TAU * progress * 13 + 0.4);

  return (
    <div style={{position: "absolute", inset: 0, zIndex: 28, pointerEvents: "none"}}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: vanishingY - 1,
          width,
          height: 2,
          opacity: 0.38 * pulse,
          background: "linear-gradient(90deg, transparent 0%, #096bc0 12%, #7deeff 48%, #7deeff 52%, #096bc0 88%, transparent 100%)",
          boxShadow: "0 0 12px rgba(31,160,255,.62), 0 0 34px rgba(7,115,255,.28)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: vanishingX - width * 0.22,
          top: vanishingY - height * 0.10,
          width: width * 0.44,
          height: height * 0.20,
          opacity: pulse * microPulse,
          background: "radial-gradient(ellipse at center, rgba(193,248,255,.77) 0%, rgba(56,200,255,.43) 11%, rgba(17,109,255,.18) 34%, transparent 72%)",
          filter: "blur(5px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: vanishingX - width * 0.35,
          top: vanishingY - height * 0.03,
          width: width * 0.70,
          height: height * 0.06,
          opacity: 0.16,
          background: "linear-gradient(90deg, transparent, rgba(20,122,255,.38) 35%, rgba(81,224,255,.72) 49%, rgba(55,191,255,.46) 56%, rgba(17,101,255,.30) 68%, transparent)",
          filter: "blur(10px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

const ForegroundFinish: React.FC<{progress: number}> = ({progress}) => {
  const breathe = 0.96 + 0.04 * Math.sin(TAU * progress * 2);
  return (
    <AbsoluteFill style={{zIndex: 2000, pointerEvents: "none"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.055,
          background: "repeating-linear-gradient(180deg, rgba(162,220,255,.16) 0, rgba(162,220,255,.16) 1px, transparent 1px, transparent 4px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 55%, transparent 31%, rgba(0,2,8,.20) 61%, rgba(0,1,6,.88) 100%)",
          opacity: breathe,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 150px rgba(0,0,0,.68), inset 0 -90px 130px rgba(0,0,0,.52)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const progress = fract(frame / durationInFrames);
  const vanishingX = width * 0.50;
  const vanishingY = height * 0.552;

  return (
    <AbsoluteFill
      data-scene="DATA_CORRIDOR_BG_503241310_DA6A0746"
      style={{
        overflow: "hidden",
        backgroundColor: "#01040a",
        color: "#dff9ff",
        fontSynthesis: "none",
      }}
    >
      <Atmosphere
        progress={progress}
        width={width}
        height={height}
        vanishingX={vanishingX}
        vanishingY={vanishingY}
      />

      <PerspectiveFloor
        progress={progress}
        width={width}
        height={height}
        vanishingX={vanishingX}
        vanishingY={vanishingY}
      />

      <HorizonCore
        progress={progress}
        width={width}
        height={height}
        vanishingX={vanishingX}
        vanishingY={vanishingY}
      />

      <MicroFragments
        progress={progress}
        width={width}
        height={height}
        vanishingX={vanishingX}
        vanishingY={vanishingY}
      />

      {PANEL_CONFIGS.map((config) => (
        <DataPanel
          key={config.id}
          config={config}
          progress={progress}
          width={width}
          height={height}
          vanishingX={vanishingX}
          vanishingY={vanishingY}
        />
      ))}

      <ForegroundFinish progress={progress} />
    </AbsoluteFill>
  );
};
