import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type IconName = "search" | "idea" | "strategy" | "process" | "goal";

type CardSpec = {
  color: string;
  dark: string;
  icon: IconName;
};

const CARDS: CardSpec[] = [
  {color: "#F15A2A", dark: "#C83C17", icon: "search"},
  {color: "#FFAE24", dark: "#D68600", icon: "idea"},
  {color: "#20B9B5", dark: "#0B8D8A", icon: "strategy"},
  {color: "#087A9F", dark: "#045A79", icon: "process"},
  {color: "#4D4D82", dark: "#34345F", icon: "goal"},
];

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const gearOutlinePath = ({
  cx,
  cy,
  teeth,
  rootRadius,
  tipRadius,
  rotation = -Math.PI / 2,
}: {
  cx: number;
  cy: number;
  teeth: number;
  rootRadius: number;
  tipRadius: number;
  rotation?: number;
}) => {
  const points: string[] = [];
  const step = (Math.PI * 2) / teeth;

  for (let tooth = 0; tooth < teeth; tooth++) {
    const center = rotation + tooth * step;
    const profile = [
      {offset: -0.5, radius: rootRadius},
      {offset: -0.31, radius: rootRadius},
      {offset: -0.2, radius: tipRadius},
      {offset: 0.2, radius: tipRadius},
      {offset: 0.31, radius: rootRadius},
      {offset: 0.5, radius: rootRadius},
    ];

    for (const point of profile) {
      const angle = center + point.offset * step;
      points.push(
        `${cx + Math.cos(angle) * point.radius},${cy + Math.sin(angle) * point.radius}`,
      );
    }
  }

  return `M ${points.join(" L ")} Z`;
};

const LineIcon: React.FC<{
  name: IconName;
  progress: number;
  accent: string;
}> = ({name, progress, accent}) => {
  const common = {
    fill: "none",
    stroke: "#666B6F",
    strokeWidth: 3.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  const iconStyle: React.CSSProperties = {
    opacity: progress,
    transform: `scale(${0.78 + progress * 0.22})`,
    transformOrigin: "50% 50%",
    filter: `drop-shadow(0 2px 1px rgba(255,255,255,.85))`,
  };

  const accentOpacity = interpolate(progress, [0.55, 1], [0, 0.34], clamp);

  if (name === "search") {
    return (
      <svg viewBox="0 0 100 100" width="66" height="66" style={iconStyle}>
        <circle cx="42" cy="42" r="19" {...common} />
        <path d="M56 56 78 78" {...common} strokeWidth={5} />
        <path d="M28 42a14 14 0 0 1 14-14" {...common} stroke={accent} opacity={accentOpacity} />
      </svg>
    );
  }

  if (name === "idea") {
    return (
      <svg viewBox="0 0 100 100" width="68" height="68" style={iconStyle}>
        <path d="M37 59c-7-5-11-13-10-22 1-12 11-22 24-22 13 0 23 10 24 23 0 8-4 16-11 21-4 3-5 6-5 10H42c0-4-1-7-5-10Z" {...common} />
        <path d="M43 76h16M46 83h10M50 3V-5M20 14l-6-7M80 14l6-7M16 43H6M84 43h10" {...common} />
        <path d="m42 45 7-9 5 8 7-9" {...common} stroke={accent} opacity={accentOpacity} />
      </svg>
    );
  }

  if (name === "strategy") {
    return (
      <svg viewBox="0 0 100 100" width="70" height="70" style={iconStyle}>
        <path d="M18 75h64M22 68V41h14v27M43 68V26h14v42M64 68V36h14v32" {...common} />
        <path d="M25 34c11-7 18-1 27-10 7-7 14-5 23-14" {...common} />
        <path d="m67 10 9-1-1 9" {...common} stroke={accent} opacity={accentOpacity} />
        <circle cx="29" cy="48" r="3" fill={accent} opacity={accentOpacity} />
        <circle cx="50" cy="34" r="3" fill={accent} opacity={accentOpacity} />
        <circle cx="71" cy="44" r="3" fill={accent} opacity={accentOpacity} />
      </svg>
    );
  }

  if (name === "process") {
    return (
      <svg viewBox="0 0 100 100" width="70" height="70" style={iconStyle}>
        <g transform={`rotate(${(1 - progress) * -18} 62 39)`}>
          <path
            d={gearOutlinePath({
              cx: 62,
              cy: 39,
              teeth: 10,
              rootRadius: 19.5,
              tipRadius: 25.5,
            })}
            {...common}
            fill="rgba(250,252,252,.96)"
          />
          <circle cx="62" cy="39" r="7.4" {...common} />
        </g>
        <g transform={`rotate(${(1 - progress) * 22} 34 67)`}>
          <path
            d={gearOutlinePath({
              cx: 34,
              cy: 67,
              teeth: 8,
              rootRadius: 13.8,
              tipRadius: 19.2,
              rotation: -Math.PI / 2 + Math.PI / 8,
            })}
            {...common}
            fill="rgba(250,252,252,.98)"
          />
          <circle
            cx="34"
            cy="67"
            r="5.2"
            {...common}
            stroke={accent}
            opacity={0.55 + accentOpacity}
          />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" width="70" height="70" style={iconStyle}>
      <circle cx="50" cy="50" r="35" {...common} />
      <circle cx="50" cy="50" r="24" {...common} />
      <circle cx="50" cy="50" r="13" {...common} />
      <circle cx="50" cy="50" r="4" fill={accent} opacity={0.7 * progress} />
      <path d="M50 50 76 24M69 24h7v7" {...common} stroke={accent} opacity={accentOpacity} />
    </svg>
  );
};

const Card: React.FC<{
  spec: CardSpec;
  index: number;
}> = ({spec, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enterStart = 34 + index * 31;
  const cardIn = spring({
    frame: frame - enterStart,
    fps,
    config: {damping: 16, stiffness: 105, mass: 0.82},
    durationInFrames: 62,
  });
  const ringIn = spring({
    frame: frame - enterStart - 15,
    fps,
    config: {damping: 13, stiffness: 125, mass: 0.66},
    durationInFrames: 52,
  });
  const iconIn = spring({
    frame: frame - enterStart - 31,
    fps,
    config: {damping: 17, stiffness: 145, mass: 0.55},
    durationInFrames: 44,
  });

  const reverseIndex = CARDS.length - 1 - index;
  const exitStart = 755 + reverseIndex * 24;
  const exit = interpolate(
    frame,
    [exitStart, exitStart + 52],
    [0, 1],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );

  const active = interpolate(frame, [205, 290, 675, 748], [0, 1, 1, 0], clamp);
  const floatY = Math.sin((frame + index * 21) / 42) * 3.2 * active;
  const ringBreathe = 1 + Math.sin((frame + index * 18) / 34) * 0.012 * active;
  const cardOpacity = cardIn * (1 - exit);
  const cardY = (1 - cardIn) * 128 + exit * 92 + floatY;
  const cardScale = (0.9 + cardIn * 0.1) * (1 - exit * 0.035);
  const ringExit = interpolate(exit, [0, 0.58, 1], [0, 0.05, 1], clamp);
  const shadowOpacity = interpolate(cardOpacity, [0, 1], [0, 0.22], clamp);

  const shimmer = interpolate(
    frame,
    [enterStart + 12, enterStart + 58],
    [-180, 360],
    clamp,
  );

  return (
    <div
      style={{
        position: "relative",
        width: 300,
        height: 615,
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${cardScale}) perspective(1100px) rotateX(${(1 - cardIn) * 7 - exit * 5}deg)`,
        transformOrigin: "50% 75%",
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: -20,
          height: 60,
          borderRadius: "0 0 30px 30px",
          background: `linear-gradient(180deg, ${spec.color}, ${spec.dark})`,
          boxShadow: `0 17px 23px rgba(55, 63, 71, ${shadowOpacity * 0.55})`,
          transform: `scaleX(${interpolate(cardIn, [0.25, 1], [0.58, 1], clamp)})`,
          transformOrigin: "50% 0%",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: 28,
          border: "2px solid rgba(255,255,255,.9)",
          background:
            "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(252,253,253,1) 58%, rgba(241,244,245,1) 100%)",
          boxShadow: `13px 18px 25px rgba(49, 58, 67, ${shadowOpacity}), inset 0 2px 1px rgba(255,255,255,.9), inset 0 -1px 0 rgba(158,169,177,.25)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -110,
            left: shimmer,
            width: 112,
            height: 850,
            opacity: 0.48,
            transform: "rotate(17deg)",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.72), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 25,
            right: 25,
            top: 235,
            height: 1,
            opacity: 0.22,
            background:
              "linear-gradient(90deg, transparent, rgba(119,128,134,.4), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 315,
            width: 130,
            height: 130,
            borderRadius: "50%",
            transform: "translateX(-50%)",
            opacity: 0.07,
            background: `radial-gradient(circle, ${spec.color} 0%, transparent 68%)`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          zIndex: 3,
          top: -84,
          left: 70,
          width: 160,
          height: 160,
          borderRadius: "50%",
          opacity: ringIn * (1 - ringExit),
          transform: `translateY(${(1 - ringIn) * -54 - ringExit * 48}px) scale(${(0.65 + ringIn * 0.35) * ringBreathe * (1 - ringExit * 0.14)}) rotate(${(1 - ringIn) * -14 + ringExit * 9}deg)`,
          background: `linear-gradient(145deg, ${spec.color} 8%, ${spec.dark} 100%)`,
          boxShadow: `0 17px 19px rgba(48,55,60,.27), 0 4px 0 rgba(255,255,255,.72), inset 0 3px 2px rgba(255,255,255,.34), inset 0 -4px 5px rgba(0,0,0,.16)`,
          willChange: "transform, opacity",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 28%, #FFFFFF 0%, #FAFBFB 52%, #E8EBEC 100%)",
            boxShadow:
              "inset 0 3px 3px rgba(255,255,255,.95), inset 0 -4px 8px rgba(112,122,128,.16), 0 1px 3px rgba(0,0,0,.2)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 35,
              height: 150,
              top: -16,
              left: shimmer / 4 - 24,
              transform: "rotate(20deg)",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent)",
            }}
          />
          <LineIcon name={spec.icon} progress={iconIn * (1 - exit)} accent={spec.color} />
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  const opening = interpolate(frame, [0, 28], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const cameraScale = interpolate(
    frame,
    [0, 260, 410, 610, 750, 860, 899],
    [1, 1, 1.018, 1.032, 1.02, 1, 1],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const cameraY = interpolate(
    frame,
    [0, 310, 560, 750, 860],
    [0, 0, -11, -7, 0],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const ambient = interpolate(frame, [0, 320, 600, 899], [0.05, 0.16, 0.18, 0.05], clamp);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#DDE6F2",
        backgroundImage:
          "radial-gradient(circle at 50% 42%, rgba(255,255,255,.52) 0%, rgba(231,238,247,.3) 40%, rgba(205,217,232,.42) 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -120,
          opacity: ambient,
          background:
            "radial-gradient(circle at 18% 38%, #FFFFFF 0%, transparent 27%), radial-gradient(circle at 82% 58%, #A8C2DD 0%, transparent 29%)",
          transform: `translateX(${Math.sin(frame / 110) * 18}px)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1712,
          height: 700,
          display: "flex",
          gap: 53,
          alignItems: "flex-start",
          opacity: opening,
          transform: `translate(-50%, -45%) translateY(${cameraY}px) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        {CARDS.map((card, index) => (
          <Card key={card.icon} spec={card} index={index} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 150px rgba(91,112,135,.12)",
        }}
      />
    </AbsoluteFill>
  );
};
