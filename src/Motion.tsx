import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type IconKind =
  | "search"
  | "flask-conical"
  | "factory"
  | "megaphone"
  | "rocket";

type Step = {
  label: string;
  color: string;
  icon: IconKind;
};

const STEPS: Step[] = [
  {label: "RESEARCH", color: "#654FC6", icon: "search"},
  {label: "PROTOTYPE", color: "#2F7ED8", icon: "flask-conical"},
  {label: "PRODUCTION", color: "#14A7B8", icon: "factory"},
  {label: "MARKETING", color: "#F1A52B", icon: "megaphone"},
  {label: "LAUNCH", color: "#EF5E68", icon: "rocket"},
];

const CARD_WIDTH = 332;
const CARD_HEIGHT = 430;
const CARD_GAP = -26;
const START_X = 180;
const TOP = 322;
const ICON_Y = TOP + 260;
const ENTRY_FRAMES = [50, 170, 278, 370, 445];
const CONNECT_FRAMES = [155, 268, 360, 438];

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
    `M ${x + 12} ${TOP + 34}`,
    `H ${x + CARD_WIDTH - 73}`,
    `L ${x + CARD_WIDTH - 42} ${TOP + 102}`,
    `H ${x + 37}`,
    "Z",
  ].join(" ");

/*
 * Embedded Lucide icon geometry:
 * Search, Flask Conical, Factory, Megaphone, and Rocket.
 * Lucide is licensed under ISC; Search is derived from Feather (MIT).
 * Embedding the SVG paths keeps the composition deterministic and offline-safe.
 */
type LucidePiece =
  | {
      type: "path";
      d: string;
      start: number;
      end: number;
    }
  | {
      type: "circle";
      cx: number;
      cy: number;
      r: number;
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
      start: 0,
      end: 0.72,
    },
    {
      type: "path",
      d: "m21 21-4.34-4.34",
      start: 0.56,
      end: 1,
    },
  ],
  "flask-conical": [
    {
      type: "path",
      d: "M14.4 2H9.6",
      start: 0,
      end: 0.28,
    },
    {
      type: "path",
      d: "M12 2v7.5L4.14 21.18a.5.5 0 0 0 .42.82h14.88a.5.5 0 0 0 .42-.82L12 9.5",
      start: 0.12,
      end: 0.86,
    },
    {
      type: "path",
      d: "M6.5 15h11",
      start: 0.64,
      end: 1,
    },
  ],
  factory: [
    {
      type: "path",
      d: "M5 21V10l7 3V10l7 3v8",
      start: 0,
      end: 0.68,
    },
    {
      type: "path",
      d: "M5 10V5l7 3v5",
      start: 0.2,
      end: 0.72,
    },
    {
      type: "path",
      d: "M3 21h18",
      start: 0.54,
      end: 0.86,
    },
    {
      type: "path",
      d: "M12 16h.01",
      start: 0.72,
      end: 0.92,
    },
    {
      type: "path",
      d: "M16 16h.01",
      start: 0.8,
      end: 1,
    },
  ],
  megaphone: [
    {
      type: "path",
      d: "m3 11 18-5v12L3 14v-3z",
      start: 0,
      end: 0.78,
    },
    {
      type: "path",
      d: "M11.6 16.8a3 3 0 1 1-5.8-1.6",
      start: 0.58,
      end: 1,
    },
  ],
  rocket: [
    {
      type: "path",
      d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
      start: 0,
      end: 0.45,
    },
    {
      type: "path",
      d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.87 12.87 0 0 1 22 2c0 2.72-.78 7.5-6.05 11A22.35 22.35 0 0 1 12 15z",
      start: 0.08,
      end: 0.78,
    },
    {
      type: "path",
      d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",
      start: 0.4,
      end: 0.82,
    },
    {
      type: "path",
      d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
      start: 0.5,
      end: 0.9,
    },
    {
      type: "circle",
      cx: 16,
      cy: 8,
      r: 1,
      start: 0.74,
      end: 1,
    },
  ],
};

const LucidePieceShape: React.FC<{
  piece: LucidePiece;
  progress?: number;
}> = ({piece, progress}) => {
  const draw =
    progress === undefined ? 1 : range(progress, piece.start, piece.end);
  const animation =
    progress === undefined
      ? {}
      : {
          pathLength: 1,
          strokeDasharray: "1 1",
          strokeDashoffset: 1 - draw,
          opacity: draw < 0.002 ? 0 : 1,
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
  const rotation =
    kind === "flask-conical"
      ? (1 - progress) * -8
      : kind === "rocket"
        ? (1 - progress) * -14
        : 0;
  const lift = kind === "rocket" ? (1 - progress) * 11 : 0;

  return (
    <g transform={`translate(0 ${lift}) rotate(${rotation})`}>
      <g
        transform="translate(-48 -48) scale(4)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g opacity="0.12">
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

const Connector: React.FC<{
  frame: number;
  index: number;
}> = ({frame, index}) => {
  const startFrame = CONNECT_FRAMES[index];
  const reveal = range(frame, startFrame, startFrame + 62);
  const sourceX =
    START_X + index * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2 + 78;
  const targetX =
    START_X +
    (index + 1) * (CARD_WIDTH + CARD_GAP) +
    CARD_WIDTH / 2 -
    78;
  const slowTime =
    frame <= 720 ? frame : 720 + (frame - 720) * 0.42;
  const period = 92 - index * 9;

  return (
    <g opacity={reveal}>
      <line
        x1={sourceX}
        y1={ICON_Y}
        x2={sourceX + (targetX - sourceX) * reveal}
        y2={ICON_Y}
        stroke="#D6DFEA"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1={sourceX}
        y1={ICON_Y}
        x2={sourceX + (targetX - sourceX) * reveal}
        y2={ICON_Y}
        stroke={STEPS[index + 1].color}
        strokeWidth="2"
        strokeDasharray="7 11"
        strokeDashoffset={-slowTime * 0.34}
        strokeLinecap="round"
        opacity="0.56"
      />
      {Array.from({length: 4}, (_, particleIndex) => {
        const elapsed =
          slowTime - startFrame - particleIndex * (period / 4);
        const local = ((elapsed % period) + period) % period;
        const progress = local / period;
        const active = frame >= startFrame + particleIndex * 5 ? 1 : 0;
        const opacity =
          active *
          reveal *
          Math.sin(progress * Math.PI) *
          (particleIndex === 0 ? 0.92 : 0.52);

        return (
          <circle
            key={particleIndex}
            cx={sourceX + (targetX - sourceX) * progress}
            cy={
              ICON_Y +
              Math.sin(progress * Math.PI * 2 + particleIndex) * 3
            }
            r={particleIndex === 0 ? 5.5 : 3.5}
            fill={STEPS[index + 1].color}
            opacity={opacity}
            filter="url(#particle-glow)"
          />
        );
      })}
    </g>
  );
};

const LaunchBurst: React.FC<{frame: number}> = ({frame}) => {
  const start = 560;
  const progress = clamp((frame - start) / 115);
  const visible =
    range(frame, start - 12, start + 8) * (1 - smooth(progress));
  const x =
    START_X +
    (STEPS.length - 1) * (CARD_WIDTH + CARD_GAP) +
    CARD_WIDTH / 2;

  return (
    <g opacity={visible}>
      {Array.from({length: 12}, (_, index) => {
        const angle = (Math.PI * 2 * index) / 12;
        const inner = 82 + progress * 18;
        const outer = 96 + progress * 82;
        return (
          <line
            key={index}
            x1={x + Math.cos(angle) * inner}
            y1={ICON_Y + Math.sin(angle) * inner}
            x2={x + Math.cos(angle) * outer}
            y2={ICON_Y + Math.sin(angle) * outer}
            stroke={STEPS[4].color}
            strokeWidth={5 - progress * 3}
            strokeLinecap="round"
            opacity={0.62 - index * 0.018}
          />
        );
      })}
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const backgroundIn = range(frame, 0, 42);
  const baselineIn = range(frame, 18, 118);
  const settle = range(frame, 710, 855);
  const cameraX = interpolate(frame, [0, 220, 520, 899], [30, 16, -20, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cameraScale = interpolate(
    frame,
    [0, 520, 899],
    [1.006, 1.018, 1.012],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const ambientX = Math.sin(frame / 106) * 11;
  const ambientY = Math.cos(frame / 128) * 8;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 43%, #FFFFFF 0%, #F8FAFD 58%, #EEF3F8 100%)",
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
          {STEPS.map((step, index) => {
            const x = START_X + index * (CARD_WIDTH + CARD_GAP);
            return (
              <React.Fragment key={step.label}>
                <clipPath id={`ribbon-clip-${index}`}>
                  <path d={ribbonPath(x)} />
                </clipPath>
                <radialGradient
                  id={`icon-medallion-${index}`}
                  cx="36%"
                  cy="29%"
                  r="76%"
                >
                  <stop offset="0" stopColor="white" stopOpacity="0.98" />
                  <stop
                    offset="0.56"
                    stopColor={step.color}
                    stopOpacity="0.1"
                  />
                  <stop
                    offset="1"
                    stopColor={step.color}
                    stopOpacity="0.21"
                  />
                </radialGradient>
              </React.Fragment>
            );
          })}
          <filter id="paper-shadow" x="-35%" y="-30%" width="190%" height="205%">
            <feDropShadow
              dx="8"
              dy="16"
              stdDeviation="16"
              floodColor="#17324D"
              floodOpacity="0.15"
            />
          </filter>
          <filter id="icon-shadow" x="-40%" y="-40%" width="180%" height="190%">
            <feDropShadow
              dx="0"
              dy="0.8"
              stdDeviation="0.65"
              floodColor="#17324D"
              floodOpacity="0.22"
            />
          </filter>
          <filter
            id="particle-glow"
            x="-250%"
            y="-250%"
            width="600%"
            height="600%"
          >
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="soft-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
          <linearGradient id="pipeline-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.48" stopColor="white" stopOpacity="0.5" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="micro-dots"
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.35" fill="#52677F" opacity="0.085" />
          </pattern>
        </defs>

        <rect width="1920" height="1080" fill="url(#micro-dots)" opacity="0.62" />
        <g
          opacity={0.3 * backgroundIn}
          transform={`translate(${ambientX} ${ambientY})`}
        >
          <circle
            cx="90"
            cy="138"
            r="285"
            fill="#654FC6"
            opacity="0.11"
            filter="url(#soft-blur)"
          />
          <circle
            cx="1815"
            cy="900"
            r="325"
            fill="#EF5E68"
            opacity="0.1"
            filter="url(#soft-blur)"
          />
        </g>

        <g
          transform={`translate(960 540) scale(${cameraScale}) translate(${
            -960 + cameraX
          } -540)`}
        >
          <line
            x1={START_X + 75}
            y1={TOP + CARD_HEIGHT / 2}
            x2={
              START_X +
              75 +
              (STEPS.length * CARD_WIDTH +
                (STEPS.length - 1) * CARD_GAP -
                150) *
                baselineIn
            }
            y2={TOP + CARD_HEIGHT / 2}
            stroke="#D6E0EA"
            strokeWidth="3"
            strokeDasharray="10 13"
            opacity={0.7}
          />

          {STEPS.map((step, index) => {
            const x = START_X + index * (CARD_WIDTH + CARD_GAP);
            const entranceStart = ENTRY_FRAMES[index];
            const entrance = spring({
              frame: frame - entranceStart,
              fps,
              config: {damping: 18, stiffness: 112, mass: 0.84},
              durationInFrames: 78,
            });
            const ribbonProgress = range(
              frame,
              entranceStart + 16,
              entranceStart + 64,
            );
            const iconProgress = range(
              frame,
              entranceStart + 40,
              entranceStart + 116,
            );
            const pulseProgress = clamp(
              (frame - (entranceStart + 108)) / 78,
            );
            const pulseOpacity =
              frame >= entranceStart + 108
                ? (1 - smooth(pulseProgress)) * 0.58
                : 0;
            const yDirection = index % 2 === 0 ? 1 : -1;
            const yOffset = (1 - entrance) * 68 * yDirection;
            const xOffset =
              (1 - entrance) *
              (index === 0 ? -44 : index === STEPS.length - 1 ? 46 : 0);
            const cardScale = 0.91 + entrance * 0.09;
            const breathe =
              1 +
              Math.sin((frame - entranceStart) / 31) *
                0.008 *
                iconProgress *
                (0.48 + settle * 0.52);
            const lift =
              step.icon === "rocket"
                ? -10 *
                  range(frame, entranceStart + 95, entranceStart + 130) *
                  (1 -
                    range(frame, entranceStart + 130, entranceStart + 175))
                : 0;

            return (
              <g
                key={step.label}
                opacity={entrance}
                transform={`translate(${x + CARD_WIDTH / 2 + xOffset} ${
                  TOP + CARD_HEIGHT / 2 + yOffset
                }) scale(${cardScale}) translate(${
                  -x - CARD_WIDTH / 2
                } ${-TOP - CARD_HEIGHT / 2})`}
              >
                <path
                  d={paperPath(x)}
                  fill="white"
                  stroke="#E0E7EF"
                  strokeWidth="2"
                  filter="url(#paper-shadow)"
                />
                <path
                  d={paperPath(x)}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  opacity="0.76"
                  transform="translate(-2 -2)"
                />

                <g clipPath={`url(#ribbon-clip-${index})`}>
                  <rect
                    x={x}
                    y={TOP + 29}
                    width={CARD_WIDTH * ribbonProgress}
                    height="81"
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
                  x={x + 140}
                  y={TOP + 78}
                  textAnchor="middle"
                  fill="white"
                  fontSize="19"
                  fontWeight="700"
                  letterSpacing="2"
                  opacity={range(
                    frame,
                    entranceStart + 42,
                    entranceStart + 74,
                  )}
                >
                  {step.label}
                </text>

                <circle
                  cx={x + CARD_WIDTH / 2 - 7}
                  cy={ICON_Y}
                  r={72}
                  fill={`url(#icon-medallion-${index})`}
                  opacity={0.94 * iconProgress}
                />
                <circle
                  cx={x + CARD_WIDTH / 2 - 7}
                  cy={ICON_Y}
                  r={72}
                  fill="none"
                  stroke={step.color}
                  strokeWidth="2"
                  opacity={0.18 * iconProgress}
                />
                <circle
                  cx={x + CARD_WIDTH / 2 - 7}
                  cy={ICON_Y}
                  r={73 + smooth(pulseProgress) * 51}
                  fill="none"
                  stroke={step.color}
                  strokeWidth={5 - smooth(pulseProgress) * 3}
                  opacity={pulseOpacity}
                />
                <g
                  color={step.color}
                  transform={`translate(${x + CARD_WIDTH / 2 - 7} ${
                    ICON_Y + lift
                  }) scale(${breathe})`}
                >
                  <StepIcon kind={step.icon} progress={iconProgress} />
                </g>

                {index > 0 ? (
                  <path
                    d={`M ${x + 7} ${TOP + 134} L ${x + 46} ${
                      TOP + CARD_HEIGHT / 2
                    } L ${x + 7} ${TOP + 296}`}
                    fill="none"
                    stroke="#CBD6E1"
                    strokeWidth="2"
                    opacity="0.72"
                  />
                ) : null}
              </g>
            );
          })}

          {CONNECT_FRAMES.map((_, index) => (
            <Connector key={index} frame={frame} index={index} />
          ))}

          <LaunchBurst frame={frame} />

          <rect
            x="-350"
            y={TOP + 32}
            width="265"
            height="72"
            fill="url(#pipeline-sheen)"
            opacity={
              0.78 *
              range(frame, 548, 582) *
              (1 - range(frame, 780, 835))
            }
            transform={`translate(${
              interpolate(frame, [548, 800], [0, 2580], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.quad),
              })
            } 0) skewX(-18)`}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
