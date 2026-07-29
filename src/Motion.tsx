import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type IconName = "foundation" | "traction" | "scale" | "leadership";

type Milestone = {
  number: string;
  label: string;
  color: string;
  accent: string;
  icon: IconName;
  start: number;
  x: number;
  y: number;
  bars: readonly number[];
};

const MILESTONES: readonly Milestone[] = [
  {
    number: "01",
    label: "FOUNDATION",
    color: "#2B59C3",
    accent: "#7798F3",
    icon: "foundation",
    start: 54,
    x: 150,
    y: 666,
    bars: [0.34, 0.54, 0.76],
  },
  {
    number: "02",
    label: "TRACTION",
    color: "#007F8B",
    accent: "#44CBD3",
    icon: "traction",
    start: 214,
    x: 550,
    y: 531,
    bars: [0.44, 0.68, 0.88],
  },
  {
    number: "03",
    label: "SCALE",
    color: "#8A5BC4",
    accent: "#B997E4",
    icon: "scale",
    start: 359,
    x: 950,
    y: 396,
    bars: [0.58, 0.78, 1],
  },
  {
    number: "04",
    label: "LEADERSHIP",
    color: "#DD653C",
    accent: "#F6A077",
    icon: "leadership",
    start: 489,
    x: 1350,
    y: 261,
    bars: [0.68, 0.88, 1],
  },
];

const CARD_WIDTH = 300;
const CARD_HEIGHT = 208;
const CARD_RADIUS = 24;
const CONNECTOR_LENGTH = 170;
const LABEL_X = 136;
const LABEL_RIGHT_PADDING = 24;
const LABEL_MAX_WIDTH = CARD_WIDTH - LABEL_X - LABEL_RIGHT_PADDING;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const smooth = (value: number) =>
  Easing.inOut(Easing.cubic)(clamp(value));

const easeOut = (value: number) =>
  Easing.out(Easing.cubic)(clamp(value));

const range = (frame: number, start: number, end: number) =>
  smooth((frame - start) / (end - start));

// Lucide Static v1.27.0 — ISC license.
// Source icons: Landmark, ChartNoAxesCombined, ChartSpline, and Crown.
const LUCIDE_ICON_PATHS: Readonly<Record<IconName, readonly string[]>> = {
  foundation: [
    "M10 18v-7",
    "M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z",
    "M14 18v-7",
    "M18 18v-7",
    "M3 22h18",
    "M6 18v-7",
  ],
  traction: [
    "M12 16v5",
    "M16 14.639V21",
    "M20 10.656V21",
    "m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15",
    "M4 18.463V21",
    "M8 14.656V21",
  ],
  scale: [
    "M3 3v16a2 2 0 0 0 2 2h16",
    "M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7",
  ],
  leadership: [
    "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
    "M5 21h14",
  ],
};

const Icon: React.FC<{
  type: IconName;
  color: string;
  draw: number;
}> = ({type, color, draw}) => {
  const paths = LUCIDE_ICON_PATHS[type];
  const iconScale = type === "leadership" ? 3.05 : 3.18;

  return (
    <g
      opacity={interpolate(draw, [0, 0.12, 1], [0, 1, 1])}
      transform={`translate(0 ${(1 - easeOut(draw)) * 9}) scale(${
        0.92 + easeOut(draw) * 0.08
      })`}
    >
      <g
        transform={`translate(${-12 * iconScale} ${-12 * iconScale}) scale(${iconScale})`}
        filter="url(#icon-glow)"
      >
        {paths.map((path, pathIndex) => {
          const delay = pathIndex * 0.055;
          const localDraw = clamp((draw - delay) / (1 - delay));
          const dash = type === "leadership" ? 104 : 72;

          return (
            <path
              key={`${type}-${pathIndex}`}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="1.55"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={dash}
              strokeDashoffset={dash * (1 - localDraw)}
              opacity={interpolate(localDraw, [0, 0.1, 1], [0, 1, 1])}
            />
          );
        })}
      </g>
    </g>
  );
};

const MilestoneCard: React.FC<{
  milestone: Milestone;
  index: number;
  frame: number;
  fps: number;
}> = ({milestone, index, frame, fps}) => {
  const entrance = spring({
    fps,
    frame: frame - milestone.start,
    durationInFrames: 78,
    config: {
      damping: 18,
      stiffness: 118,
      mass: 0.92,
    },
  });
  const outline = range(frame, milestone.start + 4, milestone.start + 54);
  const iconDraw = range(frame, milestone.start + 24, milestone.start + 94);
  const labelIn = range(frame, milestone.start + 58, milestone.start + 91);
  const barsIn = range(frame, milestone.start + 76, milestone.start + 120);
  const pulse = range(frame, milestone.start + 94, milestone.start + 154);
  const pulseOpacity =
    frame >= milestone.start + 94 ? (1 - easeOut(pulse)) * 0.3 : 0;
  const finalPulseStart = 655 + index * 46;
  const finalPulse = range(frame, finalPulseStart, finalPulseStart + 66);
  const finalPulseOpacity =
    frame >= finalPulseStart ? (1 - easeOut(finalPulse)) * 0.2 : 0;
  const activePulse =
    frame < 640 ? pulse : finalPulse;
  const activePulseOpacity =
    frame < 640 ? pulseOpacity : finalPulseOpacity;

  const translateX = (1 - entrance) * -34;
  const translateY = (1 - entrance) * 54;
  const scale = 0.93 + entrance * 0.07;
  const outlineLength = 980;
  const isLongLabel = milestone.label.length > 9;
  const labelFontSize = isLongLabel ? 18 : 21;
  const labelLetterSpacing = isLongLabel ? 0.85 : 1.45;

  return (
    <g
      opacity={clamp(entrance)}
      transform={`translate(${milestone.x + CARD_WIDTH / 2 + translateX} ${
        milestone.y + CARD_HEIGHT / 2 + translateY
      }) scale(${scale}) translate(${-CARD_WIDTH / 2} ${-CARD_HEIGHT / 2})`}
    >
      <defs>
        <clipPath id={`label-clip-${index}`}>
          <rect
            x={LABEL_X - 2}
            y="66"
            width={LABEL_MAX_WIDTH + 2}
            height="38"
          />
        </clipPath>
      </defs>
      <rect
        x="14"
        y="18"
        width={CARD_WIDTH - 8}
        height={CARD_HEIGHT - 1}
        rx={CARD_RADIUS}
        fill="#20343F"
        opacity={0.1 * outline}
        filter="url(#card-shadow)"
      />
      <rect
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        rx={CARD_RADIUS}
        fill="url(#card-fill)"
        stroke="#E5EBEF"
        strokeWidth="2"
      />
      <rect
        x="0"
        y="0"
        width={CARD_WIDTH}
        height="7"
        rx="3.5"
        fill={milestone.color}
        opacity={outline}
      />
      <rect
        x="1"
        y="1"
        width={CARD_WIDTH - 2}
        height={CARD_HEIGHT - 2}
        rx={CARD_RADIUS - 1}
        fill="none"
        stroke={milestone.color}
        strokeWidth="2.4"
        strokeDasharray={outlineLength}
        strokeDashoffset={outlineLength * (1 - outline)}
        opacity={0.78}
      />

      <text
        x="263"
        y="44"
        textAnchor="end"
        fill={milestone.color}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="25"
        fontWeight="800"
        letterSpacing="-0.7"
        opacity={range(frame, milestone.start + 16, milestone.start + 47)}
      >
        {milestone.number}
      </text>

      <g transform="translate(72 88)">
        <circle
          r="47"
          fill={`url(#icon-bg-${index})`}
          opacity={iconDraw}
          filter="url(#icon-medallion-shadow)"
        />
        <circle
          r="46.5"
          fill="none"
          stroke={milestone.color}
          strokeWidth="2"
          opacity={0.3 * iconDraw}
        />
        <path
          d="M -28 -29 A 40 40 0 0 1 25 -31"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.8 * iconDraw}
        />
        <circle
          r={48 + easeOut(activePulse) * 29}
          fill="none"
          stroke={milestone.accent}
          strokeWidth={3 - easeOut(activePulse) * 1.7}
          opacity={activePulseOpacity}
        />
        <Icon type={milestone.icon} color={milestone.color} draw={iconDraw} />
      </g>

      <text
        x={LABEL_X}
        y="94"
        fill="#17232A"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={labelFontSize}
        fontWeight="800"
        letterSpacing={labelLetterSpacing}
        opacity={labelIn}
        transform={`translate(${(1 - labelIn) * 12} 0)`}
        clipPath={`url(#label-clip-${index})`}
      >
        {milestone.label}
      </text>

      <g transform="translate(137 118)" opacity={barsIn}>
        {[0, 1, 2].map((barIndex) => {
          const local = range(
            frame,
            milestone.start + 77 + barIndex * 8,
            milestone.start + 113 + barIndex * 8,
          );
          const width = 112 * milestone.bars[barIndex] * local;
          return (
            <g key={barIndex} transform={`translate(0 ${barIndex * 18})`}>
              <rect
                width="112"
                height="7"
                rx="3.5"
                fill="#E8EDF0"
              />
              <rect
                width={width}
                height="7"
                rx="3.5"
                fill={milestone.color}
                opacity={0.78 + barIndex * 0.08}
              />
            </g>
          );
        })}
      </g>

      <circle
        cx={CARD_WIDTH}
        cy="94"
        r="9"
        fill="#FFFFFF"
        stroke={milestone.color}
        strokeWidth="3"
        opacity={outline}
      />
      <circle
        cx="0"
        cy="94"
        r="9"
        fill="#FFFFFF"
        stroke={milestone.color}
        strokeWidth="3"
        opacity={outline}
      />
    </g>
  );
};

const Connector: React.FC<{
  index: number;
  frame: number;
}> = ({index, frame}) => {
  const source = MILESTONES[index];
  const target = MILESTONES[index + 1];
  const startFrame = [145, 295, 435][index];
  const railIn = range(frame, startFrame - 34, startFrame + 8);
  const reveal = range(frame, startFrame, startFrame + 80);
  const x1 = source.x + CARD_WIDTH;
  const y1 = source.y + 94;
  const x2 = target.x;
  const y2 = target.y + 94;
  const control = 42;
  const path = `M ${x1} ${y1} C ${x1 + control} ${y1} ${
    x2 - control
  } ${y2} ${x2} ${y2}`;
  const gradientId = `progress-gradient-${index}`;

  const particleStart = startFrame + 26;
  const particleProgress = range(frame, particleStart, particleStart + 94);
  const particleOpacity =
    range(frame, particleStart, particleStart + 12) *
    (1 - range(frame, particleStart + 72, particleStart + 94));
  const particleX = interpolate(
    particleProgress,
    [0, 1],
    [x1 + 8, x2 - 8],
  );
  const particleY = interpolate(
    particleProgress,
    [0, 1],
    [y1, y2],
  );

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#DCE5E9"
        strokeWidth="5"
        strokeLinecap="round"
        opacity={0.92 * railIn}
      />
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={CONNECTOR_LENGTH}
        strokeDashoffset={CONNECTOR_LENGTH * (1 - reveal)}
        opacity={range(frame, startFrame, startFrame + 3)}
        filter="url(#line-glow)"
      />
      <circle
        cx={particleX}
        cy={particleY}
        r="17"
        fill={target.accent}
        opacity={0.14 * particleOpacity}
        filter="url(#particle-blur)"
      />
      <circle
        cx={particleX}
        cy={particleY}
        r="5.5"
        fill="#FFFFFF"
        stroke={target.color}
        strokeWidth="2"
        opacity={particleOpacity}
      />
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const backgroundIn = range(frame, 0, 52);
  const gridIn = range(frame, 10, 90);
  const cameraProgress = range(frame, 0, 620);
  const cameraX = interpolate(cameraProgress, [0, 1], [24, -18]);
  const cameraY = interpolate(cameraProgress, [0, 1], [18, -12]);
  const cameraScale = interpolate(cameraProgress, [0, 1], [0.994, 1.012]);

  const shimmer = range(frame, 640, 790);
  const shimmerOpacity =
    range(frame, 640, 670) * (1 - range(frame, 760, 800));
  const shimmerX = interpolate(shimmer, [0, 1], [400, 1578]);
  const shimmerY = interpolate(shimmer, [0, 1], [772, 370]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F2F6F7",
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
          <linearGradient id="background-wash" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#EFF5F6" />
            <stop offset="0.5" stopColor="#FAFCFC" />
            <stop offset="1" stopColor="#F3F0F9" />
          </linearGradient>
          <linearGradient id="card-fill" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FBFDFD" />
          </linearGradient>
          {MILESTONES.slice(0, -1).map((milestone, index) => (
            <linearGradient
              key={milestone.number}
              id={`progress-gradient-${index}`}
              x1="0"
              y1="1"
              x2="1"
              y2="0"
            >
              <stop offset="0" stopColor={milestone.color} />
              <stop offset="1" stopColor={MILESTONES[index + 1].color} />
            </linearGradient>
          ))}
          {MILESTONES.map((milestone, index) => (
            <radialGradient
              key={`icon-bg-${milestone.number}`}
              id={`icon-bg-${index}`}
              cx="31%"
              cy="24%"
              r="82%"
            >
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop
                offset="0.58"
                stopColor={milestone.accent}
                stopOpacity="0.13"
              />
              <stop
                offset="1"
                stopColor={milestone.color}
                stopOpacity="0.2"
              />
            </radialGradient>
          ))}
          <filter
            id="card-shadow"
            x="-25%"
            y="-30%"
            width="170%"
            height="190%"
          >
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter
            id="line-glow"
            x="-30%"
            y="-70%"
            width="160%"
            height="240%"
          >
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="icon-glow"
            x="-24%"
            y="-24%"
            width="148%"
            height="148%"
          >
            <feGaussianBlur stdDeviation="0.35" result="icon-blur" />
            <feMerge>
              <feMergeNode in="icon-blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="icon-medallion-shadow"
            x="-40%"
            y="-40%"
            width="180%"
            height="190%"
          >
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="5"
              floodColor="#344A55"
              floodOpacity="0.15"
            />
          </filter>
          <filter
            id="particle-blur"
            x="-120%"
            y="-120%"
            width="340%"
            height="340%"
          >
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <pattern
            id="dot-grid"
            width="38"
            height="38"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" fill="#8AA1AA" opacity="0.19" />
          </pattern>
        </defs>

        <rect width="1920" height="1080" fill="url(#background-wash)" />
        <rect
          width="1920"
          height="1080"
          fill="url(#dot-grid)"
          opacity={0.52 * gridIn}
        />
        <path
          d="M -80 985 C 380 893 625 762 930 646 C 1260 521 1550 356 1990 128"
          fill="none"
          stroke="#B8C7CC"
          strokeWidth="2"
          strokeDasharray="5 18"
          opacity={0.18 * backgroundIn}
        />
        <path
          d="M -90 1030 C 390 925 665 800 970 678 C 1310 542 1600 374 2020 170"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="34"
          opacity={0.42 * backgroundIn}
          filter="url(#particle-blur)"
        />

        <g
          transform={`translate(960 540) translate(${cameraX} ${cameraY}) scale(${cameraScale}) translate(-960 -540)`}
        >
          {MILESTONES.slice(0, -1).map((milestone, index) => (
            <Connector
              key={`connector-${milestone.number}`}
              index={index}
              frame={frame}
            />
          ))}

          {MILESTONES.map((milestone, index) => (
            <MilestoneCard
              key={milestone.number}
              milestone={milestone}
              index={index}
              frame={frame}
              fps={fps}
            />
          ))}

          <g opacity={shimmerOpacity}>
            <circle
              cx={shimmerX}
              cy={shimmerY}
              r="32"
              fill="#FFFFFF"
              opacity="0.18"
              filter="url(#particle-blur)"
            />
            <circle
              cx={shimmerX}
              cy={shimmerY}
              r="7"
              fill="#FFFFFF"
              stroke="#6B77B7"
              strokeWidth="2"
            />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
