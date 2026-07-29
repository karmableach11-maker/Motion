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
  const value = Math.sin(seed * 91.317 + 17.131) * 43758.5453;
  return value - Math.floor(value);
};

const PANEL: React.CSSProperties = {
  border: "1px solid rgba(111,218,255,0.18)",
  background:
    "linear-gradient(145deg, rgba(10,29,45,0.94), rgba(4,15,27,0.9))",
  boxShadow:
    "0 28px 85px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.045)",
};

const STARS = Array.from({ length: 72 }, (_, index) => ({
  x: seeded(index + 1) * WIDTH,
  y: seeded(index + 101) * HEIGHT,
  size: 0.8 + seeded(index + 201) * 2.4,
  opacity: 0.1 + seeded(index + 301) * 0.34,
  phase: seeded(index + 401) * TAU,
}));

const STREAMS = Array.from({ length: 11 }, (_, index) => ({
  y: 95 + seeded(index + 501) * 885,
  length: 100 + seeded(index + 601) * 250,
  speed: 0.35 + seeded(index + 701) * 0.75,
  offset: seeded(index + 801) * 2300,
}));

const CheckMark: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#5ff2c2", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M5 12.6L9.3 16.9L19.2 7.1"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.6"
    />
  </svg>
);

const CrossMark: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#ff6d83", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M7 7L17 17M17 7L7 17"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="2.6"
    />
  </svg>
);

const ShieldIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
  readonly checked?: boolean;
}> = ({ color = "#6fe7ff", size = 34, checked = false }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
    <path
      d="M18 3.8L31 8.6V17.2C31 25.2 26 30.7 18 33.2C10 30.7 5 25.2 5 17.2V8.6L18 3.8Z"
      fill={`${color}15`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    {checked ? (
      <path
        d="M11.4 18.3L15.8 22.7L24.9 13.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.3"
      />
    ) : (
      <>
        <circle cx="18" cy="16.2" r="3.2" fill="none" stroke={color} strokeWidth="1.8" />
        <path d="M18 19.5V24" stroke={color} strokeLinecap="round" strokeWidth="2" />
      </>
    )}
  </svg>
);

const FingerprintIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#73e9ff", size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
    <path
      d="M7.4 18.4C7.4 11.7 12.9 6.2 19.7 6.2C26.4 6.2 31.8 11.5 31.9 18.1M11.2 21.4V18.5C11.2 13.7 15 9.9 19.7 9.9C24.4 9.9 28.1 13.6 28.1 18.3V22.9M15 24V18.7C15 16 17.1 13.8 19.8 13.8C22.5 13.8 24.5 15.9 24.5 18.6V25.4M19.8 18.2V23.5C19.8 29.1 17.2 33 14.7 35M28.1 26.3C27.5 30.5 25.5 33.5 23.6 35.3M10.8 25.7C10.4 29.1 9.2 31.5 7.8 33.3"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="1.9"
    />
  </svg>
);

const ChipIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#9a91ff", size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
    <rect x="8" y="8" width="20" height="20" rx="4" fill={`${color}15`} stroke={color} strokeWidth="1.8" />
    <rect x="13" y="13" width="10" height="10" rx="2" fill="none" stroke={color} strokeWidth="1.6" />
    <path
      d="M12 3.5V8M18 3.5V8M24 3.5V8M12 28V32.5M18 28V32.5M24 28V32.5M3.5 12H8M3.5 18H8M3.5 24H8M28 12H32.5M28 18H32.5M28 24H32.5"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="1.7"
    />
  </svg>
);

const LinkIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#60efc1", size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
    <path
      d="M15.2 21L12 24.2C9.7 26.5 6 26.5 3.7 24.2C1.4 21.9 1.4 18.2 3.7 15.9L9 10.6C11.3 8.3 15 8.3 17.3 10.6"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="2.2"
      transform="translate(5 0)"
    />
    <path
      d="M20.8 15L24 11.8C26.3 9.5 30 9.5 32.3 11.8C34.6 14.1 34.6 17.8 32.3 20.1L27 25.4C24.7 27.7 21 27.7 18.7 25.4"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="2.2"
      transform="translate(-5 0)"
    />
    <path d="M13.8 22.2L22.2 13.8" stroke={color} strokeLinecap="round" strokeWidth="2.2" />
  </svg>
);

const PolicyIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#ffbc6d", size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
    <path
      d="M9 4.5H23L29 10.5V31.5H9V4.5Z"
      fill={`${color}12`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path d="M23 4.5V10.5H29M13.5 16H24.5M13.5 21H24.5M13.5 26H21" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
  </svg>
);

const ResourceIcon: React.FC<{
  readonly type: "support" | "notes" | "pii" | "refund";
  readonly color: string;
}> = ({ type, color }) => (
  <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
    {type === "support" ? (
      <>
        <path d="M6 7H24V20H13L8 24V20H6V7Z" fill={`${color}12`} stroke={color} strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M10 11H20M10 15H18" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
      </>
    ) : null}
    {type === "notes" ? (
      <>
        <path d="M8 4.5H21.5L25 8V25.5H8V4.5Z" fill={`${color}12`} stroke={color} strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M12 11H21M12 15H21M12 19H18" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
      </>
    ) : null}
    {type === "pii" ? (
      <>
        <circle cx="15" cy="10.5" r="4" fill="none" stroke={color} strokeWidth="1.7" />
        <path d="M7.5 24C8.5 18.8 11.2 16.5 15 16.5C18.8 16.5 21.5 18.8 22.5 24" fill={`${color}12`} stroke={color} strokeLinecap="round" strokeWidth="1.7" />
      </>
    ) : null}
    {type === "refund" ? (
      <>
        <path d="M8 10H22V22H8V10Z" fill={`${color}12`} stroke={color} strokeWidth="1.7" />
        <path d="M5 7H19M5 7L8.5 3.8M5 7L8.5 10.2M25 25H11M25 25L21.5 21.8M25 25L21.5 28.2" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </>
    ) : null}
  </svg>
);

const Atmosphere: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 46% 42%, rgba(18,111,145,0.18), transparent 35%), radial-gradient(circle at 86% 22%, rgba(92,76,186,0.13), transparent 31%), linear-gradient(150deg, #020913 0%, #04111d 48%, #020810 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.17,
        backgroundImage:
          "linear-gradient(rgba(105,216,255,0.085) 1px, transparent 1px), linear-gradient(90deg, rgba(105,216,255,0.085) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        transform: "perspective(900px) rotateX(56deg) scale(1.6) translateY(145px)",
        transformOrigin: "center bottom",
      }}
    />
    {STARS.map((star, index) => {
      const pulse = 0.64 + 0.36 * Math.sin(frame * 0.018 + star.phase);
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            background: "#9eeeff",
            opacity: star.opacity * pulse,
            boxShadow: "0 0 8px rgba(102,228,255,0.65)",
          }}
        />
      );
    })}
    {STREAMS.map((stream, index) => {
      const x = ((frame * stream.speed + stream.offset) % 2350) - 300;
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: x,
            top: stream.y,
            width: stream.length,
            height: 1,
            opacity: 0.16,
            background:
              "linear-gradient(90deg, transparent, rgba(92,229,255,0.82), transparent)",
            filter: "blur(0.3px)",
          }}
        />
      );
    })}
    <div
      style={{
        position: "absolute",
        left: -180,
        top: 80,
        width: 720,
        height: 720,
        borderRadius: "50%",
        background: "rgba(27,163,205,0.08)",
        filter: "blur(130px)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 42%, rgba(0,3,8,0.68) 100%)",
      }}
    />
  </>
);

const Header: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const active = phase(frame, 58, 94);
  const lineWidth = phase(frame, 18, 72);
  return (
    <div
      style={{
        position: "absolute",
        left: 92,
        right: 92,
        top: 46,
        height: 78,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * -18}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 52,
            height: 52,
            display: "grid",
            placeItems: "center",
            borderRadius: 14,
            background:
              "linear-gradient(145deg, rgba(93,229,255,0.2), rgba(81,105,255,0.1))",
            border: "1px solid rgba(111,232,255,0.34)",
            boxShadow: "0 0 28px rgba(77,214,255,0.16)",
          }}
        >
          <ShieldIcon color="#72eaff" size={34} />
        </div>
        <div>
          <div
            style={{
              fontSize: 31,
              fontWeight: 700,
              letterSpacing: 0.2,
              color: "#edfaff",
              lineHeight: 1.1,
            }}
          >
            AI Agent Identity &amp; Authorization Audit
          </div>
          <div
            style={{
              marginTop: 8,
              color: "rgba(157,210,229,0.78)",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            Continuous zero-trust control plane
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            height: 42,
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "0 17px",
            borderRadius: 12,
            background: "rgba(80,240,188,0.075)",
            border: "1px solid rgba(87,239,193,0.24)",
            color: "#66eec2",
            fontSize: 15,
            fontWeight: 750,
            letterSpacing: 1.5,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#65f0bf",
              boxShadow: `0 0 ${8 + Math.sin(frame * 0.09) * 3}px #65f0bf`,
              opacity: active,
            }}
          />
          AUDIT LIVE
        </div>
        <div
          style={{
            color: "rgba(174,217,233,0.72)",
            fontSize: 15,
            fontWeight: 650,
            letterSpacing: 1,
          }}
        >
          SESSION&nbsp; A9-2047
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: -1,
          width: `${lineWidth * 100}%`,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(103,228,255,0.48), rgba(103,228,255,0.06), transparent)",
        }}
      />
    </div>
  );
};

const AgentCore: React.FC<{
  readonly frame: number;
  readonly verified: number;
}> = ({ frame, verified }) => {
  const spin = frame * 0.003;
  const pulse = 0.65 + Math.sin(frame * 0.055) * 0.2;
  return (
    <div
      style={{
        position: "relative",
        width: 170,
        height: 170,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 7,
          borderRadius: "50%",
          border: "1px solid rgba(102,226,255,0.22)",
          transform: `rotate(${spin}rad)`,
        }}
      >
        {[0, 1, 2].map((index) => {
          const angle = (index / 3) * TAU;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: index === 1 ? "#9d91ff" : "#6feaff",
                boxShadow: "0 0 14px currentColor",
                transform: `translate(-50%, -50%) rotate(${angle}rad) translateX(77px)`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 24,
          borderRadius: "50%",
          border: "1px dashed rgba(144,136,255,0.35)",
          transform: `rotate(${-spin * 1.8}rad)`,
        }}
      />
      <div
        style={{
          width: 105,
          height: 105,
          borderRadius: 29,
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at 32% 28%, rgba(116,234,255,0.3), rgba(34,77,105,0.62) 48%, rgba(8,23,38,0.95))",
          border: "1px solid rgba(126,234,255,0.45)",
          boxShadow: `0 0 ${34 + pulse * 14}px rgba(64,210,255,0.2), inset 0 0 25px rgba(103,224,255,0.08)`,
        }}
      >
        <ChipIcon color={verified > 0.5 ? "#5ff0bf" : "#78eaff"} size={56} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 2,
          bottom: 12,
          width: 36,
          height: 36,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: verified > 0.5 ? "#0b3e35" : "#0b2c40",
          border: `1px solid ${verified > 0.5 ? "rgba(87,240,188,0.55)" : "rgba(104,225,255,0.38)"}`,
          boxShadow:
            verified > 0.5
              ? "0 0 22px rgba(87,240,188,0.24)"
              : "0 0 18px rgba(88,216,255,0.18)",
          transform: `scale(${0.85 + verified * 0.15})`,
        }}
      >
        {verified > 0.5 ? (
          <CheckMark color="#67f1c2" size={23} />
        ) : (
          <FingerprintIcon color="#78eaff" size={23} />
        )}
      </div>
    </div>
  );
};

const DataRow: React.FC<{
  readonly label: string;
  readonly value: string;
  readonly accent?: string;
}> = ({ label, value, accent = "#d9f6ff" }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 38,
      borderBottom: "1px solid rgba(112,214,245,0.095)",
    }}
  >
    <span
      style={{
        fontSize: 15,
        color: "rgba(153,204,222,0.74)",
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 16,
        color: accent,
        fontWeight: 680,
        letterSpacing: 0.2,
      }}
    >
      {value}
    </span>
  </div>
);

const AgentIdentityCard: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const verified = phase(frame, 376, 420);
  const trust = phase(frame, 115, 402, Easing.inOut(Easing.cubic));
  const trustValue = Math.round(trust * 98);
  const signature = phase(frame, 300, 370);
  return (
    <div
      style={{
        position: "absolute",
        left: 92,
        top: 157,
        width: 500,
        height: 624,
        borderRadius: 25,
        overflow: "hidden",
        ...PANEL,
        opacity: reveal,
        transform: `translateX(${(1 - reveal) * -74}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(94,224,255,0.05), transparent 38%, rgba(121,105,255,0.04))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${phase(frame, 78, 155) * 100}%`,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #6ee8ff, rgba(113,105,255,0.4))",
          boxShadow: "0 0 16px rgba(96,225,255,0.45)",
        }}
      />
      <div style={{ position: "relative", padding: "26px 28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "#82e8ff",
              fontSize: 16,
              fontWeight: 750,
              letterSpacing: 1.9,
              textTransform: "uppercase",
            }}
          >
            Autonomous Agent Identity
          </span>
          <span
            style={{
              padding: "7px 11px",
              borderRadius: 8,
              color: verified > 0.5 ? "#65f0bf" : "#8cdef4",
              background:
                verified > 0.5
                  ? "rgba(76,236,183,0.09)"
                  : "rgba(85,199,233,0.08)",
              border: `1px solid ${
                verified > 0.5
                  ? "rgba(85,239,188,0.25)"
                  : "rgba(102,214,244,0.2)"
              }`,
              fontSize: 14,
              fontWeight: 750,
              letterSpacing: 1.1,
            }}
          >
            {verified > 0.5 ? "VERIFIED" : "VERIFYING"}
          </span>
        </div>

        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            gap: 23,
          }}
        >
          <AgentCore frame={frame} verified={verified} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#f0fbff",
                fontSize: 25,
                fontWeight: 720,
                lineHeight: 1.13,
                letterSpacing: -0.35,
              }}
            >
              support-resolution-agent
            </div>
            <div
              style={{
                marginTop: 9,
                color: "rgba(159,210,228,0.72)",
                fontSize: 15,
                fontWeight: 630,
                letterSpacing: 0.5,
              }}
            >
              AGENT ID&nbsp; AGT-7F3A-91C2
            </div>
            <div
              style={{
                marginTop: 19,
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              <span
                style={{
                  color: verified > 0.5 ? "#62efbd" : "#72e8ff",
                  fontSize: 42,
                  fontWeight: 760,
                  lineHeight: 0.9,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: "0 0 24px rgba(84,230,255,0.18)",
                }}
              >
                {trustValue}
              </span>
              <span
                style={{
                  color: "rgba(153,204,222,0.68)",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  paddingBottom: 3,
                }}
              >
                TRUST SCORE
              </span>
            </div>
            <div
              style={{
                marginTop: 12,
                height: 5,
                borderRadius: 4,
                overflow: "hidden",
                background: "rgba(103,221,244,0.1)",
              }}
            >
              <div
                style={{
                  width: `${trust * 100}%`,
                  height: "100%",
                  borderRadius: 4,
                  background:
                    verified > 0.5
                      ? "linear-gradient(90deg, #55dba8, #68f1c0)"
                      : "linear-gradient(90deg, #647cff, #64e6ff)",
                  boxShadow: "0 0 11px rgba(94,229,255,0.46)",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 21,
            padding: "10px 16px 4px",
            borderRadius: 15,
            background: "rgba(2,11,21,0.4)",
            border: "1px solid rgba(103,212,244,0.095)",
          }}
        >
          <DataRow label="Accountable owner" value="Customer Operations" />
          <DataRow label="Approved workload" value="prod-eu-07" />
          <DataRow label="Credential" value="DID:agent:7f3a" />
          <DataRow label="Runtime build" value="v3.8.12 / signed" accent="#73e8ff" />
        </div>

        <div
          style={{
            marginTop: 18,
            height: 70,
            borderRadius: 15,
            padding: "0 17px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            background:
              verified > 0.5
                ? "linear-gradient(90deg, rgba(68,235,180,0.09), rgba(37,126,112,0.04))"
                : "rgba(75,198,230,0.045)",
            border: `1px solid ${
              verified > 0.5
                ? "rgba(84,240,188,0.25)"
                : "rgba(93,215,243,0.14)"
            }`,
          }}
        >
          <FingerprintIcon
            color={verified > 0.5 ? "#61efbf" : "#79e7ff"}
            size={35}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: verified > 0.5 ? "#bcffe8" : "#d9f7ff",
                fontSize: 16,
                fontWeight: 720,
                letterSpacing: 0.4,
              }}
            >
              Cryptographic signature
            </div>
            <div
              style={{
                marginTop: 6,
                color: "rgba(151,205,222,0.7)",
                fontSize: 14,
                fontWeight: 620,
                letterSpacing: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {signature < 1
                ? `VALIDATING ${Math.round(signature * 100)
                    .toString()
                    .padStart(2, "0")}%`
                : "SIGNATURE VALID • KEY CURRENT"}
            </div>
          </div>
          {verified > 0.5 ? (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                display: "grid",
                placeItems: "center",
                background: "rgba(83,239,187,0.1)",
                border: "1px solid rgba(83,239,187,0.27)",
              }}
            >
              <CheckMark size={23} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

type ValidationSpec = {
  readonly title: string;
  readonly detail: string;
  readonly start: number;
  readonly end: number;
  readonly color: string;
  readonly icon: "fingerprint" | "chip" | "link" | "policy";
};

const VALIDATIONS: readonly ValidationSpec[] = [
  {
    title: "Identity proof",
    detail: "Credential chain is valid",
    start: 170,
    end: 230,
    color: "#6fe7ff",
    icon: "fingerprint",
  },
  {
    title: "Workload attestation",
    detail: "Runtime hash matches build",
    start: 232,
    end: 292,
    color: "#9b92ff",
    icon: "chip",
  },
  {
    title: "Human ownership",
    detail: "Accountable owner confirmed",
    start: 294,
    end: 354,
    color: "#60efc1",
    icon: "link",
  },
  {
    title: "Policy binding",
    detail: "Least-privilege rules attached",
    start: 356,
    end: 416,
    color: "#ffbd6d",
    icon: "policy",
  },
] as const;

const ValidationIcon: React.FC<{
  readonly type: ValidationSpec["icon"];
  readonly color: string;
}> = ({ type, color }) => {
  if (type === "fingerprint") {
    return <FingerprintIcon color={color} size={36} />;
  }
  if (type === "chip") {
    return <ChipIcon color={color} size={36} />;
  }
  if (type === "link") {
    return <LinkIcon color={color} size={36} />;
  }
  return <PolicyIcon color={color} size={36} />;
};

const ValidationStack: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const overall = phase(frame, 170, 416, Easing.inOut(Easing.cubic));
  return (
    <div
      style={{
        position: "absolute",
        left: 620,
        top: 157,
        width: 520,
        height: 624,
        borderRadius: 25,
        ...PANEL,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 38}px)`,
      }}
    >
      <div style={{ padding: "27px 27px 25px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                color: "#e8f9ff",
                fontSize: 22,
                fontWeight: 720,
                letterSpacing: -0.1,
              }}
            >
              Verification chain
            </div>
            <div
              style={{
                marginTop: 7,
                color: "rgba(150,203,222,0.68)",
                fontSize: 15,
                fontWeight: 620,
              }}
            >
              Four independent trust controls
            </div>
          </div>
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: `conic-gradient(#65e8ff ${overall * 360}deg, rgba(102,220,246,0.09) 0deg)`,
              boxShadow: "0 0 24px rgba(94,225,255,0.12)",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "#081724",
                color: overall >= 1 ? "#61efbd" : "#d7f8ff",
                fontSize: 17,
                fontWeight: 760,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(overall * 4)}/4
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 22,
            display: "flex",
            flexDirection: "column",
            gap: 13,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 29,
              top: 55,
              bottom: 55,
              width: 2,
              background: "rgba(91,213,241,0.09)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: `${overall * 100}%`,
                background:
                  "linear-gradient(180deg, #6fe8ff, #9a90ff 42%, #62efc0 72%, #ffbd6d)",
                boxShadow: "0 0 10px rgba(98,227,255,0.44)",
              }}
            />
          </div>

          {VALIDATIONS.map((item, index) => {
            const itemIn = phase(frame, item.start - 25, item.start + 10);
            const scan = phase(frame, item.start, item.end, Easing.inOut(Easing.cubic));
            const done = phase(frame, item.end - 8, item.end + 18);
            return (
              <div
                key={item.title}
                style={{
                  position: "relative",
                  height: 98,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "0 15px",
                  borderRadius: 16,
                  overflow: "hidden",
                  opacity: itemIn,
                  transform: `translateX(${(1 - itemIn) * 26}px)`,
                  background:
                    done > 0.5
                      ? `linear-gradient(90deg, ${item.color}12, rgba(6,20,32,0.5))`
                      : "rgba(5,18,30,0.54)",
                  border: `1px solid ${
                    done > 0.5 ? `${item.color}38` : "rgba(100,211,240,0.1)"
                  }`,
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    flex: "0 0 auto",
                    borderRadius: 15,
                    display: "grid",
                    placeItems: "center",
                    background: `${item.color}0f`,
                    border: `1px solid ${item.color}2b`,
                    boxShadow:
                      scan > 0 && done < 0.5
                        ? `0 0 22px ${item.color}22`
                        : "none",
                  }}
                >
                  <ValidationIcon type={item.icon} color={item.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#e7f9ff",
                      fontSize: 18,
                      fontWeight: 710,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      marginTop: 7,
                      color: "rgba(154,205,223,0.72)",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {done > 0.5 ? item.detail : "Checking control evidence…"}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      height: 3,
                      borderRadius: 3,
                      overflow: "hidden",
                      background: "rgba(120,216,238,0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: `${scan * 100}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                        boxShadow: `0 0 8px ${item.color}77`,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    flex: "0 0 auto",
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    color: done > 0.5 ? "#5ff0bf" : "#a8d8e7",
                    background:
                      done > 0.5
                        ? "rgba(84,239,187,0.08)"
                        : "rgba(102,218,244,0.04)",
                    border: `1px solid ${
                      done > 0.5
                        ? "rgba(84,239,187,0.23)"
                        : "rgba(102,218,244,0.1)"
                    }`,
                    fontSize: 14,
                    fontWeight: 750,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {done > 0.5 ? (
                    <CheckMark color="#62efbf" size={24} />
                  ) : (
                    `${Math.round(scan * 100)}`
                  )}
                </div>
                {scan > 0 && done < 0.5 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: `${scan * 100 - 16}%`,
                      top: 0,
                      width: 65,
                      height: "100%",
                      background: `linear-gradient(90deg, transparent, ${item.color}16, transparent)`,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    position: "absolute",
                    left: -15,
                    top: 42,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: done > 0.5 ? item.color : "rgba(96,214,240,0.25)",
                    boxShadow: done > 0.5 ? `0 0 12px ${item.color}` : "none",
                    opacity: itemIn,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

type AccessSpec = {
  readonly resource: string;
  readonly permission: string;
  readonly result: "ALLOW" | "DENY";
  readonly type: "support" | "notes" | "pii" | "refund";
  readonly start: number;
  readonly end: number;
};

const ACCESS_REQUESTS: readonly AccessSpec[] = [
  {
    resource: "Support cases",
    permission: "READ",
    result: "ALLOW",
    type: "support",
    start: 430,
    end: 485,
  },
  {
    resource: "Case notes",
    permission: "WRITE",
    result: "ALLOW",
    type: "notes",
    start: 492,
    end: 547,
  },
  {
    resource: "Customer PII",
    permission: "READ",
    result: "DENY",
    type: "pii",
    start: 554,
    end: 609,
  },
  {
    resource: "Refund workflow",
    permission: "EXECUTE",
    result: "ALLOW",
    type: "refund",
    start: 616,
    end: 671,
  },
] as const;

const AccessControl: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const token = phase(frame, 674, 724, Easing.out(Easing.back(1.15)));
  const policyPulse = phase(frame, 402, 430);
  return (
    <div
      style={{
        position: "absolute",
        left: 1168,
        top: 157,
        width: 660,
        height: 624,
        borderRadius: 25,
        ...PANEL,
        opacity: reveal,
        transform: `translateX(${(1 - reveal) * 62}px)`,
      }}
    >
      <div style={{ padding: "27px 27px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#eafaff",
                fontSize: 22,
                fontWeight: 720,
              }}
            >
              Authorization decision
            </div>
            <div
              style={{
                marginTop: 7,
                color: "rgba(153,205,222,0.7)",
                fontSize: 15,
                fontWeight: 620,
              }}
            >
              Requested scopes evaluated in real time
            </div>
          </div>
          <div
            style={{
              width: 128,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 12,
              color: token > 0.5 ? "#63f0c0" : "#7ce8ff",
              background:
                token > 0.5
                  ? "rgba(76,238,186,0.08)"
                  : "rgba(90,215,246,0.06)",
              border: `1px solid ${
                token > 0.5
                  ? "rgba(82,240,188,0.24)"
                  : "rgba(102,221,247,0.17)"
              }`,
              fontSize: 14,
              fontWeight: 760,
              letterSpacing: 1.1,
            }}
          >
            <ShieldIcon
              color={token > 0.5 ? "#60efbd" : "#74e8ff"}
              size={24}
              checked={token > 0.5}
            />
            {token > 0.5 ? "ENFORCED" : "POLICY"}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 22,
            height: 390,
            borderRadius: 18,
            padding: "15px",
            background: "rgba(2,11,20,0.42)",
            border: "1px solid rgba(103,211,240,0.09)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 36,
              top: 35,
              bottom: 35,
              width: 2,
              background: "rgba(100,215,242,0.08)",
            }}
          />
          {ACCESS_REQUESTS.map((request, index) => {
            const rowIn = phase(frame, request.start - 22, request.start + 8);
            const decision = phase(
              frame,
              request.start,
              request.end,
              Easing.inOut(Easing.cubic),
            );
            const done = phase(frame, request.end - 6, request.end + 18);
            const allowed = request.result === "ALLOW";
            const color = allowed ? "#5ff0bd" : "#ff7084";
            return (
              <div
                key={request.resource}
                style={{
                  position: "relative",
                  height: 82,
                  marginBottom: index === ACCESS_REQUESTS.length - 1 ? 0 : 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 15px",
                  borderRadius: 14,
                  overflow: "hidden",
                  opacity: rowIn,
                  transform: `translateX(${(1 - rowIn) * 30}px)`,
                  background:
                    done > 0.5
                      ? `linear-gradient(90deg, ${color}11, rgba(4,18,30,0.7))`
                      : "rgba(8,24,38,0.62)",
                  border: `1px solid ${
                    done > 0.5 ? `${color}35` : "rgba(105,216,244,0.1)"
                  }`,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    flex: "0 0 auto",
                    borderRadius: 13,
                    display: "grid",
                    placeItems: "center",
                    background: `${color}0d`,
                    border: `1px solid ${done > 0.5 ? `${color}2b` : "rgba(106,218,244,0.1)"}`,
                  }}
                >
                  <ResourceIcon
                    type={request.type}
                    color={done > 0.5 ? color : "#79dff5"}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#e5f8ff",
                      fontSize: 18,
                      fontWeight: 710,
                    }}
                  >
                    {request.resource}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      color: "rgba(152,204,222,0.72)",
                      fontSize: 14,
                      fontWeight: 660,
                      letterSpacing: 1,
                    }}
                  >
                    SCOPE
                    <span style={{ color: "#9adff0", fontWeight: 750 }}>
                      {request.permission}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: 90,
                    height: 38,
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    borderRadius: 10,
                    color: done > 0.5 ? color : "#a9d9e6",
                    background: done > 0.5 ? `${color}0f` : "rgba(104,213,240,0.04)",
                    border: `1px solid ${done > 0.5 ? `${color}32` : "rgba(105,216,243,0.1)"}`,
                    fontSize: 14,
                    fontWeight: 780,
                    letterSpacing: 1,
                  }}
                >
                  {done > 0.5 ? (
                    allowed ? (
                      <CheckMark color={color} size={18} />
                    ) : (
                      <CrossMark color={color} size={18} />
                    )
                  ) : null}
                  {done > 0.5 ? request.result : `${Math.round(decision * 100)}`}
                </div>
                {decision > 0 && done < 0.5 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: `${decision * 100}%`,
                      height: 2,
                      background: "linear-gradient(90deg, #717bff, #6fe9ff)",
                      boxShadow: "0 0 10px rgba(100,228,255,0.6)",
                    }}
                  />
                ) : null}
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 26 + phase(frame, 430, 671, Easing.inOut(Easing.cubic)) * 326,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#71eaff",
              boxShadow: "0 0 17px rgba(102,230,255,0.85)",
              opacity: policyPulse,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 18,
            height: 86,
            borderRadius: 17,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 18px",
            opacity: token,
            transform: `translateY(${(1 - token) * 18}px)`,
            background:
              "linear-gradient(100deg, rgba(66,237,180,0.13), rgba(48,116,105,0.045))",
            border: "1px solid rgba(85,240,188,0.28)",
            boxShadow: "0 0 28px rgba(70,232,181,0.07)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              flex: "0 0 auto",
              borderRadius: 15,
              display: "grid",
              placeItems: "center",
              background: "rgba(77,239,186,0.1)",
              border: "1px solid rgba(83,241,188,0.28)",
            }}
          >
            <ShieldIcon color="#61f0be" size={34} checked />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#c7ffea",
                fontSize: 18,
                fontWeight: 740,
              }}
            >
              Least-privilege token issued
            </div>
            <div
              style={{
                marginTop: 7,
                color: "rgba(158,222,201,0.78)",
                fontSize: 14,
                fontWeight: 650,
                letterSpacing: 0.7,
              }}
            >
              3 scopes granted • 1 sensitive scope blocked • Expires in 15 min
            </div>
          </div>
          <div
            style={{
              color: "#65f0bf",
              fontSize: 15,
              fontWeight: 780,
              letterSpacing: 1.3,
            }}
          >
            TOKEN&nbsp; 7C4A
          </div>
        </div>
      </div>
    </div>
  );
};

const LOGS = [
  {
    time: "12:42:07",
    event: "Cryptographic credential accepted",
    status: "VALID",
    color: "#68e9ff",
    start: 446,
  },
  {
    time: "12:42:09",
    event: "Approved runtime successfully attested",
    status: "MATCH",
    color: "#9d94ff",
    start: 510,
  },
  {
    time: "12:42:11",
    event: "Customer PII scope blocked by policy",
    status: "BLOCKED",
    color: "#ff7488",
    start: 575,
  },
  {
    time: "12:42:13",
    event: "Scoped authorization token issued",
    status: "SEALED",
    color: "#61efbd",
    start: 690,
  },
] as const;

const AuditTrail: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const seal = phase(frame, 708, 756, Easing.out(Easing.back(1.2)));
  return (
    <div
      style={{
        position: "absolute",
        left: 92,
        right: 92,
        top: 807,
        height: 202,
        borderRadius: 24,
        ...PANEL,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 34}px)`,
      }}
    >
      <div
        style={{
          height: 56,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(105,214,242,0.11)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              background: "rgba(98,225,255,0.07)",
              border: "1px solid rgba(103,224,251,0.17)",
            }}
          >
            <PolicyIcon color="#76e8ff" size={22} />
          </div>
          <span
            style={{
              color: "#e5f8ff",
              fontSize: 18,
              fontWeight: 720,
            }}
          >
            Immutable audit trail
          </span>
          <span
            style={{
              color: "rgba(151,203,221,0.66)",
              fontSize: 14,
              fontWeight: 650,
              letterSpacing: 1,
            }}
          >
            EVENT STREAM / 4 RECORDS
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            color: seal > 0.5 ? "#62efbd" : "rgba(157,207,223,0.7)",
            fontSize: 14,
            fontWeight: 750,
            letterSpacing: 1.2,
          }}
        >
          {seal > 0.5 ? <CheckMark color="#62efbd" size={19} /> : null}
          {seal > 0.5 ? "AUDIT SEALED" : "RECORDING"}
        </div>
      </div>

      <div
        style={{
          height: 145,
          padding: "17px 20px 18px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {LOGS.map((log) => {
          const itemIn = phase(frame, log.start, log.start + 32);
          return (
            <div
              key={log.event}
              style={{
                position: "relative",
                borderRadius: 15,
                padding: "15px 16px",
                overflow: "hidden",
                opacity: itemIn,
                transform: `translateY(${(1 - itemIn) * 15}px)`,
                background: `linear-gradient(110deg, ${log.color}0b, rgba(4,17,28,0.58))`,
                border: `1px solid ${log.color}23`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "rgba(159,209,225,0.7)",
                    fontSize: 14,
                    fontWeight: 650,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: 0.7,
                  }}
                >
                  {log.time}
                </span>
                <span
                  style={{
                    padding: "4px 7px",
                    borderRadius: 6,
                    color: log.color,
                    background: `${log.color}0e`,
                    fontSize: 12,
                    fontWeight: 780,
                    letterSpacing: 1,
                  }}
                >
                  {log.status}
                </span>
              </div>
              <div
                style={{
                  marginTop: 12,
                  maxWidth: 315,
                  color: "#dff5fb",
                  fontSize: 15,
                  fontWeight: 650,
                  lineHeight: 1.35,
                }}
              >
                {log.event}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: `${itemIn * 100}%`,
                  height: 2,
                  background: `linear-gradient(90deg, ${log.color}, transparent)`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SuccessPulse: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 712, 758, Easing.out(Easing.cubic));
  const ring = phase(frame, 724, 812, Easing.out(Easing.quad));
  const pulseOpacity = reveal * (1 - ring);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 852,
          top: 420,
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "2px solid rgba(92,241,189,0.52)",
          opacity: pulseOpacity * 0.18,
          transform: `scale(${0.45 + ring * 5.8})`,
          boxShadow: "0 0 35px rgba(87,240,187,0.18)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 697,
          top: 718,
          width: 365,
          height: 40,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 12}px)`,
          color: "#67f0c1",
          background: "rgba(72,236,182,0.09)",
          border: "1px solid rgba(84,240,189,0.25)",
          boxShadow: "0 0 28px rgba(66,231,180,0.08)",
          fontSize: 15,
          fontWeight: 770,
          letterSpacing: 1.1,
          pointerEvents: "none",
        }}
      >
        <CheckMark color="#65efbf" size={20} />
        AGENT IDENTITY VERIFIED
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame * (60 / fps);

  const intro = phase(f, 4, 42, Easing.out(Easing.cubic));
  const headerReveal = phase(f, 16, 58);
  const agentReveal = phase(f, 64, 126, Easing.out(Easing.cubic));
  const validationReveal = phase(f, 115, 166, Easing.out(Easing.cubic));
  const accessReveal = phase(f, 382, 428, Easing.out(Easing.cubic));
  const auditReveal = phase(f, 402, 454, Easing.out(Easing.cubic));
  const fadeOut = 1 - phase(
    f,
    852,
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
        background: "#01060d",
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
        <Atmosphere frame={f} />
        <Header frame={f} reveal={headerReveal} />
        <AgentIdentityCard frame={f} reveal={agentReveal} />
        <ValidationStack frame={f} reveal={validationReveal} />
        <AccessControl frame={f} reveal={accessReveal} />
        <AuditTrail frame={f} reveal={auditReveal} />
        <SuccessPulse frame={f} />
      </div>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.11 * masterOpacity,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.026) 0px, rgba(255,255,255,0.026) 1px, transparent 1px, transparent 4px)",
          mixBlendMode: "soft-light",
        }}
      />
    </AbsoluteFill>
  );
};
