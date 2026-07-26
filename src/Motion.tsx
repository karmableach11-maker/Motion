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
    text: makeCodeLine(110 + i * 19, 27),
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

const StatusRail: React.FC<{
  accent: string;
  burst: number;
}> = ({accent, burst}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginTop: 17,
      width: 708,
    }}
  >
    <div
      style={{
        height: 3,
        width: 134,
        background: accent,
        boxShadow: `0 0 12px ${accent}`,
        transform: `scaleX(${0.76 + burst * 0.24})`,
        transformOrigin: "left center",
      }}
    />
    <LedText
      text="SIGNATURE 0x09A7"
      color={accent}
      fontSize={19}
      fontFamily='"Courier New", monospace'
      fontWeight={700}
      letterSpacing={3.6}
      dot={4}
      glow={5}
    />
    <div style={{flex: 1}} />
    <LedText
      text="NODE 04 // ACTIVE"
      color={COLORS.cyan}
      fontSize={18}
      fontFamily='"Courier New", monospace'
      fontWeight={700}
      letterSpacing={3.2}
      dot={4}
      glow={5}
    />
  </div>
);

const AlertContent: React.FC<{
  accent: string;
  burst: number;
  ghost?: boolean;
}> = ({accent, burst, ghost = false}) => {
  const brightness = 0.95 + burst * 0.85;

  return (
    <div
      style={{
        width: 1060,
        height: 410,
        display: "flex",
        alignItems: "center",
        padding: "28px 34px 26px 36px",
        boxSizing: "border-box",
        color: accent,
        background: ghost
          ? "transparent"
          : "linear-gradient(90deg, rgba(2,7,12,0.38), rgba(3,9,15,0.76) 24%, rgba(3,9,15,0.72) 78%, rgba(2,7,12,0.16))",
        borderTop: ghost ? "none" : `1px solid ${accent}26`,
        borderBottom: ghost ? "none" : `1px solid ${accent}1f`,
        boxShadow: ghost
          ? "none"
          : `inset 0 0 70px rgba(0,0,0,0.36), 0 0 ${
              18 + burst * 34
            }px ${accent}19`,
        transform: `translateZ(90px) scale(${1 + burst * 0.012})`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          width: 282,
          flex: "0 0 282px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${-burst * 5}px)`,
        }}
      >
        <ThreatGlyph accent={accent} brightness={brightness} />
      </div>

      <div
        style={{
          paddingLeft: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateX(${burst * 5}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              background: accent,
              boxShadow: `0 0 15px ${accent}`,
            }}
          />
          <LedText
            text="CRITICAL THREAT // ACTIVE"
            color={accent}
            fontSize={21}
            fontFamily='"Courier New", monospace'
            fontWeight={700}
            letterSpacing={5}
            dot={4}
            glow={6}
          />
        </div>

        <LedText
          text="ZERO-DAY"
          color={accent}
          fontSize={108}
          letterSpacing={-2}
          lineHeight={0.9}
          dot={7}
          glow={16 + burst * 18}
          style={{transform: "scaleX(0.93)", transformOrigin: "left center"}}
        />
        <LedText
          text="BREACH"
          color={accent}
          fontSize={146}
          letterSpacing={-4}
          lineHeight={0.78}
          dot={7}
          glow={19 + burst * 20}
          style={{
            marginTop: 2,
            transform: "scaleX(1.02)",
            transformOrigin: "left center",
          }}
        />

        <StatusRail accent={accent} burst={burst} />
      </div>
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
        text="SECURITY OPERATIONS // SENSOR ARRAY 04"
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
        text="PACKET ANOMALY"
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

  const firstBurst = pulse(frame, 168, 25);
  const secondBurst = pulse(frame, 446, 31);
  const thirdBurst = pulse(frame, 712, 27);
  const burst = Math.max(firstBurst, secondBurst, thirdBurst);
  const burstIndex =
    secondBurst >= firstBurst && secondBurst >= thirdBurst
      ? 1
      : thirdBurst >= firstBurst && thirdBurst >= secondBurst
        ? 2
        : 0;
  const burstDirection = burstIndex === 1 ? -1 : 1;
  const stepped = Math.round(Math.sin(frame * 1.72) * 5) / 5;

  const driftX = Math.sin(phase) * 28 + Math.sin(phase * 3) * 8;
  const driftY = Math.cos(phase * 2) * 13;
  const rotateX = 4.2 + Math.sin(phase * 2) * 0.55;
  const rotateY = -2.8 + Math.cos(phase) * 0.75;
  const rotateZ = -0.72 + Math.sin(phase) * 0.42;
  const impactX = burstDirection * stepped * burst * 62;
  const impactY = Math.cos(frame * 1.17) * burst * 13;
  const scale = 1.035 + Math.sin(phase) * 0.008 + burst * 0.058;
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
              <AlertContent accent={COLORS.cyan} burst={burst} ghost />
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
              <AlertContent accent={COLORS.redHot} burst={burst} ghost />
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
              <AlertContent accent={COLORS.cyan} burst={burst} ghost />
            </div>

            <AlertContent accent={COLORS.red} burst={burst} />
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
