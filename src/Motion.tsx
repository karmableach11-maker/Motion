import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type CardData = {
  color: string;
  dark: string;
  number: string;
  tilt: number;
};

const CARDS: CardData[] = [
  {color: "#073A54", dark: "#052C40", number: "01", tilt: -7},
  {color: "#FF9812", dark: "#E88100", number: "02", tilt: 7},
  {color: "#08788A", dark: "#046274", number: "03", tilt: -5},
  {color: "#18BDB8", dark: "#0A9F9C", number: "04", tilt: 6},
];

const CARD_WIDTH = 300;
const CARD_HEIGHT = 430;
const CARD_TOP = 346;
const CARD_START_X = 186;
const CARD_GAP = 108;
const ENTER_AT = [44, 136, 228, 320];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const ease = (value: number) =>
  Easing.inOut(Easing.cubic)(clamp(value));

const range = (frame: number, start: number, end: number) =>
  ease((frame - start) / (end - start));

const LongShadow: React.FC<{
  index: number;
  progress: number;
}> = ({index, progress}) => {
  const drift = (1 - progress) * 34;
  const pulse = 1 + Math.sin((index + 1) * 1.8) * 0.015;

  return (
    <g
      opacity={0.62 * progress}
      transform={`translate(${drift} ${drift}) scale(${pulse})`}
    >
      <path
        d={[
          "M 22 24",
          `H ${CARD_WIDTH - 20}`,
          `L ${CARD_WIDTH + 126} 151`,
          `V ${CARD_HEIGHT + 116}`,
          "H 143",
          `L 22 ${CARD_HEIGHT - 2}`,
          "Z",
        ].join(" ")}
        fill={`url(#long-shadow-${index})`}
      />
    </g>
  );
};

const ShoppingBag: React.FC<{
  card: CardData;
  index: number;
  frame: number;
  fps: number;
  progress: number;
}> = ({card, index, frame, fps, progress}) => {
  const start = ENTER_AT[index] + 18;
  const bagIn = spring({
    frame: frame - start,
    fps,
    config: {damping: 13.5, stiffness: 92, mass: 0.92},
    durationInFrames: 116,
  });
  const numberIn = spring({
    frame: frame - start - 44,
    fps,
    config: {damping: 16, stiffness: 145, mass: 0.74},
    durationInFrames: 64,
  });

  const elapsed = Math.max(0, frame - start);
  const entrySwing =
    card.tilt +
    (1 - clamp(elapsed / 185)) *
      Math.sin(elapsed / 11 + index * 0.75) *
      (index % 2 === 0 ? 13 : -13);
  const idle = frame > 505 ? Math.sin((frame - 505) / 74 + index * 0.9) * 1.1 : 0;
  const swing = entrySwing + idle;
  const yDrop = (1 - bagIn) * -132;
  const numberScale = 0.78 + numberIn * 0.22;

  const shimmerStart = 505 + index * 30;
  const shimmer = interpolate(
    frame,
    [shimmerStart, shimmerStart + 140],
    [-265, 265],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );
  const shimmerOpacity =
    0.34 *
    range(frame, shimmerStart, shimmerStart + 30) *
    (1 - range(frame, shimmerStart + 112, shimmerStart + 140));

  const pulseStart = 650 + index * 34;
  const pulseProgress = clamp((frame - pulseStart) / 94);
  const pulseOpacity =
    frame >= pulseStart ? (1 - ease(pulseProgress)) * 0.26 : 0;

  return (
    <g
      opacity={progress}
      transform={`translate(150 ${-44 + yDrop})`}
    >
      <circle
        cx="0"
        cy="-55"
        r={105 + ease(pulseProgress) * 42}
        fill="none"
        stroke={card.color}
        strokeWidth={5 - ease(pulseProgress) * 3}
        opacity={pulseOpacity}
      />

      <g transform={`rotate(${swing} 0 -146)`}>
        <path
          d="M -48 -71 C -43 -126 -25 -151 0 -151 C 25 -151 43 -126 48 -71"
          fill="none"
          stroke="#273B45"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M -43 -69 C -39 -111 -23 -134 0 -134 C 23 -134 39 -111 43 -69"
          fill="none"
          stroke="#273B45"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.7"
        />

        <path
          d="M -94 -65 L 82 -80 L 101 84 L -74 101 Z"
          fill="#183849"
          opacity="0.17"
          transform="translate(9 15)"
          filter="url(#bag-shadow)"
        />
        <path
          d="M -94 -65 L 82 -80 L 101 84 L -74 101 Z"
          fill={`url(#bag-fill-${index})`}
          stroke={card.dark}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M -94 -65 L 82 -80 L 85 -58 L -91 -43 Z"
          fill="white"
          opacity="0.075"
        />

        <g clipPath={`url(#bag-clip-${index})`}>
          <rect
            x={shimmer}
            y="-120"
            width="58"
            height="270"
            fill="white"
            opacity={shimmerOpacity}
            transform={`rotate(-18 ${shimmer} 0)`}
          />
        </g>

        <circle cx="-46" cy="-69" r="4.6" fill="#E9EFF1" opacity="0.86" />
        <circle cx="43" cy="-76" r="4.6" fill="#E9EFF1" opacity="0.86" />
        <circle cx="-46" cy="-69" r="2.2" fill="#273B45" opacity="0.8" />
        <circle cx="43" cy="-76" r="2.2" fill="#273B45" opacity="0.8" />

        <g
          opacity={numberIn}
          transform={`translate(2 16) scale(${numberScale})`}
        >
          <text
            x="0"
            y="20"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="48"
            fontWeight="400"
            letterSpacing="-1"
          >
            {card.number}
          </text>
        </g>
      </g>
    </g>
  );
};

const InfographicCard: React.FC<{
  card: CardData;
  index: number;
  frame: number;
  fps: number;
}> = ({card, index, frame, fps}) => {
  const start = ENTER_AT[index];
  const entrance = spring({
    frame: frame - start,
    fps,
    config: {damping: 17, stiffness: 104, mass: 0.88},
    durationInFrames: 92,
  });
  const fade = range(frame, start - 8, start + 24);
  const x = CARD_START_X + index * (CARD_WIDTH + CARD_GAP);
  const yOffset = (1 - entrance) * 116;
  const scale = 0.91 + entrance * 0.09;
  const shadowIn = range(frame, start + 7, start + 85);
  const accentIn = spring({
    frame: frame - start - 70,
    fps,
    config: {damping: 17, stiffness: 130, mass: 0.7},
    durationInFrames: 58,
  });
  const cardLift =
    frame > 540 ? Math.sin((frame - 540) / 90 + index * 0.8) * 2.3 : 0;

  return (
    <g
      transform={[
        `translate(${x + CARD_WIDTH / 2} ${
          CARD_TOP + CARD_HEIGHT / 2 + yOffset + cardLift
        })`,
        `scale(${scale})`,
        `translate(${-CARD_WIDTH / 2} ${-CARD_HEIGHT / 2})`,
      ].join(" ")}
      opacity={fade}
    >
      <LongShadow index={index} progress={shadowIn} />

      <rect
        x="0"
        y="0"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        rx="28"
        fill="white"
        stroke="#E8EAEB"
        strokeWidth="1.5"
        filter="url(#card-shadow)"
      />
      <rect
        x="1.5"
        y="1.5"
        width={CARD_WIDTH - 3}
        height={CARD_HEIGHT - 3}
        rx="26.5"
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity="0.82"
      />

      <ShoppingBag
        card={card}
        index={index}
        frame={frame}
        fps={fps}
        progress={fade}
      />

      <rect
        x={CARD_WIDTH / 2 - 62 * accentIn}
        y={CARD_HEIGHT - 19}
        width={124 * accentIn}
        height="8"
        rx="4"
        fill={card.color}
      />
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const intro = range(frame, 0, 42);
  const cameraScale = interpolate(
    frame,
    [0, 460, 899],
    [1, 1.006, 1.018],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const cameraY = interpolate(frame, [0, 899], [4, -5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F3F3F2",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <radialGradient id="background-light" cx="50%" cy="38%" r="78%">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.78" />
            <stop offset="0.7" stopColor="#F5F5F4" stopOpacity="0.42" />
            <stop offset="1" stopColor="#EDEDEC" stopOpacity="0.6" />
          </radialGradient>
          <filter
            id="card-shadow"
            x="-28%"
            y="-24%"
            width="180%"
            height="190%"
          >
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="12"
              floodColor="#76818A"
              floodOpacity="0.13"
            />
          </filter>
          <filter
            id="bag-shadow"
            x="-45%"
            y="-45%"
            width="210%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="floor-blur" x="-25%" y="-300%" width="150%" height="700%">
            <feGaussianBlur stdDeviation="22" />
          </filter>

          {CARDS.map((card, index) => (
            <React.Fragment key={card.number}>
              <linearGradient
                id={`long-shadow-${index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0" stopColor="#9EA4A8" stopOpacity="0.24" />
                <stop offset="0.52" stopColor="#ADB2B5" stopOpacity="0.13" />
                <stop offset="1" stopColor="#C6C9CB" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id={`bag-fill-${index}`}
                x1="0"
                y1="0"
                x2="0.9"
                y2="1"
              >
                <stop offset="0" stopColor={card.color} />
                <stop offset="1" stopColor={card.dark} />
              </linearGradient>
              <clipPath id={`bag-clip-${index}`}>
                <path d="M -94 -65 L 82 -80 L 101 84 L -74 101 Z" />
              </clipPath>
            </React.Fragment>
          ))}
        </defs>

        <rect
          width="1920"
          height="1080"
          fill="url(#background-light)"
          opacity={0.88 * intro}
        />
        <ellipse
          cx="960"
          cy="864"
          rx="735"
          ry="22"
          fill="#8D969B"
          opacity={0.08 * range(frame, 20, 230)}
          filter="url(#floor-blur)"
        />

        <g
          transform={`translate(960 540) scale(${cameraScale}) translate(-960 ${
            -540 + cameraY
          })`}
        >
          {CARDS.map((card, index) => (
            <InfographicCard
              key={card.number}
              card={card}
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
