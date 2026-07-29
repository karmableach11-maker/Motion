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

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

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
  const value = Math.sin(seed * 91.713 + 17.319) * 43758.5453;
  return value - Math.floor(value);
};

const STARS = Array.from({ length: 64 }, (_, index) => ({
  x: seeded(index + 10) * WIDTH,
  y: seeded(index + 110) * HEIGHT,
  size: 1 + seeded(index + 210) * 2.4,
  opacity: 0.08 + seeded(index + 310) * 0.25,
  offset: seeded(index + 410) * TAU,
}));

const DATA_LINES = Array.from({ length: 7 }, (_, index) => ({
  y: 110 + seeded(index + 510) * 850,
  width: 120 + seeded(index + 610) * 270,
  speed: 0.8 + seeded(index + 710) * 0.8,
  offset: seeded(index + 810) * 2200,
  opacity: 0.06 + seeded(index + 910) * 0.09,
}));

type IconName = "signal" | "alignment" | "growth";

type Stage = {
  readonly index: number;
  readonly start: number;
  readonly x: number;
  readonly y: number;
  readonly accent: string;
  readonly secondary: string;
  readonly icon: IconName;
  readonly reverse?: boolean;
};

const STAGES: readonly Stage[] = [
  {
    index: 1,
    start: 60,
    x: 1030,
    y: 690,
    accent: "#ff8a6b",
    secondary: "#ffca78",
    icon: "signal",
  },
  {
    index: 2,
    start: 220,
    x: 485,
    y: 430,
    accent: "#9b82ff",
    secondary: "#d4a3ff",
    icon: "alignment",
    reverse: true,
  },
  {
    index: 3,
    start: 380,
    x: 1030,
    y: 170,
    accent: "#55e6a5",
    secondary: "#8ff7d4",
    icon: "growth",
  },
];

const Background: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 70% 42%, #17223f 0%, #0b1022 34%, #060916 68%, #03050c 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.3,
        backgroundImage:
          "linear-gradient(rgba(156,174,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(156,174,255,0.055) 1px, transparent 1px)",
        backgroundSize: "76px 76px",
        backgroundPosition: `${(frame * 0.035) % 76}px ${(frame * 0.022) % 76}px`,
        maskImage:
          "radial-gradient(ellipse at 66% 50%, black 0%, rgba(0,0,0,0.8) 44%, transparent 88%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 120,
        top: 40,
        width: 930,
        height: 930,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(130,105,255,0.16), rgba(130,105,255,0.045) 48%, transparent 73%)",
        filter: "blur(42px)",
        opacity: 0.84 + Math.sin(frame / 120) * 0.05,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -170,
        bottom: -300,
        width: 900,
        height: 900,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,116,93,0.11), rgba(255,116,93,0.025) 50%, transparent 74%)",
        filter: "blur(54px)",
        opacity: 0.8 + Math.cos(frame / 134) * 0.04,
      }}
    />
    {DATA_LINES.map((line, index) => {
      const x =
        ((frame * line.speed * 1.7 + line.offset) %
          (WIDTH + line.width + 360)) -
        line.width -
        180;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: x,
            top: line.y,
            width: line.width,
            height: 1,
            opacity: line.opacity,
            background:
              "linear-gradient(90deg, transparent, rgba(158,194,255,0.95), transparent)",
          }}
        />
      );
    })}
    {STARS.map((star, index) => {
      const twinkle = 0.62 + Math.sin(frame / 48 + star.offset) * 0.38;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: star.x,
            top: star.y + Math.sin(frame / 85 + star.offset) * 4,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            background:
              index % 5 === 0
                ? "#ffac91"
                : index % 3 === 0
                  ? "#9c87ff"
                  : "#7bf0c2",
            opacity: star.opacity * twinkle,
            boxShadow: "0 0 10px currentColor",
          }}
        />
      );
    })}
    <div
      style={{
        position: "absolute",
        inset: 34,
        border: "1px solid rgba(214,225,255,0.045)",
        borderRadius: 32,
      }}
    />
  </>
);

const StrategyIcon: React.FC<{
  readonly name: IconName;
  readonly color: string;
  readonly progress: number;
}> = ({ name, color, progress }) => {
  const common = {
    fill: "none",
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.7,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - progress,
  };

  if (name === "signal") {
    return (
      <svg width={62} height={62} viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="23" {...common} strokeWidth={2.2} />
        <circle cx="32" cy="32" r="13" {...common} strokeWidth={2.2} />
        <path d="M32 9V4M55 32H60M32 55V60M9 32H4" {...common} />
        <path d="M32 32L48 18" {...common} strokeWidth={3.2} />
        <circle cx="32" cy="32" r="4.5" fill={color} opacity={progress} />
      </svg>
    );
  }

  if (name === "alignment") {
    return (
      <svg width={64} height={64} viewBox="0 0 64 64" aria-hidden>
        <circle cx="15" cy="32" r="7" {...common} />
        <circle cx="49" cy="17" r="7" {...common} />
        <circle cx="49" cy="47" r="7" {...common} />
        <path d="M22 30L42 19M22 34L42 45M49 24V40" {...common} />
        <circle cx="15" cy="32" r="2.5" fill={color} opacity={progress} />
        <circle cx="49" cy="17" r="2.5" fill={color} opacity={progress} />
        <circle cx="49" cy="47" r="2.5" fill={color} opacity={progress} />
      </svg>
    );
  }

  return (
    <svg width={64} height={64} viewBox="0 0 64 64" aria-hidden>
      <path d="M10 49L25 34L35 42L54 20" {...common} strokeWidth={3.3} />
      <path d="M40 20H54V34" {...common} strokeWidth={3.3} />
      <path d="M10 57H56" {...common} strokeWidth={2.2} />
      <circle cx="25" cy="34" r="3.4" fill={color} opacity={progress} />
      <circle cx="35" cy="42" r="3.4" fill={color} opacity={progress} />
    </svg>
  );
};

const OrbitalIcon: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
}> = ({ frame, stage }) => {
  const ringProgress = phase(frame, stage.start + 42, stage.start + 96);
  const iconProgress = phase(frame, stage.start + 66, stage.start + 122);
  const radius = 62;
  const circumference = TAU * radius;
  const angle = -Math.PI / 2 + ringProgress * TAU;
  const dotX = 76 + Math.cos(angle) * radius;
  const dotY = 76 + Math.sin(angle) * radius;

  return (
    <div
      style={{
        position: "relative",
        width: 152,
        height: 152,
        flex: "0 0 auto",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 38% 32%, rgba(255,255,255,0.2), ${stage.accent}17 44%, rgba(5,8,20,0.62) 72%)`,
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: `inset 0 0 32px ${stage.accent}13, 0 0 30px ${stage.accent}18`,
      }}
    >
      <svg
        width={152}
        height={152}
        viewBox="0 0 152 152"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`orbital-${stage.index}`}
            x1="12"
            y1="76"
            x2="140"
            y2="76"
          >
            <stop offset="0%" stopColor={stage.accent} />
            <stop offset="100%" stopColor={stage.secondary} />
          </linearGradient>
        </defs>
        <circle
          cx="76"
          cy="76"
          r="68"
          fill="none"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth="1.4"
          strokeDasharray="4 8"
          transform={`rotate(${frame * 0.14} 76 76)`}
        />
        <circle
          cx="76"
          cy="76"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="5"
        />
        <circle
          cx="76"
          cy="76"
          r={radius}
          fill="none"
          stroke={`url(#orbital-${stage.index})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ringProgress)}
          transform="rotate(-90 76 76)"
        />
        {ringProgress > 0.02 ? (
          <>
            <circle
              cx={dotX}
              cy={dotY}
              r="10"
              fill={stage.secondary}
              opacity="0.16"
            />
            <circle cx={dotX} cy={dotY} r="4.2" fill="#ffffff" />
          </>
        ) : null}
      </svg>
      <StrategyIcon
        name={stage.icon}
        color={stage.secondary}
        progress={iconProgress}
      />
    </div>
  );
};

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
          width: 19,
          height: 19,
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

const EmptyContentBay: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
}> = ({ frame, stage }) => {
  const content = phase(frame, stage.start + 44, stage.start + 108);
  const detail = phase(frame, stage.start + 104, stage.start + 150);

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        height: 158,
        opacity: content,
        transform: `translateY(${(1 - content) * 18}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          background:
            "linear-gradient(145deg, rgba(4,7,19,0.2), rgba(255,255,255,0.018))",
          border: "1px solid rgba(255,255,255,0.065)",
          boxShadow: "inset 0 1px 18px rgba(0,0,0,0.13)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: 23,
          bottom: 23,
        }}
      >
        <CornerGuides color={stage.secondary} opacity={0.32 * detail} />
        <div
          style={{
            position: "absolute",
            left: stage.reverse ? "auto" : 0,
            right: stage.reverse ? 0 : "auto",
            top: 0,
            width: 56 * detail,
            height: 3,
            borderRadius: 4,
            background: `linear-gradient(90deg, ${stage.accent}, ${stage.secondary})`,
            boxShadow: `0 0 13px ${stage.accent}50`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 34,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            opacity: detail,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: stage.reverse ? 0 : "auto",
            right: stage.reverse ? "auto" : 0,
            bottom: 0,
            width: 88,
            height: 20,
            borderRadius: 10,
            background: `${stage.accent}0c`,
            border: `1px solid ${stage.secondary}28`,
            opacity: detail,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: stage.reverse ? 11 : "auto",
              right: stage.reverse ? "auto" : 11,
              top: 6,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: stage.secondary,
              boxShadow: `0 0 10px ${stage.secondary}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const StageSigil: React.FC<{
  readonly stage: Stage;
  readonly progress: number;
}> = ({ stage, progress }) => {
  const shape =
    stage.index === 1
      ? "M18 32L32 18L46 32L32 46Z"
      : stage.index === 2
        ? "M18 22H46V42H18Z"
        : "M32 16L48 44H16Z";

  return (
    <div
      style={{
        position: "absolute",
        left: stage.reverse ? "auto" : -24,
        right: stage.reverse ? -24 : "auto",
        top: stage.reverse ? 174 : 20,
        width: 64,
        height: 64,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(145deg, ${stage.secondary}, ${stage.accent})`,
        border: "2px solid rgba(255,255,255,0.7)",
        boxShadow: `0 0 0 8px ${stage.accent}13, 0 10px 26px ${stage.accent}40`,
        opacity: progress,
        transform: `scale(${progress})`,
        zIndex: 4,
      }}
    >
      <svg width={36} height={36} viewBox="0 0 64 64" aria-hidden>
        <path
          d={shape}
          fill="none"
          stroke="#07101a"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="32" r="4" fill="#07101a" />
      </svg>
    </div>
  );
};

const GlassStageNode: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
}> = ({ frame, stage }) => {
  const reveal = phase(frame, stage.start, stage.start + 74);
  const sigil = phase(
    frame,
    stage.start + 90,
    stage.start + 132,
    Easing.out(Easing.back(1.35)),
  );
  const enterX = stage.reverse ? -74 : 74;
  const radius = stage.reverse
    ? "34px 112px 34px 112px"
    : "112px 34px 112px 34px";

  return (
    <div
      style={{
        position: "absolute",
        left: stage.x,
        top: stage.y,
        width: 710,
        height: 240,
        opacity: reveal,
        transform: `translate3d(${(1 - reveal) * enterX}px, ${(1 - reveal) * 24}px, 0) scale(${0.86 + reveal * 0.14})`,
        transformOrigin: stage.reverse ? "100% 50%" : "0% 50%",
        zIndex: 10 + stage.index,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: `linear-gradient(135deg, rgba(255,255,255,0.17) 0%, ${stage.accent}24 32%, rgba(20,25,50,0.55) 72%, ${stage.accent}15 100%)`,
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 ${stage.accent}2b, 0 28px 70px rgba(0,0,0,0.34), 0 0 44px ${stage.accent}12`,
          backdropFilter: "blur(26px) saturate(135%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: stage.reverse ? 86 : 34,
            right: stage.reverse ? 34 : 86,
            top: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.72), transparent)",
            opacity: 0.58,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 270,
            height: 270,
            borderRadius: "50%",
            left: stage.reverse ? "auto" : -78,
            right: stage.reverse ? -78 : "auto",
            top: -18,
            background: `radial-gradient(circle, ${stage.accent}2e, transparent 68%)`,
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: radius,
            border: "1px solid rgba(255,255,255,0.055)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: stage.reverse ? "row-reverse" : "row",
          alignItems: "center",
          gap: 30,
          padding: "35px 44px",
        }}
      >
        <OrbitalIcon frame={frame} stage={stage} />
        <EmptyContentBay frame={frame} stage={stage} />
      </div>
      <StageSigil stage={stage} progress={clamp(sigil)} />
    </div>
  );
};

const cubicPoint = (
  t: number,
  p0: readonly [number, number],
  p1: readonly [number, number],
  p2: readonly [number, number],
  p3: readonly [number, number],
): readonly [number, number] => {
  const oneMinus = 1 - t;
  return [
    oneMinus ** 3 * p0[0] +
      3 * oneMinus ** 2 * t * p1[0] +
      3 * oneMinus * t ** 2 * p2[0] +
      t ** 3 * p3[0],
    oneMinus ** 3 * p0[1] +
      3 * oneMinus ** 2 * t * p1[1] +
      3 * oneMinus * t ** 2 * p2[1] +
      t ** 3 * p3[1],
  ];
};

const StrategyConnectors: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const first = phase(frame, 250, 350);
  const second = phase(frame, 410, 510);
  const completion = phase(frame, 520, 640);
  const flow = ((frame - 520) % 150) / 150;
  const safeFlow = frame < 520 ? 0 : flow < 0 ? flow + 1 : flow;
  const firstPulse = cubicPoint(
    clamp(safeFlow * 2),
    [1139, 790],
    [1210, 710],
    [1110, 620],
    [1195, 570],
  );
  const secondPulse = cubicPoint(
    clamp(safeFlow * 2 - 1),
    [1195, 570],
    [1105, 505],
    [1210, 390],
    [1139, 286],
  );
  const pulse = safeFlow < 0.5 ? firstPulse : secondPulse;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 5 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="connectorA" x1="1139" y1="790" x2="1195" y2="570">
          <stop offset="0%" stopColor="#ff9d78" />
          <stop offset="100%" stopColor="#a98cff" />
        </linearGradient>
        <linearGradient id="connectorB" x1="1195" y1="570" x2="1139" y2="286">
          <stop offset="0%" stopColor="#a98cff" />
          <stop offset="100%" stopColor="#70edb9" />
        </linearGradient>
        <filter id="connectorGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M1139 790 C1210 710 1110 620 1195 570"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
      />
      <path
        d="M1139 790 C1210 710 1110 620 1195 570"
        fill="none"
        stroke="url(#connectorA)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - first}
        filter="url(#connectorGlow)"
      />
      <path
        d="M1195 570 C1105 505 1210 390 1139 286"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
      />
      <path
        d="M1195 570 C1105 505 1210 390 1139 286"
        fill="none"
        stroke="url(#connectorB)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - second}
        filter="url(#connectorGlow)"
      />
      {frame >= 520 && completion > 0 ? (
        <>
          <circle
            cx={pulse[0]}
            cy={pulse[1]}
            r="13"
            fill="#ffffff"
            opacity={0.1 * completion}
          />
          <circle
            cx={pulse[0]}
            cy={pulse[1]}
            r="4.2"
            fill="#ffffff"
            opacity={completion}
          />
        </>
      ) : null}
    </svg>
  );
};

const CopySpace: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 18, 78);
  const guides = phase(frame, 64, 144);

  return (
    <div
      style={{
        position: "absolute",
        left: 138,
        top: 110,
        width: 708,
        height: 300,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 20}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 34,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.065), rgba(255,255,255,0.012) 62%, rgba(85,230,165,0.025))",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.13), 0 28px 80px rgba(0,0,0,0.18)",
          backdropFilter: "blur(18px) saturate(125%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          top: 34,
          bottom: 34,
        }}
      >
        <CornerGuides color="#b9c7ef" opacity={0.25 * guides} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 84 * guides,
            height: 4,
            borderRadius: 4,
            background:
              "linear-gradient(90deg, #ff8a6b, #9b82ff 52%, #55e6a5)",
            boxShadow: "0 0 18px rgba(155,130,255,0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 52,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(255,138,107,0.52), rgba(155,130,255,0.32), rgba(85,230,165,0.08))",
            transform: `scaleX(${guides})`,
            transformOrigin: "left center",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 14,
            display: "flex",
            gap: 13,
            opacity: guides,
          }}
        >
          {STAGES.map((stage) => (
            <div
              key={stage.index}
              style={{
                width: 10,
                height: 10,
                borderRadius: stage.index === 2 ? 2 : "50%",
                background: stage.secondary,
                boxShadow: `0 0 13px ${stage.accent}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const EmptySummary: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 555, 640);
  const confirmation = phase(
    frame,
    620,
    690,
    Easing.out(Easing.back(1.15)),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 138,
        top: 690,
        width: 700,
        zIndex: 20,
        opacity: reveal,
      }}
    >
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        {STAGES.map((stage, index) => {
          const itemReveal = phase(frame, 555 + index * 28, 620 + index * 28);
          return (
            <div
              key={stage.index}
              style={{
                position: "relative",
                width: index === 2 ? 178 : 144,
                height: 96,
                borderRadius: 20,
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025))",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                opacity: itemReveal,
                transform: `translateY(${(1 - itemReveal) * 14}px)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 17,
                  top: 17,
                  width: 19,
                  height: 19,
                  borderRadius: stage.index === 2 ? 4 : "50%",
                  border: `2px solid ${stage.secondary}`,
                  boxShadow: `0 0 14px ${stage.accent}52`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 17,
                  right: 17,
                  bottom: 17,
                  height: 22,
                  borderRadius: 9,
                  background: `${stage.accent}0a`,
                  border: `1px solid ${stage.secondary}24`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 17,
                  top: 17,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: stage.secondary,
                  boxShadow: `0 0 12px ${stage.secondary}`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          height: 84,
          borderRadius: 25,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 22px",
          background:
            "linear-gradient(145deg, rgba(112,237,185,0.09), rgba(255,255,255,0.02))",
          border: "1px solid rgba(119,246,198,0.18)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px rgba(86,230,171,0.07)",
          opacity: clamp(confirmation),
          transform: `translateY(${(1 - clamp(confirmation)) * 16}px)`,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            flex: "0 0 auto",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, rgba(111,240,188,0.28), rgba(86,225,166,0.1))",
            border: "1px solid rgba(119,246,198,0.54)",
            boxShadow: "0 0 30px rgba(86,230,171,0.2)",
          }}
        >
          <svg width={28} height={28} viewBox="0 0 32 32" aria-hidden>
            <path
              d="M7 16.5L13.2 22.5L25 10.5"
              fill="none"
              stroke="#82f2c8"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            position: "relative",
            height: 42,
            flex: 1,
          }}
        >
          <CornerGuides color="#82f2c8" opacity={0.2} />
          <div
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              top: 20,
              height: 1,
              background:
                "linear-gradient(90deg, rgba(130,242,200,0.12), rgba(130,242,200,0.02))",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const MinimalFooter: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const visible = phase(frame, 96, 160);
  const complete = phase(frame, 600, 660);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 138,
          bottom: 74,
          width: 460,
          height: 8,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: visible,
          zIndex: 30,
        }}
      >
        {STAGES.map((stage, index) => {
          const active = phase(frame, stage.start, stage.start + 90);
          return (
            <React.Fragment key={stage.index}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: index === 1 ? 2 : "50%",
                  background: stage.secondary,
                  boxShadow: `0 0 ${10 + active * 9}px ${stage.accent}`,
                  opacity: 0.38 + active * 0.62,
                }}
              />
              {index < STAGES.length - 1 ? (
                <div
                  style={{
                    width: 100,
                    height: 1,
                    background: `linear-gradient(90deg, ${stage.accent}5c, rgba(255,255,255,0.05))`,
                    transform: `scaleX(${active})`,
                    transformOrigin: "left center",
                  }}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          right: 138,
          bottom: 70,
          width: 96,
          height: 18,
          borderRadius: 9,
          background:
            "linear-gradient(90deg, rgba(255,138,107,0.08), rgba(155,130,255,0.1), rgba(85,230,165,0.12))",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: visible,
          zIndex: 30,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 5,
            top: 4,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: complete > 0.8 ? "#70edb9" : "#ff9b77",
            boxShadow:
              complete > 0.8
                ? "0 0 14px rgba(112,237,185,0.8)"
                : "0 0 14px rgba(255,155,119,0.8)",
          }}
        />
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = phase(frame, 0, 30, Easing.out(Easing.quad));
  const fadeOut = 1 - phase(frame, 850, TOTAL_FRAMES - 1, Easing.in(Easing.quad));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02040a",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <Background frame={frame} />
        <StrategyConnectors frame={frame} />
        <CopySpace frame={frame} />
        {STAGES.map((stage) => (
          <GlassStageNode key={stage.index} frame={frame} stage={stage} />
        ))}
        <EmptySummary frame={frame} />
        <MinimalFooter frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
