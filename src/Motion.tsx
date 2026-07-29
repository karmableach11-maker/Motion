import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const DESIGN_FRAMES = 900;
const TAU = Math.PI * 2;
const MONO = "'Courier New', Courier, monospace";

const COLORS = {
  desktopDeep: "#033f50",
  desktop: "#087b7c",
  desktopLight: "#16a39c",
  navyDeep: "#080c38",
  navy: "#151a62",
  cobalt: "#303bd9",
  cyan: "#46f4e7",
  cyanSoft: "#b0fff8",
  warning: "#ffd166",
  threat: "#ff526f",
  threatDeep: "#a8173d",
  mint: "#72ffc0",
  mintDeep: "#24b986",
  panelLight: "#f4f7ef",
  panel: "#dce5dc",
  panelMid: "#bdcbc3",
  panelDark: "#718983",
  ink: "#101b20",
  inkSoft: "#40575a",
};

const FILE_PATHS = [
  "SYS://CORE/BOOT_MAP.BIN",
  "SYS://DRIVERS/INPUT_07.SYS",
  "USR://DOCS/REPORT_18.PDF",
  "USR://MEDIA/FRAME_204.DAT",
  "APP://CACHE/INDEX_A4.DB",
  "NET://PACKETS/ROUTE_08.LOG",
  "SYS://LIB/GRAPHICS_32.MOD",
  "USR://ARCHIVE/BACKUP_06.ZIP",
  "APP://TEMP/SESSION_44.TMP",
  "SYS://CORE/MEMORY_MAP.BIN",
  "NET://CACHE/HEADER_71.DAT",
  "USR://PROJECT/ASSET_16.RAW",
] as const;

const THREAT_PATH = "SYS://CACHE/ARCHIVE_042.DAT";

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

const layerOpacity = (frame: number, start: number, end: number, fade = 12) =>
  segment(frame, start, start + fade, Easing.out(Easing.cubic)) *
  (1 - segment(frame, end - fade, end, Easing.in(Easing.cubic)));

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 91.731 + 18.177) * 47453.5453;
  return value - Math.floor(value);
};

const PARTICLES = Array.from({ length: 64 }, (_, index) => ({
  x: hash01(index * 11 + 4) * DESIGN_WIDTH,
  y: hash01(index * 17 + 8) * DESIGN_HEIGHT,
  size: 2 + Math.floor(hash01(index * 19 + 3) * 6),
  phase: hash01(index * 23 + 9),
  speed: 7 + hash01(index * 29 + 1) * 17,
  opacity: 0.07 + hash01(index * 31 + 2) * 0.22,
}));

const RADAR_NODES = Array.from({ length: 14 }, (_, index) => ({
  angle: (index / 14) * TAU + hash01(index + 230) * 0.2,
  radius: 58 + hash01(index + 260) * 92,
  size: 3 + hash01(index + 290) * 4,
  phase: hash01(index + 320) * TAU,
}));

const PIXEL_VIRUS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [-2, -2],
  [2, -2],
  [-2, 2],
  [2, 2],
] as const;

const CornerBracket: React.FC<{
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  flipX?: boolean;
  flipY?: boolean;
  opacity: number;
}> = ({ left, right, top, bottom, flipX = false, flipY = false, opacity }) => (
  <div
    style={{
      position: "absolute",
      left,
      right,
      top,
      bottom,
      width: 126,
      height: 126,
      opacity,
      transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 82,
        height: 4,
        background: COLORS.cyan,
        boxShadow: "0 0 15px rgba(70,244,231,.45)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 4,
        height: 82,
        background: COLORS.cyan,
        boxShadow: "0 0 15px rgba(70,244,231,.45)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 21,
        top: 21,
        width: 13,
        height: 13,
        border: "3px solid rgba(176,255,248,.72)",
      }}
    />
  </div>
);

const AmbientDesktop: React.FC<{
  frame: number;
  time: number;
}> = ({ frame, time }) => {
  const gridX = modulo(time * 11, 64);
  const gridY = modulo(time * 5.5, 64);
  const scanY = modulo(time * 126, DESIGN_HEIGHT + 260) - 130;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.2);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 44%, #159d98 0%, #087b7c 38%, #055f6c 70%, #023b4d 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(rgba(150,255,247,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(150,255,247,.16) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage:
            "radial-gradient(circle at 50% 48%, #000 0%, rgba(0,0,0,.82) 48%, transparent 86%)",
        }}
      />

      <svg
        width={DESIGN_WIDTH}
        height={DESIGN_HEIGHT}
        viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <g
          transform={`rotate(${time * 1.6} 960 530)`}
          opacity={0.12 + pulse * 0.05}
          fill="none"
          stroke="rgba(172,255,248,.7)"
        >
          <circle cx="960" cy="530" r="440" strokeDasharray="4 26 90 34" />
          <circle cx="960" cy="530" r="520" strokeDasharray="2 22 68 38" />
          <circle cx="960" cy="530" r="606" strokeDasharray="1 18 44 30" />
        </g>
        <g opacity="0.12" stroke="rgba(179,255,249,.6)">
          <path d="M0 870 L960 590 L1920 870" fill="none" />
          <path d="M0 960 L960 620 L1920 960" fill="none" />
          <path d="M160 1080 L960 650 L1760 1080" fill="none" />
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          width: 1460,
          height: 410,
          transform: `translate(-50%, -50%) rotate(${-6 + Math.sin(time * 0.2) * 1.1}deg)`,
          opacity: 0.14,
          background:
            "linear-gradient(90deg, transparent, rgba(90,255,239,.42), transparent)",
          filter: "blur(44px)",
        }}
      />

      {PARTICLES.map((particle, index) => {
        const y =
          modulo(
            particle.y + time * particle.speed + particle.phase * DESIGN_HEIGHT,
            DESIGN_HEIGHT + 90,
          ) - 45;
        const flicker =
          0.35 +
          0.65 *
            Math.sin(
              (time * (0.18 + (index % 6) * 0.021) + particle.phase) * TAU,
            ) **
              2;
        return (
          <div
            key={`ambient-pixel-${index}`}
            style={{
              position: "absolute",
              left: particle.x,
              top: y,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity * flicker,
              background:
                index % 8 === 0 ? COLORS.cyanSoft : "rgba(87,255,240,.88)",
              boxShadow:
                index % 8 === 0 ? "0 0 14px rgba(104,255,241,.82)" : undefined,
            }}
          />
        );
      })}

      <CornerBracket left={76} top={68} opacity={0.24 + pulse * 0.12} />
      <CornerBracket
        right={76}
        bottom={68}
        flipX
        flipY
        opacity={0.2 + (1 - pulse) * 0.12}
      />

      <div
        style={{
          position: "absolute",
          left: 88,
          bottom: 72,
          display: "flex",
          alignItems: "center",
          gap: 13,
          color: "rgba(207,255,251,.58)",
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 2.5,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            background: COLORS.cyan,
            boxShadow: "0 0 12px rgba(70,244,231,.8)",
          }}
        />
        SECURE DESKTOP // NODE 08
      </div>

      <div
        style={{
          position: "absolute",
          right: 88,
          top: 73,
          color: "rgba(207,255,251,.5)",
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 2.2,
          lineHeight: 1.75,
          textAlign: "right",
        }}
      >
        ENGINE ONLINE
        <br />
        CYCLE {String(Math.floor(frame)).padStart(3, "0")}
      </div>

      <div
        style={{
          position: "absolute",
          left: -230,
          top: scanY,
          width: 2400,
          height: 150,
          transform: "rotate(-4deg)",
          opacity: 0.13,
          background:
            "linear-gradient(180deg, transparent, rgba(186,255,249,.72), transparent)",
          filter: "blur(24px)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 43%, rgba(1,30,42,.18) 72%, rgba(1,19,34,.66) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const WindowControl: React.FC<{
  children: React.ReactNode;
  danger?: boolean;
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
        ? "linear-gradient(180deg, #ff788b, #bd3658)"
        : "rgba(230,241,234,.12)",
      border: "1px solid rgba(239,255,251,.38)",
      boxShadow: "inset 1px 1px rgba(255,255,255,.24)",
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
  children: React.ReactNode;
  active?: boolean;
  accent?: string;
}> = ({ children, active = false, accent = COLORS.cobalt }) => (
  <div
    style={{
      minWidth: 142,
      height: 48,
      padding: "0 22px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: active ? COLORS.panelLight : COLORS.ink,
      background: active
        ? `linear-gradient(180deg, ${accent}, ${accent}cc)`
        : `linear-gradient(180deg, ${COLORS.panelLight}, ${COLORS.panelMid})`,
      border: `2px solid ${active ? "rgba(255,255,255,.64)" : COLORS.panelDark}`,
      boxShadow: active
        ? `inset 2px 2px rgba(255,255,255,.25), 0 0 18px ${accent}66`
        : "inset 3px 3px rgba(255,255,255,.9), inset -3px -3px rgba(69,88,84,.28), 4px 4px 0 rgba(42,67,65,.16)",
      fontFamily: MONO,
      fontSize: 14,
      fontWeight: 900,
      letterSpacing: 1.4,
    }}
  >
    {children}
  </div>
);

const StatusHeadline: React.FC<{
  frame: number;
  accent: string;
  percentage: number;
}> = ({ frame, accent, percentage }) => {
  const items = [
    {
      text: "SCANNING FILES",
      sub: "HEURISTIC ANALYSIS IN PROGRESS",
      color: COLORS.cyan,
      opacity: layerOpacity(frame, 38, 268, 12),
    },
    {
      text: "THREAT DETECTED",
      sub: "SIGNATURE MATCH // ACTION REQUIRED",
      color: COLORS.threat,
      opacity: layerOpacity(frame, 267, 356, 12),
    },
    {
      text: "MOVING TO QUARANTINE",
      sub: "ISOLATING INFECTED FILE",
      color: COLORS.warning,
      opacity: layerOpacity(frame, 355, 496, 12),
    },
    {
      text: "QUARANTINED",
      sub: "THREAT CONTAINED // RESUMING SCAN",
      color: COLORS.warning,
      opacity: layerOpacity(frame, 495, 540, 10),
    },
    {
      text: "SCANNING FILES",
      sub: "FINAL SECTORS // DEEP MEMORY",
      color: COLORS.cyan,
      opacity: layerOpacity(frame, 539, 686, 12),
    },
    {
      text: "VERIFYING SIGNATURES",
      sub: "MEMORY CHECK // CRC VALIDATION",
      color: COLORS.mint,
      opacity: layerOpacity(frame, 685, 746, 12),
    },
    {
      text: "THREAT REMOVED",
      sub: "SYSTEM SECURE // MONITORING ACTIVE",
      color: COLORS.mint,
      opacity: segment(frame, 745, 766, Easing.out(Easing.cubic)),
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 42,
        right: 42,
        top: 84,
        height: 50,
      }}
    >
      {items.map((item, index) => (
        <div
          key={`${item.text}-${index}`}
          style={{
            position: "absolute",
            inset: 0,
            opacity: item.opacity,
            display: "flex",
            alignItems: "center",
            transform: `translateX(${mix(8, 0, item.opacity)}px)`,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              marginRight: 15,
              background: item.color,
              boxShadow: `0 0 14px ${item.color}`,
            }}
          />
          <div>
            <div
              style={{
                color: COLORS.ink,
                fontFamily: MONO,
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: 1.8,
                lineHeight: 1,
              }}
            >
              {item.text}
            </div>
            <div
              style={{
                marginTop: 6,
                color: COLORS.inkSoft,
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.8,
              }}
            >
              {item.sub}
            </div>
          </div>
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          right: 0,
          top: -2,
          display: "flex",
          alignItems: "baseline",
          color: accent,
          fontFamily: MONO,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 14px ${accent}66`,
        }}
      >
        <span style={{ fontSize: 39, letterSpacing: 1 }}>
          {String(percentage).padStart(3, "0")}
        </span>
        <span style={{ marginLeft: 4, fontSize: 18 }}>%</span>
      </div>
    </div>
  );
};

const FileTerminal: React.FC<{
  frame: number;
  time: number;
  scannedFiles: number;
  danger: number;
  success: number;
}> = ({ frame, time, scannedFiles, danger, success }) => {
  const frozen = frame >= 270 && frame < 540;
  const displayStart = Math.max(0, scannedFiles - 5);
  const rows = Array.from({ length: 6 }, (_, row) => {
    const absoluteIndex = displayStart + row;
    return {
      row,
      index: absoluteIndex,
      path:
        frozen && row === 5
          ? THREAT_PATH
          : FILE_PATHS[modulo(absoluteIndex, FILE_PATHS.length)],
    };
  });
  const scannerActive =
    (layerOpacity(frame, 54, 278, 12) + layerOpacity(frame, 532, 704, 12)) *
    (1 - success);
  const scannerY = 58 + modulo(time * 0.53, 1) * 268;
  const cursorPulse = Math.floor(time * 2.4) % 2;
  const warningPulse = 0.58 + Math.sin(time * TAU * 2.1) * 0.22;

  return (
    <div
      style={{
        position: "absolute",
        left: 42,
        top: 145,
        width: 790,
        height: 390,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(7,13,56,.98), rgba(5,18,45,.98))",
        border: `3px solid ${COLORS.panelDark}`,
        boxShadow:
          "inset 4px 4px rgba(0,0,0,.4), inset -3px -3px rgba(255,255,255,.12)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 3,
          right: 3,
          top: 3,
          height: 43,
          display: "flex",
          alignItems: "center",
          padding: "0 15px",
          boxSizing: "border-box",
          color: "rgba(190,255,249,.76)",
          background: "rgba(39,54,145,.32)",
          borderBottom: "1px solid rgba(113,175,224,.22)",
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.7,
        }}
      >
        SCAN LOG // VOLUME C
        <span style={{ marginLeft: "auto", color: "rgba(190,255,249,.42)" }}>
          FILE {String(scannedFiles).padStart(3, "0")} / 128
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          inset: "50px 10px 8px",
          opacity: 1 - segment(frame, 733, 745, Easing.in(Easing.cubic)),
        }}
      >
        {rows.map((item) => {
          const infected = frozen && item.row === 5;
          const current = infected || (!frozen && item.index === scannedFiles);
          const queued = !frozen && item.index > scannedFiles;
          const rowColor = infected
            ? COLORS.threat
            : current
              ? COLORS.cyanSoft
              : queued
                ? "rgba(154,224,220,.3)"
                : "rgba(154,224,220,.52)";
          const status =
            infected && frame < 492
              ? "MATCH"
              : infected
                ? "LOCKED"
                : current
                  ? "SCAN"
                  : queued
                    ? "WAIT"
                    : "OK";

          return (
            <div
              key={`file-row-${item.row}`}
              style={{
                position: "absolute",
                left: 8,
                right: 8,
                top: item.row * 46,
                height: 39,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                boxSizing: "border-box",
                color: rowColor,
                opacity: current ? 1 : queued ? 0.46 : 0.78,
                background: infected
                  ? `rgba(255,82,111,${0.1 + danger * 0.12})`
                  : current
                    ? "rgba(70,244,231,.075)"
                    : item.row % 2 === 0
                      ? "rgba(120,198,215,.025)"
                      : "transparent",
                borderLeft: current
                  ? `3px solid ${infected ? COLORS.threat : COLORS.cyan}`
                  : "3px solid transparent",
                fontFamily: MONO,
                fontSize: 17,
                fontWeight: current ? 900 : 700,
                letterSpacing: 0.9,
                textShadow: current ? `0 0 9px ${rowColor}44` : undefined,
              }}
            >
              <span
                style={{
                  width: 38,
                  color: infected ? COLORS.warning : "rgba(159,224,224,.38)",
                  fontSize: 12,
                }}
              >
                {String(item.index).padStart(3, "0")}
              </span>
              <span
                style={{
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.path}
                {current && !infected && cursorPulse ? " _" : ""}
              </span>
              <span
                style={{
                  minWidth: 66,
                  textAlign: "right",
                  color: infected
                    ? COLORS.threat
                    : current
                      ? COLORS.cyan
                      : COLORS.mint,
                  fontSize: 12,
                  letterSpacing: 1.4,
                }}
              >
                {status}
              </span>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scannerY,
            height: 2,
            opacity: scannerActive * 0.8,
            background:
              "linear-gradient(90deg, transparent, #d3fffb 16%, #46f4e7 70%, transparent)",
            boxShadow:
              "0 0 9px rgba(70,244,231,.9), 0 0 24px rgba(70,244,231,.48)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 2,
            height: 35,
            display: "flex",
            alignItems: "center",
            color: frozen ? COLORS.threat : "rgba(176,255,248,.56)",
            borderTop: `1px solid ${
              frozen ? "rgba(255,82,111,.35)" : "rgba(121,212,220,.18)"
            }`,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1.5,
          }}
        >
          {frozen ? "HEURISTIC.TROJAN.7F3A" : "SIGNATURE DB // CURRENT"}
          <span style={{ marginLeft: "auto" }}>
            {frozen ? "RISK: HIGH" : "ENGINE: ACTIVE"}
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          top: 50,
          bottom: 8,
          opacity: success,
          transform: `translateY(${mix(14, 0, success)}px)`,
          padding: "32px 34px",
          boxSizing: "border-box",
          background:
            "radial-gradient(circle at 18% 24%, rgba(62,255,190,.1), transparent 48%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            color: COLORS.mint,
            fontFamily: MONO,
            fontSize: 39,
            fontWeight: 900,
            letterSpacing: 2.1,
            textShadow: "0 0 18px rgba(114,255,192,.34)",
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              background: COLORS.mint,
              boxShadow: "0 0 18px rgba(114,255,192,.8)",
            }}
          />
          THREAT REMOVED
        </div>
        <div
          style={{
            marginTop: 13,
            color: "rgba(195,255,233,.72)",
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: 1.4,
          }}
        >
          1 INFECTED FILE QUARANTINED
        </div>

        <div
          style={{
            marginTop: 35,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {[
            ["128", "FILES SCANNED"],
            ["001", "THREAT FOUND"],
            ["001", "QUARANTINED"],
          ].map(([value, label]) => (
            <div
              key={label}
              style={{
                height: 95,
                padding: "17px 18px",
                boxSizing: "border-box",
                background: "rgba(65,239,176,.055)",
                border: "1px solid rgba(114,255,192,.2)",
                boxShadow: "inset 2px 2px rgba(255,255,255,.025)",
              }}
            >
              <div
                style={{
                  color: COLORS.mint,
                  fontFamily: MONO,
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: 1.4,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "rgba(185,239,224,.56)",
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: 1.25,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 25,
            display: "flex",
            alignItems: "center",
            gap: 11,
            color: "rgba(197,255,235,.66)",
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.6,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              background: warningPulse > 0.5 ? COLORS.mint : COLORS.mintDeep,
              boxShadow: "0 0 12px rgba(114,255,192,.75)",
            }}
          />
          REAL-TIME PROTECTION REMAINS ACTIVE
        </div>
      </div>
    </div>
  );
};

const SecurityScope: React.FC<{
  frame: number;
  time: number;
  danger: number;
  quarantine: number;
  success: number;
  accent: string;
}> = ({ frame, time, danger, quarantine, success, accent }) => {
  const sweep = time * 78;
  const threatPulse = 0.55 + 0.45 * Math.sin(time * TAU * 1.9);
  const contained = frame >= 495 && frame < 540;
  const doorClose = segment(frame, 484, 522, Easing.out(Easing.cubic));
  const tokenOpacity =
    segment(frame, 364, 380) * (1 - segment(frame, 484, 510));
  const quarantineVisual =
    segment(frame, 350, 374) * (1 - segment(frame, 540, 590));
  const tokenPoint = (() => {
    if (quarantine < 0.58) {
      const local = quarantine / 0.58;
      return {
        x: mix(216, 334, local),
        y: 174,
      };
    }
    const local = (quarantine - 0.58) / 0.42;
    return {
      x: 334,
      y: mix(174, 274, local),
    };
  })();
  const scopeOpacity = 1 - success;
  const successPulse = 0.78 + 0.22 * Math.sin(time * TAU * 0.9);

  return (
    <div
      style={{
        position: "absolute",
        left: 856,
        top: 145,
        width: 442,
        height: 390,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(7,13,56,.98), rgba(5,18,45,.98))",
        border: `3px solid ${COLORS.panelDark}`,
        boxShadow:
          "inset 4px 4px rgba(0,0,0,.4), inset -3px -3px rgba(255,255,255,.12)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 3,
          right: 3,
          top: 3,
          height: 43,
          display: "flex",
          alignItems: "center",
          padding: "0 15px",
          boxSizing: "border-box",
          color: "rgba(190,255,249,.76)",
          background: "rgba(39,54,145,.32)",
          borderBottom: "1px solid rgba(113,175,224,.22)",
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.6,
        }}
      >
        SECTOR MAP // RAM:03
        <span style={{ marginLeft: "auto", color: accent }}>
          {success > 0.15
            ? "SECURE"
            : contained
              ? "CONTAINED"
              : danger > 0.25
                ? "ALERT"
                : "ACTIVE"}
        </span>
      </div>

      <svg
        width="436"
        height="338"
        viewBox="0 0 436 338"
        style={{ position: "absolute", left: 3, top: 47 }}
        aria-hidden
      >
        <defs>
          <radialGradient id="scope-vignette">
            <stop offset="0" stopColor="#163a59" stopOpacity=".32" />
            <stop offset=".72" stopColor="#071229" stopOpacity=".08" />
            <stop offset="1" stopColor="#020714" stopOpacity=".3" />
          </radialGradient>
          <linearGradient id="sweep-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={COLORS.cyan} stopOpacity=".03" />
            <stop offset="1" stopColor={COLORS.cyan} stopOpacity=".28" />
          </linearGradient>
          <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="436" height="338" fill="url(#scope-vignette)" />

        <g opacity={scopeOpacity}>
          <g
            transform={`translate(0 0) rotate(${sweep} 216 174)`}
            opacity={(1 - danger * 0.8) * (1 - quarantine * 0.55)}
          >
            <path
              d="M216 174 L216 26 A148 148 0 0 1 344 100 Z"
              fill="url(#sweep-gradient)"
            />
            <line
              x1="216"
              y1="174"
              x2="344"
              y2="100"
              stroke={COLORS.cyanSoft}
              strokeOpacity=".64"
              strokeWidth="1.5"
              filter="url(#soft-glow)"
            />
          </g>

          {[54, 93, 132, 157].map((radius, index) => (
            <circle
              key={`radar-ring-${radius}`}
              cx="216"
              cy="174"
              r={radius}
              fill="none"
              stroke={
                danger > 0.22 && index === 2
                  ? COLORS.threat
                  : "rgba(108,221,233,.25)"
              }
              strokeWidth={index === 3 ? 1.5 : 1}
              strokeDasharray={index % 2 ? "4 9" : undefined}
              opacity={0.56 + (index === 2 ? danger * threatPulse * 0.4 : 0)}
            />
          ))}

          {Array.from({ length: 12 }, (_, index) => {
            const angle = (index / 12) * TAU;
            return (
              <line
                key={`radial-${index}`}
                x1="216"
                y1="174"
                x2={216 + Math.cos(angle) * 157}
                y2={174 + Math.sin(angle) * 157}
                stroke="rgba(90,202,221,.14)"
                strokeWidth="1"
              />
            );
          })}

          {RADAR_NODES.map((node, index) => {
            const infected = index === 4 && danger > 0.05;
            const x = 216 + Math.cos(node.angle) * node.radius;
            const y = 174 + Math.sin(node.angle) * node.radius;
            const flicker =
              0.52 + 0.48 * Math.sin(time * 2.1 + node.phase) ** 2;
            return (
              <g key={`node-${index}`}>
                {infected ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={11 + danger * threatPulse * 8}
                    fill="none"
                    stroke={COLORS.threat}
                    strokeWidth="1.5"
                    opacity={danger * 0.62}
                  />
                ) : null}
                <rect
                  x={x - node.size}
                  y={y - node.size}
                  width={node.size * 2}
                  height={node.size * 2}
                  fill={infected ? COLORS.threat : COLORS.cyan}
                  opacity={infected ? danger : flicker * 0.72}
                  filter={infected ? "url(#soft-glow)" : undefined}
                />
              </g>
            );
          })}

          <g opacity={1 - danger}>
            <path
              d="M216 92 L282 116 V169 C282 220 253 253 216 270 C179 253 150 220 150 169 V116 Z"
              fill="rgba(48,59,217,.14)"
              stroke={COLORS.cyan}
              strokeWidth="4"
              strokeLinejoin="round"
              filter="url(#soft-glow)"
            />
            <path
              d="M181 174 L207 199 L253 145"
              fill="none"
              stroke={COLORS.cyanSoft}
              strokeWidth="8"
              strokeLinecap="square"
              strokeLinejoin="miter"
              opacity=".9"
            />
          </g>

          <g
            transform={`translate(216 174) rotate(${Math.sin(time * 4.3) * 3}) scale(${0.92 + threatPulse * 0.08})`}
            opacity={danger * (1 - quarantine * 0.9)}
          >
            {PIXEL_VIRUS.map(([x, y], index) => (
              <rect
                key={`virus-pixel-${index}`}
                x={x * 19 - 8}
                y={y * 19 - 8}
                width="16"
                height="16"
                fill={index % 4 === 0 ? COLORS.warning : COLORS.threat}
                filter="url(#soft-glow)"
              />
            ))}
            {[
              [-62, 0, -34, 0],
              [34, 0, 62, 0],
              [0, -62, 0, -34],
              [0, 34, 0, 62],
              [-48, -48, -29, -29],
              [48, -48, 29, -29],
              [-48, 48, -29, 29],
              [48, 48, 29, 29],
            ].map(([x1, y1, x2, y2], index) => (
              <line
                key={`virus-arm-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={COLORS.threat}
                strokeWidth="7"
                strokeLinecap="square"
              />
            ))}
            <rect x="-21" y="-10" width="12" height="12" fill="#071029" />
            <rect x="9" y="-10" width="12" height="12" fill="#071029" />
          </g>

          <path
            d="M216 174 H334 V274"
            fill="none"
            stroke={COLORS.warning}
            strokeWidth="3"
            strokeDasharray="7 8"
            opacity={quarantineVisual * (1 - success)}
          />

          {[0.1, 0.05, 0].map((trail, index) => {
            const trailProgress = clamp01(quarantine - trail);
            let x: number;
            let y: number;
            if (trailProgress < 0.58) {
              x = mix(216, 334, trailProgress / 0.58);
              y = 174;
            } else {
              x = 334;
              y = mix(174, 274, (trailProgress - 0.58) / 0.42);
            }
            return (
              <rect
                key={`token-trail-${index}`}
                x={x - 9}
                y={y - 9}
                width="18"
                height="18"
                fill={index === 2 ? COLORS.threat : COLORS.warning}
                opacity={tokenOpacity * (0.22 + index * 0.3)}
                filter="url(#soft-glow)"
              />
            );
          })}

          <g transform="translate(298 242)" opacity={quarantineVisual}>
            <rect
              width="72"
              height="72"
              fill="rgba(255,209,102,.08)"
              stroke={COLORS.warning}
              strokeWidth="3"
            />
            <rect
              x={7 + doorClose * 28}
              y="7"
              width={58 - doorClose * 28}
              height="58"
              fill="rgba(255,209,102,.13)"
              stroke="rgba(255,230,155,.52)"
            />
            <circle
              cx={52 - doorClose * 15}
              cy="36"
              r="4"
              fill={COLORS.warning}
            />
            <path d="M19 7V65M29 7V65M39 7V65" stroke="rgba(255,209,102,.16)" />
          </g>

          <rect
            x={tokenPoint.x - 11}
            y={tokenPoint.y - 11}
            width="22"
            height="22"
            fill={COLORS.threat}
            opacity={tokenOpacity}
            filter="url(#soft-glow)"
          />
        </g>

        <g opacity={success} transform={`translate(0 ${mix(10, 0, success)})`}>
          <circle
            cx="218"
            cy="168"
            r={112 + successPulse * 4}
            fill="rgba(53,226,167,.07)"
            stroke={COLORS.mint}
            strokeWidth="2"
            strokeDasharray="8 11"
            opacity=".55"
          />
          <circle
            cx="218"
            cy="168"
            r="87"
            fill="rgba(36,185,134,.08)"
            stroke="rgba(114,255,192,.36)"
          />
          <path
            d="M218 70 L302 100 V166 C302 227 265 267 218 288 C171 267 134 227 134 166 V100 Z"
            fill="rgba(36,185,134,.12)"
            stroke={COLORS.mint}
            strokeWidth="5"
            strokeLinejoin="round"
            filter="url(#soft-glow)"
          />
          <path
            d="M170 171 L204 204 L270 133"
            pathLength="1"
            fill="none"
            stroke={COLORS.cyanSoft}
            strokeWidth="11"
            strokeDasharray="1"
            strokeDashoffset={1 - success}
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <text
            x="218"
            y="322"
            textAnchor="middle"
            fill={COLORS.mint}
            fontFamily={MONO}
            fontSize="14"
            fontWeight="900"
            letterSpacing="2"
          >
            SYSTEM SECURE
          </text>
        </g>
      </svg>
    </div>
  );
};

const SegmentedProgress: React.FC<{
  activeCount: number;
  time: number;
  accent: string;
  complete: boolean;
}> = ({ activeCount, time, accent, complete }) => {
  const blocks = 20;
  const shine = modulo(time * 0.48, 1);

  return (
    <div
      style={{
        position: "absolute",
        left: 42,
        right: 42,
        top: 558,
        height: 80,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 58,
          padding: 8,
          boxSizing: "border-box",
          overflow: "hidden",
          background: "#98a69f",
          border: `3px solid ${COLORS.panelDark}`,
          boxShadow:
            "inset 4px 4px rgba(52,72,68,.42), inset -4px -4px rgba(255,255,255,.78)",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "grid",
            gridTemplateColumns: `repeat(${blocks}, 1fr)`,
            gap: 5,
          }}
        >
          {Array.from({ length: blocks }, (_, index) => {
            const active = index < activeCount;
            const newest = active && index === activeCount - 1 && !complete;
            const flash = newest ? 0.76 + Math.sin(time * TAU * 4) * 0.16 : 1;
            return (
              <div
                key={`scan-block-${index}`}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  opacity: active ? flash : 0.25,
                  background: active
                    ? complete
                      ? "linear-gradient(180deg, #c8ffe3, #72ffc0 48%, #24b986)"
                      : `linear-gradient(180deg, ${accent}dd, ${accent} 48%, ${accent}99)`
                    : "linear-gradient(180deg, #71827d, #5a6c67)",
                  border: active
                    ? "1px solid rgba(238,255,251,.72)"
                    : "1px solid rgba(31,52,49,.42)",
                  boxShadow: active
                    ? `0 0 10px ${accent}66, inset 2px 2px rgba(255,255,255,.32)`
                    : "inset 2px 2px rgba(255,255,255,.08)",
                }}
              >
                {active ? (
                  <div
                    style={{
                      position: "absolute",
                      left: -20,
                      top: -22,
                      width: 18,
                      height: 86,
                      transform: `translateX(${shine * 82}px) rotate(18deg)`,
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,.42), transparent)",
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
          color: "rgba(31,53,55,.62)",
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 1.45,
        }}
      >
        <span>MODE // DEEP SCAN</span>
        <span>SECTOR {String(activeCount).padStart(2, "0")} / 20</span>
        <span>CRC {complete ? "OK" : "SCAN"}</span>
      </div>
    </div>
  );
};

const DiagnosticPixels: React.FC<{
  time: number;
  progress: number;
  color: string;
}> = ({ time, progress, color }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(10, 9px)",
      gap: 5,
      opacity: 0.65,
    }}
  >
    {Array.from({ length: 30 }, (_, index) => {
      const lit =
        modulo(index + Math.floor(time * 7), 14) < 3 ||
        index < Math.floor(progress * 30);
      return (
        <div
          key={`diagnostic-${index}`}
          style={{
            width: 9,
            height: 5,
            background: lit ? color : "rgba(59,80,78,.2)",
            boxShadow: lit && index % 7 === 0 ? `0 0 8px ${color}` : undefined,
          }}
        />
      );
    })}
  </div>
);

const SecurityWindow: React.FC<{
  frame: number;
  time: number;
}> = ({ frame, time }) => {
  const enter = segment(frame, 0, 54, Easing.out(Easing.cubic));
  const scanOne = segment(frame, 60, 270, Easing.linear);
  const scanTwo = segment(frame, 540, 690, Easing.linear);
  const quarantine = segment(frame, 366, 496, Easing.inOut(Easing.cubic));
  const danger =
    segment(frame, 266, 302, Easing.out(Easing.cubic)) *
    (1 - segment(frame, 500, 540, Easing.inOut(Easing.cubic)));
  const contained =
    segment(frame, 486, 500, Easing.out(Easing.cubic)) *
    (1 - segment(frame, 530, 542, Easing.inOut(Easing.cubic)));
  const success = segment(frame, 745, 766, Easing.out(Easing.cubic));

  const totalProgress =
    frame < 270
      ? scanOne * 0.45
      : frame < 540
        ? 0.45
        : frame < 690
          ? 0.45 + scanTwo * 0.55
          : 1;
  const scannedFiles =
    frame < 270
      ? Math.floor(scanOne * 58)
      : frame < 540
        ? 58
        : frame < 690
          ? Math.min(128, 58 + Math.floor(scanTwo * 70))
          : 128;
  const activeCount = Math.min(20, Math.floor(totalProgress * 20 + 0.0001));
  const percentage = Math.min(100, Math.round(totalProgress * 100));
  const scanToThreat = interpolateColors(
    danger,
    [0, 1],
    [COLORS.cyan, COLORS.threat],
  );
  const alertToContained = interpolateColors(
    contained,
    [0, 1],
    [scanToThreat, COLORS.warning],
  );
  const accent = interpolateColors(
    success,
    [0, 1],
    [alertToContained, COLORS.mint],
  );
  const impact =
    segment(frame, 268, 308, Easing.out(Easing.cubic)) *
    (1 - segment(frame, 512, 680, Easing.inOut(Easing.cubic)));
  const joltWindow = frame >= 270 && frame <= 298 ? 1 - (frame - 270) / 28 : 0;
  const jolt = Math.sin((frame - 270) * 1.45) * 2 * joltWindow;
  const shadowPulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.46);
  const titleAlert =
    success > 0.15
      ? "SECURE://OK"
      : frame >= 495 && frame < 540
        ? "CONTAINED"
        : danger > 0.12
          ? "ALERT://01"
          : "SCAN://A";

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 1340,
        height: 792,
        opacity: enter,
        transform: `translate(calc(-50% + ${jolt}px), calc(-50% + ${mix(
          13,
          0,
          enter,
        )}px)) scale(${mix(0.982, 1, enter) * (1 + impact * 0.018)})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 29,
          top: 31,
          right: -29,
          bottom: -31,
          opacity: 0.23 + shadowPulse * 0.07,
          background: COLORS.navyDeep,
          filter: "blur(3px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: -9,
          border: `2px solid ${accent}`,
          opacity: 0.25 + shadowPulse * 0.18,
          boxShadow: `0 0 ${32 + shadowPulse * 20}px ${accent}44`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: `linear-gradient(145deg, ${COLORS.panelLight} 0%, ${COLORS.panel} 48%, ${COLORS.panelMid} 100%)`,
          border: `4px solid ${COLORS.panelMid}`,
          boxShadow:
            "inset 4px 4px rgba(255,255,255,.94), inset -4px -4px rgba(61,83,79,.42), 0 30px 70px rgba(1,24,36,.42)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 7,
            right: 7,
            height: 62,
            display: "flex",
            alignItems: "center",
            padding: "0 15px 0 19px",
            boxSizing: "border-box",
            background:
              frame >= 495 && frame < 540
                ? "linear-gradient(90deg, #33230b 0%, #775719 48%, #c18a23 100%)"
                : danger > 0.2
                  ? "linear-gradient(90deg, #260822 0%, #701438 48%, #c52f58 100%)"
                  : success > 0.15
                    ? "linear-gradient(90deg, #082e2c 0%, #12664c 48%, #24b986 100%)"
                    : "linear-gradient(90deg, #090d3f 0%, #171d71 44%, #303bd9 100%)",
            borderBottom: "3px solid rgba(7,13,56,.56)",
            boxShadow:
              "inset 2px 2px rgba(158,177,255,.32), inset 0 -3px rgba(3,7,39,.42)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 33,
              height: 35,
              marginRight: 15,
            }}
          >
            {[
              [1, 0],
              [0, 1],
              [1, 1],
              [2, 1],
              [0, 2],
              [1, 2],
              [2, 2],
              [1, 3],
            ].map(([x, y], index) => (
              <div
                key={`title-shield-${index}`}
                style={{
                  position: "absolute",
                  left: x * 10,
                  top: y * 8,
                  width: 8,
                  height: 7,
                  background:
                    index === Math.floor(time * 9) % 8
                      ? COLORS.cyanSoft
                      : accent,
                  boxShadow:
                    index === Math.floor(time * 9) % 8
                      ? `0 0 12px ${accent}`
                      : undefined,
                }}
              />
            ))}
          </div>

          <div
            style={{
              color: COLORS.panelLight,
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: 2.25,
              textShadow: "2px 2px rgba(1,4,35,.68)",
            }}
          >
            SYSTEM SECURITY // VIRUS SCAN
          </div>

          <div
            style={{
              marginLeft: 20,
              color: "rgba(211,255,250,.56)",
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            {titleAlert}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 7,
            }}
          >
            <WindowControl>_</WindowControl>
            <WindowControl>□</WindowControl>
            <WindowControl danger>×</WindowControl>
          </div>
        </div>

        <StatusHeadline frame={frame} accent={accent} percentage={percentage} />

        <FileTerminal
          frame={frame}
          time={time}
          scannedFiles={scannedFiles}
          danger={danger}
          success={success}
        />

        <SecurityScope
          frame={frame}
          time={time}
          danger={danger}
          quarantine={quarantine}
          success={success}
          accent={accent}
        />

        <SegmentedProgress
          activeCount={activeCount}
          time={time}
          accent={accent}
          complete={percentage >= 100}
        />

        <div
          style={{
            position: "absolute",
            left: 42,
            right: 42,
            bottom: 38,
            height: 78,
            display: "flex",
            alignItems: "center",
          }}
        >
          <DiagnosticPixels
            time={time}
            progress={totalProgress}
            color={accent}
          />

          <div
            style={{
              marginLeft: 24,
              color: COLORS.inkSoft,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.35,
              lineHeight: 1.65,
            }}
          >
            ENGINE // HEURISTIC
            <br />
            PROTECTION // {success > 0.15 ? "ACTIVE" : "MONITORING"}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 15,
            }}
          >
            <RetroButton>{success > 0.15 ? "VIEW LOG" : "DETAILS"}</RetroButton>
            <RetroButton
              active={danger > 0.2 || contained > 0.2 || success > 0.15}
              accent={
                success > 0.15
                  ? COLORS.mintDeep
                  : contained > 0.2
                    ? "#9a6c16"
                    : COLORS.threatDeep
              }
            >
              {success > 0.15
                ? "DONE"
                : contained > 0.2
                  ? "RESUME"
                  : danger > 0.2
                    ? "QUARANTINE"
                    : "PAUSE"}
            </RetroButton>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 7,
            right: 7,
            bottom: 6,
            height: 4,
            opacity: 0.38,
            background: `repeating-linear-gradient(90deg, ${accent} 0 18px, transparent 18px 29px)`,
          }}
        />
      </div>
    </div>
  );
};

const ScreenFinish: React.FC<{ time: number }> = ({ time }) => (
  <>
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.15,
        transform: `translateY(${modulo(time * 18, 6)}px)`,
        backgroundImage:
          "repeating-linear-gradient(180deg, rgba(4,28,35,.5) 0px, rgba(4,28,35,.5) 1px, transparent 1px, transparent 5px)",
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
        boxShadow: "inset 0 0 155px rgba(0,14,27,.56)",
      }}
    />
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const timeline = clamp01(frame / Math.max(1, durationInFrames - 1));
  const designFrame = timeline * (DESIGN_FRAMES - 1);
  const time = frame / fps;
  const unit = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  const offsetX = (width - DESIGN_WIDTH * unit) / 2;
  const offsetY = (height - DESIGN_HEIGHT * unit) / 2;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: COLORS.desktop,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${unit})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        <AmbientDesktop frame={designFrame} time={time} />
        <SecurityWindow frame={designFrame} time={time} />
        <ScreenFinish time={time} />
      </div>
    </AbsoluteFill>
  );
};
