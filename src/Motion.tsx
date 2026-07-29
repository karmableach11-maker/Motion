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
const TAU = Math.PI * 2;

const COLORS = {
  night: "#030816",
  navy: "#071426",
  slate: "#10223B",
  white: "#F3FBFF",
  cyan: "#36E1D0",
  blue: "#5C8DFF",
  violet: "#B979FF",
  coral: "#FF718D",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const modulo = (value: number, length = 1) =>
  ((value % length) + length) % length;

const segment = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const hexAlpha = (hex: string, opacity: number) => {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 74.173 + 11.921) * 43758.5453;
  return value - Math.floor(value);
};

type Point = {
  readonly x: number;
  readonly y: number;
};

type NodeSpec = {
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly start: number;
};

type BridgeSpec = {
  readonly start: number;
  readonly end: number;
  readonly from: Point;
  readonly controlA: Point;
  readonly controlB: Point;
  readonly to: Point;
  readonly fromColor: string;
  readonly toColor: string;
};

const NODES: readonly NodeSpec[] = [
  { x: 285, y: 545, color: COLORS.cyan, start: 60 },
  { x: 735, y: 545, color: COLORS.blue, start: 190 },
  { x: 1185, y: 545, color: COLORS.violet, start: 320 },
  { x: 1635, y: 545, color: COLORS.coral, start: 450 },
] as const;

const BRIDGES: readonly BridgeSpec[] = [
  {
    start: 162,
    end: 215,
    from: { x: 413, y: 535 },
    controlA: { x: 492, y: 286 },
    controlB: { x: 653, y: 286 },
    to: { x: 607, y: 535 },
    fromColor: COLORS.cyan,
    toColor: COLORS.blue,
  },
  {
    start: 292,
    end: 345,
    from: { x: 863, y: 555 },
    controlA: { x: 942, y: 804 },
    controlB: { x: 1103, y: 804 },
    to: { x: 1057, y: 555 },
    fromColor: COLORS.blue,
    toColor: COLORS.violet,
  },
  {
    start: 422,
    end: 475,
    from: { x: 1313, y: 535 },
    controlA: { x: 1392, y: 286 },
    controlB: { x: 1553, y: 286 },
    to: { x: 1507, y: 535 },
    fromColor: COLORS.violet,
    toColor: COLORS.coral,
  },
] as const;

const PARTICLES = Array.from({ length: 62 }, (_, index) => ({
  x: hash01(index * 7 + 1) * WIDTH,
  y: hash01(index * 11 + 4) * HEIGHT,
  radius: 0.9 + hash01(index * 13 + 9) * 2.3,
  opacity: 0.07 + hash01(index * 17 + 3) * 0.2,
  speed: 6 + hash01(index * 19 + 6) * 18,
  phase: hash01(index * 23 + 2),
}));

const bridgePath = (bridge: BridgeSpec) =>
  `M ${bridge.from.x} ${bridge.from.y} C ${bridge.controlA.x} ${bridge.controlA.y}, ${bridge.controlB.x} ${bridge.controlB.y}, ${bridge.to.x} ${bridge.to.y}`;

const cubicPoint = (bridge: BridgeSpec, progress: number): Point => {
  const t = clamp01(progress);
  const inverse = 1 - t;
  return {
    x:
      inverse * inverse * inverse * bridge.from.x +
      3 * inverse * inverse * t * bridge.controlA.x +
      3 * inverse * t * t * bridge.controlB.x +
      t * t * t * bridge.to.x,
    y:
      inverse * inverse * inverse * bridge.from.y +
      3 * inverse * inverse * t * bridge.controlA.y +
      3 * inverse * t * t * bridge.controlB.y +
      t * t * t * bridge.to.y,
  };
};

const Background: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const intro = segment(frame, 0, 48, Easing.out(Easing.cubic));
  const gridX = modulo(time * 5.5, 86);
  const gridY = modulo(time * 2.8, 86);
  const sweepX = modulo(time * 105, WIDTH + 720) - 360;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(138deg, #020713 0%, #071426 44%, #0B1028 72%, #120A26 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: intro,
          background:
            "radial-gradient(circle at 14% 51%, rgba(54,225,208,.19) 0%, rgba(54,225,208,.05) 28%, transparent 48%), radial-gradient(circle at 41% 42%, rgba(92,141,255,.18) 0%, transparent 43%), radial-gradient(circle at 66% 59%, rgba(185,121,255,.15) 0%, transparent 42%), radial-gradient(circle at 90% 43%, rgba(255,113,141,.17) 0%, transparent 42%)",
        }}
      />

      <AbsoluteFill
        style={{
          opacity: 0.13 * intro,
          backgroundImage:
            "linear-gradient(rgba(154,201,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(154,201,255,.14) 1px, transparent 1px)",
          backgroundSize: "86px 86px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage:
            "radial-gradient(ellipse at 50% 53%, #000 0%, rgba(0,0,0,.72) 44%, transparent 82%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 1040,
          height: 1040,
          left: -500,
          top: -430,
          borderRadius: "50%",
          border: "1px solid rgba(92,141,255,.11)",
          boxShadow:
            "0 0 0 115px rgba(92,141,255,.021), 0 0 0 252px rgba(54,225,208,.014)",
          transform: `rotate(${time * 1.2}deg)`,
          opacity: intro,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "83%",
            top: "27%",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: COLORS.cyan,
            boxShadow: `0 0 24px ${COLORS.cyan}`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          right: -410,
          bottom: -500,
          borderRadius: "50%",
          border: "1px solid rgba(255,113,141,.1)",
          boxShadow: "0 0 0 130px rgba(185,121,255,.014)",
          transform: `rotate(${-time * 1.35}deg)`,
          opacity: intro,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "10%",
            top: "18%",
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: COLORS.coral,
            boxShadow: `0 0 22px ${COLORS.coral}`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: sweepX,
          top: -200,
          width: 210,
          height: 1500,
          transform: "rotate(18deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(202,234,255,.08), transparent)",
          filter: "blur(25px)",
          opacity: 0.42 * intro,
        }}
      />

      {PARTICLES.map((particle, index) => {
        const y =
          modulo(
            particle.y - time * particle.speed + particle.phase * HEIGHT * 0.3,
            HEIGHT + 90,
          ) - 45;
        const flicker =
          0.48 +
          Math.sin(time * (0.65 + particle.phase) + particle.phase * TAU) *
            0.38;
        const color =
          index % 4 === 0
            ? COLORS.cyan
            : index % 4 === 1
              ? COLORS.blue
              : index % 4 === 2
                ? COLORS.violet
                : COLORS.white;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: particle.x,
              top: y,
              width: particle.radius * 2,
              height: particle.radius * 2,
              borderRadius: "50%",
              background: color,
              opacity: particle.opacity * flicker * intro,
              boxShadow: `0 0 ${5 + particle.radius * 3}px ${hexAlpha(color, 0.7)}`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          top: 742,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(56,110,190,.12), rgba(7,19,38,.02) 48%, transparent 72%)",
          filter: "blur(28px)",
          opacity: intro,
          transform: `scaleX(${1 + Math.sin(time * 0.28) * 0.015})`,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(1,3,12,.22) 72%, rgba(1,3,12,.72) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const ConnectorLayer: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const lead = segment(frame, 35, 72, Easing.inOut(Easing.cubic));
  const tail = segment(frame, 555, 605, Easing.inOut(Easing.cubic));
  const leadEnd = NODES[0].x - 132;
  const tailStart = NODES[NODES.length - 1].x + 132;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <defs>
        <filter
          id="path-soft-glow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {BRIDGES.map((bridge, index) => (
          <linearGradient
            key={index}
            id={`bridge-gradient-${index}`}
            x1={bridge.from.x}
            y1={bridge.from.y}
            x2={bridge.to.x}
            y2={bridge.to.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={bridge.fromColor} />
            <stop offset="0.5" stopColor={COLORS.white} stopOpacity="0.88" />
            <stop offset="1" stopColor={bridge.toColor} />
          </linearGradient>
        ))}

        <linearGradient
          id="lead-gradient"
          x1="0"
          y1="0"
          x2={leadEnd}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={COLORS.cyan} stopOpacity="0" />
          <stop offset="0.7" stopColor={COLORS.cyan} stopOpacity="0.72" />
          <stop offset="1" stopColor={COLORS.white} />
        </linearGradient>

        <linearGradient
          id="tail-gradient"
          x1={tailStart}
          y1="0"
          x2={WIDTH}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={COLORS.white} />
          <stop offset="0.36" stopColor={COLORS.coral} stopOpacity="0.74" />
          <stop offset="1" stopColor={COLORS.coral} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d={`M 0 545 L ${leadEnd} 545`}
        pathLength={1}
        fill="none"
        stroke="rgba(54,225,208,.11)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - lead}
        filter="url(#path-soft-glow)"
      />
      <path
        d={`M 0 545 L ${leadEnd} 545`}
        pathLength={1}
        fill="none"
        stroke="url(#lead-gradient)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - lead}
      />

      {BRIDGES.map((bridge, index) => {
        const reveal = segment(
          frame,
          bridge.start,
          bridge.end,
          Easing.inOut(Easing.cubic),
        );
        const settled = segment(
          frame,
          bridge.end - 8,
          bridge.end + 28,
          Easing.out(Easing.cubic),
        );
        const packetProgress = modulo(time * 0.115 + index * 0.287, 1);
        const packet = cubicPoint(bridge, packetProgress);
        const path = bridgePath(bridge);
        const packetPulse =
          0.55 + Math.sin(time * TAU * 1.1 + index * 1.7) * 0.45;

        return (
          <g key={index}>
            <path
              d={path}
              fill="none"
              stroke="rgba(150,190,255,.065)"
              strokeWidth="14"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - reveal}
              filter="url(#path-soft-glow)"
            />
            <path
              d={path}
              fill="none"
              stroke={`url(#bridge-gradient-${index})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - reveal}
            />
            <path
              d={path}
              fill="none"
              stroke={bridge.toColor}
              strokeWidth="1.2"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.012 0.046"
              strokeDashoffset={-time * 0.14 - index * 0.19}
              opacity={0.34 * settled}
            />
            <circle
              cx={packet.x}
              cy={packet.y}
              r={3.4 + packetPulse * 1.6}
              fill={COLORS.white}
              opacity={settled * (0.62 + packetPulse * 0.38)}
              filter="url(#path-soft-glow)"
            />
            <circle
              cx={packet.x}
              cy={packet.y}
              r="2.1"
              fill={bridge.toColor}
              opacity={settled}
            />
          </g>
        );
      })}

      <path
        d={`M ${tailStart} 545 L ${WIDTH} 545`}
        pathLength={1}
        fill="none"
        stroke="rgba(255,113,141,.11)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - tail}
        filter="url(#path-soft-glow)"
      />
      <path
        d={`M ${tailStart} 545 L ${WIDTH} 545`}
        pathLength={1}
        fill="none"
        stroke="url(#tail-gradient)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - tail}
      />

      {tail > 0.99 ? (
        <circle
          cx={tailStart + modulo(time * 110, WIDTH - tailStart)}
          cy="545"
          r="3.6"
          fill={COLORS.white}
          opacity={0.66 + Math.sin(time * TAU * 1.25) * 0.24}
          filter="url(#path-soft-glow)"
        />
      ) : null}
    </svg>
  );
};

const GlassOrb: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly node: NodeSpec;
  readonly index: number;
}> = ({ frame, time, node, index }) => {
  const outline = segment(
    frame,
    node.start,
    node.start + 66,
    Easing.inOut(Easing.cubic),
  );
  const fill = segment(
    frame,
    node.start + 38,
    node.start + 110,
    Easing.out(Easing.poly(4)),
  );
  const active = segment(
    frame,
    node.start + 84,
    node.start + 120,
    Easing.out(Easing.cubic),
  );
  const bodyOpacity = segment(
    frame,
    node.start + 38,
    node.start + 58,
    Easing.out(Easing.cubic),
  );
  const bodyScale = 0.035 + fill * 0.965;
  const bob = active * Math.sin(time * 0.72 + index * 1.38) * 2.1;
  const shimmer = modulo(time * 122 + index * 176, 520) - 260;
  const pulse = 0.5 + Math.sin(time * TAU * 0.24 + index * 1.23) * 0.5;
  const orbitAngle = time * (10.5 + index * 0.7) + index * 74;
  const dashOffset = -time * (0.052 + index * 0.004);
  const id = `blank-orb-${index}`;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id={`${id}-rim`}
          x1={node.x - 135}
          y1={node.y - 135}
          x2={node.x + 135}
          y2={node.y + 135}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={COLORS.white} stopOpacity="0.96" />
          <stop offset="0.22" stopColor={node.color} stopOpacity="0.92" />
          <stop offset="0.58" stopColor={node.color} stopOpacity="0.34" />
          <stop offset="0.82" stopColor={COLORS.white} stopOpacity="0.72" />
          <stop offset="1" stopColor={node.color} stopOpacity="0.96" />
        </linearGradient>

        <radialGradient
          id={`${id}-surface`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`translate(${node.x - 44} ${node.y - 58}) rotate(47) scale(223)`}
        >
          <stop stopColor={COLORS.white} stopOpacity="0.35" />
          <stop offset="0.2" stopColor={node.color} stopOpacity="0.32" />
          <stop offset="0.62" stopColor={node.color} stopOpacity="0.15" />
          <stop offset="1" stopColor={COLORS.night} stopOpacity="0.62" />
        </radialGradient>

        <linearGradient
          id={`${id}-core`}
          x1={node.x - 90}
          y1={node.y - 90}
          x2={node.x + 90}
          y2={node.y + 90}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={hexAlpha(node.color, 0.34)} />
          <stop offset="0.42" stopColor="rgba(19,36,65,.36)" />
          <stop offset="1" stopColor="rgba(2,8,22,.7)" />
        </linearGradient>

        <linearGradient
          id={`${id}-sheen`}
          x1={node.x - 190}
          y1={node.y}
          x2={node.x + 190}
          y2={node.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={COLORS.white} stopOpacity="0" />
          <stop offset="0.5" stopColor={COLORS.white} stopOpacity="0.5" />
          <stop offset="1" stopColor={COLORS.white} stopOpacity="0" />
        </linearGradient>

        <clipPath id={`${id}-clip`}>
          <circle cx={node.x} cy={node.y} r="113" />
        </clipPath>

        <filter
          id={`${id}-glow`}
          x="-120%"
          y="-120%"
          width="340%"
          height="340%"
        >
          <feGaussianBlur stdDeviation={7 + pulse * 2.5} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter
          id={`${id}-shadow`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feDropShadow
            dx="0"
            dy="26"
            stdDeviation="24"
            floodColor="#00040F"
            floodOpacity="0.7"
          />
        </filter>
      </defs>

      <g transform={`translate(0 ${bob})`}>
        <ellipse
          cx={node.x}
          cy={node.y + 176}
          rx={112 + pulse * 8}
          ry={24 + pulse * 3}
          fill={hexAlpha(node.color, 0.1 + pulse * 0.025)}
          filter={`url(#${id}-glow)`}
          opacity={active}
        />

        <circle
          cx={node.x}
          cy={node.y}
          r={143 + pulse * 2}
          fill="none"
          stroke={hexAlpha(node.color, 0.11)}
          strokeWidth="1"
          strokeDasharray="0.055 0.035"
          pathLength={1}
          strokeDashoffset={dashOffset}
          opacity={active}
        />

        <circle
          cx={node.x}
          cy={node.y}
          r="129"
          fill="none"
          stroke={hexAlpha(node.color, 0.16)}
          strokeWidth="18"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - outline}
          transform={`rotate(180 ${node.x} ${node.y})`}
          filter={`url(#${id}-glow)`}
          opacity="0.55"
        />

        <circle
          cx={node.x}
          cy={node.y}
          r="129"
          fill="none"
          stroke={`url(#${id}-rim)`}
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - outline}
          transform={`rotate(180 ${node.x} ${node.y})`}
        />

        <g
          opacity={bodyOpacity}
          transform={`translate(${node.x} ${node.y}) scale(${bodyScale}) translate(${-node.x} ${-node.y})`}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r="117"
            fill={`url(#${id}-surface)`}
            stroke="rgba(238,249,255,.5)"
            strokeWidth="2.2"
            filter={`url(#${id}-shadow)`}
          />
          <circle
            cx={node.x}
            cy={node.y}
            r="111"
            fill="none"
            stroke={hexAlpha(node.color, 0.22)}
            strokeWidth="1.2"
          />
          <circle
            cx={node.x}
            cy={node.y}
            r="94"
            fill={`url(#${id}-core)`}
            stroke="rgba(235,248,255,.22)"
            strokeWidth="1.5"
          />
          <circle
            cx={node.x}
            cy={node.y}
            r="72"
            fill="rgba(3,10,26,.15)"
            stroke={hexAlpha(node.color, 0.27)}
            strokeWidth="1.2"
          />
          <circle
            cx={node.x}
            cy={node.y}
            r="78"
            fill="none"
            stroke="rgba(233,248,255,.14)"
            strokeWidth="1"
            strokeDasharray="0.04 0.026"
            strokeDashoffset={time * 0.055}
            pathLength={1}
          />

          <g clipPath={`url(#${id}-clip)`}>
            <rect
              x={node.x - 36 + shimmer}
              y={node.y - 190}
              width="58"
              height="380"
              rx="29"
              fill={`url(#${id}-sheen)`}
              opacity={0.28 + pulse * 0.12}
              transform={`rotate(18 ${node.x} ${node.y})`}
            />
            <ellipse
              cx={node.x - 42}
              cy={node.y - 60}
              rx="55"
              ry="23"
              fill="rgba(255,255,255,.17)"
              transform={`rotate(-24 ${node.x - 42} ${node.y - 60})`}
            />
            <path
              d={`M ${node.x - 100} ${node.y + 54} C ${node.x - 36} ${node.y + 96}, ${node.x + 54} ${node.y + 96}, ${node.x + 104} ${node.y + 24}`}
              fill="none"
              stroke={hexAlpha(node.color, 0.22)}
              strokeWidth="22"
              opacity="0.45"
              filter={`url(#${id}-glow)`}
            />
          </g>

          <path
            d={`M ${node.x - 82} ${node.y - 78} A 113 113 0 0 1 ${node.x + 43} ${node.y - 102}`}
            fill="none"
            stroke="rgba(255,255,255,.72)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M ${node.x + 82} ${node.y + 78} A 113 113 0 0 1 ${node.x - 42} ${node.y + 104}`}
            fill="none"
            stroke={hexAlpha(node.color, 0.48)}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        <g
          transform={`rotate(${orbitAngle} ${node.x} ${node.y})`}
          opacity={active}
        >
          <circle
            cx={node.x}
            cy={node.y - 143}
            r={4.2 + pulse * 1.4}
            fill={COLORS.white}
            filter={`url(#${id}-glow)`}
          />
          <circle cx={node.x} cy={node.y - 143} r="2.2" fill={node.color} />
          <circle
            cx={node.x}
            cy={node.y + 143}
            r="2.8"
            fill={node.color}
            opacity="0.74"
          />
        </g>
      </g>
    </svg>
  );
};

const NodeAtmosphere: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => (
  <>
    {NODES.map((node, index) => {
      const reveal = segment(
        frame,
        node.start + 40,
        node.start + 115,
        Easing.out(Easing.cubic),
      );
      const pulse = 0.5 + Math.sin(time * TAU * 0.17 + index * 1.15) * 0.5;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: node.x - 225,
            top: node.y - 225,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hexAlpha(
              node.color,
              0.16 + pulse * 0.035,
            )} 0%, ${hexAlpha(node.color, 0.055)} 31%, transparent 70%)`,
            filter: "blur(24px)",
            opacity: reveal,
            transform: `scale(${0.65 + reveal * 0.35 + pulse * 0.015})`,
          }}
        />
      );
    })}
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const intro = segment(frame, 0, 48, Easing.out(Easing.cubic));
  const finalEnergy = segment(frame, 585, 660, Easing.inOut(Easing.cubic));
  const breathe = Math.sin(time * TAU * 0.095) * 0.0022 * finalEnergy;

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        background: COLORS.night,
      }}
    >
      <Background frame={frame} time={time} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: intro,
          transform: `scale(${1 + breathe})`,
          transformOrigin: "50% 52%",
        }}
      >
        <NodeAtmosphere frame={frame} time={time} />
        <ConnectorLayer frame={frame} time={time} />
        {NODES.map((node, index) => (
          <GlassOrb
            key={index}
            frame={frame}
            time={time}
            node={node}
            index={index}
          />
        ))}
      </div>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.11,
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0, transparent 5px, rgba(193,232,255,.055) 6px, transparent 7px)",
          backgroundPositionY: `${modulo(time * 12, 7)}px`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
