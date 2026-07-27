import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const W = 1920;
const H = 1080;
const CX = W / 2;
const CY = 548;
const TAU = Math.PI * 2;

// Exact silhouette from cloud-computing-svgrepo-com.svg. Every cloud layer
// below reuses this single path so the body, clip, rim, glow, and tracer
// cannot drift apart or create a false split along the left lobe.
const CLOUD_PATH =
  "M343.454 170.099C343.464 169.516 343.476 168.934 343.476 168.349C343.476 112.621 298.299 67.444 242.571 67.444C194.546 67.444 154.362 100.995 144.168 145.936C134.663 140.615 123.714 137.568 112.046 137.568C75.639 137.568 46.126 167.082 46.126 203.488C46.126 204.976 46.193 206.447 46.29 207.911C19.262 217.944 0 243.959 0 274.479C0 313.686 31.784 345.47 70.991 345.47H324.174C373.183 345.47 412.913 305.74 412.913 256.731C412.913 214.343 383.192 178.903 343.454 170.099Z";
const CLOUD_TRANSFORM = "translate(52.8299 -124.8572) scale(1.4732893)";

const CODE_LINES = [
  "const secureCloud = encrypt(payload);",
  "if (threatDetected) isolate(node);",
  "zeroTrust.verify(identity, device);",
  "tls.handshake({ cipher: 'AES-256' });",
  "await gateway.authorize(session);",
  "backup.sync({ region: 'global' });",
  "firewall.inspect(packet.signature);",
  "token.rotate({ ttl: 900, scope });",
  "hash = sha256(data + nonce);",
  "policy.require('least-privilege');",
  "stream.pipe(anomalyDetector);",
  "cluster.health === 'protected';",
  "const access = biometric && verified;",
  "audit.write(event, timestamp);",
  "edge.route(request, encryptedTunnel);",
  "recovery.snapshot(volume, version);",
  "identity.score >= trustThreshold;",
  "monitor.watch(network.telemetry);",
];

const modulo = (value: number, length = 1) =>
  ((value % length) + length) % length;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 91.3458 + 12.345) * 47453.5453;
  return value - Math.floor(value);
};

const mix = (a: number, b: number, amount: number) =>
  a + (b - a) * amount;

type TunnelFragment = {
  anchorX: number;
  anchorY: number;
  baseDepth: number;
  color: string;
  fontSize: number;
  rotation: number;
  text: string;
  tracking: number;
};

const TUNNEL_FRAGMENTS: TunnelFragment[] = Array.from(
  {length: 104},
  (_, i) => {
    const side = i % 4;
    const a = hash01(i * 7 + 1);
    const b = hash01(i * 11 + 3);
    let anchorX = 0;
    let anchorY = 0;
    let rotation = 0;

    if (side === 0) {
      anchorX = -220 + a * 830;
      anchorY = 44 + b * 990;
      rotation = (anchorY - CY) * 0.026;
    } else if (side === 1) {
      anchorX = W + 220 - a * 830;
      anchorY = 44 + b * 990;
      rotation = -(anchorY - CY) * 0.026;
    } else if (side === 2) {
      anchorX = 55 + a * 1810;
      anchorY = -120 + b * 470;
      rotation = (anchorX - CX) * 0.01;
    } else {
      anchorX = 55 + a * 1810;
      anchorY = H + 120 - b * 405;
      rotation = -(anchorX - CX) * 0.01;
    }

    return {
      anchorX,
      anchorY,
      baseDepth: hash01(i * 13 + 9),
      color:
        i % 9 === 0
          ? "#88f6ff"
          : i % 4 === 0
            ? "#198dff"
            : "#19dff5",
      fontSize: 13 + hash01(i * 17 + 5) * 13,
      rotation,
      text: CODE_LINES[i % CODE_LINES.length],
      tracking: hash01(i * 5 + 2) * 0.9,
    };
  },
);

type Streak = {
  x: number;
  y: number;
  start: number;
  width: number;
  opacity: number;
  offset: number;
};

const STREAKS: Streak[] = Array.from({length: 68}, (_, i) => {
  const side = i % 4;
  const a = hash01(i * 19 + 2);
  let x = 0;
  let y = 0;

  if (side === 0) {
    x = -20;
    y = 26 + a * (H - 52);
  } else if (side === 1) {
    x = W + 20;
    y = 26 + a * (H - 52);
  } else if (side === 2) {
    x = 28 + a * (W - 56);
    y = -20;
  } else {
    x = 28 + a * (W - 56);
    y = H + 20;
  }

  return {
    x,
    y,
    start: 0.09 + hash01(i * 23 + 4) * 0.27,
    width: 0.7 + hash01(i * 29 + 7) * 2.5,
    opacity: 0.11 + hash01(i * 31 + 8) * 0.32,
    offset: hash01(i * 37 + 1),
  };
});

type DataColumn = {
  x: number;
  offset: number;
  cycles: number;
  fontSize: number;
  opacity: number;
  color: string;
};

const DATA_COLUMNS: DataColumn[] = Array.from({length: 39}, (_, i) => ({
  x: 72 + i * 14.4,
  offset: hash01(i * 17 + 4),
  cycles: 2 + (i % 4),
  fontSize: 12 + hash01(i * 23 + 2) * 12,
  opacity: 0.35 + hash01(i * 29 + 7) * 0.58,
  color: i % 7 === 0 ? "#c8ffff" : i % 3 === 0 ? "#36edff" : "#03b9ff",
}));

const FLOATING_MARKERS = Array.from({length: 42}, (_, i) => {
  const angle = hash01(i * 9 + 4) * TAU;
  const radiusX = 560 + hash01(i * 17 + 8) * 430;
  const radiusY = 230 + hash01(i * 13 + 5) * 280;
  return {
    x: CX + Math.cos(angle) * radiusX,
    y: CY + Math.sin(angle) * radiusY,
    size: 8 + hash01(i * 23 + 6) * 12,
    opacity: 0.12 + hash01(i * 29 + 7) * 0.34,
    phase: hash01(i * 31 + 8),
    text:
      i % 3 === 0
        ? `${Math.floor(hash01(i * 37 + 2) * 999)}.${Math.floor(
            hash01(i * 41 + 3) * 99,
          )}`
        : i % 3 === 1
          ? `{${Math.floor(hash01(i * 43 + 4) * 4096)}}`
          : `0x${Math.floor(hash01(i * 47 + 5) * 65535)
              .toString(16)
              .padStart(4, "0")}`,
  };
});

const Vignette: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, transparent 31%, rgba(0,5,27,.25) 60%, rgba(0,2,18,.88) 100%)",
        zIndex: 30,
        pointerEvents: "none",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(90deg, rgba(0,2,20,.2), transparent 18%, transparent 82%, rgba(0,2,20,.2))",
        mixBlendMode: "multiply",
        zIndex: 29,
        pointerEvents: "none",
      }}
    />
  </>
);

const Background: React.FC<{time: number}> = ({time}) => {
  const topGlowX = 50 + Math.sin((time / 8.6) * TAU) * 2.4;
  const horizonPulse = 0.72 + Math.sin((time / 2.7) * TAU) * 0.13;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #061447 0%, #030c31 46%, #020822 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${topGlowX}% 0%, rgba(34,128,255,.35) 0%, rgba(11,47,129,.12) 24%, transparent 52%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 51%, rgba(9,103,229,.22) 0%, rgba(2,17,63,.05) 35%, transparent 66%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CY - 4,
          height: 8,
          opacity: horizonPulse,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(15,171,255,.18) 18%, rgba(82,235,255,.85) 48%, rgba(60,79,255,.65) 64%, transparent 100%)",
          filter: "blur(5px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CY,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(48,199,255,.4) 23%, #6afaff 50%, rgba(70,91,255,.5) 73%, transparent)",
          boxShadow: "0 0 26px rgba(24,194,255,.7)",
        }}
      />
    </AbsoluteFill>
  );
};

const PerspectiveGrid: React.FC<{progress: number}> = ({progress}) => {
  const depthLines = Array.from({length: 13}, (_, i) => {
    const d = modulo(i / 13 + progress * 1.82);
    const shaped = d ** 2.15;
    const yBottom = CY + (H - CY) * shaped;
    const yTop = CY - CY * shaped;
    const halfWidth = 34 + (W / 2 + 80) * shaped;
    return {d, yBottom, yTop, halfWidth};
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.5,
      }}
    >
      <defs>
        <linearGradient id="grid-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4aefff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#1176ff" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient id="grid-ceiling" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#49eaff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#0d62ff" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {Array.from({length: 17}, (_, i) => {
        const x = -80 + (i / 16) * (W + 160);
        return (
          <React.Fragment key={`ray-${i}`}>
            <line
              x1={CX}
              y1={CY}
              x2={x}
              y2={H + 40}
              stroke="url(#grid-floor)"
              strokeWidth={i % 4 === 0 ? 1.5 : 0.8}
            />
            <line
              x1={CX}
              y1={CY}
              x2={x}
              y2={-40}
              stroke="url(#grid-ceiling)"
              strokeWidth={i % 4 === 0 ? 1.2 : 0.6}
            />
          </React.Fragment>
        );
      })}

      {depthLines.map(({d, yBottom, yTop, halfWidth}, i) => {
        const opacity = clamp01(d / 0.2) * clamp01((1 - d) / 0.08);
        return (
          <React.Fragment key={`depth-${i}`}>
            <line
              x1={CX - halfWidth}
              y1={yBottom}
              x2={CX + halfWidth}
              y2={yBottom}
              stroke="#1db8ff"
              strokeOpacity={opacity * 0.25}
              strokeWidth={0.7 + d * 1.2}
            />
            <line
              x1={CX - halfWidth}
              y1={yTop}
              x2={CX + halfWidth}
              y2={yTop}
              stroke="#2b9dff"
              strokeOpacity={opacity * 0.17}
              strokeWidth={0.6 + d}
            />
          </React.Fragment>
        );
      })}
    </svg>
  );
};

const RadialStreaks: React.FC<{progress: number}> = ({progress}) => (
  <svg
    viewBox={`0 0 ${W} ${H}`}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      mixBlendMode: "screen",
    }}
  >
    <defs>
      <radialGradient id="streak-fade" cx="50%" cy="50%" r="68%">
        <stop offset="0" stopColor="#3aeaff" stopOpacity="0.08" />
        <stop offset="0.36" stopColor="#25d8ff" stopOpacity="0.34" />
        <stop offset="1" stopColor="#087dff" stopOpacity="0.72" />
      </radialGradient>
      <filter id="soft-streak" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.8" />
      </filter>
    </defs>
    {STREAKS.map((streak, i) => {
      const x1 = mix(CX, streak.x, streak.start);
      const y1 = mix(CY, streak.y, streak.start);
      const dash = 34 + (i % 5) * 12;
      const travel = modulo(
        progress * (1.72 + (i % 3) * 0.63) + streak.offset,
      );
      return (
        <line
          key={`streak-${i}`}
          x1={x1}
          y1={y1}
          x2={streak.x}
          y2={streak.y}
          pathLength={1000}
          stroke="url(#streak-fade)"
          strokeWidth={streak.width}
          strokeOpacity={streak.opacity}
          strokeDasharray={`${dash} ${1000 - dash}`}
          strokeDashoffset={-travel * 1000}
          strokeLinecap="round"
          filter={i % 4 === 0 ? "url(#soft-streak)" : undefined}
        />
      );
    })}
  </svg>
);

const CodeTunnel: React.FC<{progress: number}> = ({progress}) => (
  <AbsoluteFill style={{overflow: "hidden"}}>
    {TUNNEL_FRAGMENTS.map((fragment, i) => {
      const depth = modulo(
        fragment.baseDepth + progress * (1.68 + (i % 2) * 0.74),
      );
      const fadeIn = clamp01(depth / 0.095);
      const fadeOut = clamp01((1 - depth) / 0.1);
      const fade = fadeIn * fadeOut;
      const projection = 0.065 + 0.935 * depth ** 0.72;
      const x = mix(CX, fragment.anchorX, projection);
      const y = mix(CY, fragment.anchorY, projection);
      const scale = 0.28 + depth * 1.12;
      const perspectiveStretch = 0.72 + depth * 0.48;
      const edgeBlur =
        depth > 0.82 ? (depth - 0.82) * 16 : (1 - depth) * 0.65;
      const opacity = fade * (0.08 + depth ** 0.84 * 0.68);

      return (
        <div
          key={`code-${i}`}
          style={{
            position: "absolute",
            left: x,
            top: y,
            maxWidth: 640,
            whiteSpace: "nowrap",
            color: fragment.color,
            opacity,
            fontFamily:
              "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
            fontSize: fragment.fontSize,
            fontWeight: i % 7 === 0 ? 700 : 500,
            letterSpacing: fragment.tracking,
            lineHeight: 1,
            filter: `blur(${edgeBlur}px)`,
            textShadow:
              i % 5 === 0
                ? "0 0 11px rgba(24,217,255,.7)"
                : "0 0 5px rgba(20,147,255,.45)",
            transform: `translate(-50%, -50%) rotate(${fragment.rotation}deg) scale(${scale}) scaleX(${perspectiveStretch})`,
            transformOrigin: "50% 50%",
          }}
        >
          {fragment.text}
        </div>
      );
    })}
  </AbsoluteFill>
);

const FloatingTelemetry: React.FC<{time: number}> = ({time}) => (
  <AbsoluteFill>
    {FLOATING_MARKERS.map((marker, i) => {
      const drift = Math.sin(
        (time * (0.11 + (i % 3) * 0.025) + marker.phase) * TAU,
      );
      const opacity =
        marker.opacity *
        (0.45 +
          0.55 * Math.sin((time * 0.42 + marker.phase) * TAU) ** 2);
      return (
        <div
          key={`marker-${i}`}
          style={{
            position: "absolute",
            left: marker.x + drift * 8,
            top:
              marker.y +
              Math.cos((time * 0.13 + marker.phase) * TAU) * 3.5,
            color: i % 5 === 0 ? "#8cfbff" : "#2eb7ff",
            opacity,
            fontFamily: "'SFMono-Regular', Consolas, monospace",
            fontSize: marker.size,
            letterSpacing: 0.4,
            textShadow: "0 0 8px rgba(29,191,255,.6)",
          }}
        >
          {marker.text}
        </div>
      );
    })}
  </AbsoluteFill>
);

const LightBeams: React.FC<{time: number}> = ({time}) => {
  const leftPulse = 0.36 + 0.24 * Math.sin((time / 2.4 + 0.16) * TAU);
  const rightPulse = 0.31 + 0.2 * Math.sin((time / 2.4 + 0.66) * TAU);

  return (
    <AbsoluteFill style={{mixBlendMode: "screen"}}>
      <div
        style={{
          position: "absolute",
          left: -130,
          top: CY - 22,
          width: 770,
          height: 48,
          opacity: leftPulse,
          background:
            "linear-gradient(90deg, rgba(18,172,255,.9), rgba(51,235,255,.25) 42%, transparent)",
          filter: "blur(13px)",
          transform: "skewX(-18deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -140,
          top: CY - 10,
          width: 710,
          height: 34,
          opacity: rightPulse,
          background:
            "linear-gradient(270deg, rgba(61,67,255,.9), rgba(38,194,255,.2) 48%, transparent)",
          filter: "blur(12px)",
          transform: "skewX(18deg)",
        }}
      />
    </AbsoluteFill>
  );
};

const CloudData: React.FC<{time: number}> = ({time}) => {
  const scan = modulo(time / 2.35);
  const scanY = 56 + scan * 318;
  const scanFade = clamp01(scan / 0.08) * clamp01((1 - scan) / 0.09);

  return (
    <g clipPath="url(#cloud-clip)">
      <rect
        x="30"
        y="-30"
        width="660"
        height="440"
        fill="url(#cloud-body)"
      />
      <rect
        x="30"
        y="-30"
        width="660"
        height="440"
        fill="url(#cloud-vignette)"
      />

      {DATA_COLUMNS.map((column, i) => {
        const rate = 0.22 + column.cycles * 0.055;
        const shift = modulo(column.offset + time * rate) * 428;
        const dash = 80 + (i % 5) * 25;
        const gap = 170 + (i % 4) * 35;
        const dashPeriod = dash + gap;
        return (
          <g
            key={`column-${i}`}
            opacity={column.opacity}
            filter={i % 5 === 0 ? "url(#data-glow)" : undefined}
          >
            <line
              x1={column.x}
              y1="24"
              x2={column.x}
              y2="394"
              stroke={column.color}
              strokeOpacity={0.15 + (i % 4) * 0.04}
              strokeWidth={i % 6 === 0 ? 2.2 : 0.8}
              pathLength={1000}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-time * rate * dashPeriod * 1.75}
            />
            {Array.from({length: 13}, (_, j) => {
              const y = modulo(j * 35.5 + shift, 430) - 21;
              const digit = (i * 7 + j * 3 + (i % 4)) % 10;
              const emphasis = (i + j) % 11 === 0;
              const blink =
                0.44 +
                  0.56 *
                  Math.sin(
                    (time * (0.3 + ((i + j) % 4) * 0.08) +
                      hash01(i * 71 + j * 17)) *
                      TAU,
                  ) **
                    2;
              return (
                <text
                  key={`digit-${i}-${j}`}
                  x={column.x}
                  y={y}
                  fill={emphasis ? "#e2ffff" : column.color}
                  fillOpacity={blink}
                  fontFamily="'SFMono-Regular', Consolas, monospace"
                  fontSize={emphasis ? column.fontSize * 1.55 : column.fontSize}
                  fontWeight={emphasis ? 800 : 600}
                  textAnchor="middle"
                >
                  {digit}
                </text>
              );
            })}
          </g>
        );
      })}

      {Array.from({length: 38}, (_, i) => {
        const x = 65 + hash01(i * 37 + 5) * 585;
        const y = 36 + hash01(i * 41 + 8) * 342;
        const pulse =
          0.22 +
          0.78 *
            Math.sin(
              (time * (0.34 + (i % 3) * 0.09) +
                hash01(i * 47 + 3)) *
                TAU,
            ) **
              2;
        return (
          <circle
            key={`cloud-particle-${i}`}
            cx={x}
            cy={y}
            r={0.8 + hash01(i * 53 + 9) * 2.3}
            fill={i % 5 === 0 ? "#ffffff" : "#49efff"}
            opacity={pulse * 0.82}
          />
        );
      })}

      <rect
        x="42"
        y={scanY - 14}
        width="640"
        height="28"
        opacity={scanFade * 0.28}
        fill="url(#scan-line)"
        filter="url(#scan-glow)"
      />
      <line
        x1="50"
        y1={scanY}
        x2="666"
        y2={scanY}
        stroke="#d9ffff"
        strokeWidth="1.2"
        opacity={scanFade * 0.38}
      />
    </g>
  );
};

const DigitalCloud: React.FC<{time: number}> = ({time}) => {
  const breathe = 1 + Math.sin((time / 3.4) * TAU) * 0.009;
  const floatY = Math.sin((time / 6.2 + 0.12) * TAU) * 2;
  const haloPulse = 0.78 + Math.sin((time / 2.8) * TAU) * 0.13;
  const hotspot = modulo(time / 3.8 + 0.75);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "52.4%",
        width: 720,
        height: 432,
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${breathe})`,
        transformOrigin: "50% 90%",
        zIndex: 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "5%",
          right: "5%",
          top: "13%",
          bottom: "0%",
          opacity: haloPulse,
          background:
            "radial-gradient(ellipse at 50% 66%, rgba(59,247,255,.64), rgba(0,143,255,.3) 34%, rgba(0,54,255,.1) 58%, transparent 75%)",
          filter: "blur(35px)",
          transform: "scale(1.08)",
        }}
      />

      <svg
        viewBox="0 0 720 420"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          filter:
            "drop-shadow(0 0 15px rgba(28,226,255,.74)) drop-shadow(0 0 38px rgba(0,105,255,.42))",
        }}
      >
        <defs>
          <clipPath id="cloud-clip">
            <path d={CLOUD_PATH} transform={CLOUD_TRANSFORM} />
          </clipPath>
          <linearGradient id="cloud-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#04366f" stopOpacity="0.68" />
            <stop offset="0.48" stopColor="#006fb3" stopOpacity="0.52" />
            <stop offset="1" stopColor="#05195c" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="cloud-vignette" cx="50%" cy="70%" r="70%">
            <stop offset="0" stopColor="#11e9ff" stopOpacity="0.18" />
            <stop offset="0.58" stopColor="#0a57c1" stopOpacity="0.08" />
            <stop offset="1" stopColor="#020b38" stopOpacity="0.62" />
          </radialGradient>
          <linearGradient id="cloud-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4ffaff" />
            <stop offset="0.5" stopColor="#1bc5ff" />
            <stop offset="1" stopColor="#655dff" />
          </linearGradient>
          <linearGradient id="scan-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#65efff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#baffff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#65efff" stopOpacity="0" />
          </linearGradient>
          <filter id="data-glow" x="-80%" y="-20%" width="260%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="scan-glow" x="-20%" y="-180%" width="140%" height="460%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="edge-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={CLOUD_PATH}
          transform={CLOUD_TRANSFORM}
          vectorEffect="non-scaling-stroke"
          fill="rgba(3,23,84,.64)"
          stroke="#0c87e8"
          strokeWidth="20"
          strokeLinejoin="round"
          strokeMiterlimit={2}
          opacity="0.16"
          filter="url(#edge-glow)"
        />

        <CloudData time={time} />

        <path
          d={CLOUD_PATH}
          transform={CLOUD_TRANSFORM}
          vectorEffect="non-scaling-stroke"
          fill="none"
          stroke="url(#cloud-edge)"
          strokeWidth="4.2"
          strokeLinejoin="round"
          strokeMiterlimit={2}
          opacity="0.96"
          filter="url(#edge-glow)"
        />

        <path
          d={CLOUD_PATH}
          transform={CLOUD_TRANSFORM}
          vectorEffect="non-scaling-stroke"
          fill="none"
          pathLength={1000}
          stroke="#d9ffff"
          strokeWidth="8"
          strokeDasharray="72 928"
          strokeDashoffset={-hotspot * 1000}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.72"
          filter="url(#edge-glow)"
        />

        <path
          d={CLOUD_PATH}
          transform={CLOUD_TRANSFORM}
          vectorEffect="non-scaling-stroke"
          fill="none"
          pathLength={1000}
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeDasharray="50 950"
          strokeDashoffset={-hotspot * 1000}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.98"
        />

        <ellipse
          cx="357"
          cy="382"
          rx="284"
          ry="15"
          fill="#48f5ff"
          opacity={0.14 + Math.sin((time / 3.4) * TAU) ** 2 * 0.18}
          filter="url(#scan-glow)"
        />
      </svg>
    </div>
  );
};

const ForegroundBloom: React.FC<{time: number}> = ({time}) => {
  const pulse = 0.44 + Math.sin((time / 4.1 + 0.18) * TAU) * 0.12;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -180,
          top: CY - 58,
          width: 480,
          height: 120,
          borderRadius: "50%",
          opacity: pulse,
          background:
            "radial-gradient(ellipse, rgba(29,205,255,.8), rgba(16,91,255,.2) 42%, transparent 74%)",
          filter: "blur(25px)",
          zIndex: 22,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -220,
          top: CY - 34,
          width: 520,
          height: 94,
          borderRadius: "50%",
          opacity: pulse * 0.7,
          background:
            "radial-gradient(ellipse, rgba(70,70,255,.75), rgba(16,132,255,.18) 46%, transparent 76%)",
          filter: "blur(27px)",
          zIndex: 22,
        }}
      />
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const tunnelProgress = time * (0.9 / 4.8);
  const chromaticPulse = interpolate(
    Math.sin((time / 3.1 + 0.08) * TAU),
    [-1, 1],
    [0.94, 1.04],
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02071f",
        overflow: "hidden",
        color: "white",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -8,
          filter: `saturate(${chromaticPulse})`,
        }}
      >
        <Background time={time} />
        <PerspectiveGrid progress={tunnelProgress} />
        <RadialStreaks progress={tunnelProgress} />
        <CodeTunnel progress={tunnelProgress} />
        <FloatingTelemetry time={time} />
        <LightBeams time={time} />
        <DigitalCloud time={time} />
        <ForegroundBloom time={time} />
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};
