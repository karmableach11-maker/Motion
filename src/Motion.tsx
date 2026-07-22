import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;

const COLORS = {
  background: "#040912",
  panel: "#0A1726",
  line: "#315068",
  text: "#EAF7FF",
  muted: "#82A1B5",
  source: "#FFB75D",
  sourceRgb: "255,183,93",
  destination: "#4FE4FF",
  destinationRgb: "79,228,255",
  success: "#6AF2B4",
  successRgb: "106,242,180",
} as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smooth = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

const sceneFade = (frame: number) =>
  interpolate(frame, [0, 38, 866, 899], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const cubicPoint = (
  t: number,
  p0: {x: number; y: number},
  p1: {x: number; y: number},
  p2: {x: number; y: number},
  p3: {x: number; y: number},
) => {
  const mt = 1 - t;
  return {
    x:
      mt * mt * mt * p0.x +
      3 * mt * mt * t * p1.x +
      3 * mt * t * t * p2.x +
      t * t * t * p3.x,
    y:
      mt * mt * mt * p0.y +
      3 * mt * mt * t * p1.y +
      3 * mt * t * t * p2.y +
      t * t * t * p3.y,
  };
};

const cubicTangent = (
  t: number,
  p0: {x: number; y: number},
  p1: {x: number; y: number},
  p2: {x: number; y: number},
  p3: {x: number; y: number},
) => {
  const mt = 1 - t;
  const x =
    3 * mt * mt * (p1.x - p0.x) +
    6 * mt * t * (p2.x - p1.x) +
    3 * t * t * (p3.x - p2.x);
  const y =
    3 * mt * mt * (p1.y - p0.y) +
    6 * mt * t * (p2.y - p1.y) +
    3 * t * t * (p3.y - p2.y);
  return (Math.atan2(y, x) * 180) / Math.PI;
};

const Background: React.FC<{frame: number}> = ({frame}) => {
  const scanX = interpolate(frame, [0, 900], [-420, 2240], {
    extrapolateLeft: "extend",
    extrapolateRight: "extend",
  });
  const gridShift = (frame * 0.12) % 64;

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: COLORS.background}}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 43%, #10233A 0%, #07121F 38%, #040912 72%, #02050A 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 20 + Math.sin(frame / 90) * 18,
          top: 220 + Math.cos(frame / 120) * 10,
          width: 760,
          height: 650,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,183,93,0.105) 0%, rgba(255,143,60,0.035) 43%, transparent 72%)",
          filter: "blur(16px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 10 - Math.sin(frame / 97) * 18,
          top: 206 - Math.cos(frame / 126) * 9,
          width: 780,
          height: 670,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,228,255,0.115) 0%, rgba(39,151,214,0.042) 44%, transparent 72%)",
          filter: "blur(16px)",
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0, opacity: 0.52}}
      >
        <defs>
          <pattern
            id="precision-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${gridShift} ${gridShift * 0.35})`}
          >
            <path
              d="M64 0H0V64"
              fill="none"
              stroke="#5B8198"
              strokeOpacity="0.105"
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="1.2" fill="#82C6D7" opacity="0.24" />
          </pattern>
          <radialGradient id="grid-mask-gradient">
            <stop offset="0" stopColor="white" stopOpacity="0.95" />
            <stop offset="0.64" stopColor="white" stopOpacity="0.36" />
            <stop offset="1" stopColor="black" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width={WIDTH} height={HEIGHT} fill="url(#grid-mask-gradient)" />
          </mask>
          <linearGradient id="floor-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#77B8CE" stopOpacity="0" />
            <stop offset="0.44" stopColor="#77B8CE" stopOpacity="0.12" />
            <stop offset="1" stopColor="#77B8CE" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#precision-grid)" mask="url(#grid-mask)" />

        <g opacity="0.34">
          {Array.from({length: 13}).map((_, i) => {
            const bottomX = -260 + i * 205;
            return (
              <line
                key={`ray-${i}`}
                x1="960"
                y1="570"
                x2={bottomX}
                y2="1080"
                stroke="url(#floor-fade)"
                strokeWidth="1"
              />
            );
          })}
          {[650, 720, 805, 900, 1005].map((y, i) => (
            <path
              key={`floor-${y}`}
              d={`M ${210 - i * 125} ${y} H ${1710 + i * 125}`}
              stroke="#73B3CA"
              strokeOpacity={0.11 - i * 0.014}
              strokeWidth="1"
            />
          ))}
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: scanX,
          top: -240,
          width: 250,
          height: 1580,
          transform: "rotate(15deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(132,232,255,0.012), rgba(191,243,255,0.07), rgba(132,232,255,0.015), transparent)",
          mixBlendMode: "screen",
          filter: "blur(8px)",
        }}
      />

      {Array.from({length: 44}).map((_, i) => {
        const x = (i * 227 + 71) % WIDTH;
        const y = (i * 139 + 47) % HEIGHT;
        const pulse = 0.15 + 0.34 * ((Math.sin(frame / 31 + i * 1.37) + 1) / 2);
        const size = i % 9 === 0 ? 2.2 : 1.15;
        return (
          <div
            key={`dust-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 3 === 0 ? COLORS.destination : "#A7C5D3",
              boxShadow:
                i % 9 === 0 ? "0 0 10px rgba(79,228,255,0.7)" : "none",
              opacity: pulse,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 5px, rgba(183,229,245,0.014) 6px)",
          opacity: 0.55,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(1,5,11,0.34) 78%, rgba(0,2,6,0.72) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const TechnicalFrame: React.FC<{frame: number}> = ({frame}) => {
  const reveal = smooth(frame, 20, 90);
  const ruleWidth = 150 * reveal;
  const tickOpacity = smooth(frame, 65, 125);

  return (
    <AbsoluteFill style={{pointerEvents: "none", color: COLORS.text}}>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 65,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * -12}px)`,
        }}
      >
        <div
          style={{
            width: 11,
            height: 11,
            border: `2px solid ${COLORS.destination}`,
            transform: `rotate(${45 + frame * 0.15}deg)`,
            boxShadow: "0 0 12px rgba(79,228,255,0.55)",
          }}
        />
        <div>
          <div
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 17,
              letterSpacing: 5.6,
              fontWeight: 700,
            }}
          >
            SECURE FILE MIGRATION
          </div>
          <div
            style={{
              marginTop: 7,
              color: COLORS.muted,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 10,
              letterSpacing: 3.2,
            }}
          >
            ENCRYPTED PEER-TO-PEER CHANNEL
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 76,
          top: 68,
          width: 285,
          opacity: reveal,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: COLORS.muted,
            fontSize: 10,
            letterSpacing: 2.4,
          }}
        >
          <span>SESSION / 03</span>
          <span style={{color: COLORS.success}}>LINK STABLE</span>
        </div>
        <div
          style={{
            marginTop: 12,
            height: 2,
            width: "100%",
            background: "rgba(83,129,153,0.24)",
          }}
        >
          <div
            style={{
              width: `${78 + Math.sin(frame / 27) * 4}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${COLORS.destination}, ${COLORS.success})`,
              boxShadow: "0 0 12px rgba(79,228,255,0.45)",
            }}
          />
        </div>
      </div>

      {[
        {left: 48, top: 46, sx: 1, sy: 1},
        {left: WIDTH - 48, top: 46, sx: -1, sy: 1},
        {left: 48, top: HEIGHT - 46, sx: 1, sy: -1},
        {left: WIDTH - 48, top: HEIGHT - 46, sx: -1, sy: -1},
      ].map((corner, i) => (
        <div
          key={`corner-${i}`}
          style={{
            position: "absolute",
            left: corner.left,
            top: corner.top,
            width: 130,
            height: 64,
            opacity: reveal * 0.72,
            transform: `scale(${corner.sx}, ${corner.sy})`,
            transformOrigin: "top left",
          }}
        >
          <div style={{width: ruleWidth, height: 1, background: "#42657A"}} />
          <div style={{width: 1, height: 42 * reveal, background: "#42657A"}} />
          <div
            style={{
              position: "absolute",
              top: -2,
              left: -2,
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: COLORS.destination,
              boxShadow: "0 0 10px rgba(79,228,255,0.8)",
            }}
          />
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: 76,
          bottom: 66,
          display: "flex",
          gap: 9,
          opacity: tickOpacity,
        }}
      >
        {Array.from({length: 18}).map((_, i) => (
          <div
            key={`integrity-${i}`}
            style={{
              width: i % 5 === 0 ? 20 : 7,
              height: 3,
              background: i < 15 ? COLORS.destination : "#263D4D",
              opacity: i < 15 ? 0.62 + 0.3 * Math.sin(frame / 24 + i) : 0.4,
            }}
          />
        ))}
        <span
          style={{
            marginLeft: 9,
            marginTop: -4,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 9,
            letterSpacing: 2.6,
            color: COLORS.muted,
          }}
        >
          PACKET INTEGRITY
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 76,
          bottom: 62,
          opacity: tickOpacity,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 9,
          letterSpacing: 2.8,
          color: COLORS.muted,
        }}
      >
        LOCAL NETWORK / PRIVATE ROUTE / NODE 06
      </div>
    </AbsoluteFill>
  );
};

type FolderProps = {
  id: string;
  frame: number;
  fps: number;
  side: "left" | "right";
  accent: string;
  accentRgb: string;
  progress: number;
  completion: number;
};

const Folder: React.FC<FolderProps> = ({
  id,
  frame,
  fps,
  side,
  accent,
  accentRgb,
  progress,
  completion,
}) => {
  const isLeft = side === "left";
  const start = isLeft ? 42 : 64;
  const arrival = clamp01(
    spring({
      frame: Math.max(0, frame - start),
      fps,
      durationInFrames: 95,
      config: {damping: 18, stiffness: 95, mass: 0.92},
    }),
  );
  const entryX = (1 - arrival) * (isLeft ? -250 : 250);
  const floatY = Math.sin(frame / 48 + (isLeft ? 0 : 1.4)) * 4;
  const glowPulse = 0.72 + 0.16 * Math.sin(frame / 29 + (isLeft ? 0 : 1));
  const activity = isLeft ? 1 - progress * 0.48 : 0.55 + progress * 0.45;
  const destinationCardY = 128 - progress * 48;
  const completionScale = 0.86 + completion * 0.14;
  const receivedFiles =
    completion >= 0.82 ? 148 : Math.min(147, Math.floor(progress * 148));
  const statusColor = isLeft
    ? accent
    : interpolateColors(completion, [0, 1], [accent, COLORS.success]);

  const backGradient = `folder-back-${id}`;
  const frontGradient = `folder-front-${id}`;
  const innerGradient = `folder-inner-${id}`;
  const glowFilter = `folder-glow-${id}`;
  const clip = `folder-clip-${id}`;

  return (
    <div
      style={{
        position: "absolute",
        left: isLeft ? 86 : 1294,
        top: 342,
        width: 540,
        height: 430,
        opacity: arrival,
        transform: `translate3d(${entryX}px, ${floatY}px, 0) scale(${0.9 + arrival * 0.1})`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 348,
          width: 386,
          height: 36,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(${accentRgb},0.28), rgba(${accentRgb},0.055) 46%, transparent 73%)`,
          filter: "blur(11px)",
          opacity: glowPulse,
          transform: `scaleX(${0.9 + activity * 0.12})`,
        }}
      />

      <svg
        width="540"
        height="430"
        viewBox="0 0 480 390"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          filter: `drop-shadow(0 24px 28px rgba(0,0,0,0.34)) drop-shadow(0 0 22px rgba(${accentRgb},0.12))`,
        }}
      >
        <defs>
          <linearGradient id={backGradient} x1="0" y1="0" x2="0.92" y2="1">
            <stop offset="0" stopColor="#1B3147" />
            <stop offset="0.52" stopColor="#102238" />
            <stop offset="1" stopColor="#081522" />
          </linearGradient>
          <linearGradient id={frontGradient} x1="0.08" y1="0" x2="0.92" y2="1">
            <stop offset="0" stopColor="#173047" />
            <stop offset="0.5" stopColor="#0D2033" />
            <stop offset="1" stopColor="#07131F" />
          </linearGradient>
          <linearGradient id={innerGradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity="0.22" />
            <stop offset="1" stopColor="#0A1624" stopOpacity="0.6" />
          </linearGradient>
          <filter id={glowFilter} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={clip}>
            <path d="M38 146Q38 118 66 118H420Q450 118 445 150L428 326Q424 351 396 351H68Q40 351 40 323Z" />
          </clipPath>
        </defs>

        <path
          d="M44 78Q44 49 73 49H176Q193 49 205 62L232 91H409Q438 91 438 120V323Q438 352 409 352H73Q44 352 44 323Z"
          fill="#050B12"
          opacity="0.65"
          transform="translate(8 9)"
        />

        <path
          d="M44 70Q44 43 71 43H179Q196 43 208 56L236 86H410Q438 86 438 114V321Q438 350 409 350H72Q44 350 44 322Z"
          fill={`url(#${backGradient})`}
          stroke="#66859A"
          strokeOpacity="0.46"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />

        <path
          d="M60 103H421V317H60Z"
          fill={`url(#${innerGradient})`}
          opacity={0.55 + activity * 0.22}
        />
        <path
          d="M61 104H420"
          stroke={accent}
          strokeOpacity={0.35 + activity * 0.28}
          strokeWidth="2"
          filter={`url(#${glowFilter})`}
        />

        {isLeft ? (
          <g>
            {[0, 1, 2].map((i) => {
              const y = 82 + i * 13 - progress * (i + 1) * 3;
              return (
                <g key={`source-card-${i}`} transform={`translate(${i * 7} ${y})`}>
                  <rect
                    x="90"
                    y="0"
                    width="270"
                    height="112"
                    rx="13"
                    fill="#102436"
                    stroke={accent}
                    strokeOpacity={0.28 + (2 - i) * 0.12}
                    strokeWidth="1.2"
                  />
                  <rect x="112" y="24" width="52" height="8" rx="4" fill={accent} opacity="0.55" />
                  <rect x="112" y="44" width={188 - i * 15} height="5" rx="2.5" fill="#93B5C7" opacity="0.34" />
                  <rect x="112" y="61" width={142 + i * 8} height="5" rx="2.5" fill="#93B5C7" opacity="0.22" />
                </g>
              );
            })}
          </g>
        ) : (
          <g transform={`translate(0 ${destinationCardY})`} opacity={0.52 + progress * 0.48}>
            <rect
              x="93"
              y="0"
              width="274"
              height="120"
              rx="14"
              fill="#102638"
              stroke={accent}
              strokeOpacity={0.34 + progress * 0.46}
              strokeWidth="1.4"
            />
            <rect x="116" y="25" width={58 + progress * 48} height="8" rx="4" fill={accent} opacity="0.68" />
            {[0, 1, 2].map((i) => (
              <rect
                key={`destination-line-${i}`}
                x="116"
                y={49 + i * 18}
                width={(128 + i * 31) * clamp01(progress * 1.25 - i * 0.08)}
                height="5"
                rx="2.5"
                fill="#A9D8E7"
                opacity={0.25 + progress * 0.25}
              />
            ))}
          </g>
        )}

        <path
          d="M38 146Q38 118 66 118H420Q450 118 445 150L428 326Q424 351 396 351H68Q40 351 40 323Z"
          fill={`url(#${frontGradient})`}
          stroke="#7693A5"
          strokeOpacity="0.54"
          strokeWidth="1.45"
          strokeLinejoin="round"
        />

        <g clipPath={`url(#${clip})`} opacity="0.86">
          <path
            d="M8 319L456 140"
            stroke={accent}
            strokeOpacity="0.09"
            strokeWidth="44"
          />
          <path
            d="M36 354L464 183"
            stroke="#FFFFFF"
            strokeOpacity="0.025"
            strokeWidth="16"
          />
        </g>

        <path
          d="M67 137H416Q426 137 424 147"
          fill="none"
          stroke={accent}
          strokeOpacity={0.58 + activity * 0.24}
          strokeWidth="2.2"
          filter={`url(#${glowFilter})`}
        />
        <path
          d="M65 333H385Q399 333 402 321"
          fill="none"
          stroke={accent}
          strokeOpacity="0.2"
          strokeWidth="1"
        />

        <g transform="translate(75 188)">
          <rect
            width="150"
            height="54"
            rx="13"
            fill="#07121D"
            stroke={accent}
            strokeOpacity="0.24"
          />
          <circle cx="25" cy="27" r="6" fill={accent} opacity={0.66 + activity * 0.3} />
          <circle cx="25" cy="27" r="12" fill="none" stroke={accent} strokeOpacity="0.22" />
          <text
            x="47"
            y="23"
            fill="#AFC8D7"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="9"
            letterSpacing="2.1"
          >
            {isLeft ? "SOURCE" : "RECEIVER"}
          </text>
          <text
            x="47"
            y="38"
            fill="#EAF7FF"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="700"
            fontSize="11"
            letterSpacing="1.7"
          >
            {isLeft ? "ARCHIVE 01" : "VAULT 02"}
          </text>
        </g>

        {!isLeft && (
          <g
            transform={`translate(344 190) scale(${completionScale})`}
            opacity={completion}
            style={{transformOrigin: "376px 220px"}}
          >
            <circle
              cx="32"
              cy="32"
              r="25"
              fill={`rgba(${COLORS.successRgb},0.1)`}
              stroke={COLORS.success}
              strokeOpacity="0.9"
              strokeWidth="2"
              filter={`url(#${glowFilter})`}
            />
            <path
              d="M20 32L28 40L45 23"
              fill="none"
              stroke={COLORS.success}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - completion}
            />
          </g>
        )}

        <path
          d="M61 111V72Q61 62 72 62H174Q185 62 193 70L211 89"
          fill="none"
          stroke={accent}
          strokeOpacity="0.16"
          strokeWidth="1"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          top: 386,
          left: 38,
          width: 466,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: smooth(frame, start + 55, start + 100),
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <span style={{fontSize: 9, letterSpacing: 2.8, color: COLORS.muted}}>
          {isLeft ? "READY / 148 FILES" : `BUFFER / ${receivedFiles} FILES`}
        </span>
        <span style={{fontSize: 9, letterSpacing: 2.4, color: statusColor}}>
          {isLeft ? "ONLINE" : completion >= 0.82 ? "VERIFIED" : "RECEIVING"}
        </span>
      </div>
    </div>
  );
};

const PATH_START = {x: 604, y: 526};
const PATH_CONTROL_1 = {x: 770, y: 386};
const PATH_CONTROL_2 = {x: 1150, y: 386};
const PATH_END = {x: 1316, y: 526};
const PATH_D = `M ${PATH_START.x} ${PATH_START.y} C ${PATH_CONTROL_1.x} ${PATH_CONTROL_1.y}, ${PATH_CONTROL_2.x} ${PATH_CONTROL_2.y}, ${PATH_END.x} ${PATH_END.y}`;

const TransferRoute: React.FC<{
  frame: number;
  progress: number;
  completion: number;
}> = ({frame, progress, completion}) => {
  const reveal = smooth(frame, 106, 188);
  const active = interpolate(frame, [128, 170, 666, 710], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{pointerEvents: "none", opacity: reveal}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{position: "absolute", inset: 0}}>
        <defs>
          <linearGradient id="route-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={COLORS.source} />
            <stop offset="0.5" stopColor="#E8F8FF" />
            <stop offset="1" stopColor={COLORS.destination} />
          </linearGradient>
          <filter id="route-glow" x="-40%" y="-80%" width="180%" height="260%">
            <feGaussianBlur stdDeviation="5" result="soft" />
            <feMerge>
              <feMergeNode in="soft" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="packet-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={PATH_D}
          fill="none"
          stroke="#5C8297"
          strokeOpacity="0.22"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d={PATH_D}
          fill="none"
          stroke="#AEC9D5"
          strokeOpacity="0.28"
          strokeWidth="1.4"
          strokeDasharray="4 14"
          strokeDashoffset={-frame * 0.8}
          strokeLinecap="round"
        />
        <path
          d={PATH_D}
          fill="none"
          stroke="url(#route-gradient)"
          strokeOpacity={0.42 * (1 - completion)}
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - progress}
          filter="url(#route-glow)"
        />
        <path
          d={PATH_D}
          fill="none"
          stroke={COLORS.success}
          strokeOpacity={completion * 0.72}
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#route-glow)"
        />

        {[0, 0.5, 1].map((t, i) => {
          const point = cubicPoint(t, PATH_START, PATH_CONTROL_1, PATH_CONTROL_2, PATH_END);
          const nodeColor = i === 0 ? COLORS.source : i === 2 ? COLORS.destination : COLORS.text;
          const resolvedNodeColor = interpolateColors(
            completion,
            [0, 1],
            [nodeColor, COLORS.success],
          );
          return (
            <g key={`route-node-${i}`} transform={`translate(${point.x} ${point.y})`}>
              <circle r="12" fill="#071421" stroke={nodeColor} strokeOpacity="0.42" />
              <circle r="3.5" fill={resolvedNodeColor} />
              <circle
                r={17 + Math.sin(frame / 18 + i) * 2}
                fill="none"
                stroke={resolvedNodeColor}
                strokeOpacity="0.15"
              />
            </g>
          );
        })}

        {Array.from({length: 15}).map((_, i) => {
          const phase = positiveModulo((frame - 128) * (0.0048 + (i % 3) * 0.0004) + i * 0.071, 1);
          const point = cubicPoint(phase, PATH_START, PATH_CONTROL_1, PATH_CONTROL_2, PATH_END);
          const angle = cubicTangent(phase, PATH_START, PATH_CONTROL_1, PATH_CONTROL_2, PATH_END);
          const edgeFade = clamp01(phase / 0.08) * clamp01((1 - phase) / 0.08);
          const color = phase < 0.46 ? COLORS.source : COLORS.destination;
          const packetLength = i % 4 === 0 ? 20 : 11;
          return (
            <g
              key={`packet-${i}`}
              transform={`translate(${point.x} ${point.y}) rotate(${angle})`}
              opacity={active * edgeFade * (0.48 + (i % 4) * 0.14)}
              filter={i % 4 === 0 ? "url(#packet-glow)" : undefined}
            >
              <rect
                x={-packetLength / 2}
                y={i % 3 === 0 ? -3 : -2}
                width={packetLength}
                height={i % 3 === 0 ? 6 : 4}
                rx="2"
                fill={color}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const CipherCore: React.FC<{
  frame: number;
  progress: number;
  completion: number;
}> = ({frame, progress, completion}) => {
  const reveal = smooth(frame, 118, 190);
  const pulse = 1 + Math.sin(frame / 17) * 0.025 * (1 - completion);
  const successSpring = 0.84 + completion * 0.16;
  const orbitColor = interpolateColors(
    completion,
    [0, 1],
    [COLORS.destination, COLORS.success],
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 890,
        top: 358,
        width: 140,
        height: 140,
        opacity: reveal,
        transform: `scale(${pulse * successSpring})`,
        transformOrigin: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -46,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${COLORS.destinationRgb},${0.09 + completion * 0.05}) 0%, transparent 67%)`,
          filter: "blur(3px)",
        }}
      />
      <svg width="140" height="140" viewBox="0 0 140 140" style={{overflow: "visible"}}>
        <defs>
          <linearGradient id="core-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={COLORS.source} />
            <stop offset="0.5" stopColor="#E9FBFF" />
            <stop offset="1" stopColor={COLORS.destination} />
          </linearGradient>
          <filter id="core-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="70" cy="70" r="61" fill="#071421" fillOpacity="0.96" stroke="#527186" strokeOpacity="0.32" />
        <circle
          cx="70"
          cy="70"
          r="55"
          fill="none"
          stroke="url(#core-ring)"
          strokeOpacity={0.62 * (1 - completion)}
          strokeWidth="2.4"
          strokeDasharray="9 8"
          strokeDashoffset={-frame * 0.72}
          filter="url(#core-glow)"
        />
        <circle
          cx="70"
          cy="70"
          r="48"
          fill="none"
          stroke={COLORS.success}
          strokeOpacity={completion * 0.88}
          strokeWidth="2.8"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - completion}
          filter="url(#core-glow)"
          transform="rotate(-90 70 70)"
        />

        <g opacity={1 - completion}>
          <path
            d="M70 37L92 48V67C92 85 82 96 70 103C58 96 48 85 48 67V48Z"
            fill="rgba(79,228,255,0.08)"
            stroke="#C7F5FF"
            strokeOpacity="0.72"
            strokeWidth="1.5"
          />
          <rect x="61" y="63" width="18" height="16" rx="4" fill="#10283A" stroke={COLORS.destination} strokeWidth="1.4" />
          <path d="M65 63V57Q65 51 70 51Q75 51 75 57V63" fill="none" stroke={COLORS.destination} strokeWidth="2" strokeLinecap="round" />
          <circle cx="70" cy="70" r="2.3" fill={COLORS.source} />
        </g>

        <g opacity={completion} transform={`translate(0 ${2 * (1 - completion)})`}>
          <circle cx="70" cy="70" r="32" fill={`rgba(${COLORS.successRgb},0.1)`} />
          <path
            d="M54 70L65 81L88 57"
            fill="none"
            stroke={COLORS.success}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - completion}
            filter="url(#core-glow)"
          />
        </g>

        {Array.from({length: 8}).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2 + frame * 0.006;
          const radius = 72;
          const x = 70 + Math.cos(angle) * radius;
          const y = 70 + Math.sin(angle) * radius;
          return (
            <circle
              key={`core-orbit-${i}`}
              cx={x}
              cy={y}
              r={i % 2 === 0 ? 1.9 : 1.2}
              fill={i < Math.floor(progress * 8) ? orbitColor : "#456173"}
              opacity={0.32 + (i % 3) * 0.14}
            />
          );
        })}
      </svg>
    </div>
  );
};

const ProgressPanel: React.FC<{
  frame: number;
  progress: number;
  completion: number;
}> = ({frame, progress, completion}) => {
  const reveal = smooth(frame, 140, 218);
  const isComplete = completion >= 0.82;
  const percent = isComplete ? 100 : Math.min(99, Math.floor(progress * 100));
  const files = isComplete ? 148 : Math.min(147, Math.floor(progress * 148));
  const data = (isComplete ? 8.42 : Math.min(8.41, progress * 8.42)).toFixed(2);
  const title =
    percent < 4
      ? "ESTABLISHING CHANNEL"
      : percent < 88
        ? "TRANSFERRING DATA"
      : isComplete
        ? "TRANSFER COMPLETE"
        : "VERIFYING PACKETS";
  const activeColor = interpolateColors(
    completion,
    [0, 1],
    [COLORS.destination, COLORS.success],
  );
  const segments = 24;

  return (
    <div
      style={{
        position: "absolute",
        left: 706,
        top: 606,
        width: 508,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 22}px)`,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -32,
          borderRadius: 26,
          background: "radial-gradient(ellipse, rgba(24,69,91,0.2), transparent 72%)",
          filter: "blur(14px)",
        }}
      />
      <div
        style={{
          position: "relative",
          padding: "21px 24px 19px",
          borderRadius: 18,
          border: "1px solid rgba(108,153,176,0.24)",
          background: "linear-gradient(135deg, rgba(12,28,43,0.91), rgba(5,16,27,0.86))",
          boxShadow: "0 18px 38px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.035)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${progress * 112 - 12}%`,
            top: -50,
            width: 55,
            height: 210,
            transform: "rotate(12deg)",
            background: `linear-gradient(90deg, transparent, rgba(${COLORS.destinationRgb},0.08), transparent)`,
            filter: "blur(4px)",
          }}
        />

        <div style={{position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between"}}>
          <div>
            <div style={{fontSize: 10, letterSpacing: 2.8, color: activeColor, fontWeight: 700}}>{title}</div>
            <div style={{marginTop: 7, fontSize: 9, letterSpacing: 2.1, color: COLORS.muted}}>END-TO-END ENCRYPTED ROUTE</div>
          </div>
          <div style={{display: "flex", alignItems: "baseline", color: COLORS.text, fontVariantNumeric: "tabular-nums"}}>
            <span style={{fontSize: 42, lineHeight: 0.8, fontWeight: 700, letterSpacing: -2}}>{percent}</span>
            <span style={{marginLeft: 4, fontSize: 13, color: activeColor, fontWeight: 700}}>%</span>
          </div>
        </div>

        <div style={{position: "relative", display: "flex", gap: 5, marginTop: 23}}>
          {Array.from({length: segments}).map((_, i) => {
            const threshold = (i + 1) / segments;
            const filled = progress >= threshold;
            const near = Math.abs(progress - threshold) < 0.07;
            const baseColor =
              i < 8 ? COLORS.source : i < 16 ? "#D9F3FA" : COLORS.destination;
            const filledColor = interpolateColors(
              completion,
              [0, 1],
              [baseColor, COLORS.success],
            );
            return (
              <div
                key={`bar-segment-${i}`}
                style={{
                  flex: 1,
                  height: 7,
                  borderRadius: 3,
                  background: filled ? filledColor : "rgba(91,127,145,0.2)",
                  opacity: filled ? 0.8 + (near ? 0.2 : 0) : 1,
                  boxShadow: filled && near ? `0 0 12px rgba(${COLORS.destinationRgb},0.7)` : "none",
                }}
              />
            );
          })}
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid rgba(106,148,168,0.16)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            color: COLORS.muted,
          }}
        >
          {[
            {label: "FILES", value: `${files} / 148`},
            {label: "TRANSFERRED", value: `${data} GB`},
            {label: "INTEGRITY", value: isComplete ? "VERIFIED" : "100%"},
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                paddingLeft: i === 0 ? 0 : 18,
                borderLeft: i === 0 ? "none" : "1px solid rgba(106,148,168,0.15)",
              }}
            >
              <div style={{fontSize: 8, letterSpacing: 2.1, opacity: 0.7}}>{stat.label}</div>
              <div style={{marginTop: 7, color: i === 2 && isComplete ? activeColor : COLORS.text, fontSize: 12, letterSpacing: 1.1, fontWeight: 700, fontVariantNumeric: "tabular-nums"}}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CompletionPulse: React.FC<{frame: number; completion: number}> = ({frame, completion}) => {
  if (completion <= 0.001) return null;
  const radius = 92 + completion * 420;
  const opacity = clamp01(completion / 0.12) * (1 - completion) * 0.34;
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <circle
          cx="960"
          cy="428"
          r={radius}
          fill="none"
          stroke={COLORS.success}
          strokeOpacity={opacity}
          strokeWidth={3 - completion * 1.6}
        />
        <circle
          cx="960"
          cy="428"
          r={radius * 0.75}
          fill="none"
          stroke={COLORS.success}
          strokeOpacity={opacity * 0.55}
          strokeWidth="1"
          strokeDasharray="5 16"
          strokeDashoffset={-frame * 0.4}
        />
      </svg>
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = interpolate(frame, [154, 670], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.2, 1),
  });
  const completion = clamp01(
    spring({
      frame: Math.max(0, frame - 670),
      fps,
      durationInFrames: 78,
      config: {damping: 17, stiffness: 105, mass: 0.88},
    }),
  );
  const opacity = sceneFade(frame);
  const cameraScale = interpolate(frame, [0, 190, 690, 850], [0.945, 1, 1.012, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cameraY = interpolate(frame, [0, 190, 850], [18, 0, -4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: COLORS.background}}>
      <Background frame={frame} />
      <AbsoluteFill
        style={{
          opacity,
          transform: `translate3d(0, ${cameraY}px, 0) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <TechnicalFrame frame={frame} />
        <TransferRoute frame={frame} progress={progress} completion={completion} />
        <Folder
          id="source"
          frame={frame}
          fps={fps}
          side="left"
          accent={COLORS.source}
          accentRgb={COLORS.sourceRgb}
          progress={progress}
          completion={completion}
        />
        <Folder
          id="destination"
          frame={frame}
          fps={fps}
          side="right"
          accent={COLORS.destination}
          accentRgb={COLORS.destinationRgb}
          progress={progress}
          completion={completion}
        />
        <CipherCore frame={frame} progress={progress} completion={completion} />
        <ProgressPanel frame={frame} progress={progress} completion={completion} />
        <CompletionPulse frame={frame} completion={completion} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
