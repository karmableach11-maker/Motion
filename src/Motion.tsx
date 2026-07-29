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
  const value = Math.sin(seed * 93.731 + 19.117) * 43758.5453;
  return value - Math.floor(value);
};

const PANEL: React.CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(9,25,42,0.96), rgba(4,13,25,0.94))",
  border: "1px solid rgba(105,218,255,0.17)",
  boxShadow:
    "0 28px 85px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.045)",
};

const STARS = Array.from({ length: 78 }, (_, index) => ({
  x: seeded(index + 1) * WIDTH,
  y: seeded(index + 101) * HEIGHT,
  size: 0.8 + seeded(index + 201) * 2.5,
  opacity: 0.1 + seeded(index + 301) * 0.32,
  phase: seeded(index + 401) * TAU,
}));

const STREAMS = Array.from({ length: 10 }, (_, index) => ({
  y: 80 + seeded(index + 501) * 890,
  length: 110 + seeded(index + 601) * 250,
  speed: 0.35 + seeded(index + 701) * 0.7,
  offset: seeded(index + 801) * 2300,
}));

const CheckMark: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#5ff0c2", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M5 12.7L9.3 17L19.3 7"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.6"
    />
  </svg>
);

const WarningMark: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#ffbd70", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M12 3.5L21 19.5H3L12 3.5Z"
      fill={`${color}15`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M12 9V14.2M12 17.4V17.6"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="2.1"
    />
  </svg>
);

const ShieldIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
  readonly checked?: boolean;
}> = ({ color = "#6fe8ff", size = 38, checked = false }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
    <path
      d="M20 4L34 9.1V18.4C34 27 28.6 33 20 35.8C11.4 33 6 27 6 18.4V9.1L20 4Z"
      fill={`${color}13`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    {checked ? (
      <path
        d="M12.8 20.1L17.2 24.5L27.2 14.6"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    ) : (
      <>
        <circle
          cx="20"
          cy="18.4"
          r="4.2"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
        <path
          d="M20 22.8V28"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="2"
        />
      </>
    )}
  </svg>
);

const ChainIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#73e8ff", size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
    <path
      d="M14.3 22.1L10.8 25.6C8.2 28.2 4 28.2 1.4 25.6C-1.2 23 -1.2 18.8 1.4 16.2L7.3 10.3C9.9 7.7 14.1 7.7 16.7 10.3"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="2.2"
      transform="translate(6 0)"
    />
    <path
      d="M21.7 13.9L25.2 10.4C27.8 7.8 32 7.8 34.6 10.4C37.2 13 37.2 17.2 34.6 19.8L28.7 25.7C26.1 28.3 21.9 28.3 19.3 25.7"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="2.2"
      transform="translate(-6 0)"
    />
    <path
      d="M13.5 22.5L22.5 13.5"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="2.2"
    />
  </svg>
);

const SparkIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#a79bff", size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
    <path
      d="M18 3.5C19.2 11.5 24.5 16.8 32.5 18C24.5 19.2 19.2 24.5 18 32.5C16.8 24.5 11.5 19.2 3.5 18C11.5 16.8 16.8 11.5 18 3.5Z"
      fill={`${color}18`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <circle cx="29" cy="7" r="2" fill={color} />
    <circle cx="7.5" cy="29" r="1.6" fill={color} opacity="0.8" />
  </svg>
);

const ImageIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#6de6ff", size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <rect
      x="4"
      y="5"
      width="24"
      height="22"
      rx="4"
      fill={`${color}12`}
      stroke={color}
      strokeWidth="1.8"
    />
    <circle cx="11" cy="12" r="2.2" fill={color} />
    <path
      d="M6.8 24L13.3 17.4L17 20.7L21 16.2L26.2 22.1"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const FilmIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#a89aff", size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <rect
      x="4"
      y="6"
      width="24"
      height="20"
      rx="4"
      fill={`${color}12`}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M9 6V26M23 6V26M4 11H9M4 21H9M23 11H28M23 21H28"
      stroke={color}
      strokeWidth="1.6"
    />
    <path
      d="M13.2 12L21 16L13.2 20V12Z"
      fill={`${color}28`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const DocumentIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#63efc2", size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <path
      d="M7 3.8H20L26 9.8V28.2H7V3.8Z"
      fill={`${color}12`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M20 3.8V9.8H26M11 14H22M11 18H22M11 22H19"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="1.7"
    />
  </svg>
);

const FingerprintIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#72e9ff", size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden>
    <path
      d="M7.5 17.7C7.5 11.4 12.6 6.3 19 6.3C25.3 6.3 30.4 11.3 30.5 17.5M11 21.1V17.8C11 13.4 14.6 9.8 19 9.8C23.4 9.8 27 13.4 27 17.8V22.3M14.5 24V18C14.5 15.5 16.5 13.5 19 13.5C21.5 13.5 23.5 15.5 23.5 18V24.2M19 17.7V23.1C19 28.4 16.7 32 14.4 34M27 25.2C26.4 29.1 24.6 32 22.8 34M10.8 25C10.4 28.2 9.4 30.8 7.9 32.7"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  </svg>
);

const MetadataIcon: React.FC<{
  readonly color?: string;
  readonly size?: number;
}> = ({ color = "#65efc1", size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
    <path
      d="M7 5H23L29 11V31H7V5Z"
      fill={`${color}12`}
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path d="M23 5V11H29" fill="none" stroke={color} strokeWidth="1.8" />
    <path
      d="M11.5 16H24.5M11.5 21H24.5M11.5 26H18.5"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  </svg>
);

const Atmosphere: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 48% 37%, rgba(17,116,151,0.2), transparent 36%), radial-gradient(circle at 84% 20%, rgba(93,72,190,0.13), transparent 31%), linear-gradient(150deg, #020914 0%, #04121f 50%, #020811 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.16,
        backgroundImage:
          "linear-gradient(rgba(102,214,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(102,214,246,0.08) 1px, transparent 1px)",
        backgroundSize: "62px 62px",
        transform:
          "perspective(920px) rotateX(57deg) scale(1.62) translateY(150px)",
        transformOrigin: "center bottom",
      }}
    />
    {STARS.map((star, index) => {
      const twinkle = 0.62 + 0.38 * Math.sin(frame * 0.018 + star.phase);
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
            background: "#9defff",
            opacity: star.opacity * twinkle,
            boxShadow: "0 0 8px rgba(105,229,255,0.58)",
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
            opacity: 0.15,
            background:
              "linear-gradient(90deg, transparent, rgba(95,229,255,0.82), transparent)",
          }}
        />
      );
    })}
    <div
      style={{
        position: "absolute",
        right: 70,
        top: 125,
        width: 560,
        height: 560,
        borderRadius: "50%",
        background: "rgba(96,77,218,0.07)",
        filter: "blur(120px)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 44%, rgba(0,3,8,0.7) 100%)",
      }}
    />
  </>
);

const Header: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const live = phase(frame, 52, 92);
  const evidence = Math.round(phase(frame, 160, 612, Easing.inOut(Easing.cubic)) * 24);
  return (
    <div
      style={{
        position: "absolute",
        left: 92,
        right: 92,
        top: 44,
        height: 82,
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
            width: 54,
            height: 54,
            borderRadius: 15,
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(145deg, rgba(92,229,255,0.19), rgba(106,88,255,0.1))",
            border: "1px solid rgba(111,230,255,0.34)",
            boxShadow: "0 0 30px rgba(73,212,255,0.17)",
          }}
        >
          <ShieldIcon color="#72eaff" size={37} />
        </div>
        <div>
          <div
            style={{
              color: "#eefbff",
              fontSize: 31,
              fontWeight: 740,
              lineHeight: 1.08,
              letterSpacing: -0.35,
            }}
          >
            AI Content Provenance &amp; Transparency Check
          </div>
          <div
            style={{
              marginTop: 8,
              color: "rgba(156,210,228,0.78)",
              fontSize: 15,
              fontWeight: 650,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Media authenticity and disclosure workflow
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            height: 43,
            padding: "0 16px",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#72e8ff",
            background: "rgba(74,202,239,0.07)",
            border: "1px solid rgba(100,221,251,0.18)",
            fontSize: 15,
            fontWeight: 720,
            letterSpacing: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <ChainIcon color="#76eaff" size={22} />
          EVIDENCE {evidence.toString().padStart(2, "0")}/24
        </div>
        <div
          style={{
            height: 43,
            padding: "0 17px",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#64efc1",
            background: "rgba(77,239,186,0.07)",
            border: "1px solid rgba(87,239,193,0.22)",
            fontSize: 15,
            fontWeight: 760,
            letterSpacing: 1.4,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#65efbf",
              opacity: live,
              boxShadow: `0 0 ${8 + Math.sin(frame * 0.09) * 3}px #65efbf`,
            }}
          />
          CHECK LIVE
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: -1,
          width: `${phase(frame, 18, 78) * 100}%`,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(103,228,255,0.48), rgba(103,228,255,0.06), transparent)",
        }}
      />
    </div>
  );
};

type MediaType = "image" | "video" | "document";

const MediaTypeIcon: React.FC<{
  readonly type: MediaType;
  readonly color: string;
  readonly size?: number;
}> = ({ type, color, size = 30 }) => {
  if (type === "image") {
    return <ImageIcon color={color} size={size} />;
  }
  if (type === "video") {
    return <FilmIcon color={color} size={size} />;
  }
  return <DocumentIcon color={color} size={size} />;
};

const MediaThumbnail: React.FC<{
  readonly type: MediaType;
  readonly color: string;
  readonly frame: number;
  readonly active?: boolean;
}> = ({ type, color, frame, active = false }) => {
  if (type === "image") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background:
            "linear-gradient(155deg, #213b62 0%, #244f71 48%, #d28762 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 14,
            top: 12,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#ffcc83",
            boxShadow: "0 0 24px rgba(255,198,112,0.45)",
          }}
        />
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 120 78"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden
        >
          <path
            d="M0 62L30 34L49 52L70 25L120 65V78H0Z"
            fill="rgba(7,24,39,0.84)"
          />
          <path
            d="M0 67L34 47L54 61L85 39L120 63V78H0Z"
            fill="rgba(27,71,77,0.72)"
          />
        </svg>
      </div>
    );
  }
  if (type === "video") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 62% 32%, rgba(124,99,255,0.55), transparent 24%), linear-gradient(145deg, #101b38 0%, #26355b 52%, #3c245a 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 15,
            right: 15,
            bottom: 15,
            height: 21,
            display: "flex",
            alignItems: "flex-end",
            gap: 3,
          }}
        >
          {Array.from({ length: 18 }, (_, index) => {
            const height = 5 + ((Math.sin(index * 1.6 + frame * 0.045) + 1) / 2) * 15;
            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  height,
                  borderRadius: 2,
                  background:
                    index < 11
                      ? "rgba(118,230,255,0.7)"
                      : "rgba(169,145,255,0.58)",
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "42%",
            width: 40,
            height: 40,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "rgba(6,16,31,0.66)",
            border: `1px solid ${color}88`,
            boxShadow: active ? `0 0 24px ${color}44` : "none",
          }}
        >
          <svg width="17" height="18" viewBox="0 0 17 18" aria-hidden>
            <path
              d="M3 2.5L14.5 9L3 15.5V2.5Z"
              fill={color}
              stroke={color}
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background:
          "linear-gradient(145deg, rgba(18,64,65,0.96), rgba(10,29,43,0.98))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "12px 16px",
          borderRadius: 5,
          background: "rgba(224,255,248,0.92)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.23)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            width: 40,
            height: 5,
            borderRadius: 4,
            background: "#42b99b",
          }}
        />
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: 10,
              top: 24 + index * 10,
              width: index === 3 ? 47 : 69,
              height: 3,
              borderRadius: 3,
              background: "rgba(34,78,84,0.28)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

type AssetSpec = {
  readonly title: string;
  readonly meta: string;
  readonly type: MediaType;
  readonly color: string;
  readonly start: number;
  readonly scanEnd: number;
};

const ASSETS: readonly AssetSpec[] = [
  {
    title: "Campaign key visual",
    meta: "IMAGE • 6240 × 4160",
    type: "image",
    color: "#6de6ff",
    start: 92,
    scanEnd: 230,
  },
  {
    title: "Product launch video",
    meta: "VIDEO • 00:06 • 4K",
    type: "video",
    color: "#a89aff",
    start: 132,
    scanEnd: 575,
  },
  {
    title: "Press release",
    meta: "DOCUMENT • 3 PAGES",
    type: "document",
    color: "#63efc2",
    start: 172,
    scanEnd: 285,
  },
] as const;

const AssetCard: React.FC<{
  readonly spec: AssetSpec;
  readonly frame: number;
  readonly index: number;
}> = ({ spec, frame, index }) => {
  const enter = phase(frame, spec.start, spec.start + 34);
  const selected = index === 1 ? phase(frame, 210, 252) : 0;
  const scanned = phase(frame, spec.scanEnd - 35, spec.scanEnd);
  const scan = phase(frame, spec.start + 18, spec.scanEnd, Easing.inOut(Easing.cubic));
  return (
    <div
      style={{
        position: "relative",
        height: 128,
        borderRadius: 17,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 13,
        opacity: enter,
        transform: `translateX(${(1 - enter) * -42}px)`,
        background:
          selected > 0.5
            ? "linear-gradient(100deg, rgba(91,83,210,0.15), rgba(40,138,175,0.09))"
            : "rgba(7,20,34,0.58)",
        border: `1px solid ${
          selected > 0.5
            ? `rgba(163,149,255,${0.25 + selected * 0.24})`
            : "rgba(108,211,240,0.11)"
        }`,
        boxShadow:
          selected > 0.5
            ? "0 0 28px rgba(106,93,235,0.1), inset 0 0 24px rgba(102,217,255,0.025)"
            : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 120,
          height: 78,
          borderRadius: 11,
          overflow: "hidden",
          flex: "0 0 auto",
          border: `1px solid ${spec.color}30`,
        }}
      >
        <MediaThumbnail
          type={spec.type}
          color={spec.color}
          frame={frame}
          active={selected > 0.5}
        />
        {scan > 0 && scan < 1 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${scan * 100}%`,
              height: 1,
              background: spec.color,
              boxShadow: `0 0 12px ${spec.color}`,
            }}
          />
        ) : null}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: "#eaf9ff",
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
          }}
        >
          {spec.title}
        </div>
        <div
          style={{
            marginTop: 8,
            color: "rgba(153,204,222,0.72)",
            fontSize: 14,
            fontWeight: 650,
            letterSpacing: 0.8,
          }}
        >
          {spec.meta}
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color:
              scanned > 0.5
                ? "#62efc0"
                : selected > 0.5
                  ? "#baaaff"
                  : "rgba(140,205,226,0.64)",
            fontSize: 14,
            fontWeight: 760,
            letterSpacing: 1,
          }}
        >
          <div
            style={{
              width: 21,
              height: 21,
              borderRadius: 7,
              display: "grid",
              placeItems: "center",
              background:
                scanned > 0.5
                  ? "rgba(79,238,184,0.09)"
                  : `${spec.color}10`,
              border: `1px solid ${
                scanned > 0.5 ? "rgba(89,239,191,0.25)" : `${spec.color}2c`
              }`,
            }}
          >
            {scanned > 0.5 ? (
              <CheckMark color="#65efc1" size={14} />
            ) : (
              <MediaTypeIcon type={spec.type} color={spec.color} size={13} />
            )}
          </div>
          {scanned > 0.5
            ? "MANIFEST FOUND"
            : selected > 0.5
              ? "FORENSIC SCAN"
              : "QUEUED"}
        </div>
      </div>

      {selected > 0.5 ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 14,
            bottom: 14,
            width: 3,
            borderRadius: 3,
            background: "#aa9bff",
            boxShadow: "0 0 14px rgba(166,149,255,0.72)",
            opacity: selected,
          }}
        />
      ) : null}
    </div>
  );
};

const MediaIntake: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => (
  <div
    style={{
      position: "absolute",
      left: 92,
      top: 154,
      width: 500,
      height: 620,
      borderRadius: 25,
      overflow: "hidden",
      ...PANEL,
      opacity: reveal,
      transform: `translateX(${(1 - reveal) * -62}px)`,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: `${phase(frame, 66, 138) * 100}%`,
        height: 2,
        background:
          "linear-gradient(90deg, transparent, #6ee8ff, rgba(153,129,255,0.42))",
        boxShadow: "0 0 16px rgba(96,225,255,0.42)",
      }}
    />
    <div style={{ padding: "26px 26px 24px" }}>
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
              color: "#edfaff",
              fontSize: 22,
              fontWeight: 730,
              letterSpacing: -0.1,
            }}
          >
            Media intake
          </div>
          <div
            style={{
              marginTop: 7,
              color: "rgba(150,203,222,0.7)",
              fontSize: 15,
              fontWeight: 620,
            }}
          >
            Assets awaiting provenance review
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            background: "rgba(92,220,251,0.07)",
            border: "1px solid rgba(103,222,250,0.16)",
          }}
        >
          <MetadataIcon color="#77eaff" size={28} />
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          display: "flex",
          flexDirection: "column",
          gap: 13,
        }}
      >
        {ASSETS.map((spec, index) => (
          <AssetCard
            key={spec.title}
            spec={spec}
            index={index}
            frame={frame}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 18,
          height: 50,
          borderRadius: 14,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(4,15,27,0.55)",
          border: "1px solid rgba(102,214,244,0.1)",
        }}
      >
        <span
          style={{
            color: "rgba(153,205,223,0.7)",
            fontSize: 14,
            fontWeight: 650,
          }}
        >
          Batch ID
        </span>
        <span
          style={{
            color: "#dff8ff",
            fontSize: 15,
            fontWeight: 710,
            letterSpacing: 0.8,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          PRV-2048-A9
        </span>
      </div>
    </div>
  </div>
);

type CheckSpec = {
  readonly title: string;
  readonly detail: string;
  readonly start: number;
  readonly end: number;
  readonly color: string;
  readonly icon: "fingerprint" | "metadata" | "chain" | "spark";
  readonly disclosure?: boolean;
};

const CHECKS: readonly CheckSpec[] = [
  {
    title: "Content Credentials",
    detail: "Signed manifest detected",
    start: 286,
    end: 352,
    color: "#70e8ff",
    icon: "fingerprint",
  },
  {
    title: "Creator signature",
    detail: "Publisher key is valid",
    start: 350,
    end: 416,
    color: "#65efc1",
    icon: "metadata",
  },
  {
    title: "Edit history",
    detail: "Three edits verified",
    start: 414,
    end: 482,
    color: "#9f94ff",
    icon: "chain",
  },
  {
    title: "AI modification",
    detail: "AI edit disclosed",
    start: 480,
    end: 552,
    color: "#ffbd70",
    icon: "spark",
    disclosure: true,
  },
] as const;

const CheckIcon: React.FC<{
  readonly type: CheckSpec["icon"];
  readonly color: string;
}> = ({ type, color }) => {
  if (type === "fingerprint") {
    return <FingerprintIcon color={color} size={31} />;
  }
  if (type === "metadata") {
    return <MetadataIcon color={color} size={31} />;
  }
  if (type === "chain") {
    return <ChainIcon color={color} size={31} />;
  }
  return <SparkIcon color={color} size={31} />;
};

const ForensicCheck: React.FC<{
  readonly spec: CheckSpec;
  readonly frame: number;
}> = ({ spec, frame }) => {
  const enter = phase(frame, spec.start - 22, spec.start + 6);
  const progress = phase(frame, spec.start, spec.end, Easing.inOut(Easing.cubic));
  const complete = progress >= 1;
  const color = spec.color;
  return (
    <div
      style={{
        position: "relative",
        height: 76,
        borderRadius: 15,
        padding: "0 15px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        overflow: "hidden",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 15}px)`,
        background: spec.disclosure
          ? "linear-gradient(90deg, rgba(255,185,102,0.075), rgba(255,185,102,0.025))"
          : "rgba(5,18,31,0.6)",
        border: `1px solid ${
          complete ? `${color}38` : "rgba(102,214,244,0.1)"
        }`,
      }}
    >
      <div
        style={{
          width: 43,
          height: 43,
          borderRadius: 13,
          flex: "0 0 auto",
          display: "grid",
          placeItems: "center",
          background: `${color}0f`,
          border: `1px solid ${color}24`,
        }}
      >
        <CheckIcon type={spec.icon} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: "#e9f9ff",
            fontSize: 16,
            fontWeight: 710,
            lineHeight: 1.05,
          }}
        >
          {spec.title}
        </div>
        <div
          style={{
            marginTop: 7,
            color: spec.disclosure
              ? "rgba(255,205,143,0.78)"
              : "rgba(151,204,222,0.72)",
            fontSize: 14,
            fontWeight: 620,
            whiteSpace: "nowrap",
          }}
        >
          {complete ? spec.detail : `Checking ${Math.round(progress * 100)}%`}
        </div>
      </div>
      <div
        style={{
          width: 31,
          height: 31,
          borderRadius: 10,
          flex: "0 0 auto",
          display: "grid",
          placeItems: "center",
          background: complete ? `${color}12` : "rgba(94,213,244,0.05)",
          border: `1px solid ${
            complete ? `${color}38` : "rgba(104,215,245,0.12)"
          }`,
        }}
      >
        {complete ? (
          spec.disclosure ? (
            <WarningMark color={color} size={20} />
          ) : (
            <CheckMark color={color} size={20} />
          )
        ) : (
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `2px solid ${color}35`,
              borderTopColor: color,
              transform: `rotate(${frame * 4}deg)`,
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: `${progress * 100}%`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color})`,
          boxShadow: `0 0 9px ${color}77`,
        }}
      />
    </div>
  );
};

const ScannerPreview: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 210, 252);
  const scan = phase(frame, 252, 548, Easing.inOut(Easing.cubic));
  const marker = phase(frame, 472, 520);
  const corner = 23;
  return (
    <div
      style={{
        position: "relative",
        height: 246,
        borderRadius: 18,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 68% 26%, rgba(132,100,255,0.58), transparent 25%), linear-gradient(145deg, #101d3c 0%, #27365c 52%, #3d265d 100%)",
        border: "1px solid rgba(146,133,255,0.26)",
        opacity: reveal,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.23,
          backgroundImage:
            "linear-gradient(rgba(118,221,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(118,221,255,0.08) 1px, transparent 1px)",
          backgroundSize: "31px 31px",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 38,
          top: 35,
          width: 210,
          height: 118,
          borderRadius: 58,
          transform: "rotate(-8deg)",
          background:
            "radial-gradient(ellipse at 38% 32%, rgba(113,234,255,0.75), rgba(72,95,181,0.5) 45%, rgba(33,27,82,0.6) 75%)",
          boxShadow:
            "0 18px 58px rgba(9,11,42,0.48), inset -18px -18px 34px rgba(32,16,74,0.42), inset 12px 10px 24px rgba(164,241,255,0.16)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 44,
          top: 37,
          width: 142,
          height: 142,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 30%, rgba(255,208,166,0.92), rgba(196,109,139,0.62) 45%, rgba(62,37,96,0.78) 75%)",
          boxShadow: "0 17px 55px rgba(24,11,52,0.42)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 35,
          height: 36,
          display: "flex",
          alignItems: "flex-end",
          gap: 5,
        }}
      >
        {Array.from({ length: 35 }, (_, index) => {
          const height =
            7 + ((Math.sin(index * 1.2 + frame * 0.045) + 1) / 2) * 27;
          return (
            <div
              key={index}
              style={{
                flex: 1,
                height,
                borderRadius: 3,
                background:
                  index < 21
                    ? "rgba(112,231,255,0.64)"
                    : "rgba(171,148,255,0.55)",
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${scan * 100}%`,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #78ebff 18%, #c1b0ff 82%, transparent)",
          boxShadow:
            "0 -12px 28px rgba(106,229,255,0.18), 0 0 15px rgba(106,229,255,0.72)",
        }}
      />

      {[
        {
          left: 15,
          top: 15,
          borderLeft: "2px solid rgba(122,235,255,0.72)",
          borderTop: "2px solid rgba(122,235,255,0.72)",
        },
        {
          right: 15,
          top: 15,
          borderRight: "2px solid rgba(122,235,255,0.72)",
          borderTop: "2px solid rgba(122,235,255,0.72)",
        },
        {
          left: 15,
          bottom: 15,
          borderLeft: "2px solid rgba(122,235,255,0.72)",
          borderBottom: "2px solid rgba(122,235,255,0.72)",
        },
        {
          right: 15,
          bottom: 15,
          borderRight: "2px solid rgba(122,235,255,0.72)",
          borderBottom: "2px solid rgba(122,235,255,0.72)",
        },
      ].map((style, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: corner,
            height: corner,
            ...style,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 16,
          top: 15,
          height: 31,
          borderRadius: 9,
          padding: "0 11px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(4,12,25,0.74)",
          border: "1px solid rgba(119,228,255,0.18)",
          color: "#dffaff",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.7,
        }}
      >
        <FilmIcon color="#b0a3ff" size={18} />
        FRAME 184 / 360
      </div>

      <div
        style={{
          position: "absolute",
          right: 17,
          bottom: 17,
          height: 35,
          borderRadius: 10,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(6,14,27,0.78)",
          border: `1px solid rgba(255,189,112,${0.14 + marker * 0.28})`,
          color: "#ffcc8d",
          fontSize: 13,
          fontWeight: 760,
          letterSpacing: 0.7,
          opacity: marker,
          transform: `translateY(${(1 - marker) * 10}px)`,
        }}
      >
        <SparkIcon color="#ffbd70" size={20} />
        AI EDIT REGION
      </div>
    </div>
  );
};

const ForensicPanel: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const overall = phase(frame, 252, 552, Easing.inOut(Easing.cubic));
  const statusComplete = overall >= 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 620,
        top: 154,
        width: 654,
        height: 620,
        borderRadius: 25,
        overflow: "hidden",
        ...PANEL,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 46}px)`,
      }}
    >
      <div style={{ padding: "25px 26px" }}>
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
                color: "#edfaff",
                fontSize: 22,
                fontWeight: 730,
              }}
            >
              Forensic analysis
            </div>
            <div
              style={{
                marginTop: 7,
                color: "rgba(150,203,222,0.7)",
                fontSize: 15,
                fontWeight: 620,
              }}
            >
              Product launch video • Selected asset
            </div>
          </div>
          <div
            style={{
              width: 76,
              height: 44,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              color: statusComplete ? "#64efc0" : "#8ae9ff",
              background: statusComplete
                ? "rgba(78,238,185,0.07)"
                : "rgba(93,217,247,0.07)",
              border: `1px solid ${
                statusComplete
                  ? "rgba(84,239,188,0.23)"
                  : "rgba(103,220,249,0.17)"
              }`,
              fontSize: 16,
              fontWeight: 760,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(overall * 100)}%
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <ScannerPreview frame={frame} />
        </div>

        <div
          style={{
            marginTop: 15,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {CHECKS.map((spec) => (
            <ForensicCheck key={spec.title} spec={spec} frame={frame} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ScoreRing: React.FC<{
  readonly frame: number;
  readonly progress: number;
  readonly complete: number;
}> = ({ frame, progress, complete }) => {
  const radius = 80;
  const circumference = TAU * radius;
  const capped = clamp(progress);
  const angle = -Math.PI / 2 + capped * TAU;
  const leaderX = 100 + Math.cos(angle) * radius;
  const leaderY = 100 + Math.sin(angle) * radius;
  const score = Math.round(capped * 96);
  const glow = 0.72 + Math.sin(frame * 0.05) * 0.12;
  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 200,
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ce8ff" />
            <stop offset="62%" stopColor="#9d91ff" />
            <stop offset="100%" stopColor="#61efbf" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(105,217,246,0.09)"
          strokeWidth="11"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - capped)}
          transform="rotate(-90 100 100)"
          style={{ filter: "drop-shadow(0 0 8px rgba(111,225,255,0.35))" }}
        />
        {capped > 0.015 && capped < 1 ? (
          <circle
            cx={leaderX}
            cy={leaderY}
            r="4.8"
            fill="#f3fdff"
            stroke="#7beaff"
            strokeWidth="2.3"
            opacity={glow}
            style={{ filter: "drop-shadow(0 0 7px #76e9ff)" }}
          />
        ) : null}
      </svg>
      <div
        style={{
          width: 146,
          height: 146,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          background:
            "radial-gradient(circle at 42% 34%, rgba(34,78,106,0.72), rgba(5,18,31,0.96) 70%)",
          border: "1px solid rgba(112,225,250,0.14)",
          boxShadow:
            "inset 0 0 24px rgba(99,225,255,0.06), 0 0 34px rgba(80,210,255,0.07)",
        }}
      >
        <div>
          <div
            style={{
              color: complete > 0.5 ? "#69efc2" : "#eefcff",
              fontSize: 50,
              fontWeight: 780,
              lineHeight: 0.95,
              letterSpacing: -1.7,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score}
          </div>
          <div
            style={{
              marginTop: 10,
              color: "rgba(159,210,228,0.76)",
              fontSize: 13,
              fontWeight: 740,
              letterSpacing: 1.5,
            }}
          >
            TRUST SCORE
          </div>
        </div>
      </div>
    </div>
  );
};

const VerdictMetric: React.FC<{
  readonly label: string;
  readonly value: string;
  readonly color: string;
  readonly active: number;
  readonly warning?: boolean;
}> = ({ label, value, color, active, warning = false }) => (
  <div
    style={{
      height: 56,
      borderRadius: 13,
      padding: "0 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      opacity: 0.42 + active * 0.58,
      background: warning
        ? "rgba(255,183,99,0.065)"
        : "rgba(5,17,30,0.56)",
      border: `1px solid ${active > 0.5 ? `${color}31` : "rgba(103,214,244,0.09)"}`,
    }}
  >
    <span
      style={{
        color: "rgba(158,208,225,0.76)",
        fontSize: 15,
        fontWeight: 650,
      }}
    >
      {label}
    </span>
    <span
      style={{
        color,
        fontSize: 15,
        fontWeight: 780,
        letterSpacing: 0.7,
      }}
    >
      {value}
    </span>
  </div>
);

const VerdictPanel: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const score = phase(frame, 252, 568, Easing.inOut(Easing.cubic));
  const complete = phase(frame, 562, 606);
  const seal = phase(frame, 652, 710);
  const label = phase(frame, 584, 632);
  return (
    <div
      style={{
        position: "absolute",
        left: 1302,
        top: 154,
        width: 526,
        height: 620,
        borderRadius: 25,
        overflow: "hidden",
        ...PANEL,
        opacity: reveal,
        transform: `translateX(${(1 - reveal) * 62}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${phase(frame, 88, 158) * 100}%`,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #9f93ff, rgba(97,239,191,0.55))",
          boxShadow: "0 0 16px rgba(151,130,255,0.45)",
        }}
      />
      <div style={{ padding: "25px 26px" }}>
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
                color: "#edfaff",
                fontSize: 22,
                fontWeight: 730,
              }}
            >
              Transparency verdict
            </div>
            <div
              style={{
                marginTop: 7,
                color: "rgba(150,203,222,0.7)",
                fontSize: 15,
                fontWeight: 620,
              }}
            >
              Authenticity and disclosure result
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              display: "grid",
              placeItems: "center",
              background: complete > 0.5
                ? "rgba(78,239,184,0.08)"
                : "rgba(94,219,250,0.07)",
              border: `1px solid ${
                complete > 0.5
                  ? "rgba(86,239,190,0.22)"
                  : "rgba(103,221,249,0.17)"
              }`,
            }}
          >
            <ShieldIcon
              color={complete > 0.5 ? "#65efc0" : "#78eaff"}
              size={30}
              checked={complete > 0.5}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ScoreRing frame={frame} progress={score} complete={complete} />
        </div>

        <div
          style={{
            marginTop: -2,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <VerdictMetric
            label="Content"
            value={complete > 0.5 ? "AUTHENTIC" : "ANALYZING"}
            color="#68efc1"
            active={complete}
          />
          <VerdictMetric
            label="Disclosure"
            value={label > 0.5 ? "ATTACHED" : "PENDING"}
            color="#ffbe72"
            active={label}
            warning
          />
        </div>

        <div
          style={{
            marginTop: 11,
            height: 76,
            borderRadius: 15,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 13,
            opacity: label,
            transform: `translateY(${(1 - label) * 12}px)`,
            background:
              "linear-gradient(90deg, rgba(255,185,105,0.09), rgba(99,80,40,0.035))",
            border: "1px solid rgba(255,190,111,0.25)",
          }}
        >
          <div
            style={{
              width: 43,
              height: 43,
              borderRadius: 13,
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
              background: "rgba(255,184,102,0.08)",
              border: "1px solid rgba(255,190,111,0.22)",
            }}
          >
            <SparkIcon color="#ffbd70" size={30} />
          </div>
          <div>
            <div
              style={{
                color: "#ffdda9",
                fontSize: 16,
                fontWeight: 760,
                letterSpacing: 0.5,
              }}
            >
              AI-ASSISTED MEDIA
            </div>
            <div
              style={{
                marginTop: 6,
                color: "rgba(255,210,153,0.76)",
                fontSize: 14,
                fontWeight: 620,
              }}
            >
              Generative background edit disclosed
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 11,
            height: 74,
            borderRadius: 16,
            padding: "0 17px",
            display: "flex",
            alignItems: "center",
            gap: 13,
            opacity: seal,
            transform: `translateY(${(1 - seal) * 12}px)`,
            background:
              "linear-gradient(90deg, rgba(71,238,182,0.12), rgba(44,145,126,0.04))",
            border: "1px solid rgba(84,240,188,0.28)",
            boxShadow:
              seal > 0.8 ? "0 0 28px rgba(72,230,178,0.09)" : "none",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: "rgba(77,239,185,0.1)",
              border: "1px solid rgba(89,239,191,0.25)",
            }}
          >
            <CheckMark color="#67f0c1" size={29} />
          </div>
          <div>
            <div
              style={{
                color: "#caffeb",
                fontSize: 18,
                fontWeight: 780,
                letterSpacing: 0.45,
              }}
            >
              PROVENANCE VERIFIED
            </div>
            <div
              style={{
                marginTop: 6,
                color: "rgba(158,229,207,0.75)",
                fontSize: 14,
                fontWeight: 630,
              }}
            >
              Manifest and disclosure are complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type ChainSpec = {
  readonly title: string;
  readonly detail: string;
  readonly meta: string;
  readonly start: number;
  readonly end: number;
  readonly color: string;
  readonly icon: "image" | "chain" | "spark" | "shield";
  readonly warning?: boolean;
};

const CHAIN: readonly ChainSpec[] = [
  {
    title: "CAPTURED",
    detail: "Original camera file",
    meta: "08:14:22 UTC",
    start: 238,
    end: 318,
    color: "#70e8ff",
    icon: "image",
  },
  {
    title: "EDITED",
    detail: "Color and crop",
    meta: "SIGNED APP",
    start: 318,
    end: 410,
    color: "#9f94ff",
    icon: "chain",
  },
  {
    title: "AI ASSISTED",
    detail: "Background extended",
    meta: "DISCLOSED",
    start: 410,
    end: 510,
    color: "#ffbd70",
    icon: "spark",
    warning: true,
  },
  {
    title: "PUBLISHED",
    detail: "Manifest attached",
    meta: "KEY VALID",
    start: 510,
    end: 612,
    color: "#64efc1",
    icon: "shield",
  },
] as const;

const ProvenanceNodeIcon: React.FC<{
  readonly type: ChainSpec["icon"];
  readonly color: string;
}> = ({ type, color }) => {
  if (type === "image") {
    return <ImageIcon color={color} size={27} />;
  }
  if (type === "chain") {
    return <ChainIcon color={color} size={27} />;
  }
  if (type === "spark") {
    return <SparkIcon color={color} size={27} />;
  }
  return <ShieldIcon color={color} size={29} checked />;
};

const ProvenanceChain: React.FC<{
  readonly frame: number;
  readonly reveal: number;
}> = ({ frame, reveal }) => {
  const overall = phase(frame, 238, 612, Easing.inOut(Easing.cubic));
  const seal = phase(frame, 626, 690);
  return (
    <div
      style={{
        position: "absolute",
        left: 92,
        right: 92,
        top: 802,
        height: 192,
        borderRadius: 24,
        overflow: "hidden",
        ...PANEL,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 52}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(100deg, rgba(69,211,250,0.035), transparent 38%, rgba(103,80,230,0.035))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 25,
          top: 19,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <ChainIcon color="#74e9ff" size={25} />
        <span
          style={{
            color: "#e8f9ff",
            fontSize: 17,
            fontWeight: 740,
            letterSpacing: 1.2,
          }}
        >
          PROVENANCE CHAIN
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 25,
          top: 17,
          height: 33,
          borderRadius: 10,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: seal > 0.5 ? "#62efc0" : "rgba(153,207,225,0.72)",
          background:
            seal > 0.5
              ? "rgba(75,238,182,0.07)"
              : "rgba(84,203,235,0.05)",
          border: `1px solid ${
            seal > 0.5
              ? "rgba(85,239,188,0.22)"
              : "rgba(103,214,244,0.11)"
          }`,
          fontSize: 14,
          fontWeight: 740,
          letterSpacing: 0.8,
        }}
      >
        {seal > 0.5 ? <CheckMark size={17} /> : <FingerprintIcon size={17} />}
        {seal > 0.5 ? "MANIFEST HASH SEALED" : "BUILDING EVIDENCE"}
      </div>

      <div
        style={{
          position: "absolute",
          left: 112,
          right: 112,
          top: 99,
          height: 2,
          background: "rgba(102,218,246,0.09)",
        }}
      >
        <div
          style={{
            width: `${overall * 100}%`,
            height: "100%",
            background:
              "linear-gradient(90deg, #6ee8ff, #9e92ff 42%, #ffbd70 69%, #62efc0)",
            boxShadow: "0 0 12px rgba(105,228,255,0.32)",
          }}
        />
        {overall > 0.02 && overall < 1 ? (
          <div
            style={{
              position: "absolute",
              left: `${overall * 100}%`,
              top: "50%",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#effdff",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 11px #78eaff",
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: 57,
          right: 57,
          top: 61,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 28,
        }}
      >
        {CHAIN.map((node) => {
          const progress = phase(
            frame,
            node.start,
            node.end,
            Easing.inOut(Easing.cubic),
          );
          const ready = progress >= 1;
          return (
            <div
              key={node.title}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 13,
                opacity: 0.42 + progress * 0.58,
                transform: `translateY(${(1 - progress) * 13}px)`,
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 22,
                  flex: "0 0 auto",
                  display: "grid",
                  placeItems: "center",
                  background: ready
                    ? `${node.color}14`
                    : "rgba(5,17,30,0.92)",
                  border: `2px solid ${
                    ready ? `${node.color}66` : "rgba(103,215,244,0.14)"
                  }`,
                  boxShadow: ready ? `0 0 24px ${node.color}16` : "none",
                }}
              >
                <ProvenanceNodeIcon type={node.icon} color={node.color} />
              </div>
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  minWidth: 0,
                  padding: "4px 8px 4px 0",
                  borderRadius: 7,
                  background: "rgba(7,21,37,0.96)",
                }}
              >
                <div
                  style={{
                    color: node.warning ? "#ffd394" : "#eefbff",
                    fontSize: 16,
                    fontWeight: 780,
                    letterSpacing: 0.9,
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.title}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    color: "rgba(159,208,225,0.74)",
                    fontSize: 14,
                    fontWeight: 640,
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.detail}
                </div>
                <div
                  style={{
                    marginTop: 7,
                    color: ready ? node.color : "rgba(140,196,216,0.55)",
                    fontSize: 13,
                    fontWeight: 750,
                    letterSpacing: 0.85,
                    whiteSpace: "nowrap",
                  }}
                >
                  {ready ? node.meta : `${Math.round(progress * 100)}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HeroPulse: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const reveal = phase(frame, 686, 742);
  const pulse = phase(frame, 696, 790);
  if (reveal <= 0) {
    return null;
  }
  return (
    <>
      {[0, 1, 2].map((index) => {
        const local = clamp(pulse - index * 0.17);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: 1565,
              top: 540,
              width: 150 + local * 190,
              height: 150 + local * 190,
              borderRadius: "50%",
              border: "1px solid rgba(91,239,188,0.2)",
              transform: "translate(-50%, -50%)",
              opacity: reveal * (1 - local) * 0.55,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const intro = phase(frame, 0, 34, Easing.out(Easing.cubic));
  const headerReveal = phase(frame, 18, 68);
  const leftReveal = phase(frame, 52, 102);
  const centerReveal = phase(frame, 74, 126);
  const rightReveal = phase(frame, 94, 148);
  const chainReveal = phase(frame, 116, 172);
  const outro = 1 - phase(frame, 850, TOTAL_FRAMES - 1, Easing.in(Easing.cubic));
  const scaleX = width / WIDTH;
  const scaleY = height / HEIGHT;

  return (
    <AbsoluteFill
      style={{
        background: "#01060d",
        overflow: "hidden",
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
        <Atmosphere frame={frame} />
        <Header frame={frame} reveal={headerReveal} />
        <MediaIntake frame={frame} reveal={leftReveal} />
        <ForensicPanel frame={frame} reveal={centerReveal} />
        <VerdictPanel frame={frame} reveal={rightReveal} />
        <ProvenanceChain frame={frame} reveal={chainReveal} />
        <HeroPulse frame={frame} />

        <div
          style={{
            position: "absolute",
            left: 92,
            bottom: 35,
            color: "rgba(126,188,210,0.5)",
            fontSize: 12,
            fontWeight: 650,
            letterSpacing: 1.2,
          }}
        >
          {fps} FPS • 1920 × 1080 • FORENSIC SESSION PRV-2048-A9
        </div>
        <div
          style={{
            position: "absolute",
            right: 92,
            bottom: 35,
            color: "rgba(126,188,210,0.5)",
            fontSize: 12,
            fontWeight: 650,
            letterSpacing: 1.1,
          }}
        >
          TRANSPARENCY CONTROL PLANE • ACTIVE
        </div>
      </div>
    </AbsoluteFill>
  );
};
