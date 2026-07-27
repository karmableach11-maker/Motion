import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const W = 1920;
const H = 1080;
const TAU = Math.PI * 2;

// Approved source silhouette. The same path is reused for the body, clip,
// border, glow, and tracer so the cloud can never split along its left lobe.
const CLOUD_PATH =
  "M343.454 170.099C343.464 169.516 343.476 168.934 343.476 168.349C343.476 112.621 298.299 67.444 242.571 67.444C194.546 67.444 154.362 100.995 144.168 145.936C134.663 140.615 123.714 137.568 112.046 137.568C75.639 137.568 46.126 167.082 46.126 203.488C46.126 204.976 46.193 206.447 46.29 207.911C19.262 217.944 0 243.959 0 274.479C0 313.686 31.784 345.47 70.991 345.47H324.174C373.183 345.47 412.913 305.74 412.913 256.731C412.913 214.343 383.192 178.903 343.454 170.099Z";
const CLOUD_TRANSFORM = "translate(50 -20) scale(1.45)";

const COLORS = {
  bg: "#04091c",
  bg2: "#07142c",
  cyan: "#3debf5",
  cyanSoft: "#8ffaff",
  blue: "#4b72ff",
  violet: "#7a5cff",
  mint: "#69f6b7",
  text: "#f5fbff",
  textSoft: "#91a9bd",
  line: "rgba(104,184,220,.24)",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, amount: number) =>
  a + (b - a) * amount;
const modulo = (value: number, length = 1) =>
  ((value % length) + length) % length;

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 91.731 + 18.177) * 47453.5453;
  return value - Math.floor(value);
};

const segment = (
  progress: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.out(Easing.cubic),
) =>
  interpolate(progress, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

type Point = {x: number; y: number};

const quadraticPoint = (
  start: Point,
  control: Point,
  end: Point,
  amount: number,
): Point => {
  const inverse = 1 - amount;
  return {
    x:
      inverse * inverse * start.x +
      2 * inverse * amount * control.x +
      amount * amount * end.x,
    y:
      inverse * inverse * start.y +
      2 * inverse * amount * control.y +
      amount * amount * end.y,
  };
};

const BACKGROUND_BITS = Array.from({length: 88}, (_, index) => ({
  x: hash01(index * 13 + 2) * W,
  y: hash01(index * 17 + 7) * H,
  size: 9 + hash01(index * 19 + 11) * 14,
  opacity: 0.06 + hash01(index * 23 + 5) * 0.16,
  phase: hash01(index * 29 + 3),
  speed: 9 + hash01(index * 31 + 6) * 22,
  value:
    index % 4 === 0
      ? "AES"
      : index % 4 === 1
        ? `${Math.floor(hash01(index * 37 + 9) * 255)
            .toString(16)
            .padStart(2, "0")}`
        : index % 4 === 2
          ? index % 2
            ? "1"
            : "0"
          : `${Math.floor(hash01(index * 41 + 4) * 999)}`,
}));

const DATA_BLOCKS = Array.from({length: 72}, (_, index) => ({
  x: 102 + (index % 12) * 44,
  y: 178 + Math.floor(index / 12) * 43,
  delay: hash01(index * 43 + 5) * 0.17,
  phase: hash01(index * 47 + 3),
  bright: index % 9 === 0,
}));

const AmbientBackground: React.FC<{time: number}> = ({time}) => {
  const gridShift = modulo(time * 24, 72);
  const sweepX = modulo(time / 7.2) * 2300 - 190;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 51% 45%, #102a55 0%, #08172f 34%, #04091c 72%, #020511 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.34,
          backgroundImage:
            "linear-gradient(rgba(64,162,214,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(64,162,214,.09) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `${gridShift}px ${gridShift * 0.55}px`,
          transform: "perspective(900px) rotateX(58deg) scale(1.35)",
          transformOrigin: "50% 78%",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.15) 28%, #000 72%, rgba(0,0,0,.25) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 72% 50%, rgba(39,201,255,.14), transparent 29%), radial-gradient(ellipse at 26% 52%, rgba(77,75,255,.12), transparent 30%)",
        }}
      />

      {BACKGROUND_BITS.map((bit, index) => {
        const y = modulo(bit.y + time * bit.speed + bit.phase * H, H + 90) - 45;
        const flicker =
          0.5 +
          0.5 *
            Math.sin((time * (0.23 + (index % 4) * 0.04) + bit.phase) * TAU) **
              2;
        return (
          <div
            key={`ambient-bit-${index}`}
            style={{
              position: "absolute",
              left: bit.x,
              top: y,
              color: index % 7 === 0 ? COLORS.cyanSoft : COLORS.cyan,
              opacity: bit.opacity * flicker,
              fontFamily:
                "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
              fontSize: bit.size,
              fontWeight: 600,
              letterSpacing: 0.8,
              textShadow: "0 0 9px rgba(61,235,245,.45)",
            }}
          >
            {bit.value}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: sweepX,
          top: -300,
          width: 210,
          height: 1680,
          transform: "rotate(18deg)",
          opacity: 0.16,
          background:
            "linear-gradient(90deg, transparent, rgba(102,244,255,.74), transparent)",
          filter: "blur(32px)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 52%, transparent 30%, rgba(0,4,18,.38) 70%, rgba(0,2,10,.86) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC<{progress: number; time: number}> = ({
  progress,
  time,
}) => {
  const reveal = segment(progress, 0.01, 0.105);
  const statusReveal = segment(progress, 0.05, 0.16);
  const dotPulse = 0.55 + Math.sin(time * TAU * 0.9) * 0.26;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 66,
          width: 1070,
          opacity: reveal,
          transform: `translateY(${mix(26, 0, reveal)}px)`,
          zIndex: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            color: COLORS.cyan,
            fontFamily:
              "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          <span
            style={{
              width: 42,
              height: 2,
              background: COLORS.cyan,
              boxShadow: "0 0 12px rgba(61,235,245,.8)",
            }}
          />
          AUTOMATED DISASTER RECOVERY
        </div>
        <div
          style={{
            marginTop: 14,
            color: COLORS.text,
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: -2.2,
            lineHeight: 1,
            textShadow: "0 8px 34px rgba(0,0,0,.34)",
          }}
        >
          ENCRYPTED CLOUD BACKUP
        </div>
        <div
          style={{
            marginTop: 16,
            color: COLORS.textSoft,
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 21,
            fontWeight: 500,
            letterSpacing: 0.35,
          }}
        >
          Client-side encryption&nbsp;&nbsp;•&nbsp;&nbsp;Immutable
          storage&nbsp;&nbsp;•&nbsp;&nbsp;Multi-region replication
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 88,
          top: 78,
          height: 48,
          padding: "0 21px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: "1px solid rgba(105,246,183,.35)",
          borderRadius: 24,
          background: "rgba(5,25,39,.72)",
          boxShadow:
            "inset 0 0 20px rgba(105,246,183,.06), 0 10px 34px rgba(0,0,0,.22)",
          color: "#b8ffd8",
          fontFamily:
            "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 1.5,
          opacity: statusReveal,
          transform: `translateX(${mix(30, 0, statusReveal)}px)`,
          zIndex: 40,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: COLORS.mint,
            opacity: dotPulse,
            boxShadow: "0 0 14px rgba(105,246,183,.9)",
          }}
        />
        BACKUP SERVICE ONLINE
      </div>
    </>
  );
};

type FileCardSpec = {
  name: string;
  type: string;
  size: string;
  y: number;
  color: string;
  start: number;
};

const FILE_CARDS: FileCardSpec[] = [
  {
    name: "FINANCE_2026",
    type: "DATABASE",
    size: "684 GB",
    y: 326,
    color: "#45d7ff",
    start: 0.07,
  },
  {
    name: "PROJECT_FILES",
    type: "DOCUMENTS",
    size: "426 GB",
    y: 496,
    color: "#7969ff",
    start: 0.105,
  },
  {
    name: "MEDIA_ARCHIVE",
    type: "ASSET LIBRARY",
    size: "712 GB",
    y: 666,
    color: "#38efc1",
    start: 0.14,
  },
];

const FileIcon: React.FC<{color: string}> = ({color}) => (
  <svg width="46" height="54" viewBox="0 0 46 54">
    <path
      d="M7 2.5H29L40 13.5V49.5C40 51.2 38.7 52.5 37 52.5H7C5.3 52.5 4 51.2 4 49.5V5.5C4 3.8 5.3 2.5 7 2.5Z"
      fill="rgba(8,20,42,.75)"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M29 2.5V14H40" fill="none" stroke={color} strokeWidth="2" />
    <path d="M11 27H33M11 35H30M11 43H25" stroke={color} strokeWidth="2" />
  </svg>
);

const FileIngress: React.FC<{
  progress: number;
  time: number;
  uploadProgress: number;
}> = ({progress, time, uploadProgress}) => {
  const sectionOpacity =
    segment(progress, 0.025, 0.1) * (1 - segment(progress, 0.82, 0.9) * 0.42);
  const flowGate =
    segment(progress, 0.08, 0.15) * (1 - segment(progress, 0.61, 0.7));

  return (
    <div style={{opacity: sectionOpacity}}>
      <div
        style={{
          position: "absolute",
          left: 104,
          top: 247,
          color: "#7594aa",
          fontFamily:
            "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 2.8,
        }}
      >
        SOURCE DATA
      </div>

      {FILE_CARDS.map((card, index) => {
        const enter = segment(progress, card.start, card.start + 0.075);
        const cardProgress = clamp01(
          (uploadProgress - index * 0.25) / Math.max(0.001, 1 - index * 0.25),
        );
        const complete = segment(cardProgress, 0.78, 0.98);
        return (
          <div
            key={card.name}
            style={{
              position: "absolute",
              left: 100,
              top: card.y,
              width: 396,
              height: 128,
              borderRadius: 19,
              border: `1px solid ${card.color}4f`,
              background:
                "linear-gradient(135deg, rgba(10,29,54,.9), rgba(7,18,38,.78))",
              boxShadow:
                "inset 0 1px rgba(255,255,255,.05), 0 18px 46px rgba(0,0,0,.25)",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              opacity: enter,
              transform: `translateX(${mix(-70, 0, enter)}px) scale(${mix(
                0.94,
                1,
                enter,
              )})`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${Math.max(4, cardProgress * 100)}%`,
                opacity: 0.12,
                background: `linear-gradient(90deg, ${card.color}, transparent)`,
              }}
            />
            <div
              style={{
                width: 70,
                height: 76,
                borderRadius: 15,
                border: `1px solid ${card.color}42`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${card.color}0f`,
              }}
            >
              <FileIcon color={card.color} />
            </div>
            <div style={{marginLeft: 19, flex: 1}}>
              <div
                style={{
                  color: COLORS.text,
                  fontFamily: "Inter, Arial, sans-serif",
                  fontSize: 22,
                  fontWeight: 750,
                  letterSpacing: 0.3,
                }}
              >
                {card.name}
              </div>
              <div
                style={{
                  marginTop: 7,
                  color: "#6f8aa1",
                  fontFamily:
                    "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1.3,
                }}
              >
                {card.type} · {card.size}
              </div>
            </div>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: `1px solid ${complete > 0.5 ? COLORS.mint : card.color}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: complete > 0.5 ? COLORS.mint : card.color,
                fontFamily:
                  "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                fontSize: complete > 0.5 ? 20 : 12,
                fontWeight: 800,
                boxShadow:
                  complete > 0.5
                    ? "0 0 18px rgba(105,246,183,.14)"
                    : "none",
              }}
            >
              {complete > 0.5
                ? "✓"
                : `${Math.round(cardProgress * 100)
                    .toString()
                    .padStart(2, "0")}`}
            </div>
          </div>
        );
      })}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="ingress-path" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3debf5" stopOpacity="0.12" />
            <stop offset="0.55" stopColor="#5f89ff" stopOpacity="0.62" />
            <stop offset="1" stopColor="#3debf5" stopOpacity="0.18" />
          </linearGradient>
          <filter id="ingress-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {FILE_CARDS.map((card, index) => {
          const start = {x: 498, y: card.y + 64};
          const control = {x: 565, y: 474 + (index - 1) * 25};
          const end = {x: 675, y: 540 + (index - 1) * 38};
          return (
            <path
              key={`ingress-route-${card.name}`}
              d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`}
              fill="none"
              stroke="url(#ingress-path)"
              strokeWidth="2"
              strokeDasharray="5 10"
              opacity={flowGate * 0.8}
            />
          );
        })}

        {Array.from({length: 18}, (_, index) => {
          const lane = index % 3;
          const card = FILE_CARDS[lane];
          const start = {x: 501, y: card.y + 64};
          const control = {x: 565, y: 474 + (lane - 1) * 25};
          const end = {x: 692, y: 540 + (lane - 1) * 38};
          const travel = modulo(time * (0.28 + (index % 4) * 0.025) + index * 0.177);
          const point = quadraticPoint(start, control, end, travel);
          const fade =
            clamp01(travel / 0.08) * clamp01((1 - travel) / 0.1) * flowGate;
          const size = 4 + (index % 3) * 2;
          return (
            <rect
              key={`ingress-packet-${index}`}
              x={point.x - size / 2}
              y={point.y - size / 2}
              width={size}
              height={size}
              rx={1.5}
              fill={lane === 0 ? COLORS.cyan : lane === 1 ? "#8d7aff" : COLORS.mint}
              opacity={fade}
              filter="url(#ingress-glow)"
              transform={`rotate(${travel * 180} ${point.x} ${point.y})`}
            />
          );
        })}
      </svg>
    </div>
  );
};

const LockSymbol: React.FC<{
  progress: number;
  time: number;
  verified: number;
}> = ({progress, time, verified}) => {
  const reveal = segment(progress, 0.15, 0.25);
  const close = segment(progress, 0.22, 0.36, Easing.inOut(Easing.cubic));
  const label = segment(progress, 0.3, 0.405);
  const pulse = 0.7 + 0.3 * Math.sin(time * TAU * 0.75) ** 2;
  const lockAccent = interpolateColors(
    verified,
    [0, 1],
    [COLORS.cyan, COLORS.mint],
  );
  const lockLight = interpolateColors(
    verified,
    [0, 1],
    ["#d6fcff", "#d0ffe6"],
  );
  const lockLabel = verified < 0.5 ? "AES-256" : "CHECKSUM OK";
  const lockLabelVisibility = clamp01(Math.abs(verified - 0.5) / 0.2);

  return (
    <g
      opacity={reveal}
      transform={`translate(350 304) scale(${mix(0.72, 1, reveal)})`}
    >
      <circle
        r="96"
        fill="rgba(4,14,37,.76)"
        stroke="rgba(110,236,255,.24)"
        strokeWidth="2"
      />
      <circle
        r="78"
        fill="none"
        stroke={lockAccent}
        strokeWidth="2"
        strokeDasharray="5 11"
        transform={`rotate(${time * 22})`}
        opacity={0.55}
      />
      <circle
        r="87"
        fill="none"
        pathLength={1}
        stroke={interpolateColors(
          verified,
          [0, 1],
          [COLORS.cyanSoft, "#d0ffe7"],
        )}
        strokeWidth="3"
        strokeDasharray={`${Math.max(0.015, close)} ${1 - Math.max(0.015, close)}`}
        strokeDashoffset="0.25"
        transform="rotate(-90)"
        opacity={pulse}
      />

      <path
        d={`M -35 ${-10 - (1 - close) * 18} V -40 C -35 -86 35 -86 35 -40 V -10`}
        fill="none"
        stroke={lockLight}
        strokeWidth="13"
        strokeLinecap="round"
        opacity={0.96}
      />
      <rect
        x="-56"
        y="-11"
        width="112"
        height="86"
        rx="18"
        fill="url(#lock-body-state)"
        stroke={interpolateColors(
          verified,
          [0, 1],
          ["#a4f8ff", "#a8ffd0"],
        )}
        strokeWidth="2.5"
      />
      <circle cx="0" cy="28" r="11" fill="#07162f" />
      <path d="M -5 37 L 0 54 L 5 37Z" fill="#07162f" />
      <path
        d="M -31 6 C -9 -3 12 -3 31 5"
        fill="none"
        stroke="rgba(255,255,255,.42)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g
        opacity={label}
        transform={`translate(0 128) scale(${mix(0.9, 1, label)})`}
      >
        <rect
          x="-94"
          y="-22"
          width="188"
          height="44"
          rx="22"
          fill="rgba(2,16,34,.82)"
          stroke={interpolateColors(
            verified,
            [0, 1],
            ["rgba(61,235,245,.48)", "rgba(105,246,183,.5)"],
          )}
        />
        <circle
          cx="-67"
          cy="0"
          r="6"
          fill={lockAccent}
          opacity={pulse}
        />
        <text
          x="9"
          y="6"
          textAnchor="middle"
          fill={interpolateColors(
            verified,
            [0, 1],
            ["#c8fbff", "#baffda"],
          )}
          fontFamily="'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
          fontSize="16"
          fontWeight="800"
          letterSpacing="1.7"
          opacity={lockLabelVisibility}
        >
          {lockLabel}
        </text>
      </g>
    </g>
  );
};

const CloudVault: React.FC<{
  progress: number;
  time: number;
  uploadProgress: number;
}> = ({progress, time, uploadProgress}) => {
  const reveal = segment(progress, 0.035, 0.155);
  const floatY = Math.sin((time / 4.4) * TAU) * 4;
  const breathe = 1 + Math.sin((time / 3.2 + 0.2) * TAU) * 0.008;
  const ringPulse = 0.74 + Math.sin((time / 2.7) * TAU) * 0.12;
  const encryptionBurst = segment(progress, 0.34, 0.405);
  const verified = segment(progress, 0.72, 0.8);
  const overallProgress = segment(
    progress,
    0.17,
    0.83,
    Easing.inOut(Easing.cubic),
  );
  const perimeter = modulo(time / 4.2 + 0.73);
  const scanY = 110 + modulo(time / 2.5) * 330;
  const stageLabel =
    progress < 0.48
      ? "ENCRYPTING BEFORE UPLOAD"
      : progress < 0.69
        ? "REPLICATING ACROSS 3 REGIONS"
        : progress < 0.83
          ? "VERIFYING RECOVERY POINTS"
          : "RECOVERY POINT VERIFIED";
  const labelVisibility = Math.min(
    1,
    ...[0.48, 0.69, 0.83].map((boundary) =>
      clamp01(Math.abs(progress - boundary) / 0.013),
    ),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 614,
        top: 282,
        width: 760,
        height: 558,
        opacity: reveal,
        transform: `translateY(${mix(34, 0, reveal) + floatY}px) scale(${
          breathe * mix(0.9, 1, reveal)
        })`,
        transformOrigin: "50% 68%",
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 84,
          width: 640,
          height: 410,
          borderRadius: "50%",
          opacity: ringPulse,
          background:
            "radial-gradient(ellipse, rgba(55,231,255,.24), rgba(51,93,255,.12) 43%, transparent 72%)",
          filter: "blur(32px)",
          transform: "scale(1.15)",
        }}
      />

      <svg
        viewBox="0 0 700 520"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          filter:
            "drop-shadow(0 0 18px rgba(45,225,255,.55)) drop-shadow(0 0 52px rgba(52,88,255,.28))",
        }}
      >
        <defs>
          <clipPath id="backup-cloud-clip">
            <path d={CLOUD_PATH} transform={CLOUD_TRANSFORM} />
          </clipPath>
          <linearGradient id="backup-cloud-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#123d73" stopOpacity="0.92" />
            <stop offset="0.5" stopColor="#0c2e62" stopOpacity="0.88" />
            <stop offset="1" stopColor="#101b50" stopOpacity="0.94" />
          </linearGradient>
          <radialGradient id="backup-cloud-light" cx="48%" cy="54%" r="66%">
            <stop offset="0" stopColor="#24d9f2" stopOpacity="0.26" />
            <stop offset="0.65" stopColor="#3958d7" stopOpacity="0.08" />
            <stop offset="1" stopColor="#030a24" stopOpacity="0.56" />
          </radialGradient>
          <linearGradient id="backup-cloud-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8ffaff" />
            <stop offset="0.47" stopColor="#3debf5" />
            <stop offset="1" stopColor="#7668ff" />
          </linearGradient>
          <linearGradient id="lock-body-state" x1="0" y1="0" x2="1" y2="1">
            <stop
              offset="0"
              stopColor={interpolateColors(
                verified,
                [0, 1],
                ["#57f2fb", "#9cffd0"],
              )}
            />
            <stop
              offset="1"
              stopColor={interpolateColors(
                verified,
                [0, 1],
                ["#4a64e7", "#35c99c"],
              )}
            />
          </linearGradient>
          <filter id="backup-cloud-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="block-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={CLOUD_PATH}
          transform={CLOUD_TRANSFORM}
          fill="rgba(34,91,167,.28)"
          stroke="#217cbf"
          strokeWidth="22"
          vectorEffect="non-scaling-stroke"
          opacity="0.18"
          filter="url(#backup-cloud-glow)"
        />

        <g clipPath="url(#backup-cloud-clip)">
          <rect x="35" y="35" width="630" height="470" fill="url(#backup-cloud-body)" />
          <rect x="35" y="35" width="630" height="470" fill="url(#backup-cloud-light)" />

          {DATA_BLOCKS.map((block, index) => {
            const revealBlock = segment(
              uploadProgress,
              block.delay,
              Math.min(1, block.delay + 0.2),
            );
            const pulse =
              0.54 +
              0.46 *
                Math.sin(
                  (time * (0.31 + (index % 4) * 0.025) + block.phase) * TAU,
                ) **
                  2;
            return (
              <rect
                key={`cloud-block-${index}`}
                x={block.x}
                y={block.y}
                width="31"
                height="21"
                rx="5"
                fill={interpolateColors(
                  verified,
                  [0, 1],
                  [
                    block.bright
                      ? COLORS.cyanSoft
                      : index % 4 === 0
                        ? "#6f71ff"
                        : COLORS.cyan,
                    COLORS.mint,
                  ],
                )}
                opacity={revealBlock * pulse * (block.bright ? 0.9 : 0.52)}
                transform={`scale(${mix(0.25, 1, revealBlock)})`}
                style={{transformBox: "fill-box", transformOrigin: "center"}}
                filter={block.bright ? "url(#block-glow)" : undefined}
              />
            );
          })}

          {Array.from({length: 26}, (_, index) => {
            const x = 88 + hash01(index * 59 + 4) * 525;
            const speed = 0.14 + (index % 5) * 0.022;
            const y = 90 + modulo(hash01(index * 61 + 7) + time * speed) * 395;
            return (
              <text
                key={`cloud-bit-${index}`}
                x={x}
                y={y}
                fill={index % 6 === 0 ? COLORS.cyanSoft : COLORS.cyan}
                fillOpacity={0.13 + (index % 4) * 0.035}
                fontFamily="'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
                fontSize={11 + (index % 3) * 2}
                fontWeight="700"
              >
                {index % 2 ? "10110" : "01101"}
              </text>
            );
          })}

          <rect
            x="45"
            y={scanY - 12}
            width="620"
            height="24"
            fill="rgba(143,250,255,.17)"
            filter="url(#backup-cloud-glow)"
          />
          <line
            x1="48"
            y1={scanY}
            x2="660"
            y2={scanY}
            stroke="#d7ffff"
            strokeWidth="1.3"
            opacity="0.42"
          />
        </g>

        <path
          d={CLOUD_PATH}
          transform={CLOUD_TRANSFORM}
          fill="none"
          stroke="url(#backup-cloud-edge)"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          opacity="0.96"
          filter="url(#backup-cloud-glow)"
        />
        <path
          d={CLOUD_PATH}
          transform={CLOUD_TRANSFORM}
          fill="none"
          pathLength={1}
          stroke={verified > 0.5 ? "#d0ffe7" : "#ffffff"}
          strokeWidth="7"
          vectorEffect="non-scaling-stroke"
          strokeDasharray=".075 .925"
          strokeDashoffset={-perimeter}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.76"
          filter="url(#backup-cloud-glow)"
        />

        <circle
          cx="350"
          cy="304"
          r={100 + encryptionBurst * 80}
          fill="none"
          stroke={COLORS.cyanSoft}
          strokeWidth={3 - encryptionBurst * 2}
          opacity={(1 - encryptionBurst) * 0.72}
        />

        <LockSymbol progress={progress} time={time} verified={verified} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 181,
          bottom: 8,
          width: 398,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily:
            "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
          color: COLORS.textSoft,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1.2,
          opacity: segment(progress, 0.28, 0.4),
        }}
      >
        <span
          style={{
            width: 315,
            display: "inline-block",
            whiteSpace: "nowrap",
            opacity: labelVisibility,
            transform: `translateY(${(1 - labelVisibility) * 5}px)`,
          }}
        >
          {stageLabel}
        </span>
        <span
          style={{
            color: interpolateColors(
              verified,
              [0, 1],
              [COLORS.cyanSoft, COLORS.mint],
            ),
          }}
        >
          {Math.round(overallProgress * 100)}%
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 180,
          bottom: -9,
          width: 400,
          height: 4,
          borderRadius: 4,
          background: "rgba(81,131,162,.2)",
          overflow: "hidden",
          opacity: segment(progress, 0.28, 0.4),
        }}
      >
        <div
          style={{
            width: `${Math.max(1, overallProgress * 100)}%`,
            height: "100%",
            borderRadius: 4,
            background: `linear-gradient(90deg, ${interpolateColors(
              verified,
              [0, 1],
              [COLORS.blue, COLORS.mint],
            )}, ${interpolateColors(
              verified,
              [0, 1],
              [COLORS.cyan, "#d0ffe7"],
            )})`,
            boxShadow: "0 0 14px rgba(61,235,245,.65)",
          }}
        />
      </div>
    </div>
  );
};

type RegionSpec = {
  name: string;
  code: string;
  x: number;
  y: number;
  color: string;
  delay: number;
  arc: number;
};

const REGIONS: RegionSpec[] = [
  {
    name: "US EAST",
    code: "PRIMARY",
    x: 1580,
    y: 334,
    color: "#4deff5",
    delay: 0,
    arc: -92,
  },
  {
    name: "EU WEST",
    code: "MIRROR 01",
    x: 1668,
    y: 538,
    color: "#8372ff",
    delay: 0.045,
    arc: 0,
  },
  {
    name: "AP SOUTHEAST",
    code: "MIRROR 02",
    x: 1580,
    y: 742,
    color: "#66f1b7",
    delay: 0.09,
    arc: 92,
  },
];

const RegionIcon: React.FC<{
  spec: RegionSpec;
  progress: number;
  time: number;
}> = ({spec, progress, time}) => {
  const pulse = 1 + Math.sin((time * 0.78 + spec.delay * 3) * TAU) * 0.035;
  const healthy = segment(progress, 0.7 + spec.delay, 0.77 + spec.delay);

  return (
    <g transform={`translate(${spec.x} ${spec.y}) scale(${pulse})`}>
      <circle
        r="62"
        fill="rgba(5,19,39,.88)"
        stroke={`${spec.color}55`}
        strokeWidth="2"
      />
      <circle
        r="50"
        fill="rgba(10,35,60,.78)"
        stroke={spec.color}
        strokeWidth="2.5"
        strokeDasharray="5 7"
        transform={`rotate(${time * 18 + spec.arc})`}
        opacity="0.82"
      />
      <ellipse
        cx="0"
        cy="0"
        rx="29"
        ry="15"
        fill="none"
        stroke={spec.color}
        strokeWidth="2"
        opacity="0.82"
      />
      <ellipse
        cx="0"
        cy="0"
        rx="15"
        ry="29"
        fill="none"
        stroke={spec.color}
        strokeWidth="2"
        opacity="0.82"
      />
      <path
        d="M -28 0 H 28 M -23 -16 C -7 -8 7 -8 23 -16 M -23 16 C -7 8 7 8 23 16"
        fill="none"
        stroke={spec.color}
        strokeWidth="1.6"
        opacity="0.72"
      />
      <g opacity={healthy}>
        <circle
          cx="43"
          cy="-43"
          r="15"
          fill="#0d3b32"
          stroke={COLORS.mint}
          strokeWidth="2"
        />
        <path
          d="M 36 -43 L 41 -38 L 50 -49"
          fill="none"
          stroke="#d5ffe8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="0"
        y="89"
        textAnchor="middle"
        fill={COLORS.text}
        fontFamily="Inter, Arial, sans-serif"
        fontSize="17"
        fontWeight="750"
        letterSpacing=".4"
      >
        {spec.name}
      </text>
      <text
        x="0"
        y="111"
        textAnchor="middle"
        fill={healthy > 0.5 ? COLORS.mint : "#718da4"}
        fontFamily="'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
        fontSize="11"
        fontWeight="800"
        letterSpacing="1.5"
      >
        {healthy > 0.5 ? "VERIFIED" : spec.code}
      </text>
    </g>
  );
};

const ReplicationNetwork: React.FC<{
  progress: number;
  time: number;
}> = ({progress, time}) => {
  const sectionReveal = segment(progress, 0.48, 0.58);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        opacity: sectionReveal,
        zIndex: 18,
      }}
    >
      <defs>
        <filter id="replication-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <text
        x="1515"
        y="232"
        fill="#7594aa"
        fontFamily="'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
        fontSize="14"
        fontWeight="700"
        letterSpacing="2.8"
      >
        RECOVERY REGIONS
      </text>

      {REGIONS.map((spec, index) => {
        const routeReveal = segment(
          progress,
          0.515 + spec.delay,
          0.64 + spec.delay,
          Easing.inOut(Easing.cubic),
        );
        const start = {x: 1295, y: 542};
        const control = {
          x: 1440,
          y: spec.y + (index - 1) * 18,
        };
        const end = {x: spec.x - 69, y: spec.y};
        const d = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;

        return (
          <g key={spec.name}>
            <path
              d={d}
              fill="none"
              pathLength={1}
              stroke={spec.color}
              strokeWidth="2.3"
              strokeDasharray={`${routeReveal} ${1 - routeReveal}`}
              strokeLinecap="round"
              opacity={0.22 + routeReveal * 0.4}
            />
            <path
              d={d}
              fill="none"
              pathLength={1}
              stroke={spec.color}
              strokeWidth="1"
              strokeDasharray="0.012 0.03"
              strokeDashoffset={-time * 0.18}
              opacity={routeReveal * 0.7}
            />

            {Array.from({length: 5}, (_, packetIndex) => {
              const travel = modulo(
                time * (0.18 + packetIndex * 0.008) +
                  packetIndex * 0.203 +
                  spec.delay,
              );
              const point = quadraticPoint(start, control, end, travel);
              const packetFade =
                clamp01(travel / 0.07) *
                clamp01((1 - travel) / 0.09) *
                routeReveal;
              return (
                <circle
                  key={`${spec.name}-packet-${packetIndex}`}
                  cx={point.x}
                  cy={point.y}
                  r={packetIndex % 2 === 0 ? 4.2 : 2.7}
                  fill={spec.color}
                  opacity={packetFade}
                  filter="url(#replication-glow)"
                />
              );
            })}

            <g
              opacity={routeReveal}
              transform={`translate(${spec.x} ${spec.y}) scale(${mix(
                0.7,
                1,
                routeReveal,
              )}) translate(${-spec.x} ${-spec.y})`}
            >
              <RegionIcon spec={spec} progress={progress} time={time} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

const Metrics: React.FC<{
  progress: number;
  uploadProgress: number;
}> = ({progress, uploadProgress}) => {
  const reveal = segment(progress, 0.39, 0.5);
  const files = Math.round(48216 * uploadProgress);
  const storage = (1.82 * uploadProgress).toFixed(2);
  const checksum = Math.round(100 * segment(progress, 0.58, 0.79));

  const metrics = [
    {
      label: "FILES PROTECTED",
      value: files.toLocaleString("en-US"),
      accent: COLORS.cyan,
    },
    {label: "ENCRYPTED DATA", value: `${storage} TB`, accent: "#8578ff"},
    {
      label: "INTEGRITY CHECK",
      value: `${checksum}%`,
      accent: COLORS.mint,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 102,
        bottom: 68,
        display: "flex",
        gap: 12,
        opacity: reveal * (1 - segment(progress, 0.84, 0.91)),
        transform: `translateY(${mix(25, 0, reveal)}px)`,
        zIndex: 35,
      }}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          style={{
            width: 224,
            height: 92,
            padding: "17px 20px",
            borderRadius: 15,
            border: `1px solid ${metric.accent}35`,
            background: "rgba(5,19,38,.82)",
            boxShadow:
              "inset 0 1px rgba(255,255,255,.04), 0 18px 42px rgba(0,0,0,.24)",
          }}
        >
          <div
            style={{
              color: "#6e8ba2",
              fontFamily:
                "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.45,
            }}
          >
            {metric.label}
          </div>
          <div
            style={{
              marginTop: 9,
              color: metric.accent,
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 27,
              fontWeight: 800,
              letterSpacing: -0.4,
              textShadow: `0 0 18px ${metric.accent}40`,
            }}
          >
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const SecurityChips: React.FC<{progress: number}> = ({progress}) => {
  const reveal = segment(progress, 0.66, 0.79);
  const chips = [
    {label: "IMMUTABLE", color: COLORS.cyan, delay: 0},
    {label: "VERSIONED", color: "#8d7aff", delay: 0.025},
    {label: "VERIFIED", color: COLORS.mint, delay: 0.05},
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 744,
        top: 848,
        display: "flex",
        gap: 12,
        zIndex: 34,
        opacity: 1 - segment(progress, 0.84, 0.9),
      }}
    >
      {chips.map((chip) => {
        const chipReveal = segment(
          progress,
          0.66 + chip.delay,
          0.74 + chip.delay,
        );
        return (
          <div
            key={chip.label}
            style={{
              width: 158,
              height: 43,
              borderRadius: 22,
              border: `1px solid ${chip.color}55`,
              background: "rgba(5,20,39,.84)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              color: chip.color,
              fontFamily:
                "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 1.2,
              opacity: chipReveal * reveal,
              transform: `translateY(${mix(15, 0, chipReveal)}px) scale(${mix(
                0.92,
                1,
                chipReveal,
              )})`,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: chip.color,
                boxShadow: `0 0 10px ${chip.color}`,
              }}
            />
            {chip.label}
          </div>
        );
      })}
    </div>
  );
};

const FinalStatus: React.FC<{progress: number; time: number}> = ({
  progress,
  time,
}) => {
  const reveal = segment(progress, 0.835, 0.91, Easing.out(Easing.back(1.15)));
  const glow = 0.6 + Math.sin(time * TAU * 0.7) * 0.16;
  const sweep = modulo(time / 2.8) * 1650 - 200;

  return (
    <div
      style={{
        position: "absolute",
        left: 188,
        bottom: 54,
        width: 1544,
        height: 150,
        borderRadius: 28,
        border: "1px solid rgba(105,246,183,.4)",
        background:
          "linear-gradient(110deg, rgba(7,32,45,.96), rgba(8,25,48,.95) 60%, rgba(9,40,48,.96))",
        boxShadow: `0 24px 70px rgba(0,0,0,.38), inset 0 0 42px rgba(105,246,183,${
          glow * 0.09
        }), 0 0 42px rgba(105,246,183,${glow * 0.08})`,
        display: "flex",
        alignItems: "center",
        opacity: reveal,
        transform: `translateY(${mix(100, 0, reveal)}px) scale(${mix(
          0.96,
          1,
          reveal,
        )})`,
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: sweep,
          top: -60,
          width: 180,
          height: 270,
          background:
            "linear-gradient(90deg, transparent, rgba(188,255,222,.18), transparent)",
          transform: "rotate(16deg)",
          filter: "blur(10px)",
        }}
      />
      <div
        style={{
          marginLeft: 38,
          width: 84,
          height: 84,
          borderRadius: "50%",
          border: "2px solid rgba(105,246,183,.72)",
          background:
            "radial-gradient(circle, rgba(105,246,183,.24), rgba(10,53,48,.64))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "inset 0 0 22px rgba(105,246,183,.14), 0 0 28px rgba(105,246,183,.12)",
        }}
      >
        <svg width="46" height="46" viewBox="0 0 46 46">
          <path
            d="M 9 24 L 18 33 L 37 13"
            fill="none"
            stroke="#d9ffea"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{marginLeft: 27}}>
        <div
          style={{
            color: "#d8ffea",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 45,
            fontWeight: 850,
            letterSpacing: -1.2,
            lineHeight: 1,
          }}
        >
          BACKUP SECURED
        </div>
        <div
          style={{
            marginTop: 12,
            color: "#87ad9e",
            fontFamily:
              "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 1.25,
          }}
        >
          48,216 FILES · 1.82 TB · 3 RECOVERY REGIONS · ZERO ERRORS
        </div>
      </div>
      <div
        style={{
          marginLeft: "auto",
          marginRight: 42,
          display: "flex",
          alignItems: "center",
          gap: 42,
        }}
      >
        {[
          ["RPO", "0 MIN"],
          ["RTO", "< 5 MIN"],
          ["HEALTH", "100%"],
        ].map(([label, value]) => (
          <div key={label} style={{textAlign: "right"}}>
            <div
              style={{
                color: "#6d9385",
                fontFamily:
                  "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.7,
              }}
            >
              {label}
            </div>
            <div
              style={{
                marginTop: 7,
                color: COLORS.mint,
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StageRail: React.FC<{progress: number}> = ({progress}) => {
  const reveal = segment(progress, 0.025, 0.13);
  const stages = [
    {label: "INGEST", threshold: 0.08},
    {label: "ENCRYPT", threshold: 0.28},
    {label: "UPLOAD", threshold: 0.42},
    {label: "REPLICATE", threshold: 0.59},
    {label: "VERIFY", threshold: 0.69},
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 90,
        top: 158,
        display: "flex",
        alignItems: "center",
        gap: 0,
        opacity: reveal * (1 - segment(progress, 0.84, 0.91) * 0.45),
        zIndex: 40,
      }}
    >
      {stages.map((stage, index) => {
        const active = segment(progress, stage.threshold, stage.threshold + 0.045);
        return (
          <React.Fragment key={stage.label}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: active > 0.5 ? COLORS.cyanSoft : "#526b7e",
                fontFamily:
                  "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.2,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: active > 0.5 ? COLORS.cyan : "#30485b",
                  boxShadow:
                    active > 0.5 ? "0 0 11px rgba(61,235,245,.7)" : "none",
                }}
              />
              {stage.label}
            </div>
            {index < stages.length - 1 ? (
              <div
                style={{
                  width: 42,
                  height: 1,
                  margin: "0 13px",
                  background:
                    active > 0.5
                      ? "linear-gradient(90deg, rgba(61,235,245,.65), rgba(61,235,245,.18))"
                      : "rgba(74,103,123,.26)",
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const time = frame / fps;
  const progress = frame / Math.max(1, durationInFrames - 1);
  const uploadProgress = segment(
    progress,
    0.17,
    0.63,
    Easing.inOut(Easing.cubic),
  );

  const intro = segment(progress, 0, 0.08);
  const encryptionPush = segment(progress, 0.19, 0.34);
  const replicationPull = segment(progress, 0.46, 0.65);
  const finalSettle = segment(progress, 0.8, 0.91);
  const cameraScale =
    mix(1.035, 1, intro) +
    encryptionPush * 0.026 -
    replicationPull * 0.042 +
    finalSettle * 0.016;
  const cameraX = encryptionPush * -18 + replicationPull * -14 + finalSettle * 32;
  const cameraY = encryptionPush * 4 + replicationPull * -8 + finalSettle * -2;

  return (
    <AbsoluteFill
      style={{
        width: W,
        height: H,
        overflow: "hidden",
        backgroundColor: COLORS.bg,
        color: COLORS.text,
      }}
    >
      <AmbientBackground time={time} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
          transformOrigin: "52% 53%",
        }}
      >
        <FileIngress
          progress={progress}
          time={time}
          uploadProgress={uploadProgress}
        />
        <ReplicationNetwork progress={progress} time={time} />
        <CloudVault
          progress={progress}
          time={time}
          uploadProgress={uploadProgress}
        />
      </div>

      <Header progress={progress} time={time} />
      <StageRail progress={progress} />
      <Metrics progress={progress} uploadProgress={uploadProgress} />
      <SecurityChips progress={progress} />
      <FinalStatus progress={progress} time={time} />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow:
            "inset 0 0 150px rgba(0,2,12,.72), inset 0 -90px 130px rgba(0,1,8,.38)",
          zIndex: 30,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background:
            "linear-gradient(90deg, transparent, rgba(61,235,245,.55), rgba(122,92,255,.46), transparent)",
          opacity: 0.5,
          zIndex: 95,
        }}
      />
    </AbsoluteFill>
  );
};
