import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const CUBE_X = 560;
const PANEL_X = 820;
const PANEL_WIDTH = 760;
const PANEL_HEIGHT = 116;

type Stage = {
  readonly id: string;
  readonly finalY: number;
  readonly startFrame: number;
  readonly landFrame: number;
  readonly blockColor: string;
  readonly blockLight: string;
  readonly blockDark: string;
  readonly lineColor: string;
  readonly lineLight: string;
};

const STAGES: readonly Stage[] = [
  {
    id: "aqua",
    finalY: 788,
    startFrame: 36,
    landFrame: 62,
    blockColor: "#36D7FF",
    blockLight: "#B9F5FF",
    blockDark: "#1477D4",
    lineColor: "#9A76FF",
    lineLight: "#D7C8FF",
  },
  {
    id: "violet",
    finalY: 644,
    startFrame: 100,
    landFrame: 128,
    blockColor: "#8B6CFF",
    blockLight: "#DDD3FF",
    blockDark: "#5230D5",
    lineColor: "#42E6B6",
    lineLight: "#BCFFE9",
  },
  {
    id: "coral",
    finalY: 500,
    startFrame: 158,
    landFrame: 182,
    blockColor: "#FF6C9F",
    blockLight: "#FFD1E0",
    blockDark: "#C72F70",
    lineColor: "#FFC75A",
    lineLight: "#FFF0B4",
  },
  {
    id: "lime",
    finalY: 356,
    startFrame: 220,
    landFrame: 242,
    blockColor: "#A7ED68",
    blockLight: "#E9FFD4",
    blockDark: "#55A847",
    lineColor: "#55B8FF",
    lineLight: "#C9ECFF",
  },
] as const;

const BACKGROUND_SPECKS = Array.from({length: 58}, (_, index) => {
  const fract = (value: number): number => value - Math.floor(value);
  const a = fract(Math.sin(index * 91.17 + 14.3) * 43758.5453);
  const b = fract(Math.sin(index * 47.91 + 72.9) * 24634.6345);
  const c = fract(Math.sin(index * 25.61 + 8.7) * 17485.2194);

  return {
    x: a * WIDTH,
    y: b * HEIGHT,
    radius: 0.7 + c * 1.8,
    opacity: 0.06 + fract(a + b) * 0.16,
    depth: 0.35 + fract(b + c) * 0.65,
  };
});

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const mix = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.out(Easing.cubic),
): number =>
  interpolate(frame, [start, end], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Background: React.FC<{readonly frame: number}> = ({frame}) => {
  const settle = progress(frame, 0, 282, Easing.inOut(Easing.cubic));
  const fade = progress(frame, 0, 36, Easing.out(Easing.quad));

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 24% 42%, #153B58 0%, #0B2137 27%, #071426 58%, #040A16 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          transform: `translate(${mix(-28, 0, settle)}px, ${mix(12, 0, settle)}px)`,
          background:
            "radial-gradient(ellipse 46% 62% at 15% 20%, rgba(54,215,255,0.22) 0%, rgba(54,215,255,0.07) 38%, transparent 70%)",
          opacity: fade,
        }}
      />

      <AbsoluteFill
        style={{
          transform: `translate(${mix(35, 0, settle)}px, ${mix(-16, 0, settle)}px)`,
          background:
            "radial-gradient(ellipse 48% 62% at 91% 80%, rgba(139,108,255,0.23) 0%, rgba(139,108,255,0.075) 37%, transparent 72%)",
          opacity: fade,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(118deg, transparent 22%, rgba(255,255,255,0.025) 43%, transparent 61%)",
          opacity: 0.8,
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <linearGradient id="floor-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#56D6FF" stopOpacity="0" />
            <stop offset="0.28" stopColor="#56D6FF" stopOpacity="0.16" />
            <stop offset="0.64" stopColor="#9A76FF" stopOpacity="0.15" />
            <stop offset="1" stopColor="#9A76FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="floor-glow">
            <stop offset="0" stopColor="#56D6FF" stopOpacity="0.18" />
            <stop offset="0.48" stopColor="#527AF3" stopOpacity="0.055" />
            <stop offset="1" stopColor="#071426" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="micro-grid"
            width="54"
            height="54"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 54 0 L 0 0 0 54"
              fill="none"
              stroke="#9BDFFF"
              strokeOpacity="0.085"
              strokeWidth="1"
            />
          </pattern>
          <filter id="background-blur">
            <feGaussianBlur stdDeviation="32" />
          </filter>
        </defs>

        <rect
          width={WIDTH}
          height={HEIGHT}
          fill="url(#micro-grid)"
          opacity={0.3 * fade}
          transform={`translate(${mix(0, -10, settle)} ${mix(0, -5, settle)})`}
        />

        <ellipse
          cx="840"
          cy="865"
          rx="760"
          ry="180"
          fill="url(#floor-glow)"
          opacity={0.68 * fade}
          filter="url(#background-blur)"
        />

        <line
          x1="135"
          y1="872"
          x2="1720"
          y2="872"
          stroke="url(#floor-line)"
          strokeWidth="1.5"
          opacity={0.85 * fade}
        />

        {BACKGROUND_SPECKS.map((speck, index) => (
          <circle
            key={`speck-${index}`}
            cx={speck.x + mix(16 * speck.depth, 0, settle)}
            cy={speck.y + mix(-9 * speck.depth, 0, settle)}
            r={speck.radius}
            fill="#DDF7FF"
            opacity={speck.opacity * fade}
          />
        ))}
      </svg>

      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 190px rgba(0,0,0,0.58)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

const ImpactBurst: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
  readonly stageIndex: number;
}> = ({frame, stage, stageIndex}) => {
  const pulse = progress(
    frame,
    stage.landFrame,
    stage.landFrame + 24,
    Easing.out(Easing.quad),
  );
  const opacity = 1 - pulse;

  if (frame < stage.landFrame || frame > stage.landFrame + 24) {
    return null;
  }

  return (
    <g>
      <ellipse
        cx={CUBE_X}
        cy={stage.finalY + 84}
        rx={mix(54, 128, pulse)}
        ry={mix(15, 30, pulse)}
        fill="none"
        stroke={stage.blockLight}
        strokeWidth={mix(5, 1, pulse)}
        opacity={0.7 * opacity}
      />

      {Array.from({length: 8}, (_, index) => {
        const angle = ((index * 45 + stageIndex * 17) * Math.PI) / 180;
        const distance = mix(16, 98, pulse);
        const x = CUBE_X + Math.cos(angle) * distance;
        const y =
          stage.finalY +
          80 +
          Math.sin(angle) * distance * 0.32 -
          Math.sin(pulse * Math.PI) * 15;

        return (
          <circle
            key={`${stage.id}-impact-${index}`}
            cx={x}
            cy={y}
            r={mix(3.8, 1.2, pulse)}
            fill={index % 2 === 0 ? stage.blockLight : stage.lineLight}
            opacity={opacity * 0.86}
          />
        );
      })}
    </g>
  );
};

const GlassCube: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
  readonly stageIndex: number;
}> = ({frame, stage, stageIndex}) => {
  const visible = progress(
    frame,
    stage.startFrame,
    stage.startFrame + 4,
    Easing.out(Easing.quad),
  );
  const falling = progress(
    frame,
    stage.startFrame,
    stage.landFrame,
    Easing.in(Easing.cubic),
  );
  const y = mix(-150 - stageIndex * 22, stage.finalY, falling);
  const rotation = mix(stageIndex % 2 === 0 ? -7 : 7, 0, falling);
  const flightScale = mix(0.93, 1, falling);

  const impactScaleX =
    frame < stage.landFrame
      ? flightScale
      : interpolate(
          frame,
          [stage.landFrame, stage.landFrame + 4, stage.landFrame + 13],
          [1.07, 0.985, 1],
          {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
  const impactScaleY =
    frame < stage.landFrame
      ? mix(1.05, 1, falling)
      : interpolate(
          frame,
          [stage.landFrame, stage.landFrame + 4, stage.landFrame + 13],
          [0.93, 1.015, 1],
          {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );

  const shadowScale = mix(0.28, 1, falling);
  const shadowOpacity = mix(0.035, 0.28, falling) * visible;
  const innerGlow = 0.72 + 0.28 * progress(frame, stage.landFrame, stage.landFrame + 16);

  return (
    <g>
      <defs>
        <linearGradient
          id={`cube-top-${stage.id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop offset="0.34" stopColor={stage.blockLight} stopOpacity="0.7" />
          <stop offset="1" stopColor={stage.blockColor} stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id={`cube-left-${stage.id}`}
          x1="0"
          y1="0"
          x2="0.9"
          y2="1"
        >
          <stop offset="0" stopColor={stage.blockLight} stopOpacity="0.52" />
          <stop offset="0.58" stopColor={stage.blockColor} stopOpacity="0.38" />
          <stop offset="1" stopColor={stage.blockDark} stopOpacity="0.58" />
        </linearGradient>
        <linearGradient
          id={`cube-right-${stage.id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor={stage.blockColor} stopOpacity="0.46" />
          <stop offset="1" stopColor={stage.blockDark} stopOpacity="0.72" />
        </linearGradient>
        <radialGradient id={`cube-core-${stage.id}`}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="0.26" stopColor={stage.blockLight} stopOpacity="0.72" />
          <stop offset="1" stopColor={stage.blockColor} stopOpacity="0" />
        </radialGradient>
        <filter id={`cube-shadow-${stage.id}`} x="-70%" y="-70%" width="240%" height="260%">
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="18"
            floodColor={stage.blockColor}
            floodOpacity="0.27"
          />
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="5"
            floodColor="#000715"
            floodOpacity="0.62"
          />
        </filter>
        <filter id={`cube-blur-${stage.id}`}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id={`shadow-blur-${stage.id}`} x="-70%" y="-300%" width="240%" height="700%">
          <feGaussianBlur stdDeviation={mix(18, 7, falling)} />
        </filter>
      </defs>

      <ellipse
        cx={CUBE_X}
        cy={stage.finalY + 91}
        rx={82 * shadowScale}
        ry={18 * shadowScale}
        fill="#020713"
        opacity={shadowOpacity}
        filter={`url(#shadow-blur-${stage.id})`}
      />

      <g
        opacity={visible}
        transform={`translate(${CUBE_X} ${y}) rotate(${rotation}) scale(${impactScaleX} ${impactScaleY})`}
        filter={`url(#cube-shadow-${stage.id})`}
      >
        <circle
          cx="0"
          cy="2"
          r="72"
          fill={`url(#cube-core-${stage.id})`}
          opacity={0.36 * innerGlow}
          filter={`url(#cube-blur-${stage.id})`}
        />

        <polygon
          points="-72,-38 0,4 0,88 -72,46"
          fill={`url(#cube-left-${stage.id})`}
          stroke={stage.blockLight}
          strokeOpacity="0.56"
          strokeWidth="1.6"
        />
        <polygon
          points="0,4 72,-38 72,46 0,88"
          fill={`url(#cube-right-${stage.id})`}
          stroke={stage.blockColor}
          strokeOpacity="0.64"
          strokeWidth="1.6"
        />
        <polygon
          points="0,-82 72,-38 0,4 -72,-38"
          fill={`url(#cube-top-${stage.id})`}
          stroke="#FFFFFF"
          strokeOpacity="0.74"
          strokeWidth="1.8"
        />

        <path
          d="M -56 -38 L 0 -71 L 55 -38"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M -60 -28 L -60 33"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.38"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 55 -28 L 55 27"
          fill="none"
          stroke={stage.blockLight}
          strokeOpacity="0.26"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <polygon
          points="-20,-27 0,-16 20,-27 0,-39"
          fill="#FFFFFF"
          opacity="0.16"
        />
        <polygon
          points="-20,-27 0,-16 0,7 -20,-5"
          fill={stage.blockLight}
          opacity="0.14"
        />
        <polygon
          points="0,-16 20,-27 20,-5 0,7"
          fill={stage.blockColor}
          opacity="0.18"
        />
      </g>

      <ImpactBurst frame={frame} stage={stage} stageIndex={stageIndex} />
    </g>
  );
};

const ConnectorAndPanel: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
}> = ({frame, stage}) => {
  const lineStart = stage.landFrame + 5;
  const lineEnd = stage.landFrame + 18;
  const panelStart = stage.landFrame + 12;
  const panelEnd = stage.landFrame + 39;
  const lineAmount = progress(frame, lineStart, lineEnd);
  const panelAmount = progress(frame, panelStart, panelEnd);
  const nodeAmount = progress(
    frame,
    stage.landFrame + 2,
    stage.landFrame + 10,
    Easing.out(Easing.back(1.4)),
  );
  const panelX = mix(PANEL_X + 210, PANEL_X, panelAmount);
  const revealedWidth = PANEL_WIDTH * panelAmount;
  const panelY = stage.finalY - PANEL_HEIGHT / 2 + 3;
  const shine = progress(
    frame,
    panelStart + 5,
    panelEnd + 12,
    Easing.inOut(Easing.quad),
  );
  const shineOpacity =
    frame < panelStart + 5 || frame > panelEnd + 12
      ? 0
      : Math.sin(shine * Math.PI) * 0.48;

  const connectorPath = `M ${CUBE_X + 79} ${stage.finalY + 3} C ${
    CUBE_X + 118
  } ${stage.finalY + 3}, ${PANEL_X - 76} ${stage.finalY + 3}, ${
    PANEL_X - 24
  } ${stage.finalY + 3}`;

  return (
    <g>
      <defs>
        <linearGradient
          id={`connector-${stage.id}`}
          gradientUnits="userSpaceOnUse"
          x1={CUBE_X + 79}
          y1={stage.finalY + 3}
          x2={PANEL_X - 24}
          y2={stage.finalY + 3}
        >
          <stop offset="0" stopColor={stage.lineLight} stopOpacity="0.96" />
          <stop offset="0.48" stopColor={stage.lineColor} stopOpacity="0.92" />
          <stop offset="1" stopColor={stage.lineColor} stopOpacity="0.38" />
        </linearGradient>
        <linearGradient
          id={`panel-${stage.id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.17" />
          <stop offset="0.38" stopColor={stage.lineLight} stopOpacity="0.075" />
          <stop offset="1" stopColor={stage.lineColor} stopOpacity="0.11" />
        </linearGradient>
        <linearGradient
          id={`panel-edge-${stage.id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="0.34" stopColor={stage.lineLight} stopOpacity="0.42" />
          <stop offset="0.72" stopColor={stage.lineColor} stopOpacity="0.36" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient
          id={`panel-shine-${stage.id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`panel-clip-${stage.id}`}>
          <rect
            x={panelX}
            y={panelY}
            width={revealedWidth}
            height={PANEL_HEIGHT}
            rx="24"
          />
        </clipPath>
        <filter id={`connector-glow-${stage.id}`} x="-30%" y="-300%" width="160%" height="700%">
          <feGaussianBlur stdDeviation="5.5" />
        </filter>
        <filter id={`panel-shadow-${stage.id}`} x="-20%" y="-70%" width="150%" height="240%">
          <feDropShadow
            dx="0"
            dy="20"
            stdDeviation="24"
            floodColor="#020714"
            floodOpacity="0.44"
          />
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="10"
            floodColor={stage.lineColor}
            floodOpacity="0.11"
          />
        </filter>
      </defs>

      <circle
        cx={CUBE_X + 79}
        cy={stage.finalY + 3}
        r={7.5 * nodeAmount}
        fill={stage.lineLight}
        opacity={nodeAmount}
        filter={`url(#connector-glow-${stage.id})`}
      />
      <circle
        cx={CUBE_X + 79}
        cy={stage.finalY + 3}
        r={3.2 * nodeAmount}
        fill="#FFFFFF"
        opacity={nodeAmount}
      />

      <path
        d={connectorPath}
        fill="none"
        pathLength={1}
        stroke={stage.lineColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - lineAmount}
        opacity={0.13 * lineAmount}
      />
      <path
        d={connectorPath}
        fill="none"
        pathLength={1}
        stroke={`url(#connector-${stage.id})`}
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - lineAmount}
        opacity={lineAmount}
      />

      <g filter={`url(#panel-shadow-${stage.id})`} opacity={panelAmount}>
        <rect
          x={panelX}
          y={panelY}
          width={revealedWidth}
          height={PANEL_HEIGHT}
          rx="24"
          fill={`url(#panel-${stage.id})`}
          stroke={`url(#panel-edge-${stage.id})`}
          strokeWidth="1.7"
        />

        <rect
          x={panelX + 1.2}
          y={panelY + 1.2}
          width={Math.max(0, revealedWidth - 2.4)}
          height="40"
          rx="22"
          fill="#FFFFFF"
          opacity="0.025"
        />

        <rect
          x={panelX + 18}
          y={panelY + 23}
          width={4.5 * panelAmount}
          height={70}
          rx="2.25"
          fill={stage.lineColor}
          opacity={0.74 * panelAmount}
        />

        <rect
          x={panelX + 34}
          y={panelY + 29}
          width={Math.min(revealedWidth * 0.3, 185)}
          height="7"
          rx="3.5"
          fill="#FFFFFF"
          opacity={0.14 * panelAmount}
        />
        <rect
          x={panelX + 34}
          y={panelY + 54}
          width={Math.max(0, revealedWidth - 112)}
          height="2"
          rx="1"
          fill={stage.lineLight}
          opacity={0.12 * panelAmount}
        />
        <rect
          x={panelX + 34}
          y={panelY + 77}
          width={Math.max(0, Math.min(revealedWidth - 172, 420))}
          height="5"
          rx="2.5"
          fill="#FFFFFF"
          opacity={0.075 * panelAmount}
        />
      </g>

      <g clipPath={`url(#panel-clip-${stage.id})`} opacity={shineOpacity}>
        <rect
          x={panelX - 170 + shine * (PANEL_WIDTH + 340)}
          y={panelY - 24}
          width="118"
          height={PANEL_HEIGHT + 48}
          transform={`rotate(17 ${
            panelX - 111 + shine * (PANEL_WIDTH + 340)
          } ${panelY + PANEL_HEIGHT / 2})`}
          fill={`url(#panel-shine-${stage.id})`}
        />
      </g>

      <circle
        cx={PANEL_X + PANEL_WIDTH - 44}
        cy={stage.finalY + 3}
        r={18 * panelAmount}
        fill="none"
        stroke={stage.lineColor}
        strokeWidth="1.4"
        opacity={0.22 * panelAmount}
      />
      <circle
        cx={PANEL_X + PANEL_WIDTH - 44}
        cy={stage.finalY + 3}
        r={4.2 * panelAmount}
        fill={stage.lineLight}
        opacity={0.72 * panelAmount}
      />
    </g>
  );
};

const FinalLightPass: React.FC<{readonly frame: number}> = ({frame}) => {
  const amount = progress(frame, 270, 318, Easing.inOut(Easing.cubic));
  const opacity =
    frame < 270 || frame > 318 ? 0 : Math.sin(amount * Math.PI) * 0.22;
  const x = mix(250, 1700, amount);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: -260,
        width: 150,
        height: 1560,
        transform: "rotate(16deg)",
        background:
          "linear-gradient(90deg, transparent, rgba(221,249,255,0.8), transparent)",
        filter: "blur(28px)",
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const compositionFade = progress(
    frame,
    0,
    22,
    Easing.out(Easing.quad),
  );

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#040A16",
        opacity: compositionFade,
      }}
    >
      <Background frame={frame} />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <filter id="stack-ambient" x="-40%" y="-30%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="48" />
          </filter>
          <linearGradient id="stack-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D6F8FF" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="#8B6CFF" stopOpacity="0.08" />
            <stop offset="1" stopColor="#36D7FF" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        <rect
          x="430"
          y="238"
          width="260"
          height="660"
          rx="130"
          fill="url(#stack-light)"
          opacity={0.38 * progress(frame, 28, 72)}
          filter="url(#stack-ambient)"
        />

        {STAGES.map((stage) => (
          <ConnectorAndPanel key={`connector-${stage.id}`} frame={frame} stage={stage} />
        ))}

        {STAGES.map((stage, index) => (
          <GlassCube
            key={`cube-${stage.id}`}
            frame={frame}
            stage={stage}
            stageIndex={index}
          />
        ))}
      </svg>

      <FinalLightPass frame={frame} />
    </AbsoluteFill>
  );
};
