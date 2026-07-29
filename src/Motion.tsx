import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Standalone composition: Retro Operating System Upgrade.
const WIDTH = 1920;
const HEIGHT = 1080;
const TAU = Math.PI * 2;

const COLORS = {
  deep: "#03172e",
  navy: "#071d3b",
  teal: "#075c70",
  cyan: "#54f2e5",
  cyanSoft: "#c8fff8",
  blue: "#5267f2",
  violet: "#8b76ff",
  amber: "#ffc861",
  coral: "#ff6f7d",
  mint: "#62f2af",
  mintSoft: "#d6ffeb",
  shell: "#dce4d9",
  shellLight: "#f8faed",
  shellMid: "#b9c7bb",
  shellDark: "#657b78",
  ink: "#10252a",
  inkSoft: "#4f6767",
  black: "#020a12",
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
  const value = Math.sin(seed * 91.177 + 13.831) * 43758.5453;
  return value - Math.floor(value);
};

const getUpgradeProgress = (frame: number) => {
  if (frame < 54) return 0;
  if (frame < 170) {
    return mix(0, 0.18, segment(frame, 54, 170, Easing.inOut(Easing.cubic)));
  }
  if (frame < 290) {
    return mix(
      0.18,
      0.33,
      segment(frame, 170, 290, Easing.inOut(Easing.cubic)),
    );
  }
  if (frame < 580) {
    return mix(
      0.33,
      0.78,
      segment(frame, 290, 580, Easing.inOut(Easing.cubic)),
    );
  }
  if (frame < 690) {
    return mix(
      0.78,
      0.99,
      segment(frame, 580, 690, Easing.inOut(Easing.cubic)),
    );
  }
  return frame >= 810 ? 1 : 0.99;
};

const PHASES = [
  { label: "PACKAGE", start: 0, threshold: 0.18 },
  { label: "SNAPSHOT", start: 170, threshold: 0.33 },
  { label: "REPLACE", start: 290, threshold: 0.78 },
  { label: "VERIFY", start: 580, threshold: 0.99 },
  { label: "REBOOT", start: 690, threshold: 1 },
] as const;

const SYSTEM_FILES = [
  { path: "BOOT/LOADER.BIN", size: "086 KB", threshold: 0.38 },
  { path: "SYSTEM/KERNEL.SYS", size: "2.4 MB", threshold: 0.45 },
  { path: "SYSTEM/IO.CORE", size: "1.8 MB", threshold: 0.51 },
  { path: "DRIVERS/DISPLAY.DRV", size: "744 KB", threshold: 0.58 },
  { path: "DRIVERS/NETWORK.DRV", size: "620 KB", threshold: 0.65 },
  { path: "UI/SHELL.PAK", size: "3.1 MB", threshold: 0.72 },
  { path: "LIB/RUNTIME.MOD", size: "1.2 MB", threshold: 0.78 },
] as const;

const PARTICLES = Array.from({ length: 58 }, (_, index) => ({
  x: hash01(index * 7 + 3) * WIDTH,
  y: hash01(index * 13 + 9) * HEIGHT,
  size: 2 + Math.floor(hash01(index * 17 + 2) * 4),
  phase: hash01(index * 19 + 5),
  speed: 8 + hash01(index * 23 + 1) * 18,
  opacity: 0.05 + hash01(index * 29 + 7) * 0.17,
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
  const gridX = modulo(time * 11, 72);
  const gridY = modulo(time * 5.2, 72);
  const sweepY = modulo(time * 132, HEIGHT + 280) - 140;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.24);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 44%, #0d8491 0%, #075c76 38%, #053653 70%, #03172f 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(rgba(135,255,245,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(135,255,245,.18) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage:
            "radial-gradient(circle at 50% 50%, #000 0%, rgba(0,0,0,.8) 52%, transparent 88%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1260,
          height: 1260,
          transform: `translate(-50%, -50%) rotate(${time * 1.25}deg)`,
          borderRadius: "50%",
          border: "1px solid rgba(190,255,249,.12)",
          boxShadow:
            "0 0 0 92px rgba(89,255,241,.024), 0 0 0 188px rgba(89,255,241,.016)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1550,
          height: 510,
          transform: `translate(-50%, -50%) rotate(${-9 + Math.sin(time * 0.21) * 1.2}deg)`,
          background:
            "linear-gradient(90deg, transparent, rgba(86,255,241,.09), transparent)",
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
          opacity: 0.14,
          background:
            "linear-gradient(180deg, transparent, rgba(174,255,248,.68), transparent)",
          filter: "blur(24px)",
        }}
      />

      <PixelText
        color="rgba(207,255,251,.55)"
        size={14}
        spacing={2.8}
        style={{ position: "absolute", left: 82, bottom: 70 }}
      >
        RETRO/OS SERVICE CHANNEL // 09
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
            "radial-gradient(ellipse at center, transparent 46%, rgba(1,24,40,.2) 74%, rgba(1,13,29,.64) 100%)",
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
        ? "linear-gradient(145deg, #14213f, #07142d)"
        : `linear-gradient(145deg, ${COLORS.shellLight}, ${COLORS.shell} 48%, ${COLORS.shellMid})`,
      border: dark
        ? "2px solid rgba(111,137,255,.55)"
        : `3px solid ${COLORS.shellDark}`,
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
      width: 29,
      height: 26,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: COLORS.shellLight,
      background: danger
        ? "linear-gradient(180deg, #ff8c91, #bd3549)"
        : "rgba(231,241,237,.12)",
      border: "1px solid rgba(245,255,252,.42)",
      boxShadow: "inset 1px 1px rgba(255,255,255,.25)",
      fontFamily: "Arial, sans-serif",
      fontSize: 15,
      fontWeight: 900,
      lineHeight: 1,
    }}
  >
    {children}
  </div>
);

const PackageDisk: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
}> = ({ frame, time, progress }) => {
  const verified = progress >= 0.99;
  const accent = verified ? COLORS.mint : COLORS.cyan;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 1.25);
  const ring = time * 30;
  const insert = segment(frame, 38, 84, Easing.out(Easing.back(1.4)));

  return (
    <div
      style={{
        position: "relative",
        width: 242,
        height: 218,
        margin: "0 auto",
        transform: `scale(${0.86 + insert * 0.14})`,
        opacity: segment(frame, 22, 54),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 23,
          top: 6,
          width: 194,
          height: 194,
          borderRadius: "50%",
          border: `2px dashed ${accent}`,
          transform: `rotate(${ring * 0.25}deg)`,
          opacity: 0.18 + pulse * 0.18,
          boxShadow: `0 0 30px ${verified ? "rgba(98,242,175,.24)" : "rgba(84,242,229,.22)"}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 29,
          width: 148,
          height: 148,
          border: "1px solid rgba(152,170,255,.34)",
          transform: `rotate(${-ring * 0.17}deg)`,
        }}
      />

      <svg
        width="150"
        height="150"
        viewBox="0 0 150 150"
        style={{
          position: "absolute",
          left: 45,
          top: 28,
          filter: `drop-shadow(0 0 17px ${
            verified ? "rgba(98,242,175,.44)" : "rgba(83,103,242,.5)"
          })`,
        }}
      >
        <defs>
          <linearGradient id="os-disk-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={verified ? "#b8ffe0" : "#b7c2ff"} />
            <stop offset="0.45" stopColor={verified ? "#3ed49a" : "#6476ff"} />
            <stop offset="1" stopColor={verified ? "#176248" : "#1a246f"} />
          </linearGradient>
          <linearGradient id="os-disk-label" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5faf0" />
            <stop offset="1" stopColor="#cbd8ce" />
          </linearGradient>
        </defs>
        <path
          d="M20 12H111L134 35V138H20Z"
          fill="url(#os-disk-body)"
          stroke={accent}
          strokeWidth="4"
        />
        <path
          d="M42 12H105V55H42Z"
          fill="#0b1b43"
          stroke={COLORS.cyanSoft}
          strokeWidth="3"
        />
        <rect
          x="86"
          y="18"
          width="13"
          height="29"
          fill={verified ? COLORS.mint : COLORS.amber}
        />
        <path
          d="M38 79H116V128H38Z"
          fill="url(#os-disk-label)"
          stroke="#526763"
          strokeWidth="3"
        />
        <path d="M51 94H103M51 104H92" stroke="#506865" strokeWidth="4" />
        <path
          d="M111 12V35H134"
          fill="none"
          stroke={COLORS.cyanSoft}
          strokeWidth="3"
        />
        {verified ? (
          <path
            d="M60 112L70 121L91 99"
            fill="none"
            stroke="#167653"
            strokeWidth="6"
          />
        ) : null}
      </svg>

      <div
        style={{
          position: "absolute",
          left: 63,
          bottom: 0,
          width: 116,
          height: 8,
          overflow: "hidden",
          border: "1px solid rgba(203,255,249,.38)",
          background: "rgba(5,17,40,.7)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(1, progress / 0.18) * 100}%`,
            background: accent,
            boxShadow: `0 0 12px ${accent}`,
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
    frame >= 690
      ? 4
      : frame >= 580
        ? 3
        : frame >= 290
          ? 2
          : frame >= 170
            ? 1
            : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        top: 72,
        height: 56,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
      }}
    >
      {PHASES.map((phase, index) => {
        const done = index < activePhase;
        const active = index === activePhase;
        const previousThreshold =
          index === 0 ? 0 : (PHASES[index - 1]?.threshold ?? 0);
        const fill =
          index === 4
            ? frame >= 690
              ? segment(frame, 690, 716)
              : 0
            : clamp01(
                (progress - previousThreshold) /
                  Math.max(0.01, phase.threshold - previousThreshold),
              );
        const accent = done
          ? COLORS.mint
          : active
            ? COLORS.cyan
            : COLORS.inkSoft;

        return (
          <div
            key={phase.label}
            style={{
              position: "relative",
              height: 54,
              border: `2px solid ${active ? accent : "rgba(77,102,101,.44)"}`,
              background: active
                ? "rgba(84,242,229,.09)"
                : "rgba(93,116,110,.06)",
              boxShadow: active ? "0 0 13px rgba(84,242,229,.18)" : undefined,
            }}
          >
            <PixelText
              size={11}
              spacing={1}
              align="center"
              color={accent}
              style={{ marginTop: 9 }}
            >
              {String(index + 1).padStart(2, "0")} {phase.label}
            </PixelText>
            <div
              style={{
                position: "absolute",
                left: 7,
                right: 7,
                bottom: 7,
                height: 4,
                overflow: "hidden",
                background: "rgba(42,63,63,.24)",
              }}
            >
              <div
                style={{
                  width: `${(done ? 1 : fill) * 100}%`,
                  height: "100%",
                  background: done ? COLORS.mint : COLORS.cyan,
                  boxShadow: `0 0 8px ${done ? COLORS.mint : COLORS.cyan}`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DataBus: React.FC<{
  readonly frame: number;
  readonly progress: number;
  readonly time: number;
}> = ({ frame, progress, time }) => {
  const active = frame >= 170 && frame < 690;
  const speed =
    frame < 290 ? 0.8 : frame < 580 ? 1.8 : frame < 690 ? 2.35 : 0.3;
  return (
    <div
      style={{
        position: "absolute",
        left: 310,
        right: 334,
        top: 127,
        height: 20,
        opacity: active ? 1 : 0.25,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 8,
          height: 4,
          background:
            "linear-gradient(90deg, rgba(84,242,229,.12), rgba(84,242,229,.9), rgba(83,103,242,.76))",
          boxShadow: "0 0 13px rgba(84,242,229,.4)",
        }}
      />
      {[0, 1, 2, 3, 4].map((index) => {
        const x = modulo(time * 220 * speed + index * 146, 690);
        return (
          <div
            key={`bus-packet-${index}`}
            style={{
              position: "absolute",
              left: x,
              top: 1,
              width: 19,
              height: 18,
              opacity: active ? 0.7 + 0.3 * Math.sin(time * 5 + index) ** 2 : 0,
              background: index % 2 === 0 ? COLORS.cyanSoft : COLORS.amber,
              border: `2px solid ${index % 2 === 0 ? COLORS.cyan : "#bd7d22"}`,
              boxShadow: `0 0 12px ${
                index % 2 === 0 ? "rgba(84,242,229,.78)" : "rgba(255,200,97,.7)"
              }`,
            }}
          />
        );
      })}
    </div>
  );
};

const SourceCard: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
}> = ({ frame, time, progress }) => {
  const packageStatus =
    frame < 170 ? "VALIDATING" : progress >= 0.99 ? "VERIFIED" : "MOUNTED";
  const statusColor =
    frame < 170 ? COLORS.amber : progress >= 0.99 ? COLORS.mint : COLORS.cyan;

  return (
    <BevelPanel
      style={{
        position: "absolute",
        left: 24,
        top: 146,
        width: 286,
        height: 426,
        padding: "18px 17px",
      }}
    >
      <PixelText size={12} spacing={1.7} color={COLORS.inkSoft}>
        UPDATE MEDIA
      </PixelText>
      <div
        style={{
          height: 2,
          marginTop: 11,
          background: "linear-gradient(90deg, rgba(46,70,68,.72), transparent)",
        }}
      />
      <PackageDisk frame={frame} time={time} progress={progress} />
      <PixelText
        size={18}
        spacing={1.1}
        align="center"
        color={COLORS.ink}
        style={{ marginTop: 12 }}
      >
        RETRO/OS 9.2
      </PixelText>
      <PixelText
        size={11}
        spacing={1.5}
        align="center"
        color={COLORS.inkSoft}
        style={{ marginTop: 8 }}
      >
        BUILD 0924 // 48.6 MB
      </PixelText>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 9,
          marginTop: 17,
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            background: statusColor,
            boxShadow: `0 0 9px ${statusColor}`,
          }}
        />
        <PixelText size={11} spacing={1.5} color={statusColor}>
          {packageStatus}
        </PixelText>
      </div>
    </BevelPanel>
  );
};

const FileLog: React.FC<{
  readonly frame: number;
  readonly progress: number;
}> = ({ frame, progress }) => {
  const activeIndex = SYSTEM_FILES.findIndex(
    (file) => progress < file.threshold,
  );
  const cursor = activeIndex === -1 ? SYSTEM_FILES.length : activeIndex;
  const firstVisible = Math.max(0, cursor - 4);
  const rows = SYSTEM_FILES.slice(firstVisible, firstVisible + 5);

  return (
    <BevelPanel
      dark
      style={{
        position: "absolute",
        left: 330,
        top: 146,
        width: 440,
        height: 426,
        padding: "17px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <PixelText size={12} spacing={1.7} color={COLORS.cyanSoft}>
          SYSTEM FILE TRANSACTION
        </PixelText>
        <PixelText
          size={11}
          spacing={1.3}
          color={frame >= 580 ? COLORS.mint : COLORS.amber}
        >
          {frame >= 580 ? "READBACK" : frame >= 290 ? "WRITE" : "STANDBY"}
        </PixelText>
      </div>
      <div
        style={{
          height: 1,
          margin: "13px 0 16px",
          background:
            "linear-gradient(90deg, rgba(84,242,229,.64), rgba(83,103,242,.1))",
        }}
      />
      <div style={{ height: 254 }}>
        {rows.map((file) => {
          const done = progress >= file.threshold;
          const active =
            !done &&
            frame >= 290 &&
            file === SYSTEM_FILES[Math.max(0, activeIndex)];
          const state = done ? "OK" : active ? "WR" : "WAIT";
          const stateColor = done
            ? COLORS.mint
            : active
              ? COLORS.amber
              : "rgba(147,167,174,.42)";
          return (
            <div
              key={file.path}
              style={{
                height: 49,
                display: "grid",
                gridTemplateColumns: "27px 1fr 62px 42px",
                alignItems: "center",
                gap: 7,
                padding: "0 8px",
                boxSizing: "border-box",
                borderBottom: "1px solid rgba(111,137,255,.13)",
                background: active ? "rgba(255,200,97,.08)" : "transparent",
              }}
            >
              <div
                style={{
                  width: 15,
                  height: 18,
                  border: `2px solid ${stateColor}`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 3,
                    right: 3,
                    top: 5,
                    height: 2,
                    background: stateColor,
                  }}
                />
              </div>
              <PixelText
                size={11}
                spacing={0.55}
                color={done ? COLORS.cyanSoft : "rgba(193,210,220,.62)"}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "clip",
                }}
              >
                {file.path}
              </PixelText>
              <PixelText
                size={10}
                spacing={0.7}
                align="right"
                color="rgba(171,191,201,.58)"
              >
                {file.size}
              </PixelText>
              <PixelText
                size={10}
                spacing={0.8}
                align="right"
                color={stateColor}
              >
                {state}
              </PixelText>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 16,
          height: 44,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <div
          style={{
            border: "1px solid rgba(84,242,229,.28)",
            background: "rgba(84,242,229,.05)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
          }}
        >
          <PixelText size={10} spacing={1.1} color="rgba(201,255,249,.62)">
            OLD: 09.1.8
          </PixelText>
        </div>
        <div
          style={{
            border: "1px solid rgba(98,242,175,.3)",
            background: "rgba(98,242,175,.06)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
          }}
        >
          <PixelText size={10} spacing={1.1} color={COLORS.mint}>
            NEW: 09.2.4
          </PixelText>
        </div>
      </div>
    </BevelPanel>
  );
};

const SectorMap: React.FC<{
  readonly frame: number;
  readonly progress: number;
  readonly time: number;
}> = ({ frame, progress, time }) => {
  const mapProgress = clamp01((progress - 0.32) / 0.46);
  const verified = frame >= 690;
  const scan = modulo(time * (frame < 580 ? 76 : 118), 266);
  const filled = Math.floor(mapProgress * 48);
  const checksum = frame >= 580 && frame < 690;

  return (
    <BevelPanel
      style={{
        position: "absolute",
        right: 24,
        top: 146,
        width: 314,
        height: 426,
        padding: "17px 17px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <PixelText size={12} spacing={1.6} color={COLORS.inkSoft}>
          SYSTEM MAP
        </PixelText>
        <PixelText
          size={11}
          spacing={1.2}
          color={verified ? COLORS.mint : COLORS.blue}
        >
          {verified ? "VALID" : "FS://C"}
        </PixelText>
      </div>
      <div
        style={{
          position: "relative",
          height: 272,
          marginTop: 16,
          padding: 13,
          boxSizing: "border-box",
          overflow: "hidden",
          border: "2px solid #52645f",
          background:
            "linear-gradient(145deg, rgba(4,23,44,.96), rgba(10,34,57,.98))",
          boxShadow:
            "inset 2px 2px rgba(185,255,246,.08), inset -3px -3px rgba(0,0,0,.45)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 5,
          }}
        >
          {Array.from({ length: 48 }, (_, index) => {
            const done = index < filled;
            const current = index === filled && frame >= 290 && frame < 580;
            const shimmer =
              0.76 + 0.24 * Math.sin(time * 6.2 + index * 0.43) ** 2;
            const color = verified
              ? COLORS.mint
              : done
                ? interpolateColors(
                    clamp01(index / 48),
                    [0, 1],
                    [COLORS.blue, COLORS.cyan],
                  )
                : current
                  ? COLORS.amber
                  : "rgba(85,111,122,.2)";
            return (
              <div
                key={`sector-${index}`}
                style={{
                  height: 32,
                  position: "relative",
                  overflow: "hidden",
                  background: color,
                  opacity: done || verified ? shimmer : current ? 1 : 0.65,
                  border: `1px solid ${
                    done || current || verified
                      ? "rgba(205,255,249,.54)"
                      : "rgba(111,137,255,.12)"
                  }`,
                  boxShadow: current
                    ? "0 0 11px rgba(255,200,97,.78)"
                    : done || verified
                      ? `0 0 7px ${verified ? "rgba(98,242,175,.32)" : "rgba(84,242,229,.24)"}`
                      : undefined,
                }}
              >
                {(done || verified) && index % 3 === 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 4,
                      right: 4,
                      top: 7,
                      height: 2,
                      background: "rgba(230,255,251,.55)",
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {checksum ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: scan - 8,
              height: 18,
              background:
                "linear-gradient(180deg, transparent, rgba(98,242,175,.62), transparent)",
              boxShadow: "0 0 16px rgba(98,242,175,.45)",
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
          marginTop: 16,
        }}
      >
        <div
          style={{
            height: 49,
            border: "1px solid rgba(74,95,92,.38)",
            padding: "8px 9px",
            boxSizing: "border-box",
          }}
        >
          <PixelText size={9} spacing={1} color={COLORS.inkSoft}>
            BLOCKS
          </PixelText>
          <PixelText size={14} spacing={1} color={COLORS.ink}>
            {String(Math.min(48, filled)).padStart(2, "0")}/48
          </PixelText>
        </div>
        <div
          style={{
            height: 49,
            border: `1px solid ${verified ? "rgba(98,242,175,.5)" : "rgba(74,95,92,.38)"}`,
            padding: "8px 9px",
            boxSizing: "border-box",
            background: verified ? "rgba(98,242,175,.08)" : "transparent",
          }}
        >
          <PixelText size={9} spacing={1} color={COLORS.inkSoft}>
            CHECKSUM
          </PixelText>
          <PixelText
            size={14}
            spacing={1}
            color={verified ? "#167653" : COLORS.ink}
          >
            {verified ? "CRC OK" : frame >= 580 ? "READ" : "-- --"}
          </PixelText>
        </div>
      </div>
    </BevelPanel>
  );
};

const SegmentedProgress: React.FC<{
  readonly progress: number;
  readonly time: number;
}> = ({ progress, time }) => {
  const count = progress >= 1 ? 24 : Math.min(23, Math.floor(progress * 24));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(24, 1fr)",
        gap: 5,
        height: 18,
      }}
    >
      {Array.from({ length: 24 }, (_, index) => {
        const active = index < count;
        const latest = active && index === count - 1;
        const color =
          progress >= 1
            ? COLORS.mint
            : interpolateColors(index / 23, [0, 1], [COLORS.blue, COLORS.cyan]);
        return (
          <div
            key={`progress-segment-${index}`}
            style={{
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${
                active ? "rgba(211,255,250,.68)" : "rgba(77,99,99,.28)"
              }`,
              background: active ? color : "rgba(70,91,90,.12)",
              boxShadow: latest
                ? `0 0 ${10 + Math.sin(time * 8) * 3}px ${color}`
                : active
                  ? `0 0 6px ${color}44`
                  : undefined,
            }}
          >
            {active ? (
              <div
                style={{
                  position: "absolute",
                  left: 2,
                  right: 2,
                  top: 2,
                  height: 3,
                  background: "rgba(255,255,255,.55)",
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const statusForFrame = (frame: number) => {
  if (frame < 170) return "CHECKING UPDATE PACKAGE";
  if (frame < 290) return "CREATING SYSTEM SNAPSHOT";
  if (frame < 580) return "REPLACING SYSTEM FILES";
  if (frame < 690) return "VERIFYING NEW SYSTEM";
  return "RESTART REQUIRED";
};

const statusColorForFrame = (frame: number) => {
  if (frame < 170) return COLORS.amber;
  if (frame < 580) return COLORS.cyan;
  if (frame < 690) return COLORS.mint;
  return COLORS.amber;
};

const WorkScreen: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
}> = ({ frame, time, progress }) => {
  const status = statusForFrame(frame);
  const statusColor = statusColorForFrame(frame);
  const visiblePercent =
    progress >= 1 ? 100 : Math.min(99, Math.floor(progress * 100));
  const filesDone = SYSTEM_FILES.filter(
    (file) => progress >= file.threshold,
  ).length;

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, rgba(236,244,234,.98), rgba(183,200,190,.98))",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 54,
          display: "flex",
          alignItems: "center",
          padding: "0 17px",
          boxSizing: "border-box",
          background: "linear-gradient(90deg, #151b6c, #4359df 58%, #186d82)",
          borderBottom: "3px solid #0e154f",
          boxShadow: "inset 0 2px rgba(255,255,255,.2)",
        }}
      >
        <div
          style={{
            width: 25,
            height: 25,
            marginRight: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: COLORS.cyan,
            border: "2px solid rgba(240,255,253,.82)",
            boxShadow: "0 0 11px rgba(84,242,229,.66)",
          }}
        >
          <PixelText size={15} spacing={0} align="center" color="#132459">
            ↑
          </PixelText>
        </div>
        <PixelText size={15} spacing={1.8} color={COLORS.shellLight}>
          RETRO/OS SYSTEM UPGRADE
        </PixelText>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <WindowButton>_</WindowButton>
          <WindowButton>□</WindowButton>
          <WindowButton danger>×</WindowButton>
        </div>
      </div>

      <PhaseRail frame={frame} progress={progress} />
      <SourceCard frame={frame} time={time} progress={progress} />
      <FileLog frame={frame} progress={progress} />
      <SectorMap frame={frame} time={time} progress={progress} />
      <DataBus frame={frame} progress={progress} time={time} />

      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 13,
          height: 78,
          padding: "10px 17px",
          boxSizing: "border-box",
          border: "2px solid #607673",
          background:
            "linear-gradient(180deg, rgba(249,252,244,.94), rgba(203,216,207,.96))",
          boxShadow:
            "inset 2px 2px rgba(255,255,255,.8), inset -2px -2px rgba(69,89,84,.24)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 7,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 11,
                height: 11,
                background: statusColor,
                boxShadow: `0 0 10px ${statusColor}`,
              }}
            />
            <PixelText size={13} spacing={1.5} color={statusColor}>
              {status}
            </PixelText>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <PixelText size={10} spacing={1.2} color={COLORS.inkSoft}>
              FILES {String(filesDone).padStart(2, "0")}/07
            </PixelText>
            <PixelText size={24} spacing={1} color={COLORS.ink}>
              {String(visiblePercent).padStart(3, "0")}%
            </PixelText>
          </div>
        </div>
        <div style={{ height: 18 }}>
          <SegmentedProgress progress={progress} time={time} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: statusColor,
          boxShadow: `0 0 12px ${statusColor}`,
        }}
      />
    </AbsoluteFill>
  );
};

const RebootScreen: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const bios = segment(frame, 770, 785);
  const cursorOn = Math.floor(time * 5) % 2 === 0;
  const bootLines = [
    { text: "RETRO/OS BOOT ROM 09.2.4", at: 775 },
    { text: "MEMORY TEST ............. OK", at: 782 },
    { text: "SYSTEM MAP .............. VALID", at: 790 },
    { text: "LOADING NEW KERNEL ...... OK", at: 798 },
  ];
  const spinner = ["◰", "◳", "◲", "◱"][Math.floor(time * 8) % 4];

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          frame < 770
            ? "radial-gradient(circle at 50% 50%, #06101c, #01050a 72%)"
            : "radial-gradient(circle at 50% 46%, #062d31, #021014 76%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: frame < 770 ? 0.08 : 0.19,
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(140,255,232,.16) 0px, rgba(140,255,232,.16) 1px, transparent 1px, transparent 5px)",
          transform: `translateY(${modulo(time * 18, 5)}px)`,
        }}
      />

      {frame < 770 ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            gap: 19,
          }}
        >
          <PixelText
            size={34}
            spacing={2}
            align="center"
            color="rgba(194,255,244,.8)"
          >
            {spinner}
          </PixelText>
          <PixelText
            size={23}
            spacing={3.2}
            align="center"
            color="rgba(194,255,244,.78)"
          >
            RESTARTING SYSTEM
          </PixelText>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 74,
            right: 74,
            top: 72,
            opacity: bios,
          }}
        >
          <PixelText size={18} spacing={2.2} color={COLORS.mintSoft}>
            SYSTEM INITIALIZATION
          </PixelText>
          <div
            style={{
              width: 510,
              height: 2,
              margin: "14px 0 23px",
              background:
                "linear-gradient(90deg, rgba(98,242,175,.8), transparent)",
            }}
          />
          {bootLines.map((line) => {
            const lineOpacity = segment(frame, line.at, line.at + 5);
            return (
              <PixelText
                key={line.text}
                size={15}
                spacing={1.5}
                color={COLORS.mint}
                style={{
                  opacity: lineOpacity,
                  marginBottom: 16,
                }}
              >
                {line.text}
              </PixelText>
            );
          })}
          <PixelText
            size={15}
            spacing={1.5}
            color={COLORS.mintSoft}
            style={{
              opacity: segment(frame, 800, 804),
              marginTop: 17,
            }}
          >
            BOOTING{cursorOn ? " █" : "  "}
          </PixelText>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 930,
          height: 510,
          transform: `translate(-50%, -50%) rotate(${time * 0.7}deg)`,
          borderRadius: "50%",
          border: "1px solid rgba(98,242,175,.08)",
          boxShadow: "0 0 80px rgba(98,242,175,.035)",
        }}
      />
    </AbsoluteFill>
  );
};

const SuccessScreen: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const enter = segment(frame, 810, 838, Easing.out(Easing.cubic));
  const iconEnter = segment(frame, 814, 840, Easing.out(Easing.back(1.25)));
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.85);
  const sweep = modulo(time * 148, 1260) - 130;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: enter,
        background:
          "radial-gradient(circle at 50% 46%, #0c715f 0%, #075042 44%, #032b31 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(rgba(180,255,225,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(180,255,225,.18) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          backgroundPosition: `${modulo(time * 9, 44)}px ${modulo(time * 4, 44)}px`,
          maskImage:
            "radial-gradient(circle at 50% 50%, black, transparent 82%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          width: 480,
          height: 480,
          transform: `translate(-50%, -50%) rotate(${time * 7}deg)`,
          borderRadius: "50%",
          border: "2px dashed rgba(172,255,218,.25)",
          boxShadow:
            "0 0 0 38px rgba(98,242,175,.035), 0 0 0 78px rgba(98,242,175,.024)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 96,
          width: 178,
          height: 178,
          transform: `translateX(-50%) scale(${0.72 + iconEnter * 0.28})`,
          opacity: iconEnter,
          filter: "drop-shadow(0 0 22px rgba(98,242,175,.5))",
        }}
      >
        <svg width="178" height="178" viewBox="0 0 178 178">
          <defs>
            <linearGradient id="success-shield" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d6ffeb" />
              <stop offset="0.45" stopColor="#62f2af" />
              <stop offset="1" stopColor="#16805d" />
            </linearGradient>
          </defs>
          <path
            d="M89 8L153 31V82C153 125 127 151 89 169C51 151 25 125 25 82V31Z"
            fill="rgba(3,32,34,.72)"
            stroke="url(#success-shield)"
            strokeWidth="6"
          />
          <path
            d="M55 84L78 106L124 60"
            fill="none"
            stroke={COLORS.mintSoft}
            strokeWidth="12"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <path
            d="M89 20L140 39V80C140 114 122 136 89 153"
            fill="none"
            stroke="rgba(214,255,235,.36)"
            strokeWidth="3"
          />
        </svg>
      </div>

      <PixelText
        size={44}
        spacing={5.2}
        align="center"
        color={COLORS.mintSoft}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 304,
          opacity: segment(frame, 824, 842),
          textShadow:
            "0 0 15px rgba(98,242,175,.48), 0 4px 0 rgba(0,34,31,.45)",
        }}
      >
        UPGRADE COMPLETE
      </PixelText>
      <PixelText
        size={15}
        spacing={3.2}
        align="center"
        color="rgba(214,255,235,.82)"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 368,
          opacity: segment(frame, 834, 850),
        }}
      >
        RETRO/OS 9.2.4 // SYSTEM READY
      </PixelText>

      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: 424,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          opacity: segment(frame, 842, 860),
        }}
      >
        {[
          ["SYSTEM FILES", "VERIFIED"],
          ["CHECKSUM", "CRC OK"],
          ["ERRORS", "000"],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              height: 76,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid rgba(188,255,222,.36)",
              background: "rgba(2,33,34,.34)",
              boxShadow:
                "inset 1px 1px rgba(232,255,241,.08), 0 0 16px rgba(98,242,175,.08)",
            }}
          >
            <PixelText
              size={10}
              spacing={1.7}
              align="center"
              color="rgba(195,255,226,.58)"
            >
              {label}
            </PixelText>
            <PixelText
              size={16}
              spacing={1.5}
              align="center"
              color={COLORS.mintSoft}
              style={{ marginTop: 8 }}
            >
              {value}
            </PixelText>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: sweep,
          top: -40,
          width: 160,
          height: 720,
          transform: "rotate(13deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(226,255,239,.11), transparent)",
          filter: "blur(16px)",
        }}
      />

      {Array.from({ length: 26 }, (_, index) => {
        const angle = (index / 26) * TAU + time * 0.18;
        const radius = 270 + (index % 5) * 26;
        const x = 620 + Math.cos(angle) * radius;
        const y = 290 + Math.sin(angle) * radius * 0.63;
        return (
          <div
            key={`success-spark-${index}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: index % 6 === 0 ? 5 : 3,
              height: index % 6 === 0 ? 5 : 3,
              opacity:
                (0.18 + 0.58 * Math.sin(time * 2.7 + index) ** 2) * enter,
              background: index % 5 === 0 ? COLORS.cyanSoft : COLORS.mint,
              boxShadow:
                index % 6 === 0 ? "0 0 12px rgba(182,255,222,.72)" : undefined,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 97,
          right: 97,
          bottom: 21,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              background: COLORS.mint,
              boxShadow: `0 0 ${9 + pulse * 5}px ${COLORS.mint}`,
            }}
          />
          <PixelText size={10} spacing={1.4} color="rgba(214,255,235,.72)">
            BOOT HANDSHAKE ACCEPTED
          </PixelText>
        </div>
        <PixelText size={20} spacing={1.2} color={COLORS.mintSoft}>
          100%
        </PixelText>
      </div>
    </AbsoluteFill>
  );
};

const ComputerShell: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
}> = ({ frame, time, progress }) => {
  const intro = segment(frame, 0, 48, Easing.out(Easing.cubic));
  const workOpacity =
    frame < 708 ? 1 : frame < 728 ? 1 - segment(frame, 708, 728) : 0;
  const rebootOpacity =
    frame < 730
      ? 0
      : frame < 740
        ? segment(frame, 730, 740)
        : frame < 802
          ? 1
          : 1 - segment(frame, 802, 810);
  const successOpacity = segment(frame, 810, 826);
  const powerColor = frame >= 810 ? COLORS.mint : COLORS.cyan;
  const diskBlink =
    frame >= 290 && frame < 690
      ? 0.3 + 0.7 * Math.sin(time * TAU * 3.2) ** 2
      : frame >= 730 && frame < 810
        ? 0.16
        : 0.46 + 0.18 * Math.sin(time * TAU * 0.8) ** 2;

  return (
    <div
      style={{
        position: "relative",
        width: 1324,
        height: 844,
        opacity: intro,
        transform: `translateY(${(1 - intro) * 42}px) scale(${0.965 + intro * 0.035})`,
        filter: "drop-shadow(0 36px 48px rgba(0,8,25,.42))",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1324,
          height: 754,
          background:
            "linear-gradient(145deg, #f8faed 0%, #dce4d9 47%, #a6b6aa 100%)",
          border: "5px solid #5d7370",
          borderRadius: 38,
          boxShadow:
            "inset 8px 8px rgba(255,255,255,.82), inset -11px -11px rgba(69,89,84,.28), 0 0 0 3px rgba(6,26,40,.22)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 46,
            right: 46,
            top: 42,
            height: 616,
            borderRadius: 20,
            overflow: "hidden",
            border: "12px solid #455b5b",
            background: COLORS.black,
            boxShadow:
              "inset 0 0 0 5px rgba(237,247,232,.18), inset 0 0 70px rgba(0,0,0,.88), 0 0 0 3px rgba(255,255,255,.45)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              top: 8,
              bottom: 8,
              overflow: "hidden",
              borderRadius: 10,
              background: COLORS.black,
            }}
          >
            <div
              style={{ position: "absolute", inset: 0, opacity: workOpacity }}
            >
              <WorkScreen frame={frame} time={time} progress={progress} />
            </div>
            <div
              style={{ position: "absolute", inset: 0, opacity: rebootOpacity }}
            >
              <RebootScreen frame={frame} time={time} />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: successOpacity,
              }}
            >
              <SuccessScreen frame={frame} time={time} />
            </div>

            <AbsoluteFill
              style={{
                pointerEvents: "none",
                opacity: 0.1,
                backgroundImage:
                  "repeating-linear-gradient(180deg, rgba(255,255,255,.18) 0px, rgba(255,255,255,.18) 1px, transparent 1px, transparent 5px)",
                transform: `translateY(${modulo(time * 21, 5)}px)`,
                mixBlendMode: "screen",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 34,
                top: 16,
                width: 540,
                height: 116,
                borderRadius: "50%",
                transform: "rotate(-7deg)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.13), transparent)",
                filter: "blur(2px)",
                pointerEvents: "none",
              }}
            />
            <AbsoluteFill
              style={{
                pointerEvents: "none",
                boxShadow: "inset 0 0 55px rgba(0,0,0,.5)",
                borderRadius: 10,
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 68,
            right: 68,
            bottom: 26,
            height: 54,
            display: "flex",
            alignItems: "center",
          }}
        >
          <PixelText size={13} spacing={2.4} color="#4d6462">
            RETRO SYSTEMS // MODEL 92
          </PixelText>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={`vent-${index}`}
                style={{
                  width: 5,
                  height: 30,
                  background: "#718682",
                  boxShadow: "inset 1px 1px rgba(38,60,58,.45)",
                }}
              />
            ))}
          </div>
          <div
            style={{
              width: 12,
              height: 12,
              marginLeft: 24,
              background: COLORS.amber,
              opacity: diskBlink,
              boxShadow: "0 0 11px rgba(255,200,97,.82)",
            }}
          />
          <PixelText
            size={9}
            spacing={1}
            color="#4d6462"
            style={{ marginLeft: 7 }}
          >
            DISK
          </PixelText>
          <div
            style={{
              width: 18,
              height: 18,
              marginLeft: 25,
              borderRadius: "50%",
              background: powerColor,
              border: "3px solid #556c68",
              boxShadow: `0 0 14px ${powerColor}`,
            }}
          />
          <PixelText
            size={9}
            spacing={1}
            color="#4d6462"
            style={{ marginLeft: 7 }}
          >
            POWER
          </PixelText>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 502,
          top: 746,
          width: 320,
          height: 60,
          background: "linear-gradient(180deg, #adbbb1, #788c87)",
          borderLeft: "4px solid #5b716e",
          borderRight: "4px solid #5b716e",
          clipPath: "polygon(14% 0, 86% 0, 100% 100%, 0 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 408,
          bottom: 0,
          width: 508,
          height: 46,
          borderRadius: 14,
          background: "linear-gradient(180deg, #d8e2d7, #879a92)",
          border: "4px solid #5d7370",
          boxShadow:
            "inset 4px 4px rgba(255,255,255,.62), inset -5px -5px rgba(64,85,80,.2)",
        }}
      />
    </div>
  );
};

const FinishOverlay: React.FC<{ readonly time: number }> = ({ time }) => (
  <>
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.075,
        backgroundImage:
          "repeating-linear-gradient(180deg, rgba(255,255,255,.25) 0px, rgba(255,255,255,.25) 1px, transparent 1px, transparent 4px)",
        backgroundPosition: `0 ${modulo(time * 17, 4)}px`,
        mixBlendMode: "screen",
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at center, transparent 48%, rgba(1,15,29,.2) 72%, rgba(1,8,20,.62) 100%)",
      }}
    />
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const progress = getUpgradeProgress(frame);
  const pushIn = segment(frame, 690, 768, Easing.inOut(Easing.cubic));
  const settle = segment(frame, 768, 835, Easing.out(Easing.cubic));
  const cameraScale = 1 + pushIn * 0.038 - settle * 0.024;
  const cameraY = -pushIn * 7 + settle * 4;

  return (
    <AbsoluteFill style={{ background: COLORS.deep, overflow: "hidden" }}>
      <AmbientDesktop frame={frame} time={time} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${cameraY}px) scale(${cameraScale})`,
        }}
      >
        <ComputerShell frame={frame} time={time} progress={progress} />
      </div>
      <FinishOverlay time={time} />
    </AbsoluteFill>
  );
};
