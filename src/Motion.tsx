import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/*
 * Icon geometry: Lucide Static v1.27.0 (ISC License).
 * https://lucide.dev/icons/lightbulb
 * https://lucide.dev/icons/crosshair
 * https://lucide.dev/icons/clipboard-check
 * https://lucide.dev/icons/gem
 * https://lucide.dev/icons/chart-no-axes-combined
 */

const WIDTH = 1920;
const HEIGHT = 1080;
const MASTER_FRAMES = 900;
const CARD_WIDTH = 430;

type IconName =
  | "lightbulb"
  | "crosshair"
  | "clipboard-check"
  | "gem"
  | "chart";

type Stage = {
  number: string;
  topText: string;
  bodyText: string;
  icon: IconName;
  x: number;
  y: number;
  start: number;
};

type Point = {
  x: number;
  y: number;
};

type ConnectorData = {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  start: number;
  length: number;
};

/*
 * BUYER-EDITABLE TEXT
 *
 * - number:   short number or label on the left side of the yellow tab.
 * - topText:  optional title beside the number (recommended: 1–16 characters).
 * - bodyText: optional copy beside the icon (recommended: up to 65 characters).
 *
 * Leave topText/bodyText empty to preserve clean copy space for stock buyers.
 */
const stages: Stage[] = [
  {
    number: "01",
    topText: "",
    bodyText: "",
    icon: "lightbulb",
    x: 135,
    y: 90,
    start: 35,
  },
  {
    number: "02",
    topText: "",
    bodyText: "",
    icon: "crosshair",
    x: 455,
    y: 590,
    start: 175,
  },
  {
    number: "03",
    topText: "",
    bodyText: "",
    icon: "clipboard-check",
    x: 745,
    y: 90,
    start: 315,
  },
  {
    number: "04",
    topText: "",
    bodyText: "",
    icon: "gem",
    x: 1065,
    y: 590,
    start: 455,
  },
  {
    number: "05",
    topText: "",
    bodyText: "",
    icon: "chart",
    x: 1355,
    y: 90,
    start: 595,
  },
];

const connectors: ConnectorData[] = [
  {
    p0: {x: 350, y: 443},
    p1: {x: 324, y: 536},
    p2: {x: 386, y: 619},
    p3: {x: 438, y: 690},
    start: 126,
    length: 305,
  },
  {
    p0: {x: 902, y: 785},
    p1: {x: 1014, y: 690},
    p2: {x: 880, y: 526},
    p3: {x: 745, y: 448},
    start: 266,
    length: 480,
  },
  {
    p0: {x: 960, y: 443},
    p1: {x: 934, y: 536},
    p2: {x: 996, y: 619},
    p3: {x: 1048, y: 690},
    start: 406,
    length: 305,
  },
  {
    p0: {x: 1512, y: 785},
    p1: {x: 1624, y: 690},
    p2: {x: 1490, y: 526},
    p3: {x: 1355, y: 448},
    start: 546,
    length: 480,
  },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const easeOut = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const wrapText = (
  value: string,
  maxCharactersPerLine: number,
  maxLines: number,
) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  for (const word of words) {
    const current = lines[lines.length - 1];

    if (!current) {
      lines.push(word);
      continue;
    }

    if (`${current} ${word}`.length <= maxCharactersPerLine) {
      lines[lines.length - 1] = `${current} ${word}`;
      continue;
    }

    if (lines.length < maxLines) {
      lines.push(word);
    } else {
      const lastLine = lines[maxLines - 1];
      lines[maxLines - 1] =
        lastLine.length >= maxCharactersPerLine - 1
          ? `${lastLine.slice(0, maxCharactersPerLine - 2)}…`
          : `${lastLine}…`;
      break;
    }
  }

  return lines.slice(0, maxLines);
};

const cubicPoint = (
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point => {
  const oneMinusT = 1 - t;
  return {
    x:
      oneMinusT ** 3 * p0.x +
      3 * oneMinusT ** 2 * t * p1.x +
      3 * oneMinusT * t ** 2 * p2.x +
      t ** 3 * p3.x,
    y:
      oneMinusT ** 3 * p0.y +
      3 * oneMinusT ** 2 * t * p1.y +
      3 * oneMinusT * t ** 2 * p2.y +
      t ** 3 * p3.y,
  };
};

const LucideIcon: React.FC<{
  name: IconName;
  x: number;
  y: number;
  size: number;
  reveal: number;
  id: string;
}> = ({name, x, y, size, reveal, id}) => {
  const scale = size / 24;
  const strokeProps = {
    fill: "none",
    stroke: "#202429",
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const accentIn = easeOut(reveal, 0.08, 0.54);

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <clipPath id={`icon-reveal-${id}`} clipPathUnits="userSpaceOnUse">
          <rect x={-2} y={-2} width={28 * clamp(reveal)} height={28} />
        </clipPath>
      </defs>

      <g
        opacity={accentIn}
        transform={`translate(12 12) scale(${0.72 + accentIn * 0.28}) translate(-12 -12)`}
      >
        {name === "lightbulb" ? (
          <circle cx={12} cy={9.2} r={4.7} fill="#FFD62F" />
        ) : null}
        {name === "crosshair" ? (
          <>
            <circle cx={12} cy={12} r={5.1} fill="#FFD62F" />
            <circle cx={12} cy={12} r={1.7} fill="#FFFFFF" opacity={0.9} />
          </>
        ) : null}
        {name === "clipboard-check" ? (
          <circle cx={15.7} cy={15} r={4.7} fill="#FFD62F" />
        ) : null}
        {name === "gem" ? (
          <path d="M8 9h8l-4 12Z" fill="#FFD62F" />
        ) : null}
        {name === "chart" ? (
          <>
            <rect x={15.1} y={12.4} width={3.2} height={8.6} rx={1.2} fill="#FFD62F" />
            <circle cx={20} cy={6} r={2.6} fill="#FFD62F" />
          </>
        ) : null}
      </g>

      <g clipPath={`url(#icon-reveal-${id})`}>
        {name === "lightbulb" ? (
          <>
            <path
              {...strokeProps}
              d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
            />
            <path {...strokeProps} d="M9 18h6" />
            <path {...strokeProps} d="M10 22h4" />
          </>
        ) : null}

        {name === "crosshair" ? (
          <>
            <circle {...strokeProps} cx={12} cy={12} r={10} />
            <line {...strokeProps} x1={22} x2={18} y1={12} y2={12} />
            <line {...strokeProps} x1={6} x2={2} y1={12} y2={12} />
            <line {...strokeProps} x1={12} x2={12} y1={6} y2={2} />
            <line {...strokeProps} x1={12} x2={12} y1={22} y2={18} />
          </>
        ) : null}

        {name === "clipboard-check" ? (
          <>
            <rect {...strokeProps} width={8} height={4} x={8} y={2} rx={1} ry={1} />
            <path
              {...strokeProps}
              d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            />
            <path {...strokeProps} d="m9 14 2 2 4-4" />
          </>
        ) : null}

        {name === "gem" ? (
          <>
            <path {...strokeProps} d="M10.5 3 8 9l4 13 4-13-2.5-6" />
            <path
              {...strokeProps}
              d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z"
            />
            <path {...strokeProps} d="M2 9h20" />
          </>
        ) : null}

        {name === "chart" ? (
          <>
            <path {...strokeProps} d="M12 16v5" />
            <path {...strokeProps} d="M16 14.639V21" />
            <path {...strokeProps} d="M20 10.656V21" />
            <path
              {...strokeProps}
              d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"
            />
            <path {...strokeProps} d="M4 18.463V21" />
            <path {...strokeProps} d="M8 14.656V21" />
          </>
        ) : null}
      </g>
    </g>
  );
};

const Connector: React.FC<{
  data: ConnectorData;
  index: number;
  frame: number;
}> = ({data, index, frame}) => {
  const progress = ease(frame, data.start, data.start + 72);
  const path = `M${data.p0.x} ${data.p0.y} C${data.p1.x} ${data.p1.y} ${data.p2.x} ${data.p2.y} ${data.p3.x} ${data.p3.y}`;
  const tangentAngle =
    (Math.atan2(data.p3.y - data.p2.y, data.p3.x - data.p2.x) * 180) /
    Math.PI;
  const arrowIn = easeOut(progress, 0.78, 1);
  const movingT = ease(frame, data.start + 6, data.start + 70);
  const movingPoint = cubicPoint(
    data.p0,
    data.p1,
    data.p2,
    data.p3,
    movingT,
  );
  const dotOpacity =
    easeOut(frame, data.start + 5, data.start + 16) *
    (1 - ease(frame, data.start + 60, data.start + 76));
  const middle = cubicPoint(data.p0, data.p1, data.p2, data.p3, 0.52);

  return (
    <g>
      <defs>
        <mask
          id={`connector-mask-${index}`}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
        >
          <rect width={WIDTH} height={HEIGHT} fill="#000000" />
          <path
            d={path}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0.01, data.length * progress)} ${data.length}`}
          />
        </mask>
      </defs>

      <path
        d={path}
        fill="none"
        stroke="#60656A"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="9 12"
        strokeDashoffset={-frame * 0.28}
        mask={`url(#connector-mask-${index})`}
        opacity={0.82}
      />

      <circle
        cx={middle.x}
        cy={middle.y}
        r={24}
        fill="none"
        stroke="#60656A"
        strokeWidth={2.4}
        strokeDasharray="7 10"
        strokeDashoffset={frame * 0.22}
        opacity={progress * 0.42}
        transform={`rotate(${index % 2 === 0 ? -18 : 18} ${middle.x} ${middle.y})`}
      />

      <g
        transform={`translate(${data.p3.x} ${data.p3.y}) rotate(${tangentAngle}) scale(${arrowIn})`}
        opacity={arrowIn}
      >
        <path
          d="M-17 -9L0 0L-17 9"
          fill="none"
          stroke="#565B60"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g opacity={dotOpacity}>
        <circle
          cx={movingPoint.x}
          cy={movingPoint.y}
          r={16}
          fill="#FFD62F"
          opacity={0.13}
        />
        <circle
          cx={movingPoint.x}
          cy={movingPoint.y}
          r={5.5}
          fill="#F7C915"
        />
        <circle
          cx={movingPoint.x - 1.7}
          cy={movingPoint.y - 1.7}
          r={1.8}
          fill="#FFFFFF"
        />
      </g>
    </g>
  );
};

const StageCard: React.FC<{
  stage: Stage;
  index: number;
  frame: number;
}> = ({stage, index, frame}) => {
  const local = frame - stage.start;
  const entrance = clamp(
    spring({
      frame: local,
      fps: 60,
      config: {damping: 17, stiffness: 112, mass: 0.82},
      durationInFrames: 74,
    }),
  );
  const opacity = easeOut(local, 0, 24);
  const numberIn = spring({
    frame: local - 15,
    fps: 60,
    config: {damping: 13, stiffness: 145, mass: 0.65},
    durationInFrames: 52,
  });
  const iconReveal = ease(local, 38, 104);
  const haloIn = easeOut(local, 30, 68);
  const copyIn = easeOut(local, 48, 92);
  const finalPulseStart = 716 + index * 21;
  const finalPulse =
    easeOut(frame, finalPulseStart, finalPulseStart + 14) *
    (1 - ease(frame, finalPulseStart + 34, finalPulseStart + 66));
  const shimmerProgress = ease(frame, 684 + index * 12, 770 + index * 12);
  const shimmerOpacity =
    easeOut(frame, 678 + index * 12, 696 + index * 12) *
    (1 - ease(frame, 766 + index * 12, 792 + index * 12));
  const floatAmount =
    entrance * Math.sin((frame + index * 19) / 41) * (frame > 680 ? 1.8 : 0.7);
  const y = stage.y + (1 - entrance) * 72 + floatAmount;
  const scale = 0.9 + entrance * 0.1 + finalPulse * 0.012;
  const iconScale = 1 + finalPulse * 0.065;
  const tabShineX = interpolate(shimmerProgress, [0, 1], [-110, 520]);
  const numberTextSize = Math.max(
    20,
    Math.min(45, 105 / Math.max(1, stage.number.length)),
  );
  const topTextSize = Math.max(
    18,
    Math.min(34, 360 / Math.max(1, stage.topText.length)),
  );
  const bodyLines = wrapText(stage.bodyText, 21, 5);
  const bodyFontSize =
    stage.bodyText.length <= 35 ? 21 : stage.bodyText.length <= 55 ? 18.5 : 17;
  const bodyLineHeight = bodyFontSize * 1.27;
  const bodyStartY =
    214 - ((bodyLines.length - 1) * bodyLineHeight) / 2;

  return (
    <g
      transform={`translate(${stage.x + CARD_WIDTH / 2} ${y + 168}) scale(${scale}) translate(${-CARD_WIDTH / 2} -168)`}
      opacity={opacity}
    >
      <rect
        x={0}
        y={86}
        width={430}
        height={250}
        rx={42}
        fill="url(#card-surface)"
        stroke="#E4E5E5"
        strokeWidth={2}
        filter="url(#card-shadow)"
      />
      <path
        d="M38 99H392Q406 99 413 113"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.92}
      />

      <g filter="url(#tab-shadow)">
        <path
          d="M58 0H372Q410 0 410 38V88H260L215 122L170 88H20V38Q20 0 58 0Z"
          fill="url(#yellow-tab)"
        />
        <path
          d="M58 8H372Q398 8 401 31H29Q32 8 58 8Z"
          fill="#FFF39A"
          opacity={0.6}
        />
      </g>

      <g
        transform={`translate(93 49) scale(${Math.max(0, numberIn)}) translate(-93 -49)`}
        opacity={easeOut(local, 12, 34)}
        clipPath={`url(#number-text-safe-${index})`}
      >
        <text
          x={93}
          y={52}
          fill="#111315"
          fontFamily="DejaVu Sans"
          fontSize={numberTextSize}
          fontWeight={900}
          letterSpacing={-1.5}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {stage.number}
        </text>
      </g>

      <g
        clipPath={`url(#top-text-safe-${index})`}
        opacity={copyIn}
        transform={`translate(${(1 - copyIn) * 12} 0)`}
      >
        <text
          x={153}
          y={52}
          fill="#111315"
          fontFamily="DejaVu Sans"
          fontSize={topTextSize}
          fontWeight={700}
          letterSpacing={-0.55}
          dominantBaseline="middle"
        >
          {stage.topText}
        </text>
      </g>

      <g
        transform={`translate(112 214) scale(${iconScale}) translate(-112 -214)`}
      >
        <circle
          cx={112}
          cy={214}
          r={64 + finalPulse * 6}
          fill="#FFF9D6"
          opacity={0.34 * haloIn + finalPulse * 0.08}
        />
        <circle
          cx={112}
          cy={214}
          r={55}
          fill="#FFFFFF"
          stroke="#F1D54A"
          strokeWidth={3}
          opacity={haloIn}
          filter="url(#icon-shadow)"
        />
        <circle
          cx={112}
          cy={214}
          r={45}
          fill="url(#icon-wash)"
          opacity={0.88 * haloIn}
        />

        {Array.from({length: 8}, (_, rayIndex) => {
          const angle = (rayIndex / 8) * Math.PI * 2;
          const inner = 68;
          const outer = 74 + (rayIndex % 2) * 3;
          return (
            <line
              key={`ray-${rayIndex}`}
              x1={112 + Math.cos(angle) * inner}
              y1={214 + Math.sin(angle) * inner}
              x2={112 + Math.cos(angle) * outer}
              y2={214 + Math.sin(angle) * outer}
              stroke="#D1B51B"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={haloIn * 0.54}
            />
          );
        })}

        <LucideIcon
          name={stage.icon}
          x={72}
          y={174}
          size={80}
          reveal={iconReveal}
          id={`stage-${index}`}
        />
      </g>

      <g
        clipPath={`url(#body-text-safe-${index})`}
        opacity={copyIn}
        transform={`translate(${(1 - copyIn) * 14} 0)`}
      >
        <text
          x={194}
          y={bodyStartY}
          fill="#53585D"
          fontFamily="DejaVu Sans"
          fontSize={bodyFontSize}
          fontWeight={500}
          letterSpacing={0.05}
          dominantBaseline="middle"
        >
          {bodyLines.map((line, lineIndex) => (
            <tspan
              key={`${stage.number}-body-line-${lineIndex}`}
              x={194}
              dy={lineIndex === 0 ? 0 : bodyLineHeight}
            >
              {line}
            </tspan>
          ))}
        </text>
      </g>

      <g opacity={shimmerOpacity}>
        <rect
          x={tabShineX}
          y={-18}
          width={74}
          height={386}
          fill="url(#card-shimmer)"
          transform={`rotate(12 ${tabShineX + 37} 175)`}
          clipPath="url(#card-shimmer-clip)"
        />
      </g>
    </g>
  );
};

const FinalFlow: React.FC<{frame: number}> = ({frame}) => {
  const progress = ease(frame, 782, 855);
  const opacity =
    easeOut(frame, 774, 790) * (1 - ease(frame, 848, 875));
  const x = interpolate(progress, [0, 1], [80, 1840]);

  return (
    <g opacity={opacity}>
      <ellipse
        cx={x}
        cy={535}
        rx={82}
        ry={560}
        fill="url(#global-shimmer)"
        transform={`rotate(10 ${x} 535)`}
      />
    </g>
  );
};

export const Motion: React.FC = () => {
  const rawFrame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const frame =
    (rawFrame / Math.max(1, durationInFrames - 1)) * (MASTER_FRAMES - 1);
  const cameraProgress = easeOut(frame, 0, 850);
  const cameraScale = interpolate(cameraProgress, [0, 1], [0.992, 1.012]);
  const backgroundGlow = 0.78 + Math.sin(frame / 63) * 0.04;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F8F8F7",
        overflow: "hidden",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${cameraScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <defs>
          <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.52" stopColor="#FAFAF8" />
            <stop offset="1" stopColor="#F2F2F0" />
          </linearGradient>
          <radialGradient id="background-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFF6B6" stopOpacity={0.3} />
            <stop offset="1" stopColor="#FFF6B6" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="yellow-tab" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE66A" />
            <stop offset="0.42" stopColor="#FFD83D" />
            <stop offset="1" stopColor="#F7C91B" />
          </linearGradient>
          <linearGradient id="card-surface" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.64" stopColor="#FEFEFE" />
            <stop offset="1" stopColor="#F4F4F2" />
          </linearGradient>
          <radialGradient id="icon-wash" cx="40%" cy="32%" r="70%">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.72" stopColor="#FFFCE9" />
            <stop offset="1" stopColor="#FFF4A9" />
          </radialGradient>
          <linearGradient id="card-shimmer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.72} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="global-shimmer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFD62F" stopOpacity={0} />
            <stop offset="0.5" stopColor="#FFD62F" stopOpacity={0.13} />
            <stop offset="1" stopColor="#FFD62F" stopOpacity={0} />
          </linearGradient>
          <clipPath id="card-shimmer-clip">
            <path d="M58 0H372Q410 0 410 38V88H260L215 122L170 88H20V38Q20 0 58 0ZM0 86H430V336H0Z" />
          </clipPath>
          {stages.map((stage, index) => (
            <React.Fragment key={`text-safe-${stage.number}`}>
              <clipPath id={`number-text-safe-${index}`}>
                <rect x={38} y={13} width={110} height={74} rx={7} />
              </clipPath>
              <clipPath id={`top-text-safe-${index}`}>
                <rect x={148} y={15} width={230} height={72} rx={7} />
              </clipPath>
              <clipPath id={`body-text-safe-${index}`}>
                <rect x={188} y={126} width={208} height={176} rx={8} />
              </clipPath>
            </React.Fragment>
          ))}
          <filter id="card-shadow" x="-30%" y="-25%" width="170%" height="180%">
            <feDropShadow
              dx={0}
              dy={16}
              stdDeviation={15}
              floodColor="#222831"
              floodOpacity={0.13}
            />
            <feDropShadow
              dx={0}
              dy={3}
              stdDeviation={3}
              floodColor="#222831"
              floodOpacity={0.08}
            />
          </filter>
          <filter id="tab-shadow" x="-20%" y="-30%" width="150%" height="180%">
            <feDropShadow
              dx={0}
              dy={7}
              stdDeviation={7}
              floodColor="#A58100"
              floodOpacity={0.2}
            />
          </filter>
          <filter id="icon-shadow" x="-35%" y="-35%" width="180%" height="180%">
            <feDropShadow
              dx={0}
              dy={7}
              stdDeviation={7}
              floodColor="#8B7714"
              floodOpacity={0.16}
            />
          </filter>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill="url(#background)" />
        <ellipse
          cx={960}
          cy={535}
          rx={880}
          ry={560}
          fill="url(#background-glow)"
          opacity={backgroundGlow}
        />

        <g opacity={0.13}>
          {Array.from({length: 31}, (_, index) => (
            <circle
              key={`background-dot-${index}`}
              cx={70 + ((index * 263) % 1780)}
              cy={60 + ((index * 179) % 960)}
              r={1.8 + (index % 3) * 0.7}
              fill="#B1A23D"
            />
          ))}
        </g>

        {connectors.map((connector, index) => (
          <Connector
            key={`connector-${index}`}
            data={connector}
            index={index}
            frame={frame}
          />
        ))}

        {stages.map((stage, index) => (
          <StageCard
            key={stage.number}
            stage={stage}
            index={index}
            frame={frame}
          />
        ))}

        <FinalFlow frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
