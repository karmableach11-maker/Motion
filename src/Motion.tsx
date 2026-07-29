import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const COLORS = {
  black: "#010304",
  panel: "#05090c",
  white: "#edf9fb",
  soft: "#9aaeb2",
  dim: "#45575b",
  faint: "#182528",
  cyan: "#2de2f2",
  cyanSoft: "#87f7ff",
  amber: "#ffca62",
};

const seeded = (index: number) => {
  const value = Math.sin(index * 73.417 + 18.391) * 43758.5453;
  return value - Math.floor(value);
};

const revealAt = (frame: number, start: number, duration = 34) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const pathFromPoints = (points: readonly [number, number][]) =>
  points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

const HudPanel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  index: number;
  frame: number;
  activePanel: number;
  children: React.ReactNode;
}> = ({x, y, width, height, title, index, frame, activePanel, children}) => {
  const reveal = revealAt(frame, 10 + index * 6);
  const active = activePanel === index;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.08 + index);
  const perimeter = width * 2 + height * 2;

  return (
    <g
      transform={`translate(${x} ${y + (1 - reveal) * 10})`}
      opacity={reveal}
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="3"
        fill={COLORS.panel}
        fillOpacity={0.88}
        stroke={active ? COLORS.cyan : COLORS.dim}
        strokeOpacity={active ? 0.8 + pulse * 0.2 : 0.78}
        strokeWidth={active ? 1.8 : 1}
        pathLength={perimeter}
        strokeDasharray={perimeter}
        strokeDashoffset={perimeter * (1 - reveal)}
        filter={active ? "url(#cyan-glow)" : undefined}
      />
      <path
        d={`M0 18V0H30 M${width - 30} 0H${width}V18 M0 ${
          height - 18
        }V${height}H30 M${width - 30} ${height}H${width}V${height - 18}`}
        fill="none"
        stroke={active ? COLORS.cyanSoft : COLORS.white}
        strokeOpacity={0.64 + (active ? pulse * 0.25 : 0)}
        strokeWidth="2"
      />
      <rect
        x="15"
        y="11"
        width={Math.min(width - 30, 166)}
        height="19"
        fill={COLORS.black}
      />
      <text
        x="23"
        y="25"
        fill={active ? COLORS.cyanSoft : COLORS.soft}
        fontSize="13"
        letterSpacing="2.4"
      >
        {title}
      </text>
      <line
        x1="15"
        y1="38"
        x2={width - 15}
        y2="38"
        stroke={active ? COLORS.cyan : COLORS.dim}
        strokeOpacity={active ? 0.75 : 0.55}
      />
      <g opacity={interpolate(reveal, [0.55, 1], [0, 1], clamp)}>{children}</g>
    </g>
  );
};

const MiniBars: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  count: number;
  frame: number;
  seed: number;
  accent?: boolean;
}> = ({x, y, width, height, count, frame, seed, accent = false}) => {
  const gap = 3;
  const barWidth = (width - gap * (count - 1)) / count;

  return (
    <g>
      {Array.from({length: count}, (_, index) => {
        const base = 0.18 + seeded(index + seed) * 0.64;
        const motion =
          Math.sin(frame * (0.018 + seeded(seed + 31) * 0.012) + index * 0.72) *
          0.11;
        const h = Math.max(3, height * Math.min(0.95, Math.max(0.08, base + motion)));
        const isHot = accent && index > count - 4;
        return (
          <rect
            key={index}
            x={x + index * (barWidth + gap)}
            y={y + height - h}
            width={Math.max(1, barWidth)}
            height={h}
            fill={isHot ? COLORS.cyan : COLORS.white}
            fillOpacity={isHot ? 0.88 : 0.48 + seeded(index + 2) * 0.32}
          />
        );
      })}
    </g>
  );
};

const Waveform: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  frame: number;
  accent?: boolean;
}> = ({x, y, width, height, frame, accent = false}) => {
  const count = 74;
  const points = Array.from({length: count}, (_, index) => {
    const p = index / (count - 1);
    const envelope = 0.22 + 0.78 * Math.pow(Math.sin(p * Math.PI), 0.45);
    const wave =
      Math.sin(index * 1.94 + frame * 0.16) * 0.34 +
      Math.sin(index * 0.47 - frame * 0.07) * 0.2 +
      Math.sin(index * 3.7 + frame * 0.04) * 0.12;
    return [
      x + p * width,
      y + height / 2 + wave * envelope * height * 0.76,
    ] as [number, number];
  });

  return (
    <g>
      {Array.from({length: 9}, (_, index) => (
        <line
          key={index}
          x1={x + (index / 8) * width}
          y1={y}
          x2={x + (index / 8) * width}
          y2={y + height}
          stroke={COLORS.dim}
          strokeOpacity="0.45"
        />
      ))}
      <line
        x1={x}
        y1={y + height / 2}
        x2={x + width}
        y2={y + height / 2}
        stroke={COLORS.dim}
        strokeOpacity="0.55"
      />
      <path
        d={pathFromPoints(points)}
        fill="none"
        stroke={accent ? COLORS.cyanSoft : COLORS.white}
        strokeWidth={accent ? 1.8 : 1.2}
        strokeOpacity={accent ? 0.95 : 0.82}
        filter={accent ? "url(#cyan-glow)" : undefined}
      />
    </g>
  );
};

const LinePlot: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  frame: number;
  seed: number;
  accent?: boolean;
  fill?: boolean;
}> = ({x, y, width, height, frame, seed, accent = false, fill = false}) => {
  const count = 22;
  const points = Array.from({length: count}, (_, index) => {
    const p = index / (count - 1);
    const baseline = 0.36 + seeded(seed + index) * 0.46;
    const wave = Math.sin(frame * 0.018 + index * 0.68 + seed) * 0.08;
    return [
      x + p * width,
      y + height * (1 - Math.min(0.92, Math.max(0.08, baseline + wave))),
    ] as [number, number];
  });
  const line = pathFromPoints(points);
  const area = `${line} L${x + width} ${y + height} L${x} ${y + height} Z`;

  return (
    <g>
      {fill ? (
        <path d={area} fill={accent ? COLORS.cyan : COLORS.white} fillOpacity="0.1" />
      ) : null}
      <path
        d={line}
        fill="none"
        stroke={accent ? COLORS.cyanSoft : COLORS.white}
        strokeWidth={accent ? 2 : 1.4}
        strokeOpacity={accent ? 0.92 : 0.75}
        filter={accent ? "url(#cyan-glow)" : undefined}
      />
      {points.filter((_, index) => index % 5 === 0).map(([px, py], index) => (
        <circle
          key={index}
          cx={px}
          cy={py}
          r="2.4"
          fill={COLORS.black}
          stroke={accent ? COLORS.cyanSoft : COLORS.white}
          strokeWidth="1"
        />
      ))}
    </g>
  );
};

const CircularGauge: React.FC<{
  cx: number;
  cy: number;
  radius: number;
  value: number;
  accent?: boolean;
}> = ({cx, cy, radius, value, accent = false}) => {
  const circumference = Math.PI * radius * 1.45;
  return (
    <g>
      <path
        d={`M${cx - radius * 0.78} ${cy + radius * 0.62} A${radius} ${radius} 0 1 1 ${
          cx + radius * 0.78
        } ${cy + radius * 0.62}`}
        fill="none"
        stroke={COLORS.dim}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d={`M${cx - radius * 0.78} ${cy + radius * 0.62} A${radius} ${radius} 0 1 1 ${
          cx + radius * 0.78
        } ${cy + radius * 0.62}`}
        fill="none"
        stroke={accent ? COLORS.cyan : COLORS.white}
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={circumference}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - value)}
        filter={accent ? "url(#cyan-glow)" : undefined}
      />
      <circle cx={cx} cy={cy} r="3" fill={accent ? COLORS.cyanSoft : COLORS.white} />
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(Math.PI * (1.22 + value * 1.56)) * radius * 0.72}
        y2={cy + Math.sin(Math.PI * (1.22 + value * 1.56)) * radius * 0.72}
        stroke={accent ? COLORS.cyanSoft : COLORS.white}
        strokeWidth="1.5"
      />
    </g>
  );
};

const TrackRows: React.FC<{
  x: number;
  y: number;
  width: number;
  rows: number;
  frame: number;
  seed: number;
  accent?: boolean;
}> = ({x, y, width, rows, frame, seed, accent = false}) => (
  <g>
    {Array.from({length: rows}, (_, index) => {
      const value =
        0.24 +
        seeded(seed + index * 2) * 0.58 +
        Math.sin(frame * 0.013 + index * 1.13) * 0.07;
      const normalized = Math.min(0.96, Math.max(0.08, value));
      return (
        <g key={index} transform={`translate(0 ${index * 26})`}>
          <text x={x} y={y + 10} fill={COLORS.soft} fontSize="9" letterSpacing="1.1">
            {String.fromCharCode(65 + ((index + seed) % 22))}
            {String((index * 17 + seed) % 97).padStart(2, "0")}
          </text>
          <line
            x1={x + 34}
            y1={y + 7}
            x2={x + width}
            y2={y + 7}
            stroke={COLORS.dim}
            strokeWidth="1"
          />
          <line
            x1={x + 34}
            y1={y + 7}
            x2={x + 34 + (width - 34) * normalized}
            y2={y + 7}
            stroke={accent && index === rows - 2 ? COLORS.cyan : COLORS.white}
            strokeWidth={accent && index === rows - 2 ? 2 : 1.4}
            strokeOpacity="0.9"
          />
          <rect
            x={x + 34 + (width - 34) * normalized - 2}
            y={y + 3}
            width="4"
            height="8"
            fill={accent && index === rows - 2 ? COLORS.cyanSoft : COLORS.white}
          />
        </g>
      );
    })}
  </g>
);

const ButtonGrid: React.FC<{
  x: number;
  y: number;
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  frame: number;
}> = ({x, y, columns, rows, cellWidth, cellHeight, frame}) => (
  <g>
    {Array.from({length: columns * rows}, (_, index) => {
      const active = Math.floor(frame / 48) % (columns * rows) === index;
      const col = index % columns;
      const row = Math.floor(index / columns);
      return (
        <g key={index} transform={`translate(${x + col * cellWidth} ${y + row * cellHeight})`}>
          <rect
            x="0"
            y="0"
            width={cellWidth - 8}
            height={cellHeight - 8}
            fill={active ? COLORS.cyan : "transparent"}
            fillOpacity={active ? 0.14 : 0}
            stroke={active ? COLORS.cyan : COLORS.dim}
            strokeWidth={active ? 1.5 : 1}
          />
          <circle
            cx={(cellWidth - 8) / 2}
            cy={(cellHeight - 8) / 2 - 5}
            r={active ? 3.4 : 2.2}
            fill={active ? COLORS.cyanSoft : COLORS.soft}
          />
          <text
            x={(cellWidth - 8) / 2}
            y={(cellHeight - 8) / 2 + 14}
            textAnchor="middle"
            fill={active ? COLORS.cyanSoft : COLORS.soft}
            fontSize="7.5"
            letterSpacing="1"
          >
            {["SYNC", "SCAN", "LINK", "PING", "TEST", "LOCK"][index % 6]}
          </text>
        </g>
      );
    })}
  </g>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame === 0 || frame >= 899) {
    return <AbsoluteFill style={{backgroundColor: "#000000"}} />;
  }

  const seconds = frame / 60;
  const intro = interpolate(frame, [0, 34, 84], [0, 0.84, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const outro = interpolate(frame, [820, 899], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const opacity = intro * outro;
  const dataProgress = interpolate(frame, [70, 720], [0, 1], clamp);
  const mainValue = 67.39 + dataProgress * 3.61;
  const activePanel = frame < 145 ? -1 : Math.floor((frame - 145) / 76) % 13;
  const clock = String(Math.floor(seconds * 1000) % 1000000).padStart(6, "0");
  const packet = 367 + Math.floor(frame / 18) % 43;
  const statusPulse = Math.floor(frame / 32) % 4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        overflow: "hidden",
        fontFamily:
          '"IBM Plex Mono", "JetBrains Mono", "SFMono-Regular", Consolas, monospace',
      }}
    >
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: "absolute", inset: 0, opacity}}
      >
        <defs>
          <filter id="cyan-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="soft-white" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="metric-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.cyan} stopOpacity="0.18" />
            <stop offset="100%" stopColor={COLORS.cyan} stopOpacity="0" />
          </linearGradient>
          <pattern id="micro-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M40 0H0V40"
              fill="none"
              stroke={COLORS.faint}
              strokeWidth="0.65"
              strokeOpacity="0.54"
            />
          </pattern>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill={COLORS.black} />
        <rect
          x="60"
          y="48"
          width="1800"
          height="944"
          fill="url(#micro-grid)"
          opacity="0.24"
        />

        <g opacity={revealAt(frame, 0, 42)}>
          <path
            d="M74 62H386 M432 62H722 M770 62H1086 M1132 62H1462 M1510 62H1846"
            stroke={COLORS.white}
            strokeOpacity="0.72"
            strokeWidth="1.3"
            strokeDasharray="48 8 4 8"
          />
          <text x="74" y="52" fill={COLORS.soft} fontSize="10" letterSpacing="2">
            NEXUS // ANALYTICS CORE
          </text>
          <text
            x="1846"
            y="52"
            textAnchor="end"
            fill={COLORS.soft}
            fontSize="10"
            letterSpacing="2"
          >
            T+{clock} / LIVE
          </text>
          <circle cx="1812" cy="51" r="3" fill={COLORS.cyan} filter="url(#cyan-glow)" />
        </g>

        <HudPanel
          x={74}
          y={82}
          width={410}
          height={248}
          title="DATA STREAM"
          index={0}
          frame={frame}
          activePanel={activePanel}
        >
          <text x="22" y="72" fill={COLORS.white} fontSize="14" letterSpacing="2.2">
            DATA LOADING_
          </text>
          <text x="22" y="92" fill={COLORS.soft} fontSize="8.5" letterSpacing="1.1">
            PACKET QUEUE / NODE ARRAY / LIVE INGEST
          </text>
          <line x1="22" y1="112" x2="238" y2="112" stroke={COLORS.dim} />
          <line
            x1="22"
            y1="112"
            x2={22 + 216 * (0.2 + dataProgress * 0.8)}
            y2="112"
            stroke={activePanel === 0 ? COLORS.cyan : COLORS.white}
            strokeWidth="2"
          />
          <rect
            x={19 + 216 * (0.2 + dataProgress * 0.8)}
            y="108"
            width="7"
            height="8"
            fill={activePanel === 0 ? COLORS.cyanSoft : COLORS.white}
          />
          <MiniBars
            x={22}
            y={138}
            width={225}
            height={67}
            count={24}
            frame={frame}
            seed={11}
            accent={activePanel === 0}
          />
          <text x="282" y="70" fill={COLORS.soft} fontSize="9" letterSpacing="2">
            AUTO
          </text>
          <CircularGauge
            cx={328}
            cy={132}
            radius={43}
            value={0.38 + 0.23 * (0.5 + 0.5 * Math.sin(frame * 0.018))}
            accent={activePanel === 0}
          />
          <text
            x="328"
            y="190"
            textAnchor="middle"
            fill={COLORS.white}
            fontSize="24"
          >
            {String((packet * 7) % 100).padStart(2, "0")}
          </text>
          <text x="22" y="225" fill={COLORS.soft} fontSize="8.5" letterSpacing="1.6">
            CH {packet} / {Math.floor(928 + dataProgress * 67)} MB/S
          </text>
        </HudPanel>

        <HudPanel
          x={500}
          y={82}
          width={300}
          height={248}
          title="SENSORS"
          index={1}
          frame={frame}
          activePanel={activePanel}
        >
          {Array.from({length: 7}, (_, index) => {
            const active = statusPulse === index % 4;
            return (
              <g key={index} transform={`translate(22 ${61 + index * 23})`}>
                <text x="0" y="9" fill={COLORS.soft} fontSize="8.5">
                  S-{String(index + 1).padStart(2, "0")}
                </text>
                <rect
                  x="42"
                  y="1"
                  width="24"
                  height="11"
                  fill={active ? COLORS.cyan : "transparent"}
                  fillOpacity="0.18"
                  stroke={active ? COLORS.cyan : COLORS.dim}
                />
                <text
                  x="54"
                  y="10"
                  textAnchor="middle"
                  fill={active ? COLORS.cyanSoft : COLORS.white}
                  fontSize="7"
                >
                  {active ? "ON" : "ST"}
                </text>
                <line
                  x1="81"
                  y1="7"
                  x2="195"
                  y2="7"
                  stroke={COLORS.dim}
                  strokeWidth="1"
                />
                <line
                  x1="81"
                  y1="7"
                  x2={81 + 114 * (0.26 + seeded(index + 30) * 0.63)}
                  y2="7"
                  stroke={active ? COLORS.cyanSoft : COLORS.white}
                  strokeWidth={active ? 2 : 1}
                />
                <text x="213" y="9" fill={COLORS.soft} fontSize="7.5">
                  {(31 + index * 7 + Math.floor(frame / 40) % 9).toString().padStart(2, "0")}
                </text>
              </g>
            );
          })}
          <text x="22" y="231" fill={COLORS.dim} fontSize="7.5" letterSpacing="1.3">
            TEMP / OPTICAL / PRESSURE / FIELD
          </text>
        </HudPanel>

        <HudPanel
          x={816}
          y={82}
          width={346}
          height={248}
          title="INDICATORS"
          index={2}
          frame={frame}
          activePanel={activePanel}
        >
          {Array.from({length: 8}, (_, index) => {
            const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
            const active = Math.floor(frame / 26) % 8 === index;
            return (
              <g key={index}>
                <circle
                  cx={173 + Math.cos(angle) * 76}
                  cy={113 + Math.sin(angle) * 48}
                  r="12"
                  fill={active ? COLORS.cyan : "transparent"}
                  fillOpacity="0.12"
                  stroke={active ? COLORS.cyan : COLORS.soft}
                  strokeWidth={active ? 1.7 : 1}
                />
                <text
                  x={173 + Math.cos(angle) * 76}
                  y={116 + Math.sin(angle) * 48}
                  textAnchor="middle"
                  fill={active ? COLORS.cyanSoft : COLORS.soft}
                  fontSize="7"
                >
                  {String((index * 13 + Math.floor(frame / 18)) % 99).padStart(2, "0")}
                </text>
              </g>
            );
          })}
          <circle cx="173" cy="113" r="31" fill="none" stroke={COLORS.dim} />
          <circle
            cx="173"
            cy="113"
            r={7 + (0.5 + 0.5 * Math.sin(frame * 0.08)) * 5}
            fill="none"
            stroke={activePanel === 2 ? COLORS.cyan : COLORS.white}
            strokeOpacity="0.8"
          />
          <text
            x="173"
            y="190"
            textAnchor="middle"
            fill={COLORS.white}
            fontSize="12"
            letterSpacing="2"
          >
            INDICATORS INFO
          </text>
          <text
            x="173"
            y="208"
            textAnchor="middle"
            fill={COLORS.soft}
            fontSize="7.5"
            letterSpacing="1"
          >
            SYNCHRONICITY / PROCESS / QUALITY
          </text>
          <line x1="34" y1="221" x2="312" y2="221" stroke={COLORS.dim} />
        </HudPanel>

        <HudPanel
          x={1178}
          y={82}
          width={328}
          height={248}
          title="CALCULATION"
          index={3}
          frame={frame}
          activePanel={activePanel}
        >
          {Array.from({length: 6}, (_, index) => {
            const progress =
              0.25 +
              seeded(index + 58) * 0.58 +
              Math.sin(frame * 0.012 + index * 0.75) * 0.08;
            return (
              <g key={index} transform={`translate(22 ${61 + index * 28})`}>
                <text x="0" y="9" fill={COLORS.soft} fontSize="8">
                  {["CORE", "MESH", "NODE", "RATE", "SYNC", "HASH"][index]}
                </text>
                <line x1="56" y1="6" x2="280" y2="6" stroke={COLORS.dim} />
                <line
                  x1="56"
                  y1="6"
                  x2={56 + 224 * Math.max(0.08, Math.min(0.96, progress))}
                  y2="6"
                  stroke={index === statusPulse ? COLORS.cyan : COLORS.white}
                  strokeWidth={index === statusPulse ? 2 : 1.3}
                />
                <rect
                  x={54 + 224 * Math.max(0.08, Math.min(0.96, progress))}
                  y="2"
                  width="5"
                  height="8"
                  fill={index === statusPulse ? COLORS.cyanSoft : COLORS.white}
                />
              </g>
            );
          })}
          <text x="22" y="228" fill={COLORS.dim} fontSize="8" letterSpacing="1.4">
            CYCLE {String(Math.floor(frame / 4) % 9999).padStart(4, "0")} / NOMINAL
          </text>
        </HudPanel>

        <HudPanel
          x={1522}
          y={82}
          width={324}
          height={248}
          title="SIGNAL WAVE"
          index={4}
          frame={frame}
          activePanel={activePanel}
        >
          <Waveform
            x={18}
            y={57}
            width={288}
            height={112}
            frame={frame}
            accent={activePanel === 4}
          />
          <text x="18" y="191" fill={COLORS.soft} fontSize="8.5" letterSpacing="1.2">
            FREQ 034.88 KHZ
          </text>
          <text x="306" y="191" textAnchor="end" fill={COLORS.soft} fontSize="8.5">
            ±0.004
          </text>
          <line x1="18" y1="204" x2="306" y2="204" stroke={COLORS.dim} />
          <line
            x1="18"
            y1="204"
            x2={18 + 288 * (0.58 + Math.sin(frame * 0.015) * 0.08)}
            y2="204"
            stroke={COLORS.white}
          />
          <text x="18" y="226" fill={COLORS.dim} fontSize="7.5" letterSpacing="1.5">
            RX / PHASE / MODULATION
          </text>
        </HudPanel>

        <HudPanel
          x={74}
          y={346}
          width={410}
          height={254}
          title="PRIMARY METRIC"
          index={5}
          frame={frame}
          activePanel={activePanel}
        >
          <text
            x="24"
            y="101"
            fill={activePanel === 5 ? COLORS.cyanSoft : COLORS.white}
            fontSize="44"
            fontWeight="600"
            letterSpacing="1.6"
            filter={activePanel === 5 ? "url(#cyan-glow)" : "url(#soft-white)"}
          >
            {mainValue.toFixed(2)}
          </text>
          <text x="25" y="124" fill={COLORS.soft} fontSize="8.5" letterSpacing="1.8">
            NETWORK CONFIDENCE / INDEX
          </text>
          <g transform="translate(228 61)">
            {Array.from({length: 8}, (_, index) => (
              <g key={index}>
                <line
                  x1="0"
                  y1={index * 18}
                  x2="152"
                  y2={index * 18}
                  stroke={COLORS.dim}
                  strokeOpacity="0.55"
                />
                <rect
                  x={index * 18}
                  y={index * 18 - 4}
                  width={26 + seeded(index + 91) * 58}
                  height="5"
                  fill={index === statusPulse ? COLORS.cyan : COLORS.white}
                  fillOpacity={index === statusPulse ? 0.85 : 0.68}
                />
              </g>
            ))}
          </g>
          <LinePlot
            x={24}
            y={160}
            width={356}
            height={61}
            frame={frame}
            seed={21}
            accent={activePanel === 5}
            fill
          />
          <line x1="24" y1="231" x2="380" y2="231" stroke={COLORS.dim} />
        </HudPanel>

        <HudPanel
          x={500}
          y={346}
          width={400}
          height={254}
          title={`ANALYTICS / NO ${packet}`}
          index={6}
          frame={frame}
          activePanel={activePanel}
        >
          <MiniBars
            x={20}
            y={61}
            width={358}
            height={88}
            count={34}
            frame={frame}
            seed={64}
            accent={activePanel === 6}
          />
          <LinePlot
            x={20}
            y={166}
            width={358}
            height={52}
            frame={frame}
            seed={73}
            accent={activePanel === 6}
            fill
          />
          <text x="20" y="237" fill={COLORS.dim} fontSize="7.5" letterSpacing="1.4">
            SAMPLE / TICK / DELTA / DISTRIBUTION
          </text>
        </HudPanel>

        <HudPanel
          x={916}
          y={346}
          width={246}
          height={254}
          title="ACTION GRID"
          index={7}
          frame={frame}
          activePanel={activePanel}
        >
          <ButtonGrid
            x={20}
            y={60}
            columns={3}
            rows={3}
            cellWidth={70}
            cellHeight={54}
            frame={frame}
          />
          <text x="20" y="230" fill={COLORS.dim} fontSize="7.5" letterSpacing="1.2">
            CONTROL BUS / READY
          </text>
        </HudPanel>

        <HudPanel
          x={1178}
          y={346}
          width={328}
          height={254}
          title="NUMERIC MATRIX"
          index={8}
          frame={frame}
          activePanel={activePanel}
        >
          <g transform="translate(22 59)">
            {[0, 1, 2].map((index) => {
              const value = (47 + index * 11 + Math.floor(frame / 42) * 7) % 99;
              return (
                <g key={index} transform={`translate(0 ${index * 51})`}>
                  <text x="0" y="30" fill={COLORS.soft} fontSize="18">
                    ×
                  </text>
                  <text
                    x="32"
                    y="30"
                    fill={index === statusPulse % 3 ? COLORS.cyanSoft : COLORS.white}
                    fontSize="31"
                  >
                    {String(value).padStart(2, "0")}
                  </text>
                  <line x1="80" y1="29" x2="181" y2="29" stroke={COLORS.dim} />
                  <rect
                    x="88"
                    y="19"
                    width={38 + seeded(index + 14) * 54}
                    height="5"
                    fill={index === statusPulse % 3 ? COLORS.cyan : COLORS.white}
                    fillOpacity="0.72"
                  />
                </g>
              );
            })}
            <g transform="translate(229 5)">
              {Array.from({length: 16}, (_, index) => (
                <rect
                  key={index}
                  x="0"
                  y={index * 8}
                  width="33"
                  height="4"
                  fill={index < 6 + Math.floor((Math.sin(frame * 0.025) + 1) * 4)
                    ? index > 11
                      ? COLORS.amber
                      : COLORS.cyan
                    : COLORS.dim}
                  fillOpacity="0.76"
                />
              ))}
            </g>
          </g>
          <rect x="22" y="223" width="119" height="16" fill="none" stroke={COLORS.dim} />
          <text x="82" y="234" textAnchor="middle" fill={COLORS.soft} fontSize="7.5">
            CONNECT
          </text>
        </HudPanel>

        <HudPanel
          x={1522}
          y={346}
          width={324}
          height={254}
          title="CONTROL PANEL"
          index={9}
          frame={frame}
          activePanel={activePanel}
        >
          <g transform="translate(18 56)">
            {Array.from({length: 9}, (_, index) => (
              <line
                key={`v-${index}`}
                x1={(index / 8) * 288}
                y1="0"
                x2={(index / 8) * 288}
                y2="151"
                stroke={COLORS.dim}
                strokeOpacity="0.5"
              />
            ))}
            {Array.from({length: 7}, (_, index) => (
              <line
                key={`h-${index}`}
                x1="0"
                y1={(index / 6) * 151}
                x2="288"
                y2={(index / 6) * 151}
                stroke={COLORS.dim}
                strokeOpacity="0.5"
              />
            ))}
            <LinePlot
              x={0}
              y={0}
              width={288}
              height={151}
              frame={frame}
              seed={102}
              accent={activePanel === 9}
            />
            <line x1="144" y1="0" x2="144" y2="151" stroke={COLORS.white} strokeOpacity="0.25" />
            <line x1="0" y1="75.5" x2="288" y2="75.5" stroke={COLORS.white} strokeOpacity="0.25" />
          </g>
          <text x="18" y="230" fill={COLORS.dim} fontSize="7.5" letterSpacing="1.5">
            VECTOR LOCK / AUTONOMOUS
          </text>
        </HudPanel>

        <HudPanel
          x={74}
          y={616}
          width={826}
          height={346}
          title="DATA INDEX"
          index={10}
          frame={frame}
          activePanel={activePanel}
        >
          <g transform="translate(20 57)">
            {Array.from({length: 7}, (_, row) => {
              const rowActive = Math.floor(frame / 36) % 7 === row;
              return (
                <g key={row} transform={`translate(0 ${row * 36})`}>
                  <rect
                    x="0"
                    y="-3"
                    width="786"
                    height="28"
                    fill={rowActive ? COLORS.cyan : COLORS.white}
                    fillOpacity={rowActive ? 0.08 : row % 2 === 0 ? 0.025 : 0}
                  />
                  <line x1="0" y1="25" x2="786" y2="25" stroke={COLORS.dim} strokeOpacity="0.54" />
                  <text x="8" y="15" fill={rowActive ? COLORS.cyanSoft : COLORS.soft} fontSize="9">
                    {["26B", "41C", "59A", "71F", "83D", "92E", "A17"][row]} /
                    {String((packet + row * 13) % 999).padStart(3, "0")}
                  </text>
                  <text x="155" y="15" fill={COLORS.white} fontSize="9">
                    {String(118 + row * 147 + Math.floor(frame / 24) % 19).padStart(4, "0")} MB
                  </text>
                  <text x="300" y="15" fill={COLORS.soft} fontSize="9">
                    NODE {String((row * 7 + 12) % 46).padStart(2, "0")}
                  </text>
                  <text x="446" y="15" fill={COLORS.white} fontSize="9">
                    CH {String((row * 31 + packet) % 999).padStart(3, "0")}
                  </text>
                  <line
                    x1="588"
                    y1="11"
                    x2="750"
                    y2="11"
                    stroke={COLORS.dim}
                    strokeWidth="2"
                  />
                  <line
                    x1="588"
                    y1="11"
                    x2={588 + 162 * (0.28 + seeded(row + 205) * 0.66)}
                    y2="11"
                    stroke={rowActive ? COLORS.cyan : COLORS.white}
                    strokeWidth="2"
                  />
                  <circle
                    cx="774"
                    cy="11"
                    r="3"
                    fill={rowActive ? COLORS.cyanSoft : COLORS.soft}
                  />
                </g>
              );
            })}
          </g>
          <text x="20" y="327" fill={COLORS.dim} fontSize="7.5" letterSpacing="1.5">
            INDEX / ADDRESS / CAPACITY / CONTROLLER / INTEGRITY
          </text>
        </HudPanel>

        <HudPanel
          x={916}
          y={616}
          width={590}
          height={346}
          title="SYSTEM CONSOLE"
          index={11}
          frame={frame}
          activePanel={activePanel}
        >
          <g transform="translate(22 57)">
            {[
              "initialize mesh --channel primary",
              "verify sensor-array / checksum accepted",
              "compile data-map / nodes synchronized",
              "calculate vector field / delta nominal",
              "stream packet-bus / no collision",
              "commit runtime state / integrity 100%",
              "observe telemetry / autonomous mode",
              "archive cycle / await next command",
            ].map((line, index) => {
              const visible =
                ((Math.floor(frame / 28) + index + 4) % 10) < 8;
              return (
                <g key={line} transform={`translate(0 ${index * 26})`} opacity={visible ? 1 : 0.25}>
                  <text x="0" y="10" fill={index === statusPulse ? COLORS.cyanSoft : COLORS.soft} fontSize="8.5">
                    {String(index + 1).padStart(2, "0")}:
                  </text>
                  <text x="34" y="10" fill={COLORS.white} fontSize="8.5" letterSpacing="0.55">
                    {line}
                  </text>
                  <text x="528" y="10" textAnchor="end" fill={COLORS.dim} fontSize="8">
                    [{visible ? "OK" : ".."}]
                  </text>
                </g>
              );
            })}
            <line x1="0" y1="224" x2="546" y2="224" stroke={COLORS.dim} />
            <text x="0" y="247" fill={COLORS.soft} fontSize="8.5">
              DOWNLOAD / PROCESSING
            </text>
            <rect x="151" y="239" width="301" height="9" fill="none" stroke={COLORS.dim} />
            <rect
              x="153"
              y="241"
              width={297 * (0.18 + ((frame % 240) / 240) * 0.8)}
              height="5"
              fill={activePanel === 11 ? COLORS.cyan : COLORS.white}
              fillOpacity="0.82"
            />
            <text x="466" y="248" fill={COLORS.white} fontSize="8.5">
              {String(Math.floor(18 + ((frame % 240) / 240) * 80)).padStart(2, "0")}%
            </text>
            <path
              d="M520 243h22M531 232v22M525 237l12 12M537 237l-12 12"
              stroke={COLORS.soft}
              strokeWidth="1"
            />
          </g>
          <text x="22" y="327" fill={COLORS.dim} fontSize="7.5" letterSpacing="1.4">
            ROOT / SYSTEM / LIVE TELEMETRY
          </text>
        </HudPanel>

        <HudPanel
          x={1522}
          y={616}
          width={324}
          height={346}
          title="STATUS TRACKS"
          index={12}
          frame={frame}
          activePanel={activePanel}
        >
          <TrackRows
            x={18}
            y={63}
            width={286}
            rows={9}
            frame={frame}
            seed={41}
            accent={activePanel === 12}
          />
          <text x="18" y="322" fill={COLORS.dim} fontSize="7.5" letterSpacing="1.4">
            SIGNAL / BUFFER / RESPONSE
          </text>
        </HudPanel>

        <g opacity="0.5">
          <path d="M60 74V48H88 M1832 48H1860V74 M60 966V992H88 M1832 992H1860V966" stroke={COLORS.white} strokeWidth="2" fill="none" />
          <line x1="60" y1="1008" x2="1860" y2="1008" stroke={COLORS.dim} />
          <text x="60" y="1026" fill={COLORS.dim} fontSize="8" letterSpacing="1.45">
            INT / UNSIGNED COUNT / GROUP INFO / NODE / BLOCK / CONTROLLER / SYSTEM
          </text>
          <text x="1860" y="1026" textAnchor="end" fill={COLORS.dim} fontSize="8" letterSpacing="1.45">
            CORE STATUS: NOMINAL
          </text>
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: opacity * 0.2,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg,rgba(255,255,255,.026) 0px,rgba(255,255,255,.026) 1px,transparent 1px,transparent 4px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center,transparent 58%,rgba(0,0,0,.42) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
