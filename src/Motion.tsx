import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Point = {x: number; y: number};
type IconKind = "orbit" | "diamond" | "spark" | "check";

const PATH =
  "M 144 684 C 318 684, 356 286, 598 286 C 828 286, 806 694, 1064 694 C 1322 694, 1324 300, 1656 300";
const ROUTE_LENGTH = 2033;

const NODES: Array<{
  point: Point;
  color: string;
  threshold: number;
  pulseStart: number;
  icon: IconKind;
}> = [
  {
    point: {x: 144, y: 684},
    color: "#10BCEB",
    threshold: 0,
    pulseStart: 0.12,
    icon: "orbit",
  },
  {
    point: {x: 598, y: 286},
    color: "#8D43DA",
    threshold: 1 / 3,
    pulseStart: 0.327,
    icon: "diamond",
  },
  {
    point: {x: 1064, y: 694},
    color: "#FF8A38",
    threshold: 2 / 3,
    pulseStart: 0.533,
    icon: "spark",
  },
  {
    point: {x: 1656, y: 300},
    color: "#48C56E",
    threshold: 1,
    pulseStart: 0.74,
    icon: "check",
  },
];

const SEGMENTS: Array<[Point, Point, Point, Point]> = [
  [
    {x: 144, y: 684},
    {x: 318, y: 684},
    {x: 356, y: 286},
    {x: 598, y: 286},
  ],
  [
    {x: 598, y: 286},
    {x: 828, y: 286},
    {x: 806, y: 694},
    {x: 1064, y: 694},
  ],
  [
    {x: 1064, y: 694},
    {x: 1322, y: 694},
    {x: 1324, y: 300},
    {x: 1656, y: 300},
  ],
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const cubicPoint = (
  [p0, p1, p2, p3]: [Point, Point, Point, Point],
  t: number,
): Point => {
  const inv = 1 - t;
  return {
    x:
      inv ** 3 * p0.x +
      3 * inv ** 2 * t * p1.x +
      3 * inv * t ** 2 * p2.x +
      t ** 3 * p3.x,
    y:
      inv ** 3 * p0.y +
      3 * inv ** 2 * t * p1.y +
      3 * inv * t ** 2 * p2.y +
      t ** 3 * p3.y,
  };
};

const pointOnRoute = (progress: number): Point => {
  const bounded = clamp(progress);
  const scaled = Math.min(2.999999, bounded * 3);
  const segmentIndex = Math.floor(scaled);
  return cubicPoint(SEGMENTS[segmentIndex], scaled - segmentIndex);
};

const NodeIcon: React.FC<{kind: IconKind}> = ({kind}) => {
  const common = {
    fill: "none",
    stroke: "white",
    strokeWidth: 5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "orbit") {
    return (
      <g {...common}>
        <circle cx="0" cy="0" r="5" fill="white" stroke="none" />
        <ellipse cx="0" cy="0" rx="17" ry="8" transform="rotate(-24)" />
        <ellipse cx="0" cy="0" rx="17" ry="8" transform="rotate(54)" />
      </g>
    );
  }

  if (kind === "diamond") {
    return (
      <g {...common}>
        <path d="M 0 -18 L 16 0 L 0 18 L -16 0 Z" />
        <path d="M -16 0 H 16 M 0 -18 V 18" opacity="0.78" />
      </g>
    );
  }

  if (kind === "spark") {
    return (
      <g {...common}>
        <path d="M 0 -20 C 1 -8 8 -1 20 0 C 8 1 1 8 0 20 C -1 8 -8 1 -20 0 C -8 -1 -1 -8 0 -20 Z" />
        <circle cx="0" cy="0" r="3.5" fill="white" stroke="none" />
      </g>
    );
  }

  return (
    <g {...common}>
      <path d="M -17 1 L -5 13 L 18 -14" />
    </g>
  );
};

const NodeParticles: React.FC<{
  point: Point;
  color: string;
  pulse: number;
  seed: number;
}> = ({point, color, pulse, seed}) => {
  return (
    <>
      {Array.from({length: 8}, (_, index) => {
        const angle = (index / 8) * Math.PI * 2 + seed * 0.37;
        const stagger = (index % 3) * 0.08;
        const local = clamp((pulse - stagger) / (1 - stagger));
        const radius = interpolate(local, [0, 1], [30, 98], {
          easing: Easing.out(Easing.quad),
        });
        const opacity = Math.sin(local * Math.PI) * 0.68;
        const size = 4 + ((index + seed) % 3) * 2;
        return (
          <circle
            key={index}
            cx={point.x + Math.cos(angle) * radius}
            cy={point.y + Math.sin(angle) * radius}
            r={size * (1 - local * 0.55)}
            fill={color}
            opacity={opacity}
          />
        );
      })}
    </>
  );
};

const Milestone: React.FC<{
  point: Point;
  color: string;
  icon: IconKind;
  activeProgress: number;
  threshold: number;
  pulseStart: number;
  timeline: number;
  activeOpacity: number;
  index: number;
}> = ({
  point,
  color,
  icon,
  activeProgress,
  threshold,
  pulseStart,
  timeline,
  activeOpacity,
  index,
}) => {
  const pulse = clamp((timeline - pulseStart) / 0.06);
  const pulseIsActive = timeline >= pulseStart;
  const hasReached = activeProgress >= threshold;
  const bloom = Math.sin(pulse * Math.PI);
  const nodeScale = hasReached
    ? 1 + Math.sin(Math.min(1, pulse) * Math.PI) * 0.1
    : 1;

  return (
    <g>
      <circle
        cx={point.x}
        cy={point.y}
        r={44 + 54 * pulse}
        fill="none"
        stroke={color}
        strokeWidth={5 - pulse * 2}
        opacity={
          (pulseIsActive ? 1 : 0) * (1 - pulse) * 0.55 * activeOpacity
        }
      />
      <circle
        cx={point.x}
        cy={point.y}
        r={36}
        fill={color}
        opacity={0.18 + bloom * 0.22}
        filter="url(#softBlur)"
      />
      <g
        transform={`translate(${point.x} ${point.y}) scale(${nodeScale}) translate(${-point.x} ${-point.y})`}
      >
        <circle
          cx={point.x}
          cy={point.y + 6}
          r={43}
          fill="#15233A"
          opacity="0.12"
          filter="url(#shadowBlur)"
        />
        <circle
          cx={point.x}
          cy={point.y}
          r={42}
          fill={color}
          stroke="white"
          strokeWidth="7"
        />
        <circle
          cx={point.x - 12}
          cy={point.y - 13}
          r={14}
          fill="white"
          opacity="0.13"
        />
        <g transform={`translate(${point.x} ${point.y})`}>
          <NodeIcon kind={icon} />
        </g>
      </g>
      <NodeParticles
        point={point}
        color={color}
        pulse={pulse}
        seed={index + 1}
      />
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const timeline = frame / Math.max(1, durationInFrames - 1);

  const drawProgress = interpolate(timeline, [0.12, 0.74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  const activeOpacity = interpolate(timeline, [0.86, 0.98], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const endpoint = pointOnRoute(drawProgress);
  const endpointVisible =
    drawProgress > 0 && drawProgress < 0.998 ? activeOpacity : 0;
  const slowDrift = Math.sin(timeline * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 14% 14%, #F4FBFF 0, transparent 34%), radial-gradient(circle at 86% 82%, #F8FFF9 0, transparent 38%), #FCFDFE",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.24,
          backgroundImage:
            "radial-gradient(circle, rgba(70,95,125,0.18) 1.6px, transparent 1.8px)",
          backgroundSize: "38px 38px",
          maskImage:
            "linear-gradient(to bottom, transparent 5%, black 32%, black 78%, transparent 98%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -240 + slowDrift * 10,
          top: -310,
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: "rgba(16,188,235,0.045)",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -210 - slowDrift * 14,
          bottom: -360,
          width: 820,
          height: 820,
          borderRadius: "50%",
          background: "rgba(72,197,110,0.045)",
          filter: "blur(2px)",
        }}
      />

      <svg
        viewBox="0 0 1920 1080"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id="routeGradient"
            x1="144"
            y1="0"
            x2="1656"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#10BCEB" />
            <stop offset="29%" stopColor="#644FE2" />
            <stop offset="47%" stopColor="#B946A5" />
            <stop offset="66%" stopColor="#FF8A38" />
            <stop offset="82%" stopColor="#E7BA28" />
            <stop offset="100%" stopColor="#48C56E" />
          </linearGradient>
          <filter id="trackShadow" x="-20%" y="-30%" width="140%" height="160%">
            <feDropShadow
              dx="0"
              dy="12"
              stdDeviation="14"
              floodColor="#15345A"
              floodOpacity="0.10"
            />
          </filter>
          <filter id="routeGlow" x="-30%" y="-40%" width="160%" height="180%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
          <filter id="softBlur" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="shadowBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <radialGradient id="endpointGlow">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="35%" stopColor="#FFF4C8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10BCEB" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d={PATH}
          fill="none"
          stroke="#EAF0F5"
          strokeWidth="34"
          strokeLinecap="round"
          filter="url(#trackShadow)"
        />
        <path
          d={PATH}
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.72"
        />

        <g opacity={activeOpacity}>
          <path
            d={PATH}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="60"
            strokeLinecap="round"
            strokeDasharray={ROUTE_LENGTH}
            strokeDashoffset={ROUTE_LENGTH * (1 - drawProgress)}
            opacity="0.22"
            filter="url(#routeGlow)"
          />
          <path
            d={PATH}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="30"
            strokeLinecap="round"
            strokeDasharray={ROUTE_LENGTH}
            strokeDashoffset={ROUTE_LENGTH * (1 - drawProgress)}
          />
          <path
            d={PATH}
            fill="none"
            stroke="rgba(255,255,255,0.48)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={ROUTE_LENGTH}
            strokeDashoffset={ROUTE_LENGTH * (1 - drawProgress)}
            transform="translate(0 -5)"
          />
        </g>

        <circle
          cx={endpoint.x}
          cy={endpoint.y}
          r="45"
          fill="url(#endpointGlow)"
          opacity={endpointVisible * 0.9}
          filter="url(#softBlur)"
        />
        <circle
          cx={endpoint.x}
          cy={endpoint.y}
          r="8"
          fill="white"
          opacity={endpointVisible}
        />

        {NODES.map((node, index) => (
          <Milestone
            key={index}
            {...node}
            activeProgress={drawProgress}
            timeline={timeline}
            activeOpacity={activeOpacity}
            index={index}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
