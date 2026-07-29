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
 * Icons: Phosphor Icons Core v2.1.1 — Duotone
 * Asset page: https://phosphoricons.com/
 * Source package: https://github.com/phosphor-icons/core
 * License: MIT — https://github.com/phosphor-icons/core/blob/main/LICENSE
 *
 * The official SVG paths are embedded locally for deterministic Remotion
 * renders. Color, light, and secondary motion are art-directed here.
 */

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const CARD_WIDTH = 324;
const CARD_HEIGHT = 346;
const CARD_TOP = 367;

type IconName = "search" | "lightbulb" | "cog" | "target";

type Stage = {
  number: string;
  label: string;
  icon: IconName;
  x: number;
  enter: number;
  exit: number;
  color: string;
  bright: string;
  dark: string;
  glow: string;
};

const stages: Stage[] = [
  {
    number: "01",
    label: "RESEARCH",
    icon: "search",
    x: 190,
    enter: 48,
    exit: 850,
    color: "#065381",
    bright: "#0585BF",
    dark: "#023A60",
    glow: "rgba(6,83,129,0.25)",
  },
  {
    number: "02",
    label: "IDEA",
    icon: "lightbulb",
    x: 596,
    enter: 120,
    exit: 800,
    color: "#0383C0",
    bright: "#09A8E8",
    dark: "#045C91",
    glow: "rgba(3,131,192,0.25)",
  },
  {
    number: "03",
    label: "STRATEGY",
    icon: "cog",
    x: 1008,
    enter: 192,
    exit: 750,
    color: "#07A5EE",
    bright: "#16C5FF",
    dark: "#087AB7",
    glow: "rgba(7,165,238,0.25)",
  },
  {
    number: "04",
    label: "GOAL",
    icon: "target",
    x: 1420,
    enter: 264,
    exit: 700,
    color: "#00CDE8",
    bright: "#18E6F5",
    dark: "#0099B5",
    glow: "rgba(0,205,232,0.26)",
  },
];

const inSpring = (frame: number, fps: number, start: number) =>
  Math.max(
    0,
    Math.min(
      1.08,
      spring({
        frame: frame - start,
        fps,
        durationInFrames: 62,
        config: {
          damping: 16,
          stiffness: 118,
          mass: 0.82,
        },
      }),
    ),
  );

const enterProgress = (frame: number, fps: number, start: number) =>
  Math.min(1, inSpring(frame, fps, start));

const exitProgress = (frame: number, start: number) =>
  interpolate(frame, [start, start + 49], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });

const linearProgress = (
  frame: number,
  start: number,
  duration: number,
  easing = easeOut,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing,
  });

type InternetIconProps = {
  name: IconName;
  stage: Stage;
  frame: number;
  strength: number;
};

const PhosphorDuotoneIcon: React.FC<InternetIconProps> = ({
  name,
  stage,
  frame,
  strength,
}) => {
  const id = `phosphor-gradient-${stage.number}`;
  const glowId = `phosphor-glow-${stage.number}`;
  const activeFrame = Math.max(0, frame - stage.enter - 42);
  const breathe = Math.sin(activeFrame / 20) * strength;
  const iconScale = 1 + breathe * 0.022;
  const iconTransform = `translate(128 128) scale(${iconScale}) translate(-128 -128)`;

  const definitions = (
    <defs>
      <linearGradient
        id={id}
        x1="28"
        y1="24"
        x2="230"
        y2="236"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor={stage.dark} />
        <stop offset="0.52" stopColor={stage.color} />
        <stop offset="1" stopColor={stage.bright} />
      </linearGradient>
      <radialGradient id={glowId} cx="50%" cy="43%" r="58%">
        <stop offset="0" stopColor={stage.bright} stopOpacity="0.34" />
        <stop offset="0.62" stopColor={stage.color} stopOpacity="0.12" />
        <stop offset="1" stopColor={stage.color} stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  const iconShadow = {
    filter: `drop-shadow(0 11px 11px ${stage.glow})`,
  };

  if (name === "search") {
    const scan = (activeFrame % 104) / 104;
    const scanOpacity = Math.sin(scan * Math.PI) * strength;
    const scanX = 45 + scan * 134;
    return (
      <svg viewBox="0 0 256 256" width="100%" height="100%" aria-hidden>
        {definitions}
        <defs>
          <clipPath id={`lens-${stage.number}`}>
            <circle cx="112" cy="112" r="72" />
          </clipPath>
        </defs>
        <g
          transform={iconTransform}
          style={iconShadow}
        >
          <path
            d="M192,112a80,80,0,1,1-80-80A80,80,0,0,1,192,112Z"
            fill={stage.bright}
            opacity="0.2"
          />
          <path
            d="M229.66,218.34,179.6,168.28a88.21,88.21,0,1,0-11.32,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
            fill={`url(#${id})`}
          />
        </g>
        <g clipPath={`url(#lens-${stage.number})`}>
          <rect
            x={scanX - 10}
            y="38"
            width="20"
            height="148"
            rx="10"
            fill={`url(#${glowId})`}
            opacity={scanOpacity * 0.52}
          />
          <line
            x1={scanX}
            y1="42"
            x2={scanX}
            y2="181"
            stroke={stage.bright}
            strokeWidth="4"
            strokeLinecap="round"
            opacity={scanOpacity * 0.82}
          />
        </g>
        <circle
          cx={73 + scan * 72}
          cy={78 + Math.sin(scan * Math.PI) * 11}
          r="6"
          fill={stage.bright}
          opacity={scanOpacity * 0.92}
        />
      </svg>
    );
  }

  if (name === "lightbulb") {
    const rayPulse = (0.5 + Math.sin(activeFrame / 12) * 0.5) * strength;
    return (
      <svg viewBox="0 0 256 256" width="100%" height="100%" aria-hidden>
        {definitions}
        <circle
          cx="128"
          cy="104"
          r={91 + rayPulse * 4}
          fill={`url(#${glowId})`}
          opacity={0.55 + rayPulse * 0.32}
        />
        {[
          [128, 2, 128, 20],
          [43, 30, 57, 45],
          [213, 30, 199, 45],
          [14, 106, 34, 106],
          [242, 106, 222, 106],
        ].map(([x1, y1, x2, y2], index) => (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stage.bright}
            strokeWidth="8"
            strokeLinecap="round"
            opacity={0.3 + rayPulse * 0.66}
          />
        ))}
        <g transform={iconTransform} style={iconShadow}>
          <path
            d="M208,104a79.86,79.86,0,0,1-30.59,62.92A24.29,24.29,0,0,0,168,186v6a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8v-6a24.11,24.11,0,0,0-9.3-19A79.87,79.87,0,0,1,48,104.45C47.76,61.09,82.72,25,126.07,24A80,80,0,0,1,208,104Z"
            fill={stage.bright}
            opacity="0.22"
          />
          <path
            d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.5C39.74,56.83,78.26,17.15,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.64,71.64,0,0,0,27.64,56.3h0A32,32,0,0,1,96,186v6h24V147.31L90.34,117.66a8,8,0,0,1,11.32-11.32L128,132.69l26.34-26.35a8,8,0,0,1,11.32,11.32L136,147.31V192h24v-6a32.12,32.12,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Z"
            fill={`url(#${id})`}
          />
        </g>
      </svg>
    );
  }

  if (name === "cog") {
    const rotation = activeFrame * 0.34;
    return (
      <svg viewBox="0 0 256 256" width="100%" height="100%" aria-hidden>
        {definitions}
        <circle
          cx="128"
          cy="128"
          r="111"
          fill={`url(#${glowId})`}
          opacity={0.52 + strength * 0.3}
        />
        <g
          transform={`rotate(${rotation} 128 128)`}
          style={iconShadow}
        >
          <path
            d="M230.1,108.76,198.25,90.62c-.64-1.16-1.31-2.29-2-3.41l-.12-36A104.61,104.61,0,0,0,162,32L130,49.89c-1.34,0-2.69,0-4,0L94,32A104.58,104.58,0,0,0,59.89,51.25l-.16,36c-.7,1.12-1.37,2.26-2,3.41l-31.84,18.1a99.15,99.15,0,0,0,0,38.46l31.85,18.14c.64,1.16,1.31,2.29,2,3.41l.12,36A104.61,104.61,0,0,0,94,224l32-17.87c1.34,0,2.69,0,4,0L162,224a104.58,104.58,0,0,0,34.08-19.25l.16-36c.7-1.12,1.37-2.26,2-3.41l31.84-18.1A99.15,99.15,0,0,0,230.1,108.76ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"
            fill={stage.bright}
            opacity="0.2"
          />
          <path
            d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm109.94-52.79a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A111.92,111.92,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.63a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21Zm-15,34.91-28.57,16.25a8,8,0,0,0-3,3c-.58,1-1.19,2.06-1.81,3.06a7.94,7.94,0,0,0-1.22,4.21l-.15,32.25a95.89,95.89,0,0,1-25.37,14.3L134,199.13a8,8,0,0,0-3.91-1h-.19c-1.21,0-2.43,0-3.64,0a8.1,8.1,0,0,0-4.1,1l-28.84,16.1A96,96,0,0,1,67.88,201l-.11-32.2a8,8,0,0,0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09,8.09,0,0,0-3-3.06l-28.6-16.29a90.49,90.49,0,0,1,0-28.26L61.67,97.63a8,8,0,0,0,3-3c.58-1,1.19-2.06,1.81-3.06a7.94,7.94,0,0,0,1.22-4.21l.15-32.25a95.89,95.89,0,0,1,25.37-14.3L122,56.87a8,8,0,0,0,4.1,1c1.21,0,2.43,0,3.64,0a8,8,0,0,0,4.1-1l28.84-16.1A96,96,0,0,1,188.12,55l.11,32.2a8,8,0,0,0,1.22,4.22c.62,1,1.23,2,1.8,3.06a8.09,8.09,0,0,0,3,3.06l28.6,16.29A90.49,90.49,0,0,1,222.9,142.12Z"
            fill={`url(#${id})`}
          />
        </g>
        <circle
          cx="128"
          cy="128"
          r={15 + (breathe + 1) * 2}
          fill={stage.bright}
          opacity={0.5 + strength * 0.38}
        />
      </svg>
    );
  }

  const lockCycle = (activeFrame % 118) / 118;
  const lockPulse = Math.sin(lockCycle * Math.PI) * strength;
  return (
    <svg viewBox="0 0 256 256" width="100%" height="100%" aria-hidden>
      {definitions}
      <circle
        cx="128"
        cy="128"
        r={110 + lockPulse * 8}
        fill={`url(#${glowId})`}
        opacity={0.56 + lockPulse * 0.3}
      />
      <g
        transform={`translate(128 128) scale(${1 + lockPulse * 0.032}) translate(-128 -128)`}
        style={iconShadow}
      >
        <path
          d="M176,128a48,48,0,1,1-48-48A48,48,0,0,1,176,128Z"
          fill={stage.bright}
          opacity="0.22"
        />
        <path
          d="M221.87,83.16A104.1,104.1,0,1,1,195.67,49l22.67-22.68a8,8,0,0,1,11.32,11.32l-96,96a8,8,0,0,1-11.32-11.32l27.72-27.72a40,40,0,1,0,17.87,31.09,8,8,0,1,1,16-.9,56,56,0,1,1-22.38-41.65L184.3,60.39a87.88,87.88,0,1,0,23.13,29.67,8,8,0,0,1,14.44-6.9Z"
          fill={`url(#${id})`}
        />
      </g>
      {[
        [128, 1, 128, 23],
        [255, 128, 233, 128],
        [128, 255, 128, 233],
        [1, 128, 23, 128],
      ].map(([x1, y1, x2, y2], index) => (
        <line
          key={index}
          x1={x1}
          y1={y1}
          x2={x2}
            y2={y2}
            stroke={stage.bright}
            strokeWidth="7"
            strokeLinecap="round"
            opacity={lockPulse * 0.9}
        />
      ))}
      <circle
        cx="128"
        cy="128"
        r={7 + lockPulse * 2}
        fill={stage.bright}
        opacity={0.62 + strength * 0.35}
      />
    </svg>
  );
};

type StageCardProps = {
  stage: Stage;
  index: number;
  frame: number;
  fps: number;
};

const StageCard: React.FC<StageCardProps> = ({
  stage,
  index,
  frame,
  fps,
}) => {
  const cardIn = enterProgress(frame, fps, stage.enter);
  const overshoot = inSpring(frame, fps, stage.enter);
  const out = exitProgress(frame, stage.exit);
  const visibility = cardIn * (1 - out);

  const tabIn = enterProgress(frame, fps, stage.enter + 12);
  const bracketIn = linearProgress(frame, stage.enter + 18, 72);
  const iconIn = enterProgress(frame, fps, stage.enter + 34);
  const labelIn = linearProgress(frame, stage.enter + 52, 42);

  const motionStrength =
    interpolate(
      frame,
      [stage.enter + 62, stage.enter + 118],
      [0, 1],
      clamp,
    ) *
    interpolate(frame, [stage.exit - 95, stage.exit - 26], [1, 0], clamp);

  const floating =
    Math.sin((frame - stage.enter) / 33 + index * 0.72) *
    2.6 *
    motionStrength;
  const translateY = (1 - cardIn) * 74 - out * 38 + floating;
  const rotate =
    (1 - cardIn) * (index % 2 === 0 ? -2.4 : 2.4) +
    out * (index % 2 === 0 ? 1.3 : -1.3);
  const scale = 0.9 + Math.min(overshoot, 1.08) * 0.1 - out * 0.035;
  const dashOffset = 1 - bracketIn;

  return (
    <div
      style={{
        position: "absolute",
        left: stage.x,
        top: CARD_TOP,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        opacity: visibility,
        transform: `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: "50% 55%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "12px -12px -14px 12px",
          borderRadius: 25,
          background:
            "linear-gradient(145deg, rgba(199,210,213,0.64), rgba(231,236,237,0.88))",
          boxShadow:
            "0 18px 24px rgba(44,64,70,0.18), 0 5px 8px rgba(44,64,70,0.11)",
          opacity: 0.88,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: 25,
          border: "3px solid rgba(255,255,255,0.98)",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, #F3F4F4 53%, #ECEFEF 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,1), 0 8px 15px rgba(41,60,66,0.14)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -30,
            top: -48,
            width: 190,
            height: 155,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.94), rgba(255,255,255,0) 70%)",
            opacity: 0.72,
          }}
        />

        <svg
          viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
          width="100%"
          height="100%"
          style={{position: "absolute", inset: 0}}
          aria-hidden
        >
          <defs>
            <linearGradient
              id={`bracket-${stage.number}`}
              x1="0"
              y1="0"
              x2={CARD_WIDTH}
              y2={CARD_HEIGHT}
            >
              <stop offset="0" stopColor={stage.dark} />
              <stop offset="0.65" stopColor={stage.color} />
              <stop offset="1" stopColor={stage.bright} />
            </linearGradient>
          </defs>
          <path
            d="M68 28H40Q22 28 22 46V299Q22 318 40 318H68"
            pathLength={1}
            fill="none"
            stroke={`url(#bracket-${stage.number})`}
            strokeWidth="3.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={dashOffset}
            opacity={0.98}
          />
          <path
            d="M256 28H284Q302 28 302 46V299Q302 318 284 318H256"
            pathLength={1}
            fill="none"
            stroke={`url(#bracket-${stage.number})`}
            strokeWidth="3.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={dashOffset}
            opacity={0.98}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 62,
            width: 116,
            height: 116,
            transform: `translateX(-50%) translateY(${(1 - iconIn) * 22}px) scale(${0.76 + iconIn * 0.24})`,
            opacity: iconIn,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${stage.glow}, rgba(255,255,255,0) 70%)`,
              filter: "blur(11px)",
              opacity: 0.5 + 0.46 * motionStrength,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(237,246,248,0.82))",
              border: "1px solid rgba(255,255,255,0.98)",
              boxShadow: `0 13px 24px ${stage.glow}, inset 0 2px 2px rgba(255,255,255,1), inset 0 -1px 3px rgba(40,92,111,0.08)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              border: `1.5px solid ${stage.bright}35`,
              boxShadow: `inset 0 0 20px ${stage.glow}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 17,
              top: 10,
              width: 58,
              height: 23,
              borderRadius: "50%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))",
              transform: "rotate(-16deg)",
              opacity: 0.72,
            }}
          />
          <div style={{position: "absolute", inset: 19}}>
            <PhosphorDuotoneIcon
              name={stage.icon}
              stage={stage}
              frame={frame}
              strength={motionStrength}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 193,
            left: 24,
            right: 24,
            textAlign: "center",
            color: stage.color,
            fontFamily:
              '"Arial Narrow", "Roboto Condensed", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            fontSize: 25,
            letterSpacing: 1.25,
            opacity: labelIn,
            transform: `translateY(${(1 - labelIn) * 15}px)`,
            textShadow: "0 1px 0 rgba(255,255,255,0.96)",
          }}
        >
          {stage.label}
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 235,
            width: 38,
            height: 3,
            borderRadius: 2,
            transform: `translateX(-50%) scaleX(${labelIn})`,
            background: `linear-gradient(90deg, transparent, ${stage.bright}, transparent)`,
            opacity: 0.72,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: -36,
          width: 178,
          height: 82,
          transform: `translateX(-50%) translateY(${(1 - tabIn) * -38}px) scale(${0.88 + tabIn * 0.12})`,
          transformOrigin: "50% 0%",
          opacity: tabIn,
          clipPath: "polygon(0 0, 100% 0, 88% 100%, 12% 100%)",
          borderRadius: "14px 14px 19px 19px",
          background: `linear-gradient(135deg, ${stage.dark} 0%, ${stage.color} 50%, ${stage.bright} 115%)`,
          boxShadow: `0 13px 19px ${stage.glow}, inset 0 1px 0 rgba(255,255,255,0.22)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: 0,
            height: 24,
            borderRadius: "0 0 50% 50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 4,
            color: "#FFFFFF",
            fontFamily:
              '"Arial Narrow", "Roboto Condensed", "Helvetica Neue", Arial, sans-serif',
            fontSize: 43,
            fontWeight: 700,
            letterSpacing: 1,
            textShadow: "0 3px 5px rgba(0,47,78,0.22)",
          }}
        >
          {stage.number}
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const cameraScale = interpolate(
    frame,
    [0, 330, 440, 610, 700, 899],
    [1, 1, 1.016, 1.016, 1, 1],
    {
      ...clamp,
      easing: easeInOut,
    },
  );
  const cameraX = interpolate(
    frame,
    [0, 80, 155, 228, 322, 430, 620, 700, 899],
    [0, -8, -4, 2, 8, 0, 0, 0, 0],
    {
      ...clamp,
      easing: easeInOut,
    },
  );
  const ambient = interpolate(
    frame,
    [0, 360, 500, 675, 899],
    [0.18, 0.18, 0.42, 0.18, 0.18],
    {
      ...clamp,
      easing: easeInOut,
    },
  );

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #EAF2F4 0%, #E1EBED 46%, #DCE8EB 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(46,91,105,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(46,91,105,0.035) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 76%)",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -150,
          top: -240,
          width: 900,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.78), rgba(255,255,255,0) 68%)",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -170,
          bottom: -350,
          width: 1000,
          height: 860,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,205,232,0.12), rgba(0,205,232,0) 67%)",
          opacity: ambient,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${cameraX}px) scale(${cameraScale})`,
          transformOrigin: "50% 51%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 175,
            right: 175,
            top: 694,
            height: 84,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(44,64,70,0.16) 0%, rgba(44,64,70,0.06) 42%, rgba(44,64,70,0) 72%)",
            filter: "blur(9px)",
            opacity: interpolate(
              frame,
              [35, 340, 680, 899],
              [0, 0.62, 0.62, 0],
              clamp,
            ),
          }}
        />
        {stages.map((stage, index) => (
          <StageCard
            key={stage.number}
            stage={stage}
            index={index}
            frame={frame}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
