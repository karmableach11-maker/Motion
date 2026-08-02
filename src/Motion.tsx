import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;

const CHART = {
  left: 154,
  right: 1750,
  top: 170,
  gridTop: 220,
  baseline: 835,
  labelY: 882,
};

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const BAR_VALUES = [15, 18, 22, 26, 30, 36, 42, 49, 58, 68, 76, 84] as const;

const DATA_HEIGHT = CHART.baseline - CHART.gridTop;
const FIRST_X = 212;
const LAST_X = 1658;
const STEP_X = (LAST_X - FIRST_X) / 11;
const BAR_WIDTH = 58;
const BAR_START_FRAME = 126;
const BAR_STAGGER = 17;
const BAR_RISE_DURATION = 65;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const reveal = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.out(Easing.cubic),
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const xAt = (index: number) => FIRST_X + STEP_X * index;
const yAt = (value: number) => CHART.baseline - (value / 100) * DATA_HEIGHT;
const barProgressAt = (frame: number, index: number) => {
  const start = BAR_START_FRAME + index * BAR_STAGGER;
  return reveal(
    frame,
    start,
    start + BAR_RISE_DURATION,
    Easing.inOut(Easing.cubic),
  );
};

const PremiumBackdrop: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#030610",
        backgroundImage:
          "radial-gradient(ellipse 70% 58% at 50% 47%, rgba(20,58,115,0.25) 0%, rgba(6,17,40,0.10) 48%, transparent 76%), radial-gradient(ellipse 42% 42% at 88% 16%, rgba(14,107,133,0.10) 0%, transparent 70%), radial-gradient(ellipse 45% 48% at 10% 88%, rgba(28,43,112,0.12) 0%, transparent 72%), linear-gradient(135deg, #02040b 0%, #071126 47%, #030711 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.22,
          backgroundImage:
            "repeating-linear-gradient(118deg, transparent 0px, transparent 28px, rgba(125,173,255,0.018) 29px, transparent 30px), repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 74,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(127,185,255,0.14), transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          bottom: 74,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(221,182,91,0.10), transparent)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.18) 73%, rgba(0,0,0,0.66) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const ChartScaffold: React.FC<{frame: number}> = ({frame}) => {
  const axisX = reveal(frame, 18, 72);
  const axisY = reveal(frame, 18, 72);
  const labels = reveal(frame, 72, 135, Easing.inOut(Easing.quad));
  const chartWidth = CHART.right - CHART.left;
  const chartHeight = CHART.baseline - CHART.top;

  return (
    <g>
      <line
        x1={CHART.left}
        y1={CHART.baseline}
        x2={CHART.left + chartWidth * axisX}
        y2={CHART.baseline}
        stroke="url(#axis-gradient-x)"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.94}
        filter="url(#axis-glow)"
      />
      <line
        x1={CHART.left}
        y1={CHART.baseline}
        x2={CHART.left}
        y2={CHART.baseline - chartHeight * axisY}
        stroke="url(#axis-gradient-y)"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.94}
        filter="url(#axis-glow)"
      />

      {[20, 40, 60, 80, 100].map((value, index) => {
        const y = yAt(value);
        const gridReveal = reveal(frame, 38 + index * 9, 83 + index * 2);
        const numberOpacity = reveal(frame, 48 + index * 7, 92 + index * 4);
        return (
          <g key={value}>
            <line
              x1={CHART.left}
              y1={y}
              x2={CHART.left + chartWidth * gridReveal}
              y2={y}
              stroke="rgba(112,153,210,0.24)"
              strokeWidth={1.5}
            />
            <line
              x1={CHART.left - 14}
              y1={y}
              x2={CHART.left}
              y2={y}
              stroke="rgba(122,174,245,0.38)"
              strokeWidth={1.5}
              opacity={numberOpacity}
            />
            <text
              x={CHART.left - 28}
              y={y + 6}
              textAnchor="end"
              fill="rgba(155,188,235,0.58)"
              fontFamily="Inter, Arial, sans-serif"
              fontSize={18}
              fontWeight={500}
              letterSpacing={0.7}
              opacity={numberOpacity}
            >
              {value}
            </text>
          </g>
        );
      })}

      <text
        x={CHART.left - 28}
        y={CHART.baseline + 6}
        textAnchor="end"
        fill="rgba(155,188,235,0.58)"
        fontFamily="Inter, Arial, sans-serif"
        fontSize={18}
        fontWeight={500}
        opacity={reveal(frame, 62, 96)}
      >
        0
      </text>

      {MONTHS.map((month, index) => {
        const ownReveal = reveal(frame, 72 + index * 5, 102 + index * 3);
        return (
          <g key={month} opacity={labels * ownReveal}>
            <line
              x1={xAt(index)}
              y1={CHART.baseline}
              x2={xAt(index)}
              y2={CHART.baseline + 12}
              stroke="rgba(118,165,229,0.34)"
              strokeWidth={1.3}
            />
            <text
              x={xAt(index)}
              y={CHART.labelY}
              textAnchor="middle"
              fill="rgba(157,185,224,0.68)"
              fontFamily="Inter, Arial, sans-serif"
              fontSize={17}
              fontWeight={500}
              letterSpacing={1.5}
            >
              {month}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const Bars: React.FC<{frame: number}> = ({frame}) => {
  return (
    <g>
      {BAR_VALUES.map((value, index) => {
        const progress = barProgressAt(frame, index);
        const height = (value / 100) * DATA_HEIGHT * progress;
        const x = xAt(index) - BAR_WIDTH / 2;
        const y = CHART.baseline - height;
        const capOpacity = clamp((progress - 0.25) / 0.75);

        return (
          <g key={MONTHS[index]}>
            <rect
              x={x - 9}
              y={y - 6}
              width={BAR_WIDTH + 18}
              height={height + 12}
              rx={8}
              fill="rgba(40,126,255,0.16)"
              filter="url(#bar-aura)"
              opacity={0.62 * progress}
            />
            <rect
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={height}
              rx={4}
              fill={`url(#bar-gradient-${index % 3})`}
              opacity={0.96}
            />
            <rect
              x={x + 5}
              y={y + 5}
              width={5}
              height={Math.max(0, height - 10)}
              rx={3}
              fill="rgba(224,247,255,0.42)"
              opacity={0.74 * progress}
            />
            <rect
              x={x + 7}
              y={y + 5}
              width={BAR_WIDTH - 14}
              height={4}
              rx={2}
              fill="rgba(232,251,255,0.92)"
              filter="url(#bar-cap-glow)"
              opacity={capOpacity}
            />
          </g>
        );
      })}
    </g>
  );
};

const GrowthArrow: React.FC<{frame: number}> = ({frame}) => {
  const progress = reveal(frame, 333, 423, Easing.out(Easing.quad));
  const scaleX = interpolate(progress, [0, 1], [0.24, 1]);
  const opacity = interpolate(progress, [0, 0.16, 1], [0, 0.56, 0.92]);
  const center = 1592;
  const top = CHART.baseline - (CHART.baseline - 62) * progress;
  const headBase = CHART.baseline - (CHART.baseline - 286) * progress;
  const headHalf = 158 * scaleX;
  const shaftHalf = 80 * scaleX;
  const outerPath = `M ${center} ${top} L ${center + headHalf} ${headBase} L ${center + shaftHalf} ${headBase} L ${center + shaftHalf} ${CHART.baseline} L ${center - shaftHalf} ${CHART.baseline} L ${center - shaftHalf} ${headBase} L ${center - headHalf} ${headBase} Z`;
  const innerScale = 0.82;
  const innerHeadHalf = headHalf * innerScale;
  const innerShaftHalf = shaftHalf * 0.78;
  const innerTop = top + Math.min(16, (CHART.baseline - top) * 0.04);
  const innerHeadBase = top + (headBase - top) * 0.94;
  const innerBottom = CHART.baseline - Math.min(18, (CHART.baseline - top) * 0.04);
  const innerPath = `M ${center} ${innerTop} L ${center + innerHeadHalf} ${innerHeadBase} L ${center + innerShaftHalf} ${innerHeadBase} L ${center + innerShaftHalf} ${innerBottom} L ${center - innerShaftHalf} ${innerBottom} L ${center - innerShaftHalf} ${innerHeadBase} L ${center - innerHeadHalf} ${innerHeadBase} Z`;

  return (
    <g opacity={opacity}>
      <path
        d={outerPath}
        fill="rgba(232,184,72,0.18)"
        stroke="rgba(255,223,139,0.36)"
        strokeWidth={34}
        strokeLinejoin="round"
        filter="url(#arrow-outer-aura)"
      />
      <path
        d={outerPath}
        fill="url(#arrow-gradient)"
        filter="url(#arrow-bloom)"
      />
      <path
        d={innerPath}
        fill="none"
        stroke="rgba(255,246,211,0.72)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d={`M ${center} ${innerTop + 4} L ${center} ${innerBottom - 4}`}
        stroke="rgba(255,252,232,0.66)"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.72}
      />
    </g>
  );
};

const TrendLine: React.FC<{frame: number}> = ({frame}) => {
  const points = BAR_VALUES.map((value, index) => {
    const progress = barProgressAt(frame, index);
    const height = (value / 100) * DATA_HEIGHT * progress;
    return {
      x: xAt(index),
      y: CHART.baseline - height,
      progress,
    };
  });

  const segmentPath = (index: number) => {
    const from = points[index - 1];
    const to = points[index];
    const handle = (to.x - from.x) * 0.46;

    return [
      `M ${from.x.toFixed(2)} ${from.y.toFixed(2)}`,
      `C ${(from.x + handle).toFixed(2)} ${from.y.toFixed(2)}`,
      `${(to.x - handle).toFixed(2)} ${to.y.toFixed(2)}`,
      `${to.x.toFixed(2)} ${to.y.toFixed(2)}`,
    ].join(" ");
  };

  return (
    <g>
      {points.slice(1).map((_, offset) => {
        const index = offset + 1;
        const d = segmentPath(index);
        const segmentProgress = points[index].progress;

        return (
          <g key={`trend-segment-${index}`}>
            <path
              d={d}
              pathLength={1}
              fill="none"
              stroke="rgba(224,176,63,0.27)"
              strokeWidth={26}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={1}
              strokeDashoffset={1 - segmentProgress}
              filter="url(#trend-aura)"
            />
            <path
              d={d}
              pathLength={1}
              fill="none"
              stroke="url(#trend-gradient)"
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={1}
              strokeDashoffset={1 - segmentProgress}
              filter="url(#trend-bloom)"
            />
            <path
              d={d}
              pathLength={1}
              fill="none"
              stroke="rgba(255,247,215,0.90)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={1}
              strokeDashoffset={1 - segmentProgress}
            />
          </g>
        );
      })}

      {points.map((point, index) => {
        const marker = index === 0
          ? clamp(point.progress / 0.18)
          : clamp((point.progress - 0.78) / 0.22);
        return (
          <g key={MONTHS[index]} opacity={marker}>
            <circle
              cx={point.x}
              cy={point.y}
              r={17}
              fill="rgba(230,184,72,0.22)"
              filter="url(#node-aura)"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={8.5}
              fill="#fff8dd"
              stroke="#e5b94d"
              strokeWidth={2.5}
              filter="url(#node-bloom)"
            />
            <circle cx={point.x - 2.3} cy={point.y - 2.3} r={2.2} fill="#ffffff" />
          </g>
        );
      })}
    </g>
  );
};

const Chart: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: "absolute", inset: 0}}
    >
      <defs>
        <linearGradient id="axis-gradient-x" x1={CHART.left} y1="0" x2={CHART.right} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7bc4ff" />
          <stop offset="0.55" stopColor="#2e74d9" />
          <stop offset="1" stopColor="#18385f" />
        </linearGradient>
        <linearGradient id="axis-gradient-y" x1="0" y1={CHART.baseline} x2="0" y2={CHART.top} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#69baff" />
          <stop offset="1" stopColor="#2d6cc8" />
        </linearGradient>
        <linearGradient id="bar-gradient-0" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0b1b42" />
          <stop offset="0.52" stopColor="#1559b5" />
          <stop offset="1" stopColor="#76d8ff" />
        </linearGradient>
        <linearGradient id="bar-gradient-1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0a1738" />
          <stop offset="0.55" stopColor="#1d65ce" />
          <stop offset="1" stopColor="#9beaff" />
        </linearGradient>
        <linearGradient id="bar-gradient-2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#091633" />
          <stop offset="0.55" stopColor="#2956bf" />
          <stop offset="1" stopColor="#78bdff" />
        </linearGradient>
        <linearGradient id="trend-gradient" x1={FIRST_X} y1="0" x2={LAST_X} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c79735" />
          <stop offset="0.48" stopColor="#f1cf75" />
          <stop offset="1" stopColor="#fff0b2" />
        </linearGradient>
        <linearGradient id="arrow-gradient" x1="0" y1={CHART.baseline} x2="0" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#845c16" stopOpacity={0.42} />
          <stop offset="0.35" stopColor="#cf982d" stopOpacity={0.76} />
          <stop offset="0.72" stopColor="#f2c75f" stopOpacity={0.94} />
          <stop offset="1" stopColor="#fff0ae" stopOpacity={1} />
        </linearGradient>

        <filter id="axis-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bar-aura" x="-80%" y="-30%" width="260%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="bar-cap-glow" x="-60%" y="-300%" width="220%" height="700%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="trend-aura" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id="trend-bloom" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="node-aura" x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
        <filter id="node-bloom" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="arrow-outer-aura" x="-80%" y="-30%" width="260%" height="160%">
          <feGaussianBlur stdDeviation="31" />
        </filter>
        <filter id="arrow-bloom" x="-35%" y="-18%" width="170%" height="136%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ChartScaffold frame={frame} />
      <Bars frame={frame} />
      <GrowthArrow frame={frame} />
      <TrendLine frame={frame} />
    </svg>
  );
};

export const Motion: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#030610",
      }}
    >
      <PremiumBackdrop />
      <Chart />
    </AbsoluteFill>
  );
};
