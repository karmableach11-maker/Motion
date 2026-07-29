import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const linear = Easing.linear;

const BAR_HEIGHTS = [
  618, 638, 610, 576, 542, 497, 460, 476, 458, 430, 416, 405,
  358, 316, 270, 287, 309, 296, 274, 235, 212, 222, 193, 166,
  138, 118, 142, 119, 92, 78, 58, 42, 31, 21, 14, 9,
] as const;

const BAR_X = 154;
const BAR_STEP = 34.3;
const BAR_WIDTH = 24;

type Point = {x: number; y: number};

const ARROW_POINTS: Point[] = [
  {x: 176, y: 170},
  {x: 565, y: 334},
  {x: 760, y: 520},
  {x: 990, y: 550},
  {x: 1192, y: 704},
  {x: 1424, y: 765},
];

const arrowSegments = ARROW_POINTS.slice(1).map((point, index) => {
  const previous = ARROW_POINTS[index];
  const dx = point.x - previous.x;
  const dy = point.y - previous.y;
  return {
    start: previous,
    end: point,
    dx,
    dy,
    length: Math.hypot(dx, dy),
  };
});

const arrowLength = arrowSegments.reduce(
  (total, segment) => total + segment.length,
  0,
);

const hash = (value: number) => {
  const raw = Math.sin(value * 91.317 + 17.119) * 43758.5453;
  return raw - Math.floor(raw);
};

const particles = Array.from({length: 72}, (_, index) => {
  const periods = [225, 300, 450, 900];
  return {
    x: 24 + hash(index * 2.17) * 1872,
    period: periods[Math.floor(hash(index * 5.71) * periods.length)],
    offset: Math.floor(hash(index * 9.37) * 900),
    length: 8 + hash(index * 4.83) * 39,
    width: 2 + hash(index * 7.21) * 8,
    opacity: 0.18 + hash(index * 11.53) * 0.58,
    drift: 7 + hash(index * 3.91) * 28,
    blur: hash(index * 6.33) > 0.72 ? 3.2 : 0.8,
  };
});

const progress = (
  frame: number,
  start: number,
  end: number,
  easing = easeOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing,
  });

const getArrowState = (rawProgress: number) => {
  const amount = Math.max(0, Math.min(1, rawProgress));
  let remaining = arrowLength * amount;
  const revealed: Point[] = [ARROW_POINTS[0]];
  let tip = ARROW_POINTS[0];
  let angle = 0;

  for (const segment of arrowSegments) {
    if (remaining >= segment.length) {
      revealed.push(segment.end);
      remaining -= segment.length;
      tip = segment.end;
      angle = (Math.atan2(segment.dy, segment.dx) * 180) / Math.PI;
      continue;
    }

    const ratio = segment.length === 0 ? 0 : remaining / segment.length;
    tip = {
      x: segment.start.x + segment.dx * ratio,
      y: segment.start.y + segment.dy * ratio,
    };
    revealed.push(tip);
    angle = (Math.atan2(segment.dy, segment.dx) * 180) / Math.PI;
    break;
  }

  const path = revealed
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");

  return {path, tip, angle};
};

const Atmosphere: React.FC<{frame: number}> = ({frame}) => {
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 43% 72%, #170003 0%, #070002 35%, #010102 72%, #000 100%)",
        }}
      />

      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <radialGradient id="ambient-red" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#A60015" stopOpacity="0.26" />
            <stop offset="0.5" stopColor="#5B000C" stopOpacity="0.11" />
            <stop offset="1" stopColor="#120004" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="particle-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF4B5D" stopOpacity="0" />
            <stop offset="0.35" stopColor="#F50A26" />
            <stop offset="1" stopColor="#65000C" stopOpacity="0" />
          </linearGradient>
          <filter id="ambient-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="42" />
          </filter>
        </defs>

        <ellipse
          cx={690 + Math.sin((frame / 900) * Math.PI * 2) * 95}
          cy="790"
          rx="720"
          ry="280"
          fill="url(#ambient-red)"
          filter="url(#ambient-blur)"
          opacity={0.55 + Math.sin(frame / 47) * 0.05}
        />
        <ellipse
          cx={1280 - Math.sin((frame / 900) * Math.PI * 2) * 70}
          cy="280"
          rx="430"
          ry="230"
          fill="url(#ambient-red)"
          filter="url(#ambient-blur)"
          opacity="0.22"
        />

        {particles.map((particle, index) => {
          const local =
            ((frame + particle.offset) % particle.period) / particle.period;
          const y = -85 + local * 1275;
          const edgeFade = Math.sin(local * Math.PI);
          const x =
            particle.x +
            Math.sin(local * Math.PI * 2 + index) * particle.drift;
          const tilt = -5 + hash(index * 13.7) * 10;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={particle.width}
              height={particle.length}
              rx={particle.width / 2}
              fill="url(#particle-red)"
              opacity={particle.opacity * Math.pow(edgeFade, 0.72)}
              filter={`blur(${particle.blur}px)`}
              transform={`rotate(${tilt} ${x} ${y})`}
            />
          );
        })}
      </svg>
    </>
  );
};

const NeonAxes: React.FC<{frame: number}> = ({frame}) => {
  const build = progress(frame, 20, 100, easeInOut);
  const collapse = progress(frame, 825, 895, easeInOut);
  const amount = build * (1 - collapse);

  return (
    <g opacity={0.35 + amount * 0.65}>
      <path
        d="M 136 878 L 142 150"
        pathLength="1"
        stroke="#7173FF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - amount}
        filter="url(#axis-glow)"
      />
      <path
        d="M 136 878 L 1430 934"
        pathLength="1"
        stroke="#6377FF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - amount}
        filter="url(#axis-glow)"
      />
      <path
        d="M 136 878 L 1430 934"
        pathLength="1"
        stroke="#AFB5FF"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset={1 - amount}
        opacity="0.9"
      />
    </g>
  );
};

const DecliningBars: React.FC<{frame: number}> = ({frame}) => {
  return (
    <>
      <g clipPath="url(#floor-clip)" mask="url(#floor-mask)">
        {BAR_HEIGHTS.map((height, index) => {
          const enter = progress(
            frame,
            70 + index * 12,
            116 + index * 12,
            easeOut,
          );
          const exitStart = 760 + (BAR_HEIGHTS.length - 1 - index) * 3;
          const exit = progress(frame, exitStart, exitStart + 31, easeInOut);
          const visible = enter * (1 - exit);
          const baseY = 876 + index * 1.46;
          const reflectionHeight = height * visible * 0.39;
          const x = BAR_X + index * BAR_STEP;

          return (
            <g key={`reflection-${index}`} opacity={visible * 0.3}>
              <rect
                x={x}
                y={baseY + 9}
                width={BAR_WIDTH}
                height={reflectionHeight}
                fill="url(#reflection-red)"
              />
              <polygon
                points={`${x + BAR_WIDTH},${baseY + 9} ${x + BAR_WIDTH + 6},${baseY + 14} ${x + BAR_WIDTH + 6},${baseY + 14 + reflectionHeight} ${x + BAR_WIDTH},${baseY + 9 + reflectionHeight}`}
                fill="#53000A"
                opacity="0.7"
              />
            </g>
          );
        })}
      </g>

      <g>
        {BAR_HEIGHTS.map((height, index) => {
          const enter = progress(
            frame,
            70 + index * 12,
            116 + index * 12,
            easeOut,
          );
          const exitStart = 760 + (BAR_HEIGHTS.length - 1 - index) * 3;
          const exit = progress(frame, exitStart, exitStart + 31, easeInOut);
          const visible = enter * (1 - exit);
          const currentHeight = Math.max(0.01, height * visible);
          const baseY = 876 + index * 1.46;
          const topY = baseY - currentHeight;
          const x = BAR_X + index * BAR_STEP;
          const pulse = 0.88 + Math.sin(frame / 22 + index * 0.37) * 0.08;

          return (
            <g
              key={`bar-${index}`}
              opacity={visible}
              filter={visible > 0.02 ? "url(#bar-glow)" : undefined}
            >
              <rect
                x={x}
                y={topY}
                width={BAR_WIDTH}
                height={currentHeight}
                fill="url(#bar-front)"
                opacity={pulse}
              />
              <rect
                x={x + 2}
                y={topY + 4}
                width="2.4"
                height={Math.max(0, currentHeight - 7)}
                rx="1.2"
                fill="#FF8B95"
                opacity="0.36"
              />
              <polygon
                points={`${x + BAR_WIDTH},${topY} ${x + BAR_WIDTH + 7},${topY + 5} ${x + BAR_WIDTH + 7},${baseY + 5} ${x + BAR_WIDTH},${baseY}`}
                fill="url(#bar-side)"
              />
              <polygon
                points={`${x},${topY} ${x + BAR_WIDTH},${topY} ${x + BAR_WIDTH + 7},${topY + 5} ${x + 7},${topY + 5}`}
                fill="url(#bar-top)"
              />
            </g>
          );
        })}
      </g>
    </>
  );
};

const TrendArrow: React.FC<{frame: number}> = ({frame}) => {
  const build = progress(frame, 76, 522, linear);
  const collapse = progress(frame, 770, 883, easeInOut);
  const arrowProgress = build * (1 - collapse);
  const {path, tip, angle} = getArrowState(arrowProgress);
  const showHead = progress(arrowProgress, 0.015, 0.045, easeOut);
  const breathe = 0.92 + Math.sin(frame / 29) * 0.08;

  return (
    <g opacity={arrowProgress > 0.001 ? 1 : 0}>
      <path
        d={path}
        fill="none"
        stroke="#FF3650"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.28 * breathe}
        filter="url(#arrow-wide-glow)"
      />
      <path
        d={path}
        fill="none"
        stroke="url(#arrow-stroke)"
        strokeWidth="17"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#arrow-glow)"
      />
      <path
        d={path}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.96"
      />
      <g
        transform={`translate(${tip.x} ${tip.y}) rotate(${angle}) scale(${showHead})`}
        filter="url(#arrow-glow)"
      >
        <path
          d="M 8 0 L -47 -34 L -34 0 L -47 34 Z"
          fill="url(#arrow-head)"
        />
        <path
          d="M 4 0 L -39 -24 L -30 0 L -39 24 Z"
          fill="#FFFFFF"
          opacity="0.82"
        />
      </g>
    </g>
  );
};

const Chart: React.FC<{frame: number}> = ({frame}) => {
  const holdBreath =
    progress(frame, 520, 590, easeInOut) *
    (1 - progress(frame, 720, 770, easeInOut));
  const scale = 1 + Math.sin((frame - 520) / 72) * 0.003 * holdBreath;
  const translateX = (1 - scale) * 530;
  const translateY = (1 - scale) * 590;

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: "absolute", inset: 0, overflow: "visible"}}
    >
      <defs>
        <linearGradient id="bar-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF344A" />
          <stop offset="0.13" stopColor="#F5102C" />
          <stop offset="0.62" stopColor="#C4001B" />
          <stop offset="1" stopColor="#69000E" />
        </linearGradient>
        <linearGradient id="bar-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#A30018" />
          <stop offset="1" stopColor="#390008" />
        </linearGradient>
        <linearGradient id="bar-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF8995" />
          <stop offset="0.5" stopColor="#FF263F" />
          <stop offset="1" stopColor="#8B0014" />
        </linearGradient>
        <linearGradient id="reflection-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EE0925" stopOpacity="0.42" />
          <stop offset="1" stopColor="#850011" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="arrow-stroke"
          x1="170"
          y1="160"
          x2="1440"
          y2="780"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFF9FA" />
          <stop offset="0.55" stopColor="#FFDDE2" />
          <stop offset="1" stopColor="#FFB3C0" />
        </linearGradient>
        <linearGradient id="arrow-head" x1="-47" y1="0" x2="8" y2="0">
          <stop offset="0" stopColor="#FF788B" />
          <stop offset="0.56" stopColor="#FFD7DE" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id="floor-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.88" />
          <stop offset="0.72" stopColor="white" stopOpacity="0.12" />
          <stop offset="1" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <mask id="floor-mask">
          <rect x="0" y="865" width="1920" height="215" fill="url(#floor-fade)" />
        </mask>
        <clipPath id="floor-clip">
          <rect x="0" y="872" width="1920" height="208" />
        </clipPath>
        <filter id="bar-glow" x="-45%" y="-20%" width="190%" height="150%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0.34  0 0.12 0 0 0  0 0 0.12 0 0  0 0 0 0.42 0"
            result="redGlow"
          />
          <feMerge>
            <feMergeNode in="redGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="axis-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="arrow-glow" x="-40%" y="-50%" width="180%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0.32  0 0.28 0 0 0  0 0 0.28 0 0.05  0 0 0 0.9 0"
            result="pink"
          />
          <feMerge>
            <feMergeNode in="pink" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="arrow-wide-glow"
          x="-60%"
          y="-70%"
          width="220%"
          height="240%"
        >
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      <g transform={`translate(${translateX} ${translateY}) scale(${scale})`}>
        <NeonAxes frame={frame} />
        <DecliningBars frame={frame} />
        <TrendArrow frame={frame} />
      </g>
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      <Atmosphere frame={frame} />
      <Chart frame={frame} />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 42% 54%, transparent 0%, transparent 43%, rgba(0,0,0,0.25) 72%, rgba(0,0,0,0.82) 100%), linear-gradient(180deg, rgba(0,0,0,0.30), transparent 18%, transparent 77%, rgba(0,0,0,0.46))",
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.72)",
        }}
      />
    </AbsoluteFill>
  );
};
