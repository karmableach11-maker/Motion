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
  const value = Math.sin(seed * 84.731 + 11.927) * 43758.5453;
  return value - Math.floor(value);
};

const MOTES = Array.from({ length: 72 }, (_, index) => ({
  x: seeded(index + 10) * WIDTH,
  y: seeded(index + 110) * HEIGHT,
  size: 0.8 + seeded(index + 210) * 2.8,
  opacity: 0.05 + seeded(index + 310) * 0.2,
  speed: 0.35 + seeded(index + 410) * 1.25,
  offset: seeded(index + 510) * TAU,
}));

const STREAMS = Array.from({ length: 8 }, (_, index) => ({
  y: 90 + seeded(index + 610) * 900,
  width: 150 + seeded(index + 710) * 340,
  speed: 0.42 + seeded(index + 810) * 0.8,
  offset: seeded(index + 910) * 2400,
}));

type Stage = {
  readonly id: "a" | "b" | "c" | "d";
  readonly x: number;
  readonly y: number;
  readonly start: number;
  readonly accent: string;
  readonly secondary: string;
  readonly soft: string;
  readonly bayY: number;
  readonly glyph: "orbit" | "diamond" | "network" | "petal";
};

const STAGES: readonly Stage[] = [
  {
    id: "a",
    x: 300,
    y: 340,
    start: 48,
    accent: "#53d9ff",
    secondary: "#436cff",
    soft: "#c9f5ff",
    bayY: 502,
    glyph: "orbit",
  },
  {
    id: "b",
    x: 740,
    y: 700,
    start: 168,
    accent: "#a78bff",
    secondary: "#704dff",
    soft: "#eee6ff",
    bayY: 378,
    glyph: "diamond",
  },
  {
    id: "c",
    x: 1180,
    y: 340,
    start: 288,
    accent: "#ff9d6d",
    secondary: "#ff557f",
    soft: "#ffe5d4",
    bayY: 502,
    glyph: "network",
  },
  {
    id: "d",
    x: 1620,
    y: 700,
    start: 408,
    accent: "#57e4b4",
    secondary: "#20b9d7",
    soft: "#dcfff2",
    bayY: 378,
    glyph: "petal",
  },
];

const CONNECTIONS = [
  {
    id: "ab",
    path: "M300 340 C470 340 570 700 740 700",
    start: 142,
    end: 242,
    colorA: STAGES[0].accent,
    colorB: STAGES[1].accent,
  },
  {
    id: "bc",
    path: "M740 700 C910 700 1010 340 1180 340",
    start: 262,
    end: 362,
    colorA: STAGES[1].accent,
    colorB: STAGES[2].accent,
  },
  {
    id: "cd",
    path: "M1180 340 C1350 340 1450 700 1620 700",
    start: 382,
    end: 482,
    colorA: STAGES[2].accent,
    colorB: STAGES[3].accent,
  },
] as const;

const Background: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 48%, #16213c 0%, #0a1023 38%, #040815 70%, #01030a 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.27,
        backgroundImage:
          "linear-gradient(rgba(177,205,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(177,205,255,0.055) 1px, transparent 1px)",
        backgroundSize: "68px 68px",
        backgroundPosition: `${(frame * 0.022) % 68}px ${(frame * 0.015) % 68}px`,
        maskImage:
          "radial-gradient(ellipse at 50% 50%, black 0%, rgba(0,0,0,0.82) 51%, transparent 91%)",
      }}
    />
    {STAGES.map((stage, index) => (
      <div
        key={stage.id}
        style={{
          position: "absolute",
          left: stage.x - 340,
          top: stage.y - 340,
          width: 680,
          height: 680,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${stage.accent}1f 0%, ${stage.secondary}09 41%, transparent 72%)`,
          filter: "blur(48px)",
          opacity:
            0.64 +
            Math.sin(frame / (126 + index * 11) + index * 1.4) * 0.045,
        }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        left: 420,
        top: -410,
        width: 1080,
        height: 730,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(112,130,255,0.15), rgba(87,218,255,0.03) 48%, transparent 72%)",
        filter: "blur(70px)",
      }}
    />
    {STREAMS.map((stream, index) => {
      const x =
        ((frame * stream.speed * 1.25 + stream.offset) %
          (WIDTH + stream.width + 420)) -
        stream.width -
        210;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: x,
            top: stream.y,
            width: stream.width,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(195,218,255,0.82), transparent)",
            opacity: 0.025 + index * 0.005,
          }}
        />
      );
    })}
    {MOTES.map((mote, index) => {
      const driftX =
        Math.sin(frame / (75 + mote.speed * 23) + mote.offset) * 4.5;
      const driftY =
        Math.cos(frame / (92 + mote.speed * 17) + mote.offset) * 5.5;
      const twinkle = 0.58 + Math.sin(frame / 42 + mote.offset) * 0.42;
      const colors = ["#53d9ff", "#a78bff", "#ff8c72", "#57e4b4"];
      const color = colors[index % colors.length];

      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: mote.x + driftX,
            top: mote.y + driftY,
            width: mote.size,
            height: mote.size,
            borderRadius: "50%",
            background: color,
            opacity: mote.opacity * twinkle,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      );
    })}
    <div
      style={{
        position: "absolute",
        inset: 32,
        borderRadius: 34,
        border: "1px solid rgba(218,230,255,0.05)",
        boxShadow: "inset 0 0 80px rgba(101,126,210,0.025)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 43%, rgba(1,3,10,0.38) 100%)",
      }}
    />
  </>
);

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
          width: 17,
          height: 17,
          left: corner.left,
          right: corner.right,
          top: corner.top,
          bottom: corner.bottom,
          borderLeft: corner.borderLeft ? `1px solid ${color}` : undefined,
          borderRight: corner.borderRight ? `1px solid ${color}` : undefined,
          borderTop: corner.borderTop ? `1px solid ${color}` : undefined,
          borderBottom: corner.borderBottom ? `1px solid ${color}` : undefined,
          opacity,
        }}
      />
    ))}
  </>
);

const ProcessConnectors: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const complete = phase(frame, 520, 650);
  const path =
    "M300 340 C470 340 570 700 740 700 C910 700 1010 340 1180 340 C1350 340 1450 700 1620 700";

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 5 }}
      aria-hidden
    >
      <defs>
        {CONNECTIONS.map((connection) => (
          <linearGradient
            key={connection.id}
            id={`connection-${connection.id}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor={connection.colorA} />
            <stop offset="100%" stopColor={connection.colorB} />
          </linearGradient>
        ))}
        <linearGradient id="complete-path" x1="300" y1="0" x2="1620" y2="0">
          <stop offset="0%" stopColor="#53d9ff" />
          <stop offset="33%" stopColor="#a78bff" />
          <stop offset="67%" stopColor="#ff866f" />
          <stop offset="100%" stopColor="#57e4b4" />
        </linearGradient>
        <filter id="connector-glow" x="-30%" y="-50%" width="160%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="rgba(190,211,255,0.075)"
        strokeWidth="19"
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke="rgba(214,229,255,0.16)"
        strokeWidth="1.2"
        strokeDasharray="3 14"
        strokeLinecap="round"
      />
      {CONNECTIONS.map((connection) => {
        const reveal = phase(
          frame,
          connection.start,
          connection.end,
          Easing.inOut(Easing.cubic),
        );
        return (
          <path
            key={connection.id}
            d={connection.path}
            fill="none"
            stroke={`url(#connection-${connection.id})`}
            strokeWidth="3.4"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - reveal}
            filter="url(#connector-glow)"
          />
        );
      })}
      <path
        d={path}
        fill="none"
        stroke="url(#complete-path)"
        strokeWidth={2 + complete * 2}
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray={`${0.08 + complete * 0.06} 0.1`}
        strokeDashoffset={-(frame - 540) * 0.006}
        opacity={complete * 0.65}
        filter="url(#connector-glow)"
      />
      {Array.from({ length: 4 }, (_, index) => {
        const travel =
          ((frame - 570) * 0.00155 + index * 0.25 + 1) % 1;
        const x = 300 + 1320 * travel;
        const y = 520 - 180 * Math.cos(Math.PI * 3 * travel);
        const active = complete * phase(frame, 580 + index * 10, 650 + index * 10);
        const color =
          travel < 0.25
            ? "#72e2ff"
            : travel < 0.5
              ? "#b89cff"
              : travel < 0.75
                ? "#ffa47e"
                : "#72edc2";
        return (
          <React.Fragment key={index}>
            <circle cx={x} cy={y} r="15" fill={color} opacity={active * 0.08} />
            <circle cx={x} cy={y} r="4.5" fill="#ffffff" opacity={active * 0.88} />
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
  const stroke = 1 - reveal;
  const common = {
    fill: "none",
    stroke: stage.soft,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: stroke,
    opacity: 0.9,
  };

  return (
    <svg width={104} height={104} viewBox="0 0 104 104" aria-hidden>
      {stage.glyph === "orbit" ? (
        <>
          <circle cx="52" cy="52" r="21" {...common} />
          <circle
            cx="52"
            cy="52"
            r="34"
            fill="none"
            stroke={stage.accent}
            strokeWidth="1.5"
            strokeDasharray="3 8"
            opacity={reveal * 0.52}
            transform={`rotate(${frame * 0.16} 52 52)`}
          />
          <circle
            cx={52 + Math.cos(frame * 0.018) * 34}
            cy={52 + Math.sin(frame * 0.018) * 34}
            r="4"
            fill={stage.accent}
            opacity={reveal}
          />
          <circle cx="52" cy="52" r="7" fill={stage.accent} opacity={reveal * 0.7} />
        </>
      ) : stage.glyph === "diamond" ? (
        <>
          <path d="M52 20L82 52L52 84L22 52Z" {...common} />
          <path d="M52 32L70 52L52 72L34 52Z" {...common} />
          <circle cx="52" cy="52" r="5" fill={stage.accent} opacity={reveal} />
        </>
      ) : stage.glyph === "network" ? (
        <>
          <path d="M29 33L52 22L76 36L75 68L49 82L27 66Z" {...common} />
          <path d="M29 33L52 52L76 36M52 52L75 68M52 52L49 82M52 52L27 66" {...common} />
          {[
            [29, 33],
            [52, 22],
            [76, 36],
            [75, 68],
            [49, 82],
            [27, 66],
            [52, 52],
          ].map(([cx, cy], index) => (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={index === 6 ? 5.5 : 3.6}
              fill={index === 6 ? stage.accent : stage.soft}
              opacity={reveal}
            />
          ))}
        </>
      ) : (
        <>
          {[0, 90, 180, 270].map((rotation) => (
            <ellipse
              key={rotation}
              cx="52"
              cy="35"
              rx="12"
              ry="22"
              transform={`rotate(${rotation} 52 52)`}
              {...common}
            />
          ))}
          <circle cx="52" cy="52" r="8" fill={stage.accent} opacity={reveal * 0.74} />
        </>
      )}
    </svg>
  );
};

const EmptyContentBay: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
}> = ({ frame, stage }) => {
  const reveal = phase(frame, stage.start + 72, stage.start + 142);
  const detail = phase(frame, stage.start + 104, stage.start + 164);
  const isBelow = stage.bayY > stage.y;
  const bayX = stage.x - 170;
  const leaderTop = isBelow ? stage.y + 122 : stage.bayY + 148;
  const leaderHeight = isBelow
    ? Math.max(0, stage.bayY - leaderTop)
    : Math.max(0, stage.y - 122 - leaderTop);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: stage.x - 1,
          top: leaderTop,
          width: 2,
          height: leaderHeight,
          opacity: detail,
          background: `linear-gradient(${isBelow ? "180deg" : "0deg"}, ${stage.accent}aa, transparent)`,
          boxShadow: `0 0 12px ${stage.accent}66`,
          zIndex: 11,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: bayX,
          top: stage.bayY,
          width: 340,
          height: 148,
          borderRadius: 30,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * (isBelow ? 18 : -18)}px) scale(${0.96 + reveal * 0.04})`,
          transformOrigin: isBelow ? "50% 0%" : "50% 100%",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.115), rgba(255,255,255,0.025) 43%, rgba(3,7,22,0.34) 100%)",
          border: "1px solid rgba(228,238,255,0.16)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -18px 40px rgba(2,5,17,0.16), 0 22px 65px rgba(0,0,0,0.25), 0 0 34px ${stage.accent}0d`,
          backdropFilter: "blur(24px) saturate(138%)",
          overflow: "hidden",
          zIndex: 14,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            top: 18,
            bottom: 18,
          }}
        >
          <CornerGuides color={stage.soft} opacity={detail * 0.28} />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: isBelow ? -18 : undefined,
              bottom: isBelow ? undefined : -18,
              width: 68 * detail,
              height: 3,
              borderRadius: 8,
              transform: "translateX(-50%)",
              background: `linear-gradient(90deg, transparent, ${stage.accent}, transparent)`,
              boxShadow: `0 0 18px ${stage.accent}88`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 116,
              height: 54,
              transform: "translate(-50%, -50%)",
              borderRadius: 18,
              border: `1px solid ${stage.soft}12`,
              background: `radial-gradient(circle, ${stage.accent}0d, transparent 72%)`,
              opacity: detail * 0.7,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: -70 + detail * 420,
            top: -50,
            width: 90,
            height: 250,
            transform: "rotate(18deg)",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.055), transparent)",
            opacity: 0.5,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: stage.x - 7,
          top: isBelow ? stage.bayY - 7 : stage.bayY + 141,
          width: 14,
          height: 14,
          borderRadius: "50%",
          opacity: detail,
          background: stage.accent,
          border: "2px solid rgba(255,255,255,0.74)",
          boxShadow: `0 0 20px ${stage.accent}`,
          zIndex: 16,
        }}
      />
    </>
  );
};

const CircularStage: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
  readonly index: number;
}> = ({ frame, stage, index }) => {
  const shell = phase(
    frame,
    stage.start,
    stage.start + 64,
    Easing.out(Easing.back(1.08)),
  );
  const arc = phase(
    frame,
    stage.start + 18,
    stage.start + 112,
    Easing.inOut(Easing.cubic),
  );
  const detail = phase(frame, stage.start + 52, stage.start + 126);
  const arrow = phase(frame, stage.start + 94, stage.start + 132);
  const complete = phase(frame, 540, 666);
  const leaderAngle = (135 + 266.4 * arc) * (Math.PI / 180);
  const endpointAngle = (135 + 266.4) * (Math.PI / 180);
  const leaderX = 130 + Math.cos(leaderAngle) * 111;
  const leaderY = 130 + Math.sin(leaderAngle) * 111;
  const endX = 130 + Math.cos(endpointAngle) * 111;
  const endY = 130 + Math.sin(endpointAngle) * 111;
  const active = Math.sin((frame - 560) / 30 + index * 0.7) * 0.5 + 0.5;
  const pulse = complete * active;

  return (
    <>
      <EmptyContentBay frame={frame} stage={stage} />
      <div
        style={{
          position: "absolute",
          left: stage.x - 150,
          top: stage.y - 150,
          width: 300,
          height: 300,
          opacity: shell,
          transform: `scale(${0.72 + shell * 0.28})`,
          zIndex: 20,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${stage.accent}${complete > 0.01 ? "24" : "18"} 0%, ${stage.secondary}0d 40%, transparent 70%)`,
            filter: "blur(20px)",
            transform: `scale(${1 + pulse * 0.07})`,
            opacity: 0.72 + pulse * 0.22,
          }}
        />
        <svg
          width={260}
          height={260}
          viewBox="0 0 260 260"
          style={{
            position: "absolute",
            left: 20,
            top: 20,
            overflow: "visible",
          }}
          aria-hidden
        >
          <defs>
            <linearGradient
              id={`arc-${stage.id}`}
              x1="30"
              y1="200"
              x2="230"
              y2="60"
            >
              <stop offset="0%" stopColor={stage.secondary} />
              <stop offset="58%" stopColor={stage.accent} />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <radialGradient id={`halo-${stage.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={stage.accent} stopOpacity="0.14" />
              <stop offset="100%" stopColor={stage.accent} stopOpacity="0" />
            </radialGradient>
            <filter
              id={`stage-glow-${stage.id}`}
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="130"
            cy="130"
            r="121"
            fill={`url(#halo-${stage.id})`}
            opacity={detail * 0.5 + pulse * 0.2}
          />
          <circle
            cx="130"
            cy="130"
            r="118"
            fill="none"
            stroke="rgba(224,236,255,0.12)"
            strokeWidth="1.2"
            strokeDasharray="3 11"
            opacity={detail * 0.82}
            transform={`rotate(${frame * (index % 2 === 0 ? 0.1 : -0.1)} 130 130)`}
          />
          <circle
            cx="130"
            cy="130"
            r="111"
            fill="none"
            stroke={`url(#arc-${stage.id})`}
            strokeWidth="5"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray={`${0.74 * arc} 1`}
            transform="rotate(135 130 130)"
            filter={`url(#stage-glow-${stage.id})`}
          />
          {arc > 0.01 ? (
            <>
              <circle
                cx={leaderX}
                cy={leaderY}
                r="13"
                fill={stage.accent}
                opacity="0.12"
              />
              <circle cx={leaderX} cy={leaderY} r="4.5" fill="#ffffff" />
            </>
          ) : null}
          <g
            transform={`translate(${endX} ${endY}) rotate(${131.4})`}
            opacity={arrow}
          >
            <path
              d="M-9 -7L9 0L-9 7Z"
              fill={stage.accent}
              filter={`url(#stage-glow-${stage.id})`}
            />
          </g>
          <circle
            cx={130 + Math.cos((135 * Math.PI) / 180) * 111}
            cy={130 + Math.sin((135 * Math.PI) / 180) * 111}
            r="6.5"
            fill={stage.secondary}
            stroke="rgba(255,255,255,0.76)"
            strokeWidth="2"
            opacity={detail}
            filter={`url(#stage-glow-${stage.id})`}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 68,
            top: 68,
            width: 164,
            height: 164,
            borderRadius: "50%",
            background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.24), ${stage.accent}20 30%, ${stage.secondary}10 56%, rgba(2,6,20,0.58) 100%)`,
            border: "1px solid rgba(232,241,255,0.2)",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -24px 48px rgba(0,0,0,0.2), 0 22px 58px rgba(0,0,0,0.28), 0 0 ${30 + pulse * 24}px ${stage.accent}22`,
            backdropFilter: "blur(22px) saturate(145%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 11,
              borderRadius: "50%",
              border: `1px solid ${stage.soft}16`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 22,
              borderRadius: "50%",
              background: `conic-gradient(from ${frame * 0.2 + index * 35}deg, transparent, ${stage.accent}10, transparent 34%, ${stage.secondary}0c, transparent 72%)`,
              opacity: detail,
            }}
          />
          <StageGlyph stage={stage} reveal={detail} frame={frame} />
          <div
            style={{
              position: "absolute",
              left: 34,
              top: 23,
              width: 52,
              height: 18,
              borderRadius: "50%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.2), transparent)",
              transform: "rotate(-24deg)",
              filter: "blur(5px)",
              opacity: detail * 0.75,
            }}
          />
        </div>
      </div>
    </>
  );
};

const CompletionField: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 548, 660, Easing.out(Easing.cubic));
  const settle = phase(frame, 650, 740);
  const radius = 420;
  const circumference = TAU * radius;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 8 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="completion-ring" x1="470" y1="540" x2="1450" y2="540">
          <stop offset="0%" stopColor="#53d9ff" stopOpacity="0" />
          <stop offset="22%" stopColor="#53d9ff" />
          <stop offset="46%" stopColor="#a78bff" />
          <stop offset="69%" stopColor="#ff8d72" />
          <stop offset="88%" stopColor="#57e4b4" />
          <stop offset="100%" stopColor="#57e4b4" stopOpacity="0" />
        </linearGradient>
        <filter id="completion-glow" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse
        cx="960"
        cy="520"
        rx="790"
        ry="420"
        fill="none"
        stroke="url(#completion-ring)"
        strokeWidth="2.2"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray={`${0.86 * reveal} 1`}
        transform="rotate(7 960 520)"
        opacity={reveal * 0.42}
        filter="url(#completion-glow)"
      />
      <circle
        cx="960"
        cy="520"
        r={radius}
        fill="none"
        stroke="rgba(215,228,255,0.08)"
        strokeWidth="1"
        strokeDasharray="5 18"
        strokeDashoffset={frame * 0.18}
        opacity={settle * 0.58}
        transform="scale(2 1)"
      />
      {STAGES.map((stage, index) => {
        const local = phase(frame, 590 + index * 16, 665 + index * 16);
        return (
          <React.Fragment key={stage.id}>
            <circle
              cx={stage.x}
              cy={stage.y}
              r={138 + settle * 8}
              fill="none"
              stroke={stage.accent}
              strokeWidth="1.4"
              opacity={local * 0.16}
            />
            <circle
              cx={stage.x}
              cy={stage.y}
              r={154 + settle * 10}
              fill="none"
              stroke={stage.soft}
              strokeWidth="1"
              strokeDasharray="3 16"
              opacity={local * 0.12}
              transform={`rotate(${frame * (index % 2 === 0 ? 0.08 : -0.08)} ${stage.x} ${stage.y})`}
            />
          </React.Fragment>
        );
      })}
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = phase(frame, 0, 30, Easing.out(Easing.quad));
  const fadeOut =
    1 - phase(frame, 850, TOTAL_FRAMES - 1, Easing.in(Easing.quad));
  const camera = phase(frame, 40, 820, Easing.inOut(Easing.quad));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#01030a",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <Background frame={frame} />
        <AbsoluteFill
          style={{
            transform: `scale(${1 + camera * 0.008}) translateY(${Math.sin(frame / 180) * 1.2}px)`,
            transformOrigin: "50% 50%",
          }}
        >
          <ProcessConnectors frame={frame} />
          <CompletionField frame={frame} />
          {STAGES.map((stage, index) => (
            <CircularStage
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
