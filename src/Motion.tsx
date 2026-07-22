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
type IconKind =
  | "keyword"
  | "content"
  | "technical"
  | "performance"
  | "authority"
  | "analytics";

type SignalModule = {
  x: number;
  y: number;
  label: string;
  descriptor: string;
  detail: string;
  icon: IconKind;
  color: string;
  appearAt: number;
  connectorAt: number;
  sendStart: number;
  sendEnd: number;
  curve: number;
};

const W = 1920;
const H = 1080;
const CENTER: Point = {x: 960, y: 530};

const C = {
  bg: "#020a13",
  bg2: "#061827",
  bg3: "#09243a",
  panel: "#071a29",
  panelLight: "#0b2639",
  white: "#f4fbff",
  text: "#cce0eb",
  muted: "#718b9d",
  line: "#174158",
  lineSoft: "#0c2b3d",
  cyan: "#37dcff",
  blue: "#6f9cff",
  violet: "#a583ff",
  mint: "#43e0b4",
  green: "#64eca7",
  amber: "#ffc46a",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const easeSmooth = Easing.bezier(0.45, 0, 0.55, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const ramp = (time: number, start: number, end: number) =>
  interpolate(time, [start, end], [0, 1], {
    ...clamp,
    easing: easeSmooth,
  });

const outRamp = (time: number, start: number, end: number) =>
  interpolate(time, [start, end], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

const activityWindow = (time: number, start: number, end: number, feather = 0.2) =>
  Math.min(ramp(time, start, start + feather), 1 - ramp(time, end - feather, end));

const colorChannels = (color: string) => {
  if (color.startsWith("#")) {
    const clean = color.replace("#", "");
    return [
      Number.parseInt(clean.slice(0, 2), 16),
      Number.parseInt(clean.slice(2, 4), 16),
      Number.parseInt(clean.slice(4, 6), 16),
    ];
  }
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  return channels && channels.length === 3 ? channels : [255, 255, 255];
};

const alpha = (color: string, opacity: number) => {
  const [r, g, b] = colorChannels(color);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
};

const mix = (from: string, to: string, amount: number) => {
  const p = Math.max(0, Math.min(1, amount));
  const a = colorChannels(from);
  const b = colorChannels(to);
  return `rgb(${a.map((channel, index) => Math.round(channel + (b[index] - channel) * p)).join(", ")})`;
};

const MODULES: SignalModule[] = [
  {
    x: 392,
    y: 298,
    label: "KEYWORD RESEARCH",
    descriptor: "SEARCH INTENT",
    detail: "Query relevance",
    icon: "keyword",
    color: C.cyan,
    appearAt: 2.72,
    connectorAt: 3.46,
    sendStart: 5.18,
    sendEnd: 6.38,
    curve: -70,
  },
  {
    x: 300,
    y: 612,
    label: "CONTENT STRATEGY",
    descriptor: "TOPIC QUALITY",
    detail: "Helpful coverage",
    icon: "content",
    color: C.mint,
    appearAt: 2.94,
    connectorAt: 3.72,
    sendStart: 6.02,
    sendEnd: 7.12,
    curve: 58,
  },
  {
    x: 620,
    y: 848,
    label: "TECHNICAL SEO",
    descriptor: "CRAWLABILITY",
    detail: "Index pathways",
    icon: "technical",
    color: C.blue,
    appearAt: 3.16,
    connectorAt: 3.98,
    sendStart: 6.77,
    sendEnd: 7.76,
    curve: 74,
  },
  {
    x: 1300,
    y: 848,
    label: "SITE PERFORMANCE",
    descriptor: "PAGE EXPERIENCE",
    detail: "Speed signals",
    icon: "performance",
    color: C.amber,
    appearAt: 3.38,
    connectorAt: 4.24,
    sendStart: 7.41,
    sendEnd: 8.30,
    curve: -74,
  },
  {
    x: 1620,
    y: 612,
    label: "LINK AUTHORITY",
    descriptor: "TRUST SIGNALS",
    detail: "Relevant mentions",
    icon: "authority",
    color: C.violet,
    appearAt: 3.60,
    connectorAt: 4.50,
    sendStart: 7.96,
    sendEnd: 8.75,
    curve: -58,
  },
  {
    x: 1528,
    y: 298,
    label: "SEARCH ANALYTICS",
    descriptor: "VISIBILITY",
    detail: "Performance insight",
    icon: "analytics",
    color: C.green,
    appearAt: 3.82,
    connectorAt: 4.76,
    sendStart: 8.43,
    sendEnd: 9.16,
    curve: 70,
  },
];

const quadraticPoint = (start: Point, control: Point, end: Point, progress: number): Point => {
  const p = Math.max(0, Math.min(1, progress));
  const inverse = 1 - p;
  return {
    x: inverse * inverse * start.x + 2 * inverse * p * control.x + p * p * end.x,
    y: inverse * inverse * start.y + 2 * inverse * p * control.y + p * p * end.y,
  };
};

const makeRoute = (module: SignalModule) => {
  const dx = module.x - CENTER.x;
  const dy = module.y - CENTER.y;
  const distance = Math.hypot(dx, dy);
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const start = {x: module.x, y: module.y};
  const end = {
    x: CENTER.x + (dx / distance) * 242,
    y: CENTER.y + (dy / distance) * 242,
  };
  const control = {
    x: (start.x + end.x) / 2 + normalX * module.curve,
    y: (start.y + end.y) / 2 + normalY * module.curve,
  };
  let length = 0;
  let previous = start;
  for (let index = 1; index <= 40; index++) {
    const point = quadraticPoint(start, control, end, index / 40);
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return {start, control, end, length};
};

const ROUTES = MODULES.map(makeRoute);

const meshNodes = Array.from({length: 72}, (_, index) => ({
  x: 42 + ((index * 277 + (index % 7) * 41) % 1838),
  y: 72 + ((index * 163 + (index % 5) * 67) % 930),
  radius: 1 + (index % 4) * 0.55,
  phase: (index * 0.73) % (Math.PI * 2),
}));

const meshEdges = meshNodes.flatMap((node, index) => {
  const candidates = [index + 1, index + 8, index + 13];
  return candidates
    .filter((target) => target < meshNodes.length)
    .map((target) => ({from: node, to: meshNodes[target], seed: index + target}))
    .filter((edge) => Math.hypot(edge.to.x - edge.from.x, edge.to.y - edge.from.y) < 390);
});

const microTerms = [
  {x: 86, y: 208, text: "QUERY SIGNALS"},
  {x: 178, y: 882, text: "INDEX COVERAGE"},
  {x: 768, y: 166, text: "RELEVANCE"},
  {x: 1132, y: 168, text: "SEMANTIC CONTEXT"},
  {x: 1572, y: 882, text: "ORGANIC REACH"},
  {x: 1690, y: 204, text: "RANK INSIGHT"},
];

const SignalIcon: React.FC<{kind: IconKind; color: string; size?: number}> = ({
  kind,
  color,
  size = 58,
}) => {
  const shared = {
    fill: "none",
    stroke: color,
    strokeWidth: 2.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{display: "block"}}>
      {kind === "keyword" && (
        <>
          <circle cx="25" cy="25" r="14" {...shared} />
          <path d="M35 35l14 14" {...shared} />
          <path d="M17 27l5-5 5 3 7-8" {...shared} />
          <path d="M44 20v13M51 15v18M58 9v24" {...shared} />
        </>
      )}
      {kind === "content" && (
        <>
          <path d="M13 7h27l11 11v39H13z" {...shared} />
          <path d="M40 7v12h11M21 29h22M21 37h22M21 45h14" {...shared} />
          <path d="M10 15H7v42h34" {...shared} />
        </>
      )}
      {kind === "technical" && (
        <>
          <rect x="25" y="7" width="14" height="12" rx="3" {...shared} />
          <rect x="7" y="45" width="14" height="12" rx="3" {...shared} />
          <rect x="25" y="45" width="14" height="12" rx="3" {...shared} />
          <rect x="43" y="45" width="14" height="12" rx="3" {...shared} />
          <path d="M32 19v12M14 39v-8h36v8M32 31v8" {...shared} />
          <path d="M19 24l-6 6 6 6M45 24l6 6-6 6" {...shared} />
        </>
      )}
      {kind === "performance" && (
        <>
          <path d="M10 47a23 23 0 1 1 44 0" {...shared} />
          <path d="M17 42l-5-3M21 28l-4-5M32 24V16M43 28l4-5M47 42l5-3" {...shared} />
          <path d="M32 43l13-13" {...shared} />
          <circle cx="32" cy="43" r="4" fill={color} stroke="none" />
          <path d="M19 53h26" {...shared} />
        </>
      )}
      {kind === "authority" && (
        <>
          <path d="M27 39l-5 5a10 10 0 0 1-14-14l9-9a10 10 0 0 1 14 0" {...shared} />
          <path d="M37 25l5-5a10 10 0 0 1 14 14l-9 9a10 10 0 0 1-14 0" {...shared} />
          <path d="M23 41l18-18" {...shared} />
          <circle cx="12" cy="52" r="3" fill={color} stroke="none" />
          <circle cx="52" cy="12" r="3" fill={color} stroke="none" />
        </>
      )}
      {kind === "analytics" && (
        <>
          <path d="M10 8v46h46" {...shared} />
          <path d="M17 43l10-11 9 5 14-19" {...shared} />
          <circle cx="17" cy="43" r="3" fill={C.panel} stroke={color} strokeWidth="2.5" />
          <circle cx="27" cy="32" r="3" fill={C.panel} stroke={color} strokeWidth="2.5" />
          <circle cx="36" cy="37" r="3" fill={C.panel} stroke={color} strokeWidth="2.5" />
          <circle cx="50" cy="18" r="3" fill={color} stroke="none" />
          <path d="M44 11h13v13" {...shared} />
        </>
      )}
    </svg>
  );
};

const Background: React.FC<{time: number}> = ({time}) => {
  const driftX = Math.sin(time * 0.19) * 12;
  const driftY = Math.cos(time * 0.16) * 8;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(circle at 50% 48%, ${alpha(C.bg3, 0.72)} 0%, ${alpha(C.bg2, 0.42)} 28%, transparent 58%), ` +
            `linear-gradient(180deg, ${C.bg} 0%, #03101b 52%, ${C.bg} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -80,
          opacity: 0.34,
          transform: `translate(${driftX}px, ${driftY}px)`,
          backgroundImage:
            `linear-gradient(${alpha(C.cyan, 0.055)} 1px, transparent 1px), ` +
            `linear-gradient(90deg, ${alpha(C.cyan, 0.055)} 1px, transparent 1px)`,
          backgroundSize: "84px 84px",
          maskImage: "radial-gradient(circle at center, black 8%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 8%, transparent 78%)",
        }}
      />
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{position: "absolute", inset: 0, overflow: "visible"}}
      >
        <defs>
          <radialGradient id="mesh-node" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.cyan} stopOpacity="0.95" />
            <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${driftX * 0.34} ${driftY * 0.34})`}>
          {meshEdges.map((edge, index) => {
            const shimmer = 0.45 + 0.55 * Math.sin(time * 0.48 + edge.seed * 0.31);
            return (
              <line
                key={`edge-${index}`}
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                stroke={C.cyan}
                strokeWidth="1"
                opacity={0.035 + shimmer * 0.035}
              />
            );
          })}
          {meshNodes.map((node, index) => {
            const pulse = 0.55 + 0.45 * Math.sin(time * 0.7 + node.phase);
            return (
              <g key={`mesh-${index}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius * 4.2}
                  fill="url(#mesh-node)"
                  opacity={0.05 + pulse * 0.07}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={index % 5 === 0 ? C.mint : C.cyan}
                  opacity={0.2 + pulse * 0.28}
                />
              </g>
            );
          })}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 116 + ((time * 17) % 820),
          height: 1,
          opacity: 0.14,
          background: `linear-gradient(90deg, transparent 4%, ${alpha(C.cyan, 0.8)} 50%, transparent 96%)`,
          boxShadow: `0 0 16px ${alpha(C.cyan, 0.34)}`,
        }}
      />
      {microTerms.map((term, index) => (
        <div
          key={term.text}
          style={{
            position: "absolute",
            left: term.x,
            top: term.y,
            color: index % 2 === 0 ? C.cyan : C.mint,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.22em",
            opacity: 0.12 + 0.035 * Math.sin(time * 0.55 + index),
          }}
        >
          {term.text}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Header: React.FC<{time: number}> = ({time}) => {
  const reveal = outRamp(time, 0.42, 1.45);
  const final = ramp(time, 9.15, 10.0);
  const resultColor = mix(C.cyan, C.green, final);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 55,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 18}px)`,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            color: resultColor,
            fontSize: 11,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: "0.28em",
            marginBottom: 12,
          }}
        >
          ORGANIC DISCOVERY SYSTEM
        </div>
        <div
          style={{
            color: C.white,
            fontSize: 24,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          SEARCH VISIBILITY INTELLIGENCE
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 78,
          width: 1764,
          top: 118,
          height: 1,
          opacity: reveal,
          background: `linear-gradient(90deg, ${alpha(C.cyan, 0.55)}, ${alpha(C.cyan, 0.08)} 48%, transparent 82%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1410,
          top: 61,
          width: 432,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 13,
          opacity: reveal,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: resultColor,
            boxShadow: `0 0 14px ${resultColor}`,
          }}
        />
        <div style={{color: C.text, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em"}}>
          {final > 0.5 ? "OPTIMIZED" : "LIVE SIGNAL MAP"}
        </div>
        <div
          style={{
            color: C.muted,
            fontSize: 10,
            letterSpacing: "0.14em",
            padding: "7px 10px",
            border: `1px solid ${alpha(C.cyan, 0.2)}`,
            borderRadius: 4,
          }}
        >
          06 CHANNELS
        </div>
      </div>
    </>
  );
};

const RouteLayer: React.FC<{time: number}> = ({time}) => {
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{position: "absolute", inset: 0, overflow: "visible", zIndex: 2}}
    >
      <defs>
        <filter id="packet-glow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {MODULES.map((module, index) => {
        const route = ROUTES[index];
        const reveal = ramp(time, module.connectorAt, module.connectorAt + 0.88);
        const complete = ramp(time, module.sendEnd, module.sendEnd + 0.42);
        const packetProgress = ramp(time, module.sendStart, module.sendEnd);
        const packetOpacity = activityWindow(
          time,
          module.sendStart - 0.12,
          module.sendEnd + 0.22,
          0.2,
        );
        const d = `M ${route.start.x} ${route.start.y} Q ${route.control.x} ${route.control.y} ${route.end.x} ${route.end.y}`;
        return (
          <g key={module.label}>
            <path
              d={d}
              fill="none"
              stroke={C.lineSoft}
              strokeWidth="2"
              opacity={0.68 * reveal}
              strokeDasharray="5 12"
            />
            <path
              d={d}
              fill="none"
              stroke={module.color}
              strokeWidth="1.8"
              opacity={(0.48 + complete * 0.18) * reveal}
              strokeDasharray={route.length}
              strokeDashoffset={route.length * (1 - reveal)}
              strokeLinecap="round"
            />
            <path
              d={d}
              fill="none"
              stroke={C.green}
              strokeWidth="2.2"
              opacity={complete * 0.52}
              strokeDasharray={route.length}
              strokeDashoffset={route.length * (1 - reveal)}
              strokeLinecap="round"
            />
            {[0.058, 0.032, 0].map((offset, trailIndex) => {
              const progress = Math.max(0, packetProgress - offset);
              const point = quadraticPoint(route.start, route.control, route.end, progress);
              return (
                <circle
                  key={`packet-${trailIndex}`}
                  cx={point.x}
                  cy={point.y}
                  r={trailIndex === 2 ? 5.2 : 2.8 + trailIndex * 0.65}
                  fill={trailIndex === 2 ? C.white : module.color}
                  opacity={packetOpacity * (0.2 + trailIndex * 0.33)}
                  filter={trailIndex === 2 ? "url(#packet-glow)" : undefined}
                />
              );
            })}
            <circle
              cx={route.end.x}
              cy={route.end.y}
              r={5 + complete * 3}
              fill={complete > 0.5 ? C.green : module.color}
              opacity={reveal * (0.45 + complete * 0.4)}
            />
          </g>
        );
      })}
    </svg>
  );
};

const ModuleCard: React.FC<{
  module: SignalModule;
  index: number;
  time: number;
  frame: number;
  fps: number;
}> = ({module, index, time, frame, fps}) => {
  const appearFrame = module.appearAt * fps;
  const settle =
    frame < appearFrame
      ? 0
      : spring({
          frame: frame - appearFrame,
          fps,
          config: {damping: 28, stiffness: 125, mass: 0.85},
          durationInFrames: 66,
        });
  const activity = activityWindow(
    time,
    module.sendStart - 0.25,
    module.sendEnd + 0.34,
    0.28,
  );
  const complete = ramp(time, module.sendEnd, module.sendEnd + 0.42);
  const detailExit = ramp(time, module.sendEnd, module.sendEnd + 0.22);
  const verifyEnter = ramp(time, module.sendEnd + 0.16, module.sendEnd + 0.42);
  const radialX = (CENTER.x - module.x) * 0.09 * (1 - settle);
  const radialY = (CENTER.y - module.y) * 0.09 * (1 - settle);
  const accent = mix(module.color, C.green, complete);

  return (
    <div
      style={{
        position: "absolute",
        left: module.x - 160,
        top: module.y - 61,
        width: 320,
        height: 122,
        opacity: settle,
        transform: `translate(${radialX}px, ${radialY}px) scale(${0.86 + settle * 0.14})`,
        transformOrigin: "center",
        zIndex: 5,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 320,
          height: 122,
          borderRadius: 18,
          border: `1px solid ${alpha(accent, 0.26 + activity * 0.48)}`,
          background:
            `linear-gradient(135deg, ${alpha(accent, 0.11 + activity * 0.09)}, transparent 58%), ` +
            `linear-gradient(160deg, ${alpha(C.panelLight, 0.9)}, ${alpha(C.panel, 0.94)})`,
          boxShadow:
            `0 18px 42px rgba(0,0,0,0.28), ` +
            `0 0 ${12 + activity * 30}px ${alpha(accent, 0.06 + activity * 0.14)}, ` +
            `inset 0 1px 0 rgba(255,255,255,0.04)`,
          overflow: "hidden",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 20,
          width: 3,
          height: 82,
          borderRadius: "0 4px 4px 0",
          background: accent,
          opacity: 0.64 + activity * 0.36,
          boxShadow: `0 0 14px ${alpha(accent, 0.72)}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 27,
          width: 67,
          height: 67,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: alpha(accent, 0.075 + activity * 0.08),
          border: `1px solid ${alpha(accent, 0.2 + activity * 0.24)}`,
        }}
      >
        <SignalIcon kind={module.icon} color={accent} size={48} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 105,
          top: 24,
          right: 20,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: 9,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: "0.18em",
            marginBottom: 10,
          }}
        >
          0{index + 1} / {module.descriptor}
        </div>
        <div
          style={{
            color: C.white,
            fontSize: module.label.length > 16 ? 14 : 15,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "0.025em",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {module.label}
        </div>
        <div style={{position: "relative", height: 13, marginTop: 10, overflow: "hidden"}}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              color: C.muted,
              fontSize: 11,
              lineHeight: 1,
              letterSpacing: "0.06em",
              opacity: 1 - detailExit,
              transform: `translateY(${-detailExit * 8}px)`,
            }}
          >
            {module.detail}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              color: C.muted,
              fontSize: 11,
              lineHeight: 1,
              letterSpacing: "0.06em",
              opacity: verifyEnter,
              transform: `translateY(${(1 - verifyEnter) * 8}px)`,
            }}
          >
            SIGNAL VERIFIED
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 12,
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: accent,
          opacity: 0.35 + activity * 0.65,
          boxShadow: `0 0 10px ${accent}`,
        }}
      />
    </div>
  );
};

const Core: React.FC<{time: number; frame: number; fps: number}> = ({time, frame, fps}) => {
  const coreReveal = outRamp(time, 0.72, 2.18);
  const ringDraw = ramp(time, 0.82, 2.48);
  const final = ramp(time, 9.12, 10.0);
  const subtitleExit = ramp(time, 9.08, 9.48);
  const subtitleEnter = ramp(time, 9.44, 9.9);
  const resultColor = mix(C.cyan, C.green, final);
  const completed = MODULES.reduce(
    (total, module) => total + ramp(time, module.sendEnd, module.sendEnd + 0.34),
    0,
  );
  const count = Math.min(6, Math.floor(completed + 0.001));
  const arrivalEnergy = Math.min(
    1,
    MODULES.reduce(
      (total, module) =>
        total + activityWindow(time, module.sendEnd - 0.08, module.sendEnd + 0.58, 0.15),
      0,
    ),
  );
  const progress = Math.min(1, 0.12 + (completed / 6) * 0.88);
  const circumference = 2 * Math.PI * 205;
  const orbitTime = Math.min(time, 12.82);

  return (
    <div
      style={{
        position: "absolute",
        left: CENTER.x - 280,
        top: CENTER.y - 280,
        width: 560,
        height: 560,
        zIndex: 4,
        opacity: coreReveal,
        transform: `scale(${0.82 + coreReveal * 0.18 + arrivalEnergy * 0.012})`,
        transformOrigin: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 72,
          width: 416,
          height: 416,
          borderRadius: "50%",
          background:
            `radial-gradient(circle at 46% 40%, ${alpha(C.cyan, 0.12 + arrivalEnergy * 0.12)}, transparent 44%), ` +
            `radial-gradient(circle, ${alpha(C.panelLight, 0.93)}, ${alpha(C.panel, 0.96)} 66%, ${alpha(C.bg, 0.96)} 100%)`,
          border: `1px solid ${alpha(resultColor, 0.34 + arrivalEnergy * 0.3)}`,
          boxShadow:
            `0 0 ${50 + arrivalEnergy * 42}px ${alpha(resultColor, 0.1 + arrivalEnergy * 0.12)}, ` +
            `inset 0 0 64px ${alpha(C.cyan, 0.06)}`,
        }}
      />
      <svg width="560" height="560" viewBox="0 0 560 560" style={{position: "absolute", inset: 0}}>
        <defs>
          <filter id="core-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="280"
          cy="280"
          r="246"
          fill="none"
          stroke={C.line}
          strokeWidth="1"
          opacity="0.42"
          strokeDasharray="2 10"
          transform={`rotate(${orbitTime * 2.1} 280 280)`}
        />
        <circle
          cx="280"
          cy="280"
          r="231"
          fill="none"
          stroke={C.cyan}
          strokeWidth="1.2"
          opacity={0.2 * ringDraw}
          strokeDasharray="84 48 24 62"
          transform={`rotate(${-orbitTime * 2.8} 280 280)`}
        />
        <circle
          cx="280"
          cy="280"
          r="205"
          fill="none"
          stroke={C.lineSoft}
          strokeWidth="7"
          opacity="0.78"
        />
        <circle
          cx="280"
          cy="280"
          r="205"
          fill="none"
          stroke={resultColor}
          strokeWidth="7"
          opacity={0.8 * ringDraw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(ringDraw, progress))}
          transform="rotate(-90 280 280)"
          filter="url(#core-glow)"
        />
        {Array.from({length: 48}, (_, index) => {
          const angle = (index / 48) * Math.PI * 2 - Math.PI / 2;
          const active = index / 48 <= Math.min(ringDraw, progress);
          const inner = 218;
          const outer = index % 4 === 0 ? 228 : 224;
          return (
            <line
              key={`tick-${index}`}
              x1={280 + Math.cos(angle) * inner}
              y1={280 + Math.sin(angle) * inner}
              x2={280 + Math.cos(angle) * outer}
              y2={280 + Math.sin(angle) * outer}
              stroke={active ? resultColor : C.line}
              strokeWidth={index % 4 === 0 ? 2 : 1}
              opacity={0.25 + (active ? 0.55 : 0)}
            />
          );
        })}
        {[0, 1, 2].map((index) => {
          const angle = orbitTime * (0.32 + index * 0.055) + index * 2.12;
          const radius = 231 + (index - 1) * 13;
          return (
            <g key={`orbiter-${index}`}>
              <circle
                cx={280 + Math.cos(angle) * radius}
                cy={280 + Math.sin(angle) * radius}
                r={index === 1 ? 5 : 3.5}
                fill={index === 2 ? C.mint : C.cyan}
                opacity={0.42 + coreReveal * 0.5}
                filter="url(#core-glow)"
              />
            </g>
          );
        })}
        {MODULES.map((module, index) => {
          const impact = activityWindow(time, module.sendEnd, module.sendEnd + 0.56, 0.12);
          return (
            <circle
              key={`impact-${index}`}
              cx="280"
              cy="280"
              r={181 + ramp(time, module.sendEnd, module.sendEnd + 0.56) * 72}
              fill="none"
              stroke={module.color}
              strokeWidth="2"
              opacity={impact * 0.34}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 142,
          top: 151,
          width: 276,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: resultColor,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.28em",
            lineHeight: 1,
            marginBottom: 19,
          }}
        >
          SEARCH SIGNAL CORE
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 128,
            gap: 1,
          }}
        >
          {["S", "E", "O"].map((letter, index) => {
            const appearFrame = (1.02 + index * 0.12) * fps;
            const letterSettle =
              frame < appearFrame
                ? 0
                : spring({
                    frame: frame - appearFrame,
                    fps,
                    config: {damping: 24, stiffness: 112, mass: 0.8},
                    durationInFrames: 58,
                  });
            return (
              <span
                key={letter}
                style={{
                  display: "inline-block",
                  color: C.white,
                  fontSize: 118,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.07em",
                  opacity: letterSettle,
                  transform: `translateY(${(1 - letterSettle) * 42}px) scale(${0.82 + letterSettle * 0.18})`,
                  textShadow:
                    `0 0 22px ${alpha(resultColor, 0.42)}, ` +
                    `0 2px 0 ${alpha(C.cyan, 0.26)}`,
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
        <div
          style={{
            position: "relative",
            left: -42,
            width: 360,
            height: 22,
            marginTop: 5,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 360,
              top: 0,
              color: C.text,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.18em",
              lineHeight: 1,
              opacity: 1 - subtitleExit,
              transform: `translateY(${-subtitleExit * 22}px)`,
            }}
          >
            SEARCH ENGINE OPTIMIZATION
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 360,
              top: 0,
              color: C.green,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.18em",
              lineHeight: 1,
              opacity: subtitleEnter,
              transform: `translateY(${(1 - subtitleEnter) * 22}px)`,
              textShadow: `0 0 14px ${alpha(C.green, 0.52)}`,
            }}
          >
            VISIBILITY OPTIMIZED
          </div>
        </div>
        <div
          style={{
            margin: "1px auto 0",
            width: 204,
            height: 31,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            color: mix(C.muted, C.green, final),
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.15em",
            border: `1px solid ${alpha(resultColor, 0.18 + final * 0.34)}`,
            background: alpha(resultColor, 0.04 + final * 0.06),
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: resultColor,
              boxShadow: `0 0 10px ${resultColor}`,
            }}
          />
          {final > 0.5 ? "ORGANIC GROWTH" : `SIGNALS 0${count} / 06`}
        </div>
      </div>
    </div>
  );
};

const StatusRail: React.FC<{time: number}> = ({time}) => {
  const reveal = outRamp(time, 1.15, 2.05);
  const final = ramp(time, 9.15, 10.0);
  const stages = [
    {label: "DISCOVER", at: 2.2},
    {label: "UNDERSTAND", at: 5.1},
    {label: "OPTIMIZE", at: 7.25},
    {label: "MEASURE", at: 8.75},
  ];
  const status =
    time < 5.1
      ? "MAPPING SEARCH SIGNALS"
      : time < 7.25
        ? "ANALYZING RELEVANCE"
        : time < 8.75
          ? "COMBINING RANKING SIGNALS"
          : time < 9.55
            ? "MEASURING VISIBILITY"
            : "ORGANIC DISCOVERY READY";
  return (
    <div
      style={{
        position: "absolute",
        left: 78,
        top: 960,
        width: 1764,
        height: 68,
        opacity: reveal,
        zIndex: 7,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1764,
          top: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(C.cyan, 0.22)} 15%, ${alpha(C.cyan, 0.22)} 85%, transparent)`,
        }}
      />
      <div style={{position: "absolute", left: 0, top: 27, display: "flex", gap: 28}}>
        {stages.map((stage, index) => {
          const active = ramp(time, stage.at, stage.at + 0.45);
          const nextAt = stages[index + 1]?.at ?? 99;
          const current = active * (1 - ramp(time, nextAt, nextAt + 0.35));
          return (
            <div key={stage.label} style={{display: "flex", alignItems: "center", gap: 10}}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: active > 0.5 ? (final > 0.5 ? C.green : C.cyan) : C.line,
                  boxShadow: current > 0.1 ? `0 0 14px ${C.cyan}` : "none",
                }}
              />
              <div
                style={{
                  color: active > 0.5 ? C.text : C.muted,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  opacity: 0.46 + active * 0.54,
                }}
              >
                0{index + 1} {stage.label}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 1180,
          top: 24,
          width: 584,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 13,
          color: final > 0.5 ? C.green : C.text,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.18em",
        }}
      >
        <span>{status}</span>
        <span style={{color: C.muted}}>{final > 0.5 ? "100%" : `${Math.round(ramp(time, 2.2, 9.55) * 100)}%`}</span>
      </div>
    </div>
  );
};

const IntroBloom: React.FC<{time: number}> = ({time}) => {
  const bloom = activityWindow(time, 0.18, 1.72, 0.46);
  const expand = outRamp(time, 0.18, 1.45);
  return (
    <div
      style={{
        position: "absolute",
        left: CENTER.x - 290,
        top: CENTER.y - 290,
        width: 580,
        height: 580,
        borderRadius: "50%",
        opacity: bloom,
        transform: `scale(${0.15 + expand * 1.22})`,
        background: `radial-gradient(circle, ${alpha(C.cyan, 0.18)}, ${alpha(C.cyan, 0.035)} 46%, transparent 70%)`,
        border: `1px solid ${alpha(C.cyan, 0.17)}`,
        boxShadow: `0 0 90px ${alpha(C.cyan, 0.12)}`,
        zIndex: 1,
      }}
    />
  );
};

const OutroVeil: React.FC<{time: number}> = ({time}) => {
  const progress = ramp(time, 13.24, 14.18);
  const opacity = activityWindow(time, 13.18, 14.48, 0.22);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CENTER.x - 230,
          top: CENTER.y - 230,
          width: 460,
          height: 460,
          borderRadius: "50%",
          transform: `scale(${0.2 + progress * 5.4})`,
          opacity,
          border: `2px solid ${alpha(C.cyan, 0.42 * (1 - progress))}`,
          background: `radial-gradient(circle, transparent 0%, ${alpha(C.bg, 0.22)} 42%, ${alpha(C.bg, 0.92)} 73%)`,
          boxShadow: `0 0 70px ${alpha(C.cyan, 0.14 * (1 - progress))}`,
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: ramp(time, 13.68, 14.22) * (1 - ramp(time, 14.22, 14.5)),
          background: `radial-gradient(circle at 50% 49%, ${alpha(C.cyan, 0.08)}, ${alpha(C.bg, 0.98)} 74%)`,
          zIndex: 19,
        }}
      />
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const heldTime = Math.min(time, 12.82);
  const intro = ramp(time, 0.12, 0.86);
  const outro = ramp(time, 13.36, 14.16);
  const sceneOpacity = intro * (1 - outro);

  const introScale = interpolate(heldTime, [0, 1.72], [0.955, 1], {
    ...clamp,
    easing: easeOut,
  });
  const push = ramp(heldTime, 3.1, 8.75);
  const pull = ramp(heldTime, 9.05, 11.45);
  const cameraScale = introScale + push * 0.022 - pull * 0.064;
  const cameraLock = 1 - ramp(heldTime, 10.7, 12.2);
  const cameraX = Math.sin(heldTime * 0.44) * 7 * cameraLock + push * 4 - pull * 3;
  const cameraY = Math.cos(heldTime * 0.36) * 4 * cameraLock - push * 2 + pull * 3;

  return (
    <AbsoluteFill
      style={{
        width: W,
        height: H,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${C.bg} 0%, #03101b 54%, ${C.bg} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: sceneOpacity,
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
          transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
        }}
      >
        <Background time={heldTime} />
        <IntroBloom time={time} />
        <Header time={time} />
        <RouteLayer time={time} />
        <Core time={time} frame={frame} fps={fps} />
        {MODULES.map((module, index) => (
          <ModuleCard
            key={module.label}
            module={module}
            index={index}
            time={time}
            frame={frame}
            fps={fps}
          />
        ))}
        <StatusRail time={time} />
      </div>
      <OutroVeil time={time} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at center, transparent 54%, rgba(0,5,10,0.38) 100%)",
          zIndex: 30,
        }}
      />
    </AbsoluteFill>
  );
};
