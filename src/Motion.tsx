import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type IconKind = "search" | "idea" | "process" | "time" | "goal";

type Step = {
  label: string;
  color: string;
  icon: IconKind;
};

const STEPS: Step[] = [
  {label: "RESEARCH", color: "#5446C8", icon: "search"},
  {label: "IDEA", color: "#3477CC", icon: "idea"},
  {label: "PROCESS", color: "#27B7C6", icon: "process"},
  {label: "TIME", color: "#29B992", icon: "time"},
  {label: "GOAL", color: "#78BF32", icon: "goal"},
];

const CARD_WIDTH = 330;
const CARD_HEIGHT = 420;
const CARD_GAP = -25;
const START_X = 185;
const TOP = 330;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const smooth = (value: number) =>
  Easing.inOut(Easing.cubic)(clamp(value));

const range = (frame: number, start: number, end: number) =>
  smooth((frame - start) / (end - start));

const paperPath = (x: number) =>
  [
    `M ${x} ${TOP}`,
    `H ${x + CARD_WIDTH - 80}`,
    `L ${x + CARD_WIDTH} ${TOP + CARD_HEIGHT / 2}`,
    `L ${x + CARD_WIDTH - 80} ${TOP + CARD_HEIGHT}`,
    `H ${x}`,
    `L ${x + 76} ${TOP + CARD_HEIGHT / 2}`,
    "Z",
  ].join(" ");

const ribbonPath = (x: number) =>
  [
    `M ${x + 12} ${TOP + 35}`,
    `H ${x + CARD_WIDTH - 72}`,
    `L ${x + CARD_WIDTH - 43} ${TOP + 98}`,
    `H ${x + 37}`,
    "Z",
  ].join(" ");

/*
 * Icon geometry: Lucide Static v1.27.0 (ISC).
 * Search is derived from Feather Icons and is covered by the bundled MIT notice.
 * The source paths are embedded so this Remotion composition stays render-safe
 * without a network request or an additional runtime dependency.
 */
type LucidePiece =
  | {
      type: "path";
      d: string;
      length: number;
      start: number;
      end: number;
    }
  | {
      type: "circle";
      cx: number;
      cy: number;
      r: number;
      length: number;
      start: number;
      end: number;
    };

const LUCIDE_ICONS: Record<IconKind, LucidePiece[]> = {
  search: [
    {
      type: "circle",
      cx: 11,
      cy: 11,
      r: 8,
      length: 50.27,
      start: 0,
      end: 0.72,
    },
    {
      type: "path",
      d: "m21 21-4.34-4.34",
      length: 6.14,
      start: 0.56,
      end: 1,
    },
  ],
  idea: [
    {
      type: "path",
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      length: 32.62,
      start: 0,
      end: 0.73,
    },
    {
      type: "path",
      d: "M9 18h6",
      length: 6,
      start: 0.6,
      end: 0.88,
    },
    {
      type: "path",
      d: "M10 22h4",
      length: 4,
      start: 0.78,
      end: 1,
    },
  ],
  process: [
    {
      type: "path",
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      length: 68.32,
      start: 0,
      end: 0.82,
    },
    {
      type: "circle",
      cx: 12,
      cy: 12,
      r: 3,
      length: 18.85,
      start: 0.56,
      end: 1,
    },
  ],
  time: [
    {
      type: "circle",
      cx: 12,
      cy: 12,
      r: 10,
      length: 62.83,
      start: 0,
      end: 0.76,
    },
    {
      type: "path",
      d: "M12 6v6h4",
      length: 10,
      start: 0.56,
      end: 1,
    },
  ],
  goal: [
    {
      type: "path",
      d: "M20.561 10.222a9 9 0 1 1-12.55-5.29",
      length: 41.1,
      start: 0,
      end: 0.62,
    },
    {
      type: "path",
      d: "M8.002 9.997a5 5 0 1 0 8.9 2.02",
      length: 19.92,
      start: 0.2,
      end: 0.77,
    },
    {
      type: "path",
      d: "M12 13V2l8 4-8 4",
      length: 28.89,
      start: 0.5,
      end: 1,
    },
  ],
};

const LucidePieceShape: React.FC<{
  piece: LucidePiece;
  progress?: number;
}> = ({piece, progress}) => {
  const animation =
    progress === undefined
      ? {}
      : {
          strokeDasharray: `${piece.length} ${piece.length}`,
          strokeDashoffset:
            piece.length * (1 - range(progress, piece.start, piece.end)),
        };

  if (piece.type === "circle") {
    return (
      <circle
        cx={piece.cx}
        cy={piece.cy}
        r={piece.r}
        transform="rotate(-90 12 12)"
        {...animation}
      />
    );
  }

  return <path d={piece.d} {...animation} />;
};

const StepIcon: React.FC<{kind: IconKind; progress: number}> = ({
  kind,
  progress,
}) => {
  const pieces = LUCIDE_ICONS[kind];
  const rotation = kind === "process" ? (1 - progress) * -14 : 0;

  return (
    <g transform={`rotate(${rotation})`}>
      <g
        transform="translate(-48 -48) scale(4)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g opacity="0.13">
          {pieces.map((piece, index) => (
            <LucidePieceShape key={`rail-${index}`} piece={piece} />
          ))}
        </g>
        <g filter="url(#icon-shadow)">
          {pieces.map((piece, index) => (
            <LucidePieceShape
              key={`draw-${index}`}
              piece={piece}
              progress={progress}
            />
          ))}
        </g>
      </g>
    </g>
  );
};

const FlowDots: React.FC<{frame: number}> = ({frame}) => {
  const pathStart = START_X + 84;
  const pathEnd =
    START_X + (STEPS.length - 1) * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH - 75;
  const travel = ((frame - 475) % 190 + 190) % 190;
  const visible = range(frame, 430, 500) * (1 - range(frame, 820, 885));

  return (
    <g opacity={visible}>
      {Array.from({length: 5}, (_, index) => {
        const local = ((travel - index * 27) % 190 + 190) % 190;
        const progress = local / 190;
        const opacity =
          Math.sin(progress * Math.PI) * (index === 0 ? 0.85 : 0.38);
        return (
          <circle
            key={index}
            cx={pathStart + (pathEnd - pathStart) * progress}
            cy={TOP + 67}
            r={index === 0 ? 7 : 4.5}
            fill="white"
            opacity={opacity}
          />
        );
      })}
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const backgroundIn = range(frame, 0, 45);
  const lineIn = range(frame, 20, 135);
  const settle = range(frame, 430, 515);
  const endDim = range(frame, 825, 898);
  const ambientX = Math.sin(frame / 95) * 13;
  const ambientY = Math.cos(frame / 112) * 9;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 44%, #FFFFFF 0%, #F8FAFD 57%, #EFF3F8 100%)",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          {STEPS.map((_, index) => {
            const x = START_X + index * (CARD_WIDTH + CARD_GAP);
            return (
              <React.Fragment key={index}>
                <clipPath id={`ribbon-clip-${index}`}>
                  <path d={ribbonPath(x)} />
                </clipPath>
                <radialGradient
                  id={`icon-medallion-${index}`}
                  cx="38%"
                  cy="30%"
                  r="74%"
                >
                  <stop offset="0" stopColor="white" stopOpacity="0.96" />
                  <stop
                    offset="0.54"
                    stopColor={STEPS[index].color}
                    stopOpacity="0.12"
                  />
                  <stop
                    offset="1"
                    stopColor={STEPS[index].color}
                    stopOpacity="0.2"
                  />
                </radialGradient>
              </React.Fragment>
            );
          })}
          <filter id="paper-shadow" x="-35%" y="-30%" width="190%" height="200%">
            <feDropShadow
              dx="8"
              dy="15"
              stdDeviation="15"
              floodColor="#17324D"
              floodOpacity="0.16"
            />
          </filter>
          <filter id="icon-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
          <filter id="icon-shadow" x="-35%" y="-35%" width="170%" height="180%">
            <feDropShadow
              dx="0"
              dy="0.8"
              stdDeviation="0.65"
              floodColor="currentColor"
              floodOpacity="0.2"
            />
          </filter>
          <filter id="soft-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <linearGradient id="top-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.48" stopColor="white" stopOpacity="0.42" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="micro-dots"
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.4" fill="#52677F" opacity="0.09" />
          </pattern>
        </defs>

        <rect width="1920" height="1080" fill="url(#micro-dots)" opacity={0.6} />
        <g
          opacity={0.28 * backgroundIn}
          transform={`translate(${ambientX} ${ambientY})`}
        >
          <circle
            cx="120"
            cy="120"
            r="270"
            fill="#5446C8"
            opacity="0.13"
            filter="url(#soft-blur)"
          />
          <circle
            cx="1810"
            cy="935"
            r="310"
            fill="#78BF32"
            opacity="0.12"
            filter="url(#soft-blur)"
          />
        </g>

        <line
          x1={START_X + 74}
          y1={TOP + CARD_HEIGHT / 2}
          x2={
            START_X +
            74 +
            (STEPS.length * CARD_WIDTH +
              (STEPS.length - 1) * CARD_GAP -
              148) *
              lineIn
          }
          y2={TOP + CARD_HEIGHT / 2}
          stroke="#D7E0EA"
          strokeWidth="3"
          strokeDasharray="10 13"
          opacity={0.72}
        />

        {STEPS.map((step, index) => {
          const x = START_X + index * (CARD_WIDTH + CARD_GAP);
          const entranceStart = 62 + index * 52;
          const entrance = spring({
            frame: frame - entranceStart,
            fps,
            config: {damping: 18, stiffness: 115, mass: 0.82},
            durationInFrames: 76,
          });
          const iconProgress = range(
            frame,
            entranceStart + 43,
            entranceStart + 118,
          );
          const ribbonProgress = range(
            frame,
            entranceStart + 16,
            entranceStart + 66,
          );
          const pulseProgress = clamp(
            (frame - (entranceStart + 108)) / 74,
          );
          const pulseOpacity =
            frame >= entranceStart + 108
              ? (1 - pulseProgress) * 0.54
              : 0;
          const yOffset = (1 - entrance) * (index % 2 === 0 ? 95 : -80);
          const cardScale = 0.9 + entrance * 0.1;
          const iconScale =
            0.92 +
            0.08 * entrance +
            Math.sin((frame - entranceStart) / 26) * 0.012 * settle;
          const isFirst = index === 0;

          return (
            <g
              key={step.label}
              opacity={entrance}
              transform={`translate(${x + CARD_WIDTH / 2} ${
                TOP + CARD_HEIGHT / 2 + yOffset
              }) scale(${cardScale}) translate(${-x - CARD_WIDTH / 2} ${
                -TOP - CARD_HEIGHT / 2
              })`}
            >
              <path
                d={paperPath(x)}
                fill="white"
                stroke="#E2E8F0"
                strokeWidth="2"
                filter="url(#paper-shadow)"
              />
              <path
                d={paperPath(x)}
                fill="none"
                stroke="white"
                strokeWidth="3"
                opacity="0.75"
                transform="translate(-2 -2)"
              />

              <g clipPath={`url(#ribbon-clip-${index})`}>
                <rect
                  x={x}
                  y={TOP + 30}
                  width={CARD_WIDTH * ribbonProgress}
                  height="75"
                  fill={step.color}
                />
              </g>
              <path
                d={ribbonPath(x)}
                fill="none"
                stroke={step.color}
                strokeWidth="2"
                opacity={ribbonProgress}
              />
              <text
                x={x + 139}
                y={TOP + 76}
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="700"
                letterSpacing="2.4"
                opacity={range(
                  frame,
                  entranceStart + 43,
                  entranceStart + 76,
                )}
              >
                {step.label}
              </text>

              <circle
                cx={x + 158}
                cy={TOP + 248}
                r={69}
                fill={`url(#icon-medallion-${index})`}
                opacity={0.92 * iconProgress}
              />
              <circle
                cx={x + 158}
                cy={TOP + 248}
                r={69}
                fill="none"
                stroke={step.color}
                strokeWidth="2"
                opacity={0.16 * iconProgress}
              />
              <circle
                cx={x + 158}
                cy={TOP + 248}
                r={70 + pulseProgress * 48}
                fill="none"
                stroke={step.color}
                strokeWidth={5 - pulseProgress * 3}
                opacity={pulseOpacity}
              />
              <circle
                cx={x + 158}
                cy={TOP + 248}
                r={5 + 7 * iconProgress}
                fill={step.color}
                opacity={0.13 * (1 - iconProgress)}
                filter="url(#icon-glow)"
              />
              <g
                color={step.color}
                transform={`translate(${x + 158} ${
                  TOP + 248
                }) scale(${iconScale})`}
              >
                <StepIcon kind={step.icon} progress={iconProgress} />
              </g>

              {!isFirst ? (
                <path
                  d={`M ${x + 7} ${TOP + 130} L ${x + 45} ${
                    TOP + CARD_HEIGHT / 2
                  } L ${x + 7} ${TOP + 290}`}
                  fill="none"
                  stroke="#CCD6E1"
                  strokeWidth="2"
                  opacity={0.75}
                />
              ) : null}
            </g>
          );
        })}

        <FlowDots frame={frame} />

        <rect
          x="-340"
          y={TOP + 33}
          width="260"
          height="68"
          fill="url(#top-sheen)"
          opacity={0.74 * range(frame, 505, 548) * (1 - range(frame, 770, 820))}
          transform={`translate(${
            interpolate(frame, [505, 790], [0, 2540], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.quad),
            })
          } 0) skewX(-18)`}
        />
        <rect
          width="1920"
          height="1080"
          fill="white"
          opacity={endDim * 0.06}
          pointerEvents="none"
        />
      </svg>
    </AbsoluteFill>
  );
};
