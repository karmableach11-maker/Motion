import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Standalone composition: Retro System Backup & Recovery.
const WIDTH = 1920;
const HEIGHT = 1080;
const TAU = Math.PI * 2;

const COLORS = {
  deep: "#03182f",
  navy: "#071d3b",
  screen: "#061a2b",
  screenSoft: "#0a2b3d",
  cyan: "#54f2e5",
  cyanSoft: "#d4fffa",
  blue: "#5267f2",
  violet: "#9278ff",
  amber: "#ffc861",
  coral: "#ff596d",
  red: "#d91f45",
  mint: "#62f2af",
  mintSoft: "#d8ffea",
  shell: "#dfe5d6",
  shellLight: "#fbfcef",
  shellMid: "#b9c7b8",
  shellDark: "#627773",
  ink: "#10282d",
  inkSoft: "#58706d",
  black: "#020810",
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

const getBackupProgress = (frame: number) => {
  if (frame < 48) return 0;
  if (frame < 105) {
    return mix(0, 0.17, segment(frame, 48, 105, Easing.inOut(Easing.cubic)));
  }
  if (frame < 188) {
    return mix(
      0.17,
      0.66,
      segment(frame, 105, 188, Easing.inOut(Easing.cubic)),
    );
  }
  if (frame < 252) {
    return mix(
      0.66,
      1,
      segment(frame, 188, 252, Easing.inOut(Easing.cubic)),
    );
  }
  return 1;
};

const getRestoreProgress = (frame: number) => {
  if (frame < 520) return 0;
  if (frame < 590) {
    return mix(0, 0.2, segment(frame, 520, 590, Easing.inOut(Easing.cubic)));
  }
  if (frame < 682) {
    return mix(
      0.2,
      0.72,
      segment(frame, 590, 682, Easing.inOut(Easing.cubic)),
    );
  }
  if (frame < 748) {
    return mix(
      0.72,
      0.99,
      segment(frame, 682, 748, Easing.inOut(Easing.cubic)),
    );
  }
  return frame >= 804 ? 1 : 0.99;
};

const FILES = [
  { path: "SYSTEM/BOOT.SYS", size: "096 KB" },
  { path: "SYSTEM/KERNEL.BIN", size: "2.4 MB" },
  { path: "DATA/CLIENTS.DB", size: "8.7 MB" },
  { path: "DATA/REPORTS.ARC", size: "6.2 MB" },
  { path: "CONFIG/NETWORK.CFG", size: "024 KB" },
  { path: "USERS/PROFILE.DAT", size: "1.3 MB" },
] as const;

const CORRUPT_INDICES = new Set([
  2, 4, 7, 11, 13, 16, 18, 20, 23, 26, 29, 31, 34, 36, 39, 42, 44, 47,
]);

const PARTICLES = Array.from({ length: 64 }, (_, index) => ({
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
  color = COLORS.cyanSoft,
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

const CheckGlyph: React.FC<{
  readonly size?: number;
  readonly color?: string;
  readonly stroke?: number;
}> = ({ size = 24, color = COLORS.mint, stroke = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M4.5 12.5L9.2 17L19.5 6.8"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

const AmbientBackground: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const gridX = modulo(time * 9.5, 72);
  const gridY = modulo(time * 4.8, 72);
  const sweepY = modulo(time * 118, HEIGHT + 320) - 160;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.23);
  const incidentGlow =
    segment(frame, 300, 326, Easing.out(Easing.cubic)) *
    (1 - segment(frame, 430, 470, Easing.inOut(Easing.cubic)));

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: interpolateColors(
          incidentGlow,
          [0, 1],
          ["#03182f", "#281126"],
        ),
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 44%, rgba(12,135,146,.9) 0%, rgba(5,69,92,.82) 42%, rgba(3,24,47,.22) 74%, rgba(2,12,28,.1) 100%)",
          opacity: 1 - incidentGlow * 0.42,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(rgba(133,255,244,.17) 1px, transparent 1px), linear-gradient(90deg, rgba(133,255,244,.17) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage:
            "radial-gradient(circle at 50% 50%, #000 0%, rgba(0,0,0,.8) 56%, transparent 90%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1520,
          height: 1520,
          transform: `translate(-50%, -50%) rotate(${time * 1.15}deg)`,
          borderRadius: "50%",
          border: `1px solid ${
            incidentGlow > 0.1
              ? "rgba(255,89,109,.15)"
              : "rgba(190,255,249,.12)"
          }`,
          boxShadow:
            "0 0 0 104px rgba(89,255,241,.022), 0 0 0 220px rgba(89,255,241,.014)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          width: 1650,
          height: 480,
          transform: `translate(-50%, -50%) rotate(${-8 + Math.sin(time * 0.22) * 1.1}deg)`,
          opacity: 0.1 + pulse * 0.05,
          background:
            "linear-gradient(90deg, transparent, rgba(87,255,241,.58), transparent)",
          filter: "blur(48px)",
        }}
      />

      {PARTICLES.map((particle, index) => {
        const y =
          modulo(
            particle.y + time * particle.speed + particle.phase * HEIGHT * 0.5,
            HEIGHT + 100,
          ) - 50;
        const flicker =
          0.3 +
          0.7 *
            Math.sin(
              (time * (0.17 + (index % 5) * 0.025) + particle.phase) * TAU,
            ) **
              2;
        const isIncidentParticle = incidentGlow > 0.2 && index % 4 === 0;
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
              background: isIncidentParticle
                ? COLORS.coral
                : index % 8 === 0
                  ? COLORS.cyanSoft
                  : "rgba(87,255,240,.92)",
              boxShadow:
                index % 8 === 0
                  ? `0 0 14px ${
                      isIncidentParticle
                        ? "rgba(255,89,109,.88)"
                        : "rgba(104,255,241,.88)"
                    }`
                  : undefined,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: -240,
          top: sweepY,
          width: 2400,
          height: 150,
          transform: "rotate(-4deg)",
          opacity: 0.13,
          background:
            "linear-gradient(180deg, transparent, rgba(174,255,248,.68), transparent)",
          filter: "blur(25px)",
        }}
      />

      <PixelText
        color="rgba(207,255,251,.5)"
        size={14}
        spacing={2.8}
        style={{ position: "absolute", left: 74, bottom: 63 }}
      >
        RETROSAFE RECOVERY SERVICE // NODE 07
      </PixelText>
      <PixelText
        color="rgba(207,255,251,.48)"
        size={14}
        spacing={2.2}
        align="right"
        style={{ position: "absolute", right: 74, top: 62, lineHeight: 1.65 }}
      >
        LINK {String(Math.round(93 + pulse * 6)).padStart(2, "0")}%
        <br />
        FRAME {String(frame).padStart(4, "0")}
      </PixelText>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 48%, rgba(1,24,40,.18) 74%, rgba(1,13,29,.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const ScreenPanel: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly accent?: string;
}> = ({ children, style, accent = COLORS.cyan }) => (
  <div
    style={{
      position: "relative",
      overflow: "hidden",
      boxSizing: "border-box",
      background:
        "linear-gradient(145deg, rgba(11,38,57,.97), rgba(4,18,34,.98))",
      border: `2px solid ${accent}66`,
      boxShadow: `inset 2px 2px ${accent}12, inset -3px -3px rgba(0,2,12,.5), 0 0 15px ${accent}12`,
      ...style,
    }}
  >
    {children}
  </div>
);

const DiskIcon: React.FC<{
  readonly color: string;
  readonly pulse: number;
  readonly failed?: boolean;
}> = ({ color, pulse, failed = false }) => (
  <svg
    width="88"
    height="88"
    viewBox="0 0 88 88"
    style={{
      filter: `drop-shadow(0 0 ${10 + pulse * 8}px ${color}99)`,
    }}
  >
    <ellipse
      cx="44"
      cy="18"
      rx="31"
      ry="12"
      fill={failed ? "#5b1426" : "#122f43"}
      stroke={color}
      strokeWidth="3"
    />
    <path
      d="M13 18V65C13 72 27 78 44 78C61 78 75 72 75 65V18"
      fill={failed ? "#3b1120" : "#0a2237"}
      stroke={color}
      strokeWidth="3"
    />
    <path
      d="M13 42C13 49 27 55 44 55C61 55 75 49 75 42M13 62C13 69 27 75 44 75C61 75 75 69 75 62"
      fill="none"
      stroke={color}
      strokeWidth="2"
      opacity="0.7"
    />
    {failed ? (
      <path
        d="M35 31L53 50M53 31L35 50"
        fill="none"
        stroke={COLORS.coral}
        strokeWidth="5"
      />
    ) : (
      <circle cx="44" cy="18" r="5" fill={color} opacity={0.72 + pulse * 0.28} />
    )}
  </svg>
);

const TapeCartridge: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly backupProgress: number;
  readonly restoreProgress: number;
}> = ({ frame, time, backupProgress, restoreProgress }) => {
  const restoring = frame >= 500;
  const failed = frame >= 300 && frame < 470;
  const done = frame >= 804;
  const color = done || restoring ? COLORS.mint : COLORS.amber;
  const speed =
    frame < 252 || (frame >= 520 && frame < 748)
      ? 170
      : frame >= 300 && frame < 430
        ? 15
        : 32;
  const rotation = time * speed * (restoring ? -1 : 1);
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 1.4);
  const progress = restoring ? restoreProgress : backupProgress;

  return (
    <div
      style={{
        position: "relative",
        width: 288,
        height: 206,
        margin: "7px auto 0",
        transform: `translateY(${Math.sin(time * 1.3) * 1.5}px)`,
        filter: `drop-shadow(0 0 ${failed ? 10 : 18}px ${
          failed ? "rgba(255,89,109,.24)" : `${color}35`
        })`,
      }}
    >
      <svg width="288" height="206" viewBox="0 0 288 206">
        <defs>
          <linearGradient id="backup-tape-shell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9eee1" />
            <stop offset="0.55" stopColor="#b8c5b6" />
            <stop offset="1" stopColor="#6b7d77" />
          </linearGradient>
          <linearGradient id="backup-tape-label" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#182d4b" />
            <stop offset="1" stopColor="#09172e" />
          </linearGradient>
        </defs>
        <path
          d="M18 12H270V166L244 194H45L18 166Z"
          fill="url(#backup-tape-shell)"
          stroke={COLORS.shellLight}
          strokeWidth="4"
        />
        <rect
          x="38"
          y="31"
          width="212"
          height="111"
          fill="url(#backup-tape-label)"
          stroke={failed ? COLORS.coral : color}
          strokeWidth="3"
        />
        <path
          d="M70 52H218V121H70Z"
          fill="#071424"
          stroke="rgba(207,255,250,.42)"
          strokeWidth="2"
        />
        {[95, 193].map((cx, index) => (
          <g
            key={`tape-reel-${cx}`}
            transform={`rotate(${rotation * (index === 0 ? 1 : -1)} ${cx} 86)`}
          >
            <circle
              cx={cx}
              cy="86"
              r="27"
              fill="#cad6c9"
              stroke={color}
              strokeWidth="3"
            />
            <circle cx={cx} cy="86" r="10" fill="#0a1a2c" />
            {[0, 90, 180, 270].map((angle) => (
              <rect
                key={`reel-spoke-${cx}-${angle}`}
                x={cx - 3}
                y="62"
                width="6"
                height="17"
                fill="#324b50"
                transform={`rotate(${angle} ${cx} 86)`}
              />
            ))}
          </g>
        ))}
        <path
          d="M121 86H167"
          stroke={color}
          strokeWidth="5"
          strokeDasharray="7 6"
          opacity={0.65 + pulse * 0.35}
        />
        <path
          d="M79 157H209L226 184H62Z"
          fill="#dce4d7"
          stroke="#60736e"
          strokeWidth="3"
        />
        <rect x="121" y="164" width="46" height="15" fill="#0e2538" />
        <rect
          x="126"
          y="168"
          width={36 * clamp01(progress)}
          height="7"
          fill={failed ? COLORS.coral : color}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 82,
          top: 5,
          width: 124,
          height: 31,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: failed ? "#6d1730" : "#132847",
          border: `2px solid ${failed ? COLORS.coral : color}`,
        }}
      >
        <PixelText
          size={12}
          spacing={1.35}
          align="center"
          color={failed ? "#ffe3e7" : color}
        >
          POINT 09:05
        </PixelText>
      </div>
    </div>
  );
};

const SectorMap: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly restoreProgress: number;
}> = ({ frame, time, restoreProgress }) => {
  const incidentProgress = segment(
    frame,
    314,
    402,
    Easing.in(Easing.cubic),
  );
  const restoreCount =
    frame >= 748 ? 48 : Math.min(47, Math.floor(restoreProgress * 48));
  const isRestore = frame >= 520;
  const verifying = frame >= 748;
  const scanY = modulo(time * (verifying ? 145 : 92), 237);

  return (
    <ScreenPanel
      accent={
        frame >= 804
          ? COLORS.mint
          : frame >= 300 && frame < 470
            ? COLORS.coral
            : COLORS.cyan
      }
      style={{
        position: "absolute",
        left: 28,
        top: 98,
        width: 390,
        height: 332,
        padding: "15px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <DiskIcon
            color={
              frame >= 804
                ? COLORS.mint
                : frame >= 300 && frame < 470
                  ? COLORS.coral
                  : COLORS.cyan
            }
            pulse={0.5 + 0.5 * Math.sin(time * 6)}
            failed={frame >= 345 && frame < 520}
          />
          <div>
            <PixelText size={13} spacing={1.5} color={COLORS.cyanSoft}>
              PRIMARY DISK
            </PixelText>
            <PixelText
              size={10}
              spacing={1.1}
              color="rgba(196,220,227,.58)"
              style={{ marginTop: 7 }}
            >
              FS:C // 48 SECTORS
            </PixelText>
          </div>
        </div>
        <PixelText
          size={11}
          spacing={1.2}
          align="right"
          color={
            frame >= 804
              ? COLORS.mint
              : frame >= 345 && frame < 520
                ? COLORS.coral
                : COLORS.cyan
          }
        >
          {frame >= 804
            ? "HEALTHY"
            : frame >= 345 && frame < 520
              ? "DAMAGED"
              : isRestore
                ? "REBUILD"
                : "ONLINE"}
        </PixelText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 17,
          height: 205,
          padding: 12,
          boxSizing: "border-box",
          overflow: "hidden",
          background: "rgba(2,11,23,.74)",
          border: "1px solid rgba(125,170,185,.28)",
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
            const isCorrupt = CORRUPT_INDICES.has(index);
            const corruptOrder = [...CORRUPT_INDICES].indexOf(index);
            const corruptionVisible =
              isCorrupt && incidentProgress * CORRUPT_INDICES.size > corruptOrder;
            const restored = isRestore && index < restoreCount;
            const finish = frame >= 804;
            const activeRestore =
              isRestore && !finish && index === Math.min(47, restoreCount);
            const color = finish || restored
              ? COLORS.mint
              : corruptionVisible || (isRestore && isCorrupt)
                ? COLORS.coral
                : COLORS.blue;
            const opacity =
              activeRestore || corruptionVisible
                ? 1
                : 0.62 + 0.24 * Math.sin(time * 4.4 + index * 0.31) ** 2;
            return (
              <div
                key={`disk-sector-${index}`}
                style={{
                  height: 25,
                  position: "relative",
                  overflow: "hidden",
                  opacity,
                  background:
                    corruptionVisible && !restored
                      ? `linear-gradient(135deg, ${COLORS.red}, #64152b)`
                      : `linear-gradient(135deg, ${color}, ${color}88)`,
                  border: `1px solid ${
                    activeRestore
                      ? COLORS.mintSoft
                      : corruptionVisible && !restored
                        ? "#ffd3da"
                        : `${color}aa`
                  }`,
                  boxShadow: activeRestore
                    ? "0 0 12px rgba(98,242,175,.88)"
                    : corruptionVisible && !restored
                      ? "0 0 8px rgba(255,89,109,.5)"
                      : `0 0 5px ${color}30`,
                }}
              >
                {corruptionVisible && !restored ? (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        left: 4,
                        right: 4,
                        top: 6,
                        height: 2,
                        transform: "rotate(18deg)",
                        background: "rgba(255,235,238,.8)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 4,
                        right: 4,
                        top: 14,
                        height: 2,
                        transform: "rotate(-18deg)",
                        background: "rgba(255,235,238,.65)",
                      }}
                    />
                  </>
                ) : index % 3 === 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 4,
                      right: 4,
                      top: 6,
                      height: 2,
                      background: "rgba(239,255,252,.5)",
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {verifying && frame < 804 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: scanY - 9,
              height: 18,
              background:
                "linear-gradient(180deg, transparent, rgba(98,242,175,.68), transparent)",
              boxShadow: "0 0 16px rgba(98,242,175,.55)",
            }}
          />
        ) : null}
      </div>
    </ScreenPanel>
  );
};

const FilePipeline: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly backupProgress: number;
  readonly restoreProgress: number;
}> = ({ frame, time, backupProgress, restoreProgress }) => {
  const backupActive = frame >= 48 && frame < 252;
  const restoreActive = frame >= 520 && frame < 748;
  const incident = frame >= 300 && frame < 440;
  const activeProgress = restoreActive ? restoreProgress : backupProgress;
  const fileCursor = Math.min(
    FILES.length,
    Math.floor(activeProgress * FILES.length),
  );
  const direction = restoreActive ? -1 : 1;
  const busColor = incident
    ? COLORS.coral
    : restoreActive
      ? COLORS.mint
      : COLORS.cyan;

  return (
    <ScreenPanel
      accent={busColor}
      style={{
        position: "absolute",
        left: 438,
        top: 98,
        width: 425,
        height: 332,
        padding: "15px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <PixelText size={13} spacing={1.5}>
          FILE TRANSFER BUS
        </PixelText>
        <PixelText size={11} spacing={1.2} color={busColor}>
          {incident
            ? "LINK LOST"
            : restoreActive
              ? "BKP → SYS"
              : frame >= 252
                ? "SYNCED"
                : "SYS → BKP"}
        </PixelText>
      </div>

      <div
        style={{
          position: "relative",
          height: 74,
          marginTop: 14,
          overflow: "hidden",
          border: `1px solid ${busColor}44`,
          background: "rgba(2,11,24,.66)",
        }}
      >
        {[0, 1, 2].map((lineIndex) => (
          <div
            key={`bus-line-${lineIndex}`}
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              top: 17 + lineIndex * 19,
              height: 3,
              opacity: incident ? 0.32 : 0.7,
              background: `linear-gradient(90deg, ${busColor}22, ${busColor}, ${busColor}22)`,
              boxShadow: `0 0 8px ${busColor}66`,
            }}
          />
        ))}

        {(backupActive || restoreActive)
          ? [0, 1, 2, 3].map((index) => {
              const travel = modulo(time * 170 + index * 96, 365);
              const x = direction === 1 ? travel : 365 - travel;
              return (
                <div
                  key={`file-packet-${index}`}
                  style={{
                    position: "absolute",
                    left: 12 + x,
                    top: 10 + (index % 3) * 19,
                    width: 18,
                    height: 15,
                    background: index % 2 === 0 ? busColor : COLORS.amber,
                    border: "1px solid rgba(240,255,252,.86)",
                    boxShadow: `0 0 11px ${
                      index % 2 === 0 ? busColor : COLORS.amber
                    }`,
                  }}
                >
                  <div
                    style={{
                      width: 9,
                      height: 2,
                      margin: "3px 0 0 3px",
                      background: "rgba(255,255,255,.7)",
                    }}
                  />
                </div>
              );
            })
          : null}

        {incident
          ? Array.from({ length: 9 }, (_, index) => (
              <div
                key={`bus-spark-${index}`}
                style={{
                  position: "absolute",
                  left:
                    32 +
                    modulo(
                      index * 43 + time * (index % 2 === 0 ? 62 : -48),
                      350,
                    ),
                  top: 8 + hash01(index * 9) * 55,
                  width: 5 + (index % 3) * 3,
                  height: 2,
                  opacity: 0.35 + 0.65 * Math.sin(time * 8 + index) ** 2,
                  transform: `rotate(${index * 37}deg)`,
                  background: index % 2 === 0 ? COLORS.coral : COLORS.amber,
                  boxShadow: "0 0 10px rgba(255,89,109,.75)",
                }}
              />
            ))
          : null}
      </div>

      <div
        style={{
          marginTop: 13,
          height: 196,
          overflow: "hidden",
          borderTop: "1px solid rgba(122,164,181,.24)",
        }}
      >
        {FILES.slice(0, 5).map((file, index) => {
          const complete = index < fileCursor;
          const active =
            (backupActive || restoreActive) && index === fileCursor;
          const state = incident
            ? index < 3
              ? "ERR"
              : "HALT"
            : complete
              ? "OK"
              : active
                ? restoreActive
                  ? "RST"
                  : "COPY"
                : "WAIT";
          const color = incident
            ? index < 3
              ? COLORS.coral
              : "rgba(255,200,97,.55)"
            : complete
              ? restoreActive
                ? COLORS.mint
                : COLORS.cyan
              : active
                ? COLORS.amber
                : "rgba(165,188,197,.38)";
          return (
            <div
              key={file.path}
              style={{
                height: 38,
                display: "grid",
                gridTemplateColumns: "22px 1fr 57px 42px",
                gap: 7,
                alignItems: "center",
                padding: "0 7px",
                boxSizing: "border-box",
                borderBottom: "1px solid rgba(111,137,255,.12)",
                background: active ? `${color}10` : "transparent",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 13,
                  height: 16,
                  border: `1px solid ${color}`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 3,
                    right: 3,
                    top: 5,
                    height: 2,
                    background: color,
                  }}
                />
              </div>
              <PixelText
                size={10}
                spacing={0.45}
                color={
                  complete
                    ? "rgba(214,255,249,.82)"
                    : "rgba(182,204,213,.55)"
                }
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {file.path}
              </PixelText>
              <PixelText
                size={9}
                spacing={0.45}
                align="right"
                color="rgba(171,193,201,.55)"
              >
                {file.size}
              </PixelText>
              <PixelText size={9} spacing={0.6} align="right" color={color}>
                {state}
              </PixelText>
            </div>
          );
        })}
      </div>
    </ScreenPanel>
  );
};

const BackupPanel: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly backupProgress: number;
  readonly restoreProgress: number;
}> = ({ frame, time, backupProgress, restoreProgress }) => {
  const selected = frame >= 470;
  const failed = frame >= 300 && frame < 445;
  const done = frame >= 804;
  const color = done || selected ? COLORS.mint : COLORS.amber;

  return (
    <ScreenPanel
      accent={failed ? COLORS.coral : color}
      style={{
        position: "absolute",
        right: 28,
        top: 98,
        width: 421,
        height: 332,
        padding: "15px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <PixelText size={13} spacing={1.5}>
          BACKUP MEDIA
        </PixelText>
        <PixelText
          size={11}
          spacing={1.2}
          color={failed ? COLORS.coral : color}
        >
          {failed
            ? "OFFLINE"
            : done
              ? "VERIFIED"
              : selected
                ? "READ MODE"
                : backupProgress >= 1
                  ? "LOCKED"
                  : "WRITE MODE"}
        </PixelText>
      </div>

      <TapeCartridge
        frame={frame}
        time={time}
        backupProgress={backupProgress}
        restoreProgress={restoreProgress}
      />

      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 13,
          height: 54,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {[
          ["CAPACITY", "48.0 MB"],
          ["SNAPSHOT", "09:05"],
          ["CRC", backupProgress >= 1 ? "A8F2 OK" : "WRITING"],
        ].map(([label, value], index) => (
          <div
            key={label}
            style={{
              padding: "8px 7px",
              boxSizing: "border-box",
              border: `1px solid ${index === 1 && selected ? `${COLORS.mint}88` : "rgba(122,164,181,.23)"}`,
              background:
                index === 1 && selected
                  ? "rgba(98,242,175,.08)"
                  : "rgba(4,18,32,.4)",
            }}
          >
            <PixelText size={8} spacing={0.85} color="rgba(179,202,211,.55)">
              {label}
            </PixelText>
            <PixelText
              size={10}
              spacing={0.65}
              color={index === 1 && selected ? COLORS.mint : COLORS.cyanSoft}
              style={{ marginTop: 5 }}
            >
              {value}
            </PixelText>
          </div>
        ))}
      </div>
    </ScreenPanel>
  );
};

const RestoreTimeline: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const selecting = frame >= 430 && frame < 520;
  const selected = frame >= 500;
  const points = [
    { time: "07:12", label: "AUTO", x: 0.08 },
    { time: "07:45", label: "FILES", x: 0.36 },
    { time: "08:20", label: "SYSTEM", x: 0.64 },
    { time: "09:05", label: "CLEAN", x: 0.92 },
  ] as const;
  const scanX = selecting
    ? 0.05 + segment(frame, 438, 494, Easing.inOut(Easing.cubic)) * 0.87
    : 0.92;

  return (
    <ScreenPanel
      accent={selected ? COLORS.mint : COLORS.violet}
      style={{
        position: "absolute",
        left: 28,
        right: 28,
        top: 448,
        height: 112,
        padding: "13px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <PixelText size={11} spacing={1.35} color="rgba(211,228,237,.7)">
          RECOVERY POINT TIMELINE
        </PixelText>
        <PixelText
          size={10}
          spacing={1.2}
          color={selected ? COLORS.mint : COLORS.violet}
        >
          {selecting ? "SCANNING POINTS" : selected ? "09:05 SELECTED" : "4 READY"}
        </PixelText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 55,
          right: 55,
          top: 58,
          height: 4,
          background:
            "linear-gradient(90deg, rgba(146,120,255,.25), rgba(146,120,255,.85), rgba(84,242,229,.5))",
          boxShadow: "0 0 10px rgba(146,120,255,.35)",
        }}
      >
        {points.map((point, index) => {
          const isSelected = selected && index === points.length - 1;
          const visited = selecting && scanX >= point.x;
          const color = isSelected
            ? COLORS.mint
            : visited
              ? COLORS.amber
              : COLORS.violet;
          return (
            <div
              key={point.time}
              style={{
                position: "absolute",
                left: `${point.x * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                style={{
                  width: isSelected ? 18 : 13,
                  height: isSelected ? 18 : 13,
                  transform: `rotate(45deg) scale(${
                    isSelected ? 1 + Math.sin(time * 6) * 0.08 : 1
                  })`,
                  background: color,
                  border: "2px solid rgba(236,255,252,.78)",
                  boxShadow: `0 0 ${isSelected ? 16 : 9}px ${color}`,
                }}
              />
              <PixelText
                size={9}
                spacing={0.7}
                align="center"
                color={color}
                style={{
                  position: "absolute",
                  top: 17,
                  left: -30,
                  width: 60,
                  lineHeight: 1.45,
                }}
              >
                {point.time}
                <br />
                {point.label}
              </PixelText>
            </div>
          );
        })}

        {selecting ? (
          <div
            style={{
              position: "absolute",
              left: `${scanX * 100}%`,
              top: -14,
              width: 4,
              height: 32,
              transform: "translateX(-2px)",
              background: COLORS.amber,
              boxShadow: "0 0 14px rgba(255,200,97,.9)",
            }}
          />
        ) : null}
      </div>
    </ScreenPanel>
  );
};

const PhaseRail: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const phases = [
    { label: "BACKUP", start: 0 },
    { label: "SNAPSHOT", start: 252 },
    { label: "INCIDENT", start: 300 },
    { label: "RESTORE", start: 430 },
    { label: "VERIFY", start: 748 },
  ] as const;
  const activeIndex =
    frame >= 748
      ? 4
      : frame >= 430
        ? 3
        : frame >= 300
          ? 2
          : frame >= 252
            ? 1
            : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        right: 28,
        top: 58,
        height: 28,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 7,
      }}
    >
      {phases.map((phase, index) => {
        const active = index === activeIndex;
        const complete = index < activeIndex;
        const incident = index === 2;
        const color = complete
          ? COLORS.mint
          : active
            ? incident
              ? COLORS.coral
              : index === 1
                ? COLORS.amber
                : COLORS.cyan
            : "rgba(154,181,189,.32)";
        return (
          <div
            key={phase.label}
            style={{
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${color}`,
              background: active ? `${color}15` : "rgba(6,23,39,.35)",
              boxShadow: active ? `0 0 10px ${color}35` : undefined,
            }}
          >
            <PixelText size={9} spacing={1.2} align="center" color={color}>
              {complete ? "■" : String(index + 1).padStart(2, "0")} {phase.label}
            </PixelText>
          </div>
        );
      })}
    </div>
  );
};

const FooterProgress: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly backupProgress: number;
  readonly restoreProgress: number;
}> = ({ frame, time, backupProgress, restoreProgress }) => {
  const incident = frame >= 300 && frame < 430;
  const restore = frame >= 430;
  const progress = restore ? restoreProgress : backupProgress;
  const visiblePercent =
    progress >= 1 ? 100 : Math.min(99, Math.floor(progress * 100));
  const status =
    frame < 48
      ? "MOUNTING BACKUP MEDIA"
      : frame < 252
        ? "COPYING FILES TO BACKUP"
        : frame < 300
          ? "RESTORE POINT CREATED"
          : frame < 430
            ? "SYSTEM CORRUPTION DETECTED"
            : frame < 520
              ? "SELECTING CLEAN RESTORE POINT"
              : frame < 748
                ? "RESTORING SYSTEM SECTORS"
                : frame < 804
                  ? "VERIFYING FILESYSTEM"
                  : "SYSTEM RESTORED";
  const color = incident
    ? COLORS.coral
    : frame >= 430
      ? COLORS.mint
      : frame >= 252
        ? COLORS.amber
        : COLORS.cyan;
  const filled =
    progress >= 1 ? 24 : Math.min(23, Math.floor(progress * 24));

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        right: 28,
        bottom: 12,
        height: 55,
        padding: "8px 13px",
        boxSizing: "border-box",
        border: `1px solid ${color}55`,
        background: "rgba(3,16,29,.82)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 8,
              height: 8,
              background: color,
              boxShadow: `0 0 9px ${color}`,
            }}
          />
          <PixelText size={10} spacing={1.25} color={color}>
            {status}
          </PixelText>
        </div>
        <PixelText size={18} spacing={0.8} align="right" color={COLORS.cyanSoft}>
          {incident ? "ERR" : `${String(visiblePercent).padStart(3, "0")}%`}
        </PixelText>
      </div>
      <div
        style={{
          marginTop: 5,
          height: 9,
          display: "grid",
          gridTemplateColumns: "repeat(24, 1fr)",
          gap: 4,
        }}
      >
        {Array.from({ length: 24 }, (_, index) => {
          const active = incident ? index % 3 !== 1 : index < filled;
          const latest = active && !incident && index === filled - 1;
          return (
            <div
              key={`footer-segment-${index}`}
              style={{
                background: active ? color : "rgba(92,119,125,.18)",
                border: `1px solid ${
                  active ? "rgba(226,255,251,.52)" : "rgba(92,119,125,.2)"
                }`,
                opacity:
                  incident && index % 2 === 0
                    ? 0.45 + 0.55 * Math.sin(time * 12 + index) ** 2
                    : 1,
                boxShadow: latest ? `0 0 9px ${color}` : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const IncidentOverlay: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const opacity =
    segment(frame, 302, 320, Easing.out(Easing.cubic)) *
    (1 - segment(frame, 412, 432, Easing.in(Easing.cubic)));
  const reveal = Math.floor(segment(frame, 322, 350) * 28);
  const glitch = Math.sin(frame * 2.7) * (frame < 390 ? 2.5 : 0.8);

  return (
    <AbsoluteFill
      style={{
        opacity,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 45%, rgba(108,12,37,.66), rgba(42,3,18,.86))",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.27,
          transform: `translateY(${modulo(time * 31, 7)}px)`,
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,179,190,.3) 0px, rgba(255,179,190,.3) 1px, transparent 1px, transparent 7px)",
        }}
      />
      {Array.from({ length: 11 }, (_, index) => (
        <div
          key={`incident-glitch-${index}`}
          style={{
            position: "absolute",
            left: -20 + hash01(index * 12) * 900,
            top: 35 + index * 49 + Math.sin(time * 8 + index) * 13,
            width: 190 + hash01(index * 22) * 570,
            height: 3 + (index % 3) * 3,
            opacity: 0.2 + Math.sin(time * 13 + index * 0.6) ** 2 * 0.5,
            background:
              index % 3 === 0 ? COLORS.amber : "rgba(255,89,109,.9)",
            transform: `translateX(${glitch * (index % 2 === 0 ? 1 : -1)}px)`,
            boxShadow: "0 0 11px rgba(255,89,109,.62)",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 251,
          width: 690,
          minHeight: 196,
          transform: `translate(-50%, -50%) translateX(${glitch}px)`,
          padding: "23px 28px",
          boxSizing: "border-box",
          background: "linear-gradient(145deg, #68142d, #2d0819)",
          border: "4px solid #ff91a0",
          boxShadow:
            "inset 3px 3px rgba(255,205,213,.19), inset -4px -4px rgba(25,0,9,.55), 0 0 42px rgba(255,89,109,.58)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 19,
          }}
        >
          <div
            style={{
              width: 62,
              height: 62,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #ffe1e6",
              background: COLORS.red,
              boxShadow: "0 0 22px rgba(255,89,109,.8)",
            }}
          >
            <PixelText size={42} spacing={0} align="center" color="#fff0f3">
              !
            </PixelText>
          </div>
          <div>
            <PixelText size={25} spacing={2.1} color="#fff0f3">
              {"SYSTEM CORRUPTION DETECTED".slice(0, reveal)}
            </PixelText>
            <PixelText
              size={12}
              spacing={1.55}
              color="rgba(255,213,219,.78)"
              style={{ marginTop: 13 }}
            >
              READ ERROR // PRIMARY DISK // CODE 0x7E
            </PixelText>
          </div>
        </div>
        <div
          style={{
            height: 2,
            margin: "20px 0 15px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,225,230,.65), transparent)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <PixelText size={12} spacing={1.2} color={COLORS.amber}>
            18 SECTORS UNREADABLE
          </PixelText>
          <PixelText size={12} spacing={1.2} color="#ffe4e8">
            RECOVERY REQUIRED
          </PixelText>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const WorkScreen: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly backupProgress: number;
  readonly restoreProgress: number;
}> = ({ frame, time, backupProgress, restoreProgress }) => {
  const workOpacity =
    frame < 770 ? 1 : 1 - segment(frame, 770, 786, Easing.in(Easing.cubic));
  const incidentTint =
    segment(frame, 300, 320) * (1 - segment(frame, 428, 464));

  return (
    <AbsoluteFill
      style={{
        opacity: workOpacity,
        overflow: "hidden",
        background: interpolateColors(
          incidentTint,
          [0, 1],
          [COLORS.screen, "#2f091b"],
        ),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 46,
          display: "flex",
          alignItems: "center",
          padding: "0 15px",
          boxSizing: "border-box",
          background: interpolateColors(
            incidentTint,
            [0, 1],
            ["#17266e", "#8c1735"],
          ),
          borderBottom: `3px solid ${
            incidentTint > 0.3 ? "#ff91a0" : "#4e66dc"
          }`,
          boxShadow: "inset 0 2px rgba(255,255,255,.14)",
        }}
      >
        <div
          style={{
            width: 23,
            height: 23,
            marginRight: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: incidentTint > 0.3 ? COLORS.coral : COLORS.cyan,
            border: "2px solid rgba(240,255,253,.8)",
            boxShadow: `0 0 10px ${
              incidentTint > 0.3
                ? "rgba(255,89,109,.7)"
                : "rgba(84,242,229,.65)"
            }`,
          }}
        >
          <PixelText size={13} spacing={0} align="center" color="#132459">
            ↺
          </PixelText>
        </div>
        <PixelText size={14} spacing={1.7} color={COLORS.shellLight}>
          RETROSAFE BACKUP &amp; RECOVERY CONSOLE
        </PixelText>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {["_", "□", "×"].map((glyph, index) => (
            <div
              key={glyph}
              style={{
                width: 27,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.shellLight,
                background:
                  index === 2 ? "rgba(217,31,69,.8)" : "rgba(231,241,237,.1)",
                border: "1px solid rgba(245,255,252,.38)",
                fontFamily: "Arial, sans-serif",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              {glyph}
            </div>
          ))}
        </div>
      </div>

      <PhaseRail frame={frame} />
      <SectorMap frame={frame} time={time} restoreProgress={restoreProgress} />
      <FilePipeline
        frame={frame}
        time={time}
        backupProgress={backupProgress}
        restoreProgress={restoreProgress}
      />
      <BackupPanel
        frame={frame}
        time={time}
        backupProgress={backupProgress}
        restoreProgress={restoreProgress}
      />
      <RestoreTimeline frame={frame} time={time} />
      <FooterProgress
        frame={frame}
        time={time}
        backupProgress={backupProgress}
        restoreProgress={restoreProgress}
      />
      <IncidentOverlay frame={frame} time={time} />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.09,
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(196,255,247,.16) 0px, rgba(196,255,247,.16) 1px, transparent 1px, transparent 5px)",
          transform: `translateY(${modulo(time * 15, 5)}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const SuccessScreen: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const opacity = segment(frame, 792, 810, Easing.out(Easing.cubic));
  const icon = segment(frame, 796, 824, Easing.out(Easing.back(1.35)));
  const headline = segment(frame, 804, 832, Easing.out(Easing.cubic));
  const stats = segment(frame, 816, 844, Easing.out(Easing.cubic));
  const ring = time * 18;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.85);

  return (
    <AbsoluteFill
      style={{
        opacity,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 42%, rgba(24,116,88,.94), rgba(4,31,38,.98) 66%, #03121e 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.17,
          backgroundImage:
            "linear-gradient(rgba(138,255,210,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(138,255,210,.18) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          backgroundPosition: `${modulo(time * 8, 44)}px ${modulo(time * 4, 44)}px`,
          maskImage:
            "radial-gradient(circle at 50% 48%, #000 0%, rgba(0,0,0,.7) 55%, transparent 90%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 206,
          width: 194,
          height: 194,
          transform: `translate(-50%, -50%) scale(${0.72 + icon * 0.28})`,
          opacity: icon,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed rgba(98,242,175,.76)",
            borderRadius: "50%",
            transform: `rotate(${ring}deg)`,
            boxShadow: "0 0 30px rgba(98,242,175,.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(216,255,234,.38)",
            borderRadius: "50%",
            transform: `rotate(${-ring * 0.66}deg)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 48,
            top: 48,
            width: 98,
            height: 98,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(45deg)",
            background:
              "linear-gradient(145deg, rgba(216,255,234,.98), rgba(98,242,175,.88))",
            border: "4px solid #edfff5",
            boxShadow: `0 0 ${25 + pulse * 20}px rgba(98,242,175,.7)`,
          }}
        >
          <div style={{ transform: "rotate(-45deg)" }}>
            <CheckGlyph size={64} color="#126346" stroke={4} />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 322,
          opacity: headline,
          transform: `translateY(${18 * (1 - headline)}px)`,
        }}
      >
        <PixelText
          size={50}
          spacing={5.4}
          align="center"
          color={COLORS.mintSoft}
          style={{
            textShadow:
              "0 0 13px rgba(98,242,175,.82), 0 0 34px rgba(98,242,175,.38)",
          }}
        >
          SYSTEM RESTORED
        </PixelText>
        <PixelText
          size={14}
          spacing={2.8}
          align="center"
          color="rgba(216,255,234,.74)"
          style={{ marginTop: 16 }}
        >
          RESTORE POINT 09:05 // FILESYSTEM ONLINE
        </PixelText>
      </div>

      <div
        style={{
          position: "absolute",
          left: 188,
          right: 188,
          top: 438,
          height: 84,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          opacity: stats,
          transform: `translateY(${14 * (1 - stats)}px)`,
        }}
      >
        {[
          ["SECTORS", "48 / 48", "RECOVERED"],
          ["CHECKSUM", "A8F2", "VERIFIED"],
          ["SYSTEM", "100%", "HEALTHY"],
        ].map(([label, value, status]) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              border: "1px solid rgba(98,242,175,.46)",
              background:
                "linear-gradient(145deg, rgba(98,242,175,.12), rgba(5,39,42,.7))",
              boxShadow: "inset 1px 1px rgba(222,255,237,.13)",
            }}
          >
            <CheckGlyph size={26} color={COLORS.mint} stroke={3} />
            <div>
              <PixelText size={9} spacing={1.2} color="rgba(195,236,216,.58)">
                {label}
              </PixelText>
              <PixelText
                size={17}
                spacing={1.2}
                color={COLORS.mintSoft}
                style={{ marginTop: 4 }}
              >
                {value}
              </PixelText>
              <PixelText
                size={8}
                spacing={1.1}
                color={COLORS.mint}
                style={{ marginTop: 3 }}
              >
                {status}
              </PixelText>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 551,
          width: 250,
          height: 46,
          transform: `translateX(-50%) scale(${0.9 + stats * 0.1})`,
          opacity: stats,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 11,
          border: "2px solid rgba(225,255,239,.72)",
          background:
            "linear-gradient(180deg, rgba(98,242,175,.38), rgba(17,111,78,.52))",
          boxShadow: "0 0 20px rgba(98,242,175,.25)",
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            background: COLORS.mintSoft,
            boxShadow: "0 0 9px rgba(216,255,234,.9)",
          }}
        />
        <PixelText size={12} spacing={1.6} color={COLORS.mintSoft}>
          SAFE TO RESTART
        </PixelText>
      </div>

      <AbsoluteFill
        style={{
          opacity: 0.1,
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(201,255,226,.18) 0px, rgba(201,255,226,.18) 1px, transparent 1px, transparent 5px)",
          transform: `translateY(${modulo(time * 13, 5)}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const ComputerShell: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly backupProgress: number;
  readonly restoreProgress: number;
}> = ({ frame, time, backupProgress, restoreProgress }) => {
  const entrance = segment(frame, 0, 44, Easing.out(Easing.back(1.15)));
  const incidentPush =
    segment(frame, 300, 345, Easing.inOut(Easing.cubic)) *
    (1 - segment(frame, 430, 590, Easing.inOut(Easing.cubic)));
  const endingPull = segment(frame, 792, 899, Easing.inOut(Easing.cubic));
  const incidentShake =
    frame >= 318 && frame < 410
      ? Math.sin(frame * 2.4) * (1 - segment(frame, 382, 410)) * 2.2
      : 0;
  const scale =
    (0.92 + entrance * 0.08) * (1 + incidentPush * 0.055 - endingPull * 0.018);
  const screenFlicker =
    frame >= 300 && frame < 420
      ? 0.92 + 0.08 * Math.sin(frame * 1.9) ** 2
      : 1;
  const powerColor = frame >= 804 ? COLORS.mint : COLORS.cyan;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 1500,
        height: 900,
        opacity: segment(frame, 0, 28),
        transform: `translate(-50%, -50%) translateX(${incidentShake}px) translateY(${
          22 * (1 - entrance) + endingPull * 5
        }px) scale(${scale})`,
        transformOrigin: "50% 49%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 22,
          top: 16,
          width: 1456,
          height: 756,
          borderRadius: 30,
          background:
            "linear-gradient(145deg, #fcfdef 0%, #dfe6d6 45%, #aebdb0 100%)",
          border: "5px solid #647873",
          boxShadow:
            "inset 6px 6px rgba(255,255,255,.88), inset -8px -8px rgba(65,84,79,.3), 0 45px 70px rgba(0,10,25,.48)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 54,
            top: 47,
            width: 1340,
            height: 640,
            overflow: "hidden",
            borderRadius: "28px 28px 34px 34px / 22px 22px 42px 42px",
            background: COLORS.black,
            border: "12px solid #334944",
            boxShadow:
              "inset 0 0 38px rgba(0,0,0,.9), inset 0 0 0 4px rgba(221,235,222,.34), 0 0 0 3px #788b84",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: screenFlicker,
              overflow: "hidden",
            }}
          >
            <WorkScreen
              frame={frame}
              time={time}
              backupProgress={backupProgress}
              restoreProgress={restoreProgress}
            />
            <SuccessScreen frame={frame} time={time} />
          </div>

          <AbsoluteFill
            style={{
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(0,4,9,.34) 88%, rgba(0,2,7,.7) 100%)",
              boxShadow: "inset 0 0 36px rgba(0,0,0,.68)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 92,
              top: 22,
              width: 720,
              height: 85,
              borderRadius: "50%",
              transform: "rotate(-4deg)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.13), transparent)",
              filter: "blur(9px)",
              pointerEvents: "none",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 17,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: powerColor,
              boxShadow: `0 0 ${10 + Math.sin(time * 4) * 3}px ${powerColor}`,
            }}
          />
          <PixelText size={10} spacing={1.5} color={COLORS.inkSoft}>
            POWER
          </PixelText>
        </div>

        <div
          style={{
            position: "absolute",
            left: 62,
            bottom: 19,
            display: "flex",
            gap: 7,
          }}
        >
          {Array.from({ length: 16 }, (_, index) => (
            <div
              key={`vent-${index}`}
              style={{
                width: 3,
                height: 14,
                background: "rgba(66,85,80,.46)",
                boxShadow: "1px 0 rgba(255,255,255,.45)",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 142,
          top: 742,
          width: 1216,
          height: 132,
          transform: "perspective(650px) rotateX(55deg)",
          transformOrigin: "50% 0%",
          borderRadius: "12px 12px 34px 34px",
          background:
            "linear-gradient(180deg, #eef2e4, #b5c2b5 66%, #71837e)",
          border: "4px solid #627772",
          boxShadow:
            "inset 4px 4px rgba(255,255,255,.75), inset -5px -6px rgba(57,76,71,.28), 0 25px 35px rgba(0,11,24,.4)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 55,
            right: 55,
            top: 25,
            height: 70,
            display: "grid",
            gridTemplateColumns: "repeat(18, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: 7,
          }}
        >
          {Array.from({ length: 54 }, (_, index) => (
            <div
              key={`keyboard-key-${index}`}
              style={{
                borderRadius: 2,
                background:
                  index === 47
                    ? "linear-gradient(180deg, #80e7d7, #3a9e96)"
                    : "linear-gradient(180deg, #f7f9ec, #aebbae)",
                border: "1px solid rgba(77,96,91,.66)",
                boxShadow:
                  "inset 1px 1px rgba(255,255,255,.8), 0 2px rgba(58,77,72,.24)",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 380,
          top: 862,
          width: 740,
          height: 18,
          borderRadius: "50%",
          background: "rgba(0,8,20,.44)",
          filter: "blur(17px)",
        }}
      />
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const backupProgress = getBackupProgress(frame);
  const restoreProgress = getRestoreProgress(frame);

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        background: COLORS.deep,
      }}
    >
      <AmbientBackground frame={frame} time={time} />
      <ComputerShell
        frame={frame}
        time={time}
        backupProgress={backupProgress}
        restoreProgress={restoreProgress}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.05,
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(208,255,247,.2) 0px, rgba(208,255,247,.2) 1px, transparent 1px, transparent 4px)",
          transform: `translateY(${modulo(time * 12, 4)}px)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
