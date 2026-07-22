import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const fade = (
  frame: number,
  input: [number, number, number, number],
  output: [number, number, number, number] = [0, 1, 1, 0],
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

const palette = [
  {
    label: "CORE MARKET",
    value: 34,
    color: "#64F4D2",
    dark: "#13B9AC",
  },
  {
    label: "GROWTH",
    value: 24,
    color: "#59B8FF",
    dark: "#2978EF",
  },
  {
    label: "EMERGING",
    value: 18,
    color: "#A984FF",
    dark: "#6D49E8",
  },
  {
    label: "OPPORTUNITY",
    value: 14,
    color: "#FF7FA7",
    dark: "#E84778",
  },
  {
    label: "NEW SIGNALS",
    value: 10,
    color: "#FFD166",
    dark: "#E69B35",
  },
] as const;

const gapAngle = 4;
const usableAngle = 360 - gapAngle * palette.length;
let accumulatedAngle = 0;
const segments = palette.map((item) => {
  const sweep = (item.value / 100) * usableAngle;
  const segment = {
    ...item,
    start: accumulatedAngle,
    sweep,
    middle: accumulatedAngle + sweep / 2,
  };
  accumulatedAngle += sweep + gapAngle;
  return segment;
});

const Background: React.FC<{frame: number}> = ({frame}) => {
  const driftX = Math.sin(frame / 115) * 38;
  const driftY = Math.cos(frame / 137) * 28;
  const scanX = interpolate(frame, [0, 900], [-340, 2200], {
    extrapolateLeft: "extend",
    extrapolateRight: "extend",
  });

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: "#06101F"}}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(125deg, #030A15 0%, #07172A 42%, #071522 68%, #020713 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 1040,
          height: 1040,
          left: -330 + driftX,
          top: -345 + driftY,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,223,194,0.17) 0%, rgba(23,137,151,0.08) 34%, rgba(5,14,27,0) 69%)",
          filter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 860,
          height: 860,
          right: -240 - driftX * 0.45,
          top: 2 + driftY * 0.6,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(113,77,239,0.18) 0%, rgba(28,75,150,0.07) 40%, rgba(5,14,27,0) 72%)",
          filter: "blur(16px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          left: 520 + driftX * 0.3,
          bottom: -470 - driftY * 0.2,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,91,145,0.14) 0%, rgba(112,39,118,0.06) 42%, transparent 72%)",
          filter: "blur(12px)",
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0, opacity: 0.34}}
      >
        <defs>
          <pattern
            id="micro-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${(frame * 0.08) % 48} 0)`}
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="#78A6BF"
              strokeOpacity="0.13"
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="1.4" fill="#83D6DB" opacity="0.42" />
          </pattern>
          <linearGradient id="grid-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0.1" />
            <stop offset="0.47" stopColor="white" stopOpacity="0.9" />
            <stop offset="1" stopColor="white" stopOpacity="0.08" />
          </linearGradient>
          <mask id="grid-mask">
            <rect width={WIDTH} height={HEIGHT} fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect
          width={WIDTH}
          height={HEIGHT}
          fill="url(#micro-grid)"
          mask="url(#grid-mask)"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: scanX,
          top: -200,
          width: 260,
          height: 1500,
          transform: "rotate(14deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(121,244,231,0.025), rgba(159,246,237,0.08), rgba(121,244,231,0.018), transparent)",
          filter: "blur(8px)",
          mixBlendMode: "screen",
        }}
      />

      {Array.from({length: 34}).map((_, i) => {
        const x = (i * 197 + 83) % WIDTH;
        const y = (i * 113 + 57) % HEIGHT;
        const pulse = 0.16 + 0.36 * ((Math.sin(frame / 34 + i * 1.71) + 1) / 2);
        const size = i % 7 === 0 ? 2.2 : 1.1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: i % 3 === 0 ? "#74F6DD" : "#A8C8D6",
              boxShadow: i % 7 === 0 ? "0 0 8px rgba(100,244,210,.65)" : "none",
              opacity: pulse,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,3,10,0.34) 78%, rgba(0,2,7,0.72) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const IntroBands: React.FC<{frame: number}> = ({frame}) => {
  const colors = palette.map((item) => item.color);
  return (
    <AbsoluteFill style={{overflow: "hidden", pointerEvents: "none"}}>
      {colors.map((color, i) => {
        const start = i * 8;
        const entrance = interpolate(frame, [start, start + 34], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const leave = interpolate(frame, [72 + i * 7, 132 + i * 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });
        const fromLeft = i % 2 === 0;
        const x = (fromLeft ? -1 : 1) * (1 - entrance) * 1450 +
          (fromLeft ? -1 : 1) * leave * 1750;
        const y = (i - 2) * 148 + leave * (i - 2) * 90;
        return (
          <div
            key={color}
            style={{
              position: "absolute",
              width: 2050,
              height: 300,
              left: -65,
              top: 290,
              opacity: interpolate(leave, [0, 0.7, 1], [0.56, 0.28, 0]),
              transform: `translate3d(${x}px, ${y}px, 0) rotate(-8deg) skewX(-20deg)`,
              background: `linear-gradient(90deg, transparent 1%, ${color} 16%, ${color} 78%, transparent 98%)`,
              boxShadow: `0 0 90px ${color}42`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background: "#07111F",
          opacity: interpolate(frame, [0, 30, 90, 142], [0.8, 0.12, 0.03, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};

const TechnicalChrome: React.FC<{frame: number}> = ({frame}) => {
  const reveal = fade(frame, [44, 104, 820, 882]);
  const lineWidth = interpolate(frame, [58, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const statusPulse = 0.5 + 0.5 * Math.sin(frame / 13);

  const corner: React.CSSProperties = {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "rgba(155,214,221,.44)",
  };

  return (
    <AbsoluteFill style={{opacity: reveal, color: "#B7D4DD", fontFamily: "Arial, Helvetica, sans-serif"}}>
      <div style={{...corner, left: 52, top: 44, borderLeft: "1px solid", borderTop: "1px solid"}} />
      <div style={{...corner, right: 52, top: 44, borderRight: "1px solid", borderTop: "1px solid"}} />
      <div style={{...corner, left: 52, bottom: 44, borderLeft: "1px solid", borderBottom: "1px solid"}} />
      <div style={{...corner, right: 52, bottom: 44, borderRight: "1px solid", borderBottom: "1px solid"}} />

      <div
        style={{
          position: "absolute",
          left: 84,
          top: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 12,
          letterSpacing: 4.2,
          fontWeight: 700,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#64F4D2",
            boxShadow: `0 0 ${8 + statusPulse * 8}px rgba(100,244,210,.9)`,
          }}
        />
        LIVE ANALYTICS
      </div>
      <div
        style={{
          position: "absolute",
          right: 82,
          top: 60,
          fontSize: 11,
          letterSpacing: 3.4,
          color: "rgba(178,211,220,.64)",
        }}
      >
        MODEL / DS–05&nbsp;&nbsp;&nbsp; 15 SEC
      </div>

      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          top: 94,
          height: 1,
          transformOrigin: "left center",
          transform: `scaleX(${lineWidth})`,
          background:
            "linear-gradient(90deg, rgba(100,244,210,.72), rgba(118,168,191,.16) 34%, rgba(118,168,191,.04))",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 84,
          bottom: 57,
          display: "flex",
          gap: 20,
          alignItems: "center",
          fontSize: 10,
          letterSpacing: 2.8,
          color: "rgba(169,204,214,.54)",
        }}
      >
        <span>DATA / NORMALIZED</span>
        <span style={{width: 58, height: 1, background: "rgba(100,244,210,.45)"}} />
        <span>SIGNAL CONFIDENCE 96.2</span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 84,
          bottom: 56,
          fontSize: 10,
          letterSpacing: 2.8,
          color: "rgba(169,204,214,.46)",
        }}
      >
        01&nbsp;&nbsp;/&nbsp;&nbsp;05
      </div>
    </AbsoluteFill>
  );
};

const RadialChart: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const cx = 440;
  const cy = 440;
  const radius = 225;
  const circumference = Math.PI * 2 * radius;
  const chartSpring = spring({
    frame: frame - 78,
    fps,
    durationInFrames: 96,
    config: {damping: 22, stiffness: 95, mass: 1.1},
  });
  const chartOpacity = interpolate(frame, [62, 118], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const focus = fade(frame, [410, 472, 668, 724]);
  const countProgress = interpolate(frame, [190, 350], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const count = Math.round(34 * countProgress);
  const scanRotation = frame * 0.28 - 90;
  const ringRotation = frame * 0.035;
  const pulse = (Math.sin(frame / 22) + 1) / 2;
  const calloutReveal = interpolate(frame, [305, 410], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        width: 880,
        height: 880,
        left: 80,
        top: 112,
        opacity: chartOpacity,
        transform: `translate3d(${interpolate(chartSpring, [0, 1], [-80, 0])}px, ${
          Math.sin(frame / 80) * 3
        }px, 0) scale(${interpolate(chartSpring, [0, 1], [0.78, 1])})`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 648,
          height: 648,
          left: 116,
          top: 116,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(61,242,213,.11) 0%, rgba(31,103,128,.05) 44%, transparent 72%)",
          filter: "blur(24px)",
          transform: `scale(${0.95 + pulse * 0.04})`,
        }}
      />

      <svg width="880" height="880" viewBox="0 0 880 880" style={{position: "absolute", inset: 0}}>
        <defs>
          {segments.map((segment, i) => (
            <linearGradient
              key={`grad-${segment.label}`}
              id={`segment-gradient-${i}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0" stopColor={segment.color} />
              <stop offset="0.6" stopColor={segment.color} />
              <stop offset="1" stopColor={segment.dark} />
            </linearGradient>
          ))}
          <radialGradient id="inner-surface" cx="35%" cy="28%" r="78%">
            <stop offset="0" stopColor="#15324A" stopOpacity="0.98" />
            <stop offset="0.5" stopColor="#0A1A2D" stopOpacity="0.98" />
            <stop offset="1" stopColor="#030A15" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="inner-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A8FFF1" stopOpacity="0.82" />
            <stop offset="0.35" stopColor="#6097B4" stopOpacity="0.18" />
            <stop offset="0.76" stopColor="#987CFF" stopOpacity="0.46" />
            <stop offset="1" stopColor="#FF7FA7" stopOpacity="0.38" />
          </linearGradient>
          <filter id="segment-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`rotate(${ringRotation} ${cx} ${cy})`} opacity="0.5">
          <circle
            cx={cx}
            cy={cy}
            r="336"
            fill="none"
            stroke="#76B1C5"
            strokeOpacity="0.17"
            strokeWidth="1"
            strokeDasharray="2 11"
          />
          <circle
            cx={cx}
            cy={cy}
            r="315"
            fill="none"
            stroke="#77DCCF"
            strokeOpacity="0.14"
            strokeWidth="1"
            strokeDasharray="58 8 3 8"
          />
        </g>

        {Array.from({length: 72}).map((_, i) => {
          const angle = (i / 72) * Math.PI * 2 - Math.PI / 2;
          const major = i % 6 === 0;
          const inner = major ? 325 : 329;
          const outer = major ? 340 : 335;
          return (
            <line
              key={`tick-${i}`}
              x1={cx + Math.cos(angle) * inner}
              y1={cy + Math.sin(angle) * inner}
              x2={cx + Math.cos(angle) * outer}
              y2={cy + Math.sin(angle) * outer}
              stroke={major ? "#B9F4EF" : "#7EA7B8"}
              strokeOpacity={major ? 0.34 : 0.16}
              strokeWidth={major ? 1.5 : 1}
            />
          );
        })}

        <g opacity={interpolate(frame, [105, 190], [0, 0.44], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}>
          <line x1="84" y1={cy} x2="796" y2={cy} stroke="#70B1C1" strokeOpacity="0.13" />
          <line x1={cx} y1="84" x2={cx} y2="796" stroke="#70B1C1" strokeOpacity="0.13" />
          <circle cx={cx} cy={cy} r="286" fill="none" stroke="#76B8C8" strokeOpacity="0.1" />
        </g>

        {segments.map((segment, i) => {
          const startFrame = 116 + i * 24;
          const draw = interpolate(frame, [startFrame, startFrame + 118], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.2, 0.82, 0.22, 1),
          });
          const arcLength = (circumference * segment.sweep) / 360;
          const mid = ((segment.middle - 90) * Math.PI) / 180;
          const explode = i === 0 ? focus * 12 : 0;
          const dx = Math.cos(mid) * explode;
          const dy = Math.sin(mid) * explode;
          return (
            <g key={segment.label} transform={`translate(${dx} ${dy})`}>
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeOpacity={0.16 + (i === 0 ? focus * 0.2 : 0)}
                strokeWidth="124"
                strokeLinecap="butt"
                strokeDasharray={`${Math.max(0.001, arcLength * draw)} ${circumference}`}
                transform={`rotate(${segment.start - 90} ${cx} ${cy})`}
                filter="url(#segment-shadow)"
              />
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={`url(#segment-gradient-${i})`}
                strokeWidth="108"
                strokeLinecap="butt"
                strokeDasharray={`${Math.max(0.001, arcLength * draw)} ${circumference}`}
                transform={`rotate(${segment.start - 90} ${cx} ${cy})`}
              />
              <circle
                cx={cx}
                cy={cy}
                r={radius - 42}
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity={0.18}
                strokeWidth="1.8"
                strokeDasharray={`${Math.max(0.001, ((2 * Math.PI * (radius - 42)) * segment.sweep * draw) / 360)} ${2 * Math.PI * (radius - 42)}`}
                transform={`rotate(${segment.start - 90} ${cx} ${cy})`}
              />
            </g>
          );
        })}

        <g transform={`rotate(${scanRotation} ${cx} ${cy})`} opacity={0.12 + focus * 0.34}>
          <circle
            cx={cx}
            cy={cy}
            r={radius + 67}
            fill="none"
            stroke="#B8FFF2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="28 1806"
            filter="url(#soft-glow)"
          />
          <line
            x1={cx}
            y1={cy - 143}
            x2={cx}
            y2={cy - 302}
            stroke="#B8FFF2"
            strokeWidth="1"
            strokeOpacity="0.38"
          />
        </g>

        <circle cx={cx} cy={cy} r="132" fill="url(#inner-surface)" stroke="#8CC8D1" strokeOpacity="0.2" />
        <circle cx={cx} cy={cy} r="118" fill="none" stroke="url(#inner-ring)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="96" fill="none" stroke="#8FB8C7" strokeOpacity="0.1" strokeDasharray="2 8" />
        <circle cx={cx} cy={cy} r={3 + pulse * 1.5} fill="#B7FFF1" filter="url(#soft-glow)" />

        {segments.map((segment, i) => {
          const angle = ((segment.middle - 90) * Math.PI) / 180;
          const startRadius = 288;
          const elbowRadius = 316 + (i % 2) * 11;
          const x1 = cx + Math.cos(angle) * startRadius;
          const y1 = cy + Math.sin(angle) * startRadius;
          const x2 = cx + Math.cos(angle) * elbowRadius;
          const y2 = cy + Math.sin(angle) * elbowRadius;
          const rightSide = Math.cos(angle) >= 0;
          const lineEnd = x2 + (rightSide ? 42 : -42);
          const localReveal = clamp((calloutReveal - i * 0.08) / 0.68);
          return (
            <g key={`callout-${segment.label}`} opacity={localReveal}>
              <path
                d={`M ${x1} ${y1} L ${x2} ${y2} L ${lineEnd} ${y2}`}
                fill="none"
                stroke={segment.color}
                strokeOpacity="0.48"
                strokeWidth="1.2"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - localReveal}
              />
              <circle cx={x1} cy={y1} r="2.5" fill={segment.color} />
              <text
                x={lineEnd + (rightSide ? 7 : -7)}
                y={y2 - 7}
                textAnchor={rightSide ? "start" : "end"}
                fill="#DBF1F3"
                fillOpacity="0.82"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="13"
                fontWeight="700"
                letterSpacing="1.8"
              >
                {String(segment.value).padStart(2, "0")}%
              </text>
              <text
                x={lineEnd + (rightSide ? 7 : -7)}
                y={y2 + 11}
                textAnchor={rightSide ? "start" : "end"}
                fill="#91AFBC"
                fillOpacity="0.62"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="8.5"
                letterSpacing="1.4"
              >
                {`S${String(i + 1).padStart(2, "0")}`}
              </text>
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          left: 330,
          top: 342,
          width: 220,
          height: 196,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{fontSize: 11, letterSpacing: 3.3, color: "rgba(187,224,230,.72)", marginBottom: 10}}>
          LEADING SHARE
        </div>
        <div style={{fontSize: 64, fontWeight: 300, letterSpacing: -3.5, lineHeight: 0.93}}>
          {String(count).padStart(2, "0")}
          <span style={{fontSize: 25, color: "#64F4D2", marginLeft: 4}}>%</span>
        </div>
        <div style={{width: 58, height: 1, marginTop: 16, background: "linear-gradient(90deg, transparent, #64F4D2, transparent)"}} />
      </div>
    </div>
  );
};

const Sparkline: React.FC<{frame: number; color: string; delay: number}> = ({
  frame,
  color,
  delay,
}) => {
  const reveal = interpolate(frame, [delay, delay + 82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <svg width="96" height="35" viewBox="0 0 96 35" style={{overflow: "visible"}}>
      <path d="M1 30 H95" stroke="#A5CAD5" strokeOpacity="0.12" />
      <path
        d="M2 28 C12 27 16 19 25 22 S39 28 48 16 S62 21 70 11 S83 13 94 3"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - reveal}
      />
      <circle cx="94" cy="3" r="2.4" fill={color} opacity={reveal} />
    </svg>
  );
};

const InsightPanel: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const panelSpring = spring({
    frame: frame - 155,
    fps,
    durationInFrames: 92,
    config: {damping: 24, stiffness: 90, mass: 1},
  });
  const headerReveal = interpolate(frame, [168, 258], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleClip = interpolate(frame, [185, 280], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.9, 0.2, 1),
  });
  const cardReveal = spring({
    frame: frame - 500,
    fps,
    durationInFrames: 76,
    config: {damping: 23, stiffness: 100, mass: 0.9},
  });
  const coreFocus = fade(frame, [410, 472, 668, 724]);

  return (
    <div
      style={{
        position: "absolute",
        width: 690,
        height: 800,
        right: 105,
        top: 135,
        opacity: interpolate(panelSpring, [0, 1], [0, 1]),
        transform: `translate3d(${interpolate(panelSpring, [0, 1], [90, 0])}px, 0, 0)`,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#EAF8F8",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "5px 0 5px 0",
          borderRadius: 26,
          border: "1px solid rgba(144,196,208,.13)",
          background:
            "linear-gradient(145deg, rgba(18,42,63,.48), rgba(6,18,33,.22) 56%, rgba(30,25,61,.2))",
          boxShadow: "0 28px 90px rgba(0,0,0,.22), inset 0 1px rgba(255,255,255,.035)",
          backdropFilter: "blur(5px)",
        }}
      />

      <div style={{position: "relative", padding: "54px 56px"}}>
        <div
          style={{
            opacity: headerReveal,
            transform: `translateY(${interpolate(headerReveal, [0, 1], [12, 0])}px)`,
            fontSize: 11,
            letterSpacing: 4.8,
            color: "#64F4D2",
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          MARKET INTELLIGENCE / 05
        </div>

        <div style={{overflow: "hidden", marginBottom: 14}}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 300,
              lineHeight: 0.98,
              letterSpacing: -2.8,
              clipPath: `inset(0 ${titleClip}% 0 0)`,
            }}
          >
            DATA<br />
            <span style={{fontWeight: 700}}>DISTRIBUTION</span>
          </div>
        </div>

        <div
          style={{
            opacity: headerReveal,
            maxWidth: 498,
            fontSize: 13,
            lineHeight: 1.6,
            color: "rgba(183,213,220,.61)",
            letterSpacing: 0.7,
          }}
        >
          Comparative signal weight across five normalized market segments.
        </div>

        <div style={{height: 34}} />

        <div style={{display: "flex", flexDirection: "column", gap: 15}}>
          {segments.map((segment, i) => {
            const start = 280 + i * 32;
            const row = spring({
              frame: frame - start,
              fps,
              durationInFrames: 58,
              config: {damping: 25, stiffness: 118, mass: 0.85},
            });
            const width = interpolate(frame, [start + 14, start + 96], [0, segment.value], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            return (
              <div
                key={segment.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr 64px",
                  alignItems: "center",
                  columnGap: 14,
                  height: 48,
                  marginLeft: -10,
                  marginRight: -10,
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderRadius: 9,
                  border: `1px solid rgba(100,244,210,${i === 0 ? coreFocus * 0.2 : 0})`,
                  background: `rgba(100,244,210,${i === 0 ? coreFocus * 0.045 : 0})`,
                  opacity: row,
                  transform: `translateX(${interpolate(row, [0, 1], [34, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    border: `1px solid ${segment.color}64`,
                    borderRadius: 6,
                    display: "grid",
                    placeItems: "center",
                    background: `${segment.color}10`,
                  }}
                >
                  <div style={{width: 7, height: 7, borderRadius: 2, background: segment.color, boxShadow: `0 0 10px ${segment.color}AA`}} />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 7,
                    }}
                  >
                    <span style={{fontSize: 12.5, letterSpacing: 2.2, color: "rgba(232,248,248,.9)", fontWeight: 700}}>
                      {segment.label}
                    </span>
                    <span style={{fontSize: 9, color: "rgba(149,184,196,.42)", letterSpacing: 1.5}}>
                      {`S${String(i + 1).padStart(2, "0")}`}
                    </span>
                  </div>
                  <div style={{height: 3, borderRadius: 4, background: "rgba(136,177,190,.09)", overflow: "hidden"}}>
                    <div
                      style={{
                        width: `${Math.min(100, width)}%`,
                        height: "100%",
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${segment.dark}, ${segment.color})`,
                        boxShadow: `0 0 9px ${segment.color}58`,
                      }}
                    />
                  </div>
                </div>
                <div style={{textAlign: "right", fontSize: 22, fontWeight: 300, letterSpacing: -0.5}}>
                  {String(Math.round(width)).padStart(2, "0")}
                  <span style={{fontSize: 10, marginLeft: 4, color: segment.color}}>%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginTop: 28,
            opacity: cardReveal,
            transform: `translateY(${interpolate(cardReveal, [0, 1], [24, 0])}px)`,
          }}
        >
          {[
            {label: "VELOCITY", value: "+18.4", unit: "%", color: "#64F4D2"},
            {label: "CONFIDENCE", value: "96.2", unit: "%", color: "#59B8FF"},
            {label: "SEGMENTS", value: "05", unit: "LIVE", color: "#A984FF"},
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                height: 102,
                borderRadius: 12,
                padding: "14px 14px 12px",
                border: "1px solid rgba(145,197,207,.11)",
                background: "linear-gradient(150deg, rgba(43,73,94,.22), rgba(8,22,38,.14))",
                overflow: "hidden",
              }}
            >
              <div style={{fontSize: 10.5, letterSpacing: 1.8, color: "rgba(184,217,224,.67)", marginBottom: 10}}>{item.label}</div>
              <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between"}}>
                <div style={{fontSize: 22, fontWeight: 400, lineHeight: 1, color: "rgba(235,250,250,.91)"}}>
                  {item.value}
                  <span style={{fontSize: 8, color: item.color, marginLeft: 4, letterSpacing: 1}}>{item.unit}</span>
                </div>
                <Sparkline frame={frame} color={item.color} delay={535 + i * 18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DataPulse: React.FC<{frame: number}> = ({frame}) => {
  const reveal = fade(frame, [350, 425, 750, 830]);
  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: "absolute", inset: 0, opacity: reveal, pointerEvents: "none"}}
    >
      <defs>
        <linearGradient id="data-route-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#64F4D2" stopOpacity="0" />
          <stop offset="0.45" stopColor="#64F4D2" stopOpacity="0.28" />
          <stop offset="1" stopColor="#59B8FF" stopOpacity="0" />
        </linearGradient>
        <filter id="route-glow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 850 545 C 980 545, 985 558, 1085 558"
        fill="none"
        stroke="url(#data-route-gradient)"
        strokeWidth="1"
        strokeDasharray="4 8"
      />
      {[0, 1, 2].map((i) => {
        const rawT = (frame - 360) * 0.0062 + i / 3;
        const t = ((rawT % 1) + 1) % 1;
        const mt = 1 - t;
        const x =
          mt * mt * mt * 850 +
          3 * mt * mt * t * 980 +
          3 * mt * t * t * 985 +
          t * t * t * 1085;
        const y =
          mt * mt * mt * 545 +
          3 * mt * mt * t * 545 +
          3 * mt * t * t * 558 +
          t * t * t * 558;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === 0 ? 3 : 1.8}
            fill={i === 0 ? "#B9FFF3" : "#64F4D2"}
            filter="url(#route-glow)"
          />
        );
      })}
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const opening = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const closing = interpolate(
    frame,
    [Math.max(0, durationInFrames - 42), Math.max(1, durationInFrames - 1)],
    [1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic)},
  );
  const cameraScale = interpolate(frame, [0, 150, 620, 900], [1.075, 1, 1, 1.012], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cameraX = interpolate(frame, [0, 170, 620, 900], [-30, 0, 0, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#020713",
        opacity: opening * closing,
      }}
    >
      <Background frame={frame} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "center center",
          transform: `translate3d(${cameraX}px, 0, 0) scale(${cameraScale})`,
        }}
      >
        <TechnicalChrome frame={frame} />
        <RadialChart frame={frame} fps={fps} />
        <DataPulse frame={frame} />
        <InsightPanel frame={frame} fps={fps} />
      </div>
      <IntroBands frame={frame} />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow: "inset 0 0 150px rgba(0,2,8,.42)",
        }}
      />
    </AbsoluteFill>
  );
};
