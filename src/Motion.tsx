import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const PANEL_X = 180;
const PANEL_Y = 140;
const PANEL_WIDTH = 1560;
const PANEL_HEIGHT = 800;
const TAU = Math.PI * 2;

type ObjectiveSpec = {
  readonly id: "growth" | "customer" | "market" | "efficiency";
  readonly eyebrow: string;
  readonly title: string;
  readonly target: string;
  readonly accent: string;
  readonly accentRgb: string;
  readonly enterFrame: number;
  readonly startFrame: number;
  readonly endFrame: number;
  readonly initialStatus: string;
  readonly spark: readonly number[];
};

const OBJECTIVES: readonly ObjectiveSpec[] = [
  {
    id: "growth",
    eyebrow: "GROWTH / O1",
    title: "Expand recurring revenue",
    target: "TARGET  +32%",
    accent: "#49e6ff",
    accentRgb: "73,230,255",
    enterFrame: 55,
    startFrame: 112,
    endFrame: 220,
    initialStatus: "MODELING",
    spark: [22, 25, 24, 31, 29, 38, 42, 47, 53, 59, 66, 74],
  },
  {
    id: "customer",
    eyebrow: "CUSTOMER / O2",
    title: "Launch autonomous support",
    target: "TARGET  92% CSAT",
    accent: "#8f6cff",
    accentRgb: "143,108,255",
    enterFrame: 73,
    startFrame: 205,
    endFrame: 330,
    initialStatus: "IN REVIEW",
    spark: [20, 28, 26, 35, 42, 40, 51, 55, 62, 70, 77, 84],
  },
  {
    id: "market",
    eyebrow: "MARKET / O3",
    title: "Enter enterprise growth markets",
    target: "TARGET  18 PIPELINE",
    accent: "#ff6fd8",
    accentRgb: "255,111,216",
    enterFrame: 91,
    startFrame: 310,
    endFrame: 435,
    initialStatus: "WATCH",
    spark: [17, 19, 27, 25, 34, 37, 44, 50, 49, 62, 69, 79],
  },
  {
    id: "efficiency",
    eyebrow: "EFFICIENCY / O4",
    title: "Reduce operational cycle time",
    target: "TARGET  −24%",
    accent: "#4c94ff",
    accentRgb: "76,148,255",
    enterFrame: 109,
    startFrame: 415,
    endFrame: 525,
    initialStatus: "OPTIMIZING",
    spark: [18, 22, 29, 27, 35, 43, 47, 55, 63, 68, 78, 88],
  },
] as const;

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.out(Easing.cubic),
): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const seeded = (seed: number): number => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const polar = (
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
): { readonly x: number; readonly y: number } => ({
  x: centerX + Math.cos(angle) * radius,
  y: centerY + Math.sin(angle) * radius,
});

const STARS = Array.from({ length: 72 }, (_, index) => ({
  x: seeded(index + 1) * WIDTH,
  y: seeded(index + 81) * HEIGHT,
  radius: 0.8 + seeded(index + 181) * 2.2,
  opacity: 0.12 + seeded(index + 281) * 0.55,
  phase: seeded(index + 381) * TAU,
  drift: 8 + seeded(index + 481) * 30,
}));

const STREAMS = Array.from({ length: 8 }, (_, index) => ({
  y: 120 + seeded(index + 601) * 840,
  width: 90 + seeded(index + 621) * 190,
  speed: 0.8 + seeded(index + 641) * 1.8,
  phase: seeded(index + 661) * 2100,
  opacity: 0.05 + seeded(index + 681) * 0.08,
}));

const BURST_PARTICLES = Array.from({ length: 28 }, (_, index) => ({
  angle: (index / 28) * TAU + seeded(index + 720) * 0.18,
  reach: 72 + seeded(index + 760) * 84,
  radius: 1.5 + seeded(index + 800) * 3.8,
  delay: seeded(index + 840) * 0.18,
}));

const BackgroundAtmosphere: React.FC<{
  readonly frame: number;
  readonly opacity: number;
}> = ({ frame, opacity }) => {
  const breathe = 0.88 + Math.sin(frame * 0.012) * 0.12;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity,
        background:
          "radial-gradient(circle at 50% 46%, #071c3c 0%, #030a1b 43%, #01040d 76%, #000207 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -260,
          top: -300,
          width: 920,
          height: 920,
          borderRadius: "50%",
          opacity: 0.42 * breathe,
          filter: "blur(90px)",
          background:
            "radial-gradient(circle, rgba(62,77,255,0.34), rgba(62,77,255,0.02) 68%, transparent 76%)",
          transform: `translate(${Math.sin(frame * 0.006) * 24}px, ${
            Math.cos(frame * 0.005) * 18
          }px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -260,
          bottom: -330,
          width: 980,
          height: 980,
          borderRadius: "50%",
          opacity: 0.35 * breathe,
          filter: "blur(110px)",
          background:
            "radial-gradient(circle, rgba(0,220,255,0.27), rgba(0,220,255,0.02) 65%, transparent 76%)",
          transform: `translate(${Math.cos(frame * 0.0055) * 22}px, ${
            Math.sin(frame * 0.004) * 20
          }px)`,
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0, opacity: 0.58 }}
      >
        <defs>
          <linearGradient id="horizon-line" x1="0" x2="1">
            <stop offset="0" stopColor="#4d71ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#5cdfff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#4d71ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="grid-fade">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width={WIDTH} height={HEIGHT} fill="url(#grid-fade)" />
          </mask>
        </defs>
        <g
          mask="url(#grid-mask)"
          opacity={0.24 + Math.sin(frame * 0.018) * 0.025}
        >
          {Array.from({ length: 20 }, (_, index) => {
            const y = 180 + index * 42;
            return (
              <line
                key={`h-${index}`}
                x1="80"
                x2={WIDTH - 80}
                y1={y}
                y2={y}
                stroke="url(#horizon-line)"
                strokeWidth="1"
              />
            );
          })}
          {Array.from({ length: 32 }, (_, index) => {
            const x = 120 + index * 54;
            return (
              <line
                key={`v-${index}`}
                x1={x}
                x2={x}
                y1="110"
                y2={HEIGHT - 90}
                stroke="rgba(66,163,255,0.11)"
                strokeWidth="1"
              />
            );
          })}
        </g>
      </svg>

      {STREAMS.map((stream, index) => {
        const x =
          ((frame * stream.speed + stream.phase) % (WIDTH + 480)) - 240;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: stream.y,
              width: stream.width,
              height: 1,
              opacity: stream.opacity,
              background:
                "linear-gradient(90deg, transparent, #7b78ff 45%, #5feaff, transparent)",
              boxShadow: "0 0 10px rgba(78,220,255,0.45)",
            }}
          />
        );
      })}

      {STARS.map((star, index) => {
        const pulse =
          0.48 + 0.52 * Math.sin(frame * 0.026 + star.phase) ** 2;
        const dx = Math.sin(frame * 0.003 + star.phase) * star.drift;
        const dy = Math.cos(frame * 0.0023 + star.phase) * star.drift * 0.5;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: star.x + dx,
              top: star.y + dy,
              width: star.radius * 2,
              height: star.radius * 2,
              borderRadius: "50%",
              opacity: star.opacity * pulse,
              background: index % 5 === 0 ? "#a8a2ff" : "#62e9ff",
              boxShadow:
                index % 7 === 0
                  ? "0 0 14px rgba(89,225,255,0.72)"
                  : "0 0 5px rgba(89,225,255,0.32)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ObjectiveIcon: React.FC<{
  readonly id: ObjectiveSpec["id"];
  readonly color: string;
}> = ({ id, color }) => (
  <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
    {id === "growth" ? (
      <>
        <path
          d="M5 23V17M12 23V13M19 23V9"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <path
          d="M5 12.5L11.7 7.4L16.2 10.1L24 3.8"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <path
          d="M19.8 3.8H24V8"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </>
    ) : null}
    {id === "customer" ? (
      <>
        <circle
          cx="11"
          cy="11"
          r="4"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <circle cx="21" cy="12" r="3" fill="none" stroke={color} strokeWidth="2" />
        <path
          d="M4.5 24C5 18.7 7.4 16.3 11 16.3C14.7 16.3 17 18.7 17.6 24M17.2 18C21.6 16.8 24.5 19 25.2 23"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="2"
        />
      </>
    ) : null}
    {id === "market" ? (
      <>
        <circle cx="15" cy="15" r="10" fill="none" stroke={color} strokeWidth="2" />
        <path
          d="M5.5 15H24.5M15 5C18.4 8.3 19.5 11.7 19.5 15C19.5 18.3 18.4 21.7 15 25M15 5C11.6 8.3 10.5 11.7 10.5 15C10.5 18.3 11.6 21.7 15 25"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </>
    ) : null}
    {id === "efficiency" ? (
      <>
        <path
          d="M17.8 3.8L7.5 17H14L12.2 26.2L22.5 12.8H16Z"
          fill="none"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <path
          d="M4.5 8H9M21 22H25"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="2"
        />
      </>
    ) : null}
  </svg>
);

const Sparkline: React.FC<{
  readonly values: readonly number[];
  readonly reveal: number;
  readonly color: string;
}> = ({ values, reveal, color }) => {
  const points = values.map((value, index) => ({
    x: 4 + (index / (values.length - 1)) * 132,
    y: 35 - (value / 100) * 30,
  }));
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg width="140" height="40" viewBox="0 0 140 40" aria-hidden>
      <line
        x1="3"
        x2="137"
        y1="35"
        y2="35"
        stroke="rgba(140,185,225,0.14)"
      />
      <path
        d={line}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeDasharray="1"
        strokeDashoffset={1 - reveal}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        opacity={0.76}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    </svg>
  );
};

const ObjectiveCard: React.FC<{
  readonly frame: number;
  readonly spec: ObjectiveSpec;
  readonly index: number;
}> = ({ frame, spec, index }) => {
  const entrance = progress(
    frame,
    spec.enterFrame,
    spec.enterFrame + 34,
    Easing.out(Easing.cubic),
  );
  const fill = progress(
    frame,
    spec.startFrame,
    spec.endFrame,
    Easing.inOut(Easing.cubic),
  );
  const done = progress(
    frame,
    spec.endFrame - 2,
    spec.endFrame + 25,
    Easing.out(Easing.cubic),
  );
  const leaderOpacity = fill > 0.018 && fill < 0.995 ? 1 : 0;
  const percent = Math.round(fill * 100);
  const livePulse = 0.7 + Math.sin(frame * 0.08 + index * 1.4) * 0.18;

  return (
    <div
      style={{
        position: "relative",
        height: 118,
        opacity: entrance,
        overflow: "hidden",
        borderRadius: 16,
        border: `1px solid rgba(${spec.accentRgb},${0.13 + fill * 0.11})`,
        transform:
          entrance < 1
            ? `translateY(${mix(20, 0, entrance)}px) scale(${mix(
                0.985,
                1,
                entrance,
              )})`
            : "none",
        transformOrigin: "50% 50%",
        background: `linear-gradient(105deg, rgba(${spec.accentRgb},${
          0.052 + fill * 0.035
        }), rgba(7,18,41,0.76) 34%, rgba(5,15,36,0.60))`,
        boxShadow:
          done > 0
            ? `inset 0 0 30px rgba(40,226,175,${done * 0.035})`
            : "inset 0 1px rgba(255,255,255,0.025)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 18,
          bottom: 18,
          width: 3,
          borderRadius: 3,
          opacity: 0.72 + fill * 0.28,
          background: done > 0.72 ? "#35e8b2" : spec.accent,
          boxShadow: `0 0 14px ${
            done > 0.72 ? "rgba(53,232,178,0.75)" : `rgba(${spec.accentRgb},0.66)`
          }`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 22,
          top: 18,
          width: 54,
          height: 54,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid rgba(${spec.accentRgb},0.22)`,
          background: `linear-gradient(145deg, rgba(${spec.accentRgb},0.12), rgba(4,12,31,0.78))`,
          boxShadow: `inset 0 1px rgba(255,255,255,0.045), 0 0 22px rgba(${spec.accentRgb},0.04)`,
        }}
      >
        <ObjectiveIcon
          id={spec.id}
          color={done > 0.72 ? "#52f2be" : spec.accent}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 17,
          width: 372,
        }}
      >
        <div
          style={{
            color: spec.accent,
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 13,
            fontWeight: 750,
            letterSpacing: "0.11em",
            lineHeight: 1,
            opacity: 0.94,
            textShadow: `0 0 10px rgba(${spec.accentRgb},0.30)`,
          }}
        >
          {spec.eyebrow}
        </div>
        <div
          style={{
            marginTop: 5,
            color: "#f0f8ff",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 20,
            fontWeight: 650,
            letterSpacing: "-0.012em",
            textShadow: "0 1px 2px rgba(0,0,0,0.72)",
            whiteSpace: "nowrap",
          }}
        >
          {spec.title}
        </div>
      </div>

      <div style={{ position: "absolute", left: 464, top: 20 }}>
        <Sparkline values={spec.spark} reveal={fill} color={spec.accent} />
      </div>

      <div
          style={{
            position: "absolute",
            left: 606,
            top: 24,
            width: 158,
            color: "rgba(218,235,249,0.82)",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.055em",
            lineHeight: 1.2,
            textAlign: "right",
            textShadow: "0 1px 2px rgba(0,0,0,0.75)",
            whiteSpace: "nowrap",
          }}
      >
        {spec.target}
      </div>

      <div
        style={{
          position: "absolute",
          right: 20,
          top: 15,
          minWidth: 124,
          height: 30,
          padding: "0 13px",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          border: `1px solid ${
            done > 0.55 ? "rgba(53,232,178,0.30)" : `rgba(${spec.accentRgb},0.20)`
          }`,
          color: done > 0.55 ? "#64f5c4" : "rgba(218,236,247,0.88)",
          background:
            done > 0.55
              ? "rgba(30,160,119,0.105)"
              : "rgba(11,29,57,0.70)",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 12,
          fontWeight: 750,
          letterSpacing: "0.075em",
          textShadow: "0 1px 2px rgba(0,0,0,0.72)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: done > 0.55 ? "#43efb5" : spec.accent,
            opacity: livePulse,
            boxShadow: `0 0 8px ${
              done > 0.55 ? "#43efb5" : spec.accent
            }`,
          }}
        />
        {done > 0.55 ? "ALIGNED" : spec.initialStatus}
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          right: 20,
          bottom: 17,
          height: 12,
          borderRadius: 9,
          overflow: "visible",
          border: "1px solid rgba(115,171,219,0.10)",
          background:
            "repeating-linear-gradient(90deg, rgba(93,141,187,0.08) 0, rgba(93,141,187,0.08) 1px, transparent 1px, transparent 10%), rgba(1,7,20,0.66)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.42)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 2,
            width: `${Math.max(0, fill * 100)}%`,
            maxWidth: "calc(100% - 4px)",
            borderRadius: 6,
            background: `linear-gradient(90deg, rgba(${spec.accentRgb},0.42), ${spec.accent})`,
            boxShadow: `0 0 12px rgba(${spec.accentRgb},0.45)`,
          }}
        />
        {leaderOpacity > 0 ? (
          <div
            style={{
              position: "absolute",
              left: `calc(${fill * 100}% - 4px)`,
              top: -4,
              width: 12,
              height: 18,
              borderRadius: "50%",
              background: "#eaffff",
              filter: "blur(1px)",
              boxShadow: `0 0 7px #ffffff, 0 0 18px ${spec.accent}, 0 0 32px rgba(${spec.accentRgb},0.72)`,
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 34,
          color: done > 0.75 ? "#67f6c7" : "#f2fbff",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 17,
          fontWeight: 750,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.04em",
          textShadow:
            done > 0.75
              ? "0 0 12px rgba(71,239,183,0.5)"
              : `0 0 12px rgba(${spec.accentRgb},0.35)`,
        }}
      >
        {percent.toString().padStart(2, "0")}%
      </div>
    </div>
  );
};

const StrategyScore: React.FC<{
  readonly frame: number;
  readonly scoreProgress: number;
  readonly completedCount: number;
}> = ({ frame, scoreProgress, completedCount }) => {
  const ringProgress = clamp(scoreProgress);
  const score =
    completedCount === OBJECTIVES.length
      ? 100
      : Math.min(99, Math.floor(ringProgress * 100));
  const entrance = progress(frame, 75, 122, Easing.out(Easing.cubic));
  const complete = progress(frame, 540, 578, Easing.out(Easing.cubic));
  const burstPhase = progress(
    frame,
    546,
    630,
    Easing.out(Easing.cubic),
  );
  // Keep the leader light on the exact end-cap of the progress stroke.
  // Both elements now use the same normalized progress and no frame-driven
  // rotation, so the light cannot run ahead while the score is holding.
  const orbitAngle = -Math.PI / 2 + ringProgress * TAU;
  const leader = polar(220, 182, 137, orbitAngle);
  const ringRotation = frame * 0.16;

  return (
    <div
      style={{
        position: "relative",
        width: 440,
        height: 390,
        opacity: entrance,
        transform:
          entrance < 1
            ? `translateY(${mix(22, 0, entrance)}px) scale(${mix(
                0.88,
                1,
                entrance,
              )})`
            : "none",
        transformOrigin: "50% 48%",
      }}
    >
      <svg width="440" height="390" viewBox="0 0 440 390">
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#44d9ff" />
            <stop offset="0.52" stopColor="#58f4c5" />
            <stop offset="1" stopColor="#6a81ff" />
          </linearGradient>
          <radialGradient id="orb-core">
            <stop offset="0" stopColor="#173b62" stopOpacity="0.70" />
            <stop offset="0.55" stopColor="#071c38" stopOpacity="0.54" />
            <stop offset="1" stopColor="#020817" stopOpacity="0.18" />
          </radialGradient>
          <filter id="score-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="220"
          cy="182"
          r={154 + burstPhase * 64}
          fill="none"
          stroke="#4ff4c3"
          strokeWidth="2"
          opacity={(1 - burstPhase) * complete * 0.34}
        />
        <circle
          cx="220"
          cy="182"
          r={162 + burstPhase * 95}
          fill="none"
          stroke="#4ad8ff"
          strokeWidth="1"
          opacity={(1 - burstPhase) * complete * 0.22}
        />

        {burstPhase > 0.001 && burstPhase < 0.999
          ? BURST_PARTICLES.map((particle, index) => {
              const local = clamp(
                (burstPhase - particle.delay) / (1 - particle.delay),
              );
              const point = polar(
                220,
                182,
                148 + particle.reach * local,
                particle.angle,
              );
              return (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={particle.radius * (1 - local * 0.45)}
                  fill={index % 3 === 0 ? "#8b83ff" : "#62f3c5"}
                  opacity={complete * (1 - local) * 0.84}
                  filter="url(#score-glow)"
                />
              );
            })
          : null}

        <circle
          cx="220"
          cy="182"
          r="142"
          fill="url(#orb-core)"
          stroke="rgba(111,201,255,0.11)"
          strokeWidth="1"
        />
        <circle
          cx="220"
          cy="182"
          r="137"
          fill="none"
          stroke="rgba(89,151,205,0.13)"
          strokeWidth="12"
        />
        <circle
          cx="220"
          cy="182"
          r="137"
          pathLength={100}
          fill="none"
          stroke="url(#score-gradient)"
          strokeDasharray="100"
          strokeDashoffset={100 - ringProgress * 100}
          strokeLinecap="round"
          strokeWidth="12"
          transform="rotate(-90 220 182)"
          filter="url(#score-glow)"
        />

        <g transform={`rotate(${ringRotation} 220 182)`}>
          <circle
            cx="220"
            cy="182"
            r="162"
            fill="none"
            stroke="rgba(99,197,255,0.20)"
            strokeDasharray="2 15 42 20"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
        <g transform={`rotate(${-ringRotation * 0.62} 220 182)`}>
          <circle
            cx="220"
            cy="182"
            r="174"
            fill="none"
            stroke="rgba(129,105,255,0.14)"
            strokeDasharray="32 28 4 14"
            strokeLinecap="round"
            strokeWidth="1"
          />
        </g>

        {Array.from({ length: 48 }, (_, index) => {
          const angle = (index / 48) * TAU - Math.PI / 2;
          const inner = polar(220, 182, index % 4 === 0 ? 151 : 154, angle);
          const outer = polar(220, 182, 158, angle);
          const lit = index / 48 <= ringProgress;
          return (
            <line
              key={index}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={lit ? "#77eddf" : "rgba(92,146,193,0.18)"}
              strokeWidth={index % 4 === 0 ? 2 : 1}
              opacity={lit ? 0.72 : 0.65}
            />
          );
        })}

        <circle
          cx={leader.x}
          cy={leader.y}
          r={ringProgress < 0.995 ? 5.5 : 4}
          fill="#eaffff"
          opacity={ringProgress > 0.012 ? 1 : 0}
          filter="url(#score-glow)"
        />

        <circle
          cx="220"
          cy="182"
          r="86"
          fill="none"
          stroke="rgba(105,225,255,0.08)"
          strokeDasharray="1 8"
          strokeWidth="1"
        />
        <line
          x1="176"
          x2="264"
          y1="238"
          y2="238"
          stroke="rgba(94,208,255,0.16)"
        />

        <text
          x="220"
          y="172"
          textAnchor="middle"
          fill="#f3fbff"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="88"
          fontWeight="400"
          letterSpacing="-4"
          style={{
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 22px rgba(77,226,255,0.42)",
          }}
        >
          {score.toString().padStart(2, "0")}
        </text>
        <text
          x="220"
          y="204"
          textAnchor="middle"
          fill={complete > 0.7 ? "#6ff3c8" : "#79dff3"}
          fontFamily="Inter, Arial, sans-serif"
          fontSize="14"
          fontWeight="750"
          letterSpacing="2.2"
        >
          STRATEGY SCORE
        </text>
        <text
          x="220"
          y="226"
          textAnchor="middle"
          fill="rgba(207,229,243,0.76)"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1.6"
        >
          LIVE PORTFOLIO MODEL
        </text>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 2,
          height: 50,
          borderRadius: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          border: "1px solid rgba(82,185,227,0.12)",
          background: "rgba(3,12,30,0.62)",
          boxShadow: "inset 0 1px rgba(255,255,255,0.025)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: complete > 0.65 ? "#5bf1c0" : "#75e7ff",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 15,
              fontWeight: 750,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {completedCount}/4
          </div>
          <div
            style={{
              marginTop: 2,
              color: "rgba(211,231,244,0.82)",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.08em",
            }}
          >
            ALIGNED
          </div>
        </div>
        <div style={{ width: 1, height: 20, background: "rgba(95,177,216,0.12)" }} />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color:
                completedCount === OBJECTIVES.length ? "#5bf1c0" : "#ffc36c",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 15,
              fontWeight: 750,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {completedCount === OBJECTIVES.length ? "LOW" : "WATCH"}
          </div>
          <div
            style={{
              marginTop: 2,
              color: "rgba(211,231,244,0.82)",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.08em",
            }}
          >
            RISK
          </div>
        </div>
        <div style={{ width: 1, height: 20, background: "rgba(95,177,216,0.12)" }} />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: "#9d8aff",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 15,
              fontWeight: 750,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(61 + scoreProgress * 33)}%
          </div>
          <div
            style={{
              marginTop: 2,
              color: "rgba(211,231,244,0.82)",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.08em",
            }}
          >
            VELOCITY
          </div>
        </div>
      </div>
    </div>
  );
};

const ExecutionSignal: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const entrance = progress(frame, 118, 165, Easing.out(Easing.cubic));
  const chartReveal = progress(
    frame,
    150,
    535,
    Easing.inOut(Easing.cubic),
  );
  const chartValues = [42, 48, 46, 55, 53, 62, 66, 63, 74, 79, 77, 86, 91];
  const chartPoints = chartValues.map((value, index) => ({
    x: 22 + (index / (chartValues.length - 1)) * 382,
    y: 118 - (value / 100) * 78,
  }));
  const path = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${path} L 404 126 L 22 126 Z`;
  const currentIndex = clamp(chartReveal) * (chartPoints.length - 1);
  const low = Math.floor(currentIndex);
  const high = Math.min(chartPoints.length - 1, low + 1);
  const local = currentIndex - low;
  const leaderX = mix(chartPoints[low].x, chartPoints[high].x, local);
  const leaderY = mix(chartPoints[low].y, chartPoints[high].y, local);
  const sweepX = ((frame * 1.7) % 520) - 80;

  return (
    <div
      style={{
        position: "relative",
        width: 430,
        height: 178,
        opacity: entrance,
        transform:
          entrance < 1
            ? `translateY(${mix(18, 0, entrance)}px)`
            : "none",
        overflow: "hidden",
        borderRadius: 16,
        border: "1px solid rgba(85,181,224,0.14)",
        background:
          "linear-gradient(145deg, rgba(13,34,65,0.62), rgba(4,13,31,0.76))",
        boxShadow: "inset 0 1px rgba(255,255,255,0.026)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 15,
          color: "rgba(211,231,244,0.84)",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 12,
          fontWeight: 750,
          letterSpacing: "0.09em",
          textShadow: "0 1px 2px rgba(0,0,0,0.72)",
        }}
      >
        EXECUTION SIGNAL
      </div>
      <div
        style={{
          position: "absolute",
          right: 18,
          top: 12,
          color: "#5ff0c2",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 17,
          fontWeight: 750,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        +{(reveal * 26.8).toFixed(1)}%
      </div>
      <svg
        width="430"
        height="144"
        viewBox="0 0 430 144"
        style={{ position: "absolute", left: 0, bottom: 2 }}
      >
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#52e6ff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#665cff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chart-line" x1="0" x2="1">
            <stop offset="0" stopColor="#8c72ff" />
            <stop offset="1" stopColor="#55f1c2" />
          </linearGradient>
          <clipPath id="chart-reveal">
            <rect x="0" y="0" width={430 * chartReveal} height="144" />
          </clipPath>
        </defs>
        {[52, 78, 104, 130].map((y) => (
          <line
            key={y}
            x1="20"
            x2="410"
            y1={y}
            y2={y}
            stroke="rgba(101,164,204,0.08)"
          />
        ))}
        <g clipPath="url(#chart-reveal)">
          <path d={area} fill="url(#chart-area)" />
          <path
            d={path}
            fill="none"
            stroke="url(#chart-line)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 0 6px rgba(86,227,255,0.48))" }}
          />
        </g>
        <line
          x1={leaderX}
          x2={leaderX}
          y1="40"
          y2="128"
          stroke="rgba(91,238,214,0.16)"
          opacity={chartReveal < 0.995 ? 1 : 0}
        />
        <circle
          cx={leaderX}
          cy={leaderY}
          r="4.5"
          fill="#eaffff"
          opacity={chartReveal > 0.01 ? 1 : 0}
          style={{ filter: "drop-shadow(0 0 7px #5bead1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: sweepX,
          top: 0,
          bottom: 0,
          width: 90,
          opacity: 0.13,
          transform: "skewX(-20deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(104,233,255,0.28), transparent)",
        }}
      />
    </div>
  );
};

const HeaderMark: React.FC = () => (
  <div
    style={{
      width: 46,
      height: 46,
      position: "relative",
      borderRadius: 13,
      border: "1px solid rgba(82,218,255,0.25)",
      background:
        "linear-gradient(145deg, rgba(54,189,255,0.14), rgba(5,18,39,0.75))",
      boxShadow: "0 0 24px rgba(43,190,255,0.08)",
    }}
  >
    {[
      { left: 10, top: 10, color: "#52e6ff" },
      { left: 25, top: 10, color: "#7a77ff" },
      { left: 10, top: 25, color: "#44edbd" },
      { left: 25, top: 25, color: "#ff72da" },
    ].map((tile, index) => (
      <span
        key={index}
        style={{
          position: "absolute",
          left: tile.left,
          top: tile.top,
          width: 10,
          height: 10,
          borderRadius: index === 1 || index === 2 ? "50%" : 3,
          background: tile.color,
          boxShadow: `0 0 8px ${tile.color}`,
          opacity: 0.88,
        }}
      />
    ))}
  </div>
);

const DashboardShell: React.FC<{
  readonly frame: number;
  readonly objectiveProgress: readonly number[];
}> = ({ frame, objectiveProgress }) => {
  const panelReveal = progress(frame, 8, 42, Easing.out(Easing.cubic));
  const headerReveal = progress(frame, 28, 65, Easing.out(Easing.cubic));
  const sectionReveal = progress(frame, 44, 82, Easing.out(Easing.cubic));
  const scoreProgress =
    objectiveProgress.reduce((total, value) => total + value, 0) /
    objectiveProgress.length;
  const completedCount = OBJECTIVES.filter((objective) => {
    const done = progress(
      frame,
      objective.endFrame - 2,
      objective.endFrame + 25,
      Easing.out(Easing.cubic),
    );
    return done > 0.55;
  }).length;
  const completion = progress(frame, 540, 586, Easing.out(Easing.cubic));
  const badge = progress(frame, 568, 607, Easing.out(Easing.back(1.18)));
  const badgeGlow = 0.55 + Math.sin(frame * 0.045) * 0.12;

  return (
    <div
      style={{
        position: "absolute",
        left: PANEL_X,
        top: PANEL_Y,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        opacity: panelReveal,
        transform:
          panelReveal < 1
            ? `translateY(${mix(28, 0, panelReveal)}px)`
            : "none",
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -35,
          borderRadius: 44,
          opacity: 0.54 + scoreProgress * 0.14,
          filter: "blur(38px)",
          background:
            "radial-gradient(ellipse at 55% 45%, rgba(35,180,255,0.14), rgba(72,63,255,0.08) 45%, transparent 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: 25,
          border: "1px solid rgba(95,202,244,0.28)",
          background:
            "linear-gradient(145deg, rgba(12,33,64,0.84), rgba(3,12,29,0.90) 56%, rgba(5,19,40,0.84))",
          boxShadow:
            "0 36px 85px rgba(0,0,0,0.55), inset 0 1px rgba(220,248,255,0.06), inset 0 0 90px rgba(39,115,182,0.045), 0 0 55px rgba(32,160,220,0.055)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            background:
              "radial-gradient(circle at 82% 36%, rgba(48,220,210,0.12), transparent 24%), radial-gradient(circle at 20% 18%, rgba(89,93,255,0.10), transparent 32%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 95,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(83,200,241,0.20) 10%, rgba(83,200,241,0.11) 80%, transparent)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 34,
            right: 34,
            top: 23,
            height: 58,
            display: "flex",
            alignItems: "center",
            opacity: headerReveal,
            transform:
              headerReveal < 1
                ? `translateY(${mix(-10, 0, headerReveal)}px)`
                : "none",
          }}
        >
          <HeaderMark />
          <div style={{ marginLeft: 15 }}>
            <div
              style={{
                color: "#ecf8ff",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 20,
                fontWeight: 750,
                letterSpacing: "0.055em",
                textShadow: "0 1px 2px rgba(0,0,0,0.72)",
              }}
            >
              STRATEGY COMMAND CENTER
            </div>
            <div
              style={{
                marginTop: 5,
                color: "rgba(195,222,239,0.82)",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 12,
                fontWeight: 650,
                letterSpacing: "0.11em",
                textShadow: "0 1px 2px rgba(0,0,0,0.72)",
              }}
            >
              AI PERFORMANCE ORCHESTRATION
            </div>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                height: 34,
                padding: "0 15px",
                borderRadius: 17,
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid rgba(76,215,255,0.17)",
                background: "rgba(7,25,48,0.68)",
                color: "rgba(218,236,247,0.88)",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 11,
                fontWeight: 750,
                letterSpacing: "0.075em",
                textShadow: "0 1px 2px rgba(0,0,0,0.72)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#58e9ff",
                  boxShadow: "0 0 9px #58e9ff",
                  opacity: 0.68 + Math.sin(frame * 0.11) * 0.18,
                }}
              />
              LIVE MODEL
            </div>
            <div
              style={{
                height: 34,
                padding: "0 15px",
                borderRadius: 17,
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid rgba(70,239,187,0.17)",
                background: "rgba(9,38,44,0.54)",
                color: "#71efc7",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 11,
                fontWeight: 750,
                letterSpacing: "0.075em",
                textShadow: "0 1px 2px rgba(0,0,0,0.72)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
                <path
                  d="M3 7.2L5.8 10L11 4.2"
                  fill="none"
                  stroke="#6ff0c5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              SYNCED
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 44,
            top: 119,
            width: 950,
            opacity: sectionReveal,
          }}
        >
          <div
            style={{
              height: 57,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "#f2f9ff",
                  fontFamily: "Inter, Arial, sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.72)",
                }}
              >
                Executive objectives
              </div>
              <div
                style={{
                  marginTop: 5,
                  color: "rgba(197,224,240,0.80)",
                  fontFamily: "Inter, Arial, sans-serif",
                  fontSize: 12,
                  fontWeight: 650,
                  letterSpacing: "0.085em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.72)",
                }}
              >
                REAL-TIME ALIGNMENT &amp; DELIVERY SIGNALS
              </div>
            </div>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 22,
                paddingRight: 4,
              }}
            >
              {[
                { label: "ACTIVE", value: "04", color: "#5de8ff" },
                {
                  label: "ALIGNED",
                  value: completedCount.toString().padStart(2, "0"),
                  color: "#60f0c2",
                },
                {
                  label: "VELOCITY",
                  value: `${Math.round(61 + scoreProgress * 33)}%`,
                  color: "#9b87ff",
                },
              ].map((metric) => (
                <div key={metric.label} style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: metric.color,
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: 17,
                      fontWeight: 750,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {metric.value}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color: "rgba(211,231,244,0.82)",
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: 11,
                      fontWeight: 750,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", rowGap: 13 }}>
            {OBJECTIVES.map((spec, index) => (
              <ObjectiveCard
                key={spec.id}
                frame={frame}
                spec={spec}
                index={index}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 1027,
            top: 118,
            bottom: 40,
            width: 1,
            background:
              "linear-gradient(180deg, transparent, rgba(75,186,229,0.18) 10%, rgba(75,186,229,0.10) 85%, transparent)",
            opacity: sectionReveal,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 1066,
            top: 112,
            width: 450,
            opacity: sectionReveal,
          }}
        >
          <div
            style={{
              color: "rgba(211,231,244,0.84)",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 12,
              fontWeight: 750,
              letterSpacing: "0.09em",
              textShadow: "0 1px 2px rgba(0,0,0,0.72)",
            }}
          >
            PORTFOLIO HEALTH
          </div>
          <StrategyScore
            frame={frame}
            scoreProgress={scoreProgress}
            completedCount={completedCount}
          />
          <div style={{ marginTop: -8 }}>
            <ExecutionSignal
              frame={frame}
              reveal={clamp(scoreProgress * 1.06)}
            />
          </div>
        </div>

        <svg
          width={PANEL_WIDTH}
          height={PANEL_HEIGHT}
          viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          <defs>
            <linearGradient id="frame-accent" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5bdfff" stopOpacity="0.78" />
              <stop offset="0.5" stopColor="#6d6fff" stopOpacity="0.24" />
              <stop offset="1" stopColor="#54f1bf" stopOpacity="0.60" />
            </linearGradient>
          </defs>
          <path
            d="M 24 1 H 180 M 1 24 V 150"
            fill="none"
            stroke="url(#frame-accent)"
            strokeLinecap="round"
            strokeWidth="2"
            opacity="0.72"
          />
          <path
            d={`M ${PANEL_WIDTH - 180} ${PANEL_HEIGHT - 1} H ${
              PANEL_WIDTH - 24
            } M ${PANEL_WIDTH - 1} ${PANEL_HEIGHT - 150} V ${
              PANEL_HEIGHT - 24
            }`}
            fill="none"
            stroke="url(#frame-accent)"
            strokeLinecap="round"
            strokeWidth="2"
            opacity="0.64"
          />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: -17,
          minWidth: 210,
          height: 34,
          padding: "0 18px",
          borderRadius: 19,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: badge,
          transform: `translateX(-50%) translateY(${mix(
            -10,
            0,
            badge,
          )}px) scale(${mix(0.76, 1, badge)})`,
          border: "1px solid rgba(74,239,186,0.46)",
          color: "#7af4cd",
          background:
            "linear-gradient(180deg, rgba(16,68,68,0.96), rgba(6,34,43,0.96))",
          boxShadow: `0 0 28px rgba(56,237,180,${
            badge * badgeGlow * 0.28
          }), inset 0 1px rgba(215,255,243,0.09)`,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 11,
          fontWeight: 750,
          letterSpacing: "0.085em",
          textShadow: "0 1px 2px rgba(0,0,0,0.72)",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(107,246,203,0.48)",
            background: "rgba(62,226,173,0.14)",
            boxShadow: "0 0 10px rgba(62,226,173,0.28)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path
              d="M2 5.2L4.1 7.2L8.1 2.9"
              fill="none"
              stroke="#85f6d2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </span>
        STRATEGY ALIGNED
      </div>

      <div
        style={{
          position: "absolute",
          left: PANEL_WIDTH / 2 - 220,
          top: -54,
          width: 440,
          height: 72,
          borderRadius: "50%",
          opacity: completion * 0.17,
          filter: "blur(28px)",
          background:
            "radial-gradient(ellipse, rgba(77,245,190,0.72), transparent 70%)",
        }}
      />
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = progress(frame, 0, 28, Easing.out(Easing.cubic));
  const outro = 1 - progress(frame, 842, 899, Easing.in(Easing.cubic));
  const globalOpacity = intro * outro;
  const objectiveProgress = OBJECTIVES.map((objective) =>
    progress(
      frame,
      objective.startFrame,
      objective.endFrame,
      Easing.inOut(Easing.cubic),
    ),
  );
  const finishingPulse =
    progress(frame, 540, 585) * (1 - progress(frame, 625, 690));

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#000207",
        WebkitFontSmoothing: "antialiased",
        textRendering: "optimizeLegibility",
      }}
    >
      <BackgroundAtmosphere frame={frame} opacity={globalOpacity} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: globalOpacity,
        }}
      >
        <DashboardShell
          frame={frame}
          objectiveProgress={objectiveProgress}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: globalOpacity,
          background:
            "radial-gradient(ellipse at center, transparent 46%, rgba(0,2,9,0.16) 72%, rgba(0,1,5,0.58) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: finishingPulse * 0.09,
          background:
            "radial-gradient(circle at 72% 43%, rgba(103,255,209,0.72), transparent 24%)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
