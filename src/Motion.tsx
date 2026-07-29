import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 900;
const CENTER_X = 960;
const CENTER_Y = 540;
const TAU = Math.PI * 2;

const phase = (
  frame: number,
  start: number,
  end: number,
  easing: (input: number) => number = Easing.out(Easing.cubic),
): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const seeded = (seed: number): number => {
  const value = Math.sin(seed * 92.817 + 31.113) * 47291.177;
  return value - Math.floor(value);
};

type Point = {
  readonly x: number;
  readonly y: number;
};

type SymbolKind =
  | "circle"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "split"
  | "orbit";

type Branch = {
  readonly id: string;
  readonly start: number;
  readonly accent: string;
  readonly glow: string;
  readonly soft: string;
  readonly selected: boolean;
  readonly symbol: SymbolKind;
  readonly card: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly p0: Point;
  readonly p1: Point;
  readonly p2: Point;
  readonly p3: Point;
  readonly portAngle: number;
  readonly cardAngle: number;
};

const BRANCHES: readonly Branch[] = [
  {
    id: "north",
    start: 138,
    accent: "#62e8ff",
    glow: "#23c8f2",
    soft: "#baf5ff",
    selected: false,
    symbol: "circle",
    card: { x: 748, y: 58, width: 424, height: 174 },
    p0: { x: 960, y: 378 },
    p1: { x: 960, y: 323 },
    p2: { x: 960, y: 280 },
    p3: { x: 960, y: 232 },
    portAngle: -90,
    cardAngle: 90,
  },
  {
    id: "north-east",
    start: 180,
    accent: "#6f9cff",
    glow: "#4c72ff",
    soft: "#cad8ff",
    selected: true,
    symbol: "triangle",
    card: { x: 1450, y: 222, width: 390, height: 184 },
    p0: { x: 1100, y: 455 },
    p1: { x: 1202, y: 388 },
    p2: { x: 1326, y: 322 },
    p3: { x: 1450, y: 314 },
    portAngle: -30,
    cardAngle: 180,
  },
  {
    id: "south-east",
    start: 222,
    accent: "#ba75ff",
    glow: "#9445ef",
    soft: "#e3c6ff",
    selected: false,
    symbol: "diamond",
    card: { x: 1450, y: 674, width: 390, height: 184 },
    p0: { x: 1100, y: 625 },
    p1: { x: 1202, y: 692 },
    p2: { x: 1326, y: 758 },
    p3: { x: 1450, y: 766 },
    portAngle: 30,
    cardAngle: 180,
  },
  {
    id: "south",
    start: 264,
    accent: "#ff70c3",
    glow: "#ed3d9f",
    soft: "#ffc6e7",
    selected: false,
    symbol: "hexagon",
    card: { x: 748, y: 848, width: 424, height: 174 },
    p0: { x: 960, y: 702 },
    p1: { x: 960, y: 757 },
    p2: { x: 960, y: 800 },
    p3: { x: 960, y: 848 },
    portAngle: 90,
    cardAngle: -90,
  },
  {
    id: "south-west",
    start: 306,
    accent: "#ff936c",
    glow: "#ff6948",
    soft: "#ffd4c4",
    selected: true,
    symbol: "split",
    card: { x: 80, y: 674, width: 390, height: 184 },
    p0: { x: 820, y: 625 },
    p1: { x: 718, y: 692 },
    p2: { x: 594, y: 758 },
    p3: { x: 470, y: 766 },
    portAngle: 150,
    cardAngle: 0,
  },
  {
    id: "north-west",
    start: 348,
    accent: "#ffc75b",
    glow: "#f2a923",
    soft: "#ffe7ad",
    selected: false,
    symbol: "orbit",
    card: { x: 80, y: 222, width: 390, height: 184 },
    p0: { x: 820, y: 455 },
    p1: { x: 718, y: 388 },
    p2: { x: 594, y: 322 },
    p3: { x: 470, y: 314 },
    portAngle: 210,
    cardAngle: 0,
  },
] as const;

const cubicPoint = (
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point => {
  const inverse = 1 - t;
  return {
    x:
      inverse ** 3 * p0.x +
      3 * inverse ** 2 * t * p1.x +
      3 * inverse * t ** 2 * p2.x +
      t ** 3 * p3.x,
    y:
      inverse ** 3 * p0.y +
      3 * inverse ** 2 * t * p1.y +
      3 * inverse * t ** 2 * p2.y +
      t ** 3 * p3.y,
  };
};

const pathFor = (branch: Branch): string =>
  `M${branch.p0.x} ${branch.p0.y} C${branch.p1.x} ${branch.p1.y} ${branch.p2.x} ${branch.p2.y} ${branch.p3.x} ${branch.p3.y}`;

const BACKGROUND_NODES = Array.from({ length: 48 }, (_, index) => ({
  x: seeded(index + 12) * WIDTH,
  y: seeded(index + 112) * HEIGHT,
  size: 2 + seeded(index + 212) * 5,
  alpha: 0.08 + seeded(index + 312) * 0.22,
  drift: 0.45 + seeded(index + 412) * 1.1,
  offset: seeded(index + 512) * TAU,
  colorIndex: index % 6,
}));

const ORBITAL_MARKS = Array.from({ length: 36 }, (_, index) => ({
  angle: (index / 36) * TAU,
  radius: 226 + (index % 3) * 10,
  size: index % 6 === 0 ? 4.5 : 2.5,
}));

const CornerGuides: React.FC<{
  readonly color: string;
  readonly opacity: number;
}> = ({ color, opacity }) => {
  const corners = [
    { left: 0, top: 0, borderLeft: true, borderTop: true },
    { right: 0, top: 0, borderRight: true, borderTop: true },
    { left: 0, bottom: 0, borderLeft: true, borderBottom: true },
    { right: 0, bottom: 0, borderRight: true, borderBottom: true },
  ] as const;

  return (
    <>
      {corners.map((corner, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: 18,
            height: 18,
            left: "left" in corner ? corner.left : undefined,
            right: "right" in corner ? corner.right : undefined,
            top: "top" in corner ? corner.top : undefined,
            bottom: "bottom" in corner ? corner.bottom : undefined,
            borderLeft:
              "borderLeft" in corner && corner.borderLeft
                ? `1.5px solid ${color}`
                : undefined,
            borderRight:
              "borderRight" in corner && corner.borderRight
                ? `1.5px solid ${color}`
                : undefined,
            borderTop:
              "borderTop" in corner && corner.borderTop
                ? `1.5px solid ${color}`
                : undefined,
            borderBottom:
              "borderBottom" in corner && corner.borderBottom
                ? `1.5px solid ${color}`
                : undefined,
            opacity,
          }}
        />
      ))}
    </>
  );
};

const GeometricSymbol: React.FC<{
  readonly kind: SymbolKind;
  readonly color: string;
  readonly glow: string;
  readonly progress: number;
  readonly frame: number;
}> = ({ kind, color, glow, progress, frame }) => {
  const rotation = frame * 0.08;
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    opacity: 0.94,
  };

  return (
    <svg
      width="62"
      height="62"
      viewBox="0 0 62 62"
      style={{
        filter: `drop-shadow(0 0 ${8 + progress * 7}px ${glow})`,
        transform: `scale(${0.82 + progress * 0.18})`,
      }}
      aria-hidden
    >
      {kind === "circle" ? (
        <>
          <circle cx="31" cy="31" r="16" {...common} />
          <circle
            cx={31 + Math.cos(rotation * 0.035) * 22}
            cy={31 + Math.sin(rotation * 0.035) * 22}
            r="3.5"
            fill={color}
            opacity={progress}
          />
        </>
      ) : null}
      {kind === "triangle" ? (
        <>
          <path d="M31 12 L49 46 L13 46 Z" {...common} />
          <circle cx="31" cy="34" r="4.5" fill={color} opacity={progress} />
        </>
      ) : null}
      {kind === "diamond" ? (
        <>
          <path d="M31 10 L51 31 L31 52 L11 31 Z" {...common} />
          <path d="M31 18 L43 31 L31 44 L19 31 Z" {...common} opacity={0.5} />
        </>
      ) : null}
      {kind === "hexagon" ? (
        <>
          <path d="M18 12 L44 12 L56 31 L44 50 L18 50 L6 31 Z" {...common} />
          <circle cx="31" cy="31" r="7" {...common} opacity={0.62} />
        </>
      ) : null}
      {kind === "split" ? (
        <>
          <path d="M14 17 L27 31 L14 45" {...common} />
          <path d="M48 17 L35 31 L48 45" {...common} />
          <circle cx="31" cy="31" r="4.5" fill={color} opacity={progress} />
        </>
      ) : null}
      {kind === "orbit" ? (
        <>
          <ellipse
            cx="31"
            cy="31"
            rx="23"
            ry="10"
            transform={`rotate(${25 + rotation * 0.045} 31 31)`}
            {...common}
          />
          <ellipse
            cx="31"
            cy="31"
            rx="23"
            ry="10"
            transform={`rotate(${-35 - rotation * 0.025} 31 31)`}
            {...common}
            opacity={0.5}
          />
          <circle cx="31" cy="31" r="5" fill={color} opacity={progress} />
        </>
      ) : null}
    </svg>
  );
};

const Background: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const palette = ["#5ee8ff", "#7295ff", "#b86eff", "#f568bc", "#ff8b69", "#ffc75f"];

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 48%, #142340 0%, #0a1429 44%, #050a17 78%, #02050d 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 300 + Math.sin(frame / 170) * 18,
          top: -420 + Math.cos(frame / 210) * 12,
          width: 1060,
          height: 850,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(62,174,255,0.20), rgba(73,83,232,0.08) 48%, transparent 72%)",
          filter: "blur(48px)",
          transform: `rotate(${-8 + Math.sin(frame / 260) * 2}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -270 + Math.cos(frame / 190) * 14,
          bottom: -370,
          width: 1020,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(234,72,179,0.17), rgba(153,66,227,0.06) 52%, transparent 74%)",
          filter: "blur(56px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -310 + Math.sin(frame / 230) * 12,
          top: 380,
          width: 850,
          height: 710,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(255,142,80,0.12), rgba(255,187,78,0.035) 48%, transparent 72%)",
          filter: "blur(54px)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(129,180,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(129,180,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `${(frame * 0.018) % 72}px ${(frame * 0.012) % 72}px`,
          maskImage:
            "radial-gradient(ellipse at center, black 12%, rgba(0,0,0,0.55) 56%, transparent 88%)",
        }}
      />
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0, opacity: 0.55 }}
        aria-hidden
      >
        <defs>
          <radialGradient id="radial-field">
            <stop offset="0%" stopColor="#7bdfff" stopOpacity="0.06" />
            <stop offset="65%" stopColor="#7696ff" stopOpacity="0.015" />
            <stop offset="100%" stopColor="#7696ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CENTER_X} cy={CENTER_Y} r="430" fill="url(#radial-field)" />
        {[286, 356, 430, 510].map((radius, index) => (
          <circle
            key={radius}
            cx={CENTER_X}
            cy={CENTER_Y}
            r={radius}
            fill="none"
            stroke={index % 2 === 0 ? "#86dfff" : "#9b8cff"}
            strokeWidth={index === 0 ? 1.4 : 1}
            strokeDasharray={index % 2 === 0 ? "2 18" : "1 24"}
            strokeDashoffset={frame * (index % 2 === 0 ? 0.09 : -0.07)}
            opacity={0.07 + index * 0.01}
          />
        ))}
      </svg>
      {BACKGROUND_NODES.map((node, index) => {
        const x =
          node.x + Math.sin(frame / (78 + node.drift * 25) + node.offset) * 9;
        const y =
          node.y + Math.cos(frame / (94 + node.drift * 23) + node.offset) * 11;
        const color = palette[node.colorIndex];
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: node.size,
              height: node.size,
              borderRadius: "50%",
              background: color,
              opacity: node.alpha,
              boxShadow: `0 0 ${8 + node.size * 2}px ${color}`,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          boxShadow:
            "inset 0 0 170px rgba(1,3,10,0.78), inset 0 0 36px rgba(3,7,18,0.66)",
        }}
      />
    </>
  );
};

const BranchNetwork: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const evaluation = phase(frame, 462, 610, Easing.inOut(Easing.cubic));
  const lock = phase(frame, 602, 720, Easing.out(Easing.cubic));

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 3 }}
      aria-hidden
    >
      <defs>
        <filter id="branch-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="pulse-glow" x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {BRANCHES.map((branch) => (
          <linearGradient
            key={branch.id}
            id={`branch-${branch.id}`}
            x1={branch.p0.x}
            y1={branch.p0.y}
            x2={branch.p3.x}
            y2={branch.p3.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#d9f7ff" stopOpacity="0.76" />
            <stop offset="42%" stopColor={branch.accent} stopOpacity="0.96" />
            <stop offset="100%" stopColor={branch.glow} stopOpacity="0.72" />
          </linearGradient>
        ))}
      </defs>

      {BRANCHES.map((branch, index) => {
        const draw = phase(frame, branch.start, branch.start + 104);
        const selection = branch.selected
          ? phase(frame, 520 + (index % 2) * 18, 644 + (index % 2) * 18)
          : 0;
        const dim = branch.selected ? 1 : 1 - lock * 0.34;
        const routeWidth = 2.2 + selection * 3.2;
        const pulseCycle = Math.max(
          0,
          ((frame - (480 + index * 10)) % 118) / 118,
        );
        const pulseT = evaluation > 0 ? Math.min(1, pulseCycle) : 0;
        const pulse = cubicPoint(
          branch.p0,
          branch.p1,
          branch.p2,
          branch.p3,
          pulseT,
        );
        const path = pathFor(branch);

        return (
          <g key={branch.id} opacity={dim}>
            <path
              d={path}
              fill="none"
              stroke="rgba(128,172,225,0.12)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d={path}
              fill="none"
              stroke={branch.glow}
              strokeWidth={10 + selection * 9}
              strokeLinecap="round"
              opacity={(0.12 + selection * 0.2) * draw}
              filter="url(#branch-blur)"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
            <path
              d={path}
              fill="none"
              stroke={`url(#branch-${branch.id})`}
              strokeWidth={routeWidth}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
            <path
              d={path}
              fill="none"
              stroke={branch.soft}
              strokeWidth="1"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.008 0.038"
              strokeDashoffset={-(frame * 0.0018 + index * 0.02)}
              opacity={draw * (0.32 + selection * 0.5)}
            />
            {frame >= 480 + index * 10 ? (
              <>
                <circle
                  cx={pulse.x}
                  cy={pulse.y}
                  r={branch.selected ? 8 + selection * 3 : 5.5}
                  fill={branch.soft}
                  opacity={evaluation * (branch.selected ? 0.94 : 0.54)}
                  filter="url(#pulse-glow)"
                />
                <circle
                  cx={pulse.x}
                  cy={pulse.y}
                  r={branch.selected ? 2.8 : 2}
                  fill="#ffffff"
                  opacity={evaluation}
                />
              </>
            ) : null}
            <circle
              cx={branch.p3.x}
              cy={branch.p3.y}
              r={7 + selection * 3}
              fill="#08152a"
              stroke={branch.accent}
              strokeWidth={2 + selection}
              opacity={draw}
            />
            <circle
              cx={branch.p3.x}
              cy={branch.p3.y}
              r={16 + selection * 12}
              fill="none"
              stroke={branch.accent}
              strokeWidth="1"
              opacity={draw * (0.24 + selection * 0.28)}
            />
          </g>
        );
      })}
    </svg>
  );
};

const DecisionCard: React.FC<{
  readonly branch: Branch;
  readonly index: number;
  readonly frame: number;
}> = ({ branch, index, frame }) => {
  const reveal = phase(
    frame,
    branch.start + 72,
    branch.start + 150,
    Easing.out(Easing.back(1.2)),
  );
  const inner = phase(frame, branch.start + 112, branch.start + 192);
  const selection = branch.selected
    ? phase(frame, 526 + (index % 2) * 20, 654 + (index % 2) * 20)
    : 0;
  const lock = phase(frame, 620, 728);
  const selectedPulse =
    branch.selected && frame > 640
      ? 0.5 + Math.sin((frame - 640) / 24) * 0.5
      : 0;
  const center = {
    x: branch.card.x + branch.card.width / 2,
    y: branch.card.y + branch.card.height / 2,
  };
  const vectorX = CENTER_X - center.x;
  const vectorY = CENTER_Y - center.y;
  const distance = Math.max(1, Math.hypot(vectorX, vectorY));
  const slideX = (vectorX / distance) * (1 - reveal) * 38;
  const slideY = (vectorY / distance) * (1 - reveal) * 38;
  const isHorizontal = branch.id === "north" || branch.id === "south";
  const iconLeft =
    branch.cardAngle === 180
      ? 18
      : branch.cardAngle === 0
        ? branch.card.width - 96
        : branch.card.width / 2 - 39;
  const iconTop =
    branch.cardAngle === 90
      ? branch.card.height - 96
      : branch.cardAngle === -90
        ? 18
        : branch.card.height / 2 - 39;
  const blankInset = isHorizontal
    ? branch.cardAngle === 90
      ? { left: 22, right: 22, top: 18, bottom: 82 }
      : { left: 22, right: 22, top: 82, bottom: 18 }
    : branch.cardAngle === 180
      ? { left: 100, right: 18, top: 18, bottom: 18 }
      : { left: 18, right: 100, top: 18, bottom: 18 };

  return (
    <div
      style={{
        position: "absolute",
        left: branch.card.x,
        top: branch.card.y,
        width: branch.card.width,
        height: branch.card.height,
        zIndex: 7,
        opacity: reveal * (branch.selected ? 1 : 1 - lock * 0.16),
        transform: `translate(${slideX}px, ${slideY}px) scale(${0.91 + reveal * 0.09 + selection * 0.012})`,
        transformOrigin: `${branch.p3.x - branch.card.x}px ${branch.p3.y - branch.card.y}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -18 - selection * 8,
          borderRadius: 36,
          background: `radial-gradient(ellipse at center, ${branch.glow}${branch.selected ? "32" : "1d"}, transparent 70%)`,
          filter: `blur(${14 + selection * 10}px)`,
          opacity: reveal * (0.5 + selection * 0.5),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          overflow: "hidden",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.145), rgba(102,144,215,0.07) 48%, rgba(12,24,50,0.30))",
          border: `${1.2 + selection * 1.2}px solid rgba(202,230,255,${0.26 + selection * 0.28})`,
          boxShadow: [
            `0 28px 56px rgba(0,2,14,${0.38 + selection * 0.12})`,
            "inset 0 1px 0 rgba(255,255,255,0.28)",
            `inset 0 0 28px ${branch.accent}${branch.selected ? "18" : "0b"}`,
            selection > 0 ? `0 0 ${30 + selection * 24}px ${branch.glow}2d` : "",
          ].join(","),
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -50 + Math.sin((frame + index * 47) / 95) * 12,
            top: -95,
            width: 240,
            height: 300,
            transform: "rotate(26deg)",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
            opacity: 0.45,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: branch.cardAngle === 0 ? 0 : undefined,
            right: branch.cardAngle === 180 ? 0 : undefined,
            top: branch.cardAngle === 90 ? 0 : undefined,
            bottom: branch.cardAngle === -90 ? 0 : undefined,
            width:
              branch.cardAngle === 0 || branch.cardAngle === 180 ? 4 : "100%",
            height:
              branch.cardAngle === 90 || branch.cardAngle === -90 ? 4 : "100%",
            background:
              branch.cardAngle === 0 || branch.cardAngle === 180
                ? `linear-gradient(180deg, transparent, ${branch.accent}, transparent)`
                : `linear-gradient(90deg, transparent, ${branch.accent}, transparent)`,
            boxShadow: `0 0 20px ${branch.glow}`,
            opacity: inner * (0.62 + selection * 0.3),
          }}
        />
        <div
          style={{
            position: "absolute",
            ...blankInset,
            borderRadius: 19,
            background:
              "linear-gradient(145deg, rgba(3,10,28,0.32), rgba(255,255,255,0.025))",
            border: "1px solid rgba(173,211,255,0.10)",
            boxShadow: "inset 0 10px 28px rgba(1,5,18,0.18)",
            opacity: inner,
          }}
        >
          <CornerGuides
            color={branch.soft}
            opacity={0.22 + selection * 0.26}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 54,
              height: 54,
              marginLeft: -27,
              marginTop: -27,
              borderRadius: "50%",
              border: `1px solid ${branch.accent}`,
              opacity: 0.055 + selection * 0.06,
              transform: `scale(${0.86 + Math.sin(frame / 52 + index) * 0.05})`,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: iconLeft,
            top: iconTop,
            width: 78,
            height: 78,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.22), ${branch.accent}20 48%, rgba(3,10,27,0.38) 100%)`,
            border: `1px solid ${branch.accent}66`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.24), 0 12px 24px rgba(0,3,18,0.28), 0 0 ${selection * 24}px ${branch.glow}55`,
            opacity: inner,
            transform: `scale(${0.86 + inner * 0.14 + selectedPulse * selection * 0.018})`,
          }}
        >
          <GeometricSymbol
            kind={branch.symbol}
            color={branch.soft}
            glow={branch.glow}
            progress={inner}
            frame={frame}
          />
        </div>
      </div>
      {branch.selected ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: -9 - selectedPulse * 4,
              borderRadius: 34,
              border: `1.5px solid ${branch.accent}`,
              opacity: selection * (0.24 + selectedPulse * 0.14),
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -18 - selectedPulse * 10,
              borderRadius: 42,
              border: `1px solid ${branch.accent}`,
              opacity: selection * (0.08 + selectedPulse * 0.08),
            }}
          />
        </>
      ) : null}
    </div>
  );
};

const DecisionCore: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 38, 146, Easing.out(Easing.back(1.22)));
  const rings = phase(frame, 76, 178);
  const evaluate = phase(frame, 448, 604, Easing.inOut(Easing.cubic));
  const lock = phase(frame, 600, 726, Easing.out(Easing.cubic));
  const breathe = 0.5 + Math.sin(frame / 32) * 0.5;
  const rotation = frame * (lock > 0 ? 0.045 : 0.11);

  return (
    <div
      style={{
        position: "absolute",
        left: CENTER_X - 236,
        top: CENTER_Y - 236,
        width: 472,
        height: 472,
        zIndex: 9,
        opacity: reveal,
        transform: `scale(${0.74 + reveal * 0.26 + lock * 0.025})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 18,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(88,205,255,0.16), rgba(97,88,242,0.06) 48%, transparent 72%)",
          filter: "blur(22px)",
          opacity: 0.6 + evaluate * 0.25,
        }}
      />
      <svg
        width="472"
        height="472"
        viewBox="0 0 472 472"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="core-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6deaff" />
            <stop offset="45%" stopColor="#817cff" />
            <stop offset="72%" stopColor="#f26cbd" />
            <stop offset="100%" stopColor="#ffc663" />
          </linearGradient>
          <radialGradient id="core-glass">
            <stop offset="0%" stopColor="#d8f7ff" stopOpacity="0.18" />
            <stop offset="46%" stopColor="#7b8cff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#061128" stopOpacity="0.72" />
          </radialGradient>
          <filter id="core-soft" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <circle
          cx="236"
          cy="236"
          r="219"
          fill="none"
          stroke="url(#core-ring)"
          strokeWidth="1.4"
          strokeDasharray="2 15"
          strokeDashoffset={-rotation * 0.12}
          opacity={rings * 0.34}
        />
        <circle
          cx="236"
          cy="236"
          r="194"
          fill="none"
          stroke="#bdefff"
          strokeWidth="1"
          strokeDasharray="1 20"
          strokeDashoffset={rotation * 0.18}
          opacity={rings * 0.18}
        />
        <circle
          cx="236"
          cy="236"
          r={164 + lock * 8}
          fill="none"
          stroke="url(#core-ring)"
          strokeWidth={8 + lock * 7}
          opacity={(0.09 + lock * 0.12) * rings}
          filter="url(#core-soft)"
        />
        {ORBITAL_MARKS.map((mark, index) => {
          const angle = mark.angle + rotation * 0.002;
          return (
            <circle
              key={index}
              cx={236 + Math.cos(angle) * mark.radius}
              cy={236 + Math.sin(angle) * mark.radius}
              r={mark.size}
              fill={BRANCHES[index % BRANCHES.length].accent}
              opacity={rings * (index % 6 === 0 ? 0.62 : 0.18)}
            />
          );
        })}
        <path
          d="M236 89 L363 162 L363 310 L236 383 L109 310 L109 162 Z"
          fill="url(#core-glass)"
          stroke="url(#core-ring)"
          strokeWidth={1.5 + lock * 1.2}
          opacity={0.94}
        />
        <path
          d="M236 112 L343 174 L343 298 L236 360 L129 298 L129 174 Z"
          fill="none"
          stroke="#d5f5ff"
          strokeWidth="1"
          strokeDasharray="2 11"
          strokeDashoffset={rotation * 0.1}
          opacity={0.23 + lock * 0.18}
        />
        <path
          d="M236 147 L313 191 L313 281 L236 325 L159 281 L159 191 Z"
          fill="rgba(4,14,37,0.54)"
          stroke="#a4dfff"
          strokeWidth="1.2"
          opacity={0.92}
        />
        {BRANCHES.map((branch, index) => {
          const angle = (index / 6) * TAU - Math.PI / 2;
          const inner = {
            x: 236 + Math.cos(angle) * 31,
            y: 236 + Math.sin(angle) * 31,
          };
          const outer = {
            x: 236 + Math.cos(angle) * (69 + evaluate * 18),
            y: 236 + Math.sin(angle) * (69 + evaluate * 18),
          };
          const nodeReveal = phase(frame, 94 + index * 8, 160 + index * 8);
          const selectedBoost = branch.selected ? lock : 0;
          return (
            <g key={branch.id} opacity={nodeReveal}>
              <path
                d={`M${inner.x} ${inner.y} L${outer.x} ${outer.y}`}
                stroke={branch.accent}
                strokeWidth={2 + selectedBoost * 2}
                opacity={0.46 + selectedBoost * 0.46}
              />
              <circle
                cx={outer.x}
                cy={outer.y}
                r={7 + selectedBoost * 4}
                fill="#07152c"
                stroke={branch.soft}
                strokeWidth={1.8 + selectedBoost}
              />
              <circle
                cx={outer.x}
                cy={outer.y}
                r={14 + breathe * selectedBoost * 5}
                fill="none"
                stroke={branch.accent}
                strokeWidth="1"
                opacity={0.18 + selectedBoost * 0.3}
              />
            </g>
          );
        })}
        <circle
          cx="236"
          cy="236"
          r={27 + breathe * 2 + lock * 5}
          fill={lock > 0 ? "#bff7ff" : "#74dfff"}
          opacity={0.12 + evaluate * 0.11 + lock * 0.12}
          filter="url(#core-soft)"
        />
        <circle
          cx="236"
          cy="236"
          r={16 + lock * 3}
          fill="#e7fbff"
          opacity={0.74 + lock * 0.18}
        />
        <circle
          cx="236"
          cy="236"
          r="7"
          fill="#ffffff"
          opacity={0.95}
        />
        {lock > 0 ? (
          <>
            <path
              d="M205 238 L226 259 L270 213"
              fill="none"
              stroke="#e7fbff"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - lock}
              opacity={lock}
            />
            <circle
              cx="236"
              cy="236"
              r={49 + lock * 9}
              fill="none"
              stroke="#7de6ff"
              strokeWidth="1.5"
              opacity={lock * (0.36 + breathe * 0.12)}
            />
          </>
        ) : null}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 96,
          clipPath:
            "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          background: `conic-gradient(from ${rotation}deg, rgba(255,255,255,0.17), transparent 16%, rgba(99,229,255,0.10), transparent 42%, rgba(236,90,188,0.10), transparent 70%, rgba(255,199,91,0.10), transparent)`,
          opacity: 0.54,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

const PortMarkers: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 112, 210);
  const lock = phase(frame, 604, 724);

  return (
    <>
      {BRANCHES.map((branch, index) => {
        const angle = (branch.portAngle * Math.PI) / 180;
        const radius = 163;
        const x = CENTER_X + Math.cos(angle) * radius;
        const y = CENTER_Y + Math.sin(angle) * radius;
        const local = phase(frame, 112 + index * 8, 182 + index * 8);
        const selected = branch.selected ? lock : 0;
        return (
          <div
            key={branch.id}
            style={{
              position: "absolute",
              left: x - 12,
              top: y - 12,
              width: 24,
              height: 24,
              zIndex: 12,
              borderRadius: "50%",
              background: `radial-gradient(circle, #ffffff 0 18%, ${branch.soft} 20% 38%, #09172f 42% 100%)`,
              border: `1.5px solid ${branch.accent}`,
              boxShadow: `0 0 ${12 + selected * 18}px ${branch.glow}`,
              opacity: reveal * local,
              transform: `scale(${0.7 + local * 0.3 + selected * 0.12})`,
            }}
          />
        );
      })}
    </>
  );
};

const SelectionField: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 586, 716);
  const settle = phase(frame, 700, 782);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 2 }}
      aria-hidden
    >
      <defs>
        <radialGradient id="selection-field">
          <stop offset="0%" stopColor="#69ddff" stopOpacity="0.11" />
          <stop offset="45%" stopColor="#8c75ff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#8c75ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="selected-axis" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff8f68" stopOpacity="0.02" />
          <stop offset="48%" stopColor="#d8f6ff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#719cff" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <ellipse
        cx={CENTER_X}
        cy={CENTER_Y}
        rx={520 + settle * 38}
        ry={400 + settle * 22}
        fill="url(#selection-field)"
        opacity={reveal}
      />
      <path
        d="M420 842 C665 738 780 648 960 540 C1140 432 1255 342 1500 238"
        fill="none"
        stroke="url(#selected-axis)"
        strokeWidth={38 + settle * 10}
        strokeLinecap="round"
        opacity={reveal}
      />
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={285 + settle * 22}
        fill="none"
        stroke="#95e8ff"
        strokeWidth="1"
        strokeDasharray="2 22"
        strokeDashoffset={frame * 0.13}
        opacity={reveal * 0.13}
      />
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={330 + settle * 28}
        fill="none"
        stroke="#a68fff"
        strokeWidth="1"
        strokeDasharray="1 30"
        strokeDashoffset={-frame * 0.1}
        opacity={reveal * 0.09}
      />
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = phase(frame, 0, 36, Easing.out(Easing.quad));
  const fadeOut =
    1 - phase(frame, 850, TOTAL_FRAMES - 1, Easing.in(Easing.quad));
  const construct = phase(frame, 20, 560, Easing.inOut(Easing.quad));
  const settle = phase(frame, 700, 818, Easing.inOut(Easing.quad));
  const scale = 0.982 + construct * 0.024 - settle * 0.012;
  const driftX = Math.sin(frame / 180) * 1.6;
  const driftY = Math.cos(frame / 220) * 1.2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#02050d", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <Background frame={frame} />
        <AbsoluteFill
          style={{
            transform: `translate(${driftX}px, ${driftY}px) scale(${scale})`,
            transformOrigin: "50% 50%",
          }}
        >
          <SelectionField frame={frame} />
          <BranchNetwork frame={frame} />
          {BRANCHES.map((branch, index) => (
            <DecisionCard
              key={branch.id}
              branch={branch}
              index={index}
              frame={frame}
            />
          ))}
          <DecisionCore frame={frame} />
          <PortMarkers frame={frame} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
