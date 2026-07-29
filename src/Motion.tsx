import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Standalone composition: Glassmorphism Business Growth Pyramid.
const WIDTH = 1920;
const HEIGHT = 1080;
const TAU = Math.PI * 2;

const COLORS = {
  background: "#07101F",
  backgroundDeep: "#030713",
  panel: "#101B31",
  white: "#F6FAFF",
  softWhite: "#C7D6ED",
  muted: "#7890B1",
  amber: "#FFB84D",
  coral: "#FF667A",
  violet: "#B68CFF",
  blue: "#5B94FF",
  cyan: "#37E6D3",
  mint: "#74F3C7",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const modulo = (value: number, length = 1) =>
  ((value % length) + length) % length;

const segment = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 91.177 + 13.831) * 43758.5453;
  return value - Math.floor(value);
};

type TierSpec = {
  readonly id: string;
  readonly number: string;
  readonly label: string;
  readonly descriptor: string;
  readonly metric: number;
  readonly color: string;
  readonly start: number;
  readonly rowStart: number;
  readonly top: number;
  readonly topWidth: number;
  readonly width: number;
  readonly depth: number;
  readonly thickness: number;
};

const TIERS: readonly TierSpec[] = [
  {
    id: "vision",
    number: "01",
    label: "VISION",
    descriptor: "NORTH STAR",
    metric: 10,
    color: COLORS.amber,
    start: 40,
    rowStart: 176,
    top: 166,
    topWidth: 88,
    width: 176,
    depth: 18,
    thickness: 72,
  },
  {
    id: "strategy",
    number: "02",
    label: "STRATEGY",
    descriptor: "PRIORITIES",
    metric: 25,
    color: COLORS.coral,
    start: 96,
    rowStart: 232,
    top: 274,
    topWidth: 176,
    width: 286,
    depth: 20,
    thickness: 72,
  },
  {
    id: "systems",
    number: "03",
    label: "SYSTEMS",
    descriptor: "SCALABLE DESIGN",
    metric: 45,
    color: COLORS.violet,
    start: 152,
    rowStart: 288,
    top: 382,
    topWidth: 286,
    width: 408,
    depth: 22,
    thickness: 72,
  },
  {
    id: "people",
    number: "04",
    label: "PEOPLE",
    descriptor: "ALIGNED TEAMS",
    metric: 70,
    color: COLORS.blue,
    start: 208,
    rowStart: 344,
    top: 490,
    topWidth: 408,
    width: 544,
    depth: 24,
    thickness: 74,
  },
  {
    id: "execution",
    number: "05",
    label: "EXECUTION",
    descriptor: "MEASURABLE RESULTS",
    metric: 100,
    color: COLORS.cyan,
    start: 264,
    rowStart: 400,
    top: 600,
    topWidth: 544,
    width: 694,
    depth: 26,
    thickness: 78,
  },
] as const;

const PARTICLES = Array.from({ length: 58 }, (_, index) => ({
  x: hash01(index * 7 + 2) * WIDTH,
  y: hash01(index * 11 + 5) * HEIGHT,
  radius: 1.2 + hash01(index * 13 + 8) * 2.6,
  opacity: 0.08 + hash01(index * 17 + 4) * 0.22,
  drift: 7 + hash01(index * 19 + 1) * 18,
  phase: hash01(index * 23 + 9),
}));

const Background: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const intro = segment(frame, 0, 65, Easing.out(Easing.cubic));
  const sweepY = modulo(time * 78, HEIGHT + 500) - 250;
  const gridX = modulo(time * 7, 78);
  const gridY = modulo(time * 3.6, 78);
  const pulse = 0.5 + Math.sin(time * TAU * 0.16) * 0.5;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(140deg, #08172c 0%, #080d1d 47%, #130c28 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: intro,
          background:
            "radial-gradient(circle at 25% 46%, rgba(42,121,255,.34) 0%, rgba(20,52,112,.12) 35%, transparent 62%), radial-gradient(circle at 78% 28%, rgba(164,85,255,.27) 0%, rgba(89,35,143,.1) 36%, transparent 62%), radial-gradient(circle at 67% 88%, rgba(27,226,201,.16) 0%, transparent 54%)",
        }}
      />

      <AbsoluteFill
        style={{
          opacity: 0.23 * intro,
          backgroundImage:
            "linear-gradient(rgba(165,198,255,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(165,198,255,.13) 1px, transparent 1px)",
          backgroundSize: "78px 78px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage:
            "radial-gradient(ellipse at 52% 54%, #000 0%, rgba(0,0,0,.72) 47%, transparent 84%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: -350,
          top: -290,
          borderRadius: "50%",
          border: "1px solid rgba(105,170,255,.13)",
          boxShadow:
            "0 0 0 94px rgba(84,143,255,.025), 0 0 0 220px rgba(84,143,255,.018)",
          transform: `rotate(${time * 1.25}deg)`,
          opacity: intro,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: "50%",
            left: "77%",
            top: "12%",
            background: COLORS.blue,
            boxShadow: `0 0 24px ${COLORS.blue}`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          width: 920,
          height: 920,
          right: -290,
          bottom: -390,
          borderRadius: "50%",
          border: "1px solid rgba(190,134,255,.13)",
          transform: `rotate(${-time * 1.45}deg)`,
          opacity: intro,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            borderRadius: "50%",
            left: "18%",
            top: "7%",
            background: COLORS.violet,
            boxShadow: `0 0 25px ${COLORS.violet}`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          height: 180,
          top: sweepY,
          transform: "rotate(-7deg)",
          opacity: (0.045 + pulse * 0.025) * intro,
          background:
            "linear-gradient(180deg, transparent, rgba(126,207,255,.55), transparent)",
          filter: "blur(34px)",
        }}
      />

      {PARTICLES.map((particle, index) => {
        const y =
          modulo(
            particle.y - time * particle.drift + particle.phase * HEIGHT * 0.35,
            HEIGHT + 80,
          ) - 40;
        const flicker =
          0.45 +
          0.55 * Math.sin(time * (0.7 + particle.phase) + particle.phase * TAU);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: particle.x,
              top: y,
              width: particle.radius * 2,
              height: particle.radius * 2,
              borderRadius: "50%",
              background:
                index % 4 === 0
                  ? COLORS.violet
                  : index % 3 === 0
                    ? COLORS.cyan
                    : "#B9D8FF",
              boxShadow: "0 0 12px currentColor",
              opacity: particle.opacity * flicker * intro,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          opacity: 0.22,
          background:
            "linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
          backgroundSize: "5px 100%",
          mixBlendMode: "soft-light",
        }}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const eyebrow = segment(frame, 10, 54, Easing.out(Easing.cubic));
  const title = segment(frame, 26, 82, Easing.out(Easing.cubic));
  const rule = segment(frame, 50, 112, Easing.inOut(Easing.cubic));
  const badge = segment(frame, 70, 126, Easing.out(Easing.cubic));

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 106,
          top: 66,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: eyebrow,
          transform: `translateY(${(1 - eyebrow) * 14}px)`,
        }}
      >
        <div
          style={{
            width: 34,
            height: 4,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.coral})`,
            boxShadow: `0 0 18px ${COLORS.coral}80`,
          }}
        />
        <div
          style={{
            color: COLORS.softWhite,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 5.5,
          }}
        >
          BUSINESS STRATEGY • FIVE-LEVEL MODEL
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 101,
          top: 98,
          overflow: "hidden",
          padding: "4px 6px 8px 4px",
        }}
      >
        <div
          style={{
            color: COLORS.white,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 62,
            fontWeight: 800,
            letterSpacing: -2.2,
            lineHeight: 1,
            opacity: title,
            transform: `translateY(${(1 - title) * 70}px)`,
            textShadow: "0 12px 34px rgba(0,0,0,.28)",
          }}
        >
          GROWTH PYRAMID
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 108,
          top: 177,
          width: 814 * rule,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(220,236,255,.48), rgba(220,236,255,.06))",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 106,
          top: 73,
          width: 274,
          height: 88,
          borderRadius: 22,
          border: "1px solid rgba(207,226,255,.21)",
          background:
            "linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.045))",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.18), 0 18px 46px rgba(0,0,0,.18)",
          backdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 16,
          opacity: badge,
          transform: `translateX(${(1 - badge) * 34}px)`,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, rgba(55,230,211,.34), rgba(91,148,255,.16))",
            border: "1px solid rgba(113,255,236,.34)",
            color: COLORS.cyan,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: 22,
            boxShadow: `0 0 28px ${COLORS.cyan}24`,
          }}
        >
          05
        </div>
        <div>
          <div
            style={{
              color: COLORS.white,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: 2.3,
            }}
          >
            FRAMEWORK
          </div>
          <div
            style={{
              color: COLORS.muted,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 2.1,
              marginTop: 6,
            }}
          >
            STRATEGIC STACK
          </div>
        </div>
      </div>
    </>
  );
};

const PyramidStage: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const enter = segment(frame, 24, 106, Easing.out(Easing.cubic));
  const complete = segment(frame, 430, 494, Easing.out(Easing.cubic));
  const orbit = time * 9;

  return (
    <>
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          opacity: enter,
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient
            id="pyramid-guide-left"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.36} />
            <stop offset="48%" stopColor={COLORS.violet} stopOpacity={0.16} />
            <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.42} />
          </linearGradient>
          <filter
            id="pyramid-guide-glow"
            x="-100%"
            y="-20%"
            width="300%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 555 144 L 195 724"
          fill="none"
          stroke="url(#pyramid-guide-left)"
          strokeWidth={1.2}
          strokeDasharray="3 13"
          strokeLinecap="round"
          filter="url(#pyramid-guide-glow)"
        />
        <path
          d="M 555 144 L 915 724"
          fill="none"
          stroke="url(#pyramid-guide-left)"
          strokeWidth={1.2}
          strokeDasharray="3 13"
          strokeLinecap="round"
          filter="url(#pyramid-guide-glow)"
        />
        <path
          d="M 195 724 L 915 724"
          fill="none"
          stroke={COLORS.cyan}
          strokeOpacity={0.18 + complete * 0.12}
          strokeWidth={1}
          strokeDasharray="7 12"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 113,
          top: 180,
          width: 55,
          height: 560,
          opacity: enter * 0.9,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 27,
            top: 30,
            bottom: 40,
            width: 1,
            background:
              "linear-gradient(180deg, rgba(255,184,77,.8), rgba(182,140,255,.42), rgba(55,230,211,.8))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -6,
            top: 229,
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            color: COLORS.muted,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 4,
            whiteSpace: "nowrap",
          }}
        >
          MATURITY LEVEL
        </div>
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          style={{ position: "absolute", left: 18, top: 12 }}
        >
          <path
            d="M4 12L10 6L16 12"
            fill="none"
            stroke={COLORS.amber}
            strokeWidth={2}
          />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          left: 198,
          top: 690,
          width: 714,
          height: 132,
          opacity: enter,
          transform: `scale(${0.88 + enter * 0.12})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "30px 35px 14px",
            borderRadius: "50%",
            border: "1px solid rgba(101,235,224,.17)",
            transform: `rotate(${orbit}deg)`,
            boxShadow:
              "0 0 0 18px rgba(69,142,255,.025), 0 0 78px rgba(45,208,210,.18)",
          }}
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                borderRadius: "50%",
                left: `${16 + index * 33}%`,
                top: index % 2 === 0 ? -4 : "calc(100% - 4px)",
                background: index === 1 ? COLORS.violet : COLORS.cyan,
                boxShadow: `0 0 17px ${
                  index === 1 ? COLORS.violet : COLORS.cyan
                }`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 78,
            right: 78,
            top: 61,
            height: 48,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(53,227,213,.22), rgba(67,117,255,.08) 48%, transparent 74%)",
            filter: "blur(12px)",
            opacity: 0.55 + complete * 0.35,
          }}
        />
      </div>
    </>
  );
};

const GlassTier: React.FC<{
  readonly tier: TierSpec;
  readonly index: number;
  readonly frame: number;
  readonly time: number;
  readonly fps: number;
}> = ({ tier, index, frame, time, fps }) => {
  const reveal = spring({
    frame: frame - tier.start,
    fps,
    config: {
      damping: 14,
      mass: 0.8,
      stiffness: 125,
    },
    durationInFrames: 58,
  });
  const opacity = segment(
    frame,
    tier.start,
    tier.start + 16,
    Easing.out(Easing.cubic),
  );
  const settled = segment(
    frame,
    tier.start + 28,
    tier.start + 60,
    Easing.out(Easing.cubic),
  );
  const float =
    settled * Math.sin(time * (0.72 + index * 0.04) + index * 1.23) * 1.6;
  const sweepX = modulo((frame - tier.start) * 2.7 + index * 108, 920) - 170;
  const glowPulse =
    0.72 + 0.28 * Math.sin(time * 1.35 + index * 0.8 + Math.PI * 0.25);

  const canvasWidth = 800;
  const canvasHeight = 150;
  const cx = canvasWidth / 2;
  const topY = 17;
  const frontY = topY + tier.depth;
  const bottomY = frontY + tier.thickness;
  const topHalf = tier.topWidth / 2;
  const frontTopWidth = tier.topWidth + tier.depth * 1.65;
  const frontTopHalf = frontTopWidth / 2;
  const bottomHalf = tier.width / 2;
  const labelY = frontY + tier.thickness * 0.54;
  const topPoints = `${cx - topHalf},${topY} ${cx + topHalf},${topY} ${
    cx + frontTopHalf
  },${frontY} ${cx - frontTopHalf},${frontY}`;
  const frontPoints = `${cx - frontTopHalf},${frontY} ${
    cx + frontTopHalf
  },${frontY} ${cx + bottomHalf},${bottomY} ${cx - bottomHalf},${bottomY}`;
  const leftBevel = `${cx - frontTopHalf},${frontY} ${
    cx - frontTopHalf + 13
  },${frontY} ${cx - bottomHalf + 16},${bottomY} ${cx - bottomHalf},${bottomY}`;
  const rightBevel = `${cx + frontTopHalf - 13},${frontY} ${
    cx + frontTopHalf
  },${frontY} ${cx + bottomHalf},${bottomY} ${cx + bottomHalf - 16},${bottomY}`;
  const silhouettePoints = `${cx - topHalf},${topY} ${
    cx + topHalf
  },${topY} ${cx + frontTopHalf},${frontY} ${
    cx + bottomHalf
  },${bottomY} ${cx - bottomHalf},${bottomY} ${cx - frontTopHalf},${frontY}`;
  const gradientId = `tier-gradient-${tier.id}`;
  const leftGradientId = `tier-left-${tier.id}`;
  const rightGradientId = `tier-right-${tier.id}`;
  const shineId = `tier-shine-${tier.id}`;
  const clipId = `tier-clip-${tier.id}`;
  const glowId = `tier-glow-${tier.id}`;

  return (
    <div
      style={{
        position: "absolute",
        left: 155,
        top: tier.top + float,
        width: canvasWidth,
        height: canvasHeight,
        opacity,
        transformOrigin: "50% 55%",
        transform: `translateY(${(1 - reveal) * -18}px) scaleX(${
          0.08 + reveal * 0.92
        }) scaleY(${0.1 + reveal * 0.9})`,
        filter: `drop-shadow(0 ${20 + index * 2}px ${
          22 + index * 2
        }px ${tier.color}22)`,
      }}
    >
      <svg
        width={canvasWidth}
        height={canvasHeight}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.54} />
            <stop offset="22%" stopColor={tier.color} stopOpacity={0.72} />
            <stop offset="76%" stopColor={tier.color} stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.14} />
          </linearGradient>
          <linearGradient
            id={leftGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={tier.color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={tier.color} stopOpacity={0.17} />
          </linearGradient>
          <linearGradient
            id={rightGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={tier.color} stopOpacity={0.33} />
            <stop offset="100%" stopColor="#020816" stopOpacity={0.48} />
          </linearGradient>
          <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="44%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.64} />
            <stop offset="56%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <clipPath id={clipId}>
            <polygon points={silhouettePoints} />
          </clipPath>
          <filter id={glowId} x="-60%" y="-80%" width="220%" height="260%">
            <feGaussianBlur stdDeviation={8 + glowPulse * 3} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <polygon
          points={topPoints}
          fill={`url(#${gradientId})`}
          stroke="#FFFFFF"
          strokeOpacity={0.56}
          strokeWidth={1.5}
          filter={`url(#${glowId})`}
        />
        <polygon
          points={topPoints}
          fill="none"
          stroke={tier.color}
          strokeOpacity={0.88}
          strokeWidth={2.1}
        />
        <polygon
          points={frontPoints}
          fill={`url(#${rightGradientId})`}
          stroke={tier.color}
          strokeOpacity={0.64}
          strokeWidth={1.7}
        />
        <polygon
          points={leftBevel}
          fill={`url(#${leftGradientId})`}
          stroke="#FFFFFF"
          strokeOpacity={0.2}
          strokeWidth={0.8}
        />
        <polygon
          points={rightBevel}
          fill="rgba(2,8,22,.34)"
          stroke={tier.color}
          strokeOpacity={0.28}
          strokeWidth={0.8}
        />

        {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
          const topX = cx + (ratio - 0.5) * frontTopWidth;
          const bottomX = cx + (ratio - 0.5) * tier.width;
          return (
            <line
              key={ratio}
              x1={topX}
              y1={frontY + 4}
              x2={bottomX}
              y2={bottomY - 3}
              stroke="#FFFFFF"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          );
        })}
        {[0.34, 0.68].map((ratio) => {
          const halfWidth = frontTopHalf + (bottomHalf - frontTopHalf) * ratio;
          const y = frontY + tier.thickness * ratio;
          return (
            <line
              key={ratio}
              x1={cx - halfWidth + 12}
              y1={y}
              x2={cx + halfWidth - 12}
              y2={y}
              stroke="#FFFFFF"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          );
        })}
        {[0.18, 0.5, 0.82].map((ratio) => (
          <line
            key={ratio}
            x1={cx + (ratio - 0.5) * tier.topWidth}
            y1={topY + 2}
            x2={cx + (ratio - 0.5) * frontTopWidth}
            y2={frontY - 2}
            stroke="#FFFFFF"
            strokeOpacity={0.16}
            strokeWidth={1}
          />
        ))}

        <rect
          x={sweepX}
          y={topY - 30}
          width={180}
          height={bottomY - topY + 60}
          fill={`url(#${shineId})`}
          clipPath={`url(#${clipId})`}
          transform={`rotate(-18 ${sweepX + 90} ${
            topY + (bottomY - topY) / 2
          })`}
          opacity={0.28 + glowPulse * 0.18}
        />

        <circle
          cx={cx - 47}
          cy={labelY}
          r={16}
          fill="rgba(5,12,28,.5)"
          stroke="#FFFFFF"
          strokeOpacity={0.4}
          strokeWidth={1}
        />
        <text
          x={cx - 47}
          y={labelY + 5}
          textAnchor="middle"
          fill={COLORS.white}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={13}
          fontWeight={900}
          letterSpacing={1}
        >
          {tier.number}
        </text>
        <text
          x={cx - 20}
          y={labelY + 5}
          textAnchor="start"
          fill={COLORS.white}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={14}
          fontWeight={800}
          letterSpacing={1.8}
        >
          {tier.label}
        </text>

        <line
          x1={cx - bottomHalf + 14}
          y1={bottomY - 1}
          x2={cx + bottomHalf - 14}
          y2={bottomY - 1}
          stroke="#FFFFFF"
          strokeOpacity={0.3}
          strokeWidth={1.1}
        />
      </svg>
    </div>
  );
};

const ConnectorLayer: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => (
  <svg
    width={WIDTH}
    height={HEIGHT}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      overflow: "visible",
    }}
  >
    <defs>
      {TIERS.map((tier) => (
        <filter
          key={tier.id}
          id={`connector-glow-${tier.id}`}
          x="-30%"
          y="-100%"
          width="160%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      ))}
    </defs>
    {TIERS.map((tier, index) => {
      const progress = segment(
        frame,
        tier.rowStart - 28,
        tier.rowStart + 18,
        Easing.inOut(Easing.cubic),
      );
      const startX = 555 + tier.width / 2 - 4;
      const startY = tier.top + 17 + tier.depth + tier.thickness * 0.55;
      const endX = 1078;
      const rowCenter = 271 + index * 115;
      const path = `M ${startX} ${startY} C ${startX + 92} ${startY}, ${
        endX - 100
      } ${rowCenter}, ${endX} ${rowCenter}`;
      const pathLength = 620;
      const dotX = startX + (endX - startX) * progress;
      const dotY = startY + (rowCenter - startY) * progress;
      return (
        <g key={tier.id} opacity={progress}>
          <path
            d={path}
            fill="none"
            stroke={tier.color}
            strokeOpacity={0.16}
            strokeWidth={7}
            filter={`url(#connector-glow-${tier.id})`}
          />
          <path
            d={path}
            fill="none"
            stroke={tier.color}
            strokeOpacity={0.68}
            strokeWidth={1.5}
            strokeDasharray="7 10"
            strokeDashoffset={-time * 24 - index * 7}
            pathLength={pathLength}
            strokeLinecap="round"
            style={{
              strokeDasharray: `${pathLength * progress} ${pathLength}`,
            }}
          />
          <circle
            cx={startX}
            cy={startY}
            r={4.5}
            fill={tier.color}
            stroke="#FFFFFF"
            strokeOpacity={0.55}
            strokeWidth={1}
          />
          {progress > 0.03 ? (
            <circle
              cx={dotX}
              cy={dotY}
              r={4 + Math.sin(time * 2.3 + index) * 0.8}
              fill={tier.color}
              filter={`url(#connector-glow-${tier.id})`}
            />
          ) : null}
        </g>
      );
    })}
  </svg>
);

const InsightRow: React.FC<{
  readonly tier: TierSpec;
  readonly index: number;
  readonly frame: number;
  readonly time: number;
}> = ({ tier, index, frame, time }) => {
  const enter = segment(
    frame,
    tier.rowStart,
    tier.rowStart + 42,
    Easing.out(Easing.cubic),
  );
  const fill = segment(
    frame,
    tier.rowStart + 14,
    tier.rowStart + 62,
    Easing.out(Easing.cubic),
  );
  const numberValue = Math.round(tier.metric * fill);
  const pulse = 0.55 + 0.45 * Math.sin(time * 2 + index * 0.7);
  const shimmer = modulo((frame - tier.rowStart) * 3.4, 880) - 190;

  return (
    <div
      style={{
        position: "absolute",
        left: 1092,
        top: 223 + index * 115,
        width: 720,
        height: 96,
        borderRadius: 24,
        overflow: "hidden",
        opacity: enter,
        transform: `translateX(${(1 - enter) * 46}px) scale(${
          0.97 + enter * 0.03
        })`,
        border: "1px solid rgba(213,229,255,.2)",
        background:
          "linear-gradient(115deg, rgba(255,255,255,.13), rgba(255,255,255,.055) 48%, rgba(255,255,255,.025))",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.17), 0 18px 45px rgba(0,0,0,.18), 0 0 42px ${tier.color}0d`,
        backdropFilter: "blur(21px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: shimmer,
          top: -50,
          width: 120,
          height: 210,
          transform: "rotate(17deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 19,
          width: 57,
          height: 57,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.white,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: 1,
          background: `linear-gradient(145deg, ${tier.color}66, ${tier.color}16)`,
          border: `1px solid ${tier.color}70`,
          boxShadow: `0 0 ${18 + pulse * 12}px ${tier.color}24`,
        }}
      >
        {tier.number}
      </div>

      <div
        style={{
          position: "absolute",
          left: 98,
          top: 18,
        }}
      >
        <div
          style={{
            color: COLORS.white,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 800,
            fontSize: 21,
            letterSpacing: 2.6,
          }}
        >
          {tier.label}
        </div>
        <div
          style={{
            color: COLORS.muted,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 2.2,
            marginTop: 6,
          }}
        >
          {tier.descriptor}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 25,
          top: 18,
          color: tier.color,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 900,
          fontSize: 25,
          letterSpacing: -0.5,
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 18px ${tier.color}55`,
        }}
      >
        {String(numberValue).padStart(2, "0")}%
      </div>

      <div
        style={{
          position: "absolute",
          left: 99,
          right: 25,
          bottom: 18,
          height: 8,
          borderRadius: 999,
          background: "rgba(5,12,27,.48)",
          border: "1px solid rgba(255,255,255,.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(2.5, tier.metric * fill)}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${tier.color}99, ${tier.color})`,
            boxShadow: `0 0 20px ${tier.color}99`,
          }}
        >
          <div
            style={{
              marginLeft: "auto",
              width: 32,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.72))",
              opacity: 0.75,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const CompletionFooter: React.FC<{
  readonly frame: number;
  readonly time: number;
}> = ({ frame, time }) => {
  const enter = segment(frame, 440, 505, Easing.out(Easing.cubic));
  const check = spring({
    frame: frame - 470,
    fps: 60,
    config: {
      damping: 14,
      stiffness: 155,
      mass: 0.65,
    },
    durationInFrames: 48,
  });
  const pulse = 0.52 + 0.48 * Math.sin(time * 2.1);

  return (
    <div
      style={{
        position: "absolute",
        left: 106,
        right: 106,
        bottom: 62,
        height: 78,
        borderRadius: 24,
        border: "1px solid rgba(213,229,255,.18)",
        background:
          "linear-gradient(110deg, rgba(255,255,255,.105), rgba(255,255,255,.035))",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.17), 0 20px 45px rgba(0,0,0,.21)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 28}px)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${100 * enter}%`,
          height: 2,
          background:
            "linear-gradient(90deg, #FFB84D, #FF667A, #B68CFF, #5B94FF, #37E6D3)",
          boxShadow: "0 0 18px rgba(91,148,255,.7)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingLeft: 24,
          width: 530,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            border: `1px solid ${COLORS.cyan}70`,
            background: `linear-gradient(145deg, ${COLORS.cyan}45, ${COLORS.blue}16)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${check})`,
            boxShadow: `0 0 ${20 + pulse * 12}px ${COLORS.cyan}29`,
          }}
        >
          <svg width={23} height={23} viewBox="0 0 24 24">
            <path
              d="M4.5 12.5L9.4 17.1L19.4 6.8"
              fill="none"
              stroke={COLORS.cyan}
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - check}
            />
          </svg>
        </div>
        <div>
          <div
            style={{
              color: COLORS.white,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: 2.2,
            }}
          >
            STRATEGIC ALIGNMENT
          </div>
          <div
            style={{
              color: COLORS.muted,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 2.1,
              marginTop: 5,
            }}
          >
            ALL PILLARS CONNECTED
          </div>
        </div>
      </div>

      <div
        style={{
          height: 38,
          width: 1,
          background: "rgba(216,232,255,.16)",
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 13,
        }}
      >
        {TIERS.map((tier, index) => (
          <React.Fragment key={tier.id}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: tier.color,
                boxShadow: `0 0 ${11 + pulse * 7}px ${tier.color}`,
              }}
            />
            {index < TIERS.length - 1 ? (
              <div
                style={{
                  width: 54,
                  height: 1,
                  background:
                    "linear-gradient(90deg, rgba(210,230,255,.34), rgba(210,230,255,.12))",
                }}
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <div
        style={{
          height: 38,
          width: 1,
          background: "rgba(216,232,255,.16)",
        }}
      />

      <div
        style={{
          width: 356,
          paddingRight: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: COLORS.mint,
            boxShadow: `0 0 ${12 + pulse * 9}px ${COLORS.mint}`,
          }}
        />
        <div
          style={{
            color: COLORS.mint,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: 2.4,
          }}
        >
          MODEL ACTIVE
        </div>
        <div
          style={{
            color: COLORS.softWhite,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 1.6,
            paddingLeft: 14,
            borderLeft: "1px solid rgba(216,232,255,.17)",
          }}
        >
          5 / 5
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const globalIn = segment(frame, 0, 30, Easing.out(Easing.cubic));
  const finalPulse = segment(frame, 430, 500, Easing.out(Easing.cubic));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.backgroundDeep,
        overflow: "hidden",
        opacity: globalIn,
      }}
    >
      <Background frame={frame} time={time} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${1 + finalPulse * 0.003})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Header frame={frame} />
        <PyramidStage frame={frame} time={time} />

        {TIERS.map((tier, index) => (
          <GlassTier
            key={tier.id}
            tier={tier}
            index={index}
            frame={frame}
            time={time}
            fps={fps}
          />
        ))}

        <ConnectorLayer frame={frame} time={time} />

        {TIERS.map((tier, index) => (
          <InsightRow
            key={tier.id}
            tier={tier}
            index={index}
            frame={frame}
            time={time}
          />
        ))}

        <CompletionFooter frame={frame} time={time} />
      </div>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow:
            "inset 0 0 150px rgba(0,0,0,.46), inset 0 0 18px rgba(126,190,255,.06)",
        }}
      />
    </AbsoluteFill>
  );
};
