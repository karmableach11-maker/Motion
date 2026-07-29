// VERIFIED SOURCE: TEXT-FREE GLASSMORPHISM INFOGRAPHIC — MOTION33
// Five glass pillars and a continuous growth line, 15 seconds at 60 fps.
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const BASE_Y = 846;
const BAR_WIDTH = 122;
const BAR_DEPTH = 30;

type Milestone = {
  readonly id: string;
  readonly x: number;
  readonly height: number;
  readonly startFrame: number;
  readonly color: string;
  readonly light: string;
  readonly dark: string;
  readonly accent: string;
};

const MILESTONES: readonly Milestone[] = [
  {
    id: "foundation",
    x: 376,
    height: 164,
    startFrame: 66,
    color: "#43D9FF",
    light: "#D7FAFF",
    dark: "#127DA8",
    accent: "#73F2D0",
  },
  {
    id: "traction",
    x: 626,
    height: 246,
    startFrame: 122,
    color: "#56A7FF",
    light: "#D9ECFF",
    dark: "#2754B8",
    accent: "#A899FF",
  },
  {
    id: "momentum",
    x: 876,
    height: 328,
    startFrame: 178,
    color: "#8978FF",
    light: "#E9E3FF",
    dark: "#4C34BC",
    accent: "#FF8FC8",
  },
  {
    id: "expansion",
    x: 1126,
    height: 414,
    startFrame: 234,
    color: "#F06CBC",
    light: "#FFE0F2",
    dark: "#A42D75",
    accent: "#FFB66F",
  },
  {
    id: "scale",
    x: 1376,
    height: 526,
    startFrame: 290,
    color: "#FF9D66",
    light: "#FFF0D9",
    dark: "#B44D3E",
    accent: "#FFE171",
  },
] as const;

const PARTICLES = Array.from({length: 54}, (_, index) => {
  const fract = (value: number): number => value - Math.floor(value);
  const a = fract(Math.sin(index * 61.37 + 3.8) * 43758.5453);
  const b = fract(Math.sin(index * 29.71 + 17.2) * 24634.6345);
  const c = fract(Math.sin(index * 83.13 + 9.4) * 17485.2194);

  return {
    x: 90 + a * 1740,
    y: 70 + b * 880,
    radius: 0.8 + c * 2,
    opacity: 0.08 + fract(a + b) * 0.2,
    drift: 0.5 + c * 1.3,
    phase: a * Math.PI * 2,
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

const finalPoint = (milestone: Milestone): {x: number; y: number} => ({
  x: milestone.x + BAR_WIDTH / 2 + BAR_DEPTH / 2,
  y: BASE_Y - milestone.height + 8,
});

const GROWTH_POINTS = MILESTONES.map(finalPoint);
const GROWTH_POINTS_STRING = GROWTH_POINTS.map(
  (point) => `${point.x},${point.y}`,
).join(" ");

const pointOnGrowthLine = (amount: number): {x: number; y: number} => {
  const clamped = clamp(amount);
  const scaled = clamped * (GROWTH_POINTS.length - 1);
  const index = Math.min(
    GROWTH_POINTS.length - 2,
    Math.max(0, Math.floor(scaled)),
  );
  const local = scaled - index;
  const from = GROWTH_POINTS[index];
  const to = GROWTH_POINTS[index + 1];

  return {
    x: mix(from.x, to.x, local),
    y: mix(from.y, to.y, local),
  };
};

const Background: React.FC<{readonly frame: number}> = ({frame}) => {
  const reveal = progress(frame, 0, 42, Easing.out(Easing.quad));
  const drift = progress(frame, 0, 899, Easing.inOut(Easing.cubic));

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 42%, #102A47 0%, #07172C 42%, #030915 78%, #02050D 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          transform: `translate(${mix(-32, 22, drift)}px, ${mix(
            18,
            -14,
            drift,
          )}px) scale(1.04)`,
          opacity: reveal,
          background:
            "radial-gradient(ellipse 48% 58% at 15% 42%, rgba(50,213,255,0.20) 0%, rgba(50,213,255,0.055) 43%, transparent 72%)",
        }}
      />

      <AbsoluteFill
        style={{
          transform: `translate(${mix(30, -22, drift)}px, ${mix(
            -12,
            16,
            drift,
          )}px) scale(1.04)`,
          opacity: reveal,
          background:
            "radial-gradient(ellipse 50% 64% at 88% 55%, rgba(215,83,185,0.20) 0%, rgba(137,74,255,0.07) 40%, transparent 73%)",
        }}
      />

      <AbsoluteFill
        style={{
          opacity: reveal * 0.75,
          background:
            "linear-gradient(118deg, transparent 26%, rgba(255,255,255,0.028) 47%, transparent 66%)",
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <pattern
            id="ambient-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="#A7E9FF"
              strokeOpacity="0.065"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="floor-aura">
            <stop offset="0" stopColor="#52CFFF" stopOpacity="0.2" />
            <stop offset="0.42" stopColor="#876DFF" stopOpacity="0.075" />
            <stop offset="1" stopColor="#07152A" stopOpacity="0" />
          </radialGradient>
          <filter id="ambient-blur" x="-40%" y="-100%" width="180%" height="300%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        <rect
          width={WIDTH}
          height={HEIGHT}
          fill="url(#ambient-grid)"
          opacity={0.36 * reveal}
          transform={`translate(${mix(0, -10, drift)} ${mix(
            0,
            -5,
            drift,
          )})`}
        />

        <ellipse
          cx="1000"
          cy="876"
          rx="810"
          ry="190"
          fill="url(#floor-aura)"
          opacity={0.86 * reveal}
          filter="url(#ambient-blur)"
        />

        {PARTICLES.map((particle, index) => {
          const floatX =
            Math.sin(frame * 0.012 * particle.drift + particle.phase) * 7;
          const floatY =
            Math.cos(frame * 0.009 * particle.drift + particle.phase) * 9;
          const twinkle =
            0.68 +
            0.32 *
              Math.sin(frame * 0.022 + particle.phase + index * 0.13);

          return (
            <circle
              key={`particle-${index}`}
              cx={particle.x + floatX}
              cy={particle.y + floatY}
              r={particle.radius}
              fill={index % 5 === 0 ? "#FFD8F2" : "#D8F7FF"}
              opacity={particle.opacity * twinkle * reveal}
            />
          );
        })}
      </svg>

      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 210px rgba(0,0,0,0.62)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

const MilestonePillar: React.FC<{
  readonly frame: number;
  readonly milestone: Milestone;
  readonly stageIndex: number;
}> = ({frame, milestone, stageIndex}) => {
  const rise = progress(
    frame,
    milestone.startFrame,
    milestone.startFrame + 82,
    Easing.out(Easing.back(1.05)),
  );
  const cleanRise = clamp(rise, 0, 1.06);
  const bodyHeight = Math.max(1, milestone.height * cleanRise);
  const topY = BASE_Y - bodyHeight;
  const finalTopY = BASE_Y - milestone.height;
  const visibility = progress(
    frame,
    milestone.startFrame - 8,
    milestone.startFrame + 10,
  );
  const impact = progress(
    frame,
    milestone.startFrame + 70,
    milestone.startFrame + 105,
    Easing.out(Easing.quad),
  );
  const impactOpacity =
    frame < milestone.startFrame + 70 ||
    frame > milestone.startFrame + 105
      ? 0
      : 1 - impact;
  const shineStart = 512 + stageIndex * 34;
  const shineCycle =
    frame < shineStart ? -0.2 : ((frame - shineStart) % 270) / 270;
  const shineX = mix(
    milestone.x - 90,
    milestone.x + BAR_WIDTH + 90,
    shineCycle,
  );
  const activeGlow = progress(
    frame,
    milestone.startFrame + 62,
    milestone.startFrame + 100,
  );
  const topFaceDrop = Math.min(15, bodyHeight);
  const frontTopY = topY + topFaceDrop;
  const frontHeight = Math.max(1, BASE_Y - frontTopY);
  const bottomRadius = Math.min(15, frontHeight / 2);
  const frontFacePath = [
    `M ${milestone.x} ${frontTopY}`,
    `L ${milestone.x + BAR_WIDTH} ${frontTopY}`,
    `L ${milestone.x + BAR_WIDTH} ${BASE_Y - bottomRadius}`,
    `Q ${milestone.x + BAR_WIDTH} ${BASE_Y} ${
      milestone.x + BAR_WIDTH - bottomRadius
    } ${BASE_Y}`,
    `L ${milestone.x + bottomRadius} ${BASE_Y}`,
    `Q ${milestone.x} ${BASE_Y} ${milestone.x} ${
      BASE_Y - bottomRadius
    }`,
    "Z",
  ].join(" ");

  return (
    <g>
      <defs>
        <linearGradient
          id={`pillar-front-${milestone.id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop
            offset="0.22"
            stopColor={milestone.light}
            stopOpacity="0.2"
          />
          <stop
            offset="0.65"
            stopColor={milestone.color}
            stopOpacity="0.22"
          />
          <stop
            offset="1"
            stopColor={milestone.dark}
            stopOpacity="0.38"
          />
        </linearGradient>
        <linearGradient
          id={`pillar-side-${milestone.id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor={milestone.color}
            stopOpacity="0.34"
          />
          <stop
            offset="1"
            stopColor={milestone.dark}
            stopOpacity="0.56"
          />
        </linearGradient>
        <linearGradient
          id={`pillar-top-${milestone.id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.82" />
          <stop
            offset="0.38"
            stopColor={milestone.light}
            stopOpacity="0.58"
          />
          <stop
            offset="1"
            stopColor={milestone.color}
            stopOpacity="0.28"
          />
        </linearGradient>
        <linearGradient
          id={`pillar-edge-${milestone.id}`}
          gradientUnits="userSpaceOnUse"
          x1={milestone.x}
          y1={finalTopY}
          x2={milestone.x + BAR_WIDTH}
          y2={BASE_Y}
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.82" />
          <stop
            offset="0.34"
            stopColor={milestone.light}
            stopOpacity="0.42"
          />
          <stop
            offset="1"
            stopColor={milestone.color}
            stopOpacity="0.2"
          />
        </linearGradient>
        <clipPath id={`pillar-clip-${milestone.id}`}>
          <path d={frontFacePath} />
        </clipPath>
        <filter
          id={`pillar-shadow-${milestone.id}`}
          x="-70%"
          y="-30%"
          width="250%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="21"
            stdDeviation="24"
            floodColor="#01040D"
            floodOpacity="0.62"
          />
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="18"
            floodColor={milestone.color}
            floodOpacity="0.18"
          />
        </filter>
        <filter
          id={`pillar-glow-${milestone.id}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <ellipse
        cx={milestone.x + BAR_WIDTH / 2 + BAR_DEPTH / 2}
        cy={BASE_Y + 26}
        rx={mix(34, 92, cleanRise)}
        ry={mix(7, 20, cleanRise)}
        fill={milestone.color}
        opacity={0.09 + activeGlow * 0.11}
        filter={`url(#pillar-glow-${milestone.id})`}
      />

      <ellipse
        cx={milestone.x + BAR_WIDTH / 2 + BAR_DEPTH / 2}
        cy={BASE_Y + 13}
        rx={mix(18, 82, impact)}
        ry={mix(4, 18, impact)}
        fill="none"
        stroke={milestone.light}
        strokeWidth={mix(4, 1, impact)}
        opacity={impactOpacity * 0.7}
      />

      <g
        opacity={visibility}
        filter={`url(#pillar-shadow-${milestone.id})`}
      >
        <path
          d={frontFacePath}
          fill={`url(#pillar-front-${milestone.id})`}
          stroke={`url(#pillar-edge-${milestone.id})`}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <polygon
          points={`${milestone.x + BAR_WIDTH},${frontTopY} ${
            milestone.x + BAR_WIDTH + BAR_DEPTH
          },${topY} ${milestone.x + BAR_WIDTH + BAR_DEPTH},${
            BASE_Y - 15
          } ${milestone.x + BAR_WIDTH},${BASE_Y}`}
          fill={`url(#pillar-side-${milestone.id})`}
          stroke={milestone.color}
          strokeOpacity="0.42"
          strokeWidth="1.5"
        />

        <polygon
          points={`${milestone.x},${frontTopY} ${
            milestone.x + BAR_DEPTH
          },${topY} ${milestone.x + BAR_WIDTH + BAR_DEPTH},${topY} ${
            milestone.x + BAR_WIDTH
          },${frontTopY}`}
          fill={`url(#pillar-top-${milestone.id})`}
          stroke="#FFFFFF"
          strokeOpacity="0.58"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <path
          d={`M ${milestone.x + 15} ${topY + 30} L ${
            milestone.x + 15
          } ${BASE_Y - 21}`}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.2"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {Array.from({length: 4}, (_, tick) => {
          const tickY = BASE_Y - 48 - tick * 44;
          if (tickY < topY + 48) {
            return null;
          }

          return (
            <line
              key={`${milestone.id}-tick-${tick}`}
              x1={milestone.x + 31}
              y1={tickY}
              x2={milestone.x + BAR_WIDTH - 20}
              y2={tickY}
              stroke={milestone.light}
              strokeOpacity="0.14"
              strokeWidth="1"
            />
          );
        })}

        {shineCycle >= 0 && (
          <g clipPath={`url(#pillar-clip-${milestone.id})`}>
            <line
              x1={shineX - 42}
              y1={BASE_Y + 20}
              x2={shineX + 42}
              y2={topY - 20}
              stroke="#FFFFFF"
              strokeOpacity="0.18"
              strokeWidth="28"
            />
            <line
              x1={shineX - 42}
              y1={BASE_Y + 20}
              x2={shineX + 42}
              y2={topY - 20}
              stroke={milestone.light}
              strokeOpacity="0.22"
              strokeWidth="5"
            />
          </g>
        )}

      </g>
    </g>
  );
};

const GrowthLine: React.FC<{readonly frame: number}> = ({frame}) => {
  const lineAmount = progress(
    frame,
    374,
    532,
    Easing.inOut(Easing.cubic),
  );
  const lineOpacity = progress(frame, 350, 390);
  const drawTracer = pointOnGrowthLine(lineAmount);
  const repeatingAmount =
    frame < 604 ? 0 : ((frame - 604) % 182) / 182;
  const repeatingTracer = pointOnGrowthLine(repeatingAmount);
  const repeatingOpacity = progress(frame, 604, 626);
  const endpointIn = progress(frame, 522, 566, Easing.out(Easing.back(1.2)));
  const pulseCycle = frame < 548 ? 0 : ((frame - 548) % 96) / 96;
  const pulseRadius = mix(16, 54, pulseCycle);
  const pulseOpacity = (1 - pulseCycle) * 0.42 * endpointIn;
  const last = GROWTH_POINTS[GROWTH_POINTS.length - 1];

  return (
    <g>
      <defs>
        <linearGradient
          id="growth-line"
          gradientUnits="userSpaceOnUse"
          x1={GROWTH_POINTS[0].x}
          y1={GROWTH_POINTS[0].y}
          x2={last.x}
          y2={last.y}
        >
          <stop offset="0" stopColor="#62F3DC" />
          <stop offset="0.28" stopColor="#5EB5FF" />
          <stop offset="0.53" stopColor="#9A7CFF" />
          <stop offset="0.76" stopColor="#F37BC7" />
          <stop offset="1" stopColor="#FFD178" />
        </linearGradient>
        <radialGradient id="line-tracer">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="0.28" stopColor="#DFFBFF" stopOpacity="0.94" />
          <stop offset="1" stopColor="#80DFFF" stopOpacity="0" />
        </radialGradient>
        <filter
          id="growth-glow"
          x="-30%"
          y="-100%"
          width="160%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter
          id="endpoint-glow"
          x="-200%"
          y="-200%"
          width="500%"
          height="500%"
        >
          <feGaussianBlur stdDeviation="11" />
        </filter>
      </defs>

      <polyline
        points={GROWTH_POINTS_STRING}
        pathLength="100"
        fill="none"
        stroke="url(#growth-line)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - lineAmount)}
        opacity={lineOpacity * 0.2}
        filter="url(#growth-glow)"
      />
      <polyline
        points={GROWTH_POINTS_STRING}
        pathLength="100"
        fill="none"
        stroke="url(#growth-line)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - lineAmount)}
        opacity={lineOpacity}
      />

      {GROWTH_POINTS.map((point, index) => {
        const nodeIn = progress(frame, 386 + index * 37, 414 + index * 37);
        const breathe =
          0.78 + Math.sin(frame * 0.045 + index * 0.9) * 0.22;

        return (
          <g key={`growth-node-${index}`} opacity={nodeIn}>
            <circle
              cx={point.x}
              cy={point.y}
              r="17"
              fill={MILESTONES[index].color}
              opacity={0.13 * breathe}
              filter="url(#growth-glow)"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="8.5"
              fill="#07172A"
              stroke={MILESTONES[index].light}
              strokeWidth="3"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="2.8"
              fill="#FFFFFF"
            />
          </g>
        );
      })}

      {frame <= 556 && (
        <g opacity={lineOpacity * (1 - progress(frame, 536, 556))}>
          <circle
            cx={drawTracer.x}
            cy={drawTracer.y}
            r="25"
            fill="url(#line-tracer)"
            opacity="0.72"
            filter="url(#growth-glow)"
          />
          <circle
            cx={drawTracer.x}
            cy={drawTracer.y}
            r="5.5"
            fill="#FFFFFF"
          />
        </g>
      )}

      {frame >= 604 && (
        <g opacity={repeatingOpacity}>
          <circle
            cx={repeatingTracer.x}
            cy={repeatingTracer.y}
            r="23"
            fill="url(#line-tracer)"
            opacity="0.52"
            filter="url(#growth-glow)"
          />
          <circle
            cx={repeatingTracer.x}
            cy={repeatingTracer.y}
            r="4.5"
            fill="#FFFFFF"
          />
        </g>
      )}

      <circle
        cx={last.x}
        cy={last.y}
        r={pulseRadius}
        fill="none"
        stroke="#FFD99A"
        strokeWidth={mix(3, 1, pulseCycle)}
        opacity={pulseOpacity}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={22 * endpointIn}
        fill="#FFD787"
        opacity={0.24 * endpointIn}
        filter="url(#endpoint-glow)"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={10 * endpointIn}
        fill="#FFF8EA"
        stroke="#FFD787"
        strokeWidth="3"
        opacity={endpointIn}
      />

    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const globalReveal = progress(frame, 0, 34, Easing.out(Easing.quad));
  const camera = progress(frame, 0, 899, Easing.inOut(Easing.cubic));
  const cameraScale = mix(0.985, 1.018, camera);
  const cameraX = mix(8, -9, camera);
  const cameraY = mix(10, -7, camera);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02050D",
        overflow: "hidden",
      }}
    >
      <Background frame={frame} />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          position: "absolute",
          inset: 0,
          opacity: globalReveal,
        }}
      >
        <g
          transform={`translate(${960 * (1 - cameraScale) + cameraX} ${
            540 * (1 - cameraScale) + cameraY
          }) scale(${cameraScale})`}
        >
          {MILESTONES.map((milestone, index) => (
            <MilestonePillar
              key={milestone.id}
              frame={frame}
              milestone={milestone}
              stageIndex={index}
            />
          ))}

          <GrowthLine frame={frame} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
