import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Innovation Growth Spiral
 * 1920x1080 • 60 FPS • 900 frames / 15 seconds
 *
 * Internet assets embedded as local SVG geometry:
 * Lucide Static v1.27.0 — ISC License
 * https://lucide.dev/icons/
 * https://lucide.dev/license
 *
 * Icons:
 * Telescope, Lightbulb, BadgeCheck, Blocks, Rocket,
 * ChartNoAxesCombined.
 */

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const CENTER_X = 960;
const CENTER_Y = 568;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (input: number) => number = easeOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing,
  });

type Point = {x: number; y: number};

const spiralPoint = (t: number): Point => {
  const angle = ((145 + t * 310) * Math.PI) / 180;
  const radius = 690 - t * 560;
  return {
    x: CENTER_X + Math.cos(angle) * radius,
    y: CENTER_Y + Math.sin(angle) * radius,
  };
};

const SPIRAL_SAMPLES = Array.from({length: 241}, (_, index) =>
  spiralPoint(index / 240),
);

const SPIRAL_PATH = SPIRAL_SAMPLES.map(
  (point, index) =>
    `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
).join(" ");

const SPIRAL_LENGTH = SPIRAL_SAMPLES.slice(1).reduce((length, point, index) => {
  const previous = SPIRAL_SAMPLES[index];
  return length + Math.hypot(point.x - previous.x, point.y - previous.y);
}, 0);

type IconName =
  | "telescope"
  | "lightbulb"
  | "badge-check"
  | "blocks"
  | "rocket"
  | "chart";

type Stage = {
  icon: IconName;
  t: number;
  start: number;
  colorA: string;
  colorB: string;
};

// Stage positions are sampled at nearly equal arc-length intervals. The radius
// still contracts toward the core, but the cards keep proportional visual gaps
// instead of clustering on the final turn of the spiral.
// The entrance intervals shrink from 114 to 54 frames: the visual rhythm
// accelerates on the way toward the core, then settles after activation.
const STAGES: Stage[] = [
  {
    icon: "telescope",
    t: 0.045,
    start: 160,
    colorA: "#35D8F3",
    colorB: "#247DF2",
  },
  {
    icon: "lightbulb",
    t: 0.15,
    start: 274,
    colorA: "#9B8CFF",
    colorB: "#6658E9",
  },
  {
    icon: "badge-check",
    t: 0.266,
    start: 367,
    colorA: "#FF75B1",
    colorB: "#E64482",
  },
  {
    icon: "blocks",
    t: 0.3973,
    start: 443,
    colorA: "#FFB84B",
    colorB: "#F27B32",
  },
  {
    icon: "rocket",
    t: 0.5521,
    start: 507,
    colorA: "#32DFB8",
    colorB: "#0DA999",
  },
  {
    icon: "chart",
    t: 0.75,
    start: 561,
    colorA: "#BCE968",
    colorB: "#5FBA51",
  },
];

const InternetIcon: React.FC<{
  name: IconName;
  x: number;
  y: number;
  size: number;
  opacity?: number;
}> = ({name, x, y, size, opacity = 1}) => {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.15,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      color="#FFFFFF"
      opacity={opacity}
      overflow="visible"
      aria-hidden="true"
    >
      {name === "telescope" ? (
        <>
          <path
            d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"
            {...common}
          />
          <path d="m13.56 11.747 4.332-.924" {...common} />
          <path d="m16 21-3.105-6.21" {...common} />
          <path
            d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"
            {...common}
          />
          <path d="m6.158 8.633 1.114 4.456" {...common} />
          <path d="m8 21 3.105-6.21" {...common} />
          <circle cx="12" cy="13" r="2" {...common} />
        </>
      ) : null}

      {name === "lightbulb" ? (
        <>
          <path
            d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
            {...common}
          />
          <path d="M9 18h6" {...common} />
          <path d="M10 22h4" {...common} />
        </>
      ) : null}

      {name === "badge-check" ? (
        <>
          <path
            d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
            {...common}
          />
          <path d="m9 12 2 2 4-4" {...common} />
        </>
      ) : null}

      {name === "blocks" ? (
        <>
          <path
            d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"
            {...common}
          />
          <rect x="14" y="2" width="8" height="8" rx="1" {...common} />
        </>
      ) : null}

      {name === "rocket" ? (
        <>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" {...common} />
          <path
            d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"
            {...common}
          />
          <path
            d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"
            {...common}
          />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05" {...common} />
        </>
      ) : null}

      {name === "chart" ? (
        <>
          <path d="M12 16v5" {...common} />
          <path d="M16 14.639V21" {...common} />
          <path d="M20 10.656V21" {...common} />
          <path
            d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"
            {...common}
          />
          <path d="M4 18.463V21" {...common} />
          <path d="M8 14.656V21" {...common} />
        </>
      ) : null}
    </svg>
  );
};

const Background: React.FC<{frame: number}> = ({frame}) => {
  const reveal = progress(frame, 0, 72, easeInOut);
  const drift = frame * 0.055;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 53%, #103C5E 0%, #092844 38%, #061A31 72%, #041225 100%)",
        opacity: reveal,
      }}
    >
      <svg
        width={DESIGN_WIDTH}
        height={DESIGN_HEIGHT}
        viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <radialGradient id="background-halo">
            <stop offset="0%" stopColor="#3FD7EC" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#2394CE" stopOpacity="0.045" />
            <stop offset="100%" stopColor="#08243D" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="micro-grid"
            width="58"
            height="58"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.4" fill="#AEEAF5" opacity="0.18" />
          </pattern>
        </defs>

        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={690}
          fill="url(#background-halo)"
        />
        <rect
          x="40"
          y="40"
          width={DESIGN_WIDTH - 80}
          height={DESIGN_HEIGHT - 80}
          fill="url(#micro-grid)"
          opacity={0.28}
        />

        {[470, 565, 660].map((radius, index) => (
          <circle
            key={radius}
            cx={CENTER_X}
            cy={CENTER_Y}
            r={radius}
            fill="none"
            stroke="#8ADDEB"
            strokeWidth={1.4}
            strokeDasharray={index === 1 ? "2 24" : "3 34"}
            opacity={0.045 + index * 0.012}
            transform={`rotate(${
              drift * (index % 2 === 0 ? 1 : -1)
            } ${CENTER_X} ${CENTER_Y})`}
          />
        ))}

        {Array.from({length: 38}).map((_, index) => {
          const seed = index * 87.13;
          const x =
            70 + ((Math.sin(seed * 0.91 + 1.7) + 1) / 2) * (DESIGN_WIDTH - 140);
          const y =
            50 +
            ((Math.sin(seed * 1.37 + 0.4) + 1) / 2) * (DESIGN_HEIGHT - 100);
          const twinkle =
            0.42 + Math.sin(frame * 0.025 + index * 0.77) * 0.18;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={1.1 + (index % 3) * 0.45}
              fill={index % 5 === 0 ? "#FFE98E" : "#BCEFF7"}
              opacity={(0.12 + (index % 4) * 0.025) * twinkle}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const GrowthPanel: React.FC<{
  frame: number;
  fps: number;
  stage: Stage;
  index: number;
  systemActive: number;
}> = ({frame, fps, stage, index, systemActive}) => {
  const point = spiralPoint(stage.t);
  const angle = ((145 + stage.t * 310) * Math.PI) / 180;
  const entrance = spring({
    frame: Math.max(0, frame - stage.start),
    fps,
    durationInFrames: 58,
    config: {
      damping: 15,
      mass: 0.78,
      stiffness: 112,
    },
  });
  const opacity = progress(frame, stage.start, stage.start + 18);
  const iconIn = progress(frame, stage.start + 18, stage.start + 50);
  const barsIn = progress(frame, stage.start + 34, stage.start + 70);
  const activationPulse =
    progress(frame, stage.start + 38, stage.start + 58, easeInOut) *
    interpolate(frame, [stage.start + 70, stage.start + 104], [1, 0], clamp);
  const settleBreath =
    frame >= 810
      ? 1 + Math.sin((frame - 810) * 0.035 + index * 0.7) * 0.0025
      : 1;
  const scale =
    interpolate(entrance, [0, 0.72, 1], [0.54, 1.035, 1], clamp) *
    (1 + activationPulse * 0.028) *
    settleBreath;
  const slide = interpolate(entrance, [0, 1], [42, 0], clamp);
  const x = point.x + Math.cos(angle) * slide;
  const y = point.y + Math.sin(angle) * slide;
  const cardWidth = 224;
  const cardHeight = 116;
  const cardX = -cardWidth / 2;
  const cardY = -cardHeight / 2;
  const ringCircumference = 2 * Math.PI * 37;
  const borderGlow = 0.22 + systemActive * 0.42 + activationPulse * 0.3;

  return (
    <g
      opacity={opacity}
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <circle
        cx="0"
        cy="0"
        r={84 + activationPulse * 16}
        fill={`url(#panel-halo-${index})`}
        opacity={0.32 + activationPulse * 0.45 + systemActive * 0.12}
        filter="url(#panel-soft-glow)"
      />

      <rect
        x={cardX}
        y={cardY}
        width={cardWidth}
        height={cardHeight}
        rx={28}
        fill="rgba(8, 31, 53, 0.92)"
        stroke={`url(#panel-gradient-${index})`}
        strokeWidth={2.4}
        opacity={0.98}
        filter="url(#panel-shadow)"
      />
      <rect
        x={cardX + 1}
        y={cardY + 1}
        width={10}
        height={cardHeight - 2}
        rx={7}
        fill={`url(#panel-gradient-${index})`}
      />
      <path
        d={`M ${cardX + 28} ${cardY + 1.5} H ${cardX + cardWidth - 28}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.22 + systemActive * 0.16}
      />

      <circle
        cx="-49"
        cy="0"
        r={42}
        fill={`url(#panel-gradient-${index})`}
        opacity={0.2 + iconIn * 0.8}
      />
      <circle
        cx="-49"
        cy="0"
        r={37}
        fill="rgba(7, 29, 50, 0.72)"
        stroke="#FFFFFF"
        strokeWidth={2.2}
        strokeDasharray={`${ringCircumference}`}
        strokeDashoffset={ringCircumference * (1 - iconIn)}
        strokeLinecap="round"
        opacity={0.92}
        transform="rotate(-90 -49 0)"
      />
      <g
        transform={`translate(-49 0) scale(${interpolate(
          iconIn,
          [0, 0.72, 1],
          [0.55, 1.1, 1],
          clamp,
        )}) translate(49 0)`}
      >
        <InternetIcon
          name={stage.icon}
          x={-75}
          y={-26}
          size={52}
          opacity={iconIn}
        />
      </g>

      {[0, 1, 2].map((bar) => {
        const barProgress = progress(
          frame,
          stage.start + 36 + bar * 7,
          stage.start + 66 + bar * 7,
        );
        const widths = [74, 57, 43];
        return (
          <rect
            key={bar}
            x="17"
            y={-25 + bar * 25}
            width={widths[bar] * barProgress}
            height={9}
            rx={4.5}
            fill={
              bar === 0
                ? `url(#panel-gradient-${index})`
                : "rgba(217, 244, 250, 0.72)"
            }
            opacity={(0.5 + barProgress * 0.5) * barsIn}
          />
        );
      })}

      {[0, 1, 2].map((dot) => (
        <circle
          key={dot}
          cx={57 + dot * 14}
          cy="-41"
          r={3.5}
          fill={dot <= index % 3 ? stage.colorA : "#86AFC1"}
          opacity={0.38 + iconIn * 0.62}
        />
      ))}

      <rect
        x={cardX}
        y={cardY}
        width={cardWidth}
        height={cardHeight}
        rx={28}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1}
        opacity={borderGlow}
      />
    </g>
  );
};

const BulbCore: React.FC<{
  frame: number;
  fps: number;
  systemActive: number;
}> = ({frame, fps, systemActive}) => {
  const entrance = spring({
    frame: Math.max(0, frame - 96),
    fps,
    durationInFrames: 74,
    config: {
      damping: 16,
      mass: 0.9,
      stiffness: 92,
    },
  });
  const opacity = progress(frame, 92, 126);
  const scale = interpolate(entrance, [0, 0.74, 1], [0.7, 1.035, 1], clamp);
  const finalPulse =
    progress(frame, 738, 782, easeInOut) *
    interpolate(frame, [804, 852], [1, 0], clamp);
  const breathe =
    frame >= 810 ? 1 + Math.sin((frame - 810) * 0.032) * 0.004 : 1;
  const glowOpacity = 0.22 + systemActive * 0.64 + finalPulse * 0.22;
  const rayReveal = progress(frame, 748, 820, easeInOut);

  return (
    <g
      opacity={opacity}
      transform={`translate(${CENTER_X} ${CENTER_Y}) scale(${
        scale * breathe
      }) translate(${-CENTER_X} ${-CENTER_Y})`}
    >
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={196 + finalPulse * 28}
        fill="url(#bulb-halo)"
        opacity={glowOpacity}
        filter="url(#bulb-glow)"
      />
      <circle
        cx={CENTER_X}
        cy={CENTER_Y - 6}
        r={128}
        fill="rgba(8, 31, 53, 0.9)"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={2}
        filter="url(#bulb-shadow)"
      />

      {Array.from({length: 12}).map((_, index) => {
        const angle = ((index * 30 - 90) * Math.PI) / 180;
        const stagger = progress(frame, 748 + index * 3, 790 + index * 3);
        const inner = 144;
        const outer = 164 + stagger * 22;
        return (
          <line
            key={index}
            x1={CENTER_X + Math.cos(angle) * inner}
            y1={CENTER_Y - 6 + Math.sin(angle) * inner}
            x2={CENTER_X + Math.cos(angle) * outer}
            y2={CENTER_Y - 6 + Math.sin(angle) * outer}
            stroke={index % 3 === 0 ? "#FFF09A" : "#C9F5FA"}
            strokeWidth={index % 2 === 0 ? 4 : 3}
            strokeLinecap="round"
            opacity={rayReveal * (0.5 + (index % 3) * 0.18)}
          />
        );
      })}

      <path
        d={[
          `M ${CENTER_X} ${CENTER_Y - 103}`,
          `C ${CENTER_X - 73} ${CENTER_Y - 103}, ${CENTER_X - 111} ${
            CENTER_Y - 48
          }, ${CENTER_X - 101} ${CENTER_Y + 14}`,
          `C ${CENTER_X - 94} ${CENTER_Y + 54}, ${CENTER_X - 65} ${
            CENTER_Y + 70
          }, ${CENTER_X - 48} ${CENTER_Y + 94}`,
          `C ${CENTER_X - 36} ${CENTER_Y + 111}, ${CENTER_X - 35} ${
            CENTER_Y + 121
          }, ${CENTER_X - 35} ${CENTER_Y + 130}`,
          `L ${CENTER_X + 35} ${CENTER_Y + 130}`,
          `C ${CENTER_X + 35} ${CENTER_Y + 121}, ${CENTER_X + 36} ${
            CENTER_Y + 111
          }, ${CENTER_X + 48} ${CENTER_Y + 94}`,
          `C ${CENTER_X + 65} ${CENTER_Y + 70}, ${CENTER_X + 94} ${
            CENTER_Y + 54
          }, ${CENTER_X + 101} ${CENTER_Y + 14}`,
          `C ${CENTER_X + 111} ${CENTER_Y - 48}, ${CENTER_X + 73} ${
            CENTER_Y - 103
          }, ${CENTER_X} ${CENTER_Y - 103} Z`,
        ].join(" ")}
        fill="url(#bulb-body)"
        stroke="#FFF4A4"
        strokeWidth={2}
      />
      <path
        d={`M ${CENTER_X - 49} ${CENTER_Y - 42} C ${CENTER_X - 20} ${
          CENTER_Y - 76
        }, ${CENTER_X + 24} ${CENTER_Y - 78}, ${CENTER_X + 50} ${
          CENTER_Y - 45
        }`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={13}
        strokeLinecap="round"
        opacity={0.68}
      />
      <path
        d={`M ${CENTER_X - 18} ${CENTER_Y + 77} L ${CENTER_X - 8} ${
          CENTER_Y + 126
        } M ${CENTER_X + 18} ${CENTER_Y + 77} L ${CENTER_X + 8} ${
          CENTER_Y + 126
        }`}
        fill="none"
        stroke="#E59A22"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.72}
      />
      <rect
        x={CENTER_X - 47}
        y={CENTER_Y + 126}
        width={94}
        height={17}
        rx={6}
        fill="#F2FAFD"
      />
      <rect
        x={CENTER_X - 54}
        y={CENTER_Y + 147}
        width={108}
        height={17}
        rx={6}
        fill="#CFEAF4"
      />
      <rect
        x={CENTER_X - 31}
        y={CENTER_Y + 168}
        width={62}
        height={15}
        rx={7}
        fill="#F8FCFE"
      />
      <circle
        cx={CENTER_X}
        cy={CENTER_Y - 4}
        r={17 + finalPulse * 8}
        fill="#FFF7B6"
        opacity={0.2 + systemActive * 0.55}
        filter="url(#tiny-glow)"
      />
    </g>
  );
};

const SpiralTracer: React.FC<{frame: number}> = ({frame}) => {
  const tracer = progress(frame, 632, 782, easeInOut);
  const opacity = interpolate(
    frame,
    [626, 648, 760, 800],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <g opacity={opacity}>
      {Array.from({length: 7}).map((_, index) => {
        const t = Math.max(0, tracer - index * 0.014);
        const point = spiralPoint(t);
        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index === 0 ? 10 : 8 - index * 0.65}
            fill={index % 2 === 0 ? "#FFF199" : "#7CEAF5"}
            opacity={1 - index * 0.12}
            filter="url(#tracer-glow)"
          />
        );
      })}
    </g>
  );
};

const FinalActivation: React.FC<{frame: number}> = ({frame}) => {
  const ring = progress(frame, 738, 848, easeInOut);
  const opacity = interpolate(
    frame,
    [738, 766, 822, 866],
    [0, 0.7, 0.5, 0],
    clamp,
  );

  return (
    <g opacity={opacity}>
      {[0, 1, 2].map((index) => {
        const local = Math.max(0, Math.min(1, ring - index * 0.14));
        return (
          <circle
            key={index}
            cx={CENTER_X}
            cy={CENTER_Y}
            r={180 + local * (110 + index * 42)}
            fill="none"
            stroke={index === 1 ? "#87EAF4" : "#FFE989"}
            strokeWidth={3 - index * 0.55}
            opacity={1 - local}
          />
        );
      })}
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const renderScaleX = width / DESIGN_WIDTH;
  const renderScaleY = height / DESIGN_HEIGHT;
  const systemActive = progress(frame, 720, 822, easeInOut);
  const pathReveal = interpolate(
    frame,
    [70, 130, 244, 337, 413, 477, 531, 642],
    [0, ...STAGES.map((stage) => stage.t), 1],
    {
      ...clamp,
      easing: easeInOut,
    },
  );
  const cameraScale = interpolate(
    frame,
    [0, 120, 620, 810, 899],
    [0.975, 0.985, 1.022, 1.01, 1.01],
    {
      ...clamp,
      easing: easeInOut,
    },
  );
  const cameraY = interpolate(frame, [0, 620, 810], [18, -4, 0], {
    ...clamp,
    easing: easeInOut,
  });

  return (
    <AbsoluteFill style={{backgroundColor: "#041225", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          left: 0,
          top: 0,
          transformOrigin: "top left",
          transform: `scale(${renderScaleX}, ${renderScaleY})`,
          overflow: "hidden",
        }}
      >
        <Background frame={frame} />

        <svg
          width={DESIGN_WIDTH}
          height={DESIGN_HEIGHT}
          viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
          style={{position: "absolute", inset: 0}}
        >
          <defs>
            <linearGradient
              id="spiral-gradient"
              x1="250"
              y1="900"
              x2="1140"
              y2="520"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#35D8F3" />
              <stop offset="32%" stopColor="#8F82FF" />
              <stop offset="57%" stopColor="#FF6AA8" />
              <stop offset="78%" stopColor="#38DDB6" />
              <stop offset="100%" stopColor="#FFE77A" />
            </linearGradient>
            <linearGradient id="bulb-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF58E" />
              <stop offset="48%" stopColor="#FFD94D" />
              <stop offset="100%" stopColor="#F0A92D" />
            </linearGradient>
            <radialGradient id="bulb-halo">
              <stop offset="0%" stopColor="#FFF1A1" stopOpacity="0.9" />
              <stop offset="48%" stopColor="#FFD84F" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FFD84F" stopOpacity="0" />
            </radialGradient>

            {STAGES.map((stage, index) => (
              <React.Fragment key={stage.icon}>
                <linearGradient
                  id={`panel-gradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={stage.colorA} />
                  <stop offset="100%" stopColor={stage.colorB} />
                </linearGradient>
                <radialGradient id={`panel-halo-${index}`}>
                  <stop offset="0%" stopColor={stage.colorA} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={stage.colorB} stopOpacity="0" />
                </radialGradient>
              </React.Fragment>
            ))}

            <filter
              id="spiral-glow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="panel-shadow"
              x="-45%"
              y="-55%"
              width="190%"
              height="230%"
            >
              <feDropShadow
                dx="0"
                dy="18"
                stdDeviation="18"
                floodColor="#010A16"
                floodOpacity="0.58"
              />
            </filter>
            <filter
              id="panel-soft-glow"
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur stdDeviation="18" />
            </filter>
            <filter
              id="bulb-glow"
              x="-90%"
              y="-90%"
              width="280%"
              height="280%"
            >
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <filter
              id="bulb-shadow"
              x="-70%"
              y="-60%"
              width="240%"
              height="250%"
            >
              <feDropShadow
                dx="0"
                dy="22"
                stdDeviation="22"
                floodColor="#010A16"
                floodOpacity="0.6"
              />
            </filter>
            <filter
              id="tracer-glow"
              x="-300%"
              y="-300%"
              width="700%"
              height="700%"
            >
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="tiny-glow"
              x="-260%"
              y="-260%"
              width="620%"
              height="620%"
            >
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            transform={`translate(${CENTER_X} ${CENTER_Y}) translate(0 ${cameraY}) scale(${cameraScale}) translate(${-CENTER_X} ${-CENTER_Y})`}
          >
            <path
              d={SPIRAL_PATH}
              fill="none"
              stroke="#8BE6F1"
              strokeWidth={3}
              strokeDasharray="3 19"
              strokeDashoffset={-frame * 0.42}
              strokeLinecap="round"
              opacity={0.14 * progress(frame, 45, 110)}
            />
            <path
              d={SPIRAL_PATH}
              fill="none"
              stroke="#6AE0F0"
              strokeWidth={18}
              strokeLinecap="round"
              opacity={0.055 * pathReveal}
              filter="url(#spiral-glow)"
            />
            <path
              d={SPIRAL_PATH}
              fill="none"
              stroke="url(#spiral-gradient)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={`${SPIRAL_LENGTH} ${SPIRAL_LENGTH}`}
              strokeDashoffset={SPIRAL_LENGTH * (1 - pathReveal)}
              filter="url(#spiral-glow)"
            />

            <SpiralTracer frame={frame} />

            <FinalActivation frame={frame} />
            <BulbCore
              frame={frame}
              fps={fps}
              systemActive={systemActive}
            />

            {STAGES.map((stage, index) => (
              <GrowthPanel
                key={stage.icon}
                frame={frame}
                fps={fps}
                stage={stage}
                index={index}
                systemActive={systemActive}
              />
            ))}
          </g>
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow:
              "inset 0 0 170px rgba(0, 7, 18, 0.72), inset 0 -100px 140px rgba(0, 8, 20, 0.28)",
            pointerEvents: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
