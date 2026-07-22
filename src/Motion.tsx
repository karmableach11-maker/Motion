import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Point = {x: number; y: number};
type Transit = {
  start: number;
  end: number;
  pingPong?: boolean;
};

type IconName =
  | "files"
  | "database"
  | "cloud"
  | "web"
  | "context"
  | "reason"
  | "plan"
  | "memory"
  | "guard"
  | "tool"
  | "verify"
  | "result";

const W = 1920;
const H = 1080;
const DURATION = 15;

const COLORS = {
  bg: "#020916",
  bgSoft: "#06182a",
  panel: "#07192b",
  line: "#173754",
  text: "#edf8ff",
  muted: "#7190aa",
  blue: "#168bff",
  cyan: "#2bd8ff",
  violet: "#8c72ff",
  mint: "#48e1a7",
  amber: "#ffc76a",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const alpha = (hex: string, opacity: number) => {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
};

const mixHex = (from: string, to: string, amount: number) => {
  const progress = Math.max(0, Math.min(1, amount));
  const parse = (hex: string) => {
    const clean = hex.replace("#", "");
    return [
      Number.parseInt(clean.slice(0, 2), 16),
      Number.parseInt(clean.slice(2, 4), 16),
      Number.parseInt(clean.slice(4, 6), 16),
    ];
  };
  const a = parse(from);
  const b = parse(to);
  return `rgb(${a.map((channel, index) => Math.round(channel + (b[index] - channel) * progress)).join(", ")})`;
};

const ease = (value: number) => Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, value)));

const ramp = (time: number, start: number, end: number) =>
  interpolate(time, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const windowStrength = (time: number, start: number, end: number, feather = 0.22) => {
  const enter = interpolate(time, [start, start + feather], [0, 1], clamp);
  const exit = interpolate(time, [end - feather, end], [1, 0], clamp);
  return Math.min(enter, exit);
};

const routeLength = (points: Point[]) =>
  points.slice(1).reduce((sum, point, index) => {
    const previous = points[index];
    return sum + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);

const pointOnRoute = (points: Point[], rawProgress: number): Point => {
  const progress = Math.max(0, Math.min(1, rawProgress));
  const total = routeLength(points);
  let remaining = progress * total;

  for (let index = 1; index < points.length; index++) {
    const a = points[index - 1];
    const b = points[index];
    const segment = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= segment || index === points.length - 1) {
      const local = segment === 0 ? 0 : remaining / segment;
      return {
        x: a.x + (b.x - a.x) * local,
        y: a.y + (b.y - a.y) * local,
      };
    }
    remaining -= segment;
  }

  return points[points.length - 1];
};

const pointsString = (points: Point[]) => points.map((point) => `${point.x},${point.y}`).join(" ");

const deterministicParticles = Array.from({length: 42}, (_, index) => ({
  x: 560 + ((index * 197) % 1270),
  y: 130 + ((index * 113) % 800),
  size: 1 + (index % 3) * 0.7,
  phase: (index * 0.61) % (Math.PI * 2),
  opacity: 0.08 + (index % 5) * 0.025,
}));

const DataPacket: React.FC<{
  points: Point[];
  transit: Transit;
  color: string;
  time: number;
  delay?: number;
}> = ({points, transit, color, time, delay = 0}) => {
  const duration = transit.end - transit.start;
  const raw = interpolate(time, [transit.start + delay, transit.end + delay], [0, 1], clamp);
  const active = windowStrength(
    time,
    transit.start + delay,
    transit.end + delay,
    Math.min(0.12, duration * 0.22),
  );
  const progress = transit.pingPong ? (raw <= 0.5 ? raw * 2 : (1 - raw) * 2) : raw;
  const position = pointOnRoute(points, ease(progress));
  const trailPosition = pointOnRoute(points, ease(Math.max(0, progress - 0.025)));

  if (active <= 0) return null;

  return (
    <g opacity={active}>
      <line
        x1={trailPosition.x}
        y1={trailPosition.y}
        x2={position.x}
        y2={position.y}
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        opacity={0.32}
        filter="url(#routeGlow)"
      />
      <circle cx={position.x} cy={position.y} r={9} fill={alpha(color, 0.16)} />
      <circle cx={position.x} cy={position.y} r={5.2} fill={color} filter="url(#routeGlow)" />
      <circle cx={position.x - 1.5} cy={position.y - 1.5} r={1.8} fill="#ffffff" />
    </g>
  );
};

const NetworkRoute: React.FC<{
  points: Point[];
  transits: Transit[];
  color?: string;
  time: number;
  finalHold: number;
  packets?: number;
  subtle?: boolean;
}> = ({
  points,
  transits,
  color = COLORS.cyan,
  time,
  finalHold,
  packets = 1,
  subtle = false,
}) => {
  const length = routeLength(points);
  const firstStart = Math.min(...transits.map((transit) => transit.start));
  const reveal = ramp(time, firstStart - 0.3, firstStart + 0.22);
  const live = Math.max(
    ...transits.map((transit) => windowStrength(time, transit.start - 0.12, transit.end + 0.24, 0.2)),
    finalHold * (subtle ? 0.34 : 0.58),
  );
  const dashOffset = -((time * 64) % 38);

  return (
    <g>
      <polyline
        points={pointsString(points)}
        fill="none"
        stroke={COLORS.line}
        strokeWidth={subtle ? 3 : 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.36 + reveal * 0.32}
      />
      <polyline
        points={pointsString(points)}
        fill="none"
        stroke={color}
        strokeWidth={subtle ? 3 : 4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - reveal)}
        opacity={0.24 + live * 0.72}
        filter="url(#routeGlow)"
      />
      <polyline
        points={pointsString(points)}
        fill="none"
        stroke="#dff9ff"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 30"
        strokeDashoffset={dashOffset}
        opacity={live * 0.58}
      />
      {transits.flatMap((transit, transitIndex) =>
        Array.from({length: packets}, (_, packetIndex) => (
          <DataPacket
            key={`${transitIndex}-${packetIndex}`}
            points={points}
            transit={transit}
            color={color}
            time={time}
            delay={packetIndex * 0.11}
          />
        )),
      )}
    </g>
  );
};

const Icon: React.FC<{
  name: IconName;
  active: number;
  time: number;
  color: string;
}> = ({name, active, time, color}) => {
  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const pulse = 1 + Math.sin(time * 6) * 0.035 * active;

  const content = (() => {
    switch (name) {
      case "files":
        return (
          <g>
            <path d="M10 22h19l6 7h27v28H10z" {...strokeProps} />
            <path d="M10 29h52" {...strokeProps} opacity={0.55} />
            <path d="M37 38h15M37 45h11" {...strokeProps} strokeWidth={2.5} opacity={0.8} />
          </g>
        );
      case "database":
        return (
          <g transform={`translate(0 ${Math.sin(time * 5) * active * 1.2})`}>
            <ellipse cx="36" cy="18" rx="22" ry="8" {...strokeProps} />
            <path d="M14 18v13c0 4.5 9.8 8 22 8s22-3.5 22-8V18" {...strokeProps} />
            <path d="M14 31v13c0 4.5 9.8 8 22 8s22-3.5 22-8V31" {...strokeProps} />
            <path d="M14 44v9c0 4.5 9.8 8 22 8s22-3.5 22-8v-9" {...strokeProps} />
          </g>
        );
      case "cloud":
        return (
          <g>
            <path d="M19 48h35a10 10 0 0 0 1-20 17 17 0 0 0-32-2 11 11 0 0 0-4 22z" {...strokeProps} />
            <circle cx="27" cy="57" r="3" fill="currentColor" />
            <circle cx="45" cy="57" r="3" fill="currentColor" />
            <path d="M36 48v9M27 57h18" {...strokeProps} strokeWidth={2.4} />
          </g>
        );
      case "web":
        return (
          <g transform={`rotate(${active * Math.sin(time * 2.2) * 3} 36 36)`}>
            <circle cx="36" cy="36" r="25" {...strokeProps} />
            <path d="M11 36h50M36 11c9 8 13 16 13 25S45 53 36 61M36 11c-9 8-13 16-13 25s4 17 13 25" {...strokeProps} strokeWidth={2.6} />
            <path d="M17 24h38M17 48h38" {...strokeProps} strokeWidth={2.2} opacity={0.7} />
          </g>
        );
      case "context": {
        const scanX = 20 + ((time * 18) % 30);
        return (
          <g>
            <circle cx="31" cy="31" r="17" {...strokeProps} />
            <path d="M43 43l16 16" {...strokeProps} strokeWidth={5} />
            <circle cx="25" cy="29" r="2.7" fill="currentColor" />
            <circle cx="34" cy="24" r="2.7" fill="currentColor" />
            <circle cx="38" cy="35" r="2.7" fill="currentColor" />
            <line x1={scanX} y1="17" x2={scanX} y2="45" stroke={color} strokeWidth={1.8} opacity={active * 0.8} />
          </g>
        );
      }
      case "reason":
        return (
          <g transform={`scale(${pulse})`} style={{transformOrigin: "36px 36px"}}>
            <path d="M36 8l23 14v28L36 64 13 50V22z" {...strokeProps} />
            <g transform={`rotate(${time * 28 * active} 36 36)`}>
              <circle cx="36" cy="19" r="4" fill="currentColor" />
              <circle cx="52" cy="45" r="4" fill="currentColor" />
              <circle cx="20" cy="45" r="4" fill="currentColor" />
            </g>
            <circle cx="36" cy="36" r="7" fill={alpha(color, 0.2 + active * 0.35)} stroke="currentColor" strokeWidth={3} />
            <path d="M36 29V19M42 39l10 6M30 39l-10 6" {...strokeProps} strokeWidth={2.5} />
          </g>
        );
      case "plan":
        return (
          <g>
            <circle cx="18" cy="20" r="4" fill="currentColor" />
            <path d="M22 20h12c4 0 6 2 6 6v22" {...strokeProps} />
            <path d="M40 33h13M40 48h13" {...strokeProps} />
            <path d="M52 28l5 5-5 5M52 43l5 5-5 5" {...strokeProps} />
            <path d="M14 43l5 5 9-11" {...strokeProps} stroke={color} />
          </g>
        );
      case "memory":
        return (
          <g>
            <ellipse cx="33" cy="20" rx="19" ry="7" {...strokeProps} />
            <path d="M14 20v11c0 4 8.5 7 19 7s19-3 19-7V20M14 31v11c0 4 8.5 7 19 7 4 0 7.6-.4 10.5-1.3" {...strokeProps} />
            <circle cx="50" cy="49" r="12" fill={alpha(color, 0.12)} stroke="currentColor" strokeWidth={3} />
            <path d="M50 43v7l5 3" {...strokeProps} strokeWidth={2.5} />
          </g>
        );
      case "guard":
        return (
          <g>
            <path d="M36 9l23 9v16c0 14-8.5 24-23 30C21.5 58 13 48 13 34V18z" {...strokeProps} />
            <path d="M24 36l8 8 17-18" {...strokeProps} stroke={color} strokeWidth={4} />
            <path d="M21 20h30" {...strokeProps} strokeWidth={2} opacity={0.5} />
          </g>
        );
      case "tool": {
        const opening = 2 + active * 3;
        return (
          <g>
            <path d={`M${25 - opening} 20L9 36l${16 - opening} 16M${47 + opening} 20l16 16-16 16`} {...strokeProps} strokeWidth={4} />
            <path d="M42 13L29 59" {...strokeProps} opacity={0.68} />
            <path d="M38 26l-5 12h7l-5 12 15-17h-8l4-7z" fill={color} opacity={0.32 + active * 0.68} />
          </g>
        );
      }
      case "verify":
        return (
          <g transform={`rotate(${active * time * 8} 36 36)`}>
            <circle cx="36" cy="36" r="26" {...strokeProps} />
            <circle cx="36" cy="36" r="17" {...strokeProps} strokeWidth={2.4} opacity={0.68} />
            <path d="M24 36l8 8 17-18" {...strokeProps} stroke={color} strokeWidth={4} />
            <path d="M36 7v7M36 58v7M7 36h7M58 36h7" {...strokeProps} strokeWidth={2.2} />
          </g>
        );
      case "result":
        return (
          <g>
            <rect x="12" y="15" width="48" height="42" rx="8" {...strokeProps} />
            <path d="M22 36l8 8 17-18" {...strokeProps} stroke={color} strokeWidth={4} />
            <g transform={`rotate(${time * active * 20} 55 15)`}>
              <path d="M55 5v20M45 15h20" {...strokeProps} stroke={color} strokeWidth={2.3} />
            </g>
          </g>
        );
      default:
        return null;
    }
  })();

  return (
    <svg
      viewBox="0 0 72 72"
      style={{
        width: "100%",
        height: "100%",
        color,
        overflow: "visible",
      }}
    >
      {content}
    </svg>
  );
};

const WorkflowNode: React.FC<{
  center: Point;
  width?: number;
  height?: number;
  label: string;
  detail: string;
  icon: IconName;
  accent: string;
  active: number;
  appear: number;
  time: number;
  frame: number;
  fps: number;
  index: string;
}> = ({
  center,
  width = 146,
  height = 142,
  label,
  detail,
  icon,
  accent,
  active,
  appear,
  time,
  frame,
  fps,
  index,
}) => {
  const settle = frame < appear * fps
    ? 0
    : spring({
        frame: frame - appear * fps,
        fps,
        config: {damping: 15, stiffness: 115, mass: 0.75},
        durationInFrames: 42,
      });
  const scale = 0.82 + settle * 0.18 + active * 0.025;
  const cardOpacity = interpolate(settle, [0, 0.18, 1], [0, 0.45, 1], clamp);
  const liveColor = mixHex("#7597b6", accent, active);

  return (
    <div
      style={{
        position: "absolute",
        left: center.x - width / 2,
        top: center.y - height / 2,
        width,
        height,
        opacity: cardOpacity,
        transform: `scale(${scale}) translateY(${(1 - settle) * 12}px)`,
        transformOrigin: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -7,
          top: -7,
          width: width + 14,
          height: height + 14,
          borderRadius: 25,
          border: `1px solid ${alpha(accent, 0.22 + active * 0.55)}`,
          opacity: active,
          transform: `scale(${1 + active * 0.035})`,
          boxShadow: `0 0 34px ${alpha(accent, active * 0.2)}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          overflow: "hidden",
          borderRadius: 20,
          border: `1.5px solid ${alpha(accent, 0.26 + active * 0.68)}`,
          background: `linear-gradient(145deg, rgba(13, 39, 64, ${0.91 + active * 0.04}), rgba(3, 14, 26, 0.97))`,
          boxShadow: [
            `0 16px 42px rgba(0,0,0,0.32)`,
            `0 0 ${16 + active * 30}px ${alpha(accent, active * 0.22)}`,
            `inset 0 1px 0 rgba(255,255,255,${0.09 + active * 0.08})`,
          ].join(", "),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width,
            height,
            background: `radial-gradient(circle at 50% 40%, ${alpha(accent, active * 0.18)}, transparent 63%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 11,
            left: 13,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 9,
            letterSpacing: 1.4,
            color: alpha(COLORS.text, 0.38),
          }}
        >
          {index}
        </div>
        <div
          style={{
            position: "absolute",
            right: 13,
            top: 12,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: mixHex("#35526c", accent, active),
            boxShadow: `0 0 ${active * 12}px ${alpha(accent, active * 0.8)}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 20,
            width: Math.min(72, width * 0.46),
            height: Math.min(72, height * 0.51),
            transform: "translateX(-50%)",
            opacity: 0.6 + active * 0.4,
            filter: `drop-shadow(0 0 ${active * 9}px ${alpha(accent, active * 0.5)})`,
          }}
        >
          <Icon name={icon} active={active} time={time} color={liveColor} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: 8,
            right: 8,
            textAlign: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 700,
            fontSize: width < 135 ? 11.5 : 13.5,
            letterSpacing: width < 135 ? 1.4 : 1.8,
            color: COLORS.text,
          }}
        >
          {label}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            right: 8,
            textAlign: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 9.5,
            letterSpacing: 0.8,
            color: alpha(COLORS.muted, 0.9),
          }}
        >
          {detail}
        </div>
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${alpha(accent, active)}, transparent)`,
          }}
        />
      </div>
    </div>
  );
};

const Robot: React.FC<{
  time: number;
  frame: number;
  fps: number;
  sceneOpacity: number;
  reasonActivity: number;
  resultActivity: number;
}> = ({time, frame, fps, sceneOpacity, reasonActivity, resultActivity}) => {
  const settle = frame < 18
    ? 0
    : spring({
        frame: frame - 18,
        fps,
        config: {damping: 13, stiffness: 92, mass: 0.9},
        durationInFrames: 72,
      });
  const floatY = Math.sin((time / DURATION) * Math.PI * 4) * 5;
  const sourceLook = windowStrength(time, 1.2, 3.7, 0.4);
  const toolLook = windowStrength(time, 7.2, 10.0, 0.4);
  const lookX = 1.5 + 5.5 * Math.max(sourceLook, toolLook, resultActivity);
  const pointAmount = Math.min(ramp(time, 1.15, 1.9), 1 - ramp(time, 4.05, 4.65));
  const waveAmount = Math.min(ramp(time, 11.45, 11.9), 1 - ramp(time, 13.15, 13.6));
  const wave = Math.sin((time - 11.5) * 12.5) * 8 * waveAmount;
  const rightArmAngle = 10 - pointAmount * 18 - waveAmount * 29 + wave * 0.75;
  const leftSweep = windowStrength(time, 7.45, 9.35, 0.42);
  const leftArmAngle = -2 + leftSweep * 12;
  const nod = Math.sin(ramp(time, 11.55, 12.3) * Math.PI * 2) * 3.5 * resultActivity;
  const chestPulse = 1 + (0.045 + reasonActivity * 0.07) * Math.sin(time * 7.2);
  const antennaLive = Math.max(sourceLook, reasonActivity, toolLook, resultActivity * 0.7);
  const pointerPulse = pointAmount * (0.65 + Math.sin(time * 9) * 0.35);

  const blinkCenters = [3.86, 8.15, 12.82];
  let blinkScale = 1;
  blinkCenters.forEach((center) => {
    const distance = Math.abs(time - center);
    if (distance < 0.09) {
      blinkScale = Math.min(
        blinkScale,
        interpolate(distance, [0, 0.04, 0.09], [0.18, 0.35, 1], clamp),
      );
    }
  });

  // Keep each blink anchored to a fixed point high in the visor. Computing the
  // eye geometry directly avoids SVG transform-origin differences that could
  // previously push the eyes far below the face during a blink.
  const eyeCenterY = 179;
  const eyeHeight = Math.max(8, 48 * blinkScale);
  const eyeY = eyeCenterY - eyeHeight / 2;
  const eyeRadius = Math.min(15.5, eyeHeight / 2);

  return (
    <div
      style={{
        position: "absolute",
        left: 35,
        top: 175,
        width: 500,
        height: 700,
        opacity: sceneOpacity * interpolate(settle, [0, 0.2, 1], [0, 0.45, 1], clamp),
        transform: `translateY(${(1 - settle) * 34 + floatY}px) scale(${0.92 + settle * 0.08})`,
        transformOrigin: "50% 55%",
      }}
    >
      <svg viewBox="0 0 500 700" style={{width: "100%", height: "100%", overflow: "visible"}}>
        <defs>
          <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.48" stopColor="#dceeff" />
            <stop offset="1" stopColor="#8eb8da" />
          </linearGradient>
          <linearGradient id="shellShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dff2ff" />
            <stop offset="1" stopColor="#789ebb" />
          </linearGradient>
          <radialGradient id="visor" cx="36%" cy="28%" r="82%">
            <stop offset="0" stopColor="#147cdb" />
            <stop offset="0.58" stopColor="#06498f" />
            <stop offset="1" stopColor="#031b3b" />
          </radialGradient>
          <radialGradient id="core" cx="42%" cy="34%" r="70%">
            <stop offset="0" stopColor="#adf4ff" />
            <stop offset="0.38" stopColor="#2bd8ff" />
            <stop offset="1" stopColor="#0968ca" />
          </radialGradient>
          <filter id="robotShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000812" floodOpacity="0.65" />
          </filter>
          <filter id="robotGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <ellipse cx="245" cy="632" rx="112" ry="24" fill="rgba(22,139,255,0.09)" filter="url(#robotGlow)" />
        <ellipse cx="245" cy="627" rx="72" ry="11" fill="none" stroke={alpha(COLORS.cyan, 0.62)} strokeWidth="3" />

        <g transform={`rotate(${leftArmAngle} 154 374)`} filter="url(#robotShadow)">
          <circle cx="154" cy="374" r="33" fill="url(#shellShade)" stroke="#bfe1f5" strokeWidth="3" />
          <path d="M151 380C130 390 119 411 117 437" fill="none" stroke="url(#shell)" strokeWidth="42" strokeLinecap="round" />
          <circle cx="117" cy="439" r="21" fill="url(#shellShade)" stroke="#bfe1f5" strokeWidth="3" />
          <path d="M117 439C111 461 111 482 116 501" fill="none" stroke="url(#shell)" strokeWidth="34" strokeLinecap="round" />
          <rect x="98" y="482" width="36" height="52" rx="18" fill="url(#shell)" stroke="#bfe1f5" strokeWidth="3" transform="rotate(4 116 508)" />
          <path d="M104 494C111 489 122 488 129 492" fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g transform={`rotate(${rightArmAngle} 346 374)`} filter="url(#robotShadow)">
          <circle cx="346" cy="374" r="33" fill="url(#shellShade)" stroke="#bfe1f5" strokeWidth="3" />
          <path d="M350 377C378 383 399 398 408 420" fill="none" stroke="url(#shell)" strokeWidth="42" strokeLinecap="round" />
          <circle cx="408" cy="420" r="21" fill="url(#shellShade)" stroke="#bfe1f5" strokeWidth="3" />
          <path d="M416 416C438 400 455 381 465 365" fill="none" stroke="url(#shell)" strokeWidth="34" strokeLinecap="round" />
          <rect x="450" y="343" width="40" height="36" rx="18" fill="url(#shell)" stroke="#bfe1f5" strokeWidth="3" transform="rotate(-33 470 361)" />
          <path d="M459 352C467 346 476 344 483 346" fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="488" cy="350" r={5 + pointerPulse * 2.5} fill={alpha(COLORS.cyan, 0.48 + pointerPulse * 0.52)} stroke="#e7feff" strokeWidth="2" filter="url(#robotGlow)" />
        </g>

        <g filter="url(#robotShadow)">
          <path
            d="M250 321C177 321 137 361 137 451c0 88 43 145 113 145s113-57 113-145c0-90-40-130-113-130z"
            fill="url(#shell)"
            stroke="#c9e8fb"
            strokeWidth="4"
          />
          <path d="M168 380c19-31 47-44 82-44s63 13 82 44" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="4" strokeLinecap="round" />
          <path d="M173 537c24 31 49 45 77 45s53-14 77-45" fill="none" stroke="rgba(62,112,148,0.26)" strokeWidth="4" strokeLinecap="round" />
          <rect x="200" y="302" width="100" height="58" rx="25" fill="url(#shellShade)" stroke="#b8d9ed" strokeWidth="3" />

          <g transform={`translate(250 446) scale(${chestPulse}) translate(-250 -446)`}>
            <circle cx="250" cy="446" r="59" fill="#052d59" stroke="#62dff8" strokeWidth="4" />
            <circle cx="250" cy="446" r="45" fill="url(#core)" opacity={0.9} filter="url(#robotGlow)" />
            <circle cx="250" cy="446" r="28" fill="#073873" stroke="#d8fbff" strokeWidth="2" />
            <circle cx="250" cy="446" r="7" fill="#e9feff" />
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const radians = (angle * Math.PI) / 180;
              const x = 250 + Math.cos(radians) * 20;
              const y = 446 + Math.sin(radians) * 20;
              return (
                <g key={angle}>
                  <line x1="250" y1="446" x2={x} y2={y} stroke="#aef5ff" strokeWidth="2" opacity={0.8} />
                  <circle cx={x} cy={y} r="3.2" fill="#eaffff" />
                </g>
              );
            })}
          </g>
        </g>

        <g transform={`rotate(${nod} 250 205)`} filter="url(#robotShadow)">
          <path d="M250 94V53" stroke="#c8e7f8" strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="250" cy="43" rx="13" ry="13" fill={COLORS.cyan} filter="url(#robotGlow)" opacity={0.74 + antennaLive * 0.26} />
          <circle cx="250" cy="43" r={6 + antennaLive * 2} fill="#edffff" />
          <rect x="104" y="94" width="292" height="226" rx="104" fill="url(#shell)" stroke="#d7effd" strokeWidth="5" />
          <rect x="72" y="144" width="57" height="126" rx="28" fill="url(#shellShade)" stroke="#a9d1e9" strokeWidth="4" />
          <rect x="371" y="144" width="57" height="126" rx="28" fill="url(#shellShade)" stroke="#a9d1e9" strokeWidth="4" />
          <rect x="78" y="170" width="13" height="72" rx="6" fill={COLORS.blue} />
          <rect x="409" y="170" width="13" height="72" rx="6" fill={COLORS.blue} />
          <rect x="127" y="119" width="246" height="174" rx="76" fill="url(#visor)" stroke="#4fc8ff" strokeWidth="4" />
          <path d="M157 145c30-25 65-34 103-32" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="250" cy="284" rx="68" ry="4" fill={alpha(COLORS.cyan, 0.26 + antennaLive * 0.24)} />
          <g transform={`translate(${lookX} 0)`}>
            <rect
              x="181"
              y={eyeY}
              width="31"
              height={eyeHeight}
              rx={eyeRadius}
              fill="#dffcff"
              filter="url(#robotGlow)"
            />
            <rect
              x="288"
              y={eyeY}
              width="31"
              height={eyeHeight}
              rx={eyeRadius}
              fill="#dffcff"
              filter="url(#robotGlow)"
            />
          </g>
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 78,
          right: 78,
          bottom: 2,
          textAlign: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{fontSize: 23, letterSpacing: 4.5, fontWeight: 800, color: COLORS.text}}>
          AUTONOMOUS AGENT
        </div>
        <div
          style={{
            marginTop: 11,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 9,
            fontSize: 11,
            letterSpacing: 2.5,
            color: COLORS.muted,
          }}
        >
          <span style={{width: 7, height: 7, borderRadius: "50%", background: COLORS.mint, boxShadow: `0 0 10px ${COLORS.mint}`}} />
          INTERACTIVE • ONLINE
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{time: number; sceneOpacity: number}> = ({time, sceneOpacity}) => {
  const reveal = ramp(time, 0.25, 1.2);
  return (
    <div style={{position: "absolute", inset: 0, opacity: sceneOpacity}}>
      <div
        style={{
          position: "absolute",
          left: 84,
          top: 56,
          transform: `translateY(${(1 - reveal) * -12}px)`,
          opacity: reveal,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 12, color: COLORS.cyan, fontSize: 11, letterSpacing: 3.2, fontWeight: 700}}>
          <span style={{width: 34, height: 2, background: COLORS.cyan, boxShadow: `0 0 9px ${COLORS.cyan}`}} />
          AGENTIC AUTOMATION • LIVE SEQUENCE
        </div>
        <div style={{marginTop: 12, color: COLORS.text, fontSize: 34, lineHeight: 1, fontWeight: 800, letterSpacing: 1.2}}>
          AUTONOMOUS AI WORKFLOW
        </div>
        <div style={{marginTop: 12, color: COLORS.muted, fontSize: 13, letterSpacing: 1.45}}>
          CONTEXT-AWARE PLANNING / VERIFIED TOOL EXECUTION
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 82,
          top: 68,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: reveal,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {["07 MODULES", "TRACE ACTIVE", "SECURE MODE"].map((label, index) => (
          <div
            key={label}
            style={{
              padding: "9px 13px",
              borderRadius: 8,
              border: `1px solid ${alpha(index === 2 ? COLORS.mint : COLORS.blue, 0.25)}`,
              background: "rgba(5, 23, 40, 0.72)",
              color: index === 2 ? COLORS.mint : "#8ab5d5",
              fontSize: 9.5,
              letterSpacing: 1.5,
              fontWeight: 700,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const CompletionCard: React.FC<{
  time: number;
  frame: number;
  fps: number;
  resultActivity: number;
}> = ({time, frame, fps, resultActivity}) => {
  const appearFrame = 12.2 * fps;
  const settle = frame < appearFrame
    ? 0
    : spring({
        frame: frame - appearFrame,
        fps,
        config: {damping: 14, stiffness: 120, mass: 0.75},
        durationInFrames: 48,
      });
  const exit = 1 - ramp(time, 13.75, 14.35);
  const visible = settle * exit;
  const shimmer = ((time - 12.2) * 160) % 410;

  return (
    <div
      style={{
        position: "absolute",
        left: 1588,
        top: 664,
        width: 258,
        height: 106,
        borderRadius: 18,
        overflow: "hidden",
        opacity: visible,
        transform: `translateY(${(1 - settle) * 20}px) scale(${0.9 + settle * 0.1})`,
        border: `1px solid ${alpha(COLORS.mint, 0.34 + resultActivity * 0.45)}`,
        background: "linear-gradient(135deg, rgba(11,42,56,0.96), rgba(3,18,29,0.96))",
        boxShadow: `0 18px 44px rgba(0,0,0,0.36), 0 0 30px ${alpha(COLORS.mint, resultActivity * 0.16)}`,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: shimmer - 80,
          top: -30,
          width: 55,
          height: 170,
          transform: "rotate(24deg)",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 22,
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: `2px solid ${alpha(COLORS.mint, 0.68)}`,
          background: alpha(COLORS.mint, 0.1),
          boxShadow: `0 0 18px ${alpha(COLORS.mint, 0.18)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 40 40" style={{width: 36, height: 36}}>
          <path d="M9 21l7 7 15-17" fill="none" stroke={COLORS.mint} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{position: "absolute", left: 94, top: 26, color: COLORS.mint, fontSize: 11, letterSpacing: 2.2, fontWeight: 800}}>
        VERIFIED OUTPUT
      </div>
      <div style={{position: "absolute", left: 94, top: 50, color: COLORS.text, fontSize: 15.5, letterSpacing: 0.4, fontWeight: 800, whiteSpace: "nowrap"}}>
        TASK COMPLETE
      </div>
      <div style={{position: "absolute", left: 94, top: 75, color: COLORS.muted, fontSize: 10.5, letterSpacing: 1}}>
        RESULT READY • 100%
      </div>
    </div>
  );
};

const StageTimeline: React.FC<{time: number; sceneOpacity: number}> = ({time, sceneOpacity}) => {
  const stages = [
    {label: "INPUT", at: 1.4, color: COLORS.blue},
    {label: "CONTEXT", at: 3.3, color: COLORS.cyan},
    {label: "REASON", at: 4.5, color: COLORS.violet},
    {label: "EXECUTE", at: 7.4, color: COLORS.cyan},
    {label: "VERIFY", at: 9.2, color: COLORS.amber},
    {label: "RESULT", at: 12.18, color: COLORS.mint},
  ];
  const startX = 635;
  const endX = 1802;
  const activeProgress = interpolate(
    time,
    stages.map((stage) => stage.at),
    stages.map((_, index) => index / (stages.length - 1)),
    clamp,
  );

  return (
    <div
      style={{
        position: "absolute",
        left: startX,
        top: 974,
        width: endX - startX,
        height: 55,
        opacity: sceneOpacity * ramp(time, 0.85, 1.5),
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{position: "absolute", left: 0, right: 0, top: 13, height: 2, background: alpha(COLORS.line, 0.72)}} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 13,
          height: 2,
          width: `${activeProgress * 100}%`,
          background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.violet}, ${COLORS.mint})`,
          boxShadow: `0 0 12px ${alpha(COLORS.cyan, 0.45)}`,
        }}
      />
      {stages.map((stage, index) => {
        const x = (index / (stages.length - 1)) * (endX - startX);
        const active = ramp(time, stage.at - 0.12, stage.at + 0.16);
        return (
          <div key={stage.label} style={{position: "absolute", left: x, top: 0}}>
            <div
              style={{
                position: "absolute",
                left: -6,
                top: 8,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: mixHex(COLORS.bgSoft, stage.color, active),
                border: `2px solid ${mixHex("#32516b", stage.color, active)}`,
                boxShadow: `0 0 ${active * 13}px ${alpha(stage.color, active * 0.9)}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 30,
                left: index === 0 ? 0 : index === stages.length - 1 ? undefined : "50%",
                right: index === stages.length - 1 ? 0 : undefined,
                transform: index > 0 && index < stages.length - 1 ? "translateX(-50%)" : undefined,
                color: mixHex(COLORS.muted, COLORS.text, active),
                fontSize: 9.5,
                letterSpacing: 1.6,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;

  const sceneOpacity = Math.min(
    ramp(time, 0.05, 0.55),
    1 - ramp(time, 14.35, 14.98),
  );
  const finalHold = Math.min(ramp(time, 12.16, 12.65), 1 - ramp(time, 13.95, 14.45));

  const sourceTimes = [
    {start: 1.5, end: 3.05},
    {start: 1.83, end: 3.35},
    {start: 2.16, end: 3.65},
    {start: 2.49, end: 3.95},
  ];
  const sourceActivity = sourceTimes.map(({start, end}) => Math.max(windowStrength(time, start, end, 0.28), finalHold * 0.42));
  const contextActivity = Math.max(windowStrength(time, 2.55, 4.65, 0.35), finalHold * 0.5);
  const reasonActivity = Math.max(
    windowStrength(time, 4.0, 7.55, 0.38),
    windowStrength(time, 10.65, 11.3, 0.16),
    finalHold * 0.66,
  );
  const planActivity = Math.max(windowStrength(time, 4.75, 5.9, 0.22), finalHold * 0.42);
  const memoryActivity = Math.max(windowStrength(time, 5.45, 6.62, 0.22), finalHold * 0.42);
  const guardActivity = Math.max(windowStrength(time, 6.12, 7.3, 0.22), finalHold * 0.42);
  const toolActivity = Math.max(
    windowStrength(time, 7.15, 9.35, 0.35),
    windowStrength(time, 10.7, 11.48, 0.16),
    finalHold * 0.56,
  );
  const verifyActivity = Math.max(
    windowStrength(time, 8.85, 10.78, 0.3),
    windowStrength(time, 11.1, 11.98, 0.18),
    finalHold * 0.62,
  );
  const resultActivity = Math.max(windowStrength(time, 11.58, 14.32, 0.4), finalHold);

  const cameraTrack = interpolate(time, [0, 7.2, 9.7, 13.8, 15], [0, 0, -18, -10, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const cameraScale = interpolate(time, [0, 4.5, 10.2, 13.8, 15], [0.988, 1, 1.012, 1.006, 0.988], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  const sourceCenters: Point[] = [
    {x: 680, y: 244},
    {x: 840, y: 244},
    {x: 1000, y: 244},
    {x: 1160, y: 244},
  ];
  const contextCenter = {x: 760, y: 520};
  const reasonCenter = {x: 1060, y: 520};
  const toolCenter = {x: 1330, y: 520};
  const verifyCenter = {x: 1540, y: 520};
  const resultCenter = {x: 1740, y: 520};
  const supportCenters: Point[] = [
    {x: 930, y: 775},
    {x: 1110, y: 775},
    {x: 1290, y: 775},
  ];

  const sourceRoutes: Point[][] = sourceCenters.map((source, index) => [
    {x: source.x, y: 307},
    {x: source.x, y: 330 + index * 18},
    {x: 724 + index * 22, y: 330 + index * 18},
    {x: 724 + index * 22, y: 449},
  ]);

  const robotRoute = [
    {x: 523, y: 525},
    {x: 622, y: 525},
    {x: 622, y: 520},
    {x: 683, y: 520},
  ];
  const contextReasonRoute = [
    {x: 837, y: 520},
    {x: 967, y: 520},
  ];
  const reasonToolRoute = [
    {x: 1153, y: 520},
    {x: 1252, y: 520},
  ];
  const toolVerifyRoute = [
    {x: 1408, y: 520},
    {x: 1465, y: 520},
  ];
  const verifyResultRoute = [
    {x: 1615, y: 520},
    {x: 1665, y: 520},
  ];
  const supportRoutes: Point[][] = [
    [
      {x: 1018, y: 612},
      {x: 1018, y: 665},
      {x: 930, y: 665},
      {x: 930, y: 709},
    ],
    [
      {x: 1060, y: 612},
      {x: 1060, y: 672},
      {x: 1110, y: 672},
      {x: 1110, y: 709},
    ],
    [
      {x: 1102, y: 612},
      {x: 1102, y: 650},
      {x: 1290, y: 650},
      {x: 1290, y: 709},
    ],
  ];
  const feedbackRoute = [
    {x: 1540, y: 595},
    {x: 1540, y: 920},
    {x: 870, y: 920},
    {x: 870, y: 646},
    {x: 984, y: 646},
    {x: 984, y: 562},
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            "radial-gradient(circle at 55% 48%, rgba(20,105,165,0.14), transparent 38%)",
            "radial-gradient(circle at 82% 58%, rgba(78,55,170,0.09), transparent 31%)",
            "linear-gradient(135deg, #020916 0%, #041222 53%, #020814 100%)",
          ].join(", "),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.45,
          backgroundImage: [
            "linear-gradient(rgba(50,132,184,0.11) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(50,132,184,0.11) 1px, transparent 1px)",
            "linear-gradient(rgba(50,132,184,0.045) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(50,132,184,0.045) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "48px 48px, 48px 48px, 12px 12px, 12px 12px",
          maskImage: "radial-gradient(ellipse at 55% 50%, black 0%, rgba(0,0,0,0.7) 63%, transparent 100%)",
        }}
      />

      <div style={{position: "absolute", inset: 0, opacity: sceneOpacity}}>
        {deterministicParticles.map((particle, index) => {
          const drift = Math.sin(time * 0.7 + particle.phase) * 5;
          const twinkle = 0.65 + Math.sin(time * 2.2 + particle.phase) * 0.35;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: particle.x,
                top: particle.y + drift,
                width: particle.size,
                height: particle.size,
                borderRadius: "50%",
                color: index % 7 === 0 ? COLORS.violet : COLORS.cyan,
                background: "currentColor",
                opacity: particle.opacity * twinkle,
                boxShadow: `0 0 ${particle.size * 4}px currentColor`,
              }}
            />
          );
        })}
      </div>

      <Header time={time} sceneOpacity={sceneOpacity} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: sceneOpacity,
          transform: `translateX(${cameraTrack}px) scale(${cameraScale})`,
          transformOrigin: "57% 52%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 614,
            top: 150,
            color: alpha(COLORS.cyan, 0.68),
            fontSize: 9.5,
            letterSpacing: 2.4,
            fontWeight: 700,
          }}
        >
          SOURCE LAYER / 04 CHANNELS
        </div>
        <div
          style={{
            position: "absolute",
            left: 692,
            top: 407,
            color: alpha(COLORS.muted, 0.55),
            fontSize: 9,
            letterSpacing: 2.2,
            fontWeight: 700,
          }}
        >
          AGENT LOOP
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{position: "absolute", inset: 0, width: W, height: H, overflow: "visible"}}>
          <defs>
            <filter id="routeGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <NetworkRoute points={robotRoute} transits={[{start: 1.35, end: 2.45}]} color={COLORS.blue} time={time} finalHold={finalHold} packets={2} />
          {sourceRoutes.map((route, index) => (
            <NetworkRoute
              key={index}
              points={route}
              transits={[{start: sourceTimes[index].start + 0.2, end: sourceTimes[index].end}]}
              color={index < 2 ? COLORS.blue : COLORS.cyan}
              time={time}
              finalHold={finalHold}
              packets={index === 3 ? 2 : 1}
              subtle
            />
          ))}
          <NetworkRoute points={contextReasonRoute} transits={[{start: 3.75, end: 4.72}]} color={COLORS.cyan} time={time} finalHold={finalHold} packets={2} />
          <NetworkRoute points={supportRoutes[0]} transits={[{start: 4.78, end: 5.86, pingPong: true}]} color={COLORS.violet} time={time} finalHold={finalHold} />
          <NetworkRoute points={supportRoutes[1]} transits={[{start: 5.44, end: 6.54, pingPong: true}]} color={COLORS.violet} time={time} finalHold={finalHold} />
          <NetworkRoute points={supportRoutes[2]} transits={[{start: 6.1, end: 7.22, pingPong: true}]} color={COLORS.violet} time={time} finalHold={finalHold} />
          <NetworkRoute
            points={reasonToolRoute}
            transits={[{start: 7.1, end: 8.06}, {start: 10.72, end: 11.12}]}
            color={COLORS.cyan}
            time={time}
            finalHold={finalHold}
            packets={2}
          />
          <NetworkRoute
            points={toolVerifyRoute}
            transits={[{start: 8.38, end: 9.34}, {start: 11.14, end: 11.55}]}
            color={COLORS.amber}
            time={time}
            finalHold={finalHold}
            packets={2}
          />
          <NetworkRoute points={feedbackRoute} transits={[{start: 9.78, end: 10.68}]} color={COLORS.violet} time={time} finalHold={finalHold} packets={2} subtle />
          <NetworkRoute points={verifyResultRoute} transits={[{start: 11.58, end: 12.18}]} color={COLORS.mint} time={time} finalHold={finalHold} packets={2} />
        </svg>

        <Robot
          time={time}
          frame={frame}
          fps={fps}
          sceneOpacity={1}
          reasonActivity={reasonActivity}
          resultActivity={resultActivity}
        />

        {[
          {center: sourceCenters[0], label: "FILES", detail: "documents", icon: "files" as const, accent: COLORS.blue},
          {center: sourceCenters[1], label: "DATABASE", detail: "structured data", icon: "database" as const, accent: COLORS.blue},
          {center: sourceCenters[2], label: "CLOUD API", detail: "external service", icon: "cloud" as const, accent: COLORS.cyan},
          {center: sourceCenters[3], label: "WEB", detail: "live knowledge", icon: "web" as const, accent: COLORS.cyan},
        ].map((node, index) => (
          <WorkflowNode
            key={node.label}
            {...node}
            width={124}
            height={126}
            active={sourceActivity[index]}
            appear={0.9 + index * 0.16}
            time={time}
            frame={frame}
            fps={fps}
            index={`S${String(index + 1).padStart(2, "0")}`}
          />
        ))}

        <WorkflowNode
          center={contextCenter}
          width={154}
          height={150}
          label="CONTEXT"
          detail="retrieve + select"
          icon="context"
          accent={COLORS.cyan}
          active={contextActivity}
          appear={1.05}
          time={time}
          frame={frame}
          fps={fps}
          index="A01"
        />
        <WorkflowNode
          center={reasonCenter}
          width={186}
          height={184}
          label="REASON"
          detail="orchestrate + decide"
          icon="reason"
          accent={COLORS.violet}
          active={reasonActivity}
          appear={1.18}
          time={time}
          frame={frame}
          fps={fps}
          index="A02 / CORE"
        />
        <WorkflowNode
          center={toolCenter}
          width={156}
          height={150}
          label="TOOL CALL"
          detail="execute function"
          icon="tool"
          accent={COLORS.cyan}
          active={toolActivity}
          appear={1.31}
          time={time}
          frame={frame}
          fps={fps}
          index="A03"
        />
        <WorkflowNode
          center={verifyCenter}
          width={150}
          height={150}
          label="VERIFY"
          detail="quality check"
          icon="verify"
          accent={COLORS.amber}
          active={verifyActivity}
          appear={1.44}
          time={time}
          frame={frame}
          fps={fps}
          index="A04"
        />
        <WorkflowNode
          center={resultCenter}
          width={150}
          height={150}
          label="RESULT"
          detail="verified output"
          icon="result"
          accent={COLORS.mint}
          active={resultActivity}
          appear={1.57}
          time={time}
          frame={frame}
          fps={fps}
          index="A05"
        />

        {[
          {center: supportCenters[0], label: "PLAN", detail: "task sequence", icon: "plan" as const, accent: COLORS.violet, active: planActivity},
          {center: supportCenters[1], label: "MEMORY", detail: "session recall", icon: "memory" as const, accent: COLORS.violet, active: memoryActivity},
          {center: supportCenters[2], label: "GUARDRAIL", detail: "safety policy", icon: "guard" as const, accent: COLORS.violet, active: guardActivity},
        ].map((node, index) => (
          <WorkflowNode
            key={node.label}
            {...node}
            width={140}
            height={132}
            appear={1.7 + index * 0.12}
            time={time}
            frame={frame}
            fps={fps}
            index={`L${String(index + 1).padStart(2, "0")}`}
          />
        ))}

        <div
          style={{
            position: "absolute",
            left: 1175,
            top: 936,
            color: alpha(COLORS.violet, 0.38 + windowStrength(time, 9.7, 10.8, 0.25) * 0.62),
            fontSize: 9.5,
            letterSpacing: 2.5,
            fontWeight: 700,
          }}
        >
          SELF-CORRECTION FEEDBACK LOOP
        </div>

        <CompletionCard time={time} frame={frame} fps={fps} resultActivity={resultActivity} />
      </div>

      <StageTimeline time={time} sceneOpacity={sceneOpacity} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ((time * 92) % (H + 180)) - 90,
          height: 110,
          opacity: sceneOpacity * 0.055,
          background: "linear-gradient(180deg, transparent, rgba(61,202,255,0.3), transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.54)",
        }}
      />
    </AbsoluteFill>
  );
};
