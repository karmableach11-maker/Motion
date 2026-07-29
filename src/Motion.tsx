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
  phase: seeded(index + 410) * TAU,
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
  readonly title: string;
  readonly subtitle: string;
  readonly metric: string;
  readonly metricLabel: string;
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
    title: "MARKET INTELLIGENCE",
    subtitle: "Signals distilled into opportunity",
    metric: "+28%",
    metricLabel: "SIGNAL QUALITY",
    icon: "signal",
  },
  {
    index: 2,
    start: 220,
    x: 485,
    y: 430,
    accent: "#9b82ff",
    secondary: "#d4a3ff",
    title: "STRATEGIC ALIGNMENT",
    subtitle: "Priorities shared across every team",
    metric: "92%",
    metricLabel: "TEAM CLARITY",
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
    title: "GROWTH EXECUTION",
    subtitle: "Plans converted into measurable impact",
    metric: "3.4×",
    metricLabel: "DELIVERY SPEED",
    icon: "growth",
  },
];

const Background: React.FC<{ readonly frame: number }> = ({ frame }) => {
  return (
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
        const twinkle = 0.62 + Math.sin(frame / 48 + star.phase) * 0.38;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: star.x,
              top: star.y + Math.sin(frame / 85 + star.phase) * 4,
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
          pointerEvents: "none",
        }}
      />
    </>
  );
};

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
        <circle
          cx="32"
          cy="32"
          r="23"
          {...common}
          strokeWidth={2.2}
        />
        <circle
          cx="32"
          cy="32"
          r="13"
          {...common}
          strokeWidth={2.2}
        />
        <path d="M32 9V4M55 32H60M32 55V60M9 32H4" {...common} />
        <path d="M32 32L48 18" {...common} strokeWidth={3.2} />
        <circle
          cx="32"
          cy="32"
          r="4.5"
          fill={color}
          opacity={progress}
        />
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
  readonly start: number;
  readonly accent: string;
  readonly secondary: string;
  readonly icon: IconName;
}> = ({ frame, start, accent, secondary, icon }) => {
  const ringProgress = phase(frame, start + 42, start + 96);
  const iconProgress = phase(frame, start + 66, start + 122);
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
        background: `radial-gradient(circle at 38% 32%, rgba(255,255,255,0.2), ${accent}17 44%, rgba(5,8,20,0.62) 72%)`,
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: `inset 0 0 32px ${accent}13, 0 0 30px ${accent}18`,
      }}
    >
      <svg
        width={152}
        height={152}
        viewBox="0 0 152 152"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
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
          stroke={`url(#orbital-${icon})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ringProgress)}
          transform="rotate(-90 76 76)"
        />
        <defs>
          <linearGradient id={`orbital-${icon}`} x1="12" y1="76" x2="140" y2="76">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        </defs>
        {ringProgress > 0.02 ? (
          <>
            <circle
              cx={dotX}
              cy={dotY}
              r="10"
              fill={secondary}
              opacity="0.16"
            />
            <circle cx={dotX} cy={dotY} r="4.2" fill="#ffffff" />
          </>
        ) : null}
      </svg>
      <StrategyIcon name={icon} color={secondary} progress={iconProgress} />
    </div>
  );
};

const GlassStageNode: React.FC<{
  readonly frame: number;
  readonly stage: Stage;
}> = ({ frame, stage }) => {
  const reveal = phase(frame, stage.start, stage.start + 74);
  const content = phase(frame, stage.start + 42, stage.start + 100);
  const badge = phase(
    frame,
    stage.start + 90,
    stage.start + 132,
    Easing.out(Easing.back(1.35)),
  );
  const metric = phase(frame, stage.start + 112, stage.start + 154);
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
            pointerEvents: "none",
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
        <OrbitalIcon
          frame={frame}
          start={stage.start}
          accent={stage.accent}
          secondary={stage.secondary}
          icon={stage.icon}
        />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: stage.reverse ? "right" : "left",
            opacity: content,
            transform: `translateY(${(1 - content) * 18}px)`,
          }}
        >
          <div
            style={{
              color: stage.secondary,
              fontFamily: "Inter, Avenir Next, Arial, sans-serif",
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 3.2,
              lineHeight: 1,
              marginBottom: 14,
              textShadow: `0 0 18px ${stage.accent}55`,
            }}
          >
            STAGE {String(stage.index).padStart(2, "0")}
          </div>
          <div
            style={{
              color: "#f7f9ff",
              fontFamily: "Inter, Avenir Next, Arial, sans-serif",
              fontSize: 28,
              fontWeight: 750,
              letterSpacing: 0.4,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              textShadow: "0 2px 16px rgba(0,0,0,0.38)",
            }}
          >
            {stage.title}
          </div>
          <div
            style={{
              color: "rgba(226,233,251,0.82)",
              fontFamily: "Inter, Avenir Next, Arial, sans-serif",
              fontSize: 20,
              fontWeight: 500,
              lineHeight: 1.3,
              marginTop: 10,
              whiteSpace: "nowrap",
            }}
          >
            {stage.subtitle}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: stage.reverse ? "flex-end" : "flex-start",
              alignItems: "baseline",
              gap: 10,
              marginTop: 13,
              opacity: metric,
            }}
          >
            <span
              style={{
                color: stage.secondary,
                fontFamily: "Inter, Avenir Next, Arial, sans-serif",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: -0.4,
              }}
            >
              {stage.metric}
            </span>
            <span
              style={{
                color: "rgba(219,226,247,0.66)",
                fontFamily: "Inter, Avenir Next, Arial, sans-serif",
                fontSize: 13,
                fontWeight: 750,
                letterSpacing: 1.8,
              }}
            >
              {stage.metricLabel}
            </span>
          </div>
        </div>
      </div>

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
          color: "#07101a",
          fontFamily: "Inter, Avenir Next, Arial, sans-serif",
          fontSize: 22,
          fontWeight: 900,
          letterSpacing: -0.5,
          opacity: clamp(badge),
          transform: `scale(${Math.max(0, badge)})`,
          zIndex: 4,
        }}
      >
        {String(stage.index).padStart(2, "0")}
      </div>
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
  const x =
    oneMinus ** 3 * p0[0] +
    3 * oneMinus ** 2 * t * p1[0] +
    3 * oneMinus * t ** 2 * p2[0] +
    t ** 3 * p3[0];
  const y =
    oneMinus ** 3 * p0[1] +
    3 * oneMinus ** 2 * t * p1[1] +
    3 * oneMinus * t ** 2 * p2[1] +
    t ** 3 * p3[1];
  return [x, y];
};

const StrategyConnectors: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const first = phase(frame, 250, 350);
  const second = phase(frame, 410, 510);
  const completion = phase(frame, 520, 640);
  const flow = ((frame - 520) % 150) / 150;
  const safeFlow = frame < 520 ? 0 : flow < 0 ? flow + 1 : flow;

  const connectorA = {
    p0: [1139, 790] as const,
    p1: [1210, 710] as const,
    p2: [1110, 620] as const,
    p3: [1195, 570] as const,
  };
  const connectorB = {
    p0: [1195, 570] as const,
    p1: [1105, 505] as const,
    p2: [1210, 390] as const,
    p3: [1139, 286] as const,
  };
  const firstPulse = cubicPoint(
    clamp(safeFlow * 2),
    connectorA.p0,
    connectorA.p1,
    connectorA.p2,
    connectorA.p3,
  );
  const secondPulse = cubicPoint(
    clamp(safeFlow * 2 - 1),
    connectorB.p0,
    connectorB.p1,
    connectorB.p2,
    connectorB.p3,
  );

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
            cx={safeFlow < 0.5 ? firstPulse[0] : secondPulse[0]}
            cy={safeFlow < 0.5 ? firstPulse[1] : secondPulse[1]}
            r="13"
            fill="#ffffff"
            opacity={0.1 * completion}
          />
          <circle
            cx={safeFlow < 0.5 ? firstPulse[0] : secondPulse[0]}
            cy={safeFlow < 0.5 ? firstPulse[1] : secondPulse[1]}
            r="4.2"
            fill="#ffffff"
            opacity={completion}
          />
        </>
      ) : null}
    </svg>
  );
};

const Header: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const intro = phase(frame, 18, 72);
  const rule = phase(frame, 62, 140);

  return (
    <div
      style={{
        position: "absolute",
        left: 138,
        top: 102,
        width: 760,
        opacity: intro,
        transform: `translateY(${(1 - intro) * 20}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 13,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#70edb9",
            boxShadow: "0 0 18px rgba(112,237,185,0.76)",
          }}
        />
        <div
          style={{
            color: "rgba(220,230,252,0.72)",
            fontFamily: "Inter, Avenir Next, Arial, sans-serif",
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: 3.4,
          }}
        >
          THREE-STAGE GROWTH FRAMEWORK
        </div>
      </div>
      <div
        style={{
          color: "#f7f9ff",
          fontFamily: "Inter, Avenir Next, Arial, sans-serif",
          fontSize: 62,
          fontWeight: 760,
          lineHeight: 1.03,
          letterSpacing: -2.2,
          textShadow: "0 10px 36px rgba(0,0,0,0.38)",
        }}
      >
        Build a strategy
        <br />
        that moves.
      </div>
      <div
        style={{
          color: "rgba(223,231,249,0.73)",
          fontFamily: "Inter, Avenir Next, Arial, sans-serif",
          fontSize: 23,
          fontWeight: 480,
          lineHeight: 1.48,
          width: 540,
          marginTop: 22,
        }}
      >
        Turn market signals into aligned priorities
        <br />
        and measurable business growth.
      </div>
      <div
        style={{
          width: 520 * rule,
          height: 1,
          marginTop: 30,
          background:
            "linear-gradient(90deg, rgba(255,138,107,0.75), rgba(155,130,255,0.55), rgba(85,230,165,0.12))",
        }}
      />
    </div>
  );
};

const ExecutiveSummary: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 560, 642);
  const confirm = phase(
    frame,
    620,
    690,
    Easing.out(Easing.back(1.15)),
  );
  const metrics = [
    { value: "03", label: "STAGES", color: "#ff9a78" },
    { value: "100%", label: "ALIGNED", color: "#a88eff" },
    { value: "READY", label: "TO SCALE", color: "#70edb9" },
  ] as const;

  return (
    <div
      style={{
        position: "absolute",
        left: 138,
        top: 596,
        width: 700,
        zIndex: 20,
        opacity: reveal,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 26,
        }}
      >
        {metrics.map((item, index) => {
          const itemReveal = phase(frame, 555 + index * 28, 620 + index * 28);
          return (
            <div
              key={item.label}
              style={{
                width: index === 2 ? 178 : 144,
                height: 86,
                borderRadius: 20,
                padding: "15px 18px",
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
                  color: item.color,
                  fontFamily: "Inter, Avenir Next, Arial, sans-serif",
                  fontSize: 25,
                  fontWeight: 850,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  color: "rgba(222,230,249,0.62)",
                  fontFamily: "Inter, Avenir Next, Arial, sans-serif",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.8,
                  marginTop: 10,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: clamp(confirm),
          transform: `translateY(${(1 - clamp(confirm)) * 16}px)`,
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
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
          <svg width={29} height={29} viewBox="0 0 32 32" aria-hidden>
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
        <div>
          <div
            style={{
              color: "#f7f9ff",
              fontFamily: "Inter, Avenir Next, Arial, sans-serif",
              fontSize: 36,
              fontWeight: 790,
              letterSpacing: 0.5,
              lineHeight: 1,
            }}
          >
            STRATEGY ALIGNED
          </div>
          <div
            style={{
              color: "#70edb9",
              fontFamily: "Inter, Avenir Next, Arial, sans-serif",
              fontSize: 14,
              fontWeight: 850,
              letterSpacing: 3.2,
              marginTop: 11,
            }}
          >
            EXECUTION PATH VERIFIED
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const visible = phase(frame, 96, 160);
  const liveStage =
    frame < STAGES[1].start
      ? 1
      : frame < STAGES[2].start
        ? 2
        : 3;
  const complete = frame >= 620;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 138,
          bottom: 74,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: visible,
          color: "rgba(207,218,242,0.5)",
          fontFamily: "Inter, Avenir Next, Arial, sans-serif",
          fontSize: 12,
          fontWeight: 750,
          letterSpacing: 2.2,
          zIndex: 30,
        }}
      >
        <span>BUSINESS STRATEGY SYSTEM</span>
        <span style={{ opacity: 0.34 }}>•</span>
        <span style={{ color: complete ? "#70edb9" : "#a98cff" }}>
          {complete ? "FRAMEWORK COMPLETE" : `BUILDING STAGE 0${liveStage}`}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 138,
          bottom: 74,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: visible,
          color: "rgba(207,218,242,0.5)",
          fontFamily: "Inter, Avenir Next, Arial, sans-serif",
          fontSize: 12,
          fontWeight: 750,
          letterSpacing: 2.1,
          zIndex: 30,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: complete ? "#70edb9" : "#ff9b77",
            boxShadow: complete
              ? "0 0 14px rgba(112,237,185,0.8)"
              : "0 0 14px rgba(255,155,119,0.8)",
          }}
        />
        <span>{complete ? "LIVE / ALIGNED" : "LIVE / ANALYZING"}</span>
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = phase(frame, 0, 30, Easing.out(Easing.quad));
  const fadeOut = 1 - phase(frame, 850, TOTAL_FRAMES - 1, Easing.in(Easing.quad));
  const opacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02040a",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ opacity }}>
        <Background frame={frame} />
        <StrategyConnectors frame={frame} />
        <Header frame={frame} />
        {STAGES.map((stage) => (
          <GlassStageNode key={stage.index} frame={frame} stage={stage} />
        ))}
        <ExecutiveSummary frame={frame} />
        <Footer frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
