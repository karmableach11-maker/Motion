import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Point = {x: number; y: number};
type IconKind =
  | "core"
  | "hub"
  | "bolt"
  | "gem"
  | "star"
  | "shield"
  | "flame"
  | "crown";

type NodeSpec = {
  id: string;
  point: Point;
  color: string;
  icon: IconKind;
  activation: number;
  radius: number;
  tier: "core" | "hub" | "achievement";
};

type BranchSpec = {
  id: string;
  from: Point;
  to: Point;
  d: string;
  length: number;
  color: string;
  start: number;
  end: number;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const phase = (timeline: number, start: number, end: number) =>
  interpolate(timeline, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

const CORE: Point = {x: 960, y: 790};

const HUBS = {
  left: {x: 565, y: 570},
  center: {x: 960, y: 505},
  right: {x: 1355, y: 570},
};

const LEAVES = {
  farLeft: {x: 265, y: 310},
  nearLeft: {x: 665, y: 255},
  centerLeft: {x: 845, y: 180},
  centerRight: {x: 1075, y: 180},
  nearRight: {x: 1255, y: 255},
  farRight: {x: 1655, y: 310},
};

const NODES: NodeSpec[] = [
  {
    id: "core",
    point: CORE,
    color: "#4F6CF7",
    icon: "core",
    activation: 0.115,
    radius: 56,
    tier: "core",
  },
  {
    id: "hub-left",
    point: HUBS.left,
    color: "#17BBD3",
    icon: "hub",
    activation: 0.37,
    radius: 38,
    tier: "hub",
  },
  {
    id: "hub-center",
    point: HUBS.center,
    color: "#8B5CF6",
    icon: "hub",
    activation: 0.405,
    radius: 38,
    tier: "hub",
  },
  {
    id: "hub-right",
    point: HUBS.right,
    color: "#F27B45",
    icon: "hub",
    activation: 0.44,
    radius: 38,
    tier: "hub",
  },
  {
    id: "achievement-far-left",
    point: LEAVES.farLeft,
    color: "#21B8D5",
    icon: "bolt",
    activation: 0.585,
    radius: 48,
    tier: "achievement",
  },
  {
    id: "achievement-near-left",
    point: LEAVES.nearLeft,
    color: "#39C78A",
    icon: "gem",
    activation: 0.625,
    radius: 48,
    tier: "achievement",
  },
  {
    id: "achievement-center-left",
    point: LEAVES.centerLeft,
    color: "#8B5CF6",
    icon: "star",
    activation: 0.645,
    radius: 48,
    tier: "achievement",
  },
  {
    id: "achievement-center-right",
    point: LEAVES.centerRight,
    color: "#E94F91",
    icon: "shield",
    activation: 0.67,
    radius: 48,
    tier: "achievement",
  },
  {
    id: "achievement-near-right",
    point: LEAVES.nearRight,
    color: "#F39C3D",
    icon: "flame",
    activation: 0.695,
    radius: 48,
    tier: "achievement",
  },
  {
    id: "achievement-far-right",
    point: LEAVES.farRight,
    color: "#E7C83D",
    icon: "crown",
    activation: 0.72,
    radius: 48,
    tier: "achievement",
  },
];

const BRANCHES: BranchSpec[] = [
  {
    id: "trunk-left",
    from: CORE,
    to: HUBS.left,
    d: "M 960 790 C 864 790, 760 694, 565 570",
    length: 456.78,
    color: "#17BBD3",
    start: 0.16,
    end: 0.37,
  },
  {
    id: "trunk-center",
    from: CORE,
    to: HUBS.center,
    d: "M 960 790 C 960 712, 960 620, 960 505",
    length: 285,
    color: "#8B5CF6",
    start: 0.19,
    end: 0.405,
  },
  {
    id: "trunk-right",
    from: CORE,
    to: HUBS.right,
    d: "M 960 790 C 1056 790, 1160 694, 1355 570",
    length: 456.78,
    color: "#F27B45",
    start: 0.22,
    end: 0.44,
  },
  {
    id: "leaf-far-left",
    from: HUBS.left,
    to: LEAVES.farLeft,
    d: "M 565 570 C 500 510, 410 412, 265 310",
    length: 397.47,
    color: "#21B8D5",
    start: 0.405,
    end: 0.585,
  },
  {
    id: "leaf-near-left",
    from: HUBS.left,
    to: LEAVES.nearLeft,
    d: "M 565 570 C 585 474, 620 348, 665 255",
    length: 331.23,
    color: "#39C78A",
    start: 0.445,
    end: 0.625,
  },
  {
    id: "leaf-center-left",
    from: HUBS.center,
    to: LEAVES.centerLeft,
    d: "M 960 505 C 930 410, 888 274, 845 180",
    length: 344.95,
    color: "#8B5CF6",
    start: 0.48,
    end: 0.645,
  },
  {
    id: "leaf-center-right",
    from: HUBS.center,
    to: LEAVES.centerRight,
    d: "M 960 505 C 990 410, 1032 274, 1075 180",
    length: 344.95,
    color: "#E94F91",
    start: 0.505,
    end: 0.67,
  },
  {
    id: "leaf-near-right",
    from: HUBS.right,
    to: LEAVES.nearRight,
    d: "M 1355 570 C 1335 474, 1300 348, 1255 255",
    length: 331.23,
    color: "#F39C3D",
    start: 0.53,
    end: 0.695,
  },
  {
    id: "leaf-far-right",
    from: HUBS.right,
    to: LEAVES.farRight,
    d: "M 1355 570 C 1420 510, 1510 412, 1655 310",
    length: 397.47,
    color: "#E7C83D",
    start: 0.555,
    end: 0.72,
  },
];

const NodeIcon: React.FC<{kind: IconKind}> = ({kind}) => {
  const line = {
    fill: "none",
    stroke: "white",
    strokeWidth: 4.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "core") {
    return (
      <g>
        <rect
          x="-16"
          y="-16"
          width="32"
          height="32"
          rx="7"
          fill="none"
          stroke="white"
          strokeWidth="5"
          transform="rotate(45)"
        />
        <circle cx="0" cy="0" r="6" fill="white" />
      </g>
    );
  }

  if (kind === "hub") {
    return (
      <g {...line}>
        <circle cx="0" cy="0" r="11" />
        <circle cx="0" cy="0" r="3.5" fill="white" stroke="none" />
      </g>
    );
  }

  if (kind === "bolt") {
    return <path d="M 4 -24 L -14 3 H -2 L -7 24 L 17 -8 H 4 Z" {...line} />;
  }

  if (kind === "gem") {
    return (
      <g {...line}>
        <path d="M -23 -8 L -12 -21 H 12 L 23 -8 L 0 23 Z" />
        <path d="M -23 -8 H 23 M -12 -21 L 0 23 L 12 -21" opacity="0.78" />
      </g>
    );
  }

  if (kind === "star") {
    return (
      <path
        d="M 0 -24 L 7 -8 L 24 -7 L 11 5 L 15 22 L 0 13 L -15 22 L -11 5 L -24 -7 L -7 -8 Z"
        {...line}
      />
    );
  }

  if (kind === "shield") {
    return (
      <g {...line}>
        <path d="M 0 -24 C 8 -18 15 -16 23 -15 V 0 C 23 13 13 22 0 27 C -13 22 -23 13 -23 0 V -15 C -15 -16 -8 -18 0 -24 Z" />
        <path d="M -10 1 L -3 8 L 12 -8" />
      </g>
    );
  }

  if (kind === "flame") {
    return (
      <path
        d="M 1 -26 C 5 -11 20 -6 18 9 C 17 20 9 27 0 27 C -11 27 -20 19 -19 8 C -18 -2 -11 -8 -5 -15 C -4 -8 0 -5 3 -3 C 6 -10 4 -18 1 -26 Z"
        {...line}
      />
    );
  }

  return (
    <g {...line}>
      <path d="M -24 -11 L -12 2 L 0 -15 L 12 2 L 24 -11 L 19 16 H -19 Z" />
      <path d="M -18 16 H 18" />
    </g>
  );
};

const ParticleBurst: React.FC<{
  node: NodeSpec;
  timeline: number;
  activeOpacity: number;
  seed: number;
}> = ({node, timeline, activeOpacity, seed}) => {
  const local = clamp((timeline - node.activation) / 0.075);

  return (
    <>
      {Array.from({length: node.tier === "achievement" ? 10 : 7}, (_, index) => {
        const angle =
          (index /
            (node.tier === "achievement" ? 10 : 7)) *
            Math.PI *
            2 +
          seed * 0.43;
        const delayed = clamp((local - (index % 3) * 0.055) / 0.89);
        const distance = interpolate(delayed, [0, 1], [node.radius + 8, node.radius + 68], {
          easing: Easing.out(Easing.cubic),
        });
        const particleOpacity =
          Math.sin(delayed * Math.PI) * activeOpacity * (node.tier === "hub" ? 0.55 : 0.78);
        const size = 3.5 + ((index + seed) % 3) * 1.7;

        return (
          <circle
            key={index}
            cx={node.point.x + Math.cos(angle) * distance}
            cy={node.point.y + Math.sin(angle) * distance}
            r={size * (1 - delayed * 0.42)}
            fill={node.color}
            opacity={particleOpacity}
          />
        );
      })}
    </>
  );
};

const SkillNode: React.FC<{
  node: NodeSpec;
  timeline: number;
  activeOpacity: number;
  index: number;
}> = ({node, timeline, activeOpacity, index}) => {
  const activation = phase(timeline, node.activation - 0.012, node.activation + 0.026);
  const pulse = clamp((timeline - node.activation) / 0.082);
  const pulseBloom = Math.sin(pulse * Math.PI);
  const activeScale = 0.82 + activation * 0.18 + pulseBloom * 0.1;
  const baseOpacity = node.tier === "core" ? 0.42 : node.tier === "hub" ? 0.31 : 0.34;

  return (
    <g>
      <circle
        cx={node.point.x}
        cy={node.point.y}
        r={node.radius + 9}
        fill="white"
        stroke="#DCE6F2"
        strokeWidth="3"
        opacity="0.94"
        filter="url(#nodeShadow)"
      />
      <circle
        cx={node.point.x}
        cy={node.point.y}
        r={node.radius}
        fill={node.color}
        opacity={baseOpacity}
      />
      <circle
        cx={node.point.x}
        cy={node.point.y}
        r={node.radius + interpolate(pulse, [0, 1], [8, 74])}
        fill="none"
        stroke={node.color}
        strokeWidth={interpolate(pulse, [0, 1], [8, 2.5])}
        opacity={(1 - pulse) * activeOpacity * (timeline >= node.activation ? 0.66 : 0)}
      />
      <circle
        cx={node.point.x}
        cy={node.point.y}
        r={node.radius + 22}
        fill={node.color}
        opacity={pulseBloom * activeOpacity * 0.2}
        filter="url(#nodeBloom)"
      />
      <g
        opacity={activation * activeOpacity}
        transform={`translate(${node.point.x} ${node.point.y}) scale(${activeScale})`}
      >
        <circle cx="0" cy="0" r={node.radius} fill={node.color} />
        <circle
          cx={-node.radius * 0.28}
          cy={-node.radius * 0.34}
          r={node.radius * 0.25}
          fill="white"
          opacity="0.16"
        />
        <NodeIcon kind={node.icon} />
      </g>
      <ParticleBurst
        node={node}
        timeline={timeline}
        activeOpacity={activeOpacity}
        seed={index + 1}
      />
    </g>
  );
};

const DecorativeLayer: React.FC<{timeline: number}> = ({timeline}) => {
  const drift = Math.sin(timeline * Math.PI * 2);
  const counterDrift = Math.cos(timeline * Math.PI * 2);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.19,
          backgroundImage:
            "radial-gradient(circle, rgba(67,91,128,0.20) 1.5px, transparent 1.7px)",
          backgroundSize: "40px 40px",
          maskImage:
            "linear-gradient(to bottom, transparent 4%, black 24%, black 82%, transparent 98%)",
          transform: `translate(${drift * 4}px, ${counterDrift * 3}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -250 + drift * 14,
          top: 90 + counterDrift * 7,
          width: 590,
          height: 590,
          borderRadius: "50%",
          background: "rgba(25,187,211,0.055)",
          filter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -310 - drift * 17,
          top: -120 - counterDrift * 9,
          width: 690,
          height: 690,
          borderRadius: "50%",
          background: "rgba(233,79,145,0.048)",
          filter: "blur(5px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 690 - counterDrift * 9,
          bottom: -480 + drift * 6,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "rgba(79,108,247,0.045)",
          filter: "blur(4px)",
        }}
      />
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const timeline = frame / Math.max(1, durationInFrames - 1);
  const activeOpacity = interpolate(timeline, [0.865, 0.975], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const completionBreath = interpolate(
    timeline,
    [0.72, 0.77, 0.84, 0.865],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 86%, #F5F7FF 0%, transparent 38%), radial-gradient(circle at 12% 20%, #F2FCFE 0%, transparent 34%), radial-gradient(circle at 88% 18%, #FFF7F3 0%, transparent 35%), #FCFDFE",
      }}
    >
      <DecorativeLayer timeline={timeline} />

      <svg
        viewBox="0 0 1920 1080"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="trackShadow" x="-20%" y="-30%" width="140%" height="170%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="12"
              floodColor="#284365"
              floodOpacity="0.09"
            />
          </filter>
          <filter id="activeGlow" x="-40%" y="-50%" width="180%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="nodeShadow" x="-100%" y="-100%" width="300%" height="320%">
            <feDropShadow
              dx="0"
              dy="9"
              stdDeviation="11"
              floodColor="#284365"
              floodOpacity="0.15"
            />
          </filter>
          <filter id="nodeBloom" x="-180%" y="-180%" width="460%" height="460%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          {BRANCHES.map((branch) => (
            <linearGradient
              key={branch.id}
              id={`gradient-${branch.id}`}
              x1={branch.from.x}
              y1={branch.from.y}
              x2={branch.to.x}
              y2={branch.to.y}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#5971F5" />
              <stop offset="100%" stopColor={branch.color} />
            </linearGradient>
          ))}
        </defs>

        <g opacity="0.96" filter="url(#trackShadow)">
          {BRANCHES.map((branch) => (
            <path
              key={branch.id}
              d={branch.d}
              fill="none"
              stroke="#E6EDF5"
              strokeWidth="25"
              strokeLinecap="round"
            />
          ))}
        </g>
        <g opacity="0.72">
          {BRANCHES.map((branch) => (
            <path
              key={branch.id}
              d={branch.d}
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ))}
        </g>

        <g opacity={activeOpacity}>
          {BRANCHES.map((branch) => {
            const progress = phase(timeline, branch.start, branch.end);

            return (
              <g key={branch.id}>
                <path
                  d={branch.d}
                  fill="none"
                  stroke={branch.color}
                  strokeWidth="54"
                  strokeLinecap="round"
                  strokeDasharray={branch.length}
                  strokeDashoffset={branch.length * (1 - progress)}
                  opacity="0.17"
                  filter="url(#activeGlow)"
                />
                <path
                  d={branch.d}
                  fill="none"
                  stroke={`url(#gradient-${branch.id})`}
                  strokeWidth="23"
                  strokeLinecap="round"
                  strokeDasharray={branch.length}
                  strokeDashoffset={branch.length * (1 - progress)}
                />
                <path
                  d={branch.d}
                  fill="none"
                  stroke="rgba(255,255,255,0.52)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={branch.length}
                  strokeDashoffset={branch.length * (1 - progress)}
                  transform="translate(0 -3)"
                />
              </g>
            );
          })}
        </g>

        <circle
          cx={CORE.x}
          cy={CORE.y}
          r={88 + completionBreath * 16}
          fill="none"
          stroke="#4F6CF7"
          strokeWidth="3"
          opacity={completionBreath * activeOpacity * 0.22}
        />

        {NODES.map((node, index) => (
          <SkillNode
            key={node.id}
            node={node}
            timeline={timeline}
            activeOpacity={activeOpacity}
            index={index}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
