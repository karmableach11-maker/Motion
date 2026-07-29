import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 900;
const TAU = Math.PI * 2;
const CENTER_X = 960;
const CENTER_Y = 525;
const ORBIT_RX = 480;
const ORBIT_RY = 278;

const phase = (
  frame: number,
  start: number,
  end: number,
  easing: (input: number) => number = Easing.out(Easing.cubic),
): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const seeded = (seed: number): number => {
  const value = Math.sin(seed * 78.233 + 19.117) * 43758.5453;
  return value - Math.floor(value);
};

const pointOnOrbit = (
  angle: number,
  rx = ORBIT_RX,
  ry = ORBIT_RY,
): { readonly x: number; readonly y: number } => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER_X + Math.cos(radians) * rx,
    y: CENTER_Y + Math.sin(radians) * ry,
  };
};

const tangentAngle = (angle: number): number => {
  const radians = (angle * Math.PI) / 180;
  return (
    (Math.atan2(
      ORBIT_RY * Math.cos(radians),
      -ORBIT_RX * Math.sin(radians),
    ) *
      180) /
    Math.PI
  );
};

type Glyph = "leaf" | "drop" | "wind" | "sun" | "loop";

type Stage = {
  readonly id: string;
  readonly angle: number;
  readonly start: number;
  readonly accent: string;
  readonly deep: string;
  readonly pale: string;
  readonly glyph: Glyph;
  readonly card: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly leaderPath: string;
  readonly anchor: { readonly x: number; readonly y: number };
};

const STAGES: readonly Stage[] = [
  {
    id: "seed",
    angle: -90,
    start: 78,
    accent: "#49bd78",
    deep: "#16845d",
    pale: "#dff8df",
    glyph: "leaf",
    card: { x: 770, y: 54, width: 380, height: 146 },
    leaderPath: "M960 232 C960 220 960 214 960 200",
    anchor: { x: 960, y: 200 },
  },
  {
    id: "water",
    angle: -18,
    start: 170,
    accent: "#39bdc4",
    deep: "#167d91",
    pale: "#dcf8f5",
    glyph: "drop",
    card: { x: 1495, y: 304, width: 350, height: 158 },
    leaderPath: "M1492 438 C1510 427 1504 395 1495 383",
    anchor: { x: 1495, y: 383 },
  },
  {
    id: "air",
    angle: 54,
    start: 262,
    accent: "#539fe6",
    deep: "#3766b4",
    pale: "#e2efff",
    glyph: "wind",
    card: { x: 1265, y: 832, width: 380, height: 158 },
    leaderPath: "M1294 787 C1320 810 1378 816 1455 832",
    anchor: { x: 1455, y: 832 },
  },
  {
    id: "energy",
    angle: 126,
    start: 354,
    accent: "#efb44c",
    deep: "#c87925",
    pale: "#fff0ca",
    glyph: "sun",
    card: { x: 275, y: 832, width: 380, height: 158 },
    leaderPath: "M626 787 C600 810 542 816 465 832",
    anchor: { x: 465, y: 832 },
  },
  {
    id: "renew",
    angle: 198,
    start: 446,
    accent: "#ed7c68",
    deep: "#b74359",
    pale: "#ffe5db",
    glyph: "loop",
    card: { x: 75, y: 304, width: 350, height: 158 },
    leaderPath: "M428 438 C410 427 416 395 425 383",
    anchor: { x: 425, y: 383 },
  },
] as const;

const FLOATERS = Array.from({ length: 38 }, (_, index) => ({
  x: seeded(index + 20) * WIDTH,
  y: seeded(index + 120) * HEIGHT,
  size: 3 + seeded(index + 220) * 8,
  drift: 0.6 + seeded(index + 320) * 1.4,
  phase: seeded(index + 420) * TAU,
  opacity: 0.08 + seeded(index + 520) * 0.16,
  type: index % 4,
}));

const TOPOS = [
  "M-90 192 C212 82 384 306 688 202 C982 102 1148 38 1438 176 C1652 278 1824 188 2028 84",
  "M-84 286 C196 174 416 388 704 282 C982 180 1182 112 1458 258 C1650 360 1816 286 2028 180",
  "M-88 382 C206 272 424 486 714 376 C1002 266 1186 220 1450 356 C1640 456 1810 390 2022 282",
  "M-84 480 C206 372 436 578 720 474 C1010 368 1188 314 1452 454 C1640 552 1818 488 2024 382",
  "M-86 580 C212 470 432 676 724 572 C1008 472 1180 410 1458 554 C1652 652 1818 586 2026 478",
  "M-84 680 C212 574 434 778 724 672 C1012 566 1192 518 1456 652 C1650 752 1824 688 2022 582",
  "M-88 780 C204 674 436 878 726 770 C1010 668 1190 612 1458 754 C1650 852 1816 790 2026 680",
  "M-82 878 C210 770 428 976 722 870 C1008 766 1190 712 1456 852 C1654 954 1822 888 2022 780",
  "M-90 976 C206 868 430 1074 720 968 C1012 864 1190 810 1452 950 C1648 1052 1818 986 2028 878",
] as const;

const CornerGuides: React.FC<{
  readonly color: string;
  readonly opacity: number;
}> = ({ color, opacity }) => (
  <>
    {[
      { left: 0, top: 0, borderLeft: true, borderTop: true },
      { right: 0, top: 0, borderRight: true, borderTop: true },
      { left: 0, bottom: 0, borderLeft: true, borderBottom: true },
      { right: 0, bottom: 0, borderRight: true, borderBottom: true },
    ].map((corner, index) => (
      <div
        key={index}
        style={{
          position: "absolute",
          width: 18,
          height: 18,
          left: corner.left,
          right: corner.right,
          top: corner.top,
          bottom: corner.bottom,
          borderLeft: corner.borderLeft ? `1.5px solid ${color}` : undefined,
          borderRight: corner.borderRight ? `1.5px solid ${color}` : undefined,
          borderTop: corner.borderTop ? `1.5px solid ${color}` : undefined,
          borderBottom: corner.borderBottom
            ? `1.5px solid ${color}`
            : undefined,
          opacity,
        }}
      />
    ))}
  </>
);

const MineralBackground: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 52% 42%, #fbfcf6 0%, #f4f4e9 38%, #e9eee5 72%, #dce5dc 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -220 + Math.sin(frame / 170) * 10,
        top: -250,
        width: 870,
        height: 760,
        borderRadius: "44% 56% 58% 42% / 55% 42% 58% 45%",
        background:
          "radial-gradient(ellipse at 55% 52%, rgba(108,210,169,0.28), rgba(94,202,180,0.09) 46%, transparent 72%)",
        filter: "blur(24px)",
        transform: `rotate(${-8 + Math.sin(frame / 240) * 1.5}deg)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -250 + Math.cos(frame / 210) * 11,
        top: 60,
        width: 830,
        height: 720,
        borderRadius: "58% 42% 46% 54% / 44% 56% 44% 56%",
        background:
          "radial-gradient(ellipse at 44% 52%, rgba(91,165,232,0.22), rgba(108,193,215,0.075) 48%, transparent 73%)",
        filter: "blur(30px)",
        transform: `rotate(${12 + Math.cos(frame / 260) * 1.6}deg)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 510,
        bottom: -520,
        width: 970,
        height: 820,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(243,190,101,0.19), rgba(234,131,103,0.055) 50%, transparent 72%)",
        filter: "blur(46px)",
      }}
    />
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.38,
        transform: `translateY(${Math.sin(frame / 210) * 2.5}px)`,
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id="topo-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ba985" stopOpacity="0.08" />
          <stop offset="45%" stopColor="#79a8aa" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#7c92a4" stopOpacity="0.055" />
        </linearGradient>
      </defs>
      {TOPOS.map((path, index) => (
        <path
          key={index}
          d={path}
          fill="none"
          stroke="url(#topo-stroke)"
          strokeWidth={index % 3 === 0 ? 1.6 : 1}
          strokeDasharray={index % 2 === 0 ? "2 13" : undefined}
          strokeLinecap="round"
        />
      ))}
    </svg>
    {FLOATERS.map((floater, index) => {
      const x =
        floater.x +
        Math.sin(frame / (76 + floater.drift * 22) + floater.phase) * 8;
      const y =
        floater.y +
        Math.cos(frame / (92 + floater.drift * 19) + floater.phase) * 10;
      const rotation = frame * (0.035 + floater.drift * 0.018) + index * 24;
      const colors = ["#63b985", "#61abc4", "#dfad5a", "#da806b"];
      const color = colors[floater.type];

      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: floater.size,
            height: floater.type === 2 ? floater.size * 0.72 : floater.size,
            borderRadius:
              floater.type === 0
                ? "50%"
                : floater.type === 1
                  ? "70% 30% 62% 38%"
                  : floater.type === 2
                    ? 2
                    : "50% 50% 20% 80%",
            background:
              floater.type === 3
                ? "transparent"
                : `linear-gradient(145deg, rgba(255,255,255,0.76), ${color})`,
            border:
              floater.type === 3
                ? `1.4px solid ${color}`
                : "1px solid rgba(255,255,255,0.58)",
            opacity: floater.opacity,
            transform: `rotate(${rotation}deg)`,
            boxShadow: `0 7px 16px ${color}22`,
          }}
        />
      );
    })}
    <AbsoluteFill
      style={{
        opacity: 0.26,
        backgroundImage:
          "radial-gradient(circle at 20% 18%, rgba(42,86,68,0.11) 0.7px, transparent 0.9px), radial-gradient(circle at 80% 72%, rgba(58,91,109,0.09) 0.6px, transparent 0.9px)",
        backgroundSize: "13px 13px, 17px 17px",
        mixBlendMode: "multiply",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 30,
        borderRadius: 38,
        border: "1px solid rgba(73,111,91,0.11)",
        boxShadow:
          "inset 0 0 90px rgba(255,255,255,0.34), 0 0 0 1px rgba(255,255,255,0.38)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 55%, rgba(87,111,94,0.12) 100%)",
      }}
    />
  </>
);

const CycleTrack: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const completion = phase(frame, 558, 680, Easing.inOut(Easing.cubic));
  const settle = phase(frame, 660, 742);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 5 }}
      aria-hidden
    >
      <defs>
        <filter id="track-shadow" x="-30%" y="-40%" width="160%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id="track-glow" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {STAGES.map((stage, index) => (
          <linearGradient
            key={stage.id}
            id={`track-${stage.id}`}
            x1={index % 2 === 0 ? "0" : "1"}
            y1="0"
            x2={index % 2 === 0 ? "1" : "0"}
            y2="1"
          >
            <stop offset="0%" stopColor={stage.deep} />
            <stop offset="66%" stopColor={stage.accent} />
            <stop offset="100%" stopColor={stage.pale} />
          </linearGradient>
        ))}
        <linearGradient
          id="track-complete"
          x1="480"
          y1="525"
          x2="1440"
          y2="525"
        >
          <stop offset="0%" stopColor="#ed7c68" />
          <stop offset="23%" stopColor="#efb44c" />
          <stop offset="46%" stopColor="#49bd78" />
          <stop offset="70%" stopColor="#39bdc4" />
          <stop offset="100%" stopColor="#539fe6" />
        </linearGradient>
      </defs>
      <ellipse
        cx={CENTER_X}
        cy={CENTER_Y + 26}
        rx={ORBIT_RX + 8}
        ry={ORBIT_RY + 5}
        fill="none"
        stroke="rgba(45,72,59,0.18)"
        strokeWidth="38"
        filter="url(#track-shadow)"
        opacity="0.56"
      />
      <ellipse
        cx={CENTER_X}
        cy={CENTER_Y}
        rx={ORBIT_RX}
        ry={ORBIT_RY}
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="25"
      />
      <ellipse
        cx={CENTER_X}
        cy={CENTER_Y}
        rx={ORBIT_RX}
        ry={ORBIT_RY}
        fill="none"
        stroke="rgba(62,99,80,0.15)"
        strokeWidth="2"
        strokeDasharray="3 13"
        strokeDashoffset={-frame * 0.08}
      />
      <ellipse
        cx={CENTER_X}
        cy={CENTER_Y - 1}
        rx={ORBIT_RX - 11}
        ry={ORBIT_RY - 7}
        fill="none"
        stroke="rgba(255,255,255,0.66)"
        strokeWidth="1.4"
      />
      {STAGES.map((stage, index) => {
        const reveal = phase(
          frame,
          stage.start,
          stage.start + 86,
          Easing.inOut(Easing.cubic),
        );
        const startOffset = 0.25 - index * 0.2;
        const endAngle = stage.angle + 55;
        const endPoint = pointOnOrbit(endAngle);
        const tangent = tangentAngle(endAngle);
        const arrowReveal = phase(frame, stage.start + 58, stage.start + 96);

        return (
          <React.Fragment key={stage.id}>
            <ellipse
              cx={CENTER_X}
              cy={CENTER_Y}
              rx={ORBIT_RX}
              ry={ORBIT_RY}
              fill="none"
              stroke={`url(#track-${stage.id})`}
              strokeWidth="12"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray={`${0.158 * reveal} 1`}
              strokeDashoffset={startOffset}
              filter="url(#track-glow)"
            />
            <g
              transform={`translate(${endPoint.x} ${endPoint.y}) rotate(${tangent}) scale(${0.72 + arrowReveal * 0.28})`}
              opacity={arrowReveal}
            >
              <circle
                cx="0"
                cy="0"
                r="19"
                fill={stage.accent}
                opacity="0.12"
              />
              <path
                d="M-10 -8L10 0L-10 8Z"
                fill={stage.deep}
                stroke="rgba(255,255,255,0.72)"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </g>
          </React.Fragment>
        );
      })}
      <ellipse
        cx={CENTER_X}
        cy={CENTER_Y}
        rx={ORBIT_RX}
        ry={ORBIT_RY}
        fill="none"
        stroke="url(#track-complete)"
        strokeWidth={2.5 + completion * 3.2}
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray={`${0.07 + completion * 0.035} ${0.06 - completion * 0.018}`}
        strokeDashoffset={-frame * 0.0028}
        opacity={completion * 0.64}
        filter="url(#track-glow)"
      />
      {Array.from({ length: 7 }, (_, index) => {
        const travel =
          (((frame - 590) * (0.00115 + index * 0.000025) +
            index / 7 +
            1) %
            1) *
          TAU;
        const x = CENTER_X + Math.cos(travel) * ORBIT_RX;
        const y = CENTER_Y + Math.sin(travel) * ORBIT_RY;
        const colors = STAGES.map((stage) => stage.accent);
        const color = colors[index % colors.length];
        const active =
          completion * phase(frame, 585 + index * 8, 650 + index * 8);

        return (
          <React.Fragment key={index}>
            <circle
              cx={x}
              cy={y}
              r={18 + settle * 3}
              fill={color}
              opacity={active * 0.1}
            />
            <circle
              cx={x}
              cy={y}
              r="5.2"
              fill="#ffffff"
              stroke={color}
              strokeWidth="2.8"
              opacity={active}
              filter="url(#track-glow)"
            />
          </React.Fragment>
        );
      })}
    </svg>
  );
};

const StageGlyph: React.FC<{
  readonly stage: Stage;
  readonly reveal: number;
  readonly frame: number;
}> = ({ stage, reveal, frame }) => {
  const draw = 1 - reveal;
  const common = {
    fill: "none",
    stroke: stage.deep,
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: draw,
  };

  return (
    <svg width="92" height="72" viewBox="0 0 92 72" aria-hidden>
      {stage.glyph === "leaf" ? (
        <>
          <path
            d="M18 49C19 24 39 10 70 14C69 43 50 59 22 54C34 46 46 38 59 25"
            {...common}
          />
          <path
            d="M25 54C37 52 50 50 64 51"
            {...common}
            stroke={stage.accent}
          />
        </>
      ) : stage.glyph === "drop" ? (
        <>
          <path
            d="M46 10C55 25 69 38 69 49C69 62 59 68 46 68C33 68 23 61 23 49C23 38 37 24 46 10Z"
            {...common}
          />
          <path
            d="M34 49C36 56 41 59 48 59"
            {...common}
            stroke={stage.accent}
          />
        </>
      ) : stage.glyph === "wind" ? (
        <>
          <path d="M13 24H62C74 24 75 10 64 10C58 10 55 13 53 17" {...common} />
          <path d="M13 36H73C84 36 84 50 74 50C68 50 65 47 63 43" {...common} />
          <path d="M13 48H45C56 48 56 62 46 62C41 62 38 59 36 55" {...common} />
        </>
      ) : stage.glyph === "sun" ? (
        <>
          <circle cx="46" cy="36" r="15" {...common} />
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index / 8) * TAU + frame * 0.0008;
            const x1 = 46 + Math.cos(angle) * 23;
            const y1 = 36 + Math.sin(angle) * 23;
            const x2 = 46 + Math.cos(angle) * 31;
            const y2 = 36 + Math.sin(angle) * 31;
            return (
              <path
                key={index}
                d={`M${x1} ${y1}L${x2} ${y2}`}
                {...common}
                stroke={index % 2 === 0 ? stage.deep : stage.accent}
              />
            );
          })}
        </>
      ) : (
        <>
          <path
            d="M18 38C18 22 30 12 45 12C57 12 67 19 71 29"
            {...common}
          />
          <path d="M64 22L72 30L78 21" {...common} stroke={stage.accent} />
          <path
            d="M74 36C74 52 62 62 47 62C35 62 25 55 21 45"
            {...common}
          />
          <path d="M28 52L20 44L14 53" {...common} stroke={stage.accent} />
        </>
      )}
    </svg>
  );
};

const EmptyCallout: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
  readonly index: number;
}> = ({ frame, stage, index }) => {
  const leader = phase(
    frame,
    stage.start + 46,
    stage.start + 102,
    Easing.inOut(Easing.cubic),
  );
  const reveal = phase(
    frame,
    stage.start + 82,
    stage.start + 142,
    Easing.out(Easing.back(1.02)),
  );
  const detail = phase(frame, stage.start + 112, stage.start + 168);
  const verticalDirection = stage.card.y < CENTER_Y ? -1 : 1;

  return (
    <>
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0, zIndex: 8 }}
        aria-hidden
      >
        <defs>
          <filter
            id={`leader-glow-${stage.id}`}
            x="-50%"
            y="-80%"
            width="200%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={stage.leaderPath}
          fill="none"
          stroke="rgba(61,91,75,0.16)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={stage.leaderPath}
          fill="none"
          stroke={stage.accent}
          strokeWidth="2.4"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - leader}
          filter={`url(#leader-glow-${stage.id})`}
        />
        <circle
          cx={stage.anchor.x}
          cy={stage.anchor.y}
          r="7"
          fill="#ffffff"
          stroke={stage.accent}
          strokeWidth="3"
          opacity={detail}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: stage.card.x,
          top: stage.card.y,
          width: stage.card.width,
          height: stage.card.height,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * verticalDirection * 18}px) scale(${0.96 + reveal * 0.04})`,
          transformOrigin:
            verticalDirection < 0 ? "50% 100%" : "50% 0%",
          borderRadius: 35,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.34) 48%, rgba(238,245,239,0.56) 100%)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.94), inset 0 -18px 36px rgba(66,101,82,0.055), 0 24px 52px rgba(54,82,67,0.14), 0 7px 18px ${stage.accent}18`,
          backdropFilter: "blur(26px) saturate(128%)",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: `linear-gradient(180deg, ${stage.pale}, ${stage.accent}, ${stage.deep})`,
            opacity: detail * 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 22,
            top: 22,
            bottom: 22,
          }}
        >
          <CornerGuides color={stage.deep} opacity={detail * 0.3} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 34,
            top: "50%",
            width: 64,
            height: 64,
            borderRadius:
              index % 2 === 0
                ? "42% 58% 52% 48% / 48% 44% 56% 52%"
                : "50%",
            transform: `translateY(-50%) rotate(${index * 18}deg)`,
            background: `radial-gradient(circle at 34% 26%, rgba(255,255,255,0.95), ${stage.pale} 42%, ${stage.accent} 100%)`,
            border: "1px solid rgba(255,255,255,0.92)",
            boxShadow: `inset 0 2px 7px rgba(255,255,255,0.76), 0 12px 23px ${stage.accent}24`,
            opacity: detail,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 17,
              height: 17,
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(255,255,255,0.72)",
              border: `1px solid ${stage.deep}44`,
              boxShadow: `0 0 0 7px ${stage.accent}18`,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 122,
            right: 30,
            top: 28,
            bottom: 28,
            borderRadius: 22,
            border: `1px solid ${stage.deep}14`,
            background: `radial-gradient(ellipse at 36% 45%, ${stage.accent}0b, transparent 68%)`,
            opacity: detail,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -80 + detail * (stage.card.width + 170),
            top: -70,
            width: 82,
            height: stage.card.height + 140,
            transform: "rotate(18deg)",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)",
            opacity: 0.45,
          }}
        />
      </div>
    </>
  );
};

const OrganicStation: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
  readonly index: number;
}> = ({ frame, stage, index }) => {
  const point = pointOnOrbit(stage.angle);
  const angle = tangentAngle(stage.angle);
  const shell = phase(
    frame,
    stage.start + 18,
    stage.start + 76,
    Easing.out(Easing.back(1.12)),
  );
  const detail = phase(frame, stage.start + 54, stage.start + 122);
  const complete = phase(frame, 570, 680);
  const pulse =
    complete *
    (0.5 + Math.sin((frame - 560) / 28 + index * 0.78) * 0.5);
  const float = Math.sin(frame / 58 + index * 1.25) * 2.3 * complete;

  return (
    <>
      <EmptyCallout
        frame={frame}
        stage={stage}
        index={index}
      />
      <div
        style={{
          position: "absolute",
          left: point.x - 93,
          top: point.y - 61 + float,
          width: 186,
          height: 122,
          opacity: shell,
          transform: `rotate(${angle}deg) scale(${0.68 + shell * 0.32})`,
          zIndex: 15,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: 31,
            height: 90,
            borderRadius: "50%",
            background: "rgba(45,73,58,0.18)",
            filter: "blur(17px)",
            transform: `translateY(${14 + pulse * 4}px) scaleX(${0.86 + pulse * 0.08})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius:
              index % 2 === 0
                ? "46% 54% 48% 52% / 58% 43% 57% 42%"
                : "54% 46% 57% 43% / 44% 56% 44% 56%",
            background: `radial-gradient(circle at 31% 24%, rgba(255,255,255,0.96), ${stage.pale} 34%, ${stage.accent} 70%, ${stage.deep} 118%)`,
            border: "2px solid rgba(255,255,255,0.88)",
            boxShadow: `inset 0 5px 16px rgba(255,255,255,0.68), inset 0 -18px 30px rgba(26,76,53,0.16), 0 16px 28px rgba(45,73,58,0.19), 0 0 ${24 + pulse * 22}px ${stage.accent}3d`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 10,
              width: 88,
              height: 35,
              borderRadius: "50%",
              transform: "rotate(-9deg)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.8), transparent)",
              filter: "blur(3px)",
              opacity: 0.78,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 13,
              borderRadius: "inherit",
              border: `1px solid ${stage.deep}22`,
              opacity: detail,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotate(${-angle}deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: detail,
          }}
        >
          <StageGlyph stage={stage} reveal={detail} frame={frame} />
        </div>
        <div
          style={{
            position: "absolute",
            left: -7,
            top: 54,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#ffffff",
            border: `3px solid ${stage.accent}`,
            boxShadow: `0 4px 10px rgba(40,74,56,0.18), 0 0 16px ${stage.accent}`,
            opacity: detail,
          }}
        />
      </div>
    </>
  );
};

const RegenerativeCore: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const shell = phase(
    frame,
    30,
    110,
    Easing.out(Easing.back(1.08)),
  );
  const detail = phase(frame, 64, 146);
  const complete = phase(frame, 566, 700, Easing.out(Easing.cubic));
  const settle = phase(frame, 690, 770);
  const breathe = Math.sin(frame / 46) * 0.5 + 0.5;

  return (
    <div
      style={{
        position: "absolute",
        left: CENTER_X - 168,
        top: CENTER_Y - 168,
        width: 336,
        height: 336,
        opacity: shell,
        transform: `scale(${0.72 + shell * 0.28 + complete * breathe * 0.012}) translateY(${complete * -4}px)`,
        zIndex: 12,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          top: 223,
          height: 88,
          borderRadius: "50%",
          background: "rgba(47,79,61,0.23)",
          filter: "blur(24px)",
          transform: `scaleX(${0.78 + settle * 0.08})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 33% 25%, rgba(255,255,255,0.94), rgba(255,255,255,0.42) 22%, rgba(169,225,193,0.28) 52%, rgba(61,149,108,0.22) 75%, rgba(35,101,74,0.13) 100%)",
          border: "2px solid rgba(255,255,255,0.88)",
          boxShadow: `inset 0 10px 24px rgba(255,255,255,0.65), inset 0 -40px 74px rgba(46,129,88,0.13), 0 33px 62px rgba(43,74,58,0.18), 0 0 ${48 + complete * 34}px rgba(72,190,121,0.2)`,
          backdropFilter: "blur(28px) saturate(135%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 43,
            top: 25,
            width: 128,
            height: 54,
            borderRadius: "50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.76), transparent)",
            transform: "rotate(-25deg)",
            filter: "blur(5px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 23,
            borderRadius: "50%",
            border: "1px solid rgba(46,111,78,0.16)",
            boxShadow: "inset 0 0 42px rgba(255,255,255,0.28)",
          }}
        />
        <svg
          width="316"
          height="316"
          viewBox="0 0 316 316"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden
        >
          <defs>
            <linearGradient id="core-leaf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#17875f" />
              <stop offset="48%" stopColor="#43bd7b" />
              <stop offset="100%" stopColor="#65c7c0" />
            </linearGradient>
            <filter id="core-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="158"
            cy="158"
            r="112"
            fill="none"
            stroke="rgba(35,117,81,0.15)"
            strokeWidth="1.4"
            strokeDasharray="3 12"
            strokeDashoffset={frame * 0.14}
            opacity={detail}
          />
          <circle
            cx="158"
            cy="158"
            r="95"
            fill="none"
            stroke="url(#core-leaf)"
            strokeWidth={2 + complete * 2.2}
            pathLength="1"
            strokeDasharray={`${0.78 * detail + complete * 0.22} 1`}
            strokeLinecap="round"
            opacity={0.44 + complete * 0.44}
            filter="url(#core-glow)"
            transform={`rotate(${-90 + frame * 0.025} 158 158)`}
          />
          {[0, 120, 240].map((rotation, index) => {
            const local = phase(frame, 82 + index * 14, 154 + index * 14);
            return (
              <g
                key={rotation}
                transform={`rotate(${rotation + complete * 6} 158 158)`}
              >
                <path
                  d="M158 158C112 145 94 104 116 75C155 81 179 111 158 158Z"
                  fill={`rgba(${index === 0 ? "73,189,120" : index === 1 ? "57,189,196" : "239,180,76"},${0.08 + complete * 0.06})`}
                  stroke={index === 0 ? "#208d63" : index === 1 ? "#278b9b" : "#cc842a"}
                  strokeWidth="2.7"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - local}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#core-glow)"
                />
                <path
                  d="M158 158C145 130 134 108 117 77"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1.6"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - local}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
          <circle
            cx="158"
            cy="158"
            r={20 + complete * 4}
            fill="rgba(255,255,255,0.76)"
            stroke="#3bab78"
            strokeWidth="2.4"
            opacity={detail}
          />
          <circle
            cx="158"
            cy="158"
            r={7 + breathe * complete * 2}
            fill="#2aaa70"
            opacity={detail}
            filter="url(#core-glow)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: -60,
            background: `conic-gradient(from ${frame * 0.06}deg, transparent, rgba(255,255,255,0.16), transparent 22%, rgba(83,200,154,0.09), transparent 53%)`,
            opacity: detail * 0.6,
          }}
        />
      </div>
      {Array.from({ length: 5 }, (_, index) => {
        const angle = (index / 5) * TAU + frame * 0.004;
        const radius = 155 + complete * 8;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: 168 + Math.cos(angle) * radius - 4.5,
              top: 168 + Math.sin(angle) * radius - 4.5,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: STAGES[index].accent,
              border: "2px solid rgba(255,255,255,0.86)",
              boxShadow: `0 0 16px ${STAGES[index].accent}`,
              opacity: complete,
            }}
          />
        );
      })}
    </div>
  );
};

const CompletionHalo: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 588, 700, Easing.out(Easing.cubic));
  const settle = phase(frame, 690, 770);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 4 }}
      aria-hidden
    >
      <defs>
        <radialGradient id="completion-field">
          <stop offset="0%" stopColor="#57bf89" stopOpacity="0.11" />
          <stop offset="55%" stopColor="#7bc8b3" stopOpacity="0.035" />
          <stop offset="100%" stopColor="#7bc8b3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx={CENTER_X}
        cy={CENTER_Y}
        rx={660 + settle * 18}
        ry={390 + settle * 12}
        fill="url(#completion-field)"
        opacity={reveal}
      />
      <ellipse
        cx={CENTER_X}
        cy={CENTER_Y}
        rx={610 + settle * 12}
        ry={350 + settle * 8}
        fill="none"
        stroke="rgba(47,132,92,0.12)"
        strokeWidth="1.4"
        strokeDasharray="2 17"
        strokeDashoffset={frame * 0.16}
        opacity={reveal}
      />
      {STAGES.map((stage, index) => {
        const point = pointOnOrbit(stage.angle, ORBIT_RX + 92, ORBIT_RY + 56);
        const local = phase(frame, 610 + index * 12, 690 + index * 12);
        return (
          <circle
            key={stage.id}
            cx={point.x}
            cy={point.y}
            r={24 + settle * 7}
            fill="none"
            stroke={stage.accent}
            strokeWidth="1.4"
            opacity={local * 0.2}
          />
        );
      })}
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = phase(frame, 0, 34, Easing.out(Easing.quad));
  const fadeOut =
    1 - phase(frame, 850, TOTAL_FRAMES - 1, Easing.in(Easing.quad));
  const build = phase(frame, 22, 640, Easing.inOut(Easing.quad));
  const settle = phase(frame, 670, 820, Easing.inOut(Easing.quad));
  const scale = 0.986 + build * 0.018 - settle * 0.008;
  const drift = Math.sin(frame / 170) * 1.4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#dce5dc",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <MineralBackground frame={frame} />
        <AbsoluteFill
          style={{
            transform: `translateY(${drift}px) scale(${scale})`,
            transformOrigin: "50% 50%",
          }}
        >
          <CompletionHalo frame={frame} />
          <CycleTrack frame={frame} />
          <RegenerativeCore frame={frame} />
          {STAGES.map((stage, index) => (
            <OrganicStation
              key={stage.id}
              frame={frame}
              stage={stage}
              index={index}
            />
          ))}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
