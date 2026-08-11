import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TAU = Math.PI * 2;

type Point = {
  x: number;
  y: number;
};

type IconKind =
  | "target"
  | "optimize"
  | "performance"
  | "research"
  | "analysis"
  | "strategy";

type ModuleConfig = {
  id: IconKind;
  label: string;
  value: string;
  accent: string;
  pale: string;
  center: Point;
  control: Point;
  destination: Point;
  startFrame: number;
  focusFrame: number;
  angle: number;
  phase: number;
};

type Speck = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};

type DraftMark = {
  x: number;
  y: number;
  length: number;
  angle: number;
  opacity: number;
};

const GRAPHITE = "#1D2933";
const MUTED = "#66737A";
const PAPER = "#F3EFE4";
const PAPER_LIGHT = "#FFFDF7";
const GRID = "#9AB8C1";
const TEAL = "#13AFA5";
const TEAL_DARK = "#087D79";
const TEAL_PALE = "#D9F4EF";
const SUCCESS = "#55BA78";
const CYAN = "#48B8D0";
const BLUE = "#4D83D1";
const CORAL = "#EF6A63";
const AMBER = "#E8AD38";
const VIOLET = "#8B73C9";

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const fract = (value: number) => value - Math.floor(value);

const hash = (index: number, salt: number) =>
  fract(Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123);

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

const focusPulse = (frame: number, center: number, width = 82) => {
  const distance = Math.abs(frame - center) / width;
  return Math.exp(-distance * distance * 2.25);
};

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

const paperSpecks: Speck[] = Array.from({length: 160}, (_, index) => ({
  x: hash(index, 1) * 1920,
  y: hash(index, 2) * 1080,
  radius: 0.35 + hash(index, 3) * 1.15,
  opacity: 0.025 + hash(index, 4) * 0.055,
}));

const draftMarks: DraftMark[] = Array.from({length: 30}, (_, index) => ({
  x: 70 + hash(index, 8) * 1780,
  y: 60 + hash(index, 9) * 960,
  length: 10 + hash(index, 10) * 30,
  angle: -18 + hash(index, 11) * 36,
  opacity: 0.06 + hash(index, 12) * 0.08,
}));

const modules: ModuleConfig[] = [
  {
    id: "target",
    label: "TARGET",
    value: "87% GOAL",
    accent: CORAL,
    pale: "#FBE2DF",
    center: {x: 278, y: 526},
    control: {x: 408, y: 500},
    destination: {x: 516, y: 525},
    startFrame: 112,
    focusFrame: 275,
    angle: -1.8,
    phase: 0.12,
  },
  {
    id: "optimize",
    label: "OPTIMIZE",
    value: "+24% FLOW",
    accent: TEAL,
    pale: TEAL_PALE,
    center: {x: 500, y: 208},
    control: {x: 606, y: 320},
    destination: {x: 628, y: 408},
    startFrame: 164,
    focusFrame: 350,
    angle: 1.4,
    phase: 0.27,
  },
  {
    id: "performance",
    label: "PERFORMANCE",
    value: "+18.6%",
    accent: SUCCESS,
    pale: "#E1F4E6",
    center: {x: 947, y: 183},
    control: {x: 900, y: 315},
    destination: {x: 868, y: 408},
    startFrame: 216,
    focusFrame: 650,
    angle: -1.1,
    phase: 0.42,
  },
  {
    id: "research",
    label: "RESEARCH",
    value: "36 SIGNALS",
    accent: CYAN,
    pale: "#DFF3F7",
    center: {x: 1198, y: 445},
    control: {x: 1088, y: 474},
    destination: {x: 1004, y: 505},
    startFrame: 268,
    focusFrame: 425,
    angle: 1.7,
    phase: 0.58,
  },
  {
    id: "strategy",
    label: "STRATEGY",
    value: "6 ACTIONS",
    accent: AMBER,
    pale: "#FAEBCB",
    center: {x: 1115, y: 790},
    control: {x: 1020, y: 720},
    destination: {x: 933, y: 665},
    startFrame: 320,
    focusFrame: 575,
    angle: -1.5,
    phase: 0.73,
  },
  {
    id: "analysis",
    label: "ANALYSIS",
    value: "8 INSIGHTS",
    accent: VIOLET,
    pale: "#ECE6F8",
    center: {x: 635, y: 853},
    control: {x: 680, y: 750},
    destination: {x: 700, y: 674},
    startFrame: 372,
    focusFrame: 500,
    angle: 1.2,
    phase: 0.88,
  },
];

const Icon: React.FC<{
  kind: IconKind;
  accent: string;
  frame: number;
  progress: number;
  focus: number;
}> = ({kind, accent, frame, progress, focus}) => {
  const lineProgress = easeOutCubic(progress);
  const idle = Math.sin(frame * 0.045) * 1.4;

  if (kind === "target") {
    const lock = 0.68 + focus * 0.32;
    return (
      <g transform={`translate(74 0) scale(${lock})`}>
        {[28, 19, 10].map((radius, index) => (
          <circle
            key={radius}
            cx={0}
            cy={0}
            r={radius}
            fill={index === 2 ? accent : "none"}
            stroke={accent}
            strokeWidth={index === 0 ? 3 : 2.4}
            opacity={0.92 - index * 0.08}
          />
        ))}
        <path
          d="M 19 -19 L 35 -35 M 27 -35 L 35 -35 L 35 -27"
          fill="none"
          stroke={GRAPHITE}
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={0} cy={0} r={3.8 + focus * 2} fill={PAPER_LIGHT} />
      </g>
    );
  }

  if (kind === "performance") {
    const heights = [21, 34, 48, 64];
    return (
      <g transform="translate(42 34)">
        <path
          d="M 0 0 V -76 M 0 0 H 94"
          fill="none"
          stroke={GRAPHITE}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.72}
        />
        {heights.map((height, index) => {
          const bar = smoothstep(index * 0.11, 0.5 + index * 0.09, lineProgress);
          const dynamicHeight = height * bar * (0.96 + focus * 0.08);
          return (
            <rect
              key={height}
              x={11 + index * 20}
              y={-dynamicHeight}
              width={13}
              height={dynamicHeight}
              rx={3}
              fill={accent}
              opacity={0.72 + index * 0.07}
            />
          );
        })}
        <path
          d="M 10 -18 C 33 -31 45 -29 59 -48 C 70 -61 79 -57 91 -72"
          fill="none"
          stroke={GRAPHITE}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - lineProgress}
        />
      </g>
    );
  }

  if (kind === "research") {
    const scan = -20 + 40 * (0.5 + 0.5 * Math.sin(frame * 0.055));
    return (
      <g transform={`translate(70 ${idle * 0.45})`}>
        <circle
          cx={-7}
          cy={-7}
          r={27}
          fill="none"
          stroke={accent}
          strokeWidth={6}
        />
        <path
          d="M 12 13 L 39 40"
          fill="none"
          stroke={GRAPHITE}
          strokeWidth={8}
          strokeLinecap="round"
        />
        <path
          d={`M ${scan - 7} -25 V 11`}
          fill="none"
          stroke={PAPER_LIGHT}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.72 + focus * 0.2}
        />
        <circle cx={-16} cy={-13} r={5} fill={PAPER_LIGHT} opacity={0.75} />
      </g>
    );
  }

  if (kind === "optimize") {
    const rotation = frame * 0.48 + focus * 22;
    return (
      <g transform={`translate(72 0) rotate(${rotation})`}>
        {Array.from({length: 8}, (_, index) => {
          const angle = (index / 8) * TAU;
          return (
            <rect
              key={index}
              x={-5}
              y={-39}
              width={10}
              height={17}
              rx={2}
              fill={accent}
              transform={`rotate(${(angle * 180) / Math.PI})`}
            />
          );
        })}
        <circle cx={0} cy={0} r={27} fill={accent} opacity={0.92} />
        <circle cx={0} cy={0} r={11} fill={PAPER_LIGHT} stroke={GRAPHITE} strokeWidth={3} />
        <path
          d="M -4 0 L -1 4 L 7 -6"
          fill="none"
          stroke={GRAPHITE}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  }

  if (kind === "analysis") {
    const rotation = -20 + lineProgress * 38 + idle;
    return (
      <g transform={`translate(72 0) rotate(${rotation})`}>
        <circle cx={0} cy={0} r={34} fill={PAPER_LIGHT} stroke={GRAPHITE} strokeWidth={2.5} />
        <circle
          cx={0}
          cy={0}
          r={22}
          fill="none"
          stroke={accent}
          strokeWidth={17}
          strokeDasharray="50 88"
          transform="rotate(-90)"
        />
        <circle
          cx={0}
          cy={0}
          r={22}
          fill="none"
          stroke={TEAL}
          strokeWidth={17}
          strokeDasharray="30 108"
          strokeDashoffset={-52}
          transform="rotate(-90)"
        />
        <circle cx={0} cy={0} r={10} fill={PAPER_LIGHT} />
        <path d="M 0 0 L 0 -34 A 34 34 0 0 1 30 -16 Z" fill={AMBER} opacity={0.9} />
      </g>
    );
  }

  return (
    <g transform="translate(72 0)">
      <path
        d="M -38 27 C -20 10 -13 -28 7 -23 C 25 -18 18 8 40 -8"
        fill="none"
        stroke={GRAPHITE}
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - lineProgress}
      />
      {[
        {x: -38, y: 27},
        {x: 7, y: -23},
        {x: 40, y: -8},
      ].map((point, index) => (
        <g key={index} transform={`translate(${point.x} ${point.y})`}>
          <circle r={10 + focus * 2} fill={PAPER_LIGHT} stroke={accent} strokeWidth={4} />
          <circle r={3.5} fill={accent} />
        </g>
      ))}
      <path
        d="M 31 -14 L 42 -9 L 35 1"
        fill="none"
        stroke={GRAPHITE}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

const MetricModule: React.FC<{
  config: ModuleConfig;
  frame: number;
}> = ({config, frame}) => {
  const raw = clamp((frame - config.startFrame) / 44);
  const enter = easeOutCubic(raw);
  const overshoot = Math.sin(raw * Math.PI) * (1 - raw) * 0.045;
  const opacity = smoothstep(config.startFrame, config.startFrame + 20, frame);
  const focus = focusPulse(frame, config.focusFrame);
  const hover = Math.sin(frame * 0.032 + config.phase * TAU) * 2.2;
  const scale = Math.max(0.001, enter + overshoot) * (1 + focus * 0.035);
  const travelX = (1 - enter) * (760 - config.center.x) * 0.18;
  const travelY = (1 - enter) * (540 - config.center.y) * 0.18;
  const rotation = config.angle * enter + Math.sin(frame * 0.018 + config.phase * TAU) * 0.18;
  const iconProgress = clamp((frame - config.startFrame - 14) / 58);

  return (
    <g
      opacity={opacity}
      transform={`translate(${config.center.x + travelX} ${
        config.center.y + travelY + hover
      }) rotate(${rotation}) scale(${scale})`}
    >
      <path
        d="M -136 -64 H 105 L 136 -35 V 64 H -136 Z"
        fill="#D6D1C5"
        opacity={0.44}
        transform={`translate(${7 + focus * 3} ${10 + focus * 4})`}
      />
      <path
        d="M -136 -64 H 105 L 136 -35 V 64 H -136 Z"
        fill={PAPER_LIGHT}
        stroke={focus > 0.04 ? config.accent : "#C8C7C0"}
        strokeWidth={2 + focus * 1.8}
        filter="url(#smallShadow)"
      />
      <path d="M 105 -64 L 136 -35 H 105 Z" fill={config.pale} stroke="#C8C7C0" strokeWidth={1.4} />
      <rect x={-136} y={-64} width={11} height={128} fill={config.accent} />
      <rect x={-111} y={-36} width={76} height={6} rx={3} fill={config.accent} opacity={0.25} />
      <text
        x={-111}
        y={-9}
        fill={GRAPHITE}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={config.label === "PERFORMANCE" ? 19 : 24}
        fontWeight={800}
        letterSpacing={config.label === "PERFORMANCE" ? 0.8 : 1.2}
      >
        {config.label}
      </text>
      <text
        x={-111}
        y={25}
        fill={config.accent}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={18}
        fontWeight={700}
        letterSpacing={1.5}
      >
        {config.value}
      </text>
      <circle cx={-106} cy={45} r={4} fill={config.accent} opacity={0.78 + focus * 0.22} />
      <path d="M -95 45 H -42" stroke={GRAPHITE} strokeWidth={2} strokeLinecap="round" opacity={0.2} />
      <Icon
        kind={config.id}
        accent={config.accent}
        frame={frame}
        progress={iconProgress}
        focus={focus}
      />
    </g>
  );
};

const Connector: React.FC<{
  config: ModuleConfig;
  frame: number;
  index: number;
  quiet: number;
}> = ({config, frame, index, quiet}) => {
  const revealStart = config.startFrame + 16;
  const reveal = Easing.inOut(Easing.cubic)(clamp((frame - revealStart) / 54));
  const focus = focusPulse(frame, config.focusFrame);
  const d = `M ${config.center.x} ${config.center.y} Q ${config.control.x} ${config.control.y} ${config.destination.x} ${config.destination.y}`;
  const packetGate = smoothstep(revealStart + 36, revealStart + 72, frame) * quiet;

  return (
    <g opacity={smoothstep(revealStart - 2, revealStart + 18, frame)}>
      <path
        d={d}
        fill="none"
        stroke={GRAPHITE}
        strokeWidth={7}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - reveal}
        opacity={0.09}
      />
      <path
        d={d}
        fill="none"
        stroke={config.accent}
        strokeWidth={2.8 + focus * 1.8}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="0.035 0.026"
        strokeDashoffset={1 - reveal - frame * 0.0012}
        opacity={0.46 + focus * 0.42}
      />
      {[0, 0.43].map((phase, packetIndex) => {
        const amount = fract((frame - revealStart) / (146 + index * 5) + phase);
        const point = quadraticPoint(config.center, config.control, config.destination, amount);
        const envelope = Math.sin(amount * Math.PI);
        const radius = 4.5 + focus * 2.8 + packetIndex * 1.1;
        return (
          <g key={phase} opacity={packetGate * envelope * (0.72 + focus * 0.28)}>
            <circle cx={point.x} cy={point.y} r={radius * 2.7} fill={config.accent} opacity={0.1} />
            <circle cx={point.x} cy={point.y} r={radius} fill={config.accent} />
            <circle cx={point.x - 1.4} cy={point.y - 1.4} r={radius * 0.34} fill={PAPER_LIGHT} opacity={0.9} />
          </g>
        );
      })}
    </g>
  );
};

const KpiHub: React.FC<{
  frame: number;
  scoreProgress: number;
}> = ({frame, scoreProgress}) => {
  const hubRaw = clamp((frame - 42) / 70);
  const hubEnter = easeOutCubic(hubRaw);
  const hubOvershoot = Math.sin(hubRaw * Math.PI) * (1 - hubRaw) * 0.035;
  const hubScale = Math.max(0.001, hubEnter + hubOvershoot);
  const hubOpacity = smoothstep(34, 62, frame);
  const score = 42 + scoreProgress * 50;
  const circumference = TAU * 69;
  const gaugeAmount = 0.42 + scoreProgress * 0.5;
  const successPulse = focusPulse(frame, 742, 72);
  const lift = -4 - successPulse * 5 + Math.sin(frame * 0.025) * 1.1;
  const shine = interpolate(frame, [110, 760], [-360, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g
      opacity={hubOpacity}
      transform={`translate(760 ${540 + lift}) scale(${hubScale})`}
    >
      <rect
        x={-253}
        y={-141}
        width={520}
        height={300}
        rx={42}
        fill="#C9C2B5"
        opacity={0.42}
        transform="translate(10 14)"
      />
      <rect
        x={-260}
        y={-150}
        width={520}
        height={300}
        rx={42}
        fill={PAPER_LIGHT}
        stroke={TEAL_DARK}
        strokeWidth={4}
        filter="url(#hubShadow)"
      />
      <path
        d="M -258 -77 C -190 -142 -100 -163 -1 -146 C 92 -130 164 -80 258 -98 V -148 H -258 Z"
        fill={TEAL_PALE}
        opacity={0.7}
      />
      <path d="M 198 -150 H 218 L 260 -108 V -88 Z" fill="#A8DDD5" opacity={0.8} />
      <path d="M 218 -150 L 260 -108 H 218 Z" fill={PAPER_LIGHT} stroke={TEAL_DARK} strokeWidth={2} />
      <text
        x={-205}
        y={-91}
        fill={TEAL_DARK}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={20}
        fontWeight={800}
        letterSpacing={4.4}
      >
        KEY PERFORMANCE
      </text>
      <text
        x={-210}
        y={20}
        fill={GRAPHITE}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={118}
        fontWeight={900}
        letterSpacing={-3}
      >
        KPI
      </text>
      <text
        x={-205}
        y={64}
        fill={MUTED}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={18}
        fontWeight={700}
        letterSpacing={2.3}
      >
        SIGNAL TO GROWTH
      </text>
      <g transform="translate(126 -5)">
        <circle cx={0} cy={0} r={84} fill={TEAL_PALE} opacity={0.6} />
        <circle cx={0} cy={0} r={69} fill="none" stroke="#C7D8D5" strokeWidth={14} />
        <circle
          cx={0}
          cy={0}
          r={69}
          fill="none"
          stroke={TEAL}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${circumference * gaugeAmount} ${circumference}`}
          transform="rotate(-90)"
        />
        <circle cx={0} cy={-69} r={6} fill={TEAL_DARK} />
        <text
          x={0}
          y={7}
          textAnchor="middle"
          fill={GRAPHITE}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={46}
          fontWeight={900}
        >
          {Math.round(score)}
        </text>
        <text
          x={0}
          y={34}
          textAnchor="middle"
          fill={TEAL_DARK}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={14}
          fontWeight={800}
          letterSpacing={2.5}
        >
          SCORE
        </text>
      </g>
      <g transform="translate(-202 104)">
        {[0.34, 0.48, 0.61, 0.77, 0.92].map((height, index) => {
          const local = smoothstep(0.08 + index * 0.1, 0.58 + index * 0.06, scoreProgress);
          return (
            <rect
              key={height}
              x={index * 33}
              y={-height * 40 * local}
              width={20}
              height={height * 40 * local}
              rx={5}
              fill={index > 2 ? SUCCESS : TEAL}
              opacity={0.6 + index * 0.08}
            />
          );
        })}
        <path d="M 0 7 H 155" stroke={GRAPHITE} strokeWidth={2} opacity={0.22} />
      </g>
      <g transform="translate(2 112)">
        <circle cx={0} cy={0} r={6} fill={SUCCESS} />
        <text
          x={16}
          y={6}
          fill={MUTED}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={15}
          fontWeight={700}
          letterSpacing={1.1}
        >
          LIVE METRICS
        </text>
      </g>
      <clipPath id="hubClip">
        <rect x={-258} y={-148} width={516} height={296} rx={40} />
      </clipPath>
      <g clipPath="url(#hubClip)" opacity={0.13}>
        <rect
          x={shine - 42}
          y={-230}
          width={84}
          height={460}
          fill="url(#paperShine)"
          transform="rotate(16)"
        />
      </g>
      <g opacity={successPulse} transform={`translate(221 -121) scale(${0.65 + successPulse * 0.35})`}>
        <circle r={34} fill={SUCCESS} />
        <circle r={42 + successPulse * 20} fill="none" stroke={SUCCESS} strokeWidth={3} opacity={1 - successPulse * 0.35} />
        <path
          d="M -14 0 L -4 11 L 16 -13"
          fill="none"
          stroke={PAPER_LIGHT}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
};

const CopySpaceGuides: React.FC<{frame: number}> = ({frame}) => {
  const reveal = smoothstep(40, 180, frame);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.018);
  return (
    <g opacity={0.22 * reveal}>
      <path d="M 1480 180 H 1760" stroke={TEAL_DARK} strokeWidth={2} strokeDasharray="8 16" />
      <path d="M 1480 900 H 1760" stroke={TEAL_DARK} strokeWidth={2} strokeDasharray="8 16" />
      <circle cx={1480} cy={180} r={5 + pulse * 2} fill={TEAL} />
      <circle cx={1760} cy={900} r={5 + (1 - pulse) * 2} fill={AMBER} />
      <path d="M 1510 204 H 1570" stroke={GRAPHITE} strokeWidth={3} opacity={0.24} />
      <path d="M 1510 218 H 1640" stroke={GRAPHITE} strokeWidth={3} opacity={0.12} />
      <path d="M 1690 862 H 1760" stroke={GRAPHITE} strokeWidth={3} opacity={0.16} />
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const phase = frame / durationInFrames;
  const seconds = frame / fps;

  const cameraSettle = Easing.out(Easing.cubic)(clamp(frame / 132));
  const cameraScale = interpolate(cameraSettle, [0, 1], [1.062, 1]);
  const cameraX = interpolate(cameraSettle, [0, 1], [34, 0]) + Math.sin(phase * TAU) * 2.6;
  const cameraY = interpolate(cameraSettle, [0, 1], [-28, 0]) + Math.cos(phase * TAU) * 1.8;
  const cameraRoll = interpolate(cameraSettle, [0, 1], [-0.9, 0]) + Math.sin(phase * TAU) * 0.08;

  const scoreProgress = Easing.inOut(Easing.cubic)(clamp((frame - 235) / 500));
  const successPulse = focusPulse(frame, 742, 92);
  const finalQuiet = interpolate(frame, [760, 828], [1, 0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const networkOpacity = smoothstep(72, 164, frame);
  const pageSettle = easeOutCubic(clamp(frame / 88));
  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: [
            `linear-gradient(rgba(79, 126, 143, 0.12) 1px, transparent 1px)`,
            `linear-gradient(90deg, rgba(79, 126, 143, 0.12) 1px, transparent 1px)`,
            `linear-gradient(rgba(79, 126, 143, 0.055) 1px, transparent 1px)`,
            `linear-gradient(90deg, rgba(79, 126, 143, 0.055) 1px, transparent 1px)`,
          ].join(","),
          backgroundSize: "190px 190px, 190px 190px, 38px 38px, 38px 38px",
          backgroundPosition: `${cameraX * 0.15}px ${cameraY * 0.15}px`,
          opacity: 0.9,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 40% 48%, rgba(255,255,255,0.82) 0%, rgba(255,253,247,0.34) 37%, rgba(218,210,194,0.18) 72%, rgba(153,140,120,0.12) 100%)",
        }}
      />
      <svg
        viewBox="0 0 1920 1080"
        width="100%"
        height="100%"
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <filter id="smallShadow" x="-30%" y="-40%" width="170%" height="190%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#5D5547" floodOpacity="0.18" />
          </filter>
          <filter id="hubShadow" x="-30%" y="-40%" width="170%" height="190%">
            <feDropShadow dx="0" dy="15" stdDeviation="14" floodColor="#524B40" floodOpacity="0.22" />
          </filter>
          <linearGradient id="paperShine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="successWash">
            <stop offset="0" stopColor={SUCCESS} stopOpacity="0.2" />
            <stop offset="0.65" stopColor={SUCCESS} stopOpacity="0.04" />
            <stop offset="1" stopColor={SUCCESS} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g opacity={0.75 * pageSettle}>
          {paperSpecks.map((speck, index) => (
            <circle
              key={index}
              cx={speck.x + cameraX * 0.06}
              cy={speck.y + cameraY * 0.06}
              r={speck.radius}
              fill={GRAPHITE}
              opacity={speck.opacity}
            />
          ))}
          {draftMarks.map((mark, index) => (
            <path
              key={index}
              d={`M ${mark.x - mark.length / 2} ${mark.y} H ${mark.x + mark.length / 2}`}
              stroke={index % 4 === 0 ? TEAL_DARK : GRAPHITE}
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={mark.opacity}
              transform={`rotate(${mark.angle} ${mark.x} ${mark.y})`}
            />
          ))}
        </g>

        <g opacity={smoothstep(0, 95, frame)}>
          <path d="M 72 112 H 212 M 72 112 V 204" stroke={GRAPHITE} strokeWidth={3} opacity={0.16} />
          <path d="M 1848 968 H 1708 M 1848 968 V 876" stroke={GRAPHITE} strokeWidth={3} opacity={0.16} />
          <circle cx={72} cy={112} r={7} fill={TEAL} opacity={0.72} />
          <circle cx={1848} cy={968} r={7} fill={AMBER} opacity={0.72} />
          <text
            x={88}
            y={91}
            fill={MUTED}
            fontSize={16}
            fontWeight={800}
            letterSpacing={3.4}
          >
            BUSINESS INTELLIGENCE
          </text>
        </g>

        <g
          transform={`translate(960 540) translate(${cameraX} ${cameraY}) rotate(${cameraRoll}) scale(${cameraScale}) translate(-960 -540)`}
        >
          <ellipse
            cx={760}
            cy={540}
            rx={442}
            ry={326}
            fill="none"
            stroke={TEAL_DARK}
            strokeWidth={2}
            strokeDasharray="4 16"
            opacity={0.1 * networkOpacity}
            transform={`rotate(${seconds * 0.6} 760 540)`}
          />
          <ellipse
            cx={760}
            cy={540}
            rx={350 + successPulse * 44}
            ry={242 + successPulse * 30}
            fill="none"
            stroke={SUCCESS}
            strokeWidth={3}
            opacity={successPulse * 0.26}
          />

          {modules.map((config, index) => (
            <Connector
              key={config.id}
              config={config}
              frame={frame}
              index={index}
              quiet={finalQuiet}
            />
          ))}

          {modules.map((config) => (
            <MetricModule key={config.id} config={config} frame={frame} />
          ))}

          <KpiHub frame={frame} scoreProgress={scoreProgress} />
        </g>

        <circle cx={760} cy={540} r={620} fill="url(#successWash)" opacity={successPulse * 0.52} />
        <CopySpaceGuides frame={frame} />

        <g opacity={smoothstep(650, 755, frame)}>
          <path d="M 1510 790 H 1778" stroke={GRAPHITE} strokeWidth={2} opacity={0.08} />
          <text
            x={1510}
            y={826}
            fill={TEAL_DARK}
            fontSize={15}
            fontWeight={800}
            letterSpacing={3}
            opacity={0.32}
          >
            MEASURE • IMPROVE • GROW
          </text>
        </g>
      </svg>
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 140px rgba(82, 73, 57, 0.13)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
