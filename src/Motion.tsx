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
type GlyphKind =
  | "card"
  | "token"
  | "device"
  | "lock"
  | "bank"
  | "shield"
  | "verify"
  | "retry"
  | "wallet";

const W = 1920;
const H = 1080;

const C = {
  bg: "#02070d",
  bg2: "#06121e",
  panel: "#091a28",
  panelDeep: "#040d16",
  line: "#17374a",
  lineSoft: "#0d2636",
  white: "#f7fbff",
  text: "#dbe9f2",
  muted: "#7892a4",
  cyan: "#35d8ff",
  blue: "#3a8cff",
  mint: "#4be0a5",
  amber: "#ffb85c",
  red: "#ff5864",
  redDeep: "#a51f35",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

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

const activityWindow = (time: number, start: number, end: number, feather = 0.22) =>
  Math.min(ramp(time, start, start + feather), 1 - ramp(time, end - feather, end));

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

const backgroundParticles = Array.from({length: 56}, (_, index) => ({
  x: 54 + ((index * 263) % 1810),
  y: 94 + ((index * 151) % 880),
  radius: 0.7 + (index % 4) * 0.45,
  opacity: 0.035 + (index % 5) * 0.012,
  phase: (index * 0.61) % (Math.PI * 2),
}));

const Glyph: React.FC<{
  kind: GlyphKind;
  color: string;
  size?: number;
  strokeWidth?: number;
}> = ({kind, color, size = 64, strokeWidth = 3}) => {
  const shared = {
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={{display: "block"}}>
      {kind === "card" && (
        <>
          <rect x="8" y="14" width="48" height="36" rx="7" {...shared} />
          <path d="M8 25h48" {...shared} />
          <rect x="15" y="33" width="11" height="8" rx="2" {...shared} />
          <path d="M36 40h12" {...shared} />
        </>
      )}
      {kind === "token" && (
        <>
          <path d="M32 6l21 12v28L32 58 11 46V18z" {...shared} />
          <circle cx="32" cy="32" r="7" {...shared} />
          <path d="M32 13v12M48 22l-10 6M48 42l-10-6M32 51V39M16 42l10-6M16 22l10 6" {...shared} />
        </>
      )}
      {kind === "device" && (
        <>
          <rect x="15" y="6" width="34" height="52" rx="8" {...shared} />
          <path d="M25 13h14M28 51h8" {...shared} />
          <path d="M24 33l6 6 12-15" {...shared} />
        </>
      )}
      {kind === "lock" && (
        <>
          <rect x="12" y="27" width="40" height="29" rx="7" {...shared} />
          <path d="M21 27v-8c0-7 4.5-12 11-12s11 5 11 12v8" {...shared} />
          <circle cx="32" cy="40" r="3.5" fill={color} stroke="none" />
          <path d="M32 43v6" {...shared} />
        </>
      )}
      {kind === "bank" && (
        <>
          <path d="M7 24L32 8l25 16zM10 51h44M7 57h50" {...shared} />
          <path d="M15 27v20M26 27v20M38 27v20M49 27v20" {...shared} />
        </>
      )}
      {kind === "shield" && (
        <>
          <path d="M32 6l20 8v15c0 13-8 23-20 29C20 52 12 42 12 29V14z" {...shared} />
          <path d="M23 24l18 18M41 24L23 42" {...shared} />
        </>
      )}
      {kind === "verify" && (
        <>
          <rect x="7" y="14" width="42" height="32" rx="7" {...shared} />
          <path d="M7 24h42M14 34h12" {...shared} />
          <circle cx="48" cy="45" r="11" fill={C.panelDeep} stroke={color} strokeWidth={strokeWidth} />
          <path d="M43 45l4 4 7-9" {...shared} />
        </>
      )}
      {kind === "retry" && (
        <>
          <path d="M49 21A21 21 0 1 0 52 39" {...shared} />
          <path d="M49 10v11H38M52 39l-10-1 2 10" {...shared} />
        </>
      )}
      {kind === "wallet" && (
        <>
          <path d="M10 17h37c5 0 8 3 8 8v25c0 4-3 7-7 7H15c-5 0-8-3-8-8V22c0-4 3-7 7-7h30" {...shared} />
          <path d="M39 30h18v14H39c-4 0-7-3-7-7s3-7 7-7z" {...shared} />
          <circle cx="42" cy="37" r="2.5" fill={color} stroke="none" />
        </>
      )}
    </svg>
  );
};

const PaymentCard: React.FC<{
  time: number;
  frame: number;
  fps: number;
  decline: number;
}> = ({time, frame, fps, decline}) => {
  const appearFrame = 0.62 * fps;
  const settle = frame < appearFrame
    ? 0
    : spring({
        frame: frame - appearFrame,
        fps,
        config: {damping: 14, stiffness: 105, mass: 0.78},
        durationInFrames: 64,
      });
  const tokenReveal = fastRamp(time, 1.05, 1.72);
  const shakeEnvelope = activityWindow(time, 4.88, 5.78, 0.12);
  const shake = Math.sin((time - 4.88) * 50) * 9 * shakeEnvelope;
  const accent = mix(C.cyan, C.red, decline);
  const dim = 1 - ramp(time, 5.22, 6.05) * 0.7;

  return (
    <div
      style={{
        position: "absolute",
        left: 112,
        top: 372,
        width: 360,
        height: 228,
        opacity: settle * dim,
        transform: `translateX(${(1 - settle) * -75 + shake}px) translateY(${(1 - settle) * 20}px) rotate(${(1 - settle) * -3 + shake * 0.08}deg) scale(${0.86 + settle * 0.14})`,
        transformOrigin: "center",
        zIndex: 4,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: 18,
          bottom: -20,
          borderRadius: 32,
          background: alpha(accent, 0.16),
          filter: "blur(30px)",
          opacity: 0.55 + decline * 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 360,
          height: 228,
          overflow: "hidden",
          borderRadius: 27,
          border: `1.5px solid ${alpha(accent, 0.36 + decline * 0.4)}`,
          background: "linear-gradient(145deg, rgba(16,42,60,0.98) 0%, rgba(7,22,34,0.99) 58%, rgba(5,13,21,0.99) 100%)",
          boxShadow: `0 24px 65px rgba(0,0,0,0.5), 0 0 ${16 + decline * 22}px ${alpha(accent, 0.13 + decline * 0.16)}, inset 0 1px 0 rgba(255,255,255,0.12)`,
        }}
      >
        <div style={{position: "absolute", left: 0, top: 0, width: 360, height: 228, background: `radial-gradient(circle at 15% 20%, ${alpha(C.cyan, 0.11)}, transparent 38%), linear-gradient(115deg, transparent 52%, rgba(255,255,255,0.055) 53%, transparent 72%)`}} />
        <div style={{position: "absolute", right: -48, top: -64, width: 220, height: 220, borderRadius: "50%", border: `1px solid ${alpha(accent, 0.12)}`}} />
        <div style={{position: "absolute", right: -16, top: -32, width: 150, height: 150, borderRadius: "50%", border: `1px solid ${alpha(accent, 0.12)}`}} />

        <div style={{position: "absolute", left: 28, top: 24, color: alpha(C.text, 0.78), fontSize: 10, letterSpacing: 2.3, fontWeight: 800}}>SECURE PAYMENT TOKEN</div>
        <div style={{position: "absolute", right: 27, top: 21, display: "flex", alignItems: "center", gap: 7}}>
          <div style={{width: 7, height: 7, borderRadius: "50%", background: accent, boxShadow: `0 0 12px ${alpha(accent, 0.8)}`}} />
          <div style={{color: accent, fontSize: 9, letterSpacing: 1.4, fontWeight: 900}}>{decline > 0.5 ? "HALTED" : "ACTIVE"}</div>
        </div>

        <div style={{position: "absolute", left: 30, top: 73, width: 48, height: 37, borderRadius: 8, border: `1.5px solid ${alpha(accent, 0.6)}`, background: alpha(accent, 0.07)}}>
          <div style={{position: "absolute", left: 15, top: 0, bottom: 0, width: 1, background: alpha(accent, 0.45)}} />
          <div style={{position: "absolute", left: 30, top: 0, bottom: 0, width: 1, background: alpha(accent, 0.45)}} />
          <div style={{position: "absolute", left: 0, right: 0, top: 17, height: 1, background: alpha(accent, 0.45)}} />
        </div>
        <div style={{position: "absolute", left: 94, top: 78, opacity: 0.72}}>
          <svg viewBox="0 0 34 34" width="34" height="34">
            <path d="M5 12c7 4 7 6 0 10M11 8c13 7 13 11 0 18M18 4c18 10 18 16 0 26" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{position: "absolute", left: 29, top: 135, color: C.white, fontSize: 23, letterSpacing: 3.8, fontWeight: 700, whiteSpace: "nowrap"}}>
          ••••&nbsp;&nbsp;••••&nbsp;&nbsp;4831
        </div>
        <div style={{position: "absolute", left: 30, top: 182, color: alpha(C.muted, 0.95), fontSize: 9.5, letterSpacing: 1.8, fontWeight: 800}}>ENCRYPTED CARD DATA</div>
        <div style={{position: "absolute", right: 28, top: 176, width: 92, height: 25, borderRadius: 14, border: `1px solid ${alpha(accent, 0.28)}`, background: alpha(accent, 0.07), overflow: "hidden"}}>
          <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${tokenReveal * 100}%`, background: alpha(accent, 0.11)}} />
          <div style={{position: "absolute", left: 0, top: 0, width: 92, height: 25, display: "flex", alignItems: "center", justifyContent: "center", color: alpha(accent, 0.9), fontSize: 8.5, letterSpacing: 1.1, fontWeight: 900}}>TOKENIZED</div>
        </div>
      </div>

      <div style={{position: "absolute", left: 26, top: -43, padding: "9px 13px", borderRadius: 9, border: `1px solid ${alpha(C.cyan, 0.24)}`, background: "rgba(4,16,26,0.9)", color: alpha(C.white, 0.9), fontSize: 10, letterSpacing: 1.4, fontWeight: 900, boxShadow: "0 10px 24px rgba(0,0,0,0.32)"}}>
        ORDER TOTAL&nbsp;&nbsp;<span style={{color: C.cyan}}>USD 128.40</span>
      </div>
    </div>
  );
};

const StageNode: React.FC<{
  x: number;
  y: number;
  index: string;
  label: string;
  detail: string;
  kind: GlyphKind;
  appearAt: number;
  arrival: number;
  failure?: boolean;
  time: number;
  frame: number;
  fps: number;
  decline: number;
}> = ({x, y, index, label, detail, kind, appearAt, arrival, failure = false, time, frame, fps, decline}) => {
  const appearFrame = appearAt * fps;
  const settle = frame < appearFrame
    ? 0
    : spring({
        frame: frame - appearFrame,
        fps,
        config: {damping: 16, stiffness: 125, mass: 0.72},
        durationInFrames: 44,
      });
  const scan = activityWindow(time, arrival - 0.42, arrival + 0.34, 0.18);
  const complete = fastRamp(time, arrival, arrival + 0.24);
  const color = failure ? mix(C.amber, C.red, decline) : mix(C.cyan, C.mint, complete);
  const dim = 1 - ramp(time, 5.28, 6.06) * 0.76;
  const status = failure
    ? time < arrival - 0.34
      ? "QUEUED"
      : time < arrival + 0.12
        ? "AUTHORIZING"
        : "DECLINED"
    : time < arrival - 0.34
      ? "QUEUED"
      : time < arrival + 0.1
        ? "VERIFYING"
        : "PASSED";

  return (
    <div
      style={{
        position: "absolute",
        left: x - 85,
        top: y - 78,
        width: 170,
        height: 156,
        opacity: settle * dim,
        transform: `translateY(${(1 - settle) * 24}px) scale(${0.88 + settle * 0.12})`,
        transformOrigin: "center",
        zIndex: 5,
      }}
    >
      <div style={{position: "absolute", left: 23, top: 17, width: 124, height: 124, borderRadius: 26, border: `1.4px solid ${alpha(color, 0.25 + scan * 0.5 + complete * 0.2)}`, background: "linear-gradient(155deg, rgba(11,33,48,0.97), rgba(4,14,23,0.98))", boxShadow: `0 18px 40px rgba(0,0,0,0.36), 0 0 ${scan * 28}px ${alpha(color, 0.23)}, inset 0 1px 0 rgba(255,255,255,0.08)`, overflow: "hidden"}}>
        <div style={{position: "absolute", left: 0, top: `${interpolate(scan, [0, 1], [-20, 120], clamp)}px`, width: 124, height: 24, background: `linear-gradient(180deg, transparent, ${alpha(color, 0.2)}, transparent)`, opacity: scan}} />
        <div style={{position: "absolute", left: 36, top: 22, width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${alpha(color, 0.23 + complete * 0.28)}`, background: alpha(color, 0.075 + scan * 0.055)}}>
          <Glyph kind={kind} color={color} size={36} strokeWidth={2.6} />
        </div>
        <div style={{position: "absolute", left: 12, right: 12, top: 86, color: C.white, textAlign: "center", fontSize: 10.5, letterSpacing: 1.35, fontWeight: 900, whiteSpace: "nowrap"}}>{label}</div>
        <div style={{position: "absolute", left: 12, right: 12, top: 105, color: alpha(C.muted, 0.92), textAlign: "center", fontSize: 7.6, letterSpacing: 1.05, fontWeight: 800, whiteSpace: "nowrap"}}>{detail}</div>
      </div>

      <div style={{position: "absolute", left: 9, top: 3, minWidth: 34, height: 22, padding: "0 7px", borderRadius: 11, border: `1px solid ${alpha(color, 0.36)}`, background: C.panelDeep, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8.5, letterSpacing: 1.2, fontWeight: 900}}>{index}</div>
      <div style={{position: "absolute", right: 5, top: 3, minWidth: 57, height: 22, padding: "0 8px", borderRadius: 11, border: `1px solid ${alpha(color, 0.25 + complete * 0.3)}`, background: C.panelDeep, color: alpha(color, 0.92), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7.5, letterSpacing: 0.85, fontWeight: 900}}>{status}</div>
    </div>
  );
};

const AuthorizationRail: React.FC<{
  time: number;
  motionTime: number;
  decline: number;
}> = ({time, motionTime, decline}) => {
  const points: Point[] = [
    {x: 456, y: 540},
    {x: 680, y: 540},
    {x: 910, y: 540},
    {x: 1140, y: 540},
    {x: 1370, y: 540},
  ];
  const length = routeLength(points);
  const reveal = fastRamp(time, 1.12, 2.04);
  const dim = 1 - ramp(time, 5.25, 6.05) * 0.8;
  const packetProgress = interpolate(
    motionTime,
    [1.82, 2.36, 3.1, 3.83, 4.86],
    [0, 0.245, 0.497, 0.748, 1],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const packetVisible = activityWindow(time, 1.74, 5.28, 0.14) * dim;
  const position = pointOnRoute(points, packetProgress);
  const tail = pointOnRoute(points, Math.max(0, packetProgress - 0.045));
  const dash = interpolate(motionTime, [0, 4.86], [0, 310], clamp);

  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: "absolute", left: 0, top: 0, zIndex: 2, overflow: "visible", opacity: dim}}>
      <defs>
        <linearGradient id="authorizationRoute" x1="456" y1="540" x2="1370" y2="540" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.cyan} />
          <stop offset="0.68" stopColor={C.blue} />
          <stop offset="0.87" stopColor={C.amber} />
          <stop offset="1" stopColor={mix(C.amber, C.red, decline)} />
        </linearGradient>
        <filter id="routeGlow" x="-100%" y="-400%" width="300%" height="900%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <line x1="456" y1="540" x2="1370" y2="540" stroke={C.lineSoft} strokeWidth="8" strokeLinecap="round" />
      <line x1="456" y1="540" x2="1370" y2="540" stroke="url(#authorizationRoute)" strokeWidth="4" strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - reveal)} opacity={0.7} filter="url(#routeGlow)" />
      <line x1="456" y1="540" x2="1370" y2="540" stroke={C.white} strokeWidth="1.3" strokeLinecap="round" strokeDasharray="7 25" strokeDashoffset={-dash} opacity={reveal * 0.42 * (1 - decline * 0.55)} />

      {[570, 795, 1025, 1255].map((x, index) => (
        <g key={x} opacity={reveal * (0.28 + index * 0.035)}>
          <circle cx={x} cy="540" r="3" fill={index > 2 ? C.amber : C.cyan} />
          <circle cx={x} cy="540" r="9" fill="none" stroke={index > 2 ? C.amber : C.cyan} strokeWidth="1" opacity="0.35" />
        </g>
      ))}

      <g opacity={packetVisible}>
        <line x1={tail.x} y1={tail.y} x2={position.x} y2={position.y} stroke={mix(C.cyan, C.red, decline)} strokeWidth="15" strokeLinecap="round" opacity="0.25" filter="url(#routeGlow)" />
        <circle cx={position.x} cy={position.y} r="17" fill={alpha(mix(C.cyan, C.red, decline), 0.1)} />
        <circle cx={position.x} cy={position.y} r="8" fill={mix(C.cyan, C.red, decline)} filter="url(#routeGlow)" />
        <circle cx={position.x - 2} cy={position.y - 2} r="2.2" fill="#ffffff" />
      </g>
    </svg>
  );
};

const ImpactBurst: React.FC<{time: number; decline: number}> = ({time, decline}) => {
  const burst = activityWindow(time, 4.82, 6.12, 0.12);
  const radius = interpolate(time, [4.86, 5.72], [28, 270], clamp);
  const shardTravel = fastRamp(time, 4.92, 5.55);

  return (
    <div style={{position: "absolute", left: 1370, top: 540, width: 0, height: 0, zIndex: 12, opacity: burst}}>
      {[0, 1, 2].map((ring) => {
        const ringRadius = Math.max(0, radius - ring * 42);
        return (
          <div key={ring} style={{position: "absolute", left: -ringRadius, top: -ringRadius, width: ringRadius * 2, height: ringRadius * 2, borderRadius: "50%", border: `${2.4 - ring * 0.45}px solid ${alpha(C.red, 0.7 - ring * 0.16)}`, boxShadow: `0 0 22px ${alpha(C.red, 0.2)}`, opacity: Math.max(0, 1 - ringRadius / 320)}} />
        );
      })}
      {Array.from({length: 12}, (_, index) => {
        const angle = (index / 12) * Math.PI * 2 + 0.18;
        const distance = shardTravel * (52 + (index % 4) * 18);
        const size = 3 + (index % 3) * 1.5;
        return (
          <div key={index} style={{position: "absolute", left: Math.cos(angle) * distance - size / 2, top: Math.sin(angle) * distance - size / 2, width: size, height: size, borderRadius: index % 2 === 0 ? "50%" : 1, background: index % 3 === 0 ? C.amber : C.red, boxShadow: `0 0 10px ${alpha(C.red, 0.7)}`, transform: `rotate(${angle * 57.2958}deg)`, opacity: decline * (1 - shardTravel * 0.68)}} />
        );
      })}
    </div>
  );
};

const RecoveryOption: React.FC<{
  icon: GlyphKind;
  eyebrow: string;
  label: string;
  detail: string;
  color: string;
  appearAt: number;
  time: number;
  frame: number;
  fps: number;
}> = ({icon, eyebrow, label, detail, color, appearAt, time, frame, fps}) => {
  const appearFrame = appearAt * fps;
  const settle = frame < appearFrame
    ? 0
    : spring({
        frame: frame - appearFrame,
        fps,
        config: {damping: 15, stiffness: 118, mass: 0.72},
        durationInFrames: 46,
      });
  const pulse = 0.5 + Math.sin((Math.min(time, 12.5) - appearAt) * 2.1) * 0.5;

  return (
    <div style={{position: "relative", width: 290, height: 118, opacity: settle, transform: `translateY(${(1 - settle) * 24}px) scale(${0.92 + settle * 0.08})`, transformOrigin: "center", borderRadius: 17, border: `1px solid ${alpha(color, 0.2 + settle * 0.2)}`, background: "linear-gradient(145deg, rgba(12,31,44,0.96), rgba(5,15,24,0.98))", boxShadow: `0 14px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.065)`, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 0, top: 0, width: 4, height: 118, background: color, boxShadow: `0 0 ${10 + pulse * 8}px ${alpha(color, 0.5)}`}} />
      <div style={{position: "absolute", left: 18, top: 24, width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${alpha(color, 0.28)}`, background: alpha(color, 0.075)}}>
        <Glyph kind={icon} color={color} size={34} strokeWidth={2.5} />
      </div>
      <div style={{position: "absolute", left: 88, top: 20, color: alpha(color, 0.88), fontSize: 8.5, letterSpacing: 1.55, fontWeight: 900}}>{eyebrow}</div>
      <div style={{position: "absolute", left: 88, top: 41, color: C.white, fontSize: 14, letterSpacing: 0.9, fontWeight: 900, whiteSpace: "nowrap"}}>{label}</div>
      <div style={{position: "absolute", left: 88, top: 69, right: 12, color: alpha(C.muted, 0.94), fontSize: 9, lineHeight: 1.35, letterSpacing: 0.35, fontWeight: 700}}>{detail}</div>
      <div style={{position: "absolute", right: 15, top: 18, color: alpha(color, 0.66), fontSize: 16, fontWeight: 900}}>›</div>
    </div>
  );
};

const DeclinePanel: React.FC<{
  time: number;
  frame: number;
  fps: number;
  sceneOpacity: number;
}> = ({time, frame, fps, sceneOpacity}) => {
  const appearFrame = 5.12 * fps;
  const settle = frame < appearFrame
    ? 0
    : spring({
        frame: frame - appearFrame,
        fps,
        config: {damping: 14, stiffness: 108, mass: 0.76},
        durationInFrames: 62,
      });
  const contentReveal = fastRamp(time, 5.34, 6.08);
  const detailReveal = fastRamp(time, 6.12, 6.72);
  const crossReveal = fastRamp(time, 5.3, 5.82);
  const holdPulse = 0.5 + Math.sin(Math.min(time, 12.6) * 2.15) * 0.5;
  const visible = settle * sceneOpacity;

  return (
    <div style={{position: "absolute", left: 455, top: 198, width: 1010, height: 650, opacity: visible, transform: `translateX(${(1 - settle) * 170}px) translateY(${(1 - settle) * 20}px) scale(${0.87 + settle * 0.13})`, transformOrigin: "76% 50%", zIndex: 20}}>
      <div style={{position: "absolute", left: 35, right: 35, top: 28, bottom: -18, borderRadius: 42, background: alpha(C.red, 0.16), filter: "blur(42px)", opacity: 0.55 + holdPulse * 0.12}} />
      <div style={{position: "absolute", left: 0, top: 0, width: 1010, height: 650, borderRadius: 32, overflow: "hidden", border: `1.5px solid ${alpha(C.red, 0.58)}`, background: "linear-gradient(145deg, rgba(13,31,43,0.985) 0%, rgba(6,17,27,0.995) 56%, rgba(10,16,25,0.995) 100%)", boxShadow: `0 34px 90px rgba(0,0,0,0.56), 0 0 48px ${alpha(C.red, 0.16)}, inset 0 1px 0 rgba(255,255,255,0.11)`}}>
        <div style={{position: "absolute", left: 0, top: 0, width: 1010, height: 650, background: `radial-gradient(circle at 16% 30%, ${alpha(C.red, 0.115)}, transparent 30%), radial-gradient(circle at 88% 2%, ${alpha(C.blue, 0.07)}, transparent 33%)`}} />
        <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 62, borderBottom: `1px solid ${alpha(C.line, 0.72)}`, background: "rgba(3,12,20,0.58)"}} />
        <div style={{position: "absolute", left: 26, top: 20, display: "flex", alignItems: "center", gap: 12}}>
          <div style={{width: 9, height: 9, borderRadius: "50%", background: C.red, boxShadow: `0 0 15px ${alpha(C.red, 0.9)}`}} />
          <div style={{color: alpha(C.white, 0.92), fontSize: 10, letterSpacing: 2.2, fontWeight: 900}}>AUTHORIZATION RESPONSE</div>
          <div style={{width: 1, height: 18, background: alpha(C.line, 0.8)}} />
          <div style={{color: alpha(C.red, 0.9), fontSize: 9.5, letterSpacing: 1.6, fontWeight: 900}}>SESSION HALTED</div>
        </div>
        <div style={{position: "absolute", right: 28, top: 20, color: alpha(C.muted, 0.92), fontSize: 9.5, letterSpacing: 1.7, fontWeight: 800}}>ISSUER RESPONSE • DECLINED</div>

        <div style={{position: "absolute", left: 52, top: 94, width: 188, height: 188, borderRadius: "50%", border: `1.5px solid ${alpha(C.red, 0.42)}`, background: `radial-gradient(circle, ${alpha(C.red, 0.13)}, ${alpha(C.red, 0.025)} 66%, transparent 67%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${30 + holdPulse * 18}px ${alpha(C.red, 0.18)}`}}>
          <div style={{position: "absolute", width: 146 + holdPulse * 5, height: 146 + holdPulse * 5, borderRadius: "50%", border: `1px solid ${alpha(C.red, 0.2)}`}} />
          <svg viewBox="0 0 124 124" width="124" height="124">
            <path d="M62 10l39 15v29c0 26-15 47-39 60-24-13-39-34-39-60V25z" fill={alpha(C.red, 0.07)} stroke={C.red} strokeWidth="4" strokeLinejoin="round" />
            <path d="M44 43l36 38M80 43L44 81" fill="none" stroke={C.red} strokeWidth="7" strokeLinecap="round" strokeDasharray="54" strokeDashoffset={54 * (1 - crossReveal)} />
          </svg>
        </div>
        <div style={{position: "absolute", left: 71, top: 291, width: 150, textAlign: "center", color: alpha(C.red, 0.92), fontSize: 9.5, letterSpacing: 1.9, fontWeight: 900}}>PAYMENT STOPPED</div>

        <div style={{position: "absolute", left: 288, top: 91, width: 660, height: 178, overflow: "hidden"}}>
          <div style={{position: "absolute", left: 0, top: 0, color: alpha(C.red, 0.92), fontSize: 11, letterSpacing: 3.1, fontWeight: 900, opacity: contentReveal}}>SECURE PAYMENT STATUS</div>
          <div style={{position: "absolute", left: 0, top: 27, width: `${contentReveal * 100}%`, overflow: "hidden", whiteSpace: "nowrap"}}>
            <div style={{color: C.white, fontSize: 48, lineHeight: 1, letterSpacing: 1.2, fontWeight: 800}}>PAYMENT</div>
            <div style={{marginTop: 3, color: C.red, fontSize: 72, lineHeight: 0.98, letterSpacing: 0.6, fontWeight: 900, textShadow: `0 0 28px ${alpha(C.red, 0.24)}`}}>DECLINED</div>
          </div>
          <div style={{position: "absolute", left: 0, top: 143, color: alpha(C.text, 0.9), fontSize: 15, letterSpacing: 0.45, fontWeight: 700, opacity: detailReveal}}>Authorization failed. No charge was made to this card.</div>
        </div>

        <div style={{position: "absolute", left: 52, top: 337, width: 906, height: 86, borderRadius: 16, border: `1px solid ${alpha(C.red, 0.16)}`, background: "rgba(3,13,22,0.68)", opacity: detailReveal, overflow: "hidden"}}>
          {[
            {x: 0, label: "AMOUNT", value: "USD 128.40", color: C.white},
            {x: 302, label: "PAYMENT METHOD", value: "CARD •••• 4831", color: C.white},
            {x: 604, label: "TRANSACTION STATE", value: "NOT CHARGED", color: C.mint},
          ].map((item, index) => (
            <div key={item.label} style={{position: "absolute", left: item.x, top: 0, width: 302, height: 86, borderLeft: index === 0 ? undefined : `1px solid ${alpha(C.line, 0.68)}`}}>
              <div style={{position: "absolute", left: index === 0 ? 21 : 25, top: 19, color: alpha(C.muted, 0.9), fontSize: 8.5, letterSpacing: 1.7, fontWeight: 900}}>{item.label}</div>
              <div style={{position: "absolute", left: index === 0 ? 21 : 25, top: 43, color: item.color, fontSize: 15, letterSpacing: 0.9, fontWeight: 900}}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{position: "absolute", left: 52, top: 449, color: alpha(C.muted, 0.92), fontSize: 9.5, letterSpacing: 2.1, fontWeight: 900, opacity: detailReveal}}>RECOVERY OPTIONS</div>
        <div style={{position: "absolute", left: 52, top: 478, display: "flex", flexDirection: "row", gap: 18}}>
          <RecoveryOption icon="verify" eyebrow="CHECK 01" label="VERIFY DETAILS" detail="Confirm card data and billing information." color={C.cyan} appearAt={6.82} time={time} frame={frame} fps={fps} />
          <RecoveryOption icon="retry" eyebrow="RETRY 02" label="TRY AGAIN" detail="Retry after confirming the available balance." color={C.amber} appearAt={7.16} time={time} frame={frame} fps={fps} />
          <RecoveryOption icon="wallet" eyebrow="OPTION 03" label="OTHER METHOD" detail="Choose a different secure payment method." color={C.mint} appearAt={7.46} time={time} frame={frame} fps={fps} />
        </div>

        <div style={{position: "absolute", left: 52, right: 52, bottom: 22, height: 1, background: `linear-gradient(90deg, ${alpha(C.red, 0.42)}, ${alpha(C.line, 0.5)}, transparent)`}} />
        <div style={{position: "absolute", left: 52, bottom: 5, color: alpha(C.muted, 0.75), fontSize: 8, letterSpacing: 1.65, fontWeight: 800}}>PROTECTED RESPONSE • NO FUNDS TRANSFERRED</div>
        <div style={{position: "absolute", right: 52, bottom: 5, color: alpha(C.red, 0.75), fontSize: 8, letterSpacing: 1.65, fontWeight: 900}}>ACTION REQUIRED</div>

        <div style={{position: "absolute", left: interpolate(time, [5.15, 6.42], [-180, 1080], clamp), top: 0, width: 130, height: 650, transform: "skewX(-12deg)", background: `linear-gradient(90deg, transparent, ${alpha(C.red, 0.055)}, rgba(255,255,255,0.11), transparent)`, opacity: activityWindow(time, 5.14, 6.44, 0.14), pointerEvents: "none"}} />
      </div>
    </div>
  );
};

const Header: React.FC<{
  time: number;
  sceneOpacity: number;
  decline: number;
}> = ({time, sceneOpacity, decline}) => {
  const reveal = fastRamp(time, 0.36, 1.02);
  const statusColor = mix(C.mint, C.red, decline);

  return (
    <div style={{position: "absolute", left: 88, right: 88, top: 58, height: 74, opacity: sceneOpacity * reveal, fontFamily: "Arial, Helvetica, sans-serif", zIndex: 40}}>
      <div style={{position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 14}}>
        <div style={{width: 38, height: 38, borderRadius: 11, border: `1px solid ${alpha(C.cyan, 0.34)}`, background: alpha(C.cyan, 0.065), display: "flex", alignItems: "center", justifyContent: "center"}}>
          <Glyph kind="lock" color={C.cyan} size={24} strokeWidth={2.6} />
        </div>
        <div>
          <div style={{color: C.white, fontSize: 15, letterSpacing: 2.3, fontWeight: 900}}>SECURE PAYMENT AUTHORIZATION</div>
          <div style={{marginTop: 7, color: alpha(C.muted, 0.9), fontSize: 9.5, letterSpacing: 1.75, fontWeight: 800}}>TOKEN • DEVICE • ENCRYPTION • ISSUER RESPONSE</div>
        </div>
      </div>

      <div style={{position: "absolute", right: 0, top: 2, display: "flex", flexDirection: "row", gap: 10}}>
        <div style={{height: 34, padding: "0 14px", borderRadius: 10, border: `1px solid ${alpha(C.cyan, 0.23)}`, background: "rgba(4,16,26,0.78)", display: "flex", alignItems: "center", gap: 8}}>
          <div style={{width: 6, height: 6, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 10px ${alpha(C.cyan, 0.78)}`}} />
          <span style={{color: alpha(C.cyan, 0.9), fontSize: 8.5, letterSpacing: 1.35, fontWeight: 900}}>ENCRYPTED CHANNEL</span>
        </div>
        <div style={{height: 34, minWidth: 145, padding: "0 14px", borderRadius: 10, border: `1px solid ${alpha(statusColor, 0.3)}`, background: "rgba(4,16,26,0.78)", display: "flex", alignItems: "center", gap: 8}}>
          <div style={{width: 6, height: 6, borderRadius: "50%", background: statusColor, boxShadow: `0 0 11px ${alpha(statusColor, 0.85)}`}} />
          <span style={{color: alpha(statusColor, 0.92), fontSize: 8.5, letterSpacing: 1.35, fontWeight: 900}}>{decline > 0.5 ? "PAYMENT HALTED" : "SESSION ACTIVE"}</span>
        </div>
      </div>

      <div style={{position: "absolute", left: 0, right: 0, top: 68, height: 1, background: `linear-gradient(90deg, ${alpha(C.cyan, 0.34)}, ${alpha(C.line, 0.46)} 48%, transparent)`}} />
    </div>
  );
};

const ProgressRail: React.FC<{
  time: number;
  sceneOpacity: number;
  decline: number;
}> = ({time, sceneOpacity, decline}) => {
  const stages = [
    {label: "TOKENIZED", at: 2.36, color: C.cyan},
    {label: "DEVICE VERIFIED", at: 3.1, color: C.mint},
    {label: "CHANNEL SECURED", at: 3.83, color: C.blue},
    {label: "BANK AUTHORIZATION", at: 4.86, color: C.red},
  ];
  const reveal = fastRamp(time, 0.95, 1.5);
  const progress = interpolate(time, stages.map((stage) => stage.at), stages.map((_, index) => index / (stages.length - 1)), clamp);

  return (
    <div style={{position: "absolute", left: 152, right: 152, top: 976, height: 66, opacity: sceneOpacity * reveal, zIndex: 42, fontFamily: "Arial, Helvetica, sans-serif"}}>
      <div style={{position: "absolute", left: 0, right: 0, top: 12, height: 2, background: alpha(C.line, 0.72)}} />
      <div style={{position: "absolute", left: 0, top: 12, width: `${progress * 100}%`, height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.mint}, ${C.blue}, ${mix(C.amber, C.red, decline)})`, boxShadow: `0 0 13px ${alpha(decline > 0.5 ? C.red : C.cyan, 0.45)}`}} />
      {stages.map((stage, index) => {
        const x = (index / (stages.length - 1)) * 100;
        const complete = fastRamp(time, stage.at, stage.at + 0.22);
        const stageColor = index === stages.length - 1 ? mix(C.amber, C.red, decline) : stage.color;
        return (
          <div key={stage.label} style={{position: "absolute", left: `${x}%`, top: 0}}>
            <div style={{position: "absolute", left: -7, top: 5, width: 15, height: 15, borderRadius: "50%", border: `2px solid ${mix("#365468", stageColor, complete)}`, background: mix(C.bg2, stageColor, complete), boxShadow: `0 0 ${complete * 14}px ${alpha(stageColor, 0.8)}`}} />
            <div style={{position: "absolute", top: 31, left: index === 0 ? 0 : index === stages.length - 1 ? undefined : "50%", right: index === stages.length - 1 ? 0 : undefined, transform: index > 0 && index < stages.length - 1 ? "translateX(-50%)" : undefined, color: mix(C.muted, index === stages.length - 1 && decline > 0.5 ? C.red : C.white, complete), fontSize: 9.2, letterSpacing: 1.5, fontWeight: 900, whiteSpace: "nowrap"}}>{stage.label}</div>
            <div style={{position: "absolute", top: 48, left: index === 0 ? 0 : index === stages.length - 1 ? undefined : "50%", right: index === stages.length - 1 ? 0 : undefined, transform: index > 0 && index < stages.length - 1 ? "translateX(-50%)" : undefined, color: alpha(stageColor, 0.72), fontSize: 7.5, letterSpacing: 1.2, fontWeight: 800, whiteSpace: "nowrap"}}>{index === stages.length - 1 && decline > 0.5 ? "DECLINED" : complete > 0.5 ? "COMPLETE" : "PENDING"}</div>
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
  const motionTime = Math.min(time, 12.62);

  const sceneOpacity = Math.min(
    fastRamp(time, 0.05, 0.55),
    1 - fastRamp(time, 13.42, 14.24),
  );
  const decline = fastRamp(time, 4.82, 5.2);
  const resultDim = ramp(time, 5.05, 5.76) * 0.64;

  const cameraScale = interpolate(
    time,
    [0, 1.8, 4.3, 5.18, 6.36, 13.48, 14.32, 14.82, 15],
    [1.02, 1.02, 1.06, 1.105, 0.94, 0.94, 0.94, 1.02, 1.02],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const cameraX = interpolate(
    time,
    [0, 1.8, 4.3, 5.18, 6.36, 13.48, 14.32, 14.82, 15],
    [38, 38, -54, -84, 0, 0, 0, 38, 38],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const cameraY = interpolate(
    time,
    [0, 4.3, 5.18, 6.36, 13.48, 14.32, 14.82, 15],
    [8, 0, -14, 14, 14, 14, 8, 8],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );

  const nodes = [
    {x: 680, index: "01", label: "TOKENIZED", detail: "CARD DATA", kind: "token" as GlyphKind, appearAt: 1.03, arrival: 2.36},
    {x: 910, index: "02", label: "DEVICE CHECK", detail: "IDENTITY SIGNAL", kind: "device" as GlyphKind, appearAt: 1.2, arrival: 3.1},
    {x: 1140, index: "03", label: "ENCRYPTED", detail: "SECURE CHANNEL", kind: "lock" as GlyphKind, appearAt: 1.37, arrival: 3.83},
    {x: 1370, index: "04", label: "BANK AUTH", detail: "ISSUER RESPONSE", kind: "bank" as GlyphKind, appearAt: 1.54, arrival: 4.86, failure: true},
  ];

  return (
    <AbsoluteFill style={{background: C.bg, overflow: "hidden", fontFamily: "Arial, Helvetica, sans-serif"}}>
      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, background: "radial-gradient(circle at 52% 46%, rgba(21,86,120,0.16), transparent 43%), radial-gradient(circle at 82% 52%, rgba(112,25,45,0.08), transparent 32%), linear-gradient(135deg, #02070d 0%, #06131f 53%, #02070d 100%)"}} />
      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 0.42, backgroundImage: "linear-gradient(rgba(58,139,184,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(58,139,184,0.09) 1px, transparent 1px), linear-gradient(rgba(58,139,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(58,139,184,0.03) 1px, transparent 1px)", backgroundSize: "54px 54px, 54px 54px, 13.5px 13.5px, 13.5px 13.5px", maskImage: "radial-gradient(ellipse at 50% 50%, black 0%, rgba(0,0,0,0.75) 62%, transparent 100%)"}} />
      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, opacity: sceneOpacity}}>
        {backgroundParticles.map((particle, index) => {
          const drift = Math.sin(motionTime * 0.55 + particle.phase) * 7;
          const twinkle = 0.62 + Math.sin(motionTime * 1.7 + particle.phase) * 0.38;
          return (
            <div key={index} style={{position: "absolute", left: particle.x, top: particle.y + drift, width: particle.radius * 2, height: particle.radius * 2, borderRadius: "50%", background: index % 10 === 0 ? C.red : C.cyan, opacity: particle.opacity * twinkle, boxShadow: `0 0 ${particle.radius * 7}px currentColor`}} />
          );
        })}
      </div>

      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, opacity: sceneOpacity, transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`, transformOrigin: "960px 540px"}}>
        <div style={{position: "absolute", left: 98, right: 98, top: 302, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(C.line, 0.34)}, ${alpha(C.line, 0.34)}, transparent)`, opacity: 1 - resultDim}} />
        <div style={{position: "absolute", left: 114, top: 319, color: alpha(C.cyan, 0.48), fontSize: 9, letterSpacing: 2.2, fontWeight: 900, opacity: 1 - resultDim}}>PAYMENT TOKEN / ORIGIN</div>
        <div style={{position: "absolute", left: 593, top: 319, color: alpha(C.blue, 0.48), fontSize: 9, letterSpacing: 2.2, fontWeight: 900, opacity: 1 - resultDim}}>REAL-TIME AUTHORIZATION ROUTE</div>
        <div style={{position: "absolute", right: 177, top: 319, color: alpha(C.amber, 0.52), fontSize: 9, letterSpacing: 2.2, fontWeight: 900, opacity: 1 - resultDim}}>ISSUER GATE / RESPONSE</div>

        <PaymentCard time={time} frame={frame} fps={fps} decline={decline} />
        <AuthorizationRail time={time} motionTime={motionTime} decline={decline} />
        {nodes.map((node) => (
          <StageNode key={node.index} {...node} y={540} time={time} frame={frame} fps={fps} decline={decline} />
        ))}

        <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, zIndex: 9, background: `rgba(2,7,13,${resultDim * 0.74})`, opacity: resultDim, pointerEvents: "none"}} />
        <ImpactBurst time={time} decline={decline} />
        <DeclinePanel time={time} frame={frame} fps={fps} sceneOpacity={1} />
      </div>

      <Header time={time} sceneOpacity={sceneOpacity} decline={decline} />
      <ProgressRail time={time} sceneOpacity={sceneOpacity} decline={decline} />

      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, background: alpha(C.red, 0.1), opacity: activityWindow(time, 4.88, 5.45, 0.08), pointerEvents: "none"}} />
      <div style={{position: "absolute", left: interpolate(time, [13.4, 14.28], [W + 360, -520], clamp), top: 0, width: 330, height: H, opacity: activityWindow(time, 13.36, 14.31, 0.14) * 0.76, transform: "skewX(-10deg)", background: `linear-gradient(90deg, transparent, ${alpha(C.red, 0.06)}, rgba(255,255,255,0.12), ${alpha(C.cyan, 0.045)}, transparent)`, boxShadow: `0 0 60px ${alpha(C.red, 0.08)}`, pointerEvents: "none"}} />
      <div style={{position: "absolute", left: 0, right: 0, top: ((motionTime * 82) % (H + 160)) - 80, height: 82, opacity: sceneOpacity * 0.035 * (1 - decline * 0.7), background: "linear-gradient(180deg, transparent, rgba(53,216,255,0.32), transparent)", pointerEvents: "none"}} />
      <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none", boxShadow: "inset 0 0 180px rgba(0,0,0,0.62)"}} />
    </AbsoluteFill>
  );
};
