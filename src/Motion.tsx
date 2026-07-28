import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION = 660;
const FIRST_NOTIFICATION = 19;
const NOTIFICATION_CADENCE = 13;
const NOTIFICATION_COUNT = Math.ceil(
  (DURATION - FIRST_NOTIFICATION) / NOTIFICATION_CADENCE,
);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const easeOut = Easing.out(Easing.cubic);

type GlyphName =
  | "mail"
  | "play"
  | "chat"
  | "cart"
  | "phone"
  | "bell"
  | "calendar"
  | "heart"
  | "cloud"
  | "shield";

type Notice = {
  app: string;
  message: string;
  color: string;
  color2: string;
  glyph: GlyphName;
  badge?: string;
};

const notices: readonly Notice[] = [
  {
    app: "Inbox",
    message: "Project update is ready",
    color: "#2098F3",
    color2: "#67D6FF",
    glyph: "mail",
  },
  {
    app: "Stream",
    message: "New video uploaded",
    color: "#6A5CFF",
    color2: "#9C8CFF",
    glyph: "play",
    badge: "●",
  },
  {
    app: "Messages",
    message: "New message received",
    color: "#29C86D",
    color2: "#62F49D",
    glyph: "chat",
  },
  {
    app: "Market",
    message: "Your order is on the way",
    color: "#F27B2D",
    color2: "#FFB25C",
    glyph: "cart",
  },
  {
    app: "Connect",
    message: "5 unread conversations",
    color: "#8557EF",
    color2: "#BB84FF",
    glyph: "chat",
  },
  {
    app: "Calls",
    message: "2 missed calls",
    color: "#F0424B",
    color2: "#FF6E73",
    glyph: "phone",
  },
  {
    app: "Tasks",
    message: "Meeting starts in 5 min",
    color: "#F29B24",
    color2: "#FFC758",
    glyph: "bell",
  },
  {
    app: "Social",
    message: "Someone liked your post",
    color: "#247EF3",
    color2: "#58B0FF",
    glyph: "heart",
  },
  {
    app: "Calendar",
    message: "Design review at 10:00",
    color: "#12B9A4",
    color2: "#54F1D6",
    glyph: "calendar",
  },
  {
    app: "Cloud",
    message: "Files synced securely",
    color: "#4B70F5",
    color2: "#7CB9FF",
    glyph: "cloud",
  },
  {
    app: "Security",
    message: "New sign-in verified",
    color: "#12B989",
    color2: "#56F3BE",
    glyph: "shield",
  },
  {
    app: "Pulse",
    message: "Your weekly recap is ready",
    color: "#EC3977",
    color2: "#FF78A7",
    glyph: "heart",
  },
] as const;

const fract = (value: number) => value - Math.floor(value);

const hash = (value: number) =>
  fract(Math.sin(value * 127.1 + 311.7) * 43758.5453123);

const UiGlyph: React.FC<{name: GlyphName}> = ({name}) => {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden
      style={{display: "block"}}
    >
      {name === "mail" ? (
        <>
          <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="3" {...common} />
          <path d="m4.5 7.1 7.5 5.6 7.5-5.6" {...common} />
        </>
      ) : null}
      {name === "play" ? (
        <>
          <rect x="3.1" y="4.1" width="17.8" height="15.8" rx="4" {...common} />
          <path d="m10 8.7 5.4 3.3-5.4 3.3Z" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {name === "chat" ? (
        <path
          d="M5.4 5.2h13.2a2.7 2.7 0 0 1 2.7 2.7v6.7a2.7 2.7 0 0 1-2.7 2.7h-7.1l-4.8 3v-3H5.4a2.7 2.7 0 0 1-2.7-2.7V7.9a2.7 2.7 0 0 1 2.7-2.7Z"
          {...common}
        />
      ) : null}
      {name === "cart" ? (
        <>
          <path d="M3.2 4.8h2.3l2 9.2h9.8l2.1-6.6H6.1" {...common} />
          <circle cx="9" cy="18.4" r="1.35" fill="currentColor" />
          <circle cx="16.7" cy="18.4" r="1.35" fill="currentColor" />
        </>
      ) : null}
      {name === "phone" ? (
        <path
          d="M7.2 3.7 4.5 5.2c-.9.5-1.2 1.6-.9 2.6 2 6 6.7 10.8 12.8 12.7 1 .3 2.1-.1 2.6-1l1.4-2.8-4.6-2.3-1.4 2.1c-2.9-1.2-5.3-3.6-6.5-6.5L10 8.5Z"
          {...common}
        />
      ) : null}
      {name === "bell" ? (
        <>
          <path
            d="M5.1 16.5h13.8l-1.8-2.4V10a5.1 5.1 0 0 0-10.2 0v4.1Z"
            {...common}
          />
          <path d="M9.7 19a2.6 2.6 0 0 0 4.6 0" {...common} />
        </>
      ) : null}
      {name === "calendar" ? (
        <>
          <rect x="3.2" y="5" width="17.6" height="16" rx="3" {...common} />
          <path d="M7.5 3v4M16.5 3v4M3.5 9.3h17" {...common} />
          <path d="M7.2 13h3M13.8 13h3M7.2 16.7h3M13.8 16.7h3" {...common} />
        </>
      ) : null}
      {name === "heart" ? (
        <path
          d="M12 20.2S3.4 15.4 3.4 9.2A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8.6 2.4c0 6.2-8.6 11-8.6 11Z"
          {...common}
        />
      ) : null}
      {name === "cloud" ? (
        <path
          d="M7.1 18.2h10.4a4 4 0 0 0 .3-8 6.1 6.1 0 0 0-11.5 1.2 3.5 3.5 0 0 0 .8 6.8Z"
          {...common}
        />
      ) : null}
      {name === "shield" ? (
        <path
          d="M12 2.9c2.4 1.8 5.1 2.5 7.4 2.8v5.5c0 4.5-2.6 7.9-7.4 10-4.8-2.1-7.4-5.5-7.4-10V5.7c2.3-.3 5-1 7.4-2.8Z"
          {...common}
        />
      ) : null}
    </svg>
  );
};

const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const slow = frame / DURATION;
  const orbit = slow * 24;

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: "#030510"}}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 48%, rgba(93,70,255,0.19) 0%, rgba(29,45,109,0.14) 23%, rgba(7,11,28,0.66) 50%, #02040B 82%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.62,
          background:
            "radial-gradient(ellipse at 21% 49%, rgba(17,66,127,0.12), transparent 36%), radial-gradient(ellipse at 80% 36%, rgba(99,36,151,0.10), transparent 34%)",
          transform: `scale(${1.04 + Math.sin(slow * Math.PI) * 0.025})`,
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <linearGradient id="ring-stroke" x1="0" x2="1">
            <stop offset="0" stopColor="#4EC8FF" stopOpacity="0" />
            <stop offset="0.45" stopColor="#6570FF" stopOpacity="0.26" />
            <stop offset="0.72" stopColor="#B15CFF" stopOpacity="0.18" />
            <stop offset="1" stopColor="#B15CFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="floor-glow">
            <stop offset="0" stopColor="#6C5EFF" stopOpacity="0.28" />
            <stop offset="0.42" stopColor="#3C58B9" stopOpacity="0.12" />
            <stop offset="1" stopColor="#11162D" stopOpacity="0" />
          </radialGradient>
          <filter id="blur-24">
            <feGaussianBlur stdDeviation="24" />
          </filter>
        </defs>

        <g
          transform={`translate(960 520) rotate(${orbit})`}
          opacity="0.58"
        >
          <ellipse
            rx="560"
            ry="420"
            fill="none"
            stroke="url(#ring-stroke)"
            strokeWidth="2"
            strokeDasharray="410 210 95 350"
          />
          <ellipse
            rx="705"
            ry="520"
            fill="none"
            stroke="url(#ring-stroke)"
            strokeWidth="1.4"
            strokeDasharray="165 360 280 520"
            transform="rotate(-19)"
            opacity="0.55"
          />
          <ellipse
            rx="430"
            ry="322"
            fill="none"
            stroke="url(#ring-stroke)"
            strokeWidth="1.2"
            strokeDasharray="95 280 170 360"
            transform="rotate(23)"
            opacity="0.48"
          />
        </g>

        <ellipse
          cx="960"
          cy="1004"
          rx="460"
          ry="78"
          fill="url(#floor-glow)"
          filter="url(#blur-24)"
        />
      </svg>

      {Array.from({length: 44}).map((_, index) => {
        const baseX = hash(index + 3.7) * WIDTH;
        const baseY = hash(index + 29.2) * HEIGHT;
        const driftX = Math.sin(frame * 0.008 + index * 1.7) * (8 + hash(index) * 18);
        const driftY = Math.cos(frame * 0.006 + index * 0.9) * (7 + hash(index + 8) * 16);
        const radius = 1.2 + hash(index + 19) * 2.4;
        const nearCenter = Math.abs(baseX - WIDTH / 2) < 330;
        const opacity = (0.12 + hash(index + 52) * 0.28) * (nearCenter ? 0.45 : 1);
        const particleColor = index % 3 === 0 ? "#9E7BFF" : "#65C9FF";

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: baseX + driftX,
              top: baseY + driftY,
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              color: particleColor,
              background: particleColor,
              boxShadow: `0 0 ${8 + radius * 3}px currentColor`,
              opacity,
            }}
          />
        );
      })}

      {Array.from({length: 8}).map((_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const row = Math.floor(index / 2);
        const x = WIDTH / 2 + side * (390 + row * 76);
        const y = 255 + row * 156;
        const float = Math.sin(frame * 0.011 + index * 1.2) * 12;
        const rotate = side * (7 + row * 2);

        return (
          <div
            key={`ghost-${index}`}
            style={{
              position: "absolute",
              left: x - 78,
              top: y + float,
              width: 156,
              height: 54,
              borderRadius: 18,
              border: "1px solid rgba(126,145,255,0.16)",
              background:
                "linear-gradient(120deg, rgba(74,103,190,0.07), rgba(165,87,255,0.035))",
              boxShadow: "0 0 34px rgba(70,91,207,0.07)",
              opacity: 0.35 - row * 0.045,
              filter: "blur(0.4px)",
              transform: `rotate(${rotate}deg) scale(${0.96 + row * 0.03})`,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          opacity: 0.13,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(circle at 50% 50%, black 0%, transparent 65%)",
        }}
      />
    </AbsoluteFill>
  );
};

const NotificationCard: React.FC<{
  index: number;
  currentEvent: number;
  shiftProgress: number;
}> = ({index, currentEvent, shiftProgress}) => {
  const frame = useCurrentFrame();
  const notice = notices[index % notices.length];
  const start = FIRST_NOTIFICATION + index * NOTIFICATION_CADENCE;
  const age = frame - start;
  const entrance = interpolate(age, [0, 10], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  if (index > currentEvent || age < 0) {
    return null;
  }

  const rank =
    index === currentEvent
      ? 0
      : currentEvent - 1 - index + shiftProgress;
  const top = 72 + rank * 112;
  const enterY = interpolate(entrance, [0, 1], [-170, 0], clamp);
  const enterScale = interpolate(entrance, [0, 1], [0.985, 1], clamp);
  const upperFade = interpolate(top + enterY, [-12, 46], [0, 1], clamp);
  const pulse = interpolate(age, [0, 2, 7], [0, 1, 0], clamp);

  if (top > 970 || rank < -0.5) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 22,
        right: 22,
        top,
        height: 96,
        opacity: entrance * upperFade,
        transform: `translateY(${enterY}px) scale(${enterScale})`,
        transformOrigin: "50% 0%",
        borderRadius: 24,
        overflow: "hidden",
        background:
          "linear-gradient(104deg, rgba(21,28,57,0.91), rgba(12,16,39,0.83))",
        border: "1px solid rgba(219,230,255,0.13)",
        boxShadow: [
          "0 14px 28px rgba(0,0,0,0.30)",
          "inset 0 1px 0 rgba(255,255,255,0.10)",
          `0 0 ${18 + pulse * 20}px rgba(106,91,255,${0.08 + pulse * 0.10})`,
        ].join(", "),
        backdropFilter: "blur(22px) saturate(135%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.32,
          background:
            "linear-gradient(105deg, rgba(255,255,255,0.08), transparent 28%, transparent 75%, rgba(119,96,255,0.07))",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 12,
          top: 22,
          width: 52,
          height: 52,
          borderRadius: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          background: `linear-gradient(145deg, ${notice.color2}, ${notice.color})`,
          boxShadow: `0 7px 18px ${notice.color}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
        }}
      >
        <UiGlyph name={notice.glyph} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 21,
          right: 48,
          color: "#F6F8FF",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 720,
          letterSpacing: "-0.25px",
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {notice.app}
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 54,
          right: 24,
          color: "rgba(226,231,248,0.67)",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: 14.5,
          fontWeight: 480,
          letterSpacing: "-0.1px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {notice.message}
        {notice.badge ? (
          <span style={{color: "#FF496A", marginLeft: 7, fontSize: 12}}>
            {notice.badge}
          </span>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          right: 15,
          top: 21,
          color: "rgba(229,235,255,0.48)",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: 11.5,
          fontWeight: 560,
          letterSpacing: "0.15px",
        }}
      >
        now
      </div>
    </div>
  );
};

const LockScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const rawEvent = (frame - FIRST_NOTIFICATION) / NOTIFICATION_CADENCE;
  const currentEvent =
    rawEvent >= 0
      ? Math.min(NOTIFICATION_COUNT - 1, Math.floor(rawEvent))
      : -1;
  const eventStart =
    FIRST_NOTIFICATION + Math.max(0, currentEvent) * NOTIFICATION_CADENCE;
  const eventAge = currentEvent >= 0 ? frame - eventStart : 0;
  const shiftProgress =
    currentEvent >= 0
      ? interpolate(eventAge, [0, 10], [0, 1], {
          ...clamp,
          easing: easeOut,
        })
      : 0;
  const lightX = interpolate(frame, [0, DURATION - 1], [-170, 560]);
  const clockOpacity = interpolate(frame, [70, 95], [1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        inset: 13,
        overflow: "hidden",
        borderRadius: 62,
        background:
          "radial-gradient(circle at 72% 28%, rgba(137,86,255,0.72) 0%, rgba(89,61,207,0.38) 24%, transparent 49%), radial-gradient(circle at 25% 78%, rgba(37,112,206,0.55), transparent 48%), linear-gradient(155deg, #172358 0%, #27215F 46%, #0C173D 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(225,232,255,0.19), inset 0 -80px 160px rgba(3,7,25,0.28)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 820,
          left: lightX,
          top: -190,
          opacity: 0.22,
          transform: "rotate(20deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(142,211,255,0.22), transparent)",
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -80,
          right: -80,
          top: 182,
          height: 420,
          borderRadius: "50%",
          border: "1px solid rgba(178,166,255,0.10)",
          transform: `rotate(-14deg) scale(${1 + Math.sin(frame * 0.008) * 0.018})`,
          boxShadow:
            "0 0 85px rgba(113,78,255,0.11), inset 0 0 70px rgba(91,120,255,0.05)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 400,
          color: "rgba(245,247,255,0.83)",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          textAlign: "center",
          textShadow: "0 10px 36px rgba(16,18,53,0.55)",
          opacity: clockOpacity,
        }}
      >
        <div
          style={{
            fontSize: 130,
            fontWeight: 260,
            lineHeight: 0.94,
            letterSpacing: "-8px",
          }}
        >
          10:28
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 15,
            fontWeight: 610,
            letterSpacing: "2.6px",
            color: "rgba(239,242,255,0.62)",
          }}
        >
          MONDAY · JUN 9
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 0,
          height: 58,
          color: "#F7F8FF",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 680,
          letterSpacing: "-0.2px",
        }}
      >
        <div style={{position: "absolute", left: 11, top: 17}}>10:28</div>
        <div
          style={{
            position: "absolute",
            right: 11,
            top: 17,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{display: "flex", alignItems: "flex-end", gap: 2}}>
            {[4, 7, 10, 13].map((height) => (
              <span
                key={height}
                style={{
                  display: "block",
                  width: 2.4,
                  height,
                  borderRadius: 2,
                  background: "currentColor",
                }}
              />
            ))}
          </div>
          <div
            style={{
              width: 20,
              height: 10,
              border: "1.5px solid currentColor",
              borderRadius: 3,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 2,
                top: 2,
                width: 13,
                height: 4,
                borderRadius: 1.5,
                background: "currentColor",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -3.5,
                top: 2.4,
                width: 2,
                height: 4,
                borderRadius: 1,
                background: "currentColor",
                opacity: 0.75,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 12,
          width: 126,
          height: 34,
          marginLeft: -63,
          borderRadius: 20,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.97), rgba(4,6,13,0.99))",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 2px rgba(74,92,144,0.26)",
          zIndex: 30,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 11,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, #334F91, #0A1230 55%, #020308)",
            boxShadow: "0 0 5px rgba(81,115,221,0.45)",
          }}
        />
      </div>

      <div style={{position: "absolute", inset: 0, zIndex: 12}}>
        {Array.from({length: NOTIFICATION_COUNT}).map((_, index) => (
          <NotificationCard
            key={index}
            index={index}
            currentEvent={currentEvent}
            shiftProgress={shiftProgress}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 14,
          width: 150,
          height: 5,
          marginLeft: -75,
          borderRadius: 5,
          background: "rgba(245,248,255,0.72)",
          boxShadow: "0 0 10px rgba(255,255,255,0.16)",
          zIndex: 25,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 40,
          opacity: 0.35,
          background:
            "linear-gradient(112deg, rgba(255,255,255,0.11) 0%, transparent 17%, transparent 72%, rgba(151,183,255,0.08) 100%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

const Handset: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 12], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const revealScale = interpolate(reveal, [0, 1], [0.985, 1], clamp);
  const push = interpolate(frame, [0, DURATION - 1], [0.995, 1.012], clamp);
  const floatY = Math.sin(frame * 0.011) * 2.6;
  const breathe = 1 + Math.sin(frame * 0.006 + 0.8) * 0.0015;

  return (
    <div
      style={{
        position: "absolute",
        left: WIDTH / 2,
        top: HEIGHT / 2 + 2,
        width: 500,
        height: 986,
        opacity: reveal,
        filter: `blur(${(1 - reveal) * 1.8}px)`,
        transform: [
          "translate(-50%, -50%)",
          `translateY(${floatY}px)`,
          "perspective(1600px)",
          "rotateY(-1.4deg)",
          "rotateX(0.65deg)",
          `scale(${revealScale * push * breathe})`,
        ].join(" "),
        transformOrigin: "50% 55%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -8,
          right: -8,
          top: 28,
          bottom: -24,
          borderRadius: 84,
          background: "rgba(0,0,0,0.50)",
          filter: "blur(36px)",
          transform: "translateY(22px) scale(0.97)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: -9,
          top: 176,
          width: 7,
          height: 88,
          borderRadius: "5px 0 0 5px",
          background:
            "linear-gradient(180deg, #8190B7, #1C253F 20%, #060A16 72%, #47536F)",
          boxShadow: "-3px 0 8px rgba(95,122,181,0.22)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -9,
          top: 284,
          width: 7,
          height: 130,
          borderRadius: "5px 0 0 5px",
          background:
            "linear-gradient(180deg, #64779E, #10172A 24%, #060A14 75%, #3D4863)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -9,
          top: 232,
          width: 7,
          height: 152,
          borderRadius: "0 5px 5px 0",
          background:
            "linear-gradient(180deg, #8092BD, #151D34 22%, #050914 72%, #46526F)",
          boxShadow: "3px 0 9px rgba(83,111,177,0.18)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 78,
          padding: 0,
          background:
            "linear-gradient(118deg, #A7B5D5 0%, #465370 2.2%, #121827 5%, #050810 43%, #171E31 89%, #6F7E9E 97%, #C4CDE2 100%)",
          boxShadow: [
            "0 46px 100px rgba(0,0,0,0.57)",
            "0 0 78px rgba(83,66,232,0.18)",
            "inset 0 0 0 1px rgba(255,255,255,0.26)",
            "inset 0 0 0 4px rgba(3,5,12,0.85)",
          ].join(", "),
        }}
      >
        <LockScreen />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 3,
          borderRadius: 75,
          pointerEvents: "none",
          border: "1px solid rgba(226,236,255,0.13)",
          boxShadow:
            "inset 10px 0 18px rgba(255,255,255,0.025), inset -8px 0 17px rgba(127,151,216,0.06)",
        }}
      />
    </div>
  );
};

export const Motion: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#030510",
      }}
    >
      <Atmosphere />
      <Handset />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.13,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.36), transparent 22%, transparent 78%, rgba(0,0,0,0.34)), linear-gradient(180deg, rgba(1,2,8,0.24), transparent 24%, transparent 76%, rgba(0,0,0,0.28))",
        }}
      />
    </AbsoluteFill>
  );
};
