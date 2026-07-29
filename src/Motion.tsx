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

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

const phase = (
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
  const value = Math.sin(seed * 79.421 + 17.173) * 43758.5453;
  return value - Math.floor(value);
};

const DOTS = Array.from({ length: 54 }, (_, index) => ({
  x: seeded(index + 11) * WIDTH,
  y: seeded(index + 101) * HEIGHT,
  size: 1 + seeded(index + 201) * 2.6,
  opacity: 0.1 + seeded(index + 301) * 0.3,
  wave: seeded(index + 401) * TAU,
}));

const STREAMS = Array.from({ length: 8 }, (_, index) => ({
  y: 100 + seeded(index + 501) * 830,
  length: 120 + seeded(index + 601) * 230,
  speed: 0.45 + seeded(index + 701) * 0.65,
  offset: seeded(index + 801) * 2200,
  opacity: 0.08 + seeded(index + 901) * 0.12,
}));

const CheckIcon: React.FC<{
  readonly size?: number;
  readonly color?: string;
}> = ({ size = 28, color = "#6ff4cc" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <path
      d="M7.5 16.5L13 22L24.5 10.5"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
  </svg>
);

const SparkIcon: React.FC<{
  readonly size?: number;
  readonly color?: string;
}> = ({ size = 27, color = "#b6a5ff" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <path
      d="M16 2.8C17.2 10.4 21.6 14.8 29.2 16C21.6 17.2 17.2 21.6 16 29.2C14.8 21.6 10.4 17.2 2.8 16C10.4 14.8 14.8 10.4 16 2.8Z"
      fill={`${color}20`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.7"
    />
    <circle cx="26" cy="6.5" r="1.8" fill={color} />
  </svg>
);

const CloudIcon: React.FC<{
  readonly size?: number;
  readonly color?: string;
}> = ({ size = 28, color = "#72ddff" }) => (
  <svg width={size} height={size} viewBox="0 0 36 32" aria-hidden>
    <path
      d="M9.3 26.5H27.7C32.1 26.5 34.5 23.8 34.5 20.1C34.5 16.4 31.9 13.8 28.3 13.6C27.3 8.5 23.3 5.4 18.4 5.4C13.4 5.4 9.7 8.6 8.6 12.6C4.4 12.8 1.5 15.6 1.5 19.5C1.5 23.6 4.5 26.5 9.3 26.5Z"
      fill={`${color}14`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M18 14V23M13.8 18.2L18 14L22.2 18.2"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    />
  </svg>
);

const LockIcon: React.FC<{
  readonly size?: number;
  readonly color?: string;
}> = ({ size = 27, color = "#6ff4cc" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <rect
      x="5.2"
      y="13"
      width="21.6"
      height="15.2"
      rx="4.2"
      fill={`${color}13`}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M10 13V10.2C10 6.7 12.5 4.2 16 4.2C19.5 4.2 22 6.7 22 10.2V13"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="1.9"
    />
    <circle cx="16" cy="20" r="2" fill={color} />
  </svg>
);

const Background: React.FC<{ readonly frame: number }> = ({ frame }) => {
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #14244a 0%, #09142c 38%, #030814 74%, #01040b 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.3,
          backgroundImage:
            "linear-gradient(rgba(117,151,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(117,151,255,0.055) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `${(frame * 0.06) % 72}px ${(frame * 0.035) % 72}px`,
          maskImage:
            "radial-gradient(circle at center, black 0%, rgba(0,0,0,0.72) 47%, transparent 88%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 245,
          top: 55,
          width: 790,
          height: 790,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(93,75,255,0.22), rgba(93,75,255,0.05) 46%, transparent 72%)",
          filter: "blur(44px)",
          opacity: 0.72 + Math.sin(frame / 95) * 0.06,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 150,
          top: 200,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(36,202,255,0.18), rgba(36,202,255,0.04) 52%, transparent 75%)",
          filter: "blur(50px)",
          opacity: 0.72 + Math.cos(frame / 112) * 0.05,
        }}
      />
      {STREAMS.map((stream, index) => {
        const x =
          ((frame * stream.speed * 2.4 + stream.offset) %
            (WIDTH + stream.length + 300)) -
          stream.length -
          150;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: stream.y,
              width: stream.length,
              height: 1,
              opacity: stream.opacity,
              background:
                "linear-gradient(90deg, transparent, rgba(112,225,255,0.8), transparent)",
            }}
          />
        );
      })}
      {DOTS.map((dot, index) => {
        const pulse = 0.7 + Math.sin(frame / 44 + dot.wave) * 0.3;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y + Math.sin(frame / 80 + dot.wave) * 5,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: index % 4 === 0 ? "#a995ff" : "#65dcff",
              opacity: dot.opacity * pulse,
              boxShadow: "0 0 10px currentColor",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(112deg, transparent 12%, rgba(255,255,255,0.025) 43%, transparent 67%)",
          transform: `translateX(${Math.sin(frame / 150) * 90}px)`,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

const WorkspaceWindow: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const header = phase(frame, 18, 68);
  const syncPulse = 0.76 + Math.sin(frame / 20) * 0.22;

  return (
    <div
      style={{
        position: "absolute",
        left: 270,
        top: 118,
        width: 1380,
        height: 844,
        borderRadius: 32,
        overflow: "hidden",
        opacity: reveal,
        transform: `translateY(${mix(22, 0, reveal)}px) scale(${mix(
          0.985,
          1,
          reveal,
        )})`,
        background:
          "linear-gradient(145deg, rgba(14,27,57,0.93), rgba(5,12,28,0.95))",
        border: "1px solid rgba(156,184,255,0.24)",
        boxShadow:
          "0 58px 140px rgba(0,0,0,0.48), 0 0 0 1px rgba(78,113,206,0.05) inset, 0 1px 0 rgba(255,255,255,0.08) inset",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 51% 38%, rgba(87,102,255,0.11), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.018), transparent 32%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: 82,
          borderBottom: "1px solid rgba(141,175,255,0.15)",
          background:
            "linear-gradient(180deg, rgba(28,45,85,0.54), rgba(12,24,51,0.36))",
          display: "flex",
          alignItems: "center",
          opacity: header,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 11,
            marginLeft: 30,
            marginRight: 31,
          }}
        >
          {["#ff7085", "#ffc45e", "#6de4be"].map((color) => (
            <div
              key={color}
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 14px ${color}45`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            width: 1,
            height: 31,
            background: "rgba(148,179,255,0.14)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginLeft: 28,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(145deg, rgba(132,107,255,0.3), rgba(55,193,255,0.15))",
              border: "1px solid rgba(151,137,255,0.45)",
              boxShadow: "0 0 26px rgba(112,90,255,0.18)",
            }}
          >
            <SparkIcon size={22} />
          </div>
          <div>
            <div
              style={{
                color: "#f4f7ff",
                fontSize: 22,
                fontWeight: 760,
                letterSpacing: 0.35,
                lineHeight: 1.1,
              }}
            >
              AI DATA WORKSPACE
            </div>
            <div
              style={{
                color: "rgba(173,199,241,0.7)",
                fontSize: 15,
                fontWeight: 650,
                letterSpacing: 1.25,
                marginTop: 5,
              }}
            >
              SMART ORGANIZATION SESSION
            </div>
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            marginRight: 34,
            height: 42,
            borderRadius: 21,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid rgba(101,239,199,0.24)",
            background: "rgba(42,149,119,0.09)",
            color: "#91f6d5",
            fontSize: 15,
            fontWeight: 760,
            letterSpacing: 0.9,
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#65efc2",
              opacity: syncPulse,
              boxShadow: "0 0 15px #65efc2",
            }}
          />
          CLOUD SYNC ACTIVE
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 108,
          width: 180,
          height: 660,
          borderRight: "1px solid rgba(136,170,244,0.08)",
          opacity: header,
        }}
      >
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: 56 + index * 96,
              left: 26,
              width: index === 1 ? 112 : 76 + index * 7,
              height: 13,
              borderRadius: 7,
              background:
                index === 1
                  ? "linear-gradient(90deg, rgba(143,123,255,0.55), rgba(84,207,255,0.25))"
                  : "rgba(137,169,232,0.1)",
              boxShadow:
                index === 1 ? "0 0 22px rgba(121,109,255,0.16)" : "none",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 26,
            bottom: 42,
            width: 118,
            height: 74,
            borderRadius: 18,
            border: "1px solid rgba(126,168,242,0.1)",
            background: "rgba(38,67,116,0.08)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 238,
          top: 104,
          right: 38,
          bottom: 36,
          borderRadius: 25,
          border: "1px solid rgba(127,165,244,0.08)",
          background:
            "linear-gradient(180deg, rgba(6,16,37,0.22), rgba(7,15,32,0.08))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 256,
          top: 122,
          color: "rgba(155,187,237,0.66)",
          fontSize: 15,
          fontWeight: 720,
          letterSpacing: 1.55,
        }}
      >
        COLLECTIONS&nbsp;&nbsp;/&nbsp;&nbsp;DATA MANAGEMENT
      </div>
      <div
        style={{
          position: "absolute",
          right: 56,
          top: 118,
          width: 160,
          height: 34,
          borderRadius: 17,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "rgba(175,202,243,0.76)",
          border: "1px solid rgba(131,170,235,0.12)",
          background: "rgba(42,71,118,0.09)",
          fontSize: 14,
          fontWeight: 740,
          letterSpacing: 1,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#79dfff",
            boxShadow: "0 0 10px #79dfff",
          }}
        />
        LIVE INDEX
      </div>
    </div>
  );
};

const FolderHero: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 24, 78);
  const selected = phase(frame, 108, 132);
  const confirm = phase(frame, 444, 520, Easing.out(Easing.cubic));
  const fileLift = phase(frame, 470, 540, Easing.out(Easing.back(1.45)));
  const ringRotation = frame * 0.12;
  const settle = Math.sin(frame / 17) * (1 - confirm) * selected * 0.8;

  return (
    <div
      style={{
        position: "absolute",
        left: 650,
        top: 216,
        width: 660,
        height: 452,
        opacity: reveal,
        transform: `translateY(${mix(27, 0, reveal) + settle}px) scale(${mix(
          0.92,
          1,
          reveal,
        )})`,
        transformOrigin: "50% 65%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 67,
          top: 2,
          width: 526,
          height: 420,
          borderRadius: "50%",
          border: "1px solid rgba(123,143,255,0.12)",
          boxShadow: `0 0 ${35 + selected * 55}px rgba(91,84,255,${
            0.1 + selected * 0.12
          })`,
          transform: `rotate(${ringRotation}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -4,
            width: 9,
            height: 9,
            marginLeft: -4.5,
            borderRadius: "50%",
            background: "#8f8cff",
            boxShadow: "0 0 18px #8f8cff",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -3,
            width: 7,
            height: 7,
            marginLeft: -3.5,
            borderRadius: "50%",
            background: "#64dfff",
            boxShadow: "0 0 14px #64dfff",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 123,
          top: 52,
          width: 414,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,91,255,0.25), rgba(56,164,255,0.06) 48%, transparent 72%)",
          filter: "blur(25px)",
          opacity: 0.78 + confirm * 0.18,
        }}
      />
      <svg
        width="660"
        height="430"
        viewBox="0 0 660 430"
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="m36-folder-back" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8d72ff" />
            <stop offset="0.52" stopColor="#5a72ff" />
            <stop offset="1" stopColor="#2b9bea" />
          </linearGradient>
          <linearGradient id="m36-folder-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ae98ff" />
            <stop offset="0.45" stopColor="#6b70f2" />
            <stop offset="1" stopColor="#397fe3" />
          </linearGradient>
          <linearGradient id="m36-folder-edge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d3c9ff" stopOpacity="0.55" />
            <stop offset="0.32" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="1" stopColor="#263c9c" stopOpacity="0.36" />
          </linearGradient>
          <linearGradient id="m36-sheet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#edf8ff" />
            <stop offset="1" stopColor="#a9dfff" />
          </linearGradient>
          <linearGradient id="m36-chip" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c2b5ff" />
            <stop offset="1" stopColor="#6de6ff" />
          </linearGradient>
          <filter id="m36-folder-shadow" x="-40%" y="-40%" width="180%" height="190%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="m36-folder-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <ellipse
          cx="330"
          cy="376"
          rx={205 + selected * 12}
          ry={33 + selected * 3}
          fill="rgba(8,10,33,0.7)"
          filter="url(#m36-folder-shadow)"
        />
        <path
          d="M132 142C132 125 145 112 162 112H242L275 75H468C489 75 506 92 506 113V302H132V142Z"
          fill="url(#m36-folder-back)"
          stroke="rgba(201,198,255,0.42)"
          strokeWidth="2"
        />
        <path
          d="M144 137H497"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <g
          style={{
            transform: `translateY(${mix(36, 0, fileLift)}px)`,
            opacity: 0.18 + fileLift * 0.82,
          }}
        >
          <rect
            x="202"
            y="96"
            width="260"
            height="156"
            rx="19"
            fill="url(#m36-sheet)"
            opacity="0.94"
            transform="rotate(-4 332 174)"
          />
          <rect
            x="224"
            y="125"
            width="128"
            height="10"
            rx="5"
            fill="#7685c8"
            opacity="0.38"
            transform="rotate(-4 332 174)"
          />
          <rect
            x="224"
            y="149"
            width="178"
            height="8"
            rx="4"
            fill="#7685c8"
            opacity="0.24"
            transform="rotate(-4 332 174)"
          />
          <rect
            x="224"
            y="169"
            width="158"
            height="8"
            rx="4"
            fill="#7685c8"
            opacity="0.2"
            transform="rotate(-4 332 174)"
          />
          <circle
            cx="418"
            cy="204"
            r="19"
            fill="rgba(73,196,255,0.19)"
            stroke="#4fcdf4"
            strokeWidth="2"
            transform="rotate(-4 332 174)"
          />
          <path
            d="M410 204L416 210L427 198"
            fill="none"
            stroke="#35bfe8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            transform="rotate(-4 332 174)"
          />
        </g>
        <path
          d="M108 164C111 147 125 137 142 137H526C548 137 563 157 557 178L514 338C510 355 495 367 477 367H154C135 367 119 353 116 334L94 189C91 176 97 166 108 164Z"
          fill="url(#m36-folder-front)"
          stroke="rgba(217,216,255,0.5)"
          strokeWidth="2"
        />
        <path
          d="M108 164C111 147 125 137 142 137H526C548 137 563 157 557 178L552 197H101L94 189C91 176 97 166 108 164Z"
          fill="rgba(255,255,255,0.09)"
        />
        <path
          d="M117 203H549"
          fill="none"
          stroke="url(#m36-folder-edge)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M129 330C151 342 176 347 208 347H474C490 347 502 338 508 324"
          fill="none"
          stroke="rgba(20,36,112,0.25)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <rect
          x="273"
          y="224"
          width="116"
          height="91"
          rx="25"
          fill="rgba(17,30,91,0.3)"
          stroke="rgba(210,218,255,0.28)"
          strokeWidth="2"
        />
        <rect
          x="287"
          y="238"
          width="88"
          height="63"
          rx="17"
          fill="url(#m36-chip)"
          opacity="0.15"
        />
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((column) => (
            <circle
              key={`${row}-${column}`}
              cx={304 + column * 27}
              cy={250 + row * 26}
              r={row === 1 && column === 1 ? 5.8 : 3.5}
              fill={row === 1 && column === 1 ? "#e2ddff" : "#88e7ff"}
              opacity={0.68 + confirm * 0.3}
            />
          )),
        )}
        <path
          d="M304 250L331 276L358 250M304 302L331 276L358 302M304 276H358"
          fill="none"
          stroke="#a7dfff"
          strokeLinecap="round"
          strokeWidth="1.5"
          opacity={0.38 + confirm * 0.36}
        />
        <path
          d="M124 186C208 170 421 171 539 187"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <rect
          x="120"
          y="210"
          width="420"
          height="118"
          rx="34"
          fill="rgba(255,255,255,0.05)"
          opacity="0.5"
        />
        {selected > 0 && (
          <g opacity={selected * (1 - confirm * 0.5)}>
            <path
              d="M90 150V124H116M570 150V124H544M90 349V375H116M570 349V375H544"
              fill="none"
              stroke="#9b90ff"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </g>
        )}
        {confirm > 0 && (
          <g
            opacity={confirm}
            transform={`translate(${487 - confirm * 7} ${92 - confirm * 7})`}
          >
            <circle
              cx="0"
              cy="0"
              r={34 + confirm * 3}
              fill="rgba(22,72,80,0.94)"
              stroke="#70f1c7"
              strokeWidth="2.2"
            />
            <circle
              cx="0"
              cy="0"
              r={43 + confirm * 7}
              fill="none"
              stroke="#70f1c7"
              strokeWidth="1"
              opacity={1 - confirm}
            />
            <path
              d="M-14 0L-4 10L16 -12"
              fill="none"
              stroke="#81f7d1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
          </g>
        )}
      </svg>
      {confirm > 0 && (
        <>
          {[0, 1, 2].map((index) => {
            const local = clamp(confirm - index * 0.14);
            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: 330,
                  top: 230,
                  width: 270 + local * 210,
                  height: 190 + local * 160,
                  borderRadius: "50%",
                  border: "1px solid rgba(105,241,198,0.18)",
                  transform: "translate(-50%, -50%)",
                  opacity: (1 - local) * 0.55,
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

const RenameField: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const oldName = "Untitled_07";
  const newName = "AI_Training_Data";
  const active = phase(frame, 112, 142, Easing.out(Easing.cubic));
  const deletion = phase(frame, 155, 230, Easing.linear);
  const typing = phase(frame, 245, 390, Easing.linear);
  const confirmed = phase(frame, 444, 490, Easing.out(Easing.cubic));
  const selected = frame >= 126 && frame < 155;

  let visibleName = oldName;
  if (frame >= 155 && frame < 240) {
    const remaining = Math.max(
      0,
      oldName.length - Math.floor(deletion * (oldName.length + 1)),
    );
    visibleName = oldName.slice(0, remaining);
  } else if (frame >= 240 && frame < 444) {
    const count = Math.min(
      newName.length,
      Math.floor(typing * (newName.length + 1)),
    );
    visibleName = newName.slice(0, count);
  } else if (frame >= 444) {
    visibleName = newName;
  }

  const caretVisible =
    frame >= 126 &&
    frame < 444 &&
    (Math.floor((frame - 126) / 18) % 2 === 0 || frame < 390);
  const fieldWidth = mix(390, 720, active);
  const clickFlash = phase(frame, 438, 449, Easing.out(Easing.quad));

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 664,
        width: fieldWidth,
        height: 90,
        transform: "translateX(-50%)",
        borderRadius: mix(18, 24, active),
        background:
          active > 0.04
            ? `linear-gradient(145deg, rgba(22,35,70,${
                0.35 + active * 0.48
              }), rgba(9,20,45,${0.35 + active * 0.46}))`
            : "transparent",
        border: `1px solid rgba(${
          confirmed > 0 ? "104,240,198" : "157,140,255"
        },${active * 0.42 + confirmed * 0.32})`,
        boxShadow:
          active > 0.04
            ? `0 18px 58px rgba(0,0,0,${0.16 + active * 0.18}), 0 0 ${
                34 + confirmed * 20
              }px rgba(${confirmed > 0 ? "68,226,183" : "115,91,255"},${
                0.08 + active * 0.07
              }), inset 0 1px 0 rgba(255,255,255,0.055)`
            : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {active > 0.12 && (
        <div
          style={{
            position: "absolute",
            left: 22,
            width: 43,
            height: 43,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            background: "rgba(131,112,255,0.1)",
            border: "1px solid rgba(158,143,255,0.18)",
            opacity: active * (1 - confirmed * 0.25),
          }}
        >
          <SparkIcon size={22} />
        </div>
      )}
      <div
        style={{
          minWidth: 350,
          height: 55,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          padding: "0 15px",
          background: selected
            ? "linear-gradient(90deg, rgba(119,104,255,0.28), rgba(79,199,255,0.18))"
            : "transparent",
          color: confirmed > 0 ? "#ecfff9" : "#f5f6ff",
          fontSize: 32,
          fontWeight: 720,
          letterSpacing: 0.45,
          lineHeight: 1,
          whiteSpace: "nowrap",
          textShadow:
            active > 0.1 ? "0 2px 16px rgba(5,8,26,0.9)" : "0 2px 12px #020714",
        }}
      >
        <span>{visibleName}</span>
        {caretVisible && (
          <span
            style={{
              width: 2,
              height: 35,
              marginLeft: 3,
              borderRadius: 2,
              background: "#a89cff",
              boxShadow: "0 0 10px rgba(168,156,255,0.65)",
            }}
          />
        )}
      </div>
      {active > 0.12 && (
        <div
          style={{
            position: "absolute",
            right: 18,
            width: 54,
            height: 54,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background:
              confirmed > 0
                ? "linear-gradient(145deg, rgba(66,218,173,0.27), rgba(33,137,116,0.22))"
                : "linear-gradient(145deg, rgba(133,110,255,0.23), rgba(54,177,241,0.16))",
            border: `1px solid rgba(${
              confirmed > 0 ? "112,242,203" : "168,150,255"
            },${0.22 + active * 0.24})`,
            boxShadow:
              clickFlash > 0
                ? `0 0 ${22 + clickFlash * 18}px rgba(105,239,198,${
                    0.25 + clickFlash * 0.2
                  })`
                : "none",
            opacity: active,
          }}
        >
          <CheckIcon
            size={27}
            color={confirmed > 0 ? "#85f7d2" : "#c8beff"}
          />
        </div>
      )}
      {confirmed > 0 && (
        <div
          style={{
            position: "absolute",
            top: 103,
            left: "50%",
            transform: `translate(-50%, ${mix(8, 0, confirmed)}px)`,
            display: "flex",
            alignItems: "center",
            gap: 9,
            color: "#8bf5d3",
            fontSize: 18,
            fontWeight: 780,
            letterSpacing: 1.35,
            opacity: confirmed,
            whiteSpace: "nowrap",
          }}
        >
          <CheckIcon size={23} />
          DATA WORKSPACE ORGANIZED
        </div>
      )}
    </div>
  );
};

const StatusChips: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const chips = [
    {
      label: "DATASET STATUS",
      value: "AI READY",
      color: "#b6a5ff",
      icon: <SparkIcon size={28} color="#b6a5ff" />,
    },
    {
      label: "FILES INDEXED",
      value: "256 ASSETS",
      color: "#72ddff",
      icon: <CloudIcon size={30} color="#72ddff" />,
    },
    {
      label: "SECURITY",
      value: "ENCRYPTED",
      color: "#6ff4cc",
      icon: <LockIcon size={29} color="#6ff4cc" />,
    },
  ];

  return (
    <>
      {chips.map((chip, index) => {
        const reveal = phase(
          frame,
          505 + index * 16,
          558 + index * 16,
          Easing.out(Easing.back(1.35)),
        );
        const x = 446 + index * 358;
        return (
          <div
            key={chip.label}
            style={{
              position: "absolute",
              left: x,
              top: 826,
              width: 326,
              height: 92,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              opacity: reveal,
              transform: `translateY(${mix(19, 0, reveal)}px)`,
              background:
                "linear-gradient(145deg, rgba(20,36,70,0.84), rgba(9,20,45,0.86))",
              border: `1px solid ${chip.color}32`,
              boxShadow: `0 18px 44px rgba(0,0,0,0.2), 0 0 30px ${chip.color}0e, inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                marginLeft: 18,
                marginRight: 16,
                borderRadius: 17,
                display: "grid",
                placeItems: "center",
                background: `${chip.color}10`,
                border: `1px solid ${chip.color}28`,
              }}
            >
              {chip.icon}
            </div>
            <div>
              <div
                style={{
                  color: "rgba(174,199,237,0.72)",
                  fontSize: 14,
                  lineHeight: 1,
                  fontWeight: 760,
                  letterSpacing: 1.35,
                  marginBottom: 10,
                }}
              >
                {chip.label}
              </div>
              <div
                style={{
                  color: "#f1f5ff",
                  fontSize: 22,
                  lineHeight: 1,
                  fontWeight: 820,
                  letterSpacing: 0.55,
                }}
              >
                {chip.value}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

const Pointer: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const moveToName = phase(frame, 45, 118, Easing.inOut(Easing.cubic));
  const moveToCheck = phase(frame, 390, 440, Easing.inOut(Easing.cubic));
  const moveAway = phase(frame, 468, 550, Easing.inOut(Easing.cubic));

  let x = mix(1480, 1044, moveToName);
  let y = mix(820, 708, moveToName);

  if (frame >= 390) {
    x = mix(1044, 1280, moveToCheck);
    y = mix(708, 708, moveToCheck);
  }
  if (frame >= 468) {
    x = mix(1280, 1482, moveAway);
    y = mix(708, 830, moveAway);
  }

  const clickOne = phase(frame, 116, 126, Easing.out(Easing.quad));
  const clickOneFade = 1 - phase(frame, 126, 143, Easing.out(Easing.cubic));
  const clickTwo = phase(frame, 440, 449, Easing.out(Easing.quad));
  const clickTwoFade = 1 - phase(frame, 449, 468, Easing.out(Easing.cubic));
  const pointerScale =
    1 -
    (clickOne * clickOneFade + clickTwo * clickTwoFade) * 0.08;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 54,
        height: 62,
        transform: `scale(${pointerScale})`,
        transformOrigin: "5px 5px",
        filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.52))",
        zIndex: 20,
      }}
    >
      {[
        { value: clickOne * clickOneFade, color: "#a794ff" },
        { value: clickTwo * clickTwoFade, color: "#6ff4cc" },
      ].map((pulse, index) =>
        pulse.value > 0 ? (
          <div
            key={index}
            style={{
              position: "absolute",
              left: 1,
              top: 1,
              width: 25 + pulse.value * 48,
              height: 25 + pulse.value * 48,
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              border: `2px solid ${pulse.color}`,
              opacity: (1 - pulse.value) * 0.78,
              boxShadow: `0 0 18px ${pulse.color}50`,
            }}
          />
        ) : null,
      )}
      <svg width="42" height="52" viewBox="0 0 42 52" aria-hidden>
        <path
          d="M4.2 3.2L36.5 29.6L21.1 31.1L29.8 46L21.5 50.4L13.2 34.8L4.2 45.1V3.2Z"
          fill="#f7f9ff"
          stroke="#17203c"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
        <path
          d="M8.2 10.7L28.6 27.4L18.5 28.3L24.7 39.2"
          fill="none"
          stroke="rgba(166,179,218,0.7)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );
};

const AmbientProgress: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const confirmed = phase(frame, 444, 520, Easing.out(Easing.cubic));
  const progress = Math.round(confirmed * 100);

  return (
    <div
      style={{
        position: "absolute",
        left: 316,
        bottom: 35,
        width: 1288,
        height: 3,
        borderRadius: 2,
        overflow: "hidden",
        background: "rgba(114,149,224,0.08)",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          borderRadius: 2,
          background:
            "linear-gradient(90deg, #7768ff, #5fcfff 65%, #6ff4cc 100%)",
          boxShadow: "0 0 14px rgba(99,222,255,0.42)",
        }}
      />
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const intro = phase(frame, 0, 38, Easing.out(Easing.cubic));
  const outro =
    1 - phase(frame, 850, TOTAL_FRAMES - 1, Easing.in(Easing.cubic));
  const workspaceReveal = phase(frame, 8, 58, Easing.out(Easing.cubic));
  const scaleX = width / WIDTH;
  const scaleY = height / HEIGHT;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: "#01040b",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: WIDTH,
          height: HEIGHT,
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
          opacity: intro * outro,
        }}
      >
        <Background frame={frame} />
        <WorkspaceWindow frame={frame} reveal={workspaceReveal} />
        <FolderHero frame={frame} />
        <RenameField frame={frame} />
        <StatusChips frame={frame} />
        <AmbientProgress frame={frame} />
        <Pointer frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
