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
 * Icons: Lucide Static v1.27.0
 * Asset pages: https://lucide.dev/icons/
 * License: ISC — https://lucide.dev/license
 *
 * The five selected SVGs are embedded so rendering never depends on a
 * network request or an additional package.
 */

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const enterSpring = (
  frame: number,
  fps: number,
  start: number,
  duration = 54,
) =>
  spring({
    frame: frame - start,
    fps,
    durationInFrames: duration,
    config: {
      damping: 18,
      stiffness: 132,
      mass: 0.85,
    },
  });

const leaveSpring = (
  frame: number,
  fps: number,
  start: number,
  duration = 40,
) =>
  spring({
    frame: frame - start,
    fps,
    durationInFrames: duration,
    config: {
      damping: 20,
      stiffness: 150,
      mass: 0.78,
    },
  });

const eventPulse = (frame: number, start: number, duration: number) => {
  const progress = interpolate(
    frame,
    [start, start + duration],
    [0, 1],
    clamp,
  );
  return Math.sin(progress * Math.PI);
};

type IconName = "search" | "brain" | "rocket" | "settings" | "target";

type StageData = {
  number: string;
  label: string;
  icon: IconName;
  colorA: string;
  colorB: string;
  accent: string;
  glow: string;
};

const stages: StageData[] = [
  {
    number: "1",
    label: "RESEARCH",
    icon: "search",
    colorA: "#19CDB7",
    colorB: "#52E4D1",
    accent: "#23D8C4",
    glow: "rgba(35, 216, 196, 0.26)",
  },
  {
    number: "2",
    label: "IDEA",
    icon: "brain",
    colorA: "#20C7B7",
    colorB: "#55E0CE",
    accent: "#28CFC4",
    glow: "rgba(40, 207, 196, 0.25)",
  },
  {
    number: "3",
    label: "ASPIRATION",
    icon: "rocket",
    colorA: "#2AB2CE",
    colorB: "#59CADD",
    accent: "#39BBDD",
    glow: "rgba(57, 187, 221, 0.24)",
  },
  {
    number: "4",
    label: "PROCESS",
    icon: "settings",
    colorA: "#6687D4",
    colorB: "#8298E0",
    accent: "#7388D7",
    glow: "rgba(115, 136, 215, 0.24)",
  },
  {
    number: "5",
    label: "GOAL",
    icon: "target",
    colorA: "#9458C8",
    colorB: "#B874D5",
    accent: "#A660D0",
    glow: "rgba(166, 96, 208, 0.24)",
  },
];

type LucideIconProps = {
  name: IconName;
  active: number;
  time: number;
};

const LucideIcon: React.FC<LucideIconProps> = ({
  name,
  active,
  time,
}) => {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.72,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "search") {
    const scan = interpolate(active, [0, 1], [-1.3, 2.2], clamp);
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          transform={`translate(${scan} 0) rotate(${active * 3.5} 11 11)`}
        >
          <path d="m21 21-4.34-4.34" />
          <circle cx="11" cy="11" r="8" />
        </g>
        <circle
          cx="11"
          cy="11"
          r={6.2 + active * 2.4}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity={active * 0.22}
        />
      </svg>
    );
  }

  if (name === "brain") {
    const breathe = 1 + active * 0.055;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          transform={`translate(12 12) scale(${breathe}) translate(-12 -12)`}
        >
          <path d="M12 18V5" />
          <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
          <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
          <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
          <path d="M18 18a4 4 0 0 0 2-7.464" />
          <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
          <path d="M6 18a4 4 0 0 1-2-7.464" />
          <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
        </g>
        <circle
          cx="12"
          cy="11.5"
          r={3.3 + active * 2.8}
          fill="currentColor"
          opacity={active * 0.055}
        />
      </svg>
    );
  }

  if (name === "rocket") {
    const lift = active * -2.5;
    const tilt = -2 + active * 4;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          transform={`translate(0 ${lift}) rotate(${tilt} 12 12)`}
        >
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09" />
          <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05" />
        </g>
        <path
          d="M7.2 18.3 4.7 20.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity={active * 0.52}
          transform={`translate(${active * -1.2} ${active * 1.2})`}
        />
      </svg>
    );
  }

  if (name === "settings") {
    const rotation = interpolate(time, [0, 94], [0, 144], clamp);
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          transform={`translate(12 12) rotate(${rotation}) scale(${1 + active * 0.035}) translate(-12 -12)`}
        >
          <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
          <circle cx="12" cy="12" r="3" />
        </g>
        <circle
          cx="12"
          cy="12"
          r={5.4 + active * 3}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.65"
          opacity={active * 0.18}
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <g
        {...common}
        transform={`translate(12 12) scale(${1 + active * 0.055}) translate(-12 -12)`}
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </g>
      <circle
        cx="12"
        cy="12"
        r={2.1 + active * 5.9}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity={active * 0.24}
      />
    </svg>
  );
};

type ChevronProps = {
  item: StageData;
  progress: number;
  active: number;
};

const Chevron: React.FC<ChevronProps> = ({item, progress, active}) => {
  const unfold = interpolate(progress, [0, 1], [0.82, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 112,
        top: 54,
        width: 116,
        height: 408,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-22, 0], {
          ...clamp,
          easing: easeOut,
        })}px) scaleY(${unfold})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -6,
          top: 18,
          width: 98,
          height: 372,
          clipPath:
            "polygon(0 0, 72% 50%, 0 100%, 29% 100%, 100% 50%, 29% 0)",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.99) 0%, rgba(253,253,253,0.98) 42%, rgba(229,234,238,0.88) 100%)",
          filter:
            "drop-shadow(15px 12px 13px rgba(39, 55, 68, 0.16)) drop-shadow(-8px 0 12px rgba(39, 55, 68, 0.06))",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 14,
          top: 65,
          width: 52,
          height: 278,
          clipPath: "polygon(0 0, 100% 50%, 0 100%)",
          background:
            "linear-gradient(90deg, rgba(231,235,238,0.12), rgba(187,197,204,0.72))",
          opacity: 0.82,
          filter: "blur(0.35px)",
        }}
      />

      <svg
        viewBox="0 0 116 408"
        width="116"
        height="408"
        style={{position: "absolute", inset: 0, overflow: "visible"}}
        aria-hidden
      >
        <path
          d="M14 8 94 204 14 400"
          fill="none"
          stroke="rgba(255,255,255,0.98)"
          strokeWidth="12"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M14 8 94 204 14 400"
          fill="none"
          stroke={item.accent}
          strokeWidth={5.5 + active * 0.65}
          strokeLinecap="square"
          strokeLinejoin="miter"
          style={{
            filter: `drop-shadow(0 0 ${active * 8}px ${item.glow})`,
          }}
        />
        <path
          d="M40 10 112 204 40 398"
          fill="none"
          stroke="rgba(210,218,224,0.92)"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
};

type StageProps = {
  index: number;
  frame: number;
  fps: number;
  stageWidth: number;
};

const Stage: React.FC<StageProps> = ({
  index,
  frame,
  fps,
  stageWidth,
}) => {
  const item = stages[index];
  const enterStart = 22 + index * 48;
  const exitStart = 720 + (stages.length - 1 - index) * 29;

  const entered = enterSpring(frame, fps, enterStart);
  const numberIn = enterSpring(frame, fps, enterStart + 4, 58);
  const chevronIn = enterSpring(frame, fps, enterStart + 18, 46);
  const infoIn = enterSpring(frame, fps, enterStart + 33, 48);
  const leaving = leaveSpring(frame, fps, exitStart, 42);
  const visible = entered * (1 - leaving);
  const numberVisible = numberIn * (1 - leaving);
  const chevronVisible = chevronIn * (1 - leaving);
  const infoVisible = infoIn * (1 - leaving);

  const activeStart = 286 + index * 62;
  const active = eventPulse(frame, activeStart, 94) * visible;
  const stageLift =
    interpolate(entered, [0, 1], [46, 0], {
      ...clamp,
      easing: easeOut,
    }) +
    interpolate(leaving, [0, 1], [0, -36], {
      ...clamp,
      easing: easeInOut,
    });

  const numberX =
    interpolate(numberIn, [0, 1], [-48, 0], {
      ...clamp,
      easing: easeOut,
    }) +
    interpolate(leaving, [0, 1], [0, 28], {
      ...clamp,
      easing: easeInOut,
    });

  const iconTime = Math.max(0, frame - activeStart);
  const shine = interpolate(
    frame,
    [315 + index * 14, 560 + index * 14],
    [-35, 130],
    clamp,
  );

  return (
    <div
      style={{
        position: "relative",
        width: stageWidth,
        height: 520,
        opacity: visible,
        transform: `translateY(${stageLift}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 134,
          width: 138,
          height: 252,
          opacity: numberVisible,
          transform: `translateX(${numberX}px) scale(${0.91 + numberIn * 0.09})`,
          transformOrigin: "50% 60%",
          fontFamily:
            "Arial Black, Inter, Arial, Helvetica, ui-sans-serif, system-ui, sans-serif",
          fontSize: 272,
          fontWeight: 900,
          lineHeight: 0.78,
          letterSpacing: "-0.095em",
          color: item.colorA,
          backgroundImage: `linear-gradient(112deg, ${item.colorA} 0%, ${item.colorB} 42%, rgba(255,255,255,0.92) 50%, ${item.colorB} 58%, ${item.colorA} 100%)`,
          backgroundSize: "260% 100%",
          backgroundPosition: `${shine}% 50%`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 16px 16px ${item.glow})`,
          zIndex: 2,
        }}
      >
        {item.number}
      </div>

      <Chevron
        item={item}
        progress={chevronVisible}
        active={active}
      />

      <div
        style={{
          position: "absolute",
          left: 222,
          top: 171,
          width: 128,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: infoVisible,
          transform: `translateY(${interpolate(infoIn, [0, 1], [28, 0], {
            ...clamp,
            easing: easeOut,
          }) + interpolate(leaving, [0, 1], [0, -22], clamp)}px) scale(${0.88 + infoIn * 0.12})`,
          transformOrigin: "50% 25%",
          zIndex: 5,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 48,
            height: 48,
            color: "#283139",
            transform: `scale(${1 + active * 0.065})`,
            filter: `drop-shadow(0 7px 8px rgba(28, 39, 47, 0.11)) drop-shadow(0 0 ${active * 12}px ${item.glow})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -11,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${item.glow} 0%, transparent 72%)`,
              opacity: active,
              transform: `scale(${0.65 + active * 0.55})`,
            }}
          />
          <div style={{position: "absolute", inset: 0}}>
            <LucideIcon name={item.icon} active={active} time={iconTime} />
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            color: "#252B30",
            fontFamily:
              "Inter, Arial, Helvetica, ui-sans-serif, system-ui, sans-serif",
            fontSize: item.label === "ASPIRATION" ? 17.5 : 20,
            fontWeight: 650,
            letterSpacing: "0.015em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {item.label}
        </div>

        <div
          style={{
            marginTop: 13,
            width: 28 + active * 34,
            height: 2,
            borderRadius: 999,
            opacity: 0.46 + active * 0.42,
            background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`,
            boxShadow: `0 0 ${active * 10}px ${item.glow}`,
          }}
        />
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const totalFrames = durationInFrames || 900;

  const sceneWidth = Math.min(width * 0.928, 1782);
  const stageWidth = sceneWidth / stages.length;
  const sceneLeft = (width - sceneWidth) / 2;
  const sceneTop = (height - 520) / 2;

  const cameraIn = interpolate(frame, [235, 430], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const cameraOut = interpolate(frame, [625, 852], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const camera = cameraIn * (1 - cameraOut);
  const cameraScale = 1 + camera * 0.012;
  const cameraX =
    interpolate(frame, [235, 500, 680, 852], [7, -9, -7, 0], {
      ...clamp,
      easing: easeInOut,
    }) * camera;

  const ambient = Math.sin((frame / totalFrames) * Math.PI * 2);
  const shadowOpacity =
    interpolate(frame, [18, 136], [0, 1], clamp) *
    interpolate(frame, [790, 895], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 48%, #FFFFFF 0%, #FFFFFF 51%, #FAFBFC 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: width * 0.09,
          top: height * 0.285,
          width: width * 0.82,
          height: height * 0.43,
          borderRadius: "50%",
          opacity: 0.11 * shadowOpacity,
          filter: "blur(70px)",
          transform: `translateY(${ambient * 2}px)`,
          background:
            "linear-gradient(90deg, rgba(31,205,183,0.18), rgba(47,180,210,0.13), rgba(157,91,202,0.17))",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: sceneLeft,
          top: sceneTop,
          width: sceneWidth,
          height: 520,
          display: "flex",
          transform: `translateX(${cameraX}px) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {stages.map((stage, index) => (
          <Stage
            key={stage.label}
            index={index}
            frame={frame}
            fps={fps}
            stageWidth={stageWidth}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
