import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Product Innovation Engine
 * 1920x1080 • 60 FPS • 900 frames / 15 seconds
 *
 * Internet asset source:
 * Lucide Static v1.27.0 — ISC License
 * https://lucide.dev/icons/
 * https://lucide.dev/license
 *
 * Embedded official icon geometry:
 * ScanSearch, Target, PencilRuler, Blocks, Rocket,
 * ChartNoAxesCombined.
 */

const WIDTH = 1920;
const HEIGHT = 1080;
const CX = WIDTH / 2;
const CY = 528;
const INNER_RADIUS = 265;
const OUTER_RADIUS = 438;
const STAGE_SPAN = 32;
const STAGE_GAP = 8;
// Six 32° panels with 8° gaps span 232°. Starting at 154° centers the
// complete arc on the vertical 270° axis, so the outer left/right panels
// finish at exactly the same height.
const STAGE_START_ANGLE = 154;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const smoothOut = Easing.bezier(0.22, 1, 0.36, 1);
const softInOut = Easing.bezier(0.65, 0, 0.35, 1);

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (input: number) => number = smoothOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing,
  });

const polar = (radius: number, angleDegrees: number) => {
  const angle = (angleDegrees * Math.PI) / 180;
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  };
};

const annularSegmentPath = (
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
) => {
  const outerStart = polar(outerRadius, startAngle);
  const outerEnd = polar(outerRadius, endAngle);
  const innerEnd = polar(innerRadius, endAngle);
  const innerStart = polar(innerRadius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
};

type IconName =
  | "scan-search"
  | "target"
  | "pencil-ruler"
  | "blocks"
  | "rocket"
  | "chart";

type Stage = {
  label: string;
  icon: IconName;
  colorA: string;
  colorB: string;
  start: number;
};

const stages: Stage[] = [
  {
    label: "DISCOVER",
    icon: "scan-search",
    colorA: "#20D5E8",
    colorB: "#2D78D9",
    start: 342,
  },
  {
    label: "DEFINE",
    icon: "target",
    colorA: "#FF6B68",
    colorB: "#F13D70",
    start: 408,
  },
  {
    label: "DESIGN",
    icon: "pencil-ruler",
    colorA: "#62DCF5",
    colorB: "#268FC7",
    start: 474,
  },
  {
    label: "BUILD",
    icon: "blocks",
    colorA: "#FF7A5C",
    colorB: "#F04466",
    start: 540,
  },
  {
    label: "LAUNCH",
    icon: "rocket",
    colorA: "#45D9C8",
    colorB: "#1C9ED8",
    start: 606,
  },
  {
    label: "SCALE",
    icon: "chart",
    colorA: "#FF668A",
    colorB: "#EB2D62",
    start: 672,
  },
];

const Glyph: React.FC<{
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
      {name === "scan-search" ? (
        <>
          <path d="M3 7V5a2 2 0 0 1 2-2h2" {...common} />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" {...common} />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" {...common} />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" {...common} />
          <circle cx="12" cy="12" r="3" {...common} />
          <path d="m16 16-1.9-1.9" {...common} />
        </>
      ) : null}

      {name === "target" ? (
        <>
          <circle cx="12" cy="12" r="10" {...common} />
          <circle cx="12" cy="12" r="6" {...common} />
          <circle cx="12" cy="12" r="2" {...common} />
        </>
      ) : null}

      {name === "pencil-ruler" ? (
        <>
          <path
            d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13"
            {...common}
          />
          <path d="m8 6 2-2" {...common} />
          <path d="m18 16 2-2" {...common} />
          <path
            d="m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17"
            {...common}
          />
          <path
            d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
            {...common}
          />
          <path d="m15 5 4 4" {...common} />
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

const ConcentricWipe: React.FC<{frame: number}> = ({frame}) => {
  const rings = [
    {start: 0, end: 30, color: "#FFD85A", initial: 35},
    {start: 18, end: 49, color: "#F7F3EA", initial: 20},
    {start: 37, end: 70, color: "#38BEE5", initial: 16},
    {start: 58, end: 95, color: "#071F39", initial: 12},
  ];
  const opacity = interpolate(frame, [92, 104], [1, 0], clamp);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: "absolute", inset: 0, opacity}}
    >
      <defs>
        <filter id="wipe-soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="24" floodOpacity="0.16" />
        </filter>
      </defs>
      {rings.map((ring, index) => {
        const p = progress(frame, ring.start, ring.end, softInOut);
        const radius = interpolate(p, [0, 1], [ring.initial, 1320], clamp);
        const ringOpacity = frame < ring.start ? 0 : 1;
        return (
          <circle
            key={ring.color}
            cx={CX}
            cy={CY}
            r={radius}
            fill={ring.color}
            opacity={ringOpacity}
            filter={index < 3 ? "url(#wipe-soft-shadow)" : undefined}
          />
        );
      })}
    </svg>
  );
};

const RadialBurst: React.FC<{
  frame: number;
  start: number;
  end: number;
  inner: number;
  outer: number;
  count?: number;
}> = ({frame, start, end, inner, outer, count = 12}) => {
  const open = progress(frame, start, start + Math.round((end - start) * 0.46));
  const close = interpolate(
    frame,
    [end - Math.round((end - start) * 0.26), end],
    [1, 0],
    clamp,
  );
  const p = open * close;

  return (
    <g opacity={p}>
      {Array.from({length: count}).map((_, index) => {
        const angle = (index / count) * 360 - 90;
        const a = (angle * Math.PI) / 180;
        const stagger = progress(
          frame,
          start + index * 2,
          start + index * 2 + 18,
        );
        const lineInner = inner + (1 - stagger) * 26;
        const lineOuter = interpolate(stagger, [0, 1], [lineInner, outer], clamp);
        return (
          <line
            key={angle}
            x1={CX + Math.cos(a) * lineInner}
            y1={CY + Math.sin(a) * lineInner}
            x2={CX + Math.cos(a) * lineOuter}
            y2={CY + Math.sin(a) * lineOuter}
            stroke={index % 3 === 0 ? "#FFD85A" : "#DFF7FF"}
            strokeWidth={index % 2 === 0 ? 4 : 3}
            strokeLinecap="round"
            opacity={0.5 + (index % 3) * 0.16}
          />
        );
      })}
    </g>
  );
};

const BulbCore: React.FC<{frame: number}> = ({frame}) => {
  const enter = progress(frame, 186, 238);
  const translateY = interpolate(enter, [0, 1], [155, 0], clamp);
  const scale = interpolate(enter, [0, 0.72, 1], [0.84, 1.025, 1], clamp);
  const opacity = interpolate(enter, [0, 0.18, 1], [0, 1, 1], clamp);
  const breathe =
    frame > 730 ? 1 + Math.sin(((frame - 730) / 60) * Math.PI * 2) * 0.008 : 1;
  const glow = interpolate(
    frame,
    [186, 238, 730, 790, 840],
    [0, 0.42, 0.42, 0.7, 0.45],
    clamp,
  );

  return (
    <g
      transform={`translate(${CX} ${CY}) translate(0 ${translateY}) scale(${
        scale * breathe
      }) translate(${-CX} ${-CY})`}
      opacity={opacity}
    >
      <circle
        cx={CX}
        cy={CY + 5}
        r={215}
        fill="url(#core-halo)"
        opacity={glow}
        filter="url(#soft-glow)"
      />
      <path
        d={[
          `M ${CX} ${CY - 172}`,
          `C ${CX - 116} ${CY - 172}, ${CX - 178} ${CY - 89}, ${CX - 162} ${
            CY + 14
          }`,
          `C ${CX - 152} ${CY + 79}, ${CX - 104} ${CY + 106}, ${CX - 79} ${
            CY + 142
          }`,
          `C ${CX - 59} ${CY + 171}, ${CX - 58} ${CY + 190}, ${CX - 58} ${
            CY + 204
          }`,
          `L ${CX + 58} ${CY + 204}`,
          `C ${CX + 58} ${CY + 190}, ${CX + 59} ${CY + 171}, ${CX + 79} ${
            CY + 142
          }`,
          `C ${CX + 104} ${CY + 106}, ${CX + 152} ${CY + 79}, ${CX + 162} ${
            CY + 14
          }`,
          `C ${CX + 178} ${CY - 89}, ${CX + 116} ${CY - 172}, ${CX} ${
            CY - 172
          } Z`,
        ].join(" ")}
        fill="url(#bulb-gradient)"
        filter="url(#bulb-shadow)"
      />
      <path
        d={`M ${CX - 81} ${CY - 72} C ${CX - 40} ${CY - 124}, ${
          CX + 31
        } ${CY - 130}, ${CX + 73} ${CY - 83}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={22}
        strokeLinecap="round"
        opacity={0.72}
      />
      <path
        d={`M ${CX - 26} ${CY + 115} L ${CX - 11} ${CY + 188} M ${
          CX + 26
        } ${CY + 115} L ${CX + 11} ${CY + 188}`}
        fill="none"
        stroke="#F0B636"
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.72}
      />
      <rect
        x={CX - 72}
        y={CY + 192}
        width={144}
        height={26}
        rx={8}
        fill="#F8FCFF"
      />
      <rect
        x={CX - 82}
        y={CY + 221}
        width={164}
        height={26}
        rx={8}
        fill="#D8EEFA"
      />
      <rect
        x={CX - 48}
        y={CY + 250}
        width={96}
        height={23}
        rx={8}
        fill="#FFFFFF"
      />
      <rect
        x={CX - 22}
        y={CY + 273}
        width={44}
        height={14}
        rx={7}
        fill="#79BBD6"
      />
    </g>
  );
};

const RadialStage: React.FC<{
  frame: number;
  stage: Stage;
  index: number;
}> = ({frame, stage, index}) => {
  const buildStart = 246 + index * 10;
  const build = progress(frame, buildStart, buildStart + 34);
  const stageScale = interpolate(build, [0, 0.72, 1], [0.55, 1.035, 1], clamp);
  const stageRotation = interpolate(build, [0, 1], [-7, 0], clamp);
  const active = progress(frame, stage.start, stage.start + 46);
  const loaderOpacity = interpolate(active, [0, 0.15, 0.62, 0.82], [0, 1, 1, 0], clamp);
  const iconOpacity = interpolate(active, [0.58, 0.82, 1], [0, 1, 1], clamp);
  const iconScale = interpolate(active, [0.55, 0.82, 1], [0.58, 1.1, 1], clamp);
  const labelOpacity = interpolate(active, [0.72, 1], [0, 1], clamp);
  const labelY = interpolate(active, [0.72, 1], [12, 0], clamp);
  const sweep = progress(frame, 738 + index * 6, 780 + index * 6);
  const startAngle = STAGE_START_ANGLE + index * (STAGE_SPAN + STAGE_GAP);
  const endAngle = startAngle + STAGE_SPAN;
  const midAngle = (startAngle + endAngle) / 2;
  const stagePoint = polar((INNER_RADIUS + OUTER_RADIUS) / 2, midAngle);
  const stagePath = annularSegmentPath(
    startAngle,
    endAngle,
    INNER_RADIUS,
    OUTER_RADIUS,
  );
  const loaderRotation = (frame - stage.start) * 5.4;
  const isLongLabel = stage.label.length >= 8;
  const labelFontSize = isLongLabel ? 18.5 : stage.label.length >= 6 ? 20.5 : 22;
  const labelLetterSpacing = isLongLabel ? 1.35 : 2.05;

  return (
    <g
      opacity={build}
      transform={[
        `translate(${stagePoint.x} ${stagePoint.y})`,
        `rotate(${stageRotation})`,
        `scale(${stageScale})`,
        `translate(${-stagePoint.x} ${-stagePoint.y})`,
      ].join(" ")}
    >
      <defs>
        <clipPath
          id={`stage-safe-area-${index}`}
          clipPathUnits="userSpaceOnUse"
        >
          <path d={stagePath} />
        </clipPath>
      </defs>
      <path
        d={stagePath}
        fill={`url(#stage-gradient-${index})`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={6}
        strokeLinejoin="round"
        filter="url(#stage-shadow)"
      />
      <path
        d={stagePath}
        fill="url(#stage-sheen)"
        opacity={0.12 + sweep * 0.22}
      />

      <circle
        cx={stagePoint.x}
        cy={stagePoint.y - 17}
        r={49}
        fill="rgba(4, 24, 45, 0.22)"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={2}
        opacity={iconOpacity}
        transform={`translate(${stagePoint.x} ${stagePoint.y - 17}) scale(${iconScale}) translate(${
          -stagePoint.x
        } ${-(stagePoint.y - 17)})`}
      />

      <g
        opacity={loaderOpacity}
        transform={`rotate(${loaderRotation} ${stagePoint.x} ${stagePoint.y - 17})`}
      >
        <circle
          cx={stagePoint.x}
          cy={stagePoint.y - 17}
          r={52}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="4 11"
        />
        <circle
          cx={stagePoint.x}
          cy={stagePoint.y - 69}
          r={7}
          fill="#FFFFFF"
          filter="url(#tiny-glow)"
        />
      </g>

      <g
        transform={`translate(${stagePoint.x} ${stagePoint.y - 17}) scale(${iconScale}) translate(${
          -stagePoint.x
        } ${-(stagePoint.y - 17)})`}
      >
        <Glyph
          name={stage.icon}
          x={stagePoint.x - 30}
          y={stagePoint.y - 47}
          size={60}
          opacity={iconOpacity}
        />
      </g>

      <text
        x={stagePoint.x}
        y={stagePoint.y + 64 + labelY}
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={labelFontSize}
        fontWeight={800}
        letterSpacing={labelLetterSpacing}
        opacity={labelOpacity}
        clipPath={`url(#stage-safe-area-${index})`}
        style={{textShadow: "0 3px 12px rgba(4,18,38,0.35)"}}
      >
        {stage.label}
      </text>
    </g>
  );
};

const LightTracer: React.FC<{frame: number}> = ({frame}) => {
  const p = progress(frame, 738, 816, softInOut);
  const opacity = interpolate(frame, [738, 756, 798, 816], [0, 1, 1, 0], clamp);
  const angle = interpolate(p, [0, 1], [132, 502], clamp);
  const point = polar(482, angle);

  return (
    <g opacity={opacity}>
      {[0, 1, 2, 3].map((trail) => {
        const trailAngle = angle - trail * 5;
        const trailPoint = polar(482, trailAngle);
        return (
          <circle
            key={trail}
            cx={trail === 0 ? point.x : trailPoint.x}
            cy={trail === 0 ? point.y : trailPoint.y}
            r={trail === 0 ? 12 : 9 - trail * 1.3}
            fill={trail % 2 === 0 ? "#FFF4A8" : "#84F2FF"}
            opacity={1 - trail * 0.2}
            filter="url(#tracer-glow)"
          />
        );
      })}
    </g>
  );
};

const Background: React.FC<{frame: number}> = ({frame}) => {
  const atmosphere = progress(frame, 85, 170);
  const drift = frame * 0.12;
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 48%, #0D4365 0%, #082B49 34%, #061D34 69%, #041529 100%)",
      }}
    >
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <radialGradient id="ambient-orb">
            <stop offset="0%" stopColor="#33D6E9" stopOpacity="0.22" />
            <stop offset="58%" stopColor="#1D86C7" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#071F39" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx={CX}
          cy={CY}
          r={620}
          fill="url(#ambient-orb)"
          opacity={atmosphere}
        />
        {[525, 590, 665].map((radius, index) => (
          <circle
            key={radius}
            cx={CX}
            cy={CY}
            r={radius}
            fill="none"
            stroke="#72D9EE"
            strokeWidth={1.5}
            strokeDasharray={index === 1 ? "3 18" : "2 28"}
            opacity={0.05 * atmosphere}
            transform={`rotate(${drift * (index % 2 === 0 ? 1 : -1)} ${CX} ${CY})`}
          />
        ))}
        {Array.from({length: 34}).map((_, index) => {
          const seed = index * 91.73;
          const x = 80 + ((Math.sin(seed) + 1) / 2) * (WIDTH - 160);
          const y = 60 + ((Math.sin(seed * 1.67 + 2.1) + 1) / 2) * (HEIGHT - 120);
          const r = 1.2 + (index % 3) * 0.55;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={r}
              fill="#B8EEFA"
              opacity={(0.08 + (index % 5) * 0.015) * atmosphere}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const renderScaleX = width / WIDTH;
  const renderScaleY = height / HEIGHT;
  const camera = interpolate(frame, [170, 816], [0.965, 1.025], {
    ...clamp,
    easing: softInOut,
  });
  const cameraY = interpolate(frame, [170, 816], [22, 0], {
    ...clamp,
    easing: softInOut,
  });

  return (
    <AbsoluteFill style={{backgroundColor: "#061D34", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          width: WIDTH,
          height: HEIGHT,
          left: 0,
          top: 0,
          transformOrigin: "top left",
          transform: `scale(${renderScaleX}, ${renderScaleY})`,
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
            <linearGradient id="bulb-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="46%" stopColor="#FFD84D" />
              <stop offset="100%" stopColor="#F1AA2D" />
            </linearGradient>
            <radialGradient id="core-halo">
              <stop offset="0%" stopColor="#FFE888" stopOpacity="0.82" />
              <stop offset="54%" stopColor="#FFD64F" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFD64F" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="stage-sheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
              <stop offset="36%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.18" />
            </linearGradient>
            {stages.map((stage, index) => (
              <linearGradient
                key={stage.label}
                id={`stage-gradient-${index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={stage.colorA} />
                <stop offset="100%" stopColor={stage.colorB} />
              </linearGradient>
            ))}
            <filter id="soft-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="28" />
            </filter>
            <filter id="bulb-shadow" x="-50%" y="-40%" width="200%" height="210%">
              <feDropShadow
                dx="0"
                dy="24"
                stdDeviation="26"
                floodColor="#02111F"
                floodOpacity="0.5"
              />
            </filter>
            <filter id="stage-shadow" x="-40%" y="-40%" width="180%" height="200%">
              <feDropShadow
                dx="0"
                dy="18"
                stdDeviation="16"
                floodColor="#010C18"
                floodOpacity="0.42"
              />
            </filter>
            <filter id="tiny-glow" x="-180%" y="-180%" width="460%" height="460%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="tracer-glow" x="-260%" y="-260%" width="620%" height="620%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            transform={`translate(${CX} ${CY}) translate(0 ${cameraY}) scale(${camera}) translate(${-CX} ${-CY})`}
          >
            <RadialBurst
              frame={frame}
              start={96}
              end={180}
              inner={70}
              outer={215}
              count={10}
            />
            {stages.map((stage, index) => (
              <RadialStage
                key={stage.label}
                frame={frame}
                stage={stage}
                index={index}
              />
            ))}
            <BulbCore frame={frame} />
            <LightTracer frame={frame} />
            <RadialBurst
              frame={frame}
              start={748}
              end={842}
              inner={482}
              outer={540}
              count={12}
            />
          </g>
        </svg>

        <ConcentricWipe frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
