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
const TAU = Math.PI * 2;

const COLORS = {
  desktopDeep: "#034d5d",
  desktop: "#087b7c",
  desktopLight: "#14a09a",
  navy: "#151a62",
  navyDeep: "#090d3f",
  cobalt: "#303bd9",
  cyan: "#46f4e7",
  cyanSoft: "#b0fff8",
  mint: "#7dffc7",
  panel: "#dce5dc",
  panelLight: "#f5f7ef",
  panelMid: "#c4d1c8",
  panelDark: "#7b918c",
  ink: "#101b20",
  inkSoft: "#41565a",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const modulo = (value: number, length = 1) =>
  ((value % length) + length) % length;

const segment = (
  progress: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) =>
  interpolate(progress, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 91.731 + 18.177) * 47453.5453;
  return value - Math.floor(value);
};

const PIXELS = Array.from({ length: 54 }, (_, index) => ({
  x: hash01(index * 11 + 4) * DESIGN_WIDTH,
  y: hash01(index * 17 + 8) * DESIGN_HEIGHT,
  size: 3 + Math.floor(hash01(index * 19 + 3) * 6),
  phase: hash01(index * 23 + 9),
  speed: 5 + hash01(index * 29 + 1) * 13,
  opacity: 0.08 + hash01(index * 31 + 2) * 0.22,
}));

const BLOCK_COUNT = 18;
const PROGRESS_START = 0.057;
const PROGRESS_COMPLETE = 0.88;
const PROGRESS_STEP_TIMES = Array.from(
  { length: BLOCK_COUNT },
  (_, index) =>
    PROGRESS_START +
    (index / Math.max(1, BLOCK_COUNT - 1)) *
      (PROGRESS_COMPLETE - PROGRESS_START),
);

const activeBlocksForTimeline = (timeline: number) =>
  PROGRESS_STEP_TIMES.reduce(
    (total, threshold) => total + (timeline >= threshold ? 1 : 0),
    0,
  );

const CornerGlyph: React.FC<{
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  flip?: boolean;
  opacity: number;
}> = ({ left, right, top, bottom, flip = false, opacity }) => (
  <div
    style={{
      position: "absolute",
      left,
      right,
      top,
      bottom,
      width: 148,
      height: 148,
      opacity,
      transform: `scaleX(${flip ? -1 : 1})`,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 92,
        height: 4,
        background: COLORS.cyan,
        boxShadow: "0 0 15px rgba(70,244,231,.45)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 4,
        height: 92,
        background: COLORS.cyan,
        boxShadow: "0 0 15px rgba(70,244,231,.45)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 22,
        top: 22,
        width: 16,
        height: 16,
        border: "3px solid rgba(176,255,248,.8)",
      }}
    />
  </div>
);

const AmbientDesktop: React.FC<{ time: number; progress: number }> = ({
  time,
  progress,
}) => {
  const gridX = modulo(time * 9, 64);
  const gridY = modulo(time * 4.5, 64);
  const scanY = modulo(time * 120, DESIGN_HEIGHT + 260) - 130;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.22);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 46%, #139b98 0%, #087b7c 38%, #045f6c 72%, #033e50 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(rgba(139,255,247,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(139,255,247,.18) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage:
            "radial-gradient(circle at 50% 50%, #000 0%, rgba(0,0,0,.74) 44%, transparent 82%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1110,
          height: 1110,
          transform: `translate(-50%, -50%) rotate(${time * 1.3}deg)`,
          borderRadius: "50%",
          border: "1px solid rgba(178,255,248,.13)",
          boxShadow:
            "0 0 0 92px rgba(130,255,246,.025), 0 0 0 184px rgba(130,255,246,.018)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1290,
          height: 460,
          transform: `translate(-50%, -50%) rotate(${-7 + Math.sin(time * 0.16) * 1.2}deg)`,
          background:
            "linear-gradient(90deg, transparent, rgba(87,255,240,.08), transparent)",
          filter: "blur(36px)",
        }}
      />

      {PIXELS.map((pixel, index) => {
        const y =
          modulo(
            pixel.y + time * pixel.speed + pixel.phase * DESIGN_HEIGHT,
            DESIGN_HEIGHT + 80,
          ) - 40;
        const flicker =
          0.38 +
          0.62 *
            Math.sin(
              (time * (0.19 + (index % 5) * 0.025) + pixel.phase) * TAU,
            ) **
              2;
        return (
          <div
            key={`desktop-pixel-${index}`}
            style={{
              position: "absolute",
              left: pixel.x,
              top: y,
              width: pixel.size,
              height: pixel.size,
              opacity: pixel.opacity * flicker,
              background:
                index % 7 === 0 ? COLORS.cyanSoft : "rgba(87,255,240,.9)",
              boxShadow:
                index % 7 === 0 ? "0 0 13px rgba(104,255,241,.85)" : undefined,
            }}
          />
        );
      })}

      <CornerGlyph left={82} top={72} opacity={0.28 + pulse * 0.12} />
      <CornerGlyph
        right={82}
        bottom={72}
        flip
        opacity={0.2 + (1 - pulse) * 0.12}
      />

      <div
        style={{
          position: "absolute",
          left: 92,
          bottom: 78,
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: "rgba(201,255,250,.56)",
          fontFamily: "'Courier New', monospace",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 2.8,
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
        DESKTOP CHANNEL // 04
      </div>

      <div
        style={{
          position: "absolute",
          right: 90,
          top: 78,
          color: "rgba(201,255,250,.48)",
          fontFamily: "'Courier New', monospace",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 2.4,
          textAlign: "right",
          lineHeight: 1.7,
        }}
      >
        SIGNAL {String(Math.round(92 + pulse * 7)).padStart(2, "0")}%
        <br />
        FRAME {String(Math.floor(progress * 600)).padStart(3, "0")}
      </div>

      <div
        style={{
          position: "absolute",
          left: -240,
          top: scanY,
          width: 2400,
          height: 150,
          transform: "rotate(-4deg)",
          opacity: 0.16,
          background:
            "linear-gradient(180deg, transparent, rgba(174,255,248,.62), transparent)",
          filter: "blur(22px)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 44%, rgba(1,30,42,.2) 74%, rgba(1,20,35,.64) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const PixelLoaderIcon: React.FC<{ time: number; complete: boolean }> = ({
  time,
  complete,
}) => {
  const activeIndex = Math.floor(time * 8) % 8;
  const points = [
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
    [1, 2],
    [0, 2],
    [0, 1],
    [0, 0],
  ];

  return (
    <div
      style={{
        width: 48,
        height: 48,
        position: "relative",
        flex: "0 0 auto",
      }}
    >
      {points.map(([x, y], index) => {
        const distance = modulo(activeIndex - index, 8);
        const alpha = complete
          ? 1
          : distance === 0
            ? 1
            : 0.16 + (7 - distance) * 0.045;
        return (
          <div
            key={`loader-dot-${index}`}
            style={{
              position: "absolute",
              left: x * 16,
              top: y * 16,
              width: 12,
              height: 12,
              background: complete ? COLORS.mint : COLORS.cobalt,
              opacity: alpha,
              boxShadow:
                distance === 0 || complete
                  ? `0 0 15px ${complete ? "rgba(125,255,199,.8)" : "rgba(48,59,217,.55)"}`
                  : undefined,
            }}
          />
        );
      })}
      {complete ? (
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 8,
            width: 24,
            height: 13,
            transform: "rotate(-45deg)",
            borderLeft: `5px solid ${COLORS.navy}`,
            borderBottom: `5px solid ${COLORS.navy}`,
          }}
        />
      ) : null}
    </div>
  );
};

const WindowControl: React.FC<{
  children: React.ReactNode;
  danger?: boolean;
}> = ({ children, danger = false }) => (
  <div
    style={{
      width: 28,
      height: 26,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: danger ? COLORS.panelLight : "rgba(245,247,239,.76)",
      background: danger
        ? "linear-gradient(180deg, rgba(255,115,126,.94), rgba(194,55,78,.95))"
        : "rgba(223,235,229,.12)",
      border: "1px solid rgba(238,255,251,.38)",
      boxShadow: "inset 1px 1px rgba(255,255,255,.24)",
      fontFamily: "Arial, sans-serif",
      fontSize: 15,
      fontWeight: 800,
      lineHeight: 1,
    }}
  >
    {children}
  </div>
);

const RetroButton: React.FC<{
  children: React.ReactNode;
  muted?: boolean;
}> = ({ children, muted = false }) => (
  <div
    style={{
      minWidth: 132,
      height: 50,
      padding: "0 22px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: muted ? "rgba(58,75,77,.44)" : COLORS.ink,
      background: muted
        ? "linear-gradient(180deg, rgba(224,231,224,.58), rgba(188,201,192,.58))"
        : `linear-gradient(180deg, ${COLORS.panelLight}, ${COLORS.panelMid})`,
      border: `2px solid ${muted ? "rgba(108,128,123,.32)" : COLORS.panelDark}`,
      boxShadow: muted
        ? "inset 2px 2px rgba(255,255,255,.32)"
        : "inset 3px 3px rgba(255,255,255,.92), inset -3px -3px rgba(69,88,84,.28), 4px 4px 0 rgba(42,67,65,.18)",
      fontFamily: "'Courier New', monospace",
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: 1.5,
    }}
  >
    {children}
  </div>
);

const SegmentedProgress: React.FC<{
  activeCount: number;
  time: number;
  complete: boolean;
}> = ({ activeCount, time, complete }) => {
  const steppedWidth = `${(activeCount / BLOCK_COUNT) * 100}%`;
  const shine = modulo(time * 0.44, 1);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 76,
        padding: 10,
        boxSizing: "border-box",
        overflow: "hidden",
        background: "#9eaaa2",
        border: `3px solid ${COLORS.panelDark}`,
        boxShadow:
          "inset 4px 4px 0 rgba(52,72,68,.42), inset -4px -4px 0 rgba(255,255,255,.78)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 11,
          top: 11,
          bottom: 11,
          width: steppedWidth,
          opacity: 0.18,
          background: complete ? COLORS.mint : COLORS.cyan,
          filter: "blur(12px)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "grid",
          gridTemplateColumns: `repeat(${BLOCK_COUNT}, 1fr)`,
          gap: 6,
        }}
      >
        {Array.from({ length: BLOCK_COUNT }, (_, index) => {
          const active = index < activeCount;
          const newest = active && index === activeCount - 1 && !complete;
          const flash = newest ? 0.72 + Math.sin(time * TAU * 4.2) * 0.18 : 1;
          return (
            <div
              key={`progress-block-${index}`}
              style={{
                position: "relative",
                overflow: "hidden",
                opacity: active ? flash : 0.28,
                background: active
                  ? complete
                    ? "linear-gradient(180deg, #c5ffe2 0%, #69f6b7 46%, #27b987 100%)"
                    : "linear-gradient(180deg, #7a89ff 0%, #303bd9 42%, #171a79 100%)"
                  : "linear-gradient(180deg, #778985, #61726e)",
                border: active
                  ? "1px solid rgba(232,255,250,.72)"
                  : "1px solid rgba(31,52,49,.42)",
                boxShadow: active
                  ? complete
                    ? "0 0 13px rgba(105,246,183,.5), inset 2px 2px rgba(255,255,255,.36)"
                    : "0 0 12px rgba(48,59,217,.42), inset 2px 2px rgba(255,255,255,.34)"
                  : "inset 2px 2px rgba(255,255,255,.09)",
              }}
            >
              {active ? (
                <div
                  style={{
                    position: "absolute",
                    left: -18,
                    top: -20,
                    width: 18,
                    height: 96,
                    transform: `translateX(${shine * 72}px) rotate(18deg)`,
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

const statusForProgress = (progress: number) => {
  if (progress >= 1) return "SYSTEM READY";
  if (progress >= 0.78) return "FINALIZING";
  if (progress >= 0.52) return "VERIFYING CACHE";
  if (progress >= 0.26) return "LOADING MODULES";
  return "CHECKING MEMORY";
};

const SystemDialog: React.FC<{
  time: number;
  timeline: number;
}> = ({ time, timeline }) => {
  const fadeIn = segment(timeline, 0, 0.0667, Easing.linear);
  const settle = segment(timeline, 0, 0.0667, Easing.out(Easing.cubic));
  const exit = 1 - segment(timeline, 0.9333, 1, Easing.linear);
  const visibility = fadeIn * exit;
  const visibleBlocks = activeBlocksForTimeline(timeline);
  const loadProgress = visibleBlocks / BLOCK_COUNT;
  const complete = visibleBlocks >= BLOCK_COUNT;
  const dots = ".".repeat(Math.floor(time * 1.5) % 4);
  const percentage = Math.round((visibleBlocks / BLOCK_COUNT) * 100);
  const status = statusForProgress(loadProgress);
  const shadowBreath = 0.5 + 0.5 * Math.sin(time * TAU * 0.34);
  const borderColor = interpolateColors(
    segment(loadProgress, 0.92, 1, Easing.out(Easing.cubic)),
    [0, 1],
    [COLORS.cyan, COLORS.mint],
  );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 760,
        height: 430,
        opacity: visibility,
        transform: `translate(-50%, calc(-50% + ${mix(10, 0, settle)}px)) scale(${mix(
          0.985,
          1,
          settle,
        )})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 26,
          top: 28,
          right: -26,
          bottom: -28,
          opacity: 0.22 + shadowBreath * 0.08,
          background: COLORS.navyDeep,
          filter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: -9,
          border: `2px solid ${borderColor}`,
          opacity: 0.28 + shadowBreath * 0.18,
          boxShadow: `0 0 ${34 + shadowBreath * 18}px rgba(70,244,231,.25)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: `linear-gradient(145deg, ${COLORS.panelLight} 0%, ${COLORS.panel} 46%, ${COLORS.panelMid} 100%)`,
          border: `4px solid ${COLORS.panelMid}`,
          boxShadow:
            "inset 4px 4px 0 rgba(255,255,255,.94), inset -4px -4px 0 rgba(61,83,79,.42), 0 30px 70px rgba(1,24,36,.42)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 7,
            right: 7,
            height: 67,
            display: "flex",
            alignItems: "center",
            padding: "0 15px 0 19px",
            boxSizing: "border-box",
            background:
              "linear-gradient(90deg, #090d3f 0%, #171d71 44%, #2e3bd6 100%)",
            borderBottom: "3px solid rgba(7,13,56,.56)",
            boxShadow:
              "inset 2px 2px rgba(158,177,255,.38), inset 0 -3px rgba(3,7,39,.44)",
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
                key={`title-chip-${index}`}
                style={{
                  width: 7,
                  height: 7,
                  background:
                    index === Math.floor(time * 8) % 9
                      ? COLORS.cyanSoft
                      : index % 2
                        ? COLORS.cyan
                        : "rgba(171,255,248,.38)",
                  boxShadow:
                    index === Math.floor(time * 8) % 9
                      ? "0 0 12px rgba(176,255,248,.9)"
                      : undefined,
                }}
              />
            ))}
          </div>

          <div
            style={{
              color: COLORS.panelLight,
              fontFamily: "'Courier New', monospace",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 2.4,
              textShadow: "2px 2px rgba(1,4,35,.7)",
            }}
          >
            SYSTEM LOADER
          </div>

          <div
            style={{
              marginLeft: 18,
              color: "rgba(196,255,249,.55)",
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.6,
            }}
          >
            CORE://04
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

        <div
          style={{
            position: "absolute",
            left: 49,
            right: 49,
            top: 107,
            display: "flex",
            alignItems: "center",
            gap: 23,
          }}
        >
          <PixelLoaderIcon time={time} complete={complete} />

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <div
                style={{
                  color: COLORS.ink,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 1.4,
                  whiteSpace: "nowrap",
                }}
              >
                {complete ? (
                  "LOADING COMPLETE"
                ) : (
                  <>
                    LOADING
                    <span
                      style={{
                        display: "inline-block",
                        width: "3ch",
                        textAlign: "left",
                      }}
                    >
                      {dots}
                    </span>
                  </>
                )}
              </div>
              <div
                style={{
                  color: complete ? "#147f5e" : COLORS.navy,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 28,
                  fontWeight: 900,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 1,
                }}
              >
                {String(percentage).padStart(3, "0")}%
              </div>
            </div>
            <div
              style={{
                marginTop: 7,
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: COLORS.inkSoft,
                fontFamily: "'Courier New', monospace",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1.7,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  background: complete ? COLORS.mint : COLORS.cobalt,
                  boxShadow: complete
                    ? "0 0 10px rgba(125,255,199,.8)"
                    : "0 0 10px rgba(48,59,217,.42)",
                }}
              />
              {status}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 49,
            right: 49,
            top: 196,
          }}
        >
          <SegmentedProgress
            activeCount={visibleBlocks}
            time={time}
            complete={complete}
          />

          <div
            style={{
              marginTop: 14,
              display: "flex",
              justifyContent: "space-between",
              color: "rgba(30,51,53,.64)",
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
            }}
          >
            <span>MEM 064 MB</span>
            <span>
              BLOCK {String(visibleBlocks).padStart(2, "0")}/{BLOCK_COUNT}
            </span>
            <span>CRC {complete ? "OK" : "SCAN"}</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 49,
            right: 49,
            bottom: 40,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 9px)",
              gap: 5,
              opacity: 0.56,
            }}
          >
            {Array.from({ length: 24 }, (_, index) => {
              const lit =
                modulo(index + Math.floor(time * 6), 13) < 3 ||
                index < Math.floor(loadProgress * 24);
              return (
                <div
                  key={`diagnostic-pixel-${index}`}
                  style={{
                    width: 9,
                    height: 5,
                    background: lit
                      ? complete
                        ? COLORS.mint
                        : COLORS.cobalt
                      : "rgba(59,80,78,.22)",
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 16,
            }}
          >
            <RetroButton muted>DETAILS</RetroButton>
            <RetroButton>CANCEL</RetroButton>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 7,
            right: 7,
            bottom: 6,
            height: 4,
            opacity: 0.35,
            background:
              "repeating-linear-gradient(90deg, #2a3aa7 0 18px, transparent 18px 28px)",
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
        opacity: 0.16,
        transform: `translateY(${modulo(time * 18, 6)}px)`,
        backgroundImage:
          "repeating-linear-gradient(180deg, rgba(4,28,35,.5) 0px, rgba(4,28,35,.5) 1px, transparent 1px, transparent 5px)",
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.08,
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,80,80,.18) 0 1px, rgba(70,255,221,.08) 1px 2px, rgba(71,94,255,.16) 2px 3px)",
        backgroundSize: "3px 100%",
        mixBlendMode: "screen",
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        boxShadow: "inset 0 0 150px rgba(0,14,27,.54)",
      }}
    />
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const timeline = clamp01(frame / Math.max(1, durationInFrames - 1));
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
        <AmbientDesktop time={time} progress={timeline} />
        <SystemDialog time={time} timeline={timeline} />
        <ScreenFinish time={time} />
      </div>
    </AbsoluteFill>
  );
};
