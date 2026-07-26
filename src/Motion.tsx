import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const COLORS = {
  black: "#010509",
  navy: "#03121b",
  cyan: "#36e9ff",
  cyanSoft: "#159ac4",
  cyanDeep: "#075976",
  red: "#ff174f",
  redHot: "#ff496d",
  white: "#f5fdff",
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const hash = (seed: number) => {
  const value = Math.sin(seed * 91.173 + 14.739) * 43758.5453123;
  return value - Math.floor(value);
};

const range = (count: number) => Array.from({length: count}, (_, i) => i);

const pulse = (frame: number, center: number, halfWidth: number) => {
  const distance = Math.abs(frame - center) / halfWidth;
  if (distance >= 1) {
    return 0;
  }
  return Math.pow(Math.sin((1 - distance) * Math.PI * 0.5), 1.7);
};

const HEX = "0123456789ABCDEF";

const makeToken = (seed: number, length: number) =>
  range(length)
    .map((i) => HEX[Math.floor(hash(seed * 17 + i * 3.71) * HEX.length)])
    .join("");

const makeCodeLine = (seed: number, count: number) =>
  range(count)
    .map((i) => {
      const prefix = i % 7 === 0 ? "0x" : i % 11 === 0 ? "SYS/" : "";
      const length = 2 + Math.floor(hash(seed * 13 + i * 9) * 4);
      return `${prefix}${makeToken(seed * 31 + i * 7, length)}`;
    })
    .join("  ");

const TRACE_TOKENS = [
  "SYS/CALL",
  "PROC/SPAWN",
  "FILE/WRITE",
  "REG/CHANGE",
  "NET/EGRESS",
  "MEM/ALLOC",
  "DNS/QUERY",
  "PID",
  "VM-07",
  "TRACE",
  "SHA256",
  "0x",
];

const makeTraceLine = (seed: number, count: number) =>
  range(count)
    .map((i) => {
      const token =
        TRACE_TOKENS[
          Math.floor(hash(seed * 7 + i * 13.17) * TRACE_TOKENS.length)
        ];
      const code = makeToken(seed * 31 + i * 7, 2 + (i % 4));
      return i % 3 === 0 ? `${token}:${code}` : code;
    })
    .join("  ");

const ROWS = range(17).map((i) => {
  const depth = hash(i + 22);
  return {
    id: i,
    y: -44 + i * 88 + (hash(i + 102) - 0.5) * 34,
    x: -210 + (hash(i + 202) - 0.5) * 330,
    fontSize: 45 + depth * 60 + (i % 6 === 0 ? 30 : 0),
    opacity: 0.22 + depth * 0.57,
    blur: Math.max(0, 2.7 - depth * 3.2),
    depth: -95 + depth * 145,
    phase: hash(i + 302) * Math.PI * 2,
    cycles: 1 + (i % 3),
    tracking: 2 + hash(i + 402) * 7,
    text: makeTraceLine(110 + i * 19, 25),
  };
});

const HUD_BITS = range(58).map((i) => ({
  id: i,
  x: hash(i + 810) * 2200,
  y: hash(i + 910) * 1360,
  width: 2 + hash(i + 1010) * 20,
  height: 1 + hash(i + 1110) * 4,
  opacity: 0.08 + hash(i + 1210) * 0.28,
  phase: hash(i + 1310) * Math.PI * 2,
  warm: hash(i + 1410) > 0.92,
}));

const GLITCH_LINES = range(16).map((i) => ({
  id: i,
  y: 45 + hash(i + 1500) * 980,
  left: hash(i + 1600) * 58,
  width: 16 + hash(i + 1700) * 46,
  height: 1 + hash(i + 1800) * 5,
  direction: i % 2 === 0 ? 1 : -1,
}));

type LedTextProps = {
  text: string;
  color: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  dot?: number;
  glow?: number;
  style?: React.CSSProperties;
};

const LedText: React.FC<LedTextProps> = ({
  text,
  color,
  fontSize,
  fontFamily = '"Arial Black", "Arial Narrow", Arial, sans-serif',
  fontWeight = 900,
  letterSpacing = 0,
  lineHeight = 1,
  dot = 7,
  glow = 12,
  style,
}) => {
  const shared: React.CSSProperties = {
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
    lineHeight,
    whiteSpace: "nowrap",
    fontSynthesis: "none",
  };

  return (
    <span
      style={{
        ...shared,
        ...style,
        display: "inline-block",
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          ...shared,
          position: "absolute",
          inset: 0,
          color,
          opacity: 0.24,
          filter: `blur(${Math.max(2, glow * 0.42)}px)`,
        }}
      >
        {text}
      </span>
      <span
        style={{
          ...shared,
          position: "relative",
          color: "transparent",
          backgroundImage: `radial-gradient(circle, ${color} 0 ${Math.max(
            1.15,
            dot * 0.31,
          )}px, rgba(255,255,255,0.65) ${Math.max(
            1.2,
            dot * 0.34,
          )}px, transparent ${Math.max(1.8, dot * 0.47)}px)`,
          backgroundSize: `${dot}px ${dot}px`,
          backgroundPosition: "center",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          filter: `drop-shadow(0 0 ${glow}px ${color})`,
        }}
      >
        {text}
      </span>
    </span>
  );
};

const ThreatGlyph: React.FC<{
  accent: string;
  brightness: number;
}> = ({accent, brightness}) => {
  const uid = React.useId().replace(/:/g, "");
  const shieldGlowId = `shield-glow-${uid}`;
  const shieldDotsId = `shield-dots-${uid}`;
  const bugDotsId = `bug-dots-${uid}`;
  const bugCoreId = `bug-core-${uid}`;
  const legs =
    "M101 105 79 91 61 94 M157 105 179 91 197 94 " +
    "M91 132 67 128 49 138 M167 132 191 128 209 138 " +
    "M94 161 72 177 59 196 M164 161 186 177 199 196";

  return (
    <svg
      width="258"
      height="258"
      viewBox="0 0 258 258"
      style={{
        overflow: "visible",
        filter: `brightness(${brightness}) drop-shadow(0 0 10px ${accent}) drop-shadow(0 0 34px ${accent})`,
      }}
    >
      <defs>
        <radialGradient id={shieldGlowId} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
          <stop offset="65%" stopColor={accent} stopOpacity="0.035" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <pattern
          id={shieldDotsId}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3.5" cy="3.5" r="1.8" fill={accent} />
        </pattern>
        <pattern
          id={bugDotsId}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="4" cy="4" r="2.25" fill={accent} />
          <circle cx="4" cy="4" r="0.8" fill={COLORS.white} opacity="0.82" />
        </pattern>
        <linearGradient id={bugCoreId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.34" />
          <stop offset="48%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <circle cx="129" cy="129" r="123" fill={`url(#${shieldGlowId})`} />
      <path
        d="M129 18 221 52v66c0 62-37 103-92 126-55-23-92-64-92-126V52Z"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeOpacity="0.26"
        strokeDasharray="3 11"
      />
      <path
        d="M129 31 207 59v58c0 51-29 88-78 110-49-22-78-59-78-110V59Z"
        fill="none"
        stroke={accent}
        strokeWidth="1.2"
        strokeOpacity="0.12"
      />

      <g
        fill="none"
        stroke={accent}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M111 78C104 65 94 58 82 55" />
        <path d="M147 78C154 65 164 58 176 55" />
        <circle cx="81" cy="54" r="3.5" fill={accent} stroke="none" />
        <circle cx="177" cy="54" r="3.5" fill={accent} stroke="none" />
        <path d={legs} />
      </g>

      <g stroke={accent} strokeLinejoin="round">
        <path
          d="M105 83C105 69 116 61 129 61s24 8 24 22v13h-48Z"
          fill={`url(#${bugCoreId})`}
          strokeWidth="5"
        />
        <path
          d="M96 101C96 91 104 84 114 84h30c10 0 18 7 18 17v27H96Z"
          fill={`url(#${bugDotsId})`}
          strokeWidth="5.5"
        />
        <path
          d="M129 122c31 0 45 20 42 48-3 24-18 39-42 48-24-9-39-24-42-48-3-28 11-48 42-48Z"
          fill={`url(#${bugDotsId})`}
          strokeWidth="6"
        />
        <path
          d="M129 124v91M91 149h76M89 176h80"
          fill="none"
          strokeWidth="3.2"
          strokeOpacity="0.86"
        />
        <path
          d="M102 135c-8 9-11 20-10 34 2 18 12 31 30 40M156 135c8 9 11 20 10 34-2 18-12 31-30 40"
          fill="none"
          stroke={COLORS.white}
          strokeWidth="1.8"
          strokeOpacity="0.32"
        />
      </g>

      <circle
        cx="129"
        cy="108"
        r="4.2"
        fill={COLORS.white}
        opacity="0.9"
      />

      <g fill={accent}>
        {[
          [79, 91],
          [179, 91],
          [67, 128],
          [191, 128],
          [72, 177],
          [186, 177],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.2" />
        ))}
      </g>

      <path
        d="M28 129h-18M248 129h-18M129 10V0M129 258v-10"
        stroke={accent}
        strokeWidth="2"
        strokeOpacity="0.45"
      />
      <circle
        cx="129"
        cy="129"
        r="112"
        fill="none"
        stroke={`url(#${shieldDotsId})`}
        strokeWidth="5"
        strokeOpacity="0.18"
      />
    </svg>
  );
};

const easeProgress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const windowOpacity = (
  frame: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number,
) =>
  clamp(
    easeProgress(frame, enterStart, enterEnd) *
      (1 - easeProgress(frame, exitStart, exitEnd)),
  );

const FileGlyph: React.FC<{accent: string; intensity: number}> = ({
  accent,
  intensity,
}) => {
  const uid = React.useId().replace(/:/g, "");
  const dotsId = `file-dots-${uid}`;

  return (
    <svg
      width="136"
      height="160"
      viewBox="0 0 136 160"
      style={{
        overflow: "visible",
        filter: `drop-shadow(0 0 ${12 + intensity * 22}px ${accent})`,
      }}
    >
      <defs>
        <pattern id={dotsId} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.55" fill={accent} />
        </pattern>
      </defs>
      <path
        d="M22 7h58l34 35v110H22Z"
        fill="rgba(3,20,29,0.88)"
        stroke={accent}
        strokeWidth="3"
      />
      <path
        d="M80 7v36h34"
        fill="none"
        stroke={accent}
        strokeWidth="3"
      />
      <path
        d="M35 61h65M35 77h54M35 125h65"
        stroke={accent}
        strokeWidth="3"
        strokeDasharray="5 7"
        opacity="0.48"
      />
      <g
        fill={`url(#${dotsId})`}
        stroke={accent}
        strokeWidth="2.6"
        strokeLinejoin="round"
      >
        <path d="M54 90c0-9 6-15 14-15s14 6 14 15v7H54Z" />
        <path d="M49 99h38v14c0 13-8 21-19 26-11-5-19-13-19-26Z" />
      </g>
      <path
        d="M57 78 49 69M79 78l8-9M50 103l-12-6M86 103l12-6M51 117l-12 8M85 117l12 8"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="12"
        y="137"
        width="112"
        height="15"
        fill={accent}
        opacity={0.1 + intensity * 0.18}
      />
      <text
        x="68"
        y="148"
        fill={accent}
        fontFamily="Courier New, monospace"
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="1.6"
      >
        SAMPLE_09A7
      </text>
    </svg>
  );
};

const LockGlyph: React.FC<{accent: string}> = ({accent}) => (
  <svg
    width="86"
    height="98"
    viewBox="0 0 86 98"
    style={{
      overflow: "visible",
      filter: `drop-shadow(0 0 12px ${accent}) drop-shadow(0 0 28px ${accent})`,
    }}
  >
    <path
      d="M21 42V29C21 13 30 5 43 5s22 8 22 24v13"
      fill="none"
      stroke={accent}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <rect
      x="9"
      y="39"
      width="68"
      height="53"
      rx="5"
      fill="rgba(2,18,25,0.88)"
      stroke={accent}
      strokeWidth="4"
    />
    <circle cx="43" cy="62" r="7" fill={accent} />
    <path d="M43 67v13" stroke={accent} strokeWidth="5" />
  </svg>
);

type BehaviorKind = "process" | "file" | "registry" | "network";

const BehaviorIcon: React.FC<{
  kind: BehaviorKind;
  accent: string;
}> = ({kind, accent}) => {
  if (kind === "process") {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <g fill="none" stroke={accent} strokeWidth="2.5">
          <rect x="18" y="4" width="12" height="10" />
          <rect x="3" y="34" width="12" height="10" />
          <rect x="18" y="34" width="12" height="10" />
          <rect x="33" y="34" width="12" height="10" />
          <path d="M24 14v10M9 24h30M9 24v10M24 24v10M39 24v10" />
        </g>
      </svg>
    );
  }

  if (kind === "file") {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <path
          d="M10 4h18l10 11v29H10Z"
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
        />
        <path d="M28 4v12h10M16 25h16M16 32h12" stroke={accent} strokeWidth="2.5" />
      </svg>
    );
  }

  if (kind === "registry") {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48">
        {[4, 18, 32].map((x, i) => (
          <React.Fragment key={x}>
            <rect
              x={x}
              y={i === 1 ? 5 : 19}
              width="12"
              height="12"
              fill="none"
              stroke={accent}
              strokeWidth="2.3"
            />
            <rect
              x={x}
              y={i === 1 ? 31 : 33}
              width="12"
              height="12"
              fill={i === 2 ? accent : "none"}
              fillOpacity="0.28"
              stroke={accent}
              strokeWidth="2.3"
            />
          </React.Fragment>
        ))}
      </svg>
    );
  }

  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <g fill="none" stroke={accent} strokeWidth="2.5">
        <circle cx="8" cy="24" r="5" />
        <circle cx="39" cy="9" r="5" />
        <circle cx="39" cy="39" r="5" />
        <circle cx="25" cy="24" r="6" />
        <path d="M13 24h6M29 20l6-7M29 28l6 7" />
      </g>
    </svg>
  );
};

const BehaviorCard: React.FC<{
  label: string;
  value: string;
  kind: BehaviorKind;
  reveal: number;
  active: number;
  contained: number;
  phase: number;
  index: number;
}> = ({
  label,
  value,
  kind,
  reveal,
  active,
  contained,
  phase,
  index,
}) => {
  const accent =
    contained > 0.42
      ? COLORS.cyan
      : active > 0.15
        ? COLORS.red
        : COLORS.cyanSoft;
  const alertStrength = active * (1 - contained);
  const cardOpacity = 0.38 + reveal * 0.62;

  return (
    <div
      style={{
        width: 308,
        height: 84,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        padding: "10px 13px",
        boxSizing: "border-box",
        border: `1px solid ${accent}${active > 0.1 ? "76" : "38"}`,
        background:
          "linear-gradient(100deg, rgba(2,15,22,0.94), rgba(3,27,37,0.62))",
        boxShadow: `inset 0 0 24px ${accent}10, 0 0 ${
          8 + alertStrength * 16
        }px ${accent}19`,
        opacity: cardOpacity,
        transform: `translateX(${(1 - reveal) * (26 + index * 5)}px)`,
      }}
    >
      <div
        style={{
          width: 55,
          height: 55,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRight: `1px solid ${accent}38`,
          marginRight: 12,
          filter: `drop-shadow(0 0 ${6 + alertStrength * 8}px ${accent})`,
        }}
      >
        <BehaviorIcon kind={kind} accent={accent} />
      </div>
      <div style={{display: "flex", flexDirection: "column", minWidth: 0}}>
        <div
          style={{
            color: COLORS.cyan,
            fontFamily: '"Courier New", monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2.2,
            whiteSpace: "nowrap",
            opacity: 0.66,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: accent,
            fontFamily: '"Arial Narrow", Arial, sans-serif',
            fontSize: 22,
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: 1.2,
            whiteSpace: "nowrap",
            textShadow: `0 0 10px ${accent}`,
          }}
        >
          {value}
        </div>
        <div
          style={{
            width: 208,
            height: 3,
            marginTop: 7,
            background: "rgba(38,224,255,0.11)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${clamp(
                0.22 +
                  active * 0.68 +
                  contained * 0.7 +
                  Math.sin(phase * (2 + index) + index) * 0.08,
              ) * 100}%`,
              height: "100%",
              background: accent,
              boxShadow: `0 0 9px ${accent}`,
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${12 + ((phase * 80 + index * 23) % 88)}%`,
          width: 42,
          height: "100%",
          opacity: 0.08 + alertStrength * 0.08,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          transform: "skewX(-14deg)",
        }}
      />
    </div>
  );
};

const HeroStage: React.FC<{
  eyebrow: string;
  line1: string;
  line2: string;
  detail: string;
  accent: string;
  opacity: number;
  burst: number;
  line2Size?: number;
}> = ({
  eyebrow,
  line1,
  line2,
  detail,
  accent,
  opacity,
  burst,
  line2Size = 100,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      transform: `translateY(${(1 - opacity) * 18 - burst * 3}px)`,
      filter: `blur(${(1 - opacity) * 4}px)`,
      clipPath: `inset(${(1 - opacity) * 18}% 0 ${(1 - opacity) * 18}% 0)`,
    }}
  >
    <div style={{display: "flex", alignItems: "center", gap: 12}}>
      <div
        style={{
          width: 10,
          height: 10,
          background: accent,
          boxShadow: `0 0 16px ${accent}`,
        }}
      />
      <LedText
        text={eyebrow}
        color={accent}
        fontSize={18}
        fontFamily='"Courier New", monospace'
        fontWeight={700}
        letterSpacing={4.2}
        dot={4}
        glow={6}
      />
    </div>
    <div style={{marginTop: 10}}>
      <LedText
        text={line1}
        color={accent}
        fontSize={74}
        lineHeight={0.95}
        letterSpacing={0}
        dot={6}
        glow={13 + burst * 18}
        style={{transform: "scaleX(0.96)", transformOrigin: "left center"}}
      />
    </div>
    <div style={{marginTop: -2}}>
      <LedText
        text={line2}
        color={accent}
        fontSize={line2Size}
        lineHeight={0.88}
        letterSpacing={-2}
        dot={7}
        glow={17 + burst * 20}
        style={{transform: "scaleX(0.96)", transformOrigin: "left center"}}
      />
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: 690,
        marginTop: 16,
        gap: 14,
      }}
    >
      <div
        style={{
          width: 108,
          height: 3,
          background: accent,
          boxShadow: `0 0 12px ${accent}`,
          transform: `scaleX(${0.78 + burst * 0.22})`,
          transformOrigin: "left",
        }}
      />
      <div
        style={{
          color: accent,
          fontFamily: '"Courier New", monospace',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2.7,
          textShadow: `0 0 7px ${accent}`,
          whiteSpace: "nowrap",
        }}
      >
        {detail}
      </div>
    </div>
  </div>
);

const SandboxChamber: React.FC<{
  frame: number;
  duration: number;
  threat: number;
  trace: number;
  containment: number;
  contained: number;
  reset: number;
  burst: number;
}> = ({
  frame,
  duration,
  threat,
  trace,
  containment,
  contained,
  reset,
  burst,
}) => {
  const uid = React.useId().replace(/:/g, "");
  const coreGlowId = `sandbox-core-glow-${uid}`;
  const octagonId = `sandbox-octagon-${uid}`;
  const phase = (frame / duration) * Math.PI * 2;
  const arrival = easeProgress(frame, 88, 140);
  const fileDissolve = easeProgress(frame, 140, 174);
  const bugAwake =
    easeProgress(frame, 136, 172) * (1 - easeProgress(frame, 820, 880));
  const fileOpacity =
    windowOpacity(frame, 82, 103, 145, 177) * (1 - reset);
  const chamberAccent =
    contained > 0.35
      ? COLORS.cyan
      : threat > 0.12
        ? COLORS.red
        : COLORS.cyan;
  const scanY = -170 + (frame / duration) * 710;
  const gate = easeProgress(frame, 570, 664) * (1 - reset);
  const lock = contained * (1 - reset);
  const dormant = 0.08 + 0.05 * Math.sin(phase * 2);

  return (
    <div
      style={{
        position: "relative",
        width: 430,
        height: 430,
        transform: `translateZ(110px) scale(${1 + burst * 0.015})`,
        transformStyle: "preserve-3d",
      }}
    >
      <svg
        width="430"
        height="430"
        viewBox="0 0 430 430"
        style={{position: "absolute", inset: 0, overflow: "visible"}}
      >
        <defs>
          <radialGradient id={coreGlowId} cx="50%" cy="48%" r="58%">
            <stop
              offset="0%"
              stopColor={threat > 0.15 ? COLORS.red : COLORS.cyan}
              stopOpacity={0.11 + threat * 0.12}
            />
            <stop offset="75%" stopColor={COLORS.cyanDeep} stopOpacity="0.025" />
            <stop offset="100%" stopColor={COLORS.black} stopOpacity="0" />
          </radialGradient>
          <clipPath id={octagonId}>
            <path d="M116 18h198l98 98v198l-98 98H116l-98-98V116Z" />
          </clipPath>
        </defs>
        <path
          d="M116 18h198l98 98v198l-98 98H116l-98-98V116Z"
          fill={`url(#${coreGlowId})`}
          stroke={chamberAccent}
          strokeWidth={2.4 + containment * 1.6}
          strokeDasharray="4 10"
          strokeDashoffset={-frame * 0.75}
          opacity={0.56 + containment * 0.36}
        />
        <path
          d="M131 42h168l89 89v168l-89 89H131l-89-89V131Z"
          fill="rgba(1,11,17,0.46)"
          stroke={COLORS.cyan}
          strokeWidth="1.4"
          strokeOpacity={0.23 + containment * 0.34}
        />
        <g
          clipPath={`url(#${octagonId})`}
          opacity={0.13 + threat * 0.12}
          stroke={COLORS.cyan}
          strokeWidth="1"
        >
          {range(10).map((i) => (
            <React.Fragment key={i}>
              <path d={`M0 ${35 + i * 40}H430`} />
              <path d={`M${35 + i * 40} 0V430`} />
            </React.Fragment>
          ))}
        </g>

        <g
          fill="none"
          stroke={COLORS.red}
          strokeWidth="3"
          strokeDasharray="7 12"
          strokeDashoffset={-frame * 4}
          opacity={trace * (1 - containment) * 0.82}
          style={{filter: `drop-shadow(0 0 7px ${COLORS.red})`}}
        >
          <path d="M215 215C154 194 118 145 78 78" />
          <path d="M215 215C279 181 326 147 365 87" />
          <path d="M215 215C151 250 111 305 70 357" />
          <path d="M215 215C280 248 330 301 371 352" />
        </g>
        <g
          fill={COLORS.redHot}
          opacity={trace * (1 - containment)}
          style={{filter: `drop-shadow(0 0 10px ${COLORS.red})`}}
        >
          {range(12).map((i) => {
            const angle = (i / 12) * Math.PI * 2 + phase * (1 + (i % 3));
            const radius = 72 + ((frame * (1.4 + (i % 4) * 0.3) + i * 31) % 112);
            return (
              <circle
                key={i}
                cx={215 + Math.cos(angle) * radius}
                cy={215 + Math.sin(angle) * radius}
                r={2.5 + (i % 3)}
              />
            );
          })}
        </g>

        {range(3).map((i) => (
          <circle
            key={`cage-${i}`}
            cx="215"
            cy="215"
            r={80 + i * 36}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth={i === 0 ? 4 : 2.2}
            strokeDasharray={i === 1 ? "4 9" : i === 2 ? "18 10" : "7 7"}
            strokeDashoffset={(i % 2 === 0 ? -1 : 1) * frame * (1.2 + i)}
            opacity={containment * (0.78 - i * 0.14)}
            transform={`rotate(${(i % 2 === 0 ? 1 : -1) * frame * 0.22} 215 215) scale(${
              1.32 - containment * 0.32
            })`}
            style={{filter: `drop-shadow(0 0 8px ${COLORS.cyan})`}}
          />
        ))}
      </svg>

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: scanY,
          height: 72,
          opacity: (0.16 + threat * 0.16) * (1 - lock * 0.5),
          background:
            "linear-gradient(180deg, transparent, rgba(54,233,255,0.08), rgba(133,247,255,0.32), rgba(54,233,255,0.08), transparent)",
          mixBlendMode: "screen",
          clipPath: "polygon(15% 0, 85% 0, 100% 50%, 85% 100%, 15% 100%, 0 50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          opacity: fileOpacity,
          transform: `translate(-50%, -50%) translateX(${
            -410 + arrival * 410
          }px) rotate(${(1 - arrival) * -12 + fileDissolve * 3}deg) scale(${
            0.78 + arrival * 0.22 + burst * 0.04
          })`,
        }}
      >
        <FileGlyph accent={COLORS.cyan} intensity={arrival} />
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          opacity: dormant + bugAwake * 0.92,
          transform: `translate(-50%, -50%) scale(${
            0.72 + bugAwake * 0.27 - containment * 0.05
          })`,
          filter: contained > 0.3 ? "saturate(0.86) brightness(0.94)" : "none",
        }}
      >
        <ThreatGlyph
          accent={COLORS.red}
          brightness={0.9 + threat * 0.42 + burst * 0.35}
        />
      </div>

      {[
        {left: 111, top: 76, width: 208, height: 7},
        {left: 111, top: 347, width: 208, height: 7},
        {left: 76, top: 111, width: 7, height: 208},
        {left: 347, top: 111, width: 7, height: 208},
      ].map((bar, i) => (
        <div
          key={`gate-${i}`}
          style={{
            position: "absolute",
            ...bar,
            opacity: gate * 0.9,
            background: COLORS.cyan,
            boxShadow: `0 0 12px ${COLORS.cyan}, 0 0 28px ${COLORS.cyan}`,
            transform:
              i < 2
                ? `scaleX(${gate})`
                : `scaleY(${gate})`,
            transformOrigin: "center",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: "67%",
          top: "67%",
          opacity: lock,
          transform: `translate(-50%, -50%) scale(${0.56 + lock * 0.16})`,
        }}
      >
        <LockGlyph accent={COLORS.cyan} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          top: 43,
          color: chamberAccent,
          fontFamily: '"Courier New", monospace',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2.5,
          textShadow: `0 0 7px ${chamberAccent}`,
        }}
      >
        VM-07 // NO EGRESS
      </div>
      <div
        style={{
          position: "absolute",
          right: 69,
          bottom: 42,
          color: contained > 0.3 ? COLORS.cyan : COLORS.red,
          fontFamily: '"Courier New", monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2.2,
          opacity: 0.48 + threat * 0.45,
        }}
      >
        {contained > 0.3
          ? "FORENSIC SNAPSHOT // SEALED"
          : threat > 0.2
            ? "LIVE DETONATION // ACTIVE"
            : "ISOLATED MEMORY // CLEAN"}
      </div>
    </div>
  );
};

const SandboxContent: React.FC<{
  frame: number;
  duration: number;
  burst: number;
  ghost?: boolean;
}> = ({frame, duration, burst, ghost = false}) => {
  const phase = (frame / duration) * Math.PI * 2;
  const reset = easeProgress(frame, 820, 892);
  const threat =
    easeProgress(frame, 138, 172) * (1 - easeProgress(frame, 696, 742));
  const trace =
    easeProgress(frame, 170, 260) * (1 - easeProgress(frame, 570, 650));
  const containment = easeProgress(frame, 570, 676) * (1 - reset);
  const contained =
    easeProgress(frame, 680, 724) * (1 - easeProgress(frame, 820, 878));
  const cardReveal =
    easeProgress(frame, 165, 235) * (1 - easeProgress(frame, 830, 884));
  const timelineProgress =
    frame < 820 ? frame / 820 : 1 - easeProgress(frame, 820, 899);

  const idleOpacity = clamp(
    1 - easeProgress(frame, 86, 122) + easeProgress(frame, 850, 892),
  );
  const sampleOpacity = windowOpacity(frame, 86, 114, 144, 177);
  const unknownOpacity = windowOpacity(frame, 138, 164, 252, 282);
  const maliciousOpacity = windowOpacity(frame, 256, 286, 424, 458);
  const classifyOpacity = windowOpacity(frame, 430, 460, 565, 596);
  const isolateOpacity = windowOpacity(frame, 570, 600, 676, 708);
  const containedOpacity = windowOpacity(frame, 688, 720, 818, 850);
  const resetOpacity = windowOpacity(frame, 820, 844, 862, 888);

  const behaviorActive =
    easeProgress(frame, 166, 250) * (1 - easeProgress(frame, 640, 716));
  const behaviorContained = contained;

  const values =
    reset > 0.45 || frame < 138
      ? ["MONITORING", "MONITORING", "MONITORING", "MONITORING"]
      : contained > 0.24
        ? ["FROZEN", "SEALED", "ROLLED BACK", "BLOCKED"]
        : containment > 0.08
          ? [
              containment > 0.35 ? "PROCESS FROZEN" : "FREEZING",
              containment > 0.5 ? "FILE SEALED" : "HASHING",
              containment > 0.68 ? "ROLLED BACK" : "REVERSING",
              containment > 0.78 ? "EGRESS BLOCKED" : "CUTTING LINK",
            ]
          : ["12 SPAWNED", "07 MUTATIONS", "AUTORUN WRITE", "C2 BEACON"];

  return (
    <div
      style={{
        width: 1400,
        height: 650,
        position: "relative",
        boxSizing: "border-box",
        color: COLORS.white,
        background: ghost
          ? "transparent"
          : "linear-gradient(103deg, rgba(1,8,13,0.48), rgba(2,14,21,0.92) 28%, rgba(2,12,19,0.88) 78%, rgba(1,7,12,0.40))",
        borderTop: ghost ? "none" : `1px solid ${COLORS.cyan}2b`,
        borderBottom: ghost ? "none" : `1px solid ${COLORS.cyan}24`,
        boxShadow: ghost
          ? "none"
          : `inset 0 0 90px rgba(0,0,0,0.42), 0 0 ${
              20 + burst * 36
            }px ${threat > 0.1 ? COLORS.red : COLORS.cyan}16`,
        transform: `translateZ(90px) scale(${1 + burst * 0.011})`,
        transformStyle: "preserve-3d",
      }}
    >
      {!ghost && (
        <>
          <div
            style={{
              position: "absolute",
              left: 42,
              right: 42,
              top: 28,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: COLORS.cyan,
                boxShadow: `0 0 14px ${COLORS.cyan}`,
              }}
            />
            <div
              style={{
                color: COLORS.cyan,
                fontFamily: '"Courier New", monospace',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 4,
                textShadow: `0 0 7px ${COLORS.cyan}`,
              }}
            >
              AI MALWARE // BEHAVIORAL SANDBOX
            </div>
            <div
              style={{
                flex: 1,
                height: 2,
                background: `linear-gradient(90deg, ${COLORS.cyan}82, transparent)`,
              }}
            />
            <div
              style={{
                color:
                  threat > 0.15 && containment < 0.15
                    ? COLORS.red
                    : COLORS.cyan,
                fontFamily: '"Courier New", monospace',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2.7,
                textShadow: `0 0 7px ${
                  threat > 0.15 && containment < 0.15
                    ? COLORS.red
                    : COLORS.cyan
                }`,
              }}
            >
              {resetOpacity > 0.08
                ? "STATUS // RESETTING"
                : contained > 0.25
                ? "STATUS // CONTAINED"
                : containment > 0.15
                  ? "STATUS // ISOLATING"
                : threat > 0.2
                  ? "RISK // CRITICAL"
                  : sampleOpacity > 0.15
                    ? "STATUS // DETONATING"
                  : "STATUS // READY"}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 42,
              right: 42,
              top: 62,
              height: 3,
              background: "rgba(37,224,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${clamp(timelineProgress) * 100}%`,
                height: "100%",
                background:
                  contained > 0.2 || containment > 0.15
                    ? COLORS.cyan
                    : threat > 0.15
                      ? COLORS.red
                      : COLORS.cyanSoft,
                boxShadow: `0 0 10px ${
                  contained > 0.2 || containment > 0.15
                    ? COLORS.cyan
                    : threat > 0.15
                      ? COLORS.red
                      : COLORS.cyanSoft
                }`,
              }}
            />
          </div>
        </>
      )}

      <div style={{position: "absolute", left: 54, top: 105}}>
        <SandboxChamber
          frame={frame}
          duration={duration}
          threat={threat}
          trace={trace}
          containment={containment}
          contained={contained}
          reset={reset}
          burst={burst}
        />
      </div>

      <svg
        width="1400"
        height="650"
        viewBox="0 0 1400 650"
        style={{
          position: "absolute",
          inset: 0,
          opacity: ghost ? 0 : cardReveal * 0.58,
          pointerEvents: "none",
        }}
      >
        <g
          fill="none"
          stroke={contained > 0.25 ? COLORS.cyan : COLORS.red}
          strokeWidth="2"
          strokeDasharray="5 9"
          strokeDashoffset={-frame * 2.2}
          style={{
            filter: `drop-shadow(0 0 6px ${
              contained > 0.25 ? COLORS.cyan : COLORS.red
            })`,
          }}
        >
          <path d="M455 320H535V441H618" />
          <path d="M455 320H550V441H958" />
          <path d="M455 320H535V544H618" />
          <path d="M455 320H550V544H958" />
        </g>
        {[441, 544].flatMap((y, row) =>
          [618, 958].map((x, col) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={4 + Math.sin(phase * 3 + row + col) * 1.5}
              fill={contained > 0.25 ? COLORS.cyan : COLORS.red}
            />
          )),
        )}
      </svg>

      <div
        style={{
          position: "absolute",
          left: 592,
          top: 92,
          width: 750,
          height: 292,
        }}
      >
        <HeroStage
          eyebrow="ISOLATED VM // WAITING SAMPLE"
          line1="SANDBOX"
          line2="READY"
          detail="AI MONITORING // ZERO HOST ACCESS"
          accent={COLORS.cyan}
          opacity={idleOpacity}
          burst={burst}
        />
        <HeroStage
          eyebrow="SUSPICIOUS SAMPLE // SHA256 09A7"
          line1="SAMPLE"
          line2="EXECUTING"
          detail="DETONATION STARTED // TELEMETRY ARMED"
          accent={COLORS.cyan}
          opacity={sampleOpacity}
          burst={burst}
          line2Size={86}
        />
        <HeroStage
          eyebrow="HEURISTIC ALERT // UNKNOWN BEHAVIOR"
          line1="BEHAVIOR"
          line2="TRACE ACTIVE"
          detail="PROCESS + FILE + REGISTRY + NETWORK"
          accent={COLORS.red}
          opacity={unknownOpacity}
          burst={burst}
          line2Size={76}
        />
        <HeroStage
          eyebrow="MALICIOUS PATTERN // CONFIDENCE 98.7%"
          line1="MALWARE"
          line2="CONFIRMED"
          detail="RISK CRITICAL // MULTI-STAGE PAYLOAD"
          accent={COLORS.red}
          opacity={maliciousOpacity}
          burst={burst}
          line2Size={92}
        />
        <HeroStage
          eyebrow="AI CLASSIFICATION // BEHAVIOR MATCH"
          line1="THREAT"
          line2="CLASSIFIED"
          detail="FORENSIC GRAPH // SIGNATURE 0x09A7"
          accent={COLORS.red}
          opacity={classifyOpacity}
          burst={burst}
          line2Size={90}
        />
        <HeroStage
          eyebrow="AUTONOMOUS RESPONSE // POLICY SBX-04"
          line1="CONTAINMENT"
          line2="SEQUENCE"
          detail="PROCESS FROZEN // EGRESS BLOCKED"
          accent={COLORS.cyan}
          opacity={isolateOpacity}
          burst={burst}
          line2Size={92}
        />
        <HeroStage
          eyebrow="THREAT STATE // FULLY ISOLATED"
          line1="MALWARE"
          line2="CONTAINED"
          detail="NO HOST IMPACT // SNAPSHOT SEALED"
          accent={COLORS.cyan}
          opacity={containedOpacity}
          burst={burst}
          line2Size={94}
        />
        <HeroStage
          eyebrow="SANDBOX CONTROL // SECURE RESET"
          line1="RESETTING"
          line2="VM-07"
          detail="MEMORY SCRUB // BASELINE RESTORE"
          accent={COLORS.cyan}
          opacity={resetOpacity}
          burst={burst}
        />
      </div>

      {!ghost && (
        <div
          style={{
            position: "absolute",
            left: 618,
            top: 399,
            width: 648,
            display: "grid",
            gridTemplateColumns: "repeat(2, 308px)",
            gap: "18px 22px",
          }}
        >
          {(
            [
              ["PROCESS TREE", values[0], "process"],
              ["FILE SYSTEM", values[1], "file"],
              ["REGISTRY", values[2], "registry"],
              ["NETWORK C2", values[3], "network"],
            ] as Array<[string, string, BehaviorKind]>
          ).map(([label, value, kind], index) => (
            <BehaviorCard
              key={kind}
              label={label}
              value={value}
              kind={kind}
              reveal={clamp(cardReveal - index * 0.06)}
              active={behaviorActive}
              contained={behaviorContained}
              phase={phase}
              index={index}
            />
          ))}
        </div>
      )}

      {!ghost && (
        <div
          style={{
            position: "absolute",
            left: 42,
            right: 42,
            bottom: 22,
            display: "flex",
            alignItems: "center",
            gap: 13,
            color: COLORS.cyan,
            fontFamily: '"Courier New", monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2.3,
            opacity: 0.48,
          }}
        >
          <span>ENVIRONMENT: ISOLATED</span>
          <span style={{color: COLORS.cyanDeep}}>//</span>
          <span>NETWORK: SINKHOLE</span>
          <span style={{color: COLORS.cyanDeep}}>//</span>
          <span>SNAPSHOT: IMMUTABLE</span>
          <div style={{flex: 1}} />
          <span style={{color: threat > 0.15 ? COLORS.red : COLORS.cyan}}>
            SAMPLE_09A7.EXE
          </span>
        </div>
      )}
    </div>
  );
};

const TelemetryWall: React.FC<{
  frame: number;
  duration: number;
  burst: number;
}> = ({frame, duration, burst}) => {
  const phase = (frame / duration) * Math.PI * 2;
  const quantized = Math.round(Math.sin(frame * 1.83) * 5) / 5;

  return (
    <>
      {ROWS.map((row) => {
        const driftX =
          Math.sin(phase * row.cycles + row.phase) * (34 + row.depth * 0.1);
        const driftY = Math.cos(phase * 2 + row.phase) * 7;
        const sliceKick =
          burst *
          quantized *
          (row.id % 2 === 0 ? 1 : -1) *
          (32 + hash(row.id + 2000) * 118);
        const pulseScale =
          1 + burst * (0.02 + hash(row.id + 2100) * 0.11);
        const flicker =
          0.88 +
          Math.sin(phase * (2 + (row.id % 4)) + row.phase) * 0.08 +
          burst * hash(row.id + 2200) * 0.25;

        return (
          <div
            key={row.id}
            style={{
              position: "absolute",
              left: row.x,
              top: row.y,
              height: row.fontSize * 1.12,
              opacity: clamp(row.opacity * flicker),
              transform: `translate3d(${driftX + sliceKick}px, ${driftY}px, ${
                row.depth
              }px) scaleX(${pulseScale})`,
              transformOrigin: "center",
              filter: `blur(${row.blur + burst * (row.id % 4) * 0.34}px)`,
              mixBlendMode: "screen",
              willChange: "transform",
            }}
          >
            <LedText
              text={row.text}
              color={
                row.id % 7 === 0 ? "#61f0ff" : row.id % 5 === 0 ? "#20bfe8" : COLORS.cyan
              }
              fontSize={row.fontSize}
              fontFamily='"Courier New", "Lucida Console", monospace'
              fontWeight={700}
              letterSpacing={row.tracking}
              dot={row.fontSize > 95 ? 8 : 6}
              glow={row.fontSize > 90 ? 13 : 8}
            />
          </div>
        );
      })}
    </>
  );
};

const DataFragments: React.FC<{
  frame: number;
  duration: number;
  burst: number;
}> = ({frame, duration, burst}) => {
  const phase = (frame / duration) * Math.PI * 2;
  return (
    <>
      {HUD_BITS.map((bit) => {
        const twinkle =
          0.52 + 0.48 * Math.sin(phase * (2 + (bit.id % 3)) + bit.phase);
        const dx =
          Math.sin(phase * (1 + (bit.id % 2)) + bit.phase) * 18 +
          burst * Math.sin(frame * 1.4 + bit.id) * 84;
        return (
          <div
            key={bit.id}
            style={{
              position: "absolute",
              left: bit.x,
              top: bit.y,
              width: bit.width,
              height: bit.height,
              background: bit.warm ? COLORS.red : COLORS.cyan,
              opacity: bit.opacity * twinkle * (1 + burst),
              boxShadow: `0 0 9px ${
                bit.warm ? COLORS.red : COLORS.cyan
              }`,
              transform: `translate3d(${dx}px, ${
                Math.cos(phase * 2 + bit.phase) * 9
              }px, ${-70 + hash(bit.id + 2300) * 80}px) scaleX(${
                1 + burst * 4
              })`,
            }}
          />
        );
      })}
    </>
  );
};

const GlitchStreaks: React.FC<{
  frame: number;
  burst: number;
}> = ({frame, burst}) => {
  if (burst <= 0.001) {
    return null;
  }

  const snap = Math.round(Math.sin(frame * 1.91) * 4) / 4;

  return (
    <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>
      {GLITCH_LINES.map((line) => {
        const color = line.id % 4 === 0 ? COLORS.red : COLORS.cyan;
        return (
          <div
            key={line.id}
            style={{
              position: "absolute",
              top: line.y,
              left: `${line.left}%`,
              width: `${line.width}%`,
              height: line.height,
              background: `linear-gradient(90deg, transparent, ${color}, ${COLORS.white}, transparent)`,
              opacity: burst * (0.18 + hash(line.id + 2500) * 0.58),
              filter: `blur(${line.id % 3 === 0 ? 2 : 0.5}px)`,
              transform: `translateX(${
                line.direction * snap * burst * (75 + line.id * 8)
              }px) scaleX(${1 + burst * 2.4})`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}

      {range(6).map((i) => (
        <div
          key={`tear-${i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${14 + i * 15 + hash(i + 2600) * 7}%`,
            height: 2 + (i % 3) * 3,
            background:
              i % 2 === 0
                ? "rgba(42,234,255,0.55)"
                : "rgba(255,23,79,0.45)",
            opacity: burst * (0.3 + (i % 3) * 0.17),
            transform: `translateX(${
              Math.sin(frame * 2.7 + i) * burst * 190
            }px)`,
            boxShadow: `0 0 10px ${
              i % 2 === 0 ? COLORS.cyan : COLORS.red
            }`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const BoardFinish: React.FC<{
  frame: number;
  duration: number;
  burst: number;
}> = ({frame, duration, burst}) => {
  const scanY = interpolate(frame, [0, duration], [-180, 1540], {
    easing: Easing.linear,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle, rgba(87,241,255,0.22) 0 1.15px, transparent 1.5px)",
          backgroundSize: "7px 7px",
          mixBlendMode: "screen",
          opacity: 0.16 + burst * 0.08,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 5px)",
          opacity: 0.67,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY,
          height: 104,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, transparent, rgba(73,237,255,0.025), rgba(159,250,255,0.10), rgba(73,237,255,0.025), transparent)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 49%, transparent 0%, rgba(0,5,10,0.02) 42%, rgba(0,4,8,0.32) 73%, rgba(0,2,5,0.78) 100%)",
        }}
      />
    </>
  );
};

const MicroInterface: React.FC<{
  phase: number;
  burst: number;
}> = ({phase, burst}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 244,
        top: 224,
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: 0.48 + Math.sin(phase * 2) * 0.08,
        transform: "translateZ(42px)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 2,
          background: COLORS.cyan,
          boxShadow: `0 0 10px ${COLORS.cyan}`,
        }}
      />
      <LedText
        text="AI SANDBOX // BEHAVIOR SENSOR ARRAY 07"
        color={COLORS.cyan}
        fontSize={16}
        fontFamily='"Courier New", monospace'
        fontWeight={700}
        letterSpacing={3.4}
        dot={4}
        glow={5}
      />
    </div>

    <div
      style={{
        position: "absolute",
        right: 250,
        bottom: 208,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        opacity: 0.4 + burst * 0.35,
        transform: "translateZ(45px)",
      }}
    >
      <LedText
        text="ISOLATED EGRESS // SINKHOLE"
        color={COLORS.red}
        fontSize={17}
        fontFamily='"Courier New", monospace'
        fontWeight={700}
        letterSpacing={3.2}
        dot={4}
        glow={5}
      />
      <div
        style={{
          width: 255,
          height: 3,
          marginTop: 9,
          background: `linear-gradient(90deg, transparent, ${COLORS.red})`,
          boxShadow: `0 0 10px ${COLORS.red}`,
          transform: `scaleX(${0.74 + 0.18 * Math.sin(phase * 3) + burst * 0.08})`,
          transformOrigin: "right",
        }}
      />
    </div>
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const phase = (frame / durationInFrames) * Math.PI * 2;

  const firstBurst = pulse(frame, 154, 23);
  const secondBurst = pulse(frame, 412, 28);
  const thirdBurst = pulse(frame, 674, 30);
  const burst = Math.max(firstBurst, secondBurst, thirdBurst);
  const burstIndex =
    secondBurst >= firstBurst && secondBurst >= thirdBurst
      ? 1
      : thirdBurst >= firstBurst && thirdBurst >= secondBurst
        ? 2
        : 0;
  const burstDirection = burstIndex === 1 ? -1 : 1;
  const stepped = Math.round(Math.sin(frame * 1.72) * 5) / 5;

  const driftX = Math.sin(phase) * 18 + Math.sin(phase * 3) * 6;
  const driftY = Math.cos(phase * 2) * 9;
  const rotateX = 3.4 + Math.sin(phase * 2) * 0.42;
  const rotateY = -2.1 + Math.cos(phase) * 0.58;
  const rotateZ = -0.46 + Math.sin(phase) * 0.31;
  const impactX = burstDirection * stepped * burst * 48;
  const impactY = Math.cos(frame * 1.17) * burst * 10;
  const scale = 1.035 + Math.sin(phase) * 0.006 + burst * 0.042;
  const ambientFlicker =
    0.965 +
    0.018 * Math.sin(phase * 7 + 0.7) +
    0.012 * Math.sin(phase * 13);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.black,
        overflow: "hidden",
        color: COLORS.white,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 48%, #063348 0%, #031822 31%, #01080d 70%, #000204 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 2200,
          height: 1360,
          transform: `translate(-50%, -50%) translate3d(${
            driftX + impactX
          }px, ${driftY + impactY}px, 0) perspective(1550px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
          transformOrigin: "center",
          transformStyle: "preserve-3d",
          willChange: "transform",
          filter: `brightness(${ambientFlicker + burst * 0.22}) contrast(${
            1.04 + burst * 0.1
          }) saturate(${1.08 + burst * 0.1})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            transformStyle: "preserve-3d",
            background:
              "radial-gradient(ellipse at 52% 48%, rgba(4,31,42,0.97), rgba(2,17,25,0.98) 42%, rgba(0,5,9,1) 88%)",
            boxShadow:
              "inset 0 0 190px rgba(0,0,0,0.95), inset 0 0 40px rgba(34,221,255,0.08)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(37,224,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,224,255,0.02) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              opacity: 0.36,
              transform: "translateZ(-110px)",
            }}
          />

          <DataFragments
            frame={frame}
            duration={durationInFrames}
            burst={burst}
          />
          <TelemetryWall
            frame={frame}
            duration={durationInFrames}
            burst={burst}
          />
          <MicroInterface phase={phase} burst={burst} />

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate3d(0, ${
                Math.sin(phase * 2) * 4
              }px, 90px)`,
              transformStyle: "preserve-3d",
            }}
          >
            {burst > 0.001 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: burst * 0.24,
                    transform: `translateX(${-burstDirection * 24 * stepped}px)`,
                    clipPath: "inset(0 0 67% 0)",
                    filter: "hue-rotate(146deg) saturate(1.7)",
                    mixBlendMode: "screen",
                  }}
                >
                  <SandboxContent
                    frame={frame}
                    duration={durationInFrames}
                    burst={burst}
                    ghost
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: burst * 0.3,
                    transform: `translateX(${burstDirection * 38 * stepped}px)`,
                    clipPath: "inset(34% 0 39% 0)",
                    mixBlendMode: "screen",
                  }}
                >
                  <SandboxContent
                    frame={frame}
                    duration={durationInFrames}
                    burst={burst}
                    ghost
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: burst * 0.22,
                    transform: `translateX(${-burstDirection * 52 * stepped}px)`,
                    clipPath: "inset(69% 0 0 0)",
                    filter: "hue-rotate(155deg)",
                    mixBlendMode: "screen",
                  }}
                >
                  <SandboxContent
                    frame={frame}
                    duration={durationInFrames}
                    burst={burst}
                    ghost
                  />
                </div>
              </>
            )}

            <SandboxContent
              frame={frame}
              duration={durationInFrames}
              burst={burst}
            />
          </div>

          <BoardFinish
            frame={frame}
            duration={durationInFrames}
            burst={burst}
          />
        </div>
      </div>

      <GlitchStreaks frame={frame} burst={burst} />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: burst * 0.16,
          background:
            burstIndex === 1
              ? "linear-gradient(90deg, rgba(54,233,255,0.42), transparent 25%, transparent 72%, rgba(255,23,79,0.35))"
              : "linear-gradient(90deg, rgba(255,23,79,0.32), transparent 28%, transparent 76%, rgba(54,233,255,0.38))",
          mixBlendMode: "screen",
        }}
      />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 0%, transparent 44%, rgba(0,2,5,0.24) 68%, rgba(0,1,3,0.88) 100%)",
          boxShadow:
            "inset 0 0 130px rgba(0,0,0,0.72), inset 0 0 24px rgba(0,0,0,0.92)",
        }}
      />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.2,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};
