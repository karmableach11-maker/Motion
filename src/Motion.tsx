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
  const value = Math.sin(seed * 93.117 + 19.771) * 43758.5453;
  return value - Math.floor(value);
};

const STARS = Array.from({ length: 72 }, (_, index) => ({
  x: seeded(index + 10) * WIDTH,
  y: seeded(index + 110) * HEIGHT,
  size: 1 + seeded(index + 210) * 2.4,
  opacity: 0.08 + seeded(index + 310) * 0.24,
  offset: seeded(index + 410) * TAU,
}));

const STREAMS = Array.from({ length: 8 }, (_, index) => ({
  y: 100 + seeded(index + 510) * 880,
  width: 130 + seeded(index + 610) * 280,
  speed: 0.65 + seeded(index + 710) * 0.8,
  offset: seeded(index + 810) * 2300,
  opacity: 0.04 + seeded(index + 910) * 0.07,
}));

type Side = {
  readonly id: "left" | "right";
  readonly x: number;
  readonly start: number;
  readonly accent: string;
  readonly secondary: string;
  readonly soft: string;
  readonly metrics: readonly number[];
  readonly ringValue: number;
};

const SIDES: readonly Side[] = [
  {
    id: "left",
    x: 120,
    start: 70,
    accent: "#39d9ff",
    secondary: "#5c78ff",
    soft: "#9eeeff",
    metrics: [0.82, 0.58, 0.74],
    ringValue: 0.79,
  },
  {
    id: "right",
    x: 1180,
    start: 180,
    accent: "#ff68b5",
    secondary: "#ff9568",
    soft: "#ffc1dd",
    metrics: [0.67, 0.88, 0.62],
    ringValue: 0.72,
  },
];

const Background: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 46%, #17203c 0%, #0b1023 34%, #060916 68%, #02040b 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.34,
        backgroundImage:
          "linear-gradient(rgba(147,171,255,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(147,171,255,0.052) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        backgroundPosition: `${(frame * 0.03) % 72}px ${(frame * 0.02) % 72}px`,
        maskImage:
          "radial-gradient(ellipse at 50% 50%, black 0%, rgba(0,0,0,0.86) 45%, transparent 88%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -210,
        top: 70,
        width: 980,
        height: 980,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(47,204,255,0.13), rgba(61,101,255,0.035) 52%, transparent 74%)",
        filter: "blur(54px)",
        opacity: 0.8 + Math.sin(frame / 126) * 0.05,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -210,
        top: 70,
        width: 980,
        height: 980,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,87,172,0.13), rgba(255,133,91,0.035) 52%, transparent 74%)",
        filter: "blur(54px)",
        opacity: 0.8 + Math.cos(frame / 132) * 0.05,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 660,
        top: 200,
        width: 600,
        height: 650,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(122,238,197,0.08), rgba(121,112,255,0.035) 48%, transparent 72%)",
        filter: "blur(48px)",
      }}
    />
    {STREAMS.map((stream, index) => {
      const x =
        ((frame * stream.speed * 1.55 + stream.offset) %
          (WIDTH + stream.width + 320)) -
        stream.width -
        160;
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
              "linear-gradient(90deg, transparent, rgba(170,199,255,0.92), transparent)",
            opacity: stream.opacity,
          }}
        />
      );
    })}
    {STARS.map((star, index) => {
      const twinkle = 0.63 + Math.sin(frame / 50 + star.offset) * 0.37;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: star.x,
            top: star.y + Math.sin(frame / 88 + star.offset) * 4,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            background:
              index % 3 === 0
                ? "#65dcff"
                : index % 3 === 1
                  ? "#ff83bc"
                  : "#84e9c3",
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
        border: "1px solid rgba(217,227,255,0.046)",
        borderRadius: 32,
      }}
    />
  </>
);

const CornerGuides: React.FC<{
  readonly color: string;
  readonly opacity: number;
  readonly size?: number;
}> = ({ color, opacity, size = 18 }) => (
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
          width: size,
          height: size,
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

const EmptyTitleBay: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 18, 78);
  const detail = phase(frame, 58, 135);

  return (
    <div
      style={{
        position: "absolute",
        left: 610,
        top: 64,
        width: 700,
        height: 92,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 18}px)`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.078), rgba(255,255,255,0.016))",
          border: "1px solid rgba(255,255,255,0.11)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.13), 0 20px 60px rgba(0,0,0,0.17)",
          backdropFilter: "blur(20px) saturate(130%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 22,
          bottom: 22,
        }}
      >
        <CornerGuides color="#c9d7ff" opacity={0.2 * detail} size={15} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -1,
            width: 150 * detail,
            height: 3,
            borderRadius: 4,
            transform: "translateX(-50%)",
            background:
              "linear-gradient(90deg, #39d9ff, #6f8cff 35%, #ff68b5 68%, #ff9568)",
            boxShadow: "0 0 18px rgba(137,137,255,0.32)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 34,
            right: 34,
            top: "50%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.075), transparent)",
            opacity: detail,
          }}
        />
      </div>
    </div>
  );
};

const AbstractBadge: React.FC<{
  readonly frame: number;
  readonly side: Side;
}> = ({ frame, side }) => {
  const ring = phase(frame, side.start + 28, side.start + 98);
  const icon = phase(frame, side.start + 74, side.start + 132);
  const radius = 45;
  const circumference = TAU * radius;
  const angle = -Math.PI / 2 + ring * TAU;
  const dotX = 57 + Math.cos(angle) * radius;
  const dotY = 57 + Math.sin(angle) * radius;

  return (
    <div
      style={{
        position: "relative",
        width: 114,
        height: 114,
        flex: "0 0 auto",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 36% 30%, rgba(255,255,255,0.25), ${side.accent}1c 45%, rgba(5,8,21,0.58) 74%)`,
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: `inset 0 0 30px ${side.accent}16, 0 0 32px ${side.accent}17`,
      }}
    >
      <svg
        width={114}
        height={114}
        viewBox="0 0 114 114"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`badge-${side.id}`}
            x1="10"
            y1="57"
            x2="104"
            y2="57"
          >
            <stop offset="0%" stopColor={side.accent} />
            <stop offset="100%" stopColor={side.secondary} />
          </linearGradient>
        </defs>
        <circle
          cx="57"
          cy="57"
          r="51"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.3"
          strokeDasharray="3 7"
          transform={`rotate(${side.id === "left" ? frame * 0.14 : -frame * 0.14} 57 57)`}
        />
        <circle
          cx="57"
          cy="57"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.065)"
          strokeWidth="4"
        />
        <circle
          cx="57"
          cy="57"
          r={radius}
          fill="none"
          stroke={`url(#badge-${side.id})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ring)}
          transform="rotate(-90 57 57)"
        />
        {ring > 0.02 ? (
          <>
            <circle
              cx={dotX}
              cy={dotY}
              r="9"
              fill={side.soft}
              opacity="0.14"
            />
            <circle cx={dotX} cy={dotY} r="3.5" fill="#ffffff" />
          </>
        ) : null}
      </svg>
      <svg
        width={54}
        height={54}
        viewBox="0 0 64 64"
        style={{ opacity: icon }}
        aria-hidden
      >
        {side.id === "left" ? (
          <>
            <path
              d="M12 45L24 33L33 40L51 20"
              fill="none"
              stroke={side.soft}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - icon}
            />
            <path
              d="M39 20H51V32"
              fill="none"
              stroke={side.accent}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - icon}
            />
            <circle cx="24" cy="33" r="3.4" fill={side.accent} />
          </>
        ) : (
          <>
            <path
              d="M15 18H49M15 32H43M15 46H36"
              fill="none"
              stroke={side.soft}
              strokeWidth="3.4"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - icon}
            />
            <circle cx="49" cy="18" r="4" fill={side.accent} />
            <circle cx="43" cy="32" r="4" fill={side.secondary} />
            <circle cx="36" cy="46" r="4" fill={side.accent} />
          </>
        )}
      </svg>
    </div>
  );
};

const EmptyPanelHeader: React.FC<{
  readonly frame: number;
  readonly side: Side;
}> = ({ frame, side }) => {
  const reveal = phase(frame, side.start + 42, side.start + 116);
  const details = phase(frame, side.start + 96, side.start + 156);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 15}px)`,
      }}
    >
      <AbstractBadge frame={frame} side={side} />
      <div
        style={{
          position: "relative",
          flex: 1,
          height: 114,
          borderRadius: 22,
          background:
            "linear-gradient(145deg, rgba(2,5,17,0.22), rgba(255,255,255,0.018))",
          border: "1px solid rgba(255,255,255,0.067)",
          boxShadow: "inset 0 1px 18px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 20,
          }}
        >
          <CornerGuides color={side.soft} opacity={0.26 * details} />
          <div
            style={{
              position: "absolute",
              left: side.id === "left" ? 0 : "auto",
              right: side.id === "right" ? 0 : "auto",
              top: 0,
              width: 62 * details,
              height: 3,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${side.accent}, ${side.secondary})`,
              boxShadow: `0 0 15px ${side.accent}44`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 14,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
              opacity: details,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const MetricRows: React.FC<{
  readonly frame: number;
  readonly side: Side;
}> = ({ frame, side }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 14,
      marginTop: 22,
    }}
  >
    {side.metrics.map((value, index) => {
      const row = phase(
        frame,
        side.start + 126 + index * 42,
        side.start + 196 + index * 42,
      );
      const fill = phase(
        frame,
        side.start + 162 + index * 42,
        side.start + 260 + index * 42,
      );
      const fillWidth = 330 * value * fill;

      return (
        <div
          key={index}
          style={{
            position: "relative",
            height: 72,
            borderRadius: 18,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.095)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            opacity: row,
            transform: `translateX(${(1 - row) * (side.id === "left" ? -22 : 22)}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 22,
              width: 28,
              height: 28,
              borderRadius: index === 1 ? 7 : "50%",
              background: `${side.accent}16`,
              border: `1px solid ${side.soft}45`,
              boxShadow: `0 0 14px ${side.accent}24`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 9,
                borderRadius: index === 2 ? 1 : "50%",
                background: index === 1 ? side.secondary : side.accent,
                boxShadow: `0 0 9px ${side.accent}`,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 62,
              top: 27,
              width: 330,
              height: 16,
              borderRadius: 9,
              overflow: "hidden",
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.055)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: fillWidth,
                height: "100%",
                borderRadius: 9,
                background: `linear-gradient(90deg, ${side.secondary}, ${side.accent}, ${side.soft})`,
                boxShadow: `0 0 18px ${side.accent}5f`,
              }}
            />
            {fill > 0.02 ? (
              <div
                style={{
                  position: "absolute",
                  left: Math.max(0, fillWidth - 5),
                  top: 3,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: `0 0 12px ${side.soft}`,
                }}
              />
            ) : null}
          </div>
          <div
            style={{
              position: "absolute",
              right: 18,
              top: 24,
              width: 52,
              height: 22,
              borderRadius: 11,
              background: `${side.accent}0c`,
              border: `1px solid ${side.soft}25`,
              opacity: fill,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: side.id === "left" ? 9 : "auto",
                right: side.id === "right" ? 9 : "auto",
                top: 6,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: side.soft,
                boxShadow: `0 0 10px ${side.soft}`,
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

const SummaryRing: React.FC<{
  readonly frame: number;
  readonly side: Side;
}> = ({ frame, side }) => {
  const reveal = phase(frame, side.start + 280, side.start + 348);
  const ring = phase(frame, side.start + 324, side.start + 442);
  const radius = 51;
  const circumference = TAU * radius;
  const amount = side.ringValue * ring;
  const angle = -Math.PI / 2 + amount * TAU;
  const dotX = 65 + Math.cos(angle) * radius;
  const dotY = 65 + Math.sin(angle) * radius;

  return (
    <div
      style={{
        position: "relative",
        width: 130,
        height: 130,
        borderRadius: "50%",
        opacity: reveal,
        transform: `scale(${0.82 + reveal * 0.18})`,
        background: `radial-gradient(circle, ${side.accent}11, rgba(3,6,18,0.42) 66%)`,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: `inset 0 0 26px ${side.accent}12`,
      }}
    >
      <svg width={130} height={130} viewBox="0 0 130 130" aria-hidden>
        <defs>
          <linearGradient
            id={`summary-${side.id}`}
            x1="14"
            y1="65"
            x2="116"
            y2="65"
          >
            <stop offset="0%" stopColor={side.secondary} />
            <stop offset="100%" stopColor={side.accent} />
          </linearGradient>
        </defs>
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="9"
        />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={`url(#summary-${side.id})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - amount)}
          transform="rotate(-90 65 65)"
        />
        {ring > 0.02 ? (
          <>
            <circle
              cx={dotX}
              cy={dotY}
              r="10"
              fill={side.accent}
              opacity="0.16"
            />
            <circle cx={dotX} cy={dotY} r="4" fill="#ffffff" />
          </>
        ) : null}
        <path
          d={
            side.id === "left"
              ? "M45 71L58 58L67 66L87 45"
              : "M43 48H87M43 65H79M43 82H70"
          }
          fill="none"
          stroke={side.soft}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={ring}
        />
      </svg>
    </div>
  );
};

const EmptySummarySlots: React.FC<{
  readonly frame: number;
  readonly side: Side;
}> = ({ frame, side }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      flex: 1,
    }}
  >
    {[0, 1].map((index) => {
      const reveal = phase(
        frame,
        side.start + 316 + index * 34,
        side.start + 380 + index * 34,
      );
      return (
        <div
          key={index}
          style={{
            position: "relative",
            height: 58,
            borderRadius: 16,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))",
            border: "1px solid rgba(255,255,255,0.08)",
            opacity: reveal,
            transform: `translateY(${(1 - reveal) * 12}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 14,
            }}
          >
            <CornerGuides color={side.soft} opacity={0.18 * reveal} size={11} />
            <div
              style={{
                position: "absolute",
                left: side.id === "left" ? 12 : "auto",
                right: side.id === "right" ? 12 : "auto",
                top: 13,
                width: 38 + index * 16,
                height: 3,
                borderRadius: 3,
                background: `linear-gradient(90deg, ${side.accent}, ${side.secondary})`,
                opacity: 0.38,
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

const ComparisonPanel: React.FC<{
  readonly frame: number;
  readonly side: Side;
}> = ({ frame, side }) => {
  const reveal = phase(frame, side.start, side.start + 82);
  const enter = side.id === "left" ? -90 : 90;
  const innerRadius =
    side.id === "left"
      ? "38px 104px 38px 38px"
      : "104px 38px 38px 38px";

  return (
    <div
      style={{
        position: "absolute",
        left: side.x,
        top: 180,
        width: 620,
        height: 700,
        opacity: reveal,
        transform: `translate3d(${(1 - reveal) * enter}px, ${(1 - reveal) * 20}px, 0) scale(${0.92 + reveal * 0.08})`,
        transformOrigin:
          side.id === "left" ? "100% 50%" : "0% 50%",
        zIndex: 12,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: innerRadius,
          background: `linear-gradient(${side.id === "left" ? 135 : 225}deg, rgba(255,255,255,0.16), ${side.accent}1e 26%, rgba(18,23,50,0.59) 69%, ${side.secondary}12)`,
          border: "1px solid rgba(255,255,255,0.21)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 ${side.accent}22, 0 32px 84px rgba(0,0,0,0.35), 0 0 45px ${side.accent}10`,
          backdropFilter: "blur(28px) saturate(138%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: side.id === "left" ? -120 : "auto",
            right: side.id === "right" ? -120 : "auto",
            top: -100,
            width: 430,
            height: 430,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${side.accent}29, transparent 68%)`,
            filter: "blur(12px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 62,
            right: 62,
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
            inset: 12,
            borderRadius: innerRadius,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "36px 38px",
        }}
      >
        <EmptyPanelHeader frame={frame} side={side} />
        <MetricRows frame={frame} side={side} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 22,
          }}
        >
          <SummaryRing frame={frame} side={side} />
          <EmptySummarySlots frame={frame} side={side} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: side.id === "left" ? "auto" : -23,
          right: side.id === "left" ? -23 : "auto",
          top: 314,
          width: 46,
          height: 72,
          borderRadius: 22,
          background: `linear-gradient(180deg, ${side.soft}, ${side.accent})`,
          border: "2px solid rgba(255,255,255,0.66)",
          boxShadow: `0 0 0 8px ${side.accent}10, 0 12px 28px ${side.accent}42`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 15,
            top: 28,
            width: 12,
            height: 12,
            borderRadius: side.id === "left" ? "50%" : 3,
            background: "#07101b",
          }}
        />
      </div>
    </div>
  );
};

const ConnectorField: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const leftProgress = phase(frame, 350, 540);
  const rightProgress = phase(frame, 430, 580);
  const active = phase(frame, 565, 640);
  const pulseTravel = frame < 580 ? 0 : ((frame - 580) % 130) / 130;
  const pulseLeftX = 740 + (960 - 740) * pulseTravel;
  const pulseRightX = 1180 - (1180 - 960) * pulseTravel;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 8 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="leftFlow" x1="740" y1="530" x2="960" y2="530">
          <stop offset="0%" stopColor="#39d9ff" />
          <stop offset="100%" stopColor="#7eeac8" />
        </linearGradient>
        <linearGradient id="rightFlow" x1="1180" y1="550" x2="960" y2="550">
          <stop offset="0%" stopColor="#ff68b5" />
          <stop offset="100%" stopColor="#7eeac8" />
        </linearGradient>
        <filter id="flowGlow" x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[434, 540, 646].map((y, index) => {
        const delay = index * 0.08;
        const left = clamp((leftProgress - delay) / (1 - delay));
        const right = clamp((rightProgress - delay) / (1 - delay));
        const centerY = 540 + (index - 1) * 24;
        return (
          <React.Fragment key={y}>
            <path
              d={`M740 ${y} C820 ${y} 850 ${centerY} 960 ${centerY}`}
              fill="none"
              stroke="rgba(255,255,255,0.065)"
              strokeWidth="2"
            />
            <path
              d={`M740 ${y} C820 ${y} 850 ${centerY} 960 ${centerY}`}
              fill="none"
              stroke="url(#leftFlow)"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - left}
              filter="url(#flowGlow)"
            />
            <path
              d={`M1180 ${y} C1100 ${y} 1070 ${centerY} 960 ${centerY}`}
              fill="none"
              stroke="rgba(255,255,255,0.065)"
              strokeWidth="2"
            />
            <path
              d={`M1180 ${y} C1100 ${y} 1070 ${centerY} 960 ${centerY}`}
              fill="none"
              stroke="url(#rightFlow)"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - right}
              filter="url(#flowGlow)"
            />
          </React.Fragment>
        );
      })}
      {frame >= 580 && active > 0 ? (
        <>
          <circle
            cx={pulseLeftX}
            cy="540"
            r="11"
            fill="#39d9ff"
            opacity={0.12 * active}
          />
          <circle
            cx={pulseLeftX}
            cy="540"
            r="3.8"
            fill="#ffffff"
            opacity={active}
          />
          <circle
            cx={pulseRightX}
            cy="540"
            r="11"
            fill="#ff68b5"
            opacity={0.12 * active}
          />
          <circle
            cx={pulseRightX}
            cy="540"
            r="3.8"
            fill="#ffffff"
            opacity={active}
          />
        </>
      ) : null}
    </svg>
  );
};

const DecisionHub: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(
    frame,
    500,
    590,
    Easing.out(Easing.back(1.18)),
  );
  const orbit = phase(frame, 540, 650);
  const resolved = phase(
    frame,
    620,
    700,
    Easing.out(Easing.back(1.22)),
  );
  const pulse = resolved * (0.84 + Math.sin(frame / 22) * 0.16);
  const radius = 94;
  const circumference = TAU * radius;

  return (
    <div
      style={{
        position: "absolute",
        left: 820,
        top: 390,
        width: 280,
        height: 300,
        opacity: reveal,
        transform: `scale(${0.72 + reveal * 0.28})`,
        zIndex: 22,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 30,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 30%, rgba(255,255,255,0.22), rgba(117,235,199,0.11) 38%, rgba(12,17,39,0.74) 70%)",
          border: "1px solid rgba(255,255,255,0.24)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 42px rgba(119,235,201,0.09), 0 26px 70px rgba(0,0,0,0.42), 0 0 60px rgba(119,235,201,0.1)",
          backdropFilter: "blur(30px) saturate(142%)",
        }}
      />
      <svg
        width={280}
        height={300}
        viewBox="0 0 280 300"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="hubRing" x1="46" y1="150" x2="234" y2="150">
            <stop offset="0%" stopColor="#39d9ff" />
            <stop offset="48%" stopColor="#7eeac8" />
            <stop offset="100%" stopColor="#ff68b5" />
          </linearGradient>
          <linearGradient id="hubDiamond" x1="102" y1="112" x2="178" y2="188">
            <stop offset="0%" stopColor="#caffef" />
            <stop offset="100%" stopColor="#69ddb7" />
          </linearGradient>
          <filter id="hubGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="140"
          cy="150"
          r="112"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.4"
          strokeDasharray="4 9"
          transform={`rotate(${frame * 0.1} 140 150)`}
        />
        <circle
          cx="140"
          cy="150"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.065)"
          strokeWidth="6"
        />
        <circle
          cx="140"
          cy="150"
          r={radius}
          fill="none"
          stroke="url(#hubRing)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - orbit)}
          transform="rotate(-90 140 150)"
          filter="url(#hubGlow)"
        />
        <path
          d="M140 103L187 150L140 197L93 150Z"
          fill="url(#hubDiamond)"
          fillOpacity={0.11 + resolved * 0.18}
          stroke="#9ff0d5"
          strokeWidth="2.2"
          opacity={orbit}
          transform={`rotate(${resolved * 45} 140 150)`}
          filter="url(#hubGlow)"
        />
        <path
          d="M114 151L132 169L169 128"
          fill="none"
          stroke="#c8ffed"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - resolved}
          filter="url(#hubGlow)"
        />
        <circle
          cx="140"
          cy="150"
          r={34 + pulse * 10}
          fill="none"
          stroke="#83eac9"
          strokeWidth="1.5"
          opacity={0.18 * resolved}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: -5,
          top: 130,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "linear-gradient(145deg, #9eeeff, #39d9ff)",
          border: "2px solid rgba(255,255,255,0.72)",
          boxShadow: "0 0 24px rgba(57,217,255,0.42)",
          opacity: orbit,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 13,
            borderRadius: "50%",
            background: "#07101b",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: -5,
          top: 130,
          width: 40,
          height: 40,
          borderRadius: 11,
          background: "linear-gradient(145deg, #ffc1dd, #ff68b5)",
          border: "2px solid rgba(255,255,255,0.72)",
          boxShadow: "0 0 24px rgba(255,104,181,0.42)",
          opacity: orbit,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 13,
            borderRadius: 3,
            background: "#07101b",
          }}
        />
      </div>
    </div>
  );
};

const EmptyDecisionTray: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(
    frame,
    660,
    730,
    Easing.out(Easing.back(1.12)),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 724,
        top: 820,
        width: 472,
        height: 104,
        borderRadius: 28,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 18}px)`,
        zIndex: 24,
        background:
          "linear-gradient(145deg, rgba(126,234,200,0.105), rgba(255,255,255,0.02))",
        border: "1px solid rgba(135,241,208,0.2)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 38px rgba(110,232,193,0.08)",
        backdropFilter: "blur(20px) saturate(132%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 22,
          top: 22,
          width: 60,
          height: 60,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, rgba(139,245,211,0.25), rgba(91,218,179,0.1))",
          border: "1px solid rgba(139,245,211,0.56)",
          boxShadow: "0 0 28px rgba(113,235,196,0.17)",
        }}
      >
        <svg width={32} height={32} viewBox="0 0 32 32" aria-hidden>
          <path
            d="M7 16.5L13.2 22.5L25 10.5"
            fill="none"
            stroke="#b9ffe9"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 104,
          right: 24,
          top: 24,
          bottom: 24,
        }}
      >
        <CornerGuides color="#aef9e0" opacity={0.2 * reveal} />
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: 27,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(174,249,224,0.15), rgba(174,249,224,0.02))",
          }}
        />
      </div>
    </div>
  );
};

const MinimalFooter: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 105, 170);
  const complete = phase(frame, 650, 720);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 120,
          bottom: 72,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: reveal,
          zIndex: 30,
        }}
      >
        {[
          { color: "#39d9ff", start: 70, square: false },
          { color: "#7eeac8", start: 500, square: true },
          { color: "#ff68b5", start: 180, square: false },
        ].map((item, index) => {
          const active = phase(frame, item.start, item.start + 85);
          return (
            <React.Fragment key={item.color}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: item.square ? 2 : "50%",
                  background: item.color,
                  opacity: 0.34 + active * 0.66,
                  boxShadow: `0 0 ${10 + active * 9}px ${item.color}`,
                }}
              />
              {index < 2 ? (
                <div
                  style={{
                    width: 92,
                    height: 1,
                    background: `linear-gradient(90deg, ${item.color}66, rgba(255,255,255,0.04))`,
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
          right: 120,
          bottom: 66,
          width: 110,
          height: 22,
          borderRadius: 12,
          background:
            "linear-gradient(90deg, rgba(57,217,255,0.08), rgba(126,234,200,0.1), rgba(255,104,181,0.08))",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: reveal,
          zIndex: 30,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 6,
            top: 5,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: complete > 0.82 ? "#7eeac8" : "#ff9568",
            boxShadow:
              complete > 0.82
                ? "0 0 15px rgba(126,234,200,0.82)"
                : "0 0 15px rgba(255,149,104,0.82)",
          }}
        />
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = phase(frame, 0, 30, Easing.out(Easing.quad));
  const fadeOut =
    1 - phase(frame, 850, TOTAL_FRAMES - 1, Easing.in(Easing.quad));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02040a",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <Background frame={frame} />
        <EmptyTitleBay frame={frame} />
        <ConnectorField frame={frame} />
        {SIDES.map((side) => (
          <ComparisonPanel key={side.id} frame={frame} side={side} />
        ))}
        <DecisionHub frame={frame} />
        <EmptyDecisionTray frame={frame} />
        <MinimalFooter frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
