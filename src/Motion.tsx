import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 900;
const TAU = Math.PI * 2;

type ActionSpec = {
  readonly number: string;
  readonly title: string;
  readonly detail: string;
  readonly metric: string;
  readonly metricLabel: string;
  readonly color: string;
  readonly rgb: string;
  readonly icon: "trend" | "shield" | "workflow" | "launch";
  readonly start: number;
  readonly end: number;
};

const ACTIONS: readonly ActionSpec[] = [
  {
    number: "01",
    title: "Reallocate spend to high-intent demand",
    detail: "Prioritize the two channels with the strongest conversion signal",
    metric: "+21%",
    metricLabel: "PIPELINE LIFT",
    color: "#67e9ff",
    rgb: "103,233,255",
    icon: "trend",
    start: 304,
    end: 374,
  },
  {
    number: "02",
    title: "Activate at-risk accounts before renewal",
    detail: "Launch proactive outreach with a personalized retention offer",
    metric: "24",
    metricLabel: "ACCOUNTS READY",
    color: "#8e8bff",
    rgb: "142,139,255",
    icon: "shield",
    start: 382,
    end: 452,
  },
  {
    number: "03",
    title: "Automate repeat support workflows",
    detail: "Resolve high-volume requests with an AI-assisted service flow",
    metric: "−38%",
    metricLabel: "RESOLUTION TIME",
    color: "#55f1c2",
    rgb: "85,241,194",
    icon: "workflow",
    start: 460,
    end: 530,
  },
  {
    number: "04",
    title: "Scale the top-performing market this week",
    detail: "Move the winning playbook into the highest-confidence segment",
    metric: "94%",
    metricLabel: "CONFIDENCE",
    color: "#ffb967",
    rgb: "255,185,103",
    icon: "launch",
    start: 538,
    end: 608,
  },
] as const;

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const mix = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;

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

const PARTICLES = Array.from({ length: 58 }, (_, index) => ({
  x: seeded(index + 10) * WIDTH,
  y: seeded(index + 90) * HEIGHT,
  radius: 0.8 + seeded(index + 170) * 2.2,
  opacity: 0.12 + seeded(index + 250) * 0.43,
  phase: seeded(index + 330) * TAU,
  drift: 8 + seeded(index + 410) * 24,
}));

const STREAMS = Array.from({ length: 12 }, (_, index) => ({
  y: 70 + seeded(index + 510) * 940,
  width: 90 + seeded(index + 540) * 210,
  speed: 0.55 + seeded(index + 570) * 1.25,
  phase: seeded(index + 600) * 2200,
  opacity: 0.035 + seeded(index + 630) * 0.06,
}));

const ORBIT_NODES = Array.from({ length: 18 }, (_, index) => ({
  angle: (index / 18) * TAU + seeded(index + 700) * 0.22,
  radiusX: 570 + seeded(index + 740) * 350,
  radiusY: 245 + seeded(index + 780) * 190,
  size: 2 + seeded(index + 820) * 3.2,
  phase: seeded(index + 860) * TAU,
}));

const Glint: React.FC<{
  readonly size?: number;
  readonly color?: string;
}> = ({ size = 24, color = "#6deaff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M12 1.8C12.5 7.8 16.2 11.5 22.2 12C16.2 12.5 12.5 16.2 12 22.2C11.5 16.2 7.8 12.5 1.8 12C7.8 11.5 11.5 7.8 12 1.8Z"
      fill={color}
    />
    <circle cx="12" cy="12" r="2.7" fill="#ffffff" opacity="0.88" />
  </svg>
);

const CheckIcon: React.FC<{
  readonly color: string;
  readonly size?: number;
}> = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M5 12.6L9.4 17L19 7.4"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
    />
  </svg>
);

const ArrowIcon: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
    <path
      d="M7 14H20M15 9L20 14L15 19"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  </svg>
);

const ActionIcon: React.FC<{
  readonly icon: ActionSpec["icon"];
  readonly color: string;
}> = ({ icon, color }) => (
  <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
    {icon === "trend" ? (
      <>
        <path
          d="M5 25L12 18L17 21L28 9"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
        <path
          d="M21.5 9H28V15.5"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
      </>
    ) : null}
    {icon === "shield" ? (
      <>
        <path
          d="M17 4.5L27 8.4V15.4C27 22.2 22.9 27.1 17 29.5C11.1 27.1 7 22.2 7 15.4V8.4L17 4.5Z"
          fill="none"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <path
          d="M12.2 17L15.6 20.4L22 13.8"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </>
    ) : null}
    {icon === "workflow" ? (
      <>
        <rect
          x="4.8"
          y="5.4"
          width="8"
          height="8"
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <rect
          x="21.2"
          y="20.6"
          width="8"
          height="8"
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <path
          d="M12.8 9.4H20C24 9.4 25.2 11.7 25.2 15.5V20.6M21.5 16.8L25.2 20.6L29 16.8"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </>
    ) : null}
    {icon === "launch" ? (
      <>
        <path
          d="M18.5 6.2C23 4.6 27.3 5 29.2 5.6C29.8 7.5 30.2 11.8 28.6 16.3L20.7 24.2L10.6 14.1L18.5 6.2Z"
          fill="none"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="2.1"
        />
        <circle
          cx="23.2"
          cy="10.7"
          r="2.6"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <path
          d="M12.5 16L7.1 17.3L4.8 21.1L12.5 21.5M18.8 22L17.5 27.4L13.7 29.7L13.3 22"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </>
    ) : null}
  </svg>
);

const Atmosphere: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const breathe = 0.88 + Math.sin(frame * 0.012) * 0.12;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 39%, #0b2944 0%, #061423 35%, #020812 68%, #01040a 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 285 + Math.sin(frame * 0.004) * 28,
          top: -360 + Math.cos(frame * 0.0048) * 18,
          width: 1350,
          height: 920,
          borderRadius: "50%",
          opacity: 0.44 * breathe,
          background:
            "radial-gradient(ellipse, rgba(30,211,255,0.24), rgba(40,111,190,0.08) 42%, transparent 72%)",
          filter: "blur(74px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -270,
          bottom: -430,
          width: 900,
          height: 900,
          borderRadius: "50%",
          opacity: 0.36,
          background:
            "radial-gradient(circle, rgba(102,85,255,0.22), transparent 70%)",
          filter: "blur(90px)",
          transform: `translate(${Math.sin(frame * 0.0035) * 24}px, ${
            Math.cos(frame * 0.003) * 20
          }px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -300,
          bottom: -460,
          width: 960,
          height: 960,
          borderRadius: "50%",
          opacity: 0.26,
          background:
            "radial-gradient(circle, rgba(0,229,187,0.2), transparent 68%)",
          filter: "blur(100px)",
          transform: `translate(${Math.cos(frame * 0.0038) * 26}px, ${
            Math.sin(frame * 0.0033) * 18
          }px)`,
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0, opacity: 0.68 }}
      >
        <defs>
          <radialGradient id="network-fade">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.34" />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <mask id="network-mask">
            <rect width={WIDTH} height={HEIGHT} fill="url(#network-fade)" />
          </mask>
          <linearGradient id="network-line" x1="0" x2="1">
            <stop offset="0" stopColor="#5e76ff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#56e7ff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#43ffd0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g mask="url(#network-mask)">
          {Array.from({ length: 19 }, (_, index) => (
            <path
              key={`curve-${index}`}
              d={`M ${-180 + index * 116} ${HEIGHT + 120} Q ${
                820 + Math.sin(index * 1.3) * 260
              } ${330 + index * 8}, ${WIDTH + 160} ${70 + index * 38}`}
              fill="none"
              stroke="url(#network-line)"
              strokeWidth="1"
              opacity={0.1 + (index % 4) * 0.022}
            />
          ))}
          {Array.from({ length: 15 }, (_, index) => (
            <line
              key={`h-${index}`}
              x1="180"
              x2={WIDTH - 180}
              y1={190 + index * 55}
              y2={190 + index * 55}
              stroke="rgba(91,214,255,0.07)"
              strokeWidth="1"
            />
          ))}
        </g>
      </svg>

      {STREAMS.map((stream, index) => {
        const x = ((frame * stream.speed + stream.phase) % 2420) - 260;
        return (
          <div
            key={`stream-${index}`}
            style={{
              position: "absolute",
              left: x,
              top: stream.y,
              width: stream.width,
              height: 1,
              opacity: stream.opacity,
              background:
                "linear-gradient(90deg, transparent, #6d86ff 30%, #6df2ff 70%, transparent)",
              boxShadow: "0 0 9px rgba(90,230,255,0.35)",
            }}
          />
        );
      })}

      {ORBIT_NODES.map((node, index) => {
        const angle = node.angle + frame * (0.0007 + (index % 3) * 0.00016);
        const x = WIDTH / 2 + Math.cos(angle) * node.radiusX;
        const y = 455 + Math.sin(angle) * node.radiusY;
        const pulse = 0.45 + Math.sin(frame * 0.025 + node.phase) * 0.2;
        return (
          <div
            key={`orbit-${index}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: node.size,
              height: node.size,
              borderRadius: "50%",
              opacity: pulse,
              background: index % 4 === 0 ? "#a98dff" : "#62ebff",
              boxShadow: "0 0 12px rgba(90,232,255,0.65)",
            }}
          />
        );
      })}

      {PARTICLES.map((particle, index) => {
        const x =
          particle.x + Math.sin(frame * 0.0038 + particle.phase) * particle.drift;
        const y =
          particle.y +
          Math.cos(frame * 0.0031 + particle.phase) * particle.drift * 0.65;
        const pulse =
          0.48 + 0.52 * Math.sin(frame * 0.022 + particle.phase) ** 2;
        return (
          <div
            key={`particle-${index}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: particle.radius * 2,
              height: particle.radius * 2,
              borderRadius: "50%",
              opacity: particle.opacity * pulse,
              background: index % 6 === 0 ? "#b0a0ff" : "#76eeff",
              boxShadow:
                index % 8 === 0
                  ? "0 0 14px rgba(104,237,255,0.68)"
                  : "0 0 4px rgba(104,237,255,0.34)",
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 46%, rgba(0,3,10,0.38) 78%, rgba(0,2,8,0.78) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const SystemHeader: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const livePulse = 0.7 + Math.sin(frame * 0.09) * 0.16;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 86,
        width: 1400,
        transform: `translateX(-50%) translateY(${mix(12, 0, reveal)}px)`,
        opacity: reveal,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            border: "1px solid rgba(102,233,255,0.32)",
            background:
              "linear-gradient(145deg, rgba(80,226,255,0.18), rgba(30,62,110,0.24))",
            boxShadow: "0 0 24px rgba(65,220,255,0.12)",
          }}
        >
          <Glint size={20} />
        </div>
        <div>
          <div
            style={{
              color: "#f1fbff",
              fontSize: 18,
              fontWeight: 760,
              letterSpacing: "0.16em",
              lineHeight: 1,
            }}
          >
            NEXUS INTELLIGENCE
          </div>
          <div
            style={{
              marginTop: 7,
              color: "rgba(188,220,235,0.64)",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.09em",
              lineHeight: 1,
            }}
          >
            EXECUTIVE DECISION SYSTEM
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            color: "rgba(204,230,241,0.72)",
            fontSize: 15,
            fontWeight: 650,
            letterSpacing: "0.08em",
          }}
        >
          DATA CONNECTED
        </div>
        <div
          style={{
            height: 22,
            width: 1,
            background: "rgba(116,214,237,0.18)",
          }}
        />
        <div
          style={{
            height: 34,
            padding: "0 15px",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            gap: 9,
            color: "#64f2c7",
            fontSize: 15,
            fontWeight: 760,
            letterSpacing: "0.08em",
            border: "1px solid rgba(87,241,199,0.25)",
            background: "rgba(38,143,118,0.11)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              opacity: livePulse,
              background: "#58f0c0",
              boxShadow: "0 0 11px rgba(88,240,192,0.86)",
            }}
          />
          LIVE
        </div>
      </div>
    </div>
  );
};

const PromptRail: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const prompt = "Analyze this business data and build a 90-day growth plan";
  const typing = progress(frame, 52, 190, Easing.linear);
  const typedLength = Math.floor(typing * prompt.length);
  const typed = prompt.slice(0, typedLength);
  const submitted = progress(frame, 190, 218, Easing.out(Easing.quad));
  const cursorVisible = typing < 1 && Math.floor(frame / 18) % 2 === 0;
  const sendPulse =
    1 +
    progress(frame, 188, 202, Easing.out(Easing.quad)) *
      (1 - progress(frame, 202, 220, Easing.in(Easing.quad))) *
      0.13;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 150,
        width: 1400,
        height: 106,
        transform: `translateX(-50%) translateY(${mix(
          26,
          0,
          reveal,
        )}px) scale(${mix(0.99, 1, reveal)})`,
        transformOrigin: "50% 50%",
        opacity: reveal,
        borderRadius: 26,
        border: `1px solid rgba(91,225,255,${0.24 + reveal * 0.16})`,
        background:
          "linear-gradient(105deg, rgba(11,32,56,0.94), rgba(7,21,39,0.91) 60%, rgba(10,38,55,0.90))",
        boxShadow:
          "inset 0 1px rgba(255,255,255,0.055), inset 0 -1px rgba(58,202,235,0.055), 0 22px 60px rgba(0,0,0,0.28), 0 0 42px rgba(56,207,238,0.065)",
        overflow: "hidden",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          opacity: 0.82,
          background:
            "linear-gradient(180deg, rgba(91,234,255,0), #61eaff 36%, #75ffd9 72%, rgba(91,234,255,0))",
          boxShadow: "0 0 22px rgba(80,229,255,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 24,
          width: 58,
          height: 58,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(94,233,255,0.28)",
          background:
            "radial-gradient(circle at 35% 30%, rgba(105,238,255,0.26), rgba(40,78,110,0.18) 62%, rgba(10,25,42,0.68))",
          boxShadow:
            "inset 0 1px rgba(255,255,255,0.06), 0 0 26px rgba(72,222,255,0.11)",
        }}
      >
        <Glint size={26} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 112,
          top: 0,
          bottom: 0,
          right: 120,
          display: "flex",
          alignItems: "center",
          color: "#f2fbff",
          fontSize: 32,
          fontWeight: 620,
          letterSpacing: "-0.012em",
          whiteSpace: "nowrap",
          textShadow: "0 2px 4px rgba(0,0,0,0.62)",
        }}
      >
        {typed}
        {cursorVisible ? (
          <span
            style={{
              width: 3,
              height: 37,
              marginLeft: 5,
              borderRadius: 2,
              background: "#78efff",
              boxShadow: "0 0 10px rgba(91,231,255,0.72)",
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          right: 20,
          top: 19,
          width: 68,
          height: 68,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${sendPulse})`,
          color: "#03121d",
          border: "1px solid rgba(179,255,255,0.72)",
          background: submitted > 0.74 ? "#66f0c4" : "#66e9fb",
          boxShadow: `0 0 ${24 + submitted * 16}px rgba(${
            submitted > 0.74 ? "82,240,194" : "82,226,255"
          },${0.36 + submitted * 0.25}), inset 0 1px rgba(255,255,255,0.65)`,
        }}
      >
        {submitted > 0.74 ? (
          <CheckIcon color="#06251c" size={29} />
        ) : (
          <ArrowIcon color="#04202b" />
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 0,
          height: 1,
          opacity: 0.8,
          background:
            "linear-gradient(90deg, transparent, rgba(88,232,255,0.42), transparent)",
        }}
      />
    </div>
  );
};

const ProcessingRail: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal =
    progress(frame, 194, 214, Easing.out(Easing.quad)) *
    (1 - progress(frame, 240, 262, Easing.in(Easing.quad)));
  const scan = ((frame - 194) * 8.4) % 1040;
  const dots =
    frame < 194 ? 0 : Math.floor((frame - 194) / 12) % 4;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 272,
        width: 1030,
        height: 44,
        transform: "translateX(-50%)",
        opacity: reveal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "#a9ddeb",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "0.09em",
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "#62eaff",
          boxShadow: "0 0 14px rgba(92,232,255,0.82)",
        }}
      />
      SYNTHESIZING LIVE SIGNALS{".".repeat(dots)}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          background: "rgba(86,217,245,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: scan - 160,
            top: 0,
            width: 160,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, #69ecff 78%, #ffffff)",
            boxShadow: "0 0 7px rgba(104,235,255,0.72)",
          }}
        />
      </div>
    </div>
  );
};

const ActionRow: React.FC<{
  readonly frame: number;
  readonly spec: ActionSpec;
  readonly index: number;
}> = ({ frame, spec, index }) => {
  const entrance = progress(
    frame,
    spec.start,
    spec.start + 24,
    Easing.out(Easing.cubic),
  );
  const typing = progress(frame, spec.start + 8, spec.end, Easing.linear);
  const typedLength = Math.floor(spec.title.length * typing);
  const title = spec.title.slice(0, typedLength);
  const detailIn = progress(
    frame,
    spec.start + 26,
    spec.end + 8,
    Easing.out(Easing.cubic),
  );
  const metricIn = progress(
    frame,
    spec.end - 18,
    spec.end + 16,
    Easing.out(Easing.cubic),
  );
  const completion = progress(
    frame,
    spec.end - 6,
    spec.end + 18,
    Easing.out(Easing.cubic),
  );
  const cursorVisible =
    typing < 1 && typing > 0 && Math.floor((frame - spec.start) / 12) % 2 === 0;
  const lineReveal = progress(
    frame,
    spec.start + 2,
    spec.start + 35,
    Easing.out(Easing.cubic),
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 102,
        opacity: entrance,
        transform: `translateX(${mix(24, 0, entrance)}px)`,
        borderRadius: 18,
        border: `1px solid rgba(${spec.rgb},${0.12 + completion * 0.1})`,
        background: `linear-gradient(100deg, rgba(${spec.rgb},0.075), rgba(8,23,41,0.7) 35%, rgba(8,23,41,0.46))`,
        boxShadow:
          "inset 0 1px rgba(255,255,255,0.022), 0 10px 24px rgba(0,0,0,0.11)",
        overflow: "hidden",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 14,
          bottom: 14,
          width: 3,
          borderRadius: 3,
          background: spec.color,
          opacity: 0.7 + completion * 0.3,
          boxShadow: `0 0 15px rgba(${spec.rgb},0.6)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 24,
          top: 22,
          width: 58,
          height: 58,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid rgba(${spec.rgb},0.22)`,
          background: `radial-gradient(circle at 35% 25%, rgba(${spec.rgb},0.16), rgba(9,25,45,0.72))`,
          boxShadow: `inset 0 1px rgba(255,255,255,0.035), 0 0 18px rgba(${spec.rgb},0.05)`,
        }}
      >
        <ActionIcon icon={spec.icon} color={spec.color} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 99,
          top: 18,
          width: 930,
          color: "#eef9ff",
          fontSize: 26,
          fontWeight: 650,
          letterSpacing: "-0.012em",
          lineHeight: 1.15,
          whiteSpace: "nowrap",
          textShadow: "0 2px 3px rgba(0,0,0,0.62)",
        }}
      >
        {title}
        {cursorVisible ? (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 25,
              marginLeft: 4,
              verticalAlign: -3,
              borderRadius: 2,
              background: spec.color,
              boxShadow: `0 0 8px rgba(${spec.rgb},0.75)`,
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          top: 56,
          width: 940,
          opacity: detailIn,
          color: "rgba(187,217,231,0.82)",
          fontSize: 17,
          fontWeight: 520,
          letterSpacing: "0.004em",
          whiteSpace: "nowrap",
        }}
      >
        {spec.detail}
      </div>

      <div
        style={{
          position: "absolute",
          right: 22,
          top: 18,
          width: 212,
          height: 66,
          opacity: metricIn,
          transform: `translateX(${mix(18, 0, metricIn)}px)`,
          borderRadius: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 13,
          border: `1px solid rgba(${spec.rgb},0.22)`,
          background: `rgba(${spec.rgb},0.065)`,
        }}
      >
        <div
          style={{
            color: spec.color,
            fontSize: 28,
            fontWeight: 790,
            letterSpacing: "-0.025em",
            lineHeight: 1,
            minWidth: 70,
            textAlign: "right",
            textShadow: `0 0 14px rgba(${spec.rgb},0.22)`,
          }}
        >
          {spec.metric}
        </div>
        <div
          style={{
            width: 1,
            height: 34,
            background: `rgba(${spec.rgb},0.19)`,
          }}
        />
        <div
          style={{
            width: 94,
            color: "rgba(217,238,246,0.79)",
            fontSize: 14,
            fontWeight: 760,
            letterSpacing: "0.08em",
            lineHeight: 1.35,
          }}
        >
          {spec.metricLabel}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 101,
          bottom: 0,
          width: `${lineReveal * 75}%`,
          maxWidth: 900,
          height: 1,
          opacity: 0.48,
          background: `linear-gradient(90deg, rgba(${spec.rgb},0.6), rgba(${spec.rgb},0))`,
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 246,
          top: 39,
          width: 28,
          height: 28,
          opacity: completion,
          transform: `scale(${mix(0.65, 1, completion)})`,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid rgba(${spec.rgb},0.3)`,
          background: `rgba(${spec.rgb},0.09)`,
          boxShadow: `0 0 16px rgba(${spec.rgb},0.09)`,
        }}
      >
        <CheckIcon color={spec.color} size={17} />
      </div>

    </div>
  );
};

const ExecutiveBrief: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const complete = progress(frame, 612, 654, Easing.out(Easing.cubic));
  const railFill = progress(frame, 300, 620, Easing.inOut(Easing.cubic));
  const confidencePulse = 0.92 + Math.sin(frame * 0.035) * 0.035;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 286,
        width: 1400,
        height: 680,
        transform: `translateX(-50%) translateY(${mix(
          34,
          0,
          reveal,
        )}px) scale(${mix(0.992, 1, reveal)})`,
        transformOrigin: "50% 0%",
        opacity: reveal,
        borderRadius: 28,
        border: "1px solid rgba(91,218,245,0.24)",
        background:
          "linear-gradient(145deg, rgba(8,25,44,0.94), rgba(5,17,32,0.92) 52%, rgba(7,28,39,0.87))",
        boxShadow:
          "inset 0 1px rgba(255,255,255,0.045), inset 0 -1px rgba(77,222,246,0.045), 0 30px 80px rgba(0,0,0,0.34), 0 0 60px rgba(62,214,240,0.045)",
        overflow: "hidden",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 120,
          borderBottom: "1px solid rgba(91,215,240,0.13)",
          background:
            "linear-gradient(90deg, rgba(76,222,255,0.055), transparent 44%, rgba(75,238,193,0.035))",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 25,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(103,233,255,0.24)",
              background:
                "linear-gradient(145deg, rgba(93,228,255,0.15), rgba(19,51,77,0.42))",
            }}
          >
            <Glint size={24} />
          </div>
          <div>
            <div
              style={{
                color: "#f0faff",
                fontSize: 27,
                fontWeight: 740,
                letterSpacing: "-0.012em",
                lineHeight: 1,
              }}
            >
              Executive action plan
            </div>
            <div
              style={{
                marginTop: 9,
                color: "rgba(174,212,229,0.72)",
                fontSize: 15,
                fontWeight: 620,
                letterSpacing: "0.045em",
                lineHeight: 1,
              }}
            >
              FOUR PRIORITIES • 90-DAY HORIZON • LIVE BUSINESS SIGNALS
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 34,
            top: 27,
            width: 246,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 13,
            borderRadius: 19,
            transform: `scale(${complete > 0.98 ? confidencePulse : 1})`,
            border: `1px solid ${
              complete > 0.55
                ? "rgba(85,241,194,0.3)"
                : "rgba(104,230,255,0.19)"
            }`,
            background:
              complete > 0.55
                ? "rgba(49,160,129,0.11)"
                : "rgba(30,78,103,0.12)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.8 + complete * 0.2,
              background:
                complete > 0.55
                  ? "rgba(75,239,190,0.14)"
                  : "rgba(86,221,255,0.12)",
              border: `1px solid ${
                complete > 0.55
                  ? "rgba(75,239,190,0.3)"
                  : "rgba(86,221,255,0.24)"
              }`,
            }}
          >
            {complete > 0.55 ? (
              <CheckIcon color="#58f1c0" size={20} />
            ) : (
              <Glint size={17} />
            )}
          </div>
          <div>
            <div
              style={{
                color: complete > 0.55 ? "#66f3c5" : "#70e9ff",
                fontSize: 16,
                fontWeight: 790,
                letterSpacing: "0.07em",
                lineHeight: 1,
              }}
            >
              {complete > 0.55 ? "DECISION READY" : "BUILDING PLAN"}
            </div>
            <div
              style={{
                marginTop: 7,
                color: "rgba(188,221,232,0.68)",
                fontSize: 14,
                fontWeight: 650,
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              94% CONFIDENCE
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          top: 137,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {ACTIONS.map((spec, index) => (
          <ActionRow
            key={spec.number}
            frame={frame}
            spec={spec}
            index={index}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          bottom: 18,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "rgba(166,203,219,0.66)",
          fontSize: 15,
          fontWeight: 650,
          letterSpacing: "0.045em",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span>SOURCES VERIFIED&nbsp; 12/12</span>
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "rgba(102,226,245,0.48)",
            }}
          />
          <span>UPDATED JUST NOW</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: complete > 0.55 ? "#6decc4" : "rgba(176,218,233,0.7)",
          }}
        >
          <div
            style={{
              width: 110,
              height: 4,
              overflow: "hidden",
              borderRadius: 3,
              background: "rgba(93,211,235,0.1)",
            }}
          >
            <div
              style={{
                width: `${railFill * 100}%`,
                height: "100%",
                borderRadius: 3,
                background:
                  complete > 0.55
                    ? "linear-gradient(90deg, #5de5ff, #56efbe)"
                    : "linear-gradient(90deg, #7387ff, #5ee6ff)",
                boxShadow: "0 0 8px rgba(83,232,220,0.42)",
              }}
            />
          </div>
          <span>{Math.round(railFill * 4)} OF 4 PRIORITIES</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: -80 + railFill * 1480,
          top: 119,
          width: 190,
          height: 1,
          opacity: railFill < 1 ? 0.48 : 0,
          background:
            "linear-gradient(90deg, transparent, rgba(112,239,255,0.78), transparent)",
          boxShadow: "0 0 8px rgba(95,231,255,0.48)",
        }}
      />
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const normalizedFrame = frame * (60 / fps);
  const intro = progress(
    normalizedFrame,
    8,
    44,
    Easing.out(Easing.cubic),
  );
  const promptReveal = progress(
    normalizedFrame,
    24,
    58,
    Easing.out(Easing.cubic),
  );
  const responseReveal = progress(
    normalizedFrame,
    232,
    286,
    Easing.out(Easing.cubic),
  );
  const fadeOut = 1 - progress(
    normalizedFrame,
    850,
    TOTAL_FRAMES - 1,
    Easing.inOut(Easing.cubic),
  );
  const masterOpacity = clamp(intro * fadeOut);

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#01040a",
        color: "#ffffff",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: masterOpacity,
        }}
      >
        <Atmosphere frame={normalizedFrame} />
        <SystemHeader frame={normalizedFrame} reveal={intro} />
        <PromptRail frame={normalizedFrame} reveal={promptReveal} />
        <ProcessingRail frame={normalizedFrame} />
        <ExecutiveBrief
          frame={normalizedFrame}
          reveal={responseReveal}
        />
      </div>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.13 * masterOpacity,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 4px)",
          mixBlendMode: "soft-light",
        }}
      />
    </AbsoluteFill>
  );
};
