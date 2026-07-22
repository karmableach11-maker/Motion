import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Point = {x: number; y: number};

const W = 1920;
const H = 1080;

const RED = "#ef334f";
const RED_DARK = "#a90731";
const INK = "#17202b";
const MUTED = "#718091";
const PAPER = "#f7f7f2";

const trendPoints: Point[] = [
  {x: 334, y: 266},
  {x: 518, y: 421},
  {x: 698, y: 346},
  {x: 896, y: 562},
  {x: 1082, y: 504},
  {x: 1298, y: 724},
  {x: 1510, y: 824},
];

const trendPath = trendPoints
  .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
  .join(" ");

const segmentData = trendPoints.slice(1).map((point, index) => {
  const from = trendPoints[index];
  const dx = point.x - from.x;
  const dy = point.y - from.y;
  return {
    from,
    to: point,
    length: Math.hypot(dx, dy),
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
});

const totalPathLength = segmentData.reduce((sum, segment) => sum + segment.length, 0);

const getPointOnTrend = (progress: number) => {
  const safe = Math.max(0, Math.min(1, progress));
  let distance = safe * totalPathLength;

  for (const segment of segmentData) {
    if (distance <= segment.length) {
      const local = segment.length === 0 ? 0 : distance / segment.length;
      return {
        x: segment.from.x + (segment.to.x - segment.from.x) * local,
        y: segment.from.y + (segment.to.y - segment.from.y) * local,
        angle: segment.angle,
      };
    }
    distance -= segment.length;
  }

  const last = segmentData[segmentData.length - 1];
  return {x: last.to.x, y: last.to.y, angle: last.angle};
};

const cumulativeNodeProgress = trendPoints.map((_, nodeIndex) => {
  if (nodeIndex === 0) return 0;
  const distance = segmentData
    .slice(0, nodeIndex)
    .reduce((sum, segment) => sum + segment.length, 0);
  return distance / totalPathLength;
});

const candles = [
  {x: 286, top: 286, bottom: 385, open: 310, close: 354, tone: "dark"},
  {x: 362, top: 320, bottom: 442, open: 345, close: 407, tone: "red"},
  {x: 438, top: 352, bottom: 478, open: 382, close: 440, tone: "red"},
  {x: 514, top: 383, bottom: 506, open: 412, close: 463, tone: "red"},
  {x: 590, top: 348, bottom: 472, open: 430, close: 383, tone: "dark"},
  {x: 666, top: 325, bottom: 446, open: 405, close: 356, tone: "dark"},
  {x: 742, top: 377, bottom: 510, open: 402, close: 478, tone: "red"},
  {x: 818, top: 428, bottom: 565, open: 452, close: 530, tone: "red"},
  {x: 894, top: 488, bottom: 620, open: 514, close: 582, tone: "red"},
  {x: 970, top: 474, bottom: 604, open: 568, close: 508, tone: "dark"},
  {x: 1046, top: 442, bottom: 574, open: 538, close: 474, tone: "dark"},
  {x: 1122, top: 505, bottom: 646, open: 530, close: 612, tone: "red"},
  {x: 1198, top: 564, bottom: 701, open: 590, close: 670, tone: "red"},
  {x: 1274, top: 627, bottom: 758, open: 650, close: 724, tone: "red"},
  {x: 1350, top: 660, bottom: 796, open: 688, close: 758, tone: "red"},
  {x: 1426, top: 701, bottom: 830, open: 724, close: 794, tone: "red"},
  {x: 1502, top: 744, bottom: 864, open: 767, close: 830, tone: "red"},
];

const volumes = [
  55, 83, 42, 96, 62, 46, 76, 104, 72, 126, 86, 118, 146, 112, 154, 132, 171,
  143, 184, 166, 198, 178, 214, 192,
];

const particles = Array.from({length: 34}, (_, i) => ({
  x: 96 + ((i * 227) % 1728),
  y: 90 + ((i * 149) % 900),
  r: 1 + ((i * 7) % 3) * 0.45,
  phase: ((i * 37) % 100) / 100,
}));

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const Label: React.FC<{
  x: number;
  y: number;
  kicker: string;
  value: string;
  delay: number;
  timeline: number;
  outro: number;
}> = ({x, y, kicker, value, delay, timeline, outro}) => {
  const enter = interpolate(timeline, [delay, delay + 0.55], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 190,
        opacity: enter * outro,
        transform: `translateY(${(1 - enter) * 16}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          color: MUTED,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2.7,
        }}
      >
        <span style={{width: 22, height: 2, backgroundColor: RED, borderRadius: 2}} />
        {kicker}
      </div>
      <div
        style={{
          marginTop: 7,
          color: INK,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        {value}
      </div>
    </div>
  );
};

const GlobeGauge: React.FC<{timeline: number; outro: number; pulse: number}> = ({
  timeline,
  outro,
  pulse,
}) => {
  const enter = interpolate(timeline, [1.05, 2.1], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const spin = timeline * 5.5;

  return (
    <div
      style={{
        position: "absolute",
        left: 1524,
        top: 142,
        width: 208,
        height: 208,
        opacity: enter * outro,
        transform: `translateY(${(1 - enter) * 20}px) scale(${0.96 + enter * 0.04})`,
      }}
    >
      <svg width="208" height="208" viewBox="0 0 208 208">
        <defs>
          <linearGradient id="globe-ring" x1="20" y1="25" x2="188" y2="184">
            <stop offset="0" stopColor="#bdc6cf" />
            <stop offset="0.65" stopColor="#d5dbe0" />
            <stop offset="1" stopColor={RED} />
          </linearGradient>
          <filter id="globe-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#26323d" floodOpacity="0.12" />
          </filter>
        </defs>
        <circle cx="104" cy="104" r="88" fill="#fbfbf8" stroke="url(#globe-ring)" strokeWidth="2" filter="url(#globe-shadow)" />
        <g
          fill="none"
          stroke="#aab5c0"
          strokeWidth="1.2"
          opacity="0.65"
          transform={`rotate(${spin} 104 104)`}
        >
          <ellipse cx="104" cy="104" rx="37" ry="88" />
          <ellipse cx="104" cy="104" rx="67" ry="88" />
          <path d="M 19 79 C 61 95 147 95 189 79" />
          <path d="M 19 129 C 61 113 147 113 189 129" />
          <path d="M 16 104 H 192" />
        </g>
        <circle cx="104" cy="104" r="72" fill="none" stroke={RED} strokeWidth="1.6" strokeDasharray="3 12" opacity={0.42 + pulse * 0.25} transform={`rotate(${-spin * 1.5} 104 104)`} />
        <circle cx="155" cy="136" r={4 + pulse * 4} fill={RED} opacity={0.75} />
        <circle cx="155" cy="136" r={10 + pulse * 9} fill="none" stroke={RED} strokeWidth="1" opacity={0.3 * (1 - pulse)} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 88,
          width: 110,
          textAlign: "center",
          color: INK,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2.1,
        }}
      >
        GLOBAL RISK
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const duration = Math.max(1, durationInFrames - 1);
  const progress = frame / duration;
  const timeline = progress * 15;

  const intro = interpolate(timeline, [0, 0.75], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const outro = interpolate(timeline, [12.9, 14.75], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const contentEnvelope = intro * outro;

  const pathReveal = interpolate(timeline, [1.35, 6.65], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.68, 0.1, 1),
  });
  const arrow = getPointOnTrend(pathReveal);

  const dataBuild = interpolate(timeline, [0.85, 4.9], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const metricBuild = interpolate(timeline, [4.8, 7.35], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const impactAge = interpolate(timeline, [6.55, 7.55], [0, 1], clamp);
  const impactFlash = interpolate(timeline, [6.45, 6.65, 7.4], [0, 1, 0], clamp);
  const impactPulse = Math.max(0, Math.sin(impactAge * Math.PI));
  const shakeAge = Math.max(0, timeline - 6.58);
  const shake =
    timeline >= 6.58 && timeline <= 7.15
      ? Math.sin(shakeAge * fps * 0.78) * Math.exp(-shakeAge * 6.2) * 6.5
      : 0;

  const cameraEase = Math.sin(progress * Math.PI);
  const cameraScale = 1 + cameraEase * 0.021;
  const gridX = Math.sin(progress * Math.PI * 2) * 10;
  const gridY = Math.cos(progress * Math.PI * 2) * 7 - 7;
  const scanY = ((timeline * 132) % 1260) - 90;
  const counter = 38.4 * metricBuild;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -80,
          transform: `translate(${gridX}px, ${gridY}px)`,
          backgroundImage:
            "linear-gradient(rgba(54,67,80,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(54,67,80,0.055) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 76%)",
          opacity: 0.86,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: -210,
          top: -330,
          width: 920,
          height: 920,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239,51,79,0.055) 0%, rgba(239,51,79,0) 68%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -250,
          bottom: -390,
          width: 980,
          height: 980,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(22,32,43,0.055) 0%, rgba(22,32,43,0) 70%)",
        }}
      />

      {particles.map((particle, i) => {
        const phase = progress + particle.phase;
        const twinkle = 0.45 + 0.55 * Math.sin(phase * Math.PI * 2);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: particle.x + Math.sin(phase * Math.PI * 2) * 6,
              top: particle.y + Math.cos(phase * Math.PI * 2) * 4,
              width: particle.r * 2,
              height: particle.r * 2,
              borderRadius: "50%",
              backgroundColor: i % 7 === 0 ? RED : "#7e8b98",
              opacity: contentEnvelope * (0.08 + twinkle * 0.09),
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 94,
          top: 66,
          width: 1732,
          height: 948,
          borderRadius: 36,
          border: "1px solid rgba(96,110,124,0.15)",
          background: "linear-gradient(145deg, rgba(255,255,253,0.88), rgba(247,248,244,0.48))",
          boxShadow: "0 28px 80px rgba(40,49,58,0.10), inset 0 1px 0 rgba(255,255,255,0.95)",
          opacity: 0.92 * contentEnvelope,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 54%",
          transform: `translate(${shake}px, ${-cameraEase * 4}px) scale(${cameraScale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 140,
            top: 112,
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: contentEnvelope,
          }}
        >
          <div style={{width: 13, height: 13, borderRadius: "50%", backgroundColor: RED, boxShadow: "0 0 0 8px rgba(239,51,79,0.09)"}} />
          <div style={{color: INK, fontSize: 14, fontWeight: 800, letterSpacing: 3.4}}>MARKET PRESSURE</div>
          <div style={{width: 84, height: 1, backgroundColor: "rgba(80,94,108,0.28)"}} />
          <div style={{color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 2.2}}>DOWNTREND SIGNAL / ACTIVE</div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 140,
            top: 116,
            color: MUTED,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2.4,
            opacity: contentEnvelope,
          }}
        >
          ANALYTICS FRAME 07 · 60HZ
        </div>

        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{position: "absolute", inset: 0}}
        >
          <defs>
            <linearGradient id="arrow-gradient" x1="260" y1="250" x2="1540" y2="840" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff6371" />
              <stop offset="0.55" stopColor={RED} />
              <stop offset="1" stopColor="#c50b3a" />
            </linearGradient>
            <linearGradient id="area-gradient" x1="0" y1="250" x2="0" y2="860" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={RED} stopOpacity="0.14" />
              <stop offset="1" stopColor={RED} stopOpacity="0" />
            </linearGradient>
            <filter id="arrow-shadow" x="-20%" y="-30%" width="150%" height="180%">
              <feDropShadow dx="0" dy="16" stdDeviation="13" floodColor="#74051f" floodOpacity="0.24" />
            </filter>
            <filter id="arrow-glow" x="-30%" y="-50%" width="170%" height="220%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <filter id="soft-shadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#1c2731" floodOpacity="0.18" />
            </filter>
            <clipPath id="chart-clip">
              <rect x="176" y="194" width="1390" height="694" rx="28" />
            </clipPath>
          </defs>

          <g opacity={0.68 * contentEnvelope}>
            {[270, 390, 510, 630, 750, 870].map((y, index) => (
              <g key={y}>
                <line x1="176" y1={y} x2="1568" y2={y} stroke="#657382" strokeOpacity="0.12" strokeWidth="1" />
                <text x="151" y={y + 4} fill={MUTED} fillOpacity="0.7" fontSize="10" textAnchor="end" letterSpacing="1.2">
                  {String(96 - index * 13).padStart(2, "0")}
                </text>
              </g>
            ))}
            {[250, 450, 650, 850, 1050, 1250, 1450].map((x, index) => (
              <g key={x}>
                <line x1={x} y1="194" x2={x} y2="888" stroke="#657382" strokeOpacity="0.07" strokeWidth="1" />
                <text x={x} y="914" fill={MUTED} fillOpacity="0.65" fontSize="10" textAnchor="middle" letterSpacing="1.2">
                  {String(index + 1).padStart(2, "0")}:00
                </text>
              </g>
            ))}
          </g>

          <g clipPath="url(#chart-clip)" opacity={outro}>
            {candles.map((candle, index) => {
              const enter = interpolate(dataBuild, [index / candles.length, Math.min(1, index / candles.length + 0.22)], [0, 1], {
                ...clamp,
                easing: Easing.out(Easing.cubic),
              });
              const bodyBottom = Math.max(candle.open, candle.close);
              const bodyHeight = Math.abs(candle.close - candle.open);
              const color = candle.tone === "red" ? RED : "#536272";
              return (
                <g key={candle.x} opacity={0.22 + enter * 0.44}>
                  <line
                    x1={candle.x}
                    y1={candle.bottom - (candle.bottom - candle.top) * enter}
                    x2={candle.x}
                    y2={candle.bottom}
                    stroke={color}
                    strokeWidth="2"
                  />
                  <rect
                    x={candle.x - 10}
                    y={bodyBottom - bodyHeight * enter}
                    width="20"
                    height={Math.max(1, bodyHeight * enter)}
                    rx="3"
                    fill={color}
                  />
                </g>
              );
            })}

            <path
              d={`${trendPath} L 1510 890 L 334 890 Z`}
              fill="url(#area-gradient)"
              opacity={interpolate(pathReveal, [0.52, 1], [0, 0.7], clamp)}
            />

            <g opacity={0.32 * dataBuild}>
              {volumes.map((height, index) => {
                const x = 210 + index * 57;
                const local = interpolate(dataBuild, [index / volumes.length, Math.min(1, index / volumes.length + 0.25)], [0, 1], {
                  ...clamp,
                  easing: Easing.out(Easing.cubic),
                });
                return (
                  <rect
                    key={index}
                    x={x}
                    y={882 - height * local}
                    width="24"
                    height={height * local}
                    rx="4"
                    fill={index > 11 ? RED : "#728090"}
                    opacity={0.35 + (index / volumes.length) * 0.35}
                  />
                );
              })}
            </g>
          </g>

          <path
            d={trendPath}
            fill="none"
            stroke={RED_DARK}
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalPathLength}
            strokeDashoffset={totalPathLength * (1 - pathReveal)}
            opacity={0.18 * outro}
            transform="translate(0 13)"
            filter="url(#arrow-shadow)"
          />
          <path
            d={trendPath}
            fill="none"
            stroke={RED}
            strokeWidth="46"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalPathLength}
            strokeDashoffset={totalPathLength * (1 - pathReveal)}
            opacity={0.16 * outro}
            filter="url(#arrow-glow)"
          />
          <path
            d={trendPath}
            fill="none"
            stroke="url(#arrow-gradient)"
            strokeWidth="25"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalPathLength}
            strokeDashoffset={totalPathLength * (1 - pathReveal)}
            opacity={outro}
            filter="url(#arrow-shadow)"
          />
          <path
            d={trendPath}
            fill="none"
            stroke="#ff9ba4"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalPathLength}
            strokeDashoffset={totalPathLength * (1 - pathReveal)}
            opacity={0.72 * outro}
            transform="translate(0 -5)"
          />

          {trendPoints.slice(1, -1).map((point, nodeIndex) => {
            const threshold = cumulativeNodeProgress[nodeIndex + 1];
            const pulse = interpolate(pathReveal, [threshold, Math.min(1, threshold + 0.065), Math.min(1, threshold + 0.16)], [0, 1, 0], clamp);
            const visible = interpolate(pathReveal, [threshold - 0.01, threshold + 0.025], [0, 1], clamp) * outro;
            return (
              <g key={`${point.x}-${point.y}`} opacity={visible}>
                <circle cx={point.x} cy={point.y} r={7} fill="#fff" stroke={RED} strokeWidth="4" filter="url(#soft-shadow)" />
                <circle cx={point.x} cy={point.y} r={16 + pulse * 30} fill="none" stroke={RED} strokeWidth="1.5" opacity={pulse * 0.55} />
              </g>
            );
          })}

          <g
            transform={`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`}
            opacity={pathReveal > 0.006 ? outro : 0}
            filter="url(#arrow-shadow)"
          >
            <path d="M 20 0 L -34 -35 L -23 -8 L -53 -8 L -53 8 L -23 8 L -34 35 Z" fill={RED_DARK} opacity="0.22" transform="translate(0 11)" />
            <path d="M 20 0 L -34 -35 L -23 -8 L -53 -8 L -53 8 L -23 8 L -34 35 Z" fill="url(#arrow-gradient)" />
            <path d="M 10 -2 L -29 -27 L -22 -11" fill="none" stroke="#ff9da7" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          </g>

          {[0, 1, 2].map((ring) => (
            <circle
              key={ring}
              cx="1510"
              cy="824"
              r={24 + impactAge * (58 + ring * 34)}
              fill="none"
              stroke={ring === 0 ? RED : "#b21d3e"}
              strokeWidth={2.4 - ring * 0.45}
              opacity={impactFlash * (0.55 - ring * 0.11)}
            />
          ))}
          <circle cx="1510" cy="824" r={18 + impactPulse * 18} fill={RED} opacity={impactFlash * 0.16} />
        </svg>

        <Label x={480} y={477} kicker="BREAK 01" value="SUPPORT LOST" delay={3.35} timeline={timeline} outro={outro} />
        <Label x={856} y={616} kicker="BREAK 02" value="MOMENTUM −" delay={4.72} timeline={timeline} outro={outro} />
        <Label x={1200} y={774} kicker="THRESHOLD" value="RISK ELEVATED" delay={5.95} timeline={timeline} outro={outro} />

        <GlobeGauge timeline={timeline} outro={outro} pulse={0.5 + 0.5 * Math.sin(timeline * 2.3)} />

        <div
          style={{
            position: "absolute",
            right: 164,
            top: 382,
            width: 282,
            padding: "23px 25px 22px",
            borderRadius: 19,
            border: "1px solid rgba(89,103,117,0.16)",
            background: "rgba(253,253,249,0.76)",
            boxShadow: "0 18px 42px rgba(33,43,53,0.09)",
            opacity: interpolate(timeline, [4.45, 5.2], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) * outro,
            transform: `translateY(${(1 - metricBuild) * 18}px)`,
          }}
        >
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span style={{color: MUTED, fontSize: 10, fontWeight: 800, letterSpacing: 2.4}}>PRESSURE INDEX</span>
            <span style={{width: 8, height: 8, borderRadius: "50%", backgroundColor: RED, boxShadow: `0 0 0 ${4 + impactPulse * 3}px rgba(239,51,79,0.10)`}} />
          </div>
          <div style={{marginTop: 13, color: INK, fontSize: 44, fontWeight: 800, letterSpacing: -1.5, fontVariantNumeric: "tabular-nums"}}>
            −{counter.toFixed(1)}<span style={{fontSize: 21, marginLeft: 4, color: RED}}>%</span>
          </div>
          <div style={{marginTop: 13, height: 7, borderRadius: 8, backgroundColor: "rgba(91,104,117,0.12)", overflow: "hidden"}}>
            <div style={{width: `${metricBuild * 88}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, #ff7a84, ${RED})`, boxShadow: "0 0 14px rgba(239,51,79,0.35)"}} />
          </div>
          <div style={{display: "flex", justifyContent: "space-between", marginTop: 10, color: MUTED, fontSize: 9, fontWeight: 700, letterSpacing: 1.5}}>
            <span>BASELINE</span><span>CRITICAL</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 142,
            bottom: 92,
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: MUTED,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            opacity: contentEnvelope,
          }}
        >
          <span>LIVE DATA</span>
          <span style={{width: 116, height: 1, backgroundColor: "rgba(90,103,117,0.26)"}} />
          <span>VOLUME / MOMENTUM / RISK</span>
        </div>

        <div
          style={{
            position: "absolute",
            right: 146,
            bottom: 88,
            color: RED,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2.6,
            opacity: interpolate(timeline, [6.3, 6.8], [0, 1], clamp) * outro,
          }}
        >
          ▼ NEGATIVE MOMENTUM
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: scanY,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(239,51,79,0.10), rgba(255,255,255,0.65), transparent)",
          boxShadow: "0 0 18px rgba(239,51,79,0.08)",
          opacity: 0.26 * contentEnvelope,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 170px rgba(24,32,42,0.08)",
        }}
      />
    </AbsoluteFill>
  );
};
