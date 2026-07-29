import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

type GlassBarSpec = {
  x: number;
  height: number;
  start: number;
  color: string;
  light: string;
  dark: string;
};

const BASELINE = 790;
const BAR_WIDTH = 118;
const DEPTH_X = 31;
const DEPTH_Y = 22;

const BARS: readonly GlassBarSpec[] = [
  {
    x: 318,
    height: 486,
    start: 112,
    color: "#55a8ff",
    light: "#a9e8ff",
    dark: "#2860e8",
  },
  {
    x: 533,
    height: 396,
    start: 200,
    color: "#ff5d8e",
    light: "#ffc0d8",
    dark: "#db2c72",
  },
  {
    x: 748,
    height: 319,
    start: 288,
    color: "#53e8b4",
    light: "#c3ffe9",
    dark: "#16a97d",
  },
  {
    x: 963,
    height: 251,
    start: 376,
    color: "#ffc857",
    light: "#fff0a8",
    dark: "#e68b22",
  },
  {
    x: 1178,
    height: 194,
    start: 464,
    color: "#b778ff",
    light: "#ead2ff",
    dark: "#7a3be0",
  },
  {
    x: 1393,
    height: 144,
    start: 552,
    color: "#36e5ed",
    light: "#c4ffff",
    dark: "#0fa6c0",
  },
] as const;

const smooth = (frame: number, input: readonly [number, number]) =>
  interpolate(frame, input, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const seeded = (index: number) => {
  const value = Math.sin(index * 91.731 + 12.349) * 43758.5453;
  return value - Math.floor(value);
};

const Atmosphere: React.FC<{phase: number}> = ({phase}) => {
  const particles = Array.from({length: 34}, (_, index) => {
    const x = 90 + seeded(index + 2) * 1740;
    const y = 70 + seeded(index + 41) * 870;
    const r = 1.2 + seeded(index + 83) * 3.7;
    const driftX = Math.sin(phase + index * 0.73) * (5 + seeded(index + 7) * 9);
    const driftY = Math.cos(phase + index * 0.51) * (4 + seeded(index + 9) * 7);
    const alpha = 0.08 + seeded(index + 14) * 0.26;
    return (
      <circle
        key={index}
        cx={x + driftX}
        cy={y + driftY}
        r={r}
        fill={index % 3 === 0 ? "#b9ffff" : index % 3 === 1 ? "#91a8ff" : "#ffffff"}
        opacity={alpha}
      />
    );
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 18%, rgba(43,116,176,.28), transparent 34%), radial-gradient(circle at 78% 23%, rgba(109,52,176,.22), transparent 31%), radial-gradient(circle at 55% 88%, rgba(28,181,190,.16), transparent 39%), linear-gradient(148deg,#07111f 0%,#0a1730 46%,#07111f 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 145 + Math.sin(phase) * 24,
          top: 62 + Math.cos(phase) * 14,
          width: 620,
          height: 360,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse,rgba(61,207,255,.13),rgba(61,207,255,.025) 48%,transparent 72%)",
          filter: "blur(46px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 70 + Math.cos(phase) * 27,
          top: 115 + Math.sin(phase) * 18,
          width: 590,
          height: 390,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse,rgba(177,92,255,.12),rgba(177,92,255,.018) 52%,transparent 73%)",
          filter: "blur(52px)",
        }}
      />

      <svg width="1920" height="1080" style={{position: "absolute", inset: 0}}>
        <defs>
          <filter id="particle-glow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="haze-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#89ddff" stopOpacity="0" />
            <stop offset="50%" stopColor="#8deaff" stopOpacity=".18" />
            <stop offset="100%" stopColor="#89ddff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g filter="url(#particle-glow)">{particles}</g>
        <path
          d={`M80 ${905 + Math.sin(phase) * 3} H1840`}
          stroke="url(#haze-line)"
          strokeWidth="1"
          opacity=".45"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg,transparent 18%,rgba(255,255,255,.025) 31%,transparent 44%)",
          transform: `translateX(${Math.sin(phase) * 18}px)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

const GlassColumn: React.FC<{
  spec: GlassBarSpec;
  index: number;
  frame: number;
  globalOpacity: number;
  climax: number;
}> = ({spec, index, frame, globalOpacity, climax}) => {
  const progress = interpolate(frame, [spec.start, spec.start + 96], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const faceProgress = interpolate(progress, [0, 0.14], [0, 1], clamp);
  const h = Math.max(1, spec.height * progress);
  const top = BASELINE - h;
  const topDepth = DEPTH_Y * faceProgress;
  const depthX = DEPTH_X * faceProgress;
  const shimmerY =
    top -
    80 +
    interpolate(frame, [spec.start + 8, spec.start + 108], [0, h + 180], clamp);
  const glint = interpolate(
    frame,
    [640 + index * 7, 675 + index * 7, 722 + index * 7],
    [0, 1, 0],
    clamp,
  );
  const edgePulse =
    0.76 +
    climax * 0.2 +
    glint * 0.45 +
    Math.sin(frame * 0.028 + index * 0.8) * 0.04 * progress;
  const appear = interpolate(progress, [0, 0.08], [0, 1], clamp) * globalOpacity;

  return (
    <g opacity={appear}>
      <defs>
        <linearGradient id={`front-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={spec.light} stopOpacity=".72" />
          <stop offset="23%" stopColor={spec.color} stopOpacity=".48" />
          <stop offset="67%" stopColor={spec.dark} stopOpacity=".32" />
          <stop offset="100%" stopColor={spec.color} stopOpacity=".58" />
        </linearGradient>
        <linearGradient id={`top-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".94" />
          <stop offset="37%" stopColor={spec.light} stopOpacity=".78" />
          <stop offset="100%" stopColor={spec.color} stopOpacity=".43" />
        </linearGradient>
        <linearGradient id={`side-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={spec.color} stopOpacity=".42" />
          <stop offset="100%" stopColor={spec.dark} stopOpacity=".68" />
        </linearGradient>
        <linearGradient id={`reflection-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spec.color} stopOpacity=".31" />
          <stop offset="42%" stopColor={spec.color} stopOpacity=".09" />
          <stop offset="100%" stopColor={spec.color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`shimmer-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="48%" stopColor="#ffffff" stopOpacity=".52" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`front-clip-${index}`}>
          <rect x={spec.x} y={top} width={BAR_WIDTH} height={h} rx="5" />
        </clipPath>
        <filter id={`bar-shadow-${index}`} x="-70%" y="-35%" width="240%" height="190%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="blur" />
          <feOffset dy="18" dx="6" result="offset" />
          <feFlood floodColor={spec.dark} floodOpacity=".44" />
          <feComposite in2="offset" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`reflection-blur-${index}`} x="-70%" y="-30%" width="240%" height="170%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={`edge-glow-${index}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={2.4 + climax * 2.2} result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx={spec.x + BAR_WIDTH / 2 + depthX * 0.42}
        cy={BASELINE + 21}
        rx={BAR_WIDTH * 0.7}
        ry={18}
        fill={spec.color}
        opacity={0.11 + climax * 0.07}
        filter={`url(#reflection-blur-${index})`}
      />

      <g
        filter={`url(#reflection-blur-${index})`}
        opacity={0.72 * progress}
        style={{mixBlendMode: "screen"}}
      >
        <path
          d={`M${spec.x} ${BASELINE + 6}H${spec.x + BAR_WIDTH}L${
            spec.x + BAR_WIDTH + depthX * 0.5
          } ${BASELINE + Math.min(180, h * 0.3)}H${spec.x + depthX * 0.25}Z`}
          fill={`url(#reflection-${index})`}
        />
      </g>

      <g filter={`url(#bar-shadow-${index})`}>
        <path
          d={`M${spec.x + BAR_WIDTH} ${top}L${spec.x + BAR_WIDTH + depthX} ${
            top - topDepth
          }V${BASELINE - topDepth}L${spec.x + BAR_WIDTH} ${BASELINE}Z`}
          fill={`url(#side-${index})`}
          stroke={spec.light}
          strokeOpacity={0.36 + climax * 0.17}
          strokeWidth="1.5"
        />

        <rect
          x={spec.x}
          y={top}
          width={BAR_WIDTH}
          height={h}
          rx="5"
          fill={`url(#front-${index})`}
          stroke={spec.light}
          strokeOpacity={edgePulse}
          strokeWidth={1.8 + climax * 0.8}
        />

        <rect
          x={spec.x + 12}
          y={top + 12}
          width="13"
          height={Math.max(0, h - 24)}
          rx="6.5"
          fill="#ffffff"
          opacity={0.13 + climax * 0.07}
        />
        <rect
          x={spec.x + 30}
          y={top + 14}
          width="2"
          height={Math.max(0, h - 30)}
          fill="#ffffff"
          opacity=".23"
        />

        <g clipPath={`url(#front-clip-${index})`}>
          <rect
            x={spec.x - 42}
            y={shimmerY}
            width={BAR_WIDTH + 84}
            height="62"
            fill={`url(#shimmer-${index})`}
            transform={`rotate(-16 ${spec.x + BAR_WIDTH / 2} ${shimmerY + 31})`}
            opacity=".46"
          />
        </g>

        <path
          d={`M${spec.x} ${top}L${spec.x + depthX} ${top - topDepth}H${
            spec.x + BAR_WIDTH + depthX
          }L${spec.x + BAR_WIDTH} ${top}Z`}
          fill={`url(#top-${index})`}
          stroke="#ffffff"
          strokeOpacity={0.73 + glint * 0.24}
          strokeWidth="1.6"
          filter={`url(#edge-glow-${index})`}
        />

        <path
          d={`M${spec.x + 8} ${top + 8}V${BASELINE - 10}`}
          stroke="#ffffff"
          strokeOpacity=".22"
          strokeWidth="1.2"
        />
      </g>

      <circle
        cx={spec.x + BAR_WIDTH + depthX}
        cy={top - topDepth}
        r={2.4 + glint * 6}
        fill="#ffffff"
        opacity={0.35 + glint * 0.65}
        filter={`url(#edge-glow-${index})`}
      />
    </g>
  );
};

const ChartStructure: React.FC<{
  frame: number;
  opacity: number;
  climax: number;
}> = ({frame, opacity, climax}) => {
  const gridProgress = smooth(frame, [18, 102]);
  const baselineProgress = smooth(frame, [36, 118]);
  const sweepX = interpolate(frame, [648, 765], [-300, 2180], clamp);
  const sweepOpacity = interpolate(frame, [640, 670, 742, 778], [0, 0.64, 0.5, 0], clamp);

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: "absolute", inset: 0, opacity}}
    >
      <defs>
        <linearGradient id="panel-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8fbff" stopOpacity=".075" />
          <stop offset="45%" stopColor="#638ad0" stopOpacity=".035" />
          <stop offset="100%" stopColor="#62e5e8" stopOpacity=".018" />
        </linearGradient>
        <linearGradient id="panel-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e4fbff" stopOpacity=".56" />
          <stop offset="48%" stopColor="#8ab6ea" stopOpacity=".15" />
          <stop offset="100%" stopColor="#a8ffff" stopOpacity=".44" />
        </linearGradient>
        <linearGradient id="baseline-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#93dfff" stopOpacity=".22" />
          <stop offset="50%" stopColor="#e5ffff" stopOpacity=".9" />
          <stop offset="100%" stopColor="#71d8ff" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id="global-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="42%" stopColor="#c9ffff" stopOpacity=".05" />
          <stop offset="51%" stopColor="#ffffff" stopOpacity=".72" />
          <stop offset="58%" stopColor="#a8efff" stopOpacity=".1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="floor-glow" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#a5efff" stopOpacity=".17" />
          <stop offset="65%" stopColor="#3ba9ce" stopOpacity=".025" />
          <stop offset="100%" stopColor="#14334e" stopOpacity="0" />
        </radialGradient>
        <filter id="panel-shadow" x="-20%" y="-30%" width="140%" height="180%">
          <feDropShadow dx="0" dy="30" stdDeviation="36" floodColor="#020812" floodOpacity=".7" />
          <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#54bde7" floodOpacity=".07" />
        </filter>
        <filter id="baseline-glow" x="-20%" y="-500%" width="140%" height="1100%">
          <feGaussianBlur stdDeviation={2.4 + climax * 3} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="chart-clip">
          <rect x="158" y="129" width="1610" height="784" rx="48" />
        </clipPath>
      </defs>

      <rect
        x="158"
        y="129"
        width="1610"
        height="784"
        rx="48"
        fill="url(#panel-fill)"
        stroke="url(#panel-stroke)"
        strokeWidth="1.5"
        opacity={gridProgress}
        filter="url(#panel-shadow)"
      />
      <path
        d="M206 163H1720"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeOpacity={0.13 * gridProgress}
      />

      <g clipPath="url(#chart-clip)" opacity={gridProgress}>
        <rect x="185" y="790" width="1556" height="250" fill="url(#floor-glow)" />
        {[258, 346, 434, 522, 610, 698].map((y, index) => (
          <g key={y}>
            <line
              x1="218"
              y1={y}
              x2="1707"
              y2={y}
              stroke="#a6d9f1"
              strokeOpacity={0.085 + index * 0.008}
              strokeWidth="1"
              strokeDasharray="6 12"
              strokeDashoffset={(1 - gridProgress) * 120}
            />
            <line
              x1="218"
              y1={y + 1}
              x2={218 + gridProgress * 1489}
              y2={y + 1}
              stroke="#ffffff"
              strokeOpacity=".035"
            />
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
          const x = 260 + index * 199;
          return (
            <path
              key={index}
              d={`M${x} 214L${x + 72} 790`}
              stroke="#88cce8"
              strokeOpacity=".036"
              strokeWidth="1"
            />
          );
        })}
      </g>

      <line
        x1="218"
        y1={BASELINE}
        x2={218 + baselineProgress * 1489}
        y2={BASELINE}
        stroke="url(#baseline-gradient)"
        strokeWidth="2.5"
        filter="url(#baseline-glow)"
      />
      <line
        x1="218"
        y1={790}
        x2="218"
        y2={790 - baselineProgress * 562}
        stroke="url(#baseline-gradient)"
        strokeWidth="2"
        opacity=".72"
        filter="url(#baseline-glow)"
      />

      {BARS.map((spec, index) => (
        <GlassColumn
          key={index}
          spec={spec}
          index={index}
          frame={frame}
          globalOpacity={1}
          climax={climax}
        />
      ))}

      <g clipPath="url(#chart-clip)" opacity={sweepOpacity} style={{mixBlendMode: "screen"}}>
        <rect
          x={sweepX}
          y="68"
          width="330"
          height="900"
          fill="url(#global-sweep)"
          transform={`skewX(-15) translate(${-sweepX * 0.015} 0)`}
        />
      </g>

      <rect
        x="170"
        y="141"
        width="1586"
        height="760"
        rx="39"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.045 + climax * 0.04}
        strokeWidth="1"
      />
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const finalFrame = durationInFrames - 1;
  const phase = (frame / finalFrame) * Math.PI * 2;

  const enter = smooth(frame, [0, 44]);
  const exit = interpolate(frame, [838, finalFrame], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const structureOpacity = enter * exit;
  const climax = interpolate(frame, [626, 678, 744, 792], [0, 1, 0.58, 0], clamp);

  const cameraPush = interpolate(frame, [0, 150, 650, 780, finalFrame], [0, 0, 1, 0.72, 0], clamp);
  const cameraScale = 1 + cameraPush * 0.018;
  const cameraX = Math.sin(phase) * 4.5 * structureOpacity;
  const cameraY = -cameraPush * 7 + Math.cos(phase) * 2.5 * structureOpacity;
  const vignette = 0.34 + climax * 0.08;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#07111f",
      }}
    >
      <Atmosphere phase={phase} />

      <div
        style={{
          position: "absolute",
          inset: -30,
          transform: `translate3d(${cameraX}px,${cameraY}px,0) scale(${cameraScale})`,
          transformOrigin: "50% 53%",
        }}
      >
        <ChartStructure frame={frame} opacity={structureOpacity} climax={climax} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% 51%,transparent 38%,rgba(1,5,13,${
            vignette * 0.48
          }) 76%,rgba(1,4,11,${vignette}) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.19,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px)",
          backgroundSize: "100% 4px",
          mixBlendMode: "soft-light",
        }}
      />
    </AbsoluteFill>
  );
};
