import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
// Internet asset source: Google Material Symbols — "man" (Rounded).
// https://fonts.google.com/icons
// Apache License 2.0:
// https://developers.google.com/fonts/docs/material_symbols#licensing
const MAN_PATH =
  "M420-110v-250h-50q-12.75 0-21.37-8.63Q340-377.25 340-390v-223q0-24.75 17.63-42.38Q375.25-673 400-673h160q24.75 0 42.38 17.62Q620-637.75 620-613v223q0 12.75-8.62 21.37Q602.75-360 590-360h-50v250q0 12.75-8.65 21.37Q522.71-80 509.93-80h-60.15Q437-80 428.5-88.63 420-97.25 420-110Zm60.08-624q-30.08 0-51.58-21.42t-21.5-51.5q0-30.08 21.42-51.58t51.5-21.5q30.08 0 51.58 21.42t21.5 51.5q0 30.08-21.42 51.58t-51.5 21.5Z";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp01(value), 3);

const COLORS = {
  ink: "#02080d",
  panel: "rgba(7, 24, 32, 0.78)",
  cyan: "#67ecff",
  cyanBright: "#d6fbff",
  cyanDark: "#159ab7",
  emerald: "#5ff5b5",
  emeraldBright: "#d7ffed",
  white: "#f3fbff",
  muted: "#86a6b2",
  dim: "#385762",
};

const PROGRESS_START = 90;
const PROGRESS_END = 690;
const MOTION_SETTLE = 780;

const PersonIcon: React.FC<{
  color: string;
  glow?: boolean;
  style?: React.CSSProperties;
}> = ({color, glow = false, style}) => (
  <svg
    viewBox="300 -930 360 870"
    aria-hidden="true"
    style={{
      display: "block",
      overflow: "visible",
      filter: glow
        ? "drop-shadow(0 0 9px rgba(103,236,255,0.72)) drop-shadow(0 0 24px rgba(95,245,181,0.30))"
        : undefined,
      ...style,
    }}
  >
    <path d={MAN_PATH} fill={color} />
  </svg>
);

const Corner: React.FC<{
  horizontal: "left" | "right";
  vertical: "top" | "bottom";
}> = ({horizontal, vertical}) => (
  <div
    style={{
      position: "absolute",
      width: 34,
      height: 34,
      [horizontal]: 24,
      [vertical]: 24,
      borderLeft:
        horizontal === "left" ? "2px solid rgba(122,230,245,0.32)" : undefined,
      borderRight:
        horizontal === "right" ? "2px solid rgba(122,230,245,0.32)" : undefined,
      borderTop:
        vertical === "top" ? "2px solid rgba(122,230,245,0.32)" : undefined,
      borderBottom:
        vertical === "bottom" ? "2px solid rgba(122,230,245,0.32)" : undefined,
    }}
  />
);

const Background: React.FC<{frame: number}> = ({frame}) => {
  const frozenFrame = Math.min(frame, MOTION_SETTLE);
  const scanX = interpolate(
    frozenFrame,
    [0, MOTION_SETTLE],
    [-300, WIDTH + 300],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 45%, #123845 0%, #071b25 31%, #031018 66%, #010509 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(88,194,214,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(88,194,214,0.055) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
          maskImage:
            "radial-gradient(ellipse 66% 64% at 50% 52%, #000 0%, rgba(0,0,0,0.66) 58%, transparent 100%)",
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5de8ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#5de8ff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#5de8ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="floorGlow">
            <stop offset="0" stopColor="#67ecff" stopOpacity="0.20" />
            <stop offset="0.55" stopColor="#47d8c3" stopOpacity="0.07" />
            <stop offset="1" stopColor="#47d8c3" stopOpacity="0" />
          </radialGradient>
          <filter id="wideBlur" x="-50%" y="-100%" width="200%" height="300%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
        </defs>
        <ellipse
          cx="960"
          cy="845"
          rx="760"
          ry="145"
          fill="url(#floorGlow)"
          filter="url(#wideBlur)"
        />
        <path
          d="M205 620 C390 215 1530 215 1715 620"
          fill="none"
          stroke="url(#arc)"
          strokeWidth="1.3"
        />
        <path
          d="M285 695 C460 360 1460 360 1635 695"
          fill="none"
          stroke="url(#arc)"
          strokeWidth="1"
          opacity="0.58"
        />
        <path
          d="M250 876 C600 930 1320 930 1670 876"
          fill="none"
          stroke="url(#arc)"
          strokeWidth="1"
          opacity="0.45"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: scanX,
          top: -100,
          width: 160,
          height: 1280,
          transform: "rotate(12deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(160,244,255,0.018), rgba(160,244,255,0.055), rgba(160,244,255,0.018), transparent)",
          filter: "blur(10px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 230px rgba(0,0,0,0.76)",
        }}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC<{
  frame: number;
  progress: number;
  complete: number;
}> = ({frame, progress, complete}) => {
  const reveal = easeOutCubic((frame - 18) / 32);
  const running = progress > 0 && progress < 1;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 78,
          top: 64,
          height: 80,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            transform: `translateY(${(1 - reveal) * 62}px)`,
            opacity: reveal,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, Arial, Helvetica, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 4.2,
              color: COLORS.cyan,
            }}
          >
            AI WORKFORCE INTELLIGENCE
          </div>
          <div
            style={{
              marginTop: 11,
              fontFamily: "Inter, Arial, Helvetica, sans-serif",
              fontSize: 25,
              fontWeight: 500,
              letterSpacing: 0.2,
              color: COLORS.white,
            }}
          >
            Capacity Forecast
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 78,
          top: 72,
          height: 45,
          padding: "0 20px",
          borderRadius: 24,
          border: `1px solid ${
            complete > 0.5
              ? "rgba(95,245,181,0.52)"
              : "rgba(103,236,255,0.24)"
          }`,
          background:
            complete > 0.5
              ? "rgba(31,112,83,0.19)"
              : "rgba(8,32,42,0.54)",
          display: "flex",
          alignItems: "center",
          gap: 11,
          opacity: reveal,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: complete > 0.5 ? COLORS.emerald : COLORS.cyan,
            boxShadow: `0 0 14px ${
              complete > 0.5 ? COLORS.emerald : COLORS.cyan
            }`,
          }}
        />
        <div
          style={{
            fontFamily: "Inter, Arial, Helvetica, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2.2,
            color: complete > 0.5 ? COLORS.emeraldBright : COLORS.cyanBright,
          }}
        >
          {complete > 0.5
            ? "FORECAST CONFIRMED"
            : progress >= 1
              ? "VERIFYING OUTPUT"
              : running
                ? "MODEL PROCESSING"
                : "MODEL READY"}
        </div>
      </div>
    </>
  );
};

const Checkmark: React.FC<{reveal: number}> = ({reveal}) => {
  const first = clamp01(reveal * 2);
  const second = clamp01(reveal * 2 - 1);

  return (
    <svg width="22" height="18" viewBox="0 0 22 18" aria-hidden="true">
      <path
        d="M2 9.5 L8 15.5"
        fill="none"
        stroke={COLORS.emeraldBright}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="8.5"
        strokeDashoffset={8.5 * (1 - first)}
      />
      <path
        d="M8 15.5 L20 2.5"
        fill="none"
        stroke={COLORS.emeraldBright}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="18"
        strokeDashoffset={18 * (1 - second)}
      />
    </svg>
  );
};

const AvatarCard: React.FC<{
  index: number;
  frame: number;
  fill: number;
  complete: number;
  emission: number;
}> = ({index, frame, fill, complete, emission}) => {
  const entrance = easeOutCubic((frame - (36 + index * 5)) / 26);
  const completed = fill >= 0.999;
  const checkReveal = easeOutCubic(
    (frame - (PROGRESS_END + 18 + index * 2)) / 22,
  );
  const cardLift = (1 - entrance) * 28;

  return (
    <div
      style={{
        position: "relative",
        width: 138,
        height: 292,
        opacity: entrance,
        transform: `translateY(${cardLift}px) scale(${1 + emission * 0.025})`,
        borderRadius: 24,
        border: `1px solid ${
          completed
            ? "rgba(95,245,181,0.34)"
            : "rgba(133,213,227,0.16)"
        }`,
        background:
          "linear-gradient(150deg, rgba(29,71,81,0.44), rgba(7,25,33,0.70) 54%, rgba(3,15,21,0.84))",
        boxShadow: completed
          ? `inset 0 1px 0 rgba(214,255,247,0.16), 0 0 ${
              18 + emission * 36
            }px rgba(70,232,194,${0.10 + emission * 0.20})`
          : "inset 0 1px 0 rgba(222,248,255,0.09), 0 20px 35px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg, transparent 12%, rgba(255,255,255,0.055) 44%, transparent 68%)",
          transform: "translateX(-18%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 18,
          top: 17,
          fontFamily: "Inter, Arial, Helvetica, sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.8,
          color: completed ? "rgba(183,255,227,0.76)" : "rgba(135,176,188,0.60)",
        }}
      >
        UNIT {String(index + 1).padStart(2, "0")}
      </div>

      <div
        style={{
          position: "absolute",
          right: 15,
          top: 14,
          width: 12,
          height: 12,
          borderRadius: "50%",
          border: `1px solid ${
            completed ? "rgba(95,245,181,0.72)" : "rgba(112,168,181,0.30)"
          }`,
          background: completed ? "rgba(95,245,181,0.18)" : "transparent",
          boxShadow: completed ? "0 0 12px rgba(95,245,181,0.60)" : undefined,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 29,
          top: 54,
          width: 80,
          height: 186,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -15,
            top: 22,
            width: 110,
            height: 150,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(79,198,218,0.10), transparent 67%)",
          }}
        />

        <PersonIcon
          color="rgba(93,128,139,0.24)"
          style={{position: "absolute", inset: 0, width: 80, height: 186}}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(${(1 - fill) * 100}% 0 0 0)`,
          }}
        >
          <PersonIcon
            color={completed ? COLORS.emerald : COLORS.cyan}
            glow
            style={{position: "absolute", inset: 0, width: 80, height: 186}}
          />
        </div>

        {fill > 0 && fill < 1 ? (
          <div
            style={{
              position: "absolute",
              left: -8,
              right: -8,
              bottom: fill * 186 - 1,
              height: 2,
              background: COLORS.cyanBright,
              boxShadow:
                "0 0 8px rgba(214,251,255,0.9), 0 0 22px rgba(103,236,255,0.72)",
              opacity: 0.84,
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 18,
          height: 3,
          borderRadius: 2,
          background: "rgba(98,144,156,0.14)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${fill * 100}%`,
            height: "100%",
            background: completed
              ? `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.emerald})`
              : COLORS.cyan,
            boxShadow: "0 0 10px rgba(103,236,255,0.70)",
          }}
        />
      </div>

      {complete > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: -28,
              right: -28,
              top: 18,
              height: 235,
              borderRadius: "50%",
              border: "1px solid rgba(95,245,181,0.72)",
              opacity: emission * 0.58,
              transform: `scale(${0.72 + emission * 0.62})`,
              boxShadow:
                "0 0 38px rgba(95,245,181,0.30), inset 0 0 34px rgba(95,245,181,0.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 127,
              width: 3,
              height: 220,
              transform: "translate(-50%, -50%)",
              background:
                "linear-gradient(transparent, rgba(210,255,238,0.85), transparent)",
              filter: "blur(1px)",
              opacity: emission * 0.48,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 49,
              top: 121,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(9,55,47,0.92)",
              border: "1px solid rgba(139,255,211,0.60)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: checkReveal,
              transform: `scale(${0.65 + 0.35 * checkReveal})`,
              boxShadow:
                "0 0 24px rgba(95,245,181,0.46), inset 0 0 13px rgba(95,245,181,0.12)",
            }}
          >
            <Checkmark reveal={checkReveal} />
          </div>
        </>
      ) : null}
    </div>
  );
};

const ProgressRail: React.FC<{
  progress: number;
  complete: number;
}> = ({progress, complete}) => {
  const width = 958;
  const endpointX = progress * width;

  return (
    <div
      style={{
        position: "absolute",
        left: 103,
        top: 663,
        width,
        height: 40,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 18,
          height: 4,
          borderRadius: 2,
          background: "rgba(89,133,146,0.17)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background:
              complete > 0.5
                ? `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.emerald})`
                : `linear-gradient(90deg, ${COLORS.cyanDark}, ${COLORS.cyanBright})`,
            boxShadow: "0 0 14px rgba(103,236,255,0.66)",
          }}
        />
      </div>

      {progress > 0 && progress < 1 ? (
        <div
          style={{
            position: "absolute",
            left: endpointX - 2,
            top: 10,
            width: 4,
            height: 20,
            borderRadius: 2,
            background: COLORS.cyanBright,
            boxShadow:
              "0 0 9px rgba(214,251,255,0.95), 0 0 25px rgba(103,236,255,0.82)",
          }}
        />
      ) : null}

      {Array.from({length: 7}).map((_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${(index / 6) * 100}%`,
            top: 31,
            width: 1,
            height: index === 0 || index === 6 ? 7 : 5,
            background:
              index / 6 <= progress
                ? "rgba(153,244,255,0.48)"
                : "rgba(104,145,155,0.22)",
          }}
        />
      ))}
    </div>
  );
};

const Dashboard: React.FC<{frame: number}> = ({frame}) => {
  const frozenFrame = Math.min(frame, MOTION_SETTLE);
  const entrance = easeOutCubic((frozenFrame - 5) / 38);
  const progress = clamp01(
    (frozenFrame - PROGRESS_START) / (PROGRESS_END - PROGRESS_START),
  );
  const percentage = progress >= 1 ? 100 : Math.floor(progress * 100);
  const numberReveal = easeOutCubic((frozenFrame - 48) / 32);
  const complete = easeOutCubic((frozenFrame - PROGRESS_END) / 42);
  const emissionEnvelope = clamp01(
    interpolate(
      frozenFrame,
      [PROGRESS_END, PROGRESS_END + 12, PROGRESS_END + 40, PROGRESS_END + 70],
      [0, 1, 0.40, 0],
      {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
    ),
  );
  const completionText = easeOutCubic((frozenFrame - (PROGRESS_END + 34)) / 28);

  return (
    <div
      style={{
        position: "absolute",
        left: 300,
        top: 120,
        width: 1320,
        height: 820,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 28}px)`,
        borderRadius: 42,
        border: "1px solid rgba(133,222,237,0.22)",
        background:
          "linear-gradient(145deg, rgba(26,61,72,0.56), rgba(6,23,31,0.83) 46%, rgba(2,14,20,0.92))",
        boxShadow:
          "inset 0 1px 0 rgba(220,251,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.34), 0 48px 140px rgba(0,0,0,0.42), 0 0 90px rgba(56,206,225,0.055)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -270,
          top: -330,
          width: 1220,
          height: 630,
          transform: "rotate(-14deg)",
          background:
            "linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.085) 49%, rgba(255,255,255,0.018) 64%, transparent 78%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 155,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(129,214,229,0.20), transparent)",
        }}
      />

      <Corner horizontal="left" vertical="top" />
      <Corner horizontal="right" vertical="top" />
      <Corner horizontal="left" vertical="bottom" />
      <Corner horizontal="right" vertical="bottom" />

      <Header frame={frozenFrame} progress={progress} complete={complete} />

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 186,
          width: 1160,
          height: 182,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            width: 450,
            height: 158,
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              transform: `translateY(${(1 - numberReveal) * 132}px)`,
              opacity: numberReveal,
              display: "flex",
              alignItems: "baseline",
              fontFamily: "Inter, Arial, Helvetica, sans-serif",
              fontVariantNumeric: "tabular-nums",
              color: complete > 0.5 ? COLORS.emeraldBright : COLORS.white,
              textShadow:
                complete > 0.5
                  ? "0 0 46px rgba(95,245,181,0.30)"
                  : "0 0 48px rgba(103,236,255,0.19)",
            }}
          >
            <div
              style={{
                width: 298,
                textAlign: "right",
                fontSize: 148,
                lineHeight: 0.85,
                fontWeight: 280,
                letterSpacing: -7,
              }}
            >
              {percentage}
            </div>
            <div
              style={{
                marginLeft: 18,
                fontSize: 47,
                lineHeight: 1,
                fontWeight: 400,
                color: complete > 0.5 ? COLORS.emerald : COLORS.cyan,
              }}
            >
              %
            </div>
          </div>
        </div>

        <div
          style={{
            marginLeft: "auto",
            width: 620,
            height: 116,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            borderTop: "1px solid rgba(123,200,214,0.15)",
            borderBottom: "1px solid rgba(123,200,214,0.15)",
            opacity: numberReveal,
          }}
        >
          {[
            ["ACTIVE UNITS", `${Math.min(6, Math.floor(progress * 6))} / 6`],
            ["MODEL CONFIDENCE", `${Math.floor(91 + progress * 8)}%`],
            ["FORECAST WINDOW", "Q4 / 90D"],
          ].map(([label, value], index) => (
            <div
              key={label}
              style={{
                padding: "24px 22px",
                borderLeft:
                  index > 0 ? "1px solid rgba(123,200,214,0.13)" : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: "Inter, Arial, Helvetica, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  color: "rgba(133,176,188,0.72)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  marginTop: 13,
                  fontFamily: "Inter, Arial, Helvetica, sans-serif",
                  fontSize: 24,
                  fontWeight: 500,
                  letterSpacing: 0.4,
                  color: complete > 0.5 ? COLORS.emeraldBright : COLORS.cyanBright,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 103,
          top: 382,
          width: 958,
          height: 292,
          display: "flex",
          gap: 26,
        }}
      >
        {Array.from({length: 6}).map((_, index) => {
          const fill = clamp01(progress * 6 - index);
          return (
            <AvatarCard
              key={index}
              index={index}
              frame={frozenFrame}
              fill={fill}
              complete={complete}
              emission={emissionEnvelope}
            />
          );
        })}
      </div>

      <ProgressRail progress={progress} complete={complete} />

      <div
        style={{
          position: "absolute",
          right: 100,
          top: 423,
          width: 112,
          height: 235,
          borderLeft: "1px solid rgba(118,190,204,0.16)",
          paddingLeft: 27,
          opacity: numberReveal,
        }}
      >
        {[
          ["01", "PLAN"],
          ["02", "MAP"],
          ["03", "SCALE"],
          ["04", "VERIFY"],
        ].map(([number, label], index) => {
          const active = progress >= index / 4;
          return (
            <div
              key={number}
              style={{
                height: 52,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "Inter, Arial, Helvetica, sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  color: active ? COLORS.cyan : "rgba(108,148,159,0.35)",
                }}
              >
                {number}
              </div>
              <div
                style={{
                  fontFamily: "Inter, Arial, Helvetica, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.3,
                  color: active ? COLORS.white : "rgba(108,148,159,0.35)",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 103,
          bottom: 56,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: numberReveal,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: complete > 0.5 ? COLORS.emerald : COLORS.cyan,
            boxShadow: `0 0 14px ${
              complete > 0.5 ? COLORS.emerald : COLORS.cyan
            }`,
          }}
        />
        <div
          style={{
            height: 18,
            overflow: "hidden",
            fontFamily: "Inter, Arial, Helvetica, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2.4,
            color: complete > 0.5 ? COLORS.emeraldBright : "rgba(158,205,216,0.74)",
          }}
        >
          <div
            style={{
              transform: `translateY(${complete > 0.5 ? -18 * completionText : 0}px)`,
            }}
          >
            <div style={{height: 18}}>ALLOCATING DIGITAL WORKFORCE</div>
            <div style={{height: 18}}>ALL CAPACITY UNITS VERIFIED</div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 103,
          bottom: 56,
          fontFamily: "Inter, Arial, Helvetica, sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2.1,
          color: "rgba(126,170,181,0.52)",
          opacity: numberReveal,
        }}
      >
        ENGINE / WFC–06
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: COLORS.ink,
        overflow: "hidden",
      }}
    >
      <Background frame={frame} />
      <Dashboard frame={frame} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 180px rgba(0,0,0,0.42)",
        }}
      />
    </AbsoluteFill>
  );
};
