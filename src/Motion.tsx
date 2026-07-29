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

type IconName = "lightbulb" | "settings" | "chart" | "target";

type Panel = {
  number: "01" | "02" | "03";
  color: string;
  glow: string;
  x: number;
  y: number;
  side: "left" | "right";
  row: "top" | "bottom";
  arrive: number;
  icon: IconName;
  iconX: number;
  iconY: number;
  numberX: number;
  numberY: number;
  accentPath: string;
};

const PANELS: readonly Panel[] = [
  {
    number: "01",
    color: "#83c63f",
    glow: "#b7df5e",
    x: 284,
    y: 178,
    side: "left",
    row: "top",
    arrive: 34,
    icon: "lightbulb",
    iconX: 812,
    iconY: 282,
    numberX: 744,
    numberY: 500,
    accentPath: "M600 178H330Q284 178 284 224V355",
  },
  {
    number: "02",
    color: "#47bd98",
    glow: "#70d5b1",
    x: 976,
    y: 178,
    side: "right",
    row: "top",
    arrive: 174,
    icon: "settings",
    iconX: 1086,
    iconY: 282,
    numberX: 1176,
    numberY: 500,
    accentPath: "M1288 178H1588Q1634 178 1634 224V355",
  },
  {
    number: "03",
    color: "#24b8c4",
    glow: "#59d4d6",
    x: 284,
    y: 572,
    side: "left",
    row: "bottom",
    arrive: 314,
    icon: "chart",
    iconX: 812,
    iconY: 776,
    numberX: 744,
    numberY: 632,
    accentPath: "M284 745V846Q284 892 330 892H600",
  },
  {
    number: "03",
    color: "#269bd0",
    glow: "#5ebee2",
    x: 976,
    y: 572,
    side: "right",
    row: "bottom",
    arrive: 454,
    icon: "target",
    iconX: 1086,
    iconY: 776,
    numberX: 1176,
    numberY: 632,
    accentPath: "M1634 745V846Q1634 892 1588 892H1288",
  },
] as const;

const drawStyle = (progress: number): React.CSSProperties => ({
  strokeDasharray: 1,
  strokeDashoffset: 1 - progress,
});

const InternetIcon: React.FC<{
  name: IconName;
  x: number;
  y: number;
  color: string;
  glow: string;
  progress: number;
  frame: number;
  index: number;
}> = ({name, x, y, color, glow, progress, frame, index}) => {
  const breathe =
    1 +
    Math.sin(frame * 0.045 + index * 1.35) *
      0.018 *
      interpolate(progress, [0.72, 1], [0, 1], clamp);
  const rotation =
    name === "settings"
      ? frame * 0.085 * interpolate(progress, [0.62, 1], [0, 1], clamp)
      : name === "target"
        ? Math.sin(frame * 0.037) * 1.25 * progress
        : 0;
  const floatY =
    Math.sin(frame * 0.037 + index * 0.9) *
    1.8 *
    interpolate(progress, [0.65, 1], [0, 1], clamp);
  const reveal = interpolate(progress, [0.08, 0.88], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const detail = interpolate(progress, [0.54, 1], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const orbit = frame * (index % 2 === 0 ? 0.12 : -0.105);
  const iconPaths: Record<
    IconName,
    {tone: string; body: string}
  > = {
    lightbulb: {
      tone:
        "M208 104a79.86 79.86 0 0 1-30.59 62.92A24.29 24.29 0 0 0 168 186v6a8 8 0 0 1-8 8H96a8 8 0 0 1-8-8v-6a24.11 24.11 0 0 0-9.3-19A79.87 79.87 0 0 1 48 104.45C47.76 61.09 82.72 25 126.07 24A80 80 0 0 1 208 104Z",
      body:
        "M176 232a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h80a8 8 0 0 1 8 8Zm40-128a87.55 87.55 0 0 1-33.64 69.21A16.24 16.24 0 0 0 176 186v6a16 16 0 0 1-16 16H96a16 16 0 0 1-16-16v-6a16 16 0 0 0-6.23-12.66A87.59 87.59 0 0 1 40 104.5C39.74 56.83 78.26 17.15 125.88 16A88 88 0 0 1 216 104Zm-16 0a72 72 0 0 0-73.74-72c-39 .92-70.47 33.39-70.26 72.39a71.64 71.64 0 0 0 27.64 56.3A32 32 0 0 1 96 186v6h24v-44.69l-29.66-29.65a8 8 0 0 1 11.32-11.32L128 132.69l26.34-26.35a8 8 0 0 1 11.32 11.32L136 147.31V192h24v-6a32.12 32.12 0 0 1 12.47-25.35A71.65 71.65 0 0 0 200 104Z",
    },
    settings: {
      tone:
        "M230.1 108.76 198.25 90.62c-.64-1.16-1.31-2.29-2-3.41l-.12-36A104.61 104.61 0 0 0 162 32l-32 17.89c-1.34 0-2.69 0-4 0L94 32a104.58 104.58 0 0 0-34.11 19.25l-.16 36c-.7 1.12-1.37 2.26-2 3.41l-31.84 18.1a99.15 99.15 0 0 0 0 38.46l31.85 18.14c.64 1.16 1.31 2.29 2 3.41l.12 36A104.61 104.61 0 0 0 94 224l32-17.87c1.34 0 2.69 0 4 0L162 224a104.58 104.58 0 0 0 34.08-19.25l.16-36c.7-1.12 1.37-2.26 2-3.41l31.84-18.1a99.15 99.15 0 0 0 .02-38.46ZM128 168a40 40 0 1 1 40-40 40 40 0 0 1-40 40Z",
      body:
        "M128 80a48 48 0 1 0 48 48 48.05 48.05 0 0 0-48-48Zm0 80a32 32 0 1 1 32-32 32 32 0 0 1-32 32Zm109.94-52.79a8 8 0 0 0-3.89-5.4l-29.83-17-.12-33.62a8 8 0 0 0-2.83-6.08 111.91 111.91 0 0 0-36.72-20.67 8 8 0 0 0-6.46.59L128 41.85 97.88 25a8 8 0 0 0-6.47-.6 111.92 111.92 0 0 0-36.68 20.75 8 8 0 0 0-2.83 6.07l-.15 33.65-29.83 17a8 8 0 0 0-3.89 5.4 106.47 106.47 0 0 0 0 41.56 8 8 0 0 0 3.89 5.4l29.83 17 .12 33.63a8 8 0 0 0 2.83 6.08 111.91 111.91 0 0 0 36.72 20.67 8 8 0 0 0 6.46-.59L128 214.15 158.12 231a7.91 7.91 0 0 0 3.9 1 8.09 8.09 0 0 0 2.57-.42 112.1 112.1 0 0 0 36.68-20.73 8 8 0 0 0 2.83-6.07l.15-33.65 29.83-17a8 8 0 0 0 3.89-5.4 106.47 106.47 0 0 0-.03-41.56Zm-15 34.91-28.57 16.25a8 8 0 0 0-3 3c-.58 1-1.19 2.06-1.81 3.06a7.94 7.94 0 0 0-1.22 4.21l-.15 32.25a95.89 95.89 0 0 1-25.37 14.3L134 199.13a8 8 0 0 0-3.91-1h-.19c-1.21 0-2.43 0-3.64 0a8.1 8.1 0 0 0-4.1 1l-28.84 16.1A96 96 0 0 1 67.88 201l-.11-32.2a8 8 0 0 0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09 8.09 0 0 0-3-3.06l-28.6-16.29a90.49 90.49 0 0 1 0-28.26L61.67 97.63a8 8 0 0 0 3-3c.58-1 1.19-2.06 1.81-3.06a7.94 7.94 0 0 0 1.22-4.21l.15-32.25a95.89 95.89 0 0 1 25.37-14.3L122 56.87a8 8 0 0 0 4.1 1c1.21 0 2.43 0 3.64 0a8 8 0 0 0 4.1-1l28.84-16.1A96 96 0 0 1 188.12 55l.11 32.2a8 8 0 0 0 1.22 4.22c.62 1 1.23 2 1.8 3.06a8.09 8.09 0 0 0 3 3.06l28.6 16.29a90.49 90.49 0 0 1 .05 28.26Z",
    },
    chart: {
      tone: "M224 64v144H32V48h176a16 16 0 0 1 16 16Z",
      body:
        "M232 208a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V48a8 8 0 0 1 16 0v108.69l50.34-50.35a8 8 0 0 1 11.32 0L128 132.69 180.69 80H160a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8v40a8 8 0 0 1-16 0V91.31l-58.34 58.35a8 8 0 0 1-11.32 0L96 123.31l-56 56V200h184a8 8 0 0 1 8 8Z",
    },
    target: {
      tone: "M176 128a48 48 0 1 1-48-48 48 48 0 0 1 48 48Z",
      body:
        "M221.87 83.16A104.1 104.1 0 1 1 195.67 49l22.67-22.68a8 8 0 0 1 11.32 11.32l-96 96a8 8 0 0 1-11.32-11.32l27.72-27.72a40 40 0 1 0 17.87 31.09 8 8 0 1 1 16-.9 56 56 0 1 1-22.38-41.65L184.3 60.39a87.88 87.88 0 1 0 23.13 29.67 8 8 0 0 1 14.44-6.9Z",
    },
  };
  const selected = iconPaths[name];

  return (
    <g
      opacity={interpolate(progress, [0, 0.12], [0, 1], clamp)}
      transform={`translate(${x} ${y + floatY}) scale(${breathe}) translate(${-x} ${-y})`}
    >
      <defs>
        <radialGradient id={`icon-halo-${index}`} cx="35%" cy="28%" r="76%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="52%" stopColor={glow} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </radialGradient>
        <linearGradient id={`icon-ring-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={glow} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <linearGradient id={`icon-ink-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={glow} />
          <stop offset="62%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <clipPath id={`icon-reveal-${index}`}>
          <circle cx="128" cy="128" r={148 * reveal} />
        </clipPath>
        <filter id={`icon-depth-${index}`} x="-80%" y="-80%" width="260%" height="280%">
          <feDropShadow
            dx="0"
            dy="9"
            stdDeviation="10"
            floodColor={color}
            floodOpacity="0.2"
          />
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="#557078"
            floodOpacity="0.12"
          />
        </filter>
        <filter id={`glyph-depth-${index}`} x="-40%" y="-40%" width="180%" height="190%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="4"
            floodColor={color}
            floodOpacity="0.2"
          />
        </filter>
      </defs>

      <circle
        cx={x}
        cy={y}
        r={84 + detail * 4}
        fill={color}
        opacity={0.035 + detail * 0.022}
      />
      <circle
        cx={x}
        cy={y}
        r="72"
        fill={`url(#icon-halo-${index})`}
        stroke={`url(#icon-ring-${index})`}
        strokeWidth="3.5"
        filter={`url(#icon-depth-${index})`}
      />
      <circle
        cx={x}
        cy={y}
        r="61"
        fill="#ffffff"
        fillOpacity="0.88"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <circle
        cx={x}
        cy={y}
        r="54"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeDasharray="1 10"
        strokeLinecap="round"
        opacity={0.14 + detail * 0.08}
        transform={`rotate(${orbit} ${x} ${y})`}
      />

      <svg
        x={x - 45}
        y={y - 45}
        width="90"
        height="90"
        viewBox="0 0 256 256"
        overflow="visible"
        transform={`rotate(${rotation} ${x} ${y})`}
      >
        <g
          clipPath={`url(#icon-reveal-${index})`}
          filter={`url(#glyph-depth-${index})`}
        >
          <path
            d={selected.tone}
            fill={color}
            opacity={0.12 + detail * 0.1}
          />
          <path d={selected.body} fill={`url(#icon-ink-${index})`} />
        </g>
      </svg>

      <g
        opacity={detail}
        transform={`rotate(${-orbit * 0.58} ${x} ${y})`}
      >
        <circle cx={x} cy={y - 72} r="4.5" fill="#ffffff" stroke={glow} strokeWidth="2.5" />
        <circle cx={x + 68} cy={y + 21} r="3.2" fill={color} />
        <circle cx={x - 61} cy={y + 34} r="2.6" fill={glow} />
      </g>
    </g>
  );
};

const Card: React.FC<{
  panel: Panel;
  index: number;
  frame: number;
  fps: number;
}> = ({panel, index, frame, fps}) => {
  const local = frame - panel.arrive;
  const cardSpring = spring({
    frame: local,
    fps,
    durationInFrames: 78,
    config: {damping: 16, stiffness: 102, mass: 0.82},
  });
  const cardProgress = interpolate(cardSpring, [0, 1], [0, 1], clamp);
  const accentProgress = interpolate(local, [26, 104], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const iconProgress = interpolate(local, [72, 146], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const numberSpring = spring({
    frame: local - 90,
    fps,
    durationInFrames: 62,
    config: {damping: 13, stiffness: 135, mass: 0.68},
  });
  const numberProgress = interpolate(numberSpring, [0, 1], [0, 1], clamp);
  const drift =
    Math.sin(frame * 0.018 + index * 0.85) *
    2.4 *
    interpolate(local, [140, 220], [0, 1], clamp);
  const fromCenter = panel.side === "left" ? 28 : -28;
  const fromVertical = panel.row === "top" ? 18 : -18;
  const revealX =
    panel.side === "left"
      ? panel.x + 650 * (1 - cardProgress)
      : panel.x;
  const glintX = interpolate(
    frame,
    [650 + index * 13, 742 + index * 13],
    [panel.x - 210, panel.x + 760],
    clamp,
  );
  const glintOpacity = interpolate(
    frame,
    [630 + index * 13, 660 + index * 13, 724 + index * 13, 758 + index * 13],
    [0, 0.64, 0.64, 0],
    clamp,
  );

  return (
    <g transform={`translate(0 ${drift})`}>
      <defs>
        <clipPath id={`card-reveal-${index}`}>
          <rect
            x={revealX}
            y={panel.y - 32}
            width={650 * cardProgress}
            height="406"
            rx="38"
          />
        </clipPath>
        <clipPath id={`card-body-${index}`}>
          <rect x={panel.x} y={panel.y} width="650" height="320" rx="34" />
        </clipPath>
        <linearGradient id={`panel-fill-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fdfdfd" />
        </linearGradient>
        <linearGradient id={`accent-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={panel.glow} />
          <stop offset="100%" stopColor={panel.color} />
        </linearGradient>
        <linearGradient id={`glint-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={`shadow-${index}`} x="-25%" y="-35%" width="160%" height="190%">
          <feDropShadow
            dx="0"
            dy="17"
            stdDeviation="16"
            floodColor="#69737a"
            floodOpacity="0.19"
          />
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#63717a"
            floodOpacity="0.12"
          />
        </filter>
        <filter id={`number-glow-${index}`} x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="5"
            floodColor={panel.color}
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      <g
        clipPath={`url(#card-reveal-${index})`}
        opacity={interpolate(cardProgress, [0, 0.08], [0, 1], clamp)}
        transform={`translate(${fromCenter * (1 - cardProgress)} ${fromVertical * (1 - cardProgress)})`}
      >
        <rect
          x={panel.x}
          y={panel.y}
          width="650"
          height="320"
          rx="34"
          fill={`url(#panel-fill-${index})`}
          filter={`url(#shadow-${index})`}
        />
        <rect
          x={panel.x + 3}
          y={panel.y + 3}
          width="644"
          height="314"
          rx="31"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          opacity="0.94"
        />
        <path
          d={`M${panel.x + 45} ${panel.y + 27}H${panel.x + 605}`}
          stroke={panel.color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.075"
        />
        <circle
          cx={panel.iconX}
          cy={panel.iconY}
          r="106"
          fill={panel.color}
          opacity="0.025"
        />
        <circle
          cx={panel.iconX}
          cy={panel.iconY}
          r="88"
          fill="none"
          stroke={panel.color}
          strokeWidth="1.4"
          strokeDasharray="4 16"
          opacity="0.1"
          transform={`rotate(${frame * (index % 2 === 0 ? 0.08 : -0.08)} ${panel.iconX} ${panel.iconY})`}
        />
        <InternetIcon
          name={panel.icon}
          x={panel.iconX}
          y={panel.iconY}
          color={panel.color}
          glow={panel.glow}
          progress={iconProgress}
          frame={frame}
          index={index}
        />

        <g clipPath={`url(#card-body-${index})`} opacity={glintOpacity}>
          <rect
            x={glintX}
            y={panel.y - 45}
            width="126"
            height="420"
            fill={`url(#glint-${index})`}
            transform={`skewX(-19)`}
            style={{mixBlendMode: "screen"}}
          />
        </g>
      </g>

      <path
        d={panel.accentPath}
        fill="none"
        stroke={`url(#accent-${index})`}
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        style={drawStyle(accentProgress)}
        opacity={interpolate(accentProgress, [0, 0.06], [0, 1], clamp)}
      />

      <g
        opacity={interpolate(numberProgress, [0, 0.1], [0, 1], clamp)}
        transform={`translate(${panel.numberX} ${panel.numberY}) scale(${0.76 + numberProgress * 0.24}) translate(${-panel.numberX} ${-panel.numberY})`}
        filter={`url(#number-glow-${index})`}
      >
        <text
          x={panel.numberX}
          y={panel.numberY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={panel.color}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="58"
          fontWeight="700"
          letterSpacing="-2"
        >
          {panel.number}
        </text>
      </g>
    </g>
  );
};

const Hub: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const hubSpring = spring({
    frame: frame - 70,
    fps,
    durationInFrames: 84,
    config: {damping: 16, stiffness: 96, mass: 0.9},
  });
  const hubProgress = interpolate(hubSpring, [0, 1], [0, 1], clamp);
  const segmentColors = PANELS.map((panel) => panel.color);
  const segmentStarts = PANELS.map((panel) => panel.arrive + 70);
  const pulse =
    1 +
    Math.sin(frame * 0.035) *
      0.012 *
      interpolate(frame, [590, 660], [0, 1], clamp);
  const orbitRotation = interpolate(frame, [590, 820], [0, 22], clamp);
  const highlightOpacity = interpolate(
    frame,
    [640, 674, 758, 802],
    [0, 0.8, 0.8, 0],
    clamp,
  );

  return (
    <g
      opacity={interpolate(hubProgress, [0, 0.08], [0, 1], clamp)}
      transform={`translate(960 540) scale(${(0.82 + hubProgress * 0.18) * pulse}) translate(-960 -540)`}
    >
      <defs>
        <filter id="hub-shadow" x="-70%" y="-70%" width="240%" height="260%">
          <feDropShadow
            dx="0"
            dy="15"
            stdDeviation="15"
            floodColor="#56676c"
            floodOpacity="0.22"
          />
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#57686d"
            floodOpacity="0.14"
          />
        </filter>
        <filter id="hub-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <linearGradient id="hub-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle
        cx="960"
        cy="540"
        r="137"
        fill="#ffffff"
        filter="url(#hub-shadow)"
      />
      <circle
        cx="960"
        cy="540"
        r="107"
        fill="none"
        stroke="#e7e9e9"
        strokeWidth="35"
      />

      {segmentColors.map((color, index) => {
        const segmentProgress = interpolate(
          frame,
          [segmentStarts[index], segmentStarts[index] + 76],
          [0, 1],
          {...clamp, easing: Easing.out(Easing.cubic)},
        );
        const segmentRotations = [182, -88, 92, 2] as const;
        return (
          <circle
            key={color}
            cx="960"
            cy="540"
            r="107"
            fill="none"
            stroke={color}
            strokeWidth="35"
            strokeLinecap="butt"
            pathLength="100"
            strokeDasharray={`${22.7 * segmentProgress} 100`}
            transform={`rotate(${segmentRotations[index]} 960 540)`}
          />
        );
      })}

      <circle cx="960" cy="540" r="78" fill="#ffffff" />
      <circle
        cx="960"
        cy="540"
        r="62"
        fill="#f8faf9"
        stroke="#edf1ef"
        strokeWidth="2"
      />

      <g
        opacity={interpolate(frame, [540, 620], [0, 1], clamp)}
        transform={`rotate(${orbitRotation} 960 540)`}
      >
        <circle cx="960" cy="516" r="5" fill="#83c63f" />
        <circle cx="984" cy="540" r="5" fill="#47bd98" />
        <circle cx="960" cy="564" r="5" fill="#24b8c4" />
        <circle cx="936" cy="540" r="5" fill="#269bd0" />
        <circle
          cx="960"
          cy="540"
          r="12"
          fill="none"
          stroke="#d9e4df"
          strokeWidth="3"
        />
      </g>

      {PANELS.map((panel, index) => {
        const nodeAngles = [-135, -45, 135, 45] as const;
        const angle = nodeAngles[index];
        const radians = (angle * Math.PI) / 180;
        const x = 960 + Math.cos(radians) * 132;
        const y = 540 + Math.sin(radians) * 132;
        const nodeProgress = spring({
          frame: frame - panel.arrive - 104,
          fps,
          durationInFrames: 55,
          config: {damping: 13, stiffness: 145, mass: 0.65},
        });
        const nodeScale = interpolate(nodeProgress, [0, 1], [0, 1], clamp);
        return (
          <g
            key={`${panel.number}-${index}`}
            opacity={interpolate(nodeProgress, [0, 0.1], [0, 1], clamp)}
            transform={`translate(${x} ${y}) scale(${nodeScale}) translate(${-x} ${-y})`}
          >
            <circle cx={x} cy={y} r="19" fill="#ffffff" />
            <circle
              cx={x}
              cy={y}
              r="13"
              fill="#ffffff"
              stroke={panel.color}
              strokeWidth="6"
            />
          </g>
        );
      })}

      <g opacity={highlightOpacity} transform={`rotate(${orbitRotation * 2.4} 960 540)`}>
        <circle
          cx="960"
          cy="540"
          r="107"
          fill="none"
          stroke="url(#hub-sheen)"
          strokeWidth="35"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="10 90"
          filter="url(#hub-glow)"
        />
      </g>
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneOpacity = interpolate(
    frame,
    [0, 20, 840, 899],
    [0, 1, 1, 0],
    clamp,
  );
  const cameraScale = interpolate(
    frame,
    [0, 240, 620, 760, 840],
    [0.972, 0.985, 1, 1.012, 1],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const cameraY = interpolate(
    frame,
    [0, 300, 620, 840],
    [8, 0, -4, 0],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const floorOpacity = interpolate(
    frame,
    [30, 150, 770, 842],
    [0, 0.08, 0.08, 0],
    clamp,
  );

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
            "radial-gradient(circle at 50% 48%, #fafafa 0%, #f1f1f2 54%, #e7e8e9 100%)",
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
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <radialGradient id="floor-gradient">
            <stop offset="0%" stopColor="#607078" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#607078" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          transform={`translate(960 ${540 + cameraY}) scale(${cameraScale}) translate(-960 -540)`}
        >
          <ellipse
            cx="960"
            cy="922"
            rx="730"
            ry="24"
            fill="url(#floor-gradient)"
            opacity={floorOpacity}
            filter="url(#floor-blur)"
          />

          {PANELS.map((panel, index) => (
            <Card
              key={`${panel.number}-${index}`}
              panel={panel}
              index={index}
              frame={frame}
              fps={fps}
            />
          ))}
          <Hub frame={frame} fps={fps} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
