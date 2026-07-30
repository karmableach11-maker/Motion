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
  black: "#01040a",
  navy: "#04101f",
  deepBlue: "#061b35",
  blue: "#2585ff",
  electric: "#58bcff",
  cyan: "#82f4ff",
  white: "#eefcff",
  violet: "#8b7cff",
  teal: "#31e6ce",
};

const smooth = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const out = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const seed = (index: number) => {
  const value = Math.sin(index * 83.173 + 19.731) * 43758.5453;
  return value - Math.floor(value);
};

const DOCUMENT_PATH = "M-220 -270H100L220 -150V270H-220Z";
const DOCUMENT_PERIMETER = 1690;

const CONTENT_LINES = [
  {y: -116, width: 168, delay: 0},
  {y: -68, width: 292, delay: 24},
  {y: -20, width: 244, delay: 49},
  {y: 28, width: 302, delay: 74},
  {y: 76, width: 260, delay: 99},
  {y: 124, width: 196, delay: 124},
] as const;

const FloatingData: React.FC<{frame: number; reveal: number}> = ({
  frame,
  reveal,
}) => {
  return (
    <g opacity={reveal * 0.7}>
      {Array.from({length: 28}, (_, index) => {
        const angle = seed(index) * Math.PI * 2;
        const radiusX = 410 + seed(index + 40) * 190;
        const radiusY = 310 + seed(index + 80) * 120;
        const speed = 0.0018 + seed(index + 120) * 0.0018;
        const drift = frame * speed;
        const x = Math.cos(angle + drift) * radiusX;
        const y = Math.sin(angle + drift) * radiusY;
        const pulse =
          0.28 +
          0.72 * (0.5 + 0.5 * Math.sin(frame * 0.045 + index * 1.71));
        const isBar = index % 4 === 0;
        return isBar ? (
          <rect
            key={index}
            x={x - 10}
            y={y - 1.25}
            width={20 + seed(index + 160) * 28}
            height={2.5}
            rx={1.25}
            fill={index % 8 === 0 ? COLORS.violet : COLORS.cyan}
            opacity={pulse * 0.58}
            transform={`rotate(${(angle * 180) / Math.PI + 90} ${x} ${y})`}
          />
        ) : (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={1.8 + seed(index + 200) * 2.5}
            fill={index % 3 === 0 ? COLORS.violet : COLORS.electric}
            opacity={pulse * 0.66}
          />
        );
      })}
    </g>
  );
};

const OrbitField: React.FC<{frame: number; reveal: number}> = ({
  frame,
  reveal,
}) => {
  const orbitPulse = 0.5 + 0.5 * Math.sin((frame / 210) * Math.PI * 2);
  return (
    <g opacity={reveal}>
      <ellipse
        cx="0"
        cy="18"
        rx="520"
        ry="404"
        fill="none"
        stroke={COLORS.blue}
        strokeOpacity={0.08 + orbitPulse * 0.04}
        strokeWidth="1.4"
        strokeDasharray="3 17"
        transform={`rotate(${frame * 0.018})`}
      />
      <ellipse
        cx="0"
        cy="18"
        rx="452"
        ry="350"
        fill="none"
        stroke={COLORS.violet}
        strokeOpacity={0.08}
        strokeWidth="1"
        strokeDasharray="64 112"
        strokeDashoffset={-frame * 0.55}
      />
      <ellipse
        cx="0"
        cy="18"
        rx="372"
        ry="290"
        fill="none"
        stroke={COLORS.cyan}
        strokeOpacity={0.13}
        strokeWidth="1"
        strokeDasharray="2 24"
        strokeDashoffset={frame * 0.38}
      />
      {Array.from({length: 4}, (_, index) => {
        const angle = frame * (0.004 + index * 0.0004) + index * 1.57;
        const x = Math.cos(angle) * (452 - index * 14);
        const y = Math.sin(angle) * (350 - index * 12) + 18;
        return (
          <g key={index}>
            <circle
              cx={x}
              cy={y}
              r={8 + index * 1.4}
              fill="none"
              stroke={index % 2 ? COLORS.violet : COLORS.cyan}
              strokeOpacity="0.24"
            />
            <circle
              cx={x}
              cy={y}
              r="2.8"
              fill={index % 2 ? COLORS.violet : COLORS.cyan}
            />
          </g>
        );
      })}
    </g>
  );
};

const CornerBrackets: React.FC<{frame: number; reveal: number}> = ({
  frame,
  reveal,
}) => {
  const breath = 0.5 + 0.5 * Math.sin(frame * 0.035);
  const x = 348 + breath * 7;
  const y = 325 + breath * 5;
  const length = 58;
  const corners = [
    `M${-x + length} ${-y}H${-x}V${-y + length}`,
    `M${x - length} ${-y}H${x}V${-y + length}`,
    `M${-x} ${y - length}V${y}H${-x + length}`,
    `M${x} ${y - length}V${y}H${x - length}`,
  ];
  return (
    <g opacity={reveal * (0.48 + breath * 0.24)}>
      {corners.map((path, index) => (
        <path
          key={path}
          d={path}
          fill="none"
          stroke={index % 2 ? COLORS.violet : COLORS.cyan}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

const DocumentLayer: React.FC<{
  frame: number;
  index: number;
  reveal: number;
  x: number;
  y: number;
  rotation: number;
}> = ({frame, index, reveal, x, y, rotation}) => {
  const drift = Math.sin(frame * 0.018 + index * 1.4) * (1.8 + index * 0.5);
  const tracerOffset =
    -((frame * (4.35 + index * 0.22) + index * 480) % DOCUMENT_PERIMETER);
  const color = index === 0 ? COLORS.violet : COLORS.electric;
  return (
    <g
      transform={`translate(${x + drift} ${y - drift * 0.35}) rotate(${
        rotation + drift * 0.06
      })`}
      opacity={reveal * (0.72 - index * 0.1)}
    >
      <path
        d={DOCUMENT_PATH}
        fill="url(#back-page)"
        stroke={color}
        strokeOpacity={0.34}
        strokeWidth="2"
      />
      <path
        d={DOCUMENT_PATH}
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeOpacity="0.11"
        filter="url(#blur-glow)"
      />
      <path
        d={DOCUMENT_PATH}
        fill="none"
        stroke={color}
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeDasharray={`92 ${DOCUMENT_PERIMETER - 92}`}
        strokeDashoffset={tracerOffset}
        filter="url(#small-glow)"
      />
      <path
        d="M100 -270V-150H220"
        fill="none"
        stroke={color}
        strokeOpacity="0.24"
        strokeWidth="1.5"
      />
    </g>
  );
};

const ContentLine: React.FC<{
  frame: number;
  y: number;
  width: number;
  delay: number;
}> = ({frame, y, width, delay}) => {
  const start = 58 + delay;
  const progress = out(frame, start, start + 82);
  const secondary = smooth(frame, start + 34, start + 118);
  const lineX = -146;
  const shimmerPosition = ((frame * 2.7 + delay * 3.1) % (width + 70)) - 35;
  return (
    <g opacity={progress}>
      <line
        x1={lineX}
        y1={y}
        x2={lineX + width * progress}
        y2={y}
        stroke="url(#content-line)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1={lineX}
        y1={y}
        x2={lineX + width * progress}
        y2={y}
        stroke={COLORS.cyan}
        strokeWidth="18"
        strokeOpacity={0.055 * secondary}
        strokeLinecap="round"
        filter="url(#blur-glow)"
      />
      {progress > 0.98 ? (
        <circle
          cx={lineX + Math.min(width - 3, Math.max(3, shimmerPosition))}
          cy={y}
          r="3.7"
          fill={COLORS.white}
          opacity={0.28 + secondary * 0.36}
          filter="url(#small-glow)"
        />
      ) : null}
    </g>
  );
};

const VerifiedSeal: React.FC<{frame: number}> = ({frame}) => {
  const reveal = out(frame, 330, 422);
  const check = out(frame, 395, 476);
  const response = smooth(frame, 466, 590);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.07);
  const rotation = frame * 0.11;
  const ringRadius = 104 + pulse * 3;
  return (
    <g
      transform={`translate(188 170) scale(${0.72 + reveal * 0.28})`}
      opacity={reveal}
    >
      <circle
        r={131 + response * 10}
        fill="none"
        stroke={COLORS.teal}
        strokeOpacity={(1 - response) * 0.32}
        strokeWidth="2"
      />
      <circle
        r={116}
        fill={COLORS.navy}
        fillOpacity="0.82"
        stroke={COLORS.cyan}
        strokeOpacity="0.72"
        strokeWidth="2"
      />
      <circle
        r={ringRadius}
        fill="url(#seal-fill)"
        stroke={COLORS.white}
        strokeOpacity={0.25 + pulse * 0.2}
        strokeWidth="1.5"
      />
      <g transform={`rotate(${rotation})`}>
        <circle
          r="126"
          fill="none"
          stroke={COLORS.cyan}
          strokeOpacity="0.75"
          strokeWidth="3"
          strokeDasharray="8 18 2 22"
          strokeLinecap="round"
        />
        {Array.from({length: 12}, (_, index) => {
          const angle = (index / 12) * Math.PI * 2;
          const x1 = Math.cos(angle) * 95;
          const y1 = Math.sin(angle) * 95;
          const x2 = Math.cos(angle) * 101;
          const y2 = Math.sin(angle) * 101;
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={index % 3 === 0 ? COLORS.violet : COLORS.cyan}
              strokeWidth={index % 3 === 0 ? 3 : 1.5}
              strokeLinecap="round"
              opacity={0.48 + pulse * 0.32}
            />
          );
        })}
      </g>
      <circle
        r="79"
        fill={COLORS.blue}
        fillOpacity={0.11 + pulse * 0.04}
        stroke={COLORS.cyan}
        strokeOpacity="0.18"
      />
      <path
        d="M-42 2L-12 34L48 -38"
        fill="none"
        stroke={COLORS.white}
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - check}
        filter="url(#small-glow)"
      />
      <circle
        r="9"
        fill={COLORS.white}
        opacity={0.18 + pulse * 0.12}
        filter="url(#blur-glow)"
      />
      {Array.from({length: 4}, (_, index) => {
        const angle = frame * (0.014 + index * 0.0012) + index * 1.6;
        const radius = 142 + index * 7;
        return (
          <circle
            key={index}
            cx={Math.cos(angle) * radius}
            cy={Math.sin(angle) * radius}
            r={index % 2 ? 2.5 : 4}
            fill={index % 2 ? COLORS.violet : COLORS.teal}
            opacity={0.38 + pulse * 0.4}
          />
        );
      })}
    </g>
  );
};

const SmartDocument: React.FC<{frame: number}> = ({frame}) => {
  const backReveal1 = out(frame, 16, 76);
  const backReveal2 = out(frame, 28, 92);
  const frontReveal = out(frame, 38, 112);
  const foldReveal = smooth(frame, 82, 164);
  const tracerOffset = -((frame * 4.85 + 120) % DOCUMENT_PERIMETER);
  const breath = 0.5 + 0.5 * Math.sin(frame * 0.032);
  const contentReady = smooth(frame, 210, 330);
  return (
    <g>
      <DocumentLayer
        frame={frame}
        index={0}
        reveal={backReveal1}
        x={-78}
        y={56}
        rotation={-2.2}
      />
      <DocumentLayer
        frame={frame}
        index={1}
        reveal={backReveal2}
        x={-42}
        y={30}
        rotation={-1.1}
      />
      <g opacity={frontReveal}>
        <path
          d={DOCUMENT_PATH}
          fill="url(#front-page)"
          stroke={COLORS.electric}
          strokeOpacity={0.74}
          strokeWidth="2.2"
        />
        <path
          d={DOCUMENT_PATH}
          fill="none"
          stroke={COLORS.blue}
          strokeWidth={22 + breath * 5}
          strokeOpacity={0.1 + breath * 0.025}
          filter="url(#blur-glow)"
        />
        <path
          d={DOCUMENT_PATH}
          fill="none"
          stroke={COLORS.cyan}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`104 ${DOCUMENT_PERIMETER - 104}`}
          strokeDashoffset={tracerOffset}
          filter="url(#small-glow)"
        />
        <path
          d="M100 -270V-150H220"
          fill={COLORS.blue}
          fillOpacity={0.08 + foldReveal * 0.11}
          stroke={COLORS.cyan}
          strokeOpacity={0.4 + foldReveal * 0.46}
          strokeWidth="2"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - foldReveal}
        />
        <path
          d="M104 -264L214 -154H112Q104 -154 104 -162Z"
          fill="url(#fold-fill)"
          opacity={foldReveal * 0.85}
        />
        <rect
          x="-164"
          y="-202"
          width="74"
          height="12"
          rx="6"
          fill={COLORS.cyan}
          opacity={0.1 + contentReady * 0.38}
        />
        <circle
          cx="-181"
          cy="-196"
          r="6"
          fill={COLORS.teal}
          opacity={0.24 + contentReady * 0.7}
          filter="url(#small-glow)"
        />
        {CONTENT_LINES.map((line) => (
          <ContentLine
            key={line.y}
            frame={frame}
            y={line.y}
            width={line.width}
            delay={line.delay}
          />
        ))}
        <g opacity={contentReady * 0.62} transform="translate(-156 174)">
          {Array.from({length: 12}, (_, index) => {
            const x = (index % 4) * 17;
            const y = Math.floor(index / 4) * 17;
            const active = (index * 7) % 5 !== 0;
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={active ? 10 : 5}
                height={active ? 10 : 5}
                rx="1.8"
                fill={index % 3 === 0 ? COLORS.violet : COLORS.cyan}
                opacity={0.3 + 0.5 * (0.5 + 0.5 * Math.sin(frame * 0.05 + index))}
              />
            );
          })}
        </g>
        <g opacity={contentReady * 0.52} transform="translate(-42 188)">
          {[96, 72, 112].map((width, index) => (
            <rect
              key={width}
              x="0"
              y={index * 18}
              width={width}
              height="5"
              rx="2.5"
              fill={index === 1 ? COLORS.violet : COLORS.electric}
              opacity={0.45 + 0.24 * Math.sin(frame * 0.045 + index)}
            />
          ))}
        </g>
      </g>
      <VerifiedSeal frame={frame} />
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneOpacity = interpolate(frame, [0, 34, 820, 899], [0, 1, 1, 0], clamp);
  const environmentReveal = smooth(frame, 0, 150);
  const cameraScale = interpolate(
    frame,
    [0, 360, 610, 760, 899],
    [0.965, 1, 1.025, 1.01, 1],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const cameraY = interpolate(frame, [0, 610, 760], [10, -5, 0], clamp);
  const auraPulse = 0.5 + 0.5 * Math.sin(frame * 0.025);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{display: "block"}}
      >
        <defs>
          <radialGradient id="background-aura" cx="50%" cy="48%" r="56%">
            <stop offset="0%" stopColor={COLORS.deepBlue} stopOpacity="0.86" />
            <stop offset="44%" stopColor={COLORS.navy} stopOpacity="0.56" />
            <stop offset="100%" stopColor={COLORS.black} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="back-page" x1="0" y1="-270" x2="0" y2="270">
            <stop offset="0%" stopColor={COLORS.blue} stopOpacity="0.08" />
            <stop offset="100%" stopColor={COLORS.violet} stopOpacity="0.025" />
          </linearGradient>
          <linearGradient id="front-page" x1="-220" y1="-270" x2="220" y2="270">
            <stop offset="0%" stopColor={COLORS.blue} stopOpacity="0.14" />
            <stop offset="52%" stopColor={COLORS.navy} stopOpacity="0.24" />
            <stop offset="100%" stopColor={COLORS.violet} stopOpacity="0.09" />
          </linearGradient>
          <linearGradient id="fold-fill" x1="100" y1="-270" x2="220" y2="-150">
            <stop offset="0%" stopColor={COLORS.white} stopOpacity="0.16" />
            <stop offset="50%" stopColor={COLORS.cyan} stopOpacity="0.28" />
            <stop offset="100%" stopColor={COLORS.blue} stopOpacity="0.06" />
          </linearGradient>
          <linearGradient
            id="content-line"
            gradientUnits="userSpaceOnUse"
            x1="-150"
            y1="0"
            x2="180"
            y2="0"
          >
            <stop offset="0%" stopColor={COLORS.white} />
            <stop offset="72%" stopColor={COLORS.white} />
            <stop offset="100%" stopColor={COLORS.cyan} />
          </linearGradient>
          <radialGradient id="seal-fill" cx="42%" cy="34%" r="74%">
            <stop offset="0%" stopColor={COLORS.cyan} stopOpacity="0.24" />
            <stop offset="58%" stopColor={COLORS.blue} stopOpacity="0.18" />
            <stop offset="100%" stopColor={COLORS.violet} stopOpacity="0.12" />
          </radialGradient>
          <filter id="small-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="blur-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <pattern id="micro-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M48 0H0V48"
              fill="none"
              stroke={COLORS.blue}
              strokeOpacity="0.055"
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="1.2" fill={COLORS.cyan} fillOpacity="0.12" />
          </pattern>
        </defs>

        <rect width="1920" height="1080" fill={COLORS.black} />
        <g opacity={sceneOpacity}>
          <rect
            width="1920"
            height="1080"
            fill="url(#background-aura)"
            opacity={0.8 + auraPulse * 0.12}
          />
          <rect width="1920" height="1080" fill="url(#micro-grid)" opacity={environmentReveal} />
          <ellipse
            cx="960"
            cy="906"
            rx={390 + auraPulse * 18}
            ry="78"
            fill={COLORS.blue}
            opacity={0.075 + auraPulse * 0.025}
            filter="url(#blur-glow)"
          />
          <g
            transform={`translate(960 ${520 + cameraY}) scale(${cameraScale})`}
          >
            <OrbitField frame={frame} reveal={environmentReveal * 0.88} />
            <FloatingData frame={frame} reveal={environmentReveal} />
            <CornerBrackets frame={frame} reveal={environmentReveal} />
            <SmartDocument frame={frame} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
