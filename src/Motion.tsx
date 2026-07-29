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
  deep: "#061535",
  midnight: "#0a2051",
  teal: "#0a6877",
  cyan: "#49f4e3",
  cyanSoft: "#b9fff7",
  cobalt: "#4d5bff",
  indigo: "#242975",
  amber: "#ffca61",
  amberSoft: "#ffe9aa",
  mint: "#62f6b5",
  mintSoft: "#c8ffe9",
  coral: "#ff7a7f",
  panel: "#dce7df",
  panelLight: "#f5f8ef",
  panelMid: "#bdcbc3",
  panelDark: "#718985",
  ink: "#10212a",
  inkSoft: "#4d6467",
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
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 91.177 + 17.731) * 43758.5453;
  return value - Math.floor(value);
};

const getMigrationProgress = (frame: number) => {
  if (frame < 54) return 0;
  if (frame < 240) {
    return mix(0, 0.22, segment(frame, 54, 240, Easing.inOut(Easing.cubic)));
  }
  if (frame < 390) {
    return mix(
      0.22,
      0.42,
      segment(frame, 240, 390, Easing.inOut(Easing.cubic)),
    );
  }
  if (frame < 650) {
    return mix(
      0.42,
      0.86,
      segment(frame, 390, 650, Easing.inOut(Easing.cubic)),
    );
  }
  if (frame < 762) {
    return mix(0.86, 1, segment(frame, 650, 762, Easing.inOut(Easing.cubic)));
  }
  return 1;
};

const phaseOpacity = (frame: number, start: number, end: number, fade = 10) =>
  segment(frame, start, start + fade, Easing.out(Easing.cubic)) *
  (1 - segment(frame, end - fade, end, Easing.in(Easing.cubic)));

const AMBIENT_PIXELS = Array.from({ length: 58 }, (_, index) => ({
  x: hash01(index * 7 + 3) * WIDTH,
  y: hash01(index * 13 + 9) * HEIGHT,
  size: 2 + Math.floor(hash01(index * 17 + 2) * 5),
  phase: hash01(index * 19 + 5),
  speed: 7 + hash01(index * 23 + 1) * 17,
  opacity: 0.05 + hash01(index * 29 + 7) * 0.17,
}));

const RECORD_ROWS = [
  "CUSTOMER.DB",
  "ORDERS.DAT",
  "ARCHIVE.BIN",
  "INDEX.CAT",
  "LEDGER.LOG",
] as const;

const STAGES = [
  { label: "INVENTORY", threshold: 0.22 },
  { label: "TRANSFORM", threshold: 0.42 },
  { label: "TRANSFER", threshold: 0.86 },
  { label: "VERIFY", threshold: 1 },
] as const;

const DotMatrixText: React.FC<{
  readonly children: React.ReactNode;
  readonly color?: string;
  readonly size?: number;
  readonly letterSpacing?: number;
  readonly align?: "left" | "center" | "right";
  readonly style?: React.CSSProperties;
}> = ({
  children,
  color = COLORS.ink,
  size = 22,
  letterSpacing = 2.2,
  align = "left",
  style,
}) => (
  <div
    style={{
      color,
      fontFamily: "'Courier New', monospace",
      fontSize: size,
      fontWeight: 800,
      letterSpacing,
      lineHeight: 1.08,
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
}> = ({ size = 18, color = COLORS.mint, stroke = 2.8 }) => (
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

const ArrowGlyph: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path
      d="M4 12H19M14 7L19 12L14 17"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

const CLOUD_SVG_PATH =
  "M343.454,170.099c0.01-0.583,0.022-1.165,0.022-1.75c0-55.728-45.177-100.905-100.905-100.905c-48.025,0-88.209,33.551-98.403,78.492c-9.505-5.321-20.454-8.368-32.122-8.368c-36.407,0-65.92,29.514-65.92,65.92c0,1.488,0.067,2.959,0.164,4.423C19.262,217.944,0,243.959,0,274.479c0,39.207,31.784,70.991,70.991,70.991h253.183c49.009,0,88.739-39.73,88.739-88.739C412.913,214.343,383.192,178.903,343.454,170.099z";

const CloudGlyph: React.FC<{
  readonly progress: number;
  readonly time: number;
  readonly complete: number;
}> = ({ progress, time, complete }) => {
  const fillY = 354 - progress * 298;
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.72);
  const accent = interpolateColors(
    complete,
    [0, 1],
    [COLORS.cyan, COLORS.mint],
  );
  const accentSoft = interpolateColors(
    complete,
    [0, 1],
    [COLORS.cyanSoft, COLORS.mintSoft],
  );
  const tracerOffset = -modulo(time * 0.115, 1);

  return (
    <svg width="330" height="250" viewBox="-11 50 435 315">
      <defs>
        <clipPath id="migration-cloud-svg-clip">
          <path d={CLOUD_SVG_PATH} />
        </clipPath>
        <linearGradient
          id="migration-cloud-body"
          x1="0"
          y1="0"
          x2="0.88"
          y2="1"
        >
          <stop offset="0" stopColor="rgba(25,79,119,.98)" />
          <stop offset="0.44" stopColor="rgba(9,38,82,.98)" />
          <stop offset="1" stopColor="rgba(4,22,56,.99)" />
        </linearGradient>
        <linearGradient
          id="migration-cloud-data"
          x1="0"
          y1="1"
          x2="0.82"
          y2="0"
        >
          <stop offset="0" stopColor={COLORS.cobalt} />
          <stop offset="0.58" stopColor={accent} />
          <stop offset="1" stopColor={accentSoft} />
        </linearGradient>
        <linearGradient
          id="migration-cloud-sheen"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="rgba(225,255,252,.34)" />
          <stop offset="0.28" stopColor="rgba(126,255,243,.08)" />
          <stop offset="0.64" stopColor="rgba(63,114,176,0)" />
          <stop offset="1" stopColor="rgba(98,246,181,.18)" />
        </linearGradient>
        <pattern
          id="migration-cloud-grid"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M28 0H0V28"
            fill="none"
            stroke="rgba(184,255,248,.22)"
            strokeWidth="1"
          />
          <rect
            x="2"
            y="2"
            width="3"
            height="3"
            fill="rgba(194,255,249,.38)"
          />
        </pattern>
        <filter
          id="migration-cloud-bloom"
          x="-35%"
          y="-45%"
          width="170%"
          height="190%"
        >
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="migration-cloud-soft-glow"
          x="-40%"
          y="-50%"
          width="180%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="15" />
        </filter>
      </defs>

      <path
        d={CLOUD_SVG_PATH}
        fill="none"
        stroke={accent}
        strokeWidth="15"
        opacity={0.17 + pulse * 0.08}
        filter="url(#migration-cloud-soft-glow)"
      />

      <path
        d={CLOUD_SVG_PATH}
        fill="url(#migration-cloud-body)"
        stroke="rgba(169,255,248,.3)"
        strokeWidth="8"
        strokeLinejoin="round"
      />

      <g clipPath="url(#migration-cloud-svg-clip)">
        <rect
          x="-18"
          y={fillY}
          width="460"
          height={378 - fillY}
          fill="url(#migration-cloud-data)"
          opacity={0.24 + progress * 0.68}
        />
        <rect
          x="-18"
          y={fillY}
          width="460"
          height={378 - fillY}
          fill="url(#migration-cloud-grid)"
          opacity={0.12 + progress * 0.33}
          transform={"translate(" + modulo(time * 9, 28) + " " + modulo(time * 5, 28) + ")"}
        />

        <path
          d={
            "M-20 " +
            (fillY + Math.sin(time * 1.7) * 4) +
            " C72 " +
            (fillY - 12) +
            " 136 " +
            (fillY + 12) +
            " 208 " +
            (fillY + 1) +
            " S342 " +
            (fillY - 9) +
            " 445 " +
            (fillY + 2)
          }
          fill="none"
          stroke={accentSoft}
          strokeWidth="5"
          opacity={0.76}
          filter="url(#migration-cloud-bloom)"
        />

        {Array.from({ length: 14 }, (_, index) => {
          const x = -8 + modulo(index * 51 + time * (18 + (index % 4) * 4), 445);
          const y = 82 + modulo(index * 67 + time * (23 + (index % 3) * 5), 255);
          const bitOpacity =
            y > fillY ? 0.2 + progress * 0.56 : 0.05 + progress * 0.12;
          return (
            <g key={"cloud-data-" + index} opacity={bitOpacity}>
              <rect
                x={x}
                y={y}
                width={index % 3 === 0 ? 18 : 9}
                height="8"
                fill={index % 5 === 0 ? COLORS.mintSoft : COLORS.cyanSoft}
              />
              {index % 4 === 0 ? (
                <rect
                  x={x + 22}
                  y={y}
                  width="5"
                  height="8"
                  fill={COLORS.cyan}
                  opacity="0.7"
                />
              ) : null}
            </g>
          );
        })}

        <path
          d="M42 145H102L128 119H190M222 105H282L310 133H369M47 283H111L141 253H223L247 276H348"
          fill="none"
          stroke={accentSoft}
          strokeWidth="2"
          opacity={0.11 + progress * 0.24}
          strokeDasharray="7 7"
          strokeDashoffset={-time * 18}
        />

        <path
          d={CLOUD_SVG_PATH}
          fill="url(#migration-cloud-sheen)"
          opacity={0.5}
          transform="translate(-3 -4)"
        />
      </g>

      <path
        d={CLOUD_SVG_PATH}
        pathLength={1}
        fill="none"
        stroke={accent}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#migration-cloud-bloom)"
        opacity={0.75 + pulse * 0.18}
      />
      <path
        d={CLOUD_SVG_PATH}
        pathLength={1}
        fill="none"
        stroke={accentSoft}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.105 0.895"
        strokeDashoffset={tracerOffset}
        filter="url(#migration-cloud-bloom)"
        opacity={0.82}
      />

      {[
        { x: 46, y: 211 },
        { x: 145, y: 145 },
        { x: 343, y: 170 },
        { x: 392, y: 300 },
      ].map((node, index) => (
        <g key={"cloud-node-" + index}>
          <circle
            cx={node.x}
            cy={node.y}
            r={4.5 + pulse * 1.5}
            fill={accentSoft}
            opacity={0.54 + progress * 0.3}
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={10 + pulse * 2}
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            opacity={0.16 + progress * 0.22}
          />
        </g>
      ))}
    </svg>
  );
};

const Background: React.FC<{ readonly time: number }> = ({ time }) => {
  const gridX = modulo(time * 10, 64);
  const gridY = modulo(time * 5, 64);
  const scanY = modulo(time * 118, HEIGHT + 280) - 140;
  const orbit = time * 1.2;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 44%, #126f7c 0%, #0a3b67 42%, #081d48 74%, #050e28 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.23,
          backgroundImage:
            "linear-gradient(rgba(118,255,239,.17) 1px, transparent 1px), linear-gradient(90deg, rgba(118,255,239,.17) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage:
            "radial-gradient(ellipse at 50% 50%, #000 0%, rgba(0,0,0,.76) 49%, transparent 88%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "49%",
          width: 1460,
          height: 780,
          transform: `translate(-50%, -50%) rotate(${orbit}deg)`,
          borderRadius: "50%",
          border: "1px solid rgba(115,255,241,.11)",
          boxShadow:
            "0 0 0 82px rgba(79,235,226,.025), 0 0 0 164px rgba(79,235,226,.018)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "47%",
          width: 1420,
          height: 280,
          transform: `translate(-50%, -50%) rotate(${
            -8 + Math.sin(time * 0.22) * 1.5
          }deg)`,
          background:
            "linear-gradient(90deg, transparent, rgba(67,255,236,.09), transparent)",
          filter: "blur(42px)",
        }}
      />

      {AMBIENT_PIXELS.map((pixel, index) => {
        const y =
          modulo(
            pixel.y + time * pixel.speed + pixel.phase * HEIGHT,
            HEIGHT + 80,
          ) - 40;
        const flicker =
          0.3 +
          0.7 *
            Math.sin(
              (time * (0.17 + (index % 5) * 0.025) + pixel.phase) * TAU,
            ) **
              2;
        return (
          <div
            key={`ambient-${index}`}
            style={{
              position: "absolute",
              left: pixel.x,
              top: y,
              width: pixel.size,
              height: pixel.size,
              opacity: pixel.opacity * flicker,
              background: index % 7 === 0 ? COLORS.cyanSoft : COLORS.cyan,
              boxShadow:
                index % 7 === 0 ? "0 0 12px rgba(92,255,239,.75)" : undefined,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY,
          height: 2,
          opacity: 0.17,
          background:
            "linear-gradient(90deg, transparent, rgba(190,255,249,.9), transparent)",
          boxShadow: "0 0 18px rgba(88,255,239,.5)",
        }}
      />

      <AbsoluteFill
        style={{
          opacity: 0.1,
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(4,13,35,.7) 4px)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 48%, rgba(2,8,27,.58) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const BeveledPanel: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly accent?: string;
  readonly dark?: boolean;
}> = ({ children, style, accent = COLORS.cyan, dark = false }) => (
  <div
    style={{
      position: "absolute",
      background: dark
        ? "linear-gradient(155deg, rgba(13,33,70,.97), rgba(6,21,54,.98))"
        : `linear-gradient(145deg, ${COLORS.panelLight}, ${COLORS.panel} 53%, ${COLORS.panelMid})`,
      border: dark
        ? "2px solid rgba(123,255,241,.34)"
        : "3px solid rgba(247,255,249,.92)",
      boxShadow: dark
        ? `0 0 0 2px rgba(5,18,47,.92), 0 24px 70px rgba(2,7,26,.45), inset 0 0 36px rgba(68,234,222,.045)`
        : `0 0 0 3px ${COLORS.panelDark}, 0 0 0 6px rgba(7,23,51,.9), 0 26px 70px rgba(2,7,24,.42), inset 8px 8px 0 rgba(255,255,255,.72), inset -8px -8px 0 rgba(72,96,94,.18)`,
      clipPath:
        "polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)",
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        top: 0,
        height: 3,
        background: accent,
        boxShadow: `0 0 16px ${accent}`,
        opacity: 0.72,
      }}
    />
    {children}
  </div>
);

const LegacyServer: React.FC<{
  readonly progress: number;
  readonly time: number;
  readonly complete: number;
}> = ({ progress, time, complete }) => {
  const remaining = Math.max(0, Math.round((1 - progress) * 2048));
  const reelRotation = time * 94 * (1 - complete * 0.78);

  return (
    <BeveledPanel
      accent={COLORS.amber}
      style={{
        left: 104,
        top: 226,
        width: 420,
        height: 522,
        opacity: 1 - complete * 0.28,
        transform: `translateX(${-complete * 12}px)`,
      }}
    >
      <div
        style={{
          height: 56,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.56), rgba(133,153,146,.18))",
          borderBottom: `3px solid ${COLORS.panelDark}`,
        }}
      >
        <DotMatrixText size={19} letterSpacing={1.8}>
          LEGACY SERVER
        </DotMatrixText>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((index) => (
            <div
              key={`legacy-led-${index}`}
              style={{
                width: 10,
                height: 10,
                background:
                  index === 0
                    ? interpolateColors(
                        complete,
                        [0, 1],
                        [COLORS.amber, COLORS.mint],
                      )
                    : index === 1
                      ? COLORS.cyan
                      : COLORS.inkSoft,
                boxShadow:
                  index < 2
                    ? `0 0 10px ${index === 0 ? COLORS.amber : COLORS.cyan}`
                    : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: 76,
          height: 126,
          border: `3px solid ${COLORS.panelDark}`,
          background: "linear-gradient(155deg, #0b2034, #071422 68%, #102d3c)",
          boxShadow:
            "inset 0 0 0 4px rgba(0,0,0,.38), inset 0 0 30px rgba(70,244,231,.07)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 17,
            width: 92,
            height: 92,
          }}
        >
          {[0, 1].map((index) => (
            <div
              key={`reel-${index}`}
              style={{
                position: "absolute",
                left: index * 54,
                top: 18,
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: `5px solid ${COLORS.panelMid}`,
                background:
                  "radial-gradient(circle, #112c3c 0 7px, #82928c 8px 11px, transparent 12px)",
                transform: `rotate(${
                  index === 0 ? reelRotation : -reelRotation * 1.12
                }deg)`,
                boxShadow: "0 0 0 2px #435a59",
              }}
            >
              {[0, 1, 2].map((spoke) => (
                <div
                  key={`spoke-${index}-${spoke}`}
                  style={{
                    position: "absolute",
                    left: 19,
                    top: 4,
                    width: 4,
                    height: 32,
                    background: COLORS.panelDark,
                    transform: `rotate(${spoke * 120}deg)`,
                    transformOrigin: "2px 20px",
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            right: 18,
            top: 20,
            width: 206,
          }}
        >
          <DotMatrixText color={COLORS.amberSoft} size={15} letterSpacing={1.4}>
            VOLUME /dev/rk04
          </DotMatrixText>
          <DotMatrixText
            color={COLORS.cyan}
            size={28}
            letterSpacing={1.2}
            style={{ marginTop: 11 }}
          >
            {remaining.toString().padStart(4, "0")} GB
          </DotMatrixText>
          <DotMatrixText
            color="rgba(190,255,247,.55)"
            size={12}
            letterSpacing={1.3}
            style={{ marginTop: 9 }}
          >
            COBOL / EBCDIC / RAID-5
          </DotMatrixText>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: 220,
          bottom: 54,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {RECORD_ROWS.map((record, index) => {
          const rowThreshold = 0.12 + index * 0.16;
          const rowMigrated = clamp01(
            (progress - rowThreshold) / Math.max(0.001, 1 - rowThreshold),
          );
          const light =
            progress < rowThreshold
              ? COLORS.amber
              : rowMigrated < 0.92
                ? COLORS.cyan
                : COLORS.mint;
          return (
            <div
              key={record}
              style={{
                height: 48,
                display: "grid",
                gridTemplateColumns: "20px 126px 1fr 48px",
                alignItems: "center",
                gap: 8,
                padding: "0 12px",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.55), rgba(95,118,113,.13))",
                borderTop: "2px solid rgba(255,255,255,.7)",
                borderBottom: `2px solid ${COLORS.panelDark}`,
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  background: light,
                  boxShadow: `0 0 8px ${light}`,
                }}
              />
              <DotMatrixText size={13} letterSpacing={0.8}>
                {record}
              </DotMatrixText>
              <div
                style={{
                  height: 12,
                  padding: 2,
                  background: COLORS.ink,
                  boxShadow: "inset 0 0 0 2px #435a59",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(0, 1 - rowMigrated) * 100}%`,
                    height: "100%",
                    background: rowMigrated > 0.94 ? COLORS.mint : COLORS.amber,
                  }}
                />
              </div>
              <DotMatrixText
                size={11}
                letterSpacing={0.6}
                color={rowMigrated > 0.94 ? "#126c50" : COLORS.inkSoft}
                align="right"
              >
                {rowMigrated > 0.94 ? "MOVED" : "READ"}
              </DotMatrixText>
            </div>
          );
        })}
      </div>

      <DotMatrixText
        size={13}
        letterSpacing={1.4}
        color={interpolateColors(complete, [0, 1], [COLORS.inkSoft, "#196b50"])}
        style={{ position: "absolute", left: 25, bottom: 20 }}
      >
        <span style={{ position: "relative", display: "block", height: 15 }}>
          <span
            style={{
              position: "absolute",
              left: 0,
              opacity: 1 - segment(complete, 0, 0.46),
            }}
          >
            PORT 3270 // ACTIVE
          </span>
          <span
            style={{
              position: "absolute",
              left: 0,
              opacity: segment(complete, 0.54, 1),
            }}
          >
            SOURCE ARCHIVED // READ-ONLY
          </span>
        </span>
      </DotMatrixText>
    </BeveledPanel>
  );
};

const DestinationCloud: React.FC<{
  readonly progress: number;
  readonly time: number;
  readonly complete: number;
}> = ({ progress, time, complete }) => {
  const records = Math.round(progress * 2487560);
  const destinationAccent = interpolateColors(
    complete,
    [0, 1],
    [COLORS.cyan, COLORS.mint],
  );

  return (
    <BeveledPanel
      dark
      accent={destinationAccent}
      style={{
        left: 1396,
        top: 226,
        width: 420,
        height: 522,
        transform: `translateX(${complete * 12}px)`,
        boxShadow: `0 0 0 2px rgba(5,18,47,.92), 0 24px 70px rgba(2,7,26,.45), 0 0 ${
          24 + complete * 42
        }px rgba(73,244,227,${0.1 + complete * 0.15})`,
      }}
    >
      <div
        style={{
          height: 56,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(180deg, rgba(84,130,169,.18), rgba(7,21,55,.16))",
          borderBottom: "2px solid rgba(125,255,241,.24)",
        }}
      >
        <DotMatrixText color={COLORS.cyanSoft} size={19} letterSpacing={1.8}>
          CLOUD SYSTEM
        </DotMatrixText>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            color: destinationAccent,
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              background: destinationAccent,
              boxShadow: `0 0 10px ${destinationAccent}`,
            }}
          />
          <span
            style={{
              position: "relative",
              display: "block",
              width: 82,
              height: 14,
            }}
          >
            <span
              style={{
                position: "absolute",
                right: 0,
                opacity: 1 - segment(complete, 0, 0.46),
              }}
            >
              RECEIVING
            </span>
            <span
              style={{
                position: "absolute",
                right: 0,
                opacity: segment(complete, 0.54, 1),
              }}
            >
              ONLINE
            </span>
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 45,
          top: 78,
          width: 330,
          height: 250,
        }}
      >
        <CloudGlyph progress={progress} time={time} complete={complete} />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 113,
            transform: `translate(-50%, -50%) scale(${mix(
              0.84,
              1,
              segment(frameSafe(progress), 0.6, 1),
            )})`,
            width: 86,
            height: 86,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: segment(progress, 0.52, 0.72),
            background: "rgba(5,26,55,.76)",
            border: `3px solid ${destinationAccent}`,
            borderRadius: "50%",
            boxShadow: `0 0 26px rgba(73,244,227,.28)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1 - segment(complete, 0, 0.46),
              transform: `scale(${mix(1, 0.82, complete)})`,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48">
              <path
                d="M14 22V16C14 10.5 18.5 6 24 6S34 10.5 34 16V22"
                fill="none"
                stroke={COLORS.cyanSoft}
                strokeWidth="4"
              />
              <rect
                x="9"
                y="21"
                width="30"
                height="23"
                fill="rgba(73,244,227,.16)"
                stroke={COLORS.cyanSoft}
                strokeWidth="3"
              />
              <rect x="21" y="29" width="6" height="9" fill={COLORS.cyanSoft} />
            </svg>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: segment(complete, 0.54, 1),
              transform: `scale(${mix(0.82, 1, complete)})`,
            }}
          >
            <CheckGlyph size={48} color={COLORS.mintSoft} stroke={3.2} />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 24,
          height: 162,
          padding: "17px 20px",
          border: "2px solid rgba(114,255,240,.23)",
          background: "rgba(3,18,48,.64)",
          display: "grid",
          gridTemplateRows: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {[
          {
            label: "RECORDS",
            value: records.toLocaleString("en-US"),
            color: COLORS.cyanSoft,
          },
          {
            label: "SCHEMA",
            value: progress < 0.42 ? "MAPPING" : "POSTGRES 17",
            color: progress < 0.42 ? COLORS.amber : COLORS.mint,
          },
          {
            label: "ENCRYPTION",
            value: progress < 0.3 ? "NEGOTIATING" : "AES-256",
            color: progress < 0.3 ? COLORS.amber : COLORS.mint,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(115,255,241,.13)",
            }}
          >
            <DotMatrixText
              size={12}
              letterSpacing={1.5}
              color="rgba(192,255,248,.55)"
            >
              {item.label}
            </DotMatrixText>
            <DotMatrixText
              size={15}
              letterSpacing={1}
              color={item.color}
              align="right"
            >
              {item.value}
            </DotMatrixText>
          </div>
        ))}
      </div>
    </BeveledPanel>
  );
};

const frameSafe = (value: number) => value;

const TransferPacket: React.FC<{
  readonly index: number;
  readonly frame: number;
  readonly active: number;
  readonly complete: number;
}> = ({ index, frame, active, complete }) => {
  const local = modulo((frame - 226 - index * 31) / 166);
  const visible =
    active *
    segment(local, 0, 0.08, Easing.out(Easing.cubic)) *
    (1 - segment(local, 0.9, 1, Easing.in(Easing.cubic))) *
    (1 - complete);
  const x = mix(536, 1390, local);
  const y =
    556 -
    Math.sin(local * Math.PI) * (54 + (index % 3) * 13) +
    Math.sin((local * 3 + index) * Math.PI) * 5;
  const color =
    index % 4 === 0
      ? COLORS.amberSoft
      : index % 3 === 0
        ? COLORS.mintSoft
        : COLORS.cyanSoft;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: index % 3 === 0 ? 30 : 20,
        height: 13,
        transform: `translate(-50%, -50%) rotate(${Math.sin(local * Math.PI) * 5}deg)`,
        opacity: visible,
        background: color,
        border: "2px solid rgba(255,255,255,.72)",
        boxShadow: `0 0 15px ${color}`,
        zIndex: 7,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "110%",
          top: 4,
          width: 34 + index * 2,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color})`,
          opacity: 0.48,
        }}
      />
    </div>
  );
};

const TransferBridge: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly progress: number;
  readonly complete: number;
}> = ({ frame, time, progress, complete }) => {
  const activeTransfer =
    segment(frame, 210, 238) * (1 - segment(frame, 748, 770));
  const displayPercent =
    progress >= 1 ? 100 : Math.min(99, Math.floor(progress * 100));
  const checksumProgress = clamp01((progress - 0.42) / 0.58);
  const checksumPercent =
    checksumProgress >= 1
      ? 100
      : Math.min(99, Math.floor(checksumProgress * 100));
  const packets = Math.round(progress * 2487560);
  const speed =
    frame < 210
      ? "0 MB/s"
      : complete > 0.75
        ? "IDLE"
        : `${Math.round(620 + Math.sin(time * 2.3) * 56)} MB/s`;
  const regularOpacity = 1 - segment(frame, 762, 774, Easing.in(Easing.cubic));
  const heroOpacity = segment(frame, 778, 800, Easing.out(Easing.cubic));
  const accent = interpolateColors(
    complete,
    [0, 1],
    [COLORS.cyan, COLORS.mint],
  );

  const statusItems = [
    { start: 0, end: 240, label: "INVENTORY SCAN", color: COLORS.amber },
    {
      start: 240,
      end: 390,
      label: "TRANSFORMING SCHEMA",
      color: COLORS.cobalt,
    },
    { start: 390, end: 650, label: "TRANSFERRING RECORDS", color: COLORS.cyan },
    { start: 650, end: 774, label: "VERIFYING CHECKSUM", color: COLORS.mint },
  ] as const;

  return (
    <>
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0, zIndex: 3 }}
      >
        <defs>
          <linearGradient
            id="migration-route-gradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0" stopColor={COLORS.amber} />
            <stop offset="0.48" stopColor={COLORS.cyan} />
            <stop offset="1" stopColor={accent} />
          </linearGradient>
          <filter id="migration-route-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M520 556 C720 462 821 472 960 524 C1099 472 1200 462 1400 556"
          fill="none"
          stroke="rgba(104,255,241,.14)"
          strokeWidth="28"
        />
        <path
          d="M520 556 C720 462 821 472 960 524 C1099 472 1200 462 1400 556"
          fill="none"
          stroke="rgba(10,23,58,.9)"
          strokeWidth="16"
        />
        <path
          d="M520 556 C720 462 821 472 960 524 C1099 472 1200 462 1400 556"
          fill="none"
          stroke="url(#migration-route-gradient)"
          strokeWidth="4"
          strokeDasharray="16 12"
          strokeDashoffset={-time * 82}
          filter="url(#migration-route-glow)"
          opacity={0.48 + activeTransfer * 0.45}
        />
      </svg>

      {Array.from({ length: 10 }, (_, index) => (
        <TransferPacket
          key={`packet-${index}`}
          index={index}
          frame={frame}
          active={activeTransfer}
          complete={complete}
        />
      ))}

      <BeveledPanel
        dark
        accent={accent}
        style={{
          left: 590,
          top: 226,
          width: 740,
          height: 522,
          zIndex: 5,
          boxShadow: `0 0 0 2px rgba(5,18,47,.92), 0 24px 70px rgba(2,7,26,.52), 0 0 ${
            24 + complete * 42
          }px rgba(73,244,227,${0.08 + complete * 0.14})`,
        }}
      >
        <div
          style={{
            height: 56,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg, rgba(84,130,169,.18), rgba(7,21,55,.16))",
            borderBottom: "2px solid rgba(125,255,241,.24)",
          }}
        >
          <DotMatrixText color={COLORS.cyanSoft} size={19} letterSpacing={1.8}>
            DATA BRIDGE // CHANNEL A
          </DotMatrixText>
          <DotMatrixText
            color="rgba(191,255,248,.5)"
            size={12}
            letterSpacing={1.4}
          >
            TLS 1.3 / CRC64
          </DotMatrixText>
        </div>

        <div style={{ opacity: regularOpacity }}>
          <div
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              top: 87,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div style={{ height: 70, position: "relative", width: 390 }}>
              {statusItems.map((item) => (
                <DotMatrixText
                  key={item.label}
                  color={item.color}
                  size={24}
                  letterSpacing={2.2}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    opacity: phaseOpacity(frame, item.start, item.end, 10),
                    textShadow: `0 0 16px ${item.color}`,
                  }}
                >
                  {item.label}
                </DotMatrixText>
              ))}
              <DotMatrixText
                size={12}
                letterSpacing={1.7}
                color="rgba(189,255,248,.47)"
                style={{ position: "absolute", left: 0, top: 39 }}
              >
                BATCH / 08C4-79A2 / NO ROLLBACK
              </DotMatrixText>
            </div>

            <DotMatrixText
              color={accent}
              size={68}
              letterSpacing={-2}
              align="right"
              style={{
                marginTop: -8,
                lineHeight: 0.88,
                textShadow: `0 0 22px ${accent}`,
              }}
            >
              {displayPercent.toString().padStart(3, "0")}%
            </DotMatrixText>
          </div>

          <div
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              top: 178,
              height: 58,
              padding: 8,
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gap: 6,
              background: "rgba(2,14,39,.76)",
              border: "2px solid rgba(124,255,242,.21)",
              boxShadow: "inset 0 0 0 3px rgba(0,0,0,.32)",
            }}
          >
            {Array.from({ length: 24 }, (_, index) => {
              const threshold = (index + 1) / 24;
              const active = progress >= threshold;
              const newest =
                active &&
                progress < Math.min(1, threshold + 1 / 24) &&
                progress < 1;
              return (
                <div
                  key={`progress-block-${index}`}
                  style={{
                    position: "relative",
                    background: active
                      ? interpolateColors(
                          complete,
                          [0, 1],
                          [index < 5 ? COLORS.amber : COLORS.cyan, COLORS.mint],
                        )
                      : "rgba(93,132,151,.16)",
                    border: active
                      ? "1px solid rgba(225,255,251,.66)"
                      : "1px solid rgba(102,157,170,.18)",
                    boxShadow: newest
                      ? `0 0 18px ${COLORS.cyan}, inset 0 0 7px rgba(255,255,255,.65)`
                      : active
                        ? "inset 0 0 7px rgba(255,255,255,.2)"
                        : undefined,
                  }}
                >
                  {newest ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: COLORS.cyanSoft,
                        opacity: 0.35 + Math.sin(time * TAU * 3) * 0.2,
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              top: 263,
              display: "grid",
              gridTemplateColumns: "1.45fr 1fr 1fr",
              gap: 12,
            }}
          >
            {[
              {
                label: "RECORDS MOVED",
                value: packets.toLocaleString("en-US"),
                color: COLORS.cyanSoft,
              },
              { label: "THROUGHPUT", value: speed, color: COLORS.cyan },
              {
                label: "ERRORS",
                value: "0",
                color: COLORS.mint,
              },
            ].map((metric) => (
              <div
                key={metric.label}
                style={{
                  height: 82,
                  padding: "13px 15px",
                  border: "2px solid rgba(111,255,241,.18)",
                  background: "rgba(4,19,49,.58)",
                }}
              >
                <DotMatrixText
                  size={11}
                  letterSpacing={1.5}
                  color="rgba(190,255,248,.48)"
                >
                  {metric.label}
                </DotMatrixText>
                <DotMatrixText
                  size={22}
                  letterSpacing={0.9}
                  color={metric.color}
                  style={{ marginTop: 9 }}
                >
                  {metric.value}
                </DotMatrixText>
              </div>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              bottom: 33,
              height: 86,
              padding: "15px 18px",
              background: "rgba(3,17,45,.78)",
              border: "2px solid rgba(111,255,241,.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <DotMatrixText
                size={12}
                letterSpacing={1.6}
                color="rgba(193,255,249,.58)"
              >
                CHECKSUM VERIFICATION
              </DotMatrixText>
              <DotMatrixText
                size={13}
                letterSpacing={1.2}
                color={checksumPercent === 100 ? COLORS.mint : COLORS.cyan}
              >
                {checksumPercent.toString().padStart(3, "0")}% / CRC64
              </DotMatrixText>
            </div>
            <div
              style={{
                height: 9,
                marginTop: 13,
                background: "rgba(95,139,155,.16)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${checksumPercent}%`,
                  background:
                    checksumPercent === 100
                      ? COLORS.mint
                      : `linear-gradient(90deg, ${COLORS.cobalt}, ${COLORS.cyan})`,
                  boxShadow: `0 0 12px ${
                    checksumPercent === 100 ? COLORS.mint : COLORS.cyan
                  }`,
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            top: 56,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: heroOpacity,
            transform: `translateY(${mix(
              18,
              0,
              segment(frame, 774, 810, Easing.out(Easing.cubic)),
            )}px)`,
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `4px solid ${COLORS.mint}`,
              background: "rgba(76,245,179,.12)",
              boxShadow:
                "0 0 0 12px rgba(76,245,179,.055), 0 0 36px rgba(76,245,179,.34)",
            }}
          >
            <CheckGlyph size={58} color={COLORS.mintSoft} stroke={3.3} />
          </div>
          <DotMatrixText
            color={COLORS.mintSoft}
            size={38}
            letterSpacing={2.7}
            align="center"
            style={{
              marginTop: 28,
              textShadow: "0 0 22px rgba(98,246,181,.5)",
            }}
          >
            MIGRATION COMPLETE
          </DotMatrixText>
          <DotMatrixText
            color={COLORS.mint}
            size={72}
            letterSpacing={-2}
            align="center"
            style={{ marginTop: 13 }}
          >
            100%
          </DotMatrixText>
          <div
            style={{
              marginTop: 25,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 20px",
              border: "2px solid rgba(98,246,181,.38)",
              background: "rgba(14,78,68,.24)",
            }}
          >
            <CheckGlyph size={20} color={COLORS.mint} />
            <DotMatrixText
              color={COLORS.mintSoft}
              size={14}
              letterSpacing={1.7}
            >
              2,487,560 RECORDS / CHECKSUM VERIFIED / 0 ERRORS
            </DotMatrixText>
          </div>
        </div>
      </BeveledPanel>
    </>
  );
};

const StageRail: React.FC<{
  readonly progress: number;
  readonly frame: number;
  readonly complete: number;
}> = ({ progress, frame, complete }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 104,
        right: 104,
        top: 795,
        height: 130,
        zIndex: 8,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 68,
          right: 68,
          top: 34,
          height: 5,
          background: "rgba(89,163,171,.18)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: interpolateColors(
              complete,
              [0, 1],
              [COLORS.cyan, COLORS.mint],
            ),
            boxShadow: `0 0 15px ${interpolateColors(
              complete,
              [0, 1],
              [COLORS.cyan, COLORS.mint],
            )}`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {STAGES.map((stage, index) => {
          const reached = progress >= stage.threshold;
          const stageStart = index === 0 ? 0 : STAGES[index - 1].threshold;
          const active = progress >= stageStart && progress < stage.threshold;
          const color = reached
            ? COLORS.mint
            : active
              ? index === 0
                ? COLORS.amber
                : COLORS.cyan
              : "rgba(126,177,180,.34)";
          const pulse = 0.5 + 0.5 * Math.sin(frame * 0.09 + index);

          return (
            <div
              key={stage.label}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(145deg, #102c55, #071735)",
                  border: `3px solid ${color}`,
                  boxShadow:
                    active || reached
                      ? `0 0 ${active ? 14 + pulse * 12 : 14}px ${color}`
                      : "0 0 0 3px rgba(4,14,36,.8)",
                }}
              >
                {reached ? (
                  <CheckGlyph size={34} color={COLORS.mintSoft} />
                ) : active ? (
                  <ArrowGlyph color={color} />
                ) : (
                  <DotMatrixText
                    color="rgba(173,217,216,.38)"
                    size={16}
                    letterSpacing={0}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </DotMatrixText>
                )}
              </div>
              <DotMatrixText
                size={14}
                letterSpacing={1.6}
                color={reached ? COLORS.mintSoft : color}
                align="center"
                style={{
                  marginTop: 14,
                  textShadow:
                    active || reached ? `0 0 12px ${color}` : undefined,
                }}
              >
                {stage.label}
              </DotMatrixText>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Header: React.FC<{
  readonly frame: number;
  readonly time: number;
  readonly complete: number;
}> = ({ frame, time, complete }) => {
  const boot = segment(frame, 8, 50, Easing.out(Easing.cubic));
  const accent = interpolateColors(
    complete,
    [0, 1],
    [COLORS.cyan, COLORS.mint],
  );
  const pulse = 0.5 + 0.5 * Math.sin(time * TAU * 0.8);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 104,
          right: 104,
          top: 60,
          height: 112,
          opacity: boot,
          transform: `translateY(${mix(-16, 0, boot)}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <div>
          <DotMatrixText
            color={COLORS.cyanSoft}
            size={34}
            letterSpacing={3.4}
            style={{ textShadow: "0 0 20px rgba(73,244,227,.36)" }}
          >
            LEGACY DATA MIGRATION
          </DotMatrixText>
          <DotMatrixText
            color="rgba(192,255,248,.51)"
            size={13}
            letterSpacing={2.1}
            style={{ marginTop: 13 }}
          >
            MAINFRAME MODERNIZATION / ZERO-DOWNTIME PIPELINE
          </DotMatrixText>
        </div>

        <div
          style={{
            position: "absolute",
            right: 0,
            top: 15,
            width: 236,
            height: 66,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "15px 18px",
            boxSizing: "border-box",
            border: `2px solid ${accent}`,
            background: "rgba(4,20,50,.62)",
            boxShadow: `0 0 ${12 + pulse * 10}px rgba(73,244,227,.18)`,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              background: accent,
              boxShadow: `0 0 13px ${accent}`,
            }}
          />
          <div>
            <DotMatrixText
              color={accent}
              size={15}
              letterSpacing={1.7}
              align="right"
            >
              <span
                style={{
                  position: "relative",
                  display: "block",
                  width: 158,
                  height: 17,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    opacity: 1 - segment(complete, 0, 0.46),
                  }}
                >
                  LIVE MIGRATION
                </span>
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    opacity: segment(complete, 0.54, 1),
                  }}
                >
                  CUTOVER READY
                </span>
              </span>
            </DotMatrixText>
            <DotMatrixText
              color="rgba(190,255,248,.43)"
              size={10}
              letterSpacing={1.4}
              align="right"
              style={{ marginTop: 5 }}
            >
              SESSION 08C4 / NODE 04
            </DotMatrixText>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 104,
          right: 104,
          top: 182,
          height: 2,
          opacity: boot * 0.62,
          background:
            "linear-gradient(90deg, transparent, rgba(104,255,242,.7) 8%, rgba(104,255,242,.24) 50%, rgba(104,255,242,.7) 92%, transparent)",
        }}
      />
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const time = frame / fps;
  const progress = getMigrationProgress(frame);
  const complete = segment(frame, 762, 810, Easing.inOut(Easing.cubic));
  const intro = segment(frame, 0, 38, Easing.out(Easing.cubic));
  const cameraPush = segment(frame, 40, 650, Easing.inOut(Easing.cubic));
  const cameraRelease = segment(
    frame,
    762,
    Math.min(durationInFrames - 1, 850),
    Easing.inOut(Easing.cubic),
  );
  const cameraScale = 1 + cameraPush * 0.018 - cameraRelease * 0.009;
  const cameraY = -cameraPush * 5 + cameraRelease * 3;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: COLORS.deep,
        color: COLORS.cyanSoft,
      }}
    >
      <Background time={time} />

      <AbsoluteFill
        style={{
          opacity: intro,
          transform: `translateY(${cameraY}px) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Header frame={frame} time={time} complete={complete} />
        <LegacyServer progress={progress} time={time} complete={complete} />
        <TransferBridge
          frame={frame}
          time={time}
          progress={progress}
          complete={complete}
        />
        <DestinationCloud progress={progress} time={time} complete={complete} />
        <StageRail progress={progress} frame={frame} complete={complete} />

        <DotMatrixText
          size={11}
          letterSpacing={1.8}
          color="rgba(189,255,248,.34)"
          style={{
            position: "absolute",
            left: 104,
            bottom: 54,
          }}
        >
          MIGRATION ENGINE v8.4.2 / TRANSACTION LOG ACTIVE
        </DotMatrixText>
        <DotMatrixText
          size={11}
          letterSpacing={1.8}
          color="rgba(189,255,248,.34)"
          align="right"
          style={{
            position: "absolute",
            right: 104,
            bottom: 54,
          }}
        >
          <span
            style={{
              position: "relative",
              display: "block",
              width: 320,
              height: 13,
            }}
          >
            <span
              style={{
                position: "absolute",
                right: 0,
                opacity: 1 - segment(complete, 0, 0.46),
              }}
            >
              RECOVERY POINT / SYNCHRONIZING
            </span>
            <span
              style={{
                position: "absolute",
                right: 0,
                opacity: segment(complete, 0.54, 1),
              }}
            >
              RECOVERY POINT VERIFIED / READY
            </span>
          </span>
        </DotMatrixText>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 61%, rgba(2,7,24,.28) 100%)",
          boxShadow: "inset 0 0 110px rgba(2,6,22,.42)",
        }}
      />
    </AbsoluteFill>
  );
};
