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
  progress: number;
};

type CardData = {
  number: string;
  eyebrow: string;
  label: string;
  color: string;
  colorDark: string;
  colorLight: string;
  icon: React.FC<IconProps>;
};

const clamp: Parameters<typeof interpolate>[3] = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
};

const iconPhases = (progress: number) => ({
  line: interpolate(progress, [0, 0.58], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  }),
  fill: interpolate(progress, [0.48, 1], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  }),
});

const EnergyIcon: React.FC<IconProps> = ({progress}) => {
  const {line, fill} = iconPhases(progress);
  const rayScale = interpolate(progress, [0.1, 0.76], [0.72, 1], clamp);

  return (
    <svg width="166" height="166" viewBox="0 0 166 166">
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={1 - fill * 0.72}
      >
        <circle
          cx="83"
          cy="83"
          r="52"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - line}
        />
        <path
          d="M92 35 L58 89 H80 L73 131 L109 72 H86 Z"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - line}
        />
      </g>
      <circle
        cx="83"
        cy="83"
        r={52 * rayScale}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="12"
        opacity={fill}
      />
      <path
        d="M92 35 L58 89 H80 L73 131 L109 72 H86 Z"
        fill="#FFFFFF"
        opacity={fill}
        transform={`translate(${83 * (1 - 0.88 - fill * 0.12)} ${83 * (1 - 0.88 - fill * 0.12)}) scale(${0.88 + fill * 0.12})`}
        style={{transformOrigin: "83px 83px"}}
      />
    </svg>
  );
};

// Geometry adapted from Lucide Icons (ISC License):
// https://lucide.dev/icons/recycle
// https://lucide.dev/icons/gauge
// https://lucide.dev/icons/chart-no-axes-combined
const RecycleIcon: React.FC<IconProps> = ({progress}) => {
  const {line, fill} = iconPhases(progress);
  const rotation = interpolate(progress, [0, 1], [-12, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const paths = [
    "M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5",
    "M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12",
    "m14 16-3 3 3 3",
    "M8.293 13.596 7.196 9.5 3.1 10.598",
    "m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843",
    "m13.378 9.633 4.096 1.098 1.097-4.096",
  ];

  return (
    <svg width="166" height="166" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10.35"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.45"
        opacity={fill}
      />
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`rotate(${rotation} 12 12)`}
        style={{filter: "drop-shadow(0 1.1px 1.6px rgba(0,48,40,0.2))"}}
      >
        {paths.map((path, index) => {
          const pathProgress = interpolate(
            line,
            [index * 0.055, 0.58 + index * 0.055],
            [0, 1],
            clamp,
          );
          return (
          <path
            key={path}
            d={path}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - pathProgress}
            strokeWidth={1.02 + fill * 0.42}
            opacity={0.8 + fill * 0.2}
          />
          );
        })}
      </g>
      <circle
        cx="12"
        cy="12"
        r="1.05"
        fill="rgba(255,255,255,0.2)"
        stroke="#FFFFFF"
        strokeWidth="0.32"
        opacity={fill}
      />
    </svg>
  );
};

const EfficiencyIcon: React.FC<IconProps> = ({progress}) => {
  const {line, fill} = iconPhases(progress);
  const needleRotation = interpolate(progress, [0.22, 1], [-58, 28], {
    ...clamp,
    easing: Easing.out(Easing.back(1.1)),
  });
  const ticks = [-62, -31, 0, 31, 62];

  return (
    <svg width="166" height="166" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10.35"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.45"
        opacity={fill}
      />
      <path
        d="M3.34 19a10 10 0 1 1 17.32 0"
        fill="none"
        stroke="rgba(255,255,255,0.24)"
        strokeWidth="1.38"
        strokeLinecap="round"
        opacity={fill}
      />
      <path
        d="M3.34 19a10 10 0 1 1 17.32 0"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1.04 + fill * 0.4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - line}
        style={{filter: "drop-shadow(0 1.1px 1.6px rgba(0,48,40,0.2))"}}
      />
      <g transform="translate(12 14)">
        {ticks.map((angle, index) => {
          const tickProgress = interpolate(
            line,
            [0.1 + index * 0.06, 0.54 + index * 0.055],
            [0, 1],
            clamp,
          );
          return (
            <line
              key={angle}
              x1="0"
              y1="-7.75"
              x2="0"
              y2="-6.45"
              stroke="#FFFFFF"
              strokeWidth="0.68"
              strokeLinecap="round"
              opacity={tickProgress}
              transform={`rotate(${angle})`}
            />
          );
        })}
      </g>
      <g transform={`rotate(${needleRotation} 12 14)`}>
        <line
          x1="12"
          y1="14"
          x2="12"
          y2="7.35"
          stroke="#FFFFFF"
          strokeWidth={0.84 + fill * 0.22}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - line}
          style={{filter: "drop-shadow(0 1px 1px rgba(0,48,40,0.22))"}}
        />
        <circle cx="12" cy="14" r="1.48" fill="#FFFFFF" opacity={fill} />
      </g>
      <circle
        cx="12"
        cy="14"
        r="1.18"
        fill="#FFFFFF"
        opacity={fill}
      />
      <circle
        cx="12"
        cy="14"
        r="0.48"
        fill="rgba(8,121,111,0.78)"
        opacity={fill}
      />
    </svg>
  );
};

const GrowthIcon: React.FC<IconProps> = ({progress}) => {
  const {line, fill} = iconPhases(progress);
  const bars = [
    {d: "M4 18.463V21", delay: 0.12},
    {d: "M8 14.656V21", delay: 0.2},
    {d: "M12 16V21", delay: 0.28},
    {d: "M16 14.639V21", delay: 0.36},
    {d: "M20 10.656V21", delay: 0.44},
  ];
  const trend = interpolate(progress, [0.08, 0.72], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const points = [
    {cx: 2, cy: 15},
    {cx: 9, cy: 8.354},
    {cx: 13, cy: 11.646},
    {cx: 22, cy: 3},
  ];

  return (
    <svg width="166" height="166" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10.35"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.45"
        opacity={fill}
      />
      {bars.map((bar) => {
        const barProgress = interpolate(
          progress,
          [bar.delay, Math.min(1, bar.delay + 0.42)],
          [0, 1],
          {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          },
        );
        return (
          <path
            key={bar.d}
            d={bar.d}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.02 + fill * 0.42}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - barProgress}
            opacity={0.82 + fill * 0.18}
          />
        );
      })}
      <path
        d="m2 15 6.647-6.646a.5.5 0 0 1 .707 0l3.292 3.292a.5.5 0 0 0 .708 0L22 3"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1.05 + fill * 0.38}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - trend}
        style={{filter: "drop-shadow(0 1.1px 1.6px rgba(0,48,40,0.2))"}}
      />
      <path
        d="M18.5 3H22v3.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1.05 + fill * 0.38}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - trend}
      />
      {points.map((point, index) => {
        const pointProgress = interpolate(
          fill,
          [index * 0.11, 0.55 + index * 0.09],
          [0, 1],
          clamp,
        );
        return (
          <circle
            key={`${point.cx}-${point.cy}`}
            cx={point.cx}
            cy={point.cy}
            r={0.55 + pointProgress * 0.18}
            fill="#FFFFFF"
            opacity={pointProgress}
          />
        );
      })}
    </svg>
  );
};

const cards: CardData[] = [
  {
    number: "01",
    eyebrow: "CLEAN",
    label: "ENERGY",
    color: "#0B8F77",
    colorDark: "#076454",
    colorLight: "#42C3A4",
    icon: EnergyIcon,
  },
  {
    number: "02",
    eyebrow: "CIRCULAR",
    label: "RECYCLE",
    color: "#079E8F",
    colorDark: "#057166",
    colorLight: "#52CCB8",
    icon: RecycleIcon,
  },
  {
    number: "03",
    eyebrow: "SMART",
    label: "EFFICIENCY",
    color: "#08A99A",
    colorDark: "#08796F",
    colorLight: "#61D2C1",
    icon: EfficiencyIcon,
  },
  {
    number: "04",
    eyebrow: "POSITIVE",
    label: "GROWTH",
    color: "#19A979",
    colorDark: "#0D7554",
    colorLight: "#66D1A6",
    icon: GrowthIcon,
  },
];

const CARD_WIDTH = 326;
const CARD_HEIGHT = 526;
const GAP = 38;
const GROUP_WIDTH = CARD_WIDTH * cards.length + GAP * (cards.length - 1);
const START_X = (1920 - GROUP_WIDTH) / 2;
const CARD_TOP = 263;

const SustainableCard: React.FC<{
  data: CardData;
  index: number;
  frame: number;
  fps: number;
}> = ({data, index, frame, fps}) => {
  const start = 36 + index * 96;
  const localFrame = Math.max(0, frame - start);
  const entrance = spring({
    frame: localFrame,
    fps,
    durationInFrames: 86,
    config: {
      damping: 15,
      mass: 0.82,
      stiffness: 92,
    },
  });
  const opacityIn = interpolate(frame, [start, start + 18], [0, 1], clamp);
  const exit = interpolate(frame, [824 + index * 4, 898], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const iconProgress = interpolate(
    frame,
    [start + 43, start + 128],
    [0, 1],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const copyProgress = interpolate(
    frame,
    [start + 88, start + 132],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );
  const cornerProgress = interpolate(
    frame,
    [start + 18, start + 64],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );
  const shimmerX = interpolate(frame, [602, 676], [-170, CARD_WIDTH + 170], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const shimmerOpacity = interpolate(
    frame,
    [590, 610, 660, 686],
    [0, 0.5, 0.5, 0],
    clamp,
  );
  const climaxGlow = interpolate(
    frame,
    [584, 620, 675, 708],
    [0, 1, 1, 0],
    clamp,
  );
  const floatY =
    Math.sin((frame + index * 18) / 34) *
    2.2 *
    interpolate(frame, [start + 110, start + 170], [0, 1], clamp);
  const Icon = data.icon;

  return (
    <div
      style={{
        position: "absolute",
        left: START_X + index * (CARD_WIDTH + GAP),
        top: CARD_TOP,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        opacity: opacityIn * exit,
        transform: `translateY(${(1 - entrance) * 178 + floatY}px) rotate(${(1 - entrance) * (index % 2 === 0 ? -2.1 : 2.1)}deg) scale(${0.9 + entrance * 0.1})`,
        transformOrigin: "50% 92%",
        filter: `drop-shadow(0 28px 25px rgba(13,75,64,${0.16 + climaxGlow * 0.08})) drop-shadow(0 8px 10px rgba(20,58,51,0.09))`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          overflow: "hidden",
          background: `linear-gradient(148deg, ${data.colorLight} 0%, ${data.color} 42%, ${data.colorDark} 118%)`,
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.42), inset 0 -70px 90px rgba(0,42,34,0.16), 0 0 ${climaxGlow * 32}px rgba(51,210,175,0.24)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            top: -205,
            right: -150,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.07) 42%, rgba(255,255,255,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: "50%",
            left: -145,
            bottom: -125,
            border: "1px solid rgba(255,255,255,0.13)",
          }}
        />

        {[0, 1, 2].map((ring) => (
          <div
            key={ring}
            style={{
              position: "absolute",
              left: 78 - ring * 13,
              top: 134 - ring * 13,
              width: 170 + ring * 26,
              height: 170 + ring * 26,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
              opacity: cornerProgress,
              transform: `scale(${0.84 + cornerProgress * 0.16})`,
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            top: 28,
            left: 29,
            right: 27,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.98)",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 31,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            {data.number}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.76)",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2.4,
            }}
          >
            <span>{data.eyebrow}</span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#FFFFFF",
                boxShadow: "0 0 12px rgba(255,255,255,0.75)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 143,
            height: 178,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${0.88 + iconProgress * 0.12})`,
          }}
        >
          <Icon progress={iconProgress} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 29,
            right: 29,
            bottom: 31,
            transform: `translateY(${(1 - copyProgress) * 24}px)`,
            opacity: copyProgress,
          }}
        >
          <div
            style={{
              width: 32,
              height: 3,
              borderRadius: 2,
              marginBottom: 16,
              background: "rgba(255,255,255,0.56)",
            }}
          />
          <div
            style={{
              color: "#FFFFFF",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: data.label === "EFFICIENCY" ? 27 : 32,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: data.label === "EFFICIENCY" ? 0.4 : 1.2,
            }}
          >
            {data.label}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: shimmerX,
            top: -70,
            width: 94,
            height: CARD_HEIGHT + 140,
            transform: "skewX(-16deg)",
            opacity: shimmerOpacity,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.84), rgba(255,255,255,0))",
            mixBlendMode: "screen",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          right: 18,
          top: 18,
          width: 40,
          height: 40,
          opacity: cornerProgress,
          transform: `scale(${cornerProgress}) rotate(${45 * (1 - cornerProgress)}deg)`,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path
            d="M4 20 H36 M20 4 V36"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />
          <circle
            cx="20"
            cy="20"
            r="7"
            fill="none"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cameraX = interpolate(
    frame,
    [0, 120, 350, 545, 690, 900],
    [34, 34, 10, -34, 0, 0],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const cameraScale = interpolate(
    frame,
    [0, 230, 520, 700],
    [1, 1.008, 1.018, 1],
    clamp,
  );
  const backgroundDrift = -cameraX * 0.34;
  const sceneExit = interpolate(frame, [824, 899], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const floorOpacity =
    interpolate(frame, [20, 380], [0, 0.52], clamp) * sceneExit;
  const climaxLine = interpolate(frame, [574, 652], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const climaxLineOut = interpolate(frame, [680, 730], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#EEF3F0",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${backgroundDrift}px)`,
          background:
            "radial-gradient(circle at 17% 19%, rgba(103,205,173,0.2) 0%, rgba(103,205,173,0) 28%), radial-gradient(circle at 82% 78%, rgba(29,156,131,0.13) 0%, rgba(29,156,131,0) 31%), linear-gradient(135deg, #F4F7F5 0%, #E8F0EC 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.21,
          transform: `translateX(${backgroundDrift * 1.4}px)`,
          backgroundImage:
            "radial-gradient(circle, rgba(17,102,83,0.28) 1.15px, transparent 1.15px)",
          backgroundSize: "42px 42px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, rgba(0,0,0,0.5) 45%, transparent 77%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 190,
          right: 190,
          top: 744,
          height: 138,
          borderRadius: "50%",
          opacity: floorOpacity,
          background:
            "radial-gradient(ellipse at center, rgba(20,85,69,0.28) 0%, rgba(20,85,69,0.08) 43%, rgba(20,85,69,0) 73%)",
          filter: "blur(20px)",
          transform: `translateX(${cameraX * 0.35}px)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 268,
          right: 268,
          top: 809,
          height: 2,
          opacity: climaxLine * climaxLineOut * 0.58,
          overflow: "hidden",
          background: "rgba(11,143,119,0.14)",
        }}
      >
        <div
          style={{
            width: `${climaxLine * 100}%`,
            height: "100%",
            margin: "0 auto",
            background:
              "linear-gradient(90deg, rgba(58,196,163,0), rgba(58,196,163,0.9), rgba(58,196,163,0))",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${cameraX}px) scale(${cameraScale})`,
          transformOrigin: "50% 54%",
        }}
      >
        {cards.map((card, index) => (
          <SustainableCard
            key={card.number}
            data={card}
            index={index}
            frame={frame}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
