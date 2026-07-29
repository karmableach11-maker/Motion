import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type IconProps = {
  color: string;
  progress: number;
};

type Stage = {
  label: string;
  color: string;
  x: number;
  y: number;
  markerX: number;
  markerY: number;
  routeAt: number;
  icon: React.FC<IconProps>;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ROUTE_PATH =
  "M -110 565 C 125 476 390 460 635 486 C 822 505 859 588 771 685 C 676 789 493 767 443 822 C 390 881 531 916 724 890 C 933 863 1092 766 1262 671 C 1434 575 1658 575 1760 665 C 1876 768 1701 851 1541 878 C 1393 903 1348 979 1288 1110";

const ROUTE_SEGMENTS = [
  {start: 0, end: 0.16, color: "#FFC72C", dark: "#E3A700"},
  {start: 0.16, end: 0.34, color: "#FFAA1C", dark: "#F08A13"},
  {start: 0.34, end: 0.49, color: "#78BE2C", dark: "#61A321"},
  {start: 0.49, end: 0.68, color: "#2FC79B", dark: "#20A983"},
  {start: 0.68, end: 0.83, color: "#2EA9E6", dark: "#208FC8"},
  {start: 0.83, end: 1, color: "#337FDF", dark: "#2468BD"},
];

const ROUTE_START = 32;
const ROUTE_END = 788;

const drawValue = (frame: number, start: number, duration = 38) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const StrokePath: React.FC<
  React.SVGProps<SVGPathElement> & {progress: number}
> = ({progress, ...props}) => (
  <path
    {...props}
    fill="none"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={1 - progress}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

const iconDraw = (progress: number, index: number) =>
  interpolate(progress, [index * 0.075, 0.62 + index * 0.075], [0, 1], clamp);

const iconStroke = (progress: number, index: number) => {
  const value = iconDraw(progress, index);
  return {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - value,
    opacity: value,
  };
};

const IconCanvas: React.FC<
  IconProps & {
    children: React.ReactNode;
  }
> = ({color, progress, children}) => (
  <svg width="86" height="86" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={color} opacity={progress * 0.055} />
    <g
      fill="none"
      stroke="#687980"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  </svg>
);

// Adapted from Lucide v1.27.0 (ISC): BadgeDollarSign.
const CapitalizeIcon: React.FC<IconProps> = ({color, progress}) => (
  <IconCanvas color={color} progress={progress}>
    <path
      d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
      {...iconStroke(progress, 0)}
    />
    <path
      d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"
      stroke={color}
      {...iconStroke(progress, 1)}
    />
    <path d="M12 18V6" stroke={color} {...iconStroke(progress, 2)} />
  </IconCanvas>
);

// Adapted from Lucide v1.27.0 (ISC): DatabaseZap.
const BigDataIcon: React.FC<IconProps> = ({color, progress}) => (
  <IconCanvas color={color} progress={progress}>
    <ellipse cx="12" cy="5" rx="9" ry="3" {...iconStroke(progress, 0)} />
    <path
      d="M3 5V19A9 3 0 0 0 15 21.84"
      {...iconStroke(progress, 1)}
    />
    <path d="M3 12A9 3 0 0 0 14.59 14.87" {...iconStroke(progress, 2)} />
    <path d="M21 5V8" {...iconStroke(progress, 3)} />
    <path
      d="M21 12L18 17H22L19 22"
      stroke={color}
      {...iconStroke(progress, 4)}
    />
  </IconCanvas>
);

// Adapted from Lucide v1.27.0 (ISC): FileSearchCorner.
const ResearchIcon: React.FC<IconProps> = ({color, progress}) => (
  <IconCanvas color={color} progress={progress}>
    <path
      d="M11.1 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.589 3.588A2.4 2.4 0 0 1 20 8v3.25"
      {...iconStroke(progress, 0)}
    />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" {...iconStroke(progress, 1)} />
    <circle
      cx="16"
      cy="17"
      r="3"
      stroke={color}
      {...iconStroke(progress, 2)}
    />
    <path
      d="m21 22-2.88-2.88"
      stroke={color}
      {...iconStroke(progress, 3)}
    />
  </IconCanvas>
);

// Adapted from Lucide v1.27.0 (ISC): Settings2.
const ManagementIcon: React.FC<IconProps> = ({color, progress}) => (
  <IconCanvas color={color} progress={progress}>
    <path d="M19 7h-9" {...iconStroke(progress, 0)} />
    <circle
      cx="7"
      cy="7"
      r="3"
      stroke={color}
      {...iconStroke(progress, 1)}
    />
    <path d="M14 17H5" {...iconStroke(progress, 2)} />
    <circle
      cx="17"
      cy="17"
      r="3"
      stroke={color}
      {...iconStroke(progress, 3)}
    />
  </IconCanvas>
);

// Adapted from Lucide v1.27.0 (ISC): Megaphone.
const MarketingIcon: React.FC<IconProps> = ({color, progress}) => (
  <IconCanvas color={color} progress={progress}>
    <path
      d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
      {...iconStroke(progress, 0)}
    />
    <path d="M8 6v8" stroke={color} {...iconStroke(progress, 1)} />
    <path
      d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"
      stroke={color}
      {...iconStroke(progress, 2)}
    />
  </IconCanvas>
);

// Adapted from Lucide v1.27.0 (ISC): Trophy.
const SuccessIcon: React.FC<IconProps> = ({color, progress}) => (
  <IconCanvas color={color} progress={progress}>
    <path
      d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1Z"
      stroke={color}
      {...iconStroke(progress, 0)}
    />
    <path
      d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"
      {...iconStroke(progress, 1)}
    />
    <path
      d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"
      {...iconStroke(progress, 2)}
    />
    <path
      d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"
      {...iconStroke(progress, 3)}
    />
    <path
      d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"
      {...iconStroke(progress, 4)}
    />
    <path d="M4 22h16" stroke={color} {...iconStroke(progress, 5)} />
  </IconCanvas>
);

const STAGES: Stage[] = [
  {
    label: "CAPITALIZE",
    color: "#F7B719",
    x: 248,
    y: 215,
    markerX: 248,
    markerY: 492,
    routeAt: 0.1006,
    icon: CapitalizeIcon,
  },
  {
    label: "BIG DATA",
    color: "#FF9F1C",
    x: 735,
    y: 285,
    markerX: 735,
    markerY: 544,
    routeAt: 0.2389,
    icon: BigDataIcon,
  },
  {
    label: "RESEARCH",
    color: "#78BE2C",
    x: 552,
    y: 646,
    markerX: 552,
    markerY: 866,
    routeAt: 0.442,
    icon: ResearchIcon,
  },
  {
    label: "MANAGEMENT",
    color: "#2FC79B",
    x: 1044,
    y: 496,
    markerX: 1044,
    markerY: 802,
    routeAt: 0.5805,
    icon: ManagementIcon,
  },
  {
    label: "MARKETING",
    color: "#2EA9E6",
    x: 1494,
    y: 312,
    markerX: 1494,
    markerY: 622,
    routeAt: 0.7163,
    icon: MarketingIcon,
  },
  {
    label: "SUCCESS!",
    color: "#337FDF",
    x: 1430,
    y: 690,
    markerX: 1430,
    markerY: 908,
    routeAt: 0.932,
    icon: SuccessIcon,
  },
];

const TimelinePin: React.FC<{
  stage: Stage;
  frame: number;
  fps: number;
  routeProgress: number;
  sceneOpacity: number;
}> = ({stage, frame, fps, routeProgress, sceneOpacity}) => {
  const arrivalFrame = Math.round(
    ROUTE_START + (ROUTE_END - ROUTE_START) * stage.routeAt,
  );
  const crossed = routeProgress >= stage.routeAt;
  const markerPop = spring({
    frame: frame - arrivalFrame,
    fps,
    config: {
      damping: 16,
      stiffness: 150,
      mass: 0.72,
    },
    durationInFrames: 34,
  });
  const pop = spring({
    frame: frame - arrivalFrame - 8,
    fps,
    config: {
      damping: 17,
      stiffness: 118,
      mass: 0.86,
    },
    durationInFrames: 50,
  });
  const markerEntrance = crossed
    ? Math.max(0, Math.min(1, markerPop))
    : 0;
  const entrance = crossed ? Math.max(0, Math.min(1, pop)) : 0;
  const outline = crossed ? drawValue(frame, arrivalFrame + 7, 52) : 0;
  const connector = crossed ? drawValue(frame, arrivalFrame + 2, 34) : 0;
  const iconProgress = crossed ? drawValue(frame, arrivalFrame + 24, 56) : 0;
  const labelProgress = crossed ? drawValue(frame, arrivalFrame + 48, 34) : 0;
  const tailY = stage.y + 126;
  const connectorStart = tailY + 8;
  const connectorY = interpolate(
    connector,
    [0, 1],
    [stage.markerY, connectorStart],
  );
  const pulse =
    frame > arrivalFrame + 44
      ? (Math.sin((frame - arrivalFrame) * 0.072) + 1) / 2
      : 0;
  const Icon = stage.icon;

  return (
    <g opacity={sceneOpacity}>
      <line
        x1={stage.markerX}
        x2={stage.markerX}
        y1={stage.markerY}
        y2={connectorY}
        stroke={stage.color}
        strokeWidth="4"
        strokeLinecap="round"
        opacity={0.78 * connector}
      />

      <circle
        cx={stage.markerX}
        cy={stage.markerY}
        r={28 + pulse * 6}
        fill="none"
        stroke={stage.color}
        strokeWidth="3"
        opacity={markerEntrance * (0.12 + pulse * 0.16)}
      />
      <circle
        cx={stage.markerX}
        cy={stage.markerY}
        r={22 * markerEntrance}
        fill="#FFFFFF"
        stroke={stage.color}
        strokeWidth="3"
        style={{filter: "drop-shadow(0 8px 8px rgba(55,71,79,0.18))"}}
      />
      <circle
        cx={stage.markerX}
        cy={stage.markerY}
        r={8 * markerEntrance}
        fill={stage.color}
      />

      <g
        transform={`translate(${stage.x} ${stage.y + (1 - entrance) * 24}) scale(${0.72 + entrance * 0.28}) translate(${-stage.x} ${-stage.y})`}
        opacity={entrance}
      >
        <circle
          cx={stage.x}
          cy={stage.y}
          r="108"
          fill="#FFFFFF"
          stroke={stage.color}
          strokeWidth="5"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - outline}
          style={{
            filter: "drop-shadow(0 18px 24px rgba(79,93,102,0.12))",
          }}
        />
        <path
          d={`M ${stage.x - 20} ${stage.y + 98} L ${stage.x} ${tailY} L ${stage.x + 20} ${stage.y + 98}`}
          fill="#FFFFFF"
          stroke={stage.color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - outline}
        />
        <g transform={`translate(${stage.x - 41} ${stage.y - 68})`}>
          <Icon color={stage.color} progress={iconProgress} />
        </g>
        <text
          x={stage.x}
          y={stage.y + 63}
          fill={stage.color}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="21"
          fontWeight="700"
          letterSpacing="0.6"
          textAnchor="middle"
          opacity={labelProgress}
          transform={`translate(0 ${(1 - labelProgress) * 8})`}
        >
          {stage.label}
        </text>
        <line
          x1={stage.x - 22 * labelProgress}
          x2={stage.x + 22 * labelProgress}
          y1={stage.y + 78}
          y2={stage.y + 78}
          stroke={stage.color}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={labelProgress * 0.72}
        />
      </g>
    </g>
  );
};

const RouteParticle: React.FC<{
  distance: number;
  opacity: number;
  size: number;
  blur?: number;
}> = ({distance, opacity, size, blur = 0}) => (
  <div
    style={
      {
        position: "absolute",
        left: 0,
        top: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#FFFFFF",
        border: `${Math.max(2, size * 0.13)}px solid rgba(255,255,255,0.78)`,
        boxShadow:
          "0 0 8px rgba(255,255,255,0.95), 0 0 22px rgba(70,190,214,0.9)",
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        offsetPath: `path("${ROUTE_PATH}")`,
        offsetDistance: `${distance * 100}%`,
        offsetRotate: "0deg",
        transform: "translate(-50%, -50%)",
      } as React.CSSProperties
    }
  />
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 28, 856, 899], [0, 1, 1, 0], clamp);
  const routeProgress = interpolate(
    frame,
    [ROUTE_START, ROUTE_END],
    [0, 1],
    clamp,
  );
  const gridOpacity = interpolate(frame, [0, 50, 842, 899], [0, 0.55, 0.55, 0], clamp);
  const cameraX = interpolate(frame, [0, 250, 510, 710, 899], [0, -8, 8, 0, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const cameraScale = interpolate(frame, [0, 120, 650, 760, 899], [0.99, 1, 1.014, 1, 0.99], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const holdProgress = Math.max(0, frame - ROUTE_END);
  const travelDistance =
    frame < ROUTE_END ? routeProgress : (holdProgress % 210) / 210;
  const secondaryDistance = ((holdProgress + 105) % 210) / 210;
  const particleOpacity = interpolate(
    frame,
    [44, 68, 850, 878],
    [0, 1, 1, 0],
    clamp,
  );
  const holdParticleOpacity = interpolate(
    frame,
    [ROUTE_END - 8, ROUTE_END + 24, 850, 878],
    [0, 0.9, 0.9, 0],
    clamp,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FBFCFC",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage:
            "linear-gradient(rgba(139,157,164,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(139,157,164,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 82% 76% at 50% 53%, black 15%, rgba(0,0,0,0.75) 62%, transparent 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          transform: `translateX(${cameraX}px) scale(${cameraScale})`,
          transformOrigin: "50% 55%",
        }}
      >
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          style={{position: "absolute", inset: 0}}
        >
          <defs>
            <mask id="route-reveal">
              <rect width="1920" height="1080" fill="black" />
              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="white"
                strokeWidth="112"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - routeProgress}
                strokeLinecap="round"
              />
            </mask>
            <filter id="route-shadow" x="-20%" y="-20%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>

          <g mask="url(#route-reveal)" opacity={sceneOpacity}>
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="rgba(67,78,84,0.22)"
              strokeWidth="76"
              strokeLinecap="round"
              transform="translate(0 20)"
              filter="url(#route-shadow)"
            />
            {ROUTE_SEGMENTS.map((segment) => {
              const length = segment.end - segment.start;
              return (
                <path
                  key={`rim-${segment.start}`}
                  d={ROUTE_PATH}
                  fill="none"
                  stroke={segment.dark}
                  strokeWidth="72"
                  strokeLinecap="butt"
                  pathLength={1}
                  strokeDasharray={`${length} ${1 - length}`}
                  strokeDashoffset={-segment.start}
                  transform="translate(0 9)"
                />
              );
            })}
            {ROUTE_SEGMENTS.map((segment) => {
              const length = segment.end - segment.start;
              return (
                <path
                  key={`main-${segment.start}`}
                  d={ROUTE_PATH}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="62"
                  strokeLinecap="butt"
                  pathLength={1}
                  strokeDasharray={`${length} ${1 - length}`}
                  strokeDashoffset={-segment.start}
                />
              );
            })}
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="56"
              strokeLinecap="butt"
              pathLength={1}
              strokeDasharray="0.034 0.024"
            />
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.36)"
              strokeWidth="4"
              strokeLinecap="round"
              transform="translate(0 -18)"
            />
          </g>

          {STAGES.map((stage) => (
            <TimelinePin
              key={stage.label}
              stage={stage}
              frame={frame}
              fps={fps}
              routeProgress={routeProgress}
              sceneOpacity={sceneOpacity}
            />
          ))}
        </svg>

        <RouteParticle
          distance={travelDistance}
          opacity={particleOpacity}
          size={22}
        />
        {frame >= ROUTE_END - 8 ? (
          <>
            <RouteParticle
              distance={secondaryDistance}
              opacity={holdParticleOpacity}
              size={13}
            />
            <RouteParticle
              distance={(secondaryDistance + 0.035) % 1}
              opacity={holdParticleOpacity * 0.38}
              size={18}
              blur={4}
            />
          </>
        ) : null}
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 88,
          background:
            "linear-gradient(180deg, rgba(251,252,252,0), rgba(251,252,252,0.92))",
          opacity: sceneOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
