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
 * Icon source: Lucide Static v1.27.0
 * https://lucide.dev/icons/
 * License: ISC — https://lucide.dev/license
 *
 * The selected SVG paths are embedded so the render is deterministic and
 * does not require a network connection.
 */

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const routePath =
  "M 270 825 C 360 835 445 710 475 560 C 493 470 455 420 510 360 C 610 245 742 210 842 282 C 925 342 910 500 1032 530 C 1137 556 1080 682 1095 748 C 1228 895 1455 890 1535 704 C 1602 548 1510 474 1572 362 C 1627 263 1695 225 1770 184";

type IconName = "lightbulb" | "search" | "cog" | "clock" | "target";

type Stage = {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  color: string;
  color2: string;
  glow: string;
  icon: IconName;
  ringRotation: number;
  enter: number;
};

const stages: Stage[] = [
  {
    x: 270,
    y: 825,
    labelX: 425,
    labelY: 803,
    color: "#6BCB00",
    color2: "#A4E91B",
    glow: "rgba(107, 203, 0, 0.28)",
    icon: "lightbulb",
    ringRotation: -106,
    enter: 78,
  },
  {
    x: 500,
    y: 440,
    labelX: 615,
    labelY: 520,
    color: "#00B98D",
    color2: "#21D7A4",
    glow: "rgba(0, 185, 141, 0.27)",
    icon: "search",
    ringRotation: -36,
    enter: 180,
  },
  {
    x: 842,
    y: 282,
    labelX: 970,
    labelY: 126,
    color: "#06BFC8",
    color2: "#21DCE0",
    glow: "rgba(6, 191, 200, 0.27)",
    icon: "cog",
    ringRotation: -122,
    enter: 286,
  },
  {
    x: 1032,
    y: 705,
    labelX: 1190,
    labelY: 660,
    color: "#087FC4",
    color2: "#19A3E1",
    glow: "rgba(8, 127, 196, 0.27)",
    icon: "clock",
    ringRotation: -104,
    enter: 398,
  },
  {
    x: 1545,
    y: 430,
    labelX: 1622,
    labelY: 584,
    color: "#6900D1",
    color2: "#9600EB",
    glow: "rgba(105, 0, 209, 0.27)",
    icon: "target",
    ringRotation: -80,
    enter: 510,
  },
];

const progressSpring = (
  frame: number,
  fps: number,
  start: number,
  duration = 58,
) =>
  spring({
    frame: frame - start,
    fps,
    durationInFrames: duration,
    config: {
      damping: 17,
      stiffness: 118,
      mass: 0.82,
    },
  });

const pulse = (frame: number, start: number, duration: number) => {
  const p = interpolate(frame, [start, start + duration], [0, 1], clamp);
  return Math.sin(p * Math.PI);
};

type LucideIconProps = {
  name: IconName;
  color: string;
  active: number;
  frame: number;
};

const LucideIcon: React.FC<LucideIconProps> = ({
  name,
  color,
  active,
  frame,
}) => {
  const common = {
    fill: "none",
    stroke: "#172026",
    strokeWidth: 1.65,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "lightbulb") {
    const breathe = 1 + active * 0.055;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          transform={`translate(12 12) scale(${breathe}) translate(-12 -12)`}
        >
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </g>
        {[
          [12, 0.8, 12, 3.1],
          [3.5, 4, 5.2, 5.7],
          [20.5, 4, 18.8, 5.7],
          [2.1, 11, 4.5, 11],
          [21.9, 11, 19.5, 11],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="1.35"
            strokeLinecap="round"
            opacity={0.34 + active * 0.66}
          />
        ))}
        <path
          d="M9.2 14h5.6"
          stroke={color}
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity={0.5 + active * 0.5}
        />
      </svg>
    );
  }

  if (name === "search") {
    const focus = 1 + active * 0.045;
    const scanX = interpolate(active, [0, 1], [7.6, 13.8], clamp);
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          transform={`translate(11 11) scale(${focus}) translate(-11 -11)`}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.34-4.34" />
        </g>
        <path
          d={`M${scanX} 7.2v7.6`}
          fill="none"
          stroke={color}
          strokeWidth="1.55"
          strokeLinecap="round"
          opacity={active * 0.86}
          style={{filter: `drop-shadow(0 0 ${active * 3}px ${color})`}}
        />
      </svg>
    );
  }

  if (name === "cog") {
    const rotation = active * 26 + Math.sin(frame / 22) * active * 2.5;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g {...common} transform={`rotate(${rotation} 12 12)`}>
          <path d="M11 10.27 7 3.34" />
          <path d="m11 13.73-4 6.93" />
          <path d="M12 22v-2" />
          <path d="M12 2v2" />
          <path d="M14 12h8" />
          <path d="m17 20.66-1-1.73" />
          <path d="m17 3.34-1 1.73" />
          <path d="M2 12h2" />
          <path d="m20.66 17-1.73-1" />
          <path d="m20.66 7-1.73 1" />
          <path d="m3.34 17 1.73-1" />
          <path d="m3.34 7 1.73 1" />
          <circle cx="12" cy="12" r="8" />
        </g>
        <circle
          cx="12"
          cy="12"
          r={2 + active * 0.28}
          fill="rgba(255,255,255,0.96)"
          stroke={color}
          strokeWidth="1.9"
          style={{filter: `drop-shadow(0 0 ${active * 4}px ${color})`}}
        />
      </svg>
    );
  }

  if (name === "clock") {
    const handRotation = active * 115;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <circle {...common} cx="12" cy="12" r="10" />
        <g
          fill="none"
          stroke="#172026"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`rotate(${handRotation} 12 12)`}
        >
          <path d="M12 6v6l4 2" />
        </g>
        <path
          d="M12 6v6"
          stroke={color}
          strokeWidth="1.05"
          strokeLinecap="round"
          opacity={active * 0.8}
          transform={`rotate(${handRotation} 12 12)`}
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
        <circle cx="12" cy="12" r="2" fill={color} stroke={color} />
      </g>
      <circle
        cx="12"
        cy="12"
        r={2.2 + active * 7.4}
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity={active * 0.32}
      />
    </svg>
  );
};

type NodeProps = {
  item: Stage;
  index: number;
  frame: number;
  fps: number;
};

const Node: React.FC<NodeProps> = ({item, index, frame, fps}) => {
  const entered = progressSpring(frame, fps, item.enter);
  const iconIn = progressSpring(frame, fps, item.enter + 25, 46);
  const labelIn = progressSpring(frame, fps, item.enter + 38, 48);
  const exitStart = 758 + (stages.length - 1 - index) * 24;
  const leaving = progressSpring(frame, fps, exitStart, 44);
  const visible = Math.max(0, Math.min(1, entered * (1 - leaving)));
  const active =
    Math.min(
      1,
      pulse(frame, item.enter + 50, 86) +
        pulse(frame, 620 + index * 9, 110) * 0.58,
    ) * visible;
  const iconVisible = Math.max(0, Math.min(1, iconIn * (1 - leaving)));
  const labelVisible = Math.max(0, Math.min(1, labelIn * (1 - leaving)));
  const lift =
    interpolate(entered, [0, 1], [38, 0], {...clamp, easing: easeOut}) +
    interpolate(leaving, [0, 1], [0, -24], {...clamp, easing: easeInOut});
  const scale = 0.72 + visible * 0.28 + active * 0.018;
  const mainArc = Math.max(0.0001, 0.68 * visible);
  const grayArc = Math.max(0.0001, 0.145 * visible);
  const capArc = Math.max(0.0001, 0.085 * visible);
  const gradientId = `ring-gradient-${index}`;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: item.x - 112,
          top: item.y - 112,
          width: 224,
          height: 224,
          opacity: visible,
          transform: `translateY(${lift}px) scale(${scale})`,
          transformOrigin: "50% 50%",
          zIndex: 4,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 31,
            top: 35,
            width: 162,
            height: 162,
            borderRadius: "50%",
            background: "rgba(36, 48, 55, 0.18)",
            filter: "blur(16px)",
            transform: "translate(9px, 12px)",
          }}
        />
        <svg
          viewBox="0 0 224 224"
          width="224"
          height="224"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "visible",
            filter: `drop-shadow(0 11px 10px rgba(26, 39, 47, 0.17)) drop-shadow(0 0 ${active * 16}px ${item.glow})`,
          }}
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={item.color2} />
              <stop offset="0.58" stopColor={item.color} />
              <stop offset="1" stopColor={item.color} />
            </linearGradient>
          </defs>
          <circle
            cx="112"
            cy="112"
            r="96"
            fill="none"
            stroke="#BFC4C8"
            strokeWidth="20"
            pathLength="1"
            strokeDasharray={`${grayArc} ${1 - grayArc}`}
            transform={`rotate(${item.ringRotation + 224} 112 112)`}
          />
          <circle
            cx="112"
            cy="112"
            r="96"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="20"
            pathLength="1"
            strokeDasharray={`${mainArc} ${1 - mainArc}`}
            transform={`rotate(${item.ringRotation} 112 112)`}
          />
          <circle
            cx="112"
            cy="112"
            r="96"
            fill="none"
            stroke={item.color2}
            strokeWidth="20"
            pathLength="1"
            strokeDasharray={`${capArc} ${1 - capArc}`}
            transform={`rotate(${item.ringRotation + 278} 112 112)`}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            left: 36,
            top: 36,
            width: 152,
            height: 152,
            borderRadius: "50%",
            boxSizing: "border-box",
            background:
              "radial-gradient(circle at 42% 32%, #FFFFFF 0%, #FFFFFF 55%, #F3F5F6 100%)",
            border: "2px solid rgba(223, 227, 229, 0.9)",
            boxShadow:
              "inset 0 2px 3px rgba(255,255,255,0.96), 0 8px 16px rgba(28,42,50,0.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 75,
            top: 75,
            width: 74,
            height: 74,
            color: "#172026",
            opacity: iconVisible,
            transform: `translateY(${interpolate(iconIn, [0, 1], [18, 0], {
              ...clamp,
              easing: easeOut,
            })}px) scale(${0.72 + iconVisible * 0.28})`,
            filter: `drop-shadow(0 5px 5px rgba(22, 31, 37, 0.11)) drop-shadow(0 0 ${active * 10}px ${item.glow})`,
          }}
        >
          <LucideIcon
            name={item.icon}
            color={item.color}
            active={active}
            frame={frame}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: item.labelX,
          top: item.labelY,
          opacity: labelVisible,
          transform: `translateY(${interpolate(labelIn, [0, 1], [22, 0], {
            ...clamp,
            easing: easeOut,
          })}px) translateX(${interpolate(leaving, [0, 1], [0, 18], clamp)}px)`,
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            fontFamily:
              "Arial, Helvetica, ui-sans-serif, system-ui, sans-serif",
            fontSize: 35,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            color: "#161B1F",
            whiteSpace: "nowrap",
          }}
        >
          <span>STEP</span>
          <span style={{color: item.color}}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 12,
            width: 128,
            height: 4,
          }}
        >
          <div
            style={{
              width: 45,
              height: 3,
              borderRadius: 99,
              background: "#1C2226",
            }}
          />
          <div
            style={{
              width: interpolate(labelVisible, [0, 1], [0, 68], clamp),
              height: 3,
              borderRadius: 99,
              background: item.color,
              boxShadow: `0 0 ${active * 8}px ${item.glow}`,
            }}
          />
        </div>
      </div>
    </>
  );
};

type PaperPlaneProps = {
  frame: number;
  fps: number;
};

const PaperPlane: React.FC<PaperPlaneProps> = ({frame, fps}) => {
  const entered = progressSpring(frame, fps, 594, 52);
  const leaving = progressSpring(frame, fps, 748, 42);
  const visible = Math.max(0, Math.min(1, entered * (1 - leaving)));
  const fly = interpolate(entered, [0, 1], [-48, 0], {
    ...clamp,
    easing: easeOut,
  });
  const drift = Math.sin((frame - 594) / 15) * 3 * visible;
  const tilt = Math.sin((frame - 594) / 19) * 1.8 * visible;

  return (
    <div
      style={{
        position: "absolute",
        left: 1680,
        top: 122,
        width: 118,
        height: 118,
        opacity: visible,
        transform: `translate(${fly + leaving * 28}px, ${-fly * 0.42 + drift}px) rotate(${tilt + leaving * 8}deg) scale(${0.8 + visible * 0.2})`,
        transformOrigin: "50% 50%",
        zIndex: 5,
        color: "#11181D",
        filter: "drop-shadow(0 8px 8px rgba(20,31,37,0.13))",
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          fill="rgba(255,255,255,0.96)"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
          <path d="m21.854 2.147-10.94 10.939" fill="none" />
        </g>
      </svg>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const routeProgress = interpolate(frame, [54, 620], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.55, 0.05, 0.35, 0.98),
  });
  const routeFade = interpolate(frame, [810, 892], [1, 0], {
    ...clamp,
    easing: easeInOut,
  });
  const cameraIn = interpolate(frame, [560, 670], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const cameraOut = interpolate(frame, [690, 830], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const camera = cameraIn * (1 - cameraOut);
  const cameraScale = 1 + camera * 0.012;
  const cameraX = -7 * camera;
  const cameraY = 2 * camera;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 45%, #FFFFFF 0%, #FCFCFD 58%, #F7F8F9 100%)",
        fontFamily:
          "Arial, Helvetica, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            "radial-gradient(circle at 22% 24%, rgba(0,185,141,0.12) 0, transparent 18%), radial-gradient(circle at 77% 65%, rgba(105,0,209,0.08) 0, transparent 19%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <svg
          viewBox="0 0 1920 1080"
          width="1920"
          height="1080"
          style={{position: "absolute", inset: 0, overflow: "visible"}}
          aria-hidden
        >
          <defs>
            <mask id="route-reveal-mask">
              <rect width="1920" height="1080" fill="black" />
              <path
                d={routePath}
                pathLength="1"
                fill="none"
                stroke="white"
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0.0001, routeProgress)} ${Math.max(
                  0.0001,
                  1 - routeProgress,
                )}`}
              />
            </mask>
          </defs>
          <path
            d={routePath}
            fill="none"
            stroke="#13191D"
            strokeWidth="5.3"
            strokeLinecap="round"
            strokeDasharray="1 19"
            mask="url(#route-reveal-mask)"
            opacity={0.95 * routeFade}
          />
        </svg>

        {stages.map((item, index) => (
          <Node
            key={`${item.x}-${item.y}`}
            item={item}
            index={index}
            frame={frame}
            fps={fps}
          />
        ))}
        <PaperPlane frame={frame} fps={fps} />
      </div>

    </AbsoluteFill>
  );
};
