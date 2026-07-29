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
  const value = Math.sin(seed * 91.173 + 17.349) * 43758.5453;
  return value - Math.floor(value);
};

const MOTES = Array.from({ length: 64 }, (_, index) => ({
  x: seeded(index + 20) * WIDTH,
  y: seeded(index + 120) * HEIGHT,
  size: 1 + seeded(index + 220) * 2.6,
  opacity: 0.08 + seeded(index + 320) * 0.2,
  speed: 0.5 + seeded(index + 420) * 1.1,
  offset: seeded(index + 520) * TAU,
}));

const STREAMS = Array.from({ length: 7 }, (_, index) => ({
  y: 120 + seeded(index + 620) * 820,
  width: 160 + seeded(index + 720) * 280,
  speed: 0.55 + seeded(index + 820) * 0.7,
  offset: seeded(index + 920) * 2300,
}));

type Plan = {
  readonly id: "left" | "center" | "right";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly start: number;
  readonly accent: string;
  readonly secondary: string;
  readonly soft: string;
  readonly values: readonly number[];
  readonly premium: boolean;
};

const PLANS: readonly Plan[] = [
  {
    id: "left",
    x: 140,
    y: 210,
    width: 470,
    height: 700,
    start: 72,
    accent: "#38d7ff",
    secondary: "#477dff",
    soft: "#b9f4ff",
    values: [0.62, 0.48, 0.7, 0.42],
    premium: false,
  },
  {
    id: "center",
    x: 700,
    y: 170,
    width: 520,
    height: 770,
    start: 142,
    accent: "#a97cff",
    secondary: "#ffbd69",
    soft: "#eee0ff",
    values: [0.88, 0.8, 0.92, 0.76],
    premium: true,
  },
  {
    id: "right",
    x: 1310,
    y: 210,
    width: 470,
    height: 700,
    start: 212,
    accent: "#64e2b7",
    secondary: "#ff766d",
    soft: "#d4ffef",
    values: [0.74, 0.9, 0.68, 0.86],
    premium: false,
  },
];

const Background: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 42%, #1b2041 0%, #0b1027 37%, #050817 69%, #02040b 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.28,
        backgroundImage:
          "linear-gradient(rgba(177,192,255,0.052) 1px, transparent 1px), linear-gradient(90deg, rgba(177,192,255,0.052) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        backgroundPosition: `${(frame * 0.025) % 72}px ${(frame * 0.018) % 72}px`,
        maskImage:
          "radial-gradient(ellipse at 50% 48%, black 0%, rgba(0,0,0,0.86) 47%, transparent 90%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -250,
        top: 100,
        width: 900,
        height: 900,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(54,213,255,0.13), rgba(68,108,255,0.035) 53%, transparent 74%)",
        filter: "blur(54px)",
        opacity: 0.82 + Math.sin(frame / 130) * 0.04,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 520,
        top: -210,
        width: 900,
        height: 900,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(169,124,255,0.16), rgba(255,189,105,0.045) 51%, transparent 73%)",
        filter: "blur(58px)",
        opacity: 0.88 + Math.cos(frame / 145) * 0.04,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -250,
        top: 100,
        width: 900,
        height: 900,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(100,226,183,0.12), rgba(255,118,109,0.038) 53%, transparent 74%)",
        filter: "blur(54px)",
        opacity: 0.82 + Math.sin(frame / 138 + 1.4) * 0.04,
      }}
    />
    {STREAMS.map((stream, index) => {
      const x =
        ((frame * stream.speed * 1.45 + stream.offset) %
          (WIDTH + stream.width + 360)) -
        stream.width -
        180;
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
              "linear-gradient(90deg, transparent, rgba(189,204,255,0.92), transparent)",
            opacity: 0.035 + index * 0.006,
          }}
        />
      );
    })}
    {MOTES.map((mote, index) => {
      const drift = Math.sin(frame / (70 + mote.speed * 22) + mote.offset);
      const twinkle = 0.62 + Math.sin(frame / 46 + mote.offset) * 0.38;
      const color =
        index % 4 === 0
          ? "#48dcff"
          : index % 4 === 1
            ? "#b688ff"
            : index % 4 === 2
              ? "#ffbe72"
              : "#70e7be";
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: mote.x + drift * 4,
            top: mote.y + Math.cos(frame / 92 + mote.offset) * 5,
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
        inset: 34,
        borderRadius: 32,
        border: "1px solid rgba(218,228,255,0.046)",
      }}
    />
  </>
);

const CornerGuides: React.FC<{
  readonly color: string;
  readonly opacity: number;
  readonly size?: number;
}> = ({ color, opacity, size = 15 }) => (
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

const HeaderSlot: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 16, 72);
  const detail = phase(frame, 48, 112);

  return (
    <div
      style={{
        position: "absolute",
        left: 660,
        top: 58,
        width: 600,
        height: 82,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 18}px)`,
        zIndex: 40,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 26,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.018))",
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.15), 0 20px 60px rgba(0,0,0,0.18)",
          backdropFilter: "blur(22px) saturate(135%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "20px 28px",
        }}
      >
        <CornerGuides color="#d8e1ff" opacity={detail * 0.2} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -1,
            width: 148 * detail,
            height: 3,
            borderRadius: 4,
            transform: "translateX(-50%)",
            background:
              "linear-gradient(90deg, #38d7ff, #a97cff 48%, #ffbd69 68%, #64e2b7)",
            boxShadow: "0 0 20px rgba(172,148,255,0.36)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 58,
            right: 58,
            top: "50%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)",
            opacity: detail,
          }}
        />
      </div>
    </div>
  );
};

const PlanGlyph: React.FC<{
  readonly frame: number;
  readonly plan: Plan;
}> = ({ frame, plan }) => {
  const reveal = phase(frame, plan.start + 48, plan.start + 118);
  const ring = phase(frame, plan.start + 76, plan.start + 164);
  const radius = 39;
  const circumference = TAU * radius;
  const angle = -Math.PI / 2 + ring * TAU;
  const dotX = 49 + Math.cos(angle) * radius;
  const dotY = 49 + Math.sin(angle) * radius;

  return (
    <div
      style={{
        position: "relative",
        width: 98,
        height: 98,
        flex: "0 0 auto",
        borderRadius: "50%",
        opacity: reveal,
        transform: `scale(${0.76 + reveal * 0.24})`,
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.28), ${plan.accent}20 45%, rgba(4,7,19,0.6) 74%)`,
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: `inset 0 0 28px ${plan.accent}16, 0 0 28px ${plan.accent}18`,
      }}
    >
      <svg
        width={98}
        height={98}
        viewBox="0 0 98 98"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`plan-ring-${plan.id}`}
            x1="10"
            y1="49"
            x2="88"
            y2="49"
          >
            <stop offset="0%" stopColor={plan.secondary} />
            <stop offset="100%" stopColor={plan.accent} />
          </linearGradient>
          <filter
            id={`plan-glow-${plan.id}`}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="49"
          cy="49"
          r="44"
          fill="none"
          stroke="rgba(255,255,255,0.11)"
          strokeWidth="1.2"
          strokeDasharray="3 7"
          transform={`rotate(${frame * (plan.id === "right" ? -0.14 : 0.14)} 49 49)`}
        />
        <circle
          cx="49"
          cy="49"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="4"
        />
        <circle
          cx="49"
          cy="49"
          r={radius}
          fill="none"
          stroke={`url(#plan-ring-${plan.id})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ring)}
          transform="rotate(-90 49 49)"
          filter={`url(#plan-glow-${plan.id})`}
        />
        {ring > 0.02 ? (
          <>
            <circle
              cx={dotX}
              cy={dotY}
              r="8"
              fill={plan.accent}
              opacity="0.14"
            />
            <circle cx={dotX} cy={dotY} r="3.2" fill="#ffffff" />
          </>
        ) : null}
        {plan.id === "left" ? (
          <path
            d="M49 30L66 59H32Z"
            fill={`${plan.accent}22`}
            stroke={plan.soft}
            strokeWidth="2.4"
            strokeLinejoin="round"
            opacity={ring}
          />
        ) : plan.id === "center" ? (
          <path
            d="M49 27L69 49L49 71L29 49Z"
            fill={`${plan.secondary}26`}
            stroke={plan.soft}
            strokeWidth="2.4"
            strokeLinejoin="round"
            opacity={ring}
          />
        ) : (
          <path
            d="M49 28L67 38V59L49 70L31 59V38Z"
            fill={`${plan.accent}22`}
            stroke={plan.soft}
            strokeWidth="2.4"
            strokeLinejoin="round"
            opacity={ring}
          />
        )}
      </svg>
    </div>
  );
};

const EmptyPlanHeader: React.FC<{
  readonly frame: number;
  readonly plan: Plan;
  readonly contentTop: number;
}> = ({ frame, plan, contentTop }) => {
  const reveal = phase(frame, plan.start + 54, plan.start + 124);
  const detail = phase(frame, plan.start + 100, plan.start + 166);

  return (
    <div
      style={{
        position: "absolute",
        left: 34,
        right: 34,
        top: contentTop,
        height: 98,
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      <PlanGlyph frame={frame} plan={plan} />
      <div
        style={{
          position: "relative",
          flex: 1,
          height: 86,
          borderRadius: 21,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 13}px)`,
          background:
            "linear-gradient(145deg, rgba(4,7,20,0.25), rgba(255,255,255,0.023))",
          border: "1px solid rgba(255,255,255,0.075)",
          boxShadow: "inset 0 1px 18px rgba(0,0,0,0.13)",
        }}
      >
        <div style={{ position: "absolute", inset: 17 }}>
          <CornerGuides color={plan.soft} opacity={detail * 0.22} size={13} />
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 13,
              width: 58 * detail,
              height: 3,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${plan.accent}, ${plan.secondary})`,
              boxShadow: `0 0 15px ${plan.accent}42`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 13,
              height: 1,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.09), transparent)",
              opacity: detail,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const PriceBay: React.FC<{
  readonly frame: number;
  readonly plan: Plan;
  readonly contentTop: number;
}> = ({ frame, plan, contentTop }) => {
  const reveal = phase(frame, plan.start + 122, plan.start + 202);
  const ring = phase(frame, plan.start + 164, plan.start + 270);
  const radius = 39;
  const circumference = TAU * radius;
  const amount = plan.values[0] * ring;
  const angle = -Math.PI / 2 + amount * TAU;
  const dotX = 51 + Math.cos(angle) * radius;
  const dotY = 51 + Math.sin(angle) * radius;

  return (
    <div
      style={{
        position: "absolute",
        left: 34,
        right: 34,
        top: contentTop + 118,
        height: 138,
        borderRadius: 26,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 17}px)`,
        background: `linear-gradient(145deg, ${plan.accent}12, rgba(255,255,255,0.026))`,
        border: `1px solid ${plan.soft}22`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.09), 0 0 30px ${plan.accent}08`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 17,
          top: 18,
          width: 102,
          height: 102,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${plan.accent}12, rgba(2,5,17,0.42) 68%)`,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <svg width={102} height={102} viewBox="0 0 102 102" aria-hidden>
          <defs>
            <linearGradient
              id={`price-ring-${plan.id}`}
              x1="12"
              y1="51"
              x2="90"
              y2="51"
            >
              <stop offset="0%" stopColor={plan.secondary} />
              <stop offset="100%" stopColor={plan.accent} />
            </linearGradient>
          </defs>
          <circle
            cx="51"
            cy="51"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.055)"
            strokeWidth="8"
          />
          <circle
            cx="51"
            cy="51"
            r={radius}
            fill="none"
            stroke={`url(#price-ring-${plan.id})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - amount)}
            transform="rotate(-90 51 51)"
          />
          {ring > 0.02 ? (
            <>
              <circle
                cx={dotX}
                cy={dotY}
                r="10"
                fill={plan.accent}
                opacity="0.14"
              />
              <circle cx={dotX} cy={dotY} r="3.6" fill="#ffffff" />
            </>
          ) : null}
          <path
            d={
              plan.id === "left"
                ? "M37 59L47 49L55 56L68 39"
                : plan.id === "center"
                  ? "M35 58L45 44L53 51L68 35"
                  : "M35 61L46 47L55 54L69 40"
            }
            fill="none"
            stroke={plan.soft}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={ring}
          />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 138,
          right: 18,
          top: 18,
          bottom: 18,
          borderRadius: 20,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.013))",
          border: "1px solid rgba(255,255,255,0.075)",
        }}
      >
        <div style={{ position: "absolute", inset: 18 }}>
          <CornerGuides color={plan.soft} opacity={ring * 0.2} size={14} />
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 23,
              width: 86 * ring,
              height: 4,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${plan.accent}, ${plan.secondary})`,
              boxShadow: `0 0 16px ${plan.accent}4d`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              bottom: 22,
              height: 1,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)",
              opacity: ring,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const FeatureRow: React.FC<{
  readonly frame: number;
  readonly plan: Plan;
  readonly contentTop: number;
  readonly index: number;
}> = ({ frame, plan, contentTop, index }) => {
  const reveal = phase(frame, 286 + index * 62, 352 + index * 62);
  const fill = phase(frame, 328 + index * 62, 420 + index * 62);
  const value = plan.values[index];
  const rowWidth = plan.width - 68;
  const lineWidth = (rowWidth - 92) * value * fill;
  const selected = plan.premium ? phase(frame, 626, 710) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 34,
        right: 34,
        top: contentTop + 280 + index * 68,
        height: 56,
        borderRadius: 17,
        opacity: reveal,
        transform: `translateX(${(1 - reveal) * (plan.id === "left" ? -18 : plan.id === "right" ? 18 : 0)}px)`,
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.068), rgba(255,255,255,0.017))",
        border: `1px solid rgba(255,255,255,${0.078 + selected * 0.055})`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 0 ${selected * 20}px ${plan.accent}10`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 13,
          width: 30,
          height: 30,
          borderRadius: index % 2 === 0 ? "50%" : 8,
          background: `${plan.accent}13`,
          border: `1px solid ${plan.soft}3c`,
          boxShadow: `0 0 14px ${plan.accent}1c`,
        }}
      >
        <svg width={30} height={30} viewBox="0 0 30 30" aria-hidden>
          <path
            d="M8 15.5L12.7 20L22 10"
            fill="none"
            stroke={plan.soft}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - fill}
          />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 58,
          right: 14,
          top: 14,
          bottom: 14,
          borderRadius: 11,
          background: "rgba(255,255,255,0.026)",
          border: "1px solid rgba(255,255,255,0.045)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: lineWidth,
            height: "100%",
            borderRadius: 11,
            background: `linear-gradient(90deg, ${plan.secondary}16, ${plan.accent}24, ${plan.soft}12)`,
            borderRight: fill > 0.02 ? `1px solid ${plan.soft}48` : undefined,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: "50%",
            height: 1,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
            opacity: reveal * 0.76,
          }}
        />
        {fill > 0.02 ? (
          <div
            style={{
              position: "absolute",
              left: Math.max(0, lineWidth - 5),
              top: 9,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: `0 0 11px ${plan.soft}`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

const EmptyActionSlot: React.FC<{
  readonly frame: number;
  readonly plan: Plan;
  readonly contentTop: number;
}> = ({ frame, plan, contentTop }) => {
  const reveal = phase(frame, 538 + (plan.id === "center" ? 0 : 34), 628);
  const selected = plan.premium ? phase(frame, 628, 714) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 34,
        right: 34,
        top: contentTop + 592,
        height: 70,
        borderRadius: 22,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 14}px)`,
        background: plan.premium
          ? `linear-gradient(90deg, ${plan.accent}${selected > 0.2 ? "31" : "17"}, ${plan.secondary}${selected > 0.2 ? "2d" : "15"})`
          : `linear-gradient(90deg, ${plan.accent}12, ${plan.secondary}0d)`,
        border: `1px solid ${plan.soft}${plan.premium ? "45" : "22"}`,
        boxShadow: plan.premium
          ? `inset 0 1px 0 rgba(255,255,255,0.16), 0 0 ${18 + selected * 22}px ${plan.accent}20`
          : "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: 19,
          bottom: 19,
        }}
      >
        <CornerGuides color={plan.soft} opacity={reveal * 0.22} size={12} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 15,
            width: (plan.premium ? 82 : 56) * reveal,
            height: 2,
            transform: "translateX(-50%)",
            borderRadius: 3,
            background: `linear-gradient(90deg, transparent, ${plan.soft}, transparent)`,
            opacity: plan.premium ? 0.72 + selected * 0.28 : 0.44,
          }}
        />
      </div>
    </div>
  );
};

const PremiumCrest: React.FC<{
  readonly frame: number;
  readonly plan: Plan;
}> = ({ frame, plan }) => {
  const reveal = phase(
    frame,
    plan.start + 28,
    plan.start + 106,
    Easing.out(Easing.back(1.2)),
  );
  const resolved = phase(frame, 628, 716);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: -31,
        width: 86,
        height: 62,
        transform: `translateX(-50%) scale(${0.66 + reveal * 0.34})`,
        opacity: reveal,
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 0,
          width: 62,
          height: 62,
          borderRadius: 20,
          transform: "rotate(45deg)",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.32), rgba(169,124,255,0.24) 45%, rgba(255,189,105,0.18))",
          border: "1px solid rgba(255,255,255,0.42)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.38), 0 0 ${25 + resolved * 25}px rgba(177,133,255,${0.24 + resolved * 0.12})`,
          backdropFilter: "blur(18px)",
        }}
      />
      <svg
        width={86}
        height={62}
        viewBox="0 0 86 62"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <path
          d="M43 13L60 31L43 49L26 31Z"
          fill="rgba(255,189,105,0.2)"
          stroke="#f2e5ff"
          strokeWidth="2.2"
          opacity={reveal}
        />
        <circle
          cx="43"
          cy="31"
          r={8 + resolved * 5}
          fill="none"
          stroke="#ffd79a"
          strokeWidth="1.4"
          opacity={resolved * 0.5}
        />
      </svg>
    </div>
  );
};

const PlanCard: React.FC<{
  readonly frame: number;
  readonly plan: Plan;
}> = ({ frame, plan }) => {
  const reveal = phase(
    frame,
    plan.start,
    plan.start + 88,
    Easing.out(Easing.back(1.08)),
  );
  const selected = plan.premium ? phase(frame, 620, 712) : 0;
  const contentTop = plan.premium ? 74 : 34;
  const enterX =
    plan.id === "left" ? -74 : plan.id === "right" ? 74 : 0;
  const radius = plan.premium ? 42 : 36;

  return (
    <div
      style={{
        position: "absolute",
        left: plan.x,
        top: plan.y,
        width: plan.width,
        height: plan.height,
        opacity: reveal,
        transform: `translate3d(${(1 - reveal) * enterX}px, ${(1 - reveal) * 52 - selected * 8}px, 0) scale(${0.9 + reveal * 0.1 + selected * 0.012})`,
        transformOrigin: "50% 100%",
        zIndex: plan.premium ? 18 : 12,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: plan.premium
            ? `linear-gradient(145deg, rgba(255,255,255,${0.17 + selected * 0.035}), ${plan.accent}25 26%, rgba(21,24,54,0.63) 64%, ${plan.secondary}16)`
            : `linear-gradient(${plan.id === "left" ? 135 : 225}deg, rgba(255,255,255,0.135), ${plan.accent}1b 26%, rgba(15,21,46,0.61) 68%, ${plan.secondary}0e)`,
          border: plan.premium
            ? `1px solid rgba(238,224,255,${0.34 + selected * 0.18})`
            : "1px solid rgba(255,255,255,0.19)",
          boxShadow: plan.premium
            ? `inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 ${plan.secondary}28, 0 40px 105px rgba(0,0,0,0.42), 0 0 ${52 + selected * 38}px ${plan.accent}${selected > 0.2 ? "27" : "15"}`
            : `inset 0 1px 0 rgba(255,255,255,0.23), inset 0 -1px 0 ${plan.accent}1e, 0 32px 86px rgba(0,0,0,0.35), 0 0 42px ${plan.accent}0e`,
          backdropFilter: "blur(30px) saturate(142%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: plan.id === "right" ? "auto" : -120,
            right: plan.id === "right" ? -120 : "auto",
            top: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${plan.accent}2b, transparent 68%)`,
            filter: "blur(14px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: plan.premium ? -100 : -150,
            bottom: plan.premium ? -100 : -150,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${plan.secondary}${plan.premium ? "20" : "12"}, transparent 70%)`,
            filter: "blur(18px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 48,
            right: 48,
            top: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.74), transparent)",
            opacity: plan.premium ? 0.72 : 0.48,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: radius - 8,
            border: `1px solid rgba(255,255,255,${plan.premium ? 0.067 : 0.045})`,
          }}
        />
      </div>
      {plan.premium ? <PremiumCrest frame={frame} plan={plan} /> : null}
      <EmptyPlanHeader
        frame={frame}
        plan={plan}
        contentTop={contentTop}
      />
      <PriceBay frame={frame} plan={plan} contentTop={contentTop} />
      {[0, 1, 2, 3].map((index) => (
        <FeatureRow
          key={index}
          frame={frame}
          plan={plan}
          contentTop={contentTop}
          index={index}
        />
      ))}
      <EmptyActionSlot
        frame={frame}
        plan={plan}
        contentTop={contentTop}
      />
    </div>
  );
};

const ComparisonConnectors: React.FC<{ readonly frame: number }> = ({
  frame,
}) => {
  const reveal = phase(frame, 322, 448);
  const resolve = phase(frame, 600, 692);
  const pulseTravel = frame < 456 ? 0 : ((frame - 456) % 136) / 136;
  const rowYs = [552, 620, 688, 756];

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 9 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="connector-left" x1="610" y1="0" x2="700" y2="0">
          <stop offset="0%" stopColor="#38d7ff" />
          <stop offset="100%" stopColor="#a97cff" />
        </linearGradient>
        <linearGradient id="connector-right" x1="1220" y1="0" x2="1310" y2="0">
          <stop offset="0%" stopColor="#ffbd69" />
          <stop offset="100%" stopColor="#64e2b7" />
        </linearGradient>
        <filter id="connector-glow" x="-100%" y="-300%" width="300%" height="700%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {rowYs.map((y, index) => {
        const local = Math.max(0, Math.min(1, (reveal - index * 0.08) / 0.76));
        const leftPulseX = 610 + 90 * pulseTravel;
        const rightPulseX = 1310 - 90 * pulseTravel;
        return (
          <React.Fragment key={y}>
            <path
              d={`M610 ${y} C645 ${y} 665 ${y} 700 ${y}`}
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="2"
            />
            <path
              d={`M610 ${y} C645 ${y} 665 ${y} 700 ${y}`}
              fill="none"
              stroke="url(#connector-left)"
              strokeWidth="2.4"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - local}
              filter="url(#connector-glow)"
            />
            <path
              d={`M1220 ${y} C1255 ${y} 1275 ${y} 1310 ${y}`}
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="2"
            />
            <path
              d={`M1220 ${y} C1255 ${y} 1275 ${y} 1310 ${y}`}
              fill="none"
              stroke="url(#connector-right)"
              strokeWidth="2.4"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - local}
              filter="url(#connector-glow)"
            />
            {frame >= 456 && local > 0.98 ? (
              <>
                <circle
                  cx={leftPulseX}
                  cy={y}
                  r="8"
                  fill="#8f8dff"
                  opacity={0.1 + resolve * 0.08}
                />
                <circle
                  cx={leftPulseX}
                  cy={y}
                  r="2.8"
                  fill="#ffffff"
                  opacity={0.6 + resolve * 0.4}
                />
                <circle
                  cx={rightPulseX}
                  cy={y}
                  r="8"
                  fill="#ffd078"
                  opacity={0.1 + resolve * 0.08}
                />
                <circle
                  cx={rightPulseX}
                  cy={y}
                  r="2.8"
                  fill="#ffffff"
                  opacity={0.6 + resolve * 0.4}
                />
              </>
            ) : null}
          </React.Fragment>
        );
      })}
    </svg>
  );
};

const PremiumSelection: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(
    frame,
    612,
    712,
    Easing.out(Easing.back(1.12)),
  );
  const ray = phase(frame, 650, 742);
  const radius = 288;
  const circumference = TAU * radius;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, zIndex: 10 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="selection-ring" x1="672" y1="540" x2="1248" y2="540">
          <stop offset="0%" stopColor="#a97cff" stopOpacity="0" />
          <stop offset="28%" stopColor="#a97cff" />
          <stop offset="66%" stopColor="#ffbd69" />
          <stop offset="100%" stopColor="#ffbd69" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="selection-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c29cff" stopOpacity="0.09" />
          <stop offset="72%" stopColor="#ffbd69" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#ffbd69" stopOpacity="0" />
        </radialGradient>
        <filter id="selection-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse
        cx="960"
        cy="554"
        rx="330"
        ry="402"
        fill="url(#selection-fill)"
        opacity={reveal}
      />
      <circle
        cx="960"
        cy="554"
        r={radius}
        fill="none"
        stroke="url(#selection-ring)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - reveal)}
        transform="rotate(-90 960 554)"
        filter="url(#selection-glow)"
      />
      <circle
        cx="960"
        cy="554"
        r={radius + 30}
        fill="none"
        stroke="rgba(227,211,255,0.11)"
        strokeWidth="1.2"
        strokeDasharray="5 13"
        opacity={ray * 0.8}
        transform={`rotate(${frame * 0.085} 960 554)`}
      />
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = -Math.PI / 2 + (index / 6) * TAU + frame * 0.0012;
        const distance = radius + 30;
        return (
          <circle
            key={index}
            cx={960 + Math.cos(angle) * distance}
            cy={554 + Math.sin(angle) * distance}
            r={index % 2 === 0 ? 4 : 2.5}
            fill={index % 2 === 0 ? "#caa9ff" : "#ffd18a"}
            opacity={ray * 0.72}
            filter="url(#selection-glow)"
          />
        );
      })}
    </svg>
  );
};

const FooterRail: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 118, 184);
  const resolved = phase(frame, 620, 716);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 182,
          bottom: 78,
          width: 1556,
          height: 24,
          opacity: reveal,
          zIndex: 34,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 11,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(56,215,255,0.5), rgba(169,124,255,0.32) 50%, rgba(100,226,183,0.5))",
            transform: `scaleX(${reveal})`,
            transformOrigin: "50% 50%",
          }}
        />
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            style={{
              position: "absolute",
              left: plan.x + plan.width / 2 - 182 - 7,
              top: 5,
              width: 14,
              height: 14,
              borderRadius: plan.premium ? 3 : "50%",
              transform: plan.premium ? "rotate(45deg)" : undefined,
              background: plan.premium
                ? `linear-gradient(145deg, ${plan.accent}, ${plan.secondary})`
                : plan.accent,
              border: "2px solid rgba(255,255,255,0.7)",
              boxShadow: `0 0 ${plan.premium ? 18 + resolved * 12 : 16}px ${plan.accent}`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 874,
          bottom: 55,
          width: 172,
          height: 68,
          borderRadius: 22,
          opacity: resolved,
          transform: `translateY(${(1 - resolved) * 13}px)`,
          zIndex: 36,
          background:
            "linear-gradient(145deg, rgba(184,143,255,0.15), rgba(255,189,105,0.095))",
          border: "1px solid rgba(239,224,255,0.24)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.14), 0 0 30px rgba(177,130,255,0.11)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div style={{ position: "absolute", inset: 18 }}>
          <CornerGuides color="#f1e4ff" opacity={resolved * 0.22} size={11} />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 15,
              width: 52,
              height: 2,
              transform: "translateX(-50%)",
              background:
                "linear-gradient(90deg, transparent, #f4e9ff, transparent)",
              opacity: resolved * 0.68,
            }}
          />
        </div>
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
        <HeaderSlot frame={frame} />
        <ComparisonConnectors frame={frame} />
        <PremiumSelection frame={frame} />
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} frame={frame} plan={plan} />
        ))}
        <FooterRail frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
