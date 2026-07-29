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

type CardData = {
  color: string;
  dark: string;
  label: string;
  icon: React.FC<IconProps>;
};

const clamp: Parameters<typeof interpolate>[3] = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
};

const SpeechIcon: React.FC<IconProps> = ({color, progress}) => {
  const lower = interpolate(progress, [0.1, 0.72], [0, 1], clamp);
  const upper = interpolate(progress, [0.32, 1], [0, 1], clamp);

  return (
    <svg width="92" height="72" viewBox="0 0 92 72">
      <g
        fill={color}
        opacity={lower}
        transform={`translate(0 ${12 * (1 - lower)}) scale(${0.78 + lower * 0.22})`}
        style={{transformOrigin: "36px 43px"}}
      >
        <ellipse cx="36" cy="42" rx="27" ry="17" />
        <path d="M16 52 L8 65 L29 57 Z" />
      </g>
      <g
        fill={color}
        opacity={upper}
        transform={`translate(0 ${-10 * (1 - upper)}) scale(${0.8 + upper * 0.2})`}
        style={{transformOrigin: "59px 29px"}}
      >
        <ellipse cx="59" cy="28" rx="25" ry="16" />
        <path d="M73 39 L82 51 L64 43 Z" />
      </g>
    </svg>
  );
};

const PeopleIcon: React.FC<IconProps> = ({color, progress}) => {
  const people = [
    {x: 13, y: 31, scale: 0.8, delay: 0.14},
    {x: 30, y: 24, scale: 0.94, delay: 0.06},
    {x: 47, y: 18, scale: 1.08, delay: 0},
    {x: 64, y: 24, scale: 0.94, delay: 0.06},
    {x: 81, y: 31, scale: 0.8, delay: 0.14},
  ];

  return (
    <svg width="100" height="80" viewBox="0 0 100 80">
      {people.map((person, index) => {
        const p = interpolate(
          progress,
          [person.delay, Math.min(1, person.delay + 0.58)],
          [0, 1],
          clamp,
        );
        return (
          <g
            key={index}
            fill={color}
            opacity={p}
            transform={`translate(${person.x} ${person.y + 14 * (1 - p)}) scale(${person.scale})`}
          >
            <circle cx="0" cy="0" r="6.2" />
            <path d="M-8 10 Q0 5 8 10 L8 29 Q0 34 -8 29 Z" />
          </g>
        );
      })}
      <rect
        x="13"
        y="65"
        width={74 * interpolate(progress, [0.42, 1], [0, 1], clamp)}
        height="3"
        rx="1.5"
        fill={color}
        opacity={interpolate(progress, [0.42, 0.72], [0, 1], clamp)}
      />
    </svg>
  );
};

const ChartIcon: React.FC<IconProps> = ({color, progress}) => {
  const bars = [
    {x: 12, height: 17, delay: 0.22},
    {x: 27, height: 35, delay: 0.12},
    {x: 42, height: 27, delay: 0.18},
    {x: 57, height: 51, delay: 0},
    {x: 72, height: 42, delay: 0.08},
  ];

  return (
    <svg width="92" height="78" viewBox="0 0 92 78">
      <rect
        x="6"
        y="68"
        width={80 * interpolate(progress, [0, 0.55], [0, 1], clamp)}
        height="3"
        rx="1.5"
        fill={color}
        opacity={interpolate(progress, [0, 0.25], [0, 1], clamp)}
      />
      {bars.map((bar, index) => {
        const p = interpolate(
          progress,
          [bar.delay, Math.min(1, bar.delay + 0.72)],
          [0, 1],
          clamp,
        );
        return (
          <rect
            key={index}
            x={bar.x}
            y={68 - bar.height * p}
            width="10"
            height={bar.height * p}
            rx="1.5"
            fill={color}
            opacity={interpolate(p, [0, 0.2], [0, 1], clamp)}
          />
        );
      })}
    </svg>
  );
};

const MountainIcon: React.FC<IconProps> = ({color, progress}) => {
  const left = interpolate(progress, [0.08, 0.72], [0, 1], clamp);
  const right = interpolate(progress, [0.28, 1], [0, 1], clamp);

  return (
    <svg width="100" height="76" viewBox="0 0 100 76">
      <path
        d="M8 66 L39 19 L68 66 Z"
        fill={color}
        opacity={left}
        transform={`translate(0 ${18 * (1 - left)})`}
      />
      <path
        d="M42 66 L68 31 L93 66 Z"
        fill={color}
        opacity={right}
        transform={`translate(0 ${16 * (1 - right)})`}
      />
      <path
        d="M28 36 L39 19 L50 36 L44 32 L39 39 L34 31 Z"
        fill="white"
        opacity={left}
        transform={`translate(0 ${18 * (1 - left)})`}
      />
      <path
        d="M60 42 L68 31 L76 43 L72 40 L68 46 L64 40 Z"
        fill="white"
        opacity={right}
        transform={`translate(0 ${16 * (1 - right)})`}
      />
    </svg>
  );
};

const cards: CardData[] = [
  {
    color: "#00608F",
    dark: "#003B5C",
    label: "Option 01",
    icon: SpeechIcon,
  },
  {
    color: "#00A9A9",
    dark: "#007979",
    label: "Option 02",
    icon: PeopleIcon,
  },
  {
    color: "#77A817",
    dark: "#4B7208",
    label: "Option 03",
    icon: ChartIcon,
  },
  {
    color: "#B7D70A",
    dark: "#7E9E00",
    label: "Option 04",
    icon: MountainIcon,
  },
];

const CARD_WIDTH = 332;
const CARD_HEIGHT = 568;
const GAP = 84;
const GROUP_WIDTH = CARD_WIDTH * 4 + GAP * 3;
const START_X = (1920 - GROUP_WIDTH) / 2;
const CARD_TOP = 246;

const OptionCard: React.FC<{
  data: CardData;
  index: number;
  frame: number;
  fps: number;
}> = ({data, index, frame, fps}) => {
  const start = 38 + index * 88;
  const localFrame = Math.max(0, frame - start);
  const entrance = spring({
    frame: localFrame,
    fps,
    durationInFrames: 76,
    config: {
      damping: 16,
      mass: 0.78,
      stiffness: 92,
    },
  });
  const visible = interpolate(frame, [start, start + 19], [0, 1], clamp);
  const exit = interpolate(frame, [814 + index * 8, 895], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const tab = interpolate(frame, [start + 20, start + 64], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const fold = interpolate(frame, [start + 36, start + 76], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const icon = interpolate(frame, [start + 58, start + 126], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const iconPulse = interpolate(
    frame,
    [start + 120, start + 142, start + 172],
    [0, 1, 0],
    clamp,
  );
  const shimmer = interpolate(
    frame,
    [465 + index * 28, 535 + index * 28],
    [-130, CARD_WIDTH + 130],
    clamp,
  );
  const shimmerOpacity = interpolate(
    frame,
    [450 + index * 28, 478 + index * 28, 535 + index * 28, 555 + index * 28],
    [0, 0.22, 0.12, 0],
    clamp,
  );
  const xDirection = index < 2 ? -1 : 1;
  const translateX = (1 - entrance) * 46 * xDirection;
  const translateY = (1 - entrance) * 112;
  const rotation = (1 - entrance) * (index % 2 === 0 ? -2.3 : 2.3);
  const scale = 0.88 + entrance * 0.12;
  const Icon = data.icon;

  return (
    <div
      style={{
        position: "absolute",
        left: START_X + index * (CARD_WIDTH + GAP),
        top: CARD_TOP,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        opacity: visible * exit,
        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "50% 86%",
        filter:
          "drop-shadow(20px 22px 16px rgba(45, 51, 55, 0.16)) drop-shadow(4px 5px 5px rgba(45, 51, 55, 0.08))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: 15,
          background: "#FFFFFF",
          clipPath:
            "polygon(0 0, calc(100% - 52px) 0, 100% 52px, 100% 100%, 0 100%)",
          boxShadow: "inset 0 0 0 1px rgba(20, 36, 45, 0.025)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 52,
            height: 52,
            opacity: fold,
            background:
              "linear-gradient(135deg, #E9EAEB 0%, #F5F5F5 48%, #FFFFFF 49%, #FFFFFF 100%)",
            clipPath: "polygon(0 0, 0 100%, 100% 100%)",
            transform: `translate(${(1 - fold) * -25}px, ${(1 - fold) * -25}px)`,
            boxShadow: "-8px 8px 10px rgba(55, 61, 64, 0.08)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: shimmer,
            top: -60,
            width: 74,
            height: CARD_HEIGHT + 120,
            opacity: shimmerOpacity,
            transform: "skewX(-14deg)",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(222,229,232,0.75), rgba(255,255,255,0))",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 55,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translateY(${2 * Math.sin((frame + index * 13) / 29)}px) scale(${1 + iconPulse * 0.045})`,
          }}
        >
          <Icon color={data.color} progress={icon} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: -22,
          top: 46,
          width: 67,
          height: 316,
          transform: `scaleY(${tab})`,
          transformOrigin: "50% 0%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: data.color,
            clipPath:
              "polygon(0 5%, 16% 0, 100% 8%, 100% 92%, 16% 100%, 0 95%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 16,
            bottom: 16,
            width: 12,
            background: data.dark,
            clipPath: "polygon(0 0, 100% 5%, 100% 95%, 0 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 34,
            top: "50%",
            color: "#FFFFFF",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 27,
            fontWeight: 400,
            letterSpacing: 0.2,
            whiteSpace: "nowrap",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            opacity: interpolate(tab, [0.52, 0.9], [0, 1], clamp),
          }}
        >
          {data.label}
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const floorGlow =
    interpolate(frame, [18, 340], [0, 0.28], clamp) *
    interpolate(frame, [790, 898], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#F2F2F2",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 170,
          right: 130,
          top: 740,
          height: 160,
          borderRadius: "50%",
          opacity: floorGlow,
          background:
            "radial-gradient(ellipse at center, rgba(87,93,96,0.17) 0%, rgba(87,93,96,0.055) 42%, rgba(87,93,96,0) 72%)",
          filter: "blur(18px)",
        }}
      />

      {cards.map((card, index) => (
        <OptionCard
          key={card.label}
          data={card}
          index={index}
          frame={frame}
          fps={fps}
        />
      ))}
    </AbsoluteFill>
  );
};
