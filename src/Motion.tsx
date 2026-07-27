import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 900;

const COLORS = {
  background: "#02070d",
  backgroundSoft: "#06121b",
  platform: "#091923",
  platformLight: "#102b38",
  platformEdge: "#163746",
  cyan: "#29e2f2",
  blue: "#398dff",
  amber: "#ffb547",
  red: "#ff3158",
  white: "#ddfbff",
  muted: "#6e96a4",
  dim: "#24434f",
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const mix = (a: number, b: number, amount: number) =>
  a + (b - a) * amount;

const smooth = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

const easeOut = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const windowOpacity = (
  frame: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
) => smooth(frame, inStart, inEnd) * (1 - smooth(frame, outStart, outEnd));

const hash = (seed: number) => {
  const value = Math.sin(seed * 91.3458 + 17.132) * 43758.5453;
  return value - Math.floor(value);
};

const range = (count: number) => Array.from({length: count}, (_, i) => i);

const modulo = (value: number, divisor = 1) =>
  ((value % divisor) + divisor) % divisor;

const cubicPoint = (
  start: {x: number; y: number},
  control1: {x: number; y: number},
  control2: {x: number; y: number},
  end: {x: number; y: number},
  progress: number,
) => {
  const t = clamp(progress);
  const inverse = 1 - t;
  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * t * control1.x +
      3 * inverse * t ** 2 * control2.x +
      t ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * t * control1.y +
      3 * inverse * t ** 2 * control2.y +
      t ** 3 * end.y,
  };
};

type GraphNode = {
  id: string;
  label: string;
  version: string;
  x: number;
  y: number;
  size: number;
  tier: "APPLICATION" | "DIRECT" | "TRANSITIVE";
  appearFrame: number;
  infectionFrame?: number;
  badge: string;
};

const GRAPH_NODES: GraphNode[] = [
  {
    id: "app",
    label: "APP CORE",
    version: "BUILD 84",
    x: 960,
    y: 428,
    size: 46,
    tier: "APPLICATION",
    appearFrame: 72,
    infectionFrame: 395,
    badge: "ROOT",
  },
  {
    id: "auth",
    label: "AUTH",
    version: "4.2.1",
    x: 520,
    y: 568,
    size: 34,
    tier: "DIRECT",
    appearFrame: 98,
    badge: "DIR",
  },
  {
    id: "parser",
    label: "PARSER",
    version: "6.8.0",
    x: 790,
    y: 568,
    size: 36,
    tier: "DIRECT",
    appearFrame: 112,
    infectionFrame: 346,
    badge: "DIR",
  },
  {
    id: "image",
    label: "IMAGE",
    version: "3.1.7",
    x: 1060,
    y: 568,
    size: 34,
    tier: "DIRECT",
    appearFrame: 126,
    badge: "DIR",
  },
  {
    id: "telemetry",
    label: "TELEMETRY",
    version: "2.9.4",
    x: 1330,
    y: 568,
    size: 34,
    tier: "DIRECT",
    appearFrame: 140,
    badge: "DIR",
  },
  {
    id: "crypto",
    label: "CRYPTO",
    version: "5.0.3",
    x: 405,
    y: 748,
    size: 29,
    tier: "TRANSITIVE",
    appearFrame: 154,
    badge: "TRN",
  },
  {
    id: "codec",
    label: "CODEC",
    version: "1.4.8",
    x: 560,
    y: 748,
    size: 29,
    tier: "TRANSITIVE",
    appearFrame: 166,
    badge: "TRN",
  },
  {
    id: "util",
    label: "UTIL-7A",
    version: "0.9.6",
    x: 760,
    y: 748,
    size: 34,
    tier: "TRANSITIVE",
    appearFrame: 178,
    infectionFrame: 270,
    badge: "TRN",
  },
  {
    id: "format",
    label: "FORMAT",
    version: "2.0.1",
    x: 920,
    y: 748,
    size: 29,
    tier: "TRANSITIVE",
    appearFrame: 188,
    badge: "TRN",
  },
  {
    id: "render",
    label: "RENDER",
    version: "7.3.2",
    x: 1095,
    y: 748,
    size: 29,
    tier: "TRANSITIVE",
    appearFrame: 198,
    badge: "TRN",
  },
  {
    id: "media",
    label: "MEDIA",
    version: "3.5.4",
    x: 1260,
    y: 748,
    size: 29,
    tier: "TRANSITIVE",
    appearFrame: 208,
    badge: "TRN",
  },
  {
    id: "log",
    label: "LOG",
    version: "8.1.0",
    x: 1450,
    y: 748,
    size: 29,
    tier: "TRANSITIVE",
    appearFrame: 218,
    badge: "TRN",
  },
];

type Edge = {
  id: string;
  from: string;
  to: string;
  revealFrame: number;
  attackFrame?: number;
  compromised?: boolean;
};

const GRAPH_EDGES: Edge[] = [
  {id: "auth-app", from: "auth", to: "app", revealFrame: 104},
  {
    id: "parser-app",
    from: "parser",
    to: "app",
    revealFrame: 118,
    attackFrame: 360,
    compromised: true,
  },
  {id: "image-app", from: "image", to: "app", revealFrame: 132},
  {
    id: "telemetry-app",
    from: "telemetry",
    to: "app",
    revealFrame: 146,
  },
  {id: "crypto-auth", from: "crypto", to: "auth", revealFrame: 160},
  {id: "codec-auth", from: "codec", to: "auth", revealFrame: 172},
  {
    id: "util-parser",
    from: "util",
    to: "parser",
    revealFrame: 184,
    attackFrame: 305,
    compromised: true,
  },
  {id: "format-parser", from: "format", to: "parser", revealFrame: 194},
  {id: "render-image", from: "render", to: "image", revealFrame: 204},
  {id: "media-image", from: "media", to: "image", revealFrame: 214},
  {
    id: "log-telemetry",
    from: "log",
    to: "telemetry",
    revealFrame: 224,
  },
];

const PARTICLES = range(72).map((index) => ({
  x: hash(index * 3.1 + 1) * WIDTH,
  y: hash(index * 5.7 + 4) * HEIGHT,
  size: 1 + hash(index * 7.3 + 8) * 2.4,
  speed: 0.15 + hash(index * 11.2 + 9) * 0.45,
  phase: hash(index * 13.9 + 7),
  opacity: 0.08 + hash(index * 2.6 + 3) * 0.28,
}));

const DATA_COLUMNS = range(28).map((index) => ({
  x: 70 + index * 70 + hash(index + 9) * 28,
  height: 35 + hash(index * 3.3) * 155,
  delay: hash(index * 8.1),
}));

const SceneDefs: React.FC = () => (
  <defs>
    <linearGradient id="background-gradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#071825" />
      <stop offset="0.45" stopColor={COLORS.background} />
      <stop offset="1" stopColor="#010409" />
    </linearGradient>
    <radialGradient id="horizon-glow">
      <stop offset="0" stopColor={COLORS.blue} stopOpacity="0.2" />
      <stop offset="0.5" stopColor={COLORS.cyan} stopOpacity="0.06" />
      <stop offset="1" stopColor={COLORS.background} stopOpacity="0" />
    </radialGradient>
    <linearGradient id="platform-top" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#102835" />
      <stop offset="0.55" stopColor={COLORS.platform} />
      <stop offset="1" stopColor="#07131c" />
    </linearGradient>
    <linearGradient id="platform-front" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0b202b" />
      <stop offset="1" stopColor="#03090f" />
    </linearGradient>
    <linearGradient id="cyan-edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={COLORS.blue} stopOpacity="0.25" />
      <stop offset="0.5" stopColor={COLORS.cyan} stopOpacity="0.95" />
      <stop offset="1" stopColor={COLORS.blue} stopOpacity="0.25" />
    </linearGradient>
    <linearGradient id="scan-plane" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={COLORS.cyan} stopOpacity="0" />
      <stop offset="0.48" stopColor={COLORS.cyan} stopOpacity="0.02" />
      <stop offset="0.5" stopColor={COLORS.white} stopOpacity="0.65" />
      <stop offset="0.52" stopColor={COLORS.cyan} stopOpacity="0.08" />
      <stop offset="1" stopColor={COLORS.cyan} stopOpacity="0" />
    </linearGradient>
    <filter id="cyan-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="7" result="blur" />
      <feFlood floodColor={COLORS.cyan} floodOpacity="0.75" />
      <feComposite in2="blur" operator="in" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="red-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="9" result="blur" />
      <feFlood floodColor={COLORS.red} floodOpacity="0.82" />
      <feComposite in2="blur" operator="in" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="soft-blur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <filter id="shadow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="11" />
    </filter>
    <pattern id="micro-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path
        d="M 24 0 L 0 0 0 24"
        fill="none"
        stroke={COLORS.cyan}
        strokeOpacity="0.055"
        strokeWidth="1"
      />
      <circle cx="0" cy="0" r="1.2" fill={COLORS.cyan} fillOpacity="0.16" />
    </pattern>
  </defs>
);

const CyberBackdrop: React.FC<{
  frame: number;
  cameraX: number;
  cameraY: number;
}> = ({frame, cameraX, cameraY}) => {
  const cycle = (frame / TOTAL_FRAMES) * Math.PI * 2;
  const horizonPulse = 0.74 + Math.sin(cycle * 2) * 0.08;

  return (
    <AbsoluteFill style={{background: COLORS.background}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <SceneDefs />
        <rect width={WIDTH} height={HEIGHT} fill="url(#background-gradient)" />
        <ellipse
          cx={980 + cameraX * 0.12}
          cy={410 + cameraY * 0.12}
          rx={850}
          ry={400}
          fill="url(#horizon-glow)"
          opacity={horizonPulse}
        />

        <g
          opacity="0.5"
          transform={`translate(${cameraX * 0.12} ${cameraY * 0.12})`}
        >
          {range(18).map((index) => {
            const x = 60 + index * 112;
            const height = 80 + hash(index + 20) * 250;
            const flicker =
              0.1 +
              0.16 *
                Math.max(
                  0,
                  Math.sin(cycle * (1 + (index % 4) * 0.2) + index),
                );
            return (
              <g key={`sky-${index}`}>
                <line
                  x1={x}
                  y1={245 - height}
                  x2={x}
                  y2={305}
                  stroke={index % 5 === 0 ? COLORS.blue : COLORS.cyan}
                  strokeOpacity={flicker}
                  strokeWidth={index % 4 === 0 ? 2 : 1}
                />
                <rect
                  x={x - 2}
                  y={245 - height}
                  width={4}
                  height={10}
                  fill={COLORS.cyan}
                  opacity={flicker * 1.7}
                />
              </g>
            );
          })}
          <line
            x1="0"
            y1="310"
            x2={WIDTH}
            y2="310"
            stroke={COLORS.blue}
            strokeOpacity="0.2"
          />
          <line
            x1="0"
            y1="318"
            x2={WIDTH}
            y2="318"
            stroke={COLORS.cyan}
            strokeOpacity="0.06"
          />
        </g>

        <g opacity="0.45">
          {PARTICLES.map((particle, index) => {
            const travel = modulo(
              particle.phase + (frame / 900) * particle.speed,
            );
            const y = modulo(particle.y - travel * 280, HEIGHT + 80) - 40;
            const x =
              particle.x +
              Math.sin(cycle + index * 0.67) * (6 + particle.speed * 10);
            return (
              <circle
                key={`particle-${index}`}
                cx={x}
                cy={y}
                r={particle.size}
                fill={index % 7 === 0 ? COLORS.blue : COLORS.cyan}
                opacity={particle.opacity}
              />
            );
          })}
        </g>

        <g opacity="0.13">
          {DATA_COLUMNS.map((column, index) => {
            const signal =
              0.2 +
              0.8 *
                Math.max(
                  0,
                  Math.sin(cycle * 2 + column.delay * Math.PI * 2),
                );
            return (
              <rect
                key={`data-column-${index}`}
                x={column.x}
                y={HEIGHT - 48 - column.height * signal}
                width={index % 3 === 0 ? 3 : 1}
                height={column.height * signal}
                fill={index % 6 === 0 ? COLORS.blue : COLORS.cyan}
              />
            );
          })}
        </g>
      </svg>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 52% 53%, transparent 34%, rgba(0,3,8,0.28) 68%, rgba(0,2,6,0.82) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.16,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)",
        }}
      />
    </AbsoluteFill>
  );
};

const SandboxSlab: React.FC<{frame: number; reset: number}> = ({
  frame,
  reset,
}) => {
  const power = easeOut(frame, 0, 58);
  const railDraw = 1;
  const pulse = 0.68 + Math.sin(frame * 0.025) * 0.12;

  return (
    <g opacity={1}>
      <ellipse
        cx="970"
        cy="860"
        rx="790"
        ry="145"
        fill="#00040a"
        opacity="0.85"
        filter="url(#soft-blur)"
      />
      <polygon
        points="190,332 1510,332 1768,842 300,842"
        fill="url(#platform-top)"
        stroke={COLORS.platformEdge}
        strokeWidth="2"
      />
      <polygon
        points="300,842 1768,842 1768,900 300,900"
        fill="url(#platform-front)"
        stroke="#102833"
        strokeWidth="2"
      />
      <polygon
        points="1510,332 1768,842 1768,900 1510,390"
        fill="#061018"
        stroke="#102833"
        strokeWidth="2"
      />
      <polygon
        points="190,332 1510,332 1768,842 300,842"
        fill="url(#micro-grid)"
        opacity="0.95"
      />

      <g opacity={0.38 * railDraw}>
        {range(9).map((index) => {
          const y1 = 374 + index * 55;
          return (
            <line
              key={`iso-row-${index}`}
              x1={200 + index * 12}
              y1={y1}
              x2={1532 + index * 28}
              y2={y1}
              stroke={index % 3 === 0 ? COLORS.blue : COLORS.cyan}
              strokeOpacity={index % 3 === 0 ? 0.22 : 0.09}
              strokeWidth="1"
            />
          );
        })}
        {range(17).map((index) => {
          const x = 210 + index * 80;
          return (
            <line
              key={`iso-column-${index}`}
              x1={x}
              y1="334"
              x2={x + 110}
              y2="842"
              stroke={COLORS.cyan}
              strokeOpacity="0.08"
            />
          );
        })}
      </g>

      <g
        fill="none"
        stroke="url(#cyan-edge)"
        strokeWidth="3"
        opacity={power * (1 - reset)}
      >
        <path
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - power}
          d="M 222 370 L 1528 370 L 1748 805"
        />
        <path
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - power}
          d="M 310 810 L 1708 810"
        />
      </g>

      <g opacity={0.7}>
        {[
          {label: "APPLICATION", x: 262, y: 412},
          {label: "DIRECT", x: 338, y: 556},
          {label: "TRANSITIVE", x: 430, y: 739},
        ].map((item, index) => (
          <g key={item.label}>
            <rect
              x={item.x}
              y={item.y - 18}
              width={118}
              height={26}
              rx="2"
              fill="#06131d"
              stroke={COLORS.cyan}
              strokeOpacity={0.18 + index * 0.06}
            />
            <text
              x={item.x + 11}
              y={item.y}
              fill={COLORS.muted}
              fontSize="12"
              fontFamily="monospace"
              fontWeight="700"
              letterSpacing="1.7"
            >
              {item.label}
            </text>
          </g>
        ))}
      </g>

      <g opacity={pulse}>
        <circle cx="214" cy="354" r="4" fill={COLORS.cyan} />
        <circle cx="1534" cy="354" r="4" fill={COLORS.cyan} />
        <circle cx="1742" cy="841" r="4" fill={COLORS.blue} />
        <circle cx="306" cy="841" r="4" fill={COLORS.cyan} />
      </g>

      <g opacity="0.5">
        <text
          x="340"
          y="880"
          fill={COLORS.muted}
          fontFamily="monospace"
          fontSize="12"
          letterSpacing="2"
        >
          ISOLATED BUILD ENVIRONMENT / NO NETWORK TRUST
        </text>
        <text
          x="1470"
          y="880"
          fill={COLORS.cyan}
          fontFamily="monospace"
          fontSize="12"
          letterSpacing="2"
        >
          POLICY SX-84
        </text>
      </g>
    </g>
  );
};

const NodeCube: React.FC<{
  frame: number;
  node: GraphNode;
  x: number;
  y: number;
  opacity: number;
  threat: number;
  verified: number;
  lift?: number;
  sealed?: number;
  labelOpacity?: number;
}> = ({
  frame,
  node,
  x,
  y,
  opacity,
  threat,
  verified,
  lift = 0,
  sealed = 0,
  labelOpacity = 1,
}) => {
  const size = node.size;
  const appearScale = 0.72 + opacity * 0.28;
  const hover =
    Math.sin(frame * 0.035 + node.x * 0.01) *
    (node.id === "util" ? 2.8 : 1.35);
  const liftPixels = lift * 80;
  const localY = y - liftPixels + hover;
  const safeOpacity = 1 - threat * 0.72;
  const topPoints = `0,${-size * 0.62} ${size},${-size * 0.13} 0,${
    size * 0.36
  } ${-size},${-size * 0.13}`;
  const leftPoints = `${-size},${-size * 0.13} 0,${size * 0.36} 0,${
    size * 0.98
  } ${-size},${size * 0.48}`;
  const rightPoints = `${size},${-size * 0.13} 0,${size * 0.36} 0,${
    size * 0.98
  } ${size},${size * 0.48}`;
  const stateColor =
    threat > 0.3 ? COLORS.red : verified > 0.5 ? COLORS.cyan : COLORS.blue;
  const signal = 0.7 + Math.sin(frame * 0.11 + node.x) * 0.18;

  return (
    <g
      opacity={opacity}
      transform={`translate(${x} ${localY}) scale(${appearScale})`}
    >
      <ellipse
        cx="0"
        cy={size * 1.06 + liftPixels}
        rx={size * (1.12 - lift * 0.3)}
        ry={size * 0.28}
        fill="#00040a"
        opacity={0.72 - lift * 0.3}
        filter="url(#shadow)"
      />

      <g opacity={safeOpacity}>
        <polygon
          points={leftPoints}
          fill="#071a26"
          stroke={COLORS.blue}
          strokeOpacity="0.72"
          strokeWidth="2"
        />
        <polygon
          points={rightPoints}
          fill="#0a2531"
          stroke={COLORS.cyan}
          strokeOpacity="0.68"
          strokeWidth="2"
        />
        <polygon
          points={topPoints}
          fill="#123745"
          stroke={COLORS.cyan}
          strokeOpacity="0.92"
          strokeWidth="2"
        />
      </g>

      <g opacity={threat} filter="url(#red-glow)">
        <polygon
          points={leftPoints}
          fill="#270812"
          stroke={COLORS.red}
          strokeWidth="2"
        />
        <polygon
          points={rightPoints}
          fill="#3a0a18"
          stroke={COLORS.red}
          strokeWidth="2"
        />
        <polygon
          points={topPoints}
          fill="#561125"
          stroke={COLORS.red}
          strokeWidth="2.4"
        />
      </g>

      <g
        opacity={0.55 + signal * 0.3}
        stroke={stateColor}
        strokeWidth="2"
        fill="none"
      >
        <path
          d={`M ${-size * 0.5} ${-size * 0.1} L 0 ${
            size * 0.16
          } L ${size * 0.5} ${-size * 0.1}`}
        />
        <line x1="0" y1={size * 0.16} x2="0" y2={size * 0.72} />
        <line
          x1={-size * 0.5}
          y1={-size * 0.1}
          x2={-size * 0.5}
          y2={size * 0.34}
        />
        <line
          x1={size * 0.5}
          y1={-size * 0.1}
          x2={size * 0.5}
          y2={size * 0.34}
        />
      </g>

      <rect
        x={-size * 0.2}
        y={-size * 0.17}
        width={size * 0.4}
        height={size * 0.24}
        rx="2"
        fill={threat > 0.3 ? COLORS.red : COLORS.cyan}
        opacity={0.82}
      />

      {threat > 0.02 ? (
        <g opacity={threat}>
          <circle
            cx="0"
            cy={-size * 0.16}
            r={size * 0.32 + Math.sin(frame * 0.17) * 2}
            fill="none"
            stroke={COLORS.red}
            strokeWidth="2"
            strokeDasharray="4 5"
          />
          <text
            x="0"
            y={-size * 0.02}
            fill={COLORS.white}
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize={Math.max(14, size * 0.5)}
          >
            !
          </text>
        </g>
      ) : null}

      {verified > 0.15 ? (
        <g opacity={verified} transform={`translate(${size * 0.62} ${-size * 0.3})`}>
          <circle
            r={size * 0.25}
            fill="#061b22"
            stroke={COLORS.cyan}
            strokeWidth="2"
          />
          <path
            d={`M ${-size * 0.1} 0 L ${-size * 0.02} ${
              size * 0.08
            } L ${size * 0.13} ${-size * 0.1}`}
            fill="none"
            stroke={COLORS.white}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : null}

      {sealed > 0.02 ? (
        <g opacity={sealed} filter="url(#cyan-glow)">
          <polygon
            points={`0,${-size * 1.04} ${size * 1.38},${-size * 0.32} ${
              size * 1.38
            },${size * 0.9} 0,${size * 1.58} ${-size * 1.38},${
              size * 0.9
            } ${-size * 1.38},${-size * 0.32}`}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth="2"
            strokeDasharray="7 7"
          />
        </g>
      ) : null}

      <g opacity={labelOpacity}>
        <rect
          x={-size - 10}
          y={size * 1.2}
          width={size * 2 + 20}
          height="42"
          rx="3"
          fill="#030c13"
          stroke={threat > 0.3 ? COLORS.red : COLORS.cyan}
          strokeOpacity={0.36 + threat * 0.5}
        />
        <text
          x="0"
          y={size * 1.2 + 17}
          fill={threat > 0.3 ? COLORS.red : COLORS.white}
          textAnchor="middle"
          fontFamily="'Arial Narrow', Arial, sans-serif"
          fontSize={node.id === "app" ? 14 : 12}
          fontWeight="800"
          letterSpacing="1.4"
        >
          {node.label}
        </text>
        <text
          x="0"
          y={size * 1.2 + 33}
          fill={COLORS.muted}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="10"
          letterSpacing="1.2"
        >
          {node.version} / {node.badge}
        </text>
      </g>
    </g>
  );
};

const GraphEdge: React.FC<{
  frame: number;
  edge: Edge;
  from: {x: number; y: number};
  to: {x: number; y: number};
  reset: number;
  isolate: number;
  restore: number;
}> = ({frame, edge, from, to, reset, isolate, restore}) => {
  const reveal = easeOut(frame, edge.revealFrame, edge.revealFrame + 22);
  const isCompromised = Boolean(edge.compromised);
  const attack = edge.attackFrame
    ? smooth(frame, edge.attackFrame, edge.attackFrame + 48) *
      (1 - smooth(frame, 548, 628))
    : 0;
  const branchDisconnect =
    edge.id === "util-parser" ? smooth(frame, 540, 610) : 0;
  const reconnect =
    edge.id === "util-parser" ? smooth(frame, 680, 735) : 0;
  const baseOpacity =
    reveal *
    (1 - reset) *
    (edge.id === "util-parser"
      ? Math.max(1 - branchDisconnect, reconnect * restore)
      : 1);
  const middleY = (from.y + to.y) / 2;
  const control1 = {x: from.x, y: middleY};
  const control2 = {x: to.x, y: middleY};
  const path = `M ${from.x} ${from.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${to.x} ${to.y}`;
  const packetOpacity = baseOpacity * (1 - attack * 0.55);

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#173b48"
        strokeWidth="8"
        strokeLinecap="round"
        opacity={baseOpacity * 0.46}
      />
      <path
        d={path}
        pathLength={1}
        fill="none"
        stroke="url(#cyan-edge)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray={1}
        strokeDashoffset={1 - reveal}
        opacity={baseOpacity}
      />

      {isCompromised ? (
        <path
          d={path}
          pathLength={1}
          fill="none"
          stroke={COLORS.red}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - attack}
          opacity={attack * (1 - reset)}
          filter="url(#red-glow)"
        />
      ) : null}

      {range(2).map((index) => {
        const travel = modulo(frame * 0.011 + index * 0.49 + edge.revealFrame);
        const point = cubicPoint(from, control1, control2, to, travel);
        return (
          <g
            key={`${edge.id}-safe-packet-${index}`}
            opacity={travel < reveal ? packetOpacity : 0}
          >
            <circle
              cx={point.x}
              cy={point.y}
              r={index === 0 ? 4.2 : 2.8}
              fill={COLORS.cyan}
              filter={index === 0 ? "url(#cyan-glow)" : undefined}
            />
            <line
              x1={point.x - 12}
              y1={point.y}
              x2={point.x - 3}
              y2={point.y}
              stroke={COLORS.blue}
              strokeWidth="2"
              opacity="0.55"
            />
          </g>
        );
      })}

      {isCompromised && attack > 0.05
        ? range(3).map((index) => {
            const local = modulo(
              frame * 0.018 + index * 0.31 + edge.revealFrame * 0.01,
            );
            const travel = Math.min(local, attack);
            const point = cubicPoint(from, control1, control2, to, travel);
            return (
              <rect
                key={`${edge.id}-threat-packet-${index}`}
                x={point.x - 4}
                y={point.y - 4}
                width="8"
                height="8"
                rx="1"
                fill={COLORS.red}
                opacity={attack * (1 - isolate)}
                transform={`rotate(45 ${point.x} ${point.y})`}
                filter="url(#red-glow)"
              />
            );
          })
        : null}
    </g>
  );
};

const QuarantineDock: React.FC<{
  frame: number;
  isolate: number;
  reset: number;
}> = ({frame, isolate, reset}) => {
  const ringRotation = frame * 0.28;
  const sealed = smooth(frame, 620, 690) * (1 - reset);
  const pulse = 0.7 + Math.sin(frame * 0.08) * 0.2;

  return (
    <g opacity={(0.42 + isolate * 0.58) * (1 - reset * 0.7)}>
      <ellipse
        cx="1572"
        cy="676"
        rx="112"
        ry="47"
        fill="#030a10"
        stroke={COLORS.cyan}
        strokeOpacity={0.28 + isolate * 0.45}
        strokeWidth="2"
      />
      <ellipse
        cx="1572"
        cy="676"
        rx={90 + sealed * 7}
        ry={36 + sealed * 3}
        fill="none"
        stroke={sealed > 0.2 ? COLORS.cyan : COLORS.blue}
        strokeOpacity={0.38 + sealed * 0.45}
        strokeWidth="2"
        strokeDasharray="9 8"
        transform={`rotate(${ringRotation} 1572 676)`}
      />
      <path
        d="M 1492 676 L 1455 656 M 1652 676 L 1689 656"
        stroke={COLORS.cyan}
        strokeOpacity={pulse * 0.52}
        strokeWidth="2"
      />
      <rect
        x="1472"
        y="706"
        width="200"
        height="48"
        rx="3"
        fill="#041018"
        stroke={COLORS.cyan}
        strokeOpacity="0.34"
      />
      <text
        x="1572"
        y="725"
        fill={COLORS.white}
        fontFamily="'Arial Narrow', Arial, sans-serif"
        fontSize="12"
        fontWeight="800"
        textAnchor="middle"
        letterSpacing="2"
      >
        QUARANTINE DOCK
      </text>
      <text
        x="1572"
        y="743"
        fill={sealed > 0.6 ? COLORS.cyan : COLORS.muted}
        fontFamily="monospace"
        fontSize="10"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        {sealed > 0.6 ? "AIR-GAPPED / SEALED" : "STANDBY / NO EGRESS"}
      </text>
    </g>
  );
};

const AnalysisPlanes: React.FC<{
  frame: number;
  primaryScan: number;
  isolate: number;
  reset: number;
}> = ({frame, primaryScan, isolate, reset}) => {
  const sweepX = mix(260, 1660, primaryScan);
  const confirm = windowOpacity(frame, 450, 474, 530, 554);
  const diagonal = modulo(frame * 2.4, 1600) + 180;

  return (
    <g opacity={1 - reset}>
      <g opacity={windowOpacity(frame, 188, 202, 258, 274)}>
        <polygon
          points={`${sweepX - 82},365 ${sweepX + 12},365 ${
            sweepX + 270
          },818 ${sweepX + 176},818`}
          fill="url(#scan-plane)"
        />
        <line
          x1={sweepX}
          y1="365"
          x2={sweepX + 258}
          y2="818"
          stroke={COLORS.white}
          strokeWidth="2"
          opacity="0.55"
          filter="url(#cyan-glow)"
        />
      </g>

      <g opacity={confirm}>
        <polygon
          points="360,430 1470,430 1555,585 445,585"
          fill={COLORS.cyan}
          fillOpacity="0.035"
          stroke={COLORS.cyan}
          strokeOpacity="0.36"
          strokeWidth="2"
        />
        <polygon
          points="440,565 1530,565 1650,780 560,780"
          fill={COLORS.blue}
          fillOpacity="0.026"
          stroke={COLORS.blue}
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <line
          x1={diagonal}
          y1="350"
          x2={diagonal + 280}
          y2="840"
          stroke={COLORS.white}
          strokeOpacity="0.25"
          strokeWidth="2"
        />
      </g>

      <g opacity={isolate}>
        <path
          d="M 690 705 L 760 664 L 830 705 L 830 785 L 760 826 L 690 785 Z"
          fill={COLORS.cyan}
          fillOpacity="0.035"
          stroke={COLORS.cyan}
          strokeWidth="2"
          strokeDasharray="10 8"
          filter="url(#cyan-glow)"
        />
        <line
          x1="760"
          y1={688 + modulo(frame * 1.8, 100)}
          x2="760"
          y2={710 + modulo(frame * 1.8, 100)}
          stroke={COLORS.white}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

const AttackEgress: React.FC<{
  frame: number;
  root: {x: number; y: number};
  reset: number;
  isolate: number;
}> = ({frame, root, reset, isolate}) => {
  const attack = smooth(frame, 405, 448) * (1 - smooth(frame, 545, 620));
  const portX = 1620;
  const portY = 462;
  const control1 = {x: root.x + 190, y: root.y - 90};
  const control2 = {x: portX - 180, y: portY - 90};
  const path = `M ${root.x} ${root.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${portX} ${portY}`;

  return (
    <g opacity={(1 - reset) * windowOpacity(frame, 378, 402, 608, 628)}>
      <path
        d={path}
        fill="none"
        stroke={COLORS.red}
        strokeWidth="3.5"
        strokeDasharray="12 10"
        strokeDashoffset={-frame * 0.65}
        opacity={attack * (1 - isolate)}
        filter="url(#red-glow)"
      />
      <g transform={`translate(${portX} ${portY})`}>
        <circle
          r="39"
          fill="#190811"
          stroke={COLORS.red}
          strokeOpacity={attack}
          strokeWidth="2"
        />
        <circle
          r={28 + Math.sin(frame * 0.12) * 4}
          fill="none"
          stroke={COLORS.red}
          strokeOpacity={attack * 0.8}
          strokeDasharray="5 5"
        />
        <path
          d="M -11 -2 L 3 -16 M -11 -2 L 3 12 M -11 -2 L 17 -2"
          stroke={COLORS.red}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <text
        x={portX}
        y={portY + 62}
        fill={COLORS.red}
        fontFamily="monospace"
        fontSize="11"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="1.4"
      >
        EXTERNAL EGRESS
      </text>
    </g>
  );
};

const DependencyGraph: React.FC<{
  frame: number;
  reset: number;
  isolate: number;
  restore: number;
}> = ({frame, reset, isolate, restore}) => {
  const move = smooth(frame, 548, 648);
  const arc = Math.sin(move * Math.PI);
  const utilNode = GRAPH_NODES.find((node) => node.id === "util")!;
  const utilPosition = {
    x: mix(utilNode.x, 1572, move),
    y: mix(utilNode.y, 630, move) - arc * 95,
  };
  const quarantineSeal = smooth(frame, 625, 690);
  const replace = smooth(frame, 670, 732) * (1 - reset);
  const restoredVerified = smooth(frame, 690, 755) * (1 - reset);

  const nodePosition = (id: string) => {
    if (id === "util") return utilPosition;
    const node = GRAPH_NODES.find((candidate) => candidate.id === id)!;
    return {x: node.x, y: node.y};
  };

  return (
    <g>
      <QuarantineDock frame={frame} isolate={isolate} reset={reset} />

      <g opacity={1 - reset}>
        {GRAPH_EDGES.map((edge) => (
          <GraphEdge
            key={edge.id}
            frame={frame}
            edge={edge}
            from={nodePosition(edge.from)}
            to={nodePosition(edge.to)}
            reset={reset}
            isolate={isolate}
            restore={restore}
          />
        ))}
      </g>

      <AttackEgress
        frame={frame}
        root={nodePosition("app")}
        reset={reset}
        isolate={isolate}
      />

      {GRAPH_NODES.map((node) => {
        const visible =
          easeOut(frame, node.appearFrame, node.appearFrame + 28) * (1 - reset);
        let threat = 0;
        if (node.infectionFrame) {
          threat =
            smooth(frame, node.infectionFrame, node.infectionFrame + 38) *
            (1 - smooth(frame, 624, node.id === "util" ? 840 : 712));
        }
        const position = nodePosition(node.id);
        const verified =
          node.id === "util"
            ? 0
            : restoredVerified *
              (0.78 + 0.22 * Math.sin((node.x + node.y) * 0.01));
        return (
          <NodeCube
            key={node.id}
            frame={frame}
            node={node}
            x={position.x}
            y={position.y}
            opacity={visible}
            threat={threat}
            verified={verified}
            lift={node.id === "util" ? arc * 0.7 : 0}
            sealed={node.id === "util" ? quarantineSeal : 0}
            labelOpacity={node.id === "util" && move > 0.74 ? 0.9 : 1}
          />
        );
      })}

      {replace > 0.01 ? (
        <NodeCube
          frame={frame}
          node={{
            ...utilNode,
            label: "UTIL-7B",
            version: "0.9.7",
          }}
          x={utilNode.x}
          y={utilNode.y - (1 - replace) * 130}
          opacity={replace}
          threat={0}
          verified={restoredVerified}
          lift={0}
        />
      ) : null}

      <g
        opacity={windowOpacity(frame, 275, 291, 620, 644) * (1 - reset)}
        transform={`translate(${mix(760, 1572, move)} ${
          mix(748, 630, move) - arc * 95
        })`}
      >
        <path
          d="M 42 -38 L 90 -70 L 246 -70"
          fill="none"
          stroke={frame < 540 ? COLORS.red : COLORS.cyan}
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        <rect
          x="90"
          y="-103"
          width="260"
          height="66"
          rx="3"
          fill="rgba(3,10,16,0.95)"
          stroke={frame < 540 ? COLORS.red : COLORS.cyan}
          strokeOpacity="0.72"
        />
        <text
          x="107"
          y="-80"
          fill={frame < 540 ? COLORS.red : COLORS.cyan}
          fontFamily="'Arial Narrow', Arial, sans-serif"
          fontWeight="900"
          fontSize="15"
          letterSpacing="1.4"
        >
          {frame < 540 ? "SIGNATURE MISMATCH" : "BRANCH ISOLATED"}
        </text>
        <text
          x="107"
          y="-58"
          fill={COLORS.muted}
          fontFamily="monospace"
          fontSize="11"
          letterSpacing="1"
        >
          {frame < 540
            ? "UNDECLARED INSTALL HOOK"
            : "EGRESS DISABLED / HASH BLOCKED"}
        </text>
      </g>

      <AnalysisPlanes
        frame={frame}
        primaryScan={smooth(frame, 190, 262)}
        isolate={isolate}
        reset={reset}
      />
    </g>
  );
};

const IncomingArtifact: React.FC<{
  frame: number;
  reset: number;
}> = ({frame, reset}) => {
  const travel = smooth(frame, 8, 78);
  const fade = 1 - smooth(frame, 88, 114);
  const start = {x: -110, y: 672};
  const control1 = {x: 300, y: 700};
  const control2 = {x: 670, y: 430};
  const end = {x: 960, y: 428};
  const point = cubicPoint(start, control1, control2, end, travel);
  const trail = range(7).map((index) =>
    cubicPoint(
      start,
      control1,
      control2,
      end,
      clamp(travel - 0.025 * (index + 1)),
    ),
  );
  const opacity = fade * (1 - reset);
  const packageNode: GraphNode = {
    id: "artifact-intake",
    label: "UNSIGNED ARTIFACT",
    version: "PKG / 84A7",
    x: point.x,
    y: point.y,
    size: 38,
    tier: "APPLICATION",
    appearFrame: 0,
    badge: "IN",
  };

  return (
    <g opacity={opacity}>
      {trail.map((trailPoint, index) => (
        <circle
          key={`artifact-trail-${index}`}
          cx={trailPoint.x}
          cy={trailPoint.y}
          r={6 - index * 0.55}
          fill={index % 2 === 0 ? COLORS.cyan : COLORS.blue}
          opacity={(1 - index / trail.length) * 0.52}
          filter="url(#cyan-glow)"
        />
      ))}
      <NodeCube
        frame={frame}
        node={packageNode}
        x={point.x}
        y={point.y - Math.sin(travel * Math.PI) * 24}
        opacity={opacity}
        threat={0}
        verified={0}
        lift={0}
        labelOpacity={smooth(frame, 10, 30) * (1 - smooth(frame, 68, 84))}
      />
    </g>
  );
};

type HeadlinePhase = {
  start: number;
  inEnd: number;
  outStart: number;
  end: number;
  eyebrow: string;
  first: string;
  second?: string;
  detail: string;
  accent: string;
};

const HEADLINE_PHASES: HeadlinePhase[] = [
  {
    start: 0,
    inEnd: 16,
    outStart: 80,
    end: 104,
    eyebrow: "ARTIFACT INTAKE / ISOLATED VM",
    first: "SOFTWARE PACKAGE",
    second: "ENTERING SANDBOX",
    detail: "ZERO-TRUST DEPENDENCY INSPECTION",
    accent: COLORS.cyan,
  },
  {
    start: 78,
    inEnd: 104,
    outStart: 238,
    end: 262,
    eyebrow: "DEPENDENCY RESOLUTION / 12 PACKAGES",
    first: "BUILDING",
    second: "DEPENDENCY GRAPH",
    detail: "MANIFEST / SIGNATURE / BEHAVIOR",
    accent: COLORS.blue,
  },
  {
    start: 236,
    inEnd: 258,
    outStart: 294,
    end: 316,
    eyebrow: "PROVENANCE SCAN / TRANSITIVE LAYER",
    first: "VERIFYING",
    second: "PACKAGE TRUST",
    detail: "SIGNATURES AND INSTALL HOOKS",
    accent: COLORS.cyan,
  },
  {
    start: 292,
    inEnd: 320,
    outStart: 458,
    end: 488,
    eyebrow: "MALICIOUS DEPENDENCY / RISK 94",
    first: "SUPPLY CHAIN",
    second: "ATTACK DETECTED",
    detail: "POSTINSTALL EXECUTION / EGRESS ATTEMPT",
    accent: COLORS.red,
  },
  {
    start: 472,
    inEnd: 504,
    outStart: 644,
    end: 674,
    eyebrow: "AUTONOMOUS RESPONSE / POLICY SX-84",
    first: "ISOLATING",
    second: "TRANSITIVE BRANCH",
    detail: "SEVER / LIFT / AIR-GAP",
    accent: COLORS.amber,
  },
  {
    start: 642,
    inEnd: 680,
    outStart: 800,
    end: 818,
    eyebrow: "INTEGRITY RESTORED / 12 OF 12 VERIFIED",
    first: "COMPROMISED PACKAGE",
    second: "ISOLATED",
    detail: "CLEAN BUILD RESTORED / EGRESS CLOSED",
    accent: COLORS.cyan,
  },
  {
    start: 818,
    inEnd: 838,
    outStart: 866,
    end: 888,
    eyebrow: "SANDBOX CONTROL / SECURE RESET",
    first: "VALIDATING",
    second: "CLEAN STATE",
    detail: "MEMORY PURGE / SESSION RECYCLE",
    accent: COLORS.blue,
  },
  {
    start: 866,
    inEnd: 892,
    outStart: 900,
    end: 902,
    eyebrow: "ARTIFACT INTAKE / ISOLATED VM",
    first: "SOFTWARE PACKAGE",
    second: "ENTERING SANDBOX",
    detail: "ZERO-TRUST DEPENDENCY INSPECTION",
    accent: COLORS.cyan,
  },
];

const StatusHeadline: React.FC<{frame: number}> = ({frame}) => (
  <div
    style={{
      position: "absolute",
      left: 92,
      top: 92,
      width: 830,
      height: 224,
      pointerEvents: "none",
    }}
  >
    {HEADLINE_PHASES.map((phase, index) => {
      const opacity =
        index === 0
          ? 1 - smooth(frame, phase.outStart, phase.end)
          : windowOpacity(
              frame,
              phase.start,
              phase.inEnd,
              phase.outStart,
              phase.end,
            );
      const rise = interpolate(opacity, [0, 1], [18, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return (
        <div
          key={`${phase.first}-${index}`}
          style={{
            position: "absolute",
            inset: 0,
            opacity,
            transform: `translateY(${rise}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: phase.accent,
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3.2,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 42,
                height: 3,
                background: phase.accent,
                boxShadow: `0 0 16px ${phase.accent}`,
              }}
            />
            {phase.eyebrow}
          </div>
          <div
            style={{
              marginTop: 14,
              color: COLORS.white,
              fontFamily: "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif",
              fontSize: phase.first.length > 20 ? 50 : 58,
              fontWeight: 900,
              letterSpacing: -1.4,
              lineHeight: 0.9,
              textTransform: "uppercase",
              textShadow: "0 8px 32px rgba(0,0,0,0.55)",
            }}
          >
            <div>{phase.first}</div>
            {phase.second ? (
              <div style={{color: phase.accent}}>{phase.second}</div>
            ) : null}
          </div>
          <div
            style={{
              marginTop: 16,
              color: COLORS.muted,
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2.2,
            }}
          >
            {phase.detail}
          </div>
        </div>
      );
    })}
  </div>
);

const RiskPanel: React.FC<{
  frame: number;
  reset: number;
}> = ({frame, reset}) => {
  const riskRise = smooth(frame, 270, 446);
  const riskFall = smooth(frame, 548, 680);
  const storyRisk = mix(mix(8, 94, riskRise), 0, riskFall);
  const risk = Math.round(mix(storyRisk, 8, reset));
  const threat = riskRise * (1 - riskFall) * (1 - reset);
  const panelIn = 1;
  const signatureState =
    reset > 0.7
      ? "MATCH"
      : frame < 270
        ? "MATCH"
        : frame < 650
          ? "INVALID"
          : "BLOCKED";
  const behaviorState =
    reset > 0.7
      ? "IDLE"
      : frame < 320
        ? "IDLE"
        : frame < 650
          ? "MALICIOUS"
          : "CLEAN";
  const egressState =
    reset > 0.7
      ? "CLOSED"
      : frame < 405
        ? "CLOSED"
        : frame < 620
          ? "ATTEMPT"
          : "CLOSED";
  const accent =
    threat > 0.15 ? COLORS.red : frame > 650 ? COLORS.cyan : COLORS.blue;

  return (
    <div
      style={{
        position: "absolute",
        right: 92,
        top: 80,
        width: 326,
        opacity: panelIn,
        transform: `translateX(${(1 - panelIn) * 36}px)`,
        color: COLORS.white,
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(6,22,31,0.94), rgba(2,8,13,0.82))",
          border: `1px solid ${accent}66`,
          boxShadow: `0 0 36px ${accent}12, inset 0 0 28px rgba(18,64,78,0.14)`,
          padding: "18px 20px 17px",
          clipPath:
            "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            color: COLORS.muted,
          }}
        >
          <span>AI RISK ENGINE</span>
          <span style={{color: accent}}>
            {risk === 0 ? "SECURE" : risk > 70 ? "CRITICAL" : "ANALYZING"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 9,
            marginTop: 12,
          }}
        >
          <span
            style={{
              color: accent,
              fontFamily: "'Arial Narrow', Arial, sans-serif",
              fontSize: 62,
              fontWeight: 900,
              lineHeight: 0.9,
              textShadow: `0 0 24px ${accent}55`,
            }}
          >
            {String(risk).padStart(2, "0")}
          </span>
          <span
            style={{
              color: COLORS.muted,
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            RISK / 100
          </span>
        </div>

        <div
          style={{
            height: 5,
            marginTop: 14,
            background: "#10232d",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${risk}%`,
              height: "100%",
              background: accent,
              boxShadow: `0 0 12px ${accent}`,
            }}
          />
        </div>

        <div style={{marginTop: 16}}>
          {[
            ["SIGNATURE", signatureState],
            ["BEHAVIOR", behaviorState],
            ["EGRESS", egressState],
          ].map(([label, value]) => {
            const danger =
              value === "INVALID" ||
              value === "MALICIOUS" ||
              value === "ATTEMPT";
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderTop: "1px solid rgba(87,153,170,0.16)",
                  fontSize: 11,
                  letterSpacing: 1.5,
                }}
              >
                <span style={{color: COLORS.muted}}>{label}</span>
                <span style={{color: danger ? COLORS.red : COLORS.cyan}}>
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TopSystemRail: React.FC<{frame: number}> = ({frame}) => {
  const cycle = (frame / 900) * Math.PI * 2;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 46,
          borderBottom: "1px solid rgba(41,226,242,0.14)",
          background:
            "linear-gradient(90deg, rgba(2,8,13,0.88), rgba(5,20,29,0.68), rgba(2,8,13,0.88))",
          display: "flex",
          alignItems: "center",
          padding: "0 92px",
          color: COLORS.muted,
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2.1,
        }}
      >
        <div
          style={{
            width: 17,
            height: 17,
            marginRight: 13,
            transform: "rotate(45deg)",
            border: `2px solid ${COLORS.cyan}`,
            boxShadow: `0 0 14px ${COLORS.cyan}66`,
          }}
        />
        <span style={{color: COLORS.white}}>
          AI SOFTWARE SUPPLY CHAIN SANDBOX
        </span>
        <span style={{marginLeft: 18, color: COLORS.cyan}}>LIVE</span>
        <div style={{flex: 1}} />
        <span>VM-07</span>
        <span style={{marginLeft: 25}}>NO TRUST ZONE</span>
        <span style={{marginLeft: 25, color: COLORS.cyan}}>
          {Math.round((0.78 + Math.sin(cycle) * 0.04) * 100)}% INTEGRITY
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 92,
          right: 92,
          top: 58,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(41,226,242,0.62), rgba(57,141,255,0.14), transparent 65%)",
        }}
      />
    </>
  );
};

const ProgressRail: React.FC<{frame: number; reset: number}> = ({
  frame,
  reset,
}) => {
  const stages = [
    {label: "INGEST", start: 0},
    {label: "RESOLVE", start: 80},
    {label: "VERIFY", start: 190},
    {label: "DETECT", start: 270},
    {label: "ISOLATE", start: 540},
    {label: "RESTORE", start: 670},
  ];
  const activeIndex =
    reset > 0.84
      ? 0
      : frame >= 670
        ? 5
        : frame >= 540
          ? 4
          : frame >= 270
            ? 3
            : frame >= 190
              ? 2
              : frame >= 80
                ? 1
                : 0;
  const progress = mix(clamp(frame / 840), 0, reset);

  return (
    <div
      style={{
        position: "absolute",
        left: 92,
        right: 92,
        bottom: 48,
        height: 70,
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 17,
          height: 2,
          background: "rgba(51,106,122,0.25)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background:
              activeIndex === 3
                ? COLORS.red
                : `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.cyan})`,
            boxShadow:
              activeIndex === 3
                ? `0 0 12px ${COLORS.red}`
                : `0 0 12px ${COLORS.cyan}`,
          }}
        />
      </div>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        {stages.map((stage, index) => {
          const active = index <= activeIndex;
          const current = index === activeIndex;
          const danger = index === 3 && current;
          const color = danger
            ? COLORS.red
            : active
              ? COLORS.cyan
              : COLORS.dim;
          return (
            <div
              key={stage.label}
              style={{
                width: 150,
                position: "relative",
                textAlign: index === 0 ? "left" : index === 5 ? "right" : "center",
              }}
            >
              <div
                style={{
                  width: current ? 13 : 9,
                  height: current ? 13 : 9,
                  borderRadius: "50%",
                  background: color,
                  border: `2px solid ${COLORS.background}`,
                  boxShadow: current ? `0 0 18px ${color}` : "none",
                  margin:
                    index === 0
                      ? "12px 0 0 0"
                      : index === 5
                        ? "12px 0 0 auto"
                        : "12px auto 0",
                }}
              />
              <div
                style={{
                  marginTop: 12,
                  color,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                }}
              >
                {String(index + 1).padStart(2, "0")} / {stage.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SignalBurst: React.FC<{frame: number}> = ({frame}) => {
  const bursts = [
    {center: 294, width: 12, color: COLORS.red},
    {center: 455, width: 10, color: COLORS.cyan},
    {center: 595, width: 11, color: COLORS.white},
  ];

  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {bursts.map((burst, burstIndex) => {
        const distance = Math.abs(frame - burst.center);
        const intensity = clamp(1 - distance / burst.width);
        if (intensity <= 0) return null;
        return (
          <React.Fragment key={`burst-${burst.center}`}>
            <AbsoluteFill
              style={{
                background: burst.color,
                opacity: intensity * 0.035,
                mixBlendMode: "screen",
              }}
            />
            {range(12).map((index) => {
              const seed = burstIndex * 30 + index;
              const y = 110 + hash(seed + 4) * 820;
              const width = 180 + hash(seed + 7) * 780;
              const left = hash(seed + 12) * (WIDTH - width);
              const direction = index % 2 === 0 ? 1 : -1;
              return (
                <div
                  key={`burst-line-${burstIndex}-${index}`}
                  style={{
                    position: "absolute",
                    left,
                    top: y,
                    width,
                    height: index % 4 === 0 ? 4 : 1,
                    background:
                      index % 3 === 0 ? burst.color : COLORS.cyan,
                    opacity: intensity * (0.24 + hash(seed) * 0.5),
                    transform: `translateX(${
                      direction * intensity * (15 + hash(seed + 2) * 44)
                    }px)`,
                    boxShadow: `0 0 12px ${burst.color}`,
                  }}
                />
              );
            })}
            {range(4).map((index) => {
              const width = 120 + hash(index + burst.center) * 300;
              return (
                <div
                  key={`burst-block-${burstIndex}-${index}`}
                  style={{
                    position: "absolute",
                    right: 100 + index * 210,
                    top: 180 + index * 150,
                    width,
                    height: 18 + index * 4,
                    border: `1px solid ${burst.color}`,
                    opacity: intensity * 0.18,
                    transform: `translateX(${
                      (index % 2 ? -1 : 1) * intensity * 24
                    }px)`,
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const ValidationWipe: React.FC<{
  frame: number;
  reset: number;
}> = ({frame, reset}) => {
  const x = mix(-420, 2250, reset);
  return (
    <AbsoluteFill style={{pointerEvents: "none", opacity: reset}}>
      <svg width={WIDTH} height={HEIGHT}>
        <polygon
          points={`${x - 260},0 ${x - 160},0 ${x + 400},1080 ${
            x + 300
          },1080`}
          fill={COLORS.cyan}
          fillOpacity="0.04"
        />
        <line
          x1={x - 160}
          y1="0"
          x2={x + 400}
          y2="1080"
          stroke={COLORS.white}
          strokeWidth="3"
          opacity="0.6"
          style={{filter: `drop-shadow(0 0 18px ${COLORS.cyan})`}}
        />
        <line
          x1={x - 196}
          y1="0"
          x2={x + 364}
          y2="1080"
          stroke={COLORS.cyan}
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 96,
          bottom: 140,
          color: COLORS.cyan,
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          opacity: windowOpacity(frame, 840, 850, 874, 890),
        }}
      >
        VALIDATION WIPE / CLEAN STATE LOADED
      </div>
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const reset = smooth(frame, 840, Math.min(895, durationInFrames - 4));
  const resolve = smooth(frame, 80, 190);
  const suspect = smooth(frame, 270, 330);
  const confirmPull = smooth(frame, 450, 540);
  const isolate = smooth(frame, 540, 650) * (1 - reset);
  const restore = smooth(frame, 670, 770) * (1 - reset);
  const intake = smooth(frame, 0, 80);

  const storyScale =
    1.1 -
    intake * 0.07 -
    resolve * 0.09 +
    suspect * 0.1 -
    confirmPull * 0.07 +
    restore * 0.01;
  const cameraScale = mix(storyScale, 1.1, reset);
  const storyX = suspect * 82 - isolate * 188 + restore * 106;
  const storyY = suspect * 15 - isolate * 14 + restore * 3;
  const cameraX = mix(storyX, 0, reset);
  const cameraY = mix(storyY, 0, reset);
  const cameraBreath = Math.sin((frame / 900) * Math.PI * 2) * 2.2;

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: COLORS.background,
      }}
    >
      <CyberBackdrop
        frame={frame}
        cameraX={cameraX}
        cameraY={cameraY}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <SceneDefs />
        <g
          transform={`translate(${960 + cameraX} ${
            600 + cameraY + cameraBreath
          }) scale(${cameraScale}) translate(-960 -600)`}
        >
          <SandboxSlab frame={frame} reset={reset} />
          <IncomingArtifact frame={frame} reset={reset} />
          <DependencyGraph
            frame={frame}
            reset={reset}
            isolate={isolate}
            restore={restore}
          />
        </g>
      </svg>

      <TopSystemRail frame={frame} />
      <StatusHeadline frame={frame} />
      <RiskPanel frame={frame} reset={reset} />
      <ProgressRail frame={frame} reset={reset} />
      <SignalBurst frame={frame} />
      <ValidationWipe frame={frame} reset={reset} />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow:
            "inset 0 0 110px rgba(0,2,6,0.86), inset 0 0 28px rgba(8,42,55,0.2)",
        }}
      />
    </AbsoluteFill>
  );
};
