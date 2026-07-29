import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

type Direction = "up" | "down";

type Stage = {
  number: string;
  color: string;
  colorLight: string;
  colorDark: string;
  centerX: number;
  direction: Direction;
  arrive: number;
};

const STAGES: readonly Stage[] = [
  {
    number: "01",
    color: "#08c6d5",
    colorLight: "#12d2df",
    colorDark: "#00aebf",
    centerX: 380,
    direction: "up",
    arrive: 106,
  },
  {
    number: "02",
    color: "#079fe0",
    colorLight: "#15afea",
    colorDark: "#0789c4",
    centerX: 640,
    direction: "down",
    arrive: 175,
  },
  {
    number: "03",
    color: "#07567f",
    colorLight: "#0b648e",
    colorDark: "#06466d",
    centerX: 900,
    direction: "up",
    arrive: 245,
  },
  {
    number: "04",
    color: "#08bdc7",
    colorLight: "#12cbd3",
    colorDark: "#00a5b0",
    centerX: 1160,
    direction: "down",
    arrive: 314,
  },
  {
    number: "05",
    color: "#079fe0",
    colorLight: "#18b2eb",
    colorDark: "#087fbb",
    centerX: 1420,
    direction: "up",
    arrive: 384,
  },
  {
    number: "06",
    color: "#07567f",
    colorLight: "#0a648e",
    colorDark: "#06466d",
    centerX: 1680,
    direction: "down",
    arrive: 453,
  },
] as const;

const upArrowPath = (centerX: number) => `
  M ${centerX - 56} 590
  V 376
  C ${centerX - 56} 366 ${centerX - 64} 358 ${centerX - 74} 358
  H ${centerX - 91}
  C ${centerX - 106} 358 ${centerX - 113} 340 ${centerX - 102} 329
  L ${centerX - 19} 248
  C ${centerX - 8} 237 ${centerX + 8} 237 ${centerX + 19} 248
  L ${centerX + 102} 329
  C ${centerX + 113} 340 ${centerX + 106} 358 ${centerX + 91} 358
  H ${centerX + 74}
  C ${centerX + 64} 358 ${centerX + 56} 366 ${centerX + 56} 376
  V 590
  Z
`;

const downArrowPath = (centerX: number) => `
  M ${centerX - 56} 470
  V 694
  C ${centerX - 56} 704 ${centerX - 64} 712 ${centerX - 74} 712
  H ${centerX - 91}
  C ${centerX - 106} 712 ${centerX - 113} 730 ${centerX - 102} 741
  L ${centerX - 19} 822
  C ${centerX - 8} 833 ${centerX + 8} 833 ${centerX + 19} 822
  L ${centerX + 102} 741
  C ${centerX + 113} 730 ${centerX + 106} 712 ${centerX + 91} 712
  H ${centerX + 74}
  C ${centerX + 64} 712 ${centerX + 56} 704 ${centerX + 56} 694
  V 470
  Z
`;

const ribbonPaths = [
  "M 120 470 H 510 V 590 H 120 Z",
  "M 510 470 H 770 V 590 H 510 Z",
  "M 770 470 H 1030 V 590 H 770 Z",
  "M 1030 470 H 1290 V 590 H 1030 Z",
  "M 1290 470 H 1550 V 590 H 1290 Z",
  "M 1550 470 H 1728 C 1752 470 1772 490 1772 514 V 590 H 1550 Z",
] as const;

const seamPositions = [510, 770, 1030, 1290, 1550] as const;

const StepLabel: React.FC<{
  stage: Stage;
  progress: number;
}> = ({stage, progress}) => {
  const isUp = stage.direction === "up";

  return (
    <g
      opacity={progress}
      transform={`translate(0 ${(1 - progress) * (isUp ? 16 : -16)})`}
      style={{filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.08))"}}
    >
      <text
        x={stage.centerX}
        y={isUp ? 401 : 638}
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="24"
        fontWeight="800"
        letterSpacing="0.15"
        textAnchor="middle"
      >
        STEP
      </text>
      <text
        x={stage.centerX}
        y={isUp ? 457 : 694}
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="58"
        fontWeight="400"
        letterSpacing="-1.8"
        textAnchor="middle"
      >
        {stage.number}
      </text>
    </g>
  );
};

const ArrowStage: React.FC<{
  stage: Stage;
  index: number;
  frame: number;
  fps: number;
}> = ({stage, index, frame, fps}) => {
  const elastic = spring({
    frame: frame - stage.arrive,
    fps,
    config: {
      damping: 15,
      mass: 0.82,
      stiffness: 105,
    },
    durationInFrames: 64,
  });
  const isUp = stage.direction === "up";
  const anchorY = isUp ? 590 : 470;
  const arrowOpacity = interpolate(elastic, [0, 0.12], [0, 1], clamp);
  const labelProgress = interpolate(
    frame,
    [stage.arrive + 24, stage.arrive + 50],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );
  const horizontalScale = 0.965 + elastic * 0.035;
  const path = isUp
    ? upArrowPath(stage.centerX)
    : downArrowPath(stage.centerX);

  return (
    <>
      <defs>
        <linearGradient
          id={`arrow-gradient-${index}`}
          x1="0"
          y1={isUp ? "0" : "1"}
          x2="0"
          y2={isUp ? "1" : "0"}
        >
          <stop offset="0%" stopColor={stage.colorLight} />
          <stop offset="58%" stopColor={stage.color} />
          <stop offset="100%" stopColor={stage.colorDark} />
        </linearGradient>
      </defs>

      <g
        opacity={arrowOpacity}
        transform={`translate(${stage.centerX} ${anchorY}) scale(${horizontalScale} ${elastic}) translate(${-stage.centerX} ${-anchorY})`}
      >
        <path
          d={path}
          fill={`url(#arrow-gradient-${index})`}
          filter="url(#soft-shadow)"
        />
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="2"
        />
        <path
          d={path}
          fill="url(#arrow-shine)"
          opacity="0.18"
        />
      </g>
      <StepLabel stage={stage} progress={labelProgress} />
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ribbonProgress = interpolate(frame, [28, 482], [0, 1], {
    ...clamp,
    easing: Easing.linear,
  });
  const fullOpacity = interpolate(frame, [0, 22, 820, 899], [0, 1, 1, 0], clamp);
  const breathe = interpolate(
    Math.sin((frame / fps) * Math.PI * 2 * 0.18),
    [-1, 1],
    [0.985, 1],
  );
  const highlightX = interpolate(frame, [530, 675], [-260, 2040], clamp);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fafafa",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #ffffff 0%, #fbfbfb 58%, #f4f5f5 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          opacity: fullOpacity,
          transform: `scale(${breathe})`,
          transformOrigin: "50% 50%",
        }}
      >
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          style={{position: "absolute", inset: 0, overflow: "visible"}}
        >
          <defs>
            <filter
              id="soft-shadow"
              x="-30%"
              y="-30%"
              width="160%"
              height="180%"
            >
              <feDropShadow
                dx="0"
                dy="13"
                stdDeviation="15"
                floodColor="#244b5a"
                floodOpacity="0.18"
              />
            </filter>
            <filter id="band-shadow" x="-10%" y="-50%" width="120%" height="220%">
              <feDropShadow
                dx="0"
                dy="13"
                stdDeviation="14"
                floodColor="#294b58"
                floodOpacity="0.18"
              />
            </filter>
            <linearGradient id="arrow-shine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            {STAGES.map((stage, index) => (
              <linearGradient
                key={`ribbon-gradient-${stage.number}`}
                id={`ribbon-gradient-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={stage.colorLight} />
                <stop offset="64%" stopColor={stage.color} />
                <stop offset="100%" stopColor={stage.colorDark} />
              </linearGradient>
            ))}
            <clipPath id="ribbon-reveal">
              <rect x="86" y="448" width={1700 * ribbonProgress} height="166" />
            </clipPath>
            <linearGradient id="moving-highlight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="48%" stopColor="#ffffff" stopOpacity="0.36" />
              <stop offset="52%" stopColor="#ffffff" stopOpacity="0.36" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g clipPath="url(#ribbon-reveal)">
            <g filter="url(#band-shadow)">
              {ribbonPaths.map((path, index) => (
                <path
                  key={`ribbon-${STAGES[index].number}`}
                  d={path}
                  fill={`url(#ribbon-gradient-${index})`}
                />
              ))}
            </g>

            {seamPositions.map((x) => (
              <line
                key={`seam-${x}`}
                x1={x}
                y1="474"
                x2={x}
                y2="586"
                stroke="rgba(255,255,255,0.24)"
                strokeWidth="2"
              />
            ))}

            <path
              d="M 120 474 H 1721"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="3"
            />

            <rect
              x={highlightX}
              y="462"
              width="260"
              height="140"
              fill="url(#moving-highlight)"
              opacity={interpolate(frame, [520, 540, 660, 690], [0, 1, 1, 0], clamp)}
              style={{mixBlendMode: "screen"}}
            />
          </g>

          {STAGES.map((stage, index) => (
            <ArrowStage
              key={stage.number}
              stage={stage}
              index={index}
              frame={frame}
              fps={fps}
            />
          ))}

          <ellipse
            cx="942"
            cy="625"
            rx="812"
            ry="28"
            fill="#16495b"
            opacity={0.045 * interpolate(ribbonProgress, [0.08, 0.35], [0, 1], clamp)}
            filter="url(#band-shadow)"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
