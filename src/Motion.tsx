import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const MASTER_FRAMES = 900;
const RING_OUTER_TOP = 389;
const RING_OUTER_BOTTOM = 731;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const smooth = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const points = [
  {
    x: 220,
    gradient: ["#27c5c8", "#3265b7"],
    dot: "#2cbec4",
    path: "M780 305V321Q780 345 756 345H244Q220 345 220 369V389",
    pathLength: 630,
  },
  {
    x: 590,
    gradient: ["#376ab7", "#7652b6"],
    dot: "#5b67b2",
    path: "M870 305V351Q870 375 846 375H614Q590 375 590 389",
    pathLength: 350,
  },
  {
    x: 960,
    gradient: ["#6556b8", "#a8429f"],
    dot: "#9555b1",
    path: "M960 305V389",
    pathLength: 84,
  },
  {
    x: 1330,
    gradient: ["#a13e9d", "#ef2f69"],
    dot: "#eb3674",
    path: "M1050 305V351Q1050 375 1074 375H1306Q1330 375 1330 389",
    pathLength: 350,
  },
  {
    x: 1700,
    gradient: ["#ed365f", "#ff9b26"],
    dot: "#ff9428",
    path: "M1140 305V321Q1140 345 1164 345H1676Q1700 345 1700 369V389",
    pathLength: 630,
  },
] as const;

const ringStarts = [155, 225, 295, 365, 435];

export const Motion: React.FC = () => {
  const rawFrame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const frame = (rawFrame / Math.max(1, durationInFrames - 1)) * (MASTER_FRAMES - 1);

  const pillProgress = spring({
    frame,
    fps,
    config: {
      damping: 17,
      mass: 0.9,
      stiffness: 110,
    },
    durationInFrames: 86,
  });
  const pillOpacity = smooth(frame, 0, 28);
  const accentProgress = smooth(frame, 48, 116);
  const finalGlow = smooth(frame, 585, 670);
  const backgroundBreath = 0.5 + 0.5 * Math.sin(frame / 54);
  const pillFloat = frame > 110 ? Math.sin((frame - 110) / 72) * 2.2 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f2f2f2",
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="backgroundWash" cx="50%" cy="41%" r="68%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.94" />
            <stop offset="58%" stopColor="#f3f3f3" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#e9e9e9" stopOpacity="0.96" />
          </radialGradient>

          <linearGradient id="accentGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#29bfc5" />
            <stop offset="30%" stopColor="#6358b7" />
            <stop offset="63%" stopColor="#e83282" />
            <stop offset="100%" stopColor="#ff9826" />
          </linearGradient>

          {points.map((point, index) => (
            <linearGradient
              key={`gradient-${index}`}
              id={`ringGradient${index}`}
              x1={point.x - 175}
              y1="560"
              x2={point.x + 175}
              y2="560"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={point.gradient[0]} />
              <stop offset="100%" stopColor={point.gradient[1]} />
            </linearGradient>
          ))}

          <linearGradient id="ringGloss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.64" />
            <stop offset="58%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <filter id="pillShadow" x="-30%" y="-35%" width="170%" height="190%">
            <feDropShadow
              dx="-18"
              dy="28"
              stdDeviation="23"
              floodColor="#333842"
              floodOpacity="0.28"
            />
            <feDropShadow
              dx="0"
              dy="-1"
              stdDeviation="1"
              floodColor="#ffffff"
              floodOpacity="0.9"
            />
          </filter>

          <filter id="ringShadow" x="-35%" y="-35%" width="180%" height="190%">
            <feDropShadow
              dx="-4"
              dy="22"
              stdDeviation="20"
              floodColor="#29303b"
              floodOpacity="0.24"
            />
          </filter>

          <filter id="discShadow" x="-45%" y="-40%" width="200%" height="210%">
            <feDropShadow
              dx="-9"
              dy="24"
              stdDeviation="17"
              floodColor="#20252e"
              floodOpacity="0.34"
            />
            <feDropShadow
              dx="0"
              dy="-2"
              stdDeviation="2"
              floodColor="#ffffff"
              floodOpacity="0.98"
            />
          </filter>

          <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="11" />
          </filter>

          {points.map((point, index) => {
            const connectorDraw = smooth(
              frame,
              ringStarts[index] - 90,
              ringStarts[index] - 24,
            );
            return (
              <mask
                key={`mask-${index}`}
                id={`connectorMask${index}`}
                maskUnits="userSpaceOnUse"
                x="0"
                y="280"
                width={CANVAS_WIDTH}
                height="220"
              >
                <rect x="0" y="280" width={CANVAS_WIDTH} height="220" fill="#000000" />
                <path
                  d={point.path}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={point.pathLength}
                  strokeDashoffset={point.pathLength * (1 - connectorDraw)}
                />
              </mask>
            );
          })}
        </defs>

        <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#backgroundWash)" />

        <ellipse
          cx="960"
          cy="550"
          rx="890"
          ry="430"
          fill="#ffffff"
          opacity={0.06 + backgroundBreath * 0.05}
        />

        <g opacity={pillOpacity}>
          <g
            transform={`translate(0 ${interpolate(
              pillProgress,
              [0, 1],
              [-92, pillFloat],
            )})`}
          >
            <rect
              x="620"
              y="95"
              width="680"
              height="210"
              rx="105"
              fill="#fbfbfb"
              filter="url(#pillShadow)"
            />
            <path
              d="M665 146Q636 179 636 220Q636 270 680 291"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.7"
            />
            <rect
              x="770"
              y="255"
              width={380 * accentProgress}
              height="6"
              rx="3"
              fill="url(#accentGradient)"
            />
          </g>
        </g>

        <g opacity={0.84}>
          {points.map((point, index) => (
            <path
              key={`connector-${index}`}
              d={point.path}
              fill="none"
              stroke="#555960"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="1 13"
              mask={`url(#connectorMask${index})`}
            />
          ))}
        </g>

        {points.map((point, index) => {
          const start = ringStarts[index];
          const entrance = spring({
            frame: frame - start,
            fps,
            config: {
              damping: 15,
              mass: 0.82,
              stiffness: 125,
            },
            durationInFrames: 72,
          });
          const ringDraw = smooth(frame, start + 5, start + 76);
          const discProgress = smooth(frame, start + 22, start + 72);
          const lowerLine = smooth(frame, start + 82, start + 134);
          const lowerDot = spring({
            frame: frame - (start + 119),
            fps,
            config: {
              damping: 12,
              mass: 0.65,
              stiffness: 160,
            },
            durationInFrames: 52,
          });
          const radius = 142;
          const circumference = Math.PI * 2 * radius;
          const scale = interpolate(entrance, [0, 1], [0.88, 1]);
          const ringRotation = -90;
          const shimmerRotation = -90 + ((frame - 600) * 0.42 + index * 31);
          const stageGlow =
            finalGlow *
            (0.42 + 0.18 * Math.sin(frame / 28 + index * 0.9));

          return (
            <g key={`stage-${index}`}>
              <g
                opacity={clamp(entrance)}
                transform={`translate(${point.x} ${RING_OUTER_TOP}) scale(${scale}) translate(${
                  -point.x
                } ${-RING_OUTER_TOP})`}
              >
                <circle
                  cx={point.x}
                  cy="560"
                  r="157"
                  fill="none"
                  stroke={point.dot}
                  strokeWidth="22"
                  opacity={stageGlow}
                  filter="url(#softGlow)"
                />

                <circle
                  cx={point.x}
                  cy="560"
                  r={radius}
                  fill="none"
                  stroke={`url(#ringGradient${index})`}
                  strokeWidth="58"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - ringDraw)}
                  transform={`rotate(${ringRotation} ${point.x} 560)`}
                  filter="url(#ringShadow)"
                />

                <circle
                  cx={point.x}
                  cy="560"
                  r="115"
                  fill="#fbfbfb"
                  opacity={clamp(discProgress)}
                  transform={`translate(${point.x} 560) scale(${interpolate(
                    discProgress,
                    [0, 1],
                    [0.68, 1],
                  )}) translate(${-point.x} -560)`}
                  filter="url(#discShadow)"
                />

                <ellipse
                  cx={point.x - 22}
                  cy="523"
                  rx="76"
                  ry="48"
                  fill="url(#ringGloss)"
                  opacity={0.14 * clamp(discProgress)}
                />

                <circle
                  cx={point.x}
                  cy="560"
                  r={radius}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`76 ${circumference - 76}`}
                  transform={`rotate(${shimmerRotation} ${point.x} 560)`}
                  opacity={finalGlow * 0.45}
                />
              </g>

              <path
                d={`M${point.x} ${RING_OUTER_BOTTOM}V${
                  RING_OUTER_BOTTOM + 95 * lowerLine
                }`}
                fill="none"
                stroke="#555960"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="1 13"
                opacity={0.85}
              />

              <g
                opacity={clamp(lowerDot)}
                transform={`translate(${point.x} 852) scale(${interpolate(
                  lowerDot,
                  [0, 1],
                  [0.55, 1],
                )}) translate(${-point.x} -852)`}
              >
                <circle
                  cx={point.x}
                  cy="852"
                  r="27"
                  fill="#f8f8f8"
                  stroke="#60636a"
                  strokeWidth="2"
                />
                <circle cx={point.x} cy="852" r="15" fill={point.dot} />
                <circle
                  cx={point.x - 5}
                  cy="846"
                  r="4"
                  fill="#ffffff"
                  opacity="0.5"
                />
              </g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
