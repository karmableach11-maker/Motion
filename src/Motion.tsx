import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const MASTER_FRAMES = 900;
const WIDTH = 1920;
const HEIGHT = 1080;

const RING = {
  x: 420,
  y: 590,
  radius: 214,
};

type IconName = "users-round" | "search" | "goal";

type CardData = {
  step: string;
  label: string;
  icon: IconName;
  y: number;
  start: number;
  connectorStart: number;
  color: string;
  colorDeep: string;
  colorSoft: string;
  labelColor: string;
};

const cards: CardData[] = [
  {
    step: "STEP 01",
    label: "PEOPLE",
    icon: "users-round",
    y: 130,
    start: 174,
    connectorStart: 68,
    color: "#FF7000",
    colorDeep: "#E94A00",
    colorSoft: "#FF9B2F",
    labelColor: "#FFFFFF",
  },
  {
    step: "STEP 02",
    label: "RESEARCH",
    icon: "search",
    y: 445,
    start: 340,
    connectorStart: 234,
    color: "#C9CBCE",
    colorDeep: "#AEB1B6",
    colorSoft: "#E1E3E5",
    labelColor: "#FFFFFF",
  },
  {
    step: "STEP 03",
    label: "GOAL",
    icon: "goal",
    y: 760,
    start: 506,
    connectorStart: 400,
    color: "#315776",
    colorDeep: "#173E5F",
    colorSoft: "#4D7390",
    labelColor: "#FFFFFF",
  },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const easeOut = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const RingSegment: React.FC<{
  startAngle: number;
  angle: number;
  progress: number;
  stroke: string;
  highlight: string;
}> = ({startAngle, angle, progress, stroke, highlight}) => {
  const span = angle / 360;
  const makeDash = (radius: number) => {
    const circumference = Math.PI * 2 * radius;
    const revealed = circumference * span * clamp(progress);
    return `${revealed} ${Math.max(0.01, circumference - revealed)}`;
  };

  return (
    <g transform={`rotate(${startAngle} ${RING.x} ${RING.y})`}>
      <circle
        cx={RING.x}
        cy={RING.y}
        r={RING.radius}
        fill="none"
        stroke={stroke}
        strokeWidth={68}
        strokeDasharray={makeDash(RING.radius)}
        strokeLinecap="butt"
      />
      <circle
        cx={RING.x}
        cy={RING.y}
        r={RING.radius - 24}
        fill="none"
        stroke={highlight}
        strokeWidth={4}
        strokeDasharray={makeDash(RING.radius - 24)}
        strokeLinecap="butt"
        opacity={0.62}
      />
      <circle
        cx={RING.x}
        cy={RING.y}
        r={RING.radius + 24}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeDasharray={makeDash(RING.radius + 24)}
        strokeLinecap="butt"
        opacity={0.45}
      />
    </g>
  );
};

const LucideIcon: React.FC<{
  name: IconName;
  x: number;
  y: number;
  size: number;
  color: string;
  draw: number;
}> = ({name, x, y, size, color, draw}) => {
  const scale = size / 24;
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - clamp(draw),
  };

  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      opacity={easeOut(draw, 0, 0.18)}
    >
      {name === "users-round" ? (
        <>
          <path {...common} d="M18 21a8 8 0 0 0-16 0" />
          <circle {...common} cx="10" cy="8" r="5" />
          <path {...common} d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
        </>
      ) : null}
      {name === "search" ? (
        <>
          <circle {...common} cx="11" cy="11" r="8" />
          <path {...common} d="m21 21-4.34-4.34" />
        </>
      ) : null}
      {name === "goal" ? (
        <>
          <path {...common} d="M12 13V2l8 4-8 4" />
          <path {...common} d="M20.561 10.222a9 9 0 1 1-12.55-5.29" />
          <path {...common} d="M8.002 9.997a5 5 0 1 0 8.9 2.02" />
        </>
      ) : null}
    </g>
  );
};

const Connector: React.FC<{
  index: number;
  frame: number;
  color: string;
  start: number;
}> = ({index, frame, color, start}) => {
  const progress = ease(frame, start, start + 82);
  const nodeScale = clamp(
    spring({
      frame: frame - start - 66,
      fps: 60,
      config: {damping: 14, mass: 0.65, stiffness: 135},
      durationInFrames: 52,
    }),
  );

  const path =
    index === 0
      ? "M300 292V242Q300 216 326 216H828"
      : index === 1
        ? "M682 540H828"
        : "M300 806V878Q300 904 326 904H828";
  const pathLength = index === 0 ? 593 : index === 1 ? 146 : 615;

  const node =
    index === 0
      ? {x: 300, y: 292}
      : index === 1
        ? {x: 682, y: 540}
        : {x: 300, y: 806};

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#C6C9CB"
        strokeWidth={5}
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g
        transform={`translate(${node.x} ${node.y}) scale(${Math.max(
          0,
          nodeScale,
        )})`}
      >
        <circle r={25} fill="#F5F6F6" stroke="#C8CBCE" strokeWidth={6} />
        <circle r={14} fill={color} />
        <circle cx={-4} cy={-5} r={4} fill="#FFFFFF" opacity={0.52} />
      </g>
    </g>
  );
};

const InfoCard: React.FC<{
  data: CardData;
  index: number;
  frame: number;
  fps: number;
}> = ({data, index, frame, fps}) => {
  const local = frame - data.start;
  const entrance = spring({
    frame: local,
    fps,
    config: {damping: 17, mass: 0.9, stiffness: 105},
    durationInFrames: 78,
  });
  const opacity = easeOut(local, 0, 26);
  const iconDraw = ease(local, 26, 104);
  const badgeIn = easeOut(local, 30, 72);
  const labelIn = easeOut(local, 62, 108);
  const pulseStart = data.start + 102;
  const pulseEnvelope =
    easeOut(frame, pulseStart, pulseStart + 18) *
    (1 - ease(frame, pulseStart + 36, pulseStart + 76));
  const pulse = pulseEnvelope * (0.5 + 0.5 * Math.sin((frame - pulseStart) / 4));
  const x = 805 + (1 - entrance) * 130;
  const y = data.y;
  const scale = 0.94 + entrance * 0.06;
  const accentOpacity = easeOut(local, 85, 122);

  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      opacity={opacity}
    >
      <g filter="url(#card-shadow)">
        <path
          d="M166 0H776Q793 0 802 16L876 80Q892 95 876 110L802 174Q793 190 776 190H166L225 95Z"
          fill={`url(#card-gradient-${index})`}
        />
        <path
          d="M166 0H776Q793 0 802 16L876 80L840 95H225Z"
          fill="#FFFFFF"
          opacity={index === 1 ? 0.18 : 0.12}
        />
        <path
          d="M166 190H776Q793 190 802 174L876 110L840 95H225Z"
          fill={data.colorDeep}
          opacity={0.22}
        />
      </g>

      <path
        d="M42 0H195L256 95L195 190H42Q24 190 15 174L-23 111Q-32 95-23 79L15 16Q24 0 42 0Z"
        fill="url(#white-plate)"
        filter="url(#soft-shadow)"
      />
      <path
        d="M44 12H188L205 38H27L34 22Q37 12 44 12Z"
        fill="#FFFFFF"
        opacity={0.9}
      />

      <g opacity={pulseEnvelope}>
        <ellipse
          cx={102}
          cy={96}
          rx={66 + pulse * 8}
          ry={66 + pulse * 8}
          fill={data.colorSoft}
          opacity={0.08 + pulse * 0.08}
        />
      </g>

      <LucideIcon
        name={data.icon}
        x={57}
        y={51}
        size={88}
        color={index === 1 ? "#A7AAAE" : data.colorDeep}
        draw={iconDraw}
      />

      {index === 1 ? (
        <circle
          cx={136}
          cy={128}
          r={8}
          fill="#FF7000"
          opacity={iconDraw}
        />
      ) : null}

      <path
        d="M198 54H405L437 95L405 136H198L171 95Z"
        fill="#F7F7F7"
        filter="url(#badge-shadow)"
        opacity={badgeIn}
      />
      <path
        d="M198 54H405L415 67H189Z"
        fill="#FFFFFF"
        opacity={0.85 * badgeIn}
      />

      <text
        x={228}
        y={107}
        fill="#35373A"
        fontFamily="'Arial Narrow', 'Roboto Condensed', Arial, sans-serif"
        fontSize={41}
        fontWeight={800}
        letterSpacing={-1}
        opacity={badgeIn}
      >
        {data.step}
      </text>

      <g
        transform={`translate(${(1 - labelIn) * 24} 0)`}
        opacity={labelIn}
      >
        <text
          x={582}
          y={103}
          fill={data.labelColor}
          fontFamily="'Arial Narrow', 'Roboto Condensed', Arial, sans-serif"
          fontSize={31}
          fontWeight={800}
          textAnchor="middle"
          letterSpacing={0.2}
        >
          {data.label}
        </text>
        <rect
          x={542}
          y={121}
          width={80 * accentOpacity}
          height={4}
          rx={2}
          fill="#FFFFFF"
          opacity={0.56}
        />
      </g>

      <g opacity={0.55 * accentOpacity}>
        <circle cx={744} cy={96} r={4} fill="#FFFFFF" />
        <circle cx={760} cy={96} r={4} fill="#FFFFFF" opacity={0.7} />
        <circle cx={776} cy={96} r={4} fill="#FFFFFF" opacity={0.42} />
      </g>
    </g>
  );
};

const MovingShimmer: React.FC<{frame: number}> = ({frame}) => {
  const progress = ease(frame, 664, 792);
  const opacity = easeOut(frame, 650, 674) * (1 - ease(frame, 792, 826));
  const x = interpolate(progress, [0, 1], [630, 1730]);

  return (
    <g opacity={opacity}>
      <ellipse
        cx={x}
        cy={540}
        rx={90}
        ry={500}
        fill="url(#shimmer)"
        transform={`rotate(10 ${x} 540)`}
      />
    </g>
  );
};

export const Motion: React.FC = () => {
  const rawFrame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const frame =
    (rawFrame / Math.max(1, durationInFrames - 1)) * (MASTER_FRAMES - 1);

  const backgroundIn = easeOut(frame, 0, 42);
  const ringBase = spring({
    frame: frame - 20,
    fps,
    config: {damping: 18, mass: 1, stiffness: 92},
    durationInFrames: 96,
  });
  const paleSegment = ease(frame, 62, 146);
  const orangeSegment = ease(frame, 92, 196);
  const navySegment = ease(frame, 128, 232);
  const innerIn = spring({
    frame: frame - 62,
    fps,
    config: {damping: 17, mass: 0.9, stiffness: 105},
    durationInFrames: 82,
  });
  const finalHold = easeOut(frame, 730, 820);
  const cameraScale = interpolate(easeOut(frame, 0, 820), [0, 1], [0.985, 1.01]);
  const cameraX = interpolate(easeOut(frame, 0, 760), [0, 1], [-8, 5]);
  const ringRotation = interpolate(
    easeOut(frame, 20, 244),
    [0, 1],
    [-5, 0],
  );
  const breathe = finalHold * (0.5 + 0.5 * Math.sin((frame - 730) / 30));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F4F5F5",
        overflow: "hidden",
        opacity: backgroundIn,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          width: "100%",
          height: "100%",
          transform: `translateX(${cameraX}px) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <defs>
          <linearGradient id="background-wash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#F6F7F7" />
            <stop offset="1" stopColor="#ECEEEF" />
          </linearGradient>
          <radialGradient id="background-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.94" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orange-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFBF00" />
            <stop offset="0.45" stopColor="#FF8500" />
            <stop offset="1" stopColor="#F25200" />
          </linearGradient>
          <linearGradient id="pale-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D6E2E4" />
            <stop offset="0.52" stopColor="#9AB8BD" />
            <stop offset="1" stopColor="#749AA2" />
          </linearGradient>
          <linearGradient id="navy-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3C7194" />
            <stop offset="0.5" stopColor="#174A70" />
            <stop offset="1" stopColor="#0A2F51" />
          </linearGradient>
          <linearGradient id="white-plate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.7" stopColor="#FAFBFB" />
            <stop offset="1" stopColor="#E9EDEE" />
          </linearGradient>
          {cards.map((card, index) => (
            <linearGradient
              key={`gradient-${index}`}
              id={`card-gradient-${index}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0" stopColor={card.colorSoft} />
              <stop offset="0.42" stopColor={card.color} />
              <stop offset="1" stopColor={card.colorDeep} />
            </linearGradient>
          ))}
          <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <filter id="ring-shadow" x="-40%" y="-40%" width="180%" height="190%">
            <feDropShadow
              dx="0"
              dy="20"
              stdDeviation="18"
              floodColor="#17394D"
              floodOpacity="0.25"
            />
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="4"
              floodColor="#17394D"
              floodOpacity="0.18"
            />
          </filter>
          <filter id="inner-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="7"
              floodColor="#315166"
              floodOpacity="0.17"
            />
          </filter>
          <filter id="card-shadow" x="-15%" y="-25%" width="140%" height="170%">
            <feDropShadow
              dx="0"
              dy="18"
              stdDeviation="14"
              floodColor="#315166"
              floodOpacity="0.2"
            />
          </filter>
          <filter id="soft-shadow" x="-30%" y="-30%" width="170%" height="180%">
            <feDropShadow
              dx="0"
              dy="12"
              stdDeviation="11"
              floodColor="#48616F"
              floodOpacity="0.16"
            />
          </filter>
          <filter id="badge-shadow" x="-20%" y="-30%" width="150%" height="170%">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="5"
              floodColor="#243846"
              floodOpacity="0.17"
            />
          </filter>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill="url(#background-wash)" />
        <ellipse
          cx={455}
          cy={515}
          rx={610}
          ry={535}
          fill="url(#background-glow)"
        />
        <ellipse
          cx={1510}
          cy={510}
          rx={710}
          ry={570}
          fill="url(#background-glow)"
          opacity={0.55}
        />

        <g opacity={0.18}>
          {Array.from({length: 20}, (_, index) => (
            <circle
              key={`dot-${index}`}
              cx={80 + ((index * 347) % 1760)}
              cy={75 + ((index * 191) % 930)}
              r={2 + (index % 3)}
              fill="#90A0AA"
            />
          ))}
        </g>

        {cards.map((card, index) => (
          <Connector
            key={`connector-${index}`}
            index={index}
            frame={frame}
            color={
              index === 0 ? "#B7B9BC" : index === 1 ? "#FF7000" : "#315776"
            }
            start={card.connectorStart}
          />
        ))}

        <g
          transform={`translate(${RING.x} ${RING.y}) rotate(${ringRotation}) scale(${Math.max(
            0,
            ringBase,
          )}) translate(${-RING.x} ${-RING.y})`}
          filter="url(#ring-shadow)"
        >
          <circle
            cx={RING.x}
            cy={RING.y}
            r={RING.radius}
            fill="none"
            stroke="#F7F8F8"
            strokeWidth={84}
          />
          <circle
            cx={RING.x}
            cy={RING.y}
            r={RING.radius + 40}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4}
            opacity={0.78}
          />
          <circle
            cx={RING.x}
            cy={RING.y}
            r={RING.radius - 39}
            fill="none"
            stroke="#DDE2E3"
            strokeWidth={5}
            opacity={0.85}
          />

          <RingSegment
            startAngle={192}
            angle={102}
            progress={paleSegment}
            stroke="url(#pale-ring)"
            highlight="#EEF8F8"
          />
          <RingSegment
            startAngle={-58}
            angle={109}
            progress={orangeSegment}
            stroke="url(#orange-ring)"
            highlight="#FFD95E"
          />
          <RingSegment
            startAngle={55}
            angle={125}
            progress={navySegment}
            stroke="url(#navy-ring)"
            highlight="#6BA2C2"
          />

          <circle
            cx={RING.x}
            cy={RING.y}
            r={160}
            fill="#FFFFFF"
            stroke="#F4F6F6"
            strokeWidth={5}
            filter="url(#inner-shadow)"
            transform={`translate(${RING.x} ${RING.y}) scale(${Math.max(
              0,
              innerIn,
            )}) translate(${-RING.x} ${-RING.y})`}
          />
          <circle
            cx={RING.x}
            cy={RING.y}
            r={139 + breathe * 2}
            fill="none"
            stroke="#D8E0E3"
            strokeWidth={2}
            opacity={0.34 * innerIn}
          />
          <circle
            cx={RING.x}
            cy={RING.y}
            r={111}
            fill="url(#background-glow)"
            opacity={0.38 * innerIn}
          />
        </g>

        {cards.map((card, index) => (
          <InfoCard
            key={card.step}
            data={card}
            index={index}
            frame={frame}
            fps={fps}
          />
        ))}

        <MovingShimmer frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
