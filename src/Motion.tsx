import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const TAU = Math.PI * 2;

const COLORS = {
  desktopDeep: "#041c38",
  desktop: "#073c61",
  desktopTeal: "#086d78",
  cyan: "#4bf4e5",
  cyanSoft: "#c1fff8",
  blue: "#5369ff",
  blueDeep: "#151d72",
  violet: "#7b68ee",
  amber: "#ffc95f",
  coral: "#ff777e",
  mint: "#67f4b5",
  mintSoft: "#d0ffea",
  panel: "#dce7df",
  panelLight: "#f5f8ef",
  panelMid: "#bdcbc3",
  panelDark: "#6e8581",
  ink: "#102128",
  inkSoft: "#4b6265",
  black: "#071119",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const modulo = (value: number, length = 1) =>
  ((value % length) + length) % length;

const segment = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 91.177 + 17.731) * 43758.5453;
  return value - Math.floor(value);
};

const getInstallProgress = (frame: number) => {
  if (frame < 54) return 0;
  if (frame < 210) {
    return mix(0, 0.18, segment(frame, 54, 210, Easing.inOut(Easing.cubic)));
  }
  if (frame < 400) {
    return mix(
      0.18,
      0.46,
      segment(frame, 210, 400, Easing.inOut(Easing.cubic)),
    );
  }
  if (frame < 640) {
    return mix(
      0.46,
      0.78,
      segment(frame, 400, 640, Easing.inOut(Easing.cubic)),
    );
  }
  if (frame < 760) {
    return mix(
      0.78,
      0.99,
      segment(frame, 640, 760, Easing.inOut(Easing.cubic)),
    );
  }
  return 1;
};

const PHASES = [
  { label: "READ MEDIA", start: 0, end: 210, threshold: 0.18 },
  { label: "UNPACK", start: 210, end: 400, threshold: 0.46 },
  { label: "MODULES", start: 400, end: 640, threshold: 0.78 },
  { label: "VERIFY", start: 640, end: 760, threshold: 1 },
  { label: "READY", start: 760, end: 900, threshold: 1 },
] as const;

const MODULES = [
  { name: "APPLICATION CORE", size: "18.4 MB", threshold: 0.22 },
  { name: "USER INTERFACE", size: "12.8 MB", threshold: 0.38 },
  { name: "MEDIA CODECS", size: "08.6 MB", threshold: 0.54 },
  { name: "SYSTEM DRIVERS", size: "14.2 MB", threshold: 0.69 },
  { name: "HELP DATABASE", size: "04.1 MB", threshold: 0.79 },
] as const;

const PARTICLES = Array.from({ length: 62 }, (_, index) => ({
  x: hash01(index * 7 + 3) * WIDTH,
  y: hash01(index * 13 + 9) * HEIGHT,
  size: 2 + Math.floor(hash01(index * 17 + 2) * 5),
  phase: hash01(index * 19 + 5),
  speed: 7 + hash01(index * 23 + 1) * 18,
  opacity: 0.05 + hash01(index * 29 + 7) * 0.18,
}));

const PixelText: React.FC<{
  readonly children: React.ReactNode;
  readonly color?: string;
  readonly size?: number;
  readonly spacing?: number;
  readonly align?: "left" | "center" | "right";
  readonly style?: React.CSSProperties;
}> = ({
  children,
  color = COLORS.ink,
  size = 20,
  spacing = 2,
  align = "left",
  style,
}) => (
  <div
    style={{
      color,
      fontFamily: "'Courier New', monospace",
      fontSize: size,
      fontWeight: 800,
      letterSpacing: spacing,
      lineHeight: 1.1,
      textAlign: align,
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}
  >
    {children}
  </div>
);

const AmbientDesktop: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const gridX = modulo(time * 12, 72);
  const gridY = modulo(time * 5.5, 72);
  const sweepY = modulo(time * 135, HEIGHT + 280) - 140;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.23);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 51% 46%, #0d8190 0%, #075a76 38%, #053856 70%, #031a35 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.25,
          backgroundImage:
            "linear-gradient(rgba(139,255,247,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(139,255,247,.18) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage:
            "radial-gradient(circle at 50% 50%, #000 0%, rgba(0,0,0,.78) 50%, transparent 88%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1250,
          height: 1250,
          transform: `translate(-50%, -50%) rotate(${time * 1.4}deg)`,
          borderRadius: "50%",
          border: "1px solid rgba(187,255,249,.12)",
          boxShadow:
            "0 0 0 96px rgba(93,255,242,.025), 0 0 0 190px rgba(93,255,242,.018)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1520,
          height: 500,
          transform: `translate(-50%, -50%) rotate(${-9 + Math.sin(time * 0.22) * 1.3}deg)`,
          background:
            "linear-gradient(90deg, transparent, rgba(87,255,240,.09), transparent)",
          filter: "blur(42px)",
        }}
      />

      {PARTICLES.map((particle, index) => {
        const y =
          modulo(
            particle.y + time * particle.speed + particle.phase * HEIGHT * 0.55,
            HEIGHT + 90,
          ) - 45;
        const flicker =
          0.3 +
          0.7 *
            Math.sin(
              (time * (0.17 + (index % 5) * 0.027) + particle.phase) * TAU,
            ) **
              2;
        return (
          <div
            key={`ambient-particle-${index}`}
            style={{
              position: "absolute",
              left: particle.x,
              top: y,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity * flicker,
              background:
                index % 8 === 0 ? COLORS.cyanSoft : "rgba(87,255,240,.92)",
              boxShadow:
                index % 8 === 0 ? "0 0 14px rgba(104,255,241,.88)" : undefined,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: -220,
          top: sweepY,
          width: 2380,
          height: 150,
          transform: "rotate(-4deg)",
          opacity: 0.15,
          background:
            "linear-gradient(180deg, transparent, rgba(174,255,248,.68), transparent)",
          filter: "blur(24px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 72,
          top: 64,
          width: 126,
          height: 126,
          opacity: 0.24 + pulse * 0.12,
          borderLeft: `3px solid ${COLORS.cyan}`,
          borderTop: `3px solid ${COLORS.cyan}`,
          boxShadow: "-8px -8px 28px rgba(75,244,229,.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 72,
          bottom: 64,
          width: 126,
          height: 126,
          opacity: 0.2 + (1 - pulse) * 0.12,
          borderRight: `3px solid ${COLORS.cyan}`,
          borderBottom: `3px solid ${COLORS.cyan}`,
          boxShadow: "8px 8px 28px rgba(75,244,229,.08)",
        }}
      />

      <PixelText
        color="rgba(207,255,251,.55)"
        size={14}
        spacing={2.8}
        style={{ position: "absolute", left: 82, bottom: 70 }}
      >
        SETUP ENVIRONMENT // CHANNEL 08
      </PixelText>
      <PixelText
        color="rgba(207,255,251,.5)"
        size={14}
        spacing={2.2}
        align="right"
        style={{ position: "absolute", right: 82, top: 67, lineHeight: 1.65 }}
      >
        SIGNAL {String(Math.round(92 + pulse * 7)).padStart(2, "0")}%
        <br />
        FRAME {String(frame).padStart(4, "0")}
      </PixelText>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(1,24,40,.22) 74%, rgba(1,13,29,.66) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const BevelPanel: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly dark?: boolean;
}> = ({ children, style, dark = false }) => (
  <div
    style={{
      position: "relative",
      overflow: "hidden",
      boxSizing: "border-box",
      background: dark
        ? "linear-gradient(145deg, #14203f, #07142d)"
        : `linear-gradient(145deg, ${COLORS.panelLight}, ${COLORS.panel} 48%, ${COLORS.panelMid})`,
      border: dark
        ? "2px solid rgba(111,137,255,.55)"
        : `3px solid ${COLORS.panelDark}`,
      boxShadow: dark
        ? "inset 2px 2px rgba(198,212,255,.14), inset -3px -3px rgba(0,7,28,.62)"
        : "inset 3px 3px rgba(255,255,255,.9), inset -3px -3px rgba(60,82,78,.28)",
      ...style,
    }}
  >
    {children}
  </div>
);

const CheckGlyph: React.FC<{
  readonly size?: number;
  readonly color?: string;
  readonly stroke?: number;
}> = ({ size = 20, color = COLORS.mint, stroke = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M5 12.5L9.2 16.6L19 7"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

const WindowButton: React.FC<{
  readonly children: React.ReactNode;
  readonly danger?: boolean;
}> = ({ children, danger = false }) => (
  <div
    style={{
      width: 30,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: COLORS.panelLight,
      background: danger
        ? "linear-gradient(180deg, #ff8c91, #bd3549)"
        : "rgba(231,241,237,.12)",
      border: "1px solid rgba(245,255,252,.42)",
      boxShadow: "inset 1px 1px rgba(255,255,255,.25)",
      fontFamily: "Arial, sans-serif",
      fontSize: 16,
      fontWeight: 900,
      lineHeight: 1,
    }}
  >
    {children}
  </div>
);

const RetroButton: React.FC<{
  readonly children: React.ReactNode;
  readonly primary?: boolean;
  readonly disabled?: boolean;
}> = ({ children, primary = false, disabled = false }) => (
  <div
    style={{
      minWidth: 132,
      height: 46,
      padding: "0 19px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: disabled
        ? "rgba(55,75,76,.4)"
        : primary
          ? COLORS.panelLight
          : COLORS.ink,
      background: disabled
        ? "linear-gradient(180deg, rgba(224,231,224,.62), rgba(188,201,192,.62))"
        : primary
          ? `linear-gradient(180deg, ${COLORS.blue}, ${COLORS.blueDeep})`
          : `linear-gradient(180deg, ${COLORS.panelLight}, ${COLORS.panelMid})`,
      border: `2px solid ${
        disabled
          ? "rgba(108,128,123,.3)"
          : primary
            ? "#10165e"
            : COLORS.panelDark
      }`,
      boxShadow: disabled
        ? "inset 2px 2px rgba(255,255,255,.25)"
        : primary
          ? "inset 2px 2px rgba(255,255,255,.28), inset -3px -3px rgba(3,7,51,.46), 4px 4px 0 rgba(26,40,58,.18)"
          : "inset 3px 3px rgba(255,255,255,.92), inset -3px -3px rgba(69,88,84,.28), 4px 4px 0 rgba(42,67,65,.16)",
      fontFamily: "'Courier New', monospace",
      fontSize: 14,
      fontWeight: 900,
      letterSpacing: 1.5,
    }}
  >
    {children}
  </div>
);

const PackageGlyph: React.FC<{
  readonly time: number;
  readonly progress: number;
  readonly complete: boolean;
}> = ({ time, progress, complete }) => {
  const accent = complete ? COLORS.mint : COLORS.cyan;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 1.1);
  const orbit = time * 34;

  return (
    <div
      style={{
        position: "relative",
        width: 204,
        height: 194,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 21,
          top: 18,
          width: 162,
          height: 162,
          transform: `rotate(${orbit * 0.12}deg)`,
          borderRadius: "50%",
          border: `2px dashed ${accent}`,
          opacity: 0.24 + pulse * 0.18,
          boxShadow: `0 0 24px ${complete ? "rgba(103,244,181,.2)" : "rgba(75,244,229,.2)"}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 40,
          width: 116,
          height: 116,
          transform: `rotate(${-orbit * 0.18}deg)`,
          border: "1px solid rgba(153,172,255,.38)",
        }}
      />

      <svg
        width="136"
        height="136"
        viewBox="0 0 136 136"
        style={{
          position: "absolute",
          left: 34,
          top: 31,
          filter: `drop-shadow(0 0 16px ${complete ? "rgba(103,244,181,.44)" : "rgba(83,105,255,.48)"})`,
        }}
      >
        <defs>
          <linearGradient
            id="installer-package-top"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0"
              stopColor={complete ? COLORS.mintSoft : "#bac3ff"}
            />
            <stop offset="1" stopColor={accent} />
          </linearGradient>
          <linearGradient
            id="installer-package-side"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0" stopColor={complete ? "#299a72" : COLORS.blue} />
            <stop
              offset="1"
              stopColor={complete ? "#125942" : COLORS.blueDeep}
            />
          </linearGradient>
        </defs>
        <path
          d="M68 10L121 38L68 66L15 38Z"
          fill="url(#installer-package-top)"
          stroke={COLORS.cyanSoft}
          strokeWidth="3"
        />
        <path
          d="M15 38L68 66V125L15 96Z"
          fill={complete ? "#167052" : "#2434a4"}
          stroke={accent}
          strokeWidth="3"
        />
        <path
          d="M121 38L68 66V125L121 96Z"
          fill="url(#installer-package-side)"
          stroke={accent}
          strokeWidth="3"
        />
        <path
          d="M42 24L94 52M68 66V125"
          fill="none"
          stroke="rgba(237,255,252,.7)"
          strokeWidth="3"
        />
        <rect
          x="31"
          y="62"
          width="23"
          height="27"
          fill="rgba(4,14,52,.62)"
          stroke={COLORS.cyanSoft}
          strokeWidth="2"
        />
        <path d="M36 74H49M36 80H47" stroke={COLORS.cyanSoft} strokeWidth="2" />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 48,
          bottom: 0,
          width: 108,
          height: 7,
          overflow: "hidden",
          background: "rgba(7,19,42,.58)",
          border: "1px solid rgba(193,255,248,.32)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
      </div>
    </div>
  );
};

const PhaseRail: React.FC<{
  readonly frame: number;
  readonly progress: number;
}> = ({ frame, progress }) => {
  const activePhase =
    frame >= 760
      ? 4
      : frame >= 640
        ? 3
        : frame >= 400
          ? 2
          : frame >= 210
            ? 1
            : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 26,
        right: 26,
        top: 82,
        height: 58,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 9,
      }}
    >
      {PHASES.map((phase, index) => {
        const done = index < activePhase || (index === 4 && progress >= 1);
        const active = index === activePhase;
        const color = done
          ? COLORS.mint
          : active
            ? COLORS.cyan
            : COLORS.inkSoft;
        const previousThreshold =
          index === 0 ? 0 : (PHASES[index - 1]?.threshold ?? 0);
        const phaseProgress =
          index === 4
            ? progress >= 1
              ? 1
              : 0
            : clamp01(
                (progress - previousThreshold) /
                  Math.max(0.01, phase.threshold - previousThreshold),
              );
        return (
          <div
            key={phase.label}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              overflow: "hidden",
              background: active
                ? "linear-gradient(180deg, rgba(49,66,205,.18), rgba(28,39,125,.1))"
                : "rgba(78,98,96,.07)",
              border: `2px solid ${done ? "rgba(63,181,133,.48)" : active ? "rgba(83,105,255,.56)" : "rgba(91,111,108,.28)"}`,
              boxShadow: active
                ? "inset 2px 2px rgba(255,255,255,.32), 0 0 14px rgba(83,105,255,.12)"
                : "inset 2px 2px rgba(255,255,255,.22)",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                background: done
                  ? "rgba(40,151,107,.15)"
                  : active
                    ? "rgba(50,64,193,.16)"
                    : "rgba(74,94,91,.08)",
                border: `2px solid ${color}`,
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {done ? (
                <CheckGlyph size={15} color={COLORS.mint} stroke={3.4} />
              ) : (
                index + 1
              )}
            </div>
            <PixelText color={color} size={13} spacing={1.4}>
              {phase.label}
            </PixelText>
            {active ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: `${Math.max(8, phaseProgress * 100)}%`,
                  height: 3,
                  background: COLORS.cyan,
                  boxShadow: "0 0 10px rgba(75,244,229,.75)",
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const SourcePanel: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
  readonly complete: boolean;
}> = ({ frame, time, progress, complete }) => {
  const status =
    frame < 210
      ? "MEDIA ONLINE"
      : frame < 400
        ? "UNPACKING"
        : frame < 640
          ? "STREAMING"
          : frame < 760
            ? "READ COMPLETE"
            : "PACKAGE READY";
  const blink = 0.55 + 0.45 * Math.sin(time * TAU * 1.7) ** 2;

  return (
    <BevelPanel
      dark
      style={{
        position: "absolute",
        left: 26,
        top: 159,
        width: 330,
        height: 503,
        padding: "23px 23px 20px",
      }}
    >
      <PixelText color={COLORS.cyanSoft} size={14} spacing={2.2}>
        SOURCE PACKAGE
      </PixelText>
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 22,
          width: 8,
          height: 8,
          background: complete ? COLORS.mint : COLORS.cyan,
          opacity: blink,
          boxShadow: complete
            ? "0 0 12px rgba(103,244,181,.9)"
            : "0 0 12px rgba(75,244,229,.9)",
        }}
      />

      <PackageGlyph time={time} progress={progress} complete={complete} />

      <PixelText
        color={complete ? COLORS.mintSoft : COLORS.panelLight}
        size={20}
        spacing={1.2}
        align="center"
        style={{ marginTop: 6 }}
      >
        NEXUS SUITE
      </PixelText>
      <PixelText
        color="rgba(193,255,248,.56)"
        size={12}
        spacing={1.6}
        align="center"
        style={{ marginTop: 7 }}
      >
        BUILD 4.8.2 // X64
      </PixelText>

      <div
        style={{
          marginTop: 20,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(124,154,255,.5), transparent)",
        }}
      />

      {[
        ["SOURCE", "SETUP.CAR"],
        ["SIZE", "058.1 MB"],
        ["MEDIA", "READ ONLY"],
        ["SIGNATURE", frame >= 640 ? "VALID" : "CHECK"],
      ].map(([label, value], index) => (
        <div
          key={label}
          style={{
            marginTop: index === 0 ? 16 : 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <PixelText color="rgba(193,255,248,.48)" size={11} spacing={1.4}>
            {label}
          </PixelText>
          <PixelText
            color={
              label === "SIGNATURE" && frame >= 640
                ? COLORS.mint
                : COLORS.cyanSoft
            }
            size={11}
            spacing={1}
          >
            {value}
          </PixelText>
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 20,
          height: 35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 11,
          background: complete ? "rgba(34,129,93,.18)" : "rgba(58,74,185,.17)",
          border: `1px solid ${complete ? "rgba(103,244,181,.48)" : "rgba(83,105,255,.5)"}`,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            background: complete ? COLORS.mint : COLORS.cyan,
            boxShadow: `0 0 10px ${complete ? COLORS.mint : COLORS.cyan}`,
          }}
        />
        <PixelText
          color={complete ? COLORS.mint : COLORS.cyanSoft}
          size={11}
          spacing={1.5}
        >
          {status}
        </PixelText>
      </div>
    </BevelPanel>
  );
};

const DataBus: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
}> = ({ frame, time, progress }) => {
  const active = frame >= 100 && frame < 760;
  const packetCount = frame < 210 ? 3 : frame < 640 ? 6 : 4;
  const color = frame >= 640 ? COLORS.amber : COLORS.cyan;

  return (
    <div
      style={{
        position: "absolute",
        left: 374,
        top: 285,
        width: 112,
        height: 246,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 51,
          top: 0,
          bottom: 0,
          width: 10,
          background:
            "linear-gradient(90deg, rgba(7,19,43,.92), rgba(74,94,167,.38), rgba(7,19,43,.92))",
          border: "1px solid rgba(128,153,255,.36)",
          boxShadow: "0 0 18px rgba(83,105,255,.14)",
        }}
      />
      {Array.from({ length: 9 }, (_, index) => (
        <div
          key={`bus-notch-${index}`}
          style={{
            position: "absolute",
            left: index % 2 === 0 ? 37 : 57,
            top: 10 + index * 28,
            width: 18,
            height: 3,
            background: "rgba(154,176,255,.34)",
          }}
        />
      ))}

      {active
        ? Array.from({ length: packetCount }, (_, index) => {
            const cycle = modulo(time * 0.72 + index / packetCount, 1);
            const y = mix(224, 8, cycle);
            const scale = 0.72 + cycle * 0.28;
            return (
              <div
                key={`data-packet-${index}`}
                style={{
                  position: "absolute",
                  left: 42,
                  top: y,
                  width: 29,
                  height: 16,
                  transform: `scale(${scale})`,
                  opacity:
                    segment(cycle, 0, 0.1) * (1 - segment(cycle, 0.9, 1)),
                  background: index % 3 === 0 ? COLORS.blue : color,
                  border: "1px solid rgba(235,255,252,.72)",
                  boxShadow: `0 0 14px ${index % 3 === 0 ? "rgba(83,105,255,.72)" : frame >= 640 ? "rgba(255,201,95,.68)" : "rgba(75,244,229,.7)"}`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    right: 4,
                    top: 4,
                    height: 2,
                    background: "rgba(255,255,255,.68)",
                  }}
                />
              </div>
            );
          })
        : null}

      <PixelText
        color="rgba(52,67,90,.62)"
        size={10}
        spacing={1.3}
        align="center"
        style={{
          position: "absolute",
          left: -10,
          right: -10,
          bottom: -34,
        }}
      >
        BUS {String(Math.round(progress * 58.1)).padStart(2, "0")} MB
      </PixelText>
    </div>
  );
};

const SectorMap: React.FC<{
  readonly time: number;
  readonly progress: number;
  readonly complete: boolean;
}> = ({ time, progress, complete }) => {
  const cells = 80;
  const filled = Math.floor(progress * cells);
  const scan = Math.floor(modulo(time * 10, 10));

  return (
    <div
      style={{
        position: "absolute",
        left: 24,
        top: 66,
        width: 286,
        height: 222,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 286,
          height: 196,
          padding: 11,
          boxSizing: "border-box",
          background: "#08152f",
          border: "3px solid #536863",
          boxShadow:
            "inset 4px 4px rgba(0,0,0,.5), inset -3px -3px rgba(255,255,255,.16)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gridTemplateRows: "repeat(8, 1fr)",
            gap: 5,
          }}
        >
          {Array.from({ length: cells }, (_, index) => {
            const active = index < filled;
            const newest = active && index >= Math.max(0, filled - 4);
            const column = index % 10;
            const scanHit = column === scan && !complete;
            return (
              <div
                key={`sector-cell-${index}`}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  opacity: active ? 1 : scanHit ? 0.48 : 0.22,
                  background: active
                    ? complete
                      ? "linear-gradient(180deg, #baffe0, #39c78f)"
                      : newest
                        ? "linear-gradient(180deg, #d3ffff, #4bf4e5)"
                        : index % 7 === 0
                          ? "linear-gradient(180deg, #9ca9ff, #5369ff)"
                          : "linear-gradient(180deg, #67fff0, #1ea89d)"
                    : "#38504f",
                  border: active
                    ? "1px solid rgba(239,255,252,.55)"
                    : "1px solid rgba(102,128,124,.25)",
                  boxShadow: newest
                    ? "0 0 10px rgba(75,244,229,.72)"
                    : undefined,
                }}
              >
                {scanHit ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,.7), transparent)",
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <PixelText color={COLORS.inkSoft} size={10} spacing={1.2}>
          DRIVE C://APP
        </PixelText>
        <PixelText
          color={complete ? "#147c59" : COLORS.blueDeep}
          size={10}
          spacing={1.2}
        >
          {String(filled).padStart(2, "0")}/{cells} SECTORS
        </PixelText>
      </div>
    </div>
  );
};

const ModuleList: React.FC<{
  readonly frame: number;
  readonly progress: number;
}> = ({ frame, progress }) => (
  <div
    style={{
      position: "absolute",
      left: 334,
      top: 66,
      width: 384,
      height: 222,
      padding: "12px 14px",
      boxSizing: "border-box",
      background: "rgba(107,128,124,.08)",
      border: "2px solid rgba(95,115,111,.32)",
      boxShadow: "inset 2px 2px rgba(255,255,255,.38)",
    }}
  >
    <PixelText color={COLORS.inkSoft} size={11} spacing={1.5}>
      COMPONENT MANIFEST
    </PixelText>
    <div style={{ marginTop: 10 }}>
      {MODULES.map((module, index) => {
        const done = progress >= module.threshold;
        const active =
          !done &&
          progress >= (index === 0 ? 0 : (MODULES[index - 1]?.threshold ?? 0));
        return (
          <div
            key={module.name}
            style={{
              height: 35,
              display: "grid",
              gridTemplateColumns: "23px 1fr auto",
              alignItems: "center",
              gap: 8,
              padding: "0 8px",
              boxSizing: "border-box",
              background: active
                ? "rgba(83,105,255,.11)"
                : index % 2 === 0
                  ? "rgba(76,96,93,.06)"
                  : "transparent",
              borderLeft: active
                ? `3px solid ${COLORS.blue}`
                : "3px solid transparent",
            }}
          >
            <div
              style={{
                width: 15,
                height: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: done
                  ? "#167e5c"
                  : active
                    ? COLORS.blueDeep
                    : COLORS.inkSoft,
                border: `1px solid ${
                  done
                    ? "rgba(26,142,101,.46)"
                    : active
                      ? "rgba(83,105,255,.52)"
                      : "rgba(82,103,100,.28)"
                }`,
                fontFamily: "'Courier New', monospace",
                fontSize: 9,
                fontWeight: 900,
              }}
            >
              {done ? (
                <CheckGlyph size={12} color="#177e5d" stroke={3.5} />
              ) : active ? (
                String((Math.floor(frame / 9) + index) % 10)
              ) : (
                "·"
              )}
            </div>
            <PixelText
              color={
                done ? "#1b7258" : active ? COLORS.blueDeep : COLORS.inkSoft
              }
              size={10}
              spacing={0.8}
            >
              {module.name}
            </PixelText>
            <PixelText color="rgba(55,76,77,.5)" size={9} spacing={0.6}>
              {module.size}
            </PixelText>
          </div>
        );
      })}
    </div>
  </div>
);

const SegmentedProgress: React.FC<{
  readonly progress: number;
  readonly time: number;
  readonly complete: boolean;
}> = ({ progress, time, complete }) => {
  const count = 24;
  const activeCount = complete
    ? count
    : Math.min(count - 1, Math.floor(progress * count));
  const shine = modulo(time * 0.45, 1);

  return (
    <div
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        bottom: 73,
        height: 67,
        padding: 9,
        boxSizing: "border-box",
        background: "#9aa9a1",
        border: `3px solid ${COLORS.panelDark}`,
        boxShadow:
          "inset 4px 4px rgba(51,72,68,.38), inset -4px -4px rgba(255,255,255,.76)",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: `repeat(${count}, 1fr)`,
          gap: 5,
        }}
      >
        {Array.from({ length: count }, (_, index) => {
          const active = index < activeCount;
          const newest = active && index === activeCount - 1 && !complete;
          return (
            <div
              key={`install-progress-${index}`}
              style={{
                position: "relative",
                overflow: "hidden",
                opacity: active
                  ? newest
                    ? 0.76 + Math.sin(time * TAU * 3.5) * 0.18
                    : 1
                  : 0.25,
                background: active
                  ? complete
                    ? "linear-gradient(180deg, #c8ffe4, #64f1b4 48%, #23986f)"
                    : "linear-gradient(180deg, #a9b3ff, #5369ff 45%, #222b9c)"
                  : "linear-gradient(180deg, #758985, #5c706c)",
                border: active
                  ? "1px solid rgba(240,255,252,.66)"
                  : "1px solid rgba(31,52,49,.36)",
                boxShadow: active
                  ? complete
                    ? "0 0 11px rgba(103,244,181,.48)"
                    : "0 0 10px rgba(83,105,255,.42)"
                  : "inset 2px 2px rgba(255,255,255,.08)",
              }}
            >
              {active ? (
                <div
                  style={{
                    position: "absolute",
                    left: -14,
                    top: -18,
                    width: 14,
                    height: 84,
                    transform: `translateX(${shine * 66}px) rotate(18deg)`,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,.46), transparent)",
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const statusForFrame = (frame: number) => {
  if (frame < 210) return "READING INSTALLATION MEDIA";
  if (frame < 400) return "UNPACKING COMPRESSED FILES";
  if (frame < 640) return "INSTALLING APPLICATION MODULES";
  if (frame < 760) return "VERIFYING FILE INTEGRITY";
  return "APPLICATION READY";
};

const swapOpacity = (frame: number) => {
  const boundaries = [210, 400, 640, 760];
  return boundaries.reduce((opacity, boundary) => {
    const distance = Math.abs(frame - boundary);
    const local = interpolate(distance, [0, 9], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return Math.min(opacity, local);
  }, 1);
};

const WorkPanel: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
  readonly complete: boolean;
}> = ({ frame, time, progress, complete }) => {
  const percentage = complete ? 100 : Math.min(99, Math.floor(progress * 100));
  const phaseColor =
    frame >= 760 ? "#157b59" : frame >= 640 ? "#9b6400" : COLORS.blueDeep;
  const statusOpacity = swapOpacity(frame);

  return (
    <BevelPanel
      style={{
        position: "absolute",
        left: 486,
        top: 159,
        width: 742,
        height: 503,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: 20,
          height: 34,
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <PixelText color={COLORS.ink} size={20} spacing={1.2}>
          {complete ? "INSTALLATION COMPLETE" : "INSTALLING NEXUS SUITE"}
        </PixelText>
        <PixelText
          color={phaseColor}
          size={27}
          spacing={0.5}
          align="right"
          style={{ marginLeft: "auto" }}
        >
          {String(percentage).padStart(3, "0")}%
        </PixelText>
      </div>

      <SectorMap time={time} progress={progress} complete={complete} />
      <ModuleList frame={frame} progress={progress} />
      <SegmentedProgress progress={progress} time={time} complete={complete} />

      <div
        style={{
          position: "absolute",
          left: 26,
          right: 26,
          bottom: 27,
          display: "flex",
          alignItems: "center",
          opacity: statusOpacity,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            marginRight: 10,
            background:
              frame >= 760
                ? COLORS.mint
                : frame >= 640
                  ? COLORS.amber
                  : COLORS.blue,
            boxShadow: `0 0 11px ${
              frame >= 760
                ? "rgba(103,244,181,.8)"
                : frame >= 640
                  ? "rgba(255,201,95,.75)"
                  : "rgba(83,105,255,.7)"
            }`,
          }}
        />
        <PixelText color={phaseColor} size={11} spacing={1.3}>
          {statusForFrame(frame)}
        </PixelText>
        <PixelText
          color="rgba(54,75,76,.52)"
          size={10}
          spacing={1}
          style={{ marginLeft: "auto" }}
        >
          {complete
            ? "CRC 8F2A // 0 ERRORS"
            : `WRITTEN ${String(Math.floor(progress * 58.1)).padStart(2, "0")}.MB`}
        </PixelText>
      </div>
    </BevelPanel>
  );
};

const SuccessHero: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const enter = segment(frame, 793, 815, Easing.out(Easing.cubic));
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.75);
  const ringRotation = time * 16;

  return (
    <div
      style={{
        position: "absolute",
        left: 26,
        top: 159,
        width: 1202,
        height: 503,
        opacity: enter,
        transform: `scale(${mix(0.985, 1, enter)})`,
        transformOrigin: "50% 50%",
      }}
    >
      <BevelPanel
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(145deg, #f5f8ef 0%, #dce9df 52%, #b9d6c6 100%)",
          borderColor: "#568878",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 116,
            top: 48,
            width: 238,
            height: 238,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              transform: `rotate(${ringRotation}deg)`,
              border: "3px dashed rgba(38,143,103,.42)",
              boxShadow: `0 0 ${24 + pulse * 18}px rgba(103,244,181,.22)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 24,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(208,255,234,.95), rgba(103,244,181,.48) 58%, rgba(24,124,89,.22))",
              border: "4px solid #28a878",
              boxShadow:
                "inset 0 0 28px rgba(255,255,255,.78), 0 0 30px rgba(60,210,153,.28)",
            }}
          />
          <svg
            width="132"
            height="132"
            viewBox="0 0 132 132"
            style={{ position: "absolute", left: 53, top: 51 }}
          >
            <path
              d="M25 67L51 92L108 36"
              fill="none"
              stroke="#116f50"
              strokeWidth="13"
              strokeLinecap="square"
              strokeLinejoin="miter"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - enter}
            />
          </svg>
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index / 8) * TAU + time * 0.4;
            const radius = 107;
            return (
              <div
                key={`success-orbit-${index}`}
                style={{
                  position: "absolute",
                  left: 115 + Math.cos(angle) * radius,
                  top: 115 + Math.sin(angle) * radius,
                  width: index % 2 === 0 ? 8 : 5,
                  height: index % 2 === 0 ? 8 : 5,
                  background: COLORS.mint,
                  boxShadow: "0 0 10px rgba(103,244,181,.9)",
                }}
              />
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            left: 430,
            right: 62,
            top: 76,
          }}
        >
          <PixelText color="#126b4e" size={13} spacing={2.3}>
            SETUP STATUS // READY
          </PixelText>
          <PixelText
            color={COLORS.ink}
            size={31}
            spacing={0.8}
            style={{ marginTop: 13, lineHeight: 1.05 }}
          >
            INSTALLATION
            <br />
            COMPLETE
          </PixelText>
          <PixelText
            color={COLORS.inkSoft}
            size={12}
            spacing={1.25}
            style={{ marginTop: 18, lineHeight: 1.6 }}
          >
            NEXUS SUITE 4.8.2 IS READY
            <br />
            ALL COMPONENTS VERIFIED
          </PixelText>
        </div>

        <div
          style={{
            position: "absolute",
            left: 430,
            right: 62,
            bottom: 94,
            height: 78,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {[
            ["FILES", "058.1 MB"],
            ["SIGNATURE", "VALID"],
            ["ERRORS", "000"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(39,139,101,.08)",
                border: "2px solid rgba(36,132,96,.3)",
                boxShadow: "inset 2px 2px rgba(255,255,255,.5)",
              }}
            >
              <PixelText color="rgba(22,92,69,.58)" size={10} spacing={1.4}>
                {label}
              </PixelText>
              <PixelText
                color={label === "ERRORS" ? "#157252" : COLORS.ink}
                size={16}
                spacing={1}
                style={{ marginTop: 6 }}
              >
                {value}
              </PixelText>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: 430,
            right: 62,
            bottom: 34,
            display: "flex",
            alignItems: "center",
          }}
        >
          <PixelText color="#177354" size={11} spacing={1.45}>
            APPLICATION READY // CRC 8F2A
          </PixelText>
          <div style={{ marginLeft: "auto" }}>
            <RetroButton primary>LAUNCH</RetroButton>
          </div>
        </div>
      </BevelPanel>
    </div>
  );
};

const InstallerWindow: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
}> = ({ frame, time, progress }) => {
  const enter = segment(frame, 0, 46, Easing.out(Easing.cubic));
  const complete = frame >= 760;
  const workOut = 1 - segment(frame, 780, 790, Easing.in(Easing.cubic));
  const glowTransition = segment(frame, 740, 790, Easing.inOut(Easing.cubic));
  const accent = interpolateColors(
    glowTransition,
    [0, 1],
    [COLORS.cyan, COLORS.mint],
  );
  const breath = 0.5 + 0.5 * Math.sin(time * TAU * 0.28);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 1280,
        height: 750,
        opacity: enter,
        transform: `translate(-50%, calc(-50% + ${mix(12, 0, enter)}px)) scale(${mix(0.985, 1, enter)})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 32,
          right: -30,
          bottom: -32,
          opacity: 0.24,
          background: "#06132c",
          filter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -10,
          opacity: 0.3 + breath * 0.18,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 ${36 + breath * 18}px ${complete ? "rgba(103,244,181,.24)" : "rgba(75,244,229,.23)"}`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: `linear-gradient(145deg, ${COLORS.panelLight} 0%, ${COLORS.panel} 50%, ${COLORS.panelMid} 100%)`,
          border: `4px solid ${COLORS.panelMid}`,
          boxShadow:
            "inset 4px 4px rgba(255,255,255,.94), inset -4px -4px rgba(61,83,79,.42), 0 32px 80px rgba(1,18,36,.46)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 7,
            right: 7,
            top: 7,
            height: 65,
            display: "flex",
            alignItems: "center",
            padding: "0 15px 0 20px",
            boxSizing: "border-box",
            background: complete
              ? "linear-gradient(90deg, #0a4d40, #137755 48%, #24966c)"
              : "linear-gradient(90deg, #0b1047, #192374 48%, #4054df)",
            borderBottom: "3px solid rgba(4,12,53,.55)",
            boxShadow:
              "inset 2px 2px rgba(169,188,255,.34), inset 0 -3px rgba(2,7,38,.38)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 7px)",
              gap: 3,
              marginRight: 16,
            }}
          >
            {Array.from({ length: 9 }, (_, index) => (
              <div
                key={`title-led-${index}`}
                style={{
                  width: 7,
                  height: 7,
                  background:
                    index === Math.floor(time * 8) % 9
                      ? complete
                        ? COLORS.mintSoft
                        : COLORS.cyanSoft
                      : index % 2
                        ? complete
                          ? COLORS.mint
                          : COLORS.cyan
                        : "rgba(202,255,250,.32)",
                  boxShadow:
                    index === Math.floor(time * 8) % 9
                      ? "0 0 11px rgba(207,255,241,.9)"
                      : undefined,
                }}
              />
            ))}
          </div>

          <PixelText color={COLORS.panelLight} size={20} spacing={2.2}>
            NEXUS SOFTWARE SETUP
          </PixelText>
          <PixelText
            color="rgba(212,255,250,.58)"
            size={11}
            spacing={1.5}
            style={{ marginLeft: 18 }}
          >
            BUILD 4.8.2 // X64
          </PixelText>

          <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
            <WindowButton>_</WindowButton>
            <WindowButton>□</WindowButton>
            <WindowButton danger>×</WindowButton>
          </div>
        </div>

        <PhaseRail frame={frame} progress={progress} />

        <div style={{ opacity: workOut }}>
          <SourcePanel
            frame={frame}
            time={time}
            progress={progress}
            complete={complete}
          />
          <DataBus frame={frame} time={time} progress={progress} />
          <WorkPanel
            frame={frame}
            time={time}
            progress={progress}
            complete={complete}
          />
        </div>

        <SuccessHero frame={frame} time={time} />

        <div
          style={{
            position: "absolute",
            left: 26,
            right: 26,
            bottom: 22,
            height: 46,
            display: "flex",
            alignItems: "center",
          }}
        >
          <PixelText color="rgba(47,68,69,.55)" size={10} spacing={1.25}>
            TARGET C://PROGRAMS/NEXUS
          </PixelText>
          <PixelText
            color={complete ? "#167656" : COLORS.blueDeep}
            size={10}
            spacing={1.2}
            style={{ marginLeft: 22 }}
          >
            {complete ? "INSTALLATION VERIFIED" : "SAFE WRITE ENABLED"}
          </PixelText>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 12,
              opacity: 1 - segment(frame, 780, 790),
            }}
          >
            <RetroButton disabled>BACK</RetroButton>
            <RetroButton>DETAILS</RetroButton>
            <RetroButton primary>CANCEL</RetroButton>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 7,
            right: 7,
            bottom: 6,
            height: 4,
            opacity: 0.4,
            background: complete
              ? "repeating-linear-gradient(90deg, #21946a 0 18px, transparent 18px 28px)"
              : "repeating-linear-gradient(90deg, #3346c4 0 18px, transparent 18px 28px)",
          }}
        />
      </div>
    </div>
  );
};

const ScreenFinish: React.FC<{ readonly time: number }> = ({ time }) => (
  <>
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.15,
        transform: `translateY(${modulo(time * 19, 6)}px)`,
        backgroundImage:
          "repeating-linear-gradient(180deg, rgba(4,22,35,.52) 0px, rgba(4,22,35,.52) 1px, transparent 1px, transparent 5px)",
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.07,
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,80,80,.18) 0 1px, rgba(70,255,221,.08) 1px 2px, rgba(71,94,255,.16) 2px 3px)",
        backgroundSize: "3px 100%",
        mixBlendMode: "screen",
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        boxShadow: "inset 0 0 160px rgba(0,10,26,.55)",
      }}
    />
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const time = frame / fps;
  const progress = getInstallProgress(frame);
  const unit = Math.min(width / WIDTH, height / HEIGHT);
  const offsetX = (width - WIDTH * unit) / 2;
  const offsetY = (height - HEIGHT * unit) / 2;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: COLORS.desktopDeep,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: WIDTH,
          height: HEIGHT,
          overflow: "hidden",
          transform: `scale(${unit})`,
          transformOrigin: "top left",
        }}
      >
        <AmbientDesktop frame={frame} time={time} />
        <InstallerWindow frame={frame} time={time} progress={progress} />
        <ScreenFinish time={time} />
      </div>
    </AbsoluteFill>
  );
};
