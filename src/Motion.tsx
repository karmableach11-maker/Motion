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
 * https://lucide.dev/
 * License: ISC — https://lucide.dev/license
 *
 * The selected Lucide SVG geometry is embedded here so the render does not
 * depend on a network request or an additional icon package.
 */

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const reveal = (
  frame: number,
  fps: number,
  start: number,
  duration = 46,
) =>
  spring({
    frame: frame - start,
    fps,
    durationInFrames: duration,
    config: {
      damping: 17,
      stiffness: 145,
      mass: 0.82,
    },
  });

const fadeOut = (
  frame: number,
  fps: number,
  start: number,
  duration = 38,
) =>
  spring({
    frame: frame - start,
    fps,
    durationInFrames: duration,
    config: {
      damping: 18,
      stiffness: 150,
      mass: 0.8,
    },
  });

const pulse = (frame: number, start: number, duration: number) => {
  const p = interpolate(frame, [start, start + duration], [0, 1], clamp);
  return Math.sin(p * Math.PI);
};

type IconName =
  | "search"
  | "idea"
  | "strategy"
  | "process"
  | "time"
  | "goal";

type IconProps = {
  name: IconName;
  frame: number;
  activeStart: number;
  visible: number;
};

const Icon: React.FC<IconProps> = ({
  name,
  frame,
  activeStart,
  visible,
}) => {
  const active = pulse(frame, activeStart, 92) * visible;
  const time = Math.max(0, frame - activeStart);
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "search") {
    const scanX = interpolate(active, [0, 1], [-1.8, 2.8]);
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          strokeWidth={1.65}
          transform={`translate(${scanX} 0) rotate(${active * 3} 11 11)`}
        >
          <circle cx="11" cy="11" r="7.65" />
          <path d="m21 21-4.55-4.55" />
        </g>
        <circle
          cx="11"
          cy="11"
          r={5.1 + active * 1.15}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity={0.13 + active * 0.34}
        />
      </svg>
    );
  }

  if (name === "idea") {
    const ray = 0.55 + active * 0.45;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          strokeWidth={1.55}
          transform={`translate(12 12) scale(${1 + active * 0.045}) translate(-12 -12)`}
        >
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <g opacity={ray}>
            <path d="M12 1V0" />
            <path d="m4.2 3.2-.8-.8" />
            <path d="M2 9H.8" />
            <path d="m19.8 3.2.8-.8" />
            <path d="M22 9h1.2" />
          </g>
        </g>
        <circle
          cx="12"
          cy="8.3"
          r={2.4 + active * 0.8}
          fill="currentColor"
          opacity={active * 0.1}
        />
      </svg>
    );
  }

  if (name === "strategy") {
    const tilt = -3 + active * 6;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          strokeWidth={1.45}
          transform={`rotate(${tilt} 12 13)`}
        >
          <path d="M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
          <path d="M16.5 18c1-2 2.5-5 2.5-9a7 7 0 0 0-7-7H6.635a1 1 0 0 0-.768 1.64L7 5l-2.32 5.802a2 2 0 0 0 .95 2.526l2.87 1.456" />
          <path d="m15 5 1.425-1.425" />
          <path d="m17 8 1.53-1.53" />
          <path d="M9.713 12.185 7 18" />
        </g>
        <path
          d="M3.5 16.3 2 14.8l1.5-1.5"
          {...common}
          strokeWidth="1"
          opacity={active * 0.6}
        />
      </svg>
    );
  }

  if (name === "process") {
    const rotation = time * 0.62;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g
          {...common}
          strokeWidth={1.5}
          transform={`rotate(${rotation} 12 12)`}
        >
          <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
          <circle cx="12" cy="12" r="3" />
        </g>
        <circle
          cx="12"
          cy="12"
          r={5.2 + active * 2.6}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity={active * 0.28}
        />
      </svg>
    );
  }

  if (name === "time") {
    const handRotation = active * 154;
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <g {...common} strokeWidth={1.5}>
          <path d="M10 2h4" />
          <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6" />
          <path d="M9 17H4v5" />
        </g>
        <g
          {...common}
          strokeWidth={1.6}
          transform={`rotate(${handRotation} 12 13)`}
        >
          <path d="M12 13V9" />
          <path d="M12 13h3" />
        </g>
        <circle cx="12" cy="13" r="1" fill="currentColor" opacity="0.9" />
      </svg>
    );
  }

  const arrowProgress = ease(interpolate(active, [0, 1], [0, 1]));
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <g {...common} strokeWidth={1.45}>
        <circle cx="11" cy="13" r="8.2" />
        <circle cx="11" cy="13" r="4.75" />
        <circle cx="11" cy="13" r="1.45" />
      </g>
      <g
        {...common}
        strokeWidth={1.6}
        transform={`translate(${(1 - arrowProgress) * 4} ${-(1 - arrowProgress) * 4})`}
        opacity={0.5 + arrowProgress * 0.5}
      >
        <path d="M20.8 3.2 11.2 12.8" />
        <path d="M17.5 3.2h3.3v3.3" />
      </g>
      <circle
        cx="11"
        cy="13"
        r={1.6 + active * 2.1}
        fill="currentColor"
        opacity={active * 0.14}
      />
    </svg>
  );
};

const panels: Array<{
  label: string;
  icon: IconName;
  color: string;
  shade: string;
  glow: string;
}> = [
  {
    label: "RESEARCH",
    icon: "search",
    color: "#514BB5",
    shade: "#3D379A",
    glow: "#716BDD",
  },
  {
    label: "IDEA",
    icon: "idea",
    color: "#3E78C9",
    shade: "#2C5FAA",
    glow: "#66A0EB",
  },
  {
    label: "STRATEGY",
    icon: "strategy",
    color: "#3A9DCE",
    shade: "#287CAD",
    glow: "#6BC9EE",
  },
  {
    label: "PROCESS",
    icon: "process",
    color: "#35BEC4",
    shade: "#249DA5",
    glow: "#64E2E1",
  },
  {
    label: "TIME",
    icon: "time",
    color: "#39BE97",
    shade: "#279B78",
    glow: "#6DE2BD",
  },
  {
    label: "GOAL",
    icon: "goal",
    color: "#92CB38",
    shade: "#73AA24",
    glow: "#B9EA60",
  },
];

type PanelProps = {
  index: number;
  frame: number;
  fps: number;
  panelWidth: number;
  panelHeight: number;
};

const Panel: React.FC<PanelProps> = ({
  index,
  frame,
  fps,
  panelWidth,
  panelHeight,
}) => {
  const item = panels[index];
  const enterStart = 26 + index * 28;
  const exitStart = 720 + (panels.length - 1 - index) * 22;
  const entered = reveal(frame, fps, enterStart);
  const leaving = fadeOut(frame, fps, exitStart);
  const visible = entered * (1 - leaving);
  const content = reveal(frame, fps, enterStart + 15, 40) * (1 - leaving);
  const activeStart = 228 + index * 66;
  const active = pulse(frame, activeStart, 92) * visible;
  const rise = interpolate(entered, [0, 1], [92, 0], {
    ...clamp,
    easing: ease,
  });
  const exitY = interpolate(leaving, [0, 1], [0, -56], {
    ...clamp,
    easing: ease,
  });
  const sheen = interpolate(
    frame,
    [activeStart - 18, activeStart + 58],
    [-panelWidth * 0.8, panelWidth * 1.35],
    clamp,
  );

  return (
    <div
      style={{
        position: "relative",
        width: panelWidth,
        height: panelHeight,
        opacity: visible,
        transform: `translateY(${rise + exitY}px) scaleY(${0.96 + entered * 0.04})`,
        transformOrigin: "50% 100%",
        overflow: "hidden",
        background: `linear-gradient(150deg, ${item.glow} 0%, ${item.color} 31%, ${item.color} 67%, ${item.shade} 140%)`,
        boxShadow:
          index === 0
            ? "0 24px 46px rgba(28, 52, 91, 0.16)"
            : `inset 16px 0 22px -17px rgba(20, 45, 74, 0.75), 0 24px 46px rgba(28, 52, 91, 0.12)`,
        zIndex: index + 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.1), transparent 42%, rgba(8,38,60,0.05))",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: -90,
          left: sheen,
          width: 88,
          height: panelHeight + 180,
          transform: "rotate(12deg)",
          opacity: active * 0.32,
          filter: "blur(3px)",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.56), transparent)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 118,
          width: 88,
          height: 88,
          color: "white",
          opacity: content,
          transform: `translate(-50%, ${interpolate(content, [0, 1], [22, 0], clamp)}px) scale(${0.82 + content * 0.18 + active * 0.025})`,
          filter: `drop-shadow(0 8px 12px rgba(8, 40, 61, 0.13)) drop-shadow(0 0 ${active * 16}px rgba(255,255,255,0.62))`,
        }}
      >
        <Icon
          name={item.icon}
          frame={frame}
          activeStart={activeStart}
          visible={visible}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 252,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          opacity: content,
          transform: `translateY(${interpolate(content, [0, 1], [17, 0], clamp)}px)`,
          fontFamily:
            "Inter, Arial, Helvetica, ui-sans-serif, system-ui, sans-serif",
          fontSize: 25,
          fontWeight: 650,
          letterSpacing: "0.012em",
          textShadow: "0 2px 6px rgba(13, 50, 70, 0.12)",
        }}
      >
        {item.label}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 310,
          width: 42 + active * 22,
          height: 2,
          transform: "translateX(-50%)",
          opacity: (0.22 + active * 0.45) * content,
          borderRadius: 999,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: -10,
          top: 0,
          width: 15,
          height: "100%",
          opacity: index === 0 ? 0 : 0.28,
          background:
            "linear-gradient(90deg, rgba(13,49,72,0.38), rgba(13,49,72,0))",
        }}
      />
    </div>
  );
};

type ArrowButtonProps = {
  index: number;
  frame: number;
  fps: number;
  panelWidth: number;
  panelHeight: number;
};

const ArrowButton: React.FC<ArrowButtonProps> = ({
  index,
  frame,
  fps,
  panelWidth,
  panelHeight,
}) => {
  const enterStart = 72 + index * 28;
  const exitStart = 742 + (panels.length - 2 - index) * 22;
  const entered = reveal(frame, fps, enterStart, 36);
  const leaving = fadeOut(frame, fps, exitStart, 30);
  const visible = entered * (1 - leaving);
  const eventPulse = pulse(frame, 260 + index * 66, 74);
  const buttonSize = 43;

  return (
    <div
      style={{
        position: "absolute",
        left: panelWidth * (index + 1) - buttonSize / 2,
        top: panelHeight * 0.5 - buttonSize / 2,
        width: buttonSize,
        height: buttonSize,
        borderRadius: "50%",
        zIndex: 30,
        opacity: visible,
        transform: `scale(${0.55 + entered * 0.45 + eventPulse * 0.1})`,
        background: "#FFFFFF",
        boxShadow:
          "0 8px 18px rgba(26, 67, 91, 0.24), 0 2px 5px rgba(26, 67, 91, 0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        style={{
          color: panels[index].color,
          transform: `translateX(${eventPulse * 2}px)`,
        }}
        aria-hidden
      >
        <path
          d="m9 6 6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const total = durationInFrames || 900;

  const sceneWidth = Math.min(width * 0.906, 1740);
  const panelWidth = sceneWidth / panels.length;
  const panelHeight = Math.min(height * 0.5, 540);
  const sceneLeft = (width - sceneWidth) / 2;
  const sceneTop = (height - panelHeight) / 2 + 8;

  const cameraIn = interpolate(frame, [175, 390], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const cameraOut = interpolate(frame, [610, 815], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const camera = cameraIn * (1 - cameraOut);
  const cameraScale = 1 + camera * 0.014;
  const cameraX = Math.sin((frame / total) * Math.PI * 2) * 6 * camera;

  const shadowOpacity =
    interpolate(frame, [18, 120], [0, 1], clamp) *
    interpolate(frame, [790, 880], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 44%, #ffffff 0%, #fbfcfe 48%, #f5f7fa 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: sceneLeft + 50,
          top: sceneTop + panelHeight - 2,
          width: sceneWidth - 100,
          height: 64,
          borderRadius: "50%",
          opacity: shadowOpacity * 0.35,
          transform: `scaleX(${cameraScale}) translateX(${cameraX}px)`,
          filter: "blur(24px)",
          background:
            "radial-gradient(ellipse at center, rgba(34,67,89,0.42), rgba(34,67,89,0) 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: sceneLeft,
          top: sceneTop,
          width: sceneWidth,
          height: panelHeight,
          display: "flex",
          transform: `translateX(${cameraX}px) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {panels.map((_, index) => (
          <Panel
            key={panels[index].label}
            index={index}
            frame={frame}
            fps={fps}
            panelWidth={panelWidth}
            panelHeight={panelHeight}
          />
        ))}

        {panels.slice(0, -1).map((_, index) => (
          <ArrowButton
            key={`arrow-${panels[index].label}`}
            index={index}
            frame={frame}
            fps={fps}
            panelWidth={panelWidth}
            panelHeight={panelHeight}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
