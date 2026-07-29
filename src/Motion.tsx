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

type IconName = "chart" | "coins" | "rocket";

type Stage = {
  number: "01" | "02" | "03";
  color: string;
  light: string;
  dark: string;
  tint: string;
  x: number;
  arrive: number;
  icon: IconName;
};

const STAGES: readonly Stage[] = [
  {
    number: "01",
    color: "#ff9418",
    light: "#ffb43f",
    dark: "#c76800",
    tint: "#fff4df",
    x: 115,
    arrive: 42,
    icon: "chart",
  },
  {
    number: "02",
    color: "#f45450",
    light: "#ff7972",
    dark: "#bd312f",
    tint: "#fff0ef",
    x: 695,
    arrive: 205,
    icon: "coins",
  },
  {
    number: "03",
    color: "#1aa5a9",
    light: "#27c2c4",
    dark: "#087377",
    tint: "#e9f8f7",
    x: 1275,
    arrive: 368,
    icon: "rocket",
  },
] as const;

const drawStyle = (progress: number): React.CSSProperties => ({
  strokeDasharray: 1,
  strokeDashoffset: 1 - progress,
});

const InternetIcon: React.FC<{
  name: IconName;
  color: string;
  progress: number;
  frame: number;
  fps: number;
  start: number;
}> = ({name, color, progress, frame, fps, start}) => {
  const iconSpring = spring({
    frame: frame - start,
    fps,
    config: {damping: 14, stiffness: 125, mass: 0.72},
    durationInFrames: 52,
  });
  const settle = interpolate(
    Math.sin(((frame - start) / fps) * Math.PI * 2 * 0.55),
    [-1, 1],
    [-1.2, 1.2],
  );
  const active = interpolate(progress, [0, 0.18], [0, 1], clamp);
  const accent = "#ffc13b";

  return (
    <g
      opacity={active}
      transform={`translate(255 218) translate(0 ${settle * active}) scale(${
        0.76 + iconSpring * 0.24
      }) translate(-255 -218)`}
    >
      <circle
        cx="255"
        cy="218"
        r={59 + iconSpring * 3}
        fill="#ffffff"
        stroke={color}
        strokeWidth="2"
        opacity="0.98"
      />
      <circle
        cx="255"
        cy="218"
        r="50"
        fill={color}
        opacity={interpolate(progress, [0.45, 1], [0.035, 0.075], clamp)}
      />

      <svg
        x="208"
        y="171"
        width="94"
        height="94"
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        overflow="visible"
      >
        {name === "chart" ? (
          <>
            <path
              d="M12 16v5M16 14v7M20 10v11M4 18v3M8 14v7"
              stroke={color}
              strokeWidth="1.8"
              pathLength="1"
              style={drawStyle(progress)}
            />
            <path
              d="m22 3-8.65 8.65a.5.5 0 0 1-.7 0L9.35 8.35a.5.5 0 0 0-.7 0L2 15"
              stroke={color}
              strokeWidth="1.8"
              pathLength="1"
              style={drawStyle(interpolate(progress, [0.18, 1], [0, 1], clamp))}
            />
            <circle
              cx="22"
              cy="3"
              r="1.15"
              fill={accent}
              stroke="#ffffff"
              strokeWidth="0.55"
              opacity={interpolate(progress, [0.68, 0.9], [0, 1], clamp)}
            />
          </>
        ) : null}

        {name === "coins" ? (
          <>
            <path
              d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"
              stroke={color}
              strokeWidth="1.7"
              pathLength="1"
              style={drawStyle(progress)}
            />
            <path
              d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 16l6 6"
              stroke={color}
              strokeWidth="1.7"
              pathLength="1"
              style={drawStyle(interpolate(progress, [0.14, 1], [0, 1], clamp))}
            />
            <circle
              cx="16"
              cy="6.8"
              r="3.1"
              fill={accent}
              stroke={color}
              strokeWidth="1.15"
              pathLength="1"
              style={drawStyle(interpolate(progress, [0.28, 0.88], [0, 1], clamp))}
            />
            <path
              d="M16 5.45v2.7M15.1 6h1.45a.65.65 0 0 1 0 1.3h-1.1"
              stroke="#ffffff"
              strokeWidth="0.72"
              pathLength="1"
              style={drawStyle(interpolate(progress, [0.62, 1], [0, 1], clamp))}
            />
          </>
        ) : null}

        {name === "rocket" ? (
          <>
            <path
              d="m12 15-3-3a22 22 0 0 1 2-3.95A12.66 12.66 0 0 1 22 2c0 2.72-.78 7.5-6.1 11.2A23 23 0 0 1 12 15Z"
              fill="#ffffff"
              stroke={color}
              strokeWidth="1.65"
              pathLength="1"
              style={drawStyle(progress)}
            />
            <path
              d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
              stroke={color}
              strokeWidth="1.65"
              pathLength="1"
              style={drawStyle(interpolate(progress, [0.12, 1], [0, 1], clamp))}
            />
            <circle
              cx="16.15"
              cy="7.85"
              r="2.15"
              fill={accent}
              stroke={color}
              strokeWidth="1.1"
              opacity={interpolate(progress, [0.48, 0.78], [0, 1], clamp)}
            />
            <path
              d="M8.2 16.4c-1.6-.1-3 .45-3.9 1.35-.95.95-1.35 3.75-1.35 3.75s2.8-.4 3.75-1.35c.9-.9 1.45-2.3 1.35-3.9"
              fill={accent}
              stroke="#f28a16"
              strokeWidth="1.1"
              pathLength="1"
              style={drawStyle(interpolate(progress, [0.48, 1], [0, 1], clamp))}
            />
          </>
        ) : null}
      </svg>
    </g>
  );
};

const StageCard: React.FC<{
  stage: Stage;
  index: number;
  frame: number;
  fps: number;
}> = ({stage, index, frame, fps}) => {
  const local = frame - stage.arrive;

  const ribbonProgress = interpolate(local, [0, 48], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const cardSpring = spring({
    frame: local - 18,
    fps,
    config: {damping: 15, stiffness: 105, mass: 0.8},
    durationInFrames: 62,
  });
  const badgeSpring = spring({
    frame: local - 58,
    fps,
    config: {damping: 12, stiffness: 135, mass: 0.72},
    durationInFrames: 58,
  });
  const iconProgress = interpolate(local, [96, 166], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const connectorProgress = interpolate(local, [78, 164], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const sceneHold = interpolate(frame, [740, 800], [0, 1], clamp);
  const floatY =
    Math.sin((frame / fps) * Math.PI * 2 * 0.22 + index * 0.75) *
    2.5 *
    interpolate(local, [160, 230], [0, 1], clamp) *
    (1 - sceneHold * 0.45);
  const badgePulse =
    1 +
    Math.sin((frame / fps) * Math.PI * 2 * 0.42 + index * 0.8) *
      0.012 *
      interpolate(local, [122, 190], [0, 1], clamp);
  const highlightX = interpolate(frame, [588 + index * 18, 700 + index * 18], [-180, 620], clamp);
  const highlightOpacity = interpolate(
    frame,
    [570 + index * 18, 600 + index * 18, 680 + index * 18, 714 + index * 18],
    [0, 0.82, 0.82, 0],
    clamp,
  );

  return (
    <g transform={`translate(${stage.x} ${330 + floatY})`}>
      <defs>
        <linearGradient id={`ribbon-${index}`} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={stage.light} />
          <stop offset="58%" stopColor={stage.color} />
          <stop offset="100%" stopColor={stage.dark} />
        </linearGradient>
        <linearGradient id={`badge-${index}`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor={stage.light} />
          <stop offset="65%" stopColor={stage.color} />
          <stop offset="100%" stopColor={stage.dark} />
        </linearGradient>
        <linearGradient id={`card-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fbfcfd" />
        </linearGradient>
        <linearGradient id={`glint-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="48%" stopColor="#ffffff" stopOpacity="0.74" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`card-clip-${index}`}>
          <rect x="35" y="105" width="460" height="230" rx="16" />
        </clipPath>
        <mask id={`connector-mask-${index}`}>
          <path
            d="M65 322v28q0 14 14 14h420q16 0 16-16V210"
            fill="none"
            stroke="#ffffff"
            strokeWidth="7"
            pathLength="1"
            strokeDasharray={`${connectorProgress} 1`}
          />
        </mask>
        <filter id={`card-shadow-${index}`} x="-30%" y="-30%" width="180%" height="200%">
          <feDropShadow
            dx="0"
            dy="19"
            stdDeviation="18"
            floodColor="#5c6670"
            floodOpacity="0.18"
          />
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#66717b"
            floodOpacity="0.12"
          />
        </filter>
        <filter id={`badge-shadow-${index}`} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="10"
            floodColor={stage.dark}
            floodOpacity="0.28"
          />
        </filter>
        <filter id={`ribbon-shadow-${index}`} x="-30%" y="-30%" width="180%" height="200%">
          <feDropShadow
            dx="0"
            dy="11"
            stdDeviation="9"
            floodColor={stage.dark}
            floodOpacity="0.23"
          />
        </filter>
      </defs>

      <g mask={`url(#connector-mask-${index})`}>
        <path
          d="M65 322v28q0 14 14 14h420q16 0 16-16V210"
          fill="none"
          stroke={stage.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="10 10"
        />
      </g>
      <circle
        cx="515"
        cy="210"
        r={7 + Math.sin(frame * 0.08 + index) * 0.8}
        fill={stage.color}
        opacity={interpolate(connectorProgress, [0.88, 1], [0, 1], clamp)}
      />
      <circle
        cx="515"
        cy="210"
        r="14"
        fill="none"
        stroke={stage.color}
        strokeWidth="2"
        opacity={
          interpolate(connectorProgress, [0.9, 1], [0, 0.28], clamp) *
          interpolate(Math.sin(frame * 0.065 + index), [-1, 1], [0.3, 1])
        }
      />

      <g
        opacity={interpolate(ribbonProgress, [0, 0.16], [0, 1], clamp)}
        transform={`translate(0 65) scale(${ribbonProgress} 1) translate(0 -65)`}
        style={{transformOrigin: "0px 65px"}}
        filter={`url(#ribbon-shadow-${index})`}
      >
        <path
          d="M28 66C12 66 0 78 0 94v66c0-24 18-38 42-38h216V66Z"
          fill={`url(#ribbon-${index})`}
        />
        <path d="M0 122h42v58C18 176 0 160 0 138Z" fill={stage.dark} />
        <path d="M174 66h84l-8 56h-76Z" fill={stage.light} opacity="0.92" />
      </g>

      <g
        opacity={interpolate(cardSpring, [0, 0.12], [0, 1], clamp)}
        transform={`translate(265 220) translate(0 ${(1 - cardSpring) * 34}) scale(${
          0.94 + cardSpring * 0.06
        }) translate(-265 -220)`}
      >
        <rect
          x="35"
          y="105"
          width="460"
          height="230"
          rx="16"
          fill={`url(#card-${index})`}
          filter={`url(#card-shadow-${index})`}
        />
        <rect
          x="36.5"
          y="106.5"
          width="457"
          height="227"
          rx="14.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          opacity="0.9"
        />
        <path
          d="M53 116h422"
          stroke={stage.color}
          strokeWidth="3"
          opacity="0.1"
          strokeLinecap="round"
        />
        <ellipse cx="255" cy="218" rx="104" ry="86" fill={stage.tint} opacity="0.8" />
        <ellipse
          cx="255"
          cy="218"
          rx="80"
          ry="66"
          fill="none"
          stroke={stage.color}
          strokeWidth="2"
          strokeDasharray="2 11"
          strokeLinecap="round"
          opacity="0.25"
          transform={`rotate(${frame * 0.11 + index * 31} 255 218)`}
        />

        <InternetIcon
          name={stage.icon}
          color={stage.color}
          progress={iconProgress}
          frame={frame}
          fps={fps}
          start={stage.arrive + 92}
        />

        <g clipPath={`url(#card-clip-${index})`} opacity={highlightOpacity}>
          <rect
            x={highlightX}
            y="90"
            width="145"
            height="270"
            fill={`url(#glint-${index})`}
            transform={`skewX(-18)`}
            style={{mixBlendMode: "screen"}}
          />
        </g>
      </g>

      <g
        opacity={interpolate(badgeSpring, [0, 0.08], [0, 1], clamp)}
        transform={`translate(160 70) scale(${badgeSpring * badgePulse}) translate(-160 -70)`}
        filter={`url(#badge-shadow-${index})`}
      >
        <circle cx="160" cy="70" r="65" fill="#ffffff" />
        <circle cx="160" cy="70" r="53" fill={`url(#badge-${index})`} />
        <circle
          cx="160"
          cy="70"
          r="45"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.24"
        />
        <path
          d="M128 38a45 45 0 0 1 44-10"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.52"
        />
        <text
          x="160"
          y="91"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="62"
          fontWeight="400"
          letterSpacing="-2"
        >
          {stage.number}
        </text>
      </g>
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 22, 838, 899], [0, 1, 1, 0], clamp);
  const cameraScale = interpolate(
    frame,
    [0, 520, 710, 835],
    [0.975, 1, 1.012, 1],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const floorOpacity = interpolate(frame, [26, 130, 790, 850], [0, 0.08, 0.08, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#eeeeef",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #f8f8f9 0%, #eeeeef 58%, #e4e5e7 100%)",
        }}
      />

      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: "absolute", inset: 0, opacity: sceneOpacity}}
      >
        <defs>
          <filter id="floor-blur" x="-20%" y="-300%" width="140%" height="700%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <radialGradient id="floor-gradient">
            <stop offset="0%" stopColor="#55616a" stopOpacity="0.54" />
            <stop offset="100%" stopColor="#55616a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          transform={`translate(960 540) scale(${cameraScale}) translate(-960 -540)`}
        >
          <ellipse
            cx="960"
            cy="724"
            rx="805"
            ry="24"
            fill="url(#floor-gradient)"
            opacity={floorOpacity}
            filter="url(#floor-blur)"
          />

          {STAGES.map((stage, index) => (
            <StageCard
              key={stage.number}
              stage={stage}
              index={index}
              frame={frame}
              fps={fps}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
