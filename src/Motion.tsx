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
type StageKind = "raw" | "context" | "reason" | "decision";
type ModuleKind = "database" | "cloud" | "memory" | "tool" | "security";
type Transit = {
  start: number;
  end: number;
  reverse?: boolean;
  pingPong?: boolean;
};

const W = 1920;
const H = 1080;
const WORLD_W = 2480;

const C = {
  bg: "#020813",
  bg2: "#061425",
  panel: "#081b2c",
  panelDeep: "#03101d",
  line: "#183a55",
  lineSoft: "#0e293f",
  white: "#f1f8ff",
  text: "#d9e9f5",
  muted: "#7894aa",
  cyan: "#2ad9ff",
  blue: "#2687ff",
  violet: "#8b7cff",
  amber: "#ffb85a",
  mint: "#42e69a",
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

const mix = (from: string, to: string, amount: number) => {
  const p = Math.max(0, Math.min(1, amount));
  const parse = (hex: string) => {
    const value = hex.replace("#", "");
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    ];
  };
  const a = parse(from);
  const b = parse(to);
  return `rgb(${a.map((channel, index) => Math.round(channel + (b[index] - channel) * p)).join(", ")})`;
};

const ramp = (time: number, start: number, end: number) =>
  interpolate(time, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const fastRamp = (time: number, start: number, end: number) =>
  interpolate(time, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const activityWindow = (time: number, start: number, end: number, feather = 0.3) => {
  const enter = ramp(time, start, start + feather);
  const exit = 1 - ramp(time, end - feather, end);
  return Math.min(enter, exit);
};

const routeLength = (points: Point[]) =>
  points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);

const pointOnRoute = (points: Point[], rawProgress: number) => {
  const progress = Math.max(0, Math.min(1, rawProgress));
  const total = routeLength(points);
  let remaining = total * progress;

  for (let index = 1; index < points.length; index++) {
    const a = points[index - 1];
    const b = points[index];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= length || index === points.length - 1) {
      const local = length === 0 ? 0 : remaining / length;
      return {
        x: a.x + (b.x - a.x) * local,
        y: a.y + (b.y - a.y) * local,
      };
    }
    remaining -= length;
  }

  return points[points.length - 1];
};

const pointString = (points: Point[]) => points.map((point) => `${point.x},${point.y}`).join(" ");

const backgroundParticles = Array.from({length: 46}, (_, index) => ({
  x: 72 + ((index * 223) % 1780),
  y: 120 + ((index * 137) % 800),
  radius: 0.8 + (index % 3) * 0.65,
  phase: (index * 0.73) % (Math.PI * 2),
  opacity: 0.06 + (index % 5) * 0.018,
}));

const rawFragments = Array.from({length: 42}, (_, index) => ({
  targetX: 38 + (index % 7) * 47,
  targetY: 48 + Math.floor(index / 7) * 32,
  startX: -130 + ((index * 97) % 620),
  startY: -90 + ((index * 163) % 470),
  width: 4 + (index % 4) * 3,
  height: 3 + (index % 3) * 2,
  delay: (index % 8) * 0.045 + Math.floor(index / 8) * 0.018,
}));

const Packet: React.FC<{
  points: Point[];
  transit: Transit;
  color: string;
  time: number;
  delay?: number;
}> = ({points, transit, color, time, delay = 0}) => {
  const start = transit.start + delay;
  const end = transit.end + delay;
  const visibility = activityWindow(time, start - 0.08, end + 0.1, 0.1);
  if (visibility <= 0) return null;

  const linear = interpolate(time, [start, end], [0, 1], clamp);
  const eased = Easing.inOut(Easing.cubic)(linear);
  let progress = eased;
  let direction = 1;
  if (transit.pingPong) {
    const returning = eased > 0.5;
    progress = returning ? (1 - eased) * 2 : eased * 2;
    direction = returning ? -1 : 1;
  }
  if (transit.reverse) {
    progress = 1 - progress;
    direction *= -1;
  }

  const position = pointOnRoute(points, progress);
  const tail = pointOnRoute(points, Math.max(0, Math.min(1, progress - direction * 0.035)));

  return (
    <g opacity={visibility}>
      <line
        x1={tail.x}
        y1={tail.y}
        x2={position.x}
        y2={position.y}
        stroke={color}
        strokeWidth={11}
        strokeLinecap="round"
        opacity={0.24}
        filter="url(#pipelineGlow)"
      />
      <circle cx={position.x} cy={position.y} r={11} fill={alpha(color, 0.12)} />
      <circle cx={position.x} cy={position.y} r={5.5} fill={color} filter="url(#pipelineGlow)" />
      <circle cx={position.x - 1.6} cy={position.y - 1.7} r={1.6} fill="#ffffff" />
    </g>
  );
};

const PipelineRoute: React.FC<{
  points: Point[];
  color: string;
  revealAt: number;
  time: number;
  motionTime: number;
  finalHold: number;
  transits?: Transit[];
  packetCount?: number;
  subtle?: boolean;
}> = ({
  points,
  color,
  revealAt,
  time,
  motionTime,
  finalHold,
  transits = [],
  packetCount = 1,
  subtle = false,
}) => {
  const length = routeLength(points);
  const reveal = fastRamp(time, revealAt, revealAt + (subtle ? 0.48 : 0.32));
  const delayedTransitActivity = transits.map((transit) => {
    const packetGap = Math.max(0.08, (transit.end - transit.start) * 0.13);
    const lastPacketDelay = Math.max(0, packetCount - 1) * packetGap;
    return activityWindow(time, transit.start - 0.14, transit.end + lastPacketDelay + 0.2, 0.18);
  });
  const activity = Math.max(
    ...delayedTransitActivity,
    finalHold * (subtle ? 0.48 : 0.72),
  );
  const dashPhase = interpolate(
    motionTime,
    [0, 4.6, 6.2, 8.8, 10.2, 11.55],
    [0, 92, 160, 451, 667, 771],
    clamp,
  );

  return (
    <g>
      <polyline
        points={pointString(points)}
        fill="none"
        stroke={C.lineSoft}
        strokeWidth={subtle ? 3 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <polyline
        points={pointString(points)}
        fill="none"
        stroke={color}
        strokeWidth={subtle ? 2.7 : 4.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - reveal)}
        opacity={0.2 + activity * 0.78}
        filter="url(#pipelineGlow)"
      />
      <polyline
        points={pointString(points)}
        fill="none"
        stroke="#eafaff"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="7 26"
        strokeDashoffset={-dashPhase}
        opacity={activity * 0.54}
      />
      {transits.flatMap((transit, transitIndex) =>
        Array.from({length: packetCount}, (_, packetIndex) => (
          <Packet
            key={`${transitIndex}-${packetIndex}`}
            points={points}
            transit={transit}
            color={color}
            time={time}
            delay={packetIndex * Math.max(0.08, (transit.end - transit.start) * 0.13)}
          />
        )),
      )}
    </g>
  );
};

const ModuleIcon: React.FC<{
  kind: ModuleKind;
  color: string;
  active: number;
  motionTime: number;
}> = ({kind, color, active, motionTime}) => {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 72 72" style={{width: "100%", height: "100%", color, overflow: "visible"}}>
      {kind === "database" && (
        <g transform={`translate(0 ${Math.sin(motionTime * 4.8) * active * 1.1})`}>
          <ellipse cx="36" cy="18" rx="22" ry="8" {...stroke} />
          <path d="M14 18v14c0 4.4 9.8 8 22 8s22-3.6 22-8V18" {...stroke} />
          <path d="M14 32v14c0 4.4 9.8 8 22 8s22-3.6 22-8V32" {...stroke} />
          <path d="M14 46v8c0 4.4 9.8 8 22 8s22-3.6 22-8v-8" {...stroke} />
          <circle cx="51" cy="31" r="2.2" fill="currentColor" opacity={0.4 + active * 0.6} />
        </g>
      )}
      {kind === "cloud" && (
        <g>
          <path d="M17 45h39a10 10 0 0 0 0-20 18 18 0 0 0-34-1 11 11 0 0 0-5 21z" {...stroke} />
          <path d="M36 34v24M28 50l8 8 8-8" {...stroke} stroke={color} strokeWidth={3.5} />
          <circle cx="16" cy="45" r={2.2 + active * 1.2} fill="currentColor" opacity={0.45 + active * 0.55} />
        </g>
      )}
      {kind === "memory" && (
        <g>
          <rect x="17" y="16" width="38" height="38" rx="8" {...stroke} />
          {[23, 31, 39, 47].map((value) => (
            <g key={value}>
              <path d={`M${value} 10v6M${value} 54v7`} {...stroke} strokeWidth={2.2} />
              <path d={`M10 ${value}h7M55 ${value}h7`} {...stroke} strokeWidth={2.2} />
            </g>
          ))}
          <path d="M29 38a10 10 0 1 1 5 7" {...stroke} stroke={color} />
          <path d="M26 39l3-7 6 4" {...stroke} stroke={color} />
          <circle cx="38" cy="35" r="2.5" fill="currentColor" />
        </g>
      )}
      {kind === "tool" && (
        <g>
          <path d="M11 20h50v38H11z" {...stroke} />
          <path d="M11 29h50" {...stroke} opacity={0.55} />
          <circle cx="18" cy="24" r="1.6" fill="currentColor" />
          <circle cx="24" cy="24" r="1.6" fill="currentColor" opacity={0.65} />
          <path d="M27 39l-8 7 8 7M45 39l8 7-8 7M41 35l-9 22" {...stroke} stroke={color} strokeWidth={3.4} />
          <path d="M38 38l-4 9h6l-4 9 13-14h-7l4-4z" fill={color} opacity={active * 0.32} />
        </g>
      )}
      {kind === "security" && (
        <g>
          <path d="M36 8l23 9v17c0 15-8.5 25-23 31C21.5 59 13 49 13 34V17z" {...stroke} />
          <path d="M23 36l8 8 18-19" {...stroke} stroke={color} strokeWidth={4.2} />
          <line
            x1="18"
            y1={19 + ((motionTime * 23) % 31)}
            x2="54"
            y2={19 + ((motionTime * 23) % 31)}
            stroke={color}
            strokeWidth="2"
            opacity={active * 0.8}
            filter="url(#pipelineGlow)"
          />
        </g>
      )}
    </svg>
  );
};

const ModuleCard: React.FC<{
  center: Point;
  kind: ModuleKind;
  label: string;
  detail: string;
  code: string;
  color: string;
  active: number;
  appearAt: number;
  time: number;
  motionTime: number;
  frame: number;
  fps: number;
}> = ({center, kind, label, detail, code, color, active, appearAt, time, motionTime, frame, fps}) => {
  const appearFrame = appearAt * fps;
  const settle = frame < appearFrame
    ? 0
    : spring({
        frame: frame - appearFrame,
        fps,
        config: {damping: 16, stiffness: 110, mass: 0.72},
        durationInFrames: 44,
      });
  const width = 180;
  const height = 110;
  const live = mix("#6b879f", color, active);

  return (
    <div
      style={{
        position: "absolute",
        left: center.x - width / 2,
        top: center.y - height / 2,
        width,
        height,
        opacity: interpolate(settle, [0, 0.18, 1], [0, 0.45, 1], clamp),
        transform: `translateY(${(1 - settle) * 18}px) scale(${0.86 + settle * 0.14 + active * 0.025})`,
        transformOrigin: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -7,
          top: -7,
          width: width + 14,
          height: height + 14,
          borderRadius: 20,
          border: `1px solid ${alpha(color, active * 0.5)}`,
          opacity: active,
          boxShadow: `0 0 34px ${alpha(color, active * 0.15)}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          borderRadius: 15,
          border: `1.4px solid ${alpha(color, 0.24 + active * 0.62)}`,
          background: "linear-gradient(145deg, rgba(10,35,55,0.97), rgba(3,15,27,0.98))",
          boxShadow: `0 18px 36px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 24px ${alpha(color, active * 0.1)}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width,
            height,
            background: `radial-gradient(circle at 28% 50%, ${alpha(color, 0.07 + active * 0.13)}, transparent 52%)`,
          }}
        />
        <div style={{position: "absolute", left: 14, top: 12, color: alpha(C.muted, 0.58), fontSize: 9, letterSpacing: 1.5, fontWeight: 800}}>
          {code}
        </div>
        <div
          style={{
            position: "absolute",
            right: 13,
            top: 13,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: mix("#29445b", color, active),
            boxShadow: `0 0 ${active * 12}px ${alpha(color, 0.9)}`,
          }}
        />
        <div style={{position: "absolute", left: 13, top: 28, width: 62, height: 62, filter: `drop-shadow(0 0 ${active * 8}px ${alpha(color, 0.58)})`}}>
          <ModuleIcon kind={kind} color={live} active={active} motionTime={motionTime} />
        </div>
        <div style={{position: "absolute", left: 83, top: 40, color: C.white, fontSize: 13, letterSpacing: 1.1, fontWeight: 900}}>
          {label}
        </div>
        <div style={{position: "absolute", left: 83, top: 63, right: 10, color: alpha(C.muted, 0.92), fontSize: 9.5, lineHeight: 1.35, letterSpacing: 0.7, fontWeight: 700}}>
          {detail}
        </div>
        <div style={{position: "absolute", left: 12, right: 12, bottom: 0, height: 2, background: `linear-gradient(90deg, transparent, ${alpha(color, active)}, transparent)`}} />
      </div>
    </div>
  );
};

const StageGlyph: React.FC<{
  kind: StageKind;
  color: string;
  active: number;
  motionTime: number;
}> = ({kind, color, active, motionTime}) => {
  const angle = motionTime * (18 + active * 34);
  const scanX = 38 + ((motionTime * (30 + active * 38)) % 280);
  return (
    <svg viewBox="0 0 360 210" style={{position: "absolute", left: 0, top: 0, width: "100%", height: "100%", overflow: "visible"}}>
      {kind === "raw" && (
        <g opacity={0.22 + active * 0.3}>
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <g key={row} transform={`translate(0 ${row * 26})`}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((column) => {
                const lit = (row * 3 + column * 5) % 7;
                return (
                  <rect
                    key={column}
                    x={28 + column * 39}
                    y="29"
                    width={8 + (lit % 3) * 5}
                    height="4"
                    rx="2"
                    fill={lit < 3 ? color : C.line}
                    opacity={lit < 3 ? 0.42 + active * 0.46 : 0.34}
                  />
                );
              })}
            </g>
          ))}
          <line x1={scanX} y1="22" x2={scanX} y2="185" stroke={color} strokeWidth="2" opacity={active * 0.75} filter="url(#pipelineGlow)" />
        </g>
      )}
      {kind === "context" && (
        <g transform="translate(180 104)" opacity={0.22 + active * 0.42}>
          {[72, 52, 31].map((radius, index) => (
            <circle key={radius} r={radius} fill="none" stroke={index === 2 ? color : C.line} strokeWidth={index === 2 ? 2.4 : 1.6} strokeDasharray={index === 1 ? "8 8" : undefined} />
          ))}
          <g transform={`rotate(${angle})`}>
            <path d="M0 0L68-24A72 72 0 0 1 72 0z" fill={alpha(color, 0.09 + active * 0.1)} />
            <circle cx="68" cy="-24" r="4" fill={color} filter="url(#pipelineGlow)" />
          </g>
          {[
            {x: -48, y: -26},
            {x: 46, y: -30},
            {x: -22, y: 47},
            {x: 32, y: 36},
          ].map((point, index) => (
            <g key={index}>
              <line x1="0" y1="0" x2={point.x} y2={point.y} stroke={color} strokeWidth="1.2" opacity={0.32} />
              <circle cx={point.x} cy={point.y} r="4" fill={color} opacity={0.72} />
            </g>
          ))}
        </g>
      )}
      {kind === "reason" && (
        <g transform="translate(180 104)" opacity={0.24 + active * 0.48}>
          <polygon points="0,-64 56,-32 56,32 0,64 -56,32 -56,-32" fill={alpha(color, 0.06)} stroke={color} strokeWidth="1.8" />
          <g transform={`rotate(${angle})`}>
            <circle r="46" fill="none" stroke={color} strokeWidth="1.3" strokeDasharray="5 10" />
            {[0, 120, 240].map((rotation) => (
              <circle key={rotation} cx="0" cy="-46" r="5" fill={color} transform={`rotate(${rotation})`} filter="url(#pipelineGlow)" />
            ))}
          </g>
          <circle r="19" fill={alpha(color, 0.16 + active * 0.18)} stroke={color} strokeWidth="2.4" />
          <circle r="6" fill={color} />
          {[0, 60, 120, 180, 240, 300].map((rotation) => (
            <line key={rotation} x1="19" y1="0" x2="56" y2="0" stroke={color} strokeWidth="1.4" transform={`rotate(${rotation})`} opacity={0.62} />
          ))}
        </g>
      )}
      {kind === "decision" && (
        <g transform="translate(180 104)" opacity={0.24 + active * 0.58}>
          <circle r="73" fill={alpha(color, 0.04 + active * 0.08)} stroke={color} strokeWidth="2" />
          <circle r="57" fill="none" stroke={color} strokeWidth="1.4" strokeDasharray="7 8" transform={`rotate(${angle})`} />
          <path d="M0-42l36 13v25c0 23-14 39-36 48-22-9-36-25-36-48v-25z" fill={alpha(color, 0.08 + active * 0.1)} stroke={color} strokeWidth="2.5" />
          <path d="M-20 1l13 13 29-32" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="66" strokeDashoffset={66 * (1 - active)} filter="url(#pipelineGlow)" />
        </g>
      )}
    </svg>
  );
};

const MaskedTypography: React.FC<{
  lines: string[];
  reveal: number;
  color: string;
  active: number;
  size: number;
}> = ({lines, reveal, color, active, size}) => {
  const width = 340;
  const scanLeft = Math.max(0, Math.min(width - 4, reveal * width));
  return (
    <div style={{position: "absolute", left: 20, right: 20, top: 91, height: 116, textAlign: "center"}}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          color,
          opacity: reveal * (0.18 + active * 0.34),
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: size,
          lineHeight: 0.93,
          letterSpacing: -1.1,
          fontWeight: 900,
          whiteSpace: "nowrap",
        }}
      >
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <div style={{position: "absolute", left: 0, top: 0, width, height: "100%", opacity: 0.34 + active * 0.66}}>
        <div style={{position: "absolute", left: 0, top: 0, width, height: "100%", clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}}>
          <div style={{position: "absolute", left: 0, top: 0, width, color, fontFamily: "Arial, Helvetica, sans-serif", fontSize: size, lineHeight: 0.93, letterSpacing: -1.1, fontWeight: 900, whiteSpace: "nowrap", textShadow: `0 0 ${10 + active * 22}px ${alpha(color, active * 0.26)}`}}>
            {lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
        {reveal > 0.02 && reveal < 0.995 && (
          <div style={{position: "absolute", left: scanLeft, top: -7, width: 3, height: 112, background: color, boxShadow: `0 0 18px ${color}`, opacity: 0.85}} />
        )}
      </div>
    </div>
  );
};

const StageGate: React.FC<{
  center: Point;
  kind: StageKind;
  index: string;
  lines: string[];
  descriptor: string;
  status: string;
  color: string;
  active: number;
  reveal: number;
  finalHold: number;
  time: number;
  motionTime: number;
  frame: number;
  fps: number;
  appearAt: number;
}> = ({center, kind, index, lines, descriptor, status, color, active, reveal, finalHold, time, motionTime, frame, fps, appearAt}) => {
  const appearFrame = appearAt * fps;
  const settle = frame < appearFrame
    ? 0
    : spring({
        frame: frame - appearFrame,
        fps,
        config: {damping: 16, stiffness: 100, mass: 0.82},
        durationInFrames: 52,
      });
  const width = 380;
  const height = 320;
  const scale = 0.9 + settle * 0.1 + active * 0.018;
  const headlineSize = kind === "decision" ? 45 : kind === "reason" ? 51 : kind === "context" ? 53 : 58;
  const stageOpacity = interpolate(settle, [0, 0.15, 1], [0, 0.4, 1], clamp);
  const light = mix("#66849c", color, Math.max(active, finalHold * 0.52));
  const completionAt = {
    raw: 2.24,
    context: 4.22,
    reason: 6.72,
    decision: 10.34,
  }[kind];
  const completed = time >= completionAt;
  const workingStatus = {
    raw: "ASSEMBLING",
    context: "BUILDING",
    reason: "EVALUATING",
    decision: "VALIDATING",
  }[kind];
  const topStatus = finalHold > 0.2 || completed
    ? kind === "decision" ? "VERIFIED" : "COMPLETE"
    : active > 0.36 ? "PROCESSING" : "STANDBY";
  const bottomStatus = completed
    ? status
    : active > 0.18 ? workingStatus : "AWAITING INPUT";

  return (
    <div
      style={{
        position: "absolute",
        left: center.x - width / 2,
        top: center.y - height / 2,
        width,
        height,
        opacity: stageOpacity,
        transform: `translateY(${(1 - settle) * 28}px) scale(${scale})`,
        transformOrigin: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -10,
          top: -10,
          width: width + 20,
          height: height + 20,
          borderRadius: 33,
          border: `1px solid ${alpha(color, active * 0.48)}`,
          opacity: active,
          boxShadow: `0 0 52px ${alpha(color, active * 0.13)}`,
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
          borderRadius: 26,
          border: `1.5px solid ${alpha(color, 0.23 + active * 0.66)}`,
          background: "linear-gradient(145deg, rgba(9,31,50,0.96), rgba(2,12,23,0.985))",
          boxShadow: `0 24px 56px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.09), 0 0 32px ${alpha(color, active * 0.1)}`,
        }}
      >
        <div style={{position: "absolute", left: 0, top: 0, width, height, opacity: 0.36, backgroundImage: "linear-gradient(rgba(81,154,200,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(81,154,200,0.10) 1px, transparent 1px)", backgroundSize: "24px 24px"}} />
        <div style={{position: "absolute", left: 0, top: 0, width, height, background: `radial-gradient(circle at 50% 52%, ${alpha(color, 0.06 + active * 0.13)}, transparent 64%)`}} />
        <StageGlyph kind={kind} color={color} active={active} motionTime={motionTime} />

        {kind === "raw" && rawFragments.map((fragment, fragmentIndex) => {
          const assemble = fastRamp(time, 0.48 + fragment.delay, 1.48 + fragment.delay);
          const dissolve = ramp(time, 1.62 + fragment.delay * 0.2, 2.2 + fragment.delay * 0.2);
          const x = fragment.startX + (fragment.targetX - fragment.startX) * assemble;
          const y = fragment.startY + (fragment.targetY - fragment.startY) * assemble;
          return (
            <div
              key={fragmentIndex}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: fragment.width,
                height: fragment.height,
                borderRadius: 1,
                background: fragmentIndex % 5 === 0 ? C.white : color,
                opacity: (0.14 + assemble * 0.72) * (1 - dissolve * 0.86),
                boxShadow: `0 0 ${assemble * 8}px ${alpha(color, 0.5)}`,
              }}
            />
          );
        })}

        <div style={{position: "absolute", left: 20, top: 18, color: alpha(C.muted, 0.74), fontSize: 10, letterSpacing: 2, fontWeight: 800}}>
          STAGE {index}
        </div>
        <div style={{position: "absolute", right: 20, top: 18, display: "flex", alignItems: "center", gap: 8}}>
          <span style={{width: 7, height: 7, borderRadius: "50%", background: light, boxShadow: `0 0 ${active * 12}px ${alpha(color, 0.9)}`}} />
          <span style={{color: light, fontSize: 9, letterSpacing: 1.5, fontWeight: 800}}>{topStatus}</span>
        </div>

        <div style={{position: "absolute", left: 24, right: 24, bottom: 53, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(color, 0.32 + active * 0.45)}, transparent)`}} />
        <div style={{position: "absolute", left: 25, bottom: 28, color: alpha(C.text, 0.88), fontSize: 10.5, letterSpacing: 1.5, fontWeight: 800}}>
          {descriptor}
        </div>
        <div style={{position: "absolute", right: 25, bottom: 28, color: light, fontSize: 9.5, letterSpacing: 1.3, fontWeight: 900}}>
          {bottomStatus}
        </div>

        <div style={{position: "absolute", left: 0, bottom: 0, width: `${Math.max(finalHold * 100, active * 100)}%`, height: 3, background: `linear-gradient(90deg, ${alpha(color, 0.15)}, ${color})`, boxShadow: `0 0 13px ${alpha(color, active * 0.65)}`}} />
      </div>

      <MaskedTypography lines={lines} reveal={reveal} color={kind === "decision" && active > 0.45 ? C.mint : light} active={active} size={headlineSize} />

      {[{left: -2, top: -2}, {right: -2, top: -2}, {left: -2, bottom: -2}, {right: -2, bottom: -2}].map((position, corner) => (
        <div key={corner} style={{position: "absolute", ...position, width: 24, height: 24, borderTop: corner < 2 ? `2px solid ${alpha(color, 0.55)}` : undefined, borderBottom: corner >= 2 ? `2px solid ${alpha(color, 0.55)}` : undefined, borderLeft: corner % 2 === 0 ? `2px solid ${alpha(color, 0.55)}` : undefined, borderRight: corner % 2 === 1 ? `2px solid ${alpha(color, 0.55)}` : undefined}} />
      ))}
    </div>
  );
};

const FixedHeader: React.FC<{time: number; sceneOpacity: number; finalHold: number}> = ({time, sceneOpacity, finalHold}) => {
  const reveal = fastRamp(time, 0.15, 0.95);
  return (
    <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, opacity: sceneOpacity * reveal, fontFamily: "Arial, Helvetica, sans-serif", pointerEvents: "none"}}>
      <div style={{position: "absolute", left: 82, top: 56, transform: `translateY(${(1 - reveal) * -14}px)`}}>
        <div style={{display: "flex", alignItems: "center", gap: 12, color: C.cyan, fontSize: 11, letterSpacing: 3, fontWeight: 800}}>
          <span style={{width: 34, height: 2, background: C.cyan, boxShadow: `0 0 10px ${alpha(C.cyan, 0.75)}`}} />
          ENTERPRISE AI • DECISION INTELLIGENCE
        </div>
        <div style={{marginTop: 12, color: C.white, fontSize: 32, letterSpacing: 1.2, fontWeight: 900}}>
          VERIFIED DECISION PIPELINE
        </div>
        <div style={{marginTop: 9, color: C.muted, fontSize: 11.5, letterSpacing: 1.65, fontWeight: 700}}>
          CONTEXTUAL REASONING / SECURE EXECUTION / TRACEABLE OUTPUT
        </div>
      </div>

      <div style={{position: "absolute", right: 82, top: 66, display: "flex", gap: 10}}>
        {[
          {label: "05 CHECKPOINTS", color: C.blue},
          {label: "TRACE ENABLED", color: C.violet},
          {label: finalHold > 0.2 ? "POLICY PASSED" : "POLICY ACTIVE", color: finalHold > 0.2 ? C.mint : C.amber},
        ].map((item) => (
          <div key={item.label} style={{padding: "9px 13px", borderRadius: 8, border: `1px solid ${alpha(item.color, 0.25)}`, background: "rgba(4,18,32,0.78)", color: alpha(item.color, 0.9), fontSize: 9.5, letterSpacing: 1.45, fontWeight: 800}}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusRail: React.FC<{time: number; sceneOpacity: number}> = ({time, sceneOpacity}) => {
  const stages = [
    {label: "RAW DATA", at: 1.35, color: C.cyan},
    {label: "CONTEXT", at: 3.65, color: C.blue},
    {label: "REASONING", at: 5.7, color: C.violet},
    {label: "VERIFIED DECISION", at: 9.7, color: C.mint},
  ];
  const progress = interpolate(time, stages.map((stage) => stage.at), stages.map((_, index) => index / (stages.length - 1)), clamp);
  const reveal = fastRamp(time, 0.8, 1.45);

  return (
    <div style={{position: "absolute", left: 96, right: 96, top: 987, height: 52, opacity: sceneOpacity * reveal, fontFamily: "Arial, Helvetica, sans-serif"}}>
      <div style={{position: "absolute", left: 0, right: 0, top: 11, height: 2, background: alpha(C.line, 0.72)}} />
      <div style={{position: "absolute", left: 0, top: 11, height: 2, width: `${progress * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.mint})`, boxShadow: `0 0 12px ${alpha(progress > 0.92 ? C.mint : C.cyan, 0.5)}`}} />
      {stages.map((stage, index) => {
        const x = (index / (stages.length - 1)) * 100;
        const active = fastRamp(time, stage.at - 0.12, stage.at + 0.16);
        return (
          <div key={stage.label} style={{position: "absolute", left: `${x}%`, top: 0}}>
            <div style={{position: "absolute", left: -6, top: 5, width: 13, height: 13, borderRadius: "50%", border: `2px solid ${mix("#38556b", stage.color, active)}`, background: mix(C.bg2, stage.color, active), boxShadow: `0 0 ${active * 13}px ${alpha(stage.color, 0.9)}`}} />
            <div style={{position: "absolute", top: 29, left: index === 0 ? 0 : index === stages.length - 1 ? undefined : "50%", right: index === stages.length - 1 ? 0 : undefined, transform: index > 0 && index < stages.length - 1 ? "translateX(-50%)" : undefined, color: mix(C.muted, C.white, active), fontSize: 9.5, letterSpacing: 1.55, fontWeight: 800, whiteSpace: "nowrap"}}>
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DecisionReady: React.FC<{
  time: number;
  frame: number;
  fps: number;
  sceneOpacity: number;
}> = ({time, frame, fps, sceneOpacity}) => {
  const appearFrame = 10.65 * fps;
  const settle = frame < appearFrame
    ? 0
    : spring({
        frame: frame - appearFrame,
        fps,
        config: {damping: 15, stiffness: 118, mass: 0.72},
        durationInFrames: 50,
      });
  const exit = 1 - ramp(time, 13.68, 14.22);
  const visible = settle * exit * sceneOpacity;
  const checkReveal = fastRamp(time, 10.72, 11.18);

  return (
    <div style={{position: "absolute", left: 690, top: 858, width: 540, height: 96, opacity: visible, transform: `translateY(${(1 - settle) * 22}px) scale(${0.9 + settle * 0.1})`, transformOrigin: "center", fontFamily: "Arial, Helvetica, sans-serif"}}>
      <div style={{position: "absolute", left: 0, top: 0, width: 540, height: 96, borderRadius: 18, overflow: "hidden", border: `1.5px solid ${alpha(C.mint, 0.7)}`, background: "linear-gradient(135deg, rgba(8,50,49,0.97), rgba(3,22,31,0.98))", boxShadow: `0 22px 52px rgba(0,0,0,0.38), 0 0 38px ${alpha(C.mint, 0.17)}, inset 0 1px 0 rgba(255,255,255,0.09)`}}>
        <div style={{position: "absolute", left: 0, top: 0, width: 540, height: 96, background: `linear-gradient(90deg, transparent, ${alpha(C.mint, 0.06)}, transparent)`}} />
        <div style={{position: "absolute", left: 22, top: 17, width: 62, height: 62, borderRadius: "50%", border: `2px solid ${alpha(C.mint, 0.72)}`, background: alpha(C.mint, 0.09), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${alpha(C.mint, 0.17)}`}}>
          <svg viewBox="0 0 44 44" style={{width: 42, height: 42}}>
            <path d="M9 23l8 8 19-21" fill="none" stroke={C.mint} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="58" strokeDashoffset={58 * (1 - checkReveal)} />
          </svg>
        </div>
        <div style={{position: "absolute", left: 106, top: 19, color: C.mint, fontSize: 11, letterSpacing: 2.4, fontWeight: 900}}>POLICY CHECK PASSED</div>
        <div style={{position: "absolute", left: 106, top: 42, color: C.white, fontSize: 26, letterSpacing: 1.5, fontWeight: 900}}>DECISION READY</div>
        <div style={{position: "absolute", left: 106, top: 74, color: alpha(C.muted, 0.95), fontSize: 9.5, letterSpacing: 1.45, fontWeight: 800}}>EVIDENCE VERIFIED • TRACE COMPLETE • OUTPUT LOCKED</div>
        <div style={{position: "absolute", right: 20, top: 22, color: alpha(C.mint, 0.86), fontSize: 10, letterSpacing: 1.5, fontWeight: 900}}>100%</div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const motionTime = Math.min(time, 11.55);

  const sceneOpacity = Math.min(
    fastRamp(time, 0.05, 0.52),
    1 - fastRamp(time, 13.62, 14.25),
  );
  const finalHold = Math.min(fastRamp(time, 10.45, 11.25), 1 - fastRamp(time, 13.54, 14.0));

  const rawActive = Math.max(activityWindow(time, 0.42, 3.15, 0.42), finalHold * 0.34);
  const databaseActive = Math.max(activityWindow(time, 1.82, 4.12, 0.32), finalHold * 0.4);
  const cloudActive = Math.max(activityWindow(time, 2.08, 4.38, 0.32), finalHold * 0.4);
  const contextActive = Math.max(activityWindow(time, 3.0, 5.72, 0.4), finalHold * 0.46);
  const memoryActive = Math.max(activityWindow(time, 4.72, 6.78, 0.32), finalHold * 0.46);
  const reasonActive = Math.max(activityWindow(time, 5.08, 8.42, 0.42), finalHold * 0.56);
  const toolActive = Math.max(activityWindow(time, 6.95, 8.92, 0.3), finalHold * 0.52);
  const securityActive = Math.max(activityWindow(time, 8.15, 10.28, 0.3), finalHold * 0.66);
  const decisionActive = Math.max(activityWindow(time, 9.18, 13.72, 0.46), finalHold);

  const cameraX = interpolate(
    time,
    [0, 2.35, 4.35, 6.45, 8.55, 10.35, 11.45, 14.1, 14.75, 15],
    [300, 300, 18, -610, -830, -1155, 82, 82, 300, 300],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const cameraScale = interpolate(
    time,
    [0, 2.35, 4.35, 6.45, 8.55, 10.35, 11.45, 14.1, 14.75, 15],
    [1.06, 1.06, 1.04, 1.065, 1.05, 1.03, 0.72, 0.72, 1.06, 1.06],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );

  const rawCenter = {x: 350, y: 535};
  const contextCenter = {x: 900, y: 535};
  const reasonCenter = {x: 1470, y: 535};
  const decisionCenter = {x: 2160, y: 535};
  const databaseCenter = {x: 690, y: 245};
  const cloudCenter = {x: 690, y: 825};
  const memoryCenter = {x: 1260, y: 245};
  const toolCenter = {x: 1770, y: 245};
  const securityCenter = {x: 1900, y: 825};

  const rawToJunction: Point[] = [{x: 540, y: 535}, {x: 610, y: 535}];
  const junctionToDatabase: Point[] = [{x: 610, y: 535}, {x: 610, y: 245}, {x: 600, y: 245}];
  const junctionToCloud: Point[] = [{x: 610, y: 535}, {x: 610, y: 825}, {x: 600, y: 825}];
  const databaseToContext: Point[] = [{x: 780, y: 245}, {x: 835, y: 245}, {x: 835, y: 365}];
  const cloudToContext: Point[] = [{x: 780, y: 825}, {x: 835, y: 825}, {x: 835, y: 705}];
  const contextToReason: Point[] = [{x: 1090, y: 535}, {x: 1280, y: 535}];
  const memoryLoop: Point[] = [{x: 1375, y: 375}, {x: 1375, y: 330}, {x: 1260, y: 330}, {x: 1260, y: 300}];
  const reasonToTool: Point[] = [{x: 1660, y: 535}, {x: 1680, y: 535}, {x: 1680, y: 245}];
  const toolToSecurity: Point[] = [{x: 1860, y: 245}, {x: 1900, y: 245}, {x: 1900, y: 770}];
  const securityToDecision: Point[] = [{x: 1990, y: 825}, {x: 2015, y: 825}, {x: 2015, y: 535}, {x: 1970, y: 535}];

  return (
    <AbsoluteFill style={{background: C.bg, overflow: "hidden", fontFamily: "Arial, Helvetica, sans-serif"}}>
      <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 52% 48%, rgba(20,100,157,0.15), transparent 42%), radial-gradient(circle at 84% 60%, rgba(78,54,162,0.10), transparent 32%), linear-gradient(135deg, #020813 0%, #061425 55%, #020712 100%)"}} />
      <div style={{position: "absolute", inset: 0, opacity: 0.42, backgroundImage: "linear-gradient(rgba(53,130,180,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(53,130,180,0.10) 1px, transparent 1px), linear-gradient(rgba(53,130,180,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(53,130,180,0.035) 1px, transparent 1px)", backgroundSize: "48px 48px, 48px 48px, 12px 12px, 12px 12px", maskImage: "radial-gradient(ellipse at 50% 50%, black 0%, rgba(0,0,0,0.72) 66%, transparent 100%)"}} />

      <div style={{position: "absolute", inset: 0, opacity: sceneOpacity}}>
        {backgroundParticles.map((particle, index) => {
          const drift = Math.sin(motionTime * 0.58 + particle.phase) * 6;
          const twinkle = 0.6 + Math.sin(motionTime * 1.8 + particle.phase) * 0.4;
          return (
            <div key={index} style={{position: "absolute", left: particle.x + Math.sin(particle.phase) * cameraX * 0.012, top: particle.y + drift, width: particle.radius * 2, height: particle.radius * 2, borderRadius: "50%", background: index % 9 === 0 ? C.violet : C.cyan, opacity: particle.opacity * twinkle, boxShadow: `0 0 ${particle.radius * 6}px currentColor`}} />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: WORLD_W,
          height: H,
          opacity: sceneOpacity,
          transform: `translateX(${cameraX}px) scale(${cameraScale})`,
          transformOrigin: "0px 540px",
        }}
      >
        <div style={{position: "absolute", left: 150, right: 130, top: 535, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(C.line, 0.42)}, ${alpha(C.line, 0.42)}, transparent)`}} />
        <div style={{position: "absolute", left: 126, top: 323, color: alpha(C.cyan, 0.55), fontSize: 9.5, letterSpacing: 2.5, fontWeight: 800}}>SIGNAL INGESTION / 01</div>
        <div style={{position: "absolute", left: 770, top: 323, color: alpha(C.blue, 0.55), fontSize: 9.5, letterSpacing: 2.5, fontWeight: 800}}>CONTEXT LAYER / 02</div>
        <div style={{position: "absolute", left: 1340, top: 323, color: alpha(C.violet, 0.58), fontSize: 9.5, letterSpacing: 2.5, fontWeight: 800}}>DECISION ENGINE / 03</div>
        <div style={{position: "absolute", left: 2040, top: 323, color: alpha(C.mint, 0.55), fontSize: 9.5, letterSpacing: 2.5, fontWeight: 800}}>VERIFIED OUTPUT / 04</div>

        <svg viewBox={`0 0 ${WORLD_W} ${H}`} style={{position: "absolute", inset: 0, width: WORLD_W, height: H, overflow: "visible"}}>
          <defs>
            <filter id="pipelineGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <PipelineRoute points={rawToJunction} color={C.cyan} revealAt={1.45} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 2.0, end: 2.38}]} packetCount={2} />
          <PipelineRoute points={junctionToDatabase} color={C.blue} revealAt={1.82} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 2.35, end: 3.08}]} packetCount={2} subtle />
          <PipelineRoute points={junctionToCloud} color={C.cyan} revealAt={2.03} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 2.58, end: 3.3}]} packetCount={2} subtle />
          <PipelineRoute points={databaseToContext} color={C.blue} revealAt={2.72} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 3.05, end: 3.88}]} packetCount={2} subtle />
          <PipelineRoute points={cloudToContext} color={C.cyan} revealAt={2.95} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 3.28, end: 4.1}]} packetCount={2} subtle />
          <PipelineRoute points={contextToReason} color={C.violet} revealAt={4.18} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 4.62, end: 5.72}]} packetCount={3} />
          <PipelineRoute points={memoryLoop} color={C.violet} revealAt={4.68} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 5.72, end: 6.72, pingPong: true}]} packetCount={2} subtle />
          <PipelineRoute points={reasonToTool} color={C.amber} revealAt={6.62} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 7.02, end: 7.92}]} packetCount={3} />
          <PipelineRoute points={toolToSecurity} color={C.amber} revealAt={7.48} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 7.92, end: 8.7}]} packetCount={4} />
          <PipelineRoute points={securityToDecision} color={C.mint} revealAt={8.38} time={time} motionTime={motionTime} finalHold={finalHold} transits={[{start: 8.72, end: 9.5}]} packetCount={4} />
        </svg>

        <StageGate center={rawCenter} kind="raw" index="01" lines={["RAW DATA"]} descriptor="UNSTRUCTURED SIGNALS" status="INGESTED" color={C.cyan} active={rawActive} reveal={fastRamp(time, 1.05, 1.72)} finalHold={finalHold} time={time} motionTime={motionTime} frame={frame} fps={fps} appearAt={0.28} />
        <StageGate center={contextCenter} kind="context" index="02" lines={["CONTEXT"]} descriptor="ENTITY • INTENT • HISTORY" status="CONTEXT BUILT" color={C.blue} active={contextActive} reveal={fastRamp(time, 3.3, 3.95)} finalHold={finalHold} time={time} motionTime={motionTime} frame={frame} fps={fps} appearAt={0.72} />
        <StageGate center={reasonCenter} kind="reason" index="03" lines={["REASONING"]} descriptor="PLAN • EVALUATE • SELECT" status="OPTION LOCKED" color={C.violet} active={reasonActive} reveal={fastRamp(time, 5.38, 6.04)} finalHold={finalHold} time={time} motionTime={motionTime} frame={frame} fps={fps} appearAt={1.02} />
        <StageGate center={decisionCenter} kind="decision" index="04" lines={["VERIFIED", "DECISION"]} descriptor="EVIDENCE + POLICY VALIDATED" status="VERIFIED" color={C.mint} active={decisionActive} reveal={fastRamp(time, 9.52, 10.32)} finalHold={finalHold} time={time} motionTime={motionTime} frame={frame} fps={fps} appearAt={1.3} />

        <ModuleCard center={databaseCenter} kind="database" label="DATABASE" detail="STRUCTURED INPUT" code="CP-01" color={C.blue} active={databaseActive} appearAt={0.9} time={time} motionTime={motionTime} frame={frame} fps={fps} />
        <ModuleCard center={cloudCenter} kind="cloud" label="CLOUD" detail="LIVE DATA INPUT" code="CP-02" color={C.cyan} active={cloudActive} appearAt={1.04} time={time} motionTime={motionTime} frame={frame} fps={fps} />
        <ModuleCard center={memoryCenter} kind="memory" label="MEMORY" detail="CONTEXT RETRIEVAL" code="CP-03" color={C.violet} active={memoryActive} appearAt={1.18} time={time} motionTime={motionTime} frame={frame} fps={fps} />
        <ModuleCard center={toolCenter} kind="tool" label="TOOLS" detail="ACTION + LOOKUP" code="CP-04" color={C.amber} active={toolActive} appearAt={1.32} time={time} motionTime={motionTime} frame={frame} fps={fps} />
        <ModuleCard center={securityCenter} kind="security" label="SECURITY" detail="POLICY CHECK" code="CP-05" color={decisionActive > 0.45 ? C.mint : C.amber} active={securityActive} appearAt={1.46} time={time} motionTime={motionTime} frame={frame} fps={fps} />

        <div style={{position: "absolute", left: 1175, top: 690, display: "flex", gap: 10, opacity: Math.max(reasonActive, finalHold * 0.65)}}>
          {["PLAN", "COMPARE", "EVALUATE", "SELECT"].map((label, index) => {
            const active = fastRamp(time, 5.58 + index * 0.32, 5.88 + index * 0.32);
            return <div key={label} style={{padding: "7px 10px", borderRadius: 7, border: `1px solid ${alpha(C.violet, 0.18 + active * 0.42)}`, background: "rgba(7,24,41,0.82)", color: mix(C.muted, C.white, Math.max(active, finalHold * 0.55)), fontSize: 8.5, letterSpacing: 1.2, fontWeight: 800, boxShadow: `0 0 ${active * 12}px ${alpha(C.violet, 0.12)}`}}>{label}</div>;
          })}
        </div>
      </div>

      <FixedHeader time={time} sceneOpacity={sceneOpacity} finalHold={finalHold} />
      <DecisionReady time={time} frame={frame} fps={fps} sceneOpacity={sceneOpacity} />
      <StatusRail time={time} sceneOpacity={sceneOpacity} />

      <div style={{position: "absolute", left: interpolate(time, [13.5, 14.3], [W + 260, -420], clamp), top: 0, width: 280, height: H, opacity: activityWindow(time, 13.45, 14.35, 0.16) * 0.72, transform: "skewX(-8deg)", background: "linear-gradient(90deg, transparent, rgba(42,217,255,0.05), rgba(255,255,255,0.15), rgba(66,230,154,0.08), transparent)", boxShadow: `0 0 52px ${alpha(C.cyan, 0.08)}`, pointerEvents: "none"}} />
      <div style={{position: "absolute", left: 0, right: 0, top: ((motionTime * 80) % (H + 160)) - 80, height: 92, opacity: sceneOpacity * 0.045 * (1 - finalHold), background: "linear-gradient(180deg, transparent, rgba(53,204,255,0.34), transparent)", pointerEvents: "none"}} />
      <div style={{position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 160px rgba(0,0,0,0.58)"}} />
    </AbsoluteFill>
  );
};
