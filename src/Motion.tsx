import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const TIMELINE_Y = 538;

const BACKGROUND = "#0A293E";
const LINE = "#F2F5F6";
const MUTED_LINE = "#D7E2E8";

const NODE_CENTERS = [335, 752, 1169, 1583] as const;
const NODE_COLORS = ["#F6B522", "#F79312", "#E85850", "#E51E35"] as const;
const CORE_STARTS = [0, 15, 33, 48] as const;
const ORBIT_STARTS = [32, 62, 92, 122] as const;
const ORBIT_DURATIONS = [29, 26, 25, 24] as const;

const CORE_RADIUS = 91;
const RIM_RADIUS = 106;
const ORBIT_RADIUS = 132;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const smoothOut = Easing.bezier(0.25, 0.1, 0.25, 1);
const gentleOut = Easing.out(Easing.cubic);

const reveal = (
  frame: number,
  start: number,
  duration: number,
  easing: (value: number) => number = smoothOut,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing,
  });

const scaleReveal = (frame: number, start: number, duration: number) =>
  interpolate(
    frame,
    [
      start,
      start + duration * 0.25,
      start + duration * 0.5,
      start + duration * 0.75,
      start + duration,
    ],
    [0, 0.38, 0.82, 0.96, 1],
    clamp,
  );

const polar = (radius: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
};

const arcPath = (
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polar(radius, endAngle);
  const end = polar(radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
  ].join(" ");
};

type MilestoneNodeProps = {
  x: number;
  color: string;
  coreStart: number;
  orbitStart: number;
  orbitDuration: number;
};

const MilestoneNode: React.FC<MilestoneNodeProps> = ({
  x,
  color,
  coreStart,
  orbitStart,
  orbitDuration,
}) => {
  const frame = useCurrentFrame();
  const coreScale = scaleReveal(frame, coreStart, 24);
  const orbitProgress = reveal(
    frame,
    orbitStart,
    orbitDuration,
    gentleOut,
  );
  const orbitRotation = interpolate(orbitProgress, [0, 1], [72, 0], clamp);
  const circumference = 2 * Math.PI * ORBIT_RADIUS;
  const travellingDashOpacity = interpolate(
    orbitProgress,
    [0, 0.16, 0.76, 1],
    [0, 1, 0.85, 0],
    clamp,
  );

  return (
    <g transform={`translate(${x} ${TIMELINE_Y})`}>
      <g
        opacity={coreScale}
        transform={`scale(${coreScale})`}
        style={{ transformOrigin: "0px 0px" }}
      >
        <circle
          r={RIM_RADIUS}
          fill={BACKGROUND}
          stroke={LINE}
          strokeWidth={14}
        />
        <circle r={CORE_RADIUS} fill={color} />
      </g>

      <g
        opacity={orbitProgress}
        transform={`rotate(${orbitRotation})`}
        style={{ transformOrigin: "0px 0px" }}
      >
        <circle
          r={ORBIT_RADIUS}
          fill="none"
          stroke={MUTED_LINE}
          strokeWidth={4}
          strokeDasharray={`${circumference * orbitProgress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90)"
        />

        {[0, 90, 180, 270].map((angle, index) => {
          const point = polar(ORBIT_RADIUS, angle);
          const dotProgress = reveal(
            frame,
            orbitStart + index * 6,
            18,
            gentleOut,
          );

          return (
            <circle
              key={angle}
              cx={point.x}
              cy={point.y}
              r={10}
              fill={LINE}
              opacity={dotProgress}
              transform={`scale(${0.7 + dotProgress * 0.3})`}
              style={{ transformOrigin: `${point.x}px ${point.y}px` }}
            />
          );
        })}

        <path
          d={arcPath(ORBIT_RADIUS, 2, 19)}
          fill="none"
          stroke={LINE}
          strokeWidth={14}
          strokeLinecap="round"
          opacity={travellingDashOpacity}
          transform={`rotate(${orbitProgress * 252})`}
          style={{ transformOrigin: "0px 0px" }}
        />
      </g>
    </g>
  );
};

type HorizontalConnectorProps = {
  fromX: number;
  toX: number;
  start: number;
};

const HorizontalConnector: React.FC<HorizontalConnectorProps> = ({
  fromX,
  toX,
  start,
}) => {
  const frame = useCurrentFrame();
  const progress = reveal(frame, start, 15, gentleOut);
  const x1 = fromX + ORBIT_RADIUS;
  const x2 = toX - ORBIT_RADIUS;
  const midpoint = (x1 + x2) / 2;
  const halfWidth = ((x2 - x1) / 2) * progress;
  const leftEdge = midpoint - halfWidth;
  const rightEdge = midpoint + halfWidth;

  return (
    <g opacity={progress}>
      <line
        x1={leftEdge}
        y1={TIMELINE_Y}
        x2={rightEdge}
        y2={TIMELINE_Y}
        stroke={MUTED_LINE}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle
        cx={leftEdge}
        cy={TIMELINE_Y}
        r={9}
        fill={LINE}
        opacity={interpolate(progress, [0, 0.15, 1], [0, 1, 1], clamp)}
      />
      <circle
        cx={rightEdge}
        cy={TIMELINE_Y}
        r={9}
        fill={LINE}
        opacity={interpolate(progress, [0, 0.15, 1], [0, 1, 1], clamp)}
      />
    </g>
  );
};

type AnnotationStemProps = {
  x: number;
  direction: "up" | "down";
  length: number;
  start: number;
  duration: number;
};

const AnnotationStem: React.FC<AnnotationStemProps> = ({
  x,
  direction,
  length,
  start,
  duration,
}) => {
  const frame = useCurrentFrame();
  const progress = reveal(frame, start, duration, gentleOut);
  const sign = direction === "up" ? -1 : 1;
  const y1 = TIMELINE_Y + sign * ORBIT_RADIUS;
  const y2 = y1 + sign * length * progress;
  const endpointScale = interpolate(progress, [0, 0.3], [0.65, 1], clamp);

  return (
    <g opacity={progress}>
      <line
        x1={x}
        x2={x}
        y1={y1}
        y2={y2}
        stroke={MUTED_LINE}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <g
        transform={`translate(${x} ${y2}) scale(${endpointScale})`}
        style={{ transformOrigin: "0px 0px" }}
      >
        <circle r={19} fill={BACKGROUND} stroke={LINE} strokeWidth={4} />
        <circle r={8} fill={MUTED_LINE} />
      </g>
    </g>
  );
};

type IconShellProps = {
  x: number;
  y: number;
  start: number;
  duration: number;
  children: React.ReactNode;
};

const IconShell: React.FC<IconShellProps> = ({
  x,
  y,
  start,
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const progress = scaleReveal(frame, start, duration);

  return (
    <g
      opacity={progress}
      transform={`translate(${x} ${y}) scale(${progress})`}
      style={{ transformOrigin: "0px 0px" }}
    >
      {children}
    </g>
  );
};

type TimedIconProps = {
  x: number;
  y: number;
  start: number;
  duration: number;
};

const TargetIcon: React.FC<TimedIconProps> = ({
  x,
  y,
  start,
  duration,
}) => (
  <IconShell x={x} y={y} start={start} duration={duration}>
    <g
      fill="none"
      stroke="#F1B20B"
      strokeWidth={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle r={43} />
      <circle r={23} />
      <circle r={5} fill="#F1B20B" stroke="none" />
      <path d="M 8 -8 L 50 -50" />
      <path d="M 31 -50 H 50 V -31" />
    </g>
  </IconShell>
);

const ChartIcon: React.FC<TimedIconProps> = ({
  x,
  y,
  start,
  duration,
}) => (
  <IconShell x={x} y={y} start={start} duration={duration}>
    <g
      fill="none"
      stroke="#F3940D"
      strokeWidth={10}
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d="M -56 45 H 58" />
      <path d="M -48 34 V -25" />
      <path d="M -24 34 V 1" />
      <path d="M 0 34 V -45" />
      <path d="M 24 34 V -15" />
      <path d="M 48 34 V -34" />
    </g>
  </IconShell>
);

const ClipboardIcon: React.FC<TimedIconProps> = ({
  x,
  y,
  start,
  duration,
}) => (
  <IconShell x={x} y={y} start={start} duration={duration}>
    <g
      fill="none"
      stroke="#E84F4C"
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={-36} y={-46} width={72} height={96} rx={4} />
      <path d="M -17 -46 V -58 H 17 V -46" />
      <path d="M -20 -18 H 22" />
      <path d="M -20 4 H 22" />
      <path d="M -20 26 H 9" />
      <path d="M -22 -20 L -14 -12 L 0 -28" />
    </g>
  </IconShell>
);

const BulbIcon: React.FC<TimedIconProps> = ({
  x,
  y,
  start,
  duration,
}) => (
  <IconShell x={x} y={y} start={start} duration={duration}>
    <g
      fill="none"
      stroke="#DB2641"
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M -36 -12 C -36 -42 -18 -62 0 -62 C 23 -62 38 -42 38 -14 C 38 5 28 18 17 29 V 42 H -16 V 29 C -28 18 -36 6 -36 -12 Z" />
      <path d="M -15 55 H 16" />
      <path d="M -9 68 H 10" />
      <path d="M 0 -91 V -76" />
      <path d="M -54 -69 L -43 -58" />
      <path d="M 54 -69 L 43 -58" />
      <path d="M -70 -17 H -55" />
      <path d="M 70 -17 H 55" />
    </g>
  </IconShell>
);

export const Motion: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: BACKGROUND,
        overflow: "hidden",
      }}
    >
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <HorizontalConnector
          fromX={NODE_CENTERS[0]}
          toX={NODE_CENTERS[1]}
          start={66}
        />
        <HorizontalConnector
          fromX={NODE_CENTERS[1]}
          toX={NODE_CENTERS[2]}
          start={96}
        />
        <HorizontalConnector
          fromX={NODE_CENTERS[2]}
          toX={NODE_CENTERS[3]}
          start={126}
        />

        <AnnotationStem
          x={NODE_CENTERS[0]}
          direction="up"
          length={186}
          start={177}
          duration={45}
        />
        <AnnotationStem
          x={NODE_CENTERS[1]}
          direction="down"
          length={194}
          start={162}
          duration={45}
        />
        <AnnotationStem
          x={NODE_CENTERS[2]}
          direction="up"
          length={186}
          start={144}
          duration={45}
        />
        <AnnotationStem
          x={NODE_CENTERS[3]}
          direction="down"
          length={194}
          start={126}
          duration={45}
        />

        {NODE_CENTERS.map((x, index) => (
          <MilestoneNode
            key={x}
            x={x}
            color={NODE_COLORS[index]}
            coreStart={CORE_STARTS[index]}
            orbitStart={ORBIT_STARTS[index]}
            orbitDuration={ORBIT_DURATIONS[index]}
          />
        ))}

        <TargetIcon
          x={NODE_CENTERS[0]}
          y={760}
          start={133}
          duration={39}
        />
        <ChartIcon
          x={NODE_CENTERS[1]}
          y={310}
          start={159}
          duration={43}
        />
        <ClipboardIcon
          x={NODE_CENTERS[2]}
          y={770}
          start={200}
          duration={38}
        />
        <BulbIcon
          x={NODE_CENTERS[3]}
          y={318}
          start={217}
          duration={44}
        />
      </svg>
    </AbsoluteFill>
  );
};
