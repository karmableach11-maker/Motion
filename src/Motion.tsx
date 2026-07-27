import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const CENTER_X = 1000;
const CENTER_Y = 540;
const CORE_RADIUS = 220;
const ORBIT_RADIUS = 286;
const NODE_RADIUS = 74;
const TAU = Math.PI * 2;

type Point = {
  readonly x: number;
  readonly y: number;
};

type NodeSpec = {
  readonly id: "purple" | "pink" | "blue" | "teal" | "orange";
  readonly angle: number;
  readonly startFrame: number;
  readonly travelFrames: number;
  readonly calloutStart: number;
  readonly color: string;
  readonly light: string;
  readonly dark: string;
  readonly elbow: Point;
  readonly endpoint: Point;
  readonly phase: number;
};

const NODES: readonly NodeSpec[] = [
  {
    id: "purple",
    angle: 68,
    startFrame: 64,
    travelFrames: 50,
    calloutStart: 198,
    color: "#6539ad",
    light: "#8958d0",
    dark: "#422276",
    elbow: { x: 1224, y: 918 },
    endpoint: { x: 1440, y: 918 },
    phase: 0.2,
  },
  {
    id: "pink",
    angle: 34,
    startFrame: 94,
    travelFrames: 46,
    calloutStart: 228,
    color: "#e72c83",
    light: "#f2519c",
    dark: "#ad155b",
    elbow: { x: 1418, y: 782 },
    endpoint: { x: 1652, y: 782 },
    phase: 1.35,
  },
  {
    id: "blue",
    angle: 0,
    startFrame: 124,
    travelFrames: 42,
    calloutStart: 258,
    color: "#49a4d4",
    light: "#72bee3",
    dark: "#2678aa",
    elbow: { x: 1450, y: 540 },
    endpoint: { x: 1648, y: 540 },
    phase: 2.55,
  },
  {
    id: "teal",
    angle: -34,
    startFrame: 154,
    travelFrames: 37,
    calloutStart: 288,
    color: "#35c3c4",
    light: "#68dcda",
    dark: "#168d98",
    elbow: { x: 1415, y: 307 },
    endpoint: { x: 1644, y: 307 },
    phase: 3.7,
  },
  {
    id: "orange",
    angle: -68,
    startFrame: 184,
    travelFrames: 31,
    calloutStart: 318,
    color: "#f39a16",
    light: "#ffbd46",
    dark: "#c66b05",
    elbow: { x: 1223, y: 164 },
    endpoint: { x: 1440, y: 164 },
    phase: 4.85,
  },
] as const;

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.out(Easing.cubic),
): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const pointOnCircle = (
  angleDegrees: number,
  radius: number,
  centerX = CENTER_X,
  centerY = CENTER_Y,
): Point => {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: centerX + Math.cos(radians) * radius,
    y: centerY + Math.sin(radians) * radius,
  };
};

const arcPath = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const start = pointOnCircle(startAngle, radius, centerX, centerY);
  const end = pointOnCircle(endAngle, radius, centerX, centerY);
  const sweep = Math.abs(endAngle - startAngle);
  const largeArc = sweep > 180 ? 1 : 0;
  const direction = endAngle >= startAngle ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${direction} ${end.x} ${end.y}`;
};

const polylinePath = (points: readonly Point[]): string =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

const DrawnPath: React.FC<{
  readonly d: string;
  readonly reveal: number;
  readonly stroke: string;
  readonly width: number;
  readonly opacity?: number;
}> = ({ d, reveal, stroke, width, opacity = 1 }) => (
  <path
    d={d}
    fill="none"
    pathLength={1}
    stroke={stroke}
    strokeDasharray="1"
    strokeDashoffset={1 - reveal}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={width}
    opacity={opacity}
  />
);

const PersonIcon: React.FC<{ readonly reveal: number }> = ({ reveal }) => {
  const iconScale = mix(0.65, 1, reveal);
  return (
    <g
      opacity={reveal}
      transform={`scale(${iconScale})`}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    >
      <circle cx="0" cy="-17" r="13.5" fill="#ffffff" />
      <path
        d="M -31 31 C -29 8 -17 -4 0 -4 C 17 -4 29 8 31 31 C 22 39 12 42 0 42 C -12 42 -22 39 -31 31 Z"
        fill="#ffffff"
      />
      <path
        d="M -17 8 C -9 14 9 14 17 8"
        fill="none"
        stroke="rgba(255,255,255,0.72)"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </g>
  );
};

const Node: React.FC<{
  readonly frame: number;
  readonly spec: NodeSpec;
}> = ({ frame, spec }) => {
  const travel = progress(
    frame,
    spec.startFrame,
    spec.startFrame + spec.travelFrames,
    Easing.inOut(Easing.cubic),
  );
  const entrance = progress(
    frame,
    spec.startFrame,
    spec.startFrame + Math.min(25, spec.travelFrames * 0.66),
  );
  const iconReveal = progress(
    frame,
    spec.startFrame + Math.min(13, spec.travelFrames * 0.34),
    spec.startFrame + Math.min(31, spec.travelFrames * 0.82),
  );
  const startAngle = -53;
  const angle = mix(startAngle, spec.angle, travel);
  const radius = ORBIT_RADIUS + (1 - travel) * 22;
  const position = pointOnCircle(angle, radius);
  const pop = interpolate(
    entrance,
    [0, 0.72, 1],
    [0.55, 1.045, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const holdStart = spec.startFrame + spec.travelFrames;
  const holdMix = progress(frame, holdStart, holdStart + 24);
  const holdPulse =
    1 +
    Math.sin((frame * 0.018 + spec.phase) * TAU) *
      0.0045 *
      holdMix;
  const scale = pop * holdPulse;

  const arcReveal = progress(
    frame,
    spec.startFrame + spec.travelFrames * 0.58,
    spec.startFrame + spec.travelFrames + 21,
    Easing.inOut(Easing.cubic),
  );
  const localArcStart = -77;
  const localArcEnd = 79;
  const localArcRadius = NODE_RADIUS + 20;
  const arcStart = pointOnCircle(
    localArcStart,
    localArcRadius,
    position.x,
    position.y,
  );
  const arcEnd = pointOnCircle(
    localArcEnd,
    localArcRadius,
    position.x,
    position.y,
  );
  const endpointScale = progress(frame, holdStart + 7, holdStart + 20);

  return (
    <g>
      <g opacity={arcReveal}>
        <DrawnPath
          d={arcPath(
            position.x,
            position.y,
            localArcRadius,
            localArcStart,
            localArcEnd,
          )}
          reveal={arcReveal}
          stroke="#465356"
          width={3}
          opacity={0.86}
        />
        <circle
          cx={arcStart.x}
          cy={arcStart.y}
          r={5 * endpointScale}
          fill="#465356"
        />
        <circle
          cx={arcEnd.x}
          cy={arcEnd.y}
          r={5 * endpointScale}
          fill="#465356"
        />
      </g>

      <g
        opacity={entrance}
        transform={`translate(${position.x} ${position.y}) scale(${scale})`}
      >
        <circle
          cx="9"
          cy="12"
          r={NODE_RADIUS + 2}
          fill="rgba(44,54,55,0.18)"
          filter="url(#m26-node-shadow)"
        />
        <circle
          r={NODE_RADIUS + 2.5}
          fill="#ffffff"
          stroke="rgba(255,255,255,0.98)"
          strokeWidth="5"
        />
        <circle
          r={NODE_RADIUS - 4}
          fill={`url(#m26-node-${spec.id})`}
          stroke={spec.dark}
          strokeWidth="2"
        />
        <circle
          r={NODE_RADIUS - 13}
          fill="none"
          stroke="rgba(255,255,255,0.44)"
          strokeWidth="2.5"
        />
        <path
          d={arcPath(0, 0, NODE_RADIUS - 8, 208, 312)}
          fill="none"
          stroke="rgba(255,255,255,0.56)"
          strokeLinecap="round"
          strokeWidth="7"
        />
        <ellipse
          cx="-23"
          cy="-32"
          rx="20"
          ry="11"
          fill="rgba(255,255,255,0.2)"
          transform="rotate(-24 -23 -32)"
        />
        <PersonIcon reveal={iconReveal} />
      </g>
    </g>
  );
};

const BlankCallout: React.FC<{
  readonly frame: number;
  readonly spec: NodeSpec;
}> = ({ frame, spec }) => {
  const nodeCenter = pointOnCircle(spec.angle, ORBIT_RADIUS);
  const radians = (spec.angle * Math.PI) / 180;
  const start = {
    x: nodeCenter.x + Math.cos(radians) * (NODE_RADIUS + 26),
    y: nodeCenter.y + Math.sin(radians) * (NODE_RADIUS + 26),
  };
  const lineReveal = progress(
    frame,
    spec.calloutStart,
    spec.calloutStart + 38,
    Easing.inOut(Easing.cubic),
  );
  const endpointReveal = progress(
    frame,
    spec.calloutStart + 28,
    spec.calloutStart + 43,
  );
  const endpointPulse =
    1 + Math.sin((frame * 0.013 + spec.phase) * TAU) * 0.045;

  return (
    <g>
      <DrawnPath
        d={polylinePath([start, spec.elbow, spec.endpoint])}
        reveal={lineReveal}
        stroke="#526064"
        width={3}
        opacity={0.86}
      />
      <circle
        cx={start.x}
        cy={start.y}
        r={5.5 * endpointReveal}
        fill="#526064"
      />
      <g
        opacity={endpointReveal}
        transform={`translate(${spec.endpoint.x} ${spec.endpoint.y}) scale(${endpointReveal * endpointPulse})`}
      >
        <circle r="11" fill="#ffffff" stroke="#526064" strokeWidth="2.4" />
        <circle r="5.5" fill={spec.color} />
      </g>
    </g>
  );
};

const CentralSystem: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const coreReveal = progress(frame, 0, 27, Easing.out(Easing.quad));
  const frontDiscReveal = progress(frame, 7, 34, Easing.out(Easing.cubic));
  const backRingReveal = progress(frame, 6, 37, Easing.out(Easing.cubic));
  const frontRingReveal = progress(frame, 14, 47, Easing.out(Easing.cubic));
  const outerArcReveal = progress(
    frame,
    25,
    61,
    Easing.inOut(Easing.cubic),
  );
  const innerArcReveal = progress(
    frame,
    31,
    67,
    Easing.inOut(Easing.cubic),
  );
  const orbitDotReveal = progress(frame, 52, 67);
  const leftLineReveal = progress(
    frame,
    94,
    142,
    Easing.inOut(Easing.cubic),
  );
  const leftEndpointReveal = progress(frame, 128, 148);
  const accentReveal = progress(frame, 26, 59);
  const shimmerReveal = progress(frame, 356, 400);
  const shimmerAngle = ((frame - 356) * 0.075) % 360;

  const outerArcStart = pointOnCircle(162, 301);
  const outerArcEnd = pointOnCircle(467, 301);
  const innerArcStart = pointOnCircle(196, 264);
  const innerArcEnd = pointOnCircle(493, 264);

  const coreScale = interpolate(
    coreReveal,
    [0, 0.75, 1],
    [0.22, 1.025, 1],
  );
  const discScale = interpolate(
    frontDiscReveal,
    [0, 0.72, 1],
    [0.4, 1.018, 1],
  );

  return (
    <g>
      <g
        opacity={backRingReveal}
        transform={`translate(${CENTER_X} ${CENTER_Y}) scale(${mix(
          0.62,
          1,
          backRingReveal,
        )}) translate(${-CENTER_X} ${-CENTER_Y})`}
      >
        <circle
          cx={CENTER_X + 5}
          cy={CENTER_Y + 10}
          r="280"
          fill="none"
          stroke="rgba(59,72,74,0.13)"
          strokeWidth="22"
          filter="url(#m26-ring-shadow)"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r="278"
          fill="none"
          stroke="url(#m26-ring-outer)"
          strokeWidth="22"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r="266"
          fill="none"
          stroke="rgba(135,148,149,0.42)"
          strokeWidth="2"
        />
      </g>

      <g
        opacity={frontRingReveal}
        transform={`translate(${CENTER_X} ${CENTER_Y}) scale(${mix(
          0.68,
          1,
          frontRingReveal,
        )}) translate(${-CENTER_X} ${-CENTER_Y})`}
      >
        <circle
          cx={CENTER_X + 4}
          cy={CENTER_Y + 8}
          r="247"
          fill="none"
          stroke="rgba(45,55,56,0.12)"
          strokeWidth="18"
          filter="url(#m26-ring-shadow)"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r="246"
          fill="none"
          stroke="url(#m26-ring-inner)"
          strokeWidth="18"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r="235"
          fill="none"
          stroke="rgba(120,135,136,0.24)"
          strokeWidth="2"
        />
      </g>

      <g>
        <DrawnPath
          d={arcPath(CENTER_X, CENTER_Y, 301, 162, 467)}
          reveal={outerArcReveal}
          stroke="#465255"
          width={3.5}
          opacity={0.92}
        />
        <DrawnPath
          d={arcPath(CENTER_X, CENTER_Y, 264, 196, 493)}
          reveal={innerArcReveal}
          stroke="#5b6769"
          width={2.5}
          opacity={0.7}
        />
        <circle
          cx={outerArcStart.x}
          cy={outerArcStart.y}
          r={6 * orbitDotReveal}
          fill="#465255"
        />
        <circle
          cx={outerArcEnd.x}
          cy={outerArcEnd.y}
          r={6 * orbitDotReveal}
          fill="#465255"
        />
        <circle
          cx={innerArcStart.x}
          cy={innerArcStart.y}
          r={4.5 * orbitDotReveal}
          fill="#5b6769"
        />
        <circle
          cx={innerArcEnd.x}
          cy={innerArcEnd.y}
          r={4.5 * orbitDotReveal}
          fill="#5b6769"
        />
      </g>

      <g
        opacity={coreReveal}
        transform={`translate(${CENTER_X} ${CENTER_Y}) scale(${coreScale})`}
      >
        <circle
          cx="8"
          cy="12"
          r={CORE_RADIUS + 3}
          fill="rgba(41,52,54,0.17)"
          filter="url(#m26-core-shadow)"
        />
        <circle
          r={CORE_RADIUS + 3}
          fill="url(#m26-core-face)"
          stroke="rgba(148,159,160,0.3)"
          strokeWidth="2"
        />
      </g>

      <g
        opacity={frontDiscReveal}
        transform={`translate(${CENTER_X} ${CENTER_Y}) scale(${discScale})`}
      >
        <circle
          r={CORE_RADIUS - 7}
          fill="url(#m26-disc-face)"
          stroke="#ffffff"
          strokeWidth="4"
        />
        <path
          d={arcPath(0, 0, CORE_RADIUS - 19, 210, 326)}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d={arcPath(0, 0, CORE_RADIUS - 17, 28, 120)}
          fill="none"
          stroke="rgba(145,158,159,0.11)"
          strokeLinecap="round"
          strokeWidth="5"
        />

        <g
          opacity={accentReveal}
          transform={`translate(0 86) scale(${accentReveal})`}
        >
          {NODES.slice()
            .reverse()
            .map((node, index) => (
              <circle
                key={node.id}
                cx={(index - 2) * 28}
                cy="0"
                r="7.5"
                fill={node.color}
                stroke="#ffffff"
                strokeWidth="2"
              />
            ))}
        </g>
      </g>

      <g>
        <DrawnPath
          d={polylinePath([
            { x: CENTER_X - CORE_RADIUS - 8, y: CENTER_Y },
            { x: 655, y: CENTER_Y },
            { x: 500, y: CENTER_Y },
          ])}
          reveal={leftLineReveal}
          stroke="#4c585b"
          width={4}
          opacity={0.92}
        />
        <circle
          cx={CENTER_X - CORE_RADIUS - 8}
          cy={CENTER_Y}
          r={7 * leftEndpointReveal}
          fill="#4c585b"
        />
        <g
          opacity={leftEndpointReveal}
          transform={`translate(500 ${CENTER_Y}) scale(${leftEndpointReveal})`}
        >
          <circle r="15" fill="#ffffff" stroke="#4c585b" strokeWidth="3" />
          <circle r="8" fill="#4c585b" />
        </g>
      </g>

      <g
        opacity={0.28 * shimmerReveal}
        transform={`rotate(${shimmerAngle} ${CENTER_X} ${CENTER_Y})`}
      >
        <path
          d={arcPath(CENTER_X, CENTER_Y, 248, -38, 26)}
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeWidth="8"
          filter="url(#m26-soft-glow)"
        />
      </g>
    </g>
  );
};

const Background: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 53% 48%, #ffffff 0%, #f8fbfa 42%, #f0f5f3 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.22,
        backgroundImage:
          "radial-gradient(circle at 68% 28%, rgba(45,196,196,0.10), transparent 24%), radial-gradient(circle at 67% 72%, rgba(231,44,131,0.08), transparent 25%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.16,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(62,78,79,0.025) 0px, rgba(62,78,79,0.025) 1px, transparent 1px, transparent 5px)",
        mixBlendMode: "multiply",
      }}
    />
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const globalReveal = progress(frame, 0, 12, Easing.out(Easing.quad));

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
      }}
    >
      <Background />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0, opacity: globalReveal }}
      >
        <defs>
          <linearGradient id="m26-ring-outer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.42" stopColor="#f4f7f6" />
            <stop offset="0.72" stopColor="#dce2e0" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id="m26-ring-inner" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.52" stopColor="#e9edec" />
            <stop offset="0.78" stopColor="#d6dcda" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <radialGradient id="m26-core-face" cx="35%" cy="27%" r="80%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.66" stopColor="#f9fbfa" />
            <stop offset="1" stopColor="#e7ecea" />
          </radialGradient>
          <radialGradient id="m26-disc-face" cx="31%" cy="24%" r="82%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.74" stopColor="#fdfefe" />
            <stop offset="1" stopColor="#f0f4f2" />
          </radialGradient>

          {NODES.map((node) => (
            <radialGradient
              key={node.id}
              id={`m26-node-${node.id}`}
              cx="31%"
              cy="24%"
              r="82%"
            >
              <stop offset="0" stopColor={node.light} />
              <stop offset="0.55" stopColor={node.color} />
              <stop offset="1" stopColor={node.dark} />
            </radialGradient>
          ))}

          <filter
            id="m26-ring-shadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter
            id="m26-core-shadow"
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
          >
            <feGaussianBlur stdDeviation="13" />
          </filter>
          <filter
            id="m26-node-shadow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="11" />
          </filter>
          <filter
            id="m26-soft-glow"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <ellipse
          cx={CENTER_X + 10}
          cy={CENTER_Y + 300}
          rx="310"
          ry="42"
          fill="rgba(48,63,64,0.08)"
          filter="url(#m26-soft-glow)"
          opacity={progress(frame, 0, 48)}
        />

        <CentralSystem frame={frame} />

        {NODES.map((node) => (
          <BlankCallout key={`callout-${node.id}`} frame={frame} spec={node} />
        ))}

        {NODES.map((node) => (
          <Node key={node.id} frame={frame} spec={node} />
        ))}
      </svg>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow:
            "inset 0 0 150px rgba(103,124,123,0.07), inset 0 0 24px rgba(255,255,255,0.95)",
        }}
      />
    </AbsoluteFill>
  );
};
