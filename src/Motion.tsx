import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Stage = {
  label: "IDEA" | "RESEARCH" | "PROCESS" | "GOAL";
  color: string;
  start: number;
  icon: "idea" | "research" | "process" | "goal";
};

const STAGES: Stage[] = [
  {label: "IDEA", color: "#A4CC68", start: 48, icon: "idea"},
  {label: "RESEARCH", color: "#38AAA5", start: 182, icon: "research"},
  {label: "PROCESS", color: "#4EB3D8", start: 316, icon: "process"},
  {label: "GOAL", color: "#706EAB", start: 450, icon: "goal"},
];

const CARD_WIDTH = 320;
const CARD_HEIGHT = 390;
const CARD_RADIUS = 25;
const CARD_TOP = 345;
const CARD_START_X = 185;
const CARD_GAP = 115;
const CARD_OUTLINE_LENGTH = 1425;
const ICON_DASH_LENGTH = 500;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const easeOut = (value: number) =>
  Easing.out(Easing.cubic)(clamp(value));

const easeInOut = (value: number) =>
  Easing.inOut(Easing.cubic)(clamp(value));

const progress = (frame: number, start: number, end: number) =>
  easeInOut((frame - start) / (end - start));

const cardPath = [
  `M ${CARD_RADIUS} 0`,
  `H ${CARD_WIDTH - CARD_RADIUS}`,
  `Q ${CARD_WIDTH} 0 ${CARD_WIDTH} ${CARD_RADIUS}`,
  `V ${CARD_HEIGHT - CARD_RADIUS}`,
  `Q ${CARD_WIDTH} ${CARD_HEIGHT} ${CARD_WIDTH - CARD_RADIUS} ${CARD_HEIGHT}`,
  `H ${CARD_RADIUS}`,
  `Q 0 ${CARD_HEIGHT} 0 ${CARD_HEIGHT - CARD_RADIUS}`,
  `V ${CARD_RADIUS}`,
  `Q 0 0 ${CARD_RADIUS} 0`,
  "Z",
].join(" ");

const AnimatedIcon: React.FC<{
  type: Stage["icon"];
  draw: number;
}> = ({type, draw}) => {
  const dashOffset = ICON_DASH_LENGTH * (1 - draw);
  const common = {
    fill: "none",
    stroke: "#566063",
    strokeWidth: 3.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeDasharray: ICON_DASH_LENGTH,
    strokeDashoffset: dashOffset,
  };

  return (
    <g
      opacity={interpolate(draw, [0, 0.16, 1], [0, 1, 1])}
      transform={`translate(0 ${(1 - draw) * 10}) scale(${
        0.93 + draw * 0.07
      })`}
    >
      {type === "idea" ? (
        <>
          <path
            {...common}
            d="M -24 -9 C -24 -27 -12 -39 4 -39 C 20 -39 32 -27 32 -10 C 32 1 26 9 18 16 C 14 20 13 24 13 28 H -5 C -5 24 -7 20 -11 16 C -19 9 -24 1 -24 -9 Z"
          />
          <path {...common} d="M -4 36 H 13 M -1 43 H 10" />
          <path {...common} d="M 4 -57 V -48" />
          <path {...common} d="M -26 -48 L -21 -40" />
          <path {...common} d="M -45 -27 L -36 -23" />
          <path {...common} d="M 34 -45 L 27 -38" />
          <path {...common} d="M 50 -20 L 40 -18" />
          <path {...common} d="M -43 2 L -34 0" />
          <path {...common} d="M 47 7 L 38 3" />
        </>
      ) : null}

      {type === "research" ? (
        <>
          <circle {...common} cx="-7" cy="-8" r="31" />
          <path {...common} d="M 15 15 L 43 43" />
          <path
            {...common}
            d="M -27 -7 C -27 -18 -18 -28 -7 -28"
            opacity="0.62"
          />
        </>
      ) : null}

      {type === "process" ? (
        <>
          <path
            {...common}
            d="M -11 -47 H 11 L 15 -36 C 20 -34 25 -32 29 -29 L 40 -34 L 51 -15 L 42 -7 C 43 -2 43 3 42 8 L 52 16 L 41 35 L 29 30 C 25 34 20 36 15 38 L 11 49 H -11 L -15 38 C -20 36 -25 34 -29 30 L -41 35 L -52 16 L -42 8 C -43 3 -43 -2 -42 -7 L -51 -15 L -40 -34 L -29 -29 C -25 -32 -20 -34 -15 -36 Z"
          />
          <circle {...common} cx="0" cy="1" r="18" />
        </>
      ) : null}

      {type === "goal" ? (
        <>
          <circle {...common} cx="-4" cy="2" r="38" />
          <circle {...common} cx="-4" cy="2" r="24" />
          <circle {...common} cx="-4" cy="2" r="10" />
          <path {...common} d="M -4 2 L 37 -39" />
          <path {...common} d="M 25 -40 H 40 V -25" />
          <path {...common} d="M 32 -46 H 47 V -31" opacity="0.72" />
        </>
      ) : null}
    </g>
  );
};

const Connector: React.FC<{
  index: number;
  frame: number;
}> = ({index, frame}) => {
  const start = STAGES[index].start + 79;
  const draw = progress(frame, start, start + 66);
  const x1 =
    CARD_START_X + CARD_WIDTH + index * (CARD_WIDTH + CARD_GAP) - 4;
  const x2 = x1 + CARD_GAP + 10;
  const y = CARD_TOP + CARD_HEIGHT / 2;
  const lineLength = x2 - x1;
  const color = STAGES[index].color;

  const travelStart = 610 + index * 38;
  const travel = progress(frame, travelStart, travelStart + 95);
  const travelOpacity =
    progress(frame, travelStart, travelStart + 18) *
    (1 - progress(frame, travelStart + 68, travelStart + 95));
  const particleX = x1 + 7 + (lineLength - 28) * travel;

  return (
    <g>
      <path
        d={`M ${x1} ${y} H ${x2 - 17}`}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={lineLength}
        strokeDashoffset={lineLength * (1 - draw)}
      />
      <path
        d={`M ${x2 - 30} ${y - 18} L ${x2 - 11} ${y} L ${x2 - 30} ${
          y + 18
        }`}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="60"
        strokeDashoffset={60 * (1 - progress(frame, start + 38, start + 66))}
      />
      <circle
        cx={particleX}
        cy={y}
        r="8"
        fill={color}
        opacity={0.72 * travelOpacity}
      />
      <circle
        cx={particleX}
        cy={y}
        r="18"
        fill={color}
        opacity={0.12 * travelOpacity}
      />
    </g>
  );
};

const StageCard: React.FC<{
  stage: Stage;
  index: number;
  frame: number;
  fps: number;
}> = ({stage, index, frame, fps}) => {
  const x = CARD_START_X + index * (CARD_WIDTH + CARD_GAP);
  const cardIn = spring({
    frame: frame - stage.start,
    fps,
    config: {damping: 17, stiffness: 112, mass: 0.9},
    durationInFrames: 82,
  });
  const outline = progress(frame, stage.start + 5, stage.start + 64);
  const iconDraw = progress(frame, stage.start + 34, stage.start + 105);
  const labelIn = progress(frame, stage.start + 72, stage.start + 111);
  const y = (1 - cardIn) * 44;
  const scale = 0.965 + cardIn * 0.035;

  const pulseStart = stage.start + 111;
  const firstPulse = clamp((frame - pulseStart) / 72);
  const flowPulseStart = 603 + index * 66;
  const flowPulse = clamp((frame - flowPulseStart) / 78);
  const activePulse = frame < 600 ? firstPulse : flowPulse;
  const pulseOpacity =
    frame < 600
      ? (1 - easeOut(firstPulse)) * 0.28
      : (1 - easeOut(flowPulse)) * 0.18;

  const idleY =
    frame > 720 ? Math.sin((frame - 720) / 76 + index * 0.72) * 1.1 : 0;

  return (
    <g
      transform={`translate(${x + CARD_WIDTH / 2} ${
        CARD_TOP + CARD_HEIGHT / 2 + y + idleY
      }) scale(${scale}) translate(${-CARD_WIDTH / 2} ${
        -CARD_HEIGHT / 2
      })`}
      opacity={clamp(cardIn)}
    >
      <rect
        x="8"
        y="11"
        width={CARD_WIDTH - 16}
        height={CARD_HEIGHT - 8}
        rx={CARD_RADIUS}
        fill="#738386"
        opacity={0.055 * outline}
        filter="url(#soft-shadow)"
      />
      <path
        d={cardPath}
        fill="#FBFCFC"
        stroke={stage.color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={CARD_OUTLINE_LENGTH}
        strokeDashoffset={CARD_OUTLINE_LENGTH * (1 - outline)}
      />

      {index > 0 ? (
        <rect
          x="-7"
          y={CARD_HEIGHT / 2 - 25}
          width="16"
          height="50"
          fill="#FBFCFC"
          opacity={outline}
        />
      ) : null}
      {index < STAGES.length - 1 ? (
        <rect
          x={CARD_WIDTH - 8}
          y={CARD_HEIGHT / 2 - 25}
          width="16"
          height="50"
          fill="#FBFCFC"
          opacity={outline}
        />
      ) : null}

      <g transform={`translate(${CARD_WIDTH / 2} 125)`}>
        <circle
          r={64 + easeOut(activePulse) * 25}
          fill="none"
          stroke={stage.color}
          strokeWidth={3 - easeOut(activePulse) * 1.5}
          opacity={pulseOpacity}
        />
        <AnimatedIcon type={stage.icon} draw={iconDraw} />
      </g>

      <text
        x={CARD_WIDTH / 2}
        y="238"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#171C1E"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="34"
        fontWeight="700"
        letterSpacing="-0.6"
        opacity={labelIn}
        transform={`translate(0 ${(1 - labelIn) * 10})`}
      >
        {stage.label}
      </text>

      <line
        x1={CARD_WIDTH / 2 - 28 * labelIn}
        x2={CARD_WIDTH / 2 + 28 * labelIn}
        y1="270"
        y2="270"
        stroke={stage.color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={0.62 * labelIn}
      />
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const backgroundLight = progress(frame, 0, 52);
  const settle = interpolate(
    frame,
    [0, 530, 899],
    [1, 1.004, 1.009],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F4F6F6",
        overflow: "hidden",
      }}
    >
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <radialGradient id="background-glow" cx="50%" cy="46%" r="72%">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="0.62" stopColor="#FAFBFB" stopOpacity="0.33" />
            <stop offset="1" stopColor="#EDF0F0" stopOpacity="0.2" />
          </radialGradient>
          <filter
            id="soft-shadow"
            x="-30%"
            y="-25%"
            width="170%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="#F4F6F6" />
        <rect
          width="1920"
          height="1080"
          fill="url(#background-glow)"
          opacity={backgroundLight}
        />

        <g
          transform={`translate(960 540) scale(${settle}) translate(-960 -540)`}
        >
          {STAGES.map((stage, index) => (
            <StageCard
              key={stage.label}
              stage={stage}
              index={index}
              frame={frame}
              fps={fps}
            />
          ))}
          {STAGES.slice(0, -1).map((stage, index) => (
            <Connector key={stage.label} index={index} frame={frame} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
